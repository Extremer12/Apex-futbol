import React, { useState } from 'react';
import { GameState } from '../../../types';
import { getSeasonSummaryData } from '../../../services/seasonUtils';
import { TeamLogo } from '../../../data/teams/helpers';
import { Trophy, TrendingUp, TrendingDown, Sparkles, X, ArrowRight } from 'lucide-react';

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
        { id: 'Internacional', label: 'Internacionales' },
        { id: 'Argentina', label: 'Argentina' },
        { id: 'Inglaterra', label: 'Inglaterra' },
        { id: 'España', label: 'España' },
        { id: 'Italia', label: 'Italia' },
        { id: 'Alemania', label: 'Alemania' },
        { id: 'Francia', label: 'Francia' },
        { id: 'Brasil', label: 'Brasil' },
        { id: 'Paraguay', label: 'Paraguay' },
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
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
                        <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
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
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Cerrar</span>
                    </button>

                    <button
                        onClick={onStartNewSeason}
                        disabled={isStarting}
                        className="apex-btn-gold px-5 py-2.5 sm:px-6 sm:py-2.5 flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {isStarting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                <span>Iniciando...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 text-black" />
                                <span>Comenzar Temporada {summary.season + 1}</span>
                                <ArrowRight className="w-4 h-4 text-black" />
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
                            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
                                <TeamLogo team={summary.userTeam} className="w-full h-full object-contain drop-shadow-xl" />
                            </div>
                            <div>
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 block mb-0.5">
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
                                            <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                                                {item.team ? (
                                                    <TeamLogo team={item.team} className="w-full h-full object-contain drop-shadow" />
                                                ) : (
                                                    <Trophy className="w-6 h-6 text-amber-500/30" />
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
                            <TrendingDown className="w-5 h-5 text-rose-400" />
                            <h3 className="text-base font-black uppercase tracking-wider text-white">
                                Movimientos de División
                            </h3>
                        </div>

                        {/* Ascendidos */}
                        <div className="space-y-3">
                            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase">
                                <TrendingUp className="w-4 h-4" />
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
                                             <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0 flex items-center gap-1">
                                                 <TrendingUp className="w-3 h-3" /> Ascenso
                                             </span>
                                         </div>
                                     ))}
                                 </div>
                            )}
                        </div>

                        {/* Descendidos */}
                        <div className="space-y-3 pt-2">
                            <span className="text-xs font-black text-rose-400 flex items-center gap-1.5 uppercase">
                                <TrendingDown className="w-4 h-4" />
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
                                             <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 shrink-0 flex items-center gap-1">
                                                 <TrendingDown className="w-3 h-3" /> Descenso
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
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <h3 className="text-base font-black uppercase tracking-wider text-white">
                                Clasificaciones Continentales
                            </h3>
                        </div>

                        {summary.isArgentina ? (
                            <div className="space-y-5">
                                <div>
                                    <span className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5 mb-2">
                                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                        Clasificados a Copa Libertadores
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
                                    <span className="text-xs font-black text-sky-400 uppercase flex items-center gap-1.5 mb-2">
                                        <Trophy className="w-3.5 h-3.5 text-sky-400" />
                                        Clasificados a Copa Sudamericana
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
                                <span className="text-xs font-black text-blue-400 uppercase flex items-center gap-1.5 mb-3">
                                    <Trophy className="w-3.5 h-3.5 text-blue-400" />
                                    Clasificados a UEFA Champions League
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

                {/* Bottom Action Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1626] via-[#0a0f1c] to-[#070b14] border border-amber-500/25 p-6 sm:p-7 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
                    <div className="space-y-1 text-center lg:text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                            Cierre Oficial de Ciclo
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                            Comenzar Temporada {summary.season + 1}
                        </h3>
                        <p className="text-xs text-slate-400 max-w-lg">
                            Se actualizarán presupuestos, contratos, ascensos, descensos y el calendario de todas las competencias.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                        <button
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            Volver
                        </button>
                        <button
                            onClick={onStartNewSeason}
                            disabled={isStarting}
                            className="apex-btn-gold px-6 py-3 flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {isStarting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    <span>Iniciando Temporada {summary.season + 1}...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 text-black" />
                                    <span>Iniciar Temporada {summary.season + 1}</span>
                                    <ArrowRight className="w-4 h-4 text-black" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
