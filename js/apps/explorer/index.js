// File Explorer windows (My Computer / My Documents / My Pictures): navigation,
// sidebar task pane, history, plus saveFileToFolder() used by Notepad/Paint.

import { escapeHtml } from '../../utils.js';
import { windowEls } from '../../desktop/window-manager.js';
import { EXPLORER_FOLDERS } from './folders.js';
import { openPictureViewer } from './picture-viewer.js';

const explorerInstances = [];

function refreshExplorerIfOpen(key) {
  explorerInstances.forEach(inst => inst.refreshIfShowing(key));
}

export function saveFileToFolder(folderKey, entry) {
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
    if (addrTextEl) addrTextEl.textContent = folder.path || folder.title;
    if (addrIconEl) addrIconEl.style.setProperty('--icon-url', `url('${folder.icon}')`);

    contentEl.innerHTML = '';
    folder.items.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'explorer__item';
      if (item.disabled) btn.disabled = true;
      const iconUrl = item.icon || (item.type === 'image' ? '../assets/icons/jpg-file.png' : '../assets/icons/folder.png');
      btn.innerHTML = `<span class="explorer__item-icon" style="--icon-url: url('${iconUrl}')" aria-hidden="true"></span>`
        + `<span class="explorer__item-label">${escapeHtml(item.label)}</span>`;
      // XP semantics: single click only selects; double click opens (folders,
      // images, files with an action). Disabled items never fire either event.
      btn.addEventListener('click', () => {
        contentEl.querySelectorAll('.explorer__item--selected').forEach(b => b.classList.remove('explorer__item--selected'));
        btn.classList.add('explorer__item--selected');
      });
      btn.addEventListener('dblclick', () => {
        if (item.type === 'folder') navigate(item.key);
        else if (item.type === 'image') openPictureViewer(item.src, item.label);
        else if (item.action) item.action();
      });
      contentEl.appendChild(btn);
    });

    if (statusEl) statusEl.textContent = `${folder.items.length} object${folder.items.length === 1 ? '' : 's'}`;
    if (backBtn) backBtn.disabled = historyIndex <= 0;
    if (fwdBtn) fwdBtn.disabled = historyIndex >= history.length - 1;
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

  // Clicking blank space in the content area clears the selection, like XP.
  // Attached once to contentEl (which survives re-renders), not per item.
  contentEl.addEventListener('click', (e) => {
    if (!e.target.closest('.explorer__item')) {
      contentEl.querySelectorAll('.explorer__item--selected').forEach(b => b.classList.remove('explorer__item--selected'));
    }
  });

  // Closing (X button) resets navigation history; minimizing does not.
  win.addEventListener('windowclosed', () => {
    history = [rootKey];
    historyIndex = 0;
    render(rootKey);
  });

  render(rootKey);

  explorerInstances.push({
    refreshIfShowing(key) {
      if (history[historyIndex] === key) render(key);
    },
  });
}

export function initExplorer() {
  ['my-computer', 'my-documents', 'my-pictures'].forEach(initExplorerWindow);
}
