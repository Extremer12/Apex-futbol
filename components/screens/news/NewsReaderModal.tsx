import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { NewsCategory, NewsItem, Player, Team } from '../../../types';
import { NormalizedNewsItem, normalizeNewsItem } from '../../../services/newsEngine';
import { getNewsCategoryTheme } from './newsTheme';
import { TeamLogo } from '../../../data/teams/helpers';
import { PlayerAvatar } from '../../ui/PlayerAvatar';
import { LinkedText } from '../../ui/LinkedText';
import { StatCell } from '../transfers/TransferUI';
import { formatCurrencyShort } from '../../../utils';
import { playUiClick } from '../../../services/soundService';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Newspaper,
    Quote,
    Shield,
    UserCheck,
    X
} from 'lucide-react';

interface NewsReaderModalProps {
    initialArticle: NewsItem;
    newsFeed: NewsItem[];
    userTeam: Team;
    allPlayers: Player[];
    teamsById: Map<number, Team>;
    findAssociatedPlayer: (item: NewsItem) => Player | undefined;
    onPlayerClick: (playerName: string) => void;
    onClose: () => void;
}

type NewsFilterTab = 'ALL' | 'MATCH' | 'TRANSFER' | 'CLUB' | 'ALERTS';

const FILTER_TABS: { id: NewsFilterTab; label: string }[] = [
    { id: 'ALL', label: 'Portada' },
    { id: 'MATCH', label: 'Partidos' },
    { id: 'TRANSFER', label: 'Mercado' },
    { id: 'CLUB', label: 'Club y Logros' },
    { id: 'ALERTS', label: 'Alertas' },
];

function matchesFilter(cat: NewsCategory, filter: NewsFilterTab): boolean {
    if (filter === 'ALL') return true;
    if (filter === 'MATCH') return cat === 'match';
    if (filter === 'TRANSFER') return cat === 'transfer';
    if (filter === 'CLUB') return cat === 'institutional' || cat === 'achievement' || cat === 'standard';
    if (filter === 'ALERTS') return cat === 'warning';
    return true;
}

export const NewsReaderModal: React.FC<NewsReaderModalProps> = ({
    initialArticle,
    newsFeed,
    userTeam,
    allPlayers,
    teamsById,
    findAssociatedPlayer,
    onPlayerClick,
    onClose
}) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const closedRef = useRef(false);

    const initialNormArticle = useMemo(
        () => normalizeNewsItem(initialArticle, userTeam),
        [initialArticle, userTeam]
    );

    const normalizedFeed: NormalizedNewsItem[] = useMemo(() => {
        const list = (newsFeed || []).map(n => normalizeNewsItem(n, userTeam));
        if (!list.some(n => n.id === initialNormArticle.id)) {
            list.unshift(initialNormArticle);
        }
        return list;
    }, [newsFeed, initialNormArticle, userTeam]);

    const [activeFilter, setActiveFilter] = useState<NewsFilterTab>('ALL');
    const [activeId, setActiveId] = useState<string>(initialNormArticle.id);

    const filteredFeed = useMemo(() => {
        const list = normalizedFeed.filter(n => matchesFilter(n.type, activeFilter));
        return list.length > 0 ? list : normalizedFeed;
    }, [normalizedFeed, activeFilter]);

    const activeIndex = useMemo(() => {
        const idx = filteredFeed.findIndex(n => n.id === activeId);
        return idx >= 0 ? idx : 0;
    }, [filteredFeed, activeId]);

    const activeArticle = filteredFeed[activeIndex] || normalizedFeed[0];
    const theme = getNewsCategoryTheme(activeArticle.type, activeArticle.matchMeta);
    const ThemeIcon = theme.icon;

    const assocPlayer = useMemo(
        () => findAssociatedPlayer(activeArticle),
        [activeArticle, findAssociatedPlayer]
    );

    const hasPrev = activeIndex > 0;
    const hasNext = activeIndex < filteredFeed.length - 1;

    useEffect(() => {
        closedRef.current = false;
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (!dialog.open) {
            try {
                dialog.showModal();
            } catch {
                dialog.setAttribute('open', '');
            }
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleNativeClose = () => {
            if (!closedRef.current) {
                closedRef.current = true;
                onCloseRef.current();
            }
        };

        dialog.addEventListener('close', handleNativeClose);

        return () => {
            document.body.style.overflow = originalOverflow;
            closedRef.current = true;
            dialog.removeEventListener('close', handleNativeClose);
            // CRITICAL: Do NOT call dialog.close() in cleanup.
            // React unmounts the DOM node cleanly; calling dialog.close() during
            // React 18 StrictMode double-mount simulation dispatches a native 'close'
            // event that triggers onClose(), causing instant self-closure on open.
        };
    }, []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' && hasPrev) {
                e.preventDefault();
                setActiveId(filteredFeed[activeIndex - 1].id);
            } else if (e.key === 'ArrowRight' && hasNext) {
                e.preventDefault();
                setActiveId(filteredFeed[activeIndex + 1].id);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [hasPrev, hasNext, activeIndex, filteredFeed]);

    const handleClose = () => {
        if (closedRef.current) return;
        playUiClick();
        closedRef.current = true;
        const dialog = dialogRef.current;
        if (dialog?.open) {
            try {
                dialog.close();
            } catch {
                // ignore
            }
        }
        onCloseRef.current();
    };

    const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) {
            handleClose();
        }
    };

    const selectArticle = (id: string) => {
        playUiClick();
        setActiveId(id);
    };

    const handleTabSelect = (tab: NewsFilterTab, el: HTMLButtonElement) => {
        playUiClick();
        setActiveFilter(tab);
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        const nextList = normalizedFeed.filter(n => matchesFilter(n.type, tab));
        if (nextList.length > 0 && !nextList.some(n => n.id === activeId)) {
            setActiveId(nextList[0].id);
        }
    };

    const homeTeam = activeArticle.matchMeta ? teamsById.get(activeArticle.matchMeta.homeTeamId) : undefined;
    const awayTeam = activeArticle.matchMeta ? teamsById.get(activeArticle.matchMeta.awayTeamId) : undefined;
    const paragraphs = activeArticle.body.split(/\n{2,}/).filter(Boolean);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onClick={handleDialogClick}
            className="apex-top-overlay fixed inset-0 z-50 overflow-y-auto select-none"
        >
            {/* Dynamic Top Category Accent Line */}
            <div
                className="fixed top-0 inset-x-0 h-[2px] z-40 pointer-events-none transition-colors duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${theme.accentHex}, transparent)` }}
            />

            {/* Sticky Digital News Masthead */}
            <header className="sticky top-0 z-30 bg-[#070A13]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="w-9 h-9 rounded-xl bg-[#101624] border flex items-center justify-center shrink-0"
                            style={{ borderColor: `${theme.accentHex}55` }}
                        >
                            <Newspaper className="w-4 h-4" style={{ color: theme.accentHex }} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--apex-gold)]">
                                    Apex Press
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">
                                    · Plataforma Editorial
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm font-black text-white truncate">
                                {userTeam.name} · Edición Oficial
                            </p>
                        </div>
                    </div>

                    {/* Article Navigation Controls */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <span className="hidden md:inline-block text-[11px] font-bold text-slate-400 mr-1 tabular-nums">
                            {activeIndex + 1} / {filteredFeed.length}
                        </span>
                        <button
                            type="button"
                            disabled={!hasPrev}
                            onClick={() => hasPrev && selectArticle(filteredFeed[activeIndex - 1].id)}
                            aria-label="Noticia anterior"
                            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            disabled={!hasNext}
                            onClick={() => hasNext && selectArticle(filteredFeed[activeIndex + 1].id)}
                            aria-label="Siguiente noticia"
                            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            aria-label="Cerrar lector de noticias"
                            className="h-9 px-3 sm:px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline">Cerrar</span>
                        </button>
                    </div>
                </div>

                {/* Single-Row Scrollable Category Filter Tabs */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 border-t border-white/5">
                    <div className="apex-tabs-scroller gap-1 py-1" role="tablist" aria-label="Secciones de prensa">
                        {FILTER_TABS.map(tab => {
                            const selected = activeFilter === tab.id;
                            const count = normalizedFeed.filter(n => matchesFilter(n.type, tab.id)).length;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={selected}
                                    onClick={(e) => handleTabSelect(tab.id, e.currentTarget)}
                                    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                        selected ? 'text-white font-black bg-white/[0.06]' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className="text-[10px] font-bold text-slate-500 tabular-nums">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Full-Screen Editorial Split Layout */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-16">
                {/* Main Story Reader */}
                <article
                    key={activeArticle.id}
                    className="lg:col-span-8 apex-news-enter apex-card rounded-3xl overflow-hidden flex flex-col border-white/10 shadow-2xl"
                >
                    {/* Dynamic Color Visual Hero Banner */}
                    <div
                        className="relative p-5 sm:p-8 border-b border-white/10 overflow-hidden"
                        style={{ backgroundImage: theme.heroGlow }}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${theme.pillClass}`}>
                                    <ThemeIcon className="w-3.5 h-3.5" />
                                    <span>{theme.label}</span>
                                </span>
                                {activeArticle.isBreaking && (
                                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase tracking-wider">
                                        Edición Especial
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                                <span className="text-slate-200 font-bold">{activeArticle.sourceName}</span>
                                <span>·</span>
                                <span>{activeArticle.date}</span>
                                <span className="hidden sm:inline">·</span>
                                <span className="hidden sm:inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {activeArticle.readMinutes} min
                                </span>
                            </div>
                        </div>

                        {/* Visual Centerpiece: Match Broadcast / Player Spotlight / Club Crest */}
                        {activeArticle.matchMeta ? (
                            <div className="mb-6 rounded-2xl bg-[#090E1A]/90 border border-white/10 p-4 sm:p-5 shadow-xl">
                                <div className="text-center mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        {activeArticle.matchMeta.competition || 'Marcador Oficial'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-3">
                                    {/* Home Team */}
                                    <div className="flex flex-col items-center text-center gap-2 min-w-0">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/[0.04] border border-white/10 p-2 flex items-center justify-center">
                                            {homeTeam ? (
                                                <TeamLogo team={homeTeam} className="w-full h-full object-contain drop-shadow" />
                                            ) : (
                                                <Shield className="w-7 h-7 text-slate-500" />
                                            )}
                                        </div>
                                        <span className="text-xs sm:text-sm font-black text-white truncate w-full">
                                            {activeArticle.matchMeta.homeTeamName}
                                        </span>
                                    </div>

                                    {/* Scoreboard */}
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="px-4 py-2 rounded-2xl bg-black/60 border border-white/15 flex items-center gap-2.5 shadow-inner">
                                            <span className="text-2xl sm:text-4xl font-black text-white tabular-nums">
                                                {activeArticle.matchMeta.homeScore}
                                            </span>
                                            <span className="text-slate-500 font-black text-lg">-</span>
                                            <span className="text-2xl sm:text-4xl font-black text-white tabular-nums">
                                                {activeArticle.matchMeta.awayScore}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1.5">
                                            Final del Partido
                                        </span>
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex flex-col items-center text-center gap-2 min-w-0">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/[0.04] border border-white/10 p-2 flex items-center justify-center">
                                            {awayTeam ? (
                                                <TeamLogo team={awayTeam} className="w-full h-full object-contain drop-shadow" />
                                            ) : (
                                                <Shield className="w-7 h-7 text-slate-500" />
                                            )}
                                        </div>
                                        <span className="text-xs sm:text-sm font-black text-white truncate w-full">
                                            {activeArticle.matchMeta.awayTeamName}
                                        </span>
                                    </div>
                                </div>

                                {/* Goal Scorers Ticker */}
                                {activeArticle.matchMeta.scorers && activeArticle.matchMeta.scorers.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-center gap-2">
                                        {activeArticle.matchMeta.scorers.map((s, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-semibold text-slate-200 tabular-nums"
                                            >
                                                {s.playerName} <strong className="text-[var(--apex-gold)]">{s.minute}&apos;</strong>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : assocPlayer ? (
                            <div className="mb-6 rounded-2xl bg-[#090E1A]/90 border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[var(--apex-gold)]/45 bg-slate-900 shrink-0 shadow-lg">
                                        <PlayerAvatar player={assocPlayer} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-md bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] border border-[var(--apex-gold)]/35 text-xs font-black tabular-nums">
                                                {assocPlayer.rating} OVR
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase">
                                                {assocPlayer.position} · {assocPlayer.age || 23} años
                                            </span>
                                        </div>
                                        <h2 className="text-base sm:text-lg font-black text-white truncate">
                                            {assocPlayer.name}
                                        </h2>
                                        <span className="text-xs font-bold text-emerald-400 block tabular-nums">
                                            Valoración: {formatCurrencyShort(assocPlayer.value)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        handleClose();
                                        onPlayerClick(assocPlayer.name);
                                    }}
                                    className="px-4 py-2.5 rounded-xl bg-[var(--apex-gold)] hover:bg-[#d8b85e] text-slate-950 font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                    <UserCheck className="w-4 h-4" />
                                    <span>Ver Ficha del Jugador</span>
                                </button>
                            </div>
                        ) : (
                            <div className="mb-5 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#090E1A] border border-white/10 p-2 flex items-center justify-center shrink-0">
                                    <TeamLogo team={userTeam} className="w-full h-full object-contain" />
                                </div>
                                <div className="text-xs text-slate-400 font-semibold">
                                    <span className="text-white font-bold block">{userTeam.name}</span>
                                    <span>Corresponsalía de Redacción</span>
                                </div>
                            </div>
                        )}

                        {/* Display Headline & Lead Deck */}
                        <h1 id={titleId} className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-[1.15] tracking-tight">
                            {activeArticle.headline}
                        </h1>
                        {activeArticle.subheadline && (
                            <p className="mt-3 text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-3xl">
                                {activeArticle.subheadline}
                            </p>
                        )}
                    </div>

                    {/* Article Editorial Body */}
                    <div className="p-5 sm:p-8 space-y-5 flex-1">
                        {activeArticle.quote && (
                            <blockquote
                                className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 border-l-4 space-y-2"
                                style={{ borderLeftColor: theme.accentHex }}
                            >
                                <div className="flex items-start gap-3">
                                    <Quote className="w-5 h-5 shrink-0 mt-0.5 opacity-70" style={{ color: theme.accentHex }} />
                                    <p className="text-sm sm:text-base font-bold italic text-white leading-relaxed">
                                        {activeArticle.quote}
                                    </p>
                                </div>
                                {activeArticle.quoteAuthor && (
                                    <footer className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-8">
                                        — {activeArticle.quoteAuthor}
                                    </footer>
                                )}
                            </blockquote>
                        )}

                        <div className="space-y-4 text-slate-200 text-sm sm:text-[15px] leading-7 select-text">
                            {paragraphs.map((para, idx) => (
                                <p key={idx}>
                                    <LinkedText
                                        text={para}
                                        players={allPlayers}
                                        onPlayerClick={(name) => {
                                            handleClose();
                                            onPlayerClick(name);
                                        }}
                                    />
                                </p>
                            ))}
                        </div>

                        {/* Tags */}
                        {activeArticle.tags && activeArticle.tags.length > 0 && (
                            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
                                {activeArticle.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-bold text-slate-300"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom Continuous Reading Bar */}
                    <footer className="px-5 sm:px-8 py-4 border-t border-white/10 bg-black/25 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            disabled={!hasPrev}
                            onClick={() => hasPrev && selectArticle(filteredFeed[activeIndex - 1].id)}
                            className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <ChevronLeft className="w-3 h-3" /> Nota Anterior
                            </span>
                            <span className="text-xs font-bold text-white line-clamp-1 mt-0.5 block">
                                {hasPrev ? filteredFeed[activeIndex - 1].headline : 'Inicio de portada'}
                            </span>
                        </button>

                        <button
                            type="button"
                            disabled={!hasNext}
                            onClick={() => hasNext && selectArticle(filteredFeed[activeIndex + 1].id)}
                            className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-right disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 inline-flex items-center gap-1 justify-end w-full">
                                Siguiente Nota <ChevronRight className="w-3 h-3" />
                            </span>
                            <span className="text-xs font-bold text-white line-clamp-1 mt-0.5 block">
                                {hasNext ? filteredFeed[activeIndex + 1].headline : 'Fin del archivo'}
                            </span>
                        </button>
                    </footer>
                </article>

                {/* Right Column: Live Press Feed Sidebar */}
                <aside className="lg:col-span-4 space-y-3">
                    <div className="apex-card rounded-2xl overflow-hidden flex flex-col lg:sticky lg:top-[124px]">
                        <div className="px-4 py-3 border-b border-white/10 bg-[#080C15] flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-white">
                                En Portada
                            </span>
                            <span className="text-[11px] font-bold text-[var(--apex-gold)] tabular-nums">
                                {filteredFeed.length} notas
                            </span>
                        </div>

                        <div className="divide-y divide-white/5 max-h-[65dvh] overflow-y-auto">
                            {filteredFeed.map(item => {
                                const isActive = item.id === activeArticle.id;
                                const itemTheme = getNewsCategoryTheme(item.type, item.matchMeta);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        aria-current={isActive ? 'true' : undefined}
                                        onClick={() => selectArticle(item.id)}
                                        className={`w-full text-left p-3.5 transition-colors cursor-pointer relative ${
                                            isActive ? 'bg-[var(--apex-gold)]/10' : 'hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        {isActive && (
                                            <span
                                                className="absolute left-0 top-0 bottom-0 w-1"
                                                style={{ backgroundColor: itemTheme.accentHex }}
                                            />
                                        )}
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: itemTheme.accentHex }}>
                                                {itemTheme.label}
                                            </span>
                                            <span className="text-[10px] text-slate-500 shrink-0">
                                                {isActive ? 'Leyendo' : item.date}
                                            </span>
                                        </div>
                                        <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                            {item.headline}
                                        </h4>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-3 border-t border-white/10 bg-black/20">
                            <StatCell
                                label="Archivo de Temporada"
                                value={`${normalizedFeed.length} notas registradas`}
                                accent="text-slate-200"
                            />
                        </div>
                    </div>
                </aside>
            </main>
        </dialog>
    );
};
