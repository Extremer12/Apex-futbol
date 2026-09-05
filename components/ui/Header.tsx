import React, { useState } from 'react';
import { GameState } from '../../types';
import { AnimatedNumber } from './AnimatedNumber';
import { formatDate, formatCurrencyShort } from '../../utils';
import { TeamLogo } from '../../data/teams/helpers';
import { UserBadge } from '../auth/UserBadge';
import { CommunityPacksModal } from './CommunityPacksModal';

interface HeaderProps {
    gameState: GameState;
}

export const Header: React.FC<HeaderProps> = ({ gameState }) => {
    const [isPacksOpen, setIsPacksOpen] = useState(false);

    return (
        <>
            <CommunityPacksModal isOpen={isPacksOpen} onClose={() => setIsPacksOpen(false)} />
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
                            Temporada {gameState.season}
                        </p>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="flex items-center gap-2">
                    {/* Date & Week */}
                    <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--apex-border)' }}>
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--apex-text-muted)' }}>Semana {gameState.currentWeek}</p>
                        <p className="text-[10px] font-extrabold text-white">{formatDate(gameState.currentDate)}</p>
                    </div>

                    {/* Balance */}
                    <div className="flex flex-col items-end px-3 py-1.5 rounded-lg" style={{ background: 'rgba(200,168,78,0.05)', border: '1px solid var(--apex-border)' }}>
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--apex-text-muted)' }}>Saldo</p>
                        <AnimatedNumber
                            value={gameState.finances.balance}
                            formatter={(n) => formatCurrencyShort(n)}
                            className="text-[11px] font-extrabold text-gold-gradient uppercase"
                        />
                    </div>

                    {/* Community Packs & Logos Button */}
                    <button
                        onClick={() => setIsPacksOpen(true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--apex-gold)]/30 bg-[var(--apex-gold)]/10 hover:bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] transition-all shadow-sm"
                        title="Gestionar escudos y logos reales"
                    >
                        <span className="text-xs">🛡️</span>
                        <span className="hidden sm:inline text-[9px] font-black uppercase tracking-wider">Logos</span>
                    </button>

                    {/* Supabase User & Cloud Sync Badge */}
                    <UserBadge />
                </div>
            </div>
        </div>
    </header>
    </>
    );
};
