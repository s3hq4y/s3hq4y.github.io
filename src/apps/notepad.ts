/* ============================================================
   notepad.ts — plain text editor on the virtual FS
   ============================================================ */

import { el } from "../os/dom";
import { tt } from "../os/i18n";
import * as fs from "../os/fs";
import { dlgConfirm, dlgOpenFile, dlgSaveAs } from "../os/dialog";
import { notify } from "../os/notifications";
import type { AppDef, AppWindow } from "../os/types";
import { makeDispose } from "./util";

function currentPath(win: AppWindow): string | null {
  const p = win.store.get("path");
  return typeof p === "string" ? p : null;
}

function titleOf(win: AppWindow): void {
  const p = currentPath(win);
  const dirty = win.store.get("dirty") === true;
  const name = p ? fs.basename(p) : tt("未命名", "Untitled");
  win.setTitle(`${dirty ? "• " : ""}${name} — ${tt("记事本", "Notepad")}`);
}

function save(win: AppWindow): Promise<void> {
  return new Promise((resolve) => {
    const p = currentPath(win);
    const ta = win.body.querySelector("textarea");
    const text = ta ? ta.value : (win.store.get("text") as string) ?? "";
    win.store.set("text", text);
    if (p) {
      fs.writeFile(p, text);
      win.store.set("dirty", false);
      titleOf(win);
      resolve();
      return;
    }
    void saveAs(win).then(() => resolve());
  });
}

async function saveAs(win: AppWindow): Promise<void> {
  const ta = win.body.querySelector("textarea");
  const text = ta ? ta.value : (win.store.get("text") as string) ?? "";
  const p = currentPath(win);
  const defName = p ? fs.basename(p) : "untitled.txt";
  const defDir = p ? fs.parentOf(p) : "/Documents";
  const target = await dlgSaveAs(defName, defDir);
  if (!target) return;
  let path: string;
  if (fs.exists(fs.join(target.dir, target.name))) {
    path = fs.join(target.dir, target.name);
    fs.writeFile(path, text);
  } else {
    path = fs.createFile(target.dir, target.name, "txt", text);
  }
  win.store.set("path", path);
  win.store.set("text", text);
  win.store.set("dirty", false);
  titleOf(win);
  notify(tt("已保存", "Saved"), path, "save");
}

function render(win: AppWindow): void {
  makeDispose(win);
  const arg = win.store.get("openArg");
  if (typeof arg === "string" && fs.exists(arg) && win.store.get("path") === undefined) {
    win.store.set("path", arg);
  }
  const p = currentPath(win);
  const text = p ? fs.readFile(p) : ((win.store.get("text") as string) ?? "");
  if (p) win.store.set("text", text);
  titleOf(win);

  const ta = el("textarea", {
    cls: "np-text",
    attrs: { spellcheck: "false", placeholder: tt("在此输入…", "Type here…") },
  }) as HTMLTextAreaElement;
  ta.value = text;

  const status = el("div", { cls: "np-status" });
  const updateStatus = (): void => {
    const v = ta.value;
    const lines = v.split("\n").length;
    const words = v.trim() ? v.trim().split(/\s+/).length : 0;
    status.textContent = `${tt("字符", "Chars")} ${v.length} · ${tt("词", "Words")} ${words} · ${tt("行", "Lines")} ${lines}  ·  UTF-8  ·  ${p ?? tt("未保存", "unsaved")}`;
  };
  updateStatus();

  ta.addEventListener("input", () => {
    win.store.set("dirty", true);
    win.store.set("text", ta.value);
    titleOf(win);
    updateStatus();
  });

  const bar = el("div", { cls: "np-bar" }, [
    el("button", {
      cls: "fx-btn wide", children: [el("span", { text: tt("新建", "New") })],
      on: { click: async () => {
        if (win.store.get("dirty") === true) {
          const ok = await dlgConfirm(tt("记事本", "Notepad"), tt("有未保存的更改，放弃并新建？", "Discard unsaved changes?"));
          if (!ok) return;
        }
        win.store.set("path", null);
        win.store.set("text", "");
        win.store.set("dirty", false);
        render(win);
      } },
    }),
    el("button", { cls: "fx-btn wide", children: [el("span", { text: tt("打开", "Open") })], on: { click: async () => {
      const path = await dlgOpenFile("txt", tt("打开文本文件", "Open text file"));
      if (!path) return;
      win.store.set("path", path);
      win.store.set("text", fs.readFile(path));
      win.store.set("dirty", false);
      render(win);
    } } }),
    el("button", { cls: "fx-btn wide", children: [el("span", { text: tt("保存", "Save") })], on: { click: () => void save(win) } }),
    el("button", { cls: "fx-btn wide", children: [el("span", { text: tt("另存为", "Save as") })], on: { click: () => void saveAs(win) } }),
  ]);

  win.body.replaceChildren(el("div", { cls: "np" }, [bar, ta, status]));
  ta.focus();
}

export const notepadApp: AppDef = {
  id: "notepad",
  zh: "记事本",
  en: "Notepad",
  icon: "notepad",
  tile: "linear-gradient(135deg,#3A76BC,#2C5A94)",
  w: 720, h: 520, minW: 380, minH: 260,
  render,
};
