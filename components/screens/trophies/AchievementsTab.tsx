import React, { useState, useMemo } from 'react';
import { GameState, Achievement, AchievementCategory } from '../../../types';
import { Trophy, Crown, Globe, ShieldCheck, Zap, Coins, Building2, Vote, Sparkles, Star, ArrowRightLeft, Target, Shield, Flame, Medal, Award, CheckCircle2, Lock } from 'lucide-react';
import { CATEGORY_THEMES } from './trophiesUiTypes';

interface AchievementsTabProps {
    gameState: GameState;
}

const getAchievementIcon = (id: string, category: AchievementCategory) => {
    switch (id) {
        case 'first_trophy': return <Trophy className="w-5 h-5" />;
        case 'cup_king': return <Crown className="w-5 h-5" />;
        case 'continental_glory': return <Globe className="w-5 h-5" />;
        case 'world_champion': return <ShieldCheck className="w-5 h-5" />;
        case 'the_treble': return <Zap className="w-5 h-5" />;
        case 'tycoon': return <Coins className="w-5 h-5" />;
        case 'stadium_expansion': return <Building2 className="w-5 h-5" />;
        case 're_election': return <Vote className="w-5 h-5" />;
        case 'wonderkid_academy': return <Sparkles className="w-5 h-5" />;
        case 'galactic_signing': return <Star className="w-5 h-5" />;
        case 'big_sale': return <ArrowRightLeft className="w-5 h-5" />;
        case 'master_scout': return <Target className="w-5 h-5" />;
        case 'clean_sheet': return <Shield className="w-5 h-5" />;
        case 'historic_rout': return <Flame className="w-5 h-5" />;
        case 'individual_glory': return <Medal className="w-5 h-5" />;
        default:
            if (category === 'trophies') return <Trophy className="w-5 h-5" />;
            if (category === 'management') return <Building2 className="w-5 h-5" />;
            if (category === 'transfers') return <ArrowRightLeft className="w-5 h-5" />;
            return <Award className="w-5 h-5" />;
    }
};

export const AchievementsTab: React.FC<AchievementsTabProps> = ({ gameState }) => {
    const achievements: Achievement[] = gameState.achievements || [];
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL');

    const unlockedCount = useMemo(() => achievements.filter(a => a.isUnlocked).length, [achievements]);
    const totalCount = achievements.length || 15;
    const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    const filteredAchievements = useMemo(() => {
        if (selectedCategory === 'ALL') return achievements;
        return achievements.filter(a => a.category === selectedCategory);
    }, [achievements, selectedCategory]);

    const categoryKeys: Array<AchievementCategory | 'ALL'> = ['ALL', 'trophies', 'management', 'transfers', 'special'];

    return (
        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1 animate-fade-in">
            {/* Header Completion Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-amber-500/10 via-amber-400/5 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md shrink-0">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                    Logros Presidenciales & Desafíos
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                    {completionPercentage}%
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Metas institucionales, deportivas y económicas alcanzadas a lo largo de tu carrera.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto bg-black/60 px-4 py-2 rounded-xl border border-white/10">
                        <div className="text-right">
                            <div className="text-xl font-black font-mono text-white leading-none">
                                <span className="text-amber-400">{unlockedCount}</span>
                                <span className="text-slate-500 text-sm font-normal"> / {totalCount}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block mt-0.5">
                                Completados
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Progress Bar */}
                <div className="mt-4 w-full bg-black/50 h-2.5 rounded-full overflow-hidden border border-white/10 relative">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow-sm shadow-amber-400/50"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
            </div>

            {/* Filter Tabs Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {categoryKeys.map(catKey => {
                    const isSelected = selectedCategory === catKey;
                    const count = catKey === 'ALL'
                        ? achievements.length
                        : achievements.filter(a => a.category === catKey).length;

                    const label = catKey === 'ALL' ? 'Todos los Logros' : CATEGORY_THEMES[catKey].label;
                    const theme = catKey !== 'ALL' ? CATEGORY_THEMES[catKey] : null;

                    return (
                        <button
                            key={catKey}
                            onClick={() => setSelectedCategory(catKey)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border ${
                                isSelected
                                    ? catKey === 'ALL'
                                        ? 'bg-[var(--apex-gold)] text-black border-[var(--apex-gold)] font-black shadow-md'
                                        : `${theme?.badge} border-current font-black shadow-md scale-[1.02]`
                                    : 'bg-black/40 text-slate-400 hover:text-white border-white/5 hover:border-white/15'
                            }`}
                        >
                            <span>{label}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                isSelected ? (catKey === 'ALL' ? 'bg-black/20 text-black' : 'bg-black/30') : 'bg-white/5'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Achievements Grid: Premium Cards with Correct Styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredAchievements.map(achievement => {
                    const isUnlocked = achievement.isUnlocked;
                    const theme = CATEGORY_THEMES[achievement.category] || CATEGORY_THEMES.trophies;

                    return (
                        <div
                            key={achievement.id}
                            className={`p-4 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden backdrop-blur-sm ${
                                isUnlocked
                                    ? `bg-gradient-to-br ${theme.bgGradient} ${theme.border} shadow-lg shadow-black/40`
                                    : 'bg-slate-950/40 border-white/5 opacity-70 hover:opacity-90'
                            }`}
                        >
                            {/* Decorative ambient light when unlocked */}
                            {isUnlocked && (
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                            )}

                            <div>
                                <div className="flex items-start justify-between gap-3 mb-2.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                            isUnlocked
                                                ? `${theme.badge} shadow-sm`
                                                : 'bg-white/5 border-white/10 text-slate-500'
                                        }`}>
                                            {getAchievementIcon(achievement.id, achievement.category)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-black text-white uppercase tracking-tight leading-snug truncate">
                                                {achievement.title}
                                            </h4>
                                            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">
                                                {theme.label}
                                            </span>
                                        </div>
                                    </div>

                                    {isUnlocked ? (
                                        <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Desbloqueado</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full shrink-0">
                                            <Lock className="w-3 h-3" />
                                            <span>Bloqueado</span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs text-slate-300/90 leading-relaxed mb-3">
                                    {achievement.description}
                                </p>
                            </div>

                            {/* Progress bar for achievements with quantifiable progress */}
                            {achievement.maxProgress && achievement.maxProgress > 0 ? (
                                <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5">
                                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                        <span>Progreso</span>
                                        <span className="font-bold text-white">
                                            {achievement.progress || 0} / {achievement.maxProgress}
                                        </span>
                                    </div>
                                    <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden border border-white/10">
                                        <div
                                            className={`h-full bg-gradient-to-r ${theme.progress} rounded-full transition-all duration-500`}
                                            style={{
                                                width: `${Math.min(100, Math.round(((achievement.progress || 0) / achievement.maxProgress) * 100))}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : isUnlocked && achievement.unlockedAt ? (
                                <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
                                    <span>Conseguido:</span>
                                    <span className="font-mono text-slate-300 font-semibold">{achievement.unlockedAt}</span>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
