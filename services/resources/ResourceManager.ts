/**
 * RESOURCE SYSTEM: Central Resource Manager
 * 
 * The single source of truth for all visual game assets.
 * Decouples core gameplay data from visual assets and provides a clean, extensible API.
 */

import { ResourceType, ResourceResolution } from './ResourceTypes';
import { PackResolver } from './PackResolver';
import { PackManager } from './PackManager';
import { ResourceCache } from './ResourceCache';
type StoreNotifier = () => void;
let packsStoreNotifier: StoreNotifier | null = null;

export function registerPacksStoreNotifier(notifier: StoreNotifier): void {
    packsStoreNotifier = notifier;
}

export class ResourceManager {
    private static instance: ResourceManager | null = null;
    private initialized = false;
    private listeners: Set<() => void> = new Set();

    private constructor() {
        if (typeof window !== 'undefined') {
            PackManager.subscribe(() => {
                // Clear hot memory cache so fresh pack resolutions take effect immediately
                this.notifyState();
            });
        }
    }

    public static getInstance(): ResourceManager {
        if (!this.instance) {
            this.instance = new ResourceManager();
        }
        return this.instance;
    }

    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Notify game store of pack update to re-trigger React component updates
     */
    private notifyState(): void {
        try {
            if (packsStoreNotifier) {
                packsStoreNotifier();
            }
        } catch {}
        this.listeners.forEach(fn => fn());
    }

    /**
     * Resolve any generic resource
     */
    public resolve(type: ResourceType, identifier: string | number, meta?: any): ResourceResolution {
        const packs = PackManager.getInstalledPacks();
        return PackResolver.resolve(type, identifier, packs, meta);
    }

    /**
     * 1. Player Face (Rostros de jugadores)
     * e.g. ResourceManager.playerFace(101, { name: 'B. Saka', position: 'DEL' })
     */
    public playerFace(playerId?: number | string, playerMeta?: { name?: string; position?: string; photo?: string }): string {
        // If player already has a custom direct photo URL explicitly provided
        if (playerMeta?.photo && (playerMeta.photo.startsWith('http://') || playerMeta.photo.startsWith('https://') || playerMeta.photo.startsWith('data:'))) {
            return playerMeta.photo;
        }

        if (playerId === undefined || playerId === null) {
            return this.resolve('player-face', '', playerMeta).url;
        }

        return this.resolve('player-face', playerId, playerMeta).url;
    }

    /**
     * 2. Team Logo (Escudos de equipos)
     * e.g. ResourceManager.teamLogo(701, { name: 'Boca Juniors', primaryColor: '#003366', secondaryColor: '#ffcc00' })
     */
    public teamLogo(teamId?: number | string, teamMeta?: { name?: string; shortName?: string; primaryColor?: string; secondaryColor?: string; logo?: string }): string {
        if (teamId === undefined || teamId === null) {
            return this.resolve('team-logo', '', teamMeta).url;
        }

        return this.resolve('team-logo', teamId, teamMeta).url;
    }

    /**
     * 3. Competition & Tournament Logo (Logos de torneos y copas)
     * e.g. ResourceManager.competitionLogo('champions_league', 'UEFA Champions League')
     */
    public competitionLogo(competitionId: string, name?: string): string {
        return this.resolve('competition-logo', competitionId, { name }).url;
    }

    /**
     * 4. League Logo (Logos de ligas nacionales)
     * e.g. ResourceManager.leagueLogo('PREMIER_LEAGUE')
     */
    public leagueLogo(leagueId: string, name?: string): string {
        return this.resolve('league-logo', leagueId, { name }).url;
    }

    /**
     * 5. Trophy (Copas y trofeos en vitrina)
     * e.g. ResourceManager.trophy('copa_libertadores')
     */
    public trophy(competitionId: string, name?: string): string {
        return this.resolve('trophy', competitionId, { name }).url;
    }

    /**
     * 6. Country Flag (Banderas nacionales)
     * e.g. ResourceManager.countryFlag('ARG')
     */
    public countryFlag(countryCode: string): string {
        return this.resolve('flag', countryCode).url;
    }

    /**
     * 7. Kit (Camisetas de juego)
     */
    public kit(kitId: string, meta?: any): string {
        return this.resolve('kit', kitId, meta).url;
    }

    /**
     * 8. Stadium Image (Estadios)
     */
    public stadium(stadiumId: string, meta?: any): string {
        return this.resolve('stadium', stadiumId, meta).url;
    }

    /**
     * 9. Manager / Coach Photo (Entrenadores)
     */
    public manager(managerId: string, meta?: any): string {
        return this.resolve('manager', managerId, meta).url;
    }

    /**
     * Clear all cached resources across memory and persistent database
     */
    public async clearAllCache(): Promise<void> {
        await ResourceCache.clearAll();
        this.notifyState();
    }
}

// Global exported singleton
export const resourceManager = ResourceManager.getInstance();
