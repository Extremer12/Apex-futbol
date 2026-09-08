import React from 'react';
import { GameState } from '../../../types';
import { getSeasonSummaryData } from '../../../services/seasonUtils';
import { TeamLogo } from '../../../data/teams/helpers';
import { TrophyIcon, TrendingUpIcon, TrendingDownIcon, CloseIcon } from '../../icons';

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
                        <TrophyIcon className="w-8 h-8 text-[var(--apex-gold)]" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-[var(--apex-gold)]">
                        Balance Final de Competición
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
                        Fin de Temporada {summary.season}
                    </h2>
                    <p className="text-sm text-slate-400 max-w-md mt-1">
                        Todos los torneos han concluido. Aquí tienes el balance oficial de títulos, descensos y clasificaciones.
                    </p>
                </div>

                {/* Grid of Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Títulos y Campeones */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                            <TrophyIcon className="w-5 h-5 text-amber-400" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Cuadro de Honor</h3>
                        </div>

                        {summary.isArgentina ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                    <div>
                                        <span className="text-[10px] font-bold text-amber-400/80 uppercase">Torneo Apertura</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {summary.aperturaChampion && <TeamLogo team={summary.aperturaChampion} size="sm" />}
                                            <span className="text-sm font-bold text-white">
                                                {summary.aperturaChampion?.name || 'En Disputa'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Campeón
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                    <div>
                                        <span className="text-[10px] font-bold text-amber-400/80 uppercase">Torneo Clausura</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {summary.clausuraChampion && <TeamLogo team={summary.clausuraChampion} size="sm" />}
                                            <span className="text-sm font-bold text-white">
                                                {summary.clausuraChampion?.name || 'En Disputa'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Campeón
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                <div>
                                    <span className="text-[10px] font-bold text-amber-400/80 uppercase">Campeón de Liga</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {summary.leagueChampion && <TeamLogo team={summary.leagueChampion} size="sm" />}
                                        <span className="text-sm font-bold text-white">
                                            {summary.leagueChampion?.name || 'Desconocido'}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    1º Puesto
                                </span>
                            </div>
                        )}

                        {/* Copas ganadas */}
                        {summary.cupWinners.length > 0 && (
                            <div className="space-y-2 pt-1">
                                {summary.cupWinners.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                                        <span className="text-xs font-semibold text-slate-400">{c.cupName}</span>
                                        <div className="flex items-center gap-2">
                                            {c.winnerTeam && <TeamLogo team={c.winnerTeam} size="xs" />}
                                            <span className="text-xs font-bold text-slate-200">{c.winnerTeam?.name || '-'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ascensos y Descensos */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                            <TrendingDownIcon className="w-5 h-5 text-red-400" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Movimientos de División</h3>
                        </div>

                        {/* Ascendidos */}
                        <div>
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase mb-2">
                                <TrendingUpIcon className="w-3.5 h-3.5" />
                                {summary.isArgentina ? 'Ascensos a Primera División' : 'Ascendidos a 1ª División'}
                            </span>
                            {summary.promotedTeams.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">No determinados</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {summary.promotedTeams.map(team => (
                                        <div key={team.id} className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="flex items-center gap-2">
                                                <TeamLogo team={team} size="xs" />
                                                <span className="text-xs font-bold text-white">{team.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                                ⬆ Ascendido
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Descendidos */}
                        <div>
                            <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5 uppercase mb-2">
                                <TrendingDownIcon className="w-3.5 h-3.5" />
                                {summary.isArgentina ? 'Descensos a Primera Nacional' : 'Descendidos a 2ª División'}
                            </span>
                            {summary.relegatedTeams.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">No determinados</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {summary.relegatedTeams.map(team => (
                                        <div key={team.id} className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                            <div className="flex items-center gap-2">
                                                <TeamLogo team={team} size="xs" />
                                                <span className="text-xs font-bold text-white">{team.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                                                ⬇ Descendido
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tu Club & Clasificación Internacional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Desempeño de tu Club */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <TeamLogo team={summary.userTeam} size="md" />
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Tu Equipo</span>
                                <h4 className="text-base font-black text-white">{summary.userTeam.name}</h4>
                                <span className="text-xs text-slate-400">Puntos: <strong className="text-white">{summary.userPoints}</strong></span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Posición Final</span>
                            <span className="text-2xl font-black text-white">{summary.userPosition}º</span>
                        </div>
                    </div>

                    {/* Copas Internacionales */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Clasificados a Torneos Continentales</span>
                        {summary.isArgentina ? (
                            <div className="flex flex-wrap gap-2">
                                {summary.libertadoresQualified.slice(0, 4).map(t => (
                                    <span key={t.id} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                        Libertadores: {t.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {summary.championsLeagueQualified.map(t => (
                                    <span key={t.id} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                        UCL: {t.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                        Cerrar Resumen
                    </button>

                    <button
                        onClick={onStartNewSeason}
                        disabled={isStarting}
                        className="apex-btn-gold w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
                    >
                        {isStarting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                <span>Iniciando Temporada {summary.season + 1}...</span>
                            </>
                        ) : (
                            <span>Comenzar Temporada {summary.season + 1} ➔</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
