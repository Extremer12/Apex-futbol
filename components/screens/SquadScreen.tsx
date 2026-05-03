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
            showToast("La plantilla está llena (Máx 25). Vende jugadores antes de subir canteranos.", 'warning');
            return;
        }
        setPlayerToPromote(player);
    }

    const confirmPromote = () => {
        if (playerToPromote) {
            dispatch({ type: 'PROMOTE_PLAYER', payload: playerToPromote });
            showToast(`${playerToPromote.name} ha sido promovido al primer equipo!`, 'success');
            setPlayerToPromote(null);
        }
    }

    const getPositionColor = (pos: string) => {
        switch (pos) {
            case 'POR': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'DEF': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'CEN': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'DEL': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-slate-400';
        }
    };

    const getMoraleColor = (morale: string) => {
        switch (morale) {
            case 'Feliz': return 'text-green-400 bg-green-400/10 border-green-500/30';
            case 'Contento': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
            case 'Normal': return 'text-slate-400 bg-slate-800 border-slate-700';
            case 'Descontento': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
            case 'Enojado': return 'text-red-400 bg-red-500/10 border-red-500/30';
            default: return 'text-slate-400';
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
        <div className="p-4 md:p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Gestión de Plantilla</h2>
            </div>

            <div className="flex space-x-4 border-b border-slate-800 mb-6">
                <button
                    onClick={() => setActiveTab('FIRST_TEAM')}
                    className={`pb-3 px-4 flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'FIRST_TEAM' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <UsersIcon className="w-4 h-4" /> Primer Equipo
                </button>
                <button
                    onClick={() => setActiveTab('ACADEMY')}
                    className={`pb-3 px-4 flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'ACADEMY' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <SparklesIcon className="w-4 h-4" /> Cantera
                </button>
            </div>

            {activeTab === 'FIRST_TEAM' && (
                <div className="space-y-6">
                    {/* Coach Status Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-sky-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                                <UsersIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{gameState.team.coach?.name || 'Sin Entrenador'}</h3>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-[10px] font-black bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded uppercase tracking-widest">{gameState.team.coach?.style || 'Balanced'}</span>
                                    <span className="text-[10px] font-black bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase tracking-widest">{gameState.team.coach?.preferredFormation || '4-4-2'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center md:items-end gap-2">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Satisfacción del DT</div>
                            <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-gradient-to-r ${ (gameState.team.coach?.satisfactionLevel || 0) >= 70 ? 'from-green-500 to-emerald-500' : (gameState.team.coach?.satisfactionLevel || 0) >= 40 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-red-600'}`} 
                                        style={{ width: `${gameState.team.coach?.satisfactionLevel || 0}%` }}
                                    />
                                </div>
                                <span className="text-sm font-black text-white">{gameState.team.coach?.satisfactionLevel || 0}%</span>
                            </div>
                        </div>
                    </div>

                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="bg-sky-500/20 p-2 rounded-xl">
                                <UsersIcon className="w-6 h-6 text-sky-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-white uppercase text-sm">Filtros y Orden</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Total: {gameState.team.squad.length}/25 Jugadores</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                                <FilterIcon className="w-3 h-3 text-slate-500" />
                                <select
                                    value={filterPosition}
                                    onChange={(e) => setFilterPosition(e.target.value as FilterPosition)}
                                    className="bg-transparent text-white text-xs font-bold focus:outline-none"
                                >
                                    <option value="ALL">Todas las posiciones</option>
                                    <option value="POR">Porteros</option>
                                    <option value="DEF">Defensas</option>
                                    <option value="CEN">Centrocampistas</option>
                                    <option value="DEL">Delanteros</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                                <TrendingUpIcon className="w-3 h-3 text-slate-500" />
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                                    className="bg-transparent text-white text-xs font-bold focus:outline-none"
                                >
                                    <option value="rating">Por Media</option>
                                    <option value="value">Por Valor</option>
                                    <option value="age">Por Edad</option>
                                    <option value="name">Por Nombre</option>
                                    <option value="position">Por Posición</option>
                                </select>
                            </div>
                        </div>
                    </header>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                        <th className="px-6 py-4">Jugador</th>
                                        <th className="px-4 py-4 text-center">Pos</th>
                                        <th className="px-4 py-4 text-center">Edad</th>
                                        <th className="px-4 py-4 text-center">Rat</th>
                                        <th className="px-4 py-4 text-center">Valor</th>
                                        <th className="px-4 py-4 text-center">Moral</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {sortedSquad.map((player) => (
                                        <tr 
                                            key={player.id} 
                                            onClick={() => onViewPlayer(player)}
                                            className="hover:bg-sky-500/5 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ${
                                                        player.rating >= 85 ? 'bg-yellow-500/20 text-yellow-500' :
                                                        player.rating >= 75 ? 'bg-sky-500/20 text-sky-500' :
                                                        'bg-slate-800 text-slate-400'
                                                    }`}>
                                                        {player.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-sky-400 transition-colors flex items-center gap-2">
                                                            {player.name}
                                                            {player.isTransferListed && <BriefcaseIcon className="w-4 h-4 text-amber-500" />}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Salario: {formatCurrencyShort(player.wage)}/sem</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black border ${getPositionColor(player.position)}`}>
                                                    {player.position}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center text-slate-400 font-bold">{player.age}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`text-lg font-black flex items-center justify-center gap-1 ${
                                                    player.rating >= 80 ? 'text-yellow-400' :
                                                    player.rating >= 70 ? 'text-white' :
                                                    'text-slate-500'
                                                }`}>
                                                    {player.rating}
                                                    {player.rating >= 85 && <StarIcon className="w-3 h-3 fill-yellow-400" />}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-slate-300 font-mono">{formatCurrencyShort(player.value)}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border transition-colors ${getMoraleColor(player.morale)}`}>
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
                    <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-800 text-center">
                        <h3 className="text-xl font-black text-white uppercase mb-2">Academia Juvenil</h3>
                        <p className="text-slate-400 text-sm max-w-lg mx-auto">Desarrollando a las estrellas del mañana. Promueve jugadores al primer equipo para comenzar su carrera profesional.</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                        {gameState.youthAcademy.length === 0 ? (
                            <div className="p-20 text-center flex flex-col items-center gap-4 text-slate-600">
                                <SparklesIcon className="w-12 h-12 opacity-20" />
                                <p className="font-bold">No hay jugadores en la cantera actualmente.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800/50">
                                {gameState.youthAcademy.map(player => (
                                    <div key={player.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
                                                <SparklesIcon className="w-6 h-6 text-yellow-500" />
                                            </div>
                                            <div>
                                                <div className="text-lg font-black text-white group-hover:text-yellow-400 transition-colors">{player.name}</div>
                                                <div className="flex gap-2 mt-1">
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${getPositionColor(player.position)}`}>{player.position}</span>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{player.age} años</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Potencial</div>
                                                <div className="text-xl font-black text-sky-400">{player.rating}</div>
                                            </div>
                                            <button
                                                onClick={() => handlePromote(player)}
                                                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-sky-600/20 active:scale-95"
                                            >
                                                PROMOVER
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
                title="Promover Jugador"
                message={`¿Estás seguro de que quieres promover a ${playerToPromote?.name} al primer equipo?`}
                confirmText="Promover"
                cancelText="Cancelar"
                confirmVariant="success"
                onConfirm={confirmPromote}
                onCancel={() => setPlayerToPromote(null)}
            />
        </div>
    );
});
