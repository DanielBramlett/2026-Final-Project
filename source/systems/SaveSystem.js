import { SHIP_TYPES } from '../constants/shipTypes.js';

export default class SaveSystem {
    constructor(scene) {
        this.scene = scene;
        this.saveKey = 'pirateGameSave';
        this.autoSaveInterval = 60000; // Auto-save every 60 seconds
        this.lastAutoSave = 0;
    }

    // Save game state to localStorage
    saveGame() {
        try {
            const saveData = this.collectSaveData();
            const saveString = JSON.stringify(saveData);
            localStorage.setItem(this.saveKey, saveString);
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    // Load game state from localStorage
    loadGame() {
        try {
            const saveString = localStorage.getItem(this.saveKey);
            if (!saveString) {
                console.log('No save file found');
                return false;
            }

            const saveData = JSON.parse(saveString);
            this.restoreSaveData(saveData);
            console.log('Game loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }

    // Check if save file exists
    hasSaveFile() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    // Delete save file
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('Save file deleted');
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }

    // Collect all game data that needs to be saved
    collectSaveData() {
        const playerShip = this.scene.playerSystem.playerShip;
        if (!playerShip) {
            throw new Error('No player ship found for saving');
        }

        // Find the ship type key by matching the name
        let shipTypeKey = null;
        for (const key in SHIP_TYPES) {
            if (SHIP_TYPES[key].name === playerShip.shipType.name) {
                shipTypeKey = key;
                break;
            }
        }
        
        if (!shipTypeKey) {
            throw new Error(`Could not find ship type key for: ${playerShip.shipType.name}`);
        }

        // Basic player ship data
        const shipData = {
            shipType: shipTypeKey,
            position: {
                x: playerShip.x,
                y: playerShip.y
            },
            rotation: playerShip.facingAngle,
            health: playerShip.health,
            crew: playerShip.crew,
            crewHealth: playerShip.crewHealth,
            sailIntegrity: playerShip.sailIntegrity,
            gold: playerShip.gold,
            tradeGoods: { ...playerShip.tradeGoods },
            ownedShips: [...playerShip.ownedShips],
            namedShips: { ...playerShip.namedShips },
            velocity: {
                x: playerShip.velocityX,
                y: playerShip.velocityY
            },
            immunityEndTime: playerShip.immunityEndTime || null
        };

        // Ship modification data
        const modificationData = this.scene.shipModificationSystem ? 
            this.scene.shipModificationSystem.getAllShipUpgrades() : {};

        // Faction data
        const factionData = this.scene.factionSystem ? 
            this.scene.factionSystem.getSaveData() : {};

        // Enemy data
        const enemyData = this.scene.enemySystem ? 
            this.scene.enemySystem.getSaveData() : {};

        // Game time data
        const gameData = {
            gameTime: Date.now(),
            enemySpawnTimer: this.scene.enemySpawnTimer || 0,
            lastEnemySpawn: this.scene.lastEnemySpawn || 0
        };

        return {
            version: '1.0',
            timestamp: Date.now(),
            playerShip: shipData,
            shipModifications: modificationData,
            factionData: factionData,
            enemyData: enemyData,
            gameData: gameData
        };
    }

    // Restore game state from save data
    restoreSaveData(saveData) {
        if (!saveData || !saveData.playerShip) {
            throw new Error('Invalid save data');
        }

        // Restore player ship
        this.restorePlayerShip(saveData.playerShip);

        // Restore ship modifications
        if (saveData.shipModifications && this.scene.shipModificationSystem) {
            this.scene.shipModificationSystem.restoreShipUpgrades(saveData.shipModifications);
        }

        // Restore faction data
        if (saveData.factionData && this.scene.factionSystem) {
            this.scene.factionSystem.restoreSaveData(saveData.factionData);
        }

        // Restore enemy data
        if (saveData.enemyData && this.scene.enemySystem) {
            this.scene.enemySystem.restoreSaveData(saveData.enemyData);
        }

        // Restore game data
        if (saveData.gameData) {
            this.scene.enemySpawnTimer = saveData.gameData.enemySpawnTimer || 0;
            this.scene.lastEnemySpawn = saveData.gameData.lastEnemySpawn || 0;
        }

        // Update UI
        if (this.scene.statsUI) {
            this.scene.statsUI.updateStats();
        }
    }

    // Restore player ship from save data
    restorePlayerShip(shipData) {
        const shipType = SHIP_TYPES[shipData.shipType];
        if (!shipType) {
            throw new Error(`Unknown ship type: ${shipData.shipType}`);
        }

        // Create new player ship
        const playerShip = this.scene.playerSystem.createPlayerShip(
            shipData.position.x,
            shipData.position.y,
            shipType
        );

        // Restore ship state
        playerShip.health = shipData.health;
        playerShip.crew = shipData.crew;
        playerShip.crewHealth = shipData.crewHealth;
        playerShip.sailIntegrity = shipData.sailIntegrity;
        playerShip.gold = shipData.gold;
        playerShip.tradeGoods = { ...shipData.tradeGoods };
        playerShip.ownedShips = [...shipData.ownedShips];
        playerShip.namedShips = { ...shipData.namedShips };
        playerShip.velocityX = shipData.velocity.x;
        playerShip.velocityY = shipData.velocity.y;
        playerShip.facingAngle = shipData.rotation;
        playerShip.immunityEndTime = shipData.immunityEndTime;

        // Update physics body
        if (playerShip.body) {
            playerShip.body.x = shipData.position.x;
            playerShip.body.y = shipData.position.y;
            playerShip.body.velocity.x = shipData.velocity.x;
            playerShip.body.velocity.y = shipData.velocity.y;
        }

        // Update sprite direction
        playerShip.updateSpriteDirection();

        console.log(`Player ship restored: ${shipData.shipType} at (${shipData.position.x}, ${shipData.position.y})`);
    }

    // Auto-save functionality
    updateAutoSave(time) {
        if (time - this.lastAutoSave > this.autoSaveInterval) {
            this.saveGame();
            this.lastAutoSave = time;
        }
    }

    // Quick save (F5 key)
    quickSave() {
        const success = this.saveGame();
        if (success) {
            this.showSaveMessage('Game Saved!');
        } else {
            this.showSaveMessage('Save Failed!', 'error');
        }
        return success;
    }

    
    // Show save/load message
    showSaveMessage(message, type = 'success') {
        if (!this.scene.saveMessageText) {
            this.scene.saveMessageText = this.scene.add.text(
                this.scene.cameras.main.width / 2,
                50,
                message,
                {
                    fontSize: '24px',
                    fontFamily: 'Arial',
                    color: type === 'success' ? '#00FF00' : '#FF0000',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        } else {
            this.scene.saveMessageText.setText(message);
            this.scene.saveMessageText.setColor(type === 'success' ? '#00FF00' : '#FF0000');
            this.scene.saveMessageText.setVisible(true);
        }

        // Hide message after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            if (this.scene.saveMessageText) {
                this.scene.saveMessageText.setVisible(false);
            }
        });
    }

    // Get save info for display
    getSaveInfo() {
        if (!this.hasSaveFile()) {
            return null;
        }

        try {
            const saveString = localStorage.getItem(this.saveKey);
            const saveData = JSON.parse(saveString);
            
            // Get ship type name for display
            const shipTypeKey = saveData.playerShip.shipType;
            const shipTypeName = SHIP_TYPES[shipTypeKey] ? SHIP_TYPES[shipTypeKey].name : shipTypeKey;
            
            return {
                version: saveData.version,
                timestamp: saveData.timestamp,
                date: new Date(saveData.timestamp).toLocaleString(),
                shipType: shipTypeName,
                gold: saveData.playerShip.gold,
                playTime: this.calculatePlayTime(saveData.timestamp)
            };
        } catch (error) {
            console.error('Failed to get save info:', error);
            return null;
        }
    }

    // Calculate play time from save timestamp
    calculatePlayTime(saveTimestamp) {
        const now = Date.now();
        const diff = now - saveTimestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
}
