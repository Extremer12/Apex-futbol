import React from 'react';
import { GameState } from '../../types';
import { TeamForm } from '../ui/TeamForm';

interface LeagueScreenProps {
    gameState: GameState;
}

export const LeagueScreen: React.FC<LeagueScreenProps> = ({ gameState }) => {
    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Premier League Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src="/components/ui/Inglaterra/Premier League.png"
                        alt="Premier League"
                        className="w-16 h-16 object-contain drop-shadow-lg"
                    />
                    <div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-white bg-clip-text text-transparent">
                            Premier League
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Temporada 2024/25</p>
                    </div>
                </div>
            </div>

            {/* League Table */}
            <div className="bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-900 border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
                {/* Table Header with Purple Gradient */}
                <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-6 py-4">
                    <h3 className="text-white font-bold text-lg uppercase tracking-wider">Clasificación</h3>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 text-purple-200 uppercase text-xs font-semibold border-b-2 border-purple-500/30">
                                <th className="px-4 py-4 text-center">Pos</th>
                                <th className="px-6 py-4 text-left">Club</th>
                                <th className="px-3 py-4 text-center">PJ</th>
                                <th className="px-3 py-4 text-center">G</th>
                                <th className="px-3 py-4 text-center">E</th>
                                <th className="px-3 py-4 text-center">P</th>
                                <th className="px-4 py-4 text-center">Forma</th>
                                <th className="px-3 py-4 text-center">DG</th>
                                <th className="px-4 py-4 text-center">Pts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-500/10">
                            {gameState.leagueTable.map((row, index) => {
                                const team = getTeamById(row.teamId);
                                const isPlayerTeam = team?.id === gameState.team.id;
                                const isTopFour = row.position <= 4;
                                const isEuropaLeague = row.position === 5;
                                const isRelegation = row.position >= 18;

                                return (
                                    <tr
                                        key={row.teamId}
                                        className={`
                                            transition-all duration-200 hover:bg-purple-500/10
                                            ${isPlayerTeam ? 'bg-gradient-to-r from-sky-900/40 to-sky-800/20 border-l-4 border-sky-400' : ''}
                                            ${isTopFour && !isPlayerTeam ? 'bg-purple-500/5' : ''}
                                            ${isRelegation && !isPlayerTeam ? 'bg-red-500/5' : ''}
                                        `}
                                    >
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className={`
                                                    font-bold text-base
                                                    ${isTopFour ? 'text-purple-400' : ''}
                                                    ${isEuropaLeague ? 'text-orange-400' : ''}
                                                    ${isRelegation ? 'text-red-400' : ''}
                                                    ${!isTopFour && !isEuropaLeague && !isRelegation ? 'text-slate-300' : ''}
                                                `}>
                                                    {row.position}
                                                </span>
                                                {isTopFour && (
                                                    <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></div>
                                                )}
                                                {isEuropaLeague && (
                                                    <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                                                )}
                                                {isRelegation && (
                                                    <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="transform hover:scale-110 transition-transform duration-200">
                                                    {team?.logo}
                                                </div>
                                                <span className={`
                                                    font-semibold text-base
                                                    ${isPlayerTeam ? 'text-sky-300 font-bold' : 'text-white'}
                                                `}>
                                                    {team?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-center text-slate-300">{row.played}</td>
                                        <td className="px-3 py-4 text-center text-green-400 font-semibold">{row.wins}</td>
                                        <td className="px-3 py-4 text-center text-yellow-400 font-semibold">{row.draws}</td>
                                        <td className="px-3 py-4 text-center text-red-400 font-semibold">{row.losses}</td>
                                        <td className="px-4 py-4 text-center">
                                            <TeamForm form={row.form} />
                                        </td>
                                        <td className={`px-3 py-4 text-center font-semibold ${row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-xl font-bold bg-gradient-to-br from-purple-400 to-purple-200 bg-clip-text text-transparent">
                                                {row.points}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 px-6 py-4 border-t border-purple-500/20">
                    <div className="flex flex-wrap gap-6 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="text-purple-300">Champions League (1-4)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span className="text-orange-300">Europa League (5)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-red-300">Descenso (18-20)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
