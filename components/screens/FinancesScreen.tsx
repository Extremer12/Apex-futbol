import React from 'react';
import { GameState, Sponsor } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency } from '../../utils';
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
    // For display purposes, assume there was a home match (to show potential revenue)
    const breakdown = calculateFinancialBreakdown(
        team,
        stadium,
        sponsors,
        playerPosition,
        { bought: 0, sold: 0 }, // Weekly transfers (would need to track this)
        true, // wasHomeMatch - showing potential with home match
        team.leagueId
    );

    const netIncome = getNetWeeklyIncome(breakdown);

    const handleAcceptSponsor = (sponsorId: string) => {
        dispatch({ type: 'ACCEPT_SPONSOR', payload: { sponsorId } });
    };

    const handleExpandStadium = () => {
        if (confirm(`¿Expandir el estadio por ${formatCurrency(stadium.expansionCost || 0)}?`)) {
            dispatch({ type: 'EXPAND_STADIUM' });
        }
    };

    const getSponsorTypeLabel = (type: Sponsor['type']) => {
        const labels = {
            shirt: 'Camiseta',
            stadium: 'Estadio',
            training: 'Entrenamiento',
            kit: 'Equipación'
        };
        return labels[type];
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h2 className="text-3xl font-bold text-white">Finanzas</h2>

            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/30 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-green-300 uppercase mb-2">Balance Total</h3>
                    <div className="text-4xl font-bold text-white">{formatCurrency(finances.balance)}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-blue-500/30 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-blue-300 uppercase mb-2">Presupuesto Fichajes</h3>
                    <div className="text-4xl font-bold text-white">{formatCurrency(finances.transferBudget)}</div>
                </div>

                <div className={`bg-gradient-to-br ${netIncome >= 0 ? 'from-green-900/40 to-emerald-900/40 border-green-500/30' : 'from-red-900/40 to-orange-900/40 border-red-500/30'} border-2 rounded-xl p-6`}>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase mb-2">Balance Semanal</h3>
                    <div className={`text-4xl font-bold ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
                    </div>
                </div>
            </div>

            {/* Negative Balance Warning */}
            {finances.balance < 0 && (
                <div className="bg-red-900/40 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <p className="text-red-200 font-semibold">⚠️ Balance Negativo</p>
                        <p className="text-red-300 text-sm">Tu club está en números rojos. Considera vender jugadores o reducir gastos.</p>
                    </div>
                </div>
            )}

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-green-400 mb-4">💰 Ingresos Semanales</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">Entradas (Día de Partido)</span>
                            <span className="text-green-400 font-semibold">{formatCurrency(breakdown.matchdayRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">Patrocinadores</span>
                            <span className="text-green-400 font-semibold">{formatCurrency(breakdown.sponsorshipRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">Derechos de TV</span>
                            <span className="text-green-400 font-semibold">{formatCurrency(breakdown.tvRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">Premios de Liga/Copa</span>
                            <span className="text-green-400 font-semibold">{formatCurrency(breakdown.prizeMoneyRevenue)}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-3 flex justify-between font-bold">
                            <span className="text-white">Total Ingresos</span>
                            <span className="text-green-400 text-xl">
                                {formatCurrency(breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.tvRevenue + breakdown.prizeMoneyRevenue)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expenses */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-red-400 mb-4">💸 Gastos Semanales</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-300">Salarios Jugadores</span>
                            <span className="text-red-400 font-semibold">{formatCurrency(breakdown.wageExpenses)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-300">Salario Director Técnico</span>
                            <span className="text-red-400 font-semibold">{formatCurrency(breakdown.coachExpenses)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-300">Mantenimiento Estadio</span>
                            <span className="text-red-400 font-semibold">{formatCurrency(breakdown.stadiumExpenses)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-300">Gastos Operativos</span>
                            <span className="text-red-400 font-semibold">{formatCurrency(breakdown.operationalExpenses)}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-3 flex justify-between font-bold">
                            <span className="text-white">Total Gastos</span>
                            <span className="text-red-400 text-xl">
                                {formatCurrency(breakdown.wageExpenses + breakdown.coachExpenses + breakdown.stadiumExpenses + breakdown.operationalExpenses)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stadium Management */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">🏟️ Gestión del Estadio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Nombre:</span>
                            <span className="text-white font-semibold">{stadium.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Capacidad:</span>
                            <span className="text-white font-semibold">{stadium.capacity.toLocaleString()} asientos</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Precio Entrada:</span>
                            <span className="text-white font-semibold">{formatCurrency(stadium.ticketPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Mantenimiento:</span>
                            <span className="text-red-400 font-semibold">{formatCurrency(stadium.maintenanceCost)}/semana</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center">
                        {stadium.expansionCost && (
                            <button
                                onClick={handleExpandStadium}
                                disabled={finances.balance < stadium.expansionCost}
                                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${finances.balance >= stadium.expansionCost
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                Expandir a {stadium.expansionCapacity?.toLocaleString()} asientos
                                <div className="text-sm mt-1">Coste: {formatCurrency(stadium.expansionCost)}</div>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sponsors */}
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="p-2 bg-slate-800 rounded-lg">🤝</span> Patrocinadores Actuales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {sponsors.length > 0 ? sponsors.map(sponsor => (
                            <div key={sponsor.id} className="relative group overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700 shadow-lg">
                                <div className="absolute -right-2 -top-2 text-4xl opacity-10 group-hover:scale-110 transition-transform">{sponsor.logo}</div>
                                <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">{getSponsorTypeLabel(sponsor.type)}</div>
                                <div className="font-bold text-white text-lg mb-2">{sponsor.name}</div>
                                <div className="flex justify-between items-end">
                                    <div className="text-green-400 font-black text-xl">{formatCurrency(sponsor.weeklyIncome)}<span className="text-[10px] text-slate-500 font-normal">/sem</span></div>
                                    <div className="text-[10px] text-slate-500 bg-slate-950 px-2 py-1 rounded-full border border-slate-800">
                                        {Math.floor(sponsor.duration / 52)} AÑOS
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-2xl py-12 text-center text-slate-500">
                                No tienes patrocinadores activos. ¡Revisa las ofertas!
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="p-2 bg-sky-500/20 rounded-lg">📋</span> Ofertas de Patrocinio
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableSponsors.map(sponsor => (
                            <div key={sponsor.id} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 hover:border-sky-500/30 transition-all duration-300 group shadow-xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">{getSponsorTypeLabel(sponsor.type)}</div>
                                        <div className="font-black text-white text-2xl group-hover:text-sky-300 transition-colors">{sponsor.name}</div>
                                    </div>
                                    <div className="text-4xl bg-slate-800 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500">{sponsor.logo}</div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded-xl">
                                        <span className="text-sm text-slate-400">Ingresos Semanales</span>
                                        <span className="text-green-400 font-black text-lg">{formatCurrency(sponsor.weeklyIncome)}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-3">
                                        <span className="text-sm text-slate-400">Duración Contrato</span>
                                        <span className="text-white font-bold">{Math.floor(sponsor.duration / 52)} años</span>
                                    </div>
                                    {sponsor.bonus && (
                                        <div className="relative overflow-hidden bg-sky-900/20 border border-sky-500/20 p-4 rounded-xl">
                                            <div className="absolute right-0 top-0 p-1 opacity-10">✨</div>
                                            <div className="text-[10px] font-black text-sky-400 uppercase mb-1">Bono por Rendimiento</div>
                                            <div className="text-sm text-sky-200">
                                                <span className="font-bold text-white">{formatCurrency(sponsor.bonus.amount)}</span> si el equipo queda en <span className="font-bold text-white">{sponsor.bonus.condition === 'top4' ? 'Top 4' : sponsor.bonus.condition === 'top6' ? 'Top 6' : 'Ascenso'}</span>.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleAcceptSponsor(sponsor.id)}
                                    className="w-full py-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl font-black shadow-lg shadow-sky-600/20 transform hover:-translate-y-1 transition-all duration-200"
                                >
                                    FIRMAR CONTRATO
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
