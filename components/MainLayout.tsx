import React from 'react';
import { GameState, Screen, PlayerProfile, Team, MatchPhase, PendingSimulationResults, Player } from '../types';
import { FullScreenMatchSimulation } from './gameflow/FullScreenMatchSimulation';
import { GameAction } from '../state/reducer';
import { Header } from './ui/Header';
import { BottomNav } from './ui/BottomNav';

// Core screens imported statically for zero-latency instant tab switching
import { Dashboard } from './screens/Dashboard';
import { SquadScreen } from './screens/SquadScreen';
import { TransfersScreen } from './screens/TransfersScreen';
import { LeagueScreen } from './screens/LeagueScreen';
import { StaffScreen } from './screens/StaffScreen';

// Secondary screens lazy loaded on-demand
const FinancesScreen = React.lazy(() => import('./screens/FinancesScreen').then(m => ({ default: m.FinancesScreen })));
const CalendarScreen = React.lazy(() => import('./screens/CalendarScreen').then(m => ({ default: m.CalendarScreen })));
const StatisticsScreen = React.lazy(() => import('./screens/StatisticsScreen').then(m => ({ default: m.StatisticsScreen })));
const SettingsScreen = React.lazy(() => import('./screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const StadiumScreen = React.lazy(() => import('./screens/StadiumScreen').then(m => ({ default: m.StadiumScreen })));
const SponsorshipScreen = React.lazy(() => import('./screens/SponsorshipScreen').then(m => ({ default: m.SponsorshipScreen })));
const ElectionScreen = React.lazy(() => import('./screens/ElectionScreen').then(m => ({ default: m.ElectionScreen })));
const ClubHubScreen = React.lazy(() => import('./screens/ClubHubScreen').then(m => ({ default: m.ClubHubScreen })));
const TrophyRoomScreen = React.lazy(() => import('./screens/TrophyRoomScreen').then(m => ({ default: m.TrophyRoomScreen })));

import { LoadingSpinner } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

interface MainLayoutProps {
    gameState: GameState;
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
    matchPhase: MatchPhase;
    pendingResults: PendingSimulationResults | null;
    onPlayMatch: () => void;
    onWeekComplete: () => void;
    allPlayers: Player[];
    dispatch: React.Dispatch<GameAction>;
    onSaveGame: (mode: 'overwrite' | 'new') => void;
    onQuitToMenu: () => void;
    currentSaveName: string | null;
    lastSaved: Date | null;
    onElectionComplete: () => void;
    isSimulating?: boolean;
    onStartNewSeason?: () => void;
    onOpenSeasonEndModal?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    gameState,
    activeScreen,
    setActiveScreen,
    matchPhase,
    pendingResults,
    onPlayMatch,
    onWeekComplete,
    allPlayers,
    dispatch,
    onSaveGame,
    onQuitToMenu,
    currentSaveName,
    lastSaved,
    onElectionComplete,
    isSimulating,
    onStartNewSeason,
    onOpenSeasonEndModal
}) => {
    const renderContent = () => {
        switch (activeScreen) {
            case Screen.Dashboard:
                return <Dashboard
                    gameState={gameState}
                    onPlayMatch={onPlayMatch}
                    matchPhase={matchPhase}
                    pendingResults={pendingResults}
                    onWeekComplete={onWeekComplete}
                    allPlayers={allPlayers}
                    dispatch={dispatch}
                    isSimulating={isSimulating}
                    onStartNewSeason={onStartNewSeason}
                    onOpenSeasonEndModal={onOpenSeasonEndModal}
                />;
            case Screen.Squad: return <SquadScreen gameState={gameState} dispatch={dispatch} />;
            case Screen.Transfers: return <TransfersScreen gameState={gameState} dispatch={dispatch} />;
            case Screen.Finances: return <FinancesScreen gameState={gameState} dispatch={dispatch} />;
            case Screen.League: return <LeagueScreen gameState={gameState} />;
            case Screen.Calendar: return <CalendarScreen gameState={gameState} />;
            case Screen.Statistics: return <StatisticsScreen gameState={gameState} />;
            case Screen.Stadium:
                return <StadiumScreen gameState={gameState} dispatch={dispatch} />;
            case Screen.Sponsorships:
                return <SponsorshipScreen gameState={gameState} dispatch={dispatch} />;
            case Screen.Staff:
                return <StaffScreen gameState={gameState} dispatch={dispatch} />;
            case Screen.Settings: return (
                <SettingsScreen
                    onSaveGame={onSaveGame}
                    onQuitToMenu={onQuitToMenu}
                    currentSaveName={currentSaveName}
                    lastSaved={lastSaved}
                    preferredCurrency={gameState.preferredCurrency || 'EUR'}
                    dispatch={dispatch}
                />
            );
            case Screen.Club: return <ClubHubScreen gameState={gameState} dispatch={dispatch} />;
            case Screen.Trophies: return <TrophyRoomScreen gameState={gameState} />;
            default: return <Dashboard gameState={gameState} onPlayMatch={onPlayMatch} matchPhase={matchPhase} pendingResults={pendingResults} onWeekComplete={onWeekComplete} allPlayers={allPlayers} dispatch={dispatch} isSimulating={isSimulating} onStartNewSeason={onStartNewSeason} onOpenSeasonEndModal={onOpenSeasonEndModal} />;
        }
    };

    const isLiveMatch = matchPhase === 'LIVE' && !!pendingResults?.playerMatchResult;

    return (
        <div className="min-h-screen font-sans relative" style={{ background: 'var(--apex-darker)', color: 'var(--apex-text)' }}>
            {/* Fullscreen Match Simulation Overlay */}
            {isLiveMatch && pendingResults && (
                <FullScreenMatchSimulation
                    gameState={gameState}
                    pendingResults={pendingResults}
                    onMatchComplete={onWeekComplete}
                />
            )}

            {/* Election Screen Overlay */}
            {gameState.mandate?.isElectionYear && matchPhase === 'PRE' && (
                <ElectionScreen
                    gameState={gameState}
                    dispatch={dispatch}
                    onElectionComplete={onElectionComplete}
                />
            )}

            {/* Regular Layout - Hidden during Fullscreen Live Match Simulation */}
            {!isLiveMatch && (
                <div className="max-w-md mx-auto min-h-screen relative shadow-2xl" style={{ background: 'var(--apex-dark)' }}>
                    <Header gameState={gameState} />
                    <main className="pb-24 overflow-x-hidden">
                        <AnimatePresence mode="popLayout" initial={false}>
                            <motion.div
                                key={activeScreen}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.12, ease: 'easeOut' }}
                            >
                                <React.Suspense fallback={<div className="flex items-center justify-center py-20"><LoadingSpinner /></div>}>
                                    {renderContent()}
                                </React.Suspense>
                            </motion.div>
                        </AnimatePresence>
                    </main>
                    <BottomNav
                        activeScreen={activeScreen}
                        onNavigate={setActiveScreen}
                        team={gameState.team}
                    />
                </div>
            )}
        </div>
    );
};
