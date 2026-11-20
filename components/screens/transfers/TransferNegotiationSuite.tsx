import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Player, Team, SquadRole } from '../../../types';
import { 
    ChevronLeft, 
    Check, 
    UserCheck, 
    Building2, 
    AlertCircle, 
    PenTool, 
    FileText 
} from 'lucide-react';
import { formatCurrency } from '../../../utils';
import { PlayerAvatar } from '../../ui/PlayerAvatar';
import { ClubChatMessage } from './ClubNegotiationModal';
import { AgentChatMessage } from './ContractNegotiationModal';
import { NegotiationDossier } from './negotiation/NegotiationDossier';
import { NegotiationChatFeed } from './negotiation/NegotiationChatFeed';
import { ClubFeeNegotiator } from './negotiation/ClubFeeNegotiator';
import { ContractNegotiator } from './negotiation/ContractNegotiator';
import { SigningCeremony } from './negotiation/SigningCeremony';

interface TransferNegotiationSuiteProps {
    negotiatingPlayer: Player;
    sellingTeam?: Team;
    myTeam: Team;
    transferBudget: number;
    clubBalance: number;
    negotiationPhase: 'CLUB' | 'CONTRACT';
    
    // Phase 1: Club
    clubOfferFee: number;
    setClubOfferFee: React.Dispatch<React.SetStateAction<number>>;
    clubChatHistory: ClubChatMessage[];
    clubAttempts: number;
    isClubNegotiating: boolean;
    agreedFee: number | null;
    onSendClubOffer: () => void;
    onProceedToContract: () => void;

    // Phase 2: Contract
    offeredWage: number;
    setOfferedWage: (wage: number) => void;
    offeredYears: number;
    setOfferedYears: (years: number) => void;
    offeredRole: SquadRole;
    setOfferedRole: (role: SquadRole) => void;
    offeredBonus: number;
    setOfferedBonus: (bonus: number) => void;
    agentChatHistory: AgentChatMessage[];
    isAgentNegotiating: boolean;
    isContractAgreed: boolean;
    onSendAgentOffer: () => void;
    onFinalizeSigning: () => void;

    // Global
    isNegotiationDead: boolean;
    onClose: () => void;
}

const roleDescriptions: Record<SquadRole, { label: string; badge: string; desc: string }> = {
    Key: { label: 'Jugador Clave', badge: 'Estrella', desc: 'Titular indiscutible y líder del proyecto' },
    FirstTeam: { label: 'Titular Habitual', badge: 'Titular', desc: 'Participación en el once inicial' },
    Rotation: { label: 'Rotación', badge: 'Recambio', desc: 'Alternativas tácticas y minutos repartidos' },
    Prospect: { label: 'Joven Promesa', badge: 'Futuro', desc: 'Desarrollo progresivo con proyección' },
};

export const TransferNegotiationSuite: React.FC<TransferNegotiationSuiteProps> = React.memo(({
    negotiatingPlayer,
    sellingTeam,
    myTeam,
    transferBudget,
    clubBalance,
    negotiationPhase,
    clubOfferFee,
    setClubOfferFee,
    clubChatHistory,
    clubAttempts,
    isClubNegotiating,
    agreedFee,
    onSendClubOffer,
    onProceedToContract,
    offeredWage,
    setOfferedWage,
    offeredYears,
    setOfferedYears,
    offeredRole,
    setOfferedRole,
    offeredBonus,
    setOfferedBonus,
    agentChatHistory,
    isAgentNegotiating,
    isContractAgreed,
    onSendAgentOffer,
    onFinalizeSigning,
    isNegotiationDead,
    onClose,
}) => {
    const [showMobileDossier, setShowMobileDossier] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Defensive normalization of financial amounts
    const normMarketValue = useMemo(() => {
        const val = negotiatingPlayer.value;
        if (val && val > 0 && val < 10_000) return val * 1_000_000;
        return val || 1_000_000;
    }, [negotiatingPlayer.value]);

    const normBudget = useMemo(() => {
        if (transferBudget && transferBudget > 0 && transferBudget < 10_000) {
            return transferBudget * 1_000_000;
        }
        return transferBudget || 5_000_000;
    }, [transferBudget]);

    const normBalance = useMemo(() => {
        if (clubBalance && clubBalance > 0 && clubBalance < 10_000) {
            return clubBalance * 1_000_000;
        }
        return clubBalance || 5_000_000;
    }, [clubBalance]);

    useEffect(() => {
        if (clubOfferFee > 0 && clubOfferFee < 10_000) {
            setClubOfferFee(clubOfferFee * 1_000_000);
        }
    }, [clubOfferFee, setClubOfferFee]);

    const activeOfferFee = clubOfferFee < 10_000 ? clubOfferFee * 1_000_000 : clubOfferFee;
    const valueRatio = Math.round((activeOfferFee / normMarketValue) * 100);

    const currentWage = useMemo(() => {
        return negotiatingPlayer.wage || 10_000;
    }, [negotiatingPlayer.wage]);

    const wageDifferencePercent = Math.round(((offeredWage - currentWage) / currentWage) * 100);
    const maxPatienceAttempts = 3;
    const remainingAttempts = Math.max(0, maxPatienceAttempts - clubAttempts);

    // Auto-scroll chat to bottom on new messages
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [clubChatHistory, agentChatHistory, isClubNegotiating, isAgentNegotiating]);

    const positionStyle = useMemo(() => {
        switch (negotiatingPlayer.position) {
            case 'POR': return { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', name: 'Portero' };
            case 'DEF': return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', name: 'Defensa' };
            case 'CEN': return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', name: 'Centrocampista' };
            case 'DEL': return { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30', name: 'Delantero' };
            default: return { color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/30', name: negotiatingPlayer.position };
        }
    }, [negotiatingPlayer.position]);

    const maxAllowedFee = Math.max(normBalance, normBudget, normMarketValue * 2);
    const remainingBudgetAfterFee = normBudget - activeOfferFee;
    const remainingBalanceAfterFee = normBalance - activeOfferFee;
    const isFeeAffordable = activeOfferFee <= normBalance;
    const currentStage = isContractAgreed ? 3 : negotiationPhase === 'CONTRACT' ? 2 : 1;

    const adjustFee = (delta: number) => {
        setClubOfferFee(prev => {
            const current = prev < 10_000 ? prev * 1_000_000 : prev;
            return Math.max(500_000, Math.min(maxAllowedFee, current + delta));
        });
    };

    const adjustWage = (delta: number) => {
        setOfferedWage(Math.max(2000, offeredWage + delta));
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#070A13] text-white flex flex-col overflow-hidden animate-fade-in select-none">
            <div className="absolute top-0 left-1/3 w-[500px] h-[250px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] bg-[var(--apex-gold)]/10 blur-[130px] rounded-full pointer-events-none" />

            {/* TOP PRESIDENTIAL NAVIGATION BAR */}
            <header className="h-16 px-4 sm:px-6 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shrink-0 relative z-30">
                <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4 text-[var(--apex-gold)]" />
                    <span className="hidden sm:inline">Volver al mercado</span>
                    <span className="sm:hidden">Salir</span>
                </button>

                {/* Presidential 3-Stage Indicator */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                    <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
                        currentStage === 1
                            ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-[var(--apex-gold)]/20 font-black'
                            : currentStage > 1
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'text-white/40 border border-white/5'
                    }`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            currentStage === 1 ? 'bg-black/20 font-black' : currentStage > 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10'
                        }`}>
                            {currentStage > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
                        </span>
                        <span className="hidden md:inline">1. Traspaso Club</span>
                        <span className="md:hidden">1. Club</span>
                    </div>

                    <div className={`w-3 sm:w-6 h-[1px] ${currentStage > 1 ? 'bg-emerald-500/50' : 'bg-white/15'}`} />

                    <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
                        currentStage === 2
                            ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-[var(--apex-gold)]/20 font-black'
                            : currentStage > 2
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'text-white/40 border border-white/5'
                    }`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            currentStage === 2 ? 'bg-black/20 font-black' : currentStage > 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10'
                        }`}>
                            {currentStage > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : '2'}
                        </span>
                        <span className="hidden md:inline">2. Contrato Jugador</span>
                        <span className="md:hidden">2. Contrato</span>
                    </div>

                    <div className={`w-3 sm:w-6 h-[1px] ${currentStage > 2 ? 'bg-emerald-500/50' : 'bg-white/15'}`} />

                    <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
                        currentStage === 3
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black shadow-lg shadow-emerald-500/20'
                            : 'text-white/40 border border-white/5'
                    }`}>
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-black/20 font-black">
                            <PenTool className="w-2.5 h-2.5" />
                        </span>
                        <span className="hidden md:inline">3. Firma Oficial</span>
                        <span className="md:hidden">3. Firma</span>
                    </div>
                </div>

                {/* Club Treasury Status */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right">
                        <span className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-wider block">Saldo Total</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-400">{formatCurrency(normBalance)}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="text-right">
                        <span className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-wider block">Presupuesto Fichajes</span>
                        <span className="text-xs sm:text-sm font-black text-[var(--apex-gold)]">{formatCurrency(normBudget)}</span>
                    </div>
                </div>
            </header>

            {/* COMPACT PLAYER STRIP (Mobile) */}
            <div className="lg:hidden px-4 py-2.5 bg-[#0B0F19]/95 border-b border-white/10 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                        <PlayerAvatar
                            player={negotiatingPlayer}
                            className="w-10 h-10 rounded-full border border-white/20"
                            primaryColor={sellingTeam?.primaryColor}
                        />
                        <span className="absolute -bottom-1 -right-1 bg-[var(--apex-gold)] text-black text-[9px] font-black px-1 rounded-full">
                            {negotiatingPlayer.rating}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h2 className="text-xs font-black text-white truncate">{negotiatingPlayer.name}</h2>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${positionStyle.bg} ${positionStyle.color}`}>
                                {negotiatingPlayer.position}
                            </span>
                        </div>
                        <p className="text-[10px] text-white/50 truncate">
                            {sellingTeam?.name || 'Club Libre'} • Val: <strong className="text-emerald-400">{formatCurrency(normMarketValue)}</strong>
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowMobileDossier(true)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg border border-white/10 text-[11px] font-bold cursor-pointer transition-all active:scale-95"
                >
                    <FileText className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                    <span>Informe</span>
                </button>
            </div>

            {/* MAIN PRESIDENTIAL WORKSPACE */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative z-10">
                <NegotiationDossier
                    negotiatingPlayer={negotiatingPlayer}
                    sellingTeam={sellingTeam}
                    normMarketValue={normMarketValue}
                    currentWage={currentWage}
                    remainingAttempts={remainingAttempts}
                    positionStyle={positionStyle}
                />

                {/* BOARDROOM SECTION */}
                <section className="lg:col-span-8 flex flex-col h-full bg-[#050811]/50 overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 border-b border-white/10 bg-[#0B0F19]/40 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                                {currentStage === 1 ? <Building2 className="w-4 h-4 text-[var(--apex-gold)]" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                    {currentStage === 1 
                                        ? `Dirección Deportiva • ${sellingTeam?.name || 'Club Propietario'}` 
                                        : `Representante Oficial • ${negotiatingPlayer.name}`}
                                </h3>
                                <p className="text-[10px] text-white/50">
                                    {currentStage === 1
                                        ? 'Negociación directa por los derechos federativos y monto de traspaso.'
                                        : 'Negociación de sueldo semanal, duración del contrato y rol en el plantel.'}
                                </p>
                            </div>
                        </div>

                        {agreedFee !== null && (
                            <div className="text-right pl-3 border-l border-white/10 shrink-0">
                                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">Traspaso Fijado</span>
                                <span className="text-xs font-black text-white">{formatCurrency(agreedFee)}</span>
                            </div>
                        )}
                    </div>

                    <NegotiationChatFeed
                        negotiationPhase={negotiationPhase}
                        clubChatHistory={clubChatHistory}
                        agentChatHistory={agentChatHistory}
                        sellingTeam={sellingTeam}
                        negotiatingPlayer={negotiatingPlayer}
                        chatScrollRef={chatScrollRef}
                    />

                    {/* PRESIDENTIAL ACTION DECK */}
                    <div className="p-4 sm:p-5 bg-[#080C16] border-t border-white/10 shrink-0 relative z-20">
                        {isNegotiationDead ? (
                            <div className="space-y-3 text-center py-2 animate-fade-in">
                                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>Las negociaciones se han roto definitivamente. La contraparte se ha levantado de la mesa.</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                                >
                                    Cerrar y volver al mercado
                                </button>
                            </div>
                        ) : isContractAgreed ? (
                            <SigningCeremony
                                agreedFee={agreedFee}
                                offeredWage={offeredWage}
                                offeredYears={offeredYears}
                                offeredRole={offeredRole}
                                roleDescriptions={roleDescriptions}
                                onFinalizeSigning={onFinalizeSigning}
                            />
                        ) : negotiationPhase === 'CLUB' ? (
                            <ClubFeeNegotiator
                                activeOfferFee={activeOfferFee}
                                normMarketValue={normMarketValue}
                                normBudget={normBudget}
                                normBalance={normBalance}
                                maxAllowedFee={maxAllowedFee}
                                valueRatio={valueRatio}
                                isFeeAffordable={isFeeAffordable}
                                isClubNegotiating={isClubNegotiating}
                                agreedFee={agreedFee}
                                remainingBudgetAfterFee={remainingBudgetAfterFee}
                                remainingBalanceAfterFee={remainingBalanceAfterFee}
                                setClubOfferFee={setClubOfferFee}
                                adjustFee={adjustFee}
                                onSendClubOffer={onSendClubOffer}
                                onProceedToContract={onProceedToContract}
                            />
                        ) : (
                            <ContractNegotiator
                                offeredWage={offeredWage}
                                currentWage={currentWage}
                                offeredYears={offeredYears}
                                offeredRole={offeredRole}
                                wageDifferencePercent={wageDifferencePercent}
                                isAgentNegotiating={isAgentNegotiating}
                                roleDescriptions={roleDescriptions}
                                setOfferedWage={setOfferedWage}
                                setOfferedYears={setOfferedYears}
                                setOfferedRole={setOfferedRole}
                                adjustWage={adjustWage}
                                onSendAgentOffer={onSendAgentOffer}
                            />
                        )}
                    </div>
                </section>
            </main>

            {/* Mobile Drawer */}
            {showMobileDossier && (
                <NegotiationDossier
                    negotiatingPlayer={negotiatingPlayer}
                    sellingTeam={sellingTeam}
                    normMarketValue={normMarketValue}
                    currentWage={currentWage}
                    remainingAttempts={remainingAttempts}
                    positionStyle={positionStyle}
                    isMobileDrawer={true}
                    onCloseMobile={() => setShowMobileDossier(false)}
                />
            )}
        </div>
    );
});
