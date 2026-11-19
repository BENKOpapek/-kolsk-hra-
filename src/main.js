import { computeView } from './logic/view.js';
import { Boot } from './scenes/Boot.js';
import { Corridor } from './scenes/Corridor.js';

const v = computeView(innerWidth, innerHeight);
const game = new Phaser.Game({
  type: Phaser.AUTO,
  pixelArt: true,
  backgroundColor: '#1b1b2a',
  scale: { mode: Phaser.Scale.NONE, width: v.width, height: v.height, zoom: v.zoom },
  scene: [Boot, Corridor],
});

addEventListener('resize', () => {
  const n = computeView(innerWidth, innerHeight);
  game.scale.setZoom(n.zoom);
  game.scale.resize(n.width, n.height);
});

window.game = game;
