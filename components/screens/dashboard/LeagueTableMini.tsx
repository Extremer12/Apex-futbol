import React from 'react';
import { GameState } from '../../../types';
import { TeamLogo } from '../../../data/teams/helpers';

interface LeagueTableMiniProps {
    gameState: GameState;
}

export const LeagueTableMini: React.FC<LeagueTableMiniProps> = ({ gameState }) => {
    const leagueId = gameState.team.leagueId;
    const table = gameState.leagueTables[leagueId] || [];
    const top5 = table.slice(0, 5);

    return (
        <div className="apex-card overflow-hidden h-full">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase">Clasificación</span>
                <span className="text-[8px] font-bold text-[var(--apex-gold)] uppercase">{gameState.team.competition || 'Liga Local'}</span>
            </div>
            <div className="p-0">
                <table className="w-full text-[10px]">
                    <thead>
                        <tr className="text-white/20 font-black uppercase tracking-widest border-b border-white/5">
                            <th className="px-4 py-2 text-left">Pos</th>
                            <th className="px-2 py-2 text-left">Club</th>
                            <th className="px-2 py-2 text-center">PJ</th>
                            <th className="px-2 py-2 text-center">DG</th>
                            <th className="px-4 py-2 text-right">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {top5.map((row, idx) => {
                            const team = gameState.allTeams.find(t => t.id === row.teamId);
                            const isPlayerTeam = row.teamId === gameState.team.id;
                            return (
                                <tr key={row.teamId} className={`${isPlayerTeam ? 'bg-[var(--apex-gold)]/10' : ''} hover:bg-white/5 transition-colors`}>
                                    <td className="px-4 py-2.5 font-black text-white/40">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1 h-3 rounded-full ${idx < 4 ? 'bg-blue-500' : 'bg-white/10'}`}></div>
                                            {row.position}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4">
                                                <TeamLogo team={team} />
                                            </div>
                                            <span className={`font-bold ${isPlayerTeam ? 'text-[var(--apex-gold)]' : 'text-white/80'}`}>{team?.shortName || team?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2.5 text-center text-white/60">{row.played}</td>
                                    <td className="px-2 py-2.5 text-center text-white/60">{row.goalsFor - row.goalsAgainst > 0 ? '+' : ''}{row.goalsFor - row.goalsAgainst}</td>
                                    <td className="px-4 py-2.5 text-right font-black text-white">{row.points}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <button className="w-full py-3 text-[8px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors border-t border-white/5 bg-black/10">
                    Ver Tabla Completa
                </button>
            </div>
        </div>
    );
};
