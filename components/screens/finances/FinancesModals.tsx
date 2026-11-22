import React, { useState, useEffect } from 'react';
import { Sponsor } from '../../../types';
import { formatCurrency } from '../../../utils';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BottomSheet, StatCell } from '../transfers/TransferUI';

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
    const [phase, setPhase] = useState<'idle' | 'result'>('idle');
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        setPhase('idle');
        setResult(null);
    }, [sponsor?.id]);

    const handleExecuteStrategy = (strategy: 'standard' | 'high_wage' | 'signing_bonus' | 'performance_gamble') => {
        if (!sponsor) return;

        let finalIncome = sponsor.weeklyIncome;
        let finalSigningBonus = sponsor.signingBonus ?? Math.floor(sponsor.weeklyIncome * 4);
        const fanImpact = sponsor.fanApprovalImpact || 0;
        let message = '';

        if (strategy === 'standard') {
            message = `${sponsor.name} ratificó la propuesta estándar con un bono inicial de ${formatCurrency(finalSigningBonus)}.`;
        } else if (strategy === 'high_wage') {
            if (Math.random() <= 0.75) {
                finalIncome = Math.round(sponsor.weeklyIncome * 1.15);
                message = `Acuerdo cerrado. ${sponsor.name} aceptó mejorar el fijo semanal a ${formatCurrency(finalIncome)}/sem (+15%).`;
            } else {
                onRejectOffer(sponsor.id);
                setResult({
                    success: false,
                    message: `${sponsor.name} consideró excesivas tus pretensiones y retiró la oferta.`
                });
                setPhase('result');
                return;
            }
        } else if (strategy === 'signing_bonus') {
            if (Math.random() <= 0.70) {
                finalSigningBonus = Math.round((sponsor.signingBonus ?? (sponsor.weeklyIncome * 4)) * 1.50);
                message = `Liquidez aprobada. ${sponsor.name} adelantará un bono de firma de ${formatCurrency(finalSigningBonus)}.`;
            } else {
                onRejectOffer(sponsor.id);
                setResult({
                    success: false,
                    message: `La junta de ${sponsor.name} denegó el anticipo extraordinario y descartó el acuerdo.`
                });
                setPhase('result');
                return;
            }
        } else if (strategy === 'performance_gamble') {
            if (Math.random() <= 0.85) {
                finalIncome = Math.round(sponsor.weeklyIncome * 1.30);
                message = `Pacto sellado. El ingreso semanal sube a ${formatCurrency(finalIncome)}/sem (+30%) sujeto al proyecto deportivo.`;
            } else {
                onRejectOffer(sponsor.id);
                setResult({
                    success: false,
                    message: `${sponsor.name} no compartió las exigencias deportivas y canceló la negociación.`
                });
                setPhase('result');
                return;
            }
        }

        onAccept(sponsor.id, finalIncome, finalSigningBonus, fanImpact);
        setResult({ success: true, message });
        setPhase('result');
    };

    return (
        <BottomSheet
            open={!!sponsor}
            onClose={onClose}
            title={sponsor ? `Negociar · ${sponsor.name}` : undefined}
            footer={
                phase === 'result' ? (
                    <button
                        onClick={onClose}
                        className="w-full h-11 rounded-xl bg-[var(--apex-gold)] text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Continuar
                    </button>
                ) : undefined
            }
        >
            {sponsor && phase === 'idle' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        <StatCell label="Fijo/sem" value={formatCurrency(sponsor.weeklyIncome)} accent="text-emerald-400" />
                        <StatCell label="Bono firma" value={formatCurrency(sponsor.signingBonus || sponsor.weeklyIncome * 4)} />
                        <StatCell label="Duración" value={`${sponsor.duration || 52} sem`} />
                    </div>

                    <div className="space-y-2">
                        {[
                            {
                                id: 'standard' as const,
                                title: 'Aceptar oferta base',
                                desc: 'Firma inmediata con el fijo y bono pactados.',
                                rate: '100% éxito',
                                tone: 'bg-emerald-500/15 text-emerald-400'
                            },
                            {
                                id: 'high_wage' as const,
                                title: 'Exigir +15% fijo semanal',
                                desc: 'Mayor ingreso recurrente por visibilidad del club.',
                                rate: '75% éxito',
                                tone: 'bg-sky-500/15 text-sky-400'
                            },
                            {
                                id: 'signing_bonus' as const,
                                title: 'Exigir +50% bono de firma',
                                desc: 'Inyección inmediata de caja para el mercado.',
                                rate: '70% éxito',
                                tone: 'bg-amber-500/15 text-amber-400'
                            },
                            {
                                id: 'performance_gamble' as const,
                                title: 'Pacto de rendimiento (+30%)',
                                desc: 'Máximo fijo semanal ligado a metas deportivas.',
                                rate: '85% éxito',
                                tone: 'bg-purple-500/15 text-purple-400'
                            },
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => handleExecuteStrategy(opt.id)}
                                className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-black text-white">{opt.title}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${opt.tone}`}>
                                        {opt.rate}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {sponsor && phase === 'result' && result && (
                <div className="py-4 text-center space-y-3">
                    <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
                        result.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                    }`}>
                        {result.success ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>
                    <h4 className="text-base font-black text-white">
                        {result.success ? 'Acuerdo sellado' : 'Negociación rota'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.03] p-3.5 rounded-xl border border-white/5">
                        {result.message}
                    </p>
                </div>
            )}
        </BottomSheet>
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
    const indemnityCost = sponsor ? Math.floor(sponsor.weeklyIncome * 4) : 0;
    const canAfford = balance >= indemnityCost;

    return (
        <BottomSheet
            open={!!sponsor}
            onClose={onClose}
            title="Rescindir Contrato"
            footer={
                sponsor ? (
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={!canAfford}
                            onClick={() => onConfirm(sponsor, indemnityCost)}
                            className={`flex-1 h-11 rounded-xl font-black text-xs uppercase tracking-wider transition-colors ${
                                canAfford
                                    ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            {canAfford ? 'Abonar y rescindir' : 'Fondos insuficientes'}
                        </button>
                    </div>
                ) : undefined
            }
        >
            {sponsor && (
                <div className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Vas a finalizar anticipadamente el vínculo con <strong className="text-white">{sponsor.name}</strong>. El espacio comercial quedará disponible de inmediato.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <StatCell label="Ingreso perdido" value={`${formatCurrency(sponsor.weeklyIncome)}/sem`} />
                        <StatCell label="Indemnización" value={formatCurrency(indemnityCost)} accent="text-rose-400" />
                    </div>
                </div>
            )}
        </BottomSheet>
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
    return (
        <BottomSheet
            open={!!modalState}
            onClose={onClose}
            title={modalState?.title}
            footer={
                modalState ? (
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                const cb = modalState.onConfirm;
                                onClose();
                                cb();
                            }}
                            className={`flex-1 h-11 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                                modalState.confirmColor || 'bg-[var(--apex-gold)] hover:bg-[var(--apex-gold-light)] text-slate-950'
                            }`}
                        >
                            {modalState.confirmText || 'Confirmar'}
                        </button>
                    </div>
                ) : undefined
            }
        >
            {modalState && (
                <p className="text-xs text-slate-300 leading-relaxed">
                    {modalState.message}
                </p>
            )}
        </BottomSheet>
    );
});
