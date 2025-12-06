// Event Engine - Dynamic JSON-based event system
// Allows adding new events without modifying code

import { GameState } from '../types';
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

    constructor() {
        this.events = eventsData.events as GameEvent[];
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

        // Check week range
        if (conditions.minWeek && currentWeek < conditions.minWeek) return false;
        if (conditions.maxWeek && currentWeek > conditions.maxWeek) return false;

        // Check balance
        if (conditions.minBalance && balance < conditions.minBalance) return false;
        if (conditions.maxBalance && balance > conditions.maxBalance) return false;

        // Check fan approval
        if (conditions.minFanApproval && fanApproval < conditions.minFanApproval) return false;
        if (conditions.maxFanApproval && fanApproval > conditions.maxFanApproval) return false;

        // Check position
        if (conditions.minPosition && position < conditions.minPosition) return false;
        if (conditions.maxPosition && position > conditions.maxPosition) return false;

        // Check sponsors
        if (conditions.hasSponsors && gameState.sponsors.length === 0) return false;

        // Check star player (rating > 85)
        if (conditions.hasStarPlayer) {
            const hasStarPlayer = gameState.team.squad.some(p => p.rating > 85);
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
        // Filter events that haven't been triggered and meet conditions
        const eligibleEvents = this.events.filter(event =>
            !this.triggeredEventIds.has(event.id) && this.checkConditions(event, gameState)
        );

        if (eligibleEvents.length === 0) return null;

        // Select random event from eligible ones
        const event = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];

        // Mark as triggered
        this.triggeredEventIds.add(event.id);

        return {
            event,
            onChoice: (choiceIndex: number) => {
                if (choiceIndex < 0 || choiceIndex >= event.choices.length) {
                    throw new Error('Invalid choice index');
                }
                return event.choices[choiceIndex].effects;
            }
        };
    }

    /**
     * Apply event effects to game state
     */
    applyEffects(effects: EventEffects, gameState: GameState): Partial<GameState> {
        const updates: any = {};

        // Financial effects
        if (effects.balance !== undefined) {
            updates.finances = {
                ...gameState.finances,
                balance: gameState.finances.balance + effects.balance
            };
        }

        if (effects.transferBudget !== undefined) {
            updates.finances = {
                ...(updates.finances || gameState.finances),
                transferBudget: gameState.finances.transferBudget + effects.transferBudget
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
            updates.team = {
                ...gameState.team,
                teamMorale: Math.max(0, Math.min(100, gameState.team.teamMorale + effects.teamMorale))
            };
        }

        // Fan approval
        if (effects.fanApproval !== undefined) {
            updates.fanApproval = {
                ...gameState.fanApproval,
                rating: Math.max(0, Math.min(100, gameState.fanApproval.rating + effects.fanApproval))
            };
        }

        // Chairman confidence
        if (effects.chairmanConfidence !== undefined) {
            updates.chairmanConfidence = Math.max(0, Math.min(100,
                gameState.chairmanConfidence + effects.chairmanConfidence
            ));
        }

        // Stadium capacity
        if (effects.stadiumCapacity !== undefined) {
            updates.stadium = {
                ...gameState.stadium,
                capacity: gameState.stadium.capacity + effects.stadiumCapacity
            };
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
