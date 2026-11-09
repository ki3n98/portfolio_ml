// Notepad app: menu bar (File/Edit/Format/View/Help), status bar, Save As into My Documents.

import { closeWindow, toggleOrFocusWindow } from '../desktop/window-manager.js';
import { openSaveAsDialog } from './explorer/save-dialog.js';
import { saveFileToFolder } from './explorer/index.js';

export function initNotepad() {
  const notepadTextarea = document.getElementById('notepad-textarea');
  const notepadMenubar = document.getElementById('notepad-menubar');
  if (!notepadTextarea || !notepadMenubar) return;

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
          alert('Notepad — Lightweight Edition\n\nA small text editor I built for this desktop.\n\nText does not persist across page reloads.');
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
