import React from 'react';
import { Team, PresidentialStint } from '../../../types';
import { TeamLogo } from '../../../data/teams/helpers';
import { Building2 } from 'lucide-react';

interface CareerStintsTabProps {
    team: Team;
    season: number;
    mandateTotal: number;
    careerStats: {
        winRate: number;
        trophiesCount: number;
    };
    fanApprovalRating: number;
    pastStints?: PresidentialStint[];
}

export const CareerStintsTab: React.FC<CareerStintsTabProps> = React.memo(({
    team,
    season,
    mandateTotal,
    careerStats,
    fanApprovalRating,
    pastStints
}) => {
    return (
        <div className="space-y-4">
            <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Historial de Clubes Presididos</h3>
                </div>

                {/* Current Club Stint */}
                <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black/40 p-1 flex items-center justify-center">
                                <TeamLogo team={team} className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-base font-black text-white uppercase">{team.name}</h4>
                                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/40">
                                        En Ejercicio
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400">
                                    Desde Temp. 1 • Temporada actual: {season} (Mandato #{mandateTotal})
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                        <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Efectividad</span>
                            <span className="text-sm font-black text-emerald-400">{careerStats.winRate}%</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Títulos</span>
                            <span className="text-sm font-black text-amber-400">{careerStats.trophiesCount}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Socios</span>
                            <span className="text-sm font-black text-white">{fanApprovalRating}%</span>
                        </div>
                    </div>
                </div>

                {/* Past Stints */}
                {pastStints && pastStints.length > 0 && (
                    <div className="space-y-2">
                        {pastStints.map((stint, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div>
                                    <h5 className="text-sm font-bold text-white">{stint.clubName}</h5>
                                    <span className="text-[10px] text-slate-400">
                                        Temp. {stint.startSeason} - {stint.endSeason || stint.startSeason} • {stint.mandatesCompleted} Mandatos • {stint.trophiesWon.length} Títulos
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded">
                                    {stint.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
