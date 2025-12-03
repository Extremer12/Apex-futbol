import React from 'react';
import { GameState } from '../../types';
import { AnimatedNumber } from './AnimatedNumber';
import { formatDate, formatCurrency } from '../../utils';

interface HeaderProps {
    gameState: GameState;
}

export const Header: React.FC<HeaderProps> = ({ gameState }) => (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 backdrop-blur-lg border-b-2 border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
                {/* Team Info */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-slate-800/50 rounded-xl p-2 border border-slate-700">
                        <div className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain">
                            {gameState.team.logo}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            {gameState.team.name}
                        </h1>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                            Temporada {gameState.season}
                        </p>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="flex items-center gap-3">
                    {/* Date & Week */}
                    <div className="hidden sm:block bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Jornada {gameState.currentWeek}</p>
                        <p className="text-sm font-bold text-sky-400">{formatDate(gameState.currentDate)}</p>
                    </div>

                    {/* Balance */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 shadow-lg">
                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Balance</p>
                        <AnimatedNumber
                            value={gameState.finances.balance}
                            formatter={(n) => formatCurrency(n, 1)}
                            className="text-lg font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                        />
                    </div>
                </div>
            </div>
        </div>
    </header>
);
