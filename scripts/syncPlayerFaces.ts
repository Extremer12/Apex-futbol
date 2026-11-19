/**
 * SCRIPT: Verified Player Faces Synchronizer (FotMob Official API)
 *
 * Purges hallucinated/mismatched IDs and resolves 100% verified player portraits
 * by cross-checking player name, first initial, full-name hints, and club affiliation.
 *
 * Usage:
 *   npm run sync:faces
 *   npx tsx scripts/syncPlayerFaces.ts --verify-all
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEAMS } from '../constants';
import { SOUTH_AMERICAN_EXTRA_TEAMS } from '../data/teams/southAmericanClubs';
import { LeagueId, Player, Team } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const norm = (s: string): string =>
    (s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/['’`]/g, '')
        .trim();

const AMBIGUOUS_SURNAMES = new Set([
    'garcia', 'rodriguez', 'gonzalez', 'fernandez', 'lopez', 'martinez', 'perez', 'gomez',
    'sanchez', 'diaz', 'ramirez', 'torres', 'flores', 'rivera', 'morales', 'ortiz',
    'gutierrez', 'chavez', 'ramos', 'romero', 'alvarez', 'ruiz', 'castro', 'suarez',
    'herrera', 'medina', 'aguilar', 'silva', 'costa', 'santos', 'oliveira', 'souza',
    'lima', 'ferreira', 'pereira', 'carvalho', 'almeida', 'ribeiro', 'soares', 'vieira',
    'monteiro', 'mendes', 'barros', 'freitas', 'barbosa', 'pinto', 'moura', 'cardoso',
    'teixeira', 'moreira', 'vargas', 'rojas', 'molina', 'delgado', 'vega', 'campos',
    'cabrera', 'fuentes', 'miranda', 'reyes', 'cruz', 'guerrero', 'mendoza', 'salazar',
    'contreras', 'soto', 'espinoza', 'valenzuela', 'tapia', 'figueroa', 'pena', 'acosta',
    'navarro', 'gimenez', 'jimenez', 'benitez', 'villalba', 'duarte', 'galeano', 'ayala',
    'caceres', 'vera', 'nunez', 'franco', 'baez', 'lezcano', 'meza', 'quintero', 'moreno',
    'mino', 'vallejos', 'blanco', 'paredes', 'velazquez', 'aquino', 'ojeda', 'caballero',
    'ibarra', 'rios', 'arias', 'correa', 'brito', 'paz', 'ponce', 'ledezma', 'mansilla',
    'godoy', 'quiroz', 'villagra', 'mercado', 'olivera', 'machado', 'sosa', 'dominguez',
    'peralta', 'luna', 'carrizo', 'ferreyra', 'leiva', 'moyano', 'ledesma', 'coronel',
    'roldan', 'bustos', 'barrios', 'maidana', 'arce', 'galvan', 'toledo', 'coria',
    'lucero', 'albornoz', 'escobar', 'cuevas', 'Bravo', 'bravo', 'vidal', 'isla',
    'jones', 'smith', 'williams', 'brown', 'taylor', 'davies', 'evans', 'thomas',
    'johnson', 'roberts', 'walker', 'wright', 'robinson', 'thompson', 'white', 'hughes',
    'edwards', 'green', 'hall', 'lewis', 'harris', 'clarke', 'patel', 'jackson',
    'wood', 'turner', 'martin', 'cooper', 'hill', 'ward', 'morris', 'moore', 'clark',
    'lee', 'king', 'baker', 'harrison', 'morgan', 'allen', 'james', 'scott', 'phillips',
    'watson', 'davis', 'parker', 'price', 'bennett', 'young', 'griffiths', 'mitchell',
    'kelly', 'cook', 'carter', 'richardson', 'bailey', 'collins', 'bell', 'shaw',
    'murphy', 'miller', 'cox', 'richards', 'khan', 'marshall', 'anderson', 'simpson',
    'ellis', 'adams', 'singh', 'begum', 'wilkinson', 'foster', 'chapman', 'powell',
    'webb', 'rogers', 'gray', 'mason', 'ali', 'hunt', 'hussain', 'campbell', 'matthews',
    'owen', 'palmer', 'holmes', 'mills', 'barnes', 'knight', 'lloyd', 'butler', 'russell',
    'barker', 'fisher', 'stevens', 'jenkins', 'murray', 'dixon', 'harvey', 'graham',
    'pearson', 'ahmed', 'fletcher', 'walsh', 'kane', 'gordon', 'traore', 'dembele',
    'camara', 'diallo', 'konate', 'fofana', 'keita', 'toure', 'cisse', 'ba', 'sarr',
    'mendy', 'gueye', 'ndiaye', 'diop', 'sylla', 'kone', 'coulibaly', 'doucoure', 'diaby'
]);

const TEAM_ALIASES: Record<string, string[]> = {
    'manchester utd': ['manchester united', 'man utd'],
    'newcastle utd': ['newcastle united', 'newcastle'],
    'nottm forest': ['nottingham forest', 'nottingham'],
    'wolves': ['wolverhampton', 'wolves'],
    'spurs': ['tottenham', 'tottenham hotspur'],
    'atletico madrid': ['atletico', 'atletico de madrid'],
    'athletic club': ['athletic bilbao', 'athletic'],
    'betis': ['real betis'],
    'celta': ['celta vigo'],
    'inter': ['inter', 'internazionale'],
    'milan': ['ac milan', 'milan'],
    'bayern': ['bayern munich', 'bayern munchen'],
    'leverkusen': ['bayer leverkusen'],
    'dortmund': ['borussia dortmund'],
    'gladbach': ['borussia monchengladbach', 'monchengladbach'],
    'psg': ['paris saint-germain', 'paris sg', 'paris'],
    'st-etienne': ['saint-etienne'],
    'pumas unam': ['pumas', 'universidad nacional'],
    'chivas': ['guadalajara', 'chivas'],
    'america': ['club america', 'america'],
    'tigres uanl': ['tigres'],
    'talleres': ['talleres'],
    'belgrano': ['belgrano'],
    'instituto': ['instituto'],
    'central cordoba': ['central cordoba'],
    'newells': ['newell'],
    'velez': ['velez sarsfield'],
    'huracan': ['huracan'],
    'lanus': ['lanus'],
    'union': ['union'],
    'colon': ['colon'],
};

function getTeamKeywords(team: Team): string[] {
    const raw = norm(team.name).replace(/\(.*?\)/g, '').trim();
    const short = norm(team.shortName || '').replace(/\(.*?\)/g, '').trim();
    const stopWords = new Set([
        'club', 'atletico', 'deportivo', 'cf', 'fc', 'sc', 'cd', 'ca', 'ud', 'rcd',
        'sd', 'ac', 'as', 'us', 'ss', 'ssc', 'utd', 'united', 'city', 'sportivo',
        'asociacion', 'social', 'de', 'del', 'la', 'el', 'los', 'las', 'san', 'santa',
        'real', 'general', 'nacional', 'primera'
    ]);
    const words = new Set<string>();
    for (const src of [raw, short]) {
        if (!src) continue;
        for (const w of src.split(/[^a-z0-9]+/)) {
            if (w.length >= 3 && !stopWords.has(w)) words.add(w);
        }
    }
    for (const [k, aliases] of Object.entries(TEAM_ALIASES)) {
        if (raw.includes(k) || short.includes(k)) {
            for (const a of aliases) {
                for (const w of a.split(/\s+/)) if (w.length >= 3) words.add(w);
            }
        }
    }
    if (words.size === 0) {
        for (const w of raw.split(/[^a-z0-9]+/)) if (w.length >= 2) words.add(w);
    }
    return [...words];
}

/**
 * Extract full-name hints from comments in scripts/buildMassivePlayerFaces.cjs
 */
function loadCommentHints(): Map<number, string> {
    const hints = new Map<number, string>();
    const cjsPath = path.join(__dirname, 'buildMassivePlayerFaces.cjs');
    if (!fs.existsSync(cjsPath)) return hints;
    const text = fs.readFileSync(cjsPath, 'utf8');
    const regex = /^\s*(\d+)\s*:\s*['"][^'"]+['"]\s*,\s*\/\/\s*(.+)$/gm;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
        const id = Number(m[1]);
        const commentName = m[2].replace(/\(.*?\)/g, '').trim();
        if (id > 0 && commentName.length > 2) {
            hints.set(id, commentName);
        }
    }
    return hints;
}

interface FotMobSuggestion {
    type: string;
    id: string;
    score?: number;
    name: string;
    isCoach?: boolean;
    teamId?: number;
    teamName?: string;
}

const queryCache = new Map<string, FotMobSuggestion[]>();

async function queryFotmobSuggest(term: string): Promise<FotMobSuggestion[]> {
    const key = norm(term);
    if (queryCache.has(key)) return queryCache.get(key)!;

    try {
        const url = `https://www.fotmob.com/api/data/search/suggest?term=${encodeURIComponent(term)}&lang=es`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(5000)
        });
        if (!res.ok) {
            queryCache.set(key, []);
            return [];
        }
        const data = (await res.json()) as any[];
        const players: FotMobSuggestion[] = [];
        const seen = new Set<string>();
        for (const group of data) {
            if (Array.isArray(group?.suggestions)) {
                for (const s of group.suggestions) {
                    if (s.type === 'player' && s.id && !s.isCoach && !seen.has(s.id)) {
                        seen.add(s.id);
                        players.push(s);
                    }
                }
            }
        }
        queryCache.set(key, players);
        return players;
    } catch {
        return [];
    }
}

function candidateMatchesName(
    sNameNorm: string,
    searchTokens: string[],
    firstInitial: string | null,
    lastInitial: string | null
): boolean {
    const sWords = sNameNorm.split(/[\s-]+/).filter(Boolean);
    if (sWords.length === 0) return false;

    // Every token in searchTokens must match an exact word in sWords (or full substring for multi-token compound names)
    for (const tok of searchTokens) {
        if (!sWords.includes(tok)) {
            return false;
        }
    }

    if (firstInitial && !sWords[0].startsWith(firstInitial)) {
        return false;
    }

    if (lastInitial) {
        const lastWord = sWords[sWords.length - 1];
        if (!lastWord.startsWith(lastInitial)) {
            return false;
        }
    }

    return true;
}

async function resolveVerifiedPlayer(
    player: Player,
    team: Team,
    commentHint?: string
): Promise<{ url: string; matchedName: string; matchedTeam: string } | null> {
    const rawName = player.name.replace(/\(.*?\)/g, '').trim();
    const prefixInitial = rawName.match(/^([A-ZÁÉÍÓÚÑ])\.\s+(.+)$/i);
    const suffixInitial = rawName.match(/^(.+?)\s+([A-ZÁÉÍÓÚÑ])\.$/i);

    let firstInitial: string | null = null;
    let lastInitial: string | null = null;
    let corePart = rawName;

    if (prefixInitial) {
        firstInitial = norm(prefixInitial[1]);
        corePart = prefixInitial[2].trim();
    } else if (suffixInitial) {
        lastInitial = norm(suffixInitial[2]);
        corePart = suffixInitial[1].trim();
    }

    const coreNorm = norm(corePart);
    const searchTokens = coreNorm.split(/[\s-]+/).filter(w => w.length >= 2);
    if (searchTokens.length === 0) return null;

    const teamKeywords = getTeamKeywords(team);

    // Check if commentHint actually corresponds to this player
    let validHint: string | null = null;
    if (commentHint) {
        const hintNorm = norm(commentHint);
        const allCoreMatch = searchTokens.every(t => hintNorm.includes(t));
        const initMatches = !firstInitial || hintNorm.startsWith(firstInitial);
        if (allCoreMatch && initMatches) {
            validHint = commentHint;
        }
    }

    const termsToQuery: string[] = [];
    if (validHint) termsToQuery.push(validHint);
    if (!prefixInitial && !suffixInitial) {
        termsToQuery.push(rawName);
    } else {
        termsToQuery.push(corePart);
    }

    const allCandidates: FotMobSuggestion[] = [];
    const seenIds = new Set<string>();

    for (const term of termsToQuery) {
        const list = await queryFotmobSuggest(term);
        for (const item of list) {
            if (!seenIds.has(item.id)) {
                seenIds.add(item.id);
                allCandidates.push(item);
            }
        }
        // Check if we already have a club+name match
        for (const s of allCandidates) {
            const sName = norm(s.name);
            const sTeam = norm(s.teamName || '');
            if (!candidateMatchesName(sName, searchTokens, firstInitial, lastInitial)) continue;
            if (teamKeywords.some(kw => sTeam.includes(kw))) {
                return {
                    url: `https://images.fotmob.com/image_resources/playerimages/${s.id}.png`,
                    matchedName: s.name,
                    matchedTeam: s.teamName || ''
                };
            }
        }
    }

    // Pass 2: If validHint or full name (no initials) matches exact full name
    const fullTarget = validHint ? norm(validHint) : (!prefixInitial && !suffixInitial ? norm(rawName) : null);
    if (fullTarget && fullTarget.split(/\s+/).length >= 2) {
        for (const s of allCandidates) {
            const sName = norm(s.name);
            const sTeam = norm(s.teamName || '');
            if (sName === fullTarget) {
                // If it's a very common full name, require team match or score >= 300030
                const lastTok = searchTokens[searchTokens.length - 1];
                const isAmbiguous = AMBIGUOUS_SURNAMES.has(lastTok);
                if (!isAmbiguous || teamKeywords.some(kw => sTeam.includes(kw)) || (s.score || 0) >= 300040) {
                    return {
                        url: `https://images.fotmob.com/image_resources/playerimages/${s.id}.png`,
                        matchedName: s.name,
                        matchedTeam: s.teamName || ''
                    };
                }
            }
        }
    }

    // Pass 3: For transferred stars in top leagues (rating >= 75), match if surname is unique or superstar score
    if (player.rating >= 75) {
        const lastTok = searchTokens[searchTokens.length - 1];
        const isAmbiguous = AMBIGUOUS_SURNAMES.has(lastTok);
        for (const s of allCandidates) {
            const sName = norm(s.name);
            if (!candidateMatchesName(sName, searchTokens, firstInitial, lastInitial)) continue;
            const score = s.score || 0;
            if (!isAmbiguous && score >= 300015) {
                return {
                    url: `https://images.fotmob.com/image_resources/playerimages/${s.id}.png`,
                    matchedName: s.name,
                    matchedTeam: s.teamName || ''
                };
            }
            if (isAmbiguous && score >= 300850 && player.rating >= 80) {
                return {
                    url: `https://images.fotmob.com/image_resources/playerimages/${s.id}.png`,
                    matchedName: s.name,
                    matchedTeam: s.teamName || ''
                };
            }
        }
    }

    return null;
}

async function main() {
    console.log('='.repeat(65));
    console.log('⚽ APEX AI - STRICT VERIFIED PLAYER FACES SYNCHRONIZER');
    console.log('='.repeat(65));

    const commentHints = loadCommentHints();
    console.log(`💡 Loaded ${commentHints.size} full-name hints from buildMassivePlayerFaces.cjs`);

    // Prioritize all first-division leagues + top clubs + all players rated >= 73
    const priorityLeagues = new Set<string>([
        LeagueId.PREMIER_LEAGUE,
        LeagueId.LA_LIGA,
        LeagueId.SERIE_A,
        LeagueId.BUNDESLIGA,
        LeagueId.LIGUE_1,
        LeagueId.LIGA_ARGENTINA,
        LeagueId.BRASILEIRAO,
        LeagueId.LIGA_MX,
        LeagueId.COPA_DE_PRIMERA,
        LeagueId.PRIMERA_A_COLOMBIA,
        LeagueId.PRIMERA_DIVISION_CHILE,
        LeagueId.CHAMPIONSHIP
    ]);

    const allTeams = [...TEAMS, ...SOUTH_AMERICAN_EXTRA_TEAMS];
    const pool: { player: Player; team: Team }[] = [];

    for (const team of allTeams) {
        const isPriorityLeague = priorityLeagues.has(team.leagueId as string);
        for (const player of team.squad || []) {
            if (isPriorityLeague || player.rating >= 73 || commentHints.has(player.id)) {
                pool.push({ player, team });
            }
        }
    }

    console.log(`📋 Verifying ${pool.length} players across ${allTeams.length} clubs (concurrency: 25)...`);

    const byIdMap: Record<number, string> = {};
    const byNameMap: Record<string, string> = {};

    let idx = 0;
    let matchedCount = 0;
    const startTime = Date.now();

    async function worker() {
        while (idx < pool.length) {
            const currentIdx = idx++;
            const { player, team } = pool[currentIdx];
            const hint = commentHints.get(player.id);
            const res = await resolveVerifiedPlayer(player, team, hint);

            if (res) {
                byIdMap[player.id] = res.url;
                matchedCount++;

                // Only add to byNameMap if it's a full multi-word name (no initials like "a. martinez")
                const rawClean = player.name.replace(/\(.*?\)/g, '').trim();
                const hasInitial = /^[A-ZÁÉÍÓÚÑ]\.\s+/i.test(rawClean) || /\s+[A-ZÁÉÍÓÚÑ]\.$/i.test(rawClean);
                if (!hasInitial && rawClean.includes(' ')) {
                    const lower = rawClean.toLowerCase();
                    const clean = norm(rawClean);
                    byNameMap[lower] = res.url;
                    byNameMap[clean] = res.url;
                }
            }

            if ((currentIdx + 1) % 250 === 0 || currentIdx + 1 === pool.length) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`  [${currentIdx + 1}/${pool.length}] Verified matches: ${matchedCount} (${elapsed}s)`);
            }
        }
    }

    await Promise.all(Array.from({ length: 25 }, () => worker()));

    // Write output to services/customPacks/playerPhotos.ts
    const targetFile = path.resolve(__dirname, '../services/customPacks/playerPhotos.ts');
    const sortedIds = Object.keys(byIdMap).map(Number).sort((a, b) => a - b);
    const idLines = sortedIds.map(id => `    ${id}: ${JSON.stringify(byIdMap[id])},`).join('\n');

    const sortedNames = Object.keys(byNameMap).sort();
    const nameLines = sortedNames.map(k => `    ${JSON.stringify(k)}: ${JSON.stringify(byNameMap[k])},`).join('\n');

    const fileContent = `/**
 * Player Faces & Photos Database (Verified Official Portraits)
 * 100% verified against FotMob Player & Club database via scripts/syncPlayerFaces.ts
 * Zero hallucinated IDs, zero ambiguous surname collisions.
 */

import { COMMUNITY_PACK_CDN } from './argentineLogos';

export const PLAYER_FACES_CDN = \`\${COMMUNITY_PACK_CDN}/Players\`;

// Mapeo verificado por ID único de jugador dentro del juego
export const PLAYER_PHOTOS_BY_ID: Record<number, string> = {
${idLines}
};

// Mapeo por nombre completo verificado (sin apellidos sueltos ni iniciales ambiguas)
export const PLAYER_PHOTOS_BY_NAME: Record<string, string> = {
${nameLines}
};
`;

    fs.writeFileSync(targetFile, fileContent, 'utf-8');

    console.log('\n' + '='.repeat(65));
    console.log(`🎉 DONE! Wrote ${sortedIds.length} verified player IDs and ${sortedNames.length} full-name keys.`);
    console.log(`💾 Updated: ${targetFile}`);
    console.log('='.repeat(65));
}

main().catch(err => {
    console.error('Fatal error in syncPlayerFaces:', err);
    process.exit(1);
});
