export default class Ship extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, shipType) {
        super(scene, x, y);
        
        this.shipType = shipType;
        this.size = shipType.size;
        this.speed = shipType.speed;
        this.turnSpeed = shipType.turnSpeed;
        this.cannons = shipType.cannons;
        this.color = shipType.color;
        this.rowing = shipType.rowing;
        this.crew = shipType.crew;
        this.crewMax = shipType.crewMax;
        
        // Velocity tracking
        this.velocityX = 0;
        this.velocityY = 0;
        this.rotationSpeed = 0;
        
        // Create visual representation
        this.createVisuals();
        
        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);
    }
    
    createVisuals() {
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
        this.setDisplaySize(this.size, this.size);
    }
    
    moveForward() {
        const angle = this.rotation;
        this.velocityX = (Math.cos(angle) * this.speed) + (Math.cos(angle) * this.rowing);
        this.velocityY = (Math.sin(angle) * this.speed) + (Math.sin(angle) * this.rowing);
    }
    
    moveBackward() {
        const angle = this.rotation;
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
        this.rotationSpeed = 0;
    }
    
    stop() {
        this.velocityX = 0;
        this.velocityY = 0;
    }
    
    update(time, delta) {
        // Apply velocity
        this.setVelocity(this.velocityX, this.velocityY);
        
        // Apply rotation (delta is in milliseconds, convert to seconds)
        this.rotation += this.rotationSpeed * 0.01 * (delta / 1000);
    }
    
    getCannonInfo() {
        return {
            count: this.cannons,
            fireRate: 1000 / this.cannons
        };
    }
}
