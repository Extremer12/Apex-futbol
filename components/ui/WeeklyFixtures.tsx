import React from 'react';
import { Match, Team } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';

interface WeeklyFixturesProps {
    week: number;
    matches: Match[];
    allTeams: Team[];
    playerTeamId: number;
    playerTeamLeagueId?: string; // Add league filter
}

export const WeeklyFixtures: React.FC<WeeklyFixturesProps> = ({ week, matches, allTeams, playerTeamId, playerTeamLeagueId }) => {
    const getTeamById = (id: number) => allTeams.find(t => t.id === id);

    // Filter matches by week AND by player's league (if provided)
    const weekMatches = matches.filter(m => {
        if (m.week !== week) return false;

        // If no league filter, show all matches
        if (!playerTeamLeagueId) return true;

        // For cup matches, always show them
        if (m.isCupMatch) return true;

        // For league matches, only show matches from player's league
        const homeTeam = getTeamById(m.homeTeamId);
        const awayTeam = getTeamById(m.awayTeamId);

        return homeTeam?.leagueId === playerTeamLeagueId || awayTeam?.leagueId === playerTeamLeagueId;
    });

    return (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {weekMatches.map(match => {
                const homeTeam = getTeamById(match.homeTeamId);
                const awayTeam = getTeamById(match.awayTeamId);
                const isPlayerMatch = match.homeTeamId === playerTeamId || match.awayTeamId === playerTeamId;

                return (
                    <div
                        key={`${match.homeTeamId}-${match.awayTeamId}`}
                        className={`
                            flex items-center justify-between p-4 rounded-xl transition-all duration-200
                            ${isPlayerMatch
                                ? 'bg-gradient-to-r from-sky-900/50 to-sky-800/30 border-2 border-sky-500/50 shadow-lg shadow-sky-500/20'
                                : 'bg-gradient-to-r from-slate-800/60 to-slate-800/40 border border-slate-700/50 hover:border-purple-500/30'
                            }
                        `}
                    >
                        {/* Home Team */}
                        <div className="flex items-center gap-3 w-5/12 justify-end min-w-0">
                            <span className={`font-bold text-right truncate hidden sm:inline ${isPlayerMatch ? 'text-sky-300' : 'text-white'}`}>
                                {homeTeam?.name}
                            </span>
                            <span className={`font-bold text-right sm:hidden ${isPlayerMatch ? 'text-sky-300' : 'text-white'}`}>
                                {homeTeam?.name.substring(0, 3).toUpperCase()}
                            </span>
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-900/50 p-1 rounded-lg border border-slate-700 transform group-hover:scale-110 transition-transform duration-200">
                                <TeamLogo team={homeTeam} />
                            </div>
                        </div>

                        {/* Score/VS */}
                        <div className="font-bold text-center w-2/12 flex flex-col items-center justify-center">
                            {match.result ? (
                                <div className="flex items-center justify-center gap-1.5 bg-slate-950 px-3 py-1 rounded-lg border border-slate-700 shadow-inner">
                                    <span className={`text-xl font-black ${match.result.homeScore > match.result.awayScore ? 'text-white' : 'text-slate-500'}`}>
                                        {match.result.homeScore}
                                    </span>
                                    <span className="text-slate-700">-</span>
                                    <span className={`text-xl font-black ${match.result.awayScore > match.result.homeScore ? 'text-white' : 'text-slate-500'}`}>
                                        {match.result.awayScore}
                                    </span>
                                </div>
                            ) : (
                                <div className="bg-slate-900 px-3 py-0.5 rounded-full border border-slate-700">
                                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">vs</span>
                                </div>
                            )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center gap-3 w-5/12 justify-start min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-900/50 p-1 rounded-lg border border-slate-700 transform group-hover:scale-110 transition-transform duration-200">
                                <TeamLogo team={awayTeam} />
                            </div>
                            <span className={`font-bold text-left truncate hidden sm:inline ${isPlayerMatch ? 'text-sky-300' : 'text-white'}`}>
                                {awayTeam?.name}
                            </span>
                            <span className={`font-bold text-left sm:hidden ${isPlayerMatch ? 'text-sky-300' : 'text-white'}`}>
                                {awayTeam?.name.substring(0, 3).toUpperCase()}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};
