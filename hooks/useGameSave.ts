import React, { useState, useEffect, useCallback } from 'react';
import { GameState, PlayerProfile } from '../types';
import { GameAction } from '../state/reducer';
import { 
    saveGame, 
    loadGame, 
    saveAutoGame, 
    saveQuickGame, 
    SavedGameData, 
    AUTOSAVE_SLOT_ID, 
    QUICKSAVE_SLOT_ID 
} from '../services/db';
import { uploadSaveToCloud, downloadCloudSave } from '../services/cloudSave';
import { supabase } from '../services/supabase';

export function useGameSave(
    gameState: GameState | null,
    playerProfile: PlayerProfile | null,
    appState: string,
    matchPhase: string,
    dispatch: React.Dispatch<GameAction>,
    showNotification: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
    const [currentSaveId, setCurrentSaveId] = useState<string | null>(null);
    const [currentSaveName, setCurrentSaveName] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Initial Auto-Save on career start
    useEffect(() => {
        if (appState === 'GAME_ACTIVE' && gameState && playerProfile && !currentSaveId) {
            const autoId = `save_${Date.now()}`;
            const autoName = `${gameState.team.name} - Temp ${gameState.season || 1}`;
            setCurrentSaveId(autoId);
            setCurrentSaveName(autoName);

            const initialSaveData: SavedGameData = {
                id: autoId,
                saveName: autoName,
                playerProfile,
                gameState,
                teamName: gameState.team.name,
                slotType: 'manual',
                lastSaved: new Date(),
            };

            saveGame(initialSaveData)
                .then(() => {
                    setLastSaved(new Date());
                    // Cloud backup in background without blocking UI
                    supabase.auth.getUser().then(({ data: { user } }) => {
                        if (user) {
                            uploadSaveToCloud(autoId, autoName, gameState, playerProfile).catch(() => {});
                        }
                    }).catch(() => {});
                })
                .catch(err => console.error("Initial save failed:", err));
        }
    }, [appState, gameState, playerProfile, currentSaveId]);

    const resetSaveState = useCallback(() => {
        setCurrentSaveId(null);
        setCurrentSaveName(null);
        setLastSaved(null);
        setIsSaving(false);
    }, []);

    // Controlled Auto-Save triggered at week completion or milestone
    const performAutoSave = useCallback(async () => {
        if (!gameState || !playerProfile) return;
        try {
            setIsSaving(true);
            await saveAutoGame(gameState, playerProfile);
            setLastSaved(new Date());
            // Opportunistic background cloud backup
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    uploadSaveToCloud(AUTOSAVE_SLOT_ID, `${gameState.team.name} (Autoguardado)`, gameState, playerProfile).catch(() => {});
                }
            }).catch(() => {});
        } catch (err) {
            console.error("Autosave error:", err);
        } finally {
            setIsSaving(false);
        }
    }, [gameState, playerProfile]);

    // Quick-Save triggered by user shortcut or button
    const performQuickSave = useCallback(async () => {
        if (!gameState || !playerProfile) return false;
        try {
            setIsSaving(true);
            await saveQuickGame(gameState, playerProfile);
            setLastSaved(new Date());
            showNotification(`⚡ Guardado rápido: ${gameState.team.name}`, 'success');
            return true;
        } catch (err) {
            console.error("Quick save error:", err);
            showNotification('Error al realizar guardado rápido', 'error');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [gameState, playerProfile, showNotification]);

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
            showNotification(`Partida "${savedData.saveName}" cargada`, 'success');
            return savedData.playerProfile;
        } else {
            console.error("Failed to load game state.");
            showNotification("Error al cargar la partida", "error");
            return null;
        }
    }, [dispatch, showNotification]);

    const performLoadCloudGame = useCallback(async (slotId: string) => {
        try {
            const cloudData = await downloadCloudSave(slotId);
            if (cloudData) {
                const rehydratedGameState: GameState = {
                    ...cloudData.gameState,
                    currentDate: new Date(cloudData.gameState.currentDate),
                    boardConfidence: cloudData.gameState.boardConfidence != null ? cloudData.gameState.boardConfidence : 75,
                    incomingOffers: cloudData.gameState.incomingOffers || [],
                };

                dispatch({ type: 'LOAD_GAME', payload: rehydratedGameState });
                setCurrentSaveId(slotId);
                setCurrentSaveName(cloudData.saveName);
                const now = new Date();
                setLastSaved(now);

                // Cache into IndexedDB for offline access
                await saveGame({
                    id: slotId,
                    saveName: cloudData.saveName,
                    playerProfile: cloudData.playerProfile,
                    gameState: rehydratedGameState,
                    teamName: rehydratedGameState.team.name,
                    slotType: 'manual',
                    lastSaved: now,
                });

                showNotification(`Partida "${cloudData.saveName}" descargada desde la nube ☁️`, 'success');
                return cloudData.playerProfile;
            }
        } catch (err: any) {
            console.error('Error loading cloud save:', err);
            showNotification('Error al cargar partida de la nube', 'error');
        }
        return null;
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
            slotType: 'manual',
            lastSaved: now,
        };

        try {
            setIsSaving(true);
            await saveGame(saveData);
            setCurrentSaveId(saveId);
            setCurrentSaveName(saveName);
            setLastSaved(now);

            // Cloud sync in background
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    uploadSaveToCloud(saveId, saveName, gameState, playerProfile)
                        .then(() => {
                            showNotification("Partida guardada y sincronizada en la nube ☁️", 'success');
                        })
                        .catch(() => {
                            showNotification(saveMode === 'new' ? "Nueva partida guardada (local)" : "Partida guardada (local)", 'success');
                        });
                } else {
                    showNotification(saveMode === 'new' ? "Nueva partida guardada" : "Partida guardada correctamente", 'success');
                }
            }).catch(() => {
                showNotification("Partida guardada correctamente", 'success');
            });

            return true;
        } catch (e) {
            console.error(e);
            showNotification("Error al guardar la partida", "error");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [gameState, playerProfile, currentSaveId, showNotification]);

    return {
        currentSaveId,
        currentSaveName,
        lastSaved,
        isSaving,
        resetSaveState,
        performAutoSave,
        performQuickSave,
        performLoadGame,
        performLoadCloudGame,
        performSaveGame
    };
}
