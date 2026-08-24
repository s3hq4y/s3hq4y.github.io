/* ============================================================
   s3hq4y — World Builder
   Win10 Fluent: i18n (zh/en) · theme (light/dark) · clock · nav
   ============================================================ */

(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const ICONS = {
    sun: '<svg viewBox="0 0 18 18" width="15" height="15" aria-hidden="true"><circle cx="9" cy="9" r="3.4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 1.6v1.8M9 14.6v1.8M1.6 9h1.8M14.6 9h1.8M3.7 3.7l1.3 1.3M13 13l1.3 1.3M14.3 3.7 13 5M5 13l-1.3 1.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    moon: '<svg viewBox="0 0 18 18" width="15" height="15" aria-hidden="true"><path d="M14.8 10.8A6.2 6.2 0 0 1 7.2 3.2a6.2 6.2 0 1 0 7.6 7.6Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  };

  const TOASTS = {
    close: {
      zh: "这个窗口关不掉的——它是你的世界 ✦",
      en: "This window can't be closed — it's your world ✦",
    },
    max: {
      zh: "已经是最大尺寸了。",
      en: "It's already at maximum size.",
    },
    start: {
      zh: "开始菜单 · 敬请期待",
      en: "Start menu · coming soon",
    },
  };

  const state = {
    lang: localStorage.getItem("fl-lang") || "zh",
    theme:
      localStorage.getItem("fl-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  };

  /* ---------- i18n ---------- */

  function applyLang(lang) {
    state.lang = lang;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title =
      lang === "zh" ? "s3hq4y — 世界构建者" : "s3hq4y — World Builder";

    $$("[data-en]").forEach((el) => {
      const text = el.getAttribute(lang === "zh" ? "data-zh" : "data-en");
      if (text != null) el.textContent = text;
    });

    // toggles show the OTHER language (what you'll switch to)
    $("#langSideLabel").textContent = lang === "zh" ? "English" : "中文";
    $("#langTray").textContent = lang === "zh" ? "EN" : "中";

    localStorage.setItem("fl-lang", lang);
    tickClock();
  }

  /* ---------- theme ---------- */

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    $("#themeIcon").innerHTML = theme === "dark" ? ICONS.moon : ICONS.sun;
    localStorage.setItem("fl-theme", theme);
  }

  /* ---------- clock ---------- */

  function tickClock() {
    const now = new Date();
    const isZh = state.lang === "zh";
    const time = now.toLocaleTimeString(
      isZh ? "zh-CN" : "en-US",
      isZh
        ? { hour: "2-digit", minute: "2-digit", hour12: false }
        : { hour: "numeric", minute: "2-digit", hour12: true }
    );
    const date = now.toLocaleDateString(
      isZh ? "zh-CN" : "en-US",
      isZh
        ? { year: "numeric", month: "numeric", day: "numeric" }
        : { weekday: "short", month: "numeric", day: "numeric", year: "numeric" }
    );
    $("#clockTime").textContent = time;
    $("#clockDate").textContent = date;
  }

  /* ---------- active section ---------- */

  function wireNav() {
    const content = $("#content");
    const pages = $$(".page");
    const marks = () => $$(".nav-item, .tb-app");

    if (!("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const href = "#" + en.target.id;
          marks().forEach((m) =>
            m.classList.toggle("active", m.getAttribute("href") === href)
          );
        });
      },
      { root: content, rootMargin: "-25% 0px -65% 0px" }
    );

    pages.forEach((p) => io.observe(p));
  }

  /* ---------- toast ---------- */

  let toastTimer = null;

  function toast(kind) {
    const el = $("#toast");
    el.innerHTML =
      '<span class="t-mark">✦</span><span>' +
      TOASTS[kind][state.lang] +
      "</span>";
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  }

  /* ---------- wire up ---------- */

  function wire() {
    const toggleLang = () => applyLang(state.lang === "zh" ? "en" : "zh");
    const toggleTheme = () =>
      applyTheme(state.theme === "dark" ? "light" : "dark");

    $("#langSide").addEventListener("click", toggleLang);
    $("#langBtn").addEventListener("click", toggleLang);
    $("#themeBtn").addEventListener("click", toggleTheme);

    $("#wcClose").addEventListener("click", () => toast("close"));
    $("#wcMax").addEventListener("click", () => toast("max"));
    $("#wcMin").addEventListener("click", () =>
      $("#content").scrollTo({ top: 0, behavior: "smooth" })
    );
    $("#startBtn").addEventListener("click", () => toast("start"));

    setInterval(tickClock, 1000);
    wireNav();
  }

  /* ---------- init ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(state.theme);
    applyLang(state.lang);
    wire();
  });
})();
