import React, { useState, useMemo } from 'react';
import { GameState, Achievement, AchievementCategory } from '../../../types';
import {
    Trophy,
    Crown,
    Globe,
    ShieldCheck,
    Zap,
    Coins,
    Building2,
    Vote,
    TrendingUp,
    Star,
    ArrowRightLeft,
    Target,
    Shield,
    Flame,
    Medal,
    Award,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { CATEGORY_THEMES } from './trophiesUiTypes';

interface AchievementsTabProps {
    gameState: GameState;
}

const getAchievementIcon = (id: string, category: AchievementCategory) => {
    switch (id) {
        case 'first_trophy': return <Trophy className="w-4 h-4" />;
        case 'cup_king': return <Crown className="w-4 h-4" />;
        case 'continental_glory': return <Globe className="w-4 h-4" />;
        case 'world_champion': return <ShieldCheck className="w-4 h-4" />;
        case 'the_treble': return <Zap className="w-4 h-4" />;
        case 'tycoon': return <Coins className="w-4 h-4" />;
        case 'stadium_expansion': return <Building2 className="w-4 h-4" />;
        case 're_election': return <Vote className="w-4 h-4" />;
        case 'wonderkid_academy': return <TrendingUp className="w-4 h-4" />;
        case 'galactic_signing': return <Star className="w-4 h-4" />;
        case 'big_sale': return <ArrowRightLeft className="w-4 h-4" />;
        case 'master_scout': return <Target className="w-4 h-4" />;
        case 'clean_sheet': return <Shield className="w-4 h-4" />;
        case 'historic_rout': return <Flame className="w-4 h-4" />;
        case 'individual_glory': return <Medal className="w-4 h-4" />;
        default:
            if (category === 'trophies') return <Trophy className="w-4 h-4" />;
            if (category === 'management') return <Building2 className="w-4 h-4" />;
            if (category === 'transfers') return <ArrowRightLeft className="w-4 h-4" />;
            return <Award className="w-4 h-4" />;
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
        <div className="space-y-4">
            {/* Completion Summary Card */}
            <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/30 flex items-center justify-center text-[var(--apex-gold)] shrink-0">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-black text-white truncate">Logros de Carrera</h3>
                            <p className="text-[11px] text-slate-400 truncate">
                                {unlockedCount} de {totalCount} desafíos completados
                            </p>
                        </div>
                    </div>
                    <span className="text-lg font-black text-[var(--apex-gold)] tabular-nums shrink-0">
                        {completionPercentage}%
                    </span>
                </div>

                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--apex-gold)] rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {categoryKeys.map(catKey => {
                    const isSelected = selectedCategory === catKey;
                    const count = catKey === 'ALL'
                        ? achievements.length
                        : achievements.filter(a => a.category === catKey).length;
                    const label = catKey === 'ALL' ? 'Todos' : CATEGORY_THEMES[catKey].label;

                    return (
                        <button
                            key={catKey}
                            onClick={() => setSelectedCategory(catKey)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                                isSelected
                                    ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                    : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                        >
                            {label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAchievements.map(achievement => {
                    const isUnlocked = achievement.isUnlocked;
                    const theme = CATEGORY_THEMES[achievement.category] || CATEGORY_THEMES.trophies;

                    return (
                        <div
                            key={achievement.id}
                            className={`apex-card p-4 rounded-2xl flex flex-col justify-between transition-colors ${
                                isUnlocked ? `${theme.border}` : 'opacity-70'
                            }`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                            isUnlocked ? theme.badge : 'bg-white/5 border-white/10 text-slate-500'
                                        }`}>
                                            {getAchievementIcon(achievement.id, achievement.category)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-black text-white truncate">{achievement.title}</h4>
                                            <span className="text-[10px] font-semibold text-slate-400 block">{theme.label}</span>
                                        </div>
                                    </div>

                                    {isUnlocked ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    ) : (
                                        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    )}
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                                    {achievement.description}
                                </p>
                            </div>

                            {achievement.maxProgress && achievement.maxProgress > 0 ? (
                                <div className="pt-2 border-t border-white/5 space-y-1">
                                    <div className="flex justify-between text-[10px] text-slate-400">
                                        <span>Progreso</span>
                                        <span className="font-bold text-white tabular-nums">
                                            {achievement.progress || 0}/{achievement.maxProgress}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${theme.progress} rounded-full`}
                                            style={{
                                                width: `${Math.min(100, Math.round(((achievement.progress || 0) / achievement.maxProgress) * 100))}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : isUnlocked && achievement.unlockedAt ? (
                                <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
                                    <span>Conseguido</span>
                                    <span className="text-slate-300 font-semibold">{achievement.unlockedAt}</span>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
