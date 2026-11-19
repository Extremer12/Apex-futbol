import React, { useState } from 'react';
import { Sponsor } from '../../../types';
import { formatCurrency, formatCurrencyShort } from '../../../utils';
import { X, Handshake, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Negotiation Modal
interface SponsorNegotiationModalProps {
    sponsor: Sponsor | null;
    onClose: () => void;
    onAccept: (sponsorId: string, negotiatedIncome: number, customSigningBonus: number, fanImpact: number) => void;
    onRejectOffer: (sponsorId: string) => void;
}

export const SponsorNegotiationModal: React.FC<SponsorNegotiationModalProps> = React.memo(({
    sponsor,
    onClose,
    onAccept,
    onRejectOffer
}) => {
    if (!sponsor) return null;

    const [phase, setPhase] = useState<'idle' | 'result'>('idle');
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const handleExecuteStrategy = (strategy: 'standard' | 'high_wage' | 'signing_bonus' | 'performance_gamble') => {
        let successChance = 1.0;
        let finalIncome = sponsor.weeklyIncome;
        let finalSigningBonus = sponsor.signingBonus ?? Math.floor(sponsor.weeklyIncome * 4);
        let fanImpact = sponsor.fanApprovalImpact || 0;
        let message = '';

        if (strategy === 'standard') {
            successChance = 1.0;
            message = `La marca ${sponsor.name} ha ratificado la propuesta estándar con un bono inicial de ${formatCurrency(finalSigningBonus)}.`;
        } else if (strategy === 'high_wage') {
            successChance = 0.75;
            if (Math.random() <= successChance) {
                finalIncome = Math.round(sponsor.weeklyIncome * 1.15);
                message = `¡Éxito en la cumbre! ${sponsor.name} aceptó mejorar el fijo semanal a ${formatCurrency(finalIncome)}/sem (+15%).`;
            } else {
                onRejectOffer(sponsor.id);
                setResult({
                    success: false,
                    message: `Los emisarios de ${sponsor.name} consideraron excesivas tus pretensiones salariales y rompieron las negociaciones.`
                });
                setPhase('result');
                return;
            }
        } else if (strategy === 'signing_bonus') {
            successChance = 0.70;
            if (Math.random() <= successChance) {
                finalSigningBonus = Math.round((sponsor.signingBonus ?? (sponsor.weeklyIncome * 4)) * 1.50);
                message = `¡Inyección inmediata de liquidez! ${sponsor.name} aceptó adelantar un bono de firma de ${formatCurrency(finalSigningBonus)}.`;
            } else {
                onRejectOffer(sponsor.id);
                setResult({
                    success: false,
                    message: `La junta directiva de ${sponsor.name} denegó el anticipo extraordinario y descartó el acuerdo.`
                });
                setPhase('result');
                return;
            }
        } else if (strategy === 'performance_gamble') {
            successChance = 0.85;
            if (Math.random() <= successChance) {
                finalIncome = Math.round(sponsor.weeklyIncome * 1.30);
                message = `¡Pacto sellado! El ingreso semanal se eleva a ${formatCurrency(finalIncome)}/sem (+30%) sujeto al proyecto deportivo.`;
            } else {
                onRejectOffer(sponsor.id);
                setResult({
                    success: false,
                    message: `La dirección de ${sponsor.name} no compartió las exigencias deportivas y canceló la oferta.`
                });
                setPhase('result');
                return;
            }
        }

        onAccept(sponsor.id, finalIncome, finalSigningBonus, fanImpact);
        setResult({
            success: true,
            message
        });
        setPhase('result');
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3.5 border-b border-white/10 pb-4">
                    <div
                        className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl shrink-0"
                        style={{ color: sponsor.brandColor || '#C8A84E' }}
                    >
                        {sponsor.name.charAt(0)}
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)]">
                            Mesa de Negociación Comercial
                        </span>
                        <h2 className="text-xl font-black text-white">{sponsor.name}</h2>
                    </div>
                </div>

                {phase === 'idle' && (
                    <div className="space-y-4">
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Oferta Semanal Base:</span>
                                <span className="font-bold text-emerald-400 text-sm">{formatCurrency(sponsor.weeklyIncome)}/sem</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Bono de Bienvenida:</span>
                                <span className="font-bold text-white">{formatCurrency(sponsor.signingBonus || sponsor.weeklyIncome * 4)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Duración:</span>
                                <span className="font-bold text-white">{sponsor.duration || 52} semanas</span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-1">
                            <button
                                onClick={() => handleExecuteStrategy('standard')}
                                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer group"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="font-bold text-xs text-white group-hover:text-[var(--apex-gold)]">
                                        1. Aceptar Oferta Base (Sin Riesgo)
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">100% Éxito</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">Firma inmediata con el sueldo y prima pactados.</p>
                            </button>

                            <button
                                onClick={() => handleExecuteStrategy('high_wage')}
                                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer group"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="font-bold text-xs text-white group-hover:text-[var(--apex-gold)]">
                                        2. Exigir Mejora Salarial (+15% Fijo Semanal)
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400">75% Éxito</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">Argumentas la visibilidad del club. Si aceptan, sube el fijo.</p>
                            </button>

                            <button
                                onClick={() => handleExecuteStrategy('signing_bonus')}
                                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer group"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="font-bold text-xs text-white group-hover:text-[var(--apex-gold)]">
                                        3. Exigir Liquidez Inmediata (+50% Bono de Firma)
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">70% Éxito</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">Mayor inyección de dinero en mano hoy para gastar en fichajes.</p>
                            </button>

                            <button
                                onClick={() => handleExecuteStrategy('performance_gamble')}
                                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer group"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="font-bold text-xs text-white group-hover:text-[var(--apex-gold)]">
                                        4. Pacto de Alto Rendimiento (+30% Sueldo)
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">85% Éxito</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">Máximo beneficio semanal sujeto al cumplimiento de objetivos.</p>
                            </button>
                        </div>
                    </div>
                )}

                {phase === 'result' && result && (
                    <div className="space-y-4 pt-2 text-center">
                        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                            result.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                            {result.success ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                        </div>

                        <h3 className="text-lg font-black text-white">
                            {result.success ? '¡Acuerdo Sellado con Éxito!' : 'Negociaciones Rotas'}
                        </h3>

                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-white/5">
                            {result.message}
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl bg-[var(--apex-gold)] hover:bg-[var(--apex-gold-light)] text-slate-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                        >
                            Continuar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

// Termination Modal
interface SponsorTerminationModalProps {
    sponsor: Sponsor | null;
    balance: number;
    onClose: () => void;
    onConfirm: (sponsor: Sponsor, indemnityCost: number) => void;
}

export const SponsorTerminationModal: React.FC<SponsorTerminationModalProps> = React.memo(({
    sponsor,
    balance,
    onClose,
    onConfirm
}) => {
    if (!sponsor) return null;

    const indemnityCost = Math.floor(sponsor.weeklyIncome * 4);
    const canAfford = balance >= indemnityCost;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center gap-3 text-rose-400">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <h3 className="font-bold text-base uppercase tracking-wider text-white">
                        Rescindir Contrato Comercial
                    </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                    ¿Estás seguro de rescindir el contrato con <strong>{sponsor.name}</strong>? El espacio quedará libre de inmediato para evaluar nuevas ofertas.
                </p>

                <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl space-y-1 text-xs">
                    <div className="text-slate-400">Indemnización por Ruptura Anticipada:</div>
                    <div className="text-base font-black text-rose-400">
                        {formatCurrency(indemnityCost)}
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={!canAfford}
                        onClick={() => onConfirm(sponsor, indemnityCost)}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-lg ${
                            canAfford
                                ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-rose-600/30'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {canAfford ? 'Abonar y Rescindir' : 'Fondos Insuficientes'}
                    </button>
                </div>
            </div>
        </div>
    );
});

// Confirmation Modal
export interface ConfirmModalState {
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: string;
    onConfirm: () => void;
}

export const FinanceConfirmModal: React.FC<{
    modalState: ConfirmModalState | null;
    onClose: () => void;
}> = React.memo(({ modalState, onClose }) => {
    if (!modalState) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--apex-gold)]" />
                    {modalState.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                    {modalState.message}
                </p>
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            const cb = modalState.onConfirm;
                            onClose();
                            cb();
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-lg ${
                            modalState.confirmColor || 'bg-[var(--apex-gold)] hover:bg-[var(--apex-gold-light)] text-slate-950'
                        }`}
                    >
                        {modalState.confirmText || 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
});
