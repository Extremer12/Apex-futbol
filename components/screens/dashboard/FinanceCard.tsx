import React from 'react';
import { formatCurrencyShort } from '../../../utils';
import { Wallet, ArrowUpRight } from 'lucide-react';

interface FinanceCardProps {
    balance: number;
    budget: number;
}

export const FinanceCard: React.FC<FinanceCardProps> = React.memo(({ balance, budget }) => {
    const isPositive = balance >= 0;

    return (
        <div className="apex-card p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[var(--apex-gold)]" />
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Finanzas</span>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                    isPositive
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                }`}>
                    {isPositive ? 'Solvencia' : 'Déficit'}
                </span>
            </div>

            <div className="my-1">
                <span className="text-[10px] text-slate-400 font-medium block mb-0.5">Balance en Caja</span>
                <div className="text-2xl font-black text-white tracking-tight">
                    {formatCurrencyShort(balance)}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                <span className="text-[10px] font-semibold text-slate-400">Presupuesto Fichajes</span>
                <span className="text-xs font-black text-[var(--apex-gold)] flex items-center gap-0.5">
                    {formatCurrencyShort(budget)}
                    <ArrowUpRight className="w-3 h-3 opacity-70" />
                </span>
            </div>
        </div>
    );
});
