// Web Worker for match simulation
// This runs in a separate thread to prevent UI freezing

import { Team, LeagueTableRow, Match, Morale, LeagueId } from '../types';

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
    };
}

interface SimulationOutput {
    type: 'SIMULATION_COMPLETE';
    payload: {
        updatedSchedule: Match[];
        updatedLeagueTables: Record<LeagueId, LeagueTableRow[]>;
        updatedAllTeams: Team[];
        confidenceChange: number;
        playerMatchResult: { homeScore: number; awayScore: number; penalties?: { home: number; away: number } } | null;
        updatedCups: {
            faCup: any;
            carabaoCup: any;
        };
    };
}

// Helper to convert Morale string to number
function getMoraleValue(morale: Morale): number {
    switch (morale) {
        case 'Feliz': return 90;
        case 'Contento': return 75;
        case 'Normal': return 50;
        case 'Descontento': return 25;
        case 'Enojado': return 10;
        default: return 50;
    }
}

// Helper to convert number to Morale string
function getMoraleLabel(value: number): Morale {
    if (value >= 85) return 'Feliz';
    if (value >= 65) return 'Contento';
    if (value >= 40) return 'Normal';
    if (value >= 20) return 'Descontento';
    return 'Enojado';
}

// Simple match simulation logic (extracted from App.tsx)
function simulateMatch(
    homeTeam: Team,
    awayTeam: Team,
    homeRow: LeagueTableRow,
    awayRow: LeagueTableRow,
    isCupMatch: boolean
): { homeScore: number; awayScore: number; penalties?: { home: number; away: number } } {
    // Calculate team strengths
    const homeStrength = homeTeam.squad.reduce((sum, p) => sum + p.rating, 0) / homeTeam.squad.length;
    const awayStrength = awayTeam.squad.reduce((sum, p) => sum + p.rating, 0) / awayTeam.squad.length;

    // Home advantage
    const homeAdvantage = 5;
    const adjustedHomeStrength = homeStrength + homeAdvantage;

    // Morale impact
    const homeMoraleBonus = (getMoraleValue(homeTeam.teamMorale) - 50) / 10;
    const awayMoraleBonus = (getMoraleValue(awayTeam.teamMorale) - 50) / 10;

    // Form impact
    const homeFormBonus = homeRow.form.slice(0, 5).filter(r => r === 'W').length * 2;
    const awayFormBonus = awayRow.form.slice(0, 5).filter(r => r === 'W').length * 2;

    const finalHomeStrength = adjustedHomeStrength + homeMoraleBonus + homeFormBonus;
    const finalAwayStrength = awayStrength + awayMoraleBonus + awayFormBonus;

    // Simulate goals
    const homeGoalChance = finalHomeStrength / (finalHomeStrength + finalAwayStrength);
    const awayGoalChance = 1 - homeGoalChance;

    let homeScore = 0;
    let awayScore = 0;

    // Simulate 10 goal opportunities
    for (let i = 0; i < 10; i++) {
        if (Math.random() < homeGoalChance * 0.3) homeScore++;
        if (Math.random() < awayGoalChance * 0.3) awayScore++;
    }

    // Cup matches: handle extra time and penalties
    if (isCupMatch && homeScore === awayScore) {
        // Extra time
        if (Math.random() < 0.3) {
            if (Math.random() < homeGoalChance) homeScore++;
            else awayScore++;
        } else {
            // Penalties
            const homePenalties = Math.floor(Math.random() * 3) + 3;
            const awayPenalties = Math.floor(Math.random() * 3) + 3;
            return { homeScore, awayScore, penalties: { home: homePenalties, away: awayPenalties } };
        }
    }

    return { homeScore, awayScore };
}

function updateTeamMorale(currentMorale: Morale, result: 'W' | 'D' | 'L'): Morale {
    let change = 0;
    if (result === 'W') change = 5;
    else if (result === 'D') change = 0;
    else change = -5;

    const currentValue = getMoraleValue(currentMorale);
    const newValue = Math.max(0, Math.min(100, currentValue + change));

    return getMoraleLabel(newValue);
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
            cups,
            finances
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

        let updatedAllTeams = allTeams.map(t => ({ ...t }));
        const matchesThisWeek = newSchedule.filter(m => m.week === newWeek);

        let updatedFaCup = cups.faCup;
        let updatedCarabaoCup = cups.carabaoCup;

        const weeklyNet = (finances.weeklyIncome - finances.weeklyWages) / 1_000_000;
        let confidenceChange = weeklyNet > 0 ? 1 : -1;

        let playerMatchResult: { homeScore: number; awayScore: number; penalties?: { home: number; away: number } } | null = null;

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
                    result: { homeScore: result.homeScore, awayScore: result.awayScore },
                    penalties: result.penalties
                };

                if (match.homeTeamId === playerTeamId || match.awayTeamId === playerTeamId) {
                    playerMatchResult = {
                        homeScore: result.homeScore,
                        awayScore: result.awayScore,
                        penalties: result.penalties
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
                }
            }
        };

        self.postMessage(output);
    }
};

export { };
