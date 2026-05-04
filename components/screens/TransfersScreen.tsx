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
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <span className="font-black text-emerald-400">{player.rating}</span>
                </div>
            );
        }

        const range = Math.max(1, Math.ceil(5 * (1 - scoutingLevel / 100)));
        const min = Math.max(1, player.rating - range);
        const max = Math.min(99, player.rating + range);

        return (
            <div className="flex flex-col items-center">
                <span className="font-bold text-slate-400 text-sm">{min}-{max}</span>
                <div className="w-10 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-slate-500" style={{ width: `${scoutingLevel}%` }}></div>
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
        setNegotiationHistory(prev => [...prev, `Oferta formal: £${offer}M`]);
        
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
            setNegotiationHistory(prev => [...prev, { type: 'error', message: "Fichaje cancelado. Supera el presupuesto." }]);
            return;
        }
        if (offer > finances.balance) {
            setNegotiationHistory(prev => [...prev, { type: 'error', message: "Fichaje cancelado. Balance insuficiente." }]);
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
        <div className="min-h-screen bg-[#020617] p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-sm font-black text-blue-500 tracking-[0.3em] uppercase mb-1">Global Transfer Network</h2>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Mercado de Fichajes</h1>
                </div>
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex gap-6">
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Presupuesto</p>
                        <p className="text-xl font-black text-emerald-400">£{formatCurrencyShort(finances.transferBudget * 1000000)}</p>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Balance Total</p>
                        <p className="text-xl font-black text-white">£{formatCurrencyShort(finances.balance * 1000000)}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Buscar jugador por nombre..." 
                        value={filterName} 
                        onChange={e => setFilterName(e.target.value)} 
                        className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" 
                    />
                </div>
                <div className="flex gap-2">
                    {(['ALL', 'POR', 'DEF', 'CEN', 'DEL'] as const).map(pos => (
                        <button
                            key={pos}
                            onClick={() => setFilterPos(pos)}
                            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                filterPos === pos 
                                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                                    : 'bg-slate-950 text-slate-400 border border-white/10 hover:bg-slate-800'
                            }`}
                        >
                            {pos === 'ALL' ? 'Todos' : pos}
                        </button>
                    ))}
                </div>
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                {availablePlayers.sort((a, b) => b.rating - a.rating).slice(0, 50).map(player => {
                    const playerTeam = allTeams.find(t => t.squad.some(p => p.id === player.id));
                    return (
                        <div key={player.id} className="group bg-slate-900/60 border border-white/5 rounded-2xl p-5 hover:bg-slate-800/80 hover:border-white/20 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-black text-lg text-white leading-tight group-hover:text-blue-400 transition-colors">{player.name}</h3>
                                    <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{player.position}</span>
                                </div>
                                <div className="w-10 h-10 flex-shrink-0 bg-white/5 rounded-lg p-1.5 border border-white/10">
                                    <TeamLogo team={playerTeam} />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-6">
                                <div className="flex items-center gap-3">
                                    {getRatingDisplay(player)}
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Valor</span>
                                        <span className="font-black text-emerald-400">£{player.value}M</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => startNegotiation(player)}
                                    className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Negotiation Modal (Chat Style) */}
            {negotiatingPlayer && (
                <Modal title={`Negociación: ${negotiatingPlayer.name}`} onClose={() => setNegotiatingPlayer(null)}>
                    <div className="flex flex-col h-[60vh] max-h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-white/10">
                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full">Inicio de negociaciones</span>
                            </div>
                            
                            {negotiationHistory.map((item, index) => {
                                if (typeof item === 'string') {
                                    // Our offer (Right side)
                                    return (
                                        <div key={index} className="flex justify-end">
                                            <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-md">
                                                <p className="text-sm font-medium">{item}</p>
                                            </div>
                                        </div>
                                    );
                                }
                                if ('type' in item && item.type === 'error') {
                                    // System Error
                                    return (
                                        <div key={index} className="flex justify-center">
                                            <div className="bg-red-950/50 border border-red-500/50 text-red-400 p-2 rounded-lg text-xs font-bold text-center">
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
                                    <div key={index} className="flex justify-start">
                                        <div className={`p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-md border ${
                                            isAccepted ? 'bg-emerald-950/50 border-emerald-500/30' : 
                                            isRejected ? 'bg-red-950/50 border-red-500/30' : 
                                            'bg-slate-800 border-white/10'
                                        }`}>
                                            <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                                                Director Deportivo Rival
                                            </p>
                                            <p className={`text-sm ${isAccepted ? 'text-emerald-300' : isRejected ? 'text-red-300' : 'text-slate-200'}`}>
                                                "{negotiationItem.message}"
                                            </p>
                                            {negotiationItem.decision === 'counter' && (
                                                <div className="mt-2 inline-block bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                                                    <span className="text-xs text-slate-400">Contraoferta: </span>
                                                    <span className="font-black text-amber-400">£{negotiationItem.counterOffer}M</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="bg-slate-900 border-t border-white/10 p-4">
                            {isOfferAccepted ? (
                                <button onClick={handleAcceptDeal} className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl hover:bg-emerald-500 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                    FICHAR JUGADOR AHORA
                                </button>
                            ) : isNegotiationDead ? (
                                <button onClick={() => setNegotiatingPlayer(null)} className="w-full bg-slate-800 text-slate-400 font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors">
                                    Cerrar Mesa de Negociación
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex gap-3 items-center">
                                        <div className="flex-1 relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                                            <input 
                                                type="number" 
                                                value={offer} 
                                                onChange={e => setOffer(Number(e.target.value))} 
                                                className="w-full pl-8 pr-12 py-3 bg-slate-950 border border-white/10 rounded-xl text-white font-black focus:outline-none focus:border-blue-500" 
                                                disabled={isNegotiating}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">M</span>
                                        </div>
                                        <button 
                                            onClick={handleSendOffer} 
                                            disabled={isNegotiating || isOfferInvalid} 
                                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isNegotiating ? <LoadingSpinner /> : 'Enviar'}
                                        </button>
                                    </div>
                                    {offer > finances.transferBudget && <p className="text-xs text-red-400 text-center font-bold">Presupuesto excedido. Máximo: £{finances.transferBudget.toFixed(1)}M</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
