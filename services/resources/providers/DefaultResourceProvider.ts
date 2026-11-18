/**
 * RESOURCE SYSTEM: Default Resource Provider
 * 
 * Provides built-in resolution for core clubs, tournaments, and community assets.
 * Backed by the official community data repository CDN without third-party web scraping.
 */

import { ResourceType, ResourceResolution } from '../ResourceTypes';
import { ResourceFallback } from '../ResourceFallback';
import { ARG_CLUB_LOGOS_BY_ID, ARG_CLUB_LOGOS_BY_NAME, ARG_COMPETITION_LOGOS, COMMUNITY_PACK_CDN } from '../../customPacks/argentineLogos';
import { PLAYER_PHOTOS_BY_ID, PLAYER_PHOTOS_BY_NAME } from '../../customPacks/playerPhotos';

export class DefaultResourceProvider {
    public static readonly ID = 'default-official-provider';
    private static readonly BASE_CDN = COMMUNITY_PACK_CDN;

    /**
     * Resolve Team Logo
     */
    public static resolveTeamLogo(teamId: number | string, meta?: { name?: string; logo?: string; primaryColor?: string; secondaryColor?: string }): ResourceResolution | null {
        // 1. Direct ID in ARG_CLUB_LOGOS_BY_ID
        const directLogo = ARG_CLUB_LOGOS_BY_ID[teamId] || (typeof teamId === 'number' ? ARG_CLUB_LOGOS_BY_ID[String(teamId)] : undefined);
        if (directLogo) {
            return {
                url: directLogo,
                source: 'builtin-cdn',
                packId: this.ID,
                isFallback: false
            };
        }

        // 2. By name (checking raw, normalized, and slug)
        if (meta?.name) {
            const rawLower = meta.name.toLowerCase().trim();
            const cleanNorm = rawLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const cleanSlug = cleanNorm.replace(/[^a-z0-9]/g, '');

            const fromName = ARG_CLUB_LOGOS_BY_NAME[rawLower] 
                || ARG_CLUB_LOGOS_BY_NAME[cleanNorm] 
                || ARG_CLUB_LOGOS_BY_NAME[cleanSlug]
                || ARG_CLUB_LOGOS_BY_ID[cleanSlug];

            if (fromName) {
                return {
                    url: fromName,
                    source: 'builtin-cdn',
                    packId: this.ID,
                    isFallback: false
                };
            }
        }

        // 3. Fallback to valid meta.logo if provided (and not hotlinked third-party scraper)
        if (meta?.logo && typeof meta.logo === 'string' && meta.logo.trim() !== '') {
            return {
                url: meta.logo,
                source: 'builtin-cdn',
                packId: this.ID,
                isFallback: false
            };
        }

        return null;
    }

    /**
     * Resolve Competition / League Logo
     */
    public static resolveCompetitionLogo(competitionId: string, name?: string): ResourceResolution | null {
        const normalized = competitionId.toUpperCase().replace(/[-\s]/g, '_');
        const fromMap = ARG_COMPETITION_LOGOS[normalized] || ARG_COMPETITION_LOGOS[competitionId.toLowerCase()];
        if (fromMap) {
            return {
                url: fromMap,
                source: 'builtin-cdn',
                packId: this.ID,
                isFallback: false
            };
        }

        if (name) {
            const cleanName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_');
            const fromName = ARG_COMPETITION_LOGOS[cleanName];
            if (fromName) {
                return {
                    url: fromName,
                    source: 'builtin-cdn',
                    packId: this.ID,
                    isFallback: false
                };
            }
        }

        return null;
    }

    /**
     * Resolve Player Face
     * Serves through community pack CDN / real photos without third-party scraping.
     */
    public static resolvePlayerFace(playerId: number | string, meta?: { name?: string; photo?: string }): ResourceResolution | null {
        const numId = Number(playerId);

        // 1. Check PLAYER_PHOTOS_BY_ID
        if (!isNaN(numId) && numId > 0) {
            const photoById = PLAYER_PHOTOS_BY_ID[numId] || (PLAYER_PHOTOS_BY_ID as Record<string, string>)[String(numId)];
            if (photoById) {
                return {
                    url: photoById,
                    source: 'builtin-cdn',
                    packId: this.ID,
                    isFallback: false
                };
            }
        }

        // 2. Check PLAYER_PHOTOS_BY_NAME
        if (meta?.name) {
            const rawLower = meta.name.toLowerCase().trim();
            const cleanNorm = rawLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const photoByName = PLAYER_PHOTOS_BY_NAME[rawLower] || PLAYER_PHOTOS_BY_NAME[cleanNorm];
            if (photoByName) {
                return {
                    url: photoByName,
                    source: 'builtin-cdn',
                    packId: this.ID,
                    isFallback: false
                };
            }
        }

        // 3. Valid meta.photo if provided (and not a fallback/broken placeholder)
        if (meta?.photo && typeof meta.photo === 'string' && meta.photo.trim() !== '' && meta.photo !== '/sinrostro.png' && !meta.photo.includes('fotmob.com/image_resources/playerimages/0.')) {
            return {
                url: meta.photo,
                source: 'builtin-cdn',
                packId: this.ID,
                isFallback: false
            };
        }

        return null;
    }

    /**
     * Resolve Country Flag
     */
    public static resolveCountryFlag(countryCode: string): ResourceResolution | null {
        const code = countryCode.trim().toUpperCase();
        const ISO_MAP: Record<string, string> = {
            ARG: 'ar', AR: 'ar',
            ENG: 'gb-eng', GBR: 'gb', UK: 'gb',
            ESP: 'es', ES: 'es',
            GER: 'de', DE: 'de',
            ITA: 'it', IT: 'it',
            FRA: 'fr', FR: 'fr',
            BRA: 'br', BR: 'br',
            PAR: 'py', PY: 'py',
            MEX: 'mx', MX: 'mx',
            CHI: 'cl', CL: 'cl',
            COL: 'co', CO: 'co',
            URU: 'uy', UY: 'uy',
            USA: 'us', US: 'us',
            POR: 'pt', PT: 'pt',
            NED: 'nl', NL: 'nl'
        };

        const iso = ISO_MAP[code];
        if (iso) {
            // Using standard SVG flag CDN from flagcdn.com (established standard)
            return {
                url: `https://flagcdn.com/${iso}.svg`,
                source: 'builtin-cdn',
                packId: this.ID,
                isFallback: false
            };
        }

        return null;
    }

    /**
     * Resolve Trophy Image
     */
    public static resolveTrophy(competitionId: string): ResourceResolution | null {
        const normalized = competitionId.toLowerCase().replace(/[^a-z0-9]/g, '_');
        // If trophy asset exists in tournament logos
        const compLogo = this.resolveCompetitionLogo(competitionId);
        if (compLogo) {
            return {
                url: compLogo.url,
                source: 'builtin-cdn',
                packId: this.ID,
                isFallback: false
            };
        }
        return null;
    }
}
