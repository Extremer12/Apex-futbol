import React from 'react';
import { BankLoan } from '../../../types';
import { formatCurrency, formatCurrencyShort } from '../../../utils';
import { Landmark, Coins, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';

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
        <div className="space-y-8 animate-fade-in">
            {/* Active Loans Section */}
            <div>
                <div className="mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[var(--apex-gold)] flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-[var(--apex-gold)]" />
                        Deuda Bancaria y Préstamos Vigentes ({activeLoans.length})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Amortizaciones semanales fijas deducidas de la tesorería. Si cuentas con liquidez, puedes cancelar cualquier crédito sin penalización.
                    </p>
                </div>

                {activeLoans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeLoans.map(loan => (
                            <div key={loan.id} className="apex-card p-5 space-y-4 border-l-4 border-l-amber-500 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Préstamo Activo</span>
                                            <div className="text-base font-bold text-white">{loan.name}</div>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            {loan.remainingWeeks} sem rest.
                                        </span>
                                    </div>

                                    <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Capital Pendiente:</span>
                                            <span className="font-bold text-amber-400">{formatCurrency(loan.remainingAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Cuota Semanal:</span>
                                            <span className="font-bold text-rose-400">{formatCurrency(loan.weeklyPayment)}/sem</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Tasa Interés:</span>
                                            <span className="font-bold text-white">{(loan.interestRate * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onRequestRepayLoan(loan)}
                                    disabled={balance < loan.remainingAmount}
                                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md ${
                                        balance >= loan.remainingAmount
                                            ? 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 cursor-pointer'
                                            : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                                    }`}
                                >
                                    Liquidar Deuda ({formatCurrencyShort(loan.remainingAmount)})
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="apex-card p-8 text-center border-dashed border-white/10 space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
                        <div className="text-xs font-black uppercase tracking-wider text-white">Sin Deuda Bancaria Activa</div>
                        <p className="text-xs text-slate-400">El club no tiene obligaciones crediticias pendientes ni cuotas semanales de amortización.</p>
                    </div>
                )}
            </div>

            {/* Available Loan Packages */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <Coins className="w-4 h-4 text-[var(--apex-gold)]" />
                        Líneas de Financiación Institucional Disponibles
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Créditos para afrontar fichajes estelares, obras de estadio o solventar déficit operativo temporal.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {availableLoans.map(loan => (
                        <div key={loan.id} className="apex-card p-5 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-all">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-base text-white">{loan.name}</div>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400">
                                        {loan.remainingWeeks} sem
                                    </span>
                                </div>

                                <div className="text-2xl font-black text-emerald-400 mb-3">
                                    +{formatCurrency(loan.principal)}
                                </div>

                                <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Cuota Semanal:</span>
                                        <span className="font-bold text-rose-400">{formatCurrency(loan.weeklyPayment)}/sem</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Total a Devolver:</span>
                                        <span className="font-bold text-white">{formatCurrency(loan.remainingAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Interés Fijo:</span>
                                        <span className="font-bold text-amber-400">{(loan.interestRate * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => onRequestTakeLoan(loan)}
                                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors border border-amber-500/30 cursor-pointer shadow-md"
                            >
                                Solicitar Crédito Bancario
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});
