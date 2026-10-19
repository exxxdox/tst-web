# TST Website

TST / Rory 的个人站，用于展示吉他演奏和 Web 工具。项目是 Vue 3 + Vite 纯前端单页应用。

## 开发

```sh
pnpm install
pnpm dev
pnpm test
pnpm check
```

`pnpm build` 生成 `dist/`，`pnpm preview` 本地预览生产产物。

## 路由与部署

站点使用 hash 路由，可直接部署到 Vercel 等静态托管服务，无需 SPA fallback。生产环境接入 Vercel Analytics 和 Speed Insights。

首页是单页：首屏之后依次是 `#performance` 视频区块与 `#links` 外链区块。旧地址 `/performance`、`/links` 会重定向到对应锚点。

Links 区块通过 Microlink 获取外链截图；Performance 区块仅在用户点击后加载 Bilibili 播放器。
