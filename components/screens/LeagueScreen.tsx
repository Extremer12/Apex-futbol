import React, { useState, useMemo } from 'react';
import { GameState, CupCompetition, LeagueTableRow, LeagueId } from '../../types';
import { LEAGUE_COUNTRY, CountryCode } from '../../types';
import { TeamForm } from '../ui/TeamForm';
import { TrophyIcon } from '../icons';
import { TeamLogo } from '../../data/teams/helpers';

interface LeagueScreenProps {
    gameState: GameState;
}

type Tab = 'LOCAL_LEAGUE_1' | 'LOCAL_LEAGUE_2' | 'LOCAL_CUP_1' | 'LOCAL_CUP_2' | 'WORLD';
type WorldTab = 'PREMIER_LEAGUE' | 'CHAMPIONSHIP' | 'LA_LIGA' | 'BUNDESLIGA' | 'SERIE_A' | null;

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
        BUNDESLIGA: 'red',
        SERIE_A: 'emerald'
    };

    const LEAGUE_LOGOS: Record<string, string> = {
        PREMIER_LEAGUE: '/logos/Premier League.png',
        CHAMPIONSHIP: '/logos/Sky Bet Championship.png',
        LA_LIGA: 'https://tmssl.akamaized.net/images/logo/header/es1.png',
        BUNDESLIGA: 'https://tmssl.akamaized.net/images/logo/header/l1.png',
        SERIE_A: 'https://tmssl.akamaized.net/images/logo/header/it1.png'
    };

    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);

    const getLeagueIdFromTitle = (title: string): LeagueId => {
        if (title.includes('Premier')) return LeagueId.PREMIER_LEAGUE;
        if (title.includes('Championship')) return LeagueId.CHAMPIONSHIP;
        if (title.includes('Liga')) return LeagueId.LA_LIGA;
        if (title.includes('Bundesliga')) return LeagueId.BUNDESLIGA;
        if (title.includes('Serie A')) return LeagueId.SERIE_A;
        return LeagueId.PREMIER_LEAGUE;
    };

    const renderLeagueTable = (table: LeagueTableRow[], title: string, logoPath: string, isFirstDiv: boolean) => {
        const leagueId = getLeagueIdFromTitle(title);
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

    const renderCupView = (cup: CupCompetition, logoPath: string) => (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-8 border-b border-slate-700/50 relative overflow-hidden">
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 p-2 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-xl">
                            <img src={logoPath} alt={cup.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">{cup.name}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-yellow-400 font-bold uppercase tracking-widest text-xs">Torneo Eliminatorio</span>
                                <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                                <span className="text-slate-400 text-sm font-medium">Temporada 2024/25</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 bg-black/20 p-1 rounded-xl">
                        <button 
                            onClick={() => setCupTab('ROUNDS')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${cupTab === 'ROUNDS' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'}`}
                        >
                            Fases
                        </button>
                        <button 
                            onClick={() => setCupTab('STATS')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${cupTab === 'STATS' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'}`}
                        >
                            Goleadores
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {cupTab === 'ROUNDS' ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-wider flex items-center gap-3">
                                <div className="w-2 h-6 bg-yellow-500 rounded-full"></div>
                                {cup.rounds[cup.currentRoundIndex]?.name || 'Finalizada'}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {cup.rounds[cup.currentRoundIndex]?.fixtures.map((fixture, idx) => {
                                const home = getTeamById(fixture.homeTeamId);
                                const away = getTeamById(fixture.awayTeamId);
                                const isPlayerMatch = home?.id === gameState.team.id || away?.id === gameState.team.id;
                                
                                return (
                                    <div 
                                        key={idx} 
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isPlayerMatch ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-slate-800/30 border-white/5'}`}
                                    >
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="w-8 h-8">
                                                <TeamLogo team={home} />
                                            </div>
                                            <span className={`font-bold text-sm truncate ${isPlayerMatch && home?.id === gameState.team.id ? 'text-yellow-400' : 'text-white'}`}>
                                                {home?.name}
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center justify-center px-4">
                                            {fixture.result ? (
                                                <div className="text-lg font-black text-white tabular-nums bg-slate-900 px-3 py-1 rounded-lg border border-white/10">
                                                    {fixture.result.homeScore} - {fixture.result.awayScore}
                                                </div>
                                            ) : (
                                                <div className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-900/50 px-2 py-1 rounded-md border border-white/5">
                                                    VS
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex items-center justify-end gap-3 text-right">
                                            <span className={`font-bold text-sm truncate ${isPlayerMatch && away?.id === gameState.team.id ? 'text-yellow-400' : 'text-white'}`}>
                                                {away?.name}
                                            </span>
                                            <div className="w-8 h-8">
                                                <TeamLogo team={away} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/30">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest bg-slate-800/50">
                                        <th className="px-6 py-4 text-left">Jugador</th>
                                        <th className="px-6 py-4 text-left">Club</th>
                                        <th className="px-6 py-4 text-center">Goles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {cup.statistics.topScorers.slice(0, 10).map((s, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-white">{s.playerName}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6">
                                                        <TeamLogo team={getTeamById(s.teamId)} />
                                                    </div>
                                                    <span className="text-slate-400 font-medium">{s.teamName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-black text-white">{s.goals}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderWorldView = () => {
        if (!worldLeagueSelected) {
            const allLeagues = [
                { id: LeagueId.PREMIER_LEAGUE, name: 'Premier League', logo: LEAGUE_LOGOS.PREMIER_LEAGUE, country: 'Inglaterra', theme: 'purple', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
                { id: LeagueId.CHAMPIONSHIP, name: 'Championship', logo: LEAGUE_LOGOS.CHAMPIONSHIP, country: 'Inglaterra', theme: 'sky', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
                { id: LeagueId.LA_LIGA, name: 'La Liga', logo: LEAGUE_LOGOS.LA_LIGA, country: 'España', theme: 'orange', flag: '🇪🇸' },
                { id: LeagueId.BUNDESLIGA, name: 'Bundesliga', logo: LEAGUE_LOGOS.BUNDESLIGA, country: 'Alemania', theme: 'red', flag: '🇩🇪' },
                { id: LeagueId.SERIE_A, name: 'Serie A', logo: LEAGUE_LOGOS.SERIE_A, country: 'Italia', theme: 'emerald', flag: '🇮🇹' }
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
                                            <div className="text-4xl w-12 text-center drop-shadow-md opacity-60 group-hover:opacity-100 transition-opacity">
                                                {l.flag}
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
                    <button
                        onClick={() => { setActiveTab('LOCAL_LEAGUE_1'); setWorldLeagueSelected(null); }}
                        className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_1' ? 'bg-orange-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        La Liga
                    </button>
                )}

                {playerCountry === 'GER' && (
                    <button
                        onClick={() => { setActiveTab('LOCAL_LEAGUE_1'); setWorldLeagueSelected(null); }}
                        className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_1' ? 'bg-red-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        Bundesliga
                    </button>
                )}

                {playerCountry === 'ITA' && (
                    <button
                        onClick={() => { setActiveTab('LOCAL_LEAGUE_1'); setWorldLeagueSelected(null); }}
                        className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === 'LOCAL_LEAGUE_1' ? 'bg-emerald-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        Serie A
                    </button>
                )}

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
                {activeTab === 'LOCAL_CUP_1' && playerCountry === 'ENG' && renderCupView(gameState.cups.faCup, '/logos/The Emirates FA Cup.png')}
                {activeTab === 'LOCAL_CUP_2' && playerCountry === 'ENG' && renderCupView(gameState.cups.carabaoCup, '/logos/carabao_cup_logo.png')}

                {activeTab === 'LOCAL_LEAGUE_1' && playerCountry === 'ESP' && renderLeagueTable(gameState.leagueTables.LA_LIGA, 'La Liga', LEAGUE_LOGOS.LA_LIGA, true)}
                {activeTab === 'LOCAL_LEAGUE_1' && playerCountry === 'GER' && renderLeagueTable(gameState.leagueTables.BUNDESLIGA, 'Bundesliga', LEAGUE_LOGOS.BUNDESLIGA, true)}
                {activeTab === 'LOCAL_LEAGUE_1' && playerCountry === 'ITA' && renderLeagueTable(gameState.leagueTables.SERIE_A, 'Serie A', LEAGUE_LOGOS.SERIE_A, true)}

                {activeTab === 'WORLD' && renderWorldView()}
            </div>
        </div>
    );
};
