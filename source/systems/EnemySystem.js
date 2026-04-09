import Ship from '../entities/Ship.js';
import { SHIP_TYPES } from '../constants/shipTypes.js';

export default class EnemySystem {
    constructor(scene) {
        this.scene = scene;
        this.enemyShips = [];
        
        // AI Configuration
        this.detectionRange = 1200; // Distance at which enemies detect targets (increased from 800)
        this.fireRange = 600; // Maximum distance to fire cannons
        this.preferredDistance = 400; // Preferred distance to maintain from target
        this.fireRate = 1000; // Minimum time between shots (ms)
        this.lastFireTime = {}; // Track last fire time for each enemy
        this.angleThreshold = Math.PI / 6; // 30 degrees - acceptable angle to fire
        
        // Obstacle avoidance configuration
        this.obstacleDetectionRange = 500; // Range to detect obstacles (increased from 300)
        this.avoidanceStrength = 0.8; // Strength of avoidance steering (increased from 0.7)
        this.obstacleCheckAngles = 16; // Number of angles to check for obstacles (increased from 9)
    }

    createEnemyShips() {
        this.enemyShips = [];
        this.spawnEnemyShip(SHIP_TYPES.SLOOP);
        this.spawnEnemyShip(SHIP_TYPES.SLOOP);
        this.spawnEnemyShip(SHIP_TYPES.SLOOP);
        this.spawnEnemyShip(SHIP_TYPES.GALLEON);
        this.spawnEnemyShip(SHIP_TYPES.FIRST_RATE);
        this.spawnEnemyShip(SHIP_TYPES.DUKE_OF_KENT);
        return this.enemyShips;
    }

    spawnEnemyShip(shipType) {
        const minDistanceFromPlayer = (this.scene.playerShip.size / 2) + (shipType.size / 2) + 100; // Add 100px buffer
        let x, y, distanceFromPlayer, validPosition;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            validPosition = true;
            
            // Try to spawn in a random position around the player
            const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
            const spawnDistance = Phaser.Math.Between(minDistanceFromPlayer, 2000);
            
            x = this.scene.playerShip.x + Math.cos(angle) * spawnDistance;
            y = this.scene.playerShip.y + Math.sin(angle) * spawnDistance;
            
            // Calculate distance from player
            const dx = x - this.scene.playerShip.x;
            const dy = y - this.scene.playerShip.y;
            distanceFromPlayer = Math.sqrt(dx * dx + dy * dy);
            
            // Check if too close to player
            if (distanceFromPlayer < minDistanceFromPlayer) {
                validPosition = false;
            }
            
            // Check collision with islands
            for (const island of this.scene.islands) {
                const islandDx = x - island.x;
                const islandDy = y - island.y;
                const islandDistance = Math.sqrt(islandDx * islandDx + islandDy * islandDy);
                
                // Calculate minimum distance from island (island size + ship size + buffer)
                const islandRadius = Math.max(island.displayWidth, island.displayHeight) / 2;
                const shipRadius = shipType.size / 2;
                const minIslandDistance = islandRadius + shipRadius + 50; // 50px buffer
                
                if (islandDistance < minIslandDistance) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check collision with ports
            if (validPosition) {
                for (const port of this.scene.ports) {
                    const portDx = x - port.x;
                    const portDy = y - port.y;
                    const portDistance = Math.sqrt(portDx * portDx + portDy * portDy);
                    
                    // Calculate minimum distance from port (port size + ship size + buffer)
                    const portRadius = Math.max(port.displayWidth, port.displayHeight) / 2;
                    const shipRadius = shipType.size / 2;
                    const minPortDistance = portRadius + shipRadius + 100; // 100px buffer
                    
                    if (portDistance < minPortDistance) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            // Check collision with existing enemy ships
            if (validPosition) {
                for (const existingShip of this.enemyShips) {
                    const shipDx = x - existingShip.x;
                    const shipDy = y - existingShip.y;
                    const shipDistance = Math.sqrt(shipDx * shipDx + shipDy * shipDy);
                    
                    // Calculate minimum distance from existing ship (both ship sizes + buffer)
                    const existingShipRadius = existingShip.size / 2;
                    const newShipRadius = shipType.size / 2;
                    const minShipDistance = existingShipRadius + newShipRadius + 100; // 100px buffer
                    
                    if (shipDistance < minShipDistance) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            attempts++;
        } while (!validPosition && attempts < maxAttempts);
        
        // Create the enemy ship at the valid position
        const enemyShip = new Ship(this.scene, x, y, shipType);
        
        // Assign random faction to enemy ship
        if (this.scene.factionSystem) {
            enemyShip.faction = this.scene.factionSystem.assignRandomFaction();
            console.log(`Enemy ship assigned faction: ${enemyShip.faction.displayName}`);
            
            // Apply faction buffs to enemy ship using their assigned faction
            const modifiedSpeed = this.scene.factionSystem.getModifiedSpeedForFaction(shipType.speed, enemyShip.faction);
            const modifiedTurnSpeed = this.scene.factionSystem.getModifiedTurnSpeedForFaction(shipType.turnSpeed, enemyShip.faction);
            
            enemyShip.speed = modifiedSpeed;
            enemyShip.turnSpeed = modifiedTurnSpeed;
            
            console.log(`Applied ${enemyShip.faction.displayName} faction buffs to enemy ship: speed ${shipType.speed} -> ${modifiedSpeed}, turnSpeed ${shipType.turnSpeed} -> ${modifiedTurnSpeed}`);
        }
        
        // Initialize enemy ship with ammo
        enemyShip.tradeGoods.cannonballs = 50;
        enemyShip.tradeGoods.chainshot = 20;
        enemyShip.tradeGoods.grapeshot = 30;
        
        // Generate random gold capped at maxCargo
        const maxCargo = shipType.cargoMax;
        const minGold = Math.floor(maxCargo * 0.1); // 10% of max cargo as minimum
        const maxGold = maxCargo; // Cap at max cargo
        const randomGold = Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;
        enemyShip.gold = randomGold;
        
        console.log(`Enemy ${enemyShip.shipType.name} spawned with ${enemyShip.gold} gold (cargo capacity: ${maxCargo})`);
        
        // Mark as enemy ship
        enemyShip.isPlayer = false;
        
        this.enemyShips.push(enemyShip);
        return enemyShip;
    }

    findClosestTarget(enemyShip) {
        let closestTarget = null;
        let closestDistance = Infinity;
        
        // Check player ship
        if (this.scene.playerShip && !this.scene.playerShip.destroyed) {
            // Skip if same faction (faction-based targeting)
            if (!this.scene.factionSystem || !this.scene.factionSystem.areSameFaction(enemyShip, this.scene.playerShip)) {
                const dx = this.scene.playerShip.x - enemyShip.x;
                const dy = this.scene.playerShip.y - enemyShip.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < closestDistance && distance <= this.detectionRange) {
                    closestDistance = distance;
                    closestTarget = this.scene.playerShip;
                }
            } else {
                // Same faction - skip targeting
                const enemyFaction = this.scene.factionSystem.getShipFaction(enemyShip);
                const playerFaction = this.scene.factionSystem.getShipFaction(this.scene.playerShip);
            }
        }
        
        // Check other enemy ships (for potential friendly fire or targeting)
        for (const otherEnemy of this.enemyShips) {
            if (otherEnemy !== enemyShip && !otherEnemy.destroyed) {
                // Skip if same faction (faction-based targeting)
                if (!this.scene.factionSystem || !this.scene.factionSystem.areSameFaction(enemyShip, otherEnemy)) {
                    const dx = otherEnemy.x - enemyShip.x;
                    const dy = otherEnemy.y - enemyShip.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < closestDistance && distance <= this.detectionRange) {
                        closestDistance = distance;
                        closestTarget = otherEnemy;
                    }
                } else {
                    // Same faction - skip targeting
                    const enemyFaction = this.scene.factionSystem.getShipFaction(enemyShip);
                    const otherFaction = this.scene.factionSystem.getShipFaction(otherEnemy);
                }
            }
        }
        
        return { target: closestTarget, distance: closestDistance };
    }

    checkObstacleAtPosition(ship, x, y, checkRange = 150) {
        // Check if position would collide with islands
        for (const island of this.scene.islands) {
            const dx = x - island.x;
            const dy = y - island.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const islandRadius = Math.max(island.displayWidth, island.displayHeight) / 2;
            const shipRadius = ship.size / 2;
            const minDistance = islandRadius + shipRadius + checkRange;
            
            if (distance < minDistance) {
                return { type: 'island', object: island, distance: distance, minDistance: minDistance };
            }
        }
        
        // Check if position would collide with ports
        for (const port of this.scene.ports) {
            const dx = x - port.x;
            const dy = y - port.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const portRadius = Math.max(port.displayWidth, port.displayHeight) / 2;
            const shipRadius = ship.size / 2;
            const minDistance = portRadius + shipRadius + checkRange;
            
            if (distance < minDistance) {
                return { type: 'port', object: port, distance: distance, minDistance: minDistance };
            }
        }
        
        return null;
    }

    getAvoidanceVector(ship) {
        let avoidanceX = 0;
        let avoidanceY = 0;
        let obstaclesFound = 0;
        
        // Check multiple angles around the ship for obstacles
        for (let i = 0; i < this.obstacleCheckAngles; i++) {
            const angle = (i / (this.obstacleCheckAngles - 1)) * Math.PI * 2; // 0 to 2π
            const checkDistance = this.obstacleDetectionRange;
            
            const checkX = ship.x + Math.cos(angle) * checkDistance;
            const checkY = ship.y + Math.sin(angle) * checkDistance;
            
            const obstacle = this.checkObstacleAtPosition(ship, checkX, checkY, 100);
            
            if (obstacle) {
                obstaclesFound++;
                
                // Calculate avoidance vector (away from obstacle)
                const avoidAngle = Math.atan2(ship.y - obstacle.object.y, ship.x - obstacle.object.x);
                const avoidStrength = 1 - (obstacle.distance / obstacle.minDistance); // Stronger when closer
                
                avoidanceX += Math.cos(avoidAngle) * avoidStrength * this.avoidanceStrength;
                avoidanceY += Math.sin(avoidAngle) * avoidStrength * this.avoidanceStrength;
            }
        }
        
        if (obstaclesFound > 0) {
            // Normalize the avoidance vector
            const magnitude = Math.sqrt(avoidanceX * avoidanceX + avoidanceY * avoidanceY);
            if (magnitude > 0) {
                avoidanceX /= magnitude;
                avoidanceY /= magnitude;
            }
            
            return { x: avoidanceX, y: avoidanceY, hasObstacle: true };
        }
        
        return { x: 0, y: 0, hasObstacle: false };
    }

    getSafeMovementDirection(ship, targetX, targetY) {
        const avoidance = this.getAvoidanceVector(ship);
        
        if (!avoidance.hasObstacle) {
            // No obstacles, move directly toward target
            const dx = targetX - ship.x;
            const dy = targetY - ship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                return { x: dx / distance, y: dy / distance, hasObstacle: false };
            }
        }
        
        // Blend target direction with avoidance vector
        const targetDx = targetX - ship.x;
        const targetDy = targetY - ship.y;
        const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
        
        let targetDirX = 0;
        let targetDirY = 0;
        
        if (targetDistance > 0) {
            targetDirX = targetDx / targetDistance;
            targetDirY = targetDy / targetDistance;
        }
        
        // Weight the blend: 40% target, 60% avoidance when obstacles detected (more aggressive avoidance)
        const targetWeight = avoidance.hasObstacle ? 0.4 : 1.0;
        const avoidanceWeight = avoidance.hasObstacle ? 0.6 : 0.0;
        
        const blendedX = (targetDirX * targetWeight) + (avoidance.x * avoidanceWeight);
        const blendedY = (targetDirY * targetWeight) + (avoidance.y * avoidanceWeight);
        
        // Normalize the result
        const magnitude = Math.sqrt(blendedX * blendedX + blendedY * blendedY);
        if (magnitude > 0) {
            return { 
                x: blendedX / magnitude, 
                y: blendedY / magnitude, 
                hasObstacle: avoidance.hasObstacle 
            };
        }
        
        return { x: 0, y: 0, hasObstacle: avoidance.hasObstacle };
    }

    shouldFire(enemyShip, target, distance) {
        // Check if target is within fire range
        if (distance > this.fireRange) {
            return false;
        }
        
        // Check fire rate cooldown with faction-specific fire rate
        const enemyId = enemyShip.id || `enemy_${this.enemyShips.indexOf(enemyShip)}`;
        const currentTime = Date.now();
        
        // Calculate fire rate based on enemy's faction
        let fireRate = this.fireRate; // Base fire rate (2000ms)
        if (this.scene.factionSystem && enemyShip.faction) {
            fireRate = this.scene.factionSystem.getModifiedReloadTimeForFaction(this.fireRate, enemyShip.faction);
            if (fireRate !== this.fireRate) {
                console.log(`🔥 ${enemyShip.faction.displayName} enemy fire rate: ${this.fireRate}ms -> ${fireRate}ms`);
            }
        }
        
        if (this.lastFireTime[enemyId] && currentTime - this.lastFireTime[enemyId] < fireRate) {
            return false;
        }
        
        // Check if enemy has ammo
        if (!enemyShip.canFireCannons()) {
            return false;
        }
        
        // Calculate angle to target
        const dx = target.x - enemyShip.x;
        const dy = target.y - enemyShip.y;
        const angleToTarget = Math.atan2(dy, dx);
        
        // For broadside firing, enemy needs to be perpendicular to target
        // Add 90 degrees so they face sideways toward target
        const broadsideAngle = angleToTarget + Math.PI / 2;
        
        // Calculate angle difference (normalized to -PI to PI)
        let angleDiff = broadsideAngle - enemyShip.facingAngle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Check if target is within acceptable angle threshold
        if (Math.abs(angleDiff) > this.angleThreshold) {
            return false;
        }
        
        return true;
    }

    updateEnemyAI(enemyShip, time, delta) {
        // Skip AI for destroyed ships
        if (enemyShip.destroyed) {
            return;
        }
        
        // Find closest target
        const { target, distance } = this.findClosestTarget(enemyShip);
        
        if (!target) {
            // No target found, stop rotating and apply deceleration
            enemyShip.stopRotation();
            enemyShip.applyDeceleration();
            return;
        }
        
        // Calculate angle to target
        const dx = target.x - enemyShip.x;
        const dy = target.y - enemyShip.y;
        const angleToTarget = Math.atan2(dy, dx);
        
        // For broadside firing, enemy needs to be perpendicular to target
        // Add 90 degrees so they face sideways toward target
        const broadsideAngle = angleToTarget + Math.PI / 2;
        
        // Calculate angle difference (normalized to -PI to PI)
        let angleDiff = broadsideAngle - enemyShip.facingAngle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Rotate towards target
        if (angleDiff > 0.1) {
            enemyShip.rotateRight();
        } else if (angleDiff < -0.1) {
            enemyShip.rotateLeft();
        } else {
            enemyShip.stopRotation();
        }
        
        // Enhanced movement logic with obstacle avoidance
        if (Math.abs(angleDiff) < Math.PI / 3) { // Only move if roughly facing target
            // Get safe movement direction that avoids obstacles
            const safeDirection = this.getSafeMovementDirection(enemyShip, target.x, target.y);
            
            if (safeDirection.hasObstacle) {
                // Obstacles detected - use blended direction
                const desiredAngle = Math.atan2(safeDirection.y, safeDirection.x);
                const movementAngleDiff = desiredAngle - enemyShip.facingAngle;
                
                // Adjust rotation to align with safe direction
                if (movementAngleDiff > 0.2) {
                    enemyShip.rotateRight();
                } else if (movementAngleDiff < -0.2) {
                    enemyShip.rotateLeft();
                }
                
                // Move forward cautiously when avoiding obstacles
                if (Math.abs(movementAngleDiff) < Math.PI / 4) {
                    enemyShip.moveForward();
                } else {
                    enemyShip.applyDeceleration();
                }
            } else {
                // No obstacles, use original movement logic
                if (distance > this.preferredDistance + 50) {
                    // Too far - move forward
                    enemyShip.moveForward();
                } else if (distance < this.preferredDistance - 50) {
                    // Too close - move backward
                    enemyShip.moveBackward();
                } else {
                    // Good distance - apply deceleration
                    enemyShip.applyDeceleration();
                }
            }
        } else {
            // Not facing target - apply deceleration
            enemyShip.applyDeceleration();
        }
        
        // Check if should fire (only if not actively avoiding major obstacles)
        const avoidance = this.getAvoidanceVector(enemyShip);
        if (!avoidance.hasObstacle || avoidance.hasObstacle && this.shouldFireWhileAvoiding(enemyShip, target, distance)) {
            if (this.shouldFire(enemyShip, target, distance)) {
                // Select ammo type based on target and situation
                let selectedAmmo = 'cannonballs'; // Default
                
                if (target.isPlayer) {
                    // Prioritize different ammo types based on player ship status
                    if (target.sailIntegrity < target.maxSailIntegrity * 0.5) {
                        selectedAmmo = 'chainshot'; // Target damaged sails
                    } else if (target.crewHealth < target.maxCrewHealth * 0.5) {
                        selectedAmmo = 'grapeshot'; // Target damaged crew
                    }
                }
                
                // Set selected ammo and fire
                this.scene.combatSystem.setSelectedAmmo(selectedAmmo);
                
                // Determine which side to fire from
                let fireSide;
                if (angleDiff > 0) {
                    // Target to the right, fire right side
                    fireSide = 'right';
                } else {
                    // Target to the left, fire left side
                    fireSide = 'left';
                }
                
                const fired = this.scene.combatSystem.fireCannon(enemyShip, fireSide);
                
                if (fired) {
                    // Update last fire time
                    const enemyId = enemyShip.id || `enemy_${this.enemyShips.indexOf(enemyShip)}`;
                    this.lastFireTime[enemyId] = Date.now();
                    
                    console.log(`🎯 Enemy ${enemyShip.shipType.name} fired ${selectedAmmo} at ${target.shipType.name || 'player'}`);
                }
            }
        }
        
        // Check if should attempt boarding
        if (this.shouldAttemptBoarding(enemyShip, target, distance)) {
            const boardingSuccess = this.scene.combatSystem.initiateBoarding(enemyShip, target);
            if (boardingSuccess) {
                console.log(`🔪 Enemy ${enemyShip.shipType.name} attempted boarding on player!`);
            }
        }
    }
    
    shouldAttemptBoarding(enemyShip, target, distance) {
        // Only board player ships
        if (!target.isPlayer) {
            return false;
        }
        
        // Skip if same faction (faction-based targeting)
        if (this.scene.factionSystem && this.scene.factionSystem.areSameFaction(enemyShip, target)) {
            const enemyFaction = this.scene.factionSystem.getShipFaction(enemyShip);
            const playerFaction = this.scene.factionSystem.getShipFaction(target);
            console.log(` diplomacy boarding: Enemy ${enemyShip.shipType.name} (${enemyFaction?.displayName}) avoiding boarding player ${target.shipType.name} (${playerFaction?.displayName}) - same faction`);
            return false;
        }
        
        // Check if close enough for boarding
        const boardingDistance = (enemyShip.size / 2) + (target.size / 2) + 100;
        if (distance > boardingDistance) {
            return false;
        }
        
        // Check if enemy has enough crew (at least 50% of max crew)
        if (enemyShip.crew < enemyShip.crewMax * 0.5) {
            return false;
        }
        
        // Check if player is weakened (low crew or health)
        const playerWeakened = target.crewHealth < target.maxCrewHealth * 0.4 || 
                              target.health < target.maxHealth * 0.3;
        
        // Board if player is weakened or if enemy has significantly more crew
        const crewAdvantage = enemyShip.crew > target.crew * 1.5;
        
        // Random factor - not all enemies will attempt boarding even when conditions are met
        const boardingChance = playerWeakened ? 0.7 : (crewAdvantage ? 0.4 : 0.1);
        
        return Math.random() < boardingChance;
    }
    
    shouldFireWhileAvoiding(enemyShip, target, distance) {
        // Only fire while avoiding if target is very close and good firing opportunity
        if (distance < this.fireRange * 0.7) {
            // Check if we have a reasonably clear shot
            const dx = target.x - enemyShip.x;
            const dy = target.y - enemyShip.y;
            const angleToTarget = Math.atan2(dy, dx);
            const broadsideAngle = angleToTarget + Math.PI / 2;
            
            let angleDiff = broadsideAngle - enemyShip.facingAngle;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Fire if angle is good and we're not too close to obstacles
            return Math.abs(angleDiff) < this.angleThreshold * 0.5; // Stricter angle requirement while avoiding
        }
        
        return false;
    }

    setupCollisions() {
        // Enemy ship collisions with islands
        this.enemyShips.forEach(ship => {
            this.scene.physics.add.overlap(ship, this.scene.islands, this.scene.handleShipCollision, null, this.scene);
            this.scene.physics.add.overlap(ship, this.scene.ports, this.scene.handleShipCollision, null, this.scene);
        });
        
        // Enemy ship to enemy ship collisions with size-based physics
        for (let i = 0; i < this.enemyShips.length; i++) {
            for (let j = i + 1; j < this.enemyShips.length; j++) {
                this.scene.physics.add.overlap(this.enemyShips[i], this.enemyShips[j], this.scene.handleShipCollision, null, this.scene);
            }
        }
    }

    update(time, delta) {
        // Update each enemy ship's basic movement and physics
        this.enemyShips.forEach(ship => ship.update(time, delta));
        
        // Update AI for each enemy ship
        this.enemyShips.forEach(enemyShip => {
            this.updateEnemyAI(enemyShip, time, delta);
        });
    }
}
