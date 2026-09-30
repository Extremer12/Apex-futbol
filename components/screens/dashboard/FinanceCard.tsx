import React from 'react';
import { formatCurrencyShort } from '../../../utils';
import { Coins, TrendingUp } from 'lucide-react';

interface FinanceCardProps {
    balance: number;
    budget: number;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({ balance, budget }) => {
    return (
        <div className="apex-card p-5 relative overflow-hidden group border border-white/10 hover:border-amber-500/40 transition-all shadow-xl">
            {/* Ambient Gold Radial Flare */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-3 right-3 p-1 text-amber-500/10 group-hover:text-amber-500/20 transition-colors pointer-events-none">
                <Coins className="w-12 h-12" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black tracking-[0.2em] text-white/50 uppercase">Balance Financiero</span>
                    <span className="flex items-center gap-1 text-[8.5px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <TrendingUp className="w-2.5 h-2.5" /> Superávit
                    </span>
                </div>

                <div className="mb-2">
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{formatCurrencyShort(balance)}</div>
                    <div className="text-[9.5px] text-[var(--apex-green)] font-black uppercase tracking-widest mt-0.5">Tesorería Saludable</div>
                </div>
                
                {/* Glowing Sparkline Chart with Gradient Area */}
                <div className="flex-1 min-h-[44px] flex items-end mb-3 relative">
                    <svg viewBox="0 0 100 35" className="w-full h-11 overflow-visible">
                        <defs>
                            <linearGradient id="financeAreaGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <polygon 
                            points="0,35 0,25 15,20 30,22 45,15 60,18 75,10 90,12 100,5 100,35" 
                            fill="url(#financeAreaGlow)" 
                        />
                        {/* Stroke Path */}
                        <path 
                            d="M0,25 L15,20 L30,22 L45,15 L60,18 L75,10 L90,12 L100,5" 
                            fill="none" stroke="var(--apex-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            className="drop-shadow-[0_0_8px_rgba(200,168,78,0.7)]"
                        />
                        {/* End Point Glow */}
                        <circle cx="100" cy="5" r="3.5" fill="#FFE082" stroke="#B45309" strokeWidth="1" className="animate-pulse" />
                    </svg>
                </div>

                <div className="flex justify-between items-end mt-auto pt-3 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider">Presupuesto Temporada</span>
                        <span className="text-[11px] font-black text-white/80">{formatCurrencyShort(budget)}</span>
                    </div>
                    <span className="text-[8px] font-bold text-white/30 uppercase">Actualizado</span>
                </div>
            </div>
        </div>
    );
};
