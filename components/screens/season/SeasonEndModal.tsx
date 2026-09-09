import React, { useState } from 'react';
import { GameState } from '../../../types';
import { getSeasonSummaryData } from '../../../services/seasonUtils';
import { TeamLogo } from '../../../data/teams/helpers';
import { TrophyIcon, TrendingUpIcon, TrendingDownIcon, CloseIcon, ShieldIcon, SparklesIcon } from '../../icons';

interface SeasonEndModalProps {
    gameState: GameState;
    onClose: () => void;
    onStartNewSeason: () => void;
    isStarting?: boolean;
}

export const SeasonEndModal: React.FC<SeasonEndModalProps> = ({
    gameState,
    onClose,
    onStartNewSeason,
    isStarting = false
}) => {
    const summary = getSeasonSummaryData(gameState);
    const [selectedRegion, setSelectedRegion] = useState<string>('all');

    const regions = [
        { id: 'all', label: 'Todos los Torneos' },
        { id: 'Internacional', label: '🌎 Internacionales' },
        { id: 'Argentina', label: '🇦🇷 Argentina' },
        { id: 'Inglaterra', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra' },
        { id: 'España', label: '🇪🇸 España' },
        { id: 'Italia', label: '🇮🇹 Italia' },
        { id: 'Alemania', label: '🇩🇪 Alemania' },
        { id: 'Francia', label: '🇫🇷 Francia' },
        { id: 'Brasil', label: '🇧🇷 Brasil' },
        { id: 'Paraguay', label: '🇵🇾 Paraguay' },
    ];

    const filteredChampions = selectedRegion === 'all'
        ? summary.allChampions
        : summary.allChampions.filter(c => c.region === selectedRegion);

    // Group filtered champions by region for organized display
    const groupedChampions = filteredChampions.reduce((acc, curr) => {
        if (!acc[curr.region]) acc[curr.region] = [];
        acc[curr.region].push(curr);
        return acc;
    }, {} as Record<string, typeof summary.allChampions>);

    return (
        <div className="fixed inset-0 z-[99999] bg-slate-950 text-white min-h-screen h-screen w-screen overflow-y-auto flex flex-col animate-fade-in select-none">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--apex-gold)]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--apex-gold)]">
                                Cuadro Oficial de Temporada
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {summary.season}
                            </span>
                        </div>
                        <h1 className="text-base sm:text-xl font-black text-white uppercase tracking-tight">
                            Resumen de Campeones y Clasificaciones
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                        <CloseIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Cerrar</span>
                    </button>

                    <button
                        onClick={onStartNewSeason}
                        disabled={isStarting}
                        className="apex-btn-gold px-5 py-2.5 sm:px-7 sm:py-2.5 flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {isStarting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                <span>Iniciando...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4" />
                                <span>Comenzar Temporada {summary.season + 1} ➔</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Content Body */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                {/* Hero Card: User Club & Season Recap */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border border-white/10 p-6 sm:p-8 shadow-2xl">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 p-2.5 shrink-0 flex items-center justify-center shadow-xl">
                                <TeamLogo team={summary.userTeam} className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--apex-gold)] block mb-0.5">
                                    Desempeño Oficial del Club
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                                    {summary.userTeam.name}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                    {summary.userPoints} puntos conseguidos en la temporada regular • Posición final: <strong className="text-amber-400 font-black">{summary.userPosition}º</strong>
                                </p>
                            </div>
                        </div>

                        {/* Badges / Honors */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Posición</span>
                                <span className="text-lg sm:text-xl font-black text-amber-400">{summary.userPosition}º</span>
                            </div>
                            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Puntos</span>
                                <span className="text-lg sm:text-xl font-black text-white">{summary.userPoints}</span>
                            </div>
                            {summary.isArgentina && (
                                <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Promedio</span>
                                    <span className="text-lg sm:text-xl font-black text-emerald-400">
                                        {(gameState.leagueTables.liga_argentina?.find(r => r.teamId === summary.userTeam.id)?.promedio || 0).toFixed(3)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Region Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
                    {regions.map(r => (
                        <button
                            key={r.id}
                            onClick={() => setSelectedRegion(r.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                selectedRegion === r.id
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                {/* Champions Grid by Country/Region */}
                <div className="space-y-8">
                    {Object.entries(groupedChampions).map(([regionName, champs]) => (
                        <div key={regionName} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-5 rounded-full bg-amber-500" />
                                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                                    {regionName}
                                </h3>
                                <span className="text-xs text-slate-500 font-bold">({champs.length} competiciones)</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {champs.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-slate-900/70 border border-white/5 hover:border-amber-500/30 rounded-2xl p-4 transition-all hover:bg-slate-900 flex items-center justify-between gap-3 shadow-lg"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Fixed sized logo container */}
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 shrink-0 flex items-center justify-center p-1">
                                                {item.team ? (
                                                    <TeamLogo team={item.team} className="w-full h-full object-contain" />
                                                ) : (
                                                    <ShieldIcon className="w-5 h-5 text-slate-600" />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider block truncate">
                                                    {item.name}
                                                </span>
                                                <h4 className="text-sm font-black text-white truncate">
                                                    {item.team?.name || 'En Disputa'}
                                                </h4>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>

                                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                                            {item.statusBadge || 'Campeón'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ascensos, Descensos & Clasificaciones Continentales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                    {/* Movimientos de División */}
                    <div className="bg-slate-900/70 border border-white/5 rounded-3xl p-6 space-y-6">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                            <TrendingDownIcon className="w-5 h-5 text-rose-400" />
                            <h3 className="text-base font-black uppercase tracking-wider text-white">
                                Movimientos de División
                            </h3>
                        </div>

                        {/* Ascendidos */}
                        <div className="space-y-3">
                            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase">
                                <TrendingUpIcon className="w-4 h-4" />
                                {summary.isArgentina ? 'Ascensos a Primera División' : 'Ascendidos a 1ª División'}
                            </span>
                            {summary.promotedTeams.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">No determinados</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {summary.promotedTeams.map(team => (
                                        <div key={team.id} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                    <TeamLogo team={team} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs font-bold text-white truncate">{team.name}</span>
                                            </div>
                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                                                ⬆ Ascenso
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Descendidos */}
                        <div className="space-y-3 pt-2">
                            <span className="text-xs font-black text-rose-400 flex items-center gap-1.5 uppercase">
                                <TrendingDownIcon className="w-4 h-4" />
                                {summary.isArgentina ? 'Descensos a Primera Nacional' : 'Descendidos de Categoría'}
                            </span>
                            {summary.relegatedTeams.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">No determinados</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {summary.relegatedTeams.map(team => (
                                        <div key={team.id} className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                    <TeamLogo team={team} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs font-bold text-white truncate">{team.name}</span>
                                            </div>
                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 shrink-0">
                                                ⬇ Descenso
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clasificados a Torneos Continentales */}
                    <div className="bg-slate-900/70 border border-white/5 rounded-3xl p-6 space-y-6">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                            <TrophyIcon className="w-5 h-5 text-amber-400" />
                            <h3 className="text-base font-black uppercase tracking-wider text-white">
                                Clasificaciones Continentales
                            </h3>
                        </div>

                        {summary.isArgentina ? (
                            <div className="space-y-5">
                                <div>
                                    <span className="text-xs font-black text-amber-400 uppercase block mb-2">
                                        🏆 Clasificados a Copa Libertadores
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {summary.libertadoresQualified.slice(0, 6).map(t => (
                                            <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 min-w-0">
                                                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                    <TeamLogo team={t} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs font-bold text-amber-200 truncate">{t.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-black text-sky-400 uppercase block mb-2">
                                        🥈 Clasificados a Copa Sudamericana
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {summary.sudamericanaQualified.slice(0, 6).map(t => (
                                            <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 min-w-0">
                                                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                    <TeamLogo team={t} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs font-bold text-sky-200 truncate">{t.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <span className="text-xs font-black text-blue-400 uppercase block mb-3">
                                    ⭐ Clasificados a UEFA Champions League
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {summary.championsLeagueQualified.map(t => (
                                        <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 min-w-0">
                                            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                <TeamLogo team={t} className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xs font-bold text-blue-200 truncate">{t.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom CTA Banner */}
                <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                            ¿Listo para una nueva temporada?
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                            Comenzar Temporada {summary.season + 1}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                            Se actualizarán los presupuestos, se procesarán los ascensos y descensos, los nuevos cupos continentales y el calendario oficial.
                        </p>
                    </div>

                    <button
                        onClick={onStartNewSeason}
                        disabled={isStarting}
                        className="apex-btn-gold px-8 py-4 flex items-center justify-center gap-2.5 font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-amber-500/20 shrink-0 w-full sm:w-auto"
                    >
                        {isStarting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                <span>Preparando Nueva Temporada...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                <span>Iniciar Temporada {summary.season + 1} ➔</span>
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
};
