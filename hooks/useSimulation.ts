import React, { useState, useCallback } from 'react';
import { GameState, MatchPhase, PendingSimulationResults } from '../types';
import { GameAction } from '../state/reducer';
import { simulationWorker } from '../services/simulationWorker';
import { TriggeredEvent } from '../services/eventEngine';
import { isSeasonCompleted } from '../services/seasonUtils';

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

        if (isSeasonCompleted(gameState)) {
            showNotification('La temporada ha finalizado. Inicia la nueva temporada desde el panel.', 'info');
            return;
        }

        try {
            setIsSimulating(true);
            // Yield to browser renderer so the button state switches immediately to 'Simulando...'
            await new Promise(resolve => setTimeout(resolve, 30));
            setMatchPhase('LIVE');

            // 1. Pipeline de Simulación 100% Off-Main-Thread (Worker)
            // Ejecuta simulación, copas, eventos cinemáticos, noticias y reporte del DT en segundo plano
            const simulationResult = await simulationWorker.simulateWeek(gameState);

            // 2. Establecer resultados pendientes procesados íntegramente en el Worker
            setPendingResults({
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

            setMatchPhase('LIVE');
        } catch (error) {
            console.error('Simulation error:', error);
            showNotification('Error al simular la semana', 'error');
            setMatchPhase('PRE');
        } finally {
            setIsSimulating(false);
        }
    }, [gameState, isSimulating, showNotification, setCurrentEvent, dispatch]);

    const handleWeekComplete = useCallback(() => {
        if (!gameState || !pendingResults) return;

        const newConfidence = Math.max(0, Math.min(100, gameState.boardConfidence + pendingResults.confidenceChange));

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
                newScoutedPlayerIds: pendingResults.updatedScoutedPlayerIds,
                coachReport: pendingResults.coachReport,
                cinematicEvents: pendingResults.cinematicEvents
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
