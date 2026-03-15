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

        // Trade and inventory properties
        this.gold = 1000; // Starting gold
        this.ownedShips = ['SLOOP']; // Player starts with only a Sloop
        this.tradeGoods = {
            food: 0,
            cannonballs: 0,
            rum: 0,
            suger: 0,
            iron: 0,
            Bronze: 0,
            Copper: 0,
            Gold: 0,
            coal: 0
        };

        this.galleyAnimationFrame = 1; // Track animation frame for galleys
        this.galleyAnimationTimer = 0; // Timer for galley animation
        this.galleyAnimationSpeed = 300; // Time between animation frames in milliseconds

        // Velocity tracking
        this.velocityX = 0;
        this.velocityY = 0;
        this.rotationSpeed = 0;
        this.facingAngle = 0; // Track rotation for movement, but not visual rotation
        
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
            this.setTexture(this.shipType.image);
        } else {
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
        this.setDisplaySize(this.size, this.size);
    }
    
    createHitboxCircle() {
        // Create graphics object for hitbox circle
        this.hitboxCircle = this.scene.add.graphics();
        this.hitboxCircle.setDepth(1000); // Ensure it's drawn on top
        this.updateHitboxCircle();
    }
    
    updateHitboxCircle() {
        if (!this.hitboxCircle) return;
        
        this.hitboxCircle.clear();
        
        // Get the actual physics body dimensions directly
        const body = this.body;
        const width = body.width;
        const height = body.height;
        
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
        this.setTexture(`${this.shipType.name}_${direction}_${this.galleyAnimationFrame}`);
        this.setDisplaySize(this.size, this.size);
    } else {
        this.setTexture(`${this.shipType.name}_${direction}`);
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
        // Apply velocity
        this.setVelocity(this.velocityX, this.velocityY);
        
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
}
