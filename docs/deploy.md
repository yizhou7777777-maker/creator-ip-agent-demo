# 发布说明

## 推荐方式：Render / Railway

当前产品已经不是纯静态网页，而是「Node 后端 API + 前端工作台」。推荐部署到 Render 或 Railway 这类可运行 Node 服务的平台。

Build Command：

```bash
npm run build
```

Start Command：

```bash
npm start
```

Environment Variables：

```text
DEEPSEEK_API_KEY=你的 Key
DEEPSEEK_MODEL=deepseek-chat
```

## Vercel / Netlify

Vercel / Netlify 更适合纯静态或 serverless 项目。当前 Express 服务可改造成 serverless，但首期为了稳定，推荐先用 Render / Railway。

## 面试现场兜底

- 首选公开部署 URL。
- 第二兜底：本地启动 `npm run dev`，打开 `http://127.0.0.1:5173/`。
- 第三兜底：如果小红书链接解析失败，使用粘贴正文/OCR 文本入口。
