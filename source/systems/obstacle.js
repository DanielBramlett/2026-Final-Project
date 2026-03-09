// obstacle.js
export class Obstacle {
  constructor(scene, x, y, width, height, textureKey) {
    this.scene = scene;

    // Rectangle collision area
    this.rect = new Phaser.Geom.Rectangle(
      x - width / 2,
      y - height / 2,
      width,
      height
    );

    // Image (scaled to fit the rect)
    this.image = scene.add.image(x, y, textureKey);
    this.image.setDisplaySize(width, height);
  }
}