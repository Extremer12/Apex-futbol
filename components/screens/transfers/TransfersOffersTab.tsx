import React from 'react';
import { Offer, Team } from '../../../types';
import { TeamLogo, PlayerPhoto } from '../../../data/teams/helpers';
import { Inbox, Check, X } from 'lucide-react';
import { formatTransferFee, normalizeMonetaryValue } from '../../../utils';
import { EmptyState, positionLabel } from './TransferUI';

interface TransfersOffersTabProps {
    incomingOffers: Offer[];
    myTeam: Team;
    allTeams: Team[];
    onAcceptOffer: (offer: Offer) => void;
    onRejectOffer: (offer: Offer) => void;
    onOpenCounterOffer: (offer: Offer) => void;
}

export const TransfersOffersTab: React.FC<TransfersOffersTabProps> = ({
    incomingOffers, myTeam, allTeams, onAcceptOffer, onRejectOffer, onOpenCounterOffer,
}) => {
    if (incomingOffers.length === 0) {
        return (
            <div className="apex-card">
                <EmptyState icon={<Inbox className="w-6 h-6" />} title="Sin ofertas por ahora"
                    text="Pon jugadores en venta desde la pestaña Plantilla para atraer compradores." />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {incomingOffers.map(offer => {
                const player = myTeam.squad.find(p => p.id === offer.playerId);
                const buyer = allTeams.find(t => t.id === offer.offeringTeamId);
                const amount = offer.counterOfferValue || offer.offerValue;
                const pct = player ? Math.round((normalizeMonetaryValue(amount) / Math.max(1, normalizeMonetaryValue(player.value))) * 100) : 100;
                const pctTone = pct >= 110 ? 'text-emerald-400 bg-emerald-500/10' : pct >= 90 ? 'text-amber-300 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10';

                return (
                    <article key={offer.id} className="apex-card p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            {player && <PlayerPhoto player={player} className="w-11 h-11 rounded-full shrink-0" />}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-white truncate">{player?.name || 'Jugador'}</p>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 min-w-0">
                                    <span>{player ? positionLabel[player.position] : ''}</span>
                                    <span>·</span>
                                    <span>Oferta de</span>
                                    {buyer && <span className="w-3.5 h-3.5 inline-flex shrink-0"><TeamLogo team={buyer} /></span>}
                                    <span className="truncate font-semibold text-slate-300">{buyer?.shortName || buyer?.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end justify-between px-3 py-2.5 rounded-xl bg-black/30">
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Ofrecen</span>
                                <span className="text-xl font-black text-white">{formatTransferFee(amount)}</span>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-black ${pctTone}`}>{pct}% del valor</span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">Valor: {formatTransferFee(player?.value)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
                            <button onClick={() => onRejectOffer(offer)} aria-label="Rechazar"
                                className="h-11 w-11 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 flex items-center justify-center">
                                <X className="w-5 h-5" />
                            </button>
                            <button onClick={() => onOpenCounterOffer(offer)}
                                className="h-11 rounded-xl bg-white/5 text-slate-200 text-xs font-bold">
                                Pedir más
                            </button>
                            <button onClick={() => onAcceptOffer(offer)}
                                className="h-11 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5">
                                <Check className="w-4 h-4" /> Aceptar
                            </button>
                        </div>
                    </article>
                );
            })}
        </div>
    );
};
