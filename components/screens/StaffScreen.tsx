import React, { useState, useMemo, useCallback } from 'react';
import { GameState, Coach, StaffMember, Scout, ClubStaff } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrencyShort } from '../../utils';
import {
    getDoctorEffect,
    getFitnessEffect,
    getSportingDirectorEffect,
    getYouthCoachEffect,
    getCoachEffect,
    VACANT_STAFF_POWER
} from '../../services/staffService';
import {
    Users,
    Stethoscope,
    Dumbbell,
    Briefcase,
    Award,
    Search,
    GraduationCap,
    HeartPulse,
    UserPlus,
    UserMinus
} from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { ModalFireState, DEFAULT_SCOUT_CANDIDATES } from './staff/staffUiTypes';
import { StaffFireModal } from './staff/StaffModals';
import { StaffRoleCard } from './staff/StaffRoleCard';
import { StaffCandidateModal, MarketRoleType } from './staff/StaffCandidateModal';

interface StaffScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

const STYLE_ES: Record<string, string> = {
    Attacking: 'Ofensivo',
    Defensive: 'Defensivo',
    Possession: 'Posesión',
    Counter: 'Contraataque',
    Balanced: 'Equilibrado',
};

const ROLE_TITLES: Record<MarketRoleType, string> = {
    coach: 'Director Técnico',
    doctor: 'Jefe Médico',
    fitness_coach: 'Preparador Físico',
    sporting_director: 'Director Deportivo',
    youth_coach: 'Director de Cantera',
    scout: 'Ojeador',
};

export const StaffScreen: React.FC<StaffScreenProps> = React.memo(({ gameState, dispatch }) => {
    const { scouts, finances, team, availableCoaches = [], availableStaff = [] } = gameState;
    const { showToast } = useToast();

    const [marketRole, setMarketRole] = useState<MarketRoleType | null>(null);
    const [fireModal, setFireModal] = useState<ModalFireState | null>(null);

    const clubStaff: ClubStaff = gameState.clubStaff || team.clubStaff || {};
    const { doctor, fitnessCoach, sportingDirector, youthCoach } = clubStaff;
    const coach = team.coach;

    const doctorEffect = useMemo(() => getDoctorEffect(doctor), [doctor]);
    const fitnessEffect = useMemo(() => getFitnessEffect(fitnessCoach), [fitnessCoach]);
    const sportingEffect = useMemo(() => getSportingDirectorEffect(sportingDirector), [sportingDirector]);
    const youthEffect = useMemo(() => getYouthCoachEffect(youthCoach), [youthCoach]);
    const coachEffect = useMemo(() => getCoachEffect(coach), [coach]);

    const staffAveragePower = useMemo(() => {
        const powers = [
            coach?.prestige ?? VACANT_STAFF_POWER,
            doctor?.power ?? VACANT_STAFF_POWER,
            fitnessCoach?.power ?? VACANT_STAFF_POWER,
            sportingDirector?.power ?? VACANT_STAFF_POWER,
            youthCoach?.power ?? VACANT_STAFF_POWER,
        ];
        return Math.round(powers.reduce((a, b) => a + b, 0) / powers.length);
    }, [coach, doctor, fitnessCoach, sportingDirector, youthCoach]);

    const totalWeeklyStaffWages = useMemo(() => {
        return (coach?.salary ?? 0)
            + (doctor?.salary ?? 0)
            + (fitnessCoach?.salary ?? 0)
            + (sportingDirector?.salary ?? 0)
            + (youthCoach?.salary ?? 0)
            + scouts.reduce((sum, s) => sum + s.salary, 0);
    }, [coach, doctor, fitnessCoach, sportingDirector, youthCoach, scouts]);

    const injuredPlayers = useMemo(() => (team.squad || []).filter(p => p.isInjured), [team.squad]);
    const hiredScoutIds = useMemo(() => new Set(scouts.map(s => s.id)), [scouts]);

    const filteredStaffCandidates = useMemo(() => {
        if (!marketRole || marketRole === 'coach' || marketRole === 'scout') return [];
        return availableStaff.filter(s => s.role === marketRole);
    }, [availableStaff, marketRole]);

    const currentStaffForModal = useMemo(() => {
        if (marketRole === 'doctor') return doctor;
        if (marketRole === 'fitness_coach') return fitnessCoach;
        if (marketRole === 'sporting_director') return sportingDirector;
        if (marketRole === 'youth_coach') return youthCoach;
        return undefined;
    }, [marketRole, doctor, fitnessCoach, sportingDirector, youthCoach]);

    const handleHireCoach = useCallback((c: Coach) => {
        dispatch({ type: 'HIRE_COACH', payload: { coachId: c.id } });
        showToast(`${c.name} es el nuevo Director Técnico.`, 'success');
    }, [dispatch, showToast]);

    const handleHireStaff = useCallback((s: StaffMember) => {
        dispatch({ type: 'HIRE_STAFF', payload: { staffId: s.id } });
        showToast(`${s.name} se incorporó al cuerpo técnico.`, 'success');
    }, [dispatch, showToast]);

    const handleHireScout = useCallback((sc: Scout) => {
        if (scouts.length >= 3) {
            showToast('Ya tienes el máximo de 3 ojeadores activos.', 'error');
            return;
        }
        dispatch({ type: 'HIRE_SCOUT', payload: sc });
        showToast(`${sc.name} se unió a la red de ojeo.`, 'success');
    }, [dispatch, scouts.length, showToast]);

    const confirmFire = useCallback(() => {
        if (!fireModal) return;
        if (fireModal.type === 'coach') {
            dispatch({ type: 'FIRE_COACH' });
            showToast(`${fireModal.name} dejó el cargo.`, 'info');
        } else if (fireModal.type === 'staff' && fireModal.role) {
            dispatch({ type: 'FIRE_STAFF', payload: { role: fireModal.role } });
            showToast(`${fireModal.name} fue desvinculado.`, 'info');
        } else if (fireModal.type === 'scout' && fireModal.scoutId) {
            dispatch({ type: 'FIRE_SCOUT', payload: { scoutId: fireModal.scoutId } });
            showToast(`${fireModal.name} dejó la red de ojeo.`, 'info');
        }
        setFireModal(null);
    }, [fireModal, dispatch, showToast]);

    return (
        <div className="space-y-6 pb-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                        <Users className="w-6 h-6 text-emerald-400" />
                        Cuerpo Técnico & Personal
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Organigrama deportivo del club. Cada especialista impacta directamente en partidos, lesiones, fichajes y cantera.
                    </p>
                </div>
            </div>

            {/* 4 Compact KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nivel del Staff</div>
                    <div className="text-xl font-black text-white mt-1">
                        {staffAveragePower}<span className="text-xs font-normal text-slate-500">/100</span>
                    </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Masa Salarial</div>
                    <div className="text-xl font-black text-white mt-1">
                        {formatCurrencyShort(totalWeeklyStaffWages)}<span className="text-xs font-normal text-slate-500">/sem</span>
                    </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Enfermería</div>
                    <div className={`text-xl font-black mt-1 ${injuredPlayers.length === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {injuredPlayers.length === 0 ? '100% Sano' : `${injuredPlayers.length} bajas`}
                    </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Red de Ojeo</div>
                    <div className="text-xl font-black text-sky-400 mt-1">
                        {scouts.length}<span className="text-xs font-normal text-slate-500">/3 activos</span>
                    </div>
                </div>
            </div>

            {/* 5 Key Roles Organigram */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <StaffRoleCard
                    roleTitle="Director Técnico"
                    roleSubtitle={coach ? `${STYLE_ES[coach.style] || coach.style} · ${coach.preferredFormation}` : 'Conducción táctica'}
                    icon={<Award className="w-5 h-5" />}
                    accentColor="emerald"
                    personName={coach?.name}
                    power={coach?.prestige ?? VACANT_STAFF_POWER}
                    salary={coach?.salary}
                    specialty={coach ? `${coach.nationality} · ${coach.age} años` : undefined}
                    impactChip={`${coachEffect.lineRatingBonus >= 0 ? '+' : ''}${coachEffect.lineRatingBonus} nivel táctico`}
                    isVacant={!coach}
                    onSelectMarket={() => setMarketRole('coach')}
                    onFire={coach ? () => setFireModal({ type: 'coach', name: coach.name, cost: coach.salary * 4 }) : undefined}
                />

                <StaffRoleCard
                    roleTitle="Jefe Médico"
                    roleSubtitle="Prevención y recuperación"
                    icon={<Stethoscope className="w-5 h-5" />}
                    accentColor="rose"
                    personName={doctor?.name}
                    power={doctor?.power ?? VACANT_STAFF_POWER}
                    salary={doctor?.salary}
                    specialty={doctor?.specialty}
                    impactChip={`${doctorEffect.injuryReductionPct >= 0 ? `-${doctorEffect.injuryReductionPct}%` : `+${Math.abs(doctorEffect.injuryReductionPct)}%`} lesiones · ${doctorEffect.recoveryBonusChance}% cura 2x`}
                    isVacant={!doctor}
                    onSelectMarket={() => setMarketRole('doctor')}
                    onFire={doctor ? () => setFireModal({ type: 'staff', role: 'doctor', name: doctor.name, cost: doctor.salary * 3 }) : undefined}
                />

                <StaffRoleCard
                    roleTitle="Preparador Físico"
                    roleSubtitle="Resistencia y fatiga"
                    icon={<Dumbbell className="w-5 h-5" />}
                    accentColor="amber"
                    personName={fitnessCoach?.name}
                    power={fitnessCoach?.power ?? VACANT_STAFF_POWER}
                    salary={fitnessCoach?.salary}
                    specialty={fitnessCoach?.specialty}
                    impactChip={`-${fitnessEffect.fatigueResistancePct}% fatiga · +${fitnessEffect.weeklyRecoveryBonus} recup./sem`}
                    isVacant={!fitnessCoach}
                    onSelectMarket={() => setMarketRole('fitness_coach')}
                    onFire={fitnessCoach ? () => setFireModal({ type: 'staff', role: 'fitness_coach', name: fitnessCoach.name, cost: fitnessCoach.salary * 3 }) : undefined}
                />

                <StaffRoleCard
                    roleTitle="Director Deportivo"
                    roleSubtitle="Negociación de fichajes"
                    icon={<Briefcase className="w-5 h-5" />}
                    accentColor="sky"
                    personName={sportingDirector?.name}
                    power={sportingDirector?.power ?? VACANT_STAFF_POWER}
                    salary={sportingDirector?.salary}
                    specialty={sportingDirector?.specialty}
                    impactChip={`-${sportingEffect.transferDiscountPct}% en compras`}
                    isVacant={!sportingDirector}
                    onSelectMarket={() => setMarketRole('sporting_director')}
                    onFire={sportingDirector ? () => setFireModal({ type: 'staff', role: 'sporting_director', name: sportingDirector.name, cost: sportingDirector.salary * 3 }) : undefined}
                />

                <StaffRoleCard
                    roleTitle="Director de Cantera"
                    roleSubtitle="Formación de juveniles"
                    icon={<GraduationCap className="w-5 h-5" />}
                    accentColor="violet"
                    personName={youthCoach?.name}
                    power={youthCoach?.power ?? VACANT_STAFF_POWER}
                    salary={youthCoach?.salary}
                    specialty={youthCoach?.specialty}
                    impactChip={`+${youthEffect.academyBonusPoints} potencial cantera`}
                    isVacant={!youthCoach}
                    onSelectMarket={() => setMarketRole('youth_coach')}
                    onFire={youthCoach ? () => setFireModal({ type: 'staff', role: 'youth_coach', name: youthCoach.name, cost: youthCoach.salary * 3 }) : undefined}
                />
            </div>

            {/* Scouting Network */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-sky-400" />
                        <h2 className="text-sm font-bold text-white">Red de Ojeo ({scouts.length}/3)</h2>
                    </div>
                    {scouts.length < 3 && (
                        <button
                            onClick={() => setMarketRole('scout')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            Contratar Ojeador
                        </button>
                    )}
                </div>

                {scouts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No tienes ojeadores activos. Contrata hasta 3 para descubrir jugadores cada semana.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {scouts.map(sc => (
                            <div key={sc.id} className="flex items-center justify-between gap-2 p-3 rounded-xl border border-white/10 bg-slate-950/50">
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-white truncate">{sc.name}</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                        {sc.specialty || 'General'} · Efic. {sc.efficiency} · {formatCurrencyShort(sc.salary)}/sem
                                    </div>
                                </div>
                                <button
                                    onClick={() => setFireModal({ type: 'scout', scoutId: sc.id, name: sc.name, cost: 0 })}
                                    title="Despedir ojeador"
                                    className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors shrink-0"
                                >
                                    <UserMinus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Compact Infirmary (only when there are injured players) */}
            {injuredPlayers.length > 0 && (
                <div className="rounded-2xl border border-rose-500/25 bg-rose-950/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <HeartPulse className="w-4 h-4 text-rose-400" />
                        <h2 className="text-sm font-bold text-white">Enfermería ({injuredPlayers.length} bajas)</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {injuredPlayers.map(p => (
                            <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-xs">
                                <span className="font-semibold text-white truncate">{p.name} <span className="text-slate-400">({p.position})</span></span>
                                <span className="text-rose-400 font-bold shrink-0">{p.injuryWeeksRemaining || 1} sem</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Candidate Market Modal */}
            <StaffCandidateModal
                isOpen={marketRole !== null}
                roleType={marketRole}
                roleTitle={marketRole ? ROLE_TITLES[marketRole] : ''}
                balance={finances.balance}
                currentCoach={coach}
                currentStaff={currentStaffForModal}
                coachCandidates={availableCoaches}
                staffCandidates={filteredStaffCandidates}
                scoutCandidates={DEFAULT_SCOUT_CANDIDATES}
                hiredScoutIds={hiredScoutIds}
                onClose={() => setMarketRole(null)}
                onHireCoach={handleHireCoach}
                onHireStaff={handleHireStaff}
                onHireScout={handleHireScout}
            />

            {/* Fire Confirmation Modal */}
            <StaffFireModal
                fireModal={fireModal}
                onClose={() => setFireModal(null)}
                onConfirmFire={confirmFire}
            />
        </div>
    );
});
