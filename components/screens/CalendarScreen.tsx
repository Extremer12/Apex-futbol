import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GameState, Match, Team, LeagueId } from '../../types';
import { CalendarIcon } from '../icons';
import { TeamLogo } from '../../data/teams/helpers';
import { ALL_COMPETITIONS } from './league/constants';

interface CalendarScreenProps {
    gameState: GameState;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ gameState }) => {
    const [viewMode, setViewMode] = useState<'MY_CLUB' | 'ALL_MATCHES'>('MY_CLUB');
    const [filter, setFilter] = useState<'ALL' | 'LEAGUE' | 'DOMESTIC_CUP' | 'INT_CUP'>('ALL');
    const [selectedWeek, setSelectedWeek] = useState<number>(Math.max(1, gameState.currentWeek));
    const [selectedDetailMatch, setSelectedDetailMatch] = useState<Match | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Sync selectedWeek with currentWeek
    useEffect(() => {
        setSelectedWeek(Math.max(1, gameState.currentWeek));
    }, [gameState.currentWeek]);

    const getTeamById = (id: number): Team | undefined => gameState.allTeams.find(t => t.id === id);

    const getMonthName = (week: number) => {
        const months = ['Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
        const index = Math.min(Math.floor((week - 1) / 4), months.length - 1);
        return months[Math.max(0, index)] || 'Junio';
    };

    const maxWeek = useMemo(() => {
        const weeksInSchedule = gameState.schedule.map(m => m.week);
        return weeksInSchedule.length > 0 ? Math.max(...weeksInSchedule, 1) : 38;
    }, [gameState.schedule]);

    const weeks = useMemo(() => Array.from({ length: maxWeek }, (_, i) => i + 1), [maxWeek]);

    // Format competition display name and type
    const getCompetitionDetails = (compName?: string, isCupMatch?: boolean, isMidweek?: boolean) => {
        const comp = compName || '';
        const found = ALL_COMPETITIONS.find(c => c.id === comp || c.name.toLowerCase() === comp.toLowerCase().replace(/_/g, ' '));
        
        let label = found?.name || comp.replace(/_/g, ' ');
        let isInt = false;
        let isDomesticCup = false;

        if (comp.includes('Champions') || comp.includes('Europa') || comp.includes('Libertadores') || comp.includes('Intercontinental')) {
            isInt = true;
        } else if (isCupMatch || comp.includes('Cup') || comp.includes('Copa') || comp.includes('Pokal') || comp.includes('Playoffs') || comp.includes('Reducido')) {
            isDomesticCup = true;
        }

        if (comp.includes('Torneo_Apertura') || comp.includes('Torneo Apertura')) {
            label = 'Torneo Apertura';
        } else if (comp.includes('Torneo_Clausura') || comp.includes('Torneo Clausura')) {
            label = 'Torneo Clausura';
        } else if (comp.includes('FA_Cup') || comp.includes('FA Cup')) {
            label = 'FA Cup';
        } else if (comp.includes('Carabao_Cup') || comp.includes('Carabao Cup')) {
            label = 'Carabao Cup';
        } else if (comp.includes('Copa_Argentina') || comp.includes('Copa Argentina')) {
            label = 'Copa Argentina';
        } else if (comp.includes('Copa_del_Rey') || comp.includes('Copa del Rey')) {
            label = 'Copa del Rey';
        } else if (comp.includes('DFB_Pokal') || comp.includes('DFB Pokal')) {
            label = 'DFB-Pokal';
        } else if (comp.includes('Coppa_Italia') || comp.includes('Coppa Italia')) {
            label = 'Coppa Italia';
        }

        return {
            label,
            isInt,
            isDomesticCup,
            isLeague: !isInt && !isDomesticCup,
            turnName: isMidweek ? 'Entre Semana' : 'Fin de Semana'
        };
    };

    // User club matches sorted chronologically
    const myClubMatches = useMemo(() => {
        return gameState.schedule
            .filter(m => m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id)
            .sort((a, b) => {
                if (a.week !== b.week) return a.week - b.week;
                return (a.isMidweek ? 1 : 0) - (b.isMidweek ? 1 : 0);
            });
    }, [gameState.schedule, gameState.team.id]);

    // Filtered matches for My Club view
    const filteredMyClubMatches = useMemo(() => {
        return myClubMatches.filter(m => {
            const compDetails = getCompetitionDetails(m.competition, m.isCupMatch, m.isMidweek);
            if (filter === 'LEAGUE') return compDetails.isLeague;
            if (filter === 'DOMESTIC_CUP') return compDetails.isDomesticCup;
            if (filter === 'INT_CUP') return compDetails.isInt;
            return true;
        });
    }, [myClubMatches, filter]);

    // Matches for the selected week (All Matches view)
    const weekMatches = useMemo(() => {
        let matches = gameState.schedule.filter(m => m.week === selectedWeek);

        matches = matches.filter(m => {
            const home = getTeamById(m.homeTeamId);
            const away = getTeamById(m.awayTeamId);
            if (!home || !away) return false;

            const isPlayerTeamInvolved = m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id;
            if (isPlayerTeamInvolved) return true;

            if (!m.isCupMatch && home.leagueId === gameState.team.leagueId) return true;

            const compDetails = getCompetitionDetails(m.competition, m.isCupMatch, m.isMidweek);
            if (compDetails.isDomesticCup || compDetails.isInt) return true;

            return false;
        });

        if (filter === 'LEAGUE') {
            matches = matches.filter(m => !m.isCupMatch);
        } else if (filter === 'DOMESTIC_CUP') {
            matches = matches.filter(m => getCompetitionDetails(m.competition, m.isCupMatch, m.isMidweek).isDomesticCup);
        } else if (filter === 'INT_CUP') {
            matches = matches.filter(m => getCompetitionDetails(m.competition, m.isCupMatch, m.isMidweek).isInt);
        }

        const weekendMatches = matches.filter(m => !m.isMidweek);
        const midweekMatches = matches.filter(m => !!m.isMidweek);

        return { weekendMatches, midweekMatches };
    }, [gameState.schedule, selectedWeek, gameState.team.id, gameState.team.leagueId, filter]);

    // Group My Club matches by Month
    const matchesGroupedByMonth = useMemo(() => {
        const groups: { month: string; matches: Match[] }[] = [];
        let currentMonth = '';
        let currentGroup: Match[] = [];

        filteredMyClubMatches.forEach(m => {
            const month = getMonthName(m.week);
            if (month !== currentMonth) {
                if (currentGroup.length > 0) {
                    groups.push({ month: currentMonth, matches: currentGroup });
                }
                currentMonth = month;
                currentGroup = [m];
            } else {
                currentGroup.push(m);
            }
        });

        if (currentGroup.length > 0) {
            groups.push({ month: currentMonth, matches: currentGroup });
        }

        return groups;
    }, [filteredMyClubMatches]);

    // Auto-scroll to selected week button in horizontal carousel
    useEffect(() => {
        const activeBtn = document.getElementById(`week-btn-${selectedWeek}`);
        if (activeBtn && scrollRef.current) {
            scrollRef.current.scrollTo({
                left: activeBtn.offsetLeft - scrollRef.current.offsetWidth / 2 + activeBtn.offsetWidth / 2,
                behavior: 'smooth'
            });
        }
    }, [selectedWeek]);

    return (
        <div className="p-4 md:p-6 space-y-5 h-full flex flex-col pb-24 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-2.5">
                        <CalendarIcon className="w-7 h-7 text-[var(--apex-gold)]" />
                        <span>Calendario</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Semana {gameState.currentWeek} • Turno {gameState.currentTurn === 'midweek' ? 'Entre Semana (Copa)' : 'Fin de Semana (Liga)'}
                    </p>
                </div>

                {/* View Mode & Competition Filter */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setViewMode('MY_CLUB')}
                            className={`px-3.5 py-1.5 text-[10px] tracking-wider font-black rounded-lg transition-all ${
                                viewMode === 'MY_CLUB'
                                    ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-yellow-500/20'
                                    : 'text-white/50 hover:text-white'
                            }`}
                        >
                            MI CLUB
                        </button>
                        <button
                            onClick={() => setViewMode('ALL_MATCHES')}
                            className={`px-3.5 py-1.5 text-[10px] tracking-wider font-black rounded-lg transition-all ${
                                viewMode === 'ALL_MATCHES'
                                    ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-yellow-500/20'
                                    : 'text-white/50 hover:text-white'
                            }`}
                        >
                            FECHA POR FECHA
                        </button>
                    </div>

                    <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                filter === 'ALL' ? 'bg-white/15 text-white font-black' : 'text-white/40 hover:text-white'
                            }`}
                        >
                            TODOS
                        </button>
                        <button
                            onClick={() => setFilter('LEAGUE')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                filter === 'LEAGUE' ? 'bg-white/15 text-white font-black' : 'text-white/40 hover:text-white'
                            }`}
                        >
                            LIGA
                        </button>
                        <button
                            onClick={() => setFilter('DOMESTIC_CUP')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                filter === 'DOMESTIC_CUP' ? 'bg-white/15 text-white font-black' : 'text-white/40 hover:text-white'
                            }`}
                        >
                            COPA NACIONAL
                        </button>
                        <button
                            onClick={() => setFilter('INT_CUP')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                filter === 'INT_CUP' ? 'bg-white/15 text-white font-black' : 'text-white/40 hover:text-white'
                            }`}
                        >
                            INTERNACIONAL
                        </button>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* VIEW 1: MY CLUB TIMELINE / ROADMAP                                        */}
            {/* ========================================================================= */}
            {viewMode === 'MY_CLUB' ? (
                <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {matchesGroupedByMonth.length === 0 ? (
                        <div className="apex-card p-12 flex flex-col items-center justify-center text-center text-white/40">
                            <CalendarIcon className="w-10 h-10 mb-3 opacity-30" />
                            <p className="text-xs font-bold uppercase tracking-wider">No se encontraron partidos para este filtro</p>
                        </div>
                    ) : (
                        matchesGroupedByMonth.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-3">
                                {/* Month Divider Header */}
                                <div className="flex items-center gap-3">
                                    <div className="h-px bg-white/10 flex-1" />
                                    <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-black uppercase tracking-wider border border-white/10">
                                        {group.month}
                                    </span>
                                    <div className="h-px bg-white/10 flex-1" />
                                </div>

                                {/* Matches Grid for Month */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {group.matches.map((match, mIdx) => {
                                        const isHome = match.homeTeamId === gameState.team.id;
                                        const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
                                        const opponent = getTeamById(opponentId);
                                        const compDetails = getCompetitionDetails(match.competition, match.isCupMatch, match.isMidweek);
                                        const isPlayed = match.result !== undefined;

                                        const nextWeek = gameState.currentTurn === 'midweek' ? gameState.currentWeek + 1 : gameState.currentWeek;
                                        const isMidweekTurn = gameState.currentTurn === 'midweek';
                                        const isCurrentMatch = !isPlayed && match.week === nextWeek && !!match.isMidweek === isMidweekTurn;

                                        return (
                                            <div
                                                key={mIdx}
                                                onClick={() => isPlayed && setSelectedDetailMatch(match)}
                                                className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-2.5 ${
                                                    isPlayed ? 'cursor-pointer hover:border-white/25 hover:bg-slate-900/90' : ''
                                                } ${
                                                    isCurrentMatch
                                                        ? 'bg-slate-900 border-[var(--apex-gold)] shadow-lg shadow-yellow-500/10'
                                                        : isPlayed
                                                        ? 'bg-slate-900/60 border-white/10'
                                                        : 'bg-slate-950/40 border-white/5 opacity-80'
                                                }`}
                                            >
                                                {/* Top Row: Symmetrical Header Badges */}
                                                <div className="flex items-center justify-between gap-2 text-[10px]">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider truncate max-w-[140px] ${
                                                            compDetails.isInt
                                                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                                : compDetails.isDomesticCup
                                                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                                        }`}>
                                                            {compDetails.label}
                                                        </span>
                                                        <span className="font-semibold text-slate-400 truncate">
                                                            Fecha {match.week} • {compDetails.turnName}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                                            isHome 
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                        }`}>
                                                            {isHome ? 'LOCAL' : 'VISITANTE'}
                                                        </span>

                                                        {isCurrentMatch && (
                                                            <span className="px-2 py-0.5 rounded bg-[var(--apex-gold)] text-black text-[9px] font-black uppercase tracking-wider">
                                                                PRÓXIMO
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Middle Row: Symmetrical Teams & Score */}
                                                <div className="grid grid-cols-7 items-center gap-2 py-1">
                                                    {/* My Club (3 cols) */}
                                                    <div className="col-span-3 flex items-center justify-end gap-2 min-w-0">
                                                        <span className="text-xs sm:text-sm font-bold text-white truncate text-right">
                                                            {gameState.team.name}
                                                        </span>
                                                        <div className="w-8 h-8 flex-shrink-0 bg-black/60 p-1 rounded-lg border border-white/10 flex items-center justify-center">
                                                            <TeamLogo team={gameState.team} />
                                                        </div>
                                                    </div>

                                                    {/* Score / VS (1 col) */}
                                                    <div className="col-span-1 flex flex-col items-center justify-center">
                                                        {isPlayed ? (
                                                            <div className="flex flex-col items-center">
                                                                <span className="px-2 py-0.5 rounded bg-black/80 border border-white/15 text-center font-black text-xs sm:text-sm text-white">
                                                                    {isHome ? match.result!.homeScore : match.result!.awayScore} - {isHome ? match.result!.awayScore : match.result!.homeScore}
                                                                </span>
                                                                {match.penalties && (
                                                                    <span className="text-[8px] font-bold text-amber-400 mt-0.5">
                                                                        ({isHome ? match.penalties.home : match.penalties.away}-{isHome ? match.penalties.away : match.penalties.home} p.)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase">
                                                                VS
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Opponent (3 cols) */}
                                                    <div className="col-span-3 flex items-center justify-start gap-2 min-w-0">
                                                        <div className="w-8 h-8 flex-shrink-0 bg-black/60 p-1 rounded-lg border border-white/10 flex items-center justify-center">
                                                            <TeamLogo team={opponent} />
                                                        </div>
                                                        <span className="text-xs sm:text-sm font-bold text-slate-300 truncate text-left">
                                                            {opponent?.name || 'Rival por definir'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Bottom Row: State & Details */}
                                                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-1.5">
                                                    <span>
                                                        {isPlayed ? 'Finalizado' : 'Pendiente'}
                                                    </span>

                                                    {isPlayed && (
                                                        <span className="text-[9px] text-[var(--apex-gold)] font-bold hover:underline">
                                                            Ver Ficha de Partido
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* ========================================================================= */
                /* VIEW 2: MATCHDAY BY MATCHDAY                                              */
                /* ========================================================================= */
                <div className="space-y-4 flex-1 flex flex-col">
                    {/* Week Navigation Selector */}
                    <div className="flex items-center justify-between apex-card p-3">
                        <button 
                            onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
                            disabled={selectedWeek === 1}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed text-white/60 hover:text-white transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <select 
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                                className="bg-black/80 text-white font-black text-sm sm:text-base px-3 py-1 rounded-lg border border-white/15 focus:border-[var(--apex-gold)] focus:outline-none cursor-pointer uppercase tracking-wider appearance-none text-center min-w-[140px]"
                            >
                                {weeks.map(w => (
                                    <option key={w} value={w}>Jornada {w} • {getMonthName(w)}</option>
                                ))}
                            </select>

                            {selectedWeek !== gameState.currentWeek && (
                                <button
                                    onClick={() => setSelectedWeek(Math.max(1, gameState.currentWeek))}
                                    className="px-2.5 py-1 rounded-lg bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] hover:bg-[var(--apex-gold)] hover:text-black border border-[var(--apex-gold)]/30 text-[10px] font-black uppercase tracking-wider transition-all"
                                >
                                    Fecha Actual
                                </button>
                            )}
                        </div>

                        <button 
                            onClick={() => setSelectedWeek(prev => Math.min(maxWeek, prev + 1))}
                            disabled={selectedWeek === maxWeek}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed text-white/60 hover:text-white transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    {/* Horizontal Week Carousel */}
                    <div className="relative group px-1">
                        <div 
                            ref={scrollRef}
                            className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
                        >
                            {weeks.map(week => (
                                <button
                                    key={week}
                                    id={`week-btn-${week}`}
                                    onClick={() => setSelectedWeek(week)}
                                    className={`flex-shrink-0 w-10 h-10 flex flex-col items-center justify-center rounded-xl border transition-all ${
                                        selectedWeek === week 
                                        ? 'bg-[var(--apex-gold)] border-[var(--apex-gold)] text-black font-black scale-105 shadow-md' 
                                        : week === gameState.currentWeek
                                        ? 'bg-black/60 border-[var(--apex-gold)]/50 text-[var(--apex-gold)] font-bold'
                                        : 'bg-black/30 border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                                    }`}
                                >
                                    <span className="text-xs font-bold leading-none">{week}</span>
                                    {week === gameState.currentWeek && (
                                        <span className="w-1 h-1 rounded-full bg-[var(--apex-gold)] mt-0.5" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Symmetrical 2-Column Grid: Weekend vs Midweek */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Column 1: Weekend Matches (League) */}
                        <div className="apex-card flex flex-col overflow-hidden">
                            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-3 bg-sky-400 rounded-sm" />
                                    Fin de Semana (Liga)
                                </h3>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                    {weekMatches.weekendMatches.length} partidos
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar p-2">
                                {weekMatches.weekendMatches.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500 text-xs">
                                        Sin partidos de liga programados en esta fecha
                                    </div>
                                ) : (
                                    weekMatches.weekendMatches.map((m, idx) => renderCleanMatchRow(m, idx, gameState, setSelectedDetailMatch))
                                )}
                            </div>
                        </div>

                        {/* Column 2: Midweek Matches (Cups & International) */}
                        <div className="apex-card flex flex-col overflow-hidden">
                            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-3 bg-amber-400 rounded-sm" />
                                    Entre Semana (Copas y Torneos)
                                </h3>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                    {weekMatches.midweekMatches.length} partidos
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar p-2">
                                {weekMatches.midweekMatches.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500 text-xs">
                                        Sin partidos de copa en esta fecha
                                    </div>
                                ) : (
                                    weekMatches.midweekMatches.map((m, idx) => renderCleanMatchRow(m, idx, gameState, setSelectedDetailMatch))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Match Detail Modal */}
            {selectedDetailMatch && selectedDetailMatch.result && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedDetailMatch(null)}
                >
                    <div 
                        className="bg-slate-900 border border-white/15 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--apex-gold)]">
                                    {getCompetitionDetails(selectedDetailMatch.competition, selectedDetailMatch.isCupMatch, selectedDetailMatch.isMidweek).label}
                                </span>
                                <h3 className="text-base font-black text-white uppercase">Ficha del Encuentro</h3>
                            </div>
                            <button
                                onClick={() => setSelectedDetailMatch(null)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Scoreboard */}
                        {(() => {
                            const home = getTeamById(selectedDetailMatch.homeTeamId);
                            const away = getTeamById(selectedDetailMatch.awayTeamId);
                            return (
                                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 grid grid-cols-7 items-center gap-2">
                                    <div className="col-span-3 flex flex-col items-center text-center">
                                        <div className="w-10 h-10 bg-black/60 p-1.5 rounded-xl border border-white/10 mb-1.5 flex items-center justify-center">
                                            <TeamLogo team={home} />
                                        </div>
                                        <span className="text-xs font-bold text-white truncate max-w-full">{home?.name}</span>
                                    </div>

                                    <div className="col-span-1 flex flex-col items-center justify-center">
                                        <span className="text-xl font-black text-white">
                                            {selectedDetailMatch.result?.homeScore} - {selectedDetailMatch.result?.awayScore}
                                        </span>
                                        {selectedDetailMatch.penalties && (
                                            <span className="text-[8px] font-bold text-amber-400 uppercase mt-0.5">
                                                Pen: {selectedDetailMatch.penalties.home}-{selectedDetailMatch.penalties.away}
                                            </span>
                                        )}
                                    </div>

                                    <div className="col-span-3 flex flex-col items-center text-center">
                                        <div className="w-10 h-10 bg-black/60 p-1.5 rounded-xl border border-white/10 mb-1.5 flex items-center justify-center">
                                            <TeamLogo team={away} />
                                        </div>
                                        <span className="text-xs font-bold text-white truncate max-w-full">{away?.name}</span>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Scorers / Events List */}
                        <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Goleadores</h4>
                            {selectedDetailMatch.result.scorers && selectedDetailMatch.result.scorers.length > 0 ? (
                                <div className="space-y-1">
                                    {selectedDetailMatch.result.scorers.map((scorer, sIdx) => (
                                        <div key={sIdx} className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                                            <span className="font-semibold text-white">
                                                {scorer.playerName}
                                            </span>
                                            <span className="text-slate-400 font-mono text-[11px] font-bold">{scorer.minute}'</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-2.5 rounded-lg bg-white/5 text-center text-slate-500 text-xs">
                                    Sin goles anotados
                                </div>
                            )}

                            {selectedDetailMatch.result.events && selectedDetailMatch.result.events.length > 0 && (
                                <div className="pt-2 space-y-1">
                                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Incidencias</h4>
                                    {selectedDetailMatch.result.events.map((evt, eIdx) => (
                                        <p key={eIdx} className="text-[11px] text-slate-300 leading-relaxed bg-white/[0.02] p-1.5 rounded">
                                            {evt}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-1">
                            <button
                                onClick={() => setSelectedDetailMatch(null)}
                                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper row renderer with strictly consistent column widths
function renderCleanMatchRow(
    match: Match, 
    idx: number, 
    gameState: GameState, 
    onSelectMatch: (m: Match) => void
) {
    const home = gameState.allTeams.find(t => t.id === match.homeTeamId);
    const away = gameState.allTeams.find(t => t.id === match.awayTeamId);
    const isPlayerMatch = match.homeTeamId === gameState.team.id || match.awayTeamId === gameState.team.id;
    const isPlayed = match.result !== undefined;

    return (
        <div
            key={idx}
            onClick={() => isPlayed && onSelectMatch(match)}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                isPlayed ? 'cursor-pointer hover:bg-white/5' : ''
            } ${
                isPlayerMatch 
                    ? 'bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30' 
                    : 'hover:bg-white/[0.02]'
            }`}
        >
            {/* Home Team (Fixed Column) */}
            <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                <span className={`text-xs truncate text-right ${
                    isPlayerMatch && match.homeTeamId === gameState.team.id
                        ? 'font-black text-[var(--apex-gold)]'
                        : 'font-semibold text-slate-300'
                }`}>
                    {home?.name}
                </span>
                <div className="w-6 h-6 flex-shrink-0 bg-black/60 p-1 rounded-md border border-white/10 flex items-center justify-center">
                    <TeamLogo team={home} />
                </div>
            </div>

            {/* Score / VS */}
            <div className="w-14 flex flex-col items-center justify-center flex-shrink-0">
                {isPlayed ? (
                    <span className="px-2 py-0.5 rounded bg-black/70 border border-white/10 font-bold text-xs text-white">
                        {match.result!.homeScore} - {match.result!.awayScore}
                    </span>
                ) : (
                    <span className="text-[9px] font-bold text-slate-500 uppercase">
                        VS
                    </span>
                )}
            </div>

            {/* Away Team (Fixed Column) */}
            <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                <div className="w-6 h-6 flex-shrink-0 bg-black/60 p-1 rounded-md border border-white/10 flex items-center justify-center">
                    <TeamLogo team={away} />
                </div>
                <span className={`text-xs truncate text-left ${
                    isPlayerMatch && match.awayTeamId === gameState.team.id
                        ? 'font-black text-[var(--apex-gold)]'
                        : 'font-semibold text-slate-300'
                }`}>
                    {away?.name}
                </span>
            </div>
        </div>
    );
}
