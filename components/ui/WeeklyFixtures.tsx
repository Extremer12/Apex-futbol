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
                    <div key={`${match.homeTeamId}-${match.awayTeamId}`} className={`flex items-center justify-between p-3 rounded-lg transition-all ${isPlayerMatch ? 'bg-sky-900/40 border border-sky-800/50' : 'bg-slate-800/50'}`}>
                        <div className="flex items-center gap-3 w-2/5 justify-end">
                            <span className="font-bold text-right hidden sm:inline">{homeTeam?.name}</span>
                            <span className="font-bold text-right sm:hidden">{homeTeam?.name.substring(0,3).toUpperCase()}</span>
                            {homeTeam?.logo}
                        </div>
                        <div className="font-bold text-center w-1/5 text-lg">
                            {match.result ? (
                                <span className='tracking-widest'>{match.result.homeScore} - {match.result.awayScore}</span>
                            ) : (
                                <span className="text-slate-500 text-sm">vs</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 w-2/5 justify-start">
                            {awayTeam?.logo}
                            <span className="font-bold text-left hidden sm:inline">{awayTeam?.name}</span>
                            <span className="font-bold text-left sm:hidden">{awayTeam?.name.substring(0,3).toUpperCase()}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};
