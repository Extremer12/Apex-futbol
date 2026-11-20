import React from 'react';
import { Player, Team } from '../../../../types';
import { PlayerAvatar } from '../../../ui/PlayerAvatar';
import { TeamLogo } from '../../../../data/teams/helpers';
import { formatCurrency, formatWeeklyWage } from '../../../../utils';
import { Shield, Sparkles, Flame, X, FileText } from 'lucide-react';

interface NegotiationDossierProps {
    negotiatingPlayer: Player;
    sellingTeam?: Team;
    normMarketValue: number;
    currentWage: number;
    remainingAttempts: number;
    positionStyle: {
        color: string;
        bg: string;
        border: string;
        name: string;
    };
    isMobileDrawer?: boolean;
    onCloseMobile?: () => void;
}

export const NegotiationDossier: React.FC<NegotiationDossierProps> = React.memo(({
    negotiatingPlayer,
    sellingTeam,
    normMarketValue,
    currentWage,
    remainingAttempts,
    positionStyle,
    isMobileDrawer = false,
    onCloseMobile
}) => {
    if (isMobileDrawer) {
        return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
                <div className="w-full sm:max-w-md bg-[#0F1423] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--apex-gold)] flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Dossier Técnico de Scouting
                        </h3>
                        {onCloseMobile && (
                            <button
                                onClick={onCloseMobile}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <PlayerAvatar
                                player={negotiatingPlayer}
                                className="w-16 h-16 rounded-full border-2 border-white/20"
                                primaryColor={sellingTeam?.primaryColor}
                            />
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[var(--apex-gold)] text-black font-black text-[10px] px-2 rounded-full whitespace-nowrap">
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

                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[9px] font-bold text-white/40 uppercase block">Valor de Mercado</span>
                            <span className="text-sm font-black text-emerald-400">{formatCurrency(normMarketValue)}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[9px] font-bold text-white/40 uppercase block">Ficha Actual</span>
                            <span className="text-sm font-black text-white">{formatWeeklyWage(currentWage)}</span>
                        </div>
                    </div>

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

                    {onCloseMobile && (
                        <button
                            onClick={onCloseMobile}
                            className="w-full py-3 bg-[var(--apex-gold)] text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                        >
                            Regresar a la Sala de Negociación
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <aside className="hidden lg:flex lg:col-span-4 bg-[#0B0F19]/60 border-r border-white/10 p-6 flex-col justify-between overflow-y-auto custom-scrollbar backdrop-blur-md">
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--apex-gold)] flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Dirección Deportiva
                    </span>
                    <span className="text-[10px] font-bold text-white/40">Informe Confidencial</span>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                        <PlayerAvatar
                            player={negotiatingPlayer}
                            className="w-24 h-24 rounded-full border-2 border-white/20 shadow-2xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                            primaryColor={sellingTeam?.primaryColor}
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-[var(--apex-gold)] text-black font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap">
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

                <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Valor de Mercado</span>
                        <span className="text-sm font-black text-emerald-400">{formatCurrency(normMarketValue)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Ficha Actual</span>
                        <span className="text-sm font-black text-white/90">{formatWeeklyWage(currentWage)}</span>
                    </div>
                </div>

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
                            ? `Quedan ${remainingAttempts} intento(s) formales antes de abandonar la mesa.` 
                            : 'Las negociaciones han colapsado definitivamente.'}
                    </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--apex-gold)]/5 border border-[var(--apex-gold)]/15 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[var(--apex-gold)] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/70 leading-relaxed">
                        Como presidente, encontrar el acuerdo justo preserva la salud económica de la entidad y la química del plantel.
                    </p>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-[9px] text-white/30 text-center uppercase tracking-wider font-bold">
                Gabinete Presidencial • Apex Management
            </div>
        </aside>
    );
});
