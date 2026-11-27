/**
 * RESOURCE SYSTEM: Pack Manager
 *
 * Manages the lifecycle of community packs:
 * Installation, batch downloads, local .ZIP / HTTPS imports, Uninstallation,
 * Enable/Disable, Priorities, Updates, and offline IndexedDB cache management.
 */

import { InstalledPack, PackManifest, PackCatalogItem, ResourceType } from './ResourceTypes';
import { PackManifestValidator } from './PackManifest';
import { ResourceCache, CachedAssetRecord } from './ResourceCache';
import { normalizeKey } from '../customPacks/matcher';

const STORAGE_KEY = 'apex_installed_packs_v2';
const MAX_ZIP_ENTRIES = 4000;
const MAX_ZIP_UNCOMPRESSED_BYTES = 80 * 1024 * 1024; // 80 MB zip-bomb safety cap

export type PackChangeListener = (packs: InstalledPack[]) => void;

const throwIfAborted = (signal?: AbortSignal) => {
    if (signal?.aborted) {
        throw new Error('Operación cancelada por el usuario.');
    }
};

/**
 * Strip potentially unsafe scripting tags/attributes from SVG content before caching locally.
 */
export function sanitizeSvgContent(rawSvg: string): string {
    return rawSvg
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '')
        .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/(href|xlink:href)\s*=\s*["']\s*javascript:[^"']*["']/gi, '');
}

async function sanitizeImageBlob(blob: Blob, lowerPath: string): Promise<{ blob: Blob; mimeType: string }> {
    if (lowerPath.endsWith('.svg')) {
        const sanitizedSvg = sanitizeSvgContent(await blob.text());
        return {
            blob: new Blob([sanitizedSvg], { type: 'image/svg+xml' }),
            mimeType: 'image/svg+xml'
        };
    }

    const mimeType = lowerPath.endsWith('.webp')
        ? 'image/webp'
        : lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')
            ? 'image/jpeg'
            : 'image/png';

    return { blob, mimeType };
}

export class PackManager {
    private static installedPacks: Map<string, InstalledPack> = new Map();
    private static listeners: Set<PackChangeListener> = new Set();
    private static initialized = false;

    public static subscribe(listener: PackChangeListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private static notify(): void {
        const list = this.getInstalledPacks();
        this.listeners.forEach(fn => fn(list));
    }

    /**
     * Initialize manager: restore installed pack list and hydrate IndexedDB blobs.
     */
    public static async init(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;

        if (typeof window === 'undefined') return;

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const list: InstalledPack[] = JSON.parse(raw);
                list.forEach(p => {
                    this.installedPacks.set(p.packId, p);
                });
            }
        } catch (e) {
            console.warn('PackManager: Failed to load installed packs from localStorage:', e);
        }

        try {
            const hydrated = await ResourceCache.hydrateFromDB();
            if (hydrated > 0) {
                ResourceCache.clearMemory();
                this.notify();
            }
        } catch (e) {
            console.warn('PackManager: Failed to hydrate ResourceCache:', e);
        }
    }

    public static getInstalledPacks(): InstalledPack[] {
        return Array.from(this.installedPacks.values()).sort((a, b) => b.priority - a.priority);
    }

    public static getInstalledPack(packId: string): InstalledPack | undefined {
        return this.installedPacks.get(packId);
    }

    public static isInstalled(packId: string): boolean {
        return this.installedPacks.has(packId);
    }

    public static isEnabled(packId: string): boolean {
        const pack = this.installedPacks.get(packId);
        return Boolean(pack && pack.enabled);
    }

    private static save(): void {
        if (typeof window === 'undefined') return;
        try {
            const list = Array.from(this.installedPacks.values());
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.error('PackManager: Failed to persist installed packs:', e);
        }
    }

    /**
     * Install a pack from a validated manifest
     */
    public static async installManifestPack(manifestInput: unknown, priority = 10): Promise<InstalledPack> {
        const manifest = PackManifestValidator.validate(manifestInput);

        const existing = this.installedPacks.get(manifest.id);
        const installed: InstalledPack = {
            packId: manifest.id,
            name: manifest.name,
            version: manifest.version,
            category: manifest.category,
            enabled: true,
            priority: existing ? existing.priority : priority,
            installedAt: existing ? existing.installedAt : Date.now(),
            lastUpdated: Date.now(),
            checksum: manifest.checksum,
            assetCount: manifest.assetCount,
            sizeBytes: manifest.sizeBytes,
            isOfficial: manifest.isOfficial,
            manifest
        };

        this.installedPacks.set(manifest.id, installed);
        this.save();
        ResourceCache.clearMemory();
        this.notify();
        return installed;
    }

    /**
     * Toggle a pack enabled state
     */
    public static setPackEnabled(packId: string, enabled: boolean): boolean {
        const pack = this.installedPacks.get(packId);
        if (!pack) return false;

        pack.enabled = enabled;
        pack.lastUpdated = Date.now();
        this.save();
        ResourceCache.clearMemory();
        this.notify();
        return true;
    }

    /**
     * Update pack priority
     */
    public static setPackPriority(packId: string, priority: number): boolean {
        const pack = this.installedPacks.get(packId);
        if (!pack) return false;

        pack.priority = priority;
        pack.lastUpdated = Date.now();
        this.save();
        ResourceCache.clearMemory();
        this.notify();
        return true;
    }

    /**
     * Uninstall a pack and remove its local cached assets
     */
    public static async uninstallPack(packId: string): Promise<boolean> {
        if (!this.installedPacks.has(packId)) return false;

        this.installedPacks.delete(packId);
        this.save();
        await ResourceCache.removePackAssets(packId);
        ResourceCache.clearMemory();
        this.notify();
        return true;
    }

    /**
     * Clear every installed pack and return to clean procedural base visuals
     */
    public static async clearAllPacks(): Promise<void> {
        this.installedPacks.clear();
        this.save();
        await ResourceCache.clearAll();
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('apex_community_packs_active');
            } catch { }
        }
        this.notify();
    }

    public static async uninstallAll(): Promise<void> {
        return this.clearAllPacks();
    }

    /**
     * Install a catalog item with genuine AbortSignal cancellation
     */
    public static async installCatalogPack(
        item: PackCatalogItem,
        options?: {
            signal?: AbortSignal;
            priority?: number;
            onProgress?: (percent: number, status: string) => void;
        }
    ): Promise<InstalledPack> {
        const { signal, onProgress } = options || {};
        throwIfAborted(signal);

        onProgress?.(10, `Preparando ${item.name}...`);

        // Remote JSON manifest without local bundleKey
        if (!item.bundleKey && item.manifestUrl && item.manifestUrl.endsWith('.json')) {
            onProgress?.(30, `Conectando con fuente remota...`);
            const resp = await fetch(item.manifestUrl, { signal });
            if (!resp.ok) {
                throw new Error(`No se pudo obtener el manifiesto (HTTP ${resp.status}).`);
            }
            const manifestData = await resp.json();
            throwIfAborted(signal);
            onProgress?.(85, 'Validando manifiesto...');
            const installed = await this.installManifestPack(manifestData, options?.priority ?? 15);
            onProgress?.(100, 'Instalación completada');
            return installed;
        }

        // Modular community bundle pack (Option 1)
        const steps = [
            { pct: 35, text: `Indexando ${item.assetCount} recursos (${item.sizeFormatted})...` },
            { pct: 70, text: 'Registrando resolución en caché...' },
        ];

        for (const step of steps) {
            throwIfAborted(signal);
            onProgress?.(step.pct, step.text);
            await new Promise<void>((resolve, reject) => {
                const timer = setTimeout(resolve, 90);
                signal?.addEventListener('abort', () => {
                    clearTimeout(timer);
                    reject(new Error('Operación cancelada por el usuario.'));
                }, { once: true });
            });
        }

        throwIfAborted(signal);
        const installed = await this.installManifestPack({
            schemaVersion: 1,
            id: item.id,
            name: item.name,
            version: item.version,
            category: item.category,
            author: item.author,
            description: item.description,
            tags: item.tags,
            isOfficial: false,
            assetCount: item.assetCount,
            sizeBytes: item.sizeBytes,
            bundleKey: item.bundleKey || item.id,
            status: 'approved',
            assets: {}
        }, options?.priority ?? 15);

        onProgress?.(100, 'Pack activado');
        return installed;
    }

    /**
     * Batch-install all provided catalog packs sequentially with cancellation & aggregate progress
     */
    public static async installAllCatalogPacks(
        items: PackCatalogItem[],
        options?: {
            signal?: AbortSignal;
            onProgress?: (overallPct: number, currentName: string, done: number, total: number) => void;
        }
    ): Promise<{ installed: number; errors: string[] }> {
        const { signal, onProgress } = options || {};
        const pending = items.filter(item => {
            const existing = this.getInstalledPack(item.id);
            return !existing || !existing.enabled || this.hasUpdate(existing, item);
        });

        const total = pending.length;
        if (total === 0) {
            onProgress?.(100, 'Todo instalado', 0, 0);
            return { installed: 0, errors: [] };
        }

        let installed = 0;
        const errors: string[] = [];

        for (let i = 0; i < pending.length; i++) {
            throwIfAborted(signal);
            const item = pending[i];
            const existing = this.getInstalledPack(item.id);

            onProgress?.(Math.round((i / total) * 100), item.name, i, total);

            try {
                if (existing && !existing.enabled && !this.hasUpdate(existing, item)) {
                    this.setPackEnabled(existing.packId, true);
                } else {
                    await this.installCatalogPack(item, { signal });
                }
                installed++;
            } catch (err: any) {
                if (signal?.aborted) throw err;
                errors.push(`${item.name}: ${err?.message || 'Error desconocido'}`);
            }
        }

        onProgress?.(100, 'Completado', total, total);
        return { installed, errors };
    }

    /**
     * Import and persist a user-provided .ZIP pack locally in IndexedDB (100% offline-capable)
     */
    public static async installZipFile(
        file: File | Blob | ArrayBuffer | Uint8Array,
        options?: {
            name?: string;
            signal?: AbortSignal;
            onProgress?: (percent: number, status: string) => void;
        }
    ): Promise<InstalledPack> {
        const { signal, onProgress } = options || {};
        throwIfAborted(signal);

        onProgress?.(5, 'Abriendo archivo .ZIP...');
        const zipPayload =
            file instanceof Uint8Array || file instanceof ArrayBuffer
                ? file
                : typeof (file as Blob).arrayBuffer === 'function'
                    ? await (file as Blob).arrayBuffer()
                    : file;
        const { default: JSZip } = await import('jszip');
        const zip = await JSZip.loadAsync(zipPayload);

        const fileEntries = Object.entries(zip.files).filter(([, entry]) => !entry.dir);
        if (fileEntries.length === 0) {
            throw new Error('El archivo .ZIP no contiene imágenes válidas.');
        }
        if (fileEntries.length > MAX_ZIP_ENTRIES) {
            throw new Error(`El paquete supera el límite de seguridad de ${MAX_ZIP_ENTRIES} archivos.`);
        }

        let parsedManifest: PackManifest | null = null;
        for (const [filepath, entry] of fileEntries) {
            if (filepath.toLowerCase().endsWith('manifest.json')) {
                try {
                    const txt = await entry.async('string');
                    parsedManifest = PackManifestValidator.validate(JSON.parse(txt));
                } catch { }
                break;
            }
        }

        const rawLabel = parsedManifest?.name || options?.name?.replace(/\.zip$/i, '') || 'Pack Local';
        const packId = parsedManifest?.id || `local-${Date.now()}-${rawLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}`;

        const assetsDict: PackManifest['assets'] = {
            teams: {},
            players: {},
            competitions: {},
            leagues: {},
            trophies: {},
            flags: {},
        };

        const recordsToCache: CachedAssetRecord[] = [];
        let uncompressedBytes = 0;
        let processed = 0;
        let imageCount = 0;

        for (const [filepath, entry] of fileEntries) {
            throwIfAborted(signal);
            processed++;
            if (processed % 15 === 0 || processed === fileEntries.length) {
                const pct = Math.round(10 + (processed / fileEntries.length) * 75);
                onProgress?.(pct, `Procesando imágenes (${processed}/${fileEntries.length})...`);
            }

            const lower = filepath.toLowerCase();
            if (!/\.(png|jpg|jpeg|svg|webp)$/i.test(lower)) continue;

            const rawBytes = await entry.async('uint8array');
            const copyBytes = new Uint8Array(rawBytes.byteLength);
            copyBytes.set(rawBytes);
            const rawBlob = new Blob([copyBytes.buffer]);
            uncompressedBytes += rawBlob.size;
            if (uncompressedBytes > MAX_ZIP_UNCOMPRESSED_BYTES) {
                throw new Error('El tamaño descomprimido excede el límite permitido (80 MB).');
            }

            const { blob, mimeType } = await sanitizeImageBlob(rawBlob, lower);

            let resType: ResourceType = 'team-logo';
            let manifestGroup: keyof PackManifest['assets'] = 'teams';

            if (lower.includes('player') || lower.includes('face') || lower.includes('jugador') || lower.includes('rostro')) {
                resType = 'player-face';
                manifestGroup = 'players';
            } else if (lower.includes('troph') || lower.includes('trofeo') || lower.includes('palmares')) {
                resType = 'trophy';
                manifestGroup = 'trophies';
            } else if (lower.includes('flag') || lower.includes('bandera')) {
                resType = 'flag';
                manifestGroup = 'flags';
            } else if (lower.includes('league') || lower.includes('liga')) {
                resType = 'league-logo';
                manifestGroup = 'leagues';
            } else if (lower.includes('competition') || lower.includes('copa') || lower.includes('cup')) {
                resType = 'competition-logo';
                manifestGroup = 'competitions';
            }

            const fileName = filepath.split('/').pop() || filepath;
            const stem = fileName.replace(/\.(png|jpg|jpeg|svg|webp)$/i, '');
            const rawSlug = stem.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
            const normSlug = normalizeKey(fileName);
            const cleanId = rawSlug || normSlug;
            if (!cleanId) continue;

            const relPath = `${manifestGroup}/${cleanId}.${lower.split('.').pop() || 'png'}`;
            const now = Date.now();

            recordsToCache.push({
                key: `${packId}::${ResourceCache.makeKey(resType, cleanId)}`,
                type: resType,
                identifier: cleanId,
                packId,
                blob,
                mimeType,
                updatedAt: now
            });

            assetsDict[manifestGroup]![cleanId] = relPath;
            if (normSlug && normSlug !== cleanId) {
                assetsDict[manifestGroup]![normSlug] = relPath;
                recordsToCache.push({
                    key: `${packId}::${ResourceCache.makeKey(resType, normSlug)}`,
                    type: resType,
                    identifier: normSlug,
                    packId,
                    blob,
                    mimeType,
                    updatedAt: now
                });
            }
            // Also index raw uppercase stem when identifier is e.g. league code PREMIER_LEAGUE
            if (/^[a-z0-9_]+$/i.test(stem) && stem !== cleanId) {
                assetsDict[manifestGroup]![stem] = relPath;
                assetsDict[manifestGroup]![stem.toLowerCase()] = relPath;
            }

            imageCount++;
        }

        if (imageCount === 0) {
            throw new Error('No se encontraron imágenes PNG, WebP, JPG o SVG dentro del archivo .ZIP.');
        }

        throwIfAborted(signal);
        onProgress?.(90, `Guardando ${imageCount} recursos en IndexedDB...`);
        await ResourceCache.putAssetsBatch(recordsToCache);

        const manifestToInstall: PackManifest = {
            schemaVersion: 1,
            id: packId,
            name: rawLabel,
            version: parsedManifest?.version || '1.0.0',
            category: parsedManifest?.category || 'all-in-one',
            author: parsedManifest?.author || { id: 'local-user', name: 'Importación Local', role: 'USER' },
            description: parsedManifest?.description || `Pack local importado (${imageCount} imágenes).`,
            tags: ['local', 'zip'],
            isOfficial: false,
            gameVersionMin: '1.0.0',
            assetCount: imageCount,
            sizeBytes: uncompressedBytes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            license: {
                type: 'Community',
                rightsDeclared: true,
                declarationText: 'Recurso local importado por el usuario.'
            },
            status: 'approved',
            baseUrl: `idb://${packId}`,
            assets: assetsDict
        };

        const installed = await this.installManifestPack(manifestToInstall, 30);
        onProgress?.(100, `Importación completa (${imageCount} recursos).`);
        return installed;
    }

    /**
     * Import a remote HTTPS manifest.json or .zip pack (strict HTTPS, zero third-party CORS proxies)
     */
    public static async installFromHttpsUrl(
        rawUrl: string,
        options?: {
            signal?: AbortSignal;
            onProgress?: (percent: number, status: string) => void;
        }
    ): Promise<InstalledPack> {
        const { signal, onProgress } = options || {};
        const trimmed = rawUrl.trim();
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(trimmed);
        } catch {
            throw new Error('La URL ingresada no es válida.');
        }
        if (parsedUrl.protocol !== 'https:') {
            throw new Error('Por seguridad, solo se permiten enlaces HTTPS verificados.');
        }

        throwIfAborted(signal);
        onProgress?.(15, 'Conectando con el servidor remoto...');

        let resp: Response;
        try {
            resp = await fetch(trimmed, { signal });
        } catch (err: any) {
            if (signal?.aborted) throw new Error('Operación cancelada por el usuario.');
            throw new Error('No se pudo conectar con la URL (verifica conexión o permisos CORS del servidor).');
        }

        if (!resp.ok) {
            throw new Error(`El servidor respondió HTTP ${resp.status}.`);
        }

        const contentType = (resp.headers.get('content-type') || '').toLowerCase();
        if (trimmed.toLowerCase().endsWith('.zip') || contentType.includes('zip')) {
            onProgress?.(40, 'Descargando paquete .ZIP...');
            const blob = await resp.blob();
            const fileName = parsedUrl.pathname.split('/').pop() || 'remote-pack.zip';
            return this.installZipFile(blob, {
                name: fileName,
                signal,
                onProgress: (pct, msg) => onProgress?.(Math.min(100, Math.round(40 + pct * 0.6)), msg)
            });
        }

        onProgress?.(55, 'Validando manifiesto JSON...');
        const json = await resp.json();
        throwIfAborted(signal);
        const installed = await this.installManifestPack(json, 25);
        onProgress?.(100, 'Pack instalado correctamente.');
        return installed;
    }

    /**
     * Download and install a community pack ZIP from a catalog item
     */
    public static async downloadAndInstallZipPack(
        catalogItem: PackCatalogItem,
        onProgress?: (percent: number, status: string) => void
    ): Promise<InstalledPack> {
        if (!catalogItem.downloadUrl) {
            return this.installCatalogPack(catalogItem, { onProgress });
        }

        onProgress?.(10, 'Descargando paquete...');
        const response = await fetch(catalogItem.downloadUrl);
        if (!response.ok) {
            throw new Error(`Error al descargar pack (${response.status}): ${response.statusText}`);
        }

        const blob = await response.blob();
        return this.installZipFile(blob, {
            name: catalogItem.name,
            onProgress
        });
    }

    /**
     * Export all locally cached assets (Blobs from IndexedDB) as a .ZIP backup
     */
    public static async exportLocalAssetsZip(): Promise<Blob | null> {
        const records = await ResourceCache.getAllStoredBlobs();
        const blobRecords = records.filter(r => r.blob);
        if (blobRecords.length === 0) return null;

        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        for (const rec of blobRecords) {
            if (!rec.blob) continue;
            const folderName =
                rec.type === 'player-face' ? 'players' :
                    rec.type === 'competition-logo' || rec.type === 'league-logo' ? 'competitions' :
                        rec.type === 'trophy' ? 'trophies' :
                            rec.type === 'flag' ? 'flags' :
                                'teams';
            const ext = rec.mimeType?.includes('svg') ? 'svg' : rec.mimeType?.includes('webp') ? 'webp' : 'png';
            zip.folder(folderName)?.file(`${rec.identifier}.${ext}`, rec.blob);
        }

        return zip.generateAsync({ type: 'blob' });
    }

    public static hasUpdate(installedPack: InstalledPack, catalogItem: PackCatalogItem): boolean {
        if (!installedPack || !catalogItem) return false;
        return this.isNewerVersion(installedPack.version, catalogItem.version);
    }

    public static isNewerVersion(installed: string, available: string): boolean {
        const parse = (v: string) => v.split('.').map(n => parseInt(n, 10) || 0);
        const [iMaj, iMin, iPatch] = parse(installed);
        const [aMaj, aMin, aPatch] = parse(available);

        if (aMaj > iMaj) return true;
        if (aMaj === iMaj && aMin > iMin) return true;
        if (aMaj === iMaj && aMin === iMin && aPatch > iPatch) return true;
        return false;
    }
}

if (typeof window !== 'undefined') {
    PackManager.init().catch(console.error);
}
