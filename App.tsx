import React, { useCallback, useEffect } from 'react';
import { Team, PlayerProfile, NewsItem, ElectoralPromise } from './types';
import { useGameStore, ensureGameReducerLoaded } from './state/gameStore';
import { useTeamSlice, useFinancesSlice, useCalendarSlice } from './state/selectors';
import { loadTeamCatalog } from './services/teamCatalogRegistry';

// Contexts & Providers
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { ModalProvider, useModal } from './contexts/ModalContext';
import { ToastProvider } from './components/common/ToastProvider';
import { AuthProvider } from './contexts/AuthContext';

// Router & Lazy Layout (MainLayout deferred until GAME_ACTIVE)
import { AppRouter } from './components/AppRouter';

// UI Modals & Overlays - Lazy loaded on-demand
import { Notification } from './components/ui/Notification';
const MainLayout = React.lazy(() => import('./components/MainLayout').then(m => ({ default: m.MainLayout })));
const PlayerDetailModal = React.lazy(() => import('./components/ui/PlayerDetailModal').then(m => ({ default: m.PlayerDetailModal })));
const SaveGameModal = React.lazy(() => import('./components/ui/SaveGameModal').then(m => ({ default: m.SaveGameModal })));
const EventModal = React.lazy(() => import('./components/ui/EventModal').then(m => ({ default: m.EventModal })));
const CinematicOverlay = React.lazy(() => import('./components/cinematics/CinematicOverlay').then(m => ({ default: m.CinematicOverlay })));
const SeasonEndModal = React.lazy(() => import('./components/screens/season/SeasonEndModal').then(m => ({ default: m.SeasonEndModal })));

// Utilities
import { formatDate, setGlobalCurrency } from './utils';

// Custom Hooks
import { useGameSave } from './hooks/useGameSave';
import { useSimulation } from './hooks/useSimulation';

let gameRuntimePromise: Promise<void> | null = null;
function preloadGameRuntime(): Promise<void> {
    if (!gameRuntimePromise) {
        gameRuntimePromise = Promise.all([
            ensureGameReducerLoaded(),
            loadTeamCatalog(),
            import('./services/resources/providers/DefaultResourceProvider').then(m => m.DefaultResourceProvider.preloadAssets())
        ]).then(() => undefined);
    }
    return gameRuntimePromise;
}

const SeasonEndModalContainer: React.FC<{
    onClose: () => void;
    onStartNewSeason: () => void;
    isStarting: boolean;
}> = React.memo(({ onClose, onStartNewSeason, isStarting }) => {
    const gameState = useGameStore(s => s.gameState);
    if (!gameState) return null;
    return (
        <SeasonEndModal
            gameState={gameState}
            onClose={onClose}
            onStartNewSeason={onStartNewSeason}
            isStarting={isStarting}
        />
    );
});

function AppLogic() {
    // Atomic Zustand selectors (AppLogic NEVER subscribes to full `s => s.gameState`)
    const appState = useGameStore(s => s.appState);
    const setAppState = useGameStore(s => s.setAppState);
    const playerProfile = useGameStore(s => s.playerProfile);
    const setPlayerProfile = useGameStore(s => s.setPlayerProfile);
    const selectedTeam = useGameStore(s => s.selectedTeam);
    const setSelectedTeam = useGameStore(s => s.setSelectedTeam);
    const electionResult = useGameStore(s => s.electionResult);
    const setElectionResult = useGameStore(s => s.setElectionResult);
    const hasGameState = useGameStore(s => s.gameState !== null);
    const dispatch = useGameStore(s => s.dispatch);
    const storeViewingPlayer = useGameStore(s => s.viewingPlayer);
    const currentEvent = useGameStore(s => s.currentEvent);
    const setCurrentEvent = useGameStore(s => s.setCurrentEvent);
    const isSeasonEndModalOpen = useGameStore(s => s.isSeasonEndModalOpen);
    const setIsSeasonEndModalOpen = useGameStore(s => s.setIsSeasonEndModalOpen);
    const isStartingSeason = useGameStore(s => s.isStartingSeason);
    const setIsStartingSeason = useGameStore(s => s.setIsStartingSeason);
    const resetGameData = useGameStore(s => s.resetGameData);
    const topCinematic = useGameStore(s => s.gameState?.cinematicQueue?.[0] || null);
    const newsFeedLength = useGameStore(s => s.gameState?.newsFeed?.length ?? 0);

    // Atomic domain slices for shell metadata
    const { teamName } = useTeamSlice();
    const { preferredCurrency } = useFinancesSlice();
    const { season } = useCalendarSlice();

    // Sync global currency formatters
    useEffect(() => {
        if (preferredCurrency) {
            setGlobalCurrency(preferredCurrency);
        }
    }, [preferredCurrency]);

    // Contexts
    const { notification, showNotification, hideNotification } = useNotification();
    const { viewingPlayer: modalViewingPlayer, isSaveModalOpen, saveMode, openSaveModal, closeSaveModal } = useModal();
    const viewingPlayer = storeViewingPlayer || modalViewingPlayer;

    // Unified Zustand Simulation & Save hooks
    const {
        matchPhase,
        setMatchPhase,
        setPendingResults,
        handleWeekComplete
    } = useSimulation(showNotification);

    const {
        currentSaveName,
        resetSaveState,
        performLoadGame,
        performLoadCloudGame,
        performSaveGame,
        performAutoSave,
        performQuickSave
    } = useGameSave(showNotification);

    // Career lifecycle handlers
    const handleNewGame = useCallback(() => {
        resetGameData();
        resetSaveState();
        setMatchPhase('PRE');
        setPendingResults(null);
        setAppState('PROFILE_CREATION');
        void preloadGameRuntime();
    }, [resetGameData, resetSaveState, setMatchPhase, setPendingResults, setAppState]);

    const handleLoadGame = useCallback(async (id: string, isCloud?: boolean) => {
        await preloadGameRuntime();
        const loadedProfile = isCloud ? await performLoadCloudGame(id) : await performLoadGame(id);
        if (loadedProfile) {
            setPlayerProfile(loadedProfile);
            setAppState('GAME_ACTIVE');
        } else {
            setAppState('START_SCREEN');
        }
    }, [performLoadGame, performLoadCloudGame, setPlayerProfile, setAppState]);

    const handleProfileCreate = useCallback((profile: PlayerProfile) => {
        setPlayerProfile(profile);
        setAppState('TEAM_SELECTION');
    }, [setPlayerProfile, setAppState]);

    const handleTeamSelect = useCallback((team: Team) => {
        setSelectedTeam(team);
        setAppState('ELECTION_PITCH');
    }, [setSelectedTeam, setAppState]);

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

    const handlePromisesSubmit = useCallback(async (promises: ElectoralPromise[]) => {
        if (!selectedTeam || !playerProfile) return;
        await preloadGameRuntime();
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

    const handleRetryElection = useCallback(() => {
        setSelectedTeam(null);
        setElectionResult(null);
        setAppState('TEAM_SELECTION');
    }, [setSelectedTeam, setElectionResult, setAppState]);

    useEffect(() => {
        if (hasGameState && newsFeedLength === 3) {
            const gs = useGameStore.getState().gameState;
            if (!gs) return;
            void import('./services/gameLogic').then(async ({ generateNews }) => {
                const initialNews = await generateNews(gs);
                const newsItem: NewsItem = {
                    ...initialNews,
                    id: new Date().toISOString(),
                    date: formatDate(gs.currentDate)
                };
                dispatch({ type: 'ADD_NEWS', payload: newsItem });
            });
        }
    }, [hasGameState, newsFeedLength, dispatch]);

    const handleConfirmSave = useCallback(async (saveName: string) => {
        await performSaveGame(saveName, saveMode);
        closeSaveModal();
    }, [performSaveGame, saveMode, closeSaveModal]);

    const handleQuitToMenu = useCallback((skipConfirm: boolean = false) => {
        if (skipConfirm || window.confirm('¿Seguro que deseas salir al menú principal? Los progresos no guardados se perderán.')) {
            resetGameData();
            resetSaveState();
            setAppState('START_SCREEN');
        }
    }, [resetGameData, resetSaveState, setAppState]);

    const handleEventChoice = useCallback(async (_choiceIndex: number, effects: any) => {
        const gs = useGameStore.getState().gameState;
        if (!gs || !currentEvent) return;
        const { eventEngine } = await import('./services/eventEngine');
        const updates = eventEngine.applyEffects(effects, gs);

        if (updates.finances) dispatch({ type: 'UPDATE_FINANCES', payload: updates.finances });
        if (updates.team) dispatch({ type: 'UPDATE_TEAM', payload: updates.team });
        if (updates.fanApproval) dispatch({ type: 'SET_FAN_APPROVAL', payload: updates.fanApproval });
        if (updates.boardConfidence !== undefined) dispatch({ type: 'UPDATE_BOARD_CONFIDENCE', payload: updates.boardConfidence });
        if (updates.stadium) dispatch({ type: 'UPDATE_STADIUM', payload: updates.stadium });
        if (updates.newYouthPlayer) dispatch({ type: 'ADD_YOUTH_PLAYER', payload: updates.newYouthPlayer });

        dispatch({ type: 'RECORD_TRIGGERED_EVENT', payload: currentEvent.event.id });
        showNotification(`Evento: ${currentEvent.event.title} - Decisión tomada`);
        setCurrentEvent(null);
    }, [currentEvent, showNotification, dispatch, setCurrentEvent]);

    const onWeekComplete = useCallback(() => {
        const gs = useGameStore.getState().gameState;
        handleWeekComplete();
        if (gs && (gs.currentWeek % 4 === 0 || gs.currentWeek === 1) && gs.currentTurn === 'weekend') {
            performAutoSave();
        }
    }, [handleWeekComplete, performAutoSave]);

    // Keyboard shortcut for Quick-Save (F5 or Ctrl+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (appState === 'GAME_ACTIVE' && useGameStore.getState().gameState && (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 's'))) {
                e.preventDefault();
                performQuickSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [appState, performQuickSave]);

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

    const handleElectionComplete = useCallback(() => {
        showNotification('¡Reelección exitosa! Nuevo mandato comenzado');
    }, [showNotification]);

    const handleOpenSeasonEndModal = useCallback(() => {
        setIsSeasonEndModalOpen(true);
    }, [setIsSeasonEndModalOpen]);

    return (
        <>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={hideNotification}
                />
            )}
            <React.Suspense fallback={null}>
                {viewingPlayer && <PlayerDetailModal player={viewingPlayer} dispatch={dispatch} />}
                {isSaveModalOpen && (
                    <SaveGameModal
                        onSave={handleConfirmSave}
                        onClose={closeSaveModal}
                        defaultName={currentSaveName || `${teamName || 'Club'} - Temp ${season}`}
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

                {isSeasonEndModalOpen && (
                    <SeasonEndModalContainer
                        onClose={() => setIsSeasonEndModalOpen(false)}
                        onStartNewSeason={handleStartNewSeason}
                        isStarting={isStartingSeason}
                    />
                )}

                {topCinematic && matchPhase !== 'LIVE' && (
                    <CinematicOverlay
                        event={topCinematic}
                        onContinue={() => dispatch({ type: 'POP_CINEMATIC' })}
                    />
                )}
            </React.Suspense>

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
                {hasGameState && (
                    <React.Suspense fallback={null}>
                        <MainLayout
                            onWeekComplete={onWeekComplete}
                            onSaveGame={openSaveModal}
                            onQuickSave={performQuickSave}
                            onQuitToMenu={handleQuitToMenu}
                            onNewGame={handleNewGame}
                            onElectionComplete={handleElectionComplete}
                            onStartNewSeason={handleStartNewSeason}
                            onOpenSeasonEndModal={handleOpenSeasonEndModal}
                        />
                    </React.Suspense>
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
