import React from 'react';
import { GameState, Sponsor } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency, formatCurrencyShort } from '../../utils';
import { calculateFinancialBreakdown, getNetWeeklyIncome } from '../../services/economy';

interface FinancesScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export const FinancesScreen: React.FC<FinancesScreenProps> = ({ gameState, dispatch }) => {
    const { finances, stadium, sponsors, availableSponsors, team, leagueTables } = gameState;

    // Calculate current position
    const playerTable = leagueTables[team.leagueId] || [];
    const playerPosition = playerTable.find(row => row.teamId === team.id)?.position || 10;

    // Calculate detailed breakdown
    const breakdown = calculateFinancialBreakdown(
        team,
        stadium,
        sponsors,
        playerPosition,
        { bought: 0, sold: 0 }, 
        true, 
        team.leagueId
    );

    const netIncome = getNetWeeklyIncome(breakdown);

    const handleAcceptSponsor = (sponsorId: string) => {
        dispatch({ type: 'ACCEPT_SPONSOR', payload: { sponsorId } });
    };

    const handleExpandStadium = () => {
        if (confirm(`Expand stadium capacity for ${formatCurrency(stadium.expansionCost || 0)}?`)) {
            dispatch({ type: 'EXPAND_STADIUM' });
        }
    };

    const getSponsorTypeLabel = (type: Sponsor['type']) => {
        const labels = {
            shirt: 'Shirt',
            stadium: 'Stadium',
            training: 'Training',
            kit: 'Kit'
        };
        return labels[type];
    };

    return (
        <div className="p-4 md:p-6 space-y-6 pb-24 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-1">Club Operations</h2>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Finances</h1>
                </div>
            </div>

            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="apex-card p-6 border-t-2 border-[var(--apex-green)] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--apex-green)]/10 rounded-full blur-2xl group-hover:bg-[var(--apex-green)]/20 transition-all duration-500"></div>
                    <h3 className="text-[10px] font-black text-[var(--apex-green)] uppercase tracking-widest mb-2 relative z-10">Total Balance</h3>
                    <div className="text-3xl lg:text-4xl font-black text-white relative z-10">{formatCurrencyShort(finances.balance)}</div>
                </div>

                <div className="apex-card p-6 border-t-2 border-[var(--apex-gold)] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--apex-gold)]/10 rounded-full blur-2xl group-hover:bg-[var(--apex-gold)]/20 transition-all duration-500"></div>
                    <h3 className="text-[10px] font-black text-[var(--apex-gold)] uppercase tracking-widest mb-2 relative z-10">Transfer Budget</h3>
                    <div className="text-3xl lg:text-4xl font-black text-white relative z-10">{formatCurrencyShort(finances.transferBudget)}</div>
                </div>

                <div className={`apex-card p-6 border-t-2 ${netIncome >= 0 ? 'border-[var(--apex-green)]' : 'border-[var(--apex-red)]'} relative overflow-hidden group`}>
                    <div className={`absolute -right-4 -top-4 w-24 h-24 ${netIncome >= 0 ? 'bg-[var(--apex-green)]/10' : 'bg-[var(--apex-red)]/10'} rounded-full blur-2xl transition-all duration-500`}></div>
                    <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 relative z-10">Weekly Net Income</h3>
                    <div className={`text-3xl lg:text-4xl font-black relative z-10 ${netIncome >= 0 ? 'text-[var(--apex-green)]' : 'text-[var(--apex-red)]'}`}>
                        {netIncome >= 0 ? '+' : ''}{formatCurrencyShort(netIncome)}
                    </div>
                </div>
            </div>

            {/* Negative Balance Warning */}
            {finances.balance < 0 && (
                <div className="bg-[var(--apex-red)]/10 border border-[var(--apex-red)]/30 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-[var(--apex-red)]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">⚠️</span>
                    </div>
                    <div>
                        <p className="text-[var(--apex-red)] font-black uppercase tracking-wider text-sm">Negative Balance Alert</p>
                        <p className="text-[var(--apex-red)]/80 text-xs font-bold mt-0.5">The club is in debt. The board may intervene if finances are not stabilized by selling players or reducing wages.</p>
                    </div>
                </div>
            )}

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income */}
                <div className="apex-card p-6">
                    <h3 className="text-sm font-black text-[var(--apex-green)] mb-6 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--apex-green)]"></span>
                        Weekly Revenue
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Matchday Tickets</span>
                            <span className="text-[var(--apex-green)] font-black">{formatCurrency(breakdown.matchdayRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Sponsorships</span>
                            <span className="text-[var(--apex-green)] font-black">{formatCurrency(breakdown.sponsorshipRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Broadcasting (TV)</span>
                            <span className="text-[var(--apex-green)] font-black">{formatCurrency(breakdown.tvRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Prize Money</span>
                            <span className="text-[var(--apex-green)] font-black">{formatCurrency(breakdown.prizeMoneyRevenue)}</span>
                        </div>
                        <div className="pt-2 flex justify-between font-black">
                            <span className="text-white uppercase tracking-widest text-xs">Total Revenue</span>
                            <span className="text-[var(--apex-green)] text-lg">
                                {formatCurrency(breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.tvRevenue + breakdown.prizeMoneyRevenue)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expenses */}
                <div className="apex-card p-6">
                    <h3 className="text-sm font-black text-[var(--apex-red)] mb-6 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--apex-red)]"></span>
                        Weekly Expenses
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Player Wages</span>
                            <span className="text-[var(--apex-red)] font-black">{formatCurrency(breakdown.wageExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Staff Wages</span>
                            <span className="text-[var(--apex-red)] font-black">{formatCurrency(breakdown.coachExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Stadium Maintenance</span>
                            <span className="text-[var(--apex-red)] font-black">{formatCurrency(breakdown.stadiumExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Operational Costs</span>
                            <span className="text-[var(--apex-red)] font-black">{formatCurrency(breakdown.operationalExpenses)}</span>
                        </div>
                        <div className="pt-2 flex justify-between font-black">
                            <span className="text-white uppercase tracking-widest text-xs">Total Expenses</span>
                            <span className="text-[var(--apex-red)] text-lg">
                                {formatCurrency(breakdown.wageExpenses + breakdown.coachExpenses + breakdown.stadiumExpenses + breakdown.operationalExpenses)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stadium Management */}
            <div className="apex-card p-6 border-l-4 border-l-[var(--apex-gold)]">
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                    <span className="p-2 bg-white/5 rounded-lg border border-white/10">🏟️</span> 
                    Stadium Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Name</span>
                            <span className="text-sm text-white font-black">{stadium.name}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Capacity</span>
                            <span className="text-sm text-[var(--apex-gold)] font-black">{stadium.capacity.toLocaleString()} seats</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Ticket Price</span>
                            <span className="text-sm text-[var(--apex-green)] font-black">{formatCurrency(stadium.ticketPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Maintenance</span>
                            <span className="text-sm text-[var(--apex-red)] font-black">{formatCurrency(stadium.maintenanceCost)}/wk</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center">
                        {stadium.expansionCost ? (
                            <button
                                onClick={handleExpandStadium}
                                disabled={finances.balance < stadium.expansionCost}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${finances.balance >= stadium.expansionCost
                                    ? 'bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] hover:bg-[var(--apex-gold)] hover:text-black border border-[var(--apex-gold)]/30'
                                    : 'bg-black/40 text-white/30 border border-white/5 cursor-not-allowed'
                                    }`}
                            >
                                Expand to {stadium.expansionCapacity?.toLocaleString()} seats
                                <div className={`text-[9px] mt-1.5 ${finances.balance >= stadium.expansionCost ? 'text-white/60' : 'text-white/20'}`}>
                                    Cost: {formatCurrency(stadium.expansionCost)}
                                </div>
                            </button>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-black/20 border border-white/5 rounded-xl">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Stadium at Maximum Capacity</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sponsors */}
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-black text-white mb-4 flex items-center gap-3 uppercase tracking-tight">
                        <span className="p-2 bg-white/5 rounded-lg border border-white/10">🤝</span> 
                        Active Sponsors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {sponsors.length > 0 ? sponsors.map(sponsor => (
                            <div key={sponsor.id} className="relative group overflow-hidden apex-card p-5">
                                <div className="absolute -right-4 -top-4 text-6xl opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 grayscale">{sponsor.logo}</div>
                                <div className="text-[9px] font-black text-[var(--apex-gold)] uppercase tracking-[0.2em] mb-1.5">{getSponsorTypeLabel(sponsor.type)}</div>
                                <div className="font-black text-white text-base leading-tight mb-4">{sponsor.name}</div>
                                <div className="flex justify-between items-end mt-auto">
                                    <div className="text-[var(--apex-green)] font-black text-lg leading-none">{formatCurrency(sponsor.weeklyIncome)}<span className="text-[8px] text-white/40 font-bold ml-1">/WK</span></div>
                                    <div className="text-[8px] font-black text-white/50 bg-black/40 px-2 py-1 rounded border border-white/10 uppercase tracking-widest">
                                        {Math.floor(sponsor.duration / 52)} YRS
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full apex-card border-dashed border-white/10 py-12 text-center">
                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">No active sponsors. Review commercial offers!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-black text-white mb-4 flex items-center gap-3 uppercase tracking-tight">
                        <span className="p-2 bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/20 rounded-lg">📋</span> 
                        Commercial Offers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {availableSponsors.map(sponsor => (
                            <div key={sponsor.id} className="apex-card p-6 flex flex-col hover:border-[var(--apex-gold)]/50 transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="text-[9px] font-black text-[var(--apex-gold)] uppercase tracking-[0.2em] mb-1.5">{getSponsorTypeLabel(sponsor.type)}</div>
                                        <div className="font-black text-white text-xl group-hover:text-[var(--apex-gold)] transition-colors leading-tight">{sponsor.name}</div>
                                    </div>
                                    <div className="text-3xl bg-white/5 p-3 rounded-xl border border-white/10 group-hover:bg-[var(--apex-gold)]/10 transition-colors grayscale group-hover:grayscale-0">{sponsor.logo}</div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Weekly Income</span>
                                        <span className="text-[var(--apex-green)] font-black">{formatCurrency(sponsor.weeklyIncome)}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-3">
                                        <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Contract Length</span>
                                        <span className="text-white font-black text-xs">{Math.floor(sponsor.duration / 52)} Years</span>
                                    </div>
                                    {sponsor.bonus && (
                                        <div className="relative overflow-hidden bg-[var(--apex-gold)]/5 border border-[var(--apex-gold)]/20 p-3.5 rounded-lg mt-2">
                                            <div className="text-[9px] font-black text-[var(--apex-gold)] uppercase tracking-wider mb-1">Performance Bonus</div>
                                            <div className="text-[10px] text-white/70 font-medium leading-relaxed">
                                                <span className="font-black text-[var(--apex-green)]">{formatCurrency(sponsor.bonus.amount)}</span> if the team finishes in <span className="font-black text-white">{sponsor.bonus.condition === 'top4' ? 'Top 4' : sponsor.bonus.condition === 'top6' ? 'Top 6' : 'Promotion Zone'}</span>.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleAcceptSponsor(sponsor.id)}
                                    className="apex-btn-gold mt-auto w-full text-[10px]"
                                >
                                    SIGN CONTRACT
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
