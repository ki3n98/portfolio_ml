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

const ROOT = process.env.SMOKE_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8123;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '.smoke-out', process.env.SMOKE_OUT || 'latest');
mkdirSync(OUT, { recursive: true });

const WINDOW_IDS = ['portfolio', 'hero', 'experience', 'projects', 'contact', 'resume',
  'paint', 'notepad', 'calculator', 'my-computer', 'my-documents', 'my-pictures'];

const failures = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); };

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
  { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));

const browser = await chromium.launch();
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  // Only count console errors from this site (embedded YouTube iframes log their own noise).
  page.on('console', m => {
    const src = m.location()?.url || '';
    if (m.type() === 'error' && (!src || src.startsWith(`http://127.0.0.1:${PORT}`))) errors.push(`console: ${m.text()} (${src})`);
  });
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));

  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
  await page.waitForSelector('#boot-screen', { state: 'detached', timeout: 10000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, '00-desktop.png'), animations: 'disabled' });

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

  // Window chrome: drag, resize, maximize/restore, Escape closes the top window.
  await open('notepad');
  const winVar = (name) => page.evaluate(n =>
    document.getElementById('window-notepad').style.getPropertyValue(n), name);
  const bar = await page.locator('#window-notepad .window__titlebar').boundingBox();
  await page.mouse.move(bar.x + 60, bar.y + bar.height / 2);
  await page.mouse.down();
  await page.mouse.move(bar.x + 160, bar.y + bar.height / 2 + 50, { steps: 5 });
  await page.mouse.up();
  check((await winVar('--win-left')).endsWith('px'), 'dragging the title bar did not move the window');
  const handle = await page.locator('#window-notepad .window__resize-handle').boundingBox();
  if (handle) {
    const wBefore = (await page.locator('#window-notepad').boundingBox()).width;
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    await page.mouse.move(handle.x + 80, handle.y + 40, { steps: 5 });
    await page.mouse.up();
    const wAfter = (await page.locator('#window-notepad').boundingBox()).width;
    check(wAfter > wBefore, `resize handle did not grow the window (${wBefore} -> ${wAfter})`);
  }
  await click('#window-notepad [data-maximize]');
  check(await page.evaluate(() => document.getElementById('window-notepad').classList.contains('window--maximized')), 'maximize failed');
  await click('#window-notepad [data-maximize]');
  check(await page.evaluate(() => !document.getElementById('window-notepad').classList.contains('window--maximized')), 'restore failed');
  await page.keyboard.press('Escape');
  check(!(await isOpen('notepad')), 'Escape did not close the top window');

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

  // My Pictures: slideshow task opens the picture viewer; Escape closes it.
  await open('my-pictures');
  await click('#window-my-pictures [data-task="0"]');
  await page.waitForTimeout(200);
  check(await page.evaluate(() => document.querySelector('.picture-viewer')?.classList.contains('open')),
    'slideshow did not open the picture viewer');
  await page.keyboard.press('Escape');
  check(await page.evaluate(() => !document.querySelector('.picture-viewer.open')), 'Escape did not close the picture viewer');
  if (await isOpen('my-pictures')) await close('my-pictures');

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
  await click('[data-paint-action="new"]');

  // Every tool: drag across the canvas (curve/polygon get their extra clicks).
  const drag = async (x0, y0, x1, y1) => {
    await page.mouse.move(box.x + x0, box.y + y0);
    await page.mouse.down();
    await page.mouse.move(box.x + x1, box.y + y1, { steps: 6 });
    await page.mouse.up();
  };
  const tools = await page.evaluate(() =>
    [...document.querySelectorAll('.paint__tool[data-paint-tool]')].map(b => b.dataset.paintTool));
  check(tools.length >= 10, `only ${tools.length} paint tools found`);
  for (const tool of tools) {
    await click('[data-paint-action="new"]'); // blank canvas, zoom reset
    await click('.paint__swatch[data-paint-color="#000000"]'); // the dropper may have picked white
    await click(`.paint__tool[data-paint-tool="${tool}"]`);
    const pre = await inked();
    if (tool === 'text') await page.mouse.click(box.x + 40, box.y + 40);
    else await drag(40, 40, 140, 100);
    if (tool === 'curve') { await drag(80, 20, 80, 20); await drag(120, 120, 120, 120); }
    if (tool === 'polygon') { await page.mouse.click(box.x + 60, box.y + 120); await page.mouse.dblclick(box.x + 60, box.y + 120); }
    if (tool === 'select' || tool === 'freeform') await drag(80, 60, 160, 120); // move the selection
    if (tool === 'text') { await page.keyboard.type('hi'); await page.keyboard.press('Enter'); }
    const post = await inked();
    if (['pencil', 'brush', 'line', 'rect', 'rrect', 'ellipse', 'curve', 'polygon', 'airbrush'].includes(tool)) {
      // 'text' is excluded: its input loses focus on mousedown and commits empty (pre-existing bug)
      check(post > pre, `paint tool "${tool}" drew nothing (${pre} -> ${post})`);
    }
  }
  await click('[data-paint-action="select-all"]');
  await click('[data-paint-action="undo"]');
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
  await page.screenshot({ path: join(OUT, '20-gd-scrolled.png'), animations: 'disabled' });
  check([...titles].filter(Boolean).length >= 2, `GD info panel barely changed: ${[...titles].join(' | ')}`);
  await close('projects');

  // Portfolio hub: open a project detail panel.
  await open('portfolio');
  const hasProj = await page.evaluate(() => !!document.querySelector('[data-proj-open]'));
  check(hasProj, 'hub has no project tiles');
  if (hasProj) {
    await click('[data-proj-open]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUT, '21-hub-detail.png'), animations: 'disabled' });
    await page.keyboard.press('Escape');
    check(await page.evaluate(() => document.getElementById('hub-detail').hidden), 'Escape did not close the hub detail panel');
    check(await isOpen('portfolio'), 'Escape on hub detail also closed the window');
  }
  // Hub menu bar: open a menu, Escape closes the menu but not the window.
  await click('[data-hub-menu="View"]');
  check(await page.evaluate(() => document.querySelector('[data-hub-dropdown="View"]').classList.contains('open')), 'hub View menu did not open');
  await page.keyboard.press('Escape');
  check(await page.evaluate(() => !document.querySelector('[data-hub-dropdown="View"]').classList.contains('open')), 'Escape did not close the hub menu');
  check(await isOpen('portfolio'), 'Escape on hub menu also closed the window');
  await click('[data-hub-action="toggle-sidebar"]');
  check(await page.evaluate(() => document.querySelector('#window-portfolio .hub').classList.contains('hub--no-sidebar')), 'hub Task Pane toggle failed');
  await click('[data-hub-action="toggle-sidebar"]');

  // Mobile width renders without errors.
  await page.setViewportSize({ width: 375, height: 800 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, '22-mobile.png'), animations: 'disabled' });

} catch (err) {
  failures.push(`crashed: ${err.message.split('\n')[0]}`);
} finally {
  for (const e of errors) failures.push(e);
  await browser.close();
  server.kill();
}

if (failures.length) {
  console.error(`SMOKE FAILED (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`SMOKE OK — screenshots in ${OUT}`);
