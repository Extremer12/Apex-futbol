// Web Worker for match simulation
// This runs in a separate thread to prevent UI freezing

import { Team, LeagueTableRow, Match, Morale, LeagueId } from '../types';
import { simulateMatch } from '../services/simulation';
import { updateTeamMorale } from '../services/morale';

// Helpers removed as they are now imported from services/morale.ts


interface SimulationInput {
    type: 'SIMULATE_WEEK';
    payload: {
        currentWeek: number;
        schedule: Match[];
        leagueTables: Record<LeagueId, LeagueTableRow[]>;
        allTeams: Team[];
        playerTeamId: number;
        cups: {
            faCup: any;
            carabaoCup: any;
        };
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
        updatedSchedule: Match[];
        updatedLeagueTables: Record<LeagueId, LeagueTableRow[]>;
        updatedAllTeams: Team[];
        confidenceChange: number;
        playerMatchResult: { homeScore: number; awayScore: number; penalties?: { home: number; away: number }; events?: string[]; scorers?: any[] } | null;
        updatedCups: {
            faCup: any;
            carabaoCup: any;
        };
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
            schedule,
            leagueTables,
            allTeams,
            playerTeamId,
            finances,
            scouts,
            scoutedPlayerIds
        } = payload;

        const newWeek = currentWeek + 1;
        const newSchedule = [...schedule];

        // Create Maps for easier update
        const leagueMaps: Record<string, Map<number, LeagueTableRow>> = {};
        Object.keys(leagueTables).forEach(leagueId => {
            leagueMaps[leagueId] = new Map<number, LeagueTableRow>(
                leagueTables[leagueId as LeagueId].map(row => [row.teamId, { ...row, form: [...row.form] }])
            );
        });

        let updatedAllTeams = allTeams.map(t => ({ ...t, squad: [...t.squad] }));
        const matchesThisWeek = newSchedule.filter(m => m.week === newWeek);

        let updatedFaCup = cups.faCup;
        let updatedCarabaoCup = cups.carabaoCup;

        const weeklyNet = (finances.weeklyIncome - finances.weeklyWages) / 1_000_000;
        let confidenceChange = weeklyNet > 0 ? 1 : -1;

        let playerMatchResult: { homeScore: number; awayScore: number; penalties?: { home: number; away: number }; events?: string[]; scorers?: any[] } | null = null;

        if (matchesThisWeek.length > 0) {
            matchesThisWeek.forEach(match => {
                if (match.result) return;

                const homeTeam = updatedAllTeams.find(t => t.id === match.homeTeamId)!;
                const awayTeam = updatedAllTeams.find(t => t.id === match.awayTeamId)!;

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

                const result = simulateMatch(homeTeam, awayTeam, homeRow || dummyRow, awayRow || dummyRow, match.isCupMatch || false);

                const matchIndex = newSchedule.findIndex(m => m.week === newWeek && m.homeTeamId === match.homeTeamId);
                newSchedule[matchIndex] = {
                    ...newSchedule[matchIndex],
                    result: { 
                        homeScore: result.homeScore, 
                        awayScore: result.awayScore, 
                        events: result.events,
                        scorers: result.scorers 
                    },
                    penalties: result.penalties
                };

                if (match.homeTeamId === playerTeamId || match.awayTeamId === playerTeamId) {
                    console.log('[WORKER] Player match result:', {
                        homeScore: result.homeScore,
                        awayScore: result.awayScore,
                        eventsCount: result.events?.length || 0,
                        events: result.events
                    });
                    playerMatchResult = {
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
                    let homeWin = result.homeScore > result.awayScore;
                    if (result.homeScore === result.awayScore && result.penalties) {
                        homeWin = result.penalties.home > result.penalties.away;
                    }

                    const homeResult = homeWin ? 'W' : 'L';
                    const awayResult = homeWin ? 'L' : 'W';

                    homeTeam.teamMorale = updateTeamMorale(homeTeam.teamMorale, homeResult);
                    awayTeam.teamMorale = updateTeamMorale(awayTeam.teamMorale, awayResult);

                    if (homeTeam.id === playerTeamId) {
                        if (homeResult === 'W') confidenceChange += 3;
                        if (homeResult === 'L') confidenceChange -= 2;
                    }
                    if (awayTeam.id === playerTeamId) {
                        if (awayResult === 'W') confidenceChange += 3;
                        if (awayResult === 'L') confidenceChange -= 2;
                    }

                    const cupId = match.competition === 'FA_Cup' ? 'faCup' : 'carabaoCup';
                    const currentCup = cupId === 'faCup' ? updatedFaCup : updatedCarabaoCup;

                    const assignGoals = (team: Team, goals: number) => {
                        const startingXI = team.squad.slice(0, 11);
                        for (let i = 0; i < goals; i++) {
                            const scorer = startingXI[Math.floor(Math.random() * startingXI.length)];
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

                    if (cupId === 'faCup') {
                        updatedFaCup = currentCup;
                    } else {
                        updatedCarabaoCup = currentCup;
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
                updatedSchedule: newSchedule,
                updatedLeagueTables,
                updatedAllTeams,
                confidenceChange,
                playerMatchResult,
                updatedCups: {
                    faCup: updatedFaCup,
                    carabaoCup: updatedCarabaoCup
                },
                updatedScoutedPlayerIds,
                newsToAdd
            }
        };

        self.postMessage(output);
    }
};

export { };
