/* ============================================================
   icons.ts — Fluent-ish inline SVG icon library
   All icons use currentColor so they inherit text/accent color.
   ============================================================ */

const S = (w: number, h: number, body: string): string =>
  `<svg viewBox="0 0 ${w} ${h}" width="16" height="16" aria-hidden="true" focusable="false">${body}</svg>`;

function size(svg: string, px: number): string {
  return svg.replace(/width="16" height="16"/, `width="${px}" height="${px}"`);
}

export const ICONS = {
  /* shell */
  logo: S(16, 16, '<rect x="1.5" y="1.5" width="5.6" height="5.6" rx="0.6" fill="currentColor"/><rect x="8.9" y="1.5" width="5.6" height="5.6" rx="0.6" fill="currentColor" opacity=".82"/><rect x="1.5" y="8.9" width="5.6" height="5.6" rx="0.6" fill="currentColor" opacity=".82"/><rect x="8.9" y="8.9" width="5.6" height="5.6" rx="0.6" fill="currentColor" opacity=".64"/>'),
  search: S(16, 16, '<circle cx="6.8" cy="6.8" r="4.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m10.4 10.4 3.6 3.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'),
  power: S(16, 16, '<path d="M8 1.8v5.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M4.5 3.6a5.6 5.6 0 1 0 7 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'),
  lock: S(16, 16, '<rect x="3" y="7" width="10" height="7.2" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5.4 7V5.2a2.6 2.6 0 0 1 5.2 0V7" fill="none" stroke="currentColor" stroke-width="1.5"/>'),
  restart: S(16, 16, '<path d="M13.2 8a5.2 5.2 0 1 1-1.7-3.85" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13.6 1.6v3h-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'),
  sun: S(16, 16, '<circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.4v1.6M8 13v1.6M1.4 8H3M13 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'),
  moon: S(16, 16, '<path d="M13.4 9.6A5.8 5.8 0 0 1 6.4 2.6a5.8 5.8 0 1 0 7 7Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'),
  globe: S(16, 16, '<circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M1.9 8h12.2M8 1.8c-2.4 2.3-2.4 10.1 0 12.4 2.4-2.3 2.4-10.1 0-12.4Z" fill="none" stroke="currentColor" stroke-width="1.2"/>'),
  bell: S(16, 16, '<path d="M4 11V7.2a4 4 0 0 1 8 0V11l1.3 1.8H2.7Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6.5 12.8a1.6 1.6 0 0 0 3 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'),
  wifi: S(16, 16, '<path d="M1.7 5.9a9.4 9.4 0 0 1 12.6 0M4 8.5a6.2 6.2 0 0 1 8 0M6.3 11a3 3 0 0 1 3.4 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="13.2" r="1" fill="currentColor"/>'),
  volume: S(16, 16, '<path d="M2.5 6.2h2.2L8.4 3v10L4.7 9.8H2.5Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.6 3.6a6.2 6.2 0 0 1 0 8.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'),
  chevronUp: S(16, 16, '<path d="m3.5 9.8 4.5-4.5 4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'),
  chevronDown: S(16, 16, '<path d="m3.5 6.2 4.5 4.5 4.5-4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'),
  chevronLeft: S(16, 16, '<path d="M9.8 3.5 5.3 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'),
  chevronRight: S(16, 16, '<path d="m6.2 3.5 4.5 4.5-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'),

  /* window controls */
  minimize: S(16, 16, '<path d="M3.5 8h9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'),
  maximize: S(16, 16, '<rect x="3.8" y="3.8" width="8.4" height="8.4" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/>'),
  restoreWin: S(16, 16, '<rect x="3" y="5.2" width="7.6" height="7.6" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M5.6 5V4a1.2 1.2 0 0 1 1.2-1.2H12A1.2 1.2 0 0 1 13.2 4v5.2A1.2 1.2 0 0 1 12 10.4h-1" fill="none" stroke="currentColor" stroke-width="1.3"/>'),
  close: S(16, 16, '<path d="m3.8 3.8 8.4 8.4M12.2 3.8l-8.4 8.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'),

  /* places / fs */
  folder: S(20, 20, '<path d="M2.2 5.6a1.4 1.4 0 0 1 1.4-1.4h3.9l1.9 2.1h7a1.4 1.4 0 0 1 1.4 1.4v7.5a1.4 1.4 0 0 1-1.4 1.4H3.6a1.4 1.4 0 0 1-1.4-1.4Z" fill="#F7B84B"/><path d="M2.2 8.6h15.6v6.6a1.4 1.4 0 0 1-1.4 1.4H3.6a1.4 1.4 0 0 1-1.4-1.4Z" fill="#FFD678"/>'),
  pc: S(20, 20, '<rect x="2" y="3.4" width="16" height="10.4" rx="1.3" fill="none" stroke="#4D9DE0" stroke-width="1.5"/><path d="M2 10.6h16" stroke="#4D9DE0" stroke-width="1.2"/><rect x="6.4" y="15.6" width="7.2" height="1.6" rx="0.8" fill="#4D9DE0"/>'),
  fileTxt: S(20, 20, '<path d="M4.6 2.4h7L16 6.6v11a1.2 1.2 0 0 1-1.2 1.2H4.6a1.2 1.2 0 0 1-1.2-1.2V3.6a1.2 1.2 0 0 1 1.2-1.2Z" fill="#fff" stroke="#8A8F98" stroke-width="1.2"/><path d="M11.4 2.6V7h4.4" fill="none" stroke="#8A8F98" stroke-width="1.2"/><path d="M6 10h8M6 12.4h8M6 14.8h5" stroke="#4D9DE0" stroke-width="1.2" stroke-linecap="round"/>'),
  fileImg: S(20, 20, '<path d="M4.6 2.4h7L16 6.6v11a1.2 1.2 0 0 1-1.2 1.2H4.6a1.2 1.2 0 0 1-1.2-1.2V3.6a1.2 1.2 0 0 1 1.2-1.2Z" fill="#fff" stroke="#8A8F98" stroke-width="1.2"/><path d="M11.4 2.6V7h4.4" fill="none" stroke="#8A8F98" stroke-width="1.2"/><circle cx="7" cy="10.4" r="1.2" fill="#E8A33D"/><path d="M4.8 16.4l3.4-3.6 2.2 2.3 2-2 2.8 3.3Z" fill="#57C28B"/>'),
  fileBin: S(20, 20, '<path d="M4.6 2.4h7L16 6.6v11a1.2 1.2 0 0 1-1.2 1.2H4.6a1.2 1.2 0 0 1-1.2-1.2V3.6a1.2 1.2 0 0 1 1.2-1.2Z" fill="#fff" stroke="#8A8F98" stroke-width="1.2"/><path d="M11.4 2.6V7h4.4" fill="none" stroke="#8A8F98" stroke-width="1.2"/>'),
  recycle: S(20, 20, '<path d="M5 6.2h10l-.8 10.4a1.4 1.4 0 0 1-1.4 1.3H7.2a1.4 1.4 0 0 1-1.4-1.3Z" fill="none" stroke="#7CBA5E" stroke-width="1.4" stroke-linejoin="round"/><path d="M3.6 5h12.8" stroke="#7CBA5E" stroke-width="1.5" stroke-linecap="round"/><path d="M7.6 5V3.8a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1V5" fill="none" stroke="#7CBA5E" stroke-width="1.3"/><path d="M8.2 9v6M11.8 9v6" stroke="#7CBA5E" stroke-width="1.2" stroke-linecap="round"/>'),
  recycleFull: S(20, 20, '<path d="M5 6.2h10l-.8 10.4a1.4 1.4 0 0 1-1.4 1.3H7.2a1.4 1.4 0 0 1-1.4-1.3Z" fill="none" stroke="#7CBA5E" stroke-width="1.4" stroke-linejoin="round"/><path d="M3.6 5h12.8" stroke="#7CBA5E" stroke-width="1.5" stroke-linecap="round"/><path d="M7.6 5V3.8a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1V5" fill="none" stroke="#7CBA5E" stroke-width="1.3"/><path d="m6.6 6.2 1.4-2 2.6 1.6 2.4-1 .8 1.4" fill="#A5D78A" stroke="#7CBA5E" stroke-width=".8" stroke-linejoin="round"/>'),

  /* apps */
  explorer: S(20, 20, '<path d="M2.2 5.6a1.4 1.4 0 0 1 1.4-1.4h3.9l1.9 2.1h7a1.4 1.4 0 0 1 1.4 1.4v7.5a1.4 1.4 0 0 1-1.4 1.4H3.6a1.4 1.4 0 0 1-1.4-1.4Z" fill="#F7B84B"/><path d="M2.2 8.6h15.6v6.6a1.4 1.4 0 0 1-1.4 1.4H3.6a1.4 1.4 0 0 1-1.4-1.4Z" fill="#FFD678"/>'),
  notepad: S(20, 20, '<rect x="3.2" y="2.2" width="13.6" height="15.6" rx="1.2" fill="#3A76BC"/><rect x="5.2" y="1" width="2.2" height="3" rx="1" fill="#9FC3EA"/><rect x="9" y="1" width="2.2" height="3" rx="1" fill="#9FC3EA"/><rect x="12.8" y="1" width="2.2" height="3" rx="1" fill="#9FC3EA"/><path d="M6 9h8M6 11.6h8M6 14.2h5" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>'),
  terminal: S(20, 20, '<rect x="2" y="3" width="16" height="14" rx="1.6" fill="#20232A"/><path d="M4.8 7.4 7.4 9.8 4.8 12.2" fill="none" stroke="#4CC2FF" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.4 12.4h5" stroke="#e8e8e8" stroke-width="1.4" stroke-linecap="round"/>'),
  calc: S(20, 20, '<rect x="3.4" y="1.8" width="13.2" height="16.4" rx="1.6" fill="#4A5A6E"/><rect x="5.2" y="3.6" width="9.6" height="3.8" rx=".8" fill="#C9E3F7"/><g fill="#fff"><rect x="5.2" y="9" width="2.6" height="2.2" rx=".5"/><rect x="8.7" y="9" width="2.6" height="2.2" rx=".5"/><rect x="12.2" y="9" width="2.6" height="2.2" rx=".5"/><rect x="5.2" y="11.9" width="2.6" height="2.2" rx=".5"/><rect x="8.7" y="11.9" width="2.6" height="2.2" rx=".5"/><rect x="12.2" y="11.9" width="2.6" height="2.2" rx=".5"/><rect x="5.2" y="14.8" width="6.1" height="2.2" rx=".5"/></g><rect x="12.2" y="14.8" width="2.6" height="2.2" rx=".5" fill="#FFB24D"/>'),
  paint: S(20, 20, '<path d="M10 2.4a7.6 7.6 0 0 0 0 15.2c1.2 0 1.7-.7 1.7-1.5 0-1.4 1-1.9 2.3-1.9h1.6a2 2 0 0 0 2-2A7.6 7.6 0 0 0 10 2.4Z" fill="#E9A4C5"/><circle cx="7" cy="7.6" r="1.1" fill="#fff"/><circle cx="10.6" cy="6.2" r="1.1" fill="#fff"/><circle cx="13.6" cy="8.4" r="1.1" fill="#fff"/><circle cx="7" cy="11.6" r="1.1" fill="#fff"/>'),
  photos: S(20, 20, '<rect x="2" y="3.6" width="16" height="12.8" rx="1.6" fill="#5B6B7E"/><circle cx="6.4" cy="7.6" r="1.4" fill="#FFD678"/><path d="M3.4 15 8.6 9.4l3 3.2 2.6-2.4 2.4 4.8Z" fill="#8FD3A8"/>'),
  settingsApp: S(20, 20, '<path d="M10 6.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm0 2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" fill="#9AA5B1"/><path d="m8.4 1.8-.4 2.1a6.4 6.4 0 0 0-1.6.94L4.3 4.1 2.7 6.9l1.7 1.3a6.5 6.5 0 0 0 0 1.86L2.7 11.4l1.6 2.8 2.1-.74c.5.38 1.03.7 1.6.94l.4 2.1h3.2l.4-2.1a6.4 6.4 0 0 0 1.6-.94l2.1.74 1.6-2.8-1.7-1.34a6.5 6.5 0 0 0 0-1.86l1.7-1.34-1.6-2.8-2.1.74a6.4 6.4 0 0 0-1.6-.94l-.4-2.1Z" fill="#9AA5B1" fill-rule="evenodd"/>'),
  taskmgr: S(20, 20, '<rect x="2" y="3" width="16" height="14" rx="1.6" fill="#2C3A4A"/><path d="M4.6 13.6v-3M7.4 13.6v-5.4M10.2 13.6v-2.2M13 13.6V7.4M15.8 13.6v-4" stroke="#4CC2FF" stroke-width="1.5" stroke-linecap="round"/>'),
  clock: S(20, 20, '<circle cx="10" cy="10" r="7.6" fill="#4D9DE0"/><circle cx="10" cy="10" r="7.6" fill="none" stroke="#2F6FB2" stroke-width="1.2"/><path d="M10 5.8V10l2.8 1.8" stroke="#fff" stroke-width="1.5" stroke-linecap="round" fill="none"/>'),
  about: S(20, 20, '<circle cx="10" cy="6.4" r="2.8" fill="#8764B8"/><path d="M4.6 17c.5-3.2 2.7-5 5.4-5s4.9 1.8 5.4 5Z" fill="#8764B8"/>'),

  /* actions */
  plus: S(16, 16, '<path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'),
  trashSm: S(16, 16, '<path d="M3 4.4h10M6.4 4V2.9a.9.9 0 0 1 .9-.9h1.4a.9.9 0 0 1 .9.9V4M4.4 4.4l.6 9a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9l.6-9" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M6.6 7v4.6M9.4 7v4.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>'),
  refresh: S(16, 16, '<path d="M13.2 8A5.2 5.2 0 1 1 8 2.8c1.7 0 3.2.8 4.2 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12.6 1.6v3.2h-3.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'),
  pencil: S(16, 16, '<path d="m11.2 2.4 2.4 2.4L5.6 12.8l-3.2.8.8-3.2Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>'),
  save: S(16, 16, '<path d="M3 3h8l2 2v8H3Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.4 3v3.2h4.4V3M5.4 13v-3.8h5.2V13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>'),
  openFile: S(16, 16, '<path d="M2.6 4.2h4l1.4 1.6h5.4v7H2.6Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M2.6 7.6h10.8" stroke="currentColor" stroke-width="1.2"/>'),
  arrowUp: S(16, 16, '<path d="M8 13V3.4M3.8 7.6 8 3.4l4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'),
  check: S(16, 16, '<path d="m3.4 8.6 3 3 6.2-6.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
  external: S(16, 16, '<path d="M7 3.4H3.6v9.2h9.2V9.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9.6 2.8h3.8v3.8M13.2 3 8 8.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'),
  github: S(16, 16, '<path d="M8 .8a7.2 7.2 0 0 0-2.28 14.04c.36.07.5-.15.5-.35v-1.22c-2 .43-2.43-.96-2.43-.96-.32-.83-.8-1.05-.8-1.05-.65-.44.05-.43.05-.43.72.05 1.1.74 1.1.74.64 1.1 1.68.78 2.09.6.06-.47.25-.79.45-.97-1.59-.18-3.26-.8-3.26-3.54 0-.78.28-1.42.74-1.92-.08-.18-.32-.9.07-1.88 0 0 .6-.2 1.96.73a6.8 6.8 0 0 1 3.6 0c1.36-.93 1.95-.73 1.95-.73.4.98.15 1.7.07 1.88.46.5.74 1.14.74 1.92 0 2.75-1.67 3.35-3.27 3.53.26.22.49.65.49 1.32v1.96c0 .2.14.42.5.35A7.2 7.2 0 0 0 8 .8Z" fill="currentColor"/>'),
  mail: S(16, 16, '<rect x="1.8" y="3.4" width="12.4" height="9.2" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="m2.2 4.2 5.8 4.6 5.8-4.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>'),
  discord: S(16, 16, '<path d="M12.6 3.6A10.9 10.9 0 0 0 9.9 2.8l-.2.4a8 8 0 0 1 2.3.9 7.9 7.9 0 0 0-7.9 0 8 8 0 0 1 2.3-.9l-.2-.4c-1 .1-1.9.4-2.8.8C1.7 5.7 1.2 8 1.4 10.2a10.6 10.6 0 0 0 3.2 1.6l.4-.7c-.4-.14-.8-.32-1.2-.55l.3-.2a7.6 7.6 0 0 0 6.6 0l.3.2c-.4.23-.8.4-1.2.55l.4.7c1.2-.36 2.3-.9 3.2-1.6.26-2.55-.42-4.86-1.6-6.6ZM5.9 9.1c-.6 0-1.1-.56-1.1-1.25S5.3 6.6 5.9 6.6 7 7.16 7 7.85 6.5 9.1 5.9 9.1Zm4.2 0c-.6 0-1.1-.56-1.1-1.25s.5-1.25 1.1-1.25 1.1.56 1.1 1.25-.5 1.25-1.1 1.25Z" fill="currentColor"/>'),
  copy: S(16, 16, '<rect x="5.4" y="5.4" width="8" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M10.6 3.4H4a1 1 0 0 0-1 1v6.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'),
  cut: S(16, 16, '<circle cx="4.2" cy="12.2" r="2" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="11.8" cy="12.2" r="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.4 10.6 11 2.2M10.6 10.6 5 2.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'),
  erase: S(16, 16, '<path d="m6 12.6-3.4-3.4 6-6 4.4 4.4-4 5Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M2.8 13.4h10.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'),
  brush: S(16, 16, '<path d="M10.4 2.6 13.4 5.6 7 12H4v-3Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M4 13.6h8.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'),
  download: S(16, 16, '<path d="M8 2.6v7.6M4.6 7l3.4 3.4L11.4 7M3 13.4h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'),
  star: S(16, 16, '<path d="m8 1.8 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>'),
  user: S(16, 16, '<circle cx="8" cy="5.2" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3 13.8c.6-2.6 2.6-4 5-4s4.4 1.4 5 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'),
  info: S(16, 16, '<circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="4.8" r=".9" fill="currentColor"/>'),
  monitor: S(16, 16, '<rect x="1.8" y="2.8" width="12.4" height="8.6" rx="1.1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.6 14h4.8M8 11.4V14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'),
  palette: S(16, 16, '<path d="M8 1.8a6.2 6.2 0 0 0 0 12.4c1 0 1.4-.6 1.4-1.2 0-1.1.8-1.6 1.9-1.6h1.3a1.6 1.6 0 0 0 1.6-1.7A6.2 6.2 0 0 0 8 1.8Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="5.6" cy="6" r=".9" fill="currentColor"/><circle cx="8.6" cy="4.8" r=".9" fill="currentColor"/><circle cx="11.4" cy="6.6" r=".9" fill="currentColor"/>'),
  langIcon: S(16, 16, '<path d="M3 4h7M6.5 4c0 4-1.5 6.5-4 8M4.5 8c1 2 2.6 3.4 4.5 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="m9.5 8.6 1.9 4.8 1.9-4.8 1.9 4.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  home: S(16, 16, '<path d="M2.6 7.4 8 2.4l5.4 5v6.2h-4v-3.6H6.6v3.6h-4Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>'),
  restore: S(16, 16, '<path d="M6 5.6h6.4a1.6 1.6 0 0 1 1.6 1.6v6.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4 8H2.6v5.4H8v-2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M2.6 8 8 2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'),
} as const;

export type IconName = keyof typeof ICONS;

/** Render an icon at a custom pixel size (default 16). */
export function icon(name: IconName, px = 16): string {
  const svg = ICONS[name] ?? ICONS.fileBin;
  return px === 16 ? svg : size(svg, px);
}
