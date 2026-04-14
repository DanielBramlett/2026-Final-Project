import { SHIP_TYPES } from '../constants/shipTypes.js';

export default class CombatSystem {
    constructor(scene) {
        this.scene = scene;
        this.projectiles = [];
        this.lastFireTime = {};
        this.fireRate = 1000; // Base fire rate in milliseconds
        this.selectedAmmo = 'cannonballs'; // Default selected ammo
        this.individualCannonSounds = true; // Enable individual cannon sounds
        this.soundDelayPerCannon = 50; // Delay between individual cannon sounds in milliseconds
        
        // Boarding system
        this.boardingRange = 100; // Distance required for boarding
        this.boardingDuration = 3000; // Duration of boarding combat in milliseconds
        this.boardingCooldown = {}; // Track cooldown for each ship
        this.boardingCooldownTime = 5000; // 5 seconds cooldown between boarding attempts
        this.boardingShips = new Set(); // Track ships currently involved in boarding
        this.boardingInProgress = false; // Track if boarding is currently in progress
        this.controlsDisabled = false; // Track if controls are disabled due to boarding
    }

    setSelectedAmmo(ammoType) {
        this.selectedAmmo = ammoType;
    }

    getSelectedAmmo() {
        return this.selectedAmmo;
    }

    fireCannon(ship, side = 'both') {
        const currentTime = Date.now();
        const shipId = ship.isPlayer ? 'player' : ship.id;
        
        // Prevent firing during boarding - comprehensive check
        if (this.controlsDisabled || this.isShipBoarding(ship)) {
            console.log(`🚫 Cannot fire cannons - boarding in progress or ${shipId} is involved in boarding!`);
            return false;
        }
        
        console.log(`🚢 Attempting to fire ${side} side. Selected ammo: ${this.selectedAmmo}, Available: ${ship.tradeGoods[this.selectedAmmo] || 0}`);
        
        if (this.lastFireTime[shipId] && currentTime - this.lastFireTime[shipId] < this.fireRate) {
            console.log(`⏱️ Cannons on cooldown for ${shipId}`);
            return false;
        }

        const cannonsPerSide = Math.floor(ship.cannons / 2);
        const hasExtraCannon = ship.cannons % 2 === 1;
        const leftCannons = side === 'left' || side === 'both' ? cannonsPerSide : 0;
        const rightCannons = side === 'right' || side === 'both' ? cannonsPerSide : 0;
        
        let extraCannonSide = null;
        if (hasExtraCannon && side === 'both') {
            extraCannonSide = Math.random() < 0.5 ? 'left' : 'right';
        } else if (hasExtraCannon && side === 'left') {
            extraCannonSide = 'left';
        } else if (hasExtraCannon && side === 'right') {
            extraCannonSide = 'right';
        }

        console.log(`🎯 Firing ${leftCannons} left cannons, ${rightCannons} right cannons`);

        if (ship.tradeGoods[this.selectedAmmo] > 0) {
            ship.tradeGoods[this.selectedAmmo]--;
            this.createProjectiles(ship, this.selectedAmmo, leftCannons, rightCannons, extraCannonSide);
            this.lastFireTime[shipId] = currentTime;
            console.log(`✅ Successfully fired ${this.selectedAmmo}! Remaining: ${ship.tradeGoods[this.selectedAmmo]}`);
            return true;
        }

        console.log(`❌ No ${this.selectedAmmo} available!`);
        return false;
    }

    // Boarding system methods
    canBoardShip(attacker, target) {
        const currentTime = Date.now();
        const attackerId = attacker.isPlayer ? 'player' : attacker.id;
        
        if (this.boardingCooldown[attackerId] && currentTime - this.boardingCooldown[attackerId] < this.boardingCooldownTime) {
            console.log(`⏱️ Boarding on cooldown for ${attackerId}`);
            return false;
        }
        
        const distance = Phaser.Math.Distance.Between(attacker.x, attacker.y, target.x, target.y);
        const requiredDistance = (attacker.size / 2) + (target.size / 2) + this.boardingRange;
        
        if (distance > requiredDistance) {
            console.log(`📏 Too far to board: ${distance}px > ${requiredDistance}px`);
            return false;
        }
        
        if (target.health <= 0) {
            console.log(`❌ Cannot board destroyed ship`);
            return false;
        }
        
        return true;
    }

    initiateBoarding(attacker, target) {
        if (!this.canBoardShip(attacker, target)) {
            return false;
        }
        
        const attackerId = attacker.isPlayer ? 'player' : attacker.id;
        const targetId = target.isPlayer ? 'player' : target.id;
        this.boardingCooldown[attackerId] = Date.now();
        
        // Add both ships to boarding set
        this.boardingShips.add(attackerId);
        this.boardingShips.add(targetId);
        
        // Set boarding state and disable controls
        this.boardingInProgress = true;
        this.disableBoardingControls();
        
        console.log(`⚔️ ${attacker.isPlayer ? 'PLAYER' : 'ENEMY'} initiating boarding on ${target.shipType.name}!`);
        console.log(`🚫 Boarding ships locked: ${Array.from(this.boardingShips).join(', ')}`);
        
        const boardingMessage = attacker.isPlayer ? 
            "BOARDING ACTION! Crew combat in progress..." : 
            "ENEMY BOARDING! Defend the ship!";
            
        this.showBoardingMessage(boardingMessage, attacker.isPlayer);
        this.scene.sound.play('wood_breaking');
        
        setTimeout(() => {
            this.resolveBoarding(attacker, target);
        }, this.boardingDuration);
        
        return true;
    }

    resolveBoarding(attacker, target) {
        const attackerCrewStrength = this.calculateCrewStrength(attacker);
        const targetCrewStrength = this.calculateCrewStrength(target);
        
        console.log(`⚔️ Boarding combat: ${attackerCrewStrength} vs ${targetCrewStrength}`);
        
        const attackerRoll = attackerCrewStrength * (0.8 + Math.random() * 0.4);
        const targetRoll = targetCrewStrength * (0.8 + Math.random() * 0.4);
        
        const attackerWins = attackerRoll > targetRoll;
        
        if (attackerWins) {
            this.handleBoardingSuccess(attacker, target);
        } else {
            this.handleBoardingFailure(attacker, target);
        }
        
        // Remove both ships from boarding set
        const attackerId = attacker.isPlayer ? 'player' : attacker.id;
        const targetId = target.isPlayer ? 'player' : target.id;
        this.boardingShips.delete(attackerId);
        this.boardingShips.delete(targetId);
        
        // Re-enable controls after boarding
        this.boardingInProgress = false;
        this.enableBoardingControls();
        
        console.log(`✅ Boarding completed. Ships removed from boarding lock: ${attackerId}, ${targetId}`);
    }

    calculateCrewStrength(ship) {
        let strength = ship.crew;
        const healthRatio = ship.crewHealth / ship.maxCrewHealth;
        strength *= (0.5 + healthRatio * 0.5);
        strength *= (1 + ship.size / 1000);
        return Math.floor(strength);
    }

    handleBoardingSuccess(attacker, target) {
        console.log(`🎉 ${attacker.isPlayer ? 'PLAYER' : 'ENEMY'} won the boarding action!`);
        
        if (attacker.isPlayer) {
            const goldStolen = Math.floor(target.gold * 0.3);
            attacker.gold += goldStolen;
            
            const stolenGoods = {};
            Object.entries(target.tradeGoods).forEach(([goodType, amount]) => {
                if (amount > 0 && goodType !== 'crew') {
                    const stolenAmount = Math.floor(amount * 0.2);
                    if (stolenAmount > 0 && attacker.canAddCargo(stolenAmount)) {
                        attacker.tradeGoods[goodType] += stolenAmount;
                        target.tradeGoods[goodType] -= stolenAmount;
                        stolenGoods[goodType] = stolenAmount;
                    }
                }
            });
            
            let boardingDamage = Math.max(1, Math.floor(target.maxCrew * 0.1));
            
            // Apply faction boarding damage buff
            if (this.scene.factionSystem) {
                if (attacker.isPlayer) {
                    // Player boarding - use player's faction
                    boardingDamage = this.scene.factionSystem.getModifiedBoardingDamage(boardingDamage);
                    console.log(`Player boarding damage buff applied: ${Math.max(1, Math.floor(target.crew * 0.1))} -> ${boardingDamage}`);
                } else if (attacker.faction) {
                    // Enemy boarding - use enemy's faction
                    boardingDamage = this.scene.factionSystem.getModifiedBoardingDamageForFaction(boardingDamage, attacker.faction);
                    console.log(`Enemy boarding damage buff applied (${attacker.faction.displayName}): ${Math.max(1, Math.floor(target.crew * 0.1))} -> ${boardingDamage}`);
                }
            }
            
            target.takeBoardingDamage(boardingDamage);
            
            if (target.crew <= 0) {
                this.captureEnemyShip(attacker, target);
            }
            
            let message = `Boarding Successful! Stole ${goldStolen} gold!`;
            if (Object.keys(stolenGoods).length > 0) {
                message += ` Also stole: ${Object.entries(stolenGoods).map(([good, amount]) => `${amount} ${good}`).join(', ')}`;
            }
            message += ` Enemy crew took ${boardingDamage} casualties!`;
            this.showBoardingMessage(message, true);
            
        } else {
            const goldLost = Math.floor(target.gold * 0.2);
            target.gold -= goldLost;
            
            let boardingDamage = Math.max(1, Math.floor(target.crew * 0.1));
            
            // Apply faction boarding damage buff
            if (this.scene.factionSystem) {
                if (attacker.isPlayer) {
                    // Player boarding - use player's faction
                    boardingDamage = this.scene.factionSystem.getModifiedBoardingDamage(boardingDamage);
                    console.log(`Player boarding damage buff applied (enemy): ${Math.max(1, Math.floor(target.crew * 0.1))} -> ${boardingDamage}`);
                } else if (attacker.faction) {
                    // Enemy boarding - use enemy's faction
                    boardingDamage = this.scene.factionSystem.getModifiedBoardingDamageForFaction(boardingDamage, attacker.faction);
                    console.log(`Enemy boarding damage buff applied (${attacker.faction.displayName}): ${Math.max(1, Math.floor(target.crew * 0.1))} -> ${boardingDamage}`);
                }
            }
            
            target.takeBoardingDamage(boardingDamage);
            
            this.showBoardingMessage(`Boarding Failed! Lost ${goldLost} gold and ${boardingDamage} crew!`, false);
        }
    }

    handleBoardingFailure(attacker, target) {
        console.log(`💀 ${attacker.isPlayer ? 'PLAYER' : 'ENEMY'} lost the boarding action!`);
        
        const failureDamage = Math.max(1, Math.floor(attacker.crew * 0.1));
        
        if (attacker.isPlayer) {
            attacker.takeBoardingDamage(failureDamage);
            this.showBoardingMessage("Boarding Failed! Lost crew in the attempt!", true);
        } else {
            attacker.takeBoardingDamage(failureDamage);
            this.showBoardingMessage("Enemy boarding repelled!", false);
        }
    }

    captureEnemyShip(player, enemyShip) {
        console.log(`🏴‍☠️ PLAYER CAPTURED ${enemyShip.shipType.name}!`);
        console.log('Player ownedShips before capture:', player.ownedShips);
        console.log('Player namedShips before capture:', player.namedShips);
        
        // Get the correct ship type key (uppercase) from SHIP_TYPES
        const shipTypeKey = this.findShipTypeKey(enemyShip.shipType.name);
        console.log('Ship type key found:', shipTypeKey);
        
        if (!player.ownedShips.includes(shipTypeKey)) {
            player.ownedShips.push(shipTypeKey);
            console.log(`Added ${shipTypeKey} to player's owned ships!`);
        }
        
        const shipId = player.addNamedShip(shipTypeKey, `Captured ${enemyShip.shipType.name}`);
        console.log('Created named ship with ID:', shipId);
        console.log('Player ownedShips after capture:', player.ownedShips);
        console.log('Player namedShips after capture:', player.namedShips);
        
        // Force refresh of any open port menus
        if (this.scene.ports) {
            this.scene.ports.forEach(port => {
                if (port.menuActive && port.currentMenu === 'shipInventory') {
                    console.log('Refreshing port menu to show captured ship');
                    port.hideMenu();
                    setTimeout(() => {
                        port.showShipInventory();
                    }, 100);
                }
            });
        }
        
        const remainingGold = enemyShip.gold;
        player.gold += remainingGold;
        enemyShip.gold = 0;
        
        const transferredGoods = {};
        Object.entries(enemyShip.tradeGoods).forEach(([goodType, amount]) => {
            if (amount > 0 && goodType !== 'crew') {
                if (player.canAddCargo(amount)) {
                    player.tradeGoods[goodType] += amount;
                    transferredGoods[goodType] = amount;
                    enemyShip.tradeGoods[goodType] = 0;
                } else {
                    const spaceAvailable = player.getAvailableCargoSpace();
                    const transferAmount = Math.min(amount, spaceAvailable);
                    if (transferAmount > 0) {
                        player.tradeGoods[goodType] += transferAmount;
                        transferredGoods[goodType] = transferAmount;
                        enemyShip.tradeGoods[goodType] -= transferAmount;
                    }
                }
            }
        });
        
        let captureMessage = `🏴‍☠️ SHIP CAPTURED! ${enemyShip.shipType.name} is now yours!`;
        captureMessage += `\nGained ${remainingGold} gold and all remaining cargo!`;
        
        if (Object.keys(transferredGoods).length > 0) {
            captureMessage += `\nTransferred: ${Object.entries(transferredGoods).map(([good, amount]) => `${amount} ${good}`).join(', ')}`;
        }
        
        this.showBoardingMessage(captureMessage, true);
        this.removeCapturedEnemy(enemyShip);
        this.scene.sound.play('wood_breaking');
    }

    findShipTypeKey(shipName) {
        // Find the correct SHIP_TYPES key by matching the name property
        for (const [key, shipType] of Object.entries(SHIP_TYPES)) {
            if (shipType.name === shipName) {
                return key; // Return the uppercase key (e.g., 'SLOOP')
            }
        }
        console.warn(`Ship type key not found for ship name: ${shipName}`);
        return shipName.toUpperCase(); // Fallback to uppercase
    }

    removeCapturedEnemy(enemyShip) {
        const index = this.scene.enemyShips.indexOf(enemyShip);
        if (index > -1) {
            this.scene.enemyShips.splice(index, 1);
        }
        
        if (enemyShip.body) {
            enemyShip.body.destroy();
        }
        
        if (enemyShip.hitboxCircle) {
            enemyShip.hitboxCircle.destroy();
        }
        
        enemyShip.destroy();
        console.log(`Removed captured ${enemyShip.shipType.name} from the game`);
    }

    showBoardingMessage(message, isPlayer = false) {
        const messageText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            message,
            {
                fontSize: '32px',
                fill: isPlayer ? '#00FF00' : '#FF0000',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 },
                align: 'center'
            }
        );
        messageText.setScrollFactor(0);
        messageText.setDepth(2000);
        messageText.setOrigin(0.5, 0.5);
        
        setTimeout(() => {
            if (messageText && messageText.active) {
                messageText.destroy();
            }
        }, 3000);
    }

    setSelectedAmmo(ammoType) {
        this.selectedAmmo = ammoType;
    }

    getSelectedAmmo() {
        return this.selectedAmmo;
    }

    fireCannon(ship, side = 'both') {
        const currentTime = Date.now();
        const shipId = ship.isPlayer ? 'player' : ship.id;
        
        // Debug logging
        console.log(`🚢 Attempting to fire ${side} side. Selected ammo: ${this.selectedAmmo}, Available: ${ship.tradeGoods[this.selectedAmmo] || 0}`);
        
        // Check fire rate cooldown
        if (this.lastFireTime[shipId] && currentTime - this.lastFireTime[shipId] < this.fireRate) {
            console.log(`⏱️ Cannons on cooldown for ${shipId}`);
            return false;
        }

        // Calculate cannons per side, handling odd numbers
        const cannonsPerSide = Math.floor(ship.cannons / 2);
        const hasExtraCannon = ship.cannons % 2 === 1;
        const leftCannons = side === 'left' || side === 'both' ? cannonsPerSide : 0;
        const rightCannons = side === 'right' || side === 'both' ? cannonsPerSide : 0;
        
        // Determine which side gets the extra cannon
        let extraCannonSide = null;
        if (hasExtraCannon && side === 'both') {
            // When firing both sides, alternate which side gets the extra cannon
            extraCannonSide = Math.random() < 0.5 ? 'left' : 'right';
        } else if (hasExtraCannon && side === 'left') {
            extraCannonSide = 'left';
        } else if (hasExtraCannon && side === 'right') {
            extraCannonSide = 'right';
        }

        console.log(`🎯 Firing ${leftCannons} left cannons, ${rightCannons} right cannons`);

        // Check ammo availability
        if (ship.tradeGoods[this.selectedAmmo] > 0) {
            // Use one of the selected ammo type
            ship.tradeGoods[this.selectedAmmo]--;
            
            // Create projectiles for this ammo type
            this.createProjectiles(ship, this.selectedAmmo, leftCannons, rightCannons, extraCannonSide);
            
            this.lastFireTime[shipId] = currentTime;
            console.log(`✅ Successfully fired ${this.selectedAmmo}! Remaining: ${ship.tradeGoods[this.selectedAmmo]}`);
            return true;
        }

        console.log(`❌ No ${this.selectedAmmo} available!`);
        return false;
    }

    createProjectiles(ship, ammoType, leftCannons, rightCannons, extraCannonSide = null) {
        const projectileSpeed = this.getProjectileSpeed(ammoType);
        let projectileDamage = this.getProjectileDamage(ammoType);
        const projectileColor = this.getProjectileColor(ammoType);
        
        // Apply cannon type damage multiplier if ship has one
        console.log(`🔫 Checking cannon damage multiplier for ship: ${ship.cannonType}, multiplier: ${ship.cannonDamageMultiplier}`);
        if (ship.cannonDamageMultiplier) {
            const originalDamage = projectileDamage;
            projectileDamage = Math.floor(projectileDamage * ship.cannonDamageMultiplier);
            console.log(`🔫 Cannon type damage multiplier applied: ${ship.cannonType} (${ship.cannonDamageMultiplier}x) -> ${originalDamage} -> ${projectileDamage}`);
        } else {
            console.log(`🔫 No cannon damage multiplier found on ship`);
        }
        
        // Apply faction damage bonus
        if (this.scene.factionSystem) {
            if (ship.isPlayer) {
                // Player ship - use player's faction
                projectileDamage = this.scene.factionSystem.getModifiedDamage(projectileDamage);
                console.log(`Player faction damage bonus applied: ${this.getProjectileDamage(ammoType)} -> ${projectileDamage}`);
            } else if (ship.faction) {
                // Enemy ship - use enemy's faction
                projectileDamage = this.scene.factionSystem.getModifiedDamageForFaction(projectileDamage, ship.faction);
                console.log(`Enemy faction damage bonus applied (${ship.faction.displayName}): ${this.getProjectileDamage(ammoType)} -> ${projectileDamage}`);
            }
        }

        // Calculate wave size (cannons per wave, minimum 1)
        const totalRegularCannons = leftCannons + rightCannons;
        const waveSize = Math.max(1, Math.floor(totalRegularCannons / 5));
        
        // Create arrays to hold cannon positions for each side
        const leftCannonPositions = [];
        const rightCannonPositions = [];

        // Calculate left side cannon positions
        for (let i = 0; i < leftCannons; i++) {
            const angle = ship.facingAngle + Math.PI / 2; // 90 degrees to the left
            const spread = (i - leftCannons / 2) * 0.02; // Much tighter spread for focused firing
            leftCannonPositions.push({ angle: angle + spread, side: 'left' });
        }

        // Calculate right side cannon positions
        for (let i = 0; i < rightCannons; i++) {
            const angle = ship.facingAngle - Math.PI / 2; // 90 degrees to the right
            const spread = (i - rightCannons / 2) * 0.02; // Much tighter spread for focused firing
            rightCannonPositions.push({ angle: angle + spread, side: 'right' });
        }

        // Combine all regular cannon positions
        const allCannonPositions = [...leftCannonPositions, ...rightCannonPositions];
        
        // Fire cannons in waves, then extra cannon if any
        this.fireCannonsInWaves(ship, allCannonPositions, projectileSpeed, projectileDamage, projectileColor, ammoType, waveSize, extraCannonSide);
    }

    fireCannonsInWaves(ship, cannonPositions, projectileSpeed, projectileDamage, projectileColor, ammoType, waveSize, extraCannonSide = null) {
        let currentWave = 0;
        const totalWaves = Math.ceil(cannonPositions.length / waveSize);
        const waveDelay = 200; // Delay between waves in milliseconds
        let volleyProjectileCount = 0; // Track projectiles in this volley

        const fireNextWave = () => {
            const startIndex = currentWave * waveSize;
            const endIndex = Math.min(startIndex + waveSize, cannonPositions.length);
            
            // Fire cannons in this wave
            for (let i = startIndex; i < endIndex; i++) {
                const cannonPos = cannonPositions[i];
                this.createProjectile(ship, cannonPos.angle, projectileSpeed, projectileDamage, projectileColor, ammoType, volleyProjectileCount);
                volleyProjectileCount++;
            }
            
            currentWave++;
            
            // Schedule next wave if there are more cannons to fire
            if (currentWave < totalWaves) {
                setTimeout(fireNextWave, waveDelay);
            } else if (extraCannonSide) {
                // Fire extra cannon after all main waves are complete
                setTimeout(() => {
                    this.fireExtraCannon(ship, extraCannonSide, projectileSpeed, projectileDamage, projectileColor, ammoType, volleyProjectileCount);
                }, waveDelay);
            }
        };

        // Start firing the first wave
        fireNextWave();
    }

    fireExtraCannon(ship, side, projectileSpeed, projectileDamage, projectileColor, ammoType, volleyIndex) {
        // Calculate angle for the extra cannon
        const angle = side === 'left' ? ship.facingAngle + Math.PI / 2 : ship.facingAngle - Math.PI / 2;
        
        // Create the extra projectile
        this.createProjectile(ship, angle, projectileSpeed, projectileDamage, projectileColor, ammoType, volleyIndex);
        
        // Play sound for the extra cannon if individual sounds are disabled
        if (!this.individualCannonSounds) {
            const cannonSound = Math.random() < 0.5 ? 'cannon_shot_1' : 'cannon_shot_2';
            this.scene.sound.play(cannonSound);
        }
        
        console.log(`🎯 Fired extra cannon on ${side} side!`);
    }

    createProjectile(ship, angle, speed, damage, color, ammoType, volleyIndex = 0) {
        // Calculate starting position (offset from ship center)
        const startDistance = ship.size / 2 + 10;
        const startX = ship.x + Math.cos(angle) * startDistance;
        const startY = ship.y + Math.sin(angle) * startDistance;
        
        // Get texture name
        const textureName = this.getProjectileTexture(ammoType);
        
        // Create projectile sprite using ammo image
        const projectile = this.scene.add.sprite(startX, startY, textureName);
        projectile.setDisplaySize(50, 50);
        projectile.setDepth(1200); // Render above ships but below UI
        
        // Add to scene first
        this.scene.add.existing(projectile);
        
        // Create physics body
        this.scene.physics.add.existing(projectile, Phaser.Physics.Arcade.DYNAMIC_BODY);
        
        // Configure the physics body
        if (projectile.body) {
            projectile.body.type = Phaser.Physics.Arcade.DYNAMIC_BODY;
            projectile.body.enable = true;
            projectile.body.enabled = true;
            projectile.body.setCircle(25); // Match the 50x50 texture size
            projectile.body.setCollideWorldBounds(true);
            projectile.body.onWorldBounds = true;
            projectile.body.allowGravity = false;
            projectile.body.setImmovable(false);
            
            // Set velocity
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            projectile.body.setVelocity(velocityX, velocityY);
        }

        // Store projectile data
        projectile.damage = damage;
        projectile.ammoType = ammoType;
        projectile.owner = ship;
        projectile.createdAt = Date.now();
        projectile.lifetime = 30000; // 30 seconds

        // Add to projectiles array
        this.projectiles.push(projectile);

        // Set up collision detection
        this.setupProjectileCollision(projectile);

        // Play individual cannon sound if enabled
        if (this.individualCannonSounds) {
            const cannonSound = Math.random() < 0.5 ? 'cannon_shot_1' : 'cannon_shot_2';
            this.scene.sound.play(cannonSound);
        }
    }

    getProjectileTexture(ammoType) {
        const textureName = this.getTextureName(ammoType);
        console.log(`🔫 Getting ammo texture: ${textureName} for ${ammoType}`);
        
        // Check if texture exists in scene cache
        if (!this.scene.textures.exists(textureName)) {
            console.error(`❌ Ammo texture not found: ${textureName}, creating fallback`);
            this.createFallbackTexture(ammoType, textureName);
        }
        
        console.log(`✅ Using ammo texture: ${textureName}`);
        return textureName;
    }
    
    createFallbackTexture(ammoType, textureName) {
        // Create a simple black circle for all ammo types
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        
        graphics.fillStyle(0x000000, 1); // Pure black
        graphics.fillCircle(25, 25, 25); // 50x50 circle in 50x50 canvas
        
        const texture = graphics.generateTexture(textureName, 50, 50);
        graphics.destroy();
        
        console.log(`🎨 Created simple black circle texture: ${textureName}`);
    }
    
    getTextureName(ammoType) {
        switch (ammoType) {
            case 'cannonballs':
                return 'Cannonball';
            case 'chainshot':
                return 'Chainshot';
            case 'grapeshot':
                return 'Grapeshot';
            default:
                return 'Cannonball';
        }
    }

    setupProjectileCollision(projectile) {
        // Set projectile body properties for better collision
        projectile.body.setCircle(50); // Large collision body for 100x100 sprites
        
        // Check collision with enemy ships (if projectile is from player)
        if (projectile.owner.isPlayer) {
            this.scene.physics.add.overlap(projectile, this.scene.enemyShips, (proj, enemyShip) => {
                console.log(`💥 Collision detected between projectile and ${enemyShip.shipType.name}`);
                this.handleProjectileHit(proj, enemyShip);
            });
        } else {
            // Check collision with player ship (if projectile is from enemy)
            this.scene.physics.add.overlap(projectile, this.scene.playerShip, (proj, playerShip) => {
                console.log(`💥 Enemy projectile hit player!`);
                this.handleProjectileHit(proj, playerShip);
            });
            
            // Check collision with other enemy ships (friendly fire)
            this.scene.physics.add.overlap(projectile, this.scene.enemyShips, (proj, enemyShip) => {
                // Don't hit the ship that fired the projectile
                if (enemyShip !== projectile.owner) {
                    console.log(`💥 Enemy projectile hit another enemy!`);
                    this.handleProjectileHit(proj, enemyShip);
                }
            });
        }

        // Check collision with islands
        if (this.scene.islands && this.scene.islands.length > 0) {
            this.scene.physics.add.overlap(projectile, this.scene.islands, (proj, island) => {
                console.log(`🏝️ Projectile hit island`);
                this.destroyProjectile(proj);
            });
        }
    }

    handleProjectileHit(projectile, targetShip) {
        // Play wood breaking sound when projectile hits a ship
        this.scene.sound.play('wood_breaking');
        
        // Apply damage based on ammo type
        const damage = this.calculateDamage(projectile.ammoType, targetShip);
        
        // Apply damage to target ship
        if (projectile.ammoType === 'chainshot') {
            // Chainshot damages both sails and crew
            const sailsDamage = damage;
            const crewDamage = Math.floor(damage * 0.3); // 30% of damage goes to crew
            
            targetShip.takeDamage(sailsDamage, 'sails');
            targetShip.takeDamage(crewDamage, 'crew');
            
            // Log hit message with details
            if (projectile.owner.isPlayer) {
                console.log(`🎯 PLAYER HIT ${targetShip.shipType.name} with ${projectile.ammoType} for ${sailsDamage} sails damage and ${crewDamage} crew damage!`);
            } else {
                console.log(`💥 ENEMY HIT ${targetShip.shipType.name} with ${projectile.ammoType} for ${sailsDamage} sails damage and ${crewDamage} crew damage!`);
            }
        } else {
            // Other ammo types use single damage type
            const damageType = this.getDamageType(projectile.ammoType);
            targetShip.takeDamage(damage, damageType);
            
            // Log hit message with details
            if (projectile.owner.isPlayer) {
                console.log(`🎯 PLAYER HIT ${targetShip.shipType.name} with ${projectile.ammoType} for ${damage} ${damageType} damage!`);
            } else {
                console.log(`💥 ENEMY HIT ${targetShip.shipType.name} with ${projectile.ammoType} for ${damage} ${damageType} damage!`);
            }
        }

        // Destroy projectile
        this.destroyProjectile(projectile);
    }

    getDamageType(ammoType) {
        switch (ammoType) {
            case 'cannonballs':
                return 'hull';
            case 'chainshot':
                return 'sails';
            case 'grapeshot':
                return 'crew';
            default:
                return 'hull';
        }
    }

    calculateDamage(ammoType, targetShip) {
        const baseDamage = this.getProjectileDamage(ammoType);
        
        // Different ammo types have different effects
        switch (ammoType) {
            case 'cannonballs':
                return baseDamage; // Standard damage
            case 'chainshot':
                return Math.floor(baseDamage * 0.7); // Less damage but affects sails/turning
            case 'grapeshot':
                return Math.floor(baseDamage * 0.7); // Less damage but affects crew
            default:
                return baseDamage;
        }
    }

    getProjectileSpeed(ammoType) {
        switch (ammoType) {
            case 'cannonballs':
                return 1000; // Reduced from 2000 for better visibility
            case 'chainshot':
                return 750; // Reduced from 1800 for better visibility
            case 'grapeshot':
                return 1250; // Reduced from 2200 for better visibility
            default:
                return 1000;
        }
    }

    getProjectileDamage(ammoType) {
        switch (ammoType) {
            case 'cannonballs':
                return 8;
            case 'chainshot':
                return 6;
            case 'grapeshot':
                return 5;
            default:
                return 4;
        }
    }

    getProjectileColor(ammoType) {
        switch (ammoType) {
            case 'cannonballs':
                return 0x333333; // Dark gray
            case 'chainshot':
                return 0x8B4513; // Brown
            case 'grapeshot':
                return 0xFFD700; // Gold
            default:
                return 0x333333;
        }
    }

    destroyProjectile(projectile) {
        const index = this.projectiles.indexOf(projectile);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
        projectile.destroy();
    }

    update(delta) {
        // Update projectiles and remove expired ones
        const currentTime = Date.now();
        this.projectiles = this.projectiles.filter(projectile => {
            if (!projectile.active) {
                return false;
            }

            // Check lifetime
            const age = currentTime - projectile.createdAt;
            if (age > projectile.lifetime) {
                projectile.destroy();
                return false;
            }

            return true;
        });
    }

    getAmmoStatus(ship) {
        return {
            cannonballs: ship.tradeGoods.cannonballs,
            chainshot: ship.tradeGoods.chainshot,
            grapeshot: ship.tradeGoods.grapeshot
        };
    }

    isShipBoarding(ship) {
        const shipId = ship.isPlayer ? 'player' : ship.id;
        return this.boardingShips.has(shipId);
    }

    getBoardingShips() {
        return Array.from(this.boardingShips);
    }

    disableBoardingControls() {
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

        console.log('🔒 All controls disabled due to boarding');
    }

    enableBoardingControls() {
        if (!this.controlsDisabled) {
            return;
        }

        this.controlsDisabled = false;

        // Re-enable keyboard input
        if (this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.enabled = true;
        }
        if (this.scene.input) {
            this.scene.input.enabled = true;
        }
        if (this.scene.playerSystem) {
            this.scene.playerSystem.movementDisabled = false;
        }

        console.log('🔓 All controls re-enabled after boarding');
    }

    areBoardingControlsDisabled() {
        return this.controlsDisabled;
    }
}