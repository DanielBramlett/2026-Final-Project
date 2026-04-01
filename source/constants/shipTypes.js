export const SHIP_TYPES = {

    SLOOP: {

        name: 'Sloop',

        size: 500,

        speed: 200,

        rowing: 0,

        turnSpeed: 200,

        cannons: 14,

        crew: 60,

        crewMax: 60,

        health: 75,

        maxHealth: 75,

        sailIntegrity: 30,

        maxSailIntegrity: 30,

        cargo: 0,

        cargoMax: 300,

        windResistance: 0.8,

        isGalley: 0,

        image: 'Sloop_East',

        hitboxScaleX: 0.3475,

        hitboxScaleY: 0.24,

        needsOffset: 0

    },

     CUTTER: {

        name: 'Cutter',

        size: 550,

        speed: 185,

        rowing: 0,

        turnSpeed: 170,

        cannons: 16,

        crew: 65,

        crewMax: 65,

        health: 85,

        maxHealth: 85,

        sailIntegrity: 35,

        maxSailIntegrity: 35,

        cargo: 0,

        cargoMax: 400,

        windResistance: .9,

        isGalley: 0,

        image: 'Cutter_East',

        hitboxScaleX: 0.3,

        hitboxScaleY: 0.2,

        hitboxOffsetX: 18,

        hitboxOffsetY: 45,

        needsOffset: 1

    },

     KETCH: {

        name: 'Ketch',

        size: 575,

        speed: 225,

        rowing: 0,

        turnSpeed: 215,

        cannons: 18,

        crew: 75,

        crewMax: 75,

        health: 100,

        maxHealth: 100,

        sailIntegrity: 50,

        maxSailIntegrity: 50,

        cargo: 0,

        cargoMax: 450,

        windResistance: .975,

        isGalley: 0,

        image: 'Ketch_East',

        hitboxScaleX: 0.325,

        hitboxScaleY: 0.185,

        needsOffset: 0

    },

     SCHOONER: {

        name: 'Schooner',

        size: 600,

        speed: 250,

        rowing: 0,

        turnSpeed: 225,

        cannons: 24,

        crew: 75,

        crewMax: 75,

        health: 110,

        maxHealth: 110,

        sailIntegrity: 60,

        maxSailIntegrity: 60,

        cargo: 0,

        cargoMax: 550,

        windResistance: .975,

        isGalley: 0,

        image: 'Schooner_East',

        hitboxScaleX: 0.27,

        hitboxScaleY: 0.175,

        needsOffset: 0

    },

     CARAVEL: {

       name: 'Caravel',

       size: 650,

       speed: 140,

       rowing: 0,

       turnSpeed: 105,

       cannons: 12,

       crew: 45,

       crewMax: 45,

       health: 120,

       maxHealth: 120,

       sailIntegrity: 75,

        maxSailIntegrity: 75,

       cargo: 0,

       cargoMax: 1750,

       windResistance: .8,

       isGalley: 0,

       image: 'Caravel_East',

       hitboxScaleX: 0.2,

       hitboxScaleY: 0.135,

       needsOffset: 0

    },

     BRIG: {

        name: 'Brig',

        size: 650,

        speed: 145,

        rowing: 0,

        turnSpeed: 150,

        cannons: 20,

        crew: 70,

        crewMax: 70,

        health: 130,

        maxHealth: 130,

        sailIntegrity: 80,

        maxSailIntegrity: 80,

        cargo: 0,

        cargoMax: 750,

        windResistance: .75,

        isGalley: 0,

        image: 'Brig_East',

        hitboxScaleX: 0.29,

        hitboxScaleY: 0.13,

        needsOffset: 0,

    },

     BARQUENTINE: {

        name: 'Barquentine',

        size: 700,

        speed: 135,

        rowing: 0,

        turnSpeed: 145,

        cannons: 22,

        crew: 75,

        crewMax: 75,

        health: 140,

        maxHealth: 140,

        sailIntegrity: 80,

        maxSailIntegrity: 80,

        cargo: 0,

        cargoMax: 850,

        windResistance: .775,

        isGalley: 0,

        image: 'Barquentine_East',

        hitboxScaleX: 0.29,

        hitboxScaleY: 0.153,

        needsOffset: 0

    },

    BRIGANTINE: {

        name: 'Brigantine',

        size: 700,

        speed: 150,

        rowing: 0,

        turnSpeed: 160,

        cannons: 18,

        crew: 75,

        crewMax: 75,

        health: 150,

        maxHealth: 150,

        sailIntegrity: 85,

        maxSailIntegrity: 85,

        cargo: 0,

        cargoMax: 500,

        windResistance: 0.7,

        isGalley: 0,

        image: 'Brigantine_East',

        hitboxScaleX: 0.28,

        hitboxScaleY: 0.185,

        needsOffset: 0

    },

    CARRACK: {

        name: 'Carrack',

        size: 750,

        speed: 120,

        rowing: 0,

        turnSpeed: 90,

        cannons: 18,

        crew: 60,

        crewMax: 60,

        health: 165,

        maxHealth: 165,

        sailIntegrity: 90,

        maxSailIntegrity: 90,

        cargo: 0,

        cargoMax: 2500,

        windResistance: .75,

        isGalley: 0,

        image: 'Carrack_East',

        hitboxScaleX: 0.22,

        hitboxScaleY: 0.15,

        needsOffset: 0

    },

     BARQUE: {

        name: 'Barque',

        size: 750,

        speed: 130,

        rowing: 0,

        turnSpeed: 140,

        cannons: 24,

        crew: 75,

        crewMax: 75,

        health: 170,

        maxHealth: 170,

        sailIntegrity: 95,

        maxSailIntegrity: 95,

        cargo: 0,

        cargoMax: 900,

        windResistance: .8,

        isGalley: 0,

        image: 'Barque_East',

        hitboxScaleX: 0.24,

        hitboxScaleY: 0.14,

        needsOffset: 0

    },

     XEBEC: {

        name: 'Xebec',

        size: 750,

        speed: 250,

        rowing: 0,

        turnSpeed: 200,

        cannons: 30,

        crew: 80,

        crewMax: 80,

        health: 175,

        maxHealth: 175,

        sailIntegrity: 90,

        maxSailIntegrity: 90,

        cargo: 0,

        cargoMax: 900,

        windResistance: .95,

        isGalley: 0,

        image: 'Xebec_East',

        hitboxScaleX: 0.225,

        hitboxScaleY: 0.09,

        needsOffset: 0

    },

    GALLOIT: {

        name: 'Galloit',

        size: 750,

        speed: 120,

        rowing: 60,

        turnSpeed: 140,

        cannons: 10,

        crew: 100,

        crewMax: 100,

        health: 190,

        maxHealth: 190,

        sailIntegrity: 80,

        maxSailIntegrity: 80,

        cargo: 0,

        cargoMax: 800,

        windResistance: 0.7,

        isGalley: 1,

        image: 'Galloit_East',

        hitboxScaleX: 0.275,

        hitboxScaleY: 0.15,

        hitboxOffsetX: -2,

        hitboxOffsetY: 45,

        needsOffset: 1

    },

    CLIPPER: {

        name: 'Clipper',

        size: 800,

        speed: 195,

        rowing: 0,

        turnSpeed: 100,

        cannons: 10,

        crew: 100,

        crewMax: 100,

        health: 150,

        maxHealth: 150,

        sailIntegrity: 120,

        maxSailIntegrity: 120,

        cargo: 0,

        cargoMax: 1500,

        windResistance: 0.9,

        isGalley: 0,

        image: 'Clipper_East',

        hitboxScaleX: 0.25,

        hitboxScaleY: 0.14,

        hitboxOffsetX: 1,

        hitboxOffsetY: 45,

        needsOffset: 1

    },

    SLOOP_OF_WAR:{

        name:'Sloop_of_War',

        size: 800,

        speed: 150,

        rowing: 0,

        turnSpeed: 165,

        cannons: 20,

        crew: 200,

        crewMax: 200,

        health: 240,

        maxHealth: 240,

        sailIntegrity: 100,

        maxSailIntegrity: 100,

        cargo: 0,

        cargoMax: 1250,

        windResistance: 0.75,

        isGalley: 0,

        image: 'Sloop_of_War_East',

        hitboxScaleX: 0.24,

        hitboxScaleY: 0.17,

        hitboxOffsetX: 5,

        hitboxOffsetY: 33,

        needsOffset: 1

    },

    LIGHT_GALLEY: {

        name: 'Light_Galley',

        size: 800,

        speed: 110,

        rowing: 80,

        turnSpeed: 130,

        cannons: 12,

        crew: 150,

        crewMax: 150,

        health: 240,

        maxHealth: 240,

        sailIntegrity: 85,

        maxSailIntegrity: 85,

        cargo: 0,

        cargoMax: 1000,

        windResistance: 0.65,

        isGalley: 1,

        image: 'Light_Galley_East',

        hitboxScaleX: 0.26,

        hitboxScaleY: 0.15,

        hitboxOffsetX: -3,

        hitboxOffsetY: 41,

        needsOffset: 1

    },

     FRIGATE: {

        name: 'Frigate',

        size: 850,

        speed: 180,

        rowing: 0,

        turnSpeed: 180,

        cannons: 40,

        crew: 150,

        crewMax: 150,

        health: 300,

        maxHealth: 300,

        sailIntegrity: 110,

        maxSailIntegrity: 110,

        cargo: 0,

        cargoMax: 750,

        windResistance: 0.7,

        isGalley: 0,

        image: 'Frigate_East',

        hitboxScaleX: 0.232,

        hitboxScaleY: 0.133,

        needsOffset: 0

     },

     FOURTH_RATE: {

        name: 'Fourth_Rate',

        size: 850,

        speed: 120,

        rowing: 0,

        turnSpeed: 110,

        cannons: 60,

        crew: 350,

        crewMax: 350,

        health: 340,

        maxHealth: 350,   
        
        sailIntegrity: 125,

        maxSailIntegrity: 125,

        cargo: 0,

        cargoMax: 900,

        windResistance: 0.65,

        isGalley: 0,

        image: 'Fourth_Rate_East',

        hitboxScaleX: 0.22,

        hitboxScaleY: 0.12,

        needsOffset: 0

    },

    GALLEON: {

        name: 'Galleon',

        size: 900,

        speed: 100,

        rowing: 0,

        turnSpeed: 120,

        cannons: 30,

        crew: 150,

        crewMax: 150,

        health: 340,

        maxHealth: 340,

        sailIntegrity: 140,

        maxSailIntegrity: 140,

        cargo: 0,

        cargoMax: 1000,

        windResistance: 0.6,

        isGalley: 0,

        image: 'Galleon_East',

        hitboxScaleX: 0.21,

        hitboxScaleY: 0.15,

        needsOffset: 0

    },

    GALLEY:{

        name: 'Galley',

        size: 900,

        speed: 100,

        rowing: 100,

        turnSpeed: 125,

        cannons: 16,

        crew: 200,

        crewMax:200,

        health: 400,

        maxHealth: 400,

        sailIntegrity: 100,

        maxSailIntegrity: 100,

        cargo: 0,

        cargoMax: 1250,

        windResistance: 0.7,

        isGalley: 1,

        image: 'Galley_East',

        hitboxScaleX: 0.23,

        hitboxScaleY: 0.135,

        hitboxOffsetX: -3,

        hitboxOffsetY: 40,

        needsOffset: 1

    },

    THIRD_RATE: {

        name: 'Third_Rate',

        size: 900,

        speed: 100,

        rowing: 0,

        turnSpeed: 100,

        cannons: 80,

        crew: 720,

        crewMax: 720,

        health: 4600,

        maxHealth: 460,

        sailIntegrity: 150,

        maxSailIntegrity: 150,

        cargo: 0,

        cargoMax: 1750,

        windResistance: 0.6,

        isGalley: 0,

        image: 'Third_Rate_East',

        hitboxScaleX: 0.2,

        hitboxScaleY: 0.1075,

        needsOffset: 0

    },

    GALLEASS: {

        name: 'Galleass',

        size: 900,

        speed: 90,

        rowing: 120,

        turnSpeed: 110,

        cannons: 24,

        crew: 300,

        crewMax: 300,

        health: 500,

        maxHealth: 500,

        sailIntegrity: 110,

        maxSailIntegrity: 110,

        cargo: 0,

        cargoMax: 1750,

        windResistance: 0.6,

        isGalley: 1,

        hitboxScaleX: 0.195,

        hitboxScaleY: 0.1,

        hitboxOffsetX: 12,

        hitboxOffsetY: 55,

        needsOffset: 1

    },

    SECOND_RATE: {

        name: 'Second_Rate',

        size: 925,

        speed: 80,

        rowing: 0,

        turnSpeed: 95,

        cannons: 98,

        crew: 750,

        crewMax: 750,

        health: 600,

        maxHealth: 600,

        sailIntegrity: 175,

        maxSailIntegrity: 175,

        cargo: 0,

        cargoMax: 2000,

        windResistance: 0.65,

        isGalley: 0,

        image: 'Second_Rate_East',

        hitboxScaleX: 0.4,

        hitboxScaleY: 0.3,

        hitboxOffsetX: 20,

        hitboxOffsetY: 65,

        needsOffset: 1

    },

    FIRST_RATE: {

        name: 'First_Rate',

        size: 950,

        speed: 75,

        rowing: 0,

        turnSpeed: 80,

        cannons: 104,

        crew: 850,

        crewMax: 850,

        health: 700,

        maxHealth: 700,

        sailIntegrity: 200,

        maxSailIntegrity: 200,

        cargo: 0,

        cargoMax: 2500,

        windResistance: 0.6,

        isGalley: 0,

        image: 'First_Rate_East',

        hitboxScaleX: 0.38,

        hitboxScaleY: 0.3,

        hitboxOffsetX: 20,

        hitboxOffsetY: 60,

        needsOffset: 1

    },

    HMS_VICTORY: {

        name: 'HMS_Victory',

        size: 950,

        speed: 80,

        rowing: 0,

        turnSpeed: 85,

        cannons: 110,

        crew: 821,

        crewMax: 821,

        health: 800,

        maxHealth: 800,

        sailIntegrity: 240,

        maxSailIntegrity: 240,

        cargo: 0,

        cargoMax: 2750,

        windResistance: 0.65,

        isGalley: 0,

        image: 'HMS_Victory_East',

        hitboxScaleX: 0.38,

        hitboxScaleY: 0.28,

        needsOffset: 0

    },

    ORIENT: {

        name: 'Orient',

        size: 950,

        speed: 65,

        rowing: 0,

        turnSpeed: 70,

        cannons: 120,

        crew: 900,

        crewMax: 900,

        health: 875,

        maxHealth: 875,

        sailIntegrity: 250,

        maxSailIntegrity: 250,

        cargo: 0,

        cargoMax: 3000,

        windResistance: 0.6,

        isGalley: 0,

        image: 'Orient_East',

        hitboxScaleX: 0.385,

        hitboxScaleY: 0.285,

        needsOffset: 0

    },

    SANTTÌSIMA_TRINIDAD: {

        name: 'Santísima_Trinidad',

        size: 975,

        speed: 75,

        rowing: 0,

        turnSpeed: 80,

        cannons: 140,

        crew: 1200,

        crewMax: 1200,

        health: 950,

        maxHealth: 950,

        sailIntegrity: 300,

        maxSailIntegrity: 300,

        cargo: 0,

        cargoMax: 3500,

        windResistance: 0.6,

        isGalley: 0,

        image: 'Santísima_Trinidad_East',

        hitboxScaleX: 0.375,

        hitboxScaleY: 0.275,

        needsOffset: 0

    },

    URCA_DE_LIMA: {

        name: 'Urca_de_Lima',

        size: 1000,

        speed: 70,

        rowing: 0,

        turnSpeed: 75,

        cannons: 90,

        crew: 1000,

        crewMax: 1000,

        health: 700,

        maxHealth: 700,

        sailIntegrity: 400,

        maxSailIntegrity: 400,

        cargo: 0,

        cargoMax: 4500,

        windResistance: 0.6,

        isGalley: 0,

        image: 'Urca_de_Lima_East',

        hitboxScaleX: 0.38,

        hitboxScaleY: 0.32,

        needsOffset: 0

    },

    DUKE_OF_KENT: {

        name: 'Duke_of_Kent',

        size: 1000,

        speed: 60,

        rowing: 0,

        turnSpeed: 60,

        cannons: 170,

        crew: 1400,

        crewMax: 1400,

        health: 1000,

        maxHealth: 1000,

        sailIntegrity: 550,

        maxSailIntegrity: 550,

        cargo: 0,

        cargoMax: 4000,

        windResistance: 0.55,

        isGalley: 0,

        image: 'Duke_of_Kent_East',

        hitboxScaleX: 0.39,

        hitboxScaleY: 0.32,

        needsOffset: 0

    },

};

