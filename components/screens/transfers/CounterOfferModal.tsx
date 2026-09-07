import React from 'react';
import { Player, Offer, Team } from '../../../types';
import { LoadingSpinner } from '../../icons';
import { Modal } from '../../ui/Modal';

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
    return (
        <Modal 
            title={`Contraoferta: ${data.player.name}`} 
            onClose={onClose}
        >
            <div className="space-y-4 p-2">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-white/5 space-y-2">
                    <p className="text-xs text-white/70">
                        El <strong className="text-white">{data.buyer.name}</strong> ofreció inicialmente <strong className="text-emerald-400">€{data.offer.offerValue}M</strong> por {data.player.name}.
                    </p>
                    <p className="text-[11px] text-white/50">
                        Introduce la cantidad que exigirías para aceptar el traspaso inmediato.
                    </p>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-white/60 uppercase tracking-wider block">
                        Tu Contrapropuesta (€M)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--apex-gold)]">€</span>
                        <input 
                            type="number" 
                            step="0.5"
                            value={counterValue} 
                            onChange={e => setCounterValue(Number(e.target.value))}
                            className="w-full pl-8 pr-12 py-3 bg-black/50 border border-white/10 rounded-xl text-white font-black text-sm focus:outline-none focus:border-[var(--apex-gold)]"
                            disabled={isEvaluatingCounter}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[var(--apex-gold)]">M</span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 font-bold text-xs uppercase tracking-wider"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSendCounterToBuyer}
                        disabled={isEvaluatingCounter || counterValue <= 0}
                        className="flex-1 py-3 rounded-xl bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider disabled:opacity-40 flex items-center justify-center"
                    >
                        {isEvaluatingCounter ? <LoadingSpinner /> : 'ENVIAR AL CLUB'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
