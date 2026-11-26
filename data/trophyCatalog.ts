export type TrophyArchetype =
    | 'orejona'
    | 'europa'
    | 'libertadores'
    | 'sudamericana'
    | 'recopa'
    | 'globe'
    | 'meisterschale'
    | 'premier_crown'
    | 'domestic_cup'
    | 'league_gold';

export interface TrophySpec {
    id: string;
    fileSlug: string;
    name: string;
    plaque: string;
    archetype: TrophyArchetype;
    primaryHex: string;
    secondaryHex: string;
    accentHex: string;
}

export const COMPETITION_TROPHY_SPECS: TrophySpec[] = [
    // International & Continental
    { id: 'CHAMPIONS_LEAGUE', fileSlug: 'champions_league', name: 'UEFA Champions League', plaque: 'UCL', archetype: 'orejona', primaryHex: '#e2e8f0', secondaryHex: '#94a3b8', accentHex: '#38bdf8' },
    { id: 'EUROPA_LEAGUE', fileSlug: 'europa_league', name: 'UEFA Europa League', plaque: 'UEL', archetype: 'europa', primaryHex: '#f1f5f9', secondaryHex: '#64748b', accentHex: '#f97316' },
    { id: 'COPA_LIBERTADORES', fileSlug: 'copa_libertadores', name: 'Copa Libertadores', plaque: 'CONMEBOL', archetype: 'libertadores', primaryHex: '#fde047', secondaryHex: '#92400e', accentHex: '#f59e0b' },
    { id: 'COPA_SUDAMERICANA', fileSlug: 'copa_sudamericana', name: 'Copa Sudamericana', plaque: 'SUD', archetype: 'sudamericana', primaryHex: '#e2e8f0', secondaryHex: '#78350f', accentHex: '#3b82f6' },
    { id: 'RECOPA_SUDAMERICANA', fileSlug: 'recopa_sudamericana', name: 'Recopa Sudamericana', plaque: 'RECOPA', archetype: 'recopa', primaryHex: '#f8fafc', secondaryHex: '#ca8a04', accentHex: '#eab308' },
    { id: 'COPA_INTERCONTINENTAL', fileSlug: 'copa_intercontinental', name: 'Copa Intercontinental', plaque: 'INTER', archetype: 'globe', primaryHex: '#fef08a', secondaryHex: '#ca8a04', accentHex: '#3b82f6' },
    { id: 'CLUB_WORLD_CUP', fileSlug: 'club_world_cup', name: 'Mundial de Clubes', plaque: 'CWC', archetype: 'globe', primaryHex: '#fef08a', secondaryHex: '#b45309', accentHex: '#eab308' },

    // England
    { id: 'PREMIER_LEAGUE', fileSlug: 'premier_league', name: 'Premier League', plaque: 'EPL', archetype: 'premier_crown', primaryHex: '#f8fafc', secondaryHex: '#eab308', accentHex: '#a855f7' },
    { id: 'FA_CUP', fileSlug: 'fa_cup', name: 'FA Cup', plaque: 'FA CUP', archetype: 'domestic_cup', primaryHex: '#f8fafc', secondaryHex: '#94a3b8', accentHex: '#ef4444' },
    { id: 'CARABAO_CUP', fileSlug: 'carabao_cup', name: 'Carabao Cup', plaque: 'EFL', archetype: 'domestic_cup', primaryHex: '#e2e8f0', secondaryHex: '#475569', accentHex: '#10b981' },
    { id: 'CHAMPIONSHIP', fileSlug: 'championship', name: 'EFL Championship', plaque: 'EFL 2', archetype: 'league_gold', primaryHex: '#cbd5e1', secondaryHex: '#64748b', accentHex: '#3b82f6' },

    // Spain
    { id: 'LA_LIGA', fileSlug: 'la_liga', name: 'La Liga', plaque: 'LALIGA', archetype: 'league_gold', primaryHex: '#fef08a', secondaryHex: '#ca8a04', accentHex: '#ef4444' },
    { id: 'COPA_DEL_REY', fileSlug: 'copa_del_rey', name: 'Copa del Rey', plaque: 'REY', archetype: 'domestic_cup', primaryHex: '#e2e8f0', secondaryHex: '#64748b', accentHex: '#eab308' },
    { id: 'SEGUNDA_DIVISION_ESP', fileSlug: 'segunda_division_esp', name: 'LaLiga Hypermotion', plaque: 'ESP 2', archetype: 'league_gold', primaryHex: '#cbd5e1', secondaryHex: '#64748b', accentHex: '#f97316' },

    // Italy
    { id: 'SERIE_A', fileSlug: 'serie_a', name: 'Serie A', plaque: 'SERIE A', archetype: 'league_gold', primaryHex: '#fef08a', secondaryHex: '#b45309', accentHex: '#3b82f6' },
    { id: 'COPPA_ITALIA', fileSlug: 'coppa_italia', name: 'Coppa Italia', plaque: 'COPPA', archetype: 'domestic_cup', primaryHex: '#fef08a', secondaryHex: '#b45309', accentHex: '#10b981' },
    { id: 'SERIE_B_ITA', fileSlug: 'serie_b_ita', name: 'Serie B Italia', plaque: 'ITA 2', archetype: 'league_gold', primaryHex: '#cbd5e1', secondaryHex: '#64748b', accentHex: '#22c55e' },

    // Germany
    { id: 'BUNDESLIGA', fileSlug: 'bundesliga', name: 'Bundesliga', plaque: 'BL', archetype: 'meisterschale', primaryHex: '#f8fafc', secondaryHex: '#94a3b8', accentHex: '#eab308' },
    { id: 'DFB_POKAL', fileSlug: 'dfb_pokal', name: 'DFB-Pokal', plaque: 'POKAL', archetype: 'domestic_cup', primaryHex: '#fef08a', secondaryHex: '#ca8a04', accentHex: '#22c55e' },
    { id: 'ZWEITE_BUNDESLIGA', fileSlug: 'zweite_bundesliga', name: '2. Bundesliga', plaque: '2. BL', archetype: 'meisterschale', primaryHex: '#e2e8f0', secondaryHex: '#64748b', accentHex: '#ef4444' },

    // France
    { id: 'LIGUE_1', fileSlug: 'ligue_1', name: 'Ligue 1', plaque: 'LIGUE 1', archetype: 'league_gold', primaryHex: '#fef08a', secondaryHex: '#94a3b8', accentHex: '#3b82f6' },
    { id: 'LIGUE_2', fileSlug: 'ligue_2', name: 'Ligue 2', plaque: 'LIGUE 2', archetype: 'league_gold', primaryHex: '#cbd5e1', secondaryHex: '#64748b', accentHex: '#06b6d4' },

    // Argentina
    { id: 'LIGA_ARGENTINA', fileSlug: 'liga_argentina', name: 'Liga Profesional', plaque: 'LPF', archetype: 'league_gold', primaryHex: '#f8fafc', secondaryHex: '#ca8a04', accentHex: '#38bdf8' },
    { id: 'COPA_ARGENTINA', fileSlug: 'copa_argentina', name: 'Copa Argentina', plaque: 'COPA ARG', archetype: 'domestic_cup', primaryHex: '#e2e8f0', secondaryHex: '#64748b', accentHex: '#38bdf8' },
    { id: 'PRIMERA_NACIONAL', fileSlug: 'primera_nacional', name: 'Primera Nacional', plaque: 'PN', archetype: 'league_gold', primaryHex: '#cbd5e1', secondaryHex: '#64748b', accentHex: '#38bdf8' },

    // Brazil
    { id: 'BRASILEIRAO', fileSlug: 'brasileirao', name: 'Brasileirão Série A', plaque: 'BR A', archetype: 'league_gold', primaryHex: '#fef08a', secondaryHex: '#ca8a04', accentHex: '#22c55e' },
    { id: 'SERIE_B_BR', fileSlug: 'serie_b_br', name: 'Brasileirão Série B', plaque: 'BR B', archetype: 'league_gold', primaryHex: '#cbd5e1', secondaryHex: '#64748b', accentHex: '#eab308' },

    // Paraguay, Mexico, Chile, Colombia
    { id: 'COPA_DE_PRIMERA', fileSlug: 'copa_de_primera', name: 'Copa de Primera', plaque: 'PAR', archetype: 'league_gold', primaryHex: '#fef08a', secondaryHex: '#ca8a04', accentHex: '#ef4444' },
    { id: 'LIGA_MX', fileSlug: 'liga_mx', name: 'Liga MX', plaque: 'LIGA MX', archetype: 'league_gold', primaryHex: '#f8fafc', secondaryHex: '#94a3b8', accentHex: '#10b981' },
    { id: 'COPA_MX', fileSlug: 'copa_mx', name: 'Copa MX', plaque: 'COPA MX', archetype: 'domestic_cup', primaryHex: '#e2e8f0', secondaryHex: '#64748b', accentHex: '#10b981' },
    { id: 'LIGA_EXPANSION_MX', fileSlug: 'liga_expansion_mx', name: 'Liga Expansión MX', plaque: 'EXP MX', archetype: 'league_gold', primaryHex: '#cbd5e1', secondaryHex: '#64748b', accentHex: '#22c55e' },
    { id: 'PRIMERA_DIVISION_CHILE', fileSlug: 'primera_division_chile', name: 'Primera División Chile', plaque: 'CHI', archetype: 'league_gold', primaryHex: '#f8fafc', secondaryHex: '#ca8a04', accentHex: '#ef4444' },
    { id: 'PRIMERA_B_CHILE', fileSlug: 'primera_b_chile', name: 'Primera B Chile', plaque: 'CHI 2', archetype: 'league_gold', primaryHex: '#cbd5e1', secondaryHex: '#64748b', accentHex: '#3b82f6' },
    { id: 'PRIMERA_A_COLOMBIA', fileSlug: 'primera_a_colombia', name: 'Categoría Primera A', plaque: 'COL A', archetype: 'league_gold', primaryHex: '#fef08a', secondaryHex: '#ca8a04', accentHex: '#eab308' },
    { id: 'PRIMERA_B_COLOMBIA', fileSlug: 'primera_b_colombia', name: 'Torneo Primera B', plaque: 'COL B', archetype: 'league_gold', primaryHex: '#cbd5e1', secondaryHex: '#64748b', accentHex: '#eab308' },
    { id: 'PRIMEIRA_LIGA', fileSlug: 'primeira_liga', name: 'Liga Portugal Betclic', plaque: 'POR', archetype: 'league_gold', primaryHex: '#fef08a', secondaryHex: '#ca8a04', accentHex: '#10b981' },
    { id: 'EREDIVISIE', fileSlug: 'eredivisie', name: 'Eredivisie', plaque: 'NED', archetype: 'meisterschale', primaryHex: '#f8fafc', secondaryHex: '#94a3b8', accentHex: '#f97316' },
    { id: 'LIGA_URUGUAYA', fileSlug: 'liga_uruguaya', name: 'Liga AUF Uruguaya', plaque: 'URU', archetype: 'league_gold', primaryHex: '#f8fafc', secondaryHex: '#ca8a04', accentHex: '#38bdf8' },
    { id: 'LIGA_ECUADOR', fileSlug: 'liga_ecuador', name: 'LigaPro Serie A', plaque: 'ECU', archetype: 'league_gold', primaryHex: '#fef08a', secondaryHex: '#b45309', accentHex: '#eab308' },
    { id: 'MLS', fileSlug: 'mls', name: 'Major League Soccer', plaque: 'MLS', archetype: 'league_gold', primaryHex: '#f8fafc', secondaryHex: '#64748b', accentHex: '#3b82f6' },
];

export function renderTrophySvg(spec: TrophySpec): string {
    const uid = spec.fileSlug.replace(/[^a-z0-9]/g, '');
    const metalId = `m_${uid}`;
    const accentId = `a_${uid}`;
    const glossId = `g_${uid}`;
    const basePlinth = `
        <rect x="64" y="182" width="72" height="12" rx="3" fill="#334155"/>
        <rect x="48" y="194" width="104" height="28" rx="5" fill="#090d16" stroke="url(#${metalId})" stroke-width="2.2"/>
        <rect x="62" y="200" width="76" height="16" rx="2" fill="#1e293b" stroke="${spec.accentHex}" stroke-opacity="0.55" stroke-width="1"/>
        <text x="100" y="211.5" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="9.5" letter-spacing="1.2" fill="#f8fafc">${spec.plaque}</text>
    `;

    let body = '';

    switch (spec.archetype) {
        case 'orejona':
        case 'europa':
            body = `
                <path d="M 54 54 C 14 56, 12 134, 62 138" fill="none" stroke="url(#${metalId})" stroke-width="9" stroke-linecap="round"/>
                <path d="M 146 54 C 186 56, 188 134, 138 138" fill="none" stroke="url(#${metalId})" stroke-width="9" stroke-linecap="round"/>
                <path d="M 56 38 L 144 38 C 144 92, 132 146, 100 156 C 68 146, 56 92, 56 38 Z" fill="url(#${metalId})"/>
                <ellipse cx="100" cy="38" rx="44" ry="9" fill="url(#${accentId})" opacity="0.9"/>
                <path d="M 68 48 L 96 48 L 90 136 C 78 124, 70 90, 68 48 Z" fill="url(#${glossId})" opacity="0.65"/>
                <circle cx="100" cy="88" r="14" fill="none" stroke="${spec.accentHex}" stroke-width="2" stroke-opacity="0.65"/>
                <path d="M 88 156 L 112 156 L 116 182 L 84 182 Z" fill="url(#${metalId})"/>
                ${basePlinth}
            `;
            break;

        case 'libertadores':
        case 'sudamericana':
            body = `
                <circle cx="100" cy="24" r="11" fill="url(#${accentId})"/>
                <path d="M 94 35 L 106 35 L 103 48 L 97 48 Z" fill="url(#${accentId})"/>
                <path d="M 54 58 C 30 60, 30 98, 66 102" fill="none" stroke="url(#${metalId})" stroke-width="6" stroke-linecap="round"/>
                <path d="M 146 58 C 170 60, 170 98, 134 102" fill="none" stroke="url(#${metalId})" stroke-width="6" stroke-linecap="round"/>
                <circle cx="100" cy="76" r="28" fill="url(#${metalId})"/>
                <ellipse cx="100" cy="76" rx="28" ry="9" fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="2"/>
                <path d="M 84 104 L 116 104 L 122 128 L 78 128 Z" fill="url(#${metalId})"/>
                <rect x="66" y="128" width="68" height="66" rx="4" fill="#451a03" stroke="#92400e" stroke-width="2"/>
                <rect x="74" y="136" width="12" height="9" rx="1.5" fill="#fef08a" opacity="0.85"/>
                <rect x="94" y="136" width="12" height="9" rx="1.5" fill="#fef08a" opacity="0.85"/>
                <rect x="114" y="136" width="12" height="9" rx="1.5" fill="#fef08a" opacity="0.85"/>
                <rect x="74" y="150" width="12" height="9" rx="1.5" fill="#fef08a" opacity="0.85"/>
                <rect x="94" y="150" width="12" height="9" rx="1.5" fill="#fef08a" opacity="0.85"/>
                <rect x="114" y="150" width="12" height="9" rx="1.5" fill="#fef08a" opacity="0.85"/>
                ${basePlinth}
            `;
            break;

        case 'recopa':
            body = `
                <path d="M 56 54 C 26 48, 22 106, 66 118" fill="none" stroke="url(#${accentId})" stroke-width="7" stroke-linecap="round"/>
                <path d="M 144 54 C 174 48, 178 106, 134 118" fill="none" stroke="url(#${accentId})" stroke-width="7" stroke-linecap="round"/>
                <path d="M 60 36 L 140 36 L 128 126 C 122 142, 112 152, 100 156 C 88 152, 78 142, 72 126 Z" fill="url(#${metalId})" stroke="url(#${accentId})" stroke-width="2.5"/>
                <polygon points="100,58 106,74 124,74 110,84 115,100 100,90 85,100 90,84 76,74 94,74" fill="url(#${accentId})"/>
                <path d="M 88 156 L 112 156 L 116 182 L 84 182 Z" fill="url(#${accentId})"/>
                ${basePlinth}
            `;
            break;

        case 'globe':
            body = `
                <circle cx="100" cy="58" r="28" fill="#1d4ed8" stroke="url(#${metalId})" stroke-width="4"/>
                <ellipse cx="100" cy="58" rx="28" ry="10" fill="none" stroke="#93c5fd" stroke-width="1.6" opacity="0.7"/>
                <ellipse cx="100" cy="58" rx="12" ry="28" fill="none" stroke="#93c5fd" stroke-width="1.6" opacity="0.7"/>
                <path d="M 62 128 C 58 84, 76 66, 92 60" fill="none" stroke="url(#${metalId})" stroke-width="7" stroke-linecap="round"/>
                <path d="M 138 128 C 142 84, 124 66, 108 60" fill="none" stroke="url(#${metalId})" stroke-width="7" stroke-linecap="round"/>
                <path d="M 74 148 C 72 114, 100 92, 100 92 C 100 92, 128 114, 126 148 Z" fill="url(#${metalId})" opacity="0.9"/>
                <path d="M 86 148 L 114 148 L 118 182 L 82 182 Z" fill="url(#${metalId})"/>
                ${basePlinth}
            `;
            break;

        case 'meisterschale':
            body = `
                <circle cx="100" cy="96" r="72" fill="url(#${metalId})" stroke="#ffffff" stroke-width="3"/>
                <circle cx="100" cy="96" r="56" fill="none" stroke="url(#${accentId})" stroke-width="7"/>
                <circle cx="100" cy="96" r="34" fill="url(#${metalId})" stroke="#475569" stroke-width="2"/>
                <circle cx="100" cy="96" r="15" fill="url(#${accentId})"/>
                <circle cx="100" cy="36" r="5" fill="url(#${accentId})"/>
                <circle cx="100" cy="156" r="5" fill="url(#${accentId})"/>
                <circle cx="40" cy="96" r="5" fill="url(#${accentId})"/>
                <circle cx="160" cy="96" r="5" fill="url(#${accentId})"/>
                ${basePlinth}
            `;
            break;

        case 'premier_crown':
            body = `
                <path d="M 70 36 L 78 18 L 90 28 L 100 14 L 110 28 L 122 18 L 130 36 Z" fill="url(#${accentId})"/>
                <path d="M 52 54 C 24 56, 24 108, 64 114" fill="none" stroke="url(#${accentId})" stroke-width="7" stroke-linecap="round"/>
                <path d="M 148 54 C 176 56, 176 108, 136 114" fill="none" stroke="url(#${accentId})" stroke-width="7" stroke-linecap="round"/>
                <path d="M 56 38 L 144 38 L 134 128 C 128 144, 114 154, 100 158 C 86 154, 72 144, 66 128 Z" fill="url(#${metalId})"/>
                <rect x="64" y="84" width="72" height="14" rx="3" fill="${spec.accentHex}" opacity="0.85"/>
                <path d="M 88 158 L 112 158 L 116 182 L 84 182 Z" fill="url(#${accentId})"/>
                ${basePlinth}
            `;
            break;

        case 'domestic_cup':
            body = `
                <path d="M 70 38 C 74 22, 126 22, 130 38 Z" fill="url(#${accentId})"/>
                <circle cx="100" cy="18" r="7" fill="url(#${accentId})"/>
                <path d="M 56 54 C 30 54, 32 104, 68 110" fill="none" stroke="url(#${metalId})" stroke-width="6.5" stroke-linecap="round"/>
                <path d="M 144 54 C 170 54, 168 104, 132 110" fill="none" stroke="url(#${metalId})" stroke-width="6.5" stroke-linecap="round"/>
                <path d="M 58 38 L 142 38 C 138 90, 124 138, 100 150 C 76 138, 62 90, 58 38 Z" fill="url(#${metalId})"/>
                <rect x="66" y="72" width="68" height="12" rx="3" fill="url(#${accentId})" opacity="0.9"/>
                <path d="M 88 150 L 112 150 L 116 182 L 84 182 Z" fill="url(#${metalId})"/>
                ${basePlinth}
            `;
            break;

        default:
            body = `
                <path d="M 50 56 C 22 58, 22 112, 62 118" fill="none" stroke="url(#${metalId})" stroke-width="7.5" stroke-linecap="round"/>
                <path d="M 150 56 C 178 58, 178 112, 138 118" fill="none" stroke="url(#${metalId})" stroke-width="7.5" stroke-linecap="round"/>
                <path d="M 48 38 L 152 38 L 138 122 C 132 144, 116 156, 100 160 C 84 156, 68 144, 62 122 Z" fill="url(#${metalId})"/>
                <path d="M 56 42 L 144 42 L 136 82 C 118 92, 82 92, 64 82 Z" fill="url(#${glossId})" opacity="0.55"/>
                <rect x="66" y="78" width="68" height="8" rx="4" fill="${spec.accentHex}" opacity="0.75"/>
                <path d="M 88 160 L 112 160 L 118 182 L 82 182 Z" fill="url(#${metalId})"/>
                ${basePlinth}
            `;
            break;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
  <defs>
    <linearGradient id="${metalId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${spec.primaryHex}"/>
      <stop offset="55%" stop-color="${spec.secondaryHex}"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="${accentId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="55%" stop-color="${spec.accentHex}"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="${glossId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="226" rx="64" ry="8" fill="#000000" fill-opacity="0.45"/>
  ${body}
</svg>
`;
}

export function findTrophySpec(identifierOrName?: string): TrophySpec | undefined {
    const raw = (identifierOrName || '').trim();
    if (!raw) return undefined;
    const norm = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const underscore = norm.replace(/[^a-z0-9]/g, '_');
    const slug = norm.replace(/[^a-z0-9]/g, '');

    const exact = COMPETITION_TROPHY_SPECS.find(spec => {
        const specIdSlug = spec.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const specNameSlug = spec.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
        return (
            spec.id === raw.toUpperCase() ||
            spec.fileSlug === underscore ||
            specIdSlug === slug ||
            specNameSlug === slug
        );
    });
    if (exact || slug.length < 4) return exact;

    return COMPETITION_TROPHY_SPECS.find(spec => {
        const specIdSlug = spec.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const specNameSlug = spec.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
        return slug.includes(specIdSlug) || specNameSlug.includes(slug);
    });
}
