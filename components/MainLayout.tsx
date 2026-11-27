import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { FullScreenMatchSimulation } from './gameflow/FullScreenMatchSimulation';
import { Header } from './ui/Header';
import { BottomNav } from './ui/BottomNav';
import { ScreenBackdrop } from './ui/ScreenBackdrop';
import { Vote } from 'lucide-react';
import { useGameStore } from '../state/gameStore';
import { useTeamSlice, useCalendarSlice, useFinancesSlice } from '../state/selectors';
import { useSimulation } from '../hooks/useSimulation';
import { useNotification } from '../contexts/NotificationContext';

// Core home screen kept static for zero-latency initial load
import { Dashboard } from './screens/Dashboard';

// Secondary screens lazy loaded on-demand
const SquadScreen = React.lazy(() => import('./screens/SquadScreen').then(m => ({ default: m.SquadScreen })));
const TransfersScreen = React.lazy(() => import('./screens/TransfersScreen').then(m => ({ default: m.TransfersScreen })));
const LeagueScreen = React.lazy(() => import('./screens/LeagueScreen').then(m => ({ default: m.LeagueScreen })));
const StaffScreen = React.lazy(() => import('./screens/StaffScreen').then(m => ({ default: m.StaffScreen })));
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
import { motion } from 'framer-motion';

interface MainLayoutProps {
    onWeekComplete: () => void;
    onSaveGame: (mode: 'overwrite' | 'new') => void;
    onQuickSave?: () => Promise<boolean>;
    onQuitToMenu: (skipConfirm?: boolean) => void;
    onNewGame?: () => void;
    onElectionComplete: () => void;
    onStartNewSeason?: () => void;
    onOpenSeasonEndModal?: () => void;
}

const ActiveScreenContent: React.FC<{
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
    onPlayMatch: () => void;
    onWeekComplete: () => void;
    onSaveGame: (mode: 'overwrite' | 'new') => void;
    onQuickSave?: () => Promise<boolean>;
    onQuitToMenu: (skipConfirm?: boolean) => void;
    onStartNewSeason?: () => void;
    onOpenSeasonEndModal?: () => void;
}> = React.memo(({
    activeScreen,
    setActiveScreen,
    onPlayMatch,
    onWeekComplete,
    onSaveGame,
    onQuickSave,
    onQuitToMenu,
    onStartNewSeason,
    onOpenSeasonEndModal
}) => {
    const gameState = useGameStore(s => s.gameState);
    const dispatch = useGameStore(s => s.dispatch);
    const matchPhase = useGameStore(s => s.matchPhase);
    const pendingResults = useGameStore(s => s.pendingResults);
    const isSimulating = useGameStore(s => s.isSimulating);
    const currentSaveName = useGameStore(s => s.currentSaveName);
    const lastSaved = useGameStore(s => s.lastSaved);
    const { preferredCurrency } = useFinancesSlice();

    if (!gameState) return null;

    switch (activeScreen) {
        case Screen.Dashboard:
            return (
                <Dashboard
                    gameState={gameState}
                    onPlayMatch={onPlayMatch}
                    matchPhase={matchPhase}
                    pendingResults={pendingResults}
                    onWeekComplete={onWeekComplete}
                    dispatch={dispatch}
                    isSimulating={isSimulating}
                    onStartNewSeason={onStartNewSeason}
                    onOpenSeasonEndModal={onOpenSeasonEndModal}
                />
            );
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
                gameState={gameState}
                onSaveGame={onSaveGame}
                onQuickSave={onQuickSave}
                onQuitToMenu={onQuitToMenu}
                currentSaveName={currentSaveName}
                lastSaved={lastSaved}
                preferredCurrency={preferredCurrency}
                preferredLanguage={gameState.preferredLanguage || 'es'}
                dispatch={dispatch}
            />
        );
        case Screen.Club: return <ClubHubScreen gameState={gameState} dispatch={dispatch} onNavigate={setActiveScreen} />;
        case Screen.Trophies: return <TrophyRoomScreen gameState={gameState} onNavigate={setActiveScreen} />;
        case Screen.Profile: return <ProfileScreen gameState={gameState} dispatch={dispatch} />;
        default:
            return (
                <Dashboard
                    gameState={gameState}
                    onPlayMatch={onPlayMatch}
                    matchPhase={matchPhase}
                    pendingResults={pendingResults}
                    onWeekComplete={onWeekComplete}
                    dispatch={dispatch}
                    isSimulating={isSimulating}
                    onStartNewSeason={onStartNewSeason}
                    onOpenSeasonEndModal={onOpenSeasonEndModal}
                />
            );
    }
});

const LiveMatchSlot: React.FC<{ onWeekComplete: () => void }> = ({ onWeekComplete }) => {
    const gameState = useGameStore(s => s.gameState);
    const pendingResults = useGameStore(s => s.pendingResults);
    const dispatch = useGameStore(s => s.dispatch);
    if (!gameState || !pendingResults) return null;
    return (
        <FullScreenMatchSimulation
            gameState={gameState}
            pendingResults={pendingResults}
            onMatchComplete={onWeekComplete}
            dispatch={dispatch}
        />
    );
};

const ElectionModalSlot: React.FC<{
    onElectionComplete: () => void;
    onClose: () => void;
    onQuitToMenu: (skipConfirm?: boolean) => void;
    onNewGame?: () => void;
}> = ({ onElectionComplete, onClose, onQuitToMenu, onNewGame }) => {
    const gameState = useGameStore(s => s.gameState);
    const dispatch = useGameStore(s => s.dispatch);
    if (!gameState) return null;
    return (
        <ElectionScreen
            gameState={gameState}
            dispatch={dispatch}
            onElectionComplete={onElectionComplete}
            onClose={onClose}
            onQuitToMenu={onQuitToMenu}
            onNewGame={onNewGame}
        />
    );
};

export const MainLayout: React.FC<MainLayoutProps> = ({
    onWeekComplete,
    onSaveGame,
    onQuickSave,
    onQuitToMenu,
    onNewGame,
    onElectionComplete,
    onStartNewSeason,
    onOpenSeasonEndModal
}) => {
    // Atomic domain slices (MainLayout NEVER subscribes to full `s => s.gameState`)
    const { team, primaryColor } = useTeamSlice();
    const { season, mandate } = useCalendarSlice();
    const activeScreen = useGameStore(s => s.activeScreen);
    const setActiveScreen = useGameStore(s => s.setActiveScreen);

    const { showNotification } = useNotification();
    const { matchPhase, pendingResults, handlePlayMatch } = useSimulation(showNotification);

    const [isElectionOpen, setIsElectionOpen] = useState(true);

    // Automatically re-open election screen whenever an election year begins or season changes
    useEffect(() => {
        if (mandate?.isElectionYear) {
            setIsElectionOpen(true);
        }
    }, [mandate?.isElectionYear, season]);

    const isLiveMatch = matchPhase === 'LIVE' && !!pendingResults?.playerMatchResult;

    // Club identity color drives ambient glows; very dark/unknown colors fall back to brand blue.
    const clubColor = React.useMemo(() => {
        const hex = (primaryColor || '').replace('#', '');
        if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#3D7BFF';
        const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        return luminance < 0.12 ? '#3D7BFF' : `#${hex}`;
    }, [primaryColor]);

    return (
        <div className="min-h-screen font-sans relative" style={{ background: 'var(--apex-darker)', color: 'var(--apex-text)', ['--club-color' as any]: clubColor }}>
            {!isLiveMatch && <ScreenBackdrop screen={activeScreen} />}

            {/* Fullscreen Match Simulation Overlay */}
            {isLiveMatch && <LiveMatchSlot onWeekComplete={onWeekComplete} />}

            {/* Fullscreen Presidential Mandate & Election Overlay */}
            {mandate?.isElectionYear && isElectionOpen && matchPhase === 'PRE' && (
                <ElectionModalSlot
                    onElectionComplete={onElectionComplete}
                    onClose={() => setIsElectionOpen(false)}
                    onQuitToMenu={onQuitToMenu}
                    onNewGame={onNewGame}
                />
            )}

            {/* Regular Layout - Hidden during Fullscreen Live Match Simulation */}
            {!isLiveMatch && (
                <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen relative z-10 transition-all duration-300">
                    {/* Sticky Banner when Election Screen is minimized/closed to review the club */}
                    {mandate?.isElectionYear && !isElectionOpen && (
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
                    <Header onNavigate={setActiveScreen} />
                    <main className="pb-24 overflow-x-hidden min-h-[calc(100vh-140px)]">
                        <motion.div
                            key={activeScreen}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            <React.Suspense fallback={<div className="flex items-center justify-center py-20"><LoadingSpinner /></div>}>
                                <ActiveScreenContent
                                    activeScreen={activeScreen}
                                    setActiveScreen={setActiveScreen}
                                    onPlayMatch={handlePlayMatch}
                                    onWeekComplete={onWeekComplete}
                                    onSaveGame={onSaveGame}
                                    onQuickSave={onQuickSave}
                                    onQuitToMenu={onQuitToMenu}
                                    onStartNewSeason={onStartNewSeason}
                                    onOpenSeasonEndModal={onOpenSeasonEndModal}
                                />
                            </React.Suspense>
                        </motion.div>
                    </main>
                    {team && (
                        <BottomNav
                            activeScreen={activeScreen}
                            onNavigate={setActiveScreen}
                            team={team}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
