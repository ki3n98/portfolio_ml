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
- `index.html` — Main page with desktop window markup and navigation
- `js/main.js` — All client-side behavior: window management, desktop apps, gradient descent viz
- `css/style.css` — Styling (currently empty)
- `assets/` — Icons, images, videos, resume PDFs
- `text.md` — Research summary / content
- `package.json` — Script config (`live-server --port=8000`)
- `README.md` — Setup instructions

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
- **Test:** none (no test suite)
- **Verify:** load the page in a browser and exercise the changed app/window; check the browser console for errors
