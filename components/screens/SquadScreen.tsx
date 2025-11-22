
import React, { useState } from 'react';
import { GameState, Player, Morale } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency } from '../../utils';
import { BriefcaseIcon, SparklesIcon, UsersIcon } from '../icons';

interface SquadScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export const SquadScreen: React.FC<SquadScreenProps> = ({ gameState, dispatch }) => {
    const [activeTab, setActiveTab] = useState<'FIRST_TEAM' | 'ACADEMY'>('FIRST_TEAM');

    const POS_COLORS: Record<Player['position'], string> = { POR: 'bg-yellow-500/20 text-yellow-300', DEF: 'bg-green-500/20 text-green-300', CEN: 'bg-sky-500/20 text-sky-300', DEL: 'bg-red-500/20 text-red-300' };
    const MORALE_COLORS: Record<Morale, string> = { 'Feliz': 'bg-green-400', 'Contento': 'bg-sky-400', 'Normal': 'bg-yellow-400', 'Descontento': 'bg-orange-400', 'Enojado': 'bg-red-500' };
    const MORALE_KEYS: Morale[] = ['Feliz', 'Contento', 'Normal', 'Descontento', 'Enojado'];

    const onViewPlayer = (player: Player) => {
        dispatch({ type: 'SET_VIEWING_PLAYER', payload: player });
    };

    const handlePromote = (player: Player) => {
        if (gameState.team.squad.length >= 25) {
            alert("La plantilla está llena (Máx 25). Vende jugadores antes de subir canteranos.");
            return;
        }
        dispatch({ type: 'PROMOTE_PLAYER', payload: player });
    }

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
                <>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 px-1 mb-2">
                        <span className="font-semibold">Moral:</span>
                        {MORALE_KEYS.map(morale => (
                            <div key={morale} className="flex items-center gap-1.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${MORALE_COLORS[morale]}`}></div>
                                <span>{morale}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="grid grid-cols-12 text-xs font-semibold text-slate-400 p-4 bg-slate-800/50 uppercase tracking-wider">
                            <span className="col-span-4 sm:col-span-5">Jugador</span>
                            <span className="col-span-2 text-center">Pos</span>
                            <span className="col-span-2 text-center">Edad</span>
                            <span className="col-span-2 text-center">Nivel</span>
                            <span className="col-span-2 sm:col-span-1 text-right">Valor</span>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {gameState.team.squad.sort((a,b) => b.rating - a.rating).map(player => (
                                <button key={player.id} onClick={() => onViewPlayer(player)} className="grid grid-cols-12 p-4 items-center w-full text-left hover:bg-slate-800/50 transition-colors duration-200">
                                    <span className="col-span-4 sm:col-span-5 font-semibold text-lg flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${MORALE_COLORS[player.morale]}`} title={`Moral: ${player.morale}`}></div>
                                        <span className="truncate">{player.name}</span>
                                        {player.isTransferListed && <BriefcaseIcon className="w-5 h-5 text-sky-400 ml-1 flex-shrink-0" title="En lista de fichajes" />}
                                    </span>
                                    <div className="col-span-2 flex justify-center">
                                        <span className={`font-bold text-xs px-2 py-1 rounded-full ${POS_COLORS[player.position]}`}>{player.position}</span>
                                    </div>
                                    <span className="col-span-2 text-center text-slate-300">{player.age || '-'}</span>
                                    <span className="col-span-2 text-center font-bold text-sky-400 text-lg">{player.rating}</span>
                                    <span className="col-span-2 sm:col-span-1 text-right text-green-400 font-semibold text-sm sm:text-lg">{formatCurrency(player.value)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-right">{gameState.team.squad.length}/25 Jugadores</p>
                </>
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
                                            <span className={`font-bold text-xs px-2 py-1 rounded-full ${POS_COLORS[player.position]}`}>{player.position}</span>
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
        </div>
    );
};
