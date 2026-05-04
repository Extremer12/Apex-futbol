import React, { useState, useMemo } from 'react';
import { GameState, CupCompetition, LeagueTableRow, LeagueId } from '../../types';
import { LEAGUE_COUNTRY, CountryCode } from '../../types';
import { TeamForm } from '../ui/TeamForm';
import { TrophyIcon } from '../icons';
import { TeamLogo } from '../../data/teams/helpers';

interface LeagueScreenProps {
    gameState: GameState;
}

type Tab = 'LOCAL_LEAGUE_1' | 'LOCAL_LEAGUE_2' | 'LOCAL_CUP_1' | 'LOCAL_CUP_2' | 'LOCAL_CUP' | 'WORLD' | 'CHAMPIONS_LEAGUE' | 'EUROPA_LEAGUE' | 'COPA_LIBERTADORES' | 'COPA_INTERCONTINENTAL';
type WorldTab = 'PREMIER_LEAGUE' | 'CHAMPIONSHIP' | 'LA_LIGA' | 'BUNDESLIGA' | 'SERIE_A' | 'LIGUE_1' | 'LIGA_ARGENTINA' | 'BRASILEIRAO' | null;

export const LeagueScreen: React.FC<LeagueScreenProps> = ({ gameState }) => {
    const playerTeamLeague = gameState.team.leagueId;
    const playerCountry = LEAGUE_COUNTRY[playerTeamLeague];

    const [activeTab, setActiveTab] = useState<Tab>('LOCAL_LEAGUE_1');
    const [worldLeagueSelected, setWorldLeagueSelected] = useState<WorldTab>(null);
    const [worldSearch, setWorldSearch] = useState('');
    const [cupTab, setCupTab] = useState<'ROUNDS' | 'STATS'>('ROUNDS');

    const LEAGUE_THEMES: Record<string, string> = {
        PREMIER_LEAGUE: 'purple',
        CHAMPIONSHIP: 'sky',
        LA_LIGA: 'orange',
        SEGUNDA_DIVISION_ESP: 'orange',
        BUNDESLIGA: 'red',
        ZWEITE_BUNDESLIGA: 'red',
        SERIE_A: 'emerald',
        SERIE_B_ITA: 'emerald',
        LIGUE_1: 'blue',
        LIGUE_2: 'blue',
        LIGA_ARGENTINA: 'cyan',
        PRIMERA_NACIONAL: 'cyan',
        BRASILEIRAO: 'green',
        SERIE_B_BR: 'green',
    };

    const LEAGUE_LOGOS: Record<string, string> = {
        PREMIER_LEAGUE: '/logos/Premier League.png',
        CHAMPIONSHIP: '/logos/Sky Bet Championship.png',
        LA_LIGA: 'https://tmssl.akamaized.net/images/logo/header/es1.png',
        BUNDESLIGA: 'https://tmssl.akamaized.net/images/logo/header/l1.png',
        SERIE_A: 'https://tmssl.akamaized.net/images/logo/header/it1.png',
        LIGUE_1: 'https://tmssl.akamaized.net/images/logo/header/fr1.png',
        LIGUE_2: 'https://tmssl.akamaized.net/images/logo/header/fr2.png',
        LIGA_ARGENTINA: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Liga_Profesional_de_F%C3%BAtbol_logo.svg/200px-Liga_Profesional_de_F%C3%BAtbol_logo.svg.png',
        PRIMERA_NACIONAL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Primera_Nacional_logo.png/200px-Primera_Nacional_logo.png',
        BRASILEIRAO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Brasileirao_Serie_A_logo.png/200px-Brasileirao_Serie_A_logo.png',
        SERIE_B_BR: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Brasileir%C3%A3o_S%C3%A9rie_B_logo.png/200px-Brasileir%C3%A3o_S%C3%A9rie_B_logo.png',
    };

    const CUP_LOGOS: Record<string, string> = {
        champions_league: 'https://tmssl.akamaized.net/images/logo/header/cl.png',
        copa_libertadores: 'https://tmssl.akamaized.net/images/logo/header/cli.png',
        copa_intercontinental: 'https://tmssl.akamaized.net/images/logo/header/cwc.png',
        fa_cup: '/logos/The Emirates FA Cup.png',
        carabao_cup: '/logos/carabao_cup_logo.png',
    };

    const CUP_THEMES: Record<string, { accent: string; bg: string; border: string }> = {
        champions_league: { accent: 'text-indigo-400', bg: 'from-indigo-950 via-slate-950 to-slate-950', border: 'border-indigo-500/40' },
        copa_libertadores: { accent: 'text-amber-400', bg: 'from-amber-950 via-slate-950 to-slate-950', border: 'border-amber-500/40' },
        copa_intercontinental: { accent: 'text-emerald-400', bg: 'from-emerald-950 via-slate-950 to-slate-950', border: 'border-emerald-500/40' },
        fa_cup: { accent: 'text-red-400', bg: 'from-red-950 via-slate-950 to-slate-950', border: 'border-red-500/40' },
        carabao_cup: { accent: 'text-green-400', bg: 'from-green-950 via-slate-950 to-slate-950', border: 'border-green-500/40' },
    };

    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);

    const getLeagueIdFromTitle = (title: string): LeagueId => {
        if (title.includes('Premier')) return LeagueId.PREMIER_LEAGUE;
        if (title.includes('Championship')) return LeagueId.CHAMPIONSHIP;
        if (title === 'La Liga') return LeagueId.LA_LIGA;
        if (title.includes('Bundesliga')) return LeagueId.BUNDESLIGA;
        if (title === 'Serie A') return LeagueId.SERIE_A;
        if (title.includes('Ligue 1')) return LeagueId.LIGUE_1;
        if (title.includes('Ligue 2')) return LeagueId.LIGUE_2;
        if (title.includes('Liga Argentina') || title.includes('Liga Prof')) return LeagueId.LIGA_ARGENTINA;
        if (title.includes('Primera Nacional')) return LeagueId.PRIMERA_NACIONAL;
        if (title.includes('Brasileirao') || title.includes('Brasileirão')) return LeagueId.BRASILEIRAO;
        if (title.includes('Série B BR') || title.includes('Serie B BR')) return LeagueId.SERIE_B_BR;
        return LeagueId.PREMIER_LEAGUE;
    };

    const renderLeagueTable = (table: LeagueTableRow[], title: string, logoPath: string, isFirstDiv: boolean, leagueIdOverride?: string) => {
        const leagueId = leagueIdOverride || getLeagueIdFromTitle(title);
        const theme = LEAGUE_THEMES[leagueId] || 'purple';

        return (
            <div className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-${theme}-500/30 rounded-2xl shadow-2xl overflow-hidden animate-fade-in`}>
                <div className={`bg-gradient-to-r from-${theme}-600 via-${theme}-500 to-${theme}-600 px-6 py-4 flex items-center gap-4`}>
                    <div className="w-10 h-10 p-1 bg-white/10 rounded-lg flex items-center justify-center">
                        <img src={logoPath} alt={title} className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                    <h3 className="text-white font-bold text-lg uppercase tracking-wider">{title}</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-white/5`}>
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
                        <tbody className="divide-y divide-white/5">
                            {table.map((row) => {
                                const team = getTeamById(row.teamId);
                                const isPlayerTeam = team?.id === gameState.team.id;

                                let zoneColor = '';
                                let zoneLabel = '';
                                if (isFirstDiv) {
                                    if (row.position <= 4) { zoneColor = 'bg-purple-500'; zoneLabel = 'Champions League'; }
                                    else if (row.position === 5) { zoneColor = 'bg-orange-500'; zoneLabel = 'Europa League'; }
                                    else if (row.position >= table.length - 2) { zoneColor = 'bg-red-500'; zoneLabel = 'Descenso'; }
                                } else {
                                    if (row.position <= 2) { zoneColor = 'bg-green-500'; zoneLabel = 'Ascenso Directo'; }
                                    else if (row.position >= 3 && row.position <= 6) { zoneColor = 'bg-blue-500'; zoneLabel = 'Play-offs'; }
                                    else if (row.position >= table.length - 2) { zoneColor = 'bg-red-500'; zoneLabel = 'Descenso'; }
                                }

                                return (
                                    <tr
                                        key={row.teamId}
                                        className={`transition-all duration-200 ${isPlayerTeam ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                    >
                                        <td className="px-4 py-4 text-center relative">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className={`font-bold ${isPlayerTeam ? 'text-white' : 'text-slate-400'}`}>
                                                    {row.position}
                                                </span>
                                                {zoneColor && (
                                                    <div className={`w-1 h-6 ${zoneColor} rounded-full absolute left-2`} title={zoneLabel}></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center">
                                                    <TeamLogo team={team} />
                                                </div>
                                                <span className={`font-bold ${isPlayerTeam ? 'text-white' : 'text-slate-200'}`}>
                                                    {team?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.played}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.won}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.drawn}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.lost}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-center">
                                                <TeamForm form={row.form} />
                                            </div>
                                        </td>
                                        <td className={`px-3 py-4 text-center font-bold ${row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                        </td>
                                        <td className="px-4 py-4 text-center font-black text-white">{row.points}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderEuropeanTable = (table: any[], title: string, logoUrl: string, theme: string) => {
        return (
            <div className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-${theme}-500/30 rounded-2xl shadow-2xl overflow-hidden animate-fade-in`}>
                <div className={`bg-gradient-to-r from-${theme}-600 via-${theme}-500 to-${theme}-600 px-6 py-4 flex items-center gap-4`}>
                    <div className="w-10 h-10 p-1 bg-white/10 rounded-lg flex items-center justify-center">
                        {logoUrl ? <img src={logoUrl} alt={title} className="w-full h-full object-contain drop-shadow-md" /> : <TrophyIcon className="w-6 h-6 text-white" />}
                    </div>
                    <h3 className="text-white font-bold text-lg uppercase tracking-wider">{title} (Fase de Liga Suiza)</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-white/5`}>
                                <th className="px-4 py-4 text-center">Pos</th>
                                <th className="px-6 py-4 text-left">Club</th>
                                <th className="px-3 py-4 text-center">PJ</th>
                                <th className="px-3 py-4 text-center">G</th>
                                <th className="px-3 py-4 text-center">E</th>
                                <th className="px-3 py-4 text-center">P</th>
                                <th className="px-3 py-4 text-center">DG</th>
                                <th className="px-4 py-4 text-center">Pts</th>
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
                                    <tr key={row.teamId} className={`transition-all duration-200 ${isPlayerTeam ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                                        <td className="px-4 py-4 text-center relative">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className={`font-bold ${isPlayerTeam ? 'text-white' : 'text-slate-400'}`}>{pos}</span>
                                                {zoneColor && <div className={`w-1 h-6 ${zoneColor} rounded-full absolute left-2`} title={zoneLabel}></div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center"><TeamLogo team={team} /></div>
                                                <span className={`font-bold ${isPlayerTeam ? 'text-white' : 'text-slate-200'}`}>{team?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.played}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.won}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.drawn}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.lost}</td>
                                        <td className={`px-3 py-4 text-center font-bold ${row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                        </td>
                                        <td className="px-4 py-4 text-center font-black text-white">{row.points}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderCupView = (cup: CupCompetition) => {
        const theme = CUP_THEMES[cup.id] || CUP_THEMES.fa_cup;
        const logo = CUP_LOGOS[cup.id] || '';

        // If it's Champions League in Swiss phase
        if (cup.type === 'swiss' && cup.phase === 'swiss' && cup.swissTable) {
            return renderEuropeanTable(cup.swissTable, cup.name, logo, cup.id === 'champions_league' ? 'indigo' : 'slate');
        }

        // If it's Libertadores in Groups phase
        if (cup.type === 'groups' && cup.phase === 'groups' && cup.groups) {
            return (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cup.groups.map((group, idx) => (
                            <div key={idx} className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                                <div className="bg-amber-600/20 px-4 py-3 border-b border-amber-500/30 flex justify-between items-center">
                                    <h4 className="text-amber-400 font-black text-sm uppercase tracking-tighter">{group.name}</h4>
                                    <span className="text-[10px] font-bold text-amber-500/50 uppercase">Libertadores</span>
                                </div>
                                <table className="w-full text-[11px]">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-white/5">
                                            <th className="px-3 py-2 text-left">Club</th>
                                            <th className="px-2 py-2 text-center">PJ</th>
                                            <th className="px-2 py-2 text-center">Pts</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.table.sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference).map((row, rIdx) => {
                                            const team = getTeamById(row.teamId);
                                            const isPlayer = team?.id === gameState.team.id;
                                            return (
                                                <tr key={rIdx} className={isPlayer ? 'bg-amber-500/10' : ''}>
                                                    <td className="px-3 py-2 flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-500 w-3">{rIdx + 1}</span>
                                                        <span className={`font-bold ${isPlayer ? 'text-white' : 'text-slate-300'}`}>{team?.name}</span>
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-slate-400">{row.played}</td>
                                                    <td className="px-2 py-2 text-center font-black text-white">{row.points}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        const currentRound = cup.rounds[cup.currentRoundIndex];
        const fixtures = currentRound?.fixtures || [];
        const isFinished = !!cup.winnerId;
        const winner = cup.winnerId ? getTeamById(cup.winnerId) : null;

        return (
            <div className={`bg-gradient-to-br ${theme.bg} border-2 ${theme.border} rounded-3xl shadow-2xl overflow-hidden animate-fade-in`}>
                {/* Header */}
                <div className="relative px-6 py-8 border-b border-white/5 overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)' , backgroundSize: '20px 20px' }} />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 p-2 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center shadow-xl backdrop-blur-sm">
                                {logo ? (
                                    <img src={logo} alt={cup.name} className="w-full h-full object-contain drop-shadow-lg" />
                                ) : (
                                    <TrophyIcon className={`w-10 h-10 ${theme.accent}`} />
                                )}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">{cup.name}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`font-bold uppercase tracking-widest text-xs ${theme.accent}`}>Torneo Eliminatorio</span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-slate-400 text-sm font-medium">{currentRound?.name || 'Finalizada'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 bg-black/30 p-1 rounded-xl">
                            <button onClick={() => setCupTab('ROUNDS')} className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${cupTab === 'ROUNDS' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'}`}>Llaves</button>
                            <button onClick={() => setCupTab('STATS')} className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${cupTab === 'STATS' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'}`}>Historial</button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {cupTab === 'ROUNDS' ? (
                        <div className="space-y-4">
                            {isFinished && winner && (
                                <div className={`flex items-center gap-4 p-5 rounded-2xl border ${theme.border} bg-white/5 mb-6`}>
                                    <div className="w-12 h-12"><TrophyIcon className={`w-full h-full ${theme.accent}`} /></div>
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Campeón</p>
                                        <p className="text-white font-black text-2xl">{winner.name}</p>
                                    </div>
                                </div>
                            )}
                            {!currentRound && !isFinished && (
                                <div className="text-center py-16 text-slate-500">
                                    <TrophyIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold uppercase tracking-widest">La competición no ha comenzado</p>
                                </div>
                            )}
                            {/* Bracket-style fixtures */}
                            {currentRound && (
                                <>
                                    <h3 className={`text-xs font-black uppercase tracking-[0.25em] mb-4 ${theme.accent}`}>{currentRound.name}</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        {fixtures.map((fixture, idx) => {
                                            const home = getTeamById(fixture.homeTeamId);
                                            const away = getTeamById(fixture.awayTeamId);
                                            const isPlayerMatch = home?.id === gameState.team.id || away?.id === gameState.team.id;
                                            const homeWon = fixture.result && fixture.result.homeScore > fixture.result.awayScore;
                                            const awayWon = fixture.result && fixture.result.awayScore > fixture.result.homeScore;
                                            return (
                                                <div key={idx} className={`rounded-2xl border overflow-hidden transition-all ${isPlayerMatch ? `${theme.border} bg-white/5` : 'border-white/5 bg-slate-900/40'}`}>
                                                    {/* Home row */}
                                                    <div className={`flex items-center justify-between px-4 py-3 border-b border-white/5 ${homeWon ? 'bg-white/10' : ''}`}>
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="w-8 h-8 shrink-0"><TeamLogo team={home} /></div>
                                                            <span className={`font-bold text-sm truncate ${isPlayerMatch && home?.id === gameState.team.id ? theme.accent : homeWon ? 'text-white' : 'text-slate-300'}`}>{home?.name}</span>
                                                        </div>
                                                        <span className={`font-black text-lg w-8 text-center ${homeWon ? 'text-white' : 'text-slate-500'}`}>{fixture.result ? fixture.result.homeScore : '-'}</span>
                                                    </div>
                                                    {/* Away row */}
                                                    <div className={`flex items-center justify-between px-4 py-3 ${awayWon ? 'bg-white/10' : ''}`}>
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="w-8 h-8 shrink-0"><TeamLogo team={away} /></div>
                                                            <span className={`font-bold text-sm truncate ${isPlayerMatch && away?.id === gameState.team.id ? theme.accent : awayWon ? 'text-white' : 'text-slate-300'}`}>{away?.name}</span>
                                                        </div>
                                                        <span className={`font-black text-lg w-8 text-center ${awayWon ? 'text-white' : 'text-slate-500'}`}>{fixture.result ? fixture.result.awayScore : '-'}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cup.statistics.championsHistory.length === 0 ? (
                                <p className="text-center text-slate-600 py-8 text-sm font-bold uppercase tracking-widest">Sin historial todavía</p>
                            ) : cup.statistics.championsHistory.map((c, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/5">
                                    <span className="text-slate-500 font-bold text-sm">{c.season}</span>
                                    <span className="font-black text-white">{c.winnerName}</span>
                                    <TrophyIcon className={`w-5 h-5 ${theme.accent}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderWorldView = () => {
        if (!worldLeagueSelected) {
            const allLeagues = [
                { id: LeagueId.PREMIER_LEAGUE, name: 'Premier League', logo: LEAGUE_LOGOS.PREMIER_LEAGUE, country: 'Inglaterra', theme: 'purple', flagUrl: 'https://flagcdn.com/gb-eng.svg' },
                { id: LeagueId.CHAMPIONSHIP, name: 'Championship', logo: LEAGUE_LOGOS.CHAMPIONSHIP, country: 'Inglaterra', theme: 'sky', flagUrl: 'https://flagcdn.com/gb-eng.svg' },
                { id: LeagueId.LA_LIGA, name: 'La Liga', logo: LEAGUE_LOGOS.LA_LIGA, country: 'España', theme: 'orange', flagUrl: 'https://flagcdn.com/es.svg' },
                { id: LeagueId.BUNDESLIGA, name: 'Bundesliga', logo: LEAGUE_LOGOS.BUNDESLIGA, country: 'Alemania', theme: 'red', flagUrl: 'https://flagcdn.com/de.svg' },
                { id: LeagueId.SERIE_A, name: 'Serie A', logo: LEAGUE_LOGOS.SERIE_A, country: 'Italia', theme: 'emerald', flagUrl: 'https://flagcdn.com/it.svg' },
                { id: LeagueId.LIGUE_1, name: 'Ligue 1', logo: LEAGUE_LOGOS.LIGUE_1, country: 'Francia', theme: 'blue', flagUrl: 'https://flagcdn.com/fr.svg' },
                { id: LeagueId.LIGA_ARGENTINA, name: 'Liga Argentina', logo: LEAGUE_LOGOS.LIGA_ARGENTINA, country: 'Argentina', theme: 'cyan', flagUrl: 'https://flagcdn.com/ar.svg' },
                { id: LeagueId.BRASILEIRAO, name: 'Brasileirão', logo: LEAGUE_LOGOS.BRASILEIRAO, country: 'Brasil', theme: 'green', flagUrl: 'https://flagcdn.com/br.svg' },
            ].filter(l => l.id !== playerTeamLeague);

            const filteredLeagues = allLeagues.filter(l => 
                l.name.toLowerCase().includes(worldSearch.toLowerCase()) || 
                l.country.toLowerCase().includes(worldSearch.toLowerCase())
            );

            return (
                <div className="space-y-6 animate-fade-in">
                    {/* Search Header */}
                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Explorador Global
                            </h2>
                            <p className="text-slate-400 text-sm font-medium mt-1">Busca y analiza las clasificaciones de otras ligas.</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <input 
                                type="text" 
                                placeholder="Buscar país o competición..."
                                value={worldSearch}
                                onChange={e => setWorldSearch(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>

                    {/* League List */}
                    <div className="bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden">
                        {filteredLeagues.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {filteredLeagues.map((l) => (
                                    <button
                                        key={l.id}
                                        onClick={() => setWorldLeagueSelected(l.id as WorldTab)}
                                        className={`w-full group relative flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-all duration-300 text-left`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 overflow-hidden p-1.5">
                                                <img src={l.flagUrl} alt={l.country} className="w-full h-full object-contain drop-shadow-md" />
                                            </div>
                                            <div className={`w-12 h-12 p-1 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-${l.theme}-500/10 group-hover:border-${l.theme}-500/30 transition-all`}>
                                                <img src={l.logo} alt={l.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-wider">{l.name}</h3>
                                                <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">{l.country}</span>
                                            </div>
                                        </div>
                                        <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/50 border border-white/5 text-slate-400 text-xs font-black uppercase tracking-widest group-hover:bg-${l.theme}-500/20 group-hover:text-${l.theme}-400 group-hover:border-${l.theme}-500/30 transition-all`}>
                                            Ver Tabla
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <span className="text-4xl mb-4 block">🔍</span>
                                <h3 className="text-xl font-black text-white uppercase">Sin Resultados</h3>
                                <p className="text-slate-500 mt-2">No se encontraron ligas que coincidan con tu búsqueda.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-fade-in">
                <button
                    onClick={() => setWorldLeagueSelected(null)}
                    className="group flex items-center gap-3 text-slate-500 hover:text-white transition-all"
                >
                    <div className="p-2 rounded-xl border border-slate-800 group-hover:bg-white/5 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-widest uppercase text-[10px]">Volver al Mundo</span>
                </button>

                {worldLeagueSelected === 'PREMIER_LEAGUE' && renderLeagueTable(gameState.leagueTables.PREMIER_LEAGUE, 'Premier League', LEAGUE_LOGOS.PREMIER_LEAGUE, true)}
                {worldLeagueSelected === 'CHAMPIONSHIP' && renderLeagueTable(gameState.leagueTables.CHAMPIONSHIP, 'Championship', LEAGUE_LOGOS.CHAMPIONSHIP, false)}
                {worldLeagueSelected === 'LA_LIGA' && renderLeagueTable(gameState.leagueTables.LA_LIGA, 'La Liga', LEAGUE_LOGOS.LA_LIGA, true)}
                {worldLeagueSelected === 'BUNDESLIGA' && renderLeagueTable(gameState.leagueTables.BUNDESLIGA, 'Bundesliga', LEAGUE_LOGOS.BUNDESLIGA, true)}
                {worldLeagueSelected === 'SERIE_A' && renderLeagueTable(gameState.leagueTables.SERIE_A, 'Serie A', LEAGUE_LOGOS.SERIE_A, true)}
                {worldLeagueSelected === 'LIGUE_1' && renderLeagueTable(gameState.leagueTables.LIGUE_1, 'Ligue 1', LEAGUE_LOGOS.LIGUE_1, true)}
                {worldLeagueSelected === 'LIGA_ARGENTINA' && renderLeagueTable(gameState.leagueTables.LIGA_ARGENTINA, 'Liga Argentina', LEAGUE_LOGOS.LIGA_ARGENTINA, true)}
                {worldLeagueSelected === 'BRASILEIRAO' && renderLeagueTable(gameState.leagueTables.BRASILEIRAO, 'Brasileirão', LEAGUE_LOGOS.BRASILEIRAO, true)}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 bg-slate-900/40 p-1.5 rounded-2xl backdrop-blur-md border border-white/5">
                {playerCountry === 'ENG' && (
                    <>
                        <button
                            onClick={() => { setActiveTab('LOCAL_LEAGUE_1'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_1' ? 'bg-purple-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Premier League
                        </button>
                        <button
                            onClick={() => { setActiveTab('LOCAL_LEAGUE_2'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_2' ? 'bg-sky-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Championship
                        </button>
                        <button
                            onClick={() => { setActiveTab('LOCAL_CUP_1'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_CUP_1' ? 'bg-amber-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            FA Cup
                        </button>
                        <button
                            onClick={() => { setActiveTab('LOCAL_CUP_2'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_CUP_2' ? 'bg-emerald-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Carabao Cup
                        </button>
                    </>
                )}

                {playerCountry === 'ESP' && (
                    <>
                        <button
                            onClick={() => { setActiveTab('LOCAL_LEAGUE_1'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_1' ? 'bg-orange-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            La Liga
                        </button>
                        <button
                            onClick={() => { setActiveTab('LOCAL_CUP'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_CUP' ? 'bg-amber-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Copa del Rey
                        </button>
                    </>
                )}

                {playerCountry === 'GER' && (
                    <>
                        <button
                            onClick={() => { setActiveTab('LOCAL_LEAGUE_1'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_1' ? 'bg-red-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Bundesliga
                        </button>
                        <button
                            onClick={() => { setActiveTab('LOCAL_CUP'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_CUP' ? 'bg-amber-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            DFB-Pokal
                        </button>
                    </>
                )}

                {playerCountry === 'FRA' && (
                    <>
                        <button
                            onClick={() => { setActiveTab('LOCAL_LEAGUE_1'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_1' ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Ligue 1
                        </button>
                        <button
                            onClick={() => { setActiveTab('LOCAL_LEAGUE_2'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_2' ? 'bg-blue-700 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Ligue 2
                        </button>
                    </>
                )}

                {playerCountry === 'ARG' && (
                    <>
                        <button
                            onClick={() => { setActiveTab('LOCAL_LEAGUE_1'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_1' ? 'bg-cyan-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Liga Argentina
                        </button>
                        <button
                            onClick={() => { setActiveTab('LOCAL_LEAGUE_2'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_2' ? 'bg-cyan-700 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Primera Nacional
                        </button>
                    </>
                )}

                {playerCountry === 'BRA' && (
                    <>
                        <button
                            onClick={() => { setActiveTab('LOCAL_LEAGUE_1'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_1' ? 'bg-green-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Brasileirão
                        </button>
                        <button
                            onClick={() => { setActiveTab('LOCAL_LEAGUE_2'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_2' ? 'bg-green-700 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Série B
                        </button>
                    </>
                )}

                {playerCountry === 'ITA' && (
                    <>
                        <button
                            onClick={() => { setActiveTab('LOCAL_LEAGUE_1'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_1' ? 'bg-emerald-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Serie A
                        </button>
                        <button
                            onClick={() => { setActiveTab('LOCAL_CUP'); setWorldLeagueSelected(null); }}
                            className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_CUP' ? 'bg-amber-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Coppa Italia
                        </button>
                    </>
                )}

                <button
                    onClick={() => setActiveTab('CHAMPIONS_LEAGUE')}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'CHAMPIONS_LEAGUE' ? 'bg-indigo-900 text-white shadow-xl scale-[1.02] border border-indigo-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    Champions
                </button>

                <button
                    onClick={() => setActiveTab('COPA_LIBERTADORES')}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'COPA_LIBERTADORES' ? 'bg-amber-600 text-white shadow-xl scale-[1.02] border border-amber-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    Libertadores
                </button>

                <button
                    onClick={() => setActiveTab('COPA_INTERCONTINENTAL')}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'COPA_INTERCONTINENTAL' ? 'bg-slate-700 text-white shadow-xl scale-[1.02] border border-slate-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    Intercontinental
                </button>

                <button
                    onClick={() => setActiveTab('WORLD')}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'WORLD' ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    🌍 Mundo
                </button>
            </div>

            <div className="min-h-[600px]">
                {activeTab === 'LOCAL_LEAGUE_1' && playerCountry === 'ENG' && renderLeagueTable(gameState.leagueTables.PREMIER_LEAGUE, 'Premier League', LEAGUE_LOGOS.PREMIER_LEAGUE, true)}
                {activeTab === 'LOCAL_LEAGUE_2' && playerCountry === 'ENG' && renderLeagueTable(gameState.leagueTables.CHAMPIONSHIP, 'Championship', LEAGUE_LOGOS.CHAMPIONSHIP, false)}
                {activeTab === 'LOCAL_CUP_1' && playerCountry === 'ENG' && renderCupView(gameState.cups.faCup)}
                {activeTab === 'LOCAL_CUP_2' && playerCountry === 'ENG' && renderCupView(gameState.cups.carabaoCup)}

                {activeTab === 'LOCAL_LEAGUE_1' && playerCountry === 'ESP' && renderLeagueTable(gameState.leagueTables.LA_LIGA, 'La Liga', LEAGUE_LOGOS.LA_LIGA, true, 'LA_LIGA')}
                {activeTab === 'LOCAL_CUP' && playerCountry === 'ESP' && renderCupView(gameState.cups.copaDelRey)}

                {activeTab === 'LOCAL_LEAGUE_1' && playerCountry === 'GER' && renderLeagueTable(gameState.leagueTables.BUNDESLIGA, 'Bundesliga', LEAGUE_LOGOS.BUNDESLIGA, true, 'BUNDESLIGA')}
                {activeTab === 'LOCAL_CUP' && playerCountry === 'GER' && renderCupView(gameState.cups.dfbPokal)}

                {activeTab === 'LOCAL_LEAGUE_1' && playerCountry === 'ITA' && renderLeagueTable(gameState.leagueTables.SERIE_A, 'Serie A', LEAGUE_LOGOS.SERIE_A, true, 'SERIE_A')}
                {activeTab === 'LOCAL_CUP' && playerCountry === 'ITA' && renderCupView(gameState.cups.coppaItalia)}

                {activeTab === 'LOCAL_LEAGUE_1' && playerCountry === 'FRA' && renderLeagueTable(gameState.leagueTables.LIGUE_1, 'Ligue 1', LEAGUE_LOGOS.LIGUE_1, true, 'LIGUE_1')}
                {activeTab === 'LOCAL_LEAGUE_2' && playerCountry === 'FRA' && renderLeagueTable(gameState.leagueTables.LIGUE_2, 'Ligue 2', LEAGUE_LOGOS.LIGUE_1, false, 'LIGUE_2')}

                {activeTab === 'LOCAL_LEAGUE_1' && playerCountry === 'ARG' && renderLeagueTable(gameState.leagueTables.LIGA_ARGENTINA, 'Liga Argentina', LEAGUE_LOGOS.LIGA_ARGENTINA, true, 'LIGA_ARGENTINA')}
                {activeTab === 'LOCAL_LEAGUE_2' && playerCountry === 'ARG' && renderLeagueTable(gameState.leagueTables.PRIMERA_NACIONAL, 'Primera Nacional', LEAGUE_LOGOS.LIGA_ARGENTINA, false, 'PRIMERA_NACIONAL')}

                {activeTab === 'LOCAL_LEAGUE_1' && playerCountry === 'BRA' && renderLeagueTable(gameState.leagueTables.BRASILEIRAO, 'Brasileirão', LEAGUE_LOGOS.BRASILEIRAO, true, 'BRASILEIRAO')}
                {activeTab === 'LOCAL_LEAGUE_2' && playerCountry === 'BRA' && renderLeagueTable(gameState.leagueTables.SERIE_B_BR, 'Série B BR', LEAGUE_LOGOS.BRASILEIRAO, false, 'SERIE_B_BR')}

                {activeTab === 'CHAMPIONS_LEAGUE' && gameState.cups.championsLeague && renderCupView(gameState.cups.championsLeague)}
                {activeTab === 'COPA_LIBERTADORES' && gameState.cups.copaLibertadores && renderCupView(gameState.cups.copaLibertadores)}
                {activeTab === 'COPA_INTERCONTINENTAL' && gameState.cups.copaIntercontinental && renderCupView(gameState.cups.copaIntercontinental)}

                {activeTab === 'WORLD' && renderWorldView()}
            </div>
        </div>
    );
};
