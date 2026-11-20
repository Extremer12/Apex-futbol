import React from 'react';
import { Team } from '../../../types';
import { Trophy } from 'lucide-react';

interface PalmaresTabProps {
    team: Team;
}

export const PalmaresTab: React.FC<PalmaresTabProps> = React.memo(({ team }) => {
    return (
        <div className="space-y-4">
            <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Vitrina de Títulos Presidenciales</h3>
                </div>

                {team.trophyCabinet && team.trophyCabinet.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {team.trophyCabinet.map((trophy, idx) => (
                            <div
                                key={idx}
                                className="p-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-black flex items-center gap-3.5 shadow-md"
                            >
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                                    <Trophy className="w-6 h-6 text-amber-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                                        Temporada {trophy.season}
                                    </span>
                                    <h4 className="text-sm font-black text-white uppercase truncate">
                                        {trophy.name}
                                    </h4>
                                    <span className="text-[10px] text-slate-400">
                                        Bajo la presidencia en {team.name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 space-y-2">
                        <Trophy className="w-12 h-12 mx-auto text-slate-600 opacity-40" />
                        <h4 className="text-sm font-bold text-slate-300">Vitrina aún sin trofeos</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Conquista campeonatos de liga o copas nacionales para inmortalizar tu presidencia.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});
