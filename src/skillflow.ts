// Skill-flow backdrop for the About section.
//
// Renders the technical-skills list as a dense grid of chips flowing
// right-to-left, then slices that image into square tiles that are pushed
// away from the pointer and spring back — the same tile-grid effect used by
// the s9y hero wordmark (see logogrid.ts).
//
// One offscreen buffer is redrawn each frame (cheap: a few dozen chips), and
// the visible canvas samples it per tile. The rAF loop keeps running while the
// flow scrolls; it never rebuilds the tile set except on resize.

export interface SkillFlowOptions {
  items: string[];
  rows?: number;
  cellPx?: number;
  speed?: number;
  radius?: number;
  push?: number;
  pointerTarget?: HTMLElement | null;
  ready?: Promise<unknown>;
}

export interface SkillFlowHandle {
  destroy(): void;
}

interface Tile {
  cx: number;
  cy: number;
  ox: number;
  oy: number;
  tx: number;
  ty: number;
}

const FONT = '"IBM Plex Mono", ui-monospace, monospace';
const GAP = 0;
const PADX = 9;
const ICON = 12;
const ICON_GAP = 6;
const FONT_PX = 13;
const FONT_WEIGHT = 500;

// The icon badge is painted in the brand color; the glyph on top is outlined
// in a contrasting color so it never disappears into its own background.
const FALLBACK_ICON_COLOR = '#8a8a92';
const ICON_OUTLINE_PX = 1;
const OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1],
];

// Icons are pulled from the Simple Icons CDN. Anything that fails to resolve
// simply falls back to the colored square badge, so the layout never breaks.
const ICON_BASE = 'https://cdn.simpleicons.org/';
const ICON_SLUG: Record<string, string> = {
  'TypeScript': 'typescript', 'JavaScript': 'javascript', 'Python': 'python',
  'Java': 'java', 'C++': 'cplusplus', 'C#': 'csharp', 'Go': 'go', 'PHP': 'php',
  'React': 'react', 'Next.js': 'nextdotjs', 'Vue': 'vuedotjs', 'Nuxt': 'nuxt',
  'Angular': 'angular', 'Redux': 'redux', 'React Native': 'react',
  'Tailwind': 'tailwindcss', 'SCSS': 'sass', 'Material-UI': 'mui',
  'Framer Motion': 'framer', 'GSAP': 'greensock', 'PWA': 'pwa',
  'Three.js': 'threedotjs', 'React Three Fiber': 'threedotjs',
  'Babylon.js': 'babylonjs', 'PlayCanvas': 'playcanvas', 'PixiJS': 'pixijs',
  'WebGL': 'webgl', 'Node.js': 'nodedotjs', 'Express': 'express',
  'NestJS': 'nestjs', 'Laravel': 'laravel', 'CodeIgniter': 'codeigniter',
  'GraphQL': 'graphql', 'Apollo': 'apollographql', 'REST': 'rest',
  'PostgreSQL': 'postgresql', 'MySQL': 'mysql', 'MongoDB': 'mongodb',
  'Redis': 'redis', 'Firebase': 'firebase', 'Prisma': 'prisma',
  'Docker': 'docker', 'AWS': 'amazonaws', 'Nginx': 'nginx', 'Caddy': 'caddy',
  'Git': 'git', 'NX': 'nx', 'Jest': 'jest',
};

// A resolved icon asset: its brand color, the brand-colored glyph, and a
// solid silhouette in the contrasting color used to draw the outline.
interface IconAsset {
  color: string;
  glyph: HTMLImageElement;
  outline: HTMLImageElement;
}

const iconCache = new Map<string, IconAsset | null>();
const iconPending = new Set<string>();

function normalizeHex(hex: string): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length === 8) h = h.slice(0, 6);
  return '#' + h.toLowerCase();
}

// WCAG relative luminance of a #rrggbb color, 0..1.
function luminance(hex: string): number {
  const h = normalizeHex(hex).slice(1);
  const toLin = (v: number): number => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const r = toLin(parseInt(h.slice(0, 2), 16) / 255);
  const g = toLin(parseInt(h.slice(2, 4), 16) / 255);
  const b = toLin(parseInt(h.slice(4, 6), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isLight(hex: string): boolean {
  return luminance(hex) > 0.5;
}

function svgImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('svg decode failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

// Fetch the brand SVG, read its fill color, then pre-render the glyph in its
// brand color plus a contrast-colored silhouette for the outline pass.
function loadIcon(label: string, onReady: () => void): void {
  if (iconCache.has(label) || iconPending.has(label)) return;
  const slug = ICON_SLUG[label];
  if (!slug) {
    iconCache.set(label, null);
    return;
  }
  iconPending.add(label);
  fetch(ICON_BASE + slug)
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
    .then(async (svg) => {
      const match = svg.match(/fill="(#[0-9a-fA-F]{3,8})"/);
      const raw = match ? match[1] : FALLBACK_ICON_COLOR;
      const color = normalizeHex(raw);
      const contrast = isLight(color) ? '#0a0a0b' : '#ffffff';
      const outlineSvg = svg.split(raw).join(contrast);
      const [glyph, outline] = await Promise.all([svgImage(svg), svgImage(outlineSvg)]);
      iconCache.set(label, { color, glyph, outline });
      onReady();
    })
    .catch(() => {
      iconCache.set(label, null);
      onReady();
    })
    .finally(() => {
      iconPending.delete(label);
    });
}

// A distinct accent color per skill chip: hashing the label keeps a given
// skill the same color wherever it appears in the flow.
const PALETTE = [
  '#e4002b', '#ffffff', '#9a9aa2', '#ff4d63', '#c9c9d0', '#6d6d74',
  '#e4002b', '#ffffff', '#ff4d63', '#b4b4ba', '#e4002b', '#8a0019',
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Chip height is derived from the row height at build time so adjacent rows
// touch with no vertical seams.
let chipH = 26;

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function mountSkillFlow(host: HTMLElement, opts: SkillFlowOptions): SkillFlowHandle {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = opts.items.slice();
  const rows = opts.rows ?? 4;
  const cellPx = opts.cellPx ?? 44;
  const speed = reduced ? 0 : (opts.speed ?? 22);
  const radius = opts.radius ?? 150;
  const push = opts.push ?? 20;
  const target = opts.pointerTarget ?? host.parentElement ?? host;

  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  host.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const src = document.createElement('canvas');
  const sctx = src.getContext('2d');

  const widths: number[] = [];
  let cycleW = 1;

  let cssW = 0;
  let cssH = 0;
  let dpr = 1;
  let cell = 40;
  let cols = 1;
  let rowH = 40;
  let tiles: Tile[] = [];
  let offset = 0;
  let last = 0;
  let raf = 0;
  let dead = false;
  let hasMouse = false;
  let mouseX = -9999;
  let mouseY = -9999;

  const measure = (): void => {
    if (!sctx) return;
    sctx.font = FONT_WEIGHT + ' ' + FONT_PX + 'px ' + FONT;
    widths.length = 0;
    cycleW = 0;
    const invalidate = (): void => { if (!dead) drawSource(); };
    for (const it of items) {
      loadIcon(it, invalidate);
      const w = Math.round(sctx.measureText(it).width) + PADX * 2 + ICON + ICON_GAP;
      widths.push(w);
      cycleW += w + GAP;
    }
    if (cycleW <= 0) cycleW = 1;
  };

  const drawChip = (x: number, y: number, w: number, label: string): void => {
    if (!sctx) return;
    const asset = iconCache.get(label);
    // Badge background comes from the icon's own brand color; without an icon,
    // fall back to a stable hash color so the chip still reads as a solid tile.
    const bg = asset ? asset.color : PALETTE[hashStr(label) % PALETTE.length];
    const contrast = isLight(bg) ? '#0a0a0b' : '#ffffff';
    sctx.fillStyle = bg;
    sctx.fillRect(x, y - chipH / 2, w, chipH);

    const ix = x + PADX;
    const iy = y - ICON / 2;
    if (asset) {
      // Outline: stamp the contrast-colored silhouette around the glyph so the
      // mark separates from a background of a similar tone.
      const o = ICON_OUTLINE_PX;
      for (let k = 0; k < OFFSETS.length; k++) {
        sctx.drawImage(asset.outline, ix + OFFSETS[k][0] * o, iy + OFFSETS[k][1] * o, ICON, ICON);
      }
      sctx.drawImage(asset.glyph, ix, iy, ICON, ICON);
    } else {
      sctx.fillStyle = contrast;
      sctx.fillRect(ix, iy, ICON, ICON);
    }

    sctx.fillStyle = contrast;
    sctx.fillText(label, x + PADX + ICON + ICON_GAP, y);
  };

  const drawSource = (): void => {
    if (!sctx) return;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, cssW, cssH);
    sctx.font = FONT_WEIGHT + ' ' + FONT_PX + 'px ' + FONT;
    sctx.textBaseline = 'middle';
    for (let r = 0; r < rows; r++) {
      const y = (r + 0.5) * rowH;
      const phase = offset + r * 26;
      let x = -mod(phase, cycleW);
      let i = 0;
      while (x < cssW) {
        const idx = mod(i + r * 3, items.length);
        const w = widths[idx];
        drawChip(x, y, w, items[idx]);
        x += w + GAP;
        i++;
      }
    }
  };

  const render = (): void => {
    if (!ctx) return;
    ctx.clearRect(0, 0, cssW, cssH);
    const dw = cell + 0.5;
    const dh = cell + 0.5;
    const sw = cell * dpr + 1;
    const sh = cell * dpr + 1;
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      ctx.drawImage(
        src,
        t.ox, t.oy, sw, sh,
        t.cx - cell / 2 + t.tx, t.cy - cell / 2 + t.ty,
        dw, dh,
      );
    }
  };

  const build = (): void => {
    if (dead || !ctx || !sctx) return;
    cssW = host.clientWidth;
    cssH = host.clientHeight;
    if (!cssW || !cssH) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    src.width = canvas.width;
    src.height = canvas.height;

    rowH = cssH / rows;
    chipH = Math.max(18, rowH);
    const minCols = 10;
    const maxCols = 26;
    cols = Math.max(minCols, Math.min(maxCols, Math.round(cssW / cellPx)));
    cell = cssW / cols;
    const tileRows = Math.ceil(cssH / cell);

    tiles = [];
    for (let r = 0; r < tileRows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push({
          cx: (c + 0.5) * cell,
          cy: (r + 0.5) * cell,
          ox: c * cell * dpr,
          oy: r * cell * dpr,
          tx: 0,
          ty: 0,
        });
      }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawSource();
    render();
  };

  const tick = (now: number): void => {
    if (dead) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    offset += speed * dt;
    if (offset > cycleW) offset -= cycleW;

    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      let tx = 0;
      let ty = 0;
      if (hasMouse) {
        const dx = t.cx - mouseX;
        const dy = t.cy - mouseY;
        const d = Math.hypot(dx, dy);
        if (d < radius && d > 0.001) {
          const f = 1 - d / radius;
          const s = f * f * push;
          tx = (dx / d) * s;
          ty = (dy / d) * s;
        }
      }
      t.tx += (tx - t.tx) * 0.16;
      t.ty += (ty - t.ty) * 0.16;
    }
    drawSource();
    render();
    raf = requestAnimationFrame(tick);
  };

  const onMove = (e: PointerEvent): void => {
    const r = host.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
    hasMouse = true;
  };
  const onLeave = (): void => {
    hasMouse = false;
  };

  const start = (): void => {
    if (dead) return;
    measure();
    build();
    if (!reduced && !raf) {
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  };

  const gate = opts.ready ?? Promise.resolve();
  gate.then(start).catch(start);
  const fallback = window.setTimeout(start, 1500);

  let rt = 0;
  const onResize = (): void => {
    window.clearTimeout(rt);
    rt = window.setTimeout(build, 180);
  };
  window.addEventListener('resize', onResize);
  target.addEventListener('pointermove', onMove, { passive: true });
  target.addEventListener('pointerleave', onLeave, { passive: true });

  return {
    destroy(): void {
      dead = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      window.clearTimeout(rt);
      window.removeEventListener('resize', onResize);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerleave', onLeave);
      canvas.remove();
    },
  };
}