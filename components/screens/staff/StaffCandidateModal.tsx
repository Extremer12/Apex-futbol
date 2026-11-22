import React, { useMemo } from 'react';
import { Coach, StaffMember, Scout } from '../../../types';
import { formatCurrencyShort } from '../../../utils';
import { ArrowUpRight, ArrowDownRight, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { BottomSheet, StatCell } from '../transfers/TransferUI';
import { STYLE_ES } from './staffUiTypes';

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
    canRefreshMarket: boolean;
    onRefreshMarket: () => void;
    onClose: () => void;
    onHireCoach: (coach: Coach) => void;
    onHireStaff: (staff: StaffMember) => void;
    onHireScout: (scout: Scout) => void;
}

const renderDelta = (diff: number, suffix = '', invertColor = false) => {
    if (diff === 0) return <span className="text-slate-500 text-[11px]">Igual</span>;
    const isPositive = diff > 0;
    const isGood = invertColor ? !isPositive : isPositive;
    return (
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {isPositive ? `+${diff}${suffix}` : `${diff}${suffix}`}
        </span>
    );
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
    canRefreshMarket,
    onRefreshMarket,
    onClose,
    onHireCoach,
    onHireStaff,
    onHireScout,
}) => {
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

    const sortedCoaches = useMemo(() => [...coachCandidates].sort((a, b) => b.prestige - a.prestige), [coachCandidates]);
    const sortedStaff = useMemo(() => [...staffCandidates].sort((a, b) => b.power - a.power), [staffCandidates]);
    const availableScouts = useMemo(
        () => scoutCandidates.filter(s => !hiredScoutIds.has(s.id)).sort((a, b) => (b.efficiency + b.accuracy) - (a.efficiency + a.accuracy)),
        [scoutCandidates, hiredScoutIds]
    );

    const currentHolderLabel = roleType === 'coach'
        ? (currentCoach ? `${currentCoach.name} (${currentCoach.prestige} PTS)` : 'Vacante (40 PTS)')
        : (currentStaff ? `${currentStaff.name} (${currentStaff.power} PTS)` : 'Vacante (40 PTS)');

    return (
        <BottomSheet
            open={isOpen && roleType !== null}
            onClose={onClose}
            size="lg"
            title={roleType ? `Mercado · ${roleTitle}` : undefined}
            footer={
                <div className="flex items-center justify-between gap-2">
                    <button
                        type="button"
                        disabled={!canRefreshMarket}
                        onClick={onRefreshMarket}
                        className={`h-10 px-3.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-colors ${
                            canRefreshMarket
                                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white cursor-pointer'
                                : 'bg-white/[0.02] border-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{canRefreshMarket ? 'Actualizar cartera' : 'Actualizado esta semana'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
            }
        >
            {roleType && (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <StatCell
                            label="Disponible"
                            value={formatCurrencyShort(balance)}
                            accent="text-emerald-400"
                        />
                        {roleType !== 'scout' ? (
                            <StatCell
                                label="Titular actual"
                                value={<span className="truncate block text-xs font-bold text-white">{currentHolderLabel}</span>}
                            />
                        ) : (
                            <StatCell
                                label="Modalidad"
                                value="Red de ojeo"
                                accent="text-sky-400"
                            />
                        )}
                    </div>

                    <div className="space-y-2.5">
                        {roleType === 'coach' && sortedCoaches.map(c => {
                            const canAfford = balance >= c.signingBonus;
                            const powerDiff = c.prestige - currentPower;
                            const salaryDiff = c.salary - currentSalary;
                            return (
                                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-white truncate">{c.name}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-semibold">
                                                {STYLE_ES[c.style] || c.style} · {c.preferredFormation}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                                            <span>Nivel: <strong className="text-white tabular-nums">{c.prestige}</strong> ({renderDelta(powerDiff, ' PTS')})</span>
                                            <span>Salario: <strong className="text-white tabular-nums">{formatCurrencyShort(c.salary)}</strong>/sem ({renderDelta(Math.round(salaryDiff / 1000), 'K', true)})</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!canAfford}
                                        onClick={() => { onHireCoach(c); onClose(); }}
                                        className={`shrink-0 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-xs font-black transition-colors ${
                                            canAfford
                                                ? 'bg-[var(--apex-gold)] hover:brightness-110 text-slate-950 cursor-pointer'
                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {canAfford ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                        <span>Fichar · {formatCurrencyShort(c.signingBonus)}</span>
                                    </button>
                                </div>
                            );
                        })}

                        {roleType !== 'coach' && roleType !== 'scout' && sortedStaff.map(s => {
                            const canAfford = balance >= s.hiringFee;
                            const powerDiff = s.power - currentPower;
                            const salaryDiff = s.salary - currentSalary;
                            return (
                                <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-white truncate">{s.name}</span>
                                            {s.nationality && (
                                                <span className="text-[11px] text-slate-400 truncate">{s.nationality}</span>
                                            )}
                                        </div>
                                        {s.specialty && (
                                            <div className="text-[11px] text-slate-400 truncate mt-0.5">{s.specialty}</div>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                                            <span>Nivel: <strong className="text-white tabular-nums">{s.power}</strong> ({renderDelta(powerDiff, ' PTS')})</span>
                                            <span>Salario: <strong className="text-white tabular-nums">{formatCurrencyShort(s.salary)}</strong>/sem ({renderDelta(Math.round(salaryDiff / 1000), 'K', true)})</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!canAfford}
                                        onClick={() => { onHireStaff(s); onClose(); }}
                                        className={`shrink-0 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-xs font-black transition-colors ${
                                            canAfford
                                                ? 'bg-[var(--apex-gold)] hover:brightness-110 text-slate-950 cursor-pointer'
                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {canAfford ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                        <span>Contratar · {formatCurrencyShort(s.hiringFee)}</span>
                                    </button>
                                </div>
                            );
                        })}

                        {roleType === 'scout' && availableScouts.map(sc => {
                            const canAfford = balance >= sc.hiringFee;
                            return (
                                <div key={sc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-white truncate">{sc.name}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 font-semibold">
                                                Especialidad: {sc.specialty || 'General'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                                            <span>Eficiencia: <strong className="text-white tabular-nums">{sc.efficiency}</strong></span>
                                            <span>Precisión: <strong className="text-white tabular-nums">{sc.accuracy}%</strong></span>
                                            <span>Salario: <strong className="text-white tabular-nums">{formatCurrencyShort(sc.salary)}</strong>/sem</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!canAfford}
                                        onClick={() => { onHireScout(sc); onClose(); }}
                                        className={`shrink-0 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-xs font-black transition-colors ${
                                            canAfford
                                                ? 'bg-[var(--apex-gold)] hover:brightness-110 text-slate-950 cursor-pointer'
                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {canAfford ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                        <span>Contratar · {formatCurrencyShort(sc.hiringFee)}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </BottomSheet>
    );
});
