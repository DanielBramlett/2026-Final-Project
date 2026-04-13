export default class TradeRunSystem {
    constructor(scene, shipTypes) {
        this.scene = scene;
        this.shipTypes = shipTypes;
        this.activeTradeRuns = []; // Array of active trade runs
        this.tradeRunDuration = 7 * 60 * 1000; // 7 minutes in milliseconds
        this.tradeRunMultiplier = 4; // 4x return on investment
    }

    // Start a trade run with a specific ship type
    startTradeRun(shipType) {
        // Find the ship key for this ship type
        const shipKey = Object.keys(this.shipTypes).find(key => 
            this.shipTypes[key].name === shipType.name
        );
        
        // Check if player has the ship in their inventory
        if (!shipKey || !this.scene.playerShip.ownedShips.includes(shipKey)) {
            console.log(`Player doesn't own ${shipType.name}!`);
            return false;
        }

        // Remove ship from owned ships list when sent on trade run
        const shipIndex = this.scene.playerShip.ownedShips.indexOf(shipKey);
        if (shipIndex > -1) {
            this.scene.playerShip.ownedShips.splice(shipIndex, 1);
        }

        // Calculate cost based on ship's cargo capacity
        const cost = shipType.cargoMax;
        
        // Check if player has enough gold
        if (this.scene.playerShip.gold < cost) {
            console.log(`Not enough gold! Need ${cost}, have ${this.scene.playerShip.gold}`);
            return false;
        }

        // Deduct cost from player's gold
        this.scene.playerShip.gold -= cost;

        // Create trade run object
        const tradeRun = {
            id: Date.now(),
            shipType: shipType,
            startTime: Date.now(),
            endTime: Date.now() + this.tradeRunDuration,
            cost: cost,
            reward: cost * this.tradeRunMultiplier,
            status: 'active' // active, completed, failed
        };

        // Add to active trade runs
        this.activeTradeRuns.push(tradeRun);

        console.log(`Trade run started! ${shipType.name} sent on trade mission`);
        console.log(`Cost: ${cost} gold, Potential reward: ${tradeRun.reward} gold`);
        console.log(`Duration: 7 minutes`);

        // Show notification to player
        this.showTradeRunNotification(tradeRun, 'started');

        return true;
    }

    // Update trade runs (call this from GameScene update)
    update() {
        const currentTime = Date.now();
        const completedRuns = [];

        this.activeTradeRuns.forEach(tradeRun => {
            if (tradeRun.status === 'active' && currentTime >= tradeRun.endTime) {
                // Trade run completed successfully
                tradeRun.status = 'completed';
                completedRuns.push(tradeRun);
                
                // Give reward to player
                this.scene.playerShip.gold += tradeRun.reward;
                
                // Return ship to owned ships list
                const shipKey = Object.keys(this.shipTypes).find(key => 
                    this.shipTypes[key].name === tradeRun.shipType.name
                );
                
                if (shipKey && !this.scene.playerShip.ownedShips.includes(shipKey)) {
                    this.scene.playerShip.ownedShips.push(shipKey);
                    console.log(`${tradeRun.shipType.name} returned to fleet`);
                }
                
                console.log(`Trade run completed! ${tradeRun.shipType.name} returned with ${tradeRun.reward} gold!`);
                
                // Show completion notification
                this.showTradeRunNotification(tradeRun, 'completed');
            }
        });

        // Remove completed runs from active list
        this.activeTradeRuns = this.activeTradeRuns.filter(run => run.status === 'active');
    }

    // Get all active trade runs
    getActiveTradeRuns() {
        return this.activeTradeRuns.filter(run => run.status === 'active');
    }

    // Get time remaining for a trade run
    getTimeRemaining(tradeRun) {
        const currentTime = Date.now();
        const remaining = Math.max(0, tradeRun.endTime - currentTime);
        return remaining;
    }

    // Format time remaining as readable string
    formatTimeRemaining(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    }

    // Show trade run notification
    showTradeRunNotification(tradeRun, type) {
        const { width, height } = this.scene.cameras.main;
        let message;
        let color;
        let duration;

        switch (type) {
            case 'started':
                message = `${tradeRun.shipType.name} sent on trade run!\nReturns in 7 minutes with ${tradeRun.reward} gold!`;
                color = '#00FF00'; // Green
                duration = 3000;
                break;
            case 'completed':
                message = `${tradeRun.shipType.name} returned from trade run!\nEarned ${tradeRun.reward} gold!`;
                color = '#FFD700'; // Gold
                duration = 5000;
                break;
            default:
                return;
        }

        // Create notification text
        const notification = this.scene.add.text(width / 2, height / 4, message, {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: color,
            backgroundColor: '#000000',
            padding: { x: 20, y: 15 },
            align: 'center',
            stroke: '#FFFFFF',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(1000);

        // Animate notification
        notification.setAlpha(0);
        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        // Remove notification after duration
        this.scene.time.delayedCall(duration, () => {
            this.scene.tweens.add({
                targets: notification,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    notification.destroy();
                }
            });
        });
    }

    // Get available ships for trade runs
    getAvailableShipsForTrade() {
        const availableShips = [];
        const ownedShips = this.scene.playerShip.ownedShips;
        
        // Don't allow sending the current ship on trade run
        // Compare with ship key (uppercase) not name (lowercase)
        const currentShipKey = Object.keys(this.shipTypes).find(key => 
            this.shipTypes[key].name === this.scene.playerShip.shipType.name
        );
        
        ownedShips.forEach(shipKey => {
            if (shipKey !== currentShipKey) {
                const shipType = this.shipTypes[shipKey];
                
                if (shipType) {
                    const shipInfo = {
                        name: shipType.name,
                        displayName: shipType.displayName || shipType.name,
                        cargoMax: shipType.cargoMax,
                        cost: shipType.cargoMax,
                        reward: shipType.cargoMax * this.tradeRunMultiplier,
                        image: shipType.image
                    };
                    availableShips.push(shipInfo);
                }
            }
        });

        return availableShips;
    }

    // Reset all trade runs (useful for game restart)
    reset() {
        this.activeTradeRuns = [];
        console.log('Trade run system reset');
    }
}
