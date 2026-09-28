import React from 'react';
import { Scout } from '../../../types';
import { formatCurrency } from '../../../utils';
import { Search, TrendingUp, UserMinus } from 'lucide-react';
import { ModalFireState, ModalHireState } from './staffUiTypes';

interface StaffScoutsTabProps {
    scouts: Scout[];
    availableScouts: Scout[];
    onOpenFireModal: (modal: ModalFireState) => void;
    onOpenHireModal: (modal: ModalHireState) => void;
}

export const StaffScoutsTab: React.FC<StaffScoutsTabProps> = React.memo(({
    scouts,
    availableScouts,
    onOpenFireModal,
    onOpenHireModal
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Active Scouts Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-400" />
                        Ojeadores Activos en el Club ({scouts.length}/3)
                    </h3>
                    <span className="text-xs text-white/50">Límite máximo: 3 ojeadores simultáneos</span>
                </div>

                {scouts.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-white/5 border border-dashed border-white/10 text-white/40 text-xs">
                        No tienes ojeadores contratados. Contrata profesionales abajo para analizar futbolistas en el mercado.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scouts.map(scout => (
                            <div key={scout.id} className="apex-card p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between group hover:border-blue-400/40 transition-colors">
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Ojeador Profesional</span>
                                            <h4 className="text-base font-black text-white tracking-tight">{scout.name}</h4>
                                        </div>
                                        <span className="text-[9px] font-black bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                                            {scout.specialty || 'Generalista'}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-5">
                                        <div>
                                            <div className="flex justify-between items-center text-[10px] mb-1">
                                                <span className="text-white/50 font-bold uppercase tracking-widest">Eficiencia</span>
                                                <span className="text-[var(--apex-gold)] font-black">{scout.efficiency}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-black/50 border border-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-[var(--apex-gold)] shadow-[0_0_10px_rgba(200,168,78,0.5)]" style={{ width: `${scout.efficiency}%` }} />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center text-[10px] mb-1">
                                                <span className="text-white/50 font-bold uppercase tracking-widest">Precisión</span>
                                                <span className="text-emerald-400 font-black">{scout.accuracy}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-black/50 border border-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${scout.accuracy}%` }} />
                                            </div>
                                        </div>

                                        <div className="text-[10px] text-white/50 pt-2 border-t border-white/5 flex justify-between">
                                            <span>Sueldo:</span>
                                            <span className="font-bold text-white">{formatCurrency(scout.salary)}/sem</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onOpenFireModal({
                                        type: 'scout',
                                        member: scout,
                                        severanceCost: 0
                                    })}
                                    className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                                >
                                    <UserMinus className="w-4 h-4" />
                                    <span>Desvincular Ojeador</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Scout Candidates */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Ojeadores Libres en el Mercado
                    </h3>
                </div>

                <div className="apex-card overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-black/30 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">
                                    <th className="px-6 py-4">Candidato</th>
                                    <th className="px-4 py-4 text-center">Eficiencia</th>
                                    <th className="px-4 py-4 text-center">Precisión</th>
                                    <th className="px-4 py-4 text-center">Especialidad</th>
                                    <th className="px-4 py-4 text-center">Coste Fichaje</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs">
                                {availableScouts.map(scout => (
                                    <tr key={scout.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-black text-white">{scout.name}</div>
                                            <div className="text-[10px] text-white/40">{formatCurrency(scout.salary)} / semana</div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="font-black text-[var(--apex-gold)]">{scout.efficiency}%</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="font-black text-emerald-400">{scout.accuracy}%</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="px-2 py-1 rounded bg-white/5 text-white/70 border border-white/10 text-[10px] font-bold uppercase">
                                                {scout.specialty || 'Generalista'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center font-black text-amber-400">
                                            {formatCurrency(scout.hiringFee)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onOpenHireModal({
                                                    type: 'scout',
                                                    candidate: scout
                                                })}
                                                disabled={scouts.length >= 3}
                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                                    scouts.length >= 3
                                                        ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                                                        : 'apex-btn-gold !py-2'
                                                }`}
                                            >
                                                {scouts.length >= 3 ? 'CUPO LLENO' : 'CONTRATAR'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
});
