/* ============================================================
   main.ts — s9y OS entry point
   Boot sequence: init fs/settings → build shell → boot → lock → desktop
   ============================================================ */

import { el } from "./os/dom";
import { initLang, onLangChange } from "./os/i18n";
import { initFS } from "./os/fs";
import { applySettings } from "./os/settings";
import { wm } from "./os/wm";
import { setDialogLayer } from "./os/dialog";
import { setToastLayer, notify } from "./os/notifications";
import { initDesktop } from "./os/desktop";
import { initTaskbar } from "./os/taskbar";
import { playBoot, initBootEvents } from "./os/boot";
import { getApp } from "./apps/registry";

function buildSkeleton(): { windows: HTMLElement; snap: HTMLElement; toasts: HTMLElement; dialogs: HTMLElement } {
  document.body.append(el("div", { id: "wallpaper", cls: "wallpaper" }));
  const windows = el("div", { id: "windows", cls: "windows" });
  const snap = el("div", { id: "snap-preview", cls: "snap-preview" });
  const toasts = el("div", { id: "toasts", cls: "toasts" });
  const dialogs = el("div", { id: "dialogs", cls: "dialogs" });
  initDesktop(); // appends #desktop (icons layer, under windows)
  document.body.append(windows, snap, toasts, dialogs);
  return { windows, snap, toasts, dialogs };
}

function main(): void {
  initLang();
  initFS();
  applySettings();

  const { windows, snap, toasts, dialogs } = buildSkeleton();

  wm.setAppProvider(getApp);
  wm.setLayer(windows, snap);
  setDialogLayer(dialogs);
  setToastLayer(toasts);

  initTaskbar();
  initBootEvents();

  /* keep maximized windows fitted on viewport resize */
  window.addEventListener("resize", () => {
    window.dispatchEvent(new Event("wm-resize"));
  });

  /* re-render shell text on language change */
  onLangChange(() => {
    wm.rerenderAll();
  });

  playBoot(() => {
    window.setTimeout(() => {
      notify(
        "s9y OS",
        "欢迎使用 s9y OS · Welcome — 打开开始菜单探索应用 / open the Start menu to explore",
        "logo",
      );
    }, 600);
  });
}

main();
