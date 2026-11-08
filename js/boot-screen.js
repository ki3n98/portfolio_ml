// Boot screen: XP logo splash shown until the wallpaper/flag image loads (max 5s).

export function initBootScreen() {
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
}
