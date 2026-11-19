import React, { useState, useMemo } from 'react';
import { GameState } from '../../types';
import { TrophyIcon } from '../icons';
import { ALL_COMPETITIONS, CompetitionItem } from './league/constants';
import { LeagueTable } from './league/LeagueTable';
import { CupView } from './league/CupView';
import { customPacksService } from '../../services/customPacks/packService';
import { Search, Trophy, Globe, ChevronRight, X, Award, ArrowLeft, Star } from 'lucide-react';
import { ClubRankingsView } from './league/ClubRankingsView';

interface LeagueScreenProps {
    gameState: GameState;
}

type RegionTab = 'ALL' | 'AMERICA' | 'EUROPA' | 'INTERNATIONAL';

const AMERICA_COUNTRIES = new Set(['Argentina', 'Brasil', 'Chile', 'Colombia', 'Paraguay', 'México']);
const EUROPA_COUNTRIES = new Set(['Inglaterra', 'España', 'Alemania', 'Italia', 'Francia']);

const COUNTRY_ORDER = [
    'Argentina', 'Inglaterra', 'España', 'Brasil', 'Italia', 'Alemania',
    'Francia', 'México', 'Colombia', 'Chile', 'Paraguay'
];

export const LeagueScreen: React.FC<LeagueScreenProps> = ({ gameState }) => {
    const playerTeamLeague = gameState.team.leagueId;

    const nextWeek = gameState.currentWeek;
    const isMidweek = gameState.currentTurn === 'midweek';
    const nextMatch = gameState.schedule.find(
        m => !m.result && m.week === nextWeek && !!m.isMidweek === isMidweek && (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id)
    );

    const initialCompetitionId = useMemo(() => {
        if (nextMatch && (nextMatch as any).competition) {
            const compMatch = ALL_COMPETITIONS.find(c => 
                c.id === (nextMatch as any).competition || 
                c.cupKey === (nextMatch as any).competition ||
                c.name.toLowerCase() === ((nextMatch as any).competition || '').toLowerCase()
            );
            if (compMatch) return compMatch.id;
        }
        return playerTeamLeague || 'PREMIER_LEAGUE';
    }, [nextMatch, playerTeamLeague]);

    const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>(initialCompetitionId);
    const [isExplorerOpen, setIsExplorerOpen] = useState(false);
    const [regionTab, setRegionTab] = useState<RegionTab>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const selectedCompDef = useMemo(() => {
        return ALL_COMPETITIONS.find(c => c.id === selectedCompetitionId);
    }, [selectedCompetitionId]);

    const userCountry = useMemo(() => {
        const myLeague = ALL_COMPETITIONS.find(c => c.id === playerTeamLeague);
        return myLeague?.country || 'Argentina';
    }, [playerTeamLeague]);

    // Quick switcher tabs for currently viewed country/category
    const domesticPeers = useMemo(() => {
        if (!selectedCompDef) return [];
        if (selectedCompDef.category === 'INTERNATIONAL') {
            return ALL_COMPETITIONS.filter(c => c.category === 'INTERNATIONAL');
        }
        return ALL_COMPETITIONS.filter(c => c.country === selectedCompDef.country);
    }, [selectedCompDef]);

    // User's own country competitions for quick access
    const myCountryCompetitions = useMemo(() => {
        return ALL_COMPETITIONS.filter(c => c.country === userCountry);
    }, [userCountry]);

    // Filter competitions by search query and region tab
    const filteredCompetitions = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return ALL_COMPETITIONS.filter(comp => {
            if (q) {
                const matchName = comp.name.toLowerCase().includes(q);
                const matchCountry = comp.country?.toLowerCase().includes(q);
                if (!matchName && !matchCountry) return false;
            }

            if (regionTab === 'INTERNATIONAL') {
                return comp.category === 'INTERNATIONAL';
            }
            if (regionTab === 'AMERICA') {
                if (comp.category === 'INTERNATIONAL') {
                    return comp.id === 'COPA_LIBERTADORES' || comp.id === 'COPA_SUDAMERICANA' || comp.id === 'COPA_INTERCONTINENTAL' || comp.id === 'CLUB_RANKINGS';
                }
                return !!comp.country && AMERICA_COUNTRIES.has(comp.country);
            }
            if (regionTab === 'EUROPA') {
                if (comp.category === 'INTERNATIONAL') {
                    return comp.id === 'CHAMPIONS_LEAGUE' || comp.id === 'COPA_INTERCONTINENTAL' || comp.id === 'CLUB_RANKINGS';
                }
                return !!comp.country && EUROPA_COUNTRIES.has(comp.country);
            }
            return true;
        });
    }, [searchQuery, regionTab]);

    const internationalComps = useMemo(() => {
        return filteredCompetitions.filter(c => c.category === 'INTERNATIONAL');
    }, [filteredCompetitions]);

    const groupedByCountry = useMemo(() => {
        const map = new Map<string, { country: string; flagUrl?: string; comps: CompetitionItem[] }>();
        for (const comp of filteredCompetitions) {
            if (comp.category !== 'DOMESTIC' || !comp.country) continue;
            if (!map.has(comp.country)) {
                map.set(comp.country, { country: comp.country, flagUrl: comp.flagUrl, comps: [] });
            }
            map.get(comp.country)!.comps.push(comp);
        }

        // Sort countries putting user's country first, then COUNTRY_ORDER
        return Array.from(map.values()).sort((a, b) => {
            if (a.country === userCountry) return -1;
            if (b.country === userCountry) return 1;
            const idxA = COUNTRY_ORDER.indexOf(a.country);
            const idxB = COUNTRY_ORDER.indexOf(b.country);
            return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        });
    }, [filteredCompetitions, userCountry]);

    const handleSelectComp = (id: string) => {
        setSelectedCompetitionId(id);
        setSearchQuery('');
        setIsExplorerOpen(false);
    };

    const resolvedLogo = useMemo(() => {
        if (selectedCompetitionId === 'CLUB_RANKINGS') return '';
        return selectedCompDef 
            ? (customPacksService.resolveCompetitionLogo(selectedCompDef.id, selectedCompDef.name, selectedCompDef.logo) || '/sinlogo.png')
            : '/sinlogo.png';
    }, [selectedCompDef, selectedCompetitionId]);

    const getBadgeForComp = (comp: CompetitionItem) => {
        if (comp.id === 'CLUB_RANKINGS') {
            return { label: 'Coeficientes', cls: 'bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border-[var(--apex-gold)]/30' };
        }
        if (comp.category === 'INTERNATIONAL') {
            return { label: 'Internacional', cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
        }
        if (comp.type === 'CUP') {
            return { label: 'Copa Nacional', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
        }
        if (comp.isFirstDiv) {
            return { label: '1ª División', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
        }
        return { label: '2ª División', cls: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
    };

    // =========================================================================
    // VISTA EXPLORADOR DE COMPETICIONES (AGRUPADO, ORDENADO Y LEGIBLE)
    // =========================================================================
    if (isExplorerOpen) {
        return (
            <div className="p-3 sm:p-5 md:p-6 max-w-7xl w-full mx-auto space-y-5 pb-24 animate-fade-in">
                {/* Barra Superior: Volver, Título, Buscador y Pestañas de Región */}
                <div className="apex-card p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setIsExplorerOpen(false); setSearchQuery(''); }}
                                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0"
                            >
                                <ArrowLeft className="w-4 h-4 text-[var(--apex-gold)]" />
                                <span>Volver</span>
                            </button>
                            <div>
                                <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                                    Competiciones y Torneos
                                </h1>
                                <p className="text-xs text-slate-400">
                                    Selecciona una liga, copa nacional o torneo internacional
                                </p>
                            </div>
                        </div>

                        {/* Buscador limpio */}
                        <div className="w-full md:w-72 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar país, liga o copa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 focus:border-[var(--apex-gold)] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Pestañas de Región (4 opciones claras en vez de 15 botones sueltos) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-white/5 no-scrollbar">
                        {([
                            { id: 'ALL', label: 'Todos los Torneos' },
                            { id: 'AMERICA', label: '🌎 Sudamérica y México' },
                            { id: 'EUROPA', label: '🌍 Europa' },
                            { id: 'INTERNATIONAL', label: '🏆 Copas Internacionales' },
                        ] as const).map(tab => {
                            const active = regionTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setRegionTab(tab.id)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                                        active
                                            ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                            : 'bg-black/30 text-slate-300 hover:text-white hover:bg-white/5 border border-white/5'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Acceso Rápido: Tu País Actual */}
                {!searchQuery.trim() && regionTab === 'ALL' && myCountryCompetitions.length > 0 && (
                    <div className="apex-card p-4 border-[var(--apex-gold)]/30">
                        <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4 text-[var(--apex-gold)] fill-[var(--apex-gold)]" />
                            <span className="text-xs font-black uppercase tracking-wider text-white">
                                Tu País ({userCountry})
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {myCountryCompetitions.map(comp => {
                                const isSelected = selectedCompetitionId === comp.id;
                                const compLogo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                                const badge = getBadgeForComp(comp);
                                return (
                                    <button
                                        key={comp.id}
                                        onClick={() => handleSelectComp(comp.id)}
                                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                                            isSelected
                                                ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]'
                                                : 'bg-black/30 hover:bg-white/5 border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-white/10 p-1.5 flex items-center justify-center shrink-0">
                                                <img
                                                    src={compLogo}
                                                    alt={comp.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => { e.currentTarget.src = '/sinlogo.png'; }}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-white truncate">{comp.name}</div>
                                                <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${badge.cls}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Sección 1: Copas Internacionales y Rankings */}
                {internationalComps.length > 0 && (
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2 px-1">
                            <Globe className="w-4 h-4 text-[var(--apex-gold)]" />
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
                                Copas Internacionales y Rankings
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {internationalComps.map(comp => {
                                const isSelected = selectedCompetitionId === comp.id;
                                const compLogo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                                const badge = getBadgeForComp(comp);

                                return (
                                    <button
                                        key={comp.id}
                                        onClick={() => handleSelectComp(comp.id)}
                                        className={`apex-card p-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group ${
                                            isSelected
                                                ? 'border-[var(--apex-gold)] bg-[var(--apex-gold)]/10'
                                                : 'hover:border-white/25'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 p-1.5 flex items-center justify-center shrink-0">
                                                {comp.id === 'CLUB_RANKINGS' ? (
                                                    <Award className="w-6 h-6 text-[var(--apex-gold)]" />
                                                ) : (
                                                    <img
                                                        src={compLogo}
                                                        alt={comp.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => { e.currentTarget.src = '/sinlogo.png'; }}
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[var(--apex-gold)] transition-colors">
                                                    {comp.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${badge.cls}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[var(--apex-gold)] shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Sección 2: Competiciones Nacionales Agrupadas por País */}
                {groupedByCountry.length > 0 && (
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2 px-1">
                            <Trophy className="w-4 h-4 text-[var(--apex-gold)]" />
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
                                Ligas y Copas por País ({groupedByCountry.length} países)
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {groupedByCountry.map(group => (
                                <div key={group.country} className="apex-card overflow-hidden flex flex-col">
                                    {/* Cabecera del País */}
                                    <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            {group.flagUrl && (
                                                <img
                                                    src={group.flagUrl}
                                                    alt={group.country}
                                                    className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm"
                                                />
                                            )}
                                            <span className="text-xs font-black text-white uppercase tracking-wide">
                                                {group.country}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-500">
                                            {group.comps.length} {group.comps.length === 1 ? 'torneo' : 'torneos'}
                                        </span>
                                    </div>

                                    {/* Lista de Torneos del País */}
                                    <div className="divide-y divide-white/5">
                                        {group.comps.map(comp => {
                                            const isSelected = selectedCompetitionId === comp.id;
                                            const isUserLeague = comp.id === playerTeamLeague;
                                            const compLogo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                                            const badge = getBadgeForComp(comp);

                                            return (
                                                <button
                                                    key={comp.id}
                                                    onClick={() => handleSelectComp(comp.id)}
                                                    className={`w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group ${
                                                        isSelected
                                                            ? 'bg-[var(--apex-gold)]/15'
                                                            : 'hover:bg-white/[0.03]'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-white/10 p-1 flex items-center justify-center shrink-0">
                                                            <img
                                                                src={compLogo}
                                                                alt={comp.name}
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => { e.currentTarget.src = '/sinlogo.png'; }}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[var(--apex-gold)] transition-colors">
                                                                    {comp.name}
                                                                </span>
                                                                {isUserLeague && (
                                                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[var(--apex-gold)] text-slate-950 uppercase">
                                                                        Tu Liga
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2.5 shrink-0">
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${badge.cls}`}>
                                                            {badge.label}
                                                        </span>
                                                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filteredCompetitions.length === 0 && (
                    <div className="apex-card p-12 text-center">
                        <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <h3 className="text-sm font-bold text-white">No se encontraron torneos</h3>
                        <p className="text-xs text-slate-400 mt-1">Intenta con otro término o cambia la región seleccionada.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setRegionTab('ALL'); }}
                            className="mt-4 px-4 py-2 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-xs font-black uppercase cursor-pointer"
                        >
                            Ver Todos
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // =========================================================================
    // VISTA PRINCIPAL: TABLA DE POSICIONES / CUADRO DE COPA / RANKINGS
    // =========================================================================
    return (
        <div className="px-2 sm:px-4 md:px-6 py-3 max-w-7xl w-full mx-auto space-y-3 pb-24 animate-fade-in">
            {/* Cabecera del Torneo Actual */}
            <div className="apex-card p-3.5 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 shrink-0 flex items-center justify-center p-1.5 rounded-xl bg-white/10 border border-white/10">
                            {selectedCompetitionId === 'CLUB_RANKINGS' ? (
                                <Award className="w-6 h-6 text-[var(--apex-gold)]" />
                            ) : (
                                <img
                                    src={resolvedLogo}
                                    alt=""
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.currentTarget.src = '/sinlogo.png'; }}
                                />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                                    {selectedCompetitionId === 'CLUB_RANKINGS' ? 'Rankings Oficiales de Clubes' : (selectedCompDef?.name || 'Competición')}
                                </h1>
                                {selectedCompDef && (
                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getBadgeForComp(selectedCompDef).cls}`}>
                                        {getBadgeForComp(selectedCompDef).label}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                {selectedCompDef?.flagUrl && (
                                    <img src={selectedCompDef.flagUrl} alt="" className="w-3.5 h-2.5 object-cover rounded-[1px]" />
                                )}
                                <span className="font-medium text-slate-300">
                                    {selectedCompetitionId === 'CLUB_RANKINGS' ? 'CONMEBOL / UEFA' : (selectedCompDef?.country || 'Internacional')}
                                </span>
                                <span>•</span>
                                <span>Temporada {gameState.season}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de Navegación de Torneos */}
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
                        <button
                            onClick={() => setSelectedCompetitionId('CLUB_RANKINGS')}
                            className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                selectedCompetitionId === 'CLUB_RANKINGS'
                                    ? 'bg-[var(--apex-gold)] text-slate-950 border-[var(--apex-gold)] font-black'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                        >
                            <Award className="w-3.5 h-3.5" />
                            <span>Rankings</span>
                        </button>

                        <button
                            onClick={() => setIsExplorerOpen(true)}
                            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[var(--apex-gold)] hover:bg-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Cambiar Torneo</span>
                        </button>
                    </div>
                </div>

                {/* Pestañas rápidas de los torneos del mismo país / región */}
                {domesticPeers.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-white/5 no-scrollbar">
                        {domesticPeers.map((comp) => {
                            const isSelected = selectedCompetitionId === comp.id;
                            const compLogo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                            return (
                                <button
                                    key={comp.id}
                                    onClick={() => handleSelectComp(comp.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
                                        isSelected
                                            ? 'bg-white/15 text-white border border-white/25'
                                            : 'bg-black/30 text-slate-400 hover:bg-white/5 hover:text-white border border-white/5'
                                    }`}
                                >
                                    <div className="w-4 h-4 shrink-0">
                                        <img
                                            src={compLogo}
                                            alt=""
                                            className="w-full h-full object-contain"
                                            onError={(e) => { e.currentTarget.src = '/sinlogo.png'; }}
                                        />
                                    </div>
                                    <span className="whitespace-nowrap">{comp.name}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Contenido de la Competición */}
            <div className="w-full min-w-0">
                {selectedCompetitionId === 'CLUB_RANKINGS' ? (
                    <ClubRankingsView gameState={gameState} />
                ) : !selectedCompDef ? (
                    <div className="apex-card p-12 text-center">
                        <TrophyIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <h3 className="text-sm font-bold text-white">Selecciona una competición</h3>
                    </div>
                ) : selectedCompDef.type === 'LEAGUE' ? (
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
    );
};
