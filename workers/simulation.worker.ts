// Web Worker for match simulation
// This runs in a separate thread to prevent UI freezing

import { Team, LeagueTableRow, Match, Morale, LeagueId, COMPETITION_TO_CUP_KEY, CupKey } from '../types';
import { simulateMatch, simulateMacroMatch } from '../services/simulation';
import { updateTeamMorale } from '../services/morale';

// Helpers removed as they are now imported from services/morale.ts


interface SimulationInput {
    type: 'SIMULATE_WEEK';
    payload: {
        currentWeek: number;
        currentTurn: 'weekend' | 'midweek';
        weekMatches?: Match[];
        schedule?: Match[];
        leagueTables: Record<LeagueId, LeagueTableRow[]>;
        allTeams: Team[];
        playerTeamId: number;
        cups: any;
        finances: {
            weeklyIncome: number;
            weeklyWages: number;
        };
        scouts: any[];
        scoutedPlayerIds: Record<number, number>;
    };
}

interface SimulationOutput {
    type: 'SIMULATION_COMPLETE';
    payload: {
        updatedWeekMatches: Match[];
        updatedSchedule?: Match[];
        updatedLeagueTables: Record<LeagueId, LeagueTableRow[]>;
        updatedAllTeams: Team[];
        confidenceChange: number;
        playerMatchResult: { 
            homeTeamId?: number;
            awayTeamId?: number;
            competition?: string;
            week?: number;
            isMidweek?: boolean;
            homeScore: number; 
            awayScore: number; 
            penalties?: { home: number; away: number }; 
            events?: string[]; 
            scorers?: any[]; 
        } | null;
        updatedCups: any;
        updatedScoutedPlayerIds: Record<number, number>;
        newsToAdd?: any[];
    };
}


// Worker message handler
self.onmessage = (e: MessageEvent<SimulationInput>) => {
    const { type, payload } = e.data;

    if (type === 'SIMULATE_WEEK') {
        const {
            currentWeek,
            currentTurn,
            weekMatches,
            schedule,
            leagueTables,
            allTeams,
            playerTeamId,
            cups,
            finances,
            scouts,
            scoutedPlayerIds
        } = payload;

        const nextWeek = currentWeek;
        const isMidweek = currentTurn === 'midweek';
        const newSchedule = schedule ? [...schedule] : [];

        // Create Maps for easier update
        const leagueMaps: Record<string, Map<number, LeagueTableRow>> = {};
        Object.keys(leagueTables).forEach(leagueId => {
            leagueMaps[leagueId] = new Map<number, LeagueTableRow>(
                leagueTables[leagueId as LeagueId].map(row => [row.teamId, { ...row, form: [...row.form] }])
            );
        });

        // Extract player team league for fast match routing
        const playerTeam = allTeams.find(t => t.id === playerTeamId);
        const playerLeagueId = playerTeam?.leagueId;

        // Lazy condition & status updates: only allocate memory when status or condition genuinely changes
        let updatedAllTeams = allTeams.map(t => {
            let teamChanged = false;
            const updatedSquad = t.squad.map(p => {
                const needsHeal = (p.isInjured && p.injuryWeeksRemaining) || (p.isSuspended && p.suspensionWeeksRemaining);
                const needsRecovery = !p.condition || p.condition < 100;
                const needsStats = !p.stats;

                if (!needsHeal && !needsRecovery && !needsStats) {
                    return p;
                }

                teamChanged = true;
                const newP = { ...p };

                // Heal injuries / suspensions if week advances
                if (newP.isInjured && newP.injuryWeeksRemaining) {
                    newP.injuryWeeksRemaining -= 1;
                    if (newP.injuryWeeksRemaining <= 0) {
                        newP.isInjured = false;
                        newP.injuryWeeksRemaining = 0;
                    }
                }
                if (newP.isSuspended && newP.suspensionWeeksRemaining) {
                    newP.suspensionWeeksRemaining -= 1;
                    if (newP.suspensionWeeksRemaining <= 0) {
                        newP.isSuspended = false;
                        newP.suspensionWeeksRemaining = 0;
                    }
                }

                // Recover condition slightly for players at the start of the week
                if (!newP.condition || newP.condition < 100) {
                    newP.condition = Math.min(100, (newP.condition || 100) + 15);
                }

                // Ensure stats exists
                if (!newP.stats) {
                    newP.stats = { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 };
                } else {
                    newP.stats = { ...newP.stats };
                }

                return newP;
            });

            if (teamChanged) {
                return { ...t, squad: updatedSquad };
            }

            return t; // Return original reference if nothing changed
        });
        
        // Filter matches by currentWeek AND currentTurn (use lightweight weekMatches if provided)
        const matchesThisWeek = weekMatches || (schedule ? newSchedule.filter(m => m.week === nextWeek && !!m.isMidweek === isMidweek) : []);
        const updatedWeekMatches: Match[] = [];

        let updatedCups = { ...cups };

        const userPlayedThisWeek = matchesThisWeek.some(m => m.homeTeamId === playerTeamId || m.awayTeamId === playerTeamId);
        const weeklyNet = (finances.weeklyIncome - finances.weeklyWages) / 1_000_000;
        let confidenceChange = weeklyNet > 0 ? 1 : (userPlayedThisWeek ? -1 : 0);

        let playerMatchResult: { 
            homeTeamId?: number;
            awayTeamId?: number;
            competition?: string;
            week?: number;
            isMidweek?: boolean;
            homeScore: number; 
            awayScore: number; 
            penalties?: { home: number; away: number }; 
            events?: string[]; 
            scorers?: any[]; 
        } | null = null;

        // Pre-index teams for O(1) instant lookups
        const teamMap = new Map<number, Team>(updatedAllTeams.map(t => [t.id, t]));

        // Pre-index schedule positions for this week's matches for O(1) lookups if full schedule is present
        const scheduleIndexMap = new Map<string, number>();
        if (newSchedule.length > 0) {
            newSchedule.forEach((m, idx) => {
                if (m.week === nextWeek && !!m.isMidweek === isMidweek) {
                    scheduleIndexMap.set(`${m.homeTeamId}_${m.awayTeamId}`, idx);
                }
            });
        }

        if (matchesThisWeek.length > 0) {
            matchesThisWeek.forEach(match => {
                if (match.result) return;

                const homeTeam = teamMap.get(match.homeTeamId);
                const awayTeam = teamMap.get(match.awayTeamId);
                if (!homeTeam || !awayTeam) return;

                let homeRow: LeagueTableRow | undefined;
                let awayRow: LeagueTableRow | undefined;

                if (!match.isCupMatch) {
                    const leagueId = homeTeam.leagueId;
                    if (leagueMaps[leagueId]) {
                        homeRow = leagueMaps[leagueId].get(match.homeTeamId);
                        awayRow = leagueMaps[leagueId].get(match.awayTeamId);
                    }
                }

                const dummyRow: LeagueTableRow = { teamId: 0, position: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] };

                const isUserMatch = match.homeTeamId === playerTeamId || match.awayTeamId === playerTeamId;

                // Determine if this match is a genuine elimination / knockout match (prórroga y penales)
                // Matches for points (regular league, Champions/Europa league stage, Libertadores groups) always end at 90'
                const isKnockoutMatch = !!match.isCupMatch && (
                    match.competition === 'FA_Cup' ||
                    match.competition === 'Carabao_Cup' ||
                    match.competition === 'Copa_Del_Rey' ||
                    match.competition === 'DFB_Pokal' ||
                    match.competition === 'Coppa_Italia' ||
                    match.competition === 'Copa_Argentina' ||
                    match.competition === 'Playoffs_Apertura' ||
                    match.competition === 'Playoffs_Clausura' ||
                    match.competition === 'Nacional_Primer_Ascenso' ||
                    match.competition === 'Nacional_Reducido' ||
                    match.competition === 'Copa_Intercontinental' ||
                    ((match.competition === 'Champions_League' || match.competition === 'Europa_League') && updatedCups[match.competition === 'Champions_League' ? 'championsLeague' : 'europaLeague']?.currentPhase !== 'league') ||
                    (match.competition === 'Copa_Libertadores' && updatedCups['copaLibertadores']?.phase !== 'groups') ||
                    (match.competition === 'Copa_Sudamericana' && updatedCups['copaSudamericana']?.phase !== 'groups')
                );

                const isUserLeagueMatch = !!(playerLeagueId && (homeTeam.leagueId === playerLeagueId || awayTeam.leagueId === playerLeagueId));
                const isContinentalMatch = match.competition === 'Copa_Libertadores' || 
                                           match.competition === 'Copa_Sudamericana' || 
                                           match.competition === 'Champions_League' || 
                                           match.competition === 'Europa_League';

                // Use micro-simulation for user matches, user's active league, and continental tournaments
                // Use fast macro-simulation (Poisson) for foreign AI-only leagues to save 85-90% CPU
                const useMacroSimulation = !isUserMatch && !isUserLeagueMatch && !isContinentalMatch;

                const result = useMacroSimulation
                    ? simulateMacroMatch(homeTeam, awayTeam, homeRow || dummyRow, awayRow || dummyRow, isKnockoutMatch)
                    : simulateMatch(homeTeam, awayTeam, homeRow || dummyRow, awayRow || dummyRow, isKnockoutMatch, isUserMatch);

                const matchResultData = { 
                    homeScore: result.homeScore, 
                    awayScore: result.awayScore, 
                    events: result.events, 
                    scorers: result.scorers 
                };

                const updatedMatch: Match = {
                    ...match,
                    result: matchResultData,
                    penalties: result.penalties
                };
                updatedWeekMatches.push(updatedMatch);

                const matchIndex = scheduleIndexMap.get(`${match.homeTeamId}_${match.awayTeamId}`);
                if (matchIndex !== undefined && newSchedule[matchIndex]) {
                    newSchedule[matchIndex] = updatedMatch;
                }

                if (isUserMatch) {
                    playerMatchResult = {
                        homeTeamId: match.homeTeamId,
                        awayTeamId: match.awayTeamId,
                        competition: match.competition,
                        week: match.week,
                        isMidweek: !!match.isMidweek,
                        homeScore: result.homeScore,
                        awayScore: result.awayScore,
                        penalties: result.penalties,
                        events: result.events,
                        scorers: result.scorers
                    };
                }

                if (!match.isCupMatch && homeRow && awayRow) {
                    homeRow.played++; awayRow.played++;
                    homeRow.goalsFor += result.homeScore; awayRow.goalsFor += result.awayScore;
                    homeRow.goalsAgainst += result.awayScore; awayRow.goalsAgainst += result.homeScore;
                    homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;
                    awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;

                    let homeResult: 'W' | 'D' | 'L', awayResult: 'W' | 'D' | 'L';

                    if (result.homeScore > result.awayScore) {
                        homeRow.won++; homeRow.points += 3; homeResult = 'W';
                        awayRow.lost++; awayResult = 'L';
                    } else if (result.awayScore > result.homeScore) {
                        awayRow.won++; awayRow.points += 3; awayResult = 'W';
                        homeRow.lost++; homeResult = 'L';
                    } else {
                        homeRow.drawn++; homeRow.points += 1; homeResult = 'D';
                        awayRow.drawn++; awayRow.points += 1; awayResult = 'D';
                    }
                    homeRow.form.unshift(homeResult);
                    awayRow.form.unshift(awayResult);

                    // Update historical promedios for Argentine league
                    homeRow.playedTotal = (homeRow.playedTotal || 0) + 1;
                    homeRow.pointsTotal = (homeRow.pointsTotal || 0) + (homeResult === 'W' ? 3 : homeResult === 'D' ? 1 : 0);
                    homeRow.promedio = Number((homeRow.pointsTotal / Math.max(1, homeRow.playedTotal)).toFixed(3));

                    awayRow.playedTotal = (awayRow.playedTotal || 0) + 1;
                    awayRow.pointsTotal = (awayRow.pointsTotal || 0) + (awayResult === 'W' ? 3 : awayResult === 'D' ? 1 : 0);
                    awayRow.promedio = Number((awayRow.pointsTotal / Math.max(1, awayRow.playedTotal)).toFixed(3));

                    homeTeam.teamMorale = updateTeamMorale(homeTeam.teamMorale, homeResult);
                    awayTeam.teamMorale = updateTeamMorale(awayTeam.teamMorale, awayResult);

                    if (homeTeam.id === playerTeamId) {
                        if (homeResult === 'W') confidenceChange += 2;
                        if (homeResult === 'D') confidenceChange -= 1;
                        if (homeResult === 'L') confidenceChange -= 4;
                    }
                    if (awayTeam.id === playerTeamId) {
                        if (awayResult === 'W') confidenceChange += 3;
                        if (awayResult === 'D') confidenceChange += 1;
                        if (awayResult === 'L') confidenceChange -= 2;
                    }
                } else if (match.isCupMatch) {
                    let homeResult: 'W' | 'D' | 'L';
                    let awayResult: 'W' | 'D' | 'L';

                    if (result.homeScore > result.awayScore) {
                        homeResult = 'W';
                        awayResult = 'L';
                    } else if (result.awayScore > result.homeScore) {
                        homeResult = 'L';
                        awayResult = 'W';
                    } else if (result.penalties) {
                        const homeWonPens = result.penalties.home > result.penalties.away;
                        homeResult = homeWonPens ? 'W' : 'L';
                        awayResult = homeWonPens ? 'L' : 'W';
                    } else {
                        // Regular tie in group or league stage of cups
                        homeResult = 'D';
                        awayResult = 'D';
                    }

                    homeTeam.teamMorale = updateTeamMorale(homeTeam.teamMorale, homeResult);
                    awayTeam.teamMorale = updateTeamMorale(awayTeam.teamMorale, awayResult);

                    if (homeTeam.id === playerTeamId) {
                        if (homeResult === 'W') confidenceChange += 3;
                        if (homeResult === 'D') confidenceChange += 0;
                        if (homeResult === 'L') confidenceChange -= 2;
                    }
                    if (awayTeam.id === playerTeamId) {
                        if (awayResult === 'W') confidenceChange += 3;
                        if (awayResult === 'D') confidenceChange += 0;
                        if (awayResult === 'L') confidenceChange -= 2;
                    }

                    const cupId: CupKey = (match.competition && COMPETITION_TO_CUP_KEY[match.competition]) || 'faCup';

                    const currentCup = updatedCups[cupId];

                    if (currentCup) {
                        const assignGoals = (team: Team, goals: number) => {
                            const startingXI = team.squad.slice(0, 11);
                            for (let i = 0; i < goals; i++) {
                                const scorer = startingXI[Math.floor(Math.random() * startingXI.length)];
                                if (!currentCup.statistics) currentCup.statistics = { topScorers: [], championsHistory: [] };
                                const existingScorer = currentCup.statistics.topScorers.find((s: any) => s.playerId === scorer.id);
                                if (existingScorer) {
                                    existingScorer.goals++;
                                } else {
                                    currentCup.statistics.topScorers.push({
                                        playerId: scorer.id,
                                        playerName: scorer.name,
                                        teamId: team.id,
                                        teamName: team.name,
                                        goals: 1
                                    });
                                }
                            }
                        };

                        assignGoals(homeTeam, result.homeScore);
                        assignGoals(awayTeam, result.awayScore);
                        
                        // European League Table Update
                        if (match.competition === 'Champions_League' || match.competition === 'Europa_League') {
                            if (currentCup.currentPhase === 'league') {
                                const homeEuRow = currentCup.leagueTable?.find((r: any) => r.teamId === match.homeTeamId);
                                const awayEuRow = currentCup.leagueTable?.find((r: any) => r.teamId === match.awayTeamId);
                                if (homeEuRow && awayEuRow) {
                                    homeEuRow.played++; awayEuRow.played++;
                                    homeEuRow.goalsFor += result.homeScore; awayEuRow.goalsFor += result.awayScore;
                                    homeEuRow.goalsAgainst += result.awayScore; awayEuRow.goalsAgainst += result.homeScore;
                                    homeEuRow.goalDifference = homeEuRow.goalsFor - homeEuRow.goalsAgainst;
                                    awayEuRow.goalDifference = awayEuRow.goalsFor - awayEuRow.goalsAgainst;
                                    if (result.homeScore > result.awayScore) { homeEuRow.won++; homeEuRow.points += 3; awayEuRow.lost++; }
                                    else if (result.awayScore > result.homeScore) { awayEuRow.won++; awayEuRow.points += 3; homeEuRow.lost++; }
                                    else { homeEuRow.drawn++; homeEuRow.points += 1; awayEuRow.drawn++; awayEuRow.points += 1; }
                                }
                            }
                        }

                        // Sync fixture in cup rounds if existing
                        if (currentCup.rounds) {
                            for (const round of currentCup.rounds) {
                                const f = round.fixtures?.find((fix: any) =>
                                    (fix.id && fix.id === match.id) ||
                                    (fix.homeTeamId === match.homeTeamId && fix.awayTeamId === match.awayTeamId && fix.week === match.week)
                                );
                                if (f) {
                                    f.result = {
                                        homeScore: result.homeScore,
                                        awayScore: result.awayScore,
                                        events: result.events,
                                        scorers: result.scorers
                                    };
                                    f.penalties = result.penalties;
                                    break;
                                }
                            }
                        }

                        // Copa Libertadores & Copa Sudamericana Group Table & Fixtures Update
                        if ((match.competition === 'Copa_Libertadores' || match.competition === 'Copa_Sudamericana') && currentCup.phase === 'groups' && currentCup.groups) {
                            for (const group of currentCup.groups) {
                                const gFix = group.fixtures?.find((fix: any) =>
                                    (fix.id && fix.id === match.id) ||
                                    (fix.homeTeamId === match.homeTeamId && fix.awayTeamId === match.awayTeamId && fix.week === match.week)
                                );
                                if (gFix) {
                                    gFix.result = {
                                        homeScore: result.homeScore,
                                        awayScore: result.awayScore,
                                        events: result.events,
                                        scorers: result.scorers
                                    };
                                    gFix.penalties = result.penalties;
                                }

                                const homeLibRow = group.table?.find((r: any) => r.teamId === match.homeTeamId);
                                const awayLibRow = group.table?.find((r: any) => r.teamId === match.awayTeamId);
                                if (homeLibRow && awayLibRow) {
                                    homeLibRow.played++; awayLibRow.played++;
                                    homeLibRow.goalsFor += result.homeScore; awayLibRow.goalsFor += result.awayScore;
                                    homeLibRow.goalsAgainst += result.awayScore; awayLibRow.goalsAgainst += result.homeScore;
                                    homeLibRow.goalDifference = homeLibRow.goalsFor - homeLibRow.goalsAgainst;
                                    awayLibRow.goalDifference = awayLibRow.goalsFor - awayLibRow.goalsAgainst;
                                    if (result.homeScore > result.awayScore) { homeLibRow.won++; homeLibRow.points += 3; awayLibRow.lost++; }
                                    else if (result.awayScore > result.homeScore) { awayLibRow.won++; awayLibRow.points += 3; homeLibRow.lost++; }
                                    else { homeLibRow.drawn++; homeLibRow.points += 1; awayLibRow.drawn++; awayLibRow.points += 1; }
                                    break;
                                }
                            }
                        }

                        updatedCups[cupId] = currentCup;
                    }
                }
            });
        }

        // Scouting Progress Logic
        const updatedScoutedPlayerIds = { ...scoutedPlayerIds };
        const newsToAdd: any[] = [];
        
        if (scouts && scouts.length > 0) {
            // Scouts advance knowledge on random players in the market
            const allMarketPlayers = updatedAllTeams.flatMap(t => t.squad);
            scouts.forEach(scout => {
                // Find a player that isn't fully scouted yet
                const potentialTargets = allMarketPlayers.filter(p => (updatedScoutedPlayerIds[p.id] || 0) < 100);
                if (potentialTargets.length > 0) {
                    const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                    const currentLevel = updatedScoutedPlayerIds[target.id] || 0;
                    const increment = (scout.efficiency / 5) + (Math.random() * 5);
                    updatedScoutedPlayerIds[target.id] = Math.min(100, currentLevel + increment);
                }
            });
        }

        // Convert maps back to arrays and sort
        const updatedLeagueTables: Record<LeagueId, LeagueTableRow[]> = {} as any;
        Object.keys(leagueMaps).forEach(leagueId => {
            const table = Array.from(leagueMaps[leagueId].values());
            // Sort by points, then goal diff, then goals for
            table.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                return b.goalsFor - a.goalsFor;
            });
            // Update positions
            table.forEach((row, index) => {
                row.position = index + 1;
            });
            updatedLeagueTables[leagueId as LeagueId] = table;
        });

        const output: SimulationOutput = {
            type: 'SIMULATION_COMPLETE',
            payload: {
                updatedWeekMatches,
                updatedSchedule: newSchedule.length > 0 ? newSchedule : undefined,
                updatedLeagueTables,
                updatedAllTeams,
                confidenceChange,
                playerMatchResult,
                updatedCups,
                updatedScoutedPlayerIds,
                newsToAdd
            }
        };

        self.postMessage(output);
    }
};

export { };
