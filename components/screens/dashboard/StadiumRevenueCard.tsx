import React from 'react';
import { GameState } from '../../../types';
import { calculateMatchdayRevenue } from '../../../services/economy';
import { formatCurrencyShort } from '../../../utils';
import { Landmark } from 'lucide-react';

interface StadiumRevenueCardProps {
    gameState: GameState;
}

export const StadiumRevenueCard: React.FC<StadiumRevenueCardProps> = React.memo(({ gameState }) => {
    const stadium = gameState.stadium;
    const team = gameState.team;

    const currentTable = gameState.leagueTables[team.leagueId] || [];
    const leaguePosition = currentTable.find(r => r.teamId === team.id)?.position || (team.tier === 'Top' ? 2 : team.tier === 'Mid' ? 8 : 15);

    const singleMatchdayRevenue = calculateMatchdayRevenue(stadium, leaguePosition);
    const monthlyMatchday = singleMatchdayRevenue * 2;

    const weeklySponsors = (gameState.sponsors || []).reduce((sum, s) => sum + s.weeklyIncome, 0);
    const monthlyCommercial = weeklySponsors > 0
        ? weeklySponsors * 4
        : Math.floor(monthlyMatchday * 0.45);

    const facilityMultiplier = 1 + ((stadium.facilityLevel || 1) - 1) * 0.15;
    const monthlyConcessions = Math.floor(stadium.capacity * 6.5 * facilityMultiplier * 2);
    const totalMonthly = monthlyMatchday + monthlyCommercial + monthlyConcessions;

    return (
        <div className="apex-card p-4 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Landmark className="w-4 h-4 text-[var(--apex-gold)]" />
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            {stadium.name} • {stadium.capacity.toLocaleString()} localidades
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {formatCurrencyShort(totalMonthly)}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">ingresos est. / mes</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto">
                    <div className="bg-black/30 px-3 py-2 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-400 font-semibold uppercase block">Taquilla</span>
                        <span className="text-xs font-black text-white">{formatCurrencyShort(monthlyMatchday)}</span>
                    </div>
                    <div className="bg-black/30 px-3 py-2 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-400 font-semibold uppercase block">Sponsors</span>
                        <span className="text-xs font-black text-white">{formatCurrencyShort(monthlyCommercial)}</span>
                    </div>
                    <div className="bg-black/30 px-3 py-2 rounded-xl border border-white/5">
                        <span className="text-[9px] text-slate-400 font-semibold uppercase block">VIP y Tienda</span>
                        <span className="text-xs font-black text-white">{formatCurrencyShort(monthlyConcessions)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});
