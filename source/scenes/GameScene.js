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
        this.cameras.main.setBackgroundColor('#02468b');
        
        // Enable physics with arcade mode
        this.physics.world.setBounds(0, 0, 1600, 1200);

        // Create player ship
        this.playerShip = new Ship(
            this,
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            SHIP_TYPES.SLOOP,
        );

        this.directionArrow = this.add.graphics({ x: 0, y: 0, add: false}),
        
        
        // Create some enemy ships
        this.enemyShips = [];
        this.enemyShips.push(new Ship(this, 450, 350, SHIP_TYPES.SLOOP));
        this.enemyShips.push(new Ship(this, 1200, 400, SHIP_TYPES.GALLEON));
        this.enemyShips.push(new Ship(this, 800, 900, SHIP_TYPES.FIRST_RATE));
        
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
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            i: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I)
        };
        this.infoBoxVisible = true;
        this.infoBoxToggleDelay =0;
        this.infoBoxToggleDelayMax = 300; // milliseconds
    }

    update(time, delta) {
        this.infoBoxToggleDelay -= delta;

        if (this.keys.i.isDown && this.infoBoxToggleDelay <= 0) {
            this.infoBoxVisible = !this.infoBoxVisible;
            this.infoText.setVisible(this.infoBoxVisible);
            this.infoBoxToggleDelay = this.infoBoxToggleDelayMax;
        }
        if (this.keys.i.isDown) {
            this.infoBoxToggled = false;
        }
        
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
        this.playerShip.update(time, delta);
        
        // Update enemy ships
        this.enemyShips.forEach(ship => ship.update(time, delta));
        
const arrowDistance = 80;
const arrowX = this.playerShip.x + Math.cos(this.playerShip.rotation) * arrowDistance;
const arrowY = this.playerShip.y + Math.sin(this.playerShip.rotation) * arrowDistance;
this.directionArrow.clear();
this.directionArrow.fillStyle(0xFFD700, 1);
this.directionArrow.beginPath();
this.directionArrow.moveTo(arrowX, arrowY);
this.directionArrow.lineTo(
    arrowX - 15 * Math.cos(this.playerShip.rotation - 0.4),
    arrowY - 15 * Math.sin(this.playerShip.rotation - 0.4)
);
this.directionArrow.lineTo(
    arrowX - 15 * Math.cos(this.playerShip.rotation + 0.4),
    arrowY - 15 * Math.sin(this.playerShip.rotation + 0.4)
);
this.directionArrow.closePath();
this.directionArrow.fillPath();

        // Update info text
        this.infoText.setText([
            `Ship: ${this.playerShip.shipType.name}`,
            `Cannons: ${this.playerShip.cannons}`,
            `Speed: ${this.playerShip.speed}`,
            `Turn Speed: ${this.playerShip.turnSpeed}`,
            `Rowing: ${this.playerShip.rowing}`,
            `Crew: ${this.playerShip.crew}/${this.playerShip.crewMax}`,
            `Controls: W/S - For/Back`,
            `A/D - Rotate`,
            `I - Toggle Info`
        ]);
    }
}
