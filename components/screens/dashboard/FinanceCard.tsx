import React from 'react';
import { formatCurrencyShort } from '../../../utils';

interface FinanceCardProps {
    balance: number;
    budget: number;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({ balance, budget }) => {
    return (
        <div className="apex-card p-5 relative overflow-hidden group">
            <div className="flex flex-col h-full">
                <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase mb-4">Balance Financiero</span>
                <div className="mb-2">
                    <div className="text-2xl font-black text-white">{formatCurrencyShort(balance)}</div>
                    <div className="text-[9px] text-[var(--apex-green)] font-bold uppercase tracking-widest">+€12.4M este mes</div>
                </div>
                
                <div className="flex-1 min-h-[40px] flex items-end mb-4">
                    <svg viewBox="0 0 100 30" className="w-full h-10 overflow-visible">
                        <path 
                            d="M0,25 L15,20 L30,22 L45,15 L60,18 L75,10 L90,12 L100,5" 
                            fill="none" stroke="var(--apex-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="drop-shadow-[0_0_8px_rgba(200,168,78,0.5)]"
                        />
                        <circle cx="100" cy="5" r="3" fill="var(--apex-gold)" />
                    </svg>
                </div>

                <div className="flex justify-between items-end mt-auto pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-white/30 uppercase">Presupuesto de Temporada</span>
                        <span className="text-[10px] font-black text-white/60">{formatCurrencyShort(budget)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
