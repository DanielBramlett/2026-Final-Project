import Ship from '../entities/Ship.js';
import { SHIP_TYPES } from '../constants/shipTypes.js';
import WindSystem from '../systems/WindSystem.js'; 

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

        this.windSystem = new WindSystem(this, 20000); // Change wind every 20 seconds

        // Create player ship
        this.playerShip = new Ship(
            this,
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            SHIP_TYPES.BRIGANTINE,
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
        this.windInfoText = this.add.text(16, 100, '', {
            fontSize: '16px',
            fill: '#fff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.windInfoText.setScrollFactor(0);
        this.windInfoText.setOrigin(1,1);
        this.windInfoText.setPosition(this.cameras.main.width - 16, this.cameras.main.height - 16);
        this.windArrow = this.add.graphics({ x: 0, y: 0, add: false });
        this.windArrow.setScrollFactor(0);
        this.add.existing(this.windArrow);
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
    this.windSystem.update(delta);
        const windEffect = this.windSystem.getWindEffect(this.playerShip.rotation);
        const windBaseBoost = this.playerShip.speed * windEffect.factor * this.playerShip.shipType.windResistance; 
        const windBoost = Math.min(windBaseBoost, this.playerShip.speed * 0.5); // Cap the boost at 50 for display purposes
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
            this.playerShip.applyDeceleration();
        }
        
        // Update player ship
        this.playerShip.update(time, delta);
        
        // Update enemy ships
        this.enemyShips.forEach(ship => ship.update(time, delta));
        
const arrowDistance = this.playerShip.size / 2 + 20;
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
            `Cargo: ${this.playerShip.cargo} / ${this.playerShip.cargoMax}`,
            `Crew: ${this.playerShip.crew}/${this.playerShip.crewMax}`,
            `Controls: W/S - For/Back`,
            `A/D - Rotate`,
            `I - Toggle Info`
        ]);
        const wind = this.windSystem.getWindEffect(this.playerShip.rotation);
        this.windInfoText.setText([
            `Wind Speed: ${wind.speed.toFixed(0)}`,
            `Speed Boost: ${Math.round(windBoost)}`,
        ]);

        const windArrowX = this.cameras.main.width - 70;
        const windArrowY = this.cameras.main.height - 70;
        const arrowSize = 20;
        this.windArrow.clear();
        this.windArrow.fillStyle(0x00FFFF, 1);
        this.windArrow.save();
        this.windArrow.translateCanvas(windArrowX, windArrowY);
        this.windArrow.rotateCanvas(this.windSystem.direction + Math.PI / 2); // Rotate to match wind direction
        this.windArrow.fillTriangleShape(new Phaser.Geom.Triangle(
            0, -arrowSize,
            -arrowSize / 2, arrowSize / 2,
            arrowSize / 2, arrowSize / 2
        ));
        this.windArrow.restore();
    }
}
