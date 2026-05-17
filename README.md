# 博主 AI 运营助理 Demo

面向 C 端个人 IP / 自媒体创作者的 Agent MVP。当前版本是「网页工作台 + Node 后端 API」：支持对标解析、用户想法输入、DeepSeek 共创生成，以及本地规则引擎兜底。

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:5173/
```

可以直接打开指定流程页：

```text
http://127.0.0.1:5173/?stage=profile
http://127.0.0.1:5173/?stage=input
http://127.0.0.1:5173/?stage=generate
http://127.0.0.1:5173/?stage=evaluate
http://127.0.0.1:5173/?stage=report
```

## DeepSeek

后端读取 `.env.local` 中的环境变量：

```text
DEEPSEEK_API_KEY=你的 Key
DEEPSEEK_MODEL=deepseek-chat
```

未配置 Key 时，前端会明确显示本地兜底生成，不会假装模型调用成功。

## 小红书链接解析

链接解析使用 `@lucasygu/redbook`。本地解析需要小红书登录 Cookie。最稳的方式是在 `.env.local` 增加：

```text
XHS_COOKIE_STRING=a1=VALUE; web_session=VALUE
```

Cookie 可从 Chrome DevTools > Application > Cookies > xiaohongshu.com 复制。没有 Cookie 时，产品会提示改用粘贴正文/OCR 文本入口。

## 构建与生产运行

```bash
npm run build
npm start
```

生产模式由 Node 服务同时提供 API 和 `dist/` 静态文件。

## 演示报告

流程截图位于：

```text
deliverables/screenshots/
```

PDF 报告位于：

```text
deliverables/creator-ip-agent-demo-report.pdf
```

重新生成 PDF：

```bash
npm run report
```

## 后续接入真实模型

当前版本的稳定兜底逻辑在 `src/lib/agentEngine.ts`。真实模型调用在 `server/index.mjs` 的 `/api/agent/run`。
