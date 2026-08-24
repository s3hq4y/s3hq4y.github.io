/* ============================================================
   s3hq4y — World Builder
   Starfield · typewriter · reveals · tilt · nav
   ============================================================ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- starfield with parallax + shooting stars ---------- */
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let stars = [];
  let shooters = [];
  let w = 0, h = 0, dpr = 1;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    seed();
  }

  function seed() {
    const count = Math.min(220, Math.floor((innerWidth * innerHeight) / 6500));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: 0.3 + Math.random() * 0.7,      // depth → parallax + brightness
      r: (0.4 + Math.random() * 1.3) * dpr,
      tw: Math.random() * Math.PI * 2,   // twinkle phase
      tws: 0.4 + Math.random() * 1.6,    // twinkle speed
    }));
  }

  function spawnShooter() {
    if (reduceMotion || shooters.length > 2) return;
    const startX = Math.random() * w * 0.8;
    const startY = Math.random() * h * 0.35;
    const angle = Math.PI * (0.65 + Math.random() * 0.2); // down-right-ish
    const speed = (7 + Math.random() * 6) * dpr;
    shooters.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.6,
      life: 1,
    });
  }

  let last = performance.now();
  let nextShooter = last + 2500 + Math.random() * 4000;

  function tick(now) {
    const dt = Math.min((now - last) / 16.7, 3);
    last = now;

    mouse.x += (mouse.tx - mouse.x) * 0.05 * dt;
    mouse.y += (mouse.ty - mouse.y) * 0.05 * dt;

    ctx.clearRect(0, 0, w, h);

    // deep-space tint
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.12, 0, w * 0.5, h * 0.12, Math.max(w, h) * 0.9);
    bg.addColorStop(0, "rgba(20, 26, 58, 0.55)");
    bg.addColorStop(0.5, "rgba(8, 11, 26, 0.3)");
    bg.addColorStop(1, "rgba(5, 7, 15, 0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // stars
    const px = mouse.x * 26 * dpr;
    const py = mouse.y * 26 * dpr;
    for (const s of stars) {
      s.tw += s.tws * 0.02 * dt;
      const a = 0.35 + 0.55 * s.z * (0.7 + 0.3 * Math.sin(s.tw));
      ctx.globalAlpha = a;
      ctx.fillStyle = s.z > 0.75 ? "#dbe4ff" : "#9fb0e8";
      const x = s.x + px * s.z;
      const y = s.y + py * s.z;
      ctx.beginPath();
      ctx.arc(x, y, s.r * (0.8 + 0.2 * Math.sin(s.tw)), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // shooting stars
    if (now > nextShooter) {
      spawnShooter();
      nextShooter = now + 3000 + Math.random() * 6000;
    }
    shooters = shooters.filter((sh) => sh.life > 0);
    for (const sh of shooters) {
      sh.x += sh.vx * dt;
      sh.y += sh.vy * dt;
      sh.life -= 0.012 * dt;
      const tail = 90 * dpr;
      const g = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * (tail / sh.vx) * 4, sh.y - sh.vy * 4);
      g.addColorStop(0, `rgba(219, 228, 255, ${0.9 * sh.life})`);
      g.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6 * dpr;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - sh.vx * 4, sh.y - sh.vy * 4);
      ctx.stroke();
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  resize();
  if (!reduceMotion) requestAnimationFrame(tick);
  else {
    // draw one static frame
    ctx.fillStyle = "rgba(5,7,15,0)";
    for (const s of stars) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#9fb0e8";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- typewriter ---------- */
  const phrases = [
    "building strategy worlds…",
    "exploring AI magic…",
    "coding like it's 2050.",
    "debugging like it's 1999.",
    "always in new tech.",
  ];
  const tw = document.getElementById("typewriter");
  if (tw) {
    let pi = 0, ci = 0, deleting = false;
    (function type() {
      const phrase = phrases[pi];
      if (!deleting) {
        ci++;
        tw.textContent = phrase.slice(0, ci);
        if (ci === phrase.length) {
          deleting = true;
          setTimeout(type, 1900);
          return;
        }
        setTimeout(type, 55 + Math.random() * 70);
      } else {
        ci--;
        tw.textContent = phrase.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          setTimeout(type, 350);
          return;
        }
        setTimeout(type, 28);
      }
    })();
  }

  /* ---------- reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      }
    }, { threshold: 0.15 });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 5, 4) * 90}ms`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- HUD bars fill when visible ---------- */
  const bars = document.querySelectorAll(".hud-bar-fill");
  if ("IntersectionObserver" in window) {
    const bio = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.style.width = en.target.dataset.width + "%";
          bio.unobserve(en.target);
        }
      }
    }, { threshold: 0.4 });
    bars.forEach((b) => bio.observe(b));
  } else {
    bars.forEach((b) => (b.style.width = b.dataset.width + "%"));
  }

  /* ---------- nav: scrolled state + active section ---------- */
  const nav = document.getElementById("nav");
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav-link")];

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    const sio = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          navLinks.forEach((l) =>
            l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id));
        }
      }
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => sio.observe(s));
  }

  /* ---------- card tilt + glow follow ---------- */
  if (!reduceMotion) {
    document.querySelectorAll(".tilt").forEach((card) => {
      let raf = null;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const rx = (0.5 - y) * 6;
          const ry = (x - 0.5) * 8;
          card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
        });
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }
})();
