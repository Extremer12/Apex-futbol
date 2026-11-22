import React from 'react';
import { BankLoan } from '../../../types';
import { formatCurrencyShort } from '../../../utils';
import { Landmark, Coins, CheckCircle2 } from 'lucide-react';
import { EmptyState, StatCell } from '../transfers/TransferUI';

interface FinancesBankingTabProps {
    activeLoans: BankLoan[];
    availableLoans: BankLoan[];
    balance: number;
    onRequestTakeLoan: (loan: BankLoan) => void;
    onRequestRepayLoan: (loan: BankLoan) => void;
}

export const FinancesBankingTab: React.FC<FinancesBankingTabProps> = React.memo(({
    activeLoans,
    availableLoans,
    balance,
    onRequestTakeLoan,
    onRequestRepayLoan
}) => {
    return (
        <div className="space-y-5">
            {/* Active Loans */}
            <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[var(--apex-gold)]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Préstamos Vigentes ({activeLoans.length})
                    </h3>
                </div>

                {activeLoans.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeLoans.map(loan => (
                            <div key={loan.id} className="apex-card p-4 rounded-2xl space-y-3 border-l-2 border-l-amber-500 flex flex-col justify-between">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Activo</span>
                                        <div className="text-sm font-black text-white truncate">{loan.name}</div>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                        {loan.remainingWeeks} sem
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <StatCell label="Pendiente" value={formatCurrencyShort(loan.remainingAmount)} accent="text-amber-400" />
                                    <StatCell label="Cuota/sem" value={formatCurrencyShort(loan.weeklyPayment)} accent="text-rose-400" />
                                    <StatCell label="Interés" value={`${(loan.interestRate * 100).toFixed(1)}%`} />
                                </div>

                                <button
                                    onClick={() => onRequestRepayLoan(loan)}
                                    disabled={balance < loan.remainingAmount}
                                    className={`w-full h-10 rounded-xl font-black text-xs uppercase tracking-wider transition-colors ${
                                        balance >= loan.remainingAmount
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                                            : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                                    }`}
                                >
                                    Liquidar ({formatCurrencyShort(loan.remainingAmount)})
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="apex-card rounded-2xl">
                        <EmptyState
                            icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                            title="Sin deuda bancaria activa"
                            text="El club no tiene créditos vigentes ni cuotas semanales de amortización."
                        />
                    </div>
                )}
            </section>

            {/* Available Loan Offers */}
            <section className="space-y-2.5">
                <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[var(--apex-gold)]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Líneas de Financiación Disponibles
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {availableLoans.map(loan => (
                        <div key={loan.id} className="apex-card p-4 rounded-2xl flex flex-col justify-between space-y-3 hover:border-[var(--apex-gold)]/40 transition-colors">
                            <div className="space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="font-black text-sm text-white">{loan.name}</div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/5 text-slate-400 shrink-0">
                                        {loan.remainingWeeks} sem
                                    </span>
                                </div>

                                <div className="text-xl font-black text-emerald-400 tabular-nums">
                                    +{formatCurrencyShort(loan.principal)}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <StatCell label="Cuota/sem" value={formatCurrencyShort(loan.weeklyPayment)} accent="text-rose-400" />
                                    <StatCell label="Devolución" value={formatCurrencyShort(loan.remainingAmount)} />
                                </div>
                            </div>

                            <button
                                onClick={() => onRequestTakeLoan(loan)}
                                className="w-full h-10 rounded-xl bg-[var(--apex-gold)]/15 hover:bg-[var(--apex-gold)] text-[var(--apex-gold)] hover:text-slate-950 font-black text-xs uppercase tracking-wider transition-colors border border-[var(--apex-gold)]/30 cursor-pointer"
                            >
                                Solicitar Crédito ({(loan.interestRate * 100).toFixed(1)}%)
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
});
