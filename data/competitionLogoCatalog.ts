/**
 * Bespoke Vector SVG Logos for Competitions without External CDN Assets
 * Ensures 100% visual coverage across Domestic Cups, Supercups, Recopa Sudamericana & Rankings
 * with zero broken 404 image requests and full offline / Play Store compliance.
 */

export interface CompetitionBadgeSpec {
    id: string;
    label: string;
    sublabel?: string;
    primaryHex: string;
    secondaryHex: string;
    accentHex: string;
    motif: 'crown' | 'chalice' | 'shield' | 'star' | 'globe' | 'hexagon';
}

function buildCompetitionBadgeUri(spec: CompetitionBadgeSpec): string {
    const uid = spec.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bgId = `cbg_${uid}`;
    const accentId = `cac_${uid}`;

    let centerGlyph = '';
    switch (spec.motif) {
        case 'crown':
            centerGlyph = `
                <path d="M 30 46 L 34 26 L 44 36 L 50 22 L 56 36 L 66 26 L 70 46 Z" fill="url(#${accentId})" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
                <rect x="30" y="48" width="40" height="5" rx="2.5" fill="url(#${accentId})"/>
            `;
            break;
        case 'hexagon':
            centerGlyph = `
                <polygon points="50,16 74,30 74,56 50,70 26,56 26,30" fill="none" stroke="url(#${accentId})" stroke-width="3"/>
                <path d="M 39 30 L 61 30 L 58 46 C 56 52, 53 56, 50 58 C 47 56, 44 52, 42 46 Z" fill="url(#${accentId})"/>
            `;
            break;
        case 'star':
            centerGlyph = `
                <polygon points="50,18 56,34 73,34 59,44 64,60 50,50 36,60 41,44 27,34 44,34" fill="url(#${accentId})" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
            `;
            break;
        case 'globe':
            centerGlyph = `
                <circle cx="50" cy="40" r="19" fill="none" stroke="url(#${accentId})" stroke-width="2.6"/>
                <ellipse cx="50" cy="40" rx="19" ry="7" fill="none" stroke="url(#${accentId})" stroke-width="1.5"/>
                <ellipse cx="50" cy="40" rx="8" ry="19" fill="none" stroke="url(#${accentId})" stroke-width="1.5"/>
            `;
            break;
        case 'shield':
            centerGlyph = `
                <path d="M 50 18 L 70 25 L 68 44 C 66 55, 58 62, 50 66 C 42 62, 34 55, 32 44 L 30 25 Z" fill="${spec.secondaryHex}" fill-opacity="0.35" stroke="url(#${accentId})" stroke-width="2.4"/>
                <polygon points="50,28 54,37 63,37 56,43 58,52 50,47 42,52 44,43 37,37 46,37" fill="url(#${accentId})"/>
            `;
            break;
        default: // chalice
            centerGlyph = `
                <path d="M 35 28 C 24 29, 24 47, 38 49" fill="none" stroke="url(#${accentId})" stroke-width="3" stroke-linecap="round"/>
                <path d="M 65 28 C 76 29, 76 47, 62 49" fill="none" stroke="url(#${accentId})" stroke-width="3" stroke-linecap="round"/>
                <path d="M 36 22 L 64 22 L 60 44 C 58 51, 54 56, 50 58 C 46 56, 42 51, 40 44 Z" fill="url(#${accentId})"/>
                <rect x="44" y="58" width="12" height="6" rx="1" fill="url(#${accentId})"/>
            `;
            break;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="${bgId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${spec.primaryHex}"/>
      <stop offset="100%" stop-color="${spec.secondaryHex}"/>
    </linearGradient>
    <linearGradient id="${accentId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="${spec.accentHex}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <path d="M 50 4 C 78 4, 92 16, 92 34 L 92 56 C 92 78, 70 92, 50 96 C 30 92, 8 78, 8 56 L 8 34 C 8 16, 22 4, 50 4 Z" fill="url(#${bgId})" stroke="${spec.accentHex}" stroke-width="2.5"/>
  <path d="M 50 8 C 74 8, 87 18, 87 34 L 87 55 C 87 74, 67 87, 50 91 C 33 87, 13 74, 13 55 L 13 34 C 13 18, 26 8, 50 8 Z" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1"/>
  ${centerGlyph}
  <rect x="20" y="66" width="60" height="16" rx="4" fill="#090d16" fill-opacity="0.88" stroke="${spec.accentHex}" stroke-opacity="0.7" stroke-width="1.1"/>
  <text x="50" y="77" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="${spec.label.length > 7 ? 8.2 : 9.5}" letter-spacing="0.7" fill="#f8fafc">${spec.label}</text>
</svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const COMPETITION_BADGE_SPECS: CompetitionBadgeSpec[] = [
    // Copas Nacionales
    { id: 'FA_CUP', label: 'FA CUP', primaryHex: '#7f1d1d', secondaryHex: '#0f172a', accentHex: '#f87171', motif: 'chalice' },
    { id: 'CARABAO_CUP', label: 'EFL CUP', primaryHex: '#064e3b', secondaryHex: '#0f172a', accentHex: '#34d399', motif: 'chalice' },
    { id: 'COPA_DEL_REY', label: 'COPA REY', primaryHex: '#7c2d12', secondaryHex: '#1e1b4b', accentHex: '#facc15', motif: 'crown' },
    { id: 'DFB_POKAL', label: 'POKAL', primaryHex: '#14532d', secondaryHex: '#090d16', accentHex: '#facc15', motif: 'hexagon' },
    { id: 'COPPA_ITALIA', label: 'COPPA', primaryHex: '#065f46', secondaryHex: '#1e293b', accentHex: '#ef4444', motif: 'shield' },
    { id: 'COPA_ARGENTINA', label: 'COPA ARG', primaryHex: '#0284c7', secondaryHex: '#0f172a', accentHex: '#38bdf8', motif: 'star' },
    // Internacionales sin CDN válido o Ranking
    { id: 'RECOPA_SUDAMERICANA', label: 'RECOPA', primaryHex: '#1e1b4b', secondaryHex: '#78350f', accentHex: '#eab308', motif: 'star' },
    { id: 'CLUB_RANKINGS', label: 'RANKING', primaryHex: '#0f172a', secondaryHex: '#1e293b', accentHex: '#eab308', motif: 'globe' },
    // Supercopas Nacionales (usadas en CompSelectorBar)
    { id: 'COMMUNITY_SHIELD', label: 'SHIELD', primaryHex: '#881337', secondaryHex: '#0f172a', accentHex: '#fda4af', motif: 'shield' },
    { id: 'SUPERCOPA_ESPANA', label: 'SUP. ESP', primaryHex: '#9a3412', secondaryHex: '#0f172a', accentHex: '#fbbf24', motif: 'crown' },
    { id: 'DFL_SUPERCUP', label: 'SUP. GER', primaryHex: '#991b1b', secondaryHex: '#090d16', accentHex: '#fde047', motif: 'hexagon' },
    { id: 'SUPERCOPPA_ITALIANA', label: 'SUP. ITA', primaryHex: '#047857', secondaryHex: '#0f172a', accentHex: '#f8fafc', motif: 'shield' },
    { id: 'TROPHEE_DES_CHAMPIONS', label: 'TROPHÉE', primaryHex: '#1d4ed8', secondaryHex: '#090d16', accentHex: '#93c5fd', motif: 'crown' },
    { id: 'TROFEO_DE_CAMPEONES', label: 'CAMPEONES', primaryHex: '#0369a1', secondaryHex: '#0f172a', accentHex: '#7dd3fc', motif: 'star' },
    { id: 'SUPERCOPA_INTERNACIONAL', label: 'SUP. INT', primaryHex: '#1e3a8a', secondaryHex: '#090d16', accentHex: '#fde047', motif: 'globe' },
    { id: 'SUPERCOPA_ARGENTINA', label: 'SUP. ARG', primaryHex: '#0284c7', secondaryHex: '#0f172a', accentHex: '#fde047', motif: 'chalice' },
    { id: 'SUPERCOPA_DO_BRASIL', label: 'SUP. BRA', primaryHex: '#15803d', secondaryHex: '#090d16', accentHex: '#fde047', motif: 'chalice' },
    { id: 'CAMPEON_DE_CAMPEONES', label: 'CAMPEÓN', primaryHex: '#065f46', secondaryHex: '#111827', accentHex: '#facc15', motif: 'shield' },
    { id: 'SUPERCOPA_DE_CHILE', label: 'SUP. CHI', primaryHex: '#b91c1c', secondaryHex: '#1e3a8a', accentHex: '#f8fafc', motif: 'star' },
    { id: 'SUPERLIGA_DE_COLOMBIA', label: 'SUP. COL', primaryHex: '#a16207', secondaryHex: '#1e3a8a', accentHex: '#fde047', motif: 'star' },
];

export const BESPOKE_COMPETITION_LOGOS: Record<string, string> = {};
for (const spec of COMPETITION_BADGE_SPECS) {
    BESPOKE_COMPETITION_LOGOS[spec.id] = buildCompetitionBadgeUri(spec);
}
