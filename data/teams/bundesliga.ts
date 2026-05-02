import { Team, LeagueId } from '../../types';
import { createGenericSquad } from './helpers';

export const bundesligaTeams: Team[] = [
    {
        id: 401,
        name: 'Bayern München',
        logo: 'https://tmssl.akamaized.net/images/wappen/head/27.png',
        leagueId: LeagueId.BUNDESLIGA,
        budget: 150000000,
        transferBudget: 80000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#DC052D',
        secondaryColor: '#FFFFFF',
        tactics: 'Attacking',
        squad: [
            { id: 40101, name: 'Manuel Neuer', position: 'POR', rating: 88, value: 12000000, wage: 300000, morale: 'Feliz' },
            { id: 40102, name: 'Harry Kane', position: 'DEL', rating: 90, value: 110000000, wage: 450000, morale: 'Feliz' },
            { id: 40103, name: 'Jamal Musiala', position: 'CEN', rating: 86, value: 110000000, wage: 200000, morale: 'Feliz' },
            { id: 40104, name: 'Joshua Kimmich', position: 'CEN', rating: 87, value: 75000000, wage: 350000, morale: 'Feliz' },
            { id: 40105, name: 'Matthijs de Ligt', position: 'DEF', rating: 85, value: 65000000, wage: 280000, morale: 'Feliz' }
        ]
    },
    {
        id: 402,
        name: 'Borussia Dortmund',
        logo: 'https://tmssl.akamaized.net/images/wappen/head/16.png',
        leagueId: LeagueId.BUNDESLIGA,
        budget: 90000000,
        transferBudget: 45000000,
        tier: 'Top',
        teamMorale: 'Contento',
        primaryColor: '#FDE100',
        secondaryColor: '#000000',
        tactics: 'Attacking',
        squad: [
            { id: 40201, name: 'Gregor Kobel', position: 'POR', rating: 87, value: 40000000, wage: 120000, morale: 'Contento' },
            { id: 40202, name: 'Julian Brandt', position: 'CEN', rating: 84, value: 40000000, wage: 150000, morale: 'Contento' },
            { id: 40203, name: 'Niclas Füllkrug', position: 'DEL', rating: 82, value: 15000000, wage: 100000, morale: 'Contento' },
            { id: 40204, name: 'Nico Schlotterbeck', position: 'DEF', rating: 83, value: 40000000, wage: 110000, morale: 'Contento' }
        ]
    },
    {
        id: 403,
        name: 'Bayer Leverkusen',
        logo: 'https://tmssl.akamaized.net/images/wappen/head/15.png',
        leagueId: LeagueId.BUNDESLIGA,
        budget: 85000000,
        transferBudget: 40000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#E32221',
        secondaryColor: '#000000',
        tactics: 'Attacking',
        squad: [
            { id: 40301, name: 'Lukas Hradecky', position: 'POR', rating: 83, value: 5000000, wage: 80000, morale: 'Feliz' },
            { id: 40302, name: 'Florian Wirtz', position: 'CEN', rating: 87, value: 110000000, wage: 150000, morale: 'Feliz' },
            { id: 40303, name: 'Alejandro Grimaldo', position: 'DEF', rating: 84, value: 45000000, wage: 120000, morale: 'Feliz' },
            { id: 40304, name: 'Victor Boniface', position: 'DEL', rating: 82, value: 40000000, wage: 90000, morale: 'Feliz' }
        ]
    },
    {
        id: 404,
        name: 'RB Leipzig',
        logo: 'https://tmssl.akamaized.net/images/wappen/head/23826.png',
        leagueId: LeagueId.BUNDESLIGA,
        budget: 80000000,
        transferBudget: 35000000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#DD013F',
        secondaryColor: '#FFFFFF',
        tactics: 'Attacking',
        squad: [
            { id: 40401, name: 'Peter Gulacsi', position: 'POR', rating: 82, value: 3000000, wage: 90000, morale: 'Normal' },
            { id: 40402, name: 'Xavi Simons', position: 'CEN', rating: 84, value: 80000000, wage: 120000, morale: 'Normal' },
            { id: 40403, name: 'Loïs Openda', position: 'DEL', rating: 83, value: 60000000, wage: 110000, morale: 'Normal' }
        ]
    },
    {
        id: 405,
        name: 'Eintracht Frankfurt',
        logo: 'https://tmssl.akamaized.net/images/wappen/head/24.png',
        leagueId: LeagueId.BUNDESLIGA,
        budget: 45000000,
        transferBudget: 20000000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#E1001A',
        secondaryColor: '#000000',
        tactics: 'Balanced',
        squad: [
            { id: 40501, name: 'Kevin Trapp', position: 'POR', rating: 82, value: 6000000, wage: 100000, morale: 'Normal' },
            { id: 40502, name: 'Mario Götze', position: 'CEN', rating: 80, value: 10000000, wage: 110000, morale: 'Normal' }
        ]
    },
    { id: 406, name: 'VfB Stuttgart', logo: 'https://tmssl.akamaized.net/images/wappen/head/79.png', leagueId: LeagueId.BUNDESLIGA, budget: 40000000, transferBudget: 15000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#E32221', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(40600, 'Stuttgart') },
    { id: 407, name: 'SC Freiburg', logo: 'https://tmssl.akamaized.net/images/wappen/head/60.png', leagueId: LeagueId.BUNDESLIGA, budget: 35000000, transferBudget: 12000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#000000', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(40700, 'Freiburg') },
    { id: 408, name: 'TSG Hoffenheim', logo: 'https://tmssl.akamaized.net/images/wappen/head/533.png', leagueId: LeagueId.BUNDESLIGA, budget: 30000000, transferBudget: 10000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#1C63B7', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(40800, 'Hoffenheim') },
    { id: 409, name: '1. FC Heidenheim', logo: 'https://tmssl.akamaized.net/images/wappen/head/2036.png', leagueId: LeagueId.BUNDESLIGA, budget: 15000000, transferBudget: 5000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#E2001A', secondaryColor: '#FFFFFF', tactics: 'Defensive', squad: createGenericSquad(40900, 'Heidenheim') },
    { id: 410, name: 'Werder Bremen', logo: 'https://tmssl.akamaized.net/images/wappen/head/86.png', leagueId: LeagueId.BUNDESLIGA, budget: 25000000, transferBudget: 8000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#1D9053', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(41000, 'Bremen') },
    { id: 411, name: 'FC Augsburg', logo: 'https://tmssl.akamaized.net/images/wappen/head/167.png', leagueId: LeagueId.BUNDESLIGA, budget: 20000000, transferBudget: 6000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#BA171E', secondaryColor: '#FFFFFF', tactics: 'Defensive', squad: createGenericSquad(41100, 'Augsburg') },
    { id: 412, name: 'VfL Wolfsburg', logo: 'https://tmssl.akamaized.net/images/wappen/head/82.png', leagueId: LeagueId.BUNDESLIGA, budget: 45000000, transferBudget: 15000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#65A90E', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(41200, 'Wolfsburg') },
    { id: 413, name: 'FSV Mainz 05', logo: 'https://tmssl.akamaized.net/images/wappen/head/39.png', leagueId: LeagueId.BUNDESLIGA, budget: 20000000, transferBudget: 6000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#ED1C24', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(41300, 'Mainz') },
    { id: 414, name: 'Bor. Mönchengladbach', logo: 'https://tmssl.akamaized.net/images/wappen/head/18.png', leagueId: LeagueId.BUNDESLIGA, budget: 35000000, transferBudget: 10000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#000000', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(41400, 'Gladbach') },
    { id: 415, name: 'VfL Bochum', logo: 'https://tmssl.akamaized.net/images/wappen/head/80.png', leagueId: LeagueId.BUNDESLIGA, budget: 15000000, transferBudget: 4000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#005CA9', secondaryColor: '#FFFFFF', tactics: 'Defensive', squad: createGenericSquad(41500, 'Bochum') },
    { id: 416, name: 'Union Berlin', logo: 'https://tmssl.akamaized.net/images/wappen/head/898.png', leagueId: LeagueId.BUNDESLIGA, budget: 25000000, transferBudget: 8000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#ED1C24', secondaryColor: '#FEE100', tactics: 'Defensive', squad: createGenericSquad(41600, 'Union') },
    { id: 417, name: 'FC St. Pauli', logo: 'https://tmssl.akamaized.net/images/wappen/head/35.png', leagueId: LeagueId.BUNDESLIGA, budget: 15000000, transferBudget: 5000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#533527', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(41700, 'St. Pauli') },
    { id: 418, name: 'Holstein Kiel', logo: 'https://tmssl.akamaized.net/images/wappen/head/269.png', leagueId: LeagueId.BUNDESLIGA, budget: 15000000, transferBudget: 5000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#004A99', secondaryColor: '#FFFFFF', tactics: 'Defensive', squad: createGenericSquad(41800, 'Kiel') }
];
