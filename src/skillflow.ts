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

const FONT = '"Fixedsys Core", "Zpix", monospace';
const GAP = 0;
const PADX = 9;
const ICON = 12;
const ICON_GAP = 6;
const FONT_PX = 13;

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

const iconCache = new Map<string, HTMLImageElement>();

function loadIcon(label: string, onReady: () => void): void {
  if (iconCache.has(label)) return;
  const slug = ICON_SLUG[label];
  if (!slug) {
    iconCache.set(label, null as unknown as HTMLImageElement);
    return;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => { iconCache.set(label, img); onReady(); };
  img.onerror = () => { iconCache.set(label, null as unknown as HTMLImageElement); };
  img.src = ICON_BASE + slug;
}

// A distinct accent color per skill chip: hashing the label keeps a given
// skill the same color wherever it appears in the flow.
const PALETTE = [
  '#ff2d6f', '#4d7cff', '#a855f7', '#06b6d4', '#f59e0b', '#10b981',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function withAlpha(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
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
    sctx.font = FONT_PX + 'px ' + FONT;
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
    const color = PALETTE[hashStr(label) % PALETTE.length];
    sctx.fillStyle = withAlpha(color, 0.13);
    sctx.strokeStyle = withAlpha(color, 0.6);
    sctx.lineWidth = 1;
    sctx.fillRect(x, y - chipH / 2, w, chipH);
    sctx.strokeRect(x + 0.5, y - chipH / 2 + 0.5, w - 1, chipH - 1);
    // Icon slot: brand glyph when available, colored square otherwise.
    const icon = iconCache.get(label);
    if (icon && icon.complete && icon.naturalWidth) {
      sctx.drawImage(icon, x + PADX, y - ICON / 2, ICON, ICON);
    } else {
      sctx.fillStyle = withAlpha(color, 0.95);
      sctx.fillRect(x + PADX, y - ICON / 2, ICON, ICON);
    }
    sctx.fillStyle = 'rgba(244,244,247,0.86)';
    sctx.fillText(label, x + PADX + ICON + ICON_GAP, y);
  };

  const drawSource = (): void => {
    if (!sctx) return;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, cssW, cssH);
    sctx.font = FONT_PX + 'px ' + FONT;
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