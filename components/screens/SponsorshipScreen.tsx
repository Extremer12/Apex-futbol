import React, { useState, useMemo } from 'react';
import { GameState, Sponsor } from '../../types';
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
    ShieldCheck, 
    ArrowRight, 
    X,
    Filter
} from 'lucide-react';
import { formatCurrencyShort } from '../../utils';
import { useToast } from '../common/ToastProvider';

interface SponsorshipScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

type SponsorCategory = 'all' | 'shirt' | 'stadium' | 'training' | 'kit';

const SPONSOR_SLOTS: { type: Sponsor['type']; label: string; icon: string; description: string }[] = [
    { 
        type: 'shirt', 
        label: 'Frontal de Camiseta', 
        icon: '👕', 
        description: 'Patrocinador principal del club. Mayor visibilidad de marca y volumen de ingresos.' 
    },
    { 
        type: 'stadium', 
        label: 'Naming Rights Estadio', 
        icon: '🏟️', 
        description: 'Derechos comerciales por el nombre del estadio. Contratos estables a largo plazo.' 
    },
    { 
        type: 'training', 
        label: 'Complejo Deportivo', 
        icon: '🥤', 
        description: 'Patrocinio de indumentaria de práctica e instalaciones de la ciudad deportiva.' 
    },
    { 
        type: 'kit', 
        label: 'Proveedor Técnico', 
        icon: '👟', 
        description: 'Marca deportiva oficial que confecciona y suministra las equipaciones del equipo.' 
    }
];

export const SponsorshipScreen: React.FC<SponsorshipScreenProps> = ({ gameState, dispatch }) => {
    const { sponsors, availableSponsors, finances, team } = gameState;
    const { showToast } = useToast();

    const [selectedCategory, setSelectedCategory] = useState<SponsorCategory>('all');
    const [negotiatingSponsor, setNegotiatingSponsor] = useState<Sponsor | null>(null);

    // Calculations
    const totalWeeklyIncome = useMemo(() => sponsors.reduce((sum, s) => sum + s.weeklyIncome, 0), [sponsors]);
    const totalAnnualProjected = totalWeeklyIncome * 52;
    const coveredSlotsCount = sponsors.length;

    // Filtered offers
    const filteredOffers = useMemo(() => {
        if (selectedCategory === 'all') return availableSponsors;
        return availableSponsors.filter(s => s.type === selectedCategory);
    }, [availableSponsors, selectedCategory]);

    const getBonusDescription = (bonus?: { condition: string; amount: number }) => {
        if (!bonus) return null;
        let condLabel = 'Cumplir objetivo fijado';
        if (bonus.condition === 'top4') condLabel = 'Terminar en el Top 4 de liga';
        else if (bonus.condition === 'top6') condLabel = 'Terminar en el Top 6 de liga';
        else if (bonus.condition === 'promotion') condLabel = 'Lograr el ascenso de categoría';
        else if (bonus.condition === 'win_cup') condLabel = 'Ganar un título oficial de copa';

        return {
            amountFormatted: formatCurrencyShort(bonus.amount),
            conditionText: condLabel
        };
    };

    const handleExecuteNegotiation = (sponsor: Sponsor, riskLevel: 'safe' | 'moderate' | 'high') => {
        const existingOfType = sponsors.find(s => s.type === sponsor.type);

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
                `¡Acuerdo sellado con ${sponsor.name}! Ingreso: ${formatCurrencyShort(finalIncome)}/sem. Bono de bienvenida: ${formatCurrencyShort(signingBonus)}`, 
                'success'
            );
        } else {
            dispatch({ type: 'REMOVE_SPONSOR_OFFER', payload: { sponsorId: sponsor.id } });
            showToast(`La directiva de ${sponsor.name} consideró excesivas tus exigencias y canceló la negociación.`, 'error');
        }

        setNegotiatingSponsor(null);
    };

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 pb-28 animate-fade-in text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-0.5 rounded">
                            Gestión Comercial & Marketing
                        </span>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            {team.tier === 'Top' ? 'Prestigio Élite' : team.tier === 'Mid' ? 'Alcance Nacional' : 'Desarrollo Regional'}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mt-1">
                        Patrocinios del Club
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-[#101726] border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--apex-green)] animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider text-white/80">
                            {coveredSlotsCount} de 4 Espacios Cubiertos
                        </span>
                    </div>
                </div>
            </div>

            {/* Financial Overview Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="apex-card p-4 bg-gradient-to-br from-[#101726] to-[#0A0E17] border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--apex-green)]/10 border border-[var(--apex-green)]/20 flex items-center justify-center shrink-0">
                        <Coins className="w-6 h-6 text-[var(--apex-green)]" />
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Ingreso Semanal Comercial</div>
                        <div className="text-xl sm:text-2xl font-black text-[var(--apex-green)] leading-tight">
                            {formatCurrencyShort(totalWeeklyIncome)}
                        </div>
                        <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider mt-0.5">Abonado cada semana</div>
                    </div>
                </div>

                <div className="apex-card p-4 bg-gradient-to-br from-[#101726] to-[#0A0E17] border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/20 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-6 h-6 text-[var(--apex-gold)]" />
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Proyección Temporada</div>
                        <div className="text-xl sm:text-2xl font-black text-[var(--apex-gold)] leading-tight">
                            {formatCurrencyShort(totalAnnualProjected)}
                        </div>
                        <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider mt-0.5">52 semanas de ingresos fijos</div>
                    </div>
                </div>

                <div className="apex-card p-4 bg-gradient-to-br from-[#101726] to-[#0A0E17] border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Ofertas en Mercado</div>
                        <div className="text-xl sm:text-2xl font-black text-white leading-tight">
                            {availableSponsors.length} Marcas
                        </div>
                        <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider mt-0.5">Listas para negociar</div>
                    </div>
                </div>
            </div>

            {/* SECTION 1: THE 4 COMMERCIAL SLOTS */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-white/60 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                        Espacios Comerciales del Club (4 Categorías)
                    </h2>
                    <span className="text-[10px] text-white/40 font-bold">
                        {sponsors.length === 4 ? '🟢 Máximo aprovechamiento comercial' : '🟡 Hay espacios vacantes sin monetizar'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {SPONSOR_SLOTS.map(slot => {
                        const activeSponsor = sponsors.find(s => s.type === slot.type);
                        const offersForSlot = availableSponsors.filter(s => s.type === slot.type);
                        const bonusInfo = activeSponsor ? getBonusDescription(activeSponsor.bonus) : null;

                        return (
                            <div 
                                key={slot.type}
                                className={`apex-card p-4.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                                    activeSponsor 
                                        ? 'bg-[#0E1422] border-[var(--apex-green)]/30 hover:border-[var(--apex-green)]/60' 
                                        : 'bg-[#0E1422]/50 border-dashed border-amber-500/30 hover:border-amber-500/60'
                                }`}
                            >
                                <div>
                                    {/* Top Slot Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xl p-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                                                {slot.icon}
                                            </span>
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight">
                                                    {slot.label}
                                                </h3>
                                                <p className="text-[9px] text-white/40 leading-tight">
                                                    {slot.description}
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0 border ${
                                            activeSponsor 
                                                ? 'bg-[var(--apex-green)]/15 border-[var(--apex-green)]/30 text-[var(--apex-green)]' 
                                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                        }`}>
                                            {activeSponsor ? 'CONTRATO ACTIVO' : 'VACANTE'}
                                        </span>
                                    </div>

                                    {/* Slot Content */}
                                    {activeSponsor ? (
                                        <div className="space-y-3 bg-black/25 p-3 rounded-xl border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base">{activeSponsor.logo}</span>
                                                    <span className="font-extrabold text-sm text-white uppercase">{activeSponsor.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[var(--apex-green)] font-black text-sm">
                                                        +{formatCurrencyShort(activeSponsor.weeklyIncome)}
                                                    </div>
                                                    <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest">por semana</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[10px]">
                                                <div className="flex items-center gap-1.5 text-white/60">
                                                    <Clock className="w-3.5 h-3.5 text-white/40" />
                                                    <span>{activeSponsor.duration} semanas restantes</span>
                                                </div>
                                                {bonusInfo && (
                                                    <div className="flex items-center gap-1.5 text-[var(--apex-gold)] truncate" title={bonusInfo.conditionText}>
                                                        <Star className="w-3.5 h-3.5 fill-current shrink-0" />
                                                        <span className="truncate">Bono: {bonusInfo.amountFormatted}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                                <span className="text-[11px] text-amber-300/80 font-bold">
                                                    Sin patrocinador asignado. {offersForSlot.length} propuestas esperando.
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Slot Action */}
                                <div className="mt-3 pt-2 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">
                                        {offersForSlot.length} Oferta{offersForSlot.length !== 1 ? 's' : ''} disponible{offersForSlot.length !== 1 ? 's' : ''}
                                    </span>
                                    <button
                                        onClick={() => setSelectedCategory(slot.type)}
                                        className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)] hover:text-yellow-300 flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <span>{activeSponsor ? 'Ver Alternativas' : 'Examinar Ofertas'}</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 2: AVAILABLE SPONSOR OFFERS MARKET */}
            <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xs font-black text-white/60 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Coins className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                            Mercado de Ofertas Comerciales
                        </h2>
                        <p className="text-[10px] text-white/40 mt-0.5">
                            Selecciona una marca para negociar las condiciones contractuales o el pago semanal.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                                selectedCategory === 'all'
                                    ? 'bg-[var(--apex-gold)] text-black border-[var(--apex-gold)] shadow-md'
                                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            Todas ({availableSponsors.length})
                        </button>
                        {SPONSOR_SLOTS.map(slot => {
                            const count = availableSponsors.filter(s => s.type === slot.type).length;
                            return (
                                <button
                                    key={slot.type}
                                    onClick={() => setSelectedCategory(slot.type)}
                                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border ${
                                        selectedCategory === 'slot.type' || selectedCategory === slot.type
                                            ? 'bg-[var(--apex-gold)] text-black border-[var(--apex-gold)] shadow-md'
                                            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <span>{slot.icon}</span>
                                    <span>{slot.label.split(' ')[0]}</span>
                                    <span className="opacity-60 text-[9px]">({count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {filteredOffers.length === 0 ? (
                    <div className="apex-card border-dashed border-white/10 py-12 text-center">
                        <Briefcase className="w-10 h-10 text-white/15 mx-auto mb-3" />
                        <p className="text-xs font-black text-white/40 uppercase tracking-widest">
                            No hay propuestas comerciales disponibles en esta categoría.
                        </p>
                        <p className="text-[10px] text-white/30 mt-1">
                            Nuevos patrocinadores enviarán propuestas al finalizar cada temporada o avanzar en los torneos.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOffers.map(offer => {
                            const slotMeta = SPONSOR_SLOTS.find(s => s.type === offer.type);
                            const currentSponsorInSlot = sponsors.find(s => s.type === offer.type);
                            const incomeDifference = currentSponsorInSlot 
                                ? offer.weeklyIncome - currentSponsorInSlot.weeklyIncome 
                                : offer.weeklyIncome;
                            const bonusInfo = getBonusDescription(offer.bonus);
                            const signingBonus = offer.weeklyIncome * 4;

                            return (
                                <div 
                                    key={offer.id} 
                                    className="apex-card p-5 rounded-2xl bg-[#0F1626] border border-white/10 hover:border-[var(--apex-gold)]/50 transition-all flex flex-col justify-between group shadow-lg"
                                >
                                    <div className="space-y-4">
                                        {/* Brand & Category */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-2xl border border-white/10 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                                    {offer.logo}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-black uppercase text-sm tracking-tight group-hover:text-[var(--apex-gold)] transition-colors leading-tight">
                                                        {offer.name}
                                                    </h4>
                                                    <div className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-black uppercase tracking-wider text-white/40">
                                                        <span>{slotMeta?.icon}</span>
                                                        <span>{slotMeta?.label}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Weekly Payout */}
                                            <div className="text-right shrink-0">
                                                <div className="text-[var(--apex-green)] font-black text-lg leading-none">
                                                    {formatCurrencyShort(offer.weeklyIncome)}
                                                </div>
                                                <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-0.5">/ semana</div>
                                            </div>
                                        </div>

                                        {/* Comparison Pill vs Active Sponsor */}
                                        {currentSponsorInSlot ? (
                                            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border flex items-center justify-between ${
                                                incomeDifference > 0 
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                                    : incomeDifference < 0
                                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                                    : 'bg-white/5 border-white/10 text-white/50'
                                            }`}>
                                                <span>Comparativa con contrato actual:</span>
                                                <span className="font-black">
                                                    {incomeDifference > 0 ? `+${formatCurrencyShort(incomeDifference)}/sem` : `${formatCurrencyShort(incomeDifference)}/sem`}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-between">
                                                <span>Espacio libre:</span>
                                                <span className="font-black">Monetización inmediata</span>
                                            </div>
                                        )}

                                        {/* Contract Terms */}
                                        <div className="grid grid-cols-2 gap-2 bg-black/25 p-2.5 rounded-xl border border-white/5 text-[10px]">
                                            <div>
                                                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block mb-0.5">Duración</span>
                                                <span className="font-black text-white">{Math.ceil(offer.duration / 52)} Año{Math.ceil(offer.duration / 52) !== 1 ? 's' : ''} ({offer.duration} sem.)</span>
                                            </div>
                                            <div>
                                                <span className="text-[8px] font-bold text-[var(--apex-gold)]/70 uppercase tracking-widest block mb-0.5">Bono de Bienvenida</span>
                                                <span className="font-black text-[var(--apex-gold)]">+{formatCurrencyShort(signingBonus)}</span>
                                            </div>
                                        </div>

                                        {/* Bonus Clause */}
                                        {bonusInfo && (
                                            <div className="bg-[var(--apex-gold)]/5 border border-[var(--apex-gold)]/15 p-2.5 rounded-xl">
                                                <div className="flex items-center gap-1.5 text-[8px] font-black text-[var(--apex-gold)] uppercase tracking-wider mb-1">
                                                    <Star className="w-3 h-3 fill-current shrink-0" />
                                                    <span>Cláusula por Rendimiento Deportivo</span>
                                                </div>
                                                <div className="text-[10px] text-white/70 leading-snug">
                                                    Recibirás <span className="font-black text-white">+{bonusInfo.amountFormatted}</span> adicionales si logras: <span className="font-bold text-[var(--apex-gold)]">{bonusInfo.conditionText}</span>.
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => setNegotiatingSponsor(offer)}
                                        className="mt-4 w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-[0.15em] bg-gradient-to-r from-[var(--apex-gold)] to-yellow-600 text-black hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                                    >
                                        <span>Negociar Acuerdo</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Negotiation Modal */}
            {negotiatingSponsor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#0C121F] border border-white/15 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative overflow-hidden">
                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--apex-gold)]/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                        {/* Top modal bar */}
                        <div className="flex justify-between items-start mb-5 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-black/50 rounded-2xl flex items-center justify-center text-2xl border border-white/10 shadow-inner">
                                    {negotiatingSponsor.logo}
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--apex-gold)]">Mesa de Negociación</span>
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

                        {/* Warning if replacing an existing sponsor */}
                        {sponsors.some(s => s.type === negotiatingSponsor.type) && (
                            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center gap-2.5 text-amber-300 text-xs font-bold relative z-10">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>
                                    Al firmar, rescindirás tu contrato vigente con {sponsors.find(s => s.type === negotiatingSponsor.type)?.name} para este espacio comercial.
                                </span>
                            </div>
                        )}

                        <p className="text-white/70 text-xs mb-6 leading-relaxed relative z-10">
                            La marca ofrece una base de <span className="text-[var(--apex-green)] font-extrabold">{formatCurrencyShort(negotiatingSponsor.weeklyIncome)}/sem</span> con un bono de bienvenida inmediato de <span className="text-white font-extrabold">{formatCurrencyShort(negotiatingSponsor.weeklyIncome * 4)}</span>. Elige tu postura en la negociación:
                        </p>

                        {/* Negotiation Options */}
                        <div className="space-y-3 relative z-10">
                            {/* Option 1: Safe */}
                            <button
                                onClick={() => handleExecuteNegotiation(negotiatingSponsor, 'safe')}
                                className="w-full flex items-center justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/60 hover:bg-emerald-500/15 rounded-xl transition-all group cursor-pointer"
                            >
                                <div className="text-left">
                                    <div className="text-white font-black uppercase text-xs tracking-wider group-hover:text-emerald-300 transition-colors">
                                        Aceptar Oferta Base (100% Segura)
                                    </div>
                                    <div className="text-white/40 text-[9px] mt-0.5 font-bold uppercase tracking-wider">
                                        Firma inmediata sin riesgos de ruptura
                                    </div>
                                </div>
                                <div className="text-[var(--apex-green)] font-black text-sm">
                                    {formatCurrencyShort(negotiatingSponsor.weeklyIncome)}/sem
                                </div>
                            </button>

                            {/* Option 2: Moderate */}
                            <button
                                onClick={() => handleExecuteNegotiation(negotiatingSponsor, 'moderate')}
                                className="w-full flex items-center justify-between p-3.5 bg-[var(--apex-gold)]/5 border border-[var(--apex-gold)]/20 hover:border-[var(--apex-gold)]/60 hover:bg-[var(--apex-gold)]/15 rounded-xl transition-all group cursor-pointer"
                            >
                                <div className="text-left">
                                    <div className="text-white font-black uppercase text-xs tracking-wider group-hover:text-[var(--apex-gold)] transition-colors">
                                        Exigir +15% de Mejora
                                    </div>
                                    <div className="text-white/40 text-[9px] mt-0.5 font-bold uppercase tracking-wider">
                                        Riesgo moderado • 65% de probabilidad de éxito
                                    </div>
                                </div>
                                <div className="text-[var(--apex-gold)] font-black text-sm">
                                    {formatCurrencyShort(Math.floor(negotiatingSponsor.weeklyIncome * 1.15))}/sem
                                </div>
                            </button>

                            {/* Option 3: High */}
                            <button
                                onClick={() => handleExecuteNegotiation(negotiatingSponsor, 'high')}
                                className="w-full flex items-center justify-between p-3.5 bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/60 hover:bg-rose-500/15 rounded-xl transition-all group cursor-pointer"
                            >
                                <div className="text-left">
                                    <div className="text-white font-black uppercase text-xs tracking-wider group-hover:text-rose-300 transition-colors">
                                        Presionar por +30% Máximo
                                    </div>
                                    <div className="text-white/40 text-[9px] mt-0.5 font-bold uppercase tracking-wider">
                                        Alto riesgo • 30% éxito (pueden retirar la oferta)
                                    </div>
                                </div>
                                <div className="text-rose-400 font-black text-sm">
                                    {formatCurrencyShort(Math.floor(negotiatingSponsor.weeklyIncome * 1.30))}/sem
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
