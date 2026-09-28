import React, { useState } from 'react';
import { GameState, Player } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency, formatCurrencyShort, formatWeeklyWage } from '../../utils';
import { BriefcaseIcon, SparklesIcon, UsersIcon } from '../icons';
import { 
    TrendingUpIcon, 
    FilterIcon, 
    StarIcon, 
    Sparkles, 
    ArrowUpDown, 
    Search, 
    X, 
    LayoutGrid, 
    List, 
    Users, 
    Briefcase, 
    Star 
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useToast } from '../common/ToastProvider';
import { PlayerPhoto } from '../../data/teams/helpers';
import { 
    getPlayerAge, 
    getPlayerPotential, 
    getPlayerPotentialTier, 
    getTierBadge 
} from '../../utils/playerUtils';
import { calculateSquadPower } from '../../services/squadProgressionService';

interface SquadScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

type SortOption = 'position' | 'rating' | 'value' | 'age' | 'name';
type SortDirection = 'desc' | 'asc';
type FilterPosition = 'ALL' | 'POR' | 'DEF' | 'CEN' | 'DEL';

export const SquadScreen = React.memo(({ gameState, dispatch }: SquadScreenProps) => {
    const [activeTab, setActiveTab] = useState<'FIRST_TEAM' | 'ACADEMY'>('FIRST_TEAM');
    const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>(() => {
        return (localStorage.getItem('apex_squad_view_mode') as 'GRID' | 'TABLE') || 'GRID';
    });
    const [searchName, setSearchName] = useState('');
    
    // User preference persisted in localStorage. Defaults to 'position' and 'desc' (DEL -> CEN -> DEF -> POR)
    const [sortOption, setSortOption] = useState<SortOption>(() => {
        return (localStorage.getItem('apex_squad_sort_option') as SortOption) || 'position';
    });
    const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
        return (localStorage.getItem('apex_squad_sort_direction') as SortDirection) || 'desc';
    });
    const [filterPosition, setFilterPosition] = useState<FilterPosition>('ALL');
    const [playerToPromote, setPlayerToPromote] = useState<Player | null>(null);
    const { showToast } = useToast();

    const squadPower = gameState.team.squadPower || calculateSquadPower(gameState.team);

    const onViewPlayer = (player: Player) => {
        dispatch({ type: 'SET_VIEWING_PLAYER', payload: player });
    };

    const handlePromote = (player: Player) => {
        if (gameState.team.squad.length >= 25) {
            showToast("La plantilla está llena (Máx 25). Vende jugadores antes de ascender a juveniles.", 'warning');
            return;
        }
        setPlayerToPromote(player);
    }

    const confirmPromote = () => {
        if (playerToPromote) {
            dispatch({ type: 'PROMOTE_PLAYER', payload: playerToPromote });
            showToast(`¡${playerToPromote.name} ha sido ascendido al primer equipo!`, 'success');
            setPlayerToPromote(null);
        }
    }

    const getPositionColor = (pos: string) => {
        switch (pos) {
            case 'POR': return 'text-amber-300 bg-amber-400/10 border-amber-400/30';
            case 'DEF': return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
            case 'CEN': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
            case 'DEL': return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
            default: return 'text-white/60 bg-white/5 border-white/10';
        }
    };

    const getPositionName = (pos: string) => {
        switch (pos) {
            case 'POR': return 'Portero';
            case 'DEF': return 'Defensa';
            case 'CEN': return 'Centrocampista';
            case 'DEL': return 'Delantero';
            default: return pos;
        }
    };

    const getMoraleIndicator = (morale: string) => {
        switch (morale) {
            case 'Feliz': return { dot: 'bg-emerald-400', text: 'text-emerald-400' };
            case 'Contento': return { dot: 'bg-emerald-300', text: 'text-emerald-300' };
            case 'Normal': return { dot: 'bg-slate-400', text: 'text-slate-300' };
            case 'Descontento': return { dot: 'bg-amber-400', text: 'text-amber-400' };
            case 'Enojado': return { dot: 'bg-rose-500', text: 'text-rose-400' };
            default: return { dot: 'bg-slate-400', text: 'text-slate-400' };
        }
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

    const filteredSquad = gameState.team.squad.filter(player => {
        if (filterPosition !== 'ALL' && player.position !== filterPosition) return false;
        if (searchName.trim()) {
            const query = searchName.toLowerCase().trim();
            if (!player.name.toLowerCase().includes(query)) return false;
        }
        return true;
    });

    const sortedSquad = [...filteredSquad].sort((a, b) => {
        if (sortOption === 'position') {
            const rankA = getPositionRank(a.position, sortDirection);
            const rankB = getPositionRank(b.position, sortDirection);
            if (rankA !== rankB) {
                return rankA - rankB;
            }
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.value - a.value;
        }

        switch (sortOption) {
            case 'rating':
                return sortDirection === 'desc' ? b.rating - a.rating : a.rating - b.rating;
            case 'value':
                return sortDirection === 'desc' ? b.value - a.value : a.value - b.value;
            case 'age': {
                const ageA = a.age || 0;
                const ageB = b.age || 0;
                return sortDirection === 'desc' ? ageB - ageA : ageA - ageB;
            }
            case 'name':
                return sortDirection === 'desc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-5 animate-fade-in pb-24 max-w-[1400px] mx-auto">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0E131F] border border-white/10 p-3 sm:p-4 rounded-2xl shadow-xl">
                <div>
                    <h2 className="text-[10px] font-black text-[var(--apex-gold)] tracking-[0.25em] uppercase mb-0.5">Gestión Deportiva</h2>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Plantilla del Club</h1>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                            {gameState.team.squad.length}/25
                        </span>
                    </div>
                </div>
                
                {/* Segmented Control Tabs */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
                    <button
                        onClick={() => setActiveTab('FIRST_TEAM')}
                        className={`px-3.5 py-1.5 flex items-center gap-2 font-black text-xs uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
                            activeTab === 'FIRST_TEAM' 
                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black shadow-md' 
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span>Primer Equipo</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('ACADEMY')}
                        className={`px-3.5 py-1.5 flex items-center gap-2 font-black text-xs uppercase tracking-wider transition-all rounded-lg cursor-pointer ${
                            activeTab === 'ACADEMY' 
                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black shadow-md' 
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Cantera</span>
                        {gameState.youthAcademy.length > 0 && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center ml-0.5">
                                {gameState.youthAcademy.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {activeTab === 'FIRST_TEAM' && (
                <div className="space-y-4">
                    {/* Header Táctico y Poder del Plantel con Terreno de Juego Visible */}
                    <div className="relative h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-4 sm:mb-5">
                        {/* Imagen de fondo del campo de fútbol con zoom sutil */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-out animate-slow-zoom"
                            style={{ 
                                backgroundImage: 'url("/bg-pitch.png")',
                                filter: 'brightness(0.8) saturate(1.25)'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--apex-dark,#0B0F19)] via-black/40 to-black/10" />

                        {/* Contenedor flotante con datos del entrenador y métricas de poder */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                            {/* Bloque Entrenador con Glassmorphism */}
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-15 sm:h-15 bg-black/60 backdrop-blur-md border border-[var(--apex-gold)]/40 rounded-2xl flex items-center justify-center shadow-xl shrink-0">
                                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--apex-gold)]" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-none mb-1.5 truncate drop-shadow-md">
                                        {gameState.team.coach?.name || 'Director Técnico'}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black bg-[var(--apex-gold)] text-slate-950 px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                                            {gameState.team.coach?.style || 'Equilibrado'}
                                        </span>
                                        <span className="text-[10px] font-black bg-black/60 text-white border border-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded uppercase tracking-wider">
                                            {gameState.team.coach?.preferredFormation || '4-4-2'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Bloque Simétrico: Poder de Plantel & Confianza Táctica */}
                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                                {/* Métricas ATA / MED / DEF */}
                                <div className="flex items-center gap-2.5 bg-black/65 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-xl">
                                    <div className="text-center px-1">
                                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-black">Poder</div>
                                        <div className="text-lg font-black text-[var(--apex-gold)] leading-none">{squadPower.overall}</div>
                                    </div>
                                    <div className="h-6 w-px bg-white/10" />
                                    <div className="text-center px-1">
                                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">ATA</div>
                                        <div className="text-sm font-black text-rose-400 leading-none">{squadPower.attack}</div>
                                    </div>
                                    <div className="h-6 w-px bg-white/10" />
                                    <div className="text-center px-1">
                                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">MED</div>
                                        <div className="text-sm font-black text-amber-400 leading-none">{squadPower.midfield}</div>
                                    </div>
                                    <div className="h-6 w-px bg-white/10" />
                                    <div className="text-center px-1">
                                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">DEF</div>
                                        <div className="text-sm font-black text-sky-400 leading-none">{squadPower.defense}</div>
                                    </div>
                                </div>

                                {/* Confianza Táctica */}
                                <div className="flex flex-col items-end gap-1 bg-black/65 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-xl min-w-[130px]">
                                    <div className="flex items-center justify-between w-full text-[9px] font-black text-slate-300 uppercase tracking-widest gap-2">
                                        <span>Confianza</span>
                                        <span className="text-white font-bold">{gameState.team.coach?.satisfactionLevel || 0}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${
                                                (gameState.team.coach?.satisfactionLevel || 0) >= 70 ? 'bg-emerald-400' :
                                                (gameState.team.coach?.satisfactionLevel || 0) >= 40 ? 'bg-[var(--apex-gold)]' :
                                                'bg-rose-500'
                                            }`} 
                                            style={{ width: `${gameState.team.coach?.satisfactionLevel || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barra de Filtros y Orden Limpia & Ergonómica */}
                    <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-lg space-y-2.5">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
                            {/* Selector de Posiciones en Segmented Control */}
                            <div className="flex items-center gap-1 w-full md:w-auto bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto justify-between sm:justify-start">
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
                                        className={`px-3 py-1.5 rounded-lg font-black text-[11px] tracking-wider uppercase transition-all cursor-pointer ${
                                            filterPosition === pos.id 
                                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black shadow-sm' 
                                                : 'text-white/60 hover:text-white'
                                        }`}
                                    >
                                        {pos.label}
                                    </button>
                                ))}
                            </div>

                            {/* Buscador + Ordenación + Toggle de Vista */}
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                {/* Buscador de jugador */}
                                <div className="relative flex-1 md:w-48">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar futbolista..." 
                                        value={searchName} 
                                        onChange={e => setSearchName(e.target.value)} 
                                        className="w-full pl-8 pr-7 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-white/30 focus:outline-none focus:border-[var(--apex-gold)] transition-colors" 
                                    />
                                    {searchName && (
                                        <button
                                            onClick={() => setSearchName('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Criterio de Orden */}
                                <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10 shrink-0">
                                    <select
                                        value={sortOption}
                                        onChange={(e) => handleSortChange(e.target.value as SortOption)}
                                        className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                                    >
                                        <option value="position" className="bg-[#0E131F] text-white">Por Posición</option>
                                        <option value="rating" className="bg-[#0E131F] text-white">Por Media (OVR)</option>
                                        <option value="value" className="bg-[#0E131F] text-white">Por Valor</option>
                                        <option value="age" className="bg-[#0E131F] text-white">Por Edad</option>
                                        <option value="name" className="bg-[#0E131F] text-white">Por Nombre</option>
                                    </select>
                                    <button
                                        onClick={handleToggleDirection}
                                        className="p-1 hover:bg-white/10 rounded text-[var(--apex-gold)] transition-colors cursor-pointer"
                                        title={sortDirection === 'desc' ? 'Orden descendente (toca para invertir)' : 'Orden ascendente (toca para invertir)'}
                                    >
                                        <ArrowUpDown className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Vista Cards / Lista en pantallas grandes */}
                                <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
                                    <button
                                        onClick={() => handleViewModeChange('GRID')}
                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'GRID' ? 'bg-[var(--apex-gold)] text-slate-950 font-bold' : 'text-white/50 hover:text-white'}`}
                                        title="Vista de Tarjetas"
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleViewModeChange('TABLE')}
                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'TABLE' ? 'bg-[var(--apex-gold)] text-slate-950 font-bold' : 'text-white/50 hover:text-white'}`}
                                        title="Vista de Tabla"
                                    >
                                        <List className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Fila secundaria: Contador de jugadores */}
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-white/5">
                            <span>Mostrando {sortedSquad.length} de {gameState.team.squad.length} futbolistas</span>
                            <span className="text-[var(--apex-gold)]">{gameState.team.squad.length}/25 Plazas de Plantel</span>
                        </div>
                    </div>

                    {/* VISTA 1: GRID DE CARDS COMPACTAS, MODERNAS Y SIMÉTRICAS */}
                    {viewMode === 'GRID' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                            {sortedSquad.map((player) => {
                                const age = getPlayerAge(player);
                                const potTier = getPlayerPotentialTier(player);
                                const tierBadge = getTierBadge(potTier);
                                const moraleInfo = getMoraleIndicator(player.morale);

                                return (
                                    <div
                                        key={player.id}
                                        onClick={() => onViewPlayer(player)}
                                        className="group relative bg-[#0E131F] hover:bg-[#121828] border border-white/10 hover:border-[var(--apex-gold)]/50 rounded-xl p-3 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden"
                                    >
                                        {/* Barra superior fina de acento según media */}
                                        <div className={`absolute top-0 left-0 right-0 h-0.5 ${
                                            player.rating >= 80 ? 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500' :
                                            player.rating >= 74 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                                            'bg-gradient-to-r from-slate-600 to-slate-500'
                                        }`} />

                                        <div>
                                            {/* Header de la Tarjeta: Foto + Info Principal + Rating Badge */}
                                            <div className="flex items-center justify-between gap-2.5">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="relative shrink-0">
                                                        <PlayerPhoto 
                                                            player={player} 
                                                            className="w-11 h-11 rounded-xl border border-white/10 shadow-sm group-hover:border-[var(--apex-gold)]/40 transition-colors object-cover" 
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <h4 className="font-black text-sm text-white group-hover:text-[var(--apex-gold)] transition-colors truncate uppercase tracking-tight">
                                                                {player.name}
                                                            </h4>
                                                            {player.isTransferListed && (
                                                                <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest flex items-center gap-0.5">
                                                                    <Briefcase className="w-2.5 h-2.5" /> Venta
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-black border uppercase tracking-wider ${getPositionColor(player.position)}`}>
                                                                {player.position}
                                                            </span>
                                                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-black border uppercase tracking-wider ${tierBadge.color}`}>
                                                                {tierBadge.label}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-semibold">{age} años</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Rating OVR */}
                                                <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 font-black text-sm shadow-sm border ${
                                                    player.rating >= 80 
                                                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 border-amber-300 shadow-amber-500/20' 
                                                        : player.rating >= 74
                                                        ? 'bg-white/10 text-white border-white/20'
                                                        : 'bg-black/40 text-slate-400 border-white/5'
                                                }`}>
                                                    <span>{player.rating}</span>
                                                    {player.rating >= 85 && (
                                                        <Star className="w-2.5 h-2.5 fill-slate-950 ml-0.5 inline" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Métricas compactas y simétricas (4 columnas limpias) */}
                                            <div className="grid grid-cols-4 gap-1 p-2 rounded-lg bg-black/40 border border-white/5 my-2.5 text-center">
                                                <div>
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block">Valor</span>
                                                    <span className="text-[11px] font-black text-white truncate block">{formatCurrencyShort(player.value)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block">Sueldo</span>
                                                    <span className="text-[11px] font-black text-amber-300 truncate block">{formatWeeklyWage(player.wage)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block">G / A</span>
                                                    <span className="text-[11px] font-black text-white block">{player.stats?.goals || 0} / {player.stats?.assists || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block">Físico</span>
                                                    <div className="flex items-center justify-center gap-1 mt-0.5">
                                                        {player.isInjured ? (
                                                            <span className="text-[8px] font-black text-rose-400">🚑 {player.injuryWeeksRemaining}s</span>
                                                        ) : player.isSuspended ? (
                                                            <span className="text-[8px] font-black text-rose-400">🟥 {player.suspensionWeeksRemaining}p</span>
                                                        ) : (
                                                            <>
                                                                <div className="w-6 h-1 bg-black/60 rounded-full overflow-hidden border border-white/10">
                                                                    <div 
                                                                        className={`h-full ${
                                                                            (player.condition || 100) > 70 ? 'bg-emerald-400' :
                                                                            (player.condition || 100) > 40 ? 'bg-amber-400' :
                                                                            'bg-rose-500'
                                                                        }`}
                                                                        style={{ width: `${player.condition || 100}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[9px] font-black text-emerald-400">{player.condition || 100}%</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer de la Card: Moral & Contrato */}
                                        <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 pt-1.5 border-t border-white/5">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${moraleInfo.dot}`} />
                                                <span className={`text-[10px] font-semibold ${moraleInfo.text}`}>{player.morale}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                Contrato: <strong className="text-white font-semibold">{player.contractYears} {player.contractYears === 1 ? 'año' : 'años'}</strong>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* VISTA 2: TABLA DE ESCRITORIO LIMPIA */
                        <div className="apex-card overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="bg-black/40 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5">
                                            <th className="px-4 py-3">Jugador</th>
                                            <th className="px-3 py-3 text-center">Pos</th>
                                            <th className="px-3 py-3 text-center">Edad</th>
                                            <th className="px-3 py-3 text-center">Val</th>
                                            <th className="px-3 py-3 text-center">Valor</th>
                                            <th className="px-3 py-3 text-center">Condición</th>
                                            <th className="px-3 py-3 text-center">G/A</th>
                                            <th className="px-3 py-3 text-center">Moral</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {sortedSquad.map((player) => {
                                            const age = getPlayerAge(player);
                                            const potTier = getPlayerPotentialTier(player);
                                            const tierBadge = getTierBadge(potTier);

                                            return (
                                                <tr 
                                                    key={player.id} 
                                                    onClick={() => onViewPlayer(player)}
                                                    className="hover:bg-white/5 cursor-pointer transition-colors group"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <PlayerPhoto player={player} className="w-9 h-9 rounded-lg border border-white/10 shadow-sm group-hover:scale-105 transition-transform" />
                                                            <div>
                                                                <div className="font-bold text-sm text-white group-hover:text-[var(--apex-gold)] transition-colors flex items-center gap-1.5 flex-wrap">
                                                                    {player.name}
                                                                    {player.isTransferListed && <Briefcase className="w-3 h-3 text-[var(--apex-gold)]" />}
                                                                    <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border uppercase ${tierBadge.color}`}>
                                                                        {tierBadge.label}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[9px] text-white/40 font-bold uppercase tracking-wider">
                                                                    Salario: {formatWeeklyWage(player.wage)} • {player.contractYears}a rest.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${getPositionColor(player.position)}`}>
                                                            {player.position}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-center text-white/70 font-bold text-xs">{age}</td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className={`text-base font-black flex items-center justify-center gap-1 ${
                                                            player.rating >= 80 ? 'text-[var(--apex-gold)]' :
                                                            player.rating >= 70 ? 'text-white' :
                                                            'text-white/50'
                                                        }`}>
                                                            {player.rating}
                                                            {player.rating >= 85 && <Star className="w-3 h-3 fill-[var(--apex-gold)] text-[var(--apex-gold)]" />}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-center font-bold text-white/90 text-xs tracking-wider">{formatCurrencyShort(player.value)}</td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex flex-col items-center gap-1">
                                                            {player.isInjured ? (
                                                                <span className="text-[9px] font-black bg-[var(--apex-red)]/10 text-[var(--apex-red)] border border-[var(--apex-red)]/20 px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                                                                    🚑 {player.injuryWeeksRemaining} sem
                                                                </span>
                                                            ) : player.isSuspended ? (
                                                                <span className="text-[9px] font-black bg-[var(--apex-red)]/10 text-[var(--apex-red)] border border-[var(--apex-red)]/20 px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                                                                    🟥 {player.suspensionWeeksRemaining} par
                                                                </span>
                                                            ) : (
                                                                <div className="w-12 h-1 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                                                    <div 
                                                                        className={`h-full ${ (player.condition || 100) > 70 ? 'bg-emerald-400' : (player.condition || 100) > 40 ? 'bg-[var(--apex-gold)]' : 'bg-rose-500'}`}
                                                                        style={{ width: `${player.condition || 100}%` }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-center text-white/50 font-bold text-xs">
                                                        {player.stats?.goals || 0}/{player.stats?.assists || 0}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border transition-colors ${getMoraleIndicator(player.morale).text} bg-white/5 border-white/10`}>
                                                            {player.morale}
                                                        </span>
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

            {activeTab === 'ACADEMY' && (
                <div className="space-y-4">
                    <div className="bg-[#0E131F] border border-white/10 p-5 rounded-2xl shadow-xl text-center border-t-2 border-[var(--apex-gold)]">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 flex items-center justify-center mx-auto mb-2 text-[var(--apex-gold)] shadow-inner">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Academia Juvenil</h3>
                        <p className="text-white/60 text-xs max-w-lg mx-auto leading-relaxed mt-1">
                            Semillero de promesas del club. Asciende a los mejores talentos al primer equipo para potenciar su carrera profesional.
                        </p>
                    </div>

                    {gameState.youthAcademy.length === 0 ? (
                        <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-16 text-center flex flex-col items-center gap-3 text-white/40">
                            <Sparkles className="w-10 h-10 opacity-30" />
                            <p className="text-xs uppercase tracking-wider font-bold">No hay jugadores en la cantera actualmente.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                            {gameState.youthAcademy.map(player => {
                                const age = getPlayerAge(player);
                                const potential = getPlayerPotential(player);
                                const potTier = getPlayerPotentialTier(player);
                                const tierBadge = getTierBadge(potTier);

                                return (
                                    <div 
                                        key={player.id} 
                                        className="bg-[#0E131F] hover:bg-[#121828] border border-white/10 hover:border-[var(--apex-gold)]/50 rounded-xl p-3 transition-all duration-200 shadow-md flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-black border uppercase tracking-wider ${getPositionColor(player.position)}`}>
                                                        {player.position}
                                                    </span>
                                                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-black border uppercase tracking-wider ${tierBadge.color}`}>
                                                        {tierBadge.label}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-semibold text-slate-400">{age} años</span>
                                            </div>

                                            <div className="flex items-center gap-2.5 mb-2.5">
                                                <PlayerPhoto 
                                                    player={player} 
                                                    className="w-10 h-10 rounded-xl border border-white/10 shadow-sm object-cover shrink-0" 
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-black text-sm text-white truncate uppercase tracking-tight">
                                                        {player.name}
                                                    </h4>
                                                    <span className="text-[10px] text-slate-400">{getPositionName(player.position)}</span>
                                                </div>
                                            </div>

                                            {/* Panel Potencial */}
                                            <div className="grid grid-cols-2 gap-1.5 bg-black/40 rounded-lg p-2 border border-white/5 mb-3 text-center">
                                                <div>
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block">Media Actual</span>
                                                    <span className="text-xs font-black text-white">{player.rating}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block">Potencial</span>
                                                    <span className="text-xs font-black text-[var(--apex-gold)] flex items-center justify-center gap-1">
                                                        {potential} <Sparkles className="w-2.5 h-2.5" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handlePromote(player)}
                                            className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            <span>Ascender al Primer Equipo</span>
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
