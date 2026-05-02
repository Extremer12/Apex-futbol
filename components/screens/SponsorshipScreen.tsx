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

    const handleAcceptSponsor = (newSponsor: Sponsor) => {
        // Check if we already have this type
        const existingOfType = sponsors.find(s => s.type === newSponsor.type);
        if (existingOfType) {
            if (!confirm(`Ya tienes un contrato con ${existingOfType.name}. ¿Quieres rescindirlo y aceptar a ${newSponsor.name}? Podría haber penalizaciones.`)) {
                return;
            }
        }

        const updatedSponsors = sponsors.filter(s => s.type !== newSponsor.type);
        dispatch({ type: 'UPDATE_SPONSORS', payload: [...updatedSponsors, newSponsor] });
        
        // Bonus for signing
        const signingBonus = Math.floor(newSponsor.weeklyIncome * 4);
        dispatch({ type: 'UPDATE_FINANCES', payload: { ...finances, balance: finances.balance + signingBonus, balanceHistory: [...finances.balanceHistory, finances.balance + signingBonus] } });
        
        showToast(`¡Contrato firmado con ${newSponsor.name}! Bono de firma: ${formatCurrencyShort(signingBonus)}`, 'success');
    };

    const getBonusLabel = (condition: string) => {
        switch (condition) {
            case 'top4': return 'Terminar en Top 4';
            case 'top6': return 'Terminar en Top 6';
            case 'promotion': return 'Conseguir el Ascenso';
            case 'win_cup': return 'Ganar una Copa';
            default: return condition;
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Área Comercial</h2>
                <p className="text-slate-500 font-bold">Gestiona los contratos de patrocinio de tu club.</p>
            </div>

            {/* Current Sponsors */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2Icon className="w-4 h-4 text-emerald-400" />
                    Contratos Activos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {sponsors.map(sponsor => (
                        <div key={sponsor.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <BriefcaseIcon className="w-12 h-12 text-white" />
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">{sponsor.logo}</div>
                                <div>
                                    <div className="text-white font-black uppercase text-sm">{sponsor.name}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">{sponsor.type}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Pago Semanal</span>
                                    <span className="text-emerald-400 font-black text-sm">{formatCurrencyShort(sponsor.weeklyIncome)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Restante</span>
                                    <span className="text-white font-bold text-xs flex items-center gap-1">
                                        <TimerIcon className="w-3 h-3 text-sky-400" />
                                        {sponsor.duration} sem.
                                    </span>
                                </div>
                            </div>

                            {sponsor.bonus && (
                                <div className="pt-3 border-t border-slate-800">
                                    <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-black uppercase mb-1">
                                        <StarIcon className="w-3 h-3 fill-current" />
                                        Bono por Objetivos
                                    </div>
                                    <div className="text-xs text-slate-300 font-medium">
                                        {formatCurrencyShort(sponsor.bonus.amount)} si: {getBonusLabel(sponsor.bonus.condition)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Available Offers */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CoinsIcon className="w-4 h-4 text-sky-400" />
                    Ofertas Disponibles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableSponsors.map(offer => (
                        <div key={offer.id} className="bg-slate-900 border border-slate-800 hover:border-sky-500/30 rounded-3xl p-6 transition-all flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                            {offer.logo}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black uppercase">{offer.name}</h4>
                                            <span className="bg-sky-500/10 text-sky-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-sky-500/20">
                                                {offer.type.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-emerald-400 font-black text-xl">{formatCurrencyShort(offer.weeklyIncome)}</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase">/ SEMANA</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/30">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Duración</div>
                                        <div className="text-white font-black text-sm">{Math.floor(offer.duration / 52)} Años</div>
                                    </div>
                                    <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/30">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 text-yellow-500/70">Bono Firma</div>
                                        <div className="text-white font-black text-sm">{formatCurrencyShort(offer.weeklyIncome * 4)}</div>
                                    </div>
                                </div>

                                {offer.bonus && (
                                    <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-2xl">
                                        <div className="flex items-center gap-2 text-[10px] text-yellow-500 font-black uppercase mb-2">
                                            <StarIcon className="w-3 h-3 fill-current" />
                                            Cláusula de Éxito
                                        </div>
                                        <div className="text-xs text-slate-300">
                                            Recibirás <span className="text-white font-bold">{formatCurrencyShort(offer.bonus.amount)}</span> si el equipo logra: <span className="text-yellow-400 font-bold">{getBonusLabel(offer.bonus.condition)}</span>.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => handleAcceptSponsor(offer)}
                                className="mt-8 w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-sky-400 transition-all uppercase tracking-tighter shadow-lg shadow-white/5"
                            >
                                Aceptar Contrato
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
