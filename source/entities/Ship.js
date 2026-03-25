import { SHIP_TYPES } from '../constants/shipTypes.js';

export default class Ship extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, shipType) {
        super(scene, x, y);
        
        this.shipType = shipType;
        this.size = shipType.size;
        this.speed = shipType.speed;
        this.turnSpeed = shipType.turnSpeed;
        this.cannons = shipType.cannons;
        this.image = shipType.image;
        this.rowing = shipType.rowing;
        this.crew = shipType.crew;
        this.crewMax = shipType.crewMax;
        this.cargo = shipType.cargo;
        this.cargoMax = shipType.cargoMax;
        this.windResistance = shipType.windResistance || 0.5; // Default wind resistance if not specified
        this.isGalley = shipType.isGalley || 0;
        this.image = shipType.image;
        this.hitboxOffsetX = shipType.hitboxOffsetX;
        this.hitboxOffsetY = shipType.hitboxOffsetY;
        this.needsOffset = shipType.needsOffset || 0;
        
        // Add color property for procedural texture fallback
        this.color = shipType.color || 0x8B4513; // Default brown color for ships

        // Trade and inventory properties
        this.gold = 10000; // Starting gold
        this.ownedShips = ['SLOOP']; // Player starts with only a Sloop
        this.namedShips = {}; // Object to store named ships with their custom names
        
        // Add the starting sloop with a default name
        // This will be overridden when restoring saved named ships in changePlayerShip
        this.namedShips['SLOOP_START'] = {
            shipKey: 'SLOOP',
            shipName: 'Starter Sloop',
            acquiredAt: Date.now()
        };
        
        this.tradeGoods = {
            food: 0,
            cannonballs: 0,
            chainshot: 0,
            grapeshot: 0,
            wood: 0,
            rum: 0,
            suger: 0,
            iron: 0,
            bronze: 0,
            copper: 0,
            gold_bar: 0,
            coal: 0,
            salt: 0,
            fish: 0,
            lanterns: 0,
            wine: 0,
            tea: 0,
            pepper: 0,
            silk: 0,
            cocoa: 0,
            oil: 0,
            cannons: 0,
            bacon: 0,
            candles: 0,
            cutlass: 0,
            saber: 0,
            flintlock_pistol: 0,
            flintlock_musket: 0,
            blunderbuss: 0,
            crossbow: 0,
            arrows: 0,
            steel: 0,
            // New regional specialty goods
            tobacco: 0,
            silver: 0,
            gems: 0,
            cotton: 0,
            indigo: 0,
            spices: 0,
            dyes: 0,
            timber: 0,
            jade: 0
        };

        this.galleyAnimationFrame = 1; // Track animation frame for galleys
        this.galleyAnimationTimer = 0; // Timer for galley animation
        this.galleyAnimationSpeed = 300; // Time between animation frames in milliseconds

        // Velocity tracking
        this.velocityX = 0;
        this.velocityY = 0;
        this.rotationSpeed = 0;
        this.facingAngle = 0; // Track rotation for movement, but not visual rotation
        
        // Combat properties
        this.health = shipType.health || 100;
        this.maxHealth = shipType.maxHealth || 100;
        this.crewHealth = this.crew;
        this.maxCrewHealth = this.crewMax;
        this.sailIntegrity = shipType.sailIntegrity || 100;
        this.maxSailIntegrity = shipType.maxSailIntegrity || 100;
        this.isPlayer = false; // Will be set by PlayerSystem
        this.destroyed = false; // Track if ship is destroyed
        
        // Create visual representation
        this.createVisuals();
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Make physics body smaller than visual size and longer than tall
        // Use ship type specific hitbox scales, or fall back to defaults
        const bodyScaleX = this.shipType.hitboxScaleX || 0.25;
        const bodyScaleY = this.shipType.hitboxScaleY || 0.15;
        this.body.setSize(this.size * bodyScaleX, this.size * bodyScaleY);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.2);
        
        // Create hitbox visualization
        this.createHitboxCircle();
    }
    
    createVisuals() {
        // Use image if defined in shipType, otherwise create procedural texture
        if (this.shipType.image) {
            console.log(`🚢 Setting ship texture to: ${this.shipType.image}`);
            this.setTexture(this.shipType.image);
            
            // Check if texture actually loaded
            if (!this.texture || !this.texture.key) {
                console.error(`❌ Failed to load texture: ${this.shipType.image}`);
                // Fallback to procedural texture
                this.createProceduralTexture();
            } else {
                console.log(`✅ Successfully loaded texture: ${this.texture.key}`);
            }
        } else {
            this.createProceduralTexture();
        }
        this.setDisplaySize(this.size, this.size);
    }
    
    createProceduralTexture() {
        // Create rectangle for ship body
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(this.color, 1);
        graphics.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        
        // Create ship front indicator (triangle)
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillTriangleShape(new Phaser.Geom.Triangle(
            -this.size / 2, -this.size,
            this.size / 2, -this.size,
            0, -this.size - 15
        ));
        
        const texture = graphics.generateTexture('shipTexture_' + Math.random(), this.size, this.size);
        graphics.destroy();
        
        this.setTexture('shipTexture_' + Math.random());
    }
    
    createHitboxCircle() {
        // Create graphics object for hitbox circle
        this.hitboxCircle = this.scene.add.graphics();
        this.hitboxCircle.setDepth(1000); // Ensure it's drawn on top
        this.updateHitboxCircle();
    }
    
    updateHitboxCircle() {
        // Don't update if ship is destroyed or hitbox doesn't exist
        if (this.destroyed || !this.hitboxCircle) {
            return;
        }
        
        this.hitboxCircle.clear();
        
        // Get the actual physics body dimensions directly
        const body = this.body;
        if (!body) {
            console.warn(`⚠️ Ship physics body not available for hitbox update`);
            return;
        }
        
        const width = body.width || this.size * 0.25; // Fallback to default
        const height = body.height || this.size * 0.15; // Fallback to default
        
        // Draw rectangle (red for player, blue for enemies)
        const color = this.isPlayer ? 0xFF0000 : 0x0000FF;
        this.hitboxCircle.lineStyle(3, color, 0.8);
        
        if (this.needsOffset === 1) {
            const offsetX = -width/2;
            const offsetY = -height/2;
            this.hitboxCircle.strokeRect(this.x + offsetX, this.y + offsetY, width, height);
            
            // Also adjust the actual physics body position for galleys
            this.body.setOffset(this.shipType.hitboxOffsetX || 0, this.shipType.hitboxOffsetY || 0);
        } else {
            // Normal centered positioning for non-galley ships
            this.hitboxCircle.strokeRect(this.x - width/2, this.y - height/2, width, height);
        }
    }

updateSpriteDirection() {
    // Determine direction based on facing angle
    const cosAngle = Math.cos(this.facingAngle);
    const direction = cosAngle > 0 ? 'East' : 'West';
    
    if (this.isGalley) {
        // Only animate when ship is actually moving
        if (Math.abs(this.velocityX) > 0.5 || Math.abs(this.velocityY) > 0.5) {
            this.galleyAnimationTimer += this.scene.game.lastFrame || 16;
            if (this.galleyAnimationTimer >= this.galleyAnimationSpeed) {
                this.galleyAnimationFrame = this.galleyAnimationFrame === 3 ? 1 : this.galleyAnimationFrame + 1;
                this.galleyAnimationTimer = 0;
            }
        }
        const textureKey = `${this.shipType.name}_${direction}_${this.galleyAnimationFrame}`;
        if (this.scene && this.scene.textures && this.scene.textures.exists(textureKey)) {
            this.setTexture(textureKey);
            this.setDisplaySize(this.size, this.size);
        } else {
            console.warn(`⚠️ Ship texture not found: ${textureKey}, keeping current texture`);
        }
    } else {
        const textureKey = `${this.shipType.name}_${direction}`;
        if (this.scene && this.scene.textures && this.scene.textures.exists(textureKey)) {
            this.setTexture(textureKey);
        } else {
            console.warn(`⚠️ Ship texture not found: ${textureKey}, keeping current texture`);
        }
    }
}
    moveForward() {
        const angle = this.facingAngle;
        const windEffect = this.scene.windSystem.getWindEffect(angle);
        
        const windBoost = this.speed * windEffect.factor * this.shipType.windResistance;
        const forwardSpeed = this.speed + windBoost;

        this.velocityX = (Math.cos(angle) * forwardSpeed) + (Math.cos(angle) * this.rowing);
        this.velocityY = (Math.sin(angle) * forwardSpeed) + (Math.sin(angle) * this.rowing);
    }
    
    moveBackward() {
        const angle = this.facingAngle;
        this.velocityX = Math.cos(angle) * this.speed * -0.5;
        this.velocityY = Math.sin(angle) * this.speed * -0.5;
    }
    
    rotateLeft() {
        this.rotationSpeed = -this.turnSpeed;
    }
    
    rotateRight() {
        this.rotationSpeed = this.turnSpeed;
    }
    
    stopRotation() {
        let rotationDeceleration = 0.95; // Adjust this value for more or less rotation deceleration
        if (this.shipType.turnSpeed < 150) {
        rotationDeceleration = .95
        } else { rotationDeceleration = .85}
        this.rotationSpeed *= rotationDeceleration;

        // Stop if rotation speed is very small
        if (Math.abs(this.rotationSpeed) < 0.01) {
             this.rotationSpeed = 0;
        }
        
    }
    
    applyDeceleration() {
        const deceleration = 0.95; // Adjust this value for more or less deceleration
        this.velocityX *= deceleration;
        this.velocityY *= deceleration;
        
        // Stop if velocity is very small
        if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0;
        if (Math.abs(this.velocityY) < 0.1) this.velocityY = 0;
    }
    
    update(time, delta) {
        // Don't update if ship is destroyed
        if (this.destroyed) {
            return;
        }
        
        // Apply velocity (only if physics body exists)
        if (this.body && this.body.setVelocity) {
            this.setVelocity(this.velocityX, this.velocityY);
        } else {
            console.error(`❌ Ship physics body not available for setVelocity`);
        }
        
        // Update facing angle for movement (don't apply to visual rotation)
        this.facingAngle += this.rotationSpeed * 0.01 * (delta / 1000);
        
        // Update sprite direction based on facing angle
        this.updateSpriteDirection();
        
        // Update hitbox circle position
        this.updateHitboxCircle();
    }
    
    getCannonInfo() {
        return {
            count: this.cannons,
            fireRate: 1000 / this.cannons
        };
    }

    getCurrentCargo() {
        return Object.values(this.tradeGoods).reduce((total, amount) => total + amount, 0);
    }

    getAvailableCargoSpace() {
        return this.cargoMax - this.getCurrentCargo();
    }

    canAfford(cost) {
        return this.gold >= cost;
    }

    canAddCargo(amount) {
        return this.getAvailableCargoSpace() >= amount;
    }

    purchaseTradeGood(goodType, amount, costPerUnit) {
        const totalCost = amount * costPerUnit;
        
        if (!this.canAfford(totalCost)) {
            return { success: false, message: 'Not enough gold!' };
        }
        
        if (!this.canAddCargo(amount)) {
            return { success: false, message: 'Not enough cargo space!' };
        }
        
        this.gold -= totalCost;
        this.tradeGoods[goodType] += amount;
        this.cargo = this.getCurrentCargo();
        
        return { success: true, message: `Purchased ${amount} ${goodType} for ${totalCost} gold!` };
    }

    sellTradeGood(goodType, amount, sellPricePerUnit) {
        // Check if player has enough of the good to sell
        if (this.tradeGoods[goodType] < amount) {
            return { success: false, message: 'Not enough goods to sell!' };
        }
        
        const totalRevenue = amount * sellPricePerUnit;
        
        this.gold += totalRevenue;
        this.tradeGoods[goodType] -= amount;
        this.cargo = this.getCurrentCargo();
        
        return { success: true, message: `Sold ${amount} ${goodType} for ${totalRevenue} gold!` };
    }

    // Combat methods
    takeDamage(damage, damageType = 'hull') {
        switch (damageType) {
            case 'hull':
                this.health = Math.max(0, this.health - damage);
                break;
            case 'crew':
                this.crewHealth = Math.max(0, this.crewHealth - damage);
                this.crew = Math.max(0, this.crew - Math.floor(damage / 10));
                break;
            case 'sails':
                this.sailIntegrity = Math.max(0, this.sailIntegrity - damage);
                // Reduce speed when sails are damaged
                const speedReduction = 1 - (this.sailIntegrity / this.maxSailIntegrity);
                this.speed = this.shipType.speed * (1 - speedReduction * 0.5);
                break;
        }
        
        // Check if ship is destroyed
        if (this.health <= 0) {
            this.destroyShip();
        }
    }

    destroyShip() {
        // Mark as destroyed to prevent further updates
        this.destroyed = true;
        
        // Create explosion effect or sinking animation
        console.log(`${this.shipType.name} has been destroyed!`);
        
        // Clean up hitbox circle
        if (this.hitboxCircle) {
            this.hitboxCircle.destroy();
            this.hitboxCircle = null;
        }
        
        // Remove from physics system
        if (this.body) {
            this.body.destroy();
        }
        
        // Finally destroy the sprite
        this.destroy();
    }

    repairShip(repairAmount) {
        this.health = Math.min(this.maxHealth, this.health + repairAmount);
    }

    repairCrew(repairAmount) {
        this.crewHealth = Math.min(this.maxCrewHealth, this.crewHealth + repairAmount);
        this.crew = Math.min(this.crewMax, this.crew + Math.floor(repairAmount / 10));
    }

    repairSails(repairAmount) {
        this.sailIntegrity = Math.min(this.maxSailIntegrity, this.sailIntegrity + repairAmount);
        // Restore speed when sails are repaired
        const sailEfficiency = this.sailIntegrity / this.maxSailIntegrity;
        this.speed = this.shipType.speed * (0.5 + sailEfficiency * 0.5);
    }

    getCombatStatus() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            crewHealth: this.crewHealth,
            maxCrewHealth: this.maxCrewHealth,
            sailIntegrity: this.sailIntegrity,
            maxSailIntegrity: this.maxSailIntegrity,
            ammo: {
                cannonballs: this.tradeGoods.cannonballs,
                chainshot: this.tradeGoods.chainshot,
                grapeshot: this.tradeGoods.grapeshot
            }
        };
    }

    canFireCannons() {
        return this.tradeGoods.cannonballs > 0 || 
               this.tradeGoods.chainshot > 0 || 
               this.tradeGoods.grapeshot > 0;
    }

    getCannonSideCount(side) {
        const cannonsPerSide = Math.floor(this.cannons / 2);
        return cannonsPerSide;
    }

    // Named ship management methods
    addNamedShip(shipKey, shipName) {
        if (!this.namedShips) {
            this.namedShips = {};
        }
        // Generate a unique ID for this named ship
        const shipId = `${shipKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.namedShips[shipId] = {
            shipKey: shipKey,
            shipName: shipName,
            acquiredAt: Date.now()
        };
        return shipId;
    }

    removeNamedShip(shipId) {
        if (this.namedShips && this.namedShips[shipId]) {
            delete this.namedShips[shipId];
        }
    }

    getNamedShip(shipId) {
        return this.namedShips ? this.namedShips[shipId] : null;
    }

    getAllNamedShips() {
        return this.namedShips || {};
    }

    getNamedShipsByType(shipKey) {
        const allShips = this.getAllNamedShips();
        const result = [];
        for (const shipId in allShips) {
            if (allShips[shipId].shipKey === shipKey) {
                result.push({ shipId, ...allShips[shipId] });
            }
        }
        return result;
    }

    getShipDisplayName(shipId, shipKey) {
        const namedShip = this.getNamedShip(shipId);
        if (namedShip) {
            return namedShip.shipName;
        }
        // Fallback to default ship name
        const shipType = SHIP_TYPES[shipKey];
        return shipType ? shipType.name : shipKey;
    }
}
