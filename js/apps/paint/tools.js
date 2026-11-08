// Paint tool implementations: freehand stroke config, airbrush, shapes, flood fill,
// text, selection marquee, polygon and curve helpers.

import { paintCanvas, paintWrap, paintCtx, overlayCtx, S } from './state.js';
import { clearOverlay, pushUndo, getPos, hexToRgb, commitTextInput, drawSelectionOverlay } from './canvas.js';

// --- Freehand tools (pencil, brush, eraser, airbrush) ---
export function strokeConfig(tool) {
  if (tool === 'brush') return { width: 6, color: S.paintColor, cap: 'round' };
  if (tool === 'eraser') return { width: 14, color: '#ffffff', cap: 'square' };
  return { width: 2, color: S.paintColor, cap: 'round' };
}

export function airbrushSpray(x, y) {
  paintCtx.fillStyle = S.paintColor;
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 8;
    paintCtx.fillRect(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 1, 1);
  }
}

// --- Shape preview / commit ---
export function drawShape(ctx, tool, x0, y0, x1, y1) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = S.paintColor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (tool === 'line') {
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
  } else if (tool === 'rect') {
    ctx.rect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
  } else if (tool === 'rrect') {
    const x = Math.min(x0, x1), y = Math.min(y0, y1);
    const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0);
    const r = Math.min(16, w / 2, h / 2);
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
  } else if (tool === 'ellipse') {
    ctx.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, 0, 0, Math.PI * 2);
  }
  ctx.stroke();
}

// --- Flood fill ---
export function floodFill(startX, startY, hexColor) {
  const w = paintCanvas.width, h = paintCanvas.height;
  startX = Math.floor(startX); startY = Math.floor(startY);
  if (startX < 0 || startY < 0 || startX >= w || startY >= h) return;
  const img = paintCtx.getImageData(0, 0, w, h);
  const data = img.data;
  const [fr, fg, fb] = hexToRgb(hexColor);
  const idx0 = (startY * w + startX) * 4;
  const tr = data[idx0], tg = data[idx0 + 1], tb = data[idx0 + 2], ta = data[idx0 + 3];
  if (tr === fr && tg === fg && tb === fb && ta === 255) return;
  const matches = (i) => Math.abs(data[i] - tr) <= 24 && Math.abs(data[i + 1] - tg) <= 24 &&
    Math.abs(data[i + 2] - tb) <= 24 && Math.abs(data[i + 3] - ta) <= 24;
  const stack = [[startX, startY]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const i = (y * w + x) * 4;
    if (!matches(i)) continue;
    data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = 255;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  paintCtx.putImageData(img, 0, 0);
}

// --- Text tool ---
export function startTextInput(e) {
  commitTextInput();
  const wrapRect = paintWrap.getBoundingClientRect();
  const screenLeft = e.clientX - wrapRect.left + paintWrap.scrollLeft;
  const screenTop = e.clientY - wrapRect.top + paintWrap.scrollTop;
  S.textPos = getPos(e);
  S.textInput = document.createElement('input');
  S.textInput.type = 'text';
  S.textInput.className = 'paint__text-input';
  S.textInput.style.left = `${screenLeft}px`;
  S.textInput.style.top = `${screenTop}px`;
  S.textInput.style.color = S.paintColor;
  paintWrap.appendChild(S.textInput);
  S.textInput.focus();
  S.textInput.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') commitTextInput();
    if (ev.key === 'Escape') { S.textInput.value = ''; commitTextInput(); }
  });
  S.textInput.addEventListener('blur', () => commitTextInput());
}

// --- Selection tools (select / freeform) ---
export function pointInSelection(pos) {
  return S.selection && pos.x >= S.selection.x && pos.x <= S.selection.x + S.selection.w &&
    pos.y >= S.selection.y && pos.y <= S.selection.y + S.selection.h;
}

export function finalizeMarquee(pos) {
  let path, bbox;
  if (S.activeTool === 'freeform') {
    const pts = S.marqueePoints;
    if (!pts || pts.length < 3) { S.marqueePoints = null; clearOverlay(); return; }
    path = new Path2D();
    path.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) path.lineTo(pts[i].x, pts[i].y);
    path.closePath();
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    bbox = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  } else {
    const x = Math.min(S.marqueeStart.x, pos.x), y = Math.min(S.marqueeStart.y, pos.y);
    const w = Math.abs(pos.x - S.marqueeStart.x), h = Math.abs(pos.y - S.marqueeStart.y);
    bbox = { x, y, w, h };
    path = new Path2D();
    path.rect(x, y, w, h);
  }
  if (bbox.w < 2 || bbox.h < 2) { S.marqueePoints = null; S.marqueeStart = null; clearOverlay(); return; }

  const off = document.createElement('canvas');
  off.width = bbox.w; off.height = bbox.h;
  const offCtx = off.getContext('2d');
  offCtx.save();
  offCtx.translate(-bbox.x, -bbox.y);
  offCtx.clip(path);
  offCtx.drawImage(paintCanvas, 0, 0);
  offCtx.restore();

  pushUndo();
  paintCtx.save();
  paintCtx.clip(path);
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(bbox.x, bbox.y, bbox.w, bbox.h);
  paintCtx.restore();

  S.selection = { canvas: off, x: bbox.x, y: bbox.y, w: bbox.w, h: bbox.h };
  drawSelectionOverlay();
  S.marqueeStart = null;
  S.marqueePoints = null;
}

// --- Polygon tool ---
export function drawPolygonPreview(current) {
  clearOverlay();
  overlayCtx.lineWidth = 2;
  overlayCtx.strokeStyle = S.paintColor;
  overlayCtx.lineCap = 'round';
  overlayCtx.lineJoin = 'round';
  overlayCtx.beginPath();
  overlayCtx.moveTo(S.polygonPoints[0].x, S.polygonPoints[0].y);
  for (let i = 1; i < S.polygonPoints.length; i++) overlayCtx.lineTo(S.polygonPoints[i].x, S.polygonPoints[i].y);
  if (current) overlayCtx.lineTo(current.x, current.y);
  overlayCtx.stroke();
}

export function finalizePolygon() {
  if (S.polygonPoints.length < 2) { S.polygonPoints = []; clearOverlay(); return; }
  pushUndo();
  paintCtx.lineWidth = 2;
  paintCtx.strokeStyle = S.paintColor;
  paintCtx.lineCap = 'round';
  paintCtx.lineJoin = 'round';
  paintCtx.beginPath();
  paintCtx.moveTo(S.polygonPoints[0].x, S.polygonPoints[0].y);
  for (let i = 1; i < S.polygonPoints.length; i++) paintCtx.lineTo(S.polygonPoints[i].x, S.polygonPoints[i].y);
  paintCtx.closePath();
  paintCtx.stroke();
  S.polygonPoints = [];
  clearOverlay();
}

// --- Curve tool (drag for the line, then two clicks to bend it) ---
export function resetCurve() {
  S.curveStage = 0;
  S.curveStart = null;
  S.curveEnd = null;
  S.curveBend1 = null;
  clearOverlay();
}
