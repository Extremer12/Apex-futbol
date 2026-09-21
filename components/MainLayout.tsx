import React, { useState, useEffect } from 'react';
import { GameState, Screen, PlayerProfile, Team, MatchPhase, PendingSimulationResults, Player } from '../types';
import { FullScreenMatchSimulation } from './gameflow/FullScreenMatchSimulation';
import { GameAction } from '../state/reducer';
import { Header } from './ui/Header';
import { BottomNav } from './ui/BottomNav';
import { Vote } from 'lucide-react';

// Core home screen kept static for zero-latency initial load
import { Dashboard } from './screens/Dashboard';

// Secondary screens lazy loaded on-demand
const SquadScreen = React.lazy(() => import('./screens/SquadScreen').then(m => ({ default: m.SquadScreen })));
const TransfersScreen = React.lazy(() => import('./screens/TransfersScreen').then(m => ({ default: m.TransfersScreen })));
const LeagueScreen = React.lazy(() => import('./screens/LeagueScreen').then(m => ({ default: m.LeagueScreen })));
const StaffScreen = React.lazy(() => import('./screens/StaffScreen').then(m => ({ default: m.StaffScreen })));

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
const ProfileScreen = React.lazy(() => import('./screens/ProfileScreen').then(m => ({ default: m.ProfileScreen })));

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
    dispatch: React.Dispatch<GameAction>;
    onSaveGame: (mode: 'overwrite' | 'new') => void;
    onQuitToMenu: () => void;
    onNewGame?: () => void;
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
    dispatch,
    onSaveGame,
    onQuitToMenu,
    onNewGame,
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
                return <StadiumScreen gameState={gameState} dispatch={dispatch} onNavigate={setActiveScreen} />;
            case Screen.Sponsorships:
                return <SponsorshipScreen gameState={gameState} dispatch={dispatch} onNavigate={setActiveScreen} />;
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
            case Screen.Club: return <ClubHubScreen gameState={gameState} dispatch={dispatch} onNavigate={setActiveScreen} />;
            case Screen.Trophies: return <TrophyRoomScreen gameState={gameState} onNavigate={setActiveScreen} />;
            case Screen.Profile: return <ProfileScreen gameState={gameState} dispatch={dispatch} />;
            default: return <Dashboard gameState={gameState} onPlayMatch={onPlayMatch} matchPhase={matchPhase} pendingResults={pendingResults} onWeekComplete={onWeekComplete} dispatch={dispatch} isSimulating={isSimulating} onStartNewSeason={onStartNewSeason} onOpenSeasonEndModal={onOpenSeasonEndModal} />;
        }
    };

    const [isElectionOpen, setIsElectionOpen] = useState(true);

    // Automatically re-open election screen whenever an election year begins or season changes
    useEffect(() => {
        if (gameState.mandate?.isElectionYear) {
            setIsElectionOpen(true);
        }
    }, [gameState.mandate?.isElectionYear, gameState.season]);

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

            {/* Fullscreen Presidential Mandate & Election Overlay */}
            {gameState.mandate?.isElectionYear && isElectionOpen && matchPhase === 'PRE' && (
                <ElectionScreen
                    gameState={gameState}
                    dispatch={dispatch}
                    onElectionComplete={onElectionComplete}
                    onClose={() => setIsElectionOpen(false)}
                    onQuitToMenu={onQuitToMenu}
                    onNewGame={onNewGame}
                />
            )}

            {/* Regular Layout - Hidden during Fullscreen Live Match Simulation */}
            {!isLiveMatch && (
                <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto min-h-screen relative shadow-2xl transition-all duration-300" style={{ background: 'var(--apex-dark)' }}>
                    {/* Sticky Banner when Election Screen is minimized/closed to review the club */}
                    {gameState.mandate?.isElectionYear && !isElectionOpen && (
                        <div className="sticky top-0 z-30 bg-gradient-to-r from-amber-600/30 via-slate-900/90 to-amber-600/30 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between backdrop-blur-md shadow-lg">
                            <div className="flex items-center gap-2.5">
                                <Vote className="w-4 h-4 text-amber-400 animate-pulse" />
                                <div>
                                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">Comicios Presidenciales Pendientes</span>
                                    <span className="text-[11px] text-slate-300">Tu mandato de 4 años ha concluido. Los socios esperan la votación.</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsElectionOpen(true)}
                                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-lg uppercase tracking-wider transition-all shadow-md hover:scale-105 cursor-pointer flex items-center gap-1.5"
                            >
                                <Vote className="w-3.5 h-3.5" />
                                <span>Celebrar Elecciones</span>
                            </button>
                        </div>
                    )}
                    <Header gameState={gameState} onNavigate={setActiveScreen} />
                    <main className="pb-24 overflow-x-hidden min-h-[calc(100vh-140px)]">
                        <AnimatePresence mode="wait" initial={false}>
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
