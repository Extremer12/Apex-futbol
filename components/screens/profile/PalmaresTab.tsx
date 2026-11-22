import React, { useMemo } from 'react';
import { Team } from '../../../types';
import { usePacksVersion } from '../../../data/teams/helpers';
import { Trophy } from 'lucide-react';
import { TrophyImage } from '../trophies/TrophyImage';
import { StatCell, EmptyState } from '../transfers/TransferUI';

interface PalmaresTabProps {
    team: Team;
}

export const PalmaresTab: React.FC<PalmaresTabProps> = React.memo(({ team }) => {
    usePacksVersion();
    const trophies = team.trophyCabinet || [];
    const leagueCount = useMemo(() => trophies.filter(t => t.type === 'league').length, [trophies]);
    const cupCount = useMemo(() => trophies.filter(t => t.type === 'cup').length, [trophies]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2.5">
                <StatCell label="Totales" value={trophies.length} accent="text-[var(--apex-gold)]" />
                <StatCell label="Ligas" value={leagueCount} accent="text-amber-400" />
                <StatCell label="Copas" value={cupCount} accent="text-emerald-400" />
            </div>

            <div className="apex-card p-4 sm:p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-white/10">
                    <Trophy className="w-4 h-4 text-[var(--apex-gold)]" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Vitrina Presidencial</h3>
                </div>

                {trophies.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {trophies.map((trophy, idx) => (
                            <div
                                key={trophy.id || idx}
                                className="p-3.5 rounded-2xl border border-[var(--apex-gold)]/25 bg-[var(--apex-gold)]/5 flex items-center gap-3.5"
                            >
                                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 p-1.5 flex items-center justify-center shrink-0">
                                    <TrophyImage
                                        trophyId={trophy.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}
                                        trophyName={trophy.name}
                                        type={trophy.type}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-black text-[var(--apex-gold)] uppercase tracking-wider block">
                                        Temporada {trophy.season}
                                    </span>
                                    <h4 className="text-sm font-black text-white truncate">
                                        {trophy.name}
                                    </h4>
                                    <span className="text-[11px] text-slate-400 truncate block">
                                        {team.name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<Trophy className="w-6 h-6 text-[var(--apex-gold)]" />}
                        title="Vitrina sin trofeos"
                        text="Conquista títulos de liga o copas bajo tu presidencia para exhibirlos aquí."
                    />
                )}
            </div>
        </div>
    );
});
