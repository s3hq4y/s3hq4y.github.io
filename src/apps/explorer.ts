/* ============================================================
   explorer.ts — File Explorer (virtual FS), incl. Recycle Bin
   ============================================================ */

import { el, clear } from "../os/dom";
import { icon } from "../os/icons";
import { tt } from "../os/i18n";
import * as fs from "../os/fs";
import type { FSNode } from "../os/fs";
import { wm } from "../os/wm";
import { showMenu } from "../os/menu";
import { dlgConfirm, dlgPrompt } from "../os/dialog";
import { notify } from "../os/notifications";
import type { AppDef, AppWindow } from "../os/types";
import { makeDispose, str } from "./util";

const QUICK: { path: string; zh: string; en: string; icon: "folder" | "pc" | "recycle" }[] = [
  { path: "/", zh: "此电脑", en: "This PC", icon: "pc" },
  { path: "/Desktop", zh: "桌面", en: "Desktop", icon: "folder" },
  { path: "/Documents", zh: "文档", en: "Documents", icon: "folder" },
  { path: "/Pictures", zh: "图片", en: "Pictures", icon: "folder" },
  { path: "/Downloads", zh: "下载", en: "Downloads", icon: "folder" },
  { path: "/Music", zh: "音乐", en: "Music", icon: "folder" },
  { path: fs.RECYCLE, zh: "回收站", en: "Recycle Bin", icon: "recycle" },
];

function nodeIcon(n: FSNode): string {
  if (n.type === "dir") return icon("folder", 40);
  return icon(n.kind === "img" ? "fileImg" : n.kind === "txt" ? "fileTxt" : "fileBin", 40);
}

function openNode(path: string): void {
  const n = fs.node(path);
  if (!n) return;
  if (n.type === "dir") return;
  if (n.kind === "img") wm.open("photos", path);
  else wm.open("notepad", path);
}

function render(win: AppWindow): void {
  const d = makeDispose(win);
  const path = str(win, "path", (() => {
    const arg = win.store.get("openArg");
    if (typeof arg === "string" && fs.exists(arg)) return arg;
    return "/Desktop";
  })());
  win.store.set("path", path);
  const isBin = path === fs.RECYCLE;
  win.setTitle(`${fs.basename(path) || "This PC"} — ${tt("文件资源管理器", "File Explorer")}`);

  const root = el("div", { cls: "fx" });

  /* toolbar */
  const hist = (win.store.get("hist") as string[]) ?? [path];
  let hi = (win.store.get("hi") as number) ?? 0;
  if (hist[hi] !== path) {
    hist.splice(hi + 1, hist.length, path);
    hi = hist.length - 1;
  }
  win.store.set("hist", hist);
  win.store.set("hi", hi);

  const nav = (to: string): void => {
    win.store.set("path", fs.normalize(to));
    render(win);
  };

  const back = el("button", { cls: "fx-btn", html: icon("chevronLeft", 15), title: tt("后退", "Back"), attrs: { disabled: String(hi <= 0) } });
  const fwd = el("button", { cls: "fx-btn", html: icon("chevronRight", 15), title: tt("前进", "Forward"), attrs: { disabled: String(hi >= hist.length - 1) } });
  back.addEventListener("click", () => nav(hist[hi - 1]));
  fwd.addEventListener("click", () => nav(hist[hi + 1]));
  const up = el("button", { cls: "fx-btn", html: icon("arrowUp", 15), title: tt("上一级", "Up"), attrs: { disabled: String(path === "/") } });
  up.addEventListener("click", () => nav(fs.parentOf(path)));

  const crumbs = el("div", { cls: "fx-crumbs" });
  const parts = path === "/" ? [] : path.split("/").filter(Boolean);
  crumbs.append(
    el("button", { cls: "fx-crumb", html: icon("pc", 14), title: tt("此电脑", "This PC"), on: { click: () => nav("/") } }),
  );
  let acc = "";
  for (let i = 0; i < parts.length; i++) {
    acc += "/" + parts[i];
    const target = acc;
    crumbs.append(
      el("span", { cls: "fx-crumb-sep", html: icon("chevronRight", 11) }),
      el("button", {
        cls: "fx-crumb" + (i === parts.length - 1 ? " cur" : ""),
        text: parts[i],
        on: { click: () => nav(target) },
      }),
    );
  }

  const tools = el("div", { cls: "fx-tools" });
  if (!isBin) {
    tools.append(
      el("button", { cls: "fx-btn wide", html: icon("plus", 14), children: [el("span", { text: tt("新建文件夹", "New folder") })], on: { click: async () => {
        const name = await dlgPrompt(tt("新建文件夹", "New folder"), tt("名称", "Name"), tt("新建文件夹", "New folder"));
        if (name) fs.mkdir(path, name);
      } } }),
      el("button", { cls: "fx-btn wide", html: icon("fileTxt", 14), children: [el("span", { text: tt("新建文本文件", "New text file") })], on: { click: async () => {
        const name = await dlgPrompt(tt("新建文本文件", "New text file"), tt("名称", "Name"), "new.txt");
        if (name) fs.createFile(path, name.endsWith(".txt") ? name : name + ".txt", "txt", "");
      } } }),
    );
  } else {
    tools.append(
      el("button", { cls: "fx-btn wide", html: icon("trashSm", 14), children: [el("span", { text: tt("清空回收站", "Empty bin") })], on: { click: async () => {
        if (await dlgConfirm(tt("清空回收站", "Empty Recycle Bin"), tt("将永久删除所有项目，无法恢复。", "All items will be permanently deleted.")))
          fs.emptyTrash();
      } } }),
    );
  }

  root.append(el("div", { cls: "fx-bar" }, [el("div", { cls: "fx-nav" }, [back, fwd, up]), crumbs, tools]));

  /* layout: sidebar + grid */
  const side = el("nav", { cls: "fx-side" });
  for (const q of QUICK) {
    const b = el("button", {
      cls: "fx-side-item" + (q.path === path ? " cur" : ""),
      children: [el("span", { cls: "fx-side-ic", html: icon(q.icon, 16) }), el("span", { text: tt(q.zh, q.en) })],
      on: { click: () => nav(q.path) },
    });
    side.append(b);
  }

  const grid = el("div", { cls: "fx-grid", attrs: { tabindex: "0" } });
  const status = el("div", { cls: "fx-status" });
  const fill = (): void => {
    clear(grid);
    const items = fs.list(path);
    status.textContent = tt(`${items.length} 个项目`, `${items.length} item${items.length === 1 ? "" : "s"}`);
    if (items.length === 0) {
      grid.append(el("div", { cls: "fx-empty", text: isBin ? tt("回收站是空的", "Recycle Bin is empty") : tt("此文件夹为空", "This folder is empty") }));
    }
    for (const n of items) {
      const p = fs.join(path, n.name);
      const item = el("div", {
        cls: "fx-item",
        children: [
          el("div", { cls: "fx-item-ic", html: nodeIcon(n) }),
          el("div", { cls: "fx-item-name", text: n.name }),
        ],
        on: {
          click: () => {
            grid.querySelectorAll(".fx-item.sel").forEach((x) => x.classList.remove("sel"));
            item.classList.add("sel");
          },
          dblclick: () => {
            if (n.type === "dir") nav(p);
            else openNode(p);
          },
        },
      });
      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        grid.querySelectorAll(".fx-item.sel").forEach((x) => x.classList.remove("sel"));
        item.classList.add("sel");
        const menu = [] as Parameters<typeof showMenu>[2];
        if (isBin) {
          menu.push(
            { icon: "restore", label: tt("还原", "Restore"), onClick: () => {
              const back = fs.restore(p);
              notify(tt("已还原", "Restored"), `${n.name} → ${back ?? ""}`, "recycle");
            } },
            { icon: "trashSm", label: tt("永久删除", "Delete permanently"), danger: true, onClick: () => fs.purge(p) },
          );
        } else {
          menu.push(
            { icon: "openFile", label: tt("打开", "Open"), onClick: () => (n.type === "dir" ? nav(p) : openNode(p)) },
            { icon: "pencil", label: tt("重命名", "Rename"), onClick: async () => {
              const name = await dlgPrompt(tt("重命名", "Rename"), tt("名称", "Name"), n.name);
              if (name && name !== n.name) fs.rename(p, name);
            } },
            { icon: "copy", label: tt("复制路径", "Copy path"), onClick: () => navigator.clipboard?.writeText(p).catch(() => undefined) },
            { icon: "trashSm", label: tt("删除", "Delete"), danger: true, onClick: () => fs.trash(p) },
          );
        }
        showMenu(e.clientX, e.clientY, menu);
      });
      grid.append(item);
    }
  };
  fill();

  grid.addEventListener("contextmenu", (e) => {
    if ((e.target as HTMLElement).closest(".fx-item")) return;
    e.preventDefault();
    const menu: Parameters<typeof showMenu>[2] = [];
    if (!isBin) {
      menu.push(
        { icon: "plus", label: tt("新建文件夹", "New folder"), onClick: async () => {
          const name = await dlgPrompt(tt("新建文件夹", "New folder"), tt("名称", "Name"), tt("新建文件夹", "New folder"));
          if (name) fs.mkdir(path, name);
        } },
        { icon: "fileTxt", label: tt("新建文本文件", "New text file"), onClick: async () => {
          const name = await dlgPrompt(tt("新建文本文件", "New text file"), tt("名称", "Name"), "new.txt");
          if (name) fs.createFile(path, name.endsWith(".txt") ? name : name + ".txt", "txt", "");
        } },
        { icon: "refresh", label: tt("刷新", "Refresh"), onClick: () => fill() },
      );
    } else {
      menu.push({ icon: "trashSm", label: tt("清空回收站", "Empty bin"), danger: true, onClick: async () => {
        if (await dlgConfirm(tt("清空回收站", "Empty Recycle Bin"), tt("将永久删除所有项目，无法恢复。", "All items will be permanently deleted.")))
          fs.emptyTrash();
      } });
    }
    showMenu(e.clientX, e.clientY, menu);
  });

  d.on(window, "fs-changed", () => fill());

  const layout = el("div", { cls: "fx-layout" }, [side, grid]);
  root.append(layout, status);
  win.body.replaceChildren(root);
}

export const explorerApp: AppDef = {
  id: "files",
  zh: "文件资源管理器",
  en: "File Explorer",
  icon: "explorer",
  tile: "linear-gradient(135deg,#F7B84B,#E09B2D)",
  w: 860, h: 560, minW: 560, minH: 340,
  render,
  onClose: (win) => (win.store.get("dispose") as (() => void)[] | undefined)?.forEach((f) => f()),
};
