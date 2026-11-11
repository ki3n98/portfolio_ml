// main.js — entry point. Every feature lives in its own module; this file only wires
// them up. Init order matches the original single-file order: several features add
// document-level Escape/click listeners and their registration order matters.
// Feature -> file map: see AGENTS.md.

import { initBootScreen } from './boot-screen.js';
import { initLogonScreen } from './logon-screen.js';
import { initStartMenu } from './desktop/start-menu.js';
import { initWindowManager } from './desktop/window-manager.js';
import { initWindowDrag } from './desktop/window-drag.js';
import { initWindowResize } from './desktop/window-resize.js';
import { initTrayClock } from './desktop/tray-clock.js';
import { initContactForm } from './apps/contact-form.js';
import { initNotepad } from './apps/notepad.js';
import { initExplorer } from './apps/explorer/index.js';
import { initCalculator } from './apps/calculator.js';
import { initPaint } from './apps/paint/index.js';
import { initExperienceWindow } from './apps/experience-window.js';
import { initGradientDescent } from './apps/gradient-descent/index.js';
import { initPortfolioHub } from './apps/portfolio-hub/index.js';

initBootScreen();
initLogonScreen();
initStartMenu();
initWindowManager();
initWindowDrag();
initWindowResize();
initTrayClock();
initContactForm();
initNotepad();
initExplorer();
initCalculator();
initPaint();
initExperienceWindow();
initGradientDescent();
initPortfolioHub();
