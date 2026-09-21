/**
 * @deprecated GameContext is deprecated in favor of direct Zustand consumption via `useGameStore`.
 * Zustand provides atomic selectors (`useGameStore(s => s.field)`) which prevent unnecessary 
 * re-renders and eliminate redundant Context Provider wrappers.
 */

import React from 'react';
import { useGameStore, GameStoreState } from '../state/gameStore';

/**
 * @deprecated Use `useGameStore` directly.
 */
export const GameContext = React.createContext<GameStoreState | null>(null);

/**
 * @deprecated No longer needed. Direct `useGameStore` does not require a Provider wrapper.
 */
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
};

/**
 * @deprecated Use `useGameStore()` directly.
 */
export function useGame() {
    return useGameStore();
}

/**
 * @deprecated Use `useGameStore(selector)` directly.
 */
export function useGameSelector<T>(selector: (state: GameStoreState) => T): T {
    return useGameStore(selector);
}
