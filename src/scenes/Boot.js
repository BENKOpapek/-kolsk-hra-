// Etapa 1: dočasné textúry ako farebné štvorce (Etapa 2 ich nahradí PNG pod rovnakými kľúčmi).
const COLORS = {
  floor: 0xe8d9b5, wall: 0x6b4a3a, void: 0x1b1b2a, door: 0x4f8a4b,
  locker: 0x3e6fa8, vitrina: 0x4fb3b0, portret: 0xd4a73c,
};

export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    const g = this.add.graphics();
    for (const [key, color] of Object.entries(COLORS)) {
      g.clear().fillStyle(color).fillRect(0, 0, 16, 16).lineStyle(1, 0x000000, 0.15).strokeRect(0.5, 0.5, 15, 15);
      g.generateTexture(key, 16, 16);
    }
    g.clear().fillStyle(0xc8463c).fillRect(2, 1, 12, 14).fillStyle(0xf2c9a0).fillRect(4, 2, 8, 5);
    g.generateTexture('player', 16, 16);
    g.destroy();
    this.scene.start('Corridor');
  }
}
