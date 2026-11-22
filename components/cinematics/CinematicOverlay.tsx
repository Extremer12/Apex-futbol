import React, { useEffect, useId, useRef, useState } from 'react';
import { CinematicEvent } from '../../types';
import { Confetti } from '../ui/Confetti';
import { ArrowRight, Award, Crown, Shield, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { TeamLogo, usePacksVersion } from '../../data/teams/helpers';
import { resourceManager } from '../../services/resources/ResourceManager';
import { TrophyImage } from '../screens/trophies/TrophyImage';
import { StatCell } from '../screens/transfers/TransferUI';
import { playTrophyFanfare, playUiClick } from '../../services/soundService';

interface CinematicOverlayProps {
    event: CinematicEvent;
    onContinue: () => void;
}

const resolveCompetitionLogos = (comp?: string, title?: string, compId?: string) => {
    const raw = `${compId || ''} ${comp || ''} ${title || ''}`.toLowerCase();

    if (raw.includes('libertadores')) {
        const logo = resourceManager.competitionLogo('COPA_LIBERTADORES', 'Copa Libertadores');
        return { id: 'COPA_LIBERTADORES', primary: logo, fallback: logo, badge: 'CONMEBOL LIBERTADORES', accent: '#C8A84E' };
    }
    if (raw.includes('sudamericana')) {
        const logo = resourceManager.competitionLogo('COPA_SUDAMERICANA', 'Copa Sudamericana');
        return { id: 'COPA_SUDAMERICANA', primary: logo, fallback: logo, badge: 'CONMEBOL SUDAMERICANA', accent: '#D97706' };
    }
    if (raw.includes('champions')) {
        const logo = resourceManager.competitionLogo('CHAMPIONS_LEAGUE', 'Champions League');
        return { id: 'CHAMPIONS_LEAGUE', primary: logo, fallback: logo, badge: 'UEFA CHAMPIONS LEAGUE', accent: '#6366F1' };
    }
    if (raw.includes('europa league') || raw.includes('europa_league')) {
        const logo = resourceManager.competitionLogo('EUROPA_LEAGUE', 'UEFA Europa League');
        return { id: 'EUROPA_LEAGUE', primary: logo, fallback: logo, badge: 'UEFA EUROPA LEAGUE', accent: '#F97316' };
    }
    if (raw.includes('intercontinental')) {
        const logo = resourceManager.competitionLogo('COPA_INTERCONTINENTAL', 'Copa Intercontinental');
        return { id: 'COPA_INTERCONTINENTAL', primary: logo, fallback: logo, badge: 'FIFA INTERCONTINENTAL', accent: '#10B981' };
    }
    if (raw.includes('apertura') || raw.includes('clausura') || raw.includes('liga profesional') || raw.includes('liga_argentina')) {
        const logo = resourceManager.competitionLogo('LIGA_ARGENTINA', 'Liga Argentina');
        return { id: 'LIGA_ARGENTINA', primary: logo, fallback: logo, badge: 'LIGA PROFESIONAL DE FÚTBOL', accent: '#0EA5E9' };
    }
    if (raw.includes('nacional') || raw.includes('reducido') || raw.includes('ascenso')) {
        const logo = resourceManager.competitionLogo('PRIMERA_NACIONAL', 'Primera Nacional');
        return { id: 'PRIMERA_NACIONAL', primary: logo, fallback: logo, badge: 'PRIMERA NACIONAL', accent: '#06B6D4' };
    }
    if (raw.includes('copa argentina') || raw.includes('copa_argentina')) {
        const logo = resourceManager.competitionLogo('COPA_ARGENTINA', 'Copa Argentina');
        return { id: 'COPA_ARGENTINA', primary: logo, fallback: logo, badge: 'COPA ARGENTINA', accent: '#0284C7' };
    }
    if (raw.includes('premier')) {
        const logo = resourceManager.leagueLogo('PREMIER_LEAGUE', 'Premier League');
        return { id: 'PREMIER_LEAGUE', primary: logo, fallback: logo, badge: 'PREMIER LEAGUE', accent: '#A855F7' };
    }
    if (raw.includes('laliga') || raw.includes('la liga') || raw.includes('la_liga')) {
        const logo = resourceManager.leagueLogo('LA_LIGA', 'LaLiga EA Sports');
        return { id: 'LA_LIGA', primary: logo, fallback: logo, badge: 'LALIGA EA SPORTS', accent: '#F97316' };
    }
    if (raw.includes('serie a') || raw.includes('serie_a')) {
        const logo = resourceManager.leagueLogo('SERIE_A', 'Serie A');
        return { id: 'SERIE_A', primary: logo, fallback: logo, badge: 'SERIE A', accent: '#10B981' };
    }
    if (raw.includes('bundesliga')) {
        const logo = resourceManager.leagueLogo('BUNDESLIGA', 'Bundesliga');
        return { id: 'BUNDESLIGA', primary: logo, fallback: logo, badge: 'BUNDESLIGA', accent: '#EF4444' };
    }
    if (raw.includes('ligue 1') || raw.includes('ligue_1')) {
        const logo = resourceManager.leagueLogo('LIGUE_1', 'Ligue 1');
        return { id: 'LIGUE_1', primary: logo, fallback: logo, badge: 'LIGUE 1', accent: '#3B82F6' };
    }
    if (raw.includes('brasileir')) {
        const logo = resourceManager.leagueLogo('BRASILEIRAO', 'Brasileirão');
        return { id: 'BRASILEIRAO', primary: logo, fallback: logo, badge: 'BRASILEIRÃO SÉRIE A', accent: '#10B981' };
    }

    const cleanBadge = title ? title.replace(/[🏆⭐🌍★¡!]/g, '').trim() : 'COMPETICIÓN OFICIAL';
    const fallbackId = compId || comp || cleanBadge;
    const fallbackLogo = fallbackId ? resourceManager.competitionLogo(fallbackId, cleanBadge) : '';
    return {
        id: fallbackId,
        primary: fallbackLogo,
        fallback: fallbackLogo,
        badge: cleanBadge,
        accent: '#C8A84E'
    };
};

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({ event, onContinue }) => {
    usePacksVersion();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const onContinueRef = useRef(onContinue);
    onContinueRef.current = onContinue;
    const closedRef = useRef(false);

    const [visible, setVisible] = useState(false);
    const [compLogoSrc, setCompLogoSrc] = useState<string>('');

    useEffect(() => {
        closedRef.current = false;
        setVisible(false);
        setCompLogoSrc('');
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) {
            dialog.showModal();
        }
        const t = setTimeout(() => setVisible(true), 60);

        if (event.type === 'LEAGUE_WIN' || event.type === 'CUP_WIN' || event.type === 'PROMOTION') {
            playTrophyFanfare();
        }

        return () => clearTimeout(t);
    }, [event.id, event.type]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleNativeClose = () => {
            if (!closedRef.current) {
                closedRef.current = true;
                onContinueRef.current();
            }
        };

        dialog.addEventListener('close', handleNativeClose);
        return () => dialog.removeEventListener('close', handleNativeClose);
    }, []);

    const handleContinue = () => {
        if (closedRef.current) return;
        playUiClick();
        closedRef.current = true;
        if (dialogRef.current?.open) {
            dialogRef.current.close();
        }
        onContinueRef.current();
    };

    const cleanTitle = (event.title || '').replace(/[🏆⭐🌍★]/g, '').trim();
    const cleanSubtitle = (event.subtitle || '').replace(/[🏆⭐🌍★]/g, '').trim();

    const metaCompId = typeof event.metadata?.competitionId === 'string' ? event.metadata.competitionId : undefined;
    const compInfo = resolveCompetitionLogos(
        typeof event.metadata?.competition === 'string' ? event.metadata.competition : undefined,
        cleanTitle,
        metaCompId
    );
    const accentColor = (typeof event.metadata?.accentColor === 'string' && event.metadata.accentColor) || compInfo.accent || '#C8A84E';

    const renderChampionCeremony = (isPromotionTitle = false) => {
        const team = event.metadata?.team;
        const compName = (typeof event.metadata?.competition === 'string' && event.metadata.competition) || cleanTitle;
        const stats = event.metadata?.stats;
        const seasonLabel = typeof event.metadata?.season === 'number' ? `Temporada ${event.metadata.season}` : 'Edición Oficial';
        const presidentName = typeof event.metadata?.presidentName === 'string' ? event.metadata.presidentName : undefined;
        const points = typeof event.metadata?.points === 'number' ? event.metadata.points : undefined;
        const logoToRender = compLogoSrc || compInfo.primary;
        const winRate = stats && stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : null;

        const headlineText = event.type === 'LEAGUE_WIN'
            ? '¡CAMPEÓN DE LIGA!'
            : isPromotionTitle
                ? cleanTitle
                : '¡CAMPEONES!';

        const ceremonyTag = event.type === 'LEAGUE_WIN'
            ? 'Título de Liga Oficial'
            : isPromotionTitle
                ? 'Ascenso y Título Oficial'
                : 'Campeón Oficial de Copa';

        return (
            <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-2xl mx-auto px-3 sm:px-5 text-center">
                {/* Ambient Golden / Accent Spotlight */}
                <div
                    className="absolute -top-20 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full blur-3xl opacity-25 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${accentColor} 0%, rgba(200, 168, 78, 0.25) 45%, transparent 72%)` }}
                />

                {/* Ceremony Top Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--apex-gold)]/40 bg-[#101624]/90 shadow-lg mb-5">
                    {logoToRender ? (
                        <img
                            src={logoToRender}
                            alt={compName}
                            className="w-4 h-4 object-contain shrink-0"
                            onError={() => {
                                if (compInfo.fallback && compLogoSrc !== compInfo.fallback) {
                                    setCompLogoSrc(compInfo.fallback);
                                }
                            }}
                        />
                    ) : (
                        <Crown className="w-3.5 h-3.5 text-[var(--apex-gold)] shrink-0" />
                    )}
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.22em] text-[var(--apex-gold)]">
                        {seasonLabel} · {ceremonyTag}
                    </span>
                </div>

                {/* Dual Showcase: Club Crest + Official Trophy Pedestal */}
                <div className="apex-trophy-spring flex items-end justify-center gap-5 sm:gap-8 mb-5">
                    {team && (
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-3.5 bg-[#101624] border border-white/15 flex items-center justify-center shadow-2xl relative overflow-hidden"
                                style={{ boxShadow: `0 12px 35px -8px ${accentColor}45` }}
                            >
                                <div
                                    className="absolute top-0 inset-x-0 h-0.5"
                                    style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
                                />
                                <TeamLogo team={team} className="w-full h-full object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.75)]" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 max-w-[120px] truncate">
                                {team.shortName || team.name}
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col items-center">
                        <div
                            className="px-4 pt-3 pb-2 rounded-2xl bg-[#101624]/90 border border-[var(--apex-gold)]/35 shadow-2xl relative"
                            style={{ boxShadow: '0 16px 40px -10px rgba(200, 168, 78, 0.35)' }}
                        >
                            <TrophyImage
                                competitionId={compInfo.id || compName}
                                name={compName}
                                size="xl"
                                showPedestal={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Editorial Championship Headline */}
                <h1
                    id={titleId}
                    className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-none text-gold-gradient drop-shadow-[0_6px_24px_rgba(0,0,0,0.85)]"
                >
                    {headlineText}
                </h1>

                <p className="text-base sm:text-xl font-black text-white uppercase tracking-wider mt-2.5">
                    {compName}
                </p>

                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 font-medium max-w-lg leading-relaxed">
                    {cleanSubtitle}
                </p>

                {/* Campaign Telemetry Grid */}
                {stats && (
                    <div className="w-full mt-5 apex-card p-3.5 sm:p-4 border-[var(--apex-gold)]/25 shadow-2xl text-left">
                        <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--apex-gold)] flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5" />
                                Campaña del Campeón
                            </span>
                            {winRate !== null && (
                                <span className="text-[10px] font-bold text-emerald-400 tabular-nums">
                                    {winRate}% victorias
                                </span>
                            )}
                        </div>
                        <div className={`grid gap-2 ${points !== undefined ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
                            {points !== undefined && (
                                <StatCell label="Puntos" value={<span className="tabular-nums">{points}</span>} accent="text-[var(--apex-gold)]" />
                            )}
                            <StatCell label="Partidos" value={<span className="tabular-nums">{stats.played}</span>} />
                            <StatCell label="Victorias" value={<span className="tabular-nums">{stats.won}</span>} accent="text-emerald-400" />
                            <StatCell label="Goles Favor" value={<span className="tabular-nums">{stats.goalsFor}</span>} />
                            <StatCell
                                label="Dif. de Gol"
                                value={<span className="tabular-nums">{stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}</span>}
                                accent={stats.goalDifference >= 0 ? 'text-amber-300' : 'text-rose-400'}
                            />
                        </div>
                    </div>
                )}

                {/* Presidential Attribution */}
                {presidentName && (
                    <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-[11px] text-slate-400">
                        <Shield className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                        <span>Presidencia: <strong className="text-white font-bold">{presidentName}</strong></span>
                    </div>
                )}

                <Confetti count={72} palette="gold" />
            </div>
        );
    };

    const renderContent = () => {
        switch (event.type) {
            case 'CUP_KICKOFF': {
                const logoToRender = compLogoSrc || compInfo.primary;

                return (
                    <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-2xl mx-auto px-4 text-center">
                        <div
                            className="absolute -top-12 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
                            style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
                        />

                        <div
                            className={`relative w-28 h-28 sm:w-36 sm:h-36 mb-6 flex items-center justify-center transition-all duration-700 ${
                                visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-6'
                            }`}
                        >
                            {logoToRender ? (
                                <img
                                    src={logoToRender}
                                    alt={compInfo.badge}
                                    className="w-full h-full object-contain filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
                                    onError={() => {
                                        if (compInfo.fallback && compLogoSrc !== compInfo.fallback) {
                                            setCompLogoSrc(compInfo.fallback);
                                        }
                                    }}
                                />
                            ) : (
                                <TrophyImage competitionId={compInfo.id} name={compInfo.badge} size="xl" showPedestal={true} />
                            )}
                        </div>

                        <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] border transition-all duration-700 delay-150 mb-3 ${
                                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                            style={{ borderColor: `${accentColor}50`, color: accentColor, background: `${accentColor}15` }}
                        >
                            {compInfo.badge}
                        </div>

                        <h1
                            id={titleId}
                            className={`text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] transition-all duration-700 delay-200 ${
                                visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                            }`}
                        >
                            {cleanTitle}
                        </h1>

                        <div
                            className={`h-0.5 my-3 transition-all duration-700 delay-300 rounded-full ${
                                visible ? 'w-48 opacity-100' : 'w-0 opacity-0'
                            }`}
                            style={{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }}
                        />

                        <p
                            className={`text-sm sm:text-base md:text-lg font-semibold text-center max-w-lg transition-all duration-700 delay-400 text-slate-300 ${
                                visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                            }`}
                        >
                            {cleanSubtitle}
                        </p>
                    </div>
                );
            }
            case 'GROUP_DRAW': {
                const groups = (event.metadata?.groups as any[]) || [];
                const swissOpponents = (event.metadata?.swissOpponents as any[]) || [];
                const logoToRender = compLogoSrc || compInfo.primary;

                return (
                    <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-3xl mx-auto px-4">
                        <div
                            className="absolute -top-10 w-56 h-56 sm:w-72 sm:h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
                            style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
                        />

                        <div
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 mb-2 flex items-center justify-center transition-all duration-700 ${
                                visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-4'
                            }`}
                        >
                            {logoToRender ? (
                                <img
                                    src={logoToRender}
                                    alt={cleanTitle}
                                    className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
                                    onError={() => {
                                        if (compInfo.fallback && compLogoSrc !== compInfo.fallback) {
                                            setCompLogoSrc(compInfo.fallback);
                                        }
                                    }}
                                />
                            ) : (
                                <TrophyImage competitionId={compInfo.id} name={cleanTitle} size="md" />
                            )}
                        </div>

                        <div
                            className={`text-center mb-3 transition-all duration-700 delay-150 ${
                                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                            }`}
                        >
                            <h1 id={titleId} className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">
                                {cleanTitle}
                            </h1>
                            <div className="flex items-center justify-center gap-2.5 mt-1.5">
                                <div className="h-px w-6 sm:w-10 rounded-full" style={{ background: `linear-gradient(to right, transparent, ${accentColor})` }} />
                                <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em]" style={{ color: accentColor }}>
                                    {cleanSubtitle || 'Sorteo de Fase de Grupos'}
                                </p>
                                <div className="h-px w-6 sm:w-10 rounded-full" style={{ background: `linear-gradient(to left, transparent, ${accentColor})` }} />
                            </div>
                        </div>

                        <div
                            className={`w-full transition-all duration-700 delay-300 ${
                                visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                            }`}
                        >
                            {groups.length > 0 ? (
                                <div className={groups.length === 1 ? 'flex justify-center w-full' : 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto'}>
                                    {groups.map((group: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="w-full max-w-md apex-card p-4 shadow-2xl relative overflow-hidden"
                                            style={{ borderColor: `${accentColor}35` }}
                                        >
                                            <div className="absolute top-0 inset-x-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                                            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
                                                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                                    <span className="w-1.5 h-5 rounded-full" style={{ backgroundColor: accentColor }} />
                                                    {group.name}
                                                </h3>
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                                                    {group.teams.length} Clubes
                                                </span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {group.teams.map((team: any, tIdx: number) => {
                                                    const isUser = Boolean(team.isPlayer);
                                                    return (
                                                        <div
                                                            key={tIdx}
                                                            className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl transition-colors ${
                                                                isUser
                                                                    ? 'bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/45'
                                                                    : 'bg-white/[0.03] border border-white/5'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                                                    isUser ? 'bg-[var(--apex-gold)] text-slate-950' : 'bg-white/10 text-slate-400'
                                                                }`}>
                                                                    {tIdx + 1}
                                                                </div>
                                                                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                                                                    <TeamLogo team={team.team} className="w-full h-full object-contain" />
                                                                </div>
                                                                <span className={`text-xs sm:text-sm font-bold truncate ${isUser ? 'text-amber-200 font-black' : 'text-slate-100'}`}>
                                                                    {team.name}
                                                                </span>
                                                            </div>
                                                            {isUser ? (
                                                                <span className="ml-2 px-2 py-0.5 rounded-md bg-[var(--apex-gold)]/20 border border-[var(--apex-gold)]/40 text-[var(--apex-gold)] text-[9px] font-black uppercase tracking-wider shrink-0">
                                                                    TU CLUB
                                                                </span>
                                                            ) : (
                                                                <span className="ml-2 text-[10px] font-bold text-slate-500 uppercase shrink-0">
                                                                    Bombo {team.pot || tIdx + 1}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : swissOpponents.length > 0 ? (
                                <div className="w-full max-w-xl mx-auto apex-card border-blue-500/25 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 inset-x-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                                        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                                            Rivales de Fase de Liga
                                        </h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                                            {swissOpponents.length} Partidos
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {swissOpponents.map((opponent: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="text-[10px] font-black text-slate-500 w-3.5 tabular-nums">{idx + 1}</span>
                                                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                                        <TeamLogo team={opponent.team} className="w-full h-full object-contain" />
                                                    </div>
                                                    <span className="text-xs font-bold text-white uppercase truncate">{opponent.name}</span>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                    opponent.venue === 'home'
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                        : 'bg-white/10 text-slate-400 border border-white/10'
                                                }`}>
                                                    {opponent.venue === 'home' ? 'Local' : 'Visita'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                );
            }
            case 'LEAGUE_WIN':
            case 'CUP_WIN':
                return renderChampionCeremony(false);
            case 'PROMOTION':
                return event.metadata?.team ? renderChampionCeremony(true) : (
                    <div className="flex flex-col items-center justify-center apex-trophy-spring relative z-10 text-center px-4">
                        <div className="w-24 h-24 mb-6 bg-emerald-500/15 rounded-2xl flex items-center justify-center border border-emerald-500/40 shadow-2xl">
                            <TrendingUp className="w-12 h-12 text-emerald-400" />
                        </div>
                        <h1 id={titleId} className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
                            {cleanTitle}
                        </h1>
                        <p className="text-lg text-emerald-300 mt-3 font-bold uppercase tracking-widest max-w-lg">
                            {cleanSubtitle}
                        </p>
                        <Confetti count={72} palette="gold" />
                    </div>
                );
            case 'RELEGATION':
                return (
                    <div className="flex flex-col items-center justify-center relative z-10 text-center px-4 max-w-xl">
                        <div className="w-24 h-24 mb-6 bg-rose-500/15 rounded-2xl flex items-center justify-center border border-rose-500/40 shadow-2xl">
                            <TrendingDown className="w-12 h-12 text-rose-400" />
                        </div>
                        <h1 id={titleId} className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
                            {cleanTitle}
                        </h1>
                        <p className="text-base sm:text-lg text-rose-300 mt-3 font-bold uppercase tracking-wider">
                            {cleanSubtitle}
                        </p>
                    </div>
                );
            case 'SEASON_SUMMARY':
                return (
                    <div className="flex flex-col items-center justify-center relative z-10 max-w-xl w-full px-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--apex-gold)] mb-2">
                            Cierre de Campaña
                        </span>
                        <h1 id={titleId} className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight text-center mb-1.5">
                            {cleanTitle}
                        </h1>
                        <p className="text-slate-400 mb-6 font-bold text-xs sm:text-sm uppercase tracking-wider text-center">
                            {cleanSubtitle}
                        </p>

                        <div className="apex-card p-5 sm:p-6 w-full shadow-2xl space-y-3">
                            <div className="grid grid-cols-2 gap-2.5">
                                <StatCell label="Posición Final" value={`${event.metadata?.position}º`} accent="text-[var(--apex-gold)]" />
                                <StatCell label="Balance Actual" value={event.metadata?.balance ? formatCurrency(Number(event.metadata.balance)) : '-'} accent="text-emerald-400" />
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex justify-between items-center gap-3">
                                <span className="text-xs font-bold text-slate-400 uppercase">Ascensos a 1ra</span>
                                <span className="text-xs sm:text-sm font-black text-emerald-400 text-right">
                                    {Array.isArray(event.metadata?.promoted) ? event.metadata.promoted.join(', ') : '-'}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex justify-between items-center gap-3">
                                <span className="text-xs font-bold text-slate-400 uppercase">Descensos a 2da</span>
                                <span className="text-xs sm:text-sm font-black text-rose-400 text-right">
                                    {Array.isArray(event.metadata?.relegated) ? event.metadata.relegated.join(', ') : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="text-center px-4">
                        <h1 id={titleId} className="text-4xl sm:text-5xl font-black text-white uppercase">{cleanTitle}</h1>
                        <p className="text-lg text-slate-300 mt-4">{cleanSubtitle}</p>
                    </div>
                );
        }
    };

    const isChampionCeremony = event.type === 'LEAGUE_WIN' || event.type === 'CUP_WIN' || (event.type === 'PROMOTION' && Boolean(event.metadata?.team));

    return (
        <dialog
            ref={dialogRef}
            {...({ closedby: 'closerequest' } as any)}
            aria-labelledby={titleId}
            className="apex-top-overlay overflow-y-auto select-none"
        >
            {/* Ambient Dark Luxury Stage */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse 85% 65% at 50% 22%, ${accentColor}22 0%, rgba(10, 14, 23, 0.97) 64%, #060A12 100%)`
                }}
            />
            <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

            {/* Top architectural hairline */}
            <div className="fixed top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--apex-gold)]/50 to-transparent pointer-events-none" />

            {/* Centered Stage */}
            <div className="relative z-10 w-full min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6">
                {renderContent()}

                <button
                    type="button"
                    autoFocus
                    onClick={handleContinue}
                    className={`mt-6 px-7 py-3 rounded-xl font-black uppercase tracking-[0.16em] text-xs transition-transform active:scale-[0.98] shadow-xl flex items-center gap-2 group cursor-pointer ${
                        isChampionCeremony
                            ? 'bg-[var(--apex-gold)] hover:bg-[#d8b85e] text-slate-950 shadow-[0_8px_28px_rgba(200,168,78,0.28)]'
                            : 'bg-white/10 hover:bg-white/15 border border-white/20 text-white'
                    }`}
                >
                    <span>{isChampionCeremony ? 'Alzar Trofeo y Continuar' : 'Continuar'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
            </div>
        </dialog>
    );
};
