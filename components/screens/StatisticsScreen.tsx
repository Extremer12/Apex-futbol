import React, { useMemo, useState } from 'react';
import { GameState, Player, LeagueId } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';
import { motion, AnimatePresence } from 'framer-motion';

interface StatisticsScreenProps {
    gameState: GameState;
}

interface PlayerStats {
    player: Player;
    teamId: number;
    teamName: string;
    teamLogo: string;
    goals: number;
    assists: number;
    matches: number;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = React.memo(({ gameState }) => {
    const [selectedLeague, setSelectedLeague] = useState<LeagueId>(gameState.team.leagueId);

    const playerStats = useMemo(() => {
        const stats: PlayerStats[] = [];
        gameState.allTeams.forEach(team => {
            if (team.leagueId !== selectedLeague) return;
            team.squad.forEach(player => {
                if (player.stats && (player.stats.goals > 0 || player.stats.assists > 0 || player.stats.appearances > 0)) {
                    stats.push({
                        player,
                        teamId: team.id,
                        teamName: team.name,
                        teamLogo: team.logo,
                        goals: player.stats.goals,
                        assists: player.stats.assists,
                        matches: player.stats.appearances
                    });
                }
            });
        });
        return stats;
    }, [gameState.allTeams, selectedLeague]);

    const topScorers = useMemo(() => {
        return [...playerStats]
            .filter(s => s.goals > 0)
            .sort((a, b) => b.goals - a.goals)
            .slice(0, 10);
    }, [playerStats]);

    const topAssists = useMemo(() => {
        return [...playerStats]
            .filter(s => s.assists > 0)
            .sort((a, b) => b.assists - a.assists)
            .slice(0, 10);
    }, [playerStats]);

    const LEAGUE_LOGOS: Record<string, string> = {
        PREMIER_LEAGUE: '/logos/Premier League.png',
        CHAMPIONSHIP: '/logos/Sky Bet Championship.png',
        LA_LIGA: 'https://tmssl.akamaized.net/images/logo/header/es1.png',
        BUNDESLIGA: 'https://tmssl.akamaized.net/images/logo/header/l1.png',
        SERIE_A: 'https://tmssl.akamaized.net/images/logo/header/it1.png'
    };

    const LEAGUE_NAMES: Record<string, string> = {
        PREMIER_LEAGUE: 'Premier League',
        CHAMPIONSHIP: 'Championship',
        LA_LIGA: 'La Liga',
        BUNDESLIGA: 'Bundesliga',
        SERIE_A: 'Serie A'
    };

    const AVAILABLE_LEAGUES = [
        LeagueId.PREMIER_LEAGUE,
        LeagueId.CHAMPIONSHIP,
        LeagueId.LA_LIGA,
        LeagueId.BUNDESLIGA,
        LeagueId.SERIE_A
    ];

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-24 animate-fade-in">
            {/* League Selector */}
            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar hide-scrollbar-mobile">
                {AVAILABLE_LEAGUES.map(league => (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        key={league}
                        onClick={() => setSelectedLeague(league)}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all duration-300 border ${
                            selectedLeague === league 
                            ? `bg-[var(--apex-gold)] text-black border-[var(--apex-gold)] shadow-[0_0_15px_rgba(200,168,78,0.4)]` 
                            : 'bg-black/30 text-white/50 border-white/5 hover:bg-black/50 hover:text-white hover:border-white/10'
                        }`}
                    >
                        {LEAGUE_NAMES[league]}
                    </motion.button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={selectedLeague}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {/* Header Section */}
                    <div className="relative overflow-hidden apex-card p-6 md:p-8 shadow-2xl transition-all duration-500 group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--apex-gold)]/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-[var(--apex-gold)]/20 transition-all duration-700"></div>
                        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="w-20 h-20 md:w-24 md:h-24 p-3 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center shadow-xl">
                                <img 
                                    src={LEAGUE_LOGOS[selectedLeague]} 
                                    alt="League" 
                                    className="w-full h-full object-contain drop-shadow-lg" 
                                />
                            </div>
                            <div className="text-center md:text-left pt-2">
                                <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-1">
                                    {LEAGUE_NAMES[selectedLeague]} • Season 2024/25
                                </h2>
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">
                                    Elite <span className="text-[var(--apex-gold)]">Stats</span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Scorers Card */}
                        <div className="apex-card overflow-hidden">
                            <div className="bg-black/40 px-6 py-5 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-white font-black text-sm uppercase tracking-widest italic flex items-center gap-3">
                                    <span className="text-xl">⚽</span> Top Scorers
                                </h3>
                            </div>
                            <div className="p-0 overflow-x-auto custom-scrollbar">
                                <table className="w-full text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5 bg-black/20">
                                            <th className="px-6 py-4 text-left">Player</th>
                                            <th className="px-6 py-4 text-center">Club</th>
                                            <th className="px-6 py-4 text-right">Goals</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {topScorers.length > 0 ? topScorers.map((stat, idx) => (
                                            <tr key={stat.player.id} className="group hover:bg-white/5 transition-all duration-300">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-sm font-black w-4 text-center ${idx === 0 ? 'text-[var(--apex-gold)] drop-shadow-[0_0_5px_rgba(200,168,78,0.5)]' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-white/30'}`}>
                                                            {idx + 1}
                                                        </span>
                                                        <div>
                                                            <div className="font-bold text-white group-hover:text-[var(--apex-gold)] transition-colors text-sm">{stat.player.name}</div>
                                                            <div className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mt-0.5">{stat.player.position}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex justify-center group-hover:scale-110 transition-transform">
                                                        <div className="w-8 h-8 bg-black/30 p-1.5 rounded border border-white/5">
                                                            <TeamLogo team={{ logo: stat.teamLogo, name: stat.teamName }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-2xl text-[var(--apex-gold)] italic drop-shadow-sm">{stat.goals}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-white/30 font-black text-[10px] uppercase tracking-widest">No data recorded</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Top Assists Card */}
                        <div className="apex-card overflow-hidden">
                            <div className="bg-black/40 px-6 py-5 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-white font-black text-sm uppercase tracking-widest italic flex items-center gap-3">
                                    <span className="text-xl">👟</span> Top Assists
                                </h3>
                            </div>
                            <div className="p-0 overflow-x-auto custom-scrollbar">
                                <table className="w-full text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5 bg-black/20">
                                            <th className="px-6 py-4 text-left">Player</th>
                                            <th className="px-6 py-4 text-center">Club</th>
                                            <th className="px-6 py-4 text-right">Assists</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {topAssists.length > 0 ? topAssists.map((stat, idx) => (
                                            <tr key={stat.player.id} className="group hover:bg-white/5 transition-all duration-300">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-sm font-black w-4 text-center ${idx === 0 ? 'text-[var(--apex-gold)] drop-shadow-[0_0_5px_rgba(200,168,78,0.5)]' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-white/30'}`}>
                                                            {idx + 1}
                                                        </span>
                                                        <div>
                                                            <div className="font-bold text-white group-hover:text-[var(--apex-gold)] transition-colors text-sm">{stat.player.name}</div>
                                                            <div className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mt-0.5">{stat.player.position}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex justify-center group-hover:scale-110 transition-transform">
                                                        <div className="w-8 h-8 bg-black/30 p-1.5 rounded border border-white/5">
                                                            <TeamLogo team={{ logo: stat.teamLogo, name: stat.teamName }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-2xl text-[var(--apex-gold)] italic drop-shadow-sm">{stat.assists}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-white/30 font-black text-[10px] uppercase tracking-widest">No data recorded</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Team Performance Card */}
                        <div className="space-y-6 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="apex-card p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--apex-green)]/10 blur-[40px] rounded-full group-hover:bg-[var(--apex-green)]/20 transition-all duration-500"></div>
                                <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-4 bg-[var(--apex-green)] rounded-sm"></div>
                                    Offensive Power
                                </h3>
                                {(() => {
                                    const currentTable = gameState.leagueTables[selectedLeague] || [];
                                    const bestAttack = [...currentTable].sort((a, b) => b.goalsFor - a.goalsFor)[0];
                                    const team = gameState.allTeams.find(t => t.id === bestAttack?.teamId);
                                    return team ? (
                                        <div className="flex items-center gap-5 p-4 bg-black/30 rounded-xl border border-white/5 group-hover:bg-white/5 transition-all">
                                            <div className="w-14 h-14 bg-black/40 p-2 rounded-lg border border-white/10 group-hover:scale-110 transition-transform">
                                                <TeamLogo team={team} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[9px] font-black text-[var(--apex-green)] uppercase tracking-[0.2em] mb-1">Most Goals Scored</div>
                                                <div className="text-lg font-black text-white leading-none">{team.name}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-black text-[var(--apex-green)] italic">{bestAttack.goalsFor}</div>
                                                <div className="text-[8px] text-white/40 uppercase tracking-[0.2em] font-black">Goals</div>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                            <div className="apex-card p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[40px] rounded-full group-hover:bg-sky-500/20 transition-all duration-500"></div>
                                <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-4 bg-sky-500 rounded-sm"></div>
                                    Defensive Wall
                                </h3>
                                {(() => {
                                    const currentTable = gameState.leagueTables[selectedLeague] || [];
                                    const bestDefense = [...currentTable].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0];
                                    const team = gameState.allTeams.find(t => t.id === bestDefense?.teamId);
                                    return team ? (
                                        <div className="flex items-center gap-5 p-4 bg-black/30 rounded-xl border border-white/5 group-hover:bg-white/5 transition-all">
                                            <div className="w-14 h-14 bg-black/40 p-2 rounded-lg border border-white/10 group-hover:scale-110 transition-transform">
                                                <TeamLogo team={team} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[9px] font-black text-sky-400 uppercase tracking-[0.2em] mb-1">Least Goals Conceded</div>
                                                <div className="text-lg font-black text-white leading-none">{team.name}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-black text-sky-400 italic">{bestDefense.goalsAgainst}</div>
                                                <div className="text-[8px] text-white/40 uppercase tracking-[0.2em] font-black">Goals</div>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
});
