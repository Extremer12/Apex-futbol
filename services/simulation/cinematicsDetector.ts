import { GameState, Team, CinematicEvent, LeagueId, Match, LeagueTableRow } from '../../types';

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

    // 🏆 1. Check Torneo Apertura Champion
    if (updatedCups.aperturaPlayoffs?.winnerId && !gameState.cups.aperturaPlayoffs?.winnerId && updatedCups.aperturaPlayoffs.winnerId === playerTeam.id) {
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

    // 🏆 2. Check Torneo Clausura Champion
    if (updatedCups.clausuraPlayoffs?.winnerId && !gameState.cups.clausuraPlayoffs?.winnerId && updatedCups.clausuraPlayoffs.winnerId === playerTeam.id) {
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

    // 🏆 3. Primera Nacional (Primer Ascenso & Reducido)
    if (updatedCups.nacionalPrimerAscenso?.winnerId && !gameState.cups.nacionalPrimerAscenso?.winnerId && updatedCups.nacionalPrimerAscenso.winnerId === playerTeam.id) {
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

    if (updatedCups.nacionalReducido?.winnerId && !gameState.cups.nacionalReducido?.winnerId && updatedCups.nacionalReducido.winnerId === playerTeam.id) {
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

    // 🏆 4. Generic & National/International Cups
    const genericCups = [
        { key: 'copaLibertadores' as const, name: 'Copa Libertadores 2026', accent: '#F59E0B' },
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
        const upCup = updatedCups[gc.key];
        const oldCup = gameState.cups[gc.key];
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

    // 🏆 5. European / Standard League Titles
    const playerLeague = playerTeam.leagueId;
    const playerTable = updatedLeagueTables[playerLeague] || [];
    const playerRow = playerTable.find(r => r.teamId === playerTeam.id);
    const maxLeagueWeeks = playerLeague === LeagueId.BUNDESLIGA ? 34 : 38;
    if (simulatedWeek >= maxLeagueWeeks && playerRow && playerRow.position === 1 && !playerLeague.includes('ARGENTINA') && !playerLeague.includes('NACIONAL')) {
        events.push({
            id: `champ_league_${Date.now()}`,
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

    // 🌍 6. First Round Kick-offs for International Cups
    const libertadoresMatches = justPlayedMatches.filter(m => m.competition === 'Copa_Libertadores');
    const isFirstLibRound = gameState.cups.copaLibertadores?.rounds?.length > 0 &&
        gameState.cups.copaLibertadores.rounds[0].fixtures.every(m => !m.result) &&
        libertadoresMatches.length > 0;
    if (isFirstLibRound) {
        events.push({
            id: `cup_kickoff_libertadores_${newWeek}`,
            type: 'CUP_KICKOFF',
            title: '🏆 COPA LIBERTADORES',
            subtitle: 'El fútbol sudamericano llama. La lucha por la gloria comienza.',
            metadata: {
                competition: 'Copa Libertadores',
                logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/ac/Copa_Libertadores_logo.svg',
                accentColor: '#F59E0B',
                bgClass: 'from-amber-900 via-slate-950 to-slate-950'
            }
        });
    }

    const championsLeagueMatches = justPlayedMatches.filter(m => m.competition === 'Champions_League');
    const isFirstCLRound = gameState.cups.championsLeague?.rounds?.length > 0 &&
        gameState.cups.championsLeague.rounds[0].fixtures.every(m => !m.result) &&
        championsLeagueMatches.length > 0;
    if (isFirstCLRound) {
        events.push({
            id: `cup_kickoff_champions_${newWeek}`,
            type: 'CUP_KICKOFF',
            title: '⭐ UEFA CHAMPIONS LEAGUE',
            subtitle: 'La noche más importante del fútbol europeo. ¿Quién alzará la Orejona?',
            metadata: {
                competition: 'Champions League',
                logoUrl: 'https://tmssl.akamaized.net/images/logo/header/CL.png',
                accentColor: '#6366F1',
                bgClass: 'from-indigo-900 via-slate-950 to-slate-950'
            }
        });
    }

    const intercontinentalMatches = justPlayedMatches.filter(m => m.competition === 'Copa_Intercontinental');
    const isFirstInterRound = gameState.cups.copaIntercontinental?.rounds?.length > 0 &&
        gameState.cups.copaIntercontinental.rounds[0].fixtures.every(m => !m.result) &&
        intercontinentalMatches.length > 0;
    if (isFirstInterRound) {
        events.push({
            id: `cup_kickoff_intercontinental_${newWeek}`,
            type: 'CUP_KICKOFF',
            title: '🌍 COPA INTERCONTINENTAL',
            subtitle: 'El campeón de Europa vs el campeón de Sudamérica. El mejor del mundo.',
            metadata: {
                competition: 'Copa Intercontinental',
                logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5b/FIFA_Intercontinental_Cup_%28logo%29.png',
                accentColor: '#10B981',
                bgClass: 'from-emerald-900 via-slate-950 to-slate-950'
            }
        });
    }

    return events;
}
