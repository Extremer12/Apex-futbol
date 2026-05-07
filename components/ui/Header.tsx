import React from 'react';
import { GameState } from '../../types';
import { AnimatedNumber } from './AnimatedNumber';
import { formatDate, formatCurrencyShort } from '../../utils';
import { TeamLogo } from '../../data/teams/helpers';

interface HeaderProps {
    gameState: GameState;
}

export const Header: React.FC<HeaderProps> = ({ gameState }) => (
    <header className="sticky top-0 z-30 pt-safe" style={{ background: 'rgba(10,14,23,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--apex-border)' }}>
        <div className="max-w-7xl mx-auto px-5 py-3">
            <div className="flex justify-between items-center">
                {/* Team Info */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl p-1.5"
                         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--apex-border)' }}>
                        <TeamLogo team={gameState.team} />
                    </div>
                    <div>
                        <h1 className="text-base font-extrabold tracking-tight text-white uppercase leading-none mb-1">
                            {gameState.team.name}
                        </h1>
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--apex-text-secondary)' }}>
                            Season {gameState.season}
                        </p>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="flex items-center gap-2">
                    {/* Date & Week */}
                    <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--apex-border)' }}>
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--apex-text-muted)' }}>Week {gameState.currentWeek}</p>
                        <p className="text-[10px] font-extrabold text-white">{formatDate(gameState.currentDate)}</p>
                    </div>

                    {/* Balance */}
                    <div className="flex flex-col items-end px-3 py-1.5 rounded-lg" style={{ background: 'rgba(200,168,78,0.05)', border: '1px solid var(--apex-border)' }}>
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--apex-text-muted)' }}>Balance</p>
                        <AnimatedNumber
                            value={gameState.finances.balance}
                            formatter={(n) => formatCurrencyShort(n)}
                            className="text-[11px] font-extrabold text-gold-gradient uppercase"
                        />
                    </div>
                </div>
            </div>
        </div>
    </header>
);
