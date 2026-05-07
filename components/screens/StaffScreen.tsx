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
            showToast("You already have the maximum number of scouts (3).", 'warning');
            return;
        }
        if (finances.balance < scout.hiringFee) {
            showToast("Insufficient funds to hire this scout.", 'error');
            return;
        }

        dispatch({ type: 'HIRE_SCOUT', payload: scout });
        showToast(`${scout.name} has joined your scouting team.`, 'success');
    };

    return (
        <div className="p-4 md:p-6 space-y-8 pb-24 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-1">Club Personnel</h2>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Staff</h1>
                </div>
            </div>

            {/* Current Scouts */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <SearchIcon className="w-5 h-5 text-[var(--apex-gold)]" />
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Your Scouts ({scouts.length}/3)</h3>
                </div>

                {scouts.length === 0 ? (
                    <div className="bg-black/20 border-2 border-dashed border-white/10 rounded-2xl p-10 text-center text-white/40">
                        <p className="font-bold uppercase tracking-widest text-xs">No scouts hired. Hire one below to analyze the market!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scouts.map(scout => (
                            <div key={scout.id} className="apex-card p-5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--apex-gold)]/5 -rotate-12 translate-x-8 -translate-y-8 group-hover:bg-[var(--apex-gold)]/10 transition-colors pointer-events-none"></div>
                                <div className="font-black text-white text-lg mb-1 tracking-tight">{scout.name}</div>
                                <div className="flex gap-2 mb-5">
                                    <span className="text-[9px] font-black bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] px-2 py-0.5 rounded border border-[var(--apex-gold)]/20 uppercase tracking-[0.2em]">{scout.specialty || 'Generalist'}</span>
                                </div>
                                
                                <div className="space-y-3 mb-5">
                                    <div>
                                        <div className="flex justify-between items-center text-[10px] mb-1">
                                            <span className="text-white/50 font-bold uppercase tracking-widest">Efficiency</span>
                                            <span className="text-[var(--apex-gold)] font-black">{scout.efficiency}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black/50 border border-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-[var(--apex-gold)] shadow-[0_0_10px_rgba(200,168,78,0.5)]" style={{ width: `${scout.efficiency}%` }}></div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between items-center text-[10px] mb-1">
                                            <span className="text-white/50 font-bold uppercase tracking-widest">Accuracy</span>
                                            <span className="text-[var(--apex-green)] font-black">{scout.accuracy}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black/50 border border-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-[var(--apex-green)] shadow-[0_0_10px_rgba(46,204,113,0.5)]" style={{ width: `${scout.accuracy}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em]">Wage: {formatCurrencyShort(scout.salary)}/wk</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Available to Hire */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <TrendingUpIcon className="w-5 h-5 text-[var(--apex-green)]" />
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Available Candidates</h3>
                </div>

                <div className="apex-card overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-black/30 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">
                                    <th className="px-6 py-4">Candidate</th>
                                    <th className="px-4 py-4 text-center">Effic.</th>
                                    <th className="px-4 py-4 text-center">Accur.</th>
                                    <th className="px-4 py-4 text-center">Specialty</th>
                                    <th className="px-4 py-4 text-center">Hiring Fee</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {AVAILABLE_SCOUTS.map(scout => {
                                    const isHired = scouts.some(s => s.id === scout.id);
                                    return (
                                        <tr key={scout.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-black text-white tracking-tight">{scout.name}</div>
                                                <div className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em]">{formatCurrencyShort(scout.salary)} / week</div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-black text-[var(--apex-gold)]">{scout.efficiency}%</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-black text-[var(--apex-green)]">{scout.accuracy}%</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-[9px] font-black bg-white/5 text-white/70 border border-white/10 px-2 py-1 rounded uppercase tracking-widest">{scout.specialty || 'Generalist'}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-black text-white/90">{formatCurrencyShort(scout.hiringFee)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleHireScout(scout)}
                                                    disabled={isHired}
                                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        isHired 
                                                        ? 'bg-black/50 text-white/30 border border-white/5 cursor-not-allowed' 
                                                        : 'apex-btn-gold !py-2'
                                                    }`}
                                                >
                                                    {isHired ? 'HIRED' : 'HIRE'}
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
