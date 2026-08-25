/* ============================================================
   paint.ts — canvas paint (brush / eraser, save to virtual FS)
   ============================================================ */

import { el } from "../os/dom";
import { tt } from "../os/i18n";
import * as fs from "../os/fs";
import { notify } from "../os/notifications";
import type { AppDef, AppWindow } from "../os/types";
import { num, str } from "./util";

const SWATCHES = ["#000000", "#ffffff", "#E81123", "#F7630C", "#FFB900", "#107C10", "#0078D4", "#8764B8", "#E3008C", "#8A8886"];

function render(win: AppWindow): void {
  win.setTitle(tt("画图", "Paint"));

  const color = str(win, "color", "#0078D4");
  const size = num(win, "size", 4);
  const tool = str(win, "tool", "brush");

  const canvas = el("canvas", { cls: "pt-canvas", attrs: { width: "1100", height: "700" } }) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const saved = win.store.get("data") as string | undefined;
  if (saved) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = saved;
  }

  const pos = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  };

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? size * 3 : size;
    const onMove = (ev: PointerEvent): void => {
      const q = pos(ev);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    };
    const onUp = (): void => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      win.store.set("data", canvas.toDataURL("image/png"));
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    ctx.lineTo(p.x + 0.01, p.y + 0.01);
    ctx.stroke();
  });

  const sizeRange = el("input", {
    cls: "pt-size",
    attrs: { type: "range", min: "1", max: "40", value: String(size) },
  }) as HTMLInputElement;
  sizeRange.addEventListener("input", () => win.store.set("size", Number(sizeRange.value)));

  const swatches = el("div", { cls: "pt-swatches" });
  const markSel = (sel: string): void => {
    swatches.querySelectorAll<HTMLElement>(".pt-sw").forEach((s) =>
      s.classList.toggle("sel", s.dataset.c === sel));
  };
  for (const c of SWATCHES) {
    const b = el("button", { cls: "pt-sw", dataset: { c }, style: { background: c }, attrs: { title: c } });
    b.addEventListener("click", () => {
      win.store.set("color", c);
      win.store.set("tool", "brush");
      toolBtns("brush");
      markSel(c);
    });
    swatches.append(b);
  }
  const picker = el("input", {
    cls: "pt-picker",
    attrs: { type: "color", value: color.startsWith("#") ? color : "#0078D4" },
  }) as HTMLInputElement;
  picker.addEventListener("input", () => {
    win.store.set("color", picker.value);
    win.store.set("tool", "brush");
    toolBtns("brush");
    markSel("");
  });
  markSel(color);

  const btnBrush = el("button", { cls: "pt-tool sel", html: "", title: tt("画笔", "Brush"), children: [el("span", { cls: "pt-tool-ic brush" })] });
  const btnEraser = el("button", { cls: "pt-tool", title: tt("橡皮", "Eraser"), children: [el("span", { cls: "pt-tool-ic eraser" })] });
  const toolBtns = (t: string): void => {
    btnBrush.classList.toggle("sel", t === "brush");
    btnEraser.classList.toggle("sel", t === "eraser");
    win.store.set("tool", t);
  };
  btnBrush.addEventListener("click", () => toolBtns("brush"));
  btnEraser.addEventListener("click", () => toolBtns("eraser"));
  toolBtns(tool);

  const btnClear = el("button", { cls: "fx-btn wide", children: [el("span", { text: tt("清空", "Clear") })], on: { click: () => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    win.store.set("data", canvas.toDataURL("image/png"));
  } } });

  const btnSave = el("button", { cls: "fx-btn wide accent", children: [el("span", { text: tt("保存到图片", "Save to Pictures") })], on: { click: () => {
    const data = canvas.toDataURL("image/png");
    win.store.set("data", data);
    const name = fs.uniqueName("/Pictures", "paint.png");
    fs.createFile("/Pictures", name, "img", data);
    notify(tt("已保存", "Saved"), `/Pictures/${name}`, "paint");
  } } });

  const bar = el("div", { cls: "pt-bar" }, [
    el("div", { cls: "pt-group" }, [btnBrush, btnEraser]),
    swatches,
    picker,
    el("div", { cls: "pt-group" }, [sizeRange]),
    el("div", { cls: "pt-group" }, [btnClear, btnSave]),
  ]);

  const stage = el("div", { cls: "pt-stage" }, [canvas]);
  win.body.replaceChildren(el("div", { cls: "pt" }, [bar, stage]));
}

export const paintApp: AppDef = {
  id: "paint",
  zh: "画图",
  en: "Paint",
  icon: "paint",
  tile: "linear-gradient(135deg,#E9A4C5,#D77BA8)",
  w: 840, h: 580, minW: 480, minH: 340,
  render,
};
