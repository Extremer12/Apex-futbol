import React, { useState, useMemo } from 'react';
import { GameState, Match, Team } from '../../types';
import { CalendarIcon } from '../icons';

interface CalendarScreenProps {
    gameState: GameState;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ gameState }) => {
    const [filter, setFilter] = useState<'ALL' | 'LEAGUE' | 'CUP'>('ALL');
    const [viewMode, setViewMode] = useState<'UPCOMING' | 'PAST' | 'ALL'>('UPCOMING');

    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);

    const filteredMatches = useMemo(() => {
        let matches = [...gameState.schedule];

        // Filter by Competition
        if (filter === 'LEAGUE') {
            matches = matches.filter(m => !m.isCupMatch);
        } else if (filter === 'CUP') {
            matches = matches.filter(m => m.isCupMatch);
        }

        // Filter by Status (View Mode)
        if (viewMode === 'UPCOMING') {
            matches = matches.filter(m => m.week >= gameState.currentWeek);
        } else if (viewMode === 'PAST') {
            matches = matches.filter(m => m.week < gameState.currentWeek);
        }

        // Sort by week
        return matches.sort((a, b) => a.week - b.week);
    }, [gameState.schedule, filter, viewMode, gameState.currentWeek]);

    // Group by Week
    const matchesByWeek = useMemo(() => {
        const groups: { [key: number]: Match[] } = {};
        filteredMatches.forEach(match => {
            if (!groups[match.week]) {
                groups[match.week] = [];
            }
            groups[match.week].push(match);
        });
        return groups;
    }, [filteredMatches]);

    const weekKeys = Object.keys(matchesByWeek).map(Number).sort((a, b) => a - b);

    return (
        <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-sky-500/20 p-2 rounded-lg">
                        <CalendarIcon className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Calendario</h2>
                        <p className="text-slate-400 text-sm">Temporada {gameState.season} - {gameState.season + 1}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-sky-500"
                    >
                        <option value="ALL">Todas las Competiciones</option>
                        <option value="LEAGUE">Solo Liga</option>
                        <option value="CUP">Solo Copas</option>
                    </select>

                    <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
                        <button
                            onClick={() => setViewMode('PAST')}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${viewMode === 'PAST' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Pasados
                        </button>
                        <button
                            onClick={() => setViewMode('UPCOMING')}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${viewMode === 'UPCOMING' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Próximos
                        </button>
                        <button
                            onClick={() => setViewMode('ALL')}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${viewMode === 'ALL' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Todos
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {weekKeys.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <p>No hay partidos para mostrar con los filtros seleccionados.</p>
                    </div>
                ) : (
                    weekKeys.map(week => (
                        <div key={week} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg animate-fade-in">
                            <div className="bg-slate-800/80 px-4 py-2 flex justify-between items-center border-b border-slate-700">
                                <h3 className="font-bold text-white">Jornada {week}</h3>
                                {week === gameState.currentWeek && (
                                    <span className="text-xs bg-sky-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                                        ACTUAL
                                    </span>
                                )}
                            </div>
                            <div className="divide-y divide-slate-800">
                                {matchesByWeek[week].map((match, idx) => {
                                    const homeTeam = getTeamById(match.homeTeamId);
                                    const awayTeam = getTeamById(match.awayTeamId);
                                    const isPlayerMatch = match.homeTeamId === gameState.team.id || match.awayTeamId === gameState.team.id;
                                    const isPlayed = match.result !== undefined;

                                    return (
                                        <div
                                            key={idx}
                                            className={`px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors ${isPlayerMatch ? 'bg-sky-900/10' : ''}`}
                                        >
                                            {/* Home */}
                                            <div className={`flex items-center gap-3 flex-1 justify-end ${isPlayerMatch && match.homeTeamId === gameState.team.id ? 'font-bold text-sky-300' : 'text-slate-300'}`}>
                                                <span className="text-sm md:text-base text-right">{homeTeam?.name}</span>
                                                <div className="w-6 h-6 flex-shrink-0">{homeTeam?.logo}</div>
                                            </div>

                                            {/* Score / Time */}
                                            <div className="px-4 flex flex-col items-center min-w-[80px]">
                                                {isPlayed ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-white font-bold bg-slate-950 px-2 py-1 rounded border border-slate-700 text-sm">
                                                            {match.result?.homeScore} - {match.result?.awayScore}
                                                        </span>
                                                        {match.penalties && (
                                                            <span className="text-[10px] text-slate-500 mt-0.5">
                                                                (Pen)
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 text-xs font-mono bg-slate-800 px-2 py-1 rounded">
                                                        VS
                                                    </span>
                                                )}
                                                {match.isCupMatch && (
                                                    <span className="text-[10px] text-yellow-500 mt-1 uppercase tracking-tighter">
                                                        {match.competition === 'FA_Cup' ? 'FA Cup' : 'Carabao'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Away */}
                                            <div className={`flex items-center gap-3 flex-1 ${isPlayerMatch && match.awayTeamId === gameState.team.id ? 'font-bold text-sky-300' : 'text-slate-300'}`}>
                                                <div className="w-6 h-6 flex-shrink-0">{awayTeam?.logo}</div>
                                                <span className="text-sm md:text-base">{awayTeam?.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
