import React, { useState, useMemo } from 'react';
import { GameState, Team } from '../../types';
import { ALL_COMPETITIONS, CompetitionItem, LEAGUE_THEMES } from './league/constants';
import { LeagueTable } from './league/LeagueTable';
import { CupView } from './league/CupView';
import { ClubRankingsView } from './league/ClubRankingsView';
import { customPacksService } from '../../services/customPacks/packService';
import { resourceManager } from '../../services/resources/ResourceManager';
import { ResourceFallback } from '../../services/resources/ResourceFallback';
import { TeamLogo, usePacksVersion } from '../../data/teams/helpers';
import { BottomSheet, EmptyState } from './transfers/TransferUI';
import { Search, X, SlidersHorizontal, ChevronRight, Globe, SearchX } from 'lucide-react';

interface LeagueScreenProps {
    gameState: GameState;
}

type ScreenTab = 'CURRENT' | 'EXPLORE' | 'RANKINGS';
type RegionFilter = 'ALL' | 'MY_COUNTRY' | 'INTERNATIONAL' | 'EUROPA' | 'AMERICA';
type TypeFilter = 'ALL' | 'FIRST_DIV' | 'SECOND_DIV' | 'DOMESTIC_CUP' | 'INTL_CUP';

const AMERICA_COUNTRIES = new Set(['Argentina', 'Brasil', 'Uruguay', 'Ecuador', 'Chile', 'Colombia', 'Paraguay', 'México', 'EE.UU.']);
const EUROPA_COUNTRIES = new Set(['Inglaterra', 'España', 'Alemania', 'Italia', 'Francia', 'Portugal', 'Países Bajos']);
const COUNTRY_ORDER = [
    'Argentina', 'Inglaterra', 'España', 'Brasil', 'Italia', 'Alemania',
    'Francia', 'Portugal', 'Países Bajos', 'Uruguay', 'Ecuador', 'México', 'Colombia', 'Chile', 'Paraguay', 'EE.UU.'
];

interface AccentStyle {
    bar: string;
    tint: string;
    badge: string;
    gradient: string;
}

const ACCENTS: Record<string, AccentStyle> = {
    purple: { bar: 'bg-purple-500', tint: 'bg-purple-500/15 border-purple-500/30', badge: 'bg-purple-500/15 text-purple-300', gradient: 'from-purple-500/15 via-transparent to-transparent' },
    indigo: { bar: 'bg-indigo-500', tint: 'bg-indigo-500/15 border-indigo-500/30', badge: 'bg-indigo-500/15 text-indigo-300', gradient: 'from-indigo-500/15 via-transparent to-transparent' },
    sky: { bar: 'bg-sky-400', tint: 'bg-sky-500/15 border-sky-500/30', badge: 'bg-sky-500/15 text-sky-300', gradient: 'from-sky-500/15 via-transparent to-transparent' },
    cyan: { bar: 'bg-cyan-400', tint: 'bg-cyan-500/15 border-cyan-500/30', badge: 'bg-cyan-500/15 text-cyan-300', gradient: 'from-cyan-500/15 via-transparent to-transparent' },
    blue: { bar: 'bg-blue-500', tint: 'bg-blue-500/15 border-blue-500/30', badge: 'bg-blue-500/15 text-blue-300', gradient: 'from-blue-500/15 via-transparent to-transparent' },
    emerald: { bar: 'bg-emerald-400', tint: 'bg-emerald-500/15 border-emerald-500/30', badge: 'bg-emerald-500/15 text-emerald-300', gradient: 'from-emerald-500/15 via-transparent to-transparent' },
    green: { bar: 'bg-green-500', tint: 'bg-green-500/15 border-green-500/30', badge: 'bg-green-500/15 text-green-300', gradient: 'from-green-500/15 via-transparent to-transparent' },
    amber: { bar: 'bg-amber-400', tint: 'bg-amber-500/15 border-amber-500/30', badge: 'bg-amber-500/15 text-amber-300', gradient: 'from-amber-500/15 via-transparent to-transparent' },
    yellow: { bar: 'bg-yellow-400', tint: 'bg-yellow-500/15 border-yellow-500/30', badge: 'bg-yellow-500/15 text-yellow-300', gradient: 'from-yellow-500/15 via-transparent to-transparent' },
    orange: { bar: 'bg-orange-500', tint: 'bg-orange-500/15 border-orange-500/30', badge: 'bg-orange-500/15 text-orange-300', gradient: 'from-orange-500/15 via-transparent to-transparent' },
    red: { bar: 'bg-red-500', tint: 'bg-red-500/15 border-red-500/30', badge: 'bg-red-500/15 text-red-300', gradient: 'from-red-500/15 via-transparent to-transparent' },
    rose: { bar: 'bg-rose-500', tint: 'bg-rose-500/15 border-rose-500/30', badge: 'bg-rose-500/15 text-rose-300', gradient: 'from-rose-500/15 via-transparent to-transparent' },
};

const getCompAccent = (comp: CompetitionItem): AccentStyle => {
    if (comp.type === 'LEAGUE') {
        return ACCENTS[LEAGUE_THEMES[comp.id] || 'emerald'] || ACCENTS.emerald;
    }
    switch (comp.id) {
        case 'CHAMPIONS_LEAGUE': return ACCENTS.indigo;
        case 'EUROPA_LEAGUE': return ACCENTS.orange;
        case 'COPA_LIBERTADORES': return ACCENTS.amber;
        case 'COPA_SUDAMERICANA': return ACCENTS.sky;
        case 'RECOPA_SUDAMERICANA': return ACCENTS.yellow;
        case 'COPA_INTERCONTINENTAL': return ACCENTS.emerald;
        case 'CLUB_WORLD_CUP': return ACCENTS.amber;
        case 'FA_CUP': return ACCENTS.rose;
        case 'CARABAO_CUP': return ACCENTS.green;
        case 'COPA_DEL_REY': return ACCENTS.amber;
        case 'DFB_POKAL': return ACCENTS.yellow;
        case 'COPPA_ITALIA': return ACCENTS.green;
        case 'COPA_ARGENTINA': return ACCENTS.cyan;
        case 'COPA_MX': return ACCENTS.emerald;
        default: return ACCENTS.amber;
    }
};

const getCompTypeLabel = (comp: CompetitionItem): string => {
    if (comp.category === 'INTERNATIONAL') return 'Internacional';
    if (comp.type === 'CUP') return 'Copa';
    return comp.isFirstDiv ? '1ª Div' : '2ª Div';
};

const TYPE_FILTERS: { id: TypeFilter; label: string }[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'FIRST_DIV', label: '1ª División' },
    { id: 'SECOND_DIV', label: '2ª División' },
    { id: 'DOMESTIC_CUP', label: 'Copas Nacionales' },
    { id: 'INTL_CUP', label: 'Internacionales' },
];

export const LeagueScreen: React.FC<LeagueScreenProps> = ({ gameState }) => {
    const packsVersion = usePacksVersion();
    const playerTeamLeague = gameState.team.leagueId;

    const nextWeek = gameState.currentWeek;
    const isMidweek = gameState.currentTurn === 'midweek';
    const nextMatch = gameState.schedule.find(
        m => !m.result && m.week === nextWeek && !!m.isMidweek === isMidweek && (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id)
    );

    const playableCompetitions = useMemo(
        () => ALL_COMPETITIONS.filter(c => c.id !== 'CLUB_RANKINGS'),
        []
    );

    const initialCompetitionId = useMemo(() => {
        if (nextMatch && (nextMatch as any).competition) {
            const compMatch = playableCompetitions.find(c =>
                c.id === (nextMatch as any).competition ||
                c.cupKey === (nextMatch as any).competition ||
                c.name.toLowerCase() === ((nextMatch as any).competition || '').toLowerCase()
            );
            if (compMatch) return compMatch.id;
        }
        return playerTeamLeague || 'PREMIER_LEAGUE';
    }, [nextMatch, playerTeamLeague, playableCompetitions]);

    const [activeTab, setActiveTab] = useState<ScreenTab>('CURRENT');
    const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>(initialCompetitionId);
    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState<RegionFilter>('ALL');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const teamsById = useMemo(
        () => new Map<number, Team>(gameState.allTeams.map(t => [t.id, t])),
        [gameState.allTeams]
    );

    // Index of club names per league for instant club-to-league search
    const leagueClubNamesMap = useMemo(() => {
        const map = new Map<string, string[]>();
        for (const t of gameState.allTeams) {
            if (!t.leagueId) continue;
            const arr = map.get(t.leagueId);
            if (arr) arr.push(t.name);
            else map.set(t.leagueId, [t.name]);
        }
        return map;
    }, [gameState.allTeams]);

    const userCountry = useMemo(() => {
        const myLeague = playableCompetitions.find(c => c.id === playerTeamLeague);
        return myLeague?.country || 'Argentina';
    }, [playerTeamLeague, playableCompetitions]);

    const selectedCompDef = useMemo(
        () => playableCompetitions.find(c => c.id === selectedCompetitionId) || playableCompetitions[0],
        [selectedCompetitionId, playableCompetitions]
    );

    const domesticPeers = useMemo(() => {
        if (!selectedCompDef) return [];
        if (selectedCompDef.category === 'INTERNATIONAL') {
            return playableCompetitions.filter(c => c.category === 'INTERNATIONAL');
        }
        return playableCompetitions.filter(c => c.country === selectedCompDef.country);
    }, [selectedCompDef, playableCompetitions]);

    // Live metadata helper (leader for leagues, stage/winner for cups)
    const getLiveStatus = (comp: CompetitionItem): { label: string; team?: Team } => {
        if (comp.type === 'LEAGUE') {
            const table = gameState.leagueTables[comp.id];
            if (table && table.length > 0 && table[0].played > 0) {
                const leader = teamsById.get(table[0].teamId);
                return {
                    label: `1.º ${leader?.shortName || table[0].teamName} (${table[0].points} pts)`,
                    team: leader,
                };
            }
            return { label: `${table?.length || 20} clubes · Temporada ${gameState.season}` };
        }
        if (comp.cupKey) {
            const cup = (gameState.cups as any)?.[comp.cupKey];
            if (cup?.winnerId) {
                const winner = teamsById.get(cup.winnerId);
                return { label: `Campeón: ${winner?.shortName || winner?.name || 'Definido'}`, team: winner };
            }
            const currentRound = cup?.rounds?.[cup.rounds.length - 1];
            if (currentRound?.name) {
                return { label: currentRound.name };
            }
            if (cup?.groups && cup.groups.length > 0) {
                return { label: 'Fase de Grupos' };
            }
            if (cup?.leaguePhaseTable && cup.leaguePhaseTable.length > 0) {
                return { label: 'Fase Liga (36 clubes)' };
            }
        }
        return { label: 'En agenda' };
    };

    // Smart search (by competition name, country, type, or participating club name)
    const filteredCompetitions = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return playableCompetitions
            .map(comp => {
                let matchedClub: string | null = null;
                if (q) {
                    const matchName = comp.name.toLowerCase().includes(q);
                    const matchCountry = comp.country?.toLowerCase().includes(q) ?? false;
                    const matchType = getCompTypeLabel(comp).toLowerCase().includes(q);
                    if (!matchName && !matchCountry && !matchType) {
                        const clubs = leagueClubNamesMap.get(comp.id) || [];
                        matchedClub = clubs.find(name => name.toLowerCase().includes(q)) || null;
                        if (!matchedClub) return null;
                    }
                }

                // Region filter
                if (regionFilter === 'MY_COUNTRY' && comp.country !== userCountry) return null;
                if (regionFilter === 'INTERNATIONAL' && comp.category !== 'INTERNATIONAL') return null;
                if (regionFilter === 'AMERICA') {
                    if (comp.category === 'INTERNATIONAL') {
                        if (
                            comp.id !== 'COPA_LIBERTADORES' &&
                            comp.id !== 'COPA_SUDAMERICANA' &&
                            comp.id !== 'RECOPA_SUDAMERICANA' &&
                            comp.id !== 'COPA_INTERCONTINENTAL' &&
                            comp.id !== 'CLUB_WORLD_CUP'
                        ) return null;
                    } else if (!comp.country || !AMERICA_COUNTRIES.has(comp.country)) return null;
                }
                if (regionFilter === 'EUROPA') {
                    if (comp.category === 'INTERNATIONAL') {
                        if (
                            comp.id !== 'CHAMPIONS_LEAGUE' &&
                            comp.id !== 'EUROPA_LEAGUE' &&
                            comp.id !== 'COPA_INTERCONTINENTAL' &&
                            comp.id !== 'CLUB_WORLD_CUP'
                        ) return null;
                    } else if (!comp.country || !EUROPA_COUNTRIES.has(comp.country)) return null;
                }

                // Type filter
                if (typeFilter === 'FIRST_DIV' && !(comp.type === 'LEAGUE' && comp.isFirstDiv)) return null;
                if (typeFilter === 'SECOND_DIV' && !(comp.type === 'LEAGUE' && !comp.isFirstDiv)) return null;
                if (typeFilter === 'DOMESTIC_CUP' && !(comp.type === 'CUP' && comp.category === 'DOMESTIC')) return null;
                if (typeFilter === 'INTL_CUP' && comp.category !== 'INTERNATIONAL') return null;

                return { comp, matchedClub };
            })
            .filter(Boolean) as { comp: CompetitionItem; matchedClub: string | null }[];
    }, [playableCompetitions, searchQuery, regionFilter, typeFilter, userCountry, leagueClubNamesMap]);

    const internationalEntries = useMemo(
        () => filteredCompetitions.filter(e => e.comp.category === 'INTERNATIONAL'),
        [filteredCompetitions]
    );

    const groupedByCountry = useMemo(() => {
        const map = new Map<string, { country: string; flagUrl?: string; entries: { comp: CompetitionItem; matchedClub: string | null }[] }>();
        for (const entry of filteredCompetitions) {
            if (entry.comp.category !== 'DOMESTIC' || !entry.comp.country) continue;
            if (!map.has(entry.comp.country)) {
                map.set(entry.comp.country, { country: entry.comp.country, flagUrl: entry.comp.flagUrl, entries: [] });
            }
            map.get(entry.comp.country)!.entries.push(entry);
        }
        return Array.from(map.values()).sort((a, b) => {
            if (a.country === userCountry) return -1;
            if (b.country === userCountry) return 1;
            const idxA = COUNTRY_ORDER.indexOf(a.country);
            const idxB = COUNTRY_ORDER.indexOf(b.country);
            return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        });
    }, [filteredCompetitions, userCountry]);

    const activeFilterCount = (regionFilter !== 'ALL' ? 1 : 0) + (typeFilter !== 'ALL' ? 1 : 0);

    const resetFilters = () => {
        setSearchQuery('');
        setRegionFilter('ALL');
        setTypeFilter('ALL');
    };

    const handleSelectComp = (id: string) => {
        setSelectedCompetitionId(id);
        setActiveTab('CURRENT');
    };

    const selectedLogo = useMemo(() => {
        if (!selectedCompDef) return ResourceFallback.competitionLogo('Torneo');
        return customPacksService.resolveCompetitionLogo(selectedCompDef.id, selectedCompDef.name, selectedCompDef.logo) || ResourceFallback.competitionLogo(selectedCompDef.name);
    }, [selectedCompDef, packsVersion]);

    const selectedAccent = selectedCompDef ? getCompAccent(selectedCompDef) : ACCENTS.amber;

    const REGION_PILLS: { id: RegionFilter; label: string }[] = [
        { id: 'ALL', label: 'Todos' },
        { id: 'MY_COUNTRY', label: userCountry },
        { id: 'INTERNATIONAL', label: 'Internacional' },
        { id: 'AMERICA', label: 'América' },
        { id: 'EUROPA', label: 'Europa' },
    ];

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4 pb-24 animate-fade-in max-w-5xl mx-auto">
            {/* 1. HEADER */}
            <header className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">Torneos</h1>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        Temporada {gameState.season} · Semana {gameState.currentWeek}
                    </span>
                </div>
                <button
                    onClick={() => setActiveTab(activeTab === 'EXPLORE' ? 'CURRENT' : 'EXPLORE')}
                    className="flex items-center gap-2.5 pl-2.5 pr-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 hover:border-[var(--apex-gold)]/40 text-left max-w-[200px] sm:max-w-[240px]"
                    title="Explorar todos los torneos"
                >
                    <div className={`w-7 h-7 rounded-lg p-1 border flex items-center justify-center shrink-0 ${selectedAccent.tint}`}>
                        <img
                            src={selectedLogo}
                            alt=""
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.src = ResourceFallback.competitionLogo(selectedCompDef?.name || 'Torneo'); }}
                        />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">
                            {activeTab === 'EXPLORE' ? 'Volver a' : 'Torneo activo'}
                        </span>
                        <span className="text-xs font-black text-white leading-none block truncate">
                            {selectedCompDef?.name}
                        </span>
                    </div>
                </button>
            </header>

            {/* 2. STICKY TABS */}
            <nav className="sticky top-0 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-1.5 bg-[var(--apex-darker,#070A13)]/95 backdrop-blur">
                <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-2xl">
                    {([
                        { id: 'CURRENT', label: 'Torneo' },
                        { id: 'EXPLORE', label: 'Explorar' },
                        { id: 'RANKINGS', label: 'Rankings' },
                    ] as const).map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`h-10 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center ${
                                activeTab === t.id ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* TAB 1: TORNEO ACTUAL */}
            {activeTab === 'CURRENT' && selectedCompDef && (
                <div className="space-y-3">
                    {/* Colorful Identity Banner for Active Competition */}
                    <div className={`apex-card relative overflow-hidden p-3.5 sm:p-4 bg-gradient-to-r ${selectedAccent.gradient}`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${selectedAccent.bar}`} />
                        <div className="flex items-center justify-between gap-3 pl-1.5">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-12 h-12 rounded-2xl p-2 border flex items-center justify-center shrink-0 ${selectedAccent.tint}`}>
                                    <img
                                        src={selectedLogo}
                                        alt={selectedCompDef.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => { e.currentTarget.src = ResourceFallback.competitionLogo(selectedCompDef?.name || 'Torneo'); }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                                            {selectedCompDef.name}
                                        </h2>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${selectedAccent.badge}`}>
                                            {getCompTypeLabel(selectedCompDef)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                        {selectedCompDef.country && (
                                            <img
                                                src={resourceManager.countryFlag(selectedCompDef.country)}
                                                alt=""
                                                className="w-3.5 h-2.5 object-cover rounded-[2px]"
                                            />
                                        )}
                                        <span className="font-semibold text-slate-300">
                                            {selectedCompDef.country || 'Internacional'}
                                        </span>
                                        <span>·</span>
                                        <span>{getLiveStatus(selectedCompDef).label}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setActiveTab('EXPLORE')}
                                className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold shrink-0 flex items-center gap-1.5"
                            >
                                <Globe className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Cambiar</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Peer Pills (Same Country / International) */}
                    {domesticPeers.length > 1 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
                            {domesticPeers.map(comp => {
                                const isActive = comp.id === selectedCompetitionId;
                                const peerLogo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                                return (
                                    <button
                                        key={comp.id}
                                        onClick={() => setSelectedCompetitionId(comp.id)}
                                        className={`h-8 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                                            isActive ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <img
                                            src={peerLogo}
                                            alt=""
                                            className="w-3.5 h-3.5 object-contain shrink-0"
                                            onError={(e) => { e.currentTarget.src = ResourceFallback.competitionLogo(selectedCompDef?.name || 'Torneo'); }}
                                        />
                                        <span>{comp.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Competition Content */}
                    <div className="w-full min-w-0">
                        {selectedCompDef.type === 'LEAGUE' ? (
                            <LeagueTable
                                table={gameState.leagueTables[selectedCompDef.id]}
                                title={selectedCompDef.name}
                                logoPath={selectedCompDef.logo}
                                isFirstDiv={selectedCompDef.isFirstDiv || false}
                                leagueId={selectedCompDef.id}
                                gameState={gameState}
                            />
                        ) : selectedCompDef.type === 'CUP' && selectedCompDef.cupKey ? (
                            <CupView
                                cup={(gameState.cups as any)[selectedCompDef.cupKey]}
                                gameState={gameState}
                            />
                        ) : null}
                    </div>
                </div>
            )}

            {/* TAB 2: EXPLORAR TORNEOS */}
            {activeTab === 'EXPLORE' && (
                <div className="space-y-3">
                    {/* Search + Filter Button */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            <input
                                type="search"
                                inputMode="search"
                                placeholder="Liga, copa, país o club…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-11 pl-10 pr-9 bg-[#0D1220] border border-white/10 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]/60"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Limpiar búsqueda"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setFiltersOpen(true)}
                            className={`relative h-11 px-3.5 rounded-2xl border flex items-center gap-2 text-sm font-bold shrink-0 ${
                                activeFilterCount
                                    ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]/40 text-[var(--apex-gold)]'
                                    : 'bg-[#0D1220] border-white/10 text-slate-300'
                            }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="hidden sm:inline">Filtros</span>
                            {activeFilterCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-[var(--apex-gold)] text-black text-[10px] font-black flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Quick Region Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
                        {REGION_PILLS.map(pill => (
                            <button
                                key={pill.id}
                                onClick={() => setRegionFilter(pill.id)}
                                className={`h-8 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                                    regionFilter === pill.id ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                {pill.label}
                            </button>
                        ))}
                    </div>

                    {/* Result Summary */}
                    <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-semibold">
                        <span>{filteredCompetitions.length} torneos disponibles</span>
                        {typeFilter !== 'ALL' && (
                            <span className="text-[var(--apex-gold)]">{TYPE_FILTERS.find(t => t.id === typeFilter)?.label}</span>
                        )}
                    </div>

                    {filteredCompetitions.length === 0 ? (
                        <div className="apex-card">
                            <EmptyState
                                icon={<SearchX className="w-6 h-6" />}
                                title="Sin torneos"
                                text="Prueba buscando otro país, liga, copa o nombre de club."
                                action={
                                    <button onClick={resetFilters} className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold">
                                        Limpiar filtros
                                    </button>
                                }
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Internacionales: Visual Colorful Cards */}
                            {internationalEntries.length > 0 && (
                                <section className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Copas Internacionales
                                        </h2>
                                        <span className="text-[11px] text-slate-500 font-semibold">{internationalEntries.length}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                        {internationalEntries.map(({ comp }) => {
                                            const accent = getCompAccent(comp);
                                            const logo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                                            const status = getLiveStatus(comp);
                                            const isSelected = comp.id === selectedCompetitionId;

                                            return (
                                                <button
                                                    key={comp.id}
                                                    onClick={() => handleSelectComp(comp.id)}
                                                    className={`apex-card relative overflow-hidden p-3.5 text-left flex items-center gap-3 transition-colors bg-gradient-to-r ${accent.gradient} ${
                                                        isSelected ? 'border-[var(--apex-gold)]/60' : 'hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent.bar}`} />
                                                    <div className={`w-11 h-11 rounded-xl p-1.5 border flex items-center justify-center shrink-0 ml-1 ${accent.tint}`}>
                                                        <img
                                                            src={logo}
                                                            alt={comp.name}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => { e.currentTarget.src = ResourceFallback.competitionLogo(selectedCompDef?.name || 'Torneo'); }}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-white truncate">{comp.name}</p>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                                                            {status.team && (
                                                                <span className="w-3.5 h-3.5 inline-flex shrink-0">
                                                                    <TeamLogo team={status.team} />
                                                                </span>
                                                            )}
                                                            <span className="truncate">{status.label}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* Nacionales Agrupadas por País */}
                            {groupedByCountry.length > 0 && (
                                <section className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Ligas y Copas Nacionales
                                        </h2>
                                        <span className="text-[11px] text-slate-500 font-semibold">{groupedByCountry.length} países</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {groupedByCountry.map(group => {
                                            const isMyCountry = group.country === userCountry;
                                            return (
                                                <div
                                                    key={group.country}
                                                    className={`apex-card overflow-hidden ${isMyCountry ? 'border-[var(--apex-gold)]/30' : ''}`}
                                                >
                                                    <div className="px-3.5 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={resourceManager.countryFlag(group.country)}
                                                                alt={group.country}
                                                                className="w-5 h-3.5 object-cover rounded-[2px]"
                                                            />
                                                            <span className="text-xs font-black text-white tracking-tight">
                                                                {group.country}
                                                            </span>
                                                            {isMyCountry && (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[var(--apex-gold)]/15 text-[var(--apex-gold)]">
                                                                    Tu país
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] font-semibold text-slate-500">
                                                            {group.entries.length} {group.entries.length === 1 ? 'torneo' : 'torneos'}
                                                        </span>
                                                    </div>

                                                    <ul className="divide-y divide-white/5">
                                                        {group.entries.map(({ comp, matchedClub }) => {
                                                            const accent = getCompAccent(comp);
                                                            const logo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                                                            const status = getLiveStatus(comp);
                                                            const isUserLeague = comp.id === playerTeamLeague;
                                                            const isSelected = comp.id === selectedCompetitionId;

                                                            return (
                                                                <li key={comp.id}>
                                                                    <button
                                                                        onClick={() => handleSelectComp(comp.id)}
                                                                        className={`relative w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors ${
                                                                            isSelected ? 'bg-[var(--apex-gold)]/10' : 'hover:bg-white/[0.03] active:bg-white/[0.06]'
                                                                        }`}
                                                                    >
                                                                        <span className={`w-1 h-8 rounded-full shrink-0 ${accent.bar}`} />
                                                                        <div className={`w-10 h-10 rounded-xl p-1.5 border flex items-center justify-center shrink-0 ${accent.tint}`}>
                                                                            <img
                                                                                src={logo}
                                                                                alt={comp.name}
                                                                                className="w-full h-full object-contain"
                                                                                onError={(e) => { e.currentTarget.src = ResourceFallback.competitionLogo(selectedCompDef?.name || 'Torneo'); }}
                                                                            />
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <p className="text-sm font-bold text-white truncate">{comp.name}</p>
                                                                                {isUserLeague && (
                                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[var(--apex-gold)] text-slate-950 shrink-0">
                                                                                        Tu liga
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                                                                                {matchedClub ? (
                                                                                    <span className="text-[var(--apex-gold)] font-semibold truncate">
                                                                                        Club: {matchedClub}
                                                                                    </span>
                                                                                ) : (
                                                                                    <>
                                                                                        {status.team && (
                                                                                            <span className="w-3.5 h-3.5 inline-flex shrink-0">
                                                                                                <TeamLogo team={status.team} />
                                                                                            </span>
                                                                                        )}
                                                                                        <span className="truncate">{status.label}</span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${accent.badge}`}>
                                                                            {getCompTypeLabel(comp)}
                                                                        </span>
                                                                        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                                                                    </button>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}

                    {/* Filters BottomSheet */}
                    <BottomSheet
                        open={filtersOpen}
                        onClose={() => setFiltersOpen(false)}
                        title="Filtros"
                        footer={
                            <div className="flex gap-2">
                                <button onClick={resetFilters} className="flex-1 h-11 rounded-xl bg-white/5 text-slate-300 text-sm font-bold">
                                    Restablecer
                                </button>
                                <button onClick={() => setFiltersOpen(false)} className="flex-[2] h-11 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-sm font-black">
                                    Ver {filteredCompetitions.length} torneos
                                </button>
                            </div>
                        }
                    >
                        <div className="space-y-5">
                            <section>
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Región</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {REGION_PILLS.map(r => (
                                        <button
                                            key={r.id}
                                            onClick={() => setRegionFilter(r.id)}
                                            className={`h-10 rounded-xl text-xs font-bold border ${
                                                regionFilter === r.id
                                                    ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]'
                                                    : 'bg-white/[0.03] border-white/5 text-slate-300'
                                            }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de torneo</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {TYPE_FILTERS.map(tf => (
                                        <button
                                            key={tf.id}
                                            onClick={() => setTypeFilter(tf.id)}
                                            className={`h-10 rounded-xl text-xs font-bold border ${
                                                typeFilter === tf.id
                                                    ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]'
                                                    : 'bg-white/[0.03] border-white/5 text-slate-300'
                                            }`}
                                        >
                                            {tf.label}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </BottomSheet>
                </div>
            )}

            {/* TAB 3: RANKINGS */}
            {activeTab === 'RANKINGS' && (
                <div className="w-full min-w-0">
                    <ClubRankingsView gameState={gameState} />
                </div>
            )}
        </div>
    );
};
