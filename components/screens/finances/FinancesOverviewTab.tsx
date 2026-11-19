import React, { useMemo } from 'react';
import { FinancialBreakdown, FinancialHealthEvaluation } from '../../../services/economy';
import { formatCurrency, formatCurrencyShort } from '../../../utils';
import { Coins, CreditCard, TrendingUp, TrendingDown, Landmark, Sparkles, ArrowRightLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
    const totalIncome = breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.tvRevenue + (breakdown.merchandisingRevenue || 0) + (breakdown.transferRevenue || 0);
    const totalExpenses = breakdown.wageExpenses + breakdown.coachExpenses + breakdown.stadiumExpenses + breakdown.operationalExpenses + (breakdown.loanExpenses || 0) + (breakdown.youthAcademyExpenses || 0) + (breakdown.merchandisingExpenses || 0) + (breakdown.winBonusExpenses || 0);

    // SVG Sparkline path
    const sparklinePath = useMemo(() => {
        if (!balanceHistory || balanceHistory.length < 2) return null;
        const pts = balanceHistory.slice(-20);
        const min = Math.min(...pts);
        const max = Math.max(...pts);
        const range = max - min || 1;
        const width = 280;
        const height = 40;

        const points = pts.map((val, idx) => {
            const x = (idx / (pts.length - 1)) * width;
            const y = height - ((val - min) / range) * (height - 8) - 4;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');

        return points;
    }, [balanceHistory]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 4 Hero KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Tesorería */}
                <div className="apex-card p-5 border-t-2 border-emerald-500 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Tesorería General</span>
                        <Coins className="w-4 h-4 text-emerald-400 opacity-80" />
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            {formatCurrencyShort(balance)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                            Liquidez disponible en caja
                        </div>
                    </div>
                    {sparklinePath && (
                        <div className="mt-3 pt-2 border-t border-white/5">
                            <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Tendencia Reciente</div>
                            <svg className="w-full h-8 overflow-visible" viewBox="0 0 280 40">
                                <polyline
                                    fill="none"
                                    stroke="#10B981"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={sparklinePath}
                                />
                            </svg>
                        </div>
                    )}
                </div>

                {/* 2. Presupuesto Fichajes */}
                <div className="apex-card p-5 border-t-2 border-[var(--apex-gold)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)]">Presupuesto Fichajes</span>
                        <CreditCard className="w-4 h-4 text-[var(--apex-gold)] opacity-80" />
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            {formatCurrencyShort(transferBudget)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                            Fondo asignado para traspasos
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">Límite operativo</span>
                        <button
                            onClick={onNavigateToStrategy}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--apex-gold)] hover:underline cursor-pointer"
                        >
                            Reasignar <ArrowRightLeft className="w-2.5 h-2.5" />
                        </button>
                    </div>
                </div>

                {/* 3. Flujo Neto Semanal */}
                <div className={`apex-card p-5 border-t-2 ${netIncome >= 0 ? 'border-emerald-500' : 'border-rose-500'} flex flex-col justify-between`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Flujo Semanal</span>
                        {netIncome >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                    </div>
                    <div>
                        <div className={`text-2xl sm:text-3xl font-black tracking-tight ${netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {netIncome >= 0 ? '+' : ''}{formatCurrencyShort(netIncome)}
                            <span className="text-xs font-normal text-slate-500">/sem</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {netIncome >= 0 ? 'Superávit operativo' : 'Déficit operativo'}
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400">
                        <span>Sin taquilla local:</span>
                        <strong className={netIncomeWithoutMatchday >= 0 ? 'text-slate-200' : 'text-rose-400'}>
                            {netIncomeWithoutMatchday >= 0 ? '+' : ''}{formatCurrencyShort(netIncomeWithoutMatchday)}/sem
                        </strong>
                    </div>
                </div>

                {/* 4. Deuda Bancaria */}
                <div className={`apex-card p-5 border-t-2 ${totalDebt > 0 ? 'border-amber-500' : 'border-emerald-500'} flex flex-col justify-between`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Deuda Bancaria</span>
                        <Landmark className="w-4 h-4 text-slate-400 opacity-80" />
                    </div>
                    <div>
                        <div className={`text-2xl sm:text-3xl font-black tracking-tight ${totalDebt > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {totalDebt > 0 ? formatCurrencyShort(totalDebt) : '0 €'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {totalDebt > 0 ? `${activeLoansCount} préstamos activos` : 'Sin pasivo financiero'}
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">Líneas de crédito</span>
                        <button
                            onClick={onNavigateToBanking}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:underline cursor-pointer"
                        >
                            Ver Préstamos →
                        </button>
                    </div>
                </div>
            </div>

            {/* Detailed Comparative Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ingresos Semanales */}
                <div className="apex-card p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Ingresos Semanales
                        </h3>
                        <span className="text-sm font-black text-emerald-400">
                            {formatCurrencyShort(totalIncome)}/sem
                        </span>
                    </div>

                    <div className="space-y-3.5">
                        {/* Taquilla */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium">Taquilla & Entradas (Día de Partido)</span>
                                <span className="font-bold text-white">{formatCurrencyShort(breakdown.matchdayRevenue)}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${totalIncome > 0 ? Math.min(100, Math.round((breakdown.matchdayRevenue / totalIncome) * 100)) : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Patrocinios */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium">Patrocinios Comerciales</span>
                                <span className="font-bold text-white">{formatCurrencyShort(breakdown.sponsorshipRevenue)}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-[var(--apex-gold)] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${totalIncome > 0 ? Math.min(100, Math.round((breakdown.sponsorshipRevenue / totalIncome) * 100)) : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Derechos TV */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium">Derechos Televisivos Oficiales</span>
                                <span className="font-bold text-white">{formatCurrencyShort(breakdown.tvRevenue)}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-sky-400 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${totalIncome > 0 ? Math.min(100, Math.round((breakdown.tvRevenue / totalIncome) * 100)) : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Merchandising */}
                        {(breakdown.merchandisingRevenue || 0) > 0 && (
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-300 font-medium">Merchandising & Camisetas</span>
                                    <span className="font-bold text-white">{formatCurrencyShort(breakdown.merchandisingRevenue || 0)}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-purple-400 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${totalIncome > 0 ? Math.min(100, Math.round(((breakdown.merchandisingRevenue || 0) / totalIncome) * 100)) : 0}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gastos Semanales */}
                <div className="apex-card p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <h3 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                            Gastos Semanales
                        </h3>
                        <span className="text-sm font-black text-rose-400">
                            {formatCurrencyShort(totalExpenses)}/sem
                        </span>
                    </div>

                    <div className="space-y-3.5">
                        {/* Sueldos Plantilla */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium">Masa Salarial (Futbolistas)</span>
                                <span className="font-bold text-white">{formatCurrencyShort(breakdown.wageExpenses)}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${totalExpenses > 0 ? Math.min(100, Math.round((breakdown.wageExpenses / totalExpenses) * 100)) : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Cuerpo Técnico & Personal */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium">Cuerpo Técnico, Especialistas & Ojeadores</span>
                                <span className="font-bold text-white">{formatCurrencyShort(breakdown.coachExpenses)}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-orange-400 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${totalExpenses > 0 ? Math.min(100, Math.round((breakdown.coachExpenses / totalExpenses) * 100)) : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Mantenimiento Estadio */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium">Mantenimiento de Infraestructura</span>
                                <span className="font-bold text-white">{formatCurrencyShort(breakdown.stadiumExpenses)}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${totalExpenses > 0 ? Math.min(100, Math.round((breakdown.stadiumExpenses / totalExpenses) * 100)) : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Operativos */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium">Costes Operativos & Logística</span>
                                <span className="font-bold text-white">{formatCurrencyShort(breakdown.operationalExpenses)}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-slate-400 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${totalExpenses > 0 ? Math.min(100, Math.round((breakdown.operationalExpenses / totalExpenses) * 100)) : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Préstamos si hay */}
                        {(breakdown.loanExpenses || 0) > 0 && (
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-amber-400 font-medium">Amortización Bancaria</span>
                                    <span className="font-bold text-amber-400">{formatCurrencyShort(breakdown.loanExpenses || 0)}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${totalExpenses > 0 ? Math.min(100, Math.round(((breakdown.loanExpenses || 0) / totalExpenses) * 100)) : 0}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Cantera si hay */}
                        {(breakdown.youthAcademyExpenses || 0) > 0 && (
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-emerald-400 font-medium">Inversión en Fuerzas Básicas</span>
                                    <span className="font-bold text-emerald-400">{formatCurrencyShort(breakdown.youthAcademyExpenses || 0)}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${totalExpenses > 0 ? Math.min(100, Math.round(((breakdown.youthAcademyExpenses || 0) / totalExpenses) * 100)) : 0}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* End of Season Projection */}
            <div className="apex-card p-5 sm:p-6 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/20 text-[var(--apex-gold)] shrink-0 mt-0.5">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black uppercase tracking-wider text-white">Proyección Financiera de Cierre</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider" style={{ backgroundColor: `${health.color}20`, color: health.color, border: `1px solid ${health.color}40` }}>
                                {health.grade} · {health.label}
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            Al ritmo operativo actual, se proyecta un balance a final de temporada de{' '}
                            <strong className={health.projectedEndBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {formatCurrency(health.projectedEndBalance)}
                            </strong>{' '}
                            (sin computar primas extraordinarias por título de liga/copa o ventas de jugadores).
                        </p>
                    </div>
                </div>
                <button
                    onClick={onNavigateToStrategy}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                >
                    Ajustar Políticas
                </button>
            </div>
        </div>
    );
});
