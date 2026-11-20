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
            {/* Overview Metrics: Resumen de la competición */}
            {teamHighlights && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full">
                    {/* Poder Ofensivo */}
                    <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl group">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 blur-[40px] rounded-full group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5" /> Mejor Ataque
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-emerald-400 italic">
                                {teamHighlights.bestAttackGoals} <span className="text-[10px] font-bold text-white/40 uppercase not-italic">Goles</span>
                            </span>
                        </div>
                        {teamHighlights.bestAttackTeam && (
                            <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                                    <TeamLogo team={teamHighlights.bestAttackTeam} className="w-full h-full object-contain drop-shadow" />
                                </div>
                                <span className="text-xs sm:text-sm font-black text-white truncate">
                                    {teamHighlights.bestAttackTeam.name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Muro Defensivo */}
                    <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl group">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/10 blur-[40px] rounded-full group-hover:bg-sky-500/20 transition-all pointer-events-none" />
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" /> Mejor Defensa
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-sky-400 italic">
                                {teamHighlights.bestDefenseGoals} <span className="text-[10px] font-bold text-white/40 uppercase not-italic">Goles Rec.</span>
                            </span>
                        </div>
                        {teamHighlights.bestDefenseTeam && (
                            <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                                    <TeamLogo team={teamHighlights.bestDefenseTeam} className="w-full h-full object-contain drop-shadow" />
                                </div>
                                <span className="text-xs sm:text-sm font-black text-white truncate">
                                    {teamHighlights.bestDefenseTeam.name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Promedio Global del Torneo */}
                    <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl group">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-[var(--apex-gold)]/10 blur-[40px] rounded-full group-hover:bg-[var(--apex-gold)]/20 transition-all pointer-events-none" />
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-[var(--apex-gold)] uppercase tracking-wider flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" /> Promedio de Gol
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-[var(--apex-gold)] italic">
                                {teamHighlights.avgGoals} <span className="text-[10px] font-bold text-white/40 uppercase not-italic">Goles/PJ</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                            <span>{teamHighlights.totalGoals} goles en total</span>
                            <span className="font-mono">{teamHighlights.totalMatchesPlayed} partidos disputados</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Cup Status Banner if applicable */}
            {cupInfo && (
                <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                    <div className="flex items-center gap-2.5">
                        <Trophy className="w-4 h-4 text-[var(--apex-gold)]" />
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estado de la Copa</span>
                            <span className="text-xs sm:text-sm font-black text-white">{cupInfo.phaseName}</span>
                        </div>
                    </div>
                    {cupInfo.lastChampionName && (
                        <div className="flex items-center gap-2.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                            {cupInfo.lastChampionTeam && (
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <TeamLogo team={cupInfo.lastChampionTeam} className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div className="text-left">
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
