import React, { useState } from 'react';
import { Team, ElectoralPromise } from '../../types';
import { StartupScreenContainer } from './StartupScreenContainer';

interface PromiseSelectionProps {
    team: Team;
    onSelectionComplete: (promises: ElectoralPromise[]) => void;
}

const AVAILABLE_PROMISES: ElectoralPromise[] = [
    {
        id: 'top_4',
        description: 'Terminar en el Top 4 de la liga',
        type: 'league_position',
        target: 4,
        deadline: 1,
        fulfilled: false,
        impact: 20
    },
    {
        id: 'win_trophy',
        description: 'Ganar al menos un trofeo esta temporada',
        type: 'trophy',
        target: 'Any',
        deadline: 1,
        fulfilled: false,
        impact: 25
    },
    {
        id: 'expand_stadium',
        description: 'Expandir la capacidad del estadio',
        type: 'stadium',
        target: 5000,
        deadline: 2,
        fulfilled: false,
        impact: 15
    },
    {
        id: 'star_signing',
        description: 'Fichar a un jugador de clase mundial (Rating 80+)',
        type: 'transfer',
        target: 80,
        deadline: 1,
        fulfilled: false,
        impact: 15
    },
    {
        id: 'financial_stability',
        description: 'Mantener un balance positivo al final del año',
        type: 'finances',
        target: 0,
        deadline: 1,
        fulfilled: false,
        impact: 10
    }
];

export const PromiseSelection: React.FC<PromiseSelectionProps> = ({ team, onSelectionComplete }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const togglePromise = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selectedPromises = AVAILABLE_PROMISES.filter(p => selectedIds.includes(p.id));
        onSelectionComplete(selectedPromises);
    };

    return (
        <StartupScreenContainer>
            <div className="w-full max-w-2xl">
                <div className='flex justify-center mb-4'>{team.logo}</div>
                <h1 className="text-3xl font-bold mb-2 text-center text-white">Promesas Electorales</h1>
                <p className="text-slate-400 text-center mb-8">
                    Selecciona hasta 3 promesas para tu mandato. 
                    <br />
                    <span className="text-xs text-amber-500/80 italic">Cuidado: Fallar en tus promesas dañará seriamente tu reputación.</span>
                </p>

                <div className="space-y-3 mb-8">
                    {AVAILABLE_PROMISES.map(promise => {
                        const isSelected = selectedIds.includes(promise.id);
                        const isDisabled = !isSelected && selectedIds.length >= 3;

                        return (
                            <button
                                key={promise.id}
                                onClick={() => togglePromise(promise.id)}
                                disabled={isDisabled}
                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 transform ${
                                    isSelected 
                                    ? 'bg-sky-600/20 border-sky-500 shadow-lg shadow-sky-500/20 scale-[1.02]' 
                                    : isDisabled 
                                    ? 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed'
                                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-black text-sky-400 uppercase tracking-widest">{promise.type.replace('_', ' ')}</span>
                                            {isSelected && <span className="bg-sky-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">SELECCIONADA</span>}
                                        </div>
                                        <div className="text-lg font-bold text-white">{promise.description}</div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-sky-500 border-sky-500' : 'border-slate-700'}`}>
                                        {isSelected && (
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={selectedIds.length === 0}
                    className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl ${
                        selectedIds.length > 0 
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/20' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    {selectedIds.length === 0 ? 'SELECCIONA AL MENOS UNA PROMESA' : `CONFIRMAR MANDATO (${selectedIds.length}/3)`}
                </button>
            </div>
        </StartupScreenContainer>
    );
};
