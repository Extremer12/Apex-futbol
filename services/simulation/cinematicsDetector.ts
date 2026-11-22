import { GameState, Match, Team, CinematicEvent, LeagueId, LeagueTableRow, CupCompetition, CupGroup, CupRound } from '../../types';

const LEAGUE_DISPLAY_NAMES: Record<string, string> = {
    [LeagueId.PREMIER_LEAGUE]: 'Premier League',
    [LeagueId.CHAMPIONSHIP]: 'EFL Championship',
    [LeagueId.LA_LIGA]: 'LaLiga EA Sports',
    [LeagueId.SEGUNDA_DIVISION_ESP]: 'LaLiga Hypermotion',
    [LeagueId.BUNDESLIGA]: 'Bundesliga',
    [LeagueId.ZWEITE_BUNDESLIGA]: '2. Bundesliga',
    [LeagueId.SERIE_A]: 'Serie A',
    [LeagueId.SERIE_B_ITA]: 'Serie B',
    [LeagueId.LIGUE_1]: 'Ligue 1',
    [LeagueId.LIGUE_2]: 'Ligue 2',
    [LeagueId.LIGA_ARGENTINA]: 'Liga Profesional Argentina',
    [LeagueId.PRIMERA_NACIONAL]: 'Primera Nacional',
    [LeagueId.BRASILEIRAO]: 'Brasileirão Série A',
    [LeagueId.SERIE_B_BR]: 'Brasileirão Série B',
    [LeagueId.COPA_DE_PRIMERA]: 'Copa de Primera',
    [LeagueId.LIGA_MX]: 'Liga MX',
    [LeagueId.LIGA_EXPANSION_MX]: 'Liga de Expansión MX',
    [LeagueId.PRIMERA_DIVISION_CHILE]: 'Primera División de Chile',
    [LeagueId.PRIMERA_B_CHILE]: 'Primera B de Chile',
    [LeagueId.PRIMERA_A_COLOMBIA]: 'Liga BetPlay',
    [LeagueId.PRIMERA_B_COLOMBIA]: 'Torneo BetPlay',
};

function getLeagueDisplayName(leagueId: string): string {
    return LEAGUE_DISPLAY_NAMES[leagueId] || leagueId.replace(/_/g, ' ');
}

function isTeamInCup(cup: CupCompetition | undefined | null, teamId: number): boolean {
    if (!cup) return false;
    if (cup.groups && Array.isArray(cup.groups)) {
        if (cup.groups.some((g: CupGroup) => g.teams?.includes(teamId))) {
            return true;
        }
    }
    if (cup.rounds && Array.isArray(cup.rounds)) {
        if (cup.rounds.some((r: CupRound) => r.fixtures?.some((f: Match) => f.homeTeamId === teamId || f.awayTeamId === teamId))) {
            return true;
        }
    }
    if (cup.swissTable && Array.isArray(cup.swissTable)) {
        if (cup.swissTable.some(r => r.teamId === teamId)) {
            return true;
        }
    }
    if (cup.swissFixtures && Array.isArray(cup.swissFixtures)) {
        if (cup.swissFixtures.some(f => f.homeTeamId === teamId || f.awayTeamId === teamId)) {
            return true;
        }
    }
    return false;
}

function computeTeamCupStats(cup: CupCompetition | undefined, teamId: number) {
    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    const seenMatches = new Set<string | number>();
    const tallyMatch = (m: Match) => {
        if (!m || !m.result) return;
        if (m.homeTeamId !== teamId && m.awayTeamId !== teamId) return;
        const key = m.id ?? `${m.week}-${m.homeTeamId}-${m.awayTeamId}`;
        if (seenMatches.has(key)) return;
        seenMatches.add(key);

        const isHome = m.homeTeamId === teamId;
        const gf = isHome ? m.result.homeScore : m.result.awayScore;
        const ga = isHome ? m.result.awayScore : m.result.homeScore;
        played++;
        goalsFor += gf;
        goalsAgainst += ga;

        if (gf > ga) {
            won++;
        } else if (gf < ga) {
            lost++;
        } else {
            const pens = m.penalties || m.result.penalties;
            if (pens) {
                const userPens = isHome ? pens.home : pens.away;
                const oppPens = isHome ? pens.away : pens.home;
                if (userPens > oppPens) won++;
                else if (userPens < oppPens) lost++;
                else drawn++;
            } else {
                drawn++;
            }
        }
    };

    if (cup?.groups) {
        cup.groups.forEach(g => g.fixtures?.forEach(tallyMatch));
    }
    if (cup?.swissFixtures) {
        cup.swissFixtures.forEach(tallyMatch);
    }
    if (cup?.rounds) {
        cup.rounds.forEach(r => {
            r.fixtures?.forEach(tallyMatch);
            r.secondLegFixtures?.forEach(tallyMatch);
        });
    }

    if (played === 0) {
        const roundCount = cup?.rounds?.length || 5;
        return {
            played: roundCount,
            won: roundCount,
            drawn: 0,
            lost: 0,
            goalsFor: roundCount * 2,
            goalsAgainst: Math.max(1, roundCount - 2),
            goalDifference: roundCount + 2,
        };
    }

    return {
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
    };
}

export function detectCinematicEvents(
    gameState: GameState,
    updatedCups: GameState['cups'],
    updatedLeagueTables: Record<LeagueId, LeagueTableRow[]>,
    simulatedWeek: number,
    newWeek: number,
    justPlayedMatches: Match[]
): CinematicEvent[] {
    const events: CinematicEvent[] = [];
    const playerTeam = gameState.team;
    const seasonYear = gameState.season || 2026;
    const presidentName = gameState.playerProfile?.name;

    // 1. Check Torneo Apertura Champion
    if (updatedCups?.aperturaPlayoffs?.winnerId && !gameState.cups?.aperturaPlayoffs?.winnerId && updatedCups.aperturaPlayoffs.winnerId === playerTeam.id) {
        const argTable = updatedLeagueTables[LeagueId.LIGA_ARGENTINA] || [];
        const playerRow = argTable.find(r => r.teamId === playerTeam.id);
        const playoffStats = computeTeamCupStats(updatedCups.aperturaPlayoffs, playerTeam.id);
        events.push({
            id: `champ_apertura_${Date.now()}`,
            type: 'CUP_WIN',
            title: '¡CAMPEÓN DEL TORNEO APERTURA!',
            subtitle: `${playerTeam.name} se consagra campeón de la Liga Profesional tras conquistar los Playoffs`,
            metadata: {
                competition: `Torneo Apertura ${seasonYear}`,
                competitionId: 'LIGA_ARGENTINA',
                season: seasonYear,
                presidentName,
                team: playerTeam,
                accentColor: '#F59E0B',
                stats: {
                    played: (playerRow?.played || 16) + playoffStats.played,
                    won: (playerRow?.won || 0) + playoffStats.won,
                    goalsFor: (playerRow?.goalsFor || 0) + playoffStats.goalsFor,
                    goalDifference: (playerRow?.goalDifference || 0) + playoffStats.goalDifference
                }
            }
        });
    }

    // 2. Check Torneo Clausura Champion
    if (updatedCups?.clausuraPlayoffs?.winnerId && !gameState.cups?.clausuraPlayoffs?.winnerId && updatedCups.clausuraPlayoffs.winnerId === playerTeam.id) {
        const argTable = updatedLeagueTables[LeagueId.LIGA_ARGENTINA] || [];
        const playerRow = argTable.find(r => r.teamId === playerTeam.id);
        const playoffStats = computeTeamCupStats(updatedCups.clausuraPlayoffs, playerTeam.id);
        events.push({
            id: `champ_clausura_${Date.now()}`,
            type: 'CUP_WIN',
            title: '¡CAMPEÓN DEL TORNEO CLAUSURA!',
            subtitle: `${playerTeam.name} se consagra campeón de la Liga Profesional tras conquistar los Playoffs`,
            metadata: {
                competition: `Torneo Clausura ${seasonYear}`,
                competitionId: 'LIGA_ARGENTINA',
                season: seasonYear,
                presidentName,
                team: playerTeam,
                accentColor: '#06B6D4',
                stats: {
                    played: (playerRow?.played || 32) + playoffStats.played,
                    won: (playerRow?.won || 0) + playoffStats.won,
                    goalsFor: (playerRow?.goalsFor || 0) + playoffStats.goalsFor,
                    goalDifference: (playerRow?.goalDifference || 0) + playoffStats.goalDifference
                }
            }
        });
    }

    // 3. Primera Nacional (Primer Ascenso & Reducido)
    if (updatedCups?.nacionalPrimerAscenso?.winnerId && !gameState.cups?.nacionalPrimerAscenso?.winnerId && updatedCups.nacionalPrimerAscenso.winnerId === playerTeam.id) {
        const pnTable = updatedLeagueTables[LeagueId.PRIMERA_NACIONAL] || [];
        const pnRow = pnTable.find(r => r.teamId === playerTeam.id);
        events.push({
            id: `champ_primer_ascenso_${Date.now()}`,
            type: 'PROMOTION',
            title: '¡CAMPEÓN Y ASCENDIDO A PRIMERA!',
            subtitle: `${playerTeam.name} gana la Final por el 1º Ascenso y jugará en la Liga Profesional`,
            metadata: {
                competition: 'Primera Nacional (1º Ascenso)',
                competitionId: 'PRIMERA_NACIONAL',
                season: seasonYear,
                presidentName,
                team: playerTeam,
                accentColor: '#F59E0B',
                points: pnRow?.points,
                stats: {
                    played: pnRow?.played || 35,
                    won: pnRow?.won || 22,
                    goalsFor: pnRow?.goalsFor || 48,
                    goalDifference: pnRow?.goalDifference || 22
                }
            }
        });
    }

    if (updatedCups?.nacionalReducido?.winnerId && !gameState.cups?.nacionalReducido?.winnerId && updatedCups.nacionalReducido.winnerId === playerTeam.id) {
        const pnTable = updatedLeagueTables[LeagueId.PRIMERA_NACIONAL] || [];
        const pnRow = pnTable.find(r => r.teamId === playerTeam.id);
        events.push({
            id: `champ_reducido_${Date.now()}`,
            type: 'PROMOTION',
            title: '¡ASCENDIDO A PRIMERA DIVISIÓN!',
            subtitle: `${playerTeam.name} gana el Torneo Reducido y asciende a la máxima categoría`,
            metadata: {
                competition: 'Torneo Reducido (2º Ascenso)',
                competitionId: 'PRIMERA_NACIONAL',
                season: seasonYear,
                presidentName,
                team: playerTeam,
                accentColor: '#06B6D4',
                points: pnRow?.points,
                stats: {
                    played: pnRow?.played || 38,
                    won: pnRow?.won || 24,
                    goalsFor: pnRow?.goalsFor || 52,
                    goalDifference: pnRow?.goalDifference || 25
                }
            }
        });
    }

    // 4. Generic & National/International Cups
    const genericCups = [
        { key: 'copaLibertadores' as const, name: `Copa Libertadores ${seasonYear}`, compId: 'COPA_LIBERTADORES', accent: '#F59E0B' },
        { key: 'copaSudamericana' as const, name: `Copa Sudamericana ${seasonYear}`, compId: 'COPA_SUDAMERICANA', accent: '#D97706' },
        { key: 'championsLeague' as const, name: `UEFA Champions League ${seasonYear}`, compId: 'CHAMPIONS_LEAGUE', accent: '#6366F1' },
        { key: 'europaLeague' as const, name: `UEFA Europa League ${seasonYear}`, compId: 'EUROPA_LEAGUE', accent: '#F97316' },
        { key: 'copaIntercontinental' as const, name: `Copa Intercontinental ${seasonYear}`, compId: 'COPA_INTERCONTINENTAL', accent: '#10B981' },
        { key: 'faCup' as const, name: `FA Cup ${seasonYear}`, compId: 'FA_CUP', accent: '#EF4444' },
        { key: 'carabaoCup' as const, name: `Carabao Cup ${seasonYear}`, compId: 'CARABAO_CUP', accent: '#10B981' },
        { key: 'copaDelRey' as const, name: `Copa del Rey ${seasonYear}`, compId: 'COPA_DEL_REY', accent: '#DC2626' },
        { key: 'dfbPokal' as const, name: `DFB-Pokal ${seasonYear}`, compId: 'DFB_POKAL', accent: '#059669' },
        { key: 'coppaItalia' as const, name: `Coppa Italia ${seasonYear}`, compId: 'COPPA_ITALIA', accent: '#2563EB' },
        { key: 'copaArgentina' as const, name: `Copa Argentina ${seasonYear}`, compId: 'COPA_ARGENTINA', accent: '#0284C7' },
        { key: 'copaMx' as const, name: `Copa MX ${seasonYear}`, compId: 'COPA_MX', accent: '#059669' },
    ];

    for (const gc of genericCups) {
        const upCup = updatedCups ? updatedCups[gc.key] : undefined;
        const oldCup = gameState.cups ? gameState.cups[gc.key] : undefined;
        if (upCup?.winnerId && !oldCup?.winnerId && upCup.winnerId === playerTeam.id) {
            const cupStats = computeTeamCupStats(upCup, playerTeam.id);
            events.push({
                id: `champ_${gc.key}_${Date.now()}`,
                type: 'CUP_WIN',
                title: `¡CAMPEÓN DE LA ${gc.name.toUpperCase()}!`,
                subtitle: `${playerTeam.name} alza el trofeo tras una campaña histórica`,
                metadata: {
                    competition: gc.name,
                    competitionId: gc.compId,
                    season: seasonYear,
                    presidentName,
                    team: playerTeam,
                    accentColor: gc.accent,
                    stats: {
                        played: cupStats.played,
                        won: cupStats.won,
                        goalsFor: cupStats.goalsFor,
                        goalDifference: cupStats.goalDifference
                    }
                }
            });
        }
    }

    // 5. European / Standard League Titles
    const playerLeague = playerTeam.leagueId;
    const playerTable = updatedLeagueTables[playerLeague] || [];
    const playerRow = playerTable.find(r => r.teamId === playerTeam.id);
    let maxLeagueWeeks = 38;
    if (playerLeague === LeagueId.BUNDESLIGA || playerLeague === LeagueId.ZWEITE_BUNDESLIGA || playerLeague === LeagueId.LIGUE_1) {
        maxLeagueWeeks = 34;
    } else if (playerLeague === LeagueId.CHAMPIONSHIP) {
        maxLeagueWeeks = 46;
    } else if (playerLeague === LeagueId.SEGUNDA_DIVISION_ESP) {
        maxLeagueWeeks = 42;
    }

    const alreadyCelebratedLeague = (gameState.cinematicQueue || []).some(c => c.type === 'LEAGUE_WIN') ||
        (playerTeam.trophyCabinet || []).some(t => t.season === gameState.season);

    if (simulatedWeek === maxLeagueWeeks && playerRow && playerRow.position === 1 && !alreadyCelebratedLeague && !playerLeague.includes('ARGENTINA') && !playerLeague.includes('NACIONAL')) {
        events.push({
            id: `champ_league_${playerLeague}_${gameState.season}`,
            type: 'LEAGUE_WIN',
            title: '¡CAMPEÓN DE LIGA!',
            subtitle: `${playerTeam.name} finaliza en la cima de la tabla y conquista el campeonato`,
            metadata: {
                competition: getLeagueDisplayName(playerLeague),
                competitionId: playerLeague,
                season: seasonYear,
                presidentName,
                points: playerRow.points,
                drawn: playerRow.drawn,
                lost: playerRow.lost,
                team: playerTeam,
                accentColor: '#F59E0B',
                stats: {
                    played: playerRow.played,
                    won: playerRow.won,
                    goalsFor: playerRow.goalsFor,
                    goalDifference: playerRow.goalDifference
                }
            }
        });
    }

    // 6. First Round Kick-offs for International Cups (Strictly filtered to user's team participation)
    const libertadoresMatches = justPlayedMatches.filter(m => m.competition === 'Copa_Libertadores');
    const isPlayerInLib = isTeamInCup(gameState.cups.copaLibertadores, playerTeam.id);
    const isFirstLibRound = gameState.cups.copaLibertadores?.rounds?.length > 0 &&
        gameState.cups.copaLibertadores.rounds[0].fixtures.every(m => !m.result) &&
        libertadoresMatches.length > 0;
    if (isFirstLibRound && isPlayerInLib) {
        events.push({
            id: `cup_kickoff_libertadores_${newWeek}`,
            type: 'CUP_KICKOFF',
            title: 'COPA LIBERTADORES',
            subtitle: 'La gloria eterna comienza. El máximo escenario del continente.',
            metadata: {
                competition: 'Copa Libertadores',
                competitionId: 'COPA_LIBERTADORES',
                accentColor: '#F59E0B',
                bgClass: 'from-amber-900 via-slate-950 to-slate-950'
            }
        });
    }

    const championsLeagueMatches = justPlayedMatches.filter(m => m.competition === 'Champions_League');
    const isPlayerInCL = isTeamInCup(gameState.cups.championsLeague, playerTeam.id);
    const isFirstCLRound = gameState.cups.championsLeague?.rounds?.length > 0 &&
        gameState.cups.championsLeague.rounds[0].fixtures.every(m => !m.result) &&
        championsLeagueMatches.length > 0;
    if (isFirstCLRound && isPlayerInCL) {
        events.push({
            id: `cup_kickoff_champions_${newWeek}`,
            type: 'CUP_KICKOFF',
            title: 'UEFA CHAMPIONS LEAGUE',
            subtitle: 'La élite del fútbol europeo se da cita en la búsqueda de la Orejona.',
            metadata: {
                competition: 'Champions League',
                competitionId: 'CHAMPIONS_LEAGUE',
                accentColor: '#6366F1',
                bgClass: 'from-indigo-900 via-slate-950 to-slate-950'
            }
        });
    }

    const intercontinentalMatches = justPlayedMatches.filter(m => m.competition === 'Copa_Intercontinental');
    const isPlayerInInter = isTeamInCup(gameState.cups.copaIntercontinental, playerTeam.id);
    const isFirstInterRound = gameState.cups.copaIntercontinental?.rounds?.length > 0 &&
        gameState.cups.copaIntercontinental.rounds[0].fixtures.every(m => !m.result) &&
        intercontinentalMatches.length > 0;
    if (isFirstInterRound && isPlayerInInter) {
        events.push({
            id: `cup_kickoff_intercontinental_${newWeek}`,
            type: 'CUP_KICKOFF',
            title: 'COPA INTERCONTINENTAL',
            subtitle: 'El campeón de Europa frente al campeón de Sudamérica. La cumbre mundial.',
            metadata: {
                competition: 'Copa Intercontinental',
                competitionId: 'COPA_INTERCONTINENTAL',
                accentColor: '#10B981',
                bgClass: 'from-emerald-900 via-slate-950 to-slate-950'
            }
        });
    }

    return events;
}
