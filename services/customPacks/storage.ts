// IndexedDB storage for custom logo and asset packs

const DB_NAME = 'ApexPacksDB';
const DB_VERSION = 1;
const STORE_NAME = 'assets';

export interface StoredAsset {
    id: string; // e.g. "teams:bocajuniors" or "competitions:premierleague"
    category: 'teams' | 'competitions' | 'players';
    identifier: string; // raw or normalized identifier
    blob?: Blob;
    url?: string;
    mimeType?: string;
    updatedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('identifier', 'identifier', { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    return dbPromise;
}

export async function saveStoredAsset(asset: StoredAsset): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(asset);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function saveStoredAssetsBatch(assets: StoredAsset[]): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        for (const asset of assets) {
            store.put(asset);
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function getStoredAsset(id: string): Promise<StoredAsset | undefined> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function getAllStoredAssets(): Promise<StoredAsset[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

export async function clearAllStoredAssets(): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function getStoredAssetsCount(): Promise<{ teams: number; competitions: number; players: number; total: number }> {
    const assets = await getAllStoredAssets();
    const counts = { teams: 0, competitions: 0, players: 0, total: assets.length };
    for (const a of assets) {
        if (a.category === 'teams') counts.teams++;
        else if (a.category === 'competitions') counts.competitions++;
        else if (a.category === 'players') counts.players++;
    }
    return counts;
}
