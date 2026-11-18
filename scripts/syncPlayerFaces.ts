/**
 * SCRIPT: Automated Player Faces Synchronizer (FotMob / TheSportsDB)
 * 
 * Automatically resolves and populates real player faces/photos without manual WebP uploads.
 * Sources:
 * 1. TheSportsDB (Open Key 123) -> Transparent Cutouts & Thumbnails (CORS-friendly, Cloudflare R2)
 * 2. FotMob Player Search Suggest API -> Official PNG portraits
 * 
 * Usage:
 *   npm run sync:faces
 *   npm run sync:faces -- --player="Edinson Cavani"
 *   npm run sync:faces -- --team="Boca Juniors"
 *   npm run sync:faces -- --limit=100
 *   npm run sync:faces -- --all
 */

import fs from 'node:fs';
import path from 'node:path';
import { TEAMS } from '../constants';
import { SOUTH_AMERICAN_EXTRA_TEAMS } from '../data/teams/southAmericanClubs';
import { PLAYER_PHOTOS_BY_ID, PLAYER_PHOTOS_BY_NAME } from '../services/customPacks/playerPhotos';

interface PlayerTarget {
    id: number;
    name: string;
    teamName: string;
}

const DELAY_MS = 250; // Respect API rate limits

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanPlayerName(name: string): string {
    return name
        .replace(/^[A-Z]\.\s+/, '') // Remove "B. " in "B. Saka"
        .replace(/\s*\([^)]*\)/g, '') // Remove "(Dibu)"
        .trim();
}

/**
 * Search TheSportsDB for official cutouts or photos
 */
async function searchTheSportsDB(playerName: string): Promise<string | null> {
    const cleaned = cleanPlayerName(playerName);
    const query = cleaned.replace(/\s+/g, '_');
    const url = `https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) });
        if (!res.ok) return null;
        const data = await res.json() as any;
        if (!data?.player || !Array.isArray(data.player) || data.player.length === 0) return null;

        const p = data.player[0];
        // Prefer transparent cutout, fallback to thumb
        if (p.strCutout && p.strCutout.trim() !== '') return p.strCutout;
        if (p.strThumb && p.strThumb.trim() !== '') return p.strThumb;
        return null;
    } catch {
        return null;
    }
}

/**
 * Search FotMob Suggest API for official player portrait
 */
async function searchFotMob(playerName: string): Promise<string | null> {
    const cleaned = cleanPlayerName(playerName);
    const url = `https://apigw.fotmob.com/searchapi/suggest?term=${encodeURIComponent(cleaned)}`;

    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) });
        if (!res.ok) return null;
        const data = await res.json() as any;
        if (!data?.squadMemberSuggest || !Array.isArray(data.squadMemberSuggest) || data.squadMemberSuggest.length === 0) return null;

        const opt = data.squadMemberSuggest[0]?.options?.[0];
        if (!opt || !opt.text) return null;

        const parts = opt.text.split('|');
        if (parts.length >= 2) {
            const fotmobId = parts[1].trim();
            if (/^\d+$/.test(fotmobId)) {
                return `https://images.fotmob.com/image_resources/playerimages/${fotmobId}.png`;
            }
        }
        return null;
    } catch {
        return null;
    }
}

async function resolveFace(playerName: string): Promise<{ url: string; source: string } | null> {
    // 1. Try TheSportsDB transparent cutout (cleanest, best quality)
    const tsdb = await searchTheSportsDB(playerName);
    if (tsdb) {
        return { url: tsdb, source: 'TheSportsDB' };
    }

    await sleep(150);

    // 2. Try FotMob PNG portrait
    const fotmob = await searchFotMob(playerName);
    if (fotmob) {
        return { url: fotmob, source: 'FotMob' };
    }

    return null;
}

async function main() {
    const args = process.argv.slice(2);
    let limit = 50;
    let targetPlayer: string | null = null;
    let targetTeam: string | null = null;
    let syncAll = false;

    for (const a of args) {
        if (a === '--all') syncAll = true;
        if (a.startsWith('--limit=')) limit = parseInt(a.split('=')[1], 10) || 50;
        if (a.startsWith('--player=')) targetPlayer = a.split('=')[1].toLowerCase().trim();
        if (a.startsWith('--team=')) targetTeam = a.split('=')[1].toLowerCase().trim();
    }

    if (syncAll) {
        limit = 999999;
    }

    console.log('='.repeat(60));
    console.log('⚽ APEX AI - AUTOMATED PLAYER FACES SYNCHRONIZER');
    console.log('='.repeat(60));
    if (targetPlayer) console.log(`🔍 Target Player: ${targetPlayer}`);
    if (targetTeam) console.log(`🔍 Target Team: ${targetTeam}`);
    console.log(`📦 Batch Limit: ${syncAll ? 'ALL' : limit} missing players`);

    // 1. Gather all players from active squads
    const allPool: PlayerTarget[] = [];
    const allTeams = [...TEAMS, ...SOUTH_AMERICAN_EXTRA_TEAMS];

    for (const t of allTeams) {
        if (targetTeam && !t.name.toLowerCase().includes(targetTeam)) continue;
        const squad = t.squad || [];
        for (const p of squad) {
            if (!p || !p.id || !p.name) continue;
            if (targetPlayer && !p.name.toLowerCase().includes(targetPlayer)) continue;
            allPool.push({
                id: Number(p.id),
                name: p.name,
                teamName: t.name
            });
        }
    }

    console.log(`📋 Total candidates in scope: ${allPool.length}`);

    // Copy existing maps
    const byIdMap: Record<number, string> = { ...PLAYER_PHOTOS_BY_ID };
    const byNameMap: Record<string, string> = { ...PLAYER_PHOTOS_BY_NAME };

    // Filter to missing players
    const missing: PlayerTarget[] = [];
    for (const p of allPool) {
        const normName = p.name.toLowerCase().trim();
        const cleanNorm = normName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const hasById = !!byIdMap[p.id];
        const hasByName = !!byNameMap[normName] || !!byNameMap[cleanNorm];

        if (!hasById && !hasByName) {
            missing.push(p);
        }
    }

    console.log(`🔎 Total players missing face: ${missing.length}`);
    const toProcess = missing.slice(0, limit);
    console.log(`⚡ Processing ${toProcess.length} players...\n`);

    let foundCount = 0;
    let notFoundCount = 0;

    for (let i = 0; i < toProcess.length; i++) {
        const item = toProcess[i];
        process.stdout.write(`[${i + 1}/${toProcess.length}] ${item.name} (${item.teamName})... `);

        const res = await resolveFace(item.name);
        if (res) {
            console.log(`✅ FOUND via ${res.source}: ${res.url}`);
            byIdMap[item.id] = res.url;
            const normName = item.name.toLowerCase().trim();
            const cleanNorm = normName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            byNameMap[normName] = res.url;
            byNameMap[cleanNorm] = res.url;
            foundCount++;
        } else {
            console.log(`❌ Not found`);
            notFoundCount++;
        }

        await sleep(DELAY_MS);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 SYNC SUMMARY:`);
    console.log(`   - Found & assigned: ${foundCount}`);
    console.log(`   - Unresolved:       ${notFoundCount}`);
    console.log(`   - Total mapped IDs: ${Object.keys(byIdMap).length}`);
    console.log(`   - Total mapped Names: ${Object.keys(byNameMap).length}`);
    console.log('='.repeat(60));

    // Save updated file
    if (foundCount > 0) {
        const targetPath = path.resolve(process.cwd(), 'services/customPacks/playerPhotos.ts');
        
        // Sort IDs numerically
        const sortedIds = Object.keys(byIdMap).map(Number).sort((a, b) => a - b);
        let idEntries = '';
        for (const id of sortedIds) {
            idEntries += `    ${id}: ${JSON.stringify(byIdMap[id])},\n`;
        }

        // Sort names alphabetically
        const sortedNames = Object.keys(byNameMap).sort();
        let nameEntries = '';
        for (const name of sortedNames) {
            nameEntries += `    ${JSON.stringify(name)}: ${JSON.stringify(byNameMap[name])},\n`;
        }

        const fileContent = `/**
 * Player Faces & Photos Database (Player Faces Pack)
 * Provides authentic player portrait and face photos served via verified high-speed CDNs (FotMob / Transfermarkt / TheSportsDB).
 * Generated and updated automatically by scripts/syncPlayerFaces.ts
 */

import { COMMUNITY_PACK_CDN } from './argentineLogos';

export const PLAYER_FACES_CDN = \`\${COMMUNITY_PACK_CDN}/Players\`;

// Mapeo por ID específico de jugador dentro del juego
export const PLAYER_PHOTOS_BY_ID: Record<number, string> = {
${idEntries}};

// Mapeo universal por nombre de futbolista (insensible a mayúsculas, tildes y símbolos)
export const PLAYER_PHOTOS_BY_NAME: Record<string, string> = {
${nameEntries}};
`;

        fs.writeFileSync(targetPath, fileContent, 'utf-8');
        console.log(`💾 Saved updated player photos to services/customPacks/playerPhotos.ts successfully!`);
    } else {
        console.log(`ℹ️ No new faces added. File untouched.`);
    }
}

main().catch(err => {
    console.error('Fatal error in syncPlayerFaces:', err);
    process.exit(1);
});
