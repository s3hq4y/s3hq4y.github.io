/* ============================================================
   calculator.ts — standard calculator (keyboard friendly)
   ============================================================ */

import { el } from "../os/dom";
import { tt } from "../os/i18n";
import type { AppDef, AppWindow } from "../os/types";
import { makeDispose } from "./util";

type Op = "+" | "-" | "×" | "÷";

function apply(a: number, b: number, op: Op): number {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
  }
}

function fmt(n: number): string {
  if (!isFinite(n)) return "NaN";
  if (Math.abs(n) >= 1e15 || (n !== 0 && Math.abs(n) < 1e-10)) return n.toExponential(8).replace(/e([+-])(\d)$/, "e$10$2");
  const s = String(Math.round(n * 1e10) / 1e10);
  return s.length > 16 ? String(Number(n.toPrecision(13))) : s;
}

function render(win: AppWindow): void {
  const d = makeDispose(win);
  win.setTitle(tt("计算器", "Calculator"));

  let display = String(win.store.get("displayStr") ?? "0");
  let acc: number | null = (win.store.get("acc") as number | null) ?? null;
  let op: Op | null = (win.store.get("op") as Op | null) ?? null;
  let fresh = win.store.get("fresh") === true; // next digit replaces display

  const main = el("div", { cls: "calc-main" });
  const sub = el("div", { cls: "calc-sub" });
  const disp = el("div", { cls: "calc-disp", attrs: { tabindex: "0" } });

  const persist = (): void => {
    win.store.set("displayStr", display);
    win.store.set("acc", acc);
    win.store.set("op", op);
    win.store.set("fresh", fresh);
  };

  const paint = (): void => {
    disp.textContent = display;
    const parts: string[] = [];
    if (acc !== null) parts.push(fmt(acc));
    if (op) parts.push(op);
    sub.textContent = parts.join(" ");
    disp.classList.toggle("small", display.length > 12);
    persist();
  };

  const digit = (k: string): void => {
    if (fresh || display === "0" && k !== ".") { display = k === "." ? "0." : k; fresh = false; }
    else if (k === "." && display.includes(".")) return;
    else if (display.replace(/[-.]/g, "").length < 15) display += k;
    paint();
  };

  const setOp = (next: Op): void => {
    const cur = parseFloat(display);
    if (acc !== null && op && !fresh) {
      const r = apply(acc, cur, op);
      if (isNaN(r)) { display = tt("无法除以零", "Cannot divide by zero"); acc = null; op = null; fresh = true; paint(); return; }
      acc = r;
      display = fmt(r);
    } else acc = cur;
    op = next;
    fresh = true;
    paint();
  };

  const equals = (): void => {
    const cur = parseFloat(display);
    if (acc === null || op === null) { fresh = true; return; }
    const r = apply(acc, cur, op);
    if (isNaN(r)) { display = tt("无法除以零", "Cannot divide by zero"); acc = null; op = null; }
    else { display = fmt(r); acc = null; op = null; }
    fresh = true;
    paint();
  };

  const clearAll = (): void => { display = "0"; acc = null; op = null; fresh = false; paint(); };
  const backspace = (): void => {
    if (fresh) return;
    display = display.length > 1 ? display.slice(0, -1) : "0";
    paint();
  };
  const negate = (): void => {
    if (display !== "0") display = display.startsWith("-") ? display.slice(1) : "-" + display;
    paint();
  };
  const percent = (): void => {
    const v = parseFloat(display);
    display = fmt(v / 100);
    fresh = false;
    paint();
  };

  const KEYS: { k: string; lab: string; cls?: string; fn: () => void }[][] = [
    [
      { k: "C", lab: "C", cls: "c-fn", fn: clearAll },
      { k: "Backspace", lab: "⌫", cls: "c-fn", fn: backspace },
      { k: "%", lab: "%", cls: "c-fn", fn: percent },
      { k: "÷", lab: "÷", cls: "c-op", fn: () => setOp("÷") },
    ],
    [
      { k: "7", lab: "7", fn: () => digit("7") },
      { k: "8", lab: "8", fn: () => digit("8") },
      { k: "9", lab: "9", fn: () => digit("9") },
      { k: "×", lab: "×", cls: "c-op", fn: () => setOp("×") },
    ],
    [
      { k: "4", lab: "4", fn: () => digit("4") },
      { k: "5", lab: "5", fn: () => digit("5") },
      { k: "6", lab: "6", fn: () => digit("6") },
      { k: "-", lab: "−", cls: "c-op", fn: () => setOp("-") },
    ],
    [
      { k: "1", lab: "1", fn: () => digit("1") },
      { k: "2", lab: "2", fn: () => digit("2") },
      { k: "3", lab: "3", fn: () => digit("3") },
      { k: "+", lab: "+", cls: "c-op", fn: () => setOp("+") },
    ],
    [
      { k: "±", lab: "±", cls: "c-fn", fn: negate },
      { k: "0", lab: "0", fn: () => digit("0") },
      { k: ".", lab: ".", fn: () => digit(".") },
      { k: "=", lab: "=", cls: "c-eq", fn: equals },
    ],
  ];

  const grid = el("div", { cls: "calc-grid" });
  for (const row of KEYS)
    for (const key of row)
      grid.append(
        el("button", {
          cls: "calc-key " + (key.cls ?? "c-num"),
          text: key.lab,
          attrs: { "data-k": key.k },
          on: { click: key.fn },
        }),
      );

  const onKey = (e: KeyboardEvent): void => {
    if (!win.body.contains(document.activeElement ?? document.body)) return;
    const k = e.key === "*" ? "×" : e.key === "/" ? "÷" : e.key === "Enter" ? "=" : e.key === "Escape" ? "C" : e.key;
    const btn = grid.querySelector<HTMLButtonElement>(`[data-k="${k}"]`);
    if (btn) {
      e.preventDefault();
      btn.click();
      btn.classList.add("pressed");
      window.setTimeout(() => btn.classList.remove("pressed"), 120);
    }
  };
  d.on(document, "keydown", onKey as EventListener);

  main.append(sub, disp, grid);
  win.body.replaceChildren(el("div", { cls: "calc" }, [main]));
  paint();
  disp.focus();
}

export const calculatorApp: AppDef = {
  id: "calc",
  zh: "计算器",
  en: "Calculator",
  icon: "calc",
  tile: "linear-gradient(135deg,#4A5A6E,#37455A)",
  w: 360, h: 520, minW: 300, minH: 430,
  singleton: true,
  render,
};
