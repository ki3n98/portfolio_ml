# Gradient Descent viz (`js/apps/gradient-descent/`)

The scroll-driven project showcase in the `#window-projects` window. Projects are dots on the loss curve L(θ) = θ². Scrolling "descends" the curve: zooming and panning to each dot and swapping the info panel. At the end it zooms out to an overview grid.

Markup: `index.html` (`id="window-projects"`, `gd-*` ids). Styles: `css/gradient-descent.css`, `css/gradient-descent-overview.css`. Data: `js/data/projects.js` (each project's `x` is its position on the curve).

## Files

| File | Role |
|---|---|
| `state.js` | `PROJECTS`/`N`, tuning constants (`ZOOM_AMOUNT`, thresholds, `LERP_SPEED`), `state` (what's rendered) and `target` (where scroll wants it), DOM refs, curve bounds, `colors`, and mutable **`S`** (canvas size `W/H/dpr`, padding, plot size, scroll/overview/info bookkeeping) |
| `math.js` | Pure helpers: `f`, `fPrime`, easing, `lerp`, `seededJitter`, `mathToCanvas` |
| `draw.js` | `readColors`, `resize`, every `draw*` function, and `render()` |
| `scroll.js` | `onScroll()` maps scroll progress to `target.*` (intro → per-project → overview), overview cards, `scrollToProjectIndex`, and `animLoop()` (RAF) that lerps `state` toward `target` |
| `info-panel.js` | `updateInfo(idx)`: fade-swaps the info panel content, media (video/image/YouTube) and links |
| `index.js` | Mouse hover/click on dots, `init()`, and `initGradientDescent()` (waits for fonts, then inits) |

Imports flow `state → math → draw → info-panel → scroll → index`. Keep it acyclic.

## Data flow

```
scroll event ─▶ onScroll() ─▶ target.* ─▶ animLoop() lerps state.* ─▶ render()
                    └─▶ updateInfo(idx) when the active dot changes
```

- `state` and `target` are `const` objects mutated in place. Other mutable values live on `S` (ES module imports are read-only, so `S.W = …`, not `W = …`).
- The canvas has zero size while the window is hidden. `index.js` exposes `window.__gdRefresh()`, and the window manager calls it when the Projects window opens so the viz re-measures.

## Tuning

Phase timing and feel are the constants at the top of `state.js` (`INTRO_DRAW_FRACTION`, `DOT_APPEAR_START`, `TANGENT_FADE_THRESHOLD`, `CARD_HOLD_THRESHOLD`, `OVERVIEW_SHOW_THRESHOLD`, `LERP_SPEED`, `ZOOM_AMOUNT`).
