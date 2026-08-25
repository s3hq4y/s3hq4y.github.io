/* ============================================================
   settingsapp.ts — Personalization / Time & Language / System / About
   ============================================================ */

import { el } from "../os/dom";
import { tt, getLang, setLang } from "../os/i18n";
import { ACCENTS, WALLPAPERS, getSettings, patchSettings } from "../os/settings";
import * as fs from "../os/fs";
import { dlgConfirm } from "../os/dialog";
import { notify } from "../os/notifications";
import { icon } from "../os/icons";
import type { AppDef, AppWindow } from "../os/types";
import { str } from "./util";

type Section = "person" | "time" | "system" | "about";

function render(win: AppWindow): void {
  const s = getSettings();
  const section = (str(win, "section", "person") as Section);
  win.store.set("section", section);
  win.setTitle(tt("设置", "Settings"));

  const NAV: { id: Section; zh: string; en: string; ic: "palette" | "langIcon" | "monitor" | "info" }[] = [
    { id: "person", zh: "个性化", en: "Personalization", ic: "palette" },
    { id: "time", zh: "时间和语言", en: "Time & language", ic: "langIcon" },
    { id: "system", zh: "系统", en: "System", ic: "monitor" },
    { id: "about", zh: "关于", en: "About", ic: "info" },
  ];

  const content = el("div", { cls: "st-content" });

  const h2 = (zh: string, en: string): HTMLElement => el("h2", { cls: "st-h2", text: tt(zh, en) });
  const group = (...kids: HTMLElement[]): HTMLElement => el("div", { cls: "st-group" }, kids);

  const paint = (): void => {
    content.replaceChildren();
    if (section === "person") {
      content.append(h2("主题", "Theme"));
      const themes = el("div", { cls: "st-themes" });
      for (const t of ["light", "dark"] as const) {
        const card = el("button", {
          cls: "st-theme" + (s.theme === t ? " sel" : ""),
          children: [
            el("div", { cls: `st-theme-prev ${t}` }),
            el("span", { text: tt("浅色", "Light") }),
          ],
          on: { click: () => { patchSettings({ theme: t }); paint(); } },
        });
        if (t === "dark") (card.children[1] as HTMLElement).textContent = tt("深色", "Dark");
        themes.append(card);
      }
      content.append(group(themes));

      content.append(h2("强调色", "Accent color"));
      const swatches = el("div", { cls: "st-swatches" });
      for (const a of ACCENTS) {
        const color = s.theme === "dark" ? a.dark : a.light;
        swatches.append(
          el("button", {
            cls: "st-sw" + (s.accent === a.id ? " sel" : ""),
            style: { background: color },
            attrs: { title: a.id },
            on: { click: () => { patchSettings({ accent: a.id }); paint(); } },
          }, [
            el("span", { cls: "st-sw-check", html: icon("check", 12) }),
          ]),
        );
      }
      content.append(group(swatches));

      content.append(h2("壁纸", "Wallpaper"));
      const wps = el("div", { cls: "st-wps" });
      for (const w of WALLPAPERS) {
        wps.append(
          el("button", {
            cls: "st-wp" + (s.wallpaper === w.id ? " sel" : ""),
            children: [
              el("div", { cls: "st-wp-thumb", style: { background: w.thumb } }),
              el("span", { text: tt(w.zh, w.en) }),
            ],
            on: { click: () => { patchSettings({ wallpaper: w.id }); paint(); } },
          }),
        );
      }
      content.append(group(wps));
    }

    if (section === "time") {
      content.append(h2("语言 / Language", "Language / 语言"));
      const langs = el("div", { cls: "st-langs" });
      for (const l of ["zh", "en"] as const) {
        langs.append(
          el("button", {
            cls: "st-lang" + (getLang() === l ? " sel" : ""),
            children: [el("span", { cls: "st-lang-name", text: l === "zh" ? "中文（简体）" : "English (US)" })],
            on: { click: () => { setLang(l); paint(); } },
          }),
        );
      }
      content.append(group(langs));

      content.append(h2("时间", "Time"));
      content.append(group(
        el("label", { cls: "st-row" }, [
          el("span", { text: tt("12 小时制", "12-hour clock") }),
          (() => {
            const chk = el("input", { attrs: { type: "checkbox" } }) as HTMLInputElement;
            chk.checked = s.hour12;
            chk.addEventListener("change", () => patchSettings({ hour12: chk.checked }));
            return chk;
          })(),
        ]),
      ));
    }

    if (section === "system") {
      content.append(h2("存储", "Storage"));
      const used = fs.storageBytes() + (localStorage.getItem("wos.settings")?.length ?? 0);
      const cap = 5 * 1024 * 1024;
      content.append(group(
        el("div", { cls: "st-storage" }, [
          el("div", { cls: "st-bar" }, [el("div", { cls: "st-bar-fill", style: { width: `${Math.min(100, (used / cap) * 100).toFixed(2)}%` } })]),
          el("div", { cls: "st-storage-text", text: tt(`已用 ${(used / 1024).toFixed(1)} KiB / 5 MiB（localStorage）`, `Used ${(used / 1024).toFixed(1)} KiB of 5 MiB (localStorage)`) }),
        ]),
      ));

      content.append(h2("重置", "Reset"));
      content.append(group(
        el("div", { cls: "st-col" }, [
          el("button", {
            cls: "btn", text: tt("清空文件系统（恢复默认）", "Reset file system"),
            on: { click: async () => {
              if (await dlgConfirm(tt("重置文件系统", "Reset file system"), tt("所有文件与文件夹将被删除，恢复到初始状态。", "All files and folders will be restored to defaults."))) {
                fs.resetFS();
                notify(tt("设置", "Settings"), tt("文件系统已重置", "File system reset"), "settingsApp");
              }
            } },
          }),
          el("button", {
            cls: "btn danger", text: tt("恢复出厂设置（清除全部数据）", "Factory reset (erase everything)"),
            on: { click: async () => {
              if (await dlgConfirm(tt("恢复出厂设置", "Factory reset"), tt("将清除所有设置与文件并重新启动。继续？", "All settings and files will be erased and the OS will restart. Continue?"))) {
                localStorage.removeItem("wos.settings");
                localStorage.removeItem("wos.fs");
                localStorage.removeItem("wos.lang");
                location.reload();
              }
            } },
          }),
        ]),
      ));
    }

    if (section === "about") {
      content.append(h2("关于本机", "About"));
      content.append(group(
        el("div", { cls: "st-kv" }, [
          el("div", { text: tt("操作系统", "OS") }), el("div", { text: "s9y OS 1.0.0" }),
          el("div", { text: tt("构建", "Built with") }), el("div", { text: "TypeScript · 零依赖 zero-dependency" }),
          el("div", { text: tt("浏览器", "Browser") }), el("div", { text: navigator.userAgent.split(") ").pop() ?? navigator.userAgent }),
          el("div", { text: tt("界面语言", "UI language") }), el("div", { text: getLang() === "zh" ? "中文（简体）" : "English" }),
          el("div", { text: tt("屏幕", "Display") }), el("div", { text: `${screen.width} × ${screen.height}` }),
          el("div", { text: tt("设备内存", "Device memory") }), el("div", { text: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ? `${(navigator as Navigator & { deviceMemory?: number }).deviceMemory} GB` : "—" }),
        ]),
      ));
    }
  };

  const nav = el("nav", { cls: "st-nav" });
  for (const n of NAV) {
    nav.append(
      el("button", {
        cls: "st-nav-item" + (n.id === section ? " cur" : ""),
        children: [el("span", { cls: "st-nav-ic", html: icon(n.ic, 16) }), el("span", { text: tt(n.zh, n.en) })],
        on: { click: () => { win.store.set("section", n.id); render(win); } },
      }),
    );
  }

  paint();
  win.body.replaceChildren(el("div", { cls: "st" }, [nav, content]));
}

export const settingsAppDef: AppDef = {
  id: "settings",
  zh: "设置",
  en: "Settings",
  icon: "settingsApp",
  tile: "linear-gradient(135deg,#9AA5B1,#77828E)",
  w: 860, h: 580, minW: 560, minH: 400,
  singleton: true,
  render,
};
