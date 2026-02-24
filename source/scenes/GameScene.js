import Ship from '../entities/Ship.js';
import { SHIP_TYPES } from '../constants/shipTypes.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Load assets here
    }

    create() {
        // Enable physics with arcade mode
        this.physics.world.setBounds(0, 0, 1600, 1200);
        
        // Create player ship (Brigantine in the center)
        this.playerShip = new Ship(
            this,
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            SHIP_TYPES.BRIGANTINE
        );
        
        // Create some enemy ships
        this.enemyShips = [];
        this.enemyShips.push(new Ship(this, 400, 300, SHIP_TYPES.SLOOP));
        this.enemyShips.push(new Ship(this, 1200, 400, SHIP_TYPES.GALLEON));
        this.enemyShips.push(new Ship(this, 800, 900, SHIP_TYPES.SLOOP));
        
        // Setup input
        this.setupInput();
        
        // Set up camera to follow player
        this.cameras.main.startFollow(this.playerShip);
        
        // Add info text
        this.infoText = this.add.text(16, 16, '', {
            fontSize: '16px',
            fill: '#fff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.infoText.setScrollFactor(0);
    }

    setupInput() {
        this.keys = {
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
    }

    update() {
        // Handle player input
        if (this.keys.w.isDown) {
            this.playerShip.moveForward();
        }
        if (this.keys.s.isDown) {
            this.playerShip.moveBackward();
        }
        if (this.keys.a.isDown) {
            this.playerShip.rotateLeft();
        } else if (this.keys.d.isDown) {
            this.playerShip.rotateRight();
        } else {
            this.playerShip.stopRotation();
        }
        
        // If neither forward nor backward is pressed, stop
        if (!this.keys.w.isDown && !this.keys.s.isDown) {
            this.playerShip.stop();
        }
        
        // Update player ship
        this.playerShip.update();
        
        // Update enemy ships
        this.enemyShips.forEach(ship => ship.update());
        
        // Update info text
        this.infoText.setText([
            `Ship: ${this.playerShip.shipType.name}`,
            `Cannons: ${this.playerShip.cannons}`,
            `Speed: ${this.playerShip.speed}`,
            `Turn Speed: ${this.playerShip.turnSpeed}`,
            'Controls: W/S - Forward/Backward, A/D - Rotate'
        ]);
    }
}
