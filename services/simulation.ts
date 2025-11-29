
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

const getTacticalBonus = (myTactic: Team['tactics'], oppTactic: Team['tactics']): number => {
    if (myTactic === 'Attacking' && oppTactic === 'Defensive') return -5; // Countered
    if (myTactic === 'Attacking' && oppTactic === 'Balanced') return 5; // Overwhelm
    if (myTactic === 'Defensive' && oppTactic === 'Attacking') return 5; // Counter-attack
    if (myTactic === 'Defensive' && oppTactic === 'Balanced') return -2; // Too passive
    if (myTactic === 'Balanced' && oppTactic === 'Defensive') return 2; // Control
    if (myTactic === 'Balanced' && oppTactic === 'Attacking') return -2; // Overwhelmed
    return 0; // Same tactic
};

export const simulateMatch = (homeTeam: Team, awayTeam: Team, homeTableRow: LeagueTableRow, awayTableRow: LeagueTableRow): { homeScore: number; awayScore: number, events: string[] } => {
    const homeStats = getTeamStats(homeTeam);
    const awayStats = getTeamStats(awayTeam);

    // Tactical Influence
    const homeTacticalBonus = getTacticalBonus(homeTeam.tactics, awayTeam.tactics);
    const awayTacticalBonus = getTacticalBonus(awayTeam.tactics, homeTeam.tactics);

    // 1. Factor de Control (Centro del campo + Localía + Táctica)
    const homeControl = homeStats.midfield * 1.1 + (Math.random() * 10) + homeTacticalBonus;
    const awayControl = awayStats.midfield + (Math.random() * 10) + awayTacticalBonus;
    const totalControl = homeControl + awayControl;
    const homePossession = homeControl / totalControl;

    // 2. Factor de Moral y Forma
    const getMoralBonus = (m: Morale) => ({ 'Feliz': 3, 'Contento': 1, 'Normal': 0, 'Descontento': -2, 'Enojado': -5 }[m]);
    const getFormBonus = (f: string[]) => f.slice(0, 3).reduce((acc, v) => acc + (v === 'W' ? 2 : v === 'L' ? -1 : 0), 0);

    const homeMomentum = getMoralBonus(homeTeam.teamMorale) + getFormBonus(homeTableRow.form);
    const awayMomentum = getMoralBonus(awayTeam.teamMorale) + getFormBonus(awayTableRow.form);

    // 3. Calcular Oportunidades (Chances)
    let homeChances = 4 + (homePossession * 6) + (homeStats.attack - awayStats.defense) / 5 + (homeMomentum / 3);
    let awayChances = 4 + ((1 - homePossession) * 6) + (awayStats.attack - homeStats.defense) / 5 + (awayMomentum / 3);

    // Adjust chances based on tactics
    if (homeTeam.tactics === 'Attacking') homeChances += 2;
    if (homeTeam.tactics === 'Defensive') homeChances -= 2;
    if (awayTeam.tactics === 'Attacking') awayChances += 2;
    if (awayTeam.tactics === 'Defensive') awayChances -= 2;

    homeChances = Math.max(0, homeChances + (Math.random() * 4) - 2);
    awayChances = Math.max(0, awayChances + (Math.random() * 4) - 2);

    // 4. Simulación de Eventos
    let homeScore = 0;
    let awayScore = 0;
    const events: string[] = [];

    const homeConversionRate = 0.15 + ((homeStats.attack - awayStats.defense) / 200);
    const awayConversionRate = 0.15 + ((awayStats.attack - homeStats.defense) / 200);

    // Helper to get scorer
    const getScorer = (team: Team): string => {
        const scorers = team.squad.filter(p => p.position === 'DEL' || p.position === 'CEN');
        if (scorers.length === 0) return team.squad[0].name;
        // Weighted random: higher rating = higher chance
        const totalRating = scorers.reduce((sum, p) => sum + p.rating, 0);
        let random = Math.random() * totalRating;
        for (const player of scorers) {
            random -= player.rating;
            if (random <= 0) return player.name;
        }
        return scorers[0].name;
    };

    // Simulate Home Chances
    for (let i = 0; i < Math.round(homeChances); i++) {
        const minute = Math.floor(Math.random() * 90) + 1;
        if (Math.random() < homeConversionRate) {
            homeScore++;
            events.push(`${minute}' ⚽ GOOOOL de ${homeTeam.name}! ${getScorer(homeTeam)} marca con un remate espectacular.`);
        } else if (Math.random() < 0.05) {
            events.push(`${minute}' 🟨 Tarjeta amarilla para un jugador de ${homeTeam.name} por falta táctica.`);
        }
    }

    // Simulate Away Chances
    for (let i = 0; i < Math.round(awayChances); i++) {
        const minute = Math.floor(Math.random() * 90) + 1;
        if (Math.random() < awayConversionRate) {
            awayScore++;
            events.push(`${minute}' ⚽ GOOOOL de ${awayTeam.name}! ${getScorer(awayTeam)} anota para la visita.`);
        } else if (Math.random() < 0.05) {
            events.push(`${minute}' 🟨 Tarjeta amarilla para un jugador de ${awayTeam.name}.`);
        }
    }

    // Sort events by minute
    events.sort((a, b) => {
        const minA = parseInt(a.split("'")[0]);
        const minB = parseInt(b.split("'")[0]);
        return minA - minB;
    });

    if (homeScore > 8) homeScore = 8; // Cap unrealistic scores
    if (awayScore > 8) awayScore = 8;

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
