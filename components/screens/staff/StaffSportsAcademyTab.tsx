import React from 'react';
import { StaffMember } from '../../../types';
import { formatCurrency } from '../../../utils';
import { 
    Briefcase, 
    GraduationCap, 
    UserMinus 
} from 'lucide-react';
import { ModalFireState, ModalHireState, getPowerBadgeClass } from './staffUiTypes';

interface StaffSportsAcademyTabProps {
    sportingDirector?: StaffMember;
    youthCoach?: StaffMember;
    sportingEffect: { transferDiscountPct: number; description: string };
    youthEffect: { academyBonusPoints: number; description: string };
    sportingCandidates: StaffMember[];
    youthCandidates: StaffMember[];
    onOpenFireModal: (modal: ModalFireState) => void;
    onOpenHireModal: (modal: ModalHireState) => void;
}

export const StaffSportsAcademyTab: React.FC<StaffSportsAcademyTabProps> = React.memo(({
    sportingDirector,
    youthCoach,
    sportingEffect,
    youthEffect,
    sportingCandidates,
    youthCandidates,
    onOpenFireModal,
    onOpenHireModal
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sporting Director Card */}
                <div className="apex-card p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                        Director Deportivo
                                    </span>
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
                                        {sportingDirector ? sportingDirector.name : 'Vacante (Sin Director)'}
                                    </h3>
                                    <span className="text-xs text-white/50">{sportingDirector?.nationality || 'Internacional'} • {sportingDirector?.age || 48} años</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-xl border text-sm font-black ${sportingDirector ? getPowerBadgeClass(sportingDirector.power) : 'text-white/30 border-white/10 bg-white/5'}`}>
                                {sportingDirector ? `${sportingDirector.power} PTS` : 'S/D'}
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/70 mb-4 leading-relaxed">
                            {sportingEffect.description}
                        </div>

                        <div className="space-y-3 text-xs mb-6">
                            <div className="flex justify-between items-center text-white/60">
                                <span>Descuento en Fichajes:</span>
                                <span className="font-black text-emerald-400">Hasta -{sportingEffect.transferDiscountPct}%</span>
                            </div>
                            <div className="flex justify-between items-center text-white/60">
                                <span>Especialidad:</span>
                                <span className="font-bold text-white">{sportingDirector?.specialty || 'Intermediación'}</span>
                            </div>
                            <div className="flex justify-between items-center text-white/60">
                                <span>Sueldo Semanal:</span>
                                <span className="font-bold text-white">{sportingDirector ? formatCurrency(sportingDirector.salary) : '0'}</span>
                            </div>
                        </div>
                    </div>

                    {sportingDirector && (
                        <button
                            onClick={() => onOpenFireModal({
                                type: 'staff',
                                member: sportingDirector,
                                role: 'sporting_director',
                                severanceCost: sportingDirector.salary * 2
                            })}
                            className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        >
                            <UserMinus className="w-4 h-4" />
                            <span>Rescindir Director Deportivo</span>
                        </button>
                    )}
                </div>

                {/* Youth Coach Card */}
                <div className="apex-card p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                                        Director de Metodología & Cantera
                                    </span>
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
                                        {youthCoach ? youthCoach.name : 'Vacante (Sin Director)'}
                                    </h3>
                                    <span className="text-xs text-white/50">{youthCoach?.nationality || 'Internacional'} • {youthCoach?.age || 44} años</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-xl border text-sm font-black ${youthCoach ? getPowerBadgeClass(youthCoach.power) : 'text-white/30 border-white/10 bg-white/5'}`}>
                                {youthCoach ? `${youthCoach.power} PTS` : 'S/D'}
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/70 mb-4 leading-relaxed">
                            {youthEffect.description}
                        </div>

                        <div className="space-y-3 text-xs mb-6">
                            <div className="flex justify-between items-center text-white/60">
                                <span>Bono Potencial Wonderkids:</span>
                                <span className="font-black text-purple-400">+{youthEffect.academyBonusPoints} Puntos Extra</span>
                            </div>
                            <div className="flex justify-between items-center text-white/60">
                                <span>Especialidad:</span>
                                <span className="font-bold text-white">{youthCoach?.specialty || 'Formador de Joyas'}</span>
                            </div>
                            <div className="flex justify-between items-center text-white/60">
                                <span>Sueldo Semanal:</span>
                                <span className="font-bold text-white">{youthCoach ? formatCurrency(youthCoach.salary) : '0'}</span>
                            </div>
                        </div>
                    </div>

                    {youthCoach && (
                        <button
                            onClick={() => onOpenFireModal({
                                type: 'staff',
                                member: youthCoach,
                                role: 'youth_coach',
                                severanceCost: youthCoach.salary * 2
                            })}
                            className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        >
                            <UserMinus className="w-4 h-4" />
                            <span>Rescindir Director de Cantera</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Candidate Markets for Sporting Director & Youth Coach */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sporting Director Candidates */}
                <div className="space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Directores Deportivos Disponibles
                    </h4>

                    <div className="space-y-3">
                        {sportingCandidates.map(cand => (
                            <div key={cand.id} className="apex-card p-4 border border-white/10 flex items-center justify-between gap-4 hover:border-emerald-400/40 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-black text-white text-sm">{cand.name}</h5>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getPowerBadgeClass(cand.power)}`}>
                                            {cand.power} PTS
                                        </span>
                                    </div>
                                    <div className="text-xs text-white/50 truncate max-w-xs">{cand.specialty}</div>
                                    <div className="text-[10px] text-white/40 mt-1">
                                        Sueldo: {formatCurrency(cand.salary)}/sem • Coste: <span className="text-amber-400 font-bold">{formatCurrency(cand.hiringFee)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onOpenHireModal({
                                        type: 'staff',
                                        candidate: cand,
                                        currentHolder: sportingDirector
                                    })}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap"
                                >
                                    Contratar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Youth Coach Candidates */}
                <div className="space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Formadores de Cantera Disponibles
                    </h4>

                    <div className="space-y-3">
                        {youthCandidates.map(cand => (
                            <div key={cand.id} className="apex-card p-4 border border-white/10 flex items-center justify-between gap-4 hover:border-purple-400/40 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-black text-white text-sm">{cand.name}</h5>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getPowerBadgeClass(cand.power)}`}>
                                            {cand.power} PTS
                                        </span>
                                    </div>
                                    <div className="text-xs text-white/50 truncate max-w-xs">{cand.specialty}</div>
                                    <div className="text-[10px] text-white/40 mt-1">
                                        Sueldo: {formatCurrency(cand.salary)}/sem • Coste: <span className="text-amber-400 font-bold">{formatCurrency(cand.hiringFee)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onOpenHireModal({
                                        type: 'staff',
                                        candidate: cand,
                                        currentHolder: youthCoach
                                    })}
                                    className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap"
                                >
                                    Contratar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});
