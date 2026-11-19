import React, { useState, useMemo } from 'react';
import { Sponsor } from '../../../types';
import { formatCurrency, formatCurrencyShort } from '../../../utils';
import { SPONSOR_SLOTS, getSectorLabel } from './financesUiTypes';
import { Handshake, FileText, RefreshCw, X, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

interface FinancesSponsorsTabProps {
    sponsors: Sponsor[];
    availableSponsors: Sponsor[];
    onStartNegotiation: (sponsor: Sponsor) => void;
    onRequestTermination: (sponsor: Sponsor) => void;
    onRefreshMarket: () => void;
}

export const FinancesSponsorsTab: React.FC<FinancesSponsorsTabProps> = React.memo(({
    sponsors,
    availableSponsors,
    onStartNegotiation,
    onRequestTermination,
    onRefreshMarket
}) => {
    const [selectedSlotFilter, setSelectedSlotFilter] = useState<Sponsor['type'] | 'all'>('all');

    const filteredOffers = useMemo(() => {
        if (selectedSlotFilter === 'all') return availableSponsors;
        return availableSponsors.filter(s => s.type === selectedSlotFilter);
    }, [availableSponsors, selectedSlotFilter]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* The 4 Commercial Slots */}
            <div>
                <div className="mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[var(--apex-gold)]">
                        Espacios Comerciales del Club ({sponsors.length}/4 Asignados)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Cada espacio genera ingresos semanales fijos garantizados por contrato. Solo puede haber una marca por espacio.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {SPONSOR_SLOTS.map(slotMeta => {
                        const activeSponsor = sponsors.find(s => s.type === slotMeta.type);
                        const IconComponent = slotMeta.icon;

                        return (
                            <div
                                key={slotMeta.type}
                                className={`apex-card p-5 relative overflow-hidden flex flex-col justify-between transition-all ${
                                    activeSponsor ? 'border-t-2' : 'border-dashed border-white/15'
                                }`}
                                style={{ borderTopColor: activeSponsor ? (activeSponsor.brandColor || slotMeta.accentColor) : undefined }}
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70">
                                            <IconComponent className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">
                                                {slotMeta.title}
                                            </div>
                                            <div className="text-[11px] text-slate-300 font-semibold truncate">
                                                {slotMeta.subtitle}
                                            </div>
                                        </div>
                                    </div>

                                    {activeSponsor ? (
                                        <div className="space-y-3 my-2">
                                            <div>
                                                <div className="text-base font-black text-white truncate">
                                                    {activeSponsor.name}
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-0.5 rounded border border-[var(--apex-gold)]/20 inline-block mt-1">
                                                    {getSectorLabel(activeSponsor.sector)}
                                                </span>
                                            </div>

                                            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 space-y-1.5 text-xs">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">Ingreso:</span>
                                                    <span className="font-bold text-emerald-400">{formatCurrencyShort(activeSponsor.weeklyIncome)}/sem</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">Vigencia:</span>
                                                    <span className="font-bold text-white">{activeSponsor.duration} semanas</span>
                                                </div>
                                            </div>

                                            {activeSponsor.clauses && activeSponsor.clauses.length > 0 && (
                                                <div className="text-[11px] text-slate-400 bg-white/5 p-2 rounded-lg border border-white/5 leading-tight">
                                                    <strong className="text-slate-200">Cláusula:</strong> {activeSponsor.clauses[0]}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center space-y-2">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Espacio Disponible
                                            </div>
                                            <button
                                                onClick={() => setSelectedSlotFilter(slotMeta.type)}
                                                className="px-3 py-1.5 bg-[var(--apex-gold)]/10 hover:bg-[var(--apex-gold)] text-[var(--apex-gold)] hover:text-black rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors border border-[var(--apex-gold)]/30 cursor-pointer"
                                            >
                                                Ver Ofertas
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {activeSponsor && (
                                    <button
                                        onClick={() => onRequestTermination(activeSponsor)}
                                        className="mt-4 w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        Rescindir Contrato
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Available Brand Offers Market */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[var(--apex-gold)]" />
                            Mercado de Propuestas Comerciales
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Evalúa marcas interesadas y negocia condiciones salariales o bonos iniciales.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Slot Filter Pills */}
                        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
                            {[
                                { key: 'all', label: 'Todos' },
                                { key: 'shirt', label: 'Camiseta' },
                                { key: 'kit', label: 'Indumentaria' },
                                { key: 'stadium', label: 'Estadio' },
                                { key: 'training', label: 'Manga' },
                            ].map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setSelectedSlotFilter(f.key as any)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                        selectedSlotFilter === f.key
                                            ? 'bg-white text-slate-950 shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Refresh Market Button */}
                        <button
                            onClick={onRefreshMarket}
                            title="Buscar nuevas marcas interesadas en el club"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-colors cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Renovar Mercado</span>
                        </button>
                    </div>
                </div>

                {filteredOffers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOffers.map(offer => (
                            <div
                                key={offer.id}
                                className="apex-card p-5 flex flex-col justify-between hover:border-[var(--apex-gold)]/40 transition-all duration-300 relative group"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)]">
                                                {offer.type === 'shirt' ? 'Frontal Camiseta' : offer.type === 'kit' ? 'Proveedor Técnico' : offer.type === 'stadium' ? 'Naming Estadio' : 'Manga & Instalaciones'}
                                            </span>
                                            <div className="text-base font-black text-white group-hover:text-[var(--apex-gold)] transition-colors">
                                                {offer.name}
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                                            {offer.prestige || 'Continental'}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                                        {offer.description || 'Acuerdo de patrocinio oficial con exposición en medios e indumentaria.'}
                                    </p>

                                    <div className="space-y-2 mb-4 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 font-medium">Fijo Semanal:</span>
                                            <span className="font-bold text-emerald-400 text-sm">{formatCurrency(offer.weeklyIncome)}/sem</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 font-medium">Bono de Bienvenida:</span>
                                            <span className="font-bold text-white">{formatCurrency(offer.signingBonus || offer.weeklyIncome * 4)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 font-medium">Duración:</span>
                                            <span className="font-bold text-white">{Math.floor((offer.duration || 52) / 52)} año(s) ({offer.duration || 52} sem)</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 mb-4">
                                        {(offer.fanApprovalImpact || 0) !== 0 && (
                                            <div className={`text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1.5 ${
                                                (offer.fanApprovalImpact || 0) > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {(offer.fanApprovalImpact || 0) > 0 ? '+' : ''}{offer.fanApprovalImpact}% Aprobación Socios ({offer.sector === 'betting' ? 'Polémica apuestas' : 'Arraigo popular'})
                                            </div>
                                        )}

                                        {offer.bonus && (
                                            <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg font-semibold">
                                                Bono deportivo: +{formatCurrencyShort(offer.bonus.amount)} al cumplir objetivo ({offer.bonus.condition})
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => onStartNegotiation(offer)}
                                    className="w-full py-2.5 rounded-xl bg-[var(--apex-gold)] hover:bg-[var(--apex-gold-light)] text-slate-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                                >
                                    <Handshake className="w-3.5 h-3.5" />
                                    Negociar Contrato
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="apex-card p-12 text-center border-dashed border-white/10 space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            No hay ofertas comerciales disponibles en este momento para la categoría seleccionada.
                        </p>
                        <button
                            onClick={onRefreshMarket}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            Explorar Nuevas Marcas
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});
