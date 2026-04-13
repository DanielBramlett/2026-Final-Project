export default class WreckageSystem {
    constructor(scene) {
        this.scene = scene;
        this.wreckageSprites = []; // Array to hold multiple wreckage sprites
        this.animationTimers = new Map(); // Map to track animation timers for each wreckage
        this.animationDelay = 500; // Switch between wreckage images every 500ms
        this.currentWreckageFrames = new Map(); // Map to track current frame for each wreckage
    }

    // Method to set initial player ship reference
    setPlayerShip(playerShip) {
        // Store reference to player ship for collision calculations
        this.playerShipRef = playerShip;
        console.log('?? Wreckage system player ship reference set');
    }

    // Initialize respawn system
    initRespawnSystem() {
        if (!this.respawnSystem) {
            this.respawnSystem = new RespawnSystem(this.scene);
            console.log('?? Respawn system initialized');
        }
    }

    handleShipSunk(ship) {
        // Only handle enemy ships - player ships are handled separately
        if (ship.isPlayer) {
            console.log(`Player ship ${ship.shipType.name} handled separately - skipping wreckage system`);
            return;
        }

        console.log(`?? Enemy ${ship.shipType.name} sunk! Creating wreckage...`);

        // Store ship position and properties before destruction
        const sinkX = ship.x;
        const sinkY = ship.y;
        const sinkSize = ship.size;
        const sinkAngle = ship.facingAngle;
        const shipId = `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create wreckage sprite at the ship's position
        this.createWreckage(sinkX, sinkY, sinkSize, sinkAngle, shipId);

        // Play sinking sound effect
        this.scene.sound.play('wood_breaking');
    }

    // Method to create wreckage for player without affecting the player ship
    createPlayerWreckage(x, y, size, angle) {
        console.log(`Creating player wreckage at position: ${x}, ${y}`);
        
        const shipId = 'player_wreckage';
        
        // Create wreckage sprite at the player's position
        this.createWreckage(x, y, size, angle, shipId);
        
        // Play sinking sound effect
        this.scene.sound.play('wood_breaking');
    }

    // Helper method to find nearest port
    findNearestPort(x, y) {
        if (!this.scene.ports || this.scene.ports.length === 0) {
            return null;
        }

        let nearestPort = null;
        let minDistance = Infinity;

        this.scene.ports.forEach(port => {
            const distance = Math.sqrt(Math.pow(port.x - x, 2) + Math.pow(port.y - y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearestPort = port;
            }
        });

        return nearestPort;
    }

    createWreckage(x, y, size, angle, shipId) {
        // Create wreckage sprite with relative size (80% of ship size for better visual proportion)
        const wreckageSize = size * 0.8;
        const wreckageSprite = this.scene.add.sprite(x, y, 'Wreckage');
        wreckageSprite.setDisplaySize(wreckageSize, wreckageSize);
        wreckageSprite.setAngle(angle * (180 / Math.PI)); // Convert radians to degrees
        wreckageSprite.setDepth(50); // Render below player (player is typically depth 100+)

        // Add to scene
        this.scene.add.existing(wreckageSprite);

        // Store wreckage sprite with its ID and salvage data
        const shipType = shipId === 'player' ? 'player_ship' : 'enemy_ship';
        this.wreckageSprites.push({ 
            sprite: wreckageSprite, 
            id: shipId, 
            shipType: shipType,
            salvaged: false,
            x: x,
            y: y
        });
        this.animationTimers.set(shipId, 0);
        this.currentWreckageFrames.set(shipId, 1);

        // Enable physics for collision detection with player
        this.scene.physics.add.existing(wreckageSprite);
        
        // Calculate collision radius for enemy wreckage
        const wreckageRadius = Math.min(wreckageSize / 2, 80); // Cap at 80px to prevent oversized collision areas
        const collisionRadius = Math.min(Math.max(wreckageRadius, 30), 60); // Cap final radius at 60px maximum
        
        console.log(`?? Collision setup for ${shipId}: wreckage=${wreckageRadius}px, final=${collisionRadius}px`);
        
        wreckageSprite.body.setCircle(collisionRadius);
        wreckageSprite.body.setImmovable(true);
        wreckageSprite.body.enable = true;

        // Set up overlap detection for salvage with player ship
        this.scene.physics.add.overlap(
            wreckageSprite,
            this.scene.playerShip,
            (wreckageObj, playerObj) => {
                this.handleSalvage(wreckageObj, playerObj);
            },
            null,
            this
        );

        console.log(`🌊 ${shipId} wreckage created at position: ${x}, ${y} (size: ${wreckageSize}px, original: ${size}px)`);
    }

    handleSalvage(wreckageObj, playerObj) {
        console.log(`🔧 Salvage attempt: wreckage=${wreckageObj.texture ? wreckageObj.texture.key : 'unknown'}, player at (${playerObj.x}, ${playerObj.y})`);
        
        // Find wreckage data
        const wreckData = this.wreckageSprites.find(w => w.sprite === wreckageObj);
        
        if (!wreckData || wreckData.salvaged) {
            console.log('❌ Salvage failed: wreck data not found or already salvaged');
            return; // Already salvaged or not found
        }

        // Mark as salvaged
        wreckData.salvaged = true;

        // Generate random salvage (0-10 trade goods)
        const salvageAmount = Math.floor(Math.random() * 11); // 0-10 inclusive
        const availableCargoSpace = playerObj.getAvailableCargoSpace();
        const actualSalvage = Math.min(salvageAmount, availableCargoSpace);

        if (actualSalvage > 0) {
            // Get list of possible trade goods (excluding crew)
            const possibleGoods = Object.keys(playerObj.tradeGoods).filter(good => good !== 'crew');
            
            // Randomly select goods to salvage
            const salvagedGoods = {};
            for (let i = 0; i < actualSalvage; i++) {
                const randomGood = possibleGoods[Math.floor(Math.random() * possibleGoods.length)];
                salvagedGoods[randomGood] = (salvagedGoods[randomGood] || 0) + 1;
            }

            // Add salvaged goods to player's cargo
            Object.entries(salvagedGoods).forEach(([goodType, amount]) => {
                playerObj.tradeGoods[goodType] += amount;
            });

            // Update player's current cargo count
            playerObj.cargo = playerObj.getCurrentCargo();

            // Show salvage message
            const goodsList = Object.entries(salvagedGoods)
                .map(([good, amount]) => `${amount} ${good}`)
                .join(', ');
            
            console.log(`💰 Successfully salvaged ${actualSalvage} trade goods from ${wreckData.shipType}: ${goodsList}`);
            console.log(`📦 Player cargo space: ${availableCargoSpace} -> ${playerObj.getAvailableCargoSpace()} after salvage`);
            
            // Create floating text for salvage notification
            this.showSalvageText(wreckData.x, wreckData.y, `+${actualSalvage} Goods!`);
        } else {
            console.log(`📦 No cargo space available to salvage from ${wreckData.shipType}`);
            this.showSalvageText(wreckData.x, wreckData.y, 'No Space!');
        }

        // Remove the wreckage sprite after a short delay
        this.scene.time.delayedCall(1000, () => {
            if (wreckData.sprite) {
                wreckData.sprite.destroy();
            }
            // Remove from array
            const index = this.wreckageSprites.indexOf(wreckData);
            if (index > -1) {
                this.wreckageSprites.splice(index, 1);
            }
        });
    }

    showSalvageText(x, y, text) {
        // Create temporary text to show salvage result
        const salvageText = this.scene.add.text(x, y - 50, text, {
            fontSize: '20px',
            fill: '#FFD700', // Gold color
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
            borderRadius: 5
        });
        salvageText.setOrigin(0.5);
        salvageText.setScrollFactor(0);
        salvageText.setDepth(1000);

        // Animate the text floating up and fading out
        this.scene.tweens.add({
            targets: salvageText,
            y: y - 100,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                salvageText.destroy();
            }
        });
    }

    update(time, delta) {
        // Update animation for all wreckage sprites
        this.wreckageSprites.forEach(wreckage => {
            const { sprite, id } = wreckage;
            
            // Skip if sprite doesn't exist
            if (!sprite || !sprite.active) {
                return;
            }

            // Update animation timer for this wreckage
            let currentTimer = this.animationTimers.get(id) || 0;
            currentTimer += delta;
            this.animationTimers.set(id, currentTimer);

            // Switch between wreckage frames
            if (currentTimer >= this.animationDelay) {
                this.animationTimers.set(id, 0);
                
                // Toggle between wreckage frames
                let currentFrame = this.currentWreckageFrames.get(id) || 1;
                currentFrame = currentFrame === 1 ? 2 : 1;
                this.currentWreckageFrames.set(id, currentFrame);
                
                const textureKey = currentFrame === 1 ? 'Wreckage' : 'Wreck_2';
                
                if (this.scene.textures.exists(textureKey)) {
                    sprite.setTexture(textureKey);
                    console.log(`🔄 ${id} switched to ${textureKey}`);
                } else {
                    console.warn(`⚠️ Wreckage texture not found: ${textureKey}`);
                }
            }
        });
    }

    // Method to reset the system (for game restart, etc.)
    reset() {
        // Clean up all wreckage sprites
        this.wreckageSprites.forEach(wreckData => {
            if (wreckData.sprite) {
                wreckData.sprite.destroy();
            }
        });
        this.wreckageSprites = [];
        this.animationTimers.clear();
        this.currentWreckageFrames.clear();

        console.log('?? Wreckage system reset');
    }

    // Get number of active wreckage sprites
    getWreckageCount() {
        return this.wreckageSprites.length;
    }
}
