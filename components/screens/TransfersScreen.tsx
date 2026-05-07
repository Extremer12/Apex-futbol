import React, { useState } from 'react';
import { GameState, Player } from '../../types';
import { GameAction } from '../../state/reducer';
import { LoadingSpinner } from '../icons';
import { generateTransferNegotiationResponse, NegotiationResponse } from '../../services/gameLogic';
import { Modal } from '../ui/Modal';
import { TeamLogo } from '../../data/teams/helpers';
import { formatCurrencyShort } from '../../utils';

interface TransfersScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export const TransfersScreen: React.FC<TransfersScreenProps> = ({ gameState, dispatch }) => {
    const [filterName, setFilterName] = useState('');
    const [filterPos, setFilterPos] = useState<'ALL' | Player['position']>('ALL');
    const [negotiatingPlayer, setNegotiatingPlayer] = useState<Player | null>(null);
    const [offer, setOffer] = useState(0);
    const [negotiationHistory, setNegotiationHistory] = useState<Array<string | NegotiationResponse | { type: 'error', message: string }>>([]);
    const [isNegotiating, setIsNegotiating] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const { allTeams, team: myTeam, finances } = gameState;
    const allPlayers = allTeams.flatMap(t => t.squad);

    const availablePlayers = allPlayers
        .filter(p => !myTeam.squad.some(mp => mp.id === p.id))
        .filter(p => filterName === '' || p.name.toLowerCase().includes(filterName.toLowerCase()))
        .filter(p => filterPos === 'ALL' || p.position === filterPos);

    const getRatingDisplay = (player: Player) => {
        const scoutingLevel = gameState.scoutedPlayerIds[player.id] || 0;
        
        if (scoutingLevel >= 100) {
            return (
                <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'rgba(200,168,78,0.1)', border: '1px solid var(--apex-gold)' }}>
                    <span className="font-black text-[var(--apex-gold)]">{player.rating}</span>
                </div>
            );
        }

        const range = Math.max(1, Math.ceil(5 * (1 - scoutingLevel / 100)));
        const min = Math.max(1, player.rating - range);
        const max = Math.min(99, player.rating + range);

        return (
            <div className="flex flex-col items-center">
                <span className="font-bold text-white/50 text-xs">{min}-{max}</span>
                <div className="w-10 h-1 bg-black/50 rounded-full mt-1.5 overflow-hidden border border-white/5">
                    <div className="h-full bg-white/30" style={{ width: `${scoutingLevel}%` }}></div>
                </div>
            </div>
        );
    };

    const startNegotiation = (player: Player) => {
        setNegotiatingPlayer(player);
        setOffer(player.value);
        setNegotiationHistory([]);
        setAttempts(0);
    };

    const handleSendOffer = async () => {
        if (!negotiatingPlayer) return;
        setIsNegotiating(true);
        const sellingTeam = allTeams.find(t => t.squad.some(p => p.id === negotiatingPlayer.id))!;
        
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setNegotiationHistory(prev => [...prev, `Formal offer: £${offer}M`]);
        
        const response = await generateTransferNegotiationResponse(negotiatingPlayer, offer, myTeam, sellingTeam, newAttempts);
        setNegotiationHistory(prev => [...prev, response]);
        
        if (response.counterOffer) {
            setOffer(response.counterOffer);
        }
        setIsNegotiating(false);
    };

    const handleAcceptDeal = () => {
        if (!negotiatingPlayer) return;
        if (offer > finances.transferBudget) {
            setNegotiationHistory(prev => [...prev, { type: 'error', message: "Transfer cancelled. Exceeds budget." }]);
            return;
        }
        if (offer > finances.balance) {
            setNegotiationHistory(prev => [...prev, { type: 'error', message: "Transfer cancelled. Insufficient balance." }]);
            return;
        }
        dispatch({ type: 'SIGN_PLAYER', payload: { player: negotiatingPlayer, fee: offer } });
        setNegotiatingPlayer(null);
    }

    const isOfferInvalid = offer <= 0 || offer > finances.transferBudget;
    const lastHistoryItem = negotiationHistory.length > 0 ? negotiationHistory[negotiationHistory.length - 1] : null;
    const isOfferAccepted = !!(lastHistoryItem && typeof lastHistoryItem === 'object' && 'decision' in lastHistoryItem && lastHistoryItem.decision === 'accepted');
    const isNegotiationDead = !!(lastHistoryItem && typeof lastHistoryItem === 'object' && 'decision' in lastHistoryItem && lastHistoryItem.decision === 'rejected');

    return (
        <div className="p-4 md:p-6 space-y-6 pb-24 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-1">Global Transfer Network</h2>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Transfers</h1>
                </div>
                <div className="apex-card px-4 py-2 flex items-center gap-6">
                    <div>
                        <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest mb-0.5">Transfer Budget</p>
                        <p className="text-lg font-black text-[var(--apex-gold)]">£{formatCurrencyShort(finances.transferBudget * 1000000)}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                        <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest mb-0.5">Total Balance</p>
                        <p className="text-lg font-black text-white">£{formatCurrencyShort(finances.balance * 1000000)}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="apex-card p-3 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search player by name..." 
                        value={filterName} 
                        onChange={e => setFilterName(e.target.value)} 
                        className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-xs placeholder-white/30 focus:outline-none focus:border-[var(--apex-gold)] transition-colors" 
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {(['ALL', 'POR', 'DEF', 'CEN', 'DEL'] as const).map(pos => (
                        <button
                            key={pos}
                            onClick={() => setFilterPos(pos)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all flex-1 sm:flex-none ${
                                filterPos === pos 
                                    ? 'bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border border-[var(--apex-gold)]/50 shadow-[0_0_15px_rgba(200,168,78,0.2)]' 
                                    : 'bg-black/20 text-white/50 border border-white/5 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {pos === 'ALL' ? 'All' : pos}
                        </button>
                    ))}
                </div>
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availablePlayers.sort((a, b) => b.rating - a.rating).slice(0, 50).map(player => {
                    const playerTeam = allTeams.find(t => t.squad.some(p => p.id === player.id));
                    return (
                        <div key={player.id} className="group apex-card p-5 hover:border-[var(--apex-border-active)] transition-all duration-300">
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <h3 className="font-black text-base text-white leading-tight group-hover:text-[var(--apex-gold)] transition-colors mb-1">{player.name}</h3>
                                    <span className="text-[9px] font-bold text-white/50 tracking-widest uppercase">{player.position}</span>
                                </div>
                                <div className="w-10 h-10 flex-shrink-0 bg-white/5 rounded-lg p-1.5 border border-white/10 group-hover:scale-105 transition-transform">
                                    <TeamLogo team={playerTeam} />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-4">
                                    {getRatingDisplay(player)}
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider mb-0.5">Value</span>
                                        <span className="font-black text-white text-sm">£{player.value}M</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => startNegotiation(player)}
                                    className="w-10 h-10 rounded-full bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] flex items-center justify-center hover:bg-[var(--apex-gold)] hover:text-black transition-all"
                                    title="Start Negotiation"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Negotiation Modal */}
            {negotiatingPlayer && (
                <Modal title={`Transfer Talks: ${negotiatingPlayer.name}`} onClose={() => setNegotiatingPlayer(null)}>
                    <div className="flex flex-col h-[65vh] max-h-[600px] bg-gradient-to-b from-[#0f1423] to-[#0a0e17] rounded-xl overflow-hidden border border-white/10">
                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            <div className="text-center">
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">Negotiations Opened</span>
                            </div>
                            
                            {negotiationHistory.map((item, index) => {
                                if (typeof item === 'string') {
                                    // Our offer (Right side)
                                    return (
                                        <div key={index} className="flex justify-end animate-slide-up">
                                            <div className="bg-[var(--apex-gold)]/20 border border-[var(--apex-gold)]/30 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-lg">
                                                <p className="text-xs font-bold">{item}</p>
                                            </div>
                                        </div>
                                    );
                                }
                                if ('type' in item && item.type === 'error') {
                                    // System Error
                                    return (
                                        <div key={index} className="flex justify-center animate-fade-in">
                                            <div className="bg-[var(--apex-red)]/20 border border-[var(--apex-red)]/50 text-[var(--apex-red)] p-2 rounded-lg text-[10px] font-bold text-center uppercase tracking-wider">
                                                ⚠️ {item.message}
                                            </div>
                                        </div>
                                    );
                                }
                                
                                // Their response (Left side)
                                const negotiationItem = item as NegotiationResponse;
                                const isAccepted = negotiationItem.decision === 'accepted';
                                const isRejected = negotiationItem.decision === 'rejected';
                                
                                return (
                                    <div key={index} className="flex justify-start animate-slide-up">
                                        <div className={`p-4 rounded-2xl rounded-tl-sm max-w-[85%] shadow-lg border ${
                                            isAccepted ? 'bg-[var(--apex-green)]/10 border-[var(--apex-green)]/30' : 
                                            isRejected ? 'bg-[var(--apex-red)]/10 border-[var(--apex-red)]/30' : 
                                            'bg-white/5 border-white/10'
                                        }`}>
                                            <p className="text-[9px] font-bold text-white/50 mb-1.5 uppercase tracking-widest">
                                                Rival Director
                                            </p>
                                            <p className={`text-xs leading-relaxed font-medium ${isAccepted ? 'text-[var(--apex-green)]' : isRejected ? 'text-[var(--apex-red)]' : 'text-white/90'}`}>
                                                "{negotiationItem.message}"
                                            </p>
                                            {negotiationItem.decision === 'counter' && (
                                                <div className="mt-3 inline-block bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Counter Offer: </span>
                                                    <span className="font-black text-[var(--apex-gold)] text-sm">£{negotiationItem.counterOffer}M</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="bg-black/50 border-t border-white/10 p-5">
                            {isOfferAccepted ? (
                                <button onClick={handleAcceptDeal} className="w-full bg-[var(--apex-green)] text-black font-black py-4 rounded-xl hover:bg-[#1f965d] transition-colors shadow-[0_0_20px_rgba(46,204,113,0.3)] text-xs uppercase tracking-widest">
                                    SIGN PLAYER NOW
                                </button>
                            ) : isNegotiationDead ? (
                                <button onClick={() => setNegotiatingPlayer(null)} className="w-full bg-white/5 text-white/50 font-bold py-4 rounded-xl hover:bg-white/10 transition-colors text-xs uppercase tracking-widest border border-white/10">
                                    Close Negotiations
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex gap-3 items-center">
                                        <div className="flex-1 relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--apex-gold)] font-black">£</span>
                                            <input 
                                                type="number" 
                                                value={offer} 
                                                onChange={e => setOffer(Number(e.target.value))} 
                                                className="w-full pl-8 pr-12 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white font-black text-sm focus:outline-none focus:border-[var(--apex-gold)] transition-colors" 
                                                disabled={isNegotiating}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--apex-gold)] font-black">M</span>
                                        </div>
                                        <button 
                                            onClick={handleSendOffer} 
                                            disabled={isNegotiating || isOfferInvalid} 
                                            className="apex-btn-gold px-6 py-3.5 !w-auto"
                                        >
                                            {isNegotiating ? <LoadingSpinner /> : 'SEND'}
                                        </button>
                                    </div>
                                    {offer > finances.transferBudget && <p className="text-[10px] text-[var(--apex-red)] text-center font-bold uppercase tracking-widest">Budget exceeded. Max: £{finances.transferBudget.toFixed(1)}M</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
