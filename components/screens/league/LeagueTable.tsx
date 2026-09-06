import React, { useState, useMemo } from 'react';
import { LeagueTableRow, GameState } from '../../../types';
import { TeamForm } from '../../ui/TeamForm';
import { TrophyIcon } from '../../icons';
import { TeamLogo } from '../../../data/teams/helpers';
import { LEAGUE_THEMES } from './constants';
import { customPacksService } from '../../../services/customPacks/packService';
import { Trophy, Shield, Flame, Activity } from 'lucide-react';
import { TournamentBracket } from '../../ui/TournamentBracket';

interface LeagueTableProps {
    table?: LeagueTableRow[];
    title: string;
    logoPath: string;
    isFirstDiv: boolean;
    leagueId: string;
    gameState: GameState;
}

type ArgViewMode = 'ZONA_A' | 'ZONA_B' | 'TABLA_ANUAL' | 'PROMEDIOS' | 'PLAYOFFS' | 'TABLA_GENERAL' | 'REDUCIDO';

export const LeagueTable: React.FC<LeagueTableProps> = ({
    table,
    title,
    logoPath,
    isFirstDiv,
    leagueId,
    gameState
}) => {
    if (!table) return null;

    const [argView, setArgView] = useState<ArgViewMode>('ZONA_A');
    const isArgentina = leagueId === 'LIGA_ARGENTINA';
    const isPrimeraNacional = leagueId === 'PRIMERA_NACIONAL';
    const isZonalLeague = isArgentina || isPrimeraNacional;
    const theme = LEAGUE_THEMES[leagueId] || 'purple';
    const logo = customPacksService.resolveCompetitionLogo(leagueId, title, logoPath);

    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);

    // Derived table based on Argentine views or standard leagues
    const displayedRows = useMemo(() => {
        if (!isZonalLeague) {
            return table;
        }

        if (argView === 'ZONA_A') {
            const zoneRows = table.filter(r => r.zone === 'A');
            const sorted = [...zoneRows].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
            return sorted.map((r, idx) => ({ ...r, position: idx + 1 }));
        }

        if (argView === 'ZONA_B') {
            const zoneRows = table.filter(r => r.zone === 'B');
            const sorted = [...zoneRows].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
            return sorted.map((r, idx) => ({ ...r, position: idx + 1 }));
        }

        if (argView === 'TABLA_ANUAL' || argView === 'TABLA_GENERAL') {
            const sorted = [...table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
            return sorted.map((r, idx) => ({ ...r, position: idx + 1 }));
        }

        if (argView === 'PROMEDIOS') {
            const sorted = [...table].sort((a, b) => (b.promedio ?? 0) - (a.promedio ?? 0) || b.points - a.points);
            return sorted.map((r, idx) => ({ ...r, position: idx + 1 }));
        }

        return table;
    }, [table, isZonalLeague, argView]);

    const renderNacionalReducido = () => {
        const finalPrimerAscenso = gameState.cups.nacionalPrimerAscenso;
        const reducido = gameState.cups.nacionalReducido;

        return (
            <div className="p-3 sm:p-5 space-y-6">
                {/* Final por el Primer Ascenso */}
                <div className="bg-slate-800/40 rounded-2xl p-3 sm:p-5 border border-white/10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <h4 className="text-white font-black text-sm uppercase tracking-wide">Final por el Primer Ascenso (1ºA vs 1ºB)</h4>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {finalPrimerAscenso?.winnerId ? `Campeón Ascendido: ${getTeamById(finalPrimerAscenso.winnerId)?.name}` : 'En Disputa (Semana 35)'}
                        </span>
                    </div>

                    {(!finalPrimerAscenso?.rounds || finalPrimerAscenso.rounds.length === 0) ? (
                        <div className="text-center py-6 text-slate-400 text-xs">
                            <p className="font-semibold text-slate-300">La Final por el Primer Ascenso se disputará al finalizar la Fecha 34.</p>
                            <p className="text-[11px] text-slate-500 mt-1">El 1.º de la Zona A se enfrentará al 1.º de la Zona B en estadio neutral.</p>
                        </div>
                    ) : (
                        <TournamentBracket
                            cup={finalPrimerAscenso}
                            getTeamById={getTeamById}
                            playerTeamId={gameState.team.id}
                            theme={{ accent: 'text-amber-400', bg: 'from-amber-950/40', border: 'border-amber-500/30' }}
                            logoUrl={logo || '/sinlogo.png'}
                        />
                    )}
                </div>

                {/* Torneo Reducido por el Segundo Ascenso */}
                <div className="bg-slate-800/40 rounded-2xl p-3 sm:p-5 border border-white/10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                            <Trophy className="w-5 h-5 text-cyan-400" />
                            <h4 className="text-white font-black text-sm uppercase tracking-wide">Torneo Reducido - Segundo Ascenso</h4>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {reducido?.winnerId ? `Segundo Ascendido: ${getTeamById(reducido.winnerId)?.name}` : 'En Disputa (Semanas 35 a 38)'}
                        </span>
                    </div>

                    {(!reducido?.rounds || reducido.rounds.length === 0) ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            <p className="font-semibold text-slate-300">El Torneo Reducido comenzará al finalizar la Fecha 34.</p>
                            <p className="text-[11px] text-slate-500 mt-1">Participan los clubes ubicados del 2.º al 8.º puesto de cada zona (14 clubes) más el perdedor de la final por el 1.º ascenso en cuartos.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Fase 1: Cruces preliminares (7 partidos) si están en ronda 0 */}
                            {reducido.rounds[0]?.fixtures?.length === 7 && (
                                <div className="space-y-2">
                                    <h5 className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                                        Fase 1 (Cruces Directos 2º al 8º de cada zona)
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                        {reducido.rounds[0].fixtures.map((f, fIdx) => {
                                            const home = getTeamById(f.homeTeamId);
                                            const away = getTeamById(f.awayTeamId);
                                            const hasResult = f.result !== undefined;
                                            const homeWon = hasResult && f.result!.homeScore > f.result!.awayScore;
                                            const awayWon = hasResult && f.result!.awayScore > f.result!.homeScore;
                                            const isPlayerMatch = home?.id === gameState.team.id || away?.id === gameState.team.id;

                                            return (
                                                <div key={fIdx} className={`rounded-xl border p-2 text-xs flex flex-col gap-1.5 ${
                                                    isPlayerMatch ? 'border-amber-400/60 bg-amber-500/10' : 'border-white/10 bg-slate-900/70'
                                                }`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                                                <TeamLogo team={home} />
                                                            </div>
                                                            <span className={`truncate text-xs ${homeWon ? 'font-black text-white' : 'text-slate-300'}`}>{home?.name}</span>
                                                        </div>
                                                        <span className="font-bold text-white ml-2">{hasResult ? f.result!.homeScore : '-'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                                                <TeamLogo team={away} />
                                                            </div>
                                                            <span className={`truncate text-xs ${awayWon ? 'font-black text-white' : 'text-slate-300'}`}>{away?.name}</span>
                                                        </div>
                                                        <span className="font-bold text-white ml-2">{hasResult ? f.result!.awayScore : '-'}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Torneo Cuartos, Semis y Final en Bracket Bifurcado */}
                            {reducido.rounds.length > 1 ? (
                                <div className="space-y-2 pt-2">
                                    <h5 className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                                        Cuadro Final del Reducido (Cuartos, Semis y Final)
                                    </h5>
                                    <TournamentBracket
                                        cup={{
                                            ...reducido,
                                            rounds: reducido.rounds.slice(1),
                                            currentRoundIndex: Math.max(0, reducido.currentRoundIndex - 1)
                                        }}
                                        getTeamById={getTeamById}
                                        playerTeamId={gameState.team.id}
                                        theme={{ accent: 'text-cyan-400', bg: 'from-cyan-950/40', border: 'border-cyan-500/30' }}
                                        logoUrl={logo || '/sinlogo.png'}
                                    />
                                </div>
                            ) : reducido.rounds[0]?.fixtures?.length !== 7 ? (
                                <TournamentBracket
                                    cup={reducido}
                                    getTeamById={getTeamById}
                                    playerTeamId={gameState.team.id}
                                    theme={{ accent: 'text-cyan-400', bg: 'from-cyan-950/40', border: 'border-cyan-500/30' }}
                                    logoUrl={logo || '/sinlogo.png'}
                                />
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderPlayoffs = () => {
        const apertura = gameState.cups.aperturaPlayoffs;
        const clausura = gameState.cups.clausuraPlayoffs;

        return (
            <div className="p-3 sm:p-5 space-y-6">
                {/* Apertura Playoffs */}
                <div className="bg-slate-800/40 rounded-2xl p-3 sm:p-5 border border-white/10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <h4 className="text-white font-black text-sm uppercase tracking-wide">Playoffs - Torneo Apertura</h4>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {apertura?.winnerId ? `Campeón: ${getTeamById(apertura.winnerId)?.name}` : 'En Disputa (Fecha 17 a 20)'}
                        </span>
                    </div>

                    {(!apertura?.rounds || apertura.rounds.length === 0) ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            <p className="font-semibold text-slate-300">Los Playoffs del Apertura comenzarán al finalizar la Fecha 16.</p>
                            <p className="text-[11px] text-slate-500 mt-1">Clasificarán los mejores 8 equipos de la Zona A y los mejores 8 de la Zona B (Octavos de Final a partido único).</p>
                        </div>
                    ) : (
                        <TournamentBracket
                            cup={apertura}
                            getTeamById={getTeamById}
                            playerTeamId={gameState.team.id}
                            theme={{ accent: 'text-amber-400', bg: 'from-amber-950/40', border: 'border-amber-500/30' }}
                            logoUrl={logo || '/sinlogo.png'}
                        />
                    )}
                </div>

                {/* Clausura Playoffs */}
                <div className="bg-slate-800/40 rounded-2xl p-3 sm:p-5 border border-white/10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                            <Trophy className="w-5 h-5 text-cyan-400" />
                            <h4 className="text-white font-black text-sm uppercase tracking-wide">Playoffs - Torneo Clausura</h4>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {clausura?.winnerId ? `Campeón: ${getTeamById(clausura.winnerId)?.name}` : 'En Disputa (Fecha 37 a 40)'}
                        </span>
                    </div>

                    {(!clausura?.rounds || clausura.rounds.length === 0) ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            <p className="font-semibold text-slate-300">Los Playoffs del Clausura comenzarán al finalizar la Fecha 36.</p>
                            <p className="text-[11px] text-slate-500 mt-1">Clasificarán los 8 mejores de cada zona tras la disputa de las 16 fechas del Clausura.</p>
                        </div>
                    ) : (
                        <TournamentBracket
                            cup={clausura}
                            getTeamById={getTeamById}
                            playerTeamId={gameState.team.id}
                            theme={{ accent: 'text-cyan-400', bg: 'from-cyan-950/40', border: 'border-cyan-500/30' }}
                            logoUrl={logo || '/sinlogo.png'}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-${theme}-500/30 rounded-2xl shadow-2xl overflow-hidden animate-fade-in`}>
            {/* Cabecera Principal */}
            <div className={`bg-gradient-to-r from-${theme}-600 via-${theme}-500 to-${theme}-600 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 p-1 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                        <img 
                            src={logo || '/sinlogo.png'} 
                            alt={title} 
                            onError={(e) => { (e.target as HTMLImageElement).src = '/sinlogo.png'; }}
                            className="w-full h-full object-contain drop-shadow-md" 
                        />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-base sm:text-lg uppercase tracking-wider">{title}</h3>
                        {isArgentina && (
                            <span className="text-[10px] sm:text-[11px] text-white/80 font-medium">Formato Oficial 2026: 30 Equipos • Apertura y Clausura</span>
                        )}
                        {isPrimeraNacional && (
                            <span className="text-[10px] sm:text-[11px] text-white/80 font-medium">Formato Oficial 2026: 36 Equipos • 2 Zonas de 18 • Reducido y Descensos</span>
                        )}
                    </div>
                </div>

                {/* Sub-Tabs de Liga Argentina */}
                {isArgentina && (
                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl backdrop-blur-md self-start sm:self-auto overflow-x-auto max-w-full">
                        <button
                            onClick={() => setArgView('ZONA_A')}
                            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'ZONA_A' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Zona A (15)
                        </button>
                        <button
                            onClick={() => setArgView('ZONA_B')}
                            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'ZONA_B' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Zona B (15)
                        </button>
                        <button
                            onClick={() => setArgView('TABLA_ANUAL')}
                            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'TABLA_ANUAL' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Tabla Anual
                        </button>
                        <button
                            onClick={() => setArgView('PROMEDIOS')}
                            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'PROMEDIOS' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Promedios
                        </button>
                        <button
                            onClick={() => setArgView('PLAYOFFS')}
                            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'PLAYOFFS' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Playoffs
                        </button>
                    </div>
                )}

                {/* Sub-Tabs de Primera Nacional */}
                {isPrimeraNacional && (
                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl backdrop-blur-md self-start sm:self-auto overflow-x-auto max-w-full">
                        <button
                            onClick={() => setArgView('ZONA_A')}
                            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'ZONA_A' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Zona A (18)
                        </button>
                        <button
                            onClick={() => setArgView('ZONA_B')}
                            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'ZONA_B' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Zona B (18)
                        </button>
                        <button
                            onClick={() => setArgView('TABLA_GENERAL')}
                            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'TABLA_GENERAL' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            General
                        </button>
                        <button
                            onClick={() => setArgView('REDUCIDO')}
                            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'REDUCIDO' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Reducido y Final
                        </button>
                    </div>
                )}
            </div>

            {/* Render Reducido & Finales or Playoffs */}
            {isArgentina && argView === 'PLAYOFFS' ? (
                renderPlayoffs()
            ) : isPrimeraNacional && argView === 'REDUCIDO' ? (
                renderNacionalReducido()
            ) : (
                /* Tabla de Posiciones: 100% Ajustada sin Scroll Horizontal */
                <div className="w-full overflow-hidden">
                    <table className="w-full table-fixed text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-slate-800/60 text-slate-400 uppercase text-[9px] sm:text-[10px] font-black tracking-wider border-b border-white/10">
                                <th className="w-7 sm:w-10 px-1 py-2.5 sm:py-3 text-center">Pos</th>
                                <th className="px-2 py-2.5 sm:py-3 text-left">Club</th>
                                <th className="w-6 sm:w-8 px-0.5 py-2.5 sm:py-3 text-center">PJ</th>
                                <th className="w-6 sm:w-8 px-0.5 py-2.5 sm:py-3 text-center">G</th>
                                <th className="w-6 sm:w-8 px-0.5 py-2.5 sm:py-3 text-center">E</th>
                                <th className="w-6 sm:w-8 px-0.5 py-2.5 sm:py-3 text-center">P</th>
                                <th className="hidden md:table-cell w-24 px-2 py-2.5 sm:py-3 text-center">Forma</th>
                                <th className="w-7 sm:w-10 px-0.5 py-2.5 sm:py-3 text-center">DG</th>
                                {isArgentina && argView === 'PROMEDIOS' && (
                                    <th className="w-12 sm:w-14 px-1 py-2.5 sm:py-3 text-center text-cyan-400">Prom</th>
                                )}
                                <th className="w-8 sm:w-12 px-1 py-2.5 sm:py-3 text-center font-black">Pts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayedRows.map((row) => {
                                const team = getTeamById(row.teamId);
                                const isPlayerTeam = team?.id === gameState.team.id;

                                let zoneColor = '';
                                let zoneLabel = '';

                                if (isArgentina) {
                                    if (argView === 'ZONA_A' || argView === 'ZONA_B') {
                                        if (row.position <= 8) {
                                            zoneColor = 'bg-emerald-500';
                                            zoneLabel = 'Clasifica a Octavos de Final (Playoffs)';
                                        }
                                    } else if (argView === 'TABLA_ANUAL') {
                                        if (row.position <= 4) {
                                            zoneColor = 'bg-amber-500';
                                            zoneLabel = 'Copa Libertadores';
                                        } else if (row.position <= 10) {
                                            zoneColor = 'bg-blue-500';
                                            zoneLabel = 'Copa Sudamericana';
                                        } else if (row.position === displayedRows.length) {
                                            zoneColor = 'bg-red-500';
                                            zoneLabel = 'Descenso por Tabla Anual';
                                        }
                                    } else if (argView === 'PROMEDIOS') {
                                        if (row.position === displayedRows.length) {
                                            zoneColor = 'bg-red-500';
                                            zoneLabel = 'Descenso por Promedio';
                                        }
                                    }
                                } else if (isPrimeraNacional) {
                                    if (argView === 'ZONA_A' || argView === 'ZONA_B') {
                                        if (row.position === 1) {
                                            zoneColor = 'bg-amber-500';
                                            zoneLabel = 'Final por el 1º Ascenso';
                                        } else if (row.position >= 2 && row.position <= 8) {
                                            zoneColor = 'bg-cyan-500';
                                            zoneLabel = 'Clasifica al Torneo Reducido';
                                        } else if (row.position >= 17) {
                                            zoneColor = 'bg-red-500';
                                            zoneLabel = 'Descenso Directo';
                                        }
                                    } else if (argView === 'TABLA_GENERAL') {
                                        if (row.position <= 2) {
                                            zoneColor = 'bg-green-500';
                                            zoneLabel = 'Zona de Ascenso';
                                        } else if (row.position >= displayedRows.length - 3) {
                                            zoneColor = 'bg-red-500';
                                            zoneLabel = 'Zona de Descenso';
                                        }
                                    }
                                } else {
                                    if (isFirstDiv) {
                                        if (row.position <= 4) { zoneColor = 'bg-purple-500'; zoneLabel = 'Champions League'; }
                                        else if (row.position === 5) { zoneColor = 'bg-orange-500'; zoneLabel = 'Europa League'; }
                                        else if (row.position >= displayedRows.length - 2) { zoneColor = 'bg-red-500'; zoneLabel = 'Descenso'; }
                                    } else {
                                        if (row.position <= 2) { zoneColor = 'bg-green-500'; zoneLabel = 'Ascenso Directo'; }
                                        else if (row.position >= 3 && row.position <= 6) { zoneColor = 'bg-blue-500'; zoneLabel = 'Play-offs'; }
                                        else if (row.position >= displayedRows.length - 2) { zoneColor = 'bg-red-500'; zoneLabel = 'Descenso'; }
                                    }
                                }

                                const promedioVal = row.promedio 
                                    ? row.promedio.toFixed(3) 
                                    : (row.played > 0 ? (row.points / row.played).toFixed(3) : '0.000');

                                return (
                                    <tr key={row.teamId} className={`transition-all duration-200 ${isPlayerTeam ? 'bg-amber-500/15 font-semibold' : 'hover:bg-white/5'}`}>
                                        <td className="w-7 sm:w-10 px-1 py-2 sm:py-2.5 text-center relative">
                                            <div className="flex items-center justify-center">
                                                <span className={`font-bold ${isPlayerTeam ? 'text-amber-300' : 'text-slate-400'}`}>{row.position}</span>
                                                {zoneColor && <div className={`w-1 h-4 sm:h-5 ${zoneColor} rounded-full absolute left-1 sm:left-1.5`} title={zoneLabel} />}
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 sm:py-2.5 min-w-0">
                                            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                                                <div className="w-5 h-5 sm:w-7 sm:h-7 shrink-0 flex items-center justify-center">
                                                    <TeamLogo team={team} />
                                                </div>
                                                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                                                    <span className={`font-bold truncate text-[11px] sm:text-xs md:text-sm ${isPlayerTeam ? 'text-white' : 'text-slate-200'}`}>
                                                        {team?.name}
                                                    </span>
                                                    {(isArgentina || isPrimeraNacional) && row.zone && (argView === 'TABLA_ANUAL' || argView === 'PROMEDIOS' || argView === 'TABLA_GENERAL') && (
                                                        <span className="text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded bg-white/10 text-slate-400 shrink-0">
                                                            Z{row.zone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="w-6 sm:w-8 px-0.5 py-2 sm:py-2.5 text-center text-slate-400">{row.played}</td>
                                        <td className="w-6 sm:w-8 px-0.5 py-2 sm:py-2.5 text-center text-slate-400">{row.won}</td>
                                        <td className="w-6 sm:w-8 px-0.5 py-2 sm:py-2.5 text-center text-slate-400">{row.drawn}</td>
                                        <td className="w-6 sm:w-8 px-0.5 py-2 sm:py-2.5 text-center text-slate-400">{row.lost}</td>
                                        <td className="hidden md:table-cell w-24 px-2 py-2 sm:py-2.5"><div className="flex justify-center"><TeamForm form={row.form} /></div></td>
                                        <td className={`w-7 sm:w-10 px-0.5 py-2 sm:py-2.5 text-center font-bold ${row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                        </td>
                                        {isArgentina && argView === 'PROMEDIOS' && (
                                            <td className="w-12 sm:w-14 px-1 py-2 sm:py-2.5 text-center font-bold text-cyan-400 text-[11px] sm:text-xs">
                                                {promedioVal}
                                            </td>
                                        )}
                                        <td className="w-8 sm:w-12 px-1 py-2 sm:py-2.5 text-center font-black text-white">{row.points}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Leyenda explicativa en el pie de tabla */}
                    <div className="px-6 py-3 bg-slate-950/40 border-t border-white/5 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                        {isArgentina ? (
                            <>
                                {(argView === 'ZONA_A' || argView === 'ZONA_B') && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                        <span>1º al 8º clasifican a Octavos de Final (Playoffs)</span>
                                    </div>
                                )}
                                {argView === 'TABLA_ANUAL' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                            <span>1º al 4º Copa Libertadores</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                            <span>5º al 10º Copa Sudamericana</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                            <span>30º Descenso por Tabla Anual</span>
                                        </div>
                                    </>
                                )}
                                {argView === 'PROMEDIOS' && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                        <span>Último promedio desciende a Primera Nacional</span>
                                    </div>
                                )}
                            </>
                        ) : isPrimeraNacional ? (
                            <>
                                {(argView === 'ZONA_A' || argView === 'ZONA_B') && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                            <span>1º Final por el 1º Ascenso Directo</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
                                            <span>2º al 8º Clasifican al Torneo Reducido</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                            <span>17º y 18º Descenso Directo</span>
                                        </div>
                                    </>
                                )}
                                {argView === 'TABLA_GENERAL' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                            <span>Puestos de Ascenso</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                            <span>Puestos de Descenso</span>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {isFirstDiv ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                                            <span>Champions League (1º - 4º)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                                            <span>Europa League (5º)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                            <span>Descenso</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                            <span>Ascenso Directo (1º - 2º)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                            <span>Play-offs (3º - 6º)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                            <span>Descenso</span>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
