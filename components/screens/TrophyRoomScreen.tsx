import React, { useState } from 'react';
import { GameState, AchievementCategory } from '../../types';
import { TrophyIcon, SparklesIcon, ChartBarIcon } from '../icons';
import { motion, AnimatePresence } from 'framer-motion';

interface TrophyRoomScreenProps {
    gameState: GameState;
}

type TabType = 'TROPHIES' | 'ACHIEVEMENTS' | 'HISTORY';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', damping: 15 }
    }
};

export const TrophyRoomScreen: React.FC<TrophyRoomScreenProps> = ({ gameState }) => {
    const { team, achievements = [], seasonHistory = [] } = gameState;
    const [activeTab, setActiveTab] = useState<TabType>('TROPHIES');
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL');

    const trophies = team.trophyCabinet || [];
    const leagueTrophies = trophies.filter(t => t.type === 'league');
    const cupTrophies = trophies.filter(t => t.type === 'cup');

    // Achievements calculation
    const unlockedAchievementsCount = achievements.filter(a => a.isUnlocked).length;
    const totalAchievementsCount = achievements.length || 15;
    const completionPercentage = Math.round((unlockedAchievementsCount / totalAchievementsCount) * 100);

    const filteredAchievements = achievements.filter(a => {
        if (selectedCategory === 'ALL') return true;
        return a.category === selectedCategory;
    });

    const categoryLabels: Record<AchievementCategory | 'ALL', { label: string; icon: string }> = {
        ALL: { label: 'Todos', icon: '🌟' },
        trophies: { label: 'Títulos', icon: '🏆' },
        management: { label: 'Gestión', icon: '💼' },
        transfers: { label: 'Fichajes', icon: '🤝' },
        special: { label: 'Especiales', icon: '⚡' }
    };

    return (
        <div className="p-4 md:p-6 space-y-8 pb-24 max-w-7xl mx-auto">
            {/* Header with Cinematic Glow */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden apex-card p-6 md:p-10 shadow-2xl group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000 pointer-events-none">
                    <TrophyIcon className="w-64 h-64 text-[var(--apex-gold)] grayscale" />
                </div>
                
                {/* Animated Particles Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [-20, -100],
                                opacity: [0, 0.3, 0],
                                x: Math.random() * 400 - 200
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 5
                            }}
                            className="absolute bottom-0 left-1/2 w-1 h-1 bg-[var(--apex-gold)] rounded-full blur-[1px]"
                        />
                    ))}
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {team.logo && (
                            <motion.div 
                                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                                className="w-24 h-24 md:w-32 md:h-32 bg-black/40 rounded-3xl p-4 shadow-[0_0_30px_rgba(200,168,78,0.2)] border border-[var(--apex-gold)]/30 flex items-center justify-center backdrop-blur-sm group-hover:border-[var(--apex-gold)]/60 transition-all duration-500"
                            >
                                <img src={team.logo} alt={team.name} className="w-full h-full object-contain drop-shadow-lg" />
                            </motion.div>
                        )}
                        <div className="text-center md:text-left">
                            <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-2">Palmarés & Legado Histórico</h2>
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter uppercase italic leading-none">
                                Sala de <span className="text-[var(--apex-gold)]">Trofeos</span>
                            </h1>
                            <p className="text-white/50 font-black uppercase tracking-widest text-[10px] bg-black/30 inline-block px-3 py-1.5 rounded-lg border border-white/5">
                                Vitrina oficial y analítica de {team.name}
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="text-center px-3 border-r border-white/10">
                            <div className="text-2xl font-black text-[var(--apex-gold)]">{trophies.length}</div>
                            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Títulos</div>
                        </div>
                        <div className="text-center px-3 border-r border-white/10">
                            <div className="text-2xl font-black text-emerald-400">{unlockedAchievementsCount}/{totalAchievementsCount}</div>
                            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Logros</div>
                        </div>
                        <div className="text-center px-3">
                            <div className="text-2xl font-black text-blue-400">{seasonHistory.length}</div>
                            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Campaña(s)</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-white/10 pb-4 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('TROPHIES')}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                        activeTab === 'TROPHIES'
                            ? 'bg-[var(--apex-gold)] text-black shadow-[0_0_20px_rgba(200,168,78,0.4)]'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                >
                    <TrophyIcon className="w-4 h-4" />
                    Vitrina ({trophies.length})
                </button>
                <button
                    onClick={() => setActiveTab('ACHIEVEMENTS')}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                        activeTab === 'ACHIEVEMENTS'
                            ? 'bg-[var(--apex-gold)] text-black shadow-[0_0_20px_rgba(200,168,78,0.4)]'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                >
                    <SparklesIcon className="w-4 h-4" />
                    Logros & Desafíos ({unlockedAchievementsCount}/{totalAchievementsCount})
                </button>
                <button
                    onClick={() => setActiveTab('HISTORY')}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                        activeTab === 'HISTORY'
                            ? 'bg-[var(--apex-gold)] text-black shadow-[0_0_20px_rgba(200,168,78,0.4)]'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                >
                    <ChartBarIcon className="w-4 h-4" />
                    Historial de Temporadas ({seasonHistory.length})
                </button>
            </div>

            {/* TAB 1: TROPHIES */}
            {activeTab === 'TROPHIES' && (
                <div>
                    {trophies.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="apex-card border-dashed border-white/20 rounded-3xl py-24 flex flex-col items-center justify-center text-center"
                        >
                            <TrophyIcon className="w-20 h-20 text-white/10 mb-6" />
                            <h2 className="text-2xl font-black text-white/50 mb-3 uppercase tracking-widest">Vitrina Vacía</h2>
                            <p className="text-white/30 text-sm max-w-md px-4 leading-relaxed font-bold">
                                El club aún no ha conquistado títulos bajo tu mandato. ¡Trabaja duro en el mercado y en la táctica para llenar esta sala de gloria!
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* League Trophies */}
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-6"
                            >
                                <h2 className="text-lg font-black text-white flex items-center gap-3 border-b border-white/10 pb-4 uppercase tracking-widest">
                                    <span className="text-[var(--apex-gold)] text-2xl drop-shadow-[0_0_10px_rgba(200,168,78,0.5)]">🏆</span> 
                                    Ligas Nacionales <span className="text-white/30 ml-auto font-mono">({leagueTrophies.length})</span>
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {leagueTrophies.map(trophy => (
                                        <motion.div 
                                            variants={itemVariants}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            key={trophy.id} 
                                            className="apex-card p-6 flex flex-col items-center justify-center text-center hover:border-[var(--apex-gold)]/50 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--apex-gold)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <TrophyIcon className="w-14 h-14 text-[var(--apex-gold)] mb-4 drop-shadow-[0_0_15px_rgba(200,168,78,0.4)] group-hover:scale-110 transition-transform duration-500" />
                                            <span className="text-xs font-black text-white uppercase mb-2 leading-tight tracking-tight relative z-10">{trophy.name}</span>
                                            <span className="text-[9px] font-black text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-1 rounded border border-[var(--apex-gold)]/20 uppercase tracking-[0.2em] relative z-10">
                                                S. {trophy.season}
                                            </span>
                                        </motion.div>
                                    ))}
                                    {leagueTrophies.length === 0 && (
                                        <div className="col-span-full py-8 text-center text-xs font-black text-white/30 uppercase tracking-widest">
                                            Sin títulos de liga todavía
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Cup Trophies */}
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-6"
                            >
                                <h2 className="text-lg font-black text-white flex items-center gap-3 border-b border-white/10 pb-4 uppercase tracking-widest">
                                    <span className="text-slate-300 text-2xl drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]">🥈</span> 
                                    Copas Nacionales <span className="text-white/30 ml-auto font-mono">({cupTrophies.length})</span>
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {cupTrophies.map(trophy => (
                                        <motion.div 
                                            variants={itemVariants}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            key={trophy.id} 
                                            className="apex-card p-6 flex flex-col items-center justify-center text-center hover:border-slate-300/50 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <TrophyIcon className="w-14 h-14 text-slate-300 mb-4 drop-shadow-[0_0_15px_rgba(203,213,225,0.3)] group-hover:scale-110 transition-transform duration-500" />
                                            <span className="text-xs font-black text-white uppercase mb-2 leading-tight tracking-tight relative z-10">{trophy.name}</span>
                                            <span className="text-[9px] font-black text-slate-300 bg-slate-400/10 px-2 py-1 rounded border border-slate-400/20 uppercase tracking-[0.2em] relative z-10">
                                                S. {trophy.season}
                                            </span>
                                        </motion.div>
                                    ))}
                                    {cupTrophies.length === 0 && (
                                        <div className="col-span-full py-8 text-center text-xs font-black text-white/30 uppercase tracking-widest">
                                            Sin títulos de copa todavía
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: ACHIEVEMENTS */}
            {activeTab === 'ACHIEVEMENTS' && (
                <div className="space-y-6">
                    {/* Completion Progress Banner */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="apex-card p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-black/60 via-black/40 to-black/60"
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <span>⭐ Progreso Global de Desafíos</span>
                                    <span className="text-[var(--apex-gold)] font-mono">({completionPercentage}%)</span>
                                </h3>
                                <p className="text-xs text-white/40 font-bold">
                                    Has desbloqueado {unlockedAchievementsCount} de los {totalAchievementsCount} logros presidenciales.
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 rounded-lg text-xs font-black uppercase tracking-widest">
                                {completionPercentage === 100 ? '👑 Leyenda Absoluta' : completionPercentage >= 50 ? '🥈 Presidente Consagrado' : '🥉 En Ascenso'}
                            </span>
                        </div>
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${completionPercentage}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-amber-500 via-[var(--apex-gold)] to-emerald-400 rounded-full"
                            />
                        </div>
                    </motion.div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {(Object.keys(categoryLabels) as Array<AchievementCategory | 'ALL'>).map(catKey => {
                            const info = categoryLabels[catKey];
                            const isSelected = selectedCategory === catKey;
                            const count = catKey === 'ALL' 
                                ? achievements.length 
                                : achievements.filter(a => a.category === catKey).length;

                            return (
                                <button
                                    key={catKey}
                                    onClick={() => setSelectedCategory(catKey)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                                        isSelected
                                            ? 'bg-white text-black font-black shadow-lg scale-105'
                                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                                    }`}
                                >
                                    <span>{info.icon}</span>
                                    <span>{info.label}</span>
                                    <span className="text-[10px] opacity-60 font-mono">({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Achievements Grid */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        <AnimatePresence>
                            {filteredAchievements.map(achievement => {
                                const isUnlocked = achievement.isUnlocked;
                                return (
                                    <motion.div
                                        key={achievement.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -4, scale: 1.01 }}
                                        className={`apex-card p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden border ${
                                            isUnlocked 
                                                ? 'border-[var(--apex-gold)]/40 bg-gradient-to-b from-[var(--apex-gold)]/5 to-black/60 shadow-[0_4px_20px_rgba(200,168,78,0.15)]' 
                                                : 'border-white/10 bg-black/40 opacity-70 grayscale hover:grayscale-0'
                                        }`}
                                    >
                                        {/* Status glow */}
                                        {isUnlocked && (
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--apex-gold)]/10 rounded-full blur-2xl pointer-events-none" />
                                        )}

                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                                                    {achievement.icon}
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                    isUnlocked
                                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                                        : 'bg-white/5 text-white/40 border-white/10'
                                                }`}>
                                                    {isUnlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
                                                </span>
                                            </div>

                                            <h4 className="text-base font-black text-white uppercase tracking-tight mb-1.5">
                                                {achievement.title}
                                            </h4>
                                            <p className="text-xs text-white/60 font-medium leading-relaxed mb-4">
                                                {achievement.description}
                                            </p>
                                        </div>

                                        {/* Footer progress or unlocked date */}
                                        <div className="pt-3 border-t border-white/10 mt-auto">
                                            {achievement.maxProgress !== undefined ? (
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-mono font-bold text-white/50">
                                                        <span>Progreso</span>
                                                        <span className="text-[var(--apex-gold)]">
                                                            {achievement.progress || 0} / {achievement.maxProgress}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-[var(--apex-gold)] rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${Math.min(100, (((achievement.progress || 0) / achievement.maxProgress) * 100))}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : isUnlocked && achievement.unlockedAt ? (
                                                <div className="text-[10px] text-white/40 font-mono flex items-center justify-between">
                                                    <span>Conseguido:</span>
                                                    <span className="text-[var(--apex-gold)]">{achievement.unlockedAt}</span>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-white/30 uppercase tracking-widest font-black">
                                                    Recompensa Presidencial
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}

            {/* TAB 3: SEASON HISTORY */}
            {activeTab === 'HISTORY' && (
                <div className="space-y-6">
                    {seasonHistory.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="apex-card border-dashed border-white/20 rounded-3xl py-24 flex flex-col items-center justify-center text-center"
                        >
                            <ChartBarIcon className="w-20 h-20 text-white/10 mb-6" />
                            <h2 className="text-2xl font-black text-white/50 mb-3 uppercase tracking-widest">Sin Historial Aún</h2>
                            <p className="text-white/30 text-sm max-w-md px-4 leading-relaxed font-bold">
                                Aún no has finalizado tu primera temporada completa. Al concluir la temporada 1, todas tus estadísticas, posiciones y galardones quedarán inmortalizados aquí.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {seasonHistory.map((rec) => (
                                <motion.div
                                    key={rec.season}
                                    variants={itemVariants}
                                    className="apex-card p-6 rounded-2xl border border-white/10 hover:border-[var(--apex-gold)]/40 transition-all duration-300"
                                >
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/10 pb-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 flex items-center justify-center text-xl font-black text-[var(--apex-gold)] font-mono shadow-inner">
                                                S.{rec.season}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{rec.leagueName}</h3>
                                                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                                                        rec.finalPosition === 1
                                                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                                                            : rec.finalPosition <= 4
                                                            ? 'bg-blue-400/20 text-blue-300 border-blue-400/40'
                                                            : 'bg-white/10 text-white/60 border-white/10'
                                                    }`}>
                                                        {rec.finalPosition === 1 ? '🥇 Campeón' : `${rec.finalPosition}º Puesto`}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/40 font-bold">
                                                    {rec.points} pts | {rec.wins}V - {rec.draws}E - {rec.losses}D ({rec.goalsFor} GF / {rec.goalsAgainst} GC)
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-xs font-black">
                                            <div className="bg-black/40 px-3.5 py-2 rounded-xl border border-white/5">
                                                <span className="text-white/40 uppercase tracking-widest text-[9px] block">Campeón Liga:</span>
                                                <span className="text-white">{rec.championTeamName}</span>
                                            </div>
                                            {rec.cupWinnerName && (
                                                <div className="bg-black/40 px-3.5 py-2 rounded-xl border border-white/5">
                                                    <span className="text-white/40 uppercase tracking-widest text-[9px] block">Copa Nacional:</span>
                                                    <span className="text-slate-300">{rec.cupWinnerName}</span>
                                                </div>
                                            )}
                                            <div className="bg-black/40 px-3.5 py-2 rounded-xl border border-white/5">
                                                <span className="text-white/40 uppercase tracking-widest text-[9px] block">Balance Cierre:</span>
                                                <span className="text-emerald-400 font-mono">€{rec.endBalance.toFixed(1)}M</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Awards & Highlights */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                            <span className="text-lg">🥇</span>
                                            <div>
                                                <span className="text-[9px] font-black uppercase text-white/40 block">Balón de Oro:</span>
                                                <span className="text-white font-bold">{rec.ballonDorWinner || 'No registrado'}</span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                            <span className="text-lg">⚽</span>
                                            <div>
                                                <span className="text-[9px] font-black uppercase text-white/40 block">Máximo Goleador:</span>
                                                <span className="text-white font-bold">{rec.topScorerName || 'No registrado'}</span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                            <span className="text-lg">🏆</span>
                                            <div>
                                                <span className="text-[9px] font-black uppercase text-white/40 block">Títulos de la Temporada:</span>
                                                <span className="text-[var(--apex-gold)] font-bold">
                                                    {rec.trophiesWon && rec.trophiesWon.length > 0 
                                                        ? rec.trophiesWon.map(t => t.name).join(', ') 
                                                        : 'Ninguno'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};
