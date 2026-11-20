import React from 'react';
import { Team } from '../../../types';
import { TeamLogo } from '../../../data/teams/helpers';
import { Landmark, Briefcase, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileHeroCardProps {
    fullName: string;
    firstName?: string;
    lastName?: string;
    profilePhoto?: string;
    nationality: string;
    age?: number;
    currentLevelInfo: {
        level: number;
        title: string;
        desc: string;
        currentXp: number;
        nextLevelXp: number;
        progress: number;
    };
    selectedStyle: string;
    team: Team;
    mandateTotal: number;
    mandateYear: number;
    careerStats: {
        totalMatches: number;
        totalWins: number;
        totalDraws: number;
        totalLosses: number;
        winRate: number;
        trophiesCount: number;
    };
    onOpenStyleModal: () => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = React.memo(({
    fullName,
    firstName,
    lastName,
    profilePhoto,
    nationality,
    age,
    currentLevelInfo,
    selectedStyle,
    team,
    mandateTotal,
    mandateYear,
    careerStats,
    onOpenStyleModal
}) => {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101726] via-[#0B0F19] to-black border border-amber-500/30 p-5 sm:p-7 shadow-2xl">
            <div className="absolute -right-8 -bottom-8 w-56 h-56 opacity-5 pointer-events-none text-amber-400">
                <Landmark className="w-full h-full" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* President Identity */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-600/10 border-2 border-amber-400/60 p-1 flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.25)] overflow-hidden">
                            {profilePhoto ? (
                                <img 
                                    src={profilePhoto} 
                                    alt={fullName} 
                                    className="w-full h-full object-cover rounded-xl" 
                                />
                            ) : (
                                <div className="w-full h-full rounded-xl bg-slate-900/90 flex flex-col items-center justify-center text-amber-400">
                                    <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 mb-1" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/70">PRES</span>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300 shadow-md">
                            Nv. {currentLevelInfo.level}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                                {currentLevelInfo.title}
                            </span>
                            <button
                                onClick={onOpenStyleModal}
                                className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1 transition-all cursor-pointer"
                            >
                                <span>Estilo: {selectedStyle}</span>
                                <ChevronRight className="w-3 h-3 text-amber-400" />
                            </button>
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                                    {fullName}
                                </h1>
                                {firstName && lastName && (
                                    <span className="text-[10px] font-black text-amber-300/90 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                        {firstName} {lastName}
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-1 flex-wrap">
                            <span>Nacionalidad: {nationality}</span>
                            {age && (
                                <>
                                    <span>•</span>
                                    <span>{age} años</span>
                                </>
                            )}
                            <span>•</span>
                            <span className="text-amber-300/80 font-semibold">{currentLevelInfo.desc}</span>
                        </p>

                        {/* XP Progress Bar */}
                        <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-slate-400">Experiencia Dirigencial</span>
                                <span className="text-amber-400">{currentLevelInfo.currentXp} / {currentLevelInfo.nextLevelXp} XP</span>
                            </div>
                            <div className="w-full h-2 bg-black/50 rounded-full border border-white/10 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${currentLevelInfo.progress}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-200 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Club Official Credential Badge */}
                <div className="shrink-0 w-full lg:w-auto flex items-center gap-3.5 bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-black/40 border border-amber-500/30 rounded-2xl p-3.5 px-4 shadow-xl backdrop-blur-md">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center p-1 bg-black/40 rounded-xl border border-white/10 shadow-inner">
                        <TeamLogo team={team} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">Club Actual</span>
                        </div>
                        <div className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate max-w-[200px]">
                            {team.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-300">Mandato #{mandateTotal}</span>
                            <span>•</span>
                            <span>Año {mandateYear} de 4</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Career Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-5 border-t border-white/10">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Partidos</span>
                    <span className="text-lg font-black text-white">{careerStats.totalMatches}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Efectividad</span>
                    <span className="text-lg font-black text-emerald-400">{careerStats.winRate}%</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Títulos</span>
                    <span className="text-lg font-black text-amber-400">{careerStats.trophiesCount}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Mandatos</span>
                    <span className="text-lg font-black text-white">#{mandateTotal}</span>
                </div>
            </div>
        </div>
    );
});
