import { SHIP_TYPES } from '../constants/shipTypes.js';

export class ShipModificationSystem {
    constructor(scene) {
        this.scene = scene;
        this.modificationMenuActive = false;
        this.selectedShipId = null;
        this.selectedShip = null;
        
        // UI elements
        this.modificationBackground = null;
        this.modificationTitle = null;
        this.shipInfoText = null;
        this.upgradeOptions = [];
        this.selectedUpgrade = 0;
        
        // Keyboard input - will be initialized when menu opens
        this.keys = null;
        this.menuInitialized = false; // Track if menu is properly initialized
        
        // Upgrade costs and values
        this.upgradeConfig = {
            health: { cost: 50, value: 10, name: 'Health', description: '+10 max health' },
            crew: { cost: 30, value: 5, name: 'Crew', description: '+5 max crew' },
            cargo: { cost: 40, value: 50, name: 'Cargo', description: '+50 cargo capacity' },
            sails: { cost: 60, value: 10, name: 'Sails & Speed', description: '+10 speed and sail integrity' },
            rowing: { cost: 80, value: 20, name: 'Rowing', description: '+20 rowing power (galleys only)' }
        };
        
        // Maximum upgrade level for each upgrade type
        this.maxUpgradeLevel = 5;
        
        // Track upgrades applied to each ship
        this.shipUpgrades = {};
    }
    
    openModificationMenu(shipId) {
        if (this.modificationMenuActive) {
            this.closeModificationMenu();
        }
        
        if (!shipId) {
            console.error('Ship ID is null or undefined');
            return;
        }
        
        this.selectedShipId = shipId;
        const namedShip = this.scene.playerShip.getNamedShip(shipId);
        
        if (!namedShip) {
            console.error('Ship not found:', shipId);
            return;
        }
        
        const shipType = SHIP_TYPES[namedShip.shipKey];
        this.selectedShip = {
            ...shipType,
            shipId: shipId,
            shipName: namedShip.shipName,
            shipKey: namedShip.shipKey
        };
        
        // Initialize upgrades for this ship if not already done
        if (!this.shipUpgrades[shipId]) {
            this.shipUpgrades[shipId] = {
                health: 0,
                crew: 0,
                cargo: 0,
                sails: 0,
                rowing: 0
            };
        }
        
        this.modificationMenuActive = true;
        this.menuInitialized = false; // Reset initialization flag
        
        // Initialize keyboard input
        this.keys = {
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
            escape: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };
        
        // Only set as initialized if keys were created successfully
        if (this.keys && this.keys.up && this.keys.down && this.keys.enter && this.keys.escape) {
            this.menuInitialized = true;
            console.log('ShipModificationSystem menu initialized successfully');
        } else {
            console.error('Failed to initialize keyboard keys');
            this.closeModificationMenu();
            return;
        }
        
        this.createModificationUI();
    }
    
    closeModificationMenu() {
        this.modificationMenuActive = false;
        this.menuInitialized = false; // Reset initialization flag
        this.selectedShipId = null;
        this.selectedShip = null;
        
        // Clean up keyboard input
        if (this.keys) {
            try {
                Object.values(this.keys).forEach(key => {
                    if (key && key.destroy) {
                        key.destroy();
                    }
                });
            } catch (error) {
                console.error('Error cleaning up keyboard keys:', error);
            }
            this.keys = null;
        }
        
        // Clean up UI elements
        if (this.modificationBackground) {
            this.modificationBackground.destroy();
            this.modificationBackground = null;
        }
        if (this.modificationTitle) {
            this.modificationTitle.destroy();
            this.modificationTitle = null;
        }
        if (this.shipInfoText) {
            this.shipInfoText.destroy();
            this.shipInfoText = null;
        }
        if (this.instructionsText) {
            this.instructionsText.destroy();
            this.instructionsText = null;
        }
        
        if (this.upgradeOptions && this.upgradeOptions.length > 0) {
            this.upgradeOptions.forEach(option => {
                if (option.text) option.text.destroy();
                if (option.costText) option.costText.destroy();
                if (option.background) option.background.destroy();
            });
            this.upgradeOptions = [];
        }
        
        this.selectedUpgrade = 0;
    }
    
    createModificationUI() {
        if (!this.selectedShip) {
            console.error('No ship selected for modification UI');
            this.closeModificationMenu();
            return;
        }
        
        const { width, height } = this.scene.cameras.main;
        
        // Background
        this.modificationBackground = this.scene.add.rectangle(
            width / 2, height / 2, 1000, 800, 0x1a1a1a, 0.95
        );
        this.modificationBackground.setScrollFactor(0);
        this.modificationBackground.setDepth(1100); // Higher than inventory
        
        // Title
        this.modificationTitle = this.scene.add.text(
            width / 2, height / 2 - 250,
            `Ship Modification - ${this.selectedShip.shipName}`,
            { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        this.modificationTitle.setScrollFactor(0);
        this.modificationTitle.setDepth(1101); // Higher than inventory
        
        // Create ship info and upgrade options
        this.createShipInfo();
        this.createUpgradeOptions();
        
        // Instructions
        const instructions = this.scene.add.text(
            width / 2, height / 2 + 250,
            'Use UP/DOWN arrows to select, ENTER to purchase, ESC to close',
            { fontSize: '20px', fill: '#ffff00' }
        ).setOrigin(0.5);
        instructions.setScrollFactor(0);
        instructions.setDepth(1101); // Higher than inventory
        
        // Store instructions for cleanup
        this.instructionsText = instructions;
    }
    
    updateUpgradeSelection() {
        this.upgradeOptions.forEach((option, index) => {
            if (index === this.selectedUpgrade) {
                option.background.setStrokeStyle(3, 0x00ff00);
                option.text.setStyle({ fill: '#00ff00' });
            } else {
                option.background.setStrokeStyle(2, 0x444444);
                option.text.setStyle({ fill: '#ffffff' });
            }
        });
    }
    
    handleInput() {
        if (!this.modificationMenuActive || !this.menuInitialized) {
            return;
        }
        
        try {
            // Double-check keys exist before using them
            if (!this.keys || !this.keys.escape) {
                console.warn('Keys not available, closing menu');
                this.closeModificationMenu();
                return;
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.keys.up)) {
                this.selectedUpgrade = Math.max(0, this.selectedUpgrade - 1);
                this.updateUpgradeSelection();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.keys.down)) {
                this.selectedUpgrade = Math.min(this.upgradeOptions.length - 1, this.selectedUpgrade + 1);
                this.updateUpgradeSelection();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
                this.purchaseUpgrade();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.keys.escape)) {
                this.closeModificationMenu();
            }
        } catch (error) {
            console.error('Error in ShipModificationSystem.handleInput:', error);
            this.closeModificationMenu();
        }
    }
    
    purchaseUpgrade() {
        if (this.selectedUpgrade >= this.upgradeOptions.length) return;
        
        const option = this.upgradeOptions[this.selectedUpgrade];
        const config = this.upgradeConfig[option.key];
        const currentGold = this.scene.playerShip.gold;
        const currentLevel = this.shipUpgrades[this.selectedShipId][option.key];
        
        // Check if upgrade is already at max level
        if (currentLevel >= this.maxUpgradeLevel) {
            this.showMessage(`${config.name} is already at maximum level!`);
            return;
        }
        
        if (currentGold < config.cost) {
            this.showMessage('Not enough gold!');
            return;
        }
        
        // Deduct gold
        this.scene.playerShip.gold -= config.cost;
        
        // Apply upgrade
        this.shipUpgrades[this.selectedShipId][option.key]++;
        
        // Apply the upgrade to the actual ship if it's the current player ship
        console.log('Checking if upgrade should be applied to current ship:');
        console.log('Current player ship type:', this.scene.playerSystem?.playerShip?.shipType?.name);
        console.log('Selected ship key:', this.selectedShip.shipKey);
        console.log('Selected ship name:', this.selectedShip.name);
        
        if (this.scene.playerSystem?.playerShip && 
            (this.scene.playerSystem.playerShip.shipType.name === this.selectedShip.shipKey ||
             this.scene.playerSystem.playerShip.shipType.name === this.selectedShip.name)) {
            console.log('Applying upgrade to current ship');
            this.applyUpgradeToCurrentShip(option.key, config.value);
        } else {
            console.log('Not applying upgrade - different ship');
        }
        
        this.showMessage(`${config.name} upgraded!`);
        
        // Refresh the UI instead of closing and reopening
        this.refreshModificationUI();
    }
    
    refreshModificationUI() {
        // Clean up existing UI elements
        if (this.shipInfoText) {
            this.shipInfoText.destroy();
            this.shipInfoText = null;
        }
        
        this.upgradeOptions.forEach(option => {
            if (option.text) option.text.destroy();
            if (option.costText) option.costText.destroy();
            if (option.background) option.background.destroy();
        });
        this.upgradeOptions = [];
        
        // Recreate the UI with updated stats
        this.createShipInfo();
        this.createUpgradeOptions();
    }
    
    createShipInfo() {
        const { width, height } = this.scene.cameras.main;
        
        // Ship info
        const upgrades = this.shipUpgrades[this.selectedShipId];
        this.shipInfoText = this.scene.add.text(
            width / 2, height / 2 - 200,
            `Type: ${this.selectedShip.name}\n` +
            `Gold: ${this.scene.playerShip.gold}\n` +
            `Current Stats:\n` +
            `  Health: ${this.selectedShip.maxHealth + upgrades.health * this.upgradeConfig.health.value}\n` +
            `  Crew: ${this.selectedShip.crewMax + upgrades.crew * this.upgradeConfig.crew.value}\n` +
            `  Cargo: ${this.selectedShip.cargoMax + upgrades.cargo * this.upgradeConfig.cargo.value}\n` +
            `  Speed: ${this.selectedShip.speed + upgrades.sails * this.upgradeConfig.sails.value}\n` +
            `  Rowing: ${this.selectedShip.rowing + upgrades.rowing * this.upgradeConfig.rowing.value}`,
            { fontSize: '14px', fill: '#cccccc' }
        ).setOrigin(0.5);
        this.shipInfoText.setScrollFactor(0);
        this.shipInfoText.setDepth(1101); // Higher than inventory
    }
    
    createUpgradeOptions() {
        const { width, height } = this.scene.cameras.main;
        const upgrades = this.shipUpgrades[this.selectedShipId];
        
        // Create upgrade options
        const upgradeKeys = Object.keys(this.upgradeConfig);
        upgradeKeys.forEach((key, index) => {
            const config = this.upgradeConfig[key];
            const y = height / 2 - 50 + (index * 80);
            
            // Skip rowing for non-galley ships
            if (key === 'rowing' && this.selectedShip.isGalley !== 1) {
                return;
            }
            
            // Background for option
            const background = this.scene.add.rectangle(
                width / 2, y, 700, 60, 0x2a2a2a, 0.8
            );
            background.setScrollFactor(0);
            background.setDepth(1100); // Higher than inventory
            background.setStrokeStyle(2, 0x444444);
            
            // Option text
            const isMaxLevel = upgrades[key] >= this.maxUpgradeLevel;
            const levelText = isMaxLevel ? `MAX LEVEL` : `Current level: ${upgrades[key]} | Cost: ${config.cost} gold`;
            const textColor = isMaxLevel ? '#888888' : '#ffffff';
            
            const text = this.scene.add.text(
                width / 2 - 300, y - 20,
                `${config.name}: ${config.description}\n` +
                levelText,
                { fontSize: '16px', fill: textColor }
            );
            text.setScrollFactor(0);
            text.setDepth(1101); // Higher than inventory
            
            this.upgradeOptions.push({
                key: key,
                text: text,
                background: background,
                costText: null,
                y: y
            });
        });
        
        // Update selection display
        this.updateUpgradeSelection();
    }
    
    applyUpgradeToCurrentShip(upgradeType, value) {
        const ship = this.scene.playerSystem.playerShip;
        
        console.log('Applying upgrade to current ship:');
        console.log('Upgrade type:', upgradeType);
        console.log('Upgrade value:', value);
        console.log('Ship before upgrade:', {
            maxHealth: ship.maxHealth,
            health: ship.health,
            crewMax: ship.crewMax,
            crew: ship.crew,
            cargoMax: ship.cargoMax,
            speed: ship.speed,
            rowing: ship.rowing
        });
        
        switch (upgradeType) {
            case 'health':
                ship.maxHealth += value;
                ship.health += value; // Also heal the ship
                console.log(`Health upgraded: +${value} (new max: ${ship.maxHealth}, current: ${ship.health})`);
                break;
            case 'crew':
                ship.crewMax += value;
                ship.maxCrewHealth += value * 10;
                ship.crewHealth += value * 10;
                console.log(`Crew upgraded: +${value} (new max: ${ship.crewMax}, current: ${ship.crew})`);
                break;
            case 'cargo':
                ship.cargoMax += value;
                console.log(`Cargo upgraded: +${value} (new max: ${ship.cargoMax})`);
                break;
            case 'sails':
                ship.speed += value;
                ship.maxSailIntegrity += value;
                ship.sailIntegrity += value;
                console.log(`Sails upgraded: +${value} speed (new speed: ${ship.speed})`);
                break;
            case 'rowing':
                if (ship.isGalley === 1) {
                    ship.rowing += value;
                    console.log(`Rowing upgraded: +${value} (new rowing: ${ship.rowing})`);
                } else {
                    console.log('Rowing upgrade skipped - not a galley');
                }
                break;
        }
        
        console.log('Ship after upgrade:', {
            maxHealth: ship.maxHealth,
            health: ship.health,
            crewMax: ship.crewMax,
            crew: ship.crew,
            cargoMax: ship.cargoMax,
            speed: ship.speed,
            rowing: ship.rowing
        });
    }
    
    showMessage(message) {
        const { width, height } = this.scene.cameras.main;
        
        const messageText = this.scene.add.text(
            width / 2, height / 2 + 250,
            message,
            { fontSize: '18px', fill: '#00ff00', backgroundColor: '#000000', padding: 10 }
        ).setOrigin(0.5);
        messageText.setScrollFactor(0);
        messageText.setDepth(1102); // Higher than everything else
        
        // Remove message after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            messageText.destroy();
        });
    }
    
    getShipUpgrades(shipId) {
        return this.shipUpgrades[shipId] || {
            health: 0,
            crew: 0,
            cargo: 0,
            sails: 0,
            rowing: 0
        };
    }
    
    applyUpgradesToShip(ship, shipId) {
        const upgrades = this.getShipUpgrades(shipId);
        
        ship.maxHealth += upgrades.health * this.upgradeConfig.health.value;
        ship.health += upgrades.health * this.upgradeConfig.health.value;
        
        ship.crewMax += upgrades.crew * this.upgradeConfig.crew.value;
        ship.crew += upgrades.crew * this.upgradeConfig.crew.value;
        ship.maxCrewHealth += upgrades.crew * this.upgradeConfig.crew.value * 10;
        ship.crewHealth += upgrades.crew * this.upgradeConfig.crew.value * 10;
        
        ship.cargoMax += upgrades.cargo * this.upgradeConfig.cargo.value;
        
        ship.speed += upgrades.sails * this.upgradeConfig.sails.value;
        ship.maxSailIntegrity += upgrades.sails * this.upgradeConfig.sails.value;
        ship.sailIntegrity += upgrades.sails * this.upgradeConfig.sails.value;
        
        if (ship.isGalley === 1) {
            ship.rowing += upgrades.rowing * this.upgradeConfig.rowing.value;
        }
    }
}
