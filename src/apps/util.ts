/* ============================================================
   util.ts — shared helpers for apps (auto-cleanup listeners, tiles)
   ============================================================ */

import type { AppWindow } from "../os/types";

export interface Disposer {
  on(target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions): void;
  timer(id: number): void;
  disposeAll(): void;
}

/** Create an auto-cleanup listener kit; re-calling disposes the previous set. */
export function makeDispose(win: AppWindow): Disposer {
  const prev = win.store.get("dispose") as (() => void)[] | undefined;
  prev?.forEach((f) => f());
  const fns: (() => void)[] = [];
  win.store.set("dispose", fns);
  return {
    on(target, type, fn, opts) {
      target.addEventListener(type, fn, opts);
      fns.push(() => target.removeEventListener(type, fn, opts));
    },
    timer(id) {
      fns.push(() => clearTimeout(id));
    },
    disposeAll() {
      fns.forEach((f) => f());
      fns.length = 0;
    },
  };
}

export function str(win: AppWindow, key: string, def: string): string {
  const v = win.store.get(key);
  return typeof v === "string" ? v : def;
}

export function num(win: AppWindow, key: string, def: number): number {
  const v = win.store.get(key);
  return typeof v === "number" ? v : def;
}

export function bool(win: AppWindow, key: string, def: boolean): boolean {
  const v = win.store.get(key);
  return typeof v === "boolean" ? v : def;
}
