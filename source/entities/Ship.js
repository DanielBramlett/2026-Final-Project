export default class Ship extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, shipType) {
        super(scene, x, y);
        
        this.shipType = shipType;
        this.size = shipType.size;
        this.speed = shipType.speed;
        this.turnSpeed = shipType.turnSpeed;
        this.cannons = shipType.cannons;
        this.image = shipType.image ? null : shipType.color;
        this.rowing = shipType.rowing;
        this.crew = shipType.crew;
        this.crewMax = shipType.crewMax;
        this.cargo = shipType.cargo;
        this.cargoMax = shipType.cargoMax;
        this.windResistance = shipType.windResistance || 0.5; // Default wind resistance if not specified
        this.isGalley = shipType.isGalley || 0

        this.galleyAnimationFrame = 1; // Track animation frame for galleys
        this.galleyAnimationTimer = 0; // Timer for galley animation
        this.galleyAnimationSpeed = 300; // Time between animation frames in milliseconds
        this.galleyDirection = 'East'; // Lock direction during animation

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
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);
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
                -this.size / 2, -this.size / 2,
                this.size / 2, -this.size / 2,
                0, -this.size / 2 - 15
            ));
            
            const texture = graphics.generateTexture('shipTexture_' + Math.random(), this.size, this.size);
            graphics.destroy();
            
            this.setTexture('shipTexture_' + Math.random());
        }
        this.setDisplaySize(this.size, this.size);
    }

    updateSpriteDirection() {
    const cosAngle = Math.cos(this.facingAngle);
    const direction = cosAngle > 0 ? 'East' : 'West';
    
    if (this.isGalley) {
        const isMoving = Math.abs(this.velocityX) > 0.1 || Math.abs(this.velocityY) > 0.1;
        
        if (direction === 'East') {
            if (isMoving) {
                this.galleyAnimationTimer += this.scene.game.lastFrame || 16;
                if (this.galleyAnimationTimer >= this.galleyAnimationSpeed) {
                    this.galleyAnimationFrame = this.galleyAnimationFrame === 3 ? 1 : this.galleyAnimationFrame + 1;
                    this.galleyAnimationTimer = 0;
                }
            }
            const shipName = this.shipType.name.charAt(0).toUpperCase() + this.shipType.name.slice(1);
            this.setTexture(`${shipName}_East_${this.galleyAnimationFrame}`);
        } else {
            if (isMoving) {
                this.galleyAnimationTimer += this.scene.game.lastFrame || 16;
                if (this.galleyAnimationTimer >= this.galleyAnimationSpeed) {
                    this.galleyAnimationFrame = this.galleyAnimationFrame === 3 ? 1 : this.galleyAnimationFrame + 1;
                    this.galleyAnimationTimer = 0;
                }
            }
            this.setTexture(`${this.shipType.name}_West_${this.galleyAnimationFrame}`);
        }
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
    }
    
    getCannonInfo() {
        return {
            count: this.cannons,
            fireRate: 1000 / this.cannons
        };
    }
}
