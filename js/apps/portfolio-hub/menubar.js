// Portfolio Hub menu bar (File / Edit / View / Favorites / Tools / Help).

import { escapeHtml } from '../../utils.js';
import { closeWindow, toggleOrFocusWindow } from '../../desktop/window-manager.js';
import { projectLinks, RESUME_PDF, GITHUB, LINKEDIN, projects } from './shared.js';

export function initHubMenubar(hubWin) {
  const menubar = document.getElementById('hub-menubar');
  const statusEl = document.getElementById('hub-status');
  const EMAIL = 'ki3n98@gmail.com';
  const defaultStatus = statusEl ? statusEl.innerHTML : '';
  let statusTimer = null;
  const flashStatus = (msg) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { statusEl.innerHTML = defaultStatus; }, 3000);
  };
  const copyText = (text, what) => {
    // Synchronous copy works inside the click gesture everywhere; async API is the fallback.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    if (ok) { flashStatus(`${what} copied to clipboard: ${text}`); return; }
    flashStatus(`${what}: ${text}`); // visible even if the async copy never settles
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => flashStatus(`${what} copied to clipboard: ${text}`),
        () => flashStatus(`${what}: ${text}`));
    } else flashStatus(`${what}: ${text}`);
  };
  const openExternal = (url) => window.open(url, '_blank', 'noopener,noreferrer');
  const hubContent = document.getElementById('hub-content');
  const scrollToGroup = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top - hubContent.getBoundingClientRect().top + hubContent.scrollTop - 12;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    hubContent.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  };

  // Favorites = every external project link, grouped by project
  const favorites = projects.flatMap(p => projectLinks(p)
    .filter(([href]) => /^https?:/.test(href))
    .map(([href, label]) => [`${p.title} — ${label.replace(/\s*→$/, '')}`, href]));

  // [label, action] items; null = divider. Actions: open:<window>, url:<href>, or a named action.
  const MENUS = {
    File: [
      ['View Resume', 'open:resume'],
      ['Download Resume', 'download-resume'],
      null,
      ['Close', 'close'],
    ],
    Edit: [
      ['Copy Email Address', 'copy-email'],
      ['Copy Link to Portfolio', 'copy-link'],
    ],
    View: [
      ['Experience', 'goto:hub-exp-heading'],
      ['Projects', 'goto:hub-proj-heading'],
      ['Skills', 'goto:hub-skills-heading'],
      null,
      ['Task Pane', 'toggle-sidebar', 'checkable'],
      ['Status Bar', 'toggle-status', 'checkable'],
    ],
    Favorites: [
      ['GitHub', `url:${GITHUB}`],
      ['LinkedIn', `url:${LINKEDIN}`],
      null,
      ...favorites.map(([label, href]) => [label, `url:${href}`]),
    ],
    Tools: [
      ['Gradient Descent.exe', 'open:projects'],
      ['Paint', 'open:paint'],
      ['Notepad', 'open:notepad'],
      ['Calculator', 'open:calculator'],
      ['My Documents', 'open:my-documents'],
    ],
    Help: [
      ['About Kien Pham', 'open:hero'],
      ['Experience Window', 'open:experience'],
      null,
      ['Contact Me', 'open:contact'],
    ],
  };

  menubar.innerHTML = Object.entries(MENUS).map(([name, items]) => `
    <div class="notepad__menu">
      <button type="button" class="notepad__menu-item" data-hub-menu="${name}" aria-haspopup="true" aria-expanded="false">${name}</button>
      <div class="notepad__menu-dropdown" data-hub-dropdown="${name}" role="menu">
        ${items.map(it => it
          ? `<button type="button" role="menuitem" class="notepad__menu-option${it[2] ? ' notepad__menu-option--checked' : ''}" data-hub-action="${escapeHtml(it[1])}">${escapeHtml(it[0])}</button>`
          : '<div class="notepad__menu-divider"></div>').join('')}
      </div>
    </div>`).join('');

  let openMenu = null;
  const closeMenus = () => {
    menubar.querySelectorAll('.notepad__menu-dropdown.open').forEach(d => d.classList.remove('open'));
    menubar.querySelectorAll('[data-hub-menu]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    openMenu = null;
  };
  const openMenuFor = (name) => {
    closeMenus();
    menubar.querySelector(`[data-hub-dropdown="${name}"]`).classList.add('open');
    menubar.querySelector(`[data-hub-menu="${name}"]`).setAttribute('aria-expanded', 'true');
    openMenu = name;
  };

  const runAction = (action, btn) => {
    const [kind, arg] = action.split(/:(.*)/s);
    switch (kind) {
      case 'open': toggleOrFocusWindow(arg); break;
      case 'url': openExternal(arg); break;
      case 'goto': scrollToGroup(arg); break;
      case 'download-resume': {
        const a = document.createElement('a');
        a.href = RESUME_PDF; a.download = '';
        document.body.appendChild(a); a.click(); a.remove();
        break;
      }
      case 'close': closeWindow('portfolio'); break;
      case 'copy-email': copyText(EMAIL, 'Email address'); break;
      case 'copy-link': copyText(location.href.split('#')[0], 'Portfolio link'); break;
      case 'toggle-sidebar':
        btn.classList.toggle('notepad__menu-option--checked',
          !hubWin.querySelector('.hub').classList.toggle('hub--no-sidebar'));
        break;
      case 'toggle-status':
        btn.classList.toggle('notepad__menu-option--checked',
          !hubWin.querySelector('.hub').classList.toggle('hub--no-status'));
        break;
    }
  };

  menubar.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = e.target.closest('[data-hub-menu]');
    if (item) {
      const name = item.dataset.hubMenu;
      if (openMenu === name) closeMenus(); else openMenuFor(name);
      return;
    }
    const opt = e.target.closest('[data-hub-action]');
    if (opt) { closeMenus(); runAction(opt.dataset.hubAction, opt); }
  });
  menubar.addEventListener('mouseover', (e) => {
    const item = e.target.closest('[data-hub-menu]');
    if (item && openMenu && openMenu !== item.dataset.hubMenu) openMenuFor(item.dataset.hubMenu);
  });
  document.addEventListener('click', (e) => {
    if (openMenu && !menubar.contains(e.target)) closeMenus();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !openMenu) return;
    e.stopImmediatePropagation(); // Esc closes the menu, not the window
    closeMenus();
  }, true);
}
