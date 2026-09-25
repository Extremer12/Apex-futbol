import { GameState, Player, Offer, NewsItem } from '../../types';
import { formatDate, formatCurrency } from '../../utils';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type TransferAction = Extract<GameAction,
    | { type: 'ADD_OFFER' }
    | { type: 'ACCEPT_OFFER' }
    | { type: 'REJECT_OFFER' }
    | { type: 'COUNTER_OFFER' }
    | { type: 'UPDATE_OFFER' }
    | { type: 'SIGN_PLAYER' }
    | { type: 'TOGGLE_TRANSFER_LIST' }
>;

export function handleTransferAction(state: GameState, action: TransferAction): GameState {
    switch (action.type) {
        case 'ADD_OFFER': {
            return {
                ...state,
                incomingOffers: [...state.incomingOffers, { ...action.payload, status: action.payload.status || 'pending' }]
            };
        }

        case 'UPDATE_OFFER': {
            return {
                ...state,
                incomingOffers: state.incomingOffers.map(o => o.id === action.payload.id ? action.payload : o)
            };
        }

        case 'COUNTER_OFFER': {
            const { offerId, counterAmount } = action.payload;
            return {
                ...state,
                incomingOffers: state.incomingOffers.map(o => 
                    o.id === offerId 
                        ? { ...o, counterOfferValue: counterAmount, status: 'negotiating' } 
                        : o
                )
            };
        }

        case 'ACCEPT_OFFER': {
            const offer = state.incomingOffers.find(o => o.id === action.payload.offerId);
            if (!offer) return state;

            const player = state.team.squad.find(p => p.id === offer.playerId);
            if (!player) return state;

            const offeringTeam = state.allTeams.find(t => t.id === offer.offeringTeamId);
            const finalFee = offer.counterOfferValue || offer.offerValue;

            // Update finances
            const currentTransferBudget = state.finances.transferBudget < 10_000 ? state.finances.transferBudget * 1_000_000 : state.finances.transferBudget;
            const currentBalance = state.finances.balance < 10_000 ? state.finances.balance * 1_000_000 : state.finances.balance;
            const newBalance = currentBalance + finalFee;
            const newTransferBudget = currentTransferBudget + finalFee;
            const newWages = Math.max(0, state.finances.weeklyWages - player.wage);

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
                headline: `¡OFICIAL! ${player.name} traspasado al ${offeringTeam?.name || 'otro club'}`,
                body: `${player.name} ha completado su traspaso al ${offeringTeam?.name || 'otro club'} por una cifra acordada de ${formatCurrency(finalFee)}. El presidente expresó que era "una operación redonda para la entidad".`,
                date: formatDate(state.currentDate),
                type: 'transfer',
                playerId: player.id,
                playerName: player.name,
                playerPhoto: player.photo
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
            const { player, fee, wage, contractYears, role, signingBonus } = action.payload;

            const negotiatedWage = wage || player.wage || 10000;
            const negotiatedYears = contractYears || 3;
            const totalCashDeducted = fee + (signingBonus || 0);

            const playerToAdd: Player = { 
                ...player, 
                morale: 'Contento', 
                contractYears: negotiatedYears, 
                wage: negotiatedWage,
                preferredRole: role || player.preferredRole || 'FirstTeam',
                isTransferListed: false 
            };
            const currentTransferBudget = state.finances.transferBudget < 10_000 ? state.finances.transferBudget * 1_000_000 : state.finances.transferBudget;
            const currentBalance = state.finances.balance < 10_000 ? state.finances.balance * 1_000_000 : state.finances.balance;
            const newWages = state.finances.weeklyWages + negotiatedWage;
            const newTransferBudget = Math.max(0, currentTransferBudget - totalCashDeducted);
            const newBalance = currentBalance - totalCashDeducted;

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

            // Add signing news
            const newsItem: NewsItem = {
                id: `news_${new Date().toISOString()}`,
                headline: `¡FICHAJE BOMBA! ${player.name} ya es del ${state.team.name}`,
                body: `${player.name} ha firmado su contrato por ${negotiatedYears} temporadas con el ${state.team.name}. Traspaso valorado en ${formatCurrency(fee)} con un salario semanal de ${formatCurrency(negotiatedWage)}.`,
                date: formatDate(state.currentDate),
                type: 'transfer',
                playerId: player.id,
                playerName: player.name,
                playerPhoto: player.photo
            };

            return {
                ...state,
                team: updatedPlayerTeam,
                allTeams: updatedAllTeams,
                finances: { 
                    ...state.finances, 
                    balance: newBalance, 
                    transferBudget: newTransferBudget, 
                    weeklyWages: newWages 
                },
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 20)
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

        case 'OFFER_PLAYER_TO_CLUBS': {
            const { playerId } = action.payload;
            const player = state.team.squad.find(p => p.id === playerId);
            if (!player) return state;

            // Marcar jugador como transferible
            const newSquad = state.team.squad.map(p =>
                p.id === playerId ? { ...p, isTransferListed: true } : p
            );
            const newTeam = { ...state.team, squad: newSquad };

            // Buscar 1 o 2 clubes compradores potenciales
            const pVal = player.value < 10_000 ? player.value * 1_000_000 : player.value;
            const otherTeams = state.allTeams.filter(t => t.id !== state.team.id);
            
            // Preferir clubes con presupuesto o de nivel deportivo acorde
            let candidates = otherTeams.filter(t => {
                const b = t.transferBudget < 10_000 ? t.transferBudget * 1_000_000 : t.transferBudget;
                return b >= pVal * 0.65;
            });
            if (candidates.length === 0) {
                candidates = otherTeams.filter(t => t.tier === 'Top' || t.tier === 'Mid');
            }
            if (candidates.length === 0) candidates = otherTeams;

            // Tomar 1 o 2 compradores al azar
            const shuffled = [...candidates].sort(() => 0.5 - Math.random());
            const buyers = shuffled.slice(0, Math.min(2, shuffled.length));

            const newOffers: Offer[] = buyers.map((buyer, idx) => {
                const variance = 0.85 + Math.random() * 0.35;
                const offerVal = Math.round(pVal * variance);
                return {
                    id: `offer_direct_${Date.now()}_${idx}_${player.id}`,
                    playerId: player.id,
                    offeringTeamId: buyer.id,
                    offerValue: Math.max(50_000, offerVal),
                    message: `El ${buyer.name} busca incorporar a ${player.name} de inmediato tras conocer su disponibilidad en el mercado.`
                };
            });

            const newAllTeams = state.allTeams.map(t =>
                t.id === newTeam.id ? newTeam : t
            );

            const newsItem: NewsItem = {
                id: `news_offer_${Date.now()}`,
                headline: `💼 ${player.name} ofrecido en el mercado`,
                body: `La directiva de ${state.team.name} ha ofrecido formalmente a ${player.name}. ${buyers.map(b => b.name).join(' y ')} han enviado ofertas preliminares a la bandeja del club.`,
                date: formatDate(state.currentDate),
                type: 'transfer',
                playerId: player.id,
                playerName: player.name
            };

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                incomingOffers: [...newOffers, ...state.incomingOffers],
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 20),
                viewingPlayer: state.viewingPlayer && state.viewingPlayer.id === playerId
                    ? { ...state.viewingPlayer, isTransferListed: true }
                    : state.viewingPlayer
            };
        }

        default:
            return state;
    }
}
