import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outputDir = path.join(root, "deliverables");
const screenshotDir = path.join(outputDir, "screenshots");
const htmlPath = path.join(outputDir, "creator-ip-agent-demo-report.html");
const pdfPath = path.join(outputDir, "creator-ip-agent-demo-report.pdf");

if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
if (!existsSync(screenshotDir)) mkdirSync(screenshotDir, { recursive: true });

const pages = [
  {
    stage: "profile",
    title: "1. 博主档案",
    file: "01-profile.png",
    purpose: "确定平台、五大赛道、账号调性、粉丝阶段和变现目标，让 Agent 的输出不再是通用文案。",
    settings: ["主发布平台：决定小红书/抖音/视频号/朋友圈的表达节奏。", "内容赛道：覆盖美妆护肤、母婴亲子、家居家装、时尚穿搭、个人IP专家五类核心用户。", "账号调性与品牌 brief：约束口吻、商业承接和合规边界。"]
  },
  {
    stage: "parse",
    title: "2. 对标解析",
    file: "02-parse.png",
    purpose: "把对标爆文转成可复用结构。当前稳定支持粘贴正文/OCR，专业取数和链接解析作为数据 API 接入后的增强能力。",
    settings: ["专业取数：预留企业数据平台入口，后续可接 Just One API、千瓜、新红、灰豚等服务。", "链接解析：预留小红书/抖音/视频号链接读取入口，接入 Cookie 或数据平台后可自动解析。", "粘贴/OCR解析：当前主通道，用户复制标题、正文、口播稿或截图 OCR 文本即可继续完整流程。"]
  },
  {
    stage: "intent",
    title: "3. 用户想法",
    file: "03-intent.png",
    purpose: "让用户输入自己的基础思路，Agent 负责协助平台化、结构化和商业化，而不是替用户凭空创作。",
    settings: ["今天想讲的事情：提供真实内容起点。", "想表达的观点：决定内容立场和核心判断。", "产品/服务、希望效果、注意点和反向约束：控制商单承接、合规风险和去 AI 味。"]
  },
  {
    stage: "generate",
    title: "4. 共创产出",
    file: "04-generate.png",
    purpose: "结合爆文结构和用户想法，生成标题、正文、短视频分镜和封面方案。",
    settings: ["爆文拆解：展示可复用公式和关键词布局。", "标题 A/B：覆盖避坑型、结果型、体验型、商单友好型。", "正文、分镜、封面：分别服务图文、短视频和发布素材准备。"]
  },
  {
    stage: "evaluate",
    title: "5. 发布评估",
    file: "05-evaluate.png",
    purpose: "在发布前给出流量潜力、商单友好度、合规风险和下一步修改建议。",
    settings: ["流量潜力：判断标题、结构和平台适配度。", "商单友好度：判断品牌 brief 是否自然承接。", "风险预警和三点建议：帮助用户发布前规避绝对化、功效化和硬广感。"]
  },
  {
    stage: "log",
    title: "6. 数据日志",
    file: "06-log.png",
    purpose: "记录输入来源、生成来源、评分和下一步动作，体现 Agent 的数据闭环和后续迭代依据。",
    settings: ["输入来源：区分链接、粘贴/OCR和专业取数。", "生成来源：区分 DeepSeek API 和本地兜底。", "成功指标：用于后续内容复盘和产品迭代。"]
  }
];

const css = `
  * { box-sizing: border-box; }
  @page { size: A4 landscape; margin: 0; }
  html, body { width: 297mm; margin: 0; padding: 0; }
  body { font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif; color: #172526; background: #f3f6f3; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 297mm; height: 210mm; overflow: hidden; padding: 15mm 16mm; page-break-after: always; background: #f7faf8; }
  .cover { display: flex; flex-direction: column; justify-content: center; background: linear-gradient(135deg, #e8f3ef, #fff7ef); }
  .cover h1 { font-size: 40px; margin: 0 0 14px; color: #075e59; }
  .cover p { max-width: 210mm; font-size: 17px; line-height: 1.6; color: #334040; }
  .tag { display: inline-block; width: fit-content; padding: 8px 14px; border-radius: 999px; background: #dff0ea; color: #075e59; font-weight: 700; }
  h2 { margin: 0 0 7px; font-size: 25px; color: #102324; }
  .desc { margin: 0 0 11px; color: #506061; font-size: 13.5px; line-height: 1.45; }
  .content { display: grid; grid-template-columns: 175mm 1fr; gap: 10mm; align-items: start; }
  img { width: 175mm; border: 1px solid #d7e2dd; border-radius: 8px; box-shadow: 0 8px 24px rgba(29, 44, 42, 0.1); }
  .notes { display: grid; gap: 8mm; min-width: 0; }
  .box { padding: 5mm; border: 1px solid #d7e2dd; border-radius: 8px; background: #fff; overflow-wrap: anywhere; }
  .box strong { display: block; margin-bottom: 5px; color: #075e59; font-size: 14.5px; }
  .box p, .box li { font-size: 12.5px; line-height: 1.5; color: #2e3d3d; }
  .box p { margin: 0; }
  ul { margin: 0; padding-left: 16px; }
  li + li { margin-top: 5px; }
`;

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>博主 AI 运营助理演示报告</title>
  <style>${css}</style>
</head>
<body>
  <section class="page cover">
    <span class="tag">C 端 Agent MVP</span>
    <h1>博主 AI 运营助理</h1>
    <p>一个面向五类上升期博主的个人 IP 自媒体创作工作台：用爆文结构加工用户自己的想法，完成对标解析、共创生成、发布评估和数据闭环。</p>
    <p>当前版本支持 DeepSeek 共创生成；数据解析首期以粘贴/OCR为稳定主通道，专业取数和链接解析作为后续 API 接入能力预留。</p>
  </section>
  ${pages
    .map((page) => {
      const imagePath = path.join(screenshotDir, page.file).replaceAll("\\", "/");
      return `<section class="page">
        <h2>${escapeHtml(page.title)}</h2>
        <p class="desc">${escapeHtml(page.purpose)}</p>
        <div class="content">
          <img src="file:///${imagePath}" alt="${escapeHtml(page.title)}截图" />
          <div class="notes">
            <div class="box">
              <strong>页面作用</strong>
              <p>${escapeHtml(page.purpose)}</p>
            </div>
            <div class="box">
              <strong>设置功能区说明</strong>
              <ul>${page.settings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </div>
          </div>
        </div>
      </section>`;
    })
    .join("")}
</body>
</html>`;

writeFileSync(htmlPath, html, "utf-8");

const chrome = findChrome();
if (!chrome) {
  console.log(htmlPath);
  console.log("Chrome not found; HTML report generated only.");
  process.exit(0);
}

const result = spawnSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--no-pdf-header-footer",
    "--print-to-pdf-no-header",
    `--print-to-pdf=${pdfPath}`,
    htmlPath
  ],
  { stdio: "inherit" }
);

if (result.status !== 0) {
  throw new Error("Chrome failed to print report PDF.");
}

console.log(pdfPath);

function findChrome() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ];
  return candidates.find((file) => existsSync(file));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
