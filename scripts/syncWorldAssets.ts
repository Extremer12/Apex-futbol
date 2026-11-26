/**
 * scripts/syncWorldAssets.ts
 *
 * Automated World Asset & Community Pack Synchronization Pipeline (Bloque 1).
 *
 * Capabilities:
 * 1. Scans Extremer12/community-data-packs@main via GitHub Trees API and maps ALL
 *    available club & competition SVGs (including unmapped La Liga, La Liga 2,
 *    Championship, Ligue 2, Serie B, Bundesliga 2, etc.) without legacy tmssl links.
 * 2. Resolves any remaining unhosted clubs (CONMEBOL 40 clubs, Leicester, Serie B BR,
 *    Primera Nacional gaps, Liga Expansion MX) cleanly via FotMob team search.
 * 3. Synchronizes player faces BY FULL CLUB SQUAD (/api/data/teams?id=...) so
 *    abbreviated names (e.g. "M. Merentiel") match accurately within their exact club.
 * 4. Generates real downloadable trophy SVGs + modular v1 PackManifest JSONs +
 *    trophies-pack.zip inside dist-packs/ ready for Community Packs or CDN upload.
 *
 * Usage:
 *   npx tsx scripts/syncWorldAssets.ts                  # Full sync (crests + faces + trophies + dist-packs)
 *   npx tsx scripts/syncWorldAssets.ts --crests-only    # Skip player squad face sync
 *   npx tsx scripts/syncWorldAssets.ts --offline        # Use cached API responses & regenerate files only
 */

import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { TEAMS as BASE_TEAMS } from '../constants';
import { SOUTH_AMERICAN_EXTRA_TEAMS } from '../data/teams/southAmericanClubs';
import { ARG_CLUB_LOGOS_BY_ID, ARG_CLUB_LOGOS_BY_NAME, COMMUNITY_PACK_CDN } from '../services/customPacks/argentineLogos';
import { PLAYER_PHOTOS_BY_ID, PLAYER_PHOTOS_BY_NAME } from '../services/customPacks/playerPhotos';
import { DefaultResourceProvider } from '../services/resources/providers/DefaultResourceProvider';
import { COMPETITION_TROPHY_SPECS, renderTrophySvg } from './lib/trophySvgs';

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, 'scripts', '.cache');
const DIST_PACKS = path.join(ROOT, 'dist-packs');
const TEAM_CACHE_FILE = path.join(CACHE_DIR, 'fotmob-teams-cache.json');
const SQUAD_CACHE_FILE = path.join(CACHE_DIR, 'fotmob-squads-cache.json');
const GH_TREE_CACHE_FILE = path.join(CACHE_DIR, 'github-tree-cache.json');

const ARGS = new Set(process.argv.slice(2));
const OFFLINE = ARGS.has('--offline');
const CRESTS_ONLY = ARGS.has('--crests-only');
const FORCE_REFRESH = ARGS.has('--refresh');

interface GhTreeBlob {
    path: string;
    encodedUrl: string;
    folder: string;
    fileName: string;
    slug: string;
}

interface FotMobSquadMember {
    id: number;
    name: string;
    role?: string;
    ccode?: string;
    age?: number;
}

interface CachedTeamMatch {
    teamId: number;
    teamName: string;
    fotmobId: number;
    fotmobName: string;
    leagueName?: string;
}

const WORLD_TEAMS = Array.from(
    new Map([...BASE_TEAMS, ...SOUTH_AMERICAN_EXTRA_TEAMS].map(t => [t.id, t])).values()
);

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function norm(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\b(fc|cf|cd|ca|cs|sc|ac|afc|club|atletico|deportivo|real|sporting|united|city|town)\b/g, ' ')
        .replace(/[^a-z0-9]/g, '');
}

function normRaw(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchJson<T>(url: string, retries = 2): Promise<T | null> {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'ApexFootballManager-AssetSync/1.0',
                    'Accept': 'application/json',
                },
            });
            if (res.ok) return (await res.json()) as T;
            if (res.status === 429 || res.status >= 500) {
                await sleep(600 * (i + 1));
                continue;
            }
            return null;
        } catch {
            if (i < retries) await sleep(500 * (i + 1));
        }
    }
    return null;
}

function encodeGhPath(p: string): string {
    return p
        .split('/')
        .map(seg => encodeURIComponent(seg))
        .join('/');
}

/**
 * Known folder preferences per LeagueId inside Extremer12/community-data-packs
 */
const LEAGUE_GH_FOLDER_HINTS: Record<string, string[]> = {
    PREMIER_LEAGUE: ['Premier League/', 'Championship/'],
    CHAMPIONSHIP: ['Championship/', 'Premier League/'],
    LA_LIGA: ['La Liga/', 'La Liga 2/'],
    SEGUNDA_DIVISION_ESP: ['La Liga 2/', 'La Liga/'],
    BUNDESLIGA: ['Bundesliga/', 'Bundesliga 2/'],
    ZWEITE_BUNDESLIGA: ['Bundesliga 2/', 'Bundesliga/'],
    SERIE_A: ['Serie A/', 'Serie B/'],
    SERIE_B_ITA: ['Serie B/', 'Serie A/'],
    LIGUE_1: ['Ligue 1/', 'Ligue 2/'],
    LIGUE_2: ['Ligue 2/', 'Ligue 1/'],
    LIGA_ARGENTINA: ['Argentina/'],
    PRIMERA_NACIONAL: ['Argentina/'],
    LIGA_MX: ['Liga MX/', 'Liga de Expansión MX/'],
    LIGA_EXPANSION_MX: ['Liga de Expansión MX/', 'Liga MX/'],
    COPA_DE_PRIMERA: ['Copa de Primera/'],
    PRIMERA_DIVISION_CHILE: ['Liga de Primera/', 'Categoria Primera B/'],
    PRIMERA_B_CHILE: ['Categoria Primera B/', 'Liga de Primera/'],
    PRIMERA_A_COLOMBIA: ['Categoría Primera A/', 'Liga BetPlay/'],
    PRIMERA_B_COLOMBIA: ['Categoría Primera A/', 'Liga BetPlay/'],
};

const CLUB_SLUG_ALIASES: Record<string, string[]> = {
    'atletico madrid': ['atletico-de-madrid', 'atletico-madrid'],
    'fc barcelona': ['fc-barcelona', 'barcelona'],
    'athletic club': ['athletic-bilbao', 'athletic-club'],
    'celta vigo': ['celta-de-vigo', 'celta-vigo'],
    'deportivo alaves': ['alaves', 'deportivo-alaves'],
    'alaves': ['deportivo-alaves', 'alaves'],
    'mallorca': ['rcd-mallorca', 'mallorca'],
    'espanyol': ['rcd-espanyol', 'espanyol'],
    'las palmas': ['ud-las-palmas', 'las-palmas'],
    'leganes': ['cd-leganes', 'leganes'],
    'valladolid': ['real-valladolid', 'valladolid'],
    'girona fc': ['girona-fc', 'girona'],
    'getafe cf': ['getafe-cf', 'getafe'],
    'valencia cf': ['valencia-cf', 'valencia'],
    'villarreal cf': ['villarreal-cf', 'villarreal'],
    'sevilla fc': ['sevilla-fc', 'sevilla'],
    'osasuna': ['ca-osasuna', 'osasuna'],
    'real betis': ['real-betis', 'betis'],
    'real sociedad': ['real-sociedad'],
    'rayo vallecano': ['rayo-vallecano'],
    'real madrid': ['real-madrid'],
    'leicester city': ['leicester-city', 'leicester'],
    'west brom': ['west-bromwich-albion', 'west-brom'],
    'sheffield utd': ['sheffield-united'],
    'sheffield wed': ['sheffield-wednesday'],
    'queens park rangers': ['qpr', 'queens-park-rangers'],
    'qpr': ['queens-park-rangers', 'qpr'],
    'oxford united': ['oxford-united'],
    'havre ac': ['le-havre', 'havre'],
    'stade brestois': ['stade-brestois-29', 'brest'],
    'stade de reims': ['stade-de-reims', 'reims'],
    'stade rennais': ['stade-rennais', 'rennes'],
    'clermont foot': ['clermont-foot-63', 'clermont'],
    'girondins de bordeaux': ['girondins-bordeaux', 'bordeaux'],
    'grenoble foot': ['grenoble-foot-38', 'grenoble'],
    'usm dunkerque': ['usl-dunkerque', 'dunkerque'],
    'pau fc': ['pau-fc', 'pau'],
    'rodez af': ['rodez-af', 'rodez'],
    'fc annecy': ['fc-annecy', 'annecy'],
    'sc bastia': ['sc-bastia', 'bastia'],
    'sm caen': ['sm-caen', 'caen'],
    'ea guingamp': ['ea-guingamp', 'guingamp'],
    'amiens sc': ['amiens-sc', 'amiens'],
    'troyes ac': ['estac-troyes', 'troyes'],
    'ac ajaccio': ['ac-ajaccio', 'ajaccio'],
    'paris fc': ['paris-fc'],
    'stade lavallois': ['stade-lavallois', 'laval'],
    'hamburger sv': ['hamburger-sv', 'hsv'],
    'fortuna dusseldorf': ['fortuna-dusseldorf'],
    '1 fc koln': ['fc-koln', 'koln'],
    'hertha bsc': ['hertha-bsc', 'hertha-berlin'],
    'fc schalke 04': ['fc-schalke-04', 'schalke-04'],
    'sampdoria': ['uc-sampdoria', 'sampdoria'],
    'palermo': ['palermo-fc', 'palermo'],
    'salernitana': ['us-salernitana', 'salernitana'],
    'brescia': ['brescia-calcio', 'brescia'],
    'athletic bilbao': ['athletic-club', 'athletic-bilbao'],
};

async function loadGithubTree(): Promise<GhTreeBlob[]> {
    ensureDir(CACHE_DIR);
    if ((OFFLINE || !FORCE_REFRESH) && fs.existsSync(GH_TREE_CACHE_FILE)) {
        try {
            const cached = JSON.parse(fs.readFileSync(GH_TREE_CACHE_FILE, 'utf8'));
            if (Array.isArray(cached) && cached.length > 0) return cached;
        } catch {
            // fall through to fetch
        }
    }

    if (OFFLINE) return [];

    console.log('🌐 Obteniendo árbol de Extremer12/community-data-packs@main...');
    const res = await fetchJson<{ tree?: Array<{ path: string; type: string }> }>(
        'https://api.github.com/repos/Extremer12/community-data-packs/git/trees/main?recursive=1'
    );
    const blobs: GhTreeBlob[] = [];
    for (const item of res?.tree || []) {
        if (item.type !== 'blob') continue;
        if (!/\.(svg|png|webp)$/i.test(item.path)) continue;
        const fileName = item.path.split('/').pop() || item.path;
        const cleanFile = fileName
            .replace(/\.football-logos\.cc\.(svg|png|webp)$/i, '')
            .replace(/\.(svg|png|webp)$/i, '');
        // Strip leading country prefix e.g. spain_real-madrid -> real-madrid
        const withoutPrefix = cleanFile.includes('_') ? cleanFile.split('_').slice(1).join('_') : cleanFile;
        blobs.push({
            path: item.path,
            encodedUrl: `${COMMUNITY_PACK_CDN}/${encodeGhPath(item.path)}`,
            folder: item.path.slice(0, item.path.lastIndexOf('/') + 1),
            fileName,
            slug: normRaw(withoutPrefix),
        });
    }
    if (blobs.length > 0) {
        fs.writeFileSync(GH_TREE_CACHE_FILE, JSON.stringify(blobs, null, 2), 'utf8');
    }
    console.log(`   ✔ ${blobs.length} archivos SVG/PNG indexados desde GitHub CDN`);
    return blobs;
}

function matchClubInGithubTree(teamName: string, leagueId: string, blobs: GhTreeBlob[]): GhTreeBlob | null {
    const cleanName = teamName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    const aliasSlugs = (CLUB_SLUG_ALIASES[cleanName] || []).map(a => normRaw(a));
    const candidateSlugs = Array.from(new Set([normRaw(teamName), norm(teamName), ...aliasSlugs])).filter(s => s.length >= 3);

    const folderHints = LEAGUE_GH_FOLDER_HINTS[leagueId] || [];

    // Exclude tournament/league logos themselves
    const clubBlobs = blobs.filter(b => !b.path.startsWith('Football Tournament'));

    // Pass 1: Folder-scoped exact slug match
    for (const hint of folderHints) {
        const scoped = clubBlobs.filter(b => b.path.startsWith(hint));
        for (const cand of candidateSlugs) {
            const hit = scoped.find(b => b.slug === cand);
            if (hit) return hit;
        }
        for (const cand of candidateSlugs) {
            const hit = scoped.find(b => b.slug.includes(cand) || (b.slug.length >= 4 && cand.includes(b.slug)));
            if (hit) return hit;
        }
    }

    // Pass 2: Any club folder exact slug match (useful for Argentina sub-folders or second divisions)
    for (const cand of candidateSlugs) {
        const hit = clubBlobs.find(b => b.slug === cand);
        if (hit) return hit;
    }

    return null;
}

const LEAGUE_COUNTRY_AFFINITY: Record<string, string[]> = {
    PREMIER_LEAGUE: ['england', 'premier league', 'championship'],
    CHAMPIONSHIP: ['england', 'championship', 'premier league', 'league one'],
    LA_LIGA: ['spain', 'laliga', 'la liga'],
    SEGUNDA_DIVISION_ESP: ['spain', 'laliga2', 'segunda'],
    BUNDESLIGA: ['germany', 'bundesliga'],
    ZWEITE_BUNDESLIGA: ['germany', '2. bundesliga', 'bundesliga'],
    SERIE_A: ['italy', 'serie a'],
    SERIE_B_ITA: ['italy', 'serie b', 'serie c'],
    LIGUE_1: ['france', 'ligue 1', 'ligue 2', 'national'],
    LIGUE_2: ['france', 'ligue 2', 'ligue 3', 'national'],
    LIGA_ARGENTINA: ['argentina', 'liga profesional'],
    PRIMERA_NACIONAL: ['argentina', 'primera nacional', 'b nacional', 'primera b'],
    BRASILEIRAO: ['brazil', 'serie a', 'brasileirao'],
    SERIE_B_BR: ['brazil', 'serie b', 'serie c', 'série b', 'série c'],
    COPA_DE_PRIMERA: ['paraguay', 'division profesional', 'primera division'],
    LIGA_MX: ['mexico', 'liga mx'],
    LIGA_EXPANSION_MX: ['mexico', 'expansion', 'expansión'],
    PRIMERA_DIVISION_CHILE: ['chile', 'primera division'],
    PRIMERA_B_CHILE: ['chile', 'primera b'],
    PRIMERA_A_COLOMBIA: ['colombia', 'primera a'],
    PRIMERA_B_COLOMBIA: ['colombia', 'primera b'],
    PRIMEIRA_LIGA: ['portugal', 'liga portugal', 'primeira liga'],
    EREDIVISIE: ['netherlands', 'eredivisie'],
    LIGA_URUGUAYA: ['uruguay', 'uruguaya', 'liga auf'],
    LIGA_ECUADOR: ['ecuador', 'serie a', 'ligapro'],
    MLS: ['mls', 'usa', 'united states'],
    CONMEBOL: ['brazil', 'argentina', 'uruguay', 'uruguaya', 'colombia', 'chile', 'ecuador', 'peru', 'paraguay', 'bolivia', 'venezuela', 'libertadores', 'sudamericana', 'liga 1', 'serie a', 'primera division', 'primera división', 'ligapro'],
};

const FOTMOB_SEARCH_ALIASES: Record<string, string> = {
    'Athletic Club': 'Athletic Club',
    'Havre AC': 'Le Havre',
    'Girondins de Bordeaux': 'Bordeaux',
    'Amiens SC': 'Amiens',
    'SM Caen': 'Caen',
    'Valenciennes FC': 'Valenciennes',
    'Quevilly-Rouen': 'Quevilly',
    'US Salernitana': 'Salernitana',
    'Vasco da Gama': 'CR Vasco da Gama',
    'Botafogo': 'Botafogo RJ',
    'Peñarol': 'Penarol',
    'Club Nacional de Football': 'Nacional',
    'Nacional': 'Nacional',
    'Olimpia': 'Olimpia',
    'Cerro Porteño': 'Cerro Porteno',
    'Libertad': 'Libertad',
    'LDU Quito': 'LDU de Quito',
    'Liverpool FC (Uru)': 'Liverpool FC',
    'Universidad Católica (Ecu)': 'Universidad Catolica',
    'Racing Club de Montevideo': 'Racing Club de Montevideo',
    'Universidad César Vallejo': 'Universidad Cesar Vallejo',
    'Celaya': 'Celaya',
    'Alianza Lima': 'Alianza Lima',
    'Sporting Cristal': 'Sporting Cristal',
    'Club Bolívar': 'Bolivar',
    'Bolívar': 'Bolivar',
    'Club Blooming': 'Blooming',
    'Caracas FC': 'Caracas',
    'Cerro Largo FC': 'Cerro Largo',
    'CS Emelec': 'Emelec',
    'Danubio FC': 'Danubio',
    'Delfín SC': 'Delfin',
    'Deportivo Rayo Zuliano': 'Rayo Zuliano',
    'SD Aucas': 'Aucas',
    'The Strongest': 'The Strongest',
    'Universitario': 'Universitario',
    'Midland': 'Midland',
    'Acassuso': 'Acassuso',
    'Atlético de Rafaela': 'Atletico Rafaela',
    'ABC FC': 'ABC',
    'Paysandu SC': 'Paysandu',
    'Botafogo-SP': 'Botafogo SP',
    'SL Benfica': 'Benfica',
    'FC Porto': 'Porto',
    'SC Braga': 'Braga',
    'Vitória Guimarães': 'Vitoria de Guimaraes',
    'FC Famalicão': 'Famalicao',
    'Moreirense FC': 'Moreirense',
    'Estoril Praia': 'Estoril',
    'Rio Ave FC': 'Rio Ave',
    'FC Arouca': 'Arouca',
    'Boavista FC': 'Boavista',
    'CD Santa Clara': 'Santa Clara',
    'PSV Eindhoven': 'PSV',
    'Go Ahead Eagles': 'Go Ahead Eagles',
    'NEC Nijmegen': 'NEC',
    'SC Heerenveen': 'Heerenveen',
    'FC Groningen': 'Groningen',
    'Heracles Almelo': 'Heracles',
    'CA Boston River': 'Boston River',
    'Club Atlético Progreso': 'Progreso',
    'River Plate (Uru)': 'River Plate Montevideo',
    'Orense SC': 'Orense',
    'Mushuc Runa SC': 'Mushuc Runa',
    'CSD Macará': 'Macara',
    'Inter Miami CF': 'Inter Miami',
    'Seattle Sounders FC': 'Seattle Sounders',
    'Orlando City SC': 'Orlando City',
    'Houston Dynamo FC': 'Houston Dynamo',
    'New York City FC': 'New York City FC',
};

const VERIFIED_DIRECT_FOTMOB_IDS: Record<number, { fotmobId: number; fotmobName: string; leagueName: string }> = {
    9113: { fotmobId: 6721, fotmobName: 'LDU de Quito', leagueName: 'Serie A' },
    9122: { fotmobId: 8304, fotmobName: 'Nacional', leagueName: 'Liga AUF Uruguaya' },
    9124: { fotmobId: 2219, fotmobName: 'Liverpool FC', leagueName: 'Liga AUF Uruguaya' },
    9141: { fotmobId: 113053, fotmobName: 'Universidad Católica', leagueName: 'Serie A' },
};

async function findTheSportsDbBadge(teamName: string): Promise<string | null> {
    const query = FOTMOB_SEARCH_ALIASES[teamName] || teamName.replace(/\s*\([^)]+\)\s*/g, '').trim();
    const url = `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(query)}`;
    const res = await fetchJson<{ teams?: Array<{ strTeam?: string; strSport?: string; strBadge?: string }> }>(url);
    const teams = (res?.teams || []).filter(t => t.strSport === 'Soccer' && t.strBadge);
    if (teams.length === 0) return null;
    const tNorm = normRaw(query);
    const exact = teams.find(t => normRaw(t.strTeam || '') === tNorm || normRaw(t.strTeam || '').includes(tNorm));
    return (exact || teams[0])?.strBadge || null;
}

async function findFotMobTeam(team: typeof WORLD_TEAMS[number]): Promise<CachedTeamMatch | null> {
    const direct = VERIFIED_DIRECT_FOTMOB_IDS[team.id];
    if (direct) {
        return { teamId: team.id, teamName: team.name, ...direct };
    }
    const queryName = FOTMOB_SEARCH_ALIASES[team.name] || team.name.replace(/\s*\([^)]+\)\s*/g, '').trim();
    const url = `https://www.fotmob.com/api/data/search/suggest?term=${encodeURIComponent(queryName)}&lang=es`;
    const groups = await fetchJson<Array<{ title: string; suggestions: Array<any> }>>(url);
    if (!Array.isArray(groups)) return null;

    const candidates: Array<{ id: number; name: string; leagueName?: string; score: number }> = [];
    const targetRaw = normRaw(team.name);
    const targetCore = norm(team.name);
    const affinities = LEAGUE_COUNTRY_AFFINITY[team.leagueId] || [];

    for (const g of groups) {
        for (const s of g.suggestions || []) {
            if (s.type !== 'team' || !s.id || !s.name) continue;
            // Filter out women / youth / B teams unless team name asks for it
            const sLower = String(s.name).toLowerCase();
            if (/\((w|f)\)|\bwomen\b|\bfemenino\b|\bu21\b|\bu23\b|\bu19\b|\bb$/i.test(sLower)) continue;

            const sRaw = normRaw(s.name);
            const sCore = norm(s.name);
            let score = 0;
            if (sRaw === targetRaw) score += 100;
            else if (sCore && sCore === targetCore) score += 85;
            else if (sRaw.includes(targetRaw) || targetRaw.includes(sRaw)) score += 60;
            else if (sCore && (sCore.includes(targetCore) || targetCore.includes(sCore))) score += 45;

            const leagueLower = `${s.leagueName || ''} ${s.ccode || ''}`.toLowerCase();
            if (affinities.some(a => leagueLower.includes(a))) {
                score += 40;
            }
            if (score >= 45) {
                candidates.push({
                    id: Number(s.id),
                    name: String(s.name),
                    leagueName: s.leagueName,
                    score,
                });
            }
        }
    }

    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    if (!best) return null;

    return {
        teamId: team.id,
        teamName: team.name,
        fotmobId: best.id,
        fotmobName: best.name,
        leagueName: best.leagueName,
    };
}

function matchPlayerInSquad(
    gamePlayer: { id: number; name: string; position: string; age?: number },
    squadMembers: FotMobSquadMember[]
): FotMobSquadMember | null {
    const cleanTarget = gamePlayer.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    // Exact full name
    const exact = squadMembers.find(m => {
        const mClean = m.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        return mClean === cleanTarget || normRaw(mClean) === normRaw(cleanTarget);
    });
    if (exact) return exact;

    // Abbreviated pattern e.g. "M. Merentiel" or "E. Fernández"
    const abbrMatch = cleanTarget.match(/^([a-z])\.?\s+(.+)$/);
    if (abbrMatch) {
        const initial = abbrMatch[1];
        const lastPart = abbrMatch[2].trim();
        const lastTokens = lastPart.split(/\s+/);
        const primaryLast = lastTokens[lastTokens.length - 1];

        const candidates = squadMembers.filter(m => {
            const mNorm = m.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
            const parts = mNorm.split(/\s+/);
            if (parts.length === 0) return false;
            const firstMatches = parts[0].startsWith(initial);
            const surnameMatches = parts.some(p => p === primaryLast || p === lastPart || mNorm.endsWith(lastPart));
            return firstMatches && surnameMatches;
        });

        if (candidates.length === 1) return candidates[0];
        if (candidates.length > 1) {
            // Disambiguate by age proximity or role
            const targetAge = gamePlayer.age ?? 25;
            candidates.sort((a, b) => {
                const ageDiffA = a.age ? Math.abs(a.age - targetAge) : 5;
                const ageDiffB = b.age ? Math.abs(b.age - targetAge) : 5;
                return ageDiffA - ageDiffB;
            });
            return candidates[0];
        }
    }

    // Multi-word partial / single unique surname fallback inside same club
    const targetWords = cleanTarget.replace(/\./g, '').split(/\s+/).filter(w => w.length >= 4);
    if (targetWords.length > 0) {
        const lastWord = targetWords[targetWords.length - 1];
        const candidates = squadMembers.filter(m => {
            const mNorm = m.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
            return mNorm.split(/\s+/).includes(lastWord);
        });
        if (candidates.length === 1) return candidates[0];
    }

    return null;
}

function serializeArgentineLogosFile(
    resolvedById: Record<string, string>,
    resolvedByName: Record<string, string>
): string {
    const existingPath = path.join(ROOT, 'services', 'customPacks', 'argentineLogos.ts');
    const original = fs.readFileSync(existingPath, 'utf8');
    const marker = 'export const ARG_CLUB_LOGOS_BY_ID: Record<number | string, string> = {';
    const headerEnd = original.indexOf(marker);
    if (headerEnd === -1) {
        throw new Error('Could not find ARG_CLUB_LOGOS_BY_ID marker in argentineLogos.ts');
    }
    const header = original.slice(0, headerEnd);

    const byIdLines = Object.entries(resolvedById)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([id, url]) => `    ${id}: '${url.replace(/'/g, "\\'")}',`);

    const byNameLines = Object.entries(resolvedByName)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, url]) => `    '${name.replace(/'/g, "\\'")}': '${url.replace(/'/g, "\\'")}',`);

    return `${header}${marker}\n${byIdLines.join('\n')}\n};\n\nexport const ARG_CLUB_LOGOS_BY_NAME: Record<string, string> = {\n${byNameLines.join('\n')}\n};\n`;
}

function serializePlayerPhotosFile(
    byId: Record<string, string>,
    byName: Record<string, string>
): string {
    const idLines = Object.entries(byId)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([id, url]) => (/^\d+$/.test(id) ? `    ${id}: '${url.replace(/'/g, "\\'")}',` : `    '${id}': '${url.replace(/'/g, "\\'")}',`));

    const nameLines = Object.entries(byName)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, url]) => `    '${name.replace(/'/g, "\\'")}': '${url.replace(/'/g, "\\'")}',`);

    return `/**
 * Player Faces & Photos Database (Verified Official Portraits)
 * Synchronized by club squad & curated overrides (${new Date().toISOString().slice(0, 10)})
 */

import { COMMUNITY_PACK_CDN } from './argentineLogos';

export const PLAYER_FACES_CDN = \`\${COMMUNITY_PACK_CDN}/Players\`;

export const PLAYER_PHOTOS_BY_ID: Record<number | string, string> = {
${idLines.join('\n')}
};

export const PLAYER_PHOTOS_BY_NAME: Record<string, string> = {
${nameLines.join('\n')}
};
`;
}

async function generateTrophyAndManifestOutputs(
    byId: Record<string, string>,
    playerPhotosById: Record<string, string>
) {
    ensureDir(DIST_PACKS);
    const trophiesDir = path.join(DIST_PACKS, 'trophies');
    const manifestsDir = path.join(DIST_PACKS, 'manifests');
    const zipsDir = path.join(DIST_PACKS, 'zips');
    ensureDir(trophiesDir);
    ensureDir(manifestsDir);
    ensureDir(zipsDir);

    // 1. Write all bespoke trophy SVGs & pack trophies-pack.zip
    const trophyAssets: Record<string, string> = {};
    const trophyZip = new JSZip();
    const trophyFolder = trophyZip.folder('trophies')!;

    for (const spec of COMPETITION_TROPHY_SPECS) {
        const svg = renderTrophySvg(spec);
        const rel = `trophies/${spec.fileSlug}.svg`;
        fs.writeFileSync(path.join(trophiesDir, `${spec.fileSlug}.svg`), svg, 'utf8');
        trophyFolder.file(`${spec.fileSlug}.svg`, svg);

        // Register lowercase & compact lookup aliases (avoid case-colliding JSON keys)
        trophyAssets[spec.fileSlug] = rel;
        const compactId = normRaw(spec.id);
        if (compactId && compactId !== spec.fileSlug) trophyAssets[compactId] = rel;
        const compactName = normRaw(spec.name);
        if (compactName) trophyAssets[compactName] = rel;
    }

    const nowIso = new Date().toISOString();
    const trophyManifest = {
        schemaVersion: 1,
        id: 'trophies-pack',
        name: 'Trofeos Oficiales Apex (SVGs HD)',
        version: '2.0.0',
        category: 'trophies',
        author: { id: 'extremer12', name: 'Extremer12 Community', role: 'COMMUNITY' },
        description: `Colección vectorial completa de ${COMPETITION_TROPHY_SPECS.length} trofeos: Champions, Libertadores, Recopa Sudamericana, Mundial de Clubes, Ligas y Copas Nacionales.`,
        tags: ['trofeos', 'palmares', 'copas', 'svg'],
        isOfficial: false,
        gameVersionMin: '1.0.0',
        assetCount: COMPETITION_TROPHY_SPECS.length,
        sizeBytes: 380_000,
        createdAt: nowIso,
        updatedAt: nowIso,
        license: {
            type: 'Community',
            rightsDeclared: true,
            declarationText: 'Iconografía vectorial generada e integrada por la comunidad.',
        },
        baseUrl: COMMUNITY_PACK_CDN,
        assets: {
            trophies: trophyAssets,
        },
    };
    trophyZip.file('manifest.json', JSON.stringify(trophyManifest, null, 2));
    const zipBytes = await trophyZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    fs.writeFileSync(path.join(zipsDir, 'trophies-pack.zip'), zipBytes);
    fs.writeFileSync(path.join(manifestsDir, 'trophies-pack.manifest.json'), JSON.stringify(trophyManifest, null, 2), 'utf8');

    // 2. Partition club crests cleanly into South America & Europe manifests
    const saTeams: Record<string, string> = {};
    const euTeams: Record<string, string> = {};
    for (const team of WORLD_TEAMS) {
        const url = byId[String(team.id)];
        if (!url) continue;
        if (DefaultResourceProvider.isAmericanTeam(team.id, url)) {
            saTeams[String(team.id)] = url;
            saTeams[normRaw(team.name)] = url;
        } else {
            euTeams[String(team.id)] = url;
            euTeams[normRaw(team.name)] = url;
        }
    }

    const buildTeamManifest = (id: string, name: string, desc: string, teamsDict: Record<string, string>, count: number) => ({
        schemaVersion: 1,
        id,
        name,
        version: '2.0.0',
        category: 'teams',
        author: { id: 'extremer12', name: 'Extremer12 Community', role: 'COMMUNITY' },
        description: desc,
        tags: ['escudos', 'clubes'],
        isOfficial: false,
        gameVersionMin: '1.0.0',
        assetCount: count,
        sizeBytes: count * 18_000,
        createdAt: nowIso,
        updatedAt: nowIso,
        license: {
            type: 'Community',
            rightsDeclared: true,
            declarationText: 'Pack modular comunitario alojado externamente; no incluido en el APK base.',
        },
        assets: { teams: teamsDict },
    });

    const saCount = WORLD_TEAMS.filter(t => DefaultResourceProvider.isAmericanTeam(t.id, byId[String(t.id)])).length;
    const euCount = WORLD_TEAMS.length - saCount;

    fs.writeFileSync(
        path.join(manifestsDir, 'south-america-logos.manifest.json'),
        JSON.stringify(
            buildTeamManifest('south-america-logos', 'Escudos Sudamérica & Concacaf HD', `${saCount} escudos vectoriales y PNG de Argentina, Brasil, México, Colombia, Chile, Paraguay y CONMEBOL.`, saTeams, saCount),
            null,
            2
        ),
        'utf8'
    );
    fs.writeFileSync(
        path.join(manifestsDir, 'europe-logos.manifest.json'),
        JSON.stringify(
            buildTeamManifest('europe-logos', 'Escudos Europa HD (Top 5 + 2ª Div)', `${euCount} escudos de Inglaterra, España, Alemania, Italia y Francia (1ª y 2ª división).`, euTeams, euCount),
            null,
            2
        ),
        'utf8'
    );

    // 3. Player faces manifest
    const totalPlayersMapped = Object.keys(playerPhotosById).length;
    const facesManifest = {
        schemaVersion: 1,
        id: 'player-faces-pack',
        name: 'Rostros Fotográficos Planteles HD',
        version: '2.0.0',
        category: 'players',
        author: { id: 'extremer12', name: 'Extremer12 Community', role: 'COMMUNITY' },
        description: `${totalPlayersMapped} retratos reales sincronizados por plantel completo.`,
        tags: ['rostros', 'jugadores', 'faces'],
        isOfficial: false,
        gameVersionMin: '1.0.0',
        assetCount: totalPlayersMapped,
        sizeBytes: totalPlayersMapped * 22_000,
        createdAt: nowIso,
        updatedAt: nowIso,
        license: {
            type: 'Community',
            rightsDeclared: true,
            declarationText: 'Pack externo opt-in gestionado por el usuario.',
        },
        assets: { players: playerPhotosById },
    };
    fs.writeFileSync(
        path.join(manifestsDir, 'player-faces-pack.manifest.json'),
        JSON.stringify(facesManifest, null, 2),
        'utf8'
    );

    console.log(`📦 dist-packs generado: ${COMPETITION_TROPHY_SPECS.length} SVGs de trofeos + trophies-pack.zip + 4 manifests JSON.`);
}

async function run() {
    ensureDir(CACHE_DIR);
    console.log(`\n══════════════════════════════════════════════════════════════════`);
    console.log(`🚀 APEX WORLD ASSET SYNC (offline=${OFFLINE}, crestsOnly=${CRESTS_ONLY})`);
    console.log(`══════════════════════════════════════════════════════════════════\n`);

    const blobs = await loadGithubTree();

    const teamCache: Record<string, CachedTeamMatch> = fs.existsSync(TEAM_CACHE_FILE)
        ? JSON.parse(fs.readFileSync(TEAM_CACHE_FILE, 'utf8'))
        : {};
    const squadCache: Record<number, FotMobSquadMember[]> = fs.existsSync(SQUAD_CACHE_FILE)
        ? JSON.parse(fs.readFileSync(SQUAD_CACHE_FILE, 'utf8'))
        : {};

    const updatedById: Record<string, string> = {};
    // Preserve valid non-tmssl custom entries initially
    for (const [k, v] of Object.entries(ARG_CLUB_LOGOS_BY_ID)) {
        if (typeof v === 'string' && !v.includes('tmssl.akamaized.net')) {
            updatedById[String(k)] = v;
        }
    }

    const updatedByName: Record<string, string> = {};
    for (const [k, v] of Object.entries(ARG_CLUB_LOGOS_BY_NAME)) {
        if (typeof v === 'string' && !v.includes('tmssl.akamaized.net')) {
            updatedByName[k] = v;
        }
    }

    let ghMatchedCount = 0;
    let fotmobCrestCount = 0;
    let preservedCdnCount = 0;
    const unresolvedCrests: string[] = [];

    for (let i = 0; i < WORLD_TEAMS.length; i++) {
        const team = WORLD_TEAMS[i];
        const existingUrl = updatedById[String(team.id)];

        // 1. Keep verified community-data-packs SVGs, or try GitHub Tree for missing/tmssl clubs
        if (existingUrl && existingUrl.startsWith(COMMUNITY_PACK_CDN)) {
            preservedCdnCount++;
        } else {
            const ghHit = matchClubInGithubTree(team.name, team.leagueId, blobs);
            if (ghHit) {
                updatedById[String(team.id)] = ghHit.encodedUrl;
                ghMatchedCount++;
            } else if (existingUrl && (existingUrl.includes('images.fotmob.com') || existingUrl.includes('r2.thesportsdb.com'))) {
                fotmobCrestCount++;
            } else if (!OFFLINE) {
                const cached = teamCache[String(team.id)];
                const match = cached || (await findFotMobTeam(team));
                if (match) {
                    teamCache[String(team.id)] = match;
                    updatedById[String(team.id)] = `https://images.fotmob.com/image_resources/logo/teamlogo/${match.fotmobId}.png`;
                    fotmobCrestCount++;
                } else {
                    const sdbBadge = await findTheSportsDbBadge(team.name);
                    if (sdbBadge) {
                        updatedById[String(team.id)] = sdbBadge;
                        fotmobCrestCount++;
                    } else {
                        unresolvedCrests.push(`[${team.id}] ${team.name} (${team.leagueId})`);
                    }
                }
                await sleep(110);
            } else {
                unresolvedCrests.push(`[${team.id}] ${team.name} (${team.leagueId})`);
            }
        }

        // Map canonical name & normalized slug so name-based lookups also resolve cleanly
        const resolvedUrl = updatedById[String(team.id)];
        if (resolvedUrl) {
            updatedByName[team.name] = resolvedUrl;
            const slug = normRaw(team.name);
            if (slug) updatedByName[slug] = resolvedUrl;
        }
    }

    fs.writeFileSync(TEAM_CACHE_FILE, JSON.stringify(teamCache, null, 2), 'utf8');

    console.log(`🛡️  Escudos preservados en CDN: ${preservedCdnCount}`);
    console.log(`✨ Escudos mapeados de GitHub CDN (nuevos/LaLiga/2ªDiv): ${ghMatchedCount}`);
    console.log(`📸 Escudos resueltos vía FotMob TeamLogo: ${fotmobCrestCount}`);
    console.log(`⚠️  Sin resolver: ${unresolvedCrests.length}`);
    if (unresolvedCrests.length > 0) {
        console.log('   Clubs sin resolver:', unresolvedCrests.join(', '));
    }

    // Write updated argentineLogos.ts (zero tmssl links!)
    const logosFileContent = serializeArgentineLogosFile(updatedById, updatedByName);
    fs.writeFileSync(path.join(ROOT, 'services', 'customPacks', 'argentineLogos.ts'), logosFileContent, 'utf8');
    console.log('💾 Actualizado services/customPacks/argentineLogos.ts sin referencias tmssl.');

    // Synchronize Player Faces by Full Club Squad
    const mergedPlayerPhotosById: Record<string, string> = { ...PLAYER_PHOTOS_BY_ID };
    const mergedPlayerPhotosByName: Record<string, string> = { ...PLAYER_PHOTOS_BY_NAME };

    if (!CRESTS_ONLY) {
        console.log('\n👥 Sincronizando rostros por plantel completo vía FotMob Teams API...');
        let clubsQueried = 0;
        let newFacesFound = 0;

        for (let i = 0; i < WORLD_TEAMS.length; i++) {
            const team = WORLD_TEAMS[i];
            if (!team.squad || team.squad.length === 0) continue;

            // Count how many players in this squad still lack photos
            const missingInSquad = team.squad.filter(
                p => !mergedPlayerPhotosById[String(p.id)] && !mergedPlayerPhotosByName[p.name]
            );
            if (missingInSquad.length === 0) continue;

            let teamMatch = teamCache[String(team.id)];
            if (!teamMatch && !OFFLINE) {
                const found = await findFotMobTeam(team);
                if (found) {
                    teamMatch = found;
                    teamCache[String(team.id)] = found;
                }
                await sleep(100);
            }
            if (!teamMatch) continue;

            let members = squadCache[teamMatch.fotmobId];
            if (!members && !OFFLINE) {
                const data = await fetchJson<{ squad?: Array<{ title?: string; members?: FotMobSquadMember[] }> | { squad?: Array<{ title?: string; members?: FotMobSquadMember[] }> } }>(
                    `https://www.fotmob.com/api/data/teams?id=${teamMatch.fotmobId}`
                );
                const rawGroups = Array.isArray(data?.squad)
                    ? data.squad
                    : (data?.squad && 'squad' in data.squad && Array.isArray(data.squad.squad))
                        ? data.squad.squad
                        : [];
                if (rawGroups.length > 0) {
                    members = [];
                    for (const group of rawGroups) {
                        if (group.title?.toLowerCase() === 'coach') continue;
                        for (const m of group.members || []) {
                            if (m.id && m.name) members.push(m);
                        }
                    }
                    squadCache[teamMatch.fotmobId] = members;
                    clubsQueried++;
                    if (clubsQueried % 20 === 0) {
                        console.log(`   ... ${clubsQueried} planteles consultados (+${newFacesFound} rostros nuevos)`);
                        fs.writeFileSync(TEAM_CACHE_FILE, JSON.stringify(teamCache, null, 2), 'utf8');
                        fs.writeFileSync(SQUAD_CACHE_FILE, JSON.stringify(squadCache, null, 2), 'utf8');
                    }
                }
                await sleep(120);
            }

            if (!members || members.length === 0) continue;

            for (const p of missingInSquad) {
                const hit = matchPlayerInSquad(p, members);
                if (hit) {
                    const photoUrl = `https://images.fotmob.com/image_resources/playerimages/${hit.id}.png`;
                    mergedPlayerPhotosById[String(p.id)] = photoUrl;
                    mergedPlayerPhotosByName[p.name] = photoUrl;
                    newFacesFound++;
                }
            }
        }

        fs.writeFileSync(TEAM_CACHE_FILE, JSON.stringify(teamCache, null, 2), 'utf8');
        fs.writeFileSync(SQUAD_CACHE_FILE, JSON.stringify(squadCache, null, 2), 'utf8');

        const photosContent = serializePlayerPhotosFile(mergedPlayerPhotosById, mergedPlayerPhotosByName);
        fs.writeFileSync(path.join(ROOT, 'services', 'customPacks', 'playerPhotos.ts'), photosContent, 'utf8');
        console.log(`✅ Planteles consultados: ${clubsQueried} | Rostros nuevos agregados: +${newFacesFound}`);
    }

    await generateTrophyAndManifestOutputs(updatedById, mergedPlayerPhotosById);
    console.log('\n🏁 Sincronización de Bloque 1 finalizada con éxito.\n');
}

run().catch(err => {
    console.error('❌ Error en syncWorldAssets:', err);
    process.exit(1);
});
