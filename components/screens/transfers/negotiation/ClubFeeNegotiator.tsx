import React from 'react';
import { LoadingSpinner } from '../../../icons';
import { formatCurrency } from '../../../../utils';
import { Building2, ArrowRight, Check } from 'lucide-react';

interface ClubFeeNegotiatorProps {
    activeOfferFee: number;
    normMarketValue: number;
    normBudget: number;
    normBalance: number;
    maxAllowedFee: number;
    valueRatio: number;
    isFeeAffordable: boolean;
    isClubNegotiating: boolean;
    agreedFee: number | null;
    remainingBudgetAfterFee: number;
    remainingBalanceAfterFee: number;
    setClubOfferFee: React.Dispatch<React.SetStateAction<number>>;
    adjustFee: (delta: number) => void;
    onSendClubOffer: () => void;
    onProceedToContract: () => void;
}

export const ClubFeeNegotiator: React.FC<ClubFeeNegotiatorProps> = React.memo(({
    activeOfferFee,
    normMarketValue,
    normBudget,
    normBalance,
    maxAllowedFee,
    valueRatio,
    isFeeAffordable,
    isClubNegotiating,
    agreedFee,
    remainingBudgetAfterFee,
    remainingBalanceAfterFee,
    setClubOfferFee,
    adjustFee,
    onSendClubOffer,
    onProceedToContract
}) => {
    if (agreedFee !== null) {
        return (
            <div className="space-y-3.5 animate-fade-in">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Traspaso Acordado con el Club</h4>
                            <p className="text-[11px] text-white/70">Monto pactado: <strong className="text-white">{formatCurrency(agreedFee)}</strong></p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onProceedToContract}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                >
                    <span>Avanzar a la Negociación de Contrato del Jugador</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Proposal Header & Ratio Tag */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Propuesta de Traspaso</span>
                    <span className="text-lg sm:text-xl font-black text-[var(--apex-gold)] tracking-tight">
                        {formatCurrency(activeOfferFee)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                        valueRatio >= 110 
                            ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30' 
                            : valueRatio >= 90 
                                ? 'text-[var(--apex-gold)] bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/30' 
                                : 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
                    }`}>
                        {valueRatio}% del Valor de Mercado
                    </span>
                </div>
            </div>

            {/* Slider with proper min/max/step */}
            <input
                type="range"
                min={Math.max(500_000, Math.round(normMarketValue * 0.2))}
                max={maxAllowedFee}
                step={500_000}
                value={activeOfferFee}
                onChange={e => setClubOfferFee(Number(e.target.value))}
                className="w-full accent-[var(--apex-gold)] cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                disabled={isClubNegotiating}
            />

            {/* Ergonomic Quick Stepper & Preset Buttons */}
            <div className="grid grid-cols-5 gap-1.5">
                <button
                    type="button"
                    onClick={() => adjustFee(-5_000_000)}
                    className="py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                >
                    -5M
                </button>
                <button
                    type="button"
                    onClick={() => adjustFee(-1_000_000)}
                    className="py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                >
                    -1M
                </button>
                <button
                    type="button"
                    onClick={() => setClubOfferFee(normMarketValue)}
                    className="py-1.5 bg-[var(--apex-gold)]/10 hover:bg-[var(--apex-gold)]/20 rounded-lg text-[11px] font-black text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 cursor-pointer active:scale-95 truncate px-1"
                >
                    100% Valor
                </button>
                <button
                    type="button"
                    onClick={() => adjustFee(1_000_000)}
                    className="py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                >
                    +1M
                </button>
                <button
                    type="button"
                    onClick={() => adjustFee(5_000_000)}
                    className="py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                >
                    +5M
                </button>
            </div>

            {/* Budget & Treasury Impact Indicator */}
            <div className="space-y-1.5 px-1">
                {activeOfferFee <= normBudget ? (
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-white/40">Presupuesto restante tras traspaso:</span>
                        <span className="font-black text-emerald-400">
                            {formatCurrency(remainingBudgetAfterFee)}
                        </span>
                    </div>
                ) : activeOfferFee <= normBalance ? (
                    <div className="space-y-1.5 pt-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-white/40">Presupuesto asignado ({formatCurrency(normBudget)}):</span>
                            <span className="font-black text-white/70">Agotado (100%)</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-amber-400 font-bold">Aporte adicional de Tesorería:</span>
                            <span className="font-black text-amber-400">
                                +{formatCurrency(activeOfferFee - normBudget)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-white/40">Saldo club restante:</span>
                            <span className="font-black text-emerald-400">
                                {formatCurrency(remainingBalanceAfterFee)}
                            </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/20 text-[10px] text-[var(--apex-gold)] font-bold flex items-center gap-1.5">
                            <span>👑 Autorización Presidencial: Fondos cubiertos por la tesorería del club.</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-rose-400 font-bold">Supera el saldo total en tesorería ({formatCurrency(normBalance)}):</span>
                        <span className="font-black text-rose-400">
                            {formatCurrency(remainingBalanceAfterFee)}
                        </span>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={onSendClubOffer}
                disabled={isClubNegotiating || activeOfferFee <= 0 || !isFeeAffordable}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[var(--apex-gold)]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
                {isClubNegotiating ? <LoadingSpinner /> : (
                    <>
                        <Building2 className="w-4 h-4" />
                        <span>Presentar Oferta Formal de {formatCurrency(activeOfferFee)}</span>
                    </>
                )}
            </button>
        </div>
    );
});
