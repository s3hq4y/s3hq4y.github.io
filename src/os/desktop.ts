/* ============================================================
   desktop.ts — desktop icons + wallpaper-level interactions
   ============================================================ */

import { el, clear } from "./dom";
import { icon, type IconName } from "./icons";
import { tt } from "./i18n";
import * as fs from "./fs";
import { wm } from "./wm";
import { showMenu } from "./menu";
import { dlgPrompt } from "./dialog";
import type { FSNode } from "./fs";

interface Shortcut { zh: string; en: string; ic: IconName; open: () => void }

const SHORTCUTS: Shortcut[] = [
  { zh: "此电脑", en: "This PC", ic: "pc", open: () => wm.open("files", "/") },
  { zh: "回收站", en: "Recycle Bin", ic: "recycle", open: () => wm.open("files", fs.RECYCLE) },
  { zh: "终端", en: "Terminal", ic: "terminal", open: () => wm.open("terminal") },
  { zh: "画图", en: "Paint", ic: "paint", open: () => wm.open("paint") },
  { zh: "关于 s9y", en: "About s9y", ic: "about", open: () => wm.open("about") },
];

let container: HTMLElement | null = null;

function openNode(path: string): void {
  const n = fs.node(path);
  if (!n || n.type !== "file") return;
  if (n.kind === "img") wm.open("photos", path);
  else wm.open("notepad", path);
}

function iconEl(ic: string, label: string, onOpen: () => void, menuPath?: string): HTMLElement {
  const elid = el("button", {
    cls: "dt-icon",
    children: [
      el("span", { cls: "dt-icon-ic", html: ic }),
      el("span", { cls: "dt-icon-label", text: label }),
    ],
  });
  elid.addEventListener("click", (e) => {
    e.stopPropagation();
    container?.querySelectorAll(".dt-icon.sel").forEach((x) => x.classList.remove("sel"));
    elid.classList.add("sel");
  });
  elid.addEventListener("dblclick", onOpen);
  elid.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    container?.querySelectorAll(".dt-icon.sel").forEach((x) => x.classList.remove("sel"));
    elid.classList.add("sel");
    if (menuPath) {
      showMenu(e.clientX, e.clientY, [
        { icon: "openFile", label: tt("打开", "Open"), onClick: () => openNode(menuPath) },
        { icon: "pencil", label: tt("重命名", "Rename"), onClick: async () => {
          const name = await dlgPrompt(tt("重命名", "Rename"), tt("名称", "Name"), fs.basename(menuPath));
          if (name) fs.rename(menuPath, name);
        } },
        { icon: "trashSm", label: tt("删除", "Delete"), danger: true, onClick: () => fs.trash(menuPath) },
      ]);
    } else {
      showMenu(e.clientX, e.clientY, [
        { icon: "openFile", label: tt("打开", "Open"), onClick: onOpen },
      ]);
    }
  });
  return elid;
}

export function renderDesktop(): void {
  if (!container) return;
  clear(container);
  for (const s of SHORTCUTS) {
    container.append(iconEl(icon(s.ic, 44), tt(s.zh, s.en), s.open));
  }
  for (const n of fs.list("/Desktop") as FSNode[]) {
    const p = fs.join("/Desktop", n.name);
    const ic = n.type === "dir" ? icon("folder", 44) : icon(n.kind === "img" ? "fileImg" : "fileTxt", 44);
    container.append(
      iconEl(ic, n.name, () => {
        if (n.type === "dir") wm.open("files", p);
        else openNode(p);
      }, p),
    );
  }
}

export function initDesktop(): void {
  container = el("div", { id: "desktop", cls: "desktop" });
  document.body.append(container);
  renderDesktop();

  container.addEventListener("click", (e) => {
    if (e.target === container)
      container?.querySelectorAll(".dt-icon.sel").forEach((x) => x.classList.remove("sel"));
  });

  container.addEventListener("contextmenu", (e) => {
    if (e.target !== container) return;
    e.preventDefault();
    showMenu(e.clientX, e.clientY, [
      { icon: "plus", label: tt("新建文件夹", "New folder"), onClick: async () => {
        const name = await dlgPrompt(tt("新建文件夹", "New folder"), tt("名称", "Name"), tt("新建文件夹", "New folder"));
        if (name) fs.mkdir("/Desktop", name);
      } },
      { icon: "fileTxt", label: tt("新建文本文件", "New text file"), onClick: async () => {
        const name = await dlgPrompt(tt("新建文本文件", "New text file"), tt("名称", "Name"), "new.txt");
        if (name) fs.createFile("/Desktop", name.endsWith(".txt") ? name : name + ".txt", "txt", "");
      } },
      { icon: "refresh", label: tt("刷新", "Refresh"), onClick: () => renderDesktop() },
      { separator: true, label: "" },
      { icon: "palette", label: tt("个性化", "Personalize"), onClick: () => wm.open("settings") },
      { icon: "monitor", label: tt("显示设置", "Display settings"), onClick: () => wm.open("settings") },
      { icon: "terminal", label: tt("在此处打开终端", "Open terminal here"), onClick: () => wm.open("terminal") },
    ]);
  });

  fs.onFSChange(() => renderDesktop());
  window.addEventListener("os-lang", () => renderDesktop());
}
