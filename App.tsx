import React, { useCallback, useEffect } from 'react';
import { GameState, Team, Screen, PlayerProfile, NewsItem, ElectoralPromise } from './types';
import { useGameStore } from './state/gameStore';

// Contexts & Providers
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { ModalProvider, useModal } from './contexts/ModalContext';
import { ToastProvider } from './components/common/ToastProvider';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider, useActiveLeaguePlayers } from './contexts/GameContext';

// Router and Layout
import { AppRouter } from './components/AppRouter';
import { MainLayout } from './components/MainLayout';

// UI Modals & Overlays
import { PlayerDetailModal } from './components/ui/PlayerDetailModal';
import { SaveGameModal } from './components/ui/SaveGameModal';
import { Notification } from './components/ui/Notification';
import { EventModal } from './components/ui/EventModal';
import { CinematicOverlay } from './components/cinematics/CinematicOverlay';
import { SeasonEndModal } from './components/screens/season/SeasonEndModal';

// Services
import { generateNews } from './services/gameLogic';
import { formatDate, setGlobalCurrency } from './utils';
import { eventEngine } from './services/eventEngine';

// Custom Hooks
import { useGameSave } from './hooks/useGameSave';
import { useSimulation } from './hooks/useSimulation';

function AppLogic() {
    const {
        appState,
        setAppState,
        playerProfile,
        setPlayerProfile,
        selectedTeam,
        setSelectedTeam,
        electionResult,
        setElectionResult,
        activeScreen,
        setActiveScreen,
        gameState,
        dispatch,
        currentEvent,
        setCurrentEvent,
        isSeasonEndModalOpen,
        setIsSeasonEndModalOpen,
        isStartingSeason,
        setIsStartingSeason,
        resetGameData
    } = useGameStore();

    // Sync global currency formatters
    useEffect(() => {
        if (gameState?.preferredCurrency) {
            setGlobalCurrency(gameState.preferredCurrency);
        }
    }, [gameState?.preferredCurrency]);

    // Contexts
    const { notification, showNotification, hideNotification } = useNotification();
    const { viewingPlayer, isSaveModalOpen, saveMode, openSaveModal, closeSaveModal } = useModal();
    const activeLeaguePlayers = useActiveLeaguePlayers();

    // Simulation & Save hooks
    const { 
        matchPhase, 
        setMatchPhase, 
        pendingResults, 
        setPendingResults, 
        isSimulating, 
        handlePlayMatch, 
        handleWeekComplete 
    } = useSimulation(gameState, dispatch, setAppState, showNotification, setCurrentEvent);
    
    const { 
        currentSaveName, 
        lastSaved, 
        resetSaveState, 
        performLoadGame, 
        performLoadCloudGame, 
        performSaveGame,
        performAutoSave,
        performQuickSave
    } = useGameSave(gameState, playerProfile, appState, matchPhase, dispatch, showNotification);

    // Career lifecycle handlers
    const handleNewGame = useCallback(() => {
        resetGameData();
        resetSaveState();
        setMatchPhase('PRE');
        setPendingResults(null);
        setAppState('PROFILE_CREATION');
    }, [resetGameData, resetSaveState, setMatchPhase, setPendingResults, setAppState]);

    const handleLoadGame = useCallback(async (id: string, isCloud?: boolean) => {
        const loadedProfile = isCloud ? await performLoadCloudGame(id) : await performLoadGame(id);
        if (loadedProfile) {
            setPlayerProfile(loadedProfile);
            setAppState('GAME_ACTIVE');
        } else {
            setAppState('START_SCREEN');
        }
    }, [performLoadGame, performLoadCloudGame, setPlayerProfile, setAppState]);

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
        setElectionResult({
            success: isSuccess,
            feedback: isSuccess
                ? `¡Felicidades! Has ganado las elecciones del ${selectedTeam.name}.`
                : `No has conseguido suficientes votos. Intenta con otro equipo.`
        });
        setAppState('ELECTION_RESULT');
    }, [selectedTeam, playerProfile, setElectionResult, setAppState]);

    const handleStartGame = useCallback(() => {
        if (!selectedTeam || !playerProfile) return;
        setAppState('PROMISE_SELECTION');
    }, [selectedTeam, playerProfile, setAppState]);

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
    }, [selectedTeam, playerProfile, dispatch, setAppState]);

    const handleRetryElection = () => {
        setSelectedTeam(null);
        setElectionResult(null);
        setAppState('TEAM_SELECTION');
    };

    const fetchInitialNews = useCallback(async (state: GameState) => {
        const initialNews = await generateNews(state);
        const newsItem: NewsItem = { ...initialNews, id: new Date().toISOString(), date: formatDate(state.currentDate) };
        dispatch({ type: 'ADD_NEWS', payload: newsItem });
    }, [dispatch]);

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
            resetSaveState();
            setAppState('START_SCREEN');
        }
    }, [resetGameData, resetSaveState, setAppState]);

    const handleEventChoice = useCallback((choiceIndex: number, effects: any) => {
        if (!gameState || !currentEvent) return;
        const updates = eventEngine.applyEffects(effects, gameState);

        if (updates.finances) dispatch({ type: 'UPDATE_FINANCES', payload: updates.finances });
        if (updates.team) dispatch({ type: 'UPDATE_TEAM', payload: updates.team });
        if (updates.fanApproval) dispatch({ type: 'SET_FAN_APPROVAL', payload: updates.fanApproval });
        if (updates.boardConfidence !== undefined) dispatch({ type: 'UPDATE_BOARD_CONFIDENCE', payload: updates.boardConfidence });
        if (updates.stadium) dispatch({ type: 'UPDATE_STADIUM', payload: updates.stadium });

        dispatch({ type: 'RECORD_TRIGGERED_EVENT', payload: currentEvent.event.id });
        showNotification(`Evento: ${currentEvent.event.title} - Decisión tomada`);
        setCurrentEvent(null);
    }, [gameState, currentEvent, showNotification, dispatch, setCurrentEvent]);

    const onWeekComplete = useCallback(() => {
        handleWeekComplete();
        // Throttled auto-save: run every 4 weeks on weekend turn (or week 1)
        if (gameState && (gameState.currentWeek % 4 === 0 || gameState.currentWeek === 1) && gameState.currentTurn === 'weekend') {
            performAutoSave();
        }
    }, [handleWeekComplete, performAutoSave, gameState]);

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
            performAutoSave();
        }, 80);
    }, [dispatch, showNotification, performAutoSave, setIsStartingSeason, setIsSeasonEndModalOpen]);

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
                        onElectionComplete={() => showNotification('¡Reelección exitosa! Nuevo mandato comenzado')}
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
                        <GameProvider>
                            <AppLogic />
                        </GameProvider>
                    </ToastProvider>
                </ModalProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;