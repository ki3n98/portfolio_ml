// Canvas drawing for the viz: theme colors, resize, grid, parabola, dots, tangent,
// connectors, trail, arrow, equation label, and the top-level render().

import { PROJECTS, N, state, target, canvas, ctx, xMin, xMax, yMax, colors, S } from './state.js';
import { f, fPrime, easeOutBack, seededJitter, mathToCanvas } from './math.js';

export function readColors() {
  const s = getComputedStyle(document.documentElement);
  colors.bg = s.getPropertyValue('--bg').trim();
  colors.primary = s.getPropertyValue('--primary-accent').trim();
  colors.medium = s.getPropertyValue('--medium-accent').trim();
  colors.dark = s.getPropertyValue('--dark-accent').trim();
  colors.text = s.getPropertyValue('--text').trim();
  colors.muted = s.getPropertyValue('--text-muted').trim();
  colors.border = s.getPropertyValue('--border').trim();
}

export function resize() {
  const wrap = canvas.parentElement;
  S.dpr = window.devicePixelRatio || 1;
  S.W = wrap.clientWidth;
  S.H = wrap.clientHeight;
  canvas.width = S.W * S.dpr;
  canvas.height = S.H * S.dpr;
  ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);

  S.padL = S.W * 0.1;
  S.padR = S.W * 0.1;
  S.padT = S.H * 0.12;
  S.padB = S.H * 0.14;
  S.plotW = S.W - S.padL - S.padR;
  S.plotH = S.H - S.padT - S.padB;

  // Seed zoom center to canvas center if not yet set
  if (state.zoomCenterX === 0 && state.zoomCenterY === 0) {
    state.zoomCenterX = target.centerX = S.W / 2;
    state.zoomCenterY = target.centerY = S.H / 2;
  }

  render();
}

// ----- 2f. Drawing Functions -----

export function drawGrid() {
  ctx.save();
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.25;

  const tickLen = 6;
  const fontSize = Math.max(9, Math.min(S.W, S.H) * 0.012);

  // Horizontal lines + Y-axis ticks/labels
  for (let y = 0; y <= 4; y++) {
    const [, cy] = mathToCanvas(0, y);
    ctx.beginPath();
    ctx.moveTo(S.padL, cy);
    ctx.lineTo(S.padL + S.plotW, cy);
    ctx.stroke();
    // Tick
    ctx.beginPath();
    ctx.moveTo(S.padL - tickLen, cy);
    ctx.lineTo(S.padL, cy);
    ctx.stroke();
    // Label
    ctx.font = '400 ' + fontSize + 'px Tahoma, Verdana, sans-serif';
    ctx.fillStyle = colors.muted;
    ctx.globalAlpha = 0.3;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(y, S.padL - tickLen - 4, cy);
    ctx.globalAlpha = 0.25;
  }

  // Vertical lines + X-axis ticks/labels
  for (let x = -2; x <= 2; x++) {
    const [cx] = mathToCanvas(x, 0);
    ctx.beginPath();
    ctx.moveTo(cx, S.padT);
    ctx.lineTo(cx, S.padT + S.plotH);
    ctx.stroke();
    // Tick
    ctx.beginPath();
    ctx.moveTo(cx, S.padT + S.plotH);
    ctx.lineTo(cx, S.padT + S.plotH + tickLen);
    ctx.stroke();
    // Label
    ctx.font = '400 ' + fontSize + 'px Tahoma, Verdana, sans-serif';
    ctx.fillStyle = colors.muted;
    ctx.globalAlpha = 0.3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(x, cx, S.padT + S.plotH + tickLen + 3);
    ctx.globalAlpha = 0.25;
  }

  ctx.restore();
}

export function drawParabola() {
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

export function drawDot(i) {
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
    const fontSize = Math.max(12, Math.min(S.W, S.H) * 0.017);
    ctx.font = '400 ' + fontSize + 'px "Patrick Hand", cursive';
    ctx.fillStyle = isActive ? colors.text : colors.muted;
    ctx.textAlign = 'left';
    ctx.globalAlpha = (isActive ? 0.95 : 0.6) * labelAlpha;
    ctx.fillText('Step ' + (i + 1), cx + radius + 10, cy + 4);
  }

  ctx.restore();
}

export function drawTangent(i) {
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

export function drawConnectors() {
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

export function drawTrail() {
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

export function drawArrow() {
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

export function drawEquationLabel() {
  if (state.introProgress < 0.5) return;
  const labelAlpha = Math.min(0.3, (state.introProgress - 0.5) * 0.6);
  const fontSize = Math.max(12, Math.min(S.W, S.H) * 0.018);

  const pt = mathToCanvas(1.2, 3.5);

  ctx.save();
  ctx.font = 'italic 400 ' + fontSize + 'px Tahoma, Verdana, sans-serif';
  ctx.fillStyle = colors.muted;
  ctx.globalAlpha = labelAlpha;
  ctx.textAlign = 'center';
  ctx.fillText('L(\u03B8) = \u03B8\u00B2', pt[0], pt[1]);
  ctx.restore();
}

export function render() {
  ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
  ctx.clearRect(0, 0, S.W, S.H);

  // Apply zoom: translate so zoomCenter stays in place, then scale
  if (state.zoomLevel > 1.001) {
    const vpCx = S.W / 2;
    const vpCy = S.H / 2;
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

  ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
}
