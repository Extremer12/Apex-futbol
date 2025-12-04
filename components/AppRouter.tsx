import React from 'react';
import { PlayerProfile, Team } from '../types';
import { ElectionResponse } from '../services/gameLogic';
import { StartScreen } from './gameflow/StartScreen';
import { LoadGameScreen } from './gameflow/LoadGameScreen';
import { GameOverScreen } from './gameflow/GameOverScreen';
import { ProfileCreation } from './gameflow/ProfileCreation';
import { TeamSelection } from './gameflow/TeamSelection';
import { ElectionPitch } from './gameflow/ElectionPitch';
import { ElectionResult } from './gameflow/ElectionResult';
import { LoadingSpinner } from './icons';

export type AppState = 'START_SCREEN' | 'LOAD_GAME' | 'PROFILE_CREATION' | 'TEAM_SELECTION' | 'ELECTION_PITCH' | 'ELECTION_RESULT' | 'GAME_ACTIVE' | 'GAME_OVER';

interface AppRouterProps {
    appState: AppState;
    playerProfile: PlayerProfile | null;
    selectedTeam: Team | null;
    electionResult: ElectionResponse | null;
    onNewGame: () => void;
    onLoadGameScreen: () => void;
    onLoadGame: (id: string) => Promise<void>;
    onProfileCreate: (profile: PlayerProfile) => void;
    onTeamSelect: (team: Team) => void;
    onPitchSubmit: (debateSummary: string) => Promise<void>;
    onStartGame: () => void;
    onRetryElection: () => void;
    children?: React.ReactNode;
}

export const AppRouter: React.FC<AppRouterProps> = ({
    appState,
    playerProfile,
    selectedTeam,
    electionResult,
    onNewGame,
    onLoadGameScreen,
    onLoadGame,
    onProfileCreate,
    onTeamSelect,
    onPitchSubmit,
    onStartGame,
    onRetryElection,
    children
}) => {
    switch (appState) {
        case 'START_SCREEN':
            return <StartScreen onNewGame={onNewGame} onLoadGameScreen={onLoadGameScreen} />;

        case 'LOAD_GAME':
            return <LoadGameScreen onLoadGame={onLoadGame} onBack={() => onLoadGameScreen()} />;

        case 'GAME_OVER':
            return <GameOverScreen onNewGame={onNewGame} />;

        case 'PROFILE_CREATION':
            return <ProfileCreation onProfileCreate={onProfileCreate} />;

        case 'TEAM_SELECTION':
            if (!playerProfile) {
                return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><LoadingSpinner /></div>;
            }
            return <TeamSelection player={playerProfile} onSelectTeam={onTeamSelect} />;

        case 'ELECTION_PITCH':
            if (!selectedTeam || !playerProfile) {
                return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><LoadingSpinner /></div>;
            }
            return <ElectionPitch team={selectedTeam} player={playerProfile} onSubmitPitch={onPitchSubmit} onBack={onRetryElection} isLoading={appState === 'ELECTION_RESULT'} />;

        case 'ELECTION_RESULT':
            if (!electionResult) {
                return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><LoadingSpinner /></div>;
            }
            return <ElectionResult result={electionResult} onContinue={onStartGame} onRetry={onRetryElection} />;

        case 'GAME_ACTIVE':
            return <>{children}</>;

        default:
            return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><LoadingSpinner /></div>;
    }
};
