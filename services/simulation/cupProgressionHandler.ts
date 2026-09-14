import { GameState, Team, Match, LeagueId, CinematicEvent, LeagueTableRow } from '../../types';
import { 
    advanceCupRound, 
    progressInternationalCup, 
    checkAndScheduleIntercontinental, 
    generateArgentinePlayoffs, 
    generateNacionalPrimerAscenso, 
    generateNacionalReducidoPhase1, 
    generateNacionalReducidoCuartos, 
    determineCupWinner,
    calculateTournamentStandings
} from '../simulation';
import { sortLibertadoresGroupTable } from '../libertadoresEngine';
import { 
    sortSudamericanaGroupTable, 
    generateSudamericanaPlayoff, 
    drawSudamericanaOctavos 
} from '../sudamericanaEngine';
import { TOURNAMENT_LOGOS } from '../customPacks/argentineLogos';

export interface CupProgressionResult {
    updatedCups: GameState['cups'];
    updatedSchedule: Match[];
    cinematicEvents: CinematicEvent[];
}

/**
 * Accurately derives group standings (played, won, drawn, lost, GF, GA, GD, points)
 * directly from completed fixtures to prevent any stale state or incorrect rankings.
 */
function syncAndRecalculateGroupTable(group: any) {
    if (!group || !group.table || !group.fixtures) return;

    const tableMap = new Map<number, any>();
    group.table.forEach((row: any) => {
        tableMap.set(row.teamId, {
            ...row,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            form: []
        });
    });

    group.fixtures.forEach((f: Match) => {
        if (f.result) {
            const home = tableMap.get(f.homeTeamId);
            const away = tableMap.get(f.awayTeamId);
            if (home && away) {
                home.played++;
                away.played++;
                home.goalsFor += f.result.homeScore;
                away.goalsFor += f.result.awayScore;
                home.goalsAgainst += f.result.awayScore;
                away.goalsAgainst += f.result.homeScore;
                home.goalDifference = home.goalsFor - home.goalsAgainst;
                away.goalDifference = away.goalsFor - away.goalsAgainst;

                if (f.result.homeScore > f.result.awayScore) {
                    home.won++;
                    home.points += 3;
                    away.lost++;
                } else if (f.result.awayScore > f.result.homeScore) {
                    away.won++;
                    away.points += 3;
                    home.lost++;
                } else {
                    home.drawn++;
                    home.points += 1;
                    away.drawn++;
                    away.points += 1;
                }
            }
        }
    });

    group.table = Array.from(tableMap.values());
}

export function handleCupProgression(
    cups: GameState['cups'],
    schedule: Match[],
    teams: Team[],
    simulatedWeek: number,
    newWeek: number,
    leagueTables: Record<LeagueId, LeagueTableRow[]>,
    currentTurn: 'weekend' | 'midweek',
    playerTeamId?: number
): CupProgressionResult {
    const updatedCups: GameState['cups'] = { ...cups };
    const updatedSchedule: Match[] = [...schedule];
    const cinematicEvents: CinematicEvent[] = [];

    const justPlayedMatches = updatedSchedule.filter(
        m => m.result !== undefined && m.week === simulatedWeek && !!m.isMidweek === (currentTurn === 'midweek')
    );

    // 1. FA Cup
    if (updatedCups.faCup?.rounds?.length && !updatedCups.faCup.winnerId) {
        const prevRoundsCount = updatedCups.faCup.rounds.length;
        const nextCupWeek = newWeek + 4;
        updatedCups.faCup = advanceCupRound(updatedCups.faCup, teams, nextCupWeek, updatedSchedule);
        if (updatedCups.faCup.rounds.length > prevRoundsCount) {
            const newRound = updatedCups.faCup.rounds[updatedCups.faCup.rounds.length - 1];
            updatedSchedule.push(...newRound.fixtures);
        }
    }

    // 2. Carabao Cup
    if (updatedCups.carabaoCup?.rounds?.length && !updatedCups.carabaoCup.winnerId) {
        const prevRoundsCount = updatedCups.carabaoCup.rounds.length;
        const nextCupWeek = newWeek + 3;
        updatedCups.carabaoCup = advanceCupRound(updatedCups.carabaoCup, teams, nextCupWeek, updatedSchedule);
        if (updatedCups.carabaoCup.rounds.length > prevRoundsCount) {
            const newRound = updatedCups.carabaoCup.rounds[updatedCups.carabaoCup.rounds.length - 1];
            updatedSchedule.push(...newRound.fixtures);
        }
    }

    // 2.1 Copa del Rey (España)
    if (updatedCups.copaDelRey?.rounds?.length && !updatedCups.copaDelRey.winnerId) {
        const prevRoundsCount = updatedCups.copaDelRey.rounds.length;
        const nextCupWeek = newWeek + 4;
        updatedCups.copaDelRey = advanceCupRound(updatedCups.copaDelRey, teams, nextCupWeek, updatedSchedule);
        if (updatedCups.copaDelRey.rounds.length > prevRoundsCount) {
            const newRound = updatedCups.copaDelRey.rounds[updatedCups.copaDelRey.rounds.length - 1];
            updatedSchedule.push(...newRound.fixtures);
        }
    }

    // 2.2 DFB-Pokal (Alemania)
    if (updatedCups.dfbPokal?.rounds?.length && !updatedCups.dfbPokal.winnerId) {
        const prevRoundsCount = updatedCups.dfbPokal.rounds.length;
        const nextCupWeek = newWeek + 4;
        updatedCups.dfbPokal = advanceCupRound(updatedCups.dfbPokal, teams, nextCupWeek, updatedSchedule);
        if (updatedCups.dfbPokal.rounds.length > prevRoundsCount) {
            const newRound = updatedCups.dfbPokal.rounds[updatedCups.dfbPokal.rounds.length - 1];
            updatedSchedule.push(...newRound.fixtures);
        }
    }

    // 2.3 Coppa Italia (Italia)
    if (updatedCups.coppaItalia?.rounds?.length && !updatedCups.coppaItalia.winnerId) {
        const prevRoundsCount = updatedCups.coppaItalia.rounds.length;
        const nextCupWeek = newWeek + 4;
        updatedCups.coppaItalia = advanceCupRound(updatedCups.coppaItalia, teams, nextCupWeek, updatedSchedule);
        if (updatedCups.coppaItalia.rounds.length > prevRoundsCount) {
            const newRound = updatedCups.coppaItalia.rounds[updatedCups.coppaItalia.rounds.length - 1];
            updatedSchedule.push(...newRound.fixtures);
        }
    }

    // 2.4 Copa Argentina (Argentina)
    if (updatedCups.copaArgentina?.rounds?.length && !updatedCups.copaArgentina.winnerId) {
        const prevRoundsCount = updatedCups.copaArgentina.rounds.length;
        const nextCupWeek = newWeek + 4;
        updatedCups.copaArgentina = advanceCupRound(updatedCups.copaArgentina, teams, nextCupWeek, updatedSchedule);
        if (updatedCups.copaArgentina.rounds.length > prevRoundsCount) {
            const newRound = updatedCups.copaArgentina.rounds[updatedCups.copaArgentina.rounds.length - 1];
            updatedSchedule.push(...newRound.fixtures);
        }
    }

    // 3. Copa Libertadores
    if (updatedCups.copaLibertadores && !updatedCups.copaLibertadores.winnerId) {
        const libertadoresMatches = justPlayedMatches.filter(m => m.competition === 'Copa_Libertadores');
        const shouldCheckProgression = libertadoresMatches.length > 0 || (updatedCups.copaLibertadores.phase === 'groups' && simulatedWeek >= 18);
        if (shouldCheckProgression) {
            const nextCupWeek = newWeek + 4;
            const wasGroups = updatedCups.copaLibertadores.phase === 'groups';
            const result = progressInternationalCup(updatedCups.copaLibertadores, teams, nextCupWeek, updatedSchedule);
            updatedCups.copaLibertadores = result;

            if (result.newFixtures) {
                updatedSchedule.push(...result.newFixtures);
                const isPlayerInNewFixtures = playerTeamId ? result.newFixtures.some(f => f.homeTeamId === playerTeamId || f.awayTeamId === playerTeamId) : false;
                // Only show kickoff cinematic once, upon entering knockout phase
                if (isPlayerInNewFixtures && wasGroups && result.phase === 'knockout') {
                    cinematicEvents.push({ 
                        id: `libertadores_ko_${Date.now()}`,
                        type: 'CUP_KICKOFF',
                        title: 'COPA LIBERTADORES',
                        subtitle: '¡Comienzan las eliminatorias directas!',
                        metadata: { 
                            competition: 'Copa Libertadores',
                            logoUrl: TOURNAMENT_LOGOS.COPA_LIBERTADORES,
                            accentColor: '#F59E0B', 
                            bgClass: 'from-amber-900 via-slate-950 to-slate-950' 
                        }
                    });
                }
            }
        }
    }

    // 3.1 Copa Sudamericana
    if (updatedCups.copaSudamericana && !updatedCups.copaSudamericana.winnerId) {
        const sudamericanaMatches = justPlayedMatches.filter(m => m.competition === 'Copa_Sudamericana');

        // A. Group Phase -> Playoff de Octavos (Week 18 -> Week 20)
        if (updatedCups.copaSudamericana.phase === 'groups') {
            const groups = updatedCups.copaSudamericana.groups || [];
            // Sync group fixtures with schedule
            groups.forEach(g => {
                g.fixtures = g.fixtures.map(f => {
                    if (f.result !== undefined) return f;
                    const played = updatedSchedule.find(m =>
                        ((f.id && m.id && f.id === m.id) ||
                        (m.homeTeamId === f.homeTeamId && m.awayTeamId === f.awayTeamId && m.competition === f.competition && m.week === f.week)) &&
                        m.result !== undefined
                    );
                    return played ? { ...f, result: played.result, penalties: played.penalties } : f;
                });
            });

            // Also ensure libertadores group stage has fixture results synced
            const libGroups = updatedCups.copaLibertadores?.groups || [];
            libGroups.forEach(g => {
                g.fixtures = g.fixtures.map(f => {
                    if (f.result !== undefined) return f;
                    const played = updatedSchedule.find(m =>
                        ((f.id && m.id && f.id === m.id) ||
                        (m.homeTeamId === f.homeTeamId && m.awayTeamId === f.awayTeamId && m.competition === f.competition && m.week === f.week)) &&
                        m.result !== undefined
                    );
                    return played ? { ...f, result: played.result, penalties: played.penalties } : f;
                });
            });

            // Recalculate standings table from scratch based on actual fixture results
            groups.forEach(g => syncAndRecalculateGroupTable(g));
            libGroups.forEach(g => syncAndRecalculateGroupTable(g));

            const allGroupsPlayed = groups.length === 8 && groups.every(g => g.fixtures.every(f => f.result !== undefined));

            if (allGroupsPlayed && (simulatedWeek >= 18 || sudamericanaMatches.length > 0)) {
                // Extract 8 2nd-place from Sudamericana
                const sudRunnersUp = groups.map(g => {
                    const sorted = sortSudamericanaGroupTable(g.table, teams);
                    const row = sorted[1];
                    const team = teams.find(t => t.id === row?.teamId);
                    return team ? { team, points: row.points, goalDifference: row.goalDifference, goalsFor: row.goalsFor } : null;
                }).filter(Boolean) as { team: Team; points: number; goalDifference: number; goalsFor: number }[];

                // Extract 8 3rd-place from Libertadores
                const libThirds = libGroups.map(g => {
                    const sorted = sortLibertadoresGroupTable(g.table, teams);
                    const row = sorted[2];
                    const team = teams.find(t => t.id === row?.teamId);
                    return team ? { team, points: row.points, goalDifference: row.goalDifference, goalsFor: row.goalsFor } : null;
                }).filter(Boolean) as { team: Team; points: number; goalDifference: number; goalsFor: number }[];

                if (sudRunnersUp.length === 8 && libThirds.length === 8) {
                    const playoffFixtures = generateSudamericanaPlayoff(sudRunnersUp, libThirds, 20);
                    updatedCups.copaSudamericana = {
                        ...updatedCups.copaSudamericana,
                        phase: 'knockout',
                        rounds: [{ name: 'Playoff Octavos', fixtures: playoffFixtures, completed: false }],
                        currentRoundIndex: 0
                    };
                    updatedSchedule.push(...playoffFixtures);

                    const isPlayerInPlayoff = playerTeamId ? playoffFixtures.some(f => f.homeTeamId === playerTeamId || f.awayTeamId === playerTeamId) : false;
                    if (isPlayerInPlayoff) {
                        cinematicEvents.push({ 
                            id: `sudamericana_playoff_${Date.now()}`,
                            type: 'CUP_KICKOFF',
                            title: 'COPA SUDAMERICANA',
                            subtitle: '¡Playoff de Octavos de Final!',
                            metadata: { 
                                competition: 'Copa Sudamericana',
                                logoUrl: TOURNAMENT_LOGOS.COPA_SUDAMERICANA,
                                accentColor: '#D97706', 
                                bgClass: 'from-amber-900 via-slate-950 to-slate-950' 
                            }
                        });
                    }
                }
            }
        } else if (updatedCups.copaSudamericana.phase === 'knockout') {
            const currentRound = updatedCups.copaSudamericana.rounds[updatedCups.copaSudamericana.currentRoundIndex];
            if (currentRound) {
                // Sync current round fixtures
                currentRound.fixtures = currentRound.fixtures.map(f => {
                    if (f.result !== undefined) return f;
                    const played = updatedSchedule.find(m =>
                        ((f.id && m.id && f.id === m.id) ||
                        (m.homeTeamId === f.homeTeamId && m.awayTeamId === f.awayTeamId && m.competition === f.competition && m.week === f.week)) &&
                        m.result !== undefined
                    );
                    return played ? { ...f, result: played.result, penalties: played.penalties } : f;
                });

                const allRoundPlayed = currentRound.fixtures.every(f => f.result !== undefined);
                if (allRoundPlayed) {
                    if (currentRound.name === 'Playoff Octavos') {
                        // Playoff finished -> generate Octavos (Week 24)
                        const playoffWinners = currentRound.fixtures.map(f => {
                            const wId = determineCupWinner(f);
                            return teams.find(t => t.id === wId)!;
                        }).filter(Boolean);

                        const groups = updatedCups.copaSudamericana.groups || [];
                        const groupWinners = groups.map(g => {
                            const sorted = sortSudamericanaGroupTable(g.table, teams);
                            const row = sorted[0];
                            return teams.find(t => t.id === row?.teamId)!;
                        }).filter(Boolean);

                        if (playoffWinners.length === 8 && groupWinners.length === 8) {
                            const octavosFixtures = drawSudamericanaOctavos(groupWinners, playoffWinners, 24);
                            updatedCups.copaSudamericana = {
                                ...updatedCups.copaSudamericana,
                                rounds: [
                                    { ...currentRound, completed: true },
                                    { name: 'Round of 16', fixtures: octavosFixtures, completed: false }
                                ],
                                currentRoundIndex: 1
                            };
                            updatedSchedule.push(...octavosFixtures);

                            const isPlayerInOctavos = playerTeamId ? octavosFixtures.some(f => f.homeTeamId === playerTeamId || f.awayTeamId === playerTeamId) : false;
                            if (isPlayerInOctavos) {
                                cinematicEvents.push({ 
                                    id: `sudamericana_octavos_${Date.now()}`,
                                    type: 'CUP_KICKOFF',
                                    title: 'COPA SUDAMERICANA',
                                    subtitle: '¡Octavos de Final!',
                                    metadata: { 
                                        competition: 'Copa Sudamericana',
                                        logoUrl: TOURNAMENT_LOGOS.COPA_SUDAMERICANA,
                                        accentColor: '#D97706', 
                                        bgClass: 'from-amber-900 via-slate-950 to-slate-950' 
                                    }
                                });
                            }
                        }
                    } else {
                        // Subsequent knockout rounds: Octavos (W24) -> Cuartos (W28) -> Semis (W31) -> Final (W34)
                        const prevRoundsCount = updatedCups.copaSudamericana.rounds.length;
                        const matchCount = currentRound.fixtures.length;
                        let nextRoundWeek = newWeek + 4;
                        if (matchCount === 8) nextRoundWeek = 28; // Cuartos
                        else if (matchCount === 4) nextRoundWeek = 31; // Semifinales
                        else if (matchCount === 2) nextRoundWeek = 34; // Gran Final

                        updatedCups.copaSudamericana = advanceCupRound(updatedCups.copaSudamericana, teams, nextRoundWeek, updatedSchedule);
                        if (updatedCups.copaSudamericana.rounds.length > prevRoundsCount) {
                            const newRound = updatedCups.copaSudamericana.rounds[updatedCups.copaSudamericana.rounds.length - 1];
                            updatedSchedule.push(...newRound.fixtures);
                        }
                    }
                }
            }
        }
    }

    // 4. Champions League
    const championsLeagueMatches = justPlayedMatches.filter(m => m.competition === 'Champions_League');
    if (championsLeagueMatches.length > 0 && championsLeagueMatches.every(m => m.result !== undefined)) {
        const nextCupWeek = newWeek + 5;
        const wasSwiss = updatedCups.championsLeague.phase === 'swiss';
        const result = progressInternationalCup(updatedCups.championsLeague, teams, nextCupWeek, updatedSchedule);
        updatedCups.championsLeague = result;

        if (result.newFixtures) {
            updatedSchedule.push(...result.newFixtures);
            const isPlayerInCL = playerTeamId ? result.newFixtures.some(f => f.homeTeamId === playerTeamId || f.awayTeamId === playerTeamId) : false;
            // Only show kickoff cinematic once, upon entering knockout phase
            if (isPlayerInCL && wasSwiss && result.phase === 'knockout') {
                cinematicEvents.push({ 
                    id: `champions_ko_${Date.now()}`,
                    type: 'CUP_KICKOFF',
                    title: 'UEFA CHAMPIONS LEAGUE',
                    subtitle: '¡Comienzan las eliminatorias directas!',
                    metadata: { 
                        competition: 'Champions League',
                        logoUrl: TOURNAMENT_LOGOS.CHAMPIONS_LEAGUE,
                        accentColor: '#3B82F6', 
                        bgClass: 'from-blue-900 via-slate-950 to-slate-950' 
                    }
                });
            }
        }
    }

    // 5. Check Intercontinental Final
    const interCup = checkAndScheduleIntercontinental({ cups: updatedCups, allTeams: teams }, newWeek);
    if (interCup) {
        updatedCups.copaIntercontinental = interCup;
        updatedSchedule.push(...interCup.rounds[0].fixtures);
    }

    const intercontinentalMatches = justPlayedMatches.filter(m => m.competition === 'Copa_Intercontinental');
    if (intercontinentalMatches.length > 0 && intercontinentalMatches.every(m => m.result !== undefined)) {
        updatedCups.copaIntercontinental = advanceCupRound(updatedCups.copaIntercontinental, teams, newWeek, updatedSchedule);
    }

    // 6. Argentine Playoffs (Torneo Apertura)
    if (simulatedWeek >= 16 && (!updatedCups.aperturaPlayoffs || !updatedCups.aperturaPlayoffs.rounds || updatedCups.aperturaPlayoffs.rounds.length === 0)) {
        const { zoneA, zoneB } = calculateTournamentStandings(updatedSchedule, 'Torneo_Apertura', teams);

        if (zoneA.length >= 8 && zoneB.length >= 8) {
            const octavosFixtures = generateArgentinePlayoffs(zoneA.slice(0, 8), zoneB.slice(0, 8), 'Playoffs_Apertura', 17);
            updatedCups.aperturaPlayoffs = {
                id: 'apertura_playoffs',
                name: 'Playoffs Apertura',
                type: 'knockout',
                phase: 'knockout',
                rounds: [{ name: 'Round of 16', fixtures: octavosFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: updatedCups.aperturaPlayoffs?.statistics?.championsHistory || [] }
            };
            updatedSchedule.push(...octavosFixtures);
        }
    }

    if (updatedCups.aperturaPlayoffs?.rounds?.length && !updatedCups.aperturaPlayoffs.winnerId) {
        const prevRoundsCount = updatedCups.aperturaPlayoffs.rounds.length;
        const nextPlayoffWeek = Math.min(20, Math.max(17, simulatedWeek) + 1);
        updatedCups.aperturaPlayoffs = advanceCupRound(updatedCups.aperturaPlayoffs, teams, nextPlayoffWeek, updatedSchedule);
        if (updatedCups.aperturaPlayoffs.rounds.length > prevRoundsCount) {
            const nextRound = updatedCups.aperturaPlayoffs.rounds[updatedCups.aperturaPlayoffs.rounds.length - 1];
            updatedSchedule.push(...nextRound.fixtures);
        }

        // Safety fallback: ensure final champion is crowned if final match completed
        if (!updatedCups.aperturaPlayoffs.winnerId && updatedCups.aperturaPlayoffs.rounds.length > 0) {
            const lastRound = updatedCups.aperturaPlayoffs.rounds[updatedCups.aperturaPlayoffs.rounds.length - 1];
            if (lastRound.fixtures?.length === 1 && lastRound.fixtures[0].result !== undefined) {
                const wId = determineCupWinner(lastRound.fixtures[0]);
                if (wId) {
                    updatedCups.aperturaPlayoffs.winnerId = wId;
                    updatedCups.aperturaPlayoffs.phase = 'finished';
                }
            }
        }
    }

    // 7. Argentine Playoffs (Torneo Clausura)
    if (simulatedWeek >= 36 && (!updatedCups.clausuraPlayoffs || !updatedCups.clausuraPlayoffs.rounds || updatedCups.clausuraPlayoffs.rounds.length === 0)) {
        const { zoneA, zoneB } = calculateTournamentStandings(updatedSchedule, 'Torneo_Clausura', teams);

        if (zoneA.length >= 8 && zoneB.length >= 8) {
            const octavosFixtures = generateArgentinePlayoffs(zoneA.slice(0, 8), zoneB.slice(0, 8), 'Playoffs_Clausura', 37);
            updatedCups.clausuraPlayoffs = {
                id: 'clausura_playoffs',
                name: 'Playoffs Clausura',
                type: 'knockout',
                phase: 'knockout',
                rounds: [{ name: 'Round of 16', fixtures: octavosFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: updatedCups.clausuraPlayoffs?.statistics?.championsHistory || [] }
            };
            updatedSchedule.push(...octavosFixtures);
        }
    }

    if (updatedCups.clausuraPlayoffs?.rounds?.length && !updatedCups.clausuraPlayoffs.winnerId) {
        const prevRoundsCount = updatedCups.clausuraPlayoffs.rounds.length;
        const nextPlayoffWeek = Math.min(40, Math.max(37, simulatedWeek) + 1);
        updatedCups.clausuraPlayoffs = advanceCupRound(updatedCups.clausuraPlayoffs, teams, nextPlayoffWeek, updatedSchedule);
        if (updatedCups.clausuraPlayoffs.rounds.length > prevRoundsCount) {
            const nextRound = updatedCups.clausuraPlayoffs.rounds[updatedCups.clausuraPlayoffs.rounds.length - 1];
            updatedSchedule.push(...nextRound.fixtures);
        }

        // Safety fallback: ensure final champion is crowned if final match completed
        if (!updatedCups.clausuraPlayoffs.winnerId && updatedCups.clausuraPlayoffs.rounds.length > 0) {
            const lastRound = updatedCups.clausuraPlayoffs.rounds[updatedCups.clausuraPlayoffs.rounds.length - 1];
            if (lastRound.fixtures?.length === 1 && lastRound.fixtures[0].result !== undefined) {
                const wId = determineCupWinner(lastRound.fixtures[0]);
                if (wId) {
                    updatedCups.clausuraPlayoffs.winnerId = wId;
                    updatedCups.clausuraPlayoffs.phase = 'finished';
                }
            }
        }
    }

    // 8. Primera Nacional (Primer Ascenso y Reducido)
    if (simulatedWeek >= 34 && (!updatedCups.nacionalPrimerAscenso || !updatedCups.nacionalPrimerAscenso.rounds.length)) {
        const pnTable = leagueTables[LeagueId.PRIMERA_NACIONAL] || [];
        const zoneATeams = pnTable.filter(r => r.zone === 'A').map(r => teams.find(t => t.id === r.teamId)!).filter(Boolean);
        const zoneBTeams = pnTable.filter(r => r.zone === 'B').map(r => teams.find(t => t.id === r.teamId)!).filter(Boolean);

        if (zoneATeams.length >= 8 && zoneBTeams.length >= 8) {
            const finalPrimerAscensoFixture = generateNacionalPrimerAscenso(zoneATeams[0], zoneBTeams[0], 35);
            updatedCups.nacionalPrimerAscenso = {
                id: 'nacional_primer_ascenso',
                name: 'Final 1º Ascenso',
                type: 'knockout',
                phase: 'knockout',
                rounds: [{ name: 'Final', fixtures: [finalPrimerAscensoFixture], completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            };
            updatedSchedule.push(finalPrimerAscensoFixture);

            const reducidoPhase1Fixtures = generateNacionalReducidoPhase1(zoneATeams, zoneBTeams, 35);
            updatedCups.nacionalReducido = {
                id: 'nacional_reducido',
                name: 'Torneo Reducido',
                type: 'knockout',
                phase: 'knockout',
                rounds: [{ name: 'Round of 16', fixtures: reducidoPhase1Fixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            };
            updatedSchedule.push(...reducidoPhase1Fixtures);
        }
    }

    if (updatedCups.nacionalPrimerAscenso && !updatedCups.nacionalPrimerAscenso.winnerId) {
        const primerAscensoMatches = updatedSchedule.filter(m => m.competition === 'Nacional_Primer_Ascenso' && m.result !== undefined);
        const reducidoPhase1Matches = updatedSchedule.filter(m => m.competition === 'Nacional_Reducido' && m.result !== undefined);
        
        if (primerAscensoMatches.length > 0 && reducidoPhase1Matches.length >= 7 && updatedCups.nacionalReducido && updatedCups.nacionalReducido.rounds.length === 1) {
            const finalMatch = primerAscensoMatches[0];
            const winnerId = determineCupWinner(finalMatch);
            const loserId = winnerId === finalMatch.homeTeamId ? finalMatch.awayTeamId : finalMatch.homeTeamId;
            const loserTeam = teams.find(t => t.id === loserId)!;

            updatedCups.nacionalPrimerAscenso = {
                ...updatedCups.nacionalPrimerAscenso,
                winnerId: winnerId || undefined,
                rounds: [{ ...updatedCups.nacionalPrimerAscenso.rounds[0], completed: true }]
            };

            const winnersPhase1 = reducidoPhase1Matches.map(m => {
                const wId = determineCupWinner(m);
                return teams.find(t => t.id === wId)!;
            }).filter(Boolean);

            const cuartosFixtures = generateNacionalReducidoCuartos(winnersPhase1, loserTeam, 36);
            updatedCups.nacionalReducido = {
                ...updatedCups.nacionalReducido,
                rounds: [
                    { ...updatedCups.nacionalReducido.rounds[0], completed: true },
                    { name: 'Quarter-Final', fixtures: cuartosFixtures, completed: false }
                ],
                currentRoundIndex: 1
            };
            updatedSchedule.push(...cuartosFixtures);
        }
    }

    if (updatedCups.nacionalReducido?.rounds?.length && updatedCups.nacionalReducido.rounds.length > 1 && !updatedCups.nacionalReducido.winnerId) {
        const prevRoundsCount = updatedCups.nacionalReducido.rounds.length;
        const nextReducidoWeek = Math.min(38, Math.max(36, simulatedWeek) + 1);
        updatedCups.nacionalReducido = advanceCupRound(updatedCups.nacionalReducido, teams, nextReducidoWeek, updatedSchedule);
        if (updatedCups.nacionalReducido.rounds.length > prevRoundsCount) {
            const nextRound = updatedCups.nacionalReducido.rounds[updatedCups.nacionalReducido.rounds.length - 1];
            updatedSchedule.push(...nextRound.fixtures);
        }
    }

    // 6. Cleanup of any orphaned group-stage fixtures for cups that are already in knockout phase
    const cupsInKnockout = [
        { cup: updatedCups.copaLibertadores, comp: 'Copa_Libertadores' },
        { cup: updatedCups.copaSudamericana, comp: 'Copa_Sudamericana' },
        { cup: updatedCups.championsLeague, comp: 'Champions_League' },
        { cup: updatedCups.europaLeague, comp: 'Europa_League' }
    ];

    cupsInKnockout.forEach(({ cup, comp }) => {
        if (cup && cup.phase === 'knockout') {
            const validKnockoutKeys = new Set<string>();
            cup.rounds?.forEach((r: any) => {
                r.fixtures?.forEach((f: any) => {
                    validKnockoutKeys.add(`${f.week}_${f.homeTeamId}_${f.awayTeamId}`);
                });
            });

            for (let i = updatedSchedule.length - 1; i >= 0; i--) {
                const m = updatedSchedule[i];
                if (m.competition === comp && !m.result) {
                    const key = `${m.week}_${m.homeTeamId}_${m.awayTeamId}`;
                    if (!validKnockoutKeys.has(key)) {
                        updatedSchedule.splice(i, 1);
                    }
                }
            }
        }
    });

    return {
        updatedCups,
        updatedSchedule,
        cinematicEvents
    };
}
