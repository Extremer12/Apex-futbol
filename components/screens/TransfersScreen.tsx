import React, { useState } from 'react';
import { GameState, Player } from '../../types';
import { GameAction } from '../../state/reducer';
import { LoadingSpinner } from '../icons';
import { generateTransferNegotiationResponse, NegotiationResponse } from '../../services/geminiService';
import { Modal } from '../ui/Modal';

interface TransfersScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export const TransfersScreen: React.FC<TransfersScreenProps> = ({ gameState, dispatch }) => {
    const [filterName, setFilterName] = useState('');
    const [filterPos, setFilterPos] = useState<'ALL' | Player['position']>('ALL');
    const [negotiatingPlayer, setNegotiatingPlayer] = useState<Player | null>(null);
    const [offer, setOffer] = useState(0);
    const [negotiationHistory, setNegotiationHistory] = useState<Array<string | NegotiationResponse | {type: 'error', message: string}>>([]);
    const [isNegotiating, setIsNegotiating] = useState(false);

    const { allTeams, team: myTeam, finances } = gameState;
    const allPlayers = allTeams.flatMap(t => t.squad);

    const availablePlayers = allPlayers
        .filter(p => !myTeam.squad.some(mp => mp.id === p.id))
        .filter(p => filterName === '' || p.name.toLowerCase().includes(filterName.toLowerCase()))
        .filter(p => filterPos === 'ALL' || p.position === filterPos);

    const startNegotiation = (player: Player) => {
        setNegotiatingPlayer(player);
        setOffer(player.value);
        setNegotiationHistory([]);
    };
    
    const handleSendOffer = async () => {
        if (!negotiatingPlayer) return;
        setIsNegotiating(true);
        const sellingTeam = allTeams.find(t => t.squad.some(p => p.id === negotiatingPlayer.id))!;
        setNegotiationHistory(prev => [...prev, `Tu oferta: £${offer}M`]);
        const response = await generateTransferNegotiationResponse(negotiatingPlayer, offer, myTeam, sellingTeam);
        setNegotiationHistory(prev => [...prev, response]);
        if (response.counterOffer) {
            setOffer(response.counterOffer);
        }
        setIsNegotiating(false);
    };

    const handleAcceptDeal = () => {
        if (!negotiatingPlayer) return;
        if (offer > finances.transferBudget) {
            setNegotiationHistory(prev => [...prev, {type: 'error', message: "Fichaje cancelado. La oferta supera tu presupuesto de fichajes."}]);
            return;
        }
        if (offer > finances.balance) {
             setNegotiationHistory(prev => [...prev, {type: 'error', message: "Fichaje cancelado. No tienes suficientes fondos en el balance del club."}]);
            return;
        }
        dispatch({ type: 'SIGN_PLAYER', payload: { player: negotiatingPlayer, fee: offer } });
        setNegotiatingPlayer(null);
    }
    
    const isOfferInvalid = offer <= 0 || offer > finances.transferBudget;

    const lastHistoryItem = negotiationHistory.length > 0 ? negotiationHistory[negotiationHistory.length - 1] : null;
    const isOfferAccepted = !!(lastHistoryItem && typeof lastHistoryItem === 'object' && 'decision' in lastHistoryItem && lastHistoryItem.decision === 'accepted');

    return (
        <div className="p-4 md:p-6 space-y-4">
            <h2 className="text-3xl font-bold text-sky-400">Mercado de Fichajes</h2>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Buscar por nombre..." value={filterName} onChange={e => setFilterName(e.target.value)} className="flex-grow px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <select value={filterPos} onChange={e => setFilterPos(e.target.value as 'ALL' | Player['position'])} className="px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <option value="ALL">Todas</option><option value="POR">POR</option><option value="DEF">DEF</option><option value="CEN">CEN</option><option value="DEL">DEL</option>
                </select>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-6 text-xs font-semibold text-slate-400 p-4 bg-slate-800/50 uppercase tracking-wider">
                    <span className="col-span-2">Jugador</span><span>Pos</span><span>Nivel</span><span>Valor</span><span>Acción</span>
                </div>
                <div className="divide-y divide-slate-800 max-h-[60vh] overflow-y-auto">
                    {availablePlayers.sort((a,b) => b.rating - a.rating).map(player => (
                        <div key={player.id} className="grid grid-cols-6 p-4 items-center">
                            <span className="col-span-2 font-semibold">{player.name}</span>
                            <span className="text-slate-300">{player.position}</span>
                            <span className="font-bold text-sky-400">{player.rating}</span>
                            <span className="text-green-400">{`£${player.value}M`}</span>
                            <button onClick={() => startNegotiation(player)} className="bg-sky-600 text-white text-xs font-bold py-1.5 px-3 rounded-md hover:bg-sky-500 transition-colors shadow-md shadow-sky-600/10">Oferta</button>
                        </div>
                    ))}
                </div>
            </div>
            {negotiatingPlayer && (
                 <Modal title={`Negociando por ${negotiatingPlayer.name}`} onClose={() => setNegotiatingPlayer(null)}>
                    <div className="space-y-4">
                        <div className="bg-slate-800/50 p-3 rounded-lg max-h-40 overflow-y-auto space-y-2 text-sm border border-slate-700/50">
                            {negotiationHistory.length === 0 && <p className="text-slate-400">Listo para hacer tu primera oferta.</p>}
                            {negotiationHistory.map((item, index) => {
                                if (typeof item === 'string') return <p key={index} className="text-right italic text-slate-300">{item}</p>;
                                if ('type' in item && item.type === 'error') {
                                    return <p key={index} className="text-red-400 font-bold">{item.message}</p>;
                                }
                                const negotiationItem = item as NegotiationResponse;
                                return (
                                <div key={index} className="p-3 bg-slate-800 rounded">
                                    <p className="font-semibold text-sky-400">Respuesta del Club:</p>
                                    <p className="italic">"{negotiationItem.message}"</p>
                                    {negotiationItem.decision === 'accepted' && <p className="text-green-400 font-bold mt-2">¡OFERTA ACEPTADA!</p>}
                                    {negotiationItem.decision === 'rejected' && <p className="text-red-400 font-bold mt-2">OFERTA RECHAZADA.</p>}
                                    {negotiationItem.decision === 'counter' && <p className="text-yellow-400 font-bold mt-2">Contraoferta: £{negotiationItem.counterOffer}M</p>}
                                </div>
                                );
                            })}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                 <label htmlFor="offerAmount" className="font-semibold">Tu Oferta:</label>
                                 <input id="offerAmount" type="number" value={offer} onChange={e => setOffer(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                                 <span className="font-semibold text-lg">M</span>
                            </div>
                            {offer > finances.transferBudget && <p className="text-xs text-red-400 mt-1">La oferta excede tu presupuesto de fichajes ({`£${finances.transferBudget.toFixed(1)}M`}).</p>}
                             {offer <= 0 && <p className="text-xs text-red-400 mt-1">La oferta debe ser un número positivo.</p>}
                        </div>

                        <div className="flex gap-3 pt-3 border-t border-slate-800">
                             <button onClick={handleSendOffer} disabled={isNegotiating || isOfferInvalid} className="flex-1 bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20">
                                {isNegotiating ? <LoadingSpinner/> : 'Enviar Oferta'}
                             </button>
                             {isOfferAccepted && (
                                <button onClick={handleAcceptDeal} className="flex-1 bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-500 shadow-lg shadow-green-600/20">Fichar Jugador</button>
                             )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
