import React, { useState, useCallback, useEffect, useMemo, useReducer } from 'react';
import { GameState, Team, Screen, PlayerProfile, NewsItem, Offer, LeagueTableRow, Match, LeagueId, ElectoralPromise } from './types';
import { gameReducer, initialState } from './state/reducer';
import { saveGame, loadGame, SavedGameData } from './services/db';

// Contexts
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { ModalProvider, useModal } from './contexts/ModalContext';
import { ToastProvider } from './components/common/ToastProvider';

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
import { PendingSimulationResults } from './types';

// Custom Hooks
import { useGameSave } from './hooks/useGameSave';
import { useSimulation } from './hooks/useSimulation';

// --- Main App Logic Component ---
function AppLogic() {
    const [appState, setAppState] = useState<AppStateType>('START_SCREEN');
    const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [electionResult, setElectionResult] = useState<ElectionResponse | null>(null);
    const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Dashboard);

    // Event System State
    const [currentEvent, setCurrentEvent] = useState<TriggeredEvent | null>(null);

    const [gameState, dispatch] = useReducer(gameReducer, initialState);

    // Use contexts
    const { showNotification } = useNotification();
    const { viewingPlayer, isSaveModalOpen, saveMode, openSaveModal, closeSaveModal, closePlayerModal } = useModal();

    const allPlayers = useMemo(() => gameState ? gameState.allTeams.flatMap(t => t.squad) : [], [gameState]);

    // Custom Hooks
    const { matchPhase, setMatchPhase, pendingResults, setPendingResults, isSimulating, handlePlayMatch, handleWeekComplete } = useSimulation(gameState, dispatch, setAppState, showNotification, setCurrentEvent);
    
    const { currentSaveId, currentSaveName, lastSaved, resetSaveState, performLoadGame, performSaveGame } = useGameSave(gameState, playerProfile, appState, matchPhase, dispatch, showNotification);

    const resetGameData = useCallback(() => {
        dispatch({ type: 'RESET_GAME' });
        setPlayerProfile(null);
        setSelectedTeam(null);
        setElectionResult(null);
        setActiveScreen(Screen.Dashboard);
        resetSaveState();
        setMatchPhase('PRE');
        setPendingResults(null);
    }, [dispatch, resetSaveState, setMatchPhase, setPendingResults]);

    const handleNewGame = useCallback(() => {
        resetGameData();
        setAppState('PROFILE_CREATION');
    }, [resetGameData]);

    const handleLoadGame = useCallback(async (id: string) => {
        const loadedProfile = await performLoadGame(id);
        if (loadedProfile) {
            setPlayerProfile(loadedProfile);
            setAppState('GAME_ACTIVE');
        } else {
            setAppState('START_SCREEN');
        }
    }, [performLoadGame]);

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
        setAppState('PROMISE_SELECTION');
    }, [selectedTeam, playerProfile]);

    const handlePromisesSubmit = useCallback((promises: ElectoralPromise[]) => {
        if (!selectedTeam || !playerProfile) return;
        dispatch({ 
            type: 'INITIALIZE_GAME', 
            payload: { 
                team: selectedTeam, 
                playerProfile,
                initialPromises: promises 
            } 
        });
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
        await performSaveGame(saveName, saveMode);
        closeSaveModal();
    }, [performSaveGame, saveMode, closeSaveModal]);

    const handleQuitToMenu = useCallback(() => {
        resetGameData();
        setAppState('START_SCREEN');
    }, [resetGameData]);

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
            dispatch({ type: 'SET_FAN_APPROVAL', payload: updates.fanApproval });
        }
        if (updates.boardConfidence !== undefined) {
            dispatch({ type: 'UPDATE_BOARD_CONFIDENCE', payload: updates.boardConfidence });
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
                    defaultName={saveMode === 'overwrite' ? (currentSaveName || `${gameState?.team?.name} Carrera`) : `${gameState?.team?.name} Carrera (Nueva)`}
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
                onPromisesSubmit={handlePromisesSubmit}
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
                <ToastProvider>
                    <AppLogic />
                </ToastProvider>
            </ModalProvider>
        </NotificationProvider>
    );
}

export default App;