import React from 'react';
import { GameState, SeasonHistoryRecord } from '../../../types';
import { ChartBarIcon, TrophyIcon } from '../../icons';
import { Trophy, Star, Award, TrendingUp, TrendingDown, DollarSign, Crown, Medal } from 'lucide-react';
import { formatCurrency } from '../../../utils';

interface SeasonHistoryTabProps {
    gameState: GameState;
}

export const SeasonHistoryTab: React.FC<SeasonHistoryTabProps> = ({ gameState }) => {
    const seasonHistory = gameState.seasonHistory || [];

    if (seasonHistory.length === 0) {
        return (
            <div className="apex-card p-12 flex flex-col items-center justify-center text-center text-white/40 space-y-3 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <ChartBarIcon className="w-8 h-8 opacity-40" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">
                        Primera Temporada en Curso
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Aún no has completado tu primera temporada oficial al frente del club. Al finalizar el campeonato, las estadísticas, copas, balances y premiaciones se archivarán aquí automáticamente.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1 animate-fade-in">
            {seasonHistory.map((rec: SeasonHistoryRecord) => {
                const isChampion = rec.userPosition === 1;
                const isPodium = rec.userPosition > 1 && rec.userPosition <= 3;
                const totalPlayed = (rec.userWon || 0) + (rec.userDrawn || 0) + (rec.userLost || 0);

                return (
                    <div
                        key={rec.season}
                        className={`rounded-2xl p-4 sm:p-5 border transition-all space-y-3.5 backdrop-blur-md shadow-xl ${
                            isChampion
                                ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-[#0A0E17] border-amber-500/30 hover:border-amber-400/60'
                                : 'bg-gradient-to-r from-slate-900/90 via-[#0E1524] to-[#0A0E17] border-white/10 hover:border-white/20'
                        }`}
                    >
                        {/* Header Row: Season Badge + League + Position Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/10 pb-3">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-xl font-black text-xs font-mono border ${
                                    isChampion
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                                        : 'bg-white/10 text-white border-white/15'
                                }`}>
                                    Temporada {rec.season}
                                </span>
                                <span className="font-black text-white text-sm sm:text-base tracking-tight truncate">
                                    {rec.leagueName}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                                    isChampion
                                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-sm'
                                        : isPodium
                                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                        : 'bg-white/5 text-slate-300 border-white/10'
                                }`}>
                                    {isChampion ? (
                                        <>
                                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Campeón de Liga</span>
                                        </>
                                    ) : (
                                        <span>{rec.userPosition}º Puesto</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Symmetrical Stats Metrics Grid: 4 Clean Columns */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                            <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                    Puntos Liga
                                </span>
                                <span className="font-mono font-black text-base text-white">
                                    {rec.userPoints} <span className="text-xs text-slate-400 font-normal">pts</span>
                                </span>
                            </div>

                            <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                    Balance de Partidos
                                </span>
                                <span className="font-mono font-bold text-sm text-slate-200">
                                    <span className="text-emerald-400">{rec.userWon}V</span> •{' '}
                                    <span className="text-slate-400">{rec.userDrawn}E</span> •{' '}
                                    <span className="text-rose-400">{rec.userLost}D</span>
                                </span>
                            </div>

                            <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                    Efectividad
                                </span>
                                <span className="font-mono font-bold text-sm text-slate-200">
                                    {totalPlayed > 0 ? `${Math.round((rec.userPoints / (totalPlayed * 3)) * 100)}%` : '0%'}
                                </span>
                            </div>

                            <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                    Tesorería Final
                                </span>
                                <span className="font-mono font-black text-sm text-emerald-400">
                                    {formatCurrency(rec.endBalance || 0)}
                                </span>
                            </div>
                        </div>

                        {/* Awards & Champions Footer Strip */}
                        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-slate-400 text-[11px] font-bold">Campeón Liga:</span>
                                    <span className="text-white font-bold text-[11px]">{rec.leagueChampion}</span>
                                </div>

                                {rec.goldenBootWinner && (
                                    <div className="flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5 text-yellow-400" />
                                        <span className="text-slate-400 text-[11px] font-bold">Goleador:</span>
                                        <span className="text-yellow-300 font-bold text-[11px]">
                                            {rec.goldenBootWinner.name} ({rec.goldenBootWinner.teamName}, {rec.goldenBootWinner.goals}G)
                                        </span>
                                    </div>
                                )}

                                {rec.ballonDorWinner && (
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                                        <span className="text-slate-400 text-[11px] font-bold">Balón de Oro:</span>
                                        <span className="text-amber-300 font-bold text-[11px]">
                                            {rec.ballonDorWinner.name} ({rec.ballonDorWinner.teamName})
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Cups won in this season */}
                            {rec.cupWinners && rec.cupWinners.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {rec.cupWinners.map((cw, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 flex items-center gap-1"
                                        >
                                            <Trophy className="w-3 h-3 text-amber-400" />
                                            <span className="text-slate-400">{cw.cupName}:</span>
                                            <span className="text-amber-200">{cw.winnerName}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
