import React, { useState } from 'react';
import { GameState, Player } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency, formatCurrencyShort } from '../../utils';
import { BriefcaseIcon, SparklesIcon, UsersIcon } from '../icons';
import { TrendingUpIcon, FilterIcon, StarIcon } from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useToast } from '../common/ToastProvider';

interface SquadScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

type SortOption = 'rating' | 'value' | 'age' | 'name' | 'position';
type FilterPosition = 'ALL' | 'POR' | 'DEF' | 'CEN' | 'DEL';

export const SquadScreen = React.memo(({ gameState, dispatch }: SquadScreenProps) => {
    const [activeTab, setActiveTab] = useState<'FIRST_TEAM' | 'ACADEMY'>('FIRST_TEAM');
    const [sortOption, setSortOption] = useState<SortOption>('rating');
    const [filterPosition, setFilterPosition] = useState<FilterPosition>('ALL');
    const [playerToPromote, setPlayerToPromote] = useState<Player | null>(null);
    const { showToast } = useToast();

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
            case 'POR': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'DEF': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'CEN': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'DEL': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-white/50';
        }
    };

    const getMoraleColor = (morale: string) => {
        switch (morale) {
            case 'Feliz': return 'text-[var(--apex-green)] bg-[var(--apex-green)]/10 border-[var(--apex-green)]/30';
            case 'Contento': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
            case 'Normal': return 'text-white/50 bg-black/20 border-white/10';
            case 'Descontento': return 'text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]/30';
            case 'Enojado': return 'text-[var(--apex-red)] bg-[var(--apex-red)]/10 border-[var(--apex-red)]/30';
            default: return 'text-white/50';
        }
    };

    const filteredSquad = gameState.team.squad.filter(player => {
        if (filterPosition === 'ALL') return true;
        return player.position === filterPosition;
    });

    const sortedSquad = [...filteredSquad].sort((a, b) => {
        switch (sortOption) {
            case 'rating': return b.rating - a.rating;
            case 'value': return b.value - a.value;
            case 'age': return (a.age || 0) - (b.age || 0);
            case 'name': return a.name.localeCompare(b.name);
            case 'position': return a.position.localeCompare(b.position);
            default: return 0;
        }
    });

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-1">Gestión de Equipo</h2>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Plantilla</h1>
                </div>
                
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('FIRST_TEAM')}
                        className={`px-4 py-2 flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all rounded-lg ${activeTab === 'FIRST_TEAM' ? 'bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30' : 'text-white/50 hover:bg-white/5 border border-transparent'}`}
                    >
                        <UsersIcon className="w-4 h-4" /> Primer Equipo
                    </button>
                    <button
                        onClick={() => setActiveTab('ACADEMY')}
                        className={`px-4 py-2 flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all rounded-lg ${activeTab === 'ACADEMY' ? 'bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30' : 'text-white/50 hover:bg-white/5 border border-transparent'}`}
                    >
                        <SparklesIcon className="w-4 h-4" /> Cantera
                    </button>
                </div>
            </div>

            {activeTab === 'FIRST_TEAM' && (
                <div className="space-y-6">
                    {/* Pitch Background Header */}
                    <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-6">
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-out animate-slow-zoom"
                            style={{ 
                                backgroundImage: 'url("/bg-pitch.png")',
                                filter: 'brightness(0.7) saturate(1.2)'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--apex-dark)] via-transparent to-black/20" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-black/40 backdrop-blur-md border border-[var(--apex-gold)]/30 rounded-xl flex items-center justify-center shadow-lg">
                                    <UsersIcon className="w-8 h-8 text-[var(--apex-gold)]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">{gameState.team.coach?.name || 'Sin Entrenador'}</h3>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-black bg-[var(--apex-gold)] text-black px-2 py-0.5 rounded uppercase tracking-widest">{gameState.team.coach?.style || 'Equilibrado'}</span>
                                        <span className="text-[10px] font-black bg-white/10 text-white px-2 py-0.5 rounded uppercase tracking-widest">{gameState.team.coach?.preferredFormation || '4-4-2'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                <div className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">Confianza en el Táctico</div>
                                <div className="flex items-center gap-3 w-full md:w-48">
                                    <div className="flex-1 h-2 bg-black/40 backdrop-blur-md rounded-full overflow-hidden border border-white/10">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${ (gameState.team.coach?.satisfactionLevel || 0) >= 70 ? 'bg-[var(--apex-green)]' : (gameState.team.coach?.satisfactionLevel || 0) >= 40 ? 'bg-[var(--apex-gold)]' : 'bg-[var(--apex-red)]'}`} 
                                            style={{ width: `${gameState.team.coach?.satisfactionLevel || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-lg font-black text-white leading-none">{gameState.team.coach?.satisfactionLevel || 0}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 apex-card p-3">
                        <div className="flex items-center gap-3 px-2">
                            <div>
                                <h3 className="font-black text-white uppercase text-xs">Filtros y Orden</h3>
                                <p className="text-[9px] text-[var(--apex-gold)] font-bold uppercase tracking-widest">{gameState.team.squad.length}/25 Jugadores</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-white/10 flex-1 md:flex-none">
                                <FilterIcon className="w-3 h-3 text-[var(--apex-gold)]" />
                                <select
                                    value={filterPosition}
                                    onChange={(e) => setFilterPosition(e.target.value as FilterPosition)}
                                    className="bg-transparent text-white text-[10px] uppercase tracking-wider font-bold focus:outline-none w-full"
                                >
                                    <option value="ALL">Todas las Posiciones</option>
                                    <option value="POR">Porteros</option>
                                    <option value="DEF">Defensas</option>
                                    <option value="CEN">Centrocampistas</option>
                                    <option value="DEL">Delanteros</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-white/10 flex-1 md:flex-none">
                                <TrendingUpIcon className="w-3 h-3 text-[var(--apex-gold)]" />
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                                    className="bg-transparent text-white text-[10px] uppercase tracking-wider font-bold focus:outline-none w-full"
                                >
                                    <option value="rating">Por Valoración</option>
                                    <option value="value">Por Valor</option>
                                    <option value="age">Por Edad</option>
                                    <option value="name">Por Nombre</option>
                                    <option value="position">Por Posición</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Squad Table Mobile / Desktop */}
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
                                    {sortedSquad.map((player) => (
                                        <tr 
                                            key={player.id} 
                                            onClick={() => onViewPlayer(player)}
                                            className="hover:bg-white/5 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm border ${
                                                        player.rating >= 85 ? 'bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border-[var(--apex-gold)]/30' :
                                                        player.rating >= 75 ? 'bg-white/10 text-white border-white/20' :
                                                        'bg-black/30 text-white/50 border-white/5'
                                                    }`}>
                                                        {player.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-white group-hover:text-[var(--apex-gold)] transition-colors flex items-center gap-1.5">
                                                            {player.name}
                                                            {player.isTransferListed && <BriefcaseIcon className="w-3 h-3 text-[var(--apex-gold)]" />}
                                                        </div>
                                                        <div className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Salario: {formatCurrencyShort(player.wage)}/sem</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${getPositionColor(player.position)}`}>
                                                    {player.position}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center text-white/70 font-bold text-xs">{player.age}</td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`text-base font-black flex items-center justify-center gap-1 ${
                                                    player.rating >= 80 ? 'text-[var(--apex-gold)]' :
                                                    player.rating >= 70 ? 'text-white' :
                                                    'text-white/50'
                                                }`}>
                                                    {player.rating}
                                                    {player.rating >= 85 && <StarIcon className="w-3 h-3 fill-[var(--apex-gold)] text-[var(--apex-gold)]" />}
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
                                                                className={`h-full ${ (player.condition || 100) > 70 ? 'bg-[var(--apex-green)]' : (player.condition || 100) > 40 ? 'bg-[var(--apex-gold)]' : 'bg-[var(--apex-red)]'}`}
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
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border transition-colors ${getMoraleColor(player.morale)}`}>
                                                    {player.morale}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ACADEMY' && (
                <div className="space-y-6">
                    <div className="apex-card p-6 text-center border-t-2 border-[var(--apex-gold)]">
                        <SparklesIcon className="w-8 h-8 text-[var(--apex-gold)] mx-auto mb-3" />
                        <h3 className="text-xl font-black text-white uppercase mb-2">Academia Juvenil</h3>
                        <p className="text-white/50 text-[10px] uppercase tracking-widest max-w-lg mx-auto leading-relaxed">Desarrollando las estrellas del mañana. Asciende a jugadores juveniles al primer equipo para comenzar sus carreras profesionales.</p>
                    </div>

                    <div className="apex-card overflow-hidden">
                        {gameState.youthAcademy.length === 0 ? (
                            <div className="p-16 text-center flex flex-col items-center gap-4 text-white/30">
                                <SparklesIcon className="w-12 h-12 opacity-20" />
                                <p className="text-xs uppercase tracking-widest font-bold">No hay jugadores en la cantera actualmente.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {gameState.youthAcademy.map(player => (
                                    <div key={player.id} className="flex flex-col sm:flex-row items-center justify-between p-5 hover:bg-white/5 transition-colors group gap-4">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="w-12 h-12 bg-[var(--apex-gold)]/10 rounded-xl flex items-center justify-center border border-[var(--apex-gold)]/20">
                                                <SparklesIcon className="w-5 h-5 text-[var(--apex-gold)]" />
                                            </div>
                                            <div>
                                                <div className="text-base font-black text-white group-hover:text-[var(--apex-gold)] transition-colors">{player.name}</div>
                                                <div className="flex gap-2 mt-1">
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${getPositionColor(player.position)}`}>{player.position}</span>
                                                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{player.age} años</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto bg-black/20 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                                            <div className="text-center">
                                                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Potencial</div>
                                                <div className="text-lg font-black text-white">{player.rating}</div>
                                            </div>
                                            <button
                                                onClick={() => handlePromote(player)}
                                                className="apex-btn-gold py-2 px-6 text-[10px]"
                                            >
                                                ASCENDER
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
