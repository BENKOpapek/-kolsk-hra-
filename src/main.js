import { computeView } from './logic/view.js';
import { Boot } from './scenes/Boot.js';
import { Corridor } from './scenes/Corridor.js';
import { Hud } from './scenes/Hud.js';

const view = () => computeView(innerWidth, innerHeight, devicePixelRatio || 1);
const v = view();
const game = new Phaser.Game({
  type: Phaser.AUTO,
  pixelArt: true,
  backgroundColor: '#1b1b2a',
  // Canvas má natívne pixely, CSS ho zmenší späť na veľkosť okna.
  scale: { mode: Phaser.Scale.NONE, width: v.width, height: v.height, zoom: 1 / (devicePixelRatio || 1) },
  scene: [Boot, Corridor, Hud],
});
game.registry.set('zoom', v.zoom);

addEventListener('resize', () => {
  const n = view();
  game.scale.resize(n.width, n.height);
  game.scale.setZoom(1 / (devicePixelRatio || 1));
  game.registry.set('zoom', n.zoom);
});

window.game = game;
