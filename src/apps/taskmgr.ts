/* ============================================================
   taskmgr.ts — Task Manager (live fake meters, end task)
   ============================================================ */

import { el } from "../os/dom";
import { icon } from "../os/icons";
import { tt } from "../os/i18n";
import { wm } from "../os/wm";
import { getApp } from "./registry";
import type { AppDef, AppWindow } from "../os/types";
import { makeDispose } from "./util";

interface Meter { cpu: number; mem: number }

function render(win: AppWindow): void {
  const d = makeDispose(win);
  win.setTitle(tt("任务管理器", "Task Manager"));

  const canvas = el("canvas", { cls: "tk-canvas", attrs: { width: "600", height: "90" } }) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const hist: number[] = new Array(80).fill(6);
  const meters = new Map<number, Meter>();

  const table = el("div", { cls: "tk-table" });
  const footer = el("div", { cls: "tk-footer" });

  const jitter = (v: number, lo: number, hi: number): number =>
    Math.min(hi, Math.max(lo, v + (Math.random() - 0.5) * 4));

  const tick = (): void => {
    const wins = wm.list();
    for (const w of wins) {
      const m = meters.get(w.id) ?? { cpu: 1 + Math.random() * 4, mem: 40 + Math.random() * 120 };
      m.cpu = w.minimized ? Math.max(0, jitter(m.cpu, 0, 1.5)) : jitter(m.cpu, 0.5, 28);
      m.mem = Math.min(400, Math.max(20, m.mem + (Math.random() - 0.45) * 8));
      meters.set(w.id, m);
    }
    for (const id of [...meters.keys()]) if (!wins.some((w) => w.id === id)) meters.delete(id);

    const totalCpu = Math.min(99, 4 + [...meters.values()].reduce((a, m) => a + m.cpu, 0) / 3);
    const totalMem = 120 + [...meters.values()].reduce((a, m) => a + m.mem, 0);
    hist.push(totalCpu);
    hist.shift();

    // graph
    const { width: W, height: H } = canvas;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(128,128,128,.25)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (H / 4) * i);
      ctx.lineTo(W, (H / 4) * i);
      ctx.stroke();
    }
    const acc = getComputedStyle(document.documentElement).getPropertyValue("--accent") || "#0078D4";
    ctx.strokeStyle = acc.trim();
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    hist.forEach((v, i) => {
      const x = (i / (hist.length - 1)) * W;
      const y = H - (v / 100) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = acc.trim() + "22";
    ctx.fill();

    // table
    table.replaceChildren(
      el("div", { cls: "tk-row tk-head" }, [
        el("span", { cls: "tk-c1", text: tt("名称", "Name") }),
        el("span", { cls: "tk-c2", text: tt("状态", "Status") }),
        el("span", { cls: "tk-c3", text: "CPU" }),
        el("span", { cls: "tk-c4", text: tt("内存", "Memory") }),
        el("span", { cls: "tk-c5", text: "" }),
      ]),
      ...wins.map((w) => {
        const app = getApp(w.appId);
        const m = meters.get(w.id) ?? { cpu: 0, mem: 0 };
        return el("div", { cls: "tk-row" + (w.focused ? " focused" : "") }, [
          el("span", { cls: "tk-c1 tk-name" }, [
            el("span", { cls: "tk-ic", html: icon(app?.icon ?? "fileBin", 16) }),
            el("span", { text: w.title || tt(app?.zh ?? w.appId, app?.en ?? w.appId) }),
          ]),
          el("span", { cls: "tk-c2", text: w.minimized ? tt("已暂停", "Suspended") : tt("运行中", "Running") }),
          el("span", { cls: "tk-c3", text: `${m.cpu.toFixed(1)}%` }),
          el("span", { cls: "tk-c4", text: `${m.mem.toFixed(0)} MB` }),
          el("span", { cls: "tk-c5" }, [
            el("button", { cls: "tk-end", text: tt("结束任务", "End task"), on: { click: () => wm.close(w.id) } }),
          ]),
        ]);
      }),
      wins.length === 0 ? el("div", { cls: "tk-empty", text: tt("没有正在运行的应用窗口", "No running app windows") }) : null!,
    );

    footer.textContent = tt(
      `进程 ${wins.length}   ·   CPU ${totalCpu.toFixed(0)}%   ·   内存 ${(totalMem / 1024).toFixed(2)} GB / 8 GB`,
      `Processes ${wins.length}   ·   CPU ${totalCpu.toFixed(0)}%   ·   Memory ${(totalMem / 1024).toFixed(2)} GB of 8 GB`,
    );
  };

  tick();
  const iv = window.setInterval(tick, 1500);
  d.timer(iv);

  win.body.replaceChildren(el("div", { cls: "tk" }, [canvas, table, footer]));
}

export const taskmgrApp: AppDef = {
  id: "taskmgr",
  zh: "任务管理器",
  en: "Task Manager",
  icon: "taskmgr",
  tile: "linear-gradient(135deg,#2C3A4A,#1E2833)",
  w: 700, h: 520, minW: 520, minH: 360,
  singleton: true,
  render,
  onClose: (win) => (win.store.get("dispose") as (() => void)[] | undefined)?.forEach((f) => f()),
};
