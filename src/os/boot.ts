/* ============================================================
   boot.ts — boot animation, lock screen, shutdown screen
   ============================================================ */

import { el } from "./dom";
import { icon } from "./icons";
import { tt, fmtTime, fmtDate, fmtWeekday, getLang } from "./i18n";
import { getSettings } from "./settings";

let lockEl: HTMLElement | null = null;
let bootEl: HTMLElement | null = null;
let shutdownEl: HTMLElement | null = null;
let lockClock: HTMLElement | null = null;
let lockDate: HTMLElement | null = null;
let lockTimer = 0;
let unlockedThisSession = false;

function tickLock(): void {
  if (!lockClock || !lockDate) return;
  const now = new Date();
  lockClock.textContent = fmtTime(now, getSettings().hour12);
  lockDate.textContent = `${fmtWeekday(now)} · ${fmtDate(now, true)}`;
}

export function playBoot(onReady: () => void): void {
  bootEl = el("div", { id: "boot", cls: "boot" }, [
    el("div", { cls: "boot-logo", html: icon("debian", 64) }),
    el("div", { cls: "boot-name", text: "s9y OS" }),
    el("div", { cls: "boot-spinner" }, [el("div", { cls: "boot-dot d1" }), el("div", { cls: "boot-dot d2" }), el("div", { cls: "boot-dot d3" }), el("div", { cls: "boot-dot d4" }), el("div", { cls: "boot-dot d5" })]),
    el("div", { cls: "boot-hint", text: tt("TypeScript · 无依赖", "TypeScript · zero-dependency") }),
  ]);
  document.body.append(bootEl);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => {
    bootEl?.classList.add("hide");
    window.setTimeout(() => bootEl?.remove(), 500);
    showLock(onReady);
  }, reduced ? 400 : 1700);
}

export function showLock(onUnlock?: () => void): void {
  hideLock();
  lockEl = el("div", { id: "lock", cls: "lock" }, [
    el("div", { id: "lock-bg", cls: "lock-bg" }),
    el("div", { cls: "lock-inner" }, [
      el("div", { cls: "lock-clock-row" }, [
        el("div", { cls: "lock-clock" }),
        el("div", { cls: "lock-date" }),
      ]),
      el("div", { cls: "lock-foot" }, [
        el("div", { cls: "lock-user", html: icon("user", 22) }),
        el("div", { cls: "lock-user-name", text: getSettings().user }),
        el("div", { cls: "lock-hint", text: tt("点击任意处解锁 · Click anywhere to unlock", "点击任意处解锁 · Click anywhere to unlock") }),
      ]),
    ]),
  ]);
  document.body.append(lockEl);
  lockClock = lockEl.querySelector(".lock-clock");
  lockDate = lockEl.querySelector(".lock-date");
  tickLock();
  lockTimer = window.setInterval(tickLock, 1000);

  const unlock = (): void => {
    hideLock();
    if (!unlockedThisSession) {
      unlockedThisSession = true;
      onUnlock?.();
    }
    window.dispatchEvent(new Event("os-unlocked"));
  };
  lockEl.addEventListener("click", unlock, { once: true });
  const onKey = (e: KeyboardEvent): void => {
    e.preventDefault();
    unlock();
    document.removeEventListener("keydown", onKey, true);
  };
  document.addEventListener("keydown", onKey, { once: true, capture: true });
}

export function lockNow(): void {
  showLock();
}

function hideLock(): void {
  clearInterval(lockTimer);
  lockEl?.remove();
  lockEl = null;
}

export function shutdownScreen(): void {
  if (shutdownEl) return;
  shutdownEl = el("div", { id: "shutdown", cls: "shutdown" }, [
    el("div", { cls: "shutdown-icon", html: icon("power", 44) }),
    el("div", { cls: "shutdown-text", text: tt("正在关机…", "Shutting down…") }),
    el("div", { cls: "shutdown-hint", text: tt("点击任意处重新启动", "Click anywhere to restart") }),
  ]);
  document.body.append(shutdownEl);
  requestAnimationFrame(() => shutdownEl?.classList.add("show"));
  window.setTimeout(() => {
    const t = shutdownEl?.querySelector(".shutdown-text");
    if (t) t.textContent = tt("再见 👋", "Goodbye 👋");
  }, 1600);
  shutdownEl.addEventListener("click", () => location.reload());
}

export function initBootEvents(): void {
  window.addEventListener("os-shutdown", () => shutdownScreen());
  window.addEventListener("os-lock", () => lockNow());
  window.addEventListener("os-reboot", () => location.reload());
  void getLang;
}
