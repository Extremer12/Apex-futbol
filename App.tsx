import React, { useState, useCallback, useEffect, useMemo, useReducer } from 'react';
import { GameState, Team, Screen, Player, PlayerProfile, NewsItem, Offer, LeagueTableRow, Match } from './types';
import { TEAMS } from './constants';
import { gameReducer, initialState } from './state/reducer';
import { saveGame, loadGame, SavedGameData } from './services/db';

// Game Flow Components
import { StartScreen } from './components/gameflow/StartScreen';
import { ProfileCreation } from './components/gameflow/ProfileCreation';
import { TeamSelection } from './components/gameflow/TeamSelection';
import { ElectionPitch } from './components/gameflow/ElectionPitch';
import { ElectionResult } from './components/gameflow/ElectionResult';
import { GameOverScreen } from './components/gameflow/GameOverScreen';
import { LoadGameScreen } from './components/gameflow/LoadGameScreen';

// UI Components
import { Header } from './components/ui/Header';
import { BottomNav } from './components/ui/BottomNav';
import { PlayerDetailModal } from './components/ui/PlayerDetailModal';
import { SaveGameModal } from './components/ui/SaveGameModal';
import { Notification } from './components/ui/Notification';
import { LoadingSpinner } from './components/icons';

// Screen Components
import { Dashboard } from './components/screens/Dashboard';
import { SquadScreen } from './components/screens/SquadScreen';
import { TransfersScreen } from './components/screens/TransfersScreen';
import { FinancesScreen } from './components/screens/FinancesScreen';
import { LeagueScreen } from './components/screens/LeagueScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

// Services
import { evaluateElectionPitch, ElectionResponse, generateNews, generateMatchReport, generateTransferOffer, generatePlayerOfTheWeekNews, generateImportantNews } from './services/geminiService';
import { updateTeamMorale, simulateMatch } from './services/simulation';
import { formatDate } from './utils';


type AppState = 'START_SCREEN' | 'LOAD_GAME' | 'PROFILE_CREATION' | 'TEAM_SELECTION' | 'ELECTION_PITCH' | 'ELECTION_RESULT' | 'GAME_ACTIVE' | 'GAME_OVER';
export type MatchPhase = 'PRE' | 'LIVE' | 'POST';

// Data structure to hold simulation results before committing to state
interface PendingSimulationResults {
    newsToAdd: NewsItem[];
    updatedSchedule: Match[];
    updatedLeagueTable: LeagueTableRow[];
    updatedAllTeams: Team[];
    confidenceChange: number;
    newOffers: Offer[];
    playerMatchResult: { homeScore: number; awayScore: number } | null;
}

// --- Main App Component ---
function App() {
    const [appState, setAppState] = useState<AppState>('START_SCREEN');
    const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [electionResult, setElectionResult] = useState<ElectionResponse | null>(null);
    const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Dashboard);
    
    // Match Simulation State
    const [matchPhase, setMatchPhase] = useState<MatchPhase>('PRE');
    const [pendingResults, setPendingResults] = useState<PendingSimulationResults | null>(null);
    
    // Save state
    const [currentSaveId, setCurrentSaveId] = useState<string | null>(null);
    const [currentSaveName, setCurrentSaveName] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveMode, setSaveMode] = useState<'overwrite' | 'new'>('overwrite');
    
    // Notification State
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const [gameState, dispatch] = useReducer(gameReducer, initialState);
    
    const allPlayers = useMemo(() => gameState ? gameState.allTeams.flatMap(t => t.squad) : [], [gameState]);
    const viewingPlayer = useMemo(() => (gameState && gameState.viewingPlayer) || null, [gameState]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Auto-saving effect
    useEffect(() => {
        if (appState === 'GAME_ACTIVE' && gameState && playerProfile && currentSaveId && currentSaveName && matchPhase === 'PRE') {
            const saveData: SavedGameData = {
                id: currentSaveId,
                saveName: currentSaveName,
                playerProfile,
                gameState,
                teamName: gameState.team.name,
                lastSaved: new Date(),
            };
            saveGame(saveData)
                .then(() => setLastSaved(new Date()))
                .catch(err => console.error("Auto-save failed:", err));
        }
    }, [gameState, playerProfile, appState, currentSaveId, currentSaveName, matchPhase]);

    const resetGameData = useCallback(() => {
        dispatch({ type: 'RESET_GAME' });
        setPlayerProfile(null);
        setSelectedTeam(null);
        setElectionResult(null);
        setActiveScreen(Screen.Dashboard);
        setCurrentSaveId(null);
        setCurrentSaveName(null);
        setLastSaved(null);
        setMatchPhase('PRE');
        setPendingResults(null);
    }, []);
    
    const handleNewGame = useCallback(() => {
        resetGameData();
        setAppState('PROFILE_CREATION');
    }, [resetGameData]);

    const handleLoadGame = useCallback(async (id: string) => {
        const savedData = await loadGame(id);
        if (savedData) {
            const rehydratedGameState: GameState = {
                ...savedData.gameState,
                currentDate: new Date(savedData.gameState.currentDate),
                chairmanConfidence: savedData.gameState.chairmanConfidence != null ? savedData.gameState.chairmanConfidence : 75,
                incomingOffers: savedData.gameState.incomingOffers || [],
            };

            setPlayerProfile(savedData.playerProfile);
            dispatch({ type: 'LOAD_GAME', payload: rehydratedGameState });
            setCurrentSaveId(savedData.id);
            setCurrentSaveName(savedData.saveName);
            setLastSaved(new Date(savedData.lastSaved));
            setAppState('GAME_ACTIVE');
            showNotification(`Partida "${savedData.saveName}" cargada`);
        } else {
            console.error("Failed to load game state.");
            showNotification("Error al cargar la partida", "error");
            setAppState('START_SCREEN');
        }
    }, []);

    const handleProfileCreate = (profile: PlayerProfile) => {
        setPlayerProfile(profile);
        setAppState('TEAM_SELECTION');
    };

    const handleTeamSelect = (team: Team) => {
        setSelectedTeam(team);
        setAppState('ELECTION_PITCH');
    };

    const handlePitchSubmit = useCallback(async (pitch: string) => {
        if (!selectedTeam || !playerProfile) return;
        const result = await evaluateElectionPitch(pitch, selectedTeam, playerProfile);
        setElectionResult(result);
        setAppState('ELECTION_RESULT');
    }, [selectedTeam, playerProfile]);

    const handleStartGame = useCallback(() => {
        if (!selectedTeam || !playerProfile) return;
        dispatch({ type: 'INITIALIZE_GAME', payload: { team: selectedTeam, playerProfile } });
        setAppState('GAME_ACTIVE');
    }, [selectedTeam, playerProfile]);
    
    const handleRetryElection = () => {
        setSelectedTeam(null);
        setElectionResult(null);
        setAppState('TEAM_SELECTION');
    };
    
    const fetchInitialNews = useCallback(async (state: GameState) => {
        const initialNews = await generateNews(state);
        const newsItem: NewsItem = { ...initialNews, id: new Date().toISOString(), date: formatDate(state.currentDate) };
        dispatch({ type: 'ADD_NEWS', payload: newsItem });
    }, []);

    useEffect(() => {
        if (gameState && gameState.newsFeed.length === 3) { 
            fetchInitialNews(gameState);
        }
    }, [gameState, fetchInitialNews]);
    
    const handleConfirmSave = useCallback(async (saveName: string) => {
        if (!gameState || !playerProfile) return;
        
        // Determine ID: If explicit "new" mode OR no current ID exists, create new ID.
        // Otherwise (overwrite mode AND ID exists), use current ID.
        const saveId = (saveMode === 'overwrite' && currentSaveId) 
            ? currentSaveId 
            : `save_${Date.now()}`;
            
        const now = new Date();

        const saveData: SavedGameData = {
            id: saveId,
            saveName: saveName,
            playerProfile,
            gameState,
            teamName: gameState.team.name,
            lastSaved: now,
        };

        try {
            await saveGame(saveData);
            setCurrentSaveId(saveId);
            setCurrentSaveName(saveName);
            setLastSaved(now);
            showNotification(saveMode === 'new' ? "Nueva partida guardada" : "Partida guardada correctamente");
        } catch (e) {
            console.error(e);
            showNotification("Error al guardar la partida", "error");
        }
        
        setIsSaveModalOpen(false);
    }, [gameState, playerProfile, currentSaveId, saveMode]);

    const handleQuitToMenu = useCallback(() => {
        // The confirmation is now handled by the UI modal in SettingsScreen.
        // If we reach here, the user has already confirmed.
        resetGameData();
        setAppState('START_SCREEN');
    }, [resetGameData]);


    // Step 1: Calculate results and Start Animation
    const handlePlayMatch = useCallback(async () => {
        if (!gameState) return;
        
        // Create calculation context
        const newWeek = gameState.currentWeek + 1;
        const newSchedule = [...gameState.schedule];
        const updatedLeagueTable = new Map<number, LeagueTableRow>(
            gameState.leagueTable.map(row => [row.teamId, {...row, form: [...row.form]}] as [number, LeagueTableRow])
        );
        let updatedAllTeams = gameState.allTeams.map(t => ({ ...t }));
        const matchesThisWeek = newSchedule.filter(m => m.week === newWeek);
        
        const weeklyNet = (gameState.finances.weeklyIncome - gameState.finances.weeklyWages) / 1_000_000;
        let confidenceChange = weeklyNet > 0 ? 1 : -1;

        let playerMatchResult: { homeScore: number, awayScore: number } | null = null;

        // Simulate all matches
        if (matchesThisWeek.length > 0) {
            matchesThisWeek.forEach(match => {
                if(match.result) return;

                const homeTeam = updatedAllTeams.find(t => t.id === match.homeTeamId)!;
                const awayTeam = updatedAllTeams.find(t => t.id === match.awayTeamId)!;
                const homeRow = updatedLeagueTable.get(match.homeTeamId)!;
                const awayRow = updatedLeagueTable.get(match.awayTeamId)!;
                
                const result = simulateMatch(homeTeam, awayTeam, homeRow, awayRow);
                const matchIndex = newSchedule.findIndex(m => m.week === newWeek && m.homeTeamId === match.homeTeamId);
                newSchedule[matchIndex] = { ...newSchedule[matchIndex], result: { homeScore: result.homeScore, awayScore: result.awayScore } };

                // Store player match result specifically for UI
                if (match.homeTeamId === gameState.team.id || match.awayTeamId === gameState.team.id) {
                    playerMatchResult = { homeScore: result.homeScore, awayScore: result.awayScore };
                }

                homeRow.played++; awayRow.played++;
                homeRow.goalsFor += result.homeScore; awayRow.goalsFor += result.awayScore;
                homeRow.goalsAgainst += result.awayScore; awayRow.goalsAgainst += result.homeScore;

                let homeResult: 'W' | 'D' | 'L', awayResult: 'W' | 'D' | 'L';

                if (result.homeScore > result.awayScore) { 
                    homeRow.wins++; homeRow.points += 3; homeResult = 'W';
                    awayRow.losses++; awayResult = 'L';
                } else if (result.awayScore > result.homeScore) { 
                    awayRow.wins++; awayRow.points += 3; awayResult = 'W';
                    homeRow.losses++; homeResult = 'L';
                } else { 
                    homeRow.draws++; homeRow.points += 1; homeResult = 'D';
                    awayRow.draws++; awayRow.points += 1; awayResult = 'D';
                }
                homeRow.form.unshift(homeResult);
                awayRow.form.unshift(awayResult);
                
                homeTeam.teamMorale = updateTeamMorale(homeTeam.teamMorale, homeResult);
                awayTeam.teamMorale = updateTeamMorale(awayTeam.teamMorale, awayResult);

                if (homeTeam.id === gameState.team.id) { 
                    if (homeResult === 'W') confidenceChange += 2;
                    if (homeResult === 'D') confidenceChange -= 1; 
                    if (homeResult === 'L') confidenceChange -= 4; 
                }
                if (awayTeam.id === gameState.team.id) { 
                    if (awayResult === 'W') confidenceChange += 3; 
                    if (awayResult === 'D') confidenceChange += 1; 
                    if (awayResult === 'L') confidenceChange -= 2;
                }
            });
        }

        // Prepare News and Offers (Async parts)
        const newDate = new Date(gameState.currentDate);
        newDate.setDate(newDate.getDate() + 7);
        
        const newsToAdd: NewsItem[] = [];
        const playerMatch = newSchedule.find(m => m.week === newWeek && (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id));

        if(playerMatch && playerMatch.result) {
            const isHome = playerMatch.homeTeamId === gameState.team.id;
            const opponent = gameState.allTeams.find(t => t.id === (isHome ? playerMatch.awayTeamId : playerMatch.homeTeamId))!;
            const myScore = isHome ? playerMatch.result.homeScore : playerMatch.result.awayScore;
            const oppScore = isHome ? playerMatch.result.awayScore : playerMatch.result.homeScore;
            
            const isThrashing = (myScore - oppScore) >= 3;
            const isBadLoss = (oppScore - myScore) >= 3;
            const isUpset = myScore > oppScore && gameState.team.tier === 'Lower' && opponent.tier === 'Top';
            
            if (isThrashing || isBadLoss || isUpset) {
                const context = isUpset ? "Victoria histórica de un equipo pequeño contra un gigante." : isThrashing ? "Una goleada espectacular." : "Una derrota humillante.";
                const detail = `El ${gameState.team.name} quedó ${myScore}-${oppScore} contra el ${opponent.name}.`;
                const aiReport = await generateImportantNews(context, detail);
                newsToAdd.push({ ...aiReport, id: `match_ai_${new Date().toISOString()}`, date: formatDate(newDate) });
            } else {
                const matchReport = await generateMatchReport(gameState.team.name, opponent.name, playerMatch.result.homeScore, playerMatch.result.awayScore, isHome);
                newsToAdd.push({ ...matchReport, id: `match_${new Date().toISOString()}`, date: formatDate(newDate) });
            }
        } else {
             const generalNews = await generateNews(gameState);
             newsToAdd.push({ ...generalNews, id: `general_${new Date().toISOString()}`, date: formatDate(newDate) });
        }
        
        // Player of the week
        if (matchesThisWeek.length > 0 && Math.random() < 0.3) {
            const winningTeamsIds: number[] = [];
            matchesThisWeek.forEach(match => {
                if (!match.result) return;
                if (match.result.homeScore > match.result.awayScore) winningTeamsIds.push(match.homeTeamId);
                else if (match.result.awayScore > match.result.homeScore) winningTeamsIds.push(match.awayTeamId);
            });
            
            const candidatePlayers = updatedAllTeams
                .filter(t => winningTeamsIds.includes(t.id))
                .flatMap(t => t.squad.map(p => ({ player: p, team: t })))
                .filter(({ player }) => player.rating > 84);

            if (candidatePlayers.length > 0) {
                const { player, team } = candidatePlayers[Math.floor(Math.random() * candidatePlayers.length)];
                const match = matchesThisWeek.find(m => m.homeTeamId === team.id || m.awayTeamId === team.id)!;
                const opponent = updatedAllTeams.find(t => t.id === (match.homeTeamId === team.id ? match.awayTeamId : match.homeTeamId))!;
                const resultString = `${team.name} ${match.result!.homeScore} - ${match.result!.awayScore} ${opponent.name}`;
                const potwNewsData = await generatePlayerOfTheWeekNews(player, team.name, opponent.name, resultString);
                newsToAdd.push({ ...potwNewsData, id: `potw_${new Date().toISOString()}`, date: formatDate(newDate) });
            }
        }

        // Offers
        const generatedOffers: Offer[] = [];
        const transferListedPlayers = gameState.team.squad.filter(p => p.isTransferListed);
        for (const player of transferListedPlayers) {
            if (Math.random() < 0.3) {
                const potentialBuyers = gameState.allTeams.filter(t => t.id !== gameState.team.id);
                const offer = await generateTransferOffer(player, gameState.team, potentialBuyers);
                if (offer) {
                    generatedOffers.push({
                        id: `offer_${new Date().toISOString()}_${player.id}`,
                        playerId: player.id,
                        ...offer
                    });
                }
            }
        }

        setPendingResults({
            newsToAdd,
            updatedSchedule: newSchedule,
            updatedLeagueTable: Array.from(updatedLeagueTable.values()),
            updatedAllTeams,
            confidenceChange,
            newOffers: generatedOffers,
            playerMatchResult
        });

        // Transition state to LIVE simulation
        setMatchPhase('LIVE');

    }, [gameState]);

    // Step 2: Commit results after animation
    const handleWeekComplete = useCallback(() => {
        if (!gameState || !pendingResults) return;

        const newConfidence = Math.max(0, Math.min(100, gameState.chairmanConfidence + pendingResults.confidenceChange));
        
        dispatch({ type: 'ADVANCE_WEEK_START' });
        dispatch({
            type: 'ADVANCE_WEEK_SUCCESS',
            payload: {
                newsItems: pendingResults.newsToAdd,
                newSchedule: pendingResults.updatedSchedule,
                newLeagueTable: pendingResults.updatedLeagueTable,
                newAllTeams: pendingResults.updatedAllTeams,
                newConfidence,
                newOffers: pendingResults.newOffers,
            }
        });

        if (newConfidence <= 0) {
            setAppState('GAME_OVER');
        } else {
            setMatchPhase('PRE');
        }
        setPendingResults(null);
    }, [gameState, pendingResults]);


    // --- RENDER LOGIC ---
    if (appState === 'START_SCREEN') return <StartScreen onNewGame={handleNewGame} onLoadGameScreen={() => setAppState('LOAD_GAME')} />;
    if (appState === 'LOAD_GAME') return <LoadGameScreen onLoadGame={handleLoadGame} onBack={() => setAppState('START_SCREEN')} />;
    if (appState === 'GAME_OVER') return <GameOverScreen onNewGame={handleNewGame} />;
    if (appState === 'PROFILE_CREATION') return <ProfileCreation onProfileCreate={handleProfileCreate} />;
    if (appState === 'TEAM_SELECTION' && playerProfile) return <TeamSelection player={playerProfile} onSelectTeam={handleTeamSelect} />;
    if (appState === 'ELECTION_PITCH' && selectedTeam && playerProfile) return <ElectionPitch team={selectedTeam} player={playerProfile} onSubmitPitch={handlePitchSubmit} onBack={handleRetryElection} isLoading={appState === 'ELECTION_RESULT'} />;
    if (appState === 'ELECTION_RESULT' && electionResult) return <ElectionResult result={electionResult} onContinue={handleStartGame} onRetry={handleRetryElection} />;

    if (!gameState || appState !== 'GAME_ACTIVE') {
         return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><LoadingSpinner /></div>;
    }

    const renderContent = () => {
        switch (activeScreen) {
            case Screen.Dashboard: 
                return <Dashboard 
                    gameState={gameState} 
                    onPlayMatch={handlePlayMatch} 
                    matchPhase={matchPhase}
                    pendingResults={pendingResults}
                    onWeekComplete={handleWeekComplete}
                    allPlayers={allPlayers} 
                    dispatch={dispatch} 
                />;
            case Screen.Squad: return <SquadScreen gameState={gameState} dispatch={dispatch} />;
            case Screen.Transfers: return <TransfersScreen gameState={gameState} dispatch={dispatch} />;
            case Screen.Finances: return <FinancesScreen gameState={gameState} />;
            case Screen.League: return <LeagueScreen gameState={gameState} />;
            case Screen.Settings: return (
                <SettingsScreen 
                    onSaveGame={(mode) => { setSaveMode(mode); setIsSaveModalOpen(true); }} 
                    onQuitToMenu={handleQuitToMenu}
                    currentSaveName={currentSaveName}
                    lastSaved={lastSaved}
                />
            );
            default: return <Dashboard gameState={gameState} onPlayMatch={handlePlayMatch} matchPhase={matchPhase} pendingResults={pendingResults} onWeekComplete={handleWeekComplete} allPlayers={allPlayers} dispatch={dispatch} />;
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200 font-sans relative">
             {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
             {viewingPlayer && <PlayerDetailModal player={viewingPlayer} dispatch={dispatch} />}
             {isSaveModalOpen && (
                <SaveGameModal 
                    onSave={handleConfirmSave} 
                    onClose={() => setIsSaveModalOpen(false)} 
                    defaultName={saveMode === 'overwrite' ? (currentSaveName || `${gameState.team.name} Carrera`) : `${gameState.team.name} Carrera (Nueva)`} 
                    mode={saveMode}
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
}

export default App;