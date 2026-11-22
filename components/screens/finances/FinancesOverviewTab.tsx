import React, { useMemo } from 'react';
import { FinancialBreakdown, FinancialHealthEvaluation } from '../../../services/economy';
import { formatCurrencyShort } from '../../../utils';
import {
    Coins,
    CreditCard,
    TrendingUp,
    TrendingDown,
    Landmark,
    ArrowRightLeft,
    ChevronRight
} from 'lucide-react';

interface FinancesOverviewTabProps {
    balance: number;
    transferBudget: number;
    netIncome: number;
    netIncomeWithoutMatchday: number;
    totalDebt: number;
    activeLoansCount: number;
    breakdown: FinancialBreakdown;
    health: FinancialHealthEvaluation;
    balanceHistory: number[];
    onNavigateToStrategy: () => void;
    onNavigateToBanking: () => void;
}

const BreakdownBar: React.FC<{
    label: string;
    amount: number;
    total: number;
    barClass: string;
}> = ({ label, amount, total, barClass }) => {
    const pct = total > 0 ? Math.min(100, Math.round((amount / total) * 100)) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium truncate pr-2">{label}</span>
                <span className="font-bold text-white shrink-0 tabular-nums">{formatCurrencyShort(amount)}</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className={`${barClass} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

export const FinancesOverviewTab: React.FC<FinancesOverviewTabProps> = React.memo(({
    balance,
    transferBudget,
    netIncome,
    netIncomeWithoutMatchday,
    totalDebt,
    activeLoansCount,
    breakdown,
    health,
    balanceHistory,
    onNavigateToStrategy,
    onNavigateToBanking
}) => {
    const totalIncome =
        breakdown.matchdayRevenue +
        breakdown.sponsorshipRevenue +
        breakdown.tvRevenue +
        (breakdown.merchandisingRevenue || 0) +
        (breakdown.transferRevenue || 0);

    const totalExpenses =
        breakdown.wageExpenses +
        breakdown.coachExpenses +
        breakdown.stadiumExpenses +
        breakdown.operationalExpenses +
        (breakdown.loanExpenses || 0) +
        (breakdown.youthAcademyExpenses || 0) +
        (breakdown.merchandisingExpenses || 0) +
        (breakdown.winBonusExpenses || 0);

    const sparklinePath = useMemo(() => {
        if (!balanceHistory || balanceHistory.length < 2) return null;
        const pts = balanceHistory.slice(-20);
        const min = Math.min(...pts);
        const max = Math.max(...pts);
        const range = max - min || 1;
        const width = 220;
        const height = 28;
        return pts
            .map((val, idx) => {
                const x = (idx / (pts.length - 1)) * width;
                const y = height - ((val - min) / range) * (height - 6) - 3;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');
    }, [balanceHistory]);

    return (
        <div className="space-y-4">
            {/* 4 Compact KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="apex-card p-3.5 rounded-2xl border-t-2 border-emerald-500 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Tesorería</span>
                        <Coins className="w-3.5 h-3.5 text-emerald-400 opacity-80" />
                    </div>
                    <div className="text-lg sm:text-xl font-black text-white tracking-tight tabular-nums">
                        {formatCurrencyShort(balance)}
                    </div>
                    {sparklinePath ? (
                        <svg className="w-full h-6 mt-2 overflow-visible" viewBox="0 0 220 28">
                            <polyline
                                fill="none"
                                stroke={balance >= 0 ? '#10B981' : '#F43F5E'}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={sparklinePath}
                            />
                        </svg>
                    ) : (
                        <span className="text-[10px] text-slate-500 mt-1">Liquidez en caja</span>
                    )}
                </div>

                <div className="apex-card p-3.5 rounded-2xl border-t-2 border-[var(--apex-gold)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)]">Fichajes</span>
                        <CreditCard className="w-3.5 h-3.5 text-[var(--apex-gold)] opacity-80" />
                    </div>
                    <div className="text-lg sm:text-xl font-black text-white tracking-tight tabular-nums">
                        {formatCurrencyShort(transferBudget)}
                    </div>
                    <button
                        onClick={onNavigateToStrategy}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--apex-gold)] hover:underline cursor-pointer"
                    >
                        <span>Reasignar</span>
                        <ArrowRightLeft className="w-2.5 h-2.5" />
                    </button>
                </div>

                <div className={`apex-card p-3.5 rounded-2xl border-t-2 ${netIncome >= 0 ? 'border-emerald-500' : 'border-rose-500'} flex flex-col justify-between`}>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Flujo/sem</span>
                        {netIncome >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        )}
                    </div>
                    <div className={`text-lg sm:text-xl font-black tracking-tight tabular-nums ${netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {netIncome >= 0 ? '+' : ''}{formatCurrencyShort(netIncome)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 truncate">
                        Base: <strong className={netIncomeWithoutMatchday >= 0 ? 'text-slate-200' : 'text-rose-400'}>
                            {netIncomeWithoutMatchday >= 0 ? '+' : ''}{formatCurrencyShort(netIncomeWithoutMatchday)}
                        </strong>
                    </div>
                </div>

                <div className={`apex-card p-3.5 rounded-2xl border-t-2 ${totalDebt > 0 ? 'border-amber-500' : 'border-emerald-500'} flex flex-col justify-between`}>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Deuda</span>
                        <Landmark className="w-3.5 h-3.5 text-slate-400 opacity-80" />
                    </div>
                    <div className={`text-lg sm:text-xl font-black tracking-tight tabular-nums ${totalDebt > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {totalDebt > 0 ? formatCurrencyShort(totalDebt) : 'Sin deuda'}
                    </div>
                    <button
                        onClick={onNavigateToBanking}
                        className="mt-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-400 hover:underline cursor-pointer"
                    >
                        <span>{activeLoansCount > 0 ? `${activeLoansCount} activos` : 'Ver banca'}</span>
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Solvency & Fair Play Summary Strip */}
            <div className="apex-card p-3.5 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                        style={{ backgroundColor: `${health.color}20`, color: health.color, border: `1px solid ${health.color}40` }}
                    >
                        {health.grade}
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate">Solvencia: {health.label}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                            {health.fairPlayCompliant ? 'Fair Play Financiero en regla' : 'Fair Play Financiero bajo advertencia'}
                        </div>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 border ${
                    health.fairPlayCompliant
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                    {health.fairPlayCompliant ? 'Aprobado' : 'En riesgo'}
                </span>
            </div>

            {/* Income vs Expenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">Ingresos Semanales</h3>
                        <span className="text-sm font-black text-emerald-400 tabular-nums">{formatCurrencyShort(totalIncome)}/sem</span>
                    </div>
                    <div className="space-y-3">
                        <BreakdownBar label="Taquilla (Día de partido)" amount={breakdown.matchdayRevenue} total={totalIncome} barClass="bg-emerald-400" />
                        <BreakdownBar label="Patrocinios comerciales" amount={breakdown.sponsorshipRevenue} total={totalIncome} barClass="bg-[var(--apex-gold)]" />
                        <BreakdownBar label="Derechos de TV" amount={breakdown.tvRevenue} total={totalIncome} barClass="bg-sky-400" />
                        {(breakdown.merchandisingRevenue || 0) > 0 && (
                            <BreakdownBar label="Merchandising y camisetas" amount={breakdown.merchandisingRevenue || 0} total={totalIncome} barClass="bg-purple-400" />
                        )}
                    </div>
                </div>

                <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                        <h3 className="text-xs font-black uppercase tracking-wider text-rose-400">Gastos Semanales</h3>
                        <span className="text-sm font-black text-rose-400 tabular-nums">{formatCurrencyShort(totalExpenses)}/sem</span>
                    </div>
                    <div className="space-y-3">
                        <BreakdownBar label="Salarios del plantel" amount={breakdown.wageExpenses} total={totalExpenses} barClass="bg-rose-500" />
                        <BreakdownBar label="Cuerpo técnico y ojeo" amount={breakdown.coachExpenses} total={totalExpenses} barClass="bg-orange-400" />
                        <BreakdownBar label="Mantenimiento estadio" amount={breakdown.stadiumExpenses} total={totalExpenses} barClass="bg-amber-400" />
                        <BreakdownBar label="Operativos y logística" amount={breakdown.operationalExpenses} total={totalExpenses} barClass="bg-slate-400" />
                        {(breakdown.loanExpenses || 0) > 0 && (
                            <BreakdownBar label="Cuotas de préstamos" amount={breakdown.loanExpenses || 0} total={totalExpenses} barClass="bg-rose-400" />
                        )}
                        {(breakdown.youthAcademyExpenses || 0) > 0 && (
                            <BreakdownBar label="Inversión en cantera" amount={breakdown.youthAcademyExpenses || 0} total={totalExpenses} barClass="bg-sky-400" />
                        )}
                        {(breakdown.merchandisingExpenses || 0) > 0 && (
                            <BreakdownBar label="Campañas comerciales" amount={breakdown.merchandisingExpenses || 0} total={totalExpenses} barClass="bg-purple-400" />
                        )}
                        {(breakdown.winBonusExpenses || 0) > 0 && (
                            <BreakdownBar label="Primas por victoria" amount={breakdown.winBonusExpenses || 0} total={totalExpenses} barClass="bg-emerald-400" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
