import { MAP_ROWS, ROOMS } from '../data/map.js';
import { parseMap, resolveTap } from '../logic/grid.js';

const T = 16;          // veľkosť dlaždice
const STEP_MS = 125;   // 8 dlaždíc za sekundu
const PROP_KEYS = { locker: 'locker', vitrina: 'vitrina', portret: 'portret' };
const center = (t) => ({ x: t.x * T + T / 2, y: t.y * T + T / 2 });

export class Corridor extends Phaser.Scene {
  constructor() { super('Corridor'); }

  create() {
    this.grid = parseMap(MAP_ROWS, ROOMS);
    this.drawMap();

    this.playerTile = { ...this.grid.spawn };
    this.lastDoorId = null;
    const c = center(this.playerTile);
    this.player = this.add.image(c.x, c.y, 'player').setDepth(10);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.grid.width * T, this.grid.height * T);
    cam.setRoundPixels(true);
    cam.startFollow(this.player, true, 0.15, 0.15);

    this.input.on('pointerdown', (p) => this.onTap({ x: Math.floor(p.worldX / T), y: Math.floor(p.worldY / T) }));
  }

  drawMap() {
    const g = this.grid;
    for (let y = 0; y < g.height; y++) for (let x = 0; x < g.width; x++) {
      const ch = g.tileAt(x, y);
      const key = g.isWalkable(x, y) ? 'floor' : ch === ' ' ? 'void' : ch === '#' ? 'wall' : null;
      if (key) this.add.image(x * T, y * T, key).setOrigin(0);
    }
    for (const p of g.props) this.add.image(p.x * T, p.y * T, PROP_KEYS[p.kind]).setOrigin(0);
    for (const d of g.doors) {
      this.add.image(d.x * T, d.y * T, 'door').setOrigin(0);
      // Popis miestnosti dáme dovnútra bloku, na opačnú stranu od chodby.
      const [dx, dy] = [[0, -1], [0, 1], [-1, 0], [1, 0]].find(([dx, dy]) => g.isWalkable(d.x + dx, d.y + dy));
      const at = center({ x: d.x - dx * 4, y: d.y - dy * 3 });
      this.add.text(at.x, at.y, d.room.name.toUpperCase(), {
        fontFamily: 'monospace', fontSize: '8px', fontStyle: 'bold', color: '#f4e9d0', resolution: 4,
      }).setOrigin(0.5);
    }
  }

  onTap(tile) {
    const r = resolveTap(this.grid, this.playerTile, tile);
    if (!r) return;
    this.tweens.killTweensOf(this.player);
    const c = center(this.playerTile);
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
    this.tweens.add({
      targets: this.player, x: c.x, y: c.y, duration: STEP_MS,
      onComplete: () => { this.playerTile = next; this.walk(path); },
    });
  }

  arrive() {
    this.marker?.destroy();
    this.marker = null;
    if (!this.targetDoor) return;
    this.lastDoorId = this.targetDoor.room.id;
    this.toast(`${this.targetDoor.room.name} – zatiaľ zatvorené`);
    this.targetDoor = null;
  }

  toast(msg) {
    this.toastObj?.destroy();
    const cam = this.cameras.main;
    const t = this.add.text(cam.width / 2, cam.height - 24, msg, {
      fontFamily: 'monospace', fontSize: '9px', color: '#1b1b2a', backgroundColor: '#f4e9d0',
      padding: { x: 6, y: 4 }, resolution: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.toastObj = t;
    this.tweens.add({ targets: t, alpha: 0, delay: 1500, duration: 300, onComplete: () => t.destroy() });
  }
}
