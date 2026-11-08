// Pixel-diff smoke screenshots: scripts/.smoke-out/<a> vs <b> (default: baseline vs latest).
// Reports changed-pixel count and bounding box per image. The taskbar clock and
// animated/video content can legitimately differ; check the bounding boxes.
//
//   node scripts/compare-shots.mjs [a] [b]
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '.smoke-out');
const [a = 'baseline', b = 'latest'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();

let anyDiff = false;
for (const file of readdirSync(join(OUT, a)).filter(f => f.endsWith('.png')).sort()) {
  const other = join(OUT, b, file);
  if (!existsSync(other)) { console.log(`${file}: missing in ${b}`); anyDiff = true; continue; }
  const toUrl = p => 'data:image/png;base64,' + readFileSync(p).toString('base64');
  const r = await page.evaluate(async ([u1, u2]) => {
    const load = u => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = u; });
    const [i1, i2] = await Promise.all([load(u1), load(u2)]);
    if (i1.width !== i2.width || i1.height !== i2.height) return { size: `${i1.width}x${i1.height} vs ${i2.width}x${i2.height}` };
    const px = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
    const d1 = px(i1), d2 = px(i2);
    let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let i = 0; i < d1.length; i += 4) {
      if (d1[i] !== d2[i] || d1[i + 1] !== d2[i + 1] || d1[i + 2] !== d2[i + 2]) {
        n++; const p = i / 4, x = p % i1.width, y = (p / i1.width) | 0;
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
    }
    return { n, box: n ? `[${x0},${y0}]-[${x1},${y1}]` : '' };
  }, [toUrl(join(OUT, a, file)), toUrl(other)]);
  if (r.size) { console.log(`${file}: size differs ${r.size}`); anyDiff = true; continue; }
  if (r.n) anyDiff = true;
  console.log(`${file}: ${r.n ? `${r.n} px differ in ${r.box}` : 'identical'}`);
}
await browser.close();
process.exit(anyDiff ? 1 : 0);
