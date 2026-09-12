import { GameState, Team, PlayerProfile, NewsItem, Player, Match, LeagueTableRow, Offer, LeagueId, CupCompetition, FanApproval, Stadium, Scout, CinematicEvent, CoachReport, ElectoralPromise } from '../types';

// Sub-reducers
import { handleGameLifecycleAction } from './reducers/gameLifecycleReducer';
import { handleTransferAction } from './reducers/transferReducer';
import { handleStaffAction } from './reducers/staffReducer';
import { handleEconomyAction } from './reducers/economyReducer';
import { handlePoliticalAction } from './reducers/politicalReducer';
import { handleSquadAction } from './reducers/squadReducer';
import { handleUIAction } from './reducers/uiReducer';

// Define all possible action types
export type GameAction =
    | { type: 'INITIALIZE_GAME'; payload: { team: Team; playerProfile: PlayerProfile; initialPromises?: ElectoralPromise[] } }
    | { type: 'LOAD_GAME'; payload: GameState }
    | { type: 'RESET_GAME' }
    | { type: 'ADVANCE_WEEK_SUCCESS'; payload: { newsItems: NewsItem[]; newSchedule: Match[]; newLeagueTables: Record<LeagueId, LeagueTableRow[]>; newAllTeams: Team[]; newConfidence: number; newOffers: Offer[]; newCups?: GameState['cups']; coachReport?: CoachReport; newScoutedPlayerIds?: Record<number, number>; cinematicEvents?: CinematicEvent[] } }
    | { type: 'PROMOTE_YOUTH'; payload: number }
    | { type: 'START_NEW_SEASON' }
    | { type: 'POP_CINEMATIC' }
    | { type: 'PUSH_CINEMATIC'; payload: CinematicEvent }
    | { type: 'TRIGGER_ELECTION' }
    | { type: 'ELECTION_RESULT'; payload: { won: boolean; newApproval: number } }
    | { type: 'UPDATE_FAN_APPROVAL'; payload: { delta: number; reason: string } }
    | { type: 'ADD_NEWS'; payload: NewsItem }
    | { type: 'ADD_OFFER'; payload: Offer }
    | { type: 'ACCEPT_OFFER'; payload: { offerId: string } }
    | { type: 'REJECT_OFFER'; payload: { offerId: string } }
    | { type: 'COUNTER_OFFER'; payload: { offerId: string; counterAmount: number } }
    | { type: 'UPDATE_OFFER'; payload: Offer }
    | { type: 'SIGN_PLAYER'; payload: { player: Player; fee: number; wage?: number; contractYears?: number; role?: import('../types').SquadRole; signingBonus?: number } }
    | { type: 'PROMOTE_PLAYER'; payload: Player }
    | { type: 'TOGGLE_TRANSFER_LIST'; payload: Player }
    | { type: 'SET_VIEWING_PLAYER'; payload: Player | null }
    | { type: 'HIRE_COACH'; payload: { coachId: string } }
    | { type: 'FIRE_COACH' }
    | { type: 'ACCEPT_SPONSOR'; payload: { sponsorId: string; negotiatedIncome?: number } }
    | { type: 'REMOVE_SPONSOR_OFFER'; payload: { sponsorId: string } }
    | { type: 'EXPAND_STADIUM' }
    | { type: 'SET_FAN_APPROVAL'; payload: FanApproval }
    | { type: 'UPDATE_FINANCES'; payload: GameState['finances'] }
    | { type: 'UPDATE_TEAM'; payload: Team }
    | { type: 'UPDATE_BOARD_CONFIDENCE'; payload: number }
    | { type: 'UPDATE_STADIUM'; payload: Stadium }
    | { type: 'HIRE_SCOUT'; payload: Scout }
    | { type: 'SCOUT_PLAYER'; payload: { playerId: number } }
    | { type: 'SET_CURRENCY'; payload: 'EUR' | 'USD' }
    | { type: 'SET_LANGUAGE'; payload: 'en' | 'es' }
    | { type: 'RECORD_TRIGGERED_EVENT'; payload: string };

export const initialState: GameState | null = null;

export function gameReducer(state: GameState | null, action: GameAction): GameState | null {
    switch (action.type) {
        // Lifecycle actions can handle null state (INITIALIZE_GAME, LOAD_GAME, RESET_GAME)
        case 'INITIALIZE_GAME':
        case 'LOAD_GAME':
        case 'RESET_GAME':
        case 'ADVANCE_WEEK_SUCCESS':
        case 'START_NEW_SEASON':
            return handleGameLifecycleAction(state, action);

        default: {
            // All other actions require state to exist
            if (!state) return null;

            switch (action.type) {
                case 'RECORD_TRIGGERED_EVENT': {
                    const existing = state.triggeredEventIds || [];
                    if (existing.includes(action.payload)) return state;
                    return {
                        ...state,
                        triggeredEventIds: [...existing, action.payload]
                    };
                }

                case 'UPDATE_TEAM':
                    return {
                        ...state,
                        team: action.payload,
                        allTeams: state.allTeams.map(t => t.id === action.payload.id ? action.payload : t)
                    };

                // Transfer actions
                case 'ADD_OFFER':
                case 'ACCEPT_OFFER':
                case 'REJECT_OFFER':
                case 'COUNTER_OFFER':
                case 'UPDATE_OFFER':
                case 'SIGN_PLAYER':
                case 'TOGGLE_TRANSFER_LIST':
                    return handleTransferAction(state, action);

                // Staff actions
                case 'HIRE_COACH':
                case 'FIRE_COACH':
                case 'HIRE_SCOUT':
                case 'SCOUT_PLAYER':
                    return handleStaffAction(state, action);

                // Economy actions
                case 'ACCEPT_SPONSOR':
                case 'REMOVE_SPONSOR_OFFER':
                case 'EXPAND_STADIUM':
                case 'UPDATE_FINANCES':
                case 'UPDATE_STADIUM':
                    return handleEconomyAction(state, action);

                // Political actions
                case 'TRIGGER_ELECTION':
                case 'ELECTION_RESULT':
                case 'UPDATE_FAN_APPROVAL':
                case 'SET_FAN_APPROVAL':
                case 'UPDATE_BOARD_CONFIDENCE':
                    return handlePoliticalAction(state, action);

                // Squad actions
                case 'PROMOTE_PLAYER':
                case 'PROMOTE_YOUTH':
                case 'SET_VIEWING_PLAYER':
                    return handleSquadAction(state, action);

                // UI actions
                case 'ADD_NEWS':
                case 'POP_CINEMATIC':
                case 'PUSH_CINEMATIC':
                case 'SET_CURRENCY':
                case 'SET_LANGUAGE':
                    return handleUIAction(state, action);

                default:
                    return state;
            }
        }
    }
}
