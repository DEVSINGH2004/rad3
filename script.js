/* ============================================================
   RAD WORLDWIDE — Enhanced Scroll & Animation System
   ✦ Lenis smooth scroll  ✦ GSAP + ScrollTrigger
   ✦ Full-site parallax   ✦ Partner section tweens
   ✦ Per-section scroll animations
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

document.documentElement.style.overflowX = "hidden";
document.body.style.overflowX            = "hidden";

/* ──────────────────────────────────────────────
   1. LENIS SMOOTH SCROLL
   ────────────────────────────────────────────── */
const lenis = new Lenis({
  duration       : 1.2,
  easing         : t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel    : true,
  wheelMultiplier: 0.9,
  touchMultiplier: 1.8,
  infinite       : false,
});

/* Keep ScrollTrigger in sync */
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */
function disableStack() {
  return window.innerHeight < 500;
}

function isMobile() {
  return window.innerWidth < 768;
}

/* ──────────────────────────────────────────────
   ELEMENTS
   ────────────────────────────────────────────── */
const logoWrapper  = document.querySelector(".logo-wrapper");
const introSection = document.querySelector(".intro");
const heroSection  = document.querySelector(".hero-section");

const floatsUp   = document.querySelectorAll(".intro-float[data-dir='up']");
const floatsDown = document.querySelectorAll(".intro-float[data-dir='down']");
const allFloats  = document.querySelectorAll(".intro-float");

const heroNavbar = heroSection.querySelector(".navbar");
const heroPill   = heroSection.querySelector(".tag-pill");
const heroH1     = heroSection.querySelector("h1");
const heroP      = heroSection.querySelector(".hero-content p");
const heroFloats = heroSection.querySelectorAll(".float");

/* ──────────────────────────────────────────────
   2. INITIAL STATE
   ────────────────────────────────────────────── */
function setInitialState() {
  gsap.set(heroSection,  { opacity: 1, scale: 1, zIndex: 10 });
  /* Hero elements — fully visible, no entrance animation */
  gsap.set([heroNavbar, heroPill, heroH1, heroP], { opacity: 1, y: 0 });
  gsap.set(heroFloats,  { opacity: 1, y: 0, scale: 1 });
  gsap.set(allFloats,   { opacity: 1, y: 0, rotation: 0, scale: 1 });
  gsap.set(introSection, { opacity: 1, backgroundColor: "rgba(135,51,232,1)" });
}
setInitialState();

/* ──────────────────────────────────────────────
   3. INTRO SCROLL  (logo zoom + float scatter)
   ────────────────────────────────────────────── */
let introST;

function createIntro() {
  if (introST) introST.kill();

  const scrollDist = window.innerHeight * 1.8;

  introST = ScrollTrigger.create({
    trigger   : ".intro",
    start     : "top top",
    end       : `+=${scrollDist}`,
    scrub     : 0.8,
    pin       : true,
    anticipatePin: 1,

    onUpdate: self => {
      const p = self.progress;

      /* Logo zoom */
      gsap.set(logoWrapper, {
        scale   : 1 + p * 2.2,
        z       : p * window.innerHeight * 2.2,
        y       : p * window.innerHeight * 0.12,
        force3D : true,
      });

      /* Floating objects */
      floatsUp.forEach((el, i) => {
        const fp = gsap.utils.clamp(0, 1, (p - 0.05 - i * 0.02) / 0.25);
        gsap.set(el, { y: -fp * 150 + "vh", opacity: 1 - fp });
      });
      floatsDown.forEach((el, i) => {
        const fp = gsap.utils.clamp(0, 1, (p - 0.08 - i * 0.02) / 0.25);
        gsap.set(el, { y: fp * 150 + "vh", opacity: 1 - fp });
      });

      /* Fade intro */
      const fade   = gsap.utils.clamp(0, 1, (p - 0.60) / 0.25);
      gsap.set(introSection, { opacity: 1 - fade });
    },

    onLeave: () => {
      gsap.set(introSection, { opacity: 0, backgroundColor: "#100318", visibility: "hidden" });
      gsap.set(heroSection,  { zIndex: -1 });
    },

    onEnterBack: () => {
      gsap.set(introSection, { visibility: "visible", backgroundColor: "rgba(135,51,232,1)" });
      gsap.set(heroSection,  { zIndex: 10 });
    },
  });
}
createIntro();

/* ──────────────────────────────────────────────
   5. SERVICES CARD STACK
   ────────────────────────────────────────────── */
let serviceST;

function createServices() {
  if (serviceST) { serviceST.kill(); serviceST = null; }
  if (disableStack()) return;

  const scene   = document.querySelector(".service-stack-scene");
  const cards   = gsap.utils.toArray(".service-card");
  if (!scene || !cards.length) return;

  const reversed    = [...cards].reverse();
  const peekY       = [0, 20, 40, 60];
  const peekScale   = [1, 0.97, 0.94, 0.91];

  reversed.forEach((card, i) => {
    gsap.set(card, { y: peekY[i] || 0, scale: peekScale[i] || 1, zIndex: reversed.length - i });
  });

  const scrollPerCard = window.innerHeight * 0.7;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger     : scene,
      start       : "top 20%",
      end         : `+=${(reversed.length - 1) * scrollPerCard}`,
      scrub       : 1,
      pin         : true,
      anticipatePin: 1,
    },
  });

  serviceST = tl.scrollTrigger;

  for (let i = 0; i < reversed.length - 1; i++) {
    const remaining = reversed.slice(i + 1);

    /* Card exits: fly up, fade out, slight rotation — fully invisible when gone */
    tl.to(reversed[i], {
      y       : "-130%",
      opacity : 0,
      rotation: gsap.utils.random(-4, 4),
      scale   : 0.92,
      ease    : "power2.in",
      duration: 1,
    }, i);

    /* Cards below shift up into new peek positions */
    remaining.forEach((card, j) => {
      tl.to(card, {
        y       : peekY[j] || 0,
        scale   : peekScale[j] || 1,
        ease    : "power2.out",
        duration: 1,
      }, i);
    });
  }

  /* Floating product image bobbing inside each card */
  document.querySelectorAll(".premium-car").forEach((el, i) => {
    gsap.to(el, {
      y       : isMobile() ? 6 : 12,
      rotation: i % 2 === 0 ? 4 : -4,
      duration: 3.2 + i * 0.4,
      ease    : "sine.inOut",
      repeat  : -1,
      yoyo    : true,
      delay   : i * 0.3,
    });
  });
}
createServices();

/* ──────────────────────────────────────────────
   6. ABOUT SECTION — slide-in + parallax
   ────────────────────────────────────────────── */
function initAbout() {
  const card  = document.querySelector(".about-card");
  const textH = document.querySelector(".about-text h2");
  const textP = document.querySelector(".about-text p");
  const img   = document.querySelector(".about-main-img");
  const glow  = document.querySelector(".about-glow");

  if (!card) return;

  /* Card entrance */
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" },
    y       : 80,
    opacity : 0,
    duration: 0.9,
    ease    : "power3.out",
  });

  /* Text stagger */
  gsap.from([textH, textP], {
    scrollTrigger: { trigger: card, start: "top 80%", toggleActions: "play none none reverse" },
    y       : 40,
    opacity : 0,
    duration: 0.85,
    stagger : 0.15,
    ease    : "power2.out",
    delay   : 0.2,
  });

  /* Image parallax */
  if (img) {
    gsap.to(img, {
      scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1.2 },
      y    : -60,
      ease : "none",
    });
  }

  /* Glow pulse */
  if (glow) {
    gsap.to(glow, { opacity: 1.2, scale: 1.05, duration: 2.5, ease: "sine.inOut", repeat: -1, yoyo: true });
  }

  /* Services title */
  const servTitle = document.querySelector(".services-title");
  if (servTitle) {
    gsap.from(servTitle, {
      scrollTrigger: { trigger: servTitle, start: "top 85%", toggleActions: "play none none reverse" },
      y: 50, opacity: 0, duration: 0.8, ease: "power2.out",
    });
  }
}
initAbout();

/* ──────────────────────────────────────────────
   7. PARTNERS SECTION  — stagger + tween
   ────────────────────────────────────────────── */
function initPartners() {
  const title  = document.querySelector(".partners-title");
  const cards  = gsap.utils.toArray(".partner-card1, .partner-card2, .partner-card3, .partner-card4, .partner-card5");
  const glows  = document.querySelectorAll(".partner-glow");
  const imgs   = document.querySelectorAll(".partner-main-img");

  if (!cards.length) return;

  /* ── Title reveal ── */
  if (title) {
    gsap.from(title, {
      scrollTrigger: { trigger: title, start: "top 88%", toggleActions: "play none none reverse" },
      y: 60, opacity: 0, duration: 0.9, ease: "power3.out",
    });

    /* Underline wipe effect on the title */
    const underline = document.createElement("span");
    underline.style.cssText = "display:block;height:3px;background:linear-gradient(90deg,#8733E8,#c266ff);width:0;margin:12px auto 0;border-radius:2px;max-width:200px;";
    title.appendChild(underline);
    gsap.to(underline, {
      scrollTrigger: { trigger: title, start: "top 85%", toggleActions: "play none none reverse" },
      width: "100%", duration: 0.8, ease: "power2.out", delay: 0.4,
    });
  }

  /* ── Card stagger entrance ── */
  const row2Cards = gsap.utils.toArray(".row-2 .partner-card2, .row-2 .partner-card1");
  const row3Cards = gsap.utils.toArray(".row-3 .partner-card3, .row-3 .partner-card4, .row-3 .partner-card5");

  [row2Cards, row3Cards].forEach((group, gi) => {
    gsap.from(group, {
      scrollTrigger: { trigger: group[0], start: "top 88%", toggleActions: "play none none reverse" },
      y      : 90,
      opacity: 0,
      scale  : 0.94,
      duration: 0.85,
      stagger : 0.13,
      ease   : "power3.out",
      delay  : gi * 0.1,
    });
  });

  /* ── Partner images — continuous float tween ── */
  imgs.forEach((img, i) => {
    const yAmt = 10 + (i % 3) * 4;
    const rot  = (i % 2 === 0 ? 1 : -1) * (3 + i % 4);
    gsap.to(img, {
      y       : yAmt,
      rotation: rot,
      scale   : 1.04,
      duration: 2.8 + i * 0.3,
      ease    : "sine.inOut",
      repeat  : -1,
      yoyo    : true,
      delay   : i * 0.18,
    });
  });

  /* ── Glow orbs pulse (each card) ── */
  glows.forEach((glow, i) => {
    gsap.to(glow, {
      opacity : 1.1,
      scale   : 1.08,
      duration: 2.2 + i * 0.2,
      ease    : "sine.inOut",
      repeat  : -1,
      yoyo    : true,
      delay   : i * 0.25,
    });
  });

  /* ── Card hover 3-D tilt ── */
  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const rx = ((e.clientY - cy) / (r.height / 2)) * -8;
      const ry = ((e.clientX - cx) / (r.width  / 2)) *  8;
      gsap.to(card, { rotateX: rx, rotateY: ry, scale: 1.03, duration: 0.35, ease: "power2.out", transformPerspective: 800 });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.55, ease: "power3.out" });
    });
  });

  /* ── Parallax scroll on card images ── */
  imgs.forEach((img, i) => {
    gsap.to(img, {
      scrollTrigger: { trigger: img.closest(".partner-card1, .partner-card2, .partner-card3, .partner-card4, .partner-card5"), start: "top bottom", end: "bottom top", scrub: 1.4 },
      y   : -30 + (i % 3) * 10,
      ease: "none",
    });
  });
}
initPartners();

/* ──────────────────────────────────────────────
   8. PROJECTS / CLIENTS SECTION
   ────────────────────────────────────────────── */
function initProjects() {
  const title = document.querySelector(".projects-title");
  const strip = document.querySelector(".logo-strip");

  if (title) {
    gsap.from(title, {
      scrollTrigger: { trigger: title, start: "top 88%", toggleActions: "play none none reverse" },
      y: 55, opacity: 0, duration: 0.85, ease: "power3.out",
    });
  }

  if (strip) {
    /* Reveal with a clip-path wipe */
    gsap.from(strip, {
      scrollTrigger: { trigger: strip, start: "top 90%", toggleActions: "play none none reverse" },
      clipPath: "inset(0 100% 0 0)",
      opacity : 0,
      duration: 0.9,
      ease    : "power2.out",
    });

    /* Horizontal scroll of the logo track */
    const track = strip.querySelector(".logo-track");
    if (track) {
      const trackW = track.scrollWidth;
      const containerW = strip.offsetWidth;
      if (trackW > containerW) {
        gsap.to(track, {
          scrollTrigger: { trigger: strip, start: "top bottom", end: "bottom top", scrub: 1 },
          x   : -(trackW - containerW) * 0.5,
          ease: "none",
        });
      }

      /* Logos subtle fade-in stagger */
      const logos = track.querySelectorAll("img");
      if (logos.length) {
        gsap.from(logos, {
          scrollTrigger: { trigger: strip, start: "top 85%", toggleActions: "play none none reverse" },
          opacity: 0, y: 20, scale: 0.85,
          stagger : 0.08,
          duration: 0.6,
          ease    : "power2.out",
        });
      }
    }
  }
}
initProjects();

/* ──────────────────────────────────────────────
   9. WHY RAD WORLDWIDE SECTION
   ────────────────────────────────────────────── */
function initWhy() {
  const card    = document.querySelector(".why-card");
  const textH   = document.querySelector(".why-text h2");
  const textP   = document.querySelector(".why-text p");
  const mainImg = document.querySelector(".why-main-img");
  const glow    = document.querySelector(".why-glow");

  if (!card) return;

  gsap.from(card, {
    scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" },
    y: 80, opacity: 0, duration: 0.9, ease: "power3.out",
  });

  gsap.from([textH, textP], {
    scrollTrigger: { trigger: card, start: "top 80%", toggleActions: "play none none reverse" },
    y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out", delay: 0.2,
  });

  if (mainImg) {
    /* Parallax drift */
    gsap.to(mainImg, {
      scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1.4 },
      y: -50, ease: "none",
    });
    /* Entrance spin */
    gsap.from(mainImg, {
      scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" },
      rotation: -8, x: 60, opacity: 0, scale: 0.9, duration: 1, ease: "power3.out",
    });
  }

  if (glow) {
    gsap.to(glow, { opacity: 1.2, scale: 1.06, duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true });
  }
}
initWhy();

/* ──────────────────────────────────────────────
   10. NEWSLETTER SECTION  — parallax scale
   ────────────────────────────────────────────── */
function initNewsletter() {
  const section = document.querySelector(".newsletter-section");
  const img     = section && section.querySelector(".newsletter-image");

  if (!section) return;

  gsap.from(section, {
    scrollTrigger: { trigger: section, start: "top 90%", toggleActions: "play none none reverse" },
    opacity: 0, y: 60, duration: 0.85, ease: "power3.out",
  });

  if (img) {
    gsap.fromTo(img,
      { scale: 1.08, y: 20 },
      {
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.5 },
        scale: 1, y: -20, ease: "none",
      }
    );
  }
}
initNewsletter();

/* ──────────────────────────────────────────────
   11. CONTACT SECTION
   ────────────────────────────────────────────── */
function initContact() {
  const card   = document.querySelector(".contact-card");
  const left   = document.querySelector(".contact-left");
  const right  = document.querySelector(".contact-right");
  const fields = document.querySelectorAll(".form-group");

  if (!card) return;

  gsap.from(card, {
    scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none reverse" },
    y: 70, opacity: 0, duration: 0.9, ease: "power3.out",
  });

  gsap.from(left, {
    scrollTrigger: { trigger: card, start: "top 83%", toggleActions: "play none none reverse" },
    x: -50, opacity: 0, duration: 0.85, ease: "power2.out", delay: 0.15,
  });

  gsap.from(right, {
    scrollTrigger: { trigger: card, start: "top 83%", toggleActions: "play none none reverse" },
    x: 50, opacity: 0, duration: 0.85, ease: "power2.out", delay: 0.15,
  });

  gsap.from(fields, {
    scrollTrigger: { trigger: right, start: "top 80%", toggleActions: "play none none reverse" },
    y: 30, opacity: 0, stagger: 0.1, duration: 0.65, ease: "power2.out", delay: 0.3,
  });
}
initContact();

/* ──────────────────────────────────────────────
   12. FOOTER REVEAL
   ────────────────────────────────────────────── */
function initFooter() {
  const footer  = document.querySelector(".rad-footer");
  const vector  = document.querySelector(".footer-vector");
  const ellipse = document.querySelector(".footer-ellipse");
  const logo    = document.querySelector(".footer-logo");
  const cols    = document.querySelectorAll(".footer-col");

  if (!footer) return;

  /* Vector text parallax rise */
  if (vector) {
    gsap.from(vector, {
      scrollTrigger: { trigger: footer, start: "top bottom", toggleActions: "play none none reverse" },
      opacity: 0, y: 40, duration: 1.2, ease: "power2.out",
    });
  }

  /* Ellipse scale in */
  if (ellipse) {
    gsap.from(ellipse, {
      scrollTrigger: { trigger: footer, start: "top 95%", toggleActions: "play none none reverse" },
      scale: 0.85, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2,
    });
  }

  /* Logo drop-in */
  if (logo) {
    gsap.from(logo, {
      scrollTrigger: { trigger: footer, start: "top 90%", toggleActions: "play none none reverse" },
      y: -40, opacity: 0, duration: 0.9, ease: "back.out(1.7)", delay: 0.3,
    });
  }

  /* Link columns stagger */
  if (cols.length) {
    gsap.from(cols, {
      scrollTrigger: { trigger: footer, start: "top 85%", toggleActions: "play none none reverse" },
      y: 35, opacity: 0, stagger: 0.1, duration: 0.75, ease: "power2.out", delay: 0.4,
    });
  }
}
initFooter();

/* ──────────────────────────────────────────────
   13. GLOBAL SECTION PARALLAX BACKGROUNDS
   Subtle vertical drift on section background images
   ────────────────────────────────────────────── */
function initGlobalParallax() {
  const aboutImg = document.querySelector(".about-main-img");
  if (aboutImg) {
    gsap.to(aboutImg, {
      scrollTrigger: { trigger: ".about-services", start: "top bottom", end: "bottom top", scrub: 1 },
      y: -40, ease: "none",
    });
  }

  /* Decorative glow drifts on service cards */
  document.querySelectorAll(".premium-glow-left, .premium-glow-right").forEach((el, i) => {
    gsap.to(el, {
      y       : 20 * (i % 2 === 0 ? 1 : -1),
      opacity : 0.5 + 0.3 * (i % 2),
      duration: 3.5 + i * 0.2,
      ease    : "sine.inOut",
      repeat  : -1,
      yoyo    : true,
      delay   : i * 0.2,
    });
  });
}
initGlobalParallax();

/* ──────────────────────────────────────────────
   14. NAVBAR SCROLL BEHAVIOUR
   Subtle background on scroll
   ────────────────────────────────────────────── */
function initNavbar() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;

  ScrollTrigger.create({
    start: "top -80",
    onUpdate: self => {
      if (self.scroll() > 80) {
        gsap.to(nav, { backgroundColor: "rgba(10,2,22,0.75)", backdropFilter: "blur(12px)", duration: 0.4 });
      } else {
        gsap.to(nav, { backgroundColor: "transparent", backdropFilter: "blur(0px)", duration: 0.4 });
      }
    },
  });

  /* Hamburger */
  const btn  = document.getElementById("hamburger");
  const menu = document.getElementById("navMenu");
  if (btn && menu) {
    btn.addEventListener("click", () => {
      const open = btn.classList.toggle("active");
      gsap.to(menu, {
        opacity : open ? 1 : 0,
        y       : open ? 0 : -20,
        duration: 0.35,
        ease    : "power2.out",
        onStart : () => { if (open) menu.style.display = "flex"; },
        onComplete: () => { if (!open) menu.style.display = "none"; },
        pointerEvents: open ? "all" : "none",
      });
      lenis[open ? "stop" : "start"]();
    });
  }
}
initNavbar();

/* ──────────────────────────────────────────────
   15. SCROLL-PROGRESS INDICATOR
   Thin purple line at the top of the viewport
   ────────────────────────────────────────────── */
(function createProgressBar() {
  const bar = document.createElement("div");
  bar.id = "scroll-progress";
  bar.style.cssText = [
    "position:fixed",
    "top:0",
    "left:0",
    "height:3px",
    "width:0%",
    "background:linear-gradient(90deg,#8733E8,#c266ff)",
    "z-index:9999",
    "pointer-events:none",
    "transform-origin:left",
    "box-shadow:0 0 10px #8733E8",
  ].join(";");
  document.body.appendChild(bar);

  lenis.on("scroll", ({ progress }) => {
    bar.style.width = progress * 100 + "%";
  });
})();

/* ──────────────────────────────────────────────
   16. REBUILD ON RESIZE
   ────────────────────────────────────────────── */
let resizeTimer;
let lastW = window.innerWidth;
let lastH = window.innerHeight;

function rebuild() {
  ScrollTrigger.getAll().forEach(st => st.kill());
  setInitialState();
  createIntro();
  createServices();
  ScrollTrigger.refresh(true);
}

function scheduleRebuild() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (Math.abs(w - lastW) > 30 || Math.abs(h - lastH) > 120) {
      lastW = w; lastH = h;
      rebuild();
    }
  }, 250);
}

window.addEventListener("resize",            scheduleRebuild);
window.addEventListener("orientationchange", scheduleRebuild);

window.addEventListener("load", () => {
  ScrollTrigger.refresh(true);
});