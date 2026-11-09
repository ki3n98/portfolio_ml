// XP-style "Save As" dialog shared by Notepad and Paint.

import { escapeHtml } from '../../utils.js';
import { EXPLORER_FOLDERS } from './folders.js';

let saveDialogEl = null;
let saveDialogOnSave = null;

function closeSaveDialog() {
  saveDialogEl?.classList.remove('open');
  saveDialogOnSave = null;
}

export function openSaveAsDialog({ title = 'Save As', defaultName, fileType, saveInKey = 'my-documents', onSave }) {
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
    return `<button type="button" class="save-dialog__file" data-name="${escapeHtml(item.label)}">`
      + `<span class="save-dialog__file-icon" style="--icon-url: url('${iconUrl}')" aria-hidden="true"></span>${escapeHtml(item.label)}</button>`;
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
