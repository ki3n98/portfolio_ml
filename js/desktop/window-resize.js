// Resize windows from their bottom-right handle (desktop only).

import { isMobile } from '../utils.js';
import { focusWindow } from './window-manager.js';

let resizeState = null;
const MIN_WIN_W = 320;
const MIN_WIN_H = 240;

function onResizeHandlePointerDown(e) {
  if (isMobile()) return;
  const handle = e.currentTarget;
  const win = handle.closest('.window');
  if (!win || win.classList.contains('window--fullscreen') || win.classList.contains('window--maximized')) return;
  e.stopPropagation();
  focusWindow(win.dataset.window);
  const rect = win.getBoundingClientRect();
  resizeState = {
    win,
    left: rect.left,
    top: rect.top,
    startX: e.clientX,
    startY: e.clientY,
    startW: rect.width,
    startH: rect.height,
  };
  handle.setPointerCapture(e.pointerId);
}

function onResizeHandlePointerMove(e) {
  if (!resizeState) return;
  const { win, left, top, startX, startY, startW, startH } = resizeState;
  const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 40;
  const maxW = Math.max(MIN_WIN_W, window.innerWidth - left);
  const maxH = Math.max(MIN_WIN_H, window.innerHeight - navHeight - top);
  const w = Math.min(Math.max(MIN_WIN_W, startW + (e.clientX - startX)), maxW);
  const h = Math.min(Math.max(MIN_WIN_H, startH + (e.clientY - startY)), maxH);
  win.style.setProperty('--win-w', w + 'px');
  win.style.setProperty('--win-h', h + 'px');
}

function onResizeHandlePointerUp(e) {
  if (!resizeState) return;
  resizeState.win.querySelector('.window__resize-handle')?.releasePointerCapture(e.pointerId);
  resizeState = null;
}

export function initWindowResize() {
  document.querySelectorAll('.window__resize-handle').forEach(handle => {
    handle.addEventListener('pointerdown', onResizeHandlePointerDown);
  });
  document.addEventListener('pointermove', onResizeHandlePointerMove);
  document.addEventListener('pointerup', onResizeHandlePointerUp);
}
