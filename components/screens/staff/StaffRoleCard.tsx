import React from 'react';
import { formatCurrencyShort } from '../../../utils';
import { UserPlus, UserMinus, RefreshCw, AlertTriangle } from 'lucide-react';

export interface StaffRoleCardProps {
    roleTitle: string;
    roleSubtitle: string;
    icon: React.ReactNode;
    accentColor: 'emerald' | 'sky' | 'amber' | 'violet' | 'rose';
    personName?: string;
    power?: number;
    salary?: number;
    specialty?: string;
    impactChip: string;
    isVacant: boolean;
    onSelectMarket: () => void;
    onFire?: () => void;
    extraAction?: React.ReactNode;
}

const ACCENT_MAP = {
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    sky: 'border-sky-500/30 bg-sky-500/5 text-sky-400',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    violet: 'border-violet-500/30 bg-violet-500/5 text-violet-400',
    rose: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
};

const BAR_MAP = {
    emerald: 'bg-emerald-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    violet: 'bg-violet-500',
    rose: 'bg-rose-500',
};

export const StaffRoleCard: React.FC<StaffRoleCardProps> = React.memo(({
    roleTitle,
    roleSubtitle,
    icon,
    accentColor,
    personName,
    power = 40,
    salary = 0,
    specialty,
    impactChip,
    isVacant,
    onSelectMarket,
    onFire,
    extraAction,
}) => {
    const powerColor = power >= 85 ? 'text-emerald-400' : power >= 70 ? 'text-sky-400' : power >= 55 ? 'text-amber-400' : 'text-rose-400';

    return (
        <div className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
            isVacant
                ? 'border-rose-500/30 bg-rose-950/10 hover:border-rose-500/50'
                : 'border-white/10 bg-slate-900/70 hover:border-white/20'
        }`}>
            <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-xl border shrink-0 ${ACCENT_MAP[accentColor]}`}>
                            {icon}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-white truncate">{roleTitle}</h3>
                            <p className="text-[11px] text-slate-400 truncate">{roleSubtitle}</p>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <span className={`text-lg font-black tabular-nums ${powerColor}`}>{power}</span>
                        <span className="text-[10px] text-slate-500 block -mt-1">PTS</span>
                    </div>
                </div>

                {/* Name & Specialty */}
                {isVacant ? (
                    <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-3">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="text-xs font-semibold text-rose-300">Puesto vacante (penalización activa)</span>
                    </div>
                ) : (
                    <div className="mb-3">
                        <div className="text-sm font-semibold text-slate-100 truncate">{personName}</div>
                        {specialty && (
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">{specialty}</div>
                        )}
                    </div>
                )}

                {/* Power Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isVacant ? 'bg-rose-500/60' : BAR_MAP[accentColor]}`}
                        style={{ width: `${Math.min(100, Math.max(8, power))}%` }}
                    />
                </div>

                {/* Direct Impact Chip */}
                <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-200 mb-3">
                    {impactChip}
                </div>
            </div>

            {/* Footer: Salary + Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                <div className="text-xs text-slate-400">
                    {isVacant ? (
                        <span className="text-slate-500">Sin salario</span>
                    ) : (
                        <span className="font-semibold text-slate-200">{formatCurrencyShort(salary)}<span className="text-slate-500 font-normal">/sem</span></span>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    {extraAction}
                    {!isVacant && onFire && (
                        <button
                            onClick={onFire}
                            title="Despedir"
                            className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-colors"
                        >
                            <UserMinus className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={onSelectMarket}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isVacant
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                : 'bg-white/10 hover:bg-white/15 text-white'
                        }`}
                    >
                        {isVacant ? <UserPlus className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        {isVacant ? 'Contratar' : 'Cambiar'}
                    </button>
                </div>
            </div>
        </div>
    );
});
