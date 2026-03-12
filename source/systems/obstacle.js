// obstacle.js
export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, width, height, textureKey) {
    super(scene, x, y, textureKey);
    
    this.scene = scene;
    
    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = static body
    
    // Set display size
    this.setDisplaySize(width, height);
    
    // Set physics body size to match display size
    this.body.setSize(width, height);
    
    // Apply offset to center the physics body properly (similar to ships)
    this.body.setOffset(-width/2, -height/2);
  }
}