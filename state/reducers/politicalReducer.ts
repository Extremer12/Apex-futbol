import { GameState, FanApproval } from '../../types';
import { formatDate } from '../../utils';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type PoliticalAction = Extract<GameAction,
    | { type: 'TRIGGER_ELECTION' }
    | { type: 'ELECTION_RESULT' }
    | { type: 'UPDATE_FAN_APPROVAL' }
    | { type: 'SET_FAN_APPROVAL' }
    | { type: 'UPDATE_BOARD_CONFIDENCE' }
>;

export function handlePoliticalAction(state: GameState, action: PoliticalAction): GameState {
    switch (action.type) {
        case 'TRIGGER_ELECTION': {
            // This action just flags that elections should be shown
            // The actual election logic happens in the UI
            return state;
        }

        case 'ELECTION_RESULT': {
            const { won, newApproval } = action.payload;

            if (won) {
                // President won re-election
                return {
                    ...state,
                    mandate: {
                        ...state.mandate,
                        currentYear: 1,
                        startYear: state.season,
                        totalMandates: state.mandate.totalMandates + 1,
                        isElectionYear: false,
                        nextElectionSeason: state.season + 4
                    },
                    fanApproval: {
                        ...state.fanApproval,
                        rating: newApproval
                    },
                    newsFeed: [{
                        id: `election_won_${state.season}`,
                        headline: '🎉 ¡Reelección Exitosa!',
                        body: `Los socios han hablado y confían en tu gestión. Comenzarás tu mandato número ${state.mandate.totalMandates + 1} con ${newApproval}% de aprobación.`,
                        date: formatDate(state.currentDate)
                    }, ...state.newsFeed].slice(0, 20)
                };
            } else {
                // President lost election - this should trigger game over in UI
                return {
                    ...state,
                    mandate: {
                        ...state.mandate,
                        isElectionYear: false
                    },
                    fanApproval: {
                        ...state.fanApproval,
                        rating: newApproval
                    }
                };
            }
        }

        case 'UPDATE_FAN_APPROVAL': {
            const { delta, reason } = action.payload;

            const newRating = Math.max(0, Math.min(100, state.fanApproval.rating + delta));
            const trend: 'rising' | 'stable' | 'falling' =
                delta > 5 ? 'rising' : delta < -5 ? 'falling' : 'stable';

            return {
                ...state,
                fanApproval: {
                    ...state.fanApproval,
                    rating: newRating,
                    trend
                },
                newsFeed: delta !== 0 ? [{
                    id: `approval_${Date.now()}`,
                    headline: delta > 0 ? '📈 Aprobación en Alza' : '📉 Aprobación Baja',
                    body: `${reason}. Tu aprobación ${delta > 0 ? 'sube' : 'baja'} a ${newRating}%.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 20) : state.newsFeed
            };
        }

        case 'SET_FAN_APPROVAL':
            return { ...state, fanApproval: action.payload };

        case 'UPDATE_BOARD_CONFIDENCE':
            return { ...state, boardConfidence: action.payload };

        default:
            return state;
    }
}
