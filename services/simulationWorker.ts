// Worker manager for simulation
// Provides a clean API to communicate with the simulation worker

import { GameState, LeagueTableRow, Match, Team, LeagueId } from '../types';

interface SimulationResult {
    updatedSchedule: Match[];
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
        scorers?: { playerId: number; playerName: string; minute: number }[];
    } | null;
    updatedCups: GameState['cups'];
    updatedScoutedPlayerIds: Record<number, number>;
    newsToAdd?: any[];
}

class SimulationWorkerManager {
    private worker: Worker | null = null;

    initialize() {
        if (!this.worker) {
            this.worker = new Worker(new URL('../workers/simulation.worker.ts', import.meta.url), {
                type: 'module'
            });
        }
    }

    simulateWeek(gameState: GameState): Promise<SimulationResult> {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                this.initialize();
            }

            const timeout = setTimeout(() => {
                reject(new Error('Simulation timeout'));
            }, 30000); // 30 second timeout

            this.worker!.onmessage = (e) => {
                clearTimeout(timeout);
                if (e.data.type === 'SIMULATION_COMPLETE') {
                    const payload = e.data.payload;
                    if (payload.updatedWeekMatches) {
                        const getMatchKey = (m: Match) => `${m.week}_${m.homeTeamId}_${m.awayTeamId}_${m.competition || ''}_${!!m.isMidweek}`;
                        const matchMap = new Map<string, Match>();
                        payload.updatedWeekMatches.forEach((m: Match) => {
                            matchMap.set(getMatchKey(m), m);
                        });
                        const updatedSchedule = gameState.schedule.map(m => matchMap.get(getMatchKey(m)) || m);
                        resolve({
                            ...payload,
                            updatedSchedule
                        });
                    } else {
                        resolve(payload);
                    }
                }
            };

            this.worker!.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
            };

            const isMidweek = gameState.currentTurn === 'midweek';
            const weekMatches = gameState.schedule.filter(
                m => m.week === gameState.currentWeek && !!m.isMidweek === isMidweek
            );

            this.worker!.postMessage({
                type: 'SIMULATE_WEEK',
                payload: {
                    currentWeek: gameState.currentWeek,
                    currentTurn: gameState.currentTurn,
                    weekMatches,
                    leagueTables: gameState.leagueTables,
                    allTeams: gameState.allTeams.map(t => (t.logo ? { ...t, logo: undefined } : t)),
                    playerTeamId: gameState.team.id,
                    cups: gameState.cups,
                    finances: gameState.finances,
                    scouts: gameState.scouts,
                    scoutedPlayerIds: gameState.scoutedPlayerIds
                }
            });
        });
    }

    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

export const simulationWorker = new SimulationWorkerManager();
