/* ============================================================
   settings.ts — persisted OS settings (theme/accent/wallpaper/lang)
   ============================================================ */

import type { Lang } from "./i18n";

export type Theme = "light" | "dark";

export interface Wallpaper {
  id: string;
  zh: string;
  en: string;
  css: string; // full CSS background value (url or gradient)
  thumb: string; // small preview css
}

export const WALLPAPERS: Wallpaper[] = [
  { id: "debian", zh: "Debian ASCII", en: "Debian ASCII", css: "url('wallpaper-debian.svg') center / contain no-repeat #000", thumb: "url('wallpaper-debian.svg') center / cover no-repeat #000" },
  {
    id: "aurora", zh: "Aurora", en: "极光",
    css: "linear-gradient(160deg,#0b1026 0%,#12275e 30%,#0e6b8f 55%,#37b5a0 78%,#c9f2d7 100%)",
    thumb: "linear-gradient(160deg,#0b1026,#0e6b8f 55%,#37b5a0 80%,#c9f2d7)",
  },
  {
    id: "sunset", zh: "Sunset", en: "暮色",
    css: "radial-gradient(120% 90% at 80% 10%,#ff9a62 0%,#e3607b 35%,#7a3d9c 68%,#241b4d 100%)",
    thumb: "radial-gradient(120% 90% at 80% 10%,#ff9a62,#e3607b 35%,#7a3d9c 68%,#241b4d)",
  },
  {
    id: "mint", zh: "Mint", en: "青薄荷",
    css: "linear-gradient(135deg,#e8fff7 0%,#a9f0e0 35%,#59c2d6 70%,#2b7fb9 100%)",
    thumb: "linear-gradient(135deg,#e8fff7,#a9f0e0 35%,#59c2d6 70%,#2b7fb9)",
  },
  {
    id: "graphite", zh: "Graphite", en: "石墨",
    css: "linear-gradient(145deg,#2b2f36 0%,#3c434d 45%,#23262c 100%)",
    thumb: "linear-gradient(145deg,#2b2f36,#3c434d 45%,#23262c)",
  },
];

export interface Accent {
  id: string;
  light: string;
  dark: string;
}

export const ACCENTS: Accent[] = [
  { id: "red", light: "#D70A53", dark: "#FF5C8A" },
  { id: "blue", light: "#0078D4", dark: "#4CC2FF" },
  { id: "teal", light: "#038387", dark: "#30E6D6" },
  { id: "purple", light: "#8764B8", dark: "#B4A0FF" },
  { id: "magenta", light: "#C239B3", dark: "#FF9AE8" },
  { id: "orange", light: "#CA5010", dark: "#FF9D5C" },
  { id: "green", light: "#107C10", dark: "#6CCB5F" },
  { id: "steel", light: "#4A5A6E", dark: "#9AB0C6" },
];

export interface Settings {
  theme: Theme;
  accent: string;
  wallpaper: string;
  lang: Lang;
  hour12: boolean;
  user: string;
}

const KEY = "wos.settings";

function defaults(): Settings {
  const saved = localStorage.getItem("fl-theme");
  const theme: Theme = saved === "light" || saved === "dark"
    ? saved
    : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return {
    theme,
    accent: "red",
    wallpaper: "debian",
    lang: (localStorage.getItem("wos.lang") ?? localStorage.getItem("fl-lang")) === "en" ? "en" : "zh",
    hour12: false,
    user: "s9y",
  };
}

let settings: Settings = load();

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...(JSON.parse(raw) as Partial<Settings>) };
  } catch { /* corrupted -> reset */ }
  return defaults();
}

let saveTimer = 0;
function persist(): void {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => localStorage.setItem(KEY, JSON.stringify(settings)), 120);
}

export function getSettings(): Settings {
  return settings;
}

export function patchSettings(patch: Partial<Settings>): void {
  settings = { ...settings, ...patch };
  persist();
  applySettings();
  window.dispatchEvent(new CustomEvent("os-settings"));
}

/** Push current settings into the document (theme attr, accent var, wallpaper). */
export function applySettings(): void {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  const acc = ACCENTS.find((a) => a.id === settings.accent) ?? ACCENTS[0];
  root.style.setProperty("--accent", settings.theme === "dark" ? acc.dark : acc.light);
  const wp = WALLPAPERS.find((w) => w.id === settings.wallpaper) ?? WALLPAPERS[0];
  for (const id of ["wallpaper", "lock-bg"]) {
    const node = document.getElementById(id);
    if (node) node.style.background = wp.css;
  }
}
