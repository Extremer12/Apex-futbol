import React, { useState, useMemo } from 'react';
import { GameState, Player } from '../../../types';
import { GameAction } from '../../../state/reducer';
import { getPlayerAge } from '../../../utils/playerUtils';
import { ArrowLeftRight } from 'lucide-react';
import { TacticsControlsBar } from './tactics/TacticsControlsBar';
import { PitchBoard } from './tactics/PitchBoard';
import { BenchSquadList } from './tactics/BenchSquadList';

interface TacticalLineupViewProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export type FormationKey = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '5-3-2' | '4-1-4-1' | '3-4-3';
export type PitchTheme = 'simple-svg' | 'coach-table-svg' | 'emerald-turf';

export interface FormationSlot {
    id: string;
    role: string;
    positionType: Player['position'];
    x: number;
    y: number;
}

export function getPlayerPosition(player: Player): Player['position'] {
    if (!player) return 'CEN';
    const norm = (player.name || '').toLowerCase();
    if (
        player.id === 70115 || 
        player.id === 30405 || 
        norm.includes('paredes') || 
        norm.includes('battaglia') || 
        norm.includes('belmonte') || 
        norm.includes('alarcon') || 
        norm.includes('alarcón') || 
        norm.includes('delgado') || 
        norm.includes('domenech') || 
        norm.includes('ascacibar') || 
        (norm.includes('ramirez') && (player.id === 70114 || player.rating === 76))
    ) {
        if (player.position === 'DEF') {
            return 'CEN';
        }
    }
    return player.position;
}

export function getPositionPenalty(playerPos: Player['position'], slotPos: Player['position']): number {
    if (playerPos === slotPos) return 0;
    if (playerPos === 'POR' || slotPos === 'POR') return 35;
    if ((playerPos === 'DEL' && slotPos === 'DEF') || (playerPos === 'DEF' && slotPos === 'DEL')) return 16;
    if (playerPos === 'DEL' && slotPos === 'CEN') return 10;
    if (playerPos === 'CEN' && slotPos === 'DEL') return 8;
    if (playerPos === 'CEN' && slotPos === 'DEF') return 8;
    if (playerPos === 'DEF' && slotPos === 'CEN') return 8;
    return 10;
}

export function getEffectivePlayerRating(player: Player, slotPos: Player['position']): number {
    const actualPos = getPlayerPosition(player);
    const penalty = getPositionPenalty(actualPos, slotPos);
    return Math.max(30, player.rating - penalty);
}

export const FORMATION_SLOTS: Record<FormationKey, FormationSlot[]> = {
    '4-3-3': [
        { id: 'por', role: 'POR', positionType: 'POR', x: 50, y: 86 },
        { id: 'li', role: 'LI', positionType: 'DEF', x: 18, y: 70 },
        { id: 'dci', role: 'DCI', positionType: 'DEF', x: 38, y: 73 },
        { id: 'dcd', role: 'DCD', positionType: 'DEF', x: 62, y: 73 },
        { id: 'ld', role: 'LD', positionType: 'DEF', x: 82, y: 70 },
        { id: 'mcd', role: 'MCD', positionType: 'CEN', x: 50, y: 55 },
        { id: 'mci', role: 'MC', positionType: 'CEN', x: 32, y: 44 },
        { id: 'mcd_der', role: 'MC', positionType: 'CEN', x: 68, y: 44 },
        { id: 'ei', role: 'EI', positionType: 'DEL', x: 22, y: 22 },
        { id: 'dc', role: 'DC', positionType: 'DEL', x: 50, y: 17 },
        { id: 'ed', role: 'ED', positionType: 'DEL', x: 78, y: 22 },
    ],
    '4-4-2': [
        { id: 'por', role: 'POR', positionType: 'POR', x: 50, y: 86 },
        { id: 'li', role: 'LI', positionType: 'DEF', x: 18, y: 71 },
        { id: 'dci', role: 'DCI', positionType: 'DEF', x: 38, y: 73 },
        { id: 'dcd', role: 'DCD', positionType: 'DEF', x: 62, y: 73 },
        { id: 'ld', role: 'LD', positionType: 'DEF', x: 82, y: 71 },
        { id: 'mi', role: 'MI', positionType: 'CEN', x: 18, y: 46 },
        { id: 'mci', role: 'MC', positionType: 'CEN', x: 39, y: 49 },
        { id: 'mcd', role: 'MC', positionType: 'CEN', x: 61, y: 49 },
        { id: 'md', role: 'MD', positionType: 'CEN', x: 82, y: 46 },
        { id: 'dc1', role: 'DC', positionType: 'DEL', x: 37, y: 20 },
        { id: 'dc2', role: 'DC', positionType: 'DEL', x: 63, y: 20 },
    ],
    '4-2-3-1': [
        { id: 'por', role: 'POR', positionType: 'POR', x: 50, y: 86 },
        { id: 'li', role: 'LI', positionType: 'DEF', x: 18, y: 72 },
        { id: 'dci', role: 'DCI', positionType: 'DEF', x: 38, y: 74 },
        { id: 'dcd', role: 'DCD', positionType: 'DEF', x: 62, y: 74 },
        { id: 'ld', role: 'LD', positionType: 'DEF', x: 82, y: 72 },
        { id: 'mcd1', role: 'MCD', positionType: 'CEN', x: 36, y: 57 },
        { id: 'mcd2', role: 'MCD', positionType: 'CEN', x: 64, y: 57 },
        { id: 'mi', role: 'MI', positionType: 'CEN', x: 20, y: 38 },
        { id: 'mco', role: 'MCO', positionType: 'CEN', x: 50, y: 35 },
        { id: 'md', role: 'MD', positionType: 'CEN', x: 80, y: 38 },
        { id: 'dc', role: 'DC', positionType: 'DEL', x: 50, y: 17 },
    ],
    '3-5-2': [
        { id: 'por', role: 'POR', positionType: 'POR', x: 50, y: 86 },
        { id: 'dci', role: 'DFC', positionType: 'DEF', x: 28, y: 72 },
        { id: 'dfc', role: 'DFC', positionType: 'DEF', x: 50, y: 74 },
        { id: 'dcd', role: 'DFC', positionType: 'DEF', x: 72, y: 72 },
        { id: 'cai', role: 'CAI', positionType: 'CEN', x: 18, y: 48 },
        { id: 'mcd', role: 'MCD', positionType: 'CEN', x: 50, y: 56 },
        { id: 'mci', role: 'MC', positionType: 'CEN', x: 35, y: 46 },
        { id: 'mcd_der', role: 'MC', positionType: 'CEN', x: 65, y: 46 },
        { id: 'cad', role: 'CAD', positionType: 'CEN', x: 82, y: 48 },
        { id: 'dc1', role: 'DC', positionType: 'DEL', x: 37, y: 20 },
        { id: 'dc2', role: 'DC', positionType: 'DEL', x: 63, y: 20 },
    ],
    '5-3-2': [
        { id: 'por', role: 'POR', positionType: 'POR', x: 50, y: 86 },
        { id: 'li', role: 'LI', positionType: 'DEF', x: 17, y: 67 },
        { id: 'dci', role: 'DFC', positionType: 'DEF', x: 33, y: 73 },
        { id: 'dfc', role: 'DFC', positionType: 'DEF', x: 50, y: 75 },
        { id: 'dcd', role: 'DFC', positionType: 'DEF', x: 67, y: 73 },
        { id: 'ld', role: 'LD', positionType: 'DEF', x: 83, y: 67 },
        { id: 'mci', role: 'MC', positionType: 'CEN', x: 32, y: 48 },
        { id: 'mcd', role: 'MCD', positionType: 'CEN', x: 50, y: 53 },
        { id: 'mcd_der', role: 'MC', positionType: 'CEN', x: 68, y: 48 },
        { id: 'dc1', role: 'DC', positionType: 'DEL', x: 37, y: 20 },
        { id: 'dc2', role: 'DC', positionType: 'DEL', x: 63, y: 20 },
    ],
    '4-1-4-1': [
        { id: 'por', role: 'POR', positionType: 'POR', x: 50, y: 86 },
        { id: 'li', role: 'LI', positionType: 'DEF', x: 18, y: 71 },
        { id: 'dci', role: 'DCI', positionType: 'DEF', x: 38, y: 73 },
        { id: 'dcd', role: 'DCD', positionType: 'DEF', x: 62, y: 73 },
        { id: 'ld', role: 'LD', positionType: 'DEF', x: 82, y: 71 },
        { id: 'mcd', role: 'MCD', positionType: 'CEN', x: 50, y: 57 },
        { id: 'mi', role: 'MI', positionType: 'CEN', x: 18, y: 41 },
        { id: 'mci', role: 'MC', positionType: 'CEN', x: 39, y: 43 },
        { id: 'mcd_der', role: 'MC', positionType: 'CEN', x: 61, y: 43 },
        { id: 'md', role: 'MD', positionType: 'CEN', x: 82, y: 41 },
        { id: 'dc', role: 'DC', positionType: 'DEL', x: 50, y: 18 },
    ],
    '3-4-3': [
        { id: 'por', role: 'POR', positionType: 'POR', x: 50, y: 86 },
        { id: 'dci', role: 'DFC', positionType: 'DEF', x: 28, y: 72 },
        { id: 'dfc', role: 'DFC', positionType: 'DEF', x: 50, y: 74 },
        { id: 'dcd', role: 'DFC', positionType: 'DEF', x: 72, y: 72 },
        { id: 'mi', role: 'MI', positionType: 'CEN', x: 18, y: 48 },
        { id: 'mc1', role: 'MC', positionType: 'CEN', x: 39, y: 50 },
        { id: 'mc2', role: 'MC', positionType: 'CEN', x: 61, y: 50 },
        { id: 'md', role: 'MD', positionType: 'CEN', x: 82, y: 48 },
        { id: 'ei', role: 'EI', positionType: 'DEL', x: 22, y: 22 },
        { id: 'dc', role: 'DC', positionType: 'DEL', x: 50, y: 17 },
        { id: 'ed', role: 'ED', positionType: 'DEL', x: 78, y: 22 },
    ]
};

const computeDefaultStarters = (squad: Player[], formation: FormationKey): number[] => {
    const slots = FORMATION_SLOTS[formation] || FORMATION_SLOTS['4-4-2'];
    const availablePool = squad.filter(p => !p.isInjured && !p.isSuspended);
    const getEffectiveRating = (p: Player) => p.rating * ((p.condition ?? 100) / 100);

    const remaining = [...availablePool];
    const pickedIds: number[] = [];

    slots.forEach(slot => {
        const matching = remaining
            .filter(p => getPlayerPosition(p) === slot.positionType)
            .sort((a, b) => getEffectiveRating(b) - getEffectiveRating(a));

        if (matching.length > 0) {
            const picked = matching[0];
            pickedIds.push(picked.id);
            const idx = remaining.findIndex(p => p.id === picked.id);
            if (idx > -1) remaining.splice(idx, 1);
        } else {
            remaining.sort((a, b) => getEffectiveRating(b) - getEffectiveRating(a));
            if (remaining.length > 0) {
                const picked = remaining[0];
                pickedIds.push(picked.id);
                remaining.splice(0, 1);
            }
        }
    });

    if (pickedIds.length < slots.length) {
        const allSquadRemaining = squad.filter(p => !pickedIds.includes(p.id));
        for (const p of allSquadRemaining) {
            if (pickedIds.length >= slots.length) break;
            pickedIds.push(p.id);
        }
    }

    return pickedIds;
};

export const TacticalLineupView: React.FC<TacticalLineupViewProps> = React.memo(({ gameState, dispatch }) => {
    const coach = gameState.team.coach;
    const defaultFormation: FormationKey = (coach?.preferredFormation as FormationKey) || '4-4-2';

    const [selectedFormation, setSelectedFormation] = useState<FormationKey>(defaultFormation);
    const [pitchTheme, setPitchTheme] = useState<PitchTheme>('simple-svg');
    const [selectedPlayerForSwap, setSelectedPlayerForSwap] = useState<Player | null>(null);

    const [starterIds, setStarterIds] = useState<number[]>(() => {
        return computeDefaultStarters(gameState.team.squad, defaultFormation);
    });
    const [hasCustomEdits, setHasCustomEdits] = useState<boolean>(false);

    // Drag & Drop State
    const [draggedPlayer, setDraggedPlayer] = useState<{ id: number; source: 'starter' | 'sub' | 'uncalled'; slotIndex?: number } | null>(null);
    const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);
    const [dragOverPlayerId, setDragOverPlayerId] = useState<number | null>(null);
    const [isDragOverBenchZone, setIsDragOverBenchZone] = useState<boolean>(false);

    const slots = FORMATION_SLOTS[selectedFormation] || FORMATION_SLOTS['4-4-2'];

    const squadDistribution = useMemo(() => {
        const squad = gameState.team.squad;
        const squadMap = new Map(squad.map(p => [p.id, p]));

        const uniqueStarterIds: number[] = [];
        const seenIds = new Set<number>();

        for (const id of starterIds) {
            if (squadMap.has(id) && !seenIds.has(id)) {
                seenIds.add(id);
                uniqueStarterIds.push(id);
            }
        }

        if (uniqueStarterIds.length < slots.length) {
            const fillers = squad
                .filter(p => !seenIds.has(p.id) && !p.isInjured && !p.isSuspended)
                .sort((a, b) => b.rating - a.rating);
            
            for (const filler of fillers) {
                if (uniqueStarterIds.length >= slots.length) break;
                uniqueStarterIds.push(filler.id);
                seenIds.add(filler.id);
            }
        }

        const starters: Player[] = uniqueStarterIds
            .map(id => squadMap.get(id))
            .filter(Boolean) as Player[];

        const remainingSquad = squad.filter(p => !seenIds.has(p.id));

        const availableBenchCandidates = remainingSquad
            .filter(p => !p.isInjured && !p.isSuspended)
            .sort((a, b) => b.rating - a.rating);

        const substitutes: Player[] = availableBenchCandidates.slice(0, 12);
        const subIds = new Set(substitutes.map(p => p.id));

        const uncalled: Player[] = remainingSquad.filter(p => !subIds.has(p.id));

        return {
            starters,
            substitutes,
            uncalled,
            uniqueStarterIds
        };
    }, [gameState.team.squad, starterIds, slots.length]);

    const { starters, substitutes, uncalled } = squadDistribution;

    const xiMetrics = useMemo(() => {
        if (starters.length === 0) return { attack: 0, midfield: 0, defense: 0, avgRating: 0, avgAge: 0 };
        
        let atkSum = 0, atkCount = 0;
        let midSum = 0, midCount = 0;
        let defSum = 0, defCount = 0;
        let totalRating = 0;
        let totalAge = 0;

        starters.forEach((player, idx) => {
            const slot = slots[idx];
            const effRating = slot ? getEffectivePlayerRating(player, slot.positionType) : player.rating;
            const slotPos = slot ? slot.positionType : player.position;

            totalRating += effRating;
            totalAge += getPlayerAge(player);

            if (slotPos === 'DEL') {
                atkSum += effRating;
                atkCount++;
            } else if (slotPos === 'CEN') {
                midSum += effRating;
                midCount++;
            } else {
                defSum += effRating;
                defCount++;
            }
        });

        return {
            attack: atkCount > 0 ? Math.round(atkSum / atkCount) : 70,
            midfield: midCount > 0 ? Math.round(midSum / midCount) : 70,
            defense: defCount > 0 ? Math.round(defSum / defCount) : 70,
            avgRating: Math.round(totalRating / starters.length),
            avgAge: Math.round(totalAge / starters.length)
        };
    }, [starters, slots]);

    const executeSwap = (playerAId: number, playerBId: number) => {
        if (playerAId === playerBId) return;

        setStarterIds(prevStarterIds => {
            const currentIds = [...prevStarterIds];
            const idxA = currentIds.indexOf(playerAId);
            const idxB = currentIds.indexOf(playerBId);

            if (idxA > -1 && idxB > -1) {
                currentIds[idxA] = playerBId;
                currentIds[idxB] = playerAId;
            } else if (idxA > -1) {
                currentIds[idxA] = playerBId;
            } else if (idxB > -1) {
                currentIds[idxB] = playerAId;
            }

            return currentIds;
        });

        setHasCustomEdits(true);
        setSelectedPlayerForSwap(null);
    };

    const handleDragStart = (e: React.DragEvent, player: Player, source: 'starter' | 'sub' | 'uncalled', slotIndex?: number) => {
        e.dataTransfer.setData('text/plain', player.id.toString());
        e.dataTransfer.effectAllowed = 'move';
        setDraggedPlayer({ id: player.id, source, slotIndex });
    };

    const handleDragEnd = () => {
        setDraggedPlayer(null);
        setDragOverSlotIndex(null);
        setDragOverPlayerId(null);
        setIsDragOverBenchZone(false);
    };

    const handleDropOnSlot = (e: React.DragEvent, targetSlotIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverSlotIndex(null);
        if (!draggedPlayer) return;

        const targetPlayer = starters[targetSlotIndex];
        if (!targetPlayer || targetPlayer.id === draggedPlayer.id) return;

        executeSwap(draggedPlayer.id, targetPlayer.id);
        setDraggedPlayer(null);
    };

    const handleDropOnPlayer = (e: React.DragEvent, targetPlayer: Player) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverPlayerId(null);
        if (!draggedPlayer || targetPlayer.id === draggedPlayer.id) return;

        executeSwap(draggedPlayer.id, targetPlayer.id);
        setDraggedPlayer(null);
    };

    const handleDropOnBenchZone = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverBenchZone(false);
        if (!draggedPlayer || draggedPlayer.source !== 'starter') return;

        const sub = substitutes[0];
        if (sub && sub.id !== draggedPlayer.id) {
            executeSwap(draggedPlayer.id, sub.id);
        }
        setDraggedPlayer(null);
    };

    const handlePlayerClick = (player: Player) => {
        if (selectedPlayerForSwap) {
            if (selectedPlayerForSwap.id === player.id) {
                setSelectedPlayerForSwap(null);
                return;
            }
            executeSwap(selectedPlayerForSwap.id, player.id);
        } else {
            dispatch({ type: 'SET_VIEWING_PLAYER', payload: player });
        }
    };

    const handleStartSwap = (e: React.MouseEvent, player: Player) => {
        e.stopPropagation();
        if (selectedPlayerForSwap?.id === player.id) {
            setSelectedPlayerForSwap(null);
        } else {
            setSelectedPlayerForSwap(player);
        }
    };

    const handleResetToCoachXI = () => {
        setSelectedPlayerForSwap(null);
        setSelectedFormation(defaultFormation);
        setStarterIds(computeDefaultStarters(gameState.team.squad, defaultFormation));
        setHasCustomEdits(false);
    };

    const handleFormationChange = (newFormation: FormationKey) => {
        setSelectedFormation(newFormation);
        setSelectedPlayerForSwap(null);
        setStarterIds(computeDefaultStarters(gameState.team.squad, newFormation));
        setHasCustomEdits(newFormation !== defaultFormation);
    };

    return (
        <div className="space-y-5 animate-fade-in">
            <TacticsControlsBar
                coach={coach}
                selectedFormation={selectedFormation}
                defaultFormation={defaultFormation}
                pitchTheme={pitchTheme}
                hasCustomEdits={hasCustomEdits}
                onFormationChange={handleFormationChange}
                onPitchThemeChange={setPitchTheme}
                onResetToCoachXI={handleResetToCoachXI}
            />

            {selectedPlayerForSwap && (
                <div className="bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-amber-200 animate-pulse">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <ArrowLeftRight className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="text-xs truncate">
                            <span className="font-black uppercase tracking-wide">Modo Intercambio Activo: </span>
                            <span>Selecciona otro futbolista del campo o del banquillo para intercambiar a </span>
                            <strong className="text-white font-black underline">{selectedPlayerForSwap.name} ({selectedPlayerForSwap.position})</strong>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedPlayerForSwap(null)}
                        className="px-2.5 py-1 bg-amber-500/30 hover:bg-amber-500/50 text-white rounded-lg text-xs font-black uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <PitchBoard
                    slots={slots}
                    starters={starters}
                    pitchTheme={pitchTheme}
                    xiMetrics={xiMetrics}
                    selectedPlayerForSwap={selectedPlayerForSwap}
                    draggedPlayer={draggedPlayer}
                    dragOverSlotIndex={dragOverSlotIndex}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOverSlot={(e, idx) => setDragOverSlotIndex(idx)}
                    onDragLeaveSlot={() => setDragOverSlotIndex(null)}
                    onDropOnSlot={handleDropOnSlot}
                    onPlayerClick={handlePlayerClick}
                />

                <BenchSquadList
                    substitutes={substitutes}
                    uncalled={uncalled}
                    selectedPlayerForSwap={selectedPlayerForSwap}
                    draggedPlayer={draggedPlayer}
                    dragOverPlayerId={dragOverPlayerId}
                    isDragOverBenchZone={isDragOverBenchZone}
                    onDragStart={(e, player, source) => handleDragStart(e, player, source)}
                    onDragEnd={handleDragEnd}
                    onDragOverPlayer={(e, id) => setDragOverPlayerId(id)}
                    onDragLeavePlayer={() => setDragOverPlayerId(null)}
                    onDropOnPlayer={handleDropOnPlayer}
                    onDragOverBenchZone={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setIsDragOverBenchZone(true);
                    }}
                    onDragLeaveBenchZone={() => setIsDragOverBenchZone(false)}
                    onDropOnBenchZone={handleDropOnBenchZone}
                    onPlayerClick={handlePlayerClick}
                    onStartSwap={handleStartSwap}
                />
            </div>
        </div>
    );
});
