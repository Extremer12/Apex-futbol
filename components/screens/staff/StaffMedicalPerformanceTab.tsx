import React from 'react';
import { StaffMember, Player } from '../../../types';
import { formatCurrency } from '../../../utils';
import { 
    Stethoscope, 
    Dumbbell, 
    Activity, 
    UserMinus 
} from 'lucide-react';
import { ModalFireState, ModalHireState, getPowerBadgeClass } from './staffUiTypes';

interface StaffMedicalPerformanceTabProps {
    doctor?: StaffMember;
    fitnessCoach?: StaffMember;
    doctorEffect: { injuryReductionPct: number; recoveryBonusChance: number; description: string };
    fitnessEffect: { fatigueResistancePct: number; weeklyRecoveryBonus: number; description: string };
    injuredPlayers: Player[];
    doctorCandidates: StaffMember[];
    fitnessCandidates: StaffMember[];
    onOpenFireModal: (modal: ModalFireState) => void;
    onOpenHireModal: (modal: ModalHireState) => void;
}

export const StaffMedicalPerformanceTab: React.FC<StaffMedicalPerformanceTabProps> = React.memo(({
    doctor,
    fitnessCoach,
    doctorEffect,
    fitnessEffect,
    injuredPlayers,
    doctorCandidates,
    fitnessCandidates,
    onOpenFireModal,
    onOpenHireModal
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Medical & Physical Head-to-Head Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Doctor Card */}
                <div className="apex-card p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                                        Jefe de Servicios Médicos
                                    </span>
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
                                        {doctor ? doctor.name : 'Vacante (Sin Médico)'}
                                    </h3>
                                    <span className="text-xs text-white/50">{doctor?.nationality || 'Internacional'} • {doctor?.age || 45} años</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-xl border text-sm font-black ${doctor ? getPowerBadgeClass(doctor.power) : 'text-white/30 border-white/10 bg-white/5'}`}>
                                {doctor ? `${doctor.power} PTS` : 'S/D'}
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/70 mb-4 leading-relaxed">
                            {doctorEffect.description}
                        </div>

                        <div className="space-y-3 text-xs mb-6">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-white/60">Mitigación de Lesiones Musculares</span>
                                    <span className={`font-black ${doctorEffect.injuryReductionPct > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {doctorEffect.injuryReductionPct > 0 ? `-${doctorEffect.injuryReductionPct}% Riesgo` : '+12% Riesgo Alto'}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className={`h-full ${doctor && doctor.power >= 80 ? 'bg-emerald-400' : 'bg-yellow-400'}`} 
                                        style={{ width: `${Math.max(10, Math.min(100, doctor?.power || 30))}%` }} 
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-white/60">Probabilidad de Curación Acelerada (2 semanas en 1)</span>
                                    <span className="font-black text-cyan-400">{doctorEffect.recoveryBonusChance}%</span>
                                </div>
                                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full bg-cyan-400" 
                                        style={{ width: `${doctorEffect.recoveryBonusChance}%` }} 
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-white/5 text-white/60">
                                <span>Especialidad Clínica:</span>
                                <span className="font-bold text-white">{doctor?.specialty || 'Traumatología Deportiva'}</span>
                            </div>
                            <div className="flex justify-between items-center text-white/60">
                                <span>Sueldo Semanal:</span>
                                <span className="font-bold text-white">{doctor ? formatCurrency(doctor.salary) : '0'}</span>
                            </div>
                        </div>
                    </div>

                    {doctor && (
                        <button
                            onClick={() => onOpenFireModal({
                                type: 'staff',
                                member: doctor,
                                role: 'doctor',
                                severanceCost: doctor.salary * 2
                            })}
                            className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        >
                            <UserMinus className="w-4 h-4" />
                            <span>Rescindir Jefe Médico (2 sem. indemnización)</span>
                        </button>
                    )}
                </div>

                {/* Fitness Coach Card */}
                <div className="apex-card p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                    <Dumbbell className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                        Preparador Físico Jefe
                                    </span>
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
                                        {fitnessCoach ? fitnessCoach.name : 'Vacante (Sin Preparador)'}
                                    </h3>
                                    <span className="text-xs text-white/50">{fitnessCoach?.nationality || 'Internacional'} • {fitnessCoach?.age || 42} años</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-xl border text-sm font-black ${fitnessCoach ? getPowerBadgeClass(fitnessCoach.power) : 'text-white/30 border-white/10 bg-white/5'}`}>
                                {fitnessCoach ? `${fitnessCoach.power} PTS` : 'S/D'}
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/70 mb-4 leading-relaxed">
                            {fitnessEffect.description}
                        </div>

                        <div className="space-y-3 text-xs mb-6">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-white/60">Mitigación de Fatiga durante los 90 Minutos</span>
                                    <span className="font-black text-emerald-400">-{fitnessEffect.fatigueResistancePct}% Desgaste</span>
                                </div>
                                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full bg-emerald-400" 
                                        style={{ width: `${(fitnessEffect.fatigueResistancePct / 30) * 100}%` }} 
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-white/60">Recuperación Semanal de Energía (Condición)</span>
                                    <span className="font-black text-cyan-400">+{12 + fitnessEffect.weeklyRecoveryBonus} pts / semana</span>
                                </div>
                                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full bg-cyan-400" 
                                        style={{ width: `${((12 + fitnessEffect.weeklyRecoveryBonus) / 28) * 100}%` }} 
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-white/5 text-white/60">
                                <span>Especialidad de Cargas:</span>
                                <span className="font-bold text-white">{fitnessCoach?.specialty || 'Periodización Táctica'}</span>
                            </div>
                            <div className="flex justify-between items-center text-white/60">
                                <span>Sueldo Semanal:</span>
                                <span className="font-bold text-white">{fitnessCoach ? formatCurrency(fitnessCoach.salary) : '0'}</span>
                            </div>
                        </div>
                    </div>

                    {fitnessCoach && (
                        <button
                            onClick={() => onOpenFireModal({
                                type: 'staff',
                                member: fitnessCoach,
                                role: 'fitness_coach',
                                severanceCost: fitnessCoach.salary * 2
                            })}
                            className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        >
                            <UserMinus className="w-4 h-4" />
                            <span>Rescindir Preparador Físico (2 sem. indemnización)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Active Hospital Ward / Medical Report */}
            <div className="apex-card p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <Activity className="w-5 h-5 text-rose-400" />
                        <h3 className="text-base font-black text-white uppercase italic tracking-tight">
                            Enfermería del Club ({injuredPlayers.length} Bajas Médicas)
                        </h3>
                    </div>
                    <span className="text-xs text-white/50">
                        Pronósticos sujetos al poder del Jefe Médico ({doctor?.power || 50} PTS)
                    </span>
                </div>

                {injuredPlayers.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-emerald-500/5 border border-dashed border-emerald-500/20 text-emerald-300 text-xs">
                        ✨ ¡Excelente estado del plantel! No hay futbolistas en la enfermería actualmente.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {injuredPlayers.map(p => (
                            <div key={p.id} className="p-3.5 rounded-xl bg-black/40 border border-rose-500/30 flex items-center justify-between">
                                <div>
                                    <div className="font-black text-white text-sm">{p.name}</div>
                                    <span className="text-[10px] text-white/50">{p.position} • {p.rating} Media</span>
                                </div>
                                <div className="text-right">
                                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase block">
                                        {p.injuryWeeksRemaining || 1} sem. restante
                                    </span>
                                    <span className="text-[9px] text-cyan-400 mt-1 block">
                                        {doctorEffect.recoveryBonusChance}% prob. 2x cura
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Candidate Markets for Doctor & Fitness Coach */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Doctor Candidates Market */}
                <div className="space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Médicos Disponibles en el Mercado
                    </h4>

                    <div className="space-y-3">
                        {doctorCandidates.map(cand => (
                            <div key={cand.id} className="apex-card p-4 border border-white/10 flex items-center justify-between gap-4 hover:border-rose-400/40 transition-colors">
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
                                        currentHolder: doctor
                                    })}
                                    className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap"
                                >
                                    Contratar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fitness Coach Candidates Market */}
                <div className="space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4" />
                        Preparadores Físicos Disponibles
                    </h4>

                    <div className="space-y-3">
                        {fitnessCandidates.map(cand => (
                            <div key={cand.id} className="apex-card p-4 border border-white/10 flex items-center justify-between gap-4 hover:border-cyan-400/40 transition-colors">
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
                                        currentHolder: fitnessCoach
                                    })}
                                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap"
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
