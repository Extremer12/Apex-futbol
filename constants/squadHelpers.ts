import { Player } from '../types';

/**
 * Generates a generic squad for Championship teams
 * @param startId - Starting ID for player generation
 * @param teamName - Name of the team
 * @returns Array of Player objects
 */
export const createGenericSquad = (startId: number, teamName: string): Player[] => {
    const positions: { pos: 'POR' | 'DEF' | 'CEN' | 'DEL', count: number }[] = [
        { pos: 'POR', count: 2 },
        { pos: 'DEF', count: 6 },
        { pos: 'CEN', count: 6 },
        { pos: 'DEL', count: 4 }
    ];

    const squad: Player[] = [];
    let idCounter = startId;

    positions.forEach(({ pos, count }) => {
        for (let i = 0; i < count; i++) {
            squad.push({
                id: idCounter++,
                name: `${teamName} ${pos} ${i + 1}`,
                position: pos,
                rating: Math.floor(65 + Math.random() * 10), // Rating 65-75 for Championship
                value: Math.floor(1 + Math.random() * 10),
                wage: Math.floor(5000 + Math.random() * 15000),
                morale: 'Normal',
                contractYears: Math.floor(1 + Math.random() * 3),
                age: Math.floor(18 + Math.random() * 15)
            });
        }
    });

    return squad;
};
