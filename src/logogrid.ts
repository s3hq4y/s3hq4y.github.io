// Reusable logo-grid backdrop: rasterize a source (wordmark or SVG emblem)
// once into an offscreen buffer, slice it into square tiles, and paint them on
// a single visible canvas. Tiles near the pointer are pushed away, then spring
// back; the rAF loop stops entirely once the field settles.
//
// The previous DOM version built ~1.7k divs, each its own compositor layer with
// will-change. This keeps one canvas and one layer per instance.

export type Painter = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
) => void;

export interface LogoGridOptions {
  paint: Painter;
  ready?: Promise<unknown>;
  pointerTarget?: HTMLElement | null;
  minCols?: number;
  maxCols?: number;
  cellPx?: number;
    radius?: number;
    push?: number;
}

export interface LogoGridHandle {
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

export function mountLogoGrid(host: HTMLElement, opts: LogoGridOptions): LogoGridHandle {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const minCols = opts.minCols ?? 14;
  const maxCols = opts.maxCols ?? 30;
  const cellPx = opts.cellPx ?? 52;
    const radius = opts.radius ?? 200;
    const push = opts.push ?? 26;
  const target = opts.pointerTarget ?? host.parentElement ?? host;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  host.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const src = document.createElement('canvas');
  const sctx = src.getContext('2d');

  let tiles: Tile[] = [];
  let cell = 48;
  let cssW = 0;
  let cssH = 0;
  let dpr = 1;
  let raf = 0;
  let mouseX = -9999;
  let mouseY = -9999;
  let hasMouse = false;
  let started = false;
  let settled = false;
  let dead = false;

  const render = (): void => {
    if (!ctx) return;
    ctx.clearRect(0, 0, cssW, cssH);
        const dw = cell + 0.5;
        const dh = cell + 0.5;
        const sw = cell * dpr + 1;
        const sh = cell * dpr + 1;
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      ctx.drawImage(src, t.ox, t.oy, sw, sh, t.cx - cell / 2 + t.tx, t.cy - cell / 2 + t.ty, dw, dh);
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

    const cols = Math.max(minCols, Math.min(maxCols, Math.round(cssW / cellPx)));
    cell = cssW / cols;
    const rows = Math.ceil(cssH / cell);

    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.clearRect(0, 0, src.width, src.height);
    opts.paint(sctx, src.width, src.height, dpr);

    tiles = [];
    for (let r = 0; r < rows; r++) {
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
    render();
  };

  const tick = (): void => {
    let moving = false;
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
      if (Math.abs(t.tx) > 0.04 || Math.abs(t.ty) > 0.04) moving = true;
    }
    render();
    if (moving || hasMouse) {
      settled = false;
      raf = requestAnimationFrame(tick);
    } else {
      for (let i = 0; i < tiles.length; i++) {
        tiles[i].tx = 0;
        tiles[i].ty = 0;
      }
      render();
      settled = true;
    }
  };

    const wake = (): void => {
    if (dead || !settled) return;
    settled = false;
    if (!reduced) raf = requestAnimationFrame(tick);
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
    if (dead || started) return;
    started = true;
    build();
    if (!reduced) raf = requestAnimationFrame(tick);
  };

    const onPointerMove = (e: PointerEvent): void => { onMove(e); wake(); };
    const onPointerLeave = (): void => { onLeave(); wake(); };

    target.addEventListener('pointermove', onPointerMove, { passive: true });
    target.addEventListener('pointerleave', onPointerLeave, { passive: true });

  const gate = opts.ready ?? Promise.resolve();
  gate.then(start).catch(start);
  const fallback = window.setTimeout(start, 1500);

  let rt = 0;
  const onResize = (): void => {
    window.clearTimeout(rt);
    rt = window.setTimeout(build, 180);
  };
  window.addEventListener('resize', onResize);

  return {
    destroy(): void {
      dead = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      window.clearTimeout(rt);
            window.removeEventListener('resize', onResize);
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerleave', onPointerLeave);
      canvas.remove();
    },
  };
}

// Painter for a text wordmark (e.g. s9y), tinted with the site gradient.
export function textPainter(text: string, fontStack: string, ratio = 1.9): Painter {
  return (ctx, w, h) => {
    const fs = Math.min(h * 0.82, w / ratio);
    ctx.font = '400 ' + fs + 'px ' + fontStack;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#f4f4f7');
    g.addColorStop(0.5, '#ff2d6f');
    g.addColorStop(1, '#4d7cff');
    ctx.fillStyle = g;
    ctx.fillText(text, w / 2, h / 2 + fs * 0.02);
  };
}

// Painter for a rasterized logo image, fitted inside the buffer.
export function imagePainter(
  img: HTMLImageElement,
  options: { scale?: number; alignX?: number; alignY?: number } = {},
): Painter {
  const scale = options.scale ?? 0.72;
  const ax = options.alignX ?? 0.5;
  const ay = options.alignY ?? 0.5;
  return (ctx, w, h) => {
    const ar = img.width && img.height ? img.width / img.height : 1;
    let dh = h * scale;
    let dw = dh * ar;
    if (dw > w * scale) {
      dw = w * scale;
      dh = dw / ar;
    }
    ctx.drawImage(img, (w - dw) * ax, (h - dh) * ay, dw, dh);
  };
}
