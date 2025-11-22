import React from 'react';
import { GameState } from '../../types';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { FinancialChart } from '../ui/FinancialChart';
import { formatCurrency } from '../../utils';

interface FinancesScreenProps {
    gameState: GameState;
}

export const FinancesScreen: React.FC<FinancesScreenProps> = ({ gameState }) => {
    const weeklyNet = gameState.finances.weeklyIncome - gameState.finances.weeklyWages;
    return (
        <div className="p-4 md:p-6 space-y-6">
            <h2 className="text-3xl font-bold text-sky-400">Resumen Financiero</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Balance Total del Club</h3>
                    <AnimatedNumber value={gameState.finances.balance} formatter={(n) => formatCurrency(n,1)} className="text-5xl font-bold text-green-400 block mt-2" />
                </div>
                 <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Presupuesto para Fichajes</h3>
                    <AnimatedNumber value={gameState.finances.transferBudget} formatter={(n) => formatCurrency(n,1)} className="text-5xl font-bold text-sky-400 block mt-2" />
                </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-sky-400 mb-4">Flujo de Caja Semanal</h3>
                <div className="space-y-3 text-lg">
                    <div className="flex justify-between items-center"><span className="text-slate-300">Ingresos:</span> <span className="font-semibold text-green-400 text-2xl">+ {formatCurrency(gameState.finances.weeklyIncome / 1_000_000, 2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-300">Salarios:</span> <span className="font-semibold text-red-400 text-2xl">- {formatCurrency(gameState.finances.weeklyWages / 1_000_000, 2)}</span></div>
                    <div className="flex justify-between items-center border-t border-slate-800 mt-3 pt-3">
                        <span className="font-bold">Beneficio/Pérdida Semanal:</span>
                        <span className={`font-bold text-2xl ${weeklyNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {weeklyNet >= 0 ? '+' : ''}{formatCurrency(weeklyNet / 1_000_000, 2)}
                        </span>
                    </div>
                </div>
                <FinancialChart history={gameState.finances.balanceHistory} />
            </div>
        </div>
    )
};
