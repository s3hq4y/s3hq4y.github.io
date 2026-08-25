/* ============================================================
   menu.ts — reusable context menu
   ============================================================ */

import { el } from "./dom";
import { icon, type IconName } from "./icons";

export interface MenuItem {
  icon?: IconName;
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  separator?: boolean;
}

let current: HTMLElement | null = null;

export function closeMenu(): void {
  current?.remove();
  current = null;
}

export function showMenu(x: number, y: number, items: MenuItem[]): void {
  closeMenu();
  const menu = el("div", { cls: "ctx-menu" });
  for (const it of items) {
    if (it.separator) {
      menu.append(el("div", { cls: "ctx-sep" }));
      continue;
    }
    menu.append(
      el("button", {
        cls: "ctx-item" + (it.danger ? " danger" : "") + (it.disabled ? " disabled" : ""),
        ...(it.disabled ? {} : { on: { click: () => { closeMenu(); it.onClick?.(); } } }),
        children: [
          el("span", { cls: "ctx-ic", html: it.icon ? icon(it.icon, 15) : "" }),
          el("span", { cls: "ctx-label", text: it.label }),
        ],
      }),
    );
  }
  document.body.append(menu);
  const w = menu.offsetWidth, h = menu.offsetHeight;
  menu.style.left = `${Math.min(x, innerWidth - w - 8)}px`;
  menu.style.top = `${Math.min(y, innerHeight - h - 8)}px`;
  requestAnimationFrame(() => menu.classList.add("show"));
  current = menu;

  const onDocDown = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) closeMenu();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeMenu();
  };
  const onWinBlur = () => closeMenu();
  document.addEventListener("pointerdown", onDocDown, true);
  document.addEventListener("keydown", onKey, true);
  window.addEventListener("blur", onWinBlur);
  window.addEventListener("resize", closeMenu);
  const observer = new MutationObserver(() => {
    if (!document.body.contains(menu)) cleanup();
  });
  observer.observe(document.body, { childList: true });
  function cleanup(): void {
    document.removeEventListener("pointerdown", onDocDown, true);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("blur", onWinBlur);
    window.removeEventListener("resize", closeMenu);
    observer.disconnect();
  }
  menu.addEventListener("remove", cleanup); // not standard; observer covers it
}
