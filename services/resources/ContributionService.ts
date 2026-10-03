/**
 * RESOURCE SYSTEM: Community Contribution Engine
 * 
 * Allows users to submit visual assets (faces, logos, flags, trophies) for game entities.
 * CRITICAL RULE: Users CANNOT alter player stats, ratings, positions, or game IDs.
 * Submissions affect visual assets ONLY and must undergo moderation.
 */

import { ResourceType, UserContribution, ModerationStatus } from './ResourceTypes';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB Max
const ALLOWED_MIME_TYPES = new Set(['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml']);

export class ContributionService {
    private static contributionsKey = 'apex_user_contributions_v1';

    /**
     * Submit a new visual asset for moderation
     */
    public static async submitContribution(params: {
        userId: string;
        userName: string;
        resourceType: ResourceType;
        targetId: string | number;
        targetLabel: string;
        file: File | Blob;
    }): Promise<UserContribution> {
        // 1. Validate file size
        if (params.file.size > MAX_FILE_SIZE_BYTES) {
            throw new Error(`El archivo supera el tamaño máximo permitido de 2 MB (tamaño: ${(params.file.size / 1024 / 1024).toFixed(2)} MB).`);
        }

        // 2. Validate MIME type
        const mime = params.file.type || 'image/webp';
        if (!ALLOWED_MIME_TYPES.has(mime)) {
            throw new Error(`Tipo de archivo no permitido: '${mime}'. Formatos aceptados: WebP, PNG, JPG, SVG.`);
        }

        // 3. Create Contribution Record (Status: pending)
        const record: UserContribution = {
            id: `contrib_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId: params.userId,
            userName: params.userName,
            resourceType: params.resourceType,
            targetId: params.targetId,
            targetLabel: params.targetLabel,
            fileBlob: params.file,
            mimeType: mime,
            sizeBytes: params.file.size,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // Persist locally for user reference
        this.saveLocally(record);

        return record;
    }

    /**
     * Save contribution locally in localStorage
     */
    private static saveLocally(record: UserContribution): void {
        if (typeof window === 'undefined') return;
        try {
            const raw = localStorage.getItem(this.contributionsKey);
            const list: any[] = raw ? JSON.parse(raw) : [];
            // Omit blob from localStorage (store metadata)
            const metaOnly = { ...record, fileBlob: undefined };
            list.push(metaOnly);
            localStorage.setItem(this.contributionsKey, JSON.stringify(list));
        } catch (e) {
            console.warn('ContributionService: Could not save to localStorage:', e);
        }
    }

    /**
     * Get user's submitted contributions
     */
    public static getUserContributions(userId: string): Omit<UserContribution, 'fileBlob'>[] {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem(this.contributionsKey);
            if (!raw) return [];
            const list: UserContribution[] = JSON.parse(raw);
            return list.filter(item => item.userId === userId);
        } catch {
            return [];
        }
    }
}
