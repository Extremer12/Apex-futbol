import { Team, LeagueId } from '../../types';
import { createGenericSquad } from './helpers';

export const serieATeams: Team[] = [
    {
        id: 501,
        name: 'Inter Milano',
        logo: 'https://tmssl.akamaized.net/images/wappen/head/46.png',
        leagueId: LeagueId.SERIE_A,
        budget: 100000000,
        transferBudget: 50000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#0066B2',
        secondaryColor: '#000000',
        tactics: 'Balanced',
        squad: [
            { id: 50101, name: 'Yann Sommer', position: 'POR', rating: 85, value: 5000000, wage: 150000, morale: 'Feliz' },
            { id: 50102, name: 'Lautaro Martínez', position: 'DEL', rating: 89, value: 110000000, wage: 350000, morale: 'Feliz' },
            { id: 50103, name: 'Nicolò Barella', position: 'CEN', rating: 87, value: 80000000, wage: 200000, morale: 'Feliz' },
            { id: 50104, name: 'Alessandro Bastoni', position: 'DEF', rating: 86, value: 70000000, wage: 180000, morale: 'Feliz' }
        ]
    },
    {
        id: 502,
        name: 'AC Milan',
        logo: 'https://tmssl.akamaized.net/images/wappen/head/5.png',
        leagueId: LeagueId.SERIE_A,
        budget: 85000000,
        transferBudget: 40000000,
        tier: 'Top',
        teamMorale: 'Contento',
        primaryColor: '#FB090B',
        secondaryColor: '#000000',
        tactics: 'Attacking',
        squad: [
            { id: 50201, name: 'Mike Maignan', position: 'POR', rating: 87, value: 45000000, wage: 140000, morale: 'Contento' },
            { id: 50202, name: 'Rafael Leão', position: 'DEL', rating: 87, value: 90000000, wage: 200000, morale: 'Contento' },
            { id: 50203, name: 'Theo Hernández', position: 'DEF', rating: 86, value: 60000000, wage: 160000, morale: 'Contento' }
        ]
    },
    {
        id: 503,
        name: 'Juventus',
        logo: 'https://tmssl.akamaized.net/images/wappen/head/506.png',
        leagueId: LeagueId.SERIE_A,
        budget: 80000000,
        transferBudget: 35000000,
        tier: 'Top',
        teamMorale: 'Normal',
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        tactics: 'Balanced',
        squad: [
            { id: 50301, name: 'Wojciech Szczęsny', position: 'POR', rating: 84, value: 8000000, wage: 200000, morale: 'Normal' },
            { id: 50302, name: 'Dušan Vlahović', position: 'DEL', rating: 85, value: 65000000, wage: 250000, morale: 'Normal' },
            { id: 50303, name: 'Federico Chiesa', position: 'DEL', rating: 84, value: 40000000, wage: 180000, morale: 'Normal' },
            { id: 50304, name: 'Bremer', position: 'DEF', rating: 85, value: 60000000, wage: 170000, morale: 'Normal' }
        ]
    },
    {
        id: 504,
        name: 'AS Roma',
        logo: 'https://tmssl.akamaized.net/images/wappen/head/12.png',
        leagueId: LeagueId.SERIE_A,
        budget: 50000000,
        transferBudget: 20000000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#8E1D2D',
        secondaryColor: '#F1B041',
        tactics: 'Balanced',
        squad: [
            { id: 50401, name: 'Paulo Dybala', position: 'DEL', rating: 86, value: 25000000, wage: 200000, morale: 'Normal' },
            { id: 50402, name: 'Romelu Lukaku', position: 'DEL', rating: 84, value: 30000000, wage: 250000, morale: 'Normal' }
        ]
    },
    {
        id: 505,
        name: 'SSC Napoli',
        logo: 'https://tmssl.akamaized.net/images/wappen/head/6195.png',
        leagueId: LeagueId.SERIE_A,
        budget: 70000000,
        transferBudget: 30000000,
        tier: 'Top',
        teamMorale: 'Contento',
        primaryColor: '#003E9E',
        secondaryColor: '#FFFFFF',
        tactics: 'Attacking',
        squad: [
            { id: 50501, name: 'Khvicha Kvaratskhelia', position: 'DEL', rating: 86, value: 80000000, wage: 150000, morale: 'Contento' },
            { id: 50502, name: 'Victor Osimhen', position: 'DEL', rating: 88, value: 110000000, wage: 250000, morale: 'Contento' }
        ]
    },
    { id: 506, name: 'Atalanta', logo: 'https://tmssl.akamaized.net/images/wappen/head/800.png', leagueId: LeagueId.SERIE_A, budget: 50000000, transferBudget: 20000000, tier: 'Top', teamMorale: 'Normal', primaryColor: '#12549E', secondaryColor: '#000000', tactics: 'Attacking', squad: createGenericSquad(50600, 'Atalanta') },
    { id: 507, name: 'Lazio', logo: 'https://tmssl.akamaized.net/images/wappen/head/398.png', leagueId: LeagueId.SERIE_A, budget: 45000000, transferBudget: 15000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#87D8F7', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(50700, 'Lazio') },
    { id: 508, name: 'Fiorentina', logo: 'https://tmssl.akamaized.net/images/wappen/head/430.png', leagueId: LeagueId.SERIE_A, budget: 40000000, transferBudget: 15000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#4A2583', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(50800, 'Fiorentina') },
    { id: 509, name: 'Torino', logo: 'https://tmssl.akamaized.net/images/wappen/head/416.png', leagueId: LeagueId.SERIE_A, budget: 30000000, transferBudget: 10000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#8A1538', secondaryColor: '#FFFFFF', tactics: 'Defensive', squad: createGenericSquad(50900, 'Torino') },
    { id: 510, name: 'Bologna', logo: 'https://tmssl.akamaized.net/images/wappen/head/1025.png', leagueId: LeagueId.SERIE_A, budget: 35000000, transferBudget: 12000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#1A2F48', secondaryColor: '#A01D21', tactics: 'Balanced', squad: createGenericSquad(51000, 'Bologna') },
    { id: 511, name: 'Genoa', logo: 'https://tmssl.akamaized.net/images/wappen/head/252.png', leagueId: LeagueId.SERIE_A, budget: 20000000, transferBudget: 8000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#CF0A2C', secondaryColor: '#00254C', tactics: 'Defensive', squad: createGenericSquad(51100, 'Genoa') },
    { id: 512, name: 'Monza', logo: 'https://tmssl.akamaized.net/images/wappen/head/2919.png', leagueId: LeagueId.SERIE_A, budget: 25000000, transferBudget: 10000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#E2001A', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(51200, 'Monza') },
    { id: 513, name: 'Lecce', logo: 'https://tmssl.akamaized.net/images/wappen/head/3322.png', leagueId: LeagueId.SERIE_A, budget: 15000000, transferBudget: 5000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#FFD700', secondaryColor: '#E2001A', tactics: 'Defensive', squad: createGenericSquad(51300, 'Lecce') },
    { id: 514, name: 'Udinese', logo: 'https://tmssl.akamaized.net/images/wappen/head/410.png', leagueId: LeagueId.SERIE_A, budget: 20000000, transferBudget: 8000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#000000', secondaryColor: '#FFFFFF', tactics: 'Defensive', squad: createGenericSquad(51400, 'Udinese') },
    { id: 515, name: 'Hellas Verona', logo: 'https://tmssl.akamaized.net/images/wappen/head/276.png', leagueId: LeagueId.SERIE_A, budget: 15000000, transferBudget: 5000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#002B5C', secondaryColor: '#FFD100', tactics: 'Defensive', squad: createGenericSquad(51500, 'Verona') },
    { id: 516, name: 'Empoli', logo: 'https://tmssl.akamaized.net/images/wappen/head/749.png', leagueId: LeagueId.SERIE_A, budget: 15000000, transferBudget: 4000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#005CA9', secondaryColor: '#FFFFFF', tactics: 'Defensive', squad: createGenericSquad(51600, 'Empoli') },
    { id: 517, name: 'Cagliari', logo: 'https://tmssl.akamaized.net/images/wappen/head/1390.png', leagueId: LeagueId.SERIE_A, budget: 18000000, transferBudget: 6000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#002649', secondaryColor: '#C4122E', tactics: 'Balanced', squad: createGenericSquad(51700, 'Cagliari') },
    { id: 518, name: 'Como', logo: 'https://tmssl.akamaized.net/images/wappen/head/1047.png', leagueId: LeagueId.SERIE_A, budget: 20000000, transferBudget: 10000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#005CA9', secondaryColor: '#FFFFFF', tactics: 'Balanced', squad: createGenericSquad(51800, 'Como') },
    { id: 519, name: 'Parma', logo: 'https://tmssl.akamaized.net/images/wappen/head/130.png', leagueId: LeagueId.SERIE_A, budget: 18000000, transferBudget: 8000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#FFCC00', secondaryColor: '#0033A0', tactics: 'Balanced', squad: createGenericSquad(51900, 'Parma') },
    { id: 520, name: 'Venezia', logo: 'https://tmssl.akamaized.net/images/wappen/head/607.png', leagueId: LeagueId.SERIE_A, budget: 15000000, transferBudget: 5000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#F26122', secondaryColor: '#009051', tactics: 'Defensive', squad: createGenericSquad(52000, 'Venezia') }
];
