import React, { useState, useMemo, useEffect } from 'react';
import { GameState, Player, SquadRole, Offer } from '../../types';
import { GameAction } from '../../state/reducer';
import { useGameStore } from '../../state/gameStore';
import { 
    generateTransferNegotiationResponse, 
    generatePlayerContractNegotiationResponse,
    generateCounterOfferDecision 
} from '../../services/gameLogic';
import { Modal } from '../ui/Modal';
import { 
    formatCurrency,
    formatCurrencyShort, 
    formatWeeklyWage, 
    formatTransferFee,
    isTransferWindowOpen, 
    getNextTransferWindow 
} from '../../utils';
import { getExpectedWage } from '../../utils/playerUtils';
import { 
    Clock, 
    Briefcase, 
    Users,
    Inbox,
    ArrowRight,
    CheckCircle2,
    Sliders,
    X
} from 'lucide-react';
import { useToast } from '../common/ToastProvider';

// Modular Subcomponents
import { TransfersMarketTab, CategoryFilter, SortOption } from './transfers/TransfersMarketTab';
import { TransfersOffersTab } from './transfers/TransfersOffersTab';
import { ClubChatMessage } from './transfers/ClubNegotiationModal';
import { AgentChatMessage } from './transfers/ContractNegotiationModal';
import { TransferNegotiationSuite } from './transfers/TransferNegotiationSuite';
import { CounterOfferModal } from './transfers/CounterOfferModal';

interface TransfersScreenProps {
    gameState?: GameState;
    dispatch?: React.Dispatch<GameAction>;
}

type MarketTab = 'MARKET' | 'OFFERS';

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

    // Filters
    const [filterName, setFilterName] = useState('');
    const [filterPos, setFilterPos] = useState<'ALL' | Player['position']>('ALL');
    const [filterCategory, setFilterCategory] = useState<CategoryFilter>('ALL');
    const [sortOption, setSortOption] = useState<SortOption>('rating');
    const [currentPage, setCurrentPage] = useState(1);

    // --- 2-PHASE NEGOTIATION STATE ---
    const [negotiatingPlayer, setNegotiatingPlayer] = useState<Player | null>(null);
    const [negotiationPhase, setNegotiationPhase] = useState<'CLUB' | 'CONTRACT'>('CLUB');
    
    // Phase 1: Club
    const [clubOfferFee, setClubOfferFee] = useState<number>(0);
    const [clubChatHistory, setClubChatHistory] = useState<ClubChatMessage[]>([]);
    const [isClubNegotiating, setIsClubNegotiating] = useState(false);
    const [clubAttempts, setClubAttempts] = useState(0);
    const [agreedFee, setAgreedFee] = useState<number | null>(null);

    // Phase 2: Player & Agent Contract
    const [offeredWage, setOfferedWage] = useState<number>(0);
    const [offeredYears, setOfferedYears] = useState<number>(3);
    const [offeredRole, setOfferedRole] = useState<SquadRole>('FirstTeam');
    const [offeredBonus, setOfferedBonus] = useState<number>(0);
    const [agentChatHistory, setAgentChatHistory] = useState<AgentChatMessage[]>([]);
    const [isAgentNegotiating, setIsAgentNegotiating] = useState(false);
    const [isContractAgreed, setIsContractAgreed] = useState(false);
    const [isNegotiationDead, setIsNegotiationDead] = useState(false);

    // Incoming offers counter-offer modal
    const [counterOfferModal, setCounterOfferModal] = useState<{ offer: Offer; player: Player; buyer: any } | null>(null);
    const [counterValue, setCounterValue] = useState<number>(0);
    const [isEvaluatingCounter, setIsEvaluatingCounter] = useState(false);

    // Financial normalization
    const normBudget = useMemo(() => {
        if (finances.transferBudget && finances.transferBudget < 10_000) {
            return finances.transferBudget * 1_000_000;
        }
        return finances.transferBudget || 0;
    }, [finances.transferBudget]);

    const normBalance = useMemo(() => {
        if (finances.balance && finances.balance < 10_000) {
            return finances.balance * 1_000_000;
        }
        return finances.balance || 0;
    }, [finances.balance]);

    // Presidential Budget Reallocation Modal
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [newBudgetDraft, setNewBudgetDraft] = useState(normBudget);

    // Keep draft synced when modal opens or budget changes
    useEffect(() => {
        if (!showBudgetModal) {
            setNewBudgetDraft(normBudget);
        }
    }, [normBudget, showBudgetModal]);

    // All available players from other clubs - optimized single-pass with O(1) ID set
    const availablePlayers = useMemo(() => {
        const mySquadIds = new Set(myTeam.squad.map(mp => mp.id));
        const result: Player[] = [];
        for (const t of allTeams) {
            if (t.id === myTeam.id) continue;
            for (const p of t.squad) {
                if (!mySquadIds.has(p.id)) {
                    result.push(p);
                }
            }
        }
        return result;
    }, [allTeams, myTeam.id, myTeam.squad]);

    // --- PHASE 1: START NEGOTIATION WITH CLUB ---
    const startNegotiation = (player: Player) => {
        const normValue = player.value && player.value < 10_000 ? player.value * 1_000_000 : (player.value || 1_000_000);
        const playerToNegotiate = { ...player, value: normValue };
        setNegotiatingPlayer(playerToNegotiate);
        setNegotiationPhase('CLUB');
        setClubOfferFee(normValue);
        setClubChatHistory([
            { sender: 'system', text: `Iniciando conversaciones con el club propietario por el traspaso de ${player.name}.` }
        ]);
        setClubAttempts(0);
        setAgreedFee(null);

        // Reset phase 2 defaults
        const expWage = getExpectedWage(playerToNegotiate, myTeam.tier, 'FirstTeam');
        setOfferedWage(expWage);
        setOfferedYears(3);
        setOfferedRole('FirstTeam');
        setOfferedBonus(0);
        setAgentChatHistory([]);
        setIsContractAgreed(false);
        setIsNegotiationDead(false);
    };

    const handleSendClubOffer = async () => {
        if (!negotiatingPlayer) return;
        setIsClubNegotiating(true);
        const sellingTeam = allTeams.find(t => t.squad.some(p => p.id === negotiatingPlayer.id)) || allTeams[0];
        
        const newAttempts = clubAttempts + 1;
        setClubAttempts(newAttempts);
        setClubChatHistory(prev => [...prev, { sender: 'user', text: `Oferta formal de traspaso: ${formatCurrency(clubOfferFee)}` }]);
        
        const response = await generateTransferNegotiationResponse(negotiatingPlayer, clubOfferFee, myTeam, sellingTeam, newAttempts);
        
        if (response.decision === 'accepted') {
            setAgreedFee(clubOfferFee);
            setClubChatHistory(prev => [
                ...prev, 
                { sender: 'rival', text: response.message },
                { sender: 'system', text: `Acuerdo económico alcanzado con el club (${formatCurrency(clubOfferFee)}). Pasando a negociar el contrato del jugador.` }
            ]);
            setTimeout(() => {
                setNegotiationPhase('CONTRACT');
                setAgentChatHistory([
                    { sender: 'system', text: `Reunión con el agente de ${negotiatingPlayer.name}. Define el salario, años de contrato y rol en la plantilla.` }
                ]);
            }, 1200);
        } else if (response.decision === 'rejected') {
            setIsNegotiationDead(true);
            setClubChatHistory(prev => [
                ...prev, 
                { sender: 'rival', text: response.message },
                { sender: 'system', text: `Las negociaciones se han roto definitivamente.` }
            ]);
        } else {
            if (response.counterOffer) {
                setClubOfferFee(response.counterOffer);
            }
            setClubChatHistory(prev => [
                ...prev, 
                { sender: 'rival', text: response.message, counter: response.counterOffer }
            ]);
        }
        setIsClubNegotiating(false);
    };

    // --- PHASE 2: NEGOTIATE WITH AGENT ---
    const handleSendAgentOffer = async () => {
        if (!negotiatingPlayer) return;
        setIsAgentNegotiating(true);

        setAgentChatHistory(prev => [
            ...prev,
            { 
                sender: 'user', 
                text: `Propuesta de contrato: ${formatWeeklyWage(offeredWage)}, ${offeredYears} años, Rol: ${
                    offeredRole === 'Key' ? 'Jugador Clave' : offeredRole === 'FirstTeam' ? 'Titular' : offeredRole === 'Rotation' ? 'Rotación' : 'Promesa'
                }${offeredBonus > 0 ? `, Prima: ${formatCurrency(offeredBonus * 1_000_000)}` : ''}` 
            }
        ]);

        const response = await generatePlayerContractNegotiationResponse(
            negotiatingPlayer,
            offeredWage,
            offeredYears,
            offeredRole,
            offeredBonus,
            myTeam
        );

        if (response.decision === 'accepted') {
            setIsContractAgreed(true);
            setAgentChatHistory(prev => [
                ...prev,
                { sender: 'agent', text: response.message },
                { sender: 'system', text: 'Acuerdo contractual alcanzado. Listo para formalizar el fichaje.' }
            ]);
        } else if (response.decision === 'rejected') {
            setIsNegotiationDead(true);
            setAgentChatHistory(prev => [
                ...prev,
                { sender: 'agent', text: response.message },
                { sender: 'system', text: 'El jugador ha rechazado la propuesta y su agente da por concluidas las negociaciones.' }
            ]);
        } else {
            if (response.counterOffer) {
                setOfferedWage(response.counterOffer.wage);
                setOfferedYears(response.counterOffer.contractYears);
                setOfferedRole(response.counterOffer.role);
                setOfferedBonus(response.counterOffer.signingBonus);
            }
            setAgentChatHistory(prev => [
                ...prev,
                { sender: 'agent', text: response.message }
            ]);
        }
        setIsAgentNegotiating(false);
    };

    const handleFinalizeSigning = () => {
        if (!negotiatingPlayer || agreedFee === null) return;
        const totalInitialOutlay = agreedFee + offeredBonus;

        if (totalInitialOutlay > normBalance) {
            showToast("El saldo total en tesorería del club no cubre el desembolso de la operación.", 'error');
            return;
        }

        dispatch({
            type: 'SIGN_PLAYER',
            payload: {
                player: negotiatingPlayer,
                fee: agreedFee,
                wage: offeredWage,
                contractYears: offeredYears,
                role: offeredRole,
                signingBonus: offeredBonus
            }
        });

        showToast(`¡${negotiatingPlayer.name} ha firmado oficialmente con el club!`, 'success');
        setNegotiatingPlayer(null);
    };

    // --- INCOMING OFFERS ACTIONS ---
    const handleAcceptIncomingOffer = (offer: Offer) => {
        const player = myTeam.squad.find(p => p.id === offer.playerId);
        const offeringTeam = allTeams.find(t => t.id === offer.offeringTeamId);
        dispatch({ type: 'ACCEPT_OFFER', payload: { offerId: offer.id } });
        showToast(`Traspaso de ${player?.name || 'Jugador'} al ${offeringTeam?.name || 'club rival'} cerrado por ${formatCurrency(offer.counterOfferValue || offer.offerValue)}.`, 'success');
    };

    const handleRejectIncomingOffer = (offer: Offer) => {
        dispatch({ type: 'REJECT_OFFER', payload: { offerId: offer.id } });
        showToast("Oferta de traspaso rechazada.", 'info');
    };

    const handleOpenCounterOffer = (offer: Offer) => {
        const player = myTeam.squad.find(p => p.id === offer.playerId)!;
        const buyer = allTeams.find(t => t.id === offer.offeringTeamId)!;
        setCounterOfferModal({ offer, player, buyer });
        setCounterValue(Math.round(offer.offerValue * 1.25 * 10) / 10);
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
            const newFee = result.newOfferValue || Math.round((offer.offerValue + counterValue) / 2 * 10) / 10;
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
        <div className="p-4 md:p-6 space-y-6 pb-24 animate-fade-in">
            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-1">Dirección Deportiva y Fichajes</h2>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Mercado de Traspasos</h1>
                </div>

                {/* Tabs & Finance Stats */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setActiveTab('MARKET')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                                activeTab === 'MARKET' 
                                    ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-[var(--apex-gold)]/20' 
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            <Users className="w-3.5 h-3.5" /> Explorar Mercado
                        </button>
                        <button
                            onClick={() => setActiveTab('OFFERS')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 relative ${
                                activeTab === 'OFFERS' 
                                    ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-[var(--apex-gold)]/20' 
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            <Inbox className="w-3.5 h-3.5" /> Ofertas Recibidas
                            {incomingOffers.length > 0 && (
                                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                                    {incomingOffers.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="apex-card px-4 py-2 flex items-center gap-4">
                        <div>
                            <p className="text-[8px] text-white/50 font-bold uppercase tracking-widest">Saldo en Tesorería</p>
                            <p className="text-base font-black text-emerald-400">{formatTransferFee(normBalance)}</p>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div>
                            <p className="text-[8px] text-white/50 font-bold uppercase tracking-widest">Presupuesto Fichajes</p>
                            <div className="flex items-center gap-2">
                                <p className="text-base font-black text-[var(--apex-gold)]">{formatTransferFee(normBudget)}</p>
                                <button
                                    onClick={() => {
                                        setNewBudgetDraft(normBudget);
                                        setShowBudgetModal(true);
                                    }}
                                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[9px] font-bold text-white/80 hover:text-[var(--apex-gold)] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                                    title="Ajustar Presupuesto de Fichajes"
                                >
                                    <Sliders className="w-2.5 h-2.5" />
                                    <span>Ajustar</span>
                                </button>
                            </div>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div>
                            <p className="text-[8px] text-white/50 font-bold uppercase tracking-widest">Masa Salarial</p>
                            <p className="text-base font-black text-white">{formatWeeklyWage(finances.weeklyWages)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transfer Window Status Banner */}
            {!marketOpen ? (
                <div className="bg-slate-900/60 border border-red-500/30 rounded-2xl p-5 text-center animate-fade-in relative overflow-hidden backdrop-blur-md">
                    <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-2">
                            <Clock className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-red-400 font-black uppercase tracking-[0.2em] text-sm mb-0.5">Mercado de Traspasos Cerrado</h3>
                        <p className="text-slate-400 text-xs font-bold">Próxima apertura oficial: <span className="text-white">{nextWindow}</span></p>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between animate-fade-in relative overflow-hidden backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-emerald-400 font-black uppercase tracking-wider text-xs">Periodo de Fichajes Abierto</h3>
                            <p className="text-white/60 text-[11px]">Negocia traspasos con clubes rivales y acuerda contratos de jugadores.</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                        En curso
                    </span>
                </div>
            )}

            {/* TAB 1: MARKET */}
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
                />
            )}

            {/* TAB 2: OFFERS */}
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

            {/* FULL-SCREEN IMMERSIVE NEGOTIATION SUITE */}
            {negotiatingPlayer && (
                <TransferNegotiationSuite 
                    negotiatingPlayer={negotiatingPlayer}
                    sellingTeam={allTeams.find(t => t.squad.some(p => p.id === negotiatingPlayer.id))}
                    myTeam={myTeam}
                    transferBudget={finances.transferBudget && finances.transferBudget < 10_000 ? finances.transferBudget * 1_000_000 : finances.transferBudget}
                    clubBalance={finances.balance && finances.balance < 10_000 ? finances.balance * 1_000_000 : finances.balance}
                    negotiationPhase={negotiationPhase}
                    clubOfferFee={clubOfferFee}
                    setClubOfferFee={setClubOfferFee}
                    clubChatHistory={clubChatHistory}
                    clubAttempts={clubAttempts}
                    isClubNegotiating={isClubNegotiating}
                    agreedFee={agreedFee}
                    onSendClubOffer={handleSendClubOffer}
                    onProceedToContract={() => setNegotiationPhase('CONTRACT')}
                    offeredWage={offeredWage}
                    setOfferedWage={setOfferedWage}
                    offeredYears={offeredYears}
                    setOfferedYears={setOfferedYears}
                    offeredRole={offeredRole}
                    setOfferedRole={setOfferedRole}
                    offeredBonus={offeredBonus}
                    setOfferedBonus={setOfferedBonus}
                    agentChatHistory={agentChatHistory}
                    isAgentNegotiating={isAgentNegotiating}
                    isContractAgreed={isContractAgreed}
                    onSendAgentOffer={handleSendAgentOffer}
                    onFinalizeSigning={handleFinalizeSigning}
                    isNegotiationDead={isNegotiationDead}
                    onClose={() => setNegotiatingPlayer(null)}
                />
            )}

            {/* COUNTER-OFFER MODAL */}
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

            {/* PRESIDENTIAL BUDGET ALLOCATION MODAL */}
            {showBudgetModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-lg bg-[#0D121F] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 flex items-center justify-center text-[var(--apex-gold)]">
                                    <Sliders className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Asignación Presidencial de Fondos</h3>
                                    <p className="text-[11px] text-white/50">Ajusta el presupuesto destinado a traspasos con cargo a tesorería</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowBudgetModal(false)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Financial balance status */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                                <span className="text-[10px] font-bold text-white/40 uppercase block">Saldo Total en Tesorería</span>
                                <span className="text-base font-black text-emerald-400">{formatCurrency(normBalance)}</span>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                                <span className="text-[10px] font-bold text-white/40 uppercase block">Presupuesto Fichajes Actual</span>
                                <span className="text-base font-black text-[var(--apex-gold)]">{formatCurrency(normBudget)}</span>
                            </div>
                        </div>

                        {/* Slider & Presets */}
                        <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white/70">Nuevo Presupuesto Asignado:</span>
                                <span className="text-lg font-black text-[var(--apex-gold)]">{formatCurrency(newBudgetDraft)}</span>
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
                                        className="py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/80 border border-white/5 cursor-pointer active:scale-95"
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="text-[11px] text-white/40 leading-relaxed">
                            💡 Como Presidente del club, tienes potestad plena para destinar reservas de caja al mercado de fichajes para acometer contrataciones galácticas.
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowBudgetModal(false)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs uppercase cursor-pointer"
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
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-[var(--apex-gold)]/20 active:scale-98"
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
