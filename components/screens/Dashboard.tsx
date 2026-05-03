import React, { useState, useEffect, useMemo } from 'react';
import { GameState, Player, Team, Match } from '../../types';
import { GameAction } from '../../state/reducer';
import { LoadingSpinner, UsersIcon, TrophyIcon, TrendingUpIcon, InboxIcon } from '../icons';
import { WeeklyFixtures } from '../ui/WeeklyFixtures';
import { LinkedText } from '../ui/LinkedText';
import { formatCurrency, formatCurrencyShort, formatDate } from '../../utils';
import { MatchPhase } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';
import { MatchEngine } from '../gameflow/MatchEngine';

interface PendingSimulationResults {
    playerMatchResult: { homeScore: number; awayScore: number; events?: string[] } | null;
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

// --- Subcomponente: Tarjeta de Partido Inmersiva (Hero) ---
const MatchDayCard: React.FC<{
    gameState: GameState,
    matchPhase: MatchPhase,
    onPlayMatch: () => void,
    pendingResults: PendingSimulationResults | null,
    onWeekComplete: () => void,
    dispatch: React.Dispatch<GameAction>
}> = ({ gameState, matchPhase, onPlayMatch, pendingResults, onWeekComplete, dispatch }) => {

    const nextWeek = gameState.currentTurn === 'midweek' ? gameState.currentWeek + 1 : gameState.currentWeek;
    const isMidweek = gameState.currentTurn === 'midweek';
    const nextMatch = gameState.schedule.find(m => m.week === nextWeek && !!m.isMidweek === isMidweek && (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id));

    const opponentId = nextMatch ? (nextMatch.homeTeamId === gameState.team.id ? nextMatch.awayTeamId : nextMatch.homeTeamId) : 0;
    const opponent = gameState.allTeams.find(t => t.id === opponentId);
    const isHome = nextMatch?.homeTeamId === gameState.team.id;

    const maxWeek = useMemo(() => gameState.schedule.length > 0 ? Math.max(...gameState.schedule.map(m => m.week)) : 38, [gameState.schedule]);

    if (matchPhase === 'LIVE' && !pendingResults?.playerMatchResult) {
        return (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-10 text-center border border-white/10 flex flex-col items-center justify-center min-h-[400px] animate-fade-in-up shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-sky-900/20 to-transparent z-0"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                        <TrendingUpIcon className="w-10 h-10 text-sky-400" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Jornada Simulada</h2>
                    <p className="text-slate-400 mb-10 max-w-lg text-lg">
                        Los partidos de la jornada han finalizado. Tu equipo tuvo descanso esta semana.
                    </p>
                    <button
                        onClick={onWeekComplete}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-12 rounded-full border border-white/20 backdrop-blur-md transition-all duration-300 text-lg uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        );
    }

    if (!nextMatch) {
        if (nextWeek > maxWeek) {
            return (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-10 text-center border border-yellow-500/20 flex flex-col items-center justify-center min-h-[400px] shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/20 to-transparent z-0"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/10 blur-[100px] rounded-full group-hover:bg-yellow-500/20 transition-all duration-1000 z-0"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <TrophyIcon className="w-24 h-24 text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                        <h2 className="text-5xl font-black text-white mb-4 tracking-tight">Fin de Temporada</h2>
                        <p className="text-slate-300 mb-10 max-w-xl text-lg leading-relaxed">
                            Has completado la temporada {gameState.season}. El club se prepara para el próximo año. Los jugadores envejecerán, algunos se retirarán y llegarán nuevas promesas.
                        </p>
                        <button
                            onClick={() => dispatch({ type: 'START_NEW_SEASON' })}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-12 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.3)] transform hover:scale-105 transition-all duration-300 text-lg uppercase tracking-widest"
                        >
                            Comenzar Temporada {gameState.season + 1}
                        </button>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-10 text-center border border-white/10 flex flex-col items-center justify-center min-h-[400px] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent z-0"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                            <InboxIcon className="w-10 h-10 text-slate-400" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Jornada de Descanso</h2>
                        <p className="text-slate-400 mb-10 max-w-lg text-lg">
                            Tu equipo no tiene partido programado para la Semana {nextWeek} {isMidweek ? '(Entre Semana)' : ''}.
                        </p>
                        <button
                            onClick={onPlayMatch}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-12 rounded-full border border-white/20 backdrop-blur-md transition-all duration-300 text-lg uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        >
                            Simular Jornada
                        </button>
                    </div>
                </div>
            );
        }
    }

    if (!opponent) return null;

    if (matchPhase === 'LIVE' && pendingResults?.playerMatchResult) {
        return (
            <div className="w-full h-[600px] md:h-[700px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-50">
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
            </div>
        );
    }

    // Renderizado Pre-Partido (Hero Cinematic)
    return (
        <div className="relative overflow-hidden bg-[#0a0a0a] rounded-3xl border border-white/5 shadow-2xl mb-8 min-h-[450px] flex flex-col justify-center group animate-fade-in-up">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a] z-10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-[#0a0a0a] to-[#0a0a0a] z-0"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] mix-blend-screen opacity-50 group-hover:opacity-70 transition-opacity duration-1000"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen opacity-50 group-hover:opacity-70 transition-opacity duration-1000"></div>
            </div>

            <div className="relative z-20 p-8 md:p-12 flex flex-col h-full">
                {/* Header: Competición */}
                <div className="text-center mb-auto">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                        <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                        <span className="text-sky-400 font-bold tracking-[0.2em] text-xs uppercase">
                            Jornada {nextWeek} {isMidweek ? '· Entre Semana' : ''} {nextMatch.competition && nextMatch.competition !== 'League' ? `· ${nextMatch.competition.replace(/_/g, ' ')}` : ''}
                        </span>
                    </div>
                </div>

                {/* Scoreboard Area */}
                <div className="flex items-center justify-center gap-8 md:gap-24 py-10">
                    {/* Home Team */}
                    <div className="flex flex-col items-center flex-1">
                        <div className="relative group-hover:scale-110 transition-transform duration-700 ease-out">
                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-700"></div>
                            <div className="w-24 h-24 md:w-40 md:h-40 relative z-10 drop-shadow-2xl">
                                <TeamLogo team={isHome ? gameState.team : opponent} />
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black mt-6 text-center tracking-tight text-white drop-shadow-md">
                            {isHome ? gameState.team.name : opponent.name}
                        </h2>
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500 mt-2">
                            {isHome ? 'Local' : 'Visitante'}
                        </span>
                    </div>

                    {/* Center: VS */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-5xl md:text-7xl font-black text-white/10 italic tracking-tighter">
                            VS
                        </div>
                        <div className="mt-4 px-3 py-1 rounded border border-white/5 bg-white/5 backdrop-blur-sm">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400">
                                Rival: <span className={opponent.tier === 'Top' ? 'text-red-400' : opponent.tier === 'Mid' ? 'text-yellow-400' : 'text-green-400'}>{opponent.tier}</span>
                            </span>
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1">
                        <div className="relative group-hover:scale-110 transition-transform duration-700 ease-out">
                             <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-700"></div>
                            <div className="w-24 h-24 md:w-40 md:h-40 relative z-10 drop-shadow-2xl">
                                <TeamLogo team={!isHome ? gameState.team : opponent} />
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black mt-6 text-center tracking-tight text-white drop-shadow-md">
                            {!isHome ? gameState.team.name : opponent.name}
                        </h2>
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500 mt-2">
                            {!isHome ? 'Local' : 'Visitante'}
                        </span>
                    </div>
                </div>

                {/* Footer: Actions */}
                <div className="mt-auto text-center pt-8">
                    <button
                        onClick={onPlayMatch}
                        className="relative overflow-hidden group/btn bg-white text-black font-black py-4 px-16 rounded-full transition-all duration-300 text-lg uppercase tracking-[0.2em] hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    >
                        <span className="relative z-10">Jugar Partido</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Barra de Estado Minimalista (Stats) ---
const MinimalStatsBar: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    const playerTeamRow = gameState.leagueTables[gameState.team.leagueId]?.find(row => row.teamId === gameState.team.id);

    const getPositionColor = (position: number | undefined) => {
        if (!position) return 'text-slate-500';
        if (position <= 4) return 'text-sky-400';
        if (position <= 6) return 'text-yellow-400';
        if (position >= 18) return 'text-red-400';
        return 'text-white';
    };

    const posColor = getPositionColor(playerTeamRow?.position);
    const boardConf = !isNaN(Number(gameState.boardConfidence)) ? Number(gameState.boardConfidence) : 75;
    const fanApp = !isNaN(Number(gameState.fanApproval?.rating)) ? Number(gameState.fanApproval.rating) : 60;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Directiva */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col justify-between group hover:bg-[#151515] transition-colors">
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-4">Directiva</span>
                <div className="flex items-end justify-between">
                    <span className="text-3xl font-light tracking-tighter text-white">
                        {boardConf}<span className="text-lg text-slate-500 ml-1">%</span>
                    </span>
                    <div className={`w-2 h-2 rounded-full ${boardConf >= 70 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : boardConf >= 40 ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                </div>
                <div className="w-full h-0.5 bg-white/5 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 transition-all duration-1000 ease-out" style={{ width: `${boardConf}%` }}></div>
                </div>
            </div>

            {/* Socios */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col justify-between group hover:bg-[#151515] transition-colors">
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-4">Afición</span>
                <div className="flex items-end justify-between">
                    <span className="text-3xl font-light tracking-tighter text-white">
                        {fanApp}<span className="text-lg text-slate-500 ml-1">%</span>
                    </span>
                    <div className={`w-2 h-2 rounded-full ${fanApp >= 60 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : fanApp >= 40 ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                </div>
                <div className="w-full h-0.5 bg-white/5 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 transition-all duration-1000 ease-out" style={{ width: `${fanApp}%` }}></div>
                </div>
            </div>

            {/* Posición */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col justify-between group hover:bg-[#151515] transition-colors">
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-4">Clasificación</span>
                <div className="flex items-end justify-between">
                    <span className={`text-3xl font-light tracking-tighter ${posColor}`}>
                        {playerTeamRow ? `${playerTeamRow.position}º` : '-'}
                    </span>
                </div>
                <div className="w-full h-0.5 bg-white/5 mt-4 rounded-full overflow-hidden">
                     <div className="h-full bg-sky-500 transition-all duration-1000 ease-out" style={{ width: `${playerTeamRow ? Math.max(5, 100 - (playerTeamRow.position * 5)) : 0}%` }}></div>
                </div>
            </div>

            {/* Fondos */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col justify-between group hover:bg-[#151515] transition-colors">
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-4">Presupuesto Fichajes</span>
                <div className="flex items-end justify-between">
                    <span className="text-2xl font-light tracking-tighter text-white truncate pr-2">
                        {formatCurrencyShort(gameState.finances.transferBudget)}
                    </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 font-medium tracking-wide">
                    BALANCE: {formatCurrencyShort(gameState.finances.balance)}
                </div>
            </div>
        </div>
    );
};

const MinimalInbox: React.FC<{ gameState: GameState, dispatch: React.Dispatch<GameAction> }> = ({ gameState, dispatch }) => {
    const { incomingOffers, allTeams, team } = gameState;
    const getTeamName = (id: number) => allTeams.find(t => t.id === id)?.name || 'Club';
    const getPlayerName = (id: number) => team.squad.find(p => p.id === id)?.name || 'Jugador';

    if (incomingOffers.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Ofertas Pendientes ({incomingOffers.length})
            </h3>
            <div className="space-y-2">
                {incomingOffers.slice(0, 3).map(offer => (
                    <div key={offer.id} className="bg-[#111] border border-white/5 p-4 rounded-xl flex justify-between items-center group hover:bg-[#151515] transition-colors">
                        <div>
                            <div className="text-sm font-bold text-white tracking-tight">{getPlayerName(offer.playerId)}</div>
                            <div className="text-xs text-slate-400 mt-1">Oferta de {getTeamName(offer.offeringTeamId)} <span className="text-green-400 font-medium ml-1">{formatCurrency(offer.offerValue)}</span></div>
                        </div>
                        <button
                            onClick={() => dispatch({ type: 'ACCEPT_OFFER', payload: { offerId: offer.id } })}
                            className="text-xs font-bold uppercase tracking-widest text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 transition-colors"
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
        <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
            
            {/* HERO SECTION - MatchDayCard */}
            <MatchDayCard
                gameState={gameState}
                matchPhase={matchPhase}
                onPlayMatch={onPlayMatch}
                pendingResults={pendingResults}
                onWeekComplete={onWeekComplete}
                dispatch={dispatch}
            />

            {/* STATS BAR */}
            <MinimalStatsBar gameState={gameState} />

            {/* TWO COLUMNS FOR SECONDARY CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 
                 {/* Left Column: Inbox & News */}
                 <div className="lg:col-span-7">
                    <MinimalInbox gameState={gameState} dispatch={dispatch} />

                    <div>
                        <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-4">Corporativo / Prensa</h3>
                        <div className="space-y-1">
                            {gameState.newsFeed.slice(0, 10).map((item, idx) => (
                                <div key={item.id} className="py-4 border-b border-white/5 group hover:pl-2 transition-all duration-300">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div className="flex items-center gap-2">
                                            {item.type && item.type !== 'standard' && (
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'achievement' ? 'bg-green-500' : item.type === 'warning' ? 'bg-red-500' : 'bg-purple-500'}`}></span>
                                            )}
                                            <h4 className={`text-sm font-bold tracking-tight ${item.type === 'achievement' ? 'text-green-400' : item.type === 'warning' ? 'text-red-400' : 'text-slate-200'}`}>
                                                {item.headline}
                                            </h4>
                                        </div>
                                        <span className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">{item.date}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                                        <LinkedText text={item.body} players={allPlayers} onPlayerClick={handlePlayerClick} />
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
                 
                 {/* Right Column: Calendar / Fixtures */}
                 <div className="lg:col-span-5">
                    {gameState.schedule.length > 0 && (
                        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <button onClick={() => setDisplayedWeek(w => Math.max(1, w - 1))} disabled={displayedWeek <= 1} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div className="text-center">
                                    <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Jornada</h3>
                                    <span className="text-2xl font-light text-white">{displayedWeek}</span>
                                </div>
                                <button onClick={() => setDisplayedWeek(w => Math.min(maxWeek, w + 1))} disabled={displayedWeek >= maxWeek} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                            
                            {/* We reuse WeeklyFixtures but wrap it so we don't have to rewrite the whole component. WeeklyFixtures has a transparent background by default, it just renders the list. */}
                            <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/20">
                                <WeeklyFixtures
                                    week={displayedWeek}
                                    matches={matchPhase === 'LIVE' && pendingResults ? pendingResults.playerMatchResult ? gameState.schedule : gameState.schedule : gameState.schedule}
                                    allTeams={gameState.allTeams}
                                    playerTeamId={gameState.team.id}
                                    playerTeamLeagueId={gameState.team.leagueId}
                                />
                            </div>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};
