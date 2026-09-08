import React, { useState, useMemo } from 'react';
import { CupCompetition, Match, Team } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';
import { Trophy, ChevronRight, ChevronLeft, Layers, GitFork } from 'lucide-react';

interface TournamentBracketProps {
    cup: CupCompetition;
    getTeamById: (id: number) => Team | undefined;
    playerTeamId: number;
    theme: { accent: string; bg: string; border: string };
    logoUrl: string;
}

interface ProjectedParticipant {
    team?: Team;
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
    'Round 1': '16vos de Final',
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
    if (match.result.penalties) {
        return match.result.penalties.home > match.result.penalties.away ? match.homeTeamId : match.awayTeamId;
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
    const [viewMode, setViewMode] = useState<'TREE' | 'LEFT' | 'FINAL' | 'RIGHT' | 'ROUNDS'>('TREE');
    const [selectedRoundTab, setSelectedRoundTab] = useState<number>(0);

    // Build tournament tree with projected rounds
    const tournamentTree = useMemo(() => {
        const existingRounds = cup.rounds || [];
        if (existingRounds.length === 0) return null;

        const round0 = existingRounds[0];
        const numInitialFixtures = round0.fixtures.length;

        // Determine total rounds (e.g. 16 fixtures = 5 rounds: 16 -> 8 -> 4 -> 2 -> 1)
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
                            penalties: actualFixture.penalties?.home || actualFixture.result?.penalties?.home,
                            isWinner: winnerId === homeTeam?.id,
                        },
                        away: {
                            team: awayTeam,
                            placeholder: awayTeam?.name || 'Visitante',
                            score: actualFixture.result?.awayScore,
                            penalties: actualFixture.penalties?.away || actualFixture.result?.penalties?.away,
                            isWinner: winnerId === awayTeam?.id,
                        },
                        isCompleted,
                        isCurrent: rIdx === cup.currentRoundIndex,
                        isPlayerMatch,
                        penalties: actualFixture.penalties || actualFixture.result?.penalties,
                    });
                } else {
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
                        ? `Ganador L.${mIdx * 2 + 1}`
                        : `Llave ${mIdx * 2 + 1}`;

                    const awayPlaceholder = awayWinner
                        ? awayWinner.name
                        : prevMatch2
                        ? `Ganador L.${mIdx * 2 + 2}`
                        : `Llave ${mIdx * 2 + 2}`;

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
    const semiFinalRound = totalRounds >= 2 ? tournamentTree[totalRounds - 2] : null;

    // Pre-final rounds for bifurcated desktop view
    const preFinalRounds = tournamentTree.slice(0, totalRounds - 1);

    // Left columns: first half of matches in each pre-final round (Round 0 -> Round N-2)
    const leftColumns = preFinalRounds.map(r => ({
        name: ROUND_NAME_MAP[r.name] || r.name,
        roundIndex: r.roundIndex,
        matches: r.matches.slice(0, Math.ceil(r.matches.length / 2)),
    }));

    // Right columns: second half of matches in each pre-final round, reversed for desktop (Semi -> First Round)
    const rightColumnsDesktop = [...preFinalRounds].reverse().map(r => ({
        name: ROUND_NAME_MAP[r.name] || r.name,
        roundIndex: r.roundIndex,
        matches: r.matches.slice(Math.ceil(r.matches.length / 2)),
    }));

    // Right columns in chronological order for mobile viewing (First Round -> Semi)
    const rightColumnsMobile = preFinalRounds.map(r => ({
        name: ROUND_NAME_MAP[r.name] || r.name,
        roundIndex: r.roundIndex,
        matches: r.matches.slice(Math.ceil(r.matches.length / 2)),
    }));

    // Special single-match tournament (e.g. Final Intercontinental)
    if (totalRounds === 1) {
        return (
            <div className="w-full space-y-4">
                {winner && (
                    <div className={`flex items-center justify-center gap-3 p-4 rounded-xl border ${theme.border} bg-white/5 text-center`}>
                        <Trophy className={`w-8 h-8 ${theme.accent} animate-bounce`} />
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Campeón</p>
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
                <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${theme.border} bg-gradient-to-r from-amber-500/15 via-slate-900 to-black shadow-lg`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                            <Trophy className={`w-6 h-6 ${theme.accent}`} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Campeón del Torneo</span>
                            <h3 className="text-base sm:text-lg font-black text-white leading-tight">{winner.name}</h3>
                        </div>
                    </div>
                    {logoUrl && (
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                            <img src={logoUrl} alt="" className="w-full h-full object-contain drop-shadow" />
                        </div>
                    )}
                </div>
            )}

            {/* View Mode Switcher Pills */}
            <div className="flex items-center justify-between gap-1 bg-[#0A0E17]/90 p-1.5 rounded-xl border border-white/10 text-[10px] font-bold overflow-x-auto">
                <button
                    onClick={() => setViewMode('TREE')}
                    className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
                        viewMode === 'TREE' ? 'bg-amber-400 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Cuadro</span>
                </button>
                <button
                    onClick={() => setViewMode('LEFT')}
                    className={`sm:hidden flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-center transition-all ${
                        viewMode === 'LEFT' ? 'bg-amber-400 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Cuadro Izq
                </button>
                <button
                    onClick={() => setViewMode('FINAL')}
                    className={`sm:hidden flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
                        viewMode === 'FINAL' ? 'bg-amber-400 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    🏆 Final
                </button>
                <button
                    onClick={() => setViewMode('RIGHT')}
                    className={`sm:hidden flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-center transition-all ${
                        viewMode === 'RIGHT' ? 'bg-amber-400 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Cuadro Der
                </button>
                <button
                    onClick={() => setViewMode('ROUNDS')}
                    className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
                        viewMode === 'ROUNDS' ? 'bg-amber-400 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Por Rondas</span>
                </button>
            </div>

            {/* MAIN BIFURCATED BRACKET (TREE VIEW) */}
            {viewMode === 'TREE' && (
                <div className="w-full bg-[#080C15]/95 border border-white/10 rounded-2xl p-2 sm:p-4 overflow-x-auto shadow-2xl">
                    <div className="flex items-stretch justify-between gap-2 sm:gap-3 min-w-[620px] w-full py-2">
                        {/* LEFT BRACKET */}
                        <div className="flex items-stretch justify-between flex-1 gap-2">
                            {leftColumns.map((col, cIdx) => (
                                <div key={`left_${cIdx}`} className="flex-1 min-w-[75px] max-w-[110px] flex flex-col">
                                    {/* Header */}
                                    <div className="text-center pb-2.5">
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-300 truncate block bg-white/5 py-1 px-1 rounded-md border border-white/5">
                                            {formatCompactRoundName(col.name)}
                                        </span>
                                    </div>
                                    {/* Matches */}
                                    <div className="flex flex-col justify-around flex-1 gap-2 relative">
                                        {col.matches.map((match) => (
                                            <div key={match.id} className="relative flex items-center">
                                                <MatchCard match={match} playerTeamId={playerTeamId} theme={theme} />
                                                {/* Connector to next round */}
                                                {cIdx < leftColumns.length - 1 && (
                                                    <div className="hidden sm:block absolute -right-2 top-1/2 w-2 h-0.5 bg-white/10" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CENTER COLUMN: Perfectly Aligned Final Match */}
                        <div className="w-[95px] sm:w-[115px] shrink-0 flex flex-col items-center justify-between px-1 z-10">
                            {/* Cup Trophy Header */}
                            <div className="text-center pb-2.5 w-full">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-400 truncate block bg-amber-500/10 py-1 px-1 rounded-md border border-amber-500/30">
                                    🏆 Gran Final
                                </span>
                            </div>

                            {/* Center Final Match Card, vertically centered with Semifinals */}
                            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                                {finalMatch && (
                                    <div className="w-full relative">
                                        {/* Connector lines from Left and Right Semis */}
                                        <div className="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-amber-400/50" />
                                        <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-amber-400/50" />
                                        <MatchCard match={finalMatch} playerTeamId={playerTeamId} theme={theme} isFinal />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT BRACKET (Reversed order for desktop symmetry: Semis -> Cuartos -> Octavos -> 16vos) */}
                        <div className="flex items-stretch justify-between flex-1 gap-2">
                            {rightColumnsDesktop.map((col, cIdx) => (
                                <div key={`right_${cIdx}`} className="flex-1 min-w-[75px] max-w-[110px] flex flex-col">
                                    {/* Header */}
                                    <div className="text-center pb-2.5">
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-300 truncate block bg-white/5 py-1 px-1 rounded-md border border-white/5">
                                            {formatCompactRoundName(col.name)}
                                        </span>
                                    </div>
                                    {/* Matches */}
                                    <div className="flex flex-col justify-around flex-1 gap-2 relative">
                                        {col.matches.map((match) => (
                                            <div key={match.id} className="relative flex items-center">
                                                {/* Connector to previous round on the left */}
                                                {cIdx > 0 && (
                                                    <div className="hidden sm:block absolute -left-2 top-1/2 w-2 h-0.5 bg-white/10" />
                                                )}
                                                <MatchCard match={match} playerTeamId={playerTeamId} theme={theme} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MOBILE TAB: CUADRO IZQUIERDO */}
            {viewMode === 'LEFT' && (
                <div className="bg-[#080C15]/95 border border-white/10 rounded-2xl p-3 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-xs font-black uppercase text-amber-400">
                        <ChevronLeft className="w-4 h-4" />
                        <span>Cuadro Izquierdo (Hacia la Final)</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {leftColumns.map((col, cIdx) => (
                            <div key={`mob_l_${cIdx}`} className="flex-1 min-w-[75px] flex flex-col gap-2">
                                <div className="text-[10px] font-black uppercase text-center text-slate-400 bg-white/5 py-1 rounded">
                                    {formatCompactRoundName(col.name)}
                                </div>
                                <div className="flex flex-col justify-around flex-1 gap-2">
                                    {col.matches.map(m => (
                                        <MatchCard key={m.id} match={m} playerTeamId={playerTeamId} theme={theme} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MOBILE TAB: GRAN FINAL */}
            {viewMode === 'FINAL' && (
                <div className="bg-[#080C15]/95 border border-white/10 rounded-2xl p-4 space-y-4">
                    <div className="text-center space-y-1">
                        <div className="w-12 h-12 mx-auto p-2 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center">
                            {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-contain" /> : <Trophy className="w-7 h-7 text-amber-400" />}
                        </div>
                        <h4 className="text-sm font-black text-amber-400 uppercase tracking-widest">Definición del Título</h4>
                    </div>

                    {/* Semifinalists leading into the final */}
                    {semiFinalRound && semiFinalRound.matches.length >= 2 && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase text-slate-400 text-center block">Semifinal A</span>
                                <MatchCard match={semiFinalRound.matches[0]} playerTeamId={playerTeamId} theme={theme} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase text-slate-400 text-center block">Semifinal B</span>
                                <MatchCard match={semiFinalRound.matches[1]} playerTeamId={playerTeamId} theme={theme} />
                            </div>
                        </div>
                    )}

                    {/* Final Match Card */}
                    {finalMatch && (
                        <div className="pt-2 border-t border-white/10">
                            <span className="text-[10px] font-black uppercase text-amber-400 text-center block mb-2">★ Gran Final ★</span>
                            <div className="max-w-[140px] mx-auto">
                                <MatchCard match={finalMatch} playerTeamId={playerTeamId} theme={theme} isFinal />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MOBILE TAB: CUADRO DERECHO (In natural chronological order) */}
            {viewMode === 'RIGHT' && (
                <div className="bg-[#080C15]/95 border border-white/10 rounded-2xl p-3 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-black uppercase text-amber-400">
                        <span>Cuadro Derecho (Hacia la Final)</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {rightColumnsMobile.map((col, cIdx) => (
                            <div key={`mob_r_${cIdx}`} className="flex-1 min-w-[75px] flex flex-col gap-2">
                                <div className="text-[10px] font-black uppercase text-center text-slate-400 bg-white/5 py-1 rounded">
                                    {formatCompactRoundName(col.name)}
                                </div>
                                <div className="flex flex-col justify-around flex-1 gap-2">
                                    {col.matches.map(m => (
                                        <MatchCard key={m.id} match={m} playerTeamId={playerTeamId} theme={theme} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: POR RONDAS (Clean List View with Full Details) */}
            {viewMode === 'ROUNDS' && (
                <div className="bg-[#080C15]/95 border border-white/10 rounded-2xl p-3 space-y-3">
                    {/* Round Pills Switcher */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {tournamentTree.map((r, idx) => (
                            <button
                                key={r.name}
                                onClick={() => setSelectedRoundTab(idx)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                                    selectedRoundTab === idx
                                        ? 'bg-amber-400 text-slate-950 shadow-md'
                                        : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                {ROUND_NAME_MAP[r.name] || r.name}
                            </button>
                        ))}
                    </div>

                    {/* Matches List for Selected Round */}
                    {tournamentTree[selectedRoundTab] && (
                        <div className="space-y-2 pt-1">
                            {tournamentTree[selectedRoundTab].matches.map((m, idx) => (
                                <DetailedMatchRow
                                    key={m.id}
                                    match={m}
                                    matchNumber={idx + 1}
                                    playerTeamId={playerTeamId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Footer Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1 text-[9px] text-slate-400">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-400" />
                        <span>Tu Equipo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500" />
                        <span>Ganador</span>
                    </div>
                </div>
                <span className="text-slate-500 italic">Llaves simétricas convergentes hacia la Gran Final</span>
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
    if (lower.includes('32') || lower.includes('dieciseis') || lower.includes('16vos')) return '16vos';
    return name;
};

// Compact Match Card showing team crest, short name and scores
const MatchCard: React.FC<{
    match: ProjectedMatch;
    playerTeamId: number;
    theme: { accent: string; bg: string; border: string };
    isFinal?: boolean;
}> = ({ match, playerTeamId, theme, isFinal }) => {
    const isPlayerMatch = match.isPlayerMatch;
    const isHomePlayer = match.home.team?.id === playerTeamId;
    const isAwayPlayer = match.away.team?.id === playerTeamId;

    const getDisplayName = (team?: Team, placeholder?: string) => {
        if (!team) return placeholder || '?';
        return team.shortName || (team.name.length > 8 ? team.name.slice(0, 7) + '…' : team.name);
    };

    return (
        <div
            className={`w-full max-w-[100px] mx-auto rounded-xl border transition-all overflow-hidden shadow-sm ${
                isFinal
                    ? 'border-amber-400 bg-gradient-to-b from-amber-500/25 via-slate-900 to-black ring-2 ring-amber-400/50'
                    : isPlayerMatch
                    ? 'border-amber-400/80 bg-gradient-to-b from-amber-500/15 via-slate-900 to-[#121828] ring-1.5 ring-amber-400/40'
                    : 'border-white/10 bg-[#121828]/95 hover:border-white/20'
            }`}
        >
            {/* Home Row */}
            <div
                className={`flex items-center justify-between px-1.5 py-1 gap-1 transition-colors ${
                    match.home.isWinner
                        ? 'bg-emerald-500/25'
                        : isHomePlayer
                        ? 'bg-amber-400/20'
                        : ''
                }`}
            >
                <div className="flex items-center gap-1 min-w-0 flex-1">
                    <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                        {match.home.team ? (
                            <TeamLogo team={match.home.team} className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-3.5 h-3.5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[7px] text-slate-400 font-bold">
                                ?
                            </div>
                        )}
                    </div>
                    <span
                        className={`text-[8.5px] font-bold truncate ${
                            isHomePlayer ? 'text-amber-300 font-black' : 'text-slate-300'
                        }`}
                        title={match.home.team?.name || match.home.placeholder}
                    >
                        {getDisplayName(match.home.team, match.home.placeholder)}
                    </span>
                </div>
                <span
                    className={`text-[10px] font-black shrink-0 px-0.5 ${
                        match.home.isWinner
                            ? 'text-emerald-400 font-black'
                            : isHomePlayer
                            ? 'text-amber-300'
                            : 'text-slate-200'
                    }`}
                >
                    {match.isCompleted ? match.home.score : '-'}
                </span>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Away Row */}
            <div
                className={`flex items-center justify-between px-1.5 py-1 gap-1 transition-colors ${
                    match.away.isWinner
                        ? 'bg-emerald-500/25'
                        : isAwayPlayer
                        ? 'bg-amber-400/20'
                        : ''
                }`}
            >
                <div className="flex items-center gap-1 min-w-0 flex-1">
                    <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                        {match.away.team ? (
                            <TeamLogo team={match.away.team} className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-3.5 h-3.5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[7px] text-slate-400 font-bold">
                                ?
                            </div>
                        )}
                    </div>
                    <span
                        className={`text-[8.5px] font-bold truncate ${
                            isAwayPlayer ? 'text-amber-300 font-black' : 'text-slate-300'
                        }`}
                        title={match.away.team?.name || match.away.placeholder}
                    >
                        {getDisplayName(match.away.team, match.away.placeholder)}
                    </span>
                </div>
                <span
                    className={`text-[10px] font-black shrink-0 px-0.5 ${
                        match.away.isWinner
                            ? 'text-emerald-400 font-black'
                            : isAwayPlayer
                            ? 'text-amber-300'
                            : 'text-slate-200'
                    }`}
                >
                    {match.isCompleted ? match.away.score : '-'}
                </span>
            </div>

            {/* Penalties indicator */}
            {match.penalties && (
                <div className="bg-amber-500/20 text-amber-300 text-[7.5px] font-black text-center py-0.5 border-t border-amber-400/20">
                    {match.penalties.home}-{match.penalties.away}p
                </div>
            )}
        </div>
    );
};

// Detailed Match Row for "Por Rondas" view
const DetailedMatchRow: React.FC<{
    match: ProjectedMatch;
    matchNumber: number;
    playerTeamId: number;
}> = ({ match, matchNumber, playerTeamId }) => {
    const isHomePlayer = match.home.team?.id === playerTeamId;
    const isAwayPlayer = match.away.team?.id === playerTeamId;

    return (
        <div
            className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                match.isPlayerMatch
                    ? 'bg-amber-500/10 border-amber-400/40 ring-1 ring-amber-400/30'
                    : 'bg-white/[0.03] border-white/5 hover:border-white/15'
            }`}
        >
            <span className="text-[9px] font-bold text-slate-500 w-5">#{matchNumber}</span>

            {/* Home Team */}
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <span
                    className={`text-xs font-bold truncate text-right ${
                        match.home.isWinner
                            ? 'text-emerald-400 font-black'
                            : isHomePlayer
                            ? 'text-amber-300 font-black'
                            : 'text-slate-200'
                    }`}
                >
                    {match.home.team?.name || match.home.placeholder}
                </span>
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                    {match.home.team ? (
                        <TeamLogo team={match.home.team} className="w-full h-full object-contain" />
                    ) : (
                        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-slate-400">?</div>
                    )}
                </div>
            </div>

            {/* Score / Status */}
            <div className="px-3 py-1 bg-black/40 rounded-lg border border-white/10 mx-2 text-center min-w-[55px]">
                {match.isCompleted ? (
                    <div>
                        <div className="text-xs font-black text-white">
                            {match.home.score} - {match.away.score}
                        </div>
                        {match.penalties && (
                            <div className="text-[8px] font-bold text-amber-400">
                                ({match.penalties.home}-{match.penalties.away} pen)
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">VS</span>
                )}
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                    {match.away.team ? (
                        <TeamLogo team={match.away.team} className="w-full h-full object-contain" />
                    ) : (
                        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-slate-400">?</div>
                    )}
                </div>
                <span
                    className={`text-xs font-bold truncate ${
                        match.away.isWinner
                            ? 'text-emerald-400 font-black'
                            : isAwayPlayer
                            ? 'text-amber-300 font-black'
                            : 'text-slate-200'
                    }`}
                >
                    {match.away.team?.name || match.away.placeholder}
                </span>
            </div>
        </div>
    );
};
