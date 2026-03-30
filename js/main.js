// ===========================
// Smooth Scroll for Nav Links
// ===========================
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

// ===========================
// Mobile Menu Toggle
// ===========================
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// ===========================
// Active Nav Link on Scroll
// ===========================
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

// ===========================
// Scroll-Triggered Fade-In
// ===========================
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
// Gradient Descent Visualization
// ===========================
(function () {
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
      tags: ['Pytorch', 'WhisperSTT', 'Google Geocoding API', 'Gemini', 'Next.js', 'FastAPI', ],
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
      tags: [ 'FaceNet', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Docker', 'JWT', 'bcrypt', 'ngrok', 'websockets' ],
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
      title: 'Applied ML / AI Engineer',
      desc: 'I build real-time computer vision and AI systems with a focus on performance, product thinking, and production-ready deployment.',
      tags: ['Applied ML', 'AI Engineer', 'Computer Vision', 'Full-Stack AI'],
      includeInOverview: false,
      hideMedia: true,
      link: '#contact',
      ctaLabel: 'Get In Touch →',
      secondaryLink: 'assets/resume/Kien_Pham_resume.pdf',
      secondaryLabel: 'Download Resume',
      step: 'Step 5 - Hire Me',
      mediaType: 'CTA',
      mediaText: 'Recruiter call-to-action placeholder',
    },
  ];

  const N = PROJECTS.length;

  // Math
  function f(x) { return x * x; }
  function fPrime(x) { return 2 * x; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  // State
  let activeIndex = -1;
  let hoveredIndex = -1;
  let tangentProgress = 0;
  let introProgress = 0;   // 0..1 how much of the parabola is drawn
  let dotReveal = 0;       // continuous float: 2.5 = dots 0,1 full, dot 2 at 50%
  let overviewProgress = 0;

  // Zoom / animation state (current = rendered, target = from scroll)
  let zoomLevel = 1;
  let zoomCenterX = 0;
  let zoomCenterY = 0;
  var ZOOM_AMOUNT = 2.2;

  // Lerp targets
  var targetZoom = 1;
  var targetCenterX = 0;
  var targetCenterY = 0;
  var targetTangent = 0;
  var targetIntroProgress = 0;
  var targetDotReveal = 0;
  var targetActiveIndex = -1;
  var targetOverviewProgress = 0;
  var fastProjectTransition = false;

  // Lerp speeds per property (lower = smoother)
  var LERP_ZOOM = 0.08;
  var LERP_PAN = 0.12;
  var LERP_TANGENT = 0.10;
  var LERP_INTRO = 0.10;
  var LERP_OVERVIEW = 0.1;

  // DOM
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
  const infoMediaEmbed = document.getElementById('gd-info-media-embed');
  const infoMediaType = document.getElementById('gd-info-media-type');
  const infoMediaText = document.getElementById('gd-info-media-text');
  const overviewPanel = document.getElementById('gd-overview');
  const overviewGrid = document.getElementById('gd-overview-grid');
  const scrollHint = document.getElementById('gd-scroll-hint');

  // Layout
  let W = 0, H = 0, dpr = 1;
  let padL, padR, padT, padB, plotW, plotH;
  const xMin = -2.2, xMax = 2.2, yMin = -0.2, yMax = 5;

  // Colors
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

  // Coordinate mapping
  function mathToCanvas(mx, my) {
    const cx = padL + ((mx - xMin) / (xMax - xMin)) * plotW;
    const cy = padT + plotH - ((my - yMin) / (yMax - yMin)) * plotH;
    return [cx, cy];
  }

  // Resize
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
    if (zoomCenterX === 0 && zoomCenterY === 0) {
      zoomCenterX = targetCenterX = W / 2;
      zoomCenterY = targetCenterY = H / 2;
    }

    render();
  }

  // --- Drawing ---

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.25;

    var tickLen = 6;
    var fontSize = Math.max(9, Math.min(W, H) * 0.012);
    var [axisX] = mathToCanvas(-2, 0);
    var [, axisY] = mathToCanvas(0, 0);

    // Horizontal lines + Y-axis ticks/labels
    for (var y = 0; y <= 4; y++) {
      var [, cy] = mathToCanvas(0, y);
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
    for (var x = -2; x <= 2; x++) {
      var [cx] = mathToCanvas(x, 0);
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
    var steps = 200;
    var drawSteps = Math.floor(introProgress * steps);
    if (drawSteps < 2) return;

    ctx.save();
    ctx.beginPath();
    var started = false;
    for (var i = 0; i <= drawSteps; i++) {
      var mx = xMin + (i / steps) * (xMax - xMin);
      var my = f(mx);
      if (my > yMax) { started = false; continue; }
      var pt = mathToCanvas(mx, my);
      if (!started) { ctx.moveTo(pt[0], pt[1]); started = true; }
      else ctx.lineTo(pt[0], pt[1]);
    }
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 16;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawDot(i) {
    // Per-dot reveal: how much this dot has appeared (0 = hidden, 1 = full)
    var dotT = Math.max(0, Math.min(1, dotReveal - i));
    if (dotT <= 0) return;

    // Overshoot ease for pop-in: goes to ~1.1 then settles to 1
    var scale = dotT < 1 ? easeOutBack(dotT) : 1;

    var proj = PROJECTS[i];
    var pt = mathToCanvas(proj.x, f(proj.x));
    var cx = pt[0], cy = pt[1];
    var isActive = i === activeIndex;
    var isHovered = i === hoveredIndex;
    var baseRadius = isActive ? 12 : isHovered ? 10 : 7;
    var radius = baseRadius * scale;

    ctx.save();
    ctx.globalAlpha = Math.min(1, dotT * 2); // fade in during first half

    // Pulsing glow ring for active
    if (isActive && scale >= 0.95) {
      var pulse = Math.sin(performance.now() * 0.003) * 0.5 + 0.5;
      var pulseRadius = radius + 6 + pulse * 4;
      var pulseAlpha = 0.12 + pulse * 0.1;
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
      ctx.shadowBlur = isActive ? 24 : 14;
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
      var labelAlpha = (scale - 0.6) / 0.4; // 0..1
      var fontSize = Math.max(11, Math.min(W, H) * 0.016);
      ctx.font = '500 ' + fontSize + 'px Inter, sans-serif';
      ctx.fillStyle = isActive ? colors.text : colors.muted;
      ctx.textAlign = 'left';
      ctx.globalAlpha = (isActive ? 0.9 : 0.5) * labelAlpha;
      ctx.fillText('Step ' + (i + 1), cx + radius + 10, cy + 4);
    }

    ctx.restore();
  }

  // Overshoot ease for dot pop-in
  function easeOutBack(t) {
    var c = 1.4; // overshoot amount
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  }

  function drawTangent(i) {
    if (tangentProgress <= 0 || i < 0) return;
    var proj = PROJECTS[i];
    var x0 = proj.x;
    var slope = fPrime(x0);
    var extent = 1.0 * tangentProgress;

    var xA = x0 - extent, xB = x0 + extent;
    var yA = slope * (xA - x0) + f(x0);
    var yB = slope * (xB - x0) + f(x0);
    var ptA = mathToCanvas(xA, yA), ptB = mathToCanvas(xB, yB);

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
    if (dotReveal < 1.5) return;
    var count = Math.floor(dotReveal);

    ctx.save();
    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = colors.medium;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;

    for (var i = 0; i < count - 1; i++) {
      var p1 = mathToCanvas(PROJECTS[i].x, f(PROJECTS[i].x));
      var p2 = mathToCanvas(PROJECTS[i + 1].x, f(PROJECTS[i + 1].x));
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Trail: glowing path along parabola from active dot toward the next
  function drawTrail() {
    if (activeIndex < 0 || activeIndex >= N - 1 || tangentProgress < 0.3 || dotReveal < activeIndex + 2) return;
    var fromX = PROJECTS[activeIndex].x;
    var toX = PROJECTS[activeIndex + 1].x;
    var trailAlpha = 0.2 * Math.min(1, (tangentProgress - 0.3) / 0.4);

    ctx.save();
    ctx.beginPath();
    var steps = 60;
    for (var i = 0; i <= steps; i++) {
      var mx = fromX + (i / steps) * (toX - fromX);
      var my = f(mx);
      var pt = mathToCanvas(mx, my);
      if (i === 0) ctx.moveTo(pt[0], pt[1]);
      else ctx.lineTo(pt[0], pt[1]);
    }
    ctx.strokeStyle = colors.primary;
    ctx.globalAlpha = trailAlpha;
    ctx.lineWidth = 4;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Arrow: small descent direction arrow at the active dot
  function drawArrow() {
    if (activeIndex < 0 || activeIndex >= N - 1 || tangentProgress < 0.5) return;
    var proj = PROJECTS[activeIndex];
    var x0 = proj.x;
    var arrowAlpha = 0.4 * Math.min(1, (tangentProgress - 0.5) * 3);

    // Arrow tip along the parabola, slightly ahead of the dot
    var dx = 0.15;
    var tipX = x0 + dx;
    var tipY = f(tipX);
    var baseX = x0 + dx * 0.4;
    var baseY = f(baseX);

    var tip = mathToCanvas(tipX, tipY);
    var base = mathToCanvas(baseX, baseY);

    // Direction vector
    var dirX = tip[0] - base[0];
    var dirY = tip[1] - base[1];
    var len = Math.hypot(dirX, dirY);
    if (len < 1) return;
    dirX /= len; dirY /= len;

    var arrowSize = 8;
    var perpX = -dirY * arrowSize;
    var perpY = dirX * arrowSize;

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

  // Equation label: L(θ) = θ²
  function drawEquationLabel() {
    if (introProgress < 0.5) return;
    var labelAlpha = Math.min(0.3, (introProgress - 0.5) * 0.6);
    var fontSize = Math.max(12, Math.min(W, H) * 0.018);

    // Position in upper-right area of the plot
    var pt = mathToCanvas(1.2, 3.5);

    ctx.save();
    ctx.font = 'italic 400 ' + fontSize + 'px "Playfair Display", Georgia, serif';
    ctx.fillStyle = colors.muted;
    ctx.globalAlpha = labelAlpha;
    ctx.textAlign = 'center';
    ctx.fillText('L(\u03B8) = \u03B8\u00B2', pt[0], pt[1]);
    ctx.restore();
  }

  function render() {
    // Reset transform to clear properly
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Apply zoom: translate so zoomCenter stays in place, then scale
    if (zoomLevel > 1.001) {
      var vpCx = W / 2;
      var vpCy = H / 2;
      ctx.translate(vpCx, vpCy);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-zoomCenterX, -zoomCenterY);
    }

    drawGrid();
    drawParabola();
    drawEquationLabel();
    drawTrail();
    drawConnectors();
    for (var i = 0; i < N; i++) drawDot(i);
    drawTangent(activeIndex);
    drawArrow();

    // Reset transform after drawing
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- Scroll-driven logic ---

  function getScrollProgress() {
    var rect = section.getBoundingClientRect();
    var scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    var scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / scrollable));
  }

  var prevScrollIndex = -1;
  var animLoopRunning = false;
  var overviewVisible = false;
  var infoSwapTimer = null;

  // Total scroll phases: 1 intro step + N project steps = N+1 steps
  // Each gd-step is 100vh, so total scrollable = (N+1) * 100vh - 100vh = N * 100vh
  var TOTAL_STEPS = N + 1; // intro + 4 projects

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderOverviewCards() {
    if (!overviewGrid) return;
    overviewGrid.innerHTML = PROJECTS.filter(function (proj) {
      return proj.includeInOverview !== false;
    }).map(function (proj) {
      var awardMarkup = proj.award
        ? '<span class="gd-overview__award">' + escapeHtml(proj.award) + '</span>'
        : '';
      return (
        '<a class="gd-overview__card" href="#projects" data-project-index="' + PROJECTS.indexOf(proj) + '">' +
          '<span class="gd-overview__step">' + proj.step + '</span>' +
          awardMarkup +
          '<h4 class="gd-overview__card-title">' + proj.title + '</h4>' +
          '<p class="gd-overview__desc">' + proj.desc + '</p>' +
          '<div class="gd-overview__tags">' + proj.tags.map(function (t) {
            return '<span class="gd-overview__tag">' + escapeHtml(t) + '</span>';
          }).join('') + '</div>' +
        '</a>'
      );
    }).join('');
  }

  function scrollToProjectIndex(idx) {
    if (idx < 0 || idx >= N) return;
    var sectionTop = window.scrollY + section.getBoundingClientRect().top;
    var scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;

    var phaseNudge = idx === 0 ? 0.08 : 0;
    var targetProgress = (idx + 1 + phaseNudge) / TOTAL_STEPS;
    var targetTop = sectionTop + scrollable * targetProgress;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  }

  function handleOverviewClick(e) {
    var card = e.target.closest('.gd-overview__card');
    if (!card) return;
    e.preventDefault();
    var idx = Number(card.dataset.projectIndex);
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

  function onScroll() {
    var rect = section.getBoundingClientRect();
    if (rect.top >= window.innerHeight || rect.bottom <= 0) {
      targetActiveIndex = -1;
      targetTangent = 0;
      targetOverviewProgress = 0;
      prevScrollIndex = -1;
      activeIndex = -1;
      hoveredIndex = -1;
      setOverviewState(false);
      updateInfo(-1);
      render();
      return;
    }

    var progress = getScrollProgress();

    // Hide scroll hint once scrolling begins
    if (progress > 0.01 && scrollHint) {
      scrollHint.classList.add('hidden');
    }

    if (introPanel) {
      introPanel.classList.toggle('compact', progress > 0.02);
    }

    // Map progress across all steps (intro + projects)
    var rawStep = progress * TOTAL_STEPS;

    // --- Phase 1: Intro (step 0) — parabola draws + dots appear ---
    // First step is the intro: rawStep 0..1
    var introPhase = Math.max(0, Math.min(1, rawStep));

    // Parabola draws during first 60% of intro step
    targetIntroProgress = easeOut(Math.min(1, introPhase / 0.6));

    // Dots appear during last 60% of intro step — continuous float for smooth scale-in
    var dotPhase = Math.max(0, (introPhase - 0.4) / 0.6);
    targetDotReveal = Math.min(N, dotPhase * N);

    // --- Phase 2: Project focus + overview (steps 1..N) ---
    // floatIndex is a continuous 0.0 .. (N-1) across the project steps
    var projectProgress = Math.max(0, rawStep - 1); // 0..N
    var focusPhaseEnd = N - 1;
    var floatIndex = Math.min(N - 1, projectProgress); // 0..(N-1)
    fastProjectTransition = projectProgress > 0 && projectProgress < 2.6;

    // Pre-compute first dot position for smooth lead-in
    var firstDotPt = mathToCanvas(PROJECTS[0].x, f(PROJECTS[0].x));
    var lastDotPt = mathToCanvas(PROJECTS[N - 1].x, f(PROJECTS[N - 1].x));

    // Start panning toward first dot and zooming during last 40% of intro
    var leadIn = Math.max(0, (introPhase - 0.6) / 0.4); // 0..1 during intro tail
    var easedLeadIn = leadIn * leadIn * (3 - 2 * leadIn); // smoothstep

    if (projectProgress <= 0) {
      // Still in intro, no project focused
      targetActiveIndex = -1;
      targetTangent = 0;
      targetOverviewProgress = 0;

      // Smoothly ramp zoom and center toward first dot during intro tail
      targetZoom = 1 + (ZOOM_AMOUNT - 1) * easedLeadIn * 0.5;
      targetCenterX = W / 2 + (firstDotPt[0] - W / 2) * easedLeadIn;
      targetCenterY = H / 2 + (firstDotPt[1] - H / 2) * easedLeadIn;
    } else if (projectProgress > focusPhaseEnd) {
      var overviewT = Math.max(0, Math.min(1, projectProgress - focusPhaseEnd));
      var easedOverview = overviewT * overviewT * (3 - 2 * overviewT);
      var cardHoldT = Math.max(0, Math.min(1, overviewT / 0.28));

      targetActiveIndex = overviewT < 0.28 ? N - 1 : -1;
      targetTangent = 1 - cardHoldT;
      targetOverviewProgress = overviewT;
      targetZoom = ZOOM_AMOUNT + (1 - ZOOM_AMOUNT) * easedOverview;
      targetCenterX = lastDotPt[0] + (W / 2 - lastDotPt[0]) * easedOverview;
      targetCenterY = lastDotPt[1] + (H / 2 - lastDotPt[1]) * easedOverview;
    } else {
      // Which dot are we closest to?
      var nearestIndex = Math.round(floatIndex);
      nearestIndex = Math.max(0, Math.min(N - 1, nearestIndex));
      var distToNearest = Math.abs(floatIndex - nearestIndex);

      // Tangent: full when close to a dot, fades when panning between dots
      // distToNearest is 0 at dot center, 0.5 at midpoint between dots
      var tangentT = 1 - Math.min(1, distToNearest / 0.35);
      targetTangent = easeOut(Math.max(0, tangentT));
      targetOverviewProgress = 0;

      // Zoom: continue from lead-in, ramp to full over first half-step
      var zoomEntry = Math.min(1, projectProgress / 0.5);
      targetZoom = 1 + (ZOOM_AMOUNT - 1) * (0.5 + 0.5 * easeOut(zoomEntry));

      // Center: smoothly interpolate between adjacent dot positions
      var lowerIdx = Math.max(0, Math.min(N - 2, Math.floor(floatIndex)));
      var upperIdx = lowerIdx + 1;
      var t = floatIndex - lowerIdx; // 0..1 between lowerIdx and upperIdx
      // Ease the panning so it slows near dots and speeds between them
      var easedT = t * t * (3 - 2 * t); // smoothstep

      var ptA = mathToCanvas(PROJECTS[lowerIdx].x, f(PROJECTS[lowerIdx].x));
      var ptB = mathToCanvas(PROJECTS[upperIdx].x, f(PROJECTS[upperIdx].x));
      targetCenterX = ptA[0] + (ptB[0] - ptA[0]) * easedT;
      targetCenterY = ptA[1] + (ptB[1] - ptA[1]) * easedT;

      targetActiveIndex = nearestIndex;
    }

    var newIndex = targetActiveIndex;
    if (newIndex !== prevScrollIndex) {
      prevScrollIndex = newIndex;
      activeIndex = newIndex;
      updateInfo(newIndex);
    }

    setOverviewState(targetOverviewProgress > 0.22);

    // Start animation loop if not running
    if (!animLoopRunning) {
      animLoopRunning = true;
      requestAnimationFrame(animLoop);
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function animLoop() {
    var zoomLerp = fastProjectTransition ? 0.12 : LERP_ZOOM;
    var panLerp = fastProjectTransition ? 0.18 : LERP_PAN;
    var tangentLerp = fastProjectTransition ? 0.14 : LERP_TANGENT;

    // Lerp each property at its own speed
    introProgress = lerp(introProgress, targetIntroProgress, LERP_INTRO);
    dotReveal = lerp(dotReveal, targetDotReveal, LERP_INTRO);
    zoomLevel = lerp(zoomLevel, targetZoom, zoomLerp);
    zoomCenterX = lerp(zoomCenterX, targetCenterX, panLerp);
    zoomCenterY = lerp(zoomCenterY, targetCenterY, panLerp);
    tangentProgress = lerp(tangentProgress, targetTangent, tangentLerp);
    overviewProgress = lerp(overviewProgress, targetOverviewProgress, LERP_OVERVIEW);

    activeIndex = targetActiveIndex;

    render();

    // Check if values have settled
    var settled =
      Math.abs(introProgress - targetIntroProgress) < 0.003 &&
      Math.abs(dotReveal - targetDotReveal) < 0.01 &&
      Math.abs(zoomLevel - targetZoom) < 0.002 &&
      Math.abs(zoomCenterX - targetCenterX) < 0.5 &&
      Math.abs(zoomCenterY - targetCenterY) < 0.5 &&
      Math.abs(tangentProgress - targetTangent) < 0.005 &&
      Math.abs(overviewProgress - targetOverviewProgress) < 0.01;

    if (settled) {
      introProgress = targetIntroProgress;
      dotReveal = targetDotReveal;
      zoomLevel = targetZoom;
      zoomCenterX = targetCenterX;
      zoomCenterY = targetCenterY;
      tangentProgress = targetTangent;
      overviewProgress = targetOverviewProgress;
    }

    // Keep running while a dot is active (for pulsing glow) or values haven't settled
    if (!settled || activeIndex >= 0) {
      requestAnimationFrame(animLoop);
    } else {
      render();
      animLoopRunning = false;
    }
  }

  var currentInfoIdx = -1;

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

    infoSwapTimer = setTimeout(function () {
      var proj = PROJECTS[idx];
      var slope = fPrime(proj.x);
      infoStep.textContent = proj.step;
      infoGradient.textContent = '\u2207 = ' + slope.toFixed(2);
      infoTitle.textContent = proj.title;
      infoAward.textContent = proj.award || '';
      infoAward.hidden = !proj.award;
      infoAward.classList.toggle('is-hidden', !proj.award);
      infoDesc.textContent = proj.desc;
      infoMedia.hidden = !!proj.hideMedia;
      infoMedia.classList.toggle('is-hidden', !!proj.hideMedia);
      infoMedia.dataset.type = (proj.mediaType || 'image').toLowerCase();
      infoMedia.dataset.hasVideo = proj.mediaSrc ? 'true' : 'false';
      infoMedia.dataset.hasEmbed = proj.mediaEmbed ? 'true' : 'false';
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
      if (proj.mediaSrc) {
        infoMediaEmbed.removeAttribute('src');
        infoMediaEmbed.title = '';
        if (infoMediaVideo.getAttribute('src') !== proj.mediaSrc) {
          infoMediaVideo.src = proj.mediaSrc;
          infoMediaVideo.load();
        }
        infoMediaVideo.play().catch(function () {});
      } else {
        infoMediaVideo.pause();
        infoMediaVideo.removeAttribute('src');
        infoMediaVideo.load();
      }
      infoTags.innerHTML = proj.tags.map(function (t) {
        return '<span class="tag">' + t + '</span>';
      }).join('');
      infoLink.href = proj.link;
      var isExternalLink = /^https?:\/\//i.test(proj.link || '');
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
        var isExternal = /^https?:\/\//i.test(proj.secondaryLink);
        infoSecondaryLink.target = isExternal ? '_blank' : '';
        infoSecondaryLink.rel = isExternal ? 'noopener noreferrer' : '';
      } else {
        infoSecondaryLink.removeAttribute('href');
        infoSecondaryLink.removeAttribute('download');
      }
      // Progress bar
      infoPanel.style.setProperty('--gd-progress', ((idx + 1) / N * 100) + '%');
      void infoPanel.offsetHeight;
      infoPanel.classList.add('active');
      infoSwapTimer = null;
    }, 250);
  }

  // --- Mouse interaction (secondary) ---

  function getHoveredDot(cx, cy) {
    var hitRadius = 28;
    for (var i = 0; i < N; i++) {
      var pt = mathToCanvas(PROJECTS[i].x, f(PROJECTS[i].x));
      if (Math.hypot(cx - pt[0], cy - pt[1]) < hitRadius) return i;
    }
    return -1;
  }

  function screenToCanvas(sx, sy) {
    var mx = sx, my = sy;
    if (zoomLevel > 1.001) {
      var vpCx = W / 2, vpCy = H / 2;
      mx = (sx - vpCx) / zoomLevel + zoomCenterX;
      my = (sy - vpCy) / zoomLevel + zoomCenterY;
    }
    return [mx, my];
  }

  function handleMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    var pt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    var idx = getHoveredDot(pt[0], pt[1]);
    if (idx !== hoveredIndex) {
      hoveredIndex = idx;
      canvas.style.cursor = idx >= 0 ? 'pointer' : 'default';
      render();
    }
  }

  function handleClick(e) {
    var rect = canvas.getBoundingClientRect();
    var pt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    var idx = getHoveredDot(pt[0], pt[1]);
    if (idx >= 0 && idx !== activeIndex) {
      scrollToProjectIndex(idx);
    }
  }

  // --- Init ---

  function init() {
    readColors();
    renderOverviewCards();
    resize();

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', function () {
      hoveredIndex = -1;
      canvas.style.cursor = 'default';
      render();
    });
    canvas.addEventListener('click', handleClick);
    if (overviewGrid) {
      overviewGrid.addEventListener('click', handleOverviewClick);
    }

    // Scroll listener
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        onScroll();
      }, 100);
    });

    // Kick initial scroll check in case already scrolled into view
    onScroll();
  }

  document.fonts ? document.fonts.ready.then(init) : init();
})();
