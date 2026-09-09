import { Team, LeagueId } from '../../types';
import { createGenericSquad } from './helpers';

export interface ConmebolTeamMeta {
    country: 'ARG' | 'BRA' | 'BOL' | 'CHI' | 'COL' | 'ECU' | 'PAR' | 'PER' | 'URU' | 'VEN';
    conmebolRanking: number; // 1 (best) to 100+
}

export const SOUTH_AMERICAN_EXTRA_TEAMS: (Team & ConmebolTeamMeta)[] = [
    // --- CHILE (4) ---
    {
        id: 9101,
        name: 'Colo-Colo',
        shortName: 'Colo-Colo',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Chile/colo-colo.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA, // fallback league ID
        budget: 18000000,
        transferBudget: 6000000,
        tier: 'UpperMid',
        teamMorale: 'Feliz',
        primaryColor: '#FFFFFF',
        secondaryColor: '#000000',
        country: 'CHI',
        conmebolRanking: 18,
        squad: createGenericSquad(9101, 'Colo-Colo', 75, '#FFFFFF', '#000000')
    },
    {
        id: 9102,
        name: 'Universidad de Chile',
        shortName: 'U. de Chile',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 14000000,
        transferBudget: 4500000,
        tier: 'UpperMid',
        teamMorale: 'Normal',
        primaryColor: '#003DA5',
        secondaryColor: '#C8102E',
        country: 'CHI',
        conmebolRanking: 32,
        squad: createGenericSquad(9102, 'U. de Chile', 74, '#003DA5', '#C8102E')
    },
    {
        id: 9103,
        name: 'Universidad Católica',
        shortName: 'U. Católica',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 13000000,
        transferBudget: 4000000,
        tier: 'MidTable',
        teamMorale: 'Contento',
        primaryColor: '#0055A5',
        secondaryColor: '#FFFFFF',
        country: 'CHI',
        conmebolRanking: 38,
        squad: createGenericSquad(9103, 'U. Católica', 73, '#0055A5', '#FFFFFF')
    },
    {
        id: 9104,
        name: 'Huachipato',
        shortName: 'Huachipato',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 9000000,
        transferBudget: 2500000,
        tier: 'MidTable',
        teamMorale: 'Contento',
        primaryColor: '#003366',
        secondaryColor: '#000000',
        country: 'CHI',
        conmebolRanking: 55,
        squad: createGenericSquad(9104, 'Huachipato', 71, '#003366', '#000000')
    },

    // --- COLOMBIA (4) ---
    {
        id: 9105,
        name: 'Atlético Nacional',
        shortName: 'Atl. Nacional',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 19000000,
        transferBudget: 6500000,
        tier: 'UpperMid',
        teamMorale: 'Feliz',
        primaryColor: '#00843D',
        secondaryColor: '#FFFFFF',
        country: 'COL',
        conmebolRanking: 16,
        squad: createGenericSquad(9105, 'Atl. Nacional', 76, '#00843D', '#FFFFFF')
    },
    {
        id: 9106,
        name: 'Millonarios',
        shortName: 'Millonarios',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 15000000,
        transferBudget: 5000000,
        tier: 'UpperMid',
        teamMorale: 'Contento',
        primaryColor: '#0033A0',
        secondaryColor: '#FFFFFF',
        country: 'COL',
        conmebolRanking: 30,
        squad: createGenericSquad(9106, 'Millonarios', 74, '#0033A0', '#FFFFFF')
    },
    {
        id: 9107,
        name: 'Junior de Barranquilla',
        shortName: 'Junior',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 16000000,
        transferBudget: 5500000,
        tier: 'UpperMid',
        teamMorale: 'Contento',
        primaryColor: '#DA291C',
        secondaryColor: '#FFFFFF',
        country: 'COL',
        conmebolRanking: 28,
        squad: createGenericSquad(9107, 'Junior', 74, '#DA291C', '#FFFFFF')
    },
    {
        id: 9108,
        name: 'Independiente Santa Fe',
        shortName: 'Santa Fe',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 11000000,
        transferBudget: 3500000,
        tier: 'MidTable',
        teamMorale: 'Contento',
        primaryColor: '#E4002B',
        secondaryColor: '#FFFFFF',
        country: 'COL',
        conmebolRanking: 44,
        squad: createGenericSquad(9108, 'Santa Fe', 72, '#E4002B', '#FFFFFF')
    },

    // --- BOLIVIA (4) ---
    {
        id: 9109,
        name: 'Club Bolívar',
        shortName: 'Bolívar',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 12000000,
        transferBudget: 4000000,
        tier: 'MidTable',
        teamMorale: 'Feliz',
        primaryColor: '#00A3E0',
        secondaryColor: '#FFFFFF',
        country: 'BOL',
        conmebolRanking: 27,
        squad: createGenericSquad(9109, 'Bolívar', 73, '#00A3E0', '#FFFFFF')
    },
    {
        id: 9110,
        name: 'The Strongest',
        shortName: 'The Strongest',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 10000000,
        transferBudget: 3200000,
        tier: 'MidTable',
        teamMorale: 'Contento',
        primaryColor: '#FFD100',
        secondaryColor: '#000000',
        country: 'BOL',
        conmebolRanking: 36,
        squad: createGenericSquad(9110, 'The Strongest', 72, '#FFD100', '#000000')
    },
    {
        id: 9111,
        name: 'Always Ready',
        shortName: 'Always Ready',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 8000000,
        transferBudget: 2200000,
        tier: 'LowerMid',
        teamMorale: 'Normal',
        primaryColor: '#D22630',
        secondaryColor: '#FFFFFF',
        country: 'BOL',
        conmebolRanking: 62,
        squad: createGenericSquad(9111, 'Always Ready', 70, '#D22630', '#FFFFFF')
    },
    {
        id: 9112,
        name: 'Jorge Wilstermann',
        shortName: 'Wilstermann',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 7000000,
        transferBudget: 1800000,
        tier: 'LowerMid',
        teamMorale: 'Normal',
        primaryColor: '#C8102E',
        secondaryColor: '#002B49',
        country: 'BOL',
        conmebolRanking: 68,
        squad: createGenericSquad(9112, 'Wilstermann', 69, '#C8102E', '#002B49')
    },

    // --- ECUADOR (4) ---
    {
        id: 9113,
        name: 'LDU Quito',
        shortName: 'LDU Quito',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 18000000,
        transferBudget: 6000000,
        tier: 'UpperMid',
        teamMorale: 'Feliz',
        primaryColor: '#FFFFFF',
        secondaryColor: '#C8102E',
        country: 'ECU',
        conmebolRanking: 12,
        squad: createGenericSquad(9113, 'LDU Quito', 76, '#FFFFFF', '#C8102E')
    },
    {
        id: 9114,
        name: 'Independiente del Valle',
        shortName: 'IDV',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 17000000,
        transferBudget: 5500000,
        tier: 'UpperMid',
        teamMorale: 'Feliz',
        primaryColor: '#002F6C',
        secondaryColor: '#D8262E',
        country: 'ECU',
        conmebolRanking: 10,
        squad: createGenericSquad(9114, 'IDV', 76, '#002F6C', '#D8262E')
    },
    {
        id: 9115,
        name: 'Barcelona SC',
        shortName: 'Barcelona SC',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 15000000,
        transferBudget: 5000000,
        tier: 'UpperMid',
        teamMorale: 'Contento',
        primaryColor: '#FFD100',
        secondaryColor: '#000000',
        country: 'ECU',
        conmebolRanking: 22,
        squad: createGenericSquad(9115, 'Barcelona SC', 74, '#FFD100', '#000000')
    },
    {
        id: 9116,
        name: 'CS Emelec',
        shortName: 'Emelec',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 12000000,
        transferBudget: 3800000,
        tier: 'MidTable',
        teamMorale: 'Contento',
        primaryColor: '#0033A0',
        secondaryColor: '#888888',
        country: 'ECU',
        conmebolRanking: 34,
        squad: createGenericSquad(9116, 'Emelec', 73, '#0033A0', '#888888')
    },

    // --- PERÚ (4) ---
    {
        id: 9117,
        name: 'Universitario de Deportes',
        shortName: 'Universitario',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 14000000,
        transferBudget: 4500000,
        tier: 'UpperMid',
        teamMorale: 'Feliz',
        primaryColor: '#FFFDD0',
        secondaryColor: '#800000',
        country: 'PER',
        conmebolRanking: 31,
        squad: createGenericSquad(9117, 'Universitario', 74, '#FFFDD0', '#800000')
    },
    {
        id: 9118,
        name: 'Alianza Lima',
        shortName: 'Alianza Lima',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 13000000,
        transferBudget: 4200000,
        tier: 'UpperMid',
        teamMorale: 'Contento',
        primaryColor: '#002B49',
        secondaryColor: '#FFFFFF',
        country: 'PER',
        conmebolRanking: 37,
        squad: createGenericSquad(9118, 'Alianza Lima', 73, '#002B49', '#FFFFFF')
    },
    {
        id: 9119,
        name: 'Sporting Cristal',
        shortName: 'Sp. Cristal',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 12000000,
        transferBudget: 3800000,
        tier: 'MidTable',
        teamMorale: 'Contento',
        primaryColor: '#6CACE4',
        secondaryColor: '#FFFFFF',
        country: 'PER',
        conmebolRanking: 40,
        squad: createGenericSquad(9119, 'Sp. Cristal', 73, '#6CACE4', '#FFFFFF')
    },
    {
        id: 9120,
        name: 'FBC Melgar',
        shortName: 'Melgar',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 9000000,
        transferBudget: 2500000,
        tier: 'MidTable',
        teamMorale: 'Normal',
        primaryColor: '#C8102E',
        secondaryColor: '#000000',
        country: 'PER',
        conmebolRanking: 52,
        squad: createGenericSquad(9120, 'Melgar', 71, '#C8102E', '#000000')
    },

    // --- URUGUAY (4) ---
    {
        id: 9121,
        name: 'Peñarol',
        shortName: 'Peñarol',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 19000000,
        transferBudget: 6500000,
        tier: 'UpperMid',
        teamMorale: 'Feliz',
        primaryColor: '#FFD100',
        secondaryColor: '#000000',
        country: 'URU',
        conmebolRanking: 9,
        squad: createGenericSquad(9121, 'Peñarol', 76, '#FFD100', '#000000')
    },
    {
        id: 9122,
        name: 'Club Nacional de Football',
        shortName: 'Nacional (Uru)',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 18000000,
        transferBudget: 6000000,
        tier: 'UpperMid',
        teamMorale: 'Feliz',
        primaryColor: '#FFFFFF',
        secondaryColor: '#002B49',
        country: 'URU',
        conmebolRanking: 8,
        squad: createGenericSquad(9122, 'Nacional (Uru)', 76, '#FFFFFF', '#002B49')
    },
    {
        id: 9123,
        name: 'Defensor Sporting',
        shortName: 'Defensor Sp.',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 9000000,
        transferBudget: 2600000,
        tier: 'MidTable',
        teamMorale: 'Contento',
        primaryColor: '#5C2D91',
        secondaryColor: '#FFFFFF',
        country: 'URU',
        conmebolRanking: 48,
        squad: createGenericSquad(9123, 'Defensor Sp.', 72, '#5C2D91', '#FFFFFF')
    },
    {
        id: 9124,
        name: 'Liverpool FC (Uru)',
        shortName: 'Liverpool (Uru)',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 8000000,
        transferBudget: 2200000,
        tier: 'MidTable',
        teamMorale: 'Normal',
        primaryColor: '#002B49',
        secondaryColor: '#000000',
        country: 'URU',
        conmebolRanking: 58,
        squad: createGenericSquad(9124, 'Liverpool (Uru)', 71, '#002B49', '#000000')
    },

    // --- VENEZUELA (4) ---
    {
        id: 9125,
        name: 'Deportivo Táchira',
        shortName: 'Dep. Táchira',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 9000000,
        transferBudget: 2500000,
        tier: 'MidTable',
        teamMorale: 'Contento',
        primaryColor: '#FFD100',
        secondaryColor: '#000000',
        country: 'VEN',
        conmebolRanking: 45,
        squad: createGenericSquad(9125, 'Dep. Táchira', 71, '#FFD100', '#000000')
    },
    {
        id: 9126,
        name: 'Caracas FC',
        shortName: 'Caracas FC',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 8000000,
        transferBudget: 2200000,
        tier: 'MidTable',
        teamMorale: 'Normal',
        primaryColor: '#C8102E',
        secondaryColor: '#000000',
        country: 'VEN',
        conmebolRanking: 50,
        squad: createGenericSquad(9126, 'Caracas FC', 70, '#C8102E', '#000000')
    },
    {
        id: 9127,
        name: 'Carabobo FC',
        shortName: 'Carabobo',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 6500000,
        transferBudget: 1600000,
        tier: 'LowerMid',
        teamMorale: 'Normal',
        primaryColor: '#800020',
        secondaryColor: '#FFFFFF',
        country: 'VEN',
        conmebolRanking: 72,
        squad: createGenericSquad(9127, 'Carabobo', 69, '#800020', '#FFFFFF')
    },
    {
        id: 9128,
        name: 'Monagas SC',
        shortName: 'Monagas',
        logo: '',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 6000000,
        transferBudget: 1400000,
        tier: 'LowerMid',
        teamMorale: 'Normal',
        primaryColor: '#0033A0',
        secondaryColor: '#C8102E',
        country: 'VEN',
        conmebolRanking: 78,
        squad: createGenericSquad(9128, 'Monagas', 68, '#0033A0', '#C8102E')
    }
];

// Map of CONMEBOL ranking points and country for Argentina, Brazil and Paraguay teams
export const KNOWN_CONMEBOL_META: Record<string, { country: ConmebolTeamMeta['country']; ranking: number }> = {
    // Argentina
    'River Plate': { country: 'ARG', ranking: 1 },
    'Palmeiras': { country: 'BRA', ranking: 2 },
    'Flamengo': { country: 'BRA', ranking: 3 },
    'Boca Juniors': { country: 'ARG', ranking: 4 },
    'São Paulo': { country: 'BRA', ranking: 5 },
    'Fluminense': { country: 'BRA', ranking: 6 },
    'Atlético Mineiro': { country: 'BRA', ranking: 7 },
    'Club Nacional de Football': { country: 'URU', ranking: 8 },
    'Peñarol': { country: 'URU', ranking: 9 },
    'Independiente del Valle': { country: 'ECU', ranking: 10 },
    'Club Olimpia': { country: 'PAR', ranking: 11 },
    'LDU Quito': { country: 'ECU', ranking: 12 },
    'Racing Club': { country: 'ARG', ranking: 13 },
    'Sport Club Internacional': { country: 'BRA', ranking: 14 },
    'Grêmio': { country: 'BRA', ranking: 15 },
    'Atlético Nacional': { country: 'COL', ranking: 16 },
    'Cerro Porteño': { country: 'PAR', ranking: 17 },
    'Colo-Colo': { country: 'CHI', ranking: 18 },
    'Estudiantes de La Plata': { country: 'ARG', ranking: 19 },
    'Club Libertad': { country: 'PAR', ranking: 20 },
    'Botafogo': { country: 'BRA', ranking: 21 },
    'Barcelona SC': { country: 'ECU', ranking: 22 },
    'Vélez Sarsfield': { country: 'ARG', ranking: 23 },
    'Corinthians': { country: 'BRA', ranking: 24 },
    'San Lorenzo': { country: 'ARG', ranking: 25 },
    'Talleres (Córdoba)': { country: 'ARG', ranking: 26 },
    'Club Bolívar': { country: 'BOL', ranking: 27 },
    'Junior de Barranquilla': { country: 'COL', ranking: 28 },
    'Defensa y Justicia': { country: 'ARG', ranking: 29 },
    'Millonarios': { country: 'COL', ranking: 30 },
};

export const getTeamConmebolMeta = (team: Team): ConmebolTeamMeta => {
    // Check if team is in extra list
    const extra = SOUTH_AMERICAN_EXTRA_TEAMS.find(t => t.id === team.id);
    if (extra) {
        return { country: extra.country, conmebolRanking: extra.conmebolRanking };
    }
    // Check by name in known meta
    const match = KNOWN_CONMEBOL_META[team.name] || KNOWN_CONMEBOL_META[team.shortName || ''];
    if (match) {
        return { country: match.country, conmebolRanking: match.ranking };
    }
    // Fallback by leagueId
    if (team.leagueId === LeagueId.LIGA_ARGENTINA || team.leagueId === LeagueId.PRIMERA_NACIONAL) {
        return { country: 'ARG', conmebolRanking: 40 + (team.id % 40) };
    }
    if (team.leagueId === LeagueId.BRASILEIRAO || team.leagueId === LeagueId.SERIE_B_BR) {
        return { country: 'BRA', conmebolRanking: 25 + (team.id % 40) };
    }
    if (team.leagueId === LeagueId.COPA_DE_PRIMERA) {
        return { country: 'PAR', conmebolRanking: 35 + (team.id % 35) };
    }
    return { country: 'ARG', conmebolRanking: 99 };
};
