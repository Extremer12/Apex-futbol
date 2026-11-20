import React, { useState } from 'react';
import { Player } from '../../../../types';
import { getPlayerPosition } from '../TacticalLineupView';
import { PlayerPhoto } from '../../../../data/teams/helpers';
import { getPlayerAge } from '../../../../utils/playerUtils';
import { ArrowLeftRight, Users } from 'lucide-react';
import { OvrBadge, EmptyState, positionLabel } from '../../transfers/TransferUI';

interface BenchSquadListProps {
    substitutes: Player[];
    uncalled: Player[];
    selectedPlayerForSwap: Player | null;
    draggedPlayer: { id: number; source: 'starter' | 'sub' | 'uncalled'; slotIndex?: number } | null;
    dragOverPlayerId: number | null;
    isDragOverBenchZone: boolean;
    onDragStart: (e: React.DragEvent, player: Player, source: 'sub' | 'uncalled') => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragOverPlayer: (e: React.DragEvent, playerId: number) => void;
    onDragLeavePlayer: () => void;
    onDropOnPlayer: (e: React.DragEvent, targetPlayer: Player) => void;
    onDragOverBenchZone: (e: React.DragEvent) => void;
    onDragLeaveBenchZone: () => void;
    onDropOnBenchZone: (e: React.DragEvent) => void;
    onPlayerClick: (player: Player) => void;
    onStartSwap: (e: React.MouseEvent, player: Player) => void;
}

export const BenchSquadList: React.FC<BenchSquadListProps> = React.memo(({
    substitutes,
    uncalled,
    selectedPlayerForSwap,
    draggedPlayer,
    dragOverPlayerId,
    isDragOverBenchZone,
    onDragStart,
    onDragEnd,
    onDragOverPlayer,
    onDragLeavePlayer,
    onDropOnPlayer,
    onDragOverBenchZone,
    onDragLeaveBenchZone,
    onDropOnBenchZone,
    onPlayerClick,
    onStartSwap
}) => {
    const [tab, setTab] = useState<'SUBS' | 'UNCALLED'>('SUBS');
    const list = tab === 'SUBS' ? substitutes : uncalled;
    const source: 'sub' | 'uncalled' = tab === 'SUBS' ? 'sub' : 'uncalled';

    return (
        <div
            onDragOver={onDragOverBenchZone}
            onDragLeave={onDragLeaveBenchZone}
            onDrop={onDropOnBenchZone}
            className={`lg:col-span-5 space-y-3 transition-all ${
                isDragOverBenchZone ? 'ring-2 ring-emerald-400/60 rounded-2xl' : ''
            }`}
        >
            {/* Segmented Toggle: Suplentes / Reservas */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-xl">
                <button
                    onClick={() => setTab('SUBS')}
                    className={`h-9 rounded-lg text-xs font-bold transition-colors ${
                        tab === 'SUBS' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Suplentes ({substitutes.length})
                </button>
                <button
                    onClick={() => setTab('UNCALLED')}
                    className={`h-9 rounded-lg text-xs font-bold transition-colors ${
                        tab === 'UNCALLED' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    No convocados ({uncalled.length})
                </button>
            </div>

            {list.length === 0 ? (
                <div className="apex-card">
                    <EmptyState
                        icon={<Users className="w-6 h-6" />}
                        title={tab === 'SUBS' ? 'Sin suplentes' : 'Todos convocados'}
                        text={tab === 'SUBS' ? 'No hay futbolistas disponibles en el banco.' : 'No quedan jugadores fuera de la convocatoria.'}
                    />
                </div>
            ) : (
                <ul className="apex-card divide-y divide-white/5 overflow-hidden lg:max-h-[620px] lg:overflow-y-auto">
                    {list.map(player => {
                        const isSelected = selectedPlayerForSwap?.id === player.id;
                        const isBeingDragged = draggedPlayer?.id === player.id;
                        const isTarget = dragOverPlayerId === player.id;
                        const isAvailable = !player.isInjured && !player.isSuspended;
                        const condition = Math.round(player.condition ?? 100);
                        const pos = getPlayerPosition(player);

                        return (
                            <li
                                key={player.id}
                                draggable={isAvailable}
                                onDragStart={(e) => isAvailable && onDragStart(e, player, source)}
                                onDragEnd={onDragEnd}
                                onDragOver={(e) => {
                                    if (!isAvailable) return;
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                    onDragOverPlayer(e, player.id);
                                }}
                                onDragLeave={onDragLeavePlayer}
                                onDrop={(e) => isAvailable && onDropOnPlayer(e, player)}
                                onClick={() => onPlayerClick(player)}
                                className={`flex items-center gap-3 px-3 sm:px-4 py-3 transition-colors cursor-pointer select-none ${
                                    isBeingDragged
                                        ? 'opacity-40'
                                        : isTarget
                                        ? 'bg-emerald-500/15'
                                        : isSelected
                                        ? 'bg-[var(--apex-gold)]/10'
                                        : 'hover:bg-white/[0.03] active:bg-white/[0.06]'
                                }`}
                            >
                                <PlayerPhoto player={player} className="w-10 h-10 rounded-full shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-bold text-white truncate">{player.name}</p>
                                        {player.isInjured && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/15 text-rose-400 shrink-0">
                                                Lesión {player.injuryWeeksRemaining}s
                                            </span>
                                        )}
                                        {player.isSuspended && !player.isInjured && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/15 text-rose-400 shrink-0">
                                                Sanción {player.suspensionWeeksRemaining}p
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        <span className="font-bold text-slate-300">{positionLabel[pos] || pos}</span> · {getPlayerAge(player)} años ·{' '}
                                        <span className={condition >= 75 ? 'text-emerald-400 font-semibold' : condition >= 50 ? 'text-amber-400 font-semibold' : 'text-rose-400 font-semibold'}>
                                            {condition}% físico
                                        </span>
                                    </p>
                                </div>
                                <OvrBadge value={player.rating} muted={player.rating < 75} />
                                {isAvailable && (
                                    <button
                                        onClick={(e) => onStartSwap(e, player)}
                                        aria-label="Cambiar titular"
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                            isSelected
                                                ? 'bg-[var(--apex-gold)] text-slate-950'
                                                : 'bg-white/5 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <ArrowLeftRight className="w-4 h-4" />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
});
