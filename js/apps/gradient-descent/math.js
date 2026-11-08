// Pure math helpers for the viz: loss function, easing, lerp, jitter, math->canvas mapping.

import { xMin, xMax, yMin, yMax, S } from './state.js';

export function f(x) { return x * x; }
export function fPrime(x) { return 2 * x; }
export function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

export function easeOutBack(t) {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Deterministic pseudo-random wobble (seeded by index, not time) so hand-drawn
// strokes stay stable across redraws instead of "buzzing" during scroll.
export function seededJitter(i, seed) {
  return Math.sin((i + seed) * 12.9898) * 43758.5453 % 1;
}

export function mathToCanvas(mx, my) {
  const cx = S.padL + ((mx - xMin) / (xMax - xMin)) * S.plotW;
  const cy = S.padT + S.plotH - ((my - yMin) / (yMax - yMin)) * S.plotH;
  return [cx, cy];
}
