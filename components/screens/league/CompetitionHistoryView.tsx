import React from 'react';
import { GameState } from '../../../types';
import { CompetitionItem } from './constants';
import { customPacksService } from '../../../services/customPacks/packService';
import { Trophy, History, Shield, Award, Calendar, ChevronRight, Star, Sparkles } from 'lucide-react';
import { TeamLogo, GenericTeamShield, TEAM_LOGOS } from '../../../data/teams/helpers';
import { getCompetitionHistoricalRecord } from '../../../data/historicalHonours';
import { TrophyLaurelWatermark, PodiumRankBadge } from '../../ui/GameCardDecorations';

interface CompetitionHistoryViewProps {
    competition: CompetitionItem;
    gameState: GameState;
}

export const CompetitionHistoryView: React.FC<CompetitionHistoryViewProps> = ({
    competition,
    gameState
}) => {
    const isCup = competition.type === 'CUP';
    const cupData = isCup && competition.cupKey ? (gameState.cups as any)[competition.cupKey] : null;
    const seasonHistory = gameState.seasonHistory || [];
    const logo = customPacksService.resolveCompetitionLogo(competition.id, competition.name, competition.logo);
    const historicalData = getCompetitionHistoricalRecord(competition.id);

    // Get historical cup champions from gameplay
    const cupChampions = cupData?.statistics?.championsHistory || [];

    // Filter season records that match this league or cup
    const leagueSeasonRecords = !isCup 
        ? seasonHistory.filter(r => r.leagueId === competition.id || r.leagueName.toLowerCase() === competition.name.toLowerCase())
        : [];

    const cupSeasonRecords = isCup
        ? seasonHistory.flatMap(r => 
            (r.cupWinners || [])
                .filter(cw => cw.cupName.toLowerCase().includes(competition.name.toLowerCase()) || competition.name.toLowerCase().includes(cw.cupName.toLowerCase()))
                .map(cw => ({ season: r.season, winnerName: cw.winnerName }))
        )
        : [];

    // Combine cup history from cup stats and season records without duplicates
    const combinedCupHistory = React.useMemo(() => {
        const list: { season: number | string; winnerName: string }[] = [];
        const seen = new Set<string>();

        cupChampions.forEach(c => {
            const key = `${c.season}-${c.winnerName}`;
            if (!seen.has(key)) {
                seen.add(key);
                list.push({ season: c.season, winnerName: c.winnerName });
            }
        });

        cupSeasonRecords.forEach(c => {
            const key = `${c.season}-${c.winnerName}`;
            if (!seen.has(key)) {
                seen.add(key);
                list.push({ season: c.season, winnerName: c.winnerName });
            }
        });

        return list;
    }, [cupChampions, cupSeasonRecords]);

    // Calculate title tally for this competition: seed with authentic official history, then add gameplay titles
    const titleTally = React.useMemo(() => {
        const counts: Record<string, number> = {};

        // 1. Seed from authentic historical rankings
        if (historicalData?.allTimeRanking) {
            historicalData.allTimeRanking.forEach(item => {
                counts[item.teamName] = item.titles;
            });
        }

        // 2. Add titles won during gameplay
        if (isCup) {
            combinedCupHistory.forEach(c => {
                counts[c.winnerName] = (counts[c.winnerName] || 0) + 1;
            });
        } else {
            leagueSeasonRecords.forEach(r => {
                if (r.leagueChampion) {
                    counts[r.leagueChampion] = (counts[r.leagueChampion] || 0) + 1;
                }
                // For Argentine league: Torneo Apertura and Clausura count as official league titles
                if (competition.id === 'LIGA_ARGENTINA' || competition.name.toLowerCase().includes('argentina')) {
                    r.cupWinners?.forEach(cw => {
                        const cn = cw.cupName.toLowerCase();
                        if (cn.includes('apertura') || cn.includes('clausura')) {
                            counts[cw.winnerName] = (counts[cw.winnerName] || 0) + 1;
                        }
                    });
                }
            });

            // Also tally any current season completed Apertura/Clausura
            if (competition.id === 'LIGA_ARGENTINA' || competition.name.toLowerCase().includes('argentina')) {
                const apChamp = gameState.cups.aperturaPlayoffs?.winnerId 
                    ? gameState.allTeams.find(t => t.id === gameState.cups.aperturaPlayoffs?.winnerId)?.name
                    : null;
                const clChamp = gameState.cups.clausuraPlayoffs?.winnerId 
                    ? gameState.allTeams.find(t => t.id === gameState.cups.clausuraPlayoffs?.winnerId)?.name
                    : null;
                if (apChamp) counts[apChamp] = (counts[apChamp] || 0) + 1;
                if (clChamp) counts[clChamp] = (counts[clChamp] || 0) + 1;
            }
        }

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [isCup, combinedCupHistory, leagueSeasonRecords, historicalData]);

    // Helper to render authentic club badge for any club name
    const renderClubBadge = (teamName: string, className = "w-6 h-6") => {
        if (!teamName) return <GenericTeamShield name="Club" className={className} />;

        // Normalize team name (remove curly apostrophes, diacritics variants, whitespace)
        const cleanName = teamName.replace(/[’‘`]/g, "'").trim();
        const cleanLower = cleanName.toLowerCase();

        // 1. Exact or clean match in gameState.allTeams (has full id, colors, and squad info)
        const matchedTeam = (gameState.allTeams || []).find(t => {
            const tn = (t.name || '').toLowerCase().trim();
            const sn = (t.shortName || '').toLowerCase().trim();
            if (tn === cleanLower || sn === cleanLower) return true;

            const strippedTn = tn.replace(/^(fc|ac|ca|csd|ssv|rcd|afc|cf|sc|cd|club|deportivo)\s+/i, '').replace(/\s+(fc|cf)$/i, '').trim();
            const strippedClean = cleanLower.replace(/^(fc|ac|ca|csd|ssv|rcd|afc|cf|sc|cd|club|deportivo)\s+/i, '').replace(/\s+(fc|cf)$/i, '').trim();
            if (strippedTn && strippedClean && strippedTn === strippedClean) return true;

            // Safe alias links
            if ((cleanLower === 'manchester united' || cleanLower === 'man united') && (tn === 'manchester utd' || sn === 'mun')) return true;
            if ((cleanLower === 'estudiantes lp' || cleanLower === 'estudiantes') && tn.includes('estudiantes de la plata')) return true;
            if ((cleanLower === 'gimnasia lp' || cleanLower === 'gimnasia la plata') && tn.includes('gimnasia y esgrima la plata')) return true;

            // Mexican clubs aliases
            if ((cleanLower === 'chivas' || cleanLower === 'guadalajara') && (tn.includes('guadalajara') || sn.includes('chivas'))) return true;
            if ((cleanLower === 'américa' || cleanLower === 'america') && (tn.includes('américa') || tn.includes('america'))) return true;
            if (cleanLower === 'pumas' && (tn.includes('universidad nacional') || sn.includes('pumas'))) return true;
            if (cleanLower === 'monterrey' && (tn.includes('monterrey') || sn.includes('rayados'))) return true;
            if (cleanLower === 'toluca' && tn.includes('toluca')) return true;
            if (cleanLower === 'pachuca' && tn.includes('pachuca')) return true;
            if ((cleanLower === 'león' || cleanLower === 'leon') && (tn.includes('león') || tn.includes('leon'))) return true;
            if (cleanLower === 'puebla' && tn.includes('puebla')) return true;
            if (cleanLower === 'necaxa' && tn.includes('necaxa')) return true;
            if (cleanLower === 'atlas' && tn.includes('atlas')) return true;

            return false;
        });

        if (matchedTeam) {
            return <TeamLogo team={matchedTeam} className={className} />;
        }

        // 2. Direct custom pack / built-in pack lookup
        return <TeamLogo team={{ name: cleanName }} className={className} />;
    };

    const totalEditionsCount = (historicalData?.recentEditions?.length || 0) + 
        (isCup ? combinedCupHistory.length : leagueSeasonRecords.length);

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header Banner - Compact, Broadcast Style */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#0E1524] to-slate-900 border border-white/10 p-4 sm:p-5 relative overflow-hidden shadow-2xl">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[var(--apex-gold)]/10 to-transparent pointer-events-none" />
                <TrophyLaurelWatermark opacity={0.12} accentColor="#F59E0B" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3.5 sm:gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center p-2 rounded-2xl bg-black/60 border border-white/15 shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-sm">
                            <img src={logo} alt={competition.name} className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30">
                                    {competition.country || 'Internacional'} • {isCup ? 'Copa Oficial' : 'Liga de Primera'}
                                </span>
                                <span className="text-slate-400 text-[11px] font-mono">Temporada {gameState.season}</span>
                            </div>
                            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                                Palmarés: {competition.name}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <div className="px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-center shadow-inner">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Campeones</div>
                            <div className="text-xs sm:text-sm font-black text-amber-400 font-mono">{titleTally.length} Clubes</div>
                        </div>
                        <div className="px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-center shadow-inner">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Registros</div>
                            <div className="text-xs sm:text-sm font-black text-white font-mono">{totalEditionsCount} Ediciones</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of Historical Records */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Columna Izquierda: Palmarés / Títulos por Club (5 columnas en desktop) */}
                <div className="lg:col-span-5 rounded-2xl bg-[#0B0F19] border border-white/10 p-4 shadow-xl space-y-3 flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5 relative z-10">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-[var(--apex-gold)]" />
                            <h3 className="text-xs font-black text-white uppercase tracking-wider">Títulos Registrados</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                            {titleTally.length} {titleTally.length === 1 ? 'Club' : 'Clubes'}
                        </span>
                    </div>

                    {titleTally.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 space-y-2 flex-1 flex flex-col justify-center relative z-10">
                            <Shield className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                            <p className="text-xs font-bold uppercase tracking-wider">Sin títulos archivados</p>
                            <p className="text-[11px] text-slate-500">Se registrarán al culminar la temporada en curso.</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar relative z-10">
                            {titleTally.map((t, idx) => {
                                const isUserTeam = gameState.team.name.toLowerCase() === t.name.toLowerCase() || 
                                    t.name.toLowerCase().includes(gameState.team.name.toLowerCase());

                                return (
                                    <div 
                                        key={idx}
                                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all relative overflow-hidden ${
                                            isUserTeam
                                                ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                                                : idx === 0 
                                                ? 'bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-transparent border-amber-500/30' 
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {/* Podium Rank Badge */}
                                            <PodiumRankBadge rank={idx + 1} />

                                            {/* Team Official Shield */}
                                            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                {renderClubBadge(t.name, "w-6 h-6")}
                                            </div>

                                            {/* Team Name */}
                                            <div className="flex items-center gap-1.5 truncate">
                                                <span className={`text-xs truncate ${
                                                    isUserTeam 
                                                        ? 'font-black text-amber-300' 
                                                        : idx === 0 
                                                        ? 'font-black text-white' 
                                                        : 'font-semibold text-white/90'
                                                }`}>
                                                    {t.name}
                                                </span>
                                                {isUserTeam && (
                                                    <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-400 text-slate-950 shrink-0">
                                                        TU CLUB
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Trophy Count Badge */}
                                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 font-mono bg-black/50 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0 ml-2">
                                            <Trophy className="w-3 h-3 text-amber-400" />
                                            <span>{t.count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Historial Temporada por Temporada (7 columnas en desktop) */}
                <div className="lg:col-span-7 rounded-xl bg-[#0B0F19] border border-white/10 p-4 shadow-xl space-y-3 flex flex-col">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-wider">Historial de Ediciones</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                            {isCup 
                                ? (combinedCupHistory.length + (historicalData?.recentEditions?.length || 0))
                                : (leagueSeasonRecords.length + (historicalData?.recentEditions?.length || 0))
                            } Registros
                        </span>
                    </div>

                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar flex-1">
                        {/* Partidas Jugadas en Curso (In-Game Seasons) */}
                        {isCup ? (
                            combinedCupHistory.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black uppercase text-[var(--apex-gold)] tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Ediciones en tu Partida</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {combinedCupHistory.map((c, i) => (
                                            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-amber-950/30 to-slate-900/60 border border-amber-500/30">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="px-2 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] text-[10px] font-bold font-mono shrink-0">
                                                        T{c.season}
                                                    </span>
                                                    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                                        {renderClubBadge(c.winnerName, "w-5 h-5")}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-black text-white truncate">{c.winnerName}</div>
                                                        <div className="text-[9px] text-amber-400/90 font-bold uppercase">Campeón de Copa</div>
                                                    </div>
                                                </div>
                                                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1.5" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ) : (
                            leagueSeasonRecords.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black uppercase text-[var(--apex-gold)] tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Temporadas Archivadas en tu Partida</span>
                                    </div>
                                    {leagueSeasonRecords.map((rec, idx) => (
                                        <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/30 space-y-2">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                                                <span className="text-[11px] font-black text-amber-400 uppercase font-mono">
                                                    Temporada {rec.season}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    Tu club ({rec.userTeamName}): <strong className="text-white">{rec.userPosition}º Puesto ({rec.userPoints} pts)</strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                                    {renderClubBadge(rec.leagueChampion || '', "w-5 h-5")}
                                                </div>
                                                <div className="text-xs font-black text-white">
                                                    {competition.id === 'LIGA_ARGENTINA' || competition.name.toLowerCase().includes('argentina') ? 'Tabla Anual: ' : 'Campeón: '}
                                                    <span className="text-amber-300">{rec.leagueChampion || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {/* Sub-torneos argentinos (Apertura / Clausura) si existen en la temporada */}
                                            {rec.cupWinners && rec.cupWinners.some(cw => cw.cupName.toLowerCase().includes('apertura') || cw.cupName.toLowerCase().includes('clausura')) && (
                                                <div className="pt-1.5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                    {rec.cupWinners
                                                        .filter(cw => cw.cupName.toLowerCase().includes('apertura') || cw.cupName.toLowerCase().includes('clausura'))
                                                        .map((cw, ci) => (
                                                            <div key={ci} className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded">
                                                                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                                                    {renderClubBadge(cw.winnerName, "w-4 h-4")}
                                                                </div>
                                                                <div className="text-[10px] text-white truncate">
                                                                    <span className="text-slate-400 font-bold">{cw.cupName}: </span>
                                                                    <span className="text-amber-300 font-black">{cw.winnerName}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Historial Oficial Reciente con Logos Reales */}
                        {historicalData?.recentEditions && historicalData.recentEditions.length > 0 ? (
                            <div className="space-y-2">
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                    Ediciones Oficiales Recientes
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {historicalData.recentEditions.map((ed, idx) => (
                                        <div 
                                            key={idx}
                                            className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="px-1.5 py-0.5 rounded bg-black/60 text-slate-300 font-mono text-[10px] font-bold border border-white/10 shrink-0">
                                                    {ed.season}
                                                </span>
                                                <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                                    <Trophy className="w-3 h-3 text-amber-400" />
                                                </div>
                                            </div>

                                            {/* Campeón con Escudo */}
                                            <div className="flex items-center gap-2 mt-1.5 min-w-0">
                                                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                                    {renderClubBadge(ed.winnerName, "w-5 h-5")}
                                                </div>
                                                <span className="text-xs font-black text-white truncate">
                                                    {ed.winnerName}
                                                </span>
                                            </div>

                                            {/* Subcampeón si existe con Escudo */}
                                            {ed.runnerUp && (
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 pl-0.5 min-w-0">
                                                    <span className="text-slate-500 text-[9px] uppercase font-bold shrink-0">Sub:</span>
                                                    <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                                                        {renderClubBadge(ed.runnerUp, "w-3.5 h-3.5")}
                                                    </div>
                                                    <span className="truncate">{ed.runnerUp}</span>
                                                    {ed.score && (
                                                        <span className="font-mono text-slate-400 shrink-0 font-bold">
                                                            {ed.score}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            combinedCupHistory.length === 0 && leagueSeasonRecords.length === 0 && (
                                <div className="text-center py-12 text-slate-500 space-y-2">
                                    <Trophy className="w-10 h-10 mx-auto opacity-20 text-slate-400" />
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Edición en Disputa</p>
                                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                                        Al consagrarse el nuevo campeón, los registros se archivarán automáticamente.
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
