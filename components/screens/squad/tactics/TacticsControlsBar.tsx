import React from 'react';
import { Coach } from '../../../../types';
import { FormationKey, PitchTheme, FORMATION_SLOTS } from '../TacticalLineupView';
import { Users, CheckCircle2, Layers, RefreshCw } from 'lucide-react';

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
    return (
        <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Coach Information */}
            <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-black rounded-2xl border border-[var(--apex-gold)]/40 flex items-center justify-center shadow-lg shrink-0">
                    <Users className="w-6 h-6 text-[var(--apex-gold)]" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-[var(--apex-gold)] tracking-widest">
                            Dirección Técnica
                        </span>
                        {selectedFormation === defaultFormation ? (
                            <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Esquema Preferido del DT
                            </span>
                        ) : (
                            <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                                Ajuste Personalizado
                            </span>
                        )}
                    </div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                        {coach?.name || 'Director Técnico'}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="font-bold text-[var(--apex-gold)]">{coach?.style || 'Equilibrado'}</span>
                        <span>•</span>
                        <span className="text-white/70">Esquema Base: {coach?.preferredFormation || '4-4-2'}</span>
                    </div>
                </div>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full lg:w-auto">
                {/* Formation Selector */}
                <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 px-2.5 py-1.5 rounded-xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Esquema:</span>
                    <select
                        value={selectedFormation}
                        onChange={(e) => onFormationChange(e.target.value as FormationKey)}
                        className="bg-transparent text-white font-black text-xs uppercase tracking-wider focus:outline-none cursor-pointer w-full"
                    >
                        {(Object.keys(FORMATION_SLOTS) as FormationKey[]).map(form => (
                            <option key={form} value={form} className="bg-[#0E131F] text-white">
                                {form} {form === defaultFormation ? '⭐ (DT)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Pitch Style Selector */}
                <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 px-2.5 py-1.5 rounded-xl">
                    <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <select
                        value={pitchTheme}
                        onChange={(e) => onPitchThemeChange(e.target.value as PitchTheme)}
                        className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer w-full"
                        title="Seleccionar visual del terreno de juego"
                    >
                        <option value="simple-svg" className="bg-[#0E131F] text-white">Césped SVG</option>
                        <option value="coach-table-svg" className="bg-[#0E131F] text-white">Pizarra SVG</option>
                        <option value="emerald-turf" className="bg-[#0E131F] text-white">Dark Turf</option>
                    </select>
                </div>

                {/* Reset to Coach XI */}
                {(hasCustomEdits || selectedFormation !== defaultFormation) && (
                    <button
                        onClick={onResetToCoachXI}
                        className="col-span-2 sm:col-span-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Restaurar el once inicial sugerido por el DT"
                    >
                        <RefreshCw className="w-3 h-3 text-[var(--apex-gold)]" />
                        <span>Restaurar Once</span>
                    </button>
                )}
            </div>
        </div>
    );
});
