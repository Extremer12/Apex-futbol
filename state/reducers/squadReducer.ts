import { GameState, Player, NewsItem } from '../../types';
import { formatDate } from '../../utils';
import { awardPresidentXp, getPresidentialStyleModifiers } from '../../services/presidentialProgression';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type SquadAction = Extract<GameAction,
    | { type: 'PROMOTE_PLAYER' }
    | { type: 'PROMOTE_YOUTH' }
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

            // Remove from academy, add to main squad
            const newAcademy = state.youthAcademy.filter(p => p.id !== player.id);
            const promotedPlayer: Player = {
                ...player,
                contractYears: 3,
                wage: player.wage && player.wage > 0 ? player.wage : 5000,
                morale: 'Feliz'
            };
            const newSquad = [...state.team.squad, promotedPlayer];
            const newWages = state.finances.weeklyWages + promotedPlayer.wage;

            const newTeam = { ...state.team, squad: newSquad };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);

            const newsItem: NewsItem = {
                id: `promote_${Date.now()}`,
                headline: `Nueva Promesa: ${player.name} asciende al primer equipo`,
                body: `El canterano ${player.name} (Edad: ${player.age || 16}) ha sido promovido al primer equipo. La afición está ilusionada con su potencial.`,
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

        case 'ADD_YOUTH_PLAYER': {
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
            const updatedTeam = { ...state.team, squad: updatedSquad };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
            const updatedViewing = state.viewingPlayer?.id === playerId
                ? updatedSquad.find(p => p.id === playerId) || null
                : state.viewingPlayer;

            return {
                ...state,
                team: updatedTeam,
                allTeams: updatedAllTeams,
                viewingPlayer: updatedViewing,
                finances: {
                    ...state.finances,
                    weeklyWages: state.finances.weeklyWages + wageDelta
                }
            };
        }

        case 'TALK_TO_PLAYER': {
            const { playerId } = action.payload;
            const updatedSquad = state.team.squad.map(p => {
                if (p.id !== playerId) return p;
                const betterMorale = p.morale === 'Enojado' ? 'Descontento' : p.morale === 'Descontento' ? 'Normal' : 'Contento';
                return {
                    ...p,
                    morale: betterMorale as Player['morale']
                };
            });
            const updatedTeam = { ...state.team, squad: updatedSquad };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
            const updatedViewing = state.viewingPlayer?.id === playerId
                ? updatedSquad.find(p => p.id === playerId) || null
                : state.viewingPlayer;

            return {
                ...state,
                team: updatedTeam,
                allTeams: updatedAllTeams,
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
