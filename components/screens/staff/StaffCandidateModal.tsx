import React from 'react';
import { Coach, StaffMember, Scout } from '../../../types';
import { formatCurrencyShort } from '../../../utils';
import { X, ArrowUpRight, ArrowDownRight, Check, AlertCircle } from 'lucide-react';

export type MarketRoleType = 'coach' | 'doctor' | 'fitness_coach' | 'sporting_director' | 'youth_coach' | 'scout';

interface StaffCandidateModalProps {
    isOpen: boolean;
    roleType: MarketRoleType | null;
    roleTitle: string;
    balance: number;
    currentCoach?: Coach;
    currentStaff?: StaffMember;
    coachCandidates: Coach[];
    staffCandidates: StaffMember[];
    scoutCandidates: Scout[];
    hiredScoutIds: Set<string>;
    onClose: () => void;
    onHireCoach: (coach: Coach) => void;
    onHireStaff: (staff: StaffMember) => void;
    onHireScout: (scout: Scout) => void;
}

const STYLE_ES: Record<string, string> = {
    Attacking: 'Ofensivo',
    Defensive: 'Defensivo',
    Possession: 'Posesión',
    Counter: 'Contraataque',
    Balanced: 'Equilibrado',
};

export const StaffCandidateModal: React.FC<StaffCandidateModalProps> = React.memo(({
    isOpen,
    roleType,
    roleTitle,
    balance,
    currentCoach,
    currentStaff,
    coachCandidates,
    staffCandidates,
    scoutCandidates,
    hiredScoutIds,
    onClose,
    onHireCoach,
    onHireStaff,
    onHireScout,
}) => {
    if (!isOpen || !roleType) return null;

    const currentPower = roleType === 'coach'
        ? (currentCoach?.prestige ?? 40)
        : roleType === 'scout'
        ? 0
        : (currentStaff?.power ?? 40);

    const currentSalary = roleType === 'coach'
        ? (currentCoach?.salary ?? 0)
        : roleType === 'scout'
        ? 0
        : (currentStaff?.salary ?? 0);

    const renderDelta = (diff: number, suffix = '', invertColor = false) => {
        if (diff === 0) return <span className="text-slate-400 text-xs">Igual</span>;
        const isPositive = diff > 0;
        const isGood = invertColor ? !isPositive : isPositive;
        return (
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {isPositive ? `+${diff}${suffix}` : `${diff}${suffix}`}
            </span>
        );
    };

    const sortedCoaches = [...coachCandidates].sort((a, b) => b.prestige - a.prestige);
    const sortedStaff = [...staffCandidates].sort((a, b) => b.power - a.power);
    const availableScouts = scoutCandidates
        .filter(s => !hiredScoutIds.has(s.id))
        .sort((a, b) => b.efficiency - a.efficiency);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-white/15 bg-slate-900 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/60">
                    <div>
                        <h2 className="text-base font-bold text-white">Mercado: {roleTitle}</h2>
                        <p className="text-xs text-slate-400">Presupuesto disponible: <span className="text-emerald-400 font-semibold">{formatCurrencyShort(balance)}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Current Holder Banner */}
                {roleType !== 'scout' && (
                    <div className="px-5 py-3 bg-white/[0.03] border-b border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                            Titular actual:{' '}
                            <strong className="text-white">
                                {roleType === 'coach'
                                    ? (currentCoach ? `${currentCoach.name} (${currentCoach.prestige} PTS)` : 'Vacante (40 PTS)')
                                    : (currentStaff ? `${currentStaff.name} (${currentStaff.power} PTS)` : 'Vacante (40 PTS)')}
                            </strong>
                        </span>
                        {currentSalary > 0 && (
                            <span className="text-slate-400">{formatCurrencyShort(currentSalary)}/sem</span>
                        )}
                    </div>
                )}

                {/* Candidate List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                    {roleType === 'coach' && sortedCoaches.map(c => {
                        const canAfford = balance >= c.signingBonus;
                        const powerDiff = c.prestige - currentPower;
                        const salaryDiff = c.salary - currentSalary;
                        return (
                            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/10 bg-slate-950/50 hover:border-white/20 transition-colors">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-white truncate">{c.name}</span>
                                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-semibold">
                                            {STYLE_ES[c.style] || c.style} · {c.preferredFormation}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                                        <span>Nivel: <strong className="text-white">{c.prestige}</strong> ({renderDelta(powerDiff, ' PTS')})</span>
                                        <span>Salario: <strong className="text-white">{formatCurrencyShort(c.salary)}</strong>/sem ({renderDelta(Math.round(salaryDiff / 1000), 'K', true)})</span>
                                    </div>
                                </div>
                                <button
                                    disabled={!canAfford}
                                    onClick={() => { onHireCoach(c); onClose(); }}
                                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                                        canAfford
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                >
                                    {canAfford ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                    Fichar ({formatCurrencyShort(c.signingBonus)})
                                </button>
                            </div>
                        );
                    })}

                    {roleType !== 'coach' && roleType !== 'scout' && sortedStaff.map(s => {
                        const canAfford = balance >= s.hiringFee;
                        const powerDiff = s.power - currentPower;
                        const salaryDiff = s.salary - currentSalary;
                        return (
                            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/10 bg-slate-950/50 hover:border-white/20 transition-colors">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-white truncate">{s.name}</span>
                                        <span className="text-[11px] text-slate-400 truncate">{s.nationality}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{s.specialty}</div>
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                                        <span>Nivel: <strong className="text-white">{s.power}</strong> ({renderDelta(powerDiff, ' PTS')})</span>
                                        <span>Salario: <strong className="text-white">{formatCurrencyShort(s.salary)}</strong>/sem ({renderDelta(Math.round(salaryDiff / 1000), 'K', true)})</span>
                                    </div>
                                </div>
                                <button
                                    disabled={!canAfford}
                                    onClick={() => { onHireStaff(s); onClose(); }}
                                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                                        canAfford
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                >
                                    {canAfford ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                    Contratar ({formatCurrencyShort(s.hiringFee)})
                                </button>
                            </div>
                        );
                    })}

                    {roleType === 'scout' && availableScouts.map(sc => {
                        const canAfford = balance >= sc.hiringFee;
                        return (
                            <div key={sc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/10 bg-slate-950/50 hover:border-white/20 transition-colors">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-white truncate">{sc.name}</span>
                                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 font-semibold">
                                            Especialidad: {sc.specialty || 'General'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                                        <span>Eficiencia: <strong className="text-white">{sc.efficiency}</strong></span>
                                        <span>Precisión: <strong className="text-white">{sc.accuracy}%</strong></span>
                                        <span>Salario: <strong className="text-white">{formatCurrencyShort(sc.salary)}</strong>/sem</span>
                                    </div>
                                </div>
                                <button
                                    disabled={!canAfford}
                                    onClick={() => { onHireScout(sc); onClose(); }}
                                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                                        canAfford
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                >
                                    {canAfford ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                    Contratar ({formatCurrencyShort(sc.hiringFee)})
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});
