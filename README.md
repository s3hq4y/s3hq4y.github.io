# s3hq4y — World Builder

Personal site of **s3hq4y (s9y)** — a Windows 10 Fluent experience.

🌐 Live at: <https://s3hq4y.github.io>

## What this is

A single-page site designed like **Windows 10 Fluent UI**:

- 🪟 Title bar + side nav + taskbar (with a live clock)
- 🧱 Mica & acrylic: translucent blur layers over a Win10-style wallpaper
- 🔵 Win10 accent `#0078D4`, 4px radii, Windows motion easing
- 🌐 **Bilingual** — toggle 中文 / English (taskbar globe or side nav)
- ☀️ **Light / dark theme** toggle (persists in `localStorage`)
- 📦 Featured project: **Portal** — a VS Code extension that turns your
  workspace into a public MCP endpoint
- ⌨️ Segoe UI + Cascadia Code, zero JS dependencies

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Structure (all copy carries `data-en` / `data-zh`) |
| `style.css` | Fluent tokens, light + dark themes, responsive |
| `script.js` | i18n, theme, taskbar clock, active-section nav, toasts |
| `wallpaper.jpg` | Win10-style bloom wallpaper (Mica source) |
| `portal-icon-*.png`, `portal-logo-*.png` | Assets from the [portal](https://github.com/s3hq4y/portal) repo |

## Local dev

```bash
python -m http.server 8080
# → http://localhost:8080
```
