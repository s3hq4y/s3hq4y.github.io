/* ============================================================
   dom.ts — tiny typed DOM helper
   ============================================================ */

export interface ElOpts {
  id?: string;
  cls?: string;
  text?: string;
  html?: string;
  attrs?: Record<string, string>;
  dataset?: Record<string, string>;
  style?: Partial<CSSStyleDeclaration>;
  title?: string;
  children?: (Node | string | null | undefined)[];
  on?: Partial<Record<keyof HTMLElementEventMap, (e: never) => void>>;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: ElOpts = {},
  extraChildren?: (Node | string | null | undefined)[],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.id) node.id = opts.id;
  if (opts.cls) node.className = opts.cls;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.html !== undefined) node.innerHTML = opts.html;
  if (opts.title !== undefined) node.title = opts.title;
  if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  if (opts.dataset) for (const [k, v] of Object.entries(opts.dataset)) node.dataset[k] = v;
  if (opts.style) Object.assign(node.style, opts.style);
  if (opts.on)
    for (const [ev, fn] of Object.entries(opts.on) as [string, (e: Event) => void][])
      node.addEventListener(ev, fn as EventListener);
  const children = opts.children ?? extraChildren;
  if (children)
    for (const c of children) {
      if (c == null) continue;
      node.append(typeof c === "string" ? document.createTextNode(c) : c);
    }
  return node;
}

export function clear(node: HTMLElement): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function qs<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T {
  const found = root.querySelector(sel);
  if (!found) throw new Error(`qs: ${sel} not found`);
  return found as T;
}

export function qsAll<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll(sel)) as T[];
}

/** Escape text for safe HTML interpolation. */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Run `fn` at most once per animation frame. */
export function rafThrottle<A extends unknown[]>(fn: (...a: A) => void): (...a: A) => void {
  let queued = false;
  let last: A;
  return (...a: A) => {
    last = a;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...last);
    });
  };
}
