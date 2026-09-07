import React, { useState, useCallback } from 'react';
import { GameState, MatchPhase, PendingSimulationResults, NewsItem, Offer, LeagueId } from '../types';
import { GameAction } from '../state/reducer';
import { simulationWorker } from '../services/simulationWorker';
import { generateNews, generateMatchReport, generateTransferOffer, generatePlayerOfTheWeekNews, generateImportantNews, generateCoachReport } from '../services/gameLogic';
import { advanceCupRound, progressInternationalCup, checkAndScheduleIntercontinental, generateArgentinePlayoffs, generateNacionalPrimerAscenso, generateNacionalReducidoPhase1, generateNacionalReducidoCuartos, determineCupWinner } from '../services/simulation';
import { eventEngine, TriggeredEvent } from '../services/eventEngine';
import { formatDate, isTransferWindowOpen } from '../utils';

export function useSimulation(
    gameState: GameState | null,
    dispatch: React.Dispatch<GameAction>,
    setAppState: (state: any) => void,
    showNotification: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void,
    setCurrentEvent: (event: TriggeredEvent | null) => void
) {
    const [matchPhase, setMatchPhase] = useState<MatchPhase>('PRE');
    const [pendingResults, setPendingResults] = useState<PendingSimulationResults | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const handlePlayMatch = useCallback(async () => {
        if (!gameState || isSimulating) return;

        try {
            setIsSimulating(true);
            setMatchPhase('LIVE');

            // Use Web Worker for heavy simulation
            const simulationResult = await simulationWorker.simulateWeek(gameState);

            // Generate news and offers (still on main thread, but lighter)
            const newDate = new Date(gameState.currentDate);
            newDate.setDate(newDate.getDate() + 7);

            const newsToAdd: NewsItem[] = [];
            const newWeek = gameState.currentWeek + 1;
            const playerMatch = simulationResult.updatedSchedule.find(m => m.week === newWeek && (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id));

            if (playerMatch && playerMatch.result) {
                const isHome = playerMatch.homeTeamId === gameState.team.id;
                const opponent = gameState.allTeams.find(t => t.id === (isHome ? playerMatch.awayTeamId : playerMatch.homeTeamId))!;
                const myScore = isHome ? playerMatch.result.homeScore : playerMatch.result.awayScore;
                const oppScore = isHome ? playerMatch.result.awayScore : playerMatch.result.homeScore;

                const isThrashing = (myScore - oppScore) >= 3;
                const isBadLoss = (oppScore - myScore) >= 3;
                const isUpset = myScore > oppScore && gameState.team.tier === 'Lower' && opponent.tier === 'Top';

                if (isThrashing || isBadLoss || isUpset) {
                    const context = isUpset ? "Victoria histórica de un equipo pequeño contra un gigante." : isThrashing ? "Una goleada espectacular." : "Una derrota humillante.";
                    const detail = `El ${gameState.team.name} quedó ${myScore}-${oppScore} contra el ${opponent.name}.`;
                    const aiReport = await generateImportantNews(context, detail);
                    newsToAdd.push({ ...aiReport, id: `match_ai_${new Date().toISOString()}`, date: formatDate(newDate) });
                } else {
                    const matchReport = await generateMatchReport(gameState.team.name, opponent.name, playerMatch.result.homeScore, playerMatch.result.awayScore, isHome);
                    newsToAdd.push({ ...matchReport, id: `match_${new Date().toISOString()}`, date: formatDate(newDate) });
                }
            } else {
                const generalNews = await generateNews(gameState);
                newsToAdd.push({ ...generalNews, id: `general_${new Date().toISOString()}`, date: formatDate(newDate) });
            }

            // Player of the week
            const matchesThisWeek = simulationResult.updatedSchedule.filter(m => m.week === newWeek);
            if (matchesThisWeek.length > 0 && Math.random() < 0.3) {
                const winningTeamsIds: number[] = [];
                matchesThisWeek.forEach(match => {
                    if (!match.result) return;
                    if (match.result.homeScore > match.result.awayScore) winningTeamsIds.push(match.homeTeamId);
                    else if (match.result.awayScore > match.result.homeScore) winningTeamsIds.push(match.awayTeamId);
                });

                const candidatePlayers = simulationResult.updatedAllTeams
                    .filter(t => winningTeamsIds.includes(t.id))
                    .flatMap(t => t.squad.map(p => ({ player: p, team: t })))
                    .filter(({ player }) => player.rating > 84);

                if (candidatePlayers.length > 0) {
                    const { player, team } = candidatePlayers[Math.floor(Math.random() * candidatePlayers.length)];
                    const match = matchesThisWeek.find(m => m.homeTeamId === team.id || m.awayTeamId === team.id)!;
                    const opponent = simulationResult.updatedAllTeams.find(t => t.id === (match.homeTeamId === team.id ? match.awayTeamId : match.homeTeamId))!;
                    const resultString = `${team.name} ${match.result!.homeScore} - ${match.result!.awayScore} ${opponent.name}`;
                    const potwNewsData = await generatePlayerOfTheWeekNews(player, team.name, opponent.name, resultString);
                    newsToAdd.push({ ...potwNewsData, id: `potw_${new Date().toISOString()}`, date: formatDate(newDate) });
                }
            }

            // Generate transfer offers
            const generatedOffers: Offer[] = [];
            if (isTransferWindowOpen(gameState.currentWeek)) {
                const transferListedPlayers = gameState.team.squad.filter(p => p.isTransferListed);
                for (const player of transferListedPlayers) {
                    if (Math.random() < 0.3) {
                        const potentialBuyers = gameState.allTeams.filter(t => t.id !== gameState.team.id);
                        const offer = await generateTransferOffer(player, gameState.team, potentialBuyers);
                        if (offer) {
                            generatedOffers.push({
                                id: `offer_${new Date().toISOString()}_${player.id}`,
                                playerId: player.id,
                                ...offer
                            });
                        }
                    }
                }
            }

            // Restore logos from original state (JSX cannot be passed through worker)
            const restoredTeams = simulationResult.updatedAllTeams.map(updatedTeam => {
                const originalTeam = gameState.allTeams.find(t => t.id === updatedTeam.id);
                return {
                    ...updatedTeam,
                    logo: originalTeam?.logo || updatedTeam.logo
                };
            });

            // Handle cup and playoff progression
            let updatedCups = simulationResult.updatedCups;
            const simulatedWeek = gameState.currentTurn === 'midweek' ? gameState.currentWeek + 1 : gameState.currentWeek;
            const justPlayedMatches = simulationResult.updatedSchedule.filter(
                m => m.result !== undefined && m.week === simulatedWeek && !!m.isMidweek === (gameState.currentTurn === 'midweek')
            );

            // FA Cup
            const faCupMatches = justPlayedMatches.filter(m => m.competition === 'FA_Cup');
            if (updatedCups.faCup && updatedCups.faCup.rounds && updatedCups.faCup.rounds.length > 0 && !updatedCups.faCup.winnerId) {
                const prevRoundsCount = updatedCups.faCup.rounds.length;
                const nextCupWeek = newWeek + 4;
                updatedCups.faCup = advanceCupRound(updatedCups.faCup, simulationResult.updatedAllTeams, nextCupWeek, simulationResult.updatedSchedule);
                if (updatedCups.faCup.rounds.length > prevRoundsCount) {
                    const newRound = updatedCups.faCup.rounds[updatedCups.faCup.rounds.length - 1];
                    simulationResult.updatedSchedule.push(...newRound.fixtures);
                }
            }

            // Carabao Cup
            const carabaoCupMatches = justPlayedMatches.filter(m => m.competition === 'Carabao_Cup');
            if (updatedCups.carabaoCup && updatedCups.carabaoCup.rounds && updatedCups.carabaoCup.rounds.length > 0 && !updatedCups.carabaoCup.winnerId) {
                const prevRoundsCount = updatedCups.carabaoCup.rounds.length;
                const nextCupWeek = newWeek + 3;
                updatedCups.carabaoCup = advanceCupRound(updatedCups.carabaoCup, simulationResult.updatedAllTeams, nextCupWeek, simulationResult.updatedSchedule);
                if (updatedCups.carabaoCup.rounds.length > prevRoundsCount) {
                    const newRound = updatedCups.carabaoCup.rounds[updatedCups.carabaoCup.rounds.length - 1];
                    simulationResult.updatedSchedule.push(...newRound.fixtures);
                }
            }

            // Copa Libertadores
            const libertadoresMatches = justPlayedMatches.filter(m => m.competition === 'Copa_Libertadores');
            if (libertadoresMatches.length > 0 && libertadoresMatches.every(m => m.result !== undefined)) {
                const nextCupWeek = newWeek + 4;
                const result = progressInternationalCup(updatedCups.copaLibertadores, simulationResult.updatedAllTeams, nextCupWeek);
                updatedCups.copaLibertadores = result;

                if (result.newFixtures) {
                    simulationResult.updatedSchedule.push(...result.newFixtures);
                    dispatch({ 
                        type: 'PUSH_CINEMATIC', 
                        payload: {
                            id: `libertadores_ko_${Date.now()}`,
                            type: 'CUP_KICKOFF',
                            title: 'Copa Libertadores',
                            subtitle: '¡Comienzan las eliminatorias!',
                            metadata: { accentColor: '#FACC15', bgClass: 'from-yellow-900 via-slate-950 to-slate-950' }
                        }
                    });
                }
            }

            // Champions League
            const championsLeagueMatches = justPlayedMatches.filter(m => m.competition === 'Champions_League');
            if (championsLeagueMatches.length > 0 && championsLeagueMatches.every(m => m.result !== undefined)) {
                const nextCupWeek = newWeek + 5;
                const result = progressInternationalCup(updatedCups.championsLeague, simulationResult.updatedAllTeams, nextCupWeek);
                updatedCups.championsLeague = result;

                if (result.newFixtures) {
                    simulationResult.updatedSchedule.push(...result.newFixtures);
                    dispatch({ 
                        type: 'PUSH_CINEMATIC', 
                        payload: {
                            id: `champions_ko_${Date.now()}`,
                            type: 'CUP_KICKOFF',
                            title: 'Champions League',
                            subtitle: '¡La elite europea se enfrenta!',
                            metadata: { accentColor: '#3B82F6', bgClass: 'from-blue-900 via-slate-950 to-slate-950' }
                        }
                    });
                }
            }

            // Check Intercontinental Final
            const interCup = checkAndScheduleIntercontinental({ cups: updatedCups, allTeams: restoredTeams }, newWeek);
            if (interCup) {
                updatedCups.copaIntercontinental = interCup;
                simulationResult.updatedSchedule.push(...interCup.rounds[0].fixtures);
            }

            const intercontinentalMatches = justPlayedMatches.filter(m => m.competition === 'Copa_Intercontinental');
            if (intercontinentalMatches.length > 0 && intercontinentalMatches.every(m => m.result !== undefined)) {
                updatedCups.copaIntercontinental = advanceCupRound(updatedCups.copaIntercontinental, simulationResult.updatedAllTeams, newWeek, simulationResult.updatedSchedule);
            }

            // Argentine Playoffs Logic (Torneo Apertura & Clausura)
            // 1. Apertura Regular Phase ends at Week 16 -> Generate Playoffs for Week 17
            if (simulatedWeek >= 16 && (!updatedCups.aperturaPlayoffs || !updatedCups.aperturaPlayoffs.rounds || updatedCups.aperturaPlayoffs.rounds.length === 0)) {
                const argTable = simulationResult.updatedLeagueTables[LeagueId.LIGA_ARGENTINA] || [];
                const zoneATeams = argTable.filter(r => r.zone === 'A').map(r => restoredTeams.find(t => t.id === r.teamId)!).filter(Boolean);
                const zoneBTeams = argTable.filter(r => r.zone === 'B').map(r => restoredTeams.find(t => t.id === r.teamId)!).filter(Boolean);

                if (zoneATeams.length >= 8 && zoneBTeams.length >= 8) {
                    const octavosFixtures = generateArgentinePlayoffs(zoneATeams.slice(0, 8), zoneBTeams.slice(0, 8), 'Playoffs_Apertura', 17);
                    updatedCups.aperturaPlayoffs = {
                        id: 'apertura_playoffs',
                        name: 'Playoffs Apertura',
                        type: 'knockout',
                        phase: 'knockout',
                        rounds: [{ name: 'Round of 16', fixtures: octavosFixtures, completed: false }],
                        currentRoundIndex: 0,
                        statistics: { topScorers: [], championsHistory: [] }
                    };
                    simulationResult.updatedSchedule.push(...octavosFixtures);
                }
            }

            // 2. Advance Apertura Playoffs (Weeks 17 Octavos -> 18 Cuartos -> 19 Semis -> 20 Final -> Champion crowned)
            if (updatedCups.aperturaPlayoffs && updatedCups.aperturaPlayoffs.rounds && updatedCups.aperturaPlayoffs.rounds.length > 0 && !updatedCups.aperturaPlayoffs.winnerId) {
                const prevRoundsCount = updatedCups.aperturaPlayoffs.rounds.length;
                const nextPlayoffWeek = Math.min(20, Math.max(17, simulatedWeek) + 1);
                updatedCups.aperturaPlayoffs = advanceCupRound(updatedCups.aperturaPlayoffs, simulationResult.updatedAllTeams, nextPlayoffWeek, simulationResult.updatedSchedule);
                if (updatedCups.aperturaPlayoffs.rounds.length > prevRoundsCount) {
                    const nextRound = updatedCups.aperturaPlayoffs.rounds[updatedCups.aperturaPlayoffs.rounds.length - 1];
                    simulationResult.updatedSchedule.push(...nextRound.fixtures);
                }
            }

            // 3. Clausura Regular Phase ends at Week 36 -> Generate Playoffs for Week 37
            if (simulatedWeek >= 36 && (!updatedCups.clausuraPlayoffs || !updatedCups.clausuraPlayoffs.rounds || updatedCups.clausuraPlayoffs.rounds.length === 0)) {
                const argTable = simulationResult.updatedLeagueTables[LeagueId.LIGA_ARGENTINA] || [];
                const zoneATeams = argTable.filter(r => r.zone === 'A').map(r => restoredTeams.find(t => t.id === r.teamId)!).filter(Boolean);
                const zoneBTeams = argTable.filter(r => r.zone === 'B').map(r => restoredTeams.find(t => t.id === r.teamId)!).filter(Boolean);

                if (zoneATeams.length >= 8 && zoneBTeams.length >= 8) {
                    const octavosFixtures = generateArgentinePlayoffs(zoneATeams.slice(0, 8), zoneBTeams.slice(0, 8), 'Playoffs_Clausura', 37);
                    updatedCups.clausuraPlayoffs = {
                        id: 'clausura_playoffs',
                        name: 'Playoffs Clausura',
                        type: 'knockout',
                        phase: 'knockout',
                        rounds: [{ name: 'Round of 16', fixtures: octavosFixtures, completed: false }],
                        currentRoundIndex: 0,
                        statistics: { topScorers: [], championsHistory: [] }
                    };
                    simulationResult.updatedSchedule.push(...octavosFixtures);
                }
            }

            // 4. Advance Clausura Playoffs (Weeks 37 Octavos -> 38 Cuartos -> 39 Semis -> 40 Final -> Champion crowned)
            if (updatedCups.clausuraPlayoffs && updatedCups.clausuraPlayoffs.rounds && updatedCups.clausuraPlayoffs.rounds.length > 0 && !updatedCups.clausuraPlayoffs.winnerId) {
                const prevRoundsCount = updatedCups.clausuraPlayoffs.rounds.length;
                const nextPlayoffWeek = Math.min(40, Math.max(37, simulatedWeek) + 1);
                updatedCups.clausuraPlayoffs = advanceCupRound(updatedCups.clausuraPlayoffs, simulationResult.updatedAllTeams, nextPlayoffWeek, simulationResult.updatedSchedule);
                if (updatedCups.clausuraPlayoffs.rounds.length > prevRoundsCount) {
                    const nextRound = updatedCups.clausuraPlayoffs.rounds[updatedCups.clausuraPlayoffs.rounds.length - 1];
                    simulationResult.updatedSchedule.push(...nextRound.fixtures);
                }
            }

            // Primera Nacional: Week 34 ends -> Generate Primer Ascenso Final & Reducido Phase 1 for Week 35
            if (simulatedWeek >= 34 && (!updatedCups.nacionalPrimerAscenso || !updatedCups.nacionalPrimerAscenso.rounds.length)) {
                const pnTable = simulationResult.updatedLeagueTables[LeagueId.PRIMERA_NACIONAL] || [];
                const zoneATeams = pnTable.filter(r => r.zone === 'A').map(r => restoredTeams.find(t => t.id === r.teamId)!).filter(Boolean);
                const zoneBTeams = pnTable.filter(r => r.zone === 'B').map(r => restoredTeams.find(t => t.id === r.teamId)!).filter(Boolean);

                if (zoneATeams.length >= 8 && zoneBTeams.length >= 8) {
                    // Final por el Primer Ascenso (1ºA vs 1ºB)
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
                    simulationResult.updatedSchedule.push(finalPrimerAscensoFixture);

                    // Reducido Fase 1 (2º al 8º de cada zona)
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
                    simulationResult.updatedSchedule.push(...reducidoPhase1Fixtures);
                }
            }

            // Primera Nacional: Week 35 matches finished -> Winner of 1st Ascenso is set, and Loser joins Reducido Cuartos at Week 36
            if (updatedCups.nacionalPrimerAscenso && !updatedCups.nacionalPrimerAscenso.winnerId) {
                const primerAscensoMatches = simulationResult.updatedSchedule.filter(m => m.competition === 'Nacional_Primer_Ascenso' && m.result !== undefined);
                const reducidoPhase1Matches = simulationResult.updatedSchedule.filter(m => m.competition === 'Nacional_Reducido' && m.result !== undefined);
                
                if (primerAscensoMatches.length > 0 && reducidoPhase1Matches.length >= 7 && updatedCups.nacionalReducido && updatedCups.nacionalReducido.rounds.length === 1) {
                    const finalMatch = primerAscensoMatches[0];
                    const winnerId = determineCupWinner(finalMatch);
                    const loserId = winnerId === finalMatch.homeTeamId ? finalMatch.awayTeamId : finalMatch.homeTeamId;
                    const loserTeam = restoredTeams.find(t => t.id === loserId)!;

                    // Mark Primer Ascenso Cup completed
                    updatedCups.nacionalPrimerAscenso = {
                        ...updatedCups.nacionalPrimerAscenso,
                        winnerId: winnerId || undefined,
                        rounds: [{ ...updatedCups.nacionalPrimerAscenso.rounds[0], completed: true }]
                    };

                    // Determine 7 winners of Reducido Phase 1
                    const winnersPhase1 = reducidoPhase1Matches.map(m => {
                        const wId = determineCupWinner(m);
                        return restoredTeams.find(t => t.id === wId)!;
                    }).filter(Boolean);

                    // Generate Cuartos de Final with 8 teams (7 winners + loser of primer ascenso) for Week 36
                    const cuartosFixtures = generateNacionalReducidoCuartos(winnersPhase1, loserTeam, 36);
                    updatedCups.nacionalReducido = {
                        ...updatedCups.nacionalReducido,
                        rounds: [
                            { ...updatedCups.nacionalReducido.rounds[0], completed: true },
                            { name: 'Quarter-Final', fixtures: cuartosFixtures, completed: false }
                        ],
                        currentRoundIndex: 1
                    };
                    simulationResult.updatedSchedule.push(...cuartosFixtures);
                }
            }

            // Advance Reducido Semis & Final (Weeks 36, 37, 38)
            if (updatedCups.nacionalReducido && updatedCups.nacionalReducido.rounds && updatedCups.nacionalReducido.rounds.length > 1 && !updatedCups.nacionalReducido.winnerId) {
                const prevRoundsCount = updatedCups.nacionalReducido.rounds.length;
                const nextReducidoWeek = Math.min(38, Math.max(36, simulatedWeek) + 1);
                updatedCups.nacionalReducido = advanceCupRound(updatedCups.nacionalReducido, simulationResult.updatedAllTeams, nextReducidoWeek, simulationResult.updatedSchedule);
                if (updatedCups.nacionalReducido.rounds.length > prevRoundsCount) {
                    const nextRound = updatedCups.nacionalReducido.rounds[updatedCups.nacionalReducido.rounds.length - 1];
                    simulationResult.updatedSchedule.push(...nextRound.fixtures);
                }
            }

            // Trigger CUP_KICKOFF cinematics for international cups
            const newCinematicEvents: any[] = [];

            // 🏆 Check if Player's Team won Torneo Apertura
            if (updatedCups.aperturaPlayoffs?.winnerId && !gameState.cups.aperturaPlayoffs?.winnerId && updatedCups.aperturaPlayoffs.winnerId === gameState.team.id) {
                const argTable = simulationResult.updatedLeagueTables[LeagueId.LIGA_ARGENTINA] || [];
                const playerRow = argTable.find(r => r.teamId === gameState.team.id);
                newCinematicEvents.push({
                    id: `champ_apertura_${Date.now()}`,
                    type: 'CUP_WIN',
                    title: '¡CAMPEÓN DEL TORNEO APERTURA!',
                    subtitle: `${gameState.team.name} se consagra campeón de la Liga Profesional tras conquistar los Playoffs`,
                    metadata: {
                        competition: 'Torneo Apertura 2026',
                        team: gameState.team,
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

            // 🏆 Check if Player's Team won Torneo Clausura
            if (updatedCups.clausuraPlayoffs?.winnerId && !gameState.cups.clausuraPlayoffs?.winnerId && updatedCups.clausuraPlayoffs.winnerId === gameState.team.id) {
                const argTable = simulationResult.updatedLeagueTables[LeagueId.LIGA_ARGENTINA] || [];
                const playerRow = argTable.find(r => r.teamId === gameState.team.id);
                newCinematicEvents.push({
                    id: `champ_clausura_${Date.now()}`,
                    type: 'CUP_WIN',
                    title: '¡CAMPEÓN DEL TORNEO CLAUSURA!',
                    subtitle: `${gameState.team.name} se consagra campeón de la Liga Profesional tras conquistar los Playoffs`,
                    metadata: {
                        competition: 'Torneo Clausura 2026',
                        team: gameState.team,
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

            // 🏆 Check Primera Nacional Primer Ascenso & Reducido
            if (updatedCups.nacionalPrimerAscenso?.winnerId && !gameState.cups.nacionalPrimerAscenso?.winnerId && updatedCups.nacionalPrimerAscenso.winnerId === gameState.team.id) {
                newCinematicEvents.push({
                    id: `champ_primer_ascenso_${Date.now()}`,
                    type: 'PROMOTION',
                    title: '¡CAMPEÓN Y ASCENDIDO A PRIMERA!',
                    subtitle: `${gameState.team.name} gana la Final por el 1º Ascenso y jugará en la Liga Profesional`,
                    metadata: {
                        competition: 'Primera Nacional (1º Ascenso)',
                        team: gameState.team,
                        accentColor: '#F59E0B',
                        stats: { played: 35, won: 22, goalsFor: 48, goalDifference: 22 }
                    }
                });
            }

            if (updatedCups.nacionalReducido?.winnerId && !gameState.cups.nacionalReducido?.winnerId && updatedCups.nacionalReducido.winnerId === gameState.team.id) {
                newCinematicEvents.push({
                    id: `champ_reducido_${Date.now()}`,
                    type: 'PROMOTION',
                    title: '¡ASCENDIDO A PRIMERA DIVISIÓN!',
                    subtitle: `${gameState.team.name} gana el Torneo Reducido y asciende a la máxima categoría`,
                    metadata: {
                        competition: 'Torneo Reducido (2º Ascenso)',
                        team: gameState.team,
                        accentColor: '#06B6D4',
                        stats: { played: 38, won: 24, goalsFor: 52, goalDifference: 25 }
                    }
                });
            }

            // 🏆 Check International and European Cups
            const genericCups = [
                { key: 'copaLibertadores', name: 'Copa Libertadores 2026', accent: '#F59E0B' },
                { key: 'championsLeague', name: 'UEFA Champions League 2026', accent: '#6366F1' },
                { key: 'copaIntercontinental', name: 'Copa Intercontinental 2026', accent: '#10B981' },
                { key: 'faCup', name: 'FA Cup 2026', accent: '#EF4444' },
                { key: 'carabaoCup', name: 'Carabao Cup 2026', accent: '#10B981' },
            ];

            for (const gc of genericCups) {
                const upCup = (updatedCups as any)[gc.key];
                const oldCup = (gameState.cups as any)?.[gc.key];
                if (upCup?.winnerId && !oldCup?.winnerId && upCup.winnerId === gameState.team.id) {
                    newCinematicEvents.push({
                        id: `champ_${gc.key}_${Date.now()}`,
                        type: 'CUP_WIN',
                        title: `¡CAMPEÓN DE LA ${gc.name.toUpperCase()}!`,
                        subtitle: `${gameState.team.name} alza el trofeo tras una campaña histórica`,
                        metadata: {
                            competition: gc.name,
                            team: gameState.team,
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

            // 🏆 Check European / Standard League Titles
            const playerLeague = gameState.team.leagueId;
            const playerTable = simulationResult.updatedLeagueTables[playerLeague] || [];
            const playerRow = playerTable.find(r => r.teamId === gameState.team.id);
            const maxLeagueWeeks = playerLeague === LeagueId.BUNDESLIGA ? 34 : 38;
            if (simulatedWeek >= maxLeagueWeeks && playerRow && playerRow.position === 1 && !playerLeague.includes('ARGENTINA') && !playerLeague.includes('NACIONAL')) {
                newCinematicEvents.push({
                    id: `champ_league_${Date.now()}`,
                    type: 'LEAGUE_WIN',
                    title: '¡CAMPEÓN DE LIGA!',
                    subtitle: `${gameState.team.name} finaliza en la cima de la tabla y conquista el campeonato`,
                    metadata: {
                        competition: playerLeague.replace(/_/g, ' '),
                        team: gameState.team,
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

            const isFirstLibRound = gameState.cups.copaLibertadores.rounds.length > 0 &&
                gameState.cups.copaLibertadores.rounds[0].fixtures.every(m => !m.result) &&
                libertadoresMatches.length > 0;
            if (isFirstLibRound) {
                newCinematicEvents.push({
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

            const isFirstCLRound = gameState.cups.championsLeague.rounds.length > 0 &&
                gameState.cups.championsLeague.rounds[0].fixtures.every(m => !m.result) &&
                championsLeagueMatches.length > 0;
            if (isFirstCLRound) {
                newCinematicEvents.push({
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

            const isFirstInterRound = gameState.cups.copaIntercontinental.rounds.length > 0 &&
                gameState.cups.copaIntercontinental.rounds[0].fixtures.every(m => !m.result) &&
                intercontinentalMatches.length > 0;
            if (isFirstInterRound) {
                newCinematicEvents.push({
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

            // Transfer Window News
            const prevDate = new Date(gameState.currentDate);
            const currDate = newDate;
            const prevMonth = prevDate.getMonth();
            const currMonth = currDate.getMonth();

            if (prevMonth !== currMonth) {
                if (currMonth === 0) { // Enero
                    newsToAdd.push({
                        id: `market_open_jan_${Date.now()}`,
                        headline: '💼 Mercado Abierto: Enero',
                        body: 'Se abre la ventana de traspasos de invierno. Los clubes buscan refuerzos de última hora.',
                        date: formatDate(currDate),
                        type: 'standard'
                    });
                } else if (currMonth === 1) { // Febrero
                    newsToAdd.push({
                        id: `market_close_feb_${Date.now()}`,
                        headline: '🚫 Mercado Cerrado',
                        body: 'Finaliza el periodo de fichajes de invierno. Las plantillas quedan cerradas hasta verano.',
                        date: formatDate(currDate),
                        type: 'standard'
                    });
                } else if (currMonth === 6) { // Julio
                    newsToAdd.push({
                        id: `market_open_jul_${Date.now()}`,
                        headline: '☀️ Mercado de Verano Abierto',
                        body: 'Comienza el periodo de fichajes estival. Se esperan grandes movimientos en las ligas europeas.',
                        date: formatDate(currDate),
                        type: 'standard'
                    });
                } else if (currMonth === 8) { // Septiembre
                    newsToAdd.push({
                        id: `market_close_sep_${Date.now()}`,
                        headline: '⏳ Deadline Day Finalizado',
                        body: 'El mercado de verano ha cerrado. Se acabó el tiempo para las negociaciones.',
                        date: formatDate(currDate),
                        type: 'standard'
                    });
                }
            }

            if (newCinematicEvents.length > 0) {
                newsToAdd.push({
                    id: `cup_start_news_${newWeek}`,
                    headline: newCinematicEvents[0].title,
                    body: newCinematicEvents[0].subtitle,
                    date: formatDate(newDate),
                    type: 'standard'
                });
            }

            // Dynamic Match Report News for player's team
            if (simulationResult.playerMatchResult) {
                const match = simulationResult.playerMatchResult;
                const isHome = match.homeTeamId === gameState.team.id;
                const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
                const opponent = restoredTeams.find(t => t.id === opponentId) || gameState.allTeams.find(t => t.id === opponentId);
                const playerTeam = gameState.team;
                const opponentName = opponent?.name || 'Rival';
                const userScore = isHome ? match.homeScore : match.awayScore;
                const oppScore = isHome ? match.awayScore : match.homeScore;

                let headline = '';
                let body = '';

                const topScorerName = match.scorers && match.scorers.length > 0 ? match.scorers[0].playerName : null;

                if (userScore > oppScore) {
                    if (userScore - oppScore >= 3) {
                        headline = `🔥 Goleada contundente del ${playerTeam.name} (${userScore}-${oppScore})`;
                        body = `Exhibición total de ${playerTeam.name} frente a ${opponentName}. ${topScorerName ? `${topScorerName} brilló con luz propia` : 'El equipo brilló en todas sus líneas'} en una jornada memorable.`;
                    } else {
                        headline = `✅ ${playerTeam.name} suma tres puntos de oro ante ${opponentName} (${userScore}-${oppScore})`;
                        body = `Gran triunfo trabajado de ${playerTeam.name} para mantener la ilusión de la afición. ${topScorerName ? `Destacada actuación de ${topScorerName}.` : ''}`;
                    }
                } else if (userScore === oppScore) {
                    headline = `🤝 Empate ${userScore}-${oppScore} entre ${playerTeam.name} y ${opponentName}`;
                    body = `Partido intenso y dividido en el que ambos equipos se repartieron los puntos tras 90 minutos de máxima disputa.`;
                } else {
                    headline = `❌ ${playerTeam.name} tropieza ${userScore}-${oppScore} ante ${opponentName}`;
                    body = `${playerTeam.name} no logró imponer su juego frente a ${opponentName} y buscará reencontrarse con la victoria en la siguiente jornada.`;
                }

                newsToAdd.unshift({
                    id: `match_news_${Date.now()}_${newWeek}`,
                    headline,
                    body,
                    date: formatDate(newDate),
                    type: 'standard'
                });
            }

            // Check for random events
            const triggeredEvent = eventEngine.triggerEvent(gameState);
            if (triggeredEvent) {
                setCurrentEvent(triggeredEvent);
            }

            // restoredTeams already declared above (before cup progression)

            // Generate Coach Report
            const coachReport = generateCoachReport(gameState);

            setPendingResults({
                newsToAdd,
                updatedSchedule: simulationResult.updatedSchedule,
                updatedLeagueTables: simulationResult.updatedLeagueTables,
                updatedAllTeams: restoredTeams,
                confidenceChange: simulationResult.confidenceChange,
                newOffers: generatedOffers,
                playerMatchResult: simulationResult.playerMatchResult,
                updatedCups,
                updatedScoutedPlayerIds: simulationResult.updatedScoutedPlayerIds,
                coachReport,
                cinematicEvents: newCinematicEvents
            });

            setMatchPhase('LIVE');

        } catch (error) {
            console.error('Simulation error:', error);
            showNotification('Error al simular la semana', 'error');
            setMatchPhase('PRE');
        } finally {
            setIsSimulating(false);
        }

    }, [gameState, isSimulating, showNotification, setCurrentEvent]);

    const handleWeekComplete = useCallback(() => {
        if (!gameState || !pendingResults) return;

        const newConfidence = Math.max(0, Math.min(100, gameState.boardConfidence + pendingResults.confidenceChange));

        dispatch({ type: 'ADVANCE_WEEK_START' });
        dispatch({
            type: 'ADVANCE_WEEK_SUCCESS',
            payload: {
                newsItems: pendingResults.newsToAdd,
                newSchedule: pendingResults.updatedSchedule,
                newLeagueTables: pendingResults.updatedLeagueTables,
                newAllTeams: pendingResults.updatedAllTeams,
                newConfidence,
                newOffers: pendingResults.newOffers,
                newCups: pendingResults.updatedCups,
                newScoutedPlayerIds: (pendingResults as any).updatedScoutedPlayerIds,
                coachReport: pendingResults.coachReport,
                cinematicEvents: (pendingResults as any).cinematicEvents
            }
        });

        if (newConfidence <= 0) {
            setAppState('GAME_OVER');
        } else {
            setMatchPhase('PRE');
        }
        setPendingResults(null);
    }, [gameState, pendingResults, dispatch, setAppState]);

    return {
        matchPhase,
        setMatchPhase,
        pendingResults,
        setPendingResults,
        isSimulating,
        handlePlayMatch,
        handleWeekComplete
    };
}
