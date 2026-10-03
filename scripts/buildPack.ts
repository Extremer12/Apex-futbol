/**
 * PACK BUILDER CLI TOOL
 * 
 * Command-line tool to build, validate, and bundle custom packs for Apex Football.
 * 
 * Usage:
 *   npx tsx scripts/buildPack.ts --input ./my-pack-input --output ./dist-pack --id "argentina-faces" --name "Argentina Faces 2026"
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface BuildConfig {
    inputDir: string;
    outputDir: string;
    id: string;
    name: string;
    version: string;
    author: string;
    category: string;
    description: string;
    isOfficial: boolean;
    baseUrl?: string;
}

function parseArgs(): BuildConfig {
    const args = process.argv.slice(2);
    const getArg = (flag: string, fallback = '') => {
        const idx = args.indexOf(flag);
        return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
    };

    return {
        inputDir: getArg('--input', './pack-input'),
        outputDir: getArg('--output', './pack-output'),
        id: getArg('--id', 'community-pack-sample'),
        name: getArg('--name', 'Community Asset Pack'),
        version: getArg('--version', '1.0.0'),
        author: getArg('--author', 'Apex Community'),
        category: getArg('--category', 'player-faces'),
        description: getArg('--desc', 'Pack de recursos visuales para Apex Football'),
        isOfficial: args.includes('--official'),
        baseUrl: getArg('--base-url') || undefined
    };
}

function getChecksum(filePath: string): string {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function buildPack(config: BuildConfig) {
    console.log(`📦 [PackBuilder] Iniciando generación de pack: "${config.name}" (v${config.version})`);
    console.log(`📂 Origen: ${config.inputDir} -> Destino: ${config.outputDir}`);

    if (!fs.existsSync(config.inputDir)) {
        console.warn(`⚠️ [PackBuilder] La carpeta de entrada "${config.inputDir}" no existe. Creando directorio de ejemplo...`);
        fs.mkdirSync(path.join(config.inputDir, 'players'), { recursive: true });
        fs.mkdirSync(path.join(config.inputDir, 'teams'), { recursive: true });
    }

    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
    }

    const assetsMap: Record<string, Record<string, string>> = {
        players: {},
        teams: {},
        competitions: {},
        trophies: {},
        flags: {},
        kits: {},
        stadiums: {},
        managers: {}
    };

    let totalAssetCount = 0;
    let totalSizeBytes = 0;

    // Scan each subfolder
    const categories = Object.keys(assetsMap);
    for (const cat of categories) {
        const subfolder = path.join(config.inputDir, cat);
        if (fs.existsSync(subfolder) && fs.statSync(subfolder).isDirectory()) {
            const files = fs.readdirSync(subfolder);
            const outSubfolder = path.join(config.outputDir, cat);
            if (!fs.existsSync(outSubfolder)) {
                fs.mkdirSync(outSubfolder, { recursive: true });
            }

            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                if (['.webp', '.png', '.jpg', '.jpeg', '.svg'].includes(ext)) {
                    const id = path.basename(file, ext);
                    const sourcePath = path.join(subfolder, file);
                    const destRelPath = `${cat}/${file}`;
                    const destFullPath = path.join(config.outputDir, cat, file);

                    // Copy file to output directory
                    fs.copyFileSync(sourcePath, destFullPath);

                    const stats = fs.statSync(destFullPath);
                    totalSizeBytes += stats.size;
                    totalAssetCount++;

                    assetsMap[cat][id] = destRelPath;
                }
            }
        }
    }

    // Build standard PackManifest
    const manifest = {
        schemaVersion: 1,
        id: config.id,
        name: config.name,
        version: config.version,
        author: {
            id: config.author.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: config.author,
            isVerified: config.isOfficial,
            role: config.isOfficial ? 'ADMIN' : 'CREATOR'
        },
        category: config.category,
        description: config.description,
        isOfficial: config.isOfficial,
        gameVersionMin: '1.0.0',
        assetCount: totalAssetCount,
        sizeBytes: totalSizeBytes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        license: {
            type: 'Community',
            rightsDeclared: true,
            declarationText: 'El autor declara contar con los derechos o licencias necesarios para distribuir estos recursos.'
        },
        status: config.isOfficial ? 'approved' : 'pending',
        baseUrl: config.baseUrl,
        assets: assetsMap
    };

    const manifestPath = path.join(config.outputDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    console.log(`✅ [PackBuilder] ¡Pack generado con éxito!`);
    console.log(`   - Total Recursos: ${totalAssetCount}`);
    console.log(`   - Tamaño Total: ${(totalSizeBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Manifest escrito en: ${manifestPath}`);
}

// Run CLI if called directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/')) || process.argv[1]?.includes('buildPack')) {
    buildPack(parseArgs());
}
