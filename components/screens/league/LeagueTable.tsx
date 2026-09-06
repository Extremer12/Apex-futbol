import React, { useState, useMemo } from 'react';
import { LeagueTableRow, GameState } from '../../../types';
import { TeamForm } from '../../ui/TeamForm';
import { TrophyIcon } from '../../icons';
import { TeamLogo } from '../../../data/teams/helpers';
import { LEAGUE_THEMES } from './constants';
import { customPacksService } from '../../../services/customPacks/packService';
import { Trophy, Shield, Flame, Activity } from 'lucide-react';

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
            <div className="p-6 space-y-6">
                {/* Final por el Primer Ascenso */}
                <div className="bg-slate-800/40 rounded-xl p-5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <h4 className="text-white font-black text-sm uppercase tracking-wide">Final por el Primer Ascenso (1ºA vs 1ºB)</h4>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {finalPrimerAscenso?.winnerId ? `Campeón Ascendido: ${getTeamById(finalPrimerAscenso.winnerId)?.name}` : 'En Disputa (Semana 35)'}
                        </span>
                    </div>

                    {(!finalPrimerAscenso?.rounds || finalPrimerAscenso.rounds.length === 0) ? (
                        <div className="text-center py-6 text-slate-400 text-xs">
                            <p className="font-semibold text-slate-300">La Final por el Primer Ascenso se disputará al finalizar la Fecha 34.</p>
                            <p className="text-[11px] text-slate-500 mt-1">El 1.º de la Zona A se enfrentará al 1.º de la Zona B en estadio neutral.</p>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto">
                            {finalPrimerAscenso.rounds.map((round, rIdx) => (
                                <div key={rIdx} className="bg-slate-900/60 rounded-xl p-3 border border-white/5 space-y-2">
                                    <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider text-center border-b border-white/5 pb-1">
                                        {round.name}
                                    </div>
                                    <div className="space-y-1.5">
                                        {round.fixtures.map((f, fIdx) => {
                                            const home = getTeamById(f.homeTeamId);
                                            const away = getTeamById(f.awayTeamId);
                                            return (
                                                <div key={fIdx} className="bg-slate-800/60 rounded-lg p-2 text-xs flex items-center justify-between">
                                                    <div className="space-y-1 flex-1 min-w-0">
                                                        <div className="flex items-center justify-between text-slate-200 truncate">
                                                            <span className="truncate">{home?.name}</span>
                                                            <span className="font-bold text-white ml-2">{f.result ? f.result.homeScore : '-'}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-slate-200 truncate">
                                                            <span className="truncate">{away?.name}</span>
                                                            <span className="font-bold text-white ml-2">{f.result ? f.result.awayScore : '-'}</span>
                                                        </div>
                                                    </div>
                                                    {f.penalties && (
                                                        <div className="text-[9px] text-amber-400 font-bold ml-2 text-right">
                                                            Pen ({f.penalties.home}-{f.penalties.away})
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Torneo Reducido por el Segundo Ascenso */}
                <div className="bg-slate-800/40 rounded-xl p-5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                            <Trophy className="w-5 h-5 text-cyan-400" />
                            <h4 className="text-white font-black text-sm uppercase tracking-wide">Torneo Reducido - Segundo Ascenso</h4>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {reducido?.winnerId ? `Segundo Ascendido: ${getTeamById(reducido.winnerId)?.name}` : 'En Disputa (Semanas 35 a 38)'}
                        </span>
                    </div>

                    {(!reducido?.rounds || reducido.rounds.length === 0) ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            <p className="font-semibold text-slate-300">El Torneo Reducido comenzará al finalizar la Fecha 34.</p>
                            <p className="text-[11px] text-slate-500 mt-1">Participan los clubes ubicados del 2.º al 8.º puesto de cada zona (14 clubes) más el perdedor de la final por el 1.º ascenso en cuartos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {reducido.rounds.map((round, rIdx) => (
                                <div key={rIdx} className="bg-slate-900/60 rounded-xl p-3 border border-white/5 space-y-2">
                                    <div className="text-[11px] font-black uppercase text-cyan-400 tracking-wider text-center border-b border-white/5 pb-1">
                                        {round.name}
                                    </div>
                                    <div className="space-y-1.5">
                                        {round.fixtures.map((f, fIdx) => {
                                            const home = getTeamById(f.homeTeamId);
                                            const away = getTeamById(f.awayTeamId);
                                            return (
                                                <div key={fIdx} className="bg-slate-800/60 rounded-lg p-2 text-xs flex items-center justify-between">
                                                    <div className="space-y-1 flex-1 min-w-0">
                                                        <div className="flex items-center justify-between text-slate-200 truncate">
                                                            <span className="truncate">{home?.name}</span>
                                                            <span className="font-bold text-white ml-2">{f.result ? f.result.homeScore : '-'}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-slate-200 truncate">
                                                            <span className="truncate">{away?.name}</span>
                                                            <span className="font-bold text-white ml-2">{f.result ? f.result.awayScore : '-'}</span>
                                                        </div>
                                                    </div>
                                                    {f.penalties && (
                                                        <div className="text-[9px] text-cyan-400 font-bold ml-2 text-right">
                                                            Pen ({f.penalties.home}-{f.penalties.away})
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
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
            <div className="p-6 space-y-6">
                {/* Apertura Playoffs */}
                <div className="bg-slate-800/40 rounded-xl p-5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <h4 className="text-white font-black text-sm uppercase tracking-wide">Playoffs - Torneo Apertura</h4>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {apertura?.winnerId ? `Campeón: ${getTeamById(apertura.winnerId)?.name}` : 'En Disputa (Fecha 17 a 20)'}
                        </span>
                    </div>

                    {(!apertura?.rounds || apertura.rounds.length === 0) ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            <p className="font-semibold text-slate-300">Los Playoffs del Apertura comenzarán al finalizar la Fecha 16.</p>
                            <p className="text-[11px] text-slate-500 mt-1">Clasificarán los mejores 8 equipos de la Zona A y los mejores 8 de la Zona B (Octavos de Final a partido único).</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {apertura.rounds.map((round, rIdx) => (
                                <div key={rIdx} className="bg-slate-900/60 rounded-xl p-3 border border-white/5 space-y-2">
                                    <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider text-center border-b border-white/5 pb-1">
                                        {round.name}
                                    </div>
                                    <div className="space-y-1.5">
                                        {round.fixtures.map((f, fIdx) => {
                                            const home = getTeamById(f.homeTeamId);
                                            const away = getTeamById(f.awayTeamId);
                                            return (
                                                <div key={fIdx} className="bg-slate-800/60 rounded-lg p-2 text-xs flex items-center justify-between">
                                                    <div className="space-y-1 flex-1 min-w-0">
                                                        <div className="flex items-center justify-between text-slate-200 truncate">
                                                            <span className="truncate">{home?.name}</span>
                                                            <span className="font-bold text-white ml-2">{f.result ? f.result.homeScore : '-'}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-slate-200 truncate">
                                                            <span className="truncate">{away?.name}</span>
                                                            <span className="font-bold text-white ml-2">{f.result ? f.result.awayScore : '-'}</span>
                                                        </div>
                                                    </div>
                                                    {f.penalties && (
                                                        <div className="text-[9px] text-amber-400 font-bold ml-2 text-right">
                                                            Pen ({f.penalties.home}-{f.penalties.away})
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Clausura Playoffs */}
                <div className="bg-slate-800/40 rounded-xl p-5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                            <Trophy className="w-5 h-5 text-cyan-400" />
                            <h4 className="text-white font-black text-sm uppercase tracking-wide">Playoffs - Torneo Clausura</h4>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {clausura?.winnerId ? `Campeón: ${getTeamById(clausura.winnerId)?.name}` : 'En Disputa (Fecha 37 a 40)'}
                        </span>
                    </div>

                    {(!clausura?.rounds || clausura.rounds.length === 0) ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            <p className="font-semibold text-slate-300">Los Playoffs del Clausura comenzarán al finalizar la Fecha 36.</p>
                            <p className="text-[11px] text-slate-500 mt-1">Clasificarán los 8 mejores de cada zona tras la disputa de las 16 fechas del Clausura.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {clausura.rounds.map((round, rIdx) => (
                                <div key={rIdx} className="bg-slate-900/60 rounded-xl p-3 border border-white/5 space-y-2">
                                    <div className="text-[11px] font-black uppercase text-cyan-400 tracking-wider text-center border-b border-white/5 pb-1">
                                        {round.name}
                                    </div>
                                    <div className="space-y-1.5">
                                        {round.fixtures.map((f, fIdx) => {
                                            const home = getTeamById(f.homeTeamId);
                                            const away = getTeamById(f.awayTeamId);
                                            return (
                                                <div key={fIdx} className="bg-slate-800/60 rounded-lg p-2 text-xs flex items-center justify-between">
                                                    <div className="space-y-1 flex-1 min-w-0">
                                                        <div className="flex items-center justify-between text-slate-200 truncate">
                                                            <span className="truncate">{home?.name}</span>
                                                            <span className="font-bold text-white ml-2">{f.result ? f.result.homeScore : '-'}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-slate-200 truncate">
                                                            <span className="truncate">{away?.name}</span>
                                                            <span className="font-bold text-white ml-2">{f.result ? f.result.awayScore : '-'}</span>
                                                        </div>
                                                    </div>
                                                    {f.penalties && (
                                                        <div className="text-[9px] text-cyan-400 font-bold ml-2 text-right">
                                                            Pen ({f.penalties.home}-{f.penalties.away})
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-${theme}-500/30 rounded-2xl shadow-2xl overflow-hidden animate-fade-in`}>
            {/* Cabecera Principal */}
            <div className={`bg-gradient-to-r from-${theme}-600 via-${theme}-500 to-${theme}-600 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 p-1 bg-white/10 rounded-lg flex items-center justify-center">
                        <img 
                            src={logo || '/sinlogo.png'} 
                            alt={title} 
                            onError={(e) => { (e.target as HTMLImageElement).src = '/sinlogo.png'; }}
                            className="w-full h-full object-contain drop-shadow-md" 
                        />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg uppercase tracking-wider">{title}</h3>
                        {isArgentina && (
                            <span className="text-[11px] text-white/80 font-medium">Formato Oficial 2026: 30 Equipos • Apertura y Clausura</span>
                        )}
                        {isPrimeraNacional && (
                            <span className="text-[11px] text-white/80 font-medium">Formato Oficial 2026: 36 Equipos • 2 Zonas de 18 • Reducido y Descensos</span>
                        )}
                    </div>
                </div>

                {/* Sub-Tabs de Liga Argentina */}
                {isArgentina && (
                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl backdrop-blur-md self-start sm:self-auto overflow-x-auto max-w-full">
                        <button
                            onClick={() => setArgView('ZONA_A')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'ZONA_A' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Zona A (15)
                        </button>
                        <button
                            onClick={() => setArgView('ZONA_B')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'ZONA_B' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Zona B (15)
                        </button>
                        <button
                            onClick={() => setArgView('TABLA_ANUAL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'TABLA_ANUAL' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Tabla Anual
                        </button>
                        <button
                            onClick={() => setArgView('PROMEDIOS')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'PROMEDIOS' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Promedios
                        </button>
                        <button
                            onClick={() => setArgView('PLAYOFFS')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'ZONA_A' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Zona A (18)
                        </button>
                        <button
                            onClick={() => setArgView('ZONA_B')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'ZONA_B' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Zona B (18)
                        </button>
                        <button
                            onClick={() => setArgView('TABLA_GENERAL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                argView === 'TABLA_GENERAL' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            General
                        </button>
                        <button
                            onClick={() => setArgView('REDUCIDO')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
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
                /* Tabla de Posiciones */
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-white/5`}>
                                <th className="px-4 py-4 text-center">Pos</th>
                                <th className="px-6 py-4 text-left">Club</th>
                                <th className="px-3 py-4 text-center">PJ</th>
                                <th className="px-3 py-4 text-center">G</th>
                                <th className="px-3 py-4 text-center">E</th>
                                <th className="px-3 py-4 text-center">P</th>
                                <th className="px-4 py-4 text-center">Forma</th>
                                <th className="px-3 py-4 text-center">DG</th>
                                {isArgentina && argView === 'PROMEDIOS' && (
                                    <th className="px-4 py-4 text-center text-cyan-400">Prom</th>
                                )}
                                <th className="px-4 py-4 text-center">Pts</th>
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
                                    <tr key={row.teamId} className={`transition-all duration-200 ${isPlayerTeam ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                                        <td className="px-4 py-4 text-center relative">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className={`font-bold ${isPlayerTeam ? 'text-white' : 'text-slate-400'}`}>{row.position}</span>
                                                {zoneColor && <div className={`w-1 h-6 ${zoneColor} rounded-full absolute left-2`} title={zoneLabel}></div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center">
                                                    <TeamLogo team={team} />
                                                </div>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className={`font-bold truncate ${isPlayerTeam ? 'text-white' : 'text-slate-200'}`}>{team?.name}</span>
                                                    {(isArgentina || isPrimeraNacional) && row.zone && (argView === 'TABLA_ANUAL' || argView === 'PROMEDIOS' || argView === 'TABLA_GENERAL') && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/5">
                                                            Zona {row.zone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.played}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.won}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.drawn}</td>
                                        <td className="px-3 py-4 text-center text-slate-400">{row.lost}</td>
                                        <td className="px-4 py-4"><div className="flex justify-center"><TeamForm form={row.form} /></div></td>
                                        <td className={`px-3 py-4 text-center font-bold ${row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                        </td>
                                        {isArgentina && argView === 'PROMEDIOS' && (
                                            <td className="px-4 py-4 text-center font-bold text-cyan-400">
                                                {promedioVal}
                                            </td>
                                        )}
                                        <td className="px-4 py-4 text-center font-black text-white">{row.points}</td>
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
