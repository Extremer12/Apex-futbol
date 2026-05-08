import React, { useState } from 'react';
import { GameState, Sponsor } from '../../types';
import { GameAction } from '../../state/reducer';
import { BriefcaseIcon, CheckCircle2Icon, TimerIcon, CoinsIcon, StarIcon } from 'lucide-react';
import { formatCurrencyShort } from '../../utils';
import { useToast } from '../common/ToastProvider';

interface SponsorshipScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export const SponsorshipScreen: React.FC<SponsorshipScreenProps> = ({ gameState, dispatch }) => {
    const { sponsors, availableSponsors, finances, team } = gameState;
    const { showToast } = useToast();

    const [negotiatingSponsor, setNegotiatingSponsor] = useState<Sponsor | null>(null);

    const handleExecuteNegotiation = (sponsor: Sponsor, riskLevel: 'safe' | 'moderate' | 'high') => {
        const existingOfType = sponsors.find(s => s.type === sponsor.type);
        if (existingOfType) {
            if (!confirm(`Ya tienes un contrato con ${existingOfType.name}. ¿Quieres rescindirlo y firmar con ${sponsor.name}? Esto puede afectar la confianza de la directiva.`)) {
                setNegotiatingSponsor(null);
                return;
            }
        }

        let successChance = 1.0;
        let bonusMultiplier = 1.0;

        if (riskLevel === 'moderate') {
            successChance = 0.65;
            bonusMultiplier = 1.15;
        } else if (riskLevel === 'high') {
            successChance = 0.30;
            bonusMultiplier = 1.30;
        }

        const isSuccess = Math.random() <= successChance;

        if (isSuccess) {
            const finalIncome = Math.floor(sponsor.weeklyIncome * bonusMultiplier);
            dispatch({ type: 'ACCEPT_SPONSOR', payload: { sponsorId: sponsor.id, negotiatedIncome: finalIncome } });
            const signingBonus = Math.floor(finalIncome * 4);
            showToast(`¡Contrato firmado con ${sponsor.name}! Ingreso: ${formatCurrencyShort(finalIncome)}/sem. Bonus: ${formatCurrencyShort(signingBonus)}`, 'success');
        } else {
            dispatch({ type: 'REMOVE_SPONSOR_OFFER', payload: { sponsorId: sponsor.id } });
            showToast(`La directiva de ${sponsor.name} rechazó tus demandas y retiró la oferta.`, 'error');
        }

        setNegotiatingSponsor(null);
    };

    const getBonusLabel = (condition: string) => {
        switch (condition) {
            case 'top4': return 'Terminar Top 4';
            case 'top6': return 'Terminar Top 6';
            case 'promotion': return 'Lograr el Ascenso';
            case 'win_cup': return 'Ganar una Copa';
            default: return condition;
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-8 pb-24 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-1">Área Comercial</h2>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Patrocinios</h1>
                </div>
                <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg border border-white/5">
                    <CheckCircle2Icon className="w-4 h-4 text-[var(--apex-green)]" />
                    <span className="text-xs font-black text-white/70 uppercase tracking-widest">{sponsors.length} Contrato{sponsors.length !== 1 ? 's' : ''} Activo{sponsors.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Current Sponsors */}
            {sponsors.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                        <CheckCircle2Icon className="w-3.5 h-3.5 text-[var(--apex-green)]" />
                        Contratos Activos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {sponsors.map(sponsor => (
                            <div key={sponsor.id} className="apex-card p-5 space-y-4 relative overflow-hidden group border-t-2 border-t-[var(--apex-green)]">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <BriefcaseIcon className="w-16 h-16 text-white" />
                                </div>
                                
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-2xl border border-white/10 shadow-inner">
                                        {sponsor.logo}
                                    </div>
                                    <div>
                                        <div className="text-white font-black uppercase text-sm tracking-tight">{sponsor.name}</div>
                                        <div className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mt-0.5">{sponsor.type}</div>
                                    </div>
                                </div>

                                <div className="space-y-2.5 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">Pago Semanal</span>
                                        <span className="text-[var(--apex-green)] font-black text-sm">{formatCurrencyShort(sponsor.weeklyIncome)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">Restante</span>
                                        <span className="text-white font-bold text-xs flex items-center gap-1">
                                            <TimerIcon className="w-3 h-3 text-white/50" />
                                            {sponsor.duration} sem.
                                        </span>
                                    </div>
                                </div>

                                {sponsor.bonus && (
                                    <div className="pt-3 border-t border-white/5 relative z-10">
                                        <div className="flex items-center gap-1 text-[9px] text-[var(--apex-gold)] font-black uppercase mb-1.5 tracking-[0.2em]">
                                            <StarIcon className="w-3 h-3 fill-current" />
                                            Bono por Rendimiento
                                        </div>
                                        <div className="text-xs text-white/60 font-bold">
                                            {formatCurrencyShort(sponsor.bonus.amount)} if: {getBonusLabel(sponsor.bonus.condition)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Offers */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CoinsIcon className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                    Ofertas Disponibles
                </h3>

                {availableSponsors.length === 0 ? (
                    <div className="apex-card border-dashed border-white/10 py-16 text-center">
                        <CoinsIcon className="w-10 h-10 text-white/10 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">No hay nuevas ofertas disponibles en este momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {availableSponsors.map(offer => (
                            <div key={offer.id} className="apex-card p-6 transition-all hover:border-[var(--apex-gold)]/50 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(200,168,78,0.15)] group flex flex-col justify-between">
                                <div className="space-y-5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center text-2xl border border-white/10 shadow-inner">
                                                {offer.logo}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black uppercase text-sm tracking-tight group-hover:text-[var(--apex-gold)] transition-colors">{offer.name}</h4>
                                                <span className="bg-white/5 text-white/50 border border-white/10 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-[0.2em]">
                                                    {offer.type.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[var(--apex-green)] font-black text-xl leading-none">{formatCurrencyShort(offer.weeklyIncome)}</div>
                                            <div className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] mt-0.5">/ semana</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                            <div className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Duración</div>
                                            <div className="text-white font-black text-sm">{Math.floor(offer.duration / 52)} Año{Math.floor(offer.duration / 52) !== 1 ? 's' : ''}</div>
                                        </div>
                                        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                            <div className="text-[9px] text-[var(--apex-gold)]/70 font-black uppercase tracking-widest mb-1">Bono de Firma</div>
                                            <div className="text-white font-black text-sm">{formatCurrencyShort(offer.weeklyIncome * 4)}</div>
                                        </div>
                                    </div>

                                    {offer.bonus && (
                                        <div className="bg-[var(--apex-gold)]/5 border border-[var(--apex-gold)]/15 p-3.5 rounded-xl">
                                            <div className="flex items-center gap-2 text-[9px] text-[var(--apex-gold)] font-black uppercase mb-2 tracking-[0.2em]">
                                                <StarIcon className="w-3 h-3 fill-current" />
                                                Cláusula de Éxito
                                            </div>
                                            <div className="text-xs text-white/60">
                                                Recibirás <span className="text-white font-bold">{formatCurrencyShort(offer.bonus.amount)}</span> si: <span className="text-[var(--apex-gold)] font-bold">{getBonusLabel(offer.bonus.condition)}</span>.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={() => setNegotiatingSponsor(offer)}
                                    className="mt-6 w-full apex-btn-gold !py-3"
                                >
                                    NEGOCIAR
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Negotiation Modal */}
            {negotiatingSponsor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[var(--apex-surface)] border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--apex-gold)]/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-2xl border border-white/10">
                                    {negotiatingSponsor.logo}
                                </div>
                                Negociación
                            </h3>
                            <button onClick={() => setNegotiatingSponsor(null)} className="text-white/30 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <p className="text-white/60 text-sm mb-8 leading-relaxed relative z-10">
                            <span className="text-white font-bold">{negotiatingSponsor.name}</span> ha puesto <span className="text-[var(--apex-green)] font-bold">{formatCurrencyShort(negotiatingSponsor.weeklyIncome)}/sem</span> sobre la mesa. Puedes aceptar la oferta base o presionar por más — arriesgándote a que retiren la oferta.
                        </p>

                        <div className="space-y-3 relative z-10">
                            <button 
                                onClick={() => handleExecuteNegotiation(negotiatingSponsor, 'safe')}
                                className="w-full flex items-center justify-between p-4 bg-[var(--apex-green)]/5 border border-[var(--apex-green)]/15 hover:border-[var(--apex-green)]/50 hover:bg-[var(--apex-green)]/10 rounded-xl transition-all group"
                            >
                                <div className="text-left">
                                    <div className="text-white font-black uppercase text-xs tracking-widest group-hover:text-[var(--apex-green)] transition-colors">Aceptar Oferta Base</div>
                                    <div className="text-white/40 text-[10px] mt-0.5 font-bold uppercase tracking-widest">100% Probabilidad de Éxito</div>
                                </div>
                                <div className="text-[var(--apex-green)] font-black">{formatCurrencyShort(negotiatingSponsor.weeklyIncome)}</div>
                            </button>

                            <button 
                                onClick={() => handleExecuteNegotiation(negotiatingSponsor, 'moderate')}
                                className="w-full flex items-center justify-between p-4 bg-[var(--apex-gold)]/5 border border-[var(--apex-gold)]/15 hover:border-[var(--apex-gold)]/50 hover:bg-[var(--apex-gold)]/10 rounded-xl transition-all group"
                            >
                                <div className="text-left">
                                    <div className="text-white font-black uppercase text-xs tracking-widest group-hover:text-[var(--apex-gold)] transition-colors">Pedir 15% Más</div>
                                    <div className="text-white/40 text-[10px] mt-0.5 font-bold uppercase tracking-widest">Riesgo Moderado — 65% Éxito</div>
                                </div>
                                <div className="text-[var(--apex-gold)] font-black">{formatCurrencyShort(Math.floor(negotiatingSponsor.weeklyIncome * 1.15))}</div>
                            </button>

                            <button 
                                onClick={() => handleExecuteNegotiation(negotiatingSponsor, 'high')}
                                className="w-full flex items-center justify-between p-4 bg-[var(--apex-red)]/5 border border-[var(--apex-red)]/15 hover:border-[var(--apex-red)]/50 hover:bg-[var(--apex-red)]/10 rounded-xl transition-all group"
                            >
                                <div className="text-left">
                                    <div className="text-white font-black uppercase text-xs tracking-widest group-hover:text-[var(--apex-red)] transition-colors">Pedir 30% Más</div>
                                    <div className="text-white/40 text-[10px] mt-0.5 font-bold uppercase tracking-widest">Alto Riesgo — 30% Éxito</div>
                                </div>
                                <div className="text-[var(--apex-red)] font-black">{formatCurrencyShort(Math.floor(negotiatingSponsor.weeklyIncome * 1.30))}</div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
