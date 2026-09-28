import React from 'react';
import { Coach } from '../../../types';
import { formatCurrency } from '../../../utils';
import { Award, UserMinus, UserPlus } from 'lucide-react';
import { ModalFireState, ModalHireState, getPowerBadgeClass } from './staffUiTypes';

interface StaffCoachTabProps {
    coach?: Coach;
    availableCoaches: Coach[];
    coachEffect: { lineRatingBonus: number; description: string };
    onOpenFireModal: (modal: ModalFireState) => void;
    onOpenHireModal: (modal: ModalHireState) => void;
}

export const StaffCoachTab: React.FC<StaffCoachTabProps> = React.memo(({
    coach,
    availableCoaches,
    coachEffect,
    onOpenFireModal,
    onOpenHireModal
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Active DT Profile Card */}
            <div className="apex-card p-6 border border-white/10 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl font-black shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                            👔
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--apex-gold)]">
                                    Director Técnico Actual
                                </span>
                                {coach && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-white/80">
                                        {coach.nationality} • {coach.age} años
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-white">
                                {coach ? coach.name : 'Puesto Vacante (Sin DT)'}
                            </h2>
                            <p className="text-xs text-white/60 mt-1 max-w-xl">
                                {coachEffect.description}
                            </p>
                        </div>
                    </div>

                    {coach ? (
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="text-right pr-4 border-r border-white/10">
                                <div className="text-[10px] text-white/40 font-bold uppercase">Poder Táctico</div>
                                <div className={`text-2xl font-black ${getPowerBadgeClass(coach.prestige)} px-3 py-0.5 rounded-xl border`}>
                                    {coach.prestige}
                                </div>
                            </div>

                            <button
                                onClick={() => onOpenFireModal({
                                    type: 'coach',
                                    member: coach,
                                    severanceCost: coach.salary * 4
                                })}
                                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all"
                            >
                                <UserMinus className="w-4 h-4" />
                                <span>Rescindir Contrato</span>
                            </button>
                        </div>
                    ) : (
                        <div className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                            ¡Atención! Contrata un DT para eliminar la penalización táctica.
                        </div>
                    )}
                </div>

                {/* Coach Metrics Grid */}
                {coach && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                            <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Filosofía Táctica</span>
                            <span className="text-sm font-black text-white uppercase">{coach.style}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                            <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Formación Predilecta</span>
                            <span className="text-sm font-black text-[var(--apex-gold)]">{coach.preferredFormation}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                            <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Bono a Líneas</span>
                            <span className="text-sm font-black text-emerald-400">
                                {coachEffect.lineRatingBonus >= 0 ? `+${coachEffect.lineRatingBonus}` : coachEffect.lineRatingBonus} Puntos
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                            <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Honorarios Semanales</span>
                            <span className="text-sm font-black text-white">{formatCurrency(coach.salary)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Coach Market Candidates */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-[var(--apex-gold)]" />
                            Mercado de Entrenadores Libres
                        </h3>
                        <p className="text-xs text-white/50">Candidatos disponibles para asumir la conducción táctica del primer equipo.</p>
                    </div>
                </div>

                {availableCoaches.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-white/5 border border-dashed border-white/10 text-white/40 text-xs">
                        No hay directores técnicos libres en el mercado en este momento.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableCoaches.map(cand => (
                            <div key={cand.id} className="apex-card p-5 border border-white/10 flex flex-col justify-between group hover:border-[var(--apex-gold)]/40 transition-all">
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div>
                                            <span className="text-[9px] font-bold text-white/40 uppercase">{cand.nationality} • {cand.age} años</span>
                                            <h4 className="text-base font-black text-white tracking-tight">{cand.name}</h4>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-xl border text-xs font-black ${getPowerBadgeClass(cand.prestige)}`}>
                                            {cand.prestige} PTS
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs mb-4">
                                        <div className="flex justify-between text-white/60">
                                            <span>Estilo:</span>
                                            <span className="font-bold text-white uppercase">{cand.style}</span>
                                        </div>
                                        <div className="flex justify-between text-white/60">
                                            <span>Formación:</span>
                                            <span className="font-bold text-[var(--apex-gold)]">{cand.preferredFormation}</span>
                                        </div>
                                        <div className="flex justify-between text-white/60">
                                            <span>Sueldo:</span>
                                            <span className="font-bold text-white">{formatCurrency(cand.salary)}/sem</span>
                                        </div>
                                        <div className="flex justify-between text-white/60">
                                            <span>Prima de Fichaje:</span>
                                            <span className="font-black text-amber-400">{formatCurrency(cand.signingBonus)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onOpenHireModal({
                                        type: 'coach',
                                        candidate: cand,
                                        currentHolder: coach
                                    })}
                                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Contratar DT</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
