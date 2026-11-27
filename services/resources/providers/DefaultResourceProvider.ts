/**
 * RESOURCE SYSTEM: Default Resource Provider
 * 
 * Provides built-in resolution for core clubs, tournaments, and community assets.
 * Backed by the official community data repository CDN without third-party web scraping.
 */

import { ResourceType, ResourceResolution } from '../ResourceTypes';
import { ResourceFallback } from '../ResourceFallback';
import { ResourceCache } from '../ResourceCache';
import { notifyPacksStore } from '../packNotifierBridge';

export const COMMUNITY_PACK_CDN = 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main';

let clubLogosById: Record<number | string, string> = {};
let clubLogosByName: Record<string, string> = {};
let competitionLogos: Record<string, string> = {};
let playerPhotosById: Record<number | string, string> = {};
let playerPhotosByName: Record<string, string> = {};
let assetsLoaded = false;
let assetsLoadPromise: Promise<void> | null = null;

export class DefaultResourceProvider {
    public static readonly ID = 'default-official-provider';
    private static readonly BASE_CDN = COMMUNITY_PACK_CDN;

    /**
     * Lazily loads the ~660 KB club logo & player face dictionaries on demand
     * so initial startup / StartScreen pays zero parse/network cost.
     */
    public static async preloadAssets(): Promise<void> {
        if (assetsLoaded) return;
        if (!assetsLoadPromise) {
            assetsLoadPromise = Promise.all([
                import('../../customPacks/argentineLogos'),
                import('../../customPacks/playerPhotos')
            ]).then(([logosMod, photosMod]) => {
                clubLogosById = logosMod.ARG_CLUB_LOGOS_BY_ID;
                clubLogosByName = logosMod.ARG_CLUB_LOGOS_BY_NAME;
                competitionLogos = logosMod.ARG_COMPETITION_LOGOS;
                playerPhotosById = photosMod.PLAYER_PHOTOS_BY_ID;
                playerPhotosByName = photosMod.PLAYER_PHOTOS_BY_NAME;
                assetsLoaded = true;
                ResourceCache.clearMemory();
                notifyPacksStore();
            }).catch((err) => {
                assetsLoadPromise = null;
                console.warn('DefaultResourceProvider: Failed to preload asset dictionaries', err);
            });
        }
        return assetsLoadPromise;
    }

    private static ensureBrowserPreload(): void {
        if (!assetsLoaded && typeof window !== 'undefined') {
            void this.preloadAssets();
        }
    }

    /**
     * Resolve Team Logo
     */
    public static resolveTeamLogo(teamId: number | string, meta?: { name?: string; logo?: string; primaryColor?: string; secondaryColor?: string }): ResourceResolution | null {
        this.ensureBrowserPreload();
        // 1. Direct ID in clubLogosById
        const directLogo = clubLogosById[teamId] || (typeof teamId === 'number' ? clubLogosById[String(teamId)] : undefined);
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

            const fromName = clubLogosByName[rawLower] 
                || clubLogosByName[cleanNorm] 
                || clubLogosByName[cleanSlug]
                || clubLogosById[cleanSlug];

            if (fromName) {
                return {
                    url: fromName,
                    source: 'builtin-cdn',
                    packId: this.ID,
                    isFallback: false
                };
            }
        }

        // 3. Fallback to valid meta.logo if provided (strictly skip hotlinked third-party scrapers or broken /logos/ paths)
        if (
            meta?.logo &&
            typeof meta.logo === 'string' &&
            meta.logo.trim() !== '' &&
            !meta.logo.includes('tmssl.akamaized.net') &&
            !meta.logo.startsWith('/logos/') &&
            !meta.logo.includes('/sinlogo.png')
        ) {
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
        this.ensureBrowserPreload();
        const normalized = competitionId.toUpperCase().replace(/[-\s]/g, '_');
        const fromMap = competitionLogos[normalized] || competitionLogos[competitionId.toLowerCase()];
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
            const fromName = competitionLogos[cleanName];
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
        this.ensureBrowserPreload();
        const numId = Number(playerId);

        // 1. Check playerPhotosById
        if (!isNaN(numId) && numId > 0) {
            const photoById = playerPhotosById[numId] || (playerPhotosById as Record<string, string>)[String(numId)];
            if (photoById) {
                return {
                    url: photoById,
                    source: 'builtin-cdn',
                    packId: this.ID,
                    isFallback: false
                };
            }
        }

        // 2. Check playerPhotosByName
        if (meta?.name) {
            const rawLower = meta.name.toLowerCase().trim();
            const cleanNorm = rawLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const photoByName = playerPhotosByName[rawLower] || playerPhotosByName[cleanNorm];
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
     * Resolve Country Flag (supports ISO codes and country names)
     */
    public static resolveCountryFlag(countryCodeOrName: string): ResourceResolution | null {
        const raw = (countryCodeOrName || '').trim();
        if (!raw) return null;
        const clean = raw
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        const ISO_MAP: Record<string, string> = {
            ARG: 'ar', AR: 'ar', ARGENTINA: 'ar',
            ENG: 'gb-eng', INGLATERRA: 'gb-eng', ENGLAND: 'gb-eng',
            GBR: 'gb', UK: 'gb',
            SCO: 'gb-sct', ESCOCIA: 'gb-sct', SCOTLAND: 'gb-sct',
            ESP: 'es', ES: 'es', ESPANA: 'es', SPAIN: 'es',
            GER: 'de', DE: 'de', ALEMANIA: 'de', GERMANY: 'de',
            ITA: 'it', IT: 'it', ITALIA: 'it', ITALY: 'it',
            FRA: 'fr', FR: 'fr', FRANCIA: 'fr', FRANCE: 'fr',
            BRA: 'br', BR: 'br', BRASIL: 'br', BRAZIL: 'br',
            PAR: 'py', PY: 'py', PARAGUAY: 'py',
            MEX: 'mx', MX: 'mx', MEXICO: 'mx',
            CHI: 'cl', CL: 'cl', CHILE: 'cl',
            COL: 'co', CO: 'co', COLOMBIA: 'co',
            URU: 'uy', UY: 'uy', URUGUAY: 'uy',
            ECU: 'ec', EC: 'ec', ECUADOR: 'ec',
            BOL: 'bo', BO: 'bo', BOLIVIA: 'bo',
            PER: 'pe', PE: 'pe', PERU: 'pe',
            VEN: 've', VE: 've', VENEZUELA: 've',
            USA: 'us', US: 'us',
            POR: 'pt', PT: 'pt', PORTUGAL: 'pt',
            NED: 'nl', NL: 'nl', 'PAISES BAJOS': 'nl', NETHERLANDS: 'nl', HOLANDA: 'nl',
            AUT: 'at', AT: 'at', AUSTRIA: 'at',
            BEL: 'be', BE: 'be', BELGICA: 'be',
        };

        const iso = ISO_MAP[clean];
        if (iso) {
            return {
                url: `https://flagcdn.com/${iso}.svg`,
                source: 'builtin-cdn',
                packId: this.ID,
                isFallback: false
            };
        }

        return null;
    }

    public static readonly COMMUNITY_TROPHIES: Record<string, string> = {
        champions_league: `${COMMUNITY_PACK_CDN}/Football%20Tournament%20%26%20Competition%20Logos/tournaments_uefa-champions-league.football-logos.cc.svg`,
        europa_league: `${COMMUNITY_PACK_CDN}/Football%20Tournament%20%26%20Competition%20Logos/tournaments_uefa-europa-league.football-logos.cc.svg`,
        copa_libertadores: `${COMMUNITY_PACK_CDN}/Football%20Tournament%20%26%20Competition%20Logos/tournaments_conmebol-libertadores.football-logos.cc.svg`,
        copa_sudamericana: `${COMMUNITY_PACK_CDN}/Football%20Tournament%20%26%20Competition%20Logos/tournaments_conmebol-copa-sudamericana.football-logos.cc.svg`,
        recopa_sudamericana: `${COMMUNITY_PACK_CDN}/Football%20Tournament%20%26%20Competition%20Logos/tournaments_conmebol-recopa-sudamericana.football-logos.cc.svg`,
        copa_intercontinental: `${COMMUNITY_PACK_CDN}/Football%20Tournament%20%26%20Competition%20Logos/tournaments_fifa-intercontinental-cup.football-logos.cc.svg`,
        club_world_cup: `${COMMUNITY_PACK_CDN}/Football%20Tournament%20%26%20Competition%20Logos/tournaments_fifa-club-world-cup.football-logos.cc.svg`,
        copa_argentina: `${COMMUNITY_PACK_CDN}/Football%20Tournament%20%26%20Competition%20Logos/tournaments_copa-argentina.football-logos.cc.svg`,
        liga_argentina: `${COMMUNITY_PACK_CDN}/Argentina/primera_division/argentina_argentina-primera-division.football-logos.cc.svg`,
        primera_nacional: `${COMMUNITY_PACK_CDN}/Argentina/primera_nacional/argentina_primera-nacional.football-logos.cc.svg`,
        premier_league: `${COMMUNITY_PACK_CDN}/Premier%20League/england_english-premier-league.football-logos.cc.svg`,
        championship: `${COMMUNITY_PACK_CDN}/Championship/england_efl-championship.football-logos.cc.svg`,
        la_liga: `${COMMUNITY_PACK_CDN}/La%20Liga/spain_la-liga.football-logos.cc.svg`,
        segunda_division_esp: `${COMMUNITY_PACK_CDN}/La%20Liga%202/spain_segunda-division.football-logos.cc.svg`,
        bundesliga: `${COMMUNITY_PACK_CDN}/Bundesliga/germany_bundesliga.football-logos.cc.svg`,
        zweite_bundesliga: `${COMMUNITY_PACK_CDN}/Bundesliga%202/germany_2-bundesliga.football-logos.cc.svg`,
        serie_a: `${COMMUNITY_PACK_CDN}/Serie%20A/italy_serie-a.football-logos.cc.svg`,
        serie_b_ita: `${COMMUNITY_PACK_CDN}/Serie%20B/italy_serie-b.football-logos.cc.svg`,
        ligue_1: `${COMMUNITY_PACK_CDN}/Ligue%201/france_ligue-1.football-logos.cc.svg`,
        ligue_2: `${COMMUNITY_PACK_CDN}/Ligue%202/france_ligue-2.football-logos.cc.svg`,
        brasileirao: `${COMMUNITY_PACK_CDN}/Football%20Tournament%20%26%20Competition%20Logos/tournaments_campeonato-brasileiro-serie-a.football-logos.cc.svg`,
        serie_b_br: `${COMMUNITY_PACK_CDN}/Football%20Tournament%20%26%20Competition%20Logos/tournaments_campeonato-brasileiro-serie-b.football-logos.cc.svg`,
        copa_de_primera: `${COMMUNITY_PACK_CDN}/Copa%20de%20Primera/paraguay_copa-de-primera.football-logos.cc.svg`,
        liga_mx: `${COMMUNITY_PACK_CDN}/Liga%20MX/mexico_liga-mx.football-logos.cc.svg`,
        liga_expansion_mx: `${COMMUNITY_PACK_CDN}/Liga%20de%20Expansi%C3%B3n%20MX/mexico_liga-de-expansion-mx.football-logos.cc.svg`,
        primera_division_chile: `${COMMUNITY_PACK_CDN}/Liga%20de%20Primera/chile_liga-de-primera.football-logos.cc.svg`,
        primera_b_chile: `${COMMUNITY_PACK_CDN}/Categoria%20Primera%20B/chile_liga-de-ascenso.football-logos.cc.svg`,
        primera_a_colombia: `${COMMUNITY_PACK_CDN}/Categor%C3%ADa%20Primera%20A/colombia_categoria-primera-a.football-logos.cc.svg`,
        primera_b_colombia: `${COMMUNITY_PACK_CDN}/Categor%C3%ADa%20Primera%20A/colombia_categoria-primera-a.football-logos.cc.svg`,
    };

    /**
     * Resolve Trophy Image
     * Returns bespoke high-detail engraved SVG trophies for all 40 official competitions.
     */
    public static resolveTrophy(competitionId: string, name?: string): ResourceResolution | null {
        const svgUrl = ResourceFallback.trophy(name || competitionId);
        if (svgUrl) {
            return {
                url: svgUrl,
                source: 'builtin-cdn',
                packId: this.ID,
                isFallback: false
            };
        }
        return null;
    }

    /**
     * Determine whether a team belongs to the American or European bundle.
     */
    public static isAmericanTeam(teamId: number | string, url?: string): boolean {
        const num = Number(teamId);
        if (!isNaN(num) && num > 0) {
            if (
                (num >= 700 && num <= 899) ||
                (num >= 980 && num <= 999) ||
                (num >= 1100 && num <= 1399) ||
                (num >= 2200 && num <= 2999) ||
                (num >= 9100 && num <= 9199)
            ) {
                return true;
            }
            if ((num >= 1 && num <= 699) || (num >= 900 && num <= 979) || (num >= 2000 && num <= 2199)) {
                return false;
            }
        }
        if (url) {
            const lower = url.toLowerCase();
            return (
                lower.includes('argentina') ||
                lower.includes('brazil') ||
                lower.includes('paraguay') ||
                lower.includes('mexico') ||
                lower.includes('chile') ||
                lower.includes('colombia') ||
                lower.includes('uruguay') ||
                lower.includes('ecuador') ||
                lower.includes('peru') ||
                lower.includes('bolivia') ||
                lower.includes('venezuela') ||
                lower.includes('conmebol')
            );
        }
        return false;
    }

    /**
     * Resolve resource scoped to a specific modular community bundleKey.
     */
    public static resolveForBundle(
        bundleKey: string,
        type: ResourceType,
        identifier: string | number,
        meta?: any
    ): ResourceResolution | null {
        switch (bundleKey) {
            case 'south-america-logos': {
                if (type !== 'team-logo') return null;
                const res = this.resolveTeamLogo(identifier, meta);
                if (!res) return null;
                return this.isAmericanTeam(identifier, res.url) ? { ...res, packId: bundleKey } : null;
            }
            case 'europe-logos': {
                if (type !== 'team-logo') return null;
                const res = this.resolveTeamLogo(identifier, meta);
                if (!res) return null;
                return !this.isAmericanTeam(identifier, res.url) ? { ...res, packId: bundleKey } : null;
            }
            case 'competitions-logos': {
                if (type !== 'competition-logo' && type !== 'league-logo') return null;
                const res = this.resolveCompetitionLogo(String(identifier), meta?.name);
                return res ? { ...res, packId: bundleKey } : null;
            }
            case 'player-faces-pack': {
                if (type !== 'player-face') return null;
                const res = this.resolvePlayerFace(identifier, meta);
                return res ? { ...res, packId: bundleKey } : null;
            }
            case 'trophies-pack': {
                if (type !== 'trophy') return null;
                const res = this.resolveTrophy(String(identifier), meta?.name);
                return res ? { ...res, packId: bundleKey } : null;
            }
            case 'flags-pack': {
                if (type !== 'flag') return null;
                const res = this.resolveCountryFlag(String(identifier));
                return res ? { ...res, packId: bundleKey } : null;
            }
            case 'official-base-pack': {
                switch (type) {
                    case 'team-logo': return this.resolveTeamLogo(identifier, meta);
                    case 'competition-logo':
                    case 'league-logo': return this.resolveCompetitionLogo(String(identifier), meta?.name);
                    case 'player-face': return this.resolvePlayerFace(identifier, meta);
                    case 'flag': return this.resolveCountryFlag(String(identifier));
                    case 'trophy': return this.resolveTrophy(String(identifier), meta?.name);
                    default: return null;
                }
            }
            default:
                return null;
        }
    }
}
