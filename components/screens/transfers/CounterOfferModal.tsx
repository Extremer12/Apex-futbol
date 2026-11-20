import React from 'react';
import { Player, Offer, Team } from '../../../types';
import { LoadingSpinner } from '../../icons';
import { Modal } from '../../ui/Modal';
import { formatTransferFee, normalizeMonetaryValue } from '../../../utils';

interface CounterOfferModalProps {
    data: { offer: Offer; player: Player; buyer: Team };
    counterValue: number;
    setCounterValue: React.Dispatch<React.SetStateAction<number>>;
    isEvaluatingCounter: boolean;
    onSendCounterToBuyer: () => void;
    onClose: () => void;
}

export const CounterOfferModal: React.FC<CounterOfferModalProps> = ({
    data,
    counterValue,
    setCounterValue,
    isEvaluatingCounter,
    onSendCounterToBuyer,
    onClose,
}) => {
    const rawInitialOffer = normalizeMonetaryValue(data.offer.offerValue);
    const displayMillions = Number((counterValue / 1_000_000).toFixed(2));

    const setPercentageAbove = (percent: number) => {
        const calculated = Math.round((rawInitialOffer * (1 + percent / 100)) / 100_000) * 100_000;
        setCounterValue(calculated);
    };

    return (
        <Modal 
            title={`Contraoferta: ${data.player.name}`} 
            onClose={onClose}
        >
            <div className="space-y-4 p-2">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-white/5 space-y-2">
                    <p className="text-xs text-white/70">
                        El <strong className="text-white">{data.buyer.name}</strong> ofreció inicialmente <strong className="text-emerald-400">{formatTransferFee(data.offer.offerValue)}</strong> por {data.player.name}.
                    </p>
                    <p className="text-[11px] text-white/50">
                        Selecciona un incremento porcentual o introduce la cantidad exacta requerida para aceptar la venta.
                    </p>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5">
                    {[
                        { label: '+10%', val: 10 },
                        { label: '+20%', val: 20 },
                        { label: '+35%', val: 35 },
                        { label: '+50%', val: 50 },
                    ].map(p => (
                        <button
                            key={p.label}
                            type="button"
                            onClick={() => setPercentageAbove(p.val)}
                            className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/5 cursor-pointer active:scale-95 transition-all"
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-white/60 uppercase tracking-wider block">
                        Tu Contrapropuesta
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--apex-gold)]">€</span>
                        <input 
                            type="number" 
                            step="0.5"
                            min="0.1"
                            value={displayMillions} 
                            onChange={e => setCounterValue(Math.max(100_000, Math.round(Number(e.target.value) * 1_000_000)))}
                            className="w-full pl-8 pr-12 py-3 bg-black/50 border border-white/10 rounded-xl text-white font-black text-sm focus:outline-none focus:border-[var(--apex-gold)]"
                            disabled={isEvaluatingCounter}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[var(--apex-gold)]">M</span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSendCounterToBuyer}
                        disabled={isEvaluatingCounter || counterValue <= 0}
                        className="flex-1 py-3 rounded-xl bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-98"
                    >
                        {isEvaluatingCounter ? <LoadingSpinner /> : `ENVIAR (${formatTransferFee(counterValue)})`}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
