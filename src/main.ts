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

// TRAE-style giant logo: the wordmark tilts and sways following the pointer,
// then springs back to rest when the cursor leaves the stage.
function bindLogo(): void {
  const stage = document.getElementById('logoStage');
  const inner = document.getElementById('logoStageInner');
  if (!stage || !inner) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  let raf = 0;
  let tx = 0, ty = 0; // target rotation (deg)
  let cx = 0, cy = 0; // current rotation (deg)

  const onMove = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5;
    tx = nx * 26;   // rotateY
    ty = -ny * 18;  // rotateX
    stage.style.setProperty('--mx', `${(nx + 0.5) * 100}%`);
    stage.style.setProperty('--my', `${(ny + 0.5) * 100}%`);
  };

  const reset = () => { tx = 0; ty = 0; };

  const tick = () => {
    cx += (tx - cx) * 0.09;
    cy += (ty - cy) * 0.09;
    inner.style.transform = `rotateX(${cy.toFixed(3)}deg) rotateY(${cx.toFixed(3)}deg)`;
    raf = requestAnimationFrame(tick);
  };

  stage.addEventListener('pointermove', onMove, { passive: true });
  stage.addEventListener('pointerleave', reset, { passive: true });
  raf = requestAnimationFrame(tick);

  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
}

applyStatic();
renderWork();
renderChips();
renderMarquee();
renderLinks();
bindCardSheen();
bindLogo();
observeReveals();

createStage(document.getElementById('stage') as HTMLCanvasElement);