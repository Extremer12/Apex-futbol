import { GameState, Player, Offer, NewsItem } from '../../types';
import { formatDate, formatCurrency, isTransferWindowOpen, normalizeMonetaryValue } from '../../utils';
import {
    MAX_OFFERS_PER_PLAYER,
    OFFER_EXPIRY_WEEKS,
    canRegisterInFirstTeam,
    sanitizeIncomingOffers
} from '../../services/squadRules';
import { resolvePlayerNationality } from '../../services/nationalityService';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type TransferAction = Extract<GameAction,
    | { type: 'ADD_OFFER' }
    | { type: 'ACCEPT_OFFER' }
    | { type: 'REJECT_OFFER' }
    | { type: 'REJECT_PLAYER_OFFERS' }
    | { type: 'CLEAR_LOW_OFFERS' }
    | { type: 'COUNTER_OFFER' }
    | { type: 'UPDATE_OFFER' }
    | { type: 'SIGN_PLAYER' }
    | { type: 'TOGGLE_TRANSFER_LIST' }
    | { type: 'TOGGLE_UNTOUCHABLE' }
    | { type: 'OFFER_PLAYER_TO_CLUBS' }
>;

export function handleTransferAction(state: GameState, action: TransferAction): GameState {
    switch (action.type) {
        case 'ADD_OFFER': {
            const combined = [
                ...state.incomingOffers,
                {
                    ...action.payload,
                    status: action.payload.status || 'pending',
                    createdWeek: action.payload.createdWeek ?? state.currentWeek,
                    expiresWeek: action.payload.expiresWeek ?? (state.currentWeek + OFFER_EXPIRY_WEEKS)
                }
            ];
            return {
                ...state,
                incomingOffers: sanitizeIncomingOffers(
                    combined,
                    [...state.team.squad, ...(state.youthAcademy || [])],
                    state.currentWeek,
                    true
                )
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

            const inFirstTeam = state.team.squad.find(p => p.id === offer.playerId);
            const inReserve = (state.youthAcademy || []).find(p => p.id === offer.playerId);
            const player = inFirstTeam || inReserve;
            if (!player) return state;

            const offeringTeam = state.allTeams.find(t => t.id === offer.offeringTeamId);
            const finalFee = normalizeMonetaryValue(offer.counterOfferValue || offer.offerValue);

            // Update finances
            const currentTransferBudget = normalizeMonetaryValue(state.finances.transferBudget);
            const currentBalance = normalizeMonetaryValue(state.finances.balance);
            const newBalance = currentBalance + finalFee;
            const newTransferBudget = currentTransferBudget + finalFee;
            const newWages = inFirstTeam
                ? Math.max(0, state.finances.weeklyWages - player.wage)
                : state.finances.weeklyWages;

            // Update squad / reserve & remove from customLineup if starter
            const newSquad = inFirstTeam
                ? state.team.squad.filter(p => p.id !== player.id)
                : state.team.squad;
            const newReserve = inReserve
                ? state.youthAcademy.filter(p => p.id !== player.id)
                : state.youthAcademy;
            const updatedLineup = state.team.customLineup
                ? {
                    ...state.team.customLineup,
                    starterIds: state.team.customLineup.starterIds.filter(id => id !== player.id)
                }
                : undefined;

            const newTeam = { ...state.team, squad: newSquad, customLineup: updatedLineup };

            // Add player to offering team
            const updatedOfferingTeam = offeringTeam ? { ...offeringTeam, squad: [...offeringTeam.squad, player] } : null;

            const newAllTeams = state.allTeams.map(t => {
                if (t.id === newTeam.id) return newTeam;
                if (updatedOfferingTeam && t.id === updatedOfferingTeam.id) return updatedOfferingTeam;
                return t;
            });

            // Create news item
            const newsItem: NewsItem = {
                id: `news_${Date.now()}_${player.id}`,
                headline: `¡OFICIAL! ${player.name} traspasado al ${offeringTeam?.name || 'otro club'}`,
                body: `${player.name} ha completado su traspaso al ${offeringTeam?.name || 'otro club'} por una cifra acordada de ${formatCurrency(finalFee)}. El presidente expresó que era "una operación redonda para la entidad".`,
                date: formatDate(state.currentDate),
                type: 'transfer',
                sourceName: 'Comunicado Oficial',
                playerId: player.id,
                playerName: player.name,
                playerPhoto: player.photo
            };

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                youthAcademy: newReserve,
                viewingPlayer: state.viewingPlayer?.id === player.id ? null : state.viewingPlayer,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    transferBudget: newTransferBudget,
                    weeklyWages: newWages
                },
                // Remove ALL offers for the sold player so stale bids vanish automatically
                incomingOffers: state.incomingOffers.filter(o => o.playerId !== player.id),
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 20),
            };
        }

        case 'REJECT_OFFER': {
            return {
                ...state,
                incomingOffers: state.incomingOffers.filter(o => o.id !== action.payload.offerId)
            };
        }

        case 'REJECT_PLAYER_OFFERS': {
            return {
                ...state,
                incomingOffers: state.incomingOffers.filter(o => o.playerId !== action.payload.playerId)
            };
        }

        case 'CLEAR_LOW_OFFERS': {
            const playerMap = new Map<number, Player>(
                [...state.team.squad, ...(state.youthAcademy || [])].map(p => [p.id, p])
            );
            return {
                ...state,
                incomingOffers: state.incomingOffers.filter(o => {
                    const p = playerMap.get(o.playerId);
                    if (!p) return false;
                    const amount = normalizeMonetaryValue(o.counterOfferValue || o.offerValue);
                    const val = Math.max(1, normalizeMonetaryValue(p.value));
                    return amount >= val;
                })
            };
        }

        case 'SIGN_PLAYER': {
            const { player, fee, wage, contractYears, role, signingBonus, forceReserve } = action.payload;

            const regCheck = canRegisterInFirstTeam(
                state.team.squad,
                state.youthAcademy || [],
                player,
                state.team.leagueId,
                state.gameMode
            );
            if (!regCheck.allowed) {
                return state;
            }
            const sendToReserve = Boolean(forceReserve) || regCheck.target === 'RESERVE';

            const negotiatedWage = wage || player.wage || 10000;
            const negotiatedYears = contractYears || 3;
            const normalizedSigningBonus = normalizeMonetaryValue(signingBonus, 0);
            const totalCashDeducted = fee + normalizedSigningBonus;

            const sellingClub = state.allTeams.find(t => t.squad.some(p => p.id === player.id));
            const resolvedNat = resolvePlayerNationality(player, sellingClub?.leagueId || state.team.leagueId);

            const playerToAdd: Player = {
                ...player,
                nationality: resolvedNat,
                morale: 'Contento',
                contractYears: negotiatedYears,
                wage: negotiatedWage,
                preferredRole: role || player.preferredRole || 'FirstTeam',
                isTransferListed: false,
                isUntouchable: false
            };
            const currentTransferBudget = normalizeMonetaryValue(state.finances.transferBudget);
            const currentBalance = normalizeMonetaryValue(state.finances.balance);
            const newWages = sendToReserve
                ? state.finances.weeklyWages
                : state.finances.weeklyWages + negotiatedWage;
            const newTransferBudget = Math.max(0, currentTransferBudget - totalCashDeducted);
            const newBalance = currentBalance - totalCashDeducted;

            const updatedAllTeams = state.allTeams.map(t => {
                if (t.squad.some(p => p.id === player.id)) {
                    return { ...t, squad: t.squad.filter(p => p.id !== player.id) };
                }
                if (t.id === state.team.id && !sendToReserve) {
                    return { ...t, squad: [...t.squad, playerToAdd] };
                }
                return t;
            });
            const updatedPlayerTeam = updatedAllTeams.find(t => t.id === state.team.id)!;
            const updatedReserve = sendToReserve
                ? [playerToAdd, ...(state.youthAcademy || [])]
                : state.youthAcademy;

            // Add signing news
            const newsItem: NewsItem = {
                id: `news_${Date.now()}_${player.id}`,
                headline: `¡FICHAJE OFICIAL! ${player.name} llega al ${state.team.name}`,
                body: `${player.name} ha firmado su contrato por ${negotiatedYears} temporadas con el ${state.team.name}${sendToReserve ? ' (asignado inicialmente a la Reserva)' : ''}. Traspaso valorado en ${formatCurrency(fee)} con un salario semanal de ${formatCurrency(negotiatedWage)}.`,
                date: formatDate(state.currentDate),
                type: 'transfer',
                sourceName: 'Comunicado Oficial',
                playerId: player.id,
                playerName: player.name,
                playerPhoto: player.photo
            };

            return {
                ...state,
                team: updatedPlayerTeam,
                allTeams: updatedAllTeams,
                youthAcademy: updatedReserve,
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
            const toggle = (p: Player): Player =>
                p.id === playerToToggle.id
                    ? {
                        ...p,
                        isTransferListed: !p.isTransferListed,
                        isUntouchable: !p.isTransferListed ? false : p.isUntouchable
                    }
                    : p;

            const newSquad = state.team.squad.map(toggle);
            const newReserve = (state.youthAcademy || []).map(toggle);
            const newTeam = { ...state.team, squad: newSquad };
            const newAllTeams = state.allTeams.map(t =>
                t.id === newTeam.id ? newTeam : t
            );

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                youthAcademy: newReserve,
                viewingPlayer: state.viewingPlayer && state.viewingPlayer.id === playerToToggle.id
                    ? toggle(state.viewingPlayer)
                    : state.viewingPlayer,
            };
        }

        case 'TOGGLE_UNTOUCHABLE': {
            const target = action.payload;
            const nextUntouchable = !target.isUntouchable;
            const updateFlag = (p: Player): Player =>
                p.id === target.id
                    ? {
                        ...p,
                        isUntouchable: nextUntouchable,
                        isTransferListed: nextUntouchable ? false : p.isTransferListed
                    }
                    : p;

            const newSquad = state.team.squad.map(updateFlag);
            const newReserve = (state.youthAcademy || []).map(updateFlag);
            const newTeam = { ...state.team, squad: newSquad };
            const newAllTeams = state.allTeams.map(t => (t.id === newTeam.id ? newTeam : t));

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                youthAcademy: newReserve,
                incomingOffers: nextUntouchable
                    ? state.incomingOffers.filter(o => o.playerId !== target.id)
                    : state.incomingOffers,
                viewingPlayer: state.viewingPlayer && state.viewingPlayer.id === target.id
                    ? updateFlag(state.viewingPlayer)
                    : state.viewingPlayer,
            };
        }

        case 'OFFER_PLAYER_TO_CLUBS': {
            const { playerId } = action.payload;
            const player = state.team.squad.find(p => p.id === playerId) || (state.youthAcademy || []).find(p => p.id === playerId);
            if (!player) return state;

            // Marcar jugador como transferible y quitar intransferible
            const markListed = (p: Player): Player =>
                p.id === playerId ? { ...p, isTransferListed: true, isUntouchable: false } : p;

            const newSquad = state.team.squad.map(markListed);
            const newReserve = (state.youthAcademy || []).map(markListed);
            const newTeam = { ...state.team, squad: newSquad };

            // Respetar el tope máximo de 3 ofertas por jugador y evitar clubes duplicados
            const existingForPlayer = state.incomingOffers.filter(o => o.playerId === playerId);
            const remainingSlots = Math.max(0, MAX_OFFERS_PER_PLAYER - existingForPlayer.length);
            const usedBuyerIds = new Set(existingForPlayer.map(o => o.offeringTeamId));

            const pVal = normalizeMonetaryValue(player.value);
            const otherTeams = state.allTeams.filter(t => t.id !== state.team.id && !usedBuyerIds.has(t.id));

            let candidates = otherTeams.filter(t => {
                const b = normalizeMonetaryValue(t.transferBudget);
                return b >= pVal * 0.65;
            });
            if (candidates.length === 0) {
                candidates = otherTeams.filter(t => t.tier === 'Top' || t.tier === 'Mid');
            }
            if (candidates.length === 0) candidates = otherTeams;

            const shuffled = [...candidates].sort(() => 0.5 - Math.random());
            const buyers = shuffled.slice(0, Math.min(2, remainingSlots, shuffled.length));

            const newOffers: Offer[] = buyers.map((buyer, idx) => {
                const variance = 0.85 + Math.random() * 0.35;
                const offerVal = Math.round(pVal * variance);
                return {
                    id: `offer_direct_${Date.now()}_${idx}_${player.id}`,
                    playerId: player.id,
                    offeringTeamId: buyer.id,
                    offerValue: Math.max(50_000, offerVal),
                    createdWeek: state.currentWeek,
                    expiresWeek: state.currentWeek + OFFER_EXPIRY_WEEKS,
                    message: `El ${buyer.name} busca incorporar a ${player.name} tras recibir el ofrecimiento oficial del club.`
                };
            });

            const newAllTeams = state.allTeams.map(t =>
                t.id === newTeam.id ? newTeam : t
            );

            const newsItem: NewsItem = {
                id: `news_offer_${Date.now()}`,
                headline: `${player.name} ofrecido en el mercado`,
                body: buyers.length > 0
                    ? `La directiva de ${state.team.name} ha ofrecido formalmente a ${player.name}. ${buyers.map(b => b.name).join(' y ')} enviaron propuestas formales.`
                    : `${state.team.name} ratificó a ${player.name} como transferible en el mercado de pases.`,
                date: formatDate(state.currentDate),
                type: 'transfer',
                sourceName: 'Comunicado Oficial',
                playerId: player.id,
                playerName: player.name,
                playerPhoto: player.photo
            };

            const combinedOffers = sanitizeIncomingOffers(
                [...newOffers, ...state.incomingOffers],
                [...newSquad, ...newReserve],
                state.currentWeek,
                isTransferWindowOpen(state.currentWeek) || newOffers.length > 0
            );

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                youthAcademy: newReserve,
                incomingOffers: combinedOffers,
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 20),
                viewingPlayer: state.viewingPlayer && state.viewingPlayer.id === playerId
                    ? markListed(state.viewingPlayer)
                    : state.viewingPlayer
            };
        }

        default:
            return state;
    }
}
