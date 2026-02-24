/* ============================================================
   RAD WORLDWIDE — Enhanced Scroll & Animation System
   ✦ Lenis smooth scroll  ✦ GSAP + ScrollTrigger
   ✦ Full-site parallax   ✦ Partner section tweens
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

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */
function disableStack() { return window.innerHeight < 500; }
function isMobile()     { return window.innerWidth  < 768; }

/* ──────────────────────────────────────────────
   ELEMENTS
   ────────────────────────────────────────────── */
const logoWrapper  = document.querySelector(".logo-wrapper");
const introSection = document.querySelector(".intro");
const heroSection  = document.querySelector(".hero-section");

const floatsUp   = document.querySelectorAll(".intro-float[data-dir='up']");
const floatsDown = document.querySelectorAll(".intro-float[data-dir='down']");
const allFloats  = document.querySelectorAll(".intro-float");

const heroNavbar     = document.querySelector(".navbar");
const heroPill       = heroSection.querySelector(".tag-pill");
const heroH1         = heroSection.querySelector("h1");
const heroP          = heroSection.querySelector(".hero-content p");
const heroFloats     = heroSection.querySelectorAll(".float");
const servicesTitle  = document.querySelector(".services-title");

/* ──────────────────────────────────────────────
   FIX 3 HELPER — forcibly lock services title
   ────────────────────────────────────────────── */
function lockServicesTitle() {
  if (!servicesTitle) return;
  gsap.killTweensOf(servicesTitle);
  gsap.set(servicesTitle, { clearProps: "transform,opacity,visibility,y,x" });
}

/* ──────────────────────────────────────────────
   2. INITIAL STATE
   ──────────────────────────────────────────────
   FIX 2: Navbar starts fully HIDDEN. It only appears
   once the intro overlay fades out (progress ≥ 0.97).
   ────────────────────────────────────────────── */
function setInitialState() {
  gsap.set(heroSection,  { opacity: 1, scale: 1, zIndex: 10 });
  gsap.set([heroPill, heroH1, heroP], { opacity: 1, y: 0 });
  gsap.set(heroFloats,  { opacity: 1, y: 0, scale: 1 });
  gsap.set(allFloats,   { opacity: 1, y: 0, rotation: 0, scale: 1 });
  gsap.set(introSection, { opacity: 1, backgroundColor: "rgba(135,51,232,1)" });

  /* FIX 2 — start hidden */
  gsap.set(heroNavbar, { opacity: 0, pointerEvents: "none" });

  /* FIX 3 — lock title on every reset */
  lockServicesTitle();
}
setInitialState();

/* ──────────────────────────────────────────────
   3. INTRO SCROLL
   ──────────────────────────────────────────────
   FIX 1: transform-origin "50% 54%" targets the open
   triangular gap of the A (below its crossbar).
   FIX 2: navbar fades in as the intro overlay fades out.
   ────────────────────────────────────────────── */
let introST;
let navbarShown = false;

function createIntro() {
  if (introST) introST.kill();
  navbarShown = false;
  gsap.set(heroNavbar, { opacity: 0, pointerEvents: "none" });

  const scrollDist = window.innerHeight * 1.8;

  introST = ScrollTrigger.create({
    trigger      : ".intro",
    start        : "top top",
    end          : `+=${scrollDist}`,
    scrub        : 0.8,
    pin          : true,
    anticipatePin: 1,

    onUpdate: self => {
      const p = self.progress;

      gsap.set(logoWrapper, {
        scale  : 1 + p * 17,
        opacity: 1,
        force3D: true,
      });

      floatsUp.forEach((el, i) => {
        const fp = gsap.utils.clamp(0, 1, (p - 0.03 - i * 0.02) / 0.22);
        gsap.set(el, { y: -fp * 150 + "vh", opacity: 1 - fp });
      });
      floatsDown.forEach((el, i) => {
        const fp = gsap.utils.clamp(0, 1, (p - 0.05 - i * 0.02) / 0.22);
        gsap.set(el, { y: fp * 150 + "vh", opacity: 1 - fp });
      });

      const fade = gsap.utils.clamp(0, 1, (p - 0.97) / 0.03);
      gsap.set(introSection, { opacity: 1 - fade });

      /* FIX 2 — show navbar only when intro overlay is >50% faded */
      if (fade > 0.5 && !navbarShown) {
        navbarShown = true;
        gsap.to(heroNavbar, { opacity: 1, duration: 0.35, ease: "power2.out", pointerEvents: "auto" });
      } else if (fade <= 0.5 && navbarShown) {
        navbarShown = false;
        gsap.to(heroNavbar, { opacity: 0, duration: 0.2, ease: "power2.in", pointerEvents: "none" });
      }
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
   4. NAVBAR — hide when entering about-services
   ────────────────────────────────────────────── */
function initNavbarVisibility() {
  const aboutServices = document.querySelector(".about-services");
  if (!aboutServices) return;

  ScrollTrigger.create({
    trigger: aboutServices,
    start  : "top top",
    onEnter: () => {
      gsap.to(heroNavbar, { opacity: 0, duration: 0.3, ease: "power2.out", pointerEvents: "none" });
    },
    onLeaveBack: () => {
      /* Restore only if the intro has already concluded */
      if (navbarShown) {
        gsap.to(heroNavbar, { opacity: 1, duration: 0.3, ease: "power2.out", pointerEvents: "auto" });
      }
    },
  });
}
initNavbarVisibility();

/* ──────────────────────────────────────────────
   5. SERVICES CARD STACK
   ────────────────────────────────────────────── */
let serviceST;

function createServices() {
  if (serviceST) { serviceST.kill(); serviceST = null; }
  if (disableStack()) return;

  const scene = document.querySelector(".service-stack-scene");
  const cards = gsap.utils.toArray(".service-card");
  if (!scene || !cards.length) return;

  const reversed  = [...cards].reverse();
  const peekY     = [0, 20, 40, 60];
  const peekScale = [1, 0.97, 0.94, 0.91];

  reversed.forEach((card, i) => {
    gsap.set(card, { y: peekY[i] || 0, scale: peekScale[i] || 1, zIndex: reversed.length - i });
  });

  const scrollPerCard = window.innerHeight * 0.7;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger      : scene,
      start        : "top 20%",
      end          : `+=${(reversed.length - 1) * scrollPerCard}`,
      scrub        : 1,
      pin          : true,
      anticipatePin: 1,
    },
  });

  serviceST = tl.scrollTrigger;

  for (let i = 0; i < reversed.length - 1; i++) {
    const remaining = reversed.slice(i + 1);
    tl.to(reversed[i], {
      y: "-130%", opacity: 0,
      rotation: gsap.utils.random(-4, 4),
      scale: 0.92, ease: "power2.in", duration: 1,
    }, i);
    remaining.forEach((card, j) => {
      tl.to(card, { y: peekY[j] || 0, scale: peekScale[j] || 1, ease: "power2.out", duration: 1 }, i);
    });
  }

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
   6. ABOUT SECTION
   ──────────────────────────────────────────────
   FIX 3: Only animate .about-card, .about-text h2, .about-text p,
   and .about-main-img. The .services-title is explicitly excluded
   and re-locked after every tween completes.
   ────────────────────────────────────────────── */
function initAbout() {
  const card  = document.querySelector(".about-card");
  const textH = document.querySelector(".about-text h2");
  const textP = document.querySelector(".about-text p");
  const img   = document.querySelector(".about-main-img");

  if (!card) return;

  gsap.from(card, {
    scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" },
    y: 80, opacity: 0, duration: 0.9, ease: "power3.out",
    onComplete: lockServicesTitle,
    onReverseComplete: lockServicesTitle,
  });

  gsap.from([textH, textP], {
    scrollTrigger: { trigger: card, start: "top 80%", toggleActions: "play none none reverse" },
    y: 40, opacity: 0, duration: 0.85, stagger: 0.15, ease: "power2.out", delay: 0.2,
    onComplete: lockServicesTitle,
    onReverseComplete: lockServicesTitle,
  });

  if (img) {
    gsap.to(img, {
      scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1.2 },
      y: -60, ease: "none",
    });
  }

  /* Safety net: re-lock after ScrollTrigger has fully initialised */
  setTimeout(lockServicesTitle, 300);
}
initAbout();

/* ──────────────────────────────────────────────
   7. PARTNERS SECTION
   ────────────────────────────────────────────── */
function initPartners() {
  const title = document.querySelector(".partners-title");
  const cards = gsap.utils.toArray(".partner-card1, .partner-card2, .partner-card3, .partner-card4, .partner-card5");
  const imgs  = document.querySelectorAll(".partner-main-img");

  if (!cards.length) return;

  if (title) {
    gsap.from(title, {
      scrollTrigger: { trigger: title, start: "top 88%", toggleActions: "play none none reverse" },
      y: 60, opacity: 0, duration: 0.9, ease: "power3.out",
    });
    const underline = document.createElement("span");
    underline.style.cssText = "display:block;height:3px;background:linear-gradient(90deg,#8733E8,#c266ff);width:0;margin:12px auto 0;border-radius:2px;max-width:200px;";
    title.appendChild(underline);
    gsap.to(underline, {
      scrollTrigger: { trigger: title, start: "top 85%", toggleActions: "play none none reverse" },
      width: "100%", duration: 0.8, ease: "power2.out", delay: 0.4,
    });
  }

  const row2Cards = gsap.utils.toArray(".row-2 .partner-card2, .row-2 .partner-card1");
  const row3Cards = gsap.utils.toArray(".row-3 .partner-card3, .row-3 .partner-card4, .row-3 .partner-card5");

  [row2Cards, row3Cards].forEach((group, gi) => {
    gsap.from(group, {
      scrollTrigger: { trigger: group[0], start: "top 88%", toggleActions: "play none none reverse" },
      y: 90, opacity: 0, scale: 0.94, duration: 0.85, stagger: 0.13, ease: "power3.out", delay: gi * 0.1,
    });
  });

  imgs.forEach((img) => {
    const card = img.closest(".partner-card1, .partner-card2, .partner-card3, .partner-card4, .partner-card5");
    gsap.fromTo(img,
      { y: -15 },
      {
        y: 15,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start  : "top bottom",
          end    : "bottom top",
          scrub  : 1.5,
        },
      }
    );
  });

  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -8;
      const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  8;
      gsap.to(card, { rotateX: rx, rotateY: ry, scale: 1.03, duration: 0.35, ease: "power2.out", transformPerspective: 800 });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.55, ease: "power3.out" });
    });
  });
}
initPartners();

/* ──────────────────────────────────────────────
   8. PROJECTS / CLIENTS
   ────────────────────────────────────────────── */
function initProjects() {
  const title = document.querySelector(".projects-title");
  const strip = document.querySelector(".logo-strip");

  if (title) gsap.from(title, {
    scrollTrigger: { trigger: title, start: "top 88%", toggleActions: "play none none reverse" },
    y: 55, opacity: 0, duration: 0.85, ease: "power3.out",
  });
  if (strip) gsap.from(strip, {
    scrollTrigger: { trigger: strip, start: "top 90%", toggleActions: "play none none reverse" },
    opacity: 0, duration: 0.9, ease: "power2.out",
  });
}
initProjects();

/* ──────────────────────────────────────────────
   9. WHY / NEWSLETTER
   ────────────────────────────────────────────── */
function initWhy() {
  const whySection = document.querySelector(".why-section");
  const newsletter = document.querySelector(".newsletter-section");

  if (whySection) {
    gsap.from(whySection.querySelector(".why-card"), {
      scrollTrigger: { trigger: whySection, start: "top 85%", toggleActions: "play none none reverse" },
      y: 60, opacity: 0, duration: 0.9, ease: "power3.out",
    });
    const whyImg = whySection.querySelector(".why-main-img");
    if (whyImg) gsap.fromTo(whyImg, { y: 30 }, {
      y: -30, ease: "none",
      scrollTrigger: { trigger: whySection, start: "top bottom", end: "bottom top", scrub: 1.5 },
    });
  }

  if (newsletter) {
    gsap.from(newsletter.querySelector(".newsletter-container"), {
      scrollTrigger: { trigger: newsletter, start: "top 85%", toggleActions: "play none none reverse" },
      y: 60, opacity: 0, duration: 0.9, ease: "power3.out",
    });
    const radar = newsletter.querySelector(".newsletter-radar");
    if (radar) gsap.fromTo(radar, { y: 20 }, {
      y: -20, ease: "none",
      scrollTrigger: { trigger: newsletter, start: "top bottom", end: "bottom top", scrub: 1.5 },
    });
  }
}
initWhy();

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

  if (vector)  gsap.from(vector,  { scrollTrigger: { trigger: footer, start: "top bottom", toggleActions: "play none none reverse" }, opacity: 0, y: 40, duration: 1.2, ease: "power2.out" });
  if (ellipse) gsap.from(ellipse, { scrollTrigger: { trigger: footer, start: "top 95%",    toggleActions: "play none none reverse" }, scale: 0.85, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2 });
  if (logo)    gsap.from(logo,    { scrollTrigger: { trigger: footer, start: "top 90%",    toggleActions: "play none none reverse" }, y: -40, opacity: 0, duration: 0.9, ease: "back.out(1.7)", delay: 0.3 });
  if (cols.length) gsap.from(cols, { scrollTrigger: { trigger: footer, start: "top 85%",   toggleActions: "play none none reverse" }, y: 35, opacity: 0, stagger: 0.1, duration: 0.75, ease: "power2.out", delay: 0.4 });
}
initFooter();

/* ──────────────────────────────────────────────
   13. GLOBAL PARALLAX
   ────────────────────────────────────────────── */
function initGlobalParallax() {
  const aboutImg = document.querySelector(".about-main-img");
  if (aboutImg) gsap.to(aboutImg, {
    scrollTrigger: { trigger: ".about-services", start: "top bottom", end: "bottom top", scrub: 1 },
    y: -40, ease: "none",
  });
}
initGlobalParallax();

/* ──────────────────────────────────────────────
   15. SCROLL-PROGRESS BAR
   ────────────────────────────────────────────── */
(function createProgressBar() {
  const bar = document.createElement("div");
  bar.id = "scroll-progress";
  bar.style.cssText = "position:fixed;top:0;left:0;height:3px;width:0%;background:linear-gradient(90deg,#8733E8,#c266ff);z-index:9999;pointer-events:none;transform-origin:left;box-shadow:0 0 10px #8733E8;";
  document.body.appendChild(bar);
  lenis.on("scroll", ({ progress }) => { bar.style.width = progress * 100 + "%"; });
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
  initWhy();
  initNavbarVisibility();
  lockServicesTitle();
  ScrollTrigger.refresh(true);
}
function scheduleRebuild() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const w = window.innerWidth, h = window.innerHeight;
    if (Math.abs(w - lastW) > 30 || Math.abs(h - lastH) > 120) {
      lastW = w; lastH = h; rebuild();
    }
  }, 250);
}
window.addEventListener("resize",            scheduleRebuild);
window.addEventListener("orientationchange", scheduleRebuild);
window.addEventListener("load", () => {
  ScrollTrigger.refresh(true);
  lockServicesTitle();
});

/* ================= MOBILE MENU TOGGLE ================= */
(function () {
  const hamburger = document.getElementById("hamburger");
  const navMenu   = document.getElementById("navMenu");
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener("click", function () {
    const isOpen = hamburger.classList.toggle("active");
    navMenu.classList.toggle("active", isOpen);
    if (isOpen) { lenis.stop(); document.body.style.overflow = "hidden"; }
    else        { lenis.start(); document.body.style.overflow = ""; }
  });

  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      lenis.start();
      document.body.style.overflow = "";
    });
  });
})();