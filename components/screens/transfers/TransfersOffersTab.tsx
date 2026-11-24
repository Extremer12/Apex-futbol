import React, { useMemo, useState } from 'react';
import { Offer, Player, Team } from '../../../types';
import { TeamLogo, PlayerPhoto } from '../../../data/teams/helpers';
import { Check, ChevronRight, Inbox, Lock, Sparkles, Trash2, X } from 'lucide-react';
import { formatTransferFee, normalizeMonetaryValue } from '../../../utils';
import { getPlayerAge } from '../../../utils/playerUtils';
import { getCountryMeta, resolvePlayerNationality } from '../../../services/nationalityService';
import { BottomSheet, EmptyState, OvrBadge, positionLabel } from './TransferUI';

interface TransfersOffersTabProps {
    incomingOffers: Offer[];
    myTeam: Team;
    reservePlayers?: Player[];
    allTeams: Team[];
    onAcceptOffer: (offer: Offer) => void;
    onRejectOffer: (offer: Offer) => void;
    onRejectPlayerOffers?: (playerId: number) => void;
    onClearLowOffers?: () => void;
    onRejectSpontaneousOffers?: () => void;
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
    onRejectSpontaneousOffers,
    onToggleUntouchable,
    onOpenCounterOffer,
}) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

    const teamsById = useMemo(() => new Map(allTeams.map(t => [t.id, t])), [allTeams]);

    const playerById = useMemo(() => {
        const map = new Map<number, Player>();
        for (const p of myTeam.squad) map.set(p.id, p);
        for (const p of reservePlayers) map.set(p.id, p);
        return map;
    }, [myTeam.squad, reservePlayers]);

    const { groupedOffers, lowOffersCount, spontaneousOffersCount } = useMemo(() => {
        const groupsMap = new Map<number, Offer[]>();
        let lowCount = 0;
        let spontaneousCount = 0;

        for (const offer of incomingOffers) {
            const player = playerById.get(offer.playerId);
            if (!player) continue;

            const amt = normalizeMonetaryValue(offer.counterOfferValue || offer.offerValue);
            const val = Math.max(1, normalizeMonetaryValue(player.value));
            if (amt < val) lowCount++;
            if (!player.isTransferListed) spontaneousCount++;

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

        groups.sort((a, b) => Number(Boolean(b.player.isTransferListed)) - Number(Boolean(a.player.isTransferListed)) || b.bestPct - a.bestPct);
        return { groupedOffers: groups, lowOffersCount: lowCount, spontaneousOffersCount: spontaneousCount };
    }, [incomingOffers, playerById]);

    const selectedGroup = useMemo(
        () => groupedOffers.find(g => g.player.id === selectedPlayerId) || null,
        [groupedOffers, selectedPlayerId]
    );

    if (groupedOffers.length === 0) {
        return (
            <div className="apex-card">
                <EmptyState
                    icon={<Inbox className="w-6 h-6" />}
                    title="Bandeja de ventas despejada"
                    text="Marca jugadores como transferibles desde la pestaña Plantilla para recibir propuestas seleccionadas."
                />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Compact Summary & Quick Cleanup Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <span className="text-xs text-slate-400 font-semibold">
                    <strong className="text-white">{groupedOffers.length}</strong> jugador{groupedOffers.length !== 1 ? 'es' : ''} · {incomingOffers.length} propuesta{incomingOffers.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-1.5">
                    {onRejectSpontaneousOffers && spontaneousOffersCount > 0 && (
                        <button
                            type="button"
                            onClick={onRejectSpontaneousOffers}
                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                            <X className="w-3 h-3 text-slate-400" />
                            <span>Descartar sondeos ({spontaneousOffersCount})</span>
                        </button>
                    )}
                    {onClearLowOffers && lowOffersCount > 0 && (
                        <button
                            type="button"
                            onClick={onClearLowOffers}
                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/35 text-[11px] font-bold text-slate-300 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                            <span>Bajas ({lowOffersCount})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Compact Player Offer Rows (1 clean row per player) */}
            <ul className="apex-card divide-y divide-white/5 overflow-hidden">
                {groupedOffers.map(({ player, offers, bestOffer, bestAmount, bestPct }) => {
                    const nat = resolvePlayerNationality(player, myTeam.leagueId);
                    const countryMeta = getCountryMeta(nat);
                    const bestBuyer = teamsById.get(bestOffer.offeringTeamId);
                    const pctTone =
                        bestPct >= 110
                            ? 'text-emerald-400'
                            : bestPct >= 95
                                ? 'text-amber-300'
                                : 'text-rose-400';

                    return (
                        <li key={player.id}>
                            <button
                                type="button"
                                onClick={() => setSelectedPlayerId(player.id)}
                                className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors cursor-pointer"
                            >
                                <PlayerPhoto player={player} className="w-11 h-11 rounded-full shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-bold text-white truncate">{player.name}</p>
                                        <span title={countryMeta.name} className="shrink-0">{countryMeta.flag}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                                            player.isTransferListed
                                                ? 'bg-amber-500/15 text-amber-300'
                                                : 'bg-white/10 text-slate-300'
                                        }`}>
                                            {player.isTransferListed ? 'En venta' : 'Sondeo'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 min-w-0">
                                        <span className="font-bold text-slate-300">{positionLabel[player.position]}</span>
                                        <span>·</span>
                                        <span>Tas. {formatTransferFee(player.value)}</span>
                                        {offers.length > 1 && (
                                            <>
                                                <span>·</span>
                                                <span className="text-[var(--apex-gold)] font-bold">{offers.length} clubes</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right shrink-0 flex items-center gap-2">
                                    <div>
                                        <p className="text-sm font-black text-white tabular-nums leading-tight">
                                            {formatTransferFee(bestAmount)}
                                        </p>
                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                            {bestBuyer && (
                                                <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                                                    {bestBuyer.shortName || bestBuyer.name}
                                                </span>
                                            )}
                                            <span className={`text-[10px] font-black tabular-nums ${pctTone}`}>
                                                {bestPct}%
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {/* Decision BottomSheet for Selected Player's Offers */}
            <BottomSheet
                open={!!selectedGroup}
                onClose={() => setSelectedPlayerId(null)}
                title={selectedGroup ? `Ofertas por ${selectedGroup.player.name}` : undefined}
                footer={
                    selectedGroup && (onToggleUntouchable || (onRejectPlayerOffers && selectedGroup.offers.length > 1)) ? (
                        <div className="flex gap-2">
                            {onToggleUntouchable && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onToggleUntouchable(selectedGroup.player);
                                        setSelectedPlayerId(null);
                                    }}
                                    className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-indigo-500/15 border border-white/10 text-slate-200 hover:text-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Declarar Intransferible</span>
                                </button>
                            )}
                            {onRejectPlayerOffers && selectedGroup.offers.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onRejectPlayerOffers(selectedGroup.player.id);
                                        setSelectedPlayerId(null);
                                    }}
                                    className="flex-1 h-11 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold cursor-pointer"
                                >
                                    Rechazar todas ({selectedGroup.offers.length})
                                </button>
                            )}
                        </div>
                    ) : undefined
                }
            >
                {selectedGroup && (() => {
                    const { player, offers, bestAmount, bestPct } = selectedGroup;
                    const nat = resolvePlayerNationality(player, myTeam.leagueId);
                    const countryMeta = getCountryMeta(nat);

                    return (
                        <div className="space-y-4">
                            {/* Player Mini Summary */}
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                                <PlayerPhoto player={player} className="w-14 h-14 rounded-2xl shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-base font-black text-white truncate">{player.name}</h3>
                                        <span title={countryMeta.name}>{countryMeta.flag}</span>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        {positionLabel[player.position]} · {getPlayerAge(player)} años · Tasación{' '}
                                        <strong className="text-slate-200">{formatTransferFee(player.value)}</strong>
                                    </p>
                                </div>
                                <OvrBadge value={player.rating} muted={player.rating < 75} />
                            </div>

                            {/* Best Highlight */}
                            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/25 text-xs">
                                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[var(--apex-gold)]" /> Mejor propuesta
                                </span>
                                <span className="font-black text-white tabular-nums">
                                    {formatTransferFee(bestAmount)} ({bestPct}%)
                                </span>
                            </div>

                            {/* Individual Buyer Proposals (max 3) */}
                            <div className="space-y-2.5">
                                {offers.map(offer => {
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
                                        <div key={offer.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    {buyer && (
                                                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                                                            <TeamLogo team={buyer} className="w-full h-full object-contain" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-white truncate">
                                                            {buyer?.name || 'Club Interesado'}
                                                        </p>
                                                        {offer.status === 'negotiating' && (
                                                            <span className="text-[10px] font-black uppercase text-sky-400">En negociación</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 tabular-nums">
                                                    <p className="text-base font-black text-white">{formatTransferFee(amount)}</p>
                                                    <p className={`text-[11px] font-bold ${pctTone}`}>{pct}% del valor</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => onRejectOffer(offer)}
                                                    className="h-10 rounded-xl bg-white/5 hover:bg-rose-500/15 border border-white/10 text-slate-300 hover:text-rose-300 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    <span>Rechazar</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPlayerId(null);
                                                        onOpenCounterOffer(offer);
                                                    }}
                                                    className="h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                                                >
                                                    Pedir más
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPlayerId(null);
                                                        onAcceptOffer(offer);
                                                    }}
                                                    className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Vender</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}
            </BottomSheet>
        </div>
    );
};
