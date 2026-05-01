import React from 'react';
import { GameState, Screen, ElectoralPromise } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency } from '../../utils';
import { TrophyIcon, UsersIcon, TrendingUpIcon } from '../icons';

interface ClubHubScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export const ClubHubScreen: React.FC<ClubHubScreenProps> = ({ gameState, dispatch }) => {
    const { team, mandate, fanApproval, electoralPromises, boardConfidence, stadium, finances } = gameState;

    const getPromiseTypeIcon = (type: ElectoralPromise['type']) => {
        switch (type) {
            case 'league_position': return <TrophyIcon className="w-5 h-5 text-sky-400" />;
            case 'trophy': return <TrophyIcon className="w-5 h-5 text-yellow-400" />;
            case 'stadium': return <div className="p-1 bg-green-500/20 rounded">🏟️</div>;
            case 'transfer': return <UsersIcon className="w-5 h-5 text-purple-400" />;
            case 'finances': return <div className="p-1 bg-emerald-500/20 rounded">💰</div>;
            default: return null;
        }
    };

    const handleExpandStadium = () => {
        if (stadium.expansionCost && finances.balance >= stadium.expansionCost) {
            if (confirm(`¿Expandir el estadio por ${formatCurrency(stadium.expansionCost)}?`)) {
                dispatch({ type: 'EXPAND_STADIUM' });
            }
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-8 animate-fade-in">
            {/* Header / Mandate Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border border-purple-500/30 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrophyIcon className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Despacho Presidencial</h1>
                    <div className="flex flex-wrap items-center gap-4 text-purple-300">
                        <span className="bg-purple-900/50 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30">
                            MANDATO #{mandate.totalMandates}
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Año {mandate.currentYear} de 4
                        </span>
                        <span className="text-slate-400">|</span>
                        <span>Próximas Elecciones: Temporada {mandate.nextElectionSeason}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Popularity & Board */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Fan Approval Card */}
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <UsersIcon className="w-5 h-5 text-sky-400" /> Aprobación de Socios
                        </h2>
                        
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="64" cy="64" r="58"
                                        stroke="currentColor" strokeWidth="8" fill="transparent"
                                        className="text-slate-800"
                                    />
                                    <circle
                                        cx="64" cy="64" r="58"
                                        stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={364.4}
                                        strokeDashoffset={364.4 - (364.4 * fanApproval.rating) / 100}
                                        className={`${fanApproval.rating >= 70 ? 'text-green-500' : fanApproval.rating >= 40 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-white">{fanApproval.rating}%</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${fanApproval.trend === 'rising' ? 'text-green-400' : fanApproval.trend === 'falling' ? 'text-red-400' : 'text-slate-400'}`}>
                                        {fanApproval.trend === 'rising' ? '▲ Alza' : fanApproval.trend === 'falling' ? '▼ Baja' : '● Estable'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Factores Clave</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { label: 'Resultados Deportivos', value: fanApproval.factors.results, icon: <TrophyIcon className="w-4 h-4" /> },
                                    { label: 'Gestión Financiera', value: fanApproval.factors.finances, icon: <div className="text-xs">💰</div> },
                                    { label: 'Política de Fichajes', value: fanApproval.factors.transfers, icon: <UsersIcon className="w-4 h-4" /> },
                                    { label: 'Promesas Electorales', value: fanApproval.factors.promises, icon: <TrendingUpIcon className="w-4 h-4" /> },
                                ].map((factor, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="text-slate-400">{factor.icon}</div>
                                            <span className="text-sm text-slate-300">{factor.label}</span>
                                        </div>
                                        <span className={`font-bold ${factor.value > 0 ? 'text-green-400' : factor.value < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                            {factor.value > 0 ? '+' : ''}{factor.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Board Confidence */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUpIcon className="w-5 h-5 text-orange-400" /> Junta Directiva
                        </h2>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm text-slate-400">Confianza</span>
                            <span className="text-2xl font-black text-white">{boardConfidence}%</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                            <div 
                                className={`h-full transition-all duration-1000 ${boardConfidence >= 70 ? 'bg-gradient-to-r from-green-600 to-emerald-500' : boardConfidence >= 40 ? 'bg-gradient-to-r from-yellow-600 to-orange-500' : 'bg-gradient-to-r from-red-600 to-red-500'}`}
                                style={{ width: `${boardConfidence}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                            {boardConfidence >= 80 ? 'La directiva está encantada con tu visión y resultados.' : 
                             boardConfidence >= 50 ? 'Tienes el respaldo de la junta, pero esperan ver progreso constante.' : 
                             'Tu posición está bajo escrutinio. Los resultados deben mejorar de inmediato.'}
                        </p>
                    </div>
                </div>

                {/* Right Column: Promises & Stadium */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Promises Card */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <div className="p-2 bg-sky-500/20 rounded-lg">
                                <TrophyIcon className="w-6 h-6 text-sky-400" />
                            </div>
                            Promesas Electorales
                        </h2>

                        {electoralPromises.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {electoralPromises.map(promise => (
                                    <div key={promise.id} className={`relative group p-5 rounded-xl border transition-all duration-300 ${promise.fulfilled ? 'bg-green-900/10 border-green-500/30' : 'bg-slate-800/40 border-slate-700 hover:border-sky-500/30'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                {getPromiseTypeIcon(promise.type)}
                                                <h3 className="font-bold text-white group-hover:text-sky-300 transition-colors">{promise.description}</h3>
                                            </div>
                                            {promise.fulfilled && (
                                                <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">CUMPLIDA</span>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-xs text-slate-400 mt-4">
                                            <span>Impacto: <span className="text-sky-400 font-bold">+{promise.impact} pts</span></span>
                                            <span className="bg-slate-900 px-2 py-1 rounded">Límite: T.{promise.deadline}</span>
                                        </div>

                                        {/* Progress Placeholder/Bar */}
                                        {!promise.fulfilled && (
                                            <div className="mt-3 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-sky-500/50 w-1/3 animate-pulse"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-2xl py-12 text-center">
                                <p className="text-slate-500 italic">No has realizado promesas en este mandato.</p>
                            </div>
                        )}
                    </div>

                    {/* Stadium Management Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-green-950/10 border border-slate-800 rounded-xl p-6 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <span className="text-xl">🏟️</span>
                                </div>
                                Gestión del Estadio
                            </h2>
                            <div className="text-right">
                                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest block">Estadio Actual</span>
                                <span className="text-lg font-black text-white">{stadium.name}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                <span className="text-xs text-slate-500 uppercase font-bold mb-1 block">Capacidad</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-white">{stadium.capacity.toLocaleString()}</span>
                                    <span className="text-xs text-slate-500">asientos</span>
                                </div>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                <span className="text-xs text-slate-500 uppercase font-bold mb-1 block">Ticket Promedio</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-green-400">{formatCurrency(stadium.ticketPrice)}</span>
                                </div>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                <span className="text-xs text-slate-500 uppercase font-bold mb-1 block">Mantenimiento</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-red-400">{formatCurrency(stadium.maintenanceCost)}</span>
                                    <span className="text-xs text-slate-500">/sem</span>
                                </div>
                            </div>
                        </div>

                        {stadium.expansionCost && (
                            <div className="bg-slate-800/30 border border-sky-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="space-y-1 text-center md:text-left">
                                    <h4 className="text-white font-bold text-lg">Proyecto de Expansión</h4>
                                    <p className="text-sm text-slate-400">Aumentar a <span className="text-sky-400 font-bold">{stadium.expansionCapacity?.toLocaleString()}</span> asientos y mejorar infraestructuras.</p>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={handleExpandStadium}
                                        disabled={finances.balance < stadium.expansionCost}
                                        className={`px-8 py-3 rounded-xl font-black transition-all duration-300 transform ${finances.balance >= stadium.expansionCost ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 hover:-translate-y-1' : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'}`}
                                    >
                                        AUTORIZAR OBRAS
                                    </button>
                                    <span className={`text-xs font-bold ${finances.balance >= stadium.expansionCost ? 'text-sky-400' : 'text-red-500'}`}>
                                        Coste: {formatCurrency(stadium.expansionCost)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
