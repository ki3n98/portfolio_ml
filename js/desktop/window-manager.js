// Window manager: open/close/minimize/maximize/focus, z-order, taskbar buttons,
// and the data-window / data-open-window / data-close click wiring.
// Dragging and resizing live in window-drag.js / window-resize.js.

import { closeStartMenu } from './start-menu.js';

export const WINDOW_IDS = ['portfolio', 'hero', 'experience', 'projects', 'contact', 'resume', 'paint', 'notepad', 'calculator', 'my-computer', 'my-documents', 'my-pictures'];
export const windowEls = {};
WINDOW_IDS.forEach(id => {
  windowEls[id] = document.querySelector(`.window[data-window="${id}"]`);
});

let topZ = 10;

// Windows that have never been opened, or were explicitly closed via the X
// button, drop out of the taskbar entirely. Minimizing just hides them
// (win.hidden) while leaving them in this set's complement, so their
// taskbar button stays put and can restore them.
const closedWindows = new Set(WINDOW_IDS);

// Saved --win-left/top/w/h (as authored, so calc()/vw expressions survive)
// for windows currently maximized, so the maximize button can restore them.
const maximizedState = {};

export function revealFadeInsWithin(win) {
  win.querySelectorAll('.fade-in:not(.visible)').forEach(el => el.classList.add('visible'));
}

export function isTopWindow(id) {
  let topId = null;
  let topZVal = -1;
  WINDOW_IDS.forEach(wid => {
    const w = windowEls[wid];
    if (!w || w.hidden) return;
    const z = parseFloat(getComputedStyle(w).getPropertyValue('--win-z')) || 0;
    if (z > topZVal) {
      topZVal = z;
      topId = wid;
    }
  });
  return topId === id;
}

export function focusWindow(id) {
  const win = windowEls[id];
  if (!win) return;
  topZ += 1;
  win.style.setProperty('--win-z', String(topZ));
  updateTaskbar();
}

export function openWindow(id) {
  const win = windowEls[id];
  if (!win) return;
  win.hidden = false;
  closedWindows.delete(id);
  focusWindow(id);
  revealFadeInsWithin(win);
  if (id === 'projects' && window.__gdRefresh) window.__gdRefresh();
  closeStartMenu();
  updateTaskbar();
}

// Hides the window but keeps its taskbar button around so it can be
// restored from there — distinct from closeWindow, which drops it from
// the taskbar entirely.
export function minimizeWindow(id) {
  const win = windowEls[id];
  if (!win) return;
  win.hidden = true;
  updateTaskbar();
}

export function closeWindow(id) {
  const win = windowEls[id];
  if (!win) return;
  win.hidden = true;
  closedWindows.add(id);
  updateTaskbar();
}

export function toggleMaximize(id) {
  const win = windowEls[id];
  if (!win || win.classList.contains('window--fullscreen')) return;
  if (win.classList.contains('window--maximized')) {
    win.classList.remove('window--maximized');
    const saved = maximizedState[id];
    if (saved) {
      win.style.setProperty('--win-left', saved.left);
      win.style.setProperty('--win-top', saved.top);
      win.style.setProperty('--win-w', saved.w);
      win.style.setProperty('--win-h', saved.h);
      delete maximizedState[id];
    }
  } else {
    maximizedState[id] = {
      left: win.style.getPropertyValue('--win-left'),
      top: win.style.getPropertyValue('--win-top'),
      w: win.style.getPropertyValue('--win-w'),
      h: win.style.getPropertyValue('--win-h'),
    };
    win.classList.add('window--maximized');
  }
  focusWindow(id);
}

export function toggleOrFocusWindow(id) {
  const win = windowEls[id];
  if (!win) return;
  if (win.hidden) openWindow(id);
  else focusWindow(id);
}

// --- Taskbar window buttons ---
const navWindows = document.getElementById('nav-windows');
const TASKBAR_ICONS = {
  portfolio: '../assets/icons/local-disk.png',
  hero: '../assets/icons/my-computer.png',
  experience: '../assets/icons/briefcase.png',
  projects: '../assets/icons/slideshow.png',
  contact: '../assets/icons/email.png',
  resume: '../assets/icons/resume-pdf.png',
  paint: '../assets/icons/paint.png',
  notepad: '../assets/icons/notepad.png',
  calculator: '../assets/icons/calculator.png',
  'my-computer': '../assets/icons/my-computer.png',
  'my-documents': '../assets/icons/my-documents.png',
  'my-pictures': '../assets/icons/my-pictures.png',
};
const taskbarBtns = {};

export function updateTaskbar() {
  WINDOW_IDS.forEach(id => {
    const btn = taskbarBtns[id];
    const win = windowEls[id];
    if (!btn || !win) return;
    btn.hidden = closedWindows.has(id);
    btn.classList.toggle('active', !win.hidden && isTopWindow(id));
  });
}

export function initWindowManager() {
  if (navWindows) {
    WINDOW_IDS.forEach(id => {
      const win = windowEls[id];
      if (!win) return;
      const title = win.querySelector('.window__title')?.textContent || id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'taskbar-btn';
      btn.dataset.window = id;
      btn.hidden = true;
      btn.innerHTML =
        `<span class="taskbar-btn__icon" style="--icon-url: url('${TASKBAR_ICONS[id] || ''}')" aria-hidden="true"></span>` +
        `<span class="taskbar-btn__label">${title}</span>`;
      btn.addEventListener('click', () => {
        if (win.hidden) {
          openWindow(id);
        } else if (isTopWindow(id)) {
          minimizeWindow(id);
        } else {
          focusWindow(id);
        }
      });
      navWindows.appendChild(btn);
      taskbarBtns[id] = btn;
    });
  }

  document.querySelectorAll('[data-window]').forEach(el => {
    if (el.classList.contains('window')) return;
    const eventName = el.classList.contains('desktop-icon') ? 'dblclick' : 'click';
    el.addEventListener(eventName, (e) => {
      e.preventDefault();
      toggleOrFocusWindow(el.dataset.window);
    });
  });

  document.querySelectorAll('[data-open-window]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (el.dataset.closeWindow) closeWindow(el.dataset.closeWindow);
      toggleOrFocusWindow(el.dataset.openWindow);
    });
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const win = btn.closest('.window');
      if (win) closeWindow(win.dataset.window);
    });
  });

  document.querySelectorAll('[data-minimize]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const win = btn.closest('.window');
      if (win) minimizeWindow(win.dataset.window);
    });
  });

  document.querySelectorAll('[data-maximize]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const win = btn.closest('.window');
      if (win) toggleMaximize(win.dataset.window);
    });
  });

  // Any stray `href="#windowId"` link (e.g. the gradient-descent info panel's
  // dynamically-populated cross-links) opens/focuses that window instead of
  // doing a no-op anchor jump to a possibly-hidden section.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (WINDOW_IDS.includes(id)) {
      e.preventDefault();
      toggleOrFocusWindow(id);
    }
  });

  Object.values(windowEls).forEach(win => {
    if (win) win.addEventListener('pointerdown', () => focusWindow(win.dataset.window));
  });

  // --- Escape closes the topmost open window ---
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const topId = WINDOW_IDS.find(id => !windowEls[id]?.hidden && isTopWindow(id));
    if (topId) closeWindow(topId);
  });

  // --- Default open state ---
  WINDOW_IDS.forEach(id => {
    const win = windowEls[id];
    if (!win) return;
    if (win.dataset.defaultOpen === 'true') {
      win.hidden = false;
      closedWindows.delete(id);
      focusWindow(id);
      revealFadeInsWithin(win);
    } else {
      win.hidden = true;
    }
  });
}
