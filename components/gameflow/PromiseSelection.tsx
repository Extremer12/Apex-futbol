import React, { useState, useMemo } from 'react';
import { Team, ElectoralPromise } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';
import { Trophy, TrendingUp, Sparkles, Landmark, Coins, Check, ShieldCheck } from 'lucide-react';

interface PromiseSelectionProps {
    team: Team;
    onSelectionComplete: (promises: ElectoralPromise[]) => void;
}

const getAvailablePromises = (team: Team): ElectoralPromise[] => {
    const isTopTier = team.tier === 'Top';
    const isMidTier = team.tier === 'Mid';

    return [
        {
            id: 'league_goal',
            description: isTopTier 
                ? 'Terminar en el Top 3 de la liga' 
                : isMidTier 
                    ? 'Terminar en la mitad superior (Top 8)' 
                    : 'Evitar el descenso y afianzarse (Top 14)',
            type: 'league_position',
            target: isTopTier ? 3 : isMidTier ? 8 : 14,
            deadline: 1,
            fulfilled: false,
            impact: 20
        },
        {
            id: 'win_trophy',
            description: isTopTier 
                ? 'Conquistar al menos un título oficial' 
                : 'Alcanzar una fase avanzada de copa',
            type: 'trophy',
            target: isTopTier ? 'Any' : 'QuarterFinal',
            deadline: 1,
            fulfilled: false,
            impact: 25
        },
        {
            id: 'star_signing',
            description: isTopTier 
                ? 'Fichar una estrella mundial (Media 85+)' 
                : 'Incorporar un refuerzo de calidad (Media 80+)',
            type: 'transfer',
            target: isTopTier ? 85 : 80,
            deadline: 1,
            fulfilled: false,
            impact: 15
        },
        {
            id: 'expand_stadium',
            description: 'Mejorar las instalaciones y estadio',
            type: 'stadium',
            target: 5000,
            deadline: 2,
            fulfilled: false,
            impact: 15
        },
        {
            id: 'financial_stability',
            description: 'Garantizar superávit y balance positivo',
            type: 'finances',
            target: 0,
            deadline: 1,
            fulfilled: false,
            impact: 10
        }
    ];
};

const getPromiseIcon = (type: string) => {
    switch (type) {
        case 'league_position':
            return <TrendingUp className="w-4 h-4 text-emerald-400" />;
        case 'trophy':
            return <Trophy className="w-4 h-4 text-[var(--apex-gold)]" />;
        case 'transfer':
            return <Sparkles className="w-4 h-4 text-sky-400" />;
        case 'stadium':
            return <Landmark className="w-4 h-4 text-purple-400" />;
        case 'finances':
            return <Coins className="w-4 h-4 text-amber-400" />;
        default:
            return <ShieldCheck className="w-4 h-4 text-white/70" />;
    }
};

const getPromiseCategoryLabel = (type: string) => {
    switch (type) {
        case 'league_position': return 'Objetivo Liga';
        case 'trophy': return 'Copas y Títulos';
        case 'transfer': return 'Fichajes';
        case 'stadium': return 'Infraestructura';
        case 'finances': return 'Economía';
        default: return 'Directiva';
    }
};

export const PromiseSelection: React.FC<PromiseSelectionProps> = ({ team, onSelectionComplete }) => {
    const promises = useMemo(() => getAvailablePromises(team), [team]);
    const [selectedIds, setSelectedIds] = useState<string[]>(['league_goal']);

    const togglePromise = (id: string) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= 3) {
                return prev;
            }
            return [...prev, id];
        });
    };

    const handleConfirm = () => {
        if (selectedIds.length === 0) return;
        const selectedPromises = promises.filter(p => selectedIds.includes(p.id));
        onSelectionComplete(selectedPromises);
    };

    return (
        <div className="h-screen max-h-screen w-full bg-[#080C14] text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden relative">
            {/* Background Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[var(--apex-gold)]/10 rounded-full blur-[110px]" />
                <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#080C14]/60 to-[#080C14]" />
            </div>

            {/* Container */}
            <div className="relative z-10 max-w-lg w-full mx-auto flex-1 flex flex-col justify-between">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 mb-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 shadow-lg flex items-center justify-center">
                        <TeamLogo team={team} className="w-full h-full object-contain" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 text-[10px] font-black uppercase tracking-widest text-[var(--apex-gold)] mb-1">
                        <span>{team.name}</span>
                        <span>•</span>
                        <span>Mandato 2026-2027</span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                        Compromisos Electorales
                    </h1>
                    <p className="text-[11px] text-white/50 max-w-xs mt-0.5 leading-tight">
                        Elige hasta <span className="text-white font-bold">3 promesas clave</span> para tu mandato. Cumplirlas aumentará tu aprobación popular.
                    </p>
                </div>

                {/* Counter Pill */}
                <div className="flex justify-between items-center px-1 my-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                        Selección de objetivos
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        selectedIds.length > 0 
                            ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/40 text-[var(--apex-gold)]' 
                            : 'bg-white/5 border-white/10 text-white/40'
                    }`}>
                        {selectedIds.length} de 3 seleccionadas
                    </span>
                </div>

                {/* List of 5 Compact Cards (Guaranteed No Scroll) */}
                <div className="space-y-2 flex-1 flex flex-col justify-center">
                    {promises.map(promise => {
                        const isSelected = selectedIds.includes(promise.id);
                        const isDisabled = !isSelected && selectedIds.length >= 3;

                        return (
                            <div
                                key={promise.id}
                                onClick={() => !isDisabled && togglePromise(promise.id)}
                                className={`w-full py-2.5 px-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                                    isSelected
                                        ? 'bg-[#151D2E] border-[var(--apex-gold)] shadow-[0_0_15px_rgba(245,200,76,0.15)] cursor-pointer'
                                        : isDisabled
                                        ? 'bg-black/20 border-white/5 opacity-40 cursor-not-allowed'
                                        : 'bg-black/30 border-white/10 hover:border-white/20 hover:bg-white/[0.04] cursor-pointer active:scale-[0.99]'
                                }`}
                            >
                                {/* Left Icon & Text */}
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                        isSelected 
                                            ? 'bg-[var(--apex-gold)]/20 border-[var(--apex-gold)]/40' 
                                            : 'bg-white/5 border-white/10'
                                    }`}>
                                        {getPromiseIcon(promise.type)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/40">
                                                {getPromiseCategoryLabel(promise.type)}
                                            </span>
                                            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                                +{promise.impact}% Aprobación
                                            </span>
                                        </div>
                                        <div className={`text-xs font-bold leading-tight truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                            {promise.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Checkbox */}
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                    isSelected
                                        ? 'bg-[var(--apex-gold)] border-[var(--apex-gold)] text-black shadow-md'
                                        : 'border-white/20 bg-black/40'
                                }`}>
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-3">
                    <button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                        className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
                            selectedIds.length > 0
                                ? 'bg-gradient-to-r from-[#FCE881] via-[#F5C84C] to-[#D4AF37] text-black hover:brightness-110 active:scale-[0.98] cursor-pointer shadow-[0_4px_20px_rgba(245,200,76,0.25)]'
                                : 'bg-white/10 text-white/30 border border-white/5 cursor-not-allowed'
                        }`}
                    >
                        <span>
                            {selectedIds.length === 0 
                                ? 'Selecciona al menos 1 compromiso' 
                                : `Confirmar Compromisos (${selectedIds.length}/3)`}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
