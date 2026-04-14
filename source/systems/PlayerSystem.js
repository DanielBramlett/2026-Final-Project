import Ship from '../entities/Ship.js';
import { SHIP_TYPES } from '../constants/shipTypes.js';
import { ShipModificationSystem } from './ShipModificationSystem.js';

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
        this.movementDisabled = false; // Flag to disable movement during naming
    }

    createPlayerShip(x, y, shipType) {
        this.playerShip = new Ship(
            this.scene,
            x,
            y,
            shipType,
        );
        this.playerShip.isPlayer = true; // Mark as player ship for red hitbox
        this.playerShip.id = 'player'; // Assign ID for boarding tracking
        
        // Apply faction speed and turn speed buffs if French
        if (this.scene.factionSystem) {
            const modifiedSpeed = this.scene.factionSystem.getModifiedSpeed(shipType.speed);
            this.playerShip.speed = modifiedSpeed;
            console.log(`Applied faction speed buff: ${shipType.speed} -> ${modifiedSpeed}`);
            
            const modifiedTurnSpeed = this.scene.factionSystem.getModifiedTurnSpeed(shipType.turnSpeed);
            this.playerShip.turnSpeed = modifiedTurnSpeed;
            console.log(`Applied faction turn speed buff: ${shipType.turnSpeed} -> ${modifiedTurnSpeed}`);
        }
        
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
            b: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B),
            space: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            // Debug key for testing ship capture
            t: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T)
        };

        // Add mouse input for cannon firing
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.fireCannons('left');
            } else if (pointer.leftButtonDown()) {
                this.fireCannons('right');
            }
        });
    }

    handleInput() {
        // Skip all input if movement is disabled (during naming)
        if (this.movementDisabled) {
            return;
        }
        
                
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
        
        // Handle T key for debug testing ship capture
        if (Phaser.Input.Keyboard.JustDown(this.keys.t)) {
            this.debugShipCapture();
        }
        
        // Handle B key for boarding
        if (Phaser.Input.Keyboard.JustDown(this.keys.b)) {
            this.attemptBoarding();
        }
        
        // Handle player movement
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

    changePlayerShip(newShipType, shipId = null) {
        // Store the ship ID for upgrade lookup
        let currentShipId = shipId;
        
        // Store old position, velocity, facing angle, and player data
        const oldX = this.playerShip.x;
        const oldY = this.playerShip.y;
        const oldVelocityX = this.playerShip.velocityX;
        const oldVelocityY = this.playerShip.velocityY;
        const oldFacingAngle = this.playerShip.facingAngle;
        const oldSize = this.playerShip.size;
        
        // Save player's gold, cargo, crew count, owned ships, and named ships
        const savedGold = this.playerShip.gold;
        const savedCargo = { ...this.playerShip.tradeGoods };
        const savedCrew = this.playerShip.crew; // Save current crew count
        const savedOwnedShips = [...this.playerShip.ownedShips];
        const savedNamedShips = { ...this.playerShip.namedShips }; // Preserve named ships!
        
        // Upgraded properties will be handled by applyShipUpgrades() for each ship
        
        // Find the port the player is currently at (not just the nearest one)
        let currentPort = null;
        let minDistance = Infinity;
        
        this.scene.ports.forEach(port => {
            const distance = Phaser.Math.Distance.Between(oldX, oldY, port.x, port.y);
            // Check if player is within this port's bounds (closer than any other port)
            if (distance < minDistance) {
                minDistance = distance;
                currentPort = port;
            }
        });
        
        console.log(`Player was at port: ${currentPort ? currentPort.portName : 'None'}`);
        console.log(`Distance to current port: ${minDistance}px`);
        
        // Calculate spawn position outside the port
        let spawnX = oldX;
        let spawnY = oldY;
        
        if (currentPort && minDistance < 800) { // If player is within 800px of a port
            // Calculate angle from port to player
            const angleFromPort = Math.atan2(oldY - currentPort.y, oldX - currentPort.x);
            // Spawn player well outside the port along the same angle
            const portRadius = Math.max(currentPort.width, currentPort.height) / 2;
            const spawnDistance = portRadius + 650; // 650px buffer outside port
            
            // Try multiple spawn positions to avoid enemy ships
            let validSpawnFound = false;
            let attempts = 0;
            const maxAttempts = 10; // Try 10 different angles
            const safeSpawnDistance = 200; // Minimum distance from enemy ships
            
            while (!validSpawnFound && attempts < maxAttempts) {
                const currentAngle = angleFromPort + (attempts * Math.PI / 4); // Try different angles
                spawnX = currentPort.x + Math.cos(currentAngle) * spawnDistance;
                spawnY = currentPort.y + Math.sin(currentAngle) * spawnDistance;
                
                // Check if spawn position is safe from enemy ships
                validSpawnFound = true;
                if (this.scene.enemyShips && this.scene.enemyShips.length > 0) {
                    for (const enemyShip of this.scene.enemyShips) {
                        const distanceToEnemy = Phaser.Math.Distance.Between(spawnX, spawnY, enemyShip.x, enemyShip.y);
                        const minSafeDistance = (newShipType.size / 2) + (enemyShip.size / 2) + safeSpawnDistance;
                        
                        if (distanceToEnemy < minSafeDistance) {
                            validSpawnFound = false;
                            break;
                        }
                    }
                }
                
                attempts++;
            }
            
            // If no safe position found, use the original position as fallback
            if (!validSpawnFound) {
                spawnX = currentPort.x + Math.cos(angleFromPort) * spawnDistance;
                spawnY = currentPort.y + Math.sin(angleFromPort) * spawnDistance;
                console.log('No safe spawn position found, using fallback position');
            }
            
            console.log(`Port: ${currentPort.portName}, Port radius: ${portRadius}, Spawn distance: ${spawnDistance}`);
            console.log(`Player old pos: (${oldX}, ${oldY}), New spawn pos: (${spawnX}, ${spawnY})`);
            console.log(`Safe spawn found: ${validSpawnFound}, Attempts: ${attempts}`);
        }
        
        // Destroy old player ship
        this.playerShip.hitboxCircle.destroy();
        this.playerShip.destroy();
        
        // Create new player ship at spawn position
        this.playerShip = new Ship(this.scene, spawnX, spawnY, newShipType);
        this.playerShip.isPlayer = true; // Mark as player ship for red hitbox
        this.playerShip.id = 'player'; // Assign ID for boarding tracking
        
        // Apply any upgrades to the new ship first (using base stats)
        this.applyShipUpgrades(currentShipId);
        
        console.log('New ship created, physics body exists:', !!this.playerShip.body);
        
        // Apply faction speed and turn speed buffs if French (after upgrades)
        if (this.scene.factionSystem) {
            const currentFaction = this.scene.factionSystem.getCurrentFaction();
            if (currentFaction && currentFaction.name === 'French') {
                // Apply faction multipliers to the already-upgraded speed values
                const speedMultiplier = this.scene.factionSystem.getFactionBuff('speedMultiplier');
                const turnSpeedMultiplier = this.scene.factionSystem.getFactionBuff('turnSpeedMultiplier');
                
                const originalSpeed = this.playerShip.speed;
                const originalTurnSpeed = this.playerShip.turnSpeed;
                
                this.playerShip.speed = Math.round(this.playerShip.speed * speedMultiplier);
                this.playerShip.turnSpeed = Math.round(this.playerShip.turnSpeed * turnSpeedMultiplier);
                
                console.log(`Applied French faction buffs to upgraded ship:`);
                console.log(`  Speed: ${originalSpeed} -> ${this.playerShip.speed} (multiplier: ${speedMultiplier})`);
                console.log(`  Turn Speed: ${originalTurnSpeed} -> ${this.playerShip.turnSpeed} (multiplier: ${turnSpeedMultiplier})`);
            }
        }
        
        // Restore player's gold, cargo, crew count, owned ships, and named ships
        this.playerShip.gold = savedGold;
        this.playerShip.tradeGoods = savedCargo;
        this.playerShip.ownedShips = savedOwnedShips;
        this.playerShip.namedShips = savedNamedShips; // Restore named ships!
        this.playerShip.crew = savedCrew; // Restore crew count
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
        
                
        // Update collisions with new player ship using enhanced collision handler
        this.scene.physics.add.overlap(this.playerShip, this.scene.islands, this.scene.handleShipCollision, null, this.scene);
        this.scene.physics.add.overlap(this.playerShip, this.scene.ports, this.scene.handleShipCollision, null, this.scene);
        this.scene.physics.add.overlap(this.playerShip, this.scene.enemyShips, this.scene.handleShipCollision, null, this.scene);
        
        console.log('Physics colliders added, checking ship body again:', !!this.playerShip.body);
        
        // Update all ports to recognize the new player ship immediately
        console.log('=== UPDATING PORT COLLISIONS FOR NEW SHIP ===');
        this.scene.ports.forEach((port, index) => {
            console.log(`\n--- Processing port ${index + 1}: ${port.portName} ---`);
            
            // Use the port's built-in ship switch handling
            port.onPlayerShipSwitched();
            console.log(`Called onPlayerShipSwitched for ${port.portName}`);
            
            // Remove old overlap if it exists
            if (port.contactOverlap) {
                port.contactOverlap.destroy();
                console.log(`Destroyed old overlap for ${port.portName}`);
            }
            
            // Verify both objects have physics bodies
            const playerHasBody = !!this.playerShip.body;
            const portHasBody = !!port.body;
            console.log(`Physics bodies - Player: ${playerHasBody}, Port: ${portHasBody}`);
            
            if (playerHasBody && portHasBody) {
                // Create new overlap with the new player ship using direct contact
                port.contactOverlap = this.scene.physics.add.overlap(
                    this.playerShip,
                    port,
                    (player, portObj) => {
                        if (!port.playerInContact) {
                            console.log(`\n*** OVERLAP TRIGGERED: Player made contact with ${port.portName} ***`);
                            console.log('Player position:', player.x, player.y);
                            console.log('Port position:', portObj.x, portObj.y);
                            port.playerInContact = true;
                            port.showContactPopup();
                        }
                    },
                    null,
                    port
                );
                
                console.log(`Port ${port.portName}: Created new overlap, exists:`, !!port.contactOverlap);
            } else {
                console.error(`Port ${port.portName}: Cannot create overlap - missing physics bodies!`);
            }
        });
        
        console.log('=== PORT COLLISION UPDATE COMPLETE ===');
        
        // Try a different approach - create overlaps in the next frame
        this.scene.events.once('update', () => {
            console.log('=== CREATING OVERLAPS IN NEXT FRAME ===');
            
            this.scene.ports.forEach((port, index) => {
                console.log(`\n--- Creating overlap for port ${index + 1}: ${port.portName} ---`);
                
                // Use the port's built-in ship switch handling
                port.onPlayerShipSwitched();
                
                // Remove old overlap if it exists
                if (port.contactOverlap) {
                    port.contactOverlap.destroy();
                    console.log(`Destroyed old overlap for ${port.portName}`);
                }
                
                // Verify both objects have physics bodies
                const playerHasBody = !!this.playerShip.body;
                const portHasBody = !!port.body;
                console.log(`Physics bodies - Player: ${playerHasBody}, Port: ${portHasBody}`);
                
                if (playerHasBody && portHasBody) {
                    // Try different overlap methods
                    try {
                        // Method 1: Standard overlap
                        port.contactOverlap = this.scene.physics.add.overlap(
                            this.playerShip,
                            port,
                            (player, portObj) => {
                                console.log('\n*** METHOD 1: OVERLAP CALLBACK FIRED ***');
                                if (!port.playerInContact) {
                                    console.log(`Player made contact with ${port.portName}`);
                                    
                                    // Reset all other ports' contact state when entering this port
                                    port.resetAllPortsContactState();
                                    
                                    port.playerInContact = true;
                                    port.showContactPopup();
                                }
                            },
                            null,
                            port
                        );
                        
                        console.log(`Port ${port.portName}: Method 1 overlap created, exists:`, !!port.contactOverlap);
                        
                        // Also try Method 2: Arcade physics overlap as backup
                        setTimeout(() => {
                            if (port.contactOverlap) {
                                console.log('Testing backup overlap method...');
                                const backupOverlap = this.scene.physics.add.overlap(
                                    this.playerShip,
                                    port,
                                    (player, portObj) => {
                                        console.log('\n*** METHOD 2: BACKUP OVERLAP CALLBACK FIRED ***');
                                        if (!port.playerInContact) {
                                            console.log(`BACKUP: Player made contact with ${port.portName}`);
                                            
                                            // Reset all other ports' contact state when entering this port
                                            port.resetAllPortsContactState();
                                            
                                            port.playerInContact = true;
                                            port.showContactPopup();
                                        }
                                    }
                                );
                                console.log(`Backup overlap created for ${port.portName}:`, !!backupOverlap);
                            }
                        }, 1000);
                        
                    } catch (error) {
                        console.error(`Error creating overlap for ${port.portName}:`, error);
                    }
                } else {
                    console.error(`Port ${port.portName}: Cannot create overlap - missing physics bodies!`);
                }
            });
        });
        
        // Also add a distance-based fallback system
        this.setupDistanceBasedPortDetection();
        
        // Add a test function to check if physics is working
        this.testPhysicsWorking = () => {
            console.log('=== TESTING PHYSICS SYSTEM ===');
            console.log('Player ship body:', !!this.playerShip.body);
            console.log('Player ship position:', this.playerShip.x, this.playerShip.y);
            console.log('Scene physics world exists:', !!this.scene.physics.world);
            
            // Test distance to all ports to find the closest one
            if (this.scene.ports && this.scene.ports.length > 0) {
                let closestPort = null;
                let closestDistance = Infinity;
                
                this.scene.ports.forEach(port => {
                    const distance = Phaser.Math.Distance.Between(
                        this.playerShip.x, this.playerShip.y, 
                        port.x, port.y
                    );
                    console.log(`Distance to ${port.portName}: ${distance}px`);
                    console.log(`Port body exists:`, !!port.body);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestPort = port;
                    }
                });
                
                console.log(`\nClosest port: ${closestPort.portName} at ${closestDistance}px`);
            }
        };
        
        // Call test immediately
        this.testPhysicsWorking();
        
        // Expose test function to window for manual debugging
        if (typeof window !== 'undefined') {
            window.testPhysics = this.testPhysicsWorking.bind(this);
            window.testOverlap = () => {
                console.log('=== MANUAL OVERLAP TEST ===');
                if (this.scene.ports && this.scene.ports.length > 0) {
                    const port = this.scene.ports[0]; // Test with first port
                    console.log(`Testing overlap with ${port.portName}`);
                    
                    // Create a test overlap
                    const testOverlap = this.scene.physics.add.overlap(
                        this.playerShip,
                        port,
                        () => {
                            console.log('*** TEST OVERLAP TRIGGERED ***');
                        }
                    );
                    
                    console.log('Test overlap created:', !!testOverlap);
                    
                    // Clean up after 5 seconds
                    setTimeout(() => {
                        if (testOverlap) {
                            testOverlap.destroy();
                            console.log('Test overlap cleaned up');
                        }
                    }, 5000);
                }
            };
            console.log('Test functions exposed:');
            console.log('  window.testPhysics() - Check physics state');
            console.log('  window.testOverlap() - Test overlap creation');
        }
        
        console.log(`Player ship changed to: ${newShipType.name} (size: ${oldSize} -> ${newShipType.size})`);
        console.log(`Gold, cargo, and named ships preserved. Spawned outside port at (${spawnX}, ${spawnY})`);
    }
    
    setupDistanceBasedPortDetection() {
        console.log('Setting up distance-based port detection as fallback...');
        
        // Disable the Port's built-in exit detection to prevent conflicts
        this.scene.ports.forEach(port => {
            if (port.exitCheckTimer) {
                port.exitCheckTimer.remove();
                port.exitCheckTimer = null;
                console.log(`Disabled built-in exit detection for ${port.portName}`);
            }
        });
        
        // Create a timer to check distance to ports manually
        this.distanceCheckTimer = this.scene.time.addEvent({
            delay: 100, // Check every 100ms
            loop: true,
            callback: () => {
                if (!this.playerShip || !this.scene.ports) return;
                
                this.scene.ports.forEach(port => {
                    // Use physics body position if available, fallback to visual position
                    const playerX = this.playerShip.body ? this.playerShip.body.x : this.playerShip.x;
                    const playerY = this.playerShip.body ? this.playerShip.body.y : this.playerShip.y;
                    
                    const distance = Phaser.Math.Distance.Between(
                        playerX, 
                        playerY, 
                        port.x, 
                        port.y
                    );
                    
                    // Calculate port interaction radius (port size + ship size + buffer)
                    const maxDimension = Math.max(port.width, port.height);
                    const shipSize = this.playerShip.size || 50; // Use actual ship size
                    
                    // Add hysteresis to prevent rapid toggling
                    const enterRadius = (maxDimension / 2) + (shipSize / 2) + 30; // 30px buffer for entry
                    const exitRadius = (maxDimension / 2) + (shipSize / 2) + 50; // 50px buffer for exit (larger)
                    
                    // Check if player is within interaction radius
                    const isNearPort = distance <= enterRadius;
                    const wasNearPort = port.playerInContact;
                    
                    // Player entered port radius (must be closer than exit threshold)
                    if (isNearPort && !wasNearPort) {
                        console.log(`\n*** DISTANCE-BASED: Player entered ${port.portName} ***`);
                        console.log(`Distance: ${distance}px, Enter radius: ${enterRadius}px, Exit radius: ${exitRadius}px, Ship size: ${shipSize}px}`);
                        
                        // Reset all other ports' contact state when entering this port
                        port.resetAllPortsContactState();
                        
                        port.playerInContact = true;
                        port.showContactPopup();
                        
                        // Cancel any pending hide timer
                        if (port.hidePopupTimer) {
                            port.hidePopupTimer.remove();
                            port.hidePopupTimer = null;
                        }
                    }
                    // Player exited port radius (must be farther than exit threshold)
                    else if (!isNearPort && wasNearPort && distance > exitRadius) {
                        console.log(`*** DISTANCE-BASED: Player exited ${port.portName} ***`);
                        console.log(`Distance: ${distance}px, Exit radius: ${exitRadius}px}`);
                        
                        // Set a 1-second delay before hiding popup
                        if (port.hidePopupTimer) {
                            port.hidePopupTimer.remove();
                        }
                        
                        port.hidePopupTimer = this.scene.time.addEvent({
                            delay: 1000, // 1 second delay
                            callback: () => {
                                console.log(`Hiding popup for ${port.portName} after 1 second delay`);
                                port.playerInContact = false;
                                port.hideContactPopup();
                                port.hidePopupTimer = null;
                            }
                        });
                    }
                });
            }
        });
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
    
    applyShipUpgrades(shipId = null) {
        // Use the shared ship modification system from GameScene
        const shipModificationSystem = this.scene.shipModificationSystem;
        
        if (!shipModificationSystem) {
            console.warn('Ship modification system not found, upgrades not applied');
            return;
        }
        
        console.log('=== APPLYING SHIP UPGRADES ===');
        console.log('Player ship type:', this.playerShip.shipType.name);
        console.log('Named ships:', this.playerShip.namedShips);
        
        // Use provided shipId or find it from named ships
        let currentShipId = shipId;
        
        if (!currentShipId) {
            // Fallback: Find the current ship's ID from named ships
            const currentShipType = this.playerShip.shipType.name;
            
            for (const [id, namedShip] of Object.entries(this.playerShip.namedShips)) {
                console.log(`Checking ship ID: ${id}, shipKey: ${namedShip.shipKey}, shipName: ${namedShip.shipName}`);
                if (namedShip.shipKey === currentShipType) {
                    currentShipId = id;
                    break;
                }
            }
        }
        
        if (currentShipId) {
            console.log(`Found current ship ID: ${currentShipId}`);
            const upgrades = shipModificationSystem.getShipUpgrades(currentShipId);
            console.log('Upgrades for this ship:', upgrades);
            
            shipModificationSystem.applyUpgradesToShip(this.playerShip, currentShipId);
            console.log(`Applied upgrades to ship: ${this.playerShip.shipType.name} (${currentShipId})`);
            
            console.log('Ship stats after upgrades:', {
                maxHealth: this.playerShip.maxHealth,
                crewMax: this.playerShip.crewMax,
                cargoMax: this.playerShip.cargoMax,
                speed: this.playerShip.speed,
                turnSpeed: this.playerShip.turnSpeed,
                cannons: this.playerShip.cannons,
                rowing: this.playerShip.rowing
            });
        } else {
            console.warn('No ship ID found for ship type:', newShipType.name);
        }
        
        console.log('=== UPGRADE APPLICATION COMPLETE ===');
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

    attemptBoarding() {
        
        // Find the closest enemy ship within boarding range
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        this.scene.enemyShips.forEach(enemyShip => {
            if (enemyShip.health > 0) { // Only target living ships
                // Skip if same faction (faction-based boarding restriction)
                if (this.scene.factionSystem && this.scene.factionSystem.areSameFaction(this.playerShip, enemyShip)) {
                    const playerFaction = this.scene.factionSystem.getShipFaction(this.playerShip);
                    const enemyFaction = this.scene.factionSystem.getShipFaction(enemyShip);
                    console.log(`diplomacy boarding: Player avoiding boarding ${enemyShip.shipType.name} (${enemyFaction?.displayName}) - same faction as player (${playerFaction?.displayName})`);
                    return;
                }
                
                const distance = Phaser.Math.Distance.Between(
                    this.playerShip.x, this.playerShip.y,
                    enemyShip.x, enemyShip.y
                );
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemyShip;
                }
            }
        });
        
        if (!closestEnemy) {
            console.log('No enemy ships found for boarding!');
            this.showBoardingMessage('No enemy ships nearby!');
            return;
        }
        
        // Attempt boarding through combat system
        const success = this.scene.combatSystem.initiateBoarding(this.playerShip, closestEnemy);
        
        if (!success) {
            console.log('Boarding attempt failed!');
            this.showBoardingMessage('Too far to board or on cooldown!');
        }
    }

    showBoardingMessage(message) {
        // Create temporary text message for boarding feedback
        const messageText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 100,
            message,
            {
                fontSize: '28px',
                fill: '#FFFF00',
                backgroundColor: '#000000',
                padding: { x: 15, y: 8 },
                align: 'center'
            }
        );
        messageText.setScrollFactor(0);
        messageText.setDepth(2000);
        messageText.setOrigin(0.5, 0.5);
        
        // Remove message after 2 seconds
        setTimeout(() => {
            if (messageText && messageText.active) {
                messageText.destroy();
            }
        }, 2000);
    }

    debugShipCapture() {
        console.log('=== DEBUG SHIP CAPTURE TEST ===');
        console.log('Player ownedShips:', this.playerShip.ownedShips);
        console.log('Player namedShips:', this.playerShip.namedShips);
        
        // Test adding a ship
        const testShipId = this.playerShip.addNamedShip('SLOOP', 'Test Captured Sloop');
        console.log('Test ship added with ID:', testShipId);
        console.log('Player ownedShips after test:', this.playerShip.ownedShips);
        console.log('Player namedShips after test:', this.playerShip.namedShips);
        
        this.showBoardingMessage('Debug: Test ship added to inventory!');
    }
}
