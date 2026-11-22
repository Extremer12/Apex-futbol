import React from 'react';
import { Coach } from '../../../../types';
import { FormationKey, PitchTheme, FORMATION_SLOTS } from '../TacticalLineupView';
import { RotateCcw } from 'lucide-react';

interface TacticsControlsBarProps {
    coach?: Coach;
    selectedFormation: FormationKey;
    defaultFormation: FormationKey;
    pitchTheme: PitchTheme;
    hasCustomEdits: boolean;
    onFormationChange: (formation: FormationKey) => void;
    onPitchThemeChange: (theme: PitchTheme) => void;
    onResetToCoachXI: () => void;
}

export const TacticsControlsBar: React.FC<TacticsControlsBarProps> = React.memo(({
    coach,
    selectedFormation,
    defaultFormation,
    pitchTheme,
    hasCustomEdits,
    onFormationChange,
    onPitchThemeChange,
    onResetToCoachXI
}) => {
    const isCoachScheme = selectedFormation === defaultFormation;

    return (
        <div className="apex-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-white truncate">
                        {coach?.name || 'Director Técnico'}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${isCoachScheme
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-300'
                        }`}>
                        {isCoachScheme ? 'Esquema del DT' : 'Personalizado'}
                    </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                    Estilo {coach?.style || 'Equilibrado'} · Base {coach?.preferredFormation || '4-4-2'}
                </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <select
                    aria-label="Esquema táctico"
                    value={selectedFormation}
                    onChange={(e) => onFormationChange(e.target.value as FormationKey)}
                    className="h-10 px-3 rounded-xl bg-[#0D1220] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[var(--apex-gold)]/60 flex-1 sm:flex-initial"
                >
                    {(Object.keys(FORMATION_SLOTS) as FormationKey[]).map(form => (
                        <option key={form} value={form} className="bg-[#0D1220] text-white">
                            {form}{form === defaultFormation ? ' (DT)' : ''}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Estilo de cancha"
                    value={pitchTheme}
                    onChange={(e) => onPitchThemeChange(e.target.value as PitchTheme)}
                    className="h-10 px-3 rounded-xl bg-[#0D1220] border border-white/10 text-slate-200 text-xs font-bold focus:outline-none focus:border-[var(--apex-gold)]/60 flex-1 sm:flex-initial"
                >
                    <option value="simple-svg" className="bg-[#0D1220] text-white">Césped</option>
                    <option value="coach-table-svg" className="bg-[#0D1220] text-white">Pizarra</option>
                    <option value="emerald-turf" className="bg-[#0D1220] text-white">Oscuro</option>
                </select>

                {(hasCustomEdits || !isCoachScheme) && (
                    <button
                        onClick={onResetToCoachXI}
                        className="h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
                        title="Restaurar el once sugerido por el DT"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurar</span>
                    </button>
                )}
            </div>
        </div>
    );
});
