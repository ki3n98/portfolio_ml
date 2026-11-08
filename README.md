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
├── index.html          # Window markup; links stylesheets, loads js/main.js as an ES module
├── css/                # One stylesheet per feature (base, taskbar, window, app-paint, …)
├── js/
│   ├── main.js         # Entry point: imports each feature and calls its init()
│   ├── utils.js        # Shared helpers (escapeHtml, isMobile)
│   ├── data/           # Projects, experience and skills content
│   ├── desktop/        # Start menu, window manager, drag/resize, tray clock
│   └── apps/           # Notepad, Calculator, Explorer/, Paint/, Gradient Descent/, Portfolio Hub/
├── scripts/            # Playwright smoke test + screenshot diff
├── assets/
│   ├── icons/          # Windows-style icons (Windows XP theme)
│   ├── images/         # Project images and videos
│   └── resume/         # Resume PDF files
├── text.md             # Project content and research summary
├── package.json        # Script config and dependencies
└── README.md           # This file
```

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

### Project Structure

#### JavaScript Modules (`js/`)
Plain ES modules, one feature per file; see the feature → file map in `AGENTS.md`.
- `desktop/` — window management system, start menu, tray clock
- `apps/` — Notepad, Paint, Calculator, Explorer, contact form, Experience window
- `apps/gradient-descent/` — gradient descent visualization
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
