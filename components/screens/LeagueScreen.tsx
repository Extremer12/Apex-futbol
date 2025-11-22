import React from 'react';
import { GameState } from '../../types';
import { TeamForm } from '../ui/TeamForm';

interface LeagueScreenProps {
    gameState: GameState;
}

export const LeagueScreen: React.FC<LeagueScreenProps> = ({ gameState }) => {
    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);
    return (
        <div className="p-4 md:p-6 space-y-4">
            <h2 className="text-3xl font-bold text-sky-400">Tabla de la Liga</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                        <tr>
                            <th className="px-3 py-4 text-center">Pos</th>
                            <th className="px-4 py-4">Club</th>
                            <th className="px-2 py-4 text-center">PJ</th>
                            <th className="px-2 py-4 text-center">G</th>
                            <th className="px-2 py-4 text-center">E</th>
                            <th className="px-2 py-4 text-center">P</th>
                            <th className="px-4 py-4 text-center">Forma</th>
                            <th className="px-2 py-4 text-center">DG</th>
                            <th className="px-3 py-4 text-center">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {gameState.leagueTable.map(row => {
                            const team = getTeamById(row.teamId);
                            const isPlayerTeam = team?.id === gameState.team.id;
                            return (
                                <tr key={row.teamId} className={`${isPlayerTeam ? 'bg-sky-900/20' : ''}`}>
                                    <td className="px-3 py-3 font-bold text-center">{row.position}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center space-x-3">
                                            {team?.logo}
                                            <span className={`font-semibold ${isPlayerTeam ? 'text-sky-300' : ''}`}>{team?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 text-center">{row.played}</td>
                                    <td className="px-2 py-3 text-center">{row.wins}</td>
                                    <td className="px-2 py-3 text-center">{row.draws}</td>
                                    <td className="px-2 py-3 text-center">{row.losses}</td>
                                    <td className="px-4 py-3 text-center"><TeamForm form={row.form} /></td>
                                    <td className="px-2 py-3 text-center">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                                    <td className="px-3 py-3 font-bold text-center text-lg">{row.points}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
