import { GameState } from '../../types';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type UIAction = Extract<GameAction,
    | { type: 'ADD_NEWS' }
    | { type: 'POP_CINEMATIC' }
    | { type: 'PUSH_CINEMATIC' }
    | { type: 'SET_CURRENCY' }
    | { type: 'SET_LANGUAGE' }
>;

export function handleUIAction(state: GameState, action: UIAction): GameState {
    switch (action.type) {
        case 'ADD_NEWS': {
            return {
                ...state,
                newsFeed: [action.payload, ...state.newsFeed].slice(0, 30),
            };
        }

        case 'POP_CINEMATIC': {
            return {
                ...state,
                cinematicQueue: state.cinematicQueue.slice(1)
            };
        }

        case 'PUSH_CINEMATIC': {
            return {
                ...state,
                cinematicQueue: [...state.cinematicQueue, action.payload]
            };
        }

        case 'SET_CURRENCY': {
            return { ...state, preferredCurrency: action.payload };
        }

        case 'SET_LANGUAGE': {
            return { ...state, preferredLanguage: action.payload };
        }

        default:
            return state;
    }
}
