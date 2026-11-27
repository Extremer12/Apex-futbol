import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GameState, Match, Team, LeagueId } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';
import { ALL_COMPETITIONS, CompetitionItem } from './league/constants';
import { getMatchKickoffTime } from '../../services/seasonUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { BottomSheet, EmptyState } from './transfers/TransferUI';

interface CalendarScreenProps {
    gameState: GameState;
}

const COMP_LOOKUP = new Map<string, CompetitionItem>();
for (const c of ALL_COMPETITIONS) {
    COMP_LOOKUP.set(c.id, c);
    COMP_LOOKUP.set(c.name.toLowerCase(), c);
}

const SOUTH_AMERICA_LEAGUES = new Set<string>([
    LeagueId.LIGA_ARGENTINA,
    LeagueId.PRIMERA_NACIONAL,
    LeagueId.BRASILEIRAO,
    LeagueId.SERIE_B_BR,
    LeagueId.COPA_DE_PRIMERA,
    LeagueId.LIGA_MX,
    LeagueId.LIGA_EXPANSION_MX,
    LeagueId.PRIMERA_DIVISION_CHILE,
    LeagueId.PRIMERA_B_CHILE,
    LeagueId.PRIMERA_A_COLOMBIA,
    LeagueId.PRIMERA_B_COLOMBIA,
    LeagueId.LIGA_URUGUAYA,
    LeagueId.LIGA_ECUADOR,
    LeagueId.MLS
]);

const EUROPEAN_MONTHS = ['Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
const SOUTH_AMERICAN_MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getCompetitionDetails(compName?: string, isCupMatch?: boolean, isMidweek?: boolean) {
    const comp = compName || '';
    const found = COMP_LOOKUP.get(comp) || COMP_LOOKUP.get(comp.toLowerCase().replace(/_/g, ' '));

    let label = found?.name || comp.replace(/_/g, ' ');
    let isInt = false;
    let isDomesticCup = false;

    if (comp.includes('Champions') || comp.includes('Europa') || comp.includes('Libertadores') || comp.includes('Sudamericana') || comp.includes('Recopa') || comp.includes('Club_World') || comp.includes('Mundial') || comp.includes('Intercontinental')) {
        isInt = true;
    } else if (isCupMatch || comp.includes('Cup') || comp.includes('Copa') || comp.includes('Pokal') || comp.includes('Playoffs') || comp.includes('Reducido')) {
        isDomesticCup = true;
    }

    if (comp.includes('Torneo_Apertura') || comp.includes('Torneo Apertura')) label = 'Torneo Apertura';
    else if (comp.includes('Torneo_Clausura') || comp.includes('Torneo Clausura')) label = 'Torneo Clausura';
    else if (comp.includes('Club_World_Cup')) label = 'Mundial de Clubes';
    else if (comp.includes('Recopa_Sudamericana')) label = 'Recopa Sudamericana';
    else if (comp.includes('FA_Cup') || comp.includes('FA Cup')) label = 'FA Cup';
    else if (comp.includes('Carabao_Cup') || comp.includes('Carabao Cup')) label = 'Carabao Cup';
    else if (comp.includes('Copa_Argentina') || comp.includes('Copa Argentina')) label = 'Copa Argentina';
    else if (comp.includes('Copa_del_Rey') || comp.includes('Copa del Rey')) label = 'Copa del Rey';
    else if (comp.includes('DFB_Pokal') || comp.includes('DFB Pokal')) label = 'DFB-Pokal';
    else if (comp.includes('Coppa_Italia') || comp.includes('Coppa Italia')) label = 'Coppa Italia';

    return {
        label,
        isInt,
        isDomesticCup,
        isLeague: !isInt && !isDomesticCup,
        turnName: isMidweek ? 'Entre semana' : 'Fin de semana'
    };
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ gameState }) => {
    const [viewMode, setViewMode] = useState<'MY_CLUB' | 'ALL_MATCHES'>('MY_CLUB');
    const [filter, setFilter] = useState<'ALL' | 'LEAGUE' | 'DOMESTIC_CUP' | 'INT_CUP'>('ALL');
    const [selectedWeek, setSelectedWeek] = useState<number>(Math.max(1, gameState.currentWeek));
    const [selectedDetailMatch, setSelectedDetailMatch] = useState<Match | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedWeek(Math.max(1, gameState.currentWeek));
    }, [gameState.currentWeek]);

    const teamMap = useMemo(() => {
        const map = new Map<number, Team>();
        if (gameState.allTeams) {
            for (const t of gameState.allTeams) map.set(t.id, t);
        }
        return map;
    }, [gameState.allTeams]);

    const isSouthAmerica = SOUTH_AMERICA_LEAGUES.has(gameState.team.leagueId);

    const getMonthName = (week: number) => {
        const months = isSouthAmerica ? SOUTH_AMERICAN_MONTHS : EUROPEAN_MONTHS;
        const index = Math.min(Math.floor((week - 1) / 4), months.length - 1);
        return months[Math.max(0, index)] || months[months.length - 1];
    };

    const maxWeek = useMemo(() => {
        let max = 1;
        for (const m of gameState.schedule) {
            if (m.week > max) max = m.week;
        }
        return gameState.schedule.length > 0 ? max : 38;
    }, [gameState.schedule]);

    const weeks = useMemo(() => Array.from({ length: maxWeek }, (_, i) => i + 1), [maxWeek]);

    const myClubMatches = useMemo(() => {
        return gameState.schedule
            .filter(m => m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id)
            .sort((a, b) => a.week !== b.week ? a.week - b.week : (a.isMidweek ? 1 : 0) - (b.isMidweek ? 1 : 0));
    }, [gameState.schedule, gameState.team.id]);

    const filteredMyClubMatches = useMemo(() => {
        return myClubMatches.filter(m => {
            if (filter === 'ALL') return true;
            const compDetails = getCompetitionDetails(m.competition, m.isCupMatch, m.isMidweek);
            if (filter === 'LEAGUE') return compDetails.isLeague;
            if (filter === 'DOMESTIC_CUP') return compDetails.isDomesticCup;
            return compDetails.isInt;
        });
    }, [myClubMatches, filter]);

    const weekMatches = useMemo(() => {
        const matches = gameState.schedule.filter(m => {
            if (m.week !== selectedWeek) return false;
            const home = teamMap.get(m.homeTeamId);
            const away = teamMap.get(m.awayTeamId);
            if (!home || !away) return false;

            const isPlayerInvolved = m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id;
            const compDetails = getCompetitionDetails(m.competition, m.isCupMatch, m.isMidweek);

            if (!isPlayerInvolved && !(!m.isCupMatch && home.leagueId === gameState.team.leagueId) && !compDetails.isDomesticCup && !compDetails.isInt) {
                return false;
            }

            if (filter === 'LEAGUE') return !m.isCupMatch;
            if (filter === 'DOMESTIC_CUP') return compDetails.isDomesticCup;
            if (filter === 'INT_CUP') return compDetails.isInt;
            return true;
        });

        return {
            weekendMatches: matches.filter(m => !m.isMidweek),
            midweekMatches: matches.filter(m => !!m.isMidweek)
        };
    }, [gameState.schedule, selectedWeek, gameState.team.id, gameState.team.leagueId, filter, teamMap]);

    const matchesGroupedByMonth = useMemo(() => {
        const groups: { month: string; matches: Match[] }[] = [];
        let currentMonth = '';
        let currentGroup: Match[] = [];

        for (const m of filteredMyClubMatches) {
            const month = getMonthName(m.week);
            if (month !== currentMonth) {
                if (currentGroup.length > 0) groups.push({ month: currentMonth, matches: currentGroup });
                currentMonth = month;
                currentGroup = [m];
            } else {
                currentGroup.push(m);
            }
        }
        if (currentGroup.length > 0) groups.push({ month: currentMonth, matches: currentGroup });
        return groups;
    }, [filteredMyClubMatches, isSouthAmerica]);

    useEffect(() => {
        const activeBtn = document.getElementById(`week-btn-${selectedWeek}`);
        if (activeBtn && scrollRef.current) {
            scrollRef.current.scrollTo({
                left: activeBtn.offsetLeft - scrollRef.current.offsetWidth / 2 + activeBtn.offsetWidth / 2,
                behavior: 'smooth'
            });
        }
    }, [selectedWeek, viewMode]);

    const nextWeek = gameState.currentWeek;
    const isMidweekTurn = gameState.currentTurn === 'midweek';

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4 pb-24 animate-fade-in max-w-5xl mx-auto">
            {/* 1. COMPACT HEADER */}
            <header className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">Calendario</h1>
                    <span className="text-[11px] font-bold text-slate-400 truncate block">
                        Semana {gameState.currentWeek} · {gameState.currentTurn === 'midweek' ? 'Entre semana (Copa)' : 'Fin de semana (Liga)'}
                    </span>
                </div>
                <div className="px-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 text-right shrink-0">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">Partidos</span>
                    <span className="text-sm font-black text-[var(--apex-gold)] leading-none tabular-nums">
                        {myClubMatches.length}
                    </span>
                </div>
            </header>

            {/* 2. STICKY TABS */}
            <nav className="sticky top-0 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-1.5 bg-[var(--apex-darker,#070A13)]/95 backdrop-blur space-y-2">
                <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-2xl">
                    <button
                        onClick={() => setViewMode('MY_CLUB')}
                        className={`h-10 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                            viewMode === 'MY_CLUB' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Mi Club
                    </button>
                    <button
                        onClick={() => setViewMode('ALL_MATCHES')}
                        className={`h-10 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                            viewMode === 'ALL_MATCHES' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Fecha por Fecha
                    </button>
                </div>

                {/* Competition Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {([
                        { id: 'ALL', label: 'Todos' },
                        { id: 'LEAGUE', label: 'Liga' },
                        { id: 'DOMESTIC_CUP', label: 'Copa Nacional' },
                        { id: 'INT_CUP', label: 'Internacional' },
                    ] as const).map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                filter === f.id
                                    ? 'bg-white text-slate-950 font-black'
                                    : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* VIEW 1: MY CLUB */}
            {viewMode === 'MY_CLUB' ? (
                <div className="space-y-5">
                    {matchesGroupedByMonth.length === 0 ? (
                        <div className="apex-card rounded-2xl">
                            <EmptyState
                                icon={<CalendarIcon className="w-6 h-6" />}
                                title="Sin partidos para este filtro"
                                text="Prueba seleccionando otra competición o 'Todos'."
                            />
                        </div>
                    ) : (
                        matchesGroupedByMonth.map((group, gIdx) => (
                            <section key={gIdx} className="space-y-2.5">
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">{group.month}</span>
                                    <div className="h-px bg-white/10 flex-1" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 apex-grid-deferred">
                                    {group.matches.map((match, mIdx) => {
                                        const isHome = match.homeTeamId === gameState.team.id;
                                        const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
                                        const opponent = teamMap.get(opponentId);
                                        const compDetails = getCompetitionDetails(match.competition, match.isCupMatch, match.isMidweek);
                                        const isPlayed = match.result !== undefined;
                                        const isCurrentMatch = !isPlayed && match.week === nextWeek && !!match.isMidweek === isMidweekTurn;

                                        return (
                                            <div
                                                key={mIdx}
                                                onClick={() => isPlayed && setSelectedDetailMatch(match)}
                                                className={`apex-card p-3.5 rounded-2xl flex flex-col justify-between gap-2.5 transition-colors ${
                                                    isPlayed ? 'cursor-pointer hover:border-white/25' : ''
                                                } ${isCurrentMatch ? 'border-[var(--apex-gold)] bg-[var(--apex-gold)]/[0.04]' : ''}`}
                                            >
                                                <div className="flex items-center justify-between gap-2 text-[10px]">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className={`px-2 py-0.5 rounded-md font-black uppercase tracking-wider truncate max-w-[130px] border ${
                                                            compDetails.isInt
                                                                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                                                : compDetails.isDomesticCup
                                                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                                                : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                                        }`}>
                                                            {compDetails.label}
                                                        </span>
                                                        <span className="text-slate-400 font-semibold truncate">
                                                            F{match.week} · {compDetails.turnName}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                                            isHome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                                                        }`}>
                                                            {isHome ? 'LOC' : 'VIS'}
                                                        </span>
                                                        {isCurrentMatch && (
                                                            <span className="px-2 py-0.5 rounded bg-[var(--apex-gold)] text-slate-950 text-[9px] font-black uppercase">
                                                                Próximo
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 py-0.5">
                                                    <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                                                        <span className="text-xs font-black text-white truncate text-right">{gameState.team.name}</span>
                                                        <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                                                            <TeamLogo team={gameState.team} className="w-full h-full object-contain" />
                                                        </div>
                                                    </div>

                                                    <div className="w-16 shrink-0 flex flex-col items-center justify-center">
                                                        {isPlayed ? (
                                                            <>
                                                                <span className="px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 font-black text-xs text-white tabular-nums">
                                                                    {isHome ? match.result!.homeScore : match.result!.awayScore} - {isHome ? match.result!.awayScore : match.result!.homeScore}
                                                                </span>
                                                                {match.penalties && (
                                                                    <span className="text-[8px] font-bold text-amber-400 mt-0.5">
                                                                        ({isHome ? match.penalties.home : match.penalties.away}-{isHome ? match.penalties.away : match.penalties.home} p.)
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg tabular-nums">
                                                                {getMatchKickoffTime(match)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                                                        <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                                                            <TeamLogo team={opponent} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-300 truncate text-left">
                                                            {opponent?.name || 'Por definir'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isPlayed && (
                                                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-1.5">
                                                        <span>Finalizado</span>
                                                        <span className="text-[var(--apex-gold)] font-bold">Ver ficha</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))
                    )}
                </div>
            ) : (
                /* VIEW 2: MATCHDAY BY MATCHDAY */
                <div className="space-y-3">
                    {/* Week Selector */}
                    <div className="apex-card p-3 rounded-2xl flex items-center justify-between gap-2">
                        <button
                            onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
                            disabled={selectedWeek === 1}
                            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-white cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2">
                            <select
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(parseInt(e.target.value, 10))}
                                className="bg-[#0D1220] text-white font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-white/10 focus:border-[var(--apex-gold)] focus:outline-none cursor-pointer"
                            >
                                {weeks.map(w => (
                                    <option key={w} value={w}>Jornada {w} · {getMonthName(w)}</option>
                                ))}
                            </select>

                            {selectedWeek !== gameState.currentWeek && (
                                <button
                                    onClick={() => setSelectedWeek(Math.max(1, gameState.currentWeek))}
                                    className="px-2.5 py-1.5 rounded-xl bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 text-[10px] font-black uppercase cursor-pointer"
                                >
                                    Hoy
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setSelectedWeek(prev => Math.min(maxWeek, prev + 1))}
                            disabled={selectedWeek === maxWeek}
                            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-white cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Horizontal Week Strip */}
                    <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                        {weeks.map(week => (
                            <button
                                key={week}
                                id={`week-btn-${week}`}
                                onClick={() => setSelectedWeek(week)}
                                className={`shrink-0 w-9 h-9 flex flex-col items-center justify-center rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                                    selectedWeek === week
                                        ? 'bg-[var(--apex-gold)] border-[var(--apex-gold)] text-slate-950 font-black'
                                        : week === gameState.currentWeek
                                        ? 'bg-white/5 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]'
                                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                <span>{week}</span>
                            </button>
                        ))}
                    </div>

                    {/* Weekend vs Midweek */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="apex-card rounded-2xl overflow-hidden flex flex-col">
                            <div className="px-4 py-2.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                                <h3 className="font-black text-white text-xs uppercase tracking-wider">Fin de Semana (Liga)</h3>
                                <span className="text-[10px] text-slate-400 font-bold">{weekMatches.weekendMatches.length}</span>
                            </div>
                            <div className="divide-y divide-white/5 p-2">
                                {weekMatches.weekendMatches.length === 0 ? (
                                    <p className="p-6 text-center text-slate-500 text-xs">Sin partidos de liga en esta jornada.</p>
                                ) : (
                                    weekMatches.weekendMatches.map((m, idx) => renderCleanMatchRow(m, idx, gameState, setSelectedDetailMatch, teamMap))
                                )}
                            </div>
                        </div>

                        <div className="apex-card rounded-2xl overflow-hidden flex flex-col">
                            <div className="px-4 py-2.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                                <h3 className="font-black text-white text-xs uppercase tracking-wider">Entre Semana (Copas)</h3>
                                <span className="text-[10px] text-slate-400 font-bold">{weekMatches.midweekMatches.length}</span>
                            </div>
                            <div className="divide-y divide-white/5 p-2">
                                {weekMatches.midweekMatches.length === 0 ? (
                                    <p className="p-6 text-center text-slate-500 text-xs">Sin partidos de copa en esta jornada.</p>
                                ) : (
                                    weekMatches.midweekMatches.map((m, idx) => renderCleanMatchRow(m, idx, gameState, setSelectedDetailMatch, teamMap))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Match Detail BottomSheet */}
            <BottomSheet
                open={!!(selectedDetailMatch && selectedDetailMatch.result)}
                onClose={() => setSelectedDetailMatch(null)}
                title={selectedDetailMatch ? getCompetitionDetails(selectedDetailMatch.competition, selectedDetailMatch.isCupMatch, selectedDetailMatch.isMidweek).label : undefined}
                footer={
                    <button
                        onClick={() => setSelectedDetailMatch(null)}
                        className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Cerrar
                    </button>
                }
            >
                {selectedDetailMatch && selectedDetailMatch.result && (() => {
                    const home = teamMap.get(selectedDetailMatch.homeTeamId);
                    const away = teamMap.get(selectedDetailMatch.awayTeamId);
                    return (
                        <div className="space-y-4">
                            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2">
                                <div className="flex-1 flex flex-col items-center text-center min-w-0">
                                    <div className="w-10 h-10 mb-1.5 flex items-center justify-center">
                                        <TeamLogo team={home} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-xs font-black text-white truncate max-w-full">{home?.name}</span>
                                </div>

                                <div className="w-20 shrink-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black text-white tabular-nums">
                                        {selectedDetailMatch.result.homeScore} - {selectedDetailMatch.result.awayScore}
                                    </span>
                                    {selectedDetailMatch.penalties && (
                                        <span className="text-[9px] font-bold text-amber-400 mt-0.5">
                                            Pen: {selectedDetailMatch.penalties.home}-{selectedDetailMatch.penalties.away}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col items-center text-center min-w-0">
                                    <div className="w-10 h-10 mb-1.5 flex items-center justify-center">
                                        <TeamLogo team={away} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-xs font-black text-white truncate max-w-full">{away?.name}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Goleadores</h4>
                                {selectedDetailMatch.result.scorers && selectedDetailMatch.result.scorers.length > 0 ? (
                                    <div className="space-y-1">
                                        {selectedDetailMatch.result.scorers.map((scorer, sIdx) => (
                                            <div key={sIdx} className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                                                <span className="font-bold text-white">{scorer.playerName}</span>
                                                <span className="text-slate-400 font-bold tabular-nums">{scorer.minute}'</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500">Sin goles anotados.</p>
                                )}
                            </div>

                            {selectedDetailMatch.result.events && selectedDetailMatch.result.events.length > 0 && (
                                <div className="space-y-1.5">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Incidencias</h4>
                                    {selectedDetailMatch.result.events.map((evt, eIdx) => (
                                        <p key={eIdx} className="text-[11px] text-slate-300 leading-relaxed bg-white/[0.02] p-2 rounded-xl border border-white/5">
                                            {evt}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </BottomSheet>
        </div>
    );
};

function renderCleanMatchRow(
    match: Match,
    idx: number,
    gameState: GameState,
    onSelectMatch: (m: Match) => void,
    teamMap: Map<number, Team>
) {
    const home = teamMap.get(match.homeTeamId);
    const away = teamMap.get(match.awayTeamId);
    const isPlayerMatch = match.homeTeamId === gameState.team.id || match.awayTeamId === gameState.team.id;
    const isPlayed = match.result !== undefined;

    return (
        <div
            key={idx}
            onClick={() => isPlayed && onSelectMatch(match)}
            className={`p-2.5 rounded-xl transition-colors flex items-center justify-between gap-2 ${
                isPlayed ? 'cursor-pointer hover:bg-white/5' : ''
            } ${isPlayerMatch ? 'bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30' : ''}`}
        >
            <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                <span className={`text-xs truncate text-right ${
                    isPlayerMatch && match.homeTeamId === gameState.team.id ? 'font-black text-[var(--apex-gold)]' : 'font-semibold text-slate-300'
                }`}>
                    {home?.name}
                </span>
                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                    <TeamLogo team={home} className="w-full h-full object-contain" />
                </div>
            </div>

            <div className="w-14 flex items-center justify-center shrink-0">
                {isPlayed ? (
                    <span className="px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 font-black text-xs text-white tabular-nums">
                        {match.result!.homeScore} - {match.result!.awayScore}
                    </span>
                ) : (
                    <span className="px-1.5 py-0.5 rounded-lg bg-white/5 text-[10px] font-bold text-slate-400 tabular-nums">
                        {getMatchKickoffTime(match)}
                    </span>
                )}
            </div>

            <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                    <TeamLogo team={away} className="w-full h-full object-contain" />
                </div>
                <span className={`text-xs truncate text-left ${
                    isPlayerMatch && match.awayTeamId === gameState.team.id ? 'font-black text-[var(--apex-gold)]' : 'font-semibold text-slate-300'
                }`}>
                    {away?.name}
                </span>
            </div>
        </div>
    );
}
