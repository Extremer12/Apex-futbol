import React from 'react';
import { Flame, Shield, Activity, Trophy } from 'lucide-react';
import { TeamLogo } from '../../../data/teams/helpers';
import { TeamHighlights, CupInfo } from './types';

interface TournamentOverviewCardsProps {
    teamHighlights: TeamHighlights | null;
    cupInfo: CupInfo | null;
}

export const TournamentOverviewCards: React.FC<TournamentOverviewCardsProps> = React.memo(({
    teamHighlights,
    cupInfo,
}) => {
    return (
        <>
            {teamHighlights && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                    <div className="apex-card p-4 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5" /> Mejor Ataque
                            </span>
                            <span className="text-lg font-black text-emerald-400 tabular-nums">
                                {teamHighlights.bestAttackGoals} <span className="text-[10px] font-bold text-slate-400 uppercase">goles</span>
                            </span>
                        </div>
                        {teamHighlights.bestAttackTeam && (
                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                    <TeamLogo team={teamHighlights.bestAttackTeam} className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xs font-black text-white truncate">
                                    {teamHighlights.bestAttackTeam.name}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="apex-card p-4 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" /> Mejor Defensa
                            </span>
                            <span className="text-lg font-black text-sky-400 tabular-nums">
                                {teamHighlights.bestDefenseGoals} <span className="text-[10px] font-bold text-slate-400 uppercase">en contra</span>
                            </span>
                        </div>
                        {teamHighlights.bestDefenseTeam && (
                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                    <TeamLogo team={teamHighlights.bestDefenseTeam} className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xs font-black text-white truncate">
                                    {teamHighlights.bestDefenseTeam.name}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="apex-card p-4 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[var(--apex-gold)] uppercase tracking-wider flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" /> Promedio
                            </span>
                            <span className="text-lg font-black text-[var(--apex-gold)] tabular-nums">
                                {teamHighlights.avgGoals} <span className="text-[10px] font-bold text-slate-400 uppercase">goles/PJ</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                            <span>{teamHighlights.totalGoals} goles</span>
                            <span className="tabular-nums">{teamHighlights.totalMatchesPlayed} partidos</span>
                        </div>
                    </div>
                </div>
            )}

            {cupInfo && (
                <div className="apex-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <Trophy className="w-4 h-4 text-[var(--apex-gold)]" />
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estado de la Copa</span>
                            <span className="text-sm font-black text-white">{cupInfo.phaseName}</span>
                        </div>
                    </div>
                    {cupInfo.lastChampionName && (
                        <div className="flex items-center gap-2.5 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5">
                            {cupInfo.lastChampionTeam && (
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <TeamLogo team={cupInfo.lastChampionTeam} className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div>
                                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">Campeón Vigente</span>
                                <span className="text-xs font-black text-white">{cupInfo.lastChampionName}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
});
