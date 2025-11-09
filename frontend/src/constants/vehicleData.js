// src/constants/vehicleData.js
// Constantes centralisées pour les données des véhicules
// Utilisées dans Publish, recherche, filtrage, etc.

/**
 * Liste complète des marques de véhicules
 */
export const BRANDS = [
    "Abarth", "Acura", "Alfa Romeo", "Aston Martin", "Audi",
    "Bentley", "BMW", "Bugatti", "Buick", "BYD",
    "Cadillac", "Chevrolet", "Chrysler", "Citroën", "Cupra",
    "Dacia", "Daewoo", "Daihatsu", "Dodge", "DS",
    "Ferrari", "Fiat", "Fisker", "Ford", "Genesis",
    "GMC", "Honda", "Hummer", "Hyundai",
    "Infiniti", "Isuzu", "Jaguar", "Jeep",
    "Kia", "Koenigsegg", "Lada", "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lincoln", "Lotus", "Lucid",
    "Maserati", "Maybach", "Mazda", "McLaren", "Mercedes-Benz", "MG", "Mini", "Mitsubishi",
    "Nissan", "Opel", "Pagani", "Peugeot", "Polestar", "Porsche",
    "Ram", "Renault", "Rivian", "Rolls-Royce", "Rover",
    "Saab", "Seat", "Skoda", "Smart", "SsangYong", "Subaru", "Suzuki",
    "Tesla", "Toyota",
    "Volkswagen", "Volvo",
    "Aixam", "Ligier", "Microcar"
];

/**
 * Modèles populaires par marque
 * Structure: { [marque]: [modèles] }
 */
export const MODELES_PAR_MARQUE = {
    "Renault": ["Clio", "Megane", "Captur", "Twingo", "Kadjar", "Scenic", "Zoe", "Arkana", "Austral", "Espace", "Talisman", "Koleos"],
    "Peugeot": ["208", "308", "2008", "3008", "5008", "Partner", "Rifter", "508", "Expert", "Traveller", "e-208", "e-2008"],
    "Citroen": ["C3", "C4", "C5", "Berlingo", "SpaceTourer", "Ami", "C3 Aircross", "C5 Aircross", "C5 X", "ë-C4"],
    "Toyota": ["Yaris", "Corolla", "RAV4", "Aygo", "C-HR", "Camry", "Prius", "Highlander", "Land Cruiser", "Hilux", "Proace", "bZ4X"],
    "Volkswagen": ["Golf", "Polo", "Tiguan", "Passat", "T-Roc", "ID.3", "ID.4", "ID.5", "Arteon", "Touareg", "T-Cross", "Taigo", "Caddy", "Multivan"],
    "BMW": ["Série 1", "Série 2", "Série 3", "Série 4", "Série 5", "Série 7", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "i3", "i4", "iX", "iX3", "Z4"],
    "Mercedes-Benz": ["Classe A", "Classe B", "Classe C", "Classe E", "Classe S", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "EQA", "EQB", "EQC", "EQE", "EQS"],
    "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "e-tron", "TT"],
    "Ford": ["Fiesta", "Focus", "Puma", "Kuga", "Mustang", "Mustang Mach-E", "Ranger", "Transit", "Tourneo", "Explorer", "Mondeo"],
    "Opel": ["Corsa", "Astra", "Mokka", "Crossland", "Grandland", "Combo", "Vivaro", "Zafira"],
    "Fiat": ["500", "Panda", "Tipo", "500X", "500L", "Ducato", "Doblo", "500e"],
    "Nissan": ["Micra", "Juke", "Qashqai", "X-Trail", "Leaf", "Ariya", "Townstar", "Navara", "GT-R"],
    "Honda": ["Jazz", "Civic", "HR-V", "CR-V", "e", "ZR-V"],
    "Mazda": ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-60", "MX-5", "MX-30"],
    "Hyundai": ["i10", "i20", "i30", "Bayon", "Kona", "Tucson", "Santa Fe", "Ioniq 5", "Ioniq 6", "Staria"],
    "Kia": ["Picanto", "Rio", "Stonic", "XCeed", "Ceed", "Niro", "Sportage", "Sorento", "EV6", "EV9"],
    "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    "Dacia": ["Sandero", "Duster", "Jogger", "Spring", "Logan"],
    "Seat": ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
    "Skoda": ["Fabia", "Scala", "Octavia", "Kamiq", "Karoq", "Kodiaq", "Enyaq"],
    "Mini": ["Cooper", "Countryman", "Clubman", "Electric"],
    "Volvo": ["XC40", "XC60", "XC90", "V60", "V90", "S60", "S90", "C40", "EX30", "EX90"],
    "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar"],
    "Jeep": ["Renegade", "Compass", "Wrangler", "Grand Cherokee", "Avenger"],
    "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"],
    "DS": ["DS 3", "DS 4", "DS 7", "DS 9"],
    "Porsche": ["911", "718 Cayman", "718 Boxster", "Panamera", "Cayenne", "Macan", "Taycan"],
    "Jaguar": ["E-Pace", "F-Pace", "I-Pace", "F-Type"],
    "Lexus": ["CT", "IS", "ES", "UX", "NX", "RX", "LC"],
    "Subaru": ["Impreza", "XV", "Forester", "Outback", "Solterra"],
    "Suzuki": ["Ignis", "Swift", "Vitara", "S-Cross", "Jimny", "Across"],
    "Mitsubishi": ["Space Star", "ASX", "Eclipse Cross", "Outlander"],
    "Dodge": ["Challenger", "Charger", "Durango", "Ram 1500"],
    "Chevrolet": ["Spark", "Camaro", "Corvette", "Silverado"],
    "Cadillac": ["XT4", "XT5", "XT6", "Escalade", "Lyriq"],
    "Genesis": ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
    "Polestar": ["Polestar 2", "Polestar 3", "Polestar 4"],
    "Cupra": ["Formentor", "Leon", "Ateca", "Born", "Tavascan"],
    "MG": ["MG3", "MG4", "MG5", "ZS", "Marvel R", "HS"],
    "Smart": ["fortwo", "forfour", "#1", "#3"],
    "BYD": ["Atto 3", "Han", "Tang", "Seal", "Dolphin"],
    "Aston Martin": ["Vantage", "DB11", "DB12", "DBX"],
    "Ferrari": ["Roma", "Portofino", "F8", "SF90", "296", "812", "Purosangue"],
    "Lamborghini": ["Huracán", "Urus", "Revuelto"],
    "Maserati": ["Ghibli", "Quattroporte", "Levante", "MC20", "Grecale"],
    "Bentley": ["Continental", "Flying Spur", "Bentayga"],
    "Rolls-Royce": ["Ghost", "Phantom", "Cullinan", "Wraith", "Dawn", "Spectre"],
    "McLaren": ["GT", "Artura", "720S", "765LT"],
    "Lotus": ["Eletre", "Emira", "Evija"],
    "Bugatti": ["Chiron", "Bolide", "Mistral"],
    "Koenigsegg": ["Gemera", "Jesko", "CC850"],
    "Pagani": ["Huayra", "Utopia"],
    "Rivian": ["R1T", "R1S"],
    "Lucid": ["Air", "Gravity"],
    "Fisker": ["Ocean"],
    "SsangYong": ["Tivoli", "Korando", "Rexton"],
    "Lancia": ["Ypsilon"],
    "Aixam": ["City", "Crossline", "Coupé"],
    "Ligier": ["JS50", "JS60", "Pulse"],
    "Microcar": ["M.Go", "Dué"],
    "Acura": ["Integra", "TLX", "MDX", "RDX"],
    "Buick": ["Encore", "Envision", "Enclave"],
    "GMC": ["Sierra", "Yukon", "Terrain", "Acadia"],
    "Hummer": ["EV"],
    "Infiniti": ["Q50", "Q60", "QX50", "QX55", "QX60"],
    "Lincoln": ["Corsair", "Nautilus", "Aviator", "Navigator"],
    "Ram": ["1500", "2500", "3500"],
    "Chrysler": ["Pacifica", "300"],
    "Maybach": ["S-Class", "GLS"],
};

/**
 * Types de carburant disponibles
 */
export const CARBURANTS = ["Electrique", "Diesel", "Essence", "Hybride"];

/**
 * Types de boîte de vitesse
 */
export const BOITES = ["Manuelle", "Automatique"];

/**
 * Couleurs courantes de véhicules
 */
export const COULEURS = [
    "Noir",
    "Blanc",
    "Gris",
    "Argent",
    "Bleu",
    "Rouge",
    "Vert",
    "Jaune",
    "Orange",
    "Marron",
    "Beige",
    "Violet",
    "Rose",
    "Or",
    "Bronze"
];

/**
 * Nombre de places disponibles
 */
export const NB_PLACES = [2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Plage d'années pour les véhicules
 * @param {number} startYear - Année de début (défaut: 1980)
 * @param {number} endYear - Année de fin (défaut: année en cours + 1)
 * @returns {number[]} Tableau d'années triées par ordre décroissant
 */
export const getYearRange = (startYear = 1980, endYear = new Date().getFullYear() + 1) => {
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
        years.push(year);
    }
    return years;
};

/**
 * Obtenir les modèles pour une marque donnée
 * @param {string} marque - Nom de la marque
 * @returns {string[]} Liste des modèles disponibles
 */
export const getModelesByMarque = (marque) => {
    if (!marque) return [];

    // Normalisation pour recherche insensible à la casse et aux accents
    const normalize = (s) => (s ? s.normalize?.('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '');

    // Recherche directe
    if (MODELES_PAR_MARQUE[marque]) {
        return MODELES_PAR_MARQUE[marque];
    }

    // Recherche normalisée
    const normalizedMarque = normalize(marque);
    const foundKey = Object.keys(MODELES_PAR_MARQUE).find(
        key => normalize(key) === normalizedMarque
    );

    return foundKey ? MODELES_PAR_MARQUE[foundKey] : [];
};

