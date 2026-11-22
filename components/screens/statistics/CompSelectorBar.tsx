import React from 'react';
import { CompetitionItem } from '../league/constants';
import { customPacksService } from '../../../services/customPacks/packService';
import { usePacksVersion } from '../../../data/teams/helpers';
import { Search, X, Globe, CheckCircle2, ChevronRight } from 'lucide-react';
import { REGION_TABS, getCompBadge } from './constants';
import { BottomSheet, EmptyState } from '../transfers/TransferUI';

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
    const packsVersion = usePacksVersion();
    const badge = getCompBadge(selectedCompDef);

    return (
        <>
            <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                {/* Active Competition Spotlight */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center shrink-0">
                            <img src={compLogo} alt={selectedCompDef.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)]">
                                    {selectedCompDef.country || 'Internacional'}
                                </span>
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${badge.color}`}>
                                    {badge.label}
                                </span>
                                <span className="text-[10px] text-slate-500 font-semibold">Temp. {season}</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black text-white truncate mt-0.5">
                                {selectedCompDef.name}
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={onToggleSelector}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                        <Globe className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                        <span>Cambiar</span>
                    </button>
                </div>

                {/* Quick 1-Tap Shortcuts */}
                {quickShortcuts.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-white/5">
                        {quickShortcuts.map(sc => {
                            const isCurrent = selectedCompId === sc.id;
                            const scLogo = customPacksService.resolveCompetitionLogo(sc.id, sc.name, sc.logo);
                            return (
                                <button
                                    key={`${sc.id}-${packsVersion}`}
                                    onClick={() => {
                                        onSelectComp(sc.id);
                                        onSearchChange('');
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                        isCurrent
                                            ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                    }`}
                                >
                                    <img src={scLogo} alt="" className="w-3.5 h-3.5 object-contain" />
                                    <span>{sc.name}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Competition Picker BottomSheet */}
            <BottomSheet
                open={isSelectorOpen}
                onClose={onToggleSelector}
                title="Seleccionar Competición"
            >
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar liga, copa, país o club..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {REGION_TABS.map(tab => {
                            const isSelected = selectedRegion === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onSelectRegion(tab.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                                        isSelected
                                            ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                            : 'bg-white/5 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                        {filteredCompetitions.length > 0 ? (
                            filteredCompetitions.map(c => {
                                const isSelected = selectedCompId === c.id;
                                const cLogo = customPacksService.resolveCompetitionLogo(c.id, c.name, c.logo);
                                const cBadge = getCompBadge(c);

                                return (
                                    <button
                                        key={`${c.id}-${packsVersion}`}
                                        onClick={() => {
                                            onSelectComp(c.id);
                                            onSearchChange('');
                                        }}
                                        className={`w-full p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between gap-2.5 cursor-pointer ${
                                            isSelected
                                                ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]/50 text-white'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                                                <img src={cLogo} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-black truncate">{c.name}</div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] text-slate-400 truncate">
                                                        {c.country || 'Internacional'}
                                                    </span>
                                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border shrink-0 ${cBadge.color}`}>
                                                        {cBadge.label}
                                                    </span>
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
                                text={`No se encontraron competiciones para "${searchQuery}".`}
                            />
                        )}
                    </div>
                </div>
            </BottomSheet>
        </>
    );
});
