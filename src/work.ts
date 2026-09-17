// Horizontal work gallery. The section is pinned for a stretch of scroll;
// wheel movement drives the track from left to right, one project per screen.
// Each panel carries its own logo-grid backdrop.

import { mountLogoGrid, imagePainter, type LogoGridHandle } from './logogrid';
import { projects, strings, type Lang } from './data';

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

export interface WorkHandle {
  relayout(): void;
  relabel(lang: Lang): void;
  destroy(): void;
}

export function initWork(section: HTMLElement): WorkHandle {
  const track = section.querySelector<HTMLElement>('.work-track');
  if (!track) return { relayout() {}, relabel() {}, destroy() {} };

  const marks: Record<string, string> = {
    Portal: new URL('./assets/portal-mark.svg', import.meta.url).href,
    Wibe: new URL('./assets/wibe-mark.svg', import.meta.url).href,
  };

  const panels = Array.from(track.querySelectorAll<HTMLElement>('.work-panel'));
  const grids: LogoGridHandle[] = [];
  let gridsReady = false;

  const narrow = (): boolean => window.matchMedia('(max-width: 820px)').matches;
  const reduced = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const buildGrids = (): void => {
    if (gridsReady) return;
    gridsReady = true;
    panels.forEach((panel, i) => {
      const host = panel.querySelector<HTMLElement>('.work-grid');
      const p = projects[i];
      if (!host || !p) return;
      const img = new Image();
      const ready = new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      img.src = marks[p.name];
      grids.push(
        mountLogoGrid(host, {
          ready,
          pointerTarget: panel,
                    paint: imagePainter(img, { scale: 0.62 }),
          minCols: 12,
          maxCols: 26,
          cellPx: 56,
                    radius: 220,
          push: 30,
        }),
      );
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) buildGrids();
    },
    { rootMargin: '120% 0px' },
  );
  observer.observe(section);

  let raf = 0;
  const layout = (): void => {
    const vh = window.innerHeight;
    const n = panels.length;
    if (reduced() || narrow() || n <= 1) {
      section.style.height = '';
      track.style.transform = '';
      section.classList.remove('is-pinned');
      return;
    }
    section.classList.add('is-pinned');
    const scrollLen = vh * (n - 1 + 0.6);
    section.style.height = vh + scrollLen + 'px';
    const rect = section.getBoundingClientRect();
    const progress = clamp(-rect.top / scrollLen, 0, 1);
    const shift = progress * (track.scrollWidth - window.innerWidth);
    track.style.transform = 'translate3d(' + -shift + 'px,0,0)';
    track.style.setProperty('--progress', String(progress));
  };

  const onScroll = (): void => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      layout();
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  const relabel = (next: Lang): void => {
    const tt = (key: string): string => strings[next][key] ?? key;
    panels.forEach((panel, i) => {
      const p = projects[i];
      if (!p) return;
      const tag = panel.querySelector<HTMLElement>('[data-p="tag"]');
      const desc = panel.querySelector<HTMLElement>('[data-p="desc"]');
      const repo = panel.querySelector<HTMLElement>('[data-p="repo"]');
      if (tag) tag.textContent = p.tag[next];
      if (desc) desc.textContent = p.desc[next];
      if (repo) repo.textContent = tt('work.repo') + ' ↗';
    });
  };

  requestAnimationFrame(layout);

  return {
    relayout: layout,
    relabel,
    destroy(): void {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
      grids.forEach((g) => g.destroy());
    },
  };
}
