import { GameState, Team, Match, LeagueId, CinematicEvent } from '../../types';
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

export interface CupProgressionResult {
    updatedCups: GameState['cups'];
    updatedSchedule: Match[];
    cinematicEvents: CinematicEvent[];
}

export function handleCupProgression(
    cups: GameState['cups'],
    schedule: Match[],
    teams: Team[],
    simulatedWeek: number,
    newWeek: number,
    leagueTables: Record<LeagueId, any[]>,
    currentTurn: 'weekend' | 'midweek'
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
    const libertadoresMatches = justPlayedMatches.filter(m => m.competition === 'Copa_Libertadores');
    if (libertadoresMatches.length > 0 && libertadoresMatches.every(m => m.result !== undefined)) {
        const nextCupWeek = newWeek + 4;
        const result = progressInternationalCup(updatedCups.copaLibertadores, teams, nextCupWeek);
        updatedCups.copaLibertadores = result;

        if (result.newFixtures) {
            updatedSchedule.push(...result.newFixtures);
            cinematicEvents.push({ 
                id: `libertadores_ko_${Date.now()}`,
                type: 'CUP_KICKOFF',
                title: 'Copa Libertadores',
                subtitle: '¡Comienzan las eliminatorias!',
                metadata: { accentColor: '#FACC15', bgClass: 'from-yellow-900 via-slate-950 to-slate-950' }
            });
        }
    }

    // 4. Champions League
    const championsLeagueMatches = justPlayedMatches.filter(m => m.competition === 'Champions_League');
    if (championsLeagueMatches.length > 0 && championsLeagueMatches.every(m => m.result !== undefined)) {
        const nextCupWeek = newWeek + 5;
        const result = progressInternationalCup(updatedCups.championsLeague, teams, nextCupWeek);
        updatedCups.championsLeague = result;

        if (result.newFixtures) {
            updatedSchedule.push(...result.newFixtures);
            cinematicEvents.push({ 
                id: `champions_ko_${Date.now()}`,
                type: 'CUP_KICKOFF',
                title: 'Champions League',
                subtitle: '¡La elite europea se enfrenta!',
                metadata: { accentColor: '#3B82F6', bgClass: 'from-blue-900 via-slate-950 to-slate-950' }
            });
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

    return {
        updatedCups,
        updatedSchedule,
        cinematicEvents
    };
}
