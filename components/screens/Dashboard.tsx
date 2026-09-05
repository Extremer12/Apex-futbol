import React from 'react';
import { GameState, Player, MatchPhase } from '../../types';
import { GameAction } from '../../state/reducer';
import { TrendingUpIcon } from '../icons';
import { LinkedText } from '../ui/LinkedText';
import { formatDate } from '../../utils';
import { CircularProgress } from './dashboard/CircularProgress';
import { FinanceCard } from './dashboard/FinanceCard';
import { LeagueTableMini } from './dashboard/LeagueTableMini';
import { StadiumRevenueCard } from './dashboard/StadiumRevenueCard';
import { HeroSection, PendingSimulationResults } from './dashboard/HeroSection';

// HELPER FOR PLAYER IMAGES (exported for other components)
export const getPlayerImage = (name: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

interface DashboardProps {
    gameState: GameState;
    onPlayMatch: () => void;
    matchPhase: MatchPhase;
    pendingResults: PendingSimulationResults | null;
    onWeekComplete: () => void;
    allPlayers: Player[];
    dispatch: React.Dispatch<GameAction>;
}

export const Dashboard: React.FC<DashboardProps> = ({
    gameState,
    onPlayMatch,
    matchPhase,
    pendingResults,
    onWeekComplete,
    allPlayers,
    dispatch
}) => {
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
        </div>
    );
};
