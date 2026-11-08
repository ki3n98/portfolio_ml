// Pointer handlers on the Paint overlay canvas: dispatches down/move/up per active tool.

import { paintOverlay, paintCtx, overlayCtx, zoomSteps, S } from './state.js';
import { clearOverlay, pushUndo, applyZoom, getPos, rgbToHex, setPaintColor, commitSelection, selectTool } from './canvas.js';
import { strokeConfig, airbrushSpray, drawShape, floodFill, startTextInput, pointInSelection, finalizeMarquee, drawPolygonPreview, finalizePolygon, resetCurve } from './tools.js';

export function initPaintPointer() {
  // --- Pointer handlers ---
  paintOverlay.addEventListener('pointerdown', (e) => {
    const pos = getPos(e);

    if (S.activeTool === 'text') { startTextInput(e); return; }

    if (S.activeTool === 'zoom') {
      applyZoom(zoomSteps[(S.zoomIndex + 1) % zoomSteps.length]);
      return;
    }

    if (S.activeTool === 'dropper') {
      const d = paintCtx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
      setPaintColor(rgbToHex(d[0], d[1], d[2]));
      if (S.dropperReturnTool) selectTool(S.dropperReturnTool);
      return;
    }

    if (S.activeTool === 'fill') {
      pushUndo();
      floodFill(pos.x, pos.y, S.paintColor);
      return;
    }

    if (S.activeTool === 'polygon') {
      S.polygonPoints.push(pos);
      drawPolygonPreview(null);
      return;
    }

    if (S.activeTool === 'curve') {
      if (S.curveStage === 0) {
        S.curveStart = pos;
        S.drawing = true;
        S.curveStage = 1;
        paintOverlay.setPointerCapture(e.pointerId);
      } else if (S.curveStage === 2) {
        S.curveBend1 = pos;
        S.curveStage = 3;
      } else if (S.curveStage === 3) {
        const bend2 = pos;
        pushUndo();
        paintCtx.lineWidth = 2;
        paintCtx.strokeStyle = S.paintColor;
        paintCtx.lineCap = 'round';
        paintCtx.beginPath();
        paintCtx.moveTo(S.curveStart.x, S.curveStart.y);
        paintCtx.bezierCurveTo(S.curveBend1.x, S.curveBend1.y, bend2.x, bend2.y, S.curveEnd.x, S.curveEnd.y);
        paintCtx.stroke();
        resetCurve();
      }
      return;
    }

    if (S.activeTool === 'select' || S.activeTool === 'freeform') {
      if (S.selection && pointInSelection(pos)) {
        S.selDragMode = 'move';
        S.moveGrab = { dx: pos.x - S.selection.x, dy: pos.y - S.selection.y };
      } else {
        commitSelection();
        S.selDragMode = 'marquee';
        S.marqueeStart = pos;
        if (S.activeTool === 'freeform') S.marqueePoints = [pos];
      }
      paintOverlay.setPointerCapture(e.pointerId);
      S.drawing = true;
      return;
    }

    if (S.activeTool === 'line' || S.activeTool === 'rect' || S.activeTool === 'rrect' || S.activeTool === 'ellipse') {
      pushUndo();
      S.shapeStart = pos;
      S.drawing = true;
      paintOverlay.setPointerCapture(e.pointerId);
      return;
    }

    // pencil, brush, eraser, airbrush
    pushUndo();
    S.drawing = true;
    paintOverlay.setPointerCapture(e.pointerId);
    const cfg = strokeConfig(S.activeTool);
    paintCtx.lineWidth = cfg.width;
    paintCtx.lineCap = cfg.cap;
    paintCtx.lineJoin = 'round';
    paintCtx.strokeStyle = cfg.color;
    paintCtx.beginPath();
    paintCtx.moveTo(pos.x, pos.y);
    if (S.activeTool === 'airbrush') airbrushSpray(pos.x, pos.y);
  });

  paintOverlay.addEventListener('pointermove', (e) => {
    const pos = getPos(e);

    if (S.activeTool === 'curve' && S.curveStart) {
      if (S.curveStage === 1 && S.drawing) {
        S.curveEnd = pos;
        clearOverlay();
        overlayCtx.lineWidth = 2;
        overlayCtx.strokeStyle = S.paintColor;
        overlayCtx.lineCap = 'round';
        overlayCtx.beginPath();
        overlayCtx.moveTo(S.curveStart.x, S.curveStart.y);
        overlayCtx.lineTo(pos.x, pos.y);
        overlayCtx.stroke();
      } else if (S.curveStage === 2) {
        clearOverlay();
        overlayCtx.lineWidth = 2;
        overlayCtx.strokeStyle = S.paintColor;
        overlayCtx.lineCap = 'round';
        overlayCtx.beginPath();
        overlayCtx.moveTo(S.curveStart.x, S.curveStart.y);
        overlayCtx.quadraticCurveTo(pos.x, pos.y, S.curveEnd.x, S.curveEnd.y);
        overlayCtx.stroke();
      } else if (S.curveStage === 3) {
        clearOverlay();
        overlayCtx.lineWidth = 2;
        overlayCtx.strokeStyle = S.paintColor;
        overlayCtx.lineCap = 'round';
        overlayCtx.beginPath();
        overlayCtx.moveTo(S.curveStart.x, S.curveStart.y);
        overlayCtx.bezierCurveTo(S.curveBend1.x, S.curveBend1.y, pos.x, pos.y, S.curveEnd.x, S.curveEnd.y);
        overlayCtx.stroke();
      }
      return;
    }

    if (S.activeTool === 'polygon' && S.polygonPoints.length) {
      drawPolygonPreview(pos);
      return;
    }

    if (!S.drawing) return;

    if (S.activeTool === 'select' || S.activeTool === 'freeform') {
      if (S.selDragMode === 'marquee') {
        clearOverlay();
        overlayCtx.save();
        overlayCtx.setLineDash([4, 3]);
        overlayCtx.strokeStyle = '#000000';
        overlayCtx.lineWidth = 1;
        if (S.activeTool === 'freeform') {
          S.marqueePoints.push(pos);
          overlayCtx.beginPath();
          overlayCtx.moveTo(S.marqueePoints[0].x, S.marqueePoints[0].y);
          for (let i = 1; i < S.marqueePoints.length; i++) overlayCtx.lineTo(S.marqueePoints[i].x, S.marqueePoints[i].y);
          overlayCtx.stroke();
        } else {
          const x = Math.min(S.marqueeStart.x, pos.x), y = Math.min(S.marqueeStart.y, pos.y);
          overlayCtx.strokeRect(x + 0.5, y + 0.5, Math.abs(pos.x - S.marqueeStart.x), Math.abs(pos.y - S.marqueeStart.y));
        }
        overlayCtx.restore();
      } else if (S.selDragMode === 'move' && S.selection) {
        clearOverlay();
        const nx = pos.x - S.moveGrab.dx, ny = pos.y - S.moveGrab.dy;
        overlayCtx.drawImage(S.selection.canvas, nx, ny);
        overlayCtx.save();
        overlayCtx.setLineDash([4, 3]);
        overlayCtx.strokeStyle = '#000000';
        overlayCtx.lineWidth = 1;
        overlayCtx.strokeRect(nx + 0.5, ny + 0.5, S.selection.w, S.selection.h);
        overlayCtx.restore();
      }
      return;
    }

    if (S.activeTool === 'line' || S.activeTool === 'rect' || S.activeTool === 'rrect' || S.activeTool === 'ellipse') {
      clearOverlay();
      drawShape(overlayCtx, S.activeTool, S.shapeStart.x, S.shapeStart.y, pos.x, pos.y);
      return;
    }

    // freehand
    const cfg = strokeConfig(S.activeTool);
    paintCtx.lineWidth = cfg.width;
    paintCtx.lineCap = cfg.cap;
    paintCtx.lineJoin = 'round';
    paintCtx.strokeStyle = cfg.color;
    if (S.activeTool === 'airbrush') {
      airbrushSpray(pos.x, pos.y);
    } else {
      paintCtx.lineTo(pos.x, pos.y);
      paintCtx.stroke();
    }
  });

  function stopDrawing(e) {
    if (!S.drawing) return;
    S.drawing = false;
    if (paintOverlay.hasPointerCapture(e.pointerId)) paintOverlay.releasePointerCapture(e.pointerId);

    if (S.activeTool === 'curve') {
      if (S.curveStage === 1) S.curveStage = 2;
      return;
    }

    if (S.activeTool === 'select' || S.activeTool === 'freeform') {
      const pos = getPos(e);
      if (S.selDragMode === 'marquee') {
        finalizeMarquee(pos);
      } else if (S.selDragMode === 'move' && S.selection) {
        S.selection.x = pos.x - S.moveGrab.dx;
        S.selection.y = pos.y - S.moveGrab.dy;
        commitSelection();
      }
      S.selDragMode = 'none';
      return;
    }

    if (S.activeTool === 'line' || S.activeTool === 'rect' || S.activeTool === 'rrect' || S.activeTool === 'ellipse') {
      const pos = getPos(e);
      clearOverlay();
      drawShape(paintCtx, S.activeTool, S.shapeStart.x, S.shapeStart.y, pos.x, pos.y);
      S.shapeStart = null;
    }
  }

  paintOverlay.addEventListener('pointerup', stopDrawing);
  paintOverlay.addEventListener('pointercancel', stopDrawing);

  paintOverlay.addEventListener('dblclick', () => {
    if (S.activeTool === 'polygon') finalizePolygon();
  });
}
