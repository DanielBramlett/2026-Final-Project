export default class WindSystem {
    constructor(scene, changeInterval = 5000) {
        this.scene = scene;
        this.changeInterval = changeInterval;
        this.timeScinceLastChange = 0;
        
        this.direction = Math.random() * Math.PI * 2; // Random initial direction
        this.speed = 25;
        this.maxSpeed = 75;
        this.minSpeed = 15;
    }

    update (delta) {
        this.timeScinceLastChange += delta;

        if (this.timeScinceLastChange >= this.changeInterval) {
            this.changeWind();
            this.timeScinceLastChange = 0;
        }
    }

    changeWind() {
        this.direction = Math.random() * Math.PI * 2; // Random direction
        this.speed = Phaser.Math.Between(this.minSpeed, this.maxSpeed); // Random speed between min and max
    }

    getWindEffect(shipRotation) {
        const angleDiff = this.normalizeAngle(this.direction - shipRotation);
        const effect = Math.cos(angleDiff);

        return {
            factor: effect,
            direction: this.direction,
            speed: this.speed
        };
    }

    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }

    getDirectionVector() {
        return (this.direction * 180 / Math.PI) % 360; // Convert to degrees and wrap around 360
    }
        }