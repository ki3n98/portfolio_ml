/**
 * main.js — Portfolio site interactions
 *
 * Sections:
 *   1. Navigation (smooth scroll, mobile menu, active state, fade-in)
 *   2. Gradient Descent Visualization
 *      a. Project data
 *      b. Utilities (math, easing, escapeHtml, lerp)
 *      c. State & configuration
 *      d. DOM references
 *      e. Layout & coordinate mapping
 *      f. Drawing functions
 *      g. Scroll-driven animation
 *      h. Info panel management
 *      i. Mouse interaction
 *      j. Initialization
 */

// ===========================
// 1. Navigation
// ===========================

// --- Smooth Scroll for Nav Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu if open
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
  });
});

// --- Mobile Menu Toggle ---
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// --- Active Nav Link on Scroll ---
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav__link');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  {
    rootMargin: '-40% 0px -60% 0px',
  }
);

sections.forEach(section => navObserver.observe(section));

// --- Scroll-Triggered Fade-In ---
const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  }
);

fadeElements.forEach(el => fadeObserver.observe(el));

// ===========================
// 2. Gradient Descent Visualization
// ===========================
(function () {

  // ----- 2a. Project Data -----

  /**
   * Project data for the gradient descent visualization.
   * @typedef {Object} Project
   * @property {number}   x               - Position on the parabola (-2.2 to 2.2)
   * @property {string}   title
   * @property {string}   desc
   * @property {string}   [award]
   * @property {string[]} tags
   * @property {string}   link            - Primary CTA URL
   * @property {string}   [ctaLabel]      - Defaults to "View Project →"
   * @property {string}   [secondaryLink]
   * @property {string}   [secondaryLabel]
   * @property {string}   step            - Label like "Step 1 - High Loss"
   * @property {string}   [mediaType]     - "Video" | "Image"
   * @property {string}   [mediaSrc]      - Local video/image path
   * @property {string}   [mediaEmbed]    - YouTube embed URL
   * @property {string}   [mediaText]     - Alt text / caption
   * @property {boolean}  [includeInOverview] - Defaults to true
   * @property {boolean}  [hideMedia]
   */
  const PROJECTS = [
    {
      x: -1.9,
      title: 'Shape & Sign',
      desc: 'Shape-Sign is an interactive application that utilizes hand gesture recognition models to help users learn and engage with sign language.',
      award: 'BeachHacks 8.0 2025 • Best Overall',
      tags: ['Next.js', 'Computer Vision', 'LSTM', 'TensorFlow.js', 'MediaPipe'],
      link: 'https://shape-sign-mu.vercel.app/',
      ctaLabel: 'Live Demo →',
      secondaryLink: 'https://github.com/ki3n98/shape-sign',
      secondaryLabel: 'Source Code',
      step: 'Step 1 - High Loss',
      mediaType: 'Video',
      mediaSrc: 'assets/videos/shape_sign_demo.mp4',
      mediaText: 'Shape & Sign demo',
    },
    {
      x: -1.4,
      title: '911 Operator Assistance',
      desc: 'A 911 operator co-pilot. The system pairs a Next.js dashboard with a FastAPI inference service that transcribes audio, classifies incidents, geocodes caller locations, and lets dispatchers confirm markers or request field units.',
      award: 'Marina Hack 5.0 • Best Overall',
      tags: ['Pytorch', 'WhisperSTT', 'Google Geocoding API', 'Gemini', 'Next.js', 'FastAPI'],
      link: 'https://github.com/Ben2104/911-Operator-Assistant',
      step: 'Step 2 - Descending',
      mediaType: 'Video',
      mediaEmbed: 'https://www.youtube.com/embed/okCDJyBionU?start=40&autoplay=1&mute=1&playsinline=1&rel=0',
      mediaText: '911 Operator demo video',
    },
    {
      x: -0.9,
      title: 'VeriFace',
      desc: 'An AI-assisted check-in system using facial recognition for classrooms and social events.',
      award: 'Senior Project',
      tags: ['FaceNet', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Docker', 'JWT', 'bcrypt', 'ngrok', 'websockets'],
      link: 'https://github.com/ki3n98/VeriFace',
      step: 'Step 3 - Converging',
      mediaType: 'Video',
      mediaSrc: 'assets/videos/veriface_demo.mp4',
      mediaText: 'VeriFace demo',
    },
    {
      x: -0.4,
      title: 'DocGenix',
      desc: 'AI-powered software project blueprint generator. Describe your idea, get back a full set of production-ready documentation in minutes.',
      award: 'BeachHack 9.0 2026',
      tags: ['LangChain', 'Agents', 'Multi-agent orchestration'],
      link: 'https://docgenix-frontend-production.up.railway.app/',
      ctaLabel: 'Live Demo →',
      secondaryLink: 'https://github.com/zokoxa/DocGenix',
      secondaryLabel: 'Source Code',
      step: 'Step 4 - Local Optimum',
      mediaType: 'Video',
      mediaEmbed: 'https://www.youtube.com/embed/SqQycaZNr4Q?start=115&autoplay=1&mute=1&playsinline=1&rel=0',
      mediaText: 'DocGenix demo',
    },
    {
      x: 0,
      title: 'Hire Me',
      desc: 'I build real-time computer vision and AI systems with a focus on performance, product thinking, and production-ready deployment.',
      tags: ['Applied ML', 'AI Engineer', 'Computer Vision', 'Full-Stack AI'],
      includeInOverview: false,
      hideMedia: false,
      mediaType: 'Image',
      mediaSrc: 'assets/img/emi.jpg',
      mediaText: 'Kien Pham',
      link: '#contact',
      ctaLabel: 'Get In Touch →',
      secondaryLink: 'assets/resume/Kien_Pham_resume.pdf',
      secondaryLabel: 'Download Resume',
      step: 'Step 5 - Hire Me',
    },
  ];

  const N = PROJECTS.length;

  // ----- 2b. Utilities -----

  function f(x) { return x * x; }
  function fPrime(x) { return 2 * x; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function easeOutBack(t) {
    const c = 1.4;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ----- 2c. State & Configuration -----

  const ZOOM_AMOUNT = 2.2;

  // Scroll phase tuning constants
  const INTRO_DRAW_FRACTION = 0.6;
  const DOT_APPEAR_START = 0.4;
  const TANGENT_FADE_THRESHOLD = 0.35;
  const CARD_HOLD_THRESHOLD = 0.28;
  const OVERVIEW_SHOW_THRESHOLD = 0.22;

  // Lerp speeds (lower = smoother)
  const LERP_SPEED = {
    zoom: 0.08,
    pan: 0.12,
    tangent: 0.10,
    intro: 0.10,
    overview: 0.1,
  };

  // Current rendered state
  const state = {
    activeIndex: -1,
    hoveredIndex: -1,
    tangentProgress: 0,
    introProgress: 0,
    dotReveal: 0,
    overviewProgress: 0,
    zoomLevel: 1,
    zoomCenterX: 0,
    zoomCenterY: 0,
  };

  // Lerp targets (scroll-derived, smoothly approached by animLoop)
  const target = {
    zoom: 1,
    centerX: 0,
    centerY: 0,
    tangent: 0,
    introProgress: 0,
    dotReveal: 0,
    activeIndex: -1,
    overviewProgress: 0,
    fastTransition: false,
  };

  let prevScrollIndex = -1;
  let animLoopRunning = false;
  let overviewVisible = false;
  let infoSwapTimer = null;
  let currentInfoIdx = -1;

  // Total scroll phases: 1 intro step + N project steps
  const TOTAL_STEPS = N + 1;

  // ----- 2d. DOM References -----

  const canvas = document.getElementById('gd-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('projects');
  const introPanel = document.querySelector('.gd-intro');
  const infoPanel = document.getElementById('gd-info');
  const infoStep = document.getElementById('gd-info-step');
  const infoTitle = document.getElementById('gd-info-title');
  const infoAward = document.getElementById('gd-info-award');
  const infoDesc = document.getElementById('gd-info-desc');
  const infoTags = document.getElementById('gd-info-tags');
  const infoLink = document.getElementById('gd-info-link');
  const infoSecondaryLink = document.getElementById('gd-info-secondary-link');
  const infoGradient = document.getElementById('gd-info-gradient');
  const infoMedia = document.getElementById('gd-info-media');
  const infoMediaVideo = document.getElementById('gd-info-media-video');
  const infoMediaImg = document.getElementById('gd-info-media-img');
  const infoMediaEmbed = document.getElementById('gd-info-media-embed');
  const infoMediaType = document.getElementById('gd-info-media-type');
  const infoMediaText = document.getElementById('gd-info-media-text');
  const overviewPanel = document.getElementById('gd-overview');
  const overviewGrid = document.getElementById('gd-overview-grid');
  const scrollHint = document.getElementById('gd-scroll-hint');

  // ----- 2e. Layout & Coordinate Mapping -----

  let W = 0, H = 0, dpr = 1;
  let padL, padR, padT, padB, plotW, plotH;
  const xMin = -2.2, xMax = 2.2, yMin = -0.2, yMax = 5;

  let colors = {};

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    colors.bg = s.getPropertyValue('--bg').trim();
    colors.primary = s.getPropertyValue('--primary-accent').trim();
    colors.medium = s.getPropertyValue('--medium-accent').trim();
    colors.dark = s.getPropertyValue('--dark-accent').trim();
    colors.text = s.getPropertyValue('--text').trim();
    colors.muted = s.getPropertyValue('--text-muted').trim();
    colors.border = s.getPropertyValue('--border').trim();
  }

  function mathToCanvas(mx, my) {
    const cx = padL + ((mx - xMin) / (xMax - xMin)) * plotW;
    const cy = padT + plotH - ((my - yMin) / (yMax - yMin)) * plotH;
    return [cx, cy];
  }

  function resize() {
    const wrap = canvas.parentElement;
    dpr = window.devicePixelRatio || 1;
    W = wrap.clientWidth;
    H = wrap.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    padL = W * 0.1;
    padR = W * 0.1;
    padT = H * 0.12;
    padB = H * 0.14;
    plotW = W - padL - padR;
    plotH = H - padT - padB;

    // Seed zoom center to canvas center if not yet set
    if (state.zoomCenterX === 0 && state.zoomCenterY === 0) {
      state.zoomCenterX = target.centerX = W / 2;
      state.zoomCenterY = target.centerY = H / 2;
    }

    render();
  }

  // ----- 2f. Drawing Functions -----

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.25;

    const tickLen = 6;
    const fontSize = Math.max(9, Math.min(W, H) * 0.012);

    // Horizontal lines + Y-axis ticks/labels
    for (let y = 0; y <= 4; y++) {
      const [, cy] = mathToCanvas(0, y);
      ctx.beginPath();
      ctx.moveTo(padL, cy);
      ctx.lineTo(padL + plotW, cy);
      ctx.stroke();
      // Tick
      ctx.beginPath();
      ctx.moveTo(padL - tickLen, cy);
      ctx.lineTo(padL, cy);
      ctx.stroke();
      // Label
      ctx.font = '400 ' + fontSize + 'px Inter, sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.globalAlpha = 0.3;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(y, padL - tickLen - 4, cy);
      ctx.globalAlpha = 0.25;
    }

    // Vertical lines + X-axis ticks/labels
    for (let x = -2; x <= 2; x++) {
      const [cx] = mathToCanvas(x, 0);
      ctx.beginPath();
      ctx.moveTo(cx, padT);
      ctx.lineTo(cx, padT + plotH);
      ctx.stroke();
      // Tick
      ctx.beginPath();
      ctx.moveTo(cx, padT + plotH);
      ctx.lineTo(cx, padT + plotH + tickLen);
      ctx.stroke();
      // Label
      ctx.font = '400 ' + fontSize + 'px Inter, sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.globalAlpha = 0.3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(x, cx, padT + plotH + tickLen + 3);
      ctx.globalAlpha = 0.25;
    }

    ctx.restore();
  }

  function drawParabola() {
    const steps = 100;
    const drawSteps = Math.floor(state.introProgress * steps);
    if (drawSteps < 2) return;

    ctx.save();
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= drawSteps; i++) {
      const mx = xMin + (i / steps) * (xMax - xMin);
      const my = f(mx);
      if (my > yMax) { started = false; continue; }
      const pt = mathToCanvas(mx, my);
      if (!started) { ctx.moveTo(pt[0], pt[1]); started = true; }
      else ctx.lineTo(pt[0], pt[1]);
    }
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawDot(i) {
    // Per-dot reveal: how much this dot has appeared (0 = hidden, 1 = full)
    const dotT = Math.max(0, Math.min(1, state.dotReveal - i));
    if (dotT <= 0) return;

    // Overshoot ease for pop-in: goes to ~1.1 then settles to 1
    const scale = dotT < 1 ? easeOutBack(dotT) : 1;

    const proj = PROJECTS[i];
    const pt = mathToCanvas(proj.x, f(proj.x));
    const cx = pt[0], cy = pt[1];
    const isActive = i === state.activeIndex;
    const isHovered = i === state.hoveredIndex;
    const baseRadius = isActive ? 12 : isHovered ? 10 : 7;
    const radius = baseRadius * scale;

    ctx.save();
    ctx.globalAlpha = Math.min(1, dotT * 2);

    // Pulsing glow ring for active
    if (isActive && scale >= 0.95) {
      const pulse = Math.sin(performance.now() * 0.003) * 0.5 + 0.5;
      const pulseRadius = radius + 6 + pulse * 4;
      const pulseAlpha = 0.12 + pulse * 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = colors.primary;
      ctx.globalAlpha = pulseAlpha;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Second ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Glow
    if (isActive || isHovered) {
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = isActive ? 12 : 8;
    }

    // Main dot
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();

    // Inner dot for active
    if (isActive && scale >= 0.95) {
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(cx, cy, 4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = colors.bg;
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // Step label (fade in with dot)
    if (scale > 0.6) {
      const labelAlpha = (scale - 0.6) / 0.4;
      const fontSize = Math.max(11, Math.min(W, H) * 0.016);
      ctx.font = '500 ' + fontSize + 'px Inter, sans-serif';
      ctx.fillStyle = isActive ? colors.text : colors.muted;
      ctx.textAlign = 'left';
      ctx.globalAlpha = (isActive ? 0.9 : 0.5) * labelAlpha;
      ctx.fillText('Step ' + (i + 1), cx + radius + 10, cy + 4);
    }

    ctx.restore();
  }

  function drawTangent(i) {
    if (state.tangentProgress <= 0 || i < 0) return;
    const proj = PROJECTS[i];
    const x0 = proj.x;
    const slope = fPrime(x0);
    const extent = 1.0 * state.tangentProgress;

    const xA = x0 - extent, xB = x0 + extent;
    const yA = slope * (xA - x0) + f(x0);
    const yB = slope * (xB - x0) + f(x0);
    const ptA = mathToCanvas(xA, yA), ptB = mathToCanvas(xB, yB);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ptA[0], ptA[1]);
    ctx.lineTo(ptB[0], ptB[1]);
    ctx.setLineDash([8, 5]);
    ctx.strokeStyle = colors.text;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawConnectors() {
    if (state.dotReveal < 1.5) return;
    const count = Math.floor(state.dotReveal);

    ctx.save();
    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = colors.medium;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;

    for (let i = 0; i < count - 1; i++) {
      const p1 = mathToCanvas(PROJECTS[i].x, f(PROJECTS[i].x));
      const p2 = mathToCanvas(PROJECTS[i + 1].x, f(PROJECTS[i + 1].x));
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawTrail() {
    if (state.activeIndex < 0 || state.activeIndex >= N - 1 || state.tangentProgress < 0.3 || state.dotReveal < state.activeIndex + 2) return;
    const fromX = PROJECTS[state.activeIndex].x;
    const toX = PROJECTS[state.activeIndex + 1].x;
    const trailAlpha = 0.2 * Math.min(1, (state.tangentProgress - 0.3) / 0.4);

    ctx.save();
    ctx.beginPath();
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const mx = fromX + (i / steps) * (toX - fromX);
      const my = f(mx);
      const pt = mathToCanvas(mx, my);
      if (i === 0) ctx.moveTo(pt[0], pt[1]);
      else ctx.lineTo(pt[0], pt[1]);
    }
    ctx.strokeStyle = colors.primary;
    ctx.globalAlpha = trailAlpha;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  function drawArrow() {
    if (state.activeIndex < 0 || state.activeIndex >= N - 1 || state.tangentProgress < 0.5) return;
    const proj = PROJECTS[state.activeIndex];
    const x0 = proj.x;
    const arrowAlpha = 0.4 * Math.min(1, (state.tangentProgress - 0.5) * 3);

    const dx = 0.15;
    const tipX = x0 + dx;
    const tipY = f(tipX);
    const baseX = x0 + dx * 0.4;
    const baseY = f(baseX);

    const tip = mathToCanvas(tipX, tipY);
    const base = mathToCanvas(baseX, baseY);

    let dirX = tip[0] - base[0];
    let dirY = tip[1] - base[1];
    const len = Math.hypot(dirX, dirY);
    if (len < 1) return;
    dirX /= len; dirY /= len;

    const arrowSize = 8;
    const perpX = -dirY * arrowSize;
    const perpY = dirX * arrowSize;

    ctx.save();
    ctx.globalAlpha = arrowAlpha;
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.moveTo(tip[0], tip[1]);
    ctx.lineTo(tip[0] - dirX * arrowSize * 2 + perpX, tip[1] - dirY * arrowSize * 2 + perpY);
    ctx.lineTo(tip[0] - dirX * arrowSize * 2 - perpX, tip[1] - dirY * arrowSize * 2 - perpY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawEquationLabel() {
    if (state.introProgress < 0.5) return;
    const labelAlpha = Math.min(0.3, (state.introProgress - 0.5) * 0.6);
    const fontSize = Math.max(12, Math.min(W, H) * 0.018);

    const pt = mathToCanvas(1.2, 3.5);

    ctx.save();
    ctx.font = 'italic 400 ' + fontSize + 'px "Playfair Display", Georgia, serif';
    ctx.fillStyle = colors.muted;
    ctx.globalAlpha = labelAlpha;
    ctx.textAlign = 'center';
    ctx.fillText('L(\u03B8) = \u03B8\u00B2', pt[0], pt[1]);
    ctx.restore();
  }

  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Apply zoom: translate so zoomCenter stays in place, then scale
    if (state.zoomLevel > 1.001) {
      const vpCx = W / 2;
      const vpCy = H / 2;
      ctx.translate(vpCx, vpCy);
      ctx.scale(state.zoomLevel, state.zoomLevel);
      ctx.translate(-state.zoomCenterX, -state.zoomCenterY);
    }

    drawGrid();
    drawParabola();
    drawEquationLabel();
    drawTrail();
    drawConnectors();
    for (let i = 0; i < N; i++) drawDot(i);
    drawTangent(state.activeIndex);
    drawArrow();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ----- 2g. Scroll-Driven Animation -----

  function getScrollProgress() {
    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / scrollable));
  }

  function renderOverviewCards() {
    if (!overviewGrid) return;
    overviewGrid.innerHTML = PROJECTS.filter(proj => proj.includeInOverview !== false)
      .map(proj => {
        const awardMarkup = proj.award
          ? '<span class="gd-overview__award">' + escapeHtml(proj.award) + '</span>'
          : '';
        return (
          '<a class="gd-overview__card" href="#projects" data-project-index="' + PROJECTS.indexOf(proj) + '">' +
            '<span class="gd-overview__step">' + proj.step + '</span>' +
            awardMarkup +
            '<h4 class="gd-overview__card-title">' + proj.title + '</h4>' +
            '<p class="gd-overview__desc">' + proj.desc + '</p>' +
            '<div class="gd-overview__tags">' + proj.tags.map(t =>
              '<span class="gd-overview__tag">' + escapeHtml(t) + '</span>'
            ).join('') + '</div>' +
          '</a>'
        );
      }).join('');
  }

  function scrollToProjectIndex(idx) {
    if (idx < 0 || idx >= N) return;
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;

    const phaseNudge = idx === 0 ? 0.08 : 0;
    const targetProgress = (idx + 1 + phaseNudge) / TOTAL_STEPS;
    const targetTop = sectionTop + scrollable * targetProgress;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  }

  function handleOverviewClick(e) {
    const card = e.target.closest('.gd-overview__card');
    if (!card) return;
    e.preventDefault();
    const idx = Number(card.dataset.projectIndex);
    if (Number.isNaN(idx)) return;
    scrollToProjectIndex(idx);
  }

  function setOverviewState(isVisible) {
    if (!overviewPanel || !infoPanel) return;
    if (isVisible === overviewVisible) return;
    overviewVisible = isVisible;
    overviewPanel.classList.toggle('active', isVisible);
    overviewPanel.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
    infoPanel.classList.toggle('hidden', isVisible);
  }

  // --- Scroll phase helpers ---

  function computeIntroTargets(introPhase) {
    // Parabola draws during first portion of intro step
    target.introProgress = easeOut(Math.min(1, introPhase / INTRO_DRAW_FRACTION));

    // Dots appear during latter portion — continuous float for smooth scale-in
    const dotPhase = Math.max(0, (introPhase - DOT_APPEAR_START) / (1 - DOT_APPEAR_START));
    target.dotReveal = Math.min(N, dotPhase * N);
  }

  function computeProjectTargets(projectProgress, floatIndex) {
    const nearestIndex = Math.max(0, Math.min(N - 1, Math.round(floatIndex)));
    const distToNearest = Math.abs(floatIndex - nearestIndex);

    // Tangent: full when close to a dot, fades when panning between dots
    const tangentT = 1 - Math.min(1, distToNearest / TANGENT_FADE_THRESHOLD);
    target.tangent = easeOut(Math.max(0, tangentT));
    target.overviewProgress = 0;

    // Zoom: ramp to full over first half-step
    const zoomEntry = Math.min(1, projectProgress / 0.5);
    target.zoom = 1 + (ZOOM_AMOUNT - 1) * (0.5 + 0.5 * easeOut(zoomEntry));

    // Center: smoothly interpolate between adjacent dot positions
    const lowerIdx = Math.max(0, Math.min(N - 2, Math.floor(floatIndex)));
    const upperIdx = lowerIdx + 1;
    const t = floatIndex - lowerIdx;
    const easedT = t * t * (3 - 2 * t); // smoothstep

    const ptA = mathToCanvas(PROJECTS[lowerIdx].x, f(PROJECTS[lowerIdx].x));
    const ptB = mathToCanvas(PROJECTS[upperIdx].x, f(PROJECTS[upperIdx].x));
    target.centerX = ptA[0] + (ptB[0] - ptA[0]) * easedT;
    target.centerY = ptA[1] + (ptB[1] - ptA[1]) * easedT;

    target.activeIndex = nearestIndex;
  }

  function computeOverviewTargets(projectProgress, focusPhaseEnd, lastDotPt) {
    const overviewT = Math.max(0, Math.min(1, projectProgress - focusPhaseEnd));
    const easedOverview = overviewT * overviewT * (3 - 2 * overviewT);
    const cardHoldT = Math.max(0, Math.min(1, overviewT / CARD_HOLD_THRESHOLD));

    target.activeIndex = overviewT < CARD_HOLD_THRESHOLD ? N - 1 : -1;
    target.tangent = 1 - cardHoldT;
    target.overviewProgress = overviewT;
    target.zoom = ZOOM_AMOUNT + (1 - ZOOM_AMOUNT) * easedOverview;
    target.centerX = lastDotPt[0] + (W / 2 - lastDotPt[0]) * easedOverview;
    target.centerY = lastDotPt[1] + (H / 2 - lastDotPt[1]) * easedOverview;
  }

  function onScroll() {
    const rect = section.getBoundingClientRect();
    if (rect.top >= window.innerHeight || rect.bottom <= 0) {
      target.activeIndex = -1;
      target.tangent = 0;
      target.overviewProgress = 0;
      prevScrollIndex = -1;
      state.activeIndex = -1;
      state.hoveredIndex = -1;
      setOverviewState(false);
      updateInfo(-1);
      render();
      return;
    }

    const progress = getScrollProgress();

    // Hide scroll hint once scrolling begins
    if (progress > 0.01 && scrollHint) {
      scrollHint.classList.add('hidden');
    }

    if (introPanel) {
      introPanel.classList.toggle('compact', progress > 0.02);
    }

    // Map progress across all steps (intro + projects)
    const rawStep = progress * TOTAL_STEPS;
    const introPhase = Math.max(0, Math.min(1, rawStep));

    computeIntroTargets(introPhase);

    // Project focus + overview (steps 1..N)
    const projectProgress = Math.max(0, rawStep - 1);
    const focusPhaseEnd = N - 1;
    const floatIndex = Math.min(N - 1, projectProgress);
    target.fastTransition = projectProgress > 0 && projectProgress < 2.6;

    const firstDotPt = mathToCanvas(PROJECTS[0].x, f(PROJECTS[0].x));
    const lastDotPt = mathToCanvas(PROJECTS[N - 1].x, f(PROJECTS[N - 1].x));

    // Start panning toward first dot and zooming during last portion of intro
    const leadIn = Math.max(0, (introPhase - INTRO_DRAW_FRACTION) / (1 - INTRO_DRAW_FRACTION));
    const easedLeadIn = leadIn * leadIn * (3 - 2 * leadIn); // smoothstep

    if (projectProgress <= 0) {
      // Still in intro, no project focused
      target.activeIndex = -1;
      target.tangent = 0;
      target.overviewProgress = 0;

      // Smoothly ramp zoom and center toward first dot during intro tail
      target.zoom = 1 + (ZOOM_AMOUNT - 1) * easedLeadIn * 0.5;
      target.centerX = W / 2 + (firstDotPt[0] - W / 2) * easedLeadIn;
      target.centerY = H / 2 + (firstDotPt[1] - H / 2) * easedLeadIn;
    } else if (projectProgress > focusPhaseEnd) {
      computeOverviewTargets(projectProgress, focusPhaseEnd, lastDotPt);
    } else {
      computeProjectTargets(projectProgress, floatIndex);
    }

    const newIndex = target.activeIndex;
    if (newIndex !== prevScrollIndex) {
      prevScrollIndex = newIndex;
      state.activeIndex = newIndex;
      updateInfo(newIndex);
    }

    setOverviewState(target.overviewProgress > OVERVIEW_SHOW_THRESHOLD);

    // Start animation loop if not running
    if (!animLoopRunning) {
      animLoopRunning = true;
      requestAnimationFrame(animLoop);
    }
  }

  function animLoop() {
    const zoomLerp = target.fastTransition ? 0.12 : LERP_SPEED.zoom;
    const panLerp = target.fastTransition ? 0.18 : LERP_SPEED.pan;
    const tangentLerp = target.fastTransition ? 0.14 : LERP_SPEED.tangent;

    state.introProgress = lerp(state.introProgress, target.introProgress, LERP_SPEED.intro);
    state.dotReveal = lerp(state.dotReveal, target.dotReveal, LERP_SPEED.intro);
    state.zoomLevel = lerp(state.zoomLevel, target.zoom, zoomLerp);
    state.zoomCenterX = lerp(state.zoomCenterX, target.centerX, panLerp);
    state.zoomCenterY = lerp(state.zoomCenterY, target.centerY, panLerp);
    state.tangentProgress = lerp(state.tangentProgress, target.tangent, tangentLerp);
    state.overviewProgress = lerp(state.overviewProgress, target.overviewProgress, LERP_SPEED.overview);

    state.activeIndex = target.activeIndex;

    render();

    // Check if values have settled
    const settled =
      Math.abs(state.introProgress - target.introProgress) < 0.003 &&
      Math.abs(state.dotReveal - target.dotReveal) < 0.01 &&
      Math.abs(state.zoomLevel - target.zoom) < 0.002 &&
      Math.abs(state.zoomCenterX - target.centerX) < 0.5 &&
      Math.abs(state.zoomCenterY - target.centerY) < 0.5 &&
      Math.abs(state.tangentProgress - target.tangent) < 0.005 &&
      Math.abs(state.overviewProgress - target.overviewProgress) < 0.01;

    if (settled) {
      state.introProgress = target.introProgress;
      state.dotReveal = target.dotReveal;
      state.zoomLevel = target.zoom;
      state.zoomCenterX = target.centerX;
      state.zoomCenterY = target.centerY;
      state.tangentProgress = target.tangent;
      state.overviewProgress = target.overviewProgress;
    }

    if (!settled || state.activeIndex >= 0) {
      requestAnimationFrame(animLoop);
    } else {
      render();
      animLoopRunning = false;
    }
  }

  // ----- 2h. Info Panel Management -----

  function updateMediaPanel(proj) {
    infoMedia.hidden = !!proj.hideMedia;
    infoMedia.classList.toggle('is-hidden', !!proj.hideMedia);
    infoMedia.dataset.type = (proj.mediaType || 'image').toLowerCase();

    const isImage = (proj.mediaType || '').toLowerCase() === 'image' && proj.mediaSrc;
    infoMedia.dataset.hasVideo = (!isImage && proj.mediaSrc) ? 'true' : 'false';
    infoMedia.dataset.hasEmbed = proj.mediaEmbed ? 'true' : 'false';
    infoMedia.dataset.hasImage = isImage ? 'true' : 'false';
    infoMediaType.textContent = proj.mediaType || 'Image';
    infoMediaText.textContent = proj.mediaText || 'Project media placeholder';

    if (proj.mediaEmbed) {
      infoMediaVideo.pause();
      infoMediaVideo.removeAttribute('src');
      infoMediaVideo.load();
      if (infoMediaEmbed.getAttribute('src') !== proj.mediaEmbed) {
        infoMediaEmbed.src = proj.mediaEmbed;
      }
      infoMediaEmbed.title = proj.title + ' demo';
    } else {
      infoMediaEmbed.removeAttribute('src');
      infoMediaEmbed.title = '';
    }

    if (isImage) {
      infoMediaImg.src = proj.mediaSrc;
      infoMediaImg.alt = proj.mediaText || proj.title;
      infoMediaVideo.pause();
      infoMediaVideo.removeAttribute('src');
      infoMediaVideo.load();
    } else if (proj.mediaSrc) {
      infoMediaImg.removeAttribute('src');
      infoMediaEmbed.removeAttribute('src');
      infoMediaEmbed.title = '';
      if (infoMediaVideo.getAttribute('src') !== proj.mediaSrc) {
        infoMediaVideo.src = proj.mediaSrc;
        infoMediaVideo.load();
      }
      infoMediaVideo.play().catch(() => {});
    } else {
      infoMediaImg.removeAttribute('src');
      infoMediaVideo.pause();
      infoMediaVideo.removeAttribute('src');
      infoMediaVideo.load();
    }
  }

  function updateLinks(proj) {
    infoLink.href = proj.link;
    const isExternalLink = /^https?:\/\//i.test(proj.link || '');
    infoLink.target = isExternalLink ? '_blank' : '';
    infoLink.rel = isExternalLink ? 'noopener noreferrer' : '';
    infoLink.textContent = proj.ctaLabel || 'View Project →';

    infoSecondaryLink.hidden = !proj.secondaryLink;
    infoSecondaryLink.classList.toggle('is-hidden', !proj.secondaryLink);
    if (proj.secondaryLink) {
      infoSecondaryLink.href = proj.secondaryLink;
      infoSecondaryLink.textContent = proj.secondaryLabel || 'Learn More';
      if (proj.secondaryLink.match(/\.(pdf|zip|tar|gz)$/i)) {
        infoSecondaryLink.setAttribute('download', '');
      } else {
        infoSecondaryLink.removeAttribute('download');
      }
      const isExternal = /^https?:\/\//i.test(proj.secondaryLink);
      infoSecondaryLink.target = isExternal ? '_blank' : '';
      infoSecondaryLink.rel = isExternal ? 'noopener noreferrer' : '';
    } else {
      infoSecondaryLink.removeAttribute('href');
      infoSecondaryLink.removeAttribute('download');
    }
  }

  function updateInfo(idx) {
    if (infoSwapTimer) {
      clearTimeout(infoSwapTimer);
      infoSwapTimer = null;
    }

    if (idx < 0 || idx >= N) {
      infoPanel.classList.remove('active');
      currentInfoIdx = -1;
      return;
    }
    if (idx === currentInfoIdx) return;
    currentInfoIdx = idx;

    // Fade out, swap content, fade in
    infoPanel.classList.remove('active');

    infoSwapTimer = setTimeout(() => {
      const proj = PROJECTS[idx];
      const slope = fPrime(proj.x);

      infoStep.textContent = proj.step;
      infoGradient.textContent = '\u2207 = ' + slope.toFixed(2);
      infoTitle.textContent = proj.title;
      infoAward.textContent = proj.award || '';
      infoAward.hidden = !proj.award;
      infoAward.classList.toggle('is-hidden', !proj.award);
      infoDesc.textContent = proj.desc;

      updateMediaPanel(proj);

      infoTags.innerHTML = proj.tags.map(t =>
        '<span class="tag">' + t + '</span>'
      ).join('');

      updateLinks(proj);

      // Progress bar
      infoPanel.style.setProperty('--gd-progress', ((idx + 1) / N * 100) + '%');
      void infoPanel.offsetHeight;
      infoPanel.classList.add('active');
      infoSwapTimer = null;
    }, 250);
  }

  // ----- 2i. Mouse Interaction -----

  function getHoveredDot(cx, cy) {
    const hitRadius = 28;
    for (let i = 0; i < N; i++) {
      const pt = mathToCanvas(PROJECTS[i].x, f(PROJECTS[i].x));
      if (Math.hypot(cx - pt[0], cy - pt[1]) < hitRadius) return i;
    }
    return -1;
  }

  function screenToCanvas(sx, sy) {
    let mx = sx, my = sy;
    if (state.zoomLevel > 1.001) {
      const vpCx = W / 2, vpCy = H / 2;
      mx = (sx - vpCx) / state.zoomLevel + state.zoomCenterX;
      my = (sy - vpCy) / state.zoomLevel + state.zoomCenterY;
    }
    return [mx, my];
  }

  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const pt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    const idx = getHoveredDot(pt[0], pt[1]);
    if (idx !== state.hoveredIndex) {
      state.hoveredIndex = idx;
      canvas.style.cursor = idx >= 0 ? 'pointer' : 'default';
      render();
    }
  }

  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const pt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    const idx = getHoveredDot(pt[0], pt[1]);
    if (idx >= 0 && idx !== state.activeIndex) {
      scrollToProjectIndex(idx);
    }
  }

  // ----- 2j. Initialization -----

  function init() {
    readColors();
    renderOverviewCards();
    resize();

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => {
      state.hoveredIndex = -1;
      canvas.style.cursor = 'default';
      render();
    });
    canvas.addEventListener('click', handleClick);
    if (overviewGrid) {
      overviewGrid.addEventListener('click', handleOverviewClick);
    }

    // Scroll listener (RAF-throttled)
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        onScroll();
      }, 100);
    });

    onScroll();
  }

  document.fonts ? document.fonts.ready.then(init) : init();
})();
