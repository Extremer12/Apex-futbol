import { Team, LeagueId } from '../../types';

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
    }
];
