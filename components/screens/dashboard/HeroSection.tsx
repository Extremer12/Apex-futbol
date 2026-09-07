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

    const homeTeamObj = isHome ? gameState.team : opponent;
    const awayTeamObj = !isHome ? gameState.team : opponent;

    // Analyze match stage details (Playoffs, Finals, Semis, Cups, League)
    const getMatchStageDetails = () => {
        const allCups = Object.values(gameState.cups || {});
        for (const cup of allCups) {
            if (!cup || !cup.rounds) continue;
            for (let rIdx = 0; rIdx < cup.rounds.length; rIdx++) {
                const round = cup.rounds[rIdx];
                const found = round.fixtures?.some(f => 
                    f.week === nextMatch.week && 
                    !!f.isMidweek === !!nextMatch.isMidweek && 
                    f.homeTeamId === nextMatch.homeTeamId && 
                    f.awayTeamId === nextMatch.awayTeamId
                );
                if (found) {
                    const totalFixtures = round.fixtures?.length || 0;
                    let stageName = round.name;
                    if (round.name === 'Final' || totalFixtures === 1) stageName = 'Gran Final';
                    else if (round.name === 'Semi-Final' || totalFixtures === 2) stageName = 'Semifinales';
                    else if (round.name === 'Quarter-Final' || totalFixtures === 4) stageName = 'Cuartos de Final';
                    else if (round.name === 'Round of 16' || totalFixtures === 8) stageName = 'Octavos de Final';
                    else if (round.name === 'Round of 32' || totalFixtures === 16) stageName = 'Dieciseisavos de Final';

                    return {
                        competition: cup.name,
                        stage: stageName,
                        isPlayoffOrCup: true,
                        isFinal: stageName === 'Gran Final',
                        isSemi: stageName === 'Semifinales',
                        isQuarter: stageName === 'Cuartos de Final',
                        isOctavos: stageName === 'Octavos de Final',
                    };
                }
            }
        }

        const comp = nextMatch.competition || '';
        if (comp.includes('Playoffs_Apertura') || comp.includes('Playoffs Apertura')) {
            let stageName = 'Octavos de Final';
            if (nextMatch.week === 18) stageName = 'Cuartos de Final';
            else if (nextMatch.week === 19) stageName = 'Semifinales';
            else if (nextMatch.week >= 20) stageName = 'Gran Final';

            return {
                competition: 'Playoffs Apertura',
                stage: stageName,
                isPlayoffOrCup: true,
                isFinal: stageName === 'Gran Final',
                isSemi: stageName === 'Semifinales',
                isQuarter: stageName === 'Cuartos de Final',
                isOctavos: stageName === 'Octavos de Final',
            };
        }

        if (comp.includes('Playoffs_Clausura') || comp.includes('Playoffs Clausura')) {
            let stageName = 'Octavos de Final';
            if (nextMatch.week === 38) stageName = 'Cuartos de Final';
            else if (nextMatch.week === 39) stageName = 'Semifinales';
            else if (nextMatch.week >= 40) stageName = 'Gran Final';

            return {
                competition: 'Playoffs Clausura',
                stage: stageName,
                isPlayoffOrCup: true,
                isFinal: stageName === 'Gran Final',
                isSemi: stageName === 'Semifinales',
                isQuarter: stageName === 'Cuartos de Final',
                isOctavos: stageName === 'Octavos de Final',
            };
        }

        if (comp.includes('nacional_primer_ascenso')) {
            return {
                competition: 'Primera Nacional',
                stage: 'Final 1º Ascenso',
                isPlayoffOrCup: true,
                isFinal: true,
            };
        }

        if (comp.includes('nacional_reducido')) {
            const isFin = nextMatch.week >= 38;
            return {
                competition: 'Primera Nacional',
                stage: isFin ? 'Final del Reducido' : 'Semifinal Reducido',
                isPlayoffOrCup: true,
                isFinal: isFin,
            };
        }

        return {
            competition: comp || 'Liga',
            stage: `Fecha ${nextMatch.week}`,
            isPlayoffOrCup: false,
        };
    };

    const stageInfo = getMatchStageDetails();

    let playButtonText = 'Jugar Jornada';
    if (stageInfo.isFinal) playButtonText = '🏆 Jugar Gran Final';
    else if (stageInfo.isSemi) playButtonText = '⚔️ Jugar Semifinal';
    else if (stageInfo.isQuarter) playButtonText = '⚔️ Jugar Cuartos de Final';
    else if (stageInfo.isOctavos) playButtonText = '⚔️ Jugar Octavos de Final';
    else if (stageInfo.isPlayoffOrCup) playButtonText = `⚔️ Jugar ${stageInfo.stage}`;
    else playButtonText = `⚽ Jugar Fecha ${nextMatch.week}`;

    return (
        <div className="apex-card p-6 relative overflow-hidden group min-h-[280px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <TrophyIcon className="w-48 h-48 text-[var(--apex-gold)]" />
            </div>
            
            <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-black tracking-[0.3em] text-[var(--apex-gold)] uppercase">Próximo Partido</span>
                <span className="text-[10px] font-black tracking-[0.15em] text-white/80 uppercase bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                    {stageInfo.competition}
                </span>
            </div>

            {/* Symmetrical Matchup Grid */}
            <div className="grid grid-cols-11 items-center mb-6 w-full">
                {/* Home Team (Cols 1-5) */}
                <div className="col-span-5 flex flex-col items-center text-center px-1">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-2.5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                        {homeTeamObj && <TeamLogo team={homeTeamObj} className="w-full h-full object-contain" />}
                    </div>
                    <span className="text-xs sm:text-sm font-black text-white uppercase tracking-tight line-clamp-1 w-full text-center" title={homeTeamObj?.name}>
                        {homeTeamObj?.shortName || homeTeamObj?.name || 'Local'}
                    </span>
                    {homeTeamObj?.id === gameState.team.id && (
                        <span className="text-[8px] font-black uppercase text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-1.5 py-0.5 rounded border border-[var(--apex-gold)]/20 mt-1">
                            Tu Club
                        </span>
                    )}
                </div>

                {/* VS Center (Col 6) */}
                <div className="col-span-1 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl sm:text-3xl font-black italic text-white/20 select-none">VS</span>
                </div>

                {/* Away Team (Cols 7-11) */}
                <div className="col-span-5 flex flex-col items-center text-center px-1">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-2.5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                        {awayTeamObj && <TeamLogo team={awayTeamObj} className="w-full h-full object-contain" />}
                    </div>
                    <span className="text-xs sm:text-sm font-black text-white uppercase tracking-tight line-clamp-1 w-full text-center" title={awayTeamObj?.name}>
                        {awayTeamObj?.shortName || awayTeamObj?.name || 'Visitante'}
                    </span>
                    {awayTeamObj?.id === gameState.team.id && (
                        <span className="text-[8px] font-black uppercase text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-1.5 py-0.5 rounded border border-[var(--apex-gold)]/20 mt-1">
                            Tu Club
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-1.5 mb-6">
                <div className="flex items-center gap-2">
                    {stageInfo.isPlayoffOrCup ? (
                        <span className={`text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full border shadow-md flex items-center gap-1.5 ${
                            stageInfo.isFinal 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 animate-pulse' 
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                        }`}>
                            {stageInfo.isFinal ? '🏆' : '⚔️'} {stageInfo.stage} • Partido Eliminatorio
                        </span>
                    ) : (
                        <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider">
                            Jornada {nextWeek} • 16:30
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-white/40">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeWidth={2} /></svg>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{isHome ? gameState.team.stadiumName : opponent?.stadiumName}</span>
                </div>
            </div>

            <button 
                onClick={onPlayMatch}
                className="w-full py-4 bg-gradient-to-r from-[var(--apex-gold)] to-yellow-600 text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_30px_rgba(200,168,78,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
            >
                <span>{playButtonText}</span>
                <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
        </div>
    );
};
