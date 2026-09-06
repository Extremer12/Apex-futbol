import React from 'react';
import { LeagueTableRow, GameState } from '../../../types';
import { TeamForm } from '../../ui/TeamForm';
import { TrophyIcon } from '../../icons';
import { TeamLogo } from '../../../data/teams/helpers';
import { LEAGUE_THEMES } from './constants';

import { customPacksService } from '../../../services/customPacks/packService';

interface LeagueTableProps {
    table?: LeagueTableRow[];
    title: string;
    logoPath: string;
    isFirstDiv: boolean;
    leagueId: string;
    gameState: GameState;
}

export const LeagueTable: React.FC<LeagueTableProps> = ({
    table,
    title,
    logoPath,
    isFirstDiv,
    leagueId,
    gameState
}) => {
    if (!table) return null;
    const theme = LEAGUE_THEMES[leagueId] || 'purple';
    const logo = customPacksService.resolveCompetitionLogo(leagueId, title, logoPath);

    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);

    return (
        <div className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-${theme}-500/30 rounded-2xl shadow-2xl overflow-hidden animate-fade-in`}>
            <div className={`bg-gradient-to-r from-${theme}-600 via-${theme}-500 to-${theme}-600 px-6 py-4 flex items-center gap-4`}>
                <div className="w-10 h-10 p-1 bg-white/10 rounded-lg flex items-center justify-center">
                    <img 
                        src={logo || '/sinlogo.png'} 
                        alt={title} 
                        onError={(e) => { (e.target as HTMLImageElement).src = '/sinlogo.png'; }}
                        className="w-full h-full object-contain drop-shadow-md" 
                    />
                </div>
                <h3 className="text-white font-bold text-lg uppercase tracking-wider">{title}</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className={`bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-white/5`}>
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
                    <tbody className="divide-y divide-white/5">
                        {table.map((row) => {
                            const team = getTeamById(row.teamId);
                            const isPlayerTeam = team?.id === gameState.team.id;

                            let zoneColor = '';
                            let zoneLabel = '';
                            if (isFirstDiv) {
                                if (row.position <= 4) { zoneColor = 'bg-purple-500'; zoneLabel = 'Champions League'; }
                                else if (row.position === 5) { zoneColor = 'bg-orange-500'; zoneLabel = 'Europa League'; }
                                else if (row.position >= table.length - 2) { zoneColor = 'bg-red-500'; zoneLabel = 'Descenso'; }
                            } else {
                                if (row.position <= 2) { zoneColor = 'bg-green-500'; zoneLabel = 'Ascenso Directo'; }
                                else if (row.position >= 3 && row.position <= 6) { zoneColor = 'bg-blue-500'; zoneLabel = 'Play-offs'; }
                                else if (row.position >= table.length - 2) { zoneColor = 'bg-red-500'; zoneLabel = 'Descenso'; }
                            }

                            return (
                                <tr key={row.teamId} className={`transition-all duration-200 ${isPlayerTeam ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                                    <td className="px-4 py-4 text-center relative">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`font-bold ${isPlayerTeam ? 'text-white' : 'text-slate-400'}`}>{row.position}</span>
                                            {zoneColor && <div className={`w-1 h-6 ${zoneColor} rounded-full absolute left-2`} title={zoneLabel}></div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center">
                                                <TeamLogo team={team} />
                                            </div>
                                            <span className={`font-bold ${isPlayerTeam ? 'text-white' : 'text-slate-200'}`}>{team?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 text-center text-slate-400">{row.played}</td>
                                    <td className="px-3 py-4 text-center text-slate-400">{row.won}</td>
                                    <td className="px-3 py-4 text-center text-slate-400">{row.drawn}</td>
                                    <td className="px-3 py-4 text-center text-slate-400">{row.lost}</td>
                                    <td className="px-4 py-4"><div className="flex justify-center"><TeamForm form={row.form} /></div></td>
                                    <td className={`px-3 py-4 text-center font-bold ${row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                    </td>
                                    <td className="px-4 py-4 text-center font-black text-white">{row.points}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
