// Worker manager for simulation
// Provides a clean API to communicate with the simulation worker off-main-thread

import { GameState, LeagueTableRow, Match, Team, LeagueId, NewsItem, Offer, CoachReport, CinematicEvent } from '../types';

export interface SimulationResult {
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
        leg?: 1 | 2;
        aggregateScore?: { home: number; away: number };
    } | null;
    updatedCups: GameState['cups'];
    updatedScoutedPlayerIds: Record<number, number>;
    newsToAdd?: NewsItem[];
    newOffers?: Offer[];
    coachReport?: CoachReport;
    cinematicEvents?: CinematicEvent[];
}

interface PendingRequest {
    resolve: (value: SimulationResult) => void;
    reject: (reason?: any) => void;
    timeout: NodeJS.Timeout;
    gameState: GameState;
}

class SimulationWorkerManager {
    private worker: Worker | null = null;
    private requestCounter = 0;
    private pendingRequests = new Map<string, PendingRequest>();

    initialize() {
        if (!this.worker) {
            this.worker = new Worker(new URL('../workers/simulation.worker.ts', import.meta.url), {
                type: 'module'
            });

            this.worker.onmessage = (e: MessageEvent) => {
                if (e.data?.type === 'SIMULATION_COMPLETE') {
                    const payload = e.data.payload;
                    const requestId = payload.requestId;
                    const req = this.pendingRequests.get(requestId);
                    if (!req) return;

                    clearTimeout(req.timeout);
                    this.pendingRequests.delete(requestId);

                    // Reconstruct allTeams from modifiedTeams delta if provided, preserving identical references for untouched teams
                    let updatedAllTeams: Team[];
                    const originalLogoMap = new Map(req.gameState.allTeams.map(t => [t.id, t.logo]));

                    if (payload.modifiedTeams && Array.isArray(payload.modifiedTeams)) {
                        const modifiedMap = new Map<number, Team>(payload.modifiedTeams.map((t: Team) => [t.id, t]));
                        updatedAllTeams = req.gameState.allTeams.map(team => {
                            const mod = modifiedMap.get(team.id);
                            if (!mod) return team;
                            return {
                                ...mod,
                                logo: originalLogoMap.get(team.id) || mod.logo
                            };
                        });
                    } else if (payload.updatedAllTeams) {
                        updatedAllTeams = payload.updatedAllTeams.map((updatedTeam: Team) => ({
                            ...updatedTeam,
                            logo: originalLogoMap.get(updatedTeam.id) || updatedTeam.logo
                        }));
                    } else {
                        updatedAllTeams = req.gameState.allTeams;
                    }

                    // Reconstruct schedule from deltas
                    let updatedSchedule: Match[];
                    if (payload.updatedSchedule) {
                        updatedSchedule = payload.updatedSchedule;
                    } else if (payload.updatedWeekMatches) {
                        const getMatchKey = (m: Match) => `${m.week}_${m.homeTeamId}_${m.awayTeamId}_${m.competition || ''}_${!!m.isMidweek}`;
                        const matchMap = new Map<string, Match>();
                        payload.updatedWeekMatches.forEach((m: Match) => {
                            matchMap.set(getMatchKey(m), m);
                        });
                        updatedSchedule = req.gameState.schedule.map(m => matchMap.get(getMatchKey(m)) || m);
                        if (payload.newCupMatches && Array.isArray(payload.newCupMatches)) {
                            updatedSchedule = [...updatedSchedule, ...payload.newCupMatches];
                        }
                    } else {
                        updatedSchedule = req.gameState.schedule;
                    }

                    req.resolve({
                        updatedSchedule,
                        updatedLeagueTables: payload.updatedLeagueTables,
                        updatedAllTeams,
                        confidenceChange: payload.confidenceChange,
                        playerMatchResult: payload.playerMatchResult,
                        updatedCups: payload.updatedCups,
                        updatedScoutedPlayerIds: payload.updatedScoutedPlayerIds,
                        newsToAdd: payload.newsToAdd || [],
                        newOffers: payload.newOffers || [],
                        coachReport: payload.coachReport,
                        cinematicEvents: payload.cinematicEvents || []
                    });
                }
            };

            this.worker.onerror = (error) => {
                console.error('[SimulationWorkerManager] Worker error:', error);
                this.pendingRequests.forEach(req => {
                    clearTimeout(req.timeout);
                    req.reject(error);
                });
                this.pendingRequests.clear();
            };
        }
    }

    simulateWeek(gameState: GameState): Promise<SimulationResult> {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                this.initialize();
            }

            const requestId = `sim_${++this.requestCounter}_${Date.now()}`;
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error(`Simulation timeout for request ${requestId}`));
            }, 30000); // 30 second timeout

            this.pendingRequests.set(requestId, {
                resolve,
                reject,
                timeout,
                gameState
            });

            const isMidweek = gameState.currentTurn === 'midweek';
            const weekMatches = gameState.schedule.filter(
                m => m.week === gameState.currentWeek && !!m.isMidweek === isMidweek
            );

            this.worker!.postMessage({
                type: 'SIMULATE_WEEK',
                payload: {
                    requestId,
                    currentWeek: gameState.currentWeek,
                    currentTurn: gameState.currentTurn,
                    currentDate: gameState.currentDate,
                    season: gameState.season,
                    weekMatches,
                    schedule: gameState.schedule,
                    leagueTables: gameState.leagueTables,
                    allTeams: gameState.allTeams.map(t => (t.logo ? { ...t, logo: undefined } : t)),
                    playerTeam: gameState.team.logo ? { ...gameState.team, logo: undefined } : gameState.team,
                    playerTeamId: gameState.team.id,
                    cups: gameState.cups,
                    finances: gameState.finances,
                    scouts: gameState.scouts,
                    scoutedPlayerIds: gameState.scoutedPlayerIds,
                    cinematicQueue: gameState.cinematicQueue,
                    youthAcademy: gameState.youthAcademy
                }
            });
        });
    }

    terminate() {
        if (this.worker) {
            this.pendingRequests.forEach(req => clearTimeout(req.timeout));
            this.pendingRequests.clear();
            this.worker.terminate();
            this.worker = null;
        }
    }
}

export const simulationWorker = new SimulationWorkerManager();
