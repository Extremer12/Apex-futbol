import { GameState, PlayerProfile, PresidentialStint, Team } from '../types';

export interface PresidentLevelDef {
    level: number;
    minXp: number;
    title: string;
    desc: string;
}

export const PRESIDENT_LEVELS: PresidentLevelDef[] = [
    { level: 1, minXp: 0, title: 'Gestor Novato', desc: 'Dando los primeros pasos en la dirigencia deportiva.' },
    { level: 2, minXp: 200, title: 'Dirigente Comunitario', desc: 'Respaldo barrial y confianza de socios cercanos.' },
    { level: 3, minXp: 500, title: 'Gestor Consolidado', desc: 'Capaz de liderar asambleas y proyectos a mediano plazo.' },
    { level: 4, minXp: 900, title: 'Estratega Institucional', desc: 'Experto en finanzas, estatutos y negociaciones.' },
    { level: 5, minXp: 1400, title: 'Líder Político', desc: 'Gran peso en los comités de la liga y respeto gremial.' },
    { level: 6, minXp: 2000, title: 'Gran Negociador', desc: 'Atracción de patrocinadores multinacionales y fichajes estelares.' },
    { level: 7, minXp: 2700, title: 'Patriarca del Club', desc: 'Estatura histórica dentro de la institución.' },
    { level: 8, minXp: 3500, title: 'Figura Continental', desc: 'Respetado por federaciones y confederaciones.' },
    { level: 9, minXp: 4500, title: 'Leyenda Presidencial', desc: 'Su nombre está grabado en los anales del fútbol.' },
    { level: 10, minXp: 6000, title: 'Mito del Deporte', desc: 'Inmortal en la historia del fútbol internacional.' }
];

export interface PresidentialStyleModifiers {
    id: 'Equilibrado' | 'Canterano' | 'Galáctico' | 'Pragmático';
    operationalCostMultiplier: number;
    merchandisingMultiplier: number;
    youthBonus: number;
    youthPromotionXpBonus: number;
    starSigningApprovalBonus: number;
    xpWinMultiplier: number;
    winConfidenceBonus: number;
    lossConfidenceBuffer: number;
    perkSummary: string;
}

const STYLE_MODIFIERS_MAP: Record<PresidentialStyleModifiers['id'], PresidentialStyleModifiers> = {
    Equilibrado: {
        id: 'Equilibrado',
        operationalCostMultiplier: 0.95,
        merchandisingMultiplier: 1,
        youthBonus: 0,
        youthPromotionXpBonus: 0,
        starSigningApprovalBonus: 0,
        xpWinMultiplier: 1,
        winConfidenceBonus: 0,
        lossConfidenceBuffer: 1,
        perkSummary: '-5% gastos operativos · +1 contención directiva en derrotas'
    },
    Canterano: {
        id: 'Canterano',
        operationalCostMultiplier: 1,
        merchandisingMultiplier: 1,
        youthBonus: 3,
        youthPromotionXpBonus: 15,
        starSigningApprovalBonus: 0,
        xpWinMultiplier: 1,
        winConfidenceBonus: 0,
        lossConfidenceBuffer: 0,
        perkSummary: '+3 potencial en nuevos juveniles · +15 XP por promoción'
    },
    Galáctico: {
        id: 'Galáctico',
        operationalCostMultiplier: 1,
        merchandisingMultiplier: 1.15,
        youthBonus: 0,
        youthPromotionXpBonus: 0,
        starSigningApprovalBonus: 3,
        xpWinMultiplier: 1,
        winConfidenceBonus: 0,
        lossConfidenceBuffer: 0,
        perkSummary: '+15% ingresos merchandising · +3 aprobación por estrellas'
    },
    Pragmático: {
        id: 'Pragmático',
        operationalCostMultiplier: 1,
        merchandisingMultiplier: 1,
        youthBonus: 0,
        youthPromotionXpBonus: 0,
        starSigningApprovalBonus: 0,
        xpWinMultiplier: 1.25,
        winConfidenceBonus: 1,
        lossConfidenceBuffer: -1,
        perkSummary: '+25% XP y +1 confianza en victorias · Mayor exigencia'
    }
};

export const getPresidentialStyleModifiers = (style?: string): PresidentialStyleModifiers => {
    if (style && style in STYLE_MODIFIERS_MAP) {
        return STYLE_MODIFIERS_MAP[style as PresidentialStyleModifiers['id']];
    }
    return STYLE_MODIFIERS_MAP.Equilibrado;
};

export const getPresidentLevelInfo = (rawXp: number = 0) => {
    const totalXp = Math.max(0, Math.round(rawXp));
    let current = PRESIDENT_LEVELS[0];
    let next = PRESIDENT_LEVELS[1];

    for (let i = 0; i < PRESIDENT_LEVELS.length; i++) {
        if (totalXp >= PRESIDENT_LEVELS[i].minXp) {
            current = PRESIDENT_LEVELS[i];
            next = PRESIDENT_LEVELS[i + 1] || PRESIDENT_LEVELS[i];
        } else {
            break;
        }
    }

    const isMax = next.minXp <= current.minXp;
    const xpInLevel = totalXp - current.minXp;
    const xpNeeded = next.minXp - current.minXp || 1;
    const progress = isMax ? 100 : Math.min(100, Math.max(0, Math.round((xpInLevel / xpNeeded) * 100)));

    return {
        ...current,
        currentXp: totalXp,
        nextLevelXp: next.minXp,
        progress
    };
};

export const getClubRequiredLevel = (tier: Team['tier']): number => {
    if (tier === 'Top') return 4;
    if (tier === 'Mid') return 2;
    return 1;
};

export const calculateBaselinePresidentXp = (state: GameState): number => {
    let wins = 0;
    let draws = 0;

    (state.seasonHistory || []).forEach(rec => {
        wins += rec.userWon || 0;
        draws += rec.userDrawn || 0;
    });

    const currentTable = state.leagueTables?.[state.team.leagueId] || [];
    const currentRow = currentTable.find(r => r.teamId === state.team.id);
    if (currentRow) {
        wins += currentRow.won || 0;
        draws += currentRow.drawn || 0;
    }

    const trophies = state.team.trophyCabinet?.length || 0;
    const fulfilledPromises = (state.electoralPromises || []).filter(p => p.fulfilled).length;
    const completedMandates = Math.max(0, (state.mandate?.totalMandates || 1) - 1);

    return (wins * 12) + (draws * 4) + (trophies * 120) + (fulfilledPromises * 45) + (completedMandates * 180);
};

export const awardPresidentXp = (profile: PlayerProfile | undefined, delta: number): PlayerProfile => {
    const base: PlayerProfile = profile || { name: 'Presidente', experience: 0 };
    const nextXp = Math.max(0, Math.round((base.experience || 0) + delta));
    return {
        ...base,
        experience: nextXp
    };
};

export const buildCurrentStintArchive = (
    state: GameState,
    status: PresidentialStint['status']
): PresidentialStint => {
    let totalMatches = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let seasonsForClub = 0;

    (state.seasonHistory || []).forEach(rec => {
        if (rec.userTeamId === state.team.id) {
            seasonsForClub++;
            wins += rec.userWon || 0;
            draws += rec.userDrawn || 0;
            losses += rec.userLost || 0;
            totalMatches += (rec.userWon || 0) + (rec.userDrawn || 0) + (rec.userLost || 0);
        }
    });

    const currentRow = (state.leagueTables?.[state.team.leagueId] || []).find(r => r.teamId === state.team.id);
    if (currentRow) {
        wins += currentRow.won || 0;
        draws += currentRow.drawn || 0;
        losses += currentRow.lost || 0;
        totalMatches += currentRow.played || 0;
    }

    const winPercentage = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    const totalMandates = state.mandate?.totalMandates || 1;
    const startSeason = state.mandate?.startYear || Math.max(2026, state.season - Math.max(0, seasonsForClub));

    return {
        clubId: state.team.id,
        clubName: state.team.name,
        startSeason,
        endSeason: state.season,
        seasonsManaged: Math.max(1, seasonsForClub + (currentRow && currentRow.played > 0 ? 1 : 0)),
        mandatesCompleted: Math.max(0, totalMandates - 1),
        trophiesWon: (state.team.trophyCabinet || []).map(t => `${t.name} (T.${t.season})`),
        winPercentage,
        totalMatches,
        wins,
        draws,
        losses,
        electionsWon: Math.max(0, totalMandates - 1),
        status
    };
};
