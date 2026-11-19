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


    // --- Chodba: pohyb ťuknutím, prerušenie, dvere ---
    await page.waitForFunction(() => window.game.scene.isActive('Corridor'), null, { timeout: 5000 });
    const corridor = (fn, arg) => page.evaluate(([f, a]) => new Function('s', 'a', 'return ' + f)(window.game.scene.getScene('Corridor'), a), [fn, arg]);
    const tapTile = async (x, y) => {
      const p = await corridor('(() => { const c = s.cameras.main, z = c.zoom / devicePixelRatio; return { x: (a.x*16+8 - c.worldView.x)*z, y: (a.y*16+8 - c.worldView.y)*z }; })()', { x, y });
      const b = await page.locator('canvas').boundingBox();
      await page.touchscreen.tap(b.x + p.x, b.y + p.y);
    };
    // Pri pohybe kamera „pláva“, preto zmenu cieľa testujeme priamo cez onTap (dotyk overujú ostatné kroky).
    const goTile = (x, y) => corridor('s.onTap(a)', { x, y });
    const waitTile = (x, y, ms = 3000) => page.waitForFunction(([x, y]) => {
      const t = window.game.scene.getScene('Corridor').playerTile; return t.x === x && t.y === y;
    }, [x, y], { timeout: ms }).then(() => true, () => false);

    const start = await corridor('s.playerTile');
    if (start.x !== 2 || start.y !== 16) fail('spawn nie je (2,16): ' + JSON.stringify(start));
    await tapTile(6, 16);
    if (!await waitTile(6, 16)) fail('hráč nedošiel na (6,16)');
    await goTile(19, 16);
    await page.waitForTimeout(200);
    await goTile(2, 16);
    if (!await waitTile(2, 16)) fail('prerušenie pohybu: hráč nedošiel späť na (2,16)');
    // Zmena cieľa počas kroku: postava nesmie cúvnuť.
    await page.evaluate(() => {
      const s = window.game.scene.getScene('Corridor');
      window.__xs = []; s.events.on('postupdate', () => window.__xs.push(s.player.x));
    });
    await goTile(8, 16);
    await page.waitForTimeout(190);
    await goTile(14, 16);
    if (!await waitTile(14, 16)) fail('retarget: hráč nedošiel na (14,16)');
    const xs = await page.evaluate(() => window.__xs);
    if (xs.some((x, i) => i && x < xs[i - 1])) fail('retarget: hráč cúvol (x klesla)');
    // Rýchle opakované ťukanie nesmie postavu zmraziť.
    await goTile(2, 16);
    if (!await waitTile(2, 16)) fail('návrat na (2,16) zlyhal');
    for (let i = 0; i < 20; i++) { await goTile(19, 16); await page.waitForTimeout(80); }
    if ((await corridor('s.playerTile')).x < 12) fail('rýchle ťukanie zmrazilo hráča');
    await goTile(2, 16);
    if (!await waitTile(2, 16, 4000)) fail('návrat na (2,16) zlyhal');

    await tapTile(3, 14);
    const door = await page.waitForFunction(() => window.game.scene.getScene('Corridor').lastDoorId === 'zborovna', null, { timeout: 3000 }).then(() => true, () => false);
    if (!door) fail('dvere zborovne sa neohlásili');
    await page.screenshot({ path: path.join(__dirname, '..', 'docs', 'screens', 'etapa1.png') });

    await page.setViewportSize({ width: 360, height: 640 });
    await page.waitForTimeout(300);
    const z = await page.evaluate(() => window.game.scene.getScene('Corridor').cameras.main.zoom);
    if (z !== 6) fail('zoom kamery po resize na 360x640 @3x nie je 6: ' + z);
    const cw = await page.evaluate(() => window.game.canvas.width);
    if (cw !== 1080) fail('canvas po resize nemá 1080 px: ' + cw);

    if (errors.length) fail('console errors: ' + errors.join(' | '));
    if (!process.exitCode) console.log('SMOKE OK');
  } catch (e) { fail(e.stack || e); }
  finally { await browser.close(); srv.kill(); }
})();
