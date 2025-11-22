
import { GameState, PlayerProfile } from '../types';

const DB_NAME = 'ApexAIDB';
const DB_VERSION = 1;
const STORE_NAME = 'savedGames';

export interface SavedGameData {
    id: string;
    saveName: string;
    playerProfile: PlayerProfile;
    gameState: GameState;
    teamName: string;
    lastSaved: Date;
}

export interface SavedGameSummary {
    id: string;
    saveName: string;
    teamName: string;
    lastSaved: Date;
    teamId: number;
}


const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject("Error opening DB");
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const saveGame = async (gameData: SavedGameData): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        // Clean non-storable parts like React components
        const replacer = (key: string, value: any) => (key === 'logo' ? undefined : value);
        const storableGameState = JSON.parse(JSON.stringify(gameData.gameState, replacer));
        const storableData = { ...gameData, gameState: storableGameState };

        const request = store.put(storableData);
        transaction.oncomplete = () => {
            db.close();
            resolve();
        };
        transaction.onerror = (event) => {
            console.error("Error saving game:", transaction.error);
            db.close();
            reject(transaction.error);
        };
    });
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
            const summaries = result.map((fullSave: SavedGameData) => ({
                id: fullSave.id,
                saveName: fullSave.saveName,
                teamName: fullSave.teamName,
                lastSaved: fullSave.lastSaved,
                teamId: fullSave.gameState.team.id,
            })).sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime());
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
            db.close();
            resolve(request.result || null);
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
        }
    });
}