import React, { useState, useMemo, useCallback } from 'react';
import { GameState, Coach, StaffMember, Scout, ClubStaff, Player } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrencyShort } from '../../utils';
import { generateCoachReport } from '../../services/gameLogic';
import {
    getDoctorEffect,
    getFitnessEffect,
    getSportingDirectorEffect,
    getYouthCoachEffect,
    getCoachEffect,
    generateScoutMarket,
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
    UserMinus,
    MessageSquare,
    Info,
    Activity
} from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { ModalFireState, StaffTabKey, STYLE_ES } from './staff/staffUiTypes';
import { StaffFireModal, StaffGuideModal } from './staff/StaffModals';
import { StaffRoleCard } from './staff/StaffRoleCard';
import { StaffCandidateModal, MarketRoleType } from './staff/StaffCandidateModal';
import { CoachMeetingModal } from '../ui/CoachMeetingModal';
import { StatCell, EmptyState } from './transfers/TransferUI';

interface StaffScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

const ROLE_TITLES: Record<MarketRoleType, string> = {
    coach: 'Director Técnico',
    doctor: 'Jefe Médico',
    fitness_coach: 'Preparador Físico',
    sporting_director: 'Director Deportivo',
    youth_coach: 'Director de Cantera',
    scout: 'Ojeador',
};

export const StaffScreen: React.FC<StaffScreenProps> = React.memo(({ gameState, dispatch }) => {
    const {
        scouts,
        finances,
        team,
        allTeams,
        availableCoaches = [],
        availableStaff = [],
        availableScouts,
        scoutedPlayerIds = {},
        currentWeek,
        lastStaffMarketRefreshWeek
    } = gameState;
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<StaffTabKey>('ORGANIGRAM');
    const [marketRole, setMarketRole] = useState<MarketRoleType | null>(null);
    const [fireModal, setFireModal] = useState<ModalFireState | null>(null);
    const [isCoachMeetingOpen, setIsCoachMeetingOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const clubStaff: ClubStaff = gameState.clubStaff || team.clubStaff || {};
    const { doctor, fitnessCoach, sportingDirector, youthCoach } = clubStaff;
    const coach = team.coach;

    // Persist weekly report if already present in GameState; fallback safely if starting Week 0
    const activeCoachReport = useMemo(
        () => gameState.coachReport || generateCoachReport(gameState),
        [gameState.coachReport, gameState.team.coach, gameState.team.squad.length, gameState.currentWeek]
    );

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

    const injuredPlayers = useMemo(
        () => (team.squad || []).filter(p => p.isInjured),
        [team.squad]
    );

    const fatiguedPlayers = useMemo(
        () => [...(team.squad || [])]
            .filter(p => !p.isInjured)
            .sort((a, b) => (a.condition ?? 100) - (b.condition ?? 100))
            .slice(0, 8),
        [team.squad]
    );

    const avgSquadCondition = useMemo(() => {
        if (!team.squad || team.squad.length === 0) return 100;
        const sum = team.squad.reduce((acc, p) => acc + (p.condition ?? 100), 0);
        return Math.round(sum / team.squad.length);
    }, [team.squad]);

    // O(1) player lookup index for scouted reports
    const scoutedEntries = useMemo(() => {
        const ids = Object.keys(scoutedPlayerIds);
        if (ids.length === 0) return [];
        const playerLookup = new Map<number, { player: Player; teamName: string }>();
        for (const t of allTeams) {
            for (const p of t.squad) {
                playerLookup.set(p.id, { player: p, teamName: t.name });
            }
        }
        return ids
            .map(idStr => {
                const pid = Number(idStr);
                const found = playerLookup.get(pid);
                if (!found) return null;
                return {
                    ...found,
                    progress: scoutedPlayerIds[pid] || 0,
                };
            })
            .filter((entry): entry is { player: Player; teamName: string; progress: number } => entry !== null)
            .sort((a, b) => b.progress - a.progress || b.player.rating - a.player.rating)
            .slice(0, 12);
    }, [scoutedPlayerIds, allTeams]);

    const scoutPool = useMemo(
        () => (availableScouts && availableScouts.length > 0 ? availableScouts : generateScoutMarket(team.tier, team.leagueId)),
        [availableScouts, team.tier, team.leagueId]
    );

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

    const canRefreshMarket = lastStaffMarketRefreshWeek !== currentWeek;

    const handleApprovePromotion = useCallback((player: Player) => {
        dispatch({ type: 'PROMOTE_YOUTH', payload: player.id });
        showToast(`${player.name} fue promovido al primer equipo.`, 'success');
    }, [dispatch, showToast]);

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

    const handleRefreshMarket = useCallback(() => {
        if (!canRefreshMarket) return;
        dispatch({ type: 'REFRESH_STAFF_MARKET' });
        showToast('Cartera de candidatos renovada para esta semana.', 'info');
    }, [canRefreshMarket, dispatch, showToast]);

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
        <div className="p-3 sm:p-5 md:p-6 space-y-4 pb-24 animate-fade-in max-w-5xl mx-auto">
            {/* Compact Header */}
            <header className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">Personal</h1>
                    <span className="text-[11px] font-bold text-slate-400 truncate block">
                        {team.name} · Cuerpo técnico, ojeo y sanidad
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsGuideOpen(true)}
                        title="Impacto del cuerpo técnico"
                        aria-label="Ver impacto del cuerpo técnico"
                        className="w-10 h-10 rounded-2xl bg-[#0D1220] border border-white/10 hover:border-[var(--apex-gold)]/40 flex items-center justify-center text-slate-400 hover:text-[var(--apex-gold)] transition-colors cursor-pointer"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                    <div className="px-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 text-right">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">Nivel Staff</span>
                        <span className="text-sm font-black text-[var(--apex-gold)] leading-none tabular-nums">
                            {staffAveragePower}/100
                        </span>
                    </div>
                </div>
            </header>

            {/* Sticky Tab Navigation */}
            <nav className="sticky top-0 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-1.5 bg-[var(--apex-darker,#070A13)]/95 backdrop-blur">
                <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-2xl" role="tablist" aria-label="Secciones de personal">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'ORGANIGRAM'}
                        onClick={() => setActiveTab('ORGANIGRAM')}
                        className={`h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            activeTab === 'ORGANIGRAM'
                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Users className="w-3.5 h-3.5 hidden sm:inline" />
                        <span>Organigrama</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'SCOUTING'}
                        onClick={() => setActiveTab('SCOUTING')}
                        className={`h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            activeTab === 'SCOUTING'
                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Search className="w-3.5 h-3.5 hidden sm:inline" />
                        <span>Ojeo ({scouts.length}/3)</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'MEDICAL'}
                        onClick={() => setActiveTab('MEDICAL')}
                        className={`relative h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            activeTab === 'MEDICAL'
                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <HeartPulse className="w-3.5 h-3.5 hidden sm:inline" />
                        <span>Enfermería</span>
                        {injuredPlayers.length > 0 && (
                            <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
                                activeTab === 'MEDICAL'
                                    ? 'bg-slate-950 text-rose-400'
                                    : 'bg-rose-500/20 text-rose-400'
                            }`}>
                                {injuredPlayers.length}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            {/* 4 Compact KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <StatCell label="Nivel Staff" value={`${staffAveragePower}/100`} accent="text-[var(--apex-gold)]" />
                <StatCell label="Salarios/sem" value={formatCurrencyShort(totalWeeklyStaffWages)} />
                <StatCell
                    label="Condición media"
                    value={`${avgSquadCondition}%`}
                    accent={avgSquadCondition >= 85 ? 'text-emerald-400' : avgSquadCondition >= 70 ? 'text-amber-400' : 'text-rose-400'}
                />
                <StatCell
                    label="Enfermería"
                    value={injuredPlayers.length === 0 ? '100% Sano' : `${injuredPlayers.length} bajas`}
                    accent={injuredPlayers.length === 0 ? 'text-emerald-400' : 'text-rose-400'}
                />
            </div>

            {/* TAB 1: ORGANIGRAM */}
            {activeTab === 'ORGANIGRAM' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        onFire={coach ? () => setFireModal({
                            type: 'coach',
                            name: coach.name,
                            roleLabel: 'Director Técnico',
                            weeklySalary: coach.salary,
                            severanceCost: coach.salary * 4
                        }) : undefined}
                        extraAction={coach ? (
                            <button
                                type="button"
                                onClick={() => setIsCoachMeetingOpen(true)}
                                title="Reunión con el DT"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Reunión</span>
                            </button>
                        ) : undefined}
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
                        onFire={doctor ? () => setFireModal({
                            type: 'staff',
                            role: 'doctor',
                            name: doctor.name,
                            roleLabel: 'Jefe Médico',
                            weeklySalary: doctor.salary,
                            severanceCost: doctor.salary * 2
                        }) : undefined}
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
                        onFire={fitnessCoach ? () => setFireModal({
                            type: 'staff',
                            role: 'fitness_coach',
                            name: fitnessCoach.name,
                            roleLabel: 'Preparador Físico',
                            weeklySalary: fitnessCoach.salary,
                            severanceCost: fitnessCoach.salary * 2
                        }) : undefined}
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
                        onFire={sportingDirector ? () => setFireModal({
                            type: 'staff',
                            role: 'sporting_director',
                            name: sportingDirector.name,
                            roleLabel: 'Director Deportivo',
                            weeklySalary: sportingDirector.salary,
                            severanceCost: sportingDirector.salary * 2
                        }) : undefined}
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
                        onFire={youthCoach ? () => setFireModal({
                            type: 'staff',
                            role: 'youth_coach',
                            name: youthCoach.name,
                            roleLabel: 'Director de Cantera',
                            weeklySalary: youthCoach.salary,
                            severanceCost: youthCoach.salary * 2
                        }) : undefined}
                    />
                </div>
            )}

            {/* TAB 2: SCOUTING NETWORK */}
            {activeTab === 'SCOUTING' && (
                <div className="space-y-4">
                    <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-sky-400" />
                                <h2 className="text-sm font-black text-white uppercase tracking-wider">Red de Ojeo ({scouts.length}/3)</h2>
                            </div>
                            {scouts.length < 3 && (
                                <button
                                    type="button"
                                    onClick={() => setMarketRole('scout')}
                                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[var(--apex-gold)] hover:brightness-110 text-slate-950 text-xs font-black transition-all cursor-pointer"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>Contratar Ojeador</span>
                                </button>
                            )}
                        </div>

                        {scouts.length === 0 ? (
                            <EmptyState
                                icon={<Search className="w-6 h-6" />}
                                title="Sin ojeadores activos"
                                text="Contrata hasta 3 especialistas para revelar automáticamente el potencial de futbolistas rivales cada semana."
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {scouts.map(sc => (
                                    <div key={sc.id} className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between gap-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-sm font-black text-white truncate">{sc.name}</div>
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 text-[10px] font-bold">
                                                    Especialidad: {sc.specialty || 'General'}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFireModal({
                                                    type: 'scout',
                                                    scoutId: sc.id,
                                                    name: sc.name,
                                                    roleLabel: 'Ojeador',
                                                    weeklySalary: sc.salary,
                                                    severanceCost: 0
                                                })}
                                                title="Desvincular ojeador"
                                                className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors shrink-0 cursor-pointer"
                                            >
                                                <UserMinus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                                            <div>
                                                <span className="text-slate-500 block">Eficiencia</span>
                                                <span className="font-black text-[var(--apex-gold)] tabular-nums">{sc.efficiency}%</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block">Precisión</span>
                                                <span className="font-black text-emerald-400 tabular-nums">{sc.accuracy}%</span>
                                            </div>
                                        </div>

                                        <div className="text-[11px] text-slate-400">
                                            Salario: <strong className="text-white tabular-nums">{formatCurrencyShort(sc.salary)}</strong>/sem
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Scouting Reports */}
                    <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-white uppercase tracking-wider">Informes de Seguimiento</h2>
                            <span className="text-[11px] text-slate-400 font-bold">{Object.keys(scoutedPlayerIds).length} jugadores</span>
                        </div>

                        {scoutedEntries.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center">
                                Tus ojeadores aún no han emitido informes. Contrata un ojeador o inicia un seguimiento desde Fichajes.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {scoutedEntries.map(({ player, teamName, progress }) => (
                                    <button
                                        key={player.id}
                                        type="button"
                                        onClick={() => dispatch({ type: 'SET_VIEWING_PLAYER', payload: player })}
                                        className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 text-left transition-colors cursor-pointer space-y-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-xs font-black text-white truncate">{player.name}</div>
                                                <div className="text-[10px] text-slate-400 truncate">
                                                    {player.position} · {teamName}
                                                </div>
                                            </div>
                                            <span className={`text-xs font-black px-2 py-0.5 rounded-lg shrink-0 tabular-nums ${
                                                progress >= 100
                                                    ? 'bg-emerald-500/15 text-emerald-400'
                                                    : 'bg-[var(--apex-gold)]/15 text-[var(--apex-gold)]'
                                            }`}>
                                                {progress}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-[var(--apex-gold)]'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: MEDICAL & PHYSICAL CONDITION */}
            {activeTab === 'MEDICAL' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="apex-card p-4 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-rose-400" />
                                    <span className="text-xs font-black text-white uppercase tracking-wider">Área Médica</span>
                                </div>
                                <span className="text-xs font-black text-rose-400 tabular-nums">{doctor?.power ?? VACANT_STAFF_POWER} PTS</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{doctorEffect.description}</p>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <StatCell
                                    label="Riesgo lesiones"
                                    value={doctorEffect.injuryReductionPct >= 0 ? `-${doctorEffect.injuryReductionPct}%` : `+${Math.abs(doctorEffect.injuryReductionPct)}%`}
                                    accent={doctorEffect.injuryReductionPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                                />
                                <StatCell label="Cura acelerada 2x" value={`${doctorEffect.recoveryBonusChance}%`} accent="text-sky-400" />
                            </div>
                        </div>

                        <div className="apex-card p-4 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Dumbbell className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-black text-white uppercase tracking-wider">Preparación Física</span>
                                </div>
                                <span className="text-xs font-black text-amber-400 tabular-nums">{fitnessCoach?.power ?? VACANT_STAFF_POWER} PTS</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{fitnessEffect.description}</p>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <StatCell label="Resistencia 90'" value={`-${fitnessEffect.fatigueResistancePct}% fatiga`} accent="text-emerald-400" />
                                <StatCell label="Recuperación" value={`+${12 + fitnessEffect.weeklyRecoveryBonus}/sem`} accent="text-amber-400" />
                            </div>
                        </div>
                    </div>

                    {/* Active Injuries */}
                    <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HeartPulse className="w-4 h-4 text-rose-400" />
                                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                                    Parte Médico ({injuredPlayers.length} {injuredPlayers.length === 1 ? 'baja' : 'bajas'})
                                </h2>
                            </div>
                        </div>

                        {injuredPlayers.length === 0 ? (
                            <EmptyState
                                icon={<HeartPulse className="w-6 h-6 text-emerald-400" />}
                                title="Enfermería vacía"
                                text="Todo el plantel se encuentra físicamente disponible para el entrenador."
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {injuredPlayers.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => dispatch({ type: 'SET_VIEWING_PLAYER', payload: p })}
                                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:border-rose-400/50 text-left transition-colors cursor-pointer"
                                    >
                                        <div className="min-w-0">
                                            <span className="text-xs font-black text-white truncate block">{p.name}</span>
                                            <span className="text-[10px] text-slate-400">{p.position} · {p.rating} OVR</span>
                                        </div>
                                        <span className="text-xs font-black text-rose-400 shrink-0 tabular-nums">
                                            {p.injuryWeeksRemaining || 1} sem
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Squad Physical Load Monitor */}
                    <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-amber-400" />
                                <h2 className="text-sm font-black text-white uppercase tracking-wider">Estado Físico del Plantel</h2>
                            </div>
                            <span className="text-[11px] text-slate-400 font-bold">Mayor desgaste</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {fatiguedPlayers.map(p => {
                                const cond = Math.round(p.condition ?? 100);
                                return (
                                    <div key={p.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-white truncate">{p.name} <span className="text-slate-500">({p.position})</span></span>
                                            <span className={`font-black tabular-nums ${
                                                cond >= 80 ? 'text-emerald-400' : cond >= 60 ? 'text-amber-400' : 'text-rose-400'
                                            }`}>
                                                {cond}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${
                                                    cond >= 80 ? 'bg-emerald-500' : cond >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                                }`}
                                                style={{ width: `${cond}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                scoutCandidates={scoutPool}
                hiredScoutIds={hiredScoutIds}
                canRefreshMarket={canRefreshMarket}
                onRefreshMarket={handleRefreshMarket}
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

            {/* Impact Guide Modal */}
            <StaffGuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
            />

            {/* Coach Meeting Modal */}
            {coach && (
                <CoachMeetingModal
                    isOpen={isCoachMeetingOpen}
                    onClose={() => setIsCoachMeetingOpen(false)}
                    report={activeCoachReport}
                    coachName={coach.name}
                    onApprovePromotion={handleApprovePromotion}
                    dispatch={dispatch}
                    squadSize={team.squad.length}
                    balance={finances.balance}
                />
            )}
        </div>
    );
});
