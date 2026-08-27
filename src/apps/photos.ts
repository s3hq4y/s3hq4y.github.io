/* ============================================================
   photos.ts — image viewer (virtual FS images or raw URLs)
   ============================================================ */

import { el } from "../os/dom";
import { tt } from "../os/i18n";
import * as fs from "../os/fs";
import type { AppDef, AppWindow } from "../os/types";
import { makeDispose, num, str } from "./util";

function resolveSrc(path: string): { src: string; name: string } {
  const n = fs.node(path);
  if (n && n.type === "file" && n.kind === "img") {
    const c = n.content ?? "";
    return { src: c.startsWith("data:") || c.startsWith("http") ? c : c.replace(/^\.?\//, ""), name: n.name };
  }
  return { src: path, name: fs.basename(path) || "image" };
}

function render(win: AppWindow): void {
  makeDispose(win);
  const arg = win.store.get("openArg");
  const path = str(win, "path", typeof arg === "string" ? arg : "/Pictures/wallpaper-debian.svg");
  win.store.set("path", path);
  const { src, name } = resolveSrc(path);
  win.setTitle(`${name} — ${tt("照片", "Photos")}`);

  let scale = num(win, "scale", 1);
  let px = num(win, "px", 0);
  let py = num(win, "py", 0);

  const img = el("img", { cls: "ph-img", attrs: { src, alt: name, draggable: "false" } }) as HTMLImageElement;
  const zoomLabel = el("span", { cls: "ph-zoom" });

  const apply = (): void => {
    img.style.transform = `translate(${px}px, ${py}px) scale(${scale})`;
    zoomLabel.textContent = `${Math.round(scale * 100)}%`;
    win.store.set("scale", scale);
    win.store.set("px", px);
    win.store.set("py", py);
  };
  const zoomBy = (f: number): void => {
    scale = Math.min(8, Math.max(0.1, scale * f));
    if (scale <= 1) { px = 0; py = 0; }
    apply();
  };

  const stage = el("div", { cls: "ph-stage" }, [img]);
  img.addEventListener("pointerdown", (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    img.setPointerCapture(e.pointerId);
    const sx = e.clientX - px, sy = e.clientY - py;
    const onMove = (ev: PointerEvent): void => {
      px = ev.clientX - sx;
      py = ev.clientY - sy;
      apply();
    };
    const onUp = (): void => {
      img.removeEventListener("pointermove", onMove);
      img.removeEventListener("pointerup", onUp);
    };
    img.addEventListener("pointermove", onMove);
    img.addEventListener("pointerup", onUp);
  });
  stage.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12);
  }, { passive: false });

  const bar = el("div", { cls: "ph-bar" }, [
    el("button", { cls: "fx-btn", children: [el("span", { text: "−" })], on: { click: () => zoomBy(1 / 1.25) } }),
    zoomLabel,
    el("button", { cls: "fx-btn", children: [el("span", { text: "+" })], on: { click: () => zoomBy(1.25) } }),
    el("button", { cls: "fx-btn wide", children: [el("span", { text: tt("适应", "Fit") })], on: { click: () => { scale = 1; px = 0; py = 0; apply(); } } }),
    el("button", { cls: "fx-btn wide", children: [el("span", { text: "1:1" })], on: { click: () => { scale = 1; px = 0; py = 0; apply(); } } }),
  ]);

  apply();
  win.body.replaceChildren(el("div", { cls: "ph" }, [bar, stage]));
}

export const photosApp: AppDef = {
  id: "photos",
  zh: "照片",
  en: "Photos",
  icon: "photos",
  tile: "linear-gradient(135deg,#5B6B7E,#425062)",
  w: 760, h: 540, minW: 380, minH: 280,
  render,
};
