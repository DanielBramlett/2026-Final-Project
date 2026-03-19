import Ship from '../entities/Ship.js';
import { SHIP_TYPES } from '../constants/shipTypes.js';

export default class PlayerSystem {
    constructor(scene) {
        this.scene = scene;
        this.playerShip = null;
        this.keys = null;
        this.infoBoxVisible = true;
        this.infoBoxToggleDelay = 0;
        this.infoBoxToggleDelayMax = 150; // milliseconds
        this.cargoMenuVisible = false;
        this.cargoBackground = null;
        this.cargoTitle = null;
        this.cargoText = null;
    }

    createPlayerShip(x, y, shipType) {
        this.playerShip = new Ship(
            this.scene,
            x,
            y,
            shipType,
        );
        this.playerShip.isPlayer = true; // Mark as player ship for red hitbox
        return this.playerShip;
    }

    setupInput() {
        this.keys = {
            w: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            s: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            a: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            d: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            i: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
            e: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            r: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
            space: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };

        // Add mouse input for cannon firing
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.fireCannons('left');
            } else if (pointer.middleButtonDown()) {
                this.fireCannons('right');
            }
        });
    }

    handleInput() {
        if (this.keys.i.isDown && this.infoBoxToggleDelay <= 0) {
            this.infoBoxVisible = !this.infoBoxVisible;
            this.scene.infoText.setVisible(this.infoBoxVisible);
            this.infoBoxToggleDelay = this.infoBoxToggleDelayMax;
        }
        if (this.keys.i.isDown) {
            this.infoBoxToggled = false;
        }
        
        // Handle R key for cargo menu (changed from E)
        if (Phaser.Input.Keyboard.JustDown(this.keys.r)) {
            if (this.cargoMenuVisible) {
                this.hideCargoMenu();
            } else {
                this.showCargoMenu();
            }
        }
        
        // Handle Space key for firing cannons
        if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
            this.fireCannons('both');
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
    }

    changePlayerShip(newShipType) {
        // Store old position, velocity, facing angle, and player data
        const oldX = this.playerShip.x;
        const oldY = this.playerShip.y;
        const oldVelocityX = this.playerShip.velocityX;
        const oldVelocityY = this.playerShip.velocityY;
        const oldFacingAngle = this.playerShip.facingAngle;
        const oldSize = this.playerShip.size;
        
        // Save player's gold, cargo, and owned ships
        const savedGold = this.playerShip.gold;
        const savedCargo = { ...this.playerShip.tradeGoods };
        const savedOwnedShips = [...this.playerShip.ownedShips];
        
        // Find the nearest port to spawn outside of
        let nearestPort = null;
        let minDistance = Infinity;
        this.scene.ports.forEach(port => {
            const distance = Phaser.Math.Distance.Between(oldX, oldY, port.x, port.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPort = port;
            }
        });
        
        // Calculate spawn position outside the port
        let spawnX = oldX;
        let spawnY = oldY;
        
        if (nearestPort && minDistance < 800) { // If player is within 800px of a port
            // Calculate angle from port to player
            const angleFromPort = Math.atan2(oldY - nearestPort.y, oldX - nearestPort.x);
            // Spawn player well outside the port along the same angle
            const portRadius = Math.max(nearestPort.width, nearestPort.height) / 2;
            const spawnDistance = portRadius + 650; // 650px buffer outside port
            
            // Try multiple spawn positions to avoid enemy ships
            let validSpawnFound = false;
            let attempts = 0;
            const maxAttempts = 10; // Try 10 different angles
            const safeSpawnDistance = 200; // Minimum distance from enemy ships
            
            while (!validSpawnFound && attempts < maxAttempts) {
                const currentAngle = angleFromPort + (attempts * Math.PI / 4); // Try different angles
                spawnX = nearestPort.x + Math.cos(currentAngle) * spawnDistance;
                spawnY = nearestPort.y + Math.sin(currentAngle) * spawnDistance;
                
                // Check if spawn position is safe from enemy ships
                validSpawnFound = true;
                for (const enemyShip of this.scene.enemyShips) {
                    const distanceToEnemy = Phaser.Math.Distance.Between(spawnX, spawnY, enemyShip.x, enemyShip.y);
                    const minSafeDistance = (newShipType.size / 2) + (enemyShip.size / 2) + safeSpawnDistance;
                    
                    if (distanceToEnemy < minSafeDistance) {
                        validSpawnFound = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            // If no safe position found, use the original position as fallback
            if (!validSpawnFound) {
                spawnX = nearestPort.x + Math.cos(angleFromPort) * spawnDistance;
                spawnY = nearestPort.y + Math.sin(angleFromPort) * spawnDistance;
                console.log('No safe spawn position found, using fallback position');
            }
            
            console.log(`Port: ${nearestPort.portName}, Port radius: ${portRadius}, Spawn distance: ${spawnDistance}`);
            console.log(`Player old pos: (${oldX}, ${oldY}), New spawn pos: (${spawnX}, ${spawnY})`);
            console.log(`Safe spawn found: ${validSpawnFound}, Attempts: ${attempts}`);
        }
        
        // Destroy old player ship
        this.playerShip.hitboxCircle.destroy();
        this.playerShip.destroy();
        
        // Create new player ship at the spawn position
        this.playerShip = new Ship(this.scene, spawnX, spawnY, newShipType);
        this.playerShip.isPlayer = true; // Mark as player ship for red hitbox
        
        // Restore player's gold, cargo, and owned ships
        this.playerShip.gold = savedGold;
        this.playerShip.tradeGoods = savedCargo;
        this.playerShip.ownedShips = savedOwnedShips;
        this.playerShip.cargo = this.playerShip.getCurrentCargo();
        
        // Restore movement properties
        this.playerShip.velocityX = oldVelocityX;
        this.playerShip.velocityY = oldVelocityY;
        this.playerShip.facingAngle = oldFacingAngle;
        
        // Update camera to follow new ship
        this.scene.cameras.main.startFollow(this.playerShip);
        
        // Update GameScene's playerShip reference
        this.scene.playerShip = this.playerShip;
        
        // Update UI systems to reference the new player ship
        this.scene.ammoUI.playerShip = this.playerShip;
        this.scene.statsUI.playerShip = this.playerShip;
        
        // Update collisions with new player ship
        this.scene.physics.add.collider(this.playerShip, this.scene.islands);
        this.scene.physics.add.collider(this.playerShip, this.scene.ports);
        this.scene.physics.add.overlap(this.playerShip, this.scene.enemyShips, this.scene.handleShipCollision, null, this.scene);
        
        // Update all ports to recognize the new player ship
        this.scene.ports.forEach(port => {
            // Remove old overlap if it exists
            if (port.contactOverlap) {
                port.contactOverlap.destroy();
            }
            
            // Create new overlap with the new player ship using direct contact
            port.contactOverlap = this.scene.physics.add.overlap(
                this.playerShip,
                port,
                (player, portObj) => {
                    if (!port.playerInContact) {
                        console.log('Port: Player made direct contact with', port.portName);
                        port.playerInContact = true;
                        port.showContactPopup();
                    }
                },
                null,
                port
            );
        });
        
        console.log(`Player ship changed to: ${newShipType.name} (size: ${oldSize} -> ${newShipType.size})`);
        console.log(`Gold and cargo preserved. Spawned outside port at (${spawnX}, ${spawnY})`);
    }

    update(time, delta) {
        this.infoBoxToggleDelay -= delta;
        this.handleInput();
        this.playerShip.update(time, delta);
    }

    // Expose the changePlayerShip method for external calls
    getPlayerShip() {
        return this.playerShip;
    }

    // Expose cargo menu state for info text visibility
    isInfoBoxVisible() {
        return this.infoBoxVisible;
    }

    showCargoMenu() {
        if (this.cargoMenuVisible) return;
        
        this.cargoMenuVisible = true;
        
        const menuX = this.scene.cameras.main.width / 2;
        const menuY = this.scene.cameras.main.height / 2;
        
        // Create cargo menu background
        this.cargoBackground = this.scene.add.rectangle(
            menuX, menuY, 600, 500, 0x000000, 0.9
        );
        this.cargoBackground.setScrollFactor(0);
        this.cargoBackground.setDepth(1000);
        
        // Create cargo menu title
        this.cargoTitle = this.scene.add.text(
            menuX, menuY - 180, 'Cargo Hold', {
                fontSize: '48px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        this.cargoTitle.setScrollFactor(0);
        this.cargoTitle.setDepth(1001);
        this.cargoTitle.setOrigin(0.5, 0.5);
        
        // Create cargo info text
        const cargoInfo = [
            `Gold: ${this.playerShip.gold}`,
            `Cargo Space: ${this.playerShip.getCurrentCargo()} / ${this.playerShip.cargoMax}`,
            '',
            'Trade Goods:'
        ];
        
        // Add only the trade goods that the player has (amount > 0)
        Object.entries(this.playerShip.tradeGoods).forEach(([goodType, amount]) => {
            if (amount > 0) {
                // Format the good name to be more readable (capitalize first letter, handle special cases)
                const formattedName = goodType.charAt(0).toUpperCase() + goodType.slice(1).toLowerCase();
                cargoInfo.push(`${formattedName}: ${amount} units`);
            }
        });
        
        // Add empty line and close instruction if there are any goods, otherwise show empty message
        if (cargoInfo.length > 4) {
            cargoInfo.push('', 'Press R to close');
        } else {
            cargoInfo.push('(No trade goods in cargo)', '', 'Press R to close');
        }
        
        this.cargoText = this.scene.add.text(
            menuX, menuY, cargoInfo.join('\n'), {
                fontSize: '24px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 15, y: 10 },
                align: 'center'
            }
        );
        this.cargoText.setScrollFactor(0);
        this.cargoText.setDepth(1001);
        this.cargoText.setOrigin(0.5, 0.5);
    }
    
    hideCargoMenu() {
        if (!this.cargoMenuVisible) return;
        
        this.cargoMenuVisible = false;
        
        // Destroy cargo menu elements
        if (this.cargoBackground) this.cargoBackground.destroy();
        if (this.cargoTitle) this.cargoTitle.destroy();
        if (this.cargoText) this.cargoText.destroy();
    }

    fireCannons(side = 'both') {
        if (!this.playerShip.canFireCannons()) {
            console.log('No ammo available!');
            return;
        }

        // Fire cannons using the combat system
        const success = this.scene.combatSystem.fireCannon(this.playerShip, side);
        
        if (success) {
            console.log(`Cannons fired on ${side} side!`);
            // You could add sound effects here
        } else {
            console.log('Cannons are on cooldown!');
        }
    }
}
