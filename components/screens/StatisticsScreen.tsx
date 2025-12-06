import React, { useMemo } from 'react';
import { GameState, Player } from '../../types';

interface StatisticsScreenProps {
    gameState: GameState;
}

interface PlayerStats {
    player: Player;
    teamId: number;
    teamName: string;
    teamLogo: React.ReactNode;
    goals: number;
    assists: number;
    matches: number;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ gameState }) => {
    // Calculate player statistics from match results
    const playerStats = useMemo(() => {
        const stats: Map<number, PlayerStats> = new Map();

        // Initialize stats for all players
        gameState.allTeams.forEach(team => {
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

        // Count matches played and simulate goals/assists based on player rating
        gameState.schedule.forEach(match => {
            if (match.result) {
                const homeTeam = gameState.allTeams.find(t => t.id === match.homeTeamId);
                const awayTeam = gameState.allTeams.find(t => t.id === match.awayTeamId);

                if (homeTeam && awayTeam) {
                    // Distribute goals among attacking players based on rating
                    const distributeGoals = (team: typeof homeTeam, goals: number) => {
                        const attackers = team.squad.filter(p => p.position === 'DEL' || p.position === 'CEN');
                        const totalRating = attackers.reduce((sum, p) => sum + p.rating, 0);

                        attackers.forEach(player => {
                            const playerStat = stats.get(player.id);
                            if (playerStat) {
                                playerStat.matches++;
                                // Distribute goals proportionally to rating
                                const goalShare = (player.rating / totalRating) * goals;
                                playerStat.goals += Math.round(goalShare * 10) / 10;
                                playerStat.assists += Math.round(goalShare * 0.6 * 10) / 10;
                            }
                        });
                    };

                    distributeGoals(homeTeam, match.result.homeScore);
                    distributeGoals(awayTeam, match.result.awayScore);
                }
            }
        });

        return Array.from(stats.values());
    }, [gameState]);

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

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Premier League Header */}
            <div className="flex items-center gap-4">
                <img
                    src="/logos/Premier League.png"
                    alt="Premier League"
                    className="w-12 h-12 object-contain drop-shadow-lg"
                />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-white bg-clip-text text-transparent">
                    Estadísticas
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Scorers */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20 border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-6 py-4">
                        <h3 className="text-white font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                            ⚽ Máximos Goleadores
                        </h3>
                    </div>
                    <div className="p-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-purple-200 text-xs uppercase border-b border-purple-500/20">
                                    <th className="px-2 py-3 text-center">#</th>
                                    <th className="px-2 py-3 text-left">Jugador</th>
                                    <th className="px-2 py-3 text-center">Equipo</th>
                                    <th className="px-2 py-3 text-center">Goles</th>
                                    <th className="px-2 py-3 text-center">PJ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-500/10">
                                {topScorers.map((stat, index) => (
                                    <tr key={stat.player.id} className="hover:bg-purple-500/10 transition-colors">
                                        <td className="px-2 py-3 text-center">
                                            <span className={`font-bold ${index < 3 ? 'text-yellow-400' : 'text-slate-400'}`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-white">{stat.player.name}</span>
                                                <span className="text-xs text-slate-400">{stat.player.position}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="flex justify-center">
                                                <div className="transform hover:scale-110 transition-transform duration-200">
                                                    {stat.teamLogo}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <span className="text-lg font-bold text-green-400">{Math.round(stat.goals)}</span>
                                        </td>
                                        <td className="px-2 py-3 text-center text-slate-300">{stat.matches}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Assists */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20 border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-6 py-4">
                        <h3 className="text-white font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                            🎯 Máximos Asistentes
                        </h3>
                    </div>
                    <div className="p-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-purple-200 text-xs uppercase border-b border-purple-500/20">
                                    <th className="px-2 py-3 text-center">#</th>
                                    <th className="px-2 py-3 text-left">Jugador</th>
                                    <th className="px-2 py-3 text-center">Equipo</th>
                                    <th className="px-2 py-3 text-center">Asist.</th>
                                    <th className="px-2 py-3 text-center">PJ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-500/10">
                                {topAssists.map((stat, index) => (
                                    <tr key={stat.player.id} className="hover:bg-purple-500/10 transition-colors">
                                        <td className="px-2 py-3 text-center">
                                            <span className={`font-bold ${index < 3 ? 'text-yellow-400' : 'text-slate-400'}`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-white">{stat.player.name}</span>
                                                <span className="text-xs text-slate-400">{stat.player.position}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="flex justify-center">
                                                <div className="transform hover:scale-110 transition-transform duration-200">
                                                    {stat.teamLogo}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <span className="text-lg font-bold text-blue-400">{Math.round(stat.assists)}</span>
                                        </td>
                                        <td className="px-2 py-3 text-center text-slate-300">{stat.matches}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Team Performance Stats */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20 border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-6 py-4">
                    <h3 className="text-white font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                        📊 Rendimiento de Equipos
                    </h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Best Attack */}
                        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/30 rounded-xl p-4">
                            <div className="text-green-400 text-sm font-semibold mb-2">🔥 Mejor Ataque</div>
                            {(() => {
                                const playerLeagueId = gameState.team.leagueId;
                                const currentTable = gameState.leagueTables[playerLeagueId] || [];
                                const bestAttack = [...currentTable].sort((a, b) => b.goalsFor - a.goalsFor)[0];
                                const team = gameState.allTeams.find(t => t.id === bestAttack?.teamId);
                                return team ? (
                                    <div className="flex items-center gap-3">
                                        {team.logo}
                                        <div>
                                            <div className="font-bold text-white">{team.name}</div>
                                            <div className="text-2xl font-black text-green-400">{bestAttack.goalsFor} goles</div>
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </div>

                        {/* Best Defense */}
                        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-xl p-4">
                            <div className="text-blue-400 text-sm font-semibold mb-2">🛡️ Mejor Defensa</div>
                            {(() => {
                                const playerLeagueId = gameState.team.leagueId;
                                const currentTable = gameState.leagueTables[playerLeagueId] || [];
                                const bestDefense = [...currentTable].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0];
                                const team = gameState.allTeams.find(t => t.id === bestDefense?.teamId);
                                return team ? (
                                    <div className="flex items-center gap-3">
                                        {team.logo}
                                        <div>
                                            <div className="font-bold text-white">{team.name}</div>
                                            <div className="text-2xl font-black text-blue-400">{bestDefense.goalsAgainst} goles</div>
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </div>

                        {/* Best Form */}
                        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-xl p-4">
                            <div className="text-purple-400 text-sm font-semibold mb-2">📈 Mejor Forma</div>
                            {(() => {
                                const playerLeagueId = gameState.team.leagueId;
                                const currentTable = gameState.leagueTables[playerLeagueId] || [];
                                const bestForm = [...currentTable].sort((a, b) => {
                                    const aWins = a.form.filter(f => f === 'W').length;
                                    const bWins = b.form.filter(f => f === 'W').length;
                                    return bWins - aWins;
                                })[0];
                                const team = gameState.allTeams.find(t => t.id === bestForm?.teamId);
                                const wins = bestForm?.form.filter(f => f === 'W').length || 0;
                                return team ? (
                                    <div className="flex items-center gap-3">
                                        {team.logo}
                                        <div>
                                            <div className="font-bold text-white">{team.name}</div>
                                            <div className="text-2xl font-black text-purple-400">{wins}/5 victorias</div>
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
