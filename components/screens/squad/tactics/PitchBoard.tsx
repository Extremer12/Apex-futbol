import React from 'react';
import { Player } from '../../../../types';
import { FormationSlot, PitchTheme } from '../TacticalLineupView';
import { PitchPlayerCard } from './PitchPlayerCard';
import { Flame, Move } from 'lucide-react';

interface PitchBoardProps {
    slots: FormationSlot[];
    starters: Player[];
    pitchTheme: PitchTheme;
    xiMetrics: {
        attack: number;
        midfield: number;
        defense: number;
        avgRating: number;
        avgAge: number;
    };
    selectedPlayerForSwap: Player | null;
    draggedPlayer: { id: number; source: 'starter' | 'sub' | 'uncalled'; slotIndex?: number } | null;
    dragOverSlotIndex: number | null;
    onDragStart: (e: React.DragEvent, player: Player, source: 'starter', slotIndex: number) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragOverSlot: (e: React.DragEvent, slotIndex: number) => void;
    onDragLeaveSlot: () => void;
    onDropOnSlot: (e: React.DragEvent, slotIndex: number) => void;
    onPlayerClick: (player: Player) => void;
}

export const PitchBoard: React.FC<PitchBoardProps> = React.memo(({
    slots,
    starters,
    pitchTheme,
    xiMetrics,
    selectedPlayerForSwap,
    draggedPlayer,
    dragOverSlotIndex,
    onDragStart,
    onDragEnd,
    onDragOverSlot,
    onDragLeaveSlot,
    onDropOnSlot,
    onPlayerClick
}) => {
    return (
        <div className="lg:col-span-7 flex flex-col items-center">
            {/* Quick Metrics Badge */}
            <div className="w-full max-w-[500px] mb-3 bg-[#0E131F]/90 border border-white/10 rounded-2xl p-2.5 sm:p-3 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Flame className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">XI Titular</div>
                        <div className="text-xs font-black text-white">Media: <span className="text-[var(--apex-gold)]">{xiMetrics.avgRating}</span></div>
                    </div>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] sm:text-xs font-black">
                        ATA {xiMetrics.attack}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-black">
                        MED {xiMetrics.midfield}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[10px] sm:text-xs font-black">
                        DEF {xiMetrics.defense}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[10px] sm:text-xs font-bold">
                        {xiMetrics.avgAge} a
                    </span>
                </div>
            </div>

            {/* Pitch Field Container */}
            <div 
                className="relative w-full max-w-[500px] aspect-[2160/3270] rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl select-none bg-[#0a521e]"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.2)'
                }}
            >
                {pitchTheme === 'simple-svg' ? (
                    <img
                        src="/pitch-field-vertical.svg"
                        alt="Terreno de Juego"
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none filter brightness-95 contrast-105"
                    />
                ) : pitchTheme === 'coach-table-svg' ? (
                    <img
                        src="/pitch-coach-vertical.svg"
                        alt="Pizarra de Entrenador"
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none filter brightness-90 contrast-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[#0A2613] overflow-hidden">
                        <div className="absolute inset-0 flex flex-col">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`flex-1 ${i % 2 === 0 ? 'bg-[#0D2E17]' : 'bg-[#092211]'}`} 
                                />
                            ))}
                        </div>
                        <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full stroke-white/40 fill-none stroke-[0.7] pointer-events-none">
                            <rect x="5" y="5" width="90" height="140" rx="1" />
                            <line x1="5" y1="75" x2="95" y2="75" />
                            <circle cx="50" cy="75" r="14" />
                            <circle cx="50" cy="75" r="0.8" className="fill-white/60" />
                            <rect x="25" y="5" width="50" height="24" />
                            <rect x="36" y="5" width="28" height="9" />
                            <circle cx="50" cy="18" r="0.8" className="fill-white/60" />
                            <path d="M 38 29 A 12 12 0 0 0 62 29" />
                            <rect x="25" y="121" width="50" height="24" />
                            <rect x="36" y="136" width="28" height="9" />
                            <circle cx="50" cy="132" r="0.8" className="fill-white/60" />
                            <path d="M 38 121 A 12 12 0 0 1 62 121" />
                        </svg>
                    </div>
                )}

                <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/10 to-black/60 pointer-events-none" />

                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/50 bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">
                    <span>Ataque</span>
                    <span>▲</span>
                </div>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-1 text-[8px] font-bold text-white/60 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                    <Move className="w-2.5 h-2.5 text-[var(--apex-gold)]" />
                    <span>Arrastra y suelta futbolistas para cambiar puestos</span>
                </div>

                {slots.map((slot, index) => {
                    const player = starters[index];
                    if (!player) return null;

                    return (
                        <PitchPlayerCard
                            key={slot.id}
                            slot={slot}
                            player={player}
                            index={index}
                            isSelected={selectedPlayerForSwap?.id === player.id}
                            isBeingDragged={draggedPlayer?.id === player.id}
                            isTargetOfDrag={dragOverSlotIndex === index}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onDragOverSlot={onDragOverSlot}
                            onDragLeaveSlot={onDragLeaveSlot}
                            onDropOnSlot={onDropOnSlot}
                            onPlayerClick={onPlayerClick}
                        />
                    );
                })}
            </div>
        </div>
    );
});
