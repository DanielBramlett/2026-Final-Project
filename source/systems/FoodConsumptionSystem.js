export default class FoodConsumptionSystem {
    constructor(scene, playerShip) {
        this.scene = scene;
        this.playerShip = playerShip;
        
        // Timer configuration
        this.consumptionInterval = 60000; // 1 minute in milliseconds
        this.lastConsumptionTime = Date.now();
        
        // Food consumption tracking
        this.isPaused = false;
        
        console.log('FoodConsumptionSystem initialized');
    }
    
    update(time, delta) {
        // Don't consume food if paused or player has no crew
        if (this.isPaused || !this.playerShip || this.playerShip.crew <= 0) {
            return;
        }
        
        const currentTime = Date.now();
        const timeSinceLastConsumption = currentTime - this.lastConsumptionTime;
        
        // Check if it's time to consume food
        if (timeSinceLastConsumption >= this.consumptionInterval) {
            this.consumeFood();
            this.lastConsumptionTime = currentTime;
        }
    }
    
    consumeFood() {
        if (!this.playerShip || this.playerShip.crew <= 0) {
            return;
        }
        
        // Calculate food consumption: 1 food unit per (crew/10) per minute
        const consumptionRate = Math.max(1, Math.floor(this.playerShip.crew / 10));
        const currentFood = this.playerShip.tradeGoods.food || 0;
        
        console.log(`Food consumption check: ${currentFood} food available, crew: ${this.playerShip.crew}, consumption rate: ${consumptionRate}/minute`);
        
        if (currentFood >= consumptionRate) {
            // Consume the food
            this.playerShip.tradeGoods.food = currentFood - consumptionRate;
            console.log(`Consumed ${consumptionRate} food units. Remaining: ${this.playerShip.tradeGoods.food}`);
        } else {
            // Not enough food - consume what's available
            const consumed = currentFood;
            this.playerShip.tradeGoods.food = 0;
            console.log(`Insufficient food! Consumed remaining ${consumed} units. Food depleted!`);
            
            // Apply crew penalties for starvation
            this.applyStarvationPenalties();
        }
        
        // Update cargo count
        this.playerShip.cargo = this.playerShip.getCurrentCargo();
    }
    
    applyStarvationPenalties() {
        // When food runs out, crew starts to suffer
        const crewLoss = Math.max(1, Math.floor(this.playerShip.crew * 0.1)); // Lose 10% of crew
        this.playerShip.crew = Math.max(0, this.playerShip.crew - crewLoss);
        this.playerShip.crewHealth = Math.max(0, this.playerShip.crewHealth - crewLoss);
        
        console.log(`Starvation penalties applied! Lost ${crewLoss} crew members. Remaining crew: ${this.playerShip.crew}`);
        
        // Check if ship is lost due to crew depletion
        if (this.playerShip.crew <= 0) {
            console.log('All crew lost to starvation! Ship is lost!');
            this.playerShip.destroyShip();
        }
    }
    
    calculateSailingDays() {
        if (!this.playerShip || this.playerShip.crew <= 0) {
            return 0;
        }
        
        const food = this.playerShip.tradeGoods.food || 0;
        const crew = this.playerShip.crew;
        
        // Formula: days = Food / (Crew / 10)
        const dailyConsumption = crew / 10;
        const days = food / dailyConsumption;
        
        return Math.max(0, days);
    }
    
    getSailingDaysDisplay() {
        const days = this.calculateSailingDays();
        
        if (days <= 0) {
            return 'No food!';
        } else if (days < 1) {
            const hours = Math.floor(days * 24);
            return `${hours}h`;
        } else if (days < 30) {
            return `${days.toFixed(1)}d`;
        } else {
            const months = Math.floor(days / 30);
            const remainingDays = Math.floor(days % 30);
            return `${months}m ${remainingDays}d`;
        }
    }
    
    pause() {
        this.isPaused = true;
        console.log('Food consumption paused');
    }
    
    resume() {
        this.isPaused = false;
        this.lastConsumptionTime = Date.now(); // Reset timer to avoid immediate consumption
        console.log('Food consumption resumed');
    }
    
    addFood(amount) {
        if (!this.playerShip) return;
        
        this.playerShip.tradeGoods.food = (this.playerShip.tradeGoods.food || 0) + amount;
        this.playerShip.cargo = this.playerShip.getCurrentCargo();
        console.log(`Added ${amount} food units. Total food: ${this.playerShip.tradeGoods.food}`);
    }
    
    getFoodStatus() {
        const days = this.calculateSailingDays();
        const food = this.playerShip.tradeGoods.food || 0;
        const crew = this.playerShip.crew || 0;
        const dailyConsumption = crew / 10;
        
        return {
            food,
            crew,
            dailyConsumption,
            sailingDays: days,
            displayText: this.getSailingDaysDisplay()
        };
    }
    
    updatePlayerShip(newPlayerShip) {
        this.playerShip = newPlayerShip;
        console.log('FoodConsumptionSystem updated with new player ship reference');
    }
    
    destroy() {
        this.scene = null;
        this.playerShip = null;
        console.log('FoodConsumptionSystem destroyed');
    }
}
