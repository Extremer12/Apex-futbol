import React, { useState, useMemo, useCallback } from 'react';
import { CupCompetition, GameState, Match } from '../../../types';
import { TrophyIcon } from '../../icons';
import { TournamentBracket } from '../../ui/TournamentBracket';
import { EuropeanTable } from './EuropeanTable';
import { CUP_LOGOS, CUP_THEMES } from './constants';
import { customPacksService } from '../../../services/customPacks/packService';
import { TeamLogo } from '../../../data/teams/helpers';
import { Trophy, Calendar, Table as TableIcon, Layers, Shield, ChevronRight } from 'lucide-react';

interface CupViewProps {
    cup?: CupCompetition;
    gameState: GameState;
}

export const CupView: React.FC<CupViewProps> = React.memo(({
    cup,
    gameState
}) => {
    if (!cup) return null;

    const theme = CUP_THEMES[cup.id] || CUP_THEMES.fa_cup;
    const defaultLogo = CUP_LOGOS[cup.id] || '';
    const logo = useMemo(() => customPacksService.resolveCompetitionLogo(cup.id, cup.name, defaultLogo) || '', [cup.id, cup.name, defaultLogo]);

    const teamsMap = useMemo(() => {
        const map = new Map<number, typeof gameState.allTeams[0]>();
        for (const t of gameState.allTeams) {
            map.set(t.id, t);
        }
        return map;
    }, [gameState.allTeams]);

    const getTeamById = useCallback((id: number) => teamsMap.get(id), [teamsMap]);

    // Determine available tabs
    const hasTable = !!(cup.swissTable || (cup.groups && cup.groups.length > 0));
    const hasBracket = !!(cup.rounds && cup.rounds.length > 0);

    // Initial tab selection: if in knockout or finished with bracket, default to bracket; else table
    const initialTab = (hasBracket && (cup.phase === 'knockout' || cup.phase === 'finished')) 
        ? 'bracket' 
        : hasTable 
        ? 'table' 
        : 'fixtures';

    const [activeTab, setActiveTab] = useState<'bracket' | 'table' | 'fixtures'>(initialTab);

    // Synchronize and calculate Swiss table from played matches in schedule to guarantee real-time standings
    const displaySwissTable = useMemo(() => {
        if (!cup.swissTable) return [];
        const compName = cup.id === 'champions_league' ? 'Champions_League' : 'Europa_League';
        const playedInSchedule = gameState.schedule.filter(m => m.competition === compName && m.result !== undefined);
        
        if (playedInSchedule.length > 0) {
            const rowMap = new Map<number, typeof cup.swissTable[0]>();
            cup.swissTable.forEach(r => {
                rowMap.set(r.teamId, {
                    ...r,
                    played: 0, won: 0, drawn: 0, lost: 0,
                    goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
                });
            });

            playedInSchedule.forEach(m => {
                const hRow = rowMap.get(m.homeTeamId);
                const aRow = rowMap.get(m.awayTeamId);
                if (hRow && aRow && m.result) {
                    const hScore = m.result.homeScore;
                    const aScore = m.result.awayScore;
                    hRow.played++; aRow.played++;
                    hRow.goalsFor += hScore; aRow.goalsFor += aScore;
                    hRow.goalsAgainst += aScore; aRow.goalsAgainst += hScore;
                    hRow.goalDifference = hRow.goalsFor - hRow.goalsAgainst;
                    aRow.goalDifference = aRow.goalsFor - aRow.goalsAgainst;
                    if (hScore > aScore) { hRow.won++; hRow.points += 3; aRow.lost++; }
                    else if (aScore > hScore) { aRow.won++; aRow.points += 3; hRow.lost++; }
                    else { hRow.drawn++; hRow.points += 1; aRow.drawn++; aRow.points += 1; }
                }
            });

            const sorted = Array.from(rowMap.values()).sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                if ((b.goalsFor || 0) !== (a.goalsFor || 0)) return (b.goalsFor || 0) - (a.goalsFor || 0);
                if ((b.won || 0) !== (a.won || 0)) return (b.won || 0) - (a.won || 0);
                return a.teamId - b.teamId;
            });
            sorted.forEach((r, idx) => { r.position = idx + 1; });
            return sorted;
        }

        return cup.swissTable;
    }, [cup.swissTable, cup.id, gameState.schedule]);

    const isCompetitionMatch = useCallback((compName?: string) => {
        if (!compName || !cup?.id) return false;
        const m = compName.toLowerCase().replace(/[\s_-]+/g, '');
        const cId = cup.id.toLowerCase().replace(/[\s_-]+/g, '');
        const cName = (cup.name || '').toLowerCase().replace(/[\s_-]+/g, '');

        if (m === cId || m === cName) return true;

        const aliasesMap: Record<string, string[]> = {
            championsleague: ['championsleague'],
            europaleague: ['europaleague'],
            copalibertadores: ['copalibertadores'],
            copasudamericana: ['copasudamericana'],
            facup: ['facup'],
            carabaocup: ['carabaocup'],
            copadelrey: ['copadelrey'],
            dfbpokal: ['dfbpokal'],
            coppaitalia: ['coppaitalia'],
            copaargentina: ['copaargentina'],
            copamx: ['copamx'],
            copaintercontinental: ['copaintercontinental'],
            aperturaplayoffs: ['playoffsapertura', 'aperturaplayoffs'],
            clausuraplayoffs: ['playoffsclausura', 'clausuraplayoffs'],
            nacionalreducido: ['nacionalreducido'],
            nacionalprimerascenso: ['nacionalprimerascenso']
        };

        const list = aliasesMap[cId] || [];
        return list.some(a => m === a || m.includes(a));
    }, [cup.id, cup.name]);

    const syncFixtureWithSchedule = useCallback((fix: Match, defaultStage?: string): Match => {
        const played = gameState.schedule.find(s =>
            ((fix.id && s.id && fix.id === s.id) ||
            (s.homeTeamId === fix.homeTeamId && s.awayTeamId === fix.awayTeamId && isCompetitionMatch(s.competition) &&
             (s.week === fix.week || (s.leg !== undefined && fix.leg !== undefined && s.leg === fix.leg))))
        );

        if (played) {
            return {
                ...fix,
                ...played,
                leg: fix.leg || played.leg,
                aggregateScore: played.aggregateScore || fix.aggregateScore,
                penalties: played.penalties || played.result?.penalties || fix.penalties,
                stageName: fix.stageName || (played as any).stageName || defaultStage
            };
        }

        return {
            ...fix,
            stageName: fix.stageName || defaultStage
        };
    }, [gameState.schedule, isCompetitionMatch]);

    // Extract available stage groupings for the Fixtures tab with real scheduled results
    const stages = useMemo(() => {
        const stageList: { id: string; name: string; matches: Match[] }[] = [];

        if (cup.type === 'swiss' && cup.swissFixtures) {
            // Group Swiss fixtures into Jornada 1 to 8
            const distinctWeeks = Array.from(new Set<number>(cup.swissFixtures.map(m => m.week || 0))).sort((a: number, b: number) => a - b);
            distinctWeeks.forEach((w, idx) => {
                const rawMatches = cup.swissFixtures!.filter(m => (m.week || 0) === w);
                const syncedMatches = rawMatches.map(m => syncFixtureWithSchedule(m, `Jornada ${idx + 1}`));
                if (syncedMatches.length > 0) {
                    stageList.push({
                        id: `swiss_j${idx + 1}`,
                        name: `Jornada ${idx + 1}`,
                        matches: syncedMatches
                    });
                }
            });
        } else if (cup.type === 'groups' && cup.groups && cup.groups.length > 0) {
            // Group strictly into Fechas 1 to 6 from group fixtures
            const allGroupFixtures = cup.groups.flatMap(g => g.fixtures);
            const distinctWeeks = Array.from(new Set<number>(allGroupFixtures.map(m => m.week || 0))).sort((a: number, b: number) => a - b);
            distinctWeeks.forEach((w, idx) => {
                const rawMatches = allGroupFixtures.filter(m => (m.week || 0) === w);
                const syncedMatches = rawMatches.map(m => syncFixtureWithSchedule(m, `Fecha ${idx + 1}`));
                if (syncedMatches.length > 0) {
                    stageList.push({
                        id: `group_f${idx + 1}`,
                        name: `Fecha ${idx + 1}`,
                        matches: syncedMatches
                    });
                }
            });
        }

        // Add Knockout rounds (including BOTH Ida and Vuelta fixtures)
        if (cup.rounds && cup.rounds.length > 0) {
            cup.rounds.forEach((r, idx) => {
                const leg1Matches = (r.fixtures || []).map(f => syncFixtureWithSchedule({ ...f, leg: f.leg || 1 }, r.name));
                const leg2Matches = (r.secondLegFixtures || []).map(f => syncFixtureWithSchedule({ ...f, leg: 2 }, r.name));
                const combinedMatches = [...leg1Matches, ...leg2Matches];

                if (combinedMatches.length > 0) {
                    stageList.push({
                        id: `round_${idx}`,
                        name: r.name,
                        matches: combinedMatches
                    });
                }
            });
        }

        return stageList;
    }, [cup, syncFixtureWithSchedule]);

    const [selectedStageId, setSelectedStageId] = useState<string>('');
    const currentStage = useMemo(() => {
        if (selectedStageId) {
            const found = stages.find(s => s.id === selectedStageId);
            if (found) return found;
        }

        // Context-aware default based on tournament progression:
        // 1. If in knockout phase, default to the currently active knockout round
        if (cup.phase === 'knockout' && cup.rounds && cup.rounds.length > 0) {
            const activeRoundStage = stages.find(s => s.id === `round_${cup.currentRoundIndex}`);
            if (activeRoundStage) return activeRoundStage;
        }

        // 2. If in group phase, default to the current active matchday
        if (cup.phase === 'groups') {
            const currentFecha = stages.find(s => s.id.startsWith('group_') && s.matches.some(m => !m.result));
            if (currentFecha) return currentFecha;
        }

        // 3. If in swiss phase, default to the current active jornada
        if (cup.phase === 'swiss') {
            const currentJornada = stages.find(s => s.id.startsWith('swiss_') && s.matches.some(m => !m.result));
            if (currentJornada) return currentJornada;
        }

        // 4. Default to first stage with matches, or fallback to first
        return stages.find(s => s.matches.length > 0) || stages[0];
    }, [stages, selectedStageId, cup.phase, cup.currentRoundIndex, cup.rounds]);

    const [onlyUserClub, setOnlyUserClub] = useState(false);

    const currentRound = cup.rounds?.[cup.currentRoundIndex];
    const isFinished = !!cup.winnerId;

    const roundNameMap: Record<string, string> = {
        'Final': 'Gran Final',
        'Semi-Final': 'Semifinales',
        'Quarter-Final': 'Cuartos de Final',
        'Round of 16': 'Octavos de Final',
        'Round of 32': 'Dieciseisavos de Final',
        'Playoffs 16vos': 'Playoffs 16vos',
        'Playoff 16vos': 'Playoffs 16vos',
        'Final Intercontinental': 'Duelo por la Gloria Eterna'
    };

    const currentStageTitle = currentRound ? (roundNameMap[currentRound.name] || currentRound.name) : (cup.phase === 'swiss' ? 'Fase de Liga' : cup.phase === 'groups' ? 'Fase de Grupos' : 'Finalizada');

    return (
        <div className={`bg-gradient-to-br ${theme.bg} border-2 ${theme.border} rounded-3xl shadow-2xl overflow-hidden animate-fade-in`}>
            {/* Header */}
            <div className="relative px-6 py-6 border-b border-white/5 overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                            <img 
                                src={logo || '/sinlogo.png'} 
                                alt={cup.name} 
                                onError={(e) => { (e.target as HTMLImageElement).src = '/sinlogo.png'; }}
                                className="w-full h-full object-contain drop-shadow-2xl" 
                            />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">{cup.name}</h2>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                                <span className={`font-bold uppercase tracking-widest text-[10px] md:text-xs ${theme.accent}`}>
                                    {cup.type === 'swiss' ? 'Fase de Liga Suiza (36 Clubes)' : cup.type === 'groups' ? 'Torneo Internacional (Grupos + Eliminatorias)' : 'Torneo Eliminatorio'}
                                </span>
                                <span className="text-slate-600 hidden md:block">•</span>
                                <span className="text-slate-400 text-xs md:text-sm font-medium">{currentStageTitle}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Navigation Tabs */}
                    <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 gap-1 self-start md:self-auto shadow-lg">
                        {hasBracket && (
                            <button
                                onClick={() => setActiveTab('bracket')}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                    activeTab === 'bracket'
                                        ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Trophy className="w-3.5 h-3.5" />
                                <span>Cuadro Eliminatorio</span>
                            </button>
                        )}

                        {hasTable && (
                            <button
                                onClick={() => setActiveTab('table')}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                    activeTab === 'table'
                                        ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <TableIcon className="w-3.5 h-3.5" />
                                <span>{cup.type === 'swiss' ? 'Fase de Liga (36)' : 'Fase de Grupos'}</span>
                            </button>
                        )}

                        <button
                            onClick={() => setActiveTab('fixtures')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeTab === 'fixtures'
                                    ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Partidos y Resultados</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="p-3 sm:p-6">
                {/* 1. BRACKET VIEW */}
                {activeTab === 'bracket' && (
                    <div className="space-y-4">
                        {!currentRound && !isFinished && (
                            <div className="text-center py-16 text-slate-500">
                                <TrophyIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="font-bold uppercase tracking-widest">La fase eliminatoria no ha comenzado</p>
                            </div>
                        )}
                        <div className="w-full overflow-hidden">
                            <TournamentBracket
                                cup={cup}
                                getTeamById={getTeamById}
                                playerTeamId={gameState.team.id}
                                theme={theme}
                                logoUrl={logo}
                            />
                        </div>
                    </div>
                )}

                {/* 2. TABLE / STANDINGS VIEW */}
                {activeTab === 'table' && (
                    <div className="space-y-6">
                        {cup.swissTable && (
                            <EuropeanTable
                                table={displaySwissTable}
                                title={cup.name}
                                logoUrl={logo}
                                theme={cup.id === 'champions_league' ? 'indigo' : 'slate'}
                                gameState={gameState}
                            />
                        )}

                        {cup.groups && cup.groups.length > 0 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {cup.groups.map((group, idx) => {
                                        const sortedTable = [...group.table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
                                        return (
                                            <div key={idx} className="bg-slate-900/70 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                                                <div className="bg-gradient-to-r from-amber-600/30 to-amber-900/20 px-4 py-3 border-b border-amber-500/30 flex justify-between items-center">
                                                    <h4 className="text-amber-300 font-black text-sm uppercase tracking-tight flex items-center gap-2">
                                                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                                                        {group.name}
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-amber-400/70 uppercase">
                                                        Fecha {group.fixtures.filter(f => f.result).length > 0 ? `${Math.min(6, Math.floor(group.fixtures.filter(f => f.result).length / 2))}/6` : '0/6'}
                                                    </span>
                                                </div>
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="text-slate-400 uppercase text-[9px] font-black border-b border-white/5 bg-black/20">
                                                            <th className="px-3 py-2 text-center w-8">Pos</th>
                                                            <th className="px-3 py-2 text-left">Club</th>
                                                            <th className="px-2 py-2 text-center w-8">PJ</th>
                                                            <th className="px-2 py-2 text-center w-8">DG</th>
                                                            <th className="px-3 py-2 text-center w-10 font-black text-amber-400">Pts</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {sortedTable.map((row, rIdx) => {
                                                            const team = getTeamById(row.teamId);
                                                            const isPlayer = team?.id === gameState.team.id;
                                                            const isQualified = rIdx < 2;
                                                            const isSudamericana = rIdx === 2 && cup.id === 'copa_libertadores';

                                                            return (
                                                                <tr key={rIdx} className={isPlayer ? 'bg-amber-500/15 font-semibold' : 'hover:bg-white/[0.02]'}>
                                                                    <td className="px-3 py-2 text-center relative font-bold">
                                                                        <div className={`w-1 h-4 rounded-full absolute left-1.5 top-1/2 -translate-y-1/2 ${
                                                                            isQualified ? 'bg-emerald-500' : isSudamericana ? 'bg-cyan-400' : 'bg-rose-500/40'
                                                                        }`} />
                                                                        <span className={isPlayer ? 'text-amber-300' : isQualified ? 'text-emerald-400' : 'text-slate-400'}>
                                                                            {rIdx + 1}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-3 py-2 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                                                                <TeamLogo team={team} className="w-full h-full object-contain" />
                                                                            </div>
                                                                            <span className={`font-bold truncate ${isPlayer ? 'text-amber-300 font-black' : isQualified ? 'text-white' : 'text-slate-300'}`}>
                                                                                {team?.name || 'Club'}
                                                                            </span>
                                                                            {isPlayer && (
                                                                                <span className="text-[7.5px] font-black uppercase text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-1 py-0.5 rounded border border-[var(--apex-gold)]/20 shrink-0">
                                                                                    Tu Club
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-2 py-2 text-center text-slate-400">{row.played}</td>
                                                                    <td className={`px-2 py-2 text-center font-bold ${
                                                                        row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'
                                                                    }`}>
                                                                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-center font-black text-white">{row.points}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-4 bg-slate-950/70 border border-white/10 rounded-2xl flex flex-wrap gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span className="font-bold text-slate-300">1.º y 2.º Puesto:</span>
                                        <span className="text-emerald-400">Clasifican a Octavos de Final</span>
                                    </div>
                                    {cup.id === 'copa_libertadores' && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                                            <span className="font-bold text-slate-300">3.º Puesto:</span>
                                            <span className="text-cyan-300">Playoffs Copa Sudamericana</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                                        <span className="font-bold text-slate-300">4.º Puesto:</span>
                                        <span className="text-rose-400">Eliminado</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. FIXTURES & RESULTS BROWSER */}
                {activeTab === 'fixtures' && (
                    <div className="space-y-6">
                        {/* Stage Selector Pill Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                                {stages.map(stage => {
                                    const isSelected = currentStage?.id === stage.id;
                                    const completedCount = stage.matches.filter(m => m.result).length;
                                    const totalCount = stage.matches.length;

                                    return (
                                        <button
                                            key={stage.id}
                                            onClick={() => setSelectedStageId(stage.id)}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                                                isSelected
                                                    ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                                            }`}
                                        >
                                            <span>{roundNameMap[stage.name] || stage.name}</span>
                                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                                                isSelected ? 'bg-black/20 text-slate-950' : 'bg-white/10 text-slate-400'
                                            }`}>
                                                {completedCount}/{totalCount}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* User Club Filter Toggle */}
                            <button
                                onClick={() => setOnlyUserClub(!onlyUserClub)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 self-start sm:self-auto ${
                                    onlyUserClub
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                        : 'bg-white/5 text-slate-400 border border-white/5 hover:text-white'
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <span>Solo {gameState.team.name}</span>
                            </button>
                        </div>

                        {/* Matches Grid */}
                        {currentStage && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {currentStage.matches
                                    .filter(m => !onlyUserClub || (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id))
                                    .map((match, mIdx) => {
                                        const home = getTeamById(match.homeTeamId);
                                        const away = getTeamById(match.awayTeamId);
                                        const isHomeUser = home?.id === gameState.team.id;
                                        const isAwayUser = away?.id === gameState.team.id;
                                        const isUserMatch = isHomeUser || isAwayUser;
                                        const isPlayed = match.result !== undefined;

                                        const homeScore = match.result?.homeScore ?? '-';
                                        const awayScore = match.result?.awayScore ?? '-';
                                        const pens = match.penalties || match.result?.penalties;

                                        return (
                                            <div
                                                key={mIdx}
                                                className={`p-3.5 rounded-2xl border transition-all ${
                                                    isUserMatch
                                                        ? 'bg-amber-500/[0.08] border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20'
                                                        : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                {/* Match Header */}
                                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>Semana {match.week} • {match.isMidweek ? 'Miércoles' : 'Fin de Semana'}</span>
                                                        {match.leg && (
                                                            <span className="px-1.5 py-0.2 rounded text-[8.5px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                                {match.leg === 1 ? 'Ida' : 'Vuelta'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                                        isPlayed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400'
                                                    }`}>
                                                        {isPlayed ? 'Finalizado' : 'Por Jugar'}
                                                    </span>
                                                </div>

                                                {/* Teams & Score */}
                                                <div className="space-y-2">
                                                    {/* Home Row */}
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                                <TeamLogo team={home} className="w-full h-full object-contain" />
                                                            </div>
                                                            <span className={`text-xs font-bold truncate ${
                                                                isHomeUser ? 'text-amber-300 font-black' : 'text-slate-200'
                                                            }`}>
                                                                {home?.name || 'Local'}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm font-black w-7 text-center ${
                                                            isPlayed && match.result && match.result.homeScore > match.result.awayScore
                                                                ? 'text-white'
                                                                : 'text-slate-400'
                                                        }`}>
                                                            {homeScore}
                                                        </span>
                                                    </div>

                                                    {/* Away Row */}
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                                <TeamLogo team={away} className="w-full h-full object-contain" />
                                                            </div>
                                                            <span className={`text-xs font-bold truncate ${
                                                                isAwayUser ? 'text-amber-300 font-black' : 'text-slate-200'
                                                            }`}>
                                                                {away?.name || 'Visitante'}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm font-black w-7 text-center ${
                                                            isPlayed && match.result && match.result.awayScore > match.result.homeScore
                                                                ? 'text-white'
                                                                : 'text-slate-400'
                                                        }`}>
                                                            {awayScore}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Aggregate Score Notice for 2nd Leg */}
                                                {match.aggregateScore && (
                                                    <div className="mt-2 text-center text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-500/10 py-0.5 rounded border border-cyan-500/20">
                                                        Global: {home?.name || 'Local'} {match.aggregateScore.home} - {match.aggregateScore.away} {away?.name || 'Visitante'}
                                                    </div>
                                                )}

                                                {/* Penalties Notice if happened */}
                                                {pens && (
                                                    <div className="mt-1.5 text-center text-[10px] font-bold text-amber-400 bg-amber-500/10 py-0.5 rounded border border-amber-500/20">
                                                        Definición por penales: {pens.home} - {pens.away}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

