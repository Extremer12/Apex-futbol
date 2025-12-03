import React, { useState } from 'react';
import { GameState, CupCompetition, LeagueTableRow } from '../../types';
import { TeamForm } from '../ui/TeamForm';
import { TrophyIcon } from '../icons';

interface LeagueScreenProps {
    gameState: GameState;
}

type Tab = 'PREMIER_LEAGUE' | 'CHAMPIONSHIP' | 'FA_CUP' | 'CARABAO_CUP';

export const LeagueScreen: React.FC<LeagueScreenProps> = ({ gameState }) => {
    const [activeTab, setActiveTab] = useState<Tab>('PREMIER_LEAGUE');
    const [cupTab, setCupTab] = useState<'ROUNDS' | 'STATS'>('ROUNDS'); // Add cup tab state here

    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);

    const renderLeagueTable = (table: LeagueTableRow[], title: string, logoPath: string, isPremier: boolean) => (
        <div className="bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-900 border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-6 py-4 flex items-center gap-4">
                {logoPath ? (
                    <img src={logoPath} alt={title} className="w-10 h-10 object-contain drop-shadow-md" />
                ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-600 to-sky-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">CH</span>
                    </div>
                )}
                <h3 className="text-white font-bold text-lg uppercase tracking-wider">{title}</h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 text-purple-200 uppercase text-xs font-semibold border-b-2 border-purple-500/30">
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
                    <tbody className="divide-y divide-purple-500/10">
                        {table.map((row) => {
                            const team = getTeamById(row.teamId);
                            const isPlayerTeam = team?.id === gameState.team.id;

                            // Zones Logic
                            let zoneColor = '';
                            let zoneLabel = '';

                            if (isPremier) {
                                if (row.position <= 4) { zoneColor = 'bg-purple-500'; zoneLabel = 'Champions League'; }
                                else if (row.position === 5) { zoneColor = 'bg-orange-500'; zoneLabel = 'Europa League'; }
                                else if (row.position >= 18) { zoneColor = 'bg-red-500'; zoneLabel = 'Descenso'; }
                            } else {
                                if (row.position <= 2) { zoneColor = 'bg-green-500'; zoneLabel = 'Ascenso Directo'; }
                                else if (row.position >= 3 && row.position <= 6) { zoneColor = 'bg-blue-500'; zoneLabel = 'Play-offs'; }
                                else if (row.position >= 22) { zoneColor = 'bg-red-500'; zoneLabel = 'Descenso'; }
                            }

                            return (
                                <tr
                                    key={row.teamId}
                                    className={`
                                        transition-all duration-200 hover:bg-purple-500/10
                                        ${isPlayerTeam ? 'bg-gradient-to-r from-sky-900/40 to-sky-800/20 border-l-4 border-sky-400' : ''}
                                    `}
                                >
                                    <td className="px-4 py-4 text-center relative">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`font-bold text-base ${isPlayerTeam ? 'text-sky-400' : 'text-slate-300'}`}>
                                                {row.position}
                                            </span>
                                            {zoneColor && (
                                                <div className={`w-1 h-6 ${zoneColor} rounded-full absolute left-2`} title={zoneLabel}></div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="transform hover:scale-110 transition-transform duration-200 w-8 h-8 flex items-center justify-center">
                                                {team?.logo}
                                            </div>
                                            <span className={`font-semibold text-base ${isPlayerTeam ? 'text-sky-300 font-bold' : 'text-white'}`}>
                                                {team?.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 text-center text-slate-300">{row.played}</td>
                                    <td className="px-3 py-4 text-center text-green-400 font-semibold">{row.won}</td>
                                    <td className="px-3 py-4 text-center text-yellow-400 font-semibold">{row.drawn}</td>
                                    <td className="px-3 py-4 text-center text-red-400 font-semibold">{row.lost}</td>
                                    <td className="px-4 py-4 text-center">
                                        <TeamForm form={row.form} />
                                    </td>
                                    <td className={`px-3 py-4 text-center font-semibold ${row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-xl font-bold bg-gradient-to-br from-purple-400 to-purple-200 bg-clip-text text-transparent">
                                            {row.points}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="bg-slate-900/80 px-6 py-3 border-t border-purple-500/20 flex flex-wrap gap-4 text-xs">
                {isPremier ? (
                    <>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div><span className="text-slate-300">Champions League</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span className="text-slate-300">Europa League</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-slate-300">Descenso</span></div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="text-slate-300">Ascenso Directo</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-slate-300">Play-offs</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-slate-300">Descenso</span></div>
                    </>
                )}
            </div>
        </div>
    );

    const renderCupView = (cup: CupCompetition, logoPath: string) => {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {logoPath ? (
                                <img src={logoPath} alt={cup.name} className="w-12 h-12 object-contain drop-shadow-md" />
                            ) : (
                                <TrophyIcon className={`w-12 h-12 ${cup.id === 'fa_cup' ? 'text-yellow-500' : 'text-sky-500'}`} />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-white">{cup.name}</h2>
                                <p className="text-slate-400">Ronda Actual: <span className="text-sky-400 font-semibold">{cup.rounds && cup.rounds[cup.currentRoundIndex] ? cup.rounds[cup.currentRoundIndex].name : 'Finalizada'}</span></p>
                            </div>
                        </div>
                        {cup.winnerId && (
                            <div className="text-right">
                                <p className="text-sm text-slate-400 uppercase tracking-wider">Campeón</p>
                                <p className="text-xl font-bold text-yellow-400">{getTeamById(cup.winnerId)?.name}</p>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg">
                        <button
                            onClick={() => setCupTab('ROUNDS')}
                            className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${cupTab === 'ROUNDS' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Rondas
                        </button>
                        <button
                            onClick={() => setCupTab('STATS')}
                            className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${cupTab === 'STATS' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Estadísticas
                        </button>
                    </div>

                    {/* Rounds View */}
                    {cupTab === 'ROUNDS' && cup.rounds && (
                        <div className="space-y-4">
                            {cup.rounds.slice().reverse().map((round, idx) => (
                                <div key={idx} className="bg-slate-800/50 rounded-lg overflow-hidden">
                                    <div className="bg-slate-800 px-4 py-2 flex justify-between items-center">
                                        <h4 className="font-bold text-slate-300">{round.name}</h4>
                                        {round.completed ? (
                                            <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">Completada</span>
                                        ) : (
                                            <span className="text-xs bg-sky-900/50 text-sky-400 px-2 py-1 rounded">En Curso</span>
                                        )}
                                    </div>
                                    <div className="divide-y divide-slate-700/50">
                                        {round.fixtures.map((match, mIdx) => {
                                            const homeTeam = getTeamById(match.homeTeamId);
                                            const awayTeam = getTeamById(match.awayTeamId);
                                            const isPlayed = match.result !== undefined;
                                            const winnerId = match.result ? (
                                                match.result.homeScore > match.result.awayScore ? match.homeTeamId :
                                                    match.result.awayScore > match.result.homeScore ? match.awayTeamId :
                                                        match.penalties ? (match.penalties.home > match.penalties.away ? match.homeTeamId : match.awayTeamId) : null
                                            ) : null;

                                            return (
                                                <div key={mIdx} className="px-4 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                                                    <div className={`flex items-center gap-3 flex-1 justify-end ${winnerId === match.homeTeamId ? 'font-bold text-white' : 'text-slate-400'}`}>
                                                        <span>{homeTeam?.name}</span>
                                                        <div className="w-6 h-6">{homeTeam?.logo}</div>
                                                    </div>

                                                    <div className="px-4 flex flex-col items-center min-w-[80px]">
                                                        {isPlayed ? (
                                                            <>
                                                                <span className="text-white font-bold text-lg bg-slate-900 px-3 py-1 rounded border border-slate-700">
                                                                    {match.result?.homeScore} - {match.result?.awayScore}
                                                                </span>
                                                                {match.penalties && (
                                                                    <span className="text-[10px] text-slate-500 mt-1">
                                                                        ({match.penalties.home} - {match.penalties.away} pen.)
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-slate-500 text-xs">vs</span>
                                                        )}
                                                    </div>

                                                    <div className={`flex items-center gap-3 flex-1 ${winnerId === match.awayTeamId ? 'font-bold text-white' : 'text-slate-400'}`}>
                                                        <div className="w-6 h-6">{awayTeam?.logo}</div>
                                                        <span>{awayTeam?.name}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Statistics View */}
                    {cupTab === 'STATS' && (
                        <div className="space-y-6">
                            {/* Top Scorers */}
                            <div className="bg-slate-800/50 rounded-lg overflow-hidden">
                                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <span className="text-2xl">⚽</span>
                                        Máximos Goleadores
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {!cup.statistics?.topScorers || cup.statistics.topScorers.length === 0 ? (
                                        <p className="text-slate-500 text-center py-8">No hay goles registrados aún</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {cup.statistics.topScorers
                                                .sort((a, b) => b.goals - a.goals)
                                                .slice(0, 10)
                                                .map((scorer, idx) => (
                                                    <div key={scorer.playerId} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`font-bold text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-slate-400'}`}>
                                                                {idx + 1}
                                                            </span>
                                                            <div>
                                                                <p className="font-semibold text-white">{scorer.playerName}</p>
                                                                <p className="text-xs text-slate-400">{scorer.teamName}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-bold text-sky-400">{scorer.goals}</span>
                                                            <span className="text-slate-500 text-sm">⚽</span>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Champions History */}
                            <div className="bg-slate-800/50 rounded-lg overflow-hidden">
                                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <span className="text-2xl">🏆</span>
                                        Historial de Campeones
                                    </h3>
                                </div>
                                <div className="p-4">
                                    {!cup.statistics?.championsHistory || cup.statistics.championsHistory.length === 0 ? (
                                        <p className="text-slate-500 text-center py-8">No hay campeones registrados aún</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {cup.statistics.championsHistory.map((champion, idx) => (
                                                <div key={`${champion.season}-${champion.winnerId}`} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`font-bold ${idx === 0 ? 'text-yellow-400 text-lg' : 'text-slate-400'}`}>
                                                            {champion.season}
                                                        </span>
                                                        <span className="text-white font-semibold">{champion.winnerName}</span>
                                                    </div>
                                                    {idx === 0 && (
                                                        <span className="text-yellow-400 text-xl">👑</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 bg-slate-900/50 p-1 rounded-xl backdrop-blur-sm border border-slate-800/50">
                <button
                    onClick={() => setActiveTab('PREMIER_LEAGUE')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${activeTab === 'PREMIER_LEAGUE' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    Premier League
                </button>
                <button
                    onClick={() => setActiveTab('CHAMPIONSHIP')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${activeTab === 'CHAMPIONSHIP' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    Championship
                </button>
                <button
                    onClick={() => setActiveTab('FA_CUP')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${activeTab === 'FA_CUP' ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    FA Cup
                </button>
                <button
                    onClick={() => setActiveTab('CARABAO_CUP')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${activeTab === 'CARABAO_CUP' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    Carabao Cup
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'PREMIER_LEAGUE' && renderLeagueTable(gameState.leagueTable, 'Premier League', '/logos/Premier League.png', true)}
                {activeTab === 'CHAMPIONSHIP' && renderLeagueTable(gameState.championshipTable, 'EFL Championship', '/logos/Sky Bet Championship.png', false)}
                {activeTab === 'FA_CUP' && renderCupView(gameState.cups.faCup, '/logos/The Emirates FA Cup.png')}
                {activeTab === 'CARABAO_CUP' && renderCupView(gameState.cups.carabaoCup, '/logos/carabao_cup_logo.png')}
            </div>
        </div>
    );
};
