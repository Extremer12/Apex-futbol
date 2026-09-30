import React from 'react';
import { GameState } from '../../../types';
import { TeamLogo } from '../../../data/teams/helpers';
import { PitchWatermark, PodiumRankBadge } from '../../ui/GameCardDecorations';
import { Trophy } from 'lucide-react';

interface LeagueTableMiniProps {
    gameState: GameState;
}

export const LeagueTableMini: React.FC<LeagueTableMiniProps> = ({ gameState }) => {
    const leagueId = gameState.team.leagueId;
    const table = gameState.leagueTables[leagueId] || [];
    const top5 = table.slice(0, 5);

    return (
        <div className="apex-card overflow-hidden h-full flex flex-col relative group">
            {/* Subtle Pitch Watermark */}
            <PitchWatermark opacity={0.05} accentColor="#38bdf8" />

            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-white/5 flex justify-between items-center bg-black/30 relative z-10">
                <div className="flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                    <span className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] text-white/70 uppercase">Clasificación</span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border border-[var(--apex-gold)]/20 truncate max-w-[140px]">
                    {gameState.team.competition || 'Liga Local'}
                </span>
            </div>

            {/* Table */}
            <div className="p-0 flex-1 relative z-10 flex flex-col justify-between">
                <table className="w-full text-[10px] sm:text-[11px]">
                    <thead>
                        <tr className="text-white/30 font-black uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                            <th className="px-3 sm:px-4 py-2 text-left w-14">Pos</th>
                            <th className="px-2 py-2 text-left">Club</th>
                            <th className="px-2 py-2 text-center w-8">PJ</th>
                            <th className="px-2 py-2 text-center w-10">DG</th>
                            <th className="px-3 sm:px-4 py-2 text-right w-12">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                        {top5.map((row) => {
                            const team = gameState.allTeams.find(t => t.id === row.teamId);
                            const isPlayerTeam = row.teamId === gameState.team.id;
                            const diff = row.goalsFor - row.goalsAgainst;

                            return (
                                <tr 
                                    key={row.teamId} 
                                    className={`transition-colors relative ${
                                        isPlayerTeam 
                                            ? 'bg-amber-500/10 hover:bg-amber-500/15' 
                                            : 'hover:bg-white/[0.03]'
                                    }`}
                                >
                                    {/* Position with Podium Badges */}
                                    <td className="px-3 sm:px-4 py-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1 h-3 rounded-full shrink-0 ${
                                                row.position <= 4 ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.5)]' : 'bg-white/10'
                                            }`} />
                                            <PodiumRankBadge rank={row.position} />
                                        </div>
                                    </td>

                                    {/* Club Name & Logo */}
                                    <td className="px-2 py-2.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                                <TeamLogo team={team} />
                                            </div>
                                            <span className={`font-black truncate ${
                                                isPlayerTeam 
                                                    ? 'text-[var(--apex-gold)] drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                                                    : 'text-white/90'
                                            }`}>
                                                {team?.shortName || team?.name}
                                            </span>
                                            {isPlayerTeam && (
                                                <span className="hidden sm:inline-block text-[8px] font-black uppercase px-1 py-0.2 bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] rounded">
                                                    TÚ
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Stats */}
                                    <td className="px-2 py-2.5 text-center text-white/50 font-mono font-medium">{row.played}</td>
                                    <td className={`px-2 py-2.5 text-center font-mono font-bold ${
                                        diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-white/40'
                                    }`}>
                                        {diff > 0 ? `+${diff}` : diff}
                                    </td>
                                    <td className="px-3 sm:px-4 py-2.5 text-right font-black text-white font-mono text-xs sm:text-sm">
                                        <span className={isPlayerTeam ? 'text-[var(--apex-gold)]' : 'text-white'}>
                                            {row.points}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Footer Link */}
                <div className="p-2 border-t border-white/5 bg-black/20">
                    <div className="flex items-center justify-between px-2 text-[8px] uppercase tracking-wider text-white/40 font-bold">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                            Zona Champions (Top 4)
                        </span>
                        <span className="text-[var(--apex-gold)]/70">Temporada {gameState.season}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
