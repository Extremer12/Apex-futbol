import React from 'react';
import { Player } from '../../../../types';
import { FormationSlot, getPlayerPosition, getPositionPenalty, getEffectivePlayerRating } from '../TacticalLineupView';
import { PlayerPhoto } from '../../../../data/teams/helpers';
import { Move } from 'lucide-react';

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

const getPositionBadgeColor = (pos: Player['position']) => {
    switch (pos) {
        case 'POR': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        case 'DEF': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
        case 'CEN': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        case 'DEL': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
        default: return 'bg-white/10 text-white/70 border-white/10';
    }
};

const getRatingColor = (rating: number, penalty: number = 0) => {
    if (penalty >= 10) return 'text-rose-300 bg-rose-950/90 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]';
    if (penalty > 0) return 'text-amber-300 bg-amber-950/90 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
    if (rating >= 83) return 'text-amber-300 bg-amber-950/80 border-amber-400';
    if (rating >= 76) return 'text-emerald-300 bg-emerald-950/80 border-emerald-500';
    if (rating >= 70) return 'text-sky-300 bg-sky-950/80 border-sky-500';
    return 'text-slate-300 bg-slate-900 border-slate-600';
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
            className={`group z-20 flex flex-col items-center cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
                isBeingDragged 
                    ? 'opacity-40 scale-90' 
                    : isTargetOfDrag
                    ? 'scale-125 z-30'
                    : isSelected 
                    ? 'scale-115' 
                    : 'hover:scale-108'
            }`}
        >
            <div className="relative">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 p-0.5 transition-all shadow-xl bg-slate-900 ${
                    isTargetOfDrag
                        ? 'border-emerald-400 ring-4 ring-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.8)]'
                        : isSelected 
                        ? 'border-amber-400 ring-4 ring-amber-400/50 shadow-amber-500/50' 
                        : isOutOfPosition
                        ? 'border-rose-500 ring-2 ring-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                        : 'border-white/90 group-hover:border-[var(--apex-gold)] group-hover:ring-2 group-hover:ring-[var(--apex-gold)]/40'
                }`}>
                    <PlayerPhoto 
                        player={player} 
                        className="w-full h-full object-cover rounded-full pointer-events-none" 
                    />
                </div>

                <div className={`absolute -top-1 -right-1.5 px-1.2 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black border shadow-md flex items-center gap-0.5 ${getRatingColor(effRating, penalty)}`}>
                    <span>{effRating}</span>
                </div>

                {isOutOfPosition && (
                    <div 
                        className="absolute -top-1.5 -left-1.5 px-1 py-0.2 bg-rose-600 border border-white/50 text-white rounded-full flex items-center justify-center text-[7.5px] font-black shadow-lg animate-bounce"
                        title={`⚠️ Fuera de posición: ${playerPos} ubicado como ${slot.positionType}. Penalización: -${penalty} MEDIA (Base: ${player.rating} → Efectiva: ${effRating})`}
                    >
                        <span>-{penalty}</span>
                    </div>
                )}
            </div>

            <div className={`mt-1 flex items-center gap-1 bg-black/90 backdrop-blur-md px-1.5 py-0.5 rounded-full border transition-colors shadow-lg max-w-[78px] sm:max-w-[90px] text-center ${
                isOutOfPosition ? 'border-rose-500/60' : 'border-white/20 group-hover:border-[var(--apex-gold)]'
            }`}>
                <span className={`text-[7.5px] sm:text-[8px] font-black px-1 py-0.2 rounded uppercase shrink-0 ${getPositionBadgeColor(slot.positionType)}`}>
                    {slot.role}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-black truncate uppercase tracking-tight ${
                    isOutOfPosition ? 'text-rose-200' : 'text-white'
                }`}>
                    {player.name.split(' ').pop()}
                </span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 flex items-center gap-0.5 px-1.5 py-0.2 bg-black/70 text-slate-300 font-bold text-[7.5px] uppercase tracking-wider rounded-full border border-white/10 shadow pointer-events-none">
                <Move className="w-2 h-2 text-[var(--apex-gold)]" />
                <span>Arrastrar</span>
            </div>
        </div>
    );
});
