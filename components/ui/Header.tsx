import React from 'react';
import { GameState } from '../../types';
import { AnimatedNumber } from './AnimatedNumber';
import { formatDate, formatCurrencyShort } from '../../utils';
import { TeamLogo } from '../../data/teams/helpers';
import { UserBadge } from '../auth/UserBadge';

import { Award } from 'lucide-react';

interface HeaderProps {
    gameState: GameState;
    onNavigate?: (screen: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ gameState, onNavigate }) => {
    const playerProfile = gameState.playerProfile;
    const exp = playerProfile?.experience || 0;
    const level = Math.floor(exp / 200) + 1;

    return (
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

                    {/* Info & Actions */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        {/* Presidential Profile Quick Pill */}
                        {onNavigate && (
                            <button
                                onClick={() => onNavigate('PERFIL')}
                                className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer group"
                                title="Ver Perfil Presidencial"
                            >
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                                    <Award className="w-3.5 h-3.5 text-slate-950 font-black" />
                                </div>
                                <div className="text-left hidden xs:block sm:block">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-amber-400/80 block leading-tight">Presidencia</span>
                                    <span className="text-[10px] font-black text-white leading-tight truncate max-w-[70px] sm:max-w-[90px] block">
                                        {playerProfile?.name || 'Presidente'}
                                    </span>
                                </div>
                                <span className="text-[9px] font-black bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded ml-0.5">
                                    Nv.{level}
                                </span>
                            </button>
                        )}

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

                        {/* Supabase User Badge */}
                        <UserBadge />
                    </div>
                </div>
            </div>
        </header>
    );
};
