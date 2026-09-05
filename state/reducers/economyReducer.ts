import { GameState, Sponsor, NewsItem } from '../../types';
import { formatDate, formatCurrency } from '../../utils';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type EconomyAction = Extract<GameAction,
    | { type: 'ACCEPT_SPONSOR' }
    | { type: 'REMOVE_SPONSOR_OFFER' }
    | { type: 'EXPAND_STADIUM' }
    | { type: 'UPDATE_FINANCES' }
    | { type: 'UPDATE_STADIUM' }
>;

export function handleEconomyAction(state: GameState, action: EconomyAction): GameState {
    switch (action.type) {
        case 'ACCEPT_SPONSOR': {
            const { sponsorId, negotiatedIncome } = action.payload;
            const sponsorOffer = state.availableSponsors.find(s => s.id === sponsorId);

            if (!sponsorOffer) return state;

            const sponsor = { ...sponsorOffer, weeklyIncome: negotiatedIncome || sponsorOffer.weeklyIncome };
            const signingBonus = Math.floor(sponsor.weeklyIncome * 4);
            const newBalance = state.finances.balance + signingBonus;

            const sponsorTypeLabel = sponsor.type === 'shirt' ? 'de camiseta' : sponsor.type === 'stadium' ? 'del estadio' : sponsor.type === 'training' ? 'de entrenamiento' : 'de equipación';

            const newsItem: NewsItem = {
                id: `sponsor_${Date.now()}`,
                headline: '🤝 Nuevo Acuerdo de Patrocinio',
                body: `${sponsor.name} es ahora nuestro ${state.sponsors.find(s => s.type === sponsor.type) ? 'nuevo ' : ''}patrocinador ${sponsorTypeLabel}. Ingresos: ${formatCurrency(sponsor.weeklyIncome)}/semana.`,
                date: formatDate(state.currentDate)
            };

            // Check if already have sponsor of this type
            const existingSponsor = state.sponsors.find(s => s.type === sponsor.type);
            if (existingSponsor) {
                // Replace existing sponsor
                const newSponsors = state.sponsors.map(s =>
                    s.type === sponsor.type ? sponsor : s
                );
                const newMarket = state.availableSponsors.filter(s => s.id !== sponsorId && s.type !== sponsor.type);

                return {
                    ...state,
                    sponsors: newSponsors,
                    availableSponsors: newMarket,
                    finances: {
                        ...state.finances,
                        balance: newBalance,
                        balanceHistory: [...state.finances.balanceHistory, newBalance]
                    },
                    newsFeed: [newsItem, ...state.newsFeed].slice(0, 20)
                };
            }

            // Add new sponsor
            return {
                ...state,
                sponsors: [...state.sponsors, sponsor],
                availableSponsors: state.availableSponsors.filter(s => s.id !== sponsorId),
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'REMOVE_SPONSOR_OFFER': {
            const { sponsorId } = action.payload;
            return {
                ...state,
                availableSponsors: state.availableSponsors.filter(s => s.id !== sponsorId)
            };
        }

        case 'EXPAND_STADIUM': {
            if (!state.stadium.expansionCost || !state.stadium.expansionCapacity) return state;
            if (state.finances.balance < state.stadium.expansionCost) return state;

            return {
                ...state,
                finances: {
                    ...state.finances,
                    balance: state.finances.balance - state.stadium.expansionCost,
                    balanceHistory: [...state.finances.balanceHistory, state.finances.balance - state.stadium.expansionCost]
                },
                stadium: {
                    ...state.stadium,
                    capacity: state.stadium.expansionCapacity,
                    expansionCost: undefined,
                    expansionCapacity: undefined
                },
                newsFeed: [{
                    id: `stadium_expansion_${Date.now()}`,
                    headline: '🏟️ Estadio Ampliado',
                    body: `Las obras de ampliación del ${state.stadium.name} han finalizado. La nueva capacidad es de ${state.stadium.expansionCapacity} espectadores.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'UPDATE_FINANCES':
            return { ...state, finances: { ...state.finances, ...action.payload } };

        case 'UPDATE_STADIUM':
            return { ...state, stadium: action.payload };

        default:
            return state;
    }
}
