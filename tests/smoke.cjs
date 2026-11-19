// Smoke test v mobilnom prehliadači: node tests/smoke.cjs
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 8123;
const fail = (m) => { console.error('SMOKE FAIL:', m); process.exitCode = 1; };

(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
  const browser = await chromium.launch();
  try {
    await new Promise(r => setTimeout(r, 500));
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`http://localhost:${PORT}/`);
    await page.waitForSelector('canvas');
    await page.waitForFunction(() => window.game && window.game.isBooted);

    if (await page.evaluate(() => getComputedStyle(document.body).touchAction) !== 'none') fail('touch-action nie je none');
    const vp = page.viewportSize();
    const box = await page.locator('canvas').boundingBox();
    if (Math.abs(box.width - vp.width) > 3 || Math.abs(box.height - vp.height) > 3)
      fail(`canvas ${box.width}x${box.height} vs viewport ${vp.width}x${vp.height}`);


    await page.setViewportSize({ width: 360, height: 640 });
    await page.waitForTimeout(300);
    if (await page.evaluate(() => window.game.scale.zoom) !== 2) fail('zoom po resize nie je 2');

    if (errors.length) fail('console errors: ' + errors.join(' | '));
    if (!process.exitCode) console.log('SMOKE OK');
  } catch (e) { fail(e.stack || e); }
  finally { await browser.close(); srv.kill(); }
})();
