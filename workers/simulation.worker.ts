// Web Worker for match simulation
// This runs in a separate thread to prevent UI freezing

import { Team, LeagueTableRow, Match } from '../types';

interface SimulationInput {
    type: 'SIMULATE_WEEK';
    payload: {
        currentWeek: number;
        schedule: Match[];
        leagueTable: LeagueTableRow[];
        championshipTable: LeagueTableRow[];
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
        updatedLeagueTable: LeagueTableRow[];
        updatedChampionshipTable: LeagueTableRow[];
        updatedAllTeams: Team[];
        confidenceChange: number;
        playerMatchResult: { homeScore: number; awayScore: number; penalties?: { home: number; away: number } } | null;
        updatedCups: {
            faCup: any;
            carabaoCup: any;
        };
    };
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
    const homeMoraleBonus = (homeTeam.teamMorale - 50) / 10;
    const awayMoraleBonus = (awayTeam.teamMorale - 50) / 10;

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

function updateTeamMorale(currentMorale: number, result: 'W' | 'D' | 'L'): number {
    let change = 0;
    if (result === 'W') change = 5;
    else if (result === 'D') change = 0;
    else change = -5;

    return Math.max(0, Math.min(100, currentMorale + change));
}

// Worker message handler
self.onmessage = (e: MessageEvent<SimulationInput>) => {
    const { type, payload } = e.data;

    if (type === 'SIMULATE_WEEK') {
        const {
            currentWeek,
            schedule,
            leagueTable,
            championshipTable,
            allTeams,
            playerTeamId,
            cups,
            finances
        } = payload;

        const newWeek = currentWeek + 1;
        const newSchedule = [...schedule];

        const updatedLeagueTable = new Map<number, LeagueTableRow>(
            leagueTable.map(row => [row.teamId, { ...row, form: [...row.form] }])
        );
        const updatedChampionshipTable = new Map<number, LeagueTableRow>(
            championshipTable.map(row => [row.teamId, { ...row, form: [...row.form] }])
        );

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
                    if (homeTeam.leagueId === 'PREMIER_LEAGUE') {
                        homeRow = updatedLeagueTable.get(match.homeTeamId);
                        awayRow = updatedLeagueTable.get(match.awayTeamId);
                    } else {
                        homeRow = updatedChampionshipTable.get(match.homeTeamId);
                        awayRow = updatedChampionshipTable.get(match.awayTeamId);
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

        const output: SimulationOutput = {
            type: 'SIMULATION_COMPLETE',
            payload: {
                updatedSchedule: newSchedule,
                updatedLeagueTable: Array.from(updatedLeagueTable.values()),
                updatedChampionshipTable: Array.from(updatedChampionshipTable.values()),
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
