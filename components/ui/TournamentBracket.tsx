import React, { useState, useMemo } from 'react';
import { CupCompetition, Match } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';
import { TrophyIcon } from '../icons';
import { Trophy, Swords, ChevronRight, ChevronLeft } from 'lucide-react';

interface TournamentBracketProps {
    cup: CupCompetition;
    getTeamById: (id: number) => any;
    playerTeamId: number;
    theme: { accent: string; bg: string; border: string };
    logoUrl: string;
}

interface ProjectedParticipant {
    team?: any;
    placeholder: string;
    score?: number;
    penalties?: number;
    isWinner?: boolean;
}

interface ProjectedMatch {
    id: string;
    home: ProjectedParticipant;
    away: ProjectedParticipant;
    isCompleted: boolean;
    isCurrent: boolean;
    isPlayerMatch: boolean;
    penalties?: { home: number; away: number };
}

interface ProjectedRound {
    name: string;
    roundIndex: number;
    matches: ProjectedMatch[];
}

const ROUND_NAME_MAP: Record<string, string> = {
    'Round of 32': 'Dieciseisavos',
    'Round of 16': 'Octavos de Final',
    'Octavos de Final': 'Octavos de Final',
    'Octavos': 'Octavos de Final',
    'Quarter-Final': 'Cuartos de Final',
    'Cuartos de Final': 'Cuartos de Final',
    'Cuartos': 'Cuartos de Final',
    'Semi-Final': 'Semifinales',
    'Semifinales': 'Semifinales',
    'Semis': 'Semifinales',
    'Final': 'Gran Final',
    'Gran Final': 'Gran Final',
    'Final Intercontinental': 'Final Intercontinental',
    'Final Primer Ascenso': 'Final Primer Ascenso',
};

const getMatchWinnerId = (match?: Match): number | null => {
    if (!match || !match.result) return null;
    const { homeScore, awayScore } = match.result;
    if (homeScore > awayScore) return match.homeTeamId;
    if (awayScore > homeScore) return match.awayTeamId;
    if (match.penalties) {
        return match.penalties.home > match.penalties.away ? match.homeTeamId : match.awayTeamId;
    }
    return null;
};

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
    cup,
    getTeamById,
    playerTeamId,
    theme,
    logoUrl,
}) => {
    const [viewMode, setViewMode] = useState<'ALL' | 'LEFT' | 'FINAL' | 'RIGHT'>('ALL');

    // Build the tournament tree including future projected rounds
    const tournamentTree = useMemo(() => {
        const existingRounds = cup.rounds || [];
        if (existingRounds.length === 0) return null;

        const round0 = existingRounds[0];
        const numInitialFixtures = round0.fixtures.length;

        // Determine total rounds for power-of-2 tournament
        // E.g. 16 fixtures = 5 rounds, 8 fixtures = 4 rounds, 4 fixtures = 3 rounds, 2 fixtures = 2 rounds, 1 fixture = 1 round
        let totalRounds = 1;
        let fixturesInRound = numInitialFixtures;
        while (fixturesInRound > 1) {
            fixturesInRound = Math.ceil(fixturesInRound / 2);
            totalRounds++;
        }

        const standardRoundNames = (count: number): string[] => {
            if (count === 1) return ['Final'];
            if (count === 2) return ['Semi-Final', 'Final'];
            if (count === 3) return ['Quarter-Final', 'Semi-Final', 'Final'];
            if (count === 4) return ['Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'];
            if (count === 5) return ['Round of 32', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'];
            return Array.from({ length: count }, (_, i) => `Ronda ${i + 1}`);
        };

        const roundTitles = standardRoundNames(totalRounds);
        const projectedRounds: ProjectedRound[] = [];

        // Build round by round
        for (let rIdx = 0; rIdx < totalRounds; rIdx++) {
            const expectedMatchCount = Math.max(1, Math.floor(numInitialFixtures / Math.pow(2, rIdx)));
            const actualRound = existingRounds[rIdx];
            const roundName = actualRound?.name || roundTitles[rIdx] || `Ronda ${rIdx + 1}`;
            const roundMatches: ProjectedMatch[] = [];

            for (let mIdx = 0; mIdx < expectedMatchCount; mIdx++) {
                const actualFixture = actualRound?.fixtures?.[mIdx];

                if (actualFixture) {
                    const homeTeam = getTeamById(actualFixture.homeTeamId);
                    const awayTeam = getTeamById(actualFixture.awayTeamId);
                    const winnerId = getMatchWinnerId(actualFixture);
                    const isCompleted = actualFixture.result !== undefined;
                    const isPlayerMatch = homeTeam?.id === playerTeamId || awayTeam?.id === playerTeamId;

                    roundMatches.push({
                        id: `r${rIdx}_m${mIdx}`,
                        home: {
                            team: homeTeam,
                            placeholder: homeTeam?.name || 'Local',
                            score: actualFixture.result?.homeScore,
                            penalties: actualFixture.penalties?.home,
                            isWinner: winnerId === homeTeam?.id,
                        },
                        away: {
                            team: awayTeam,
                            placeholder: awayTeam?.name || 'Visitante',
                            score: actualFixture.result?.awayScore,
                            penalties: actualFixture.penalties?.away,
                            isWinner: winnerId === awayTeam?.id,
                        },
                        isCompleted,
                        isCurrent: rIdx === cup.currentRoundIndex,
                        isPlayerMatch,
                        penalties: actualFixture.penalties,
                    });
                } else {
                    // Projected match from previous round
                    const prevRound = projectedRounds[rIdx - 1];
                    const prevMatch1 = prevRound?.matches?.[mIdx * 2];
                    const prevMatch2 = prevRound?.matches?.[mIdx * 2 + 1];

                    const homeWinner = prevMatch1?.isCompleted
                        ? (prevMatch1.home.isWinner ? prevMatch1.home.team : prevMatch1.away.team)
                        : null;

                    const awayWinner = prevMatch2?.isCompleted
                        ? (prevMatch2.home.isWinner ? prevMatch2.home.team : prevMatch2.away.team)
                        : null;

                    const homePlaceholder = homeWinner
                        ? homeWinner.name
                        : prevMatch1
                        ? `Ganador ${prevMatch1.home.team?.shortName || prevMatch1.home.placeholder} vs ${prevMatch1.away.team?.shortName || prevMatch1.away.placeholder}`
                        : `Ganador Llave ${mIdx * 2 + 1}`;

                    const awayPlaceholder = awayWinner
                        ? awayWinner.name
                        : prevMatch2
                        ? `Ganador ${prevMatch2.home.team?.shortName || prevMatch2.home.placeholder} vs ${prevMatch2.away.team?.shortName || prevMatch2.away.placeholder}`
                        : `Ganador Llave ${mIdx * 2 + 2}`;

                    const isPlayerMatch = homeWinner?.id === playerTeamId || awayWinner?.id === playerTeamId;

                    roundMatches.push({
                        id: `r${rIdx}_m${mIdx}`,
                        home: {
                            team: homeWinner,
                            placeholder: homePlaceholder,
                            isWinner: false,
                        },
                        away: {
                            team: awayWinner,
                            placeholder: awayPlaceholder,
                            isWinner: false,
                        },
                        isCompleted: false,
                        isCurrent: rIdx === cup.currentRoundIndex,
                        isPlayerMatch,
                    });
                }
            }

            projectedRounds.push({
                name: roundName,
                roundIndex: rIdx,
                matches: roundMatches,
            });
        }

        return projectedRounds;
    }, [cup, getTeamById, playerTeamId]);

    if (!tournamentTree || tournamentTree.length === 0) return null;

    const winner = cup.winnerId ? getTeamById(cup.winnerId) : null;
    const totalRounds = tournamentTree.length;
    const finalRound = tournamentTree[totalRounds - 1];
    const finalMatch = finalRound?.matches[0];

    // Left rounds are the first half of matches in each pre-final round
    // Right rounds are the second half of matches in each pre-final round
    const preFinalRounds = tournamentTree.slice(0, totalRounds - 1);

    const leftColumns = preFinalRounds.map(r => ({
        name: ROUND_NAME_MAP[r.name] || r.name,
        roundIndex: r.roundIndex,
        matches: r.matches.slice(0, Math.ceil(r.matches.length / 2)),
    }));

    // For right side, reversed order from pre-final down to first round
    const rightColumns = [...preFinalRounds].reverse().map(r => ({
        name: ROUND_NAME_MAP[r.name] || r.name,
        roundIndex: r.roundIndex,
        matches: r.matches.slice(Math.ceil(r.matches.length / 2)),
    }));

    // Special single-match tournament (e.g. Final 1º Ascenso)
    if (totalRounds === 1) {
        return (
            <div className="w-full space-y-4">
                {winner && (
                    <div className={`flex items-center justify-center gap-3 p-4 rounded-xl border ${theme.border} bg-white/5 text-center`}>
                        <Trophy className={`w-8 h-8 ${theme.accent} animate-bounce`} />
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Campeón Ascendido</p>
                            <h3 className="text-xl font-black text-white">{winner.name}</h3>
                        </div>
                    </div>
                )}
                {finalMatch && (
                    <div className="max-w-md mx-auto">
                        <MatchCard match={finalMatch} playerTeamId={playerTeamId} theme={theme} isFinal />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full space-y-3 select-none">
            {/* Winner Banner */}
            {winner && (
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${theme.border} bg-white/5`}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <Trophy className={`w-5 h-5 ${theme.accent}`} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campeón</span>
                            <h3 className="text-base sm:text-lg font-black text-white leading-tight">{winner.name}</h3>
                        </div>
                    </div>
                    {logoUrl && (
                        <div className="w-8 h-8 shrink-0">
                            <img src={logoUrl} alt="" className="w-full h-full object-contain drop-shadow" />
                        </div>
                    )}
                </div>
            )}

            {/* Mobile View Selector Pills (Allows full overview or focusing without horizontal scroll) */}
            <div className="flex sm:hidden items-center justify-between gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[10px] font-bold">
                <button
                    onClick={() => setViewMode('ALL')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                        viewMode === 'ALL' ? 'bg-white text-slate-950 font-black shadow' : 'text-slate-400'
                    }`}
                >
                    Vista Completa
                </button>
                <button
                    onClick={() => setViewMode('LEFT')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                        viewMode === 'LEFT' ? 'bg-white text-slate-950 font-black shadow' : 'text-slate-400'
                    }`}
                >
                    Cuadro Izq
                </button>
                <button
                    onClick={() => setViewMode('FINAL')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                        viewMode === 'FINAL' ? 'bg-white text-slate-950 font-black shadow' : 'text-slate-400'
                    }`}
                >
                    🏆 Final
                </button>
                <button
                    onClick={() => setViewMode('RIGHT')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                        viewMode === 'RIGHT' ? 'bg-white text-slate-950 font-black shadow' : 'text-slate-400'
                    }`}
                >
                    Cuadro Der
                </button>
            </div>

            {/* Main Bifurcated Bracket Container: streamlined and compact without requiring massive horizontal scroll */}
            <div className="w-full bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-2 sm:p-4 overflow-x-auto shadow-2xl">
                {/* Desktop and Tablet: Bifurcated Left - Center - Right Grid */}
                <div className={`${viewMode === 'ALL' ? 'flex' : 'hidden sm:flex'} items-stretch justify-between gap-1.5 sm:gap-2.5 md:gap-3.5 min-w-fit w-full py-2`}>
                    {/* LEFT BRACKET (From First Round towards Semi-Final) */}
                    <div className="flex items-stretch justify-between flex-1 gap-1.5 sm:gap-2.5">
                        {leftColumns.map((col, cIdx) => (
                            <div key={`left_${cIdx}`} className="flex-1 min-w-[56px] sm:min-w-[64px] md:min-w-[72px] flex flex-col">
                                {/* Round Header */}
                                <div className="text-center pb-2">
                                    <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-300 truncate block bg-white/5 py-0.5 px-1 rounded-md border border-white/5">
                                        {formatCompactRoundName(col.name)}
                                    </span>
                                </div>
                                {/* Matches Column */}
                                <div className="flex flex-col justify-around flex-1 gap-1.5 sm:gap-2">
                                    {col.matches.map((match) => (
                                        <MatchCard
                                            key={match.id}
                                            match={match}
                                            playerTeamId={playerTeamId}
                                            theme={theme}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CENTER (Gran Final + Cup Trophy) */}
                    <div className="w-[74px] sm:w-[86px] md:w-[98px] shrink-0 flex flex-col items-center justify-center px-1 z-10">
                        {/* Cup Icon / Logo */}
                        <div className="flex flex-col items-center mb-2 text-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 p-1.5 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center shadow-xl relative group">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="" className="w-full h-full object-contain drop-shadow" />
                                ) : (
                                    <Trophy className={`w-6 h-6 sm:w-7 sm:h-7 ${theme.accent}`} />
                                )}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[9px] text-slate-950 font-black shadow">
                                    ★
                                </div>
                            </div>
                            <span className="text-[9px] sm:text-[11px] font-black text-amber-400 uppercase tracking-wider mt-1">
                                Final
                            </span>
                        </div>

                        {/* Final Match Card */}
                        {finalMatch && (
                            <div className="w-full">
                                <MatchCard
                                    match={finalMatch}
                                    playerTeamId={playerTeamId}
                                    theme={theme}
                                    isFinal
                                />
                            </div>
                        )}
                    </div>

                    {/* RIGHT BRACKET (From Semi-Final backwards to First Round) */}
                    <div className="flex items-stretch justify-between flex-1 gap-1.5 sm:gap-2.5">
                        {rightColumns.map((col, cIdx) => (
                            <div key={`right_${cIdx}`} className="flex-1 min-w-[56px] sm:min-w-[64px] md:min-w-[72px] flex flex-col">
                                {/* Round Header */}
                                <div className="text-center pb-2">
                                    <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-300 truncate block bg-white/5 py-0.5 px-1 rounded-md border border-white/5">
                                        {formatCompactRoundName(col.name)}
                                    </span>
                                </div>
                                {/* Matches Column */}
                                <div className="flex flex-col justify-around flex-1 gap-1.5 sm:gap-2">
                                    {col.matches.map((match) => (
                                        <MatchCard
                                            key={match.id}
                                            match={match}
                                            playerTeamId={playerTeamId}
                                            theme={theme}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Tab-Focused View (When user selects Cuadro Izq, Final, or Cuadro Der on tiny screens) */}
                <div className="block sm:hidden">
                    {viewMode === 'LEFT' && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-xs font-black uppercase text-slate-300">
                                <ChevronLeft className="w-4 h-4 text-amber-400" />
                                <span>Cuadro Izquierdo</span>
                            </div>
                            <div className="flex gap-2">
                                {leftColumns.map((col, cIdx) => (
                                    <div key={`mob_left_${cIdx}`} className="flex-1 flex flex-col gap-2 min-w-[56px]">
                                        <div className="text-[10px] font-black uppercase text-center text-slate-400 bg-white/5 py-1 rounded">
                                            {formatCompactRoundName(col.name)}
                                        </div>
                                        <div className="flex flex-col justify-around flex-1 gap-2">
                                            {col.matches.map((match) => (
                                                <MatchCard key={match.id} match={match} playerTeamId={playerTeamId} theme={theme} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {viewMode === 'FINAL' && finalMatch && (
                        <div className="space-y-3 py-3 max-w-[120px] mx-auto text-center">
                            <div className="w-14 h-14 mx-auto p-2 bg-white/10 rounded-2xl border border-white/15 flex items-center justify-center">
                                {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-contain" /> : <Trophy className="w-8 h-8 text-amber-400" />}
                            </div>
                            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">Gran Final</h4>
                            <MatchCard match={finalMatch} playerTeamId={playerTeamId} theme={theme} isFinal />
                        </div>
                    )}

                    {viewMode === 'RIGHT' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-end gap-2 pb-2 border-b border-white/10 text-xs font-black uppercase text-slate-300">
                                <span>Cuadro Derecho</span>
                                <ChevronRight className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="flex gap-2">
                                {rightColumns.map((col, cIdx) => (
                                    <div key={`mob_right_${cIdx}`} className="flex-1 flex flex-col gap-2 min-w-[56px]">
                                        <div className="text-[10px] font-black uppercase text-center text-slate-400 bg-white/5 py-1 rounded">
                                            {formatCompactRoundName(col.name)}
                                        </div>
                                        <div className="flex flex-col justify-around flex-1 gap-2">
                                            {col.matches.map((match) => (
                                                <MatchCard key={match.id} match={match} playerTeamId={playerTeamId} theme={theme} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Explanatory footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 text-[9px] sm:text-[10px] text-slate-400">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/20 border border-amber-400" />
                        <span>Tu Equipo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500" />
                        <span>Ganador de Llave</span>
                    </div>
                </div>
                <span className="text-slate-500 italic">Cada cruce avanza hacia la Gran Final central</span>
            </div>
        </div>
    );
};

const formatCompactRoundName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('final') && !lower.includes('semi') && !lower.includes('cuart')) return 'Final';
    if (lower.includes('semi')) return 'Semis';
    if (lower.includes('cuart') || lower.includes('quarter')) return 'Cuartos';
    if (lower.includes('16') || lower.includes('octav')) return 'Octavos';
    if (lower.includes('32') || lower.includes('dieciseis')) return '16vos';
    return name;
};

// Compact Match Card showing ONLY team crests, scores and status
const MatchCard: React.FC<{
    match: ProjectedMatch;
    playerTeamId: number;
    theme: { accent: string; bg: string; border: string };
    isFinal?: boolean;
}> = ({ match, playerTeamId, theme, isFinal }) => {
    const isPlayerMatch = match.isPlayerMatch;
    const isHomePlayer = match.home.team?.id === playerTeamId;
    const isAwayPlayer = match.away.team?.id === playerTeamId;

    const tooltipText = match.home.team && match.away.team
        ? `${match.home.team.name} ${match.isCompleted ? match.home.score : ''} vs ${match.isCompleted ? match.away.score : ''} ${match.away.team.name}`
        : `${match.home.team?.name || match.home.placeholder} vs ${match.away.team?.name || match.away.placeholder}`;

    return (
        <div
            className={`w-full max-w-[62px] sm:max-w-[70px] mx-auto rounded-xl border transition-all overflow-hidden shadow-sm hover:shadow-md ${
                isFinal
                    ? 'border-amber-400/80 bg-gradient-to-b from-amber-500/20 via-slate-900 to-black ring-2 ring-amber-400/40'
                    : isPlayerMatch
                    ? 'border-amber-400/80 bg-gradient-to-b from-amber-500/15 via-slate-900 to-[#121828] ring-1.5 ring-amber-400/50'
                    : 'border-white/10 bg-[#121828]/95 hover:border-white/25'
            }`}
            title={tooltipText}
        >
            {/* Home Row */}
            <div
                className={`flex items-center justify-between px-1.5 py-1 transition-colors ${
                    match.home.isWinner
                        ? 'bg-emerald-500/25'
                        : isHomePlayer
                        ? 'bg-amber-400/20'
                        : ''
                }`}
                title={match.home.team?.name || match.home.placeholder}
            >
                <div className={`w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 flex items-center justify-center ${isHomePlayer ? 'ring-1.5 ring-amber-400 rounded-full' : ''}`}>
                    {match.home.team ? (
                        <TeamLogo team={match.home.team} />
                    ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[7px] text-slate-400 font-bold">
                            ?
                        </div>
                    )}
                </div>
                <span
                    className={`text-[11px] sm:text-xs font-black pl-1 shrink-0 ${
                        match.home.isWinner
                            ? 'text-emerald-400 font-black'
                            : isHomePlayer
                            ? 'text-amber-300 font-black'
                            : 'text-slate-300'
                    }`}
                >
                    {match.isCompleted ? match.home.score : '-'}
                </span>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Away Row */}
            <div
                className={`flex items-center justify-between px-1.5 py-1 transition-colors ${
                    match.away.isWinner
                        ? 'bg-emerald-500/25'
                        : isAwayPlayer
                        ? 'bg-amber-400/20'
                        : ''
                }`}
                title={match.away.team?.name || match.away.placeholder}
            >
                <div className={`w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 flex items-center justify-center ${isAwayPlayer ? 'ring-1.5 ring-amber-400 rounded-full' : ''}`}>
                    {match.away.team ? (
                        <TeamLogo team={match.away.team} />
                    ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[7px] text-slate-400 font-bold">
                            ?
                        </div>
                    )}
                </div>
                <span
                    className={`text-[11px] sm:text-xs font-black pl-1 shrink-0 ${
                        match.away.isWinner
                            ? 'text-emerald-400 font-black'
                            : isAwayPlayer
                            ? 'text-amber-300 font-black'
                            : 'text-slate-300'
                    }`}
                >
                    {match.isCompleted ? match.away.score : '-'}
                </span>
            </div>

            {/* Penalty shootout badge */}
            {match.penalties && (
                <div className="bg-amber-500/20 text-amber-300 text-[8px] sm:text-[9px] font-black text-center py-0.5 border-t border-amber-400/20 tracking-tighter">
                    {match.penalties.home}-{match.penalties.away}p
                </div>
            )}
        </div>
    );
};
