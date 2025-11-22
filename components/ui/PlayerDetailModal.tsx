import React from 'react';
import { Player, Morale } from '../../types';
import { GameAction } from '../../state/reducer';
import { Modal } from './Modal';
import { formatCurrency, formatWeeklyWage } from '../../utils';

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
                <div className="grid grid-cols-3 gap-4 text-center bg-slate-800/50 p-4 rounded-lg">
                    <div><p className="text-xs text-slate-400 uppercase">Nivel</p><p className="text-3xl font-bold text-sky-400">{player.rating}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase">Valor</p><p className="text-3xl font-bold text-green-400">{formatCurrency(player.value)}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase">Salario</p><p className="text-3xl font-bold text-orange-400">{formatWeeklyWage(player.wage)}</p></div>
                </div>
                <div className="text-sm space-y-2 bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between"><strong>Posición:</strong> <span>{player.position}</span></div>
                    <div className="flex justify-between"><strong>Moral:</strong> <span className={`font-semibold ${MORALE_COLORS[player.morale]}`}>{player.morale}</span></div>
                    <div className="flex justify-between"><strong>Contrato:</strong> <span>{player.contractYears} años restantes</span></div>
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
