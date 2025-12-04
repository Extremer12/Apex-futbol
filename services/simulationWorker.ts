// Worker manager for simulation
// Provides a clean API to communicate with the simulation worker

import { GameState, LeagueTableRow, Match, Team } from '../types';

interface SimulationResult {
    updatedSchedule: Match[];
    updatedLeagueTable: LeagueTableRow[];
    updatedChampionshipTable: LeagueTableRow[];
    updatedLaLigaTable: LeagueTableRow[];
    updatedAllTeams: Team[];
    confidenceChange: number;
    playerMatchResult: { homeScore: number; awayScore: number; penalties?: { home: number; away: number } } | null;
    updatedCups: {
        faCup: any;
        carabaoCup: any;
    };
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
                    resolve(e.data.payload);
                }
            };

            this.worker!.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
            };

            this.worker!.postMessage({
                type: 'SIMULATE_WEEK',
                payload: {
                    currentWeek: gameState.currentWeek,
                    schedule: gameState.schedule,
                    leagueTable: gameState.leagueTable,
                    championshipTable: gameState.championshipTable || [],
                    laLigaTable: gameState.laLigaTable || [],
                    allTeams: gameState.allTeams.map(t => ({ ...t, logo: undefined })),
                    playerTeamId: gameState.team.id,
                    cups: gameState.cups,
                    finances: gameState.finances
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
