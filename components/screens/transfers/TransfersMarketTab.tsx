import React, { useState, useMemo } from 'react';
import { Player, Team, GameState } from '../../../types';
import { GameAction } from '../../../state/reducer';
import { TeamLogo, PlayerPhoto } from '../../../data/teams/helpers';
import { 
    formatWeeklyWage, 
    formatTransferFee 
} from '../../../utils';
import { 
    getPlayerAge, 
    getPlayerPotential, 
    getPlayerPotentialTier, 
    getExpectedWage 
} from '../../../utils/playerUtils';
import { 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    X, 
    ArrowUpDown, 
    LayoutGrid, 
    List, 
    Eye, 
    Clock,
    Lock
} from 'lucide-react';
import { useToast } from '../../common/ToastProvider';

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

export const TransfersMarketTab: React.FC<TransfersMarketTabProps> = React.memo(({
    gameState,
    dispatch,
    marketOpen,
    allTeams,
    myTeam,
    availablePlayers,
    filterName,
    setFilterName,
    filterPos,
    setFilterPos,
    filterCategory,
    setFilterCategory,
    sortOption,
    setSortOption,
    currentPage,
    setCurrentPage,
    onStartNegotiation,
    playerTeamMap: propPlayerTeamMap,
}) => {
    const { showToast } = useToast();
    const pageSize = 24;

    // View layout preference: 'table' or 'grid'
    const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
        try {
            return (localStorage.getItem('apex_market_view') as 'table' | 'grid') || 'table';
        } catch (_) {
            return 'table';
        }
    });

    const handleSetViewMode = (mode: 'table' | 'grid') => {
        setViewMode(mode);
        try {
            localStorage.setItem('apex_market_view', mode);
        } catch (_) {}
    };

    // O(1) lookup map from player.id -> Team
    const playerTeamMap = useMemo(() => {
        if (propPlayerTeamMap) return propPlayerTeamMap;
        const map = new Map<number, Team>();
        for (const t of allTeams) {
            for (const p of t.squad) {
                map.set(p.id, t);
            }
        }
        return map;
    }, [allTeams, propPlayerTeamMap]);

    const filteredPlayers = useMemo(() => {
        const query = filterName.toLowerCase().trim();
        const normBudget = gameState.finances.transferBudget < 10_000 ? gameState.finances.transferBudget * 1_000_000 : gameState.finances.transferBudget;
        const normBalance = gameState.finances.balance < 10_000 ? gameState.finances.balance * 1_000_000 : gameState.finances.balance;
        const maxSpendable = Math.min(normBudget, normBalance);

        return availablePlayers.filter(player => {
            if (query) {
                const nameMatch = player.name.toLowerCase().includes(query);
                const pTeam = playerTeamMap.get(player.id);
                const teamMatch = pTeam ? pTeam.name.toLowerCase().includes(query) || (pTeam.shortName || '').toLowerCase().includes(query) : false;
                if (!nameMatch && !teamMatch) return false;
            }

            if (filterPos !== 'ALL' && player.position !== filterPos) {
                return false;
            }

            if (filterCategory !== 'ALL') {
                const age = getPlayerAge(player);
                if (filterCategory === 'WONDERKIDS') {
                    const pot = getPlayerPotential(player);
                    const potTier = getPlayerPotentialTier(player);
                    if (potTier !== 'Wonderkid' && (age > 22 || pot < 85)) return false;
                } else if (filterCategory === 'PRIME') {
                    if (age < 23 || age > 29) return false;
                } else if (filterCategory === 'VETERANS') {
                    if (age < 30) return false;
                } else if (filterCategory === 'EXPIRING') {
                    if (player.contractYears > 1) return false;
                } else if (filterCategory === 'AFFORDABLE') {
                    const normPlayerValue = player.value < 10_000 ? player.value * 1_000_000 : player.value;
                    if (normPlayerValue > maxSpendable) return false;
                }
            }
            return true;
        }).sort((a, b) => {
            switch (sortOption) {
                case 'rating':
                    return b.rating - a.rating;
                case 'potential':
                    return getPlayerPotential(b) - getPlayerPotential(a);
                case 'value':
                    return b.value - a.value;
                case 'age':
                    return getPlayerAge(a) - getPlayerAge(b);
                case 'wage':
                    return b.wage - a.wage;
                default:
                    return b.rating - a.rating;
            }
        });
    }, [availablePlayers, filterName, filterPos, filterCategory, sortOption, gameState.finances.transferBudget, gameState.finances.balance, playerTeamMap]);

    const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / pageSize));
    const paginatedPlayers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPlayers.slice(start, start + pageSize);
    }, [filteredPlayers, currentPage, pageSize]);

    const getRatingBadge = (player: Player) => {
        const scoutingLevel = gameState.scoutedPlayerIds[player.id] || 0;
        if (scoutingLevel >= 100) {
            return (
                <div className="w-8 h-8 rounded-lg bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/40 flex items-center justify-center shrink-0">
                    <span className="font-black text-xs text-[var(--apex-gold)]">{player.rating}</span>
                </div>
            );
        }

        const range = Math.max(1, Math.ceil(5 * (1 - scoutingLevel / 100)));
        const min = Math.max(1, player.rating - range);
        const max = Math.min(99, player.rating + range);

        return (
            <div className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-center shrink-0" title={`Ojeado al ${scoutingLevel}%`}>
                <span className="font-bold text-slate-300 text-[11px] block leading-none">{min}-{max}</span>
                <span className="text-[7px] text-slate-500 font-semibold uppercase">OVR</span>
            </div>
        );
    };

    const handleInspectPlayer = (player: Player) => {
        dispatch({ type: 'SET_VIEWING_PLAYER', payload: player });
    };

    return (
        <div className="space-y-4">
            {/* 1. COMPACT UNIFIED FILTER BAR */}
            <div className="apex-card p-3 sm:p-4 space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-2.5">
                    {/* Search Input with Club & Player support */}
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        <input 
                            type="text" 
                            placeholder="Buscar por jugador o club (ej: 'River', 'Vinicius')..." 
                            value={filterName} 
                            onChange={e => {
                                setFilterName(e.target.value);
                                setCurrentPage(1);
                            }} 
                            className="w-full pl-9 pr-8 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)] transition-colors" 
                        />
                        {filterName && (
                            <button
                                onClick={() => { setFilterName(''); setCurrentPage(1); }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Position Segmented Pills */}
                    <div className="flex items-center gap-1 w-full md:w-auto bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto justify-between sm:justify-center">
                        {([
                            { id: 'ALL', label: 'Todos' },
                            { id: 'POR', label: 'POR' },
                            { id: 'DEF', label: 'DEF' },
                            { id: 'CEN', label: 'MED' },
                            { id: 'DEL', label: 'DEL' },
                        ] as const).map(pos => (
                            <button
                                key={pos.id}
                                onClick={() => {
                                    setFilterPos(pos.id as any);
                                    setCurrentPage(1);
                                }}
                                className={`px-3 py-1 rounded-lg font-bold text-xs uppercase transition-colors cursor-pointer ${
                                    filterPos === pos.id 
                                        ? 'bg-[var(--apex-gold)] text-slate-950 font-black' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {pos.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort & Layout View Toggle */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 flex-1 md:flex-initial">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                            <select
                                value={sortOption}
                                onChange={e => setSortOption(e.target.value as SortOption)}
                                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer w-full"
                            >
                                <option value="rating" className="bg-[#0E131F] text-white">Media (OVR)</option>
                                <option value="potential" className="bg-[#0E131F] text-white">Potencial</option>
                                <option value="value" className="bg-[#0E131F] text-white">Valor</option>
                                <option value="age" className="bg-[#0E131F] text-white">Edad</option>
                                <option value="wage" className="bg-[#0E131F] text-white">Salario</option>
                            </select>
                        </div>

                        {/* Layout Toggle (Table vs Grid) */}
                        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
                            <button
                                onClick={() => handleSetViewMode('table')}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    viewMode === 'table' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                                title="Vista Tabla"
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleSetViewMode('grid')}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                                title="Vista Cuadrícula"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories & Results Count */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
                        {[
                            { id: 'ALL', label: 'Todos' },
                            { id: 'WONDERKIDS', label: 'Sub-22 (Promesas)' },
                            { id: 'PRIME', label: 'Titulares (23-29)' },
                            { id: 'VETERANS', label: 'Veteranos (30+)' },
                            { id: 'EXPIRING', label: 'Último Año Contrato' },
                            { id: 'AFFORDABLE', label: 'En Presupuesto' },
                        ].map(cat => {
                            const isActive = filterCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setFilterCategory(cat.id as CategoryFilter);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border whitespace-nowrap cursor-pointer ${
                                        isActive 
                                            ? 'bg-white/15 text-white border-white/30 font-bold' 
                                            : 'bg-transparent text-slate-400 border-white/5 hover:text-white'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0 pl-2">
                        <span>{filteredPlayers.length} futbolistas</span>
                        <span>•</span>
                        <span>Pág {currentPage}/{totalPages}</span>
                    </div>
                </div>
            </div>

            {/* 2. PLAYERS LISTING: TABLE VIEW (Desktop / Clean) */}
            {viewMode === 'table' ? (
                <div className="apex-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-black/50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
                                <tr>
                                    <th className="py-3 px-3 sm:px-4">Futbolista</th>
                                    <th className="py-3 px-2 text-center">Pos</th>
                                    <th className="py-3 px-2 text-center">Edad</th>
                                    <th className="py-3 px-2 text-center">OVR</th>
                                    <th className="py-3 px-3">Club</th>
                                    <th className="py-3 px-3 text-right">Valor</th>
                                    <th className="py-3 px-3 text-right hidden sm:table-cell">Salario Est.</th>
                                    <th className="py-3 px-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {paginatedPlayers.map(player => {
                                    const playerTeam = playerTeamMap.get(player.id);
                                    const age = getPlayerAge(player);
                                    const expectedWage = getExpectedWage(player, myTeam.tier, 'FirstTeam');
                                    const isScouted = (gameState.scoutedPlayerIds[player.id] || 0) >= 100;

                                    return (
                                        <tr 
                                            key={player.id} 
                                            onClick={() => handleInspectPlayer(player)}
                                            className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                                        >
                                            {/* Name & Photo */}
                                            <td className="py-2.5 px-3 sm:px-4">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <PlayerPhoto player={player} className="w-9 h-9 rounded-xl shrink-0" />
                                                    <div className="min-w-0">
                                                        <span className="font-bold text-white group-hover:text-[var(--apex-gold)] transition-colors truncate block">
                                                            {player.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium">
                                                            {player.contractYears}a contrato
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Position */}
                                            <td className="py-2.5 px-2 text-center">
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-200 uppercase">
                                                    {player.position}
                                                </span>
                                            </td>

                                            {/* Age */}
                                            <td className="py-2.5 px-2 text-center font-semibold text-slate-300">
                                                {age}a
                                            </td>

                                            {/* OVR */}
                                            <td className="py-2.5 px-2 text-center">
                                                {getRatingBadge(player)}
                                            </td>

                                            {/* Club */}
                                            <td className="py-2.5 px-3 text-slate-300">
                                                {playerTeam ? (
                                                    <div className="flex items-center gap-1.5 min-w-0 max-w-[140px] truncate">
                                                        <div className="w-4 h-4 shrink-0 inline-flex">
                                                            <TeamLogo team={playerTeam} />
                                                        </div>
                                                        <span className="truncate">{playerTeam.shortName || playerTeam.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500">Agente Libre</span>
                                                )}
                                            </td>

                                            {/* Value */}
                                            <td className="py-2.5 px-3 text-right font-black text-emerald-400 whitespace-nowrap">
                                                {formatTransferFee(player.value)}
                                            </td>

                                            {/* Wage */}
                                            <td className="py-2.5 px-3 text-right font-medium text-slate-300 whitespace-nowrap hidden sm:table-cell">
                                                {formatWeeklyWage(expectedWage)}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {!isScouted && (
                                                        <button
                                                            onClick={() => {
                                                                dispatch({ type: 'SCOUT_PLAYER', payload: { playerId: player.id } });
                                                                showToast(`Ojeador asignado a ${player.name}`, 'info');
                                                            }}
                                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                                            title="Ojear jugador"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}

                                                    {marketOpen ? (
                                                        <button
                                                            onClick={() => onStartNegotiation(player)}
                                                            className="px-3 py-1.5 rounded-lg bg-[var(--apex-gold)] hover:bg-yellow-400 text-slate-950 font-black text-[11px] uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                                                        >
                                                            Fichar
                                                        </button>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded bg-white/5 text-slate-500 text-[10px] font-bold flex items-center gap-1" title="Mercado actualmente cerrado">
                                                            <Lock className="w-3 h-3" />
                                                            <span>Cerrado</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {paginatedPlayers.map(player => {
                        const playerTeam = playerTeamMap.get(player.id);
                        const age = getPlayerAge(player);
                        const expectedWage = getExpectedWage(player, myTeam.tier, 'FirstTeam');
                        const isScouted = (gameState.scoutedPlayerIds[player.id] || 0) >= 100;

                        return (
                            <div 
                                key={player.id} 
                                onClick={() => handleInspectPlayer(player)}
                                className="apex-card p-3.5 hover:border-white/20 transition-all flex flex-col justify-between gap-3 cursor-pointer group"
                            >
                                <div className="flex items-center justify-between gap-2.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <PlayerPhoto player={player} className="w-11 h-11 rounded-2xl shrink-0 border border-white/10" />
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-sm text-white group-hover:text-[var(--apex-gold)] transition-colors truncate">
                                                {player.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 truncate">
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-200 uppercase">
                                                    {player.position}
                                                </span>
                                                <span>{age}a</span>
                                                {playerTeam && (
                                                    <>
                                                        <span>•</span>
                                                        <div className="w-3.5 h-3.5 shrink-0 inline-flex">
                                                            <TeamLogo team={playerTeam} />
                                                        </div>
                                                        <span className="truncate">{playerTeam.shortName || playerTeam.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {getRatingBadge(player)}
                                </div>

                                <div className="grid grid-cols-2 gap-2 py-2 px-2.5 rounded-xl bg-black/30 border border-white/5 text-center">
                                    <div>
                                        <span className="text-[9px] text-slate-500 font-semibold uppercase block">Valor</span>
                                        <span className="text-xs font-bold text-emerald-400 truncate block">{formatTransferFee(player.value)}</span>
                                    </div>
                                    <div className="border-l border-white/5">
                                        <span className="text-[9px] text-slate-500 font-semibold uppercase block">Salario Est.</span>
                                        <span className="text-xs font-bold text-slate-300 truncate block">{formatWeeklyWage(expectedWage)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    {!isScouted && (
                                        <button
                                            onClick={() => {
                                                dispatch({ type: 'SCOUT_PLAYER', payload: { playerId: player.id } });
                                                showToast(`Ojeador asignado a ${player.name}`, 'info');
                                            }}
                                            className="px-3 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10 text-xs font-bold cursor-pointer"
                                        >
                                            Ojear
                                        </button>
                                    )}

                                    {marketOpen ? (
                                        <button
                                            onClick={() => onStartNegotiation(player)}
                                            className="flex-1 py-2 rounded-xl bg-[var(--apex-gold)] text-slate-950 hover:bg-yellow-400 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                                        >
                                            Fichar
                                        </button>
                                    ) : (
                                        <div className="flex-1 py-2 rounded-xl bg-white/5 text-slate-500 font-bold text-xs text-center flex items-center justify-center gap-1.5 border border-white/5">
                                            <Lock className="w-3.5 h-3.5" />
                                            <span>Mercado Cerrado</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 3. PAGINATION */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-3">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>
                    <span className="text-xs font-bold text-slate-400">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                        Siguiente <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
});
