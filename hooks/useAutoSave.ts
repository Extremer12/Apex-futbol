import { useState, useEffect, useCallback } from 'react';
import { GameState, PlayerProfile } from '../types';
import { saveGame as saveGameToDb } from '../services/db';

/**
 * Custom hook for auto-saving game state
 * @param gameState - Current game state
 * @param playerProfile - Player profile
 * @param appState - Current app state
 * @param currentSaveId - Current save ID
 * @param currentSaveName - Current save name
 * @param matchPhase - Current match phase
 * @returns Auto-save status
 */
export const useAutoSave = (
    gameState: GameState | null,
    playerProfile: PlayerProfile | null,
    appState: string,
    currentSaveId: string | null,
    currentSaveName: string | null,
    matchPhase: string
) => {
    const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

    useEffect(() => {
        if (gameState && playerProfile && appState === 'GAME_ACTIVE' && currentSaveId && matchPhase === 'PRE') {
            const autoSaveInterval = setInterval(() => {
                const saveData = {
                    id: currentSaveId,
                    saveName: currentSaveName || 'Auto-save',
                    playerProfile,
                    gameState,
                    teamName: gameState.team.name,
                    lastSaved: new Date()
                };

                saveGameToDb(saveData)
                    .then(() => setLastAutoSave(new Date()))
                    .catch(err => console.error("Auto-save failed:", err));
            }, 60000); // Auto-save every minute

            return () => clearInterval(autoSaveInterval);
        }
    }, [gameState, playerProfile, appState, currentSaveId, currentSaveName, matchPhase]);

    return { lastAutoSave };
};
