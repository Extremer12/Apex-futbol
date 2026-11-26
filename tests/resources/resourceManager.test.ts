import test from 'node:test';
import assert from 'node:assert/strict';
import { resourceManager } from '../../services/resources/ResourceManager';
import { ResourceFallback } from '../../services/resources/ResourceFallback';
import { ResourceCache } from '../../services/resources/ResourceCache';
import { PackManifestValidator } from '../../services/resources/PackManifest';
import { PackResolver } from '../../services/resources/PackResolver';
import { PackManager, sanitizeSvgContent } from '../../services/resources/PackManager';
import { ContributionService } from '../../services/resources/ContributionService';
import { ModerationService } from '../../services/resources/ModerationService';
import { PackCatalog } from '../../services/resources/PackCatalog';
import { DefaultResourceProvider } from '../../services/resources/providers/DefaultResourceProvider';
import { InstalledPack, PackManifest } from '../../services/resources/ResourceTypes';

test('RESOURCE SYSTEM: ResourceFallback generates valid SVG data URIs', () => {
    // Player silhouette
    const playerFallback = ResourceFallback.playerFace('Bukayo Saka');
    assert.ok(playerFallback.startsWith('data:image/svg+xml;utf8,'));
    assert.ok(playerFallback.includes('%3Csvg') || playerFallback.includes('<svg'));
    assert.ok(playerFallback.includes('BS')); // Initials

    // Empty/undefined player name
    const emptyPlayer = ResourceFallback.playerFace();
    assert.ok(emptyPlayer.startsWith('data:image/svg+xml;utf8,'));
    assert.ok(emptyPlayer.includes('%3F%3F') || emptyPlayer.includes('??'));

    // Team Shield
    const shieldFallback = ResourceFallback.teamShield('Arsenal FC', '#EF0107', '#063672');
    assert.ok(shieldFallback.startsWith('data:image/svg+xml;utf8,'));
    assert.ok(shieldFallback.includes('%23EF0107') || shieldFallback.includes('#EF0107'));

    // Competition badge
    const compFallback = ResourceFallback.competitionBadge('Premier League');
    assert.ok(compFallback.startsWith('data:image/svg+xml;utf8,'));

    // Trophy 3D render
    const trophyFallback = ResourceFallback.trophy('Champions League');
    assert.ok(trophyFallback.startsWith('data:image/svg+xml;utf8,'));

    // Country flag
    const flagFallback = ResourceFallback.flag('ARG');
    assert.ok(flagFallback.startsWith('data:image/svg+xml;utf8,'));
    assert.ok(flagFallback.includes('ARG'));
});

test('RESOURCE SYSTEM: Manifest Security Validator blocks malicious content', () => {
    // 1. Valid Manifest
    const validManifest = {
        schemaVersion: 1,
        id: 'test-pack-2026',
        name: 'Test Pack',
        version: '1.0.0',
        category: 'player-faces',
        author: { id: 'u1', name: 'Tester' },
        description: 'A test pack for faces',
        assets: {
            players: {
                '101': 'players/101.webp'
            }
        }
    };
    const validated = PackManifestValidator.validate(validManifest);
    assert.equal(validated.id, 'test-pack-2026');
    assert.equal(validated.assets.players?.['101'], 'players/101.webp');

    // 2. Reject path traversal
    assert.throws(() => {
        PackManifestValidator.sanitizeAssetPath('../../etc/passwd');
    }, /Path traversal detected/);

    // 3. Reject executable or forbidden extensions
    assert.throws(() => {
        PackManifestValidator.sanitizeAssetPath('scripts/exploit.js');
    }, /Invalid image file extension/);

    // 4. Reject dangerous URI schemes
    assert.throws(() => {
        PackManifestValidator.sanitizeAssetPath('javascript:alert(1)');
    }, /Disallowed scheme/);

    // 5. Reject missing mandatory fields in validate
    assert.throws(() => {
        PackManifestValidator.validate({
            name: 'Incomplete'
        });
    }, /"id" must be a non-empty string/);
});

test('RESOURCE SYSTEM: PackResolver handles Priority Cascading and Overrides', () => {
    const packLowPriority: InstalledPack = {
        packId: 'global-faces',
        name: 'Global Faces Pack',
        version: '1.0.0',
        category: 'player-faces',
        enabled: true,
        priority: 10,
        installedAt: Date.now(),
        lastUpdated: Date.now(),
        assetCount: 1,
        sizeBytes: 1000,
        isOfficial: false,
        manifest: PackManifestValidator.validate({
            schemaVersion: 1,
            id: 'global-faces',
            name: 'Global Faces Pack',
            version: '1.0.0',
            category: 'player-faces',
            author: { id: 'u1', name: 'Author' },
            description: '',
            assets: {
                players: {
                    '101': 'https://cdn.example.com/global/101.webp'
                }
            }
        })
    };

    const packHighPriority: InstalledPack = {
        packId: 'argentina-faces-hd',
        name: 'Argentina Faces HD',
        version: '1.5.0',
        category: 'player-faces',
        enabled: true,
        priority: 50, // Higher priority
        installedAt: Date.now(),
        lastUpdated: Date.now(),
        assetCount: 1,
        sizeBytes: 2000,
        isOfficial: true,
        manifest: PackManifestValidator.validate({
            schemaVersion: 1,
            id: 'argentina-faces-hd',
            name: 'Argentina Faces HD',
            version: '1.5.0',
            category: 'player-faces',
            author: { id: 'dev', name: 'Cristian' },
            description: '',
            assets: {
                players: {
                    '101': 'https://cdn.example.com/argentina-hd/101.webp'
                }
            }
        })
    };

    // Both installed: High priority (50) should win
    ResourceCache.clearMemory();
    const resolution1 = PackResolver.resolve(
        'player-face',
        '101',
        [packLowPriority, packHighPriority]
    );
    assert.equal(resolution1.url, 'https://cdn.example.com/argentina-hd/101.webp');
    assert.equal(resolution1.packId, 'argentina-faces-hd');

    // If high priority pack is disabled, low priority should win
    ResourceCache.clearMemory();
    const packHighDisabled = { ...packHighPriority, enabled: false };
    const resolution2 = PackResolver.resolve(
        'player-face',
        '101',
        [packLowPriority, packHighDisabled]
    );
    assert.equal(resolution2.url, 'https://cdn.example.com/global/101.webp');
    assert.equal(resolution2.packId, 'global-faces');

    // If both disabled, fallback to Default Community Provider (clean CDN, zero FotMob)
    ResourceCache.clearMemory();
    const packLowDisabled = { ...packLowPriority, enabled: false };
    const resolution3 = PackResolver.resolve(
        'player-face',
        '101',
        [packLowDisabled, packHighDisabled]
    );
    assert.ok(resolution3.url.includes('/Players/101.webp') || resolution3.url.includes('playerimages/961995.png'));
    assert.equal(resolution3.isFallback, false);
});

test('RESOURCE SYSTEM: ResourceManager public API endpoints', () => {
    // 1. Player face
    const sakaFace = resourceManager.playerFace(101, { name: 'Bukayo Saka' });
    assert.ok(sakaFace.length > 0);
    assert.ok(sakaFace.includes('playerimages/961995.png') || sakaFace.includes('/Players/101.webp'));

    // 2. Team logo (Boca Juniors - 701)
    const bocaLogo = resourceManager.teamLogo(701, { name: 'Boca Juniors' });
    assert.ok(bocaLogo.length > 0);
    assert.ok(!bocaLogo.includes('fotmob.com'));

    // 3. Tournament Logo
    const uclLogo = resourceManager.competitionLogo('CHAMPIONS_LEAGUE');
    assert.ok(uclLogo.includes('champions-league'));

    // 4. Country Flag
    const argFlag = resourceManager.countryFlag('ARG');
    assert.ok(argFlag.includes('flagcdn.com/ar.svg') || argFlag.startsWith('data:image/svg+xml'));

    // 5. Unknown entity returns guaranteed procedural SVG without crashing
    const unknownClub = resourceManager.teamLogo('unknown_club_9999', { name: 'Mystic FC' });
    assert.ok(unknownClub.startsWith('data:image/svg+xml;utf8,'));
    assert.ok(unknownClub.includes('%3Csvg') || unknownClub.includes('<svg'));
});

test('RESOURCE SYSTEM: Semver update detector', () => {
    assert.equal(PackManager.isNewerVersion('1.0.0', '1.0.1'), true);
    assert.equal(PackManager.isNewerVersion('1.0.0', '1.1.0'), true);
    assert.equal(PackManager.isNewerVersion('1.0.0', '2.0.0'), true);
    assert.equal(PackManager.isNewerVersion('1.2.3', '1.2.3'), false);
    assert.equal(PackManager.isNewerVersion('2.0.0', '1.9.9'), false);
});

test('RESOURCE SYSTEM: Contribution Service validates inputs and protects stats', async () => {
    // 1. Reject invalid file size
    const largeBlob = new Blob([new Uint8Array(3 * 1024 * 1024)], { type: 'image/png' });
    await assert.rejects(async () => {
        await ContributionService.submitContribution({
            userId: 'user_1',
            userName: 'Test User',
            resourceType: 'player-face',
            targetId: 101,
            targetLabel: 'Bukayo Saka',
            file: largeBlob
        });
    }, /supera el tamaño máximo/);

    // 2. Reject disallowed MIME type
    const exeBlob = new Blob(['malicious'], { type: 'application/x-msdownload' });
    await assert.rejects(async () => {
        await ContributionService.submitContribution({
            userId: 'user_1',
            userName: 'Test User',
            resourceType: 'player-face',
            targetId: 101,
            targetLabel: 'Bukayo Saka',
            file: exeBlob
        });
    }, /Tipo de archivo no permitido/);

    // 3. Valid submission succeeds with pending status
    const validBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' });
    const record = await ContributionService.submitContribution({
        userId: 'user_1',
        userName: 'Test User',
        resourceType: 'player-face',
        targetId: 101,
        targetLabel: 'Bukayo Saka',
        file: validBlob
    });

    assert.equal(record.status, 'pending');
    assert.equal(record.targetId, 101);
    assert.equal(record.targetLabel, 'Bukayo Saka');
    assert.ok(record.id.startsWith('contrib_'));
});

test('RESOURCE SYSTEM: Moderation Service enforces role security', () => {
    // USER cannot moderate
    assert.equal(ModerationService.canPerform('USER', 'moderate'), false);
    assert.equal(ModerationService.canPerform('CREATOR', 'moderate'), false);

    // MODERATOR and ADMIN can moderate
    assert.equal(ModerationService.canPerform('MODERATOR', 'moderate'), true);
    assert.equal(ModerationService.canPerform('ADMIN', 'moderate'), true);

    // Only ADMIN can publish official packs
    assert.equal(ModerationService.canPerform('USER', 'publish_official'), false);
    assert.equal(ModerationService.canPerform('MODERATOR', 'publish_official'), false);
    assert.equal(ModerationService.canPerform('ADMIN', 'publish_official'), true);

    // Unauthorized review throws
    assert.throws(() => {
        ModerationService.reviewContent('USER', 'pack_1', 'approved');
    }, /Permisos insuficientes/);

    // Authorized review succeeds
    const reviewed = ModerationService.reviewContent('ADMIN', 'pack_1', 'approved');
    assert.equal(reviewed, true);
});

test('RESOURCE SYSTEM: Modular Catalog search, scoped bundles, batch install, and abort cancellation', async () => {
    // 1. Smart search matches club names cleanly
    const bocaResults = PackCatalog.getCatalog({ query: 'Boca Juniors' });
    assert.equal(bocaResults.length, 1);
    assert.equal(bocaResults[0].id, 'south-america-logos');
    assert.equal(PackCatalog.findMatchReason(bocaResults[0], 'Boca'), 'Boca Juniors');

    const realMadridResults = PackCatalog.getCatalog({ query: 'Real Madrid' });
    assert.equal(realMadridResults.length, 1);
    assert.equal(realMadridResults[0].id, 'europe-logos');

    // 2. Scoped bundles isolate regions accurately
    const saBoca = DefaultResourceProvider.resolveForBundle('south-america-logos', 'team-logo', 701, { name: 'Boca Juniors' });
    assert.ok(saBoca && saBoca.url.includes('boca-juniors'));
    const saArsenal = DefaultResourceProvider.resolveForBundle('south-america-logos', 'team-logo', 1, { name: 'Arsenal' });
    assert.equal(saArsenal, null);
    const euArsenal = DefaultResourceProvider.resolveForBundle('europe-logos', 'team-logo', 1, { name: 'Arsenal' });
    assert.ok(euArsenal && euArsenal.url.includes('arsenal'));

    // 3. Batch install works and respects AbortSignal cancellation
    await PackManager.clearAllPacks();
    const abortCtrl = new AbortController();
    abortCtrl.abort();
    await assert.rejects(async () => {
        await PackManager.installAllCatalogPacks(PackCatalog.getCatalog(), { signal: abortCtrl.signal });
    }, /cancelada/);

    const batchRes = await PackManager.installAllCatalogPacks(PackCatalog.getCatalog());
    assert.equal(batchRes.errors.length, 0);
    assert.equal(batchRes.installed, PackCatalog.getCatalog().length);
    assert.equal(PackManager.getInstalledPacks().length, PackCatalog.getCatalog().length);

    // 4. Pausing a single modular pack stops resolving via that bundle in PackResolver while keeping others active
    ResourceCache.clearMemory();
    PackManager.setPackEnabled('south-america-logos', false);
    const saPaused = PackResolver.resolve('team-logo', 701, PackManager.getInstalledPacks(), { name: 'Boca Juniors' });
    assert.notEqual(saPaused.packId, 'south-america-logos');
    const euActive = PackResolver.resolve('team-logo', 1, PackManager.getInstalledPacks(), { name: 'Arsenal' });
    assert.equal(euActive.packId, 'europe-logos');
    await PackManager.clearAllPacks();
});

test('RESOURCE SYSTEM: Country flag bundle scoping, ZIP SVG sanitization, and ZIP priority override', async () => {
    const JSZip = (await import('jszip')).default;

    // 1. Country flags resolve cleanly for both ISO codes and localized names
    const engFlag = DefaultResourceProvider.resolveForBundle('flags-pack', 'flag', 'Inglaterra');
    assert.ok(engFlag && engFlag.url.includes('flagcdn.com/gb-eng.svg'));
    const scoFlag = DefaultResourceProvider.resolveCountryFlag('SCO');
    assert.ok(scoFlag && scoFlag.url.includes('flagcdn.com/gb-sct.svg'));

    // 2. Build an in-memory .ZIP pack with malicious SVG payload to test sanitizer & idb resolution
    const zip = new JSZip();
    const dirtySvg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>evil()</script><circle cx="10" cy="10" r="8"/></svg>';
    zip.folder('teams')?.file('Boca Juniors.svg', dirtySvg);
    zip.folder('leagues')?.file('PREMIER_LEAGUE.svg', dirtySvg);
    const zipBytes = await zip.generateAsync({ type: 'uint8array' });

    await PackManager.clearAllPacks();
    // Install catalog bundle (priority 15) and local ZIP (priority 30)
    await PackManager.installCatalogPack(PackCatalog.getItem('south-america-logos')!);
    const localZipPack = await PackManager.installZipFile(zipBytes, { name: 'custom-shields.zip' });
    assert.equal(localZipPack.assetCount, 2);
    assert.equal(localZipPack.priority, 30);

    // Highest priority ZIP overrides catalog bundle seamlessly
    ResourceCache.clearMemory();
    const customRes = PackResolver.resolve('team-logo', 701, PackManager.getInstalledPacks(), { name: 'Boca Juniors' });
    assert.equal(customRes.packId, localZipPack.packId);

    // Ensure league-logo lookup resolves asset imported under leagues/ folder
    const customLeague = PackResolver.resolve('league-logo', 'PREMIER_LEAGUE', PackManager.getInstalledPacks(), { name: 'Premier League' });
    assert.equal(customLeague.packId, localZipPack.packId);

    // Check SVG sanitization strips script, foreignObject, and inline event handlers
    const cleanSvg = sanitizeSvgContent(dirtySvg);
    assert.equal(cleanSvg.includes('<script'), false);
    assert.equal(cleanSvg.includes('onload='), false);
    assert.ok(cleanSvg.includes('<circle'));

    await PackManager.clearAllPacks();
});

test('RESOURCE SYSTEM: Full 383-club crest resolution (zero tmssl/broken /logos) & Trophy SVG pack', async () => {
    const JSZip = (await import('jszip')).default;
    const { TEAMS } = await import('../../constants');
    const { SOUTH_AMERICAN_EXTRA_TEAMS } = await import('../../data/teams/southAmericanClubs');

    const worldTeams = Array.from(new Map([...TEAMS, ...SOUTH_AMERICAN_EXTRA_TEAMS].map(t => [t.id, t])).values());
    assert.ok(worldTeams.length >= 433, `Expected at least 433 clubs across all 26 leagues + CONMEBOL, got ${worldTeams.length}`);

    for (const club of worldTeams) {
        // Base team objects must not carry hotlinked tmssl or missing /logos/ paths (Play Store compliance)
        assert.equal(club.logo.includes('tmssl.akamaized.net'), false, `Base club ${club.name} must not hardcode tmssl`);
        assert.equal(club.logo.startsWith('/logos/'), false, `Base club ${club.name} must not reference missing /logos/`);

        const resolved = DefaultResourceProvider.resolveTeamLogo(club.id, club);
        assert.ok(resolved && resolved.url, `Expected community crest resolution for ${club.name} (${club.id})`);
        assert.equal(resolved.url.includes('tmssl.akamaized.net'), false, `Resolved crest for ${club.name} must not use tmssl`);
        assert.equal(resolved.url.startsWith('/logos/'), false, `Resolved crest for ${club.name} must not use /logos/`);
    }

    // Distinct fallback & community trophy silhouettes
    const recopaFb = ResourceFallback.trophy('Recopa Sudamericana');
    const faCupFb = ResourceFallback.trophy('FA Cup');
    assert.ok(recopaFb.startsWith('data:image/svg+xml') && faCupFb.startsWith('data:image/svg+xml'));
    assert.notEqual(recopaFb, faCupFb);
    assert.equal(ResourceFallback.forType('league-logo', 'UNKNOWN').includes('sinlogo.png'), false);

    // Real downloadable SVG trophies ZIP import & case-insensitive ID resolution
    const zip = new JSZip();
    const sampleSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#eab308"/></svg>';
    zip.folder('trophies')?.file('recopa_sudamericana.svg', sampleSvg);
    zip.folder('trophies')?.file('fa_cup.svg', sampleSvg);
    const bytes = await zip.generateAsync({ type: 'uint8array' });

    await PackManager.clearAllPacks();
    const trophyPack = await PackManager.installZipFile(bytes, { name: 'trophies-custom.zip' });
    assert.equal(trophyPack.assetCount, 2);

    ResourceCache.clearMemory();
    const recopaRes = PackResolver.resolve('trophy', 'RECOPA_SUDAMERICANA', PackManager.getInstalledPacks(), { name: 'Recopa Sudamericana' });
    assert.equal(recopaRes.packId, trophyPack.packId);
    const faRes = PackResolver.resolve('trophy', 'FA_CUP', PackManager.getInstalledPacks(), { name: 'FA Cup' });
    assert.equal(faRes.packId, trophyPack.packId);

    await PackManager.clearAllPacks();
});
