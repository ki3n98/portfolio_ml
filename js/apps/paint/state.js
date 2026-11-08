// Shared Paint state. DOM refs and contexts never change; everything mutable lives on S
// so the other paint modules can read/write it (ES module imports are read-only bindings).

export const paintCanvas = document.getElementById('paint-canvas');
export const paintWrap = paintCanvas?.closest('.paint__canvas-wrap');
export const paintOverlay = document.getElementById('paint-overlay');
export const paintCtx = paintCanvas?.getContext('2d');
export const overlayCtx = paintOverlay?.getContext('2d');
export const paintClearBtn = document.getElementById('paint-clear');
export const paintCurrentColor = document.getElementById('paint-current-color');
export const paintCanvasSize = document.getElementById('paint-canvas-size');
export const paintToolButtons = document.querySelectorAll('.paint__tool');
export const paintMenubar = document.getElementById('paint-menubar');
export const paintColorPicker = document.getElementById('paint-color-picker');

export const zoomSteps = [1, 1.5, 2, 3];
export const undoStack = [];

export const S = {
  paintColor: '#000000',
  activeTool: 'pencil',
  dropperReturnTool: null,
  drawing: false,
  shapeStart: null,
  zoomIndex: 0,

  selection: null, // { canvas, x, y, w, h }
  selDragMode: 'none', // 'none' | 'marquee' | 'move'
  marqueeStart: null,
  marqueePoints: null,
  moveGrab: null,

  polygonPoints: [],
  curveStage: 0,
  curveStart: null,
  curveEnd: null,
  curveBend1: null,

  textInput: null,
  textPos: null,
};
