import React, { useState, useMemo, useEffect } from 'react';
import { Player, Team, SquadRole, GameMode } from '../../../types';
import { Modal } from '../../ui/Modal';
import { 
    Check, 
    Building2, 
    FileText, 
    PenTool, 
    UserCheck, 
    DollarSign, 
    Calendar, 
    Star, 
    TrendingUp, 
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { PlayerPhoto, TeamLogo } from '../../../data/teams/helpers';
import { 
    formatCurrency, 
    formatWeeklyWage, 
    formatTransferFee, 
    normalizeMonetaryValue 
} from '../../../utils';
import { getExpectedWage, getPlayerAge } from '../../../utils/playerUtils';
import { 
    generateTransferNegotiationResponse, 
    generatePlayerContractNegotiationResponse,
    getEstimatedClubDemand
} from '../../../services/gameLogic';

interface TransferNegotiationModalProps {
    negotiatingPlayer: Player;
    sellingTeam?: Team;
    myTeam: Team;
    gameMode?: GameMode;
    transferBudget: number;
    clubBalance: number;
    onFinalizeSigning: (payload: {
        player: Player;
        fee: number;
        wage: number;
        contractYears: number;
        role: SquadRole;
        signingBonus: number;
    }) => void;
    onClose: () => void;
}

const roleDetails: Record<SquadRole, { label: string; badge: string; desc: string }> = {
    Key: { label: 'Jugador Clave', badge: 'Estrella', desc: 'Líder indiscutible del proyecto' },
    FirstTeam: { label: 'Titular Habitual', badge: 'Titular', desc: 'Participación regular en el once inicial' },
    Rotation: { label: 'Rotación', badge: 'Recambio', desc: 'Minutos repartidos y alternativas tácticas' },
    Prospect: { label: 'Joven Promesa', badge: 'Futuro', desc: 'Desarrollo progresivo en el club' }
};

export const TransferNegotiationModal: React.FC<TransferNegotiationModalProps> = React.memo(({
    negotiatingPlayer,
    sellingTeam,
    myTeam,
    gameMode = 'REALISTIC' as GameMode,
    transferBudget,
    clubBalance,
    onFinalizeSigning,
    onClose
}) => {
    // Normalization
    const normPlayerValue = useMemo(() => normalizeMonetaryValue(negotiatingPlayer.value, 1_000_000), [negotiatingPlayer.value]);
    const normBudget = useMemo(() => normalizeMonetaryValue(transferBudget, 5_000_000), [transferBudget]);
    const normBalance = useMemo(() => normalizeMonetaryValue(clubBalance, 5_000_000), [clubBalance]);
    const maxAvailableCash = Math.max(normBudget, normBalance);

    // Target estimated fee from selling club
    const estimatedDemand = useMemo(() => {
        return getEstimatedClubDemand(negotiatingPlayer, myTeam);
    }, [negotiatingPlayer, myTeam]);

    // Stage: 1 = Club Fee, 2 = Player Contract, 3 = Final Confirmation
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Step 1: Club Fee State
    const [offerFee, setOfferFee] = useState<number>(() => Math.min(maxAvailableCash, estimatedDemand));
    const [clubAttempts, setClubAttempts] = useState(0);
    const [isClubEvaluating, setIsClubEvaluating] = useState(false);
    const [clubFeedback, setClubFeedback] = useState<{
        status: 'idle' | 'accepted' | 'counter' | 'rejected';
        message: string;
        counterFee?: number;
    }>({ status: 'idle', message: '' });
    const [agreedFee, setAgreedFee] = useState<number | null>(null);

    // Step 2: Contract State
    const expectedWage = useMemo(() => {
        return getExpectedWage(negotiatingPlayer, myTeam.tier, 'FirstTeam', myTeam.leagueId);
    }, [negotiatingPlayer, myTeam.tier, myTeam.leagueId]);

    const [offeredWage, setOfferedWage] = useState<number>(() => expectedWage);
    const [offeredYears, setOfferedYears] = useState<number>(3);
    const [offeredRole, setOfferedRole] = useState<SquadRole>('FirstTeam');
    const [offeredBonus, setOfferedBonus] = useState<number>(0);
    const [isAgentEvaluating, setIsAgentEvaluating] = useState(false);
    const [agentFeedback, setAgentFeedback] = useState<{
        status: 'idle' | 'accepted' | 'counter' | 'rejected';
        message: string;
        counterWage?: number;
        counterYears?: number;
        counterBonus?: number;
    }>({ status: 'idle', message: '' });
    const [isContractAgreed, setIsContractAgreed] = useState(false);

    // Handle Club Offer Submission
    const handleSendClubOffer = async () => {
        if (!sellingTeam) return;
        setIsClubEvaluating(true);
        const newAttempts = clubAttempts + 1;
        setClubAttempts(newAttempts);

        const res = await generateTransferNegotiationResponse(
            negotiatingPlayer,
            offerFee,
            myTeam,
            sellingTeam,
            newAttempts,
            gameMode
        );

        setIsClubEvaluating(false);

        if (res.decision === 'accepted') {
            setAgreedFee(offerFee);
            setClubFeedback({ status: 'accepted', message: res.message });
            setStep(2);
        } else if (res.decision === 'rejected') {
            setClubFeedback({ status: 'rejected', message: res.message });
        } else {
            const counter = res.counterOffer || estimatedDemand;
            setClubFeedback({
                status: 'counter',
                message: res.message,
                counterFee: counter
            });
        }
    };

    // Quick Accept Club Counter
    const handleAcceptClubCounter = () => {
        if (!clubFeedback.counterFee) return;
        setOfferFee(clubFeedback.counterFee);
        setAgreedFee(clubFeedback.counterFee);
        setClubFeedback({
            status: 'accepted',
            message: `Acuerdo alcanzado por ${formatCurrency(clubFeedback.counterFee)}.`
        });
        setStep(2);
    };

    // Handle Agent Contract Submission
    const handleSendAgentOffer = async () => {
        setIsAgentEvaluating(true);

        const res = await generatePlayerContractNegotiationResponse(
            negotiatingPlayer,
            offeredWage,
            offeredYears,
            offeredRole,
            offeredBonus,
            myTeam,
            gameMode
        );

        setIsAgentEvaluating(false);

        if (res.decision === 'accepted') {
            setIsContractAgreed(true);
            setAgentFeedback({ status: 'accepted', message: res.message });
            setStep(3);
        } else if (res.decision === 'rejected') {
            setAgentFeedback({ status: 'rejected', message: res.message });
        } else {
            const counter = res.counterOffer;
            setAgentFeedback({
                status: 'counter',
                message: res.message,
                counterWage: counter?.wage,
                counterYears: counter?.contractYears,
                counterBonus: counter?.signingBonus
            });
        }
    };

    // Quick Accept Agent Counter
    const handleAcceptAgentCounter = () => {
        if (!agentFeedback.counterWage) return;
        setOfferedWage(agentFeedback.counterWage);
        if (agentFeedback.counterYears) setOfferedYears(agentFeedback.counterYears);
        if (agentFeedback.counterBonus !== undefined) setOfferedBonus(agentFeedback.counterBonus);
        setIsContractAgreed(true);
        setAgentFeedback({
            status: 'accepted',
            message: 'Términos del representante aceptados. Listos para la firma.'
        });
        setStep(3);
    };

    // Finalize
    const handleExecuteSigning = () => {
        if (!agreedFee) return;
        onFinalizeSigning({
            player: negotiatingPlayer,
            fee: agreedFee,
            wage: offeredWage,
            contractYears: offeredYears,
            role: offeredRole,
            signingBonus: offeredBonus
        });
    };

    // Probability & Gauge indicators
    const clubFeeRatio = offerFee / Math.max(1, estimatedDemand);
    const wageRatio = offeredWage / Math.max(1, expectedWage);
    const totalOutlay = (agreedFee || offerFee) + offeredBonus;
    const canAffordTotal = totalOutlay <= normBalance;

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={`Negociación: ${negotiatingPlayer.name}`}
            maxWidth="max-w-2xl"
            hideHeader
        >
            <div className="w-full bg-[#0B0F19] overflow-hidden flex flex-col select-none">
                {/* 1. PRESIDENTIAL HEADER & PLAYER OVERVIEW */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900/90 via-[#0E1424] to-slate-900/90 border-b border-white/10 flex items-center justify-between gap-3 pr-12">
                    <div className="flex items-center gap-3 min-w-0">
                        <PlayerPhoto player={negotiatingPlayer} className="w-12 h-12 rounded-2xl border border-white/20 shrink-0 shadow-md" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-black text-white truncate">{negotiatingPlayer.name}</h1>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 shrink-0">
                                    {negotiatingPlayer.position}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 truncate">
                                <span>{getPlayerAge(negotiatingPlayer)} años</span>
                                <span>•</span>
                                {sellingTeam && (
                                    <>
                                        <div className="w-3.5 h-3.5 shrink-0 inline-flex">
                                            <TeamLogo team={sellingTeam} />
                                        </div>
                                        <span className="truncate">{sellingTeam.name}</span>
                                        <span>•</span>
                                    </>
                                )}
                                <span>Tasación: <strong className="text-emerald-400">{formatTransferFee(normPlayerValue)}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. PROGRESS STEPPER */}
                <div className="px-4 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs font-bold">
                    <button
                        onClick={() => setStep(1)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                            step === 1 ? 'text-[var(--apex-gold)] font-black' : agreedFee ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                    >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            agreedFee ? 'bg-emerald-500/20 text-emerald-400' : step === 1 ? 'bg-[var(--apex-gold)] text-black' : 'bg-white/10'
                        }`}>
                            {agreedFee ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
                        </span>
                        <span>1. Traspaso Club</span>
                    </button>

                    <div className={`w-8 h-px ${agreedFee ? 'bg-emerald-500/50' : 'bg-white/10'}`} />

                    <button
                        onClick={() => { if (agreedFee) setStep(2); }}
                        disabled={!agreedFee}
                        className={`flex items-center gap-1.5 transition-colors ${
                            !agreedFee ? 'opacity-40 cursor-not-allowed' : step === 2 ? 'text-[var(--apex-gold)] font-black cursor-pointer' : isContractAgreed ? 'text-emerald-400 cursor-pointer' : 'text-slate-400 cursor-pointer'
                        }`}
                    >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            isContractAgreed ? 'bg-emerald-500/20 text-emerald-400' : step === 2 ? 'bg-[var(--apex-gold)] text-black' : 'bg-white/10'
                        }`}>
                            {isContractAgreed ? <Check className="w-3 h-3 stroke-[3]" /> : '2'}
                        </span>
                        <span>2. Contrato</span>
                    </button>

                    <div className={`w-8 h-px ${isContractAgreed ? 'bg-emerald-500/50' : 'bg-white/10'}`} />

                    <button
                        onClick={() => { if (agreedFee && isContractAgreed) setStep(3); }}
                        disabled={!isContractAgreed}
                        className={`flex items-center gap-1.5 transition-colors ${
                            !isContractAgreed ? 'opacity-40 cursor-not-allowed' : step === 3 ? 'text-emerald-400 font-black cursor-pointer' : 'text-slate-400 cursor-pointer'
                        }`}
                    >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            step === 3 ? 'bg-emerald-500 text-black' : 'bg-white/10'
                        }`}>
                            <PenTool className="w-2.5 h-2.5" />
                        </span>
                        <span>3. Firma</span>
                    </button>
                </div>

                {/* 3. STEP CONTENT */}
                <div className="p-4 sm:p-6 space-y-4">
                    {/* STEP 1: TRASPASO CLUB */}
                    {step === 1 && (
                        <div className="space-y-4">
                            {/* Intelligence Box */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                                <div>
                                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Valor Oficial</span>
                                    <span className="text-xs font-bold text-white">{formatTransferFee(normPlayerValue)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Pretensión del Club</span>
                                    <span className="text-xs font-bold text-[var(--apex-gold)]">{formatTransferFee(estimatedDemand)}</span>
                                </div>
                                <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-white/5 pt-1.5 sm:pt-0">
                                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Tesorería Disponible</span>
                                    <span className="text-xs font-bold text-emerald-400">{formatTransferFee(normBalance)}</span>
                                </div>
                            </div>

                            {/* Offer Amount Input & Stepper */}
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400">Tu Oferta de Traspaso:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-[var(--apex-gold)]">
                                            {formatCurrency(offerFee)}
                                        </span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                            clubFeeRatio >= 0.98 
                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                : clubFeeRatio >= 0.85
                                                    ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                                                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                        }`}>
                                            {Math.round(clubFeeRatio * 100)}% de pretensión
                                        </span>
                                    </div>
                                </div>

                                <input
                                    type="range"
                                    min={Math.max(500_000, Math.round(normPlayerValue * 0.4))}
                                    max={Math.max(normBalance, estimatedDemand * 1.5)}
                                    step={500_000}
                                    value={offerFee}
                                    onChange={e => setOfferFee(Number(e.target.value))}
                                    className="w-full accent-[var(--apex-gold)] cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                                />

                                {/* Quick Presets */}
                                <div className="grid grid-cols-4 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setOfferFee(prev => Math.max(500_000, prev - 1_000_000))}
                                        className="py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 border border-white/5 cursor-pointer"
                                    >
                                        -1M
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOfferFee(normPlayerValue)}
                                        className="py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 border border-white/5 cursor-pointer truncate px-1"
                                    >
                                        100% Valor
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOfferFee(estimatedDemand)}
                                        className="py-1.5 bg-[var(--apex-gold)]/10 hover:bg-[var(--apex-gold)]/20 rounded-lg text-xs font-black text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 cursor-pointer truncate px-1"
                                    >
                                        Pretensión
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOfferFee(prev => Math.min(normBalance, prev + 1_000_000))}
                                        className="py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 border border-white/5 cursor-pointer"
                                    >
                                        +1M
                                    </button>
                                </div>
                            </div>

                            {/* Feedback Banner */}
                            {clubFeedback.status === 'accepted' && (
                                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 animate-scale-in">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs text-emerald-300 font-bold">{clubFeedback.message}</p>
                                    </div>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer"
                                    >
                                        Continuar →
                                    </button>
                                </div>
                            )}

                            {clubFeedback.status === 'counter' && clubFeedback.counterFee && (
                                <div className="p-3.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-scale-in">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-yellow-400 block tracking-wider">Contraoferta del Club</span>
                                        <p className="text-xs text-yellow-200 mt-0.5">{clubFeedback.message}</p>
                                    </div>
                                    <button
                                        onClick={handleAcceptClubCounter}
                                        className="px-3.5 py-2 rounded-xl bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-md"
                                    >
                                        Aceptar {formatCurrency(clubFeedback.counterFee)}
                                    </button>
                                </div>
                            )}

                            {clubFeedback.status === 'rejected' && (
                                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 animate-scale-in">
                                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                                    <p className="text-xs text-rose-300 font-semibold">{clubFeedback.message}</p>
                                </div>
                            )}

                            {/* Submit Club Offer Button */}
                            {clubFeedback.status !== 'accepted' && (
                                <button
                                    onClick={handleSendClubOffer}
                                    disabled={isClubEvaluating || offerFee > normBalance || clubFeedback.status === 'rejected'}
                                    className="w-full py-3 bg-[var(--apex-gold)] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[var(--apex-gold)]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                                >
                                    <Building2 className="w-4 h-4" />
                                    <span>
                                        {isClubEvaluating 
                                            ? 'Consultando con la Directiva...' 
                                            : offerFee > normBalance 
                                                ? 'Fondos Insuficientes' 
                                                : `Presentar Oferta de ${formatCurrency(offerFee)}`}
                                    </span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* STEP 2: CONTRATO DEL JUGADOR */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {/* Salario Semanal */}
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                        Ficha Salarial Semanal
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400">Esperado: {formatWeeklyWage(expectedWage)}</span>
                                        <span className="text-base font-black text-emerald-400">
                                            {formatWeeklyWage(offeredWage)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setOfferedWage(prev => Math.max(2_000, prev - 5_000))}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 border border-white/5 cursor-pointer"
                                    >
                                        -5K
                                    </button>
                                    <input
                                        type="range"
                                        min={Math.max(2_000, Math.round(expectedWage * 0.5))}
                                        max={Math.max(expectedWage * 2, 100_000)}
                                        step={2_500}
                                        value={offeredWage}
                                        onChange={e => setOfferedWage(Number(e.target.value))}
                                        className="flex-1 accent-emerald-400 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setOfferedWage(prev => prev + 5_000)}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 border border-white/5 cursor-pointer"
                                    >
                                        +5K
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOfferedWage(expectedWage)}
                                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-xs font-black text-emerald-400 border border-emerald-500/30 cursor-pointer"
                                    >
                                        Ideal
                                    </button>
                                </div>
                            </div>

                            {/* Duración y Rol Deportivo */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Duración */}
                                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                                        Duración del Contrato
                                    </span>
                                    <div className="grid grid-cols-5 gap-1">
                                        {[1, 2, 3, 4, 5].map(yrs => (
                                            <button
                                                key={yrs}
                                                type="button"
                                                onClick={() => setOfferedYears(yrs)}
                                                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    offeredYears === yrs
                                                        ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                                        : 'bg-white/5 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {yrs}a
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Rol */}
                                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                        <Star className="w-3.5 h-3.5 text-amber-400" />
                                        Rol en el Plantel
                                    </span>
                                    <div className="grid grid-cols-2 gap-1">
                                        {(['Key', 'FirstTeam', 'Rotation', 'Prospect'] as SquadRole[]).map(r => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setOfferedRole(r)}
                                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold truncate transition-all cursor-pointer text-center ${
                                                    offeredRole === r
                                                        ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                                        : 'bg-white/5 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {roleDetails[r].badge}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Prima de Fichaje Opcional */}
                            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400">Prima de Fichaje (Bonus de Firma):</span>
                                    <span className="text-xs font-black text-amber-400">
                                        {offeredBonus > 0 ? formatCurrency(offeredBonus) : 'Sin prima adicional'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {[
                                        { label: '0', val: 0 },
                                        { label: '250K', val: 250_000 },
                                        { label: '500K', val: 500_000 },
                                        { label: '1M', val: 1_000_000 },
                                    ].map(b => (
                                        <button
                                            key={b.label}
                                            type="button"
                                            onClick={() => setOfferedBonus(b.val)}
                                            className={`py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                                                offeredBonus === b.val 
                                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                                            }`}
                                        >
                                            {b.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Agent Feedback Banner */}
                            {agentFeedback.status === 'accepted' && (
                                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 animate-scale-in">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs text-emerald-300 font-bold">{agentFeedback.message}</p>
                                    </div>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer"
                                    >
                                        Revisar Firma →
                                    </button>
                                </div>
                            )}

                            {agentFeedback.status === 'counter' && agentFeedback.counterWage && (
                                <div className="p-3.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-scale-in">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-yellow-400 block tracking-wider">Petición del Agente</span>
                                        <p className="text-xs text-yellow-200 mt-0.5">{agentFeedback.message}</p>
                                    </div>
                                    <button
                                        onClick={handleAcceptAgentCounter}
                                        className="px-3.5 py-2 rounded-xl bg-[var(--apex-gold)] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-md"
                                    >
                                        Aceptar {formatWeeklyWage(agentFeedback.counterWage)}
                                    </button>
                                </div>
                            )}

                            {agentFeedback.status === 'rejected' && (
                                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 animate-scale-in">
                                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                                    <p className="text-xs text-rose-300 font-semibold">{agentFeedback.message}</p>
                                </div>
                            )}

                            {/* Submit Agent Button */}
                            {agentFeedback.status !== 'accepted' && (
                                <button
                                    onClick={handleSendAgentOffer}
                                    disabled={isAgentEvaluating || agentFeedback.status === 'rejected'}
                                    className="w-full py-3 bg-[var(--apex-gold)] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[var(--apex-gold)]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                                >
                                    <UserCheck className="w-4 h-4" />
                                    <span>
                                        {isAgentEvaluating 
                                            ? 'Negociando con el Agente...' 
                                            : `Proponer Contrato (${formatWeeklyWage(offeredWage)}/sem)`}
                                    </span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* STEP 3: FIRMA Y CIERRE OFICIAL */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Acuerdo Total Alcanzado</span>
                                <h3 className="text-lg font-black text-white">¡Listo para la Firma Oficial!</h3>
                                <p className="text-xs text-slate-300">Revisa el resumen financiero del traspaso antes de oficializar la operación.</p>
                            </div>

                            {/* Financial Summary Dossier */}
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                                    <span className="text-slate-400">Coste de Traspaso (al club):</span>
                                    <span className="font-bold text-white">{formatCurrency(agreedFee || offerFee)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                                    <span className="text-slate-400">Prima de Fichaje:</span>
                                    <span className="font-bold text-white">{formatCurrency(offeredBonus)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                                    <span className="text-slate-400">Salario Semanal:</span>
                                    <span className="font-bold text-emerald-400">{formatWeeklyWage(offeredWage)} ({offeredYears} temporadas)</span>
                                </div>
                                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                                    <span className="text-slate-400">Rol en la Plantilla:</span>
                                    <span className="font-bold text-[var(--apex-gold)]">{roleDetails[offeredRole].label}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm pt-1">
                                    <span className="font-bold text-slate-200">Desembolso Inicial en Caja:</span>
                                    <span className="font-black text-emerald-400 text-base">{formatCurrency(totalOutlay)}</span>
                                </div>
                            </div>

                            {/* Execution Button */}
                            <button
                                onClick={handleExecuteSigning}
                                disabled={!canAffordTotal}
                                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                            >
                                <PenTool className="w-4 h-4" />
                                <span>
                                    {canAffordTotal ? '👑 Estampar Firma Presidencial y Fichar' : 'Fondos Insuficientes en Tesorería'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
});
