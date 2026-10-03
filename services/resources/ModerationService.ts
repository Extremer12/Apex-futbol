/**
 * RESOURCE SYSTEM: Moderation & Access Control Engine
 * 
 * Enforces role-based permissions and content lifecycle:
 * USER, CREATOR, MODERATOR, ADMIN.
 */

import { UserRole, ModerationStatus } from './ResourceTypes';

export interface ModerationAction {
    id: string;
    targetId: string;
    targetType: 'pack' | 'contribution';
    action: 'approve' | 'reject' | 'hide' | 'flag';
    moderatorId: string;
    reason?: string;
    timestamp: string;
}

export class ModerationService {
    /**
     * Check if a role has permission to perform an action
     */
    public static canPerform(role: UserRole, action: 'upload' | 'moderate' | 'publish_official' | 'delete_any'): boolean {
        switch (action) {
            case 'upload':
                return role === 'USER' || role === 'CREATOR' || role === 'MODERATOR' || role === 'ADMIN';
            case 'moderate':
                return role === 'MODERATOR' || role === 'ADMIN';
            case 'publish_official':
            case 'delete_any':
                return role === 'ADMIN';
            default:
                return false;
        }
    }

    /**
     * Review and set moderation status of a contribution or pack
     */
    public static reviewContent(
        role: UserRole,
        targetId: string,
        newStatus: ModerationStatus,
        reason?: string
    ): boolean {
        if (!this.canPerform(role, 'moderate')) {
            throw new Error('Permisos insuficientes: Se requiere rol MODERATOR o ADMIN para moderar contenido.');
        }

        // In a connected environment, this records to Supabase / Backend.
        console.log(`[Moderation] ${targetId} set to status: ${newStatus}. Reason: ${reason || 'N/A'}`);
        return true;
    }

    /**
     * Report an asset or pack as inappropriate
     */
    public static reportContent(targetId: string, reason: string, reporterId: string): void {
        console.warn(`[Report] User ${reporterId} reported ${targetId}. Reason: ${reason}`);
        // Store report locally or send to backend
        try {
            const raw = localStorage.getItem('apex_content_reports_v1');
            const reports = raw ? JSON.parse(raw) : [];
            reports.push({
                targetId,
                reason,
                reporterId,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('apex_content_reports_v1', JSON.stringify(reports));
        } catch {}
    }
}
