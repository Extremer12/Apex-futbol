import React from 'react';
import { Player, SquadRole } from '../../../types';
import { LoadingSpinner } from '../../icons';
import { formatWeeklyWage } from '../../../utils';

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
                                Traspaso: €{agreedFee}M • Salario: {formatWeeklyWage(offeredWage)}/sem • Duración: {offeredYears} años
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
                        <div className="grid grid-cols-2 gap-3">
                            {/* Wage Input */}
                            <div>
                                <label className="text-[9px] font-black text-white/60 uppercase tracking-wider block mb-1">
                                    Salario Semanal (€/sem)
                                </label>
                                <input 
                                    type="number"
                                    step="1000"
                                    value={offeredWage}
                                    onChange={e => setOfferedWage(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-black text-xs focus:outline-none focus:border-[var(--apex-gold)]"
                                />
                            </div>

                            {/* Contract Years */}
                            <div>
                                <label className="text-[9px] font-black text-white/60 uppercase tracking-wider block mb-1">
                                    Duración del Contrato
                                </label>
                                <select
                                    value={offeredYears}
                                    onChange={e => setOfferedYears(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-black text-xs focus:outline-none focus:border-[var(--apex-gold)]"
                                >
                                    <option value={1}>1 Año</option>
                                    <option value={2}>2 Años</option>
                                    <option value={3}>3 Años</option>
                                    <option value={4}>4 Años</option>
                                    <option value={5}>5 Años</option>
                                </select>
                            </div>

                            {/* Squad Role */}
                            <div>
                                <label className="text-[9px] font-black text-white/60 uppercase tracking-wider block mb-1">
                                    Rol en el Equipo
                                </label>
                                <select
                                    value={offeredRole}
                                    onChange={e => setOfferedRole(e.target.value as SquadRole)}
                                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-black text-xs focus:outline-none focus:border-[var(--apex-gold)]"
                                >
                                    <option value="Key">⭐ Jugador Clave</option>
                                    <option value="FirstTeam">⚽ Titular Habitual</option>
                                    <option value="Rotation">🔄 Rotación</option>
                                    <option value="Prospect">🌱 Joven Promesa</option>
                                </select>
                            </div>

                            {/* Signing Bonus */}
                            <div>
                                <label className="text-[9px] font-black text-white/60 uppercase tracking-wider block mb-1">
                                    Prima de Fichaje (€M)
                                </label>
                                <input 
                                    type="number"
                                    step="0.1"
                                    value={offeredBonus}
                                    onChange={e => setOfferedBonus(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-black text-xs focus:outline-none focus:border-[var(--apex-gold)]"
                                />
                            </div>
                        </div>

                        <button
                            onClick={onSendAgentOffer}
                            disabled={isAgentNegotiating || offeredWage <= 0}
                            className="w-full py-3 bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black rounded-xl text-xs uppercase tracking-wider disabled:opacity-40 transition-all flex items-center justify-center"
                        >
                            {isAgentNegotiating ? <LoadingSpinner /> : 'ENVIAR PROPUESTA AL AGENTE'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
