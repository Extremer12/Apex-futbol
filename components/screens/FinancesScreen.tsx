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
    const { finances, stadium, sponsors, availableSponsors, team, leagueTable } = gameState;

    // Calculate current position
    const playerPosition = leagueTable.find(row => row.teamId === team.id)?.position || 10;

    // Calculate detailed breakdown
    const breakdown = calculateFinancialBreakdown(
        team,
        stadium,
        sponsors,
        playerPosition,
        { bought: 0, sold: 0 } // Weekly transfers (would need to track this)
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

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-green-400 mb-4">💰 Ingresos Semanales</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-300">Entradas (Día de Partido)</span>
                            <span className="text-green-400 font-semibold">{formatCurrency(breakdown.matchdayRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-300">Patrocinadores</span>
                            <span className="text-green-400 font-semibold">{formatCurrency(breakdown.sponsorshipRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-300">Premios de Liga/Copa</span>
                            <span className="text-green-400 font-semibold">{formatCurrency(breakdown.prizeMoneyRevenue)}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-3 flex justify-between font-bold">
                            <span className="text-white">Total Ingresos</span>
                            <span className="text-green-400 text-xl">
                                {formatCurrency(breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.prizeMoneyRevenue)}
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
            <div>
                <h3 className="text-xl font-bold text-white mb-4">🤝 Patrocinadores Actuales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {sponsors.length > 0 ? sponsors.map(sponsor => (
                        <div key={sponsor.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="text-xs text-slate-400 uppercase mb-1">{getSponsorTypeLabel(sponsor.type)}</div>
                            <div className="font-bold text-white mb-2">{sponsor.name}</div>
                            <div className="text-green-400 font-semibold">{formatCurrency(sponsor.weeklyIncome)}/sem</div>
                            <div className="text-xs text-slate-400 mt-1">{Math.floor(sponsor.duration / 52)} años restantes</div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center text-slate-400 py-8">
                            No tienes patrocinadores activos. ¡Revisa las ofertas disponibles!
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-bold text-white mb-4">📋 Ofertas de Patrocinio Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableSponsors.map(sponsor => (
                        <div key={sponsor.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-xs text-slate-400 uppercase">{getSponsorTypeLabel(sponsor.type)}</div>
                                    <div className="font-bold text-white text-lg">{sponsor.name}</div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Ingresos</span>
                                    <span className="text-green-400 font-semibold">{formatCurrency(sponsor.weeklyIncome)}/sem</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Duración</span>
                                    <span className="text-white">{Math.floor(sponsor.duration / 52)} años</span>
                                </div>
                                {sponsor.bonus && (
                                    <div className="text-xs text-blue-400 bg-blue-900/30 p-2 rounded">
                                        Bonus: +{formatCurrency(sponsor.bonus.amount)} si {sponsor.bonus.condition === 'top4' ? 'Top 4' : sponsor.bonus.condition === 'top6' ? 'Top 6' : 'Promoción'}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleAcceptSponsor(sponsor.id)}
                                className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Aceptar Oferta
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
