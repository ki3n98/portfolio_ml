// main.js — entry point. Every feature lives in its own module; this file only wires
// them up. Init order matches the original single-file order: several features add
// document-level Escape/click listeners and their registration order matters.
// Feature -> file map: see AGENTS.md.

import { initBootScreen } from './boot-screen.js';
import { initStartMenu } from './desktop/start-menu.js';
import { initWindowManager } from './desktop/window-manager.js';
import { initWindowDrag } from './desktop/window-drag.js';
import { initWindowResize } from './desktop/window-resize.js';
import { initTrayClock } from './desktop/tray-clock.js';
import { initContactForm } from './apps/contact-form.js';
import { initNotepad } from './apps/notepad.js';
import { initExplorer } from './apps/explorer/index.js';
import { initCalculator } from './apps/calculator.js';
import { initPaint } from './apps/paint/index.js';
import { isMobile } from './utils.js';
import { isTopWindow, closeWindow, toggleMaximize, toggleOrFocusWindow } from './desktop/window-manager.js';

initBootScreen();
initStartMenu();
initWindowManager();
initWindowDrag();
initWindowResize();
initTrayClock();
initContactForm();
initNotepad();
initExplorer();
initCalculator();
initPaint();
// ===========================
// 1b. Shared portfolio data (used by the Explorer hub and the GD viz)
// ===========================
// Project schema is documented in section 2a below.
const PORTFOLIO_PROJECTS = [
  {
    x: -1.9,
    title: 'Shape & Sign',
    desc: 'Gesture-controlled mini-games that teach kids ASL vocabulary and phrases from a webcam. A two-stage recognizer routes live MediaPipe hand frames into 5 modes, then stacked LSTMs read ASL sequences, sustaining ~93% live accuracy through judging.',
    role: 'Team of 4 · I built the Random Forest mode router (5-frame debounce) and the Python backend',
    award: 'BeachHacks 8.0 (2025) • Best Overall',
    tags: ['MediaPipe', 'Random Forest', 'LSTM', 'TensorFlow.js', 'Next.js'],
    link: 'https://shape-sign-mu.vercel.app/',
    ctaLabel: 'Live Demo →',
    secondaryLink: 'https://github.com/ki3n98/shape-sign',
    secondaryLabel: 'Source Code',
    tertiaryLink: 'https://devpost.com/software/shape-sign',
    tertiaryLabel: 'Devpost',
    step: 'Step 1 - High Loss',
    mediaType: 'Video',
    mediaSrc: 'assets/videos/shape_sign_demo.mp4',
    mediaText: 'Shape & Sign demo',
  },
  {
    x: -1.4,
    title: '911 Operator Assistance',
    desc: 'A 911 dispatcher co-pilot: an incoming call is transcribed with faster-whisper, Gemini extracts the address and incident type under a strict output contract, and a geocoded pin lands on a live dashboard, where a human confirms before anyone is dispatched.',
    role: 'Team of 3 · I built the transcription → LLM → geocoding pipeline and most of the dispatcher dashboard',
    award: 'Marina Hacks 5.0 (2025) • Best Overall',
    tags: ['faster-whisper', 'Gemini 2.5 Flash', 'FastAPI', 'Twilio Voice', 'Google Maps API', 'Next.js'],
    link: 'https://github.com/Ben2104/911-Operator-Assistant',
    ctaLabel: 'Source Code →',
    secondaryLink: 'https://devpost.com/software/911-operator-assistant',
    secondaryLabel: 'Devpost',
    step: 'Step 2 - Descending',
    mediaType: 'Video',
    mediaEmbed: 'https://www.youtube-nocookie.com/embed/okCDJyBionU?start=40&autoplay=1&mute=1&playsinline=1&rel=0',
    mediaText: '911 Operator demo video',
  },
  {
    x: -0.9,
    title: 'VeriFace',
    desc: 'End-to-end face-recognition attendance for classrooms and events: MTCNN detection → FaceNet (InceptionResNetV1) 512-dim embeddings, cosine-matched against each event roster and served through FastAPI + PostgreSQL. Also a live WebSocket check-in dashboard, a self-trained EfficientNet-B0 anti-spoofing model, JWT/bcrypt auth with a 5-role RBAC engine and audit logging (I wrote the permission module), 160+ pytest tests, and a reproducible Docker/CUDA stack.',
    role: 'Team of 6 · Repo founder, backend lead, and top contributor (84 of 182 commits)',
    award: 'CECS Senior Design Award — Outstanding Achievement in Applied AI & ML',
    tags: ['MTCNN', 'FaceNet', 'PyTorch', 'EfficientNet-B0', 'FastAPI', 'PostgreSQL', 'WebSockets', 'Docker', 'JWT / RBAC', '160+ pytest tests'],
    link: 'https://github.com/ki3n98/VeriFace',
    ctaLabel: 'Source Code →',
    step: 'Step 3 - Converging',
    mediaType: 'Video',
    mediaSrc: 'assets/videos/veriface_demo.mp4',
    mediaText: 'VeriFace demo',
  },
  {
    x: -0.4,
    title: 'DocGenix',
    desc: 'Describe an app idea, get a full software blueprint. 8 specialist LangGraph agents write requirements, architecture, API, and data-model docs in parallel; a Critic agent checks them against each other and triggers up to 2 revision rounds.',
    role: 'Team of 4 · I wrote the multi-agent orchestration, the Critic agent, and the structured-output extraction',
    award: 'BeachHacks 9.0 (2026)',
    tags: ['LangGraph', 'Multi-agent', 'LangChain', 'FastAPI', 'SSE streaming', 'Next.js'],
    link: 'https://github.com/zokoxa/DocGenix',
    ctaLabel: 'Source Code →',
    secondaryLink: 'https://devpost.com/software/docsgenix',
    secondaryLabel: 'Devpost',
    step: 'Step 4 - Local Optimum',
    mediaType: 'Video',
    mediaEmbed: 'https://www.youtube-nocookie.com/embed/SqQycaZNr4Q?start=115&autoplay=1&mute=1&playsinline=1&rel=0',
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

/**
 * Experience entries. `bullets` may contain <b> markup (trusted, authored here).
 * @type {{org:string, role:string, dates:string, icon:string, context?:string,
 *         bullets:string[], tags:string[], links?:[string,string][]}[]}
 */
const PORTFOLIO_EXPERIENCE = [
  {
    org: 'Thomson Reuters Special Services',
    role: 'Data Science Intern',
    dates: 'May 2026 — Aug 2026',
    icon: '../assets/icons/briefcase.png',
    context: 'Spotlight (Canary × TRSS) surfaces suspected trafficking victims to law enforcement from ~150K ads/day and has helped identify 28,459 children since 2016. Its juvenile flag relied on images alone; I explored and benchmarked text models to add a second signal.',
    bullets: [
      'Built and benchmarked <b>86 text-classification models</b> (11 embedding methods × up to 10 classifiers, plus a zero-shot LLM baseline) to flag suspected juvenile victims in escort ads.',
      'Detected juvenile victims of sex trafficking in escort ads using an embedding → classifier pipeline (OpenAI text-embedding-3-large + Logistic Regression), lifting recall from <b>0.620</b> to <b>0.795</b> and F1 from <b>0.50</b> to <b>0.64</b> at unchanged precision.',
      'Combined the text model\'s output with the existing image classifier, catching <b>23%</b> more true juvenile victims than the image classifier alone — roughly 350 additional confirmed cases per 6,000 ads reviewed.',
      'Stress-tested models on held-out 2024 ads: the 2025 leaders\' recall collapsed (e.g. <b>0.612 → 0.313</b>) while OpenAI embeddings + Logistic Regression held steady (<b>0.750 → 0.744</b>), so I recommended the model that generalizes, not the leaderboard winner.',
      'Measured concept drift (words shifting in juvenile signal year over year) and showed it tracks F1 decline across models, proposing drift monitoring as an early-warning retraining trigger.',
      'Made predictions auditable for law enforcement using SHAP and TF-IDF + LR coefficients trained on 2024-only, 2025-only, and pooled data, surfacing durable linguistic signals that held across years.',
      'Presented project findings and results to stakeholders company-wide, explaining technical modeling work to non-technical audiences and translating it into a shipping recommendation for text as a second detection signal.',
    ],
    tags: ['Embedding → Classifier', 'OpenAI Embeddings', 'Logistic Regression', 'Zero-shot LLM', 'TF-IDF', 'SHAP', 'Concept Drift'],
  },
  {
    org: 'Vision-Based Distracted Driving Detection',
    role: 'Undergraduate Researcher · Co-author with Dr. Amir Ghasemkhani',
    dates: 'Aug 2025 — Feb 2026',
    icon: '../assets/icons/sys-info.png',
    context: 'Paper published and presented at the 6th Annual Computer Science Conference for CSU Undergraduates (Feb 2026).',
    bullets: [
      'Benchmarked Faster R-CNN, SSD, and YOLOv11 for real-time in-cabin driver distraction (phone, eating, drinking, smoking) on the Roboflow Mobile Detection dataset under one fixed protocol; YOLOv11 won on both axes with <b>mAP@.50:.95 = 0.604</b> at <b>86.1 FPS</b> on a consumer RTX 3080, using half the parameters.',
      'Overturned the "two-stage is more accurate" assumption: Faster R-CNN scored lowest (<b>0.443</b> mAP) and ran <b>16× slower</b> (5.24 FPS), showing architecture choices must be benchmarked on the target data.',
      'Balanced an imbalanced training set (978–1,817 images per class) with class oversampling, keeping validation and test splits realistic.',
      'Conducted quantitative performance analysis across model architectures, producing deployment guidance for real-time, latency-sensitive object detection applications.',
    ],
    tags: ['YOLOv11', 'Faster R-CNN', 'SSD', 'PyTorch', 'Roboflow'],
    links: [
      ['assets/resume/Distracted_Driving_Detection___Kien-2.pdf', 'Read Paper (PDF)'],
      ['https://github.com/ki3n98/Amir_research', 'Source Code'],
    ],
  },
];

// Experience window renders from the same data as the hub.
(function renderExperienceWindow() {
  const list = document.getElementById('experience-list');
  if (!list) return;
  const escHtml = (str) => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  list.innerHTML = PORTFOLIO_EXPERIENCE.map(e => `
    <article class="experience-card fade-in">
      <div class="experience-card__header">
        <div>
          <h3 class="experience-card__title">${escHtml(e.org)}</h3>
          <p class="experience-card__role">${escHtml(e.role)}</p>
        </div>
        <span class="experience-card__date">${escHtml(e.dates)}</span>
      </div>
      ${e.context ? `<p class="experience-card__context">${escHtml(e.context)}</p>` : ''}
      <ul class="experience-card__list">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
      <div class="experience-card__tags">${e.tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
      ${e.links ? `<div class="experience-card__links">${e.links.map(([url, label]) =>
        `<a href="${escHtml(url)}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escHtml(label)}</a>`).join('')}</div>` : ''}
    </article>`).join('');
})();

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
   * @property {string}   [tertiaryLink]
   * @property {string}   [tertiaryLabel]
   * @property {string}   step            - Label like "Step 1 - High Loss"
   * @property {string}   [mediaType]     - "Video" | "Image"
   * @property {string}   [mediaSrc]      - Local video/image path
   * @property {string}   [mediaEmbed]    - YouTube embed URL
   * @property {string}   [mediaText]     - Alt text / caption
   * @property {boolean}  [includeInOverview] - Defaults to true
   * @property {boolean}  [hideMedia]
   */
  const PROJECTS = PORTFOLIO_PROJECTS;

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
  const scrollRoot = document.getElementById('window-projects-body');
  const introPanel = document.querySelector('.gd-intro');
  const infoPanel = document.getElementById('gd-info');
  const infoStep = document.getElementById('gd-info-step');
  const infoTitle = document.getElementById('gd-info-title');
  const infoAward = document.getElementById('gd-info-award');
  const infoDesc = document.getElementById('gd-info-desc');
  const infoTags = document.getElementById('gd-info-tags');
  const infoLink = document.getElementById('gd-info-link');
  const infoSecondaryLink = document.getElementById('gd-info-secondary-link');
  const infoTertiaryLink = document.getElementById('gd-info-tertiary-link');
  const infoGradient = document.getElementById('gd-info-gradient');
  const infoMedia = document.getElementById('gd-info-media');
  const infoMediaVideo = document.getElementById('gd-info-media-video');
  const infoMediaImg = document.getElementById('gd-info-media-img');
  const infoMediaEmbed = document.getElementById('gd-info-media-embed');
  const infoMediaType = document.getElementById('gd-info-media-type');
  const infoMediaText = document.getElementById('gd-info-media-text');
  const overviewPanel = document.getElementById('gd-overview');
  const overviewGrid = document.getElementById('gd-overview-grid');
  const overviewCta = document.getElementById('gd-overview-cta');
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
      ctx.font = '400 ' + fontSize + 'px Tahoma, Verdana, sans-serif';
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
      ctx.font = '400 ' + fontSize + 'px Tahoma, Verdana, sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.globalAlpha = 0.3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(x, cx, padT + plotH + tickLen + 3);
      ctx.globalAlpha = 0.25;
    }

    ctx.restore();
  }

  // Deterministic pseudo-random wobble (seeded by index, not time) so hand-drawn
  // strokes stay stable across redraws instead of "buzzing" during scroll.
  function seededJitter(i, seed) {
    return Math.sin((i + seed) * 12.9898) * 43758.5453 % 1;
  }

  function drawParabola() {
    const steps = 100;
    const drawSteps = Math.floor(state.introProgress * steps);
    if (drawSteps < 2) return;

    // Multiple slightly-offset overlapping strokes fake a hand-sketched line.
    const passes = [
      { seed: 0, amp: 1.1, alpha: 0.55, width: 1.6 },
      { seed: 37, amp: 0.85, alpha: 0.35, width: 1.3 },
      { seed: 91, amp: 0.65, alpha: 0.25, width: 1.1 },
    ];

    ctx.save();
    passes.forEach(pass => {
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= drawSteps; i++) {
        const mx = xMin + (i / steps) * (xMax - xMin);
        const my = f(mx);
        if (my > yMax) { started = false; continue; }
        const pt = mathToCanvas(mx, my);
        const jy = seededJitter(i, pass.seed) * pass.amp;
        const jx = seededJitter(i, pass.seed + 500) * pass.amp * 0.5;
        if (!started) { ctx.moveTo(pt[0] + jx, pt[1] + jy); started = true; }
        else ctx.lineTo(pt[0] + jx, pt[1] + jy);
      }
      ctx.strokeStyle = colors.text;
      ctx.globalAlpha = pass.alpha;
      ctx.lineWidth = pass.width;
      ctx.stroke();
    });
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

    // Hand-drawn scribble ring circling the active dot (ink emphasis, no glow)
    if (isActive && scale >= 0.95) {
      const ringR = radius + 8;
      const ringSteps = 44;
      ctx.beginPath();
      for (let s = 0; s <= ringSteps; s++) {
        const ang = (s / ringSteps) * Math.PI * 2;
        const wob = seededJitter(s, i * 13) * 2;
        const rx = cx + Math.cos(ang) * (ringR + wob);
        const ry = cy + Math.sin(ang) * (ringR + wob);
        if (s === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
      }
      ctx.strokeStyle = colors.primary;
      ctx.globalAlpha = 0.6 * Math.min(1, dotT * 2);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = Math.min(1, dotT * 2);
    }

    // Main dot: flat ink fill (active dot in red-pen, others in ink-black)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? colors.primary : colors.text;
    ctx.fill();

    // Inner dot for active
    if (isActive && scale >= 0.95) {
      ctx.beginPath();
      ctx.arc(cx, cy, 4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = colors.bg;
      ctx.fill();
    }

    // Step label (fade in with dot)
    if (scale > 0.6) {
      const labelAlpha = (scale - 0.6) / 0.4;
      const fontSize = Math.max(12, Math.min(W, H) * 0.017);
      ctx.font = '400 ' + fontSize + 'px "Patrick Hand", cursive';
      ctx.fillStyle = isActive ? colors.text : colors.muted;
      ctx.textAlign = 'left';
      ctx.globalAlpha = (isActive ? 0.95 : 0.6) * labelAlpha;
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
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = colors.medium;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawConnectors() {
    if (state.dotReveal < 1.5) return;
    const count = Math.floor(state.dotReveal);

    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = colors.medium;
    ctx.globalAlpha = 0.35;
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
    const trailAlpha = 0.3 * Math.min(1, (state.tangentProgress - 0.3) / 0.4);

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
    ctx.strokeStyle = colors.medium;
    ctx.globalAlpha = trailAlpha;
    ctx.lineWidth = 3;
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
    ctx.font = 'italic 400 ' + fontSize + 'px Tahoma, Verdana, sans-serif';
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
    const scrollRootRect = scrollRoot.getBoundingClientRect();
    const rect = section.getBoundingClientRect();
    const sectionTop = scrollRoot.scrollTop + (rect.top - scrollRootRect.top);
    const scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;

    const phaseNudge = idx === 0 ? 0.08 : 0;
    const targetProgress = (idx + 1 + phaseNudge) / TOTAL_STEPS;
    const targetTop = sectionTop + scrollable * targetProgress;
    scrollRoot.scrollTo({ top: targetTop, behavior: 'smooth' });
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
    if (overviewCta) {
      overviewCta.classList.toggle('active', isVisible);
      overviewCta.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
    }
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

    infoTertiaryLink.hidden = !proj.tertiaryLink;
    infoTertiaryLink.classList.toggle('is-hidden', !proj.tertiaryLink);
    if (proj.tertiaryLink) {
      infoTertiaryLink.href = proj.tertiaryLink;
      infoTertiaryLink.textContent = proj.tertiaryLabel || 'Learn More';
      const isExternalTertiary = /^https?:\/\//i.test(proj.tertiaryLink);
      infoTertiaryLink.target = isExternalTertiary ? '_blank' : '';
      infoTertiaryLink.rel = isExternalTertiary ? 'noopener noreferrer' : '';
    } else {
      infoTertiaryLink.removeAttribute('href');
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

    // Scroll listener (RAF-throttled) — the Projects window's own scroll
    // container is the scroll root now, not the document.
    let ticking = false;
    scrollRoot.addEventListener('scroll', () => {
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

    // Exposed so the window manager can re-measure the canvas (it has zero
    // size while the Projects window is hidden/closed) when it's opened.
    window.__gdRefresh = () => {
      resize();
      onScroll();
    };
  }

  document.fonts ? document.fonts.ready.then(init) : init();
})();

// ===========================
// 3. Portfolio Hub ("C:\Kien Pham" Explorer window)
// ===========================
// The recruiter-facing landing view: bio, experience, projects and skills
// all visible at once, with every external link reachable in one click.
(function () {
  const hubWin = document.getElementById('window-portfolio');
  if (!hubWin) return;

  const RESUME_PDF = 'assets/resume/Kien_Pham_resume.pdf';
  const GITHUB = 'https://github.com/ki3n98';
  const LINKEDIN = 'https://www.linkedin.com/in/kien-t-pham/';

  const EXPERIENCE = PORTFOLIO_EXPERIENCE;

  // [label, icon] — icon is an assets/icons/*.svg basename, or null for text-only chips.
  const SKILL_GROUPS = [
    { name: 'Machine Learning', skills: [['PyTorch', 'pytorch'], ['TensorFlow', 'tensorflow'], ['scikit-learn', null], ['Deep Learning', 'deep-learning'], ['SHAP', null], ['Model Fine-tuning', null], ['Concept Drift', null], ['Matplotlib', null]] },
    { name: 'NLP & LLMs', skills: [['NLP', 'nlp'], ['Embeddings', null], ['LangChain', 'langchain'], ['LangGraph Agents', null], ['Gemini / OpenAI APIs', null], ['Whisper (STT)', null], ['Prompt Engineering', null], ['Multi-agent Orchestration', null]] },
    { name: 'Computer Vision', skills: [['Computer Vision', 'computer-vision'], ['YOLOv11', null], ['Faster R-CNN / SSD', null], ['FaceNet', null], ['MediaPipe', null], ['OpenCV', null]] },
    { name: 'Backend & Data', skills: [['Python', 'python'], ['FastAPI', 'fastapi'], ['REST API', 'rest-api'], ['WebSockets', null], ['PostgreSQL', 'postgresql'], ['SQLAlchemy', null], ['Django', null], ['Data Labeling & Evaluation', null]] },
    { name: 'Web & DevOps', skills: [['Next.js', 'nextjs'], ['JavaScript', 'javascript'], ['HTML', 'html'], ['CSS', 'css'], ['Docker', 'docker'], ['AWS', 'aws'], ['Git / GitHub', null]] },
  ];

  const projects = PORTFOLIO_PROJECTS.filter(p => p.includeInOverview !== false);
  const isWin = (p) => /best|award/i.test(p.award || '');
  const awardHtml = (p, tag) => p.award
    ? `<${tag} class="hub__award${isWin(p) ? ' hub__award--win' : ''}">${isWin(p) ? '🏆 ' : ''}${esc(p.award)}</${tag}>`
    : '';

  const esc = (str) => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isExternal = (url) => /^https?:/.test(url);
  const youtubeId = (url) => (url && url.match(/embed\/([\w-]+)/) || [])[1];

  function projectLinks(p) {
    return [
      [p.link, (p.ctaLabel || 'View Project →').replace(/\s*→$/, '')],
      [p.secondaryLink, p.secondaryLabel],
      [p.tertiaryLink, p.tertiaryLabel],
    ].filter(([url]) => url);
  }

  function linkHtml([url, label], cls) {
    const ext = isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a class="${cls}" href="${esc(url)}"${ext}>${esc(label)}</a>`;
  }

  function thumbHtml(p) {
    if (p.mediaSrc && p.mediaType === 'Video') {
      return `<video class="hub__thumb-media" src="${esc(p.mediaSrc)}#t=1" muted loop playsinline preload="metadata" data-hover-play></video>`;
    }
    const yt = youtubeId(p.mediaEmbed);
    if (yt) return `<img class="hub__thumb-media" src="https://img.youtube.com/vi/${yt}/hqdefault.jpg" alt="" loading="lazy" />`;
    if (p.mediaSrc) return `<img class="hub__thumb-media" src="${esc(p.mediaSrc)}" alt="" loading="lazy" />`;
    return '';
  }

  // ----- Sidebar (reuses the file explorer's task-pane styles) -----
  function sidebarSection(title, body) {
    return `<div class="explorer__sidebar-section">
      <button type="button" class="explorer__sidebar-header"><span>${title}</span>
        <span class="explorer__sidebar-chevron" aria-hidden="true">&#9650;</span></button>
      <div class="explorer__sidebar-list">${body}</div>
    </div>`;
  }
  const sideLink = (label, icon, attrs) =>
    `<a class="explorer__sidebar-link" ${attrs}><span class="explorer__sidebar-link-icon" style="--icon-url: url('${icon}')" aria-hidden="true"></span>${label}</a>`;
  const sideBtn = (label, icon, windowId) =>
    `<button type="button" class="explorer__sidebar-link" data-hub-open="${windowId}"><span class="explorer__sidebar-link-icon" style="--icon-url: url('${icon}')" aria-hidden="true"></span>${label}</button>`;

  // Awards not tied to a project tile (AIS Datathon 2026 — Best Project)
  const OTHER_AWARDS = 1;
  const awards = projects.filter(isWin).length + OTHER_AWARDS;
  const sidebar = document.getElementById('hub-sidebar');
  sidebar.innerHTML =
    sidebarSection('Quick Links',
      sideBtn('View Resume.pdf', '../assets/icons/resume-pdf.png', 'resume') +
      sideLink('Download Resume', '../assets/icons/my-documents.png', `href="${RESUME_PDF}" download`) +
      sideLink('GitHub', '../assets/icons/publish-web.png', `href="${GITHUB}" target="_blank" rel="noopener noreferrer"`) +
      sideLink('LinkedIn', '../assets/icons/address-book.png', `href="${LINKEDIN}" target="_blank" rel="noopener noreferrer"`) +
      sideBtn('Contact Me', '../assets/icons/email.png', 'contact')) +
    sidebarSection('Other Places',
      sideBtn('Gradient Descent.exe', '../assets/icons/slideshow.png', 'projects') +
      sideBtn('About Me', '../assets/icons/my-computer.png', 'hero') +
      sideBtn('My Documents', '../assets/icons/my-documents.png', 'my-documents') +
      sideBtn('Paint', '../assets/icons/paint.png', 'paint')) +
    sidebarSection('Details',
      `<div class="explorer__sidebar-details">
        <span class="explorer__sidebar-details-icon" style="--icon-url: url('../assets/icons/local-disk.png')" aria-hidden="true"></span>
        <span class="explorer__sidebar-details-text">
          <span class="explorer__sidebar-details-title">Kien Pham</span>
          <span class="explorer__sidebar-details-desc">Data Scientist<br>${EXPERIENCE.length} positions &middot; ${projects.length} projects<br>${awards} awards won</span>
        </span>
      </div>`);

  // Mobile-only quick link row (sidebar is hidden on small screens)
  document.getElementById('hub-quick').innerHTML =
    `<button type="button" class="hub__quick-btn" data-hub-open="resume">Resume</button>` +
    `<a class="hub__quick-btn" href="${GITHUB}" target="_blank" rel="noopener noreferrer">GitHub</a>` +
    `<a class="hub__quick-btn" href="${LINKEDIN}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` +
    `<button type="button" class="hub__quick-btn" data-hub-open="contact">Contact</button>`;

  // ----- Highlights strip (at-a-glance proof points) -----
  const HIGHLIGHTS = [
    ['🏆', `${awards} awards`, '2 hackathon Best Overall · AIS Datathon 2026 Best Project · Senior Design'],
    ['📄', '1 published paper', 'CSU CS Conference, 2026'],
  ];
  document.getElementById('hub-highlights').innerHTML = HIGHLIGHTS.map(([icon, big, small]) =>
    `<div class="hub__highlight"><span class="hub__highlight-icon" aria-hidden="true">${icon}</span>`
    + `<span><span class="hub__highlight-big">${esc(big)}</span><span class="hub__highlight-small">${esc(small)}</span></span></div>`).join('');

  // ----- Experience -----
  document.getElementById('hub-exp-heading').textContent = `Experience (${EXPERIENCE.length})`;
  document.getElementById('hub-exp').innerHTML = EXPERIENCE.map(e => {
    return `<article class="hub__exp-tile">
      <span class="hub__exp-icon" style="--icon-url: url('${e.icon}')" aria-hidden="true"></span>
      <div class="hub__exp-main">
        <div class="hub__exp-head">
          <h3 class="hub__exp-org">${esc(e.org)}</h3>
          <span class="hub__exp-dates">${esc(e.dates)}</span>
        </div>
        <p class="hub__exp-role">${esc(e.role)}</p>
        ${e.context ? `<p class="hub__exp-context">${esc(e.context)}</p>` : ''}
        <ul class="hub__exp-list-items">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        <div class="hub__tags">${e.tags.map(t => `<span class="hub__tag">${esc(t)}</span>`).join('')}</div>
        ${e.links ? `<div class="hub__proj-links">${e.links.map(l => linkHtml(l, 'hub__link')).join('')}</div>` : ''}
      </div>
    </article>`;
  }).join('');

  // ----- Projects -----
  document.getElementById('hub-proj-heading').textContent = `Projects (${projects.length})`;
  const projGrid = document.getElementById('hub-proj');
  projGrid.innerHTML = projects.map((p, i) => `
    <article class="hub__proj-tile" data-proj="${i}">
      <button type="button" class="hub__proj-open" data-proj-open="${i}" aria-label="Open details for ${esc(p.title)}">
        <span class="hub__thumb">${thumbHtml(p)}<span class="hub__thumb-play" aria-hidden="true">&#9654;</span></span>
        <span class="hub__proj-title">${esc(p.title)}</span>
      </button>
      ${awardHtml(p, 'span')}
      ${p.role ? `<p class="hub__proj-role">${esc(p.role)}</p>` : ''}
      <p class="hub__proj-desc">${esc(p.desc)}</p>
      <div class="hub__tags">${p.tags.map(t => `<span class="hub__tag">${esc(t)}</span>`).join('')}</div>
      <div class="hub__proj-links">${projectLinks(p).map(l => linkHtml(l, 'hub__link')).join('')}</div>
    </article>`).join('');

  // Hover-to-play local demo videos
  projGrid.querySelectorAll('.hub__proj-tile').forEach(tile => {
    const vid = tile.querySelector('video[data-hover-play]');
    if (!vid) return;
    tile.addEventListener('mouseenter', () => { vid.play().catch(() => {}); });
    tile.addEventListener('mouseleave', () => { vid.pause(); });
  });

  // ----- Skills -----
  document.getElementById('hub-skills').innerHTML = SKILL_GROUPS.map(g => `
    <div class="hub__skill-group">
      <span class="hub__skill-group-name">${g.name}</span>
      <div class="hub__skill-list">${g.skills.map(([label, icon]) => {
        const iconHtml = icon
          ? `<span class="skill__icon${icon === 'postgresql' ? ' skill__icon--postgres' : ''}" style="--icon-url: url('../assets/icons/${icon}.svg')"></span>`
          : '';
        return `<span class="skill">${iconHtml}${esc(label)}</span>`;
      }).join('')}</div>
    </div>`).join('');

  document.getElementById('hub-status').textContent =
    `${EXPERIENCE.length} positions, ${projects.length} projects · Click a project for details and demo video`;

  // ----- Project detail ("Properties") panel -----
  const detail = document.getElementById('hub-detail');
  let lastOpener = null;

  function openDetail(i) {
    const p = projects[i];
    if (!p) return;
    const yt = p.mediaEmbed;
    const media = yt
      ? `<iframe class="hub__detail-media" src="${esc(yt)}" title="${esc(p.mediaText || p.title)}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
      : p.mediaSrc && p.mediaType === 'Video'
        ? `<video class="hub__detail-media" src="${esc(p.mediaSrc)}" controls autoplay muted loop playsinline></video>`
        : p.mediaSrc ? `<img class="hub__detail-media" src="${esc(p.mediaSrc)}" alt="${esc(p.mediaText || '')}" />` : '';
    detail.innerHTML = `
      <div class="hub__detail-titlebar">
        <span id="hub-detail-title">${esc(p.title)} Properties</span>
        <button type="button" class="window__btn window__btn--close hub__detail-close" aria-label="Close details"></button>
      </div>
      <div class="hub__detail-body">
        ${media}
        <h3 class="hub__detail-name">${esc(p.title)}</h3>
        ${awardHtml(p, 'p')}
        ${p.role ? `<p class="hub__proj-role">${esc(p.role)}</p>` : ''}
        <p class="hub__detail-desc">${esc(p.desc)}</p>
        <div class="hub__tags">${p.tags.map(t => `<span class="hub__tag">${esc(t)}</span>`).join('')}</div>
        <div class="hub__detail-actions">${projectLinks(p).map((l, j) => linkHtml(l, j === 0 ? 'hub__btn hub__btn--primary' : 'hub__btn')).join('')}</div>
      </div>`;
    detail.hidden = false;
    projGrid.querySelectorAll('.hub__proj-tile').forEach(t => t.classList.toggle('hub__proj-tile--selected', t.dataset.proj === String(i)));
    detail.querySelector('.hub__detail-close').focus();
  }

  function closeDetail() {
    if (detail.hidden) return;
    detail.hidden = true;
    detail.innerHTML = ''; // stops any playing video/iframe
    projGrid.querySelectorAll('.hub__proj-tile--selected').forEach(t => t.classList.remove('hub__proj-tile--selected'));
    lastOpener?.focus();
  }

  hubWin.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-proj-open]');
    if (opener) { lastOpener = opener; openDetail(Number(opener.dataset.projOpen)); return; }
    if (e.target.closest('.hub__detail-close')) { closeDetail(); return; }
    const winLink = e.target.closest('[data-hub-open]');
    if (winLink) { e.preventDefault(); toggleOrFocusWindow(winLink.dataset.hubOpen); return; }
    const header = e.target.closest('.explorer__sidebar-header');
    if (header) header.closest('.explorer__sidebar-section').classList.toggle('explorer__sidebar-section--collapsed');
  });

  // ----- Menu bar (File / Edit / View / Favorites / Tools / Help) -----
  const menubar = document.getElementById('hub-menubar');
  const statusEl = document.getElementById('hub-status');
  const EMAIL = 'ki3n98@gmail.com';
  const defaultStatus = statusEl ? statusEl.innerHTML : '';
  let statusTimer = null;
  const flashStatus = (msg) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { statusEl.innerHTML = defaultStatus; }, 3000);
  };
  const copyText = (text, what) => {
    // Synchronous copy works inside the click gesture everywhere; async API is the fallback.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    if (ok) { flashStatus(`${what} copied to clipboard: ${text}`); return; }
    flashStatus(`${what}: ${text}`); // visible even if the async copy never settles
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => flashStatus(`${what} copied to clipboard: ${text}`),
        () => flashStatus(`${what}: ${text}`));
    } else flashStatus(`${what}: ${text}`);
  };
  const openExternal = (url) => window.open(url, '_blank', 'noopener,noreferrer');
  const hubContent = document.getElementById('hub-content');
  const scrollToGroup = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top - hubContent.getBoundingClientRect().top + hubContent.scrollTop - 12;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    hubContent.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  };

  // Favorites = every external project link, grouped by project
  const favorites = projects.flatMap(p => projectLinks(p)
    .filter(([href]) => /^https?:/.test(href))
    .map(([href, label]) => [`${p.title} — ${label.replace(/\s*→$/, '')}`, href]));

  // [label, action] items; null = divider. Actions: open:<window>, url:<href>, or a named action.
  const MENUS = {
    File: [
      ['View Resume', 'open:resume'],
      ['Download Resume', 'download-resume'],
      null,
      ['Close', 'close'],
    ],
    Edit: [
      ['Copy Email Address', 'copy-email'],
      ['Copy Link to Portfolio', 'copy-link'],
    ],
    View: [
      ['Experience', 'goto:hub-exp-heading'],
      ['Projects', 'goto:hub-proj-heading'],
      ['Skills', 'goto:hub-skills-heading'],
      null,
      ['Task Pane', 'toggle-sidebar', 'checkable'],
      ['Status Bar', 'toggle-status', 'checkable'],
    ],
    Favorites: [
      ['GitHub', `url:${GITHUB}`],
      ['LinkedIn', `url:${LINKEDIN}`],
      null,
      ...favorites.map(([label, href]) => [label, `url:${href}`]),
    ],
    Tools: [
      ['Gradient Descent.exe', 'open:projects'],
      ['Paint', 'open:paint'],
      ['Notepad', 'open:notepad'],
      ['Calculator', 'open:calculator'],
      ['My Documents', 'open:my-documents'],
    ],
    Help: [
      ['About Kien Pham', 'open:hero'],
      ['Experience Window', 'open:experience'],
      null,
      ['Contact Me', 'open:contact'],
    ],
  };

  menubar.innerHTML = Object.entries(MENUS).map(([name, items]) => `
    <div class="notepad__menu">
      <button type="button" class="notepad__menu-item" data-hub-menu="${name}" aria-haspopup="true" aria-expanded="false">${name}</button>
      <div class="notepad__menu-dropdown" data-hub-dropdown="${name}" role="menu">
        ${items.map(it => it
          ? `<button type="button" role="menuitem" class="notepad__menu-option${it[2] ? ' notepad__menu-option--checked' : ''}" data-hub-action="${esc(it[1])}">${esc(it[0])}</button>`
          : '<div class="notepad__menu-divider"></div>').join('')}
      </div>
    </div>`).join('');

  let openMenu = null;
  const closeMenus = () => {
    menubar.querySelectorAll('.notepad__menu-dropdown.open').forEach(d => d.classList.remove('open'));
    menubar.querySelectorAll('[data-hub-menu]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    openMenu = null;
  };
  const openMenuFor = (name) => {
    closeMenus();
    menubar.querySelector(`[data-hub-dropdown="${name}"]`).classList.add('open');
    menubar.querySelector(`[data-hub-menu="${name}"]`).setAttribute('aria-expanded', 'true');
    openMenu = name;
  };

  const runAction = (action, btn) => {
    const [kind, arg] = action.split(/:(.*)/s);
    switch (kind) {
      case 'open': toggleOrFocusWindow(arg); break;
      case 'url': openExternal(arg); break;
      case 'goto': scrollToGroup(arg); break;
      case 'download-resume': {
        const a = document.createElement('a');
        a.href = RESUME_PDF; a.download = '';
        document.body.appendChild(a); a.click(); a.remove();
        break;
      }
      case 'close': closeWindow('portfolio'); break;
      case 'copy-email': copyText(EMAIL, 'Email address'); break;
      case 'copy-link': copyText(location.href.split('#')[0], 'Portfolio link'); break;
      case 'toggle-sidebar':
        btn.classList.toggle('notepad__menu-option--checked',
          !hubWin.querySelector('.hub').classList.toggle('hub--no-sidebar'));
        break;
      case 'toggle-status':
        btn.classList.toggle('notepad__menu-option--checked',
          !hubWin.querySelector('.hub').classList.toggle('hub--no-status'));
        break;
    }
  };

  menubar.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = e.target.closest('[data-hub-menu]');
    if (item) {
      const name = item.dataset.hubMenu;
      if (openMenu === name) closeMenus(); else openMenuFor(name);
      return;
    }
    const opt = e.target.closest('[data-hub-action]');
    if (opt) { closeMenus(); runAction(opt.dataset.hubAction, opt); }
  });
  menubar.addEventListener('mouseover', (e) => {
    const item = e.target.closest('[data-hub-menu]');
    if (item && openMenu && openMenu !== item.dataset.hubMenu) openMenuFor(item.dataset.hubMenu);
  });
  document.addEventListener('click', (e) => {
    if (openMenu && !menubar.contains(e.target)) closeMenus();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !openMenu) return;
    e.stopImmediatePropagation(); // Esc closes the menu, not the window
    closeMenus();
  }, true);

  // Esc closes the detail panel first instead of the whole window.
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || detail.hidden || hubWin.hidden || !isTopWindow('portfolio')) return;
    e.stopImmediatePropagation();
    closeDetail();
  }, true);

  // Stop all media when the window is minimized or closed.
  new MutationObserver(() => {
    if (!hubWin.hidden) return;
    hubWin.querySelectorAll('video').forEach(v => v.pause());
    closeDetail();
  }).observe(hubWin, { attributes: true, attributeFilter: ['hidden'] });

  // Land maximized on desktop so everything is visible immediately.
  if (!isMobile() && !hubWin.hidden && !hubWin.classList.contains('window--maximized')) {
    toggleMaximize('portfolio');
  }
})();
