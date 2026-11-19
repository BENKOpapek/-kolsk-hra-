// Screenshoty pre autora: node tests/screens.cjs
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const out = (n) => path.join(__dirname, '..', 'docs', 'screens', n);

(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8124'], { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
  const browser = await chromium.launch();
  try {
    await new Promise(r => setTimeout(r, 500));
    const page = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
    await page.goto('http://localhost:8124/');
    await page.waitForFunction(() => window.game?.scene.isActive('Corridor'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: out('etapa2-chodba-start.png') });
    // Prejdi do pravej chodby k vitríne.
    await page.evaluate(() => { const s = window.game.scene.getScene('Corridor'); s.onTap({ x: 19, y: 29 }); });
    await page.waitForFunction(() => { const t = window.game.scene.getScene('Corridor').playerTile; return t.x === 19 && t.y === 29; }, null, { timeout: 8000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: out('etapa2-chodba-vitrina.png') });

    // Postavy a trieda zväčšené (bez hry).
    const p2 = await (await browser.newContext({ viewport: { width: 800, height: 900 } })).newPage();
    await p2.goto('http://localhost:8124/docs/screens/');
    await p2.setContent(`<body style="margin:0;background:#3c3c48;image-rendering:pixelated">
      <img src="http://localhost:8124/assets/player_boy.png" style="width:384px">
      <img src="http://localhost:8124/assets/player_girl.png" style="width:384px"><br>
      <img src="http://localhost:8124/assets/tiles.png" style="width:768px"></body>`);
    await p2.waitForTimeout(300);
    await p2.screenshot({ path: out('etapa2-postavy.png'), fullPage: true });
    await p2.setContent(`<body style="margin:0;background:#3c3c48;image-rendering:pixelated">
      <img src="http://localhost:8124/assets/classroom_sample.png" style="width:720px"></body>`);
    await p2.waitForTimeout(300);
    await p2.screenshot({ path: out('etapa2-trieda.png'), fullPage: true });
    console.log('SCREENS OK');
  } finally { await browser.close(); srv.kill(); }
})();
