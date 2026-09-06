
import { Team, Match, LeagueTableRow, Morale, Player, CupCompetition, CupRound, LeagueId, EuropeanTableRow, CupGroup } from '../types';
import { getTacticalMatchup } from './coaching';
import { generateRandomName } from '../utils';

const FORMATION_CONFIG: Record<string, Record<Player['position'], number>> = {
    '4-3-3': { 'POR': 1, 'DEF': 4, 'CEN': 3, 'DEL': 3 },
    '4-4-2': { 'POR': 1, 'DEF': 4, 'CEN': 4, 'DEL': 2 },
    '3-5-2': { 'POR': 1, 'DEF': 3, 'CEN': 5, 'DEL': 2 },
    '4-2-3-1': { 'POR': 1, 'DEF': 4, 'CEN': 5, 'DEL': 1 },
    '5-3-2': { 'POR': 1, 'DEF': 5, 'CEN': 3, 'DEL': 2 },
};

// --- NEW LOGIC: Match Squad Selection ---
const selectMatchSquad = (team: Team) => {
    const formation = team.coach?.preferredFormation || '4-4-2';
    const config = FORMATION_CONFIG[formation];
    
    // Filter available players (not injured, not suspended, condition > 30 to avoid automatic injury unless forced)
    let availablePlayers = team.squad.filter(p => !p.isInjured && !p.isSuspended);
    
    // Fallback if not enough players (very rare, but we must handle it by allowing low condition or even injured if desperate)
    if (availablePlayers.length < 11) {
        availablePlayers = team.squad.filter(p => !p.isSuspended); // allow injured if desperate
    }
    if (availablePlayers.length < 11) {
        availablePlayers = team.squad; // allow suspended if absolutely desperate (game logic safety)
    }

    const starters: Player[] = [];
    const availablePool = [...availablePlayers];

    const pickForPosition = (pos: Player['position'], count: number) => {
        // Sort by effective rating: rating * (condition/100)
        const playersForPos = availablePool
            .filter(p => p.position === pos)
            .sort((a, b) => {
                const effA = a.rating * ((a.condition ?? 100) / 100);
                const effB = b.rating * ((b.condition ?? 100) / 100);
                return effB - effA;
            });

        for (let i = 0; i < count; i++) {
            if (playersForPos.length > i) {
                const p = playersForPos[i];
                starters.push(p);
                // Remove from available pool
                const idx = availablePool.findIndex(poolP => poolP.id === p.id);
                if (idx > -1) availablePool.splice(idx, 1);
            } else {
                // If we run out of players for a position, pick the best available regardless of position
                if (availablePool.length > 0) {
                    availablePool.sort((a, b) => {
                        const effA = a.rating * ((a.condition ?? 100) / 100);
                        const effB = b.rating * ((b.condition ?? 100) / 100);
                        return effB - effA;
                    });
                    const p = availablePool[0];
                    starters.push(p);
                    availablePool.splice(0, 1);
                }
            }
        }
    };

    pickForPosition('POR', config['POR']);
    pickForPosition('DEF', config['DEF']);
    pickForPosition('CEN', config['CEN']);
    pickForPosition('DEL', config['DEL']);

    // Pick 3 subs randomly from the remaining available
    const subs = availablePool
        .sort((a, b) => (b.rating * ((b.condition ?? 100) / 100)) - (a.rating * ((a.condition ?? 100) / 100)))
        .slice(0, 3);

    return { starters, subs };
};

const getTeamStatsFromSquad = (starters: Player[], coach: Team['coach']) => {
    const satisfactionBonus = (coach?.satisfactionLevel || 80) / 100; // 0.8 to 1.0 roughly

    const getLineRating = (pos: Player['position']) => {
        const line = starters.filter(p => p.position === pos);
        if (line.length === 0) return 40;
        const avg = line.reduce((sum, p) => sum + (p.rating * ((p.condition ?? 100) / 100)), 0) / line.length;
        return avg * satisfactionBonus;
    };

    return {
        attack: getLineRating('DEL'),
        midfield: getLineRating('CEN'),
        defense: (getLineRating('DEF') + getLineRating('POR')) / 2
    };
};

export const generateYouthPlayer = (tier: Team['tier'] = 'Lower'): Player => {
    const positions: Player['position'][] = ['POR', 'DEF', 'CEN', 'DEL'];
    const position = positions[Math.floor(Math.random() * positions.length)];

    let baseRating = 55;
    if (tier === 'Mid') baseRating = 60;
    if (tier === 'Top') baseRating = 64;

    const rating = Math.min(85, Math.max(45, baseRating + Math.floor(Math.random() * 13) - 5));
    const value = Math.round((rating * rating * rating) / 8000) / 10;

    return {
        id: Date.now() + Math.floor(Math.random() * 100000) + Math.floor(performance.now()),
        name: generateRandomName(),
        position,
        rating,
        value: Math.max(0.1, value),
        wage: Math.round(value * 1000) + 500,
        morale: 'Contento',
        contractYears: 3,
        age: 15 + Math.floor(Math.random() * 3),
        isTransferListed: false,
        stats: { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 },
        condition: 100,
        isInjured: false,
        isSuspended: false
    };
};

export const simulateMatch = (homeTeam: Team, awayTeam: Team, homeTableRow: LeagueTableRow, awayTableRow: LeagueTableRow, isCupMatch: boolean = false): { homeScore: number; awayScore: number, events: string[], scorers: { playerId: number, playerName: string, minute: number }[], penalties?: { home: number, away: number } } => {
    
    // Select squads
    const homeSquad = selectMatchSquad(homeTeam);
    const awaySquad = selectMatchSquad(awayTeam);

    const homeStats = getTeamStatsFromSquad(homeSquad.starters, homeTeam.coach);
    const awayStats = getTeamStatsFromSquad(awaySquad.starters, awayTeam.coach);

    // Apply match effects to players (minutes, appearances, fatigue)
    const processMatchParticipation = (squad: { starters: Player[], subs: Player[] }) => {
        squad.starters.forEach(p => {
            if (!p.stats) p.stats = { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 };
            p.stats.appearances += 1;
            p.stats.minutes += 90;
            p.condition = Math.max(10, (p.condition ?? 100) - (15 + Math.random() * 15)); // Reduce condition by 15-30
        });
        squad.subs.forEach(p => {
            if (!p.stats) p.stats = { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 };
            p.stats.appearances += 1;
            p.stats.minutes += 30; // Average sub minutes
            p.condition = Math.max(10, (p.condition ?? 100) - (5 + Math.random() * 10)); // Reduce condition by 5-15
        });
    };

    processMatchParticipation(homeSquad);
    processMatchParticipation(awaySquad);

    // Tactical Influence
    const homeStyle = homeTeam.coach?.style || 'Balanced';
    const awayStyle = awayTeam.coach?.style || 'Balanced';

    const tacticalMatchup = getTacticalMatchup(homeStyle, awayStyle);
    const homeTacticalBonus = tacticalMatchup.homeAdvantage;
    const awayTacticalBonus = -tacticalMatchup.homeAdvantage;

    const homeControl = homeStats.midfield * 1.25 + (Math.random() * 10) + homeTacticalBonus;
    const awayControl = awayStats.midfield + (Math.random() * 10) + awayTacticalBonus;
    const totalControl = homeControl + awayControl;
    const homePossession = homeControl / totalControl;

    const getMoralBonus = (m: Morale) => ({ 'Feliz': 3, 'Contento': 1, 'Normal': 0, 'Descontento': -2, 'Enojado': -5 }[m]);
    const getFormBonus = (f: string[]) => f.slice(0, 3).reduce((acc, v) => acc + (v === 'W' ? 2 : v === 'L' ? -1 : 0), 0);

    const homeMomentum = getMoralBonus(homeTeam.teamMorale) + getFormBonus(homeTableRow?.form || []);
    const awayMomentum = getMoralBonus(awayTeam.teamMorale) + getFormBonus(awayTableRow?.form || []);

    let homeChances = 4 + (homePossession * 6) + (homeStats.attack - awayStats.defense) / 5 + (homeMomentum / 3);
    let awayChances = 4 + ((1 - homePossession) * 6) + (awayStats.attack - homeStats.defense) / 5 + (awayMomentum / 3);

    if (homeStyle === 'Attacking') { homeChances += 2; awayChances += 1; }
    if (homeStyle === 'Defensive') { homeChances -= 2; awayChances -= 2; }
    if (homeStyle === 'Possession') { homeChances += 1; awayChances -= 1; }
    if (homeStyle === 'Counter') { homeChances += 1; awayChances += 1; }

    if (awayStyle === 'Attacking') { awayChances += 2; homeChances += 1; }
    if (awayStyle === 'Defensive') { awayChances -= 2; homeChances -= 2; }
    if (awayStyle === 'Possession') { awayChances += 1; homeChances -= 1; }
    if (awayStyle === 'Counter') { awayChances += 1; homeChances += 1; }

    homeChances = Math.max(2, Math.min(12, homeChances + (Math.random() * 4) - 2));
    awayChances = Math.max(2, Math.min(12, awayChances + (Math.random() * 4) - 2));

    let homeScore = 0;
    let awayScore = 0;
    const events: string[] = [];
    const scorers: { playerId: number, playerName: string, minute: number }[] = [];

    const homeAttackerRating = homeStats.attack;
    const awayAttackerRating = awayStats.attack;

    const homeConversionRate = 0.12 + ((homeAttackerRating - 70) / 250) + ((homeStats.attack - awayStats.defense) / 300);
    const awayConversionRate = 0.12 + ((awayAttackerRating - 70) / 250) + ((awayStats.attack - homeStats.defense) / 300);

    // Helpers for Goal/Assist assignment
    const getScorer = (squad: { starters: Player[], subs: Player[] }): Player => {
        const potential = squad.starters.filter(p => p.position === 'DEL' || p.position === 'CEN');
        if (potential.length === 0) return squad.starters[0] || squad.subs[0];
        const totalRating = potential.reduce((sum, p) => sum + p.rating, 0);
        let random = Math.random() * totalRating;
        for (const p of potential) {
            random -= p.rating;
            if (random <= 0) return p;
        }
        return potential[0];
    };

    const getAssister = (squad: { starters: Player[], subs: Player[] }, scorer: Player): Player | null => {
        // 70% chance of an assist
        if (Math.random() > 0.7) return null;
        const potential = squad.starters.filter(p => p.id !== scorer.id && (p.position === 'CEN' || p.position === 'DEF' || p.position === 'DEL'));
        if (potential.length === 0) return null;
        return potential[Math.floor(Math.random() * potential.length)];
    };

    // Random injuries and cards
    const processRandomEvents = (squad: { starters: Player[], subs: Player[] }, teamName: string) => {
        squad.starters.forEach(p => {
            // Injury chance: increases with low condition
            const injuryChance = p.condition && p.condition < 60 ? 0.03 : 0.01;
            if (Math.random() < injuryChance && !p.isInjured) {
                p.isInjured = true;
                p.injuryWeeksRemaining = 1 + Math.floor(Math.random() * 4);
                events.push(`🚑 ¡Malas noticias para ${teamName}! ${p.name} ha sufrido una lesión muscular y estará fuera ${p.injuryWeeksRemaining} semanas.`);
            }

            // Cards
            if (Math.random() < 0.15) { // Yellow card
                if (p.stats) p.stats.yellowCards++;
            } else if (Math.random() < 0.01) { // Red card
                if (p.stats) p.stats.redCards++;
                p.isSuspended = true;
                p.suspensionWeeksRemaining = 1 + Math.floor(Math.random() * 3);
                events.push(`🟥 ¡Expulsión en el ${teamName}! ${p.name} recibe tarjeta roja directa y se perderá ${p.suspensionWeeksRemaining} partidos.`);
            }
        });
    };

    processRandomEvents(homeSquad, homeTeam.name);
    processRandomEvents(awaySquad, awayTeam.name);

    // Simulate Home Chances
    for (let i = 0; i < Math.round(homeChances); i++) {
        const minute = Math.floor(Math.random() * 90) + 1;
        const rand = Math.random();
        if (rand < homeConversionRate) {
            homeScore++;
            const scorer = getScorer(homeSquad);
            const assister = getAssister(homeSquad, scorer);
            
            if (scorer.stats) scorer.stats.goals++;
            if (assister && assister.stats) assister.stats.assists++;
            
            scorers.push({ playerId: scorer.id, playerName: scorer.name, minute });
            let msg = `${minute}' ⚽ GOOOOL de ${homeTeam.name}! ${scorer.name} marca con un remate espectacular.`;
            if (assister) msg += ` (Asistencia de ${assister.name})`;
            events.push(msg);
        } else if (rand < 0.4) {
            events.push(`${minute}' 🧤 ¡Gran parada! El portero del ${awayTeam.name} evita el gol tras un disparo de ${getScorer(homeSquad).name}.`);
        } else if (rand < 0.5) {
            events.push(`${minute}' 🟨 Tarjeta amarilla para un jugador de ${homeTeam.name} por falta táctica.`);
        } else {
            events.push(`${minute}' 🏟️ Ocasión para el ${homeTeam.name}, pero el balón se va fuera.`);
        }
    }

    // Simulate Away Chances
    for (let i = 0; i < Math.round(awayChances); i++) {
        const minute = Math.floor(Math.random() * 90) + 1;
        const rand = Math.random();
        if (rand < awayConversionRate) {
            awayScore++;
            const scorer = getScorer(awaySquad);
            const assister = getAssister(awaySquad, scorer);
            
            if (scorer.stats) scorer.stats.goals++;
            if (assister && assister.stats) assister.stats.assists++;

            scorers.push({ playerId: scorer.id, playerName: scorer.name, minute });
            let msg = `${minute}' ⚽ GOOOOL de ${awayTeam.name}! ${scorer.name} anota para la visita.`;
            if (assister) msg += ` (Asistencia de ${assister.name})`;
            events.push(msg);
        } else if (rand < 0.4) {
            events.push(`${minute}' 🧤 ¡Increíble reflejo! El portero del ${homeTeam.name} desvía el balón al córner.`);
        } else if (rand < 0.5) {
            events.push(`${minute}' 🟨 Tarjeta amarilla para un jugador de ${awayTeam.name}.`);
        } else {
            events.push(`${minute}' 🏟️ El ${awayTeam.name} presiona, pero el remate sale desviado.`);
        }
    }

    events.sort((a, b) => {
        const minA = parseInt(a.split("'")[0]);
        const minB = parseInt(b.split("'")[0]);
        return minA - minB;
    });

    const trimGoals = (score: number, teamName: string, teamSquad: Player[]) => {
        if (score > 8) {
            let goalsToRemove = score - 8;
            for (let i = events.length - 1; i >= 0 && goalsToRemove > 0; i--) {
                if (events[i].includes('⚽') && events[i].includes(teamName)) {
                    events.splice(i, 1);
                    goalsToRemove--;
                }
            }
            let scorersToRemove = score - 8;
            for (let i = scorers.length - 1; i >= 0 && scorersToRemove > 0; i--) {
                const scorer = teamSquad.find(p => p.id === scorers[i].playerId);
                if (scorer) {
                    if (scorer.stats && scorer.stats.goals > 0) scorer.stats.goals--; // Retract goal from stats
                    scorers.splice(i, 1);
                    scorersToRemove--;
                }
            }
            return 8;
        }
        return score;
    };

    homeScore = trimGoals(homeScore, homeTeam.name, homeTeam.squad);
    awayScore = trimGoals(awayScore, awayTeam.name, awayTeam.squad);

    let penaltiesResult;
    if (isCupMatch && homeScore === awayScore) {
        events.push(`90' ⏱️ Final del tiempo reglamentario. ¡Nos vamos a la prórroga!`);
        const etHomeChances = Math.max(1, homeChances / 4);
        const etAwayChances = Math.max(1, awayChances / 4);

        for (let i = 0; i < Math.round(etHomeChances); i++) {
            if (Math.random() < homeConversionRate) {
                homeScore++;
                const minute = 90 + Math.floor(Math.random() * 30);
                const scorer = getScorer(homeSquad);
                if (scorer.stats) scorer.stats.goals++;
                scorers.push({ playerId: scorer.id, playerName: scorer.name, minute });
                events.push(`${minute}' ⚽ ¡GOL EN PRÓRROGA! ${homeTeam.name} se pone en ventaja con un tanto de ${scorer.name}.`);
            }
        }
        for (let i = 0; i < Math.round(etAwayChances); i++) {
            if (Math.random() < awayConversionRate) {
                awayScore++;
                const minute = 90 + Math.floor(Math.random() * 30);
                const scorer = getScorer(awaySquad);
                if (scorer.stats) scorer.stats.goals++;
                scorers.push({ playerId: scorer.id, playerName: scorer.name, minute });
                events.push(`${minute}' ⚽ ¡GOL EN PRÓRROGA! ${awayTeam.name} empata el partido con un tanto de ${scorer.name}.`);
            }
        }

        if (homeScore === awayScore) {
            events.push(`120' ⏱️ Final de la prórroga. ¡El partido se decidirá en los penales!`);
            let homePens = 0;
            let awayPens = 0;
            for (let k = 0; k < 5; k++) {
                if (Math.random() > 0.2) homePens++;
                if (Math.random() > 0.2) awayPens++;
            }
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

    return { homeScore, awayScore, events, scorers, penalties: penaltiesResult };
};

// Helper to generate a round-robin schedule for a single league
export const generateLeagueSchedule = (teams: Team[], leagueId: string): Match[] => {
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

// Helper to generate Argentine 2026 30-team format schedule (Apertura & Clausura)
export const generateArgentineTournamentSchedule = (teams: Team[]): Match[] => {
    const zoneA = teams.filter(t => t.zone === 'A');
    const zoneB = teams.filter(t => t.zone === 'B');

    // Fallback if zones not properly populated
    if (zoneA.length !== 15 || zoneB.length !== 15) {
        return generateLeagueSchedule(teams, LeagueId.LIGA_ARGENTINA);
    }

    const CLASSIC_DERBY_PAIRS: [number, number][] = [
        [701, 702], // Boca vs River
        [704, 703], // Independiente vs Racing
        [705, 708], // San Lorenzo vs Huracán
        [706, 729], // Estudiantes LP vs Gimnasia LP
        [710, 709], // Newell's vs Rosario Central
        [715, 730], // Lanús vs Banfield
        [711, 716], // Talleres vs Belgrano
        [722, 723], // Platense vs Tigre
        [707, 726], // Vélez vs Argentinos Jrs
        [717, 733], // Instituto vs Estudiantes Río Cuarto
        [728, 731], // Gimnasia Mza vs Ind. Rivadavia
        [724, 712], // Unión SF vs Atlético Tucumán
        [719, 718], // Central Córdoba SdE vs Sarmiento Junín
        [714, 720], // Defensa y Justicia vs Barracas Central
        [727, 732], // Deportivo Riestra vs Aldosivi
    ];

    // Build 15-round Berger schedule for 16 slots (15 teams + 1 dummy slot at index 15)
    const getZoneRoundRobin = (zoneTeams: Team[]) => {
        const slots: (number | null)[] = zoneTeams.map(t => t.id);
        slots.push(null); // Slot 15 is dummy (bye)
        const rounds: { fixtures: { home: number; away: number }[]; byeTeamId: number }[] = [];
        const n = 16;
        const half = 8;
        const rotating = slots.slice(1);

        for (let round = 0; round < 15; round++) {
            const currentRoundSlots = [slots[0], ...rotating];
            const fixtures: { home: number; away: number }[] = [];
            let byeTeamId = 0;

            for (let i = 0; i < half; i++) {
                const team1 = currentRoundSlots[i];
                const team2 = currentRoundSlots[n - 1 - i];

                if (team1 === null) {
                    byeTeamId = team2!;
                } else if (team2 === null) {
                    byeTeamId = team1;
                } else {
                    if (round % 2 === 0) {
                        fixtures.push({ home: team1, away: team2 });
                    } else {
                        fixtures.push({ home: team2, away: team1 });
                    }
                }
            }

            rounds.push({ fixtures, byeTeamId });
            const last = rotating.pop()!;
            rotating.unshift(last);
        }
        return rounds;
    };

    const roundsA = getZoneRoundRobin(zoneA);
    const roundsB = getZoneRoundRobin(zoneB);

    const aperturaMatches: Match[] = [];

    // Rounds 1 to 15 (Weeks 1 to 15)
    for (let r = 0; r < 15; r++) {
        const week = r + 1;
        // Intramural Zona A
        roundsA[r].fixtures.forEach(f => {
            aperturaMatches.push({
                week,
                homeTeamId: f.home,
                awayTeamId: f.away,
                competition: 'Torneo_Apertura',
                isCupMatch: false,
            });
        });
        // Intramural Zona B
        roundsB[r].fixtures.forEach(f => {
            aperturaMatches.push({
                week,
                homeTeamId: f.home,
                awayTeamId: f.away,
                competition: 'Torneo_Apertura',
                isCupMatch: false,
            });
        });
        // Interzonal match between the two bye teams
        const byeA = roundsA[r].byeTeamId;
        const byeB = roundsB[r].byeTeamId;
        if (byeA && byeB) {
            aperturaMatches.push({
                week,
                homeTeamId: r % 2 === 0 ? byeA : byeB,
                awayTeamId: r % 2 === 0 ? byeB : byeA,
                competition: 'Torneo_Apertura',
                isCupMatch: false,
            });
        }
    }

    // Round 16: Fecha de Clásicos (Week 16)
    CLASSIC_DERBY_PAIRS.forEach(([idA, idB], idx) => {
        aperturaMatches.push({
            week: 16,
            homeTeamId: idx % 2 === 0 ? idA : idB,
            awayTeamId: idx % 2 === 0 ? idB : idA,
            competition: 'Torneo_Apertura',
            isCupMatch: false,
        });
    });

    // Torneo Clausura (Weeks 21 to 36): Inverted venues
    const clausuraMatches: Match[] = aperturaMatches.map(m => ({
        week: m.week + 20, // Weeks 21 to 36
        homeTeamId: m.awayTeamId,
        awayTeamId: m.homeTeamId,
        competition: 'Torneo_Clausura',
        isCupMatch: false,
    }));

    return [...aperturaMatches, ...clausuraMatches];
};

export const generateArgentinePlayoffs = (
    sortedZoneA: Team[], 
    sortedZoneB: Team[], 
    competition: 'Playoffs_Apertura' | 'Playoffs_Clausura', 
    startWeek: number
): Match[] => {
    // Top 8 of each zone
    // Standard bifurcated tournament pairings:
    // Cuadro Izquierdo:
    // Llave 1: 1ºA vs 8ºB
    // Llave 2: 4ºA vs 5ºB (El ganador de Llave 1 y 2 juegan en Cuartos Izquierda 1)
    // Llave 3: 2ºB vs 7ºA
    // Llave 4: 3ºB vs 6ºA (El ganador de Llave 3 y 4 juegan en Cuartos Izquierda 2)
    // Cuadro Derecho:
    // Llave 5: 1ºB vs 8ºA
    // Llave 6: 4ºB vs 5ºA (El ganador de Llave 5 y 6 juegan en Cuartos Derecha 1)
    // Llave 7: 2ºA vs 7ºB
    // Llave 8: 3ºA vs 6ºB (El ganador de Llave 7 y 8 juegan en Cuartos Derecha 2)
    const octavosPairings: [Team, Team][] = [
        [sortedZoneA[0], sortedZoneB[7]], // Llave 1 (Izq)
        [sortedZoneA[3], sortedZoneB[4]], // Llave 2 (Izq)
        [sortedZoneB[1], sortedZoneA[6]], // Llave 3 (Izq)
        [sortedZoneB[2], sortedZoneA[5]], // Llave 4 (Izq)
        [sortedZoneB[0], sortedZoneA[7]], // Llave 5 (Der)
        [sortedZoneB[3], sortedZoneA[4]], // Llave 6 (Der)
        [sortedZoneA[1], sortedZoneB[6]], // Llave 7 (Der)
        [sortedZoneA[2], sortedZoneB[5]], // Llave 8 (Der)
    ];

    return octavosPairings
        .filter(([home, away]) => home && away)
        .map(([home, away]) => ({
            week: startWeek,
            homeTeamId: home.id,
            awayTeamId: away.id,
            competition,
            isCupMatch: true,
        }));
};

// Helper to generate Primera Nacional 36-team format (2 zones of 18, 34 matchdays)
export const generatePrimeraNacionalSchedule = (teams: Team[]): Match[] => {
    const zoneA = teams.filter(t => t.zone === 'A');
    const zoneB = teams.filter(t => t.zone === 'B');

    // Fallback if zones not properly populated
    if (zoneA.length !== 18 || zoneB.length !== 18) {
        return generateLeagueSchedule(teams, LeagueId.PRIMERA_NACIONAL);
    }

    const scheduleA = generateLeagueSchedule(zoneA, LeagueId.PRIMERA_NACIONAL);
    const scheduleB = generateLeagueSchedule(zoneB, LeagueId.PRIMERA_NACIONAL);

    return [...scheduleA, ...scheduleB];
};

export const generateNacionalPrimerAscenso = (leaderA: Team, leaderB: Team, week: number): Match => {
    return {
        week,
        homeTeamId: leaderA.id,
        awayTeamId: leaderB.id,
        competition: 'Nacional_Primer_Ascenso',
        isCupMatch: true,
    };
};

export const generateNacionalReducidoPhase1 = (zoneATeams: Team[], zoneBTeams: Team[], week: number): Match[] => {
    // 2º to 8º of each zone: zoneATeams[1..7] and zoneBTeams[1..7]
    const pairings: [Team, Team][] = [
        [zoneATeams[1], zoneBTeams[7]], // 2ºA vs 8ºB
        [zoneBTeams[1], zoneATeams[7]], // 2ºB vs 8ºA
        [zoneATeams[2], zoneBTeams[6]], // 3ºA vs 7ºB
        [zoneBTeams[2], zoneATeams[6]], // 3ºB vs 7ºA
        [zoneATeams[3], zoneBTeams[5]], // 4ºA vs 6ºB
        [zoneBTeams[3], zoneATeams[5]], // 4ºB vs 6ºA
        [zoneATeams[4], zoneBTeams[4]], // 5ºA vs 5ºB
    ];

    return pairings
        .filter(([home, away]) => home && away)
        .map(([home, away]) => ({
            week,
            homeTeamId: home.id,
            awayTeamId: away.id,
            competition: 'Nacional_Reducido',
            isCupMatch: true,
        }));
};

export const generateNacionalReducidoCuartos = (winnersPhase1: Team[], loserPrimerAscenso: Team, week: number): Match[] => {
    const all8 = [loserPrimerAscenso, ...winnersPhase1].filter(Boolean);
    all8.sort((a, b) => b.budget - a.budget);

    const fixtures: Match[] = [];
    const pairs: [number, number][] = [
        [0, 7], [1, 6], [2, 5], [3, 4]
    ];

    pairs.forEach(([h, a]) => {
        if (all8[h] && all8[a]) {
            fixtures.push({
                week,
                homeTeamId: all8[h].id,
                awayTeamId: all8[a].id,
                competition: 'Nacional_Reducido',
                isCupMatch: true,
            });
        }
    });

    return fixtures;
};

export const generateSeasonSchedule = (allTeams: Team[]): Match[] => {
    const leaguesToSchedule = [
        LeagueId.PREMIER_LEAGUE, LeagueId.CHAMPIONSHIP,
        LeagueId.LA_LIGA, LeagueId.SEGUNDA_DIVISION_ESP,
        LeagueId.BUNDESLIGA, LeagueId.ZWEITE_BUNDESLIGA,
        LeagueId.SERIE_A, LeagueId.SERIE_B_ITA,
        LeagueId.LIGUE_1, LeagueId.LIGUE_2,
        LeagueId.LIGA_ARGENTINA, LeagueId.PRIMERA_NACIONAL,
        LeagueId.BRASILEIRAO, LeagueId.SERIE_B_BR
    ];

    let fullSchedule: Match[] = [];

    for (const leagueId of leaguesToSchedule) {
        const teamsInLeague = allTeams.filter(t => t.leagueId === leagueId);
        if (teamsInLeague.length > 0) {
            if (leagueId === LeagueId.LIGA_ARGENTINA) {
                const schedule = generateArgentineTournamentSchedule(teamsInLeague);
                fullSchedule = [...fullSchedule, ...schedule];
            } else if (leagueId === LeagueId.PRIMERA_NACIONAL) {
                const schedule = generatePrimeraNacionalSchedule(teamsInLeague);
                fullSchedule = [...fullSchedule, ...schedule];
            } else {
                const schedule = generateLeagueSchedule(teamsInLeague, leagueId);
                fullSchedule = [...fullSchedule, ...schedule];
            }
        }
    }

    return fullSchedule;
};

export const generateCupDraw = (teams: Team[], roundName: string, competition: Match['competition'] = 'FA_Cup'): Match[] => {
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
export const progressInternationalCup = (cup: CupCompetition, allTeams: Team[], nextWeek: number): CupCompetition & { newFixtures?: Match[] } => {
    if (cup.phase === 'swiss') {
        const fixtures = cup.swissFixtures || [];
        const allPlayed = fixtures.every(f => f.result !== undefined);
        if (!allPlayed) return cup;

        // Transition Swiss -> Knockout (Round of 16)
        const sortedTable = [...(cup.swissTable || [])].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });

        const qualifiedIds = sortedTable.slice(0, 16).map(r => r.teamId);
        const qualifiedTeams = qualifiedIds.map(id => allTeams.find(t => t.id === id)!).filter(Boolean);
        
        const knockoutFixtures = generateCupDraw(qualifiedTeams, 'Round of 16', cup.id === 'champions_league' ? 'Champions_League' : 'Europa_League');
        const fixturesWithWeek = knockoutFixtures.map(f => ({ ...f, week: nextWeek }));

        return {
            ...cup,
            phase: 'knockout',
            rounds: [{ name: 'Round of 16', fixtures: fixturesWithWeek, completed: false }],
            currentRoundIndex: 0,
            newFixtures: fixturesWithWeek
        };
    }

    if (cup.phase === 'groups') {
        const groups = cup.groups || [];
        const allPlayed = groups.every(g => g.fixtures.every(f => f.result !== undefined));
        if (!allPlayed) return cup;

        // Transition Groups -> Knockout (Round of 16)
        const qualifiedIds: number[] = [];
        groups.forEach(group => {
            const sortedTable = [...group.table].sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                return b.goalsFor - a.goalsFor;
            });
            qualifiedIds.push(sortedTable[0].teamId, sortedTable[1].teamId);
        });

        const qualifiedTeams = qualifiedIds.map(id => allTeams.find(t => t.id === id)!).filter(Boolean);
        const knockoutFixtures = generateCupDraw(qualifiedTeams, 'Round of 16', 'Copa_Libertadores');
        const fixturesWithWeek = knockoutFixtures.map(f => ({ ...f, week: nextWeek }));

        return {
            ...cup,
            phase: 'knockout',
            rounds: [{ name: 'Round of 16', fixtures: fixturesWithWeek, completed: false }],
            currentRoundIndex: 0,
            newFixtures: fixturesWithWeek
        };
    }

    if (cup.phase === 'knockout') {
        const updated = advanceCupRound(cup, allTeams, nextWeek);
        const currentRound = updated.rounds[updated.currentRoundIndex];
        return {
            ...updated,
            newFixtures: (updated.currentRoundIndex > cup.currentRoundIndex) ? currentRound.fixtures : undefined
        };
    }

    return cup;
};

export const advanceCupRound = (cup: CupCompetition, allTeams: Team[], nextWeek: number): CupCompetition => {
    // Check if there are rounds initialized
    if (!cup.rounds || cup.rounds.length === 0) return cup;

    const currentRound = cup.rounds[cup.currentRoundIndex];
    if (!currentRound) return cup;
    
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
        const winnerTeam = allTeams.find(t => t.id === winners[0]);
        const updatedStatistics = {
            ...cup.statistics,
            championsHistory: [
                {
                    season: new Date().getFullYear(),
                    winnerId: winners[0],
                    winnerName: winnerTeam?.name || 'Unknown'
                },
                ...cup.statistics.championsHistory
            ].slice(0, 10)
        };

        return {
            ...cup,
            winnerId: winners[0],
            statistics: updatedStatistics,
            rounds: cup.rounds.map((r, idx) =>
                idx === cup.currentRoundIndex ? { ...r, completed: true } : r
            )
        };
    }

    // Generate next round
    const winnerTeams = winners.map(id => allTeams.find(t => t.id === id)!).filter(Boolean);
    const nextRoundName = getNextRoundName(winners.length); // Use current winners count to determine next round name
    
    let competitionType: Match['competition'] = 'FA_Cup';
    if (cup.id === 'carabao_cup') competitionType = 'Carabao_Cup';
    if (cup.id === 'copa_del_rey') competitionType = 'Copa_Del_Rey';
    if (cup.id === 'dfb_pokal') competitionType = 'DFB_Pokal';
    if (cup.id === 'coppa_italia') competitionType = 'Coppa_Italia';
    if (cup.id === 'copa_argentina') competitionType = 'Copa_Argentina';
    if (cup.id === 'apertura_playoffs') competitionType = 'Playoffs_Apertura';
    if (cup.id === 'clausura_playoffs') competitionType = 'Playoffs_Clausura';
    if (cup.id === 'nacional_reducido') competitionType = 'Nacional_Reducido';
    if (cup.id === 'champions_league') competitionType = 'Champions_League';
    if (cup.id === 'europa_league') competitionType = 'Europa_League';
    if (cup.id === 'copa_libertadores') competitionType = 'Copa_Libertadores';
    if (cup.id === 'copa_intercontinental') competitionType = 'Copa_Intercontinental';

    // Pair winners in exact bracket tree order (Match 0 winner vs Match 1 winner, Match 2 vs Match 3, etc.)
    const nextRoundFixtures: Match[] = [];
    for (let i = 0; i < winnerTeams.length; i += 2) {
        if (i + 1 < winnerTeams.length) {
            nextRoundFixtures.push({
                week: nextWeek,
                homeTeamId: winnerTeams[i].id,
                awayTeamId: winnerTeams[i + 1].id,
                competition: competitionType,
                isCupMatch: true
            });
        }
    }

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

export const checkAndScheduleIntercontinental = (gameState: { cups: Record<string, CupCompetition>, allTeams: Team[] }, nextWeek: number): CupCompetition | null => {
    const { championsLeague, copaLibertadores, copaIntercontinental } = gameState.cups;

    // Only if both are finished and Intercontinental hasn't started
    if (championsLeague.winnerId && copaLibertadores.winnerId && (!copaIntercontinental.rounds || copaIntercontinental.rounds.length === 0)) {
        const clWinner = gameState.allTeams.find(t => t.id === championsLeague.winnerId)!;
        const libWinner = gameState.allTeams.find(t => t.id === copaLibertadores.winnerId)!;

        const finalFixture: Match = {
            week: nextWeek + 2,
            homeTeamId: clWinner.id,
            awayTeamId: libWinner.id,
            competition: 'Copa_Intercontinental',
            isCupMatch: true,
            isMidweek: true
        };

        return {
            ...copaIntercontinental,
            rounds: [{
                name: 'Final Intercontinental',
                fixtures: [finalFixture],
                completed: false
            }],
            currentRoundIndex: 0
        };
    }

    return null;
};

const getNextRoundName = (teamsRemaining: number): string => {
    if (teamsRemaining === 2) return 'Final';
    if (teamsRemaining <= 4) return 'Semi-Final';
    if (teamsRemaining <= 8) return 'Quarter-Final';
    if (teamsRemaining <= 16) return 'Round of 16';
    return 'Round of 32';
};

export const createInitialLeagueTable = (teams: Team[]): LeagueTableRow[] => {
    return teams.map(team => ({
        teamId: team.id, position: 0, played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [],
        zone: team.zone,
        promedio: 0,
        playedTotal: 0,
        pointsTotal: 0,
    })).sort((a, b) => teams.find(t => t.id === a.teamId)!.name.localeCompare(teams.find(t => t.id === b.teamId)!.name));
};

export const createInitialEuropeanTable = (teamIds: number[]): any[] => { // using any[] to avoid circular dependency if types are complex, but we can type it.
    return teamIds.map(id => ({
        teamId: id, position: 0, played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
    }));
};

export const generateSwissPhase = (teams: Team[], competition: Match['competition'], numMatches: number = 8): { table: EuropeanTableRow[], fixtures: Match[] } => {
    const teamIds = teams.map(t => t.id);
    const table = teams.map((t, idx) => ({
        teamId: t.id,
        position: idx + 1,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
    }));

    const fixtures: Match[] = [];
    
    // Improved Swiss-style pairing (simulated)
    // Each team plays numMatches unique opponents
    for (let i = 0; i < teamIds.length; i++) {
        const homeId = teamIds[i];
        for (let j = 1; j <= numMatches / 2; j++) {
            // Home matches
            const awayId = teamIds[(i + j) % teamIds.length];
            fixtures.push({
                week: 0,
                homeTeamId: homeId,
                awayTeamId: awayId,
                competition,
                isCupMatch: true,
                isMidweek: true
            });

            // Away matches (we just pick from another part of the circle)
            const awayId2 = teamIds[(i + j + numMatches / 2) % teamIds.length];
             // Note: In a real swiss system this is balanced differently, 
             // but for a game simulation this ensures everyone plays 8 unique games.
        }
    }
    
    // Balance and deduplicate (simplified for 36 teams / 8 matches)
    const balancedFixtures: Match[] = [];
    const teamMatchCount: Record<number, number> = {};
    const seenPairs = new Set<string>();

    teamIds.forEach(id => teamMatchCount[id] = 0);

    // This is a naive circular scheduler for 8 games
    for (let j = 1; j <= numMatches; j++) {
        const usedThisRound = new Set<number>();
        for (let i = 0; i < teamIds.length; i++) {
            const home = teamIds[i];
            if (usedThisRound.has(home)) continue;
            
            const away = teamIds[(i + j) % teamIds.length];
            if (usedThisRound.has(away)) continue;

            balancedFixtures.push({
                week: j * 2, // Midweek games every 2 weeks roughly
                homeTeamId: j % 2 === 0 ? home : away,
                awayTeamId: j % 2 === 0 ? away : home,
                competition,
                isCupMatch: true,
                isMidweek: true
            });

            usedThisRound.add(home);
            usedThisRound.add(away);
        }
    }

    return { table, fixtures: balancedFixtures };
};

export const generateGroupPhase = (teams: Team[], competition: Match['competition']): CupGroup[] => {
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    const groups: CupGroup[] = [];
    const numGroups = Math.floor(teams.length / 4);

    for (let i = 0; i < numGroups; i++) {
        const groupTeams = shuffled.slice(i * 4, (i + 1) * 4);
        const teamIds = groupTeams.map(t => t.id);
        const groupTable = groupTeams.map(t => ({
            teamId: t.id,
            position: 0,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            form: []
        }));

        // Round robin for 4 teams (6 matches)
        const fixtures: Match[] = [];
        const pairings = [
            [0, 1], [2, 3], // W1
            [0, 2], [1, 3], // W2
            [0, 3], [1, 2], // W3
        ];

        pairings.forEach((p, idx) => {
            fixtures.push({
                week: (idx + 1) * 2,
                homeTeamId: teamIds[p[0]],
                awayTeamId: teamIds[p[1]],
                competition,
                isCupMatch: true,
                isMidweek: true
            });
            // Return match
            fixtures.push({
                week: (idx + 4) * 2,
                homeTeamId: teamIds[p[1]],
                awayTeamId: teamIds[p[0]],
                competition,
                isCupMatch: true,
                isMidweek: true
            });
        });

        groups.push({
            id: `group_${String.fromCharCode(65 + i)}`,
            name: `Grupo ${String.fromCharCode(65 + i)}`,
            teams: teamIds,
            table: groupTable,
            fixtures
        });
    }

    return groups;
};


// Map of all promotion/relegation pairs: [First Division, Second Division]
const PROMOTION_RELEGATION_PAIRS: [LeagueId, LeagueId][] = [
    [LeagueId.PREMIER_LEAGUE, LeagueId.CHAMPIONSHIP],
    [LeagueId.LA_LIGA, LeagueId.SEGUNDA_DIVISION_ESP],
    [LeagueId.BUNDESLIGA, LeagueId.ZWEITE_BUNDESLIGA],
    [LeagueId.SERIE_A, LeagueId.SERIE_B_ITA],
    [LeagueId.LIGUE_1, LeagueId.LIGUE_2],
    [LeagueId.LIGA_ARGENTINA, LeagueId.PRIMERA_NACIONAL],
    [LeagueId.BRASILEIRAO, LeagueId.SERIE_B_BR],
];

export const handlePromotionRelegation = (allTeams: Team[], leagueTables: Record<LeagueId, LeagueTableRow[]>): Team[] => {
    let updatedTeams = [...allTeams];

    for (const [div1, div2] of PROMOTION_RELEGATION_PAIRS) {
        const div1Table = leagueTables[div1] || [];
        const div2Table = leagueTables[div2] || [];

        if (!div1Table.length || !div2Table.length) continue;

        const sortTable = (table: LeagueTableRow[]) => [...table].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });

        const sortedDiv1 = sortTable(div1Table);
        const sortedDiv2 = sortTable(div2Table);

        let relegatedIds: number[] = [];
        let promotedIds: number[] = [];

        if (div1 === LeagueId.LIGA_ARGENTINA) {
            // Relegation 1: Last place in Tabla Anual (30th place)
            const lastTablaAnual = sortedDiv1[sortedDiv1.length - 1]?.teamId;
            if (lastTablaAnual) relegatedIds.push(lastTablaAnual);

            // Relegation 2: Lowest Promedio (pointsTotal / playedTotal)
            const sortedByPromedio = [...div1Table].sort((a, b) => (a.promedio ?? 0) - (b.promedio ?? 0));
            for (const r of sortedByPromedio) {
                if (!relegatedIds.includes(r.teamId)) {
                    relegatedIds.push(r.teamId);
                    break;
                }
            }

            // 2 Promoted teams from Primera Nacional (Leaders of Reducido/Final or top positions)
            const zoneATable = div2Table.filter(r => r.zone === 'A').sort((a, b) => b.points - a.points);
            const zoneBTable = div2Table.filter(r => r.zone === 'B').sort((a, b) => b.points - a.points);
            
            const promo1 = zoneATable[0]?.teamId || sortedDiv2[0]?.teamId;
            const promo2 = zoneBTable[0]?.teamId || sortedDiv2[1]?.teamId;
            if (promo1) promotedIds.push(promo1);
            if (promo2 && promo2 !== promo1) promotedIds.push(promo2);
        } else {
            relegatedIds = sortedDiv1.slice(-3).map(r => r.teamId);
            promotedIds = sortedDiv2.slice(0, 3).map(r => r.teamId);
        }

        // Get zones of relegated teams to assign to promoted teams in Liga Argentina
        const relegatedZones = relegatedIds.map(id => allTeams.find(t => t.id === id)?.zone || 'A');

        let promotedIndex = 0;
        updatedTeams = updatedTeams.map(team => {
            if (relegatedIds.includes(team.id)) {
                return { ...team, leagueId: div2, zone: relegatedZones[promotedIndex % 2] || 'A' };
            }
            if (promotedIds.includes(team.id)) {
                const assignedZone = div1 === LeagueId.LIGA_ARGENTINA ? relegatedZones[promotedIndex++] || 'A' : undefined;
                return { ...team, leagueId: div1, zone: assignedZone };
            }
            return team;
        });
    }

    return updatedTeams;
};

export const updateTeamMorale = (currentMorale: Morale, result: 'W' | 'D' | 'L'): Morale => {
    const moraleOrder: Morale[] = ['Enojado', 'Descontento', 'Normal', 'Contento', 'Feliz'];
    const currentIndex = moraleOrder.indexOf(currentMorale);
    if (result === 'W' && currentIndex < moraleOrder.length - 1) return moraleOrder[currentIndex + 1];
    if (result === 'L' && currentIndex > 0) return moraleOrder[currentIndex - 1];
    return currentMorale;
};
