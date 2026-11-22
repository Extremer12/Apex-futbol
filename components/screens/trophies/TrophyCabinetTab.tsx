import React, { useMemo } from 'react';
import { GameState, Trophy as TrophyType } from '../../../types';
import { Trophy, Star } from 'lucide-react';
import { getClubHistoricalHonours, ClubHonours } from '../../../data/historicalHonours';
import { TrophyImage } from './TrophyImage';
import { StatCell, EmptyState } from '../transfers/TransferUI';

interface TrophyCabinetTabProps {
    gameState: GameState;
}

export const TrophyCabinetTab: React.FC<TrophyCabinetTabProps> = ({ gameState }) => {
    const { team } = gameState;
    const trophies: TrophyType[] = team.trophyCabinet || [];
    const clubHonours: ClubHonours | null = useMemo(() => getClubHistoricalHonours(team.name), [team.name]);

    const leagueTrophies = useMemo(() => trophies.filter(t => t.type === 'league'), [trophies]);
    const cupTrophies = useMemo(() => trophies.filter(t => t.type === 'cup'), [trophies]);
    const totalTitles = (clubHonours ? clubHonours.totalOfficialTitles : 0) + trophies.length;

    return (
        <div className="space-y-4">
            {/* Institutional Historical Honours */}
            {clubHonours && (
                <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-4 border-amber-500/20">
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)] block">
                                Palmarés Histórico Oficial
                            </span>
                            <h2 className="text-base sm:text-lg font-black text-white truncate">
                                {clubHonours.clubName}
                            </h2>
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-right shrink-0">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">Totales</span>
                            <span className="text-base font-black text-[var(--apex-gold)] leading-none tabular-nums">{totalTitles}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <StatCell label="Ligas" value={clubHonours.leagueTitles} accent="text-amber-400" />
                        <StatCell label="Copas nac." value={clubHonours.domesticCups} accent="text-emerald-400" />
                        <StatCell label="Continentales" value={clubHonours.continentalCups} accent="text-sky-400" />
                        <StatCell label="Mundiales" value={clubHonours.intercontinental} accent="text-purple-400" />
                    </div>

                    {clubHonours.highlights && clubHonours.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {clubHonours.highlights.map((h, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold inline-flex items-center gap-1"
                                >
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span>{h}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Mandate Trophies */}
            <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Títulos de tu Mandato ({trophies.length})
                    </h3>
                </div>

                {trophies.length === 0 ? (
                    <div className="apex-card rounded-2xl">
                        <EmptyState
                            icon={<Trophy className="w-6 h-6 text-[var(--apex-gold)]" />}
                            title="Vitrina presidencial en blanco"
                            text="Conquista ligas, copas nacionales o torneos internacionales para sumar trofeos bajo tu gestión."
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* League Trophies */}
                        <div className="apex-card p-4 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <h4 className="text-xs font-black uppercase tracking-wider text-white">Ligas Nacionales</h4>
                                <span className="text-[11px] font-bold text-[var(--apex-gold)] tabular-nums">{leagueTrophies.length}</span>
                            </div>
                            {leagueTrophies.length === 0 ? (
                                <p className="text-xs text-slate-500 py-4 text-center">Sin títulos de liga aún</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {leagueTrophies.map(trophy => (
                                        <div
                                            key={trophy.id}
                                            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3"
                                        >
                                            <TrophyImage competitionId={trophy.name} name={trophy.name} size="sm" showPedestal={true} />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs font-black text-white truncate">{trophy.name}</div>
                                                <div className="text-[10px] font-bold text-[var(--apex-gold)]">Temp. {trophy.season}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cup Trophies */}
                        <div className="apex-card p-4 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <h4 className="text-xs font-black uppercase tracking-wider text-white">Copas y Torneos</h4>
                                <span className="text-[11px] font-bold text-amber-400 tabular-nums">{cupTrophies.length}</span>
                            </div>
                            {cupTrophies.length === 0 ? (
                                <p className="text-xs text-slate-500 py-4 text-center">Sin títulos de copa aún</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {cupTrophies.map(trophy => (
                                        <div
                                            key={trophy.id}
                                            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3"
                                        >
                                            <TrophyImage competitionId={trophy.name} name={trophy.name} size="sm" showPedestal={true} />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs font-black text-white truncate">{trophy.name}</div>
                                                <div className="text-[10px] font-bold text-amber-400">Temp. {trophy.season}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};
