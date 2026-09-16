# s9y — Visual Portfolio

**s3hq4y (s9y)** 的个人视觉作品集。实时 3D、双语、零后端。

Personal visual portfolio of **s3hq4y (s9y)**. Real-time 3D, bilingual, no backend.

🌐 Live at: <https://s3hq4y.github.io>

## 技术栈 / Stack

- **Babylon.js 9** — 实时 WebGL 主视觉（发光核心 + 线框壳 + 轨道环 + 240 颗粒子）
- **TypeScript 7** — 严格模式，全部子路径导入以启用 tree-shaking
- **Vite 8** — 开发服务器 + 构建，输出到 `docs/`
- **零 UI 框架** — 原生 DOM，CSS 自定义属性驱动主题

## 开发 / Development

```bash
bun install        # 安装依赖
bun run dev        # 本地开发服务器
bun run typecheck  # tsc --noEmit
bun run build      # 类型检查 + 构建到 docs/
bun run preview    # 预览构建产物
```

## 结构 / Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Vite 入口壳 |
| `src/main.ts` | 页面装配、双语切换、卡片交互 |
| `src/scene.ts` | Babylon.js 3D 场景 |
| `src/data.ts` | 项目数据与全部文案（zh / en） |
| `src/style.css` | 设计系统与动画 |
| `docs/` | 构建产物（GitHub Pages 发布源） |

## 部署 / Deploy

构建产物输出到 `docs/`。GitHub Pages 需将发布源设为 **`main` 分支的 `/docs` 目录**。

Build output goes to `docs/`. Set GitHub Pages source to **`main` branch, `/docs` folder**.

```bash
bun run build
git add -A && git commit -m "Update portfolio" && git push
```

## 作品 / Work

- **[Portal](https://github.com/s3hq4y/portal)** — 公共 MCP 端点与隧道桥接 · GPL-3.0
- **[Wibe](https://github.com/s3hq4y/wibe)** — 浏览器驱动的编码代理（UWA）· AGPL-3.0

---

*旧站源码保存在 `legacy` 分支。* 🤖