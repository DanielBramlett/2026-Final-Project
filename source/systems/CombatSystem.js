export default class CombatSystem {
    constructor(scene) {
        this.scene = scene;
        this.projectiles = [];
        this.lastFireTime = {};
        this.fireRate = 1000; // Base fire rate in milliseconds
        this.selectedAmmo = 'cannonballs'; // Default selected ammo
        this.individualCannonSounds = true; // Enable individual cannon sounds
        this.soundDelayPerCannon = 50; // Delay between individual cannon sounds in milliseconds
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
        const projectileDamage = this.getProjectileDamage(ammoType);
        const projectileColor = this.getProjectileColor(ammoType);

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
                return Math.floor(baseDamage * 0.5); // Less damage but affects crew
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
                return 20;
            case 'chainshot':
                return 14;
            case 'grapeshot':
                return 10;
            default:
                return 20;
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
}
