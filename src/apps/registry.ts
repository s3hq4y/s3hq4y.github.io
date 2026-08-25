/* ============================================================
   registry.ts — app catalog
   ============================================================ */

import type { AppDef } from "../os/types";
import { explorerApp } from "./explorer";
import { notepadApp } from "./notepad";
import { terminalApp } from "./terminal";
import { calculatorApp } from "./calculator";
import { paintApp } from "./paint";
import { photosApp } from "./photos";
import { settingsAppDef } from "./settingsapp";
import { taskmgrApp } from "./taskmgr";
import { clockApp } from "./clockapp";
import { aboutApp } from "./about";

export const APPS: AppDef[] = [
  explorerApp,
  notepadApp,
  terminalApp,
  calculatorApp,
  paintApp,
  photosApp,
  clockApp,
  taskmgrApp,
  settingsAppDef,
  aboutApp,
];

export function getApp(id: string): AppDef | undefined {
  return APPS.find((a) => a.id === id);
}

export function searchApps(query: string): AppDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return APPS;
  return APPS.filter((a) =>
    a.id.includes(q) || a.zh.toLowerCase().includes(q) || a.en.toLowerCase().includes(q));
}
