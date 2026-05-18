import express from "express";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const isDev = process.argv.includes("--dev");
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || (process.env.RENDER ? "0.0.0.0" : "127.0.0.1");

loadEnv(".env");
loadEnv(".env.local");

const app = express();
app.use(express.json({ limit: "2mb" }));

app.use((req, _res, next) => {
  if (req.path.startsWith("/api/")) {
    console.log(`[api] ${req.method} ${req.path}`);
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mode: isDev ? "dev" : "production",
    deepseek: Boolean(process.env.DEEPSEEK_API_KEY)
  });
});

app.post("/api/parse", async (req, res) => {
  const { mode, url, title, content, ocrText } = req.body || {};

  if (mode === "professional") {
    res.json({
      ok: false,
      mode: "professional",
      message: "专业取数通道已预留，后续可接 Just One API / 千瓜 / 灰豚 / 新红等数据服务。"
    });
    return;
  }

  if (mode === "manual") {
    const mergedContent = [content, ocrText].filter(Boolean).join("\n\n").trim();
    res.json({
      ok: Boolean(title || mergedContent),
      mode: "manual",
      title: title || "用户粘贴内容",
      content: mergedContent,
      imageCue: "来自用户粘贴/OCR 文本",
      message: mergedContent ? "已使用粘贴/OCR 文本完成稳定解析。" : "请粘贴标题、正文或 OCR 文本。"
    });
    return;
  }

  if (mode === "xhs") {
    if (!url) {
      res.status(400).json({ ok: false, mode: "xhs", message: "请先输入小红书笔记链接。" });
      return;
    }

    try {
      const parsed = await parseXiaohongshu(url);
      res.status(parsed.ok ? 200 : 424).json(parsed);
    } catch (error) {
      res.status(424).json({
        ok: false,
        mode: "xhs",
        message: "小红书链接解析服务调用失败，请改用粘贴/OCR 文本继续。",
        raw: error instanceof Error ? error.message : String(error)
      });
    }
    return;
  }

  res.status(400).json({ ok: false, message: "未知解析模式。" });
});

app.post("/api/agent/run", async (req, res) => {
  const { profile, source, intent } = req.body || {};
  if (!process.env.DEEPSEEK_API_KEY) {
    res.status(503).json({
      ok: false,
      code: "missing_api_key",
      message: "未配置 DEEPSEEK_API_KEY，前端将使用本地规则引擎兜底。"
    });
    return;
  }

  try {
    const result = await runDeepSeek({ profile, source, intent });
    res.json({ ok: true, source: "deepseek", result });
  } catch (error) {
    res.status(502).json({
      ok: false,
      code: "deepseek_failed",
      message: error instanceof Error ? error.message : "DeepSeek 调用失败。"
    });
  }
});

if (isDev) {
  const { createServer } = await import("vite");
  const vite = await createServer({
    root,
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(root, "dist")));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(root, "dist", "index.html"));
  });
}

app.listen(port, host, () => {
  console.log(`Creator Agent running at http://${host}:${port}/`);
});

function loadEnv(fileName) {
  const file = path.join(root, fileName);
  if (!existsSync(file)) return;
  const lines = readFileSync(file, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function parseXiaohongshu(url) {
  const cli = path.join(root, "node_modules", "@lucasygu", "redbook", "dist", "cli.js");
  const command = existsSync(cli) ? process.execPath : process.platform === "win32" ? "npx.cmd" : "npx";
  const args = existsSync(cli) ? [cli, "read", url, "--json"] : ["redbook", "read", url, "--json"];
  if (process.env.XHS_COOKIE_STRING) {
    args.push("--cookie-string", process.env.XHS_COOKIE_STRING);
  }

  const result = await runCommand(command, args, 45000);
  if (result.code !== 0) {
    return {
      ok: false,
      mode: "xhs",
      message:
        "小红书链接解析失败。公网环境或未登录 Cookie 时这是正常现象，请改用粘贴正文/OCR 文本继续。",
      raw: result.stderr || result.stdout
    };
  }

  const json = extractJson(result.stdout);
  const title = json?.title || json?.note?.title || json?.data?.title || "小红书笔记";
  const content =
    json?.desc ||
    json?.content ||
    json?.note?.desc ||
    json?.note?.content ||
    json?.data?.desc ||
    json?.data?.content ||
    result.stdout.slice(0, 3000);

  return {
    ok: true,
    mode: "xhs",
    title,
    content,
    imageCue: "来自小红书链接解析",
    raw: json || result.stdout,
    message: "已通过小红书链接解析到笔记内容。"
  };
}

function runCommand(command, args, timeoutMs) {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let child;
    try {
      child = spawn(command, args, {
        cwd: root,
        windowsHide: true,
        shell: false
      });
    } catch (error) {
      resolve({ code: 1, stdout, stderr: error instanceof Error ? error.message : String(error) });
      return;
    }
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      child.kill("SIGTERM");
      resolve({ code: 124, stdout, stderr: `${stderr}\ncommand timeout` });
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code: 1, stdout, stderr: error.message });
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function runDeepSeek({ profile, source, intent }) {
  const prompt = buildPrompt({ profile, source, intent });
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "你是面向五类上升期博主的个人 IP 自媒体共创 Agent。你必须基于用户输入和对标内容协助创作，不要凭空替用户决定全部内容。输出必须是可直接渲染的合法 JSON，不要 Markdown，不要代码块。"
        },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek HTTP ${response.status}: ${text.slice(0, 300)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek 没有返回内容。");
  return JSON.parse(content);
}

function buildPrompt({ profile, source, intent }) {
  return `
请基于下面信息，生成一个可被网页工作台渲染的 JSON。

要求：
- 必须同时利用「对标爆文」和「用户自己的想法」。
- 不要只复刻对标内容，要把对标结构转译成用户自己的内容。
- 五赛道通用，但必须贴合当前赛道。
- 避免绝对化、功效化、收益承诺。
- generated.note 必须是一篇可直接发布的完整正文，至少 650 个中文字符，包含 6-8 个短段落；如果是小红书，要有短段落、清单感、互动结尾，不能只写摘要。
- generated.script 必须是 5-7 个分镜，每个分镜包含 scene、shot、line，line 要像真人口播。
- generated.titles 必须给 4 个标题，覆盖避坑型、结果型、体验型、商单友好型。
- breakdown.structure 必须包含「爆文结构」和「用户想法如何转译」。
- evaluation.risks 不要虚构用户没有写过的违规词；如果没有命中具体词，就用「潜在风险」作为 term。

输出 JSON schema：
{
  "breakdown": {
    "hook": "string",
    "formula": "string",
    "structure": [{"name":"string","detail":"string"}],
    "keywords": ["string"],
    "coverLogic": "string",
    "interactionCue": "string",
    "reusableTemplate": "string"
  },
  "generated": {
    "titles": ["string"],
    "note": "string",
    "script": [{"scene":"string","shot":"string","line":"string"}],
    "coverIdeas": [{"style":"string","text":"string","direction":"string"}],
    "platformVariants": {
      "小红书":"string",
      "抖音":"string",
      "视频号":"string",
      "朋友圈":"string"
    }
  },
  "evaluation": {
    "heatScore": 0,
    "commercialScore": 0,
    "assistantVerdict": "string",
    "risks": [{"term":"string","reason":"string","suggestion":"string"}],
    "improvements": ["string"],
    "publishWindow": "string",
    "successMetric": "string"
  },
  "log": {
    "agent": "creator-ip-ops-assistant",
    "mode": "deepseek",
    "next_action": "string"
  }
}

博主档案：
${JSON.stringify(profile, null, 2)}

对标爆文：
${JSON.stringify(source, null, 2)}

用户自己的创作想法：
${JSON.stringify(intent, null, 2)}
`;
}
