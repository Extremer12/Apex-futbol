import React from 'react';
import { Team } from '../../../types';
import { TeamLogo } from '../../../data/teams/helpers';
import { Briefcase, ChevronRight, Pencil } from 'lucide-react';
import { StatCell } from '../transfers/TransferUI';

interface ProfileHeroCardProps {
    fullName: string;
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
    stylePerkSummary: string;
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
    onOpenEditModal: () => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = React.memo(({
    fullName,
    profilePhoto,
    nationality,
    age,
    currentLevelInfo,
    selectedStyle,
    stylePerkSummary,
    team,
    mandateTotal,
    mandateYear,
    careerStats,
    onOpenStyleModal,
    onOpenEditModal
}) => {
    const isMaxLevel = currentLevelInfo.nextLevelXp <= currentLevelInfo.currentXp && currentLevelInfo.progress === 100;

    return (
        <div className="apex-card p-4 sm:p-6 rounded-2xl space-y-5 border-[var(--apex-gold)]/25">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                {/* President Identity */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0 w-full">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#0D1220] border-2 border-[var(--apex-gold)]/50 p-1 flex items-center justify-center overflow-hidden">
                            {profilePhoto ? (
                                <img
                                    src={profilePhoto}
                                    alt={fullName}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="w-full h-full rounded-xl bg-slate-900 flex flex-col items-center justify-center text-[var(--apex-gold)]">
                                    <Briefcase className="w-7 h-7 mb-0.5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">PRES</span>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-[var(--apex-gold)] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200 shadow-md tabular-nums">
                            Nv. {currentLevelInfo.level}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2.5 py-0.5 rounded-full border border-[var(--apex-gold)]/30">
                                {currentLevelInfo.title}
                            </span>
                            <button
                                type="button"
                                onClick={onOpenStyleModal}
                                className="text-[10px] font-bold uppercase tracking-wider text-slate-200 bg-white/5 hover:bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <span>Estilo: {selectedStyle}</span>
                                <ChevronRight className="w-3 h-3 text-[var(--apex-gold)]" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                                {fullName}
                            </h1>
                            <button
                                type="button"
                                onClick={onOpenEditModal}
                                title="Editar perfil"
                                aria-label="Editar perfil"
                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[var(--apex-gold)] transition-colors shrink-0 cursor-pointer"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 flex-wrap">
                            <span>{nationality}</span>
                            {age && (
                                <>
                                    <span>·</span>
                                    <span>{age} años</span>
                                </>
                            )}
                            <span>·</span>
                            <span className="text-slate-300 font-medium">{stylePerkSummary}</span>
                        </p>

                        {/* XP Progress Bar */}
                        <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-slate-400">Experiencia Dirigencial</span>
                                <span className="text-[var(--apex-gold)] tabular-nums">
                                    {isMaxLevel
                                        ? `${currentLevelInfo.currentXp.toLocaleString()} XP (Máx)`
                                        : `${currentLevelInfo.currentXp.toLocaleString()} / ${currentLevelInfo.nextLevelXp.toLocaleString()} XP`}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-[var(--apex-gold-light)] rounded-full transition-all duration-500"
                                    style={{ width: `${currentLevelInfo.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Club Official Credential Badge */}
                <div className="shrink-0 w-full lg:w-auto flex items-center gap-3 bg-[#0D1220] border border-white/10 rounded-2xl p-3.5">
                    <div className="w-11 h-11 shrink-0 flex items-center justify-center p-1.5 bg-black/40 rounded-xl border border-white/10">
                        <TeamLogo team={team} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] text-[var(--apex-gold)] font-black uppercase tracking-wider">Club Actual</span>
                        </div>
                        <div className="text-sm font-black text-white truncate max-w-[210px]">
                            {team.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 tabular-nums">
                            Mandato #{mandateTotal} · Año {mandateYear} de 4
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Career Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10">
                <StatCell label="Partidos" value={careerStats.totalMatches} />
                <StatCell label="Efectividad" value={`${careerStats.winRate}%`} accent="text-emerald-400" />
                <StatCell label="Títulos" value={careerStats.trophiesCount} accent="text-[var(--apex-gold)]" />
                <StatCell label="Mandatos" value={`#${mandateTotal}`} />
            </div>
        </div>
    );
});
