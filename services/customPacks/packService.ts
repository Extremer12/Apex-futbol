import JSZip from 'jszip';
import { StoredAsset, saveStoredAssetsBatch, getAllStoredAssets, clearAllStoredAssets, getStoredAssetsCount } from './storage';
import { normalizeKey, getTeamMatchKeys, getCompetitionMatchKeys } from './matcher';

import { ARG_CLUB_LOGOS_BY_ID, ARG_CLUB_LOGOS_BY_NAME, ARG_COMPETITION_LOGOS } from './argentineLogos';

export type PackUpdateListener = () => void;

class CustomPacksService {
    private inMemoryAssets: Map<string, string> = new Map(); // key -> objectURL or direct URL
    private listeners: Set<PackUpdateListener> = new Set();
    private isInitialized = false;

    public subscribe(listener: PackUpdateListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(fn => fn());
    }

    public isArgentinePackActive(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem('apex_pack_argentine_active') === 'true';
        } catch {
            return false;
        }
    }

    public setArgentinePackActive(active: boolean): void {
        if (typeof window === 'undefined') return;
        try {
            if (active) {
                localStorage.setItem('apex_pack_argentine_active', 'true');
                localStorage.setItem('apex_pack_otros_arg_active', 'true');
            } else {
                localStorage.removeItem('apex_pack_argentine_active');
                localStorage.removeItem('apex_pack_otros_arg_active');
            }
        } catch (e) {
            console.error('Failed to save pack state:', e);
        }
        this.notifyListeners();
    }

    public isOtrosArgentinaPackActive(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem('apex_pack_otros_arg_active') === 'true' || localStorage.getItem('apex_pack_argentine_active') === 'true';
        } catch {
            return false;
        }
    }

    public setOtrosArgentinaPackActive(active: boolean): void {
        if (typeof window === 'undefined') return;
        try {
            if (active) {
                localStorage.setItem('apex_pack_otros_arg_active', 'true');
            } else {
                localStorage.removeItem('apex_pack_otros_arg_active');
            }
        } catch (e) {
            console.error('Failed to save otros arg pack state:', e);
        }
        this.notifyListeners();
    }

    public isEnglishPackActive(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem('apex_pack_english_active') === 'true';
        } catch {
            return false;
        }
    }

    public setEnglishPackActive(active: boolean): void {
        if (typeof window === 'undefined') return;
        try {
            if (active) {
                localStorage.setItem('apex_pack_english_active', 'true');
            } else {
                localStorage.removeItem('apex_pack_english_active');
            }
        } catch (e) {
            console.error('Failed to save english pack state:', e);
        }
        this.notifyListeners();
    }

    public isItalianPackActive(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem('apex_pack_italian_active') === 'true';
        } catch {
            return false;
        }
    }

    public setItalianPackActive(active: boolean): void {
        if (typeof window === 'undefined') return;
        try {
            if (active) {
                localStorage.setItem('apex_pack_italian_active', 'true');
            } else {
                localStorage.removeItem('apex_pack_italian_active');
            }
        } catch (e) {
            console.error('Failed to save italian pack state:', e);
        }
        this.notifyListeners();
    }

    public isSpanishPackActive(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem('apex_pack_spanish_active') === 'true';
        } catch {
            return false;
        }
    }

    public setSpanishPackActive(active: boolean): void {
        if (typeof window === 'undefined') return;
        try {
            if (active) {
                localStorage.setItem('apex_pack_spanish_active', 'true');
            } else {
                localStorage.removeItem('apex_pack_spanish_active');
            }
        } catch (e) {
            console.error('Failed to save spanish pack state:', e);
        }
        this.notifyListeners();
    }

    public isBrazilianPackActive(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem('apex_pack_brazilian_active') === 'true';
        } catch {
            return false;
        }
    }

    public setBrazilianPackActive(active: boolean): void {
        if (typeof window === 'undefined') return;
        try {
            if (active) {
                localStorage.setItem('apex_pack_brazilian_active', 'true');
            } else {
                localStorage.removeItem('apex_pack_brazilian_active');
            }
        } catch (e) {
            console.error('Failed to save brazilian pack state:', e);
        }
        this.notifyListeners();
    }

    public isGermanPackActive(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem('apex_pack_german_active') === 'true';
        } catch {
            return false;
        }
    }

    public setGermanPackActive(active: boolean): void {
        if (typeof window === 'undefined') return;
        try {
            if (active) {
                localStorage.setItem('apex_pack_german_active', 'true');
            } else {
                localStorage.removeItem('apex_pack_german_active');
            }
        } catch (e) {
            console.error('Failed to save german pack state:', e);
        }
        this.notifyListeners();
    }

    public isFrenchPackActive(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem('apex_pack_french_active') === 'true';
        } catch {
            return false;
        }
    }

    public setFrenchPackActive(active: boolean): void {
        if (typeof window === 'undefined') return;
        try {
            if (active) {
                localStorage.setItem('apex_pack_french_active', 'true');
            } else {
                localStorage.removeItem('apex_pack_french_active');
            }
        } catch (e) {
            console.error('Failed to save french pack state:', e);
        }
        this.notifyListeners();
    }

    public isParaguayPackActive(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem('apex_pack_paraguay_active') === 'true';
        } catch {
            return false;
        }
    }

    public setParaguayPackActive(active: boolean): void {
        if (typeof window === 'undefined') return;
        try {
            if (active) {
                localStorage.setItem('apex_pack_paraguay_active', 'true');
            } else {
                localStorage.removeItem('apex_pack_paraguay_active');
            }
        } catch (e) {
            console.error('Failed to save paraguay pack state:', e);
        }
        this.notifyListeners();
    }

    public isCompetitionsPackActive(): boolean {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem('apex_pack_competitions_active') === 'true';
        } catch {
            return false;
        }
    }

    public setCompetitionsPackActive(active: boolean): void {
        if (typeof window === 'undefined') return;
        try {
            if (active) {
                localStorage.setItem('apex_pack_competitions_active', 'true');
            } else {
                localStorage.removeItem('apex_pack_competitions_active');
            }
        } catch (e) {
            console.error('Failed to save competitions pack state:', e);
        }
        this.notifyListeners();
    }

    public async init(): Promise<void> {
        if (this.isInitialized) return;
        await this.reloadCache();
        this.isInitialized = true;
    }

    public async reloadCache(): Promise<void> {
        // Revoke previous blob URLs to prevent memory leaks
        this.inMemoryAssets.forEach((url) => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        this.inMemoryAssets.clear();

        const stored = await getAllStoredAssets();
        for (const item of stored) {
            if (item.blob) {
                const objectUrl = URL.createObjectURL(item.blob);
                this.inMemoryAssets.set(item.id, objectUrl);
            } else if (item.url) {
                this.inMemoryAssets.set(item.id, item.url);
            }
        }
        this.notifyListeners();
    }

    public getCustomLogo(category: 'teams' | 'competitions' | 'players', keys: string[]): string | undefined {
        for (const k of keys) {
            const id = `${category}:${k}`;
            const found = this.inMemoryAssets.get(id);
            if (found) return found;
        }
        return undefined;
    }

    public resolveTeamLogo(team?: { id?: number | string; name?: string; shortName?: string; logo?: string }): string | undefined {
        if (!team) return undefined;
        const keys = getTeamMatchKeys(team);
        const custom = this.getCustomLogo('teams', keys);
        if (custom) return custom;

        // 1. Direct lookup by ID in built-in data packs
        if (team.id !== undefined && team.id !== null) {
            if (ARG_CLUB_LOGOS_BY_ID[team.id]) {
                return ARG_CLUB_LOGOS_BY_ID[team.id];
            }
        }

        // 2. Direct lookup by team name in built-in data packs
        if (team.name) {
            const norm = normalizeKey(team.name);
            if (norm && ARG_CLUB_LOGOS_BY_NAME[norm]) {
                return ARG_CLUB_LOGOS_BY_NAME[norm];
            }
            const lower = team.name.toLowerCase().trim();
            if (ARG_CLUB_LOGOS_BY_NAME[lower]) {
                return ARG_CLUB_LOGOS_BY_NAME[lower];
            }
        }

        // 3. Fallback to team's explicit logo field
        if (team.logo && team.logo.trim().length > 0) {
            return team.logo;
        }

        return undefined;
    }

    public resolveCompetitionLogo(competitionId: string, name?: string, defaultLogo?: string): string | undefined {
        const keys = getCompetitionMatchKeys(competitionId, name);
        const custom = this.getCustomLogo('competitions', keys);
        if (custom) return custom;

        if (ARG_COMPETITION_LOGOS[competitionId]) {
            return ARG_COMPETITION_LOGOS[competitionId];
        }
        const norm = normalizeKey(competitionId);
        if (ARG_COMPETITION_LOGOS[norm]) {
            return ARG_COMPETITION_LOGOS[norm];
        }
        if (name) {
            const nameNorm = normalizeKey(name);
            if (ARG_COMPETITION_LOGOS[nameNorm]) {
                return ARG_COMPETITION_LOGOS[nameNorm];
            }
        }

        return defaultLogo || undefined;
    }

    public resolvePlayerPhoto(player?: { id?: number | string; name?: string; photo?: string }): string {
        if (!player) return '/sinrostro.png';
        const keys: string[] = [];
        if (player.id !== undefined && player.id !== null) {
            keys.push(String(player.id));
        }
        if (player.name) {
            keys.push(normalizeKey(player.name));
            keys.push(player.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
        }
        const custom = this.getCustomLogo('players', keys);
        if (custom) return custom;
        return player.photo || '/sinrostro.png';
    }

    /**
     * Import a .ZIP file containing folders like /teams/, /competitions/, /players/
     */
    public async importZipPack(
        file: File | Blob,
        onProgress?: (progressPercent: number, statusText: string) => void
    ): Promise<{ importedCount: number; errors: string[] }> {
        onProgress?.(5, 'Leyendo archivo ZIP...');
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);

        const assetsToSave: StoredAsset[] = [];
        const errors: string[] = [];
        const entries = Object.keys(loadedZip.files).filter(path => !loadedZip.files[path].dir);
        const totalFiles = entries.length;

        if (totalFiles === 0) {
            throw new Error('El archivo ZIP está vacío o no contiene imágenes válidas.');
        }

        let processed = 0;

        for (const filePath of entries) {
            processed++;
            const pct = Math.round(10 + (processed / totalFiles) * 75);
            onProgress?.(pct, `Procesando (${processed}/${totalFiles}): ${filePath.split('/').pop()}`);

            const zipEntry = loadedZip.files[filePath];
            const lowerPath = filePath.toLowerCase();

            // Validate image extension (.png, .svg, .jpg, .jpeg, .webp, .gif)
            if (!/\.(png|jpg|jpeg|svg|webp|gif)$/i.test(lowerPath)) {
                continue;
            }

            // Determine category from folder path
            let category: 'teams' | 'competitions' | 'players' = 'teams';
            if (lowerPath.includes('competition') || lowerPath.includes('competitions') || lowerPath.includes('leagues') || lowerPath.includes('cups') || lowerPath.includes('copas')) {
                category = 'competitions';
            } else if (lowerPath.includes('player') || lowerPath.includes('players') || lowerPath.includes('jugadores')) {
                category = 'players';
            }

            // Extract file name without directory (e.g. logos/spain/la-liga/barcelona.png -> barcelona.png)
            const fileName = filePath.split('/').pop() || filePath;
            const normalizedIdentifier = normalizeKey(fileName);
            const rawSlug = fileName.toLowerCase().replace(/\.(png|jpg|jpeg|svg|webp|gif)$/i, '').replace(/[^a-z0-9]/g, '');

            if (!normalizedIdentifier && !rawSlug) {
                errors.push(`No se pudo normalizar el nombre del archivo: ${filePath}`);
                continue;
            }

            try {
                const blob = await zipEntry.async('blob');
                const now = Date.now();
                const mimeType = lowerPath.endsWith('.svg') 
                    ? 'image/svg+xml' 
                    : lowerPath.endsWith('.webp')
                    ? 'image/webp'
                    : lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')
                    ? 'image/jpeg'
                    : 'image/png';

                // Save by normalized identifier
                if (normalizedIdentifier) {
                    assetsToSave.push({
                        id: `${category}:${normalizedIdentifier}`,
                        category,
                        identifier: normalizedIdentifier,
                        blob,
                        mimeType,
                        updatedAt: now
                    });
                }

                // Also save by raw slug if different (for max compatibility)
                if (rawSlug && rawSlug !== normalizedIdentifier) {
                    assetsToSave.push({
                        id: `${category}:${rawSlug}`,
                        category,
                        identifier: rawSlug,
                        blob,
                        mimeType,
                        updatedAt: now
                    });
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                errors.push(`Error al leer archivo ${filePath}: ${message}`);
            }
        }

        onProgress?.(90, 'Guardando en almacenamiento local del dispositivo...');
        await saveStoredAssetsBatch(assetsToSave);

        onProgress?.(98, 'Actualizando interfaz...');
        await this.reloadCache();

        onProgress?.(100, '¡Pack importado exitosamente!');
        return { importedCount: assetsToSave.length, errors };
    }

    /**
     * Download with automatic CORS fallback
     */
    private async fetchBlobWithFallback(
        url: string,
        onDownloadProgress?: (mb: string, totalMb: string, pct: number) => void
    ): Promise<Blob> {
        const candidateUrls = [
            url,
            `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        ];

        let lastError: Error | null = null;

        for (let i = 0; i < candidateUrls.length; i++) {
            const currentUrl = candidateUrls[i];
            try {
                const response = await fetch(currentUrl);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const contentLength = +(response.headers.get('Content-Length') || 0);

                if (response.body && contentLength > 0) {
                    const reader = response.body.getReader();
                    const chunks: Uint8Array[] = [];
                    let receivedLength = 0;

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        chunks.push(value);
                        receivedLength += value.length;
                        const pct = Math.min(45, Math.round((receivedLength / contentLength) * 45));
                        const mb = (receivedLength / (1024 * 1024)).toFixed(1);
                        const totalMb = (contentLength / (1024 * 1024)).toFixed(1);
                        onDownloadProgress?.(mb, totalMb, pct);
                    }

                    return new Blob(chunks);
                } else {
                    return await response.blob();
                }
            } catch (err: unknown) {
                const errorObj = err instanceof Error ? err : new Error(String(err));
                console.warn(`Fetch candidate ${i + 1} (${currentUrl}) failed:`, errorObj);
                lastError = errorObj;
            }
        }

        throw new Error(
            `No se pudo descargar automáticamente el archivo desde GitHub (${lastError?.message || 'CORS / Network Error'}). Puedes descargar el .zip desde tu navegador y cargarlo aquí abajo.`
        );
    }

    /**
     * Download and Import a remote .ZIP file pack
     */
    public async downloadAndImportZipPack(
        zipUrl: string,
        onProgress?: (progressPercent: number, statusText: string) => void
    ): Promise<{ importedCount: number; errors: string[] }> {
        onProgress?.(3, 'Conectando con el repositorio del paquete...');
        
        const blob = await this.fetchBlobWithFallback(zipUrl, (mb, totalMb, pct) => {
            onProgress?.(pct, `Descargando pack (${mb}MB / ${totalMb}MB)...`);
        });

        onProgress?.(48, 'Descarga completada. Descomprimiendo escudos...');
        return await this.importZipPack(blob, (pct, status) => {
            const mappedPct = Math.min(100, Math.round(50 + (pct * 0.5)));
            onProgress?.(mappedPct, status);
        });
    }

    /**
     * Import a JSON URL Manifest
     */
    public async importUrlPack(
        manifestUrl: string,
        onProgress?: (progressPercent: number, statusText: string) => void
    ): Promise<{ importedCount: number; errors: string[] }> {
        onProgress?.(10, 'Descargando manifiesto...');
        const response = await fetch(manifestUrl);
        if (!response.ok) {
            throw new Error(`Error al conectar con la URL (${response.status}: ${response.statusText})`);
        }

        const data = await response.json();
        const assetsToSave: StoredAsset[] = [];
        const errors: string[] = [];
        const now = Date.now();

        // Supported format: { teams: { "Real Madrid": "https://...", "701": "..." }, competitions: { ... } }
        const categories: Array<'teams' | 'competitions' | 'players'> = ['teams', 'competitions', 'players'];

        for (const cat of categories) {
            const items = data[cat] || {};
            for (const [nameOrId, url] of Object.entries(items)) {
                if (typeof url !== 'string') continue;
                const normalized = normalizeKey(nameOrId);
                const rawSlug = nameOrId.toLowerCase().replace(/[^a-z0-9]/g, '');

                if (normalized) {
                    assetsToSave.push({
                        id: `${cat}:${normalized}`,
                        category: cat,
                        identifier: normalized,
                        url,
                        updatedAt: now
                    });
                }
                if (rawSlug && rawSlug !== normalized) {
                    assetsToSave.push({
                        id: `${cat}:${rawSlug}`,
                        category: cat,
                        identifier: rawSlug,
                        url,
                        updatedAt: now
                    });
                }
            }
        }

        if (assetsToSave.length === 0) {
            throw new Error('El JSON no contiene entradas válidas en los campos teams, competitions o players.');
        }

        onProgress?.(70, 'Guardando logos...');
        await saveStoredAssetsBatch(assetsToSave);
        await this.reloadCache();
        onProgress?.(100, '¡Pack remoto aplicado exitosamente!');

        return { importedCount: assetsToSave.length, errors };
    }

    /**
     * Export all custom assets to a downloadable .ZIP pack
     */
    public async exportZipPack(): Promise<Blob> {
        const stored = await getAllStoredAssets();
        const zip = new JSZip();

        for (const item of stored) {
            const folder = zip.folder(item.category) || zip;
            if (item.blob) {
                const ext = item.mimeType?.includes('svg') ? 'svg' : item.mimeType?.includes('webp') ? 'webp' : 'png';
                folder.file(`${item.identifier}.${ext}`, item.blob);
            }
        }

        return await zip.generateAsync({ type: 'blob' });
    }

    /**
     * Clear all custom packs
     */
    public async clearAllPacks(): Promise<void> {
        this.setArgentinePackActive(false);
        this.setEnglishPackActive(false);
        this.setItalianPackActive(false);
        this.setSpanishPackActive(false);
        this.setBrazilianPackActive(false);
        await clearAllStoredAssets();
        await this.reloadCache();
    }

    /**
     * Get statistics
     */
    public async getStats() {
        return await getStoredAssetsCount();
    }
}

export const customPacksService = new CustomPacksService();
// Initialize immediately in background
customPacksService.init().catch(console.error);
