import React from 'react';
import { GameState } from '../../types';
import { AnimatedNumber } from './AnimatedNumber';
import { formatDate, formatCurrencyShort } from '../../utils';
import { TeamLogo } from '../../data/teams/helpers';
import { UserBadge } from '../auth/UserBadge';
import { useTeamSlice, useFinancesSlice, useCalendarSlice } from '../../state/selectors';

interface HeaderProps {
    gameState?: GameState;
    onNavigate?: (screen: any) => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ gameState }) => {
    const teamSlice = useTeamSlice();
    const financesSlice = useFinancesSlice();
    const calendarSlice = useCalendarSlice();

    const team = teamSlice.team || gameState?.team;
    const balance = gameState ? gameState.finances.balance : financesSlice.balance;
    const season = gameState ? gameState.season : calendarSlice.season;
    const currentWeek = gameState ? gameState.currentWeek : calendarSlice.currentWeek;
    const currentDate = gameState ? gameState.currentDate : calendarSlice.currentDate;

    if (!team) return null;

    return (
        <header 
            className="sticky top-0 z-30 pt-safe bg-[#060A16]/95 md:bg-[#060A16]/70 md:backdrop-blur-xl transition-all"
        >
            {/* Club-color accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--club-color), var(--apex-brand), transparent)', opacity: 0.7 }} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5">
                <div className="flex justify-between items-center">
                    {/* Team Info */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--club-color) 35%, transparent), transparent)' }}>
                            <TeamLogo team={team} className="w-9 h-9 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-display text-lg sm:text-xl font-extrabold tracking-wide text-white uppercase leading-none mb-0.5 truncate max-w-[150px] sm:max-w-xs">
                                {team.name}
                            </h1>
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--apex-text-secondary)]">
                                Temporada {season} • Sem {currentWeek}
                            </p>
                        </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="flex items-center gap-3 sm:gap-5">

                        {/* Date */}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/40">Fecha</span>
                            <span className="text-[11px] font-extrabold text-white/90">{currentDate ? formatDate(currentDate) : ''}</span>
                        </div>

                        {/* Balance */}
                        <div className="flex flex-col items-end px-2.5 py-1 rounded-lg border border-[var(--apex-gold)]/20 bg-[var(--apex-gold)]/[0.07]">
                            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--apex-gold)]/70">Saldo</span>
                            <AnimatedNumber
                                value={balance}
                                formatter={(n) => formatCurrencyShort(n)}
                                className="font-display tabular text-base sm:text-lg font-extrabold leading-none text-premium-gradient"
                            />
                        </div>

                        {/* Supabase User Badge */}
                        <UserBadge />
                    </div>
                </div>
            </div>
        </header>
    );
});
