
import { Team, Match, LeagueTableRow, Morale, Player, CupCompetition, CupRound } from '../types';
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

export const simulateMatch = (homeTeam: Team, awayTeam: Team, homeTableRow: LeagueTableRow, awayTableRow: LeagueTableRow, isCupMatch: boolean = false): { homeScore: number; awayScore: number, events: string[], penalties?: { home: number, away: number } } => {
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

    const homeMomentum = getMoralBonus(homeTeam.teamMorale) + getFormBonus(homeTableRow?.form || []);
    const awayMomentum = getMoralBonus(awayTeam.teamMorale) + getFormBonus(awayTableRow?.form || []);

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

    // Cup Logic: Extra Time & Penalties
    let penaltiesResult;
    if (isCupMatch && homeScore === awayScore) {
        events.push(`90' ⏱️ Final del tiempo reglamentario. ¡Nos vamos a la prórroga!`);

        // Extra Time Simulation (Reduced chances)
        const etHomeChances = Math.max(1, homeChances / 4);
        const etAwayChances = Math.max(1, awayChances / 4);

        for (let i = 0; i < Math.round(etHomeChances); i++) {
            if (Math.random() < homeConversionRate) {
                homeScore++;
                events.push(`${90 + Math.floor(Math.random() * 30)}' ⚽ ¡GOL EN PRÓRROGA! ${homeTeam.name} se pone en ventaja.`);
            }
        }
        for (let i = 0; i < Math.round(etAwayChances); i++) {
            if (Math.random() < awayConversionRate) {
                awayScore++;
                events.push(`${90 + Math.floor(Math.random() * 30)}' ⚽ ¡GOL EN PRÓRROGA! ${awayTeam.name} empata el partido.`);
            }
        }

        if (homeScore === awayScore) {
            events.push(`120' ⏱️ Final de la prórroga. ¡El partido se decidirá en los penales!`);
            // Penalties Simulation
            let homePens = 0;
            let awayPens = 0;
            for (let k = 0; k < 5; k++) {
                if (Math.random() > 0.2) homePens++;
                if (Math.random() > 0.2) awayPens++;
            }
            // Sudden death if needed
            while (homePens === awayPens) {
                if (Math.random() > 0.2) homePens++;
                if (Math.random() > 0.2) awayPens++;
            }
            penaltiesResult = { home: homePens, away: awayPens };
            events.push(`🏁 Penales: ${homeTeam.name} ${homePens} - ${awayPens} ${awayTeam.name}`);
        } else {
            events.push(`120' 🏁 Final de la prórroga.`);
        }
    }

    return { homeScore, awayScore, events, penalties: penaltiesResult };
};

// Helper to generate a round-robin schedule for a single league
const generateLeagueSchedule = (teams: Team[], leagueId: string): Match[] => {
    const teamIds = teams.map(t => t.id);
    if (teamIds.length % 2 !== 0) return []; // Should handle odd teams with byes ideally
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
        weekFixtures.forEach(fixture => schedule.push({
            week: week + 1,
            homeTeamId: fixture.home,
            awayTeamId: fixture.away,
            competition: 'League' as const,
            isCupMatch: false
        }));
    }
    const secondHalf = schedule.map(match => ({
        week: match.week + numWeeks,
        homeTeamId: match.awayTeamId,
        awayTeamId: match.homeTeamId,
        competition: 'League' as const,
        isCupMatch: false
    }));
    return [...schedule, ...secondHalf];
};

export const generateSeasonSchedule = (allTeams: Team[]): Match[] => {
    const premierLeagueTeams = allTeams.filter(t => t.leagueId === 'PREMIER_LEAGUE');
    const championshipTeams = allTeams.filter(t => t.leagueId === 'CHAMPIONSHIP');

    const plSchedule = generateLeagueSchedule(premierLeagueTeams, 'PREMIER_LEAGUE');
    const chSchedule = generateLeagueSchedule(championshipTeams, 'CHAMPIONSHIP');

    // Merge schedules. Since Championship has more games (46 rounds vs 38), 
    // we just append them. The game loop handles weeks globally.
    return [...plSchedule, ...chSchedule];
};

export const generateCupDraw = (teams: Team[], roundName: string, competition: 'FA_Cup' | 'Carabao_Cup' = 'FA_Cup'): Match[] => {
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    const fixtures: Match[] = [];

    for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) {
            fixtures.push({
                week: 0, // Cup matches don't have a fixed week in advance usually, handled dynamically
                homeTeamId: shuffled[i].id,
                awayTeamId: shuffled[i + 1].id,
                competition: competition,
                isCupMatch: true
            });
        }
    }
    return fixtures;
};

// Helper function to determine cup winners from a round
export const determineCupWinner = (match: Match): number | null => {
    if (!match.result) return null;

    const { homeScore, awayScore } = match.result;

    // If there's a clear winner
    if (homeScore > awayScore) return match.homeTeamId;
    if (awayScore > homeScore) return match.awayTeamId;

    // If it's a draw, check penalties
    if (match.penalties) {
        return match.penalties.home > match.penalties.away ? match.homeTeamId : match.awayTeamId;
    }

    return null; // Match not yet decided
};

// Helper function to advance cup to next round
export const advanceCupRound = (cup: CupCompetition, allTeams: Team[], nextWeek: number): CupCompetition => {
    const currentRound = cup.rounds[cup.currentRoundIndex];

    // Check if current round is complete
    const allMatchesPlayed = currentRound.fixtures.every(m => m.result !== undefined);
    if (!allMatchesPlayed) {
        return cup; // Round not complete yet
    }

    // Determine winners
    const winners: number[] = [];
    currentRound.fixtures.forEach(match => {
        const winnerId = determineCupWinner(match);
        if (winnerId !== null) {
            winners.push(winnerId);
        }
    });

    // If this was the final (only 2 teams), set winner
    if (winners.length === 1) {
        return {
            ...cup,
            winnerId: winners[0],
            rounds: cup.rounds.map((r, idx) =>
                idx === cup.currentRoundIndex ? { ...r, completed: true } : r
            )
        };
    }

    // Generate next round
    const winnerTeams = winners.map(id => allTeams.find(t => t.id === id)!).filter(Boolean);
    const nextRoundName = getNextRoundName(cup.rounds.length - cup.currentRoundIndex - 1);
    const nextRoundFixtures = generateCupDraw(winnerTeams, nextRoundName, cup.id === 'fa_cup' ? 'FA_Cup' : 'Carabao_Cup');

    // Assign week to next round fixtures
    const fixturesWithWeek = nextRoundFixtures.map(f => ({ ...f, week: nextWeek }));

    // Mark current round as complete and add next round
    const updatedRounds = [
        ...cup.rounds.map((r, idx) =>
            idx === cup.currentRoundIndex ? { ...r, completed: true } : r
        ),
        {
            name: nextRoundName,
            fixtures: fixturesWithWeek,
            completed: false
        }
    ];

    return {
        ...cup,
        rounds: updatedRounds,
        currentRoundIndex: cup.currentRoundIndex + 1
    };
};

// Helper to get round names
const getNextRoundName = (roundsRemaining: number): string => {
    if (roundsRemaining === 0) return 'Final';
    if (roundsRemaining === 1) return 'Semi-Final';
    if (roundsRemaining === 2) return 'Quarter-Final';
    if (roundsRemaining === 3) return 'Round of 16';
    if (roundsRemaining === 4) return 'Round of 32';
    return `Round ${6 - roundsRemaining}`;
};

export const createInitialLeagueTable = (teams: Team[]): LeagueTableRow[] => {
    return teams.map(team => ({
        teamId: team.id, position: 0, played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [],
    })).sort((a, b) => teams.find(t => t.id === a.teamId)!.name.localeCompare(teams.find(t => t.id === b.teamId)!.name));
};

export const handlePromotionRelegation = (allTeams: Team[], plTable: LeagueTableRow[], chTable: LeagueTableRow[]): Team[] => {
    // Sort tables by points (descending), then goal difference, then goals for
    const sortedPL = [...plTable].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    });

    const sortedCH = [...chTable].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    });

    // Identify teams to move
    const relegatedTeamIds = sortedPL.slice(-3).map(row => row.teamId);
    const promotedTeamIds = sortedCH.slice(0, 3).map(row => row.teamId);

    // Create new teams array with updated leagueIds
    return allTeams.map(team => {
        if (relegatedTeamIds.includes(team.id)) {
            return { ...team, leagueId: 'CHAMPIONSHIP' as any }; // Cast to avoid type issues if enum is strict
        }
        if (promotedTeamIds.includes(team.id)) {
            return { ...team, leagueId: 'PREMIER_LEAGUE' as any };
        }
        return team;
    });
};

export const updateTeamMorale = (currentMorale: Morale, result: 'W' | 'D' | 'L'): Morale => {
    const moraleOrder: Morale[] = ['Enojado', 'Descontento', 'Normal', 'Contento', 'Feliz'];
    const currentIndex = moraleOrder.indexOf(currentMorale);
    if (result === 'W' && currentIndex < moraleOrder.length - 1) return moraleOrder[currentIndex + 1];
    if (result === 'L' && currentIndex > 0) return moraleOrder[currentIndex - 1];
    return currentMorale;
};
