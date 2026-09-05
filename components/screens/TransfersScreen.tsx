import React, { useState, useMemo } from 'react';
import { GameState, Player, SquadRole, Offer } from '../../types';
import { GameAction } from '../../state/reducer';
import { LoadingSpinner } from '../icons';
import { 
    generateTransferNegotiationResponse, 
    generatePlayerContractNegotiationResponse,
    generateCounterOfferDecision,
    NegotiationResponse 
} from '../../services/gameLogic';
import { Modal } from '../ui/Modal';
import { TeamLogo, PlayerPhoto } from '../../data/teams/helpers';
import { 
    formatCurrency, 
    formatCurrencyShort, 
    formatWeeklyWage, 
    isTransferWindowOpen, 
    getNextTransferWindow 
} from '../../utils';
import { 
    getPlayerAge, 
    getPlayerPotential, 
    getPlayerPotentialTier, 
    getTierBadge, 
    getExpectedWage 
} from '../../utils/playerUtils';
import { 
    Sparkles, 
    TrendingUp, 
    DollarSign, 
    Shield, 
    Clock, 
    Search, 
    CheckCircle2, 
    XCircle, 
    ArrowRight, 
    Briefcase, 
    ChevronLeft, 
    ChevronRight,
    Users,
    Inbox
} from 'lucide-react';
import { useToast } from '../common/ToastProvider';

interface TransfersScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

type MarketTab = 'MARKET' | 'OFFERS';
type CategoryFilter = 'ALL' | 'WONDERKIDS' | 'PRIME' | 'VETERANS' | 'EXPIRING' | 'AFFORDABLE';
type SortOption = 'rating' | 'potential' | 'value' | 'age' | 'wage';

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
    const pageSize = 24;

    // --- 2-PHASE NEGOTIATION STATE ---
    const [negotiatingPlayer, setNegotiatingPlayer] = useState<Player | null>(null);
    const [negotiationPhase, setNegotiationPhase] = useState<'CLUB' | 'CONTRACT'>('CLUB');
    
    // Phase 1: Club
    const [clubOfferFee, setClubOfferFee] = useState<number>(0);
    const [clubChatHistory, setClubChatHistory] = useState<Array<{ sender: 'user' | 'rival' | 'system'; text: string; counter?: number }>>([]);
    const [isClubNegotiating, setIsClubNegotiating] = useState(false);
    const [clubAttempts, setClubAttempts] = useState(0);
    const [agreedFee, setAgreedFee] = useState<number | null>(null);

    // Phase 2: Player & Agent Contract
    const [offeredWage, setOfferedWage] = useState<number>(0);
    const [offeredYears, setOfferedYears] = useState<number>(3);
    const [offeredRole, setOfferedRole] = useState<SquadRole>('FirstTeam');
    const [offeredBonus, setOfferedBonus] = useState<number>(0);
    const [agentChatHistory, setAgentChatHistory] = useState<Array<{ sender: 'user' | 'agent' | 'system'; text: string }>>([]);
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

    // Filter and Sort Pipeline
    const filteredPlayers = useMemo(() => {
        return availablePlayers.filter(player => {
            // Name search
            if (filterName && !player.name.toLowerCase().includes(filterName.toLowerCase())) {
                return false;
            }
            // Position filter
            if (filterPos !== 'ALL' && player.position !== filterPos) {
                return false;
            }
            // Category filter
            const age = getPlayerAge(player);
            const pot = getPlayerPotential(player);
            const potTier = getPlayerPotentialTier(player);

            if (filterCategory === 'WONDERKIDS') {
                if (potTier !== 'Wonderkid' && (age > 22 || pot < 85)) return false;
            } else if (filterCategory === 'PRIME') {
                if (age < 23 || age > 29) return false;
            } else if (filterCategory === 'VETERANS') {
                if (age < 30) return false;
            } else if (filterCategory === 'EXPIRING') {
                if (player.contractYears > 1) return false;
            } else if (filterCategory === 'AFFORDABLE') {
                if (player.value > finances.transferBudget) return false;
            }
            return true;
        }).sort((a, b) => {
            switch (sortOption) {
                case 'rating':
                    return b.rating - a.rating;
                case 'potential':
                    return getPlayerPotential(b) - getPlayerPotential(a);
                case 'value':
                    return b.value - a.value;
                case 'age':
                    return getPlayerAge(a) - getPlayerAge(b);
                case 'wage':
                    return b.wage - a.wage;
                default:
                    return b.rating - a.rating;
            }
        });
    }, [availablePlayers, filterName, filterPos, filterCategory, sortOption, finances.transferBudget]);

    // Pagination slice
    const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / pageSize));
    const paginatedPlayers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPlayers.slice(start, start + pageSize);
    }, [filteredPlayers, currentPage, pageSize]);

    // Rating Display with scouting fog-of-war
    const getRatingDisplay = (player: Player) => {
        const scoutingLevel = gameState.scoutedPlayerIds[player.id] || 0;
        
        if (scoutingLevel >= 100) {
            return (
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/40 shadow-[0_0_15px_rgba(200,168,78,0.2)]">
                    <span className="font-black text-sm text-[var(--apex-gold)]">{player.rating}</span>
                </div>
            );
        }

        const range = Math.max(1, Math.ceil(5 * (1 - scoutingLevel / 100)));
        const min = Math.max(1, player.rating - range);
        const max = Math.min(99, player.rating + range);

        return (
            <div className="flex flex-col items-center">
                <span className="font-bold text-white/60 text-xs">{min}-{max}</span>
                <div className="w-10 h-1 bg-black/50 rounded-full mt-1.5 overflow-hidden border border-white/5">
                    <div className="h-full bg-white/30" style={{ width: `${scoutingLevel}%` }}></div>
                </div>
            </div>
        );
    };

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
        setClubChatHistory(prev => [...prev, { sender: 'user', text: `Oferta formal de traspaso: €${clubOfferFee}M` }]);
        
        const response = await generateTransferNegotiationResponse(negotiatingPlayer, clubOfferFee, myTeam, sellingTeam, newAttempts);
        
        if (response.decision === 'accepted') {
            setAgreedFee(clubOfferFee);
            setClubChatHistory(prev => [
                ...prev, 
                { sender: 'rival', text: response.message },
                { sender: 'system', text: `✅ ¡Acuerdo económico alcanzado con el club (€${clubOfferFee}M)! Pasando a negociar el contrato del jugador.` }
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
                { sender: 'system', text: `❌ Las negociaciones se han roto definitivamente.` }
            ]);
        } else {
            // Counter offer
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
                text: `Propuesta de contrato: ${formatWeeklyWage(offeredWage)}/sem, ${offeredYears} años, Rol: ${
                    offeredRole === 'Key' ? 'Jugador Clave' : offeredRole === 'FirstTeam' ? 'Titular' : offeredRole === 'Rotation' ? 'Rotación' : 'Promesa'
                }${offeredBonus > 0 ? `, Prima: €${offeredBonus}M` : ''}` 
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
            // Counter offer
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
        showToast(`Traspaso de ${player?.name || 'Jugador'} al ${offeringTeam?.name || 'club rival'} cerrado por €${offer.counterOfferValue || offer.offerValue}M.`, 'success');
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
            showToast(`¡El ${buyer.name} aceptó la contraoferta de €${counterValue}M!`, 'success');
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
            showToast(`El ${buyer.name} contraofertó €${newFee}M.`, 'info');
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
                            <p className="text-[8px] text-white/50 font-bold uppercase tracking-widest">Presupuesto</p>
                            <p className="text-base font-black text-[var(--apex-gold)]">€{formatCurrencyShort(finances.transferBudget * 1000000)}</p>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div>
                            <p className="text-[8px] text-white/50 font-bold uppercase tracking-widest">Masa Salarial</p>
                            <p className="text-base font-black text-white">{formatWeeklyWage(finances.weeklyWages)}/sem</p>
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

            {/* TAB: MARKET BROWSER */}
            {activeTab === 'MARKET' && (
                <div className="space-y-6">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: 'ALL', label: 'Todos', icon: Users },
                            { id: 'WONDERKIDS', label: '⭐ Promesas (<22a)', icon: Sparkles },
                            { id: 'PRIME', label: '🔥 En Prime (23-29a)', icon: TrendingUp },
                            { id: 'VETERANS', label: '🛡️ Veteranos (30+a)', icon: Shield },
                            { id: 'EXPIRING', label: '⏳ Fin de Contrato', icon: Clock },
                            { id: 'AFFORDABLE', label: '💰 En Presupuesto', icon: DollarSign },
                        ].map(cat => {
                            const Icon = cat.icon;
                            const isActive = filterCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setFilterCategory(cat.id as CategoryFilter);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                                        isActive 
                                            ? 'bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] border-[var(--apex-gold)] shadow-[0_0_15px_rgba(200,168,78,0.2)]' 
                                            : 'bg-black/30 text-white/50 border-white/5 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Secondary Filters Bar */}
                    <div className={`apex-card p-3 flex flex-col md:flex-row gap-3 items-center justify-between ${!marketOpen && 'opacity-60 pointer-events-none'}`}>
                        {/* Search Input */}
                        <div className="flex-1 w-full relative">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                            <input 
                                type="text" 
                                placeholder="Buscar jugador por nombre o apellido..." 
                                value={filterName} 
                                onChange={e => {
                                    setFilterName(e.target.value);
                                    setCurrentPage(1);
                                }} 
                                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-white/30 focus:outline-none focus:border-[var(--apex-gold)] transition-colors" 
                            />
                        </div>

                        {/* Position Selector */}
                        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            {(['ALL', 'POR', 'DEF', 'CEN', 'DEL'] as const).map(pos => (
                                <button
                                    key={pos}
                                    onClick={() => {
                                        setFilterPos(pos);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-3 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-all ${
                                        filterPos === pos 
                                            ? 'bg-[var(--apex-gold)] text-black' 
                                            : 'bg-black/30 text-white/50 border border-white/5 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    {pos === 'ALL' ? 'Todos' : pos}
                                </button>
                            ))}
                        </div>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-2 w-full md:w-auto bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Orden:</span>
                            <select
                                value={sortOption}
                                onChange={e => setSortOption(e.target.value as SortOption)}
                                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                            >
                                <option value="rating" className="bg-slate-900 text-white">⭐ Valoración Media</option>
                                <option value="potential" className="bg-slate-900 text-white">✨ Mayor Potencial</option>
                                <option value="value" className="bg-slate-900 text-white">💶 Valor de Mercado</option>
                                <option value="age" className="bg-slate-900 text-white">👶 Juventud (Edad)</option>
                                <option value="wage" className="bg-slate-900 text-white">💼 Salario Actual</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Counter & Pagination Header */}
                    <div className="flex items-center justify-between text-xs text-white/50 font-bold uppercase tracking-wider px-1">
                        <span>Mostrando {paginatedPlayers.length} de {filteredPlayers.length} futbolistas</span>
                        <span>Página {currentPage} de {totalPages}</span>
                    </div>

                    {/* Player Grid */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${!marketOpen && 'opacity-60 pointer-events-none'}`}>
                        {paginatedPlayers.map(player => {
                            const playerTeam = allTeams.find(t => t.squad.some(p => p.id === player.id));
                            const age = getPlayerAge(player);
                            const potTier = getPlayerPotentialTier(player);
                            const tierBadge = getTierBadge(potTier);
                            const expectedWage = getExpectedWage(player, myTeam.tier, 'FirstTeam');

                            return (
                                <div key={player.id} className="group apex-card p-4 hover:border-[var(--apex-border-active)] transition-all duration-300 flex flex-col justify-between">
                                    <div>
                                        {/* Player Card Top: Photo, Name, Team Logo */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <PlayerPhoto player={player} className="w-12 h-12 rounded-xl border border-white/10 shadow-md group-hover:scale-105 transition-transform" />
                                                <div>
                                                    <h3 className="font-black text-sm text-white leading-tight group-hover:text-[var(--apex-gold)] transition-colors">
                                                        {player.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 text-white/70 uppercase">
                                                            {player.position}
                                                        </span>
                                                        <span className="text-[10px] text-white/50 font-bold">{age} años</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-9 h-9 flex-shrink-0 bg-white/5 rounded-lg p-1 border border-white/10" title={playerTeam?.name}>
                                                <TeamLogo team={playerTeam} />
                                            </div>
                                        </div>

                                        {/* Badges & Contract Status */}
                                        <div className="flex flex-wrap items-center gap-1.5 mb-4">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase ${tierBadge.color}`}>
                                                {tierBadge.label}
                                            </span>
                                            {player.contractYears <= 1 && (
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                                                    ⏳ Expira ({player.contractYears}a)
                                                </span>
                                            )}
                                        </div>

                                        {/* Stats Row: Rating, Value, Wages */}
                                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 grid grid-cols-3 gap-2 text-center mb-4">
                                            <div>
                                                <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider block">Nivel</span>
                                                {getRatingDisplay(player)}
                                            </div>
                                            <div>
                                                <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider block">Valor</span>
                                                <span className="text-xs font-black text-emerald-400 mt-1 block">€{player.value}M</span>
                                            </div>
                                            <div>
                                                <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider block">Salario</span>
                                                <span className="text-[10px] font-black text-white/80 mt-1.5 block">{formatWeeklyWage(expectedWage)}/sem</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                        {(gameState.scoutedPlayerIds[player.id] || 0) < 100 && (
                                            <button
                                                onClick={() => {
                                                    dispatch({ type: 'SCOUT_PLAYER', payload: { playerId: player.id } });
                                                    showToast(`Ojeador asignado a observar a ${player.name}`, 'info');
                                                }}
                                                className="px-3 py-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10 text-[10px] font-bold uppercase flex items-center gap-1"
                                                title="Observar y desbloquear informe completo"
                                            >
                                                <Search className="w-3 h-3" /> Ojear
                                            </button>
                                        )}
                                        <button
                                            onClick={() => startNegotiation(player)}
                                            className="flex-1 py-2 rounded-xl bg-[var(--apex-gold)] text-black hover:bg-yellow-400 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[var(--apex-gold)]/20 flex items-center justify-center gap-1.5"
                                        >
                                            <Briefcase className="w-3.5 h-3.5" /> Negociar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-6">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" /> Anterior
                            </button>
                            <span className="text-xs font-black text-white/60 uppercase">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-xs disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 flex items-center gap-1"
                            >
                                Siguiente <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: INCOMING OFFERS */}
            {activeTab === 'OFFERS' && (
                <div className="space-y-4">
                    {incomingOffers.length === 0 ? (
                        <div className="apex-card p-16 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/30">
                                <Inbox className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Bandeja de Ofertas Vacía</h3>
                            <p className="text-white/40 text-xs max-w-sm">No has recibido propuestas de compra de otros clubes recientemente. Pon jugadores en la lista de transferibles para atraer interés.</p>
                        </div>
                    ) : (
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
                                                    <p className="text-xs text-white/50">{player?.position} • Valor: €{player?.value}M</p>
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
                                                <span className="text-lg font-black text-emerald-400">€{displayValue}M</span>
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
                                                onClick={() => handleAcceptIncomingOffer(offer)}
                                                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Aceptar €{displayValue}M
                                            </button>
                                            <button
                                                onClick={() => handleOpenCounterOffer(offer)}
                                                className="px-4 py-2.5 rounded-xl bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] hover:bg-[var(--apex-gold)] hover:text-black border border-[var(--apex-gold)]/30 font-black text-xs uppercase tracking-wider transition-all"
                                            >
                                                Contraofertar
                                            </button>
                                            <button
                                                onClick={() => handleRejectIncomingOffer(offer)}
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
                    )}
                </div>
            )}

            {/* --- 2-PHASE INTERACTIVE NEGOTIATION MODAL --- */}
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
                                <span className="text-xs font-black text-[var(--apex-gold)]">€{finances.transferBudget.toFixed(1)}M</span>
                            </div>
                        </div>

                        {/* PHASE 1: CLUB FEE NEGOTIATION */}
                        {negotiationPhase === 'CLUB' && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Chat Log */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {clubChatHistory.map((msg, i) => {
                                        if (msg.sender === 'system') {
                                            return (
                                                <div key={i} className="flex justify-center">
                                                    <span className="text-[10px] font-bold text-white/50 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-center">
                                                        {msg.text}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        if (msg.sender === 'user') {
                                            return (
                                                <div key={i} className="flex justify-end animate-slide-up">
                                                    <div className="bg-[var(--apex-gold)] text-black font-black p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-xs shadow-lg">
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={i} className="flex justify-start animate-slide-up">
                                                <div className="bg-slate-800/80 border border-white/10 p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] text-white shadow-lg space-y-1">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-[var(--apex-gold)] uppercase tracking-wider">
                                                        <span>Director Deportivo Rival</span>
                                                    </div>
                                                    <p className="text-xs font-medium leading-relaxed">"{msg.text}"</p>
                                                    {msg.counter && (
                                                        <div className="mt-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 flex items-center justify-between text-xs">
                                                            <span className="text-white/60 font-bold">Petición mínima:</span>
                                                            <span className="font-black text-[var(--apex-gold)]">€{msg.counter}M</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Controls */}
                                <div className="p-4 bg-black/60 border-t border-white/10 space-y-3">
                                    {isNegotiationDead ? (
                                        <button
                                            onClick={() => setNegotiatingPlayer(null)}
                                            className="w-full py-3 bg-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/20"
                                        >
                                            Cerrar Negociaciones
                                        </button>
                                    ) : agreedFee !== null ? (
                                        <button
                                            onClick={() => setNegotiationPhase('CONTRACT')}
                                            className="w-full py-3.5 bg-emerald-500 text-black font-black rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                        >
                                            Continuar a Términos Contractuales <ArrowRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 relative">
                                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-[var(--apex-gold)]">€</span>
                                                    <input 
                                                        type="number" 
                                                        step="0.5"
                                                        value={clubOfferFee} 
                                                        onChange={e => setClubOfferFee(Number(e.target.value))}
                                                        className="w-full pl-8 pr-12 py-3 bg-black/50 border border-white/10 rounded-xl text-white font-black text-sm focus:outline-none focus:border-[var(--apex-gold)]"
                                                        disabled={isClubNegotiating}
                                                    />
                                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-black text-[var(--apex-gold)]">M</span>
                                                </div>
                                                <button
                                                    onClick={handleSendClubOffer}
                                                    disabled={isClubNegotiating || clubOfferFee <= 0 || clubOfferFee > finances.transferBudget}
                                                    className="px-6 py-3 bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black rounded-xl text-xs uppercase tracking-wider disabled:opacity-40 transition-all flex items-center justify-center min-w-[100px]"
                                                >
                                                    {isClubNegotiating ? <LoadingSpinner /> : 'OFERTAR'}
                                                </button>
                                            </div>

                                            {/* Quick Increment Buttons */}
                                            <div className="flex items-center gap-2">
                                                {[0.5, 1.0, 5.0, 10.0].map(inc => (
                                                    <button
                                                        key={inc}
                                                        onClick={() => setClubOfferFee(prev => Math.round((prev + inc) * 10) / 10)}
                                                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white/70 border border-white/5"
                                                    >
                                                        +€{inc}M
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PHASE 2: PLAYER & AGENT CONTRACT TERMS */}
                        {negotiationPhase === 'CONTRACT' && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Chat Log */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {agentChatHistory.map((msg, i) => {
                                        if (msg.sender === 'system') {
                                            return (
                                                <div key={i} className="flex justify-center">
                                                    <span className="text-[10px] font-bold text-white/50 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-center">
                                                        {msg.text}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        if (msg.sender === 'user') {
                                            return (
                                                <div key={i} className="flex justify-end animate-slide-up">
                                                    <div className="bg-[var(--apex-gold)] text-black font-black p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-xs shadow-lg">
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={i} className="flex justify-start animate-slide-up">
                                                <div className="bg-slate-800/80 border border-white/10 p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] text-white shadow-lg space-y-1">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-400 uppercase tracking-wider">
                                                        <span>Agente de {negotiatingPlayer.name}</span>
                                                    </div>
                                                    <p className="text-xs font-medium leading-relaxed">"{msg.text}"</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Contract Sliders / Inputs */}
                                <div className="p-4 bg-black/70 border-t border-white/10 space-y-3">
                                    {isContractAgreed ? (
                                        <div className="space-y-3 animate-fade-in">
                                            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-center">
                                                <h4 className="text-emerald-400 font-black uppercase text-xs">¡Acuerdo Total Alcanzado!</h4>
                                                <p className="text-white/70 text-[11px]">
                                                    Traspaso: €{agreedFee}M • Salario: {formatWeeklyWage(offeredWage)}/sem • Duración: {offeredYears} años
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleFinalizeSigning}
                                                className="w-full py-4 bg-emerald-500 text-black font-black rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-400 shadow-xl shadow-emerald-500/20"
                                            >
                                                Cerrar Fichaje y Firmar Contrato
                                            </button>
                                        </div>
                                    ) : isNegotiationDead ? (
                                        <button
                                            onClick={() => setNegotiatingPlayer(null)}
                                            className="w-full py-3 bg-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/20"
                                        >
                                            Cerrar Negociaciones
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Wage Input */}
                                                <div>
                                                    <label className="text-[9px] font-black text-white/60 uppercase tracking-wider block mb-1">
                                                        Salario Semanal (€/sem)
                                                    </label>
                                                    <input 
                                                        type="number"
                                                        step="1000"
                                                        value={offeredWage}
                                                        onChange={e => setOfferedWage(Number(e.target.value))}
                                                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-black text-xs focus:outline-none focus:border-[var(--apex-gold)]"
                                                    />
                                                </div>

                                                {/* Contract Years */}
                                                <div>
                                                    <label className="text-[9px] font-black text-white/60 uppercase tracking-wider block mb-1">
                                                        Duración del Contrato
                                                    </label>
                                                    <select
                                                        value={offeredYears}
                                                        onChange={e => setOfferedYears(Number(e.target.value))}
                                                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-black text-xs focus:outline-none focus:border-[var(--apex-gold)]"
                                                    >
                                                        <option value={1}>1 Año</option>
                                                        <option value={2}>2 Años</option>
                                                        <option value={3}>3 Años</option>
                                                        <option value={4}>4 Años</option>
                                                        <option value={5}>5 Años</option>
                                                    </select>
                                                </div>

                                                {/* Squad Role */}
                                                <div>
                                                    <label className="text-[9px] font-black text-white/60 uppercase tracking-wider block mb-1">
                                                        Rol en el Equipo
                                                    </label>
                                                    <select
                                                        value={offeredRole}
                                                        onChange={e => setOfferedRole(e.target.value as SquadRole)}
                                                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-black text-xs focus:outline-none focus:border-[var(--apex-gold)]"
                                                    >
                                                        <option value="Key">⭐ Jugador Clave</option>
                                                        <option value="FirstTeam">⚽ Titular Habitual</option>
                                                        <option value="Rotation">🔄 Rotación</option>
                                                        <option value="Prospect">🌱 Joven Promesa</option>
                                                    </select>
                                                </div>

                                                {/* Signing Bonus */}
                                                <div>
                                                    <label className="text-[9px] font-black text-white/60 uppercase tracking-wider block mb-1">
                                                        Prima de Fichaje (€M)
                                                    </label>
                                                    <input 
                                                        type="number"
                                                        step="0.1"
                                                        value={offeredBonus}
                                                        onChange={e => setOfferedBonus(Number(e.target.value))}
                                                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-black text-xs focus:outline-none focus:border-[var(--apex-gold)]"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleSendAgentOffer}
                                                disabled={isAgentNegotiating || offeredWage <= 0}
                                                className="w-full py-3 bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black rounded-xl text-xs uppercase tracking-wider disabled:opacity-40 transition-all flex items-center justify-center"
                                            >
                                                {isAgentNegotiating ? <LoadingSpinner /> : 'ENVIAR PROPUESTA AL AGENTE'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* --- COUNTER-OFFER MODAL FOR INCOMING BIDS --- */}
            {counterOfferModal && (
                <Modal 
                    title={`Contraoferta: ${counterOfferModal.player.name}`} 
                    onClose={() => setCounterOfferModal(null)}
                >
                    <div className="space-y-4 p-2">
                        <div className="bg-slate-800/60 p-4 rounded-xl border border-white/5 space-y-2">
                            <p className="text-xs text-white/70">
                                El <strong className="text-white">{counterOfferModal.buyer.name}</strong> ofreció inicialmente <strong className="text-emerald-400">€{counterOfferModal.offer.offerValue}M</strong> por {counterOfferModal.player.name}.
                            </p>
                            <p className="text-[11px] text-white/50">
                                Introduce la cantidad que exigirías para aceptar el traspaso inmediato.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-white/60 uppercase tracking-wider block">
                                Tu Contrapropuesta (€M)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--apex-gold)]">€</span>
                                <input 
                                    type="number"
                                    step="0.5"
                                    value={counterValue}
                                    onChange={e => setCounterValue(Number(e.target.value))}
                                    className="w-full pl-8 pr-12 py-3 bg-black/50 border border-white/10 rounded-xl text-white font-black text-sm focus:outline-none focus:border-[var(--apex-gold)]"
                                    disabled={isEvaluatingCounter}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[var(--apex-gold)]">M</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setCounterOfferModal(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 font-bold text-xs uppercase tracking-wider"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSendCounterToBuyer}
                                disabled={isEvaluatingCounter || counterValue <= 0}
                                className="flex-1 py-3 rounded-xl bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider disabled:opacity-40 flex items-center justify-center"
                            >
                                {isEvaluatingCounter ? <LoadingSpinner /> : 'ENVIAR AL CLUB'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
