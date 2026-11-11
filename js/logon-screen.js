// logon-screen.js — XP-style "Select Your User" logon screen
// Exports: initLogonScreen(), showLogonScreen()
// Modal behavior: clicking the user tile or Turn off computer triggers reload

/** @type {HTMLDivElement | null} */
let logonScreenElement = null;

/** @type {HTMLButtonElement | null} */
let userTileElement = null;

/** @type {HTMLButtonElement | null} */
let shutDownButtonElement = null;

/**
 * Binds click handlers to logon screen elements.
 * Guards against missing elements (safe for multiple calls).
 */
function initLogonScreen() {
  if (logonScreenElement) {
    return; // Already initialized
  }

  logonScreenElement = document.getElementById('logon-screen');
  if (!logonScreenElement) {
    return;
  }

  userTileElement = logonScreenElement.querySelector('.logon-screen__user-tile');
  shutDownButtonElement = logonScreenElement.querySelector('.logon-screen__shut-down');

  // Bind click handlers
  if (userTileElement) {
    userTileElement.addEventListener('click', handleLogonClick);
  }

  if (shutDownButtonElement) {
    shutDownButtonElement.addEventListener('click', handleShutdownClick);
  }
}

/**
 * Shows the logon screen by removing the hidden attribute.
 * Guarded against missing elements.
 */
function showLogonScreen() {
  if (logonScreenElement) {
    logonScreenElement.removeAttribute('hidden');
    if (userTileElement) userTileElement.focus();
  }
}

/**
 * Handles logon: clicks on the user tile.
 */
function handleLogonClick() {
  location.reload();
}

/**
 * Handles shutdown: clicks on Turn off computer button.
 */
function handleShutdownClick() {
  location.reload();
}

// Export for other modules
export { initLogonScreen, showLogonScreen };
