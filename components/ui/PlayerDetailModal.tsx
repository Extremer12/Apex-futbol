import React from 'react';
import { Player, Morale } from '../../types';
import { GameAction } from '../../state/reducer';
import { Modal } from './Modal';
import { formatCurrency, formatWeeklyWage } from '../../utils';
import { PlayerPhoto } from '../../data/teams/helpers';

interface PlayerDetailModalProps {
    player: Player;
    dispatch: React.Dispatch<GameAction>;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, dispatch }) => {
    const MORALE_COLORS: Record<Morale, string> = { 'Feliz': 'text-green-400', 'Contento': 'text-green-300', 'Normal': 'text-yellow-300', 'Descontento': 'text-orange-400', 'Enojado': 'text-red-500' };
    
    const onClose = () => dispatch({ type: 'SET_VIEWING_PLAYER', payload: null });
    const onTransferList = () => dispatch({ type: 'TOGGLE_TRANSFER_LIST', payload: player });

    return (
        <Modal title={player.name} onClose={onClose}>
            <div className="space-y-4">
                {/* Player Profile Header Card with Photo */}
                <div className="flex items-center gap-4 bg-slate-800/70 border border-white/5 p-4 rounded-xl">
                    <PlayerPhoto player={player} className="w-16 h-16 rounded-2xl border-2 border-white/10 shadow-xl" />
                    <div>
                        <h3 className="text-lg font-black text-white">{player.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-xs font-bold uppercase">{player.position}</span>
                            <span className="text-xs text-slate-400">{player.age || 24} años</span>
                            <span className={`text-xs font-bold ${MORALE_COLORS[player.morale]}`}>• {player.morale}</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center bg-slate-800/50 p-4 rounded-lg">
                    <div><p className="text-xs text-slate-400 uppercase">Nivel</p><p className="text-3xl font-bold text-sky-400">{player.rating}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase">Valor</p><p className="text-xl mt-2 font-bold text-green-400">{formatCurrency(player.value)}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase">Salario</p><p className="text-xl mt-2 font-bold text-orange-400">{formatWeeklyWage(player.wage)}</p></div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase">Condición</p>
                        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mt-3 shadow-inner relative">
                            <div 
                                className={`h-full absolute top-0 left-0 transition-all ${(player.condition || 100) > 70 ? 'bg-green-500' : (player.condition || 100) > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                style={{ width: `${player.condition || 100}%` }}
                            />
                        </div>
                    </div>
                </div>
                <div className="text-sm space-y-2 bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between"><strong>Posición:</strong> <span>{player.position}</span></div>
                    <div className="flex justify-between"><strong>Moral:</strong> <span className={`font-semibold ${MORALE_COLORS[player.morale]}`}>{player.morale}</span></div>
                    <div className="flex justify-between"><strong>Contrato:</strong> <span>{player.contractYears} años restantes</span></div>
                    {player.isInjured && (
                        <div className="flex justify-between"><strong>Lesión:</strong> <span className="font-semibold text-red-400">🚑 {player.injuryWeeksRemaining} semanas</span></div>
                    )}
                    {player.isSuspended && (
                        <div className="flex justify-between"><strong>Suspensión:</strong> <span className="font-semibold text-red-500">🟥 {player.suspensionWeeksRemaining} partidos</span></div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center bg-slate-800/50 p-4 rounded-lg">
                    <div><p className="text-xs text-slate-400 uppercase">Goles</p><p className="text-xl font-bold text-white">{player.stats?.goals || 0}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase">Asistencias</p><p className="text-xl font-bold text-white">{player.stats?.assists || 0}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase">Partidos</p><p className="text-xl font-bold text-white">{player.stats?.appearances || 0}</p></div>
                </div>
                <div className="pt-4 border-t border-slate-800">
                     <button onClick={onTransferList} className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                        {player.isTransferListed ? 'Quitar de la lista de Fichajes' : 'Poner en la lista de Fichajes'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
