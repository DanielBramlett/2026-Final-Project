export default class StatsUI {
    constructor(scene, playerShip) {
        this.scene = scene;
        this.playerShip = playerShip;
        this.uiElements = {};
        
        this.createUI();
    }

    createUI() {
        const padding = 20;
        const startX = this.scene.cameras.main.width - padding - 200; // Top right
        const startY = padding;
        const lineHeight = 25;

        // Create background panel
        this.uiElements.background = this.scene.add.rectangle(
            startX + 100,
            startY + 40,
            300,
            350,
            0x000000,
            0.8
        );
        this.uiElements.background.setScrollFactor(0);
        this.uiElements.background.setDepth(1000);

        // Create title text
        this.uiElements.title = this.scene.add.text(
            startX + 100,
            startY + 10,
            'SHIP STATUS',
            {
                fontSize: '30px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            }
        );
        this.uiElements.title.setScrollFactor(0);
        this.uiElements.title.setDepth(1001);
        this.uiElements.title.setOrigin(0.5, 0.5);

        // Create stat text elements
        this.uiElements.crewText = this.scene.add.text(
            startX - 10,
            startY + 35,
            '',
            {
                fontSize: '24px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }
        );
        this.uiElements.crewText.setScrollFactor(0);
        this.uiElements.crewText.setDepth(1001);

        this.uiElements.healthText = this.scene.add.text(
            startX - 30,
            startY + 35 + lineHeight,
            '',
            {
                fontSize: '24px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }
        );
        this.uiElements.healthText.setScrollFactor(0);
        this.uiElements.healthText.setDepth(1001);

        this.uiElements.sailsText = this.scene.add.text(
            startX - 10,
            startY + 35 + lineHeight * 2,
            '',
            {
                fontSize: '24px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }
        );
        this.uiElements.sailsText.setScrollFactor(0);
        this.uiElements.sailsText.setDepth(1001);

        this.uiElements.foodText = this.scene.add.text(
            startX - 10,
            startY + 35 + lineHeight * 3,
            '',
            {
                fontSize: '24px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }
        );
        this.uiElements.foodText.setScrollFactor(0);
        this.uiElements.foodText.setDepth(1001);

        // Update initial display
        this.update();
    }

    update() {
        // Update crew text
        const crewRatio = this.playerShip.crew / this.playerShip.crewMax;
        const crewColor = crewRatio > 0.5 ? '#fff' : crewRatio > 0.25 ? '#ffff00' : '#ff0000';
        this.uiElements.crewText.setText(`Crew: ${this.playerShip.crew}/${this.playerShip.crewMax}`);
        this.uiElements.crewText.setStyle({ fill: crewColor });

        // Update health text
        const healthRatio = this.playerShip.health / this.playerShip.maxHealth;
        const healthColor = healthRatio > 0.5 ? '#fff' : healthRatio > 0.25 ? '#ffff00' : '#ff0000';
        this.uiElements.healthText.setText(`Health: ${this.playerShip.health}/${this.playerShip.maxHealth}`);
        this.uiElements.healthText.setStyle({ fill: healthColor });

        // Update sails text
        const sailsRatio = this.playerShip.sailIntegrity / this.playerShip.maxSailIntegrity;
        const sailsColor = sailsRatio > 0.5 ? '#fff' : sailsRatio > 0.25 ? '#ffff00' : '#ff0000';
        this.uiElements.sailsText.setText(`Sails: ${this.playerShip.sailIntegrity}/${this.playerShip.maxSailIntegrity}`);
        this.uiElements.sailsText.setStyle({ fill: sailsColor });

        // Update food/sailing days text
        const food = this.playerShip.tradeGoods.food || 0;
        const crew = this.playerShip.crew || 0;
        const dailyConsumption = crew / 10;
        const sailingDays = dailyConsumption > 0 ? food / dailyConsumption : 0;
        
        let foodDisplayText;
        let foodColor;
        
        if (sailingDays <= 0) {
            foodDisplayText = 'Food: No food!';
            foodColor = '#ff0000';
        } else if (sailingDays < 1) {
            const hours = Math.floor(sailingDays * 24);
            foodDisplayText = `Food: ${hours}h left`;
            foodColor = '#ff0000';
        } else if (sailingDays < 7) {
            foodDisplayText = `Food: ${sailingDays.toFixed(1)}d left`;
            foodColor = '#ffff00';
        } else {
            foodDisplayText = `Food: ${Math.floor(sailingDays)}d left`;
            foodColor = '#fff';
        }
        
        this.uiElements.foodText.setText(foodDisplayText);
        this.uiElements.foodText.setStyle({ fill: foodColor });
    }

    destroy() {
        Object.values(this.uiElements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
    }
}
