import React, { useState, useMemo, useCallback } from 'react';
import { GameState, Player, MatchPhase, NewsItem } from '../../types';
import { GameAction } from '../../state/reducer';
import { LinkedText } from '../ui/LinkedText';
import { formatCurrencyShort } from '../../utils';
import { CircularProgress } from './dashboard/CircularProgress';
import { FinanceCard } from './dashboard/FinanceCard';
import { LeagueTableMini } from './dashboard/LeagueTableMini';
import { StadiumRevenueCard } from './dashboard/StadiumRevenueCard';
import { HeroSection, PendingSimulationResults } from './dashboard/HeroSection';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { X, Newspaper, Compass } from 'lucide-react';
import { resourceManager } from '../../services/resources/ResourceManager';

export const getPlayerImage = (name: string) => resourceManager.playerFace(undefined, { name });

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
    const allPlayers = useMemo(() => {
        if (propAllPlayers && propAllPlayers.length > 0) return propAllPlayers;
        if (!gameState?.team) return [];
        const userLeagueId = gameState.team.leagueId;
        return gameState.allTeams
            .filter(t => t.leagueId === userLeagueId || t.id === gameState.team.id)
            .flatMap(t => t.squad);
    }, [propAllPlayers, gameState?.allTeams, gameState?.team?.leagueId, gameState?.team?.id]);

    const handlePlayerClick = useCallback((playerName: string) => {
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
    }, [allPlayers, gameState, dispatch]);

    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

    const findAssociatedPlayer = useCallback((item: NewsItem): Player | undefined => {
        if (item.playerId) {
            const p = allPlayers.find(pl => pl.id === item.playerId);
            if (p) return p;
        }
        if (item.playerName) {
            const lower = item.playerName.toLowerCase();
            const p = allPlayers.find(pl => pl.name.toLowerCase() === lower);
            if (p) return p;
        }
        for (const p of allPlayers) {
            if (p.name.length > 3 && (item.headline.includes(p.name) || item.body.includes(p.name))) {
                return p;
            }
        }
        return undefined;
    }, [allPlayers]);

    const visibleNews = useMemo(() => {
        return gameState.newsFeed.slice(0, 3).map(item => ({
            item,
            assocPlayer: findAssociatedPlayer(item)
        }));
    }, [gameState.newsFeed, findAssociatedPlayer]);

    const marketTargets = useMemo(() => {
        const playerTeamId = gameState.team.id;
        const targets: { player: Player; clubName: string; tag: string }[] = [];

        for (const t of gameState.allTeams) {
            if (t.id === playerTeamId) continue;
            for (const p of t.squad) {
                if (p.isTransferListed) {
                    targets.push({ player: p, clubName: t.shortName || t.name, tag: 'Transferible' });
                    if (targets.length >= 4) break;
                }
            }
            if (targets.length >= 4) break;
        }

        if (targets.length < 4) {
            for (const t of gameState.allTeams) {
                if (t.id === playerTeamId) continue;
                for (const p of t.squad) {
                    if (p.contractYears <= 1 && p.rating >= 80 && !targets.some(x => x.player.id === p.id)) {
                        targets.push({ player: p, clubName: t.shortName || t.name, tag: 'Fin Contrato' });
                        if (targets.length >= 4) break;
                    }
                }
                if (targets.length >= 4) break;
            }
        }

        if (targets.length < 4) {
            for (const t of gameState.allTeams) {
                if (t.id === playerTeamId) continue;
                for (const p of t.squad) {
                    if (p.rating >= 85 && !targets.some(x => x.player.id === p.id)) {
                        targets.push({ player: p, clubName: t.shortName || t.name, tag: 'Destacado' });
                        if (targets.length >= 4) break;
                    }
                }
                if (targets.length >= 4) break;
            }
        }

        return targets;
    }, [gameState.team.id, gameState.allTeams]);

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-5 pb-24">
            {/* Row 1: Next Match & League Standings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
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

            {/* Row 2: Executive Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FinanceCard balance={gameState.finances.balance} budget={gameState.finances.transferBudget} />
                <CircularProgress 
                    value={gameState.fanApproval.rating} 
                    label="Aprobación Socios" 
                    color="#10B981" 
                    status={gameState.fanApproval.rating > 70 ? "Muy Alta" : gameState.fanApproval.rating > 50 ? "Estable" : "Baja"} 
                />
                <CircularProgress 
                    value={gameState.boardConfidence} 
                    label="Confianza Directiva" 
                    color="#C8A84E" 
                    status={gameState.boardConfidence > 70 ? "Sólida" : gameState.boardConfidence > 40 ? "Estable" : "En Riesgo"} 
                />
            </div>

            {/* Row 3: Stadium Summary */}
            <StadiumRevenueCard gameState={gameState} />

            {/* Row 4: News & Scouting Targets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
                {/* News Feed */}
                <div className="lg:col-span-7 apex-card overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Newspaper className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                            <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Noticias del Club</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">{gameState.newsFeed.length} notas</span>
                    </div>
                    <div className="divide-y divide-white/5 flex-1">
                        {visibleNews.map(({ item, assocPlayer }) => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedNews(item)}
                                className="flex items-start gap-3 p-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                            >
                                {(assocPlayer || item.playerPhoto) && (
                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 bg-slate-900 mt-0.5">
                                        <PlayerAvatar 
                                            player={assocPlayer || { name: item.playerName || '', photo: item.playerPhoto }}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-bold uppercase text-[var(--apex-gold)]">
                                            {item.type === 'transfer' ? 'Mercado' : item.type === 'match' ? 'Partido' : 'Club'}
                                        </span>
                                        <span className="text-slate-600 text-[9px]">•</span>
                                        <span className="text-[9px] font-medium text-slate-500">{item.date || 'Reciente'}</span>
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[var(--apex-gold)] transition-colors line-clamp-1 mb-0.5">
                                        {item.headline}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 line-clamp-1">
                                        {item.body.replace(/\\n/g, ' ')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Market Radar */}
                <div className="lg:col-span-5 apex-card overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Compass className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Oportunidades de Mercado</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">Ojeo</span>
                    </div>
                    <div className="divide-y divide-white/5 flex-1">
                        {marketTargets.map((target) => (
                            <div 
                                key={target.player.id} 
                                onClick={() => handlePlayerClick(target.player.name)}
                                className="flex items-center justify-between gap-3 p-3 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <PlayerAvatar 
                                        player={target.player} 
                                        className="w-9 h-9" 
                                    />
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-white group-hover:text-[var(--apex-gold)] truncate transition-colors">
                                            {target.player.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium truncate">
                                            {target.player.position} • {target.clubName} • <span className="text-emerald-400 font-semibold">{formatCurrencyShort(target.player.value)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[9px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                        {target.tag}
                                    </span>
                                    <span className="w-7 h-7 rounded-lg bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 flex items-center justify-center text-xs font-black">
                                        {target.player.rating}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* News Detail Modal */}
            {selectedNews && (
                <div 
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedNews(null)}
                >
                    <div 
                        className="relative w-full max-w-lg bg-[#101624] border border-white/15 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase text-[var(--apex-gold)]">
                                    {selectedNews.type === 'transfer' ? 'Mercado de Pases' : selectedNews.type === 'match' ? 'Crónica del Partido' : 'Comunicado Oficial'}
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="text-[10px] font-medium text-slate-400">
                                    {selectedNews.date || 'Hoy'}
                                </span>
                            </div>
                            <button 
                                onClick={() => setSelectedNews(null)}
                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                            {(() => {
                                const assocPlayer = findAssociatedPlayer(selectedNews);
                                if (!assocPlayer) return null;
                                return (
                                    <div className="p-3 bg-black/30 border border-white/10 rounded-xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <PlayerAvatar player={assocPlayer} className="w-10 h-10" />
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-white">{assocPlayer.name}</span>
                                                    <span className="text-[10px] font-black px-1.5 py-0.5 bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] rounded">
                                                        {assocPlayer.rating}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {assocPlayer.position} • {formatCurrencyShort(assocPlayer.value)}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedNews(null);
                                                handlePlayerClick(assocPlayer.name);
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-[var(--apex-gold)] text-black text-[10px] font-bold uppercase hover:brightness-110 transition-all shrink-0 cursor-pointer"
                                        >
                                            Ver Ficha
                                        </button>
                                    </div>
                                );
                            })()}

                            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                                {selectedNews.headline}
                            </h3>

                            <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words">
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

                        <div className="px-5 py-3 border-t border-white/10 bg-black/20 flex justify-end">
                            <button
                                onClick={() => setSelectedNews(null)}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
