import './style.css';
import { createStage } from './scene';
import { mountLogoGrid, textPainter } from './logogrid';
import { mountSkillFlow, type SkillFlowHandle } from './skillflow';
import { initWork, type WorkHandle } from './work';
import { chips, links, projects, skills, strings, type Lang } from './data';

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
    <article class="work-panel" style="--accent:${p.accent}" data-idx="${i}">
      <div class="work-grid" aria-hidden="true"></div>
      <div class="work-inner">
        <header class="work-head">
          <span class="work-idx">${String(i + 1).padStart(2, '0')}</span>
          <span class="work-lang">${p.language}</span>
        </header>
        <h3 class="work-name">${p.name}</h3>
        <p class="work-tag" data-p="tag">${p.tag[lang]}</p>
        <p class="work-desc" data-p="desc">${p.desc[lang]}</p>
        <ul class="work-topics">${p.topics.map((x) => `<li>${x}</li>`).join('')}</ul>
        <footer class="work-foot">
          <span class="work-meta">${p.license} · ★ ${p.stars}</span>
          <a class="work-link" data-p="repo" href="${p.url}" target="_blank" rel="noopener noreferrer">${t('work.repo')} ↗</a>
        </footer>
      </div>
    </article>
  `).join('');
}

function renderChips(): void {
  const host = document.getElementById('heroChips');
  if (!host) return;
  host.innerHTML = chips.map((c) => `<li>${c}</li>`).join('');
}

let skillFlow: SkillFlowHandle | null = null;

function mountSkills(): void {
  const host = document.getElementById('marquee');
  if (!host) return;
  skillFlow?.destroy();
  const about = host.parentElement;
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  const ready = fonts ? fonts.load('400 100px "Fixedsys Core"') : Promise.resolve();
  skillFlow = mountSkillFlow(host, {
    items: skills,
    rows: 6,
    cellPx: 44,
    speed: 22,
    radius: 150,
    push: 20,
    pointerTarget: about,
    ready,
  });
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

let work: WorkHandle | null = null;

function startWork(): void {
  const section = document.getElementById('work');
  if (!section) return;
  work?.destroy();
  work = initWork(section);
}

document.getElementById('lang')?.addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('s9y.lang', lang);
  applyStatic();
  renderWork();
  startWork();
  observeReveals();
});

const glow = document.getElementById('cursorGlow');

window.addEventListener('pointermove', (e) => {
  if (!glow) return;
  glow.style.transform = `translate3d(${e.clientX - 180}px, ${e.clientY - 180}px, 0)`;
}, { passive: true });

// Hero background board: the s9y wordmark sliced into a grid of tiles.
// Shared with the work panels; see src/logogrid.ts.
function bindHeroLogoGrid(): void {
  const host = document.getElementById('heroLogo');
  if (!host) return;
  const hero = host.parentElement;
  if (!hero) return;

  const FONT = '"Fixedsys Core", "Zpix", monospace';
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  const ready = fonts ? fonts.load('400 100px "Fixedsys Core"') : Promise.resolve();

  mountLogoGrid(host, {
    ready,
    pointerTarget: hero,
    paint: textPainter('s9y', FONT, 1.9),
    minCols: 14,
    maxCols: 30,
    cellPx: 52,
    radius: 200,
    push: 26,
  });
}

applyStatic();
renderWork();
renderChips();
mountSkills();
renderLinks();
bindHeroLogoGrid();
observeReveals();

startWork();

createStage(document.getElementById('stage') as HTMLCanvasElement);