import React from 'react';
import { Stadium, Team } from '../../../types';
import { formatCurrencyShort } from '../../../utils';
import { getFacilityUpgradeCost, getStadiumExpansionCost } from '../../../services/economy';
import { Building2, Hammer, Star, Award } from 'lucide-react';
import { StatCell } from '../transfers/TransferUI';

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
    const expansionCapacity = stadium.expansionCapacity || Math.min(120_000, Math.floor(stadium.capacity * 1.25));
    const vipBonusPct = Math.floor((stadium.facilityLevel - 1) * 12.5);
    const maxMatchdayRevenue = Math.floor(stadium.capacity * stadium.ticketPrice * (1 + (stadium.facilityLevel - 1) * 0.125));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Stadium Info & Expansion */}
            <div className="apex-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                        <div className="flex items-center gap-2 min-w-0">
                            <Building2 className="w-4 h-4 text-[var(--apex-gold)] shrink-0" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-white truncate">{stadium.name}</h3>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 shrink-0">{stadium.city || 'Sede oficial'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <StatCell label="Aforo total" value={`${stadium.capacity.toLocaleString()}`} accent="text-[var(--apex-gold)]" />
                        <StatCell label="Entrada base" value={formatCurrencyShort(stadium.ticketPrice)} accent="text-emerald-400" />
                        <StatCell label="Mantenimiento" value={`${formatCurrencyShort(stadium.maintenanceCost)}/sem`} accent="text-rose-400" />
                        <StatCell label="Taquilla llena" value={formatCurrencyShort(maxMatchdayRevenue)} />
                    </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                    {stadium.capacity < 120_000 ? (
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Ampliación a {expansionCapacity.toLocaleString()}</span>
                                <span className="text-[var(--apex-gold)] font-black">+{(expansionCapacity - stadium.capacity).toLocaleString()} butacas</span>
                            </div>
                            <button
                                onClick={onRequestExpand}
                                disabled={balance < expansionCost}
                                className={`w-full h-11 rounded-xl font-black uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 ${
                                    balance >= expansionCost
                                        ? 'bg-[var(--apex-gold)] hover:bg-[var(--apex-gold-light)] text-slate-950 cursor-pointer'
                                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                                }`}
                            >
                                <Hammer className="w-3.5 h-3.5" />
                                <span>Ampliar Gradas ({formatCurrencyShort(expansionCost)})</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white/5 p-3 rounded-xl text-center border border-white/5">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Capacidad máxima estructural alcanzada
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* VIP Facilities */}
            <div className="apex-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-400" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-white">Palcos VIP</h3>
                        </div>
                        <span className="text-xs font-black text-purple-400">Nivel {stadium.facilityLevel}/5</span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                        Cada nivel de hospitalidad aumenta la recaudación por partido en <strong className="text-white">+12.5%</strong>. Bonus actual: <strong className="text-emerald-400">+{vipBonusPct}%</strong>.
                    </p>

                    <div className="flex items-center justify-center gap-2 bg-white/[0.03] p-3.5 rounded-xl border border-white/5">
                        {[1, 2, 3, 4, 5].map(lvl => {
                            const filled = lvl <= stadium.facilityLevel;
                            return (
                                <div
                                    key={lvl}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                                        filled
                                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                            : 'bg-white/5 text-slate-600 border-white/5'
                                    }`}
                                >
                                    <Star className={`w-4 h-4 ${filled ? 'fill-purple-400 text-purple-300' : ''}`} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                    {stadium.facilityLevel < 5 ? (
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Palcos Nivel {nextFacilityLevel}</span>
                                <span className="text-emerald-400 font-black">+12.5% recaudación</span>
                            </div>
                            <button
                                onClick={() => onRequestUpgradeFacility(facilityCost)}
                                disabled={balance < facilityCost}
                                className={`w-full h-11 rounded-xl font-black text-xs uppercase tracking-wider transition-colors ${
                                    balance >= facilityCost
                                        ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                                }`}
                            >
                                Mejorar a Nivel {nextFacilityLevel} ({formatCurrencyShort(facilityCost)})
                            </button>
                        </div>
                    ) : (
                        <div className="bg-purple-600/10 p-3 rounded-xl text-center border border-purple-500/20">
                            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                                Instalaciones al nivel máximo
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
