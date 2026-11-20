import { GameState, Player, NewsItem } from '../../types';
import { formatDate } from '../../utils';
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
                wage: 5000, // Entry level wage
                morale: 'Feliz'
            };
            const newSquad = [...state.team.squad, promotedPlayer];
            const newWages = state.finances.weeklyWages + promotedPlayer.wage;

            const newTeam = { ...state.team, squad: newSquad };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);

            const newsItem: NewsItem = {
                id: `promote_${Date.now()}`,
                headline: `Nueva Estrella: ${player.name}`,
                body: `El canterano ${player.name} (Edad: ${player.age || 16}) ha sido promovido al primer equipo. La afición está ilusionada con su potencial.`,
                date: formatDate(state.currentDate)
            };

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                youthAcademy: newAcademy,
                finances: { ...state.finances, weeklyWages: newWages },
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'PROMOTE_YOUTH': {
            const playerId = action.payload;
            const playerToPromote = state.youthAcademy.find(p => p.id === playerId);

            if (!playerToPromote) return state;

            const updatedTeam = {
                ...state.team,
                squad: [...state.team.squad, playerToPromote]
            };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);

            return {
                ...state,
                youthAcademy: state.youthAcademy.filter(p => p.id !== playerId),
                team: updatedTeam,
                allTeams: updatedAllTeams
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
                    morale: betterMorale as const
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
            const { decision } = action.payload;
            if (!state.team.coach) return state;
            const satisfactionDelta = decision === 'PROMISE' ? 6 : -2;
            const newSatisfaction = Math.max(0, Math.min(100, (state.team.coach.satisfactionLevel ?? 75) + satisfactionDelta));
            const updatedCoach = { ...state.team.coach, satisfactionLevel: newSatisfaction };
            const updatedTeam = { ...state.team, coach: updatedCoach };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);

            return {
                ...state,
                team: updatedTeam,
                allTeams: updatedAllTeams
            };
        }

        case 'AWARD_TEAM_BONUS': {
            const { bonusPerPlayer } = action.payload;
            const totalCost = bonusPerPlayer * state.team.squad.length;
            if (state.finances.balance < totalCost) {
                return state;
            }
            const updatedSquad = state.team.squad.map(p => ({
                ...p,
                morale: (p.morale === 'Descontento' || p.morale === 'Enojado' ? 'Normal' : 'Feliz') as const
            }));
            const updatedCoach = state.team.coach 
                ? { ...state.team.coach, satisfactionLevel: Math.min(100, (state.team.coach.satisfactionLevel || 75) + 8) }
                : undefined;
            const updatedTeam = { ...state.team, squad: updatedSquad, coach: updatedCoach };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);

            return {
                ...state,
                team: updatedTeam,
                allTeams: updatedAllTeams,
                boardConfidence: Math.min(100, state.boardConfidence + 3),
                finances: {
                    ...state.finances,
                    balance: Math.max(0, state.finances.balance - totalCost)
                }
            };
        }

        default:
            return state;
    }
}
