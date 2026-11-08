// Scroll-driven animation: maps scroll progress to zoom/pan/tangent targets, the
// overview cards, and the RAF lerp loop that eases state toward those targets.

import { escapeHtml } from '../../utils.js';
import { PROJECTS, N, ZOOM_AMOUNT, INTRO_DRAW_FRACTION, DOT_APPEAR_START, TANGENT_FADE_THRESHOLD, CARD_HOLD_THRESHOLD, OVERVIEW_SHOW_THRESHOLD, LERP_SPEED, state, target, TOTAL_STEPS, section, scrollRoot, introPanel, infoPanel, overviewPanel, overviewGrid, overviewCta, scrollHint, S } from './state.js';
import { f, easeOut, lerp, mathToCanvas } from './math.js';
import { render } from './draw.js';
import { updateInfo } from './info-panel.js';

export function getScrollProgress() {
  const rect = section.getBoundingClientRect();
  const scrollable = section.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  const scrolled = -rect.top;
  return Math.max(0, Math.min(1, scrolled / scrollable));
}

export function renderOverviewCards() {
  if (!overviewGrid) return;
  overviewGrid.innerHTML = PROJECTS.filter(proj => proj.includeInOverview !== false)
    .map(proj => {
      const awardMarkup = proj.award
        ? '<span class="gd-overview__award">' + escapeHtml(proj.award) + '</span>'
        : '';
      return (
        '<a class="gd-overview__card" href="#projects" data-project-index="' + PROJECTS.indexOf(proj) + '">' +
          '<span class="gd-overview__step">' + proj.step + '</span>' +
          awardMarkup +
          '<h4 class="gd-overview__card-title">' + proj.title + '</h4>' +
          '<p class="gd-overview__desc">' + proj.desc + '</p>' +
          '<div class="gd-overview__tags">' + proj.tags.map(t =>
            '<span class="gd-overview__tag">' + escapeHtml(t) + '</span>'
          ).join('') + '</div>' +
        '</a>'
      );
    }).join('');
}

export function scrollToProjectIndex(idx) {
  if (idx < 0 || idx >= N) return;
  const scrollRootRect = scrollRoot.getBoundingClientRect();
  const rect = section.getBoundingClientRect();
  const sectionTop = scrollRoot.scrollTop + (rect.top - scrollRootRect.top);
  const scrollable = section.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return;

  const phaseNudge = idx === 0 ? 0.08 : 0;
  const targetProgress = (idx + 1 + phaseNudge) / TOTAL_STEPS;
  const targetTop = sectionTop + scrollable * targetProgress;
  scrollRoot.scrollTo({ top: targetTop, behavior: 'smooth' });
}

export function handleOverviewClick(e) {
  const card = e.target.closest('.gd-overview__card');
  if (!card) return;
  e.preventDefault();
  const idx = Number(card.dataset.projectIndex);
  if (Number.isNaN(idx)) return;
  scrollToProjectIndex(idx);
}

export function setOverviewState(isVisible) {
  if (!overviewPanel || !infoPanel) return;
  if (isVisible === S.overviewVisible) return;
  S.overviewVisible = isVisible;
  overviewPanel.classList.toggle('active', isVisible);
  overviewPanel.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
  infoPanel.classList.toggle('hidden', isVisible);
  if (overviewCta) {
    overviewCta.classList.toggle('active', isVisible);
    overviewCta.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
  }
}

// --- Scroll phase helpers ---

export function computeIntroTargets(introPhase) {
  // Parabola draws during first portion of intro step
  target.introProgress = easeOut(Math.min(1, introPhase / INTRO_DRAW_FRACTION));

  // Dots appear during latter portion — continuous float for smooth scale-in
  const dotPhase = Math.max(0, (introPhase - DOT_APPEAR_START) / (1 - DOT_APPEAR_START));
  target.dotReveal = Math.min(N, dotPhase * N);
}

export function computeProjectTargets(projectProgress, floatIndex) {
  const nearestIndex = Math.max(0, Math.min(N - 1, Math.round(floatIndex)));
  const distToNearest = Math.abs(floatIndex - nearestIndex);

  // Tangent: full when close to a dot, fades when panning between dots
  const tangentT = 1 - Math.min(1, distToNearest / TANGENT_FADE_THRESHOLD);
  target.tangent = easeOut(Math.max(0, tangentT));
  target.overviewProgress = 0;

  // Zoom: ramp to full over first half-step
  const zoomEntry = Math.min(1, projectProgress / 0.5);
  target.zoom = 1 + (ZOOM_AMOUNT - 1) * (0.5 + 0.5 * easeOut(zoomEntry));

  // Center: smoothly interpolate between adjacent dot positions
  const lowerIdx = Math.max(0, Math.min(N - 2, Math.floor(floatIndex)));
  const upperIdx = lowerIdx + 1;
  const t = floatIndex - lowerIdx;
  const easedT = t * t * (3 - 2 * t); // smoothstep

  const ptA = mathToCanvas(PROJECTS[lowerIdx].x, f(PROJECTS[lowerIdx].x));
  const ptB = mathToCanvas(PROJECTS[upperIdx].x, f(PROJECTS[upperIdx].x));
  target.centerX = ptA[0] + (ptB[0] - ptA[0]) * easedT;
  target.centerY = ptA[1] + (ptB[1] - ptA[1]) * easedT;

  target.activeIndex = nearestIndex;
}

export function computeOverviewTargets(projectProgress, focusPhaseEnd, lastDotPt) {
  const overviewT = Math.max(0, Math.min(1, projectProgress - focusPhaseEnd));
  const easedOverview = overviewT * overviewT * (3 - 2 * overviewT);
  const cardHoldT = Math.max(0, Math.min(1, overviewT / CARD_HOLD_THRESHOLD));

  target.activeIndex = overviewT < CARD_HOLD_THRESHOLD ? N - 1 : -1;
  target.tangent = 1 - cardHoldT;
  target.overviewProgress = overviewT;
  target.zoom = ZOOM_AMOUNT + (1 - ZOOM_AMOUNT) * easedOverview;
  target.centerX = lastDotPt[0] + (S.W / 2 - lastDotPt[0]) * easedOverview;
  target.centerY = lastDotPt[1] + (S.H / 2 - lastDotPt[1]) * easedOverview;
}

export function onScroll() {
  const rect = section.getBoundingClientRect();
  if (rect.top >= window.innerHeight || rect.bottom <= 0) {
    target.activeIndex = -1;
    target.tangent = 0;
    target.overviewProgress = 0;
    S.prevScrollIndex = -1;
    state.activeIndex = -1;
    state.hoveredIndex = -1;
    setOverviewState(false);
    updateInfo(-1);
    render();
    return;
  }

  const progress = getScrollProgress();

  // Hide scroll hint once scrolling begins
  if (progress > 0.01 && scrollHint) {
    scrollHint.classList.add('hidden');
  }

  if (introPanel) {
    introPanel.classList.toggle('compact', progress > 0.02);
  }

  // Map progress across all steps (intro + projects)
  const rawStep = progress * TOTAL_STEPS;
  const introPhase = Math.max(0, Math.min(1, rawStep));

  computeIntroTargets(introPhase);

  // Project focus + overview (steps 1..N)
  const projectProgress = Math.max(0, rawStep - 1);
  const focusPhaseEnd = N - 1;
  const floatIndex = Math.min(N - 1, projectProgress);
  target.fastTransition = projectProgress > 0 && projectProgress < 2.6;

  const firstDotPt = mathToCanvas(PROJECTS[0].x, f(PROJECTS[0].x));
  const lastDotPt = mathToCanvas(PROJECTS[N - 1].x, f(PROJECTS[N - 1].x));

  // Start panning toward first dot and zooming during last portion of intro
  const leadIn = Math.max(0, (introPhase - INTRO_DRAW_FRACTION) / (1 - INTRO_DRAW_FRACTION));
  const easedLeadIn = leadIn * leadIn * (3 - 2 * leadIn); // smoothstep

  if (projectProgress <= 0) {
    // Still in intro, no project focused
    target.activeIndex = -1;
    target.tangent = 0;
    target.overviewProgress = 0;

    // Smoothly ramp zoom and center toward first dot during intro tail
    target.zoom = 1 + (ZOOM_AMOUNT - 1) * easedLeadIn * 0.5;
    target.centerX = S.W / 2 + (firstDotPt[0] - S.W / 2) * easedLeadIn;
    target.centerY = S.H / 2 + (firstDotPt[1] - S.H / 2) * easedLeadIn;
  } else if (projectProgress > focusPhaseEnd) {
    computeOverviewTargets(projectProgress, focusPhaseEnd, lastDotPt);
  } else {
    computeProjectTargets(projectProgress, floatIndex);
  }

  const newIndex = target.activeIndex;
  if (newIndex !== S.prevScrollIndex) {
    S.prevScrollIndex = newIndex;
    state.activeIndex = newIndex;
    updateInfo(newIndex);
  }

  setOverviewState(target.overviewProgress > OVERVIEW_SHOW_THRESHOLD);

  // Start animation loop if not running
  if (!S.animLoopRunning) {
    S.animLoopRunning = true;
    requestAnimationFrame(animLoop);
  }
}

export function animLoop() {
  const zoomLerp = target.fastTransition ? 0.12 : LERP_SPEED.zoom;
  const panLerp = target.fastTransition ? 0.18 : LERP_SPEED.pan;
  const tangentLerp = target.fastTransition ? 0.14 : LERP_SPEED.tangent;

  state.introProgress = lerp(state.introProgress, target.introProgress, LERP_SPEED.intro);
  state.dotReveal = lerp(state.dotReveal, target.dotReveal, LERP_SPEED.intro);
  state.zoomLevel = lerp(state.zoomLevel, target.zoom, zoomLerp);
  state.zoomCenterX = lerp(state.zoomCenterX, target.centerX, panLerp);
  state.zoomCenterY = lerp(state.zoomCenterY, target.centerY, panLerp);
  state.tangentProgress = lerp(state.tangentProgress, target.tangent, tangentLerp);
  state.overviewProgress = lerp(state.overviewProgress, target.overviewProgress, LERP_SPEED.overview);

  state.activeIndex = target.activeIndex;

  render();

  // Check if values have settled
  const settled =
    Math.abs(state.introProgress - target.introProgress) < 0.003 &&
    Math.abs(state.dotReveal - target.dotReveal) < 0.01 &&
    Math.abs(state.zoomLevel - target.zoom) < 0.002 &&
    Math.abs(state.zoomCenterX - target.centerX) < 0.5 &&
    Math.abs(state.zoomCenterY - target.centerY) < 0.5 &&
    Math.abs(state.tangentProgress - target.tangent) < 0.005 &&
    Math.abs(state.overviewProgress - target.overviewProgress) < 0.01;

  if (settled) {
    state.introProgress = target.introProgress;
    state.dotReveal = target.dotReveal;
    state.zoomLevel = target.zoom;
    state.zoomCenterX = target.centerX;
    state.zoomCenterY = target.centerY;
    state.tangentProgress = target.tangent;
    state.overviewProgress = target.overviewProgress;
  }

  if (!settled || state.activeIndex >= 0) {
    requestAnimationFrame(animLoop);
  } else {
    render();
    S.animLoopRunning = false;
  }
}
