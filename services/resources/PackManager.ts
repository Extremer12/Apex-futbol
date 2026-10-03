/**
 * RESOURCE SYSTEM: Pack Manager
 * 
 * Manages the lifecycle of community and official packs:
 * Installation, Uninstallation, Enable/Disable, Priorities, Updates, and Zip extraction.
 */

import JSZip from 'jszip';
import { InstalledPack, PackManifest, PackCatalogItem } from './ResourceTypes';
import { PackManifestValidator } from './PackManifest';
import { ResourceCache, CachedAssetRecord } from './ResourceCache';

const STORAGE_KEY = 'apex_installed_packs_v2';

export type PackChangeListener = (packs: InstalledPack[]) => void;

export class PackManager {
    private static installedPacks: Map<string, InstalledPack> = new Map();
    private static listeners: Set<PackChangeListener> = new Set();
    private static initialized = false;

    /**
     * Subscribe to pack changes
     */
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
     * Initialize manager and load installed packs from local storage
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
    }

    /**
     * Get all installed packs
     */
    public static getInstalledPacks(): InstalledPack[] {
        return Array.from(this.installedPacks.values()).sort((a, b) => b.priority - a.priority);
    }

    /**
     * Get an installed pack by ID
     */
    public static getInstalledPack(packId: string): InstalledPack | undefined {
        return this.installedPacks.get(packId);
    }

    /**
     * Check if a pack is installed
     */
    public static isInstalled(packId: string): boolean {
        return this.installedPacks.has(packId);
    }

    /**
     * Check if an installed pack is currently active
     */
    public static isEnabled(packId: string): boolean {
        const pack = this.installedPacks.get(packId);
        return Boolean(pack && pack.enabled);
    }

    /**
     * Save installed packs state to local storage
     */
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
        this.notify();
        return true;
    }

    /**
     * Download and install a community pack ZIP
     */
    public static async downloadAndInstallZipPack(
        catalogItem: PackCatalogItem,
        onProgress?: (percent: number, status: string) => void
    ): Promise<InstalledPack> {
        if (!catalogItem.downloadUrl) {
            // If it's a remote manifest without ZIP, install manifest directly
            const resp = await fetch(catalogItem.manifestUrl);
            const manifestData = await resp.json();
            return this.installManifestPack(manifestData, catalogItem.isOfficial ? 20 : 10);
        }

        onProgress?.(10, 'Descargando paquete...');
        const response = await fetch(catalogItem.downloadUrl);
        if (!response.ok) {
            throw new Error(`Error al descargar pack (${response.status}): ${response.statusText}`);
        }

        const blob = await response.blob();
        onProgress?.(40, 'Extrayendo archivos y validando manifest...');

        const zip = await JSZip.loadAsync(blob);
        let manifest: PackManifest | null = null;

        // Find manifest.json in root or subdirectory
        for (const [filename, file] of Object.entries(zip.files)) {
            if (filename.toLowerCase().endsWith('manifest.json') && !file.dir) {
                const jsonText = await file.async('string');
                manifest = PackManifestValidator.validate(JSON.parse(jsonText));
                break;
            }
        }

        // Fallback: If no manifest was inside zip, synthesize one from catalog item
        if (!manifest) {
            manifest = PackManifestValidator.validate({
                schemaVersion: 1,
                id: catalogItem.id,
                name: catalogItem.name,
                version: catalogItem.version,
                category: catalogItem.category,
                author: catalogItem.author,
                description: catalogItem.description,
                isOfficial: catalogItem.isOfficial,
                assets: {}
            });
        }

        onProgress?.(60, 'Guardando recursos en almacenamiento local...');
        const recordsToCache: CachedAssetRecord[] = [];

        // Extract image files into cache records
        for (const [filepath, file] of Object.entries(zip.files)) {
            if (file.dir) continue;
            const lower = filepath.toLowerCase();
            if (lower.endsWith('.webp') || lower.endsWith('.png') || lower.endsWith('.svg') || lower.endsWith('.jpg')) {
                const fileBlob = await file.async('blob');
                const cleanName = filepath.split('/').pop()?.split('.')[0] || filepath;
                
                // Determine resource type by path or category
                let resType = 'misc';
                if (lower.includes('players') || lower.includes('faces')) resType = 'player-face';
                else if (lower.includes('teams') || lower.includes('clubs') || lower.includes('logos')) resType = 'team-logo';
                else if (lower.includes('competitions') || lower.includes('leagues')) resType = 'competition-logo';
                else if (lower.includes('trophies')) resType = 'trophy';
                else if (lower.includes('flags')) resType = 'flag';

                recordsToCache.push({
                    key: ResourceCache.makeKey(resType as any, cleanName),
                    type: resType as any,
                    identifier: cleanName,
                    packId: manifest.id,
                    blob: fileBlob,
                    mimeType: fileBlob.type || 'image/webp',
                    updatedAt: Date.now()
                });
            }
        }

        if (recordsToCache.length > 0) {
            await ResourceCache.putAssetsBatch(recordsToCache);
        }

        onProgress?.(90, 'Registrando pack instalado...');
        const installed = await this.installManifestPack(manifest, catalogItem.isOfficial ? 20 : 10);
        onProgress?.(100, '¡Instalación completada!');
        return installed;
    }

    /**
     * Check if an update is available for an installed pack
     */
    public static hasUpdate(installedPack: InstalledPack, catalogItem: PackCatalogItem): boolean {
        if (!installedPack || !catalogItem) return false;
        return this.isNewerVersion(installedPack.version, catalogItem.version);
    }

    /**
     * Compare semver: returns true if available > installed
     */
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

// Auto-initialize on module load in client environments
if (typeof window !== 'undefined') {
    PackManager.init().catch(console.error);
}
