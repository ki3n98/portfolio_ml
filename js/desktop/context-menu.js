// Context-menu engine — target-agnostic.
// Desktop spec builds the item array and wires action stubs;
// openContextMenu() receives them and handles every interaction detail.

import { escapeHtml } from '../utils.js';

/* ── public API ────────────────────────────────── */
let registry = {};

export function registerContextAction(id, fn) {
  registry[id] = fn;
}

export function openContextMenu({ x, y, items, target }) {
  closeContextMenu();
  const menu = createMenu(items, target || 'Menu');
  document.body.appendChild(menu);
  positionRoot(menu, x, y);
  bindInteractions(menu, items);
}

export function closeContextMenu() {
  // Reset submenu state so next open starts clean
  openSubEl?.remove();
  openSubEl = null;
  keptOpenId  = null;
  const m = document.getElementById('context-menu');
  if (!m) return;
  if (m._ctxClose)    document.removeEventListener('mousedown', m._ctxClose);
  if (m._ctxEsc)      window.removeEventListener('keydown', m._ctxEsc, { capture: true });
  if (m._ctxResize)   window.removeEventListener('resize', m._ctxResize);
  if (m._ctxMenuLeave) m.removeEventListener('mouseleave', m._ctxMenuLeave);
  if (m.parentNode) m.remove();
}

export function isContextMenuOpen() {
  return document.getElementById('context-menu') !== null;
}

/* ── DOM helpers ───────────────────────────────── */
function makeItemDOM(item) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'context-menu__item';
  btn.setAttribute('role', 'menuitem');
  btn.innerHTML = escapeHtml(item.label);

  if (item.disabled) {
    btn.classList.add('context-menu__item--disabled');
    btn.setAttribute('aria-disabled', 'true');
    btn.disabled = true;
  }
  if (item.submenu) {
    btn.classList.add('context-menu__item--parent');
    btn.setAttribute('aria-haspopup', 'true');
    const arrow = document.createElement('span');
    arrow.className = 'context-menu__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '\u25B6';
    btn.appendChild(arrow);
    btn.dataset.submenu = JSON.stringify(item.submenu);
    btn.dataset.parentFor = item.label; // unique key for parent → submenu
  } else {
    btn.dataset.menuId = item.id;
  }
  return btn;
}

function createMenu(items, ariaLabel) {
  const menu = document.createElement('div');
  menu.id = 'context-menu';
  menu.className = 'context-menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', ariaLabel);

  items.forEach(item => {
    if (item === null) {
      const d = document.createElement('div');
      d.className = 'context-menu__divider';
      d.setAttribute('role', 'separator');
      menu.appendChild(d);
    } else {
      menu.appendChild(makeItemDOM(item));
    }
  });
  return menu;
}

/* ── positioning ───────────────────────────────── */
function positionRoot(el, x, y) {
  const w = el.offsetWidth, h = el.offsetHeight;
  const maxX = innerWidth  - w - 2, maxY = innerHeight - h - 2;
  el.style.left = `${Math.max(2, Math.min(x, maxX))}px`;
  el.style.top  = `${Math.max(2, Math.min(y, maxY))}px`;
}

function positionSubmenu(sub, parentEl) {
  const pr = parentEl.getBoundingClientRect();
  let left = pr.right - 2;
  if (left + sub.offsetWidth > innerWidth - 2) {
    left = pr.left - sub.offsetWidth + 2;
  }
  let top = pr.top - 2;
  if (top + sub.offsetHeight > innerHeight - 2) {
    top = innerHeight - sub.offsetHeight - 2;
  }
  sub.style.left = `${left}px`;
  sub.style.top  = `${Math.max(2, top)}px`;
}

/* ── interaction ───────────────────────────────── */
let hoverTimer = null, hoverTargetId = null;
let openSubEl   = null;
let keptOpenId  = null;

function buildSubmenu(parentId, data, parentEl) {
  const sub = document.createElement('div');
  sub.className = 'context-menu context-menu--submenu';
  sub.id = 'context-submenu';
  sub.setAttribute('role', 'menu');
  sub.dataset.submenuFor = parentId;

  data.forEach(item => {
    if (item === null) {
      const d = document.createElement('div');
      d.className = 'context-menu__divider';
      d.setAttribute('role', 'separator');
      sub.appendChild(d);
    } else {
      sub.appendChild(makeItemDOM(item));
    }
  });

  document.body.appendChild(sub);
  positionSubmenu(sub, parentEl);
  return sub;
}

function closeSubmenu() {
  openSubEl?.remove();
  openSubEl = null;
  keptOpenId = null;
}

function bindInteractions(menu, items) {
  const parentBtns = menu.querySelectorAll('.context-menu__item--parent');

  parentBtns.forEach(btn => {
    const pid  = btn.dataset.parentFor;
    const data = JSON.parse(btn.dataset.submenu);

    // ── click: toggle / reopen ────────────────
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (openSubEl && openSubEl.dataset.submenuFor === pid) {
        closeSubmenu();
      } else if (keptOpenId === pid) {
        closeSubmenu();
        openSubEl   = buildSubmenu(pid, data, btn);
        keptOpenId  = pid;
      } else {
        openSubEl?.remove();
        openSubEl   = buildSubmenu(pid, data, btn);
        keptOpenId  = pid;
      }
    });

    // ── hover: open after ~150 ms ─────────────
    btn.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimer);
      // Already open for this parent?
      if (openSubEl?.dataset.submenuFor === pid) return;
      // Switching from another parent → open immediately
      if (openSubEl && keptOpenId) {
        openSubEl.remove();
        openSubEl   = buildSubmenu(pid, data, btn);
        keptOpenId  = pid;
        return;
      }
      hoverTimer = setTimeout(() => {
        if (openSubEl && openSubEl.dataset.submenuFor !== pid) return;
        if (!openSubEl) {
          openSubEl = buildSubmenu(pid, data, btn);
          keptOpenId = null;
        }
      }, 150);
      hoverTargetId = pid;
    });

    // ── leave parent: close if hover-opened ───
    btn.addEventListener('mouseleave', e => {
      const rel = e.relatedTarget;
      // Moving into the visible submenu → keep it
      if (rel === openSubEl) return;
      // Moving to another parent → keep it (will be handled by their mouseenter)
      if (rel?.classList?.contains('context-menu__item--parent')) return;
      if (hoverTargetId === pid && keptOpenId !== pid) {
        closeSubmenu();
      }
    });
  });

  // ── leaf click: action → close ──────────────
  menu.querySelectorAll('.context-menu__item:not(.context-menu__item--parent)')
  .forEach(li => {
    li.addEventListener('click', e => {
      e.stopPropagation();
      const fn = registry[li.dataset.menuId];
      if (fn) fn();
      closeContextMenu();
    });
  });

  // ── while inside the whole menu, keep parent highlight ─
  const onMenuLeave = e => {
    if (e.relatedTarget === openSubEl) return;
    if (hoverTargetId && keptOpenId !== hoverTargetId) closeSubmenu();
  };
  menu.addEventListener('mouseleave', onMenuLeave);

  // ── document-level close (any button) ───────
  const docClose = e => {
    const m = document.getElementById('context-menu');
    if (m && !m.contains(e.target)) closeContextMenu();
  };
  document.addEventListener('mousedown', docClose);

  // ── capture-phase Escape ────────────────────
  const capEsc = e => {
    if (e.key !== 'Escape') return;
    e.stopImmediatePropagation();
    closeContextMenu();
  };
  window.addEventListener('keydown', capEsc, { capture: true });

  // ── resize / blur ───────────────────────────
  const onClose = () => closeContextMenu();
  window.addEventListener('resize', onClose);

  // ── store refs for cleanup ──────────────────
  menu._ctxClose   = docClose;
  menu._ctxEsc     = capEsc;
  menu._ctxResize  = onClose;
  menu._ctxMenuLeave = onMenuLeave;
}
