# Prvý deň – Etapa 1 a 2 (chodba, pohyb, grafická vzorka) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hrateľná chodba gymnázia na mobile – ťukneš, postava dôjde; kamera sleduje; dvere hlásia miestnosť – a vzorka pixel-art grafiky na schválenie autorom.

**Architecture:** Statická stránka bez build kroku. Phaser 3 uložený v `vendor/`, hra v ES moduloch v `src/`. Čistá logika (mapa, hľadanie cesty, škálovanie) je v `src/logic/` bez závislosti na Phaseri a testuje sa vstavaným `node --test`. Scény Phaseru sú tenká vrstva nad logikou. Grafika sa generuje z textových „pixel máp“ Python skriptom do PNG, aby sa dala ľahko upravovať.

**Tech Stack:** Phaser 3.90.0 (MIT), JavaScript ES moduly, Node 22 `node:test`, Playwright (predinštalovaný) na smoke test, Python 3 + Pillow na generovanie grafiky.

**Spec:** `docs/superpowers/specs/2026-11-19-skolska-hra-design.md`

## Global Constraints

- Všetko zadarmo; žiadne platené služby ani assety. Cudzie súbory len MIT/CC0, zapísať do `CREDITS.md`.
- Phaser **3.90.0** (posledná 3.x; Phaser 4 existuje, ale spec určuje 3.x), uložený lokálne v `vendor/phaser.min.js`, nie z CDN.
- Žiadne build nástroje, žiadne npm závislosti v `package.json` (len `"type": "module"` a `test` skript).
- Všetky texty v hre po slovensky.
- Mobil na výšku, ovládanie ťuknutím. Na šírku na dotykovom zariadení: výzva „Otoč mobil na výšku“.
- Základné rozlíšenie okolo 180×320, škálované **celým násobkom**, `pixelArt: true`.
- Dlaždica 16×16 px.
- Mapa a texty sú dáta v samostatných súboroch, nie v kóde scén.
- Žiadne reálne mená osôb.
- Stránka musí fungovať zo podpriečinka (GitHub Pages `/-kolsk-hra-/`) → všetky cesty relatívne.

## Review Focus

- Ťuknutie počas chôdze → postava plynulo zmení cieľ z aktuálnej dlaždice, nič sa nehromadí ani neteleportuje (test v Task 3).
- Ťuknutie na stenu/prázdno → dôjde na najbližšiu dostupnú podlahu (do vzdialenosti 2), inak nič (test v Task 2).
- Ťuknutie na dvere, keď hráč stojí vedľa nich → okamžite „vstúpi“ (dĺžka cesty 0) (test v Task 2).
- Otočenie mobilu / zmena veľkosti okna uprostred hry → prepočíta sa zoom, obraz sa neroztiahne (test v Task 1 + Task 3 smoke).
- iOS Safari: dvojklik nesmie zoomovať a ťahanie nesmie posúvať stránku (`touch-action: none`, viewport meta) (kontrola v Task 1 smoke).

---

## File Structure

```
index.html              – stránka, CSS, overlay „otoč mobil“, načíta vendor + src/main.js
.nojekyll               – GitHub Pages bez Jekyllu
package.json            – {"type":"module","scripts":{"test":"node --test tests/"}}
CREDITS.md              – licencie (Phaser MIT)
vendor/phaser.min.js    – Phaser 3.90.0
src/main.js             – vytvorí Phaser.Game, rieši resize
src/logic/view.js       – výpočet zoomu a veľkosti hry
src/logic/grid.js       – parsovanie mapy, BFS, najbližšia podlaha
src/data/map.js         – mapa chodby ako ASCII + legenda dverí
src/scenes/Boot.js      – načíta textúry (Etapa 1: generované farebné štvorce; Etapa 2: PNG)
src/scenes/Corridor.js  – vykreslenie mapy, hráč, ťuknutie, kamera, dvere
tools/make_art.py       – generuje assets/*.png z textových pixel máp
assets/                 – výsledné PNG
tests/view.test.js
tests/grid.test.js
tests/smoke.cjs         – Playwright: načíta hru v mobilnom viewporte, ťukne, overí pohyb
```

---

### Task 1: Kostra stránky, Phaser, škálovanie

**Files:**
- Create: `index.html`, `.nojekyll`, `package.json`, `CREDITS.md`, `vendor/phaser.min.js`, `src/main.js`, `src/logic/view.js`, `tests/view.test.js`, `tests/smoke.cjs`

**Interfaces:**
- Produces: `computeView(innerW: number, innerH: number) -> {zoom: number, width: number, height: number}` v `src/logic/view.js`. `window.game` (Phaser.Game) vystavené pre testy.

- [ ] **Step 1: Stiahni Phaser** – `cd "$SCRATCH" && npm pack phaser@3.90.0 && tar xzf phaser-3.90.0.tgz` a skopíruj `package/dist/phaser.min.js` do `vendor/`. Over: `head -c 200 vendor/phaser.min.js` obsahuje `Phaser`.

- [ ] **Step 2: Napíš failing test `tests/view.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeView } from '../src/logic/view.js';

test('typický mobil 390x844', () => {
  assert.deepEqual(computeView(390, 844), { zoom: 2, width: 195, height: 422 });
});
test('presne 360x640', () => {
  assert.deepEqual(computeView(360, 640), { zoom: 2, width: 180, height: 320 });
});
test('desktop 1280x720 nemá extrémny zoom', () => {
  assert.deepEqual(computeView(1280, 720), { zoom: 2, width: 640, height: 360 });
});
test('malé okno → zoom aspoň 1', () => {
  assert.equal(computeView(100, 100).zoom, 1);
});
```

- [ ] **Step 3: Spusti** `npm test` → FAIL (modul neexistuje).

- [ ] **Step 4: Implementuj `computeView`** – `zoom = max(1, floor(min(W/180, H/320)))`, `width = ceil(W/zoom)`, `height = ceil(H/zoom)`.

- [ ] **Step 5: Spusti** `npm test` → PASS.

- [ ] **Step 6: `index.html` + `src/main.js`**
  - viewport meta `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`; `<title>Prvý deň</title>`; `lang="sk"`.
  - CSS: `html,body{margin:0;height:100%;background:#1b1b2a;overflow:hidden;touch-action:none;-webkit-user-select:none;user-select:none}`; canvas `image-rendering: pixelated`.
  - Overlay `#otoc` s textom „Otoč mobil na výšku 📱“, zobrazený len `@media (orientation: landscape) and (pointer: coarse)`.
  - `main.js`: `new Phaser.Game({ type: Phaser.AUTO, pixelArt: true, backgroundColor: '#1b1b2a', scale: { mode: Phaser.Scale.NONE, width, height, zoom }, scene: [Boot, Corridor] })` s hodnotami z `computeView(innerWidth, innerHeight)`; na `resize` volaj `game.scale.resize(width,height)` a `game.scale.setZoom(zoom)`. `window.game = game`.
  - Kým Task 3 neexistuje, `scene: []` a len prázdny canvas.

- [ ] **Step 7: Smoke test `tests/smoke.cjs`** (CommonJS, `require('playwright')`): spustí `python3 -m http.server 8123` v koreni repa (child_process, na konci kill), otvorí `http://localhost:8123/` s `devices['iPhone 13']`, čaká na `canvas`, overí: žiadne `console.error`/`pageerror`; `getComputedStyle(document.body).touchAction === 'none'`; veľkosť canvasu (CSS) ≈ viewport ±zoom px. Potom `page.setViewportSize({width:360,height:640})`, počká 300 ms a overí `window.game.scale.zoom === 2`. Exit kód 1 pri chybe.
  Run: `node tests/smoke.cjs` → `SMOKE OK`.

- [ ] **Step 8: Commit** `git add -A && git commit -m "Kostra hry: Phaser, škálovanie na mobil"`

---

### Task 2: Mapa ako dáta + hľadanie cesty

**Files:**
- Create: `src/data/map.js`, `src/logic/grid.js`, `tests/grid.test.js`

**Interfaces:**
- Produces z `src/data/map.js`: `export const MAP_ROWS: string[]`, `export const ROOMS: Record<string, {id: string, name: string}>` (kľúč = znak dverí).
- Produces z `src/logic/grid.js`:
  - `parseMap(rows: string[], rooms) -> Grid` kde `Grid = { width, height, tileAt(x,y): string, isWalkable(x,y): boolean, spawn: {x,y}, doors: Array<{x, y, room: {id,name}}>, props: Array<{x,y,kind:'locker'|'vitrina'|'portret'}> }`
  - `findPath(grid, from: {x,y}, to: {x,y}) -> Array<{x,y}> | null` – BFS, 4 smery, výsledok **bez** štartovej dlaždice, `[]` ak `from == to`, `null` ak nedostupné.
  - `resolveTap(grid, from: {x,y}, tile: {x,y}) -> { path: Array<{x,y}>, door: {x,y,room} | null } | null` – ak je `tile` dvere: cesta k najbližšej podlahovej susednej dlaždici dverí + `door`; ak je podlaha: cesta tam; inak najbližšia dostupná podlaha v Manhattanovej vzdialenosti ≤ 2 (pri remíze tá s kratšou cestou); inak `null`.

- [ ] **Step 1: `src/data/map.js`** – presne táto mapa (schválená autorom). Legenda: `#` stena/plné, `.` podlaha, `S` spawn (podlaha), `L` skrinka, `V` vitrína, `P` portrét (všetky tri sú pevné), medzera = mimo budovy (pevné), číslice = dvere (pevné, dá sa do nich „vstúpiť“).

```js
export const MAP_ROWS = [
  "     #####            ",
  "     #...#            ",
  "     #...##########   ",
  "     #...##########   ",
  "     #...1#########   ",
  "     #...##########   ",
  "     #...##########   ",
  "######...##########   ",
  "######...##########   ",
  "######...##########   ",
  "######...2#########   ",
  "######...##########   ",
  "######...##########   ",
  "######...##########   ",
  "###3##...#LLLLLLL#####",
  "#....................#",
  "#.S..................#",
  "#....................#",
  "##########4#######...#",
  "      ############...#",
  "      ###########5...#",
  "      ############...#",
  "      ############...#",
  "      ############...#",
  "      ###########6...#",
  "      ############...#",
  "      ############...#",
  "      ############...#",
  "      ############...#",
  "      ###########7...V",
  "      ############...#",
  "      ############...#",
  "      ############...P",
  "      ############...#",
  "      ###########8...#",
  "      ############...#",
  "      ############...#",
  "      ############...#",
  "      ############...#",
  "      ###########9...#",
  "      ############...#",
  "      ############...#",
  "      ################",
];
export const ROOMS = {
  '1': { id: 'informatika', name: 'Informatika' },
  '2': { id: 'trieda1', name: 'Trieda 1' },
  '3': { id: 'zborovna', name: 'Zborovňa' },
  '4': { id: 'wc1', name: 'WC' },
  '5': { id: 'wc2', name: 'WC' },
  '6': { id: 'kabinet', name: 'Kabinet' },
  '7': { id: 'trieda2', name: 'Trieda 2' },
  '8': { id: 'trieda3', name: 'Trieda 3' },
  '9': { id: 'trieda4', name: 'Trieda 4' },
};
```

- [ ] **Step 2: Failing testy `tests/grid.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAP_ROWS, ROOMS } from '../src/data/map.js';
import { parseMap, findPath, resolveTap } from '../src/logic/grid.js';

const g = parseMap(MAP_ROWS, ROOMS);

test('všetky riadky majú rovnakú dĺžku', () => {
  assert.equal(new Set(MAP_ROWS.map(r => r.length)).size, 1);
});
test('spawn a 9 dverí', () => {
  assert.deepEqual(g.spawn, { x: 2, y: 16 });
  assert.equal(g.doors.length, 9);
  assert.ok(g.isWalkable(2, 16));
});
test('stena, dvere, skrinka a mimo mapy nie sú priechodné', () => {
  assert.equal(g.isWalkable(0, 0), false);
  assert.equal(g.isWalkable(9, 4), false);
  assert.equal(g.isWalkable(10, 14), false);
  assert.equal(g.isWalkable(-1, 5), false);
  assert.equal(g.isWalkable(99, 99), false);
});
test('do každých dverí sa dá dôjsť zo spawnu', () => {
  for (const d of g.doors) {
    const r = resolveTap(g, g.spawn, d);
    assert.ok(r, `dvere ${d.room.id}`);
    assert.equal(r.door.room.id, d.room.id);
  }
});
test('findPath: rovnaké miesto = [], susedné = 1 krok', () => {
  assert.deepEqual(findPath(g, { x: 2, y: 16 }, { x: 2, y: 16 }), []);
  assert.deepEqual(findPath(g, { x: 2, y: 16 }, { x: 3, y: 16 }), [{ x: 3, y: 16 }]);
});
test('findPath: cieľ v stene = null', () => {
  assert.equal(findPath(g, g.spawn, { x: 0, y: 0 }), null);
});
test('ťuknutie na dvere zborovne stojac pod nimi = okamžitý vstup', () => {
  const r = resolveTap(g, { x: 3, y: 15 }, { x: 3, y: 14 });
  assert.deepEqual(r.path, []);
  assert.equal(r.door.room.id, 'zborovna');
});
test('ťuknutie na stenu tesne pri podlahe → najbližšia podlaha', () => {
  const r = resolveTap(g, g.spawn, { x: 5, y: 16 + 2 }); // (5,18) stena pod chodbou
  assert.ok(r);
  assert.equal(r.door, null);
  assert.deepEqual(r.path.at(-1), { x: 5, y: 17 });
});
test('ťuknutie ďaleko od podlahy → null', () => {
  assert.equal(resolveTap(g, g.spawn, { x: 13, y: 8 }), null);
});
test('cesta do Triedy 4 je súvislá (kroky po 1)', () => {
  const r = resolveTap(g, g.spawn, g.doors.find(d => d.room.id === 'trieda4'));
  let p = g.spawn;
  for (const s of r.path) {
    assert.equal(Math.abs(s.x - p.x) + Math.abs(s.y - p.y), 1);
    assert.ok(g.isWalkable(s.x, s.y));
    p = s;
  }
});
```

- [ ] **Step 3: Spusti** `npm test` → FAIL.
- [ ] **Step 4: Implementuj `parseMap`, `findPath`, `resolveTap`** podľa Interfaces. BFS cez frontu s poľom `prev`; susedné dlaždice v poradí hore, dole, vľavo, vpravo (deterministické cesty).
- [ ] **Step 5: Spusti** `npm test` → PASS.
- [ ] **Step 6: Commit** `git commit -am "Mapa chodby ako dáta a hľadanie cesty"` (+ `git add` nových súborov).

---

### Task 3: Scéna chodby – vykreslenie, pohyb ťuknutím, kamera, dvere

**Files:**
- Create: `src/scenes/Boot.js`, `src/scenes/Corridor.js`
- Modify: `src/main.js` (pridať scény), `tests/smoke.cjs` (pohyb)

**Interfaces:**
- Consumes: `parseMap`, `resolveTap` (Task 2), `MAP_ROWS`, `ROOMS`, `computeView` (Task 1).
- Produces: textúry s kľúčmi `floor`, `wall`, `void`, `door`, `locker`, `vitrina`, `portret`, `player` (Boot ich v Etape 1 vytvorí cez `graphics.generateTexture` ako farebné 16×16 štvorce; Task 4 ich nahradí PNG pod **rovnakými kľúčmi**). Scéna `Corridor` vystaví `this.playerTile: {x,y}` a `this.lastDoorId: string|null` pre testy (`window.game.scene.getScene('Corridor')`).

- [ ] **Step 1: `Boot.js`** – vytvorí placeholder textúry (podlaha svetlá béžová, stena tmavohnedá, dvere zelené, skrinky modré, vitrína tyrkysová, portrét zlatý, hráč červený 12×14 na 16×16), potom `scene.start('Corridor')`.
- [ ] **Step 2: `Corridor.js` – vykreslenie** – každá dlaždica `image(x*16, y*16, key).setOrigin(0)`; nad každými dverami text s `room.name` (bitmap/web font, veľkosť čitateľná pri zoome 2, napr. 8 px pixel font alebo `16px monospace` so `setResolution`); `cameras.main.setBounds(0,0,w*16,h*16)` a `startFollow(player, true, 0.15, 0.15)`.
- [ ] **Step 3: Pohyb** – `input.on('pointerdown')` → `tile = floor(worldX/16), floor(worldY/16)` → `resolveTap(grid, this.playerTile, tile)`; ak `null`, nič. Inak zruš bežiaci pohyb (`this.tweens.killTweensOf(player)`) a začni od **aktuálnej** dlaždice `playerTile` (počas kroku sa `playerTile` aktualizuje na konci každého kroku; po prerušení sa hráč doťahuje na najbližší stred dlaždice prvým krokom novej cesty). Krok = tween 125 ms (8 dlaždíc/s). Na konci cesty, ak `door`, zobraz toast „{room.name} – zatiaľ zatvorené“ na 1,5 s a nastav `lastDoorId = room.id`. Malá značka (krúžok) na cieľovej dlaždici, kým hráč nedôjde.
- [ ] **Step 4: Rozšír smoke test** – po načítaní: zisti `playerTile` (= spawn 2,16), ťukni (`page.mouse.click` / `tap`) na obrazovkovú pozíciu dlaždice (6,16) prepočítanú z kamery (`cam.worldView`, `zoom`); čakaj max 3 s, kým `playerTile` = {6,16}. Potom ťukni na dlaždicu (19,16) a po 200 ms znova na (2,16) → do 3 s `playerTile` = {2,16} (prerušenie pohybu). Potom ťukni na dvere zborovne (3,14) → do 3 s `lastDoorId === 'zborovna'`. Po celom teste žiadne console errory.
  Run: `node tests/smoke.cjs` → `SMOKE OK`; `npm test` → PASS.
- [ ] **Step 5: Screenshot** pre autora: `deviceScaleFactor: 2`, iPhone 13, uložiť do `docs/screens/etapa1.png`.
- [ ] **Step 6: Commit** `git add -A && git commit -m "Chodba: pohyb ťuknutím, kamera, dvere"`

**🛑 Zastávka: ukáž autorovi screenshot + link (GitHub Pages z tejto vetvy) a počkaj na spätnú väzbu k pohybu a mape.**

---

### Task 4: Grafická vzorka (Etapa 2)

**Files:**
- Create: `tools/make_art.py`, `assets/tiles.png`, `assets/player_boy.png`, `assets/player_girl.png`, `assets/classroom_sample.png`
- Modify: `src/scenes/Boot.js` (načítať PNG pod rovnakými kľúčmi), `CREDITS.md` (grafika: vlastná)

**Interfaces:**
- Consumes: kľúče textúr z Task 3.
- Produces: `assets/tiles.png` – spritesheet 16×16 v poradí rámcov: `0 floor, 1 floor_alt, 2 wall_top, 3 wall_face, 4 door, 5 locker, 6 vitrina, 7 portret, 8 void`. `player_*.png` – spritesheet 16×16, riadky: dole, hore, vľavo, vpravo; stĺpce: stoj, krok1, krok2 (3×4 rámce). Boot: `load.spritesheet('tiles', …, {frameWidth:16, frameHeight:16})` a `load.spritesheet('player_boy'|'player_girl', …)`; Corridor kreslí dlaždice cez rámce `tiles` a stenu nad podlahou ako `wall_face`, inak `wall_top`.

- [ ] **Step 1: `tools/make_art.py`** – každý sprite ako zoznam reťazcov (jeden znak = pixel) + paleta `{znak: '#rrggbb'}`; Pillow zloží spritesheety. Štýl: teplé farby „farm life“, max ~24 farieb v celej palete, tmavý obrys postáv, svetlo zľava hore. Školské linoleum (béžové s jemným vzorom), steny krémové s tmavším soklom, drevené dvere s tabuľkou, kovové modré skrinky, vitrína so sklom, portrét v zlatom ráme. Chlapec a dievča: rovnaká výška (~14 px), odlišný účes a farba oblečenia, chôdza 2 rámce.
- [ ] **Step 2: Vzorka triedy** – `classroom_sample.png` 180×144 (statický obrázok na posúdenie štýlu): tabuľa, katedra, 2 rady lavíc, okno, kvetináč.
- [ ] **Step 3: Spusti** `python3 tools/make_art.py` → vzniknú 4 PNG; over `python3 -c "from PIL import Image; print(Image.open('assets/tiles.png').size)"` → `(144, 16)`.
- [ ] **Step 4: Napoj do Boot/Corridor**, hráč animovaný podľa smeru pohybu (`anims.create` 4 smery, 6 fps), stoj = rámec 0 riadku posledného smeru. Zatiaľ vždy `player_boy` (výber príde v ďalšej etape).
- [ ] **Step 5: Over** `npm test` a `node tests/smoke.cjs` → PASS / `SMOKE OK`.
- [ ] **Step 6: Screenshoty** `docs/screens/etapa2-chodba.png` (iPhone 13, dpr 2), `docs/screens/etapa2-postavy.png` (obe postavy zväčšené 8× vedľa seba, všetky rámce), `docs/screens/etapa2-trieda.png` (vzorka triedy 4×).
- [ ] **Step 7: Commit** `git add -A && git commit -m "Grafická vzorka: dlaždice, postavy, trieda"`

**🛑 Zastávka: grafický štýl na schválenie autorom. Bez schválenia nepokračovať ďalšími etapami (NPC, mini hry…) – tie dostanú vlastný plán.**
