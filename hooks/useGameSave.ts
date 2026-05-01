import { useState, useEffect, useCallback } from 'react';
import { GameState, PlayerProfile } from '../types';
import { saveGame, loadGame, SavedGameData } from '../services/db';

export function useGameSave(
    gameState: GameState | null,
    playerProfile: PlayerProfile | null,
    appState: string,
    matchPhase: string,
    dispatch: any,
    showNotification: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
    const [currentSaveId, setCurrentSaveId] = useState<string | null>(null);
    const [currentSaveName, setCurrentSaveName] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Auto-saving effect
    useEffect(() => {
        if (appState === 'GAME_ACTIVE' && gameState && playerProfile && currentSaveId && currentSaveName && matchPhase === 'PRE') {
            const saveData: SavedGameData = {
                id: currentSaveId,
                saveName: currentSaveName,
                playerProfile,
                gameState,
                teamName: gameState.team.name,
                lastSaved: new Date(),
            };
            saveGame(saveData)
                .then(() => setLastSaved(new Date()))
                .catch(err => console.error("Auto-save failed:", err));
        }
    }, [gameState, playerProfile, appState, currentSaveId, currentSaveName, matchPhase]);

    const resetSaveState = useCallback(() => {
        setCurrentSaveId(null);
        setCurrentSaveName(null);
        setLastSaved(null);
    }, []);

    const performLoadGame = useCallback(async (id: string) => {
        const savedData = await loadGame(id);
        if (savedData) {
            const rehydratedGameState: GameState = {
                ...savedData.gameState,
                currentDate: new Date(savedData.gameState.currentDate),
                boardConfidence: savedData.gameState.boardConfidence != null ? savedData.gameState.boardConfidence : 75,
                incomingOffers: savedData.gameState.incomingOffers || [],
            };

            dispatch({ type: 'LOAD_GAME', payload: rehydratedGameState });
            setCurrentSaveId(savedData.id);
            setCurrentSaveName(savedData.saveName);
            setLastSaved(new Date(savedData.lastSaved));
            showNotification(`Partida "${savedData.saveName}" cargada`);
            return savedData.playerProfile;
        } else {
            console.error("Failed to load game state.");
            showNotification("Error al cargar la partida", "error");
            return null;
        }
    }, [dispatch, showNotification]);

    const performSaveGame = useCallback(async (saveName: string, saveMode: 'new' | 'overwrite') => {
        if (!gameState || !playerProfile) return false;

        const saveId = (saveMode === 'overwrite' && currentSaveId)
            ? currentSaveId
            : `save_${Date.now()}`;

        const now = new Date();

        const saveData: SavedGameData = {
            id: saveId,
            saveName: saveName,
            playerProfile,
            gameState,
            teamName: gameState.team.name,
            lastSaved: now,
        };

        try {
            await saveGame(saveData);
            setCurrentSaveId(saveId);
            setCurrentSaveName(saveName);
            setLastSaved(now);
            showNotification(saveMode === 'new' ? "Nueva partida guardada" : "Partida guardada correctamente");
            return true;
        } catch (e) {
            console.error(e);
            showNotification("Error al guardar la partida", "error");
            return false;
        }
    }, [gameState, playerProfile, currentSaveId, showNotification]);

    return {
        currentSaveId,
        currentSaveName,
        lastSaved,
        resetSaveState,
        performLoadGame,
        performSaveGame
    };
}
