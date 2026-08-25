/* ============================================================
   notifications.ts — toast notifications + history for action center
   ============================================================ */

import { el } from "./dom";
import { icon, type IconName } from "./icons";

export interface Notif {
  id: number;
  title: string;
  body: string;
  icon: IconName;
  time: Date;
}

const list: Notif[] = [];
let nextId = 1;
let toastLayer: HTMLElement | null = null;

export function setToastLayer(l: HTMLElement): void {
  toastLayer = l;
}

export function notifications(): readonly Notif[] {
  return list;
}

export function clearNotifications(): void {
  list.length = 0;
  window.dispatchEvent(new Event("os-notifs"));
}

export function removeNotification(id: number): void {
  const i = list.findIndex((n) => n.id === id);
  if (i >= 0) list.splice(i, 1);
  window.dispatchEvent(new Event("os-notifs"));
}

export function notify(title: string, body: string, ic: IconName = "info"): void {
  const n: Notif = { id: nextId++, title, body, icon: ic, time: new Date() };
  list.unshift(n);
  if (list.length > 30) list.pop();
  window.dispatchEvent(new Event("os-notifs"));
  if (!toastLayer) return;
  const toast = el("div", { cls: "toast anim-toast-in" }, [
    el("span", { cls: "toast-ic", html: icon(ic, 18) }),
    el("div", { cls: "toast-text" }, [
      el("div", { cls: "toast-title", text: title }),
      el("div", { cls: "toast-body", text: body }),
    ]),
    el("button", {
      cls: "toast-x", html: icon("close", 12),
      on: { click: () => dismiss() },
    }),
  ]);
  toastLayer.append(toast);
  let gone = false;
  const dismiss = () => {
    if (gone) return;
    gone = true;
    toast.classList.add("anim-toast-out");
    window.setTimeout(() => toast.remove(), 300);
  };
  window.setTimeout(dismiss, 4200);
  toast.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest(".toast-x")) return;
    dismiss();
  });
}
