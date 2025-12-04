import React, { useState, useCallback, useEffect, useMemo, useReducer } from 'react';
import { GameState, Team, Screen, PlayerProfile, NewsItem, Offer, LeagueTableRow, Match } from './types';
import { gameReducer, initialState } from './state/reducer';
import { saveGame, loadGame, SavedGameData } from './services/db';

// Contexts
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { ModalProvider, useModal } from './contexts/ModalContext';

// Router and Layout
import { AppRouter } from './components/AppRouter';
import { MainLayout } from './components/MainLayout';

// UI Components
import { PlayerDetailModal } from './components/ui/PlayerDetailModal';
import { SaveGameModal } from './components/ui/SaveGameModal';
import { Notification } from './components/ui/Notification';
import { EventModal } from './components/ui/EventModal';

// Services
import { ElectionResponse, generateNews, generateMatchReport, generateTransferOffer, generatePlayerOfTheWeekNews, generateImportantNews } from './services/gameLogic';
import { advanceCupRound } from './services/simulation';
import { formatDate } from './utils';
import { simulationWorker } from './services/simulationWorker';
import { eventEngine, TriggeredEvent } from './services/eventEngine';


type AppStateType = 'START_SCREEN' | 'LOAD_GAME' | 'PROFILE_CREATION' | 'TEAM_SELECTION' | 'ELECTION_PITCH' | 'ELECTION_RESULT' | 'GAME_ACTIVE' | 'GAME_OVER';
export type MatchPhase = 'PRE' | 'LIVE' | 'POST';

// Data structure to hold simulation results before committing to state
interface PendingSimulationResults {
    newsToAdd: NewsItem[];
    updatedSchedule: Match[];
    updatedLeagueTable: LeagueTableRow[];
    updatedChampionshipTable: LeagueTableRow[];
    updatedAllTeams: Team[];
    confidenceChange: number;
    newOffers: Offer[];
    playerMatchResult: { homeScore: number; awayScore: number, penalties?: { home: number, away: number } } | null;
    updatedCups?: { faCup: any, carabaoCup: any };
}

// --- Main App Logic Component ---
function AppLogic() {
    const [appState, setAppState] = useState<AppStateType>('START_SCREEN');
    const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [electionResult, setElectionResult] = useState<ElectionResponse | null>(null);
    const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Dashboard);

    // Match Simulation State
    const [matchPhase, setMatchPhase] = useState<MatchPhase>('PRE');
    const [pendingResults, setPendingResults] = useState<PendingSimulationResults | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    // Event System State
    const [currentEvent, setCurrentEvent] = useState<TriggeredEvent | null>(null);

    // Save state
    const [currentSaveId, setCurrentSaveId] = useState<string | null>(null);
    const [currentSaveName, setCurrentSaveName] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [gameState, dispatch] = useReducer(gameReducer, initialState);

    // Use contexts
    const { showNotification } = useNotification();
    const { viewingPlayer, isSaveModalOpen, saveMode, openSaveModal, closeSaveModal, closePlayerModal } = useModal();

    const allPlayers = useMemo(() => gameState ? gameState.allTeams.flatMap(t => t.squad) : [], [gameState]);

    // Auto-saving effect
    useEffect(() => {
        if (appState === 'GAME_ACTIVE' && gameState && playerProfile && currentSaveId && currentSaveName && matchPhase === 'PRE') {
            const saveData: SavedGameData = {
                id: currentSaveId,
                saveName: currentSaveName,
                playerProfile,
                gameState,
                teamName: gameState.team.name,
                lastSaved: new Date(),
            };
            saveGame(saveData)
                .then(() => setLastSaved(new Date()))
                .catch(err => console.error("Auto-save failed:", err));
        }
    }, [gameState, playerProfile, appState, currentSaveId, currentSaveName, matchPhase]);

    const resetGameData = useCallback(() => {
        dispatch({ type: 'RESET_GAME' });
        setPlayerProfile(null);
        setSelectedTeam(null);
        setElectionResult(null);
        setActiveScreen(Screen.Dashboard);
        setCurrentSaveId(null);
        setCurrentSaveName(null);
        setLastSaved(null);
        setMatchPhase('PRE');
        setPendingResults(null);
    }, []);

    const handleNewGame = useCallback(() => {
        resetGameData();
        setAppState('PROFILE_CREATION');
    }, [resetGameData]);

    const handleLoadGame = useCallback(async (id: string) => {
        const savedData = await loadGame(id);
        if (savedData) {
            const rehydratedGameState: GameState = {
                ...savedData.gameState,
                currentDate: new Date(savedData.gameState.currentDate),
                chairmanConfidence: savedData.gameState.chairmanConfidence != null ? savedData.gameState.chairmanConfidence : 75,
                incomingOffers: savedData.gameState.incomingOffers || [],
            };

            setPlayerProfile(savedData.playerProfile);
            dispatch({ type: 'LOAD_GAME', payload: rehydratedGameState });
            setCurrentSaveId(savedData.id);
            setCurrentSaveName(savedData.saveName);
            setLastSaved(new Date(savedData.lastSaved));
            setAppState('GAME_ACTIVE');
            showNotification(`Partida "${savedData.saveName}" cargada`);
        } else {
            console.error("Failed to load game state.");
            showNotification("Error al cargar la partida", "error");
            setAppState('START_SCREEN');
        }
    }, [showNotification]);

    const handleProfileCreate = (profile: PlayerProfile) => {
        setPlayerProfile(profile);
        setAppState('TEAM_SELECTION');
    };

    const handleTeamSelect = (team: Team) => {
        setSelectedTeam(team);
        setAppState('ELECTION_PITCH');
    };

    const handlePitchSubmit = useCallback(async (debateSummary: string) => {
        if (!selectedTeam || !playerProfile) return;

        const isSuccess = debateSummary.includes('Won');

        const result = {
            success: isSuccess,
            feedback: isSuccess
                ? `¡Felicidades! Has ganado las elecciones del ${selectedTeam.name}.`
                : `No has conseguido suficientes votos. Intenta con otro equipo.`
        };

        setElectionResult(result);
        setAppState('ELECTION_RESULT');
    }, [selectedTeam, playerProfile]);

    const handleStartGame = useCallback(() => {
        if (!selectedTeam || !playerProfile) return;
        dispatch({ type: 'INITIALIZE_GAME', payload: { team: selectedTeam, playerProfile } });
        setAppState('GAME_ACTIVE');
    }, [selectedTeam, playerProfile]);

    const handleRetryElection = () => {
        setSelectedTeam(null);
        setElectionResult(null);
        setAppState('TEAM_SELECTION');
    };

    const fetchInitialNews = useCallback(async (state: GameState) => {
        const initialNews = await generateNews(state);
        const newsItem: NewsItem = { ...initialNews, id: new Date().toISOString(), date: formatDate(state.currentDate) };
        dispatch({ type: 'ADD_NEWS', payload: newsItem });
    }, []);

    useEffect(() => {
        if (gameState && gameState.newsFeed.length === 3) {
            fetchInitialNews(gameState);
        }
    }, [gameState, fetchInitialNews]);

    const handleConfirmSave = useCallback(async (saveName: string) => {
        if (!gameState || !playerProfile) return;

        const saveId = (saveMode === 'overwrite' && currentSaveId)
            ? currentSaveId
            : `save_${Date.now()}`;

        const now = new Date();

        const saveData: SavedGameData = {
            id: saveId,
            saveName: saveName,
            playerProfile,
            gameState,
            teamName: gameState.team.name,
            lastSaved: now,
        };

        try {
            await saveGame(saveData);
            setCurrentSaveId(saveId);
            setCurrentSaveName(saveName);
            setLastSaved(now);
            showNotification(saveMode === 'new' ? "Nueva partida guardada" : "Partida guardada correctamente");
        } catch (e) {
            console.error(e);
            showNotification("Error al guardar la partida", "error");
        }

        closeSaveModal();
    }, [gameState, playerProfile, currentSaveId, saveMode, showNotification, closeSaveModal]);

    const handleQuitToMenu = useCallback(() => {
        resetGameData();
        setAppState('START_SCREEN');
    }, [resetGameData]);

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

            // Handle cup progression
            let updatedCups = simulationResult.updatedCups;
            const faCupMatches = matchesThisWeek.filter(m => m.competition === 'FA_Cup');
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

            // Check for random events
            const triggeredEvent = eventEngine.triggerEvent(gameState);
            if (triggeredEvent) {
                setCurrentEvent(triggeredEvent);
            }

            setPendingResults({
                newsToAdd,
                updatedSchedule: simulationResult.updatedSchedule,
                updatedLeagueTable: simulationResult.updatedLeagueTable,
                updatedChampionshipTable: simulationResult.updatedChampionshipTable,
                updatedAllTeams: simulationResult.updatedAllTeams,
                confidenceChange: simulationResult.confidenceChange,
                newOffers: generatedOffers,
                playerMatchResult: simulationResult.playerMatchResult,
                updatedCups
            });

        } catch (error) {
            console.error('Simulation error:', error);
            showNotification('Error al simular la semana', 'error');
            setMatchPhase('PRE');
        } finally {
            setIsSimulating(false);
        }

    }, [gameState, isSimulating, showNotification]);

    const handleWeekComplete = useCallback(() => {
        if (!gameState || !pendingResults) return;

        const newConfidence = Math.max(0, Math.min(100, gameState.chairmanConfidence + pendingResults.confidenceChange));

        dispatch({ type: 'ADVANCE_WEEK_START' });
        dispatch({
            type: 'ADVANCE_WEEK_SUCCESS',
            payload: {
                newsItems: pendingResults.newsToAdd,
                newSchedule: pendingResults.updatedSchedule,
                newLeagueTable: pendingResults.updatedLeagueTable,
                newChampionshipTable: pendingResults.updatedChampionshipTable,
                newAllTeams: pendingResults.updatedAllTeams,
                newConfidence,
                newOffers: pendingResults.newOffers,
                newCups: pendingResults.updatedCups
            }
        });

        if (newConfidence <= 0) {
            setAppState('GAME_OVER');
        } else {
            setMatchPhase('PRE');
        }
        setPendingResults(null);
    }, [gameState, pendingResults]);

    const handleElectionComplete = () => {
        showNotification('¡Reelección exitosa! Nuevo mandato comenzado');
    };

    const handleEventChoice = useCallback((choiceIndex: number, effects: any) => {
        if (!gameState || !currentEvent) return;

        // Apply event effects to game state
        const updates = eventEngine.applyEffects(effects, gameState);

        // Dispatch updates
        if (updates.finances) {
            dispatch({ type: 'UPDATE_FINANCES', payload: updates.finances });
        }
        if (updates.team) {
            dispatch({ type: 'UPDATE_TEAM', payload: updates.team });
        }
        if (updates.fanApproval) {
            dispatch({ type: 'UPDATE_FAN_APPROVAL', payload: updates.fanApproval });
        }
        if (updates.chairmanConfidence !== undefined) {
            dispatch({ type: 'UPDATE_CHAIRMAN_CONFIDENCE', payload: updates.chairmanConfidence });
        }
        if (updates.stadium) {
            dispatch({ type: 'UPDATE_STADIUM', payload: updates.stadium });
        }

        showNotification(`Evento: ${currentEvent.event.title} - Decisión tomada`);
        setCurrentEvent(null);
    }, [gameState, currentEvent, showNotification]);

    return (
        <>
            {useNotification().notification && (
                <Notification
                    message={useNotification().notification.message}
                    type={useNotification().notification.type}
                    onClose={useNotification().hideNotification}
                />
            )}
            {viewingPlayer && <PlayerDetailModal player={viewingPlayer} dispatch={dispatch} />}
            {isSaveModalOpen && (
                <SaveGameModal
                    onSave={handleConfirmSave}
                    onClose={closeSaveModal}
                    defaultName={saveMode === 'overwrite' ? (currentSaveName || `${gameState.team.name} Carrera`) : `${gameState.team.name} Carrera (Nueva)`}
                    mode={saveMode}
                />
            )}
            {currentEvent && (
                <EventModal
                    event={currentEvent.event}
                    onChoice={handleEventChoice}
                    onClose={() => setCurrentEvent(null)}
                />
            )}

            <AppRouter
                appState={appState}
                playerProfile={playerProfile}
                selectedTeam={selectedTeam}
                electionResult={electionResult}
                onNewGame={handleNewGame}
                onLoadGameScreen={() => setAppState('LOAD_GAME')}
                onLoadGame={handleLoadGame}
                onProfileCreate={handleProfileCreate}
                onTeamSelect={handleTeamSelect}
                onPitchSubmit={handlePitchSubmit}
                onStartGame={handleStartGame}
                onRetryElection={handleRetryElection}
            >
                {gameState && (
                    <MainLayout
                        gameState={gameState}
                        activeScreen={activeScreen}
                        setActiveScreen={setActiveScreen}
                        matchPhase={matchPhase}
                        pendingResults={pendingResults}
                        onPlayMatch={handlePlayMatch}
                        onWeekComplete={handleWeekComplete}
                        allPlayers={allPlayers}
                        dispatch={dispatch}
                        onSaveGame={openSaveModal}
                        onQuitToMenu={handleQuitToMenu}
                        currentSaveName={currentSaveName}
                        lastSaved={lastSaved}
                        onElectionComplete={handleElectionComplete}
                    />
                )}
            </AppRouter>
        </>
    );
}

// --- Main App Component with Providers ---
function App() {
    return (
        <NotificationProvider>
            <ModalProvider>
                <AppLogic />
            </ModalProvider>
        </NotificationProvider>
    );
}

export default App;