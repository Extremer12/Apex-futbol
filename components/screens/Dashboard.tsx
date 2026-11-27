import React, { useState, useMemo, useCallback } from 'react';
import { GameState, Player, MatchPhase, NewsItem } from '../../types';
import { GameAction } from '../../state/reducer';
import { getGlobalPlayerIndex, getLeaguePlayersIndex, getMarketOpportunities } from '../../services/playerIndex';
import { formatCurrencyShort } from '../../utils';
import { CircularProgress } from './dashboard/CircularProgress';
import { FinanceCard } from './dashboard/FinanceCard';
import { LeagueTableMini } from './dashboard/LeagueTableMini';
import { StadiumRevenueCard } from './dashboard/StadiumRevenueCard';
import { HeroSection, PendingSimulationResults } from './dashboard/HeroSection';
import { DashboardNewsCard } from './dashboard/DashboardNewsCard';
import { NewsReaderModal } from './news/NewsReaderModal';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { Compass } from 'lucide-react';
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
    const globalIndex = useMemo(() => getGlobalPlayerIndex(gameState?.allTeams), [gameState?.allTeams]);

    const { allPlayers, leaguePlayersById, leaguePlayersByName } = useMemo(() => {
        if (propAllPlayers && propAllPlayers.length > 0) {
            const byId = new Map<number, Player>();
            const byName = new Map<string, Player>();
            for (const p of propAllPlayers) {
                byId.set(p.id, p);
                byName.set(p.name.toLowerCase(), p);
            }
            return { allPlayers: propAllPlayers, leaguePlayersById: byId, leaguePlayersByName: byName };
        }
        const leagueProj = getLeaguePlayersIndex(gameState?.allTeams, gameState?.team?.leagueId, gameState?.team?.id);
        return {
            allPlayers: leagueProj.leaguePlayers,
            leaguePlayersById: leagueProj.leaguePlayersById,
            leaguePlayersByName: leagueProj.leaguePlayersByName
        };
    }, [propAllPlayers, gameState?.allTeams, gameState?.team?.leagueId, gameState?.team?.id]);

    const {
        playersById: allPlayersById,
        playersByName: allPlayersByName,
        playersByNameLower: allPlayersByNameLower,
        teamsById
    } = globalIndex;

    const handlePlayerClick = useCallback((playerName: string) => {
        const player = leaguePlayersByName.get(playerName.toLowerCase()) || allPlayersByName.get(playerName);
        if (player) dispatch({ type: 'SET_VIEWING_PLAYER', payload: player });
    }, [leaguePlayersByName, allPlayersByName, dispatch]);

    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

    const findAssociatedPlayer = useCallback((item: NewsItem): Player | undefined => {
        if (item.playerId) {
            const p = leaguePlayersById.get(item.playerId) || allPlayersById.get(item.playerId);
            if (p) return p;
        }
        if (item.playerName) {
            const p = leaguePlayersByName.get(item.playerName.toLowerCase()) || allPlayersByNameLower.get(item.playerName.toLowerCase());
            if (p) return p;
        }
        for (const p of (gameState.team?.squad || [])) {
            if (p.name.length > 3 && (item.headline.includes(p.name) || item.body.includes(p.name))) {
                return p;
            }
        }
        return undefined;
    }, [gameState.team?.squad, leaguePlayersById, allPlayersById, leaguePlayersByName, allPlayersByNameLower]);

    const marketTargets = useMemo(
        () => getMarketOpportunities(gameState.allTeams, gameState.team.id, 4),
        [gameState.team.id, gameState.allTeams]
    );

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
                {/* Digital News Hub Widget */}
                <DashboardNewsCard
                    newsFeed={gameState.newsFeed}
                    userTeam={gameState.team}
                    teamsById={teamsById}
                    findAssociatedPlayer={findAssociatedPlayer}
                    onOpenArticle={setSelectedNews}
                />

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

            {/* Full-Screen Digital Press Reader */}
            {selectedNews && (
                <NewsReaderModal
                    initialArticle={selectedNews}
                    newsFeed={gameState.newsFeed}
                    userTeam={gameState.team}
                    allPlayers={allPlayers}
                    teamsById={teamsById}
                    findAssociatedPlayer={findAssociatedPlayer}
                    onPlayerClick={handlePlayerClick}
                    onClose={() => setSelectedNews(null)}
                />
            )}
        </div>
    );
});
