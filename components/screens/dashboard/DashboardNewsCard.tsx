import React, { useMemo } from 'react';
import { NewsItem, Player, Team } from '../../../types';
import { TeamLogo } from '../../../data/teams/helpers';
import { PlayerAvatar } from '../../ui/PlayerAvatar';
import { NormalizedNewsItem, normalizeNewsItem } from '../../../services/newsEngine';
import { getNewsCategoryTheme } from '../news/newsTheme';
import { ChevronRight, ExternalLink, Newspaper } from 'lucide-react';
import { playUiClick } from '../../../services/soundService';

export interface EnrichedDashboardNews {
    item: NormalizedNewsItem;
    assocPlayer?: Player;
}

interface DashboardNewsCardProps {
    newsFeed: NewsItem[];
    userTeam: Team;
    teamsById: Map<number, Team>;
    findAssociatedPlayer: (item: NewsItem) => Player | undefined;
    onOpenArticle: (item: NewsItem) => void;
}

export const DashboardNewsCard: React.FC<DashboardNewsCardProps> = React.memo(({
    newsFeed,
    userTeam,
    teamsById,
    findAssociatedPlayer,
    onOpenArticle
}) => {
    const visibleItems: EnrichedDashboardNews[] = useMemo(() => {
        return newsFeed.slice(0, 4).map(raw => ({
            item: normalizeNewsItem(raw, userTeam),
            assocPlayer: findAssociatedPlayer(raw),
        }));
    }, [newsFeed, userTeam, findAssociatedPlayer]);

    const featured = visibleItems[0];
    const secondary = visibleItems.slice(1);

    const handleSelect = (item: NewsItem) => {
        playUiClick();
        onOpenArticle(item);
    };

    return (
        <section className="lg:col-span-7 apex-card overflow-hidden flex flex-col">
            {/* Digital Press Masthead */}
            <div className="px-4 py-3 border-b border-white/10 bg-[#080C15] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--apex-gold)] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--apex-gold)]" />
                    </span>
                    <Newspaper className="w-3.5 h-3.5 text-[var(--apex-gold)] shrink-0" />
                    <span className="text-[11px] font-black tracking-[0.14em] text-white uppercase truncate">
                        Apex Press · Noticias del Club
                    </span>
                </div>

                {featured && (
                    <button
                        type="button"
                        onClick={() => handleSelect(featured.item)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[var(--apex-gold)]/15 border border-white/10 hover:border-[var(--apex-gold)]/40 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-[var(--apex-gold)] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                        <span>Portal ({newsFeed.length})</span>
                        <ExternalLink className="w-3 h-3" />
                    </button>
                )}
            </div>

            {!featured ? (
                <div className="p-8 text-center text-xs text-slate-500">
                    Sin novedades editoriales registradas todavía.
                </div>
            ) : (
                <div className="flex-1 flex flex-col divide-y divide-white/5">
                    {/* Featured Hero Story */}
                    {(() => {
                        const { item, assocPlayer } = featured;
                        const theme = getNewsCategoryTheme(item.type, item.matchMeta);
                        const ThemeIcon = theme.icon;
                        const homeTeam = item.matchMeta ? teamsById.get(item.matchMeta.homeTeamId) : undefined;
                        const awayTeam = item.matchMeta ? teamsById.get(item.matchMeta.awayTeamId) : undefined;

                        return (
                            <button
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="apex-press-card w-full text-left p-4 sm:p-5 relative overflow-hidden hover:bg-white/[0.025] group cursor-pointer"
                                style={{ backgroundImage: theme.heroGlow }}
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accentBarClass}`} />

                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${theme.pillClass}`}>
                                            <ThemeIcon className="w-2.5 h-2.5" />
                                            <span>{theme.label}</span>
                                        </span>
                                        {item.isBreaking && (
                                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] font-black uppercase tracking-wider">
                                                Última Hora
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-400 truncate">
                                        {item.sourceName} · {item.date}
                                    </span>
                                </div>

                                <div className="flex items-start justify-between gap-3.5">
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                        <h3 className="text-sm sm:text-base font-black text-white group-hover:text-[var(--apex-gold)] transition-colors leading-snug line-clamp-2">
                                            {item.headline}
                                        </h3>
                                        <p className="text-xs text-slate-300/85 line-clamp-2 leading-relaxed">
                                            {item.subheadline || item.body}
                                        </p>
                                    </div>

                                    {/* Visual Hero Thumbnail */}
                                    {item.matchMeta ? (
                                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-black/45 border border-white/10 shrink-0">
                                            <div className="w-7 h-7 flex items-center justify-center">
                                                {homeTeam ? (
                                                    <TeamLogo team={homeTeam} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-400">{item.matchMeta.homeTeamName.slice(0, 3).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <span className="text-sm font-black text-white tabular-nums px-1">
                                                {item.matchMeta.homeScore}-{item.matchMeta.awayScore}
                                            </span>
                                            <div className="w-7 h-7 flex items-center justify-center">
                                                {awayTeam ? (
                                                    <TeamLogo team={awayTeam} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-400">{item.matchMeta.awayTeamName.slice(0, 3).toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (assocPlayer || item.playerPhoto) ? (
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/15 bg-slate-900 shrink-0 shadow-lg">
                                            <PlayerAvatar
                                                player={assocPlayer || { name: item.playerName || '', photo: item.playerPhoto }}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/10 p-1.5 flex items-center justify-center shrink-0">
                                            <TeamLogo team={userTeam} className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })()}

                    {/* Secondary Headlines */}
                    {secondary.map(({ item, assocPlayer }) => {
                        const theme = getNewsCategoryTheme(item.type, item.matchMeta);
                        return (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className="apex-press-card w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-white/[0.025] group cursor-pointer"
                            >
                                <span className={`w-1 h-8 rounded-full shrink-0 ${theme.accentBarClass}`} />

                                {(assocPlayer || item.playerPhoto) && (
                                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10 bg-slate-900">
                                        <PlayerAvatar
                                            player={assocPlayer || { name: item.playerName || '', photo: item.playerPhoto }}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 text-[10px] mb-0.5">
                                        <span className="font-black uppercase tracking-wider" style={{ color: theme.accentHex }}>
                                            {theme.label}
                                        </span>
                                        <span className="text-slate-600">·</span>
                                        <span className="text-slate-500 font-medium truncate">{item.sourceName}</span>
                                        <span className="text-slate-600 hidden sm:inline">·</span>
                                        <span className="text-slate-500 hidden sm:inline shrink-0">{item.date}</span>
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[var(--apex-gold)] transition-colors line-clamp-1">
                                        {item.headline}
                                    </h4>
                                </div>

                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[var(--apex-gold)] group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                        );
                    })}

                    {/* Footer Action */}
                    {newsFeed.length > 4 && (
                        <button
                            type="button"
                            onClick={() => handleSelect(featured.item)}
                            className="w-full px-4 py-2.5 bg-white/[0.015] hover:bg-white/[0.04] text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-[var(--apex-gold)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <span>Explorar archivo completo ({newsFeed.length} noticias)</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}
        </section>
    );
});
