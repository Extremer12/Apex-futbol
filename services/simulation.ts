
import { Team, Match, LeagueTableRow, Morale, Player } from '../types';
import { generateRandomName } from '../utils';

// Calcula estadísticas detalladas del equipo basadas en las posiciones de los jugadores
const getTeamStats = (team: Team) => {
    const getRating = (pos: Player['position']) => {
        const players = team.squad.filter(p => p.position === pos);
        if (players.length === 0) return 60; // Fallback si no hay jugadores en esa posición
        // Top 3 jugadores definen la fuerza de la línea
        const topPlayers = players.sort((a, b) => b.rating - a.rating).slice(0, 3);
        return topPlayers.reduce((sum, p) => sum + p.rating, 0) / topPlayers.length;
    };

    const attack = getRating('DEL');
    const midfield = getRating('CEN');
    const defense = (getRating('DEF') + getRating('POR')) / 2;

    return { attack, midfield, defense };
};

export const generateYouthPlayer = (tier: Team['tier'] = 'Lower'): Player => {
    const positions: Player['position'][] = ['POR', 'DEF', 'CEN', 'DEL'];
    const position = positions[Math.floor(Math.random() * positions.length)];

    // Base rating based on tier (better academies produce better players)
    let baseRating = 55;
    if (tier === 'Mid') baseRating = 60;
    if (tier === 'Top') baseRating = 64;

    // Random variance (-5 to +8)
    const rating = Math.min(85, Math.max(45, baseRating + Math.floor(Math.random() * 13) - 5));

    // Value calculation based on rating
    const value = Math.round((rating * rating * rating) / 8000) / 10; // Exponential value curve

    return {
        id: Date.now() + Math.floor(Math.random() * 100000) + Math.floor(performance.now()),
        name: generateRandomName(),
        position,
        rating,
        value: Math.max(0.1, value),
        wage: Math.round(value * 1000) + 500, // Cheap wages
        morale: 'Contento',
        contractYears: 3,
        age: 15 + Math.floor(Math.random() * 3), // 15-17 years old
        isTransferListed: false
    };
};

export const simulateMatch = (homeTeam: Team, awayTeam: Team, homeTableRow: LeagueTableRow, awayTableRow: LeagueTableRow): { homeScore: number; awayScore: number, events: string[] } => {
    const homeStats = getTeamStats(homeTeam);
    const awayStats = getTeamStats(awayTeam);

    // 1. Factor de Control (Centro del campo + Localía)
    const homeControl = homeStats.midfield * 1.1 + (Math.random() * 10);
    const awayControl = awayStats.midfield + (Math.random() * 10);
    const totalControl = homeControl + awayControl;
    const homePossession = homeControl / totalControl;

    // 2. Factor de Moral y Forma
    const getMoralBonus = (m: Morale) => ({ 'Feliz': 3, 'Contento': 1, 'Normal': 0, 'Descontento': -2, 'Enojado': -5 }[m]);
    const getFormBonus = (f: string[]) => f.slice(0, 3).reduce((acc, v) => acc + (v === 'W' ? 2 : v === 'L' ? -1 : 0), 0);

    const homeMomentum = getMoralBonus(homeTeam.teamMorale) + getFormBonus(homeTableRow.form);
    const awayMomentum = getMoralBonus(awayTeam.teamMorale) + getFormBonus(awayTableRow.form);

    // 3. Calcular Potencial Ofensivo
    let homeChances = 4 + (homePossession * 6) + (homeStats.attack - awayStats.defense) / 5 + (homeMomentum / 3);
    let awayChances = 4 + ((1 - homePossession) * 6) + (awayStats.attack - homeStats.defense) / 5 + (awayMomentum / 3);

    homeChances = Math.max(0, homeChances + (Math.random() * 4) - 2);
    awayChances = Math.max(0, awayChances + (Math.random() * 4) - 2);

    // 4. Conversión de Goles
    let homeScore = 0;
    let awayScore = 0;
    const events: string[] = [];

    const homeConversionRate = 0.15 + ((homeStats.attack - awayStats.defense) / 200);
    const awayConversionRate = 0.15 + ((awayStats.attack - homeStats.defense) / 200);

    for (let i = 0; i < Math.round(homeChances); i++) {
        if (Math.random() < homeConversionRate) homeScore++;
    }
    for (let i = 0; i < Math.round(awayChances); i++) {
        if (Math.random() < awayConversionRate) awayScore++;
    }

    if (homeScore > 6) homeScore = 6;
    if (awayScore > 6) awayScore = 6;

    return { homeScore, awayScore, events };
};

export const generateFixtures = (teams: Team[]): Match[] => {
    const teamIds = teams.map(t => t.id);
    if (teamIds.length % 2 !== 0) return [];
    const schedule: Match[] = [];
    const numWeeks = teamIds.length - 1;
    const halfSeasonSize = teamIds.length / 2;
    const teamsSlice = teamIds.slice(1);

    for (let week = 0; week < numWeeks; week++) {
        const weekFixtures: { home: number, away: number }[] = [];
        const awayTeamIndex = week % teamsSlice.length;
        weekFixtures.push({ home: teamIds[0], away: teamsSlice[awayTeamIndex] });
        for (let i = 1; i < halfSeasonSize; i++) {
            const homeIndex = (week + i) % teamsSlice.length;
            const awayIndex = (week + teamsSlice.length - i) % teamsSlice.length;
            weekFixtures.push({ home: teamsSlice[homeIndex], away: teamsSlice[awayIndex] });
        }
        weekFixtures.forEach(fixture => schedule.push({ week: week + 1, homeTeamId: fixture.home, awayTeamId: fixture.away }));
    }
    const secondHalf = schedule.map(match => ({ week: match.week + numWeeks, homeTeamId: match.awayTeamId, awayTeamId: match.homeTeamId }));
    return [...schedule, ...secondHalf];
};

export const createInitialLeagueTable = (teams: Team[]): LeagueTableRow[] => {
    return teams.map(team => ({
        teamId: team.id, position: 0, played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [],
    })).sort((a, b) => teams.find(t => t.id === a.teamId)!.name.localeCompare(teams.find(t => t.id === b.teamId)!.name));
};

export const updateTeamMorale = (currentMorale: Morale, result: 'W' | 'D' | 'L'): Morale => {
    const moraleOrder: Morale[] = ['Enojado', 'Descontento', 'Normal', 'Contento', 'Feliz'];
    const currentIndex = moraleOrder.indexOf(currentMorale);
    if (result === 'W' && currentIndex < moraleOrder.length - 1) return moraleOrder[currentIndex + 1];
    if (result === 'L' && currentIndex > 0) return moraleOrder[currentIndex - 1];
    return currentMorale;
};
