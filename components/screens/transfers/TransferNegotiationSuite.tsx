import React, { useMemo } from 'react';
import { Player, Team, SquadRole } from '../../../types';
import { LoadingSpinner } from '../../icons';
import { ArrowRight, ChevronLeft, Check, UserCheck, Shield } from 'lucide-react';
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
    const marketValue = negotiatingPlayer.value || 1_000_000;
    const valueRatio = Math.round((clubOfferFee / marketValue) * 100);

    const positionColor = useMemo(() => {
        switch (negotiatingPlayer.position) {
            case 'POR': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'DEF': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'CEN': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'DEL': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-slate-300 bg-slate-300/10 border-slate-300/20';
        }
    }, [negotiatingPlayer.position]);

    const positionFullName = useMemo(() => {
        switch (negotiatingPlayer.position) {
            case 'POR': return 'Portero';
            case 'DEF': return 'Defensa';
            case 'CEN': return 'Centrocampista';
            case 'DEL': return 'Delantero';
            default: return negotiatingPlayer.position;
        }
    }, [negotiatingPlayer.position]);

    const maxPatienceAttempts = 3;
    const remainingAttempts = Math.max(0, maxPatienceAttempts - clubAttempts);

    return (
        <div className="fixed inset-0 z-50 bg-[#060911] text-white flex flex-col overflow-hidden animate-fade-in select-none">
            {/* Ambient subtle backdrops */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-[var(--apex-gold)]/5 blur-[120px] rounded-full pointer-events-none" />

            {/* TOP HEADER */}
            <header className="h-16 px-6 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0 relative z-20">
                {/* Back button */}
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Volver al mercado</span>
                </button>

                {/* Stepper Indicator */}
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide transition-all ${
                        negotiationPhase === 'CLUB'
                            ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-[var(--apex-gold)]/20 font-black'
                            : agreedFee !== null
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'text-white/40 border border-white/5'
                    }`}>
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-black/20 font-black">
                            {agreedFee !== null ? <Check className="w-3 h-3" /> : '1'}
                        </span>
                        <span>Traspaso con el Club</span>
                    </div>

                    <div className="w-6 h-[1px] bg-white/20" />

                    <div className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide transition-all ${
                        negotiationPhase === 'CONTRACT'
                            ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-[var(--apex-gold)]/20 font-black'
                            : isContractAgreed
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'text-white/40 border border-white/5'
                    }`}>
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-black/20 font-black">
                            {isContractAgreed ? <Check className="w-3 h-3" /> : '2'}
                        </span>
                        <span>Contrato del Jugador</span>
                    </div>
                </div>

                {/* Financial Overview */}
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Presupuesto Fichajes</span>
                        <span className="text-xs font-black text-[var(--apex-gold)]">{formatCurrency(transferBudget)}</span>
                    </div>
                    <div className="text-right border-l border-white/10 pl-6 hidden sm:block">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Balance Financiero</span>
                        <span className="text-xs font-black text-emerald-400">{formatCurrency(clubBalance)}</span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT WORKSPACE */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative z-10">
                {/* LEFT DOSSIER COLUMN (Player Profile & Club Context) */}
                <aside className="lg:col-span-4 bg-white/[0.015] border-r border-white/10 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        {/* Player Hero Section */}
                        <div className="flex flex-col items-center text-center pt-2">
                            {/* Prominent Player Avatar (Clean, no boxes) */}
                            <div className="relative mb-4">
                                <PlayerAvatar
                                    player={negotiatingPlayer}
                                    className="w-32 h-32 rounded-full border-2 border-white/20 shadow-2xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
                                    primaryColor={sellingTeam?.primaryColor}
                                />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-[var(--apex-gold)] text-black font-black text-xs px-3 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                                    {negotiatingPlayer.rating} OVR
                                </div>
                            </div>

                            <h1 className="text-2xl font-black text-white tracking-tight">
                                {negotiatingPlayer.name}
                            </h1>

                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider border ${positionColor}`}>
                                    {positionFullName}
                                </span>
                                {negotiatingPlayer.age && (
                                    <span className="text-xs text-white/60 font-semibold">
                                        {negotiatingPlayer.age} años
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Player Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Valor de Mercado</span>
                                <span className="text-sm font-black text-emerald-400">
                                    {formatCurrency(negotiatingPlayer.value)}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Salario Actual</span>
                                <span className="text-sm font-black text-white/90">
                                    {formatWeeklyWage(negotiatingPlayer.wage)}
                                </span>
                            </div>
                        </div>

                        {/* Current Club Dossier */}
                        {sellingTeam && (
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Club Propietario</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 shrink-0">
                                        <TeamLogo team={sellingTeam} className="w-full h-full" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-white truncate">{sellingTeam.name}</h4>
                                        <span className="text-[11px] text-white/50 block">División: {sellingTeam.leagueId}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Negotiation Tension & Patience Indicator */}
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-white/60 font-bold">Paciencia de la otra parte</span>
                                <span className={`font-black uppercase tracking-wider ${
                                    remainingAttempts === 3 ? 'text-emerald-400' : remainingAttempts === 2 ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                    {remainingAttempts === 3 ? 'Alta' : remainingAttempts === 2 ? 'Tensa' : remainingAttempts === 1 ? 'Al Límite' : 'Agotada'}
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
                            <span className="text-[10px] text-white/40 block">
                                {remainingAttempts > 0 
                                    ? `Dispones de ${remainingAttempts} intento(s) para cerrar un acuerdo.` 
                                    : 'Las negociaciones han alcanzado el punto de ruptura.'}
                            </span>
                        </div>
                    </div>

                    {/* Bottom Disclaimer */}
                    <div className="pt-4 border-t border-white/5 text-[10px] text-white/30 text-center">
                        Dirección Deportiva • Apex Football Management
                    </div>
                </aside>

                {/* RIGHT NEGOTIATION SUITE COLUMN (Boardroom & Deck) */}
                <section className="lg:col-span-8 flex flex-col h-full bg-black/20 overflow-hidden">
                    {/* Counterpart Dossier Banner */}
                    <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                                {negotiationPhase === 'CLUB' ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                    {negotiationPhase === 'CLUB' 
                                        ? `Director Deportivo • ${sellingTeam?.name || 'Club Propietario'}` 
                                        : `Agente Oficial de ${negotiatingPlayer.name}`}
                                </h3>
                                <p className="text-[11px] text-white/50">
                                    {negotiationPhase === 'CLUB'
                                        ? 'Negociación formal por los derechos federativos y traspaso económico.'
                                        : 'Negociación de ficha semanal, duración contractual y condiciones laborales.'}
                                </p>
                            </div>
                        </div>

                        {agreedFee !== null && negotiationPhase === 'CONTRACT' && (
                            <div className="text-right">
                                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">Traspaso Acordado</span>
                                <span className="text-xs font-black text-white">{formatCurrency(agreedFee)}</span>
                            </div>
                        )}
                    </div>

                    {/* Chat Dialogue Feed */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {negotiationPhase === 'CLUB' ? (
                            clubChatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'} animate-fade-in`}>
                                    {msg.sender === 'system' ? (
                                        <span className="text-[11px] font-semibold text-white/50 bg-white/5 border border-white/5 px-4 py-1.5 rounded-full text-center">
                                            {msg.text}
                                        </span>
                                    ) : msg.sender === 'user' ? (
                                        <div className="bg-[var(--apex-gold)] text-black font-black px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[75%] text-xs shadow-lg">
                                            {msg.text}
                                        </div>
                                    ) : (
                                        <div className="bg-slate-800/90 border border-white/10 p-4 rounded-2xl rounded-tl-sm max-w-[80%] text-white shadow-xl space-y-2">
                                            <span className="text-[10px] font-black text-[var(--apex-gold)] uppercase tracking-wider block">
                                                Respuesta Oficial
                                            </span>
                                            <p className="text-xs font-medium leading-relaxed text-slate-200">
                                                "{msg.text}"
                                            </p>
                                            {msg.counter && (
                                                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                                                    <span className="text-white/60 font-bold">Contraoferta mínima solicitada:</span>
                                                    <span className="font-black text-[var(--apex-gold)]">{formatCurrency(msg.counter)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            agentChatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'} animate-fade-in`}>
                                    {msg.sender === 'system' ? (
                                        <span className="text-[11px] font-semibold text-white/50 bg-white/5 border border-white/5 px-4 py-1.5 rounded-full text-center">
                                            {msg.text}
                                        </span>
                                    ) : msg.sender === 'user' ? (
                                        <div className="bg-[var(--apex-gold)] text-black font-black px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[75%] text-xs shadow-lg">
                                            {msg.text}
                                        </div>
                                    ) : (
                                        <div className="bg-slate-800/90 border border-white/10 p-4 rounded-2xl rounded-tl-sm max-w-[80%] text-white shadow-xl space-y-2">
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                                                Representante
                                            </span>
                                            <p className="text-xs font-medium leading-relaxed text-slate-200">
                                                "{msg.text}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* INTERACTIVE ACTION DECK */}
                    <div className="p-6 bg-black/60 border-t border-white/10 shrink-0">
                        {isNegotiationDead ? (
                            <div className="space-y-3 text-center">
                                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                                    Las negociaciones se han roto definitivamente. La otra parte se niega a continuar las conversaciones.
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                                >
                                    Cerrar y volver al mercado
                                </button>
                            </div>
                        ) : negotiationPhase === 'CLUB' ? (
                            agreedFee !== null ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <Check className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Traspaso Aceptado por el Club</h4>
                                                <p className="text-[11px] text-white/70">Monto pactado: <strong className="text-white">{formatCurrency(agreedFee)}</strong></p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onProceedToContract}
                                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                                    >
                                        <span>Proceder a Términos Contractuales con el Jugador</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Offer Input & Value Context */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Propuesta Económica</span>
                                            <span className="text-xl font-black text-[var(--apex-gold)]">{formatCurrency(clubOfferFee)}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Relación Valor Mercado</span>
                                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                                valueRatio >= 110 ? 'text-emerald-400 bg-emerald-500/10' : valueRatio >= 90 ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'
                                            }`}>
                                                {valueRatio}%
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
                                        className="w-full accent-[var(--apex-gold)] cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                                        disabled={isClubNegotiating}
                                    />

                                    {/* Quick Increment Buttons */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setClubOfferFee(prev => Math.max(500_000, prev - 5_000_000))}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                                        >
                                            -5M
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClubOfferFee(prev => Math.max(500_000, prev - 1_000_000))}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                                        >
                                            -1M
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClubOfferFee(marketValue)}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-[var(--apex-gold)] border border-[var(--apex-gold)]/20 cursor-pointer active:scale-95"
                                        >
                                            Valor de Mercado
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClubOfferFee(prev => Math.min(transferBudget, prev + 1_000_000))}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                                        >
                                            +1M
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClubOfferFee(prev => Math.min(transferBudget, prev + 5_000_000))}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/70 border border-white/5 cursor-pointer active:scale-95"
                                        >
                                            +5M
                                        </button>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={onSendClubOffer}
                                        disabled={isClubNegotiating || clubOfferFee <= 0 || clubOfferFee > transferBudget}
                                        className="w-full py-4 bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-[var(--apex-gold)]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                                    >
                                        {isClubNegotiating ? <LoadingSpinner /> : `Presentar Oferta Formal de ${formatCurrency(clubOfferFee)}`}
                                    </button>
                                </div>
                            )
                        ) : (
                            /* PHASE 2: CONTRACT */
                            isContractAgreed ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-center">
                                        <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">¡Acuerdo Contractual Completo!</h4>
                                        <p className="text-xs text-white/80">
                                            Salario semanal: <strong className="text-emerald-400">{formatWeeklyWage(offeredWage)}</strong> • Duración: <strong className="text-white">{offeredYears} temporadas</strong>
                                        </p>
                                    </div>
                                    <button
                                        onClick={onFinalizeSigning}
                                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-emerald-500/20 cursor-pointer active:scale-98 transition-all"
                                    >
                                        Formalizar Fichaje y Firmar Contrato Oficial
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Wage Input */}
                                        <div className="space-y-1.5 md:col-span-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Salario Semanal</span>
                                                <span className="font-black text-emerald-400">{formatWeeklyWage(offeredWage)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setOfferedWage(Math.max(2000, offeredWage - 5000))}
                                                    className="px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white border border-white/5 cursor-pointer"
                                                >
                                                    -5K
                                                </button>
                                                <input
                                                    type="number"
                                                    value={Math.round(offeredWage / 1000)}
                                                    onChange={e => setOfferedWage(Math.max(1000, Number(e.target.value) * 1000))}
                                                    className="flex-1 px-2 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-black text-xs text-center focus:outline-none focus:border-[var(--apex-gold)]"
                                                />
                                                <span className="text-xs text-white/40 font-bold">K</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setOfferedWage(offeredWage + 5000)}
                                                    className="px-2.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white border border-white/5 cursor-pointer"
                                                >
                                                    +5K
                                                </button>
                                            </div>
                                        </div>

                                        {/* Contract Years */}
                                        <div className="space-y-1.5 md:col-span-1">
                                            <span className="text-white/50 font-bold uppercase tracking-wider text-[10px] block">Duración del Contrato</span>
                                            <div className="grid grid-cols-5 gap-1">
                                                {[1, 2, 3, 4, 5].map((yrs) => (
                                                    <button
                                                        key={yrs}
                                                        type="button"
                                                        onClick={() => setOfferedYears(yrs)}
                                                        className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                                            offeredYears === yrs
                                                                ? 'bg-[var(--apex-gold)] text-black shadow-md'
                                                                : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                                                        }`}
                                                    >
                                                        {yrs}a
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Squad Role */}
                                        <div className="space-y-1.5 md:col-span-1">
                                            <span className="text-white/50 font-bold uppercase tracking-wider text-[10px] block">Rol en la Plantilla</span>
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
                                                        {r === 'Key' ? 'Clave' : r === 'FirstTeam' ? 'Titular' : r === 'Rotation' ? 'Rotación' : 'Promesa'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Send Agent Offer Button */}
                                    <button
                                        onClick={onSendAgentOffer}
                                        disabled={isAgentNegotiating || offeredWage <= 0}
                                        className="w-full py-4 bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-[var(--apex-gold)]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                                    >
                                        {isAgentNegotiating ? <LoadingSpinner /> : 'Proponer Términos al Representante'}
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};
