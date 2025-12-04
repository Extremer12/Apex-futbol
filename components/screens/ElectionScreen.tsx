import React, { useState } from 'react';
import { GameState, ElectoralPromise } from '../../types';
import { GameAction } from '../../state/reducer';

interface ElectionScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    onElectionComplete: () => void;
}

export const ElectionScreen: React.FC<ElectionScreenProps> = ({ gameState, dispatch, onElectionComplete }) => {
    const [showResults, setShowResults] = useState(false);
    const [electionWon, setElectionWon] = useState(false);

    // Calculate win probability based on fan approval
    const calculateWinProbability = (): number => {
        const fanRating = gameState.fanApproval.rating;

        // Base probability from fan approval
        let probability = fanRating;

        // Bonus for being in top positions
        const playerPosition = gameState.leagueTable.find(row => row.teamId === gameState.team.id)?.position || 10;
        if (playerPosition <= 4) probability += 15;
        else if (playerPosition <= 6) probability += 10;
        else if (playerPosition >= 18) probability -= 15;

        // Bonus for good finances
        if ((gameState.finances?.balance || 0) > 0) probability += 5;
        else probability -= 10;

        return Math.max(10, Math.min(95, probability));
    };

    const winProbability = calculateWinProbability();

    const runElection = () => {
        const won = Math.random() * 100 < winProbability;
        setElectionWon(won);
        setShowResults(true);

        // Dispatch election result
        dispatch({
            type: 'ELECTION_RESULT',
            payload: {
                won,
                newApproval: won ? Math.min(100, gameState.fanApproval.rating + 10) : gameState.fanApproval.rating
            }
        });
    };

    const handleContinue = () => {
        if (electionWon) {
            onElectionComplete();
        }
        // If lost, the game over screen will be shown by App.tsx
    };

    if (showResults) {
        if (electionWon) {
            return (
                <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-4">
                    <div className="max-w-2xl w-full bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-2xl p-8 shadow-2xl">
                        <div className="text-center">
                            {/* Victory Icon */}
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h1 className="text-5xl font-extrabold text-white mb-4">
                                🎉 ¡Reelección Exitosa!
                            </h1>

                            <p className="text-2xl text-green-300 mb-6">
                                Los socios han hablado: Confían en tu gestión
                            </p>

                            <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
                                <div className="grid grid-cols-2 gap-4 text-left">
                                    <div>
                                        <div className="text-slate-400 text-sm">Votos Obtenidos</div>
                                        <div className="text-3xl font-bold text-green-400">{Math.round(winProbability)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-sm">Nuevo Mandato</div>
                                        <div className="text-3xl font-bold text-white">#{gameState.mandate.totalMandates + 1}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-sm">Duración</div>
                                        <div className="text-2xl font-bold text-white">4 Años</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-sm">Próximas Elecciones</div>
                                        <div className="text-2xl font-bold text-white">{gameState.season + 4}</div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-300 mb-8">
                                Comenzarás tu mandato número <span className="font-bold text-green-400">{gameState.mandate.totalMandates + 1}</span> con renovadas energías.
                                Los socios esperan grandes cosas de ti en los próximos 4 años.
                            </p>

                            <button
                                onClick={handleContinue}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-12 rounded-xl shadow-xl shadow-green-600/30 transform hover:scale-105 transition-all duration-200 text-lg"
                            >
                                Continuar como Presidente
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else {
            // Election Lost - Game Over
            return (
                <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-4">
                    <div className="max-w-2xl w-full bg-gradient-to-br from-red-900/40 to-orange-900/40 border-2 border-red-500/50 rounded-2xl p-8 shadow-2xl">
                        <div className="text-center">
                            {/* Defeat Icon */}
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>

                            <h1 className="text-5xl font-extrabold text-white mb-4">
                                Derrota Electoral
                            </h1>

                            <p className="text-2xl text-red-300 mb-6">
                                Los socios han decidido un cambio de dirección
                            </p>

                            <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
                                <div className="text-left space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Votos Obtenidos</span>
                                        <span className="text-2xl font-bold text-red-400">{Math.round(winProbability)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Votos Necesarios</span>
                                        <span className="text-2xl font-bold text-white">50%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Mandatos Completados</span>
                                        <span className="text-2xl font-bold text-white">{gameState.mandate.totalMandates}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-300 mb-8">
                                Tu gestión al frente de <span className="font-bold text-white">{gameState.team.name}</span> ha llegado a su fin.
                                Los socios han optado por un nuevo liderazgo. Es momento de buscar nuevos desafíos.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold py-4 px-12 rounded-xl shadow-xl shadow-sky-600/30 transform hover:scale-105 transition-all duration-200 text-lg"
                                >
                                    Buscar Nuevo Club
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-12 rounded-xl transition-all duration-200"
                                >
                                    Volver al Menú Principal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // Pre-election screen
    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="max-w-3xl w-full bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950/30 border-2 border-purple-500/30 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-2">
                        Elecciones Presidenciales
                    </h1>
                    <p className="text-xl text-purple-300">
                        Temporada {gameState.season} - {gameState.team.name}
                    </p>
                </div>

                {/* Mandate Summary */}
                <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Resumen del Mandato</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-slate-400 text-sm">Años en el Cargo</div>
                            <div className="text-2xl font-bold text-white">4 Años</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm">Mandato Actual</div>
                            <div className="text-2xl font-bold text-white">#{gameState.mandate.totalMandates}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm">Posición Final</div>
                            <div className="text-2xl font-bold text-white">
                                {gameState.leagueTable.find(row => row.teamId === gameState.team.id)?.position || '-'}º
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm">Balance Financiero</div>
                            <div className={`text-2xl font-bold ${(gameState.finances?.balance || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {(gameState.finances?.balance || 0) > 0 ? '+' : ''}{(gameState.finances?.balance || 0).toFixed(1)}M
                            </div>
                        </div>
                    </div>
                </div>

                {/* Approval Rating */}
                <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Aprobación de los Socios</h2>
                    <div className="mb-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-300">Índice de Aprobación</span>
                            <span className="text-3xl font-bold text-white">{gameState.fanApproval.rating}%</span>
                        </div>
                        <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${gameState.fanApproval.rating >= 60 ? 'from-green-500 to-emerald-500' : gameState.fanApproval.rating >= 40 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-red-600'}`}
                                style={{ width: `${gameState.fanApproval.rating}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Resultados Deportivos</span>
                            <span className={`font-bold ${gameState.fanApproval.factors.results > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {gameState.fanApproval.factors.results > 0 ? '+' : ''}{gameState.fanApproval.factors.results}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Gestión Financiera</span>
                            <span className={`font-bold ${gameState.fanApproval.factors.finances > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {gameState.fanApproval.factors.finances > 0 ? '+' : ''}{gameState.fanApproval.factors.finances}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Win Probability */}
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-3">Probabilidad de Victoria</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="h-6 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                                    style={{ width: `${winProbability}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-white">
                            {Math.round(winProbability)}%
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm mt-3">
                        {winProbability >= 70 ? '✓ Victoria muy probable' : winProbability >= 50 ? '⚠ Elecciones reñidas' : '⚠ Derrota probable'}
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={runElection}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-12 rounded-xl shadow-xl shadow-purple-600/30 transform hover:scale-105 transition-all duration-200 text-xl"
                >
                    🗳️ Ir a Elecciones
                </button>

                <p className="text-center text-slate-400 text-sm mt-4">
                    Los socios decidirán si mereces continuar al frente del club
                </p>
            </div>
        </div>
    );
};
