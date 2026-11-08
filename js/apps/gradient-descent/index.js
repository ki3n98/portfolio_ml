// Gradient Descent viz entry: mouse hover/click on dots and initialization.
// See README.md in this folder for how the modules fit together.

import { PROJECTS, N, state, canvas, scrollRoot, overviewGrid, S } from './state.js';
import { f, mathToCanvas } from './math.js';
import { readColors, resize, render } from './draw.js';
import { renderOverviewCards, scrollToProjectIndex, handleOverviewClick, onScroll } from './scroll.js';

function getHoveredDot(cx, cy) {
  const hitRadius = 28;
  for (let i = 0; i < N; i++) {
    const pt = mathToCanvas(PROJECTS[i].x, f(PROJECTS[i].x));
    if (Math.hypot(cx - pt[0], cy - pt[1]) < hitRadius) return i;
  }
  return -1;
}

function screenToCanvas(sx, sy) {
  let mx = sx, my = sy;
  if (state.zoomLevel > 1.001) {
    const vpCx = S.W / 2, vpCy = S.H / 2;
    mx = (sx - vpCx) / state.zoomLevel + state.zoomCenterX;
    my = (sy - vpCy) / state.zoomLevel + state.zoomCenterY;
  }
  return [mx, my];
}

function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const pt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
  const idx = getHoveredDot(pt[0], pt[1]);
  if (idx !== state.hoveredIndex) {
    state.hoveredIndex = idx;
    canvas.style.cursor = idx >= 0 ? 'pointer' : 'default';
    render();
  }
}

function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const pt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
  const idx = getHoveredDot(pt[0], pt[1]);
  if (idx >= 0 && idx !== state.activeIndex) {
    scrollToProjectIndex(idx);
  }
}

function init() {
  readColors();
  renderOverviewCards();
  resize();

  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseleave', () => {
    state.hoveredIndex = -1;
    canvas.style.cursor = 'default';
    render();
  });
  canvas.addEventListener('click', handleClick);
  if (overviewGrid) {
    overviewGrid.addEventListener('click', handleOverviewClick);
  }

  // Scroll listener (RAF-throttled) — the Projects window's own scroll
  // container is the scroll root now, not the document.
  let ticking = false;
  scrollRoot.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      onScroll();
    }, 100);
  });

  onScroll();

  // Exposed so the window manager can re-measure the canvas (it has zero
  // size while the Projects window is hidden/closed) when it's opened.
  window.__gdRefresh = () => {
    resize();
    onScroll();
  };
}

export function initGradientDescent() {
  if (!canvas) return;
  document.fonts ? document.fonts.ready.then(init) : init();
}
