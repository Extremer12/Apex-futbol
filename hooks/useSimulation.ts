import { useState, useCallback } from 'react';
import { GameState, MatchPhase, PendingSimulationResults, NewsItem, Offer } from '../types';
import { simulationWorker } from '../services/simulationWorker';
import { generateNews, generateMatchReport, generateTransferOffer, generatePlayerOfTheWeekNews, generateImportantNews, generateCoachReport } from '../services/gameLogic';
import { advanceCupRound, progressInternationalCup, checkAndScheduleIntercontinental } from '../services/simulation';
import { eventEngine, TriggeredEvent } from '../services/eventEngine';
import { formatDate, isTransferWindowOpen } from '../utils';

export function useSimulation(
    gameState: GameState | null,
    dispatch: any,
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

            // Handle cup progression
            let updatedCups = simulationResult.updatedCups;
            const faCupMatches = matchesThisWeek.filter(m => m.competition === 'FA_Cup');
            const intercontinentalMatches = matchesThisWeek.filter(m => m.competition === 'Copa_Intercontinental');
            if (faCupMatches.length > 0 && faCupMatches.every(m => m.result !== undefined)) {
                const nextCupWeek = newWeek + 4;
                updatedCups.faCup = advanceCupRound(updatedCups.faCup, simulationResult.updatedAllTeams, nextCupWeek);

                if (updatedCups.faCup.rounds.length > gameState.cups.faCup.rounds.length) {
                    const newRound = updatedCups.faCup.rounds[updatedCups.faCup.rounds.length - 1];
                    simulationResult.updatedSchedule.push(...newRound.fixtures);
                }
            }

            const carabaoCupMatches = matchesThisWeek.filter(m => m.competition === 'Carabao_Cup');
            if (carabaoCupMatches.length > 0 && carabaoCupMatches.every(m => m.result !== undefined)) {
                const nextCupWeek = newWeek + 3;
                updatedCups.carabaoCup = advanceCupRound(updatedCups.carabaoCup, simulationResult.updatedAllTeams, nextCupWeek);

                if (updatedCups.carabaoCup.rounds.length > gameState.cups.carabaoCup.rounds.length) {
                    const newRound = updatedCups.carabaoCup.rounds[updatedCups.carabaoCup.rounds.length - 1];
                    simulationResult.updatedSchedule.push(...newRound.fixtures);
                }
            }

            const libertadoresMatches = matchesThisWeek.filter(m => m.competition === 'Copa_Libertadores');
            if (libertadoresMatches.length > 0 && libertadoresMatches.every(m => m.result !== undefined)) {
                const nextCupWeek = newWeek + 4;
                const result = progressInternationalCup(updatedCups.copaLibertadores, simulationResult.updatedAllTeams, nextCupWeek);
                updatedCups.copaLibertadores = result;

                if (result.newFixtures) {
                    simulationResult.updatedSchedule.push(...result.newFixtures);
                    // Trigger knockout kickoff cinematic
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

            const championsLeagueMatches = matchesThisWeek.filter(m => m.competition === 'Champions_League');
            if (championsLeagueMatches.length > 0 && championsLeagueMatches.every(m => m.result !== undefined)) {
                const nextCupWeek = newWeek + 5;
                const result = progressInternationalCup(updatedCups.championsLeague, simulationResult.updatedAllTeams, nextCupWeek);
                updatedCups.championsLeague = result;

                if (result.newFixtures) {
                    simulationResult.updatedSchedule.push(...result.newFixtures);
                    // Trigger knockout kickoff cinematic
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

            if (intercontinentalMatches.length > 0 && intercontinentalMatches.every(m => m.result !== undefined)) {
                // Since Intercontinental is a single final match, we just advance the cup to calculate the winner.
                updatedCups.copaIntercontinental = advanceCupRound(updatedCups.copaIntercontinental, simulationResult.updatedAllTeams, newWeek);
            }

            // Trigger CUP_KICKOFF cinematics for international cups
            const newCinematicEvents: any[] = [];

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
                coachReport
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
                coachReport: pendingResults.coachReport
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
