import React, { useState, useMemo } from 'react';
import { GameState, CupCompetition, LeagueTableRow, LeagueId } from '../../types';
import { LEAGUE_COUNTRY, CountryCode } from '../../types';
import { TeamForm } from '../ui/TeamForm';
import { TrophyIcon } from '../icons';
import { TeamLogo } from '../../data/teams/helpers';
import { TournamentBracket } from '../ui/TournamentBracket';

interface LeagueScreenProps {
    gameState: GameState;
}

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
    SEGUNDA_DIVISION_ESP: 'https://tmssl.akamaized.net/images/logo/header/es2.png',
    BUNDESLIGA: 'https://tmssl.akamaized.net/images/logo/header/l1.png',
    ZWEITE_BUNDESLIGA: 'https://tmssl.akamaized.net/images/logo/header/l2.png',
    SERIE_A: 'https://tmssl.akamaized.net/images/logo/header/it1.png',
    SERIE_B_ITA: 'https://tmssl.akamaized.net/images/logo/header/it2.png',
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
    copa_intercontinental: 'https://upload.wikimedia.org/wikipedia/en/5/5b/FIFA_Intercontinental_Cup_%28logo%29.png',
    fa_cup: '/logos/The Emirates FA Cup.png',
    carabao_cup: '/logos/carabao_cup_logo.png',
    copa_del_rey: 'https://tmssl.akamaized.net/images/logo/header/cdr.png',
    dfb_pokal: 'https://tmssl.akamaized.net/images/logo/header/dfb.png',
    coppa_italia: 'https://tmssl.akamaized.net/images/logo/header/cit.png',
};

const CUP_THEMES: Record<string, { accent: string; bg: string; border: string }> = {
    champions_league: { accent: 'text-indigo-400', bg: 'from-indigo-950 via-slate-950 to-slate-950', border: 'border-indigo-500/40' },
    copa_libertadores: { accent: 'text-amber-400', bg: 'from-amber-950 via-slate-950 to-slate-950', border: 'border-amber-500/40' },
    copa_intercontinental: { accent: 'text-emerald-400', bg: 'from-emerald-950 via-slate-950 to-slate-950', border: 'border-emerald-500/40' },
    fa_cup: { accent: 'text-red-400', bg: 'from-red-950 via-slate-950 to-slate-950', border: 'border-red-500/40' },
    carabao_cup: { accent: 'text-green-400', bg: 'from-green-950 via-slate-950 to-slate-950', border: 'border-green-500/40' },
    copa_del_rey: { accent: 'text-amber-500', bg: 'from-amber-950 via-slate-950 to-slate-950', border: 'border-amber-500/40' },
    dfb_pokal: { accent: 'text-yellow-500', bg: 'from-yellow-950 via-slate-950 to-slate-950', border: 'border-yellow-500/40' },
    coppa_italia: { accent: 'text-green-500', bg: 'from-green-950 via-slate-950 to-slate-950', border: 'border-green-500/40' },
};

type CompetitionItem = {
    id: string;
    name: string;
    type: 'LEAGUE' | 'CUP';
    logo: string;
    country?: string;
    flagUrl?: string;
    category: 'INTERNATIONAL' | 'DOMESTIC';
    isFirstDiv?: boolean;
    cupKey?: string; 
};

const ALL_COMPETITIONS: CompetitionItem[] = [
    // Internacionales
    { id: 'CHAMPIONS_LEAGUE', name: 'Champions League', type: 'CUP', logo: CUP_LOGOS.champions_league, category: 'INTERNATIONAL', cupKey: 'championsLeague' },
    { id: 'COPA_LIBERTADORES', name: 'Copa Libertadores', type: 'CUP', logo: CUP_LOGOS.copa_libertadores, category: 'INTERNATIONAL', cupKey: 'copaLibertadores' },
    { id: 'COPA_INTERCONTINENTAL', name: 'Copa Intercontinental', type: 'CUP', logo: CUP_LOGOS.copa_intercontinental, category: 'INTERNATIONAL', cupKey: 'copaIntercontinental' },

    // Inglaterra
    { id: 'PREMIER_LEAGUE', name: 'Premier League', type: 'LEAGUE', logo: LEAGUE_LOGOS.PREMIER_LEAGUE, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'CHAMPIONSHIP', name: 'Championship', type: 'LEAGUE', logo: LEAGUE_LOGOS.CHAMPIONSHIP, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', isFirstDiv: false },
    { id: 'FA_CUP', name: 'FA Cup', type: 'CUP', logo: CUP_LOGOS.fa_cup, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', cupKey: 'faCup' },
    { id: 'CARABAO_CUP', name: 'Carabao Cup', type: 'CUP', logo: CUP_LOGOS.carabao_cup, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', cupKey: 'carabaoCup' },

    // España
    { id: 'LA_LIGA', name: 'La Liga', type: 'LEAGUE', logo: LEAGUE_LOGOS.LA_LIGA, country: 'España', flagUrl: 'https://flagcdn.com/es.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'COPA_DEL_REY', name: 'Copa del Rey', type: 'CUP', logo: CUP_LOGOS.copa_del_rey, country: 'España', flagUrl: 'https://flagcdn.com/es.svg', category: 'DOMESTIC', cupKey: 'copaDelRey' },

    // Alemania
    { id: 'BUNDESLIGA', name: 'Bundesliga', type: 'LEAGUE', logo: LEAGUE_LOGOS.BUNDESLIGA, country: 'Alemania', flagUrl: 'https://flagcdn.com/de.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'DFB_POKAL', name: 'DFB-Pokal', type: 'CUP', logo: CUP_LOGOS.dfb_pokal, country: 'Alemania', flagUrl: 'https://flagcdn.com/de.svg', category: 'DOMESTIC', cupKey: 'dfbPokal' },

    // Italia
    { id: 'SERIE_A', name: 'Serie A', type: 'LEAGUE', logo: LEAGUE_LOGOS.SERIE_A, country: 'Italia', flagUrl: 'https://flagcdn.com/it.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'COPPA_ITALIA', name: 'Coppa Italia', type: 'CUP', logo: CUP_LOGOS.coppa_italia, country: 'Italia', flagUrl: 'https://flagcdn.com/it.svg', category: 'DOMESTIC', cupKey: 'coppaItalia' },

    // Francia
    { id: 'LIGUE_1', name: 'Ligue 1', type: 'LEAGUE', logo: LEAGUE_LOGOS.LIGUE_1, country: 'Francia', flagUrl: 'https://flagcdn.com/fr.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'LIGUE_2', name: 'Ligue 2', type: 'LEAGUE', logo: LEAGUE_LOGOS.LIGUE_2, country: 'Francia', flagUrl: 'https://flagcdn.com/fr.svg', category: 'DOMESTIC', isFirstDiv: false },

    // Argentina
    { id: 'LIGA_ARGENTINA', name: 'Liga Argentina', type: 'LEAGUE', logo: LEAGUE_LOGOS.LIGA_ARGENTINA, country: 'Argentina', flagUrl: 'https://flagcdn.com/ar.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'PRIMERA_NACIONAL', name: 'Primera Nacional', type: 'LEAGUE', logo: LEAGUE_LOGOS.PRIMERA_NACIONAL, country: 'Argentina', flagUrl: 'https://flagcdn.com/ar.svg', category: 'DOMESTIC', isFirstDiv: false },

    // Brasil
    { id: 'BRASILEIRAO', name: 'Brasileirão', type: 'LEAGUE', logo: LEAGUE_LOGOS.BRASILEIRAO, country: 'Brasil', flagUrl: 'https://flagcdn.com/br.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'SERIE_B_BR', name: 'Série B BR', type: 'LEAGUE', logo: LEAGUE_LOGOS.SERIE_B_BR, country: 'Brasil', flagUrl: 'https://flagcdn.com/br.svg', category: 'DOMESTIC', isFirstDiv: false },
];

export const LeagueScreen: React.FC<LeagueScreenProps> = ({ gameState }) => {
    const playerTeamLeague = gameState.team.leagueId;
    
    const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>(playerTeamLeague);
    const [searchQuery, setSearchQuery] = useState('');
    const [cupTab, setCupTab] = useState<'ROUNDS' | 'STATS'>('ROUNDS');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        'INTERNATIONAL': true,
        'Inglaterra': false,
        'España': false,
        'Alemania': false,
        'Italia': false,
        'Francia': false,
        'Argentina': false,
        'Brasil': false
    });
    const contentRef = React.useRef<HTMLDivElement>(null);

    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const renderLeagueTable = (table: LeagueTableRow[] | undefined, title: string, logoPath: string, isFirstDiv: boolean, leagueId: string) => {
        if (!table) return null;
        const theme = LEAGUE_THEMES[leagueId] || 'purple';

        return (
            <div className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-${theme}-500/30 rounded-2xl shadow-2xl overflow-hidden animate-fade-in`}>
                <div className={`bg-gradient-to-r from-${theme}-600 via-${theme}-500 to-${theme}-600 px-6 py-4 flex items-center gap-4`}>
                    <div className="w-10 h-10 p-1 bg-white/10 rounded-lg flex items-center justify-center">
                        {logoPath ? <img src={logoPath} alt={title} className="w-full h-full object-contain drop-shadow-md" /> : <TrophyIcon className="w-6 h-6 text-white" />}
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
                                    <tr key={row.teamId} className={`transition-all duration-200 ${isPlayerTeam ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                                        <td className="px-4 py-4 text-center relative">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className={`font-bold ${isPlayerTeam ? 'text-white' : 'text-slate-400'}`}>{row.position}</span>
                                                {zoneColor && <div className={`w-1 h-6 ${zoneColor} rounded-full absolute left-2`} title={zoneLabel}></div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center">
                                                    <TeamLogo team={team} />
                                                </div>
                                                <span className={`font-bold ${isPlayerTeam ? 'text-white' : 'text-slate-200'}`}>{team?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.played}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.won}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.drawn}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.lost}</td>
                                        <td className="px-4 py-4"><div className="flex justify-center"><TeamForm form={row.form} /></div></td>
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

    const renderCupView = (cup: CupCompetition | undefined) => {
        if (!cup) return null;
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
        const isFinished = !!cup.winnerId;
        const winner = cup.winnerId ? getTeamById(cup.winnerId) : null;

        const roundNameMap: Record<string, string> = {
            'Final': 'Gran Final',
            'Semi-Final': 'Semifinales',
            'Quarter-Final': 'Cuartos de Final',
            'Round of 16': 'Octavos de Final',
            'Round of 32': 'Dieciseisavos de Final',
            'Final Intercontinental': 'Duelo por la Gloria Eterna'
        };

        const translatedRoundName = roundNameMap[currentRound?.name] || currentRound?.name || 'Finalizada';

        return (
            <div className={`bg-gradient-to-br ${theme.bg} border-2 ${theme.border} rounded-3xl shadow-2xl overflow-hidden animate-fade-in`}>
                <div className="relative px-6 py-8 border-b border-white/5 overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)' , backgroundSize: '20px 20px' }} />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 p-2 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center shadow-xl backdrop-blur-sm shrink-0">
                                {logo ? (
                                    <img src={logo} alt={cup.name} className="w-full h-full object-contain drop-shadow-lg" />
                                ) : (
                                    <TrophyIcon className={`w-10 h-10 ${theme.accent}`} />
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">{cup.name}</h2>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                                    <span className={`font-bold uppercase tracking-widest text-[10px] md:text-xs ${theme.accent}`}>Torneo Eliminatorio</span>
                                    <span className="text-slate-600 hidden md:block">•</span>
                                    <span className="text-slate-400 text-xs md:text-sm font-medium">{translatedRoundName}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 bg-black/30 p-1 rounded-xl shrink-0 self-start md:self-auto">
                            <button onClick={() => setCupTab('ROUNDS')} className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${cupTab === 'ROUNDS' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'}`}>Llaves</button>
                            <button onClick={() => setCupTab('STATS')} className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${cupTab === 'STATS' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'}`}>Historial</button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {cupTab === 'ROUNDS' ? (
                        <div className="space-y-4">
                            {isFinished && winner && (
                                <div className={`flex items-center gap-4 p-5 rounded-2xl border ${theme.border} bg-white/5 mb-6`}>
                                    <div className="w-12 h-12 shrink-0"><TrophyIcon className={`w-full h-full ${theme.accent}`} /></div>
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
                            <div className="overflow-x-auto pb-4">
                                <TournamentBracket
                                    cup={cup}
                                    getTeamById={getTeamById}
                                    playerTeamId={gameState.team.id}
                                    theme={theme}
                                    logoUrl={logo}
                                />
                            </div>
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

    // Filter competitions based on search query
    const filteredCompetitions = ALL_COMPETITIONS.filter(comp => 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (comp.country && comp.country.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const intlComps = filteredCompetitions.filter(c => c.category === 'INTERNATIONAL');
    const domesticComps = filteredCompetitions.filter(c => c.category === 'DOMESTIC');

    // Group domestic competitions by country
    const domesticByCountry = domesticComps.reduce((acc, comp) => {
        if (!comp.country) return acc;
        if (!acc[comp.country]) acc[comp.country] = [];
        acc[comp.country].push(comp);
        return acc;
    }, {} as Record<string, CompetitionItem[]>);

    const renderSidebarItem = (comp: CompetitionItem) => {
        const isSelected = selectedCompetitionId === comp.id;
        return (
            <button
                key={comp.id}
                onClick={() => {
                    setSelectedCompetitionId(comp.id);
                    setCupTab('ROUNDS');
                    setTimeout(() => {
                        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-left ${isSelected ? 'bg-white/10 shadow-lg ring-1 ring-white/20' : 'hover:bg-white/5'}`}
            >
                <div className={`w-8 h-8 rounded-lg p-1.5 flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/10' : 'bg-slate-800'}`}>
                    {comp.logo ? (
                        <img src={comp.logo} alt={comp.name} className="w-full h-full object-contain" />
                    ) : (
                        <TrophyIcon className="w-4 h-4 text-slate-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>{comp.name}</p>
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">{comp.type === 'LEAGUE' ? 'Liga' : 'Copa'}</p>
                </div>
            </button>
        );
    };

    const selectedCompDef = ALL_COMPETITIONS.find(c => c.id === selectedCompetitionId);

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Panel Lateral (Sidebar) */}
                <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
                    {/* Buscador Global */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar ligas o copas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors backdrop-blur-md"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-3 overflow-y-auto max-h-[75vh] custom-scrollbar shadow-xl backdrop-blur-sm">
                        
                        {/* Internacionales */}
                        {intlComps.length > 0 && (
                            <div className="mb-4">
                                <button 
                                    onClick={() => toggleSection('INTERNATIONAL')}
                                    className="w-full flex items-center justify-between px-2 py-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">🌍 Internacionales</span>
                                    <svg className={`w-4 h-4 transition-transform ${expandedSections['INTERNATIONAL'] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {expandedSections['INTERNATIONAL'] && (
                                    <div className="mt-2 space-y-1">
                                        {intlComps.map(renderSidebarItem)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Competiciones Nacionales por País */}
                        {Object.entries(domesticByCountry).length > 0 && (
                            <div className="space-y-4">
                                <div className="px-2 pb-1 border-b border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Competiciones Nacionales</span>
                                </div>
                                
                                {Object.entries(domesticByCountry).map(([country, comps]) => {
                                    const flag = comps[0].flagUrl;
                                    const isExpanded = expandedSections[country] || searchQuery.length > 0;
                                    
                                    return (
                                        <div key={country}>
                                            <button 
                                                onClick={() => toggleSection(country)}
                                                className="w-full flex items-center justify-between px-2 py-2 text-slate-300 hover:text-white transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {flag && <img src={flag} alt={country} className="w-5 h-3.5 rounded-[2px] object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                                                    <span className="text-xs font-bold uppercase tracking-wider">{country}</span>
                                                </div>
                                                <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                            
                                            {isExpanded && (
                                                <div className="mt-2 space-y-1">
                                                    {comps.map(renderSidebarItem)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {filteredCompetitions.length === 0 && (
                            <div className="p-6 text-center text-slate-500 text-sm">
                                <span className="block text-2xl mb-2">🔍</span>
                                No se encontraron competiciones.
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel Derecho (Contenido) */}
                <div className="flex-1 min-w-0" ref={contentRef}>
                    {!selectedCompDef ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-slate-900/30 border border-white/5 rounded-3xl p-6 text-center">
                            <TrophyIcon className="w-16 h-16 text-slate-700 mb-4" />
                            <h3 className="text-xl font-black text-white uppercase tracking-wider">Explorador de Competiciones</h3>
                            <p className="text-slate-500 text-sm mt-2 max-w-sm">Selecciona una liga o copa desde el panel lateral para ver sus estadísticas, resultados y formato.</p>
                        </div>
                    ) : selectedCompDef.type === 'LEAGUE' ? (
                        renderLeagueTable(gameState.leagueTables[selectedCompDef.id], selectedCompDef.name, selectedCompDef.logo, selectedCompDef.isFirstDiv || false, selectedCompDef.id)
                    ) : selectedCompDef.type === 'CUP' && selectedCompDef.cupKey ? (
                        renderCupView((gameState.cups as any)[selectedCompDef.cupKey])
                    ) : null}
                </div>

            </div>
        </div>
    );
};
