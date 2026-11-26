import { ARGENTINE_CLASSIC_PAIRS } from './argentineFormat';

export interface DerbyDefinition {
    name: string;
    pairIds?: [number, number];
    pairNames: [string, string];
    tension: number; // 1.1 to 1.5 multiplier for fouls and event volatility
}

export const GLOBAL_DERBIES: DerbyDefinition[] = [
    // --- ARGENTINA ---
    { name: 'Superclásico del Fútbol Argentino', pairIds: [701, 702], pairNames: ['boca', 'river'], tension: 1.45 },
    { name: 'Clásico de Avellaneda', pairIds: [703, 704], pairNames: ['racing', 'independiente'], tension: 1.35 },
    { name: 'Clásico Porteño', pairIds: [705, 706], pairNames: ['san lorenzo', 'huracán'], tension: 1.30 },
    { name: 'Clásico Rosarino', pairIds: [707, 708], pairNames: ['rosario central', "newell's"], tension: 1.40 },
    { name: 'Clásico Platense', pairIds: [709, 710], pairNames: ['estudiantes', 'gimnasia'], tension: 1.30 },
    { name: 'Clásico Cordobés', pairIds: [717, 718], pairNames: ['belgrano', 'talleres'], tension: 1.35 },
    { name: 'Clásico del Sur', pairIds: [711, 712], pairNames: ['banfield', 'lanús'], tension: 1.25 },
    { name: 'Clásico Santafesino', pairIds: [715, 716], pairNames: ['unión', 'colón'], tension: 1.35 },

    // --- ESPAÑA ---
    { name: 'El Clásico de España', pairIds: [201, 202], pairNames: ['real madrid', 'barcelona'], tension: 1.40 },
    { name: 'Derbi Madrileño', pairIds: [201, 203], pairNames: ['real madrid', 'atlético'], tension: 1.35 },
    { name: 'El Gran Derbi de Sevilla', pairNames: ['sevilla', 'betis'], tension: 1.35 },
    { name: 'Derbi Vasco', pairNames: ['athletic', 'real sociedad'], tension: 1.25 },
    { name: 'Derbi Barcelonés', pairNames: ['barcelona', 'espanyol'], tension: 1.25 },

    // --- INGLATERRA ---
    { name: 'North West Derby', pairIds: [4, 6], pairNames: ['liverpool', 'manchester utd'], tension: 1.40 },
    { name: 'North London Derby', pairIds: [1, 8], pairNames: ['arsenal', 'tottenham'], tension: 1.35 },
    { name: 'Manchester Derby', pairIds: [5, 6], pairNames: ['manchester city', 'manchester utd'], tension: 1.35 },
    { name: 'Merseyside Derby', pairIds: [4, 14], pairNames: ['liverpool', 'everton'], tension: 1.30 },
    { name: 'London Derby', pairIds: [1, 3], pairNames: ['arsenal', 'chelsea'], tension: 1.25 },

    // --- ITALIA ---
    { name: 'Derby della Madonnina', pairNames: ['inter', 'milan'], tension: 1.40 },
    { name: 'Derby d\'Italia', pairNames: ['juventus', 'inter'], tension: 1.35 },
    { name: 'Derby della Capitale', pairNames: ['roma', 'lazio'], tension: 1.45 },
    { name: 'Derby della Mole', pairNames: ['juventus', 'torino'], tension: 1.30 },

    // --- ALEMANIA ---
    { name: 'Der Klassiker', pairNames: ['bayern', 'dortmund'], tension: 1.35 },
    { name: 'Revierderby', pairNames: ['dortmund', 'schalke'], tension: 1.45 },

    // --- FRANCIA ---
    { name: 'Le Classique', pairNames: ['paris saint-germain', 'marseille'], tension: 1.40 },
    { name: 'Derby du Rhône', pairNames: ['lyon', 'saint-étienne'], tension: 1.35 },

    // --- BRASIL ---
    { name: 'Fla-Flu', pairNames: ['flamengo', 'fluminense'], tension: 1.40 },
    { name: 'Derby Paulista', pairNames: ['corinthians', 'palmeiras'], tension: 1.40 },
    { name: 'Gre-Nal', pairNames: ['grêmio', 'internacional'], tension: 1.45 },
    { name: 'Choque-Rei', pairNames: ['são paulo', 'palmeiras'], tension: 1.30 },

    // --- MÉXICO ---
    { name: 'Clásico Nacional', pairNames: ['américa', 'guadalajara'], tension: 1.40 },
    { name: 'Clásico Regio', pairNames: ['monterrey', 'tigres'], tension: 1.35 },
    { name: 'Clásico Joven', pairNames: ['américa', 'cruz azul'], tension: 1.30 },
    { name: 'Clásico Capitalino', pairNames: ['américa', 'pumas'], tension: 1.30 },

    // --- PORTUGAL ---
    { name: 'O Clássico', pairIds: [2001, 2003], pairNames: ['benfica', 'porto'], tension: 1.45 },
    { name: 'Dérbi de Lisboa', pairIds: [2001, 2002], pairNames: ['benfica', 'sporting'], tension: 1.40 },
    { name: 'Clássico Porto-Sporting', pairIds: [2003, 2002], pairNames: ['porto', 'sporting'], tension: 1.35 },

    // --- PAÍSES BAJOS ---
    { name: 'De Klassieker', pairIds: [2103, 2102], pairNames: ['ajax', 'feyenoord'], tension: 1.45 },
    { name: 'De Topper', pairIds: [2103, 2101], pairNames: ['ajax', 'psv'], tension: 1.35 },
    { name: 'Topduel Eredivisie', pairIds: [2101, 2102], pairNames: ['psv', 'feyenoord'], tension: 1.30 },

    // --- URUGUAY ---
    { name: 'Superclásico del Fútbol Uruguayo', pairIds: [9121, 9122], pairNames: ['peñarol', 'nacional'], tension: 1.50 },
    { name: 'Clásico de los Medianos', pairIds: [9123, 9149], pairNames: ['defensor', 'danubio'], tension: 1.25 },

    // --- ECUADOR ---
    { name: 'Clásico del Astillero', pairIds: [9115, 9116], pairNames: ['barcelona sc', 'emelec'], tension: 1.45 },
    { name: 'Superclásico Capitalino', pairIds: [9113, 2301], pairNames: ['ldu quito', 'el nacional'], tension: 1.35 },
    { name: 'Duelo de Campeones de Quito', pairIds: [9113, 9114], pairNames: ['ldu quito', 'independiente del valle'], tension: 1.30 },

    // --- MLS (EE.UU.) ---
    { name: 'El Tráfico (LA Derby)', pairIds: [2402, 2403], pairNames: ['lafc', 'la galaxy'], tension: 1.40 },
    { name: 'Cascadia Cup', pairIds: [2405, 2413], pairNames: ['seattle', 'portland'], tension: 1.35 },
    { name: 'Hudson River Derby', pairIds: [2408, 2409], pairNames: ['new york city', 'red bulls'], tension: 1.35 },
    { name: 'Florida Derby', pairIds: [2401, 2410], pairNames: ['inter miami', 'orlando city'], tension: 1.30 }
];

const normalize = (str?: string) => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Checks whether two teams are involved in a historical derby or rivalry.
 */
export const checkDerbyMatch = (
    homeTeam: { id?: number; name?: string },
    awayTeam: { id?: number; name?: string }
): { isDerby: boolean; derbyName?: string; tensionFactor: number } => {
    if (!homeTeam || !awayTeam) {
        return { isDerby: false, tensionFactor: 1.0 };
    }

    const homeId = homeTeam.id;
    const awayId = awayTeam.id;
    const homeNorm = normalize(homeTeam.name);
    const awayNorm = normalize(awayTeam.name);

    // 1. Direct ID check with Argentine pairs
    if (homeId && awayId) {
        for (const [idA, idB] of ARGENTINE_CLASSIC_PAIRS) {
            if ((homeId === idA && awayId === idB) || (homeId === idB && awayId === idA)) {
                const match = GLOBAL_DERBIES.find(d => d.pairIds && ((d.pairIds[0] === idA && d.pairIds[1] === idB) || (d.pairIds[0] === idB && d.pairIds[1] === idA)));
                return {
                    isDerby: true,
                    derbyName: match?.name || 'Clásico Histórico',
                    tensionFactor: match?.tension || 1.35
                };
            }
        }
    }

    // 2. Global Derbies catalog (ID or Name substring matching)
    for (const derby of GLOBAL_DERBIES) {
        if (derby.pairIds && homeId && awayId) {
            const [id1, id2] = derby.pairIds;
            if ((homeId === id1 && awayId === id2) || (homeId === id2 && awayId === id1)) {
                return { isDerby: true, derbyName: derby.name, tensionFactor: derby.tension };
            }
        }

        const [nameA, nameB] = derby.pairNames;
        const homeMatchesA = homeNorm.includes(nameA);
        const homeMatchesB = homeNorm.includes(nameB);
        const awayMatchesA = awayNorm.includes(nameA);
        const awayMatchesB = awayNorm.includes(nameB);

        if ((homeMatchesA && awayMatchesB) || (homeMatchesB && awayMatchesA)) {
            return { isDerby: true, derbyName: derby.name, tensionFactor: derby.tension };
        }
    }

    return { isDerby: false, tensionFactor: 1.0 };
};
