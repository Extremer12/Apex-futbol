import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GameState, Match, Team, LeagueId } from '../../types';
import { CalendarIcon } from '../icons';
import { TeamLogo } from '../../data/teams/helpers';

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

    const getMonthName = (week: number) => {
        const months = ['Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'];
        const index = Math.floor((week - 1) / 4);
        return months[index] || 'Junio';
    };

    const filteredMatches = useMemo(() => {
        let matches = gameState.schedule.filter(m => m.week === selectedWeek);

        // Filter by the player's competitions
        matches = matches.filter(m => {
            const homeTeamObj = getTeamById(m.homeTeamId);
            const awayTeamObj = getTeamById(m.awayTeamId);
            if (!homeTeamObj || !awayTeamObj) return false;

            const isPlayerTeamInvolved = m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id;
            
            if (m.isCupMatch) {
                // If it's a cup match, only show if the player's team is still in that cup's country
                // (or more specifically, only show matches from the cups the player participates in)
                const playerLeagueId = gameState.team.leagueId;
                const isEnglishPlayer = playerLeagueId === LeagueId.PREMIER_LEAGUE || playerLeagueId === LeagueId.CHAMPIONSHIP;
                
                // Currently only English cups are implemented
                if (isEnglishPlayer && (m.competition === 'FA_Cup' || m.competition === 'Carabao_Cup')) {
                    return true;
                }
                return isPlayerTeamInvolved;
            } else {
                // For league matches, strictly show ONLY the player's own league
                return homeTeamObj.leagueId === gameState.team.leagueId;
            }
        });

        if (filter === 'LEAGUE') {
            matches = matches.filter(m => !m.isCupMatch);
        } else if (filter === 'CUP') {
            matches = matches.filter(m => m.isCupMatch);
        }

        return matches;
    }, [gameState.schedule, filter, selectedWeek, gameState.team.leagueId]);

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
        <div className="p-4 md:p-6 space-y-6 h-full flex flex-col pb-24 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-1">Calendario de Temporada</h2>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Calendario</h1>
                </div>

                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 text-[10px] tracking-widest font-black rounded-lg transition-all duration-300 ${filter === 'ALL' ? 'bg-[var(--apex-gold)] text-black shadow-[0_0_15px_rgba(200,168,78,0.4)]' : 'text-white/40 hover:text-white'}`}
                    >
                        TODO
                    </button>
                    <button
                        onClick={() => setFilter('LEAGUE')}
                        className={`px-4 py-2 text-[10px] tracking-widest font-black rounded-lg transition-all duration-300 ${filter === 'LEAGUE' ? 'bg-[var(--apex-gold)] text-black shadow-[0_0_15px_rgba(200,168,78,0.4)]' : 'text-white/40 hover:text-white'}`}
                    >
                        LIGA
                    </button>
                    <button
                        onClick={() => setFilter('CUP')}
                        className={`px-4 py-2 text-[10px] tracking-widest font-black rounded-lg transition-all duration-300 ${filter === 'CUP' ? 'bg-[var(--apex-gold)] text-black shadow-[0_0_15px_rgba(200,168,78,0.4)]' : 'text-white/40 hover:text-white'}`}
                    >
                        COPAS
                    </button>
                </div>
            </div>

            {/* Matchday Navigation */}
            <div className="flex items-center justify-between apex-card p-4">
                <button 
                    onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
                    disabled={selectedWeek === 1}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--apex-gold)] hover:text-[var(--apex-gold)] disabled:opacity-20 disabled:cursor-not-allowed transition-all text-white/50"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-[var(--apex-gold)] uppercase tracking-[0.2em] mb-1.5">Seleccionar Jornada</span>
                    <select 
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                        className="bg-black/50 text-white font-black text-lg px-4 py-1.5 rounded-lg border border-white/10 focus:border-[var(--apex-gold)] focus:outline-none cursor-pointer uppercase tracking-widest appearance-none text-center min-w-[140px]"
                    >
                        {weeks.map(w => (
                            <option key={w} value={w}>SEM. {w} - {getMonthName(w)}</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={() => setSelectedWeek(prev => Math.min(maxWeek, prev + 1))}
                    disabled={selectedWeek === maxWeek}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--apex-gold)] hover:text-[var(--apex-gold)] disabled:opacity-20 disabled:cursor-not-allowed transition-all text-white/50"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* Horizontal Selector */}
            <div className="relative group px-1">
                <div 
                    ref={scrollRef}
                    className="flex gap-2.5 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth"
                >
                    {weeks.map(week => (
                        <button
                            key={week}
                            id={`week-btn-${week}`}
                            onClick={() => setSelectedWeek(week)}
                            className={`flex-shrink-0 w-11 h-11 flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                                selectedWeek === week 
                                ? 'bg-[var(--apex-gold)] border-[var(--apex-gold)] text-black shadow-[0_0_15px_rgba(200,168,78,0.4)] scale-110 z-10' 
                                : week === gameState.currentWeek
                                ? 'bg-black/50 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]'
                                : 'bg-black/30 border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                            }`}
                        >
                            <span className="text-sm font-black leading-none">{week}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Matches List */}
            <div className="flex-1 apex-card overflow-hidden flex flex-col">
                <div className="bg-black/30 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-black text-white text-sm tracking-widest uppercase flex items-center gap-3">
                        <span className="w-2 h-4 bg-[var(--apex-gold)] rounded-sm"></span>
                        JORNADA {selectedWeek} ({getMonthName(selectedWeek)})
                    </h3>
                    {selectedWeek === gameState.currentWeek && (
                        <span className="bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] text-[9px] font-black px-2.5 py-1 rounded border border-[var(--apex-gold)]/30 uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(200,168,78,0.2)]">
                            SEMANA ACTUAL
                        </span>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                    {filteredMatches.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/30 p-10">
                            <CalendarIcon className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Sin partidos programados</p>
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
                                    className={`group px-4 md:px-6 py-5 flex items-center hover:bg-white/5 transition-all duration-300 ${isPlayerMatch ? 'bg-[var(--apex-gold)]/5 border-l-2 border-l-[var(--apex-gold)]' : 'border-l-2 border-l-transparent'}`}
                                >
                                    {/* Home Team */}
                                    <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
                                        <span className={`text-xs md:text-sm text-right truncate uppercase tracking-widest transition-colors duration-300 ${isPlayerMatch && match.homeTeamId === gameState.team.id ? 'font-black text-[var(--apex-gold)]' : 'font-bold text-white/70 group-hover:text-white'}`}>
                                            {homeTeam?.name}
                                        </span>
                                        <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 bg-black/40 p-1.5 rounded-lg border border-white/10 group-hover:scale-110 group-hover:border-white/30 transition-all duration-300 flex items-center justify-center">
                                            <TeamLogo team={homeTeam} />
                                        </div>
                                    </div>

                                    {/* Score/VS */}
                                    <div className="w-20 md:w-28 flex flex-col items-center justify-center px-2">
                                        {isPlayed ? (
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
                                                    <span className={`text-base font-black ${match.result!.homeScore > match.result!.awayScore ? 'text-[var(--apex-gold)]' : 'text-white'}`}>{match.result?.homeScore}</span>
                                                    <span className="text-white/30 font-bold">-</span>
                                                    <span className={`text-base font-black ${match.result!.awayScore > match.result!.homeScore ? 'text-[var(--apex-gold)]' : 'text-white'}`}>{match.result?.awayScore}</span>
                                                </div>
                                                {match.penalties && (
                                                    <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">Penalties</span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-white/5 px-3 py-1 rounded border border-white/10 group-hover:bg-white/10 transition-all duration-300">
                                                <span className="text-[9px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.2em]">VS</span>
                                            </div>
                                        )}
                                        {match.isCupMatch && (
                                            <div className="mt-2 text-[8px] font-black text-white/60 bg-white/5 px-2 py-0.5 rounded uppercase tracking-[0.2em] border border-white/10">
                                                {match.competition.replace('_', ' ')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
                                        <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 bg-black/40 p-1.5 rounded-lg border border-white/10 group-hover:scale-110 group-hover:border-white/30 transition-all duration-300 flex items-center justify-center">
                                            <TeamLogo team={awayTeam} />
                                        </div>
                                        <span className={`text-xs md:text-sm truncate uppercase tracking-widest transition-colors duration-300 ${isPlayerMatch && match.awayTeamId === gameState.team.id ? 'font-black text-[var(--apex-gold)]' : 'font-bold text-white/70 group-hover:text-white'}`}>
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
