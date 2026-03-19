import { Obstacle } from './Obstacle.js';
import { SHIP_TYPES } from '../constants/shipTypes.js';

export class Port extends Obstacle {
    constructor(scene, x, y, width, height, textureKey, portName = 'Port', region = 'general') {
        super(scene, x, y, width, height, textureKey);
        
        this.portName = portName;
        this.region = region;
        this.playerInContact = false;
        this.contactPopup = null;
        this.menuActive = false;
        this.menuOptions = [];
        this.selectedOption = 0;
        
        // Debug mode state
        this.debugMode = false;
        this.debugKeyG = null;
        this.debugKeyJ = null;
        
        // Dynamic pricing system
        this.baseGoods = [
            { id: 'food', name: 'Food', type: 'supplies', basePrice: 5, description: 'Essential supplies for your crew' },
            { id: 'cannonballs', name: 'Cannonballs', type: 'supplies', basePrice: 10, description: 'Ammunition for your cannons used on hulls' },
            { id: 'chainshot', name: 'Chainshot', type: 'supplies', basePrice: 10, description: 'Ammunition for your cannons used on sails and crew' },
            { id: 'grapeshot', name: 'Grapeshot', type: 'supplies', basePrice: 10, description: 'Ammunition for your cannons used on crew' },
            { id: 'wood', name: 'Wood', type: 'supplies', basePrice: 5, description: 'Used to build and repair ships.'},
            { id: 'rum', name: 'Rum', type: 'drink', basePrice: 20, description: 'Morale booster made from sugercane' },
            { id: 'suger', name: 'Suger', type: 'seasoning', basePrice: 15, description: 'Often used to sweet food or make rum.' },
            { id: 'iron', name: 'Iron', type: 'metal', basePrice: 30, description: 'Used to make cannons and ammo.' },
            { id: 'bronze', name: 'Bronze', type: 'metal', basePrice: 25, description: 'Alloy used to make cannons,' },
            { id: 'copper', name: 'Copper', type: 'metal', basePrice: 20, description: 'Used to make bronze.' },
            { id: 'gold_bar', name: 'Gold Bar', type: 'valuble metal', basePrice: 100, description: 'Valuable trade good.' },
            { id: 'coal', name: 'Coal', type: 'fuel', basePrice: 10, description: 'Used as fuel for steamships.' },
            { id: 'salt', name: 'Salt', type: 'seasoning', basePrice: 8, description: 'Preservative and trade good.'},
            { id: 'fish', name: 'Fish', type: 'food', basePrice: 5, description: 'Fresh fish from the sea.'},
            { id: 'lanterns', name: 'Lanterns', type: 'craft', basePrice: 8, description: 'Light source for ships at night.' },
            { id: 'wine', name: 'Wine', type: 'drink', basePrice: 25, description: 'Fine wine for trade.' },
            { id: 'tea', name: 'Tea', type: 'exotic drink', basePrice: 12, description: 'Valuable trade good from the East.' },
            { id: 'pepper', name: 'Pepper', type: 'spice', basePrice: 18, description: 'Exotic spices from India. ' },
            { id: 'silk', name: 'Silk', type: 'silk', basePrice: 30, description: 'Luxurious fabric from the East.' },
            { id: 'cocoa', name: 'Cocoa', type: 'seasoning', basePrice: 15, description: 'Valuable trade good from the Americas.'},
            { id: 'oil', name: 'Oil', type: 'oil', basePrice: 10, description: 'Used in lamps and to burn enemy ships' },
            { id: 'cannons', name: 'Cannons', type: 'firearm', basePrice: 50, description: 'Weapons for battle.' },
            { id: 'bacon', name: 'Bacon', type: 'food', basePrice: 10, description: 'Preserved meat for sailors.' },
            { id: 'candles', name: 'Candles', type: 'craft', basePrice: 5, description: 'Light source for ships at night.' },
            { id: 'cutlass', name: 'Cutlass', type: 'coldarm', basePrice: 25, description: 'Used for close combat.' },
            { id: 'saber', name: 'Saber', type: 'coldarm', basePrice: 30, description: 'Used for close combat' },
            { id: 'flintlock_pistol', name: 'Flintlock Pistol', type: 'firearm', basePrice: 25, description: 'Common weapon for boarding' },
            { id: 'flintlock_musket', name: 'Flintlock Musket', type: 'firearm', basePrice: 35, description: 'Long-range weapon for naval battles' },
            { id: 'blunderbuss', name: 'Blunderbuss', type: 'firearm', basePrice: 30, description: 'Close-range weapon for boarding' },
            { id: 'crossbow', name: 'Crossbow', type: 'weapon', basePrice: 20, description: 'long-range weapon using arrows'},
            { id: 'arrows', name: 'Arrows', type: 'weapon', basePrice: 5, description: 'Ammunition for crossbows and bows'},
            { id: 'steel', name: 'Steel', type: 'metal', basePrice: 25, description: 'Made using iron'},
            // Additional goods for regional specialties
            { id: 'tobacco', name: 'Tobacco', type: 'crop', basePrice: 12, description: 'Valuable cash crop from the Americas' },
            { id: 'silver', name: 'Silver', type: 'valuble metal', basePrice: 75, description: 'Precious metal for trade' },
            { id: 'gems', name: 'Gems', type: 'valuble metal', basePrice: 150, description: 'Rare and valuable gemstones' },
            { id: 'cotton', name: 'Cotton', type: 'crop', basePrice: 8, description: 'Soft fiber for textiles' },
            { id: 'indigo', name: 'Indigo', type: 'crop', basePrice: 20, description: 'Valuable blue dye' },
            { id: 'spices', name: 'Spices', type: 'spice', basePrice: 25, description: 'Assorted exotic spices' },
            { id: 'dyes', name: 'Dyes', type: 'craft', basePrice: 15, description: 'Various color dyes for textiles' },
            { id: 'timber', name: 'Timber', type: 'supplies', basePrice: 6, description: 'Quality wood for shipbuilding' },
            { id: 'jade', name: 'Jade', type: 'valuble metal', basePrice: 120, description: 'Precious green stone from the Americas' }
        ];
        
        // Regional specialization for non-supply goods
        this.regionalSpecialties = {
            'caribbean': ['rum', 'suger', 'cocoa', 'tobacco'],
            'bermuda': ['salt', 'fish', 'lanterns'],
            'bahamas': ['rum', 'salt', 'fish'],
            'greater_antilles': ['suger', 'rum', 'tobacco'],
            'leeward_islands': ['spices', 'cotton', 'indigo'],
            'windward_islands': ['spices', 'sugar', 'rum'],
            'south_america': ['gold_bar', 'silver', 'gems', 'cocoa'],
            'central_america': ['cocoa', 'spices', 'tobacco', 'dyes'],
            'florida': ['fish', 'salt', 'timber'],
            'yucatan': ['cocoa', 'spices', 'jade'],
            'lesser_antilles': ['spices', 'rum', 'sugar']
        };
        
        // Initialize current prices with regional variations
        this.currentGoods = this.baseGoods.map(good => {
            let buyPrice, sellPrice, sellPricePercent;
            
            if (good.type === 'supplies') {
                // Supplies have fixed prices everywhere
                buyPrice = good.basePrice;
                sellPricePercent = 0.8; // Fixed 80% of buy price
                sellPrice = Math.round(buyPrice * sellPricePercent);
            } else {
                // Non-supply goods have regional pricing
                const isRegionalSpecialty = this.regionalSpecialties[this.region]?.includes(good.id);
                const priceMultiplier = isRegionalSpecialty ? 0.7 : 1.3; // Cheaper in specialty regions, more expensive elsewhere
                
                buyPrice = Math.round(good.basePrice * priceMultiplier * (0.8 + Math.random() * 0.4)); // Some variation
                sellPricePercent = 0.6 + Math.random() * 0.2; // Random between 0.6 and 0.8
                sellPrice = Math.round(buyPrice * sellPricePercent);
            }
            
            return {
                ...good,
                price: buyPrice,
                sellPrice: sellPrice,
                sellPricePercent: Math.round(sellPricePercent * 100)
            };
        });
        
        // Price update timer (every 60 seconds)
        this.priceUpdateTimer = scene.time.addEvent({
            delay: 60000, // 60 seconds
            loop: true,
            callback: () => this.updatePrices()
        });
        
        // Set up collision detection with player ship using direct contact
        this.contactOverlap = scene.physics.add.overlap(
            scene.playerShip,
            this,
            (player, port) => {
                if (!this.playerInContact) {
                    console.log('Port: Player made direct contact with', this.portName);
                    this.playerInContact = true;
                    this.showContactPopup();
                }
            },
            null,
            this
        );
        
        // Set up exit detection using distance check
        this.exitCheckTimer = scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (this.playerInContact) {
                    const distance = Phaser.Math.Distance.Between(
                        scene.playerShip.x, 
                        scene.playerShip.y, 
                        this.x, 
                        this.y
                    );
                    // Player is out of contact if they're beyond the port bounds plus buffer
                    const maxDimension = Math.max(this.width, this.height);
                    const exitDistance = maxDimension + 100; // Port size + 100px buffer
                    
                    if (distance > exitDistance) {
                        console.log('Port: Player exited contact zone for', this.portName);
                        this.playerInContact = false;
                        this.hideContactPopup();
                        // Don't close menu if player is actively using it
                        // Only close menu if player moves far away (double the normal distance)
                        const farDistance = maxDimension + 300; // Port size + 300px buffer
                        if (distance > farDistance && this.menuActive) {
                            this.hideMenu();
                        }
                    }
                }
            }
        });
        
        // Set up dock key handler
        this.dockKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        
        // Set up debug mode keys
        this.debugKeyG = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
        this.debugKeyJ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    }
    
    updatePrices() {
        this.currentGoods = this.currentGoods.map(good => {
            const baseGood = this.baseGoods.find(bg => bg.id === good.id);
            if (!baseGood) return good;
            
            let newBuyPrice, newSellPrice, newSellPricePercent;
            
            if (good.type === 'supplies') {
                // Supplies maintain fixed prices
                newBuyPrice = baseGood.basePrice;
                newSellPricePercent = 0.8; // Fixed 80% of buy price
                newSellPrice = Math.round(newBuyPrice * newSellPricePercent);
            } else {
                // Non-supply goods have regional pricing with small variations
                const isRegionalSpecialty = this.regionalSpecialties[this.region]?.includes(good.id);
                const priceMultiplier = isRegionalSpecialty ? 0.7 : 1.3;
                
                // Calculate price change: -10% to +10% of current regional price
                const changePercent = -0.1 + Math.random() * 0.2;
                newBuyPrice = Math.round(good.price * (1 + changePercent));
                
                // Ensure price stays within regional bounds
                const minPrice = Math.round(baseGood.basePrice * priceMultiplier * 0.8);
                const maxPrice = Math.round(baseGood.basePrice * priceMultiplier * 1.2);
                newBuyPrice = Math.max(minPrice, Math.min(maxPrice, newBuyPrice));
                
                newSellPricePercent = 0.6 + Math.random() * 0.2;
                newSellPrice = Math.round(newBuyPrice * newSellPricePercent);
            }
            
            return {
                ...good,
                price: newBuyPrice,
                sellPrice: newSellPrice,
                sellPricePercent: Math.round(newSellPricePercent * 100)
            };
        });
        
        // Update the trade menu if it's currently open
        if (this.tradeBackground && this.availableGoods && this.statusText && this.goodsContainer) {
            // Additional check to ensure text object is still valid
            if (this.statusText.scene && this.statusText.visible !== false) {
                this.availableGoods = this.currentGoods;
                this.updateGoodsList();
                this.statusText.setText(
                    `Gold: ${this.scene.playerShip.gold} | Cargo: ${this.scene.playerShip.getCurrentCargo()}/${this.scene.playerShip.cargoMax}`
                );
            }
        }
        
        console.log(`[${this.portName}] Prices updated! Region: ${this.region}`);
    }
    
    showContactPopup() {
        if (this.contactPopup) return;
        
        const menuX = this.scene.cameras.main.width / 2;
        const menuY = 150;
        
        this.contactPopup = this.scene.add.container(menuX, menuY);
        
        // Create popup background
        const background = this.scene.add.rectangle(0, 0, 400, 100, 0x000000, 0.9);
        background.setStrokeStyle(2, 0xffffff);
        
        // Create port name text
        const nameText = this.scene.add.text(0, -25, this.portName, {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: 'transparent',
            padding: { x: 10, y: 5 }
        });
        nameText.setOrigin(0.5, 0.5);
        
        // Create instruction text
        const instructionText = this.scene.add.text(0, 15, 'Press C to dock', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: 'transparent',
            padding: { x: 10, y: 5 }
        });
        instructionText.setOrigin(0.5, 0.5);
        
        this.contactPopup.add([background, nameText, instructionText]);
        this.contactPopup.setScrollFactor(0);
        this.contactPopup.setDepth(999);
    }
    
    hideContactPopup() {
        if (this.contactPopup) {
            this.contactPopup.destroy();
            this.contactPopup = null;
        }
    }
    
    showMenu() {
        if (this.menuActive) return;
        
        this.menuActive = true;
        this.selectedOption = 0;
        
        // Create menu background
        const menuX = this.scene.cameras.main.width / 2;
        const menuY = this.scene.cameras.main.height / 2;
        
        this.menuBackground = this.scene.add.rectangle(
            menuX, menuY, 750, 700, 0x000000, 0.8
        );
        this.menuBackground.setScrollFactor(0);
        this.menuBackground.setDepth(1000);
        
        // Create menu title
        this.menuTitle = this.scene.add.text(
            menuX, menuY - 100, 'Port Menu', {
                fontSize: '60px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        this.menuTitle.setScrollFactor(0);
        this.menuTitle.setDepth(1001);
        this.menuTitle.setOrigin(0.5, 0.5);
        
        // Create menu options
        this.menuOptions = [
            this.scene.add.text(
                menuX, menuY - 40, 'Trade Goods', {
                    fontSize: '30px',
                    fill: this.selectedOption === 0 ? '#ffff00' : '#fff',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                }
            ),
            this.scene.add.text(
                menuX, menuY + 10, 'Sell Goods', {
                    fontSize: '30px',
                    fill: this.selectedOption === 1 ? '#ffff00' : '#fff',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                }
            ),
            this.scene.add.text(
                menuX, menuY + 60, 'Buy Ships', {
                    fontSize: '30px',
                    fill: this.selectedOption === 2 ? '#ffff00' : '#fff',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                }
            ),
            this.scene.add.text(
                menuX, menuY + 110, 'Ship Inventory', {
                    fontSize: '30px',
                    fill: this.selectedOption === 3 ? '#ffff00' : '#fff',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                }
            )
        ];
        
        this.menuOptions.forEach(option => {
            option.setScrollFactor(0);
            option.setDepth(1001);
            option.setOrigin(0.5, 0.5);
        });
        
        // Create instructions
        this.menuInstructions = this.scene.add.text(
            menuX, menuY + 165, 'Use UP/DOWN to select', {
                fontSize: '30px',
                fill: '#ccc',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        this.menuInstructions.setScrollFactor(0);
        this.menuInstructions.setDepth(1001);
        this.menuInstructions.setOrigin(0.5, 0.5);
        
        // Create second instruction line
        this.menuInstructions2 = this.scene.add.text(
            menuX, menuY + 200, 'ENTER to confirm, ESC to close', {
                fontSize: '28px',
                fill: '#ccc',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        this.menuInstructions2.setScrollFactor(0);
        this.menuInstructions2.setDepth(1001);
        this.menuInstructions2.setOrigin(0.5, 0.5);
        
        // Set up menu input handlers
        this.setupMenuInput();
    }
    
    hideMenu() {
        if (!this.menuActive) return;
        
        this.menuActive = false;
        this.menuDestroying = true; // Flag to prevent updateMenu from running
        
        // Destroy menu elements
        if (this.menuBackground) this.menuBackground.destroy();
        if (this.menuTitle) this.menuTitle.destroy();
        this.menuOptions.forEach(option => option.destroy());
        this.menuOptions = [];
        if (this.menuInstructions) this.menuInstructions.destroy();
        if (this.menuInstructions2) this.menuInstructions2.destroy();
        
        // Remove menu input handlers
        this.removeMenuInput();
        
        // Clear the destroying flag after a short delay
        setTimeout(() => {
            this.menuDestroying = false;
        }, 100);
    }
    
    setupMenuInput() {
        this.menuKeys = {
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
            escape: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };
    }
    
    removeMenuInput() {
        if (this.menuKeys) {
            try {
                Object.values(this.menuKeys).forEach(key => {
                    if (key && key.destroy) {
                        key.destroy();
                    }
                });
            } catch (error) {
                console.log('Error removing menu input:', error);
            }
            this.menuKeys = null;
        }
    }
    
    updateMenu() {
        if (!this.menuActive || this.menuDestroying) return;
        
        try {
            // Handle menu navigation with comprehensive null checks
            if (this.menuKeys && this.menuKeys.up && Phaser.Input.Keyboard.JustDown(this.menuKeys.up)) {
                this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                this.updateMenuSelection();
            }
            
            if (this.menuKeys && this.menuKeys.down && Phaser.Input.Keyboard.JustDown(this.menuKeys.down)) {
                this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                this.updateMenuSelection();
            }
            
            if (this.menuKeys && this.menuKeys.enter && Phaser.Input.Keyboard.JustDown(this.menuKeys.enter)) {
                this.executeMenuOption();
            }
            
            if (this.menuKeys && this.menuKeys.escape && Phaser.Input.Keyboard.JustDown(this.menuKeys.escape)) {
                this.hideMenu();
            }
        } catch (error) {
            console.log('Menu input error:', error);
            // Force clear menu keys if any error occurs
            this.menuKeys = null;
        }
    }
    
    updateMenuSelection() {
        this.menuOptions.forEach((option, index) => {
            option.setFill(index === this.selectedOption ? '#ffff00' : '#fff');
        });
    }
    
    executeMenuOption() {
        switch (this.selectedOption) {
            case 0:
                this.showTradeGoodsMenu();
                break;
            case 1:
                this.showSellGoodsMenu();
                break;
            case 2:
                this.showBuyShipsMenu();
                break;
            case 3:
                this.showShipInventory();
                break;
        }
    }
    
    showBuyShipsMenu() {
        // Hide current menu
        this.hideMenu();
        
        // Create buy ships menu
        const menuX = this.scene.cameras.main.width / 2;
        const menuY = this.scene.cameras.main.height / 2;
        
        const buyBackground = this.scene.add.rectangle(
            menuX, menuY, 750, 700, 0x000000, 0.9
        );
        buyBackground.setScrollFactor(0);
        buyBackground.setDepth(1000);
        this.buyBackground = buyBackground; // Store for cleanup
        
        const buyTitle = this.scene.add.text(
            menuX, menuY - 270, `Buy Ships${this.debugMode ? ' (DEBUG MODE)' : ''}`, {
            fontSize: '60px',
            fill: this.debugMode ? '#ff00ff' : '#fff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }
        );
        buyTitle.setScrollFactor(0);
        buyTitle.setDepth(1001);
        buyTitle.setOrigin(0.5, 0.5);
        this.buyTitle = buyTitle; // Store for cleanup
        
        // Define available ships for purchase (exclude ship w/o models and already owned ships)
        const excludedShips = this.debugMode ? [] : ['HMS_VICTORY', 'ORIENT', 'SANTTÌSIMA_TRINIDAD', 'URCA_DE_LIMA'];
        const playerOwnedShips = this.debugMode ? [] : (this.scene.playerShip.ownedShips || ['SLOOP']); // Default to Sloop if no owned ships
        
        this.availableShips = Object.entries(SHIP_TYPES).filter(([key, ship]) => 
            !excludedShips.includes(key) && !playerOwnedShips.includes(key)
        );
        
        // Add and define ship price
        this.availableShips = this.availableShips.map(([key, ship]) => {
            const basePrice = this.debugMode ? 0 : (ship.size * 2 + ship.cannons * 5 + ship.cargoMax * 2); // Pricing formula (free in debug mode)
            return [key, ship, basePrice];
        });
        
        if (this.availableShips.length === 0) {
            // Show no ships message
            const noShipsText = this.scene.add.text(
                menuX, menuY, 
                'No ships available for purchase!\n\nPress ESC to return to main menu', {
                fontSize: '30px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 15, y: 10 },
                align: 'center'
            }
            );
            noShipsText.setScrollFactor(0);
            noShipsText.setDepth(1001);
            noShipsText.setOrigin(0.5, 0.5);
            
            // Add close handler
            const escapeKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            escapeKey.once('down', () => {
                buyBackground.destroy();
                buyTitle.destroy();
                noShipsText.destroy();
                escapeKey.destroy();
                this.showMenu(); // Return to main menu
            });
            return;
        }
        
        this.selectedBuyShipIndex = 0;
        
        // Create scrollable ship list
        this.buyShipsScrollOffset = 0;
        this.maxBuyShipsScrollOffset = Math.max(0, (this.availableShips.length - 4) * 120);
        
        // Create scrollable container for ships
        this.buyShipsContainer = this.scene.add.container(menuX, menuY - 80);
        this.buyShipsContainer.setScrollFactor(0);
        this.buyShipsContainer.setDepth(1001);
        
        this.updateBuyShipsList();
        
        // Add player status info
        const buyStatusText = this.scene.add.text(
            menuX, menuY - 200, 
            `Gold: ${this.scene.playerShip.gold}`, {
            fontSize: '28px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }
        );
        buyStatusText.setScrollFactor(0);
        buyStatusText.setDepth(1001);
        buyStatusText.setOrigin(0.5, 0.5);
        this.buyStatusText = buyStatusText; // Store for cleanup
        
        // Add instructions
        const buyInstructionText = this.scene.add.text(
            menuX, menuY + 330, 
            `UP/DOWN: Select ship |ENTER: Purchase | ESC: Back${this.debugMode ? ' | FREE SHIPS!' : ''}`, {
            fontSize: '24px',
            fill: this.debugMode ? '#ff00ff' : '#ccc',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            align: 'center'
        }
        );
        buyInstructionText.setScrollFactor(0);
        buyInstructionText.setDepth(1001);
        buyInstructionText.setOrigin(0.5, 0.5);
        this.buyInstructionText = buyInstructionText; // Store for cleanup
        
        // Add purchase result text (initially hidden)
        this.buyResultText = this.scene.add.text(
            menuX, menuY + 345, '', {
            fontSize: '22px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }
        );
        this.buyResultText.setScrollFactor(0);
        this.buyResultText.setDepth(1001);
        this.buyResultText.setOrigin(0.5, 0.5);
        this.buyResultText.setVisible(false);
        
        // Set up buy keys
        this.buyKeys = {
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
            escape: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };
    }
    
    updateBuyShipsList() {
        if (!this.availableShips || this.availableShips.length === 0) {
            return;
        }
        
        // Clear existing ship texts
        this.buyShipsContainer.removeAll(true);
        
        // Create ship entries for visible range
        const startIndex = Math.floor(this.buyShipsScrollOffset / 120);
        const endIndex = Math.min(startIndex + 4, this.availableShips.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const [key, ship, price] = this.availableShips[i];
            const yOffset = (i * 120) - this.buyShipsScrollOffset - 60;
            
            // Determine if this ship is selected
            const isSelected = (i === this.selectedBuyShipIndex);
            const shipColor = isSelected ? '#ffff00' : '#fff';
            const canAfford = this.scene.playerShip.gold >= price;
            const priceColor = canAfford ? '#00ff00' : '#ff0000';
            
            // Ship name and price
            const nameText = this.scene.add.text(0, yOffset, 
                `${ship.name} - ${price === 0 ? 'FREE' : price + ' gold'}`, {
                fontSize: '28px',
                fill: canAfford ? shipColor : '#888888',
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            nameText.setOrigin(0.5, 0.5);
            
            // Ship stats
            const statsText = this.scene.add.text(0, yOffset + 25, 
                `Size: ${ship.size} | Speed: ${ship.speed} | Cannons: ${ship.cannons}`, {
                fontSize: '20px',
                fill: canAfford ? (isSelected ? '#ffff00' : '#ccc') : '#666666',
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            statsText.setOrigin(0.5, 0.5);
            
            // Cargo and crew
            const detailsText = this.scene.add.text(0, yOffset + 50, 
                `Cargo: ${ship.cargoMax} | Crew: ${ship.crewMax}`, {
                fontSize: '20px',
                fill: canAfford ? (isSelected ? '#ffff00' : '#aaa') : '#555555',
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            detailsText.setOrigin(0.5, 0.5);
            
            // Affordability indicator (only for selected item)
            if (isSelected) {
                const affordText = this.scene.add.text(0, yOffset + 75, 
                    this.debugMode ? 'DEBUG MODE - Free!' : (canAfford ? 'Can afford!' : 'Not enough gold!'), {
                    fontSize: '22px',
                    fill: this.debugMode ? '#ff00ff' : priceColor,
                    backgroundColor: 'transparent',
                    padding: { x: 5, y: 2 }
                });
                affordText.setOrigin(0.5, 0.5);
                this.buyShipsContainer.add([nameText, statsText, detailsText, affordText]);
            } else {
                this.buyShipsContainer.add([nameText, statsText, detailsText]);
            }
        }
    }
    
    purchaseShip() {
        if (this.selectedBuyShipIndex >= 0 && this.selectedBuyShipIndex < this.availableShips.length) {
            const [shipKey, ship, price] = this.availableShips[this.selectedBuyShipIndex];
            
            if (!this.debugMode && this.scene.playerShip.gold < price) {
                this.buyResultText.setText('Not enough gold!');
                this.buyResultText.setFill('#ff0000');
                this.buyResultText.setVisible(true);
                
                setTimeout(() => {
                    if (this.buyResultText) {
                        this.buyResultText.setVisible(false);
                    }
                }, 2000);
                return;
            }
            
            // Purchase the ship (deduct gold only if not in debug mode)
            if (!this.debugMode) {
                this.scene.playerShip.gold -= price;
            }
            
            // Add ship to player's owned ships
            if (!this.scene.playerShip.ownedShips) {
                this.scene.playerShip.ownedShips = ['SLOOP'];
            }
            this.scene.playerShip.ownedShips.push(shipKey);
            
            // Show success message
            const purchaseMessage = this.debugMode ? 
                `DEBUG: Acquired ${ship.name} for free!` : 
                `Purchased ${ship.name} for ${price} gold!`;
            this.buyResultText.setText(purchaseMessage);
            this.buyResultText.setFill(this.debugMode ? '#ff00ff' : '#00ff00');
            this.buyResultText.setVisible(true);
            
            // Update status display
            this.buyStatusText.setText(`Gold: ${this.scene.playerShip.gold}`);
            
            // Remove purchased ship from available ships
            this.availableShips.splice(this.selectedBuyShipIndex, 1);
            
            if (this.selectedBuyShipIndex >= this.availableShips.length) {
                this.selectedBuyShipIndex = Math.max(0, this.availableShips.length - 1);
            }
            
            // Update scroll limits
            this.maxBuyShipsScrollOffset = Math.max(0, (this.availableShips.length - 4) * 120);
            if (this.buyShipsScrollOffset > this.maxBuyShipsScrollOffset) {
                this.buyShipsScrollOffset = this.maxBuyShipsScrollOffset;
            }
            
            // Update ships list
            this.updateBuyShipsList();
            
            // Close menu if no more ships available
            if (this.availableShips.length === 0) {
                setTimeout(() => {
                    this.cleanupBuyMenu();
                    this.showMenu();
                }, 2000);
            } else {
                // Hide result after 2 seconds
                setTimeout(() => {
                    if (this.buyResultText) {
                        this.buyResultText.setVisible(false);
                    }
                }, 2000);
            }
        }
    }
    
    cleanupBuyMenu() {
        if (this.buyBackground) this.buyBackground.destroy();
        if (this.buyTitle) this.buyTitle.destroy();
        if (this.buyShipsContainer) this.buyShipsContainer.destroy();
        if (this.buyStatusText) this.buyStatusText.destroy();
        if (this.buyInstructionText) this.buyInstructionText.destroy();
        if (this.buyResultText) this.buyResultText.destroy();
        if (this.buyKeys) {
            Object.values(this.buyKeys).forEach(key => key.destroy());
            this.buyKeys = null;
        }
    }
    
    showTradeGoodsMenu() {
        // Hide current menu
        this.hideMenu();
        
        // Create trade goods menu
        const menuX = this.scene.cameras.main.width / 2;
        const menuY = this.scene.cameras.main.height / 2;
        
        const tradeBackground = this.scene.add.rectangle(
            menuX, menuY, 750, 700, 0x000000, 0.9
        );
        tradeBackground.setScrollFactor(0);
        tradeBackground.setDepth(1000);
        this.tradeBackground = tradeBackground; // Store for cleanup
        
        const tradeTitle = this.scene.add.text(
            menuX, menuY - 270, 'Trade Goods', {
                fontSize: '60px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        tradeTitle.setScrollFactor(0);
        tradeTitle.setDepth(1001);
        tradeTitle.setOrigin(0.5, 0.5);
        this.tradeTitle = tradeTitle; // Store for cleanup
        
        // Define available trade goods (use current dynamic prices)
        this.availableGoods = this.currentGoods;
        
        this.selectedGoodIndex = 0;
        this.purchaseAmount = 1;
        this.numberInputString = '';
        this.isTypingAmount = false;
        
        // Create scrollable goods list
        this.goodsScrollOffset = 0;
        this.maxGoodsScrollOffset = Math.max(0, (this.availableGoods.length - 4) * 120);
        
        // Create scrollable container for goods
        this.goodsContainer = this.scene.add.container(menuX, menuY - 80);
        this.goodsContainer.setScrollFactor(0);
        this.goodsContainer.setDepth(1001);
        
        this.updateGoodsList();
        
        // Add player status info
        const statusText = this.scene.add.text(
            menuX, menuY - 200, 
            `Gold: ${this.scene.playerShip.gold} | Cargo: ${this.scene.playerShip.getCurrentCargo()}/${this.scene.playerShip.cargoMax}`, {
            fontSize: '28px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }
        );
        statusText.setScrollFactor(0);
        statusText.setDepth(1001);
        statusText.setOrigin(0.5, 0.5);
        this.statusText = statusText; // Store for cleanup
        
        // Add instructions
        const instructionText = this.scene.add.text(
            menuX, menuY + 350, 
            'UP/DOWN: Select good | LEFT/RIGHT: Adjust amount | TYPE NUMBERS: Direct input\nENTER: Purchase | ESC: Back', {
            fontSize: '22px',
            fill: '#ccc',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            align: 'center'
        }
        );
        instructionText.setScrollFactor(0);
        instructionText.setDepth(1001);
        instructionText.setOrigin(0.5, 0.5);
        this.instructionText = instructionText; // Store for cleanup
        
        // Add purchase result text (initially hidden)
        this.resultText = this.scene.add.text(
            menuX, menuY + 330, '', {
            fontSize: '22px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }
        );
        this.resultText.setScrollFactor(0);
        this.resultText.setDepth(1001);
        this.resultText.setOrigin(0.5, 0.5);
        this.resultText.setVisible(false);
        
        // Set up trade keys
        this.tradeKeys = {
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
            escape: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };
        
        // Set up number keys for direct input
        this.numberKeys = {
            zero: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO),
            one: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
            two: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
            three: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
            four: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
            five: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
            six: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
            seven: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN),
            eight: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT),
            nine: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NINE),
            backspace: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE)
        };
    }
    
    updateGoodsList() {
        if (!this.availableGoods || this.availableGoods.length === 0 || !this.goodsContainer) {
            return;
        }
        
        // Clear existing goods texts
        this.goodsContainer.removeAll(true);
        
        // Create goods entries for visible range
        const startIndex = Math.floor(this.goodsScrollOffset / 120);
        const endIndex = Math.min(startIndex + 4, this.availableGoods.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const good = this.availableGoods[i];
            const yOffset = (i * 120) - this.goodsScrollOffset - 60;
            
            // Determine if this good is selected
            const isSelected = (i === this.selectedGoodIndex);
            const goodColor = isSelected ? '#ffff00' : '#fff';
            
            // Good name and price with change indicator
            const baseGood = this.baseGoods.find(bg => bg.id === good.id);
            const priceChange = good.price - baseGood.basePrice;
            const changePercent = Math.round((priceChange / baseGood.basePrice) * 100);
            const changeSymbol = changePercent > 0 ? '▲' : changePercent < 0 ? '▼' : '○';
            const changeColor = changePercent > 0 ? '#00ff00' : changePercent < 0 ? '#ff0000' : '#ffffff';
            
            const nameText = this.scene.add.text(0, yOffset, 
                `${good.name} - ${good.price} gold each ${changeSymbol}${Math.abs(changePercent)}%`, {
                fontSize: '28px',
                fill: goodColor,
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            nameText.setOrigin(0.5, 0.5);
            
            // Description
            const descText = this.scene.add.text(0, yOffset + 25, good.description, {
                fontSize: '20px',
                fill: isSelected ? '#ffff00' : '#ccc',
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            descText.setOrigin(0.5, 0.5);
            
            // Current inventory
            const currentAmount = this.scene.playerShip.tradeGoods[good.id] || 0;
            const inventoryText = this.scene.add.text(0, yOffset + 50, 
                `Current: ${currentAmount}`, {
                fontSize: '20px',
                fill: isSelected ? '#ffff00' : '#aaa',
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            inventoryText.setOrigin(0.5, 0.5);
            
            // Purchase amount (only for selected item)
            if (isSelected) {
                const displayAmount = this.isTypingAmount ? (this.numberInputString || '0') : this.purchaseAmount;
                const amountText = this.scene.add.text(0, yOffset + 75, 
                    `Amount: ${displayAmount} | Total: ${this.purchaseAmount * good.price} gold`, {
                    fontSize: '22px',
                    fill: this.isTypingAmount ? '#ff9900' : '#00ff00',
                    backgroundColor: 'transparent',
                    padding: { x: 5, y: 2 }
                });
                amountText.setOrigin(0.5, 0.5);
                this.goodsContainer.add([nameText, descText, inventoryText, amountText]);
            } else {
                this.goodsContainer.add([nameText, descText, inventoryText]);
            }
        }
    }
    
    purchaseTradeGood() {
        if (this.selectedGoodIndex >= 0 && this.selectedGoodIndex < this.availableGoods.length) {
            const good = this.availableGoods[this.selectedGoodIndex];
            const result = this.scene.playerShip.purchaseTradeGood(good.id, this.purchaseAmount, good.price);
            
            // Show result message
            this.resultText.setText(result.message);
            this.resultText.setFill(result.success ? '#00ff00' : '#ff0000');
            this.resultText.setVisible(true);
            
            if (result.success) {
                // Update status display
                this.statusText.setText(
                    `Gold: ${this.scene.playerShip.gold} | Cargo: ${this.scene.playerShip.getCurrentCargo()}/${this.scene.playerShip.cargoMax}`
                );
                
                // Update goods list to show new inventory
                this.updateGoodsList();
                
                // Reset purchase amount
                this.purchaseAmount = 1;
                
                // Hide result after 2 seconds
                setTimeout(() => {
                    if (this.resultText) {
                        this.resultText.setVisible(false);
                    }
                }, 2000);
            } else {
                // Hide error message after 2 seconds
                setTimeout(() => {
                    if (this.resultText) {
                        this.resultText.setVisible(false);
                    }
                }, 2000);
            }
        }
    }
    
    calculateMaxPurchaseAmount() {
        if (this.selectedGoodIndex >= 0 && this.selectedGoodIndex < this.availableGoods.length) {
            const good = this.availableGoods[this.selectedGoodIndex];
            const maxByGold = Math.floor(this.scene.playerShip.gold / good.price);
            const maxByCargo = this.scene.playerShip.getAvailableCargoSpace();
            return Math.min(maxByGold, maxByCargo);
        }
        return 0;
    }
    
    showSellGoodsMenu() {
        // Hide current menu
        this.hideMenu();
        
        // Create sell goods menu
        const menuX = this.scene.cameras.main.width / 2;
        const menuY = this.scene.cameras.main.height / 2;
        
        const sellBackground = this.scene.add.rectangle(
            menuX, menuY, 750, 700, 0x000000, 0.9
        );
        sellBackground.setScrollFactor(0);
        sellBackground.setDepth(1000);
        this.sellBackground = sellBackground; // Store for cleanup
        
        const sellTitle = this.scene.add.text(
            menuX, menuY - 270, 'Sell Goods', {
                fontSize: '60px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        sellTitle.setScrollFactor(0);
        sellTitle.setDepth(1001);
        sellTitle.setOrigin(0.5, 0.5);
        this.sellTitle = sellTitle; // Store for cleanup
        
        // Filter goods that player actually has
        this.playerGoods = this.currentGoods.filter(good => 
            this.scene.playerShip.tradeGoods[good.id] > 0
        );
        
        if (this.playerGoods.length === 0) {
            // Show no goods message
            const noGoodsText = this.scene.add.text(
                menuX, menuY, 
                'You have no goods to sell!\n\nPress ESC to return to main menu', {
                fontSize: '30px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 15, y: 10 },
                align: 'center'
            }
            );
            noGoodsText.setScrollFactor(0);
            noGoodsText.setDepth(1001);
            noGoodsText.setOrigin(0.5, 0.5);
            
            // Add close handler
            const escapeKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            escapeKey.once('down', () => {
                sellBackground.destroy();
                sellTitle.destroy();
                noGoodsText.destroy();
                escapeKey.destroy();
                this.showMenu(); // Return to main menu
            });
            return;
        }
        
        this.selectedSellGoodIndex = 0;
        this.sellAmount = 1;
        this.sellNumberInputString = '';
        this.isTypingSellAmount = false;
        
        // Create scrollable goods list
        this.sellGoodsScrollOffset = 0;
        this.maxSellGoodsScrollOffset = Math.max(0, (this.playerGoods.length - 4) * 120);
        
        // Create scrollable container for goods
        this.sellGoodsContainer = this.scene.add.container(menuX, menuY - 80);
        this.sellGoodsContainer.setScrollFactor(0);
        this.sellGoodsContainer.setDepth(1001);
        
        this.updateSellGoodsList();
        
        // Add player status info
        const sellStatusText = this.scene.add.text(
            menuX, menuY + 250, 
            `Gold: ${this.scene.playerShip.gold} | Cargo: ${this.scene.playerShip.getCurrentCargo()}/${this.scene.playerShip.cargoMax}`, {
            fontSize: '28px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }
        );
        sellStatusText.setScrollFactor(0);
        sellStatusText.setDepth(1001);
        sellStatusText.setOrigin(0.5, 0.5);
        this.sellStatusText = sellStatusText; // Store for cleanup
        
        // Add instructions
        const sellInstructionText = this.scene.add.text(
            menuX, menuY + 305, 
            'UP/DOWN: Select good | LEFT/RIGHT: Adjust amount | TYPE NUMBERS: Direct input\nENTER: Sell | ESC: Back', {
            fontSize: '24px',
            fill: '#ccc',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }
        );
        sellInstructionText.setScrollFactor(0);
        sellInstructionText.setDepth(1001);
        sellInstructionText.setOrigin(0.5, 0.5);
        this.sellInstructionText = sellInstructionText; // Store for cleanup
        
        // Add sell result text (initially hidden)
        this.sellResultText = this.scene.add.text(
            menuX, menuY + 345, '', {
            fontSize: '22px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }
        );
        this.sellResultText.setScrollFactor(0);
        this.sellResultText.setDepth(1001);
        this.sellResultText.setOrigin(0.5, 0.5);
        this.sellResultText.setVisible(false);
        
        // Set up sell keys
        this.sellKeys = {
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
            escape: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };
        
        // Set up number keys for direct input
        this.sellNumberKeys = {
            zero: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO),
            one: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
            two: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
            three: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
            four: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
            five: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
            six: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
            seven: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN),
            eight: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT),
            nine: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NINE),
            backspace: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE)
        };
    }
    
    updateSellGoodsList() {
        if (!this.playerGoods || this.playerGoods.length === 0) {
            return;
        }
        
        // Clear existing goods texts
        this.sellGoodsContainer.removeAll(true);
        
        // Create goods entries for visible range
        const startIndex = Math.floor(this.sellGoodsScrollOffset / 120);
        const endIndex = Math.min(startIndex + 4, this.playerGoods.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const good = this.playerGoods[i];
            const yOffset = (i * 120) - this.sellGoodsScrollOffset - 60;
            
            // Determine if this good is selected
            const isSelected = (i === this.selectedSellGoodIndex);
            const goodColor = isSelected ? '#ffff00' : '#fff';
            
            // Use stored sell price instead of calculating randomly
            const sellPrice = good.sellPrice;
            const sellPercentDisplay = good.sellPricePercent;
            
            // Good name and sell price
            const nameText = this.scene.add.text(0, yOffset, 
                `${good.name} - ${sellPrice} gold each (${sellPercentDisplay}% of buy price)`, {
                fontSize: '26px',
                fill: goodColor,
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            nameText.setOrigin(0.5, 0.5);
            
            // Description
            const descText = this.scene.add.text(0, yOffset + 25, good.description, {
                fontSize: '20px',
                fill: isSelected ? '#ffff00' : '#ccc',
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            descText.setOrigin(0.5, 0.5);
            
            // Current inventory
            const currentAmount = this.scene.playerShip.tradeGoods[good.id] || 0;
            const inventoryText = this.scene.add.text(0, yOffset + 50, 
                `Available: ${currentAmount}`, {
                fontSize: '20px',
                fill: isSelected ? '#ffff00' : '#aaa',
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            inventoryText.setOrigin(0.5, 0.5);
            
            // Sell amount (only for selected item)
            if (isSelected) {
                const displayAmount = this.isTypingSellAmount ? (this.sellNumberInputString || '0') : this.sellAmount;
                const amountText = this.scene.add.text(0, yOffset + 75, 
                    `Amount: ${displayAmount} | Total: ${this.sellAmount * sellPrice} gold`, {
                    fontSize: '22px',
                    fill: this.isTypingSellAmount ? '#ff9900' : '#00ff00',
                    backgroundColor: 'transparent',
                    padding: { x: 5, y: 2 }
                });
                amountText.setOrigin(0.5, 0.5);
                this.sellGoodsContainer.add([nameText, descText, inventoryText, amountText]);
            } else {
                this.sellGoodsContainer.add([nameText, descText, inventoryText]);
            }
        }
    }
    
    sellTradeGood() {
        if (this.selectedSellGoodIndex >= 0 && this.selectedSellGoodIndex < this.playerGoods.length) {
            const good = this.playerGoods[this.selectedSellGoodIndex];
            
            // Use stored sell price instead of calculating randomly
            const sellPrice = good.sellPrice;
            
            const result = this.scene.playerShip.sellTradeGood(good.id, this.sellAmount, sellPrice);
            
            // Show result message
            this.sellResultText.setText(result.message);
            this.sellResultText.setFill(result.success ? '#00ff00' : '#ff0000');
            this.sellResultText.setVisible(true);
            
            if (result.success) {
                // Update status display
                this.sellStatusText.setText(
                    `Gold: ${this.scene.playerShip.gold} | Cargo: ${this.scene.playerShip.getCurrentCargo()}/${this.scene.playerShip.cargoMax}`
                );
                
                // Check if player still has goods
                this.playerGoods = this.currentGoods.filter(good => 
                    this.scene.playerShip.tradeGoods[good.id] > 0
                );
                
                if (this.playerGoods.length === 0) {
                    // No more goods to sell, close menu after delay
                    setTimeout(() => {
                        this.cleanupSellMenu();
                        this.showMenu();
                    }, 2000);
                } else {
                    // Update goods list to show new inventory
                    if (this.selectedSellGoodIndex >= this.playerGoods.length) {
                        this.selectedSellGoodIndex = this.playerGoods.length - 1;
                    }
                    this.updateSellGoodsList();
                }
                
                // Reset sell amount
                this.sellAmount = 1;
                
                // Hide result after 2 seconds
                setTimeout(() => {
                    if (this.sellResultText) {
                        this.sellResultText.setVisible(false);
                    }
                }, 2000);
            } else {
                // Hide error message after 2 seconds
                setTimeout(() => {
                    if (this.sellResultText) {
                        this.sellResultText.setVisible(false);
                    }
                }, 2000);
            }
        }
    }
    
    cleanupSellMenu() {
        if (this.sellBackground) this.sellBackground.destroy();
        if (this.sellTitle) this.sellTitle.destroy();
        if (this.sellGoodsContainer) this.sellGoodsContainer.destroy();
        if (this.sellStatusText) this.sellStatusText.destroy();
        if (this.sellInstructionText) this.sellInstructionText.destroy();
        if (this.sellResultText) this.sellResultText.destroy();
        if (this.sellKeys) {
            Object.values(this.sellKeys).forEach(key => key.destroy());
            this.sellKeys = null;
        }
        if (this.sellNumberKeys) {
            Object.values(this.sellNumberKeys).forEach(key => key.destroy());
            this.sellNumberKeys = null;
        }
    }
    
    showShipInventory() {
        // Hide current menu
        this.hideMenu();
        
        // Create ship inventory menu
        const menuX = this.scene.cameras.main.width / 2;
        const menuY = this.scene.cameras.main.height / 2;
        
        const inventoryBackground = this.scene.add.rectangle(
            menuX, menuY, 750, 700, 0x000000, 0.9
        );
        inventoryBackground.setScrollFactor(0);
        inventoryBackground.setDepth(1000);
        this.inventoryBackground = inventoryBackground; // Store for cleanup
        
        const inventoryTitle = this.scene.add.text(
            menuX, menuY - 270, 'Ship Inventory', {
            fontSize: '60px',
            fill: '#fff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }
        );
        inventoryTitle.setScrollFactor(0);
        inventoryTitle.setDepth(1001);
        inventoryTitle.setOrigin(0.5, 0.5);
        this.inventoryTitle = inventoryTitle; // Store for cleanup
        
        // Get player's owned ships
        const playerOwnedShips = this.scene.playerShip.ownedShips || ['SLOOP'];
        const ownedShips = Object.entries(SHIP_TYPES).filter(([key]) => playerOwnedShips.includes(key));
        
        console.log('Owned ships count:', ownedShips.length);
        console.log('Owned ships:', ownedShips.map(([key, ship]) => ship.name));
        
        // Create scrollable ship list
        this.inventoryScrollOffset = 0;
        this.maxScrollOffset = Math.max(0, (ownedShips.length - 6) * 80);
        this.ownedShips = ownedShips;
        this.selectedShipIndex = 0; // Track selected ship
        
        // Create scrollable container
        this.scrollContainer = this.scene.add.container(menuX, menuY - 100);
        this.scrollContainer.setScrollFactor(0);
        this.scrollContainer.setDepth(1001);
        
        console.log('Calling updateShipList...');
        this.updateShipList();
        
        // Add scroll instructions
        const scrollInstruction = this.scene.add.text(
            menuX, menuY + 300, 'Use UP/DOWN arrows to scroll and select,\nENTER to confirm ship, ESC to return', {
            fontSize: '24px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            align: 'center'
        }
        );
        scrollInstruction.setScrollFactor(0);
        scrollInstruction.setDepth(1001);
        scrollInstruction.setOrigin(0.5, 0.5);
        this.scrollInstruction = scrollInstruction; // Store for cleanup
        
        // Add visual boundary for scroll area (temporary for testing)
        const boundaryBox = this.scene.add.rectangle(menuX, menuY - 100, 700, 400, 0xffffff, 0.1);
        boundaryBox.setScrollFactor(0);
        boundaryBox.setDepth(999);
        boundaryBox.setStrokeStyle(2, 0xffffff, 0.3);
        this.boundaryBox = boundaryBox; // Store for cleanup
        
        // Set up scroll keys
        this.scrollKeys = {
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
            escape: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };
        
        // Add close handler
        const closeHandler = () => {
            inventoryBackground.destroy();
            inventoryTitle.destroy();
            if (this.scrollContainer) this.scrollContainer.destroy();
            scrollInstruction.destroy();
            boundaryBox.destroy();
            if (this.scrollKeys) {
                Object.values(this.scrollKeys).forEach(key => key.destroy());
                this.scrollKeys = null;
            }
            this.showMenu(); // Return to main menu
        };
        
        this.scrollKeys.escape.once('down', closeHandler);
    }
    
    updateShipList() {
        console.log('updateShipList called, ownedShips:', this.ownedShips?.length);
        
        if (!this.ownedShips || this.ownedShips.length === 0) {
            console.log('No owned ships to display');
            return;
        }
        
        // Clear existing ship texts
        this.scrollContainer.removeAll(true);
        
        // Create ship entries for visible range with proper scrolling
        const startIndex = Math.floor(this.inventoryScrollOffset / 80);
        const endIndex = Math.min(startIndex + 6, this.ownedShips.length);
        
        console.log(`Displaying ships ${startIndex + 1} to ${endIndex} of ${this.ownedShips.length}, offset: ${this.inventoryScrollOffset}`);
        
        for (let i = startIndex; i < endIndex; i++) {
            const [key, ship] = this.ownedShips[i];
            const yOffset = (i * 80) - this.inventoryScrollOffset - 100;
            
            console.log(`Creating text for ship: ${ship.name} at y: ${yOffset}`);
            
            // Determine if this ship is selected
            const isSelected = (i === this.selectedShipIndex);
            const shipColor = isSelected ? '#ffff00' : '#fff';
            
            // Ship name
            const nameText = this.scene.add.text(0, yOffset, `${i + 1}. ${ship.name}`, {
                fontSize: '28px',
                fill: shipColor,
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            nameText.setOrigin(0.5, 0.5);
            
            // Ship stats
            const statsText = this.scene.add.text(0, yOffset + 30, 
                `Size: ${ship.size} | Speed: ${ship.speed} | Cannons: ${ship.cannons}`, {
                fontSize: '24px',
                fill: isSelected ? '#ffff00' : '#ccc',
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            statsText.setOrigin(0.5, 0.5);
            
            // Cargo and crew
            const detailsText = this.scene.add.text(0, yOffset + 55, 
                `Cargo: ${ship.cargoMax} | Crew: ${ship.crewMax}`, {
                fontSize: '24px',
                fill: isSelected ? '#ffff00' : '#aaa',
                backgroundColor: 'transparent',
                padding: { x: 5, y: 2 }
            });
            detailsText.setOrigin(0.5, 0.5);
            
            this.scrollContainer.add([nameText, statsText, detailsText]);
        }
        
        console.log(`Added ${this.scrollContainer.list.length} text elements to container`);
    }
    
    changePlayerShip() {
        if (this.selectedShipIndex >= 0 && this.selectedShipIndex < this.ownedShips.length) {
            const [shipKey, shipType] = this.ownedShips[this.selectedShipIndex];
            console.log(`Changing player ship to: ${shipType.name} (${shipKey})`);
            
            // The scene's changePlayerShip method now handles preserving gold and cargo
            // and spawning the player outside the port
            this.scene.changePlayerShip(shipType);
            
            // Clean up all inventory menu elements
            if (this.inventoryBackground) this.inventoryBackground.destroy();
            if (this.inventoryTitle) this.inventoryTitle.destroy();
            if (this.scrollContainer) this.scrollContainer.destroy();
            if (this.scrollInstruction) this.scrollInstruction.destroy();
            if (this.boundaryBox) this.boundaryBox.destroy();
            if (this.scrollKeys) {
                Object.values(this.scrollKeys).forEach(key => key.destroy());
                this.scrollKeys = null;
            }
            
            // Return to main menu
            this.showMenu();
        }
    }
    
    update() {
        // Check for debug mode activation (G + J simultaneously)
        if (this.debugKeyG && this.debugKeyJ && 
            this.debugKeyG.isDown && this.debugKeyJ.isDown && 
            !this.debugMode) {
            this.debugMode = true;
            console.log('DEBUG MODE ACTIVATED - All ships now available for free!');
            
            // If currently in buy ships menu, reload it to apply debug mode
            if (this.buyKeys) {
                this.cleanupBuyMenu();
                this.showBuyShipsMenu();
            }
        }
        
        // Check for C key press when in contact
        if (this.playerInContact && !this.menuActive && Phaser.Input.Keyboard.JustDown(this.dockKey)) {
            console.log('Port: C key pressed, opening menu for', this.portName);
            this.showMenu();
        }
        
        this.updateMenu();
        
        // Handle inventory scrolling and selection
        if (this.scrollKeys) {
            if (Phaser.Input.Keyboard.JustDown(this.scrollKeys.up)) {
                // Move selection up
                this.selectedShipIndex = Math.max(0, this.selectedShipIndex - 1);
                
                // Adjust scroll if selection is out of view
                const visibleStart = Math.floor(this.inventoryScrollOffset / 80);
                const visibleEnd = Math.min(visibleStart + 6, this.ownedShips.length);
                if (this.selectedShipIndex < visibleStart) {
                    this.inventoryScrollOffset = this.selectedShipIndex * 80;
                }
                
                this.updateShipList();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.scrollKeys.down)) {
                // Move selection down
                this.selectedShipIndex = Math.min(this.ownedShips.length - 1, this.selectedShipIndex + 1);
                
                // Adjust scroll if selection is out of view
                const visibleStart = Math.floor(this.inventoryScrollOffset / 80);
                const visibleEnd = Math.min(visibleStart + 6, this.ownedShips.length);
                if (this.selectedShipIndex >= visibleEnd) {
                    this.inventoryScrollOffset = Math.max(0, (this.selectedShipIndex - 5) * 80);
                }
                
                this.updateShipList();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.scrollKeys.enter)) {
                // Confirm ship selection
                this.changePlayerShip();
            }
        }
        
        // Handle buy ships menu input
        if (this.buyKeys) {
            if (Phaser.Input.Keyboard.JustDown(this.buyKeys.up)) {
                // Move selection up
                this.selectedBuyShipIndex = Math.max(0, this.selectedBuyShipIndex - 1);
                
                // Adjust scroll if selection is out of view
                const visibleStart = Math.floor(this.buyShipsScrollOffset / 120);
                const visibleEnd = Math.min(visibleStart + 4, this.availableShips.length);
                if (this.selectedBuyShipIndex < visibleStart) {
                    this.buyShipsScrollOffset = this.selectedBuyShipIndex * 120;
                }
                
                this.updateBuyShipsList();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.buyKeys.down)) {
                // Move selection down
                this.selectedBuyShipIndex = Math.min(this.availableShips.length - 1, this.selectedBuyShipIndex + 1);
                
                // Adjust scroll if selection is out of view
                const visibleStart = Math.floor(this.buyShipsScrollOffset / 120);
                const visibleEnd = Math.min(visibleStart + 4, this.availableShips.length);
                if (this.selectedBuyShipIndex >= visibleEnd) {
                    this.buyShipsScrollOffset = Math.max(0, (this.selectedBuyShipIndex - 3) * 120);
                }
                
                this.updateBuyShipsList();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.buyKeys.enter)) {
                // Purchase the selected ship
                this.purchaseShip();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.buyKeys.escape)) {
                // Clean up buy menu and return to main menu
                this.cleanupBuyMenu();
                // Reset debug mode when exiting buy ships menu
                this.debugMode = false;
                console.log('DEBUG MODE DEACTIVATED');
                this.showMenu(); // Return to main menu
            }
        }
        
        // Handle trade goods menu input
        if (this.tradeKeys) {
            if (Phaser.Input.Keyboard.JustDown(this.tradeKeys.up)) {
                // Move selection up
                this.selectedGoodIndex = Math.max(0, this.selectedGoodIndex - 1);
                
                // Adjust scroll if selection is out of view
                const visibleStart = Math.floor(this.goodsScrollOffset / 120);
                const visibleEnd = Math.min(visibleStart + 4, this.availableGoods.length);
                if (this.selectedGoodIndex < visibleStart) {
                    this.goodsScrollOffset = this.selectedGoodIndex * 120;
                }
                
                // Reset purchase amount when changing selection
                this.purchaseAmount = 1;
                this.numberInputString = '';
                this.isTypingAmount = false;
                this.updateGoodsList();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.tradeKeys.down)) {
                // Move selection down
                this.selectedGoodIndex = Math.min(this.availableGoods.length - 1, this.selectedGoodIndex + 1);
                
                // Adjust scroll if selection is out of view
                const visibleStart = Math.floor(this.goodsScrollOffset / 120);
                const visibleEnd = Math.min(visibleStart + 4, this.availableGoods.length);
                if (this.selectedGoodIndex >= visibleEnd) {
                    this.goodsScrollOffset = Math.max(0, (this.selectedGoodIndex - 3) * 120);
                }
                
                // Reset purchase amount when changing selection
                this.purchaseAmount = 1;
                this.numberInputString = '';
                this.isTypingAmount = false;
                this.updateGoodsList();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.tradeKeys.left)) {
                // Decrease purchase amount
                this.purchaseAmount = Math.max(1, this.purchaseAmount - 1);
                this.numberInputString = '';
                this.isTypingAmount = false;
                this.updateGoodsList();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.tradeKeys.right)) {
                // Increase purchase amount (max based on gold and cargo)
                const maxAmount = this.calculateMaxPurchaseAmount();
                this.purchaseAmount = Math.min(maxAmount, this.purchaseAmount + 1);
                this.numberInputString = '';
                this.isTypingAmount = false;
                this.updateGoodsList();
            }
            
            // Handle number key input
            if (this.numberKeys) {
                // Check if any number key was pressed
                const numberKeys = [
                    { key: this.numberKeys.zero, digit: '0' },
                    { key: this.numberKeys.one, digit: '1' },
                    { key: this.numberKeys.two, digit: '2' },
                    { key: this.numberKeys.three, digit: '3' },
                    { key: this.numberKeys.four, digit: '4' },
                    { key: this.numberKeys.five, digit: '5' },
                    { key: this.numberKeys.six, digit: '6' },
                    { key: this.numberKeys.seven, digit: '7' },
                    { key: this.numberKeys.eight, digit: '8' },
                    { key: this.numberKeys.nine, digit: '9' }
                ];
                
                for (const { key, digit } of numberKeys) {
                    if (Phaser.Input.Keyboard.JustDown(key)) {
                        // Start typing or append digit
                        if (!this.isTypingAmount) {
                            this.isTypingAmount = true;
                            this.numberInputString = digit;
                        } else {
                            // Limit input to reasonable length (max 5 digits)
                            if (this.numberInputString.length < 5) {
                                this.numberInputString += digit;
                            }
                        }
                        this.updateGoodsList();
                        break;
                    }
                }
                
                // Handle backspace
                if (Phaser.Input.Keyboard.JustDown(this.numberKeys.backspace)) {
                    if (this.isTypingAmount && this.numberInputString.length > 0) {
                        this.numberInputString = this.numberInputString.slice(0, -1);
                        if (this.numberInputString === '') {
                            this.isTypingAmount = false;
                        }
                        this.updateGoodsList();
                    }
                }
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.tradeKeys.enter)) {
                // Apply typed amount if in typing mode
                if (this.isTypingAmount && this.numberInputString !== '') {
                    const typedAmount = parseInt(this.numberInputString, 10);
                    if (!isNaN(typedAmount) && typedAmount > 0) {
                        const maxAmount = this.calculateMaxPurchaseAmount();
                        this.purchaseAmount = Math.min(maxAmount, typedAmount);
                    }
                    this.numberInputString = '';
                    this.isTypingAmount = false;
                    this.updateGoodsList();
                }
                // Purchase the selected good
                this.purchaseTradeGood();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.tradeKeys.escape)) {
                // Clean up trade menu and return to main menu
                if (this.tradeBackground) this.tradeBackground.destroy();
                if (this.tradeTitle) this.tradeTitle.destroy();
                if (this.goodsContainer) this.goodsContainer.destroy();
                if (this.statusText) this.statusText.destroy();
                if (this.instructionText) this.instructionText.destroy();
                if (this.resultText) this.resultText.destroy();
                if (this.tradeKeys) {
                    Object.values(this.tradeKeys).forEach(key => key.destroy());
                    this.tradeKeys = null;
                }
                if (this.numberKeys) {
                    Object.values(this.numberKeys).forEach(key => key.destroy());
                    this.numberKeys = null;
                }
                this.showMenu(); // Return to main menu
            }
        }
        
        // Handle sell goods menu input
        if (this.sellKeys) {
            if (Phaser.Input.Keyboard.JustDown(this.sellKeys.up)) {
                // Move selection up
                this.selectedSellGoodIndex = Math.max(0, this.selectedSellGoodIndex - 1);
                
                // Adjust scroll if selection is out of view
                const visibleStart = Math.floor(this.sellGoodsScrollOffset / 120);
                const visibleEnd = Math.min(visibleStart + 4, this.playerGoods.length);
                if (this.selectedSellGoodIndex < visibleStart) {
                    this.sellGoodsScrollOffset = this.selectedSellGoodIndex * 120;
                }
                
                // Reset sell amount when changing selection
                this.sellAmount = 1;
                this.sellNumberInputString = '';
                this.isTypingSellAmount = false;
                this.updateSellGoodsList();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.sellKeys.down)) {
                // Move selection down
                this.selectedSellGoodIndex = Math.min(this.playerGoods.length - 1, this.selectedSellGoodIndex + 1);
                
                // Adjust scroll if selection is out of view
                const visibleStart = Math.floor(this.sellGoodsScrollOffset / 120);
                const visibleEnd = Math.min(visibleStart + 4, this.playerGoods.length);
                if (this.selectedSellGoodIndex >= visibleEnd) {
                    this.sellGoodsScrollOffset = Math.max(0, (this.selectedSellGoodIndex - 3) * 120);
                }
                
                // Reset sell amount when changing selection
                this.sellAmount = 1;
                this.sellNumberInputString = '';
                this.isTypingSellAmount = false;
                this.updateSellGoodsList();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.sellKeys.left)) {
                // Decrease sell amount
                this.sellAmount = Math.max(1, this.sellAmount - 1);
                this.sellNumberInputString = '';
                this.isTypingSellAmount = false;
                this.updateSellGoodsList();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.sellKeys.right)) {
                // Increase sell amount (max based on available goods)
                if (this.selectedSellGoodIndex >= 0 && this.selectedSellGoodIndex < this.playerGoods.length) {
                    const good = this.playerGoods[this.selectedSellGoodIndex];
                    const maxAmount = this.scene.playerShip.tradeGoods[good.id] || 0;
                    this.sellAmount = Math.min(maxAmount, this.sellAmount + 1);
                }
                this.sellNumberInputString = '';
                this.isTypingSellAmount = false;
                this.updateSellGoodsList();
            }
            
            // Handle number key input
            if (this.sellNumberKeys) {
                // Check if any number key was pressed
                const numberKeys = [
                    { key: this.sellNumberKeys.zero, digit: '0' },
                    { key: this.sellNumberKeys.one, digit: '1' },
                    { key: this.sellNumberKeys.two, digit: '2' },
                    { key: this.sellNumberKeys.three, digit: '3' },
                    { key: this.sellNumberKeys.four, digit: '4' },
                    { key: this.sellNumberKeys.five, digit: '5' },
                    { key: this.sellNumberKeys.six, digit: '6' },
                    { key: this.sellNumberKeys.seven, digit: '7' },
                    { key: this.sellNumberKeys.eight, digit: '8' },
                    { key: this.sellNumberKeys.nine, digit: '9' }
                ];
                
                for (const { key, digit } of numberKeys) {
                    if (Phaser.Input.Keyboard.JustDown(key)) {
                        // Start typing or append digit
                        if (!this.isTypingSellAmount) {
                            this.isTypingSellAmount = true;
                            this.sellNumberInputString = digit;
                        } else {
                            // Limit input to reasonable length (max 5 digits)
                            if (this.sellNumberInputString.length < 5) {
                                this.sellNumberInputString += digit;
                            }
                        }
                        this.updateSellGoodsList();
                        break;
                    }
                }
                
                // Handle backspace
                if (Phaser.Input.Keyboard.JustDown(this.sellNumberKeys.backspace)) {
                    if (this.isTypingSellAmount && this.sellNumberInputString.length > 0) {
                        this.sellNumberInputString = this.sellNumberInputString.slice(0, -1);
                        if (this.sellNumberInputString === '') {
                            this.isTypingSellAmount = false;
                        }
                        this.updateSellGoodsList();
                    }
                }
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.sellKeys.enter)) {
                // Apply typed amount if in typing mode
                if (this.isTypingSellAmount && this.sellNumberInputString !== '') {
                    const typedAmount = parseInt(this.sellNumberInputString, 10);
                    if (!isNaN(typedAmount) && typedAmount > 0) {
                        if (this.selectedSellGoodIndex >= 0 && this.selectedSellGoodIndex < this.playerGoods.length) {
                            const good = this.playerGoods[this.selectedSellGoodIndex];
                            const maxAmount = this.scene.playerShip.tradeGoods[good.id] || 0;
                            this.sellAmount = Math.min(maxAmount, typedAmount);
                        }
                    }
                    this.sellNumberInputString = '';
                    this.isTypingSellAmount = false;
                    this.updateSellGoodsList();
                }
                // Sell the selected good
                this.sellTradeGood();
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.sellKeys.escape)) {
                // Clean up sell menu and return to main menu
                this.cleanupSellMenu();
                this.showMenu(); // Return to main menu
            }
        }
    }
}
