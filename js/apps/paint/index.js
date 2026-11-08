// Paint app entry: canvas sizing, toolbox, palette, menu bar. See README.md in this folder.

import { closeWindow } from '../../desktop/window-manager.js';
import { paintCanvas, paintWrap, paintClearBtn, paintToolButtons, paintMenubar, paintColorPicker, S } from './state.js';
import { undo, applyZoom, resizeCanvas, setPaintColor, selectTool } from './canvas.js';
import { initPaintPointer } from './pointer.js';
import { clearCanvas, savePaintImage, selectAll, flipHorizontal, flipVertical, rotate90, invertColors } from './image-ops.js';

export function initPaint() {
  if (!paintCanvas) return;

  new ResizeObserver(resizeCanvas).observe(paintWrap);

  paintToolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.paintTool;
      if (!name) return;
      if (name === 'dropper' && S.activeTool !== 'dropper') S.dropperReturnTool = S.activeTool;
      selectTool(name);
    });
  });

  initPaintPointer();

  document.querySelectorAll('.paint__swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      setPaintColor(swatch.dataset.paintColor);
      document.querySelectorAll('.paint__swatch').forEach(s => s.classList.remove('paint__swatch--active'));
      swatch.classList.add('paint__swatch--active');
    });
  });

  paintClearBtn?.addEventListener('click', clearCanvas);

  // --- Menu bar ---
  if (paintMenubar) {
    const paintMenuItems = paintMenubar.querySelectorAll('[data-paint-menu]');
    let openPaintMenu = null;

    function closeAllPaintMenus() {
      paintMenubar.querySelectorAll('.paint__menu-dropdown.open').forEach(d => d.classList.remove('open'));
      paintMenuItems.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
      openPaintMenu = null;
    }

    function openPaintMenuFor(name) {
      closeAllPaintMenus();
      const dropdown = paintMenubar.querySelector(`[data-paint-dropdown="${name}"]`);
      const btn = paintMenubar.querySelector(`[data-paint-menu="${name}"]`);
      if (!dropdown || !btn) return;
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      openPaintMenu = name;
    }

    paintMenuItems.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.paintMenu;
        if (openPaintMenu === name) closeAllPaintMenus();
        else openPaintMenuFor(name);
      });
      btn.addEventListener('mouseenter', () => {
        if (openPaintMenu && openPaintMenu !== btn.dataset.paintMenu) openPaintMenuFor(btn.dataset.paintMenu);
      });
    });

    paintMenubar.querySelectorAll('[data-paint-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.paintAction;
        closeAllPaintMenus();
        switch (action) {
          case 'new':
          case 'clear-image':
            clearCanvas();
            break;
          case 'save':
            savePaintImage();
            break;
          case 'exit':
            closeWindow('paint');
            break;
          case 'undo':
            undo();
            break;
          case 'select-all':
            selectAll();
            break;
          case 'zoom-100':
            applyZoom(1);
            break;
          case 'zoom-150':
            applyZoom(1.5);
            break;
          case 'zoom-200':
            applyZoom(2);
            break;
          case 'zoom-300':
            applyZoom(3);
            break;
          case 'flip-h':
            flipHorizontal();
            break;
          case 'flip-v':
            flipVertical();
            break;
          case 'rotate':
            rotate90();
            break;
          case 'invert':
            invertColors();
            break;
          case 'edit-colors':
            paintColorPicker?.click();
            break;
          case 'about':
            alert('MS Paint — Lightweight Edition\n\nA small real Paint clone built for this desktop.\n\nDraw, fill, select, and save, right from the browser.');
            break;
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (openPaintMenu && !paintMenubar.contains(e.target)) closeAllPaintMenus();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && openPaintMenu) closeAllPaintMenus();
    });

    paintColorPicker?.addEventListener('input', () => {
      setPaintColor(paintColorPicker.value);
      document.querySelectorAll('.paint__swatch').forEach(s => s.classList.remove('paint__swatch--active'));
    });
  }
}
