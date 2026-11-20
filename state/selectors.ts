import { GameState, Team, Player, LeagueTableRow, LeagueId } from '../types';
import { GameStoreState } from './gameStore';

/**
 * Selector canónico para obtener el equipo del usuario mánager,
 * garantizando que siempre provenga de la lista central sincronizada.
 */
export const selectUserTeam = (state: GameStoreState): Team => {
    const userTeamId = state.gameState.team.id;
    return state.gameState.allTeams.find(t => t.id === userTeamId) || state.gameState.team;
};

/**
 * Selector para obtener todos los equipos excepto el del mánager.
 */
export const selectOpponentTeams = (state: GameStoreState): Team[] => {
    const userTeamId = state.gameState.team.id;
    return state.gameState.allTeams.filter(t => t.id !== userTeamId);
};

/**
 * Selector memoizado para obtener un mapa O(1) de equipos por ID.
 */
let cachedAllTeamsRef: Team[] | null = null;
let cachedTeamsMap: Map<number, Team> = new Map();

export const selectTeamsMap = (state: GameStoreState): Map<number, Team> => {
    if (state.gameState.allTeams !== cachedAllTeamsRef) {
        cachedAllTeamsRef = state.gameState.allTeams;
        cachedTeamsMap = new Map(state.gameState.allTeams.map(t => [t.id, t]));
    }
    return cachedTeamsMap;
};

/**
 * Helper puro para resolver el equipo del usuario desde cualquier GameState.
 */
export const getUserTeam = (gameState: GameState): Team => {
    if (!gameState || !gameState.team) return {} as Team;
    return gameState.allTeams?.find(t => t.id === gameState.team.id) || gameState.team;
};

/**
 * Helper de sincronización bidireccional entre `state.team` y `state.allTeams`.
 * Devuelve el parche para el reducer que actualiza ambas referencias de forma atómica.
 */
export const syncUserTeam = (state: GameState, updatedTeam: Team): { team: Team; allTeams: Team[] } => {
    const existsInAllTeams = state.allTeams.some(t => t.id === updatedTeam.id);
    const updatedAllTeams = existsInAllTeams
        ? state.allTeams.map(t => (t.id === updatedTeam.id ? updatedTeam : t))
        : [...state.allTeams, updatedTeam];

    return {
        team: updatedTeam,
        allTeams: updatedAllTeams
    };
};

/**
 * Selector para la tabla de la liga del usuario.
 */
export const selectUserLeagueTable = (state: GameStoreState): LeagueTableRow[] => {
    const userLeagueId = state.gameState.team.leagueId;
    return state.gameState.leagueTables[userLeagueId] || [];
};

/**
 * Selector para los jugadores del primer equipo del usuario.
 */
export const selectUserSquad = (state: GameStoreState): Player[] => {
    return selectUserTeam(state).squad || [];
};
