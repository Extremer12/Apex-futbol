import { GameState, NewsItem } from '../../types';
import { generateRandomCoach } from '../../services/coaching';
import { formatDate, formatCurrency } from '../../utils';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type StaffAction = Extract<GameAction,
    | { type: 'HIRE_COACH' }
    | { type: 'FIRE_COACH' }
    | { type: 'HIRE_SCOUT' }
    | { type: 'SCOUT_PLAYER' }
>;

export function handleStaffAction(state: GameState, action: StaffAction): GameState {
    switch (action.type) {
        case 'HIRE_COACH': {
            const { coachId } = action.payload;
            const coachToHire = state.availableCoaches.find(c => c.id === coachId);

            if (!coachToHire) return state;

            // Check budget
            if (state.finances.balance < coachToHire.signingBonus) {
                return state;
            }

            const newBalance = state.finances.balance - coachToHire.signingBonus;

            // Update team
            const newTeam = { ...state.team, coach: coachToHire };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);

            // Remove from market
            const newMarket = state.availableCoaches.filter(c => c.id !== coachId);

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                availableCoaches: newMarket,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `hire_coach_${Date.now()}`,
                    headline: '👔 Nuevo Director Técnico',
                    body: `El club ha contratado a ${coachToHire.name}. Su estilo ${coachToHire.style} promete cambiar la dinámica del equipo.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'FIRE_COACH': {
            if (!state.team.coach) return state;

            const severancePay = state.team.coach.salary * 4; // 1 month severance
            const newBalance = state.finances.balance - severancePay;

            const newTeam = { ...state.team, coach: undefined };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `fire_coach_${Date.now()}`,
                    headline: '👋 Entrenador Despedido',
                    body: `El club ha decidido prescindir de los servicios de su Director Técnico. El puesto está vacante.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'HIRE_SCOUT': {
            const scout = action.payload;

            if (state.finances.balance < scout.hiringFee) return state;

            return {
                ...state,
                scouts: [...state.scouts, scout],
                finances: {
                    ...state.finances,
                    balance: state.finances.balance - scout.hiringFee,
                    balanceHistory: [...state.finances.balanceHistory, state.finances.balance - scout.hiringFee]
                },
                newsFeed: [{
                    id: `hire_scout_${Date.now()}`,
                    headline: '🔍 Nuevo Scout Contratado',
                    body: `${scout.name} se une al equipo para expandir nuestra red de ojeo.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'SCOUT_PLAYER': {
            const { playerId } = action.payload;
            const currentLevel = state.scoutedPlayerIds[playerId] || 0;

            // Cost of manual scouting: 0.1M (100k)
            const scoutingCost = 0.1;
            if (state.finances.balance < scoutingCost) return state;

            return {
                ...state,
                finances: {
                    ...state.finances,
                    balance: state.finances.balance - scoutingCost,
                    balanceHistory: [...state.finances.balanceHistory, state.finances.balance - scoutingCost]
                },
                scoutedPlayerIds: {
                    ...state.scoutedPlayerIds,
                    [playerId]: Math.min(100, currentLevel + 25) // Increase 25% each time
                }
            };
        }

        default:
            return state;
    }
}
