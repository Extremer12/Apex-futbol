import React, { useState, useMemo, useRef } from 'react';
import { GameState } from '../../types';
import { TrophyIcon } from '../icons';
import { ALL_COMPETITIONS, CompetitionItem } from './league/constants';
import { LeagueTable } from './league/LeagueTable';
import { CupView } from './league/CupView';
import { customPacksService } from '../../services/customPacks/packService';
import { Search, Trophy, Globe, ChevronRight } from 'lucide-react';

interface LeagueScreenProps {
    gameState: GameState;
}

const COUNTRIES = [
    { id: 'MY_LEAGUE', label: 'Mi Liga', isSpecial: true },
    { id: 'Inglaterra', label: 'Inglaterra', flag: 'https://flagcdn.com/gb-eng.svg' },
    { id: 'España', label: 'España', flag: 'https://flagcdn.com/es.svg' },
    { id: 'Alemania', label: 'Alemania', flag: 'https://flagcdn.com/de.svg' },
    { id: 'Italia', label: 'Italia', flag: 'https://flagcdn.com/it.svg' },
    { id: 'Francia', label: 'Francia', flag: 'https://flagcdn.com/fr.svg' },
    { id: 'Argentina', label: 'Argentina', flag: 'https://flagcdn.com/ar.svg' },
    { id: 'Brasil', label: 'Brasil', flag: 'https://flagcdn.com/br.svg' },
    { id: 'INTERNATIONAL', label: 'Copas Internacionales', isIntl: true },
];

export const LeagueScreen: React.FC<LeagueScreenProps> = ({ gameState }) => {
    const playerTeamLeague = gameState.team.leagueId;

    // Determine league for next match or active league
    const nextWeek = gameState.currentTurn === 'midweek' ? gameState.currentWeek + 1 : gameState.currentWeek;
    const isMidweek = gameState.currentTurn === 'midweek';
    const nextMatch = gameState.schedule.find(
        m => m.week === nextWeek && !!m.isMidweek === isMidweek && (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id)
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
    const [activeCountry, setActiveCountry] = useState<string>('MY_LEAGUE');
    const [searchQuery, setSearchQuery] = useState('');
    const [cupTab, setCupTab] = useState<'ROUNDS' | 'STATS'>('ROUNDS');

    const selectedCompDef = useMemo(() => {
        return ALL_COMPETITIONS.find(c => c.id === selectedCompetitionId);
    }, [selectedCompetitionId]);

    // Competitions for the currently active country/tab
    const availableCompetitionsForTab = useMemo(() => {
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

    // Live search results
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
        if (country) {
            setActiveCountry(country);
        }
    };

    const resolvedLogo = selectedCompDef 
        ? customPacksService.resolveCompetitionLogo(selectedCompDef.id, selectedCompDef.name, selectedCompDef.logo)
        : '/sinlogo.png';

    return (
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto min-h-screen animate-fade-in space-y-4">
            {/* Top Bar: Selector y Buscador */}
            <div className="rounded-2xl bg-[#0E131F] border border-white/10 p-4 shadow-xl space-y-3">
                {/* Cabecera y Buscador */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Competición Activa */}
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/5 p-1.5 flex items-center justify-center shrink-0 border border-white/10">
                            <img src={resolvedLogo} alt="" className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                                    {selectedCompDef?.name || 'Tabla de Posiciones'}
                                </h1>
                                {selectedCompDef?.isFirstDiv && (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30">
                                        1ª División
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                                {selectedCompDef?.country || 'Torneo Oficial'} • {selectedCompDef?.type === 'LEAGUE' ? 'Tabla de Posiciones' : 'Fase Eliminatoria'}
                            </p>
                        </div>
                    </div>

                    {/* Buscador Rápido */}
                    <div className="relative w-full sm:w-72">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar liga, país o copa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#161D2E] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)] transition-colors"
                            />
                        </div>

                        {/* Dropdown de Resultados de Búsqueda */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#121828] border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                                {searchResults.map((c) => {
                                    const logo = customPacksService.resolveCompetitionLogo(c.id, c.name, c.logo);
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => handleSelectComp(c.id, c.country || 'INTERNATIONAL')}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 text-left transition-colors cursor-pointer"
                                        >
                                            <div className="w-6 h-6 shrink-0">
                                                <img src={logo} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-white truncate">{c.name}</div>
                                                <div className="text-[10px] text-slate-400">{c.country || 'Internacional'}</div>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs de Países y Categorías (Scroll Horizontal Limpio) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1">
                    {COUNTRIES.map((cty) => {
                        const isActive = activeCountry === cty.id;
                        return (
                            <button
                                key={cty.id}
                                onClick={() => setActiveCountry(cty.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                                    isActive
                                        ? 'bg-[var(--apex-gold)] text-slate-950 shadow-md font-black'
                                        : 'bg-[#161D2E] text-slate-300 hover:bg-[#1C253B] border border-white/5'
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

                {/* Sub-Pills de Competiciones del País Seleccionado */}
                <div className="flex items-center gap-2 overflow-x-auto pt-1 custom-scrollbar border-t border-white/5">
                    {availableCompetitionsForTab.map((comp) => {
                        const isSelected = selectedCompetitionId === comp.id;
                        const compLogo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
                        return (
                            <button
                                key={comp.id}
                                onClick={() => handleSelectComp(comp.id)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-white/20 text-white border border-white/30 shadow'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-transparent'
                                }`}
                            >
                                <div className="w-4 h-4 shrink-0">
                                    <img src={compLogo} alt="" className="w-full h-full object-contain" />
                                </div>
                                <span>{comp.name}</span>
                                {comp.type === 'CUP' && (
                                    <span className="text-[9px] text-amber-400 uppercase font-black">Copa</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Contenido Principal: Tabla de Posiciones / Vista de Copa (Directo y a Ancho Completo) */}
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
