import React, { useState, useMemo, useEffect } from 'react';
import { GameState, Player, SquadRole, Offer, Team } from '../../types';
import { GameAction } from '../../state/reducer';
import { useGameStore } from '../../state/gameStore';
import { generateCounterOfferDecision } from '../../services/gameLogic';
import { 
    formatCurrency, 
    formatWeeklyWage, 
    formatTransferFee, 
    normalizeMonetaryValue, 
    isTransferWindowOpen, 
    getNextTransferWindow 
} from '../../utils';
import { 
    Clock, 
    Users, 
    Inbox, 
    Tag, 
    Sliders, 
    X, 
    Wallet,
    ArrowUpRight
} from 'lucide-react';
import { useToast } from '../common/ToastProvider';

import { TransfersMarketTab, CategoryFilter, SortOption } from './transfers/TransfersMarketTab';
import { TransfersOffersTab } from './transfers/TransfersOffersTab';
import { TransfersSquadTab } from './transfers/TransfersSquadTab';
import { TransferNegotiationModal } from './transfers/TransferNegotiationModal';
import { CounterOfferModal } from './transfers/CounterOfferModal';

interface TransfersScreenProps {
    gameState?: GameState;
    dispatch?: React.Dispatch<GameAction>;
}

type MarketTab = 'MARKET' | 'MY_SQUAD' | 'OFFERS';

export const TransfersScreen: React.FC<TransfersScreenProps> = ({ 
    gameState: propGameState, 
    dispatch: propDispatch 
}) => {
    const storeGameState = useGameStore(s => s.gameState);
    const storeDispatch = useGameStore(s => s.dispatch);
    const gameState = propGameState || storeGameState;
    const dispatch = propDispatch || storeDispatch;

    if (!gameState) return null;

    const { allTeams, team: myTeam, finances, incomingOffers } = gameState;
    const { showToast } = useToast();

    // Navigation & Tabs
    const [activeTab, setActiveTab] = useState<MarketTab>('MARKET');

    // Filters for Market Tab
    const [filterName, setFilterName] = useState('');
    const [filterPos, setFilterPos] = useState<'ALL' | Player['position']>('ALL');
    const [filterCategory, setFilterCategory] = useState<CategoryFilter>('ALL');
    const [sortOption, setSortOption] = useState<SortOption>('rating');
    const [currentPage, setCurrentPage] = useState(1);

    // Active Negotiation Modal
    const [negotiatingPlayer, setNegotiatingPlayer] = useState<Player | null>(null);

    // Incoming offers counter-offer modal
    const [counterOfferModal, setCounterOfferModal] = useState<{ offer: Offer; player: Player; buyer: any } | null>(null);
    const [counterValue, setCounterValue] = useState<number>(0);
    const [isEvaluatingCounter, setIsEvaluatingCounter] = useState(false);

    // Financial normalization
    const normBudget = useMemo(() => normalizeMonetaryValue(finances.transferBudget, 0), [finances.transferBudget]);
    const normBalance = useMemo(() => normalizeMonetaryValue(finances.balance, 0), [finances.balance]);

    // Presidential Budget Reallocation Modal
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [newBudgetDraft, setNewBudgetDraft] = useState(normBudget);

    useEffect(() => {
        if (!showBudgetModal) {
            setNewBudgetDraft(normBudget);
        }
    }, [normBudget, showBudgetModal]);

    // O(1) teams index map
    const teamsById = useMemo(() => new Map(allTeams.map(t => [t.id, t])), [allTeams]);

    // Fast indexed computation of available players and player-to-team map
    const { availablePlayers, playerTeamMap } = useMemo(() => {
        const mySquadIds = new Set(myTeam.squad.map(mp => mp.id));
        const playersList: Player[] = [];
        const pTeamMap = new Map<number, Team>();

        for (const t of allTeams) {
            const isUserTeam = t.id === myTeam.id;
            for (const p of t.squad) {
                pTeamMap.set(p.id, t);
                if (!isUserTeam && !mySquadIds.has(p.id)) {
                    playersList.push(p);
                }
            }
        }
        return { availablePlayers: playersList, playerTeamMap: pTeamMap };
    }, [allTeams, myTeam.id, myTeam.squad]);

    // Start Negotiation
    const startNegotiation = (player: Player) => {
        const normValue = normalizeMonetaryValue(player.value, 1_000_000);
        setNegotiatingPlayer({ ...player, value: normValue });
    };

    // Finalize Signing from Negotiation Modal
    const handleFinalizeSigning = (payload: {
        player: Player;
        fee: number;
        wage: number;
        contractYears: number;
        role: SquadRole;
        signingBonus: number;
    }) => {
        const totalCashNeeded = payload.fee + payload.signingBonus;

        if (totalCashNeeded > normBalance) {
            showToast("El saldo total en tesorería del club no cubre el desembolso inicial de la operación.", 'error');
            return;
        }

        dispatch({
            type: 'SIGN_PLAYER',
            payload: {
                player: payload.player,
                fee: payload.fee,
                wage: payload.wage,
                contractYears: payload.contractYears,
                role: payload.role,
                signingBonus: payload.signingBonus
            }
        });

        showToast(`¡${payload.player.name} ha firmado oficialmente con el club!`, 'success');
        setNegotiatingPlayer(null);
    };

    // Incoming Offers Handlers
    const handleAcceptIncomingOffer = (offer: Offer) => {
        const player = myTeam.squad.find(p => p.id === offer.playerId);
        const offeringTeam = teamsById.get(offer.offeringTeamId);
        dispatch({ type: 'ACCEPT_OFFER', payload: { offerId: offer.id } });
        showToast(`Traspaso de ${player?.name || 'Jugador'} al ${offeringTeam?.name || 'club rival'} cerrado por ${formatCurrency(offer.counterOfferValue || offer.offerValue)}.`, 'success');
    };

    const handleRejectIncomingOffer = (offer: Offer) => {
        dispatch({ type: 'REJECT_OFFER', payload: { offerId: offer.id } });
        showToast("Oferta de traspaso rechazada.", 'info');
    };

    const handleOpenCounterOffer = (offer: Offer) => {
        const player = myTeam.squad.find(p => p.id === offer.playerId)!;
        const buyer = teamsById.get(offer.offeringTeamId) || allTeams[0];
        setCounterOfferModal({ offer, player, buyer });
        const initialOffer = normalizeMonetaryValue(offer.offerValue);
        setCounterValue(Math.round((initialOffer * 1.25) / 100_000) * 100_000);
    };

    const handleSendCounterToBuyer = async () => {
        if (!counterOfferModal) return;
        setIsEvaluatingCounter(true);
        const { offer, player, buyer } = counterOfferModal;

        const result = await generateCounterOfferDecision(player, counterValue, offer.offerValue, buyer);
        setIsEvaluatingCounter(false);

        if (result.decision === 'accepted') {
            dispatch({
                type: 'UPDATE_OFFER',
                payload: { ...offer, offerValue: counterValue, status: 'accepted', message: result.message }
            });
            showToast(`¡El ${buyer.name} aceptó la contraoferta de ${formatCurrency(counterValue)}!`, 'success');
            setCounterOfferModal(null);
        } else if (result.decision === 'rejected') {
            dispatch({ type: 'REJECT_OFFER', payload: { offerId: offer.id } });
            showToast(`El ${buyer.name} rompió las negociaciones y retiró la oferta.`, 'warning');
            setCounterOfferModal(null);
        } else {
            const newFee = result.newOfferValue || Math.round((offer.offerValue + counterValue) / 2);
            dispatch({
                type: 'UPDATE_OFFER',
                payload: { ...offer, offerValue: newFee, status: 'negotiating', message: result.message }
            });
            showToast(`El ${buyer.name} contraofertó ${formatCurrency(newFee)}.`, 'info');
            setCounterOfferModal(null);
        }
    };

    const marketOpen = isTransferWindowOpen(gameState.currentWeek);
    const nextWindow = getNextTransferWindow(gameState.currentWeek);

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-5 pb-24 animate-fade-in select-none">
            {/* 1. TOP PRESIDENTIAL BAR (Clean, Compact, Informative) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#0B0F19] border border-white/10 p-3.5 sm:p-4 rounded-2xl shadow-xl">
                {/* Title & Market Window Status */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-[var(--apex-gold)]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">Mercado de Fichajes</h1>
                            {marketOpen ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Ventana Abierta
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                    <Clock className="w-3 h-3 text-rose-400" />
                                    Cerrado (Abre: {nextWindow})
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">Contrataciones, venta de futbolistas y gestión de contratos</p>
                    </div>
                </div>

                {/* Financial Overview & Budget Reallocation */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl text-xs">
                    <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tesorería</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-400">{formatTransferFee(normBalance)}</span>
                    </div>
                    <div className="w-px h-5 bg-white/10" />
                    <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Presupuesto Fichajes</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-black text-[var(--apex-gold)]">{formatTransferFee(normBudget)}</span>
                            <button
                                onClick={() => {
                                    setNewBudgetDraft(normBudget);
                                    setShowBudgetModal(true);
                                }}
                                className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-[var(--apex-gold)] transition-colors cursor-pointer"
                                title="Ajustar asignación de presupuesto"
                            >
                                <Sliders className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <div className="w-px h-5 bg-white/10" />
                    <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Masa Salarial</span>
                        <span className="text-xs sm:text-sm font-black text-white">{formatWeeklyWage(finances.weeklyWages)}</span>
                    </div>
                </div>
            </div>

            {/* 2. SEGMENTED TABS */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('MARKET')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        activeTab === 'MARKET' 
                            ? 'bg-[var(--apex-gold)] text-slate-950 shadow-md font-black' 
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Users className="w-3.5 h-3.5" />
                    <span>Explorar Mercado ({availablePlayers.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('MY_SQUAD')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        activeTab === 'MY_SQUAD' 
                            ? 'bg-[var(--apex-gold)] text-slate-950 shadow-md font-black' 
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Vender / Mi Plantilla</span>
                    {myTeam.squad.filter(p => p.isTransferListed).length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center">
                            {myTeam.squad.filter(p => p.isTransferListed).length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('OFFERS')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 relative cursor-pointer ${
                        activeTab === 'OFFERS' 
                            ? 'bg-[var(--apex-gold)] text-slate-950 shadow-md font-black' 
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Ofertas Recibidas</span>
                    {incomingOffers.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                            {incomingOffers.length}
                        </span>
                    )}
                </button>
            </div>

            {/* 3. ACTIVE TAB CONTENT */}
            {activeTab === 'MARKET' && (
                <TransfersMarketTab 
                    gameState={gameState}
                    dispatch={dispatch}
                    marketOpen={marketOpen}
                    allTeams={allTeams}
                    myTeam={myTeam}
                    availablePlayers={availablePlayers}
                    filterName={filterName}
                    setFilterName={setFilterName}
                    filterPos={filterPos}
                    setFilterPos={setFilterPos}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    onStartNegotiation={startNegotiation}
                    playerTeamMap={playerTeamMap}
                />
            )}

            {activeTab === 'MY_SQUAD' && (
                <TransfersSquadTab 
                    gameState={gameState}
                    dispatch={dispatch}
                    myTeam={myTeam}
                    onSwitchToOffers={() => setActiveTab('OFFERS')}
                />
            )}

            {activeTab === 'OFFERS' && (
                <TransfersOffersTab 
                    incomingOffers={incomingOffers}
                    myTeam={myTeam}
                    allTeams={allTeams}
                    onAcceptOffer={handleAcceptIncomingOffer}
                    onRejectOffer={handleRejectIncomingOffer}
                    onOpenCounterOffer={handleOpenCounterOffer}
                />
            )}

            {/* 4. CLEAN PRESIDENTIAL NEGOTIATION MODAL */}
            {negotiatingPlayer && (
                <TransferNegotiationModal 
                    negotiatingPlayer={negotiatingPlayer}
                    sellingTeam={playerTeamMap.get(negotiatingPlayer.id) || allTeams.find(t => t.squad.some(p => p.id === negotiatingPlayer.id))}
                    myTeam={myTeam}
                    transferBudget={normBudget}
                    clubBalance={normBalance}
                    onFinalizeSigning={handleFinalizeSigning}
                    onClose={() => setNegotiatingPlayer(null)}
                />
            )}

            {/* 5. COUNTER-OFFER MODAL */}
            {counterOfferModal && (
                <CounterOfferModal 
                    data={counterOfferModal}
                    counterValue={counterValue}
                    setCounterValue={setCounterValue}
                    isEvaluatingCounter={isEvaluatingCounter}
                    onSendCounterToBuyer={handleSendCounterToBuyer}
                    onClose={() => setCounterOfferModal(null)}
                />
            )}

            {/* 6. PRESIDENTIAL BUDGET ALLOCATION MODAL */}
            {showBudgetModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-lg bg-[#0D121F] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 flex items-center justify-center text-[var(--apex-gold)]">
                                    <Sliders className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Asignación Presidencial de Fondos</h3>
                                    <p className="text-[11px] text-slate-400">Ajusta el presupuesto destinado a traspasos con cargo a tesorería</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowBudgetModal(false)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Balance status */}
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Saldo en Tesorería</span>
                                <span className="text-sm font-black text-emerald-400">{formatCurrency(normBalance)}</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Presupuesto Actual</span>
                                <span className="text-sm font-black text-[var(--apex-gold)]">{formatCurrency(normBudget)}</span>
                            </div>
                        </div>

                        {/* Slider & Presets */}
                        <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300">Nuevo Presupuesto Asignado:</span>
                                <span className="text-base font-black text-[var(--apex-gold)]">{formatCurrency(newBudgetDraft)}</span>
                            </div>

                            <input
                                type="range"
                                min={0}
                                max={Math.max(normBalance, 10_000_000)}
                                step={1_000_000}
                                value={newBudgetDraft}
                                onChange={(e) => setNewBudgetDraft(Number(e.target.value))}
                                className="w-full accent-[var(--apex-gold)] cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                            />

                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { label: '25%', factor: 0.25 },
                                    { label: '50%', factor: 0.50 },
                                    { label: '75%', factor: 0.75 },
                                    { label: '100% (Todo)', factor: 1.0 },
                                ].map(p => (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => setNewBudgetDraft(Math.round(normBalance * p.factor))}
                                        className="py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 border border-white/5 cursor-pointer active:scale-95 transition-all"
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowBudgetModal(false)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    dispatch({
                                        type: 'UPDATE_FINANCES',
                                        payload: {
                                            ...finances,
                                            transferBudget: newBudgetDraft
                                        }
                                    });
                                    showToast(`Presupuesto de traspasos establecido en ${formatCurrency(newBudgetDraft)}`, 'success');
                                    setShowBudgetModal(false);
                                }}
                                className="flex-1 py-3 rounded-xl bg-[var(--apex-gold)] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-[var(--apex-gold)]/20 active:scale-98 transition-all"
                            >
                                Confirmar Presupuesto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
