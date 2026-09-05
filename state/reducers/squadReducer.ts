import { GameState, Player, NewsItem } from '../../types';
import { formatDate } from '../../utils';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type SquadAction = Extract<GameAction,
    | { type: 'PROMOTE_PLAYER' }
    | { type: 'PROMOTE_YOUTH' }
    | { type: 'SET_VIEWING_PLAYER' }
>;

export function handleSquadAction(state: GameState, action: SquadAction): GameState {
    switch (action.type) {
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

            return {
                ...state,
                youthAcademy: state.youthAcademy.filter(p => p.id !== playerId),
                team: {
                    ...state.team,
                    squad: [...state.team.squad, playerToPromote]
                }
            };
        }

        case 'SET_VIEWING_PLAYER': {
            return { ...state, viewingPlayer: action.payload };
        }

        default:
            return state;
    }
}
