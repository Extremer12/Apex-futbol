import React from 'react';
import { Coach, StaffMember, Scout } from '../../../types';
import { formatCurrency } from '../../../utils';
import { 
    Award, 
    Stethoscope, 
    Dumbbell, 
    Briefcase, 
    GraduationCap, 
    Search, 
    ChevronRight 
} from 'lucide-react';
import { TabKey, getPowerBadgeClass, getPowerTierLabel } from './staffUiTypes';

interface StaffOverviewTabProps {
    coach?: Coach;
    doctor?: StaffMember;
    fitnessCoach?: StaffMember;
    sportingDirector?: StaffMember;
    youthCoach?: StaffMember;
    scouts: Scout[];
    coachEffect: { lineRatingBonus: number; description: string };
    doctorEffect: { injuryReductionPct: number; recoveryBonusChance: number; description: string };
    fitnessEffect: { fatigueResistancePct: number; weeklyRecoveryBonus: number; description: string };
    sportingEffect: { transferDiscountPct: number; description: string };
    youthEffect: { academyBonusPoints: number; description: string };
    onNavigateTab: (tab: TabKey) => void;
}

export const StaffOverviewTab: React.FC<StaffOverviewTabProps> = React.memo(({
    coach,
    doctor,
    fitnessCoach,
    sportingDirector,
    youthCoach,
    scouts,
    coachEffect,
    doctorEffect,
    fitnessEffect,
    sportingEffect,
    youthEffect,
    onNavigateTab
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Hero Staff Banner */}
            <div className="apex-card p-5 md:p-6 bg-gradient-to-r from-amber-500/10 via-black/40 to-blue-500/10 border border-white/10 relative overflow-hidden">
                <div className="max-w-3xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--apex-gold)]">
                        Estructura Organizacional
                    </span>
                    <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight text-white mt-1">
                        Organigrama del Plantel Profesional
                    </h2>
                    <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                        Cada integrante del staff profesional opera sobre una variable crítica del equipo. Reemplaza especialistas de bajo nivel por profesionales de élite mundial para reducir bajas médicas, mantener la frescura física en seguidillas de partidos y potenciar las negociaciones de mercado.
                    </p>
                </div>
            </div>

            {/* Department Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* 1. Director Técnico */}
                <div className="apex-card p-5 border border-white/10 flex flex-col justify-between relative group hover:border-[var(--apex-gold)]/40 transition-colors">
                    <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[var(--apex-gold)]">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--apex-gold)]">Dirección Técnica</span>
                                    <h3 className="text-base font-black text-white tracking-tight">{coach ? coach.name : 'Vacante'}</h3>
                                </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-xl border text-xs font-black ${coach ? getPowerBadgeClass(coach.prestige) : 'text-white/30 border-white/10 bg-white/5'}`}>
                                {coach ? `${coach.prestige} PTS` : 'S/D'}
                            </div>
                        </div>

                        {coach ? (
                            <div className="space-y-2.5 text-xs mb-4">
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Estilo Táctico:</span>
                                    <span className="font-bold text-white uppercase">{coach.style}</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Esquema Preferido:</span>
                                    <span className="font-bold text-white">{coach.preferredFormation}</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Impacto en Líneas:</span>
                                    <span className="font-black text-emerald-400">
                                        {coachEffect.lineRatingBonus >= 0 ? `+${coachEffect.lineRatingBonus}` : coachEffect.lineRatingBonus} Valoración
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Sueldo Semanal:</span>
                                    <span className="font-bold text-white">{formatCurrency(coach.salary)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-4">
                                Sin DT al mando. El equipo rinde con una penalización táctica general.
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onNavigateTab('coach')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                        <span>Gestionar Dirección Técnica</span>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                    </button>
                </div>

                {/* 2. Jefe de Servicios Médicos */}
                <div className="apex-card p-5 border border-white/10 flex flex-col justify-between relative group hover:border-rose-400/40 transition-colors">
                    <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                                    <Stethoscope className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-400">Servicios Médicos</span>
                                    <h3 className="text-base font-black text-white tracking-tight">{doctor ? doctor.name : 'Vacante'}</h3>
                                </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-xl border text-xs font-black ${doctor ? getPowerBadgeClass(doctor.power) : 'text-white/30 border-white/10 bg-white/5'}`}>
                                {doctor ? `${doctor.power} PTS` : 'S/D'}
                            </div>
                        </div>

                        {doctor ? (
                            <div className="space-y-2.5 text-xs mb-4">
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Especialidad:</span>
                                    <span className="font-bold text-white truncate max-w-[170px]">{doctor.specialty || 'Traumatología'}</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Reducción Lesiones:</span>
                                    <span className={`font-black ${doctorEffect.injuryReductionPct > 0 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                        {doctorEffect.injuryReductionPct > 0 ? `-${doctorEffect.injuryReductionPct}% Riesgo` : 'Riesgo estándar'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Curación Acelerada:</span>
                                    <span className="font-bold text-cyan-400">{doctorEffect.recoveryBonusChance}% prob. 2x</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Sueldo Semanal:</span>
                                    <span className="font-bold text-white">{formatCurrency(doctor.salary)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-4">
                                Sin médico en plantilla. Las lesiones se multiplican y la recuperación es lenta.
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onNavigateTab('medical_performance')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                        <span>Ver Área Médica & Bajas</span>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                    </button>
                </div>

                {/* 3. Preparador Físico */}
                <div className="apex-card p-5 border border-white/10 flex flex-col justify-between relative group hover:border-cyan-400/40 transition-colors">
                    <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                    <Dumbbell className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Preparación Física</span>
                                    <h3 className="text-base font-black text-white tracking-tight">{fitnessCoach ? fitnessCoach.name : 'Vacante'}</h3>
                                </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-xl border text-xs font-black ${fitnessCoach ? getPowerBadgeClass(fitnessCoach.power) : 'text-white/30 border-white/10 bg-white/5'}`}>
                                {fitnessCoach ? `${fitnessCoach.power} PTS` : 'S/D'}
                            </div>
                        </div>

                        {fitnessCoach ? (
                            <div className="space-y-2.5 text-xs mb-4">
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Especialidad:</span>
                                    <span className="font-bold text-white truncate max-w-[170px]">{fitnessCoach.specialty || 'Acondicionamiento'}</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Resistencia Fatiga:</span>
                                    <span className="font-black text-emerald-400">-{fitnessEffect.fatigueResistancePct}% Desgaste</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Recuperación Semanal:</span>
                                    <span className="font-bold text-cyan-400">+{12 + fitnessEffect.weeklyRecoveryBonus} Condición</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Sueldo Semanal:</span>
                                    <span className="font-bold text-white">{formatCurrency(fitnessCoach.salary)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-4">
                                Sin preparador físico. El plantel sufre fatiga extrema en minutos finales.
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onNavigateTab('medical_performance')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                        <span>Ver Rendimiento Físico</span>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                    </button>
                </div>

                {/* 4. Director Deportivo */}
                <div className="apex-card p-5 border border-white/10 flex flex-col justify-between relative group hover:border-emerald-400/40 transition-colors">
                    <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Dirección Deportiva</span>
                                    <h3 className="text-base font-black text-white tracking-tight">{sportingDirector ? sportingDirector.name : 'Vacante'}</h3>
                                </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-xl border text-xs font-black ${sportingDirector ? getPowerBadgeClass(sportingDirector.power) : 'text-white/30 border-white/10 bg-white/5'}`}>
                                {sportingDirector ? `${sportingDirector.power} PTS` : 'S/D'}
                            </div>
                        </div>

                        {sportingDirector ? (
                            <div className="space-y-2.5 text-xs mb-4">
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Especialidad:</span>
                                    <span className="font-bold text-white truncate max-w-[170px]">{sportingDirector.specialty || 'Negociaciones'}</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Descuento Fichajes:</span>
                                    <span className="font-black text-emerald-400">Hasta -{sportingEffect.transferDiscountPct}% en compras</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Nivel de Contactos:</span>
                                    <span className="font-bold text-white">{getPowerTierLabel(sportingDirector.power)}</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Sueldo Semanal:</span>
                                    <span className="font-bold text-white">{formatCurrency(sportingDirector.salary)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-4">
                                Sin director deportivo. Las negociaciones carecen de ventajas y descuentos.
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onNavigateTab('sports_academy')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                        <span>Ver Dirección Deportiva</span>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                    </button>
                </div>

                {/* 5. Director de Cantera */}
                <div className="apex-card p-5 border border-white/10 flex flex-col justify-between relative group hover:border-purple-400/40 transition-colors">
                    <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Metodología & Cantera</span>
                                    <h3 className="text-base font-black text-white tracking-tight">{youthCoach ? youthCoach.name : 'Vacante'}</h3>
                                </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-xl border text-xs font-black ${youthCoach ? getPowerBadgeClass(youthCoach.power) : 'text-white/30 border-white/10 bg-white/5'}`}>
                                {youthCoach ? `${youthCoach.power} PTS` : 'S/D'}
                            </div>
                        </div>

                        {youthCoach ? (
                            <div className="space-y-2.5 text-xs mb-4">
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Especialidad:</span>
                                    <span className="font-bold text-white truncate max-w-[170px]">{youthCoach.specialty || 'Formador'}</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Bono Regens:</span>
                                    <span className="font-black text-purple-400">+{youthEffect.academyBonusPoints} Puntos Potencial</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Calidad Formativa:</span>
                                    <span className="font-bold text-white">{getPowerTierLabel(youthCoach.power)}</span>
                                </div>
                                <div className="flex items-center justify-between text-white/60">
                                    <span>Sueldo Semanal:</span>
                                    <span className="font-bold text-white">{formatCurrency(youthCoach.salary)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-4">
                                Sin director de cantera. La promoción de juveniles produce talentos ordinarios.
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onNavigateTab('sports_academy')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                        <span>Ver Cantera & Metodología</span>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                    </button>
                </div>

                {/* 6. Red de Ojeo */}
                <div className="apex-card p-5 border border-white/10 flex flex-col justify-between relative group hover:border-blue-400/40 transition-colors">
                    <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Search className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Red de Ojeo</span>
                                    <h3 className="text-base font-black text-white tracking-tight">{scouts.length}/3 Ojeadores</h3>
                                </div>
                            </div>
                            <div className="px-2.5 py-1 rounded-xl border border-white/10 bg-white/5 text-xs font-black text-white/80">
                                {scouts.length > 0 ? `${scouts.length} Activos` : 'Inactivo'}
                            </div>
                        </div>

                        <div className="space-y-2.5 text-xs mb-4">
                            <div className="flex items-center justify-between text-white/60">
                                <span>Cobertura Mercado:</span>
                                <span className="font-bold text-white">{scouts.length * 33}% Red Activa</span>
                            </div>
                            <div className="flex items-center justify-between text-white/60">
                                <span>Eficiencia Media:</span>
                                <span className="font-bold text-[var(--apex-gold)]">
                                    {scouts.length > 0 ? `${Math.round(scouts.reduce((a, s) => a + s.efficiency, 0) / scouts.length)}%` : '0%'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-white/60">
                                <span>Precisión Media:</span>
                                <span className="font-bold text-emerald-400">
                                    {scouts.length > 0 ? `${Math.round(scouts.reduce((a, s) => a + s.accuracy, 0) / scouts.length)}%` : '0%'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-white/60">
                                <span>Masa Salarial Ojeo:</span>
                                <span className="font-bold text-white">{formatCurrency(scouts.reduce((a, s) => a + s.salary, 0))}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onNavigateTab('scouts')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                        <span>Ver Ojeadores & Reportes</span>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                    </button>
                </div>
            </div>
        </div>
    );
});
