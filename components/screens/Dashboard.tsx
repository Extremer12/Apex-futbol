
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
    const playerTeamRow = gameState.leagueTables[gameState.team.leagueId]?.find(row => row.teamId === gameState.team.id);

    // Determine position zone
    const getPositionZone = (position: number | undefined) => {
        if (!position) return { label: '-', color: 'text-slate-400', bg: 'from-slate-700 to-slate-800' };
        if (position <= 4) return { label: 'Champions', color: 'text-sky-400', bg: 'from-sky-900/50 to-sky-800/50' };
        if (position <= 6) return { label: 'Europa', color: 'text-yellow-400', bg: 'from-yellow-900/50 to-yellow-800/50' };
        if (position >= 18) return { label: 'Descenso', color: 'text-red-400', bg: 'from-red-900/50 to-red-800/50' };
        return { label: 'Media Tabla', color: 'text-slate-400', bg: 'from-slate-700 to-slate-800' };
    };

    const positionZone = getPositionZone(playerTeamRow?.position);

    // Use boardConfidence if available, fallback to chairmanConfidence for compatibility
    const boardConf = gameState.boardConfidence ?? gameState.chairmanConfidence ?? 75;
    const fanApp = gameState.fanApproval?.rating ?? 60;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Board Confidence Card */}
            <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-2 border-orange-500/30 rounded-xl p-5 hover:scale-105 hover:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-orange-500/20">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-slate-300 text-sm font-semibold">Junta Directiva</span>
                </div>
                <div className="text-4xl font-bold text-white mb-3">
                    {boardConf}%
                </div>
                <ConfidenceMeter value={boardConf} />
                <div className={`text-xs mt-2 ${boardConf >= 70 ? 'text-green-400' : boardConf >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {boardConf >= 70 ? '✓ Confianza Alta' : boardConf >= 40 ? '⚠ Vigilancia' : '⚠ Riesgo de Despido'}
                </div>
            </div>

            {/* Fan Approval Card */}
            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-blue-500/30 rounded-xl p-5 hover:scale-105 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <span className="text-slate-300 text-sm font-semibold">Socios</span>
                </div>
                <div className="text-4xl font-bold text-white mb-3">
                    {fanApp}%
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                        className={`h-full bg-gradient-to-r ${fanApp >= 60 ? 'from-blue-500 to-cyan-500' : fanApp >= 40 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-red-600'}`}
                        style={{ width: `${fanApp}%` }}
                    />
                </div>
                <div className={`text-xs ${fanApp >= 60 ? 'text-blue-400' : fanApp >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {gameState.mandate ? `Elecciones en ${4 - gameState.mandate.currentYear + 1} años` : 'Aprobación Popular'}
                </div>
            </div>

            {/* League Position Card */}
            <div className={`bg-gradient-to-br ${positionZone.bg} border-2 border-sky-500/30 rounded-xl p-5 hover:scale-105 hover:border-sky-500/50 transition-all duration-300 shadow-lg hover:shadow-sky-500/20`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <span className="text-slate-300 text-sm font-semibold">Posición</span>
                </div>
                <div className="text-4xl font-bold text-white mb-3">
                    {playerTeamRow ? `${playerTeamRow.position}º` : '-'}
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                        className={`h-full bg-gradient-to-r ${playerTeamRow && playerTeamRow.position <= 4 ? 'from-sky-500 to-blue-500' : playerTeamRow && playerTeamRow.position >= 18 ? 'from-red-500 to-red-600' : 'from-slate-500 to-slate-600'}`}
                        style={{ width: `${playerTeamRow ? Math.max(5, 100 - (playerTeamRow.position * 5)) : 0}%` }}
                    />
                </div>
                <div className={`text-xs ${positionZone.color} font-semibold`}>
                    {positionZone.label}
                </div>
            </div>

            {/* Finances Card */}
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/30 rounded-xl p-5 hover:scale-105 hover:border-green-500/50 transition-all duration-300 shadow-lg hover:shadow-green-500/20">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-slate-300 text-sm font-semibold">Fondos</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                    {formatCurrency(gameState.finances.transferBudget)}
                </div>
                <div className="text-xs text-slate-400">
                    de {formatCurrency(gameState.finances.budget)} total
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${(gameState.finances.transferBudget / gameState.finances.budget) * 100}%` }}
                    />
                </div>
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
                        <WeeklyFixtures
                            week={displayedWeek}
                            matches={matchPhase === 'LIVE' && pendingResults ? pendingResults.playerMatchResult ? gameState.schedule : gameState.schedule : gameState.schedule}
                            allTeams={gameState.allTeams}
                            playerTeamId={gameState.team.id}
                            playerTeamLeagueId={gameState.team.leagueId}
                        />
                    </div>
                )}
            </div>

            {/* Left Column: Stats & News */}
            <div className="lg:col-span-4 lg:order-1 space-y-6">
                <QuickStats gameState={gameState} />
                <InboxPreview gameState={gameState} dispatch={dispatch} />

                {/* News Feed */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20 border border-slate-800 rounded-xl shadow-lg p-5 h-full max-h-[500px] flex flex-col">
                    <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                        <div className="bg-gradient-to-br from-sky-500 to-purple-500 p-2 rounded-lg">
                            <TrendingUpIcon className="w-5 h-5 text-white" />
                        </div>
                        Últimas Noticias
                    </h2>
                    <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                        {gameState.newsFeed.map((item, idx) => (
                            <div
                                key={item.id}
                                className="group relative bg-gradient-to-br from-slate-800/50 to-slate-800/30 hover:from-slate-800/80 hover:to-slate-800/60 border border-slate-700/50 hover:border-sky-500/50 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 cursor-pointer"
                            >
                                {/* Breaking news badge for first item */}
                                {idx === 0 && (
                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                                        🔥 NUEVO
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors leading-tight pr-2">{item.headline}</p>
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap bg-slate-900/50 px-2 py-1 rounded">{item.date}</span>
                                </div>
                                <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2 transition-colors">
                                    <LinkedText text={item.body} players={allPlayers} onPlayerClick={handlePlayerClick} />
                                </p>

                                {/* Decorative gradient line */}
                                <div className="h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent mt-3 group-hover:via-sky-500/60 transition-all"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
