import React, { useState, useMemo } from 'react';
import { GameState, Sponsor, Screen } from '../../types';
import { GameAction } from '../../state/reducer';
import { 
    Briefcase, 
    CheckCircle2, 
    Clock, 
    Coins, 
    Star, 
    AlertTriangle, 
    TrendingUp, 
    Sparkles, 
    ArrowRight, 
    X,
    Shirt,
    Building2,
    Zap,
    Tag,
    ArrowLeft,
    Check,
    ChevronRight,
    Award
} from 'lucide-react';
import { formatCurrencyShort, formatCurrency } from '../../utils';
import { useToast } from '../common/ToastProvider';
import { useGameStore } from '../../state/gameStore';
import { TeamLogo } from '../../data/teams/helpers';

interface SponsorshipScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    onNavigate?: (screen: Screen) => void;
}

type SponsorCategory = 'shirt' | 'kit' | 'stadium' | 'training';

interface SlotDefinition {
    type: SponsorCategory;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    accentColor: string;
}

const SPONSOR_SLOTS: SlotDefinition[] = [
    { 
        type: 'shirt', 
        title: 'Frontal Camiseta', 
        subtitle: 'Patrocinador Principal',
        icon: Shirt,
        accentColor: '#38BDF8'
    },
    { 
        type: 'kit', 
        title: 'Proveedor Técnico', 
        subtitle: 'Marca de Indumentaria',
        icon: Tag,
        accentColor: '#A78BFA'
    },
    { 
        type: 'stadium', 
        title: 'Naming Estadio', 
        subtitle: 'Derechos de Nombre',
        icon: Building2,
        accentColor: '#F59E0B'
    },
    { 
        type: 'training', 
        title: 'Ciudad Deportiva', 
        subtitle: 'Instalaciones & Práctica',
        icon: Zap,
        accentColor: '#10B981'
    }
];

export const SponsorshipScreen: React.FC<SponsorshipScreenProps> = ({ gameState, dispatch, onNavigate }) => {
    const { sponsors, availableSponsors, team } = gameState;
    const { showToast } = useToast();
    const setActiveScreen = useGameStore(s => s.setActiveScreen);
    const nav = onNavigate || setActiveScreen;

    const [selectedSlot, setSelectedSlot] = useState<SponsorCategory>('shirt');
    const [negotiatingSponsor, setNegotiatingSponsor] = useState<Sponsor | null>(null);

    // Global commercial metrics
    const totalWeeklyIncome = useMemo(() => sponsors.reduce((sum, s) => sum + s.weeklyIncome, 0), [sponsors]);
    const totalAnnualProjected = totalWeeklyIncome * 52;
    const activeSlotsCount = sponsors.length;

    // Selected slot info
    const currentSlotMeta = useMemo(() => {
        return SPONSOR_SLOTS.find(s => s.type === selectedSlot) || SPONSOR_SLOTS[0];
    }, [selectedSlot]);

    const activeSponsorInSlot = useMemo(() => {
        return sponsors.find(s => s.type === selectedSlot) || null;
    }, [sponsors, selectedSlot]);

    const offersForSelectedSlot = useMemo(() => {
        return availableSponsors.filter(s => s.type === selectedSlot);
    }, [availableSponsors, selectedSlot]);

    const getBonusText = (bonus?: { condition: string; amount: number }) => {
        if (!bonus) return null;
        let condLabel = 'Objetivo deportivo';
        if (bonus.condition === 'top4') condLabel = 'Clasificar Top 4';
        else if (bonus.condition === 'top6') condLabel = 'Clasificar Top 6';
        else if (bonus.condition === 'promotion') condLabel = 'Lograr Ascenso';
        else if (bonus.condition === 'win_cup') condLabel = 'Campeón de Copa';

        return {
            label: condLabel,
            amount: formatCurrencyShort(bonus.amount)
        };
    };

    const handleExecuteNegotiation = (sponsor: Sponsor, riskLevel: 'safe' | 'moderate' | 'high') => {
        let successChance = 1.0;
        let bonusMultiplier = 1.0;

        if (riskLevel === 'moderate') {
            successChance = 0.65;
            bonusMultiplier = 1.15;
        } else if (riskLevel === 'high') {
            successChance = 0.30;
            bonusMultiplier = 1.30;
        }

        const isSuccess = Math.random() <= successChance;

        if (isSuccess) {
            const finalIncome = Math.floor(sponsor.weeklyIncome * bonusMultiplier);
            dispatch({ 
                type: 'ACCEPT_SPONSOR', 
                payload: { sponsorId: sponsor.id, negotiatedIncome: finalIncome } 
            });
            const signingBonus = Math.floor(finalIncome * 4);
            showToast(
                `¡Firma exitosa con ${sponsor.name}! Ingreso: ${formatCurrencyShort(finalIncome)}/sem. Bono inicial: ${formatCurrencyShort(signingBonus)}`, 
                'success'
            );
        } else {
            dispatch({ type: 'REMOVE_SPONSOR_OFFER', payload: { sponsorId: sponsor.id } });
            showToast(`La directiva de ${sponsor.name} consideró excesivas tus condiciones y rompió las negociaciones.`, 'error');
        }

        setNegotiatingSponsor(null);
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-28 animate-fade-in text-white">
            {/* Top Navigation & Executive Summary Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3.5">
                    <button
                        onClick={() => nav(Screen.Club)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-white/10 transition-all flex items-center gap-2 group cursor-pointer shadow-sm"
                        title="Volver al Club"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Club</span>
                    </button>

                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 p-2 flex items-center justify-center shrink-0 shadow-inner">
                        <TeamLogo team={team} className="w-full h-full object-contain" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-0.5 rounded border border-[var(--apex-gold)]/20">
                                Área Comercial
                            </span>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest hidden sm:inline">
                                {team.name}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                            Gestión de Patrocinios
                        </h1>
                    </div>
                </div>

                {/* Condensed Financial KPIs */}
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    <div className="bg-[#0C121F] border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-sm">
                        <div className="p-1.5 rounded-lg bg-[var(--apex-green)]/10 text-[var(--apex-green)]">
                            <Coins className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Ingreso Semanal</div>
                            <div className="text-sm font-black text-[var(--apex-green)]">
                                {formatCurrencyShort(totalWeeklyIncome)}/sem
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0C121F] border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-sm">
                        <div className="p-1.5 rounded-lg bg-[var(--apex-gold)]/10 text-[var(--apex-gold)]">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Proyección Anual</div>
                            <div className="text-sm font-black text-[var(--apex-gold)]">
                                {formatCurrencyShort(totalAnnualProjected)}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0C121F] border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-sm">
                        <div className={`w-2.5 h-2.5 rounded-full ${activeSlotsCount === 4 ? 'bg-[var(--apex-green)] shadow-[0_0_8px_rgba(46,204,113,0.6)]' : 'bg-amber-400 animate-pulse'}`} />
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Espacios</div>
                            <div className="text-sm font-black text-white">
                                {activeSlotsCount}/4 Cubiertos
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4 COMMERCIAL ASSETS SELECTOR (Interactive Grid/Tabs) */}
            <div className="space-y-2.5">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                    <span>Selecciona un Activo Comercial</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {SPONSOR_SLOTS.map(slot => {
                        const isSelected = selectedSlot === slot.type;
                        const activeSponsor = sponsors.find(s => s.type === slot.type);
                        const offerCount = availableSponsors.filter(s => s.type === slot.type).length;
                        const IconComponent = slot.icon;

                        return (
                            <button
                                key={slot.type}
                                onClick={() => setSelectedSlot(slot.type)}
                                className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between group ${
                                    isSelected 
                                        ? 'bg-gradient-to-br from-[#151F33] to-[#0D1524] border-[var(--apex-gold)] shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-[var(--apex-gold)]/50'
                                        : 'bg-[#0B101D]/70 hover:bg-[#0E1526] border-white/10 hover:border-white/20'
                                }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--apex-gold)]/10 blur-xl pointer-events-none rounded-full" />
                                )}

                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2.5">
                                        <div 
                                            className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105"
                                            style={{ 
                                                backgroundColor: `${slot.accentColor}15`, 
                                                borderColor: `${slot.accentColor}40`,
                                                color: slot.accentColor 
                                            }}
                                        >
                                            <IconComponent className="w-4 h-4" />
                                        </div>

                                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                            activeSponsor 
                                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                                                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                        }`}>
                                            {activeSponsor ? 'FIRMADO' : 'VACANTE'}
                                        </span>
                                    </div>

                                    <div className="font-black text-xs sm:text-sm text-white uppercase tracking-tight leading-tight">
                                        {slot.title}
                                    </div>
                                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-0.5">
                                        {activeSponsor ? activeSponsor.name : 'Disponible para ofertar'}
                                    </div>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                                    <div className="text-xs font-black">
                                        {activeSponsor ? (
                                            <span className="text-[var(--apex-green)]">
                                                +{formatCurrencyShort(activeSponsor.weeklyIncome)}/s
                                            </span>
                                        ) : (
                                            <span className="text-white/40 text-[10px]">
                                                {offerCount} Oferta{offerCount !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>

                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[var(--apex-gold)] translate-x-0.5' : 'text-white/20 group-hover:translate-x-0.5'}`} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* FOCUSED WORKSPACE FOR THE SELECTED ASSET */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* LEFT: CURRENT CONTRACT STATUS */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                            <currentSlotMeta.icon className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                            <span>Contrato Actual: {currentSlotMeta.title}</span>
                        </h2>
                    </div>

                    {activeSponsorInSlot ? (
                        <div className="apex-card p-5 sm:p-6 bg-gradient-to-b from-[#101728] to-[#0A0E18] border-white/15 rounded-3xl relative overflow-hidden shadow-xl space-y-5">
                            {/* Decorative aura */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--apex-green)]/10 blur-3xl pointer-events-none rounded-full" />

                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-14 h-14 rounded-2xl bg-black/50 border border-white/15 flex items-center justify-center text-[var(--apex-gold)] shadow-inner">
                                        <currentSlotMeta.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-[var(--apex-green)] flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Acuerdo Vigente</span>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                                            {activeSponsorInSlot.name}
                                        </h3>
                                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                                            {currentSlotMeta.subtitle}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Ingreso Semanal</div>
                                    <div className="text-xl sm:text-2xl font-black text-[var(--apex-green)]">
                                        +{formatCurrencyShort(activeSponsorInSlot.weeklyIncome)}
                                    </div>
                                    <div className="text-[9px] text-white/30 font-bold">por semana</div>
                                </div>
                            </div>

                            {/* Contract Health & Timeline */}
                            <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-white/50 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-white/40" />
                                        <span>Tiempo de Contrato</span>
                                    </span>
                                    <span className="text-white font-black">
                                        {activeSponsorInSlot.duration} semanas (~{Math.ceil(activeSponsorInSlot.duration / 52)} {Math.ceil(activeSponsorInSlot.duration / 52) === 1 ? 'temporada' : 'temporadas'})
                                    </span>
                                </div>
                                
                                {/* Simple visual progress indicator */}
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-emerald-500 to-[var(--apex-green)] h-full rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(15, (activeSponsorInSlot.duration / 156) * 100))}%` }}
                                    />
                                </div>
                            </div>

                            {/* Bonus Objective Pill (if present) */}
                            {activeSponsorInSlot.bonus ? (
                                (() => {
                                    const bonusData = getBonusText(activeSponsorInSlot.bonus);
                                    if (!bonusData) return null;
                                    return (
                                        <div className="p-3 bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/20 rounded-2xl flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] shrink-0">
                                                    <Star className="w-4 h-4 fill-current" />
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black uppercase tracking-wider text-[var(--apex-gold)]">
                                                        Bono por Objetivo
                                                    </div>
                                                    <div className="text-xs font-bold text-white/90">
                                                        {bonusData.label}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-xs font-black text-[var(--apex-gold)]">
                                                    +{bonusData.amount}
                                                </div>
                                                <div className="text-[8px] font-bold text-white/40 uppercase">al cumplir</div>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="text-[10px] text-white/30 italic text-center py-1">
                                    Sin cláusulas variables por rendimiento
                                </div>
                            )}

                            {/* Replacement notice */}
                            <div className="text-[10px] text-white/40 bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>Puedes rescindir este contrato si firmas una oferta del mercado.</span>
                            </div>
                        </div>
                    ) : (
                        /* Empty State when Vacant */
                        <div className="apex-card p-8 bg-[#0C121F]/80 border-dashed border-amber-500/30 rounded-3xl text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
                            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-inner">
                                <currentSlotMeta.icon className="w-8 h-8" />
                            </div>

                            <div className="max-w-xs space-y-1">
                                <div className="text-amber-400 font-black uppercase text-xs tracking-widest">
                                    Espacio sin monetizar
                                </div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                    {currentSlotMeta.title} Vacante
                                </h3>
                                <p className="text-xs text-white/40 leading-relaxed">
                                    Selecciona una de las marcas del mercado a la derecha para generar ingresos semanales inmediatos para el club.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: MARKET OFFERS FOR THIS ASSET */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                            <Coins className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                            <span>Propuestas del Mercado ({offersForSelectedSlot.length})</span>
                        </h2>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                            Para {currentSlotMeta.title}
                        </span>
                    </div>

                    {offersForSelectedSlot.length === 0 ? (
                        <div className="apex-card p-10 bg-[#0B101D] border border-white/10 rounded-3xl text-center space-y-3 flex flex-col items-center justify-center min-h-[280px]">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                                    Sin ofertas disponibles
                                </h4>
                                <p className="text-xs text-white/40 max-w-sm">
                                    Nuevas marcas presentarán propuestas comerciales al inicio de cada temporada o al clasificar a nuevos torneos.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {offersForSelectedSlot.map(offer => {
                                const currentIncome = activeSponsorInSlot ? activeSponsorInSlot.weeklyIncome : 0;
                                const incomeDiff = offer.weeklyIncome - currentIncome;
                                const bonusData = getBonusText(offer.bonus);
                                const signingBonus = offer.weeklyIncome * 4;

                                return (
                                    <div 
                                        key={offer.id}
                                        className="apex-card p-4 sm:p-5 bg-[#0D1424] hover:bg-[#10192D] border border-white/10 hover:border-[var(--apex-gold)]/40 rounded-2xl transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                                    >
                                        {/* Brand info & Payout */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-[var(--apex-gold)] group-hover:scale-105 transition-transform shrink-0">
                                                    <currentSlotMeta.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-base font-black text-white uppercase tracking-tight group-hover:text-[var(--apex-gold)] transition-colors">
                                                            {offer.name}
                                                        </h4>

                                                        {/* Income comparison badge */}
                                                        {activeSponsorInSlot ? (
                                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                                                incomeDiff > 0 
                                                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                                                    : incomeDiff < 0
                                                                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                                                                    : 'bg-white/5 border-white/10 text-white/40'
                                                            }`}>
                                                                {incomeDiff > 0 ? `+${formatCurrencyShort(incomeDiff)}/sem` : incomeDiff < 0 ? `${formatCurrencyShort(incomeDiff)}/sem` : 'Igual'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                                                Nuevo Ingreso
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-lg font-black text-[var(--apex-green)]">
                                                        +{formatCurrencyShort(offer.weeklyIncome)}
                                                        <span className="text-xs text-white/40 font-normal ml-1">/ semana</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Key terms chips */}
                                            <div className="flex items-center gap-2 flex-wrap pt-1">
                                                <span className="text-[10px] font-bold text-white/70 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3 text-white/40" />
                                                    <span>{Math.ceil(offer.duration / 52)} {Math.ceil(offer.duration / 52) === 1 ? 'temporada' : 'temporadas'}</span>
                                                </span>

                                                <span className="text-[10px] font-black text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2.5 py-1 rounded-lg border border-[var(--apex-gold)]/20 flex items-center gap-1.5">
                                                    <Sparkles className="w-3 h-3" />
                                                    <span>Bono Firma: +{formatCurrencyShort(signingBonus)}</span>
                                                </span>

                                                {bonusData && (
                                                    <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 flex items-center gap-1.5" title={`Bono al cumplir: ${bonusData.label}`}>
                                                        <Star className="w-3 h-3 fill-current" />
                                                        <span>{bonusData.label}: +{bonusData.amount}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => setNegotiatingSponsor(offer)}
                                            className="sm:self-center px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-[var(--apex-gold)] to-yellow-600 text-black hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0"
                                        >
                                            <span>Negociar</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SLEEK NEGOTIATION MODAL */}
            {negotiatingSponsor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#0C121F] border border-white/15 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative overflow-hidden">
                        {/* Golden Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--apex-gold)]/10 blur-[100px] rounded-full pointer-events-none" />

                        {/* Header */}
                        <div className="flex justify-between items-start mb-5 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-black/50 rounded-2xl flex items-center justify-center border border-white/10 text-[var(--apex-gold)] shadow-inner">
                                    <currentSlotMeta.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--apex-gold)]">
                                        Mesa de Negociación
                                    </span>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                        {negotiatingSponsor.name}
                                    </h3>
                                </div>
                            </div>
                            <button 
                                onClick={() => setNegotiatingSponsor(null)} 
                                className="text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Replacement warning if replacing active partner */}
                        {activeSponsorInSlot && (
                            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center gap-2.5 text-amber-300 text-xs font-bold relative z-10">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>
                                    Reemplazará a {activeSponsorInSlot.name} como patrocinador de este espacio.
                                </span>
                            </div>
                        )}

                        {/* Proposal summary pill */}
                        <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 mb-5 flex items-center justify-between text-xs relative z-10">
                            <div>
                                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Oferta Base</div>
                                <div className="text-sm font-black text-[var(--apex-green)]">
                                    {formatCurrencyShort(negotiatingSponsor.weeklyIncome)}/sem
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Bono Inicial</div>
                                <div className="text-sm font-black text-[var(--apex-gold)]">
                                    +{formatCurrencyShort(negotiatingSponsor.weeklyIncome * 4)}
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-white/60 font-medium mb-3 relative z-10">
                            Elige la postura del club para el cierre del contrato:
                        </div>

                        {/* Negotiation Strategies */}
                        <div className="space-y-2.5 relative z-10">
                            {/* Strategy 1: Safe */}
                            <button
                                onClick={() => handleExecuteNegotiation(negotiatingSponsor, 'safe')}
                                className="w-full flex items-center justify-between p-3.5 bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl transition-all group cursor-pointer"
                            >
                                <div className="text-left">
                                    <div className="text-white font-black uppercase text-xs tracking-wider group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                                        <span>Aceptar Oferta Base</span>
                                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black">100% SEGURO</span>
                                    </div>
                                    <div className="text-white/40 text-[9px] mt-0.5 font-bold uppercase tracking-wider">
                                        Firma inmediata sin riesgo de rechazo
                                    </div>
                                </div>
                                <div className="text-sm font-black text-[var(--apex-green)]">
                                    {formatCurrencyShort(negotiatingSponsor.weeklyIncome)}/s
                                </div>
                            </button>

                            {/* Strategy 2: Moderate */}
                            <button
                                onClick={() => handleExecuteNegotiation(negotiatingSponsor, 'moderate')}
                                className="w-full flex items-center justify-between p-3.5 bg-[var(--apex-gold)]/5 hover:bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/20 hover:border-[var(--apex-gold)]/50 rounded-2xl transition-all group cursor-pointer"
                            >
                                <div className="text-left">
                                    <div className="text-white font-black uppercase text-xs tracking-wider group-hover:text-[var(--apex-gold)] transition-colors flex items-center gap-2">
                                        <span>Exigir Mejora (+15%)</span>
                                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] font-black">65% ÉXITO</span>
                                    </div>
                                    <div className="text-white/40 text-[9px] mt-0.5 font-bold uppercase tracking-wider">
                                        Riesgo moderado de cancelar negociación
                                    </div>
                                </div>
                                <div className="text-sm font-black text-[var(--apex-gold)]">
                                    {formatCurrencyShort(Math.floor(negotiatingSponsor.weeklyIncome * 1.15))}/s
                                </div>
                            </button>

                            {/* Strategy 3: Aggressive */}
                            <button
                                onClick={() => handleExecuteNegotiation(negotiatingSponsor, 'high')}
                                className="w-full flex items-center justify-between p-3.5 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/50 rounded-2xl transition-all group cursor-pointer"
                            >
                                <div className="text-left">
                                    <div className="text-white font-black uppercase text-xs tracking-wider group-hover:text-rose-300 transition-colors flex items-center gap-2">
                                        <span>Presión Máxima (+30%)</span>
                                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-black">30% ÉXITO</span>
                                    </div>
                                    <div className="text-white/40 text-[9px] mt-0.5 font-bold uppercase tracking-wider">
                                        Alto riesgo de ruptura contractual
                                    </div>
                                </div>
                                <div className="text-sm font-black text-rose-400">
                                    {formatCurrencyShort(Math.floor(negotiatingSponsor.weeklyIncome * 1.30))}/s
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
