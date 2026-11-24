import { GameState, Player, NewsItem } from '../../types';
import { formatDate } from '../../utils';
import { awardPresidentXp, getPresidentialStyleModifiers } from '../../services/presidentialProgression';
import { canAddYouthProspect, canMoveToReserve, canPromoteToFirstTeam } from '../../services/squadRules';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type SquadAction = Extract<GameAction,
    | { type: 'PROMOTE_PLAYER' }
    | { type: 'PROMOTE_YOUTH' }
    | { type: 'DEMOTE_TO_RESERVE' }
    | { type: 'RELEASE_RESERVE_PLAYER' }
    | { type: 'ADD_YOUTH_PLAYER' }
    | { type: 'SET_VIEWING_PLAYER' }
    | { type: 'SET_CUSTOM_LINEUP' }
    | { type: 'RENEW_PLAYER_CONTRACT' }
    | { type: 'TALK_TO_PLAYER' }
    | { type: 'RESPOND_COACH_REQUEST' }
    | { type: 'AWARD_TEAM_BONUS' }
>;

export function handleSquadAction(state: GameState, action: SquadAction): GameState {
    switch (action.type) {
        case 'SET_CUSTOM_LINEUP': {
            const { formation, starterIds } = action.payload;
            const newTeam = {
                ...state.team,
                customLineup: { formation, starterIds }
            };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);
            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams
            };
        }
        case 'PROMOTE_PLAYER': {
            const player = action.payload;
            const check = canPromoteToFirstTeam(state.team.squad, player, state.team.leagueId, state.gameMode);
            if (!check.allowed) return state;

            // Remove from academy/reserve, add to main squad
            const newAcademy = state.youthAcademy.filter(p => p.id !== player.id);
            const promotedPlayer: Player = {
                ...player,
                contractYears: player.contractYears > 0 ? player.contractYears : 3,
                wage: player.wage && player.wage > 0 ? player.wage : 5000,
                morale: 'Feliz'
            };
            const newSquad = [...state.team.squad, promotedPlayer];
            const newWages = state.finances.weeklyWages + promotedPlayer.wage;

            const newTeam = { ...state.team, squad: newSquad };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);

            const newsItem: NewsItem = {
                id: `promote_${Date.now()}`,
                headline: `Ascenso al Primer Equipo: ${player.name}`,
                body: `El futbolista ${player.name} (${player.age || 18} años) sube desde la Reserva/Cantera al plantel profesional de ${state.team.name}.`,
                date: formatDate(state.currentDate),
                type: 'achievement',
                sourceName: 'Comunicado Oficial',
                playerId: promotedPlayer.id,
                playerName: promotedPlayer.name,
                playerPhoto: promotedPlayer.photo
            };

            const updatedCoachReport = state.coachReport
                ? {
                    ...state.coachReport,
                    promotions: state.coachReport.promotions.filter(p => p.id !== player.id)
                }
                : undefined;

            const styleMods = getPresidentialStyleModifiers(state.playerProfile?.style);
            const xpReward = 15 + styleMods.youthPromotionXpBonus;
            const approvalBoost = styleMods.id === 'Canterano' ? 2 : 0;

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                youthAcademy: newAcademy,
                coachReport: updatedCoachReport,
                viewingPlayer: state.viewingPlayer?.id === player.id ? promotedPlayer : state.viewingPlayer,
                playerProfile: awardPresidentXp(state.playerProfile, xpReward),
                fanApproval: approvalBoost > 0 ? {
                    ...state.fanApproval,
                    rating: Math.min(100, (state.fanApproval?.rating || 60) + approvalBoost)
                } : state.fanApproval,
                finances: { ...state.finances, weeklyWages: newWages },
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'PROMOTE_YOUTH': {
            const playerId = action.payload;
            const playerToPromote = state.youthAcademy.find(p => p.id === playerId);

            if (!playerToPromote) return state;

            const check = canPromoteToFirstTeam(state.team.squad, playerToPromote, state.team.leagueId, state.gameMode);
            if (!check.allowed) return state;

            const promotedPlayer: Player = {
                ...playerToPromote,
                contractYears: 3,
                wage: playerToPromote.wage && playerToPromote.wage > 0 ? playerToPromote.wage : 5000,
                morale: 'Feliz'
            };

            const updatedTeam = {
                ...state.team,
                squad: [...state.team.squad, promotedPlayer]
            };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
            const updatedCoachReport = state.coachReport
                ? {
                    ...state.coachReport,
                    promotions: state.coachReport.promotions.filter(p => p.id !== playerId)
                }
                : undefined;

            const newsItem: NewsItem = {
                id: `promote_youth_${Date.now()}`,
                headline: `Promoción de Cantera: ${promotedPlayer.name}`,
                body: `A pedido del cuerpo técnico, ${promotedPlayer.name} (${promotedPlayer.position}, ${promotedPlayer.rating} OVR) firma contrato profesional y sube al primer equipo.`,
                date: formatDate(state.currentDate),
                type: 'achievement',
                sourceName: 'Comunicado Oficial',
                playerId: promotedPlayer.id,
                playerName: promotedPlayer.name,
                playerPhoto: promotedPlayer.photo
            };

            const styleMods = getPresidentialStyleModifiers(state.playerProfile?.style);
            const xpReward = 15 + styleMods.youthPromotionXpBonus;
            const approvalBoost = styleMods.id === 'Canterano' ? 2 : 0;

            return {
                ...state,
                youthAcademy: state.youthAcademy.filter(p => p.id !== playerId),
                team: updatedTeam,
                allTeams: updatedAllTeams,
                coachReport: updatedCoachReport,
                viewingPlayer: state.viewingPlayer?.id === playerId ? promotedPlayer : state.viewingPlayer,
                playerProfile: awardPresidentXp(state.playerProfile, xpReward),
                fanApproval: approvalBoost > 0 ? {
                    ...state.fanApproval,
                    rating: Math.min(100, (state.fanApproval?.rating || 60) + approvalBoost)
                } : state.fanApproval,
                finances: {
                    ...state.finances,
                    weeklyWages: state.finances.weeklyWages + promotedPlayer.wage
                },
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'DEMOTE_TO_RESERVE': {
            const playerId = action.payload;
            const player = state.team.squad.find(p => p.id === playerId);
            if (!player) return state;

            const check = canMoveToReserve(state.team.squad, state.youthAcademy);
            if (!check.allowed) return state;

            const updatedSquad = state.team.squad.filter(p => p.id !== playerId);
            const updatedLineup = state.team.customLineup
                ? {
                    ...state.team.customLineup,
                    starterIds: state.team.customLineup.starterIds.filter(id => id !== playerId)
                }
                : undefined;

            const updatedTeam = {
                ...state.team,
                squad: updatedSquad,
                customLineup: updatedLineup
            };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);

            return {
                ...state,
                team: updatedTeam,
                allTeams: updatedAllTeams,
                youthAcademy: [player, ...state.youthAcademy],
                viewingPlayer: state.viewingPlayer?.id === playerId ? player : state.viewingPlayer,
                finances: {
                    ...state.finances,
                    weeklyWages: Math.max(0, state.finances.weeklyWages - (player.wage || 0))
                }
            };
        }

        case 'RELEASE_RESERVE_PLAYER': {
            const playerId = action.payload;
            const target = state.youthAcademy.find(p => p.id === playerId);
            if (!target) return state;

            return {
                ...state,
                youthAcademy: state.youthAcademy.filter(p => p.id !== playerId),
                incomingOffers: state.incomingOffers.filter(o => o.playerId !== playerId),
                viewingPlayer: state.viewingPlayer?.id === playerId ? null : state.viewingPlayer,
            };
        }

        case 'ADD_YOUTH_PLAYER': {
            const check = canAddYouthProspect(state.team.squad, state.youthAcademy);
            if (!check.allowed) return state;
            return {
                ...state,
                youthAcademy: [...state.youthAcademy, action.payload]
            };
        }

        case 'SET_VIEWING_PLAYER': {
            return { ...state, viewingPlayer: action.payload };
        }

        case 'RENEW_PLAYER_CONTRACT': {
            const { playerId, contractYearsBonus, wageMultiplier } = action.payload;
            let wageDelta = 0;
            const updatedSquad = state.team.squad.map(p => {
                if (p.id !== playerId) return p;
                const newWage = Math.round(p.wage * wageMultiplier);
                wageDelta = newWage - p.wage;
                return {
                    ...p,
                    contractYears: p.contractYears + contractYearsBonus,
                    wage: newWage,
                    morale: 'Feliz' as const
                };
            });
            const updatedReserve = state.youthAcademy.map(p => {
                if (p.id !== playerId) return p;
                const newWage = Math.round(p.wage * wageMultiplier);
                return {
                    ...p,
                    contractYears: p.contractYears + contractYearsBonus,
                    wage: newWage,
                    morale: 'Feliz' as const
                };
            });
            const updatedTeam = { ...state.team, squad: updatedSquad };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
            const updatedViewing = state.viewingPlayer?.id === playerId
                ? (updatedSquad.find(p => p.id === playerId) || updatedReserve.find(p => p.id === playerId) || null)
                : state.viewingPlayer;

            return {
                ...state,
                team: updatedTeam,
                allTeams: updatedAllTeams,
                youthAcademy: updatedReserve,
                viewingPlayer: updatedViewing,
                finances: {
                    ...state.finances,
                    weeklyWages: state.finances.weeklyWages + wageDelta
                }
            };
        }

        case 'TALK_TO_PLAYER': {
            const { playerId } = action.payload;
            const bumpMorale = (p: Player): Player => {
                const betterMorale = p.morale === 'Enojado' ? 'Descontento' : p.morale === 'Descontento' ? 'Normal' : 'Contento';
                return {
                    ...p,
                    morale: betterMorale as Player['morale']
                };
            };
            const updatedSquad = state.team.squad.map(p => (p.id === playerId ? bumpMorale(p) : p));
            const updatedReserve = state.youthAcademy.map(p => (p.id === playerId ? bumpMorale(p) : p));
            const updatedTeam = { ...state.team, squad: updatedSquad };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
            const updatedViewing = state.viewingPlayer?.id === playerId
                ? (updatedSquad.find(p => p.id === playerId) || updatedReserve.find(p => p.id === playerId) || null)
                : state.viewingPlayer;

            return {
                ...state,
                team: updatedTeam,
                allTeams: updatedAllTeams,
                youthAcademy: updatedReserve,
                viewingPlayer: updatedViewing
            };
        }

        case 'RESPOND_COACH_REQUEST': {
            const { requestId, decision } = action.payload;
            if (!state.team.coach) return state;
            if (state.coachReport?.answeredRequests?.[requestId]) {
                return state;
            }
            const satisfactionDelta = decision === 'PROMISE' ? 6 : -2;
            const newSatisfaction = Math.max(0, Math.min(100, (state.team.coach.satisfactionLevel ?? 75) + satisfactionDelta));
            const updatedCoach = { ...state.team.coach, satisfactionLevel: newSatisfaction };
            const updatedTeam = { ...state.team, coach: updatedCoach };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);

            const updatedReport = state.coachReport
                ? {
                    ...state.coachReport,
                    satisfaction: newSatisfaction,
                    answeredRequests: {
                        ...(state.coachReport.answeredRequests || {}),
                        [requestId]: decision
                    }
                }
                : undefined;

            return {
                ...state,
                team: updatedTeam,
                allTeams: updatedAllTeams,
                coachReport: updatedReport
            };
        }

        case 'AWARD_TEAM_BONUS': {
            const { bonusPerPlayer } = action.payload;
            if (state.coachReport?.bonusAwarded) {
                return state;
            }
            const totalCost = bonusPerPlayer * state.team.squad.length;
            if (state.finances.balance < totalCost) {
                return state;
            }
            const newBalance = Math.max(0, state.finances.balance - totalCost);
            const updatedSquad = state.team.squad.map(p => ({
                ...p,
                morale: (p.morale === 'Descontento' || p.morale === 'Enojado' ? 'Normal' : 'Feliz') as Player['morale']
            }));
            const newCoachSatisfaction = state.team.coach
                ? Math.min(100, (state.team.coach.satisfactionLevel || 75) + 8)
                : undefined;
            const updatedCoach = state.team.coach
                ? { ...state.team.coach, satisfactionLevel: newCoachSatisfaction! }
                : undefined;
            const updatedTeam = { ...state.team, squad: updatedSquad, coach: updatedCoach };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
            const updatedReport = state.coachReport
                ? {
                    ...state.coachReport,
                    satisfaction: newCoachSatisfaction ?? state.coachReport.satisfaction,
                    bonusAwarded: true
                }
                : undefined;

            return {
                ...state,
                team: updatedTeam,
                allTeams: updatedAllTeams,
                coachReport: updatedReport,
                boardConfidence: Math.min(100, state.boardConfidence + 3),
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                }
            };
        }

        default:
            return state;
    }
}
