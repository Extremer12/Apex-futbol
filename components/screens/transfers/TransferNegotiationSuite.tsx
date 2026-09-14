import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Player, Team, SquadRole } from '../../../types';
import { LoadingSpinner } from '../../icons';
import { 
    ArrowRight, 
    ChevronLeft, 
    Check, 
    UserCheck, 
    Shield, 
    FileText, 
    Sparkles, 
    Building2, 
    User, 
    Coins, 
    AlertCircle, 
    X, 
    Award, 
    PenTool, 
    TrendingUp, 
    Wallet,
    Flame
} from 'lucide-react';
import { formatCurrency, formatWeeklyWage } from '../../../utils';
import { PlayerAvatar } from '../../ui/PlayerAvatar';
import { TeamLogo } from '../../../data/teams/helpers';
import { ClubChatMessage } from './ClubNegotiationModal';
import { AgentChatMessage } from './ContractNegotiationModal';

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

const roleDescriptions: Record<SquadRole, { label: string; tag: string; description: string }> = {
    Key: { label: 'Jugador Clave', tag: 'Estrella', description: 'Pilar del proyecto y titular indiscutible' },
    FirstTeam: { label: 'Titular', tag: 'Principal', description: 'Participación constante en el once inicial' },
    Rotation: { label: 'Rotación', tag: 'Secundario', description: 'Minutos repartidos y alternativas tácticas' },
    Prospect: { label: 'Promesa', tag: 'Futuro', description: 'Proyección y desarrollo a mediano plazo' },
};

export const TransferNegotiationSuite: React.FC<TransferNegotiationSuiteProps> = ({
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
    // Mobile modal for detailed scouting dossier
    const [showMobileDossier, setShowMobileDossier] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    const marketValue = negotiatingPlayer.value || 1_000_000;
    const valueRatio = Math.round((clubOfferFee / marketValue) * 100);
    const currentWage = negotiatingPlayer.wage || 10_000;
    const wageDifferencePercent = Math.round(((offeredWage - currentWage) / currentWage) * 100);

    const maxPatienceAttempts = 3;
    const remainingAttempts = Math.max(0, maxPatienceAttempts - clubAttempts);

    // Auto-scroll chat to bottom
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

    // Financial calculations
    const remainingBudgetAfterFee = transferBudget - clubOfferFee;
    const isFeeAffordable = clubOfferFee <= transferBudget;

    // Stage definition
    const currentStage = isContractAgreed ? 3 : negotiationPhase === 'CONTRACT' ? 2 : 1;

    return (
        <div className="fixed inset-0 z-50 bg-[#070A13] text-white flex flex-col overflow-hidden animate-fade-in select-none">
            {/* Ambient executive atmosphere backdrops */}
            <div className="absolute top-0 left-1/3 w-[500px] h-[250px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] bg-[var(--apex-gold)]/10 blur-[130px] rounded-full pointer-events-none" />

            {/* TOP PRESIDENTIAL NAVIGATION BAR */}
            <header className="h-16 px-4 sm:px-6 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shrink-0 relative z-30">
                {/* Left: Back button */}
                <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4 text-[var(--apex-gold)]" />
                    <span className="hidden sm:inline">Volver al mercado</span>
                    <span className="sm:hidden">Salir</span>
                </button>

                {/* Center: Presidential 3-Stage Indicator */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                    {/* Stage 1: Club Transfer */}
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

                    {/* Stage 2: Contract */}
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

                    {/* Stage 3: Official Signing */}
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

                {/* Right: Club Treasury Status */}
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-wider block">Presupuesto</span>
                        <span className="text-xs sm:text-sm font-black text-[var(--apex-gold)]">{formatCurrency(transferBudget)}</span>
                    </div>
                </div>
            </header>

            {/* COMPACT PLAYER STRIP (Visible on mobile/tablet to avoid screen hoarding) */}
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
                            {sellingTeam?.name || 'Club Libre'} • Val: <strong className="text-emerald-400">{formatCurrency(marketValue)}</strong>
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
                {/* DESKTOP LEFT DOSSIER (Executive Scouting Briefing) */}
                <aside className="hidden lg:flex lg:col-span-4 bg-[#0B0F19]/60 border-r border-white/10 p-6 flex-col justify-between overflow-y-auto custom-scrollbar backdrop-blur-md">
                    <div className="space-y-6">
                        {/* Presidential Heading Badge */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--apex-gold)] flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" />
                                Informe de Dirección Deportiva
                            </span>
                            <span className="text-[10px] font-bold text-white/40">Apex Intel</span>
                        </div>

                        {/* Player Hero Profile */}
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-3">
                                <PlayerAvatar
                                    player={negotiatingPlayer}
                                    className="w-24 h-24 rounded-full border-2 border-white/20 shadow-2xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                                    primaryColor={sellingTeam?.primaryColor}
                                />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-[var(--apex-gold)] text-black font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg">
                                    {negotiatingPlayer.rating} OVR
                                </div>
                            </div>

                            <h1 className="text-xl font-black text-white tracking-tight">{negotiatingPlayer.name}</h1>

                            <div className="flex items-center gap-2 mt-1.5">
                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${positionStyle.border} ${positionStyle.bg} ${positionStyle.color}`}>
                                    {positionStyle.name}
                                </span>
                                {negotiatingPlayer.age && (
                                    <span className="text-xs text-white/60 font-semibold">
                                        {negotiatingPlayer.age} años
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Market & Financial Specs */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Valor de Mercado</span>
                                <span className="text-sm font-black text-emerald-400">{formatCurrency(marketValue)}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Ficha Actual</span>
                                <span className="text-sm font-black text-white/90">{formatWeeklyWage(currentWage)}</span>
                            </div>
                        </div>

                        {/* Current Club Context */}
                        {sellingTeam && (
                            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                                <div className="w-9 h-9 shrink-0">
                                    <TeamLogo team={sellingTeam} className="w-full h-full" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Club Propietario</span>
                                    <h4 className="text-xs font-bold text-white truncate">{sellingTeam.name}</h4>
                                </div>
                            </div>
                        )}

                        {/* Patience / Tension Level */}
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-white/60 font-bold flex items-center gap-1">
                                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                                    Tolerancia de la Contraparte
                                </span>
                                <span className={`text-xs font-black uppercase ${
                                    remainingAttempts === 3 ? 'text-emerald-400' : remainingAttempts === 2 ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                    {remainingAttempts === 3 ? 'Receptiva' : remainingAttempts === 2 ? 'Tensa' : remainingAttempts === 1 ? 'Último Intento' : 'Roto'}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5 h-1.5">
                                {[1, 2, 3].map((step) => (
                                    <div 
                                        key={step} 
                                        className={`rounded-full transition-all duration-300 ${
                                            step <= remainingAttempts 
                                                ? remainingAttempts === 3 ? 'bg-emerald-400' : remainingAttempts === 2 ? 'bg-amber-400' : 'bg-rose-400' 
                                                : 'bg-white/10'
                                        }`} 
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] text-white/40 block leading-tight">
                                {remainingAttempts > 0 
                                    ? `Quedan ${remainingAttempts} intento(s) formales antes de que abandonen la mesa.` 
                                    : 'Las negociaciones han colapsado de forma definitiva.'}
                            </span>
                        </div>

                        {/* Strategic Presidential Tip */}
                        <div className="p-3 rounded-xl bg-[var(--apex-gold)]/5 border border-[var(--apex-gold)]/15 flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-[var(--apex-gold)] shrink-0 mt-0.5" />
                            <p className="text-[11px] text-white/70 leading-relaxed">
                                Como presidente, mantener el equilibrio financiero garantiza la estabilidad institucional y el respeto del vestuario.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 text-[9px] text-white/30 text-center uppercase tracking-wider font-bold">
                        Gabinete Presidencial • Apex Management Suite
                    </div>
                </aside>

                {/* RIGHT EXECUTIVE BOARDROOM (Live Dialogue & Presidential Deck) */}
                <section className="lg:col-span-8 flex flex-col h-full bg-[#050811]/50 overflow-hidden">
                    {/* Counterpart Identity Dossier Bar */}
                    <div className="px-4 sm:px-6 py-3 border-b border-white/10 bg-[#0B0F19]/40 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                                {currentStage === 1 ? <Building2 className="w-4 h-4 text-[var(--apex-gold)]" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                                    <span>
                                        {currentStage === 1 
                                            ? `Dirección Deportiva • ${sellingTeam?.name || 'Club Propietario'}` 
                                            : `Agencia de Representación • ${negotiatingPlayer.name}`}
                                    </span>
                                </h3>
                                <p className="text-[10px] text-white/50">
                                    {currentStage === 1
                                        ? 'Negociación directa por los derechos federativos y traspaso económico.'
                                        : 'Negociación de ficha salarial semanal, duración y condiciones laborales.'}
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

                    {/* PRESIDENTIAL DIALOGUE FEED */}
                    <div 
                        ref={chatScrollRef}
                        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar min-h-0"
                    >
                        {negotiationPhase === 'CLUB' ? (
                            clubChatHistory.map((msg, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'} animate-fade-in`}
                                >
                                    {msg.sender === 'system' ? (
                                        <div className="text-[11px] font-semibold text-white/60 bg-white/[0.04] border border-white/5 px-3.5 py-1.5 rounded-full text-center max-w-[90%]">
                                            {msg.text}
                                        </div>
                                    ) : msg.sender === 'user' ? (
                                        <div className="bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 text-black font-black px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] sm:max-w-[70%] text-xs shadow-lg">
                                            <div className="text-[9px] text-black/60 uppercase font-bold mb-0.5 tracking-wider">Tu Propuesta Presidencial</div>
                                            {msg.text}
                                        </div>
                                    ) : (
                                        <div className="bg-slate-900/90 border border-white/15 p-4 rounded-2xl rounded-tl-xs max-w-[90%] sm:max-w-[80%] text-white shadow-xl space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-[var(--apex-gold)] uppercase tracking-wider flex items-center gap-1.5">
                                                    <Building2 className="w-3 h-3" />
                                                    Respuesta del {sellingTeam?.name || 'Club'}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium leading-relaxed text-slate-200">
                                                "{msg.text}"
                                            </p>
                                            {msg.counter && (
                                                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs bg-black/30 -mx-4 -mb-4 p-3 rounded-b-2xl">
                                                    <span className="text-white/60 text-[11px] font-bold">Exigencia mínima del club:</span>
                                                    <span className="font-black text-[var(--apex-gold)] text-sm">{formatCurrency(msg.counter)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            agentChatHistory.map((msg, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'} animate-fade-in`}
                                >
                                    {msg.sender === 'system' ? (
                                        <div className="text-[11px] font-semibold text-white/60 bg-white/[0.04] border border-white/5 px-3.5 py-1.5 rounded-full text-center max-w-[90%]">
                                            {msg.text}
                                        </div>
                                    ) : msg.sender === 'user' ? (
                                        <div className="bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 text-black font-black px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] sm:max-w-[70%] text-xs shadow-lg">
                                            <div className="text-[9px] text-black/60 uppercase font-bold mb-0.5 tracking-wider">Oferta Contractual Presentada</div>
                                            {msg.text}
                                        </div>
                                    ) : (
                                        <div className="bg-slate-900/90 border border-white/15 p-4 rounded-2xl rounded-tl-xs max-w-[90%] sm:max-w-[80%] text-white shadow-xl space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <UserCheck className="w-3 h-3" />
                                                    Representante Oficial
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium leading-relaxed text-slate-200">
                                                "{msg.text}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* PRESIDENTIAL ACTION DECK (Docked at the bottom) */}
                    <div className="p-4 sm:p-5 bg-[#080C16] border-t border-white/10 shrink-0 relative z-20">
                        {/* CASE 1: NEGOTIATION COLLAPSED / DEAD */}
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
                            /* CASE 2: STAGE 3 - PRESIDENTIAL SIGNING CEREMONY */
                            <div className="space-y-4 animate-fade-in">
                                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900/90 border border-emerald-500/30 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                                            <Award className="w-4 h-4" />
                                            ¡Acuerdo Total Alcanzado!
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                                            Listo para Rúbrica
                                        </span>
                                    </div>

                                    {/* Deal Summary Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                            <span className="text-[9px] text-white/40 uppercase font-bold block">Traspaso al Club</span>
                                            <span className="text-xs font-black text-[var(--apex-gold)]">{formatCurrency(agreedFee)}</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                            <span className="text-[9px] text-white/40 uppercase font-bold block">Ficha Semanal</span>
                                            <span className="text-xs font-black text-emerald-400">{formatWeeklyWage(offeredWage)}</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                            <span className="text-[9px] text-white/40 uppercase font-bold block">Duración</span>
                                            <span className="text-xs font-black text-white">{offeredYears} temporadas</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                            <span className="text-[9px] text-white/40 uppercase font-bold block">Rol en Equipo</span>
                                            <span className="text-xs font-black text-white">{roleDescriptions[offeredRole].label}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={onFinalizeSigning}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                                >
                                    <PenTool className="w-4 h-4" />
                                    <span>Estampar Rúbrica Presidencial y Anunciar Fichaje</span>
                                </button>
                            </div>
                        ) : negotiationPhase === 'CLUB' ? (
                            /* CASE 3: STAGE 1 - CLUB TRANSFER FEE NEGOTIATION */
                            agreedFee !== null ? (
                                <div className="space-y-3.5 animate-fade-in">
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                                <Check className="w-5 h-5 stroke-[3]" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Traspaso Acordado con el Club</h4>
                                                <p className="text-[11px] text-white/70">Monto pactado: <strong className="text-white">{formatCurrency(agreedFee)}</strong></p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onProceedToContract}
                                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                                    >
                                        <span>Avanzar a la Negociación de Contrato del Jugador</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Proposal Header & Ratio Tag */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Propuesta de Traspaso</span>
                                            <span className="text-lg sm:text-xl font-black text-[var(--apex-gold)] tracking-tight">
                                                {formatCurrency(clubOfferFee)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                                                valueRatio >= 115 
                                                    ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30' 
                                                    : valueRatio >= 90 
                                                        ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30' 
                                                        : 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
                                            }`}>
                                                {valueRatio}% del Valor de Mercado
                                            </span>
                                        </div>
                                    </div>

                                    {/* Slider */}
                                    <input
                                        type="range"
                                        min={500_000}
                                        max={Math.max(marketValue * 2, transferBudget)}
                                        step={500_000}
                                        value={clubOfferFee}
                                        onChange={e => setClubOfferFee(Number(e.target.value))}
                                        className="w-full accent-[var(--apex-gold)] cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                                        disabled={isClubNegotiating}
                                    />

                                    {/* Ergonomic Quick Preset & Stepper Buttons */}
                                    <div className="grid grid-cols-5 gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setClubOfferFee(prev => Math.max(500_000, prev - 5_000_000))}
                                            className="py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                                        >
                                            -5M
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClubOfferFee(prev => Math.max(500_000, prev - 1_000_000))}
                                            className="py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                                        >
                                            -1M
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClubOfferFee(marketValue)}
                                            className="py-1.5 bg-[var(--apex-gold)]/10 hover:bg-[var(--apex-gold)]/20 rounded-lg text-[11px] font-black text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 cursor-pointer active:scale-95 truncate px-1"
                                        >
                                            100% Valor
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClubOfferFee(prev => Math.min(transferBudget, prev + 1_000_000))}
                                            className="py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                                        >
                                            +1M
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClubOfferFee(prev => Math.min(transferBudget, prev + 5_000_000))}
                                            className="py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                                        >
                                            +5M
                                        </button>
                                    </div>

                                    {/* Budget Impact Indicator */}
                                    <div className="flex items-center justify-between text-[11px] px-1">
                                        <span className="text-white/40">Presupuesto restante tras traspaso:</span>
                                        <span className={`font-black ${remainingBudgetAfterFee >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {formatCurrency(remainingBudgetAfterFee)}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={onSendClubOffer}
                                        disabled={isClubNegotiating || clubOfferFee <= 0 || !isFeeAffordable}
                                        className="w-full py-3.5 bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[var(--apex-gold)]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                                    >
                                        {isClubNegotiating ? <LoadingSpinner /> : (
                                            <>
                                                <Building2 className="w-4 h-4" />
                                                <span>Presentar Oferta Formal de {formatCurrency(clubOfferFee)}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )
                        ) : (
                            /* CASE 4: STAGE 2 - CONTRACT NEGOTIATION WITH AGENT */
                            <div className="space-y-3.5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* 1. Weekly Wage */}
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Salario Semanal</span>
                                            <span className="font-black text-emerald-400 text-xs">{formatWeeklyWage(offeredWage)}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setOfferedWage(Math.max(2000, offeredWage - 5000))}
                                                className="px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-white border border-white/5 cursor-pointer"
                                            >
                                                -5K
                                            </button>
                                            <input
                                                type="number"
                                                value={Math.round(offeredWage / 1000)}
                                                onChange={e => setOfferedWage(Math.max(1000, Number(e.target.value) * 1000))}
                                                className="flex-1 py-1 px-1 bg-black/60 border border-white/10 rounded-lg text-white font-black text-xs text-center focus:outline-none focus:border-[var(--apex-gold)]"
                                            />
                                            <span className="text-[10px] text-white/40 font-bold">K</span>
                                            <button
                                                type="button"
                                                onClick={() => setOfferedWage(offeredWage + 5000)}
                                                className="px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-white border border-white/5 cursor-pointer"
                                            >
                                                +5K
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-white/40">Cobra: {formatWeeklyWage(currentWage)}</span>
                                            <span className={`font-bold ${wageDifferencePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {wageDifferencePercent >= 0 ? `+${wageDifferencePercent}%` : `${wageDifferencePercent}%`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 2. Contract Years */}
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Duración</span>
                                            <span className="font-black text-white text-xs">{offeredYears} temporadas</span>
                                        </div>
                                        <div className="grid grid-cols-5 gap-1">
                                            {[1, 2, 3, 4, 5].map((yrs) => (
                                                <button
                                                    key={yrs}
                                                    type="button"
                                                    onClick={() => setOfferedYears(yrs)}
                                                    className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                                        offeredYears === yrs
                                                            ? 'bg-[var(--apex-gold)] text-black shadow-md font-black'
                                                            : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                                                    }`}
                                                >
                                                    {yrs}a
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-white/40 block">Vigencia del vínculo contractual</span>
                                    </div>

                                    {/* 3. Squad Role */}
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Rol en Plantilla</span>
                                            <span className="font-black text-[var(--apex-gold)] text-xs">{roleDescriptions[offeredRole].tag}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1">
                                            {(['Key', 'FirstTeam', 'Rotation', 'Prospect'] as SquadRole[]).map((r) => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setOfferedRole(r)}
                                                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold truncate transition-all cursor-pointer ${
                                                        offeredRole === r
                                                            ? 'bg-[var(--apex-gold)] text-black font-black shadow-md'
                                                            : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                                                    }`}
                                                >
                                                    {roleDescriptions[r].label}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-white/40 truncate block">
                                            {roleDescriptions[offeredRole].description}
                                        </span>
                                    </div>
                                </div>

                                {/* Send Agent Offer Button */}
                                <button
                                    onClick={onSendAgentOffer}
                                    disabled={isAgentNegotiating || offeredWage <= 0}
                                    className="w-full py-3.5 bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[var(--apex-gold)]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                                >
                                    {isAgentNegotiating ? <LoadingSpinner /> : (
                                        <>
                                            <UserCheck className="w-4 h-4" />
                                            <span>Proponer Términos al Representante</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* MOBILE SCOUTING DOSSIER MODAL (Sliding drawer when user wants to inspect stats) */}
            {showMobileDossier && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
                    <div className="w-full sm:max-w-md bg-[#0F1423] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--apex-gold)] flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Dossier Técnico de Scouting
                            </h3>
                            <button
                                onClick={() => setShowMobileDossier(false)}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Player Header */}
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <PlayerAvatar
                                    player={negotiatingPlayer}
                                    className="w-16 h-16 rounded-full border-2 border-white/20"
                                    primaryColor={sellingTeam?.primaryColor}
                                />
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[var(--apex-gold)] text-black font-black text-[10px] px-2 rounded-full">
                                    {negotiatingPlayer.rating} OVR
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg font-black text-white truncate">{negotiatingPlayer.name}</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${positionStyle.bg} ${positionStyle.color}`}>
                                        {positionStyle.name}
                                    </span>
                                    {negotiatingPlayer.age && (
                                        <span className="text-xs text-white/50">{negotiatingPlayer.age} años</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-[9px] font-bold text-white/40 uppercase block">Valor de Mercado</span>
                                <span className="text-sm font-black text-emerald-400">{formatCurrency(marketValue)}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-[9px] font-bold text-white/40 uppercase block">Ficha Actual</span>
                                <span className="text-sm font-black text-white">{formatWeeklyWage(currentWage)}</span>
                            </div>
                        </div>

                        {/* Selling Club */}
                        {sellingTeam && (
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                                <div className="w-8 h-8 shrink-0">
                                    <TeamLogo team={sellingTeam} className="w-full h-full" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-white/40 uppercase block">Club Propietario</span>
                                    <h4 className="text-xs font-bold text-white">{sellingTeam.name}</h4>
                                </div>
                            </div>
                        )}

                        {/* Patience status */}
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-white/60 font-bold">Paciencia restante</span>
                                <span className={`font-black uppercase ${
                                    remainingAttempts === 3 ? 'text-emerald-400' : remainingAttempts === 2 ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                    {remainingAttempts} / 3 intentos
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 h-1.5">
                                {[1, 2, 3].map((step) => (
                                    <div 
                                        key={step} 
                                        className={`rounded-full ${
                                            step <= remainingAttempts 
                                                ? remainingAttempts === 3 ? 'bg-emerald-400' : remainingAttempts === 2 ? 'bg-amber-400' : 'bg-rose-400' 
                                                : 'bg-white/10'
                                        }`} 
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowMobileDossier(false)}
                            className="w-full py-3 bg-[var(--apex-gold)] text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                        >
                            Regresar a la Sala de Negociación
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
