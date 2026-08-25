/* ============================================================
   about.ts — About s9y (personal card; the old landing page content,
   minus the deleted strategy-game section)
   ============================================================ */

import { el } from "../os/dom";
import { icon } from "../os/icons";
import { tt } from "../os/i18n";
import type { AppDef, AppWindow } from "../os/types";

const LINKS: { zh: string; en: string; href: string; ic: "github" | "external" | "mail" | "discord" }[] = [
  { zh: "GitHub — s3hq4y", en: "GitHub — s3hq4y", href: "https://github.com/s3hq4y", ic: "github" },
  { zh: "Portal 项目", en: "Portal project", href: "https://github.com/s3hq4y/portal", ic: "external" },
  { zh: "邮箱", en: "Email", href: "mailto:s3hq4y@gmail.com", ic: "mail" },
  { zh: "Discord 社区", en: "Discord community", href: "https://discord.gg/HnmEeeNrKF", ic: "discord" },
];

const CHIPS: [string, string][] = [
  ["AI", "AI"],
  ["新技术", "New tech"],
  ["Web", "Web"],
  ["TypeScript", "TypeScript"],
  ["开源", "Open source"],
];

function render(win: AppWindow): void {
  win.setTitle(tt("关于", "About"));

  const open = (href: string): void => { window.open(href, "_blank", "noopener"); };

  win.body.replaceChildren(
    el("div", { cls: "ab" }, [
      el("div", { cls: "ab-hero" }, [
        el("div", { cls: "ab-avatar", text: "s9y" }),
        el("div", { cls: "ab-id" }, [
          el("div", { cls: "ab-name", text: "s3hq4y (s9y)" }),
          el("div", { cls: "ab-tag", text: tt("世界构建者 · World Builder", "World Builder") }),
        ]),
      ]),
      el("p", {
        cls: "ab-bio",
        text: tt(
          "你好，我是 s9y —— 一个停不下手的开发者，喜欢用代码搭建小世界：AI、新技术和 Web 实验。你现在看到的整个“操作系统”就是一个 TypeScript 页面。",
          "Hi, I'm s9y — a developer with a builder's itch, making little worlds out of code: AI, new tech and web experiments. This entire “operating system” is one TypeScript page.",
        ),
      }),
      el("div", { cls: "ab-chips" }, CHIPS.map(([zh, en]) => el("span", { cls: "ab-chip", text: tt(zh, en) }))),

      el("div", { cls: "ab-card" }, [
        el("div", { cls: "ab-card-head" }, [
          el("span", { cls: "ab-card-ic", html: icon("external", 15) }),
          el("span", { cls: "ab-card-title", text: "Portal" }),
          el("span", { cls: "ab-card-badge", text: "VS Code 扩展 · Extension" }),
        ]),
        el("p", {
          cls: "ab-card-p",
          text: tt(
            "Portal 把你的 VS Code 工作区暴露为公开的 MCP 端点——刻意保持精简：只包含命令执行与文件传输。任何 MCP 客户端（Claude、ChatGPT、Cursor，甚至 curl）都能连接到你的机器。",
            "Portal exposes your VS Code workspace as a public MCP endpoint — deliberately minimal: command execution and file transfer only. Any MCP client (Claude, ChatGPT, Cursor, even curl) can connect to your machine.",
          ),
        }),
        el("p", {
          cls: "ab-card-p dim",
          text: tt(
            "你现在看到的这个网站，正是通过 Portal 隧道由 AI 代理构建并推送的。",
            "This very site was built and pushed by an AI agent through the Portal tunnel.",
          ),
        }),
      ]),

      el("div", { cls: "ab-links" }, LINKS.map((l) =>
        el("button", {
          cls: "ab-link",
          children: [
            el("span", { cls: "ab-link-ic", html: icon(l.ic, 16) }),
            el("span", { text: tt(l.zh, l.en) }),
          ],
          on: { click: () => open(l.href) },
        }),
      )),

      el("div", { cls: "ab-foot", text: tt("s9y OS 1.0.0 · TypeScript · 无框架无依赖", "s9y OS 1.0.0 · TypeScript · no frameworks, no dependencies") }),
    ]),
  );
}

export const aboutApp: AppDef = {
  id: "about",
  zh: "关于 s9y",
  en: "About s9y",
  icon: "about",
  tile: "linear-gradient(135deg,#8764B8,#6A4A99)",
  w: 560, h: 640, minW: 420, minH: 420,
  singleton: true,
  render,
};
