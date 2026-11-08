# Paint (`js/apps/paint/`)

MS Paint clone in the `#window-paint` window. Markup: `index.html` (`id="window-paint"`). Styles: `css/app-paint.css`.

## Files

| File | Role |
|---|---|
| `state.js` | DOM refs (`paintCanvas`, `paintOverlay`, contexts, toolbar/menu elements), `zoomSteps`, `undoStack`, and the mutable state object **`S`** |
| `canvas.js` | Core used by everything else: `clearOverlay`, `pushUndo`/`undo`, `applyZoom`, `resizeCanvas`, `getPos`, color helpers, `setPaintColor`, `commitSelection`, `commitTextInput`, `resetInteractionState`, `selectTool`, `drawSelectionOverlay` |
| `tools.js` | Per-tool helpers: `strokeConfig`, `airbrushSpray`, `drawShape`, `floodFill`, `startTextInput`, selection marquee (`pointInSelection`, `finalizeMarquee`), polygon and curve helpers |
| `pointer.js` | `initPaintPointer()`: `pointerdown`/`move`/`up`/`dblclick` on the overlay, dispatching on `S.activeTool` |
| `image-ops.js` | Menu actions on the whole image: `clearCanvas`, `savePaintImage`, `selectAll`, flips, `rotate90`, `invertColors` |
| `index.js` | `initPaint()`: ResizeObserver, toolbox buttons, palette swatches, Clear button, menu bar; calls `initPaintPointer()` |

Imports flow `state → canvas → tools → pointer`, and `state/canvas → image-ops`, with `index` importing everything. Keep it acyclic.

## State convention

Anything that changes at runtime is a field on `S` (from `state.js`):

```js
import { S } from './state.js';
S.activeTool = 'brush';           // ✅
if (S.selection) { /* … */ }      // ✅
```

ES module imports are read-only bindings, so a module-level `let` can't be reassigned from another file. Add new mutable state to `S`, and keep fixed values (DOM refs, constants) as plain `export const`.

## Two canvases

- `paintCanvas` / `paintCtx` hold the committed image (undo snapshots come from here).
- `paintOverlay` / `overlayCtx` sit on top and receive all pointer events. They show previews: shape rubber-banding, selection marquee, polygon/curve in progress. `clearOverlay()` wipes them.

## Adding a tool

1. Add a `.paint__tool` button with `data-paint-tool="name"` in `index.html`.
2. Put the drawing logic in `tools.js`.
3. Handle `S.activeTool === 'name'` in the relevant handlers in `pointer.js`.
4. If the tool keeps in-progress state, add it to `S` and reset it in `resetInteractionState()` (`canvas.js`).
