// Paint core: overlay/undo/zoom/resize, pointer->canvas mapping, color, committing
// pending selection/text, and tool switching. Used by tools, pointer and image-ops.

import { paintCanvas, paintWrap, paintOverlay, paintCtx, overlayCtx, paintCurrentColor, paintCanvasSize, paintToolButtons, zoomSteps, undoStack, S } from './state.js';

export function clearOverlay() {
  overlayCtx.clearRect(0, 0, paintOverlay.width, paintOverlay.height);
}

export function pushUndo() {
  undoStack.push(paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height));
  if (undoStack.length > 25) undoStack.shift();
}

export function undo() {
  if (!undoStack.length) return;
  resetInteractionState();
  paintCtx.putImageData(undoStack.pop(), 0, 0);
}

export function applyZoom(scale) {
  const idx = zoomSteps.indexOf(scale);
  S.zoomIndex = idx >= 0 ? idx : 0;
  paintCanvas.style.transform = scale === 1 ? '' : `scale(${scale})`;
  paintCanvas.style.transformOrigin = '0 0';
  paintOverlay.style.transform = paintCanvas.style.transform;
  paintOverlay.style.transformOrigin = '0 0';
}

export function resizeCanvas() {
  const { width, height } = paintWrap.getBoundingClientRect();
  if (width === 0 || height === 0) return;

  const snapshot = document.createElement('canvas');
  snapshot.width = paintCanvas.width;
  snapshot.height = paintCanvas.height;
  snapshot.getContext('2d').drawImage(paintCanvas, 0, 0);

  paintCanvas.width = width;
  paintCanvas.height = height;
  paintOverlay.width = width;
  paintOverlay.height = height;
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(0, 0, width, height);
  if (snapshot.width > 0 && snapshot.height > 0) {
    paintCtx.drawImage(snapshot, 0, 0);
  }

  if (paintCanvasSize) {
    paintCanvasSize.textContent = `${Math.round(width)} x ${Math.round(height)}`;
  }
}

export function getPos(e) {
  const rect = paintOverlay.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / rect.width * paintCanvas.width,
    y: (e.clientY - rect.top) / rect.height * paintCanvas.height,
  };
}

export function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function setPaintColor(hex) {
  S.paintColor = hex;
  if (paintCurrentColor) paintCurrentColor.style.background = S.paintColor;
}

export function commitSelection() {
  if (!S.selection) return;
  paintCtx.drawImage(S.selection.canvas, S.selection.x, S.selection.y);
  S.selection = null;
  clearOverlay();
}

export function commitTextInput() {
  if (!S.textInput) return;
  const value = S.textInput.value;
  if (value && S.textPos) {
    pushUndo();
    paintCtx.font = '20px sans-serif';
    paintCtx.fillStyle = S.paintColor;
    paintCtx.textBaseline = 'top';
    paintCtx.fillText(value, S.textPos.x, S.textPos.y);
  }
  S.textInput.remove();
  S.textInput = null;
  S.textPos = null;
}

export function resetInteractionState() {
  commitSelection();
  commitTextInput();
  S.polygonPoints = [];
  S.curveStage = 0;
  S.curveStart = null;
  S.curveEnd = null;
  S.curveBend1 = null;
  S.selDragMode = 'none';
  S.marqueeStart = null;
  S.marqueePoints = null;
  clearOverlay();
}

export function selectTool(name) {
  if (name === S.activeTool) return;
  resetInteractionState();
  S.activeTool = name;
  paintToolButtons.forEach(btn => {
    const isActive = btn.dataset.paintTool === name;
    btn.classList.toggle('paint__tool--active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
  paintOverlay.style.cursor = name === 'text' ? 'text' : name === 'zoom' ? 'zoom-in' : 'crosshair';
}

export function drawSelectionOverlay() {
  clearOverlay();
  if (!S.selection) return;
  overlayCtx.drawImage(S.selection.canvas, S.selection.x, S.selection.y);
  overlayCtx.save();
  overlayCtx.setLineDash([4, 3]);
  overlayCtx.strokeStyle = '#000000';
  overlayCtx.lineWidth = 1;
  overlayCtx.strokeRect(S.selection.x + 0.5, S.selection.y + 0.5, S.selection.w, S.selection.h);
  overlayCtx.restore();
}
