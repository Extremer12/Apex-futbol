import React, { useState, useMemo, useCallback } from 'react';
import { Player, Team, GameState } from '../../../types';
import { GameAction } from '../../../state/reducer';
import { TeamLogo, PlayerPhoto } from '../../../data/teams/helpers';
import { formatWeeklyWage, formatTransferFee, normalizeMonetaryValue } from '../../../utils';
import { getPlayerAge, getPlayerPotential, getPlayerPotentialTier, getExpectedWage } from '../../../utils/playerUtils';
import { getCountryMeta, resolvePlayerNationality } from '../../../services/nationalityService';
import { canRegisterInFirstTeam } from '../../../services/squadRules';
import { Search, X, SlidersHorizontal, Eye, Lock, ChevronRight, SearchX } from 'lucide-react';
import { useToast } from '../../common/ToastProvider';
import { BottomSheet, OvrBadge, StatCell, EmptyState, positionLabel } from './TransferUI';

export type CategoryFilter = 'ALL' | 'WONDERKIDS' | 'PRIME' | 'VETERANS' | 'EXPIRING' | 'AFFORDABLE';
export type SortOption = 'rating' | 'potential' | 'value' | 'age' | 'wage';

interface TransfersMarketTabProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    marketOpen: boolean;
    allTeams: Team[];
    myTeam: Team;
    availablePlayers: Player[];
    filterName: string;
    setFilterName: (val: string) => void;
    filterPos: 'ALL' | Player['position'];
    setFilterPos: (pos: 'ALL' | Player['position']) => void;
    filterCategory: CategoryFilter;
    setFilterCategory: (cat: CategoryFilter) => void;
    sortOption: SortOption;
    setSortOption: (sort: SortOption) => void;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    onStartNegotiation: (player: Player) => void;
    playerTeamMap?: Map<number, Team>;
}

const PAGE_SIZE = 20;

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'AFFORDABLE', label: 'En presupuesto' },
    { id: 'WONDERKIDS', label: 'Promesas Sub-22' },
    { id: 'PRIME', label: 'Plenitud 23-29' },
    { id: 'VETERANS', label: 'Veteranos 30+' },
    { id: 'EXPIRING', label: 'Fin de contrato' },
];

const SORTS: { id: SortOption; label: string }[] = [
    { id: 'rating', label: 'Mejor media' },
    { id: 'potential', label: 'Mayor potencial' },
    { id: 'value', label: 'Mayor valor' },
    { id: 'age', label: 'Más jóvenes' },
    { id: 'wage', label: 'Mayor salario' },
];

const POSITIONS = [
    { id: 'ALL', label: 'Todos' },
    { id: 'POR', label: 'POR' },
    { id: 'DEF', label: 'DEF' },
    { id: 'CEN', label: 'MED' },
    { id: 'DEL', label: 'DEL' },
] as const;

export const TransfersMarketTab: React.FC<TransfersMarketTabProps> = React.memo(({
    gameState, dispatch, marketOpen, allTeams, myTeam, availablePlayers,
    filterName, setFilterName, filterPos, setFilterPos, filterCategory, setFilterCategory,
    sortOption, setSortOption, currentPage, setCurrentPage, onStartNegotiation,
    playerTeamMap: propPlayerTeamMap,
}) => {
    const { showToast } = useToast();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selected, setSelected] = useState<Player | null>(null);

    const playerTeamMap = useMemo(() => {
        if (propPlayerTeamMap) return propPlayerTeamMap;
        const map = new Map<number, Team>();
        for (const t of allTeams) for (const p of t.squad) map.set(p.id, t);
        return map;
    }, [allTeams, propPlayerTeamMap]);

    const maxSpendable = useMemo(() => Math.min(
        normalizeMonetaryValue(gameState.finances.transferBudget, 0),
        normalizeMonetaryValue(gameState.finances.balance, 0)
    ), [gameState.finances.transferBudget, gameState.finances.balance]);

    const filteredPlayers = useMemo(() => {
        const query = filterName.toLowerCase().trim();
        return availablePlayers.filter(player => {
            if (query) {
                const team = playerTeamMap.get(player.id);
                const hit = player.name.toLowerCase().includes(query)
                    || (team?.name.toLowerCase().includes(query) ?? false)
                    || ((team?.shortName || '').toLowerCase().includes(query));
                if (!hit) return false;
            }
            if (filterPos !== 'ALL' && player.position !== filterPos) return false;
            if (filterCategory !== 'ALL') {
                const age = getPlayerAge(player);
                if (filterCategory === 'WONDERKIDS') {
                    if (getPlayerPotentialTier(player) !== 'Wonderkid' && (age > 22 || getPlayerPotential(player) < 85)) return false;
                } else if (filterCategory === 'PRIME') {
                    if (age < 23 || age > 29) return false;
                } else if (filterCategory === 'VETERANS') {
                    if (age < 30) return false;
                } else if (filterCategory === 'EXPIRING') {
                    if (player.contractYears > 1) return false;
                } else if (filterCategory === 'AFFORDABLE') {
                    if (normalizeMonetaryValue(player.value) > maxSpendable) return false;
                }
            }
            return true;
        }).sort((a, b) => {
            switch (sortOption) {
                case 'potential': return getPlayerPotential(b) - getPlayerPotential(a);
                case 'value': return b.value - a.value;
                case 'age': return getPlayerAge(a) - getPlayerAge(b);
                case 'wage': return b.wage - a.wage;
                default: return b.rating - a.rating;
            }
        });
    }, [availablePlayers, filterName, filterPos, filterCategory, sortOption, maxSpendable, playerTeamMap]);

    const visible = filteredPlayers.slice(0, currentPage * PAGE_SIZE);
    const hasMore = visible.length < filteredPlayers.length;

    const activeFilterCount = (filterPos !== 'ALL' ? 1 : 0) + (filterCategory !== 'ALL' ? 1 : 0) + (sortOption !== 'rating' ? 1 : 0);

    const resetFilters = () => {
        setFilterPos('ALL');
        setFilterCategory('ALL');
        setSortOption('rating');
        setFilterName('');
        setCurrentPage(1);
    };

    const scoutLevel = useCallback((p: Player) => gameState.scoutedPlayerIds[p.id] || 0, [gameState.scoutedPlayerIds]);

    const ovrText = (p: Player) => {
        const lvl = scoutLevel(p);
        if (lvl >= 100) return String(p.rating);
        const r = Math.max(1, Math.ceil(5 * (1 - lvl / 100)));
        return `${Math.max(1, p.rating - r)}-${Math.min(99, p.rating + r)}`;
    };

    const selectedTeam = selected ? playerTeamMap.get(selected.id) : undefined;

    return (
        <div className="space-y-3">
            {/* SEARCH + FILTER BUTTON */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                        type="search"
                        inputMode="search"
                        placeholder="Jugador o club…"
                        value={filterName}
                        onChange={e => { setFilterName(e.target.value); setCurrentPage(1); }}
                        className="w-full h-11 pl-10 pr-9 bg-[#0D1220] border border-white/10 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]/60"
                    />
                    {filterName && (
                        <button onClick={() => { setFilterName(''); setCurrentPage(1); }} aria-label="Limpiar búsqueda"
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setFiltersOpen(true)}
                    className={`relative h-11 px-3.5 rounded-2xl border flex items-center gap-2 text-sm font-bold shrink-0 ${
                        activeFilterCount ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]/40 text-[var(--apex-gold)]' : 'bg-[#0D1220] border-white/10 text-slate-300'
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filtros</span>
                    {activeFilterCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[var(--apex-gold)] text-black text-[10px] font-black flex items-center justify-center">{activeFilterCount}</span>
                    )}
                </button>
            </div>

            {/* QUICK POSITION PILLS */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
                {POSITIONS.map(pos => (
                    <button key={pos.id}
                        onClick={() => { setFilterPos(pos.id as any); setCurrentPage(1); }}
                        className={`h-8 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                            filterPos === pos.id ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}>
                        {pos.label}
                    </button>
                ))}
            </div>

            {/* RESULT SUMMARY */}
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-semibold">
                <span>{filteredPlayers.length} jugadores · {SORTS.find(s => s.id === sortOption)?.label}</span>
                {!marketOpen && <span className="flex items-center gap-1 text-rose-400"><Lock className="w-3 h-3" /> Solo ojeo</span>}
            </div>

            {/* LIST */}
            {visible.length === 0 ? (
                <div className="apex-card">
                    <EmptyState
                        icon={<SearchX className="w-6 h-6" />}
                        title="Sin resultados"
                        text="Prueba con otro nombre o quita algunos filtros."
                        action={<button onClick={resetFilters} className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold">Limpiar filtros</button>}
                    />
                </div>
            ) : (
                <ul className="apex-card divide-y divide-white/5 overflow-hidden">
                    {visible.map(player => {
                        const team = playerTeamMap.get(player.id);
                        const nat = resolvePlayerNationality(player, team?.leagueId);
                        const meta = getCountryMeta(nat);
                        return (
                            <li key={player.id}>
                                <button onClick={() => setSelected(player)}
                                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors cursor-pointer">
                                    <PlayerPhoto player={player} className="w-11 h-11 rounded-full shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-bold text-white truncate">{player.name}</p>
                                            <span title={meta.name} className="shrink-0">{meta.flag}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 min-w-0">
                                            <span className="font-bold text-slate-300">{positionLabel[player.position]}</span>
                                            <span>·</span>
                                            <span>{getPlayerAge(player)} años</span>
                                            {team && (<><span>·</span><span className="w-3.5 h-3.5 inline-flex shrink-0"><TeamLogo team={team} /></span><span className="truncate">{team.shortName || team.name}</span></>)}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-emerald-400">{formatTransferFee(player.value)}</p>
                                        <p className="text-[10px] text-slate-500">{player.contractYears}a contrato</p>
                                    </div>
                                    <OvrBadge value={ovrText(player)} muted={scoutLevel(player) < 100} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {hasMore && (
                <button onClick={() => setCurrentPage(p => p + 1)}
                    className="w-full h-11 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold">
                    Ver más ({filteredPlayers.length - visible.length} restantes)
                </button>
            )}

            {/* FILTER SHEET */}
            <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros"
                footer={
                    <div className="flex gap-2">
                        <button onClick={resetFilters} className="flex-1 h-11 rounded-xl bg-white/5 text-slate-300 text-sm font-bold">Restablecer</button>
                        <button onClick={() => setFiltersOpen(false)} className="flex-[2] h-11 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-sm font-black">
                            Ver {filteredPlayers.length} jugadores
                        </button>
                    </div>
                }>
                <div className="space-y-5">
                    <section>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Ordenar por</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {SORTS.map(s => (
                                <button key={s.id} onClick={() => setSortOption(s.id)}
                                    className={`h-10 rounded-xl text-xs font-bold border ${sortOption === s.id ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]' : 'bg-white/[0.03] border-white/5 text-slate-300'}`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Perfil</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map(c => (
                                <button key={c.id} onClick={() => { setFilterCategory(c.id); setCurrentPage(1); }}
                                    className={`h-10 rounded-xl text-xs font-bold border ${filterCategory === c.id ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]' : 'bg-white/[0.03] border-white/5 text-slate-300'}`}>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Posición</h4>
                        <div className="grid grid-cols-5 gap-2">
                            {POSITIONS.map(p => (
                                <button key={p.id} onClick={() => { setFilterPos(p.id as any); setCurrentPage(1); }}
                                    className={`h-10 rounded-xl text-xs font-bold border ${filterPos === p.id ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]' : 'bg-white/[0.03] border-white/5 text-slate-300'}`}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </BottomSheet>

            {/* PLAYER ACTION SHEET */}
            <BottomSheet open={!!selected} onClose={() => setSelected(null)}
                footer={selected && (() => {
                    if (!marketOpen) {
                        return (
                            <div className="w-full h-12 rounded-xl bg-white/5 text-slate-400 text-sm font-bold flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4" /> Mercado cerrado
                            </div>
                        );
                    }
                    const regCheck = canRegisterInFirstTeam(
                        myTeam.squad,
                        gameState.youthAcademy || [],
                        selected,
                        myTeam.leagueId,
                        gameState.gameMode
                    );
                    if (!regCheck.allowed) {
                        return (
                            <div className="space-y-1.5 text-center">
                                <p className="text-[11px] text-rose-300 font-semibold">{regCheck.reason}</p>
                                <div className="w-full h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-black uppercase flex items-center justify-center gap-2">
                                    <Lock className="w-4 h-4" /> Sin cupos disponibles
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div className="space-y-1.5">
                            {regCheck.reason && (
                                <p className="text-[11px] text-amber-300 font-semibold text-center">{regCheck.reason}</p>
                            )}
                            <button onClick={() => { const p = selected; setSelected(null); onStartNegotiation(p); }}
                                className="w-full h-12 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-sm font-black uppercase tracking-wider cursor-pointer">
                                Iniciar negociación
                            </button>
                        </div>
                    );
                })()}>
                {selected && (() => {
                    const nat = resolvePlayerNationality(selected, selectedTeam?.leagueId);
                    const meta = getCountryMeta(nat);
                    return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <PlayerPhoto player={selected} className="w-16 h-16 rounded-2xl shrink-0" />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-lg font-black text-white truncate">{selected.name}</h3>
                                    <span title={meta.name}>{meta.flag}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    {selectedTeam && <span className="w-4 h-4 inline-flex"><TeamLogo team={selectedTeam} /></span>}
                                    <span className="truncate">{selectedTeam?.name || 'Agente libre'} · {meta.name}</span>
                                </div>
                            </div>
                            <OvrBadge value={ovrText(selected)} muted={scoutLevel(selected) < 100} />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <StatCell label="Posición" value={positionLabel[selected.position]} />
                            <StatCell label="Edad" value={`${getPlayerAge(selected)}`} />
                            <StatCell label="Contrato" value={`${selected.contractYears} años`} />
                            <StatCell label="Valor" value={formatTransferFee(selected.value)} accent="text-emerald-400" />
                            <StatCell label="Salario est." value={formatWeeklyWage(getExpectedWage(selected, myTeam.tier, 'FirstTeam'))} />
                            <StatCell label="Ojeo" value={`${scoutLevel(selected)}%`} accent={scoutLevel(selected) >= 100 ? 'text-emerald-400' : 'text-amber-400'} />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                disabled={scoutLevel(selected) >= 100}
                                onClick={() => { dispatch({ type: 'SCOUT_PLAYER', payload: { playerId: selected.id } }); showToast(`Ojeador asignado a ${selected.name}`, 'info'); }}
                                className="h-11 rounded-xl bg-white/5 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer">
                                <Eye className="w-4 h-4" /> {scoutLevel(selected) >= 100 ? 'Ojeado' : 'Enviar ojeador'}
                            </button>
                            <button
                                onClick={() => { dispatch({ type: 'SET_VIEWING_PLAYER', payload: selected }); setSelected(null); }}
                                className="h-11 rounded-xl bg-white/5 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer">
                                Ficha completa <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    );
                })()}
            </BottomSheet>
        </div>
    );
});
