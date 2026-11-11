// XP Start button and its popup menu.

const startBtn = document.getElementById('start-btn');
const navLinks = document.getElementById('nav-links');
const shutdownButton = document.querySelector('button[data-action="shutdown"]');
const logoffButton = document.querySelector('button[data-action="logoff"]');

import { showLogonScreen } from '../logon-screen.js';

export function closeStartMenu() {
  navLinks.classList.remove('open');
  startBtn.setAttribute('aria-expanded', 'false');
}

function toggleStartMenu() {
  const isOpen = navLinks.classList.toggle('open');
  startBtn.setAttribute('aria-expanded', String(isOpen));
}

export function initStartMenu() {
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

  // Shutdown button: reload the page (full reset)
  if (shutdownButton) {
    shutdownButton.addEventListener('click', () => {
      location.reload();
    });
  }

  // Log off button: close start menu, then show logon screen
  if (logoffButton) {
    logoffButton.addEventListener('click', () => {
      closeStartMenu();
      showLogonScreen();
    });
  }
}
