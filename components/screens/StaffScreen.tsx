import React, { useState, useMemo, useCallback } from 'react';
import { GameState, Coach, StaffMember, Scout, ClubStaff } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrencyShort } from '../../utils';
import { 
    getDoctorEffect, 
    getFitnessEffect, 
    getSportingDirectorEffect, 
    getYouthCoachEffect, 
    getCoachEffect 
} from '../../services/staffService';
import { 
    Users, 
    Stethoscope, 
    Dumbbell, 
    Briefcase, 
    Award, 
    Search, 
    GraduationCap, 
    HelpCircle 
} from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { 
    TabKey, 
    ModalHireState, 
    ModalFireState, 
    DEFAULT_SCOUT_CANDIDATES, 
    getPowerBadgeClass, 
    getPowerTierLabel 
} from './staff/staffUiTypes';
import { StaffOverviewTab } from './staff/StaffOverviewTab';
import { StaffCoachTab } from './staff/StaffCoachTab';
import { StaffMedicalPerformanceTab } from './staff/StaffMedicalPerformanceTab';
import { StaffSportsAcademyTab } from './staff/StaffSportsAcademyTab';
import { StaffScoutsTab } from './staff/StaffScoutsTab';
import { StaffHireModal, StaffFireModal, StaffImpactGuideModal } from './staff/StaffModals';

interface StaffScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export const StaffScreen: React.FC<StaffScreenProps> = React.memo(({ gameState, dispatch }) => {
    const { scouts, finances, team, availableCoaches = [], availableStaff = [] } = gameState;
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [hireModal, setHireModal] = useState<ModalHireState | null>(null);
    const [fireModal, setFireModal] = useState<ModalFireState | null>(null);
    const [showImpactModal, setShowImpactModal] = useState<boolean>(false);

    // Active Staff & Coach resolution with graceful fallbacks
    const clubStaff: ClubStaff = gameState.clubStaff || team.clubStaff || {};
    const doctor = clubStaff.doctor;
    const fitnessCoach = clubStaff.fitnessCoach;
    const sportingDirector = clubStaff.sportingDirector;
    const youthCoach = clubStaff.youthCoach;
    const coach = team.coach;

    // Derived effect calculations
    const doctorEffect = useMemo(() => getDoctorEffect(doctor), [doctor]);
    const fitnessEffect = useMemo(() => getFitnessEffect(fitnessCoach), [fitnessCoach]);
    const sportingEffect = useMemo(() => getSportingDirectorEffect(sportingDirector), [sportingDirector]);
    const youthEffect = useMemo(() => getYouthCoachEffect(youthCoach), [youthCoach]);
    const coachEffect = useMemo(() => getCoachEffect(coach), [coach]);

    // Average Staff Power KPI
    const staffPowers = useMemo(() => {
        const powers: number[] = [];
        if (coach) powers.push(coach.prestige);
        if (doctor) powers.push(doctor.power);
        if (fitnessCoach) powers.push(fitnessCoach.power);
        if (sportingDirector) powers.push(sportingDirector.power);
        if (youthCoach) powers.push(youthCoach.power);
        if (powers.length === 0) return 50;
        return Math.round(powers.reduce((a, b) => a + b, 0) / powers.length);
    }, [coach, doctor, fitnessCoach, sportingDirector, youthCoach]);

    // Total weekly staff payroll
    const totalWeeklyStaffWages = useMemo(() => {
        let sum = 0;
        if (coach) sum += coach.salary;
        if (doctor) sum += doctor.salary;
        if (fitnessCoach) sum += fitnessCoach.salary;
        if (sportingDirector) sum += sportingDirector.salary;
        if (youthCoach) sum += youthCoach.salary;
        scouts.forEach(s => sum += s.salary);
        return sum;
    }, [coach, doctor, fitnessCoach, sportingDirector, youthCoach, scouts]);

    // Injured players in current squad
    const injuredPlayers = useMemo(() => {
        return (team.squad || []).filter(p => p.isInjured);
    }, [team.squad]);

    // Filter available staff candidates by role
    const doctorCandidates = useMemo(() => availableStaff.filter(s => s.role === 'doctor'), [availableStaff]);
    const fitnessCandidates = useMemo(() => availableStaff.filter(s => s.role === 'fitness_coach'), [availableStaff]);
    const sportingCandidates = useMemo(() => availableStaff.filter(s => s.role === 'sporting_director'), [availableStaff]);
    const youthCandidates = useMemo(() => availableStaff.filter(s => s.role === 'youth_coach'), [availableStaff]);

    // Available scout candidates (exclude already hired)
    const availableScouts = useMemo(() => {
        return DEFAULT_SCOUT_CANDIDATES.filter(cand => !scouts.some(s => s.id === cand.id));
    }, [scouts]);

    // Actions
    const handleConfirmHire = useCallback(() => {
        if (!hireModal) return;
        const { type, candidate } = hireModal;

        if (type === 'coach') {
            const coachCand = candidate as Coach;
            if (finances.balance < coachCand.signingBonus) {
                showToast('Fondos insuficientes para abonar la prima de fichaje del DT.', 'error');
                return;
            }
            dispatch({ type: 'HIRE_COACH', payload: { coachId: coachCand.id } });
            showToast(`¡${coachCand.name} es el nuevo Director Técnico del club!`, 'success');
        } else if (type === 'staff') {
            const staffCand = candidate as StaffMember;
            if (finances.balance < staffCand.hiringFee) {
                showToast('Fondos insuficientes para contratar a este especialista.', 'error');
                return;
            }
            dispatch({ type: 'HIRE_STAFF', payload: { staffId: staffCand.id } });
            showToast(`¡${staffCand.name} contratado exitosamente!`, 'success');
        } else if (type === 'scout') {
            const scoutCand = candidate as Scout;
            if (scouts.length >= 3) {
                showToast('Ya tienes el cupo máximo de 3 ojeadores.', 'warning');
                return;
            }
            if (finances.balance < scoutCand.hiringFee) {
                showToast('Fondos insuficientes para contratar a este ojeador.', 'error');
                return;
            }
            dispatch({ type: 'HIRE_SCOUT', payload: scoutCand });
            showToast(`¡${scoutCand.name} incorporado al equipo de ojeo!`, 'success');
        }

        setHireModal(null);
    }, [hireModal, finances.balance, scouts.length, dispatch, showToast]);

    const handleConfirmFire = useCallback(() => {
        if (!fireModal) return;
        const { type, member, role, severanceCost } = fireModal;

        if (finances.balance < severanceCost) {
            showToast('El club no dispone de liquidez suficiente para pagar la indemnización.', 'error');
            return;
        }

        if (type === 'coach') {
            dispatch({ type: 'FIRE_COACH' });
            showToast(`Se rescindió el contrato del DT ${member.name}. Puesto vacante.`, 'info');
        } else if (type === 'staff' && role) {
            dispatch({ type: 'FIRE_STAFF', payload: { role } });
            showToast(`Se rescindió el contrato de ${member.name}. Puesto vacante.`, 'info');
        } else if (type === 'scout') {
            dispatch({ type: 'FIRE_SCOUT', payload: { scoutId: member.id } });
            showToast(`Se desvinculó al ojeador ${member.name}.`, 'info');
        }

        setFireModal(null);
    }, [fireModal, finances.balance, dispatch, showToast]);

    return (
        <div className="p-4 md:p-6 space-y-6 pb-28 animate-fade-in text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase">Estructura Profesional</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 border border-white/10 text-white/70">
                            {team.name}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                        <Users className="w-8 h-8 text-[var(--apex-gold)]" />
                        Cuerpo Técnico & Personal
                    </h1>
                    <p className="text-xs text-white/50 mt-1 max-w-2xl">
                        El poder de tus especialistas impacta directamente la salud física del plantel, la tasa de lesiones, el rendimiento táctico y las operaciones de mercado.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowImpactModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <HelpCircle className="w-4 h-4 text-[var(--apex-gold)]" />
                        <span className="hidden sm:inline">Guía de Fórmulas & Poder</span>
                    </button>
                </div>
            </div>

            {/* Top KPI Cards Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {/* KPI 1: Promedio de Poder */}
                <div className="apex-card p-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Poder Promedio Staff</span>
                        <Award className="w-4 h-4 text-[var(--apex-gold)]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl font-black text-white">{staffPowers}</span>
                        <span className="text-xs text-white/40 font-bold">/ 100</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getPowerBadgeClass(staffPowers)}`}>
                            {getPowerTierLabel(staffPowers)}
                        </span>
                        <span className="text-[10px] text-white/40">5 Áreas Clave</span>
                    </div>
                </div>

                {/* KPI 2: Servicios Médicos (Lesiones) */}
                <div className="apex-card p-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Servicios Médicos</span>
                        <Stethoscope className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl md:text-3xl font-black ${doctor && doctor.power >= 80 ? 'text-emerald-400' : doctor && doctor.power >= 65 ? 'text-yellow-400' : 'text-rose-400'}`}>
                            {doctor ? `${doctor.power}` : 'S/D'}
                        </span>
                        <span className="text-xs text-white/40 font-bold">PTS</span>
                    </div>
                    <div className="mt-2 text-[10px] text-white/60 font-semibold truncate">
                        {doctor ? (
                            doctorEffect.injuryReductionPct > 0 
                                ? `📉 -${doctorEffect.injuryReductionPct}% Lesiones musculares` 
                                : `⚠️ Riesgo de bajas elevado`
                        ) : '⚠️ Sin médico asignado'}
                    </div>
                </div>

                {/* KPI 3: Rendimiento Físico */}
                <div className="apex-card p-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Preparación Física</span>
                        <Dumbbell className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl md:text-3xl font-black ${fitnessCoach && fitnessCoach.power >= 80 ? 'text-emerald-400' : fitnessCoach && fitnessCoach.power >= 65 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                            {fitnessCoach ? `${fitnessCoach.power}` : 'S/D'}
                        </span>
                        <span className="text-xs text-white/40 font-bold">PTS</span>
                    </div>
                    <div className="mt-2 text-[10px] text-white/60 font-semibold truncate">
                        {fitnessCoach ? `⚡ -${fitnessEffect.fatigueResistancePct}% Fatiga en 90'` : '⚠️ Sin preparador físico'}
                    </div>
                </div>

                {/* KPI 4: Masa Salarial Staff */}
                <div className="apex-card p-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Masa Salarial Staff</span>
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl font-black text-white">{formatCurrencyShort(totalWeeklyStaffWages)}</span>
                        <span className="text-xs text-white/40 font-bold">/ sem</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-white/50">Presupuesto disponible:</span>
                        <span className="font-bold text-emerald-400">{formatCurrencyShort(finances.balance)}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 gap-1 md:gap-2 overflow-x-auto custom-scrollbar pb-1">
                {[
                    { key: 'overview', label: 'Organigrama General', icon: Users },
                    { key: 'coach', label: 'Dirección Técnica (DT)', icon: Award },
                    { key: 'medical_performance', label: 'Salud & Rendimiento Físico', icon: Stethoscope, badge: injuredPlayers.length > 0 ? `${injuredPlayers.length} lesionados` : undefined },
                    { key: 'sports_academy', label: 'Dirección Deportiva & Cantera', icon: GraduationCap },
                    { key: 'scouts', label: `Red de Ojeo (${scouts.length}/3)`, icon: Search },
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as TabKey)}
                            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                                isActive
                                    ? 'bg-white/10 text-white border-[var(--apex-gold)] shadow-[0_-2px_10px_rgba(200,168,78,0.15)]'
                                    : 'text-white/50 border-transparent hover:text-white/80 hover:bg-white/5'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--apex-gold)]' : 'text-white/40'}`} />
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
                <StaffOverviewTab
                    coach={coach}
                    doctor={doctor}
                    fitnessCoach={fitnessCoach}
                    sportingDirector={sportingDirector}
                    youthCoach={youthCoach}
                    scouts={scouts}
                    coachEffect={coachEffect}
                    doctorEffect={doctorEffect}
                    fitnessEffect={fitnessEffect}
                    sportingEffect={sportingEffect}
                    youthEffect={youthEffect}
                    onNavigateTab={setActiveTab}
                />
            )}

            {/* Tab 2: Dirección Técnica (DT) */}
            {activeTab === 'coach' && (
                <StaffCoachTab
                    coach={coach}
                    availableCoaches={availableCoaches}
                    coachEffect={coachEffect}
                    onOpenFireModal={setFireModal}
                    onOpenHireModal={setHireModal}
                />
            )}

            {/* Tab 3: Salud & Rendimiento Físico */}
            {activeTab === 'medical_performance' && (
                <StaffMedicalPerformanceTab
                    doctor={doctor}
                    fitnessCoach={fitnessCoach}
                    doctorEffect={doctorEffect}
                    fitnessEffect={fitnessEffect}
                    injuredPlayers={injuredPlayers}
                    doctorCandidates={doctorCandidates}
                    fitnessCandidates={fitnessCandidates}
                    onOpenFireModal={setFireModal}
                    onOpenHireModal={setHireModal}
                />
            )}

            {/* Tab 4: Dirección Deportiva & Cantera */}
            {activeTab === 'sports_academy' && (
                <StaffSportsAcademyTab
                    sportingDirector={sportingDirector}
                    youthCoach={youthCoach}
                    sportingEffect={sportingEffect}
                    youthEffect={youthEffect}
                    sportingCandidates={sportingCandidates}
                    youthCandidates={youthCandidates}
                    onOpenFireModal={setFireModal}
                    onOpenHireModal={setHireModal}
                />
            )}

            {/* Tab 5: Red de Ojeadores (Scouts) */}
            {activeTab === 'scouts' && (
                <StaffScoutsTab
                    scouts={scouts}
                    availableScouts={availableScouts}
                    onOpenFireModal={setFireModal}
                    onOpenHireModal={setHireModal}
                />
            )}

            {/* Modals */}
            <StaffHireModal
                hireModal={hireModal}
                onClose={() => setHireModal(null)}
                onConfirm={handleConfirmHire}
            />

            <StaffFireModal
                fireModal={fireModal}
                onClose={() => setFireModal(null)}
                onConfirm={handleConfirmFire}
            />

            <StaffImpactGuideModal
                isOpen={showImpactModal}
                onClose={() => setShowImpactModal(false)}
            />
        </div>
    );
});
