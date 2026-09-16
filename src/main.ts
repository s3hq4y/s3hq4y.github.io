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

// Hero background board: the s9y wordmark rendered as a grid of tiles.
// Tiles near the pointer are pushed away, so the grid follows the cursor.
function bindHeroLogoGrid(): void {
  const host = document.getElementById('heroLogo');
  if (!host) return;
  const hero = host.parentElement;
  if (!hero) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  interface Tile { el: HTMLDivElement; x: number; y: number; cx: number; cy: number; tx: number; ty: number; }
  let tiles: Tile[] = [];
  let raf = 0;
  let mouseX = -9999;
  let mouseY = -9999;
  let hasMouse = false;
  let started = false;

  const RADIUS = 210;
  const PUSH = 30;

  const build = (): void => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;

    host.innerHTML = '';
    tiles = [];

    const cols = Math.max(24, Math.min(64, Math.round(w / 28)));
    const cell = w / cols;
    const rows = Math.ceil(h / cell);
    const gw = cols * cell;
    const gh = rows * cell;

    const c = document.createElement('canvas');
    c.width = Math.round(gw);
    c.height = Math.round(gh);
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const fs = Math.min(gh * 0.8, gw / 1.9);
    ctx.font = `400 ${fs}px "Fixedsys Core", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const g = ctx.createLinearGradient(0, 0, gw, gh);
    g.addColorStop(0, '#f4f4f7');
    g.addColorStop(0.5, '#ff2d6f');
    g.addColorStop(1, '#4d7cff');
    ctx.fillStyle = g;
    ctx.fillText('s9y', gw / 2, gh / 2 + fs * 0.02);
    const url = c.toDataURL();

    const frag = document.createDocumentFragment();
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const el = document.createElement('div');
        el.className = 'tile';
        el.style.width = `${cell}px`;
        el.style.height = `${cell}px`;
        el.style.left = `${col * cell}px`;
        el.style.top = `${r * cell}px`;
        el.style.backgroundImage = `url(${url})`;
        el.style.backgroundSize = `${gw}px ${gh}px`;
        el.style.backgroundPosition = `${-col * cell}px ${-r * cell}px`;
        frag.appendChild(el);
        tiles.push({ el, x: col * cell + cell / 2, y: r * cell + cell / 2, cx: 0, cy: 0, tx: 0, ty: 0 });
      }
    }
    host.appendChild(frag);
  };

  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
    hasMouse = true;
  };
  const onLeave = () => { hasMouse = false; };

  const tick = () => {
    for (const t of tiles) {
      if (hasMouse) {
        const dx = t.x - mouseX;
        const dy = t.y - mouseY;
        const d = Math.hypot(dx, dy);
        if (d < RADIUS && d > 0.001) {
          const f = 1 - d / RADIUS;
          const s = f * f * PUSH;
          t.tx = (dx / d) * s;
          t.ty = (dy / d) * s;
        } else {
          t.tx = 0;
          t.ty = 0;
        }
      } else {
        t.tx = 0;
        t.ty = 0;
      }
      t.cx += (t.tx - t.cx) * 0.14;
      t.cy += (t.ty - t.cy) * 0.14;
      if (Math.abs(t.cx) > 0.05 || Math.abs(t.cy) > 0.05 || Math.abs(t.tx) > 0.05 || Math.abs(t.ty) > 0.05) {
        t.el.style.transform = `translate3d(${t.cx.toFixed(2)}px, ${t.cy.toFixed(2)}px, 0)`;
      }
    }
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (started) return;
    started = true;
    build();
    if (!reduced) raf = requestAnimationFrame(tick);
  };

  hero.addEventListener('pointermove', onMove, { passive: true });
  hero.addEventListener('pointerleave', onLeave, { passive: true });

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