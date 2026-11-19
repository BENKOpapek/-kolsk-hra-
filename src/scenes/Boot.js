// Načíta grafiku a pripraví animácie postáv.
export const TILE = { floor: 0, floor2: 1, wallTop: 2, wallFace: 3, door: 4, locker: 5, vitrina: 6, portret: 7, void: 8, roof: 9 };
const DIRS = ['down', 'up', 'left', 'right']; // poradie riadkov v spritesheete postavy

export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    const sheet = { frameWidth: 16, frameHeight: 16 };
    this.load.spritesheet('tiles', 'assets/tiles.png', sheet);
    this.load.spritesheet('player_boy', 'assets/player_boy.png', sheet);
    this.load.spritesheet('player_girl', 'assets/player_girl.png', sheet);
  }

  create() {
    for (const key of ['player_boy', 'player_girl']) {
      DIRS.forEach((dir, row) => {
        const f = (c) => ({ key, frame: row * 3 + c });
        this.anims.create({ key: `${key}-walk-${dir}`, frames: [f(1), f(0), f(2), f(0)], frameRate: 10, repeat: -1 });
        this.anims.create({ key: `${key}-idle-${dir}`, frames: [f(0)] });
      });
    }
    this.scene.start('Corridor');
  }
}
