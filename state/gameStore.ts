import { create } from 'zustand';
import { GameState, PlayerProfile, Team, Screen, MatchPhase, PendingSimulationResults } from '../types';
import { gameReducer, initialState, GameAction } from './reducer';
import { ElectionResponse } from '../services/gameLogic';
import { TriggeredEvent } from '../services/eventEngine';

export type AppStateType = 
    | 'START_SCREEN' 
    | 'LOAD_GAME' 
    | 'PROFILE_CREATION' 
    | 'TEAM_SELECTION' 
    | 'ELECTION_PITCH' 
    | 'ELECTION_RESULT' 
    | 'PROMISE_SELECTION' 
    | 'GAME_ACTIVE' 
    | 'GAME_OVER';

export interface GameStoreState {
    // App lifecycle state
    appState: AppStateType;
    playerProfile: PlayerProfile | null;
    selectedTeam: Team | null;
    electionResult: ElectionResponse | null;
    activeScreen: Screen;

    // Core Game State
    gameState: GameState;

    // Simulation state
    matchPhase: MatchPhase;
    pendingResults: PendingSimulationResults | null;
    isSimulating: boolean;

    // Events & Modals state
    currentEvent: TriggeredEvent | null;
    isSeasonEndModalOpen: boolean;
    isStartingSeason: boolean;

    // Save info
    currentSaveId: string | null;
    currentSaveName: string | null;
    lastSaved: Date | null;
    isSaving: boolean;

    // Actions
    dispatch: (action: GameAction) => void;
    setAppState: (state: AppStateType) => void;
    setActiveScreen: (screen: Screen) => void;
    setPlayerProfile: (profile: PlayerProfile | null) => void;
    setSelectedTeam: (team: Team | null) => void;
    setElectionResult: (result: ElectionResponse | null) => void;
    setMatchPhase: (phase: MatchPhase) => void;
    setPendingResults: (results: PendingSimulationResults | null) => void;
    setIsSimulating: (isSimulating: boolean) => void;
    setCurrentEvent: (event: TriggeredEvent | null) => void;
    setIsSeasonEndModalOpen: (isOpen: boolean) => void;
    setIsStartingSeason: (isStarting: boolean) => void;
    setSaveState: (info: {
        currentSaveId?: string | null;
        currentSaveName?: string | null;
        lastSaved?: Date | null;
        isSaving?: boolean;
    }) => void;
    resetGameData: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
    appState: 'START_SCREEN',
    playerProfile: null,
    selectedTeam: null,
    electionResult: null,
    activeScreen: Screen.Dashboard,

    gameState: initialState,

    matchPhase: 'PRE',
    pendingResults: null,
    isSimulating: false,

    currentEvent: null,
    isSeasonEndModalOpen: false,
    isStartingSeason: false,

    currentSaveId: null,
    currentSaveName: null,
    lastSaved: null,
    isSaving: false,

    dispatch: (action: GameAction) => {
        set(state => ({
            gameState: gameReducer(state.gameState, action)
        }));
    },

    setAppState: (appState) => set({ appState }),
    setActiveScreen: (activeScreen) => set({ activeScreen }),
    setPlayerProfile: (playerProfile) => set({ playerProfile }),
    setSelectedTeam: (selectedTeam) => set({ selectedTeam }),
    setElectionResult: (electionResult) => set({ electionResult }),
    setMatchPhase: (matchPhase) => set({ matchPhase }),
    setPendingResults: (pendingResults) => set({ pendingResults }),
    setIsSimulating: (isSimulating) => set({ isSimulating }),
    setCurrentEvent: (currentEvent) => set({ currentEvent }),
    setIsSeasonEndModalOpen: (isSeasonEndModalOpen) => set({ isSeasonEndModalOpen }),
    setIsStartingSeason: (isStartingSeason) => set({ isStartingSeason }),

    setSaveState: (info) => set(state => ({
        currentSaveId: info.currentSaveId !== undefined ? info.currentSaveId : state.currentSaveId,
        currentSaveName: info.currentSaveName !== undefined ? info.currentSaveName : state.currentSaveName,
        lastSaved: info.lastSaved !== undefined ? info.lastSaved : state.lastSaved,
        isSaving: info.isSaving !== undefined ? info.isSaving : state.isSaving,
    })),

    resetGameData: () => {
        get().dispatch({ type: 'RESET_GAME' });
        set({
            playerProfile: null,
            selectedTeam: null,
            electionResult: null,
            activeScreen: Screen.Dashboard,
            currentSaveId: null,
            currentSaveName: null,
            lastSaved: null,
            matchPhase: 'PRE',
            pendingResults: null,
            currentEvent: null,
            isSeasonEndModalOpen: false,
            isStartingSeason: false
        });
    }
}));
