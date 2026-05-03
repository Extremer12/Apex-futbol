import React from 'react';
import { GameState, Screen, PlayerProfile, Team } from '../types';
import { GameAction } from '../state/reducer';
import { Header } from './ui/Header';
import { BottomNav } from './ui/BottomNav';
const Dashboard = React.lazy(() => import('./screens/Dashboard').then(m => ({ default: m.Dashboard })));
const SquadScreen = React.lazy(() => import('./screens/SquadScreen').then(m => ({ default: m.SquadScreen })));
const TransfersScreen = React.lazy(() => import('./screens/TransfersScreen').then(m => ({ default: m.TransfersScreen })));
const FinancesScreen = React.lazy(() => import('./screens/FinancesScreen').then(m => ({ default: m.FinancesScreen })));
const LeagueScreen = React.lazy(() => import('./screens/LeagueScreen').then(m => ({ default: m.LeagueScreen })));
const CalendarScreen = React.lazy(() => import('./screens/CalendarScreen').then(m => ({ default: m.CalendarScreen })));
const StatisticsScreen = React.lazy(() => import('./screens/StatisticsScreen').then(m => ({ default: m.StatisticsScreen })));
const SettingsScreen = React.lazy(() => import('./screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const StadiumScreen = React.lazy(() => import('./screens/StadiumScreen').then(m => ({ default: m.StadiumScreen })));
const SponsorshipScreen = React.lazy(() => import('./screens/SponsorshipScreen').then(m => ({ default: m.SponsorshipScreen })));
const ElectionScreen = React.lazy(() => import('./screens/ElectionScreen').then(m => ({ default: m.ElectionScreen })));
import { StaffScreen } from './screens/StaffScreen';
const ClubHubScreen = React.lazy(() => import('./screens/ClubHubScreen').then(m => ({ default: m.ClubHubScreen })));
const TrophyRoomScreen = React.lazy(() => import('./screens/TrophyRoomScreen').then(m => ({ default: m.TrophyRoomScreen })));

import { LoadingSpinner } from './icons';
import { MatchPhase } from '../types';

interface PendingSimulationResults {
    newsToAdd: any[];
    updatedSchedule: any[];
    updatedLeagueTables: Record<string, any[]>;
    updatedAllTeams: Team[];
    confidenceChange: number;
    newOffers: any[];
    playerMatchResult: { homeScore: number; awayScore: number, penalties?: { home: number, away: number }, events?: string[] } | null;
    updatedCups?: { faCup: any, carabaoCup: any };
}

interface MainLayoutProps {
    gameState: GameState;
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
    matchPhase: MatchPhase;
    pendingResults: PendingSimulationResults | null;
    onPlayMatch: () => void;
    onWeekComplete: () => void;
    allPlayers: any[];
    dispatch: React.Dispatch<GameAction>;
    onSaveGame: (mode: 'overwrite' | 'new') => void;
    onQuitToMenu: () => void;
    currentSaveName: string | null;
    lastSaved: Date | null;
    onElectionComplete: () => void;
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
    onElectionComplete
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
            default: return <Dashboard gameState={gameState} onPlayMatch={onPlayMatch} matchPhase={matchPhase} pendingResults={pendingResults} onWeekComplete={onWeekComplete} allPlayers={allPlayers} dispatch={dispatch} />;
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200 font-sans relative">
            {/* Election Screen Overlay */}
            {gameState.mandate?.isElectionYear && matchPhase === 'PRE' && (
                <ElectionScreen
                    gameState={gameState}
                    dispatch={dispatch}
                    onElectionComplete={onElectionComplete}
                />
            )}

            <div className="max-w-7xl mx-auto">
                <Header gameState={gameState} />
                <main className="pb-24">
                    <div key={activeScreen} className="content-fade-in">
                        <React.Suspense fallback={<div className="flex items-center justify-center py-20"><LoadingSpinner /></div>}>
                            {renderContent()}
                        </React.Suspense>
                    </div>
                </main>
                <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
            </div>
        </div>
    );
};
