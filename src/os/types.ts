/* ============================================================
   types.ts — shared app/window types
   ============================================================ */

import type { IconName } from "./icons";

/** The handle each app receives when its window opens. */
export interface AppWindow {
  readonly id: number;
  readonly appId: string;
  readonly body: HTMLElement;      // content root (scrollable if app wants)
  readonly store: Map<string, unknown>; // app state that survives re-render
  setTitle(title: string): void;
  close(): void;
}

export interface AppDef {
  id: string;
  zh: string;               // app name (Chinese)
  en: string;               // app name (English)
  icon: IconName;
  tile: string;             // css background for start-menu tile / desktop
  w: number;                // default size
  h: number;
  minW?: number;
  minH?: number;
  singleton?: boolean;      // only one window allowed
  render(win: AppWindow): void;
  onClose?(win: AppWindow): void;
}

export type AppProvider = (id: string) => AppDef | undefined;
