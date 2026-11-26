import React, { useState, useMemo } from 'react';
import { GameState } from '../../../types';
import { ALL_COMPETITIONS, CompetitionItem } from '../league/constants';
import { CompetitionHistoryView } from '../league/CompetitionHistoryView';
import { customPacksService } from '../../../services/customPacks/packService';
import { usePacksVersion } from '../../../data/teams/helpers';
import { Search, ChevronRight, CheckCircle2, Globe, X } from 'lucide-react';
import { TrophyImage } from './TrophyImage';
import { REGION_TABS } from './trophiesUiTypes';
import { BottomSheet, EmptyState } from '../transfers/TransferUI';

interface CompetitionPalmaresTabProps {
    gameState: GameState;
}

export const CompetitionPalmaresTab: React.FC<CompetitionPalmaresTabProps> = ({ gameState }) => {
    const packsVersion = usePacksVersion();
    const { team } = gameState;
    const [selectedCompId, setSelectedCompId] = useState<string>(team.leagueId || 'PREMIER_LEAGUE');
    const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
    const [compSearch, setCompSearch] = useState<string>('');
    const [pickerOpen, setPickerOpen] = useState<boolean>(false);

    const validCompetitions = useMemo(
        () => ALL_COMPETITIONS.filter(c => c.id !== 'CLUB_RANKINGS'),
        []
    );

    const selectedCompetitionDef = useMemo(
        () => validCompetitions.find(c => c.id === selectedCompId) || validCompetitions[0],
        [validCompetitions, selectedCompId]
    );

    const userLeagueComp = validCompetitions.find(c => c.id === team.leagueId);
    const userCountry = userLeagueComp?.country || (team as any).country || 'Argentina';
    const userCupComp = validCompetitions.find(c => c.country === userCountry && c.type === 'CUP');
    const isEuropean = ['Inglaterra', 'España', 'Alemania', 'Italia', 'Francia'].includes(userCountry);
    const userContinentalComp = validCompetitions.find(c => c.id === (isEuropean ? 'CHAMPIONS_LEAGUE' : 'COPA_LIBERTADORES'));
    const intercontinentalComp = validCompetitions.find(c => c.id === 'COPA_INTERCONTINENTAL');
    const clubWorldCupComp = validCompetitions.find(c => c.id === 'CLUB_WORLD_CUP');
    const recopaComp = !isEuropean ? validCompetitions.find(c => c.id === 'RECOPA_SUDAMERICANA') : undefined;

    const quickShortcutComps = useMemo(() => {
        return [userLeagueComp, userCupComp, userContinentalComp, recopaComp, clubWorldCupComp, intercontinentalComp].filter(Boolean) as CompetitionItem[];
    }, [userLeagueComp, userCupComp, userContinentalComp, recopaComp, clubWorldCupComp, intercontinentalComp]);

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
        <div className="space-y-4">
            {/* Active Competition Spotlight Card */}
            <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <TrophyImage
                            competitionId={selectedCompetitionDef.id}
                            name={selectedCompetitionDef.name}
                            size="md"
                            showPedestal={true}
                        />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)]">
                                    {selectedCompetitionDef.category === 'INTERNATIONAL' ? 'Internacional' : selectedCompetitionDef.country}
                                </span>
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                    selectedCompetitionDef.type === 'CUP'
                                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                        : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                }`}>
                                    {selectedCompetitionDef.type === 'CUP' ? 'Copa' : 'Liga'}
                                </span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black text-white truncate mt-0.5">
                                {selectedCompetitionDef.name}
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={() => setPickerOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                        <Globe className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                        <span>Cambiar</span>
                    </button>
                </div>

                {/* Quick 1-Tap Shortcuts */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-white/5">
                    {quickShortcutComps.map(c => {
                        const isSelected = selectedCompId === c.id;
                        const logo = customPacksService.resolveCompetitionLogo(c.id, c.name, c.logo);
                        return (
                            <button
                                key={`${c.id}-${packsVersion}`}
                                onClick={() => setSelectedCompId(c.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                                    isSelected
                                        ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                        : 'bg-white/5 text-slate-300 hover:text-white'
                                }`}
                            >
                                <img src={logo} alt="" className="w-3.5 h-3.5 object-contain" />
                                <span>{c.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Detailed Historical Palmares */}
            <CompetitionHistoryView
                competition={selectedCompetitionDef}
                gameState={gameState}
            />

            {/* Competition Picker BottomSheet */}
            <BottomSheet
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                title="Seleccionar Competición"
            >
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={compSearch}
                            onChange={(e) => setCompSearch(e.target.value)}
                            placeholder="Buscar torneo o país..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]"
                        />
                        {compSearch && (
                            <button
                                onClick={() => setCompSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {REGION_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedRegion(tab.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer ${
                                    selectedRegion === tab.id
                                        ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                        : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                        {filteredCompetitions.length > 0 ? (
                            filteredCompetitions.map(c => {
                                const isSelected = selectedCompId === c.id;
                                const logo = customPacksService.resolveCompetitionLogo(c.id, c.name, c.logo);
                                return (
                                    <button
                                        key={`${c.id}-${packsVersion}`}
                                        onClick={() => {
                                            setSelectedCompId(c.id);
                                            setPickerOpen(false);
                                        }}
                                        className={`w-full p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between gap-2.5 cursor-pointer ${
                                            isSelected
                                                ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]/50 text-white'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                                                <img src={logo} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-black truncate">{c.name}</div>
                                                <div className="text-[10px] text-slate-400 truncate">
                                                    {c.country || 'Internacional'}
                                                </div>
                                            </div>
                                        </div>
                                        {isSelected ? (
                                            <CheckCircle2 className="w-4 h-4 text-[var(--apex-gold)] shrink-0" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <EmptyState
                                icon={<Globe className="w-6 h-6" />}
                                title="Sin resultados"
                                text={`No hay competiciones para "${compSearch}".`}
                            />
                        )}
                    </div>
                </div>
            </BottomSheet>
        </div>
    );
};
