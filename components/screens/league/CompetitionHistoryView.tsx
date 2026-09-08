import React from 'react';
import { GameState } from '../../../types';
import { CompetitionItem } from './constants';
import { customPacksService } from '../../../services/customPacks/packService';
import { Trophy, History, Shield, Award, Calendar, ChevronRight, Star } from 'lucide-react';
import { TeamLogo } from '../../../data/teams/helpers';

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

    // Get historical cup champions
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

    // Calculate title tally for this competition
    const titleTally = React.useMemo(() => {
        const counts: Record<string, number> = {};
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
    }, [isCup, combinedCupHistory, leagueSeasonRecords]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-white/10 p-5 sm:p-7 relative overflow-hidden shadow-2xl">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[var(--apex-gold)]/10 to-transparent pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-2 rounded-2xl bg-black/40 border border-white/10 shrink-0">
                            <img src={logo} alt={competition.name} className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30">
                                    Archivo Histórico
                                </span>
                                <span className="text-slate-400 text-xs font-semibold">Temporada Actual: {gameState.season}</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                                Palmarés: {competition.name}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Registro histórico independiente de ediciones finalizadas, campeones y estadísticas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of Historical Records */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Palmarés / Títulos por Club */}
                <div className="lg:col-span-1 rounded-2xl bg-[#0E131F] border border-white/10 p-4 sm:p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-[var(--apex-gold)]" />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Títulos Registrados</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded">
                            {titleTally.length} {titleTally.length === 1 ? 'Club' : 'Clubes'}
                        </span>
                    </div>

                    {titleTally.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 space-y-2">
                            <Shield className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                            <p className="text-xs font-bold uppercase tracking-wider">Sin títulos archivados todavía</p>
                            <p className="text-[11px] text-slate-500">Los trofeos se registrarán al completar la primera temporada.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {titleTally.map((t, idx) => (
                                <div 
                                    key={idx}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                                            idx === 0 ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        <span className="text-xs font-bold text-white truncate">{t.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-black text-xs text-[var(--apex-gold)]">
                                        <Trophy className="w-3.5 h-3.5" />
                                        <span>{t.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Historial Temporada por Temporada */}
                <div className="lg:col-span-2 rounded-2xl bg-[#0E131F] border border-white/10 p-4 sm:p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Historial de Ediciones</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded">
                            {isCup ? combinedCupHistory.length : leagueSeasonRecords.length} Temporadas
                        </span>
                    </div>

                    {isCup ? (
                        combinedCupHistory.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 space-y-2">
                                <Trophy className="w-12 h-12 mx-auto opacity-25 text-slate-400" />
                                <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">Primera Temporada en Curso</p>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Al consagrarse el campeón de esta edición, el registro histórico se archivará automáticamente aquí.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {combinedCupHistory.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="px-2.5 py-1 rounded-md bg-white/5 text-slate-400 text-xs font-bold border border-white/5">
                                                T{c.season}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-white">{c.winnerName}</div>
                                                <div className="text-[10px] text-amber-400 font-bold uppercase">Campeón</div>
                                            </div>
                                        </div>
                                        <Trophy className="w-4 h-4 text-amber-400" />
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        leagueSeasonRecords.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 space-y-2">
                                <Trophy className="w-12 h-12 mx-auto opacity-25 text-slate-400" />
                                <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">Primera Temporada en Curso</p>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Las posiciones finales, ascensos, descensos y campeones de liga se archivarán aquí al concluir cada año.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {leagueSeasonRecords.map((rec, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                                                Temporada {rec.season}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                Tu equipo ({rec.userTeamName}): <strong className="text-white">{rec.userPosition}º Puesto ({rec.userPoints} pts)</strong>
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                            <div className="bg-white/5 p-2.5 rounded-lg">
                                                <span className="text-[10px] text-slate-400 uppercase block">Campeón</span>
                                                <span className="font-black text-amber-300">{rec.leagueChampion || 'N/A'}</span>
                                            </div>
                                            {rec.promotedTeams && rec.promotedTeams.length > 0 && (
                                                <div className="bg-white/5 p-2.5 rounded-lg">
                                                    <span className="text-[10px] text-emerald-400 uppercase block">Ascensos</span>
                                                    <span className="font-bold text-slate-200 truncate block">{rec.promotedTeams.join(', ')}</span>
                                                </div>
                                            )}
                                            {rec.relegatedTeams && rec.relegatedTeams.length > 0 && (
                                                <div className="bg-white/5 p-2.5 rounded-lg">
                                                    <span className="text-[10px] text-rose-400 uppercase block">Descensos</span>
                                                    <span className="font-bold text-slate-200 truncate block">{rec.relegatedTeams.join(', ')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
