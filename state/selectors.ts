import { useShallow } from 'zustand/react/shallow';
import { GameState, Team, Player, LeagueTableRow } from '../types';
import { useGameStore, GameStoreState } from './gameStore';
import { getGlobalPlayerIndex } from '../services/playerIndex';

const EMPTY_PLAYERS: Player[] = [];

/**
 * Selector canónico para obtener el equipo del usuario mánager,
 * garantizando que siempre provenga de la lista central sincronizada.
 * Acepta tanto el estado de Zustand (GameStoreState) como un GameState directo.
 */
export const selectUserTeam = (state: GameStoreState | GameState): Team => {
    if (!state) return {} as Team;
    const gs = ('gameState' in state && state.gameState) ? state.gameState : (state as GameState);
    if (!gs || !gs.team) return {} as Team;
    const userTeamId = gs.team.id;
    return gs.allTeams?.find(t => t.id === userTeamId) || gs.team;
};

/**
 * Selector para obtener todos los equipos excepto el del mánager.
 */
export const selectOpponentTeams = (state: GameStoreState | GameState): Team[] => {
    if (!state) return [];
    const gs = ('gameState' in state && state.gameState) ? state.gameState : (state as GameState);
    if (!gs || !gs.team || !gs.allTeams) return [];
    const userTeamId = gs.team.id;
    return gs.allTeams.filter(t => t.id !== userTeamId);
};

/**
 * Selector memoizado para obtener un mapa O(1) de equipos por ID.
 */
export const selectTeamsMap = (state: GameStoreState | GameState): Map<number, Team> => {
    if (!state) return new Map();
    const gs = ('gameState' in state && state.gameState) ? state.gameState : (state as GameState);
    return getGlobalPlayerIndex(gs?.allTeams).teamsById;
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
    if (!state.gameState?.team) return [];
    const userLeagueId = state.gameState.team.leagueId;
    return state.gameState.leagueTables[userLeagueId] || [];
};

/**
 * Selector para los jugadores del primer equipo del usuario.
 */
export const selectUserSquad = (state: GameStoreState): Player[] => {
    return selectUserTeam(state).squad || EMPTY_PLAYERS;
};

// ============================================================================
// Atomic Domain Slice Hooks (prevent full-tree re-renders on unrelated slices)
// ============================================================================

export const useTeamSlice = () =>
    useGameStore(
        useShallow((s) => {
            const team = s.gameState?.team;
            return {
                team,
                teamId: team?.id,
                teamName: team?.name || '',
                primaryColor: team?.primaryColor || '',
                leagueId: team?.leagueId,
                squad: team?.squad || EMPTY_PLAYERS,
                youthAcademy: s.gameState?.youthAcademy || EMPTY_PLAYERS,
            };
        })
    );

export const useFinancesSlice = () =>
    useGameStore(
        useShallow((s) => {
            const finances = s.gameState?.finances;
            return {
                finances,
                balance: finances?.balance ?? 0,
                transferBudget: finances?.transferBudget ?? 0,
                weeklyIncome: finances?.weeklyIncome ?? 0,
                weeklyWages: finances?.weeklyWages ?? 0,
                preferredCurrency: s.gameState?.preferredCurrency || 'EUR',
            };
        })
    );

export const useCalendarSlice = () =>
    useGameStore(
        useShallow((s) => ({
            season: s.gameState?.season ?? 1,
            currentWeek: s.gameState?.currentWeek ?? 1,
            currentTurn: s.gameState?.currentTurn ?? ('weekend' as const),
            currentDate: s.gameState?.currentDate,
            mandate: s.gameState?.mandate,
        }))
    );

/**
 * O(1) reactive lookup for a player across allTeams or reserve squad using the global index.
 */
export const usePlayerById = (playerId: number | null | undefined): {
    player: Player | undefined;
    ownerTeam: Team | undefined;
    isInFirstTeam: boolean;
    isInReserve: boolean;
} =>
    useGameStore(
        useShallow((s) => {
            if (!playerId || !s.gameState) {
                return { player: undefined, ownerTeam: undefined, isInFirstTeam: false, isInReserve: false };
            }
            const userTeam = s.gameState.team;
            const reserveMatch = s.gameState.youthAcademy?.find(p => p.id === playerId);
            if (reserveMatch) {
                return {
                    player: reserveMatch,
                    ownerTeam: userTeam,
                    isInFirstTeam: false,
                    isInReserve: true
                };
            }
            const idx = getGlobalPlayerIndex(s.gameState.allTeams);
            const indexedPlayer = idx.playersById.get(playerId) || userTeam?.squad?.find(p => p.id === playerId);
            const ownerTeam = idx.playerTeamById.get(playerId) || (userTeam?.squad?.some(p => p.id === playerId) ? userTeam : undefined);
            const isInFirstTeam = ownerTeam?.id === userTeam?.id;

            return {
                player: indexedPlayer,
                ownerTeam,
                isInFirstTeam,
                isInReserve: false
            };
        })
    );
