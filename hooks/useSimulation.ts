import { useCallback } from 'react';
import { simulationWorker } from '../services/simulationWorker';
import { useGameStore } from '../state/gameStore';

/**
 * Simulation hook unified directly on Zustand (`useGameStore`), eliminating duplicate
 * React state and removing `gameState` closure dependencies from simulation handlers.
 */
export function useSimulation(
    showNotification: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
    const matchPhase = useGameStore(s => s.matchPhase);
    const pendingResults = useGameStore(s => s.pendingResults);
    const isSimulating = useGameStore(s => s.isSimulating);
    const setMatchPhase = useGameStore(s => s.setMatchPhase);
    const setPendingResults = useGameStore(s => s.setPendingResults);

    const handlePlayMatch = useCallback(async () => {
        const state = useGameStore.getState();
        const gameState = state.gameState;
        if (!gameState || state.isSimulating) return;

        const { isSeasonCompleted } = await import('../services/seasonUtils');
        if (isSeasonCompleted(gameState)) {
            showNotification('La temporada ha finalizado. Inicia la nueva temporada desde el panel.', 'info');
            return;
        }

        try {
            state.setIsSimulating(true);
            // Yield to browser renderer so the button state switches immediately to 'Simulando...'
            await new Promise(resolve => setTimeout(resolve, 30));
            state.setMatchPhase('LIVE');

            // 1. Off-Main-Thread Stateful Worker Pipeline (INIT_STATE / PATCH_STATE / SIMULATE_TURN)
            const simulationResult = await simulationWorker.simulateWeek(gameState);

            // 2. Store processed worker deltas in Zustand
            state.setPendingResults({
                newsToAdd: simulationResult.newsToAdd || [],
                updatedSchedule: simulationResult.updatedSchedule,
                updatedLeagueTables: simulationResult.updatedLeagueTables,
                updatedAllTeams: simulationResult.updatedAllTeams,
                confidenceChange: simulationResult.confidenceChange,
                newOffers: simulationResult.newOffers || [],
                playerMatchResult: simulationResult.playerMatchResult,
                updatedCups: simulationResult.updatedCups,
                updatedScoutedPlayerIds: simulationResult.updatedScoutedPlayerIds,
                coachReport: simulationResult.coachReport,
                cinematicEvents: simulationResult.cinematicEvents || []
            });

            state.setMatchPhase('LIVE');
        } catch (error) {
            console.error('Simulation error:', error);
            showNotification('Error al simular la semana', 'error');
            useGameStore.getState().setMatchPhase('PRE');
        } finally {
            useGameStore.getState().setIsSimulating(false);
        }
    }, [showNotification]);

    const handleWeekComplete = useCallback(() => {
        const state = useGameStore.getState();
        const { gameState, pendingResults: pending, dispatch, setAppState, setCurrentEvent } = state;
        if (!gameState || !pending) return;

        const newConfidence = Math.max(0, Math.min(100, gameState.boardConfidence + pending.confidenceChange));

        dispatch({
            type: 'ADVANCE_WEEK_SUCCESS',
            payload: {
                newsItems: pending.newsToAdd,
                newSchedule: pending.updatedSchedule,
                newLeagueTables: pending.updatedLeagueTables,
                newAllTeams: pending.updatedAllTeams,
                newConfidence,
                newOffers: pending.newOffers,
                newCups: pending.updatedCups,
                newScoutedPlayerIds: pending.updatedScoutedPlayerIds,
                coachReport: pending.coachReport,
                cinematicEvents: pending.cinematicEvents
            }
        });

        if (newConfidence <= 0) {
            setAppState('GAME_OVER');
        } else {
            state.setMatchPhase('PRE');
            const latestGameState = useGameStore.getState().gameState || gameState;
            // Trigger balanced presidential dilemma event if conditions match
            void import('../services/eventEngine').then(({ eventEngine }) => {
                const triggeredEvt = eventEngine.triggerEvent(latestGameState);
                if (triggeredEvt) {
                    setCurrentEvent(triggeredEvt);
                }
            });
        }
        state.setPendingResults(null);
    }, []);

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
