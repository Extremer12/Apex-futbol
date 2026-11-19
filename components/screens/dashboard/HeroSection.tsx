import React, { useEffect } from 'react';
import { GameState, MatchPhase, CupCompetition, COMPETITION_TO_CUP_KEY } from '../../../types';
import { GameAction } from '../../../state/reducer';
import { TrophyIcon, UsersIcon } from '../../icons';
import { Trophy, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { TeamLogo } from '../../../data/teams/helpers';
import { isSeasonCompleted, getSeasonSummaryData, getMatchKickoffTime } from '../../../services/seasonUtils';
import { getTeamStadium } from '../../../data/stadiums';

function isTeamEliminatedFromCup(cup: any, teamId: number): boolean {
    if (!cup) return false;
    if (cup.phase === 'knockout' && cup.rounds && cup.rounds.length > 0) {
        for (const round of cup.rounds) {
            const playedMatch = round.fixtures?.find((f: any) =>
                (f.homeTeamId === teamId || f.awayTeamId === teamId) && f.result !== undefined
            );
            if (playedMatch) {
                const isHome = playedMatch.homeTeamId === teamId;
                const userScore = isHome ? playedMatch.result.homeScore : playedMatch.result.awayScore;
                const oppScore = isHome ? playedMatch.result.awayScore : playedMatch.result.homeScore;
                if (userScore < oppScore) return true;
                if (userScore === oppScore && playedMatch.penalties) {
                    const userPens = isHome ? playedMatch.penalties.home : playedMatch.penalties.away;
                    const oppPens = isHome ? playedMatch.penalties.away : playedMatch.penalties.home;
                    if (userPens < oppPens) return true;
                }
            }
        }
    }
    return false;
}

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
    isSimulating?: boolean;
    onStartNewSeason?: () => void;
    onOpenSeasonEndModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    gameState,
    onPlayMatch,
    onWeekComplete,
    matchPhase,
    pendingResults,
    dispatch,
    isSimulating = false,
    onStartNewSeason,
    onOpenSeasonEndModal
}) => {
    const isSeasonEnd = isSeasonCompleted(gameState);

    useEffect(() => {
        // Auto-advance logic for weeks without player matches (only during regular season)
        if (!isSeasonEnd && matchPhase === 'LIVE' && pendingResults && !pendingResults.playerMatchResult) {
            onWeekComplete();
        }
    }, [matchPhase, pendingResults, onWeekComplete, isSeasonEnd]);

    if (isSeasonEnd) {
        const summary = getSeasonSummaryData(gameState);
        return (
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#090d16] to-[#060910] border border-amber-500/30 p-5 sm:p-7 shadow-2xl space-y-5 select-none">
                {/* Ambient Golden Glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

                {/* Header Row */}
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                Temporada {summary.season} Finalizada
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                                Torneo Concluido
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                            Balance Oficial de la Temporada
                        </h2>
                        <p className="text-xs text-slate-300/80 max-w-xl leading-relaxed">
                            Se disputaron todas las competencias oficiales. A continuación se resumen los campeonatos, ascensos y descensos definidos.
                        </p>
                    </div>

                    {/* User Club Performance Badge */}
                    <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3 shrink-0 self-start md:self-auto">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                            <TeamLogo team={summary.userTeam} className="w-full h-full object-contain drop-shadow" />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                Tu Club
                            </span>
                            <span className="text-xs font-black text-white truncate block max-w-[130px]">
                                {summary.userTeam.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                                <span className="text-amber-400 font-extrabold">{summary.userPosition}º Puesto</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-300 font-bold">{summary.userPoints} Pts</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Highlights Grid */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Títulos y Campeones */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            <span>Títulos y Campeones</span>
                        </div>

                        {summary.isArgentina ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {/* Campeón Apertura */}
                                <div className="bg-slate-900/80 border border-amber-500/25 hover:border-amber-500/40 rounded-2xl p-3 flex items-center gap-3 transition-colors shadow-sm">
                                    <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                                        {summary.aperturaChampion ? (
                                            <TeamLogo team={summary.aperturaChampion} className="w-full h-full object-contain drop-shadow" />
                                        ) : (
                                            <Trophy className="w-6 h-6 text-amber-400/40" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-400/90 block truncate">
                                            Campeón Apertura
                                        </span>
                                        <span className="text-xs sm:text-sm font-black text-white truncate block">
                                            {summary.aperturaChampion?.name || 'En Disputa'}
                                        </span>
                                    </div>
                                </div>

                                {/* Campeón Clausura */}
                                <div className="bg-slate-900/80 border border-cyan-500/25 hover:border-cyan-500/40 rounded-2xl p-3 flex items-center gap-3 transition-colors shadow-sm">
                                    <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                                        {summary.clausuraChampion ? (
                                            <TeamLogo team={summary.clausuraChampion} className="w-full h-full object-contain drop-shadow" />
                                        ) : (
                                            <Trophy className="w-6 h-6 text-cyan-400/40" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400/90 block truncate">
                                            Campeón Clausura
                                        </span>
                                        <span className="text-xs sm:text-sm font-black text-white truncate block">
                                            {summary.clausuraChampion?.name || 'En Disputa'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-900/80 border border-amber-500/25 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-sm">
                                <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                                    {summary.leagueChampion ? (
                                        <TeamLogo team={summary.leagueChampion} className="w-full h-full object-contain drop-shadow" />
                                    ) : (
                                        <Trophy className="w-7 h-7 text-amber-400/40" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-400/90 block truncate">
                                        Campeón de Liga
                                    </span>
                                    <span className="text-sm font-black text-white truncate block">
                                        {summary.leagueChampion?.name || 'Desconocido'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Movimientos (Ascensos & Descensos) */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-300">
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Movimientos de Categoría</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 min-w-0">
                            {/* Ascendidos */}
                            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-2.5 space-y-2 min-w-0 overflow-hidden">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1 truncate">
                                        <TrendingUp className="w-3 h-3 shrink-0" />
                                        <span className="truncate">Ascensos</span>
                                    </span>
                                    <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded shrink-0">
                                        {summary.promotedTeams.length}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {summary.promotedTeams.length === 0 ? (
                                        <span className="text-[10px] text-slate-500 italic py-0.5">No determinados</span>
                                    ) : (
                                        summary.promotedTeams.map(t => (
                                            <div key={t.id} className="flex items-center gap-2 bg-black/40 px-2 py-1.5 rounded-lg border border-emerald-500/10 min-w-0" title={t.name}>
                                                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                                    <TeamLogo team={t} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs font-bold text-white truncate">{t.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Descendidos */}
                            <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-2.5 space-y-2 min-w-0 overflow-hidden">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1 truncate">
                                        <TrendingDown className="w-3 h-3 shrink-0" />
                                        <span className="truncate">Descensos</span>
                                    </span>
                                    <span className="text-[9px] font-bold text-rose-300 bg-rose-500/15 px-1.5 py-0.5 rounded shrink-0">
                                        {summary.relegatedTeams.length}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {summary.relegatedTeams.length === 0 ? (
                                        <span className="text-[10px] text-slate-500 italic py-0.5">No determinados</span>
                                    ) : (
                                        summary.relegatedTeams.map(t => (
                                            <div key={t.id} className="flex items-center gap-2 bg-black/40 px-2 py-1.5 rounded-lg border border-rose-500/10 min-w-0" title={t.name}>
                                                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                                    <TeamLogo team={t} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs font-bold text-white truncate">{t.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-white/5">
                    <button
                        onClick={onStartNewSeason}
                        disabled={isSimulating}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isSimulating ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                <span>Iniciando Temporada {summary.season + 1}...</span>
                            </>
                        ) : (
                            <span>Comenzar Temporada {summary.season + 1}</span>
                        )}
                    </button>

                    {onOpenSeasonEndModal && (
                        <button
                            onClick={onOpenSeasonEndModal}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/15 hover:border-white/25 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <span>Ver Resumen Completo</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const targetWeek = gameState.currentWeek;
    const nextWeek = targetWeek;
    const isMidweek = gameState.currentTurn === 'midweek';
    const nextMatch = gameState.schedule.find(m => {
        if (m.result) return false;
        if (m.week !== targetWeek) return false;
        if (!!m.isMidweek !== isMidweek) return false;
        if (m.homeTeamId !== gameState.team.id && m.awayTeamId !== gameState.team.id) return false;

        // Verify cup matches: do not display if user is already eliminated or match is an orphaned group match
        if (m.isCupMatch && m.competition) {
            const cupKey = COMPETITION_TO_CUP_KEY[m.competition];
            const cup = cupKey ? (gameState.cups as any)[cupKey] : null;
            if (cup) {
                if (cup.phase === 'knockout') {
                    const isKnockoutFixture = cup.rounds?.some((r: any) =>
                        r.fixtures?.some((f: any) =>
                            ((f.id && m.id && f.id === m.id) ||
                            (f.homeTeamId === m.homeTeamId && f.awayTeamId === m.awayTeamId && f.week === m.week))
                        )
                    );
                    if (!isKnockoutFixture) return false;
                }
                if (isTeamEliminatedFromCup(cup, gameState.team.id)) {
                    return false;
                }
            }
        }

        return true;
    });

    if (!nextMatch) {
        // Detect if there is a playoff or cup tournament currently active in this week
        let specialStageTitle = '';
        let specialStageDesc = '';

        if (gameState.team.leagueId === 'LIGA_ARGENTINA' || (gameState.team.leagueId as any) === 'liga_argentina') {
            if (targetWeek >= 17 && targetWeek <= 20) {
                const roundNames = ['Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Gran Final'];
                const roundIdx = Math.min(3, Math.max(0, targetWeek - 17));
                const stageName = roundNames[roundIdx];
                specialStageTitle = `Playoffs Apertura - ${stageName}`;
                specialStageDesc = `Se disputan los ${stageName} del Torneo Apertura. Tu equipo no participa en esta instancia; el título se definirá entre los clasificados.`;
            } else if (targetWeek >= 37 && targetWeek <= 40) {
                const roundNames = ['Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Gran Final'];
                const roundIdx = Math.min(3, Math.max(0, targetWeek - 37));
                const stageName = roundNames[roundIdx];
                specialStageTitle = `Playoffs Clausura - ${stageName}`;
                specialStageDesc = `Se disputan los ${stageName} del Torneo Clausura. Tu equipo no participa en esta instancia; el título se definirá entre los clasificados.`;
            }
        }

        return (
            <div className="apex-card p-6 sm:p-8 flex flex-col items-center justify-center min-h-[250px] text-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3 border border-emerald-500/20">
                    <UsersIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mb-1.5">
                    {specialStageTitle || 'Semana de Entrenamiento'}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-5 max-w-md">
                    {specialStageDesc || 'Sin partido oficial esta jornada. El plantel continúa con su preparación física y táctica.'}
                </p>
                <button 
                    onClick={onPlayMatch}
                    disabled={isSimulating}
                    className={`apex-btn-gold w-full max-w-xs py-3 text-xs flex items-center justify-center gap-2 ${isSimulating ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isSimulating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            <span>Simulando...</span>
                        </>
                    ) : (
                        <span>{specialStageTitle ? 'Simular Instancia' : 'Avanzar Semana'}</span>
                    )}
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
        const allCups = Object.values(gameState.cups || {}) as Array<CupCompetition | undefined>;
        for (const cup of allCups) {
            if (!cup || !cup.rounds) continue;
            for (let rIdx = 0; rIdx < cup.rounds.length; rIdx++) {
                const round = cup.rounds[rIdx];
                if (!round) continue;
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
        <div className="apex-card p-5 sm:p-6 flex flex-col justify-between h-full">
            {/* Top Bar: Match Label & Competition */}
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--apex-gold)]" />
                    <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">
                        Próximo Partido
                    </span>
                </div>
                <span className="text-[10px] font-bold text-[var(--apex-gold)] uppercase bg-[var(--apex-gold)]/10 px-2.5 py-0.5 rounded-md border border-[var(--apex-gold)]/20">
                    {stageInfo.competition} • {stageInfo.isPlayoffOrCup ? stageInfo.stage : `Fecha ${nextMatch.week}`}
                </span>
            </div>

            {/* Clean Matchup Row */}
            <div className="grid grid-cols-11 items-center my-2 w-full">
                {/* Home Team */}
                <div className="col-span-5 flex flex-col items-center text-center px-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2">
                        {homeTeamObj && <TeamLogo team={homeTeamObj} className="w-full h-full object-contain" />}
                    </div>
                    <span className="text-xs sm:text-sm font-black text-white truncate w-full" title={homeTeamObj?.name}>
                        {homeTeamObj?.shortName || homeTeamObj?.name || 'Local'}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 mt-0.5">
                        {homeTeamObj?.id === gameState.team.id ? 'Local (Tu Club)' : 'Local'}
                    </span>
                </div>

                {/* VS Badge */}
                <div className="col-span-1 flex flex-col items-center justify-center">
                    <span className="text-xs font-black text-slate-500 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                        VS
                    </span>
                </div>

                {/* Away Team */}
                <div className="col-span-5 flex flex-col items-center text-center px-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2">
                        {awayTeamObj && <TeamLogo team={awayTeamObj} className="w-full h-full object-contain" />}
                    </div>
                    <span className="text-xs sm:text-sm font-black text-white truncate w-full" title={awayTeamObj?.name}>
                        {awayTeamObj?.shortName || awayTeamObj?.name || 'Visitante'}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 mt-0.5">
                        {awayTeamObj?.id === gameState.team.id ? 'Visitante (Tu Club)' : 'Visitante'}
                    </span>
                </div>
            </div>

            {/* Venue & Time */}
            <div className="text-center text-[10px] font-medium text-slate-400 my-3">
                {isHome ? (gameState.stadium?.name || gameState.team.stadiumName || getTeamStadium(gameState.team).name) : (opponent?.stadiumName || getTeamStadium(opponent).name)} • {getMatchKickoffTime(nextMatch)}
            </div>

            <button 
                onClick={onPlayMatch}
                disabled={isSimulating}
                className={`w-full py-3.5 bg-[var(--apex-gold)] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 ${isSimulating ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                {isSimulating ? (
                    <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        <span>Simulando...</span>
                    </>
                ) : (
                    <span>{playButtonText}</span>
                )}
            </button>
        </div>
    );
};
