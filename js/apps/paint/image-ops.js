// Whole-image operations from the menus: clear, save, select all, flip, rotate, invert.

import { paintCanvas, paintCtx, S } from './state.js';
import { pushUndo, applyZoom, resetInteractionState, selectTool, drawSelectionOverlay } from './canvas.js';
import { openSaveAsDialog } from '../explorer/save-dialog.js';
import { saveFileToFolder } from '../explorer/index.js';

export function clearCanvas() {
  resetInteractionState();
  pushUndo();
  applyZoom(1);
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
}

export function savePaintImage() {
  openSaveAsDialog({
    defaultName: 'Untitled.png',
    fileType: '24-bit Bitmap (*.png)',
    saveInKey: 'my-pictures',
    onSave: (name) => {
      saveFileToFolder('my-pictures', {
        type: 'image',
        label: name,
        icon: '../assets/icons/jpg-file.png',
        src: paintCanvas.toDataURL('image/png'),
      });
    },
  });
}

export function selectAll() {
  resetInteractionState();
  pushUndo();
  if (S.activeTool !== 'select' && S.activeTool !== 'freeform') selectTool('select');
  const w = paintCanvas.width, h = paintCanvas.height;
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  off.getContext('2d').drawImage(paintCanvas, 0, 0);
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(0, 0, w, h);
  S.selection = { canvas: off, x: 0, y: 0, w, h };
  drawSelectionOverlay();
}

export function withSnapshot(mutate) {
  pushUndo();
  const snapshot = document.createElement('canvas');
  snapshot.width = paintCanvas.width;
  snapshot.height = paintCanvas.height;
  snapshot.getContext('2d').drawImage(paintCanvas, 0, 0);
  mutate(snapshot);
}

export function flipHorizontal() {
  withSnapshot((snapshot) => {
    paintCtx.save();
    paintCtx.translate(paintCanvas.width, 0);
    paintCtx.scale(-1, 1);
    paintCtx.drawImage(snapshot, 0, 0);
    paintCtx.restore();
  });
}

export function flipVertical() {
  withSnapshot((snapshot) => {
    paintCtx.save();
    paintCtx.translate(0, paintCanvas.height);
    paintCtx.scale(1, -1);
    paintCtx.drawImage(snapshot, 0, 0);
    paintCtx.restore();
  });
}

export function rotate90() {
  withSnapshot((snapshot) => {
    const w = paintCanvas.width, h = paintCanvas.height;
    paintCtx.fillStyle = '#ffffff';
    paintCtx.fillRect(0, 0, w, h);
    paintCtx.save();
    paintCtx.translate(w / 2, h / 2);
    paintCtx.rotate(Math.PI / 2);
    paintCtx.drawImage(snapshot, -w / 2, -h / 2);
    paintCtx.restore();
  });
}

export function invertColors() {
  pushUndo();
  const img = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 255 - d[i];
    d[i + 1] = 255 - d[i + 1];
    d[i + 2] = 255 - d[i + 2];
  }
  paintCtx.putImageData(img, 0, 0);
}
