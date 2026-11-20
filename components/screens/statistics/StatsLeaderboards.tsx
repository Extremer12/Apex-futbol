import React, { useState } from 'react';
import { Player } from '../../../types';
import { TeamLogo, PlayerPhoto } from '../../../data/teams/helpers';
import { PlayerStats } from './types';

interface StatsLeaderboardsProps {
    topScorers: PlayerStats[];
    topAssists: PlayerStats[];
    topCleanSheets?: PlayerStats[];
    topMVPs?: PlayerStats[];
    isLeague: boolean;
    onSelectPlayer: (player: Player) => void;
}

type TabType = 'all' | 'scorers' | 'assists' | 'cleansheets' | 'mvp';

export const StatsLeaderboards: React.FC<StatsLeaderboardsProps> = React.memo(({
    topScorers,
    topAssists,
    topCleanSheets = [],
    topMVPs = [],
    isLeague,
    onSelectPlayer,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const renderTable = (
        title: string,
        icon: string,
        themeColor: 'gold' | 'sky' | 'emerald' | 'purple',
        metricHeader: string,
        getMetricValue: (s: PlayerStats) => string | number,
        getMetricSubtext: (s: PlayerStats) => string,
        items: PlayerStats[],
        emptyText: string
    ) => {
        const badgeClasses = {
            gold: 'text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]/20',
            sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
        }[themeColor];

        const textAccent = {
            gold: 'text-[var(--apex-gold)]',
            sky: 'text-sky-400',
            emerald: 'text-emerald-400',
            purple: 'text-purple-400'
        }[themeColor];

        return (
            <div className="bg-[#0E131F] border border-white/10 rounded-2xl overflow-hidden shadow-xl w-full flex flex-col">
                <div className="bg-gradient-to-r from-black/60 to-black/30 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5">
                        <span className="text-base sm:text-lg">{icon}</span>
                        <span>{title}</span>
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeClasses}`}>
                        Top {items.length}
                    </span>
                </div>

                <div className="p-0 w-full overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                        <thead>
                            <tr className="text-white/40 text-[9px] font-black uppercase tracking-[0.15em] border-b border-white/5 bg-black/20">
                                <th className="w-10 px-3 py-2.5 text-center">#</th>
                                <th className="px-3 py-2.5 text-left">Jugador</th>
                                <th className="w-12 px-2 py-2.5 text-center">Club</th>
                                <th className="w-24 px-4 py-2.5 text-right">{metricHeader}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {items.length > 0 ? (
                                items.map((stat, idx) => (
                                    <tr 
                                        key={`${stat.player?.id || idx}-${idx}`} 
                                        onClick={() => stat.player && onSelectPlayer(stat.player)}
                                        className="group hover:bg-white/5 transition-colors cursor-pointer"
                                        title="Ver perfil del jugador"
                                    >
                                        {/* Rank / Podium Badge */}
                                        <td className="w-10 px-3 py-2.5 sm:py-3 text-center">
                                            {idx === 0 ? (
                                                <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black text-[10px] inline-flex items-center justify-center shadow-md shadow-amber-400/30">
                                                    1
                                                </span>
                                            ) : idx === 1 ? (
                                                <span className="w-5 h-5 rounded-full bg-slate-300 text-black font-black text-[10px] inline-flex items-center justify-center shadow-md shadow-slate-300/30">
                                                    2
                                                </span>
                                            ) : idx === 2 ? (
                                                <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[10px] inline-flex items-center justify-center shadow-md shadow-amber-700/30">
                                                    3
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-white/30">
                                                    {idx + 1}
                                                </span>
                                            )}
                                        </td>

                                        {/* Player Photo & Name */}
                                        <td className="px-3 py-2.5 sm:py-3">
                                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                <PlayerPhoto 
                                                    player={stat.player} 
                                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-white/10 shrink-0 shadow-sm" 
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className={`font-black text-white group-hover:${textAccent} transition-colors text-xs sm:text-sm truncate`}>
                                                        {stat.player.name}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[8px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20">
                                                            {stat.player.position}
                                                        </span>
                                                        {stat.player.rating && (
                                                            <span className="text-[9px] text-white/40 font-bold">
                                                                {stat.player.rating} OVR
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Team Shield */}
                                        <td className="w-12 px-2 py-2.5 sm:py-3 text-center">
                                            <div className="w-6 h-6 sm:w-7 sm:h-7 mx-auto flex items-center justify-center shrink-0" title={stat.teamName}>
                                                <TeamLogo team={stat.team} className="w-full h-full object-contain drop-shadow" />
                                            </div>
                                        </td>

                                        {/* Metric Count */}
                                        <td className="w-24 px-4 py-2.5 sm:py-3 text-right">
                                            <div className={`text-lg sm:text-2xl font-black ${textAccent} italic leading-none`}>
                                                {getMetricValue(stat)}
                                            </div>
                                            <div className="text-[8px] text-white/40 uppercase tracking-widest font-black mt-0.5">
                                                {getMetricSubtext(stat)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center text-white/30 font-black text-xs uppercase tracking-widest">
                                        {emptyText}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 w-full">
            {/* Filter Pills for Leaderboard Category */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeTab === 'all'
                            ? 'bg-white text-black shadow-md shadow-white/10'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                >
                    Vista Completa
                </button>
                <button
                    onClick={() => setActiveTab('scorers')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === 'scorers'
                            ? 'bg-[var(--apex-gold)] text-slate-950 shadow-md shadow-[var(--apex-gold)]/20'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                >
                    <span>⚽ Goleadores</span>
                    <span className="text-[10px] font-mono opacity-80">({topScorers.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('assists')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === 'assists'
                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                >
                    <span>👟 Asistentes</span>
                    <span className="text-[10px] font-mono opacity-80">({topAssists.length})</span>
                </button>
                {isLeague && topCleanSheets.length > 0 && (
                    <button
                        onClick={() => setActiveTab('cleansheets')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'cleansheets'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                        <span>🧤 Guante de Oro</span>
                        <span className="text-[10px] font-mono opacity-80">({topCleanSheets.length})</span>
                    </button>
                )}
                {isLeague && topMVPs.length > 0 && (
                    <button
                        onClick={() => setActiveTab('mvp')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'mvp'
                                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                        <span>⭐ MVP Rating</span>
                        <span className="text-[10px] font-mono opacity-80">({topMVPs.length})</span>
                    </button>
                )}
            </div>

            {/* Tables Grid */}
            <div className={`grid grid-cols-1 ${activeTab === 'all' && (isLeague || topAssists.length > 0) ? 'lg:grid-cols-2' : ''} gap-4 sm:gap-6 w-full`}>
                {/* 1. SCORERS */}
                {(activeTab === 'all' || activeTab === 'scorers') && renderTable(
                    'Máximos Goleadores',
                    '⚽',
                    'gold',
                    'Goles',
                    s => s.goals,
                    s => s.matches > 0 ? `${s.matches} PJ` : 'Goles',
                    topScorers,
                    'Sin goles registrados aún en esta competición'
                )}

                {/* 2. ASSISTS */}
                {(activeTab === 'all' || activeTab === 'assists') && renderTable(
                    'Máximos Asistentes',
                    '👟',
                    'sky',
                    'Asistencias',
                    s => s.assists,
                    s => s.matches > 0 ? `${s.matches} PJ` : 'Asistencias',
                    topAssists,
                    'Sin asistencias registradas aún en esta competición'
                )}

                {/* 3. CLEAN SHEETS (GUANTE DE ORO) */}
                {isLeague && (activeTab === 'all' || activeTab === 'cleansheets') && renderTable(
                    'Guante de Oro (Vallas Invictas)',
                    '🧤',
                    'emerald',
                    'Invictas',
                    s => s.cleanSheets || 0,
                    s => s.matches > 0 ? `${s.matches} PJ` : 'Vallas Cero',
                    topCleanSheets,
                    'Sin vallas invictas registradas aún en esta liga'
                )}

                {/* 4. MVP / SEASON RATING */}
                {isLeague && (activeTab === 'all' || activeTab === 'mvp') && renderTable(
                    'Jugador Más Valioso (MVP de Temporada)',
                    '⭐',
                    'purple',
                    'Rating',
                    s => (s.averageRating || 7.0).toFixed(1),
                    s => `${s.goals}G • ${s.assists}A • ${s.matches}PJ`,
                    topMVPs,
                    'Sin suficientes partidos disputados para calcular MVP'
                )}
            </div>
        </div>
    );
});
