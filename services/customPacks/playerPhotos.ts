/**
 * PLAYER FACES & PHOTOS PROVIDER (Community Faces Pack)
 * 
 * Serves authentic player portraits via our own Community CDN / Pack infrastructure.
 * Decoupled from third-party websites (FotMob / Transfermarkt).
 */

import { COMMUNITY_PACK_CDN } from './argentineLogos';

export const PLAYER_FACES_CDN = `${COMMUNITY_PACK_CDN}/Players`;

/**
 * Dynamic resolution proxy for player photos by ID.
 * Returns community CDN WebP path for any registered numeric ID.
 */
export const PLAYER_PHOTOS_BY_ID: Record<number, string> = new Proxy({}, {
    get: (_target, prop) => {
        const id = Number(prop);
        if (!isNaN(id) && id > 0) {
            return `${PLAYER_FACES_CDN}/${id}.webp`;
        }
        return undefined;
    },
    has: (_target, prop) => {
        const id = Number(prop);
        return !isNaN(id) && id > 0;
    }
});

/**
 * Dynamic resolution proxy for player photos by normalized name.
 */
export const PLAYER_PHOTOS_BY_NAME: Record<string, string> = new Proxy({}, {
    get: (_target, prop) => {
        if (typeof prop === 'string' && prop.trim().length > 0) {
            const clean = prop.toLowerCase().replace(/[^a-z0-9]/g, '');
            return `${PLAYER_FACES_CDN}/${clean}.webp`;
        }
        return undefined;
    }
});
