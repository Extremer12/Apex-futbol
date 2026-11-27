/**
 * Stateful Simulation Worker Manager
 *
 * Syncs full 508-club / 6,500-match baseline state ONCE via `INIT_STATE`,
 * sends only modified team/slice deltas via `PATCH_STATE` between turns,
 * and triggers lightweight `SIMULATE_TURN` calls (< 3 KB payload) per week.
 */

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
    timeout: ReturnType<typeof setTimeout>;
    gameState: GameState;
    retriedSync?: boolean;
}

interface SyncedSessionTracker {
    sessionKey: string;
    teamRefs: Map<number, Team>;
    scheduleRef: Match[];
    leagueTablesRef: Record<LeagueId, LeagueTableRow[]>;
    cupsRef: GameState['cups'];
    scoutedRef: Record<number, number>;
    playerTeamId: number;
}

function buildSessionKey(gameState: GameState): string {
    return `${gameState.careerId || 'default'}_s${gameState.season}`;
}

function stripTeamLogo(team: Team): Team {
    return team.logo ? { ...team, logo: undefined } : team;
}

class SimulationWorkerManager {
    private worker: Worker | null = null;
    private requestCounter = 0;
    private pendingRequests = new Map<string, PendingRequest>();
    private syncedSession: SyncedSessionTracker | null = null;

    initialize() {
        if (!this.worker) {
            this.worker = new Worker(new URL('../workers/simulation.worker.ts', import.meta.url), {
                type: 'module'
            });

            this.worker.onmessage = (e: MessageEvent) => {
                const msgType = e.data?.type;

                if (msgType === 'STATE_SYNC_REQUIRED') {
                    const requestId = e.data?.payload?.requestId;
                    const req = requestId ? this.pendingRequests.get(requestId) : undefined;
                    if (!req || req.retriedSync) return;

                    req.retriedSync = true;
                    this.syncedSession = null;
                    this.sendInitAndTurn(requestId, req.gameState);
                    return;
                }

                if (msgType === 'SIMULATION_COMPLETE') {
                    const payload = e.data.payload;
                    const requestId = payload.requestId;
                    const req = this.pendingRequests.get(requestId);
                    if (!req) return;

                    clearTimeout(req.timeout);
                    this.pendingRequests.delete(requestId);

                    // Reconstruct allTeams from modifiedTeams delta while keeping untouched team references intact
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

                    // Reconstruct schedule from deltas (avoid duplicating untouched 6,500 matches)
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

                    // Record synced refs matching what both Worker RAM and upcoming GameState hold
                    this.recordSyncedState(
                        buildSessionKey(req.gameState),
                        updatedAllTeams,
                        updatedSchedule,
                        payload.updatedLeagueTables,
                        payload.updatedCups,
                        payload.updatedScoutedPlayerIds,
                        req.gameState.team.id
                    );

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
                this.syncedSession = null;
                this.pendingRequests.forEach(req => {
                    clearTimeout(req.timeout);
                    req.reject(error);
                });
                this.pendingRequests.clear();
            };
        }
    }

    private recordSyncedState(
        sessionKey: string,
        allTeams: Team[],
        schedule: Match[],
        leagueTables: Record<LeagueId, LeagueTableRow[]>,
        cups: GameState['cups'],
        scoutedPlayerIds: Record<number, number>,
        playerTeamId: number
    ) {
        this.syncedSession = {
            sessionKey,
            teamRefs: new Map(allTeams.map(t => [t.id, t])),
            scheduleRef: schedule,
            leagueTablesRef: leagueTables,
            cupsRef: cups,
            scoutedRef: scoutedPlayerIds,
            playerTeamId
        };
    }

    private sendInitAndTurn(requestId: string, gameState: GameState) {
        if (!this.worker) return;
        const sessionKey = buildSessionKey(gameState);

        this.worker.postMessage({
            type: 'INIT_STATE',
            payload: {
                sessionKey,
                allTeams: gameState.allTeams.map(stripTeamLogo),
                schedule: gameState.schedule,
                leagueTables: gameState.leagueTables,
                cups: gameState.cups,
                scoutedPlayerIds: gameState.scoutedPlayerIds,
                playerTeamId: gameState.team.id
            }
        });

        this.recordSyncedState(
            sessionKey,
            gameState.allTeams,
            gameState.schedule,
            gameState.leagueTables,
            gameState.cups,
            gameState.scoutedPlayerIds,
            gameState.team.id
        );

        this.sendSimulateTurn(requestId, sessionKey, gameState);
    }

    private sendPatchIfNeeded(sessionKey: string, gameState: GameState) {
        if (!this.worker || !this.syncedSession) return;
        const prev = this.syncedSession;
        const patch: Record<string, any> = { sessionKey };
        let hasChanges = false;

        // Detect only modified teams via O(508) reference comparison (typically 0-2 teams)
        const modifiedTeams: Team[] = [];
        const currentTeamIds = new Set<number>();
        for (let i = 0; i < gameState.allTeams.length; i++) {
            const t = gameState.allTeams[i];
            currentTeamIds.add(t.id);
            if (prev.teamRefs.get(t.id) !== t) {
                modifiedTeams.push(stripTeamLogo(t));
            }
        }
        // Sync user team snapshot if `gameState.team` mutated out-of-sync with `allTeams`
        if (modifiedTeams.length === 0 && prev.teamRefs.get(gameState.team.id) !== gameState.team) {
            modifiedTeams.push(stripTeamLogo(gameState.team));
        }

        if (modifiedTeams.length > 0 || currentTeamIds.size !== prev.teamRefs.size) {
            patch.modifiedTeams = modifiedTeams;
            if (currentTeamIds.size !== prev.teamRefs.size) {
                patch.deletedTeamIds = Array.from(prev.teamRefs.keys()).filter(id => !currentTeamIds.has(id));
            }
            hasChanges = true;
        }

        if (gameState.schedule !== prev.scheduleRef) {
            patch.schedule = gameState.schedule;
            hasChanges = true;
        }
        if (gameState.leagueTables !== prev.leagueTablesRef) {
            patch.leagueTables = gameState.leagueTables;
            hasChanges = true;
        }
        if (gameState.cups !== prev.cupsRef) {
            patch.cups = gameState.cups;
            hasChanges = true;
        }
        if (gameState.scoutedPlayerIds !== prev.scoutedRef) {
            patch.scoutedPlayerIds = gameState.scoutedPlayerIds;
            hasChanges = true;
        }
        if (gameState.team.id !== prev.playerTeamId) {
            patch.playerTeamId = gameState.team.id;
            hasChanges = true;
        }

        if (hasChanges) {
            this.worker.postMessage({
                type: 'PATCH_STATE',
                payload: patch
            });
            this.recordSyncedState(
                sessionKey,
                gameState.allTeams,
                gameState.schedule,
                gameState.leagueTables,
                gameState.cups,
                gameState.scoutedPlayerIds,
                gameState.team.id
            );
        }
    }

    private sendSimulateTurn(requestId: string, sessionKey: string, gameState: GameState) {
        if (!this.worker) return;
        this.worker.postMessage({
            type: 'SIMULATE_TURN',
            payload: {
                requestId,
                sessionKey,
                currentWeek: gameState.currentWeek,
                currentTurn: gameState.currentTurn,
                currentDate: gameState.currentDate,
                season: gameState.season,
                playerTeamId: gameState.team.id,
                finances: {
                    weeklyIncome: gameState.finances.weeklyIncome,
                    weeklyWages: gameState.finances.weeklyWages,
                    clubDirectives: gameState.finances.clubDirectives
                },
                scouts: gameState.scouts,
                cinematicQueue: gameState.cinematicQueue,
                youthAcademy: gameState.youthAcademy
            }
        });
    }

    /**
     * Marks worker session dirty so next turn re-initializes clean baseline state
     * (called on LOAD_GAME, INITIALIZE_GAME, RESET_GAME, START_NEW_SEASON, SWITCH_CLUB).
     */
    resetSession() {
        this.syncedSession = null;
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
            }, 30000);

            this.pendingRequests.set(requestId, {
                resolve,
                reject,
                timeout,
                gameState
            });

            const sessionKey = buildSessionKey(gameState);

            if (!this.syncedSession || this.syncedSession.sessionKey !== sessionKey) {
                this.sendInitAndTurn(requestId, gameState);
            } else {
                this.sendPatchIfNeeded(sessionKey, gameState);
                this.sendSimulateTurn(requestId, sessionKey, gameState);
            }
        });
    }

    terminate() {
        if (this.worker) {
            this.pendingRequests.forEach(req => clearTimeout(req.timeout));
            this.pendingRequests.clear();
            this.syncedSession = null;
            this.worker.terminate();
            this.worker = null;
        }
    }
}

export const simulationWorker = new SimulationWorkerManager();
