/**
 * RESOURCE SYSTEM: Fallback Engine
 * 
 * Generates zero-network, high-quality vector fallbacks and local placeholders.
 * Guarantees the game UI NEVER breaks if an image is missing or offline.
 */

import { ResourceType } from './ResourceTypes';
import { findTrophySpec, renderTrophySvg } from '../../data/trophyCatalog';

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
     * Fallback for a trophy: Generates distinct vector silhouettes per tournament type.
     * Prioritizes the 40 bespoke competition trophies with engraved competition plaques.
     * Guaranteed zero-network, high-fidelity and 100% App Store compliant.
     */
    public static trophy(name?: string): string {
        const matchedSpec = findTrophySpec(name);
        if (matchedSpec) {
            return `data:image/svg+xml;utf8,${encodeURIComponent(renderTrophySvg(matchedSpec))}`;
        }

        const key = (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // 1. European Cup with large curved handles (Champions League / Europa League)
        if (key.includes('champions') || key.includes('europa') || key.includes('ucl') || key.includes('orejona')) {
            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140">
                <defs>
                    <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="35%" stop-color="#cbd5e1"/>
                        <stop offset="70%" stop-color="#94a3b8"/>
                        <stop offset="100%" stop-color="#475569"/>
                    </linearGradient>
                    <linearGradient id="gold-inner" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fef08a"/>
                        <stop offset="100%" stop-color="#eab308"/>
                    </linearGradient>
                </defs>
                <!-- Large Iconic Handles -->
                <path d="M 32 30 C 10 32, 6 78, 38 82" fill="none" stroke="url(#silver)" stroke-width="6" stroke-linecap="round"/>
                <path d="M 88 30 C 110 32, 114 78, 82 82" fill="none" stroke="url(#silver)" stroke-width="6" stroke-linecap="round"/>
                <!-- Cup Inner Glow & Body -->
                <path d="M 34 22 L 86 22 C 86 52, 78 86, 60 92 C 42 86, 34 52, 34 22 Z" fill="url(#silver)"/>
                <ellipse cx="60" cy="22" rx="26" ry="6" fill="url(#gold-inner)" opacity="0.9"/>
                <!-- Central Emblem Stripe -->
                <line x1="60" y1="28" x2="60" y2="82" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.4"/>
                <!-- Stem & Pedestal Base -->
                <path d="M 54 92 L 66 92 L 68 112 L 52 112 Z" fill="url(#silver)"/>
                <rect x="40" y="112" width="40" height="8" rx="2" fill="#64748b"/>
                <rect x="32" y="120" width="56" height="12" rx="3" fill="#0f172a" stroke="url(#silver)" stroke-width="1.5"/>
            </svg>
            `.trim();
            return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        }

        // 2. Copa Libertadores / Copa Sudamericana (Pedestal cilíndrico de madera + aro y figura)
        if (key.includes('libertadores') || key.includes('sudamericana') || key.includes('conmebol')) {
            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140">
                <defs>
                    <linearGradient id="wood" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#451a03"/>
                        <stop offset="50%" stop-color="#78350f"/>
                        <stop offset="100%" stop-color="#291004"/>
                    </linearGradient>
                    <linearGradient id="bronze-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fde047"/>
                        <stop offset="50%" stop-color="#d97706"/>
                        <stop offset="100%" stop-color="#78350f"/>
                    </linearGradient>
                </defs>
                <!-- Crest Figure on top -->
                <circle cx="60" cy="18" r="7" fill="url(#bronze-gold)"/>
                <path d="M 57 25 L 63 25 L 61 36 L 59 36 Z" fill="url(#bronze-gold)"/>
                <!-- Upper Spherical Body -->
                <circle cx="60" cy="46" r="16" fill="url(#bronze-gold)"/>
                <path d="M 44 46 C 44 38, 76 38, 76 46" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
                <!-- Iconic Tiered Wooden Pedestal -->
                <path d="M 52 62 L 68 62 L 72 82 L 48 82 Z" fill="url(#bronze-gold)"/>
                <rect x="42" y="82" width="36" height="42" rx="3" fill="url(#wood)" stroke="#92400e" stroke-width="1"/>
                <!-- Badges on base -->
                <rect x="46" y="86" width="6" height="5" rx="1" fill="#fef08a" opacity="0.8"/>
                <rect x="57" y="86" width="6" height="5" rx="1" fill="#fef08a" opacity="0.8"/>
                <rect x="68" y="86" width="6" height="5" rx="1" fill="#fef08a" opacity="0.8"/>
                <rect x="46" y="94" width="6" height="5" rx="1" fill="#fef08a" opacity="0.8"/>
                <rect x="57" y="94" width="6" height="5" rx="1" fill="#fef08a" opacity="0.8"/>
                <rect x="68" y="94" width="6" height="5" rx="1" fill="#fef08a" opacity="0.8"/>
                <rect x="34" y="124" width="52" height="10" rx="3" fill="#1c1917" stroke="url(#bronze-gold)" stroke-width="1.5"/>
            </svg>
            `.trim();
            return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        }

        // 3. Intercontinental Cup / World Champion (Globe on golden spiral arches)
        if (key.includes('intercontinental') || key.includes('mundial') || key.includes('world') || key.includes('clubes')) {
            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140">
                <defs>
                    <linearGradient id="gold-world" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fef08a"/>
                        <stop offset="40%" stop-color="#eab308"/>
                        <stop offset="100%" stop-color="#854d0e"/>
                    </linearGradient>
                    <radialGradient id="globe-glow" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stop-color="#60a5fa"/>
                        <stop offset="70%" stop-color="#1d4ed8"/>
                        <stop offset="100%" stop-color="#0f172a"/>
                    </radialGradient>
                </defs>
                <!-- World Globe at top -->
                <circle cx="60" cy="34" r="16" fill="url(#globe-glow)" stroke="url(#gold-world)" stroke-width="2"/>
                <ellipse cx="60" cy="34" rx="16" ry="6" fill="none" stroke="#93c5fd" stroke-width="1" opacity="0.6"/>
                <line x1="60" y1="18" x2="60" y2="50" stroke="#93c5fd" stroke-width="1" opacity="0.6"/>
                <!-- Supporting Golden Arches -->
                <path d="M 38 72 C 36 48, 48 38, 56 34" fill="none" stroke="url(#gold-world)" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M 82 72 C 84 48, 72 38, 64 34" fill="none" stroke="url(#gold-world)" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M 44 86 C 42 66, 60 52, 60 52" fill="none" stroke="url(#gold-world)" stroke-width="3"/>
                <!-- Stem & Base -->
                <path d="M 52 82 L 68 82 L 72 110 L 48 110 Z" fill="url(#gold-world)"/>
                <rect x="36" y="110" width="48" height="8" rx="2" fill="#713f12"/>
                <rect x="30" y="118" width="60" height="14" rx="4" fill="#0f172a" stroke="url(#gold-world)" stroke-width="1.8"/>
            </svg>
            `.trim();
            return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        }

        // 4. Recopa / Supercup Star Amphora (Recopa Sudamericana / Supercopas)
        if (key.includes('recopa') || key.includes('supercup') || key.includes('supercopa')) {
            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140">
                <defs>
                    <linearGradient id="recopa-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="45%" stop-color="#cbd5e1"/>
                        <stop offset="100%" stop-color="#64748b"/>
                    </linearGradient>
                    <linearGradient id="recopa-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fef08a"/>
                        <stop offset="50%" stop-color="#eab308"/>
                        <stop offset="100%" stop-color="#a16207"/>
                    </linearGradient>
                </defs>
                <path d="M 34 32 C 18 28, 16 62, 40 70" fill="none" stroke="url(#recopa-gold)" stroke-width="5" stroke-linecap="round"/>
                <path d="M 86 32 C 102 28, 104 62, 80 70" fill="none" stroke="url(#recopa-gold)" stroke-width="5" stroke-linecap="round"/>
                <path d="M 38 22 L 82 22 L 74 74 C 70 86, 65 92, 60 94 C 55 92, 50 86, 46 74 Z" fill="url(#recopa-silver)" stroke="url(#recopa-gold)" stroke-width="1.5"/>
                <polygon points="60,36 63,45 72,45 65,51 67,60 60,54 53,60 55,51 48,45 57,45" fill="url(#recopa-gold)"/>
                <path d="M 54 94 L 66 94 L 68 112 L 52 112 Z" fill="url(#recopa-gold)"/>
                <rect x="34" y="112" width="52" height="18" rx="3" fill="#0f172a" stroke="url(#recopa-gold)" stroke-width="1.6"/>
            </svg>
            `.trim();
            return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        }

        // 5. Domestic Knockout Cups (FA Cup, Copa del Rey, DFB Pokal, Coppa Italia, Copa Argentina, Carabao)
        if (key.includes('fa_cup') || key.includes('fa cup') || key.includes('copa_del_rey') || key.includes('copa del rey') || key.includes('pokal') || key.includes('coppa') || key.includes('copa_argentina') || key.includes('copa argentina') || key.includes('carabao') || key.includes('copa_mx') || key.includes('copa mx')) {
            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140">
                <defs>
                    <linearGradient id="cup-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f8fafc"/>
                        <stop offset="40%" stop-color="#cbd5e1"/>
                        <stop offset="80%" stop-color="#94a3b8"/>
                        <stop offset="100%" stop-color="#475569"/>
                    </linearGradient>
                    <linearGradient id="cup-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fef08a"/>
                        <stop offset="60%" stop-color="#f59e0b"/>
                        <stop offset="100%" stop-color="#b45309"/>
                    </linearGradient>
                </defs>
                <!-- Crowned Finial Lid -->
                <path d="M 42 24 C 44 14, 76 14, 78 24 Z" fill="url(#cup-gold)"/>
                <circle cx="60" cy="11" r="4" fill="url(#cup-gold)"/>
                <!-- Ornate Handles -->
                <path d="M 34 32 C 18 32, 20 62, 42 66" fill="none" stroke="url(#cup-silver)" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M 86 32 C 102 32, 100 62, 78 66" fill="none" stroke="url(#cup-silver)" stroke-width="4.5" stroke-linecap="round"/>
                <!-- Chalice Body -->
                <path d="M 35 24 L 85 24 C 82 54, 74 82, 60 90 C 46 82, 38 54, 35 24 Z" fill="url(#cup-silver)"/>
                <rect x="39" y="42" width="42" height="7" rx="2" fill="url(#cup-gold)" opacity="0.85"/>
                <!-- Fluted Stem & Two-Tier Plinth -->
                <path d="M 53 90 L 67 90 L 70 112 L 50 112 Z" fill="url(#cup-silver)"/>
                <rect x="42" y="112" width="36" height="7" rx="2" fill="#475569"/>
                <rect x="32" y="119" width="56" height="14" rx="3" fill="#090d16" stroke="url(#cup-silver)" stroke-width="1.6"/>
            </svg>
            `.trim();
            return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        }

        // 6. Meisterschale / Kampioensschaal Plate style trophy (Bundesliga / Eredivisie)
        if (key.includes('bundesliga') || key.includes('zweite') || key.includes('eredivisie') || key.includes('plato') || key.includes('schale')) {
            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140">
                <defs>
                    <linearGradient id="plate-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="40%" stop-color="#e2e8f0"/>
                        <stop offset="80%" stop-color="#94a3b8"/>
                        <stop offset="100%" stop-color="#475569"/>
                    </linearGradient>
                    <radialGradient id="plate-gold" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#fef08a"/>
                        <stop offset="60%" stop-color="#eab308"/>
                        <stop offset="100%" stop-color="#a16207"/>
                    </radialGradient>
                </defs>
                <!-- Shadow Pedestal -->
                <ellipse cx="60" cy="122" rx="38" ry="8" fill="#090d16" opacity="0.6"/>
                <rect x="38" y="114" width="44" height="12" rx="3" fill="#1e293b" stroke="url(#plate-silver)" stroke-width="1.5"/>
                <!-- Plate Body (Tilted 3D perspective) -->
                <circle cx="60" cy="62" r="46" fill="url(#plate-silver)" stroke="#ffffff" stroke-width="2"/>
                <circle cx="60" cy="62" r="36" fill="none" stroke="url(#plate-gold)" stroke-width="4"/>
                <circle cx="60" cy="62" r="22" fill="url(#plate-silver)" stroke="#475569" stroke-width="1"/>
                <circle cx="60" cy="62" r="10" fill="url(#plate-gold)"/>
                <!-- Rays / Gems around circumference -->
                <circle cx="60" cy="24" r="3" fill="url(#plate-gold)"/>
                <circle cx="60" cy="100" r="3" fill="url(#plate-gold)"/>
                <circle cx="22" cy="62" r="3" fill="url(#plate-gold)"/>
                <circle cx="98" cy="62" r="3" fill="url(#plate-gold)"/>
            </svg>
            `.trim();
            return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        }

        // 5. Classic Golden Cup (Default for Leagues and Domestic Cups)
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140">
            <defs>
                <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fef08a"/>
                    <stop offset="35%" stop-color="#facc15"/>
                    <stop offset="70%" stop-color="#ca8a04"/>
                    <stop offset="100%" stop-color="#854d0e"/>
                </linearGradient>
                <linearGradient id="gold-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <!-- Handles -->
            <path d="M 30 35 C 14 36, 14 68, 36 72" fill="none" stroke="url(#gold)" stroke-width="5" stroke-linecap="round"/>
            <path d="M 90 35 C 106 36, 106 68, 84 72" fill="none" stroke="url(#gold)" stroke-width="5" stroke-linecap="round"/>
            <!-- Cup Body -->
            <path d="M 28 24 L 92 24 L 84 74 C 80 88, 70 96, 60 98 C 50 96, 40 88, 36 74 Z" fill="url(#gold)"/>
            <path d="M 32 26 L 88 26 L 82 50 C 70 56, 50 56, 38 50 Z" fill="url(#gold-highlight)"/>
            <!-- Stem & Base -->
            <path d="M 54 98 L 66 98 L 69 116 L 51 116 Z" fill="url(#gold)"/>
            <rect x="40" y="116" width="40" height="8" rx="2" fill="#713f12"/>
            <rect x="32" y="124" width="56" height="12" rx="3" fill="#0f172a" stroke="url(#gold)" stroke-width="1.8"/>
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
                return this.competitionLogo(String(extraMeta?.name || identifier || 'Torneo'));
            case 'trophy':
                return this.trophy(String(identifier || 'Trofeo'));
            case 'flag':
                return this.flag(String(identifier || ''));
            default:
                return this.competitionLogo(String(identifier || 'Club'));
        }
    }
}
