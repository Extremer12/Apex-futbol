import React from 'react';
import { Team, Player } from '../../../../types';
import { ClubChatMessage } from '../ClubNegotiationModal';
import { AgentChatMessage } from '../ContractNegotiationModal';
import { Building2, UserCheck } from 'lucide-react';
import { formatCurrency } from '../../../../utils';

interface NegotiationChatFeedProps {
    negotiationPhase: 'CLUB' | 'CONTRACT';
    clubChatHistory: ClubChatMessage[];
    agentChatHistory: AgentChatMessage[];
    sellingTeam?: Team;
    negotiatingPlayer: Player;
    chatScrollRef: React.RefObject<HTMLDivElement | null>;
}

export const NegotiationChatFeed: React.FC<NegotiationChatFeedProps> = React.memo(({
    negotiationPhase,
    clubChatHistory,
    agentChatHistory,
    sellingTeam,
    negotiatingPlayer,
    chatScrollRef
}) => {
    return (
        <div 
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar min-h-0"
        >
            {negotiationPhase === 'CLUB' ? (
                clubChatHistory.map((msg, idx) => (
                    <div 
                        key={idx} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'} animate-fade-in`}
                    >
                        {msg.sender === 'system' ? (
                            <div className="text-[11px] font-semibold text-white/60 bg-white/[0.04] border border-white/5 px-3.5 py-1.5 rounded-full text-center max-w-[90%]">
                                {msg.text}
                            </div>
                        ) : msg.sender === 'user' ? (
                            <div className="bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 text-black font-black px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] sm:max-w-[70%] text-xs shadow-lg">
                                <div className="text-[9px] text-black/60 uppercase font-bold mb-0.5 tracking-wider">Tu Propuesta Presidencial</div>
                                {msg.text}
                            </div>
                        ) : (
                            <div className="bg-slate-900/90 border border-white/15 p-4 rounded-2xl rounded-tl-xs max-w-[90%] sm:max-w-[80%] text-white shadow-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-[var(--apex-gold)] uppercase tracking-wider flex items-center gap-1.5">
                                        <Building2 className="w-3 h-3" />
                                        Respuesta del {sellingTeam?.name || 'Club'}
                                    </span>
                                </div>
                                <p className="text-xs font-medium leading-relaxed text-slate-200">
                                    "{msg.text}"
                                </p>
                                {msg.counter && (
                                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs bg-black/30 -mx-4 -mb-4 p-3 rounded-b-2xl">
                                        <span className="text-white/60 text-[11px] font-bold">Exigencia mínima del club:</span>
                                        <span className="font-black text-[var(--apex-gold)] text-sm">{formatCurrency(msg.counter)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                agentChatHistory.map((msg, idx) => (
                    <div 
                        key={idx} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'} animate-fade-in`}
                    >
                        {msg.sender === 'system' ? (
                            <div className="text-[11px] font-semibold text-white/60 bg-white/[0.04] border border-white/5 px-3.5 py-1.5 rounded-full text-center max-w-[90%]">
                                {msg.text}
                            </div>
                        ) : msg.sender === 'user' ? (
                            <div className="bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 text-black font-black px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] sm:max-w-[70%] text-xs shadow-lg">
                                <div className="text-[9px] text-black/60 uppercase font-bold mb-0.5 tracking-wider">Oferta Contractual Presentada</div>
                                {msg.text}
                            </div>
                        ) : (
                            <div className="bg-slate-900/90 border border-white/15 p-4 rounded-2xl rounded-tl-xs max-w-[90%] sm:max-w-[80%] text-white shadow-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <UserCheck className="w-3 h-3" />
                                        Representante Oficial
                                    </span>
                                </div>
                                <p className="text-xs font-medium leading-relaxed text-slate-200">
                                    "{msg.text}"
                                </p>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
});
