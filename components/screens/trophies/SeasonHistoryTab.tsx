import React from 'react';
import { GameState, SeasonHistoryRecord } from '../../../types';
import { Trophy, Award, Crown, Star, BarChart3 } from 'lucide-react';
import { formatCurrencyShort } from '../../../utils';
import { StatCell, EmptyState } from '../transfers/TransferUI';

interface SeasonHistoryTabProps {
    gameState: GameState;
}

export const SeasonHistoryTab: React.FC<SeasonHistoryTabProps> = ({ gameState }) => {
    const seasonHistory = gameState.seasonHistory || [];

    if (seasonHistory.length === 0) {
        return (
            <div className="apex-card rounded-2xl">
                <EmptyState
                    icon={<BarChart3 className="w-6 h-6 text-sky-400" />}
                    title="Primera temporada en curso"
                    text="Al finalizar el campeonato, las posiciones, copas, premios individuales y balances quedarán archivados aquí."
                />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {seasonHistory.map((rec: SeasonHistoryRecord) => {
                const isChampion = rec.userPosition === 1;
                const isPodium = rec.userPosition > 1 && rec.userPosition <= 3;
                const totalPlayed = (rec.userWon || 0) + (rec.userDrawn || 0) + (rec.userLost || 0);
                const effectiveness = totalPlayed > 0 ? Math.round((rec.userPoints / (totalPlayed * 3)) * 100) : 0;

                return (
                    <div
                        key={rec.season}
                        className={`apex-card p-4 sm:p-5 rounded-2xl space-y-3 border-l-2 ${
                            isChampion ? 'border-l-[var(--apex-gold)]' : isPodium ? 'border-l-sky-400' : 'border-l-white/10'
                        }`}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`px-2.5 py-1 rounded-lg font-black text-xs tabular-nums ${
                                    isChampion
                                        ? 'bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30'
                                        : 'bg-white/5 text-white border border-white/10'
                                }`}>
                                    Temp. {rec.season}
                                </span>
                                <span className="font-black text-white text-sm truncate">{rec.leagueName}</span>
                            </div>

                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                                isChampion
                                    ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                                    : isPodium
                                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                    : 'bg-white/5 text-slate-300 border-white/10'
                            }`}>
                                {isChampion ? (
                                    <>
                                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Campeón</span>
                                    </>
                                ) : (
                                    <span>{rec.userPosition}º Puesto</span>
                                )}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <StatCell label="Puntos" value={`${rec.userPoints} pts`} />
                            <StatCell
                                label="Balance"
                                value={
                                    <span>
                                        <span className="text-emerald-400">{rec.userWon}G</span> ·{' '}
                                        <span className="text-slate-400">{rec.userDrawn}E</span> ·{' '}
                                        <span className="text-rose-400">{rec.userLost}P</span>
                                    </span>
                                }
                            />
                            <StatCell label="Efectividad" value={`${effectiveness}%`} />
                            <StatCell label="Tesorería" value={formatCurrencyShort(rec.endBalance || 0)} accent="text-emerald-400" />
                        </div>

                        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-slate-300">
                                <Crown className="w-3 h-3 text-amber-400" />
                                <span className="text-slate-400">Campeón:</span>
                                <strong className="text-white">{rec.leagueChampion}</strong>
                            </span>

                            {rec.goldenBootWinner && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-slate-300">
                                    <Award className="w-3 h-3 text-amber-400" />
                                    <span className="text-slate-400">Goleador:</span>
                                    <strong className="text-amber-300">{rec.goldenBootWinner.name} ({rec.goldenBootWinner.goals})</strong>
                                </span>
                            )}

                            {rec.ballonDorWinner && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-slate-300">
                                    <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                                    <span className="text-slate-400">Balón de Oro:</span>
                                    <strong className="text-amber-300">{rec.ballonDorWinner.name}</strong>
                                </span>
                            )}

                            {rec.cupWinners && rec.cupWinners.map((cw, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-slate-300"
                                >
                                    <Trophy className="w-3 h-3 text-amber-400" />
                                    <span className="text-slate-400">{cw.cupName}:</span>
                                    <strong className="text-white">{cw.winnerName}</strong>
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
