import React from 'react';
import { Player } from '../../../../types';
import { FormationSlot, getPlayerPosition, getPositionPenalty, getEffectivePlayerRating } from '../TacticalLineupView';
import { PlayerPhoto } from '../../../../data/teams/helpers';

interface PitchPlayerCardProps {
    slot: FormationSlot;
    player: Player;
    index: number;
    isSelected: boolean;
    isBeingDragged: boolean;
    isTargetOfDrag: boolean;
    onDragStart: (e: React.DragEvent, player: Player, source: 'starter', slotIndex: number) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragOverSlot: (e: React.DragEvent, slotIndex: number) => void;
    onDragLeaveSlot: () => void;
    onDropOnSlot: (e: React.DragEvent, slotIndex: number) => void;
    onPlayerClick: (player: Player) => void;
}

const getRatingColor = (rating: number, penalty: number = 0) => {
    if (penalty >= 10) return 'text-rose-300 bg-rose-950/90 border-rose-500';
    if (penalty > 0) return 'text-amber-300 bg-amber-950/90 border-amber-500';
    if (rating >= 80) return 'text-[var(--apex-gold)] bg-[#0D1220] border-[var(--apex-gold)]/70';
    return 'text-white bg-[#0D1220] border-white/25';
};

export const PitchPlayerCard: React.FC<PitchPlayerCardProps> = React.memo(({
    slot,
    player,
    index,
    isSelected,
    isBeingDragged,
    isTargetOfDrag,
    onDragStart,
    onDragEnd,
    onDragOverSlot,
    onDragLeaveSlot,
    onDropOnSlot,
    onPlayerClick
}) => {
    const playerPos = getPlayerPosition(player);
    const penalty = getPositionPenalty(playerPos, slot.positionType);
    const effRating = getEffectivePlayerRating(player, slot.positionType);
    const isOutOfPosition = penalty > 0;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                transform: 'translate(-50%, -50%)',
            }}
            draggable={!player.isInjured && !player.isSuspended}
            onDragStart={(e) => onDragStart(e, player, 'starter', index)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                onDragOverSlot(e, index);
            }}
            onDragLeave={onDragLeaveSlot}
            onDrop={(e) => onDropOnSlot(e, index)}
            onClick={() => onPlayerClick(player)}
            className={`group z-20 flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform duration-150 select-none ${
                isBeingDragged
                    ? 'opacity-40 scale-90'
                    : isTargetOfDrag
                    ? 'scale-115 z-30'
                    : isSelected
                    ? 'scale-110'
                    : 'hover:scale-105'
            }`}
        >
            <div className="relative">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 p-0.5 transition-all shadow-lg bg-[#0D1220] ${
                    isTargetOfDrag
                        ? 'border-emerald-400 ring-2 ring-emerald-400/60'
                        : isSelected
                        ? 'border-[var(--apex-gold)] ring-2 ring-[var(--apex-gold)]/60'
                        : isOutOfPosition
                        ? 'border-rose-500'
                        : 'border-white/85 group-hover:border-[var(--apex-gold)]'
                }`}>
                    <PlayerPhoto
                        player={player}
                        className="w-full h-full object-cover rounded-full pointer-events-none"
                    />
                </div>

                <div className={`absolute -top-1 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black border leading-none ${getRatingColor(effRating, penalty)}`}>
                    {effRating}
                </div>

                {isOutOfPosition && (
                    <div
                        className="absolute -top-1 -left-1.5 px-1 py-0.5 bg-rose-600 border border-white/40 text-white rounded-full text-[8px] font-black leading-none"
                        title={`Fuera de posición: ${playerPos} en ${slot.positionType} (-${penalty} media)`}
                    >
                        -{penalty}
                    </div>
                )}
            </div>

            <div className={`mt-1 flex items-center gap-1 bg-[#0D1220]/95 backdrop-blur px-1.5 py-0.5 rounded-full border max-w-[82px] sm:max-w-[94px] ${
                isOutOfPosition ? 'border-rose-500/60' : 'border-white/15 group-hover:border-[var(--apex-gold)]/60'
            }`}>
                <span className="text-[8px] font-bold text-slate-400 uppercase shrink-0">
                    {slot.role}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold truncate ${
                    isOutOfPosition ? 'text-rose-200' : 'text-white'
                }`}>
                    {player.name.split(' ').pop()}
                </span>
            </div>
        </div>
    );
});
