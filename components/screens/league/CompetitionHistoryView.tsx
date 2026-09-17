import React from 'react';
import { GameState } from '../../../types';
import { CompetitionItem } from './constants';
import { customPacksService } from '../../../services/customPacks/packService';
import { Trophy, History, Shield, Award, Calendar, ChevronRight, Star, Sparkles } from 'lucide-react';
import { TeamLogo, GenericTeamShield, TEAM_LOGOS } from '../../../data/teams/helpers';
import { getCompetitionHistoricalRecord } from '../../../data/historicalHonours';

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
            });
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

        // 1. Direct custom packs lookup (handles built-in SVGs, aliases, community packs)
        const packLogo = customPacksService.resolveTeamLogo({ name: cleanName }) ||
            customPacksService.resolveTeamLogo({ name: cleanLower });

        if (packLogo) {
            return (
                <div className={`${className} relative flex items-center justify-center shrink-0`}>
                    <img src={packLogo} alt={teamName} className="w-full h-full object-contain drop-shadow-sm" />
                </div>
            );
        }

        // 2. Exact or clean match in gameState.allTeams (prevent false positives like Arsenal vs Arsenal de Sarandí)
        const matchedTeam = (gameState.allTeams || []).find(t => {
            const tn = (t.name || '').toLowerCase().trim();
            const sn = (t.shortName || '').toLowerCase().trim();
            if (tn === cleanLower || sn === cleanLower) return true;

            const strippedTn = tn.replace(/^(fc|ac|ca|csd|ssv|rcd|afc|cf|sc)\s+/i, '').trim();
            const strippedClean = cleanLower.replace(/^(fc|ac|ca|csd|ssv|rcd|afc|cf|sc)\s+/i, '').trim();
            if (strippedTn && strippedTn === strippedClean) return true;

            // Safe alias links
            if ((cleanLower === 'manchester united' || cleanLower === 'man united') && (tn === 'manchester utd' || sn === 'mun')) return true;
            if ((cleanLower === 'estudiantes lp' || cleanLower === 'estudiantes') && tn.includes('estudiantes de la plata')) return true;
            if ((cleanLower === 'gimnasia lp' || cleanLower === 'gimnasia la plata') && tn.includes('gimnasia y esgrima la plata')) return true;

            return false;
        });

        if (matchedTeam) {
            return <TeamLogo team={matchedTeam} className={className} />;
        }

        // 3. Check static logos dictionary
        const staticLogo = (TEAM_LOGOS as Record<string, string>)[teamName] ||
            Object.entries(TEAM_LOGOS).find(([k]) => k.toLowerCase() === cleanLower)?.[1];

        if (staticLogo) {
            return (
                <div className={`${className} relative flex items-center justify-center shrink-0`}>
                    <img src={staticLogo} alt={teamName} className="w-full h-full object-contain drop-shadow-sm" />
                </div>
            );
        }

        // 4. Fallback to aesthetic vector shield
        return <GenericTeamShield name={teamName} className={className} />;
    };

    const totalEditionsCount = (historicalData?.recentEditions?.length || 0) + 
        (isCup ? combinedCupHistory.length : leagueSeasonRecords.length);

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header Banner - Compact, Broadcast Style */}
            <div className="rounded-xl bg-gradient-to-r from-slate-900 via-[#0E1524] to-slate-900 border border-white/10 p-4 relative overflow-hidden shadow-lg">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[var(--apex-gold)]/10 to-transparent pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center p-2 rounded-xl bg-black/50 border border-white/10 shrink-0 shadow-inner">
                            <img src={logo} alt={competition.name} className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30">
                                    {competition.country || 'Internacional'} • {isCup ? 'Copa Oficial' : 'Liga de Primera'}
                                </span>
                                <span className="text-slate-400 text-[11px] font-mono">Temporada {gameState.season}</span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-0.5">
                                Palmarés: {competition.name}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-center">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Campeones</div>
                            <div className="text-xs sm:text-sm font-black text-amber-400 font-mono">{titleTally.length} Clubes</div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-center">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Registros</div>
                            <div className="text-xs sm:text-sm font-black text-white font-mono">{totalEditionsCount} Ediciones</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of Historical Records */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Columna Izquierda: Palmarés / Títulos por Club (5 columnas en desktop) */}
                <div className="lg:col-span-5 rounded-xl bg-[#0B0F19] border border-white/10 p-4 shadow-xl space-y-3 flex flex-col">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-[var(--apex-gold)]" />
                            <h3 className="text-xs font-black text-white uppercase tracking-wider">Títulos Registrados</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                            {titleTally.length} {titleTally.length === 1 ? 'Club' : 'Clubes'}
                        </span>
                    </div>

                    {titleTally.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 space-y-2 flex-1 flex flex-col justify-center">
                            <Shield className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                            <p className="text-xs font-bold uppercase tracking-wider">Sin títulos archivados</p>
                            <p className="text-[11px] text-slate-500">Se registrarán al culminar la temporada en curso.</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                            {titleTally.map((t, idx) => {
                                const isUserTeam = gameState.team.name.toLowerCase() === t.name.toLowerCase() || 
                                    t.name.toLowerCase().includes(gameState.team.name.toLowerCase());

                                return (
                                    <div 
                                        key={idx}
                                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                                            isUserTeam
                                                ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {/* Rank Badge */}
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] shrink-0 ${
                                                idx === 0 
                                                    ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-sm' 
                                                    : idx === 1 
                                                    ? 'bg-slate-300 text-slate-900 font-bold' 
                                                    : idx === 2 
                                                    ? 'bg-amber-700 text-amber-100 font-bold' 
                                                    : 'bg-slate-800 text-slate-400'
                                            }`}>
                                                {idx + 1}
                                            </div>

                                            {/* Team Official Shield */}
                                            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                                {renderClubBadge(t.name, "w-6 h-6")}
                                            </div>

                                            {/* Team Name */}
                                            <span className={`text-xs truncate ${
                                                isUserTeam 
                                                    ? 'font-black text-amber-300' 
                                                    : 'font-semibold text-white'
                                            }`}>
                                                {t.name}
                                            </span>
                                        </div>

                                        {/* Trophy Count Badge */}
                                        <div className="flex items-center gap-1 text-xs font-black text-amber-400 font-mono bg-black/40 px-2 py-0.5 rounded border border-amber-500/20 shrink-0 ml-2">
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
                                                    Campeón: <span className="text-amber-300">{rec.leagueChampion || 'N/A'}</span>
                                                </div>
                                            </div>
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
