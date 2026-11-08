// Smoke test: loads the site in headless Chromium, exercises every window/app,
// and fails on any console error or uncaught page error.
//
//   npm run smoke                     # screenshots -> scripts/.smoke-out/latest
//   SMOKE_OUT=baseline npm run smoke  # screenshots -> scripts/.smoke-out/baseline
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8123;
const OUT = join(ROOT, 'scripts', '.smoke-out', process.env.SMOKE_OUT || 'latest');
mkdirSync(OUT, { recursive: true });

const WINDOW_IDS = ['portfolio', 'hero', 'experience', 'projects', 'contact', 'resume',
  'paint', 'notepad', 'calculator', 'my-computer', 'my-documents', 'my-pictures'];

const failures = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); };

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
  { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));

  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
  await page.waitForSelector('#boot-screen', { state: 'detached', timeout: 10000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, '00-desktop.png') });

  const isOpen = id => page.evaluate(id => !document.getElementById(`window-${id}`).hidden, id);
  const open = async id => {
    await page.evaluate(id => document.querySelector(`button[data-window="${id}"]`).click(), id);
    await page.waitForTimeout(250);
  };
  const close = id => page.evaluate(id =>
    document.querySelector(`#window-${id} [data-close]`).click(), id);
  const click = sel => page.evaluate(sel => document.querySelector(sel).click(), sel);

  // Every window opens and closes.
  for (const [i, id] of WINDOW_IDS.entries()) {
    if (await isOpen(id)) await close(id);
    await open(id);
    check(await isOpen(id), `window ${id} did not open`);
    await page.screenshot({ path: join(OUT, `${String(i + 1).padStart(2, '0')}-${id}.png`) });
    await close(id);
    check(!(await isOpen(id)), `window ${id} did not close`);
  }

  // Calculator: 2 + 3 = 5
  await open('calculator');
  for (const sel of ['[data-calc-digit="2"]', '[data-calc-op="+"]', '[data-calc-digit="3"]', '[data-calc-equals]']) await click(sel);
  const calc = await page.textContent('#calculator-display');
  check(calc.trim() === '5', `calculator 2+3 shows "${calc}"`);
  await close('calculator');

  // Notepad: type, Save As into My Documents, file appears in Explorer.
  await open('notepad');
  await page.fill('#notepad-textarea', 'hello from smoke test');
  await click('[data-notepad-action="save"]');
  await page.waitForSelector('.save-dialog.open');
  await page.fill('.save-dialog__filename-input', 'smoke-test.txt');
  await click('.save-dialog__btn--save');
  await close('notepad');
  await open('my-documents');
  const docs = await page.textContent('#window-my-documents');
  check(docs.includes('smoke-test.txt'), 'saved notepad file missing from My Documents');
  await close('my-documents');

  // Paint: draw a stroke, then undo it.
  await open('paint');
  const inked = () => page.evaluate(() => {
    const c = document.getElementById('paint-canvas');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] < 128 && d[i + 3] > 0) n++;
    return n;
  });
  const before = await inked();
  const box = await page.locator('#paint-canvas').boundingBox();
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  for (let s = 1; s <= 10; s++) await page.mouse.move(box.x + 20 + s * 10, box.y + 20 + s * 6);
  await page.mouse.up();
  const drawn = await inked();
  check(drawn > before, `paint stroke drew nothing (${before} -> ${drawn})`);
  await click('[data-paint-action="undo"]');
  const undone = await inked();
  check(undone === before, `paint undo did not restore (${before} -> ${undone})`);
  for (const a of ['flip-h', 'flip-v', 'rotate', 'invert']) await click(`[data-paint-action="${a}"]`);
  await close('paint');

  // Gradient descent: scroll through and confirm the info panel populates.
  await open('projects');
  const titles = new Set();
  for (const frac of [0.15, 0.35, 0.55, 0.75, 0.98]) {
    await page.evaluate(f => {
      const el = document.getElementById('window-projects-body');
      el.scrollTop = (el.scrollHeight - el.clientHeight) * f;
    }, frac);
    await page.waitForTimeout(700);
    titles.add((await page.textContent('#gd-info-title')).trim());
  }
  await page.screenshot({ path: join(OUT, '20-gd-scrolled.png') });
  check([...titles].filter(Boolean).length >= 2, `GD info panel barely changed: ${[...titles].join(' | ')}`);
  await close('projects');

  // Portfolio hub: open a project detail panel.
  await open('portfolio');
  const hasProj = await page.evaluate(() => !!document.querySelector('[data-proj-open]'));
  check(hasProj, 'hub has no project tiles');
  if (hasProj) {
    await click('[data-proj-open]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUT, '21-hub-detail.png') });
  }

  // Mobile width renders without errors.
  await page.setViewportSize({ width: 375, height: 800 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, '22-mobile.png') });

  for (const e of errors) failures.push(e);
} finally {
  await browser.close();
  server.kill();
}

if (failures.length) {
  console.error(`SMOKE FAILED (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`SMOKE OK — screenshots in ${OUT}`);
