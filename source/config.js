import GameScene from "./scenes/GameScene.js";

export const gameConfig = {
  type: Phaser.AUTO,
  width: 2000,
  height: 1300,
  backgroundColor: "#2d2d2d",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 },
    },
  },
  scene: GameScene,
};
