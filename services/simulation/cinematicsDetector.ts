import { GameState, Team, CinematicEvent, LeagueId, Match, LeagueTableRow, CupCompetition, CupGroup, CupRound } from '../../types';
import { TOURNAMENT_LOGOS } from '../customPacks/argentineLogos';

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

    // 1. Check Torneo Apertura Champion
    if (updatedCups?.aperturaPlayoffs?.winnerId && !gameState.cups?.aperturaPlayoffs?.winnerId && updatedCups.aperturaPlayoffs.winnerId === playerTeam.id) {
        const argTable = updatedLeagueTables[LeagueId.LIGA_ARGENTINA] || [];
        const playerRow = argTable.find(r => r.teamId === playerTeam.id);
        events.push({
            id: `champ_apertura_${Date.now()}`,
            type: 'CUP_WIN',
            title: '¡CAMPEÓN DEL TORNEO APERTURA!',
            subtitle: `${playerTeam.name} se consagra campeón de la Liga Profesional tras conquistar los Playoffs`,
            metadata: {
                competition: 'Torneo Apertura 2026',
                team: playerTeam,
                accentColor: '#F59E0B',
                stats: {
                    played: (playerRow?.played || 16) + 4,
                    won: (playerRow?.won || 0) + 4,
                    goalsFor: (playerRow?.goalsFor || 0) + 7,
                    goalDifference: (playerRow?.goalDifference || 0) + 5
                }
            }
        });
    }

    // 2. Check Torneo Clausura Champion
    if (updatedCups?.clausuraPlayoffs?.winnerId && !gameState.cups?.clausuraPlayoffs?.winnerId && updatedCups.clausuraPlayoffs.winnerId === playerTeam.id) {
        const argTable = updatedLeagueTables[LeagueId.LIGA_ARGENTINA] || [];
        const playerRow = argTable.find(r => r.teamId === playerTeam.id);
        events.push({
            id: `champ_clausura_${Date.now()}`,
            type: 'CUP_WIN',
            title: '¡CAMPEÓN DEL TORNEO CLAUSURA!',
            subtitle: `${playerTeam.name} se consagra campeón de la Liga Profesional tras conquistar los Playoffs`,
            metadata: {
                competition: 'Torneo Clausura 2026',
                team: playerTeam,
                accentColor: '#06B6D4',
                stats: {
                    played: (playerRow?.played || 32) + 4,
                    won: (playerRow?.won || 0) + 4,
                    goalsFor: (playerRow?.goalsFor || 0) + 8,
                    goalDifference: (playerRow?.goalDifference || 0) + 6
                }
            }
        });
    }

    // 3. Primera Nacional (Primer Ascenso & Reducido)
    if (updatedCups?.nacionalPrimerAscenso?.winnerId && !gameState.cups?.nacionalPrimerAscenso?.winnerId && updatedCups.nacionalPrimerAscenso.winnerId === playerTeam.id) {
        events.push({
            id: `champ_primer_ascenso_${Date.now()}`,
            type: 'PROMOTION',
            title: '¡CAMPEÓN Y ASCENDIDO A PRIMERA!',
            subtitle: `${playerTeam.name} gana la Final por el 1º Ascenso y jugará en la Liga Profesional`,
            metadata: {
                competition: 'Primera Nacional (1º Ascenso)',
                team: playerTeam,
                accentColor: '#F59E0B',
                stats: { played: 35, won: 22, goalsFor: 48, goalDifference: 22 }
            }
        });
    }

    if (updatedCups?.nacionalReducido?.winnerId && !gameState.cups?.nacionalReducido?.winnerId && updatedCups.nacionalReducido.winnerId === playerTeam.id) {
        events.push({
            id: `champ_reducido_${Date.now()}`,
            type: 'PROMOTION',
            title: '¡ASCENDIDO A PRIMERA DIVISIÓN!',
            subtitle: `${playerTeam.name} gana el Torneo Reducido y asciende a la máxima categoría`,
            metadata: {
                competition: 'Torneo Reducido (2º Ascenso)',
                team: playerTeam,
                accentColor: '#06B6D4',
                stats: { played: 38, won: 24, goalsFor: 52, goalDifference: 25 }
            }
        });
    }

    // 4. Generic & National/International Cups
    const genericCups = [
        { key: 'copaLibertadores' as const, name: 'Copa Libertadores 2026', accent: '#F59E0B' },
        { key: 'copaSudamericana' as const, name: 'Copa Sudamericana 2026', accent: '#D97706' },
        { key: 'championsLeague' as const, name: 'UEFA Champions League 2026', accent: '#6366F1' },
        { key: 'copaIntercontinental' as const, name: 'Copa Intercontinental 2026', accent: '#10B981' },
        { key: 'faCup' as const, name: 'FA Cup 2026', accent: '#EF4444' },
        { key: 'carabaoCup' as const, name: 'Carabao Cup 2026', accent: '#10B981' },
        { key: 'copaDelRey' as const, name: 'Copa del Rey 2026', accent: '#DC2626' },
        { key: 'dfbPokal' as const, name: 'DFB-Pokal 2026', accent: '#059669' },
        { key: 'coppaItalia' as const, name: 'Coppa Italia 2026', accent: '#2563EB' },
        { key: 'copaArgentina' as const, name: 'Copa Argentina 2026', accent: '#0284C7' },
    ];

    for (const gc of genericCups) {
        const upCup = updatedCups ? updatedCups[gc.key] : undefined;
        const oldCup = gameState.cups ? gameState.cups[gc.key] : undefined;
        if (upCup?.winnerId && !oldCup?.winnerId && upCup.winnerId === playerTeam.id) {
            events.push({
                id: `champ_${gc.key}_${Date.now()}`,
                type: 'CUP_WIN',
                title: `¡CAMPEÓN DE LA ${gc.name.toUpperCase()}!`,
                subtitle: `${playerTeam.name} alza el trofeo tras una campaña histórica`,
                metadata: {
                    competition: gc.name,
                    team: playerTeam,
                    accentColor: gc.accent,
                    stats: {
                        played: upCup.rounds?.length || 6,
                        won: upCup.rounds?.length || 6,
                        goalsFor: 14,
                        goalDifference: 10
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
                competition: playerLeague.replace(/_/g, ' '),
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
                logoUrl: TOURNAMENT_LOGOS.COPA_LIBERTADORES,
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
                logoUrl: TOURNAMENT_LOGOS.CHAMPIONS_LEAGUE,
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
                logoUrl: TOURNAMENT_LOGOS.COPA_INTERCONTINENTAL,
                accentColor: '#10B981',
                bgClass: 'from-emerald-900 via-slate-950 to-slate-950'
            }
        });
    }

    return events;
}
