/**
 * RESOURCE SYSTEM: Pack Resolver
 * 
 * Cascading resolution engine.
 * Priority: Installed & Enabled Packs (by priority DESC) -> Default CDN Provider -> Zero-network Fallback.
 */

import { ResourceType, ResourceResolution, InstalledPack } from './ResourceTypes';
import { ResourceCache } from './ResourceCache';
import { ResourceFallback } from './ResourceFallback';
import { DefaultResourceProvider } from './providers/DefaultResourceProvider';

export class PackResolver {
    /**
     * Resolve any resource dynamically
     */
    public static resolve(
        type: ResourceType,
        identifier: string | number,
        installedPacks: InstalledPack[],
        extraMeta?: any
    ): ResourceResolution {
        const idStr = String(identifier || '').trim();
        if (!idStr) {
            return {
                url: ResourceFallback.forType(type, identifier, extraMeta),
                source: 'fallback',
                isFallback: true
            };
        }

        const cacheKey = ResourceCache.makeKey(type, idStr);

        // 1. Check in-memory hot cache
        const cachedUrl = ResourceCache.getFromMemory(cacheKey);
        if (cachedUrl) {
            return {
                url: cachedUrl,
                source: 'installed-pack',
                isFallback: false
            };
        }

        // 2. Query Installed & Enabled Packs sorted by priority (Descending)
        const activePacks = installedPacks
            .filter(p => p.enabled)
            .sort((a, b) => b.priority - a.priority);

        for (const pack of activePacks) {
            const assetRelativePath = this.getAssetFromManifest(pack, type, idStr, extraMeta);
            if (assetRelativePath) {
                // Local IndexedDB-backed pack asset (imported ZIP)
                if (pack.manifest.baseUrl?.startsWith('idb://')) {
                    const blobKeyId = assetRelativePath.split('/').pop()?.replace(/\.[^.]+$/, '') || assetRelativePath;
                    const altCompType: ResourceType | null =
                        type === 'league-logo' ? 'competition-logo' :
                            type === 'competition-logo' ? 'league-logo' : null;
                    const blobUrl =
                        ResourceCache.getPackBlobUrl(pack.packId, type, blobKeyId) ||
                        ResourceCache.getPackBlobUrl(pack.packId, type, idStr) ||
                        (altCompType ? ResourceCache.getPackBlobUrl(pack.packId, altCompType, blobKeyId) : undefined) ||
                        (altCompType ? ResourceCache.getPackBlobUrl(pack.packId, altCompType, idStr) : undefined);
                    if (blobUrl) {
                        ResourceCache.setInMemory(cacheKey, blobUrl);
                        return {
                            url: blobUrl,
                            source: 'installed-pack',
                            packId: pack.packId,
                            isFallback: false
                        };
                    }
                }

                // If it's already an absolute URL or data URI
                if (assetRelativePath.startsWith('http://') || assetRelativePath.startsWith('https://') || assetRelativePath.startsWith('data:')) {
                    ResourceCache.setInMemory(cacheKey, assetRelativePath);
                    return {
                        url: assetRelativePath,
                        source: 'installed-pack',
                        packId: pack.packId,
                        isFallback: false
                    };
                }

                // If pack has a baseUrl or CDN base
                const baseUrl = pack.manifest.baseUrl || '';
                const fullUrl = baseUrl ? `${baseUrl}/${assetRelativePath}` : assetRelativePath;
                ResourceCache.setInMemory(cacheKey, fullUrl);
                return {
                    url: fullUrl,
                    source: 'installed-pack',
                    packId: pack.packId,
                    isFallback: false
                };
            }

            // Scoped modular bundle resolution (Option 1 catalog packs)
            const bundleKey = pack.manifest.bundleKey || pack.packId;
            const bundledRes = DefaultResourceProvider.resolveForBundle(bundleKey, type, idStr, extraMeta);
            if (bundledRes) {
                ResourceCache.setInMemory(cacheKey, bundledRes.url);
                return {
                    ...bundledRes,
                    source: 'installed-pack',
                    packId: pack.packId,
                };
            }
        }

        // 3. Query Default Built-in Community Provider ONLY in non-browser tests or explicit legacy flag when no modular packs manage state
        if (this.isCommunityActive(installedPacks)) {
            const defaultResolution = this.queryDefaultProvider(type, idStr, extraMeta);
            if (defaultResolution) {
                ResourceCache.setInMemory(cacheKey, defaultResolution.url);
                return defaultResolution;
            }
        }

        // 4. Zero-network Fallback (Guaranteed to return a valid vector image)
        const fallbackUrl = ResourceFallback.forType(type, idStr, extraMeta);
        return {
            url: fallbackUrl,
            source: 'fallback',
            isFallback: true
        };
    }

    /**
     * Match identifier in a specific pack's manifest
     */
    private static getAssetFromManifest(
        pack: InstalledPack,
        type: ResourceType,
        identifier: string,
        meta?: any
    ): string | undefined {
        const assets = pack.manifest.assets;
        if (!assets) return undefined;

        switch (type) {
            case 'player-face': {
                if (!assets.players) return undefined;
                if (assets.players[identifier]) return assets.players[identifier];
                if (meta?.name) {
                    const norm = meta.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
                    if (assets.players[norm]) return assets.players[norm];
                    const parts = meta.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().split(/\s+/);
                    const lastName = parts.length > 1 ? parts[parts.length - 1].replace(/[^a-z0-9]/g, '') : '';
                    if (lastName && assets.players[lastName]) return assets.players[lastName];
                }
                return undefined;
            }
            case 'team-logo': {
                if (!assets.teams) return undefined;
                if (assets.teams[identifier]) return assets.teams[identifier];
                if (meta?.name) {
                    const rawSlug = meta.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
                    if (assets.teams[rawSlug]) return assets.teams[rawSlug];
                    const stripped = meta.name
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\b(club|atletico|deportivo|sporting|futbol|fc|cf|sc|afc|cd|ca|de|la|el|los|las|the)\b/gi, '')
                        .replace(/[^a-z0-9]/g, '');
                    if (stripped && assets.teams[stripped]) return assets.teams[stripped];
                }
                if (meta?.shortName) {
                    const shortSlug = meta.shortName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
                    if (assets.teams[shortSlug]) return assets.teams[shortSlug];
                }
                return undefined;
            }
            case 'league-logo':
            case 'competition-logo': {
                const primary = type === 'league-logo' ? assets.leagues : assets.competitions;
                const secondary = type === 'league-logo' ? assets.competitions : assets.leagues;
                const idLower = identifier.toLowerCase();
                const idSlug = idLower.replace(/[^a-z0-9]/g, '');
                const cleanName = meta?.name ? meta.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') : '';
                for (const dict of [primary, secondary]) {
                    if (!dict) continue;
                    const hit = dict[identifier] || dict[idLower] || dict[idSlug] || (cleanName ? dict[cleanName] : undefined);
                    if (hit) return hit;
                }
                return undefined;
            }
            case 'trophy': {
                if (!assets.trophies) return undefined;
                const cleanName = meta?.name ? meta.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') : '';
                return assets.trophies[identifier] || assets.trophies[identifier.toLowerCase()] || (cleanName ? assets.trophies[cleanName] : undefined);
            }
            case 'flag': {
                if (!assets.flags) return undefined;
                const cleanSlug = identifier.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
                return assets.flags[identifier.toUpperCase()] || assets.flags[identifier.toLowerCase()] || assets.flags[cleanSlug];
            }
            case 'kit': {
                if (!assets.kits) return undefined;
                return assets.kits[identifier];
            }
            case 'stadium': {
                if (!assets.stadiums) return undefined;
                return assets.stadiums[identifier];
            }
            case 'manager': {
                if (!assets.managers) return undefined;
                return assets.managers[identifier];
            }
            default:
                return undefined;
        }
    }

    /**
     * Check if community content is active (Base Mode vs Modular Community Packs).
     * When modular packs are managed in the browser, per-pack enable state controls resolution.
     */
    private static isCommunityActive(installedPacks: InstalledPack[] = []): boolean {
        if (typeof window === 'undefined') return true;
        if (installedPacks.length > 0) return false;
        try {
            return localStorage.getItem('apex_community_packs_active') === 'true';
        } catch {
            return false;
        }
    }

    /**
     * Dispatch to Default Built-in Provider
     */
    private static queryDefaultProvider(type: ResourceType, identifier: string, meta?: any): ResourceResolution | null {
        switch (type) {
            case 'team-logo':
                return DefaultResourceProvider.resolveTeamLogo(identifier, meta);
            case 'competition-logo':
            case 'league-logo':
                return DefaultResourceProvider.resolveCompetitionLogo(identifier, meta?.name);
            case 'player-face':
                return DefaultResourceProvider.resolvePlayerFace(identifier, meta);
            case 'flag':
                return DefaultResourceProvider.resolveCountryFlag(identifier);
            case 'trophy':
                return DefaultResourceProvider.resolveTrophy(identifier, meta?.name);
            default:
                return null;
        }
    }
}
