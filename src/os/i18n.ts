/* ============================================================
   i18n.ts — bilingual helpers (中文 / English)
   ============================================================ */

export type Lang = "zh" | "en";

const EVENT = "os-lang";

let lang: Lang = detect();

function detect(): Lang {
  const saved = localStorage.getItem("wos.lang") ?? localStorage.getItem("fl-lang");
  if (saved === "zh" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

/** Current language. */
export function getLang(): Lang {
  return lang;
}

/** Pick a string by current language — the workhorse for all UI copy. */
export function tt(zh: string, en: string): string {
  return lang === "zh" ? zh : en;
}

/** Format a Date per current language + hour12 preference. */
export function fmtTime(d: Date, hour12: boolean): string {
  return d.toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12,
  });
}

export function fmtDate(d: Date, long = false): string {
  return d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US",
    long ? { year: "numeric", month: "long", day: "numeric" } : { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function fmtWeekday(d: Date): string {
  return d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { weekday: "long" });
}

export function setLang(next: Lang): void {
  if (next === lang) return;
  lang = next;
  localStorage.setItem("wos.lang", next);
  document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  document.title = tt("s9y OS — 网页操作系统", "s9y OS — Web Operating System");
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onLangChange(fn: () => void): void {
  window.addEventListener(EVENT, fn);
}

export function initLang(): void {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.title = tt("s9y OS — 网页操作系统", "s9y OS — Web Operating System");
}
