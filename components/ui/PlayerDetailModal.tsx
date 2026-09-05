import React from 'react';
import { Player, Morale } from '../../types';
import { GameAction } from '../../state/reducer';
import { Modal } from './Modal';
import { formatCurrency, formatWeeklyWage } from '../../utils';
import { PlayerPhoto } from '../../data/teams/helpers';
import { 
    getPlayerAge, 
    getPlayerPotential, 
    getPlayerPotentialTier, 
    getTierBadge, 
    getPlayerReleaseClause 
} from '../../utils/playerUtils';
import { Shield, Sparkles, Star } from 'lucide-react';

interface PlayerDetailModalProps {
    player: Player;
    dispatch: React.Dispatch<GameAction>;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, dispatch }) => {
    const MORALE_COLORS: Record<Morale, string> = { 
        'Feliz': 'text-green-400', 
        'Contento': 'text-green-300', 
        'Normal': 'text-yellow-300', 
        'Descontento': 'text-orange-400', 
        'Enojado': 'text-red-500' 
    };
    
    const onClose = () => dispatch({ type: 'SET_VIEWING_PLAYER', payload: null });
    const onTransferList = () => dispatch({ type: 'TOGGLE_TRANSFER_LIST', payload: player });

    const age = getPlayerAge(player);
    const potential = getPlayerPotential(player);
    const potTier = getPlayerPotentialTier(player);
    const tierBadge = getTierBadge(potTier);
    const releaseClause = getPlayerReleaseClause(player);

    const roleName = player.preferredRole === 'Key' ? 'Jugador Clave'
        : player.preferredRole === 'FirstTeam' ? 'Titular Habitual'
        : player.preferredRole === 'Rotation' ? 'Rotación'
        : 'Joven Promesa';

    return (
        <Modal title={player.name} onClose={onClose}>
            <div className="space-y-4">
                {/* Player Profile Header Card with Photo */}
                <div className="flex items-center gap-4 bg-slate-800/70 border border-white/10 p-4 rounded-2xl shadow-lg">
                    <PlayerPhoto player={player} className="w-16 h-16 rounded-2xl border-2 border-white/10 shadow-xl" />
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-white">{player.name}</h3>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase ${tierBadge.color}`}>
                                {tierBadge.longLabel}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-xs font-bold uppercase">{player.position}</span>
                            <span className="text-xs text-slate-400">{age} años</span>
                            <span className={`text-xs font-bold ${MORALE_COLORS[player.morale]}`}>• {player.morale}</span>
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-4 gap-3 text-center bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Media</p>
                        <p className="text-2xl font-black text-sky-400 mt-1">{player.rating}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Potencial</p>
                        <p className="text-2xl font-black text-amber-400 mt-1 flex items-center justify-center gap-0.5">
                            {potential} <Sparkles className="w-3.5 h-3.5 inline" />
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Valor</p>
                        <p className="text-base font-black text-emerald-400 mt-2">€{player.value}M</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Salario</p>
                        <p className="text-xs font-black text-orange-400 mt-2.5">{formatWeeklyWage(player.wage)}/sem</p>
                    </div>
                </div>

                {/* Contract & Status Details */}
                <div className="text-xs space-y-2 bg-slate-800/40 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between">
                        <span className="text-white/60">Rol en el Equipo:</span> 
                        <span className="font-black text-white">{roleName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Contrato:</span> 
                        <span className="font-bold text-white">{player.contractYears} año{player.contractYears > 1 ? 's' : ''} restantes</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Cláusula de Rescisión:</span> 
                        <span className="font-black text-[var(--apex-gold)]">€{releaseClause}M</span>
                    </div>
                    {player.isInjured && (
                        <div className="flex justify-between">
                            <span className="text-white/60">Estado Físico:</span> 
                            <span className="font-black text-rose-400">🚑 Lesionado ({player.injuryWeeksRemaining} sem)</span>
                        </div>
                    )}
                    {player.isSuspended && (
                        <div className="flex justify-between">
                            <span className="text-white/60">Disciplina:</span> 
                            <span className="font-black text-rose-500">🟥 Suspendido ({player.suspensionWeeksRemaining} par)</span>
                        </div>
                    )}
                </div>

                {/* Season Performance */}
                <div className="grid grid-cols-3 gap-3 text-center bg-slate-800/50 p-3.5 rounded-xl border border-white/5">
                    <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Goles</p>
                        <p className="text-lg font-black text-white">{player.stats?.goals || 0}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Asistencias</p>
                        <p className="text-lg font-black text-white">{player.stats?.assists || 0}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Partidos</p>
                        <p className="text-lg font-black text-white">{player.stats?.appearances || 0}</p>
                    </div>
                </div>

                {/* Transfer List Action Button */}
                <div className="pt-2">
                     <button 
                        onClick={onTransferList} 
                        className={`w-full font-black py-3 px-4 rounded-xl transition-all text-xs uppercase tracking-wider shadow-lg ${
                            player.isTransferListed 
                                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                        }`}
                    >
                        {player.isTransferListed ? 'Quitar de la Lista de Transferibles' : 'Declarar Transferible'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

