import React, { useState, useMemo } from 'react';
import { GameState, Player, SquadRole, Offer } from '../../types';
import { GameAction } from '../../state/reducer';
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
    CheckCircle2
} from 'lucide-react';
import { useToast } from '../common/ToastProvider';

// Modular Subcomponents
import { TransfersMarketTab, CategoryFilter, SortOption } from './transfers/TransfersMarketTab';
import { TransfersOffersTab } from './transfers/TransfersOffersTab';
import { ClubNegotiationModal, ClubChatMessage } from './transfers/ClubNegotiationModal';
import { ContractNegotiationModal, AgentChatMessage } from './transfers/ContractNegotiationModal';
import { CounterOfferModal } from './transfers/CounterOfferModal';

interface TransfersScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

type MarketTab = 'MARKET' | 'OFFERS';

export const TransfersScreen: React.FC<TransfersScreenProps> = ({ gameState, dispatch }) => {
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

    // All available players from other clubs
    const allPlayers = useMemo(() => allTeams.flatMap(t => t.squad), [allTeams]);
    const availablePlayers = useMemo(() => {
        return allPlayers.filter(p => !myTeam.squad.some(mp => mp.id === p.id));
    }, [allPlayers, myTeam.squad]);

    // --- PHASE 1: START NEGOTIATION WITH CLUB ---
    const startNegotiation = (player: Player) => {
        setNegotiatingPlayer(player);
        setNegotiationPhase('CLUB');
        setClubOfferFee(player.value);
        setClubChatHistory([
            { sender: 'system', text: `Iniciando conversaciones con el club propietario por el traspaso de ${player.name}.` }
        ]);
        setClubAttempts(0);
        setAgreedFee(null);

        // Reset phase 2 defaults
        const expWage = getExpectedWage(player, myTeam.tier, 'FirstTeam');
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
                { sender: 'system', text: `🎉 ¡Acuerdo contractual formalizado! Listo para cerrar el fichaje.` }
            ]);
        } else if (response.decision === 'rejected') {
            setIsNegotiationDead(true);
            setAgentChatHistory(prev => [
                ...prev,
                { sender: 'agent', text: response.message },
                { sender: 'system', text: `❌ El jugador ha rechazado la propuesta y su agente da por concluidas las negociaciones.` }
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

        if (totalInitialOutlay > finances.transferBudget) {
            showToast("No dispones de suficiente presupuesto de traspasos.", 'error');
            return;
        }
        if (totalInitialOutlay > finances.balance) {
            showToast("El balance financiero del club no cubre el desembolso.", 'error');
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
                            <p className="text-[8px] text-white/50 font-bold uppercase tracking-widest">Presupuesto Fichajes</p>
                            <p className="text-base font-black text-[var(--apex-gold)]">{formatTransferFee(finances.transferBudget)}</p>
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

            {/* 2-PHASE NEGOTIATION MODAL */}
            {negotiatingPlayer && (
                <Modal 
                    title={`Fichaje: ${negotiatingPlayer.name}`} 
                    onClose={() => setNegotiatingPlayer(null)}
                >
                    <div className="flex flex-col h-[70vh] max-h-[640px] bg-gradient-to-b from-[#0f1423] to-[#0a0e17] rounded-xl overflow-hidden border border-white/10">
                        {/* Stepper Header */}
                        <div className="bg-black/60 px-6 py-3 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                    negotiationPhase === 'CLUB' 
                                        ? 'bg-[var(--apex-gold)] text-black shadow-md' 
                                        : agreedFee !== null 
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                            : 'text-white/40'
                                }`}>
                                    <span>1. Traspaso Club</span>
                                    {agreedFee !== null && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/30" />
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                    negotiationPhase === 'CONTRACT' 
                                        ? 'bg-[var(--apex-gold)] text-black shadow-md' 
                                        : isContractAgreed 
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                            : 'text-white/40'
                                }`}>
                                    <span>2. Contrato Jugador</span>
                                    {isContractAgreed && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider block">Presupuesto</span>
                                <span className="text-xs font-black text-[var(--apex-gold)]">{formatCurrency(finances.transferBudget)}</span>
                            </div>
                        </div>

                        {/* Phase 1: Club */}
                        {negotiationPhase === 'CLUB' && (
                            <ClubNegotiationModal 
                                negotiatingPlayer={negotiatingPlayer}
                                transferBudget={finances.transferBudget}
                                clubOfferFee={clubOfferFee}
                                setClubOfferFee={setClubOfferFee}
                                clubChatHistory={clubChatHistory}
                                isClubNegotiating={isClubNegotiating}
                                isNegotiationDead={isNegotiationDead}
                                agreedFee={agreedFee}
                                onSendClubOffer={handleSendClubOffer}
                                onProceedToContract={() => setNegotiationPhase('CONTRACT')}
                                onClose={() => setNegotiatingPlayer(null)}
                            />
                        )}

                        {/* Phase 2: Contract */}
                        {negotiationPhase === 'CONTRACT' && (
                            <ContractNegotiationModal 
                                negotiatingPlayer={negotiatingPlayer}
                                agreedFee={agreedFee}
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
                                isNegotiationDead={isNegotiationDead}
                                onSendAgentOffer={handleSendAgentOffer}
                                onFinalizeSigning={handleFinalizeSigning}
                                onClose={() => setNegotiatingPlayer(null)}
                            />
                        )}
                    </div>
                </Modal>
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
        </div>
    );
};
