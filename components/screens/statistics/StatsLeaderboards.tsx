import React, { useState } from 'react';
import { Player } from '../../../types';
import { TeamLogo, PlayerPhoto } from '../../../data/teams/helpers';
import { PlayerStats } from './types';
import { Target, ArrowUpRight, Shield, Star, BarChart3 } from 'lucide-react';
import { EmptyState } from '../transfers/TransferUI';

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
        icon: React.ReactNode,
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
            <div className="apex-card rounded-2xl overflow-hidden w-full flex flex-col">
                <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <h3 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-2">
                        <span className={textAccent}>{icon}</span>
                        <span>{title}</span>
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
                        Top {items.length}
                    </span>
                </div>

                {items.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {items.map((stat, idx) => (
                            <button
                                key={`${stat.player?.id || idx}-${idx}`}
                                onClick={() => stat.player && onSelectPlayer(stat.player)}
                                className="w-full px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors text-left cursor-pointer group"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-5 text-center shrink-0">
                                        {idx === 0 ? (
                                            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] inline-flex items-center justify-center">
                                                1
                                            </span>
                                        ) : idx === 1 ? (
                                            <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-950 font-black text-[10px] inline-flex items-center justify-center">
                                                2
                                            </span>
                                        ) : idx === 2 ? (
                                            <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[10px] inline-flex items-center justify-center">
                                                3
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-500 tabular-nums">{idx + 1}</span>
                                        )}
                                    </div>

                                    <PlayerPhoto
                                        player={stat.player}
                                        className="w-8 h-8 rounded-xl border border-white/10 shrink-0"
                                    />

                                    <div className="min-w-0">
                                        <div className="text-xs sm:text-sm font-black text-white group-hover:text-[var(--apex-gold)] truncate">
                                            {stat.player.name}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                                                <TeamLogo team={stat.team} className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-semibold truncate">{stat.teamName}</span>
                                            <span className="text-[9px] font-bold text-sky-400">{stat.player.position}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className={`text-base sm:text-lg font-black ${textAccent} leading-none tabular-nums`}>
                                        {getMetricValue(stat)}
                                    </div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">
                                        {getMetricSubtext(stat)} · {metricHeader}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<BarChart3 className="w-6 h-6" />}
                        title="Sin registros aún"
                        text={emptyText}
                    />
                )}
            </div>
        );
    };

    const tabs: { id: TabType; label: string; count?: number; visible: boolean }[] = [
        { id: 'all', label: 'Todos', visible: true },
        { id: 'scorers', label: 'Goleadores', count: topScorers.length, visible: true },
        { id: 'assists', label: 'Asistentes', count: topAssists.length, visible: true },
        { id: 'cleansheets', label: 'Vallas Invictas', count: topCleanSheets.length, visible: isLeague && topCleanSheets.length > 0 },
        { id: 'mvp', label: 'MVP', count: topMVPs.length, visible: isLeague && topMVPs.length > 0 },
    ];

    return (
        <div className="space-y-3 w-full">
            {/* Clean Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {tabs.filter(t => t.visible).map(t => {
                    const active = activeTab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                active
                                    ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                    : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                        >
                            {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
                        </button>
                    );
                })}
            </div>

            {/* Tables Grid */}
            <div className={`grid grid-cols-1 ${activeTab === 'all' && (isLeague || topAssists.length > 0) ? 'lg:grid-cols-2' : ''} gap-3 w-full`}>
                {(activeTab === 'all' || activeTab === 'scorers') && renderTable(
                    'Máximos Goleadores',
                    <Target className="w-4 h-4" />,
                    'gold',
                    'Goles',
                    s => s.goals,
                    s => s.matches > 0 ? `${s.matches} PJ` : 'Tot',
                    topScorers,
                    'Sin goles registrados aún en esta competición.'
                )}

                {(activeTab === 'all' || activeTab === 'assists') && renderTable(
                    'Máximos Asistentes',
                    <ArrowUpRight className="w-4 h-4" />,
                    'sky',
                    'Asist.',
                    s => s.assists,
                    s => s.matches > 0 ? `${s.matches} PJ` : 'Tot',
                    topAssists,
                    'Sin asistencias registradas aún en esta competición.'
                )}

                {isLeague && (activeTab === 'all' || activeTab === 'cleansheets') && renderTable(
                    'Guante de Oro',
                    <Shield className="w-4 h-4" />,
                    'emerald',
                    'Vallas',
                    s => s.cleanSheets || 0,
                    s => s.matches > 0 ? `${s.matches} PJ` : 'Tot',
                    topCleanSheets,
                    'Sin vallas invictas registradas aún en esta liga.'
                )}

                {isLeague && (activeTab === 'all' || activeTab === 'mvp') && renderTable(
                    'Mejor Valoración (MVP)',
                    <Star className="w-4 h-4" />,
                    'purple',
                    'Media',
                    s => (s.averageRating || 7.0).toFixed(1),
                    s => `${s.goals}G · ${s.assists}A`,
                    topMVPs,
                    'Sin suficientes partidos disputados para calcular MVP.'
                )}
            </div>
        </div>
    );
});
