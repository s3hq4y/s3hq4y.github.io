/* s9y OS — bundled TypeScript source in /src · rebuild with `npm run build` */
"use strict";
(() => {
  // src/os/dom.ts
  function el(tag, opts = {}, extraChildren) {
    const node2 = document.createElement(tag);
    if (opts.id) node2.id = opts.id;
    if (opts.cls) node2.className = opts.cls;
    if (opts.text !== void 0) node2.textContent = opts.text;
    if (opts.html !== void 0) node2.innerHTML = opts.html;
    if (opts.title !== void 0) node2.title = opts.title;
    if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node2.setAttribute(k, v);
    if (opts.dataset) for (const [k, v] of Object.entries(opts.dataset)) node2.dataset[k] = v;
    if (opts.style) Object.assign(node2.style, opts.style);
    if (opts.on)
      for (const [ev, fn] of Object.entries(opts.on))
        node2.addEventListener(ev, fn);
    const children = opts.children ?? extraChildren;
    if (children)
      for (const c of children) {
        if (c == null) continue;
        node2.append(typeof c === "string" ? document.createTextNode(c) : c);
      }
    return node2;
  }
  function clear(node2) {
    while (node2.firstChild) node2.removeChild(node2.firstChild);
  }
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function rafThrottle(fn) {
    let queued = false;
    let last;
    return (...a) => {
      last = a;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        fn(...last);
      });
    };
  }

  // src/os/i18n.ts
  var EVENT = "os-lang";
  var lang = detect();
  function detect() {
    const saved = localStorage.getItem("wos.lang") ?? localStorage.getItem("fl-lang");
    if (saved === "zh" || saved === "en") return saved;
    return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  }
  function getLang() {
    return lang;
  }
  function tt(zh, en) {
    return lang === "zh" ? zh : en;
  }
  function fmtTime(d, hour12) {
    return d.toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12
    });
  }
  function fmtDate(d, long = false) {
    return d.toLocaleDateString(
      lang === "zh" ? "zh-CN" : "en-US",
      long ? { year: "numeric", month: "long", day: "numeric" } : { year: "numeric", month: "2-digit", day: "2-digit" }
    );
  }
  function fmtWeekday(d) {
    return d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { weekday: "long" });
  }
  function setLang(next) {
    if (next === lang) return;
    lang = next;
    localStorage.setItem("wos.lang", next);
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
    document.title = tt("s9y OS \u2014 \u7F51\u9875\u64CD\u4F5C\u7CFB\u7EDF", "s9y OS \u2014 Web Operating System");
    window.dispatchEvent(new CustomEvent(EVENT));
  }
  function onLangChange(fn) {
    window.addEventListener(EVENT, fn);
  }
  function initLang() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = tt("s9y OS \u2014 \u7F51\u9875\u64CD\u4F5C\u7CFB\u7EDF", "s9y OS \u2014 Web Operating System");
  }

  // src/os/fs.ts
  var ROOT = "/";
  var KEY = "wos.fs";
  var FS_EVENT = "fs-changed";
  var root;
  function seed() {
    const now = Date.now();
    const txt = (name, content) => ({ name, type: "file", kind: "txt", content, mtime: now });
    return {
      name: "",
      type: "dir",
      mtime: now,
      children: [
        {
          name: "Desktop",
          type: "dir",
          mtime: now,
          children: [
            txt(
              "welcome.txt",
              `Welcome to s9y OS / \u6B22\u8FCE\u4F7F\u7528 s9y OS
=================================

This whole desktop is one TypeScript app.
\u6574\u4E2A\u684C\u9762\u662F\u4E00\u4E2A TypeScript \u5E94\u7528\u3002

Try these / \u8BD5\u8BD5\u8FD9\u4E9B\uFF1A
  \xB7 Start menu (bottom-left) \u2014 all apps  \u5F00\u59CB\u83DC\u5355\uFF08\u5DE6\u4E0B\u89D2\uFF09
  \xB7 Terminal \u2014 type "help"             \u7EC8\u7AEF\u91CC\u8F93\u5165 help
  \xB7 Drag windows to screen edges to snap \u628A\u7A97\u53E3\u62D6\u5230\u5C4F\u5E55\u8FB9\u7F18\u53EF\u4EE5\u5206\u5C4F
  \xB7 Right-click the desktop            \u53F3\u952E\u70B9\u51FB\u684C\u9762
  \xB7 Settings \u2192 Personalization         \u8BBE\u7F6E\u91CC\u53EF\u4EE5\u6362\u4E3B\u9898/\u5F3A\u8C03\u8272/\u58C1\u7EB8

Built with \u2665 by s9y \u2014 https://github.com/s3hq4y
`
            )
          ]
        },
        {
          name: "Documents",
          type: "dir",
          mtime: now,
          children: [
            txt("notes.txt", "s9y OS dev notes\n----------------\n- window manager: snap zones work\n- virtual fs: persisted in localStorage\n- next: more apps, better i18n coverage\n"),
            txt("todo.txt", "[ ] ship Portal v1.1\n[ ] write a blog post about web OS\n[ ] water the plants\n[x] delete the old landing page\n")
          ]
        },
        { name: "Pictures", type: "dir", mtime: now, children: [{ name: "wallpaper.jpg", type: "file", kind: "img", content: "wallpaper.jpg", mtime: now }] },
        { name: "Downloads", type: "dir", mtime: now, children: [] },
        { name: "Music", type: "dir", mtime: now, children: [] },
        { name: "Recycle Bin", type: "dir", mtime: now, children: [] }
      ]
    };
  }
  var saveTimer = 0;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(root));
      } catch {
        try {
          localStorage.setItem(KEY, JSON.stringify(root, (_k, v) => typeof v === "string" && v.startsWith("data:image") && v.length > 2e5 ? "" : v));
        } catch {
        }
      }
    }, 150);
  }
  function initFS() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        root = JSON.parse(raw);
        if (root.type !== "dir") throw new Error("bad fs");
      } else root = seed();
    } catch {
      root = seed();
    }
  }
  function resetFS() {
    root = seed();
    persist();
    changed();
  }
  function storageBytes() {
    return (localStorage.getItem(KEY) ?? "").length;
  }
  function changed(detail) {
    window.dispatchEvent(new CustomEvent(FS_EVENT, { detail: detail ?? null }));
  }
  function onFSChange(fn) {
    window.addEventListener(FS_EVENT, fn);
  }
  function normalize(path) {
    const parts = [];
    for (const seg of path.split("/")) {
      if (!seg || seg === ".") continue;
      if (seg === "..") parts.pop();
      else parts.push(seg);
    }
    return "/" + parts.join("/");
  }
  function join(...parts) {
    return normalize(parts.join("/"));
  }
  function parentOf(path) {
    const n = normalize(path);
    if (n === ROOT) return ROOT;
    return n.slice(0, n.lastIndexOf("/")) || "/";
  }
  function basename(path) {
    const n = normalize(path);
    return n.slice(n.lastIndexOf("/") + 1);
  }
  var RECYCLE = "/Recycle Bin";
  function node(path) {
    let cur = root;
    for (const seg of normalize(path).split("/").filter(Boolean)) {
      if (cur.type !== "dir" || !cur.children) return null;
      const next = cur.children.find((c) => c.name === seg);
      if (!next) return null;
      cur = next;
    }
    return cur;
  }
  function exists(path) {
    return node(path) !== null;
  }
  function list(path) {
    const n = node(path);
    if (!n || n.type !== "dir") return [];
    return [...n.children ?? []].sort((a, b) => a.type !== b.type ? a.type === "dir" ? -1 : 1 : a.name.localeCompare(b.name, void 0, { numeric: true }));
  }
  function uniqueName(dirPath, wanted) {
    const dir = node(dirPath);
    if (!dir || dir.type !== "dir") return wanted;
    const taken = new Set((dir.children ?? []).map((c) => c.name.toLowerCase()));
    if (!taken.has(wanted.toLowerCase())) return wanted;
    const dot = wanted.lastIndexOf(".");
    const base = dot > 0 ? wanted.slice(0, dot) : wanted;
    const ext = dot > 0 ? wanted.slice(dot) : "";
    for (let i = 2; ; i++) {
      const cand = `${base} (${i})${ext}`;
      if (!taken.has(cand.toLowerCase())) return cand;
    }
  }
  function mkdir(dirPath, name) {
    const dir = node(dirPath);
    if (!dir || dir.type !== "dir") throw new Error("not a directory: " + dirPath);
    const finalName = uniqueName(dirPath, name);
    (dir.children ?? (dir.children = [])).push({ name: finalName, type: "dir", mtime: Date.now(), children: [] });
    persist();
    changed({ path: dirPath });
    return join(dirPath, finalName);
  }
  function createFile(dirPath, name, kind = "txt", content = "") {
    const dir = node(dirPath);
    if (!dir || dir.type !== "dir") throw new Error("not a directory: " + dirPath);
    const finalName = uniqueName(dirPath, name);
    (dir.children ?? (dir.children = [])).push({ name: finalName, type: "file", kind, content, mtime: Date.now() });
    persist();
    changed({ path: dirPath });
    return join(dirPath, finalName);
  }
  function writeFile(path, content) {
    const n = node(path);
    if (!n || n.type !== "file") throw new Error("no such file: " + path);
    n.content = content;
    n.mtime = Date.now();
    persist();
    changed({ path: parentOf(path) });
  }
  function readFile(path) {
    const n = node(path);
    return n && n.type === "file" ? n.content ?? "" : "";
  }
  function rename(path, newName) {
    const parent = node(parentOf(path));
    const n = node(path);
    if (!parent || !parent.children || !n) return null;
    const finalName = uniqueName(parentOf(path), newName);
    n.name = finalName;
    n.mtime = Date.now();
    persist();
    changed({ path: parentOf(path) });
    return join(parentOf(path), finalName);
  }
  function trash(path) {
    const parent = node(parentOf(path));
    const n = node(path);
    if (!parent || !parent.children || !n) return;
    if (normalize(path) === RECYCLE || parentOf(path) === RECYCLE) {
      purge(path);
      return;
    }
    parent.children = parent.children.filter((c) => c !== n);
    const bin = node(RECYCLE);
    if (bin && bin.type === "dir") {
      n.name = uniqueName(RECYCLE, n.name);
      n.origin = parentOf(path);
      (bin.children ?? (bin.children = [])).push(n);
    }
    persist();
    changed({ path: parentOf(path) });
  }
  function purge(path) {
    const parent = node(parentOf(path));
    const n = node(path);
    if (!parent || !parent.children || !n) return;
    parent.children = parent.children.filter((c) => c !== n);
    persist();
    changed({ path: parentOf(path) });
  }
  function emptyTrash() {
    const bin = node(RECYCLE);
    if (bin) bin.children = [];
    persist();
    changed({ path: RECYCLE });
  }
  function restore(path) {
    const n = node(path);
    const bin = node(RECYCLE);
    if (!n || !bin || !bin.children) return null;
    const dest = n.origin && exists(n.origin) ? n.origin : "/Documents";
    bin.children = bin.children.filter((c) => c !== n);
    delete n.origin;
    n.name = uniqueName(dest, n.name);
    const destNode = node(dest);
    if (destNode && destNode.type === "dir") (destNode.children ?? (destNode.children = [])).push(n);
    persist();
    changed({ path: dest });
    return join(dest, n.name);
  }
  function allFiles(kind) {
    const out = [];
    const walk = (n, prefix) => {
      for (const c of n.children ?? []) {
        const p = prefix + "/" + c.name;
        if (c.type === "file" && (kind === void 0 || c.kind === kind)) out.push(p);
        if (c.type === "dir" && p !== RECYCLE) walk(c, p);
      }
    };
    walk(root, "");
    return out;
  }

  // src/os/settings.ts
  var WALLPAPERS = [
    { id: "bloom", zh: "Default bloom", en: "\u9ED8\u8BA4\u4E4B\u82B1 Bloom", css: "center / cover no-repeat url('wallpaper.jpg')", thumb: "center / cover no-repeat url('wallpaper.jpg')" },
    {
      id: "aurora",
      zh: "Aurora",
      en: "\u6781\u5149",
      css: "linear-gradient(160deg,#0b1026 0%,#12275e 30%,#0e6b8f 55%,#37b5a0 78%,#c9f2d7 100%)",
      thumb: "linear-gradient(160deg,#0b1026,#0e6b8f 55%,#37b5a0 80%,#c9f2d7)"
    },
    {
      id: "sunset",
      zh: "Sunset",
      en: "\u66AE\u8272",
      css: "radial-gradient(120% 90% at 80% 10%,#ff9a62 0%,#e3607b 35%,#7a3d9c 68%,#241b4d 100%)",
      thumb: "radial-gradient(120% 90% at 80% 10%,#ff9a62,#e3607b 35%,#7a3d9c 68%,#241b4d)"
    },
    {
      id: "mint",
      zh: "Mint",
      en: "\u9752\u8584\u8377",
      css: "linear-gradient(135deg,#e8fff7 0%,#a9f0e0 35%,#59c2d6 70%,#2b7fb9 100%)",
      thumb: "linear-gradient(135deg,#e8fff7,#a9f0e0 35%,#59c2d6 70%,#2b7fb9)"
    },
    {
      id: "graphite",
      zh: "Graphite",
      en: "\u77F3\u58A8",
      css: "linear-gradient(145deg,#2b2f36 0%,#3c434d 45%,#23262c 100%)",
      thumb: "linear-gradient(145deg,#2b2f36,#3c434d 45%,#23262c)"
    }
  ];
  var ACCENTS = [
    { id: "blue", light: "#0078D4", dark: "#4CC2FF" },
    { id: "teal", light: "#038387", dark: "#30E6D6" },
    { id: "purple", light: "#8764B8", dark: "#B4A0FF" },
    { id: "magenta", light: "#C239B3", dark: "#FF9AE8" },
    { id: "red", light: "#E81123", dark: "#FF6B7A" },
    { id: "orange", light: "#CA5010", dark: "#FF9D5C" },
    { id: "green", light: "#107C10", dark: "#6CCB5F" },
    { id: "steel", light: "#4A5A6E", dark: "#9AB0C6" }
  ];
  var KEY2 = "wos.settings";
  function defaults() {
    const saved = localStorage.getItem("fl-theme");
    const theme = saved === "light" || saved === "dark" ? saved : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return {
      theme,
      accent: "blue",
      wallpaper: "bloom",
      lang: (localStorage.getItem("wos.lang") ?? localStorage.getItem("fl-lang")) === "en" ? "en" : "zh",
      hour12: false,
      user: "s9y"
    };
  }
  var settings = load();
  function load() {
    try {
      const raw = localStorage.getItem(KEY2);
      if (raw) return { ...defaults(), ...JSON.parse(raw) };
    } catch {
    }
    return defaults();
  }
  var saveTimer2 = 0;
  function persist2() {
    clearTimeout(saveTimer2);
    saveTimer2 = window.setTimeout(() => localStorage.setItem(KEY2, JSON.stringify(settings)), 120);
  }
  function getSettings() {
    return settings;
  }
  function patchSettings(patch) {
    settings = { ...settings, ...patch };
    persist2();
    applySettings();
    window.dispatchEvent(new CustomEvent("os-settings"));
  }
  function applySettings() {
    const root2 = document.documentElement;
    root2.dataset.theme = settings.theme;
    const acc = ACCENTS.find((a) => a.id === settings.accent) ?? ACCENTS[0];
    root2.style.setProperty("--accent", settings.theme === "dark" ? acc.dark : acc.light);
    const wp = WALLPAPERS.find((w) => w.id === settings.wallpaper) ?? WALLPAPERS[0];
    for (const id of ["wallpaper", "lock-bg"]) {
      const node2 = document.getElementById(id);
      if (node2) node2.style.background = wp.css;
    }
  }

  // src/os/icons.ts
  var S = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="16" height="16" aria-hidden="true" focusable="false">${body}</svg>`;
  function size(svg, px) {
    return svg.replace(/width="16" height="16"/, `width="${px}" height="${px}"`);
  }
  var ICONS = {
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
    restore: S(16, 16, '<path d="M6 5.6h6.4a1.6 1.6 0 0 1 1.6 1.6v6.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4 8H2.6v5.4H8v-2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M2.6 8 8 2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>')
  };
  function icon(name, px = 16) {
    const svg = ICONS[name] ?? ICONS.fileBin;
    return px === 16 ? svg : size(svg, px);
  }

  // src/os/wm.ts
  var OSWindowImpl = class {
    constructor(id, appId, wm2, app) {
      this.id = id;
      this.appId = appId;
      this.wm = wm2;
      this.store = /* @__PURE__ */ new Map();
      this.titleText = "";
      this.el = el("section", { cls: "window", attrs: { role: "dialog", "aria-label": app.zh } });
      const bar2 = el("header", { cls: "win-titlebar" });
      this.iconEl = el("span", { cls: "win-icon", html: icon(app.icon, 16) });
      this.titleEl = el("span", { cls: "win-title-text" });
      bar2.append(
        el("div", { cls: "win-title" }, [this.iconEl, this.titleEl]),
        el("div", {
          cls: "win-controls",
          children: [
            el("button", { cls: "wc wc-min", html: icon("minimize", 14), title: "Minimize", on: { click: () => this.wm.minimize(this.id) } }),
            el("button", { cls: "wc wc-max", html: icon("maximize", 13), title: "Maximize", on: { click: () => this.wm.toggleMax(this.id) } }),
            el("button", { cls: "wc wc-close", html: icon("close", 13), title: "Close", on: { click: () => this.wm.close(this.id) } })
          ]
        })
      );
      this.body = el("div", { cls: "win-body" });
      this.el.append(bar2, this.body);
      bar2.addEventListener("pointerdown", () => this.wm.focus(this.id));
      this.body.addEventListener("pointerdown", () => this.wm.focus(this.id));
      bar2.addEventListener("dblclick", (e) => {
        if (e.target.closest(".wc")) return;
        this.wm.toggleMax(this.id);
      });
    }
    mount(parent) {
      parent.append(this.el);
    }
    setTitle(title) {
      this.titleText = title;
      this.titleEl.textContent = title;
      this.el.setAttribute("aria-label", title);
      this.wm.dispatchChange();
    }
    get title() {
      return this.titleText;
    }
    setAppTitle() {
      this.setTitle(this.titleText || "");
    }
    close() {
      this.wm.close(this.id);
    }
    get iconHtml() {
      return this.iconEl.innerHTML;
    }
  };
  var WindowManager = class {
    constructor() {
      this.wins = [];
      this.nextId = 1;
      this.zTop = 100;
      this.provider = null;
      this.layer = null;
      this.snapPreview = null;
      this.focusedId = null;
      this.cascade = 0;
    }
    setAppProvider(fn) {
      this.provider = fn;
    }
    setLayer(layer2, snapPreview) {
      this.layer = layer2;
      this.snapPreview = snapPreview;
      layer2.addEventListener("pointerdown", (e) => {
        if (e.target === layer2) this.setFocus(null);
      });
    }
    open(appId, arg) {
      const app = this.provider?.(appId);
      if (!app || !this.layer) return null;
      if (app.singleton) {
        const existing = this.wins.find((w2) => w2.win.appId === appId);
        if (existing) {
          this.restore(existing.win.id);
          this.focus(existing.win.id);
          return existing.win;
        }
      }
      const win = new OSWindowImpl(this.nextId++, appId, this, app);
      const area = this.area();
      const w = Math.min(app.w, area.width - 24);
      const h = Math.min(app.h, area.height - 24);
      const off = this.cascade++ % 6 * 28;
      const x = Math.max(8, Math.min(area.width - w - 8, Math.round((area.width - w) / 2) - 90 + off));
      const y = Math.max(8, Math.min(area.height - h - 8, Math.round((area.height - h) / 2) - 48 + off));
      Object.assign(win.el.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
      win.mount(this.layer);
      if (arg !== void 0) win.store.set("openArg", arg);
      this.wins.push({ win, normal: { x, y, w, h } });
      this.attachDrag(win);
      this.attachResize(win, app);
      this.focus(win.id);
      win.el.classList.add("anim-open");
      win.el.addEventListener("animationend", () => win.el.classList.remove("anim-open"), { once: true });
      try {
        app.render(win);
      } catch (err) {
        console.error(`app ${appId} render failed`, err);
      }
      this.dispatchChange();
      return win;
    }
    area() {
      return this.layer ? { width: this.layer.clientWidth, height: this.layer.clientHeight } : { width: innerWidth, height: innerHeight - 48 };
    }
    focus(id) {
      this.setFocus(id);
    }
    setFocus(id) {
      this.focusedId = id;
      for (const w of this.wins) {
        const active = w.win.id === id;
        w.win.el.classList.toggle("focused", active);
        if (active) w.win.el.style.zIndex = String(++this.zTop);
      }
      this.dispatchChange();
    }
    focused() {
      return this.focusedId;
    }
    list() {
      return this.wins.map((w) => ({
        id: w.win.id,
        appId: w.win.appId,
        title: w.win.title,
        minimized: w.win.el.classList.contains("minimized"),
        focused: this.focusedId === w.win.id
      }));
    }
    winsOf(appId) {
      return this.wins.filter((w) => w.win.appId === appId).map((w) => w.win);
    }
    byId(id) {
      return this.wins.find((w) => w.win.id === id)?.win;
    }
    close(id) {
      const idx = this.wins.findIndex((w) => w.win.id === id);
      if (idx < 0) return;
      const { win } = this.wins[idx];
      const app = this.provider?.(win.appId);
      try {
        app?.onClose?.(win);
      } catch (err) {
        console.error("onClose failed", err);
      }
      win.el.classList.add("anim-close");
      const finish = () => {
        win.el.remove();
        this.wins = this.wins.filter((w) => w.win.id !== id);
        if (this.focusedId === id) {
          const top = [...this.wins].filter((w) => !w.win.el.classList.contains("minimized")).sort((a, b) => Number(b.win.el.style.zIndex) - Number(a.win.el.style.zIndex))[0];
          this.setFocus(top ? top.win.id : null);
        } else this.dispatchChange();
      };
      win.el.addEventListener("animationend", finish, { once: true });
      window.setTimeout(finish, 260);
    }
    minimize(id) {
      const w = this.byId(id);
      if (!w) return;
      w.el.classList.add("anim-min");
      w.el.addEventListener(
        "animationend",
        () => {
          w.el.classList.remove("anim-min");
          w.el.classList.add("minimized");
          if (this.focusedId === id) {
            const top = [...this.wins].filter((x) => x.win.id !== id && !x.win.el.classList.contains("minimized")).sort((a, b) => Number(b.win.el.style.zIndex) - Number(a.win.el.style.zIndex))[0];
            this.setFocus(top ? top.win.id : null);
          }
          this.dispatchChange();
        },
        { once: true }
      );
    }
    restore(id) {
      const w = this.byId(id);
      if (!w) return;
      if (w.el.classList.contains("minimized")) {
        w.el.classList.remove("minimized");
        w.el.classList.add("anim-open");
        w.el.addEventListener("animationend", () => w.el.classList.remove("anim-open"), { once: true });
      }
      this.dispatchChange();
    }
    toggleMax(id) {
      const w = this.byId(id);
      if (!w || !this.layer) return;
      const st = this.state(id);
      const area = this.area();
      if (this.isMax(id)) {
        const { x, y, w: ww, h: hh } = st.normal;
        Object.assign(w.el.style, { left: `${x}px`, top: `${y}px`, width: `${ww}px`, height: `${hh}px` });
        w.el.classList.remove("maximized");
      } else {
        st.normal = this.rect(id);
        Object.assign(w.el.style, { left: "0px", top: "0px", width: `${area.width}px`, height: `${area.height}px` });
        w.el.classList.add("maximized");
      }
      w.el.classList.add("anim-frame");
      w.el.addEventListener("animationend", () => w.el.classList.remove("anim-frame"), { once: true });
      window.dispatchEvent(new Event("wm-resize"));
      this.dispatchChange();
    }
    isMax(id) {
      return this.byId(id)?.el.classList.contains("maximized") ?? false;
    }
    rect(id) {
      const w = this.byId(id);
      const s = w.el.style;
      return { x: parseFloat(s.left) || 0, y: parseFloat(s.top) || 0, w: parseFloat(s.width) || 0, h: parseFloat(s.height) || 0 };
    }
    state(id) {
      return this.wins.find((w) => w.win.id === id);
    }
    dispatchChange() {
      window.dispatchEvent(new CustomEvent("wm-changed"));
    }
    /* ---------------- dragging + snap ---------------- */
    attachDrag(win) {
      const bar2 = win.el.querySelector(".win-titlebar");
      let snap = null;
      bar2.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".wc")) return;
        if (e.button !== 0) return;
        const area = this.area();
        const st = this.state(win.id);
        let rect = this.rect(win.id);
        const wasMax = this.isMax(win.id);
        if (wasMax) {
          const ratio = (e.clientX - rect.x) / Math.max(1, rect.w);
          this.toggleMax(win.id);
          rect = this.rect(win.id);
          const nx = e.clientX - rect.w * ratio;
          Object.assign(win.el.style, { left: `${nx}px`, top: `${Math.max(0, e.clientY - 22)}px` });
          rect = this.rect(win.id);
          st.normal = rect;
        } else st.normal = rect;
        const grabDx = e.clientX - rect.x;
        const grabDy = e.clientY - rect.y;
        bar2.setPointerCapture(e.pointerId);
        win.el.classList.add("dragging");
        const move = rafThrottle((mx, my) => {
          const x = mx - grabDx;
          const y = my - grabDy;
          win.el.style.left = `${Math.min(Math.max(x, -rect.w + 90), area.width - 90)}px`;
          win.el.style.top = `${Math.min(Math.max(y, 0), area.height - 44)}px`;
          const next = mx <= 6 ? "left" : mx >= area.width - 6 ? "right" : my <= 4 ? "top" : null;
          if (next !== snap) {
            snap = next;
            this.showSnapPreview(snap, area);
          }
        });
        const onMove = (ev) => move(ev.clientX, ev.clientY);
        const onUp = (ev) => {
          bar2.removeEventListener("pointermove", onMove);
          bar2.removeEventListener("pointerup", onUp);
          bar2.removeEventListener("pointercancel", onUp);
          win.el.classList.remove("dragging");
          this.hideSnapPreview();
          if (snap === "top") {
            if (!this.isMax(win.id)) this.toggleMax(win.id);
          } else if (snap) {
            st.normal = this.rect(win.id);
            const halfW = Math.round(area.width / 2);
            Object.assign(win.el.style, {
              left: snap === "left" ? "0px" : `${area.width - halfW}px`,
              top: "0px",
              width: `${halfW}px`,
              height: `${area.height}px`
            });
            win.el.classList.add("snapped");
            window.dispatchEvent(new Event("wm-resize"));
          }
        };
        bar2.addEventListener("pointermove", onMove);
        bar2.addEventListener("pointerup", onUp);
        bar2.addEventListener("pointercancel", onUp);
      });
    }
    showSnapPreview(snap, area) {
      if (!this.snapPreview) return;
      if (!snap) {
        this.snapPreview.classList.remove("show");
        return;
      }
      const s = this.snapPreview.style;
      if (snap === "top") {
        Object.assign(s, { left: "0px", top: "0px", width: `${area.width}px`, height: `${area.height}px` });
      } else {
        const halfW = Math.round(area.width / 2);
        Object.assign(s, {
          left: snap === "left" ? "0px" : `${area.width - halfW}px`,
          top: "0px",
          width: `${halfW}px`,
          height: `${area.height}px`
        });
      }
      this.snapPreview.classList.add("show");
    }
    hideSnapPreview() {
      this.snapPreview?.classList.remove("show");
    }
    /* ---------------- resize ---------------- */
    attachResize(win, app) {
      const dirs = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
      for (const d of dirs) {
        const h = el("div", { cls: `rz rz-${d}` });
        win.el.append(h);
        h.addEventListener("pointerdown", (e) => {
          if (this.isMax(win.id) || win.el.classList.contains("snapped")) {
            win.el.classList.remove("snapped");
          }
          if (this.isMax(win.id)) return;
          e.preventDefault();
          h.setPointerCapture(e.pointerId);
          const start = this.rect(win.id);
          const sx = e.clientX, sy = e.clientY;
          const minW = app.minW ?? 320, minH = app.minH ?? 200;
          const area = this.area();
          const onMove = rafThrottle((mx, my) => {
            let { x, y, w, h: hh } = start;
            const dx = mx - sx, dy = my - sy;
            if (d.includes("e")) w = Math.max(minW, start.w + dx);
            if (d.includes("s")) hh = Math.max(minH, start.h + dy);
            if (d.includes("w")) {
              w = Math.max(minW, start.w - dx);
              x = start.x + (start.w - w);
            }
            if (d.includes("n")) {
              hh = Math.max(minH, start.h - dy);
              y = start.y + (start.h - hh);
            }
            Object.assign(win.el.style, {
              left: `${Math.max(-w + 90, Math.min(x, area.width - 90))}px`,
              top: `${Math.max(0, Math.min(y, area.height - 44))}px`,
              width: `${w}px`,
              height: `${Math.min(hh, area.height)}px`
            });
          });
          const onMoveEv = (ev) => onMove(ev.clientX, ev.clientY);
          const onUp = () => {
            h.removeEventListener("pointermove", onMoveEv);
            h.removeEventListener("pointerup", onUp);
            h.removeEventListener("pointercancel", onUp);
            this.state(win.id).normal = this.rect(win.id);
            window.dispatchEvent(new Event("wm-resize"));
          };
          h.addEventListener("pointermove", onMoveEv);
          h.addEventListener("pointerup", onUp);
          h.addEventListener("pointercancel", onUp);
        });
      }
    }
    /** Re-render every open window (used on language change). */
    rerenderAll() {
      for (const w of this.wins) {
        const app = this.provider?.(w.win.appId);
        if (!app) continue;
        try {
          w.win.body.replaceChildren();
          app.render(w.win);
        } catch (err) {
          console.error("rerender failed", err);
        }
      }
    }
    onChange(fn) {
      window.addEventListener("wm-changed", fn);
    }
  };
  var wm = new WindowManager();

  // src/os/dialog.ts
  var layer = null;
  function setDialogLayer(l) {
    layer = l;
  }
  function openDialog(spec) {
    return new Promise((resolve) => {
      if (!layer) {
        resolve(false);
        return;
      }
      const backdrop = el("div", { cls: "dlg-backdrop" });
      const card = el("div", { cls: "dlg" });
      const okBtn = el("button", {
        cls: "btn btn-accent",
        text: spec.okText ?? tt("\u786E\u5B9A", "OK"),
        on: { click: async () => {
          if (spec.onOk) {
            const keep = await spec.onOk();
            if (!keep) return;
          }
          cleanup(true);
        } }
      });
      const cancelBtn = el("button", {
        cls: "btn",
        text: spec.cancelText ?? tt("\u53D6\u6D88", "Cancel"),
        on: { click: () => cleanup(false) }
      });
      card.append(
        el("div", { cls: "dlg-title", text: spec.title }),
        el("div", { cls: "dlg-body" }, [spec.body]),
        el("div", { cls: "dlg-actions" }, [
          ...spec.cancelText === null ? [] : [cancelBtn],
          okBtn
        ])
      );
      backdrop.append(card);
      layer.append(backdrop);
      requestAnimationFrame(() => backdrop.classList.add("show"));
      const onKey = (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          cleanup(false);
        }
      };
      backdrop.addEventListener("keydown", onKey);
      function cleanup(result) {
        document.removeEventListener("keydown", onKey, true);
        backdrop.classList.remove("show");
        window.setTimeout(() => backdrop.remove(), 160);
        resolve(result);
      }
      document.addEventListener("keydown", onKey, true);
      (spec.focus ?? okBtn).focus();
    });
  }
  function dlgConfirm(title, message, okText) {
    const body = el("p", { cls: "dlg-msg", text: message });
    return openDialog({ title, body, okText });
  }
  function dlgPrompt(title, label, defaultValue = "") {
    return new Promise((resolve) => {
      const input = el("input", {
        cls: "input",
        attrs: { type: "text", value: defaultValue, spellcheck: "false" }
      });
      const labelEl = el("label", { cls: "dlg-label", text: label });
      const body = el("div", {}, [labelEl, input]);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          input.closest(".dlg").querySelector(".btn-accent").click();
        }
      });
      openDialog({
        title,
        body,
        onOk: () => {
          resolve(input.value.trim() || null);
          return true;
        }
      }).then((ok) => {
        if (!ok) resolve(null);
      });
      requestAnimationFrame(() => {
        input.focus();
        input.select();
      });
    });
  }
  function fileIconHtml(path) {
    const n = node(path);
    if (n?.type === "dir") return icon("folder", 20);
    return icon(n?.kind === "img" ? "fileImg" : n?.kind === "txt" ? "fileTxt" : "fileBin", 20);
  }
  function dlgOpenFile(kind, title) {
    return new Promise((resolve) => {
      const files = allFiles(kind);
      const list3 = el("div", { cls: "dlg-file-list" });
      if (files.length === 0)
        list3.append(el("div", { cls: "dlg-empty", text: tt("\uFF08\u6CA1\u6709\u6587\u4EF6\uFF09", "(no files)") }));
      let chosen = files[0] ?? null;
      for (const p of files) {
        const row = el("div", {
          cls: "dlg-file-row",
          children: [
            el("span", { cls: "dlg-file-ic", html: fileIconHtml(p) }),
            el("span", { cls: "dlg-file-name", html: `<b>${esc(basename(p))}</b><small>${esc(parentOf(p))}</small>` })
          ],
          on: { click: () => {
            chosen = p;
            list3.querySelectorAll(".dlg-file-row").forEach((r) => r.classList.remove("sel"));
            row.classList.add("sel");
          } }
        });
        row.addEventListener("dblclick", () => {
          chosen = p;
          row.closest(".dlg").querySelector(".btn-accent").click();
        });
        list3.append(row);
      }
      if (files[0]) list3.querySelector(".dlg-file-row")?.classList.add("sel");
      openDialog({
        title: title ?? tt("\u6253\u5F00\u6587\u4EF6", "Open file"),
        body: list3,
        onOk: () => {
          resolve(chosen);
          return true;
        }
      }).then((ok) => {
        if (!ok) resolve(null);
      });
    });
  }
  function allDirs() {
    const out = [];
    const walk = (path) => {
      out.push(path);
      for (const c of list(path)) if (c.type === "dir") walk(join(path, c.name));
    };
    walk(ROOT);
    return out.filter((p) => p !== RECYCLE);
  }
  function dlgSaveAs(defaultName, defaultDir = "/Documents") {
    return new Promise((resolve) => {
      const nameInput = el("input", {
        cls: "input",
        attrs: { type: "text", value: defaultName, spellcheck: "false" }
      });
      const dirSel = el("select", { cls: "input" });
      for (const d of allDirs()) {
        const o = el("option", { text: d, attrs: { value: d } });
        if (d === defaultDir) o.selected = true;
        dirSel.append(o);
      }
      const body = el("div", { cls: "dlg-form" }, [
        el("label", { text: tt("\u6587\u4EF6\u540D", "File name") }),
        nameInput,
        el("label", { text: tt("\u4F4D\u7F6E", "Location") }),
        dirSel
      ]);
      openDialog({
        title: tt("\u53E6\u5B58\u4E3A", "Save as"),
        body,
        onOk: () => {
          const name = nameInput.value.trim();
          if (!name) return false;
          resolve({ dir: dirSel.value, name });
          return true;
        }
      }).then((ok) => {
        if (!ok) resolve(null);
      });
      nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          nameInput.closest(".dlg").querySelector(".btn-accent").click();
        }
      });
      requestAnimationFrame(() => {
        nameInput.focus();
        const dot = defaultName.lastIndexOf(".");
        nameInput.setSelectionRange(0, dot > 0 ? dot : defaultName.length);
      });
    });
  }

  // src/os/notifications.ts
  var list2 = [];
  var nextId = 1;
  var toastLayer = null;
  function setToastLayer(l) {
    toastLayer = l;
  }
  function notifications() {
    return list2;
  }
  function clearNotifications() {
    list2.length = 0;
    window.dispatchEvent(new Event("os-notifs"));
  }
  function removeNotification(id) {
    const i = list2.findIndex((n) => n.id === id);
    if (i >= 0) list2.splice(i, 1);
    window.dispatchEvent(new Event("os-notifs"));
  }
  function notify(title, body, ic = "info") {
    const n = { id: nextId++, title, body, icon: ic, time: /* @__PURE__ */ new Date() };
    list2.unshift(n);
    if (list2.length > 30) list2.pop();
    window.dispatchEvent(new Event("os-notifs"));
    if (!toastLayer) return;
    const toast = el("div", { cls: "toast anim-toast-in" }, [
      el("span", { cls: "toast-ic", html: icon(ic, 18) }),
      el("div", { cls: "toast-text" }, [
        el("div", { cls: "toast-title", text: title }),
        el("div", { cls: "toast-body", text: body })
      ]),
      el("button", {
        cls: "toast-x",
        html: icon("close", 12),
        on: { click: () => dismiss() }
      })
    ]);
    toastLayer.append(toast);
    let gone = false;
    const dismiss = () => {
      if (gone) return;
      gone = true;
      toast.classList.add("anim-toast-out");
      window.setTimeout(() => toast.remove(), 300);
    };
    window.setTimeout(dismiss, 4200);
    toast.addEventListener("click", (e) => {
      if (e.target.closest(".toast-x")) return;
      dismiss();
    });
  }

  // src/os/menu.ts
  var current = null;
  function closeMenu() {
    current?.remove();
    current = null;
  }
  function showMenu(x, y, items) {
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
          ...it.disabled ? {} : { on: { click: () => {
            closeMenu();
            it.onClick?.();
          } } },
          children: [
            el("span", { cls: "ctx-ic", html: it.icon ? icon(it.icon, 15) : "" }),
            el("span", { cls: "ctx-label", text: it.label })
          ]
        })
      );
    }
    document.body.append(menu);
    const w = menu.offsetWidth, h = menu.offsetHeight;
    menu.style.left = `${Math.min(x, innerWidth - w - 8)}px`;
    menu.style.top = `${Math.min(y, innerHeight - h - 8)}px`;
    requestAnimationFrame(() => menu.classList.add("show"));
    current = menu;
    const onDocDown = (e) => {
      if (!menu.contains(e.target)) closeMenu();
    };
    const onKey = (e) => {
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
    function cleanup() {
      document.removeEventListener("pointerdown", onDocDown, true);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("blur", onWinBlur);
      window.removeEventListener("resize", closeMenu);
      observer.disconnect();
    }
    menu.addEventListener("remove", cleanup);
  }

  // src/os/desktop.ts
  var SHORTCUTS = [
    { zh: "\u6B64\u7535\u8111", en: "This PC", asset: "desktop.svg", open: () => wm.open("files", "/") },
    { zh: "\u56DE\u6536\u7AD9", en: "Recycle Bin", asset: "recycle-bin.svg", open: () => wm.open("files", RECYCLE) },
    { zh: "\u7EC8\u7AEF", en: "Terminal", asset: "terminal.svg", open: () => wm.open("terminal") },
    { zh: "\u753B\u56FE", en: "Paint", asset: "paint.svg", open: () => wm.open("paint") },
    { zh: "\u5173\u4E8E s9y", en: "About s9y", asset: "about.svg", open: () => wm.open("about") }
  ];
  var assetIcon = (name) => el("img", {
    cls: "dt-icon-img",
    attrs: {
      src: `assets/icons/${name}`,
      alt: "",
      width: "48",
      height: "48",
      draggable: "false"
    }
  });
  var inlineIcon = (svg) => el("span", {
    cls: "dt-icon-ic",
    html: svg
  });
  var container = null;
  function openNode(path) {
    const n = node(path);
    if (!n || n.type !== "file") return;
    if (n.kind === "img") wm.open("photos", path);
    else wm.open("notepad", path);
  }
  function iconEl(graphic, label, onOpen, menuPath) {
    const elid = el("button", {
      cls: "dt-icon",
      children: [
        graphic,
        el("span", { cls: "dt-icon-label", text: label })
      ]
    });
    elid.addEventListener("click", (e) => {
      e.stopPropagation();
      container?.querySelectorAll(".dt-icon.sel").forEach((x) => x.classList.remove("sel"));
      elid.classList.add("sel");
    });
    elid.addEventListener("dblclick", onOpen);
    elid.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      container?.querySelectorAll(".dt-icon.sel").forEach((x) => x.classList.remove("sel"));
      elid.classList.add("sel");
      if (menuPath) {
        showMenu(e.clientX, e.clientY, [
          { icon: "openFile", label: tt("\u6253\u5F00", "Open"), onClick: () => openNode(menuPath) },
          { icon: "pencil", label: tt("\u91CD\u547D\u540D", "Rename"), onClick: async () => {
            const name = await dlgPrompt(tt("\u91CD\u547D\u540D", "Rename"), tt("\u540D\u79F0", "Name"), basename(menuPath));
            if (name) rename(menuPath, name);
          } },
          { icon: "trashSm", label: tt("\u5220\u9664", "Delete"), danger: true, onClick: () => trash(menuPath) }
        ]);
      } else {
        showMenu(e.clientX, e.clientY, [
          { icon: "openFile", label: tt("\u6253\u5F00", "Open"), onClick: onOpen }
        ]);
      }
    });
    return elid;
  }
  function renderDesktop() {
    if (!container) return;
    clear(container);
    for (const s of SHORTCUTS) {
      container.append(iconEl(assetIcon(s.asset), tt(s.zh, s.en), s.open));
    }
    for (const n of list("/Desktop")) {
      const p = join("/Desktop", n.name);
      const graphic = n.type === "dir" ? inlineIcon(icon("folder", 44)) : n.kind === "img" ? inlineIcon(icon("fileImg", 44)) : assetIcon("document-text.svg");
      container.append(
        iconEl(graphic, n.name, () => {
          if (n.type === "dir") wm.open("files", p);
          else openNode(p);
        }, p)
      );
    }
  }
  function initDesktop() {
    container = el("div", { id: "desktop", cls: "desktop" });
    document.body.append(container);
    renderDesktop();
    container.addEventListener("click", (e) => {
      if (e.target === container)
        container?.querySelectorAll(".dt-icon.sel").forEach((x) => x.classList.remove("sel"));
    });
    container.addEventListener("contextmenu", (e) => {
      if (e.target !== container) return;
      e.preventDefault();
      showMenu(e.clientX, e.clientY, [
        { icon: "plus", label: tt("\u65B0\u5EFA\u6587\u4EF6\u5939", "New folder"), onClick: async () => {
          const name = await dlgPrompt(tt("\u65B0\u5EFA\u6587\u4EF6\u5939", "New folder"), tt("\u540D\u79F0", "Name"), tt("\u65B0\u5EFA\u6587\u4EF6\u5939", "New folder"));
          if (name) mkdir("/Desktop", name);
        } },
        { icon: "fileTxt", label: tt("\u65B0\u5EFA\u6587\u672C\u6587\u4EF6", "New text file"), onClick: async () => {
          const name = await dlgPrompt(tt("\u65B0\u5EFA\u6587\u672C\u6587\u4EF6", "New text file"), tt("\u540D\u79F0", "Name"), "new.txt");
          if (name) createFile("/Desktop", name.endsWith(".txt") ? name : name + ".txt", "txt", "");
        } },
        { icon: "refresh", label: tt("\u5237\u65B0", "Refresh"), onClick: () => renderDesktop() },
        { separator: true, label: "" },
        { icon: "palette", label: tt("\u4E2A\u6027\u5316", "Personalize"), onClick: () => wm.open("settings") },
        { icon: "monitor", label: tt("\u663E\u793A\u8BBE\u7F6E", "Display settings"), onClick: () => wm.open("settings") },
        { icon: "terminal", label: tt("\u5728\u6B64\u5904\u6253\u5F00\u7EC8\u7AEF", "Open terminal here"), onClick: () => wm.open("terminal") }
      ]);
    });
    onFSChange(() => renderDesktop());
    window.addEventListener("os-lang", () => renderDesktop());
  }

  // src/apps/util.ts
  function makeDispose(win) {
    const prev = win.store.get("dispose");
    prev?.forEach((f) => f());
    const fns = [];
    win.store.set("dispose", fns);
    return {
      on(target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        fns.push(() => target.removeEventListener(type, fn, opts));
      },
      timer(id) {
        fns.push(() => clearTimeout(id));
      },
      disposeAll() {
        fns.forEach((f) => f());
        fns.length = 0;
      }
    };
  }
  function str(win, key, def) {
    const v = win.store.get(key);
    return typeof v === "string" ? v : def;
  }
  function num(win, key, def) {
    const v = win.store.get(key);
    return typeof v === "number" ? v : def;
  }
  function bool(win, key, def) {
    const v = win.store.get(key);
    return typeof v === "boolean" ? v : def;
  }

  // src/apps/explorer.ts
  var QUICK = [
    { path: "/", zh: "\u6B64\u7535\u8111", en: "This PC", icon: "pc" },
    { path: "/Desktop", zh: "\u684C\u9762", en: "Desktop", icon: "folder" },
    { path: "/Documents", zh: "\u6587\u6863", en: "Documents", icon: "folder" },
    { path: "/Pictures", zh: "\u56FE\u7247", en: "Pictures", icon: "folder" },
    { path: "/Downloads", zh: "\u4E0B\u8F7D", en: "Downloads", icon: "folder" },
    { path: "/Music", zh: "\u97F3\u4E50", en: "Music", icon: "folder" },
    { path: RECYCLE, zh: "\u56DE\u6536\u7AD9", en: "Recycle Bin", icon: "recycle" }
  ];
  function nodeIcon(n) {
    if (n.type === "dir") return icon("folder", 40);
    return icon(n.kind === "img" ? "fileImg" : n.kind === "txt" ? "fileTxt" : "fileBin", 40);
  }
  function openNode2(path) {
    const n = node(path);
    if (!n) return;
    if (n.type === "dir") return;
    if (n.kind === "img") wm.open("photos", path);
    else wm.open("notepad", path);
  }
  function render(win) {
    const d = makeDispose(win);
    const path = str(win, "path", (() => {
      const arg = win.store.get("openArg");
      if (typeof arg === "string" && exists(arg)) return arg;
      return "/Desktop";
    })());
    win.store.set("path", path);
    const isBin = path === RECYCLE;
    win.setTitle(`${basename(path) || "This PC"} \u2014 ${tt("\u6587\u4EF6\u8D44\u6E90\u7BA1\u7406\u5668", "File Explorer")}`);
    const root2 = el("div", { cls: "fx" });
    const hist = win.store.get("hist") ?? [path];
    let hi = win.store.get("hi") ?? 0;
    if (hist[hi] !== path) {
      hist.splice(hi + 1, hist.length, path);
      hi = hist.length - 1;
    }
    win.store.set("hist", hist);
    win.store.set("hi", hi);
    const nav = (to) => {
      win.store.set("path", normalize(to));
      render(win);
    };
    const back = el("button", { cls: "fx-btn", html: icon("chevronLeft", 15), title: tt("\u540E\u9000", "Back"), attrs: { disabled: String(hi <= 0) } });
    const fwd = el("button", { cls: "fx-btn", html: icon("chevronRight", 15), title: tt("\u524D\u8FDB", "Forward"), attrs: { disabled: String(hi >= hist.length - 1) } });
    back.addEventListener("click", () => nav(hist[hi - 1]));
    fwd.addEventListener("click", () => nav(hist[hi + 1]));
    const up = el("button", { cls: "fx-btn", html: icon("arrowUp", 15), title: tt("\u4E0A\u4E00\u7EA7", "Up"), attrs: { disabled: String(path === "/") } });
    up.addEventListener("click", () => nav(parentOf(path)));
    const crumbs = el("div", { cls: "fx-crumbs" });
    const parts = path === "/" ? [] : path.split("/").filter(Boolean);
    crumbs.append(
      el("button", { cls: "fx-crumb", html: icon("pc", 14), title: tt("\u6B64\u7535\u8111", "This PC"), on: { click: () => nav("/") } })
    );
    let acc = "";
    for (let i = 0; i < parts.length; i++) {
      acc += "/" + parts[i];
      const target = acc;
      crumbs.append(
        el("span", { cls: "fx-crumb-sep", html: icon("chevronRight", 11) }),
        el("button", {
          cls: "fx-crumb" + (i === parts.length - 1 ? " cur" : ""),
          text: parts[i],
          on: { click: () => nav(target) }
        })
      );
    }
    const tools = el("div", { cls: "fx-tools" });
    if (!isBin) {
      tools.append(
        el("button", { cls: "fx-btn wide", html: icon("plus", 14), children: [el("span", { text: tt("\u65B0\u5EFA\u6587\u4EF6\u5939", "New folder") })], on: { click: async () => {
          const name = await dlgPrompt(tt("\u65B0\u5EFA\u6587\u4EF6\u5939", "New folder"), tt("\u540D\u79F0", "Name"), tt("\u65B0\u5EFA\u6587\u4EF6\u5939", "New folder"));
          if (name) mkdir(path, name);
        } } }),
        el("button", { cls: "fx-btn wide", html: icon("fileTxt", 14), children: [el("span", { text: tt("\u65B0\u5EFA\u6587\u672C\u6587\u4EF6", "New text file") })], on: { click: async () => {
          const name = await dlgPrompt(tt("\u65B0\u5EFA\u6587\u672C\u6587\u4EF6", "New text file"), tt("\u540D\u79F0", "Name"), "new.txt");
          if (name) createFile(path, name.endsWith(".txt") ? name : name + ".txt", "txt", "");
        } } })
      );
    } else {
      tools.append(
        el("button", { cls: "fx-btn wide", html: icon("trashSm", 14), children: [el("span", { text: tt("\u6E05\u7A7A\u56DE\u6536\u7AD9", "Empty bin") })], on: { click: async () => {
          if (await dlgConfirm(tt("\u6E05\u7A7A\u56DE\u6536\u7AD9", "Empty Recycle Bin"), tt("\u5C06\u6C38\u4E45\u5220\u9664\u6240\u6709\u9879\u76EE\uFF0C\u65E0\u6CD5\u6062\u590D\u3002", "All items will be permanently deleted.")))
            emptyTrash();
        } } })
      );
    }
    root2.append(el("div", { cls: "fx-bar" }, [el("div", { cls: "fx-nav" }, [back, fwd, up]), crumbs, tools]));
    const side = el("nav", { cls: "fx-side" });
    for (const q of QUICK) {
      const b = el("button", {
        cls: "fx-side-item" + (q.path === path ? " cur" : ""),
        children: [el("span", { cls: "fx-side-ic", html: icon(q.icon, 16) }), el("span", { text: tt(q.zh, q.en) })],
        on: { click: () => nav(q.path) }
      });
      side.append(b);
    }
    const grid = el("div", { cls: "fx-grid", attrs: { tabindex: "0" } });
    const status = el("div", { cls: "fx-status" });
    const fill = () => {
      clear(grid);
      const items = list(path);
      status.textContent = tt(`${items.length} \u4E2A\u9879\u76EE`, `${items.length} item${items.length === 1 ? "" : "s"}`);
      if (items.length === 0) {
        grid.append(el("div", { cls: "fx-empty", text: isBin ? tt("\u56DE\u6536\u7AD9\u662F\u7A7A\u7684", "Recycle Bin is empty") : tt("\u6B64\u6587\u4EF6\u5939\u4E3A\u7A7A", "This folder is empty") }));
      }
      for (const n of items) {
        const p = join(path, n.name);
        const item = el("div", {
          cls: "fx-item",
          children: [
            el("div", { cls: "fx-item-ic", html: nodeIcon(n) }),
            el("div", { cls: "fx-item-name", text: n.name })
          ],
          on: {
            click: () => {
              grid.querySelectorAll(".fx-item.sel").forEach((x) => x.classList.remove("sel"));
              item.classList.add("sel");
            },
            dblclick: () => {
              if (n.type === "dir") nav(p);
              else openNode2(p);
            }
          }
        });
        item.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          e.stopPropagation();
          grid.querySelectorAll(".fx-item.sel").forEach((x) => x.classList.remove("sel"));
          item.classList.add("sel");
          const menu = [];
          if (isBin) {
            menu.push(
              { icon: "restore", label: tt("\u8FD8\u539F", "Restore"), onClick: () => {
                const back2 = restore(p);
                notify(tt("\u5DF2\u8FD8\u539F", "Restored"), `${n.name} \u2192 ${back2 ?? ""}`, "recycle");
              } },
              { icon: "trashSm", label: tt("\u6C38\u4E45\u5220\u9664", "Delete permanently"), danger: true, onClick: () => purge(p) }
            );
          } else {
            menu.push(
              { icon: "openFile", label: tt("\u6253\u5F00", "Open"), onClick: () => n.type === "dir" ? nav(p) : openNode2(p) },
              { icon: "pencil", label: tt("\u91CD\u547D\u540D", "Rename"), onClick: async () => {
                const name = await dlgPrompt(tt("\u91CD\u547D\u540D", "Rename"), tt("\u540D\u79F0", "Name"), n.name);
                if (name && name !== n.name) rename(p, name);
              } },
              { icon: "copy", label: tt("\u590D\u5236\u8DEF\u5F84", "Copy path"), onClick: () => navigator.clipboard?.writeText(p).catch(() => void 0) },
              { icon: "trashSm", label: tt("\u5220\u9664", "Delete"), danger: true, onClick: () => trash(p) }
            );
          }
          showMenu(e.clientX, e.clientY, menu);
        });
        grid.append(item);
      }
    };
    fill();
    grid.addEventListener("contextmenu", (e) => {
      if (e.target.closest(".fx-item")) return;
      e.preventDefault();
      const menu = [];
      if (!isBin) {
        menu.push(
          { icon: "plus", label: tt("\u65B0\u5EFA\u6587\u4EF6\u5939", "New folder"), onClick: async () => {
            const name = await dlgPrompt(tt("\u65B0\u5EFA\u6587\u4EF6\u5939", "New folder"), tt("\u540D\u79F0", "Name"), tt("\u65B0\u5EFA\u6587\u4EF6\u5939", "New folder"));
            if (name) mkdir(path, name);
          } },
          { icon: "fileTxt", label: tt("\u65B0\u5EFA\u6587\u672C\u6587\u4EF6", "New text file"), onClick: async () => {
            const name = await dlgPrompt(tt("\u65B0\u5EFA\u6587\u672C\u6587\u4EF6", "New text file"), tt("\u540D\u79F0", "Name"), "new.txt");
            if (name) createFile(path, name.endsWith(".txt") ? name : name + ".txt", "txt", "");
          } },
          { icon: "refresh", label: tt("\u5237\u65B0", "Refresh"), onClick: () => fill() }
        );
      } else {
        menu.push({ icon: "trashSm", label: tt("\u6E05\u7A7A\u56DE\u6536\u7AD9", "Empty bin"), danger: true, onClick: async () => {
          if (await dlgConfirm(tt("\u6E05\u7A7A\u56DE\u6536\u7AD9", "Empty Recycle Bin"), tt("\u5C06\u6C38\u4E45\u5220\u9664\u6240\u6709\u9879\u76EE\uFF0C\u65E0\u6CD5\u6062\u590D\u3002", "All items will be permanently deleted.")))
            emptyTrash();
        } });
      }
      showMenu(e.clientX, e.clientY, menu);
    });
    d.on(window, "fs-changed", () => fill());
    const layout = el("div", { cls: "fx-layout" }, [side, grid]);
    root2.append(layout, status);
    win.body.replaceChildren(root2);
  }
  var explorerApp = {
    id: "files",
    zh: "\u6587\u4EF6\u8D44\u6E90\u7BA1\u7406\u5668",
    en: "File Explorer",
    icon: "explorer",
    tile: "linear-gradient(135deg,#F7B84B,#E09B2D)",
    w: 860,
    h: 560,
    minW: 560,
    minH: 340,
    render,
    onClose: (win) => win.store.get("dispose")?.forEach((f) => f())
  };

  // src/apps/notepad.ts
  function currentPath(win) {
    const p = win.store.get("path");
    return typeof p === "string" ? p : null;
  }
  function titleOf(win) {
    const p = currentPath(win);
    const dirty = win.store.get("dirty") === true;
    const name = p ? basename(p) : tt("\u672A\u547D\u540D", "Untitled");
    win.setTitle(`${dirty ? "\u2022 " : ""}${name} \u2014 ${tt("\u8BB0\u4E8B\u672C", "Notepad")}`);
  }
  function save(win) {
    return new Promise((resolve) => {
      const p = currentPath(win);
      const ta = win.body.querySelector("textarea");
      const text = ta ? ta.value : win.store.get("text") ?? "";
      win.store.set("text", text);
      if (p) {
        writeFile(p, text);
        win.store.set("dirty", false);
        titleOf(win);
        resolve();
        return;
      }
      void saveAs(win).then(() => resolve());
    });
  }
  async function saveAs(win) {
    const ta = win.body.querySelector("textarea");
    const text = ta ? ta.value : win.store.get("text") ?? "";
    const p = currentPath(win);
    const defName = p ? basename(p) : "untitled.txt";
    const defDir = p ? parentOf(p) : "/Documents";
    const target = await dlgSaveAs(defName, defDir);
    if (!target) return;
    let path;
    if (exists(join(target.dir, target.name))) {
      path = join(target.dir, target.name);
      writeFile(path, text);
    } else {
      path = createFile(target.dir, target.name, "txt", text);
    }
    win.store.set("path", path);
    win.store.set("text", text);
    win.store.set("dirty", false);
    titleOf(win);
    notify(tt("\u5DF2\u4FDD\u5B58", "Saved"), path, "save");
  }
  function render2(win) {
    makeDispose(win);
    const arg = win.store.get("openArg");
    if (typeof arg === "string" && exists(arg) && win.store.get("path") === void 0) {
      win.store.set("path", arg);
    }
    const p = currentPath(win);
    const text = p ? readFile(p) : win.store.get("text") ?? "";
    if (p) win.store.set("text", text);
    titleOf(win);
    const ta = el("textarea", {
      cls: "np-text",
      attrs: { spellcheck: "false", placeholder: tt("\u5728\u6B64\u8F93\u5165\u2026", "Type here\u2026") }
    });
    ta.value = text;
    const status = el("div", { cls: "np-status" });
    const updateStatus = () => {
      const v = ta.value;
      const lines = v.split("\n").length;
      const words = v.trim() ? v.trim().split(/\s+/).length : 0;
      status.textContent = `${tt("\u5B57\u7B26", "Chars")} ${v.length} \xB7 ${tt("\u8BCD", "Words")} ${words} \xB7 ${tt("\u884C", "Lines")} ${lines}  \xB7  UTF-8  \xB7  ${p ?? tt("\u672A\u4FDD\u5B58", "unsaved")}`;
    };
    updateStatus();
    ta.addEventListener("input", () => {
      win.store.set("dirty", true);
      win.store.set("text", ta.value);
      titleOf(win);
      updateStatus();
    });
    const bar2 = el("div", { cls: "np-bar" }, [
      el("button", {
        cls: "fx-btn wide",
        children: [el("span", { text: tt("\u65B0\u5EFA", "New") })],
        on: { click: async () => {
          if (win.store.get("dirty") === true) {
            const ok = await dlgConfirm(tt("\u8BB0\u4E8B\u672C", "Notepad"), tt("\u6709\u672A\u4FDD\u5B58\u7684\u66F4\u6539\uFF0C\u653E\u5F03\u5E76\u65B0\u5EFA\uFF1F", "Discard unsaved changes?"));
            if (!ok) return;
          }
          win.store.set("path", null);
          win.store.set("text", "");
          win.store.set("dirty", false);
          render2(win);
        } }
      }),
      el("button", { cls: "fx-btn wide", children: [el("span", { text: tt("\u6253\u5F00", "Open") })], on: { click: async () => {
        const path = await dlgOpenFile("txt", tt("\u6253\u5F00\u6587\u672C\u6587\u4EF6", "Open text file"));
        if (!path) return;
        win.store.set("path", path);
        win.store.set("text", readFile(path));
        win.store.set("dirty", false);
        render2(win);
      } } }),
      el("button", { cls: "fx-btn wide", children: [el("span", { text: tt("\u4FDD\u5B58", "Save") })], on: { click: () => void save(win) } }),
      el("button", { cls: "fx-btn wide", children: [el("span", { text: tt("\u53E6\u5B58\u4E3A", "Save as") })], on: { click: () => void saveAs(win) } })
    ]);
    win.body.replaceChildren(el("div", { cls: "np" }, [bar2, ta, status]));
    ta.focus();
  }
  var notepadApp = {
    id: "notepad",
    zh: "\u8BB0\u4E8B\u672C",
    en: "Notepad",
    icon: "notepad",
    tile: "linear-gradient(135deg,#3A76BC,#2C5A94)",
    w: 720,
    h: 520,
    minW: 380,
    minH: 260,
    render: render2
  };

  // src/apps/terminal.ts
  var LOGO = [
    "  ____           _         ____  ____ ",
    " / ___|   __ _  | |_      / ___||  _ \\",
    " \\___ \\  / _` | | __|    | |  _ | |_) |",
    "  ___) || (_| | | |_     | |_| ||  __/ ",
    " |____/  \\__,_|  \\__|     \\____||_|    "
  ];
  function help(win) {
    const rows = [
      ["help", tt("\u663E\u793A\u6B64\u5E2E\u52A9", "show this help")],
      ["ls [path]", tt("\u5217\u51FA\u76EE\u5F55", "list directory")],
      ["cd <path>", tt("\u5207\u6362\u76EE\u5F55", "change directory")],
      ["pwd", tt("\u5F53\u524D\u8DEF\u5F84", "print working directory")],
      ["cat <file>", tt("\u663E\u793A\u6587\u4EF6\u5185\u5BB9", "print file")],
      ["mkdir <name>", tt("\u65B0\u5EFA\u6587\u4EF6\u5939", "make directory")],
      ["touch <name>", tt("\u65B0\u5EFA\u7A7A\u6587\u4EF6", "create empty file")],
      ["rm <path>", tt("\u5220\u9664\uFF08\u8FDB\u56DE\u6536\u7AD9\uFF09", "remove (to Recycle Bin)")],
      ["mv <a> <b>", tt("\u79FB\u52A8/\u91CD\u547D\u540D", "move / rename")],
      ["cp <a> <b>", tt("\u590D\u5236", "copy")],
      ["echo txt [>|>> file]", tt("\u8F93\u51FA\u6587\u672C\uFF0C\u53EF\u91CD\u5B9A\u5411", "print text, optional redirect")],
      ["tree [path]", tt("\u76EE\u5F55\u6811", "directory tree")],
      ["open <app|file>", tt("\u6253\u5F00\u5E94\u7528\u6216\u6587\u4EF6", "open app or file")],
      ["apps", tt("\u5217\u51FA\u5E94\u7528", "list apps")],
      ["theme dark|light", tt("\u5207\u6362\u4E3B\u9898", "switch theme")],
      ["accent <name>", tt("\u8BBE\u7F6E\u5F3A\u8C03\u8272", "set accent color")],
      ["wallpaper <id>", tt("\u8BBE\u7F6E\u58C1\u7EB8", "set wallpaper")],
      ["lang zh|en", tt("\u5207\u6362\u8BED\u8A00", "switch language")],
      ["date / whoami / df", tt("\u65F6\u95F4 / \u7528\u6237 / \u5B58\u50A8", "date / user / storage")],
      ["neofetch", tt("\u7CFB\u7EDF\u4FE1\u606F", "system info")],
      ["notify <text>", tt("\u53D1\u9001\u901A\u77E5", "send a notification")],
      ["clear", tt("\u6E05\u5C4F", "clear screen")],
      ["reboot / shutdown", tt("\u91CD\u542F / \u5173\u673A", "reboot / shutdown")]
    ];
    return rows.map(([c, d]) => ({ text: `  ${c.padEnd(22)} ${d}`, cls: "t-cmd" }));
  }
  function render3(win) {
    let cwd = str(win, "cwd", "/Documents");
    if (!exists(cwd)) cwd = "/";
    win.store.set("cwd", cwd);
    const lines = win.store.get("lines") ?? [
      { text: tt("s9y OS \u7EC8\u7AEF \xB7 \u8F93\u5165 help \u67E5\u770B\u547D\u4EE4", "s9y OS terminal \xB7 type help for commands"), cls: "t-dim" },
      { text: "" }
    ];
    win.store.set("lines", lines);
    const hist = win.store.get("hist") ?? [];
    let histIdx = hist.length;
    win.store.set("hist", hist);
    win.setTitle(tt("\u7EC8\u7AEF", "Terminal"));
    const out = el("div", { cls: "tm-out", attrs: { tabindex: "0" } });
    const input = el("input", { cls: "tm-in", attrs: { type: "text", spellcheck: "false", autocomplete: "off" } });
    const prompt = el("span", { cls: "tm-prompt" });
    const paintPrompt = () => {
      prompt.innerHTML = `<span class="t-accent">s9y</span>:<span class="t-path">${cwd === "/" ? "/" : basename(cwd)}</span>$ `;
    };
    paintPrompt();
    const paint = () => {
      out.replaceChildren(
        ...lines.map((l) => el("div", { cls: "tm-line " + (l.cls ?? ""), text: l.text }))
      );
      out.scrollTop = out.scrollHeight;
    };
    paint();
    const push = (text, cls) => {
      lines.push({ text, cls });
      if (lines.length > 800) lines.splice(0, lines.length - 800);
      paint();
    };
    const resolve = (p) => p.startsWith("/") ? normalize(p) : join(cwd, p);
    const exec = (raw) => {
      const cmdline = raw.trim();
      push(prompt.textContent + cmdline, "t-in");
      if (!cmdline) return;
      hist.push(cmdline);
      histIdx = hist.length;
      let redirect = null;
      let body = cmdline;
      const m = body.match(/\s(>>?)\s*(\S+)\s*$/);
      if (m) {
        redirect = { file: m[2], append: m[1] === ">>" };
        body = body.slice(0, m.index);
      }
      const [cmd, ...args] = body.split(/\s+/);
      const echoText = () => args.join(" ").replace(/^["']|["']$/g, "");
      let outText = null;
      const say = (t, cls) => {
        if (outText) outText.push(t);
        else push(t, cls);
      };
      switch (cmd) {
        case "help":
          for (const l of help(win)) push(l.text, l.cls);
          break;
        case "ls":
        case "dir": {
          const target = resolve(args[0] ?? ".");
          const n = node(target);
          if (!n) say(tt(`ls: ${args[0]}: \u4E0D\u5B58\u5728`, `ls: ${args[0]}: no such path`), "t-err");
          else if (n.type === "file") say(basename(target));
          else {
            const items = list(target);
            if (!items.length) say(tt("\uFF08\u7A7A\uFF09", "(empty)"), "t-dim");
            for (const c of items)
              say(`${c.type === "dir" ? "d" : "-"}  ${c.name}${c.type === "dir" ? "/" : ""}`, c.type === "dir" ? "t-accent" : void 0);
          }
          break;
        }
        case "cd": {
          const target = resolve(args[0] ?? "/");
          const n = node(target);
          if (n && n.type === "dir") {
            cwd = target;
            win.store.set("cwd", cwd);
            paintPrompt();
          } else say(tt(`cd: ${args[0]}: \u4E0D\u662F\u76EE\u5F55`, `cd: ${args[0]}: not a directory`), "t-err");
          break;
        }
        case "pwd":
          say(cwd);
          break;
        case "cat":
        case "type": {
          const target = resolve(args[0] ?? "");
          const n = node(target);
          if (!n || n.type !== "file") say(tt(`cat: ${args[0]}: \u4E0D\u662F\u6587\u4EF6`, `cat: ${args[0]}: not a file`), "t-err");
          else (readFile(target) || tt("\uFF08\u7A7A\u6587\u4EF6\uFF09", "(empty file)")).split("\n").forEach((l) => say(l));
          break;
        }
        case "mkdir": {
          if (!args[0]) {
            say("mkdir: ?", "t-err");
            break;
          }
          const target = resolve(args[0]);
          mkdir(parentOf(target), basename(target));
          say(tt(`\u5DF2\u521B\u5EFA ${target}`, `created ${target}`), "t-dim");
          break;
        }
        case "touch": {
          if (!args[0]) {
            say("touch: ?", "t-err");
            break;
          }
          const target = resolve(args[0]);
          if (!exists(target)) createFile(parentOf(target), basename(target), "txt", "");
          say(tt(`\u5DF2\u521B\u5EFA ${target}`, `created ${target}`), "t-dim");
          break;
        }
        case "rm":
        case "del": {
          const target = resolve(args[0] ?? "");
          if (!exists(target) || target === "/") {
            say(tt("rm: \u65E0\u6548\u8DEF\u5F84", "rm: invalid path"), "t-err");
            break;
          }
          trash(target);
          say(tt(`\u5DF2\u79FB\u5165\u56DE\u6536\u7AD9\uFF1A${target}`, `moved to Recycle Bin: ${target}`), "t-dim");
          break;
        }
        case "mv": {
          const a = resolve(args[0] ?? ""), b = resolve(args[1] ?? "");
          if (!exists(a) || !args[1]) {
            say("mv: ?", "t-err");
            break;
          }
          const src = node(a);
          const destDir = exists(b) && node(b).type === "dir" ? b : parentOf(b);
          const destName = exists(b) && node(b).type === "dir" ? basename(a) : basename(b);
          purge(a);
          if (src.type === "dir") {
            const p = mkdir(destDir, destName);
            const destNode = node(p);
            if (destNode) {
              destNode.children = src.children ?? [];
              window.dispatchEvent(new Event("fs-changed"));
            }
          } else {
            createFile(destDir, destName, src.kind ?? "txt", src.content ?? "");
          }
          say(tt(`\u5DF2\u79FB\u52A8 \u2192 ${join(destDir, destName)}`, `moved \u2192 ${join(destDir, destName)}`), "t-dim");
          break;
        }
        case "cp": {
          const a = resolve(args[0] ?? ""), b = resolve(args[1] ?? "");
          if (!exists(a) || !args[1]) {
            say("cp: ?", "t-err");
            break;
          }
          const src = node(a);
          const destDir = exists(b) && node(b).type === "dir" ? b : parentOf(b);
          const destName = exists(b) && node(b).type === "dir" ? basename(a) : basename(b);
          if (src.type === "file") createFile(destDir, destName, src.kind ?? "txt", src.content ?? "");
          else {
            say(tt("cp: \u4EC5\u652F\u6301\u6587\u4EF6", "cp: files only"), "t-err");
            break;
          }
          say(tt(`\u5DF2\u590D\u5236 \u2192 ${join(destDir, destName)}`, `copied \u2192 ${join(destDir, destName)}`), "t-dim");
          break;
        }
        case "echo": {
          outText = [];
          say(echoText());
          break;
        }
        case "tree": {
          const start = resolve(args[0] ?? ".");
          const walk = (path, prefix) => {
            const items = list(path);
            items.forEach((c, i) => {
              const last = i === items.length - 1;
              say(`${prefix}${last ? "\u2514\u2500 " : "\u251C\u2500 "}${c.name}${c.type === "dir" ? "/" : ""}`, c.type === "dir" ? "t-accent" : void 0);
              if (c.type === "dir") walk(join(path, c.name), prefix + (last ? "   " : "\u2502  "));
            });
          };
          say(start, "t-accent");
          walk(start, "");
          break;
        }
        case "open": {
          const target = args[0] ?? "";
          if (APPS.some((a) => a.id === target)) wm.open(target);
          else if (exists(resolve(target))) {
            const n = node(resolve(target));
            if (n.type === "dir") wm.open("files", resolve(target));
            else if (n.kind === "img") wm.open("photos", resolve(target));
            else wm.open("notepad", resolve(target));
          } else say(tt(`open: ${target}: \u672A\u627E\u5230`, `open: ${target}: not found`), "t-err");
          break;
        }
        case "apps":
          for (const a of APPS) say(`  ${a.id.padEnd(12)} ${tt(a.zh, a.en)}`);
          break;
        case "theme": {
          const t = args[0] === "dark" ? "dark" : args[0] === "light" ? "light" : null;
          if (!t) {
            say(tt(`\u5F53\u524D\u4E3B\u9898\uFF1A${getSettings().theme}`, `current theme: ${getSettings().theme}`));
            break;
          }
          patchSettings({ theme: t });
          say(tt(`\u4E3B\u9898 \u2192 ${t}`, `theme \u2192 ${t}`), "t-dim");
          break;
        }
        case "accent": {
          const a = ACCENTS.find((x) => x.id === (args[0] ?? ""));
          if (!a) {
            say(tt(`\u5F3A\u8C03\u8272\uFF1A${ACCENTS.map((x) => x.id).join(", ")}`, `accents: ${ACCENTS.map((x) => x.id).join(", ")}`));
            break;
          }
          patchSettings({ accent: a.id });
          say(tt(`\u5F3A\u8C03\u8272 \u2192 ${a.id}`, `accent \u2192 ${a.id}`), "t-dim");
          break;
        }
        case "wallpaper": {
          const w = WALLPAPERS.find((x) => x.id === (args[0] ?? ""));
          if (!w) {
            say(tt(`\u58C1\u7EB8\uFF1A${WALLPAPERS.map((x) => x.id).join(", ")}`, `wallpapers: ${WALLPAPERS.map((x) => x.id).join(", ")}`));
            break;
          }
          patchSettings({ wallpaper: w.id });
          say(tt(`\u58C1\u7EB8 \u2192 ${w.id}`, `wallpaper \u2192 ${w.id}`), "t-dim");
          break;
        }
        case "lang": {
          if (args[0] === "zh" || args[0] === "en") {
            setLang(args[0]);
            say("ok", "t-dim");
          } else say(`lang: ${getLang()}`);
          break;
        }
        case "date":
          say((/* @__PURE__ */ new Date()).toLocaleString(getLang() === "zh" ? "zh-CN" : "en-US"));
          break;
        case "whoami":
          say(`${getSettings().user}@s9y-os`);
          break;
        case "df": {
          const used = storageBytes() + localStorage.getItem("wos.settings").length;
          say(tt(`\u5B58\u50A8\uFF1A${(used / 1024).toFixed(1)} KiB / ~5 MiB (localStorage)`, `storage: ${(used / 1024).toFixed(1)} KiB / ~5 MiB (localStorage)`));
          break;
        }
        case "neofetch": {
          const s = getSettings();
          LOGO.forEach((l) => say(l, "t-accent"));
          say("");
          say(`${tt("\u7528\u6237", "user")}      ${s.user}@s9y-os`);
          say(`${tt("\u7CFB\u7EDF", "os")}       s9y OS 1.0 (TypeScript)`);
          say(`${tt("\u5185\u6838", "kernel")}    ${navigator.userAgent.split(" ").slice(-2).join(" ")}`);
          say(`${tt("\u8BED\u8A00", "lang")}      ${getLang()} \xB7 ${tt("\u4E3B\u9898", "theme")} ${s.theme} \xB7 ${s.accent}`);
          say(`${tt("\u5206\u8FA8\u7387", "display")}   ${screen.width}\xD7${screen.height}`);
          say("");
          break;
        }
        case "notify":
          notify(tt("\u7EC8\u7AEF", "Terminal"), args.join(" ") || "\u{1F44B}", "terminal");
          break;
        case "clear":
        case "cls":
          lines.length = 0;
          paint();
          break;
        case "reboot":
          location.reload();
          break;
        case "shutdown":
          window.dispatchEvent(new Event("os-shutdown"));
          break;
        default:
          say(tt(`\u672A\u77E5\u7684\u547D\u4EE4\uFF1A${cmd}\uFF08\u8F93\u5165 help \u67E5\u770B\uFF09`, `unknown command: ${cmd} (try help)`), "t-err");
      }
      if (redirect && outText) {
        const target = resolve(redirect.file);
        const prev = redirect.append && exists(target) ? readFile(target) + "\n" : "";
        if (exists(target)) writeFile(target, prev + outText.join("\n"));
        else createFile(parentOf(target), basename(target), "txt", prev + outText.join("\n"));
      } else if (outText) {
        outText.forEach((t) => push(t));
      }
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        exec(input.value);
        input.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histIdx > 0) input.value = hist[--histIdx] ?? "";
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIdx < hist.length - 1) input.value = hist[++histIdx] ?? "";
        else {
          histIdx = hist.length;
          input.value = "";
        }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        lines.length = 0;
        paint();
      }
    });
    const wrap = el("div", { cls: "tm", on: { click: () => input.focus() } }, [
      out,
      el("div", { cls: "tm-row" }, [prompt, input])
    ]);
    win.body.replaceChildren(wrap);
    input.focus();
  }
  var terminalApp = {
    id: "terminal",
    zh: "\u7EC8\u7AEF",
    en: "Terminal",
    icon: "terminal",
    tile: "linear-gradient(135deg,#20232A,#0F1116)",
    w: 760,
    h: 480,
    minW: 420,
    minH: 240,
    render: render3
  };

  // src/apps/calculator.ts
  function apply(a, b, op) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "\xD7":
        return a * b;
      case "\xF7":
        return b === 0 ? NaN : a / b;
    }
  }
  function fmt(n) {
    if (!isFinite(n)) return "NaN";
    if (Math.abs(n) >= 1e15 || n !== 0 && Math.abs(n) < 1e-10) return n.toExponential(8).replace(/e([+-])(\d)$/, "e$10$2");
    const s = String(Math.round(n * 1e10) / 1e10);
    return s.length > 16 ? String(Number(n.toPrecision(13))) : s;
  }
  function render4(win) {
    const d = makeDispose(win);
    win.setTitle(tt("\u8BA1\u7B97\u5668", "Calculator"));
    let display = String(win.store.get("displayStr") ?? "0");
    let acc = win.store.get("acc") ?? null;
    let op = win.store.get("op") ?? null;
    let fresh = win.store.get("fresh") === true;
    const main2 = el("div", { cls: "calc-main" });
    const sub = el("div", { cls: "calc-sub" });
    const disp = el("div", { cls: "calc-disp", attrs: { tabindex: "0" } });
    const persist3 = () => {
      win.store.set("displayStr", display);
      win.store.set("acc", acc);
      win.store.set("op", op);
      win.store.set("fresh", fresh);
    };
    const paint = () => {
      disp.textContent = display;
      const parts = [];
      if (acc !== null) parts.push(fmt(acc));
      if (op) parts.push(op);
      sub.textContent = parts.join(" ");
      disp.classList.toggle("small", display.length > 12);
      persist3();
    };
    const digit = (k) => {
      if (fresh || display === "0" && k !== ".") {
        display = k === "." ? "0." : k;
        fresh = false;
      } else if (k === "." && display.includes(".")) return;
      else if (display.replace(/[-.]/g, "").length < 15) display += k;
      paint();
    };
    const setOp = (next) => {
      const cur = parseFloat(display);
      if (acc !== null && op && !fresh) {
        const r = apply(acc, cur, op);
        if (isNaN(r)) {
          display = tt("\u65E0\u6CD5\u9664\u4EE5\u96F6", "Cannot divide by zero");
          acc = null;
          op = null;
          fresh = true;
          paint();
          return;
        }
        acc = r;
        display = fmt(r);
      } else acc = cur;
      op = next;
      fresh = true;
      paint();
    };
    const equals = () => {
      const cur = parseFloat(display);
      if (acc === null || op === null) {
        fresh = true;
        return;
      }
      const r = apply(acc, cur, op);
      if (isNaN(r)) {
        display = tt("\u65E0\u6CD5\u9664\u4EE5\u96F6", "Cannot divide by zero");
        acc = null;
        op = null;
      } else {
        display = fmt(r);
        acc = null;
        op = null;
      }
      fresh = true;
      paint();
    };
    const clearAll = () => {
      display = "0";
      acc = null;
      op = null;
      fresh = false;
      paint();
    };
    const backspace = () => {
      if (fresh) return;
      display = display.length > 1 ? display.slice(0, -1) : "0";
      paint();
    };
    const negate = () => {
      if (display !== "0") display = display.startsWith("-") ? display.slice(1) : "-" + display;
      paint();
    };
    const percent = () => {
      const v = parseFloat(display);
      display = fmt(v / 100);
      fresh = false;
      paint();
    };
    const KEYS = [
      [
        { k: "C", lab: "C", cls: "c-fn", fn: clearAll },
        { k: "Backspace", lab: "\u232B", cls: "c-fn", fn: backspace },
        { k: "%", lab: "%", cls: "c-fn", fn: percent },
        { k: "\xF7", lab: "\xF7", cls: "c-op", fn: () => setOp("\xF7") }
      ],
      [
        { k: "7", lab: "7", fn: () => digit("7") },
        { k: "8", lab: "8", fn: () => digit("8") },
        { k: "9", lab: "9", fn: () => digit("9") },
        { k: "\xD7", lab: "\xD7", cls: "c-op", fn: () => setOp("\xD7") }
      ],
      [
        { k: "4", lab: "4", fn: () => digit("4") },
        { k: "5", lab: "5", fn: () => digit("5") },
        { k: "6", lab: "6", fn: () => digit("6") },
        { k: "-", lab: "\u2212", cls: "c-op", fn: () => setOp("-") }
      ],
      [
        { k: "1", lab: "1", fn: () => digit("1") },
        { k: "2", lab: "2", fn: () => digit("2") },
        { k: "3", lab: "3", fn: () => digit("3") },
        { k: "+", lab: "+", cls: "c-op", fn: () => setOp("+") }
      ],
      [
        { k: "\xB1", lab: "\xB1", cls: "c-fn", fn: negate },
        { k: "0", lab: "0", fn: () => digit("0") },
        { k: ".", lab: ".", fn: () => digit(".") },
        { k: "=", lab: "=", cls: "c-eq", fn: equals }
      ]
    ];
    const grid = el("div", { cls: "calc-grid" });
    for (const row of KEYS)
      for (const key of row)
        grid.append(
          el("button", {
            cls: "calc-key " + (key.cls ?? "c-num"),
            text: key.lab,
            attrs: { "data-k": key.k },
            on: { click: key.fn }
          })
        );
    const onKey = (e) => {
      if (!win.body.contains(document.activeElement ?? document.body)) return;
      const k = e.key === "*" ? "\xD7" : e.key === "/" ? "\xF7" : e.key === "Enter" ? "=" : e.key === "Escape" ? "C" : e.key;
      const btn = grid.querySelector(`[data-k="${k}"]`);
      if (btn) {
        e.preventDefault();
        btn.click();
        btn.classList.add("pressed");
        window.setTimeout(() => btn.classList.remove("pressed"), 120);
      }
    };
    d.on(document, "keydown", onKey);
    main2.append(sub, disp, grid);
    win.body.replaceChildren(el("div", { cls: "calc" }, [main2]));
    paint();
    disp.focus();
  }
  var calculatorApp = {
    id: "calc",
    zh: "\u8BA1\u7B97\u5668",
    en: "Calculator",
    icon: "calc",
    tile: "linear-gradient(135deg,#4A5A6E,#37455A)",
    w: 360,
    h: 520,
    minW: 300,
    minH: 430,
    singleton: true,
    render: render4
  };

  // src/apps/paint.ts
  var SWATCHES = ["#000000", "#ffffff", "#E81123", "#F7630C", "#FFB900", "#107C10", "#0078D4", "#8764B8", "#E3008C", "#8A8886"];
  function render5(win) {
    win.setTitle(tt("\u753B\u56FE", "Paint"));
    let color = str(win, "color", "#0078D4");
    let size2 = num(win, "size", 4);
    let tool = str(win, "tool", "brush");
    const canvas = el("canvas", { cls: "pt-canvas", attrs: { width: "1100", height: "700" } });
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const saved = win.store.get("data");
    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = saved;
    }
    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) / r.width * canvas.width,
        y: (e.clientY - r.top) / r.height * canvas.height
      };
    };
    canvas.addEventListener("pointerdown", (e) => {
      canvas.setPointerCapture(e.pointerId);
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineWidth = tool === "eraser" ? size2 * 3 : size2;
      const onMove = (ev) => {
        const q = pos(ev);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      };
      const onUp = () => {
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        win.store.set("data", canvas.toDataURL("image/png"));
      };
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      ctx.lineTo(p.x + 0.01, p.y + 0.01);
      ctx.stroke();
    });
    const sizeRange = el("input", {
      cls: "pt-size",
      attrs: { type: "range", min: "1", max: "40", value: String(size2) }
    });
    sizeRange.addEventListener("input", () => {
      size2 = Number(sizeRange.value);
      win.store.set("size", size2);
    });
    const swatches = el("div", { cls: "pt-swatches" });
    const markSel = (sel) => {
      swatches.querySelectorAll(".pt-sw").forEach((s) => s.classList.toggle("sel", s.dataset.c === sel));
    };
    for (const c of SWATCHES) {
      const b = el("button", { cls: "pt-sw", dataset: { c }, style: { background: c }, attrs: { title: c } });
      b.addEventListener("click", () => {
        color = c;
        win.store.set("color", color);
        toolBtns("brush");
        markSel(color);
      });
      swatches.append(b);
    }
    const picker = el("input", {
      cls: "pt-picker",
      attrs: { type: "color", value: color.startsWith("#") ? color : "#0078D4" }
    });
    picker.addEventListener("input", () => {
      color = picker.value;
      win.store.set("color", color);
      toolBtns("brush");
      markSel("");
    });
    markSel(color);
    const btnBrush = el("button", { cls: "pt-tool sel", html: "", title: tt("\u753B\u7B14", "Brush"), children: [el("span", { cls: "pt-tool-ic brush" })] });
    const btnEraser = el("button", { cls: "pt-tool", title: tt("\u6A61\u76AE", "Eraser"), children: [el("span", { cls: "pt-tool-ic eraser" })] });
    const toolBtns = (t) => {
      tool = t;
      btnBrush.classList.toggle("sel", tool === "brush");
      btnEraser.classList.toggle("sel", tool === "eraser");
      win.store.set("tool", tool);
    };
    btnBrush.addEventListener("click", () => toolBtns("brush"));
    btnEraser.addEventListener("click", () => toolBtns("eraser"));
    toolBtns(tool);
    const btnClear = el("button", { cls: "fx-btn wide", children: [el("span", { text: tt("\u6E05\u7A7A", "Clear") })], on: { click: () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      win.store.set("data", canvas.toDataURL("image/png"));
    } } });
    const btnSave = el("button", { cls: "fx-btn wide accent", children: [el("span", { text: tt("\u4FDD\u5B58\u5230\u56FE\u7247", "Save to Pictures") })], on: { click: () => {
      const data = canvas.toDataURL("image/png");
      win.store.set("data", data);
      const name = uniqueName("/Pictures", "paint.png");
      createFile("/Pictures", name, "img", data);
      notify(tt("\u5DF2\u4FDD\u5B58", "Saved"), `/Pictures/${name}`, "paint");
    } } });
    const bar2 = el("div", { cls: "pt-bar" }, [
      el("div", { cls: "pt-group" }, [btnBrush, btnEraser]),
      swatches,
      picker,
      el("div", { cls: "pt-group" }, [sizeRange]),
      el("div", { cls: "pt-group" }, [btnClear, btnSave])
    ]);
    const stage = el("div", { cls: "pt-stage" }, [canvas]);
    win.body.replaceChildren(el("div", { cls: "pt" }, [bar2, stage]));
  }
  var paintApp = {
    id: "paint",
    zh: "\u753B\u56FE",
    en: "Paint",
    icon: "paint",
    tile: "linear-gradient(135deg,#E9A4C5,#D77BA8)",
    w: 840,
    h: 580,
    minW: 480,
    minH: 340,
    render: render5
  };

  // src/apps/photos.ts
  function resolveSrc(path) {
    const n = node(path);
    if (n && n.type === "file" && n.kind === "img") {
      const c = n.content ?? "";
      return { src: c.startsWith("data:") || c.startsWith("http") ? c : c.replace(/^\.?\//, ""), name: n.name };
    }
    return { src: path, name: basename(path) || "image" };
  }
  function render6(win) {
    makeDispose(win);
    const arg = win.store.get("openArg");
    const path = str(win, "path", typeof arg === "string" ? arg : "/Pictures/wallpaper.jpg");
    win.store.set("path", path);
    const { src, name } = resolveSrc(path);
    win.setTitle(`${name} \u2014 ${tt("\u7167\u7247", "Photos")}`);
    let scale = num(win, "scale", 1);
    let px = num(win, "px", 0);
    let py = num(win, "py", 0);
    const img = el("img", { cls: "ph-img", attrs: { src, alt: name, draggable: "false" } });
    const zoomLabel = el("span", { cls: "ph-zoom" });
    const apply2 = () => {
      img.style.transform = `translate(${px}px, ${py}px) scale(${scale})`;
      zoomLabel.textContent = `${Math.round(scale * 100)}%`;
      win.store.set("scale", scale);
      win.store.set("px", px);
      win.store.set("py", py);
    };
    const zoomBy = (f) => {
      scale = Math.min(8, Math.max(0.1, scale * f));
      if (scale <= 1) {
        px = 0;
        py = 0;
      }
      apply2();
    };
    const stage = el("div", { cls: "ph-stage" }, [img]);
    img.addEventListener("pointerdown", (e) => {
      if (scale <= 1) return;
      e.preventDefault();
      img.setPointerCapture(e.pointerId);
      const sx = e.clientX - px, sy = e.clientY - py;
      const onMove = (ev) => {
        px = ev.clientX - sx;
        py = ev.clientY - sy;
        apply2();
      };
      const onUp = () => {
        img.removeEventListener("pointermove", onMove);
        img.removeEventListener("pointerup", onUp);
      };
      img.addEventListener("pointermove", onMove);
      img.addEventListener("pointerup", onUp);
    });
    stage.addEventListener("wheel", (e) => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12);
    }, { passive: false });
    const bar2 = el("div", { cls: "ph-bar" }, [
      el("button", { cls: "fx-btn", children: [el("span", { text: "\u2212" })], on: { click: () => zoomBy(1 / 1.25) } }),
      zoomLabel,
      el("button", { cls: "fx-btn", children: [el("span", { text: "+" })], on: { click: () => zoomBy(1.25) } }),
      el("button", { cls: "fx-btn wide", children: [el("span", { text: tt("\u9002\u5E94", "Fit") })], on: { click: () => {
        scale = 1;
        px = 0;
        py = 0;
        apply2();
      } } }),
      el("button", { cls: "fx-btn wide", children: [el("span", { text: "1:1" })], on: { click: () => {
        scale = 1;
        px = 0;
        py = 0;
        apply2();
      } } })
    ]);
    apply2();
    win.body.replaceChildren(el("div", { cls: "ph" }, [bar2, stage]));
  }
  var photosApp = {
    id: "photos",
    zh: "\u7167\u7247",
    en: "Photos",
    icon: "photos",
    tile: "linear-gradient(135deg,#5B6B7E,#425062)",
    w: 760,
    h: 540,
    minW: 380,
    minH: 280,
    render: render6
  };

  // src/apps/settingsapp.ts
  function render7(win) {
    const s = getSettings();
    const section = str(win, "section", "person");
    win.store.set("section", section);
    win.setTitle(tt("\u8BBE\u7F6E", "Settings"));
    const NAV = [
      { id: "person", zh: "\u4E2A\u6027\u5316", en: "Personalization", ic: "palette" },
      { id: "time", zh: "\u65F6\u95F4\u548C\u8BED\u8A00", en: "Time & language", ic: "langIcon" },
      { id: "system", zh: "\u7CFB\u7EDF", en: "System", ic: "monitor" },
      { id: "about", zh: "\u5173\u4E8E", en: "About", ic: "info" }
    ];
    const content = el("div", { cls: "st-content" });
    const h2 = (zh, en) => el("h2", { cls: "st-h2", text: tt(zh, en) });
    const group = (...kids) => el("div", { cls: "st-group" }, kids);
    const paint = () => {
      content.replaceChildren();
      if (section === "person") {
        content.append(h2("\u4E3B\u9898", "Theme"));
        const themes = el("div", { cls: "st-themes" });
        for (const t of ["light", "dark"]) {
          const card = el("button", {
            cls: "st-theme" + (s.theme === t ? " sel" : ""),
            children: [
              el("div", { cls: `st-theme-prev ${t}` }),
              el("span", { text: tt("\u6D45\u8272", "Light") })
            ],
            on: { click: () => {
              patchSettings({ theme: t });
              paint();
            } }
          });
          if (t === "dark") card.children[1].textContent = tt("\u6DF1\u8272", "Dark");
          themes.append(card);
        }
        content.append(group(themes));
        content.append(h2("\u5F3A\u8C03\u8272", "Accent color"));
        const swatches = el("div", { cls: "st-swatches" });
        for (const a of ACCENTS) {
          const color = s.theme === "dark" ? a.dark : a.light;
          swatches.append(
            el("button", {
              cls: "st-sw" + (s.accent === a.id ? " sel" : ""),
              style: { background: color },
              attrs: { title: a.id },
              on: { click: () => {
                patchSettings({ accent: a.id });
                paint();
              } }
            }, [
              el("span", { cls: "st-sw-check", html: icon("check", 12) })
            ])
          );
        }
        content.append(group(swatches));
        content.append(h2("\u58C1\u7EB8", "Wallpaper"));
        const wps = el("div", { cls: "st-wps" });
        for (const w of WALLPAPERS) {
          wps.append(
            el("button", {
              cls: "st-wp" + (s.wallpaper === w.id ? " sel" : ""),
              children: [
                el("div", { cls: "st-wp-thumb", style: { background: w.thumb } }),
                el("span", { text: tt(w.zh, w.en) })
              ],
              on: { click: () => {
                patchSettings({ wallpaper: w.id });
                paint();
              } }
            })
          );
        }
        content.append(group(wps));
      }
      if (section === "time") {
        content.append(h2("\u8BED\u8A00 / Language", "Language / \u8BED\u8A00"));
        const langs = el("div", { cls: "st-langs" });
        for (const l of ["zh", "en"]) {
          langs.append(
            el("button", {
              cls: "st-lang" + (getLang() === l ? " sel" : ""),
              children: [el("span", { cls: "st-lang-name", text: l === "zh" ? "\u4E2D\u6587\uFF08\u7B80\u4F53\uFF09" : "English (US)" })],
              on: { click: () => {
                setLang(l);
                paint();
              } }
            })
          );
        }
        content.append(group(langs));
        content.append(h2("\u65F6\u95F4", "Time"));
        content.append(group(
          el("label", { cls: "st-row" }, [
            el("span", { text: tt("12 \u5C0F\u65F6\u5236", "12-hour clock") }),
            (() => {
              const chk = el("input", { attrs: { type: "checkbox" } });
              chk.checked = s.hour12;
              chk.addEventListener("change", () => patchSettings({ hour12: chk.checked }));
              return chk;
            })()
          ])
        ));
      }
      if (section === "system") {
        content.append(h2("\u5B58\u50A8", "Storage"));
        const used = storageBytes() + (localStorage.getItem("wos.settings")?.length ?? 0);
        const cap = 5 * 1024 * 1024;
        content.append(group(
          el("div", { cls: "st-storage" }, [
            el("div", { cls: "st-bar" }, [el("div", { cls: "st-bar-fill", style: { width: `${Math.min(100, used / cap * 100).toFixed(2)}%` } })]),
            el("div", { cls: "st-storage-text", text: tt(`\u5DF2\u7528 ${(used / 1024).toFixed(1)} KiB / 5 MiB\uFF08localStorage\uFF09`, `Used ${(used / 1024).toFixed(1)} KiB of 5 MiB (localStorage)`) })
          ])
        ));
        content.append(h2("\u91CD\u7F6E", "Reset"));
        content.append(group(
          el("div", { cls: "st-col" }, [
            el("button", {
              cls: "btn",
              text: tt("\u6E05\u7A7A\u6587\u4EF6\u7CFB\u7EDF\uFF08\u6062\u590D\u9ED8\u8BA4\uFF09", "Reset file system"),
              on: { click: async () => {
                if (await dlgConfirm(tt("\u91CD\u7F6E\u6587\u4EF6\u7CFB\u7EDF", "Reset file system"), tt("\u6240\u6709\u6587\u4EF6\u4E0E\u6587\u4EF6\u5939\u5C06\u88AB\u5220\u9664\uFF0C\u6062\u590D\u5230\u521D\u59CB\u72B6\u6001\u3002", "All files and folders will be restored to defaults."))) {
                  resetFS();
                  notify(tt("\u8BBE\u7F6E", "Settings"), tt("\u6587\u4EF6\u7CFB\u7EDF\u5DF2\u91CD\u7F6E", "File system reset"), "settingsApp");
                }
              } }
            }),
            el("button", {
              cls: "btn danger",
              text: tt("\u6062\u590D\u51FA\u5382\u8BBE\u7F6E\uFF08\u6E05\u9664\u5168\u90E8\u6570\u636E\uFF09", "Factory reset (erase everything)"),
              on: { click: async () => {
                if (await dlgConfirm(tt("\u6062\u590D\u51FA\u5382\u8BBE\u7F6E", "Factory reset"), tt("\u5C06\u6E05\u9664\u6240\u6709\u8BBE\u7F6E\u4E0E\u6587\u4EF6\u5E76\u91CD\u65B0\u542F\u52A8\u3002\u7EE7\u7EED\uFF1F", "All settings and files will be erased and the OS will restart. Continue?"))) {
                  localStorage.removeItem("wos.settings");
                  localStorage.removeItem("wos.fs");
                  localStorage.removeItem("wos.lang");
                  location.reload();
                }
              } }
            })
          ])
        ));
      }
      if (section === "about") {
        content.append(h2("\u5173\u4E8E\u672C\u673A", "About"));
        content.append(group(
          el("div", { cls: "st-kv" }, [
            el("div", { text: tt("\u64CD\u4F5C\u7CFB\u7EDF", "OS") }),
            el("div", { text: "s9y OS 1.0.0" }),
            el("div", { text: tt("\u6784\u5EFA", "Built with") }),
            el("div", { text: "TypeScript \xB7 \u96F6\u4F9D\u8D56 zero-dependency" }),
            el("div", { text: tt("\u6D4F\u89C8\u5668", "Browser") }),
            el("div", { text: navigator.userAgent.split(") ").pop() ?? navigator.userAgent }),
            el("div", { text: tt("\u754C\u9762\u8BED\u8A00", "UI language") }),
            el("div", { text: getLang() === "zh" ? "\u4E2D\u6587\uFF08\u7B80\u4F53\uFF09" : "English" }),
            el("div", { text: tt("\u5C4F\u5E55", "Display") }),
            el("div", { text: `${screen.width} \xD7 ${screen.height}` }),
            el("div", { text: tt("\u8BBE\u5907\u5185\u5B58", "Device memory") }),
            el("div", { text: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "\u2014" })
          ])
        ));
      }
    };
    const nav = el("nav", { cls: "st-nav" });
    for (const n of NAV) {
      nav.append(
        el("button", {
          cls: "st-nav-item" + (n.id === section ? " cur" : ""),
          children: [el("span", { cls: "st-nav-ic", html: icon(n.ic, 16) }), el("span", { text: tt(n.zh, n.en) })],
          on: { click: () => {
            win.store.set("section", n.id);
            render7(win);
          } }
        })
      );
    }
    paint();
    win.body.replaceChildren(el("div", { cls: "st" }, [nav, content]));
  }
  var settingsAppDef = {
    id: "settings",
    zh: "\u8BBE\u7F6E",
    en: "Settings",
    icon: "settingsApp",
    tile: "linear-gradient(135deg,#9AA5B1,#77828E)",
    w: 860,
    h: 580,
    minW: 560,
    minH: 400,
    singleton: true,
    render: render7
  };

  // src/apps/taskmgr.ts
  function render8(win) {
    const d = makeDispose(win);
    win.setTitle(tt("\u4EFB\u52A1\u7BA1\u7406\u5668", "Task Manager"));
    const canvas = el("canvas", { cls: "tk-canvas", attrs: { width: "600", height: "90" } });
    const ctx = canvas.getContext("2d");
    const hist = new Array(80).fill(6);
    const meters = /* @__PURE__ */ new Map();
    const table = el("div", { cls: "tk-table" });
    const footer = el("div", { cls: "tk-footer" });
    const jitter = (v, lo, hi) => Math.min(hi, Math.max(lo, v + (Math.random() - 0.5) * 4));
    const tick = () => {
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
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(128,128,128,.25)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, H / 4 * i);
        ctx.lineTo(W, H / 4 * i);
        ctx.stroke();
      }
      const acc = getComputedStyle(document.documentElement).getPropertyValue("--accent") || "#0078D4";
      ctx.strokeStyle = acc.trim();
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      hist.forEach((v, i) => {
        const x = i / (hist.length - 1) * W;
        const y = H - v / 100 * H;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = acc.trim() + "22";
      ctx.fill();
      table.replaceChildren(
        el("div", { cls: "tk-row tk-head" }, [
          el("span", { cls: "tk-c1", text: tt("\u540D\u79F0", "Name") }),
          el("span", { cls: "tk-c2", text: tt("\u72B6\u6001", "Status") }),
          el("span", { cls: "tk-c3", text: "CPU" }),
          el("span", { cls: "tk-c4", text: tt("\u5185\u5B58", "Memory") }),
          el("span", { cls: "tk-c5", text: "" })
        ]),
        ...wins.map((w) => {
          const app = getApp(w.appId);
          const m = meters.get(w.id) ?? { cpu: 0, mem: 0 };
          return el("div", { cls: "tk-row" + (w.focused ? " focused" : "") }, [
            el("span", { cls: "tk-c1 tk-name" }, [
              el("span", { cls: "tk-ic", html: icon(app?.icon ?? "fileBin", 16) }),
              el("span", { text: w.title || tt(app?.zh ?? w.appId, app?.en ?? w.appId) })
            ]),
            el("span", { cls: "tk-c2", text: w.minimized ? tt("\u5DF2\u6682\u505C", "Suspended") : tt("\u8FD0\u884C\u4E2D", "Running") }),
            el("span", { cls: "tk-c3", text: `${m.cpu.toFixed(1)}%` }),
            el("span", { cls: "tk-c4", text: `${m.mem.toFixed(0)} MB` }),
            el("span", { cls: "tk-c5" }, [
              el("button", { cls: "tk-end", text: tt("\u7ED3\u675F\u4EFB\u52A1", "End task"), on: { click: () => wm.close(w.id) } })
            ])
          ]);
        }),
        wins.length === 0 ? el("div", { cls: "tk-empty", text: tt("\u6CA1\u6709\u6B63\u5728\u8FD0\u884C\u7684\u5E94\u7528\u7A97\u53E3", "No running app windows") }) : null
      );
      footer.textContent = tt(
        `\u8FDB\u7A0B ${wins.length}   \xB7   CPU ${totalCpu.toFixed(0)}%   \xB7   \u5185\u5B58 ${(totalMem / 1024).toFixed(2)} GB / 8 GB`,
        `Processes ${wins.length}   \xB7   CPU ${totalCpu.toFixed(0)}%   \xB7   Memory ${(totalMem / 1024).toFixed(2)} GB of 8 GB`
      );
    };
    tick();
    const iv = window.setInterval(tick, 1500);
    d.timer(iv);
    win.body.replaceChildren(el("div", { cls: "tk" }, [canvas, table, footer]));
  }
  var taskmgrApp = {
    id: "taskmgr",
    zh: "\u4EFB\u52A1\u7BA1\u7406\u5668",
    en: "Task Manager",
    icon: "taskmgr",
    tile: "linear-gradient(135deg,#2C3A4A,#1E2833)",
    w: 700,
    h: 520,
    minW: 520,
    minH: 360,
    singleton: true,
    render: render8,
    onClose: (win) => win.store.get("dispose")?.forEach((f) => f())
  };

  // src/apps/clockapp.ts
  var ZONES = [
    { tz: "local", zh: "\u672C\u5730\u65F6\u95F4", en: "Local time" },
    { tz: "Europe/Berlin", zh: "\u6CD5\u5170\u514B\u798F", en: "Frankfurt" },
    { tz: "Europe/London", zh: "\u4F26\u6566", en: "London" },
    { tz: "America/Los_Angeles", zh: "\u897F\u96C5\u56FE", en: "Seattle" },
    { tz: "Asia/Shanghai", zh: "\u4E0A\u6D77", en: "Shanghai" },
    { tz: "Asia/Tokyo", zh: "\u4E1C\u4EAC", en: "Tokyo" }
  ];
  function render9(win) {
    const d = makeDispose(win);
    const tab = str(win, "tab", "world");
    win.store.set("tab", tab);
    win.setTitle(tt("\u65F6\u949F", "Clock"));
    const tabs = el("div", { cls: "ck-tabs" }, [
      el("button", { cls: "ck-tab" + (tab === "world" ? " cur" : ""), text: tt("\u4E16\u754C\u65F6\u949F", "World clock"), on: { click: () => {
        win.store.set("tab", "world");
        render9(win);
      } } }),
      el("button", { cls: "ck-tab" + (tab === "sw" ? " cur" : ""), text: tt("\u79D2\u8868", "Stopwatch"), on: { click: () => {
        win.store.set("tab", "sw");
        render9(win);
      } } })
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
            el("div", { cls: "ck-tz", text: z.tz === "local" ? Intl.DateTimeFormat().resolvedOptions().timeZone : z.tz })
          ]),
          el("div", { cls: "ck-right" }, [time, date])
        ]);
        return { z, time, date, row };
      });
      pane.append(...rows.map((r) => r.row));
      const update = () => {
        const now = /* @__PURE__ */ new Date();
        for (const r of rows) {
          const opt = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: r.z.tz === "local" ? void 0 : r.z.tz };
          r.time.textContent = new Intl.DateTimeFormat(locale, opt).format(now);
          r.date.textContent = new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", timeZone: r.z.tz === "local" ? void 0 : r.z.tz }).format(now);
        }
      };
      update();
      d.timer(window.setInterval(update, 1e3));
    } else {
      let running = bool(win, "swRun", false);
      let accMs = num(win, "swAcc", 0);
      let startTs = num(win, "swStart", 0);
      const laps = win.store.get("laps") ?? [];
      win.store.set("laps", laps);
      const disp = el("div", { cls: "sw-disp", text: "00:00.00" });
      const lapList = el("div", { cls: "sw-laps" });
      const fmt2 = (ms) => {
        const m = Math.floor(ms / 6e4);
        const s = Math.floor(ms % 6e4 / 1e3);
        const cs = Math.floor(ms % 1e3 / 10);
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
      };
      const paintLaps = () => {
        lapList.replaceChildren(
          ...laps.map((l, i) => el("div", { cls: "sw-lap" }, [
            el("span", { text: `#${laps.length - i}` }),
            el("span", { text: fmt2(l) })
          ])).reverse()
        );
      };
      paintLaps();
      const btnStart = el("button", { cls: "btn btn-accent" });
      const btnLap = el("button", { cls: "btn" });
      const btnReset = el("button", { cls: "btn" });
      const paintBtns = () => {
        btnStart.textContent = running ? tt("\u6682\u505C", "Pause") : tt("\u5F00\u59CB", "Start");
        btnLap.textContent = tt("\u8BA1\u6B21", "Lap");
        btnReset.textContent = tt("\u91CD\u7F6E", "Reset");
      };
      paintBtns();
      const total = () => accMs + (running ? Date.now() - startTs : 0);
      const update = () => {
        disp.textContent = fmt2(total());
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
        if (total() > 0) {
          laps.unshift(total());
          paintLaps();
        }
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
        lapList
      );
      d.timer(window.setInterval(() => {
        if (running) update();
      }, 33));
    }
    win.body.replaceChildren(el("div", { cls: "ck" }, [tabs, pane]));
  }
  var clockApp = {
    id: "clock",
    zh: "\u65F6\u949F",
    en: "Clock",
    icon: "clock",
    tile: "linear-gradient(135deg,#4D9DE0,#2F6FB2)",
    w: 560,
    h: 520,
    minW: 380,
    minH: 380,
    singleton: true,
    render: render9,
    onClose: (win) => win.store.get("dispose")?.forEach((f) => f())
  };

  // src/apps/about.ts
  var LINKS = [
    { zh: "GitHub \u2014 s3hq4y", en: "GitHub \u2014 s3hq4y", href: "https://github.com/s3hq4y", ic: "github" },
    { zh: "Portal \u9879\u76EE", en: "Portal project", href: "https://github.com/s3hq4y/portal", ic: "external" },
    { zh: "\u90AE\u7BB1", en: "Email", href: "mailto:s3hq4y@gmail.com", ic: "mail" },
    { zh: "Discord \u793E\u533A", en: "Discord community", href: "https://discord.gg/HnmEeeNrKF", ic: "discord" }
  ];
  var CHIPS = [
    ["AI", "AI"],
    ["\u65B0\u6280\u672F", "New tech"],
    ["Web", "Web"],
    ["TypeScript", "TypeScript"],
    ["\u5F00\u6E90", "Open source"]
  ];
  function render10(win) {
    win.setTitle(tt("\u5173\u4E8E", "About"));
    const open = (href) => {
      window.open(href, "_blank", "noopener");
    };
    win.body.replaceChildren(
      el("div", { cls: "ab" }, [
        el("div", { cls: "ab-hero" }, [
          el("div", { cls: "ab-avatar", text: "s9y" }),
          el("div", { cls: "ab-id" }, [
            el("div", { cls: "ab-name", text: "s3hq4y (s9y)" }),
            el("div", { cls: "ab-tag", text: tt("\u4E16\u754C\u6784\u5EFA\u8005 \xB7 World Builder", "World Builder") })
          ])
        ]),
        el("p", {
          cls: "ab-bio",
          text: tt(
            "\u4F60\u597D\uFF0C\u6211\u662F s9y \u2014\u2014 \u4E00\u4E2A\u505C\u4E0D\u4E0B\u624B\u7684\u5F00\u53D1\u8005\uFF0C\u559C\u6B22\u7528\u4EE3\u7801\u642D\u5EFA\u5C0F\u4E16\u754C\uFF1AAI\u3001\u65B0\u6280\u672F\u548C Web \u5B9E\u9A8C\u3002\u4F60\u73B0\u5728\u770B\u5230\u7684\u6574\u4E2A\u201C\u64CD\u4F5C\u7CFB\u7EDF\u201D\u5C31\u662F\u4E00\u4E2A TypeScript \u9875\u9762\u3002",
            "Hi, I'm s9y \u2014 a developer with a builder's itch, making little worlds out of code: AI, new tech and web experiments. This entire \u201Coperating system\u201D is one TypeScript page."
          )
        }),
        el("div", { cls: "ab-chips" }, CHIPS.map(([zh, en]) => el("span", { cls: "ab-chip", text: tt(zh, en) }))),
        el("div", { cls: "ab-card" }, [
          el("div", { cls: "ab-card-head" }, [
            el("span", { cls: "ab-card-ic", html: icon("external", 15) }),
            el("span", { cls: "ab-card-title", text: "Portal" }),
            el("span", { cls: "ab-card-badge", text: "VS Code \u6269\u5C55 \xB7 Extension" })
          ]),
          el("p", {
            cls: "ab-card-p",
            text: tt(
              "Portal \u628A\u4F60\u7684 VS Code \u5DE5\u4F5C\u533A\u66B4\u9732\u4E3A\u516C\u5F00\u7684 MCP \u7AEF\u70B9\u2014\u2014\u523B\u610F\u4FDD\u6301\u7CBE\u7B80\uFF1A\u53EA\u5305\u542B\u547D\u4EE4\u6267\u884C\u4E0E\u6587\u4EF6\u4F20\u8F93\u3002\u4EFB\u4F55 MCP \u5BA2\u6237\u7AEF\uFF08Claude\u3001ChatGPT\u3001Cursor\uFF0C\u751A\u81F3 curl\uFF09\u90FD\u80FD\u8FDE\u63A5\u5230\u4F60\u7684\u673A\u5668\u3002",
              "Portal exposes your VS Code workspace as a public MCP endpoint \u2014 deliberately minimal: command execution and file transfer only. Any MCP client (Claude, ChatGPT, Cursor, even curl) can connect to your machine."
            )
          }),
          el("p", {
            cls: "ab-card-p dim",
            text: tt(
              "\u4F60\u73B0\u5728\u770B\u5230\u7684\u8FD9\u4E2A\u7F51\u7AD9\uFF0C\u6B63\u662F\u901A\u8FC7 Portal \u96A7\u9053\u7531 AI \u4EE3\u7406\u6784\u5EFA\u5E76\u63A8\u9001\u7684\u3002",
              "This very site was built and pushed by an AI agent through the Portal tunnel."
            )
          })
        ]),
        el("div", { cls: "ab-links" }, LINKS.map(
          (l) => el("button", {
            cls: "ab-link",
            children: [
              el("span", { cls: "ab-link-ic", html: icon(l.ic, 16) }),
              el("span", { text: tt(l.zh, l.en) })
            ],
            on: { click: () => open(l.href) }
          })
        )),
        el("div", { cls: "ab-foot", text: tt("s9y OS 1.0.0 \xB7 TypeScript \xB7 \u65E0\u6846\u67B6\u65E0\u4F9D\u8D56", "s9y OS 1.0.0 \xB7 TypeScript \xB7 no frameworks, no dependencies") })
      ])
    );
  }
  var aboutApp = {
    id: "about",
    zh: "\u5173\u4E8E s9y",
    en: "About s9y",
    icon: "about",
    tile: "linear-gradient(135deg,#8764B8,#6A4A99)",
    w: 560,
    h: 640,
    minW: 420,
    minH: 420,
    singleton: true,
    render: render10
  };

  // src/apps/registry.ts
  var APPS = [
    explorerApp,
    notepadApp,
    terminalApp,
    calculatorApp,
    paintApp,
    photosApp,
    clockApp,
    taskmgrApp,
    settingsAppDef,
    aboutApp
  ];
  function getApp(id) {
    return APPS.find((a) => a.id === id);
  }
  function searchApps(query) {
    const q = query.trim().toLowerCase();
    if (!q) return APPS;
    return APPS.filter((a) => a.id.includes(q) || a.zh.toLowerCase().includes(q) || a.en.toLowerCase().includes(q));
  }

  // src/os/taskbar.ts
  var PINNED = ["files", "terminal", "notepad", "calc"];
  var bar = null;
  var panels = null;
  var openPanelId = null;
  var openTrigger = null;
  var clockEl = null;
  var dateEl = null;
  var searchInput = null;
  var calMonth = /* @__PURE__ */ new Date();
  calMonth.setDate(1);
  function closePanels() {
    if (!panels) return;
    panels.replaceChildren();
    openPanelId = null;
    openTrigger?.classList.remove("active");
    openTrigger = null;
    if (searchInput) searchInput.value = "";
  }
  function togglePanel(spec, trigger) {
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
  function isPanelClick(target) {
    if (!panels) return false;
    return panels.contains(target) || (openTrigger?.contains(target) ?? false);
  }
  function buildStart() {
    const menu = el("div", { cls: "start" });
    const grid = el("div", { cls: "start-grid" });
    for (const app of APPS) {
      grid.append(
        el("button", {
          cls: "start-tile",
          children: [
            el("span", { cls: "start-tile-ic", style: { background: app.tile }, html: icon(app.icon, 26) }),
            el("span", { cls: "start-tile-name", text: tt(app.zh, app.en) })
          ],
          on: { click: () => {
            closePanels();
            wm.open(app.id);
          } }
        })
      );
    }
    const power = el("button", { cls: "tb-ic-btn", html: icon("power", 16), title: tt("\u7535\u6E90", "Power") });
    power.addEventListener("click", (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      showMenu(r.left, r.top - 130, [
        { icon: "lock", label: tt("\u9501\u5B9A", "Lock"), onClick: () => {
          closePanels();
          window.dispatchEvent(new Event("os-lock"));
        } },
        { icon: "restart", label: tt("\u91CD\u542F", "Restart"), onClick: () => window.dispatchEvent(new Event("os-reboot")) },
        { icon: "power", label: tt("\u5173\u673A", "Shut down"), danger: true, onClick: () => {
          closePanels();
          window.dispatchEvent(new Event("os-shutdown"));
        } }
      ]);
    });
    menu.append(
      el("div", { cls: "start-head" }, [
        el("div", { cls: "start-user" }, [
          el("span", { cls: "start-avatar", html: icon("user", 15) }),
          el("span", { cls: "start-username", text: getSettings().user })
        ]),
        power
      ]),
      grid,
      el("div", { cls: "start-foot", text: tt("s9y OS 1.0 \xB7 TypeScript", "s9y OS 1.0 \xB7 TypeScript") })
    );
    return menu;
  }
  function buildSearchResults(query) {
    const wrap = el("div", { cls: "search-pop" });
    const results = searchApps(query);
    if (!results.length) {
      wrap.append(el("div", { cls: "search-empty", text: tt("\u6CA1\u6709\u5339\u914D\u7684\u5E94\u7528", "No matching apps") }));
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
              el("div", { cls: "search-sub", text: app.id })
            ]),
            el("span", { cls: "search-enter", text: i === 0 ? "\u21B5" : "" })
          ],
          on: { click: () => {
            closePanels();
            wm.open(app.id);
          } }
        })
      );
    });
    return wrap;
  }
  function buildCalendar() {
    const s = getSettings();
    const now = /* @__PURE__ */ new Date();
    const pane = el("div", { cls: "cal" });
    pane.append(
      el("div", { cls: "cal-big", text: fmtTime(now, s.hour12) }),
      el("div", { cls: "cal-date", text: `${fmtWeekday(now)} \xB7 ${fmtDate(now, true)}` })
    );
    const grid = el("div", { cls: "cal-grid" });
    const header = el("div", { cls: "cal-head" });
    const title = el("span", {
      cls: "cal-title",
      text: calMonth.toLocaleDateString(getLang() === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "long" })
    });
    const prev = el("button", { cls: "tb-ic-btn", html: icon("chevronLeft", 13) });
    const next = el("button", { cls: "tb-ic-btn", html: icon("chevronRight", 13) });
    prev.addEventListener("click", () => {
      calMonth.setMonth(calMonth.getMonth() - 1);
      refresh();
    });
    next.addEventListener("click", () => {
      calMonth.setMonth(calMonth.getMonth() + 1);
      refresh();
    });
    header.append(prev, title, next);
    const cells = el("div", { cls: "cal-cells" });
    const week = getLang() === "zh" ? ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"] : ["S", "M", "T", "W", "T", "F", "S"];
    for (const d of week) cells.append(el("span", { cls: "cal-wk", text: d }));
    const fill = () => {
      cells.querySelectorAll(".cal-day").forEach((n) => n.remove());
      const y = calMonth.getFullYear(), m = calMonth.getMonth();
      const first = new Date(y, m, 1);
      const startPad = first.getDay();
      const days = new Date(y, m + 1, 0).getDate();
      for (let i = 0; i < startPad; i++) cells.append(el("span", { cls: "cal-day pad", text: "" }));
      const today = /* @__PURE__ */ new Date();
      for (let d = 1; d <= days; d++) {
        const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
        cells.append(el("span", { cls: "cal-day" + (isToday ? " today" : ""), text: String(d) }));
      }
    };
    const refresh = () => {
      title.textContent = calMonth.toLocaleDateString(getLang() === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "long" });
      fill();
    };
    fill();
    grid.append(header, cells);
    pane.append(grid);
    return pane;
  }
  function buildNotifCenter() {
    const pane = el("div", { cls: "nc" });
    const list3 = notifications();
    const head = el("div", { cls: "nc-head" }, [
      el("span", { text: tt("\u901A\u77E5", "Notifications") }),
      list3.length ? el("button", { cls: "nc-clear", text: tt("\u5168\u90E8\u6E05\u9664", "Clear all"), on: { click: () => clearNotifications() } }) : el("span")
    ]);
    pane.append(head);
    if (!list3.length) {
      pane.append(el("div", { cls: "nc-empty", text: tt("\u6CA1\u6709\u65B0\u901A\u77E5", "No new notifications") }));
      return pane;
    }
    for (const n of list3) {
      pane.append(
        el("div", { cls: "nc-item" }, [
          el("span", { cls: "nc-ic", html: icon(n.icon, 16) }),
          el("div", { cls: "nc-text" }, [
            el("div", { cls: "nc-title", text: n.title }),
            el("div", { cls: "nc-body", text: n.body }),
            el("div", { cls: "nc-time", text: fmtTime(n.time, false) })
          ]),
          el("button", { cls: "nc-x", html: icon("close", 11), on: { click: (e) => {
            e.stopPropagation();
            removeNotification(n.id);
            refresh();
          } } })
        ])
      );
    }
    const refresh = () => {
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
  function buildQuick() {
    const pane = el("div", { cls: "qs" });
    const s = getSettings();
    const wifiBtn = el("button", { cls: "qs-tile on" }, [
      el("span", { cls: "qs-tile-ic", html: icon("wifi", 18) }),
      el("span", { cls: "qs-tile-label", text: tt("s9y-WiFi", "s9y-WiFi") })
    ]);
    wifiBtn.addEventListener("click", () => wifiBtn.classList.toggle("on"));
    const themeBtn = el("button", { cls: "qs-tile" + (s.theme === "dark" ? " on" : "") }, [
      el("span", { cls: "qs-tile-ic", html: icon(s.theme === "dark" ? "moon" : "sun", 18) }),
      el("span", { cls: "qs-tile-label", text: tt("\u6DF1\u8272\u6A21\u5F0F", "Dark mode") })
    ]);
    themeBtn.addEventListener("click", () => {
      const next = getSettings().theme === "dark" ? "light" : "dark";
      patchSettings({ theme: next });
      themeBtn.classList.toggle("on", next === "dark");
      themeBtn.querySelector(".qs-tile-ic").innerHTML = icon(next === "dark" ? "moon" : "sun", 18);
    });
    const langBtn = el("button", { cls: "qs-tile" }, [
      el("span", { cls: "qs-tile-ic", html: icon("globe", 18) }),
      el("span", { cls: "qs-tile-label", text: getLang() === "zh" ? "\u4E2D\u6587" : "EN" })
    ]);
    langBtn.addEventListener("click", () => {
      setLang(getLang() === "zh" ? "en" : "zh");
      closePanels();
    });
    const bright = el("input", { cls: "qs-slider", attrs: { type: "range", min: "30", max: "100", value: "100" } });
    bright.addEventListener("input", () => {
      const wp = document.getElementById("wallpaper");
      if (wp) wp.style.filter = `brightness(${Number(bright.value) / 100})`;
    });
    const vol = el("input", { cls: "qs-slider", attrs: { type: "range", min: "0", max: "100", value: "70" } });
    pane.append(
      el("div", { cls: "qs-tiles" }, [wifiBtn, themeBtn, langBtn]),
      el("div", { cls: "qs-row" }, [el("span", { cls: "qs-row-ic", html: icon("sun", 15) }), bright]),
      el("div", { cls: "qs-row" }, [el("span", { cls: "qs-row-ic", html: icon("volume", 15) }), vol])
    );
    return pane;
  }
  function taskButton(app, wins) {
    const running = wins.length > 0;
    const focused = wm.focused() !== null && wins.includes(wm.focused());
    const btn = el("button", {
      cls: "tb-task" + (running ? " running" : "") + (focused ? " active" : ""),
      title: tt(app.zh, app.en),
      html: icon(app.icon, 22)
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
        items.push({ icon: "close", label: tt("\u5173\u95ED\u7A97\u53E3", "Close window"), danger: true, onClick: () => wins.forEach((id) => wm.close(id)) });
      items.push({ icon: app.icon, label: tt(`\u6253\u5F00 ${app.zh}`, `Open ${app.en}`), onClick: () => wm.open(app.id) });
      showMenu(e.clientX, e.clientY, items);
    });
    return btn;
  }
  function renderTasks() {
    const holder = bar?.querySelector(".tb-tasks");
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
  function renderClock() {
    if (!clockEl || !dateEl) return;
    const s = getSettings();
    const now = /* @__PURE__ */ new Date();
    clockEl.textContent = fmtTime(now, s.hour12);
    dateEl.textContent = fmtDate(now);
  }
  function renderTaskbar() {
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
  function initTaskbar() {
    bar = el("div", { id: "taskbar", cls: "taskbar" });
    panels = el("div", { id: "panels" });
    document.body.append(panels);
    const startBtn = el("button", { cls: "tb-start", html: icon("logo", 21), title: "s9y OS" });
    startBtn.addEventListener("click", () => togglePanel({ id: "start", anchor: "left", build: buildStart }, startBtn));
    searchInput = el("input", {
      cls: "tb-search-in",
      attrs: { type: "text", placeholder: tt("\u641C\u7D22\u5E94\u7528\u2026", "Search apps\u2026"), spellcheck: "false" }
    });
    const searchWrap = el("div", { cls: "tb-search" }, [el("span", { cls: "tb-search-ic", html: icon("search", 13) }), searchInput]);
    searchInput.addEventListener("input", () => {
      const q = searchInput.value;
      if (!q.trim()) {
        closePanels();
        return;
      }
      const build = () => buildSearchResults(q);
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
        const first = searchApps(searchInput.value)[0];
        if (first) {
          closePanels();
          wm.open(first.id);
        }
      } else if (e.key === "Escape") closePanels();
    });
    const tasks = el("div", { cls: "tb-tasks" });
    const tray = el("div", { cls: "tb-tray" });
    const langBtn = el("button", { cls: "tb-ic-btn", html: icon("globe", 15), title: tt("\u5207\u6362\u8BED\u8A00", "Switch language") });
    langBtn.addEventListener("click", () => {
      setLang(getLang() === "zh" ? "en" : "zh");
    });
    const themeBtn = el("button", { cls: "tb-ic-btn", html: icon(getSettings().theme === "dark" ? "moon" : "sun", 15), title: tt("\u5207\u6362\u4E3B\u9898", "Toggle theme") });
    themeBtn.addEventListener("click", () => {
      const next = getSettings().theme === "dark" ? "light" : "dark";
      patchSettings({ theme: next });
      themeBtn.innerHTML = icon(next === "dark" ? "moon" : "sun", 15);
    });
    const quickBtn = el("button", { cls: "tb-ic-btn tb-quick", html: icon("wifi", 15) + icon("volume", 15), title: tt("\u5FEB\u901F\u8BBE\u7F6E", "Quick settings") });
    quickBtn.addEventListener("click", () => togglePanel({ id: "quick", anchor: "right", build: buildQuick }, quickBtn));
    const bellBtn = el("button", { cls: "tb-ic-btn tb-bell", html: icon("bell", 15) + el("span", { cls: "tb-badge" }).outerHTML, title: tt("\u901A\u77E5", "Notifications") });
    bellBtn.addEventListener("click", () => togglePanel({ id: "notif", anchor: "right", build: buildNotifCenter }, bellBtn));
    clockEl = el("div", { cls: "tb-clock" });
    dateEl = el("div", { cls: "tb-date" });
    const clockBtn = el("button", { cls: "tb-clock-btn" }, [clockEl, dateEl]);
    clockBtn.addEventListener("click", () => togglePanel({ id: "cal", anchor: "right", build: buildCalendar }, clockBtn));
    const showDesk = el("button", { cls: "tb-showdesk", title: tt("\u663E\u793A\u684C\u9762", "Show desktop") });
    showDesk.addEventListener("click", () => {
      wm.list().forEach((w) => {
        if (!w.minimized) wm.minimize(w.id);
      });
    });
    tray.append(langBtn, themeBtn, quickBtn, bellBtn, clockBtn);
    bar.append(startBtn, searchWrap, tasks, tray, showDesk);
    document.body.append(bar);
    document.addEventListener("pointerdown", (e) => {
      if (openPanelId && !isPanelClick(e.target)) closePanels();
    }, true);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && openPanelId) closePanels();
    });
    window.setInterval(renderClock, 1e3);
    wm.onChange(() => renderTasks());
    window.addEventListener("os-notifs", () => renderTaskbar());
    window.addEventListener("os-settings", () => {
      themeBtn.innerHTML = icon(getSettings().theme === "dark" ? "moon" : "sun", 15);
    });
    window.addEventListener("os-lang", () => {
      searchInput?.setAttribute("placeholder", tt("\u641C\u7D22\u5E94\u7528\u2026", "Search apps\u2026"));
      closePanels();
      renderTaskbar();
    });
    window.addEventListener("resize", () => closePanels());
    renderTaskbar();
  }

  // src/os/boot.ts
  var lockEl = null;
  var bootEl = null;
  var shutdownEl = null;
  var lockClock = null;
  var lockDate = null;
  var lockTimer = 0;
  var unlockedThisSession = false;
  function tickLock() {
    if (!lockClock || !lockDate) return;
    const now = /* @__PURE__ */ new Date();
    lockClock.textContent = fmtTime(now, getSettings().hour12);
    lockDate.textContent = `${fmtWeekday(now)} \xB7 ${fmtDate(now, true)}`;
  }
  function playBoot(onReady) {
    bootEl = el("div", { id: "boot", cls: "boot" }, [
      el("div", { cls: "boot-logo", html: icon("logo", 64) }),
      el("div", { cls: "boot-name", text: "s9y OS" }),
      el("div", { cls: "boot-spinner" }, [el("div", { cls: "boot-dot d1" }), el("div", { cls: "boot-dot d2" }), el("div", { cls: "boot-dot d3" }), el("div", { cls: "boot-dot d4" }), el("div", { cls: "boot-dot d5" })]),
      el("div", { cls: "boot-hint", text: tt("TypeScript \xB7 \u65E0\u4F9D\u8D56", "TypeScript \xB7 zero-dependency") })
    ]);
    document.body.append(bootEl);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      bootEl?.classList.add("hide");
      window.setTimeout(() => bootEl?.remove(), 500);
      showLock(onReady);
    }, reduced ? 400 : 1700);
  }
  function showLock(onUnlock) {
    hideLock();
    lockEl = el("div", { id: "lock", cls: "lock" }, [
      el("div", { id: "lock-bg", cls: "lock-bg" }),
      el("div", { cls: "lock-inner" }, [
        el("div", { cls: "lock-clock-row" }, [
          el("div", { cls: "lock-clock" }),
          el("div", { cls: "lock-date" })
        ]),
        el("div", { cls: "lock-foot" }, [
          el("div", { cls: "lock-user", html: icon("user", 22) }),
          el("div", { cls: "lock-user-name", text: getSettings().user }),
          el("div", { cls: "lock-hint", text: tt("\u70B9\u51FB\u4EFB\u610F\u5904\u89E3\u9501 \xB7 Click anywhere to unlock", "\u70B9\u51FB\u4EFB\u610F\u5904\u89E3\u9501 \xB7 Click anywhere to unlock") })
        ])
      ])
    ]);
    document.body.append(lockEl);
    lockClock = lockEl.querySelector(".lock-clock");
    lockDate = lockEl.querySelector(".lock-date");
    tickLock();
    lockTimer = window.setInterval(tickLock, 1e3);
    const unlock = () => {
      hideLock();
      if (!unlockedThisSession) {
        unlockedThisSession = true;
        onUnlock?.();
      }
      window.dispatchEvent(new Event("os-unlocked"));
    };
    lockEl.addEventListener("click", unlock, { once: true });
    const onKey = (e) => {
      e.preventDefault();
      unlock();
      document.removeEventListener("keydown", onKey, true);
    };
    document.addEventListener("keydown", onKey, { once: true, capture: true });
  }
  function lockNow() {
    showLock();
  }
  function hideLock() {
    clearInterval(lockTimer);
    lockEl?.remove();
    lockEl = null;
  }
  function shutdownScreen() {
    if (shutdownEl) return;
    shutdownEl = el("div", { id: "shutdown", cls: "shutdown" }, [
      el("div", { cls: "shutdown-icon", html: icon("power", 44) }),
      el("div", { cls: "shutdown-text", text: tt("\u6B63\u5728\u5173\u673A\u2026", "Shutting down\u2026") }),
      el("div", { cls: "shutdown-hint", text: tt("\u70B9\u51FB\u4EFB\u610F\u5904\u91CD\u65B0\u542F\u52A8", "Click anywhere to restart") })
    ]);
    document.body.append(shutdownEl);
    requestAnimationFrame(() => shutdownEl?.classList.add("show"));
    window.setTimeout(() => {
      const t = shutdownEl?.querySelector(".shutdown-text");
      if (t) t.textContent = tt("\u518D\u89C1 \u{1F44B}", "Goodbye \u{1F44B}");
    }, 1600);
    shutdownEl.addEventListener("click", () => location.reload());
  }
  function initBootEvents() {
    window.addEventListener("os-shutdown", () => shutdownScreen());
    window.addEventListener("os-lock", () => lockNow());
    window.addEventListener("os-reboot", () => location.reload());
  }

  // src/main.ts
  function buildSkeleton() {
    document.body.append(el("div", { id: "wallpaper", cls: "wallpaper" }));
    const windows = el("div", { id: "windows", cls: "windows" });
    const snap = el("div", { id: "snap-preview", cls: "snap-preview" });
    const toasts = el("div", { id: "toasts", cls: "toasts" });
    const dialogs = el("div", { id: "dialogs", cls: "dialogs" });
    initDesktop();
    document.body.append(windows, snap, toasts, dialogs);
    return { windows, snap, toasts, dialogs };
  }
  function main() {
    initLang();
    initFS();
    applySettings();
    const { windows, snap, toasts, dialogs } = buildSkeleton();
    wm.setAppProvider(getApp);
    wm.setLayer(windows, snap);
    setDialogLayer(dialogs);
    setToastLayer(toasts);
    initTaskbar();
    initBootEvents();
    window.addEventListener("resize", () => {
      window.dispatchEvent(new Event("wm-resize"));
    });
    onLangChange(() => {
      wm.rerenderAll();
    });
    playBoot(() => {
      window.setTimeout(() => {
        notify(
          "s9y OS",
          "\u6B22\u8FCE\u4F7F\u7528 s9y OS \xB7 Welcome \u2014 \u6253\u5F00\u5F00\u59CB\u83DC\u5355\u63A2\u7D22\u5E94\u7528 / open the Start menu to explore",
          "logo"
        );
      }, 600);
    });
  }
  main();
})();
