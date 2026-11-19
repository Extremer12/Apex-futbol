import { Coach, Team, LeagueId } from '../types';

const FIRST_NAMES_LATAM = ['Marcelo', 'Gustavo', 'Eduardo', 'Jorge', 'Diego', 'Gabriel', 'Ricardo', 'Fernando', 'Guillermo', 'Lucas', 'Mauricio', 'Renato', 'Alejandro', 'Hernán', 'Martín'];
const LAST_NAMES_LATAM = ['Gallardo', 'Almirón', 'Coudet', 'Sampaoli', 'Simeone', 'Milito', 'Gareca', 'Crespo', 'Heinze', 'Zubeldía', 'Demichelis', 'Schelotto', 'Medina', 'Domínguez'];

const FIRST_NAMES_EUR = ['Jurgen', 'Pep', 'Carlo', 'Zinedine', 'Mikel', 'Unai', 'Xabi', 'Thomas', 'Julian', 'Antonio', 'Massimiliano', 'Roberto', 'Erik', 'Luciano'];
const LAST_NAMES_EUR = ['Klopp', 'Guardiola', 'Ancelotti', 'Zidane', 'Arteta', 'Emery', 'Alonso', 'Tuchel', 'Nagelsmann', 'Conte', 'Allegri', 'De Zerbi', 'Ten Hag', 'Spalletti'];

const STYLES: Coach['style'][] = ['Attacking', 'Defensive', 'Possession', 'Counter', 'Balanced'];
const FORMATIONS: Coach['preferredFormation'][] = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2'];

export const generateRandomCoach = (tier: 'Top' | 'Mid' | 'Lower', leagueId?: string): Coach => {
    const isSouthAm = leagueId && [
        LeagueId.LIGA_ARGENTINA, LeagueId.PRIMERA_NACIONAL,
        LeagueId.BRASILEIRAO, LeagueId.SERIE_B_BR,
        LeagueId.COPA_DE_PRIMERA, LeagueId.PRIMERA_DIVISION_CHILE, LeagueId.PRIMERA_B_CHILE,
        LeagueId.PRIMERA_A_COLOMBIA, LeagueId.PRIMERA_B_COLOMBIA,
        'LIGA_ARGENTINA', 'PRIMERA_NACIONAL', 'BRASILEIRAO', 'SERIE_B_BR', 'COPA_DE_PRIMERA', 'PRIMERA_A_COLOMBIA'
    ].includes(leagueId as any);

    const isMex = leagueId && [LeagueId.LIGA_MX, LeagueId.LIGA_EXPANSION_MX, 'LIGA_MX'].includes(leagueId as any);
    const regionScale = isSouthAm ? 0.22 : isMex ? 0.42 : 1.0;

    const firstNames = (isSouthAm || isMex || Math.random() < 0.4) ? FIRST_NAMES_LATAM : FIRST_NAMES_EUR;
    const lastNames = (isSouthAm || isMex || Math.random() < 0.4) ? LAST_NAMES_LATAM : LAST_NAMES_EUR;

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    let minPrestige = 0;
    let maxPrestige = 100;
    let salaryBase = 0;

    switch (tier) {
        case 'Top':
            minPrestige = 80;
            maxPrestige = 98;
            salaryBase = 120000;
            break;
        case 'Mid':
            minPrestige = 62;
            maxPrestige = 82;
            salaryBase = 45000;
            break;
        case 'Lower':
            minPrestige = 38;
            maxPrestige = 65;
            salaryBase = 16000;
            break;
    }

    const prestige = Math.floor(Math.random() * (maxPrestige - minPrestige + 1)) + minPrestige;
    const salary = Math.floor(salaryBase * regionScale * (prestige / 75) * (0.85 + Math.random() * 0.3));
    const signingBonus = Math.floor(salary * 6 + (prestige * (isSouthAm ? 800 : 3000)));

    const nationality = isSouthAm
        ? (Math.random() > 0.4 ? 'Argentina' : Math.random() > 0.5 ? 'Brasil' : 'Uruguay')
        : isMex
        ? (Math.random() > 0.4 ? 'México' : 'Argentina')
        : (['España', 'Italia', 'Alemania', 'Francia', 'Inglaterra', 'Portugal'][Math.floor(Math.random() * 6)]);

    return {
        id: `coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${firstName} ${lastName}`,
        age: Math.floor(Math.random() * 26) + 38, // 38-64
        nationality,
        style: STYLES[Math.floor(Math.random() * STYLES.length)],
        prestige,
        salary,
        signingBonus,
        preferredFormation: FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)],
        youthDevelopment: Math.floor(Math.random() * 40) + 55,
        riskTolerance: Math.floor(Math.random() * 50) + 30,
        satisfactionLevel: 80,
        requestedSignings: [],
        tacticalNotes: 'Listo para comenzar el proyecto.'
    };
};

export const generateCoachMarket = (count: number, leagueId?: string, clubTier: 'Top' | 'Mid' | 'Lower' = 'Mid'): Coach[] => {
    const coaches: Coach[] = [];
    for (let i = 0; i < count; i++) {
        const tierRandom = Math.random();
        let tier: 'Top' | 'Mid' | 'Lower' = 'Lower';
        if (tierRandom > 0.65) tier = clubTier === 'Top' ? 'Top' : 'Mid';
        else if (tierRandom > 0.3) tier = 'Mid';
        else tier = 'Lower';

        coaches.push(generateRandomCoach(tier, leagueId));
    }
    return coaches;
};

export const normalizeTacticalStyle = (style?: string): 'Attacking' | 'Defensive' | 'Possession' | 'Counter' | 'Balanced' => {
    if (!style) return 'Balanced';
    const s = style.toLowerCase();
    if (s.includes('attack') || s.includes('ofens')) return 'Attacking';
    if (s.includes('defens')) return 'Defensive';
    if (s.includes('posses') || s.includes('poses')) return 'Possession';
    if (s.includes('counter') || s.includes('contra')) return 'Counter';
    return 'Balanced';
};

export const getTacticalMatchup = (homeStyleRaw: Coach['style'] | string, awayStyleRaw: Coach['style'] | string): { homeAdvantage: number, description: string } => {
    const homeStyle = normalizeTacticalStyle(homeStyleRaw);
    const awayStyle = normalizeTacticalStyle(awayStyleRaw);

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
