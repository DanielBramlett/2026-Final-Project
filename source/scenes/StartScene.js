import FactionSystem from '../systems/FactionSystem.js';

export default class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
        this.selectedFaction = null;
    }

    preload() {
        // Create a simple colored background
        this.load.image('start_background', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Initialize faction system
        this.factionSystem = new FactionSystem(this);

        // Add background
        this.add.rectangle(width/2, height/2, width, height, 0x1a472a);

        // Title
        const title = this.add.text(width/2, height/6, 'SEA BATTLE', {
            fontSize: '64px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width/2, height/6 + 80, 'Choose Your Faction', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Create faction selection buttons
        this.createFactionSelection(width, height);

        // Instructions
        const instructions = this.add.text(width/2, height - 100, 
            'Select a faction to begin your adventure\nUse WASD to move, Mouse to fire cannons', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Add some decorative elements
        this.createDecorativeElements(width, height);
    }

    createFactionSelection(width, height) {
        const factions = this.factionSystem.getAvailableFactions();
        const buttonWidth = 250;
        const buttonHeight = 100;
        const spacing = 40;
        const totalWidth = factions.length * buttonWidth + (factions.length - 1) * spacing;
        const startX = (width - totalWidth) / 2 + buttonWidth / 2;
        const yPosition = height / 2;

        this.factionButtons = [];

        factions.forEach((faction, index) => {
            const x = startX + index * (buttonWidth + spacing);
            
            // Faction button
            const button = this.add.rectangle(x, yPosition, buttonWidth, buttonHeight, 0x8b4513)
                .setStrokeStyle(3, 0x000000)
                .setInteractive({ useHandCursor: true });

            // Faction name
            const factionName = this.add.text(x, yPosition - 20, faction.displayName, {
                fontSize: '22px',
                fontFamily: 'Arial',
                fill: faction.color,
                align: 'center'
            }).setOrigin(0.5);

            // Faction description
            const description = this.add.text(x, yPosition + 20, faction.description, {
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

            // Store button elements
            const buttonElements = { button, factionName, description, factionKey: faction.key };
            this.factionButtons.push(buttonElements);

            // Button interactions
            button.on('pointerover', () => {
                button.setFillStyle(0xa0522d);
                factionName.setStyle({ fill: '#ffff00' });
            });

            button.on('pointerout', () => {
                if (this.selectedFaction !== faction.key) {
                    button.setFillStyle(0x8b4513);
                    factionName.setStyle({ fill: faction.color });
                }
            });

            button.on('pointerdown', () => {
                this.selectFaction(faction.key);
            });
        });

        // Start button (initially hidden)
        this.startButton = this.add.text(width/2, height/2 + 120, 'START GAME', {
            fontSize: '36px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            backgroundColor: '#228b22',
            padding: { x: 30, y: 15 },
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setVisible(false);

        this.startButton.setInteractive({ useHandCursor: true });

        this.startButton.on('pointerover', () => {
            this.startButton.setStyle({ fill: '#ffff00', backgroundColor: '#32cd32' });
        });

        this.startButton.on('pointerout', () => {
            this.startButton.setStyle({ fill: '#ffffff', backgroundColor: '#228b22' });
        });

        this.startButton.on('pointerdown', () => {
            this.startGame();
        });
    }

    selectFaction(factionKey) {
        // Reset previous selection
        this.factionButtons.forEach(btn => {
            btn.button.setFillStyle(0x8b4513);
            btn.factionName.setStyle({ fill: this.factionSystem.factions[btn.factionKey].color });
        });

        // Highlight selected faction
        const selectedButton = this.factionButtons.find(btn => btn.factionKey === factionKey);
        if (selectedButton) {
            selectedButton.button.setFillStyle(0xffd700);
            selectedButton.factionName.setStyle({ fill: '#000000' });
        }

        this.selectedFaction = factionKey;
        this.startButton.setVisible(true);

        console.log(`Selected faction: ${factionKey}`);
    }

    startGame() {
        if (!this.selectedFaction) {
            console.log('No faction selected!');
            return;
        }

        // Set the faction in the faction system
        this.factionSystem.setFaction(this.selectedFaction);

        // Pass the faction system to the GameScene through registry
        this.registry.set('factionSystem', this.factionSystem);
        this.scene.start('GameScene');
    }

    createDecorativeElements(width, height) {
        // Add some decorative ship silhouettes or waves
        const waveY = height - 50;
        for (let i = 0; i < 5; i++) {
            const waveX = (width / 4) * i;
            this.add.text(waveX, waveY, '~', {
                fontSize: '32px',
                fontFamily: 'Arial',
                fill: '#4169e1'
            });
        }
    }
}
