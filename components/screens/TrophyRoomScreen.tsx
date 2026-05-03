import React from 'react';
import { GameState, Trophy } from '../../types';
import { TrophyIcon } from '../icons';

interface TrophyRoomScreenProps {
    gameState: GameState;
}

export const TrophyRoomScreen: React.FC<TrophyRoomScreenProps> = ({ gameState }) => {
    const { team } = gameState;
    const trophies = team.trophyCabinet || [];

    const leagueTrophies = trophies.filter(t => t.type === 'league');
    const cupTrophies = trophies.filter(t => t.type === 'cup');

    return (
        <div className="p-4 md:p-6 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-yellow-900/40 via-amber-900/20 to-slate-900 rounded-2xl border border-yellow-500/30 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrophyIcon className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex items-center gap-6">
                    {team.logo && (
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl p-2 shadow-xl border-2 border-yellow-500/50 flex items-center justify-center">
                            <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Vitrina de Trofeos</h1>
                        <p className="text-yellow-200/80 font-medium">Palmarés oficial del {team.name}</p>
                    </div>
                </div>
            </div>

            {trophies.length === 0 ? (
                <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl py-20 flex flex-col items-center justify-center text-center">
                    <TrophyIcon className="w-16 h-16 text-slate-700 mb-4" />
                    <h2 className="text-xl font-bold text-slate-400 mb-2">Vitrina Vacía</h2>
                    <p className="text-slate-500 max-w-md">
                        El club aún no ha conseguido ningún título bajo tu mandato. ¡Trabaja duro para llenar esta sala de gloria!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* League Trophies */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                            <span className="text-yellow-500">🏆</span> Ligas Nacionales ({leagueTrophies.length})
                        </h2>
                        {leagueTrophies.length === 0 ? (
                            <p className="text-slate-500 italic py-4">No hay títulos de liga todavía.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {leagueTrophies.map(trophy => (
                                    <div key={trophy.id} className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-yellow-500/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(234,179,8,0.3)]">
                                        <TrophyIcon className="w-12 h-12 text-yellow-400 mb-3 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
                                        <span className="text-xs font-bold text-white uppercase mb-1">{trophy.name}</span>
                                        <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">
                                            Temp. {trophy.season}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cup Trophies */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                            <span className="text-slate-300">🥈</span> Copas ({cupTrophies.length})
                        </h2>
                        {cupTrophies.length === 0 ? (
                            <p className="text-slate-500 italic py-4">No hay títulos de copa todavía.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {cupTrophies.map(trophy => (
                                    <div key={trophy.id} className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-slate-400/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(148,163,184,0.3)]">
                                        <TrophyIcon className="w-12 h-12 text-slate-300 mb-3 drop-shadow-[0_0_10px_rgba(203,213,225,0.3)]" />
                                        <span className="text-xs font-bold text-white uppercase mb-1">{trophy.name}</span>
                                        <span className="text-[10px] font-black text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded">
                                            Temp. {trophy.season}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
