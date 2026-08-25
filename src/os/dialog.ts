/* ============================================================
   dialog.ts — modal dialogs (alert / confirm / prompt / file pickers)
   ============================================================ */

import { el, esc } from "./dom";
import { icon } from "./icons";
import { tt } from "./i18n";
import * as fs from "./fs";
import type { FileKind } from "./fs";

let layer: HTMLElement | null = null;

export function setDialogLayer(l: HTMLElement): void {
  layer = l;
}

interface DialogSpec {
  title: string;
  body: HTMLElement;
  okText?: string;
  cancelText?: string | null; // null -> hide cancel
  onOk?: () => Promise<boolean> | boolean; // return false keeps dialog open
  focus?: HTMLElement;
}

function openDialog(spec: DialogSpec): Promise<boolean> {
  return new Promise((resolve) => {
    if (!layer) {
      resolve(false);
      return;
    }
    const backdrop = el("div", { cls: "dlg-backdrop" });
    const card = el("div", { cls: "dlg" });
    const okBtn = el("button", {
      cls: "btn btn-accent",
      text: spec.okText ?? tt("确定", "OK"),
      on: { click: async () => {
        if (spec.onOk) {
          const keep = await spec.onOk();
          if (!keep) return;
        }
        cleanup(true);
      } },
    });
    const cancelBtn = el("button", {
      cls: "btn",
      text: spec.cancelText ?? tt("取消", "Cancel"),
      on: { click: () => cleanup(false) },
    });
    card.append(
      el("div", { cls: "dlg-title", text: spec.title }),
      el("div", { cls: "dlg-body" }, [spec.body]),
      el("div", { cls: "dlg-actions" }, [
        ...(spec.cancelText === null ? [] : [cancelBtn]),
        okBtn,
      ]),
    );
    backdrop.append(card);
    layer.append(backdrop);
    requestAnimationFrame(() => backdrop.classList.add("show"));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        cleanup(false);
      }
    };
    backdrop.addEventListener("keydown", onKey);

    function cleanup(result: boolean): void {
      document.removeEventListener("keydown", onKey, true);
      backdrop.classList.remove("show");
      window.setTimeout(() => backdrop.remove(), 160);
      resolve(result);
    }
    document.addEventListener("keydown", onKey, true);
    (spec.focus ?? okBtn).focus();
  });
}

export function dlgAlert(title: string, message: string): Promise<boolean> {
  const body = el("p", { cls: "dlg-msg", text: message });
  return openDialog({ title, body, cancelText: null, okText: tt("确定", "OK") });
}

export function dlgConfirm(title: string, message: string, okText?: string): Promise<boolean> {
  const body = el("p", { cls: "dlg-msg", text: message });
  return openDialog({ title, body, okText });
}

export function dlgPrompt(title: string, label: string, defaultValue = ""): Promise<string | null> {
  return new Promise((resolve) => {
    const input = el("input", {
      cls: "input",
      attrs: { type: "text", value: defaultValue, spellcheck: "false" },
    }) as HTMLInputElement;
    const labelEl = el("label", { cls: "dlg-label", text: label });
    const body = el("div", {}, [labelEl, input]);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.closest(".dlg")!.querySelector<HTMLButtonElement>(".btn-accent")!.click();
      }
    });
    openDialog({
      title,
      body,
      onOk: () => {
        resolve(input.value.trim() || null);
        return true;
      },
    }).then((ok) => {
      if (!ok) resolve(null);
    });
    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  });
}

function fileIconHtml(path: string): string {
  const n = fs.node(path);
  if (n?.type === "dir") return icon("folder", 20);
  return icon(n?.kind === "img" ? "fileImg" : n?.kind === "txt" ? "fileTxt" : "fileBin", 20);
}

export function dlgOpenFile(kind?: FileKind, title?: string): Promise<string | null> {
  return new Promise((resolve) => {
    const files = fs.allFiles(kind);
    const list = el("div", { cls: "dlg-file-list" });
    if (files.length === 0)
      list.append(el("div", { cls: "dlg-empty", text: tt("（没有文件）", "(no files)") }));
    let chosen: string | null = files[0] ?? null;
    for (const p of files) {
      const row = el("div", {
        cls: "dlg-file-row",
        children: [
          el("span", { cls: "dlg-file-ic", html: fileIconHtml(p) }),
          el("span", { cls: "dlg-file-name", html: `<b>${esc(fs.basename(p))}</b><small>${esc(fs.parentOf(p))}</small>` }),
        ],
        on: { click: () => {
          chosen = p;
          list.querySelectorAll(".dlg-file-row").forEach((r) => r.classList.remove("sel"));
          row.classList.add("sel");
        } },
      });
      row.addEventListener("dblclick", () => {
        chosen = p;
        row.closest(".dlg")!.querySelector<HTMLButtonElement>(".btn-accent")!.click();
      });
      list.append(row);
    }
    if (files[0]) list.querySelector(".dlg-file-row")?.classList.add("sel");
    openDialog({
      title: title ?? tt("打开文件", "Open file"),
      body: list,
      onOk: () => {
        resolve(chosen);
        return true;
      },
    }).then((ok) => {
      if (!ok) resolve(null);
    });
  });
}

function allDirs(): string[] {
  const out: string[] = [];
  const walk = (path: string) => {
    out.push(path);
    for (const c of fs.list(path)) if (c.type === "dir") walk(fs.join(path, c.name));
  };
  walk(fs.ROOT);
  return out.filter((p) => p !== fs.RECYCLE);
}

export function dlgSaveAs(defaultName: string, defaultDir = "/Documents"): Promise<{ dir: string; name: string } | null> {
  return new Promise((resolve) => {
    const nameInput = el("input", {
      cls: "input",
      attrs: { type: "text", value: defaultName, spellcheck: "false" },
    }) as HTMLInputElement;
    const dirSel = el("select", { cls: "input" }) as HTMLSelectElement;
    for (const d of allDirs()) {
      const o = el("option", { text: d, attrs: { value: d } });
      if (d === defaultDir) o.selected = true;
      dirSel.append(o);
    }
    const body = el("div", { cls: "dlg-form" }, [
      el("label", { text: tt("文件名", "File name") }), nameInput,
      el("label", { text: tt("位置", "Location") }), dirSel,
    ]);
    openDialog({
      title: tt("另存为", "Save as"),
      body,
      onOk: () => {
        const name = nameInput.value.trim();
        if (!name) return false;
        resolve({ dir: dirSel.value, name });
        return true;
      },
    }).then((ok) => {
      if (!ok) resolve(null);
    });
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        nameInput.closest(".dlg")!.querySelector<HTMLButtonElement>(".btn-accent")!.click();
      }
    });
    requestAnimationFrame(() => {
      nameInput.focus();
      const dot = defaultName.lastIndexOf(".");
      nameInput.setSelectionRange(0, dot > 0 ? dot : defaultName.length);
    });
  });
}
