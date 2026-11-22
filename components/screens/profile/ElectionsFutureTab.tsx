import React from 'react';
import { Team } from '../../../types';
import { TeamLogo } from '../../../data/teams/helpers';
import { formatCurrency } from '../../../utils';
import { Vote, Building2 } from 'lucide-react';

interface ElectionsFutureTabProps {
    team: Team;
    mandateYear: number;
    isElectionYear: boolean;
    fanApprovalRating: number;
    currentLevel: number;
    prospectiveClubs: Team[];
}

export const ElectionsFutureTab: React.FC<ElectionsFutureTabProps> = React.memo(({
    team,
    mandateYear,
    isElectionYear,
    fanApprovalRating,
    currentLevel,
    prospectiveClubs
}) => {
    return (
        <div className="space-y-4">
            {/* Election Status Banner */}
            <div className={`p-5 rounded-2xl border shadow-lg ${
                isElectionYear
                    ? 'bg-gradient-to-r from-red-950/40 via-slate-900 to-black border-red-500/50'
                    : 'bg-[#0B0F19] border-white/10'
            }`}>
                <div className="flex items-center gap-3 mb-2">
                    <Vote className={`w-6 h-6 ${isElectionYear ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                    <div>
                        <h3 className="text-base font-black text-white uppercase tracking-wider">
                            {isElectionYear ? '¡Año de Comicios Electorales!' : 'Ciclo Electoral Presidencial'}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {isElectionYear
                                ? 'Has completado los 4 años de gestión reglamentarios. Los socios votarán en los comicios al cierre de la temporada.'
                                : `Año ${mandateYear} de 4. Faltan ${4 - mandateYear} temporada(s) para las próximas elecciones.`}
                        </p>
                    </div>
                </div>

                {/* Projection */}
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 mt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">Intención de Voto Estimada:</span>
                        <span className={`text-base font-black ${
                            fanApprovalRating >= 60 ? 'text-emerald-400' : fanApprovalRating >= 45 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                            {fanApprovalRating}% de los votos
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${
                                fanApprovalRating >= 60 ? 'bg-emerald-500' : fanApprovalRating >= 45 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${fanApprovalRating}%` }}
                        />
                    </div>
                    <p className="text-[11px] text-slate-400">
                        {fanApprovalRating >= 65
                            ? 'Los socios avalan tu gestión. Tienes el camino allanado para renovar tu mandato.'
                            : fanApprovalRating >= 45
                            ? 'Elección reñida: la oposición presiona. Un título o buen cierre económico inclinará la balanza.'
                            : 'Situación crítica: corres serio peligro de perder las elecciones frente a la lista opositora.'}
                    </p>
                </div>
            </div>

            {/* Prospective Clubs looking for a President */}
            <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-amber-400" />
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                            Oportunidades en Otros Clubes
                        </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                        Mercado de Presidencias
                    </span>
                </div>

                <p className="text-xs text-slate-400">
                    Si decides no renovar o culminar tu ciclo en {team.name}, puedes postularte a las elecciones de otras instituciones afines a tu reputación (Nivel {currentLevel}).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {prospectiveClubs.map((club) => (
                        <div
                            key={club.id}
                            className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-amber-400/40 transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-black/40 p-1 flex items-center justify-center">
                                    <TeamLogo team={club} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-white uppercase">{club.name}</h5>
                                    <span className="text-[10px] text-slate-400">
                                        Presupuesto: {formatCurrency(club.budget)} • Nivel Requerido: {club.tier === 'Top' ? 'Nv. 4+' : 'Nv. 2+'}
                                    </span>
                                </div>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-white/5 text-slate-400 px-2 py-1 rounded">
                                Elecciones Próximas
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});
