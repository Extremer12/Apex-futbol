import React from 'react';
import { SquadRole } from '../../../../types';
import { LoadingSpinner } from '../../../icons';
import { formatWeeklyWage } from '../../../../utils';
import { DollarSign, Calendar, Star, UserCheck } from 'lucide-react';

interface ContractNegotiatorProps {
    offeredWage: number;
    currentWage: number;
    offeredYears: number;
    offeredRole: SquadRole;
    wageDifferencePercent: number;
    isAgentNegotiating: boolean;
    roleDescriptions: Record<SquadRole, { label: string; badge: string; desc: string }>;
    setOfferedWage: (wage: number) => void;
    setOfferedYears: (years: number) => void;
    setOfferedRole: (role: SquadRole) => void;
    adjustWage: (delta: number) => void;
    onSendAgentOffer: () => void;
}

export const ContractNegotiator: React.FC<ContractNegotiatorProps> = React.memo(({
    offeredWage,
    currentWage,
    offeredYears,
    offeredRole,
    wageDifferencePercent,
    isAgentNegotiating,
    roleDescriptions,
    setOfferedWage,
    setOfferedYears,
    setOfferedRole,
    adjustWage,
    onSendAgentOffer
}) => {
    return (
        <div className="space-y-4">
            {/* Clause 1: Weekly Wage */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        Ficha Salarial Semanal
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40">Cobra: {formatWeeklyWage(currentWage)}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            wageDifferencePercent >= 0 
                                ? 'text-emerald-400 bg-emerald-500/15' 
                                : 'text-rose-400 bg-rose-500/15'
                        }`}>
                            {wageDifferencePercent >= 0 ? `+${wageDifferencePercent}%` : `${wageDifferencePercent}%`}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="text-base sm:text-lg font-black text-emerald-400 tracking-tight">
                        {formatWeeklyWage(offeredWage)}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => adjustWage(-10_000)}
                            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg text-xs font-bold border border-white/5 cursor-pointer active:scale-95"
                        >
                            -10K
                        </button>
                        <button
                            type="button"
                            onClick={() => adjustWage(-5_000)}
                            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg text-xs font-bold border border-white/5 cursor-pointer active:scale-95"
                        >
                            -5K
                        </button>
                        <div className="flex items-center bg-black/60 border border-white/15 rounded-lg px-2 py-1">
                            <input
                                type="number"
                                value={Math.round(offeredWage / 1000)}
                                onChange={e => setOfferedWage(Math.max(1000, Number(e.target.value) * 1000))}
                                className="w-16 bg-transparent text-white font-black text-xs text-center focus:outline-none"
                            />
                            <span className="text-[10px] text-white/40 font-bold">K</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => adjustWage(5_000)}
                            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg text-xs font-bold border border-white/5 cursor-pointer active:scale-95"
                        >
                            +5K
                        </button>
                        <button
                            type="button"
                            onClick={() => adjustWage(10_000)}
                            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg text-xs font-bold border border-white/5 cursor-pointer active:scale-95"
                        >
                            +10K
                        </button>
                    </div>
                </div>
            </div>

            {/* Clauses 2 & 3: Duración y Rol */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Duración */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                            Duración del Contrato
                        </span>
                        <span className="text-xs font-black text-white">{offeredYears} temporadas</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map((yrs) => (
                            <button
                                key={yrs}
                                type="button"
                                onClick={() => setOfferedYears(yrs)}
                                className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                    offeredYears === yrs
                                        ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-[var(--apex-gold)]/20'
                                        : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                                }`}
                            >
                                {yrs}a
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rol en la Plantilla */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-400" />
                            Rol Deportivo
                        </span>
                        <span className="text-xs font-black text-[var(--apex-gold)]">{roleDescriptions[offeredRole].badge}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                        {(['Key', 'FirstTeam', 'Rotation', 'Prospect'] as SquadRole[]).map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setOfferedRole(r)}
                                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold truncate transition-all cursor-pointer text-center ${
                                    offeredRole === r
                                        ? 'bg-[var(--apex-gold)] text-black font-black shadow-md'
                                        : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                                }`}
                            >
                                {roleDescriptions[r].label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Send Agent Offer Button */}
            <button
                onClick={onSendAgentOffer}
                disabled={isAgentNegotiating || offeredWage <= 0}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[var(--apex-gold)]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
                {isAgentNegotiating ? <LoadingSpinner /> : (
                    <>
                        <UserCheck className="w-4 h-4" />
                        <span>Proponer Términos al Representante</span>
                    </>
                )}
            </button>
        </div>
    );
});
