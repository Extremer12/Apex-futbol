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

    // Official UEFA tiebreakers:
    // 1. Points
    // 2. Goal Difference
    // 3. Goals For
    // 4. Matches Won
    const sortedRows = [...table].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if ((b.goalsFor || 0) !== (a.goalsFor || 0)) return (b.goalsFor || 0) - (a.goalsFor || 0);
        if ((b.won || 0) !== (a.won || 0)) return (b.won || 0) - (a.won || 0);
        return a.teamId - b.teamId;
    });

    return (
        <div className="bg-gradient-to-br from-[#0b1220] via-[#090d16] to-[#060910] border-2 border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900/80 to-blue-900/60 px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 p-1.5 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                        {logoUrl ? (
                            <img src={logoUrl} alt={title} className="w-full h-full object-contain drop-shadow-md" />
                        ) : (
                            <TrophyIcon className="w-6 h-6 text-indigo-400" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-white font-black text-base sm:text-lg tracking-tight uppercase">{title}</h3>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                Fase de Liga (36 Clubes)
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Tabla general unificada tras 8 jornadas • Sistema Suizo oficial
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap min-w-[560px]">
                    <thead>
                        <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-white/10">
                            <th className="w-12 px-3 py-3 text-center">Pos</th>
                            <th className="px-3 py-3 text-left">Club</th>
                            <th className="w-10 px-2 py-3 text-center">PJ</th>
                            <th className="w-10 px-2 py-3 text-center">G</th>
                            <th className="w-10 px-2 py-3 text-center">E</th>
                            <th className="w-10 px-2 py-3 text-center">P</th>
                            <th className="w-12 px-2 py-3 text-center">GF</th>
                            <th className="w-12 px-2 py-3 text-center">GC</th>
                            <th className="w-12 px-2 py-3 text-center">DG</th>
                            <th className="w-14 px-3 py-3 text-center font-black text-amber-400">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedRows.map((row, index) => {
                            const team = getTeamById(row.teamId);
                            const isPlayerTeam = team?.id === gameState.team.id;
                            const pos = index + 1;

                            // Qualification zone styling
                            let zoneColor = '';
                            let zoneBadge = null;
                            const rowBg = isPlayerTeam ? 'bg-amber-500/15' : 'hover:bg-white/[0.03]';

                            if (pos <= 8) {
                                zoneColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]';
                                if (pos === 1) {
                                    zoneBadge = (
                                        <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                            Líder • Octavos Directo
                                        </span>
                                    );
                                }
                            } else if (pos <= 16) {
                                zoneColor = 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]';
                            } else if (pos <= 24) {
                                zoneColor = 'bg-blue-500';
                            } else {
                                zoneColor = 'bg-rose-500/40';
                            }

                            return (
                                <tr key={row.teamId} className={`transition-all duration-150 ${rowBg}`}>
                                    {/* Position with zone bar */}
                                    <td className="w-12 px-3 py-2.5 text-center relative font-black">
                                        <div className={`w-1 h-5 ${zoneColor} rounded-full absolute left-1.5 top-1/2 -translate-y-1/2`} />
                                        <span className={`text-xs ${
                                            isPlayerTeam ? 'text-amber-300 font-extrabold' : 
                                            pos <= 8 ? 'text-emerald-400 font-extrabold' :
                                            pos <= 16 ? 'text-cyan-300 font-bold' :
                                            pos <= 24 ? 'text-blue-300 font-bold' :
                                            'text-slate-500 font-normal'
                                        }`}>
                                            {pos}
                                        </span>
                                    </td>

                                    {/* Club */}
                                    <td className="px-3 py-2.5 min-w-[180px]">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                    <TeamLogo team={team} className="w-full h-full object-contain drop-shadow" />
                                                </div>
                                                <span className={`font-bold truncate ${
                                                    isPlayerTeam ? 'text-amber-300 font-black' : 
                                                    pos <= 24 ? 'text-white' : 'text-slate-400'
                                                }`}>
                                                    {team?.name || 'Club'}
                                                </span>
                                            </div>
                                            {isPlayerTeam && (
                                                <span className="text-[8px] font-black uppercase text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-1.5 py-0.5 rounded border border-[var(--apex-gold)]/20 shrink-0">
                                                    Tu Club
                                                </span>
                                            )}
                                            {zoneBadge}
                                        </div>
                                    </td>

                                    {/* Stats */}
                                    <td className="w-10 px-2 py-2.5 text-center text-slate-300 font-semibold">{row.played}</td>
                                    <td className="w-10 px-2 py-2.5 text-center text-slate-400">{row.won}</td>
                                    <td className="w-10 px-2 py-2.5 text-center text-slate-400">{row.drawn}</td>
                                    <td className="w-10 px-2 py-2.5 text-center text-slate-400">{row.lost}</td>
                                    <td className="w-12 px-2 py-2.5 text-center text-slate-400">{row.goalsFor || 0}</td>
                                    <td className="w-12 px-2 py-2.5 text-center text-slate-400">{row.goalsAgainst || 0}</td>
                                    <td className={`w-12 px-2 py-2.5 text-center font-bold ${
                                        row.goalDifference > 0 ? 'text-emerald-400' :
                                        row.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'
                                    }`}>
                                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                    </td>
                                    <td className="w-14 px-3 py-2.5 text-center font-black text-sm text-white">
                                        {row.points}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Classification Zone Legend */}
            <div className="px-5 py-4 bg-slate-950/70 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
                    <span className="font-bold text-slate-300">1.º al 8.º:</span>
                    <span className="text-emerald-400 font-semibold">Octavos de Final (Directo / Cabezas de Serie)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
                    <span className="font-bold text-slate-300">9.º al 16.º:</span>
                    <span className="text-cyan-300 font-semibold">Playoffs 16vos (Cabezas de Serie con localía en vuelta)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="font-bold text-slate-300">17.º al 24.º:</span>
                    <span className="text-blue-300 font-semibold">Playoffs 16vos (No Cabezas de Serie)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                    <span className="font-bold text-slate-300">25.º al 36.º:</span>
                    <span className="text-rose-400 font-semibold">Eliminados de Competiciones Europeas</span>
                </div>
            </div>
        </div>
    );
};
