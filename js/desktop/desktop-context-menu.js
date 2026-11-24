// Desktop right-click context menu — item array + stub actions.

import { openContextMenu, closeContextMenu, registerContextAction } from './context-menu.js';
import { closeStartMenu } from './start-menu.js';
import { isMobile } from '../utils.js';

// ── stub actions ───────────────────────────────────────
function viewIcons() {
  // TODO: re-render .desktop__icons with 48px icons; persist in localStorage
}
function viewList() {
  // TODO: re-render .desktop__icons as a vertical list; persist in localStorage
}
function viewDetails() {
  // TODO: re-render .desktop__icons with columns (name, size, type, date); persist in localStorage
}
function sortName() {
  // TODO: sort desktop icons alphabetically by label; persist in localStorage
}
function sortType() {
  // TODO: sort desktop icons by file/type extension; persist in localStorage
}
function sortModified() {
  // TODO: sort desktop icons by last-modified timestamp; persist in localStorage
}
function refresh() {
  // TODO: re-read desktop items from filesystem/virtual store and re-render
}
function newFolder() {
  // TODO: prompt for folder name; create virtual folder; re-render desktop icons
}
function newShortcut() {
  // TODO: prompt for target URL/path; create virtual shortcut icon
}
function newTextDocument() {
  // TODO: create a .txt file in virtual filesystem; open it in Notepad
}

// ── register actions ───────────────────────────────────
registerContextAction('view-icons',    viewIcons);
registerContextAction('view-list',     viewList);
registerContextAction('view-details',  viewDetails);
registerContextAction('sort-name',     sortName);
registerContextAction('sort-type',     sortType);
registerContextAction('sort-modified', sortModified);
registerContextAction('refresh',       refresh);
registerContextAction('new-folder',    newFolder);
registerContextAction('new-shortcut',  newShortcut);
registerContextAction('new-text-document', newTextDocument);

// ── menu item array ────────────────────────────────────
// null = divider; item with submenu = parent (no id); item with id = leaf
const DESKTOP_MENU = [
  {
    label: 'View',
    submenu: [
      { id: 'view-icons', label: 'Icons' },
      { id: 'view-list',  label: 'List' },
      { id: 'view-details', label: 'Details' },
    ],
  },
  {
    label: 'Sort By',
    submenu: [
      { id: 'sort-name',     label: 'Name' },
      { id: 'sort-type',     label: 'Type' },
      { id: 'sort-modified', label: 'Modified' },
    ],
  },
  null, // divider
  { id: 'refresh', label: 'Refresh' },
  null, // divider
  {
    label: 'New',
    submenu: [
      { id: 'new-folder',    label: 'Folder' },
      { id: 'new-shortcut',  label: 'Shortcut' },
      { id: 'new-text-document', label: 'Text Document' },
    ],
  },
];

// ── init ───────────────────────────────────────────────
export function initDesktopContextMenu() {
  const desktop = document.getElementById('desktop');
  if (!desktop) return;

  desktop.addEventListener('contextmenu', e => {
    if (isMobile()) return;
    // Reserved seam: right-clicking a desktop icon does nothing
    if (e.target.closest('.desktop-icon')) return;
    e.preventDefault();
    closeStartMenu();
    openContextMenu({ x: e.clientX, y: e.clientY, items: DESKTOP_MENU, target: 'desktop' });
  });
}
