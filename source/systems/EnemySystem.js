import Ship from '../entities/Ship.js';
import { SHIP_TYPES } from '../constants/shipTypes.js';

export default class EnemySystem {
    constructor(scene) {
        this.scene = scene;
        this.enemyShips = [];
    }

    createEnemyShips() {
        this.enemyShips = [];
        this.spawnEnemyShip(SHIP_TYPES.SLOOP);
        this.spawnEnemyShip(SHIP_TYPES.GALLEON);
        this.spawnEnemyShip(SHIP_TYPES.FIRST_RATE);
        this.spawnEnemyShip(SHIP_TYPES.DUKE_OF_KENT);
        return this.enemyShips;
    }

    spawnEnemyShip(shipType) {
        const minDistanceFromPlayer = (this.scene.playerShip.size / 2) + (shipType.size / 2) + 100; // Add 100px buffer
        let x, y, distanceFromPlayer, validPosition;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            validPosition = true;
            
            // Try to spawn in a random position around the player
            const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
            const spawnDistance = Phaser.Math.Between(minDistanceFromPlayer, 2000);
            
            x = this.scene.playerShip.x + Math.cos(angle) * spawnDistance;
            y = this.scene.playerShip.y + Math.sin(angle) * spawnDistance;
            
            // Calculate distance from player
            const dx = x - this.scene.playerShip.x;
            const dy = y - this.scene.playerShip.y;
            distanceFromPlayer = Math.sqrt(dx * dx + dy * dy);
            
            // Check if too close to player
            if (distanceFromPlayer < minDistanceFromPlayer) {
                validPosition = false;
            }
            
            // Check collision with islands
            for (const island of this.scene.islands) {
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
            
            // Check collision with ports
            if (validPosition) {
                for (const port of this.scene.ports) {
                    const portDx = x - port.x;
                    const portDy = y - port.y;
                    const portDistance = Math.sqrt(portDx * portDx + portDy * portDy);
                    
                    // Calculate minimum distance from port (port size + ship size + buffer)
                    const portRadius = Math.max(port.displayWidth, port.displayHeight) / 2;
                    const shipRadius = shipType.size / 2;
                    const minPortDistance = portRadius + shipRadius + 100; // 100px buffer
                    
                    if (portDistance < minPortDistance) {
                        validPosition = false;
                        break;
                    }
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
        const enemyShip = new Ship(this.scene, x, y, shipType);
        this.enemyShips.push(enemyShip);
        return enemyShip;
    }

    setupCollisions() {
        // Enemy ship collisions with islands
        this.enemyShips.forEach(ship => {
            this.scene.physics.add.collider(ship, this.scene.islands);
            this.scene.physics.add.collider(ship, this.scene.ports);
        });
        
        // Enemy ship to enemy ship collisions with size-based physics
        for (let i = 0; i < this.enemyShips.length; i++) {
            for (let j = i + 1; j < this.enemyShips.length; j++) {
                this.scene.physics.add.overlap(this.enemyShips[i], this.enemyShips[j], this.scene.handleShipCollision, null, this.scene);
            }
        }
    }

    update(time, delta) {
        this.enemyShips.forEach(ship => ship.update(time, delta));
    }
}
