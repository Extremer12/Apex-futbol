import React, { useMemo, useState } from 'react';
import { GameState, Player, Team } from '../../types';
import { TeamLogo, PlayerPhoto } from '../../data/teams/helpers';
import { ALL_COMPETITIONS, CompetitionItem } from './league/constants';
import { customPacksService } from '../../services/customPacks/packService';
import { useGameStore } from '../../state/gameStore';
import { 
    Search, X, Globe, ChevronDown, ChevronUp, Star, CheckCircle2, 
    Trophy, Shield, Flame, Activity, Sparkles, Medal, Award, ChevronRight,
    Users, Footprints
} from 'lucide-react';

interface StatisticsScreenProps {
    gameState: GameState;
}

interface PlayerStats {
    player: Player;
    team: Team;
    teamId: number;
    teamName: string;
    teamLogo: string;
    goals: number;
    assists: number;
    matches: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
    'Argentina': '🇦🇷',
    'Brasil': '🇧🇷',
    'Chile': '🇨🇱',
    'Colombia': '🇨🇴',
    'Paraguay': '🇵🇾',
    'México': '🇲🇽',
    'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'España': '🇪🇸',
    'Alemania': '🇩🇪',
    'Italia': '🇮🇹',
    'Francia': '🇫🇷',
};

const REGION_TABS = [
    { id: 'ALL', label: 'Todos (32)' },
    { id: 'SUDAMERICA', label: '🌎 Sudamérica y México' },
    { id: 'EUROPA', label: '🌍 Europa' },
    { id: 'INT', label: '🏆 Internacionales' },
];

const getCompBadge = (c: CompetitionItem) => {
    if (c.category === 'INTERNATIONAL') {
        return { label: 'Continental', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
    if (c.type === 'CUP') {
        return { label: 'Copa Nacional', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    if (c.isFirstDiv) {
        return { label: '1ª División', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
    }
    return { label: '2ª División', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
};

export const StatisticsScreen: React.FC<StatisticsScreenProps> = React.memo(({ gameState }) => {
    const dispatch = useGameStore(s => s.dispatch);
    const [selectedCompId, setSelectedCompId] = useState<string>(gameState.team.leagueId || 'PREMIER_LEAGUE');
    const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);

    // Selected competition definition
    const selectedCompDef = useMemo(() => {
        return ALL_COMPETITIONS.find(c => c.id === selectedCompId) || 
               ALL_COMPETITIONS.find(c => c.id === 'PREMIER_LEAGUE') || 
               ALL_COMPETITIONS[0];
    }, [selectedCompId]);

    const compLogo = useMemo(() => {
        return customPacksService.resolveCompetitionLogo(selectedCompDef.id, selectedCompDef.name, selectedCompDef.logo);
    }, [selectedCompDef]);

    const isLeague = selectedCompDef.type === 'LEAGUE';

    // 1-Tap Quick Access Shortcuts for Manager's Club
    const userLeagueComp = ALL_COMPETITIONS.find(c => c.id === gameState.team.leagueId);
    const userCountry = userLeagueComp?.country || gameState.team.country || 'Argentina';
    const userCupComp = ALL_COMPETITIONS.find(c => c.country === userCountry && c.type === 'CUP');
    const isEuropean = ['Inglaterra', 'España', 'Alemania', 'Italia', 'Francia'].includes(userCountry);
    const userContinentalComp = ALL_COMPETITIONS.find(c => c.id === (isEuropean ? 'CHAMPIONS_LEAGUE' : 'COPA_LIBERTADORES'));
    const intercontinentalComp = ALL_COMPETITIONS.find(c => c.id === 'COPA_INTERCONTINENTAL');

    const quickShortcuts = useMemo(() => {
        return [
            userLeagueComp,
            userCupComp,
            userContinentalComp,
            intercontinentalComp
        ].filter(Boolean) as CompetitionItem[];
    }, [userLeagueComp, userCupComp, userContinentalComp, intercontinentalComp]);

    // Competitions available for filtering (exclude rankings)
    const filteredCompetitions = useMemo(() => {
        let list = ALL_COMPETITIONS.filter(c => c.id !== 'CLUB_RANKINGS');

        if (selectedRegion === 'INT') {
            list = list.filter(c => c.category === 'INTERNATIONAL');
        } else if (selectedRegion === 'SUDAMERICA') {
            const southAmericanCountries = ['Argentina', 'Brasil', 'Chile', 'Colombia', 'Paraguay', 'México'];
            list = list.filter(c => c.country && southAmericanCountries.includes(c.country));
        } else if (selectedRegion === 'EUROPA') {
            const europeanCountries = ['Inglaterra', 'España', 'Alemania', 'Italia', 'Francia'];
            list = list.filter(c => c.country && europeanCountries.includes(c.country));
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(c => 
                c.name.toLowerCase().includes(q) || 
                (c.country && c.country.toLowerCase().includes(q)) ||
                gameState.allTeams.some(t => t.leagueId === c.id && t.name.toLowerCase().includes(q))
            );
        }

        return list;
    }, [selectedRegion, searchQuery, gameState.allTeams]);

    // Teams in the active league
    const leagueTeams = useMemo(() => {
        if (!isLeague) return [];
        return gameState.allTeams.filter(t => t.leagueId === selectedCompDef.id);
    }, [isLeague, gameState.allTeams, selectedCompDef.id]);

    // League player stats
    const playerStats = useMemo(() => {
        if (!isLeague) return [];
        const stats: PlayerStats[] = [];
        leagueTeams.forEach(team => {
            (team.squad || []).forEach(player => {
                if (player.stats && (player.stats.goals > 0 || player.stats.assists > 0 || player.stats.appearances > 0)) {
                    stats.push({
                        player,
                        team,
                        teamId: team.id,
                        teamName: team.name,
                        teamLogo: team.logo,
                        goals: player.stats.goals || 0,
                        assists: player.stats.assists || 0,
                        matches: player.stats.appearances || 0
                    });
                }
            });
        });
        return stats;
    }, [isLeague, leagueTeams]);

    // Top Scorers (League or Cup)
    const topScorers = useMemo(() => {
        if (isLeague) {
            return [...playerStats]
                .filter(s => s.goals > 0)
                .sort((a, b) => b.goals - a.goals || b.player.rating - a.player.rating)
                .slice(0, 15);
        }

        // Cup Top Scorers
        if (selectedCompDef.cupKey) {
            const cup = (gameState.cups as any)[selectedCompDef.cupKey];
            const cupScorers = cup?.statistics?.topScorers || [];
            if (!Array.isArray(cupScorers) || cupScorers.length === 0) return [];

            return [...cupScorers]
                .filter(cs => cs && cs.goals > 0)
                .sort((a, b) => b.goals - a.goals)
                .slice(0, 15)
                .map(cs => {
                    const team = gameState.allTeams.find(t => t.id === cs.teamId);
                    const player = team?.squad.find(p => p.id === cs.playerId) || {
                        id: cs.playerId,
                        name: cs.playerName,
                        position: 'DEL',
                        rating: 75,
                    } as Player;

                    return {
                        player,
                        team: team || { id: cs.teamId, name: cs.teamName, logo: '' } as Team,
                        teamId: cs.teamId,
                        teamName: cs.teamName,
                        teamLogo: team?.logo || '',
                        goals: cs.goals,
                        assists: 0,
                        matches: 0
                    };
                });
        }

        return [];
    }, [isLeague, playerStats, selectedCompDef, gameState.cups, gameState.allTeams]);

    // Top Assists (League)
    const topAssists = useMemo(() => {
        if (!isLeague) return [];
        return [...playerStats]
            .filter(s => s.assists > 0)
            .sort((a, b) => b.assists - a.assists || b.player.rating - a.player.rating)
            .slice(0, 15);
    }, [isLeague, playerStats]);

    // Team Performance Highlights
    const teamHighlights = useMemo(() => {
        if (!isLeague) return null;
        const currentTable = gameState.leagueTables[selectedCompDef.id] || [];
        if (currentTable.length === 0) return null;

        const bestAttackEntry = [...currentTable].sort((a, b) => b.goalsFor - a.goalsFor)[0];
        const bestAttackTeam = gameState.allTeams.find(t => t.id === bestAttackEntry?.teamId);

        const bestDefenseEntry = [...currentTable].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0];
        const bestDefenseTeam = gameState.allTeams.find(t => t.id === bestDefenseEntry?.teamId);

        const totalGoals = currentTable.reduce((acc, row) => acc + (row.goalsFor || 0), 0);
        const totalMatchesPlayed = currentTable.reduce((acc, row) => acc + (row.played || 0), 0) / 2;
        const avgGoals = totalMatchesPlayed > 0 ? (totalGoals / totalMatchesPlayed).toFixed(2) : '0.00';

        return {
            bestAttackTeam,
            bestAttackGoals: bestAttackEntry?.goalsFor || 0,
            bestDefenseTeam,
            bestDefenseGoals: bestDefenseEntry?.goalsAgainst || 0,
            totalGoals,
            totalMatchesPlayed: Math.round(totalMatchesPlayed),
            avgGoals
        };
    }, [isLeague, selectedCompDef.id, gameState.leagueTables, gameState.allTeams]);

    // Cup status info if applicable
    const cupInfo = useMemo(() => {
        if (isLeague || !selectedCompDef.cupKey) return null;
        const cup = (gameState.cups as any)[selectedCompDef.cupKey];
        if (!cup) return null;

        const phaseName = cup.phase === 'finished' ? 'Finalizada'
            : cup.phase === 'knockout' ? 'Fase Eliminatoria'
            : cup.phase === 'swiss' ? 'Fase de Liga Suiza'
            : 'Fase de Grupos';

        const lastChampion = cup.statistics?.championsHistory?.[0];
        const lastChampionTeam = lastChampion ? gameState.allTeams.find(t => t.id === lastChampion.winnerId) : null;

        return {
            phaseName,
            lastChampionName: lastChampion?.winnerName || lastChampionTeam?.name,
            lastChampionTeam,
            season: lastChampion?.season
        };
    }, [isLeague, selectedCompDef, gameState.cups, gameState.allTeams]);

    const showSelector = isSelectorOpen || searchQuery.trim().length > 0;

    return (
        <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-24 animate-fade-in w-full">
            {/* ========================================================================= */}
            {/* HEADER & CONTROL BAR: COMPETICIÓN ACTIVA + SHORTCUTS + SELECTOR           */}
            {/* ========================================================================= */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900/95 via-[#0E1524] to-[#0A0E17] border border-white/10 p-4 sm:p-5 shadow-2xl space-y-4 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--apex-gold)]/5 blur-[90px] rounded-full pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    {/* Active Competition Details */}
                    <div className="flex items-center gap-3.5 sm:gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-white/20 p-2 flex items-center justify-center shrink-0 shadow-lg shadow-black/40">
                            <img 
                                src={compLogo} 
                                alt={selectedCompDef.name} 
                                className="w-full h-full object-contain drop-shadow" 
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)] flex items-center gap-1">
                                    <span>{COUNTRY_FLAGS[selectedCompDef.country || ''] || '🌐'}</span>
                                    <span>{selectedCompDef.country || 'Internacional'}</span>
                                </span>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getCompBadge(selectedCompDef).color}`}>
                                    {getCompBadge(selectedCompDef).label}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                    Temporada {gameState.season}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase italic leading-none">
                                {selectedCompDef.name}
                            </h1>
                        </div>
                    </div>

                    {/* Selector Trigger Button */}
                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                        <button
                            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border shadow-sm ${
                                showSelector
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30'
                                    : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                            }`}
                        >
                            <Globe className="w-4 h-4 text-[var(--apex-gold)]" />
                            <span>{showSelector ? 'Ocultar Selector' : 'Cambiar Competición (32)'}</span>
                            {showSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Quick 1-Tap Shortcuts for User's Club */}
                {quickShortcuts.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-white/5 relative z-10">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            Acceso rápido:
                        </span>
                        {quickShortcuts.map(sc => {
                            const isCurrent = selectedCompId === sc.id;
                            const scLogo = customPacksService.resolveCompetitionLogo(sc.id, sc.name, sc.logo);
                            return (
                                <button
                                    key={sc.id}
                                    onClick={() => {
                                        setSelectedCompId(sc.id);
                                        setSearchQuery('');
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                                        isCurrent
                                            ? 'bg-[var(--apex-gold)] text-black font-black border-[var(--apex-gold)] shadow-md shadow-amber-500/20 scale-[1.02]'
                                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                                    }`}
                                >
                                    <img src={scLogo} alt={sc.name} className="w-3.5 h-3.5 object-contain" />
                                    <span>{sc.name}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* EXPANDABLE COMPETITION SEARCH & SELECTOR */}
                {showSelector && (
                    <div className="pt-3 border-t border-white/10 space-y-3 animate-fade-in relative z-10">
                        {/* Filter Tabs + Search Input */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Regional Tabs */}
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                {REGION_TABS.map(tab => {
                                    const isSelected = selectedRegion === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setSelectedRegion(tab.id)}
                                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 text-black font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                                            }`}
                                        >
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Live Search Bar */}
                            <div className="relative w-full sm:w-72 shrink-0">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Buscar liga, copa, país o club..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/70 border border-white/15 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[var(--apex-gold)] focus:ring-1 focus:ring-[var(--apex-gold)] transition-all font-medium"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Responsive 3-Column Competition Grid (Zero Truncation!) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1 pt-1">
                            {filteredCompetitions.length > 0 ? (
                                filteredCompetitions.map(c => {
                                    const isSelected = selectedCompId === c.id;
                                    const cLogo = customPacksService.resolveCompetitionLogo(c.id, c.name, c.logo);
                                    const badge = getCompBadge(c);
                                    const flag = COUNTRY_FLAGS[c.country || ''] || '🌐';

                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => {
                                                setSelectedCompId(c.id);
                                                setIsSelectorOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className={`p-2.5 rounded-xl text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer border group ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-amber-500/20 via-slate-900/90 to-[#0B0F19] border-[var(--apex-gold)] ring-1 ring-[var(--apex-gold)]/40 shadow-sm'
                                                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 shrink-0 p-1 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                                    <img src={cLogo} alt={c.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className={`text-xs font-black truncate leading-tight ${isSelected ? 'text-[var(--apex-gold)]' : 'text-slate-100 group-hover:text-amber-200'}`}>
                                                        {c.name}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-slate-400 font-semibold truncate">
                                                            {flag} {c.country || 'Internacional'}
                                                        </span>
                                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border shrink-0 ${badge.color}`}>
                                                            {badge.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {isSelected ? (
                                                <CheckCircle2 className="w-4 h-4 text-[var(--apex-gold)] shrink-0" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0" />
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                                    No se encontraron competiciones que coincidan con "{searchQuery}".
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* OVERVIEW METRICS: RESUMEN DE LA COMPETICIÓN                                */}
            {/* ========================================================================= */}
            {teamHighlights && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full">
                    {/* Poder Ofensivo */}
                    <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl group">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 blur-[40px] rounded-full group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5" /> Mejor Ataque
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-emerald-400 italic">
                                {teamHighlights.bestAttackGoals} <span className="text-[10px] font-bold text-white/40 uppercase not-italic">Goles</span>
                            </span>
                        </div>
                        {teamHighlights.bestAttackTeam && (
                            <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                                    <TeamLogo team={teamHighlights.bestAttackTeam} className="w-full h-full object-contain drop-shadow" />
                                </div>
                                <span className="text-xs sm:text-sm font-black text-white truncate">
                                    {teamHighlights.bestAttackTeam.name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Muro Defensivo */}
                    <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl group">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/10 blur-[40px] rounded-full group-hover:bg-sky-500/20 transition-all pointer-events-none" />
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" /> Mejor Defensa
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-sky-400 italic">
                                {teamHighlights.bestDefenseGoals} <span className="text-[10px] font-bold text-white/40 uppercase not-italic">Goles Rec.</span>
                            </span>
                        </div>
                        {teamHighlights.bestDefenseTeam && (
                            <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                                    <TeamLogo team={teamHighlights.bestDefenseTeam} className="w-full h-full object-contain drop-shadow" />
                                </div>
                                <span className="text-xs sm:text-sm font-black text-white truncate">
                                    {teamHighlights.bestDefenseTeam.name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Promedio Global del Torneo */}
                    <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl group">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-[var(--apex-gold)]/10 blur-[40px] rounded-full group-hover:bg-[var(--apex-gold)]/20 transition-all pointer-events-none" />
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-[var(--apex-gold)] uppercase tracking-wider flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" /> Promedio de Gol
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-[var(--apex-gold)] italic">
                                {teamHighlights.avgGoals} <span className="text-[10px] font-bold text-white/40 uppercase not-italic">Goles/PJ</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                            <span>{teamHighlights.totalGoals} goles en total</span>
                            <span className="font-mono">{teamHighlights.totalMatchesPlayed} partidos disputados</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Cup Status Banner if applicable */}
            {cupInfo && (
                <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                    <div className="flex items-center gap-2.5">
                        <Trophy className="w-4 h-4 text-[var(--apex-gold)]" />
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estado de la Copa</span>
                            <span className="text-xs sm:text-sm font-black text-white">{cupInfo.phaseName}</span>
                        </div>
                    </div>
                    {cupInfo.lastChampionName && (
                        <div className="flex items-center gap-2.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                            {cupInfo.lastChampionTeam && (
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <TeamLogo team={cupInfo.lastChampionTeam} className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div className="text-left">
                                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">Campeón Vigente</span>
                                <span className="text-xs font-black text-white">{cupInfo.lastChampionName}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* STATS TABLES: GOLEADORES Y ASISTENTES                                     */}
            {/* ========================================================================= */}
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
                                            onClick={() => stat.player && dispatch({ type: 'SET_VIEWING_PLAYER', payload: stat.player })}
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
                                                onClick={() => stat.player && dispatch({ type: 'SET_VIEWING_PLAYER', payload: stat.player })}
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
        </div>
    );
});
