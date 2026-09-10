import React, { useState, useCallback, useEffect, useMemo, useReducer } from 'react';
import { GameState, Team, Screen, PlayerProfile, NewsItem, Offer, LeagueTableRow, Match, LeagueId, ElectoralPromise } from './types';
import { gameReducer, initialState } from './state/reducer';
import { saveGame, loadGame, SavedGameData } from './services/db';

// Contexts
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { ModalProvider, useModal } from './contexts/ModalContext';
import { ToastProvider } from './components/common/ToastProvider';
import { AuthProvider } from './contexts/AuthContext';

// Router and Layout
import { AppRouter } from './components/AppRouter';
import { MainLayout } from './components/MainLayout';

// UI Components
import { PlayerDetailModal } from './components/ui/PlayerDetailModal';
import { SaveGameModal } from './components/ui/SaveGameModal';
import { Notification } from './components/ui/Notification';
import { EventModal } from './components/ui/EventModal';
import { Player } from './types';
import { CinematicOverlay } from './components/cinematics/CinematicOverlay';
import { SeasonEndModal } from './components/screens/season/SeasonEndModal';

// Services
import { ElectionResponse, generateNews, generateMatchReport, generateTransferOffer, generatePlayerOfTheWeekNews, generateImportantNews } from './services/gameLogic';
import { advanceCupRound } from './services/simulation';
import { formatDate, setGlobalCurrency } from './utils';
import { simulationWorker } from './services/simulationWorker';
import { eventEngine, TriggeredEvent } from './services/eventEngine';


type AppStateType = 'START_SCREEN' | 'LOAD_GAME' | 'PROFILE_CREATION' | 'TEAM_SELECTION' | 'ELECTION_PITCH' | 'ELECTION_RESULT' | 'PROMISE_SELECTION' | 'GAME_ACTIVE' | 'GAME_OVER';

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

    const [isSeasonEndModalOpen, setIsSeasonEndModalOpen] = useState(false);
    const [isStartingSeason, setIsStartingSeason] = useState(false);

    const [currentEvent, setCurrentEvent] = useState<TriggeredEvent | null>(null);

    const [gameState, dispatch] = useReducer(gameReducer, initialState);

    // Sync global currency formatters
    useEffect(() => {
        if (gameState?.preferredCurrency) {
            setGlobalCurrency(gameState.preferredCurrency);
        }
    }, [gameState?.preferredCurrency]);

    // Use contexts
    const { showNotification } = useNotification();
    const { viewingPlayer, isSaveModalOpen, saveMode, openSaveModal, closeSaveModal, closePlayerModal } = useModal();

    const activeLeaguePlayers = useMemo(() => {
        if (!gameState) return [];
        const userLeagueId = gameState.team.leagueId;
        return gameState.allTeams
            .filter(t => t.leagueId === userLeagueId || t.id === gameState.team.id)
            .flatMap(t => t.squad);
    }, [gameState?.allTeams, gameState?.team?.leagueId, gameState?.team?.id]);

    // Custom Hooks
    const { matchPhase, setMatchPhase, pendingResults, setPendingResults, isSimulating, handlePlayMatch, handleWeekComplete } = useSimulation(gameState, dispatch, setAppState, showNotification, setCurrentEvent);
    
    const { 
        currentSaveId, 
        currentSaveName, 
        lastSaved, 
        resetSaveState, 
        performLoadGame, 
        performLoadCloudGame, 
        performSaveGame,
        performAutoSave,
        performQuickSave,
        isSaving 
    } = useGameSave(gameState, playerProfile, appState, matchPhase, dispatch, showNotification);

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

    const handleLoadGame = useCallback(async (id: string, isCloud?: boolean) => {
        const loadedProfile = isCloud ? await performLoadCloudGame(id) : await performLoadGame(id);
        if (loadedProfile) {
            setPlayerProfile(loadedProfile);
            setAppState('GAME_ACTIVE');
        } else {
            setAppState('START_SCREEN');
        }
    }, [performLoadGame, performLoadCloudGame]);

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
        if (window.confirm('¿Seguro que deseas salir al menú principal? Los progresos no guardados se perderán.')) {
            resetGameData();
            setAppState('START_SCREEN');
        }
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

        // Record event as triggered to prevent duplicates across reloads
        dispatch({ type: 'RECORD_TRIGGERED_EVENT', payload: currentEvent.event.id });

        showNotification(`Evento: ${currentEvent.event.title} - Decisión tomada`);
        setCurrentEvent(null);
    }, [gameState, currentEvent, showNotification, dispatch]);

    const onWeekComplete = useCallback(() => {
        handleWeekComplete();
        // Trigger auto-save immediately after week completion in background
        performAutoSave();
    }, [handleWeekComplete, performAutoSave]);

    // Keyboard shortcut for Quick-Save (F5 or Ctrl+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (appState === 'GAME_ACTIVE' && gameState && (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 's'))) {
                e.preventDefault();
                performQuickSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [appState, gameState, performQuickSave]);

    const handleStartNewSeason = useCallback(() => {
        setIsStartingSeason(true);
        setTimeout(() => {
            dispatch({ type: 'START_NEW_SEASON' });
            setIsSeasonEndModalOpen(false);
            setIsStartingSeason(false);
            showNotification('¡Ha comenzado la nueva temporada!', 'success');
        }, 80);
    }, [dispatch, showNotification]);

    const { notification, hideNotification } = useNotification();

    return (
        <>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={hideNotification}
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

            {isSeasonEndModalOpen && gameState && (
                <SeasonEndModal
                    gameState={gameState}
                    onClose={() => setIsSeasonEndModalOpen(false)}
                    onStartNewSeason={handleStartNewSeason}
                    isStarting={isStartingSeason}
                />
            )}
            
            {/* Cinematic Overlay System */}
            {gameState && gameState.cinematicQueue?.length > 0 && (
                <CinematicOverlay 
                    event={gameState.cinematicQueue[0]} 
                    onContinue={() => dispatch({ type: 'POP_CINEMATIC' })} 
                />
            )}

            <AppRouter
                appState={appState}
                playerProfile={playerProfile}
                selectedTeam={selectedTeam}
                electionResult={electionResult}
                onNewGame={handleNewGame}
                onLoadGameScreen={() => setAppState('LOAD_GAME')}
                onBackToStart={() => setAppState('START_SCREEN')}
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
                        onWeekComplete={onWeekComplete}
                        allPlayers={activeLeaguePlayers}
                        dispatch={dispatch}
                        onSaveGame={openSaveModal}
                        onQuitToMenu={handleQuitToMenu}
                        currentSaveName={currentSaveName}
                        lastSaved={lastSaved}
                        onElectionComplete={handleElectionComplete}
                        isSimulating={isSimulating}
                        onStartNewSeason={handleStartNewSeason}
                        onOpenSeasonEndModal={() => setIsSeasonEndModalOpen(true)}
                    />
                )}
            </AppRouter>
        </>
    );
}

// --- Main App Component with Providers ---
function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <ModalProvider>
                    <ToastProvider>
                        <AppLogic />
                    </ToastProvider>
                </ModalProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;