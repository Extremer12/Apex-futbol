import React, { useEffect } from 'react';
import { GameState, MatchPhase } from '../../../types';
import { GameAction } from '../../../state/reducer';
import { TrophyIcon, UsersIcon } from '../../icons';
import { TeamLogo } from '../../../data/teams/helpers';

export interface PendingSimulationResults {
    playerMatchResult: { homeScore: number; awayScore: number; events?: string[] } | null;
}

interface HeroSectionProps {
    gameState: GameState;
    onPlayMatch: () => void;
    onWeekComplete: () => void;
    matchPhase: MatchPhase;
    pendingResults: PendingSimulationResults | null;
    dispatch: React.Dispatch<GameAction>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    gameState,
    onPlayMatch,
    onWeekComplete,
    matchPhase,
    pendingResults,
    dispatch
}) => {
    useEffect(() => {
        // Auto-advance logic for weeks without player matches
        if (matchPhase === 'LIVE' && pendingResults && !pendingResults.playerMatchResult) {
            // Check if there are important things to stop for
            const hasNewOffers = gameState.incomingOffers.length > 0;
            const isTransferWindow = [0, 6, 7].includes(new Date(gameState.currentDate).getMonth());
            
            // If it's transfer window AND we have offers, maybe we should stop? 
            // Actually, the user wants it fast, so we only stop if they HAVE to play a match or if there's a major event.
            // But if there's NO match result, it means it's a simulated week.
            onWeekComplete();
        }
    }, [matchPhase, pendingResults, onWeekComplete, gameState.incomingOffers.length, gameState.currentDate]);

    const nextWeek = gameState.currentTurn === 'midweek' ? gameState.currentWeek + 1 : gameState.currentWeek;
    const isMidweek = gameState.currentTurn === 'midweek';
    const nextMatch = gameState.schedule.find(m => m.week === nextWeek && !!m.isMidweek === isMidweek && (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id));

    if (!nextMatch) {
        return (
            <div className="apex-card p-10 flex flex-col items-center justify-center min-h-[280px] text-center group">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 group-hover:border-[var(--apex-gold)]/50 transition-colors">
                    <UsersIcon className="w-8 h-8 text-[var(--apex-gold)] opacity-50" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Semana de Entrenamiento</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-8 max-w-xs">No hay partidos programados. La plantilla está enfocada en entrenamiento táctico y recuperación.</p>
                <button 
                    onClick={onPlayMatch}
                    className="apex-btn-gold w-full max-w-xs"
                >
                    Simular Semana
                </button>
            </div>
        );
    }

    const isHome = nextMatch.homeTeamId === gameState.team.id;
    const opponentId = isHome ? nextMatch.awayTeamId : nextMatch.homeTeamId;
    const opponent = gameState.allTeams.find(t => t.id === opponentId);

    return (
        <div className="apex-card p-6 relative overflow-hidden group min-h-[280px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <TrophyIcon className="w-48 h-48 text-[var(--apex-gold)]" />
            </div>
            
            <div className="flex justify-between items-center mb-6">
                <span className="text-[9px] font-black tracking-[0.3em] text-[var(--apex-gold)] uppercase">Próximo Partido</span>
                <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase">{nextMatch.competition || 'Liga'}</span>
            </div>

            <div className="flex items-center justify-around flex-1 mb-8">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <TeamLogo team={isHome ? gameState.team : opponent} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-tighter">{isHome ? gameState.team.shortName || gameState.team.name : opponent?.shortName || opponent?.name}</span>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-4xl font-black italic text-white/10">VS</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <TeamLogo team={!isHome ? gameState.team : opponent} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-tighter">{!isHome ? gameState.team.shortName || gameState.team.name : opponent?.shortName || opponent?.name}</span>
                </div>
            </div>

            <div className="flex flex-col items-center gap-1 mb-8">
                <span className="text-[10px] font-black text-white uppercase">Jornada {nextWeek} • 16:30</span>
                <div className="flex items-center gap-2 text-white/40">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeWidth={2} /></svg>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{isHome ? gameState.team.stadiumName : opponent?.stadiumName}</span>
                </div>
            </div>

            <button 
                onClick={onPlayMatch}
                className="w-full py-4 bg-gradient-to-r from-[var(--apex-gold)] to-yellow-600 text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_30px_rgba(200,168,78,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn"
            >
                {nextMatch ? 'Jugar Jornada' : 'Simular Semana'}
                <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
        </div>
    );
};
