# Kien Pham - Portfolio Website

A **static portfolio website** built with plain HTML, CSS, and JavaScript (no frameworks). It simulates a Windows XP desktop environment featuring functional "apps" and an interactive Gradient Descent visualization.

Built by **Kien Pham** - Computer Science student at CSU Long Beach, Data Science Intern at TRSS, showcasing ML/software engineering experience.

## Preview

![Portfolio Preview](assets/screenshots/portfolio-preview.png)

## Features

### Desktop Environment Simulation
- Windows XP-inspired interface with taskbar, start menu, and desktop icons
- Functional window management: drag, resize, maximize, minimize, close, focus

### Desktop Applications
- **Notepad** - Text editor with save/load functionality to virtual filesystem
- **Paint** - Drawing application with pencil, brush, eraser, colors, filters, undo/redo
- **Calculator** - Full-featured calculator with arithmetic operations
- **File Explorer** - Navigate My Computer, Documents, and Pictures folders

### Portfolio Sections
- **About Me** - Personal introduction, education, and skills showcase
- **Experience** - Work history and internships (TRSS, CSULB Research)
- **Gradient Descent Visualization** - Interactive scroll-based project showcase
- **Contact** - Email contact form and social media links

### Gradient Descent Project Showcase
- Scroll-driven visualization showing projects as optimization steps
- Animated loss curve with project milestones
- Video/image embeds for each project
- Responsive project cards with tags and links

## Quick Start

```bash
cd /home/kieen/portfolio_ml
npm install    # Install Node dependencies (first time only)
npm run dev    # Start static server on http://localhost:8000
```

The server auto-reloads when you save changes to `index.html`, `css/`, `js/`, or `assets/`.

**No Node.js?** Use Python's built-in server:
```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## File Structure

```
portfolio_ml/
├── index.html          # All window markup; links every stylesheet, loads js/main.js as an ES module
├── css/                # One stylesheet per feature (flat structure)
├── js/
│   ├── main.js         # Entry point: imports each feature module and calls init()
│   ├── utils.js        # Shared helpers (escapeHtml, isMobile)
│   ├── data/           # Projects, experience and skills content
│   ├── desktop/        # Start menu, window manager, drag/resize, tray clock
│   └── apps/           # Notepad, Paint, Calculator, Explorer/, Gradient Descent/, Portfolio Hub/
├── scripts/            # Playwright smoke test + screenshot diff
├── assets/
│   ├── icons/          # Windows-style icons (Windows XP theme)
│   ├── images/         # Project images and videos
│   └── resume/         # Resume PDF files
├── text.md             # Project content and research summary
├── package.json        # Script config and dependencies
└── README.md           # This file
```

### Feature → File Map

| Feature | JS | CSS |
|---|---|---|
| Entry / init order | `js/main.js` | — |
| Shared helpers (`escapeHtml`, `isMobile`) | `js/utils.js` | `css/base.css` |
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
| Mobile/tablet breakpoints | — | `css/responsive.css` |

## Desktop Apps Details

### Notepad
- **File Menu**: New, Save As, Exit
- **Edit Menu**: Undo, Cut, Copy, Select All, Time/Date
- **Format Menu**: Word Wrap
- **View Menu**: Status Bar toggle
- Save files to virtual filesystem (localStorage)

### Paint
- **Tools**: Pencil, Brush, Eraser, Fill, Dropper, Line, Curve, Rectangle, Polygon, Ellipse
- **Image Menu**: Flip Horizontal/Vertical, Rotate 90°, Invert Colors
- **Colors**: 20 predefined colors with custom color picker
- **Actions**: Undo/Redo, Clear Image, Save as PNG
- **Zoom**: 100%, 150%, 200%, 300%

### Calculator
- Basic arithmetic: addition, subtraction, multiplication, division
- Clear functionality
- Decimal support
- Keyboard-friendly

### File Explorer
- Navigate My Computer, Documents, Pictures
- Browser-style navigation (Back, Forward, Up)
- File listing with icons

## Gradient Descent Visualization

The portfolio uses an innovative scroll-based visualization where each project represents a step down the gradient descent curve:

1. **Scroll to follow the optimization path** - Projects appear in order of "optimization progress"
2. **Interactive timeline** - Hover/click to see detailed project information
3. **Rich media** - Videos, images, and project thumbnails
4. **Responsive design** - Works on desktop and mobile

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, flexbox, grid, animations
- **Vanilla JavaScript** - No frameworks, pure DOM manipulation
- **Canvas API** - Paint app and gradient descent visualization
- **Web3Forms** - Contact form backend

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Development

### Running Tests

```bash
npm run smoke   # headless Chromium smoke test of every window and app
```

**Smoke tests** open every window and drive apps (Paint, Notepad, Calculator, Explorer, Gradient Descent, Portfolio Hub), failing on any console error.

**Visual regression testing** compares screenshots against a baseline:
1. Before making changes: `SMOKE_OUT=baseline npm run smoke`
2. After making changes: `npm run smoke`
3. Compare results: `node scripts/compare-shots.mjs`

The tray clock, gradient descent canvas animation, and autoplay videos differ between runs—anything else is a real visual change. Screenshots go to `scripts/.smoke-out/latest`.

**Note:** If Chromium fails with `libnspr4.so` / `libnss3.so` missing, run `sudo npx playwright install-deps chromium` once.

### Project Structure

#### JavaScript Modules (`js/`)
One ES module per feature, each exporting an `initX()` function. See the feature → file map above.

**Code conventions:** See `AGENTS.md` for project-specific guidelines (one feature per file ≤400 lines, flat CSS, no circular imports, etc.)

- `desktop/` — window management system, start menu, drag/resize, tray clock
- `apps/` — Notepad, Paint, Calculator, Explorer, contact form, Experience window
- `apps/gradient-descent/` — gradient descent visualization with scroll-driven project showcase
- `apps/portfolio-hub/` — the `C:\Kien Pham` landing window
- `data/` — portfolio content (projects, experience, skills)

#### Events
- Window open/close/minimize/maximize
- Mouse drag for window movement
- Canvas drawing events
- Scroll events for visualization
- Form submission

## Configuration

### Contact Form
Replace the Web3Forms access key in `index.html`:
```html
<input type="hidden" name="access_key" value="YOUR_ACCESS_KEY">
```

Get your free access key at [Web3Forms](https://web3forms.com)

### Customization
Edit the following sections in `index.html`:
- Personal information (lines 43-71, 202-226)
- Experience entries (lines 284-306)
- Project data (lines 309-390)
- Contact information (lines 392-460)

## Environment Notes

- Pure static site — no backend or database required
- Designed for WSL development (localhost forwards to Windows)
- Uses `live-server` for auto-reloading during development
- All icons are SVG with fallbacks

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Server won't start | Run `npm install` first |
| Port 8000 busy | Server picks a free port (check terminal output) |
| Page doesn't reload | Ensure `live-server` is running in terminal |
| Browser can't connect | Verify server is running (`npm run dev`) |

## License

This project is open source and available for personal use.

## Contact

- **Email**: ki3n98@gmail.com
- **GitHub**: [@ki3n98](https://github.com/ki3n98)
- **LinkedIn**: [Kien Pham](https://www.linkedin.com/in/kien-t-pham/)

---

*Built with Windows XP nostalgia and modern web technologies*
