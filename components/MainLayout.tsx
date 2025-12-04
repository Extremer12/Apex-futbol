import React from 'react';
import { GameState, Screen, PlayerProfile, Team } from '../types';
import { GameAction } from '../state/reducer';
import { Header } from './ui/Header';
import { BottomNav } from './ui/BottomNav';
import { Dashboard } from './screens/Dashboard';
import { SquadScreen } from './screens/SquadScreen';
import { TransfersScreen } from './screens/TransfersScreen';
import { FinancesScreen } from './screens/FinancesScreen';
import { LeagueScreen } from './screens/LeagueScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { StatisticsScreen } from './screens/StatisticsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StaffScreen } from './screens/StaffScreen';
import { ElectionScreen } from './screens/ElectionScreen';
import { MatchPhase } from '../App';

interface PendingSimulationResults {
    newsToAdd: any[];
    updatedSchedule: any[];
    updatedLeagueTable: any[];
    updatedChampionshipTable: any[];
    updatedAllTeams: Team[];
    confidenceChange: number;
    newOffers: any[];
    playerMatchResult: { homeScore: number; awayScore: number, penalties?: { home: number, away: number } } | null;
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
            case Screen.Staff: return <StaffScreen gameState={gameState} dispatch={dispatch} />;
            case Screen.Settings: return (
                <SettingsScreen
                    onSaveGame={onSaveGame}
                    onQuitToMenu={onQuitToMenu}
                    currentSaveName={currentSaveName}
                    lastSaved={lastSaved}
                />
            );
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
                        {renderContent()}
                    </div>
                </main>
                <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
            </div>
        </div>
    );
};
