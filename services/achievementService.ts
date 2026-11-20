import { GameState, Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_trophy',
        title: 'Primer Trofeo Oficial',
        description: 'Conquista tu primer título oficial al frente del club.',
        icon: '🏆',
        category: 'trophies',
        isUnlocked: false
    },
    {
        id: 'cup_king',
        title: 'Rey de Copas',
        description: 'Gana cualquier copa nacional (FA Cup, Copa del Rey, DFB-Pokal, Coppa Italia o Copa Argentina).',
        icon: '👑',
        category: 'trophies',
        isUnlocked: false
    },
    {
        id: 'continental_glory',
        title: 'Gloria Continental',
        description: 'Conságrate campeón de la UEFA Champions League o de la Copa Libertadores.',
        icon: '⭐',
        category: 'trophies',
        isUnlocked: false
    },
    {
        id: 'world_champion',
        title: 'El Mejor del Planeta',
        description: 'Alza la Copa Intercontinental y corona a tu club en la cima mundial.',
        icon: '🌍',
        category: 'trophies',
        isUnlocked: false
    },
    {
        id: 'the_treble',
        title: 'El Triplete Soñado',
        description: 'Conquista la Liga, la Copa Nacional y el título Continental en una sola temporada.',
        icon: '⚡',
        category: 'trophies',
        isUnlocked: false
    },
    {
        id: 'tycoon',
        title: 'Magnate del Fútbol',
        description: 'Alcanza un balance financiero de más de €100M en las arcas del club.',
        icon: '💰',
        category: 'management',
        isUnlocked: false,
        progress: 0,
        maxProgress: 100
    },
    {
        id: 'stadium_expansion',
        title: 'Coliseo Moderno',
        description: 'Amplía las instalaciones o la capacidad de tu estadio.',
        icon: '🏟️',
        category: 'management',
        isUnlocked: false
    },
    {
        id: 're_election',
        title: 'Mandato Democrático',
        description: 'Gana una reelección presidencial con más del 70% de aprobación de los socios.',
        icon: '🗳️',
        category: 'management',
        isUnlocked: false
    },
    {
        id: 'wonderkid_academy',
        title: 'Fábrica de Cracks',
        description: 'Promociona al primer equipo a un canterano con potencial de clase mundial.',
        icon: '💎',
        category: 'transfers',
        isUnlocked: false
    },
    {
        id: 'galactic_signing',
        title: 'Fichaje Galáctico',
        description: 'Ficha a una estrella mundial con valoración general de 88 o superior.',
        icon: '🌟',
        category: 'transfers',
        isUnlocked: false
    },
    {
        id: 'big_sale',
        title: 'Venta Histórica',
        description: 'Vende a un futbolista de tu plantilla por más de €40M.',
        icon: '🤝',
        category: 'transfers',
        isUnlocked: false
    },
    {
        id: 'master_scout',
        title: 'Ojo Clínico',
        description: 'Completa el informe de ojeo al 100% de 5 o más futbolistas.',
        icon: '🎯',
        category: 'transfers',
        isUnlocked: false,
        progress: 0,
        maxProgress: 5
    },
    {
        id: 'clean_sheet',
        title: 'Cerrojo Defensivo',
        description: 'Gana un partido oficial manteniendo la portería a cero.',
        icon: '🛡️',
        category: 'special',
        isUnlocked: false
    },
    {
        id: 'historic_rout',
        title: 'Goleada Histórica',
        description: 'Gana un partido oficial por 4 o más goles de diferencia.',
        icon: '🔥',
        category: 'special',
        isUnlocked: false
    },
    {
        id: 'individual_glory',
        title: 'La Bota o Balón de Oro',
        description: 'Un jugador de tu plantilla gana el Balón de Oro o el Máximo Goleador de la temporada.',
        icon: '🥇',
        category: 'special',
        isUnlocked: false
    }
];

export function getInitialAchievements(): Achievement[] {
    return JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS));
}

export function evaluateAchievements(gameState: GameState): {
    updatedAchievements: Achievement[];
    newlyUnlocked: Achievement[];
} {
    const currentAchievements = gameState.achievements && gameState.achievements.length > 0 
        ? [...gameState.achievements] 
        : getInitialAchievements();

    const newlyUnlocked: Achievement[] = [];
    const now = new Date().toLocaleDateString();

    const unlock = (id: string) => {
        const ach = currentAchievements.find(a => a.id === id);
        if (ach && !ach.isUnlocked) {
            ach.isUnlocked = true;
            ach.unlockedAt = now;
            newlyUnlocked.push(ach);
        }
    };

    const trophies = gameState.team.trophyCabinet || [];
    const userTeamId = gameState.team.id;
    const userTeamName = (gameState.team.name || '').toLowerCase();
    
    // 1. First Trophy
    if (trophies.length > 0) {
        unlock('first_trophy');
    }

    // 2. Cup King (National Cups - excluding league titles with "Copa" like Paraguay's Copa de Primera)
    const isNationalCup = (name?: string) => {
        if (!name) return false;
        const lower = name.toLowerCase();
        if (lower.includes('copa de primera') || lower.includes('primera división') || lower.includes('campeonato') || lower.includes('liga')) return false;
        return lower.includes('copa argentina') || lower.includes('fa cup') || lower.includes('copa del rey') ||
               lower.includes('dfb-pokal') || lower.includes('coppa italia') || lower.includes('carabao') ||
               lower.includes('coupe de france') || lower.includes('copa mx') || lower.includes('pokal') ||
               (lower.includes('copa') && !lower.includes('libertadores') && !lower.includes('sudamericana') && !lower.includes('intercontinental')) ||
               (lower.includes('cup') && !lower.includes('champions') && !lower.includes('world'));
    };
    if (trophies.some(t => isNationalCup(t?.name))) {
        unlock('cup_king');
    }

    // 3. Continental Glory (UCL, Libertadores, UEL, Sudamericana)
    if (trophies.some(t => {
        const lower = (t?.name || '').toLowerCase();
        return lower.includes('champions') || lower.includes('libertadores') || lower.includes('europa') || lower.includes('sudamericana');
    })) {
        unlock('continental_glory');
    }

    // 4. World Champion (Intercontinental / Club World Cup)
    if (trophies.some(t => {
        const lower = (t?.name || '').toLowerCase();
        return lower.includes('intercontinental') || lower.includes('mundial') || lower.includes('world');
    })) {
        unlock('world_champion');
    }

    // 5. The Treble (League + National Cup + Continental Cup in a single season)
    const trophiesBySeason: Record<number, string[]> = {};
    trophies.forEach(t => {
        if (t?.season) {
            trophiesBySeason[t.season] = trophiesBySeason[t.season] || [];
            if (t.name) trophiesBySeason[t.season].push(t.name);
        }
    });
    for (const s of Object.keys(trophiesBySeason)) {
        const names = trophiesBySeason[Number(s)] || [];
        const hasLeague = names.some(n => {
            const l = (n || '').toLowerCase();
            return l.includes('liga') || l.includes('premier') || l.includes('serie a') || l.includes('bundesliga') || l.includes('division') || l.includes('campeonato');
        });
        const hasCup = names.some(n => isNationalCup(n));
        const hasContinental = names.some(n => {
            const l = (n || '').toLowerCase();
            return l.includes('champions') || l.includes('libertadores') || l.includes('europa') || l.includes('sudamericana');
        });
        if (hasLeague && hasCup && hasContinental) {
            unlock('the_treble');
            break;
        }
    }

    // 6. Finances (Magnate: balance >= €100M)
    const currentBalance = gameState.finances?.balance || 0;
    const tycoonAch = currentAchievements.find(a => a.id === 'tycoon');
    if (tycoonAch) {
        const balanceInMillions = Math.floor(currentBalance / 1_000_000);
        tycoonAch.progress = Math.min(100, Math.max(0, balanceInMillions));
        if (currentBalance >= 100_000_000) {
            unlock('tycoon');
        }
    }

    // 7. Stadium Facility & Modern Coliseum
    if (gameState.stadium && (gameState.stadium.facilityLevel > 1 || gameState.stadium.capacity > 65000)) {
        unlock('stadium_expansion');
    }

    // 8. Democratic Mandate (Re-election with > 70% approval)
    if (gameState.mandate && gameState.mandate.totalMandates > 1 &&
        ((gameState.fanApproval?.rating ?? 50) >= 70)) {
        unlock('re_election');
    }

    // 9. Wonderkid Academy (Promoted Academy player or world-class youth prospect)
    const hasWonderkid = (gameState.team.squad || []).some(p => 
        ((p as any).origin === 'youth' || (p as any).isYouth || (p.age && p.age <= 21 && p.potential && p.potential >= 82))
    );
    if (hasWonderkid) {
        unlock('wonderkid_academy');
    }

    // 10. Star Squad Member (Galáctico: rating >= 88)
    if ((gameState.team.squad || []).some(p => p.rating >= 88)) {
        unlock('galactic_signing');
    }

    // 11. Big Sale (Historical sale >= €40M)
    const hasBigSaleNews = (gameState.newsFeed || []).some(n => {
        const t = (n?.headline || '').toLowerCase();
        const c = (n?.body || '').toLowerCase();
        const isSale = t.includes('venta') || t.includes('traspaso') || c.includes('traspasado') || c.includes('vendido');
        return isSale && (c.includes('40m') || c.includes('50m') || c.includes('60m') || c.includes('70m') || c.includes('80m') || c.includes('90m') || c.includes('100m') || c.includes('40.000.000') || c.includes('€40'));
    });
    if (hasBigSaleNews) {
        unlock('big_sale');
    }

    // 12. Scouting (Master Scout: 5+ players 100% scouted)
    const fullyScoutedCount = Object.values(gameState.scoutedPlayerIds || {}).filter(lvl => lvl >= 100).length;
    const scoutAch = currentAchievements.find(a => a.id === 'master_scout');
    if (scoutAch) {
        scoutAch.progress = Math.min(5, fullyScoutedCount);
        if (fullyScoutedCount >= 5) {
            unlock('master_scout');
        }
    }

    // 13. Clean Sheet (Defensive Lock: win with zero goals conceded)
    const playedMatches = (gameState.schedule || []).filter(m => !!m.result);
    const hasCleanSheetWin = playedMatches.some(m => {
        if (!m.result) return false;
        const isHome = m.homeTeamId === userTeamId;
        const isAway = m.awayTeamId === userTeamId;
        if (isHome && m.result.homeScore > m.result.awayScore && m.result.awayScore === 0) return true;
        if (isAway && m.result.awayScore > m.result.homeScore && m.result.homeScore === 0) return true;
        return false;
    });
    if (hasCleanSheetWin) {
        unlock('clean_sheet');
    }

    // 14. Historic Rout (Win by 4+ goals margin)
    const hasHistoricRout = playedMatches.some(m => {
        if (!m.result) return false;
        const isHome = m.homeTeamId === userTeamId;
        const isAway = m.awayTeamId === userTeamId;
        if (isHome && (m.result.homeScore - m.result.awayScore >= 4)) return true;
        if (isAway && (m.result.awayScore - m.result.homeScore >= 4)) return true;
        return false;
    });
    if (hasHistoricRout) {
        unlock('historic_rout');
    }

    // 15. Individual Glory (Golden Boot or Ballon d'Or winner)
    const hasIndividualGlory = (gameState.seasonHistory || []).some(rec => 
        (rec?.goldenBootWinner && (((rec.goldenBootWinner.teamName || '').toLowerCase() === userTeamName) || (gameState.team.squad || []).some(p => p.name === rec.goldenBootWinner?.name))) ||
        (rec?.ballonDorWinner && (((rec.ballonDorWinner.teamName || '').toLowerCase() === userTeamName) || (gameState.team.squad || []).some(p => p.name === rec.ballonDorWinner?.name)))
    );
    if (hasIndividualGlory) {
        unlock('individual_glory');
    }

    return {
        updatedAchievements: currentAchievements,
        newlyUnlocked
    };
}
