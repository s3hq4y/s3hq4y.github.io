/* ============================================================
   fs.ts — virtual file system persisted in localStorage
   ============================================================ */

export type FileKind = "txt" | "img" | "bin";

export interface FSNode {
  name: string;
  type: "dir" | "file";
  kind?: FileKind;
  content?: string; // txt -> text, img -> dataURL or relative url
  mtime: number;
  children?: FSNode[];
  origin?: string; // for items in the recycle bin: original parent path
}

export const ROOT = "/";

const KEY = "wos.fs";
const FS_EVENT = "fs-changed";

let root: FSNode;

/* ---------- seed ---------- */

function seed(): FSNode {
  const now = Date.now();
  const txt = (name: string, content: string): FSNode => ({ name, type: "file", kind: "txt", content, mtime: now });
  return {
    name: "", type: "dir", mtime: now,
    children: [
      {
        name: "Desktop", type: "dir", mtime: now,
        children: [
          txt("welcome.txt",
`Welcome to s9y OS / 欢迎使用 s9y OS
=================================

This whole desktop is one TypeScript app.
整个桌面是一个 TypeScript 应用。

Try these / 试试这些：
  · Start menu (bottom-left) — all apps  开始菜单（左下角）
  · Terminal — type "help"             终端里输入 help
  · Drag windows to screen edges to snap 把窗口拖到屏幕边缘可以分屏
  · Right-click the desktop            右键点击桌面
  · Settings → Personalization         设置里可以换主题/强调色/壁纸

Built with ♥ by s9y — https://github.com/s3hq4y
`),
        ],
      },
      {
        name: "Documents", type: "dir", mtime: now,
        children: [
          txt("notes.txt", "s9y OS dev notes\n----------------\n- window manager: snap zones work\n- virtual fs: persisted in localStorage\n- next: more apps, better i18n coverage\n"),
          txt("todo.txt", "[ ] ship Portal v1.1\n[ ] write a blog post about web OS\n[ ] water the plants\n[x] delete the old landing page\n"),
        ],
      },
      { name: "Pictures", type: "dir", mtime: now, children: [{ name: "wallpaper-debian.svg", type: "file", kind: "img", content: "wallpaper-debian.svg", mtime: now }] },
      { name: "Downloads", type: "dir", mtime: now, children: [] },
      { name: "Music", type: "dir", mtime: now, children: [] },
      { name: "Recycle Bin", type: "dir", mtime: now, children: [] },
    ],
  };
}

/* ---------- persistence ---------- */

let saveTimer = 0;
function persist(): void {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(root));
    } catch {
      // quota exceeded — drop heaviest payload (paint images) and retry once
      try {
        localStorage.setItem(KEY, JSON.stringify(root, (_k, v: unknown) =>
          typeof v === "string" && v.startsWith("data:image") && v.length > 200_000 ? "" : v));
      } catch { /* give up silently */ }
    }
  }, 150);
}

export function initFS(): void {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      root = JSON.parse(raw) as FSNode;
      if (root.type !== "dir") throw new Error("bad fs");
    } else root = seed();
  } catch {
    root = seed();
  }
}

export function resetFS(): void {
  root = seed();
  persist();
  changed();
}

export function storageBytes(): number {
  return (localStorage.getItem(KEY) ?? "").length;
}

function changed(detail?: { path: string }): void {
  window.dispatchEvent(new CustomEvent(FS_EVENT, { detail: detail ?? null }));
}

export function onFSChange(fn: (e: Event) => void): void {
  window.addEventListener(FS_EVENT, fn);
}

/* ---------- path helpers ---------- */

export function normalize(path: string): string {
  const parts: string[] = [];
  for (const seg of path.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return "/" + parts.join("/");
}

export function join(...parts: string[]): string {
  return normalize(parts.join("/"));
}

export function parentOf(path: string): string {
  const n = normalize(path);
  if (n === ROOT) return ROOT;
  return n.slice(0, n.lastIndexOf("/")) || "/";
}

export function basename(path: string): string {
  const n = normalize(path);
  return n.slice(n.lastIndexOf("/") + 1);
}

export const RECYCLE = "/Recycle Bin";

/* ---------- core ops ---------- */

export function node(path: string): FSNode | null {
  let cur: FSNode = root;
  for (const seg of normalize(path).split("/").filter(Boolean)) {
    if (cur.type !== "dir" || !cur.children) return null;
    const next = cur.children.find((c) => c.name === seg);
    if (!next) return null;
    cur = next;
  }
  return cur;
}

export function exists(path: string): boolean {
  return node(path) !== null;
}

export function list(path: string): FSNode[] {
  const n = node(path);
  if (!n || n.type !== "dir") return [];
  return [...(n.children ?? [])].sort((a, b) =>
    a.type !== b.type ? (a.type === "dir" ? -1 : 1) : a.name.localeCompare(b.name, undefined, { numeric: true }));
}

export function uniqueName(dirPath: string, wanted: string): string {
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

export function mkdir(dirPath: string, name: string): string {
  const dir = node(dirPath);
  if (!dir || dir.type !== "dir") throw new Error("not a directory: " + dirPath);
  const finalName = uniqueName(dirPath, name);
  (dir.children ??= []).push({ name: finalName, type: "dir", mtime: Date.now(), children: [] });
  persist();
  changed({ path: dirPath });
  return join(dirPath, finalName);
}

export function createFile(dirPath: string, name: string, kind: FileKind = "txt", content = ""): string {
  const dir = node(dirPath);
  if (!dir || dir.type !== "dir") throw new Error("not a directory: " + dirPath);
  const finalName = uniqueName(dirPath, name);
  (dir.children ??= []).push({ name: finalName, type: "file", kind, content, mtime: Date.now() });
  persist();
  changed({ path: dirPath });
  return join(dirPath, finalName);
}

export function writeFile(path: string, content: string): void {
  const n = node(path);
  if (!n || n.type !== "file") throw new Error("no such file: " + path);
  n.content = content;
  n.mtime = Date.now();
  persist();
  changed({ path: parentOf(path) });
}

export function readFile(path: string): string {
  const n = node(path);
  return n && n.type === "file" ? n.content ?? "" : "";
}

export function rename(path: string, newName: string): string | null {
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

export function trash(path: string): void {
  const parent = node(parentOf(path));
  const n = node(path);
  if (!parent || !parent.children || !n) return;
  if (normalize(path) === RECYCLE || parentOf(path) === RECYCLE) {
    // already inside bin -> permanent delete
    purge(path);
    return;
  }
  parent.children = parent.children.filter((c) => c !== n);
  const bin = node(RECYCLE);
  if (bin && bin.type === "dir") {
    n.name = uniqueName(RECYCLE, n.name);
    n.origin = parentOf(path);
    (bin.children ??= []).push(n);
  }
  persist();
  changed({ path: parentOf(path) });
}

export function purge(path: string): void {
  const parent = node(parentOf(path));
  const n = node(path);
  if (!parent || !parent.children || !n) return;
  parent.children = parent.children.filter((c) => c !== n);
  persist();
  changed({ path: parentOf(path) });
}

export function emptyTrash(): void {
  const bin = node(RECYCLE);
  if (bin) bin.children = [];
  persist();
  changed({ path: RECYCLE });
}

export function restore(path: string): string | null {
  const n = node(path);
  const bin = node(RECYCLE);
  if (!n || !bin || !bin.children) return null;
  const dest = n.origin && exists(n.origin) ? n.origin : "/Documents";
  bin.children = bin.children.filter((c) => c !== n);
  delete n.origin;
  n.name = uniqueName(dest, n.name);
  const destNode = node(dest);
  if (destNode && destNode.type === "dir") (destNode.children ??= []).push(n);
  persist();
  changed({ path: dest });
  return join(dest, n.name);
}

/** Walk the whole tree, collecting file paths (optionally filtered by kind). */
export function allFiles(kind?: FileKind): string[] {
  const out: string[] = [];
  const walk = (n: FSNode, prefix: string) => {
    for (const c of n.children ?? []) {
      const p = prefix + "/" + c.name;
      if (c.type === "file" && (kind === undefined || c.kind === kind)) out.push(p);
      if (c.type === "dir" && p !== RECYCLE) walk(c, p);
    }
  };
  walk(root, "");
  return out;
}
