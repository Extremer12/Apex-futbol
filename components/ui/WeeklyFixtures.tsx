import React from 'react';
import { Match, Team } from '../../types';

interface WeeklyFixturesProps {
    week: number;
    matches: Match[];
    allTeams: Team[];
    playerTeamId: number;
}

export const WeeklyFixtures: React.FC<WeeklyFixturesProps> = ({ week, matches, allTeams, playerTeamId }) => {
    const getTeamById = (id: number) => allTeams.find(t => t.id === id);
    const weekMatches = matches.filter(m => m.week === week);

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
                        <div className="flex items-center gap-3 w-2/5 justify-end">
                            <span className={`font-bold text-right hidden sm:inline ${isPlayerMatch ? 'text-sky-300' : 'text-white'}`}>
                                {homeTeam?.name}
                            </span>
                            <span className={`font-bold text-right sm:hidden ${isPlayerMatch ? 'text-sky-300' : 'text-white'}`}>
                                {homeTeam?.name.substring(0, 3).toUpperCase()}
                            </span>
                            <div className="transform hover:scale-110 transition-transform duration-200">
                                {homeTeam?.logo}
                            </div>
                        </div>

                        {/* Score/VS */}
                        <div className="font-bold text-center w-1/5 text-lg">
                            {match.result ? (
                                <div className="flex items-center justify-center gap-2">
                                    <span className={`
                                        text-2xl font-black tracking-wider
                                        ${match.result.homeScore > match.result.awayScore ? 'text-green-400' :
                                            match.result.homeScore < match.result.awayScore ? 'text-red-400' : 'text-yellow-400'}
                                    `}>
                                        {match.result.homeScore}
                                    </span>
                                    <span className="text-slate-500">-</span>
                                    <span className={`
                                        text-2xl font-black tracking-wider
                                        ${match.result.awayScore > match.result.homeScore ? 'text-green-400' :
                                            match.result.awayScore < match.result.homeScore ? 'text-red-400' : 'text-yellow-400'}
                                    `}>
                                        {match.result.awayScore}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">vs</span>
                            )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center gap-3 w-2/5 justify-start">
                            <div className="transform hover:scale-110 transition-transform duration-200">
                                {awayTeam?.logo}
                            </div>
                            <span className={`font-bold text-left hidden sm:inline ${isPlayerMatch ? 'text-sky-300' : 'text-white'}`}>
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
