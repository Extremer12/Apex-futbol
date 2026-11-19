import React from 'react';
import { GameState, Trophy as TrophyType } from '../../../types';
import { TrophyIcon, SparklesIcon } from '../../icons';
import { Trophy, Star, Crown, Shield, Globe, Award, Sparkles } from 'lucide-react';
import { getClubHistoricalHonours, ClubHonours } from '../../../data/historicalHonours';
import { TrophyImage } from './TrophyImage';

interface TrophyCabinetTabProps {
    gameState: GameState;
}

export const TrophyCabinetTab: React.FC<TrophyCabinetTabProps> = ({ gameState }) => {
    const { team } = gameState;
    const trophies: TrophyType[] = team.trophyCabinet || [];
    const clubHonours: ClubHonours | null = React.useMemo(() => getClubHistoricalHonours(team.name), [team.name]);

    const leagueTrophies = React.useMemo(() => trophies.filter(t => t.type === 'league'), [trophies]);
    const cupTrophies = React.useMemo(() => trophies.filter(t => t.type === 'cup'), [trophies]);

    const totalTitles = (clubHonours ? clubHonours.totalOfficialTitles : 0) + trophies.length;

    return (
        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1 animate-fade-in">
            {/* Top Showcase Banner: Institutional History */}
            {clubHonours && (
                <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
                    {/* Background Ambient Glow */}
                    <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-amber-500/10 via-amber-400/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                                    Palmarés Histórico Oficial
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                                Museo & Vitrinas de {clubHonours.clubName}
                            </h2>
                            <p className="text-xs text-slate-400 mt-1 max-w-xl">
                                Registro histórico acumulado por la institución a lo largo de todas las competiciones oficiales reconocidas.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-auto bg-black/60 px-4 py-2 rounded-xl border border-amber-500/30 shadow-lg">
                            <TrophyIcon className="w-6 h-6 text-[var(--apex-gold)]" />
                            <div>
                                <span className="text-2xl font-black text-white leading-none block font-mono">
                                    {totalTitles}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                                    Títulos Oficiales
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Trophy Breakdown Stats: Symmetrical 4 Columns */}
                    <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                <Trophy className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Ligas Nacionales</span>
                                <span className="text-lg font-black text-white font-mono">{clubHonours.leagueTitles}</span>
                            </div>
                        </div>

                        <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <Crown className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Copas Nacionales</span>
                                <span className="text-lg font-black text-white font-mono">{clubHonours.domesticCups}</span>
                            </div>
                        </div>

                        <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                                <Globe className="w-4 h-4 text-sky-400" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Continentales</span>
                                <span className="text-lg font-black text-sky-300 font-mono">{clubHonours.continentalCups}</span>
                            </div>
                        </div>

                        <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Mundiales</span>
                                <span className="text-lg font-black text-purple-300 font-mono">{clubHonours.intercontinental}</span>
                            </div>
                        </div>
                    </div>

                    {/* Historical Highlights */}
                    {clubHonours.highlights && clubHonours.highlights.length > 0 && (
                        <div className="relative z-10 flex flex-wrap gap-1.5 pt-1">
                            {clubHonours.highlights.map((h, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5"
                                >
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span>{h}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Presidential Mandate Section Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[var(--apex-gold)]/10 rounded-xl border border-[var(--apex-gold)]/30 text-[var(--apex-gold)]">
                        <TrophyIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            Títulos Conquistados en tu Mandato
                        </h3>
                        <p className="text-xs text-slate-400">
                            Copas alzadas por el club bajo tu gestión presidencial activa.
                        </p>
                    </div>
                </div>
                <span className="text-xs font-black text-[var(--apex-gold)] uppercase bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 px-3 py-1 rounded-xl font-mono">
                    {trophies.length} {trophies.length === 1 ? 'Título' : 'Títulos'}
                </span>
            </div>

            {/* Mandate Trophies Showcase */}
            {trophies.length === 0 ? (
                <div className="apex-card p-10 flex flex-col items-center justify-center text-center text-white/40 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Trophy className="w-8 h-8 opacity-40" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">
                            Vitrina Presidencial en Blanco
                        </h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Aún no has conquistado campeonatos oficiales en esta partida. Compite en liga, copas nacionales y torneos internacionales para añadir tus propios trofeos al museo del club.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* League Trophies Column */}
                    <div className="apex-card flex flex-col overflow-hidden rounded-2xl border border-white/10">
                        <div className="bg-slate-900/90 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-3 bg-[var(--apex-gold)] rounded-sm" />
                                Ligas Nacionales
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono font-bold bg-white/5 px-2 py-0.5 rounded">
                                {leagueTrophies.length}
                            </span>
                        </div>

                        <div className="p-4 flex-1">
                            {leagueTrophies.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-xs">
                                    Sin títulos de liga en tu mandato aún
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {leagueTrophies.map(trophy => (
                                        <div
                                            key={trophy.id}
                                            className="p-3.5 rounded-xl bg-gradient-to-b from-slate-900/80 to-[#0B0F19] border border-amber-500/20 hover:border-amber-400/50 transition-all flex items-center gap-3.5 group shadow-md"
                                        >
                                            <TrophyImage
                                                competitionId={trophy.name}
                                                name={trophy.name}
                                                size="sm"
                                                showPedestal={true}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <span className="text-xs font-black text-white truncate block group-hover:text-amber-300 transition-colors">
                                                    {trophy.name}
                                                </span>
                                                <span className="text-[10px] font-mono font-bold text-[var(--apex-gold)] uppercase tracking-wider block mt-0.5">
                                                    Temporada {trophy.season}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cup & International Trophies Column */}
                    <div className="apex-card flex flex-col overflow-hidden rounded-2xl border border-white/10">
                        <div className="bg-slate-900/90 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-3 bg-amber-400 rounded-sm" />
                                Copas y Torneos
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono font-bold bg-white/5 px-2 py-0.5 rounded">
                                {cupTrophies.length}
                            </span>
                        </div>

                        <div className="p-4 flex-1">
                            {cupTrophies.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-xs">
                                    Sin títulos de copa en tu mandato aún
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {cupTrophies.map(trophy => (
                                        <div
                                            key={trophy.id}
                                            className="p-3.5 rounded-xl bg-gradient-to-b from-slate-900/80 to-[#0B0F19] border border-amber-500/20 hover:border-amber-400/50 transition-all flex items-center gap-3.5 group shadow-md"
                                        >
                                            <TrophyImage
                                                competitionId={trophy.name}
                                                name={trophy.name}
                                                size="sm"
                                                showPedestal={true}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <span className="text-xs font-black text-white truncate block group-hover:text-amber-300 transition-colors">
                                                    {trophy.name}
                                                </span>
                                                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block mt-0.5">
                                                    Temporada {trophy.season}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
