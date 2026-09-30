import React, { useState, useMemo } from 'react';
import { GameState, Player, Coach } from '../../../types';
import { GameAction } from '../../../state/reducer';
import { PlayerPhoto } from '../../../data/teams/helpers';
import { getPlayerAge } from '../../../utils/playerUtils';
import { 
    Users, 
    Shield, 
    Sparkles, 
    AlertTriangle, 
    RefreshCw, 
    ArrowLeftRight, 
    Eye, 
    Zap, 
    Activity, 
    Layers, 
    CheckCircle2, 
    X,
    Flame,
    GripVertical,
    Move
} from 'lucide-react';

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
    x: number; // percentage 0 - 100
    y: number; // percentage 0 - 100 (top 15% is forwards, bottom 88% is goalkeeper)
}

/**
 * Determina la posición real del jugador con auto-sincronización defensiva
 * para partidas guardadas previamente.
 */
export function getPlayerPosition(player: Player): Player['position'] {
    if (!player) return 'CEN';
    const norm = (player.name || '').toLowerCase();
    // Jugadores de Boca / liga argentina históricamente mediocampistas que pudieron guardarse erróneamente como DEF en saves antiguos
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

/**
 * Penalización de media por fuera de posición
 * Al colocar jugadores fuera de su zona natural (ej. un delantero en el mediocampo), su media desciende notablemente.
 */
export function getPositionPenalty(playerPos: Player['position'], slotPos: Player['position']): number {
    if (playerPos === slotPos) return 0;
    // Portero en el campo o jugador de campo al arco: penalización extrema
    if (playerPos === 'POR' || slotPos === 'POR') return 35;
    // Delantero jugando de Defensa o viceversa
    if ((playerPos === 'DEL' && slotPos === 'DEF') || (playerPos === 'DEF' && slotPos === 'DEL')) return 16;
    // Delantero en el Mediocampo (desciende notablemente: -10 puntos de media)
    if (playerPos === 'DEL' && slotPos === 'CEN') return 10;
    // Mediocampista jugando de Delantero
    if (playerPos === 'CEN' && slotPos === 'DEL') return 8;
    // Mediocampista jugando de Defensor
    if (playerPos === 'CEN' && slotPos === 'DEF') return 8;
    // Defensor jugando en el Mediocampo
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

// Helper to compute optimal 11 unique starters without any duplicates
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

    // Fallback if squad < 11 players available
    if (pickedIds.length < slots.length) {
        const allSquadRemaining = squad.filter(p => !pickedIds.includes(p.id));
        for (const p of allSquadRemaining) {
            if (pickedIds.length >= slots.length) break;
            pickedIds.push(p.id);
        }
    }

    return pickedIds;
};

export const TacticalLineupView: React.FC<TacticalLineupViewProps> = ({ gameState, dispatch }) => {
    const coach = gameState.team.coach;
    const defaultFormation: FormationKey = (coach?.preferredFormation as FormationKey) || '4-4-2';

    const [selectedFormation, setSelectedFormation] = useState<FormationKey>(defaultFormation);
    const [pitchTheme, setPitchTheme] = useState<PitchTheme>('simple-svg');
    const [selectedPlayerForSwap, setSelectedPlayerForSwap] = useState<Player | null>(null);

    // Starting 11 IDs: strictly unique list matching slot positions
    const [starterIds, setStarterIds] = useState<number[]>(() => {
        return computeDefaultStarters(gameState.team.squad, defaultFormation);
    });
    const [hasCustomEdits, setHasCustomEdits] = useState<boolean>(false);

    // Drag & Drop State
    const [draggedPlayer, setDraggedPlayer] = useState<{ id: number; source: 'starter' | 'sub' | 'uncalled'; slotIndex?: number } | null>(null);
    const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);
    const [dragOverPlayerId, setDragOverPlayerId] = useState<number | null>(null);
    const [isDragOverBenchZone, setIsDragOverBenchZone] = useState<boolean>(false);

    // 1. Calculate Starting 11, Bench and Reserves with strict ZERO DUPLICATE guarantee
    const slots = FORMATION_SLOTS[selectedFormation] || FORMATION_SLOTS['4-4-2'];

    const squadDistribution = useMemo(() => {
        const squad = gameState.team.squad;
        const squadMap = new Map(squad.map(p => [p.id, p]));

        // Ensure starterIds has no duplicates and contains only valid squad players
        const uniqueStarterIds: number[] = [];
        const seenIds = new Set<number>();

        for (const id of starterIds) {
            if (squadMap.has(id) && !seenIds.has(id)) {
                seenIds.add(id);
                uniqueStarterIds.push(id);
            }
        }

        // Fill remaining slots if any slot is missing or was dropped
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

        const starters = uniqueStarterIds
            .map(id => squadMap.get(id))
            .filter((p): p is Player => !!p);

        // Substitutes: available squad players not in starting 11 (up to 9)
        const availableSubstitutes = squad
            .filter(p => !seenIds.has(p.id) && !p.isInjured && !p.isSuspended)
            .sort((a, b) => {
                const effA = a.rating * ((a.condition ?? 100) / 100);
                const effB = b.rating * ((b.condition ?? 100) / 100);
                return effB - effA;
            });

        const substitutes = availableSubstitutes.slice(0, 9);
        const subSet = new Set(substitutes.map(p => p.id));

        // Uncalled: remaining squad (injured, suspended, or extra reserves)
        const uncalled = squad
            .filter(p => !seenIds.has(p.id) && !subSet.has(p.id))
            .sort((a, b) => b.rating - a.rating);

        return {
            starters,
            substitutes,
            uncalled
        };
    }, [gameState.team.squad, starterIds, slots]);

    const { starters, substitutes, uncalled } = squadDistribution;

    // Tactical stats of the starting 11 (computed using real EFFECTIVE ratings based on slot assignment)
    const xiMetrics = useMemo(() => {
        if (starters.length === 0) return { avgRating: 0, avgAge: 0, attack: 0, midfield: 0, defense: 0 };
        
        const effectiveRatings = starters.map((p, idx) => {
            const slotPos = slots[idx]?.positionType || p.position;
            return getEffectivePlayerRating(p, slotPos);
        });

        const totalRating = effectiveRatings.reduce((acc, r) => acc + r, 0);
        const totalAge = starters.reduce((acc, p) => acc + (p.age || 25), 0);

        const defRatings: number[] = [];
        const midRatings: number[] = [];
        const attRatings: number[] = [];

        slots.forEach((slot, idx) => {
            const effR = effectiveRatings[idx];
            if (slot.positionType === 'POR' || slot.positionType === 'DEF') defRatings.push(effR);
            else if (slot.positionType === 'CEN') midRatings.push(effR);
            else if (slot.positionType === 'DEL') attRatings.push(effR);
        });

        const attack = attRatings.length ? Math.round(attRatings.reduce((a, b) => a + b, 0) / attRatings.length) : 70;
        const midfield = midRatings.length ? Math.round(midRatings.reduce((a, b) => a + b, 0) / midRatings.length) : 70;
        const defense = defRatings.length ? Math.round(defRatings.reduce((a, b) => a + b, 0) / defRatings.length) : 70;

        return {
            avgRating: Math.round((totalRating / starters.length) * 10) / 10,
            avgAge: Math.round((totalAge / starters.length) * 10) / 10,
            attack,
            midfield,
            defense
        };
    }, [starters, slots]);

    const executeSwap = (playerAId: number, playerBId: number) => {
        if (playerAId === playerBId) return;

        setStarterIds(prev => {
            const next = [...prev];
            const idxA = next.indexOf(playerAId);
            const idxB = next.indexOf(playerBId);

            if (idxA > -1 && idxB > -1) {
                // Swapping two starters
                next[idxA] = playerBId;
                next[idxB] = playerAId;
            } else if (idxA > -1 && idxB === -1) {
                // Player A is a starter, Player B is a sub/reserve -> Player B replaces Player A
                next[idxA] = playerBId;
            } else if (idxA === -1 && idxB > -1) {
                // Player B is a starter, Player A is a sub/reserve -> Player A replaces Player B
                next[idxB] = playerAId;
            }

            // Deduplication safety guard: guarantees array has 0 duplicate IDs
            const uniqueSet = new Set<number>();
            const sanitized: number[] = [];
            for (const id of next) {
                if (!uniqueSet.has(id)) {
                    uniqueSet.add(id);
                    sanitized.push(id);
                }
            }
            return sanitized;
        });

        setHasCustomEdits(true);
        setSelectedPlayerForSwap(null);
    };

    const handleDragStart = (e: React.DragEvent, player: Player, source: 'starter' | 'sub' | 'uncalled', slotIndex?: number) => {
        setDraggedPlayer({ id: player.id, source, slotIndex });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', player.id.toString());
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
        if (!targetPlayer) return;
        if (targetPlayer.id === draggedPlayer.id) return;

        executeSwap(draggedPlayer.id, targetPlayer.id);
        setDraggedPlayer(null);
    };

    const handleDropOnPlayer = (e: React.DragEvent, targetPlayer: Player) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverPlayerId(null);
        if (!draggedPlayer) return;
        if (targetPlayer.id === draggedPlayer.id) return;

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
                // Deselect
                setSelectedPlayerForSwap(null);
                return;
            }

            executeSwap(selectedPlayerForSwap.id, player.id);
        } else {
            // Open modal to view player details
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

    return (
        <div className="space-y-5 animate-fade-in">
            {/* 🌟 BARRA SUPERIOR DE CONTROL TÁCTICO */}
            <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Info del DT */}
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-black rounded-2xl border border-[var(--apex-gold)]/40 flex items-center justify-center shadow-lg shrink-0">
                        <Users className="w-6 h-6 text-[var(--apex-gold)]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-[var(--apex-gold)] tracking-widest">
                                Dirección Técnica
                            </span>
                            {selectedFormation === defaultFormation ? (
                                <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Esquema Preferido del DT
                                </span>
                            ) : (
                                <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                                    Ajuste Personalizado
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">
                            {coach?.name || 'Director Técnico'}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="font-bold text-[var(--apex-gold)]">{coach?.style || 'Equilibrado'}</span>
                            <span>•</span>
                            <span className="text-white/70">Esquema Base: {coach?.preferredFormation || '4-4-2'}</span>
                        </div>
                    </div>
                </div>

                {/* Selectores de Formación, Césped y Reseteo */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full lg:w-auto">
                    {/* Selector de Esquema */}
                    <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 px-2.5 py-1.5 rounded-xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Esquema:</span>
                        <select
                            value={selectedFormation}
                            onChange={(e) => handleFormationChange(e.target.value as FormationKey)}
                            className="bg-transparent text-white font-black text-xs uppercase tracking-wider focus:outline-none cursor-pointer w-full"
                        >
                            {(Object.keys(FORMATION_SLOTS) as FormationKey[]).map(form => (
                                <option key={form} value={form} className="bg-[#0E131F] text-white">
                                    {form} {form === defaultFormation ? '⭐ (DT)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Estilo de Cancha */}
                    <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 px-2.5 py-1.5 rounded-xl">
                        <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <select
                            value={pitchTheme}
                            onChange={(e) => setPitchTheme(e.target.value as PitchTheme)}
                            className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer w-full"
                            title="Seleccionar visual del terreno de juego"
                        >
                            <option value="simple-svg" className="bg-[#0E131F] text-white">Césped SVG</option>
                            <option value="coach-table-svg" className="bg-[#0E131F] text-white">Pizarra SVG</option>
                            <option value="emerald-turf" className="bg-[#0E131F] text-white">Dark Turf</option>
                        </select>
                    </div>

                    {/* Botón Restaurar al Once Original */}
                    {(hasCustomEdits || selectedFormation !== defaultFormation) && (
                        <button
                            onClick={handleResetToCoachXI}
                            className="col-span-2 sm:col-span-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Restaurar el once inicial sugerido por el DT"
                        >
                            <RefreshCw className="w-3 h-3 text-[var(--apex-gold)]" />
                            <span>Restaurar Once</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Aviso de Modo Intercambio si hay un jugador seleccionado */}
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

            {/* ⚽ CONTENEDOR PRINCIPAL: TERRENO DE JUEGO (IZQ) + BANCO Y RESERVAS (DER) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* 🏟️ COLUMNA 1: EL TERRENO DE JUEGO (7 COLUMNAS EN DESKTOP) */}
                <div className="lg:col-span-7 flex flex-col items-center">
                    {/* Tarjeta de Métricas Rápidas del XI Titular */}
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

                    {/* El Campo de Fútbol con Aspecto Proporcional */}
                    <div 
                        className="relative w-full max-w-[500px] aspect-[2160/3270] rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl select-none bg-[#0a521e]"
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        {/* 1. Fondo de Terreno de Juego según Tema Elegido */}
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
                            /* Tema Emerald Turf Puro (CSS con franjas de corte de césped) */
                            <div className="absolute inset-0 bg-[#0A2613] overflow-hidden">
                                {/* Franjas de corte alternadas */}
                                <div className="absolute inset-0 flex flex-col">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`flex-1 ${i % 2 === 0 ? 'bg-[#0D2E17]' : 'bg-[#092211]'}`} 
                                        />
                                    ))}
                                </div>
                                {/* Líneas de campo vectoriales trazadas en SVG */}
                                <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full stroke-white/40 fill-none stroke-[0.7] pointer-events-none">
                                    <rect x="5" y="5" width="90" height="140" rx="1" />
                                    <line x1="5" y1="75" x2="95" y2="75" />
                                    <circle cx="50" cy="75" r="14" />
                                    <circle cx="50" cy="75" r="0.8" className="fill-white/60" />
                                    {/* Área rival (arriba) */}
                                    <rect x="25" y="5" width="50" height="24" />
                                    <rect x="36" y="5" width="28" height="9" />
                                    <circle cx="50" cy="18" r="0.8" className="fill-white/60" />
                                    <path d="M 38 29 A 12 12 0 0 0 62 29" />
                                    {/* Área propia (abajo) */}
                                    <rect x="25" y="121" width="50" height="24" />
                                    <rect x="36" y="136" width="28" height="9" />
                                    <circle cx="50" cy="132" r="0.8" className="fill-white/60" />
                                    <path d="M 38 121 A 12 12 0 0 1 62 121" />
                                </svg>
                            </div>
                        )}

                        {/* Viñeta e iluminación ambiental del campo */}
                        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/10 to-black/60 pointer-events-none" />

                        {/* Indicador de sentido de ataque (flecha sutil hacia arriba) */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/50 bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">
                            <span>Ataque</span>
                            <span>▲</span>
                        </div>

                        {/* Indicador sutil de Drag & Drop */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-1 text-[8px] font-bold text-white/60 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                            <Move className="w-2.5 h-2.5 text-[var(--apex-gold)]" />
                            <span>Arrastra y suelta futbolistas para cambiar puestos</span>
                        </div>

                        {/* ⚽ 11 JUGADORES TITULARES POSICIONADOS TÁCTICAMENTE */}
                        {slots.map((slot, index) => {
                            const player = starters[index];
                            if (!player) return null;

                            const playerPos = getPlayerPosition(player);
                            const penalty = getPositionPenalty(playerPos, slot.positionType);
                            const effRating = getEffectivePlayerRating(player, slot.positionType);
                            const isOutOfPosition = penalty > 0;
                            const isSelected = selectedPlayerForSwap?.id === player.id;
                            const isBeingDragged = draggedPlayer?.id === player.id;
                            const isTargetOfDrag = dragOverSlotIndex === index;

                            return (
                                <div
                                    key={slot.id}
                                    style={{
                                        position: 'absolute',
                                        left: `${slot.x}%`,
                                        top: `${slot.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                    draggable={!player.isInjured && !player.isSuspended}
                                    onDragStart={(e) => handleDragStart(e, player, 'starter', index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                        setDragOverSlotIndex(index);
                                    }}
                                    onDragLeave={() => setDragOverSlotIndex(null)}
                                    onDrop={(e) => handleDropOnSlot(e, index)}
                                    onClick={() => handlePlayerClick(player)}
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
                                    {/* Contenedor del avatar con insignia táctica */}
                                    <div className="relative">
                                        {/* Avatar / Foto del Jugador */}
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

                                        {/* Insignia de Media Efectiva */}
                                        <div className={`absolute -top-1 -right-1.5 px-1.2 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black border shadow-md flex items-center gap-0.5 ${getRatingColor(effRating, penalty)}`}>
                                            <span>{effRating}</span>
                                        </div>

                                        {/* Alerta si está fuera de posición con penalización visible */}
                                        {isOutOfPosition && (
                                            <div 
                                                className="absolute -top-1.5 -left-1.5 px-1 py-0.2 bg-rose-600 border border-white/50 text-white rounded-full flex items-center justify-center text-[7.5px] font-black shadow-lg animate-bounce"
                                                title={`⚠️ Fuera de posición: ${playerPos} ubicado como ${slot.positionType}. Penalización: -${penalty} MEDIA (Base: ${player.rating} → Efectiva: ${effRating})`}
                                            >
                                                <span>-{penalty}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Etiqueta única y unificada: Rol + Apellido */}
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

                                    {/* Indicador de arrastre sutil al pasar el cursor */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 flex items-center gap-0.5 px-1.5 py-0.2 bg-black/70 text-slate-300 font-bold text-[7.5px] uppercase tracking-wider rounded-full border border-white/10 shadow pointer-events-none">
                                        <Move className="w-2 h-2 text-[var(--apex-gold)]" />
                                        <span>Arrastrar</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 📋 COLUMNA 2: BANQUILLO Y NO CONVOCADOS (5 COLUMNAS EN DESKTOP) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* 🪑 BANCO DE SUPLENTES (ÁREA DE SOLTADO DRAG & DROP) */}
                    <div 
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            setIsDragOverBenchZone(true);
                        }}
                        onDragLeave={() => setIsDragOverBenchZone(false)}
                        onDrop={handleDropOnBenchZone}
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
                                            onDragStart={(e) => handleDragStart(e, player, 'sub')}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = 'move';
                                                setDragOverPlayerId(player.id);
                                            }}
                                            onDragLeave={() => setDragOverPlayerId(null)}
                                            onDrop={(e) => handleDropOnPlayer(e, player)}
                                            onClick={() => handlePlayerClick(player)}
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
                                                        <span className="text-emerald-400 font-bold">{player.condition ?? 100}% Físico</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className={`px-2 py-0.5 rounded text-xs font-black border ${getRatingColor(player.rating)}`}>
                                                    {player.rating}
                                                </div>
                                                <button
                                                    onClick={(e) => handleStartSwap(e, player)}
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

                    {/* 🚫 NO CONVOCADOS / RESERVAS */}
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
                                            onDragStart={(e) => handleDragStart(e, player, 'uncalled')}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => {
                                                if (!isAvailable) return;
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = 'move';
                                                setDragOverPlayerId(player.id);
                                            }}
                                            onDragLeave={() => setDragOverPlayerId(null)}
                                            onDrop={(e) => handleDropOnPlayer(e, player)}
                                            onClick={() => handlePlayerClick(player)}
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
                                                                Decisión Técnica • Físico: {player.condition ?? 100}%
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
                                                        onClick={(e) => handleStartSwap(e, player)}
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
            </div>
        </div>
    );
};
