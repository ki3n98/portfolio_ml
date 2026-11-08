// XP Start button and its popup menu.

const startBtn = document.getElementById('start-btn');
const navLinks = document.getElementById('nav-links');

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
}
