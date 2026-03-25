import Ship from '../entities/Ship.js';
import { SHIP_TYPES } from '../constants/shipTypes.js';
import WindSystem from '../systems/WindSystem.js'; 
import { Obstacle } from '../systems/Obstacle.js';
import { Port } from '../systems/Port.js';
import PlayerSystem from '../systems/PlayerSystem.js';
import EnemySystem from '../systems/EnemySystem.js';
import CombatSystem from '../systems/CombatSystem.js';
import AmmoUI from '../systems/AmmoUI.js';
import StatsUI from '../systems/StatsUI.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Load assets here
        this.load.image('Sloop_East', 'assets/Sloop_East.png');
        this.load.image('Sloop_West', 'assets/Sloop_West.png');
        this.load.image('Brigantine_East', 'assets/Brigantine_East.png')
        this.load.image('Brigantine_West', 'assets/Brigantine_West.png')
        this.load.image('Clipper_East', 'assets/Clipper_East.png')
        this.load.image('Clipper_West', 'assets/Clipper_West.png')
        this.load.image('Frigate_East', 'assets/Frigate_East.png')
        this.load.image('Frigate_West', 'assets/Frigate_West.png')
        this.load.image('Sloop_of_War_East', 'assets/Sloop_of_War_East.png')
        this.load.image('Sloop_of_War_West', 'assets/Sloop_of_War_West.png')
        this.load.image('Galleon_East', 'assets/Galleon_East.png')
        this.load.image('Galleon_West', 'assets/Galleon_West.png')
        this.load.image('Galley_East_1', 'assets/Galley_East_1.png')
        this.load.image('Galley_East_2', 'assets/Galley_East_2.png')
        this.load.image('Galley_East_3', 'assets/Galley_East_3.png')
        this.load.image('Galley_West_1', 'assets/Galley_West_1.png')
        this.load.image('Galley_West_2', 'assets/Galley_West_2.png')
        this.load.image('Galley_West_3', 'assets/Galley_West_3.png')
        this.load.image('First_Rate_East', 'assets/First_Rate_East.png')
        this.load.image('First_Rate_West', 'assets/First_Rate_West.png')
        this.load.image('Duke_of_Kent_East', 'assets/Duke_of_Kent_East.png')
        this.load.image('Duke_of_Kent_West', 'assets/Duke_of_Kent_West.png')
        this.load.image('Ketch_East', 'assets/Ketch_East.png')
        this.load.image('Ketch_West', 'assets/Ketch_West.png')
        this.load.image('Schooner_East', 'assets/Schooner_East.png')
        this.load.image('Schooner_West', 'assets/Schooner_West.png')
        this.load.image('Caravel_East', 'assets/Caravel_East.png')
        this.load.image('Caravel_West', 'assets/Caravel_West.png')
        this.load.image('Cutter_East', 'assets/Cutter_East.png')
        this.load.image('Cutter_West', 'assets/Cutter_West.png')
        this.load.image('Barque_East', 'assets/Barque_East.png')
        this.load.image('Barque_West', 'assets/Barque_West.png')
        this.load.image('Brig_East', 'assets/Brig_East.png')
        this.load.image('Brig_West', 'assets/Brig_West.png')
        this.load.image('Xebec_East', 'assets/Xebec_East.png')
        this.load.image('Xebec_West', 'assets/Xebec_West.png')
        this.load.image('Carrack_East', 'assets/Carrack_East.png')
        this.load.image('Carrack_West', 'assets/Carrack_West.png')
        this.load.image('Barquentine_East', 'assets/Barquentine_East.png')
        this.load.image('Barquentine_West', 'assets/Barquentine_West.png')
        this.load.image('Island', 'assets/Island.png');
        this.load.image('Light_Galley_East_1', 'assets/Light_Galley_East_1.png');
        this.load.image('Light_Galley_West_1', 'assets/Light_Galley_West_1.png');
        this.load.image('Light_Galley_East_1', 'assets/Light_Galley_East_1.png');
        this.load.image('Light_Galley_West_1', 'assets/Light_Galley_West_1.png');
        this.load.image('Light_Galley_East_2', 'assets/Light_Galley_East_2.png');
        this.load.image('Light_Galley_West_2', 'assets/Light_Galley_West_2.png');
        this.load.image('Light_Galley_East_3', 'assets/Light_Galley_East_3.png');
        this.load.image('Light_Galley_West_3', 'assets/Light_Galley_West_3.png');
        this.load.image('Galloit_East_1', 'assets/Galloit_East_1.png');
        this.load.image('Galloit_West_1', 'assets/Galloit_West_1.png');
        this.load.image('Galloit_East_2', 'assets/Galloit_East_2.png');
        this.load.image('Galloit_West_2', 'assets/Galloit_West_2.png');
        this.load.image('Galloit_East_3', 'assets/Galloit_East_3.png');
        this.load.image('Galloit_West_3', 'assets/Galloit_West_3.png');
        this.load.image('Galleass_East_1', 'assets/Galleass_East_1.png');
        this.load.image('Galleass_West_1', 'assets/Galleass_West_1.png');
        this.load.image('Galleass_East_2', 'assets/Galleass_East_2.png');
        this.load.image('Galleass_West_2', 'assets/Galleass_West_2.png');
        this.load.image('Galleass_East_3', 'assets/Galleass_East_3.png');
        this.load.image('Galleass_West_3', 'assets/Galleass_West_3.png');
        this.load.image('Fourth_Rate_East', 'assets/Fourth_Rate_East.png');
        this.load.image('Fourth_Rate_West', 'assets/Fourth_Rate_West.png');
        this.load.image('Third_Rate_East', 'assets/Third_Rate_East.png');
        this.load.image('Third_Rate_West', 'assets/Third_Rate_West.png');
        this.load.image('Second_Rate_East', 'assets/Second_Rate_East.png');
        this.load.image('Second_Rate_West', 'assets/Second_Rate_West.png');
        this.load.image('Port', 'assets/Port.png');
        this.load.image('Cannonball', 'assets/Cannonball.png');
        this.load.image('Chainshot', 'assets/Chainshot.png');
        this.load.image('Grapeshot', 'assets/Grapeshot.png');
        this.load.image('HMS_Victory_East', 'assets/HMS_Victory_East.png');
        this.load.image('HMS_Victory_West', 'assets/HMS_Victory_West.png');
        this.load.image('Santísima_Trinidad_East', 'assets/Santísima_Trinidad_East.png');
        this.load.image('Santísima_Trinidad_West', 'assets/Santísima_Trinidad_West.png');
        this.load.image('Orient_East', 'assets/Orient_East.png');
        this.load.image('Orient_West', 'assets/Orient_West.png');
        // this.load.image('Urca_da_Lima_East', 'assets/Urca_da_Lima_East.png');
        // this.load.image('Urca_da_Lima_West', 'assets/Urca_da_Lima_West.png');
        this.load.audio('cannon_shot_1', 'assets/Cannon_Shot_1.mp3');
        this.load.audio('cannon_shot_2', 'assets/Cannon_Shot_2.mp3');
        this.load.audio('rowing', 'assets/Rowing.mp3');
        this.load.audio('sails', 'assets/Sails.mp3');
        this.load.audio('wood_breaking', 'assets/Wood_Breaking.mp3');
        this.load.audio('anchor', 'assets/Anchor.mp3');
        this.load.audio('Ship_Creaking', 'assets/Ship_Creaking.mp3')
        //Songs
        this.load.audio('Raise_the_Sails', 'assets/sergepavkinmusic-raise-the-sails-152124.mp3');
        this.load.audio('Pirate_Adventure', 'assets/ebunny-pirate-adventure-361663.mp3');
        this.load.audio('Epic_Pirate_Adventure', 'assets/arthurhale-epic-pirate-adventure-song-x27seawardx27-359540.mp3')
    }

    create() {
        this.cameras.main.setBackgroundColor('#02468b');
        
        // Initialize sound system
        this.shipCreakingTimer = 0;
        this.shipCreakingDelay = 3000; // 3 seconds base delay
        this.lastRowingFrame = null;
        this.rowingSoundTimer = 0;
        this.rowingSoundDelay = 750; // 750ms delay between rowing sounds
        
        // Initialize background music system
        this.songs = ['Raise_the_Sails', 'Pirate_Adventure', 'Epic_Pirate_Adventure'];
        this.songDurations = {
            'Raise_the_Sails': 103, // 1:43 = 103 seconds
            'Pirate_Adventure': 194, // 3:14 = 194 seconds  
            'Epic_Pirate_Adventure': 137 // 2:17 = 137 seconds
        };
        this.currentSongIndex = 0;
        this.songTimer = 0;
        this.songDelay = 60000; // 1 minute between songs
        this.currentBackgroundMusic = null;
        
        // Enable physics with arcade mode
        this.physics.world.setBounds(0, 0, 20000, 10000);

        this.windSystem = new WindSystem(this, 20000); // Change wind every 20 seconds

        // Initialize player and enemy systems
        this.playerSystem = new PlayerSystem(this);
        this.enemySystem = new EnemySystem(this);
        
        // Initialize combat system
        this.combatSystem = new CombatSystem(this);

        // Create player ship
        this.playerShip = this.playerSystem.createPlayerShip(
            8000,
            5000,
            SHIP_TYPES.SLOOP,
        );

        this.islands = [];
        // Caribbean Islands (south-west region)
        this.islands.push(new Obstacle(this, 1600, 7000, 350, 350, 'Island'));
        this.islands.push(new Obstacle(this, 2400, 7600, 280, 280, 'Island'));
        this.islands.push(new Obstacle(this, 1200, 8000, 250, 250, 'Island'));
        this.islands.push(new Obstacle(this, 3000, 8400, 300, 300, 'Island'));
        
        // Bermuda Triangle (north-west region)
        this.islands.push(new Obstacle(this, 2000, 1600, 400, 400, 'Island'));
        this.islands.push(new Obstacle(this, 3600, 1200, 320, 320, 'Island'));
        this.islands.push(new Obstacle(this, 2800, 2200, 280, 280, 'Island'));
        
        // Bahamas Chain (central-west)
        this.islands.push(new Obstacle(this, 4400, 4000, 300, 300, 'Island'));
        this.islands.push(new Obstacle(this, 5000, 3600, 250, 250, 'Island'));
        this.islands.push(new Obstacle(this, 5600, 4400, 280, 280, 'Island'));
        
        // Greater Antilles (central region)
        this.islands.push(new Obstacle(this, 7000, 5000, 450, 450, 'Island'));
        this.islands.push(new Obstacle(this, 8000, 5600, 380, 380, 'Island'));
        this.islands.push(new Obstacle(this, 7600, 6400, 350, 350, 'Island'));
        
        // Leeward Islands (north-central)
        this.islands.push(new Obstacle(this, 9000, 3000, 300, 300, 'Island'));
        this.islands.push(new Obstacle(this, 9600, 3600, 280, 280, 'Island'));
        this.islands.push(new Obstacle(this, 10400, 3200, 320, 320, 'Island'));
        
        // Windward Islands (north-east)
        this.islands.push(new Obstacle(this, 11600, 2400, 350, 350, 'Island'));
        this.islands.push(new Obstacle(this, 12400, 2800, 300, 300, 'Island'));
        this.islands.push(new Obstacle(this, 13000, 2000, 280, 280, 'Island'));
        
        // South American Coast (south-east)
        this.islands.push(new Obstacle(this, 14000, 8000, 400, 400, 'Island'));
        this.islands.push(new Obstacle(this, 15000, 7600, 350, 350, 'Island'));
        this.islands.push(new Obstacle(this, 14400, 8800, 300, 300, 'Island'));
        
        // Central American Coast (south)
        this.islands.push(new Obstacle(this, 10000, 9000, 380, 380, 'Island'));
        this.islands.push(new Obstacle(this, 11000, 9400, 320, 320, 'Island'));
        
        // Florida Keys (north)
        this.islands.push(new Obstacle(this, 6000, 800, 250, 250, 'Island'));
        this.islands.push(new Obstacle(this, 6600, 1200, 280, 280, 'Island'));
        this.islands.push(new Obstacle(this, 5400, 1000, 220, 220, 'Island'));
        
        // Yucatan Peninsula (west)
        this.islands.push(new Obstacle(this, 3600, 5600, 420, 420, 'Island'));
        this.islands.push(new Obstacle(this, 3000, 6200, 350, 350, 'Island'));
        
        // Lesser Antilles (far east)
        this.islands.push(new Obstacle(this, 17000, 4000, 300, 300, 'Island'));
        this.islands.push(new Obstacle(this, 17600, 4600, 280, 280, 'Island'));
        this.islands.push(new Obstacle(this, 16400, 5000, 320, 320, 'Island'));
        
        // Isolated Islands (scattered)
        this.islands.push(new Obstacle(this, 13000, 7000, 280, 280, 'Island'));
        this.islands.push(new Obstacle(this, 15600, 2400, 300, 300, 'Island'));
        this.islands.push(new Obstacle(this, 8400, 1600, 250, 250, 'Island'));

        // Create ports
        this.ports = [];
        
        // Caribbean Ports (south-west region)
        this.ports.push(new Port(this, 1800, 7200, 250, 200, 'Port', 'Port-au-Prince', 'caribbean'));
        this.ports.push(new Port(this, 2600, 7800, 250, 200, 'Port', 'Santo Domingo', 'caribbean'));
        this.ports.push(new Port(this, 1400, 8200, 250, 200, 'Port', 'Cartagena', 'caribbean'));
        
        // Bermuda Triangle Ports (north-west region)
        this.ports.push(new Port(this, 2200, 1800, 250, 200, 'Port', 'Bermuda', 'bermuda'));
        this.ports.push(new Port(this, 3400, 1400, 250, 200, 'Port', 'St. George', 'bermuda'));
        
        // Bahamas Ports (central-west)
        this.ports.push(new Port(this, 4600, 4200, 250, 200, 'Port', 'Nassau', 'bahamas'));
        this.ports.push(new Port(this, 5200, 3800, 250, 200, 'Port', 'Freeport', 'bahamas'));
        
        // Greater Antilles Ports (central region)
        this.ports.push(new Port(this, 7200, 5200, 250, 200, 'Port', 'Kingston', 'greater_antilles'));
        this.ports.push(new Port(this, 8200, 5800, 250, 200, 'Port', 'Santiago', 'greater_antilles'));
        this.ports.push(new Port(this, 7800, 6600, 250, 200, 'Port', 'Port Royal', 'greater_antilles'));
        
        // Leeward Islands Ports (north-central)
        this.ports.push(new Port(this, 9200, 3200, 250, 200, 'Port', 'Antigua', 'leeward_islands'));
        this.ports.push(new Port(this, 9800, 3800, 250, 200, 'Port', 'St. Kitts', 'leeward_islands'));
        
        // Windward Islands Ports (north-east)
        this.ports.push(new Port(this, 11800, 2600, 250, 200, 'Port', 'Martinique', 'windward_islands'));
        this.ports.push(new Port(this, 12600, 3000, 250, 200, 'Port', 'St. Lucia', 'windward_islands'));
        this.ports.push(new Port(this, 13200, 2200, 250, 200, 'Port', 'Barbados', 'windward_islands'));
        
        // South American Coast Ports (south-east)
        this.ports.push(new Port(this, 14200, 8200, 250, 200, 'Port', 'Maracaibo', 'south_america'));
        this.ports.push(new Port(this, 15200, 7800, 250, 200, 'Port', 'Caracas', 'south_america'));
        
        // Central American Coast Ports (south)
        this.ports.push(new Port(this, 10200, 9200, 250, 200, 'Port', 'Veracruz', 'central_america'));
        this.ports.push(new Port(this, 11200, 9600, 250, 200, 'Port', 'Campeche', 'central_america'));
        
        // Florida Ports (north)
        this.ports.push(new Port(this, 6200, 1000, 250, 200, 'Port', 'Key West', 'florida'));
        this.ports.push(new Port(this, 6800, 1400, 250, 200, 'Port', 'Tampa', 'florida'));
        
        // Yucatan Ports (west)
        this.ports.push(new Port(this, 3800, 5800, 250, 200, 'Port', 'Merida', 'yucatan'));
        
        // Lesser Antilles Ports (far east)
        this.ports.push(new Port(this, 17200, 4200, 250, 200, 'Port', 'Trinidad', 'lesser_antilles'));
        this.ports.push(new Port(this, 16600, 5200, 250, 200, 'Port', 'Grenada', 'lesser_antilles'));
        
        // Isolated Island Ports
        this.ports.push(new Port(this, 13400, 7200, 250, 200, 'Port', 'Curacao', 'lesser_antilles'));
        this.ports.push(new Port(this, 15800, 2600, 250, 200, 'Port', 'Aruba', 'lesser_antilles'));
        this.ports.push(new Port(this, 8600, 1800, 250, 200, 'Port', 'Turks Islands', 'bermuda'));

        // Create some enemy ships after islands are created
        this.enemyShips = this.enemySystem.createEnemyShips();
        
        // Initialize ammo UI after player ship is created
        this.ammoUI = new AmmoUI(this, this.playerShip);
        
        // Initialize stats UI after player ship is created
        this.statsUI = new StatsUI(this, this.playerShip);
        
        
        this.directionArrow = this.add.graphics({ x: 0, y: 0, add: false}),
        
        
        // Setup input
        this.playerSystem.setupInput();
        
        // Set up camera to follow player
        this.cameras.main.startFollow(this.playerShip);
        
        // Setup physics collisions after all ships are created
        this.setupCollisions();
        this.enemySystem.setupCollisions();
        
        // Add info text
        this.infoText = this.add.text(16, 16, '', {
            fontSize: '30px',
            fill: '#fff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.infoText.setScrollFactor(0);
        this.infoText.setVisible(this.playerSystem.isInfoBoxVisible());
        this.windInfoText = this.add.text(16, 100, '', {
            fontSize: '30px',
            fill: '#fff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.windInfoText.setScrollFactor(0);
        this.windInfoText.setOrigin(1,1);
        this.windInfoText.setPosition(this.cameras.main.width - 16, this.cameras.main.height - 16);
        this.windArrow = this.add.graphics({ x: 0, y: 0, add: false });
        this.windArrow.setScrollFactor(0);
        this.add.existing(this.windArrow);
        
        // Add world border
        this.addWorldBorder();
    }


    addWorldBorder() {
        const borderWidth = 5;
        const worldBounds = this.physics.world.bounds;
        
        // Create border graphics
        const border = this.add.graphics();
        border.lineStyle(borderWidth, 0xFF0000, 1); // Red border
        
        // Draw rectangle around world bounds
        border.strokeRect(
            worldBounds.x + borderWidth/2, 
            worldBounds.y + borderWidth/2, 
            worldBounds.width - borderWidth, 
            worldBounds.height - borderWidth
        );
        
        // Set scroll factor so border stays in world space
        border.setScrollFactor(1);
    }

    setupCollisions() {
        // Player ship collisions with islands
        this.physics.add.collider(this.playerShip, this.islands);
        
        // Player ship collisions with ports
        this.physics.add.collider(this.playerShip, this.ports);
        
        
        // Ship-to-ship collisions with size-based physics
        this.physics.add.overlap(this.playerShip, this.enemyShips, this.handleShipCollision, null, this);
        
    }

    handleShipCollision(ship1, ship2) {
        // Determine which ship is larger
        const ship1Larger = ship1.size >= ship2.size;
        const largerShip = ship1Larger ? ship1 : ship2;
        const smallerShip = ship1Larger ? ship2 : ship1;
        
        // If ships are the same size, both should react (normal physics)
        if (ship1.size === ship2.size) {
            // Apply normal collision physics
            this.physics.world.collide(ship1, ship2);
            return;
        }
        
        // Make larger ship immovable, smaller ship movable
        largerShip.body.setImmovable(true);
        smallerShip.body.setImmovable(false);
        
        // Apply collision
        this.physics.world.collide(largerShip, smallerShip);
        
        // Reset immovable state for larger ship
        largerShip.body.setImmovable(false);
    }



    update(time, delta) {
        this.windSystem.update(delta);
        
        // Update player and enemy systems
        this.playerSystem.update(time, delta);
        this.enemySystem.update(time, delta);
        
        // Update combat system
        this.combatSystem.update(delta);
        
        // Update ammo UI
        this.ammoUI.update();
        
        // Update stats UI
        this.statsUI.update();
        
        // Handle ambient sounds
        this.updateAmbientSounds(delta);
        
        // Handle background music
        this.updateBackgroundMusic(delta);
        
        const windEffect = this.windSystem.getWindEffect(this.playerShip.facingAngle);
        const windBaseBoost = this.playerShip.speed * windEffect.factor * this.playerShip.shipType.windResistance; 
        const windBoost = Math.min(windBaseBoost, this.playerShip.speed * 0.5); // Cap the boost at 50 for display purposes
        
        // Update ports
        this.ports.forEach(port => port.update());
        
const arrowDistance = this.playerShip.size / 2 + 90;
const arrowX = this.playerShip.x + Math.cos(this.playerShip.facingAngle) * arrowDistance;
const arrowY = this.playerShip.y + Math.sin(this.playerShip.facingAngle) * arrowDistance;
this.directionArrow.clear();

// Draw main blue arrow (3x size)
this.directionArrow.fillStyle(0x0066FF, 1);
this.directionArrow.beginPath();
this.directionArrow.moveTo(arrowX, arrowY);
this.directionArrow.lineTo(
    arrowX - 45 * Math.cos(this.playerShip.facingAngle - 0.4),
    arrowY - 45 * Math.sin(this.playerShip.facingAngle - 0.4)
);
this.directionArrow.lineTo(
    arrowX - 45 * Math.cos(this.playerShip.facingAngle + 0.4),
    arrowY - 45 * Math.sin(this.playerShip.facingAngle + 0.4)
);
this.directionArrow.closePath();
this.directionArrow.fillPath();

// Draw two side arrows (perpetual) at 90 and -90 degrees (3x size)
const greenArrowDistance = this.playerShip.size / 2 + 150;
const greenArrow1X = this.playerShip.x + Math.cos(this.playerShip.facingAngle + Math.PI / 2) * greenArrowDistance;
const greenArrow1Y = this.playerShip.y + Math.sin(this.playerShip.facingAngle + Math.PI / 2) * greenArrowDistance;
const greenArrow2X = this.playerShip.x + Math.cos(this.playerShip.facingAngle - Math.PI / 2) * greenArrowDistance;
const greenArrow2Y = this.playerShip.y + Math.sin(this.playerShip.facingAngle - Math.PI / 2) * greenArrowDistance;

// Left arrow (red) - at 90 degrees (3x size)
this.directionArrow.fillStyle(0xFF0000, 1);
this.directionArrow.beginPath();
this.directionArrow.moveTo(greenArrow1X, greenArrow1Y);
this.directionArrow.lineTo(
    greenArrow1X - 30 * Math.cos(this.playerShip.facingAngle + Math.PI / 2 - 0.4),
    greenArrow1Y - 30 * Math.sin(this.playerShip.facingAngle + Math.PI / 2 - 0.4)
);
this.directionArrow.lineTo(
    greenArrow1X - 30 * Math.cos(this.playerShip.facingAngle + Math.PI / 2 + 0.4),
    greenArrow1Y - 30 * Math.sin(this.playerShip.facingAngle + Math.PI / 2 + 0.4)
);
this.directionArrow.closePath();
this.directionArrow.fillPath();

// Right arrow (lavender) - at -90 degrees (3x size)
this.directionArrow.fillStyle(0xE6E6FA, 1);
this.directionArrow.beginPath();
this.directionArrow.moveTo(greenArrow2X, greenArrow2Y);
this.directionArrow.lineTo(
    greenArrow2X - 30 * Math.cos(this.playerShip.facingAngle - Math.PI / 2 - 0.4),
    greenArrow2Y - 30 * Math.sin(this.playerShip.facingAngle - Math.PI / 2 - 0.4)
);
this.directionArrow.lineTo(
    greenArrow2X - 30 * Math.cos(this.playerShip.facingAngle - Math.PI / 2 + 0.4),
    greenArrow2Y - 30 * Math.sin(this.playerShip.facingAngle - Math.PI / 2 + 0.4)
);
this.directionArrow.closePath();
this.directionArrow.fillPath();

// Update info text
        const selectedAmmo = this.combatSystem.getSelectedAmmo();
        this.infoText.setText([
            `Ship: ${this.playerShip.shipType.name}`,
            `Gold: ${this.playerShip.gold}`,
            `Cannons: ${this.playerShip.cannons}`,
            `Speed: ${this.playerShip.speed}`,
            `Turn Speed: ${this.playerShip.turnSpeed}`,
            `Rowing: ${this.playerShip.rowing}`,
            `Cargo: ${this.playerShip.cargo} / ${this.playerShip.cargoMax}`,
            `Selected Ammo: ${selectedAmmo} (${this.playerShip.tradeGoods[selectedAmmo]})`,
            `Controls: W/S - For/Back`,
            `A/D - Rotate`,
            `Q/E - Select Ammo`,
            `Left Click - Fire Left`,
            `Middle Click - Fire Right`,
            `Space - Fire Both`,
            `R - Cargo`,
            `I - Toggle Info`
        ]);
        const wind = this.windSystem.getWindEffect(this.playerShip.facingAngle);
        this.windInfoText.setText([
            `Wind Speed: ${wind.speed.toFixed(0)}`,
            `Speed Boost: ${Math.round(windBoost)}`,
        ]);

        const windArrowX = this.cameras.main.width - 110;
        const windArrowY = this.cameras.main.height - 120;
        const arrowSize = 20;
        this.windArrow.clear();
        this.windArrow.fillStyle(0x00FFFF, 1);
        this.windArrow.save();
        this.windArrow.translateCanvas(windArrowX, windArrowY);
        this.windArrow.rotateCanvas(this.windSystem.direction + Math.PI / 2); // Rotate to match wind direction
        this.windArrow.fillTriangleShape(new Phaser.Geom.Triangle(
            0, -arrowSize,
            -arrowSize / 2, arrowSize / 2,
            arrowSize / 2, arrowSize / 2
        ));
        this.windArrow.restore();
    }

    updateAmbientSounds(delta) {
        // Handle ship creaking sounds
        this.shipCreakingTimer -= delta;
        if (this.shipCreakingTimer <= 0) {
            this.sound.play('Ship_Creaking');
            // Random delay between 2-5 seconds
            this.shipCreakingDelay = 2000 + Math.random() * 3000;
            this.shipCreakingTimer = this.shipCreakingDelay;
        }

        // Handle rowing sounds when galley animation changes
        if (this.playerShip && this.playerShip.shipType.isGalley === 1) {
            this.rowingSoundTimer -= delta;
            
            const currentTexture = this.playerShip.texture.key;
            if (currentTexture !== this.lastRowingFrame && this.rowingSoundTimer <= 0) {
                this.sound.play('rowing');
                this.lastRowingFrame = currentTexture;
                this.rowingSoundTimer = this.rowingSoundDelay; // Reset cooldown
            }
        }
    }

    updateBackgroundMusic(delta) {
        this.songTimer -= delta;
        
        if (this.songTimer <= 0) {
            // Stop current music if playing and has stop method
            if (this.currentBackgroundMusic && this.currentBackgroundMusic.stop) {
                this.currentBackgroundMusic.stop();
            }
            
            // Play next song
            const songKey = this.songs[this.currentSongIndex];
            this.currentBackgroundMusic = this.sound.play(songKey, { 
                loop: false,
                volume: 0.3 // Adjust volume as needed
            });
            
            // Get exact duration from our map
            const songDuration = this.songDurations[songKey];
            
            if (songDuration) {
                // Convert duration from seconds to milliseconds and add 1 minute cooldown
                const songDurationMs = songDuration * 1000;
                this.songTimer = songDurationMs + this.songDelay;
                console.log(`Playing ${songKey}, duration: ${songDuration}s (${Math.floor(songDuration/60)}:${(songDuration%60).toString().padStart(2,'0')}), next song in: ${this.songTimer/1000}s`);
            } else {
                // Fallback to 3 minutes if song not found in map
                const fallbackDuration = 180; // 3 minutes in seconds
                this.songTimer = (fallbackDuration * 1000) + this.songDelay;
                console.log(`Playing ${songKey}, duration not in map, using 3min fallback, next song in: ${this.songTimer/1000}s`);
            }
            
            // Move to next song
            this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        }
    }
}
