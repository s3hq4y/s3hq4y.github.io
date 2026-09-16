import './style.css';
import { createStage } from './scene';
import { chips, links, marquee, projects, strings, type Lang } from './data';

const root = document.documentElement;
const stored = localStorage.getItem('s9y.lang');
let lang: Lang = stored === 'zh' || stored === 'en'
  ? stored
  : (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');

const t = (key: string): string => strings[lang][key] ?? key;

function applyStatic(): void {
  root.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll<HTMLElement>('[data-lang-tag]').forEach((el) => {
    el.classList.toggle('on', el.dataset.langTag === lang);
  });
}

function renderWork(): void {
  const host = document.getElementById('works');
  if (!host) return;
  host.innerHTML = projects.map((p, i) => `
    <article class="card reveal" style="--accent:${p.accent}">
      <div class="card-sheen" aria-hidden="true"></div>
      <header class="card-head">
        <span class="card-idx">${String(i + 1).padStart(2, '0')}</span>
        <span class="card-lang">${p.language}</span>
      </header>
      <h3 class="card-name">${p.name}</h3>
      <p class="card-tag">${p.tag[lang]}</p>
      <p class="card-desc">${p.desc[lang]}</p>
      <ul class="card-topics">${p.topics.map((x) => `<li>${x}</li>`).join('')}</ul>
      <footer class="card-foot">
        <span class="card-meta">${p.license} · ★ ${p.stars}</span>
        <a class="card-link" href="${p.url}" target="_blank" rel="noopener noreferrer">${t('work.repo')} ↗</a>
      </footer>
    </article>
  `).join('');
}

function renderChips(): void {
  const host = document.getElementById('heroChips');
  if (!host) return;
  host.innerHTML = chips.map((c) => `<li>${c}</li>`).join('');
}

function renderMarquee(): void {
  const host = document.getElementById('marquee');
  if (!host) return;
  const items = marquee.map((m) => `<span class="tag">${m}</span>`).join('<span class="tag-dot">·</span>');
  host.innerHTML = items + '<span class="tag-dot">·</span>' + items;
}

function renderLinks(): void {
  const host = document.getElementById('links');
  if (!host) return;
  host.innerHTML = links
    .map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label} ↗</a></li>`)
    .join('');
}

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  },
  { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
);

function observeReveals(): void {
  document.querySelectorAll<HTMLElement>('.reveal:not(.in)').forEach((el) => io.observe(el));
}

document.getElementById('lang')?.addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('s9y.lang', lang);
  applyStatic();
  renderWork();
  bindCardSheen();
  observeReveals();
});

const glow = document.getElementById('cursorGlow');

// Card sheen: track the pointer so the radial highlight follows the cursor.
function bindCardSheen(): void {
  document.querySelectorAll<HTMLElement>('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });
  });
}

window.addEventListener('pointermove', (e) => {
  if (!glow) return;
  glow.style.transform = `translate3d(${e.clientX - 180}px, ${e.clientY - 180}px, 0)`;
}, { passive: true });

// Hero background board: the s9y wordmark sliced into a grid of tiles,
// painted on ONE canvas. Tiles near the pointer are pushed away.
// (The earlier DOM version created ~1.7k divs, each its own compositor layer.)
function bindHeroLogoGrid(): void {
  const host = document.getElementById('heroLogo');
  if (!host) return;
  const hero = host.parentElement;
  if (!hero) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Offscreen source: the full wordmark, rasterized once.
  const src = document.createElement('canvas');
  const sctx = src.getContext('2d');
  if (!sctx) return;

  interface Tile { cx: number; cy: number; ox: number; oy: number; tx: number; ty: number; }
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

  const RADIUS = 200;
  const PUSH = 26;

  const build = (): void => {
    cssW = host.clientWidth;
    cssH = host.clientHeight;
    if (!cssW || !cssH) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    src.width = canvas.width;
    src.height = canvas.height;

    // Coarse grid => at most ~500 tiles on a wide screen.
    const cols = Math.max(14, Math.min(30, Math.round(cssW / 52)));
    cell = cssW / cols;
    const rows = Math.ceil(cssH / cell);

    const gw = canvas.width;
    const gh = canvas.height;
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.clearRect(0, 0, gw, gh);
    const fs = Math.min(gh * 0.82, gw / 1.9);
    sctx.font = `400 ${fs}px "Fixedsys Core", monospace`;
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    const g = sctx.createLinearGradient(0, 0, gw, gh);
    g.addColorStop(0, '#f4f4f7');
    g.addColorStop(0.5, '#ff2d6f');
    g.addColorStop(1, '#4d7cff');
    sctx.fillStyle = g;
    sctx.fillText('s9y', gw / 2, gh / 2 + fs * 0.02);

    tiles = [];
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        tiles.push({
          cx: (col + 0.5) * cell,
          cy: (r + 0.5) * cell,
          ox: col * cell * dpr,
          oy: r * cell * dpr,
          tx: 0,
          ty: 0,
        });
      }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  };

  const render = (): void => {
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

  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
    hasMouse = true;
  };
  const onLeave = () => { hasMouse = false; };

  const tick = () => {
    let moving = false;
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      let tx = 0;
      let ty = 0;
      if (hasMouse) {
        const dx = t.cx - mouseX;
        const dy = t.cy - mouseY;
        const d = Math.hypot(dx, dy);
        if (d < RADIUS && d > 0.001) {
          const f = 1 - d / RADIUS;
          const s = f * f * PUSH;
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
      // Idle: snap to rest, paint once, stop the loop entirely.
      for (let i = 0; i < tiles.length; i++) { tiles[i].tx = 0; tiles[i].ty = 0; }
      render();
      settled = true;
    }
  };

  const wake = () => {
    if (!settled) return;
    settled = false;
    if (!reduced) raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (started) return;
    started = true;
    build();
    if (!reduced) raf = requestAnimationFrame(tick);
  };

  hero.addEventListener('pointermove', (e) => { onMove(e); wake(); }, { passive: true });
  hero.addEventListener('pointerleave', () => { onLeave(); wake(); }, { passive: true });

  // Wait for Fixedsys Core so the canvas draws the real glyphs.
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts) {
    fonts.load('400 100px "Fixedsys Core"').then(start).catch(start);
    fonts.ready.then(start).catch(() => {});
  } else {
    start();
  }
  window.setTimeout(start, 1200);

  let rt = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(rt);
    rt = window.setTimeout(build, 180);
  });
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
}

applyStatic();
renderWork();
renderChips();
renderMarquee();
renderLinks();
bindCardSheen();
bindHeroLogoGrid();
observeReveals();

createStage(document.getElementById('stage') as HTMLCanvasElement);