import React, { Suspense } from 'react';
import { PlayerProfile, Team, GameState } from '../types';
import { ElectionResponse } from '../services/gameLogic';
import { StartScreen } from './gameflow/StartScreen';
import { GameOverScreen } from './gameflow/GameOverScreen';
import { LoadingSpinner } from './icons';
import { ElectoralPromise } from '../types';
import { StartupScreenContainer } from './gameflow/StartupScreenContainer';

// Lazy load secondary flow screens to minimize main bundle
const LoadGameScreen = React.lazy(() => import('./gameflow/LoadGameScreen').then(m => ({ default: m.LoadGameScreen })));
const ProfileCreation = React.lazy(() => import('./gameflow/ProfileCreation').then(m => ({ default: m.ProfileCreation })));
const TeamSelection = React.lazy(() => import('./gameflow/TeamSelection').then(m => ({ default: m.TeamSelection })));
const ElectionPitch = React.lazy(() => import('./gameflow/ElectionPitch').then(m => ({ default: m.ElectionPitch })));
const ElectionResult = React.lazy(() => import('./gameflow/ElectionResult').then(m => ({ default: m.ElectionResult })));
const PromiseSelection = React.lazy(() => import('./gameflow/PromiseSelection').then(m => ({ default: m.PromiseSelection })));

const FlowLoadingFallback = () => (
    <StartupScreenContainer>
        <div className="flex flex-col items-center gap-4">
            <LoadingSpinner />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Cargando...</p>
        </div>
    </StartupScreenContainer>
);

export type AppState = 'START_SCREEN' | 'LOAD_GAME' | 'PROFILE_CREATION' | 'TEAM_SELECTION' | 'ELECTION_PITCH' | 'ELECTION_RESULT' | 'PROMISE_SELECTION' | 'GAME_ACTIVE' | 'GAME_OVER';

interface AppRouterProps {
    appState: AppState;
    gameState?: GameState | null;
    playerProfile: PlayerProfile | null;
    selectedTeam: Team | null;
    electionResult: ElectionResponse | null;
    onNewGame: () => void;
    onLoadGameScreen: () => void;
    onBackToStart?: () => void;
    onLoadGame: (id: string, isCloud?: boolean) => Promise<void> | void;
    onProfileCreate: (profile: PlayerProfile) => void;
    onTeamSelect: (team: Team) => void;
    onPitchSubmit: (debateSummary: string) => Promise<void>;
    onPromisesSubmit: (promises: ElectoralPromise[]) => void;
    onStartGame: () => void;
    onRetryElection: () => void;
    children?: React.ReactNode;
}

export const AppRouter: React.FC<AppRouterProps> = ({
    appState,
    gameState,
    playerProfile,
    selectedTeam,
    electionResult,
    onNewGame,
    onLoadGameScreen,
    onBackToStart,
    onLoadGame,
    onProfileCreate,
    onTeamSelect,
    onPitchSubmit,
    onPromisesSubmit,
    onStartGame,
    onRetryElection,
    children
}) => {
    const renderContent = () => {
        switch (appState) {
            case 'START_SCREEN':
                return <StartScreen onNewGame={onNewGame} onLoadGameScreen={onLoadGameScreen} />;

            case 'LOAD_GAME':
                return <LoadGameScreen onLoadGame={onLoadGame} onBack={onBackToStart || (() => onNewGame())} />;

            case 'GAME_OVER':
                return (
                    <GameOverScreen 
                        gameState={gameState} 
                        playerProfile={playerProfile} 
                        onNewGame={onNewGame} 
                        onBackToMenu={onBackToStart} 
                    />
                );

            case 'PROFILE_CREATION':
                return <ProfileCreation onProfileCreate={onProfileCreate} />;

            case 'TEAM_SELECTION':
                if (!playerProfile) {
                    return (
                        <StartupScreenContainer>
                            <div className="flex flex-col items-center gap-4">
                                <LoadingSpinner />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Cargando perfil...</p>
                            </div>
                        </StartupScreenContainer>
                    );
                }
                return <TeamSelection player={playerProfile} onSelectTeam={onTeamSelect} />;

            case 'ELECTION_PITCH':
                if (!selectedTeam || !playerProfile) {
                    return (
                        <StartupScreenContainer>
                            <div className="flex flex-col items-center gap-4">
                                <LoadingSpinner />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Cargando debate...</p>
                            </div>
                        </StartupScreenContainer>
                    );
                }
                return (
                    <ElectionPitch 
                        team={selectedTeam} 
                        player={playerProfile} 
                        onSubmitPitch={onPitchSubmit} 
                        onBack={onRetryElection} 
                        isLoading={appState === 'ELECTION_RESULT'} 
                    />
                );

            case 'ELECTION_RESULT':
                if (!electionResult) {
                    return (
                        <StartupScreenContainer>
                            <div className="flex flex-col items-center gap-4">
                                <LoadingSpinner />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Contando votos...</p>
                            </div>
                        </StartupScreenContainer>
                    );
                }
                return <ElectionResult result={electionResult} onContinue={onStartGame} onRetry={onRetryElection} />;

            case 'PROMISE_SELECTION':
                if (!selectedTeam) {
                    return (
                        <StartupScreenContainer>
                            <div className="flex flex-col items-center gap-4">
                                <LoadingSpinner />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Cargando promesas...</p>
                            </div>
                        </StartupScreenContainer>
                    );
                }
                return <PromiseSelection team={selectedTeam} onSelectionComplete={onPromisesSubmit} />;

            case 'GAME_ACTIVE':
                return <>{children}</>;

            default:
                return (
                    <StartupScreenContainer>
                        <div className="flex flex-col items-center gap-4">
                            <LoadingSpinner />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Cargando Apex Football...</p>
                        </div>
                    </StartupScreenContainer>
                );
        }
    };

    return (
        <Suspense fallback={<FlowLoadingFallback />}>
            {renderContent()}
        </Suspense>
    );
};
