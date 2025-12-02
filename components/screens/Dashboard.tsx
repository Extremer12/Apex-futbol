
import React, { useState, useEffect, useMemo } from 'react';
import { GameState, Player, Team, Match } from '../../types';
import { GameAction } from '../../state/reducer';
import { LoadingSpinner, UsersIcon, TrophyIcon, TrendingUpIcon, InboxIcon } from '../icons';
import { ConfidenceMeter } from '../ui/ConfidenceMeter';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { WeeklyFixtures } from '../ui/WeeklyFixtures';
import { LinkedText } from '../ui/LinkedText';
import { formatCurrency } from '../../utils';
import { MatchPhase } from '../../App';

interface PendingSimulationResults {
    playerMatchResult: { homeScore: number; awayScore: number } | null;
}

interface DashboardProps {
    gameState: GameState;
    onPlayMatch: () => void;
    matchPhase: MatchPhase;
    pendingResults: PendingSimulationResults | null;
    onWeekComplete: () => void;
    allPlayers: Player[];
    dispatch: React.Dispatch<GameAction>;
}

// --- Subcomponente: Tarjeta de Partido Inmersiva ---
// --- Subcomponente: Tarjeta de Partido Inmersiva ---
import { MatchEngine } from '../gameflow/MatchEngine';

const MatchDayCard: React.FC<{
    gameState: GameState,
    matchPhase: MatchPhase,
    onPlayMatch: () => void,
    pendingResults: PendingSimulationResults | null,
    onWeekComplete: () => void,
    dispatch: React.Dispatch<GameAction>
}> = ({ gameState, matchPhase, onPlayMatch, pendingResults, onWeekComplete, dispatch }) => {

    const nextWeek = gameState.currentWeek + 1;
    const nextMatch = gameState.schedule.find(m => m.week === nextWeek && (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id));

    const opponentId = nextMatch ? (nextMatch.homeTeamId === gameState.team.id ? nextMatch.awayTeamId : nextMatch.homeTeamId) : 0;
    const opponent = gameState.allTeams.find(t => t.id === opponentId);
    const isHome = nextMatch?.homeTeamId === gameState.team.id;

    const maxWeek = useMemo(() => gameState.schedule.length > 0 ? Math.max(...gameState.schedule.map(m => m.week)) : 38, [gameState.schedule]);

    // 1. Check if Simulation was run but no match for player (Bye Week Simulation Complete)
    if (matchPhase === 'LIVE' && !pendingResults?.playerMatchResult) {
        return (
            <div className="bg-slate-900 rounded-xl p-8 text-center border border-slate-800 flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <TrendingUpIcon className="w-8 h-8 text-sky-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Jornada Simulada</h2>
                <p className="text-slate-400 mb-8 max-w-md">
                    Los partidos de la jornada han finalizado. Tu equipo tuvo descanso esta semana.
                </p>
                <button
                    onClick={onWeekComplete}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg shadow-xl shadow-green-600/30 transform hover:scale-105 transition-all duration-200 text-lg"
                >
                    Continuar
                </button>
            </div>
        );
    }

    if (!nextMatch) {
        // Check if season is actually over
        if (nextWeek > maxWeek) {
            return (
                <div className="bg-slate-900 rounded-xl p-8 text-center border border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
                    <TrophyIcon className="w-16 h-16 text-yellow-400 mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">Fin de Temporada</h2>
                    <p className="text-slate-400 mb-8 max-w-md">
                        Has completado la temporada {gameState.season}. Revisa la clasificación final y prepárate para el próximo año. Los jugadores envejecerán, algunos se retirarán y llegarán nuevas promesas de la cantera.
                    </p>
                    <button
                        onClick={() => dispatch({ type: 'START_NEW_SEASON' })}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg shadow-xl shadow-sky-600/30 transform hover:scale-105 transition-all duration-200 text-lg flex items-center gap-2"
                    >
                        <TrendingUpIcon className="w-6 h-6" /> Comenzar Temporada {gameState.season + 1}
                    </button>
                </div>
            );
        } else {
            // Bye Week (Descanso)
            return (
                <div className="bg-slate-900 rounded-xl p-8 text-center border border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <InboxIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Jornada de Descanso</h2>
                    <p className="text-slate-400 mb-8 max-w-md">
                        Tu equipo no tiene partido programado para esta jornada (Semana {nextWeek}).
                    </p>
                    <button
                        onClick={onPlayMatch}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg shadow-xl shadow-sky-600/30 transform hover:scale-105 transition-all duration-200 text-lg flex items-center gap-2"
                    >
                        <TrendingUpIcon className="w-6 h-6" /> Simular Jornada
                    </button>
                </div>
            );
        }
    }

    // Ensure opponent exists (should always be true if nextMatch exists, but for safety)
    if (!opponent) return null;

    if (matchPhase === 'LIVE' && pendingResults?.playerMatchResult) {
        return (
            <MatchEngine
                homeTeam={isHome ? gameState.team : opponent}
                awayTeam={!isHome ? gameState.team : opponent}
                matchPhase={matchPhase}
                finalResult={{
                    homeScore: pendingResults.playerMatchResult.homeScore,
                    awayScore: pendingResults.playerMatchResult.awayScore,
                    events: pendingResults.playerMatchResult.events || []
                }}
                onMatchComplete={onWeekComplete}
            />
        );
    }

    // Renderizado Pre-Partido
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-2xl mb-6">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900 via-slate-950 to-slate-950"></div>

            <div className="relative z-10 p-6">
                {/* Header: Competición */}
                <div className="text-center mb-6">
                    <h3 className="text-sky-400 font-bold tracking-widest text-sm uppercase">Temporada {gameState.season} - Jornada {nextMatch.week}</h3>
                    <div className="h-1 w-16 bg-sky-500 mx-auto mt-2 rounded-full"></div>
                </div>

                {/* Scoreboard Area */}
                <div className="flex items-center justify-between px-2 md:px-10 py-4">
                    {/* Home Team */}
                    <div className="flex flex-col items-center w-1/3">
                        <div className={`transform transition-transform duration-500 scale-100`}>
                            {isHome ? gameState.team.logo : opponent.logo}
                        </div>
                        <h2 className="text-lg md:text-2xl font-bold mt-3 text-center leading-tight">
                            {isHome ? gameState.team.name : opponent.name}
                        </h2>
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded mt-2 text-slate-300">
                            {isHome ? 'Local' : 'Visitante'}
                        </span>
                    </div>

                    {/* Center: VS */}
                    <div className="flex flex-col items-center w-1/3">
                        <div className="text-center space-y-2">
                            <span className="text-4xl font-black text-slate-600 italic">VS</span>
                            <div className="text-xs text-slate-400">
                                Dif: <span className={opponent.tier === 'Top' ? 'text-red-400' : opponent.tier === 'Mid' ? 'text-yellow-400' : 'text-green-400'}>{opponent.tier}</span>
                            </div>
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center w-1/3">
                        <div className={`transform transition-transform duration-500 scale-100`}>
                            {!isHome ? gameState.team.logo : opponent.logo}
                        </div>
                        <h2 className="text-lg md:text-2xl font-bold mt-3 text-center leading-tight">
                            {!isHome ? gameState.team.name : opponent.name}
                        </h2>
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded mt-2 text-slate-300">
                            {!isHome ? 'Local' : 'Visitante'}
                        </span>
                    </div>
                </div>

                {/* Footer: Actions */}
                <div className="mt-8 text-center">
                    <button
                        onClick={onPlayMatch}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-12 rounded-full shadow-lg shadow-sky-600/30 transform hover:scale-105 transition-all duration-200 text-lg animate-bounce"
                    >
                        Jugar Partido
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Bloques Laterales (Inbox, Stats rápidas) ---
const QuickStats: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    const playerTeamRow = gameState.leagueTable.find(row => row.teamId === gameState.team.id);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-around items-center shadow-md">
            <div className="text-center">
                <div className="text-slate-400 text-xs uppercase font-bold mb-1">Confianza</div>
                <ConfidenceMeter value={gameState.chairmanConfidence} />
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-center">
                <div className="text-slate-400 text-xs uppercase font-bold mb-1">Liga</div>
                <div className="text-xl font-bold text-white">{playerTeamRow ? `${playerTeamRow.position}º` : '-'}</div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-center">
                <div className="text-slate-400 text-xs uppercase font-bold mb-1">Fondos</div>
                <div className="text-xl font-bold text-green-400">{formatCurrency(gameState.finances.transferBudget)}</div>
            </div>
        </div>
    );
};

const InboxPreview: React.FC<{ gameState: GameState, dispatch: React.Dispatch<GameAction> }> = ({ gameState, dispatch }) => {
    const { incomingOffers, allTeams, team } = gameState;
    const getTeamName = (id: number) => allTeams.find(t => t.id === id)?.name || 'Club';
    const getPlayerName = (id: number) => team.squad.find(p => p.id === id)?.name || 'Jugador';

    if (incomingOffers.length === 0) return null;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-4 mt-6">
            <h2 className="text-sm font-bold text-sky-400 border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
                <InboxIcon className="w-4 h-4" /> Ofertas Pendientes ({incomingOffers.length})
            </h2>
            <div className="space-y-3">
                {incomingOffers.slice(0, 2).map(offer => (
                    <div key={offer.id} className="bg-slate-800/50 p-3 rounded text-sm flex justify-between items-center">
                        <div>
                            <span className="text-white font-semibold">{getPlayerName(offer.playerId)}</span>
                            <span className="text-slate-400 text-xs block">Oferta de {getTeamName(offer.offeringTeamId)}: <span className='text-green-400'>{formatCurrency(offer.offerValue)}</span></span>
                        </div>
                        <button
                            onClick={() => dispatch({ type: 'ACCEPT_OFFER', payload: { offerId: offer.id } })}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs py-1 px-3 rounded"
                        >
                            Aceptar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ gameState, onPlayMatch, matchPhase, pendingResults, onWeekComplete, allPlayers, dispatch }) => {
    const [displayedWeek, setDisplayedWeek] = useState(gameState.currentWeek > 0 ? gameState.currentWeek : 1);
    const maxWeek = useMemo(() => gameState.schedule.length > 0 ? Math.max(...gameState.schedule.map(m => m.week)) : 38, [gameState.schedule]);

    useEffect(() => {
        if (gameState.currentWeek > 0 && gameState.currentWeek <= maxWeek) {
            setDisplayedWeek(gameState.currentWeek);
        }
    }, [gameState.currentWeek, maxWeek]);

    const handlePlayerClick = (playerName: string) => {
        const player = allPlayers.find(p => p.name === playerName);
        if (player) {
            dispatch({ type: 'SET_VIEWING_PLAYER', payload: player });
        }
    }

    return (
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Center Column (Main Focus): Match Day */}
            <div className="lg:col-span-8 lg:order-2 space-y-6">
                <MatchDayCard
                    gameState={gameState}
                    matchPhase={matchPhase}
                    onPlayMatch={onPlayMatch}
                    pendingResults={pendingResults}
                    onWeekComplete={onWeekComplete}
                    dispatch={dispatch}
                />

                {/* Fixtures below Match Card */}
                {gameState.schedule.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5">
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => setDisplayedWeek(w => Math.max(1, w - 1))} disabled={displayedWeek <= 1} className="text-slate-400 hover:text-white text-sm">&lt; Anterior</button>
                            <h2 className="text-lg font-bold text-white">Resultados Jornada {displayedWeek}</h2>
                            <button onClick={() => setDisplayedWeek(w => Math.min(maxWeek, w + 1))} disabled={displayedWeek >= maxWeek} className="text-slate-400 hover:text-white text-sm">Siguiente &gt;</button>
                        </div>
                        <WeeklyFixtures week={displayedWeek} matches={matchPhase === 'LIVE' && pendingResults ? pendingResults.playerMatchResult ? gameState.schedule : gameState.schedule : gameState.schedule} allTeams={gameState.allTeams} playerTeamId={gameState.team.id} />
                    </div>
                )}
            </div>

            {/* Left Column: Stats & News */}
            <div className="lg:col-span-4 lg:order-1 space-y-6">
                <QuickStats gameState={gameState} />
                <InboxPreview gameState={gameState} dispatch={dispatch} />

                {/* News Feed */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5 h-full max-h-[500px] flex flex-col">
                    <h2 className="text-lg font-bold mb-4 text-sky-400 flex items-center gap-2">
                        <TrendingUpIcon className="w-5 h-5" /> Noticias
                    </h2>
                    <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                        {gameState.newsFeed.map(item => (
                            <div key={item.id} className="group">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors leading-tight">{item.headline}</p>
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">{item.date}</span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-3">
                                    <LinkedText text={item.body} players={allPlayers} onPlayerClick={handlePlayerClick} />
                                </p>
                                <div className="h-px bg-slate-800 mt-3 w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
