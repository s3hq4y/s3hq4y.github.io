/* ============================================================
   clockapp.ts — world clock + stopwatch
   ============================================================ */

import { el } from "../os/dom";
import { tt, getLang } from "../os/i18n";
import type { AppDef, AppWindow } from "../os/types";
import { makeDispose, bool, num, str } from "./util";

const ZONES: { tz: string; zh: string; en: string }[] = [
  { tz: "local", zh: "本地时间", en: "Local time" },
  { tz: "Europe/Berlin", zh: "法兰克福", en: "Frankfurt" },
  { tz: "Europe/London", zh: "伦敦", en: "London" },
  { tz: "America/Los_Angeles", zh: "西雅图", en: "Seattle" },
  { tz: "Asia/Shanghai", zh: "上海", en: "Shanghai" },
  { tz: "Asia/Tokyo", zh: "东京", en: "Tokyo" },
];

function render(win: AppWindow): void {
  const d = makeDispose(win);
  const tab = str(win, "tab", "world");
  win.store.set("tab", tab);
  win.setTitle(tt("时钟", "Clock"));

  const tabs = el("div", { cls: "ck-tabs" }, [
    el("button", { cls: "ck-tab" + (tab === "world" ? " cur" : ""), text: tt("世界时钟", "World clock"), on: { click: () => { win.store.set("tab", "world"); render(win); } } }),
    el("button", { cls: "ck-tab" + (tab === "sw" ? " cur" : ""), text: tt("秒表", "Stopwatch"), on: { click: () => { win.store.set("tab", "sw"); render(win); } } }),
  ]);

  const pane = el("div", { cls: "ck-pane" });

  if (tab === "world") {
    const locale = getLang() === "zh" ? "zh-CN" : "en-US";
    const rows = ZONES.map((z) => {
      const time = el("div", { cls: "ck-time" });
      const date = el("div", { cls: "ck-date" });
      const row = el("div", { cls: "ck-row" }, [
        el("div", { cls: "ck-city" }, [
          el("div", { cls: "ck-city-name", text: tt(z.zh, z.en) }),
          el("div", { cls: "ck-tz", text: z.tz === "local" ? Intl.DateTimeFormat().resolvedOptions().timeZone : z.tz }),
        ]),
        el("div", { cls: "ck-right" }, [time, date]),
      ]);
      return { z, time, date, row };
    });
    pane.append(...rows.map((r) => r.row));
    const update = (): void => {
      const now = new Date();
      for (const r of rows) {
        const opt: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: r.z.tz === "local" ? undefined : r.z.tz };
        r.time.textContent = new Intl.DateTimeFormat(locale, opt).format(now);
        r.date.textContent = new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", timeZone: r.z.tz === "local" ? undefined : r.z.tz }).format(now);
      }
    };
    update();
    d.timer(window.setInterval(update, 1000));
  } else {
    /* stopwatch */
    let running = bool(win, "swRun", false);
    let accMs = num(win, "swAcc", 0);
    let startTs = num(win, "swStart", 0);
    const laps = (win.store.get("laps") as number[]) ?? [];
    win.store.set("laps", laps);

    const disp = el("div", { cls: "sw-disp", text: "00:00.00" });
    const lapList = el("div", { cls: "sw-laps" });
    const fmt = (ms: number): string => {
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const cs = Math.floor((ms % 1000) / 10);
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
    };
    const paintLaps = (): void => {
      lapList.replaceChildren(
        ...laps.map((l, i) => el("div", { cls: "sw-lap" }, [
          el("span", { text: `#${laps.length - i}` }),
          el("span", { text: fmt(l) }),
        ])).reverse(),
      );
    };
    paintLaps();

    const btnStart = el("button", { cls: "btn btn-accent" });
    const btnLap = el("button", { cls: "btn" });
    const btnReset = el("button", { cls: "btn" });
    const paintBtns = (): void => {
      btnStart.textContent = running ? tt("暂停", "Pause") : tt("开始", "Start");
      btnLap.textContent = tt("计次", "Lap");
      btnReset.textContent = tt("重置", "Reset");
    };
    paintBtns();

    const total = (): number => accMs + (running ? Date.now() - startTs : 0);
    const update = (): void => {
      disp.textContent = fmt(total());
      win.store.set("swAcc", accMs);
      win.store.set("swRun", running);
      win.store.set("swStart", startTs);
    };
    update();

    btnStart.addEventListener("click", () => {
      running = !running;
      if (running) startTs = Date.now();
      else accMs = total();
      paintBtns();
      update();
    });
    btnLap.addEventListener("click", () => {
      if (total() > 0) { laps.unshift(total()); paintLaps(); }
    });
    btnReset.addEventListener("click", () => {
      running = false;
      accMs = 0;
      laps.length = 0;
      paintLaps();
      paintBtns();
      update();
    });

    pane.append(
      disp,
      el("div", { cls: "sw-btns" }, [btnStart, btnLap, btnReset]),
      lapList,
    );
    d.timer(window.setInterval(() => {
      if (running) update();
    }, 33));
  }

  win.body.replaceChildren(el("div", { cls: "ck" }, [tabs, pane]));
}

export const clockApp: AppDef = {
  id: "clock",
  zh: "时钟",
  en: "Clock",
  icon: "clock",
  tile: "linear-gradient(135deg,#4D9DE0,#2F6FB2)",
  w: 560, h: 520, minW: 380, minH: 380,
  singleton: true,
  render,
  onClose: (win) => (win.store.get("dispose") as (() => void)[] | undefined)?.forEach((f) => f()),
};
