/* ============================================================
   wm.ts — window manager: drag, resize, snap, focus, min/max
   ============================================================ */

import { el, rafThrottle } from "./dom";
import { icon } from "./icons";
import type { AppDef, AppProvider, AppWindow } from "./types";

interface WinState {
  win: OSWindowImpl;
  normal: { x: number; y: number; w: number; h: number }; // last normal (unmaximized) rect
}

class OSWindowImpl implements AppWindow {
  readonly el: HTMLElement;
  readonly body: HTMLElement;
  readonly store = new Map<string, unknown>();
  private titleText = "";
  private titleEl: HTMLElement;
  private iconEl: HTMLElement;

  constructor(
    readonly id: number,
    readonly appId: string,
    private readonly wm: WindowManager,
    app: AppDef,
  ) {
    this.el = el("section", { cls: "window", attrs: { role: "dialog", "aria-label": app.zh } });
    const bar = el("header", { cls: "win-titlebar" });
    this.iconEl = el("span", { cls: "win-icon", html: icon(app.icon, 16) });
    this.titleEl = el("span", { cls: "win-title-text" });
    bar.append(
      el("div", { cls: "win-title" }, [this.iconEl, this.titleEl]),
      el("div", {
        cls: "win-controls",
        children: [
          el("button", { cls: "wc wc-min", html: icon("minimize", 14), title: "Minimize", on: { click: () => this.wm.minimize(this.id) } }),
          el("button", { cls: "wc wc-max", html: icon("maximize", 13), title: "Maximize", on: { click: () => this.wm.toggleMax(this.id) } }),
          el("button", { cls: "wc wc-close", html: icon("close", 13), title: "Close", on: { click: () => this.wm.close(this.id) } }),
        ],
      }),
    );
    this.body = el("div", { cls: "win-body" });
    this.el.append(bar, this.body);
    bar.addEventListener("pointerdown", () => this.wm.focus(this.id));
    this.body.addEventListener("pointerdown", () => this.wm.focus(this.id));
    bar.addEventListener("dblclick", (e) => {
      if ((e.target as HTMLElement).closest(".wc")) return;
      this.wm.toggleMax(this.id);
    });
  }

  mount(parent: HTMLElement): void {
    parent.append(this.el);
  }

  setTitle(title: string): void {
    this.titleText = title;
    this.titleEl.textContent = title;
    this.el.setAttribute("aria-label", title);
    this.wm.dispatchChange();
  }

  get title(): string {
    return this.titleText;
  }

  setAppTitle(): void {
    // default title: app name (already bilingual upstream)
    this.setTitle(this.titleText || "");
  }

  close(): void {
    this.wm.close(this.id);
  }

  get iconHtml(): string {
    return this.iconEl.innerHTML;
  }
}

export interface OpenWinInfo {
  id: number;
  appId: string;
  title: string;
  minimized: boolean;
  focused: boolean;
}

class WindowManager {
  private wins: WinState[] = [];
  private nextId = 1;
  private zTop = 100;
  private provider: AppProvider | null = null;
  private layer: HTMLElement | null = null;
  private snapPreview: HTMLElement | null = null;
  private focusedId: number | null = null;
  private cascade = 0;

  setAppProvider(fn: AppProvider): void {
    this.provider = fn;
  }

  setLayer(layer: HTMLElement, snapPreview: HTMLElement): void {
    this.layer = layer;
    this.snapPreview = snapPreview;
    layer.addEventListener("pointerdown", (e) => {
      // clicking window layer empty space focuses nothing (blur active)
      if (e.target === layer) this.setFocus(null);
    });
  }

  open(appId: string, arg?: unknown): OSWindowImpl | null {
    const app = this.provider?.(appId);
    if (!app || !this.layer) return null;
    if (app.singleton) {
      const existing = this.wins.find((w) => w.win.appId === appId);
      if (existing) {
        this.restore(existing.win.id);
        this.focus(existing.win.id);
        return existing.win;
      }
    }
    const win = new OSWindowImpl(this.nextId++, appId, this, app);
    const area = this.area();
    const w = Math.min(app.w, area.width - 24);
    const h = Math.min(app.h, area.height - 24);
    const off = (this.cascade++ % 6) * 28;
    const x = Math.max(8, Math.min(area.width - w - 8, Math.round((area.width - w) / 2) - 90 + off));
    const y = Math.max(8, Math.min(area.height - h - 8, Math.round((area.height - h) / 2) - 48 + off));
    Object.assign(win.el.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    win.mount(this.layer);
    if (arg !== undefined) win.store.set("openArg", arg);
    this.wins.push({ win, normal: { x, y, w, h } });
    this.attachDrag(win);
    this.attachResize(win, app);
    this.focus(win.id);
    win.el.classList.add("anim-open");
    win.el.addEventListener("animationend", () => win.el.classList.remove("anim-open"), { once: true });
    try {
      app.render(win);
    } catch (err) {
      console.error(`app ${appId} render failed`, err);
    }
    this.dispatchChange();
    return win;
  }

  area(): { width: number; height: number } {
    return this.layer
      ? { width: this.layer.clientWidth, height: this.layer.clientHeight }
      : { width: innerWidth, height: innerHeight - 48 };
  }

  focus(id: number): void {
    this.setFocus(id);
  }

  private setFocus(id: number | null): void {
    this.focusedId = id;
    for (const w of this.wins) {
      const active = w.win.id === id;
      w.win.el.classList.toggle("focused", active);
      if (active) w.win.el.style.zIndex = String(++this.zTop);
    }
    this.dispatchChange();
  }

  focused(): number | null {
    return this.focusedId;
  }

  list(): OpenWinInfo[] {
    return this.wins.map((w) => ({
      id: w.win.id,
      appId: w.win.appId,
      title: w.win.title,
      minimized: w.win.el.classList.contains("minimized"),
      focused: this.focusedId === w.win.id,
    }));
  }

  winsOf(appId: string): OSWindowImpl[] {
    return this.wins.filter((w) => w.win.appId === appId).map((w) => w.win);
  }

  byId(id: number): OSWindowImpl | undefined {
    return this.wins.find((w) => w.win.id === id)?.win;
  }

  close(id: number): void {
    const idx = this.wins.findIndex((w) => w.win.id === id);
    if (idx < 0) return;
    const { win } = this.wins[idx];
    const app = this.provider?.(win.appId);
    try {
      app?.onClose?.(win);
    } catch (err) {
      console.error("onClose failed", err);
    }
    win.el.classList.add("anim-close");
    const finish = () => {
      win.el.remove();
      this.wins = this.wins.filter((w) => w.win.id !== id);
      if (this.focusedId === id) {
        const top = [...this.wins]
          .filter((w) => !w.win.el.classList.contains("minimized"))
          .sort((a, b) => Number(b.win.el.style.zIndex) - Number(a.win.el.style.zIndex))[0];
        this.setFocus(top ? top.win.id : null);
      } else this.dispatchChange();
    };
    win.el.addEventListener("animationend", finish, { once: true });
    window.setTimeout(finish, 260); // safety net
  }

  minimize(id: number): void {
    const w = this.byId(id);
    if (!w) return;
    w.el.classList.add("anim-min");
    w.el.addEventListener(
      "animationend",
      () => {
        w.el.classList.remove("anim-min");
        w.el.classList.add("minimized");
        if (this.focusedId === id) {
          const top = [...this.wins]
            .filter((x) => x.win.id !== id && !x.win.el.classList.contains("minimized"))
            .sort((a, b) => Number(b.win.el.style.zIndex) - Number(a.win.el.style.zIndex))[0];
          this.setFocus(top ? top.win.id : null);
        }
        this.dispatchChange();
      },
      { once: true },
    );
  }

  restore(id: number): void {
    const w = this.byId(id);
    if (!w) return;
    if (w.el.classList.contains("minimized")) {
      w.el.classList.remove("minimized");
      w.el.classList.add("anim-open");
      w.el.addEventListener("animationend", () => w.el.classList.remove("anim-open"), { once: true });
    }
    this.dispatchChange();
  }

  toggleMax(id: number): void {
    const w = this.byId(id);
    if (!w || !this.layer) return;
    const st = this.state(id);
    const area = this.area();
    if (this.isMax(id)) {
      const { x, y, w: ww, h: hh } = st.normal;
      Object.assign(w.el.style, { left: `${x}px`, top: `${y}px`, width: `${ww}px`, height: `${hh}px` });
      w.el.classList.remove("maximized");
    } else {
      st.normal = this.rect(id);
      Object.assign(w.el.style, { left: "0px", top: "0px", width: `${area.width}px`, height: `${area.height}px` });
      w.el.classList.add("maximized");
    }
    w.el.classList.add("anim-frame");
    w.el.addEventListener("animationend", () => w.el.classList.remove("anim-frame"), { once: true });
    window.dispatchEvent(new Event("wm-resize"));
    this.dispatchChange();
  }

  isMax(id: number): boolean {
    return this.byId(id)?.el.classList.contains("maximized") ?? false;
  }

  private rect(id: number): { x: number; y: number; w: number; h: number } {
    const w = this.byId(id)!;
    const s = w.el.style;
    return { x: parseFloat(s.left) || 0, y: parseFloat(s.top) || 0, w: parseFloat(s.width) || 0, h: parseFloat(s.height) || 0 };
  }

  private state(id: number): WinState {
    return this.wins.find((w) => w.win.id === id)!;
  }

  dispatchChange(): void {
    window.dispatchEvent(new CustomEvent("wm-changed"));
  }

  /* ---------------- dragging + snap ---------------- */

  private attachDrag(win: OSWindowImpl): void {
    const bar = win.el.querySelector<HTMLElement>(".win-titlebar")!;
    type Snap = "left" | "right" | "top" | null;
    let snap: Snap = null;

    bar.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest(".wc")) return;
      if (e.button !== 0) return;
      const area = this.area();
      const st = this.state(win.id);
      let rect = this.rect(win.id);
      const wasMax = this.isMax(win.id);

      // when dragging a maximized window, restore it under the pointer
      if (wasMax) {
        const ratio = (e.clientX - rect.x) / Math.max(1, rect.w);
        this.toggleMax(win.id);
        rect = this.rect(win.id);
        const nx = e.clientX - rect.w * ratio;
        Object.assign(win.el.style, { left: `${nx}px`, top: `${Math.max(0, e.clientY - 22)}px` });
        rect = this.rect(win.id);
        st.normal = rect;
      } else st.normal = rect;

      const grabDx = e.clientX - rect.x;
      const grabDy = e.clientY - rect.y;
      bar.setPointerCapture(e.pointerId);
      win.el.classList.add("dragging");

      const move = rafThrottle((mx: number, my: number) => {
        const x = mx - grabDx;
        const y = my - grabDy;
        win.el.style.left = `${Math.min(Math.max(x, -rect.w + 90), area.width - 90)}px`;
        win.el.style.top = `${Math.min(Math.max(y, 0), area.height - 44)}px`;
        // snap detection
        const next: Snap = mx <= 6 ? "left" : mx >= area.width - 6 ? "right" : my <= 4 ? "top" : null;
        if (next !== snap) {
          snap = next;
          this.showSnapPreview(snap, area);
        }
      });

      const onMove = (ev: PointerEvent) => move(ev.clientX, ev.clientY);
      const onUp = (ev: PointerEvent) => {
        bar.removeEventListener("pointermove", onMove);
        bar.removeEventListener("pointerup", onUp);
        bar.removeEventListener("pointercancel", onUp);
        win.el.classList.remove("dragging");
        this.hideSnapPreview();
        if (snap === "top") {
          if (!this.isMax(win.id)) this.toggleMax(win.id);
        } else if (snap) {
          st.normal = this.rect(win.id);
          const halfW = Math.round(area.width / 2);
          Object.assign(win.el.style, {
            left: snap === "left" ? "0px" : `${area.width - halfW}px`,
            top: "0px",
            width: `${halfW}px`,
            height: `${area.height}px`,
          });
          win.el.classList.add("snapped");
          window.dispatchEvent(new Event("wm-resize"));
        }
        void ev;
      };
      bar.addEventListener("pointermove", onMove);
      bar.addEventListener("pointerup", onUp);
      bar.addEventListener("pointercancel", onUp);
    });
  }

  private showSnapPreview(snap: "left" | "right" | "top" | null, area: { width: number; height: number }): void {
    if (!this.snapPreview) return;
    if (!snap) {
      this.snapPreview.classList.remove("show");
      return;
    }
    const s = this.snapPreview.style;
    if (snap === "top") {
      Object.assign(s, { left: "0px", top: "0px", width: `${area.width}px`, height: `${area.height}px` });
    } else {
      const halfW = Math.round(area.width / 2);
      Object.assign(s, {
        left: snap === "left" ? "0px" : `${area.width - halfW}px`,
        top: "0px",
        width: `${halfW}px`,
        height: `${area.height}px`,
      });
    }
    this.snapPreview.classList.add("show");
  }

  private hideSnapPreview(): void {
    this.snapPreview?.classList.remove("show");
  }

  /* ---------------- resize ---------------- */

  private attachResize(win: OSWindowImpl, app: AppDef): void {
    const dirs = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;
    for (const d of dirs) {
      const h = el("div", { cls: `rz rz-${d}` });
      win.el.append(h);
      h.addEventListener("pointerdown", (e) => {
        if (this.isMax(win.id) || win.el.classList.contains("snapped")) {
          win.el.classList.remove("snapped");
        }
        if (this.isMax(win.id)) return;
        e.preventDefault();
        h.setPointerCapture(e.pointerId);
        const start = this.rect(win.id);
        const sx = e.clientX, sy = e.clientY;
        const minW = app.minW ?? 320, minH = app.minH ?? 200;
        const area = this.area();
        const onMove = rafThrottle((mx: number, my: number) => {
          let { x, y, w, h: hh } = start;
          const dx = mx - sx, dy = my - sy;
          if (d.includes("e")) w = Math.max(minW, start.w + dx);
          if (d.includes("s")) hh = Math.max(minH, start.h + dy);
          if (d.includes("w")) {
            w = Math.max(minW, start.w - dx);
            x = start.x + (start.w - w);
          }
          if (d.includes("n")) {
            hh = Math.max(minH, start.h - dy);
            y = start.y + (start.h - hh);
          }
          Object.assign(win.el.style, {
            left: `${Math.max(-w + 90, Math.min(x, area.width - 90))}px`,
            top: `${Math.max(0, Math.min(y, area.height - 44))}px`,
            width: `${w}px`,
            height: `${Math.min(hh, area.height)}px`,
          });
        });
        const onMoveEv = (ev: PointerEvent) => onMove(ev.clientX, ev.clientY);
        const onUp = () => {
          h.removeEventListener("pointermove", onMoveEv);
          h.removeEventListener("pointerup", onUp);
          h.removeEventListener("pointercancel", onUp);
          this.state(win.id).normal = this.rect(win.id);
          window.dispatchEvent(new Event("wm-resize"));
        };
        h.addEventListener("pointermove", onMoveEv);
        h.addEventListener("pointerup", onUp);
        h.addEventListener("pointercancel", onUp);
      });
    }
  }

  /** Re-render every open window (used on language change). */
  rerenderAll(): void {
    for (const w of this.wins) {
      const app = this.provider?.(w.win.appId);
      if (!app) continue;
      try {
        w.win.body.replaceChildren();
        app.render(w.win);
      } catch (err) {
        console.error("rerender failed", err);
      }
    }
  }

  onChange(fn: () => void): void {
    window.addEventListener("wm-changed", fn);
  }
}

export const wm = new WindowManager();
