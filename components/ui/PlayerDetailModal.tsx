import React, { useState } from 'react';
import { Player, Morale } from '../../types';
import { GameAction } from '../../state/reducer';
import { useGameStore } from '../../state/gameStore';
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
    const isUserPlayer = useGameStore(s => s.gameState?.team?.squad?.some(p => p.id === player.id) ?? false);
    const [hasTalked, setHasTalked] = useState(false);
    const [hasRenewed, setHasRenewed] = useState(false);

    const MORALE_COLORS: Record<Morale, string> = { 
        'Feliz': 'text-green-400', 
        'Contento': 'text-green-300', 
        'Normal': 'text-yellow-300', 
        'Descontento': 'text-orange-400', 
        'Enojado': 'text-red-500' 
    };
    
    const onClose = () => dispatch({ type: 'SET_VIEWING_PLAYER', payload: null });
    const onTransferList = () => dispatch({ type: 'TOGGLE_TRANSFER_LIST', payload: player });

    const handleRenewContract = () => {
        if (hasRenewed) return;
        dispatch({
            type: 'RENEW_PLAYER_CONTRACT',
            payload: {
                playerId: player.id,
                contractYearsBonus: 2,
                wageMultiplier: 1.15
            }
        });
        setHasRenewed(true);
    };

    const handleMotivationalTalk = () => {
        if (hasTalked || player.morale === 'Feliz') return;
        dispatch({
            type: 'TALK_TO_PLAYER',
            payload: { playerId: player.id }
        });
        setHasTalked(true);
    };

    const age = getPlayerAge(player);
    const potential = getPlayerPotential(player);
    const potTier = getPlayerPotentialTier(player);
    const tierBadge = getTierBadge(potTier);
    const releaseClause = getPlayerReleaseClause(player);

    const canRenew = !hasRenewed && player.contractYears <= 3;
    const canTalk = !hasTalked && player.morale !== 'Feliz';

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
                        <p className="text-base font-black text-emerald-400 mt-2">{formatCurrency(player.value)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Salario</p>
                        <p className="text-xs font-black text-orange-400 mt-2.5">{formatWeeklyWage(player.wage)}</p>
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
                        <span className="font-black text-[var(--apex-gold)]">{formatCurrency(releaseClause)}</span>
                    </div>
                    {player.isInjured && (
                        <div className="flex justify-between">
                            <span className="text-white/60">Estado Físico:</span> 
                            <span className="font-black text-rose-400">Lesionado ({player.injuryWeeksRemaining} sem)</span>
                        </div>
                    )}
                    {player.isSuspended && (
                        <div className="flex justify-between">
                            <span className="text-white/60">Disciplina:</span> 
                            <span className="font-black text-rose-500">Suspendido ({player.suspensionWeeksRemaining} par)</span>
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

                {/* Management Actions: Renewal, Motivation & Transfer List (Only for User's Own Players) */}
                {isUserPlayer ? (
                    <div className="pt-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                disabled={!canRenew}
                                onClick={handleRenewContract}
                                className={`border font-bold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm ${
                                    hasRenewed
                                        ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300 cursor-default'
                                        : !canRenew
                                        ? 'bg-slate-800/40 border-white/5 text-slate-500 cursor-not-allowed'
                                        : 'bg-emerald-600/20 border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300'
                                }`}
                                title={
                                    hasRenewed 
                                        ? 'Contrato renovado recientemente' 
                                        : !canRenew 
                                        ? 'El jugador tiene contrato a largo plazo (más de 3 años)' 
                                        : 'Extender 2 años más de contrato con +15% de salario y asegurar felicidad'
                                }
                            >
                                <span>{hasRenewed ? '✓ Renovado' : '📝 Renovar (+2 años)'}</span>
                            </button>

                            <button
                                disabled={!canTalk}
                                onClick={handleMotivationalTalk}
                                className={`border font-bold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm ${
                                    hasTalked
                                        ? 'bg-sky-500/30 border-sky-500/50 text-sky-300 cursor-default'
                                        : !canTalk
                                        ? 'bg-slate-800/40 border-white/5 text-slate-500 cursor-not-allowed'
                                        : 'bg-sky-600/20 border-sky-500/40 hover:bg-sky-600/30 text-sky-300'
                                }`}
                                title={
                                    hasTalked
                                        ? 'Charla mantenida esta semana'
                                        : !canTalk
                                        ? 'La moral del jugador ya está en su nivel óptimo (Feliz)'
                                        : 'Charla personal del presidente para levantar la moral'
                                }
                            >
                                <span>{hasTalked ? '✓ Charla Realizada' : '💬 Charla Motivacional'}</span>
                            </button>
                        </div>

                        <button 
                            onClick={onTransferList} 
                            className={`w-full font-black py-2.5 px-4 rounded-xl transition-all text-xs uppercase tracking-wider shadow-lg ${
                                player.isTransferListed 
                                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                        >
                            {player.isTransferListed ? 'Quitar de la Lista de Transferibles' : 'Declarar Transferible'}
                        </button>
                    </div>
                ) : (
                    <div className="pt-2 text-center py-2 bg-slate-800/30 border border-white/5 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            🛡️ Jugador de otro club
                        </span>
                    </div>
                )}
            </div>
        </Modal>
    );
};

