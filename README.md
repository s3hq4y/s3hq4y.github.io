# s9y OS 🖥️

**s3hq4y (s9y)** 的个人站点 —— 一个用 **TypeScript** 从零打造的网页操作系统，
Windows 10 Fluent 设计语言。

Personal site of **s3hq4y (s9y)** — a complete **web operating system**
written from scratch in **TypeScript**, styled after Windows 10 Fluent.

🌐 Live at: <https://s3hq4y.github.io>

## 功能 / Features

- 🚀 **启动流程** — 开机动画 → 锁屏（点击解锁）→ 桌面 · boot → lock screen → desktop
- 🪟 **窗口管理器** — 拖拽、八向缩放、边缘吸附分屏、最小化/最大化、焦点层级、任务栏联动
- 🧭 **任务栏** — 开始菜单、应用搜索、快速设置（Wi-Fi/亮度/音量/主题/语言）、
  日历、通知中心（含角标）、显示桌面
- 📁 **虚拟文件系统** — localStorage 持久化；桌面右键新建、重命名、删除/还原（回收站）
- 📦 **内置应用 / Apps**
  - 文件资源管理器 File Explorer（导航/面包屑/快捷访问/回收站）
  - 记事本 Notepad（打开/保存/另存为，字数统计）
  - 终端 Terminal（`help` 查看全部命令：ls/cd/cat/echo 重定向/tree/open/theme/wallpaper/neofetch…）
  - 计算器 Calculator（支持键盘）
  - 画图 Paint（画笔/橡皮/调色板，保存到图片库）
  - 照片 Photos（缩放/拖拽平移/滚轮缩放）
  - 时钟 Clock（世界时钟 + 秒表）
  - 任务管理器 Task Manager（实时曲线、结束任务）
  - 设置 Settings（主题/强调色/壁纸/语言/12 小时制/存储/恢复出厂）
  - 关于 About（关于 s9y 与 Portal 项目）
- 🌐 **双语** — 中文 / English 全局切换（含应用窗口实时重渲染）
- 🌗 **浅色/深色主题** + 8 种强调色 + 5 张壁纸
- 🔔 **通知系统** — Toast + 操作中心
- ⌨️ Segoe UI + Cascadia Code，零运行时依赖

## TypeScript / Building

源码全部为 TypeScript（`src/`），构建产物为一个无依赖的 IIFE 包 `js/os.js`：

```bash
npm install        # devDependencies: typescript + esbuild
npm run typecheck  # tsc --noEmit（严格模式）
npm run build      # 类型检查 + esbuild 打包 -> js/os.js
npm run dev        # watch 模式
```

## 结构 / Structure

| Path | Purpose |
| --- | --- |
| `index.html` | 壳页面（noscript 回退） |
| `style.css` | Fluent 设计系统（tokens、明暗主题、动画） |
| `js/os.js` | 构建产物（esbuild bundle） |
| `src/main.ts` | 入口：装配 shell、启动流程 |
| `src/os/` | 内核模块：`wm` 窗口管理、`fs` 虚拟文件系统、`taskbar`、`desktop`、`settings`、`i18n`、`dialog`、`menu`、`notifications`、`boot`、`icons`、`dom` |
| `src/apps/` | 各应用模块 + `registry` |
| `wallpaper.jpg` | 默认壁纸（Mica 来源） |

## Local dev

```bash
python -m http.server 8080   # or: npx serve
# → http://localhost:8080
```

---

*This site was built and deployed by an AI agent through the
[Portal](https://github.com/s3hq4y/portal) MCP tunnel.* 🤖
