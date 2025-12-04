import React, { useState } from 'react';
import { GameState, Coach } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency } from '../../utils';

interface StaffScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export const StaffScreen: React.FC<StaffScreenProps> = ({ gameState, dispatch }) => {
    const { team, availableCoaches, finances } = gameState;
    const currentCoach = team.coach;

    const handleFireCoach = () => {
        if (confirm('¿Estás seguro de que quieres despedir al entrenador? Tendrás que pagar una indemnización.')) {
            dispatch({ type: 'FIRE_COACH' });
        }
    };

    const handleHireCoach = (coach: Coach) => {
        if (finances.balance < coach.signingBonus) {
            alert('No tienes suficientes fondos para contratar a este entrenador.');
            return;
        }
        if (currentCoach && !confirm(`Contratar a ${coach.name} reemplazará a tu entrenador actual. ¿Continuar?`)) {
            return;
        }
        dispatch({ type: 'HIRE_COACH', payload: { coachId: coach.id } });
    };

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Cuerpo Técnico</h1>

            {/* Current Coach Section */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Director Técnico Actual</h2>

                {currentCoach ? (
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-3xl">👔</span>
                        </div>

                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white">{currentCoach.name}</h3>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300">
                                    Edad: {currentCoach.age}
                                </span>
                                <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm border border-blue-500/30">
                                    Estilo: {currentCoach.style}
                                </span>
                                <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm border border-purple-500/30">
                                    Prestigio: {currentCoach.prestige}
                                </span>
                            </div>
                            <div className="text-slate-400">
                                Salario: <span className="text-white">{formatCurrency(currentCoach.salary)}/semana</span>
                            </div>
                        </div>

                        <button
                            onClick={handleFireCoach}
                            className="px-6 py-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 rounded-lg transition-colors font-semibold"
                        >
                            Despedir
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <p className="text-xl mb-4">No tienes Director Técnico actualmente.</p>
                        <p className="text-sm">El equipo jugará con tácticas básicas hasta que contrates a alguien.</p>
                    </div>
                )}
            </div>

            {/* Available Coaches Market */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Entrenadores Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableCoaches.map(coach => (
                        <div key={coach.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{coach.name}</h3>
                                    <div className="text-sm text-slate-400">{coach.age} años</div>
                                </div>
                                <div className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                                    {coach.prestige} Prestigio
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Estilo</span>
                                    <span className="text-blue-400 font-medium">{coach.style}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Salario</span>
                                    <span className="text-white">{formatCurrency(coach.salary)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Coste Fichaje</span>
                                    <span className="text-green-400 font-medium">{formatCurrency(coach.signingBonus)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleHireCoach(coach)}
                                disabled={finances.balance < coach.signingBonus}
                                className={`w-full py-2 rounded-lg font-medium transition-colors ${finances.balance >= coach.signingBonus
                                        ? 'bg-green-600 hover:bg-green-500 text-white'
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {finances.balance >= coach.signingBonus ? 'Contratar' : 'Fondos Insuficientes'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
