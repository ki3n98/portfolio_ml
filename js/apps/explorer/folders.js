// Virtual file system shown by the Explorer windows (My Computer / My Documents /
// My Pictures / C:). Saved Notepad/Paint files are appended to `items` at runtime.

import { toggleOrFocusWindow } from '../../desktop/window-manager.js';
import { startSlideshow } from './picture-viewer.js';

// readme.txt: opens Notepad with a short note about the site.
function openReadme() {
  const notepadTextarea = document.getElementById('notepad-textarea');
  toggleOrFocusWindow('notepad');
  if (notepadTextarea) {
    notepadTextarea.value = 'Thanks for poking around!\n\nThis whole desktop - the windows, the taskbar, Paint, Notepad, '
      + 'the Calculator, this file explorer - is hand-built by Kien Pham to show both software engineering chops and a '
      + 'bit of nostalgia for Windows XP.\n\nCheck out the Resume.pdf in this folder, or head back to the desktop to see '
      + 'the rest of the portfolio.';
  }
}

const slideshowOf = (folderKey) =>
  startSlideshow(EXPLORER_FOLDERS[folderKey].items.filter(item => item.type === 'image'));

export const EXPLORER_FOLDERS = {
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
      { label: 'View as a slide show', icon: '../assets/icons/slideshow-task.png', action: () => slideshowOf('my-pictures') },
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
