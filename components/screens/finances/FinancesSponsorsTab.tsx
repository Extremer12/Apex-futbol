import React, { useState, useMemo } from 'react';
import { Sponsor } from '../../../types';
import { formatCurrencyShort } from '../../../utils';
import { SPONSOR_SLOTS, getSectorLabel } from './financesUiTypes';
import { Handshake, RefreshCw, ChevronRight } from 'lucide-react';
import { EmptyState } from '../transfers/TransferUI';

interface FinancesSponsorsTabProps {
    sponsors: Sponsor[];
    availableSponsors: Sponsor[];
    onStartNegotiation: (sponsor: Sponsor) => void;
    onRequestTermination: (sponsor: Sponsor) => void;
    onRefreshMarket: () => void;
}

const SLOT_FILTERS: { key: Sponsor['type'] | 'all'; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'shirt', label: 'Camiseta' },
    { key: 'kit', label: 'Indumentaria' },
    { key: 'stadium', label: 'Estadio' },
    { key: 'training', label: 'Manga' },
];

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
        <div className="space-y-5">
            {/* 4 Active Commercial Slots */}
            <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Espacios del Club ({sponsors.length}/4 cubiertos)
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SPONSOR_SLOTS.map(slotMeta => {
                        const activeSponsor = sponsors.find(s => s.type === slotMeta.type);
                        const IconComponent = slotMeta.icon;

                        return (
                            <div
                                key={slotMeta.type}
                                className="apex-card p-3.5 rounded-2xl flex items-center justify-between gap-3 border-l-2"
                                style={{ borderLeftColor: activeSponsor ? (activeSponsor.brandColor || slotMeta.accentColor) : 'rgba(255,255,255,0.1)' }}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-slate-300">
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                                            {slotMeta.title}
                                        </div>
                                        {activeSponsor ? (
                                            <>
                                                <div className="text-sm font-black text-white truncate">{activeSponsor.name}</div>
                                                <div className="text-[11px] text-emerald-400 font-bold">
                                                    {formatCurrencyShort(activeSponsor.weeklyIncome)}/sem · {activeSponsor.duration} sem
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xs font-bold text-slate-500">Espacio disponible</div>
                                        )}
                                    </div>
                                </div>

                                {activeSponsor ? (
                                    <button
                                        onClick={() => onRequestTermination(activeSponsor)}
                                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer"
                                    >
                                        Rescindir
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setSelectedSlotFilter(slotMeta.type)}
                                        className="px-2.5 py-1.5 rounded-xl bg-[var(--apex-gold)]/10 hover:bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer"
                                    >
                                        Ver ofertas
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Available Market Offers */}
            <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Propuestas Comerciales ({filteredOffers.length})
                    </h3>
                    <button
                        onClick={onRefreshMarket}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-bold cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Renovar mercado</span>
                    </button>
                </div>

                {/* Slot Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {SLOT_FILTERS.map(f => {
                        const active = selectedSlotFilter === f.key;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setSelectedSlotFilter(f.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                    active
                                        ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                        : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                {filteredOffers.length > 0 ? (
                    <div className="space-y-2">
                        {filteredOffers.map(offer => {
                            const slotLabel =
                                offer.type === 'shirt' ? 'Camiseta' :
                                offer.type === 'kit' ? 'Indumentaria' :
                                offer.type === 'stadium' ? 'Estadio' : 'Manga';
                            return (
                                <button
                                    key={offer.id}
                                    onClick={() => onStartNegotiation(offer)}
                                    className="w-full apex-card p-3.5 rounded-2xl flex items-center justify-between gap-3 text-left hover:border-[var(--apex-gold)]/40 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-base shrink-0"
                                            style={{ color: offer.brandColor || '#C8A84E' }}
                                        >
                                            {offer.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-white group-hover:text-[var(--apex-gold)] truncate">
                                                    {offer.name}
                                                </span>
                                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">
                                                    {slotLabel}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                                {getSectorLabel(offer.sector)} · Bono {formatCurrencyShort(offer.signingBonus || offer.weeklyIncome * 4)} · {offer.duration || 52} sem
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right">
                                            <div className="text-sm font-black text-emerald-400 tabular-nums">
                                                {formatCurrencyShort(offer.weeklyIncome)}
                                            </div>
                                            <div className="text-[9px] text-slate-500 font-bold uppercase">/sem</div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="apex-card rounded-2xl">
                        <EmptyState
                            icon={<Handshake className="w-6 h-6" />}
                            title="Sin propuestas en esta categoría"
                            text="Prueba otro filtro o renueva el mercado para recibir nuevas marcas interesadas."
                            action={
                                <button
                                    onClick={onRefreshMarket}
                                    className="px-4 py-2 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                    Renovar mercado
                                </button>
                            }
                        />
                    </div>
                )}
            </section>
        </div>
    );
});
