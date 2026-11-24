// Event Engine - Dynamic JSON-based event system
// Allows adding new events without modifying code

import { GameState, Player } from '../types';
import { getMoraleValue, getMoraleLabel } from './morale';
import { generateYouthPlayer } from './simulation';
import { getLeagueCountryCode } from './nationalityService';
import eventsData from '../data/events.json';

export interface GameEvent {
    id: string;
    type: 'scandal' | 'dilemma' | 'opportunity' | 'crisis';
    title: string;
    description: string;
    conditions: EventConditions;
    choices: EventChoice[];
}

interface EventConditions {
    minWeek?: number;
    maxWeek?: number;
    minBalance?: number;
    maxBalance?: number;
    minFanApproval?: number;
    maxFanApproval?: number;
    minPosition?: number;
    maxPosition?: number;
    hasSponsors?: boolean;
    hasStarPlayer?: boolean;
    probability: number;
}

interface EventChoice {
    text: string;
    effects: EventEffects;
}

export interface EventEffects {
    balance?: number;
    transferBudget?: number;
    weeklyWages?: number;
    sponsorRevenue?: number;
    matchdayRevenue?: number;
    teamMorale?: number;
    fanApproval?: number;
    boardConfidence?: number;
    chairmanConfidence?: number;
    stadiumCapacity?: number;
    addYouthPlayer?: boolean;
}

export interface TriggeredEvent {
    event: GameEvent;
    onChoice: (choiceIndex: number) => EventEffects;
}

class EventEngine {
    private events: GameEvent[];
    private triggeredEventIds: Set<string> = new Set();
    private lastTriggeredWeek: number = -10;

    constructor() {
        this.events = eventsData.events as GameEvent[];
    }

    private getRegionScale(leagueId?: string): number {
        if (!leagueId) return 1.0;
        const southAm = [
            'LIGA_ARGENTINA', 'PRIMERA_NACIONAL',
            'BRASILEIRAO', 'SERIE_B_BR',
            'COPA_DE_PRIMERA', 'PRIMERA_DIVISION_CHILE', 'PRIMERA_B_CHILE',
            'PRIMERA_A_COLOMBIA', 'PRIMERA_B_COLOMBIA'
        ];
        if (southAm.includes(leagueId)) return 0.20;
        if (['LIGA_MX', 'LIGA_EXPANSION_MX'].includes(leagueId)) return 0.40;
        return 1.0;
    }

    /**
     * Check if an event's conditions are met
     */
    private checkConditions(event: GameEvent, gameState: GameState): boolean {
        const { conditions } = event;
        const currentWeek = gameState.currentWeek;
        const balance = gameState.finances.balance;
        const fanApproval = gameState.fanApproval.rating;
        const playerTable = gameState.leagueTables[gameState.team.leagueId] || [];
        const position = playerTable.find(row => row.teamId === gameState.team.id)?.position || 10;
        const scale = this.getRegionScale(gameState.team.leagueId);

        // Check week range
        if (conditions.minWeek && currentWeek < conditions.minWeek) return false;
        if (conditions.maxWeek && currentWeek > conditions.maxWeek) return false;

        // Check balance (scaled by region, handling millions values from events.json)
        if (conditions.minBalance) {
            const minBalRaw = (conditions.minBalance < 1000 ? conditions.minBalance * 1_000_000 : conditions.minBalance) * scale;
            if (balance < minBalRaw) return false;
        }
        if (conditions.maxBalance) {
            const maxBalRaw = (conditions.maxBalance < 1000 ? conditions.maxBalance * 1_000_000 : conditions.maxBalance) * scale;
            if (balance > maxBalRaw) return false;
        }

        // Check fan approval
        if (conditions.minFanApproval && fanApproval < conditions.minFanApproval) return false;
        if (conditions.maxFanApproval && fanApproval > conditions.maxFanApproval) return false;

        // Check position
        if (conditions.minPosition && position < conditions.minPosition) return false;
        if (conditions.maxPosition && position > conditions.maxPosition) return false;

        // Check sponsors
        if (conditions.hasSponsors && gameState.sponsors.length === 0) return false;

        // Check star player (rating > 84 in Europe, > 78 in South America)
        if (conditions.hasStarPlayer) {
            const starThreshold = scale < 0.5 ? 78 : 84;
            const hasStarPlayer = gameState.team.squad.some(p => p.rating >= starThreshold);
            if (!hasStarPlayer) return false;
        }

        // Check probability
        if (Math.random() > conditions.probability) return false;

        return true;
    }

    /**
     * Trigger a random event if conditions are met
     */
    triggerEvent(gameState: GameState): TriggeredEvent | null {
        if (!gameState) return null;
        const currentWeek = gameState.currentWeek;

        // Cooldown: at least 4 weeks between events to preserve pacing
        if (currentWeek - this.lastTriggeredWeek < 4) {
            return null;
        }

        // Only evaluate on weekend turn
        if (gameState.currentTurn === 'midweek') {
            return null;
        }

        // Global chance per eligible week (~20%)
        if (Math.random() > 0.20) {
            return null;
        }

        const previouslyTriggered = new Set([
            ...this.triggeredEventIds,
            ...(gameState.triggeredEventIds || [])
        ]);

        const candidates = this.events.filter(event =>
            !previouslyTriggered.has(event.id) && this.checkConditions(event, gameState)
        );

        if (candidates.length === 0) return null;

        const selectedEvent = candidates[Math.floor(Math.random() * candidates.length)];
        this.triggeredEventIds.add(selectedEvent.id);
        this.lastTriggeredWeek = currentWeek;

        return {
            event: selectedEvent,
            onChoice: (choiceIndex: number) => {
                const choice = selectedEvent.choices[choiceIndex];
                return choice ? choice.effects : {};
            }
        };
    }

    /**
     * Apply event effects to game state with economic regional scaling
     */
    applyEffects(effects: EventEffects, gameState: GameState): Partial<GameState> & { newYouthPlayer?: Player } {
        const updates: Partial<GameState> & { newYouthPlayer?: Player } = {};
        const scale = this.getRegionScale(gameState.team.leagueId);

        // Financial effects safely scaled (handling values in millions from events.json)
        if (effects.balance !== undefined) {
            const rawAmount = Math.abs(effects.balance) < 1000 ? effects.balance * 1_000_000 : effects.balance;
            let change = rawAmount * scale;
            if (change < 0) {
                const maxDeduction = Math.max(50_000, gameState.finances.balance * 0.15);
                change = Math.max(-maxDeduction, change);
            }
            updates.finances = {
                ...gameState.finances,
                balance: Math.max(0, gameState.finances.balance + change)
            };
        }

        if (effects.transferBudget !== undefined) {
            const rawAmount = Math.abs(effects.transferBudget) < 1000 ? effects.transferBudget * 1_000_000 : effects.transferBudget;
            let change = rawAmount * scale;
            if (change < 0) {
                const maxDeduction = Math.max(50_000, gameState.finances.transferBudget * 0.15);
                change = Math.max(-maxDeduction, change);
            }
            updates.finances = {
                ...(updates.finances || gameState.finances),
                transferBudget: Math.max(0, gameState.finances.transferBudget + change)
            };
        }

        if (effects.weeklyWages !== undefined) {
            const wageChange = gameState.finances.weeklyWages * effects.weeklyWages;
            updates.finances = {
                ...(updates.finances || gameState.finances),
                weeklyWages: gameState.finances.weeklyWages + wageChange
            };
        }

        if (effects.sponsorRevenue !== undefined) {
            const revenueChange = gameState.finances.weeklyIncome * effects.sponsorRevenue;
            updates.finances = {
                ...(updates.finances || gameState.finances),
                weeklyIncome: gameState.finances.weeklyIncome + revenueChange
            };
        }

        if (effects.matchdayRevenue !== undefined) {
            const revenueChange = gameState.finances.weeklyIncome * effects.matchdayRevenue;
            updates.finances = {
                ...(updates.finances || gameState.finances),
                weeklyIncome: gameState.finances.weeklyIncome + revenueChange
            };
        }

        // Team morale
        if (effects.teamMorale !== undefined) {
            const currentMoraleValue = getMoraleValue(gameState.team.teamMorale);
            const newMoraleValue = Math.max(0, Math.min(100, currentMoraleValue + effects.teamMorale));
            updates.team = {
                ...gameState.team,
                teamMorale: getMoraleLabel(newMoraleValue)
            };
        }

        // Fan approval
        if (effects.fanApproval !== undefined) {
            updates.fanApproval = {
                ...gameState.fanApproval,
                rating: Math.max(0, Math.min(100, gameState.fanApproval.rating + effects.fanApproval))
            };
        }

        // Board / Chairman confidence
        const confDelta = effects.boardConfidence !== undefined ? effects.boardConfidence : effects.chairmanConfidence;
        if (confDelta !== undefined) {
            updates.boardConfidence = Math.max(0, Math.min(100,
                gameState.boardConfidence + confDelta
            ));
        }

        // Stadium capacity
        if (effects.stadiumCapacity !== undefined) {
            updates.stadium = {
                ...gameState.stadium,
                capacity: gameState.stadium.capacity + effects.stadiumCapacity
            };
        }

        // Youth academy prospect event
        if (effects.addYouthPlayer) {
            updates.newYouthPlayer = generateYouthPlayer(
                gameState.team.tier,
                0,
                getLeagueCountryCode(gameState.team.leagueId)
            );
        }

        return updates;
    }

    /**
     * Reset triggered events (e.g., for new season)
     */
    reset() {
        this.triggeredEventIds.clear();
    }

    /**
     * Get all available events (for debugging/admin)
     */
    getAllEvents(): GameEvent[] {
        return this.events;
    }
}

export const eventEngine = new EventEngine();
