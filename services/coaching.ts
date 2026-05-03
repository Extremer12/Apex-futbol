import { Coach, Team } from '../types';

const FIRST_NAMES = ['John', 'David', 'Michael', 'James', 'Robert', 'William', 'Jose', 'Antonio', 'Manuel', 'Francisco', 'Jurgen', 'Pep', 'Carlo', 'Zinedine', 'Diego', 'Jose', 'Luis', 'Mikel', 'Unai', 'Xabi'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Klopp', 'Guardiola', 'Ancelotti', 'Zidane', 'Simeone', 'Mourinho', 'Enrique', 'Arteta', 'Emery', 'Alonso'];
const STYLES: Coach['style'][] = ['Attacking', 'Defensive', 'Possession', 'Counter', 'Balanced'];
const FORMATIONS: Coach['preferredFormation'][] = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2'];

export const generateRandomCoach = (tier: 'Top' | 'Mid' | 'Lower'): Coach => {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    let minPrestige = 0;
    let maxPrestige = 100;
    let salaryBase = 0;

    switch (tier) {
        case 'Top':
            minPrestige = 80;
            maxPrestige = 100;
            salaryBase = 150000;
            break;
        case 'Mid':
            minPrestige = 60;
            maxPrestige = 79;
            salaryBase = 50000;
            break;
        case 'Lower':
            minPrestige = 30;
            maxPrestige = 59;
            salaryBase = 15000;
            break;
    }

    const prestige = Math.floor(Math.random() * (maxPrestige - minPrestige + 1)) + minPrestige;
    const salary = Math.floor(salaryBase * (1 + (Math.random() * 0.5))); // Random variation
    const signingBonus = salary * 10; // Approx 10 weeks salary as signing bonus

    return {
        id: `coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${firstName} ${lastName}`,
        age: Math.floor(Math.random() * 30) + 35, // 35-65
        nationality: 'Unknown', // Placeholder
        style: STYLES[Math.floor(Math.random() * STYLES.length)],
        prestige,
        salary,
        signingBonus,
        preferredFormation: FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)],
        youthDevelopment: Math.floor(Math.random() * 100),
        riskTolerance: Math.floor(Math.random() * 100),
        satisfactionLevel: 80, // Start with good satisfaction
        requestedSignings: [],
        tacticalNotes: 'Listo para comenzar el proyecto.'
    };
};

export const generateCoachMarket = (count: number): Coach[] => {
    const coaches: Coach[] = [];
    for (let i = 0; i < count; i++) {
        const tierRandom = Math.random();
        let tier: 'Top' | 'Mid' | 'Lower' = 'Lower';
        if (tierRandom > 0.8) tier = 'Top';
        else if (tierRandom > 0.5) tier = 'Mid';

        coaches.push(generateRandomCoach(tier));
    }
    return coaches;
};

export const getTacticalMatchup = (homeStyle: Coach['style'], awayStyle: Coach['style']): { homeAdvantage: number, description: string } => {
    // Rock-Paper-Scissors logic for tactics
    // Attacking > Defensive (breaks down)
    // Defensive > Counter (absorbs and frustrates)
    // Counter > Possession (hits on break)
    // Possession > Attacking (controls tempo)
    // Balanced is neutral

    if (homeStyle === awayStyle) return { homeAdvantage: 0, description: 'Choque de estilos similares' };

    if (homeStyle === 'Attacking' && awayStyle === 'Defensive') return { homeAdvantage: 5, description: 'Ataque rompe defensa' };
    if (homeStyle === 'Defensive' && awayStyle === 'Attacking') return { homeAdvantage: -5, description: 'Defensa superada por ataque' };

    if (homeStyle === 'Defensive' && awayStyle === 'Counter') return { homeAdvantage: 5, description: 'Defensa neutraliza contraataque' };
    if (homeStyle === 'Counter' && awayStyle === 'Defensive') return { homeAdvantage: -5, description: 'Contraataque bloqueado' };

    if (homeStyle === 'Counter' && awayStyle === 'Possession') return { homeAdvantage: 5, description: 'Contraataque letal contra posesión' };
    if (homeStyle === 'Possession' && awayStyle === 'Counter') return { homeAdvantage: -5, description: 'Posesión vulnerable a la contra' };

    if (homeStyle === 'Possession' && awayStyle === 'Attacking') return { homeAdvantage: 5, description: 'Posesión controla al ataque' };
    if (homeStyle === 'Attacking' && awayStyle === 'Possession') return { homeAdvantage: -5, description: 'Ataque neutralizado por posesión' };

    return { homeAdvantage: 0, description: 'Duelo táctico equilibrado' };
};
