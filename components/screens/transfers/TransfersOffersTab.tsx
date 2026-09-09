import React from 'react';
import { Offer, Team } from '../../../types';
import { TeamLogo, PlayerPhoto } from '../../../data/teams/helpers';
import { 
    Inbox, 
    CheckCircle2, 
    XCircle 
} from 'lucide-react';
import { formatTransferFee } from '../../../utils';

interface TransfersOffersTabProps {
    incomingOffers: Offer[];
    myTeam: Team;
    allTeams: Team[];
    onAcceptOffer: (offer: Offer) => void;
    onRejectOffer: (offer: Offer) => void;
    onOpenCounterOffer: (offer: Offer) => void;
}

export const TransfersOffersTab: React.FC<TransfersOffersTabProps> = ({
    incomingOffers,
    myTeam,
    allTeams,
    onAcceptOffer,
    onRejectOffer,
    onOpenCounterOffer,
}) => {
    if (incomingOffers.length === 0) {
        return (
            <div className="apex-card p-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/30">
                    <Inbox className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Bandeja de Ofertas Vacía</h3>
                <p className="text-white/40 text-xs max-w-sm">No has recibido propuestas de compra de otros clubes recientemente. Pon jugadores en la lista de transferibles para atraer interés.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingOffers.map(offer => {
                const player = myTeam.squad.find(p => p.id === offer.playerId);
                const offeringTeam = allTeams.find(t => t.id === offer.offeringTeamId);
                const isCountered = offer.counterOfferValue && offer.counterOfferValue > 0;
                const displayValue = offer.counterOfferValue || offer.offerValue;

                return (
                    <div key={offer.id} className="apex-card p-5 border-l-4 border-l-[var(--apex-gold)] space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {player && <PlayerPhoto player={player} className="w-12 h-12 rounded-xl border border-white/10" />}
                                <div>
                                    <span className="text-[9px] font-black text-[var(--apex-gold)] tracking-widest uppercase">Oferta Formal de Compra</span>
                                    <h3 className="text-base font-black text-white leading-tight">{player?.name || 'Jugador'}</h3>
                                    <p className="text-xs text-white/50">{player?.position} • Valor: {formatTransferFee(player?.value)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                                <div className="w-6 h-6">
                                    <TeamLogo team={offeringTeam} />
                                </div>
                                <span className="text-xs font-black text-white">{offeringTeam?.name}</span>
                            </div>
                        </div>

                        <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/60 font-bold">Monto Ofertado:</span>
                                <span className="text-lg font-black text-emerald-400">{formatTransferFee(displayValue)}</span>
                            </div>
                            {isCountered && (
                                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                                    ⚡ Negociación en curso (Contraoferta)
                                </span>
                            )}
                            <p className="text-xs text-white/80 italic pt-1 border-t border-white/5">"{offer.message}"</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onAcceptOffer(offer)}
                                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Aceptar {formatTransferFee(displayValue)}
                            </button>
                            <button
                                onClick={() => onOpenCounterOffer(offer)}
                                className="px-4 py-2.5 rounded-xl bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] hover:bg-[var(--apex-gold)] hover:text-black border border-[var(--apex-gold)]/30 font-black text-xs uppercase tracking-wider transition-all"
                            >
                                Contraofertar
                            </button>
                            <button
                                onClick={() => onRejectOffer(offer)}
                                className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                                title="Rechazar Oferta"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
