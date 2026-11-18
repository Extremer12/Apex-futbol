import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { INITIAL_ACHIEVEMENTS } from '../../services/achievementService';
import { Achievement, AchievementCategory } from '../../types';
import { getSavedGames, loadGame } from '../../services/db';
import { Trophy, Award, Lock, CheckCircle2 } from 'lucide-react';

export const AchievementsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
    const [filter, setFilter] = useState<AchievementCategory | 'ALL'>('ALL');

    useEffect(() => {
        const loadAchievements = async () => {
            try {
                // Try reading from most recent save game
                const saves = await getSavedGames();
                if (saves.length > 0) {
                    const sorted = saves.sort((a, b) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime());
                    const fullSave = await loadGame(sorted[0].id);
                    if (fullSave?.gameState?.achievements && fullSave.gameState.achievements.length > 0) {
                        setAchievements(fullSave.gameState.achievements);
                        return;
                    }
                }
                // Fallback to localStorage if saved globally
                const stored = localStorage.getItem('apex_unlocked_achievements');
                if (stored) {
                    const unlockedIds: string[] = JSON.parse(stored);
                    setAchievements(INITIAL_ACHIEVEMENTS.map(a => ({
                        ...a,
                        isUnlocked: unlockedIds.includes(a.id)
                    })));
                }
            } catch (e) {
                console.warn('Could not load saved achievements:', e);
            }
        };
        loadAchievements();
    }, []);

    const categories: { key: AchievementCategory | 'ALL'; label: string }[] = [
        { key: 'ALL', label: 'Todos' },
        { key: 'trophies', label: 'Trofeos' },
        { key: 'management', label: 'Gestión' },
        { key: 'transfers', label: 'Fichajes' },
        { key: 'special', label: 'Especiales' },
    ];

    const filtered = filter === 'ALL' 
        ? achievements 
        : achievements.filter(a => a.category === filter);

    const unlockedCount = achievements.filter(a => a.isUnlocked).length;
    const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

    return (
        <Modal title="Logros y Desafíos" onClose={onClose}>
            <div className="space-y-4 max-h-[75vh] flex flex-col">
                {/* Progress summary banner */}
                <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-white font-black text-sm uppercase tracking-wide">Progreso General</h4>
                            <p className="text-xs text-slate-400">
                                {unlockedCount} de {achievements.length} logros completados ({progressPercent}%)
                            </p>
                        </div>
                    </div>
                    <div className="w-24 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                        <div 
                            className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map(c => (
                        <button
                            key={c.key}
                            onClick={() => setFilter(c.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                filter === c.key
                                    ? 'bg-[var(--apex-gold)] text-black'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                {/* Achievements list */}
                <div className="overflow-y-auto space-y-2.5 pr-1 max-h-[50vh]">
                    {filtered.map(ach => (
                        <div
                            key={ach.id}
                            className={`p-3 rounded-xl border transition-all flex items-start gap-3.5 ${
                                ach.isUnlocked
                                    ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                                    : 'bg-slate-900/60 border-slate-800/80 opacity-70'
                            }`}
                        >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                                ach.isUnlocked
                                    ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_12px_rgba(245,197,24,0.25)]'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-500'
                            }`}>
                                {ach.icon || <Award className="w-5 h-5 text-slate-400" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h5 className={`font-bold text-xs sm:text-sm truncate ${
                                        ach.isUnlocked ? 'text-amber-300' : 'text-slate-300'
                                    }`}>
                                        {ach.title}
                                    </h5>
                                    {ach.isUnlocked ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-950/50 px-2 py-0.5 rounded-full border border-green-500/30 shrink-0">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Completado
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 shrink-0">
                                            <Lock className="w-3 h-3" />
                                            Bloqueado
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                    {ach.description}
                                </p>
                                {ach.unlockedAt && (
                                    <p className="text-[10px] text-amber-400/80 mt-1">
                                        Desbloqueado el: {ach.unlockedAt}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};
