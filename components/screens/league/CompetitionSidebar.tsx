import React from 'react';
import { TrophyIcon } from '../../icons';
import { CompetitionItem } from './constants';
import { customPacksService } from '../../../services/customPacks/packService';

interface CompetitionSidebarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCompetitionId: string;
    onSelectCompetition: (id: string) => void;
    expandedSections: Record<string, boolean>;
    onToggleSection: (section: string) => void;
    allCompetitions: CompetitionItem[];
}

export const CompetitionSidebar: React.FC<CompetitionSidebarProps> = ({
    searchQuery,
    onSearchChange,
    selectedCompetitionId,
    onSelectCompetition,
    expandedSections,
    onToggleSection,
    allCompetitions
}) => {
    // Filter competitions based on search query
    const filteredCompetitions = allCompetitions.filter(comp => 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (comp.country && comp.country.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const intlComps = filteredCompetitions.filter(c => c.category === 'INTERNATIONAL');
    const domesticComps = filteredCompetitions.filter(c => c.category === 'DOMESTIC');

    // Group domestic competitions by country
    const domesticByCountry: Record<string, CompetitionItem[]> = {};
    domesticComps.forEach(comp => {
        if (!comp.country) return;
        if (!domesticByCountry[comp.country]) domesticByCountry[comp.country] = [];
        domesticByCountry[comp.country].push(comp);
    });

    const renderSidebarItem = (comp: CompetitionItem) => {
        const isSelected = selectedCompetitionId === comp.id;
        const logo = customPacksService.resolveCompetitionLogo(comp.id, comp.name, comp.logo);
        return (
            <button
                key={comp.id}
                onClick={() => onSelectCompetition(comp.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-left ${isSelected ? 'bg-white/10 shadow-lg ring-1 ring-white/20' : 'hover:bg-white/5'}`}
            >
                <div className={`w-8 h-8 rounded-lg p-1.5 flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/10' : 'bg-slate-800'}`}>
                    {logo ? (
                        <img src={logo} alt={comp.name} className="w-full h-full object-contain" />
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

    return (
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
            {/* Buscador Global */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar ligas o copas..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors backdrop-blur-md"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-3 overflow-y-auto max-h-[75vh] custom-scrollbar shadow-xl backdrop-blur-sm">
                
                {/* Internacionales */}
                {intlComps.length > 0 && (
                    <div className="mb-4">
                        <button 
                            onClick={() => onToggleSection('INTERNATIONAL')}
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
                                        onClick={() => onToggleSection(country)}
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
    );
};
