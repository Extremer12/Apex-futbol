import { GameState, Team, PlayerProfile, NewsItem, Player, Match, LeagueTableRow, Offer, LeagueId, CupCompetition, FanApproval, Stadium, Scout } from '../types';

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
    | { type: 'INITIALIZE_GAME'; payload: { team: Team; playerProfile: PlayerProfile; initialPromises?: any[] } }
    | { type: 'LOAD_GAME'; payload: GameState }
    | { type: 'RESET_GAME' }
    | { type: 'ADVANCE_WEEK_START' }
    | { type: 'ADVANCE_WEEK_SUCCESS'; payload: { newsItems: NewsItem[]; newSchedule: Match[]; newLeagueTables: Record<LeagueId, LeagueTableRow[]>; newAllTeams: Team[]; newConfidence: number; newOffers: Offer[]; newCups?: GameState['cups']; coachReport?: any; newScoutedPlayerIds?: any } }
    | { type: 'PROMOTE_YOUTH'; payload: number }
    | { type: 'START_NEW_SEASON' }
    | { type: 'POP_CINEMATIC' }
    | { type: 'PUSH_CINEMATIC'; payload: import('../types').CinematicEvent }
    | { type: 'TRIGGER_ELECTION' }
    | { type: 'ELECTION_RESULT'; payload: { won: boolean; newApproval: number } }
    | { type: 'UPDATE_FAN_APPROVAL'; payload: { delta: number; reason: string } }
    | { type: 'ADD_NEWS'; payload: NewsItem }
    | { type: 'ADD_OFFER'; payload: Offer }
    | { type: 'ACCEPT_OFFER'; payload: { offerId: string } }
    | { type: 'REJECT_OFFER'; payload: { offerId: string } }
    | { type: 'SIGN_PLAYER'; payload: { player: Player; fee: number } }
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
    | { type: 'SET_LANGUAGE'; payload: 'en' | 'es' };

export const initialState: GameState | null = null;

// Action type sets for routing to sub-reducers
const LIFECYCLE_ACTIONS = new Set(['INITIALIZE_GAME', 'LOAD_GAME', 'RESET_GAME', 'ADVANCE_WEEK_START', 'ADVANCE_WEEK_SUCCESS', 'START_NEW_SEASON']);
const TRANSFER_ACTIONS = new Set(['ADD_OFFER', 'ACCEPT_OFFER', 'REJECT_OFFER', 'SIGN_PLAYER', 'TOGGLE_TRANSFER_LIST']);
const STAFF_ACTIONS = new Set(['HIRE_COACH', 'FIRE_COACH', 'HIRE_SCOUT', 'SCOUT_PLAYER']);
const ECONOMY_ACTIONS = new Set(['ACCEPT_SPONSOR', 'REMOVE_SPONSOR_OFFER', 'EXPAND_STADIUM', 'UPDATE_FINANCES', 'UPDATE_STADIUM']);
const POLITICAL_ACTIONS = new Set(['TRIGGER_ELECTION', 'ELECTION_RESULT', 'UPDATE_FAN_APPROVAL', 'SET_FAN_APPROVAL', 'UPDATE_BOARD_CONFIDENCE']);
const SQUAD_ACTIONS = new Set(['PROMOTE_PLAYER', 'PROMOTE_YOUTH', 'SET_VIEWING_PLAYER']);
const UI_ACTIONS = new Set(['ADD_NEWS', 'POP_CINEMATIC', 'PUSH_CINEMATIC', 'SET_CURRENCY', 'SET_LANGUAGE']);

export function gameReducer(state: GameState | null, action: GameAction): GameState | null {
    // Lifecycle actions can handle null state (INITIALIZE_GAME, LOAD_GAME, RESET_GAME)
    if (LIFECYCLE_ACTIONS.has(action.type)) {
        return handleGameLifecycleAction(state, action as any);
    }

    // All other actions require state to exist
    if (!state) return null;

    // UPDATE_TEAM is a simple inline action
    if (action.type === 'UPDATE_TEAM') {
        return {
            ...state,
            team: action.payload,
            allTeams: state.allTeams.map(t => t.id === action.payload.id ? action.payload : t)
        };
    }

    // Route to sub-reducers
    if (TRANSFER_ACTIONS.has(action.type)) {
        return handleTransferAction(state, action as any);
    }
    if (STAFF_ACTIONS.has(action.type)) {
        return handleStaffAction(state, action as any);
    }
    if (ECONOMY_ACTIONS.has(action.type)) {
        return handleEconomyAction(state, action as any);
    }
    if (POLITICAL_ACTIONS.has(action.type)) {
        return handlePoliticalAction(state, action as any);
    }
    if (SQUAD_ACTIONS.has(action.type)) {
        return handleSquadAction(state, action as any);
    }
    if (UI_ACTIONS.has(action.type)) {
        return handleUIAction(state, action as any);
    }

    return state;
}
