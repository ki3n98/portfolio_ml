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
// 0. Boot Screen (wallpaper preload gate)
// ===========================
(function () {
  const bootScreen = document.getElementById('boot-screen');
  if (!bootScreen) return;

  const contentGroup = document.getElementById('boot-screen-content');
  const flagImg = bootScreen.querySelector('.boot-screen__flag');

  const VISIBLE_MS = 2000;
  const MAX_WAIT_MS = 5000;
  let started = false;

  function hideBootScreen() {
    bootScreen.classList.add('boot-screen--hidden');
    bootScreen.addEventListener('transitionend', () => bootScreen.remove(), { once: true });
  }

  function revealAndSchedule() {
    if (started) return;
    started = true;
    if (contentGroup) contentGroup.classList.add('boot-screen__content--visible');
    setTimeout(hideBootScreen, VISIBLE_MS);
  }

  if (flagImg) {
    if (flagImg.complete && flagImg.naturalWidth > 0) {
      revealAndSchedule();
    } else {
      flagImg.addEventListener('load', revealAndSchedule, { once: true });
      flagImg.addEventListener('error', revealAndSchedule, { once: true });
    }
  } else {
    revealAndSchedule();
  }
  setTimeout(revealAndSchedule, MAX_WAIT_MS);
})();

// ===========================
// 1. Navigation
// ===========================

// --- Start Menu Popup ---
const startBtn = document.getElementById('start-btn');
const navLinks = document.getElementById('nav-links');

function closeStartMenu() {
  navLinks.classList.remove('open');
  startBtn.setAttribute('aria-expanded', 'false');
}

function toggleStartMenu() {
  const isOpen = navLinks.classList.toggle('open');
  startBtn.setAttribute('aria-expanded', String(isOpen));
}

startBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleStartMenu();
});

document.addEventListener('click', (e) => {
  if (!navLinks.classList.contains('open')) return;
  if (navLinks.contains(e.target) || startBtn.contains(e.target)) return;
  closeStartMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeStartMenu();
});

// --- Window Manager ---
const WINDOW_IDS = ['hero', 'experience', 'projects', 'contact', 'resume', 'paint', 'notepad', 'calculator', 'my-computer', 'my-documents', 'my-pictures'];
const windowEls = {};
WINDOW_IDS.forEach(id => {
  windowEls[id] = document.querySelector(`.window[data-window="${id}"]`);
});

let topZ = 10;
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

// Windows that have never been opened, or were explicitly closed via the X
// button, drop out of the taskbar entirely. Minimizing just hides them
// (win.hidden) while leaving them in this set's complement, so their
// taskbar button stays put and can restore them.
const closedWindows = new Set(WINDOW_IDS);

// Saved --win-left/top/w/h (as authored, so calc()/vw expressions survive)
// for windows currently maximized, so the maximize button can restore them.
const maximizedState = {};

function revealFadeInsWithin(win) {
  win.querySelectorAll('.fade-in:not(.visible)').forEach(el => el.classList.add('visible'));
}

function isTopWindow(id) {
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

function focusWindow(id) {
  const win = windowEls[id];
  if (!win) return;
  topZ += 1;
  win.style.setProperty('--win-z', String(topZ));
  updateTaskbar();
}

function openWindow(id) {
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
function minimizeWindow(id) {
  const win = windowEls[id];
  if (!win) return;
  win.hidden = true;
  updateTaskbar();
}

function closeWindow(id) {
  const win = windowEls[id];
  if (!win) return;
  win.hidden = true;
  closedWindows.add(id);
  updateTaskbar();
}

function toggleMaximize(id) {
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

function toggleOrFocusWindow(id) {
  const win = windowEls[id];
  if (!win) return;
  if (win.hidden) openWindow(id);
  else focusWindow(id);
}

// --- Taskbar window buttons ---
const navWindows = document.getElementById('nav-windows');
const TASKBAR_ICONS = {
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

function updateTaskbar() {
  WINDOW_IDS.forEach(id => {
    const btn = taskbarBtns[id];
    const win = windowEls[id];
    if (!btn || !win) return;
    btn.hidden = closedWindows.has(id);
    btn.classList.toggle('active', !win.hidden && isTopWindow(id));
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

// --- Window Dragging ---
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

document.querySelectorAll('.window__titlebar[data-drag-handle]').forEach(titlebar => {
  titlebar.addEventListener('pointerdown', onTitlebarPointerDown);
});
document.addEventListener('pointermove', onTitlebarPointerMove);
document.addEventListener('pointerup', onTitlebarPointerUp);

// --- Window Resizing ---
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

document.querySelectorAll('.window__resize-handle').forEach(handle => {
  handle.addEventListener('pointerdown', onResizeHandlePointerDown);
});
document.addEventListener('pointermove', onResizeHandlePointerMove);
document.addEventListener('pointerup', onResizeHandlePointerUp);

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

// --- System Tray Clock (PST/PDT) ---
const trayClock = document.getElementById('tray-clock');

function updateTrayClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
  });
  const zone = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  })
    .formatToParts(now)
    .find(part => part.type === 'timeZoneName').value;
  trayClock.textContent = `${time} ${zone}`;
}

updateTrayClock();
setInterval(updateTrayClock, 30000);

// --- Contact Form (Web3Forms submission) ---
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  const contactStatus = document.getElementById('contact-form-status');
  const contactSubmitBtn = contactForm.querySelector('.contact-form__submit');
  const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

  function setContactStatus(message, variant) {
    contactStatus.textContent = message;
    contactStatus.classList.remove(
      'contact-form__status--sending',
      'contact-form__status--success',
      'contact-form__status--error'
    );
    if (variant) contactStatus.classList.add(`contact-form__status--${variant}`);
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const payload = Object.fromEntries(new FormData(contactForm).entries());

    contactSubmitBtn.disabled = true;
    setContactStatus('Sending…', 'sending');

    fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setContactStatus("Thanks! Your message has been sent — I'll get back to you soon.", 'success');
          contactForm.reset();
        } else {
          setContactStatus(result.message || 'Something went wrong. Please try again or email me directly.', 'error');
        }
      })
      .catch(() => {
        setContactStatus('Network error — please try again or email me directly.', 'error');
      })
      .finally(() => {
        contactSubmitBtn.disabled = false;
      });
  });
}

// --- Notepad App ---
const notepadTextarea = document.getElementById('notepad-textarea');
const notepadMenubar = document.getElementById('notepad-menubar');

if (notepadTextarea && notepadMenubar) {
  const notepadStatusbar = document.getElementById('notepad-statusbar');
  const notepadStatusPos = document.getElementById('notepad-status-pos');
  const wordWrapOption = document.getElementById('notepad-wordwrap-option');
  const statusBarOption = document.getElementById('notepad-statusbar-option');
  let wordWrap = true;
  let statusBarVisible = false;

  function updateNotepadStatus() {
    if (!statusBarVisible) return;
    const value = notepadTextarea.value.slice(0, notepadTextarea.selectionStart);
    const lines = value.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    notepadStatusPos.textContent = `Ln ${line}, Col ${col}`;
  }

  notepadTextarea.addEventListener('keyup', updateNotepadStatus);
  notepadTextarea.addEventListener('click', updateNotepadStatus);
  notepadTextarea.addEventListener('input', updateNotepadStatus);

  const notepadMenuItems = notepadMenubar.querySelectorAll('[data-notepad-menu]');
  let openNotepadMenu = null;

  function closeAllNotepadMenus() {
    notepadMenubar.querySelectorAll('.notepad__menu-dropdown.open').forEach(d => d.classList.remove('open'));
    notepadMenuItems.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    openNotepadMenu = null;
  }

  function openNotepadMenuFor(name) {
    closeAllNotepadMenus();
    const dropdown = notepadMenubar.querySelector(`[data-notepad-dropdown="${name}"]`);
    const btn = notepadMenubar.querySelector(`[data-notepad-menu="${name}"]`);
    if (!dropdown || !btn) return;
    dropdown.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    openNotepadMenu = name;
  }

  notepadMenuItems.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.dataset.notepadMenu;
      if (openNotepadMenu === name) closeAllNotepadMenus();
      else openNotepadMenuFor(name);
    });
    btn.addEventListener('mouseenter', () => {
      if (openNotepadMenu && openNotepadMenu !== btn.dataset.notepadMenu) openNotepadMenuFor(btn.dataset.notepadMenu);
    });
  });

  notepadMenubar.querySelectorAll('[data-notepad-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.notepadAction;
      closeAllNotepadMenus();
      switch (action) {
        case 'new':
          notepadTextarea.value = '';
          notepadTextarea.focus();
          updateNotepadStatus();
          break;
        case 'save': {
          const content = notepadTextarea.value;
          openSaveAsDialog({
            defaultName: 'Untitled.txt',
            fileType: 'Text Documents (*.txt)',
            onSave: (name) => {
              saveFileToFolder('my-documents', {
                type: 'file',
                label: name,
                icon: '../assets/icons/notepad.png',
                action: () => {
                  toggleOrFocusWindow('notepad');
                  notepadTextarea.value = content;
                  updateNotepadStatus();
                },
              });
            },
          });
          break;
        }
        case 'exit':
          closeWindow('notepad');
          break;
        case 'undo':
          notepadTextarea.focus();
          document.execCommand('undo');
          break;
        case 'cut':
          notepadTextarea.focus();
          document.execCommand('cut');
          break;
        case 'copy':
          notepadTextarea.focus();
          document.execCommand('copy');
          break;
        case 'select-all':
          notepadTextarea.focus();
          notepadTextarea.select();
          break;
        case 'time-date': {
          const now = new Date();
          const stamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + now.toLocaleDateString();
          const start = notepadTextarea.selectionStart;
          const end = notepadTextarea.selectionEnd;
          notepadTextarea.value = notepadTextarea.value.slice(0, start) + stamp + notepadTextarea.value.slice(end);
          notepadTextarea.focus();
          notepadTextarea.selectionStart = notepadTextarea.selectionEnd = start + stamp.length;
          updateNotepadStatus();
          break;
        }
        case 'word-wrap':
          wordWrap = !wordWrap;
          notepadTextarea.classList.toggle('notepad__textarea--nowrap', !wordWrap);
          wordWrapOption.classList.toggle('notepad__menu-option--checked', wordWrap);
          break;
        case 'status-bar':
          statusBarVisible = !statusBarVisible;
          notepadStatusbar.hidden = !statusBarVisible;
          statusBarOption.classList.toggle('notepad__menu-option--checked', statusBarVisible);
          if (statusBarVisible) updateNotepadStatus();
          break;
        case 'about':
          alert('Notepad — Lightweight Edition\n\nA small real text editor built for this desktop.\n\nText does not persist across page reloads.');
          break;
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (openNotepadMenu && !notepadMenubar.contains(e.target)) closeAllNotepadMenus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openNotepadMenu) closeAllNotepadMenus();
  });

  wordWrapOption?.classList.add('notepad__menu-option--checked');
}

// --- File Explorer (My Computer / My Documents / My Pictures) ---
function openReadme() {
  toggleOrFocusWindow('notepad');
  if (notepadTextarea) {
    notepadTextarea.value = 'Thanks for poking around!\n\nThis whole desktop - the windows, the taskbar, Paint, Notepad, '
      + 'the Calculator, this file explorer - is hand-built by Kien Pham to show both software engineering chops and a '
      + 'bit of nostalgia for Windows XP.\n\nCheck out the Resume.pdf in this folder, or head back to the desktop to see '
      + 'the rest of the portfolio.';
  }
}

const EXPLORER_FOLDERS = {
  'my-computer': {
    title: 'My Computer',
    icon: '../assets/icons/my-computer.png',
    parent: null,
    description: 'System Folder',
    tasks: [
      { label: 'View system information', icon: '../assets/icons/sys-info.png', action: () => alert('Kien\'s Portfolio Desktop\n\nBuilt with HTML, CSS, and vanilla JavaScript.\n\nNo frameworks were harmed in the making of this XP simulation.') },
      { label: 'Add or remove programs', icon: '../assets/icons/add-remove-programs.png', disabled: true },
      { label: 'Change a setting', icon: '../assets/icons/system-properties.png', disabled: true },
    ],
    items: [
      { type: 'folder', key: 'my-documents', label: 'My Documents', icon: '../assets/icons/my-documents.png' },
      { type: 'folder', key: 'my-pictures', label: 'My Pictures', icon: '../assets/icons/my-pictures.png' },
      { type: 'folder', key: 'local-disk-c', label: 'Local Disk (C:)', icon: '../assets/icons/local-disk.png' },
    ],
  },
  'my-documents': {
    title: 'My Documents',
    icon: '../assets/icons/my-documents.png',
    parent: 'my-computer',
    description: 'File Folder',
    tasks: [
      { label: 'Make a new folder', icon: '../assets/icons/new-folder.png', disabled: true },
      { label: 'Publish this folder to the web', icon: '../assets/icons/publish-web.png', disabled: true },
      { label: 'Share this folder', icon: '../assets/icons/shared-folder.png', disabled: true },
    ],
    items: [
      { type: 'folder', key: 'my-pictures', label: 'My Pictures', icon: '../assets/icons/my-pictures.png' },
      { type: 'file', label: 'Resume.pdf', icon: '../assets/icons/resume-pdf.png', action: () => toggleOrFocusWindow('resume') },
      { type: 'file', label: 'readme.txt', icon: '../assets/icons/notepad.png', action: openReadme },
    ],
  },
  'my-pictures': {
    title: 'My Pictures',
    icon: '../assets/icons/my-pictures.png',
    parent: 'my-computer',
    description: 'File Folder',
    tasks: [
      { label: 'View as a slide show', icon: '../assets/icons/slideshow-task.png', action: () => startSlideshow('my-pictures') },
      { label: 'Order prints online', icon: '../assets/icons/publish-web.png', disabled: true },
      { label: 'Print pictures', icon: '../assets/icons/print-photos.png', disabled: true },
    ],
    items: [
      { type: 'image', label: 'kien-pham.jpg', icon: '../assets/icons/jpg-file.png', src: 'assets/img/emi.jpg' },
      { type: 'image', label: 'bliss.jpg', icon: '../assets/icons/jpg-file.png', src: 'assets/img/bliss-bg.jpg' },
      { type: 'image', label: 'meadow.jpg', icon: '../assets/icons/jpg-file.png', src: 'assets/img/9owhc7wuc65b1.jpg' },
    ],
  },
  'local-disk-c': {
    title: 'Local Disk (C:)',
    icon: '../assets/icons/local-disk.png',
    parent: 'my-computer',
    description: 'Local Disk',
    items: [
      { type: 'folder', key: 'my-documents', label: 'Documents and Settings', icon: '../assets/icons/folder.png' },
      { type: 'file', label: 'boot.ini', icon: '../assets/icons/notepad.png', disabled: true },
    ],
  },
};

let pictureViewerEl = null;
let slideshowTimer = null;

function stopSlideshow() {
  if (slideshowTimer) {
    clearInterval(slideshowTimer);
    slideshowTimer = null;
  }
}

function startSlideshow(folderKey) {
  const images = EXPLORER_FOLDERS[folderKey].items.filter(item => item.type === 'image');
  if (!images.length) return;
  stopSlideshow();
  let i = 0;
  openPictureViewer(images[i].src, images[i].label);
  slideshowTimer = setInterval(() => {
    i = (i + 1) % images.length;
    openPictureViewer(images[i].src, images[i].label);
  }, 2500);
}

function closePictureViewer() {
  stopSlideshow();
  pictureViewerEl?.classList.remove('open');
}

function openPictureViewer(src, label) {
  if (!pictureViewerEl) {
    pictureViewerEl = document.createElement('div');
    pictureViewerEl.className = 'picture-viewer';
    pictureViewerEl.innerHTML = `
      <div class="picture-viewer__dialog">
        <div class="picture-viewer__titlebar">
          <span class="picture-viewer__title"></span>
          <button type="button" class="picture-viewer__close" aria-label="Close">&times;</button>
        </div>
        <div class="picture-viewer__body">
          <img class="picture-viewer__img" alt="">
        </div>
      </div>
    `;
    document.body.appendChild(pictureViewerEl);
    pictureViewerEl.querySelector('.picture-viewer__close').addEventListener('click', closePictureViewer);
    pictureViewerEl.addEventListener('click', (e) => {
      if (e.target === pictureViewerEl) closePictureViewer();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePictureViewer();
    });
  }
  pictureViewerEl.querySelector('.picture-viewer__title').textContent = label;
  const img = pictureViewerEl.querySelector('.picture-viewer__img');
  img.src = src;
  img.alt = label;
  pictureViewerEl.classList.add('open');
}

const explorerInstances = [];

function refreshExplorerIfOpen(key) {
  explorerInstances.forEach(inst => inst.refreshIfShowing(key));
}

function saveFileToFolder(folderKey, entry) {
  const folder = EXPLORER_FOLDERS[folderKey];
  const extMatch = entry.label.match(/(\.[^.]+)$/);
  const ext = extMatch ? extMatch[0] : '';
  const base = ext ? entry.label.slice(0, -ext.length) : entry.label;
  let label = entry.label;
  let n = 1;
  while (folder.items.some(it => !it.isSaved && it.label.toLowerCase() === label.toLowerCase())) {
    label = `${base} (${n})${ext}`;
    n++;
  }
  entry.label = label;
  entry.isSaved = true;

  const existingIdx = folder.items.findIndex(it => it.isSaved && it.label.toLowerCase() === label.toLowerCase());
  if (existingIdx >= 0) folder.items[existingIdx] = entry;
  else folder.items.push(entry);

  refreshExplorerIfOpen(folderKey);
}

let saveDialogEl = null;
let saveDialogOnSave = null;

function closeSaveDialog() {
  saveDialogEl?.classList.remove('open');
  saveDialogOnSave = null;
}

function openSaveAsDialog({ title = 'Save As', defaultName, fileType, saveInKey = 'my-documents', onSave }) {
  if (!saveDialogEl) {
    saveDialogEl = document.createElement('div');
    saveDialogEl.className = 'save-dialog';
    saveDialogEl.innerHTML = `
      <div class="save-dialog__dialog">
        <div class="save-dialog__titlebar">
          <span class="save-dialog__title"></span>
          <button type="button" class="save-dialog__close" aria-label="Close">&times;</button>
        </div>
        <div class="save-dialog__body">
          <div class="save-dialog__row">
            <label>Save in:</label>
            <div class="save-dialog__savein">
              <span class="save-dialog__savein-icon" aria-hidden="true"></span>
              <span class="save-dialog__savein-label"></span>
            </div>
          </div>
          <div class="save-dialog__filelist"></div>
          <div class="save-dialog__row">
            <label>File name:</label>
            <input type="text" class="save-dialog__filename-input" autocomplete="off">
          </div>
          <div class="save-dialog__row">
            <label>Save as type:</label>
            <div class="save-dialog__filetype"></div>
          </div>
          <div class="save-dialog__actions">
            <button type="button" class="save-dialog__btn save-dialog__btn--save">Save</button>
            <button type="button" class="save-dialog__btn save-dialog__btn--cancel">Cancel</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(saveDialogEl);

    const nameInput = saveDialogEl.querySelector('.save-dialog__filename-input');
    const doSave = () => {
      const name = nameInput.value.trim();
      if (!name) return;
      const callback = saveDialogOnSave;
      closeSaveDialog();
      callback?.(name);
    };

    saveDialogEl.querySelector('.save-dialog__close').addEventListener('click', closeSaveDialog);
    saveDialogEl.querySelector('.save-dialog__btn--cancel').addEventListener('click', closeSaveDialog);
    saveDialogEl.querySelector('.save-dialog__btn--save').addEventListener('click', doSave);
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSave();
    });
    saveDialogEl.addEventListener('click', (e) => {
      if (e.target === saveDialogEl) closeSaveDialog();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && saveDialogEl.classList.contains('open')) closeSaveDialog();
    });
  }

  const targetFolder = EXPLORER_FOLDERS[saveInKey];

  saveDialogEl.querySelector('.save-dialog__title').textContent = title;
  saveDialogEl.querySelector('.save-dialog__filetype').textContent = fileType || '';
  saveDialogEl.querySelector('.save-dialog__savein-label').textContent = targetFolder.title;
  saveDialogEl.querySelector('.save-dialog__savein-icon').style.setProperty('--icon-url', `url('${targetFolder.icon}')`);

  const nameInput = saveDialogEl.querySelector('.save-dialog__filename-input');
  nameInput.value = defaultName;

  const fileListEl = saveDialogEl.querySelector('.save-dialog__filelist');
  fileListEl.innerHTML = targetFolder.items.filter(item => item.type !== 'folder').map(item => {
    const iconUrl = item.icon || '../assets/icons/folder.png';
    return `<button type="button" class="save-dialog__file" data-name="${item.label}">`
      + `<span class="save-dialog__file-icon" style="--icon-url: url('${iconUrl}')" aria-hidden="true"></span>${item.label}</button>`;
  }).join('');
  fileListEl.querySelectorAll('[data-name]').forEach(btn => {
    btn.addEventListener('click', () => {
      nameInput.value = btn.dataset.name;
      nameInput.focus();
    });
  });

  saveDialogOnSave = onSave;
  saveDialogEl.classList.add('open');
  nameInput.focus();
  nameInput.select();
}

function initExplorerWindow(windowId) {
  const win = windowEls[windowId];
  const explorerEl = win?.querySelector('[data-explorer]');
  if (!explorerEl) return;

  const rootKey = explorerEl.dataset.explorerRoot;
  const titleEl = win.querySelector('[data-explorer-title]');
  const addrIconEl = explorerEl.querySelector('[data-explorer-address-icon]');
  const addrTextEl = explorerEl.querySelector('[data-explorer-address-text]');
  const contentEl = explorerEl.querySelector('[data-explorer-content]');
  const sidebarEl = explorerEl.querySelector('[data-explorer-sidebar]');
  const statusEl = explorerEl.querySelector('[data-explorer-status]');
  const backBtn = explorerEl.querySelector('[data-explorer-back]');
  const fwdBtn = explorerEl.querySelector('[data-explorer-forward]');
  const upBtn = explorerEl.querySelector('[data-explorer-up]');

  let history = [rootKey];
  let historyIndex = 0;

  function sidebarSection(title, listHtml) {
    return `<div class="explorer__sidebar-section">
      <button type="button" class="explorer__sidebar-header">
        <span>${title}</span>
        <span class="explorer__sidebar-chevron" aria-hidden="true">&#9650;</span>
      </button>
      <div class="explorer__sidebar-list">${listHtml}</div>
    </div>`;
  }

  function renderSidebar(currentKey) {
    const folder = EXPLORER_FOLDERS[currentKey];
    let html = '';

    if (folder.tasks && folder.tasks.length) {
      const tasksHtml = folder.tasks.map((task, i) => {
        return `<button type="button" class="explorer__sidebar-link" data-task="${i}" ${task.disabled ? 'disabled' : ''}>`
          + `<span class="explorer__sidebar-link-icon" style="--icon-url: url('${task.icon}')" aria-hidden="true"></span>${task.label}</button>`;
      }).join('');
      html += sidebarSection('System Tasks', tasksHtml);
    }

    const others = Object.keys(EXPLORER_FOLDERS)
      .filter(key => key !== currentKey && key !== 'local-disk-c');
    const placesHtml = others.map(key => {
      const f = EXPLORER_FOLDERS[key];
      return `<button type="button" class="explorer__sidebar-link" data-goto="${key}">`
        + `<span class="explorer__sidebar-link-icon" style="--icon-url: url('${f.icon}')" aria-hidden="true"></span>${f.title}</button>`;
    }).join('');
    html += sidebarSection('Other Places', placesHtml);

    const detailsHtml = `<div class="explorer__sidebar-details">
      <span class="explorer__sidebar-details-icon" style="--icon-url: url('${folder.icon}')" aria-hidden="true"></span>
      <span class="explorer__sidebar-details-text">
        <span class="explorer__sidebar-details-title">${folder.title}</span>
        <span class="explorer__sidebar-details-desc">${folder.description || ''}</span>
      </span>
    </div>`;
    html += sidebarSection('Details', detailsHtml);

    sidebarEl.innerHTML = html;

    sidebarEl.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.goto));
    });
    sidebarEl.querySelectorAll('[data-task]').forEach(btn => {
      btn.addEventListener('click', () => folder.tasks[Number(btn.dataset.task)].action?.());
    });
    sidebarEl.querySelectorAll('.explorer__sidebar-header').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.explorer__sidebar-section').classList.toggle('explorer__sidebar-section--collapsed');
      });
    });
  }

  function render(key) {
    const folder = EXPLORER_FOLDERS[key];
    if (!folder) return;
    if (titleEl) titleEl.textContent = folder.title;
    if (addrTextEl) addrTextEl.textContent = folder.title;
    if (addrIconEl) addrIconEl.style.setProperty('--icon-url', `url('${folder.icon}')`);

    contentEl.innerHTML = '';
    folder.items.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'explorer__item';
      if (item.disabled) btn.disabled = true;
      const iconUrl = item.icon || (item.type === 'image' ? '../assets/icons/jpg-file.png' : '../assets/icons/folder.png');
      btn.innerHTML = `<span class="explorer__item-icon" style="--icon-url: url('${iconUrl}')" aria-hidden="true"></span>`
        + `<span class="explorer__item-label">${item.label}</span>`;
      btn.addEventListener('click', () => {
        contentEl.querySelectorAll('.explorer__item--selected').forEach(b => b.classList.remove('explorer__item--selected'));
        btn.classList.add('explorer__item--selected');
        if (item.type === 'folder') navigate(item.key);
        else if (item.type === 'image') openPictureViewer(item.src, item.label);
        else if (item.action) item.action();
      });
      contentEl.appendChild(btn);
    });

    if (statusEl) statusEl.textContent = `${folder.items.length} object${folder.items.length === 1 ? '' : 's'}`;
    if (backBtn) backBtn.disabled = historyIndex <= 0;
    if (fwdBtn) fwdBtn.disabled = historyIndex >= history.length - 1;
    if (upBtn) upBtn.disabled = !folder.parent;
    renderSidebar(key);
  }

  function navigate(key) {
    history = history.slice(0, historyIndex + 1);
    history.push(key);
    historyIndex = history.length - 1;
    render(key);
  }

  backBtn?.addEventListener('click', () => {
    if (historyIndex <= 0) return;
    historyIndex--;
    render(history[historyIndex]);
  });
  fwdBtn?.addEventListener('click', () => {
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    render(history[historyIndex]);
  });
  upBtn?.addEventListener('click', () => {
    const folder = EXPLORER_FOLDERS[history[historyIndex]];
    if (folder?.parent) navigate(folder.parent);
  });

  render(rootKey);

  explorerInstances.push({
    refreshIfShowing(key) {
      if (history[historyIndex] === key) render(key);
    },
  });
}

['my-computer', 'my-documents', 'my-pictures'].forEach(initExplorerWindow);

// --- Calculator App ---
const calculator = document.getElementById('calculator');

if (calculator) {
  const calcDisplay = document.getElementById('calculator-display');
  const MAX_DIGITS = 15;

  let currentOperand = '0';
  let previousOperand = null;
  let operator = null;
  let overwrite = true;
  let errorState = false;

  function updateCalcDisplay() {
    calcDisplay.textContent = errorState ? 'Error' : currentOperand;
  }

  function resetCalculator() {
    currentOperand = '0';
    previousOperand = null;
    operator = null;
    overwrite = true;
    errorState = false;
    updateCalcDisplay();
  }

  function computeResult(a, b, op) {
    const x = parseFloat(a);
    const y = parseFloat(b);
    let result;
    switch (op) {
      case '+': result = x + y; break;
      case '−': result = x - y; break;
      case '×': result = x * y; break;
      case '÷':
        if (y === 0) return null;
        result = x / y;
        break;
      default: return null;
    }
    return parseFloat(result.toPrecision(12));
  }

  function inputDigit(digit) {
    if (errorState) return;
    if (overwrite) {
      currentOperand = digit;
      overwrite = false;
    } else if (currentOperand.replace('-', '').length < MAX_DIGITS) {
      currentOperand = currentOperand === '0' ? digit : currentOperand + digit;
    }
    updateCalcDisplay();
  }

  function inputDecimal() {
    if (errorState) return;
    if (overwrite) {
      currentOperand = '0.';
      overwrite = false;
    } else if (!currentOperand.includes('.')) {
      currentOperand += '.';
    }
    updateCalcDisplay();
  }

  function inputOperator(nextOperator) {
    if (errorState) return;
    if (operator !== null && !overwrite) {
      const result = computeResult(previousOperand, currentOperand, operator);
      if (result === null) {
        errorState = true;
        updateCalcDisplay();
        return;
      }
      previousOperand = String(result);
      currentOperand = String(result);
    } else {
      previousOperand = currentOperand;
    }
    operator = nextOperator;
    overwrite = true;
  }

  function inputEquals() {
    if (errorState || operator === null) return;
    const result = computeResult(previousOperand, currentOperand, operator);
    if (result === null) {
      errorState = true;
      updateCalcDisplay();
      return;
    }
    currentOperand = String(result);
    previousOperand = null;
    operator = null;
    overwrite = true;
    updateCalcDisplay();
  }

  calculator.querySelectorAll('[data-calc-digit]').forEach(btn => {
    btn.addEventListener('click', () => inputDigit(btn.dataset.calcDigit));
  });
  calculator.querySelectorAll('[data-calc-op]').forEach(btn => {
    btn.addEventListener('click', () => inputOperator(btn.dataset.calcOp));
  });
  calculator.querySelector('[data-calc-decimal]')?.addEventListener('click', inputDecimal);
  calculator.querySelector('[data-calc-equals]')?.addEventListener('click', inputEquals);
  calculator.querySelector('[data-calc-clear]')?.addEventListener('click', resetCalculator);
}

// --- Paint App ---
const paintCanvas = document.getElementById('paint-canvas');

if (paintCanvas) {
  const paintWrap = paintCanvas.closest('.paint__canvas-wrap');
  const paintOverlay = document.getElementById('paint-overlay');
  const paintCtx = paintCanvas.getContext('2d');
  const overlayCtx = paintOverlay.getContext('2d');
  const paintClearBtn = document.getElementById('paint-clear');
  const paintCurrentColor = document.getElementById('paint-current-color');
  const paintCanvasSize = document.getElementById('paint-canvas-size');
  const paintToolButtons = document.querySelectorAll('.paint__tool');
  const paintMenubar = document.getElementById('paint-menubar');
  const paintColorPicker = document.getElementById('paint-color-picker');

  let paintColor = '#000000';
  let activeTool = 'pencil';
  let dropperReturnTool = null;
  let drawing = false;
  let shapeStart = null;
  let zoomIndex = 0;
  const zoomSteps = [1, 1.5, 2, 3];
  const undoStack = [];

  let selection = null; // { canvas, x, y, w, h }
  let selDragMode = 'none'; // 'none' | 'marquee' | 'move'
  let marqueeStart = null;
  let marqueePoints = null;
  let moveGrab = null;

  let polygonPoints = [];
  let curveStage = 0;
  let curveStart = null;
  let curveEnd = null;
  let curveBend1 = null;

  let textInput = null;
  let textPos = null;

  function clearOverlay() {
    overlayCtx.clearRect(0, 0, paintOverlay.width, paintOverlay.height);
  }

  function pushUndo() {
    undoStack.push(paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height));
    if (undoStack.length > 25) undoStack.shift();
  }

  function undo() {
    if (!undoStack.length) return;
    resetInteractionState();
    paintCtx.putImageData(undoStack.pop(), 0, 0);
  }

  function applyZoom(scale) {
    const idx = zoomSteps.indexOf(scale);
    zoomIndex = idx >= 0 ? idx : 0;
    paintCanvas.style.transform = scale === 1 ? '' : `scale(${scale})`;
    paintCanvas.style.transformOrigin = '0 0';
    paintOverlay.style.transform = paintCanvas.style.transform;
    paintOverlay.style.transformOrigin = '0 0';
  }

  function resizeCanvas() {
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

  new ResizeObserver(resizeCanvas).observe(paintWrap);

  function getPos(e) {
    const rect = paintOverlay.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width * paintCanvas.width,
      y: (e.clientY - rect.top) / rect.height * paintCanvas.height,
    };
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function setPaintColor(hex) {
    paintColor = hex;
    if (paintCurrentColor) paintCurrentColor.style.background = paintColor;
  }

  function commitSelection() {
    if (!selection) return;
    paintCtx.drawImage(selection.canvas, selection.x, selection.y);
    selection = null;
    clearOverlay();
  }

  function commitTextInput() {
    if (!textInput) return;
    const value = textInput.value;
    if (value && textPos) {
      pushUndo();
      paintCtx.font = '20px sans-serif';
      paintCtx.fillStyle = paintColor;
      paintCtx.textBaseline = 'top';
      paintCtx.fillText(value, textPos.x, textPos.y);
    }
    textInput.remove();
    textInput = null;
    textPos = null;
  }

  function resetInteractionState() {
    commitSelection();
    commitTextInput();
    polygonPoints = [];
    curveStage = 0;
    curveStart = null;
    curveEnd = null;
    curveBend1 = null;
    selDragMode = 'none';
    marqueeStart = null;
    marqueePoints = null;
    clearOverlay();
  }

  function selectTool(name) {
    if (name === activeTool) return;
    resetInteractionState();
    activeTool = name;
    paintToolButtons.forEach(btn => {
      const isActive = btn.dataset.paintTool === name;
      btn.classList.toggle('paint__tool--active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    paintOverlay.style.cursor = name === 'text' ? 'text' : name === 'zoom' ? 'zoom-in' : 'crosshair';
  }

  paintToolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.paintTool;
      if (!name) return;
      if (name === 'dropper' && activeTool !== 'dropper') dropperReturnTool = activeTool;
      selectTool(name);
    });
  });

  // --- Freehand tools (pencil, brush, eraser, airbrush) ---
  function strokeConfig(tool) {
    if (tool === 'brush') return { width: 6, color: paintColor, cap: 'round' };
    if (tool === 'eraser') return { width: 14, color: '#ffffff', cap: 'square' };
    return { width: 2, color: paintColor, cap: 'round' };
  }

  function airbrushSpray(x, y) {
    paintCtx.fillStyle = paintColor;
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 8;
      paintCtx.fillRect(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 1, 1);
    }
  }

  // --- Shape preview / commit ---
  function drawShape(ctx, tool, x0, y0, x1, y1) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = paintColor;
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
  function floodFill(startX, startY, hexColor) {
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
  function startTextInput(e) {
    commitTextInput();
    const wrapRect = paintWrap.getBoundingClientRect();
    const screenLeft = e.clientX - wrapRect.left + paintWrap.scrollLeft;
    const screenTop = e.clientY - wrapRect.top + paintWrap.scrollTop;
    textPos = getPos(e);
    textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'paint__text-input';
    textInput.style.left = `${screenLeft}px`;
    textInput.style.top = `${screenTop}px`;
    textInput.style.color = paintColor;
    paintWrap.appendChild(textInput);
    textInput.focus();
    textInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') commitTextInput();
      if (ev.key === 'Escape') { textInput.value = ''; commitTextInput(); }
    });
    textInput.addEventListener('blur', () => commitTextInput());
  }

  // --- Selection tools (select / freeform) ---
  function pointInSelection(pos) {
    return selection && pos.x >= selection.x && pos.x <= selection.x + selection.w &&
      pos.y >= selection.y && pos.y <= selection.y + selection.h;
  }

  function finalizeMarquee(pos) {
    let path, bbox;
    if (activeTool === 'freeform') {
      const pts = marqueePoints;
      if (!pts || pts.length < 3) { marqueePoints = null; clearOverlay(); return; }
      path = new Path2D();
      path.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) path.lineTo(pts[i].x, pts[i].y);
      path.closePath();
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
      bbox = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    } else {
      const x = Math.min(marqueeStart.x, pos.x), y = Math.min(marqueeStart.y, pos.y);
      const w = Math.abs(pos.x - marqueeStart.x), h = Math.abs(pos.y - marqueeStart.y);
      bbox = { x, y, w, h };
      path = new Path2D();
      path.rect(x, y, w, h);
    }
    if (bbox.w < 2 || bbox.h < 2) { marqueePoints = null; marqueeStart = null; clearOverlay(); return; }

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

    selection = { canvas: off, x: bbox.x, y: bbox.y, w: bbox.w, h: bbox.h };
    drawSelectionOverlay();
    marqueeStart = null;
    marqueePoints = null;
  }

  function drawSelectionOverlay() {
    clearOverlay();
    if (!selection) return;
    overlayCtx.drawImage(selection.canvas, selection.x, selection.y);
    overlayCtx.save();
    overlayCtx.setLineDash([4, 3]);
    overlayCtx.strokeStyle = '#000000';
    overlayCtx.lineWidth = 1;
    overlayCtx.strokeRect(selection.x + 0.5, selection.y + 0.5, selection.w, selection.h);
    overlayCtx.restore();
  }

  // --- Polygon tool ---
  function drawPolygonPreview(current) {
    clearOverlay();
    overlayCtx.lineWidth = 2;
    overlayCtx.strokeStyle = paintColor;
    overlayCtx.lineCap = 'round';
    overlayCtx.lineJoin = 'round';
    overlayCtx.beginPath();
    overlayCtx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonPoints.length; i++) overlayCtx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    if (current) overlayCtx.lineTo(current.x, current.y);
    overlayCtx.stroke();
  }

  function finalizePolygon() {
    if (polygonPoints.length < 2) { polygonPoints = []; clearOverlay(); return; }
    pushUndo();
    paintCtx.lineWidth = 2;
    paintCtx.strokeStyle = paintColor;
    paintCtx.lineCap = 'round';
    paintCtx.lineJoin = 'round';
    paintCtx.beginPath();
    paintCtx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonPoints.length; i++) paintCtx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    paintCtx.closePath();
    paintCtx.stroke();
    polygonPoints = [];
    clearOverlay();
  }

  // --- Curve tool (drag for the line, then two clicks to bend it) ---
  function resetCurve() {
    curveStage = 0;
    curveStart = null;
    curveEnd = null;
    curveBend1 = null;
    clearOverlay();
  }

  // --- Pointer handlers ---
  paintOverlay.addEventListener('pointerdown', (e) => {
    const pos = getPos(e);

    if (activeTool === 'text') { startTextInput(e); return; }

    if (activeTool === 'zoom') {
      applyZoom(zoomSteps[(zoomIndex + 1) % zoomSteps.length]);
      return;
    }

    if (activeTool === 'dropper') {
      const d = paintCtx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
      setPaintColor(rgbToHex(d[0], d[1], d[2]));
      if (dropperReturnTool) selectTool(dropperReturnTool);
      return;
    }

    if (activeTool === 'fill') {
      pushUndo();
      floodFill(pos.x, pos.y, paintColor);
      return;
    }

    if (activeTool === 'polygon') {
      polygonPoints.push(pos);
      drawPolygonPreview(null);
      return;
    }

    if (activeTool === 'curve') {
      if (curveStage === 0) {
        curveStart = pos;
        drawing = true;
        curveStage = 1;
        paintOverlay.setPointerCapture(e.pointerId);
      } else if (curveStage === 2) {
        curveBend1 = pos;
        curveStage = 3;
      } else if (curveStage === 3) {
        const bend2 = pos;
        pushUndo();
        paintCtx.lineWidth = 2;
        paintCtx.strokeStyle = paintColor;
        paintCtx.lineCap = 'round';
        paintCtx.beginPath();
        paintCtx.moveTo(curveStart.x, curveStart.y);
        paintCtx.bezierCurveTo(curveBend1.x, curveBend1.y, bend2.x, bend2.y, curveEnd.x, curveEnd.y);
        paintCtx.stroke();
        resetCurve();
      }
      return;
    }

    if (activeTool === 'select' || activeTool === 'freeform') {
      if (selection && pointInSelection(pos)) {
        selDragMode = 'move';
        moveGrab = { dx: pos.x - selection.x, dy: pos.y - selection.y };
      } else {
        commitSelection();
        selDragMode = 'marquee';
        marqueeStart = pos;
        if (activeTool === 'freeform') marqueePoints = [pos];
      }
      paintOverlay.setPointerCapture(e.pointerId);
      drawing = true;
      return;
    }

    if (activeTool === 'line' || activeTool === 'rect' || activeTool === 'rrect' || activeTool === 'ellipse') {
      pushUndo();
      shapeStart = pos;
      drawing = true;
      paintOverlay.setPointerCapture(e.pointerId);
      return;
    }

    // pencil, brush, eraser, airbrush
    pushUndo();
    drawing = true;
    paintOverlay.setPointerCapture(e.pointerId);
    const cfg = strokeConfig(activeTool);
    paintCtx.lineWidth = cfg.width;
    paintCtx.lineCap = cfg.cap;
    paintCtx.lineJoin = 'round';
    paintCtx.strokeStyle = cfg.color;
    paintCtx.beginPath();
    paintCtx.moveTo(pos.x, pos.y);
    if (activeTool === 'airbrush') airbrushSpray(pos.x, pos.y);
  });

  paintOverlay.addEventListener('pointermove', (e) => {
    const pos = getPos(e);

    if (activeTool === 'curve' && curveStart) {
      if (curveStage === 1 && drawing) {
        curveEnd = pos;
        clearOverlay();
        overlayCtx.lineWidth = 2;
        overlayCtx.strokeStyle = paintColor;
        overlayCtx.lineCap = 'round';
        overlayCtx.beginPath();
        overlayCtx.moveTo(curveStart.x, curveStart.y);
        overlayCtx.lineTo(pos.x, pos.y);
        overlayCtx.stroke();
      } else if (curveStage === 2) {
        clearOverlay();
        overlayCtx.lineWidth = 2;
        overlayCtx.strokeStyle = paintColor;
        overlayCtx.lineCap = 'round';
        overlayCtx.beginPath();
        overlayCtx.moveTo(curveStart.x, curveStart.y);
        overlayCtx.quadraticCurveTo(pos.x, pos.y, curveEnd.x, curveEnd.y);
        overlayCtx.stroke();
      } else if (curveStage === 3) {
        clearOverlay();
        overlayCtx.lineWidth = 2;
        overlayCtx.strokeStyle = paintColor;
        overlayCtx.lineCap = 'round';
        overlayCtx.beginPath();
        overlayCtx.moveTo(curveStart.x, curveStart.y);
        overlayCtx.bezierCurveTo(curveBend1.x, curveBend1.y, pos.x, pos.y, curveEnd.x, curveEnd.y);
        overlayCtx.stroke();
      }
      return;
    }

    if (activeTool === 'polygon' && polygonPoints.length) {
      drawPolygonPreview(pos);
      return;
    }

    if (!drawing) return;

    if (activeTool === 'select' || activeTool === 'freeform') {
      if (selDragMode === 'marquee') {
        clearOverlay();
        overlayCtx.save();
        overlayCtx.setLineDash([4, 3]);
        overlayCtx.strokeStyle = '#000000';
        overlayCtx.lineWidth = 1;
        if (activeTool === 'freeform') {
          marqueePoints.push(pos);
          overlayCtx.beginPath();
          overlayCtx.moveTo(marqueePoints[0].x, marqueePoints[0].y);
          for (let i = 1; i < marqueePoints.length; i++) overlayCtx.lineTo(marqueePoints[i].x, marqueePoints[i].y);
          overlayCtx.stroke();
        } else {
          const x = Math.min(marqueeStart.x, pos.x), y = Math.min(marqueeStart.y, pos.y);
          overlayCtx.strokeRect(x + 0.5, y + 0.5, Math.abs(pos.x - marqueeStart.x), Math.abs(pos.y - marqueeStart.y));
        }
        overlayCtx.restore();
      } else if (selDragMode === 'move' && selection) {
        clearOverlay();
        const nx = pos.x - moveGrab.dx, ny = pos.y - moveGrab.dy;
        overlayCtx.drawImage(selection.canvas, nx, ny);
        overlayCtx.save();
        overlayCtx.setLineDash([4, 3]);
        overlayCtx.strokeStyle = '#000000';
        overlayCtx.lineWidth = 1;
        overlayCtx.strokeRect(nx + 0.5, ny + 0.5, selection.w, selection.h);
        overlayCtx.restore();
      }
      return;
    }

    if (activeTool === 'line' || activeTool === 'rect' || activeTool === 'rrect' || activeTool === 'ellipse') {
      clearOverlay();
      drawShape(overlayCtx, activeTool, shapeStart.x, shapeStart.y, pos.x, pos.y);
      return;
    }

    // freehand
    const cfg = strokeConfig(activeTool);
    paintCtx.lineWidth = cfg.width;
    paintCtx.lineCap = cfg.cap;
    paintCtx.lineJoin = 'round';
    paintCtx.strokeStyle = cfg.color;
    if (activeTool === 'airbrush') {
      airbrushSpray(pos.x, pos.y);
    } else {
      paintCtx.lineTo(pos.x, pos.y);
      paintCtx.stroke();
    }
  });

  function stopDrawing(e) {
    if (!drawing) return;
    drawing = false;
    if (paintOverlay.hasPointerCapture(e.pointerId)) paintOverlay.releasePointerCapture(e.pointerId);

    if (activeTool === 'curve') {
      if (curveStage === 1) curveStage = 2;
      return;
    }

    if (activeTool === 'select' || activeTool === 'freeform') {
      const pos = getPos(e);
      if (selDragMode === 'marquee') {
        finalizeMarquee(pos);
      } else if (selDragMode === 'move' && selection) {
        selection.x = pos.x - moveGrab.dx;
        selection.y = pos.y - moveGrab.dy;
        commitSelection();
      }
      selDragMode = 'none';
      return;
    }

    if (activeTool === 'line' || activeTool === 'rect' || activeTool === 'rrect' || activeTool === 'ellipse') {
      const pos = getPos(e);
      clearOverlay();
      drawShape(paintCtx, activeTool, shapeStart.x, shapeStart.y, pos.x, pos.y);
      shapeStart = null;
    }
  }

  paintOverlay.addEventListener('pointerup', stopDrawing);
  paintOverlay.addEventListener('pointercancel', stopDrawing);

  paintOverlay.addEventListener('dblclick', () => {
    if (activeTool === 'polygon') finalizePolygon();
  });

  document.querySelectorAll('.paint__swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      setPaintColor(swatch.dataset.paintColor);
      document.querySelectorAll('.paint__swatch').forEach(s => s.classList.remove('paint__swatch--active'));
      swatch.classList.add('paint__swatch--active');
    });
  });

  function clearCanvas() {
    resetInteractionState();
    pushUndo();
    applyZoom(1);
    paintCtx.fillStyle = '#ffffff';
    paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
  }

  paintClearBtn?.addEventListener('click', clearCanvas);

  function savePaintImage() {
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

  function selectAll() {
    resetInteractionState();
    pushUndo();
    if (activeTool !== 'select' && activeTool !== 'freeform') selectTool('select');
    const w = paintCanvas.width, h = paintCanvas.height;
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    off.getContext('2d').drawImage(paintCanvas, 0, 0);
    paintCtx.fillStyle = '#ffffff';
    paintCtx.fillRect(0, 0, w, h);
    selection = { canvas: off, x: 0, y: 0, w, h };
    drawSelectionOverlay();
  }

  function withSnapshot(mutate) {
    pushUndo();
    const snapshot = document.createElement('canvas');
    snapshot.width = paintCanvas.width;
    snapshot.height = paintCanvas.height;
    snapshot.getContext('2d').drawImage(paintCanvas, 0, 0);
    mutate(snapshot);
  }

  function flipHorizontal() {
    withSnapshot((snapshot) => {
      paintCtx.save();
      paintCtx.translate(paintCanvas.width, 0);
      paintCtx.scale(-1, 1);
      paintCtx.drawImage(snapshot, 0, 0);
      paintCtx.restore();
    });
  }

  function flipVertical() {
    withSnapshot((snapshot) => {
      paintCtx.save();
      paintCtx.translate(0, paintCanvas.height);
      paintCtx.scale(1, -1);
      paintCtx.drawImage(snapshot, 0, 0);
      paintCtx.restore();
    });
  }

  function rotate90() {
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

  function invertColors() {
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

  // --- Menu bar ---
  if (paintMenubar) {
    const paintMenuItems = paintMenubar.querySelectorAll('[data-paint-menu]');
    let openPaintMenu = null;

    function closeAllPaintMenus() {
      paintMenubar.querySelectorAll('.paint__menu-dropdown.open').forEach(d => d.classList.remove('open'));
      paintMenuItems.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
      openPaintMenu = null;
    }

    function openPaintMenuFor(name) {
      closeAllPaintMenus();
      const dropdown = paintMenubar.querySelector(`[data-paint-dropdown="${name}"]`);
      const btn = paintMenubar.querySelector(`[data-paint-menu="${name}"]`);
      if (!dropdown || !btn) return;
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      openPaintMenu = name;
    }

    paintMenuItems.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.paintMenu;
        if (openPaintMenu === name) closeAllPaintMenus();
        else openPaintMenuFor(name);
      });
      btn.addEventListener('mouseenter', () => {
        if (openPaintMenu && openPaintMenu !== btn.dataset.paintMenu) openPaintMenuFor(btn.dataset.paintMenu);
      });
    });

    paintMenubar.querySelectorAll('[data-paint-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.paintAction;
        closeAllPaintMenus();
        switch (action) {
          case 'new':
          case 'clear-image':
            clearCanvas();
            break;
          case 'save':
            savePaintImage();
            break;
          case 'exit':
            closeWindow('paint');
            break;
          case 'undo':
            undo();
            break;
          case 'select-all':
            selectAll();
            break;
          case 'zoom-100':
            applyZoom(1);
            break;
          case 'zoom-150':
            applyZoom(1.5);
            break;
          case 'zoom-200':
            applyZoom(2);
            break;
          case 'zoom-300':
            applyZoom(3);
            break;
          case 'flip-h':
            flipHorizontal();
            break;
          case 'flip-v':
            flipVertical();
            break;
          case 'rotate':
            rotate90();
            break;
          case 'invert':
            invertColors();
            break;
          case 'edit-colors':
            paintColorPicker?.click();
            break;
          case 'about':
            alert('MS Paint — Lightweight Edition\n\nA small real Paint clone built for this desktop.\n\nDraw, fill, select, and save, right from the browser.');
            break;
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (openPaintMenu && !paintMenubar.contains(e.target)) closeAllPaintMenus();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && openPaintMenu) closeAllPaintMenus();
    });

    paintColorPicker?.addEventListener('input', () => {
      setPaintColor(paintColorPicker.value);
      document.querySelectorAll('.paint__swatch').forEach(s => s.classList.remove('paint__swatch--active'));
    });
  }
}

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
      desc: 'A 911 operator co-pilot. The system pairs a Next.js dashboard with a FastAPI inference service that transcribes audio, classifies incidents, geocodes caller locations, and lets dispatchers confirm markers or request field units.',
      award: 'Marina Hack 5.0 • Best Overall',
      tags: ['Pytorch', 'WhisperSTT', 'Google Geocoding API', 'Gemini', 'Next.js', 'FastAPI'],
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
