/* ============================================================
   taskbar.ts — taskbar, start menu, tray flyouts, search
   ============================================================ */

import { el, clear } from "./dom";
import { icon, type IconName } from "./icons";
import { tt, getLang, setLang, fmtTime, fmtDate, fmtWeekday } from "./i18n";
import { getSettings, patchSettings } from "./settings";
import { wm } from "./wm";
import { showMenu, closeMenu } from "./menu";
import { notifications, clearNotifications, removeNotification } from "./notifications";
import { APPS, getApp, searchApps } from "../apps/registry";
import type { AppDef } from "./types";

const PINNED = ["files", "terminal", "notepad", "calc"];

let bar: HTMLElement | null = null;
let panels: HTMLElement | null = null;
let openPanelId: string | null = null;
let openTrigger: HTMLElement | null = null;
let clockEl: HTMLElement | null = null;
let dateEl: HTMLElement | null = null;
let searchInput: HTMLInputElement | null = null;
let calMonth = new Date();
calMonth.setDate(1);

interface PanelSpec {
  id: string;
  anchor: "left" | "right";
  offsetLeft?: number;
  build: () => HTMLElement;
}

/* ---------------- panel manager ---------------- */

function closePanels(): void {
  if (!panels) return;
  panels.replaceChildren();
  openPanelId = null;
  openTrigger?.classList.remove("active");
  openTrigger = null;
  if (searchInput) searchInput.value = "";
}

function togglePanel(spec: PanelSpec, trigger: HTMLElement): void {
  if (openPanelId === spec.id) {
    closePanels();
    return;
  }
  closePanels();
  closeMenu();
  const p = spec.build();
  p.classList.add("panel", spec.anchor);
  p.style.left = spec.anchor === "left" ? `${spec.offsetLeft ?? 6}px` : "";
  p.style.right = spec.anchor === "right" ? "6px" : "";
  panels?.append(p);
  requestAnimationFrame(() => p.classList.add("show"));
  openPanelId = spec.id;
  openTrigger = trigger;
  trigger.classList.add("active");
}

function isPanelClick(target: Node): boolean {
  if (!panels) return false;
  return panels.contains(target) || (openTrigger?.contains(target) ?? false);
}

/* ---------------- start menu ---------------- */

function buildStart(): HTMLElement {
  const menu = el("div", { cls: "start" });
  const grid = el("div", { cls: "start-grid" });
  for (const app of APPS) {
    grid.append(
      el("button", {
        cls: "start-tile",
        children: [
          el("span", { cls: "start-tile-ic", style: { background: app.tile }, html: icon(app.icon, 26) }),
          el("span", { cls: "start-tile-name", text: tt(app.zh, app.en) }),
        ],
        on: { click: () => { closePanels(); wm.open(app.id); } },
      }),
    );
  }
  const power = el("button", { cls: "tb-ic-btn", html: icon("power", 16), title: tt("电源", "Power") });
  power.addEventListener("click", (e) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    showMenu(r.left, r.top - 130, [
      { icon: "lock", label: tt("锁定", "Lock"), onClick: () => { closePanels(); window.dispatchEvent(new Event("os-lock")); } },
      { icon: "restart", label: tt("重启", "Restart"), onClick: () => window.dispatchEvent(new Event("os-reboot")) },
      { icon: "power", label: tt("关机", "Shut down"), danger: true, onClick: () => { closePanels(); window.dispatchEvent(new Event("os-shutdown")); } },
    ]);
  });
  menu.append(
    el("div", { cls: "start-head" }, [
      el("div", { cls: "start-user" }, [
        el("span", { cls: "start-avatar", html: icon("user", 15) }),
        el("span", { cls: "start-username", text: getSettings().user }),
      ]),
      power,
    ]),
    grid,
    el("div", { cls: "start-foot", text: tt("s9y OS 1.0 · TypeScript", "s9y OS 1.0 · TypeScript") }),
  );
  return menu;
}

/* ---------------- search ---------------- */

function buildSearchResults(query: string): HTMLElement {
  const wrap = el("div", { cls: "search-pop" });
  const results = searchApps(query);
  if (!results.length) {
    wrap.append(el("div", { cls: "search-empty", text: tt("没有匹配的应用", "No matching apps") }));
    return wrap;
  }
  results.forEach((app, i) => {
    wrap.append(
      el("button", {
        cls: "search-row" + (i === 0 ? " first" : ""),
        children: [
          el("span", { cls: "search-ic", style: { background: app.tile }, html: icon(app.icon, 18) }),
          el("span", { cls: "search-name" }, [
            el("div", { text: tt(app.zh, app.en) }),
            el("div", { cls: "search-sub", text: app.id }),
          ]),
          el("span", { cls: "search-enter", text: i === 0 ? "↵" : "" }),
        ],
        on: { click: () => { closePanels(); wm.open(app.id); } },
      }),
    );
  });
  return wrap;
}

/* ---------------- calendar flyout ---------------- */

function buildCalendar(): HTMLElement {
  const s = getSettings();
  const now = new Date();
  const pane = el("div", { cls: "cal" });
  pane.append(
    el("div", { cls: "cal-big", text: fmtTime(now, s.hour12) }),
    el("div", { cls: "cal-date", text: `${fmtWeekday(now)} · ${fmtDate(now, true)}` }),
  );

  const grid = el("div", { cls: "cal-grid" });
  const header = el("div", { cls: "cal-head" });
  const title = el("span", {
    cls: "cal-title",
    text: calMonth.toLocaleDateString(getLang() === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "long" }),
  });
  const prev = el("button", { cls: "tb-ic-btn", html: icon("chevronLeft", 13) });
  const next = el("button", { cls: "tb-ic-btn", html: icon("chevronRight", 13) });
  prev.addEventListener("click", () => { calMonth.setMonth(calMonth.getMonth() - 1); refresh(); });
  next.addEventListener("click", () => { calMonth.setMonth(calMonth.getMonth() + 1); refresh(); });
  header.append(prev, title, next);

  const cells = el("div", { cls: "cal-cells" });
  const week = getLang() === "zh" ? ["日", "一", "二", "三", "四", "五", "六"] : ["S", "M", "T", "W", "T", "F", "S"];
  for (const d of week) cells.append(el("span", { cls: "cal-wk", text: d }));

  const fill = (): void => {
    cells.querySelectorAll(".cal-day").forEach((n) => n.remove());
    const y = calMonth.getFullYear(), m = calMonth.getMonth();
    const first = new Date(y, m, 1);
    const startPad = first.getDay();
    const days = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < startPad; i++) cells.append(el("span", { cls: "cal-day pad", text: "" }));
    const today = new Date();
    for (let d = 1; d <= days; d++) {
      const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
      cells.append(el("span", { cls: "cal-day" + (isToday ? " today" : ""), text: String(d) }));
    }
  };
  const refresh = (): void => {
    title.textContent = calMonth.toLocaleDateString(getLang() === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "long" });
    fill();
  };
  fill();
  grid.append(header, cells);
  pane.append(grid);
  return pane;
}

/* ---------------- notification center ---------------- */

function buildNotifCenter(): HTMLElement {
  const pane = el("div", { cls: "nc" });
  const list = notifications();
  const head = el("div", { cls: "nc-head" }, [
    el("span", { text: tt("通知", "Notifications") }),
    list.length ? el("button", { cls: "nc-clear", text: tt("全部清除", "Clear all"), on: { click: () => clearNotifications() } }) : el("span"),
  ]);
  pane.append(head);
  if (!list.length) {
    pane.append(el("div", { cls: "nc-empty", text: tt("没有新通知", "No new notifications") }));
    return pane;
  }
  for (const n of list) {
    pane.append(
      el("div", { cls: "nc-item" }, [
        el("span", { cls: "nc-ic", html: icon(n.icon, 16) }),
        el("div", { cls: "nc-text" }, [
          el("div", { cls: "nc-title", text: n.title }),
          el("div", { cls: "nc-body", text: n.body }),
          el("div", { cls: "nc-time", text: fmtTime(n.time, false) }),
        ]),
        el("button", { cls: "nc-x", html: icon("close", 11), on: { click: (e: Event) => {
          e.stopPropagation();
          removeNotification(n.id);
          refresh();
        } } }),
      ]),
    );
  }
  const refresh = (): void => {
    if (openPanelId === "notif") {
      panels?.replaceChildren();
      const p = buildNotifCenter();
      p.classList.add("panel", "right");
      p.style.right = "6px";
      panels?.append(p);
      requestAnimationFrame(() => p.classList.add("show"));
    }
  };
  return pane;
}

/* ---------------- quick settings (wifi / volume) ---------------- */

function buildQuick(): HTMLElement {
  const pane = el("div", { cls: "qs" });
  const s = getSettings();

  const wifiBtn = el("button", { cls: "qs-tile on" }, [
    el("span", { cls: "qs-tile-ic", html: icon("wifi", 18) }),
    el("span", { cls: "qs-tile-label", text: tt("s9y-WiFi", "s9y-WiFi") }),
  ]);
  wifiBtn.addEventListener("click", () => wifiBtn.classList.toggle("on"));

  const themeBtn = el("button", { cls: "qs-tile" + (s.theme === "dark" ? " on" : "") }, [
    el("span", { cls: "qs-tile-ic", html: icon(s.theme === "dark" ? "moon" : "sun", 18) }),
    el("span", { cls: "qs-tile-label", text: tt("深色模式", "Dark mode") }),
  ]);
  themeBtn.addEventListener("click", () => {
    const next = getSettings().theme === "dark" ? "light" : "dark";
    patchSettings({ theme: next });
    themeBtn.classList.toggle("on", next === "dark");
    themeBtn.querySelector(".qs-tile-ic")!.innerHTML = icon(next === "dark" ? "moon" : "sun", 18);
  });

  const langBtn = el("button", { cls: "qs-tile" }, [
    el("span", { cls: "qs-tile-ic", html: icon("globe", 18) }),
    el("span", { cls: "qs-tile-label", text: getLang() === "zh" ? "中文" : "EN" }),
  ]);
  langBtn.addEventListener("click", () => {
    setLang(getLang() === "zh" ? "en" : "zh");
    closePanels();
  });

  const bright = el("input", { cls: "qs-slider", attrs: { type: "range", min: "30", max: "100", value: "100" } }) as HTMLInputElement;
  bright.addEventListener("input", () => {
    const wp = document.getElementById("wallpaper");
    if (wp) wp.style.filter = `brightness(${Number(bright.value) / 100})`;
  });
  const vol = el("input", { cls: "qs-slider", attrs: { type: "range", min: "0", max: "100", value: "70" } }) as HTMLInputElement;

  pane.append(
    el("div", { cls: "qs-tiles" }, [wifiBtn, themeBtn, langBtn]),
    el("div", { cls: "qs-row" }, [el("span", { cls: "qs-row-ic", html: icon("sun", 15) }), bright]),
    el("div", { cls: "qs-row" }, [el("span", { cls: "qs-row-ic", html: icon("volume", 15) }), vol]),
  );
  return pane;
}

/* ---------------- taskbar ---------------- */

function taskButton(app: AppDef, wins: number[]): HTMLElement {
  const running = wins.length > 0;
  const focused = wm.focused() !== null && wins.includes(wm.focused()!);
  const btn = el("button", {
    cls: "tb-task" + (running ? " running" : "") + (focused ? " active" : ""),
    title: tt(app.zh, app.en),
    html: icon(app.icon, 22),
  });
  btn.addEventListener("click", () => {
    if (!running) {
      wm.open(app.id);
      return;
    }
    const fw = wm.focused();
    if (fw !== null && wins.includes(fw)) wm.minimize(fw);
    else {
      const top = Math.max(...wins);
      wm.restore(top);
      wm.focus(top);
    }
  });
  btn.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const items = [];
    if (running)
      items.push({ icon: "close" as IconName, label: tt("关闭窗口", "Close window"), danger: true, onClick: () => wins.forEach((id) => wm.close(id)) });
    items.push({ icon: app.icon, label: tt(`打开 ${app.zh}`, `Open ${app.en}`), onClick: () => wm.open(app.id) });
    showMenu(e.clientX, e.clientY, items);
  });
  return btn;
}

function renderTasks(): void {
  const holder = bar?.querySelector<HTMLElement>(".tb-tasks");
  if (!holder) return;
  clear(holder);
  const wins = wm.list();
  for (const id of PINNED) {
    const app = getApp(id);
    if (!app) continue;
    holder.append(taskButton(app, wins.filter((w) => w.appId === id).map((w) => w.id)));
  }
  const extra = wins.filter((w) => !PINNED.includes(w.appId));
  for (const w of extra) {
    const app = getApp(w.appId);
    if (!app) continue;
    holder.append(taskButton(app, [w.id]));
  }
}

function renderClock(): void {
  if (!clockEl || !dateEl) return;
  const s = getSettings();
  const now = new Date();
  clockEl.textContent = fmtTime(now, s.hour12);
  dateEl.textContent = fmtDate(now);
}

export function renderTaskbar(): void {
  if (!bar) return;
  renderTasks();
  renderClock();
  const bellBadge = bar.querySelector(".tb-bell .tb-badge");
  if (bellBadge) {
    const n = notifications().length;
    bellBadge.textContent = n ? String(n) : "";
    bellBadge.classList.toggle("has", n > 0);
  }
}

export function initTaskbar(): void {
  bar = el("div", { id: "taskbar", cls: "taskbar" });
  panels = el("div", { id: "panels" });
  document.body.append(panels);

  /* start */
  const startBtn = el("button", { cls: "tb-start", html: icon("logo", 21), title: "s9y OS" });
  startBtn.addEventListener("click", () => togglePanel({ id: "start", anchor: "left", build: buildStart }, startBtn));

  /* search */
  searchInput = el("input", {
    cls: "tb-search-in",
    attrs: { type: "text", placeholder: tt("搜索应用…", "Search apps…"), spellcheck: "false" },
  }) as HTMLInputElement;
  const searchWrap = el("div", { cls: "tb-search" }, [el("span", { cls: "tb-search-ic", html: icon("search", 13) }), searchInput]);
  searchInput.addEventListener("input", () => {
    const q = searchInput!.value;
    if (!q.trim()) { closePanels(); return; }
    const build = (): HTMLElement => buildSearchResults(q);
    if (openPanelId !== "search") {
      closePanels();
      const p = build();
      p.classList.add("panel", "left");
      p.style.left = "52px";
      panels?.append(p);
      requestAnimationFrame(() => p.classList.add("show"));
      openPanelId = "search";
      openTrigger = searchWrap;
      searchInput?.focus();
    } else if (panels) {
      panels.replaceChildren();
      const p = buildSearchResults(q);
      p.classList.add("panel", "left", "show");
      p.style.left = "52px";
      panels.append(p);
    }
  });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = searchApps(searchInput!.value)[0];
      if (first) { closePanels(); wm.open(first.id); }
    } else if (e.key === "Escape") closePanels();
  });

  /* tasks */
  const tasks = el("div", { cls: "tb-tasks" });

  /* tray */
  const tray = el("div", { cls: "tb-tray" });

  const langBtn = el("button", { cls: "tb-ic-btn", html: icon("globe", 15), title: tt("切换语言", "Switch language") });
  langBtn.addEventListener("click", () => { setLang(getLang() === "zh" ? "en" : "zh"); });

  const themeBtn = el("button", { cls: "tb-ic-btn", html: icon(getSettings().theme === "dark" ? "moon" : "sun", 15), title: tt("切换主题", "Toggle theme") });
  themeBtn.addEventListener("click", () => {
    const next = getSettings().theme === "dark" ? "light" : "dark";
    patchSettings({ theme: next });
    themeBtn.innerHTML = icon(next === "dark" ? "moon" : "sun", 15);
  });

  const quickBtn = el("button", { cls: "tb-ic-btn tb-quick", html: icon("wifi", 15) + icon("volume", 15), title: tt("快速设置", "Quick settings") });
  quickBtn.addEventListener("click", () => togglePanel({ id: "quick", anchor: "right", build: buildQuick }, quickBtn));

  const bellBtn = el("button", { cls: "tb-ic-btn tb-bell", html: icon("bell", 15) + el("span", { cls: "tb-badge" }).outerHTML, title: tt("通知", "Notifications") });
  bellBtn.addEventListener("click", () => togglePanel({ id: "notif", anchor: "right", build: buildNotifCenter }, bellBtn));

  clockEl = el("div", { cls: "tb-clock" });
  dateEl = el("div", { cls: "tb-date" });
  const clockBtn = el("button", { cls: "tb-clock-btn" }, [clockEl, dateEl]);
  clockBtn.addEventListener("click", () => togglePanel({ id: "cal", anchor: "right", build: buildCalendar }, clockBtn));

  const showDesk = el("button", { cls: "tb-showdesk", title: tt("显示桌面", "Show desktop") });
  showDesk.addEventListener("click", () => {
    wm.list().forEach((w) => { if (!w.minimized) wm.minimize(w.id); });
  });

  tray.append(langBtn, themeBtn, quickBtn, bellBtn, clockBtn);
  bar.append(startBtn, searchWrap, tasks, tray, showDesk);
  document.body.append(bar);

  /* events */
  document.addEventListener("pointerdown", (e) => {
    if (openPanelId && !isPanelClick(e.target as Node)) closePanels();
  }, true);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openPanelId) closePanels();
  });

  window.setInterval(renderClock, 1000);
  wm.onChange(() => renderTasks());
  window.addEventListener("os-notifs", () => renderTaskbar());
  window.addEventListener("os-settings", () => {
    themeBtn.innerHTML = icon(getSettings().theme === "dark" ? "moon" : "sun", 15);
  });
  window.addEventListener("os-lang", () => {
    searchInput?.setAttribute("placeholder", tt("搜索应用…", "Search apps…"));
    closePanels();
    renderTaskbar();
  });
  window.addEventListener("resize", () => closePanels());

  renderTaskbar();
}
