import React, { useState, useCallback } from 'react';
import { GameState, MatchPhase, PendingSimulationResults } from '../types';
import { GameAction } from '../state/reducer';
import { simulationWorker } from '../services/simulationWorker';
import { generateCoachReport } from '../services/gameLogic';
import { eventEngine, TriggeredEvent } from '../services/eventEngine';
import { handleCupProgression } from '../services/simulation/cupProgressionHandler';
import { detectCinematicEvents } from '../services/simulation/cinematicsDetector';
import { generateWeeklyNewsAndOffers } from '../services/simulation/simulationNewsHandler';

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

            // 1. Worker simulation
            const simulationResult = await simulationWorker.simulateWeek(gameState);

            const newDate = new Date(gameState.currentDate);
            newDate.setDate(newDate.getDate() + 7);
            const newWeek = gameState.currentWeek + 1;
            const simulatedWeek = gameState.currentTurn === 'midweek' ? gameState.currentWeek + 1 : gameState.currentWeek;

            // 2. Restore React / JSX logos from previous state (logos stripped by Web Worker)
            const originalLogoMap = new Map(gameState.allTeams.map(t => [t.id, t.logo]));
            const restoredTeams = simulationResult.updatedAllTeams.map(updatedTeam => ({
                ...updatedTeam,
                logo: originalLogoMap.get(updatedTeam.id) || updatedTeam.logo
            }));

            // 3. Process Cup & Playoff Progression
            const cupResult = handleCupProgression(
                simulationResult.updatedCups,
                simulationResult.updatedSchedule,
                restoredTeams,
                simulatedWeek,
                newWeek,
                simulationResult.updatedLeagueTables,
                gameState.currentTurn
            );

            // Dispatch any immediate kickoff cinematics
            cupResult.cinematicEvents.forEach(evt => {
                dispatch({ type: 'PUSH_CINEMATIC', payload: evt });
            });

            // 4. Detect Champion & Achievement Cinematics
            const justPlayedMatches = cupResult.updatedSchedule.filter(
                m => m.result !== undefined && m.week === simulatedWeek && !!m.isMidweek === (gameState.currentTurn === 'midweek')
            );
            const celebrationCinematics = detectCinematicEvents(
                gameState,
                cupResult.updatedCups,
                simulationResult.updatedLeagueTables,
                simulatedWeek,
                newWeek,
                justPlayedMatches
            );

            // 5. Generate News & AI Transfer Offers
            const { newsToAdd, generatedOffers } = await generateWeeklyNewsAndOffers(
                gameState,
                cupResult.updatedSchedule,
                restoredTeams,
                simulationResult.playerMatchResult,
                newWeek,
                newDate,
                celebrationCinematics
            );

            // 6. Check Random Events
            const triggeredEvent = eventEngine.triggerEvent(gameState);
            if (triggeredEvent) {
                setCurrentEvent(triggeredEvent);
            }

            // 7. Generate Coach Report
            const coachReport = generateCoachReport(gameState);

            // 8. Set Final Pending Results
            setPendingResults({
                newsToAdd,
                updatedSchedule: cupResult.updatedSchedule,
                updatedLeagueTables: simulationResult.updatedLeagueTables,
                updatedAllTeams: restoredTeams,
                confidenceChange: simulationResult.confidenceChange,
                newOffers: generatedOffers,
                playerMatchResult: simulationResult.playerMatchResult,
                updatedCups: cupResult.updatedCups,
                updatedScoutedPlayerIds: simulationResult.updatedScoutedPlayerIds,
                coachReport,
                cinematicEvents: celebrationCinematics
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
