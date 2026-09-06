import React from 'react';
import { GameState } from '../../../types';
import { TrophyIcon } from '../../icons';
import { TeamLogo } from '../../../data/teams/helpers';

interface EuropeanTableProps {
    table: any[];
    title: string;
    logoUrl: string;
    theme: string;
    gameState: GameState;
}

export const EuropeanTable: React.FC<EuropeanTableProps> = ({
    table,
    title,
    logoUrl,
    theme,
    gameState
}) => {
    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);

    return (
        <div className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-${theme}-500/30 rounded-2xl shadow-2xl overflow-hidden animate-fade-in`}>
            <div className={`bg-gradient-to-r from-${theme}-600 via-${theme}-500 to-${theme}-600 px-6 py-4 flex items-center gap-4`}>
                <div className="w-10 h-10 p-1 bg-white/10 rounded-lg flex items-center justify-center">
                    {logoUrl ? <img src={logoUrl} alt={title} className="w-full h-full object-contain drop-shadow-md" /> : <TrophyIcon className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-white font-bold text-lg uppercase tracking-wider">{title} (Fase de Liga Suiza)</h3>
            </div>

            <div className="w-full overflow-hidden">
                <table className="w-full table-fixed text-xs sm:text-sm">
                    <thead>
                        <tr className="bg-slate-800/60 text-slate-400 uppercase text-[9px] sm:text-[10px] font-black tracking-wider border-b border-white/10">
                            <th className="w-7 sm:w-10 px-1 py-2.5 sm:py-3 text-center">Pos</th>
                            <th className="px-2 py-2.5 sm:py-3 text-left">Club</th>
                            <th className="w-6 sm:w-8 px-0.5 py-2.5 sm:py-3 text-center">PJ</th>
                            <th className="w-6 sm:w-8 px-0.5 py-2.5 sm:py-3 text-center">G</th>
                            <th className="w-6 sm:w-8 px-0.5 py-2.5 sm:py-3 text-center">E</th>
                            <th className="w-6 sm:w-8 px-0.5 py-2.5 sm:py-3 text-center">P</th>
                            <th className="w-7 sm:w-10 px-0.5 py-2.5 sm:py-3 text-center">DG</th>
                            <th className="w-8 sm:w-12 px-1 py-2.5 sm:py-3 text-center font-black">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {table.slice().sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference).map((row, index) => {
                            const team = getTeamById(row.teamId);
                            const isPlayerTeam = team?.id === gameState.team.id;
                            const pos = index + 1;

                            let zoneColor = '';
                            let zoneLabel = '';
                            if (pos <= 8) { zoneColor = 'bg-green-500'; zoneLabel = 'Clasificación Directa (Octavos)'; }
                            else if (pos >= 9 && pos <= 24) { zoneColor = 'bg-blue-500'; zoneLabel = 'Play-offs'; }
                            else { zoneColor = 'bg-red-500'; zoneLabel = 'Eliminado'; }

                            return (
                                <tr key={row.teamId} className={`transition-all duration-200 ${isPlayerTeam ? 'bg-amber-500/15 font-semibold' : 'hover:bg-white/5'}`}>
                                    <td className="w-7 sm:w-10 px-1 py-2 sm:py-2.5 text-center relative">
                                        <div className="flex items-center justify-center">
                                            <span className={`font-bold ${isPlayerTeam ? 'text-amber-300' : 'text-slate-400'}`}>{pos}</span>
                                            {zoneColor && <div className={`w-1 h-4 sm:h-5 ${zoneColor} rounded-full absolute left-1 sm:left-1.5`} title={zoneLabel}></div>}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 sm:py-2.5 min-w-0">
                                        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                                            <div className="w-5 h-5 sm:w-7 sm:h-7 shrink-0 flex items-center justify-center"><TeamLogo team={team} /></div>
                                            <span className={`font-bold truncate text-[11px] sm:text-xs md:text-sm ${isPlayerTeam ? 'text-white' : 'text-slate-200'}`}>{team?.name}</span>
                                        </div>
                                    </td>
                                    <td className="w-6 sm:w-8 px-0.5 py-2 sm:py-2.5 text-center text-slate-400">{row.played}</td>
                                    <td className="w-6 sm:w-8 px-0.5 py-2 sm:py-2.5 text-center text-slate-400">{row.won}</td>
                                    <td className="w-6 sm:w-8 px-0.5 py-2 sm:py-2.5 text-center text-slate-400">{row.drawn}</td>
                                    <td className="w-6 sm:w-8 px-0.5 py-2 sm:py-2.5 text-center text-slate-400">{row.lost}</td>
                                    <td className={`w-7 sm:w-10 px-0.5 py-2 sm:py-2.5 text-center font-bold ${row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                    </td>
                                    <td className="w-8 sm:w-12 px-1 py-2 sm:py-2.5 text-center font-black text-white">{row.points}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
