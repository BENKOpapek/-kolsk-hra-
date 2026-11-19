import { MAP_ROWS, ROOMS } from '../data/map.js';
import { parseMap, resolveTap } from '../logic/grid.js';
import { TILE } from './Boot.js';

const T = 16;          // veľkosť dlaždice
const STEP_MS = 125;   // 8 dlaždíc za sekundu
const center = (t) => ({ x: t.x * T + T / 2, y: t.y * T + T / 2 });
const FEET = 2; // postava stojí nohami na stred dlaždice

export class Corridor extends Phaser.Scene {
  constructor() { super('Corridor'); }

  create() {
    this.grid = parseMap(MAP_ROWS, ROOMS);
    this.drawMap();

    this.playerTile = { ...this.grid.spawn };
    this.lastDoorId = null;
    const c = center(this.playerTile);
    this.skin = 'player_boy'; // výber chlapec/dievča príde v ďalšej etape
    this.facing = 'down';
    this.player = this.add.sprite(c.x, c.y - FEET, this.skin).setDepth(10);
    this.player.play(`${this.skin}-idle-down`);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.grid.width * T, this.grid.height * T);
    cam.setRoundPixels(true);
    cam.setZoom(this.registry.get('zoom'));
    this.registry.events.on('changedata-zoom', (_, z) => cam.setZoom(z));
    this.scene.launch('Hud');
    cam.startFollow(this.player, true, 0.15, 0.15);

    this.input.on('pointerdown', (p) => this.onTap({ x: Math.floor(p.worldX / T), y: Math.floor(p.worldY / T) }));
  }

  drawMap() {
    const g = this.grid;
    const nearCorridor = (x, y) => [-1, 0, 1].some(dy => [-1, 0, 1].some(dx => g.isWalkable(x + dx, y + dy)));
    const tile = (x, y, frame) => this.add.image(x * T, y * T, 'tiles', frame).setOrigin(0);
    for (let y = 0; y < g.height; y++) for (let x = 0; x < g.width; x++) {
      const ch = g.tileAt(x, y);
      if (g.isWalkable(x, y)) tile(x, y, (x + y) % 2 ? TILE.floor2 : TILE.floor);
      else if (ch === ' ') tile(x, y, TILE.void);
      // Stena nad podlahou ukazuje „čelo“ (pohľad zhora-spredu), ostatné len vrch.
      else if (ch === '#') tile(x, y, g.isWalkable(x, y + 1) ? TILE.wallFace : nearCorridor(x, y) ? TILE.wallTop : TILE.roof);
    }
    // Jemný tieň na podlahe pod stenou a vedľa nej – chodba dostane hĺbku.
    const shade = this.add.graphics().fillStyle(0x2b1d24, 0.18);
    for (let y = 0; y < g.height; y++) for (let x = 0; x < g.width; x++) {
      if (!g.isWalkable(x, y)) continue;
      if (!g.isWalkable(x, y - 1)) shade.fillRect(x * T, y * T, T, 3);
      if (!g.isWalkable(x - 1, y)) shade.fillRect(x * T, y * T, 2, T);
    }
    for (const p of g.props) tile(p.x, p.y, TILE[p.kind]);
    for (const d of g.doors) {
      tile(d.x, d.y, TILE.door);
      // Popis miestnosti dáme dovnútra bloku, na opačnú stranu od chodby.
      const [dx, dy] = [[0, -1], [0, 1], [-1, 0], [1, 0]].find(([dx, dy]) => g.isWalkable(d.x + dx, d.y + dy));
      const at = center({ x: d.x - dx * 4, y: d.y - dy * 3 });
      this.add.text(at.x, at.y, d.room.name.toUpperCase(), {
        fontFamily: 'system-ui, sans-serif', fontSize: '8px', fontStyle: 'bold', color: '#f4e9d0',
        stroke: '#2b1d24', strokeThickness: 2, resolution: this.registry.get('zoom'),
      }).setOrigin(0.5).setAlpha(0.9);
    }
  }

  onTap(tile) {
    const r = resolveTap(this.grid, this.playerTile, tile);
    if (!r) return;
    this.tweens.killTweensOf(this.player);
    const c = center(this.playerTile);
    c.y -= FEET;
    // Prerušený krok: najprv sa vráť na stred poslednej dlaždice.
    const path = (this.player.x !== c.x || this.player.y !== c.y) ? [{ ...this.playerTile }, ...r.path] : r.path;
    this.targetDoor = r.door;
    this.marker?.destroy();
    const goal = r.path.at(-1) ?? this.playerTile;
    const m = center(goal);
    this.marker = this.add.circle(m.x, m.y, 3, 0xffffff, 0.6).setDepth(5);
    this.walk(path);
  }

  walk(path) {
    if (!path.length) return this.arrive();
    const next = path.shift();
    const c = center(next);
    c.y -= FEET;
    const dx = Math.sign(c.x - this.player.x), dy = Math.sign(c.y - this.player.y);
    const dir = dx ? (dx > 0 ? 'right' : 'left') : dy ? (dy > 0 ? 'down' : 'up') : this.facing;
    if (dir !== this.facing || !this.player.anims.currentAnim?.key.includes('walk')) {
      this.facing = dir;
      this.player.play(`${this.skin}-walk-${dir}`, true);
    }
    this.tweens.add({
      targets: this.player, x: c.x, y: c.y, duration: STEP_MS,
      onComplete: () => { this.playerTile = next; this.walk(path); },
    });
  }

  arrive() {
    this.player.play(`${this.skin}-idle-${this.facing}`);
    this.marker?.destroy();
    this.marker = null;
    if (!this.targetDoor) return;
    this.lastDoorId = this.targetDoor.room.id;
    this.scene.get('Hud').toast(`${this.targetDoor.room.name} – zatiaľ zatvorené`);
    this.targetDoor = null;
  }
}
