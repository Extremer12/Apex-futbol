import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { GameState, LEAGUE_COUNTRY, LeagueId } from '../../../types';
import { CompetitionChampionItem, getSeasonSummaryData } from '../../../services/seasonUtils';
import { TeamLogo, usePacksVersion } from '../../../data/teams/helpers';
import { resourceManager } from '../../../services/resources/ResourceManager';
import { TrophyImage } from '../trophies/TrophyImage';
import { PlayerAvatar } from '../../ui/PlayerAvatar';
import { StatCell, EmptyState } from '../transfers/TransferUI';
import { playUiClick } from '../../../services/soundService';
import {
    Award,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Crown,
    Globe,
    Medal,
    Shield,
    Star,
    TrendingDown,
    TrendingUp,
    Trophy
} from 'lucide-react';
import { calculatePresidentialScore, submitPresidentialScore } from '../../../services/leaderboard';
import { supabase } from '../../../services/supabase';

interface SeasonEndModalProps {
    gameState: GameState;
    onClose: () => void;
    onStartNewSeason: () => void;
    isStarting?: boolean;
}

type SeasonTabKey = 'CHAMPIONS' | 'MOVEMENTS' | 'AWARDS';
type CompCategoryFilter = 'ALL' | 'Liga' | 'Copa' | 'Ascenso';

const COUNTRY_CODE_TO_REGION: Record<string, string> = {
    ARG: 'Argentina',
    BRA: 'Brasil',
    COL: 'Colombia',
    CHI: 'Chile',
    PAR: 'Paraguay',
    MEX: 'México',
    ENG: 'Inglaterra',
    ESP: 'España',
    ITA: 'Italia',
    GER: 'Alemania',
    FRA: 'Francia',
};

const resolveCompArtwork = (item: CompetitionChampionItem): string => {
    if (!item.competitionId) return '';
    if (item.category === 'Copa') {
        return resourceManager.competitionLogo(item.competitionId, item.name);
    }
    return resourceManager.leagueLogo(item.competitionId, item.name);
};

const ChampionCompetitionCard: React.FC<{
    item: CompetitionChampionItem;
    userTeamId: number;
}> = React.memo(({ item, userTeamId }) => {
    const isUserChamp = Boolean(item.team && item.team.id === userTeamId);
    const compLogo = useMemo(() => resolveCompArtwork(item), [item.competitionId, item.name, item.category]);
    const [logoFailed, setLogoFailed] = useState(false);

    return (
        <div
            className={`apex-card p-3.5 sm:p-4 rounded-2xl relative overflow-hidden transition-colors flex flex-col justify-between gap-3 ${
                isUserChamp
                    ? 'border-[var(--apex-gold)]/55 bg-gradient-to-br from-[#191811] via-[#101624] to-[#0C101B] shadow-[0_0_24px_rgba(200,168,78,0.12)]'
                    : 'hover:border-white/15'
            }`}
        >
            {/* Top gold accent bar for user champion */}
            {isUserChamp && (
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--apex-gold)] to-transparent" />
            )}

            {/* Header: Competition Badge & Category */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 p-0.5 flex items-center justify-center shrink-0">
                        {compLogo && !logoFailed ? (
                            <img
                                src={compLogo}
                                alt={item.name}
                                className="w-full h-full object-contain"
                                loading="lazy"
                                onError={() => setLogoFailed(true)}
                            />
                        ) : (
                            <Trophy className="w-3 h-3 text-[var(--apex-gold)]" />
                        )}
                    </div>
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider truncate">
                        {item.name}
                    </span>
                </div>

                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border shrink-0 ${
                    isUserChamp
                        ? 'bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] border-[var(--apex-gold)]/40'
                        : item.category === 'Copa'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : item.category === 'Ascenso'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                }`}>
                    {isUserChamp ? 'Tu Club' : (item.statusBadge || item.category)}
                </span>
            </div>

            {/* Champion Row */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl p-1.5 flex items-center justify-center shrink-0 border ${
                        isUserChamp ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]/35' : 'bg-black/40 border-white/10'
                    }`}>
                        {item.team ? (
                            <TeamLogo team={item.team} className="w-full h-full object-contain drop-shadow" />
                        ) : (
                            <Trophy className="w-5 h-5 text-slate-600" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className={`text-sm font-black truncate ${isUserChamp ? 'text-amber-200' : 'text-white'}`}>
                            {item.team?.name || 'Por definir'}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mt-0.5 tabular-nums">
                            {item.detailText ? (
                                <span>{item.detailText}</span>
                            ) : (
                                <span>{item.category} · {item.region}</span>
                            )}
                        </div>
                    </div>
                </div>

                <TrophyImage
                    competitionId={item.competitionId || item.name}
                    name={item.name}
                    size="sm"
                />
            </div>

            {/* Runner-up footer */}
            {item.runnerUp && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                    <span className="uppercase tracking-wider font-bold text-slate-500">Subcampeón</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-4 h-4 shrink-0">
                            <TeamLogo team={item.runnerUp} className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-slate-300 truncate">{item.runnerUp.name}</span>
                    </div>
                </div>
            )}
        </div>
    );
});

export const SeasonEndModal: React.FC<SeasonEndModalProps> = ({
    gameState,
    onClose,
    onStartNewSeason,
    isStarting = false
}) => {
    usePacksVersion();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const closedRef = useRef(false);

    const summary = useMemo(() => getSeasonSummaryData(gameState), [gameState]);

    const [activeTab, setActiveTab] = useState<SeasonTabKey>('CHAMPIONS');
    const [selectedRegion, setSelectedRegion] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<CompCategoryFilter>('ALL');
    const [isSubmittingScore, setIsSubmittingScore] = useState(false);
    const [scoreSubmitted, setScoreSubmitted] = useState(false);

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

        const handleClose = () => {
            if (!closedRef.current) {
                closedRef.current = true;
                onCloseRef.current();
            }
        };

        dialog.addEventListener('close', handleClose);
        return () => {
            closedRef.current = true;
            dialog.removeEventListener('close', handleClose);
        };
    }, []);

    const trophiesCount = (gameState.team.trophyCabinet || []).length;
    const clubVal = gameState.finances.clubValue || 15000000;
    const fanApp = gameState.fanApproval?.overall || 50;
    const boardConf = gameState.boardConfidence ?? 75;
    const seasonsCount = gameState.season || 1;

    const presidentialScore = useMemo(
        () => calculatePresidentialScore(trophiesCount, clubVal, fanApp, boardConf, seasonsCount),
        [trophiesCount, clubVal, fanApp, boardConf, seasonsCount]
    );

    const isFreeMode = gameState.gameMode === 'FREE';

    // Auto-submit score to global leaderboard only in Realistic (Ranked) mode
    useEffect(() => {
        if (isFreeMode) return;
        let isMounted = true;
        const autoSubmit = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && !scoreSubmitted && !isSubmittingScore) {
                    setIsSubmittingScore(true);
                    await submitPresidentialScore({
                        managerName: gameState.playerProfile?.name || 'Presidente',
                        teamName: gameState.team.name,
                        season: seasonsCount,
                        trophiesCount,
                        clubValue: clubVal,
                        fanApproval: fanApp,
                        boardConfidence: boardConf,
                        gameMode: gameState.gameMode,
                    });
                    if (isMounted) setScoreSubmitted(true);
                }
            } catch (err) {
                console.error('Auto submit leaderboard error:', err);
            } finally {
                if (isMounted) setIsSubmittingScore(false);
            }
        };
        autoSubmit();
        return () => { isMounted = false; };
    }, []);

    const handleSubmitLeaderboard = async () => {
        if (isFreeMode || isSubmittingScore || scoreSubmitted) return;
        setIsSubmittingScore(true);
        try {
            await submitPresidentialScore({
                managerName: gameState.playerProfile?.name || 'Presidente',
                teamName: gameState.team.name,
                season: seasonsCount,
                trophiesCount,
                clubValue: clubVal,
                fanApproval: fanApp,
                boardConfidence: boardConf,
                gameMode: gameState.gameMode,
            });
            setScoreSubmitted(true);
            playUiClick();
        } catch (err) {
            console.error('Error submitting score:', err);
        } finally {
            setIsSubmittingScore(false);
        }
    };

    const leagueCountryCode = gameState.team.leagueId !== 'CONMEBOL' ? LEAGUE_COUNTRY[gameState.team.leagueId] : '';
    const userCountryRegion = COUNTRY_CODE_TO_REGION[leagueCountryCode] || '';

    const regions = useMemo(() => [
        { id: 'all', label: 'Todos' },
        { id: 'Internacional', label: 'Internacionales' },
        ...(userCountryRegion ? [{ id: userCountryRegion, label: `Mi País (${userCountryRegion})` }] : []),
        ...['Argentina', 'Brasil', 'Colombia', 'Chile', 'Paraguay', 'México', 'Inglaterra', 'España', 'Italia', 'Alemania', 'Francia']
            .filter(r => r !== userCountryRegion)
            .map(r => ({ id: r, label: r })),
    ], [userCountryRegion]);

    const groupedChampions = useMemo(() => {
        const filtered = summary.allChampions.filter(c => {
            if (selectedRegion !== 'all' && c.region !== selectedRegion) return false;
            if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
            return true;
        });

        const grouped = filtered.reduce((acc, curr) => {
            if (!acc[curr.region]) acc[curr.region] = [];
            acc[curr.region].push(curr);
            return acc;
        }, {} as Record<string, CompetitionChampionItem[]>);

        // Prioritize Internacional first, then user's country, then alphabetical/order
        const entries = Object.entries(grouped);
        entries.sort(([regA], [regB]) => {
            if (regA === 'Internacional') return -1;
            if (regB === 'Internacional') return 1;
            if (regA === userCountryRegion) return -1;
            if (regB === userCountryRegion) return 1;
            return 0;
        });
        return entries;
    }, [summary.allChampions, selectedRegion, categoryFilter, userCountryRegion]);

    const userArgPromedio = useMemo(() => {
        if (!summary.isArgentina) return null;
        return gameState.leagueTables[LeagueId.LIGA_ARGENTINA]?.find(r => r.teamId === summary.userTeam.id)?.promedio ?? null;
    }, [summary.isArgentina, summary.userTeam.id, gameState.leagueTables]);

    const hasConmebolSpots = summary.libertadoresQualified.length > 0 || summary.sudamericanaQualified.length > 0;
    const hasUefaSpots = summary.championsLeagueQualified.length > 0;

    const statusBadgeText = summary.userTitlesWon.length > 0
        ? `${summary.userTitlesWon.length} ${summary.userTitlesWon.length === 1 ? 'Título Conquistado' : 'Títulos Conquistados'}`
        : summary.userPosition <= 4
        ? `Top ${summary.userPosition} · Zona Alta`
        : `${summary.userPosition}º en Liga`;

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            className="apex-top-overlay overflow-y-auto select-none"
        >
            {/* Top Sticky Header */}
            <header className="sticky top-0 z-30 bg-[#070A13]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 shadow-2xl">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#101624] border border-[var(--apex-gold)]/35 p-1.5 flex items-center justify-center shrink-0">
                            <TeamLogo team={summary.userTeam} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--apex-gold)] block truncate">
                                Cierre Oficial · Temporada {summary.season}
                            </span>
                            <h1 id={titleId} className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate">
                                Campeones y Balance del Año
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                playUiClick();
                                onClose();
                            }}
                            className="h-9 px-3 sm:px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Volver</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                playUiClick();
                                onStartNewSeason();
                            }}
                            disabled={isStarting}
                            className="h-9 px-3.5 sm:px-5 rounded-xl bg-[var(--apex-gold)] hover:bg-[#d8b85e] text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/15 active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {isStarting ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full animate-spin" />
                                    <span>Iniciando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Temporada {summary.season + 1}</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 pb-16">
                {/* Presidential Season Recap Hero */}
                <section className="apex-card p-4 sm:p-6 rounded-2xl relative overflow-hidden border-[var(--apex-gold)]/25">
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-[var(--apex-gold)]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="space-y-3 min-w-0">
                            <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0A0E17] border border-white/10 p-2 flex items-center justify-center shrink-0">
                                    <TeamLogo team={summary.userTeam} className="w-full h-full object-contain drop-shadow-lg" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                            summary.userTitlesWon.length > 0
                                                ? 'bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] border-[var(--apex-gold)]/40'
                                                : 'bg-white/5 text-slate-300 border-white/10'
                                        }`}>
                                            {statusBadgeText}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Temp. {summary.season}
                                        </span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight truncate">
                                        {summary.userTeam.name}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {summary.userPoints} puntos en temporada regular · Posición final: <strong className="text-[var(--apex-gold)]">{summary.userPosition}º</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Titles Won This Year Strip */}
                            {summary.userTitlesWon.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {summary.userTitlesWon.map((t, idx) => (
                                        <div
                                            key={idx}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30"
                                        >
                                            <TrophyImage competitionId={t.competitionId || t.name} name={t.name} size="sm" className="!w-5 !h-5" />
                                            <span className="text-[11px] font-black text-amber-200 uppercase tracking-wide">
                                                {t.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* KPI Strip + Leaderboard Submit */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
                                <StatCell label="Posición" value={`${summary.userPosition}º`} accent="text-[var(--apex-gold)]" />
                                <StatCell label="Puntos" value={<span className="tabular-nums">{summary.userPoints}</span>} />
                                {userArgPromedio !== null ? (
                                    <StatCell label="Promedio" value={<span className="tabular-nums">{userArgPromedio.toFixed(3)}</span>} accent="text-emerald-400" />
                                ) : (
                                    <StatCell
                                        label="Dif. Gol"
                                        value={<span className="tabular-nums">{summary.userGoalDifference >= 0 ? `+${summary.userGoalDifference}` : summary.userGoalDifference}</span>}
                                        accent={summary.userGoalDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                                    />
                                )}
                                <StatCell label="Score Apex" value={<span className="tabular-nums">{presidentialScore.toLocaleString()}</span>} accent="text-amber-300" />
                            </div>

                            {isFreeMode ? (
                                <span className="h-9 px-4 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 text-[11px] font-black uppercase tracking-wider flex items-center justify-center">
                                    Modo Libre · Sin Ranking Global
                                </span>
                            ) : (
                            <button
                                type="button"
                                onClick={handleSubmitLeaderboard}
                                disabled={isSubmittingScore || scoreSubmitted}
                                className={`h-9 px-4 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                                    scoreSubmitted
                                        ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                                        : 'bg-white/5 hover:bg-white/10 border-white/15 text-white cursor-pointer hover:border-[var(--apex-gold)]/50'
                                }`}
                            >
                                {scoreSubmitted ? (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Puntaje Publicado</span>
                                    </>
                                ) : isSubmittingScore ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>Registrando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Globe className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                                        <span>Publicar en Ranking</span>
                                    </>
                                )}
                            </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Sticky 3-Tab Navigation */}
                <nav className="sticky top-[61px] z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-1.5 bg-[#060A12]/95 backdrop-blur">
                    <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-2xl border border-white/5" role="tablist" aria-label="Secciones de cierre de temporada">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'CHAMPIONS'}
                            onClick={() => {
                                playUiClick();
                                setActiveTab('CHAMPIONS');
                            }}
                            className={`h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                activeTab === 'CHAMPIONS' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Crown className="w-3.5 h-3.5 hidden sm:inline" />
                            <span>Campeones</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'MOVEMENTS'}
                            onClick={() => {
                                playUiClick();
                                setActiveTab('MOVEMENTS');
                            }}
                            className={`h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                activeTab === 'MOVEMENTS' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <TrendingUp className="w-3.5 h-3.5 hidden sm:inline" />
                            <span>Copas y Ascensos</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'AWARDS'}
                            onClick={() => {
                                playUiClick();
                                setActiveTab('AWARDS');
                            }}
                            className={`h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                activeTab === 'AWARDS' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Award className="w-3.5 h-3.5 hidden sm:inline" />
                            <span>Premios del Año</span>
                        </button>
                    </div>
                </nav>

                {/* TAB 1: CHAMPIONS */}
                {activeTab === 'CHAMPIONS' && (
                    <div className="space-y-5">
                        {/* Filter Bar */}
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                                {regions.map(r => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setSelectedRegion(r.id)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors shrink-0 cursor-pointer border ${
                                            selectedRegion === r.id
                                                ? 'bg-[var(--apex-gold)] text-slate-950 border-[var(--apex-gold)] font-black'
                                                : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/10'
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-1.5">
                                {([
                                    { id: 'ALL', label: 'Todas' },
                                    { id: 'Liga', label: 'Ligas' },
                                    { id: 'Copa', label: 'Copas' },
                                    { id: 'Ascenso', label: 'Ascensos' },
                                ] as const).map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategoryFilter(cat.id)}
                                        className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                                            categoryFilter === cat.id
                                                ? 'bg-white/15 text-white border border-white/20'
                                                : 'bg-transparent text-slate-500 hover:text-slate-300 border border-transparent'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {groupedChampions.length === 0 ? (
                            <div className="apex-card rounded-2xl">
                                <EmptyState
                                    icon={<Trophy className="w-6 h-6 text-[var(--apex-gold)]" />}
                                    title="Sin competiciones en este filtro"
                                    text="Prueba seleccionando otra región o categoría de torneo."
                                />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupedChampions.map(([regionName, champs]) => (
                                    <section key={regionName} className="space-y-3">
                                        <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                                            <div className="flex items-center gap-2.5">
                                                <span className={`w-1.5 h-4 rounded-full ${
                                                    regionName === 'Internacional' ? 'bg-[var(--apex-gold)]' : regionName === userCountryRegion ? 'bg-emerald-400' : 'bg-slate-500'
                                                }`} />
                                                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                                                    {regionName}
                                                </h3>
                                            </div>
                                            <span className="text-[11px] text-slate-500 font-bold tabular-nums">
                                                {champs.length} {champs.length === 1 ? 'torneo' : 'torneos'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {champs.map((item, idx) => (
                                                <ChampionCompetitionCard
                                                    key={`${regionName}-${item.name}-${idx}`}
                                                    item={item}
                                                    userTeamId={summary.userTeam.id}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: MOVEMENTS & CONTINENTAL */}
                {activeTab === 'MOVEMENTS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Movimientos de División */}
                        <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-5">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-[var(--apex-gold)]" />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                        Movimientos de División
                                    </h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Tu Liga</span>
                            </div>

                            {/* Ascendidos */}
                            <div className="space-y-2.5">
                                <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    {summary.isArgentina ? 'Ascensos a Liga Profesional' : 'Ascendidos a 1ª División'}
                                </span>
                                {summary.promotedTeams.length === 0 ? (
                                    <p className="text-xs text-slate-500 py-2">Sin ascensos registrados en esta división.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {summary.promotedTeams.map(team => {
                                            const isUser = team.id === summary.userTeam.id;
                                            return (
                                                <div
                                                    key={team.id}
                                                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                                                        isUser ? 'bg-emerald-500/20 border-emerald-400/50' : 'bg-emerald-500/10 border-emerald-500/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                            <TeamLogo team={team} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-xs font-bold text-white truncate">{team.name}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                                                        Ascenso
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Descendidos */}
                            <div className="space-y-2.5 pt-2 border-t border-white/5">
                                <span className="text-[11px] font-black text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                                    <TrendingDown className="w-3.5 h-3.5" />
                                    {summary.isArgentina ? 'Descensos a Primera Nacional' : 'Descendidos de Categoría'}
                                </span>
                                {summary.relegatedTeams.length === 0 ? (
                                    <p className="text-xs text-slate-500 py-2">Sin descensos determinados en esta división.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {summary.relegatedTeams.map(team => {
                                            const isUser = team.id === summary.userTeam.id;
                                            return (
                                                <div
                                                    key={team.id}
                                                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                                                        isUser ? 'bg-rose-500/25 border-rose-400/60' : 'bg-rose-500/10 border-rose-500/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                            <TeamLogo team={team} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-xs font-bold text-white truncate">{team.name}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 shrink-0">
                                                        Descenso
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Clasificaciones Continentales */}
                        <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-5">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-[var(--apex-gold)]" />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                        Clasificaciones Continentales
                                    </h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Próxima Temporada</span>
                            </div>

                            {hasConmebolSpots ? (
                                <div className="space-y-4">
                                    {summary.libertadoresQualified.length > 0 && (
                                        <div>
                                            <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                                Copa Libertadores
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {summary.libertadoresQualified.slice(0, 6).map(t => (
                                                    <div
                                                        key={t.id}
                                                        className={`flex items-center gap-2 p-2.5 rounded-xl border min-w-0 ${
                                                            t.id === summary.userTeam.id
                                                                ? 'bg-[var(--apex-gold)]/20 border-[var(--apex-gold)]/50'
                                                                : 'bg-amber-500/10 border-amber-500/20'
                                                        }`}
                                                    >
                                                        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                            <TeamLogo team={t} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-xs font-bold text-amber-100 truncate">{t.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {summary.sudamericanaQualified.length > 0 && (
                                        <div className="pt-2 border-t border-white/5">
                                            <span className="text-[11px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                                <Trophy className="w-3.5 h-3.5 text-sky-400" />
                                                Copa Sudamericana
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {summary.sudamericanaQualified.slice(0, 6).map(t => (
                                                    <div
                                                        key={t.id}
                                                        className={`flex items-center gap-2 p-2.5 rounded-xl border min-w-0 ${
                                                            t.id === summary.userTeam.id
                                                                ? 'bg-sky-500/25 border-sky-400/50'
                                                                : 'bg-sky-500/10 border-sky-500/20'
                                                        }`}
                                                    >
                                                        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                            <TeamLogo team={t} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-xs font-bold text-sky-100 truncate">{t.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : hasUefaSpots ? (
                                <div>
                                    <span className="text-[11px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                                        <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                                        UEFA Champions League
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {summary.championsLeagueQualified.map(t => (
                                            <div
                                                key={t.id}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl border min-w-0 ${
                                                    t.id === summary.userTeam.id
                                                        ? 'bg-indigo-500/25 border-indigo-400/50'
                                                        : 'bg-indigo-500/10 border-indigo-500/20'
                                                }`}
                                            >
                                                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                    <TeamLogo team={t} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs font-bold text-indigo-100 truncate">{t.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<Globe className="w-6 h-6 text-slate-400" />}
                                    title="Sin cupos continentales directos"
                                    text="Esta categoría disputa únicamente el ascenso o competiciones domésticas de liga y copa."
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: SEASON AWARDS */}
                {activeTab === 'AWARDS' && (
                    <div className="space-y-4">
                        {/* Individual Gala Awards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Ballon d'Or / MVP */}
                            <div className="apex-card p-4 rounded-2xl border-[var(--apex-gold)]/30 space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)] flex items-center gap-1.5">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        Balón de Oro Mundial
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">MVP</span>
                                </div>
                                {summary.seasonAwards.ballonDor ? (
                                    <div className="flex items-center gap-3">
                                        <PlayerAvatar player={summary.seasonAwards.ballonDor.player} size="md" />
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-black text-white truncate">
                                                {summary.seasonAwards.ballonDor.player.name}
                                            </h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-4 h-4 shrink-0">
                                                    <TeamLogo team={summary.seasonAwards.ballonDor.team} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs text-slate-400 truncate">
                                                    {summary.seasonAwards.ballonDor.team.name}
                                                </span>
                                            </div>
                                            <div className="text-[11px] font-bold text-amber-300 mt-1 tabular-nums">
                                                {summary.seasonAwards.ballonDor.player.stats?.goals || 0}G · {summary.seasonAwards.ballonDor.player.stats?.assists || 0}A · OVR {summary.seasonAwards.ballonDor.player.rating}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 py-3">Sin registros suficientes esta campaña.</p>
                                )}
                            </div>

                            {/* Global Golden Boot */}
                            <div className="apex-card p-4 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5" />
                                        Bota de Oro Global
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Goleador</span>
                                </div>
                                {summary.seasonAwards.goldenBoot ? (
                                    <div className="flex items-center gap-3">
                                        <PlayerAvatar player={summary.seasonAwards.goldenBoot.player} size="md" />
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-black text-white truncate">
                                                {summary.seasonAwards.goldenBoot.player.name}
                                            </h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-4 h-4 shrink-0">
                                                    <TeamLogo team={summary.seasonAwards.goldenBoot.team} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs text-slate-400 truncate">
                                                    {summary.seasonAwards.goldenBoot.team.name}
                                                </span>
                                            </div>
                                            <div className="text-xs font-black text-emerald-400 mt-1 tabular-nums">
                                                {summary.seasonAwards.goldenBoot.value} goles oficiales
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 py-3">Sin goleadores registrados.</p>
                                )}
                            </div>

                            {/* League Golden Boot */}
                            <div className="apex-card p-4 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                                        <Medal className="w-3.5 h-3.5" />
                                        Goleador de Tu Liga
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">División</span>
                                </div>
                                {summary.seasonAwards.leagueGoldenBoot ? (
                                    <div className="flex items-center gap-3">
                                        <PlayerAvatar player={summary.seasonAwards.leagueGoldenBoot.player} size="md" />
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-black text-white truncate">
                                                {summary.seasonAwards.leagueGoldenBoot.player.name}
                                            </h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-4 h-4 shrink-0">
                                                    <TeamLogo team={summary.seasonAwards.leagueGoldenBoot.team} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs text-slate-400 truncate">
                                                    {summary.seasonAwards.leagueGoldenBoot.team.name}
                                                </span>
                                            </div>
                                            <div className="text-xs font-black text-sky-300 mt-1 tabular-nums">
                                                {summary.seasonAwards.leagueGoldenBoot.value} goles en el torneo
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 py-3">Sin goleadores en esta liga.</p>
                                )}
                            </div>
                        </div>

                        {/* User Club Year-End Trophy Showcase */}
                        <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-[var(--apex-gold)]" />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                        Vitrina de la Temporada {summary.season} · {summary.userTeam.name}
                                    </h3>
                                </div>
                                <span className="text-xs font-black text-[var(--apex-gold)] tabular-nums">
                                    {summary.userTitlesWon.length} {summary.userTitlesWon.length === 1 ? 'título' : 'títulos'}
                                </span>
                            </div>

                            {summary.userTitlesWon.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {summary.userTitlesWon.map((t, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 rounded-2xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/35 flex items-center gap-4"
                                        >
                                            <TrophyImage
                                                competitionId={t.competitionId || t.name}
                                                name={t.name}
                                                size="md"
                                                showPedestal={true}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)] block">
                                                    {t.statusBadge || 'Campeón'}
                                                </span>
                                                <h4 className="text-sm font-black text-white truncate">{t.name}</h4>
                                                {t.detailText && (
                                                    <span className="text-[11px] text-slate-300 block mt-0.5 tabular-nums">{t.detailText}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<Trophy className="w-6 h-6 text-slate-500" />}
                                    title="Sin trofeos oficiales este año"
                                    text={`El club cerró en el ${summary.userPosition}º puesto. Refuerza el plantel y el cuerpo técnico para competir por títulos en la temporada ${summary.season + 1}.`}
                                />
                            )}
                        </div>
                    </div>
                )}
            </main>
        </dialog>
    );
};
