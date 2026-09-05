import React, { useState, useEffect } from 'react';
import { getGlobalLeaderboard, LeaderboardEntry } from '../../services/leaderboard';
import { Modal } from '../ui/Modal';
import { TrophyIcon, LoadingSpinner } from '../icons';

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
        <Modal title="Salón de la Fama Global" onClose={onClose}>
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <p className="text-xs text-slate-400">
                        Los mejores presidentes de club clasificados por títulos, estabilidad política y finanzas.
                    </p>
                    <span className="text-[10px] font-bold text-[var(--apex-gold)] uppercase tracking-wider bg-[var(--apex-gold)]/10 px-2.5 py-1 rounded-full">
                        Supabase Cloud
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <LoadingSpinner />
                        <span className="text-xs text-slate-400 mt-3 font-bold uppercase tracking-wider">
                            Cargando ranking global...
                        </span>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                        <TrophyIcon className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-sm text-slate-400 font-bold">¡El Salón de la Fama está esperando a su primer presidente!</p>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                            Completa temporadas exitosas y registra tu legado en la nube.
                        </p>
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {entries.map((entry, index) => {
                            const isTop3 = index < 3;
                            const medalColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500';

                            return (
                                <div
                                    key={entry.id}
                                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                                        isTop3 
                                            ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-[var(--apex-gold)]/30' 
                                            : 'bg-slate-900/60 border-white/5 hover:bg-slate-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-7 text-center font-black text-sm ${medalColor}`}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-white font-bold text-xs sm:text-sm truncate">
                                                {entry.managerName}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                {entry.teamName} • Temporada {entry.season}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0 text-right">
                                        <div className="hidden sm:block">
                                            <span className="text-[10px] text-slate-400 font-bold block">Títulos</span>
                                            <span className="text-xs font-black text-white flex items-center justify-end gap-1">
                                                <TrophyIcon className="w-3 h-3 text-[var(--apex-gold)]" />
                                                {entry.trophiesCount}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[10px] text-slate-400 font-bold block">Puntaje</span>
                                            <span className="text-sm font-black text-[var(--apex-gold)]">
                                                {entry.score.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-end pt-3 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </Modal>
    );
};
