# AGENTS.md — portfolio_ml Project

## About This Project
`portfolio_ml` is a **static portfolio website** built with plain HTML, CSS, and JavaScript (no frameworks). It simulates a Windows XP desktop environment featuring functional "apps": Notepad, Paint, Calculator, File Explorer, and an interactive Gradient Descent visualization. Built by Kien Pham for personal portfolio showcasing software engineering skills.

## Quick Start

```bash
cd /home/kieen/portfolio_ml
npm install    # Install Node dependencies (first time only)
npm run dev    # Start static server on http://localhost:8000
```

The server auto-reloads when you save changes to `index.html`, `css/`, `js/`, or `assets/`. If port 8000 is busy, live-server picks a free port (shown in terminal).

## File Structure
- `index.html` — All window markup; links every stylesheet and loads `js/main.js` as an ES module
- `js/` — One ES module per feature (map below). `js/main.js` only imports and calls each `init*()`
- `css/` — One stylesheet per feature (map below), all flat in `css/`
- `assets/` — Icons, images, videos, resume PDFs
- `scripts/smoke.mjs` — Playwright smoke test; `scripts/compare-shots.mjs` pixel-diffs its screenshots
- `text.md` — Research summary / content
- `package.json` — Scripts: `dev` (live-server :8000), `smoke`
- `README.md` — Setup instructions

## Feature → File Map
Load only the files for the feature you're changing. Window markup for every feature is in `index.html` (search for `id="window-<name>"`).

| Feature | JS | CSS |
|---|---|---|
| Entry / init order | `js/main.js` | — |
| Shared helpers (`escapeHtml`, `isMobile`) | `js/utils.js` | `css/base.css` (variables, reset, fade-in) |
| Boot screen | `js/boot-screen.js` | `css/boot-screen.css` |
| Start menu | `js/desktop/start-menu.js` | `css/taskbar.css` |
| Window manager, taskbar buttons | `js/desktop/window-manager.js` | `css/window.css`, `css/taskbar.css` |
| Window drag / resize | `js/desktop/window-drag.js`, `js/desktop/window-resize.js` | `css/window.css` |
| Tray clock | `js/desktop/tray-clock.js` | `css/taskbar.css` |
| Desktop icons / wallpaper | (window-manager wires `data-window` icons) | `css/desktop.css` |
| About Me (hero) window | (static HTML) | `css/section-hero.css`, `css/section-about.css` |
| Experience window | `js/apps/experience-window.js` | `css/section-experience.css` |
| Contact form | `js/apps/contact-form.js` | `css/section-contact.css` |
| Notepad | `js/apps/notepad.js` | `css/app-notepad.css` |
| File Explorer | `js/apps/explorer/` (`index.js`, `folders.js`, `picture-viewer.js`, `save-dialog.js`) | `css/app-explorer.css`, `css/app-picture-viewer.css`, `css/app-save-dialog.css` |
| Calculator | `js/apps/calculator.js` | `css/app-calculator.css` |
| Paint | `js/apps/paint/` (see its `README.md`) | `css/app-paint.css` |
| Gradient Descent viz | `js/apps/gradient-descent/` (see its `README.md`) | `css/gradient-descent.css`, `css/gradient-descent-overview.css` |
| Portfolio Hub (`C:\Kien Pham`) | `js/apps/portfolio-hub/` (`index.js`, `menubar.js`, `shared.js`) | `css/portfolio-hub.css`, `css/portfolio-hub-detail.css` |
| Content: projects / experience / skills | `js/data/projects.js`, `js/data/experience.js`, `js/data/skills.js` | — |
| Mobile/tablet breakpoints | — | `css/responsive.css` (+ per-file `@media` blocks) |

## Code Conventions
- **One feature per file, ≤ ~400 lines.** If a file outgrows that, split it into a folder like `js/apps/paint/`.
- **Each feature module exports `initX()`**; add the import and call in `js/main.js`. Keep the call order: several features register document-level `Escape`/click listeners, and registration order decides which one handles the key first.
- **Shared mutable state lives in a `state.js` object `S`** (Paint, Gradient Descent). ES module imports are read-only, so use `S.activeTool = 'brush'`, never a module-level `let` that another file needs to reassign.
- **No circular imports.** Dependencies flow `utils/data → desktop → apps`. Explorer never imports Notepad/Paint; they import Explorer.
- **Use `escapeHtml` from `js/utils.js`** for any text interpolated into HTML; don't redefine it.
- **CSS stays flat in `css/`.** JS sets `--icon-url: url('../assets/...')`, so moving a stylesheet into a subfolder can break icon paths. `index.html` link order is the cascade order: add new files in the right spot.
- The site must be served over HTTP (`npm run dev`). ES modules don't load from `file://`.

## Running Locally
1. `npm install` (if not already done)
2. `npm run dev`
3. Open browser to `http://localhost:8000`

**No Node.js? Use:** `python3 -m http.server 8000`

## Key Features
- Desktop window simulation with drag/resize/maximize/minimize/close/focus
- Notepad text editor (save to virtual filesystem)
- Paint app with drawing, undo/redo, filters, zoom
- Calculator
- File Explorer (My Computer / Documents / Pictures folders)
- Gradient Descent visualization with project showcase

## Environment Notes
- Pure static site — no backend or database
- Designed for WSL: localhost forwards to Windows, use your Windows browser
- Uses `live-server` (devDependency) for auto-reloading dev server

## Troubleshooting
| Symptom | Fix |
|---|---|
| Server won't start | Run `npm install` first |
| Port 8000 busy | Server picks a free port; check terminal output |
| Page doesn't reload | Check live-server is running in terminal |
| Browser can't connect | Ensure server is running (`npm run dev`) |

## Context
The user (Kien Pham) is a Computer Science student at CSULB building this portfolio to showcase ML/software engineering experience including data science internships (TRSS), facial recognition projects, and desktop app development.

---

## Agents
This project uses the global opencode workflow (`~/.config/opencode/AGENTS.md`): the default `lead` agent runs Explore → Plan → Implement → Verify → Review through subagents. No project-specific agents yet (add them to `.opencode/agents/`).

## Commands
- **Run:** `npm run dev` (http://localhost:8000)
- **Test:** `npm run smoke` (headless Chromium: opens every window, drives Paint/Notepad/Calculator/Explorer/GD/Hub, fails on any console error). Screenshots go to `scripts/.smoke-out/latest`.
  - Visual regression: run `SMOKE_OUT=baseline npm run smoke` before a change, `npm run smoke` after it, then `node scripts/compare-shots.mjs`. The tray clock, GD canvas animation and autoplay videos differ between runs; anything else is a real change.
  - If Chromium fails with `libnspr4.so` / `libnss3.so` missing, run `sudo npx playwright install-deps chromium` once.
- **Verify:** `npm run smoke`, then load the page in a browser and exercise the changed app/window; check the browser console for errors
