/**
 * RESOURCE SYSTEM: Pack Manifest Validation & Security Engine
 * 
 * Strict sanitization and validation for Pack Manifests.
 * Blocks malicious scripts, path traversal, and ensures declarative safety.
 */

import { PackManifest, PackCategory } from './ResourceTypes';

const VALID_CATEGORIES: Set<PackCategory> = new Set([
    'player-faces',
    'team-logos',
    'league-logos',
    'competition-logos',
    'trophies',
    'flags',
    'kits',
    'stadiums',
    'managers',
    'all-in-one',
    'misc'
]);

const ALLOWED_EXTENSIONS = new Set(['.webp', '.png', '.jpg', '.jpeg', '.svg', '.avif']);

export class PackManifestValidator {
    /**
     * Sanitize a relative or remote asset path.
     * Blocks path traversal (../), dangerous protocols (javascript:), and malformed strings.
     */
    public static sanitizeAssetPath(rawPath: string): string {
        return this.sanitizePath(rawPath);
    }

    public static sanitizePath(rawPath: string): string {
        if (!rawPath || typeof rawPath !== 'string') return '';
        const trimmed = rawPath.trim();

        // 1. Block dangerous URI schemes
        const lower = trimmed.toLowerCase();
        if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:text/html')) {
            throw new Error(`Security Violation: Disallowed scheme in asset path '${trimmed}'`);
        }

        // 2. If it's a full valid HTTPS URL, allow standard CDN URLs
        if (lower.startsWith('https://') || lower.startsWith('http://')) {
            return trimmed;
        }

        // 3. For relative paths, block path traversal
        if (trimmed.includes('..') || trimmed.includes('\\')) {
            throw new Error(`Security Violation: Path traversal detected in '${trimmed}'`);
        }

        // 4. Ensure clean extension
        const hasValidExt = Array.from(ALLOWED_EXTENSIONS).some(ext => lower.endsWith(ext));
        if (!hasValidExt) {
            throw new Error(`Security Violation: Invalid image file extension in '${trimmed}'`);
        }

        // Remove leading slashes for normalized relative storage
        return trimmed.replace(/^\/+/, '');
    }

    /**
     * Validate and sanitize a complete PackManifest
     */
    public static validate(raw: any): PackManifest {
        if (!raw || typeof raw !== 'object') {
            throw new Error('Invalid manifest: Expected an object');
        }

        // 1. Basic Identity
        if (typeof raw.id !== 'string' || !raw.id.trim()) {
            throw new Error('Invalid manifest: "id" must be a non-empty string');
        }
        // ID must be kebab-case or snake_case safe
        const cleanId = raw.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

        if (typeof raw.name !== 'string' || !raw.name.trim()) {
            throw new Error('Invalid manifest: "name" must be a non-empty string');
        }

        // 2. Semver Version Check
        if (typeof raw.version !== 'string' || !/^\d+\.\d+\.\d+/.test(raw.version)) {
            throw new Error('Invalid manifest: "version" must follow semantic versioning (e.g. 1.0.0)');
        }

        // 3. Category Check
        if (!VALID_CATEGORIES.has(raw.category)) {
            throw new Error(`Invalid manifest: Unknown category '${raw.category}'`);
        }

        // 4. Author Check
        const author = raw.author || {};
        if (typeof author.name !== 'string' || !author.name.trim()) {
            throw new Error('Invalid manifest: "author.name" is required');
        }

        // 5. Assets Dictionary Check
        if (!raw.assets || typeof raw.assets !== 'object') {
            throw new Error('Invalid manifest: "assets" dictionary is required');
        }

        const sanitizedAssets: PackManifest['assets'] = {};
        const assetGroups: (keyof PackManifest['assets'])[] = [
            'players', 'teams', 'leagues', 'competitions', 'trophies', 'flags', 'kits', 'stadiums', 'managers', 'misc'
        ];

        let totalAssetCount = 0;

        for (const group of assetGroups) {
            const groupObj = raw.assets[group];
            if (groupObj && typeof groupObj === 'object') {
                sanitizedAssets[group] = {};
                for (const [id, path] of Object.entries(groupObj)) {
                    if (typeof path === 'string') {
                        try {
                            const sanitized = this.sanitizePath(path);
                            if (sanitized) {
                                sanitizedAssets[group]![id] = sanitized;
                                totalAssetCount++;
                            }
                        } catch (err: any) {
                            console.warn(`PackManifest: Skipped invalid asset [${group}][${id}]:`, err.message);
                        }
                    }
                }
            }
        }

        // 6. License Declaration Check
        const license = raw.license || {
            type: 'Community',
            rightsDeclared: true,
            declarationText: 'Pack distribuido para la comunidad de Apex Football.'
        };

        const validated: PackManifest = {
            schemaVersion: raw.schemaVersion || 1,
            id: cleanId,
            name: raw.name.trim(),
            version: raw.version.trim(),
            author: {
                id: author.id || cleanId,
                name: author.name.trim(),
                avatarUrl: author.avatarUrl,
                isVerified: Boolean(author.isVerified || raw.isOfficial),
                role: raw.isOfficial ? 'ADMIN' : (author.role || 'CREATOR'),
                contactUrl: author.contactUrl
            },
            category: raw.category,
            description: raw.description || '',
            tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
            isOfficial: Boolean(raw.isOfficial),
            gameVersionMin: raw.gameVersionMin || '1.0.0',
            gameVersionMax: raw.gameVersionMax,
            assetCount: totalAssetCount || raw.assetCount || 0,
            sizeBytes: raw.sizeBytes || 0,
            checksum: raw.checksum,
            createdAt: raw.createdAt || new Date().toISOString(),
            updatedAt: raw.updatedAt || new Date().toISOString(),
            license,
            status: raw.status || (raw.isOfficial ? 'approved' : 'pending'),
            baseUrl: raw.baseUrl ? raw.baseUrl.replace(/\/+$/, '') : undefined,
            assets: sanitizedAssets
        };

        return validated;
    }
}
