import React, { useState } from 'react';
import { GameState, Player, Morale } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency } from '../../utils';
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

export const SquadScreen: React.FC<SquadScreenProps> = ({ gameState, dispatch }) => {
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
            case 'Feliz': return 'text-green-400 bg-green-400/10';
            case 'Contento': return 'text-blue-400 bg-blue-400/10';
            case 'Normal': return 'text-slate-400 bg-slate-400/10';
            case 'Descontento': return 'text-orange-400 bg-orange-400/10';
            case 'Enojado': return 'text-red-400 bg-red-400/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    const getMoraleIcon = (morale: string) => {
        switch (morale) {
            case 'Feliz':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                    </svg>
                );
            case 'Contento':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-3 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                );
            case 'Enojado':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
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
        <div className="p-4 md:p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-sky-400">Gestión de Plantilla</h2>
            </div>

            <div className="flex space-x-4 border-b border-slate-800 mb-4">
                <button
                    onClick={() => setActiveTab('FIRST_TEAM')}
                    className={`pb-2 px-2 flex items-center gap-2 transition-colors ${activeTab === 'FIRST_TEAM' ? 'text-white border-b-2 border-sky-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <UsersIcon className="w-5 h-5" /> Primer Equipo
                </button>
                <button
                    onClick={() => setActiveTab('ACADEMY')}
                    className={`pb-2 px-2 flex items-center gap-2 transition-colors ${activeTab === 'ACADEMY' ? 'text-white border-b-2 border-sky-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <SparklesIcon className="w-5 h-5" /> Cantera
                </button>
            </div>

            {activeTab === 'FIRST_TEAM' && (
                <div className="space-y-6">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <UsersIcon className="w-8 h-8 text-sky-400" />
                                Plantilla
                            </h1>
                            <p className="text-slate-400 mt-1">Gestiona tu equipo y cantera</p>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap gap-4 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2">
                                <FilterIcon className="w-4 h-4 text-slate-400" />
                                <select
                                    value={filterPosition}
                                    onChange={(e) => setFilterPosition(e.target.value as FilterPosition)}
                                    className="bg-slate-900 text-white text-sm rounded px-3 py-1 border border-slate-700 focus:outline-none focus:border-sky-500"
                                >
                                    <option value="ALL">Todos</option>
                                    <option value="POR">Porteros</option>
                                    <option value="DEF">Defensas</option>
                                    <option value="CEN">Centrocampistas</option>
                                    <option value="DEL">Delanteros</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <TrendingUpIcon className="w-4 h-4 text-slate-400" />
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                                    className="bg-slate-900 text-white text-sm rounded px-3 py-1 border border-slate-700 focus:outline-none focus:border-sky-500"
                                >
                                    <option value="rating">Valoración</option>
                                    <option value="value">Valor de Mercado</option>
                                    <option value="age">Edad</option>
                                    <option value="name">Nombre</option>
                                    <option value="position">Posición</option>
                                </select>
                            </div>
                        </div>
                    </header>

                    {/* Squad List */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                        <div className="grid grid-cols-12 bg-slate-950 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                            <div className="col-span-4 md:col-span-3">Jugador</div>
                            <div className="col-span-2 text-center">Pos</div>
                            <div className="col-span-2 text-center">Media</div>
                            <div className="col-span-2 text-center hidden md:block">Edad</div>
                            <div className="col-span-2 text-right hidden md:block">Valor</div>
                            <div className="col-span-2 md:col-span-1 text-right">Moral</div>
                        </div>

                        <div className="divide-y divide-slate-800">
                            {sortedSquad.map(player => (
                                <button key={player.id} onClick={() => onViewPlayer(player)} className="grid grid-cols-12 p-4 items-center w-full text-left hover:bg-slate-800/50 transition-colors group">
                                    <div className="col-span-4 md:col-span-3 font-semibold text-white truncate flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                                            {player.name.charAt(0)}
                                        </div>
                                        {player.name}
                                        {player.isTransferListed && <BriefcaseIcon className="w-5 h-5 text-sky-400 ml-1 flex-shrink-0" title="En lista de fichajes" />}
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <span className={`text-xs font-bold px-2 py-1 rounded border ${getPositionColor(player.position)}`}>
                                            {player.position}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-center font-bold text-white flex items-center justify-center gap-1">
                                        {player.rating}
                                        {player.rating >= 85 && <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                                    </div>
                                    <div className="col-span-2 text-center text-slate-400 hidden md:block">
                                        {player.age || 20}
                                    </div>
                                    <div className="col-span-2 text-right text-green-400 font-mono hidden md:block">
                                        {formatCurrency(player.value)}
                                    </div>
                                    <div className={`col-span-2 md:col-span-1 text-right`}>
                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getMoraleColor(player.morale)}`}>
                                            {getMoraleIcon(player.morale)}
                                            <span>{player.morale}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Youth Academy Teaser */}
                    <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-sky-900/20 to-transparent"></div>
                        <h3 className="text-xl font-bold text-white mb-2 relative z-10">Cantera</h3>
                        <p className="text-slate-400 text-sm mb-4 max-w-lg relative z-10">
                            Tu academia está buscando nuevos talentos. Los informes de los ojeadores llegarán al final de la temporada.
                        </p>
                        <div className="flex gap-4 relative z-10">
                            <div className="bg-slate-950/50 px-4 py-2 rounded border border-slate-700 text-sm text-slate-300">
                                <span className="text-sky-400 font-bold">3</span> Promesas observadas
                            </div>
                            <div className="bg-slate-950/50 px-4 py-2 rounded border border-slate-700 text-sm text-slate-300">
                                Nivel de Academia: <span className="text-yellow-400 font-bold">Básica</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ACADEMY' && (
                <div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 text-center border-b border-slate-800">
                            <h3 className="text-lg font-bold text-white mb-1">Academia Juvenil</h3>
                            <p className="text-sm text-slate-400">Desarrollando a las estrellas del mañana. Sube jugadores al primer equipo para que debuten.</p>
                        </div>

                        {gameState.youthAcademy.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                No hay jugadores en la cantera actualmente. Espera al inicio de la próxima temporada.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {gameState.youthAcademy.map(player => (
                                    <div key={player.id} className="grid grid-cols-12 p-4 items-center w-full text-left hover:bg-slate-800/50 transition-colors duration-200">
                                        <span className="col-span-5 font-semibold text-lg flex items-center gap-3">
                                            <SparklesIcon className="w-4 h-4 text-yellow-400" />
                                            <span className="truncate">{player.name}</span>
                                        </span>
                                        <div className="col-span-2 flex justify-center">
                                            <span className={`font-bold text-xs px-2 py-1 rounded-full ${getPositionColor(player.position)}`}>{player.position}</span>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className="block text-xs text-slate-500">EDAD</span>
                                            <span className="text-white font-bold">{player.age}</span>
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <span className="block text-xs text-slate-500">MEDIA</span>
                                            <span className="font-bold text-sky-400">{player.rating}</span>
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <button
                                                onClick={() => handlePromote(player)}
                                                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors shadow-lg shadow-sky-600/20"
                                            >
                                                Subir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Confirmation Modal for Promoting Player */}
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
};
