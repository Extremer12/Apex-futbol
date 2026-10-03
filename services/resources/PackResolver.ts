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
        }

        // 3. Query Default Built-in Community Provider
        const defaultResolution = this.queryDefaultProvider(type, idStr, extraMeta);
        if (defaultResolution) {
            ResourceCache.setInMemory(cacheKey, defaultResolution.url);
            return defaultResolution;
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
                // Direct ID
                if (assets.players[identifier]) return assets.players[identifier];
                // Slug by name
                if (meta?.name) {
                    const slug = meta.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
                    if (assets.players[slug]) return assets.players[slug];
                }
                return undefined;
            }
            case 'team-logo': {
                if (!assets.teams) return undefined;
                // Direct ID
                if (assets.teams[identifier]) return assets.teams[identifier];
                // Slug by name
                if (meta?.name) {
                    const slug = meta.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
                    if (assets.teams[slug]) return assets.teams[slug];
                }
                return undefined;
            }
            case 'league-logo': {
                if (!assets.leagues) return undefined;
                return assets.leagues[identifier] || assets.leagues[identifier.toLowerCase()];
            }
            case 'competition-logo': {
                if (!assets.competitions) return undefined;
                return assets.competitions[identifier] || assets.competitions[identifier.toLowerCase()];
            }
            case 'trophy': {
                if (!assets.trophies) return undefined;
                return assets.trophies[identifier] || assets.trophies[identifier.toLowerCase()];
            }
            case 'flag': {
                if (!assets.flags) return undefined;
                return assets.flags[identifier.toUpperCase()] || assets.flags[identifier.toLowerCase()];
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
                return DefaultResourceProvider.resolveTrophy(identifier);
            default:
                return null;
        }
    }
}
