import React from 'react';
import { Player } from '../../../types';
import { TeamLogo, PlayerPhoto } from '../../../data/teams/helpers';
import { PlayerStats } from './types';

interface StatsLeaderboardsProps {
    topScorers: PlayerStats[];
    topAssists: PlayerStats[];
    isLeague: boolean;
    onSelectPlayer: (player: Player) => void;
}

export const StatsLeaderboards: React.FC<StatsLeaderboardsProps> = React.memo(({
    topScorers,
    topAssists,
    isLeague,
    onSelectPlayer,
}) => {
    return (
        <div className={`grid grid-cols-1 ${isLeague ? 'lg:grid-cols-2' : ''} gap-4 sm:gap-6 w-full`}>
            {/* 1. TOP SCORERS TABLE */}
            <div className="bg-[#0E131F] border border-white/10 rounded-2xl overflow-hidden shadow-xl w-full">
                <div className="bg-gradient-to-r from-black/60 to-black/30 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5">
                        <span className="text-base sm:text-lg">⚽</span>
                        <span>Máximos Goleadores</span>
                    </h3>
                    <span className="text-[10px] font-mono text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-0.5 rounded-full border border-[var(--apex-gold)]/20">
                        Top {topScorers.length}
                    </span>
                </div>

                <div className="p-0 w-full overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                        <thead>
                            <tr className="text-white/40 text-[9px] font-black uppercase tracking-[0.15em] border-b border-white/5 bg-black/20">
                                <th className="w-10 px-3 py-2.5 text-center">#</th>
                                <th className="px-3 py-2.5 text-left">Jugador</th>
                                <th className="w-12 px-2 py-2.5 text-center">Club</th>
                                <th className="w-20 px-4 py-2.5 text-right">Goles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {topScorers.length > 0 ? (
                                topScorers.map((stat, idx) => (
                                    <tr 
                                        key={`${stat.player.id}-${idx}`} 
                                        onClick={() => stat.player && onSelectPlayer(stat.player)}
                                        className="group hover:bg-white/5 transition-colors cursor-pointer"
                                        title="Ver perfil del jugador"
                                    >
                                        {/* Rank / Podium Badge */}
                                        <td className="w-10 px-3 py-2.5 sm:py-3 text-center">
                                            {idx === 0 ? (
                                                <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black text-[10px] inline-flex items-center justify-center shadow-md shadow-amber-400/30">
                                                    1
                                                </span>
                                            ) : idx === 1 ? (
                                                <span className="w-5 h-5 rounded-full bg-slate-300 text-black font-black text-[10px] inline-flex items-center justify-center shadow-md shadow-slate-300/30">
                                                    2
                                                </span>
                                            ) : idx === 2 ? (
                                                <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[10px] inline-flex items-center justify-center shadow-md shadow-amber-700/30">
                                                    3
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-white/30">
                                                    {idx + 1}
                                                </span>
                                            )}
                                        </td>

                                        {/* Player Photo & Name */}
                                        <td className="px-3 py-2.5 sm:py-3">
                                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                <PlayerPhoto 
                                                    player={stat.player} 
                                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-white/10 shrink-0 shadow-sm" 
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-black text-white group-hover:text-[var(--apex-gold)] transition-colors text-xs sm:text-sm truncate">
                                                        {stat.player.name}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[8px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20">
                                                            {stat.player.position}
                                                        </span>
                                                        {stat.player.rating && (
                                                            <span className="text-[9px] text-white/40 font-bold">
                                                                {stat.player.rating} OVR
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Team Shield */}
                                        <td className="w-12 px-2 py-2.5 sm:py-3 text-center">
                                            <div className="w-6 h-6 sm:w-7 sm:h-7 mx-auto flex items-center justify-center shrink-0" title={stat.teamName}>
                                                <TeamLogo team={stat.team} className="w-full h-full object-contain drop-shadow" />
                                            </div>
                                        </td>

                                        {/* Goals Count */}
                                        <td className="w-20 px-4 py-2.5 sm:py-3 text-right">
                                            <div className="text-lg sm:text-2xl font-black text-[var(--apex-gold)] italic leading-none">
                                                {stat.goals}
                                            </div>
                                            <div className="text-[8px] text-white/40 uppercase tracking-widest font-black mt-0.5">
                                                {stat.matches > 0 ? `${stat.matches} PJ` : 'Goles'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center text-white/30 font-black text-xs uppercase tracking-widest">
                                        Sin goles registrados aún en esta competición
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. TOP ASSISTS TABLE (ONLY FOR LEAGUES) */}
            {isLeague && (
                <div className="bg-[#0E131F] border border-white/10 rounded-2xl overflow-hidden shadow-xl w-full">
                    <div className="bg-gradient-to-r from-black/60 to-black/30 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5">
                            <span className="text-base sm:text-lg">👟</span>
                            <span>Máximos Asistentes</span>
                        </h3>
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                            Top {topAssists.length}
                        </span>
                    </div>

                    <div className="p-0 w-full overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm">
                            <thead>
                                <tr className="text-white/40 text-[9px] font-black uppercase tracking-[0.15em] border-b border-white/5 bg-black/20">
                                    <th className="w-10 px-3 py-2.5 text-center">#</th>
                                    <th className="px-3 py-2.5 text-left">Jugador</th>
                                    <th className="w-12 px-2 py-2.5 text-center">Club</th>
                                    <th className="w-20 px-4 py-2.5 text-right">Asistencias</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {topAssists.length > 0 ? (
                                    topAssists.map((stat, idx) => (
                                        <tr 
                                            key={`${stat.player.id}-${idx}`} 
                                            onClick={() => stat.player && onSelectPlayer(stat.player)}
                                            className="group hover:bg-white/5 transition-colors cursor-pointer"
                                            title="Ver perfil del jugador"
                                        >
                                            {/* Rank / Podium Badge */}
                                            <td className="w-10 px-3 py-2.5 sm:py-3 text-center">
                                                {idx === 0 ? (
                                                    <span className="w-5 h-5 rounded-full bg-sky-400 text-black font-black text-[10px] inline-flex items-center justify-center shadow-md shadow-sky-400/30">
                                                        1
                                                    </span>
                                                ) : idx === 1 ? (
                                                    <span className="w-5 h-5 rounded-full bg-slate-300 text-black font-black text-[10px] inline-flex items-center justify-center shadow-md shadow-slate-300/30">
                                                        2
                                                    </span>
                                                ) : idx === 2 ? (
                                                    <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[10px] inline-flex items-center justify-center shadow-md shadow-amber-700/30">
                                                        3
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-white/30">
                                                        {idx + 1}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Player Photo & Name */}
                                            <td className="px-3 py-2.5 sm:py-3">
                                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                    <PlayerPhoto 
                                                        player={stat.player} 
                                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-white/10 shrink-0 shadow-sm" 
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-black text-white group-hover:text-sky-300 transition-colors text-xs sm:text-sm truncate">
                                                            {stat.player.name}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-[8px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20">
                                                                {stat.player.position}
                                                            </span>
                                                            {stat.player.rating && (
                                                                <span className="text-[9px] text-white/40 font-bold">
                                                                    {stat.player.rating} OVR
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Team Shield */}
                                            <td className="w-12 px-2 py-2.5 sm:py-3 text-center">
                                                <div className="w-6 h-6 sm:w-7 sm:h-7 mx-auto flex items-center justify-center shrink-0" title={stat.teamName}>
                                                    <TeamLogo team={stat.team} className="w-full h-full object-contain drop-shadow" />
                                                </div>
                                            </td>

                                            {/* Assists Count */}
                                            <td className="w-20 px-4 py-2.5 sm:py-3 text-right">
                                                <div className="text-lg sm:text-2xl font-black text-sky-400 italic leading-none">
                                                    {stat.assists}
                                                </div>
                                                <div className="text-[8px] text-white/40 uppercase tracking-widest font-black mt-0.5">
                                                    {stat.matches > 0 ? `${stat.matches} PJ` : 'Asistencias'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-white/30 font-black text-xs uppercase tracking-widest">
                                            Sin asistencias registradas aún en esta liga
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
});
