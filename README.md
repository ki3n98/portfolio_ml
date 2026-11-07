# Portfolio

A static portfolio site built with plain HTML, CSS and JavaScript. There is no build step and no framework.

## Project structure

```
index.html      Page markup
css/style.css   Styles
js/main.js      Behavior
assets/         Images, icons, resume PDFs
```

## Running in development (auto-reload)

Requires Node.js.

```bash
cd portfolio_ml
npm install    # first time only
npm run dev
```

This starts [live-server](https://github.com/tapio/live-server) at http://localhost:8000 and opens the browser. The page reloads whenever you save changes to `index.html`, `css/`, `js/` or `assets/`. CSS changes are injected without a full reload.

If port 8000 is busy, live-server picks another port and prints it in the terminal.

### Without Node

Any static file server works, but it won't auto-reload:

```bash
python3 -m http.server 8000
```

## Notes

- `playwright` (in `devDependencies`) is used for screenshots or testing. It isn't needed to run the site.
- If you're using WSL, `localhost` is normally forwarded to Windows, so you can use your Windows browser.
