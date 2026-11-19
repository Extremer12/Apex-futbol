import React, { useState, useMemo } from 'react';
import { GameState } from '../../../types';
import { ALL_COMPETITIONS, CompetitionItem } from '../league/constants';
import { CompetitionHistoryView } from '../league/CompetitionHistoryView';
import { customPacksService } from '../../../services/customPacks/packService';
import { Search, ChevronDown, ChevronUp, CheckCircle2, Trophy, Globe, Shield, Sparkles } from 'lucide-react';
import { TrophyImage } from './TrophyImage';
import { REGION_TABS, COUNTRY_FLAGS } from './trophiesUiTypes';

interface CompetitionPalmaresTabProps {
    gameState: GameState;
}

export const CompetitionPalmaresTab: React.FC<CompetitionPalmaresTabProps> = ({ gameState }) => {
    const { team } = gameState;
    const [selectedCompId, setSelectedCompId] = useState<string>(team.leagueId || 'PREMIER_LEAGUE');
    const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
    const [compSearch, setCompSearch] = useState<string>('');
    const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(true);

    // Filter valid tournaments (exclude non-disputable tables like CLUB_RANKINGS)
    const validCompetitions = useMemo(() => {
        return ALL_COMPETITIONS.filter(c => c.id !== 'CLUB_RANKINGS');
    }, []);

    const selectedCompetitionDef = useMemo(() => {
        return validCompetitions.find(c => c.id === selectedCompId) || validCompetitions[0];
    }, [validCompetitions, selectedCompId]);

    // Fast Shortcuts for user's club
    const userLeagueComp = validCompetitions.find(c => c.id === team.leagueId);
    const userCountry = userLeagueComp?.country || (team as any).country || 'Argentina';
    const userCupComp = validCompetitions.find(c => c.country === userCountry && c.type === 'CUP');
    const isEuropean = ['Inglaterra', 'España', 'Alemania', 'Italia', 'Francia'].includes(userCountry);
    const userContinentalComp = validCompetitions.find(c => c.id === (isEuropean ? 'CHAMPIONS_LEAGUE' : 'COPA_LIBERTADORES'));
    const intercontinentalComp = validCompetitions.find(c => c.id === 'COPA_INTERCONTINENTAL');

    const quickShortcutComps = useMemo(() => {
        return [
            userLeagueComp,
            userCupComp,
            userContinentalComp,
            intercontinentalComp
        ].filter(Boolean) as CompetitionItem[];
    }, [userLeagueComp, userCupComp, userContinentalComp, intercontinentalComp]);

    const filteredCompetitions = useMemo(() => {
        let list = validCompetitions;

        if (selectedRegion === 'INT') {
            list = list.filter(c => c.category === 'INTERNATIONAL');
        } else if (selectedRegion === 'SUDAMERICA') {
            const southAmericanCountries = ['Argentina', 'Brasil', 'Chile', 'Colombia', 'Paraguay', 'México'];
            list = list.filter(c => c.country && southAmericanCountries.includes(c.country));
        } else if (selectedRegion === 'EUROPA') {
            const europeanCountries = ['Inglaterra', 'España', 'Alemania', 'Italia', 'Francia'];
            list = list.filter(c => c.country && europeanCountries.includes(c.country));
        }

        if (compSearch.trim()) {
            const q = compSearch.toLowerCase().trim();
            list = list.filter(c =>
                c.name.toLowerCase().includes(q) ||
                (c.country && c.country.toLowerCase().includes(q))
            );
        }

        return list;
    }, [validCompetitions, selectedRegion, compSearch]);

    return (
        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1 animate-fade-in">
            {/* Control Bar: Active Competition Spotlight + Accordion Selector */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900/95 via-[#0E1524] to-[#0A0E17] border border-white/10 p-4 shadow-xl space-y-4 backdrop-blur-md">
                {/* Active Spotlight Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3.5">
                        <TrophyImage
                            competitionId={selectedCompetitionDef.id}
                            name={selectedCompetitionDef.name}
                            size="md"
                            showPedestal={true}
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                                    {selectedCompetitionDef.category === 'INTERNATIONAL' ? 'Torneo Internacional' : selectedCompetitionDef.country}
                                </span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                    selectedCompetitionDef.type === 'CUP'
                                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                        : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                }`}>
                                    {selectedCompetitionDef.type === 'CUP' ? 'Copa Oficial' : 'Liga Nacional'}
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                                {selectedCompetitionDef.name}
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                        <span>{isSelectorOpen ? 'Ocultar Selector' : 'Cambiar Competición'}</span>
                        {isSelectorOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {/* Quick Shortcuts */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                        Acceso Rápido:
                    </span>
                    {quickShortcutComps.map(c => {
                        const isSelected = selectedCompId === c.id;
                        return (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCompId(c.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border shrink-0 ${
                                    isSelected
                                        ? 'bg-[var(--apex-gold)] text-black border-[var(--apex-gold)] font-black shadow-md'
                                        : 'bg-black/40 text-slate-300 hover:text-white border-white/5 hover:border-white/20'
                                }`}
                            >
                                <img
                                    src={customPacksService.resolveCompetitionLogo(c.id, c.name, c.logo)}
                                    alt=""
                                    className="w-4 h-4 object-contain"
                                />
                                <span>{c.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Collapsible Selector Grid */}
                {isSelectorOpen && (
                    <div className="space-y-3 pt-2 border-t border-white/10">
                        {/* Region Filter & Search */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                {REGION_TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedRegion(tab.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                                            selectedRegion === tab.id
                                                ? 'bg-white/15 text-white border-white/25 shadow-sm'
                                                : 'text-slate-400 hover:text-white border-transparent'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={compSearch}
                                    onChange={(e) => setCompSearch(e.target.value)}
                                    placeholder="Buscar torneo o país..."
                                    className="w-full sm:w-56 bg-black/50 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
                                />
                            </div>
                        </div>

                        {/* Competitions Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-1">
                            {filteredCompetitions.map(c => {
                                const isSelected = selectedCompId === c.id;
                                const flag = c.country ? COUNTRY_FLAGS[c.country] || '' : '🏆';

                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCompId(c.id)}
                                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 group cursor-pointer ${
                                            isSelected
                                                ? 'bg-amber-500/15 border-amber-400/50 text-white shadow-md'
                                                : 'bg-black/30 border-white/5 hover:border-white/20 text-slate-300 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                                                <img
                                                    src={customPacksService.resolveCompetitionLogo(c.id, c.name, c.logo)}
                                                    alt=""
                                                    className="w-5 h-5 object-contain"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-xs font-bold truncate block">
                                                    {c.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 truncate block">
                                                    {flag} {c.country || 'Internacional'}
                                                </span>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed Historical Palmares View for the Selected Competition */}
            <CompetitionHistoryView
                competition={selectedCompetitionDef}
                gameState={gameState}
            />
        </div>
    );
};
