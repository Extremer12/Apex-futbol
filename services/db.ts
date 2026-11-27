import { GameState, PlayerProfile, Team } from '../types';

const DB_NAME = 'ApexAIDB';
const DB_VERSION = 4; // Incremented for lightweight O(1) saveSummaries store
const STORE_NAME = 'savedGames';
const SUMMARY_STORE_NAME = 'saveSummaries';

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
    careerId?: string;
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
    careerId?: string;
}

// Connection singleton for low-latency non-blocking DB reuse
let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

export const openDB = (): Promise<IDBDatabase> => {
    if (typeof indexedDB === 'undefined') {
        return Promise.reject(new Error("IndexedDB is not supported in this environment"));
    }
    if (dbInstance) {
        return Promise.resolve(dbInstance);
    }
    if (dbPromise) {
        return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => {
            dbPromise = null;
            reject(request.error || new Error("Error opening IndexedDB"));
        };
        request.onsuccess = () => {
            dbInstance = request.result;
            dbInstance.onversionchange = () => {
                dbInstance?.close();
                dbInstance = null;
                dbPromise = null;
            };
            dbInstance.onclose = () => {
                dbInstance = null;
                dbPromise = null;
            };
            resolve(dbInstance);
        };
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const upgradeTx = (event.target as IDBOpenDBRequest).transaction!;

            let store: IDBObjectStore;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            } else {
                store = upgradeTx.objectStore(STORE_NAME);
            }
            if (!store.indexNames.contains('careerId')) {
                store.createIndex('careerId', 'careerId', { unique: false });
            }

            let summaryStore: IDBObjectStore;
            if (!db.objectStoreNames.contains(SUMMARY_STORE_NAME)) {
                summaryStore = db.createObjectStore(SUMMARY_STORE_NAME, { keyPath: 'id' });
            } else {
                summaryStore = upgradeTx.objectStore(SUMMARY_STORE_NAME);
            }
            if (!summaryStore.indexNames.contains('careerId')) {
                summaryStore.createIndex('careerId', 'careerId', { unique: false });
            }
        };
    });
    return dbPromise;
};

export const closeDB = (): void => {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
    dbPromise = null;
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
        careerId: gameState.careerId || id,
        lastSaved: new Date()
    };
}

export const saveGame = async (gameData: SavedGameData): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const hasSummaryStore = db.objectStoreNames.contains(SUMMARY_STORE_NAME);
            const storeNames = hasSummaryStore ? [STORE_NAME, SUMMARY_STORE_NAME] : [STORE_NAME];
            const transaction = db.transaction(storeNames, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const summaryStore = hasSummaryStore ? transaction.objectStore(SUMMARY_STORE_NAME) : null;

            // Fast shallow sanitization instead of blocking JSON double-stringify
            const storableGameState = sanitizeGameStateForStorage(gameData.gameState);
            const slotType: SaveSlotType = gameData.slotType || 
                (gameData.id === AUTOSAVE_SLOT_ID ? 'autosave' : gameData.id === QUICKSAVE_SLOT_ID ? 'quicksave' : 'manual');

            const careerId = gameData.careerId || storableGameState.careerId || gameData.id;
            storableGameState.careerId = careerId;

            const now = new Date();
            const summary: SavedGameSummary = gameData.summary
                ? { ...gameData.summary, careerId, lastSaved: now }
                : buildSaveSummary(gameData.id, gameData.saveName, storableGameState, gameData.playerProfile, slotType);
            summary.careerId = careerId;

            const storableData: SavedGameData = {
                ...gameData,
                careerId,
                gameState: storableGameState,
                slotType,
                summary,
                schemaVersion: SCHEMA_VERSION,
                lastSaved: now
            };

            const writeRecords = () => {
                store.put(storableData);
                summaryStore?.put(summary);
            };

            // REPLACEMENT GUARANTEE:
            // Query only existing saves with this exact careerId via the index
            // If any earlier save belongs to this career under a different id, delete it from both stores!
            if (store.indexNames.contains('careerId')) {
                const careerIndex = store.index('careerId');
                const cursorReq = careerIndex.openKeyCursor(IDBKeyRange.only(careerId));
                cursorReq.onsuccess = () => {
                    const cursor = cursorReq.result;
                    if (cursor) {
                        const existingPrimaryKey = cursor.primaryKey as string;
                        if (existingPrimaryKey !== gameData.id) {
                            store.delete(existingPrimaryKey);
                            summaryStore?.delete(existingPrimaryKey);
                        }
                        cursor.continue();
                    } else {
                        writeRecords();
                    }
                };
                cursorReq.onerror = writeRecords;
            } else {
                writeRecords();
            }

            transaction.oncomplete = () => {
                resolve();
            };
            transaction.onerror = () => {
                console.error("Error saving game to IndexedDB:", transaction.error);
                reject(transaction.error);
            };
        } catch (err) {
            reject(err);
        }
    });
};

export const saveQuickGame = async (gameState: GameState, playerProfile: PlayerProfile): Promise<SavedGameData> => {
    const saveId = gameState.careerId || QUICKSAVE_SLOT_ID;
    const saveName = `${gameState.team.name} - Guardado Rápido`;
    const summary = buildSaveSummary(saveId, saveName, gameState, playerProfile, 'quicksave');
    summary.careerId = gameState.careerId || saveId;
    const data: SavedGameData = {
        id: saveId,
        careerId: gameState.careerId || saveId,
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
    const saveId = gameState.careerId || AUTOSAVE_SLOT_ID;
    const saveName = `${gameState.team.name} - Autoguardado`;
    const summary = buildSaveSummary(saveId, saveName, gameState, playerProfile, 'autosave');
    summary.careerId = gameState.careerId || saveId;
    const data: SavedGameData = {
        id: saveId,
        careerId: gameState.careerId || saveId,
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

function deduplicateAndSortSummaries(rawSummaries: SavedGameSummary[]): {
    summaries: SavedGameSummary[];
    duplicateIds: string[];
} {
    const careerMap = new Map<string, SavedGameSummary>();
    const duplicateIds: string[] = [];

    for (const raw of rawSummaries) {
        const normalized: SavedGameSummary = {
            ...raw,
            lastSaved: new Date(raw.lastSaved)
        };
        const careerKey = normalized.careerId || `team_${normalized.teamId || normalized.teamName}`;
        const existing = careerMap.get(careerKey);
        if (!existing) {
            careerMap.set(careerKey, normalized);
        } else if (normalized.lastSaved.getTime() > existing.lastSaved.getTime()) {
            duplicateIds.push(existing.id);
            careerMap.set(careerKey, normalized);
        } else {
            duplicateIds.push(normalized.id);
        }
    }

    const summaries = Array.from(careerMap.values()).sort(
        (a, b) => b.lastSaved.getTime() - a.lastSaved.getTime()
    );
    return { summaries, duplicateIds };
}

function scheduleDuplicateCleanup(duplicateIds: string[]): void {
    if (duplicateIds.length === 0) return;
    setTimeout(async () => {
        try {
            const cleanupDb = await openDB();
            const hasSummaryStore = cleanupDb.objectStoreNames.contains(SUMMARY_STORE_NAME);
            const storeNames = hasSummaryStore ? [STORE_NAME, SUMMARY_STORE_NAME] : [STORE_NAME];
            const cleanupTx = cleanupDb.transaction(storeNames, 'readwrite');
            const fullStore = cleanupTx.objectStore(STORE_NAME);
            const summaryStore = hasSummaryStore ? cleanupTx.objectStore(SUMMARY_STORE_NAME) : null;
            duplicateIds.forEach(id => {
                fullStore.delete(id);
                summaryStore?.delete(id);
            });
        } catch (e) {
            console.warn("Background cleanup of duplicate saves failed:", e);
        }
    }, 50);
}

function extractSummaryFromFullSave(fullSave: SavedGameData): SavedGameSummary {
    if (fullSave.summary) {
        return {
            ...fullSave.summary,
            careerId: fullSave.careerId || fullSave.summary.careerId,
            lastSaved: new Date(fullSave.summary.lastSaved || fullSave.lastSaved)
        };
    }
    const slotType: SaveSlotType = fullSave.id === AUTOSAVE_SLOT_ID
        ? 'autosave'
        : fullSave.id === QUICKSAVE_SLOT_ID
            ? 'quicksave'
            : 'manual';
    return buildSaveSummary(
        fullSave.id,
        fullSave.saveName,
        fullSave.gameState,
        fullSave.playerProfile,
        slotType
    );
}

export const getSavedGames = async (): Promise<SavedGameSummary[]> => {
    const db = await openDB();
    const hasSummaryStore = db.objectStoreNames.contains(SUMMARY_STORE_NAME);

    // Fast O(1) path: read lightweight metadata-only store without deserializing multi-MB GameState records
    if (hasSummaryStore) {
        const fastSummaries = await new Promise<SavedGameSummary[]>((resolve, reject) => {
            const tx = db.transaction(SUMMARY_STORE_NAME, 'readonly');
            const req = tx.objectStore(SUMMARY_STORE_NAME).getAll();
            req.onerror = () => reject(req.error);
            req.onsuccess = () => resolve((req.result || []) as SavedGameSummary[]);
        });

        if (fastSummaries.length > 0) {
            const { summaries, duplicateIds } = deduplicateAndSortSummaries(fastSummaries);
            scheduleDuplicateCleanup(duplicateIds);
            return summaries;
        }
    }

    // Legacy backfill path (first boot after DB upgrade v3 -> v4): read full saves once and populate saveSummaries
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => {
            console.error("Error getting saved games:", request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            const result = (request.result || []) as SavedGameData[];
            if (result.length === 0) {
                resolve([]);
                return;
            }

            const rawSummaries = result.map(extractSummaryFromFullSave);
            const { summaries, duplicateIds } = deduplicateAndSortSummaries(rawSummaries);
            scheduleDuplicateCleanup(duplicateIds);

            if (hasSummaryStore && summaries.length > 0) {
                setTimeout(async () => {
                    try {
                        const writeDb = await openDB();
                        const writeTx = writeDb.transaction(SUMMARY_STORE_NAME, 'readwrite');
                        const summaryStore = writeTx.objectStore(SUMMARY_STORE_NAME);
                        summaries.forEach(s => summaryStore.put(s));
                    } catch (e) {
                        console.warn("Background summary backfill failed:", e);
                    }
                }, 0);
            }

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
            reject(request.error);
        };

        request.onsuccess = () => {
            const rawData = request.result;

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
        const hasSummaryStore = db.objectStoreNames.contains(SUMMARY_STORE_NAME);
        const storeNames = hasSummaryStore ? [STORE_NAME, SUMMARY_STORE_NAME] : [STORE_NAME];
        const transaction = db.transaction(storeNames, 'readwrite');

        transaction.objectStore(STORE_NAME).delete(id);
        if (hasSummaryStore) {
            transaction.objectStore(SUMMARY_STORE_NAME).delete(id);
        }

        transaction.onerror = () => {
            console.error("Error deleting game:", transaction.error);
            reject(transaction.error);
        };

        transaction.oncomplete = () => {
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
    let text: string;
    try {
        text = await file.text();
    } catch {
        throw new Error('No se pudo leer el archivo seleccionado.');
    }

    let rawData: unknown;
    try {
        rawData = JSON.parse(text);
    } catch {
        throw new Error('El archivo no contiene un formato JSON válido.');
    }

    const data = rawData as Record<string, any>;
    if (
        !data ||
        typeof data !== 'object' ||
        !data.gameState ||
        typeof data.gameState !== 'object' ||
        !data.gameState.team ||
        typeof data.gameState.team.name !== 'string' ||
        !data.playerProfile ||
        typeof data.playerProfile !== 'object'
    ) {
        throw new Error('El archivo seleccionado no es un guardado íntegro o compatible de Apex Fútbol.');
    }

    const id = `save_manual_${Date.now()}`;
    const importedSave: SavedGameData = {
        ...data,
        id,
        saveName: data.saveName ? `${data.saveName} (Importada)` : `Importada - ${data.teamName || data.gameState.team.name}`,
        slotType: 'manual',
        lastSaved: new Date()
    } as SavedGameData;

    await saveGame(importedSave);
    return importedSave;
};

export const clearAllData = async (): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const hasSummaryStore = db.objectStoreNames.contains(SUMMARY_STORE_NAME);
        const storeNames = hasSummaryStore ? [STORE_NAME, SUMMARY_STORE_NAME] : [STORE_NAME];
        const transaction = db.transaction(storeNames, 'readwrite');

        transaction.objectStore(STORE_NAME).clear();
        if (hasSummaryStore) {
            transaction.objectStore(SUMMARY_STORE_NAME).clear();
        }

        transaction.onerror = () => {
            console.error("Error clearing data:", transaction.error);
            reject(transaction.error);
        };

        transaction.oncomplete = () => {
            resolve();
        };
    });
};