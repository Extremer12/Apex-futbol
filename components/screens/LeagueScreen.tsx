import React, { useState, useMemo } from 'react';
import { GameState } from '../../types';
import { TrophyIcon } from '../icons';
import { ALL_COMPETITIONS } from './league/constants';
import { LeagueTable } from './league/LeagueTable';
import { CupView } from './league/CupView';
import { customPacksService } from '../../services/customPacks/packService';
import { Search, Trophy, Globe, ChevronRight, X, Layers } from 'lucide-react';

interface LeagueScreenProps {
    gameState: GameState;
}

const COUNTRIES = [
    { id: 'MY_LEAGUE', label: 'Mi Liga', isSpecial: true },
    { id: 'INTERNATIONAL', label: 'Copas Internacionales', isIntl: true },
    { id: 'Argentina', label: 'Argentina', flag: 'https://flagcdn.com/ar.svg' },
    { id: 'Inglaterra', label: 'Inglaterra', flag: 'https://flagcdn.com/gb-eng.svg' },
    { id: 'España', label: 'España', flag: 'https://flagcdn.com/es.svg' },
    { id: 'Brasil', label: 'Brasil', flag: 'https://flagcdn.com/br.svg' },
    { id: 'Paraguay', label: 'Paraguay', flag: 'https://flagcdn.com/py.svg' },
    { id: 'Alemania', label: 'Alemania', flag: 'https://flagcdn.com/de.svg' },
    { id: 'Italia', label: 'Italia', flag: 'https://flagcdn.com/it.svg' },
    { id: 'Francia', label: 'Francia', flag: 'https://flagcdn.com/fr.svg' },
];

export const LeagueScreen: React.FC<LeagueScreenProps> = ({ gameState }) => {
    const playerTeamLeague = gameState.team.leagueId;

    // Determine league for next match or active league
    const nextWeek = gameState.currentTurn === 'midweek' ? gameState.currentWeek + 1 : gameState.currentWeek;
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
    const [activeCountry, setActiveCountry] = useState<string>('MY_LEAGUE');
    const [searchQuery, setSearchQuery] = useState('');
    const [cupTab, setCupTab] = useState<'ROUNDS' | 'STATS'>('ROUNDS');

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

    // Competitions for the explorer modal active tab
    const explorerCompetitions = useMemo(() => {
        if (activeCountry === 'MY_LEAGUE') {
            const myLeague = ALL_COMPETITIONS.find(c => c.id === playerTeamLeague);
            const myCountry = myLeague?.country;
            return ALL_COMPETITIONS.filter(c => c.id === playerTeamLeague || (myCountry && c.country === myCountry));
        }
        if (activeCountry === 'INTERNATIONAL') {
            return ALL_COMPETITIONS.filter(c => c.category === 'INTERNATIONAL');
        }
        return ALL_COMPETITIONS.filter(c => c.country === activeCountry);
    }, [activeCountry, playerTeamLeague]);

    // Live search results inside explorer
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return ALL_COMPETITIONS.filter(c => 
            c.name.toLowerCase().includes(q) || 
            (c.country && c.country.toLowerCase().includes(q))
        );
    }, [searchQuery]);

    const handleSelectComp = (id: string, country?: string) => {
        setSelectedCompetitionId(id);
        setCupTab('ROUNDS');
        setSearchQuery('');
        setIsExplorerOpen(false);
        if (country) {
            setActiveCountry(country);
        }
    };

    const resolvedLogo = selectedCompDef 
        ? customPacksService.resolveCompetitionLogo(selectedCompDef.id, selectedCompDef.name, selectedCompDef.logo)
        : '/sinlogo.png';

    return (
        <div className="px-0 sm:px-4 md:px-6 py-2 sm:py-3 max-w-[1400px] w-full overflow-x-hidden mx-auto min-h-screen animate-fade-in space-y-2.5 sm:space-y-3">
            {/* Top Bar Compacta & Premium (No invade pantalla ni genera ruido) */}
            <div className="mx-2 sm:mx-0 rounded-2xl bg-[#0E131F] border border-white/10 p-2.5 sm:p-3 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                    {/* Competición Actual */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center p-1 rounded-xl bg-white/[0.03] border border-white/5 drop-shadow-sm">
                            <img src={resolvedLogo} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate">
                                    {selectedCompDef?.name || 'Tabla de Posiciones'}
                                </h1>
                                {selectedCompDef?.isFirstDiv && (
                                    <span className="text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 shrink-0">
                                        1ª Div
                                    </span>
                                )}
                                {selectedCompDef?.type === 'CUP' && (
                                    <span className="text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                        Copa
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                <span>{selectedCompDef?.country || 'Internacional'}</span>
                                <span>•</span>
                                <span>{selectedCompDef?.type === 'LEAGUE' ? 'Tabla General' : 'Eliminatorias'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botón Principal: Explorar Torneos */}
                    <button
                        onClick={() => setIsExplorerOpen(true)}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--apex-gold)]/20 to-amber-500/10 hover:from-[var(--apex-gold)]/30 hover:to-amber-500/20 border border-[var(--apex-gold)]/40 hover:border-[var(--apex-gold)] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
                        title="Explorar ligas y copas de otros países"
                    >
                        <Globe className="w-4 h-4 text-[var(--apex-gold)]" />
                        <span className="hidden sm:inline">Explorar Torneos</span>
                        <span className="sm:hidden">Torneos</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                    </button>
                </div>

                {/* Sub-Pills Limpias y Compactas (Solo torneos locales del país actual) */}
                {domesticPeers.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-2 mt-2 border-t border-white/5 custom-scrollbar">
                        {domesticPeers.map((comp) => {
                            const isSelected = selectedCompetitionId === comp.id;
                            const compLogo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                            return (
                                <button
                                    key={comp.id}
                                    onClick={() => handleSelectComp(comp.id)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-white/20 text-white border border-white/30 shadow'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-transparent'
                                    }`}
                                >
                                    <div className="w-3.5 h-3.5 shrink-0">
                                        <img src={compLogo} alt="" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="truncate max-w-[130px]">{comp.name}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal / Drawer Premium de Exploración de Torneos */}
            {isExplorerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-2xl bg-[#0D121F] border border-white/15 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-scale-in">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/30 flex items-center justify-center text-[var(--apex-gold)]">
                                    <Trophy className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-white uppercase tracking-tight">Explorar Torneos</h2>
                                    <p className="text-[10px] text-slate-400">Busca y consulta ligas y copas del mundo</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setIsExplorerOpen(false); setSearchQuery(''); }}
                                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search Box */}
                        <div className="p-3 sm:p-4 border-b border-white/5 bg-[#111726]">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Buscar por liga, copa o país (ej. Premier, Libertadores, Paraguay)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full bg-[#172033] border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[var(--apex-gold)] transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Search Results Mode */}
                        {searchQuery.trim() ? (
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                                <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                                    Resultados ({searchResults.length})
                                </div>
                                {searchResults.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 text-xs">
                                        No se encontraron torneos con "{searchQuery}"
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {searchResults.map((c) => {
                                            const logo = customPacksService.resolveCompetitionLogo(c.id, c.name, c.logo);
                                            const isSelected = selectedCompetitionId === c.id;
                                            return (
                                                <button
                                                    key={c.id}
                                                    onClick={() => handleSelectComp(c.id, c.country || 'INTERNATIONAL')}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)] shadow-md'
                                                            : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5'
                                                    }`}
                                                >
                                                    <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                                                        <img src={logo} alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-black text-white truncate uppercase">{c.name}</div>
                                                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                            <span>{c.country || 'Internacional'}</span>
                                                            <span>•</span>
                                                            <span className="text-[var(--apex-gold)] font-bold">
                                                                {c.type === 'LEAGUE' ? (c.isFirstDiv ? '1ª Div' : '2ª Div') : 'Copa'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Categorized Mode: Clean Country Tabs & Grid */
                            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                {/* Country Selector Chips */}
                                <div className="flex items-center gap-1.5 p-3 overflow-x-auto border-b border-white/5 custom-scrollbar bg-[#0A0E17]/40 shrink-0">
                                    {COUNTRIES.map((cty) => {
                                        const isActive = activeCountry === cty.id;
                                        return (
                                            <button
                                                key={cty.id}
                                                onClick={() => setActiveCountry(cty.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'bg-[var(--apex-gold)] text-slate-950 font-black shadow-md'
                                                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/5'
                                                }`}
                                            >
                                                {cty.isSpecial ? (
                                                    <span>🌟</span>
                                                ) : cty.isIntl ? (
                                                    <Trophy className="w-3.5 h-3.5" />
                                                ) : cty.flag ? (
                                                    <img src={cty.flag} alt="" className="w-4 h-3 object-cover rounded-[2px]" />
                                                ) : (
                                                    <Globe className="w-3.5 h-3.5" />
                                                )}
                                                <span>{cty.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Torneos Grid */}
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {explorerCompetitions.map((comp) => {
                                            const isSelected = selectedCompetitionId === comp.id;
                                            const compLogo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                                            return (
                                                <button
                                                    key={comp.id}
                                                    onClick={() => handleSelectComp(comp.id)}
                                                    className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)] shadow-lg'
                                                            : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5'
                                                    }`}
                                                >
                                                    <div className="w-10 h-10 shrink-0 flex items-center justify-center p-1 rounded-xl bg-white/[0.03]">
                                                        <img src={compLogo} alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-black text-white uppercase tracking-tight truncate">
                                                            {comp.name}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                                                                {comp.type === 'LEAGUE' ? (comp.isFirstDiv ? '1ª División' : '2ª División') : 'Torneo de Copa'}
                                                            </span>
                                                            {comp.country && <span>{comp.country}</span>}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Contenido Principal: Tabla de Posiciones / Vista de Copa (Directo, Limpio y a Ancho Completo) */}
            <div className="w-full min-w-0 animate-fade-in">
                {!selectedCompDef ? (
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
                        cupTab={cupTab}
                        setCupTab={setCupTab}
                    />
                ) : null}
            </div>
        </div>
    );
};
