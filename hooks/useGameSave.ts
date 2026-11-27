import { useEffect, useCallback } from 'react';
import { GameState } from '../types';
import { useGameStore } from '../state/gameStore';
import {
    saveGame,
    loadGame,
    saveAutoGame,
    saveQuickGame,
    SavedGameData
} from '../services/db';
import { uploadSaveToCloud, downloadCloudSave } from '../services/cloudSave';
import { supabase } from '../services/supabase';

/**
 * Save hook unified directly on `useGameStore`. Reads `gameState` imperatively inside
 * save callbacks so callers (e.g. `AppLogic`) never re-render when `gameState` ticks.
 */
export function useGameSave(
    showNotification: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
    const appState = useGameStore(s => s.appState);
    const hasGameState = useGameStore(s => s.gameState !== null);
    const currentSaveId = useGameStore(s => s.currentSaveId);
    const currentSaveName = useGameStore(s => s.currentSaveName);
    const lastSaved = useGameStore(s => s.lastSaved);
    const isSaving = useGameStore(s => s.isSaving);
    const setSaveState = useGameStore(s => s.setSaveState);

    // Initial Auto-Save on career start
    useEffect(() => {
        if (appState !== 'GAME_ACTIVE' || !hasGameState || currentSaveId) return;

        const { gameState, playerProfile } = useGameStore.getState();
        if (!gameState || !playerProfile) return;

        const careerId = gameState.careerId || `career_${gameState.team.id}_${Date.now()}`;
        const careerName = `${gameState.team.name} - Temp ${gameState.season || 1}`;
        setSaveState({ currentSaveId: careerId, currentSaveName: careerName });

        const initialSaveData: SavedGameData = {
            id: careerId,
            careerId,
            saveName: careerName,
            playerProfile,
            gameState: { ...gameState, careerId },
            teamName: gameState.team.name,
            slotType: 'manual',
            lastSaved: new Date(),
        };

        saveGame(initialSaveData)
            .then(() => {
                setSaveState({ lastSaved: new Date() });
                supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session?.user) {
                        uploadSaveToCloud(careerId, careerName, gameState, playerProfile).catch((err) => {
                            console.warn("[Apex Cloud] Initial cloud backup failed:", err);
                        });
                    }
                }).catch((err) => {
                    console.warn("[Apex Cloud] Session check failed during initial save:", err);
                });
            })
            .catch(err => console.error("Initial save failed:", err));
    }, [appState, hasGameState, currentSaveId, setSaveState]);

    const resetSaveState = useCallback(() => {
        setSaveState({
            currentSaveId: null,
            currentSaveName: null,
            lastSaved: null,
            isSaving: false
        });
    }, [setSaveState]);

    // Controlled Auto-Save triggered at week completion or milestone
    const performAutoSave = useCallback(async () => {
        const { gameState, playerProfile, currentSaveId: saveSlotId, currentSaveName: saveName } = useGameStore.getState();
        if (!gameState || !playerProfile) return;

        const effectiveProfile = gameState.playerProfile || playerProfile;
        try {
            setSaveState({ isSaving: true });
            const saveId = gameState.careerId || saveSlotId || `career_${gameState.team.id}_${Date.now()}`;
            await saveAutoGame({ ...gameState, careerId: saveId, playerProfile: effectiveProfile }, effectiveProfile);
            setSaveState({ lastSaved: new Date() });

            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) {
                    uploadSaveToCloud(saveId, saveName || `${gameState.team.name} (Autoguardado)`, gameState, effectiveProfile).catch((err) => {
                        console.warn("[Apex Cloud] Autosave cloud backup failed:", err);
                    });
                }
            }).catch((err) => {
                console.warn("[Apex Cloud] Session check failed during autosave:", err);
            });
        } catch (err) {
            console.error("Autosave error:", err);
        } finally {
            setSaveState({ isSaving: false });
        }
    }, [setSaveState]);

    // Quick-Save triggered by user shortcut or button
    const performQuickSave = useCallback(async () => {
        const { gameState, playerProfile, currentSaveId: saveSlotId } = useGameStore.getState();
        if (!gameState || !playerProfile) return false;

        const effectiveProfile = gameState.playerProfile || playerProfile;
        try {
            setSaveState({ isSaving: true });
            const saveId = gameState.careerId || saveSlotId || `career_${gameState.team.id}_${Date.now()}`;
            await saveQuickGame({ ...gameState, careerId: saveId, playerProfile: effectiveProfile }, effectiveProfile);
            setSaveState({ lastSaved: new Date() });
            showNotification(`⚡ Guardado rápido: ${gameState.team.name}`, 'success');
            return true;
        } catch (err) {
            console.error("Quick save error:", err);
            showNotification('Error al realizar guardado rápido', 'error');
            return false;
        } finally {
            setSaveState({ isSaving: false });
        }
    }, [showNotification, setSaveState]);

    const performLoadGame = useCallback(async (id: string) => {
        const { dispatch } = useGameStore.getState();
        const savedData = await loadGame(id);
        if (savedData) {
            const careerId = savedData.careerId || savedData.gameState.careerId || savedData.id;
            const rehydratedGameState: GameState = {
                ...savedData.gameState,
                careerId,
                playerProfile: savedData.playerProfile || savedData.gameState.playerProfile,
                currentDate: new Date(savedData.gameState.currentDate),
                boardConfidence: savedData.gameState.boardConfidence != null ? savedData.gameState.boardConfidence : 75,
                incomingOffers: savedData.gameState.incomingOffers || [],
            };

            dispatch({ type: 'LOAD_GAME', payload: rehydratedGameState });
            setSaveState({
                currentSaveId: careerId,
                currentSaveName: savedData.saveName,
                lastSaved: new Date(savedData.lastSaved)
            });
            showNotification(`Partida "${savedData.saveName}" cargada`, 'success');
            return savedData.playerProfile;
        } else {
            console.error("Failed to load game state.");
            showNotification("Error al cargar la partida", "error");
            return null;
        }
    }, [showNotification, setSaveState]);

    const performLoadCloudGame = useCallback(async (slotId: string) => {
        const { dispatch } = useGameStore.getState();
        try {
            const cloudData = await downloadCloudSave(slotId);
            if (cloudData) {
                const careerId = cloudData.gameState.careerId || slotId;
                const rehydratedGameState: GameState = {
                    ...cloudData.gameState,
                    careerId,
                    playerProfile: cloudData.playerProfile || cloudData.gameState.playerProfile,
                    currentDate: new Date(cloudData.gameState.currentDate),
                    boardConfidence: cloudData.gameState.boardConfidence != null ? cloudData.gameState.boardConfidence : 75,
                    incomingOffers: cloudData.gameState.incomingOffers || [],
                };

                dispatch({ type: 'LOAD_GAME', payload: rehydratedGameState });
                const now = new Date();
                setSaveState({
                    currentSaveId: careerId,
                    currentSaveName: cloudData.saveName,
                    lastSaved: now
                });

                await saveGame({
                    id: careerId,
                    careerId,
                    saveName: cloudData.saveName,
                    playerProfile: cloudData.playerProfile,
                    gameState: rehydratedGameState,
                    teamName: rehydratedGameState.team.name,
                    slotType: 'manual',
                    lastSaved: now,
                });

                showNotification(`Partida "${cloudData.saveName}" descargada desde la nube`, 'success');
                return cloudData.playerProfile;
            }
        } catch (err: unknown) {
            console.error('Error loading cloud save:', err);
            showNotification('Error al cargar partida de la nube', 'error');
        }
        return null;
    }, [showNotification, setSaveState]);

    const performSaveGame = useCallback(async (saveName: string, _saveMode?: 'new' | 'overwrite') => {
        const { gameState, playerProfile, currentSaveId: saveSlotId } = useGameStore.getState();
        if (!gameState || !playerProfile) return false;
        const effectiveProfile = gameState.playerProfile || playerProfile;

        const saveId = gameState.careerId || saveSlotId || `career_${gameState.team.id}_${Date.now()}`;
        const now = new Date();

        const saveData: SavedGameData = {
            id: saveId,
            careerId: saveId,
            saveName: saveName,
            playerProfile: effectiveProfile,
            gameState: { ...gameState, careerId: saveId, playerProfile: effectiveProfile },
            teamName: gameState.team.name,
            slotType: 'manual',
            lastSaved: now,
        };

        try {
            setSaveState({ isSaving: true });
            await saveGame(saveData);
            setSaveState({
                currentSaveId: saveId,
                currentSaveName: saveName,
                lastSaved: now
            });

            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) {
                    uploadSaveToCloud(saveId, saveName, gameState, effectiveProfile)
                        .then(() => {
                            showNotification("Partida guardada y sincronizada en la nube", 'success');
                        })
                        .catch((cloudErr) => {
                            console.warn("[Apex Cloud] Sync failed, saved locally:", cloudErr);
                            showNotification("Partida guardada correctamente (local)", 'success');
                        });
                } else {
                    showNotification("Partida guardada correctamente", 'success');
                }
            }).catch((authErr) => {
                console.warn("[Apex Cloud] Session check failed:", authErr);
                showNotification("Partida guardada correctamente", 'success');
            });

            return true;
        } catch (e) {
            console.error(e);
            showNotification("Error al guardar la partida", "error");
            return false;
        } finally {
            setSaveState({ isSaving: false });
        }
    }, [showNotification, setSaveState]);

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
