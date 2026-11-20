import React from 'react';
import { SquadRole } from '../../../../types';
import { formatCurrency, formatWeeklyWage } from '../../../../utils';
import { Award, PenTool } from 'lucide-react';

interface SigningCeremonyProps {
    agreedFee: number | null;
    offeredWage: number;
    offeredYears: number;
    offeredRole: SquadRole;
    roleDescriptions: Record<SquadRole, { label: string; badge: string; desc: string }>;
    onFinalizeSigning: () => void;
}

export const SigningCeremony: React.FC<SigningCeremonyProps> = React.memo(({
    agreedFee,
    offeredWage,
    offeredYears,
    offeredRole,
    roleDescriptions,
    onFinalizeSigning
}) => {
    return (
        <div className="space-y-4 animate-fade-in">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900/90 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                        <Award className="w-4 h-4" />
                        ¡Acuerdo Total Alcanzado!
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        Listo para Rúbrica
                    </span>
                </div>

                {/* Deal Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[9px] text-white/40 uppercase font-bold block">Traspaso al Club</span>
                        <span className="text-xs font-black text-[var(--apex-gold)]">{formatCurrency(agreedFee)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[9px] text-white/40 uppercase font-bold block">Ficha Semanal</span>
                        <span className="text-xs font-black text-emerald-400">{formatWeeklyWage(offeredWage)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[9px] text-white/40 uppercase font-bold block">Duración</span>
                        <span className="text-xs font-black text-white">{offeredYears} temporadas</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[9px] text-white/40 uppercase font-bold block">Rol en Equipo</span>
                        <span className="text-xs font-black text-white">{roleDescriptions[offeredRole].label}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={onFinalizeSigning}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
            >
                <PenTool className="w-4 h-4" />
                <span>Estampar Rúbrica Presidencial y Anunciar Fichaje</span>
            </button>
        </div>
    );
});
