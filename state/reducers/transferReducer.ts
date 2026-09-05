import { GameState, Player, Offer, NewsItem } from '../../types';
import { formatDate, formatCurrency } from '../../utils';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type TransferAction = Extract<GameAction,
    | { type: 'ADD_OFFER' }
    | { type: 'ACCEPT_OFFER' }
    | { type: 'REJECT_OFFER' }
    | { type: 'SIGN_PLAYER' }
    | { type: 'TOGGLE_TRANSFER_LIST' }
>;

export function handleTransferAction(state: GameState, action: TransferAction): GameState {
    switch (action.type) {
        case 'ADD_OFFER': {
            return {
                ...state,
                incomingOffers: [...state.incomingOffers, action.payload]
            };
        }

        case 'ACCEPT_OFFER': {
            const offer = state.incomingOffers.find(o => o.id === action.payload.offerId);
            if (!offer) return state;

            const player = state.team.squad.find(p => p.id === offer.playerId);
            if (!player) return state;

            const offeringTeam = state.allTeams.find(t => t.id === offer.offeringTeamId);

            // Update finances
            const newBalance = state.finances.balance + offer.offerValue;
            const newTransferBudget = state.finances.transferBudget + offer.offerValue;
            const newWages = state.finances.weeklyWages - player.wage;

            // Update squad
            const newSquad = state.team.squad.filter(p => p.id !== player.id);
            const newTeam = { ...state.team, squad: newSquad };

            // Add player to offering team
            const updatedOfferingTeam = offeringTeam ? { ...offeringTeam, squad: [...offeringTeam.squad, player] } : null;

            const newAllTeams = state.allTeams.map(t => {
                if (t.id === newTeam.id) return newTeam;
                if (updatedOfferingTeam && t.id === updatedOfferingTeam.id) return updatedOfferingTeam;
                return t;
            });

            // Create news item
            const newsItem: NewsItem = {
                id: `news_${new Date().toISOString()}`,
                headline: `¡VENDIDO! ${player.name} ficha por el ${offeringTeam?.name || 'otro club'}`,
                body: `${player.name} ha completado su traspaso al ${offeringTeam?.name || 'otro club'} por una cifra de ${formatCurrency(offer.offerValue)}. El presidente expresó que era "una buena operación para el club".`,
                date: formatDate(state.currentDate)
            };

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    transferBudget: newTransferBudget,
                    weeklyWages: newWages
                },
                incomingOffers: state.incomingOffers.filter(o => o.id !== offer.id),
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 20),
            };
        }

        case 'REJECT_OFFER': {
            return {
                ...state,
                incomingOffers: state.incomingOffers.filter(o => o.id !== action.payload.offerId)
            };
        }

        case 'SIGN_PLAYER': {
            const { player, fee } = action.payload;

            const playerToAdd: Player = { ...player, morale: 'Contento', contractYears: 3, isTransferListed: false };
            const newWages = state.finances.weeklyWages + player.wage;
            const newTransferBudget = state.finances.transferBudget - fee;
            const newBalance = state.finances.balance - fee;

            const updatedAllTeams = state.allTeams.map(t => {
                if (t.squad.some(p => p.id === player.id)) {
                    return { ...t, squad: t.squad.filter(p => p.id !== player.id) };
                }
                if (t.id === state.team.id) {
                    return { ...t, squad: [...t.squad, playerToAdd] };
                }
                return t;
            });
            const updatedPlayerTeam = updatedAllTeams.find(t => t.id === state.team.id)!;

            return {
                ...state,
                team: updatedPlayerTeam,
                allTeams: updatedAllTeams,
                finances: { ...state.finances, balance: newBalance, transferBudget: newTransferBudget, weeklyWages: newWages }
            };
        }

        case 'TOGGLE_TRANSFER_LIST': {
            const playerToToggle = action.payload;

            const newSquad = state.team.squad.map(p =>
                p.id === playerToToggle.id
                    ? { ...p, isTransferListed: !p.isTransferListed }
                    : p
            );
            const newTeam = { ...state.team, squad: newSquad };
            const newAllTeams = state.allTeams.map(t =>
                t.id === newTeam.id ? newTeam : t
            );

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                viewingPlayer: state.viewingPlayer && state.viewingPlayer.id === playerToToggle.id
                    ? { ...state.viewingPlayer, isTransferListed: !state.viewingPlayer.isTransferListed }
                    : state.viewingPlayer,
            };
        }

        default:
            return state;
    }
}
