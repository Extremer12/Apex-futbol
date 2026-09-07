import React from 'react';
import { Player, Team, GameState } from '../../../types';
import { GameAction } from '../../../state/reducer';
import { TeamLogo, PlayerPhoto } from '../../../data/teams/helpers';
import { 
    formatCurrencyShort, 
    formatWeeklyWage 
} from '../../../utils';
import { 
    getPlayerAge, 
    getPlayerPotential, 
    getPlayerPotentialTier, 
    getTierBadge, 
    getExpectedWage 
} from '../../../utils/playerUtils';
import { 
    Sparkles, 
    TrendingUp, 
    DollarSign, 
    Shield, 
    Clock, 
    Search, 
    Briefcase, 
    ChevronLeft, 
    ChevronRight,
    Users
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
}

export const TransfersMarketTab: React.FC<TransfersMarketTabProps> = ({
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
}) => {
    const { showToast } = useToast();
    const pageSize = 24;

    const filteredPlayers = React.useMemo(() => {
        return availablePlayers.filter(player => {
            if (filterName && !player.name.toLowerCase().includes(filterName.toLowerCase())) {
                return false;
            }
            if (filterPos !== 'ALL' && player.position !== filterPos) {
                return false;
            }
            const age = getPlayerAge(player);
            const pot = getPlayerPotential(player);
            const potTier = getPlayerPotentialTier(player);

            if (filterCategory === 'WONDERKIDS') {
                if (potTier !== 'Wonderkid' && (age > 22 || pot < 85)) return false;
            } else if (filterCategory === 'PRIME') {
                if (age < 23 || age > 29) return false;
            } else if (filterCategory === 'VETERANS') {
                if (age < 30) return false;
            } else if (filterCategory === 'EXPIRING') {
                if (player.contractYears > 1) return false;
            } else if (filterCategory === 'AFFORDABLE') {
                if (player.value > gameState.finances.transferBudget) return false;
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
    }, [availablePlayers, filterName, filterPos, filterCategory, sortOption, gameState.finances.transferBudget]);

    const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / pageSize));
    const paginatedPlayers = React.useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPlayers.slice(start, start + pageSize);
    }, [filteredPlayers, currentPage, pageSize]);

    const getRatingDisplay = (player: Player) => {
        const scoutingLevel = gameState.scoutedPlayerIds[player.id] || 0;
        
        if (scoutingLevel >= 100) {
            return (
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/40 shadow-[0_0_15px_rgba(200,168,78,0.2)]">
                    <span className="font-black text-sm text-[var(--apex-gold)]">{player.rating}</span>
                </div>
            );
        }

        const range = Math.max(1, Math.ceil(5 * (1 - scoutingLevel / 100)));
        const min = Math.max(1, player.rating - range);
        const max = Math.min(99, player.rating + range);

        return (
            <div className="flex flex-col items-center">
                <span className="font-bold text-white/60 text-xs">{min}-{max}</span>
                <div className="w-10 h-1 bg-black/50 rounded-full mt-1.5 overflow-hidden border border-white/5">
                    <div className="h-full bg-white/30" style={{ width: `${scoutingLevel}%` }}></div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
                {[
                    { id: 'ALL', label: 'Todos', icon: Users },
                    { id: 'WONDERKIDS', label: '⭐ Promesas (<22a)', icon: Sparkles },
                    { id: 'PRIME', label: '🔥 En Prime (23-29a)', icon: TrendingUp },
                    { id: 'VETERANS', label: '🛡️ Veteranos (30+a)', icon: Shield },
                    { id: 'EXPIRING', label: '⏳ Fin de Contrato', icon: Clock },
                    { id: 'AFFORDABLE', label: '💰 En Presupuesto', icon: DollarSign },
                ].map(cat => {
                    const Icon = cat.icon;
                    const isActive = filterCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setFilterCategory(cat.id as CategoryFilter);
                                setCurrentPage(1);
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                                isActive 
                                    ? 'bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] border-[var(--apex-gold)] shadow-[0_0_15px_rgba(200,168,78,0.2)]' 
                                    : 'bg-black/30 text-white/50 border-white/5 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Secondary Filters Bar */}
            <div className={`apex-card p-3 flex flex-col md:flex-row gap-3 items-center justify-between ${!marketOpen && 'opacity-60 pointer-events-none'}`}>
                {/* Search Input */}
                <div className="flex-1 w-full relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input 
                        type="text" 
                        placeholder="Buscar jugador por nombre o apellido..." 
                        value={filterName} 
                        onChange={e => {
                            setFilterName(e.target.value);
                            setCurrentPage(1);
                        }} 
                        className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-white/30 focus:outline-none focus:border-[var(--apex-gold)] transition-colors" 
                    />
                </div>

                {/* Position Selector */}
                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {(['ALL', 'POR', 'DEF', 'CEN', 'DEL'] as const).map(pos => (
                        <button
                            key={pos}
                            onClick={() => {
                                setFilterPos(pos);
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-all ${
                                filterPos === pos 
                                    ? 'bg-[var(--apex-gold)] text-black' 
                                    : 'bg-black/30 text-white/50 border border-white/5 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {pos === 'ALL' ? 'Todos' : pos}
                        </button>
                    ))}
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-2 w-full md:w-auto bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Orden:</span>
                    <select
                        value={sortOption}
                        onChange={e => setSortOption(e.target.value as SortOption)}
                        className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                    >
                        <option value="rating" className="bg-slate-900 text-white">⭐ Valoración Media</option>
                        <option value="potential" className="bg-slate-900 text-white">✨ Mayor Potencial</option>
                        <option value="value" className="bg-slate-900 text-white">💶 Valor de Mercado</option>
                        <option value="age" className="bg-slate-900 text-white">👶 Juventud (Edad)</option>
                        <option value="wage" className="bg-slate-900 text-white">💼 Salario Actual</option>
                    </select>
                </div>
            </div>

            {/* Results Counter & Pagination Header */}
            <div className="flex items-center justify-between text-xs text-white/50 font-bold uppercase tracking-wider px-1">
                <span>Mostrando {paginatedPlayers.length} de {filteredPlayers.length} futbolistas</span>
                <span>Página {currentPage} de {totalPages}</span>
            </div>

            {/* Player Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${!marketOpen && 'opacity-60 pointer-events-none'}`}>
                {paginatedPlayers.map(player => {
                    const playerTeam = allTeams.find(t => t.squad.some(p => p.id === player.id));
                    const age = getPlayerAge(player);
                    const potTier = getPlayerPotentialTier(player);
                    const tierBadge = getTierBadge(potTier);
                    const expectedWage = getExpectedWage(player, myTeam.tier, 'FirstTeam');

                    return (
                        <div key={player.id} className="group apex-card p-4 hover:border-[var(--apex-border-active)] transition-all duration-300 flex flex-col justify-between">
                            <div>
                                {/* Player Card Top: Photo, Name, Team Logo */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <PlayerPhoto player={player} className="w-12 h-12 rounded-xl border border-white/10 shadow-md group-hover:scale-105 transition-transform" />
                                        <div>
                                            <h3 className="font-black text-sm text-white leading-tight group-hover:text-[var(--apex-gold)] transition-colors">
                                                {player.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 text-white/70 uppercase">
                                                    {player.position}
                                                </span>
                                                <span className="text-[10px] text-white/50 font-bold">{age} años</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-9 h-9 flex-shrink-0 bg-white/5 rounded-lg p-1 border border-white/10" title={playerTeam?.name}>
                                        <TeamLogo team={playerTeam} />
                                    </div>
                                </div>

                                {/* Badges & Contract Status */}
                                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase ${tierBadge.color}`}>
                                        {tierBadge.label}
                                    </span>
                                    {player.contractYears <= 1 && (
                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                                            ⏳ Expira ({player.contractYears}a)
                                        </span>
                                    )}
                                </div>

                                {/* Stats Row: Rating, Value, Wages */}
                                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 grid grid-cols-3 gap-2 text-center mb-4">
                                    <div>
                                        <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider block">Nivel</span>
                                        {getRatingDisplay(player)}
                                    </div>
                                    <div>
                                        <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider block">Valor</span>
                                        <span className="text-xs font-black text-emerald-400 mt-1 block">€{player.value}M</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider block">Salario</span>
                                        <span className="text-[10px] font-black text-white/80 mt-1.5 block">{formatWeeklyWage(expectedWage)}/sem</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                {(gameState.scoutedPlayerIds[player.id] || 0) < 100 && (
                                    <button
                                        onClick={() => {
                                            dispatch({ type: 'SCOUT_PLAYER', payload: { playerId: player.id } });
                                            showToast(`Ojeador asignado a observar a ${player.name}`, 'info');
                                        }}
                                        className="px-3 py-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10 text-[10px] font-bold uppercase flex items-center gap-1"
                                        title="Observar y desbloquear informe completo"
                                    >
                                        <Search className="w-3 h-3" /> Ojear
                                    </button>
                                )}
                                <button
                                    onClick={() => onStartNegotiation(player)}
                                    className="flex-1 py-2 rounded-xl bg-[var(--apex-gold)] text-black hover:bg-yellow-400 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[var(--apex-gold)]/20 flex items-center justify-center gap-1.5"
                                >
                                    <Briefcase className="w-3.5 h-3.5" /> Negociar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>
                    <span className="text-xs font-black text-white/60 uppercase">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 flex items-center gap-1"
                    >
                        Siguiente <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};
