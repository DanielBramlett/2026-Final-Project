export default class FactionSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentFaction = null;
        this.factions = {
            ENGLISH: {
                name: 'English',
                displayName: 'English Royal Navy',
                color: '#FF0000', // Red for English
                buffs: {
                    reloadSpeedMultiplier: 0.75, // 25% faster reload (lower cooldown)
                    speedMultiplier: 1.0, // No speed bonus
                    turnSpeedMultiplier: 1.0, // No turn speed bonus
                    damageMultiplier: 1.0, // No damage bonus
                    boardingDamageMultiplier: 1.0 // No boarding bonus
                },
                description: '25% faster cannon reload speed'
            },
            SPANISH: {
                name: 'Spanish',
                displayName: 'Spanish Armada',
                color: '#FFD700', // Gold for Spanish
                buffs: {
                    reloadSpeedMultiplier: 1.0, // No reload bonus
                    speedMultiplier: 1.0, // No speed bonus
                    turnSpeedMultiplier: 1.0, // No turn speed bonus
                    damageMultiplier: 1.1, // 10% damage increase
                    boardingDamageMultiplier: 1.0 // No boarding bonus
                },
                description: '10% increased cannon damage'
            },
            FRENCH: {
                name: 'French',
                displayName: 'French Navy',
                color: '#FFFFFF', // White for French
                buffs: {
                    reloadSpeedMultiplier: 1.0, // No reload bonus
                    speedMultiplier: 1.1, // 10% speed increase
                    turnSpeedMultiplier: 1.1, // 10% turn speed increase
                    damageMultiplier: 1.0, // No damage bonus
                    boardingDamageMultiplier: 1.0 // No boarding bonus
                },
                description: '10% faster ship movement and turn speed'
            },
            PIRATE: {
                name: 'Pirate',
                displayName: 'Pirate Brotherhood',
                color: '#000000', // Black for Pirates
                buffs: {
                    reloadSpeedMultiplier: 1.0, // No reload bonus
                    speedMultiplier: 1.0, // No speed bonus
                    turnSpeedMultiplier: 1.0, // No turn speed bonus
                    damageMultiplier: 1.0, // No damage bonus
                    boardingDamageMultiplier: 1.25 // 25% more boarding damage
                },
                description: '25% more damage during boarding actions'
            }
        };
    }

    setFaction(factionKey) {
        if (!this.factions[factionKey]) {
            console.error(`Invalid faction: ${factionKey}`);
            return false;
        }

        this.currentFaction = factionKey;
        const faction = this.factions[factionKey];
        console.log(`Faction set to: ${faction.displayName}`);
        console.log(`Active buffs: ${faction.description}`);
        
        // Apply faction-specific effects immediately
        this.applyFactionBuffs();
        
        return true;
    }

    getCurrentFaction() {
        return this.currentFaction ? this.factions[this.currentFaction] : null;
    }

    getFactionBuff(buffType) {
        if (!this.currentFaction) return 1.0; // Default multiplier
        
        const faction = this.factions[this.currentFaction];
        return faction.buffs[buffType] || 1.0;
    }

    applyFactionBuffs() {
        if (!this.currentFaction) return;

        const faction = this.factions[this.currentFaction];
        
        // Apply speed buff to player ship if French
        if (this.currentFaction === 'FRENCH' && this.scene.playerShip) {
            const originalSpeed = this.scene.playerShip.shipType.speed;
            this.scene.playerShip.speed = originalSpeed * faction.buffs.speedMultiplier;
            console.log(`French speed buff applied: ${originalSpeed} -> ${this.scene.playerShip.speed}`);
        }

        // Apply reload speed buff to combat system if English
        if (this.currentFaction === 'ENGLISH' && this.scene.combatSystem) {
            const baseFireRate = 1000; // Base fire rate in milliseconds
            const newFireRate = baseFireRate * faction.buffs.reloadSpeedMultiplier;
            this.scene.combatSystem.fireRate = newFireRate;
            console.log(`English reload buff applied: ${baseFireRate}ms -> ${newFireRate}ms`);
        }
    }

    // Calculate modified reload time based on faction
    getModifiedReloadTime(baseReloadTime) {
        const reloadMultiplier = this.getFactionBuff('reloadSpeedMultiplier');
        return baseReloadTime * reloadMultiplier;
    }

    // Calculate modified reload time for a specific faction object
    getModifiedReloadTimeForFaction(baseReloadTime, faction) {
        if (!faction || !faction.buffs) return baseReloadTime;
        const reloadMultiplier = faction.buffs.reloadSpeedMultiplier || 1.0;
        return baseReloadTime * reloadMultiplier;
    }

    // Calculate modified speed based on faction
    getModifiedSpeed(baseSpeed) {
        const speedMultiplier = this.getFactionBuff('speedMultiplier');
        return Math.round(baseSpeed * speedMultiplier);
    }

    // Calculate modified boarding damage based on faction
    getModifiedBoardingDamage(baseDamage) {
        const boardingMultiplier = this.getFactionBuff('boardingDamageMultiplier');
        return Math.floor(baseDamage * boardingMultiplier);
    }

    // Calculate boarding damage for a specific faction object
    getModifiedBoardingDamageForFaction(baseDamage, faction) {
        if (!faction || !faction.buffs) return baseDamage;
        const boardingMultiplier = faction.buffs.boardingDamageMultiplier || 1.0;
        return Math.floor(baseDamage * boardingMultiplier);
    }

    // Calculate modified turn speed based on faction
    getModifiedTurnSpeed(baseTurnSpeed) {
        const turnSpeedMultiplier = this.getFactionBuff('turnSpeedMultiplier');
        return Math.round(baseTurnSpeed * turnSpeedMultiplier);
    }

    // Calculate modified speed for a specific faction object
    getModifiedSpeedForFaction(baseSpeed, faction) {
        if (!faction || !faction.buffs) return baseSpeed;
        const speedMultiplier = faction.buffs.speedMultiplier || 1.0;
        return Math.round(baseSpeed * speedMultiplier);
    }

    // Calculate modified turn speed for a specific faction object
    getModifiedTurnSpeedForFaction(baseTurnSpeed, faction) {
        if (!faction || !faction.buffs) return baseTurnSpeed;
        const turnSpeedMultiplier = faction.buffs.turnSpeedMultiplier || 1.0;
        return Math.round(baseTurnSpeed * turnSpeedMultiplier);
    }

    // Calculate modified damage based on faction
    getModifiedDamage(baseDamage) {
        const damageMultiplier = this.getFactionBuff('damageMultiplier');
        return Math.round(baseDamage * damageMultiplier);
    }

    // Calculate damage for a specific faction object
    getModifiedDamageForFaction(baseDamage, faction) {
        if (!faction || !faction.buffs) return baseDamage;
        const damageMultiplier = faction.buffs.damageMultiplier || 1.0;
        return Math.round(baseDamage * damageMultiplier);
    }

    // Get all available factions for selection UI
    getAvailableFactions() {
        return Object.keys(this.factions).map(key => ({
            key,
            ...this.factions[key]
        }));
    }

    // Assign random faction to enemy ships
    assignRandomFaction() {
        const factionKeys = Object.keys(this.factions);
        const randomIndex = Math.floor(Math.random() * factionKeys.length);
        const randomFactionKey = factionKeys[randomIndex];
        return this.factions[randomFactionKey];
    }

    // Check if two ships are of the same faction
    areSameFaction(ship1, ship2) {
        // If either ship doesn't have faction info, they're not considered same faction
        if (!ship1 || !ship2) return false;
        
        let faction1, faction2;
        
        // Get faction for ship1
        if (ship1.isPlayer) {
            // Player ship uses current faction from faction system
            faction1 = this.getCurrentFaction();
        } else if (ship1.faction) {
            // Enemy ship has faction assigned directly
            faction1 = ship1.faction;
        }
        
        // Get faction for ship2
        if (ship2.isPlayer) {
            // Player ship uses current faction from faction system
            faction2 = this.getCurrentFaction();
        } else if (ship2.faction) {
            // Enemy ship has faction assigned directly
            faction2 = ship2.faction;
        }
        
        // Compare factions by name
        return faction1 && faction2 && faction1.name === faction2.name;
    }
    
    // Get faction for a specific ship
    getShipFaction(ship) {
        if (!ship) return null;
        
        if (ship.isPlayer) {
            return this.getCurrentFaction();
        } else if (ship.faction) {
            return ship.faction;
        }
        
        return null;
    }

    // Reset faction (useful for game restart)
    resetFaction() {
        this.currentFaction = null;
        console.log('Faction reset to none');
    }
}
