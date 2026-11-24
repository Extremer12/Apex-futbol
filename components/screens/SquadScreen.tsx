import React, { useState, useMemo } from 'react';
import { GameState, Player } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatTransferFee, formatWeeklyWage } from '../../utils';
import {
    Search,
    X,
    SlidersHorizontal,
    ChevronRight,
    Users,
    GraduationCap,
    ArrowUpRight,
    ArrowDownLeft,
    Trash2,
    ShieldAlert,
    Lock
} from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { PlayerPhoto } from '../../data/teams/helpers';
import { getPlayerAge, getPlayerPotential } from '../../utils/playerUtils';
import { calculateSquadPower } from '../../services/squadProgressionService';
import { getCountryMeta, resolvePlayerNationality } from '../../services/nationalityService';
import {
    MAX_FIRST_TEAM_SIZE,
    MAX_RESERVE_SIZE,
    canMoveToReserve,
    canPromoteToFirstTeam
} from '../../services/squadRules';
import { TacticalLineupView } from './squad/TacticalLineupView';
import { BottomSheet, OvrBadge, StatCell, EmptyState, positionLabel } from './transfers/TransferUI';

interface SquadScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

type SquadTab = 'FIRST_TEAM' | 'TACTICS' | 'ACADEMY';
type SortOption = 'position' | 'rating' | 'value' | 'age' | 'condition' | 'name';
type StatusFilter = 'ALL' | 'AVAILABLE' | 'UNAVAILABLE' | 'LISTED';
type FilterPosition = 'ALL' | 'POR' | 'DEF' | 'CEN' | 'DEL';

const POSITIONS = [
    { id: 'ALL', label: 'Todos' },
    { id: 'POR', label: 'POR' },
    { id: 'DEF', label: 'DEF' },
    { id: 'CEN', label: 'MED' },
    { id: 'DEL', label: 'DEL' },
] as const;

const SORTS: { id: SortOption; label: string }[] = [
    { id: 'position', label: 'Por posición' },
    { id: 'rating', label: 'Mejor media' },
    { id: 'value', label: 'Mayor valor' },
    { id: 'age', label: 'Más jóvenes' },
    { id: 'condition', label: 'Mejor físico' },
    { id: 'name', label: 'Alfabético' },
];

const STATUSES: { id: StatusFilter; label: string }[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'AVAILABLE', label: 'Disponibles' },
    { id: 'UNAVAILABLE', label: 'Bajas' },
    { id: 'LISTED', label: 'En venta' },
];

const POSITION_RANK: Record<string, number> = { POR: 1, DEF: 2, CEN: 3, DEL: 4 };

export const SquadScreen = React.memo(({ gameState, dispatch }: SquadScreenProps) => {
    const [activeTab, setActiveTab] = useState<SquadTab>('FIRST_TEAM');

    // First team filters
    const [searchName, setSearchName] = useState('');
    const [filterPosition, setFilterPosition] = useState<FilterPosition>('ALL');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [sortOption, setSortOption] = useState<SortOption>(() => {
        try {
            return (localStorage.getItem('apex_squad_sort_option') as SortOption) || 'position';
        } catch (_) {
            return 'position';
        }
    });
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

    // Reserve / Academy filters
    const [academySearch, setAcademySearch] = useState('');
    const [academyFilter, setAcademyFilter] = useState<FilterPosition>('ALL');
    const [selectedYouthId, setSelectedYouthId] = useState<number | null>(null);

    const { showToast } = useToast();

    const squad = gameState.team.squad || [];
    const reserve = gameState.youthAcademy || [];
    const squadFull = squad.length >= MAX_FIRST_TEAM_SIZE;
    const reserveFull = reserve.length >= MAX_RESERVE_SIZE;
    const bothFull = squadFull && reserveFull;

    const squadPower = useMemo(
        () => gameState.team.squadPower || calculateSquadPower(gameState.team),
        [gameState.team]
    );

    const handleSortChange = (next: SortOption) => {
        setSortOption(next);
        try {
            localStorage.setItem('apex_squad_sort_option', next);
        } catch (_) {}
    };

    const sortedSquad = useMemo(() => {
        const query = searchName.toLowerCase().trim();
        return squad
            .filter(p => {
                if (filterPosition !== 'ALL' && p.position !== filterPosition) return false;
                if (query && !p.name.toLowerCase().includes(query)) return false;
                if (statusFilter === 'AVAILABLE' && (p.isInjured || p.isSuspended)) return false;
                if (statusFilter === 'UNAVAILABLE' && !p.isInjured && !p.isSuspended) return false;
                if (statusFilter === 'LISTED' && !p.isTransferListed) return false;
                return true;
            })
            .sort((a, b) => {
                switch (sortOption) {
                    case 'position': {
                        const diff = (POSITION_RANK[a.position] || 5) - (POSITION_RANK[b.position] || 5);
                        if (diff !== 0) return diff;
                        return b.rating - a.rating;
                    }
                    case 'rating': return b.rating - a.rating;
                    case 'value': return b.value - a.value;
                    case 'age': return getPlayerAge(a) - getPlayerAge(b);
                    case 'condition': return (b.condition ?? 100) - (a.condition ?? 100);
                    case 'name': return a.name.localeCompare(b.name);
                    default: return b.rating - a.rating;
                }
            });
    }, [squad, filterPosition, searchName, statusFilter, sortOption]);

    const filteredReserve = useMemo(() => {
        const query = academySearch.toLowerCase().trim();
        return reserve
            .filter(p => {
                if (academyFilter !== 'ALL' && p.position !== academyFilter) return false;
                if (query && !p.name.toLowerCase().includes(query)) return false;
                return true;
            })
            .sort((a, b) => getPlayerPotential(b) - getPlayerPotential(a));
    }, [reserve, academyFilter, academySearch]);

    const activeFilterCount = (filterPosition !== 'ALL' ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0) + (sortOption !== 'position' ? 1 : 0);

    const resetFirstTeamFilters = () => {
        setFilterPosition('ALL');
        setStatusFilter('ALL');
        handleSortChange('position');
        setSearchName('');
    };

    const selectedPlayer = squad.find(p => p.id === selectedPlayerId) || null;
    const selectedReserve = reserve.find(p => p.id === selectedYouthId) || null;

    const handlePromoteReserve = (player: Player) => {
        const check = canPromoteToFirstTeam(squad, player, gameState.team.leagueId, gameState.gameMode);
        if (!check.allowed) {
            showToast(check.reason || 'No se puede ascender al Primer Equipo.', 'warning');
            return;
        }
        dispatch({ type: 'PROMOTE_PLAYER', payload: player });
        showToast(`${player.name} ascendido al Primer Equipo.`, 'success');
        setSelectedYouthId(null);
    };

    const handleDemotePlayer = (player: Player) => {
        const check = canMoveToReserve(squad, reserve);
        if (!check.allowed) {
            showToast(check.reason || 'No se puede enviar a Reserva.', 'warning');
            return;
        }
        dispatch({ type: 'DEMOTE_TO_RESERVE', payload: player.id });
        showToast(`${player.name} enviado a la Reserva.`, 'info');
        setSelectedPlayerId(null);
    };

    const handleReleaseReserve = (player: Player) => {
        dispatch({ type: 'RELEASE_RESERVE_PLAYER', payload: player.id });
        showToast(`${player.name} ha recibido la carta de libertad.`, 'info');
        setSelectedYouthId(null);
    };

    const conditionTone = (c: number) =>
        c >= 75 ? 'text-emerald-400' : c >= 50 ? 'text-amber-400' : 'text-rose-400';

    const activeFormation = gameState.team.customLineup?.formation || gameState.team.coach?.preferredFormation || '4-4-2';

    const renderNationalityPill = (player: Player) => {
        const nat = resolvePlayerNationality(player, gameState.team.leagueId);
        const meta = getCountryMeta(nat);
        return (
            <span className="inline-flex items-center shrink-0" title={meta.name}>
                <span>{meta.flag}</span>
            </span>
        );
    };

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4 pb-24 animate-fade-in max-w-5xl mx-auto">
            {/* 1. CLEAN HEADER */}
            <header className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">Plantilla</h1>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-0.5 truncate">
                        <span>{gameState.team.coach?.name || 'Director Técnico'}</span>
                        <span>·</span>
                        <span>{activeFormation}</span>
                    </span>
                </div>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 text-right shrink-0">
                    <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">Media</span>
                        <span className="text-sm font-black text-[var(--apex-gold)] leading-none">{squadPower.overall}</span>
                    </div>
                </div>
            </header>

            {bothFull && (
                <div className="px-3.5 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-200 font-semibold">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                        Primer Equipo ({MAX_FIRST_TEAM_SIZE}/{MAX_FIRST_TEAM_SIZE}) y Reserva ({MAX_RESERVE_SIZE}/{MAX_RESERVE_SIZE}) completos. Vende o libera jugadores para fichar o incorporar juveniles.
                    </span>
                </div>
            )}

            {/* 2. STICKY TABS */}
            <nav className="sticky top-0 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-1.5 bg-[var(--apex-darker,#070A13)]/95 backdrop-blur">
                <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-2xl">
                    {([
                        { id: 'FIRST_TEAM', label: 'Primer Equipo', countLabel: `${squad.length}/${MAX_FIRST_TEAM_SIZE}`, warn: squadFull },
                        { id: 'TACTICS', label: 'Táctica', countLabel: '', warn: false },
                        { id: 'ACADEMY', label: 'Reserva', countLabel: `${reserve.length}/${MAX_RESERVE_SIZE}`, warn: reserveFull },
                    ] as const).map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`relative h-10 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === t.id ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <span className="truncate">{t.label}</span>
                            {t.countLabel && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                                    activeTab === t.id
                                        ? 'bg-slate-950 text-[var(--apex-gold)]'
                                        : t.warn
                                            ? 'bg-amber-500/20 text-amber-300'
                                            : 'bg-white/10 text-slate-300'
                                }`}>
                                    {t.countLabel}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {/* TAB 1: PRIMER EQUIPO */}
            {activeTab === 'FIRST_TEAM' && (
                <div className="space-y-3">
                    {/* Search + Filter Button */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            <input
                                type="search"
                                inputMode="search"
                                placeholder="Buscar jugador…"
                                value={searchName}
                                onChange={e => setSearchName(e.target.value)}
                                className="w-full h-11 pl-10 pr-9 bg-[#0D1220] border border-white/10 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]/60"
                            />
                            {searchName && (
                                <button
                                    onClick={() => setSearchName('')}
                                    aria-label="Limpiar búsqueda"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setFiltersOpen(true)}
                            className={`relative h-11 px-3.5 rounded-2xl border flex items-center gap-2 text-sm font-bold shrink-0 cursor-pointer ${
                                activeFilterCount
                                    ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]/40 text-[var(--apex-gold)]'
                                    : 'bg-[#0D1220] border-white/10 text-slate-300'
                            }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="hidden sm:inline">Filtros</span>
                            {activeFilterCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-[var(--apex-gold)] text-black text-[10px] font-black flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Quick Position Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
                        {POSITIONS.map(pos => (
                            <button
                                key={pos.id}
                                onClick={() => setFilterPosition(pos.id)}
                                className={`h-8 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                    filterPosition === pos.id ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                {pos.label}
                            </button>
                        ))}
                    </div>

                    {/* Summary Strip */}
                    <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-semibold">
                        <span>{sortedSquad.length} jugadores · {SORTS.find(s => s.id === sortOption)?.label}</span>
                        <span>ATA {squadPower.attack} · MED {squadPower.midfield} · DEF {squadPower.defense}</span>
                    </div>

                    {/* Squad List */}
                    {sortedSquad.length === 0 ? (
                        <div className="apex-card">
                            <EmptyState
                                icon={<Users className="w-6 h-6" />}
                                title="Sin resultados"
                                text="No hay jugadores que coincidan con los filtros activos."
                                action={
                                    <button onClick={resetFirstTeamFilters} className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold">
                                        Limpiar filtros
                                    </button>
                                }
                            />
                        </div>
                    ) : (
                        <ul className="apex-card divide-y divide-white/5 overflow-hidden">
                            {sortedSquad.map(player => {
                                const age = getPlayerAge(player);
                                const condition = Math.round(player.condition ?? 100);

                                return (
                                    <li key={player.id}>
                                        <button
                                            onClick={() => setSelectedPlayerId(player.id)}
                                            className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors cursor-pointer"
                                        >
                                            <PlayerPhoto player={player} className="w-11 h-11 rounded-full shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-bold text-white truncate">{player.name}</p>
                                                    {renderNationalityPill(player)}
                                                    {player.isInjured ? (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/15 text-rose-400 shrink-0">
                                                            Lesión {player.injuryWeeksRemaining}s
                                                        </span>
                                                    ) : player.isSuspended ? (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/15 text-rose-400 shrink-0">
                                                            Sanción {player.suspensionWeeksRemaining}p
                                                        </span>
                                                    ) : player.isTransferListed ? (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/15 text-amber-400 shrink-0">
                                                            En venta
                                                        </span>
                                                    ) : player.isUntouchable ? (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-500/15 text-indigo-300 shrink-0 inline-flex items-center gap-0.5">
                                                            <Lock className="w-2.5 h-2.5" /> Blindado
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    <span className="font-bold text-slate-300">{positionLabel[player.position]}</span> · {age} años · {player.contractYears}a contrato
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`text-sm font-black ${conditionTone(condition)}`}>{condition}%</p>
                                                <p className="text-[10px] text-slate-500">{formatTransferFee(player.value)}</p>
                                            </div>
                                            <OvrBadge value={player.rating} muted={player.rating < 75} />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {/* Filter Bottom Sheet */}
                    <BottomSheet
                        open={filtersOpen}
                        onClose={() => setFiltersOpen(false)}
                        title="Filtros"
                        footer={
                            <div className="flex gap-2">
                                <button onClick={resetFirstTeamFilters} className="flex-1 h-11 rounded-xl bg-white/5 text-slate-300 text-sm font-bold">
                                    Restablecer
                                </button>
                                <button onClick={() => setFiltersOpen(false)} className="flex-[2] h-11 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-sm font-black">
                                    Ver {sortedSquad.length} jugadores
                                </button>
                            </div>
                        }
                    >
                        <div className="space-y-5">
                            <section>
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Ordenar por</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {SORTS.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleSortChange(s.id)}
                                            className={`h-10 rounded-xl text-xs font-bold border ${
                                                sortOption === s.id
                                                    ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]'
                                                    : 'bg-white/[0.03] border-white/5 text-slate-300'
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Estado</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {STATUSES.map(st => (
                                        <button
                                            key={st.id}
                                            onClick={() => setStatusFilter(st.id)}
                                            className={`h-10 rounded-xl text-xs font-bold border ${
                                                statusFilter === st.id
                                                    ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]'
                                                    : 'bg-white/[0.03] border-white/5 text-slate-300'
                                            }`}
                                        >
                                            {st.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Posición</h4>
                                <div className="grid grid-cols-5 gap-2">
                                    {POSITIONS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setFilterPosition(p.id)}
                                            className={`h-10 rounded-xl text-xs font-bold border ${
                                                filterPosition === p.id
                                                    ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]'
                                                    : 'bg-white/[0.03] border-white/5 text-slate-300'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </BottomSheet>

                    {/* Player Quick Sheet */}
                    <BottomSheet
                        open={!!selectedPlayer}
                        onClose={() => setSelectedPlayerId(null)}
                        footer={
                            selectedPlayer && (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleDemotePlayer(selectedPlayer)}
                                        className="h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <ArrowDownLeft className="w-4 h-4 text-amber-400" />
                                        A Reserva ({reserve.length}/{MAX_RESERVE_SIZE})
                                    </button>
                                    <button
                                        onClick={() => {
                                            dispatch({ type: 'SET_VIEWING_PLAYER', payload: selectedPlayer });
                                            setSelectedPlayerId(null);
                                        }}
                                        className="h-12 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        Ver Ficha <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )
                        }
                    >
                        {selectedPlayer && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <PlayerPhoto player={selectedPlayer} className="w-16 h-16 rounded-2xl shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-lg font-black text-white truncate">{selectedPlayer.name}</h3>
                                            {renderNationalityPill(selectedPlayer)}
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            {positionLabel[selectedPlayer.position]} · {getPlayerAge(selectedPlayer)} años · {selectedPlayer.morale}
                                        </p>
                                    </div>
                                    <OvrBadge value={selectedPlayer.rating} muted={selectedPlayer.rating < 75} />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <StatCell
                                        label="Físico"
                                        value={`${Math.round(selectedPlayer.condition ?? 100)}%`}
                                        accent={conditionTone(Math.round(selectedPlayer.condition ?? 100))}
                                    />
                                    <StatCell label="Valor" value={formatTransferFee(selectedPlayer.value)} accent="text-emerald-400" />
                                    <StatCell label="Salario" value={formatWeeklyWage(selectedPlayer.wage)} />
                                    <StatCell label="Contrato" value={`${selectedPlayer.contractYears} años`} />
                                    <StatCell label="Goles" value={selectedPlayer.stats?.goals || 0} />
                                    <StatCell label="Asistencias" value={selectedPlayer.stats?.assists || 0} />
                                </div>
                            </div>
                        )}
                    </BottomSheet>
                </div>
            )}

            {/* TAB 2: TÁCTICA */}
            {activeTab === 'TACTICS' && (
                <TacticalLineupView gameState={gameState} dispatch={dispatch} />
            )}

            {/* TAB 3: RESERVA Y CANTERA */}
            {activeTab === 'ACADEMY' && (
                <div className="space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        <input
                            type="search"
                            inputMode="search"
                            placeholder="Buscar en Reserva y Cantera…"
                            value={academySearch}
                            onChange={e => setAcademySearch(e.target.value)}
                            className="w-full h-11 pl-10 pr-9 bg-[#0D1220] border border-white/10 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]/60"
                        />
                        {academySearch && (
                            <button
                                onClick={() => setAcademySearch('')}
                                aria-label="Limpiar búsqueda"
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Quick Position Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
                        {POSITIONS.map(pos => (
                            <button
                                key={pos.id}
                                onClick={() => setAcademyFilter(pos.id)}
                                className={`h-8 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                    academyFilter === pos.id ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                {pos.label}
                            </button>
                        ))}
                    </div>

                    {/* Summary Strip */}
                    <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-semibold">
                        <span>{filteredReserve.length} en Reserva/Cantera ({reserve.length}/{MAX_RESERVE_SIZE})</span>
                        <span className={squadFull ? 'text-amber-400 font-bold' : ''}>
                            Primer Equipo {squad.length}/{MAX_FIRST_TEAM_SIZE}
                        </span>
                    </div>

                    {reserve.length === 0 ? (
                        <div className="apex-card">
                            <EmptyState
                                icon={<GraduationCap className="w-6 h-6" />}
                                title="Reserva y Cantera vacía"
                                text="Aquí aparecen los juveniles formados en inferiores y los jugadores enviados desde el Primer Equipo."
                            />
                        </div>
                    ) : filteredReserve.length === 0 ? (
                        <div className="apex-card">
                            <EmptyState
                                icon={<GraduationCap className="w-6 h-6" />}
                                title="Sin resultados"
                                text="No hay futbolistas en Reserva que coincidan con tu búsqueda."
                                action={
                                    <button
                                        onClick={() => { setAcademyFilter('ALL'); setAcademySearch(''); }}
                                        className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
                                    >
                                        Limpiar filtros
                                    </button>
                                }
                            />
                        </div>
                    ) : (
                        <ul className="apex-card divide-y divide-white/5 overflow-hidden">
                            {filteredReserve.map(player => {
                                const age = getPlayerAge(player);
                                const potential = getPlayerPotential(player);
                                const isYouth = player.isAcademyProduct || age <= 20;

                                return (
                                    <li key={player.id}>
                                        <button
                                            onClick={() => setSelectedYouthId(player.id)}
                                            className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors cursor-pointer"
                                        >
                                            <PlayerPhoto player={player} className="w-11 h-11 rounded-full shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-bold text-white truncate">{player.name}</p>
                                                    {renderNationalityPill(player)}
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                                                        isYouth ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
                                                    }`}>
                                                        {isYouth ? 'Cantera' : 'Reserva'}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    <span className="font-bold text-slate-300">{positionLabel[player.position]}</span> · {age} años
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-black text-[var(--apex-gold)]">Pot. {potential}</p>
                                                <p className="text-[10px] text-slate-500">{formatTransferFee(player.value)}</p>
                                            </div>
                                            <OvrBadge value={player.rating} muted />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {/* Reserve Action Sheet */}
                    <BottomSheet
                        open={!!selectedReserve}
                        onClose={() => setSelectedYouthId(null)}
                        footer={
                            selectedReserve && (() => {
                                const promoteCheck = canPromoteToFirstTeam(squad, selectedReserve, gameState.team.leagueId, gameState.gameMode);
                                return (
                                    <div className="space-y-2">
                                        {!promoteCheck.allowed && (
                                            <p className="text-[11px] text-amber-300 font-semibold text-center">{promoteCheck.reason}</p>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleReleaseReserve(selectedReserve)}
                                                className="h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Liberar Cupo
                                            </button>
                                            <button
                                                onClick={() => handlePromoteReserve(selectedReserve)}
                                                disabled={!promoteCheck.allowed}
                                                className="h-12 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                                Ascender
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()
                        }
                    >
                        {selectedReserve && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <PlayerPhoto player={selectedReserve} className="w-16 h-16 rounded-2xl shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-lg font-black text-white truncate">{selectedReserve.name}</h3>
                                            {renderNationalityPill(selectedReserve)}
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            {positionLabel[selectedReserve.position]} · {getPlayerAge(selectedReserve)} años · {selectedReserve.isAcademyProduct ? 'Cantera' : 'Reserva'}
                                        </p>
                                    </div>
                                    <OvrBadge value={selectedReserve.rating} muted />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <StatCell label="Media" value={selectedReserve.rating} />
                                    <StatCell label="Potencial" value={getPlayerPotential(selectedReserve)} accent="text-[var(--apex-gold)]" />
                                    <StatCell label="Edad" value={`${getPlayerAge(selectedReserve)} años`} />
                                    <StatCell label="Posición" value={positionLabel[selectedReserve.position]} />
                                    <StatCell label="Valor" value={formatTransferFee(selectedReserve.value)} accent="text-emerald-400" />
                                    <StatCell label="Salario" value={formatWeeklyWage(selectedReserve.wage)} />
                                </div>

                                <button
                                    onClick={() => {
                                        dispatch({ type: 'SET_VIEWING_PLAYER', payload: selectedReserve });
                                        setSelectedYouthId(null);
                                    }}
                                    className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    Ver ficha completa <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </BottomSheet>
                </div>
            )}
        </div>
    );
});
