// Drag windows by their title bar (desktop only; disabled when maximized/fullscreen).

import { isMobile } from '../utils.js';
import { focusWindow } from './window-manager.js';

let dragState = null;

function onTitlebarPointerDown(e) {
  if (isMobile()) return;
  if (e.target.closest('.window__btn')) return;
  const titlebar = e.currentTarget;
  const win = titlebar.closest('.window');
  if (!win || win.classList.contains('window--fullscreen') || win.classList.contains('window--maximized')) return;
  focusWindow(win.dataset.window);
  const rect = win.getBoundingClientRect();
  dragState = {
    win,
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
  };
  titlebar.setPointerCapture(e.pointerId);
}

function onTitlebarPointerMove(e) {
  if (!dragState) return;
  const { win, offsetX, offsetY } = dragState;
  const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 40;
  const maxLeft = Math.max(0, window.innerWidth - win.offsetWidth);
  const maxTop = Math.max(0, window.innerHeight - navHeight - win.offsetHeight);
  const left = Math.min(Math.max(0, e.clientX - offsetX), maxLeft);
  const top = Math.min(Math.max(0, e.clientY - offsetY), maxTop);
  win.style.setProperty('--win-left', left + 'px');
  win.style.setProperty('--win-top', top + 'px');
}

function onTitlebarPointerUp(e) {
  if (!dragState) return;
  dragState.win.querySelector('.window__titlebar')?.releasePointerCapture(e.pointerId);
  dragState = null;
}

export function initWindowDrag() {
  document.querySelectorAll('.window__titlebar[data-drag-handle]').forEach(titlebar => {
    titlebar.addEventListener('pointerdown', onTitlebarPointerDown);
  });
  document.addEventListener('pointermove', onTitlebarPointerMove);
  document.addEventListener('pointerup', onTitlebarPointerUp);
}
