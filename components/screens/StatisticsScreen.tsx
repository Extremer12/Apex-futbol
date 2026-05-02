import React, { useMemo, useState } from 'react';
import { GameState, Player, LeagueId } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';

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

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ gameState }) => {
    const [selectedLeague, setSelectedLeague] = useState<LeagueId>(gameState.team.leagueId);

    // Calculate player statistics from match results
    const playerStats = useMemo(() => {
        const stats: Map<number, PlayerStats> = new Map();

        // Initialize stats for all players in the selected league
        gameState.allTeams.forEach(team => {
            if (team.leagueId !== selectedLeague) return;
            team.squad.forEach(player => {
                stats.set(player.id, {
                    player,
                    teamId: team.id,
                    teamName: team.name,
                    teamLogo: team.logo,
                    goals: 0,
                    assists: 0,
                    matches: 0
                });
            });
        });

        // Aggregate actual goals from match results
        gameState.schedule.forEach(match => {
            if (match.result) {
                const homeTeam = gameState.allTeams.find(t => t.id === match.homeTeamId);
                const awayTeam = gameState.allTeams.find(t => t.id === match.awayTeamId);
                
                if (homeTeam) homeTeam.squad.forEach(p => { const s = stats.get(p.id); if (s) s.matches++; });
                if (awayTeam) awayTeam.squad.forEach(p => { const s = stats.get(p.id); if (s) s.matches++; });

                if (match.result.scorers) {
                    match.result.scorers.forEach(scorer => {
                        const playerStat = stats.get(scorer.playerId);
                        if (playerStat) {
                            playerStat.goals++;
                        }
                    });
                }
            }
        });

        return Array.from(stats.values());
    }, [gameState, selectedLeague]);

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

    const LEAGUE_THEMES: Record<string, string> = {
        PREMIER_LEAGUE: 'purple',
        CHAMPIONSHIP: 'sky',
        LA_LIGA: 'orange',
        BUNDESLIGA: 'red',
        SERIE_A: 'emerald'
    };

    const themeColor = LEAGUE_THEMES[selectedLeague] || 'purple';

    const AVAILABLE_LEAGUES = [
        LeagueId.PREMIER_LEAGUE,
        LeagueId.CHAMPIONSHIP,
        LeagueId.LA_LIGA,
        LeagueId.BUNDESLIGA,
        LeagueId.SERIE_A
    ];

    return (
        <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto animate-fade-in">
            {/* League Selector */}
            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar hide-scrollbar-mobile">
                {AVAILABLE_LEAGUES.map(league => (
                    <button
                        key={league}
                        onClick={() => setSelectedLeague(league)}
                        className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 border ${
                            selectedLeague === league 
                            ? \`bg-\${LEAGUE_THEMES[league]}-600 text-white border-\${LEAGUE_THEMES[league]}-500 shadow-lg shadow-\${LEAGUE_THEMES[league]}-500/30\` 
                            : 'bg-slate-900/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        {LEAGUE_NAMES[league]}
                    </button>
                ))}
            </div>

            {/* Header Section */}
            <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-${themeColor}-500/30 p-8 shadow-2xl transition-colors duration-500`}>
                <div className={`absolute top-0 right-0 w-64 h-64 bg-${themeColor}-500/5 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 transition-colors duration-500`}></div>
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 p-3 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 flex items-center justify-center transform rotate-3 shadow-xl">
                        <img 
                            src={LEAGUE_LOGOS[playerLeagueId]} 
                            alt="League" 
                            className="w-full h-full object-contain drop-shadow-lg" 
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">
                            Estadísticas <span className={`text-${themeColor}-400 underline decoration-4 underline-offset-8 transition-colors duration-500`}>Elite</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
                            {LEAGUE_NAMES[selectedLeague]} • Temporada 2024/25
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Scorers Card */}
                <div className={`bg-slate-900/50 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl`}>
                    <div className={`bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-5 border-b border-white/5 flex items-center justify-between`}>
                        <h3 className="text-white font-black text-lg uppercase tracking-wider italic flex items-center gap-3">
                            <span className="text-2xl">⚽</span> Goleadores
                        </h3>
                    </div>
                    <div className="p-2">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                    <th className="px-6 py-4 text-left">Jugador</th>
                                    <th className="px-6 py-4 text-center">Club</th>
                                    <th className="px-6 py-4 text-right">Goles</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {topScorers.length > 0 ? topScorers.map((stat, idx) => (
                                    <tr key={stat.player.id} className="group hover:bg-white/5 transition-all duration-300">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <span className={`text-lg font-black ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-slate-600'}`}>
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-sky-400 transition-colors">{stat.player.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-black uppercase">{stat.player.position}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center group-hover:scale-110 transition-transform">
                                                <div className="w-8 h-8">
                                                    <TeamLogo team={{ logo: stat.teamLogo, name: stat.teamName }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-2xl text-white italic">{stat.goals}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-bold italic">No hay datos registrados</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Team Performance Card */}
                <div className="space-y-6">
                    <div className={`bg-gradient-to-br from-slate-900 to-slate-800 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[40px] rounded-full`}></div>
                        <h3 className="text-white font-black text-xl uppercase italic mb-8 flex items-center gap-3">
                            <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                            Potencia Ofensiva
                        </h3>
                        {(() => {
                            const currentTable = gameState.leagueTables[selectedLeague] || [];
                            const bestAttack = [...currentTable].sort((a, b) => b.goalsFor - a.goalsFor)[0];
                            const team = gameState.allTeams.find(t => t.id === bestAttack?.teamId);
                            return team ? (
                                <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                                    <div className="w-16 h-16 group-hover:scale-110 transition-transform">
                                        <TeamLogo team={team} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-green-400 uppercase tracking-widest mb-1">Más Goles Anotados</div>
                                        <div className="text-2xl font-black text-white">{team.name}</div>
                                        <div className="text-3xl font-black text-green-400 italic">{bestAttack.goalsFor} <span className="text-sm font-bold uppercase tracking-normal">Goles</span></div>
                                    </div>
                                </div>
                            ) : null;
                        })()}
                    </div>

                    <div className={`bg-gradient-to-br from-slate-900 to-slate-800 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full`}></div>
                        <h3 className="text-white font-black text-xl uppercase italic mb-8 flex items-center gap-3">
                            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                            Muro Defensivo
                        </h3>
                        {(() => {
                            const currentTable = gameState.leagueTables[selectedLeague] || [];
                            const bestDefense = [...currentTable].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0];
                            const team = gameState.allTeams.find(t => t.id === bestDefense?.teamId);
                            return team ? (
                                <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                                    <div className="w-16 h-16 group-hover:scale-110 transition-transform">
                                        <TeamLogo team={team} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Menos Goles Recibidos</div>
                                        <div className="text-2xl font-black text-white">{team.name}</div>
                                        <div className="text-3xl font-black text-blue-400 italic">{bestDefense.goalsAgainst} <span className="text-sm font-bold uppercase tracking-normal">Goles</span></div>
                                    </div>
                                </div>
                            ) : null;
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};
