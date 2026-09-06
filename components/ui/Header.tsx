import React, { useState } from 'react';
import { GameState } from '../../types';
import { AnimatedNumber } from './AnimatedNumber';
import { formatDate, formatCurrencyShort } from '../../utils';
import { TeamLogo } from '../../data/teams/helpers';
import { UserBadge } from '../auth/UserBadge';
import { CommunityPacksModal } from './CommunityPacksModal';
import { Shield } from 'lucide-react';

interface HeaderProps {
    gameState: GameState;
}

export const Header: React.FC<HeaderProps> = ({ gameState }) => {
    const [isPacksOpen, setIsPacksOpen] = useState(false);

    return (
        <>
            <CommunityPacksModal isOpen={isPacksOpen} onClose={() => setIsPacksOpen(false)} />
            <header 
                className="sticky top-0 z-30 pt-safe backdrop-blur-2xl bg-[#0A0E17]/80 border-b border-white/[0.06] transition-all"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
                    <div className="flex justify-between items-center">
                        {/* Team Info - Direct & Clean, without nested container boxes */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                                <TeamLogo team={gameState.team} className="w-9 h-9 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
                            </div>
                            <div>
                                <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase leading-none mb-1 truncate max-w-[150px] sm:max-w-xs">
                                    {gameState.team.name}
                                </h1>
                                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
                                    Temporada {gameState.season} • Sem {gameState.currentWeek}
                                </p>
                            </div>
                        </div>

                        {/* Info & Actions - Sleek typography without unnecessary boxes */}
                        <div className="flex items-center gap-4 sm:gap-6">
                            {/* Date */}
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/30">Fecha</span>
                                <span className="text-[11px] font-extrabold text-white/90">{formatDate(gameState.currentDate)}</span>
                            </div>

                            {/* Balance */}
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--apex-gold)]/60">Saldo</span>
                                <AnimatedNumber
                                    value={gameState.finances.balance}
                                    formatter={(n) => formatCurrencyShort(n)}
                                    className="text-xs sm:text-sm font-black text-[var(--apex-gold)] drop-shadow-sm"
                                />
                            </div>

                            {/* Packs & Logos Action */}
                            <button
                                onClick={() => setIsPacksOpen(true)}
                                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-white/60 hover:text-[var(--apex-gold)] hover:bg-white/[0.05] transition-all cursor-pointer group"
                                title="Gestionar escudos y logos reales"
                            >
                                <Shield className="w-4 h-4 text-white/40 group-hover:text-[var(--apex-gold)] transition-colors" />
                                <span className="hidden sm:inline text-[9px] font-extrabold uppercase tracking-wider text-white/60 group-hover:text-white transition-colors">
                                    Logos
                                </span>
                            </button>

                            {/* Supabase User Badge */}
                            <UserBadge />
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};
