import React, { useState, useMemo } from 'react';
import { GameState } from '../../types';
import { TrophyIcon } from '../icons';
import { ALL_COMPETITIONS, CompetitionItem } from './league/constants';
import { LeagueTable } from './league/LeagueTable';
import { CupView } from './league/CupView';
import { customPacksService } from '../../services/customPacks/packService';
import { Search, Trophy, Globe, ChevronRight, X, Award, ArrowLeft, Sparkles, Shield } from 'lucide-react';
import { ClubRankingsView } from './league/ClubRankingsView';

interface LeagueScreenProps {
    gameState: GameState;
}

interface FilterCategory {
    id: string;
    label: string;
    flag?: string;
    isSpecial?: boolean;
    isIntl?: boolean;
    isRanking?: boolean;
    region?: 'SPECIAL' | 'SUDAMERICA' | 'EUROPA';
}

const SPECIAL_CATEGORIES: FilterCategory[] = [
    { id: 'ALL', label: 'Todos los Torneos', isSpecial: true, region: 'SPECIAL' },
    { id: 'MY_LEAGUE', label: 'Mi Liga / País', isSpecial: true, region: 'SPECIAL' },
    { id: 'INTERNATIONAL', label: 'Copas Internacionales', isIntl: true, region: 'SPECIAL' },
    { id: 'CLUB_RANKINGS', label: 'Rankings Oficiales', isRanking: true, region: 'SPECIAL' },
];

const SOUTH_AMERICA_COUNTRIES: FilterCategory[] = [
    { id: 'Argentina', label: 'Argentina', flag: 'https://flagcdn.com/ar.svg', region: 'SUDAMERICA' },
    { id: 'Brasil', label: 'Brasil', flag: 'https://flagcdn.com/br.svg', region: 'SUDAMERICA' },
    { id: 'Chile', label: 'Chile', flag: 'https://flagcdn.com/cl.svg', region: 'SUDAMERICA' },
    { id: 'Colombia', label: 'Colombia', flag: 'https://flagcdn.com/co.svg', region: 'SUDAMERICA' },
    { id: 'Paraguay', label: 'Paraguay', flag: 'https://flagcdn.com/py.svg', region: 'SUDAMERICA' },
    { id: 'México', label: 'México', flag: 'https://flagcdn.com/mx.svg', region: 'SUDAMERICA' },
];

const EUROPE_COUNTRIES: FilterCategory[] = [
    { id: 'Inglaterra', label: 'Inglaterra', flag: 'https://flagcdn.com/gb-eng.svg', region: 'EUROPA' },
    { id: 'España', label: 'España', flag: 'https://flagcdn.com/es.svg', region: 'EUROPA' },
    { id: 'Alemania', label: 'Alemania', flag: 'https://flagcdn.com/de.svg', region: 'EUROPA' },
    { id: 'Italia', label: 'Italia', flag: 'https://flagcdn.com/it.svg', region: 'EUROPA' },
    { id: 'Francia', label: 'Francia', flag: 'https://flagcdn.com/fr.svg', region: 'EUROPA' },
];

export const LeagueScreen: React.FC<LeagueScreenProps> = ({ gameState }) => {
    const playerTeamLeague = gameState.team.leagueId;

    // Determine league for next match or active league
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
    const [activeCountry, setActiveCountry] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const selectedCompDef = useMemo(() => {
        return ALL_COMPETITIONS.find(c => c.id === selectedCompetitionId);
    }, [selectedCompetitionId]);

    // Fast domestic peers for the currently viewed competition
    const domesticPeers = useMemo(() => {
        if (!selectedCompDef) return [];
        if (selectedCompDef.category === 'INTERNATIONAL') {
            return ALL_COMPETITIONS.filter(c => c.category === 'INTERNATIONAL');
        }
        const country = selectedCompDef.country;
        return ALL_COMPETITIONS.filter(c => c.country === country);
    }, [selectedCompDef]);

    // Competitions for the full-screen explorer
    const explorerCompetitions = useMemo(() => {
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            return ALL_COMPETITIONS.filter(c => 
                c.name.toLowerCase().includes(q) || 
                (c.country && c.country.toLowerCase().includes(q)) ||
                (c.id && c.id.toLowerCase().includes(q))
            );
        }
        if (activeCountry === 'ALL') {
            return ALL_COMPETITIONS;
        }
        if (activeCountry === 'MY_LEAGUE') {
            const myLeague = ALL_COMPETITIONS.find(c => c.id === playerTeamLeague);
            const myCountry = myLeague?.country;
            return ALL_COMPETITIONS.filter(c => c.id === playerTeamLeague || (myCountry && c.country === myCountry));
        }
        if (activeCountry === 'INTERNATIONAL') {
            return ALL_COMPETITIONS.filter(c => c.category === 'INTERNATIONAL' && c.id !== 'CLUB_RANKINGS');
        }
        if (activeCountry === 'CLUB_RANKINGS') {
            return ALL_COMPETITIONS.filter(c => c.id === 'CLUB_RANKINGS');
        }
        return ALL_COMPETITIONS.filter(c => c.country === activeCountry);
    }, [activeCountry, searchQuery, playerTeamLeague]);

    const handleSelectComp = (id: string, country?: string) => {
        setSelectedCompetitionId(id);
        setSearchQuery('');
        setIsExplorerOpen(false);
        if (country) {
            setActiveCountry(country);
        }
    };

    const resolvedLogo = useMemo(() => {
        if (selectedCompetitionId === 'CLUB_RANKINGS') return '';
        return selectedCompDef 
            ? (customPacksService.resolveCompetitionLogo(selectedCompDef.id, selectedCompDef.name, selectedCompDef.logo) || '/sinlogo.png')
            : '/sinlogo.png';
    }, [selectedCompDef, selectedCompetitionId]);

    // =========================================================================
    // VISTA A PANTALLA COMPLETA: EXPLORADOR GLOBAL DE TORNEOS Y COPAS
    // =========================================================================
    if (isExplorerOpen) {
        return (
            <div className="px-2 sm:px-4 md:px-6 py-3 max-w-[1400px] w-full mx-auto min-h-screen animate-fade-in space-y-4">
                {/* Command Bar Superior */}
                <div className="rounded-2xl bg-[#0E131F] border border-white/10 p-4 sm:p-5 shadow-2xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Botón Volver y Título */}
                        <div className="flex items-center gap-3.5">
                            <button
                                onClick={() => { setIsExplorerOpen(false); setSearchQuery(''); }}
                                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider active:scale-95 cursor-pointer shrink-0 shadow-sm"
                                title="Volver a la vista de competición"
                            >
                                <ArrowLeft className="w-4 h-4 text-[var(--apex-gold)]" />
                                <span>Volver</span>
                            </button>

                            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/30 flex items-center justify-center text-[var(--apex-gold)] shadow-inner shrink-0">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                        Explorador Global de Torneos
                                    </h1>
                                    <p className="text-xs text-slate-400">
                                        {ALL_COMPETITIONS.length} Competiciones Oficiales • Ligas de 1ª y 2ª División, Copas y Torneos Continentales
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Buscador Rápido */}
                        <div className="w-full md:w-80 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar liga, copa o país (ej. Colombia, Chile, Premier)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                className="w-full bg-[#141B2D] border border-white/10 focus:border-[var(--apex-gold)] rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Selector de Países y Regiones con Banderas */}
                    {!searchQuery.trim() && (
                        <div className="space-y-2.5 pt-3 border-t border-white/5">
                            {/* 1. Categorías Especiales */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1 shrink-0">
                                    Filtro:
                                </span>
                                {SPECIAL_CATEGORIES.map(cat => {
                                    const isActive = activeCountry === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCountry(cat.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-[var(--apex-gold)] text-slate-950 font-black shadow-lg scale-105'
                                                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/5'
                                            }`}
                                        >
                                            {cat.id === 'ALL' && <Globe className="w-3.5 h-3.5" />}
                                            {cat.id === 'MY_LEAGUE' && <span>🌟</span>}
                                            {cat.id === 'INTERNATIONAL' && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                                            {cat.id === 'CLUB_RANKINGS' && <Award className="w-3.5 h-3.5 text-[var(--apex-gold)]" />}
                                            <span>{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 2. Sudamérica */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/90 mr-1 shrink-0 flex items-center gap-1">
                                    <span>🌎</span> Sudamérica:
                                </span>
                                {SOUTH_AMERICA_COUNTRIES.map(cty => {
                                    const isActive = activeCountry === cty.id;
                                    return (
                                        <button
                                            key={cty.id}
                                            onClick={() => setActiveCountry(cty.id)}
                                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-[var(--apex-gold)] text-slate-950 font-black shadow-lg scale-105'
                                                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/5'
                                            }`}
                                        >
                                            <img src={cty.flag} alt={cty.label} className="w-4 h-3 object-cover rounded-[2px] shadow-sm" />
                                            <span>{cty.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 3. Europa */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400/90 mr-1 shrink-0 flex items-center gap-1">
                                    <span>🌍</span> Europa:
                                </span>
                                {EUROPE_COUNTRIES.map(cty => {
                                    const isActive = activeCountry === cty.id;
                                    return (
                                        <button
                                            key={cty.id}
                                            onClick={() => setActiveCountry(cty.id)}
                                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-[var(--apex-gold)] text-slate-950 font-black shadow-lg scale-105'
                                                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/5'
                                            }`}
                                        >
                                            <img src={cty.flag} alt={cty.label} className="w-4 h-3 object-cover rounded-[2px] shadow-sm" />
                                            <span>{cty.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Grid de Competiciones */}
                {explorerCompetitions.length === 0 ? (
                    <div className="py-20 text-center bg-[#0E131F] border border-white/10 rounded-2xl p-6">
                        <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-white uppercase tracking-wider">No se encontraron torneos</h3>
                        <p className="text-xs text-slate-400 mt-1">Prueba con otra búsqueda o selecciona un país diferente.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCountry('ALL'); }}
                            className="mt-4 px-4 py-2 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                        >
                            Ver Todos los Torneos
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                        {explorerCompetitions.map(comp => {
                            const isSelected = selectedCompetitionId === comp.id;
                            const isUserTeamComp = comp.id === playerTeamLeague;
                            const compLogo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                            
                            return (
                                <button
                                    key={comp.id}
                                    onClick={() => handleSelectComp(comp.id, comp.country || 'INTERNATIONAL')}
                                    className={`relative group flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-1 cursor-pointer overflow-hidden ${
                                        isSelected
                                            ? 'bg-gradient-to-b from-[#1E1B18] to-[#121622] border-[var(--apex-gold)] shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-[var(--apex-gold)]'
                                            : 'bg-[#0E131F]/90 hover:bg-[#131A2D] border-white/10 hover:border-[var(--apex-gold)]/50 shadow-lg'
                                    }`}
                                >
                                    {/* Resplandor sutil para torneo del usuario */}
                                    {isUserTeamComp && (
                                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-[var(--apex-gold)]/10 rounded-full blur-xl pointer-events-none" />
                                    )}

                                    <div>
                                        {/* Fila Superior: Bandera del País + Badge de Categoría */}
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                {comp.flagUrl ? (
                                                    <img src={comp.flagUrl} alt="" className="w-4 h-3 object-cover rounded-[2px] shadow-sm shrink-0" />
                                                ) : (
                                                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                )}
                                                <span className="text-[11px] font-bold text-slate-300 truncate">
                                                    {comp.country || 'Internacional'}
                                                </span>
                                            </div>

                                            {comp.id === 'CLUB_RANKINGS' ? (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 shrink-0">
                                                    Ranking
                                                </span>
                                            ) : comp.category === 'INTERNATIONAL' ? (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                                                    Continental
                                                </span>
                                            ) : comp.type === 'CUP' ? (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                                    Copa
                                                </span>
                                            ) : comp.isFirstDiv ? (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 shrink-0">
                                                    1ª Div
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                                                    Ascenso
                                                </span>
                                            )}
                                        </div>

                                        {/* Logo y Nombre del Torneo */}
                                        <div className="flex items-center gap-3.5 py-1">
                                            <div className="w-12 h-12 shrink-0 flex items-center justify-center p-1.5 rounded-xl bg-white/[0.04] border border-white/10 group-hover:scale-105 transition-transform">
                                                {comp.id === 'CLUB_RANKINGS' ? (
                                                    <Award className="w-7 h-7 text-[var(--apex-gold)]" />
                                                ) : (
                                                    <img
                                                        src={compLogo}
                                                        alt={comp.name}
                                                        className="w-full h-full object-contain"
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => { e.currentTarget.src = '/sinlogo.png'; }}
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[var(--apex-gold)] transition-colors line-clamp-2">
                                                    {comp.name}
                                                </h3>
                                                {isUserTeamComp && (
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-[var(--apex-gold)] mt-0.5">
                                                        <Sparkles className="w-3 h-3" />
                                                        <span>Tu Liga Actual</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Barra de Acción Inferior */}
                                    <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-white transition-colors">
                                        <span className="font-semibold">
                                            {comp.id === 'CLUB_RANKINGS'
                                                ? 'Ver Clasificación'
                                                : comp.type === 'LEAGUE'
                                                ? 'Ver Tabla de Posiciones'
                                                : 'Ver Fase Eliminatoria'}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-[var(--apex-gold)] group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // =========================================================================
    // VISTA PRINCIPAL: TABLA DE POSICIONES / CUADRO DE COPA / RANKINGS
    // =========================================================================
    return (
        <div className="px-0 sm:px-4 md:px-6 py-2 sm:py-3 max-w-[1400px] w-full overflow-x-hidden mx-auto min-h-screen animate-fade-in space-y-2.5 sm:space-y-3">
            {/* Top Bar Compacta & Premium */}
            <div className="mx-2 sm:mx-0 rounded-2xl bg-[#0E131F] border border-white/10 p-3 sm:p-3.5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Competición Actual */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center p-1.5 rounded-xl bg-white/[0.04] border border-white/10 shadow-inner">
                            {selectedCompetitionId === 'CLUB_RANKINGS' ? (
                                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--apex-gold)]" />
                            ) : (
                                <img src={resolvedLogo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = '/sinlogo.png'; }} />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <h1 className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                                    {selectedCompetitionId === 'CLUB_RANKINGS' ? 'Rankings Oficiales de Clubes' : (selectedCompDef?.name || 'Tabla de Posiciones')}
                                </h1>
                                {selectedCompetitionId === 'CLUB_RANKINGS' ? (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 shrink-0">
                                        CONMEBOL / UEFA
                                    </span>
                                ) : selectedCompDef?.isFirstDiv ? (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 shrink-0">
                                        1ª Div
                                    </span>
                                ) : selectedCompDef?.type === 'CUP' ? (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                        Copa
                                    </span>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                                <span className="font-semibold text-slate-300">{selectedCompetitionId === 'CLUB_RANKINGS' ? 'Clasificación de Coeficientes' : (selectedCompDef?.country || 'Internacional')}</span>
                                <span>•</span>
                                <span>{selectedCompetitionId === 'CLUB_RANKINGS' ? 'Bombos de Copas Continentales' : (selectedCompDef?.type === 'LEAGUE' ? 'Tabla de Posiciones' : 'Fase Eliminatoria')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción / Búsqueda */}
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
                        {/* Botón Rankings Oficiales */}
                        <button
                            onClick={() => setSelectedCompetitionId('CLUB_RANKINGS')}
                            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
                                selectedCompetitionId === 'CLUB_RANKINGS'
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-lg font-black'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                            title="Ver Rankings Oficiales CONMEBOL y UEFA"
                        >
                            <Award className="w-4 h-4 text-[var(--apex-gold)]" />
                            <span>Rankings</span>
                        </button>

                        {/* Botón Principal: Explorador a Pantalla Completa */}
                        <button
                            onClick={() => { setActiveCountry('ALL'); setIsExplorerOpen(true); }}
                            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--apex-gold)]/20 to-amber-500/10 hover:from-[var(--apex-gold)]/30 hover:to-amber-500/20 border border-[var(--apex-gold)]/40 hover:border-[var(--apex-gold)] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
                            title="Abrir explorador de todas las ligas y países"
                        >
                            <Search className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                            <span>Explorar Ligas</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                        </button>
                    </div>
                </div>

                {/* Sub-Pills Limpias y Compactas (Torneos locales del país actual + botón rápido de exploración) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 mt-2.5 border-t border-white/5 custom-scrollbar">
                    {domesticPeers.map((comp) => {
                        const isSelected = selectedCompetitionId === comp.id;
                        const compLogo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                        return (
                            <button
                                key={comp.id}
                                onClick={() => handleSelectComp(comp.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-[var(--apex-gold)]/20 text-white border border-[var(--apex-gold)]/50 shadow-sm'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-transparent'
                                }`}
                            >
                                <div className="w-4 h-4 shrink-0">
                                    <img src={compLogo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = '/sinlogo.png'; }} />
                                </div>
                                <span className="whitespace-nowrap">{comp.name}</span>
                            </button>
                        );
                    })}

                    <button
                        onClick={() => { setActiveCountry('ALL'); setIsExplorerOpen(true); }}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide flex items-center gap-1.5 shrink-0 bg-white/[0.03] hover:bg-white/10 text-[var(--apex-gold)] border border-dashed border-[var(--apex-gold)]/30 hover:border-[var(--apex-gold)] transition-colors cursor-pointer"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        <span>+ Más Países</span>
                    </button>
                </div>
            </div>

            {/* Contenido Principal: Tabla de Posiciones / Vista de Copa / Rankings */}
            <div className="w-full min-w-0 animate-fade-in">
                {selectedCompetitionId === 'CLUB_RANKINGS' ? (
                    <ClubRankingsView gameState={gameState} />
                ) : !selectedCompDef ? (
                    <div className="flex flex-col items-center justify-center min-h-[350px] bg-[#0E131F] border border-white/10 rounded-2xl p-6 text-center">
                        <TrophyIcon className="w-12 h-12 text-slate-600 mb-3" />
                        <h3 className="text-base font-black text-white uppercase tracking-wider">Selecciona una competición</h3>
                        <p className="text-slate-400 text-xs mt-1">Usa los botones superiores para cambiar de liga o país.</p>
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

