import React, { useState, useMemo } from 'react';
import { GameState, Player } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrencyShort, formatWeeklyWage } from '../../utils';
import { 
    ArrowUpDown, 
    Search, 
    X, 
    LayoutGrid, 
    List, 
    Users, 
    Shield,
    GraduationCap,
    Sparkles
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useToast } from '../common/ToastProvider';
import { PlayerPhoto } from '../../data/teams/helpers';
import { 
    getPlayerAge, 
    getPlayerPotential
} from '../../utils/playerUtils';
import { calculateSquadPower } from '../../services/squadProgressionService';
import { TacticalLineupView } from './squad/TacticalLineupView';

interface SquadScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

type SortOption = 'position' | 'rating' | 'value' | 'age' | 'name';
type SortDirection = 'desc' | 'asc';
type FilterPosition = 'ALL' | 'POR' | 'DEF' | 'CEN' | 'DEL';

export const SquadScreen = React.memo(({ gameState, dispatch }: SquadScreenProps) => {
    const [activeTab, setActiveTab] = useState<'FIRST_TEAM' | 'TACTICS' | 'ACADEMY'>('FIRST_TEAM');
    const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>(() => {
        return (localStorage.getItem('apex_squad_view_mode') as 'GRID' | 'TABLE') || 'GRID';
    });
    const [searchName, setSearchName] = useState('');
    
    const [sortOption, setSortOption] = useState<SortOption>(() => {
        return (localStorage.getItem('apex_squad_sort_option') as SortOption) || 'position';
    });
    const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
        return (localStorage.getItem('apex_squad_sort_direction') as SortDirection) || 'desc';
    });
    const [filterPosition, setFilterPosition] = useState<FilterPosition>('ALL');
    const [academyFilter, setAcademyFilter] = useState<FilterPosition>('ALL');
    const [academySearch, setAcademySearch] = useState('');
    const [playerToPromote, setPlayerToPromote] = useState<Player | null>(null);
    const { showToast } = useToast();

    const squadPower = useMemo(
        () => gameState.team.squadPower || calculateSquadPower(gameState.team),
        [gameState.team]
    );

    const onViewPlayer = (player: Player) => {
        dispatch({ type: 'SET_VIEWING_PLAYER', payload: player });
    };

    const handlePromote = (player: Player) => {
        if (gameState.team.squad.length >= 25) {
            showToast("La plantilla está llena (Máx 25). Vende jugadores antes de ascender a juveniles.", 'warning');
            return;
        }
        setPlayerToPromote(player);
    };

    const confirmPromote = () => {
        if (playerToPromote) {
            dispatch({ type: 'PROMOTE_PLAYER', payload: playerToPromote });
            showToast(`¡${playerToPromote.name} ha sido ascendido al primer equipo!`, 'success');
            setPlayerToPromote(null);
        }
    };

    const getPositionColor = (pos: string) => {
        switch (pos) {
            case 'POR': return 'text-amber-300 bg-amber-400/10 border-amber-400/25';
            case 'DEF': return 'text-sky-400 bg-sky-400/10 border-sky-400/25';
            case 'CEN': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25';
            case 'DEL': return 'text-rose-400 bg-rose-400/10 border-rose-400/25';
            default: return 'text-slate-300 bg-white/5 border-white/10';
        }
    };

    const getRatingBadgeStyle = (rating: number) => {
        if (rating >= 80) return 'bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border-[var(--apex-gold)]/40';
        if (rating >= 74) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
        return 'bg-white/5 text-white border-white/10';
    };

    const handleSortChange = (newSort: SortOption) => {
        setSortOption(newSort);
        localStorage.setItem('apex_squad_sort_option', newSort);
    };

    const handleToggleDirection = () => {
        const newDir: SortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
        setSortDirection(newDir);
        localStorage.setItem('apex_squad_sort_direction', newDir);
    };

    const handleViewModeChange = (mode: 'GRID' | 'TABLE') => {
        setViewMode(mode);
        localStorage.setItem('apex_squad_view_mode', mode);
    };

    const getPositionRank = (pos: string, dir: SortDirection) => {
        if (dir === 'desc') {
            switch (pos) {
                case 'DEL': return 1;
                case 'CEN': return 2;
                case 'DEF': return 3;
                case 'POR': return 4;
                default: return 5;
            }
        } else {
            switch (pos) {
                case 'POR': return 1;
                case 'DEF': return 2;
                case 'CEN': return 3;
                case 'DEL': return 4;
                default: return 5;
            }
        }
    };

    const sortedSquad = useMemo(() => {
        const query = searchName.toLowerCase().trim();
        const filtered = gameState.team.squad.filter(player => {
            if (filterPosition !== 'ALL' && player.position !== filterPosition) return false;
            if (query && !player.name.toLowerCase().includes(query)) return false;
            return true;
        });

        return [...filtered].sort((a, b) => {
            if (sortOption === 'position') {
                const rankA = getPositionRank(a.position, sortDirection);
                const rankB = getPositionRank(b.position, sortDirection);
                if (rankA !== rankB) return rankA - rankB;
                if (b.rating !== a.rating) return b.rating - a.rating;
                return b.value - a.value;
            }
            switch (sortOption) {
                case 'rating':
                    return sortDirection === 'desc' ? b.rating - a.rating : a.rating - b.rating;
                case 'value':
                    return sortDirection === 'desc' ? b.value - a.value : a.value - b.value;
                case 'age':
                    return sortDirection === 'desc' ? (b.age || 0) - (a.age || 0) : (a.age || 0) - (b.age || 0);
                case 'name':
                    return sortDirection === 'desc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });
    }, [gameState.team.squad, filterPosition, searchName, sortOption, sortDirection]);

    const filteredAcademy = useMemo(() => {
        const academy = gameState.youthAcademy || [];
        const query = academySearch.toLowerCase().trim();
        return academy.filter(player => {
            if (academyFilter !== 'ALL' && player.position !== academyFilter) return false;
            if (query && !player.name.toLowerCase().includes(query)) return false;
            return true;
        }).sort((a, b) => getPlayerPotential(b) - getPlayerPotential(a));
    }, [gameState.youthAcademy, academyFilter, academySearch]);

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-4 pb-24 max-w-7xl mx-auto">
            {/* Header & Navigation Tabs */}
            <div className="apex-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                    <div>
                        <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Plantilla</h1>
                        <p className="text-[11px] text-slate-400 font-medium">
                            {gameState.team.coach?.name || 'Director Técnico'} • Formación {gameState.team.coach?.preferredFormation || '4-4-2'}
                        </p>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                        {gameState.team.squad.length}/25
                    </span>
                </div>
                
                {/* Segmented Control Tabs */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
                    <button
                        onClick={() => setActiveTab('FIRST_TEAM')}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 flex items-center justify-center gap-1.5 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                            activeTab === 'FIRST_TEAM' 
                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span>Plantel</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('TACTICS')}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 flex items-center justify-center gap-1.5 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                            activeTab === 'TACTICS' 
                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Táctica</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('ACADEMY')}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 flex items-center justify-center gap-1.5 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                            activeTab === 'ACADEMY' 
                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Cantera</span>
                        {gameState.youthAcademy.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
                                {gameState.youthAcademy.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {activeTab === 'FIRST_TEAM' && (
                <div className="space-y-3.5">
                    {/* Compact Squad Power & Filter Bar */}
                    <div className="apex-card p-3 sm:p-3.5 space-y-3">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
                            {/* Position Filter */}
                            <div className="flex items-center gap-1 w-full md:w-auto bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto justify-between sm:justify-start">
                                {([
                                    { id: 'ALL', label: 'Todos' },
                                    { id: 'DEL', label: 'DEL' },
                                    { id: 'CEN', label: 'MED' },
                                    { id: 'DEF', label: 'DEF' },
                                    { id: 'POR', label: 'POR' },
                                ] as const).map(pos => (
                                    <button
                                        key={pos.id}
                                        onClick={() => setFilterPosition(pos.id as any)}
                                        className={`px-3 py-1 rounded-lg font-bold text-[11px] uppercase transition-colors cursor-pointer ${
                                            filterPosition === pos.id 
                                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black' 
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {pos.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search + Sort + View Mode */}
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-48">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar jugador..." 
                                        value={searchName} 
                                        onChange={e => setSearchName(e.target.value)} 
                                        className="w-full pl-8 pr-7 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]" 
                                    />
                                    {searchName && (
                                        <button
                                            onClick={() => setSearchName('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10 shrink-0">
                                    <select
                                        value={sortOption}
                                        onChange={(e) => handleSortChange(e.target.value as SortOption)}
                                        className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                                    >
                                        <option value="position" className="bg-[#0E131F] text-white">Posición</option>
                                        <option value="rating" className="bg-[#0E131F] text-white">Media (OVR)</option>
                                        <option value="value" className="bg-[#0E131F] text-white">Valor</option>
                                        <option value="age" className="bg-[#0E131F] text-white">Edad</option>
                                        <option value="name" className="bg-[#0E131F] text-white">Nombre</option>
                                    </select>
                                    <button
                                        onClick={handleToggleDirection}
                                        className="p-0.5 hover:bg-white/10 rounded text-[var(--apex-gold)] cursor-pointer"
                                        title="Invertir orden"
                                    >
                                        <ArrowUpDown className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
                                    <button
                                        onClick={() => handleViewModeChange('GRID')}
                                        className={`p-1 rounded-lg transition-colors cursor-pointer ${viewMode === 'GRID' ? 'bg-[var(--apex-gold)] text-slate-950' : 'text-slate-400 hover:text-white'}`}
                                        title="Tarjetas"
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleViewModeChange('TABLE')}
                                        className={`p-1 rounded-lg transition-colors cursor-pointer ${viewMode === 'TABLE' ? 'bg-[var(--apex-gold)] text-slate-950' : 'text-slate-400 hover:text-white'}`}
                                        title="Tabla"
                                    >
                                        <List className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Compact Squad Power Summary */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px]">
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 font-semibold">
                                    Media Equipo: <strong className="text-[var(--apex-gold)] font-black">{squadPower.overall}</strong>
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-400">ATA <strong className="text-white">{squadPower.attack}</strong></span>
                                <span className="text-slate-400">MED <strong className="text-white">{squadPower.midfield}</strong></span>
                                <span className="text-slate-400">DEF <strong className="text-white">{squadPower.defense}</strong></span>
                            </div>
                            <span className="text-slate-500 text-[10px] font-semibold">
                                Toca un jugador para ver ficha y contrato
                            </span>
                        </div>
                    </div>

                    {/* GRID VIEW: Clean, Uncluttered Cards */}
                    {viewMode === 'GRID' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                            {sortedSquad.map((player) => {
                                const age = getPlayerAge(player);
                                const condition = Math.round(player.condition ?? 100);

                                return (
                                    <div
                                        key={player.id}
                                        onClick={() => onViewPlayer(player)}
                                        className="apex-card p-3.5 hover:border-white/25 transition-colors cursor-pointer flex flex-col justify-between group"
                                    >
                                        {/* Top Row: Photo, Name, Position/Age, Rating */}
                                        <div className="flex items-center justify-between gap-2.5 mb-3">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <PlayerPhoto 
                                                    player={player} 
                                                    className="w-11 h-11 rounded-full shrink-0" 
                                                />
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-sm text-white group-hover:text-[var(--apex-gold)] transition-colors truncate">
                                                        {player.name}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${getPositionColor(player.position)}`}>
                                                            {player.position}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-medium">{age} años</span>
                                                        {player.isInjured && (
                                                            <span className="text-[10px] font-bold text-rose-400">🚑 {player.injuryWeeksRemaining}s</span>
                                                        )}
                                                        {player.isSuspended && (
                                                            <span className="text-[10px] font-bold text-rose-400">🟥 {player.suspensionWeeksRemaining}p</span>
                                                        )}
                                                        {player.isTransferListed && !player.isInjured && !player.isSuspended && (
                                                            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                                                                Transferible
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm border ${getRatingBadgeStyle(player.rating)}`}>
                                                {player.rating}
                                            </div>
                                        </div>

                                        {/* Bottom Row: 3 Essential Metrics */}
                                        <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-white/5 text-center">
                                            <div>
                                                <span className="text-[9px] text-slate-500 font-semibold uppercase block">Valor</span>
                                                <span className="text-xs font-bold text-white truncate block">{formatCurrencyShort(player.value)}</span>
                                            </div>
                                            <div className="border-x border-white/5 px-1">
                                                <span className="text-[9px] text-slate-500 font-semibold uppercase block">Salario</span>
                                                <span className="text-xs font-bold text-slate-300 truncate block">{formatWeeklyWage(player.wage)}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-slate-500 font-semibold uppercase block">Físico</span>
                                                <span className={`text-xs font-bold block ${
                                                    condition >= 75 ? 'text-emerald-400' : condition >= 50 ? 'text-amber-400' : 'text-rose-400'
                                                }`}>
                                                    {condition}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* TABLE VIEW */
                        <div className="apex-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[640px]">
                                    <thead>
                                        <tr className="bg-black/30 text-[10px] font-bold text-slate-400 uppercase border-b border-white/5">
                                            <th className="px-4 py-3">Jugador</th>
                                            <th className="px-3 py-3 text-center">Pos</th>
                                            <th className="px-3 py-3 text-center">Edad</th>
                                            <th className="px-3 py-3 text-center">Media</th>
                                            <th className="px-3 py-3 text-center">Valor</th>
                                            <th className="px-3 py-3 text-center">Salario</th>
                                            <th className="px-3 py-3 text-center">Físico</th>
                                            <th className="px-3 py-3 text-center">G / A</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-xs">
                                        {sortedSquad.map((player) => {
                                            const age = getPlayerAge(player);
                                            const condition = Math.round(player.condition ?? 100);

                                            return (
                                                <tr 
                                                    key={player.id} 
                                                    onClick={() => onViewPlayer(player)}
                                                    className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                                                >
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <PlayerPhoto player={player} className="w-8 h-8 rounded-full" />
                                                            <div>
                                                                <div className="font-bold text-white group-hover:text-[var(--apex-gold)] transition-colors">
                                                                    {player.name}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500">
                                                                    Contrato: {player.contractYears}a • {player.morale}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getPositionColor(player.position)}`}>
                                                            {player.position}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-slate-300 font-semibold">{age}</td>
                                                    <td className="px-3 py-2.5 text-center font-black text-[var(--apex-gold)]">{player.rating}</td>
                                                    <td className="px-3 py-2.5 text-center font-bold text-white">{formatCurrencyShort(player.value)}</td>
                                                    <td className="px-3 py-2.5 text-center text-slate-300">{formatWeeklyWage(player.wage)}</td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        {player.isInjured ? (
                                                            <span className="text-[10px] font-bold text-rose-400">🚑 {player.injuryWeeksRemaining}s</span>
                                                        ) : player.isSuspended ? (
                                                            <span className="text-[10px] font-bold text-rose-400">🟥 {player.suspensionWeeksRemaining}p</span>
                                                        ) : (
                                                            <span className={`font-bold ${condition >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                                {condition}%
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-slate-400 font-semibold">
                                                        {player.stats?.goals || 0} / {player.stats?.assists || 0}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'TACTICS' && (
                <TacticalLineupView gameState={gameState} dispatch={dispatch} />
            )}

            {activeTab === 'ACADEMY' && (
                <div className="space-y-3.5">
                    {/* Compact Academy Filter Bar */}
                    <div className="apex-card p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-1 w-full sm:w-auto bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto">
                            {(['ALL', 'POR', 'DEF', 'CEN', 'DEL'] as FilterPosition[]).map(pos => (
                                <button
                                    key={pos}
                                    onClick={() => setAcademyFilter(pos)}
                                    className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                                        academyFilter === pos
                                            ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {pos === 'ALL' ? 'Todos' : pos}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-60">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar canterano..."
                                value={academySearch}
                                onChange={(e) => setAcademySearch(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]"
                            />
                            {academySearch && (
                                <button
                                    onClick={() => setAcademySearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {gameState.youthAcademy.length === 0 ? (
                        <div className="apex-card p-12 text-center flex flex-col items-center gap-2">
                            <GraduationCap className="w-10 h-10 text-slate-500" />
                            <h4 className="text-sm font-bold text-white">Sin juveniles en la academia</h4>
                            <p className="text-xs text-slate-400 max-w-md">
                                Al inicio de cada temporada ingresarán nuevas promesas formadas en las divisiones inferiores del club.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredAcademy.map(player => {
                                const age = getPlayerAge(player);
                                const potential = getPlayerPotential(player);
                                const isSquadFull = gameState.team.squad.length >= 25;

                                return (
                                    <div 
                                        key={player.id} 
                                        className="apex-card p-3.5 flex flex-col justify-between gap-3 hover:border-white/20 transition-colors"
                                    >
                                        <div 
                                            className="flex items-center justify-between gap-2.5 cursor-pointer"
                                            onClick={() => onViewPlayer(player)}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <PlayerPhoto player={player} className="w-11 h-11 rounded-full shrink-0" />
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-sm text-white truncate hover:text-[var(--apex-gold)] transition-colors">
                                                        {player.name}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${getPositionColor(player.position)}`}>
                                                            {player.position}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400">{age} años</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="text-xs font-black text-white">
                                                    {player.rating} <span className="text-slate-500">→</span> <span className="text-[var(--apex-gold)]">{potential}</span>
                                                </div>
                                                <span className="text-[9px] text-slate-500 font-semibold uppercase">Potencial</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handlePromote(player)}
                                            disabled={isSquadFull}
                                            className={`w-full py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                                                isSquadFull
                                                    ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                                    : 'bg-[var(--apex-gold)] hover:bg-yellow-400 text-slate-950 font-black'
                                            }`}
                                        >
                                            {isSquadFull ? 'Plantel Lleno (25/25)' : 'Ascender al Primer Equipo'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <ConfirmationModal
                isOpen={playerToPromote !== null}
                title="Ascender Jugador"
                message={`¿Estás seguro de que quieres ascender a ${playerToPromote?.name} al primer equipo?`}
                confirmText="Ascender"
                cancelText="Cancelar"
                confirmVariant="success"
                onConfirm={confirmPromote}
                onCancel={() => setPlayerToPromote(null)}
            />
        </div>
    );
});
