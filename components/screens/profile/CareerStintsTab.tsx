import React from 'react';
import { Team, PresidentialStint } from '../../../types';
import { TeamLogo } from '../../../data/teams/helpers';
import { Building2 } from 'lucide-react';
import { StatCell, EmptyState } from '../transfers/TransferUI';

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

const STINT_STATUS_LABEL: Record<PresidentialStint['status'], { label: string; style: string }> = {
    ACTIVE: { label: 'En ejercicio', style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    REELECTED: { label: 'Reelegido', style: 'bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border-[var(--apex-gold)]/30' },
    RESIGNED: { label: 'Fin de ciclo', style: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
    DEFEATED: { label: 'No reelecto', style: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
    SACKED: { label: 'Destituido', style: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

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
            <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
                    <Building2 className="w-4 h-4 text-[var(--apex-gold)]" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Historial de Clubes Presididos</h3>
                </div>

                {/* Current Club Stint */}
                <div className="p-4 rounded-2xl border border-[var(--apex-gold)]/35 bg-[var(--apex-gold)]/5 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/10 p-1.5 flex items-center justify-center shrink-0">
                            <TeamLogo team={team} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm sm:text-base font-black text-white truncate">{team.name}</h4>
                                <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    En ejercicio
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                                Temporada actual: {season} · Mandato #{mandateTotal}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <StatCell label="Efectividad" value={`${careerStats.winRate}%`} accent="text-emerald-400" />
                        <StatCell label="Títulos" value={careerStats.trophiesCount} accent="text-[var(--apex-gold)]" />
                        <StatCell label="Socios" value={`${fanApprovalRating}%`} />
                    </div>
                </div>

                {/* Past Stints */}
                {pastStints && pastStints.length > 0 ? (
                    <div className="space-y-2.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Etapas anteriores</span>
                        {pastStints.map((stint, idx) => {
                            const statusMeta = STINT_STATUS_LABEL[stint.status] || STINT_STATUS_LABEL.RESIGNED;
                            return (
                                <div key={`${stint.clubId}_${idx}`} className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h5 className="text-sm font-black text-white truncate">{stint.clubName}</h5>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.style}`}>
                                                {statusMeta.label}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-slate-400 block mt-0.5">
                                            T.{stint.startSeason} – T.{stint.endSeason || stint.startSeason} · {stint.totalMatches} PJ ({stint.winPercentage}% ef.) · {stint.trophiesWon.length} títulos
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        icon={<Building2 className="w-6 h-6" />}
                        title="Trayectoria en curso"
                        text="Al asumir la presidencia de otra institución en la pestaña Elecciones, tus etapas anteriores quedarán archivadas aquí."
                    />
                )}
            </div>
        </div>
    );
});
