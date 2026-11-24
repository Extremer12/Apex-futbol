import React, { useMemo } from 'react';
import { Offer, Player, Team } from '../../../types';
import { TeamLogo, PlayerPhoto } from '../../../data/teams/helpers';
import { Check, Inbox, Lock, Sparkles, Trash2, X } from 'lucide-react';
import { formatTransferFee, normalizeMonetaryValue } from '../../../utils';
import { getPlayerAge } from '../../../utils/playerUtils';
import { getCountryMeta, resolvePlayerNationality } from '../../../services/nationalityService';
import { EmptyState, OvrBadge, positionLabel } from './TransferUI';

interface TransfersOffersTabProps {
    incomingOffers: Offer[];
    myTeam: Team;
    reservePlayers?: Player[];
    allTeams: Team[];
    onAcceptOffer: (offer: Offer) => void;
    onRejectOffer: (offer: Offer) => void;
    onRejectPlayerOffers?: (playerId: number) => void;
    onClearLowOffers?: () => void;
    onToggleUntouchable?: (player: Player) => void;
    onOpenCounterOffer: (offer: Offer) => void;
}

interface GroupedPlayerOffers {
    player: Player;
    offers: Offer[];
    bestOffer: Offer;
    bestAmount: number;
    bestPct: number;
}

export const TransfersOffersTab: React.FC<TransfersOffersTabProps> = ({
    incomingOffers,
    myTeam,
    reservePlayers = [],
    allTeams,
    onAcceptOffer,
    onRejectOffer,
    onRejectPlayerOffers,
    onClearLowOffers,
    onToggleUntouchable,
    onOpenCounterOffer,
}) => {
    const teamsById = useMemo(() => new Map(allTeams.map(t => [t.id, t])), [allTeams]);

    const playerById = useMemo(() => {
        const map = new Map<number, Player>();
        for (const p of myTeam.squad) map.set(p.id, p);
        for (const p of reservePlayers) map.set(p.id, p);
        return map;
    }, [myTeam.squad, reservePlayers]);

    const { groupedOffers, lowOffersCount } = useMemo(() => {
        const groupsMap = new Map<number, Offer[]>();
        let lowCount = 0;

        for (const offer of incomingOffers) {
            const player = playerById.get(offer.playerId);
            if (!player) continue;

            const amt = normalizeMonetaryValue(offer.counterOfferValue || offer.offerValue);
            const val = Math.max(1, normalizeMonetaryValue(player.value));
            if (amt < val) lowCount++;

            const arr = groupsMap.get(offer.playerId) || [];
            arr.push(offer);
            groupsMap.set(offer.playerId, arr);
        }

        const groups: GroupedPlayerOffers[] = [];
        for (const [playerId, offers] of groupsMap.entries()) {
            const player = playerById.get(playerId);
            if (!player) continue;
            const sorted = [...offers].sort(
                (a, b) => normalizeMonetaryValue(b.counterOfferValue || b.offerValue) - normalizeMonetaryValue(a.counterOfferValue || a.offerValue)
            );
            const bestOffer = sorted[0];
            const bestAmount = normalizeMonetaryValue(bestOffer.counterOfferValue || bestOffer.offerValue);
            const bestPct = Math.round((bestAmount / Math.max(1, normalizeMonetaryValue(player.value))) * 100);
            groups.push({
                player,
                offers: sorted,
                bestOffer,
                bestAmount,
                bestPct
            });
        }

        groups.sort((a, b) => b.bestPct - a.bestPct || b.bestAmount - a.bestAmount);
        return { groupedOffers: groups, lowOffersCount: lowCount };
    }, [incomingOffers, playerById]);

    if (groupedOffers.length === 0) {
        return (
            <div className="apex-card">
                <EmptyState
                    icon={<Inbox className="w-6 h-6" />}
                    title="Bandeja de ventas despejada"
                    text="Marca jugadores como transferibles o busca compradores desde la pestaña Plantilla para recibir propuestas seleccionadas."
                />
            </div>
        );
    }

    return (
        <div className="space-y-3.5">
            {/* Executive Summary & Hygiene Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="text-xs text-slate-400 font-semibold">
                    <span className="text-white font-black">{groupedOffers.length}</span> futbolista{groupedOffers.length !== 1 ? 's' : ''} con interés ·{' '}
                    <span className="text-[var(--apex-gold)] font-bold">{incomingOffers.length} ofertas activas</span> (máx. 3 por jugador)
                </div>
                {onClearLowOffers && lowOffersCount > 0 && (
                    <button
                        type="button"
                        onClick={onClearLowOffers}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/35 text-[11px] font-bold text-slate-300 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Descartar bajas ({lowOffersCount})</span>
                    </button>
                )}
            </div>

            {/* Grouped Player Cards */}
            <div className="space-y-3.5">
                {groupedOffers.map(({ player, offers, bestOffer, bestAmount, bestPct }) => {
                    const nat = resolvePlayerNationality(player, myTeam.leagueId);
                    const countryMeta = getCountryMeta(nat);
                    const bestBuyer = teamsById.get(bestOffer.offeringTeamId);
                    const bestTone =
                        bestPct >= 110
                            ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/35'
                            : bestPct >= 95
                                ? 'text-amber-300 bg-amber-500/15 border-amber-500/35'
                                : 'text-rose-300 bg-rose-500/15 border-rose-500/35';

                    return (
                        <article key={player.id} className="apex-card overflow-hidden">
                            {/* Player Target Header */}
                            <div className="p-4 bg-[#080C15] border-b border-white/10 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <PlayerPhoto player={player} className="w-12 h-12 rounded-2xl shrink-0 border border-white/15" />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-sm sm:text-base font-black text-white truncate">{player.name}</h3>
                                            <span title={countryMeta.name}>{countryMeta.flag}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                            {positionLabel[player.position]} · {getPlayerAge(player)}a · Tasación:{' '}
                                            <strong className="text-slate-200">{formatTransferFee(player.value)}</strong>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <OvrBadge value={player.rating} muted={player.rating < 75} />
                                </div>
                            </div>

                            {/* Best Bid Highlight Banner */}
                            <div className="px-4 py-3 bg-gradient-to-r from-[var(--apex-gold)]/10 via-transparent to-emerald-500/5 border-b border-white/5 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Sparkles className="w-4 h-4 text-[var(--apex-gold)] shrink-0" />
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                                        Mejor Oferta:
                                    </span>
                                    {bestBuyer && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white truncate">
                                            <span className="w-4 h-4 inline-flex shrink-0"><TeamLogo team={bestBuyer} /></span>
                                            {bestBuyer.shortName || bestBuyer.name}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${bestTone}`}>
                                        {bestPct}% valor
                                    </span>
                                    <span className="text-base font-black text-white tabular-nums">
                                        {formatTransferFee(bestAmount)}
                                    </span>
                                </div>
                            </div>

                            {/* Interested Clubs Bids (Max 3, sorted high to low) */}
                            <div className="divide-y divide-white/5">
                                {offers.map((offer, idx) => {
                                    const buyer = teamsById.get(offer.offeringTeamId);
                                    const amount = normalizeMonetaryValue(offer.counterOfferValue || offer.offerValue);
                                    const pct = Math.round((amount / Math.max(1, normalizeMonetaryValue(player.value))) * 100);
                                    const pctTone =
                                        pct >= 110
                                            ? 'text-emerald-400'
                                            : pct >= 95
                                                ? 'text-amber-300'
                                                : 'text-rose-400';

                                    return (
                                        <div key={offer.id} className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="text-[10px] font-black text-slate-500 w-4 shrink-0">#{idx + 1}</span>
                                                {buyer && (
                                                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                                                        <TeamLogo team={buyer} className="w-full h-full object-contain" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                                                            {buyer?.name || 'Club Interesado'}
                                                        </span>
                                                        {offer.status === 'negotiating' && (
                                                            <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 text-[9px] font-black uppercase">
                                                                Negociando
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs mt-0.5 tabular-nums">
                                                        <strong className="text-white font-black">{formatTransferFee(amount)}</strong>
                                                        <span className={`text-[11px] font-bold ${pctTone}`}>({pct}%)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => onRejectOffer(offer)}
                                                    aria-label="Rechazar oferta"
                                                    className="h-9 w-9 rounded-xl bg-white/5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 flex items-center justify-center cursor-pointer transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onOpenCounterOffer(offer)}
                                                    className="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                                                >
                                                    Pedir más
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onAcceptOffer(offer)}
                                                    className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Vender</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Quick Player Batch Actions */}
                            {(onRejectPlayerOffers || onToggleUntouchable) && (
                                <div className="px-4 py-2.5 bg-black/25 border-t border-white/5 flex items-center justify-end gap-2">
                                    {onToggleUntouchable && (
                                        <button
                                            type="button"
                                            onClick={() => onToggleUntouchable(player)}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/15 border border-white/10 text-[11px] font-bold text-slate-300 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                            <Lock className="w-3 h-3" />
                                            <span>Declarar Intransferible</span>
                                        </button>
                                    )}
                                    {onRejectPlayerOffers && offers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => onRejectPlayerOffers(player.id)}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/10 text-[11px] font-bold text-slate-400 hover:text-rose-300 cursor-pointer transition-colors"
                                        >
                                            Rechazar todas ({offers.length})
                                        </button>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </div>
    );
};
