import { create } from 'zustand';
import { GameState, PlayerProfile, Team, Screen, MatchPhase, PendingSimulationResults, Player } from '../types';
import type { GameAction } from './reducer';
import type { ElectionResponse } from '../services/gameLogic';
import type { TriggeredEvent } from '../services/eventEngine';
import { registerPacksStoreNotifier } from '../services/resources/packNotifierBridge';
import { simulationWorker } from '../services/simulationWorker';

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

type GameReducerFn = (state: GameState | null, action: GameAction) => GameState | null;
let loadedReducer: GameReducerFn | null = null;
let reducerLoadPromise: Promise<GameReducerFn> | null = null;

export async function ensureGameReducerLoaded(): Promise<GameReducerFn> {
    if (loadedReducer) return loadedReducer;
    if (!reducerLoadPromise) {
        reducerLoadPromise = import('./reducer').then((mod) => {
            loadedReducer = mod.gameReducer;
            return mod.gameReducer;
        });
    }
    return reducerLoadPromise;
}

export interface GameStoreState {
    // App lifecycle state
    appState: AppStateType;
    playerProfile: PlayerProfile | null;
    selectedTeam: Team | null;
    electionResult: ElectionResponse | null;
    activeScreen: Screen;

    // Core Game State
    gameState: GameState | null;

    // Simulation state
    matchPhase: MatchPhase;
    pendingResults: PendingSimulationResults | null;
    isSimulating: boolean;

    // Events & Modals state (decoupled from GameState to avoid full-tree re-renders)
    viewingPlayer: Player | null;
    currentEvent: TriggeredEvent | null;
    isSeasonEndModalOpen: boolean;
    isStartingSeason: boolean;

    // Save info
    currentSaveId: string | null;
    currentSaveName: string | null;
    lastSaved: Date | null;
    isSaving: boolean;

    // Custom packs reactive state
    packsVersion: number;

    // Actions
    dispatch: (action: GameAction) => void;
    setViewingPlayer: (player: Player | null) => void;
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
    incrementPacksVersion: () => void;
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

    gameState: null,

    matchPhase: 'PRE',
    pendingResults: null,
    isSimulating: false,

    viewingPlayer: null,
    currentEvent: null,
    isSeasonEndModalOpen: false,
    isStartingSeason: false,

    currentSaveId: null,
    currentSaveName: null,
    lastSaved: null,
    isSaving: false,

    packsVersion: 0,

    dispatch: (action: GameAction) => {
        if (action.type === 'SET_VIEWING_PLAYER') {
            set({ viewingPlayer: action.payload });
            return;
        }
        if (action.type === 'RESET_GAME') {
            simulationWorker.resetSession();
            set({ gameState: null, viewingPlayer: null });
            return;
        }
        if (
            action.type === 'INITIALIZE_GAME' ||
            action.type === 'LOAD_GAME' ||
            action.type === 'START_NEW_SEASON' ||
            action.type === 'SWITCH_CLUB'
        ) {
            simulationWorker.resetSession();
        }
        if (loadedReducer) {
            const reducer = loadedReducer;
            set((state) => {
                const nextGameState = reducer(state.gameState, action);
                let nextViewingPlayer = state.viewingPlayer;
                if (
                    action.type === 'INITIALIZE_GAME' ||
                    action.type === 'LOAD_GAME' ||
                    action.type === 'SWITCH_CLUB'
                ) {
                    nextViewingPlayer = null;
                } else if (action.type === 'RELEASE_RESERVE_PLAYER' && state.viewingPlayer?.id === action.payload) {
                    nextViewingPlayer = null;
                } else if (action.type === 'ACCEPT_OFFER' && state.viewingPlayer && nextGameState) {
                    const sold = !nextGameState.team.squad.some(p => p.id === state.viewingPlayer!.id) &&
                        !(nextGameState.youthAcademy || []).some(p => p.id === state.viewingPlayer!.id);
                    if (sold) nextViewingPlayer = null;
                }
                return {
                    gameState: nextGameState,
                    viewingPlayer: nextViewingPlayer,
                    playerProfile: nextGameState?.playerProfile ?? state.playerProfile
                };
            });
            return;
        }
        // Fallback: lazily load reducer if dispatch was called prior to explicit preload
        void ensureGameReducerLoaded().then(() => {
            get().dispatch(action);
        });
    },

    setViewingPlayer: (viewingPlayer) => set({ viewingPlayer }),
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
    incrementPacksVersion: () => set((state) => ({ packsVersion: state.packsVersion + 1 })),

    setSaveState: (info) => set((state) => ({
        currentSaveId: info.currentSaveId !== undefined ? info.currentSaveId : state.currentSaveId,
        currentSaveName: info.currentSaveName !== undefined ? info.currentSaveName : state.currentSaveName,
        lastSaved: info.lastSaved !== undefined ? info.lastSaved : state.lastSaved,
        isSaving: info.isSaving !== undefined ? info.isSaving : state.isSaving,
    })),

    resetGameData: () => {
        simulationWorker.resetSession();
        set({
            gameState: null,
            playerProfile: null,
            selectedTeam: null,
            electionResult: null,
            activeScreen: Screen.Dashboard,
            currentSaveId: null,
            currentSaveName: null,
            lastSaved: null,
            matchPhase: 'PRE',
            pendingResults: null,
            viewingPlayer: null,
            currentEvent: null,
            isSeasonEndModalOpen: false,
            isStartingSeason: false
        });
    }
}));

registerPacksStoreNotifier(() => {
    useGameStore.setState((s) => ({ packsVersion: (s.packsVersion || 0) + 1 }));
});

// Re-export canonical selectors & helpers
export * from './selectors';
