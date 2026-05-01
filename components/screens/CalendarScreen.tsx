import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GameState, Match, Team } from '../../types';
import { CalendarIcon } from '../icons';

interface CalendarScreenProps {
    gameState: GameState;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ gameState }) => {
    const [filter, setFilter] = useState<'ALL' | 'LEAGUE' | 'CUP'>('ALL');
    const [selectedWeek, setSelectedWeek] = useState<number>(gameState.currentWeek);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Sync selectedWeek with currentWeek on first load
    useEffect(() => {
        setSelectedWeek(gameState.currentWeek);
    }, [gameState.currentWeek]);

    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);

    const filteredMatches = useMemo(() => {
        let matches = gameState.schedule.filter(m => m.week === selectedWeek);

        if (filter === 'LEAGUE') {
            matches = matches.filter(m => !m.isCupMatch);
        } else if (filter === 'CUP') {
            matches = matches.filter(m => m.isCupMatch);
        }

        return matches;
    }, [gameState.schedule, filter, selectedWeek]);

    const maxWeek = useMemo(() => {
        return Math.max(...gameState.schedule.map(m => m.week), 1);
    }, [gameState.schedule]);

    const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1);

    // Auto-scroll to selected week in the selector
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
        <div className="p-4 md:p-6 space-y-6 h-full flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-sky-500/20 p-2 rounded-xl shadow-inner">
                        <CalendarIcon className="w-8 h-8 text-sky-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Calendario</h2>
                        <p className="text-slate-400 text-sm font-medium">Temporada {gameState.season} / {gameState.season + 1}</p>
                    </div>
                </div>

                <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all duration-300 ${filter === 'ALL' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        TODO
                    </button>
                    <button
                        onClick={() => setFilter('LEAGUE')}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all duration-300 ${filter === 'LEAGUE' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        LIGA
                    </button>
                    <button
                        onClick={() => setFilter('CUP')}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all duration-300 ${filter === 'CUP' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        COPAS
                    </button>
                </div>
            </div>

            {/* Week Selector */}
            <div className="relative group">
                <div 
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth"
                >
                    {weeks.map(week => (
                        <button
                            key={week}
                            id={`week-btn-${week}`}
                            onClick={() => setSelectedWeek(week)}
                            className={`flex-shrink-0 w-14 h-14 flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                                selectedWeek === week 
                                ? 'bg-sky-600 border-sky-400 text-white shadow-xl shadow-sky-600/40 scale-110 z-10' 
                                : week === gameState.currentWeek
                                ? 'bg-slate-800 border-sky-500/50 text-sky-400'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                            }`}
                        >
                            <span className="text-[10px] font-black uppercase leading-none mb-1">Jorn</span>
                            <span className="text-xl font-black leading-none">{week}</span>
                        </button>
                    ))}
                </div>
                {/* Fade overlays for scrolling */}
                <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Matches List */}
            <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm flex flex-col">
                <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-black text-white text-lg flex items-center gap-2">
                        <span className="w-2 h-6 bg-sky-500 rounded-full"></span>
                        JORNADA {selectedWeek}
                    </h3>
                    {selectedWeek === gameState.currentWeek && (
                        <span className="bg-sky-500/20 text-sky-400 text-[10px] font-black px-3 py-1 rounded-full border border-sky-500/30 animate-pulse">
                            SEMANA ACTUAL
                        </span>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 custom-scrollbar">
                    {filteredMatches.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 p-10 opacity-50">
                            <CalendarIcon className="w-16 h-16 mb-4" />
                            <p className="font-bold">No hay partidos programados</p>
                        </div>
                    ) : (
                        filteredMatches.map((match, idx) => {
                            const homeTeam = getTeamById(match.homeTeamId);
                            const awayTeam = getTeamById(match.awayTeamId);
                            const isPlayerMatch = match.homeTeamId === gameState.team.id || match.awayTeamId === gameState.team.id;
                            const isPlayed = match.result !== undefined;

                            return (
                                <div
                                    key={idx}
                                    className={`group px-4 md:px-8 py-5 flex items-center hover:bg-slate-800/40 transition-all duration-300 ${isPlayerMatch ? 'bg-sky-500/5 border-l-4 border-l-sky-500' : 'border-l-4 border-l-transparent'}`}
                                >
                                    {/* Home Team */}
                                    <div className="flex-1 flex items-center justify-end gap-3 md:gap-5 min-w-0">
                                        <span className={`text-sm md:text-lg text-right truncate transition-colors duration-300 ${isPlayerMatch && match.homeTeamId === gameState.team.id ? 'font-black text-sky-400' : 'font-bold text-slate-300 group-hover:text-white'}`}>
                                            {homeTeam?.name}
                                        </span>
                                        <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                            {homeTeam?.logo}
                                        </div>
                                    </div>

                                    {/* Score/VS */}
                                    <div className="w-24 md:w-32 flex flex-col items-center justify-center px-2">
                                        {isPlayed ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl">
                                                    <span className={`text-xl font-black ${match.result!.homeScore > match.result!.awayScore ? 'text-white' : 'text-slate-500'}`}>{match.result?.homeScore}</span>
                                                    <span className="text-slate-700 font-bold">-</span>
                                                    <span className={`text-xl font-black ${match.result!.awayScore > match.result!.homeScore ? 'text-white' : 'text-slate-500'}`}>{match.result?.awayScore}</span>
                                                </div>
                                                {match.penalties && (
                                                    <span className="text-[9px] font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">Penales</span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-slate-800 px-4 py-1 rounded-full border border-slate-700 shadow-inner group-hover:bg-sky-900/50 group-hover:border-sky-500/50 transition-all duration-300">
                                                <span className="text-xs font-black text-slate-500 group-hover:text-sky-400 tracking-widest">VS</span>
                                            </div>
                                        )}
                                        {match.isCupMatch && (
                                            <div className="mt-2 text-[9px] font-black text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded uppercase tracking-widest">
                                                {match.competition === 'FA_Cup' ? 'FA Cup' : 'Carabao Cup'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex-1 flex items-center justify-start gap-3 md:gap-5 min-w-0">
                                        <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                            {awayTeam?.logo}
                                        </div>
                                        <span className={`text-sm md:text-lg truncate transition-colors duration-300 ${isPlayerMatch && match.awayTeamId === gameState.team.id ? 'font-black text-sky-400' : 'font-bold text-slate-300 group-hover:text-white'}`}>
                                            {awayTeam?.name}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
