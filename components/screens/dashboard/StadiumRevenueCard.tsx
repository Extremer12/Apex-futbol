import React from 'react';
import { GameState } from '../../../types';
import { calculateMatchdayRevenue } from '../../../services/economy';
import { formatCurrencyShort } from '../../../utils';

interface StadiumRevenueCardProps {
    gameState: GameState;
}

export const StadiumRevenueCard: React.FC<StadiumRevenueCardProps> = ({ gameState }) => {
    const stadium = gameState.stadium;
    const team = gameState.team;

    // Resolve current league position
    const currentTable = gameState.leagueTables[team.leagueId] || [];
    const leaguePosition = currentTable.find(r => r.teamId === team.id)?.position || (team.tier === 'Top' ? 2 : team.tier === 'Mid' ? 8 : 15);

    // Calculate matchday revenue per home game
    const singleMatchdayRevenue = calculateMatchdayRevenue(stadium, leaguePosition);
    
    // Average 2 home games per month
    const monthlyMatchday = singleMatchdayRevenue * 2;

    // Monthly sponsorship & commercial portion attributed to stadium / sponsors
    const weeklySponsors = (gameState.sponsors || []).reduce((sum, s) => sum + s.weeklyIncome, 0);
    const monthlyCommercial = weeklySponsors > 0 
        ? weeklySponsors * 4 
        : Math.floor(monthlyMatchday * 0.45);

    // Concessions, VIP Hospitality & Merchandising
    const facilityMultiplier = 1 + ((stadium.facilityLevel || 1) - 1) * 0.15;
    const monthlyConcessions = Math.floor(stadium.capacity * 6.5 * facilityMultiplier * 2);

    // Total monthly stadium revenue
    const totalMonthly = monthlyMatchday + monthlyCommercial + monthlyConcessions;

    // Growth estimate based on fan approval & position
    const fanRating = gameState.fanApproval?.rating ?? 65;
    const growthPercent = fanRating >= 70 ? 12.4 : fanRating >= 50 ? 5.2 : -4.8;
    const monthlyGrowth = Math.floor(totalMonthly * (Math.abs(growthPercent) / 100));

    // Dynamic bar heights representing recent matchday attendances / revenues
    const barData = React.useMemo(() => {
        const baseAttendanceFactor = leaguePosition <= 3 ? 0.95 : leaguePosition <= 8 ? 0.85 : 0.72;
        return [0.65, 0.78, 0.70, 0.88, 0.82, 0.95, 0.84, 0.92, 0.89, 1.0].map(factor => {
            const normalized = Math.min(100, Math.max(30, Math.round(factor * baseAttendanceFactor * 100)));
            return normalized;
        });
    }, [leaguePosition]);

    return (
        <div className="apex-card p-5 relative overflow-hidden group">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase block">
                            Ingresos del Estadio • {stadium.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-white/5 border border-white/10 rounded text-white/60 font-semibold">
                            Cap. {stadium.capacity.toLocaleString()}
                        </span>
                    </div>

                    <div className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight">
                        {formatCurrencyShort(totalMonthly)}
                        <span className="text-xs font-semibold text-white/40 ml-1.5">/ mes</span>
                    </div>

                    <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${growthPercent >= 0 ? 'text-[var(--apex-green)]' : 'text-rose-400'}`}>
                        <span>{growthPercent >= 0 ? '▲ +' : '▼ -'}{formatCurrencyShort(monthlyGrowth)} este mes</span>
                        <span className="text-white/30 text-[9px]">({growthPercent >= 0 ? '+' : ''}{growthPercent}%)</span>
                    </div>
                </div>
                
                {/* Attendance & Revenue Histogram */}
                <div className="flex items-end gap-1.5 h-14 shrink-0">
                    {barData.map((h, i) => (
                        <div 
                            key={i} 
                            className="w-2 sm:w-2.5 bg-gradient-to-t from-[var(--apex-gold)]/60 to-yellow-200 rounded-t-sm opacity-50 group-hover:opacity-100 transition-opacity" 
                            style={{ height: `${h}%` }}
                            title={`Aforo estimado: ${h}%`}
                        />
                    ))}
                </div>

                {/* Breakdown per Channel */}
                <div className="flex flex-col gap-2 min-w-[140px] w-full md:w-auto">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider border-b border-white/5 pb-1">
                        <span className="text-white/40">Día de Partido</span>
                        <span className="text-white font-extrabold">{formatCurrencyShort(monthlyMatchday)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider border-b border-white/5 pb-1">
                        <span className="text-white/40">Comercial / Sponsors</span>
                        <span className="text-white font-extrabold">{formatCurrencyShort(monthlyCommercial)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-white/40">VIP & Servicios</span>
                        <span className="text-white font-extrabold">{formatCurrencyShort(monthlyConcessions)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
