import React, { useState, useMemo } from 'react';
import { GameState, Player, MatchPhase, NewsItem } from '../../types';
import { GameAction } from '../../state/reducer';
import { TrendingUpIcon } from '../icons';
import { LinkedText } from '../ui/LinkedText';
import { formatDate, formatCurrency, formatCurrencyShort } from '../../utils';
import { CircularProgress } from './dashboard/CircularProgress';
import { FinanceCard } from './dashboard/FinanceCard';
import { LeagueTableMini } from './dashboard/LeagueTableMini';
import { StadiumRevenueCard } from './dashboard/StadiumRevenueCard';
import { HeroSection, PendingSimulationResults } from './dashboard/HeroSection';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { X, ArrowRight, Newspaper, Landmark, Award, ShieldAlert } from 'lucide-react';

// HELPER FOR PLAYER IMAGES (backwards compatibility)
export const getPlayerImage = (name: string) => `https://images.fotmob.com/image_resources/playerimages/737066.png`;

interface DashboardProps {
    gameState: GameState;
    onPlayMatch: () => void;
    matchPhase: MatchPhase;
    pendingResults: PendingSimulationResults | null;
    onWeekComplete: () => void;
    allPlayers?: Player[];
    dispatch: React.Dispatch<GameAction>;
    isSimulating?: boolean;
    onStartNewSeason?: () => void;
    onOpenSeasonEndModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = React.memo(({
    gameState,
    onPlayMatch,
    matchPhase,
    pendingResults,
    onWeekComplete,
    allPlayers: propAllPlayers,
    dispatch,
    isSimulating = false,
    onStartNewSeason,
    onOpenSeasonEndModal
}) => {
    // Encapsulated league players memo to avoid prop drilling from root App
    const allPlayers = useMemo(() => {
        if (propAllPlayers && propAllPlayers.length > 0) return propAllPlayers;
        if (!gameState?.team) return [];
        const userLeagueId = gameState.team.leagueId;
        return gameState.allTeams
            .filter(t => t.leagueId === userLeagueId || t.id === gameState.team.id)
            .flatMap(t => t.squad);
    }, [propAllPlayers, gameState?.allTeams, gameState?.team?.leagueId, gameState?.team?.id]);
    const handlePlayerClick = (playerName: string) => {
        let player = allPlayers.find(p => p.name === playerName);
        if (!player && gameState) {
            for (const t of gameState.allTeams) {
                const found = t.squad.find(p => p.name === playerName);
                if (found) {
                    player = found;
                    break;
                }
            }
        }
        if (player) dispatch({ type: 'SET_VIEWING_PLAYER', payload: player });
    };

    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

    // Helper to identify associated player in news
    const findAssociatedPlayer = (item: NewsItem): Player | undefined => {
        if (item.playerId) {
            const p = allPlayers.find(pl => pl.id === item.playerId);
            if (p) return p;
        }
        if (item.playerName) {
            const p = allPlayers.find(pl => pl.name.toLowerCase() === item.playerName!.toLowerCase());
            if (p) return p;
        }
        for (const p of allPlayers) {
            if (p.name.length > 3 && (item.headline.includes(p.name) || item.body.includes(p.name))) {
                return p;
            }
        }
        return undefined;
    };

    // Authentic market opportunities for the club
    const marketTargets = useMemo(() => {
        const playerTeamId = gameState.team.id;
        const targets: { player: Player; clubName: string; tag: string; tagColor: string }[] = [];

        // 1. Transfer-listed players from rivals
        for (const t of gameState.allTeams) {
            if (t.id === playerTeamId) continue;
            for (const p of t.squad) {
                if (p.isTransferListed) {
                    targets.push({
                        player: p,
                        clubName: t.name,
                        tag: 'Transferible',
                        tagColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    });
                    if (targets.length >= 4) break;
                }
            }
            if (targets.length >= 4) break;
        }

        // 2. Expiring contract players (1 year left)
        if (targets.length < 4) {
            for (const t of gameState.allTeams) {
                if (t.id === playerTeamId) continue;
                for (const p of t.squad) {
                    if (p.contractYears <= 1 && p.rating >= 80 && !targets.some(x => x.player.id === p.id)) {
                        targets.push({
                            player: p,
                            clubName: t.name,
                            tag: 'Fin Contrato',
                            tagColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        });
                        if (targets.length >= 4) break;
                    }
                }
                if (targets.length >= 4) break;
            }
        }

        // 3. Top Stars in market
        if (targets.length < 4) {
            for (const t of gameState.allTeams) {
                if (t.id === playerTeamId) continue;
                for (const p of t.squad) {
                    if (p.rating >= 85 && !targets.some(x => x.player.id === p.id)) {
                        targets.push({
                            player: p,
                            clubName: t.name,
                            tag: 'Estrella Top',
                            tagColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        });
                        if (targets.length >= 4) break;
                    }
                }
                if (targets.length >= 4) break;
            }
        }

        return targets;
    }, [gameState.team.id, gameState.allTeams]);

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
                            isSimulating={isSimulating}
                            onStartNewSeason={onStartNewSeason}
                            onOpenSeasonEndModal={onOpenSeasonEndModal}
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

                <StadiumRevenueCard gameState={gameState} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* News Feed */}
                    <div className="lg:col-span-7 apex-card overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Newspaper className="w-4 h-4 text-[var(--apex-gold)]" />
                                <span className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase">Últimas Noticias</span>
                            </div>
                            <span className="text-[9px] text-white/30 font-bold uppercase">{gameState.newsFeed.length} registradas</span>
                        </div>
                        <div className="p-4 sm:p-5 space-y-4 divide-y divide-white/5">
                            {gameState.newsFeed.slice(0, 3).map((item, idx) => {
                                const assocPlayer = findAssociatedPlayer(item);
                                return (
                                    <div 
                                        key={item.id} 
                                        onClick={() => setSelectedNews(item)}
                                        className={`flex gap-3 sm:gap-4 group cursor-pointer transition-all hover:bg-white/[0.02] p-2 rounded-xl -mx-2 ${idx > 0 ? 'pt-4' : ''}`}
                                    >
                                        {/* News Thumbnail / Player Photo */}
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 bg-black/40 relative flex items-center justify-center">
                                            {assocPlayer || item.playerPhoto ? (
                                                <div className="w-full h-full relative bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                                                    <PlayerAvatar 
                                                        player={assocPlayer || { name: item.playerName || '', photo: item.playerPhoto }}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            ) : (
                                                <img 
                                                    src={`https://images.unsplash.com/photo-${idx === 0 ? '1574629810360-7efbbe195018' : idx === 1 ? '1511886929837-354d827aae26' : '1522778119026-d647f0596c20'}?auto=format&fit=crop&q=80&w=400`} 
                                                    alt="News" 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/sinlogo.png';
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* News Text */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-1.5 py-0.5 rounded">
                                                        {item.date || 'Actualidad'}
                                                    </span>
                                                    {item.type === 'transfer' && (
                                                        <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                            Fichaje
                                                        </span>
                                                    )}
                                                    {item.type === 'match' && (
                                                        <span className="text-[8px] font-extrabold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                                                            Partido
                                                        </span>
                                                    )}
                                                    {assocPlayer && (
                                                        <span className="text-[8px] font-bold text-white/40 uppercase">
                                                            {assocPlayer.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-xs sm:text-sm font-black text-white leading-snug group-hover:text-[var(--apex-gold)] transition-colors line-clamp-2 mb-1">
                                                    {item.headline}
                                                </h4>
                                                <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed break-words">
                                                    {item.body.replace(/\\n/g, ' ')}
                                                </p>
                                            </div>
                                            <div className="pt-1 flex items-center gap-1 text-[9px] font-bold text-[var(--apex-gold)] opacity-80 group-hover:opacity-100 transition-opacity">
                                                <span>Leer noticia completa</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Radar de Fichajes */}
                    <div className="lg:col-span-5 apex-card overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase">Radar de Fichajes</span>
                                <div className="text-[8px] font-bold text-white/30 uppercase">Oportunidades de Mercado</div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border border-[var(--apex-gold)]/20">
                                Scouting
                            </span>
                        </div>
                        <div className="p-4 space-y-2.5 flex-1">
                            {marketTargets.map((target) => (
                                <div 
                                    key={target.player.id} 
                                    onClick={() => handlePlayerClick(target.player.name)}
                                    className="flex items-center gap-3 p-2.5 bg-black/30 hover:bg-white/[0.03] rounded-xl border border-white/5 hover:border-[var(--apex-gold)]/30 transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-xl border border-white/10 bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden relative">
                                        <PlayerAvatar 
                                            player={target.player} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-black text-white group-hover:text-[var(--apex-gold)] truncate transition-colors">
                                                {target.player.name}
                                            </span>
                                            <span className="text-[9px] font-black px-1.5 py-0.2 bg-white/10 text-white/90 rounded shrink-0">
                                                {target.player.rating}
                                            </span>
                                        </div>
                                        <div className="text-[9px] text-white/40 font-bold uppercase truncate flex items-center gap-1.5">
                                            <span className="text-white/60 font-black">{target.player.position}</span>
                                            <span>•</span>
                                            <span className="truncate">{target.clubName}</span>
                                            <span>•</span>
                                            <span className="text-emerald-400 font-semibold">{formatCurrencyShort(target.player.value)}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase shrink-0 border ${target.tagColor}`}>
                                        {target.tag}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Detalle de Noticia */}
            {selectedNews && (
                <div 
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedNews(null)}
                >
                    <div 
                        className="relative w-full max-w-lg bg-gradient-to-b from-[#151c2a] to-[#0a0e17] border border-[var(--apex-gold)]/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/30">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2.5 py-1 rounded border border-[var(--apex-gold)]/30">
                                    {selectedNews.type === 'transfer' ? 'MERCADO DE PASES' : selectedNews.type === 'match' ? 'CRÓNICA DEL PARTIDO' : 'COMUNICADO OFICIAL'}
                                </span>
                                <span className="text-[10px] font-bold text-white/40 uppercase">
                                    {selectedNews.date || 'Hoy'}
                                </span>
                            </div>
                            <button 
                                onClick={() => setSelectedNews(null)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto space-y-4">
                            {/* If associated player, show highlight banner */}
                            {(() => {
                                const assocPlayer = findAssociatedPlayer(selectedNews);
                                if (!assocPlayer) return null;
                                return (
                                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl border border-white/15 bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                                                <PlayerAvatar player={assocPlayer} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-black text-white">{assocPlayer.name}</span>
                                                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] rounded">
                                                        {assocPlayer.rating} OVR
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-white/40 uppercase font-bold">
                                                    {assocPlayer.position} • Valor: {formatCurrencyShort(assocPlayer.value)}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedNews(null);
                                                handlePlayerClick(assocPlayer.name);
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-[var(--apex-gold)] text-black text-[10px] font-black uppercase tracking-wider hover:brightness-110 transition-all shrink-0"
                                        >
                                            Ver Perfil
                                        </button>
                                    </div>
                                );
                            })()}

                            <h3 className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
                                {selectedNews.headline}
                            </h3>

                            <div className="h-px w-full bg-gradient-to-r from-[var(--apex-gold)]/40 via-white/10 to-transparent" />

                            <div className="text-white/80 text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words space-y-2">
                                <LinkedText 
                                    text={selectedNews.body.replace(/\\n/g, '\n')} 
                                    players={allPlayers} 
                                    onPlayerClick={(name) => {
                                        setSelectedNews(null);
                                        handlePlayerClick(name);
                                    }} 
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
                            <button
                                onClick={() => setSelectedNews(null)}
                                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider transition-all"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
