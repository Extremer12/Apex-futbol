import React, { useState, useEffect, useMemo } from 'react';
import { GameState, Player, Team, Match, LeagueId } from '../../types';
import { GameAction } from '../../state/reducer';
import { LoadingSpinner, TrophyIcon, TrendingUpIcon, InboxIcon, UsersIcon } from '../icons';
import { LinkedText } from '../ui/LinkedText';
import { formatCurrencyShort, formatDate } from '../../utils';
import { MatchPhase } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';
import { MatchEngine } from '../gameflow/MatchEngine';
import { motion, AnimatePresence } from 'framer-motion';

// HELPER FOR PLAYER IMAGES
export const getPlayerImage = (name: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

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

// --- SUBCOMPONENTS ---

const CircularProgress: React.FC<{ value: number, label: string, color: string, status: string }> = ({ value, label, color, status }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="apex-card p-5 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <UsersIcon className="w-12 h-12" />
            </div>
            <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase mb-4">{label}</span>
            <div className="relative flex items-center justify-center mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                    <circle 
                        cx="48" cy="48" r={radius} stroke={color} strokeWidth="6" fill="transparent" 
                        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-white leading-none">{value}%</span>
                </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{status}</span>
            <span className="text-[8px] text-white/30 font-bold mt-1">+2% este mes</span>
        </div>
    );
};

const FinanceCard: React.FC<{ balance: number, budget: number }> = ({ balance, budget }) => {
    return (
        <div className="apex-card p-5 relative overflow-hidden group">
            <div className="flex flex-col h-full">
                <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase mb-4">Balance Financiero</span>
                <div className="mb-2">
                    <div className="text-2xl font-black text-white">{formatCurrencyShort(balance)}</div>
                    <div className="text-[9px] text-[var(--apex-green)] font-bold uppercase tracking-widest">+€12.4M este mes</div>
                </div>
                
                <div className="flex-1 min-h-[40px] flex items-end mb-4">
                    <svg viewBox="0 0 100 30" className="w-full h-10 overflow-visible">
                        <path 
                            d="M0,25 L15,20 L30,22 L45,15 L60,18 L75,10 L90,12 L100,5" 
                            fill="none" stroke="var(--apex-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="drop-shadow-[0_0_8px_rgba(200,168,78,0.5)]"
                        />
                        <circle cx="100" cy="5" r="3" fill="var(--apex-gold)" />
                    </svg>
                </div>

                <div className="flex justify-between items-end mt-auto pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-white/30 uppercase">Presupuesto de Temporada</span>
                        <span className="text-[10px] font-black text-white/60">{formatCurrencyShort(budget)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LeagueTableMini: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    const leagueId = gameState.team.leagueId;
    const table = gameState.leagueTables[leagueId] || [];
    const top5 = table.slice(0, 5);

    return (
        <div className="apex-card overflow-hidden h-full">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase">Clasificación</span>
                <span className="text-[8px] font-bold text-[var(--apex-gold)] uppercase">{gameState.team.competition || 'Liga Local'}</span>
            </div>
            <div className="p-0">
                <table className="w-full text-[10px]">
                    <thead>
                        <tr className="text-white/20 font-black uppercase tracking-widest border-b border-white/5">
                            <th className="px-4 py-2 text-left">Pos</th>
                            <th className="px-2 py-2 text-left">Club</th>
                            <th className="px-2 py-2 text-center">PJ</th>
                            <th className="px-2 py-2 text-center">DG</th>
                            <th className="px-4 py-2 text-right">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {top5.map((row, idx) => {
                            const team = gameState.allTeams.find(t => t.id === row.teamId);
                            const isPlayerTeam = row.teamId === gameState.team.id;
                            return (
                                <tr key={row.teamId} className={`${isPlayerTeam ? 'bg-[var(--apex-gold)]/10' : ''} hover:bg-white/5 transition-colors`}>
                                    <td className="px-4 py-2.5 font-black text-white/40">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1 h-3 rounded-full ${idx < 4 ? 'bg-blue-500' : 'bg-white/10'}`}></div>
                                            {row.position}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4">
                                                <TeamLogo team={team} />
                                            </div>
                                            <span className={`font-bold ${isPlayerTeam ? 'text-[var(--apex-gold)]' : 'text-white/80'}`}>{team?.shortName || team?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2.5 text-center text-white/60">{row.played}</td>
                                    <td className="px-2 py-2.5 text-center text-white/60">{row.goalsFor - row.goalsAgainst > 0 ? '+' : ''}{row.goalsFor - row.goalsAgainst}</td>
                                    <td className="px-4 py-2.5 text-right font-black text-white">{row.points}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <button className="w-full py-3 text-[8px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors border-t border-white/5 bg-black/10">
                    Ver Tabla Completa
                </button>
            </div>
        </div>
    );
};

const StadiumRevenueCard: React.FC = () => {
    return (
        <div className="apex-card p-5 relative overflow-hidden group">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                    <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase mb-4 block">Ingresos del Estadio</span>
                    <div className="text-3xl font-black text-white mb-1">€127.8M</div>
                    <div className="text-[9px] text-[var(--apex-green)] font-bold uppercase tracking-widest">+€18.3M este mes</div>
                </div>
                
                <div className="flex items-end gap-1.5 h-16">
                    {[30, 45, 25, 60, 40, 80, 55, 90, 70, 85].map((h, i) => (
                        <div 
                            key={i} 
                            className="w-2 bg-gradient-to-t from-[var(--apex-gold)] to-yellow-200 rounded-t-sm opacity-40 group-hover:opacity-100 transition-opacity" 
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-2 min-w-[120px]">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest border-b border-white/5 pb-1">
                        <span className="text-white/40">Día de Partido</span>
                        <span className="text-white">€68.4M</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest border-b border-white/5 pb-1">
                        <span className="text-white/40">Comercial</span>
                        <span className="text-white">€41.7M</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-white/40">Otros</span>
                        <span className="text-white">€17.7M</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HeroSection: React.FC<{
    gameState: GameState,
    onPlayMatch: () => void,
    onWeekComplete: () => void,
    matchPhase: MatchPhase,
    pendingResults: PendingSimulationResults | null,
    dispatch: React.Dispatch<GameAction>
}> = ({ gameState, onPlayMatch, onWeekComplete, matchPhase, pendingResults, dispatch }) => {
    useEffect(() => {
        // Auto-advance logic for weeks without player matches
        if (matchPhase === 'LIVE' && pendingResults && !pendingResults.playerMatchResult) {
            // Check if there are important things to stop for
            const hasNewOffers = gameState.incomingOffers.length > 0;
            const isTransferWindow = [0, 6, 7].includes(new Date(gameState.currentDate).getMonth());
            
            // If it's transfer window AND we have offers, maybe we should stop? 
            // Actually, the user wants it fast, so we only stop if they HAVE to play a match or if there's a major event.
            // But if there's NO match result, it means it's a simulated week.
            onWeekComplete();
        }
    }, [matchPhase, pendingResults, onWeekComplete, gameState.incomingOffers.length, gameState.currentDate]);

    const nextWeek = gameState.currentTurn === 'midweek' ? gameState.currentWeek + 1 : gameState.currentWeek;
    const isMidweek = gameState.currentTurn === 'midweek';
    const nextMatch = gameState.schedule.find(m => m.week === nextWeek && !!m.isMidweek === isMidweek && (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id));

    if (matchPhase === 'LIVE' && pendingResults?.playerMatchResult) {
        const isHome = nextMatch?.homeTeamId === gameState.team.id;
        const opponentId = isHome ? nextMatch?.awayTeamId : nextMatch?.homeTeamId;
        const opponent = gameState.allTeams.find(t => t.id === opponentId);
        
        return (
            <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-50 mb-6">
                 <MatchEngine
                    homeTeam={isHome ? gameState.team : opponent!}
                    awayTeam={!isHome ? gameState.team : opponent!}
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

    if (!nextMatch) {
        return (
            <div className="apex-card p-10 flex flex-col items-center justify-center min-h-[280px] text-center group">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 group-hover:border-[var(--apex-gold)]/50 transition-colors">
                    <UsersIcon className="w-8 h-8 text-[var(--apex-gold)] opacity-50" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Semana de Entrenamiento</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-8 max-w-xs">No hay partidos programados. La plantilla está enfocada en entrenamiento táctico y recuperación.</p>
                <button 
                    onClick={onPlayMatch}
                    className="apex-btn-gold w-full max-w-xs"
                >
                    Simular Semana
                </button>
            </div>
        );
    }

    const isHome = nextMatch.homeTeamId === gameState.team.id;
    const opponentId = isHome ? nextMatch.awayTeamId : nextMatch.homeTeamId;
    const opponent = gameState.allTeams.find(t => t.id === opponentId);

    return (
        <div className="apex-card p-6 relative overflow-hidden group min-h-[280px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <TrophyIcon className="w-48 h-48 text-[var(--apex-gold)]" />
            </div>
            
            <div className="flex justify-between items-center mb-6">
                <span className="text-[9px] font-black tracking-[0.3em] text-[var(--apex-gold)] uppercase">Próximo Partido</span>
                <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase">{nextMatch.competition || 'Liga'}</span>
            </div>

            <div className="flex items-center justify-around flex-1 mb-8">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <TeamLogo team={isHome ? gameState.team : opponent} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-tighter">{isHome ? gameState.team.shortName || gameState.team.name : opponent?.shortName || opponent?.name}</span>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-4xl font-black italic text-white/10">VS</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <TeamLogo team={!isHome ? gameState.team : opponent} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-tighter">{!isHome ? gameState.team.shortName || gameState.team.name : opponent?.shortName || opponent?.name}</span>
                </div>
            </div>

            <div className="flex flex-col items-center gap-1 mb-8">
                <span className="text-[10px] font-black text-white uppercase">Jornada {nextWeek} • 16:30</span>
                <div className="flex items-center gap-2 text-white/40">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeWidth={2} /></svg>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{isHome ? gameState.team.stadiumName : opponent?.stadiumName}</span>
                </div>
            </div>

            <button 
                onClick={onPlayMatch}
                className="w-full py-4 bg-gradient-to-r from-[var(--apex-gold)] to-yellow-600 text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_30px_rgba(200,168,78,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn"
            >
                {nextMatch ? 'Jugar Jornada' : 'Simular Semana'}
                <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
        </div>
    );
};

// --- EXPORTED DASHBOARD ---

export const Dashboard: React.FC<DashboardProps> = ({ gameState, onPlayMatch, matchPhase, pendingResults, onWeekComplete, allPlayers, dispatch }) => {
    const handlePlayerClick = (playerName: string) => {
        const player = allPlayers.find(p => p.name === playerName);
        if (player) dispatch({ type: 'SET_VIEWING_PLAYER', payload: player });
    };

    return (
        <div className="relative min-h-screen">
            {/* Background Image */}
            <div className="fixed inset-0 z-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] ease-out animate-slow-zoom"
                    style={{ 
                        backgroundImage: 'url("/bg-dashboard.png")',
                        filter: 'brightness(0.4) saturate(0.8)'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--apex-dark)]/40 via-[var(--apex-dark)]/80 to-[var(--apex-dark)]" />
            </div>

            <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto space-y-6 pb-24">
                {/* Top Greeting */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-1">
                        Buenas Noches, <span className="text-[var(--apex-gold)]">Presidente</span>
                    </h1>
                    <p className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Esto es lo que está sucediendo en tu club.</p>
                </div>
                <div className="apex-card px-5 py-3 flex items-center gap-4 bg-black/40 border-white/5">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{formatDate(gameState.currentDate)}</span>
                        <span className="text-[8px] font-bold text-white/30 uppercase">
                            {new Date(gameState.currentDate).toLocaleDateString('es-ES', { weekday: 'long' })}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                        <TrendingUpIcon className="w-5 h-5 text-[var(--apex-gold)]" />
                    </div>
                </div>
            </div>

            {/* Main Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                    <HeroSection 
                        gameState={gameState} 
                        onPlayMatch={onPlayMatch} 
                        onWeekComplete={onWeekComplete} 
                        matchPhase={matchPhase} 
                        pendingResults={pendingResults} 
                        dispatch={dispatch} 
                    />
                </div>
                <div className="lg:col-span-5">
                    <LeagueTableMini gameState={gameState} />
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <FinanceCard balance={gameState.finances.balance} budget={gameState.finances.transferBudget} />
                <CircularProgress 
                    value={gameState.fanApproval.rating} 
                    label="Aprobación Fans" 
                    color="var(--apex-green)" 
                    status={gameState.fanApproval.rating > 70 ? "Muy Alta" : gameState.fanApproval.rating > 50 ? "Estable" : "Baja"} 
                />
                <CircularProgress 
                    value={gameState.boardConfidence} 
                    label="Confianza Directiva" 
                    color="var(--apex-gold)" 
                    status={gameState.boardConfidence > 70 ? "Alta" : gameState.boardConfidence > 40 ? "Buena" : "Crítica"} 
                />
            </div>

            <StadiumRevenueCard />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* News */}
                <div className="lg:col-span-7 apex-card overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                        <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase">Últimas Noticias</span>
                    </div>
                    <div className="p-5 space-y-6">
                        {gameState.newsFeed.slice(0, 3).map((item, idx) => (
                            <div key={item.id} className="flex gap-4 group cursor-pointer">
                                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                                    <img 
                                        src={`https://images.unsplash.com/photo-${idx === 0 ? '1574629810360-7efbbe195018' : idx === 1 ? '1511886929837-354d827aae26' : '1522778119026-d647f0596c20'}?auto=format&fit=crop&q=80&w=400`} 
                                        alt="News" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-white leading-tight group-hover:text-[var(--apex-gold)] transition-colors mb-1">{item.headline}</h4>
                                    <p className="text-[10px] text-white/50 line-clamp-2">
                                        <LinkedText text={item.body} players={allPlayers} onPlayerClick={handlePlayerClick} />
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transfers */}
                <div className="lg:col-span-5 apex-card overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                        <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase">Actualizaciones de Mercado</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {[
                            { name: 'J. Bellingham', pos: 'MC', club: 'Real Madrid', type: 'Objetivo' },
                            { name: 'A. Davies', pos: 'LI', club: 'Bayern München', type: 'Objetivo' },
                            { name: 'V. Osimhen', pos: 'DC', club: 'Napoli', type: 'Rumor' }
                        ].map((p, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                                <img src={getPlayerImage(p.name)} alt={p.name} className="w-12 h-12 rounded-full border-2 border-white/10 bg-slate-800" />
                                <div className="flex-1">
                                    <div className="text-xs font-black text-white group-hover:text-[var(--apex-gold)]">{p.name}</div>
                                    <div className="text-[9px] text-white/40 font-bold uppercase">{p.pos} • {p.club}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.type === 'Objetivo' ? 'bg-[var(--apex-green)]/10 text-[var(--apex-green)]' : 'bg-orange-500/10 text-orange-400'}`}>
                                    {p.type}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
