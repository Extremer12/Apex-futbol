/**
 * RESOURCE SYSTEM: Fallback Engine
 * 
 * Generates zero-network, high-quality vector fallbacks and local placeholders.
 * Guarantees the game UI NEVER breaks if an image is missing or offline.
 */

import { ResourceType } from './ResourceTypes';

export class ResourceFallback {
    /**
     * Get clean initials from any name
     */
    public static getInitials(name?: string, maxChars = 2): string {
        if (!name) return '??';
        const clean = name.replace(/\(.*?\)/g, '').replace(/[^a-zA-Z0-9\s]/g, '').trim();
        const parts = clean.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '??';
        if (parts.length === 1) return parts[0].slice(0, maxChars).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    /**
     * Fallback for a player face: Procedural vector silhouette Data URI or local fallback
     */
    public static playerFace(playerOrName?: { name?: string; position?: string } | string): string {
        const name = typeof playerOrName === 'string' ? playerOrName : playerOrName?.name;
        const pos = typeof playerOrName === 'object' ? playerOrName?.position || '' : '';
        const initials = this.getInitials(name, 2);
        
        // Procedural inline SVG with jersey silhouette & initials
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e293b"/>
                    <stop offset="100%" stop-color="#090d16"/>
                </linearGradient>
            </defs>
            <rect width="100" height="100" rx="50" fill="url(#bg)"/>
            <path d="M50 20 C40 20 32 28 32 38 C32 48 40 56 50 56 C60 56 68 48 68 38 C68 28 60 20 50 20 Z" fill="#ffffff" fill-opacity="0.12"/>
            <path d="M22 84 C22 68 34 62 50 62 C66 62 78 68 78 84 Z" fill="#ffffff" fill-opacity="0.12"/>
            <text x="50" y="56" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="20" fill="#f8fafc" opacity="0.9">${initials}</text>
            ${pos ? `<text x="50" y="78" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="700" font-size="9" fill="#94a3b8" letter-spacing="1">${pos}</text>` : ''}
        </svg>
        `.trim();

        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    /**
     * Fallback for a team logo: Procedural split-color vector shield with initials
     */
    public static teamLogo(
        teamOrName?: { name?: string; primaryColor?: string; secondaryColor?: string } | string,
        primaryColor?: string,
        secondaryColor?: string
    ): string {
        const name = typeof teamOrName === 'string' ? teamOrName : (teamOrName?.name || 'Club');
        const initials = this.getInitials(name, 3);
        const pColor = (typeof teamOrName === 'object' && teamOrName?.primaryColor)
            ? teamOrName.primaryColor
            : (primaryColor && primaryColor.startsWith('#') ? primaryColor : '#1e293b');
        const sColor = (typeof teamOrName === 'object' && teamOrName?.secondaryColor)
            ? teamOrName.secondaryColor
            : (secondaryColor && secondaryColor.startsWith('#') ? secondaryColor : '#3b82f6');

        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
            <defs>
                <clipPath id="shield">
                    <path d="M 50,4 C 74,4 92,16 92,36 C 92,78 68,104 50,116 C 32,104 8,78 8,36 C 8,16 26,4 50,4 Z" />
                </clipPath>
                <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
                </linearGradient>
            </defs>
            <g clip-path="url(#shield)">
                <rect x="0" y="0" width="50" height="120" fill="${pColor}" />
                <rect x="50" y="0" width="50" height="120" fill="${sColor}" />
                <line x1="50" y1="0" x2="50" y2="120" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1.5" />
                <rect x="0" y="0" width="100" height="120" fill="url(#gloss)" />
                <circle cx="50" cy="56" r="24" fill="#0a0e17" fill-opacity="0.75" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5" />
                <text x="50" y="63" text-anchor="middle" fill="#ffffff" font-size="${initials.length > 2 ? 14 : 18}" font-weight="900" font-family="-apple-system,BlinkMacSystemFont,sans-serif" letter-spacing="0.5">${initials}</text>
            </g>
            <path d="M 50,4 C 74,4 92,16 92,36 C 92,78 68,104 50,116 C 32,104 8,78 8,36 C 8,16 26,4 50,4 Z" fill="none" stroke="#ffffff" stroke-opacity="0.4" stroke-width="2" />
        </svg>
        `.trim();

        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    public static teamShield(
        teamOrName?: { name?: string; primaryColor?: string; secondaryColor?: string } | string,
        primaryColor?: string,
        secondaryColor?: string
    ): string {
        return this.teamLogo(teamOrName, primaryColor, secondaryColor);
    }

    public static competitionBadge(name?: string): string {
        return this.competitionLogo(name);
    }

    /**
     * Fallback for a competition or league logo
     */
    public static competitionLogo(name?: string): string {
        const initials = this.getInitials(name, 3);
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
            <defs>
                <linearGradient id="comp-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0f172a"/>
                    <stop offset="100%" stop-color="#1e1b4b"/>
                </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#comp-bg)" stroke="#eab308" stroke-opacity="0.4" stroke-width="2"/>
            <path d="M35 30 L65 30 L60 52 C58 60 54 66 50 68 C46 66 42 60 40 52 Z" fill="#eab308" fill-opacity="0.25" stroke="#eab308" stroke-width="1.5"/>
            <path d="M46 68 L54 68 L56 78 L44 78 Z" fill="#eab308" fill-opacity="0.3"/>
            <rect x="40" y="78" width="20" height="4" rx="1" fill="#eab308"/>
            <text x="50" y="47" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="12" fill="#fef08a">${initials}</text>
        </svg>
        `.trim();

        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    /**
     * Fallback for a trophy
     */
    public static trophy(name?: string): string {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140">
            <defs>
                <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fef08a"/>
                    <stop offset="50%" stop-color="#eab308"/>
                    <stop offset="100%" stop-color="#a16207"/>
                </linearGradient>
            </defs>
            <!-- Handles -->
            <path d="M30 35 C15 35 15 65 35 70" fill="none" stroke="url(#gold)" stroke-width="5" stroke-linecap="round"/>
            <path d="M90 35 C105 35 105 65 85 70" fill="none" stroke="url(#gold)" stroke-width="5" stroke-linecap="round"/>
            <!-- Cup Body -->
            <path d="M30 25 L90 25 L82 72 C78 86 68 94 60 96 C52 94 42 86 38 72 Z" fill="url(#gold)"/>
            <!-- Stem & Base -->
            <path d="M54 96 L66 96 L68 114 L52 114 Z" fill="url(#gold)"/>
            <rect x="42" y="114" width="36" height="8" rx="2" fill="#a16207"/>
            <rect x="36" y="122" width="48" height="10" rx="3" fill="#1e293b" stroke="url(#gold)" stroke-width="1.5"/>
        </svg>
        `.trim();

        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    /**
     * Fallback for a country flag
     */
    public static flag(countryCode?: string): string {
        const code = (countryCode || '??').slice(0, 3).toUpperCase();
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" width="60" height="40">
            <rect width="60" height="40" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
            <text x="30" y="25" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="900" font-size="14" fill="#94a3b8" letter-spacing="1">${code}</text>
        </svg>
        `.trim();

        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    /**
     * Generic dispatcher based on ResourceType
     */
    public static forType(type: ResourceType, identifier?: string | number, extraMeta?: any): string {
        switch (type) {
            case 'player-face':
                return this.playerFace(typeof extraMeta === 'object' ? extraMeta : { name: String(identifier || '') });
            case 'team-logo':
                return this.teamLogo(typeof extraMeta === 'object' ? extraMeta : { name: String(identifier || '') });
            case 'league-logo':
            case 'competition-logo':
                return this.competitionLogo(String(identifier || 'Torneo'));
            case 'trophy':
                return this.trophy(String(identifier || 'Trofeo'));
            case 'flag':
                return this.flag(String(identifier || ''));
            default:
                return '/sinlogo.png';
        }
    }
}
