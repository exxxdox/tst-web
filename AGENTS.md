# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## 项目定位

TST / Rory 的个人站：吉他演奏展示 + Web 小工具聚合。纯前端单页应用，无后端、无数据层、无 API 调用（除第三方组件外）。

## 常用命令

```sh
pnpm install
pnpm dev          # vite dev server
pnpm build        # vite build → dist/
pnpm preview      # 预览 dist
pnpm test         # Node 内置测试；覆盖外链、chunk 恢复和焦点循环
pnpm check        # test + build + Prettier 检查
pnpm format       # 格式化 src/、README 与根配置
```

- **没有 lint、typecheck、第三方测试框架或 CI**（`.github/` 已删除）。测试使用 Node 内置 `node:test`，别为了扩覆盖率引入测试栈。
- 包管理器锁定 `pnpm@11.8.0`，Node `^20.19.0 || >=22.12.0`。

## 架构

入口链：`index.html` → `src/main.js`（挂载 `#app`，全局注册 `AppLink`）→ `App.vue`（外壳）→ `router`。

`App.vue` 是唯一外壳，包含 `TheNavigation`、`RouterView`、始终渲染的 `TheFooter`、跳过链接，以及 Vercel 的 `Analytics` / `SpeedInsights`。

**路由**：`createWebHashHistory` → URL 形如 `/#/`。三页已合并为单页：Home 承载首屏、Performance、Links 三个区块；旧地址 `/performance`、`/links` 重定向到 `#performance` / `#links` 锚点，`scrollBehavior` 做平滑滚动。`main.js` 监听 `vite:preloadError`，新版部署使旧 chunk 失效时只刷新一次。hash 模式是为静态托管选的，改成 history 模式前必须先确认托管方 SPA fallback。

**`AppLink.vue` 是唯一的链接原语**，已在 `main.js` 全局注册，页面里直接用、不用 import：

- `to` 是合法的绝对 HTTP(S) URL → 渲染成 `<a target="_blank" rel="noopener noreferrer">`
- 其他 → 渲染成 `RouterLink`，透传全部 `RouterLink.props`

URL 规则由 `src/utils/externalUrl.js` 统一处理。`ExternalLinkCard` 遇到无效 URL 时必须降级成不可点击卡片，不能让页面渲染失败。

所以站内跳转一律写 `:to="{ name: 'Home', hash: '#performance' }"`，外链写字符串 URL。页面里裸写 `<a>` 会丢掉 hover / `router-link-active` 样式。

## 目录职责

- `src/views/` — 路由目标 `Home.vue` **以及 `TheNavigation.vue`**。注意导航虽在 `views/` 下，但不在路由表里，由 `App.vue` 直接引入。
- `src/components/` — 复用组件：`AppLink`、`BlueGiant`、`ExternalLinkCard`、`SignalStrip`、`TheFooter`，以及首页区块 `PerformanceSection`、`LinksSection`。
- `src/assets/` — 全局样式 + 自托管字体。
- `src/utils/` — 无浏览器状态的共享工具及 Node 内置测试。

## 样式系统

`src/assets/base.css` 定义全部设计令牌（配色、字体栈、`--container-max`/`--stage-max`、`--nav-height`/`--footer-height`、`--fs-*` 字号阶梯）。`main.css` 只放全局元素规则（`a` / `h1..h3` / `p` / `.container` / `.kicker`）和 `@font-face`。

改配色、间距、字号 → 改 `base.css` 变量，别在组件里硬编码。组件内仍散落着硬编码色值，属于迁移中间态。

- **仅暗色主题**：`base.css` 不保留 light 变量或分支，不要"顺手恢复"。
- 视觉语汇是"录音棚设备"：`SignalStrip`（input → 电平条 → output）所有区块都在用，新增区域保持这套语言。
- 首屏以下区块由 `src/utils/scrollReveal.js` 在首次进入视口时加 `.is-revealed`；动画只作用于内容层，避免改变锚点落点。
- 主断点是 **760px**（导航折叠、Home 重排、各页 padding 都用它），另有 540 / 680 / 900 / 380px 的局部微调。
- 字体 Bitcount 自托管 woff2 拉丁子集，体积低于 Vite 内联阈值 → 会被打进 CSS。别把它挪到 `public/`，会重新引入字体请求瀑布。

## 性能约束

这部分是刻意优化过的（见 `6736038`），改动时别退化：

- Home 全页的黑白表现主义画作由 `BlueGiant.vue` 固定在视口背后（滚过首屏后降低透明度），把 `src/assets/frames/*.webp` 按文件名顺序采样成 Canvas 粒子云并做缓动（每张约 1s，切帧时粒子按空间分位数就近流向新目标；`import.meta.glob` 自动收集，目录内只保留 640 宽 WebP），没有 LCP 图片；其他图片仍一律 WebP，放 `public/`。
- 大媒体按需加载：`PerformanceSection.vue` 先渲染 poster 按钮，点击后才挂载 bilibili iframe（带 `sandbox`）。
- 源码里解释性能决策的注释（体积对比数字）要跟着代码一起改，别删了留下过时数字。
- `ExternalLinkCard` 的预览图走第三方 `api.microlink.io`，靠 `@error` 回退到 TST 占位块——改这块要保留失败路径。

## 约定

- 组件文件 PascalCase；新增组件用 `<script setup>`。`AppLink.vue` 和 `TheNavigation.vue` 是遗留 Options API，不需要顺手重写。
- Prettier：`semi: false`、`singleQuote: true`、`printWidth: 100`。
- 路径别名 `@` → `src`，在 `vite.config.js` 和 `jsconfig.json` **各写了一份**，改一处要同步另一处。
- 部署在 Vercel；仓库内没有 `vercel.json`，也没有任何 CI 配置。
- `plans/` 被 gitignore，是本地草稿。里面的 UI 计划已过时（描述的配色与现在的 `base.css` 不一致），别当现状参考。
- 本仓库已被 CodeGraph 索引（存在 `.codegraph/`）：查代码结构、调用关系优先用 `codegraph_explore`，而不是 grep + 逐个读文件。
