import React from 'react';
import { Player, SquadRole } from '../../../types';
import { LoadingSpinner } from '../../icons';
import { formatWeeklyWage, formatCurrency } from '../../../utils';

export interface AgentChatMessage {
    sender: 'user' | 'agent' | 'system';
    text: string;
}

interface ContractNegotiationModalProps {
    negotiatingPlayer: Player;
    agreedFee: number | null;
    offeredWage: number;
    setOfferedWage: (wage: number) => void;
    offeredYears: number;
    setOfferedYears: (years: number) => void;
    offeredRole: SquadRole;
    setOfferedRole: (role: SquadRole) => void;
    offeredBonus: number;
    setOfferedBonus: (bonus: number) => void;
    agentChatHistory: AgentChatMessage[];
    isAgentNegotiating: boolean;
    isContractAgreed: boolean;
    isNegotiationDead: boolean;
    onSendAgentOffer: () => void;
    onFinalizeSigning: () => void;
    onClose: () => void;
}

export const ContractNegotiationModal: React.FC<ContractNegotiationModalProps> = ({
    negotiatingPlayer,
    agreedFee,
    offeredWage,
    setOfferedWage,
    offeredYears,
    setOfferedYears,
    offeredRole,
    setOfferedRole,
    offeredBonus,
    setOfferedBonus,
    agentChatHistory,
    isAgentNegotiating,
    isContractAgreed,
    isNegotiationDead,
    onSendAgentOffer,
    onFinalizeSigning,
    onClose,
}) => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {agentChatHistory.map((msg, i) => {
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
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-400 uppercase tracking-wider">
                                    <span>Agente de {negotiatingPlayer.name}</span>
                                </div>
                                <p className="text-xs font-medium leading-relaxed">"{msg.text}"</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Contract Sliders / Inputs */}
            <div className="p-4 bg-black/70 border-t border-white/10 space-y-3">
                {isContractAgreed ? (
                    <div className="space-y-3 animate-fade-in">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-center">
                            <h4 className="text-emerald-400 font-black uppercase text-xs">¡Acuerdo Total Alcanzado!</h4>
                            <p className="text-white/70 text-[11px]">
                                Traspaso: {agreedFee ? formatCurrency(agreedFee) : 'Libre'} • Salario: {formatWeeklyWage(offeredWage)} • Duración: {offeredYears} años
                            </p>
                        </div>
                        <button
                            onClick={onFinalizeSigning}
                            className="w-full py-4 bg-emerald-500 text-black font-black rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-400 shadow-xl shadow-emerald-500/20"
                        >
                            Cerrar Fichaje y Firmar Contrato
                        </button>
                    </div>
                ) : isNegotiationDead ? (
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/20"
                    >
                        Cerrar Negociaciones
                    </button>
                ) : (
                    <div className="space-y-3">
                        {/* Summary Pill */}
                        <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-bold">Salario Anual Estimado:</span>
                            <span className="font-black text-amber-300">€{((offeredWage * 52) / 1_000_000).toFixed(2)}M/año</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Wage Input */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-wider">
                                        Salario Semanal
                                    </label>
                                    <span className="text-xs font-black text-emerald-400">
                                        {formatWeeklyWage(offeredWage)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setOfferedWage(Math.max(5000, offeredWage - 10000))}
                                        className="px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white border border-white/5 cursor-pointer"
                                    >
                                        -10K
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOfferedWage(Math.max(5000, offeredWage - 5000))}
                                        className="px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white border border-white/5 cursor-pointer"
                                    >
                                        -5K
                                    </button>
                                    <input 
                                        type="number"
                                        step="1"
                                        value={Math.round(offeredWage / 1000)}
                                        onChange={e => setOfferedWage(Math.max(1000, Number(e.target.value) * 1000))}
                                        className="flex-1 px-2 py-1.5 bg-black/50 border border-white/10 rounded-lg text-white font-black text-xs text-center focus:outline-none focus:border-[var(--apex-gold)]"
                                    />
                                    <span className="text-[10px] font-bold text-slate-400">K/sem</span>
                                    <button
                                        type="button"
                                        onClick={() => setOfferedWage(offeredWage + 5000)}
                                        className="px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white border border-white/5 cursor-pointer"
                                    >
                                        +5K
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOfferedWage(offeredWage + 10000)}
                                        className="px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white border border-white/5 cursor-pointer"
                                    >
                                        +10K
                                    </button>
                                </div>
                            </div>

                            {/* Contract Years */}
                            <div>
                                <label className="text-[9px] font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                                    Duración del Contrato
                                </label>
                                <div className="grid grid-cols-5 gap-1">
                                    {[1, 2, 3, 4, 5].map(yr => (
                                        <button
                                            key={yr}
                                            type="button"
                                            onClick={() => setOfferedYears(yr)}
                                            className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                                offeredYears === yr
                                                    ? 'bg-[var(--apex-gold)] text-black shadow-md'
                                                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                                            }`}
                                        >
                                            {yr}a
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Squad Role */}
                            <div>
                                <label className="text-[9px] font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                                    Rol en el Equipo
                                </label>
                                <select
                                    value={offeredRole}
                                    onChange={e => setOfferedRole(e.target.value as SquadRole)}
                                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-black text-xs focus:outline-none focus:border-[var(--apex-gold)] cursor-pointer"
                                >
                                    <option value="Key" className="bg-slate-900">Jugador Clave</option>
                                    <option value="FirstTeam" className="bg-slate-900">Titular Habitual</option>
                                    <option value="Rotation" className="bg-slate-900">Rotación</option>
                                    <option value="Prospect" className="bg-slate-900">Joven Promesa</option>
                                </select>
                            </div>

                            {/* Signing Bonus */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-wider">
                                        Prima de Fichaje
                                    </label>
                                    <span className="text-xs font-black text-amber-300">
                                        {offeredBonus > 0 ? formatCurrency(offeredBonus * 1_000_000) : 'Sin Prima'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[0, 0.5, 1.0, 2.0].map(b => (
                                        <button
                                            key={b}
                                            type="button"
                                            onClick={() => setOfferedBonus(b)}
                                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                                offeredBonus === b
                                                    ? 'bg-amber-400 text-black shadow-md'
                                                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                                            }`}
                                        >
                                            {b === 0 ? 'Sin Prima' : formatCurrency(b * 1_000_000)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onSendAgentOffer}
                            disabled={isAgentNegotiating || offeredWage <= 0}
                            className="w-full py-3.5 bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black rounded-xl text-xs uppercase tracking-wider disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer active:scale-98 shadow-lg shadow-[var(--apex-gold)]/20"
                        >
                            {isAgentNegotiating ? <LoadingSpinner /> : `ENVIAR OFERTA (${formatWeeklyWage(offeredWage)})`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
