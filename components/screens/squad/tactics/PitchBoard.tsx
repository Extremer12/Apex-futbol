import React from 'react';
import { Player } from '../../../../types';
import { FormationSlot, PitchTheme } from '../TacticalLineupView';
import { PitchPlayerCard } from './PitchPlayerCard';

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
        <div className="lg:col-span-7 flex flex-col items-center space-y-3">
            {/* XI Metrics Strip */}
            <div className="w-full max-w-[500px] grid grid-cols-5 gap-1.5">
                {[
                    { label: 'XI', value: xiMetrics.avgRating, accent: 'text-[var(--apex-gold)]' },
                    { label: 'ATA', value: xiMetrics.attack, accent: 'text-white' },
                    { label: 'MED', value: xiMetrics.midfield, accent: 'text-white' },
                    { label: 'DEF', value: xiMetrics.defense, accent: 'text-white' },
                    { label: 'Edad', value: `${xiMetrics.avgAge}a`, accent: 'text-slate-300' },
                ].map(item => (
                    <div key={item.label} className="py-2 px-2 rounded-xl bg-[#0D1220] border border-white/10 text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">{item.label}</span>
                        <span className={`text-sm font-black leading-none ${item.accent}`}>{item.value}</span>
                    </div>
                ))}
            </div>

            {/* Pitch Field Container */}
            <div className="relative w-full max-w-[500px] aspect-[2160/3270] rounded-2xl overflow-hidden border border-white/15 shadow-xl select-none bg-[#0a521e]">
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

                <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/10 to-black/55 pointer-events-none" />

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] font-semibold text-white/70 bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                    Toca o arrastra un jugador para cambiar puestos
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
