/**
 * RESOURCE SYSTEM: Local Cache & Offline Storage
 * 
 * Provides unified caching across Memory and IndexedDB.
 * Guarantees zero redundant network downloads and instant 0ms render lookup.
 */

import { ResourceType } from './ResourceTypes';

const DB_NAME = 'ApexPacksDB';
const DB_VERSION = 2; // Incremented for Pack Manifest & Asset indexing
const STORES = {
    ASSETS: 'assets',       // key: "category:identifier" -> Blob / URL
    MANIFESTS: 'manifests', // key: packId -> PackManifest
    INSTALLED: 'installed'  // key: packId -> InstalledPack
};

export interface CachedAssetRecord {
    key: string;            // e.g. "player-face:101"
    type: ResourceType;
    identifier: string;     // e.g. "101"
    packId?: string;
    blob?: Blob;
    url?: string;
    mimeType: string;
    updatedAt: number;
}

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase | null> | null = null;

export class ResourceCache {
    // In-memory hot cache for instant synchronous component renders
    private static memoryCache: Map<string, string> = new Map();
    // Hydrated IndexedDB blob object URLs keyed by `${packId}::${key}`
    private static packBlobUrls: Map<string, string> = new Map();
    // Track allocated object URLs to prevent memory leaks
    private static objectUrls: Set<string> = new Set();

    /**
     * Build standard cache key
     */
    public static makeKey(type: ResourceType, identifier: string | number): string {
        return `${type}:${String(identifier).trim().toLowerCase()}`;
    }

    public static makeBlobKey(packId: string, type: ResourceType, identifier: string | number): string {
        return `${packId}::${this.makeKey(type, identifier)}`;
    }

    public static getPackBlobUrl(packId: string, type: ResourceType, identifier: string | number): string | undefined {
        return this.packBlobUrls.get(this.makeBlobKey(packId, type, identifier));
    }

    /**
     * Hydrate memory cache from persistent IndexedDB records (non-blocking at startup)
     */
    public static async hydrateFromDB(): Promise<number> {
        const db = await this.getDB();
        if (!db) return 0;

        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORES.ASSETS, 'readonly');
                const store = tx.objectStore(STORES.ASSETS);
                const req = store.getAll();
                req.onsuccess = () => {
                    const records = (req.result || []) as CachedAssetRecord[];
                    let loaded = 0;
                    for (const record of records) {
                        const targetUrl = record.blob
                            ? URL.createObjectURL(record.blob)
                            : record.url;
                        if (!targetUrl) continue;
                        if (record.blob) this.objectUrls.add(targetUrl);

                        if (record.packId) {
                            this.packBlobUrls.set(this.makeBlobKey(record.packId, record.type, record.identifier), targetUrl);
                        } else {
                            this.memoryCache.set(record.key, targetUrl);
                        }
                        loaded++;
                    }
                    resolve(loaded);
                };
                req.onerror = () => resolve(0);
            } catch {
                resolve(0);
            }
        });
    }

    /**
     * Estimate local IndexedDB storage usage across cached pack assets
     */
    public static async getStorageStats(): Promise<{ assetCount: number; totalBytes: number }> {
        const db = await this.getDB();
        if (!db) return { assetCount: 0, totalBytes: 0 };

        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORES.ASSETS, 'readonly');
                const store = tx.objectStore(STORES.ASSETS);
                const req = store.getAll();
                req.onsuccess = () => {
                    const records = (req.result || []) as CachedAssetRecord[];
                    let totalBytes = 0;
                    for (const r of records) {
                        totalBytes += r.blob ? r.blob.size : 0;
                    }
                    resolve({ assetCount: records.length, totalBytes });
                };
                req.onerror = () => resolve({ assetCount: 0, totalBytes: 0 });
            } catch {
                resolve({ assetCount: 0, totalBytes: 0 });
            }
        });
    }

    /**
     * Get all stored asset blobs for ZIP export
     */
    public static async getAllStoredBlobs(): Promise<CachedAssetRecord[]> {
        const db = await this.getDB();
        if (!db) return [];

        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORES.ASSETS, 'readonly');
                const store = tx.objectStore(STORES.ASSETS);
                const req = store.getAll();
                req.onsuccess = () => resolve((req.result || []) as CachedAssetRecord[]);
                req.onerror = () => resolve([]);
            } catch {
                resolve([]);
            }
        });
    }

    /**
     * Get IDB Database connection safely
     */
    private static async getDB(): Promise<IDBDatabase | null> {
        if (typeof indexedDB === 'undefined') return null;
        if (dbInstance) return dbInstance;
        if (dbInitPromise) return dbInitPromise;

        dbInitPromise = new Promise((resolve) => {
            try {
                const req = indexedDB.open(DB_NAME, DB_VERSION);

                req.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    if (!db.objectStoreNames.contains(STORES.ASSETS)) {
                        const store = db.createObjectStore(STORES.ASSETS, { keyPath: 'key' });
                        store.createIndex('type', 'type', { unique: false });
                        store.createIndex('packId', 'packId', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.MANIFESTS)) {
                        db.createObjectStore(STORES.MANIFESTS, { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains(STORES.INSTALLED)) {
                        const installedStore = db.createObjectStore(STORES.INSTALLED, { keyPath: 'packId' });
                        installedStore.createIndex('priority', 'priority', { unique: false });
                    }
                };

                req.onsuccess = () => {
                    dbInstance = req.result;
                    resolve(dbInstance);
                };

                req.onerror = () => {
                    console.warn('ResourceCache: IndexedDB could not be opened, falling back to memory cache.');
                    resolve(null);
                };
            } catch {
                resolve(null);
            }
        });

        return dbInitPromise;
    }

    /**
     * Read from Memory (Instant 0ms lookup)
     */
    public static getFromMemory(key: string): string | undefined {
        return this.memoryCache.get(key);
    }

    /**
     * Set into Memory cache
     */
    public static setInMemory(key: string, url: string): void {
        this.memoryCache.set(key, url);
    }

    /**
     * Read Asset Record from IndexedDB (Async fallback for fresh sessions)
     */
    public static async getAsset(key: string): Promise<string | undefined> {
        // 1. Check memory first
        const mem = this.memoryCache.get(key);
        if (mem) return mem;

        // 2. Check IndexedDB
        const db = await this.getDB();
        if (!db) return undefined;

        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORES.ASSETS, 'readonly');
                const store = tx.objectStore(STORES.ASSETS);
                const req = store.get(key);

                req.onsuccess = () => {
                    const record = req.result as CachedAssetRecord | undefined;
                    if (!record) {
                        resolve(undefined);
                        return;
                    }

                    if (record.blob) {
                        const objectUrl = URL.createObjectURL(record.blob);
                        this.objectUrls.add(objectUrl);
                        this.memoryCache.set(key, objectUrl);
                        resolve(objectUrl);
                    } else if (record.url) {
                        this.memoryCache.set(key, record.url);
                        resolve(record.url);
                    } else {
                        resolve(undefined);
                    }
                };

                req.onerror = () => resolve(undefined);
            } catch {
                resolve(undefined);
            }
        });
    }

    /**
     * Save an asset blob or URL into cache & persistent IndexedDB
     */
    public static async putAsset(
        type: ResourceType,
        identifier: string | number,
        data: { blob?: Blob; url?: string; mimeType?: string; packId?: string }
    ): Promise<string> {
        const key = this.makeKey(type, identifier);
        let resolvedUrl = data.url || '';

        if (data.blob) {
            resolvedUrl = URL.createObjectURL(data.blob);
            this.objectUrls.add(resolvedUrl);
        }

        // Cache in memory immediately
        if (resolvedUrl) {
            this.memoryCache.set(key, resolvedUrl);
        }

        // Store persistently in IndexedDB
        const db = await this.getDB();
        if (db) {
            try {
                const tx = db.transaction(STORES.ASSETS, 'readwrite');
                const store = tx.objectStore(STORES.ASSETS);
                const record: CachedAssetRecord = {
                    key,
                    type,
                    identifier: String(identifier),
                    packId: data.packId,
                    blob: data.blob,
                    url: data.url,
                    mimeType: data.mimeType || (data.blob ? data.blob.type : 'image/webp'),
                    updatedAt: Date.now()
                };
                store.put(record);
            } catch (err) {
                console.warn('ResourceCache: Failed to persist asset to IDB:', err);
            }
        }

        return resolvedUrl;
    }

    /**
     * Bulk store assets (e.g. when unzipping a pack)
     */
    public static async putAssetsBatch(records: CachedAssetRecord[]): Promise<void> {
        records.forEach(r => {
            const resolved = r.blob ? URL.createObjectURL(r.blob) : r.url;
            if (!resolved) return;
            if (r.blob) this.objectUrls.add(resolved);

            if (r.packId) {
                this.packBlobUrls.set(this.makeBlobKey(r.packId, r.type, r.identifier), resolved);
            } else {
                this.memoryCache.set(r.key, resolved);
            }
        });

        const db = await this.getDB();
        if (!db) return;

        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORES.ASSETS, 'readwrite');
                const store = tx.objectStore(STORES.ASSETS);
                for (const r of records) {
                    store.put(r);
                }
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch {
                resolve();
            }
        });
    }

    /**
     * Clear all cached assets for a specific pack
     */
    public static async removePackAssets(packId: string): Promise<void> {
        const prefix = `${packId}::`;
        for (const key of Array.from(this.packBlobUrls.keys())) {
            if (key.startsWith(prefix)) {
                this.packBlobUrls.delete(key);
            }
        }
        this.memoryCache.clear();

        const db = await this.getDB();
        if (!db) return;

        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORES.ASSETS, 'readwrite');
                const store = tx.objectStore(STORES.ASSETS);
                const index = store.index('packId');
                const req = index.getAllKeys(packId);

                req.onsuccess = () => {
                    const keys = req.result;
                    for (const k of keys) {
                        store.delete(k);
                        this.memoryCache.delete(String(k));
                    }
                    resolve();
                };
                req.onerror = () => resolve();
            } catch {
                resolve();
            }
        });
    }

    /**
     * Clear hot in-memory resolution cache (keeps hydrated pack blobs intact)
     */
    public static clearMemory(): void {
        this.memoryCache.clear();
    }

    /**
     * Clear all memory and IndexedDB cached resources
     */
    public static async clearAll(): Promise<void> {
        this.objectUrls.forEach(url => {
            if (url.startsWith('blob:')) {
                try { URL.revokeObjectURL(url); } catch {}
            }
        });
        this.objectUrls.clear();
        this.packBlobUrls.clear();
        this.memoryCache.clear();

        const db = await this.getDB();
        if (db) {
            try {
                const tx = db.transaction([STORES.ASSETS, STORES.MANIFESTS, STORES.INSTALLED], 'readwrite');
                tx.objectStore(STORES.ASSETS).clear();
                tx.objectStore(STORES.MANIFESTS).clear();
                tx.objectStore(STORES.INSTALLED).clear();
            } catch {}
        }
    }
}
