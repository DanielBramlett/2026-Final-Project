export default class AmmoUI {
    constructor(scene, playerShip) {
        this.scene = scene;
        this.playerShip = playerShip;
        this.selectedAmmo = 'cannonballs'; // Default selected ammo
        this.uiElements = {};
        this.ammoTypes = ['cannonballs', 'chainshot', 'grapeshot'];
        this.currentAmmoIndex = 0; // Index of currently selected ammo
        
        this.createUI();
        this.setupKeyboardControls();
    }

    createUI() {
        const padding = 20;
        const iconSize = 40;
        const spacing = 15;
        const startX = padding;
        const startY = this.scene.cameras.main.height - padding - iconSize;
        const expandedWidth = 200; // Expanded width to accommodate key labels

        // Create background panel (expanded)
        this.uiElements.background = this.scene.add.rectangle(
            startX + expandedWidth/2,
            startY + iconSize/2 - padding/2,
            expandedWidth,
            iconSize + padding + 20,
            0x000000,
            0.8
        );
        this.uiElements.background.setScrollFactor(0);
        this.uiElements.background.setDepth(1000);

        // Create ammo icons with more spacing
        const ammoTypes = [
            { key: 'cannonballs', texture: 'Cannonball', x: 0 },
            { key: 'chainshot', texture: 'Chainshot', x: iconSize + spacing },
            { key: 'grapeshot', texture: 'Grapeshot', x: (iconSize + spacing) * 2 }
        ];

        ammoTypes.forEach(ammo => {
            // Create icon
            const icon = this.scene.add.image(
                startX + ammo.x + padding,
                startY,
                ammo.texture
            );
            icon.setDisplaySize(iconSize, iconSize);
            icon.setScrollFactor(0);
            icon.setDepth(1001);
            icon.setInteractive({ useHandCursor: true });

            // Create selection border
            const border = this.scene.add.rectangle(
                startX + ammo.x + padding,
                startY,
                iconSize + 4,
                iconSize + 4,
                0xFFFF00,
                0
            );
            border.setScrollFactor(0);
            border.setDepth(1002);
            border.setStrokeStyle(2, 0xFFFF00);

            // Create ammo count text
            const countText = this.scene.add.text(
                startX + ammo.x + padding,
                startY + iconSize/2 + 15,
                '0',
                {
                    fontSize: '16px',
                    fill: '#fff',
                    backgroundColor: '#000000',
                    padding: { x: 4, y: 2 }
                }
            );
            countText.setScrollFactor(0);
            countText.setDepth(1001);
            countText.setOrigin(0.5, 0.5);

            // Store elements
            this.uiElements[ammo.key] = {
                icon,
                border,
                countText,
                selected: ammo.key === this.selectedAmmo
            };

            // Add click handler
            icon.on('pointerdown', () => {
                this.selectAmmo(ammo.key);
            });

            // Add hover effects
            icon.on('pointerover', () => {
                icon.setTint(0xCCCCCC);
            });

            icon.on('pointerout', () => {
                icon.clearTint();
            });
        });

        // Create title text
        this.uiElements.title = this.scene.add.text(
            startX + expandedWidth/2,
            startY - 35,
            'AMMO (Q/E to cycle)',
            {
                fontSize: '18px',
                fill: '#fff',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            }
        );
        this.uiElements.title.setScrollFactor(0);
        this.uiElements.title.setDepth(1001);
        this.uiElements.title.setOrigin(0.5, 0.5);

        // Update initial selection
        this.updateSelection();
    }

    selectAmmo(ammoType) {
        this.selectedAmmo = ammoType;
        // Update current index to sync with keyboard controls
        this.currentAmmoIndex = this.ammoTypes.indexOf(ammoType);
        this.updateSelection();
        
        // Update combat system with selected ammo
        if (this.scene.combatSystem) {
            this.scene.combatSystem.setSelectedAmmo(ammoType);
        }
        
        console.log(`Selected ammo: ${ammoType}`);
    }

    updateSelection() {
        Object.keys(this.uiElements).forEach(key => {
            if (key === 'background' || key === 'title') return;
            
            const element = this.uiElements[key];
            element.selected = (key === this.selectedAmmo);
            
            // Update border visibility
            element.border.setVisible(element.selected);
            
            // Update icon tint for selected ammo
            if (element.selected) {
                element.icon.setTint(0xFFFF00);
            } else {
                element.icon.clearTint();
            }
        });
    }

    setupKeyboardControls() {
        // Add keyboard event listeners for cycling through ammo
        this.scene.input.keyboard.on('keydown-Q', () => {
            // Cycle to previous ammo type
            this.currentAmmoIndex = (this.currentAmmoIndex - 1 + this.ammoTypes.length) % this.ammoTypes.length;
            const ammoType = this.ammoTypes[this.currentAmmoIndex];
            this.selectAmmo(ammoType);
        });

        this.scene.input.keyboard.on('keydown-E', () => {
            // Cycle to next ammo type
            this.currentAmmoIndex = (this.currentAmmoIndex + 1) % this.ammoTypes.length;
            const ammoType = this.ammoTypes[this.currentAmmoIndex];
            this.selectAmmo(ammoType);
        });
    }

    selectAmmoByIndex(index) {
        if (index >= 0 && index < this.ammoTypes.length) {
            const ammoType = this.ammoTypes[index];
            this.currentAmmoIndex = index;
            this.selectAmmo(ammoType);
        }
    }

    update() {
        // Update ammo counts
        Object.keys(this.uiElements).forEach(key => {
            if (key === 'background' || key === 'title') return;
            
            const element = this.uiElements[key];
            const count = this.playerShip.tradeGoods[key] || 0;
            element.countText.setText(count.toString());
            
            // Disable interaction if no ammo
            if (count === 0) {
                element.icon.setAlpha(0.5);
                element.icon.disableInteractive();
            } else {
                element.icon.setAlpha(1);
                element.icon.setInteractive({ useHandCursor: true });
            }
        });
    }

    getSelectedAmmo() {
        return this.selectedAmmo;
    }

    destroy() {
        Object.values(this.uiElements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
    }
}
