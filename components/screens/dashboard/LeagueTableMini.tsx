import React from 'react';
import { GameState } from '../../../types';
import { TeamLogo } from '../../../data/teams/helpers';
import { Trophy } from 'lucide-react';

interface LeagueTableMiniProps {
    gameState: GameState;
}

export const LeagueTableMini: React.FC<LeagueTableMiniProps> = React.memo(({ gameState }) => {
    const leagueId = gameState.team.leagueId;
    const table = gameState.leagueTables[leagueId] || [];

    // Show top 5, or top 4 + user team if user is outside top 5
    const rowsToShow = React.useMemo(() => {
        const top5 = table.slice(0, 5);
        const userInTop5 = top5.some(r => r.teamId === gameState.team.id);
        if (userInTop5 || table.length <= 5) return top5;
        const userRow = table.find(r => r.teamId === gameState.team.id);
        return userRow ? [...table.slice(0, 4), userRow] : top5;
    }, [table, gameState.team.id]);

    const teamMap = React.useMemo(() => {
        const m = new Map<number, typeof gameState.allTeams[0]>();
        for (const t of gameState.allTeams) m.set(t.id, t);
        return m;
    }, [gameState.allTeams]);

    return (
        <div className="apex-card overflow-hidden h-full flex flex-col">
            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                    <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Clasificación</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[140px]">
                    {gameState.team.competition || 'Liga'}
                </span>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-slate-500 text-[10px] font-bold uppercase border-b border-white/5">
                            <th className="px-3.5 py-2 text-left w-10">#</th>
                            <th className="px-2 py-2 text-left">Club</th>
                            <th className="px-2 py-2 text-center w-8">PJ</th>
                            <th className="px-2 py-2 text-center w-10">DG</th>
                            <th className="px-3.5 py-2 text-right w-12">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rowsToShow.map((row) => {
                            const team = teamMap.get(row.teamId);
                            const isPlayerTeam = row.teamId === gameState.team.id;
                            const diff = row.goalsFor - row.goalsAgainst;

                            return (
                                <tr
                                    key={row.teamId}
                                    className={isPlayerTeam ? 'bg-[var(--apex-gold)]/10' : 'hover:bg-white/[0.02]'}
                                >
                                    <td className="px-3.5 py-2.5 font-bold text-slate-400">
                                        {row.position}
                                    </td>
                                    <td className="px-2 py-2.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-5 h-5 shrink-0">
                                                <TeamLogo team={team} />
                                            </div>
                                            <span className={`font-bold truncate ${
                                                isPlayerTeam ? 'text-[var(--apex-gold)]' : 'text-white'
                                            }`}>
                                                {team?.shortName || team?.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2.5 text-center text-slate-400">{row.played}</td>
                                    <td className={`px-2 py-2.5 text-center font-semibold ${
                                        diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-slate-500'
                                    }`}>
                                        {diff > 0 ? `+${diff}` : diff}
                                    </td>
                                    <td className="px-3.5 py-2.5 text-right font-black text-white">
                                        {row.points}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
