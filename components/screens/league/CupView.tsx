import React from 'react';
import { CupCompetition, GameState } from '../../../types';
import { TrophyIcon } from '../../icons';
import { TournamentBracket } from '../../ui/TournamentBracket';
import { EuropeanTable } from './EuropeanTable';
import { CUP_LOGOS, CUP_THEMES } from './constants';
import { customPacksService } from '../../../services/customPacks/packService';

interface CupViewProps {
    cup?: CupCompetition;
    gameState: GameState;
    cupTab: 'ROUNDS' | 'STATS';
    setCupTab: (tab: 'ROUNDS' | 'STATS') => void;
}

export const CupView: React.FC<CupViewProps> = ({
    cup,
    gameState,
    cupTab,
    setCupTab
}) => {
    if (!cup) return null;
    const theme = CUP_THEMES[cup.id] || CUP_THEMES.fa_cup;
    const defaultLogo = CUP_LOGOS[cup.id] || '';
    const logo = customPacksService.resolveCompetitionLogo(cup.id, cup.name, defaultLogo) || '';

    const getTeamById = (id: number) => gameState.allTeams.find(t => t.id === id);

    // If it's Champions League in Swiss phase
    if (cup.type === 'swiss' && cup.phase === 'swiss' && cup.swissTable) {
        return (
            <EuropeanTable
                table={cup.swissTable}
                title={cup.name}
                logoUrl={logo}
                theme={cup.id === 'champions_league' ? 'indigo' : 'slate'}
                gameState={gameState}
            />
        );
    }

    // If it's Libertadores in Groups phase
    if (cup.type === 'groups' && cup.phase === 'groups' && cup.groups) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cup.groups.map((group, idx) => (
                        <div key={idx} className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                            <div className="bg-amber-600/20 px-4 py-3 border-b border-amber-500/30 flex justify-between items-center">
                                <h4 className="text-amber-400 font-black text-sm uppercase tracking-tighter">{group.name}</h4>
                                <span className="text-[10px] font-bold text-amber-500/50 uppercase">Libertadores</span>
                            </div>
                            <table className="w-full text-[11px]">
                                <thead>
                                    <tr className="text-slate-500 border-b border-white/5">
                                        <th className="px-3 py-2 text-left">Club</th>
                                        <th className="px-2 py-2 text-center">PJ</th>
                                        <th className="px-2 py-2 text-center">Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.table.sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference).map((row, rIdx) => {
                                        const team = getTeamById(row.teamId);
                                        const isPlayer = team?.id === gameState.team.id;
                                        return (
                                            <tr key={rIdx} className={isPlayer ? 'bg-amber-500/10' : ''}>
                                                <td className="px-3 py-2 flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-500 w-3">{rIdx + 1}</span>
                                                    <span className={`font-bold ${isPlayer ? 'text-white' : 'text-slate-300'}`}>{team?.name}</span>
                                                </td>
                                                <td className="px-2 py-2 text-center text-slate-400">{row.played}</td>
                                                <td className="px-2 py-2 text-center font-black text-white">{row.points}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const currentRound = cup.rounds[cup.currentRoundIndex];
    const isFinished = !!cup.winnerId;
    const winner = cup.winnerId ? getTeamById(cup.winnerId) : null;

    const roundNameMap: Record<string, string> = {
        'Final': 'Gran Final',
        'Semi-Final': 'Semifinales',
        'Quarter-Final': 'Cuartos de Final',
        'Round of 16': 'Octavos de Final',
        'Round of 32': 'Dieciseisavos de Final',
        'Final Intercontinental': 'Duelo por la Gloria Eterna'
    };

    const translatedRoundName = roundNameMap[currentRound?.name] || currentRound?.name || 'Finalizada';

    return (
        <div className={`bg-gradient-to-br ${theme.bg} border-2 ${theme.border} rounded-3xl shadow-2xl overflow-hidden animate-fade-in`}>
            <div className="relative px-6 py-8 border-b border-white/5 overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)' , backgroundSize: '20px 20px' }} />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 p-2 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center shadow-xl backdrop-blur-sm shrink-0">
                            {logo ? (
                                <img src={logo} alt={cup.name} className="w-full h-full object-contain drop-shadow-lg" />
                            ) : (
                                <TrophyIcon className={`w-10 h-10 ${theme.accent}`} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">{cup.name}</h2>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                                <span className={`font-bold uppercase tracking-widest text-[10px] md:text-xs ${theme.accent}`}>Torneo Eliminatorio</span>
                                <span className="text-slate-600 hidden md:block">•</span>
                                <span className="text-slate-400 text-xs md:text-sm font-medium">{translatedRoundName}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 bg-black/30 p-1 rounded-xl shrink-0 self-start md:self-auto">
                        <button onClick={() => setCupTab('ROUNDS')} className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${cupTab === 'ROUNDS' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'}`}>Llaves</button>
                        <button onClick={() => setCupTab('STATS')} className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${cupTab === 'STATS' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'}`}>Historial</button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {cupTab === 'ROUNDS' ? (
                    <div className="space-y-4">
                        {isFinished && winner && (
                            <div className={`flex items-center gap-4 p-5 rounded-2xl border ${theme.border} bg-white/5 mb-6`}>
                                <div className="w-12 h-12 shrink-0"><TrophyIcon className={`w-full h-full ${theme.accent}`} /></div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Campeón</p>
                                    <p className="text-white font-black text-2xl">{winner.name}</p>
                                </div>
                            </div>
                        )}
                        {!currentRound && !isFinished && (
                            <div className="text-center py-16 text-slate-500">
                                <TrophyIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="font-bold uppercase tracking-widest">La competición no ha comenzado</p>
                            </div>
                        )}
                        <div className="overflow-x-auto pb-4">
                            <TournamentBracket
                                cup={cup}
                                getTeamById={getTeamById}
                                playerTeamId={gameState.team.id}
                                theme={theme}
                                logoUrl={logo}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cup.statistics.championsHistory.length === 0 ? (
                            <p className="text-center text-slate-600 py-8 text-sm font-bold uppercase tracking-widest">Sin historial todavía</p>
                        ) : cup.statistics.championsHistory.map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/5">
                                <span className="text-slate-500 font-bold text-sm">{c.season}</span>
                                <span className="font-black text-white">{c.winnerName}</span>
                                <TrophyIcon className={`w-5 h-5 ${theme.accent}`} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
