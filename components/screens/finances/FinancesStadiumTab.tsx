import React from 'react';
import { Stadium, Team } from '../../../types';
import { formatCurrency, formatCurrencyShort } from '../../../utils';
import { getFacilityUpgradeCost, getStadiumExpansionCost } from '../../../services/economy';
import { Building2, Sparkles, Hammer, CheckCircle2 } from 'lucide-react';

interface FinancesStadiumTabProps {
    stadium: Stadium;
    team: Team;
    balance: number;
    onRequestExpand: () => void;
    onRequestUpgradeFacility: (cost: number) => void;
}

export const FinancesStadiumTab: React.FC<FinancesStadiumTabProps> = React.memo(({
    stadium,
    team,
    balance,
    onRequestExpand,
    onRequestUpgradeFacility
}) => {
    const nextFacilityLevel = stadium.facilityLevel + 1;
    const facilityCost = getFacilityUpgradeCost(nextFacilityLevel, team.tier, team.leagueId);
    const expansionCost = stadium.expansionCost || getStadiumExpansionCost(stadium.capacity, team.tier, team.leagueId);
    const expansionCapacity = stadium.expansionCapacity || Math.floor(stadium.capacity * 1.25);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stadium Status Card */}
                <div className="apex-card p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--apex-gold)] flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[var(--apex-gold)]" />
                            Ficha del Estadio
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">{stadium.city || 'Sede del Club'}</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Recinto Oficial</span>
                            <span className="text-sm text-white font-bold">{stadium.name}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Aforo Total</span>
                            <span className="text-sm text-[var(--apex-gold)] font-bold">{stadium.capacity.toLocaleString()} espectadores</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Precio de Entrada Base</span>
                            <span className="text-sm text-emerald-400 font-bold">{formatCurrency(stadium.ticketPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Mantenimiento Semanal</span>
                            <span className="text-sm text-rose-400 font-bold">{formatCurrency(stadium.maintenanceCost)}/sem</span>
                        </div>
                    </div>

                    {/* Capacity Expansion Project */}
                    <div className="pt-4 border-t border-white/10">
                        {stadium.capacity < 120_000 ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-300 font-medium">Proyecto de Ampliación de Gradas</span>
                                    <span className="text-[var(--apex-gold)] font-bold">+{(expansionCapacity - stadium.capacity).toLocaleString()} butacas</span>
                                </div>
                                <button
                                    onClick={onRequestExpand}
                                    disabled={balance < expansionCost}
                                    className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-lg ${
                                        balance >= expansionCost
                                            ? 'bg-[var(--apex-gold)] hover:bg-[var(--apex-gold-light)] text-slate-950 cursor-pointer'
                                            : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                                    }`}
                                >
                                    Ampliar a {expansionCapacity.toLocaleString()} Asientos
                                    <div className="text-[10px] font-normal opacity-80 mt-0.5">
                                        Costo de Obra: {formatCurrency(expansionCost)}
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Estadio en su Máxima Capacidad Estructural
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* VIP Facilities & Hospitality */}
                <div className="apex-card p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            Experiencia VIP & Palcos Corporativos
                        </h3>
                        <span className="text-xs font-bold text-purple-400">
                            Nivel {stadium.facilityLevel} de 5
                        </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                        La modernización de palcos y zonas VIP atrae a empresas y patrocinadores de alto poder adquisitivo, incrementando la recaudación de día de partido en un <strong>+12.5% por nivel</strong>.
                    </p>

                    {/* Level Visual Stars */}
                    <div className="flex items-center gap-2 bg-slate-950/60 p-4 rounded-xl border border-white/5 justify-center">
                        {[1, 2, 3, 4, 5].map(lvl => (
                            <div
                                key={lvl}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base border transition-all ${
                                    lvl <= stadium.facilityLevel
                                        ? 'bg-purple-600/20 text-purple-400 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                                        : 'bg-white/5 text-slate-600 border-white/5'
                                }`}
                            >
                                ★
                            </div>
                        ))}
                    </div>

                    {stadium.facilityLevel < 5 ? (
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium">Siguiente Nivel: Palcos VIP Nivel {nextFacilityLevel}</span>
                                <span className="text-emerald-400 font-bold">+12.5% Recaudación</span>
                            </div>
                            <button
                                onClick={() => onRequestUpgradeFacility(facilityCost)}
                                disabled={balance < facilityCost}
                                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-lg ${
                                    balance >= facilityCost
                                        ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-purple-600/20'
                                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                                }`}
                            >
                                Modernizar Palcos al Nivel {nextFacilityLevel} ({formatCurrency(facilityCost)})
                            </button>
                        </div>
                    ) : (
                        <div className="bg-purple-600/10 p-4 rounded-xl text-center border border-purple-500/20">
                            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                                Instalaciones Cinco Estrellas (Nivel Máximo)
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
