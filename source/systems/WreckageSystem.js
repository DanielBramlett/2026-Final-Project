export default class WreckageSystem {
    constructor(scene) {
        this.scene = scene;
        this.wreckageSprites = []; // Array to hold multiple wreckage sprites
        this.animationTimers = new Map(); // Map to track animation timers for each wreckage
        this.animationDelay = 500; // Switch between wreckage images every 500ms
        this.currentWreckageFrames = new Map(); // Map to track current frame for each wreckage
        this.isPlayerSunk = false;
        this.controlsDisabled = false;
    }

    // Method to set initial player ship reference
    setPlayerShip(playerShip) {
        // Store reference to player ship for collision calculations
        this.playerShipRef = playerShip;
        console.log('📍 Wreckage system player ship reference set');
    }

    handleShipSunk(ship) {
        console.log(`🚢 ${ship.isPlayer ? 'Player' : 'Enemy'} ${ship.shipType.name} sunk! Creating wreckage...`);

        // Store ship position and properties before destruction
        const sinkX = ship.x;
        const sinkY = ship.y;
        const sinkSize = ship.size;
        const sinkAngle = ship.facingAngle;
        const shipId = ship.isPlayer ? 'player' : `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // If this is the player ship, disable controls
        if (ship.isPlayer) {
            this.isPlayerSunk = true;
            this.disablePlayerControls();
        }

        // Create wreckage sprite at the ship's position
        this.createWreckage(sinkX, sinkY, sinkSize, sinkAngle, shipId);

        // Play sinking sound effect
        this.scene.sound.play('wood_breaking');
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
        
        // Calculate collision radius based on both wreckage and player ship sizes
        const playerRadius = (this.playerShipRef && this.playerShipRef.size) ? this.playerShipRef.size / 2 : 40;
        const wreckageRadius = Math.min(wreckageSize / 2, 80); // Cap at 80px to prevent oversized collision areas
        const collisionRadius = Math.min(Math.max(wreckageRadius, 30), 60); // Cap final radius at 60px maximum
        
        console.log(`🔧 Collision setup for ${shipId}: player=${playerRadius}px, wreckage=${wreckageRadius}px, final=${collisionRadius}px`);
        
        wreckageSprite.body.setCircle(collisionRadius);
        wreckageSprite.body.setImmovable(true);
        wreckageSprite.body.enable = true;

        // Set up overlap detection for salvage
        this.scene.physics.add.overlap(
            wreckageSprite,
            this.playerShipRef,
            (wreckageObj, playerObj) => {
                this.handleSalvage(wreckageObj, playerObj);
            },
            null,
            this
        );

        console.log(`🌊 ${shipId} wreckage created at position: ${x}, ${y} (size: ${wreckageSize}px, original: ${size}px)`);
    }

    disablePlayerControls() {
        if (this.controlsDisabled) {
            return;
        }

        this.controlsDisabled = true;
        
        // Disable player system input handling
        if (this.scene.playerSystem) {
            this.scene.playerSystem.movementDisabled = true;
        }

        // Disable all keyboard input
        if (this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.enabled = false;
        }

        // Disable mouse input
        if (this.scene.input) {
            this.scene.input.enabled = false;
        }

        console.log('🔒 All player controls disabled');
    }

    handleSalvage(wreckageObj, playerObj) {
        console.log(`🔧 Salvage attempt: wreckage=${wreckageObj.texture ? wreckageObj.texture.key : 'unknown'}, player at (${playerObj.x}, ${playerObj.y})`);
        
        // Find wreckage data
        const wreckData = this.wreckageSprites.find(w => w.sprite === wreckageObj);
        
        if (!wreckData || wreckData.salvaged) {
            console.log('❌ Salvage failed: wreck data not found or already salvaged');
            return; // Already salvaged or not found
        }

        // Don't allow salvage if player controls are disabled (player is sunk)
        if (this.controlsDisabled) {
            console.log('❌ Salvage blocked: player controls disabled');
            return;
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
        this.isPlayerSunk = false;
        this.controlsDisabled = false;

        // Clean up all wreckage sprites
        this.wreckageSprites.forEach(wreckage => {
            if (wreckage.sprite) {
                wreckage.sprite.destroy();
            }
        });
        this.wreckageSprites = [];
        
        // Clear animation data
        this.animationTimers.clear();
        this.currentWreckageFrames.clear();

        // Re-enable controls
        if (this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.enabled = true;
        }
        if (this.scene.input) {
            this.scene.input.enabled = true;
        }
        if (this.scene.playerSystem) {
            this.scene.playerSystem.movementDisabled = false;
        }

        console.log('🔄 Wreckage system reset');
    }

    // Check if player is sunk
    isSunk() {
        return this.isPlayerSunk;
    }

    // Check if controls are disabled
    areControlsDisabled() {
        return this.controlsDisabled;
    }

    // Get number of active wreckage sprites
    getWreckageCount() {
        return this.wreckageSprites.length;
    }

    // Method to update player ship reference (call when player changes ships)
    updatePlayerShip(newPlayerShip) {
        // Update stored player ship reference
        this.playerShipRef = newPlayerShip;
        
        // Clear existing overlap handlers
        this.wreckageSprites.forEach(wreckage => {
            if (wreckage.sprite && this.scene.physics.world) {
                // Remove old overlap handler
                this.scene.physics.world.removeCollider(wreckage.sprite, this.playerShipRef);
                
                // Recalculate collision radius based on new player ship size
                const playerRadius = newPlayerShip.size ? newPlayerShip.size / 2 : 40;
                const wreckData = this.wreckageSprites.find(w => w.sprite === wreckage.sprite);
                const wreckageRadius = wreckData ? Math.min(wreckData.size / 2, 80) : wreckageSize / 2; // Cap at 80px
                const collisionRadius = Math.min(Math.max(wreckageRadius, 30), 60); // Cap final radius at 60px maximum
                
                // Update the collision body size
                wreckage.sprite.body.setCircle(collisionRadius);
                
                console.log(`🔧 Updated collision for ${wreckage.id}: player=${playerRadius}px, wreckage=${wreckageRadius}px, final=${collisionRadius}px`);
                
                // Add new overlap handler with updated player ship
                this.scene.physics.add.overlap(
                    wreckage.sprite,
                    newPlayerShip,
                    (wreckageObj, playerObj) => {
                        this.handleSalvage(wreckageObj, playerObj);
                    },
                    null,
                    this
                );
            }
        });
        
        console.log('🔄 Wreckage system updated for new player ship');
    }
}
