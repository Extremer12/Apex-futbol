import { GameState, PlayerProfile, Team } from '../types';

const DB_NAME = 'ApexAIDB';
const DB_VERSION = 2; // Incremented for rich save slot metadata
const STORE_NAME = 'savedGames';

// Schema version for save data compatibility
export const SCHEMA_VERSION = 2;

export type SaveSlotType = 'autosave' | 'quicksave' | 'manual';

export const AUTOSAVE_SLOT_ID = 'save_autosave';
export const QUICKSAVE_SLOT_ID = 'save_quicksave';

export interface SavedGameSummary {
    id: string;
    saveName: string;
    teamName: string;
    teamId: number;
    teamLogo?: string;
    leagueId?: string;
    season: number;
    currentWeek: number;
    leaguePosition?: number;
    balance?: number;
    managerName?: string;
    slotType: SaveSlotType;
    lastSaved: Date;
}

export interface SavedGameData {
    id: string;
    saveName: string;
    playerProfile: PlayerProfile;
    gameState: GameState;
    teamName: string;
    slotType?: SaveSlotType;
    summary?: SavedGameSummary;
    lastSaved: Date;
    schemaVersion?: number;
}

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject("Error opening IndexedDB");
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

/**
 * Fast, non-blocking sanitizer that strips React nodes and non-cloneable references
 * without doing a 30MB JSON.parse(JSON.stringify) on the main thread!
 */
function sanitizeTeamForStorage(team: Team): Team {
    if (!team) return team;
    if (typeof team.logo === 'string' || team.logo === undefined) {
        return team;
    }
    const { logo, ...rest } = team;
    return rest as Team;
}

export function sanitizeGameStateForStorage(gameState: GameState): GameState {
    if (!gameState) return gameState;
    const sanitizedTeam = sanitizeTeamForStorage(gameState.team);
    const sanitizedAllTeams = gameState.allTeams?.map(sanitizeTeamForStorage) || [];
    return {
        ...gameState,
        team: sanitizedTeam,
        allTeams: sanitizedAllTeams
    };
}

/**
 * Builds rich metadata summary for quick display in load screens without reading entire state
 */
export function buildSaveSummary(
    id: string,
    saveName: string,
    gameState: GameState,
    playerProfile?: PlayerProfile,
    slotType: SaveSlotType = 'manual'
): SavedGameSummary {
    const playerLeagueId = gameState.team?.leagueId;
    const table = playerLeagueId && gameState.leagueTables ? gameState.leagueTables[playerLeagueId] || [] : [];
    const sorted = [...table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    const position = sorted.findIndex(r => r.teamId === gameState.team?.id) + 1;
    const logoStr = typeof gameState.team?.logo === 'string' ? gameState.team.logo : undefined;

    return {
        id,
        saveName,
        teamName: gameState.team?.name || 'Club Desconocido',
        teamId: gameState.team?.id || 0,
        teamLogo: logoStr,
        leagueId: playerLeagueId,
        season: gameState.season || 1,
        currentWeek: gameState.currentWeek || 0,
        leaguePosition: position > 0 ? position : undefined,
        balance: gameState.finances?.balance,
        managerName: playerProfile?.name || gameState.playerProfile?.name || 'Mánager',
        slotType,
        lastSaved: new Date()
    };
}

export const saveGame = async (gameData: SavedGameData): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Fast shallow sanitization instead of blocking JSON double-stringify
            const storableGameState = sanitizeGameStateForStorage(gameData.gameState);
            const slotType: SaveSlotType = gameData.slotType || 
                (gameData.id === AUTOSAVE_SLOT_ID ? 'autosave' : gameData.id === QUICKSAVE_SLOT_ID ? 'quicksave' : 'manual');

            const summary = gameData.summary || buildSaveSummary(
                gameData.id,
                gameData.saveName,
                storableGameState,
                gameData.playerProfile,
                slotType
            );

            const storableData: SavedGameData = {
                ...gameData,
                gameState: storableGameState,
                slotType,
                summary,
                schemaVersion: SCHEMA_VERSION,
                lastSaved: new Date()
            };

            const request = store.put(storableData);
            transaction.oncomplete = () => {
                db.close();
                resolve();
            };
            transaction.onerror = () => {
                console.error("Error saving game to IndexedDB:", transaction.error);
                db.close();
                reject(transaction.error);
            };
        } catch (err) {
            db.close();
            reject(err);
        }
    });
};

export const saveQuickGame = async (gameState: GameState, playerProfile: PlayerProfile): Promise<SavedGameData> => {
    const saveName = `${gameState.team.name} - Guardado Rápido`;
    const summary = buildSaveSummary(QUICKSAVE_SLOT_ID, saveName, gameState, playerProfile, 'quicksave');
    const data: SavedGameData = {
        id: QUICKSAVE_SLOT_ID,
        saveName,
        playerProfile,
        gameState,
        teamName: gameState.team.name,
        slotType: 'quicksave',
        summary,
        lastSaved: new Date()
    };
    await saveGame(data);
    return data;
};

export const saveAutoGame = async (gameState: GameState, playerProfile: PlayerProfile): Promise<SavedGameData> => {
    const saveName = `${gameState.team.name} - Autoguardado`;
    const summary = buildSaveSummary(AUTOSAVE_SLOT_ID, saveName, gameState, playerProfile, 'autosave');
    const data: SavedGameData = {
        id: AUTOSAVE_SLOT_ID,
        saveName,
        playerProfile,
        gameState,
        teamName: gameState.team.name,
        slotType: 'autosave',
        summary,
        lastSaved: new Date()
    };
    await saveGame(data);
    return data;
};

export const getSavedGames = async (): Promise<SavedGameSummary[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => {
            console.error("Error getting saved games:", request.error);
            db.close();
            reject(request.error);
        };

        request.onsuccess = () => {
            const result = request.result || [];
            const summaries = result.map((fullSave: SavedGameData) => {
                if (fullSave.summary) {
                    return {
                        ...fullSave.summary,
                        lastSaved: new Date(fullSave.summary.lastSaved || fullSave.lastSaved)
                    };
                }
                const slotType: SaveSlotType = fullSave.id === AUTOSAVE_SLOT_ID ? 'autosave' : fullSave.id === QUICKSAVE_SLOT_ID ? 'quicksave' : 'manual';
                return buildSaveSummary(
                    fullSave.id,
                    fullSave.saveName,
                    fullSave.gameState,
                    fullSave.playerProfile,
                    slotType
                );
            }).sort((a, b) => {
                // Priority: autosave and quicksave at top if recent, otherwise sort by timestamp
                const timeA = new Date(a.lastSaved).getTime();
                const timeB = new Date(b.lastSaved).getTime();
                return timeB - timeA;
            });
            db.close();
            resolve(summaries);
        };
    });
};

export const loadGame = async (id: string): Promise<SavedGameData | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onerror = () => {
            console.error("Error loading game:", request.error);
            db.close();
            reject(request.error);
        };

        request.onsuccess = () => {
            const rawData = request.result;
            db.close();

            if (!rawData) {
                resolve(null);
                return;
            }

            // Restore Date instances
            if (rawData.gameState?.currentDate) {
                rawData.gameState.currentDate = new Date(rawData.gameState.currentDate);
            }
            if (rawData.lastSaved) {
                rawData.lastSaved = new Date(rawData.lastSaved);
            }

            resolve(rawData);
        };
    });
};

export const deleteGame = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => {
            console.error("Error deleting game:", request.error);
            db.close();
            reject(request.error);
        };

        request.onsuccess = () => {
            db.close();
            resolve();
        };
    });
};

export const exportSaveToFile = async (id: string): Promise<{ blob: Blob; filename: string }> => {
    const save = await loadGame(id);
    if (!save) throw new Error('Partida no encontrada');
    const safeName = save.saveName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `apex_${safeName}_${Date.now()}.apexsave`;
    const jsonString = JSON.stringify(save, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    return { blob, filename };
};

export const importSaveFromFile = async (file: File): Promise<SavedGameData> => {
    const text = await file.text();
    const rawData = JSON.parse(text);
    if (!rawData.gameState || !rawData.gameState.team) {
        throw new Error('El archivo seleccionado no es un guardado válido de Apex Fútbol.');
    }
    const id = `save_manual_${Date.now()}`;
    const importedSave: SavedGameData = {
        ...rawData,
        id,
        saveName: rawData.saveName ? `${rawData.saveName} (Importada)` : `Importada - ${rawData.teamName || 'Equipo'}`,
        slotType: 'manual',
        lastSaved: new Date()
    };
    await saveGame(importedSave);
    return importedSave;
};

export const clearAllData = async (): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onerror = () => {
            console.error("Error clearing data:", request.error);
            db.close();
            reject(request.error);
        };

        request.onsuccess = () => {
            db.close();
            resolve();
        };
    });
};