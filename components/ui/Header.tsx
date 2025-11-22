import React from 'react';
import { GameState } from '../../types';
import { AnimatedNumber } from './AnimatedNumber';
import { formatDate, formatCurrency } from '../../utils';

interface HeaderProps {
    gameState: GameState;
}

export const Header: React.FC<HeaderProps> = ({ gameState }) => (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
                {gameState.team.logo}
                <h1 className="text-2xl font-bold tracking-tight text-white hidden sm:block">{gameState.team.name}</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-semibold text-sky-400">{formatDate(gameState.currentDate)}</p>
                    <p className="text-xs text-slate-400">Semana {gameState.currentWeek}</p>
                </div>
                 <div className="bg-slate-800/50 px-4 py-2 rounded-lg text-right">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Balance</p>
                    <AnimatedNumber value={gameState.finances.balance} formatter={(n) => formatCurrency(n, 1)} className="text-lg font-bold text-green-400" />
                 </div>
            </div>
        </div>
    </header>
);
