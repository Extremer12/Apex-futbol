import React, { createContext, useContext, useMemo } from 'react';
import { useGameStore, GameStoreState } from '../state/gameStore';
import { GameState, Screen, Team } from '../types';

export const GameContext = createContext<GameStoreState | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = useGameStore();
    return <GameContext.Provider value={store}>{children}</GameContext.Provider>;
};

/**
 * Hook to consume the complete game state and actions anywhere in the component tree.
 */
export function useGame() {
    return useGameStore();
}

/**
 * Hook to select specific slices from the game store with shallow re-render optimization.
 */
export function useGameSelector<T>(selector: (state: GameStoreState) => T): T {
    return useGameStore(selector);
}

/**
 * Helper hook to get active league players for the current user's team.
 */
export function useActiveLeaguePlayers(): Team['squad'] {
    const gameState = useGameStore(s => s.gameState);
    return useMemo(() => {
        if (!gameState?.team) return [];
        const userLeagueId = gameState.team.leagueId;
        return gameState.allTeams
            .filter(t => t.leagueId === userLeagueId || t.id === gameState.team.id)
            .flatMap(t => t.squad);
    }, [gameState?.allTeams, gameState?.team?.leagueId, gameState?.team?.id]);
}
