import React, { useState, useEffect } from 'react';
import { getGlobalLeaderboard, LeaderboardEntry } from '../../services/leaderboard';
import { Trophy } from 'lucide-react';
import { LoadingSpinner } from '../icons';
import { BottomSheet, EmptyState } from '../screens/transfers/TransferUI';

interface LeaderboardModalProps {
    onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            setIsLoading(true);
            try {
                const data = await getGlobalLeaderboard(50);
                setEntries(data);
            } catch (err) {
                console.error('Error loading leaderboard:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRankings();
    }, []);

    return (
        <BottomSheet
            open
            onClose={onClose}
            size="lg"
            title="Salón de la Fama Global"
            footer={
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                    Cerrar
                </button>
            }
        >
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                    <p className="text-xs text-slate-400">
                        Clasificación histórica por títulos, estabilidad política y patrimonio.
                    </p>
                    <span className="text-[10px] font-black text-[var(--apex-gold)] uppercase tracking-wider bg-[var(--apex-gold)]/10 px-2.5 py-1 rounded-full shrink-0">
                        Cloud
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-14">
                        <LoadingSpinner />
                        <span className="text-[11px] text-slate-400 mt-3 font-bold uppercase tracking-wider">
                            Cargando ranking global...
                        </span>
                    </div>
                ) : entries.length === 0 ? (
                    <EmptyState
                        icon={<Trophy className="w-6 h-6 text-[var(--apex-gold)]" />}
                        title="Salón de la Fama vacío"
                        text="Completa temporadas exitosas y registra tu legado en la nube para inaugurar el ranking."
                    />
                ) : (
                    <div className="space-y-2">
                        {entries.map((entry, index) => {
                            const rankBadge =
                                index === 0
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                                    : index === 1
                                    ? 'bg-slate-400/20 text-slate-200 border-slate-400/40'
                                    : index === 2
                                    ? 'bg-amber-700/20 text-amber-500 border-amber-700/40'
                                    : 'bg-white/5 text-slate-400 border-white/10';

                            return (
                                <div
                                    key={entry.id}
                                    className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className={`w-8 h-8 rounded-xl border text-xs font-black flex items-center justify-center shrink-0 tabular-nums ${rankBadge}`}>
                                            #{index + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <h4 className="text-white font-bold text-xs sm:text-sm truncate">
                                                {entry.managerName}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 truncate">
                                                {entry.teamName} · Temp. {entry.season}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0 text-right">
                                        <div className="hidden sm:block">
                                            <span className="text-[10px] text-slate-500 font-bold block">Títulos</span>
                                            <span className="text-xs font-black text-white inline-flex items-center gap-1 tabular-nums">
                                                <Trophy className="w-3 h-3 text-[var(--apex-gold)]" />
                                                {entry.trophiesCount}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold block">Puntaje</span>
                                            <span className="text-sm font-black text-[var(--apex-gold)] tabular-nums">
                                                {entry.score.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </BottomSheet>
    );
};
