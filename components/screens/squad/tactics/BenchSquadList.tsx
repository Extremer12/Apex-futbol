import React from 'react';
import { Player } from '../../../../types';
import { getPlayerPosition } from '../TacticalLineupView';
import { PlayerPhoto } from '../../../../data/teams/helpers';
import { getPlayerAge } from '../../../../utils/playerUtils';
import { GripVertical, ArrowLeftRight } from 'lucide-react';

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

const getPositionBadgeColor = (pos: Player['position']) => {
    switch (pos) {
        case 'POR': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        case 'DEF': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
        case 'CEN': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        case 'DEL': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
        default: return 'bg-white/10 text-white/70 border-white/10';
    }
};

const getRatingColor = (rating: number) => {
    if (rating >= 83) return 'text-amber-300 bg-amber-950/80 border-amber-400';
    if (rating >= 76) return 'text-emerald-300 bg-emerald-950/80 border-emerald-500';
    if (rating >= 70) return 'text-sky-300 bg-sky-950/80 border-sky-500';
    return 'text-slate-300 bg-slate-900 border-slate-600';
};

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
    return (
        <div className="lg:col-span-5 space-y-4">
            {/* BANCO DE SUPLENTES */}
            <div 
                onDragOver={onDragOverBenchZone}
                onDragLeave={onDragLeaveBenchZone}
                onDrop={onDropOnBenchZone}
                className={`bg-[#0E131F] border rounded-2xl p-4 shadow-xl transition-all ${
                    isDragOverBenchZone 
                        ? 'border-emerald-400 ring-4 ring-emerald-400/30 bg-emerald-950/20' 
                        : 'border-white/10'
                }`}
            >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <h3 className="font-black text-sm text-white uppercase tracking-tight">
                            Banco de Suplentes
                        </h3>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                            {substitutes.length} convocados
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <GripVertical className="w-3 h-3 text-emerald-400" />
                        <span>Arrastrables</span>
                    </span>
                </div>

                {substitutes.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No hay jugadores disponibles en el banquillo.</p>
                ) : (
                    <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                        {substitutes.map(player => {
                            const isSelected = selectedPlayerForSwap?.id === player.id;
                            const isBeingDragged = draggedPlayer?.id === player.id;
                            const isTarget = dragOverPlayerId === player.id;

                            return (
                                <div
                                    key={player.id}
                                    draggable={!player.isInjured && !player.isSuspended}
                                    onDragStart={(e) => onDragStart(e, player, 'sub')}
                                    onDragEnd={onDragEnd}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                        onDragOverPlayer(e, player.id);
                                    }}
                                    onDragLeave={onDragLeavePlayer}
                                    onDrop={(e) => onDropOnPlayer(e, player)}
                                    onClick={() => onPlayerClick(player)}
                                    className={`group p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-grab active:cursor-grabbing select-none ${
                                        isBeingDragged
                                            ? 'opacity-40 scale-95'
                                            : isTarget
                                            ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/50 scale-[1.02]'
                                            : isSelected 
                                            ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/40' 
                                            : 'bg-black/30 hover:bg-white/5 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <GripVertical className="w-3 h-3 text-slate-500 group-hover:text-[var(--apex-gold)] transition-colors shrink-0" />
                                        <div className="relative shrink-0">
                                            <PlayerPhoto 
                                                player={player} 
                                                className="w-8 h-8 rounded-full border border-white/10 object-cover pointer-events-none" 
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${getPositionBadgeColor(getPlayerPosition(player))}`}>
                                                    {getPlayerPosition(player)}
                                                </span>
                                                <h4 className="text-xs font-black text-white truncate uppercase tracking-tight group-hover:text-[var(--apex-gold)] transition-colors">
                                                    {player.name}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                <span>{getPlayerAge(player)} años</span>
                                                <span>•</span>
                                                <span className="text-emerald-400 font-bold">{Math.round(player.condition ?? 100)}% Físico</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className={`px-2 py-0.5 rounded text-xs font-black border ${getRatingColor(player.rating)}`}>
                                            {player.rating}
                                        </div>
                                        <button
                                            onClick={(e) => onStartSwap(e, player)}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-[var(--apex-gold)] text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
                                            title="Poner de titular"
                                        >
                                            <ArrowLeftRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* NO CONVOCADOS & RESERVAS */}
            <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                        <h3 className="font-black text-sm text-white uppercase tracking-tight">
                            No Convocados & Reservas
                        </h3>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                            {uncalled.length} futbolistas
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Fuera del día de partido</span>
                </div>

                {uncalled.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-3">Todos los jugadores del plantel están convocados.</p>
                ) : (
                    <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                        {uncalled.map(player => {
                            const isSelected = selectedPlayerForSwap?.id === player.id;
                            const isBeingDragged = draggedPlayer?.id === player.id;
                            const isTarget = dragOverPlayerId === player.id;
                            const isAvailable = !player.isInjured && !player.isSuspended;

                            return (
                                <div
                                    key={player.id}
                                    draggable={isAvailable}
                                    onDragStart={(e) => onDragStart(e, player, 'uncalled')}
                                    onDragEnd={onDragEnd}
                                    onDragOver={(e) => {
                                        if (!isAvailable) return;
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                        onDragOverPlayer(e, player.id);
                                    }}
                                    onDragLeave={onDragLeavePlayer}
                                    onDrop={(e) => onDropOnPlayer(e, player)}
                                    onClick={() => onPlayerClick(player)}
                                    className={`group p-2 rounded-xl border flex items-center justify-between gap-3 transition-all select-none ${
                                        isAvailable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                                    } ${
                                        isBeingDragged
                                            ? 'opacity-40 scale-95'
                                            : isTarget
                                            ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/50 scale-[1.02]'
                                            : isSelected 
                                            ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/40' 
                                            : 'bg-black/20 hover:bg-white/5 border-white/5 hover:border-white/15'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {isAvailable && (
                                            <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
                                        )}
                                        <PlayerPhoto 
                                            player={player} 
                                            className="w-7 h-7 rounded-full border border-white/10 object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all pointer-events-none" 
                                        />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${getPositionBadgeColor(getPlayerPosition(player))}`}>
                                                    {getPlayerPosition(player)}
                                                </span>
                                                <span className="text-xs font-bold text-slate-300 group-hover:text-white truncate">
                                                    {player.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px]">
                                                {player.isInjured ? (
                                                    <span className="text-rose-400 font-black flex items-center gap-1">
                                                        🚑 Lesionado
                                                    </span>
                                                ) : player.isSuspended ? (
                                                    <span className="text-amber-400 font-black flex items-center gap-1">
                                                        🟥 Sancionado
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500 font-medium">
                                                        Decisión Técnica • Físico: {Math.round(player.condition ?? 100)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs font-black text-slate-400">
                                            {player.rating}
                                        </span>
                                        {isAvailable && (
                                            <button
                                                onClick={(e) => onStartSwap(e, player)}
                                                className="p-1 rounded-md bg-white/5 hover:bg-[var(--apex-gold)] text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
                                                title="Convocar / Poner de titular"
                                            >
                                                <ArrowLeftRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
});
