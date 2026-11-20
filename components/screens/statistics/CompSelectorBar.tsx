import React from 'react';
import { CompetitionItem } from '../league/constants';
import { customPacksService } from '../../../services/customPacks/packService';
import { Search, X, Globe, ChevronDown, ChevronUp, Star, CheckCircle2, ChevronRight } from 'lucide-react';
import { COUNTRY_FLAGS, REGION_TABS, getCompBadge } from './constants';

interface CompSelectorBarProps {
    selectedCompDef: CompetitionItem;
    compLogo: string;
    season: number;
    isSelectorOpen: boolean;
    onToggleSelector: () => void;
    quickShortcuts: CompetitionItem[];
    selectedCompId: string;
    onSelectComp: (id: string) => void;
    selectedRegion: string;
    onSelectRegion: (region: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filteredCompetitions: CompetitionItem[];
}

export const CompSelectorBar: React.FC<CompSelectorBarProps> = React.memo(({
    selectedCompDef,
    compLogo,
    season,
    isSelectorOpen,
    onToggleSelector,
    quickShortcuts,
    selectedCompId,
    onSelectComp,
    selectedRegion,
    onSelectRegion,
    searchQuery,
    onSearchChange,
    filteredCompetitions,
}) => {
    const showSelector = isSelectorOpen || searchQuery.trim().length > 0;

    return (
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
                                Temporada {season}
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
                        onClick={onToggleSelector}
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
                                    onSelectComp(sc.id);
                                    onSearchChange('');
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
                                        onClick={() => onSelectRegion(tab.id)}
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
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full bg-black/70 border border-white/15 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[var(--apex-gold)] focus:ring-1 focus:ring-[var(--apex-gold)] transition-all font-medium"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => onSearchChange('')}
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
                                            onSelectComp(c.id);
                                            onSearchChange('');
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
    );
});
