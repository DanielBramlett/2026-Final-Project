import Ship from '../entities/Ship.js';
import { SHIP_TYPES } from '../constants/shipTypes.js';
import WindSystem from '../systems/WindSystem.js'; 
import { Obstacle } from '../systems/Obstacle.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Load assets here
        this.load.image('Sloop_East', 'assets/Sloop_East.png');
        this.load.image('Sloop_West', 'assets/Sloop_West.png');
        this.load.image('Brigantine_East', 'assets/Brigantine_East.png')
        this.load.image('Brigantine_West', 'assets/Brigantine_West.png')
        this.load.image('Clipper_East', 'assets/Clipper_East.png')
        this.load.image('Clipper_West', 'assets/Clipper_West.png')
        this.load.image('Frigate_East', 'assets/Frigate_East.png')
        this.load.image('Frigate_West', 'assets/Frigate_West.png')
        this.load.image('Sloop_of_War_East', 'assets/Sloop_of_War_East.png')
        this.load.image('Sloop_of_War_West', 'assets/Sloop_of_War_West.png')
        this.load.image('Galleon_East', 'assets/Galleon_East.png')
        this.load.image('Galleon_West', 'assets/Galleon_West.png')
        this.load.image('Galley_East_1', 'assets/Galley_East_1.png')
        this.load.image('Galley_East_2', 'assets/Galley_East_2.png')
        this.load.image('Galley_East_3', 'assets/Galley_East_3.png')
        this.load.image('Galley_West_1', 'assets/Galley_West_1.png')
        this.load.image('Galley_West_2', 'assets/Galley_West_2.png')
        this.load.image('Galley_West_3', 'assets/Galley_West_3.png')
        this.load.image('First_Rate_East', 'assets/First_Rate_East.png')
        this.load.image('First_Rate_West', 'assets/First_Rate_West.png')
        this.load.image('Duke_of_Kent_East', 'assets/Duke_of_Kent_East.png')
        this.load.image('Duke_of_Kent_West', 'assets/Duke_of_Kent_West.png')
        this.load.image('Ketch_East', 'assets/Ketch_East.png')
        this.load.image('Ketch_West', 'assets/Ketch_West.png')
        this.load.image('Schooner_East', 'assets/Schooner_East.png')
        this.load.image('Schooner_West', 'assets/Schooner_West.png')
        this.load.image('Caravel_East', 'assets/Caravel_East.png')
        this.load.image('Caravel_West', 'assets/Caravel_West.png')
        this.load.image('Cutter_East', 'assets/Cutter_East.png')
        this.load.image('Cutter_West', 'assets/Cutter_West.png')
        this.load.image('Barque_East', 'assets/Barque_East.png')
        this.load.image('Barque_West', 'assets/Barque_West.png')
        this.load.image('Brig_East', 'assets/Brig_East.png')
        this.load.image('Brig_West', 'assets/Brig_West.png')
        this.load.image('Xebec_East', 'assets/Xebec_East.png')
        this.load.image('Xebec_West', 'assets/Xebec_West.png')
        this.load.image('Carrack_East', 'assets/Carrack_East.png')
        this.load.image('Carrack_West', 'assets/Carrack_West.png')
        this.load.image('Barquentine_East', 'assets/Barquentine_East.png')
        this.load.image('Barquentine_West', 'assets/Barquentine_West.png')
        this.load.image('Island', 'assets/Island.png');
        this.load.image('Light_Galley_East_1', 'assets/Light_Galley_East_1.png');
        this.load.image('Light_Galley_West_1', 'assets/Light_Galley_West_1.png');
        this.load.image('Light_Galley_East_1', 'assets/Light_Galley_East_1.png');
        this.load.image('Light_Galley_West_1', 'assets/Light_Galley_West_1.png');
        this.load.image('Light_Galley_East_2', 'assets/Light_Galley_East_2.png');
        this.load.image('Light_Galley_West_2', 'assets/Light_Galley_West_2.png');
        this.load.image('Light_Galley_East_3', 'assets/Light_Galley_East_3.png');
        this.load.image('Light_Galley_West_3', 'assets/Light_Galley_West_3.png');
        this.load.image('Galloit_East_1', 'assets/Galloit_East_1.png');
        this.load.image('Galloit_West_1', 'assets/Galloit_West_1.png');
        this.load.image('Galloit_East_2', 'assets/Galloit_East_2.png');
        this.load.image('Galloit_West_2', 'assets/Galloit_West_2.png');
        this.load.image('Galloit_East_3', 'assets/Galloit_East_3.png');
        this.load.image('Galloit_West_3', 'assets/Galloit_West_3.png');
        this.load.image('Galleass_East_1', 'assets/Galleass_East_1.png');
        this.load.image('Galleass_West_1', 'assets/Galleass_West_1.png');
        this.load.image('Galleass_East_2', 'assets/Galleass_East_2.png');
        this.load.image('Galleass_West_2', 'assets/Galleass_West_2.png');
        this.load.image('Galleass_East_3', 'assets/Galleass_East_3.png');
        this.load.image('Galleass_West_3', 'assets/Galleass_West_3.png');
        this.load.image('Fourth_Rate_East', 'assets/Fourth_Rate_East.png');
        this.load.image('Fourth_Rate_West', 'assets/Fourth_Rate_West.png');
        this.load.image('Third_Rate_East', 'assets/Third_Rate_East.png');
        this.load.image('Third_Rate_West', 'assets/Third_Rate_West.png');
        this.load.image('Second_Rate_East', 'assets/Second_Rate_East.png');
        this.load.image('Second_Rate_West', 'assets/Second_Rate_West.png');
        this.load.image('Port', 'assets/Port.png')
    }

    create() {
        this.cameras.main.setBackgroundColor('#02468b');
        
        // Enable physics with arcade mode
        this.physics.world.setBounds(0, 0, 10000, 5000);

        this.windSystem = new WindSystem(this, 20000); // Change wind every 20 seconds

        // Create player ship
        this.playerShip = new Ship(
            this,
            2000,
            2000,
            SHIP_TYPES.GALLEASS,
        );
        this.playerShip.isPlayer = true; // Mark as player ship for red hitbox

        this.islands = [];
        this.islands.push(new Obstacle(this, 1500, 1500, 300, 300, 'Island'));
        this.islands.push(new Obstacle(this, 2500, 2500, 400, 400, 'Island'));
        this.islands.push(new Obstacle(this, 2000, 1000, 200, 200, 'Island'));
        this.islands.push(new Obstacle(this, 1000, 0, 500, 500, 'Island'));

        // Create some enemy ships after islands are created
        this.enemyShips = [];
        this.spawnEnemyShip(SHIP_TYPES.SLOOP);
        this.spawnEnemyShip(SHIP_TYPES.GALLEON);
        this.spawnEnemyShip(SHIP_TYPES.FIRST_RATE);
        this.spawnEnemyShip(SHIP_TYPES.DUKE_OF_KENT);
        
        
        this.directionArrow = this.add.graphics({ x: 0, y: 0, add: false}),
        
        
        // Setup input
        this.setupInput();
        
        // Set up camera to follow player
        this.cameras.main.startFollow(this.playerShip);
        
        // Setup physics collisions after all ships are created
        this.setupCollisions();
        
        // Add info text
        this.infoText = this.add.text(16, 16, '', {
            fontSize: '30px',
            fill: '#fff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.infoText.setScrollFactor(0);
        this.windInfoText = this.add.text(16, 100, '', {
            fontSize: '30px',
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
        
        // Add world border
        this.addWorldBorder();
    }

    addWorldBorder() {
        const borderWidth = 5;
        const worldBounds = this.physics.world.bounds;
        
        // Create border graphics
        const border = this.add.graphics();
        border.lineStyle(borderWidth, 0xFF0000, 1); // Red border
        
        // Draw rectangle around world bounds
        border.strokeRect(
            worldBounds.x + borderWidth/2, 
            worldBounds.y + borderWidth/2, 
            worldBounds.width - borderWidth, 
            worldBounds.height - borderWidth
        );
        
        // Set scroll factor so border stays in world space
        border.setScrollFactor(1);
    }

    setupCollisions() {
        // Player ship collisions with islands
        this.physics.add.collider(this.playerShip, this.islands);
        
        // Enemy ship collisions with islands
        this.enemyShips.forEach(ship => {
            this.physics.add.collider(ship, this.islands);
        });
        
        // Ship-to-ship collisions with size-based physics
        this.physics.add.overlap(this.playerShip, this.enemyShips, this.handleShipCollision, null, this);
        
        // Enemy ship to enemy ship collisions with size-based physics
        for (let i = 0; i < this.enemyShips.length; i++) {
            for (let j = i + 1; j < this.enemyShips.length; j++) {
                this.physics.add.overlap(this.enemyShips[i], this.enemyShips[j], this.handleShipCollision, null, this);
            }
        }
    }

    handleShipCollision(ship1, ship2) {
        // Determine which ship is larger
        const ship1Larger = ship1.size >= ship2.size;
        const largerShip = ship1Larger ? ship1 : ship2;
        const smallerShip = ship1Larger ? ship2 : ship1;
        
        // If ships are the same size, both should react (normal physics)
        if (ship1.size === ship2.size) {
            // Apply normal collision physics
            this.physics.world.collide(ship1, ship2);
            return;
        }
        
        // Make larger ship immovable, smaller ship movable
        largerShip.body.setImmovable(true);
        smallerShip.body.setImmovable(false);
        
        // Apply collision
        this.physics.world.collide(largerShip, smallerShip);
        
        // Reset immovable state for larger ship
        largerShip.body.setImmovable(false);
    }

    spawnEnemyShip(shipType) {
        const minDistanceFromPlayer = (this.playerShip.size / 2) + (shipType.size / 2) + 100; // Add 100px buffer
        let x, y, distanceFromPlayer, validPosition;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            validPosition = true;
            
            // Try to spawn in a random position around the player
            const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
            const spawnDistance = Phaser.Math.Between(minDistanceFromPlayer, 2000);
            
            x = this.playerShip.x + Math.cos(angle) * spawnDistance;
            y = this.playerShip.y + Math.sin(angle) * spawnDistance;
            
            // Calculate distance from player
            const dx = x - this.playerShip.x;
            const dy = y - this.playerShip.y;
            distanceFromPlayer = Math.sqrt(dx * dx + dy * dy);
            
            // Check if too close to player
            if (distanceFromPlayer < minDistanceFromPlayer) {
                validPosition = false;
            }
            
            // Check collision with islands
            for (const island of this.islands) {
                const islandDx = x - island.x;
                const islandDy = y - island.y;
                const islandDistance = Math.sqrt(islandDx * islandDx + islandDy * islandDy);
                
                // Calculate minimum distance from island (island size + ship size + buffer)
                const islandRadius = Math.max(island.displayWidth, island.displayHeight) / 2;
                const shipRadius = shipType.size / 2;
                const minIslandDistance = islandRadius + shipRadius + 50; // 50px buffer
                
                if (islandDistance < minIslandDistance) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check collision with existing enemy ships
            if (validPosition) {
                for (const existingShip of this.enemyShips) {
                    const shipDx = x - existingShip.x;
                    const shipDy = y - existingShip.y;
                    const shipDistance = Math.sqrt(shipDx * shipDx + shipDy * shipDy);
                    
                    // Calculate minimum distance from existing ship (both ship sizes + buffer)
                    const existingShipRadius = existingShip.size / 2;
                    const newShipRadius = shipType.size / 2;
                    const minShipDistance = existingShipRadius + newShipRadius + 100; // 100px buffer
                    
                    if (shipDistance < minShipDistance) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            attempts++;
        } while (!validPosition && attempts < maxAttempts);
        
        // Create the enemy ship at the valid position
        const enemyShip = new Ship(this, x, y, shipType);
        this.enemyShips.push(enemyShip);
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
        this.infoBoxToggleDelayMax = 150; // milliseconds
    }

    update(time, delta) {
    this.windSystem.update(delta);
        const windEffect = this.windSystem.getWindEffect(this.playerShip.facingAngle);
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
        
const arrowDistance = this.playerShip.size / 2 + 30;
const arrowX = this.playerShip.x + Math.cos(this.playerShip.facingAngle) * arrowDistance;
const arrowY = this.playerShip.y + Math.sin(this.playerShip.facingAngle) * arrowDistance;
this.directionArrow.clear();
this.directionArrow.fillStyle(0xFF0030, 1);
this.directionArrow.beginPath();
this.directionArrow.moveTo(arrowX, arrowY);
this.directionArrow.lineTo(
    arrowX - 15 * Math.cos(this.playerShip.facingAngle - 0.4),
    arrowY - 15 * Math.sin(this.playerShip.facingAngle - 0.4)
);
this.directionArrow.lineTo(
    arrowX - 15 * Math.cos(this.playerShip.facingAngle + 0.4),
    arrowY - 15 * Math.sin(this.playerShip.facingAngle + 0.4)
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
        const wind = this.windSystem.getWindEffect(this.playerShip.facingAngle);
        this.windInfoText.setText([
            `Wind Speed: ${wind.speed.toFixed(0)}`,
            `Speed Boost: ${Math.round(windBoost)}`,
        ]);

        const windArrowX = this.cameras.main.width - 110;
        const windArrowY = this.cameras.main.height - 120;
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
