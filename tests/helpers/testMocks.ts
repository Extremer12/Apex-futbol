import { Player, Team, LeagueId } from '../../types';

// Helper to create a dummy player
export const createMockPlayer = (id: number, pos: Player['position'], rating = 75): Player => ({
    id,
    name: `Player ${id}`,
    position: pos,
    rating,
    value: 10,
    wage: 20000,
    morale: 'Normal',
    contractYears: 2,
    age: 24,
    isTransferListed: false,
    condition: 100,
    isInjured: false,
    isSuspended: false,
    stats: { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 }
});

// Helper to create a dummy team with full squad
export const createMockTeam = (id: number, name: string, leagueId: LeagueId = LeagueId.PREMIER_LEAGUE, rating = 75): Team => {
    const squad: Player[] = [
        createMockPlayer(id * 100 + 1, 'POR', rating),
        createMockPlayer(id * 100 + 2, 'DEF', rating),
        createMockPlayer(id * 100 + 3, 'DEF', rating),
        createMockPlayer(id * 100 + 4, 'DEF', rating),
        createMockPlayer(id * 100 + 5, 'DEF', rating),
        createMockPlayer(id * 100 + 6, 'CEN', rating),
        createMockPlayer(id * 100 + 7, 'CEN', rating),
        createMockPlayer(id * 100 + 8, 'CEN', rating),
        createMockPlayer(id * 100 + 9, 'CEN', rating),
        createMockPlayer(id * 100 + 10, 'DEL', rating),
        createMockPlayer(id * 100 + 11, 'DEL', rating),
        // Bench
        createMockPlayer(id * 100 + 12, 'POR', rating - 5),
        createMockPlayer(id * 100 + 13, 'DEF', rating - 5),
        createMockPlayer(id * 100 + 14, 'CEN', rating - 5),
        createMockPlayer(id * 100 + 15, 'DEL', rating - 5)
    ];

    return {
        id,
        name,
        logo: '',
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Normal',
        leagueId,
        tier: 'Top',
        budget: 50,
        transferBudget: 20,
        squad,
        coach: {
            id: String(id * 10),
            name: `Coach ${name}`,
            age: 45,
            nationality: 'Argentina',
            style: 'Balanced',
            prestige: 70,
            salary: 50000,
            signingBonus: 100000,
            preferredFormation: '4-4-2',
            youthDevelopment: 70,
            riskTolerance: 50,
            satisfactionLevel: 90,
            requestedSignings: [],
            tacticalNotes: ''
        },
        trophyCabinet: []
    };
};
