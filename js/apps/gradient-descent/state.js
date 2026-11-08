// Gradient Descent viz: tuning constants, animation state/targets, DOM refs, and the
// mutable layout/bookkeeping values on S (shared by draw/scroll/info-panel/index).

import { PORTFOLIO_PROJECTS } from '../../data/projects.js';

export const PROJECTS = PORTFOLIO_PROJECTS;
export const N = PROJECTS.length;

export const ZOOM_AMOUNT = 2.2;

// Scroll phase tuning constants
export const INTRO_DRAW_FRACTION = 0.6;
export const DOT_APPEAR_START = 0.4;
export const TANGENT_FADE_THRESHOLD = 0.35;
export const CARD_HOLD_THRESHOLD = 0.28;
export const OVERVIEW_SHOW_THRESHOLD = 0.22;

// Lerp speeds (lower = smoother)
export const LERP_SPEED = {
  zoom: 0.08,
  pan: 0.12,
  tangent: 0.10,
  intro: 0.10,
  overview: 0.1,
};

// Current rendered state
export const state = {
  activeIndex: -1,
  hoveredIndex: -1,
  tangentProgress: 0,
  introProgress: 0,
  dotReveal: 0,
  overviewProgress: 0,
  zoomLevel: 1,
  zoomCenterX: 0,
  zoomCenterY: 0,
};

// Lerp targets (scroll-derived, smoothly approached by animLoop)
export const target = {
  zoom: 1,
  centerX: 0,
  centerY: 0,
  tangent: 0,
  introProgress: 0,
  dotReveal: 0,
  activeIndex: -1,
  overviewProgress: 0,
  fastTransition: false,
};

// Total scroll phases: 1 intro step + N project steps
export const TOTAL_STEPS = N + 1;

// ----- DOM references -----

export const canvas = document.getElementById('gd-canvas');
export const ctx = canvas?.getContext('2d');
export const section = document.getElementById('projects');
export const scrollRoot = document.getElementById('window-projects-body');
export const introPanel = document.querySelector('.gd-intro');
export const infoPanel = document.getElementById('gd-info');
export const infoStep = document.getElementById('gd-info-step');
export const infoTitle = document.getElementById('gd-info-title');
export const infoAward = document.getElementById('gd-info-award');
export const infoDesc = document.getElementById('gd-info-desc');
export const infoTags = document.getElementById('gd-info-tags');
export const infoLink = document.getElementById('gd-info-link');
export const infoSecondaryLink = document.getElementById('gd-info-secondary-link');
export const infoTertiaryLink = document.getElementById('gd-info-tertiary-link');
export const infoGradient = document.getElementById('gd-info-gradient');
export const infoMedia = document.getElementById('gd-info-media');
export const infoMediaVideo = document.getElementById('gd-info-media-video');
export const infoMediaImg = document.getElementById('gd-info-media-img');
export const infoMediaEmbed = document.getElementById('gd-info-media-embed');
export const infoMediaType = document.getElementById('gd-info-media-type');
export const infoMediaText = document.getElementById('gd-info-media-text');
export const overviewPanel = document.getElementById('gd-overview');
export const overviewGrid = document.getElementById('gd-overview-grid');
export const overviewCta = document.getElementById('gd-overview-cta');
export const scrollHint = document.getElementById('gd-scroll-hint');

// ----- Layout & coordinate mapping -----

export const xMin = -2.2, xMax = 2.2, yMin = -0.2, yMax = 5;
export const colors = {};

export const S = {
  prevScrollIndex: -1,
  animLoopRunning: false,
  overviewVisible: false,
  infoSwapTimer: null,
  currentInfoIdx: -1,
  W: 0, H: 0, dpr: 1,
  padL: undefined, padR: undefined, padT: undefined, padB: undefined,
  plotW: undefined, plotH: undefined,
};
