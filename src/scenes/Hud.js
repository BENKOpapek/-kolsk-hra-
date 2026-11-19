// Vrstva rozhrania nad hrou (toasty, neskôr dialógy). Súradnice sú v herných pixeloch.
export class Hud extends Phaser.Scene {
  constructor() { super('Hud'); }

  create() {
    const cam = this.cameras.main.setOrigin(0);
    const apply = (z) => { cam.setZoom(z); this.z = z; };
    apply(this.registry.get('zoom'));
    this.registry.events.on('changedata-zoom', (_, z) => apply(z));
  }

  get viewW() { return this.cameras.main.width / this.z; }
  get viewH() { return this.cameras.main.height / this.z; }

  toast(msg) {
    this.toastObj?.destroy();
    const t = this.add.text(this.viewW / 2, this.viewH - 20, msg, {
      fontFamily: 'system-ui, sans-serif', fontSize: '9px', color: '#3b2a22', backgroundColor: '#f4e9d0',
      padding: { x: 6, y: 4 }, resolution: this.z,
    }).setOrigin(0.5);
    this.toastObj = t;
    this.tweens.add({ targets: t, alpha: 0, delay: 1500, duration: 300, onComplete: () => t.destroy() });
  }
}
