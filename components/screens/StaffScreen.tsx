import React, { useState } from 'react';
import { GameState, Scout } from '../../types';
import { GameAction } from '../../state/reducer';
import { UsersIcon, SparklesIcon } from '../icons';
import { SearchIcon, TrendingUpIcon, AwardIcon } from 'lucide-react';
import { formatCurrencyShort } from '../../utils';
import { useToast } from '../common/ToastProvider';

interface StaffScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

const AVAILABLE_SCOUTS: Scout[] = [
    { id: 'scout_1', name: 'Marco Rossi', efficiency: 85, accuracy: 70, specialty: 'CEN', salary: 12000, hiringFee: 50000 },
    { id: 'scout_2', name: 'Hans Müller', efficiency: 60, accuracy: 90, specialty: 'DEF', salary: 15000, hiringFee: 75000 },
    { id: 'scout_3', name: 'Juan García', efficiency: 95, accuracy: 60, specialty: 'DEL', salary: 10000, hiringFee: 40000 },
    { id: 'scout_4', name: 'Sarah Smith', efficiency: 75, accuracy: 80, specialty: 'Youth', salary: 18000, hiringFee: 100000 },
    { id: 'scout_5', name: 'Tariq Al-Fayed', efficiency: 80, accuracy: 85, salary: 20000, hiringFee: 120000 },
];

export const StaffScreen = React.memo(({ gameState, dispatch }: StaffScreenProps) => {
    const { scouts, finances } = gameState;
    const { showToast } = useToast();

    const handleHireScout = (scout: Scout) => {
        if (scouts.length >= 3) {
            showToast("Ya tienes el máximo de scouts (3).", 'warning');
            return;
        }
        if (finances.balance < scout.hiringFee) {
            showToast("No tienes fondos suficientes para contratar a este scout.", 'error');
            return;
        }

        dispatch({ type: 'HIRE_SCOUT', payload: scout });
        showToast(`${scout.name} se ha unido a tu equipo de scouting.`, 'success');
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Personal del Club</h2>
            </div>

            {/* Current Scouts */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <SearchIcon className="w-5 h-5 text-sky-400" />
                    <h3 className="text-xl font-black text-white uppercase">Tus Scouts ({scouts.length}/3)</h3>
                </div>

                {scouts.length === 0 ? (
                    <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center text-slate-500">
                        <p className="font-bold">No tienes scouts contratados. ¡Contrata uno abajo para ver mejor el mercado!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scouts.map(scout => (
                            <div key={scout.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 -rotate-12 translate-x-8 -translate-y-8 group-hover:bg-sky-500/10 transition-colors"></div>
                                <div className="font-black text-white text-lg mb-1">{scout.name}</div>
                                <div className="flex gap-2 mb-4">
                                    <span className="text-[10px] font-black bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded uppercase">{scout.specialty || 'Generalist'}</span>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase">Eficiencia</span>
                                        <span className="text-white font-black">{scout.efficiency}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-500" style={{ width: `${scout.efficiency}%` }}></div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase">Precisión</span>
                                        <span className="text-white font-black">{scout.accuracy}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${scout.accuracy}%` }}></div>
                                    </div>
                                </div>

                                <div className="text-[10px] text-slate-500 font-bold uppercase">Salario: {formatCurrencyShort(scout.salary)}/sem</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Available to Hire */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <TrendingUpIcon className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl font-black text-white uppercase">Candidatos Disponibles</h3>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                    <th className="px-6 py-4">Candidato</th>
                                    <th className="px-4 py-4 text-center">Efic.</th>
                                    <th className="px-4 py-4 text-center">Prec.</th>
                                    <th className="px-4 py-4 text-center">Especialidad</th>
                                    <th className="px-4 py-4 text-center">Costo Contratación</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {AVAILABLE_SCOUTS.map(scout => {
                                    const isHired = scouts.some(s => s.id === scout.id);
                                    return (
                                        <tr key={scout.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-black text-white">{scout.name}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{formatCurrencyShort(scout.salary)} / semana</div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-black text-sky-400">{scout.efficiency}%</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-black text-emerald-400">{scout.accuracy}%</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-2 py-1 rounded-lg uppercase">{scout.specialty || 'Generalist'}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-bold text-white">{formatCurrencyShort(scout.hiringFee)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleHireScout(scout)}
                                                    disabled={isHired}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                                        isHired 
                                                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                                        : 'bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-600/20'
                                                    }`}
                                                >
                                                    {isHired ? 'CONTRATADO' : 'CONTRATAR'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
});
