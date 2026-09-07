import React from 'react';
import { Player } from '../../../types';
import { LoadingSpinner } from '../../icons';
import { ArrowRight } from 'lucide-react';

export interface ClubChatMessage {
    sender: 'user' | 'rival' | 'system';
    text: string;
    counter?: number;
}

interface ClubNegotiationModalProps {
    negotiatingPlayer: Player;
    transferBudget: number;
    clubOfferFee: number;
    setClubOfferFee: React.Dispatch<React.SetStateAction<number>>;
    clubChatHistory: ClubChatMessage[];
    isClubNegotiating: boolean;
    isNegotiationDead: boolean;
    agreedFee: number | null;
    onSendClubOffer: () => void;
    onProceedToContract: () => void;
    onClose: () => void;
}

export const ClubNegotiationModal: React.FC<ClubNegotiationModalProps> = ({
    negotiatingPlayer,
    transferBudget,
    clubOfferFee,
    setClubOfferFee,
    clubChatHistory,
    isClubNegotiating,
    isNegotiationDead,
    agreedFee,
    onSendClubOffer,
    onProceedToContract,
    onClose,
}) => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {clubChatHistory.map((msg, i) => {
                    if (msg.sender === 'system') {
                        return (
                            <div key={i} className="flex justify-center">
                                <span className="text-[10px] font-bold text-white/50 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-center">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }
                    if (msg.sender === 'user') {
                        return (
                            <div key={i} className="flex justify-end animate-slide-up">
                                <div className="bg-[var(--apex-gold)] text-black font-black p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-xs shadow-lg">
                                    {msg.text}
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div key={i} className="flex justify-start animate-slide-up">
                            <div className="bg-slate-800/80 border border-white/10 p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] text-white shadow-lg space-y-1">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-[var(--apex-gold)] uppercase tracking-wider">
                                    <span>Director Deportivo Rival</span>
                                </div>
                                <p className="text-xs font-medium leading-relaxed">"{msg.text}"</p>
                                {msg.counter && (
                                    <div className="mt-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 flex items-center justify-between text-xs">
                                        <span className="text-white/60 font-bold">Petición mínima:</span>
                                        <span className="font-black text-[var(--apex-gold)]">€{msg.counter}M</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="p-4 bg-black/60 border-t border-white/10 space-y-3">
                {isNegotiationDead ? (
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/20"
                    >
                        Cerrar Negociaciones
                    </button>
                ) : agreedFee !== null ? (
                    <button
                        onClick={onProceedToContract}
                        className="w-full py-3.5 bg-emerald-500 text-black font-black rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        Continuar a Términos Contractuales <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-[var(--apex-gold)]">€</span>
                                <input 
                                    type="number" 
                                    step="0.5"
                                    value={clubOfferFee} 
                                    onChange={e => setClubOfferFee(Number(e.target.value))}
                                    className="w-full pl-8 pr-12 py-3 bg-black/50 border border-white/10 rounded-xl text-white font-black text-sm focus:outline-none focus:border-[var(--apex-gold)]"
                                    disabled={isClubNegotiating}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-black text-[var(--apex-gold)]">M</span>
                            </div>
                            <button
                                onClick={onSendClubOffer}
                                disabled={isClubNegotiating || clubOfferFee <= 0 || clubOfferFee > transferBudget}
                                className="px-6 py-3 bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black rounded-xl text-xs uppercase tracking-wider disabled:opacity-40 transition-all flex items-center justify-center min-w-[100px]"
                            >
                                {isClubNegotiating ? <LoadingSpinner /> : 'OFERTAR'}
                            </button>
                        </div>

                        {/* Quick Increment Buttons */}
                        <div className="flex items-center gap-2">
                            {[0.5, 1.0, 5.0, 10.0].map(inc => (
                                <button
                                    key={inc}
                                    onClick={() => setClubOfferFee(prev => Math.round((prev + inc) * 10) / 10)}
                                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white/70 border border-white/5"
                                >
                                    +€{inc}M
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
