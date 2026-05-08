import React from 'react';
import { CupCompetition, CupRound } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';
import { TrophyIcon } from '../icons';

interface TournamentBracketProps {
    cup: CupCompetition;
    getTeamById: (id: number) => any;
    playerTeamId: number;
    theme: { accent: string; bg: string; border: string };
    logoUrl: string;
}

const ROUND_NAMES: Record<string, string> = {
    'Round of 32': 'Dieciseisavos',
    'Round of 16': 'Octavos',
    'Quarter-Final': 'Cuartos',
    'Semi-Final': 'Semifinal',
    'Final': 'Final',
    'Final Intercontinental': 'Final',
};

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ cup, getTeamById, playerTeamId, theme, logoUrl }) => {
    const knockoutRounds = cup.rounds.filter(r => r.fixtures.length > 0);
    if (knockoutRounds.length === 0) return null;

    const winner = cup.winnerId ? getTeamById(cup.winnerId) : null;

    return (
        <div className="space-y-6">
            {/* Winner Banner */}
            {winner && (
                <div className={`flex items-center gap-4 p-5 rounded-2xl border ${theme.border} bg-white/5`}>
                    <div className="w-12 h-12"><TrophyIcon className={`w-full h-full ${theme.accent}`} /></div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Campeón</p>
                        <p className="text-white font-black text-2xl">{winner.name}</p>
                    </div>
                </div>
            )}

            {/* Bracket Container - Horizontal scroll on mobile */}
            <div className="overflow-x-auto pb-4">
                <div className="flex items-stretch gap-0 min-w-max">
                    {knockoutRounds.map((round, roundIdx) => {
                        const isLast = roundIdx === knockoutRounds.length - 1;
                        const roundName = ROUND_NAMES[round.name] || round.name;
                        const isCurrent = roundIdx === cup.currentRoundIndex;

                        return (
                            <React.Fragment key={roundIdx}>
                                <div className="flex flex-col items-center" style={{ minWidth: '180px' }}>
                                    {/* Round Header */}
                                    <div className={`text-[10px] font-black uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full border ${
                                        isCurrent ? `${theme.accent} ${theme.border} bg-white/5` : 'text-slate-500 border-white/5'
                                    }`}>
                                        {roundName}
                                    </div>

                                    {/* Fixtures */}
                                    <div className="flex flex-col justify-around flex-1 gap-3">
                                        {round.fixtures.map((fixture, fIdx) => {
                                            const home = getTeamById(fixture.homeTeamId);
                                            const away = getTeamById(fixture.awayTeamId);
                                            const hasResult = !!fixture.result;
                                            const homeWon = hasResult && fixture.result!.homeScore > fixture.result!.awayScore;
                                            const awayWon = hasResult && fixture.result!.awayScore > fixture.result!.homeScore;
                                            const isPlayerMatch = home?.id === playerTeamId || away?.id === playerTeamId;

                                            return (
                                                <div key={fIdx} className={`rounded-xl border overflow-hidden transition-all ${
                                                    isPlayerMatch ? `${theme.border} bg-white/5` : 'border-white/5 bg-slate-900/60'
                                                }`} style={{ minWidth: '170px' }}>
                                                    {/* Home */}
                                                    <div className={`flex items-center justify-between px-3 py-2 border-b border-white/5 ${homeWon ? 'bg-white/10' : ''}`}>
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <div className="w-5 h-5 shrink-0"><TeamLogo team={home} /></div>
                                                            <span className={`text-xs font-bold truncate ${
                                                                homeWon ? 'text-white' : hasResult ? 'text-slate-500' : 'text-slate-300'
                                                            }`}>{home?.name || 'TBD'}</span>
                                                        </div>
                                                        <span className={`font-black text-sm w-6 text-center ${homeWon ? 'text-white' : 'text-slate-600'}`}>
                                                            {hasResult ? fixture.result!.homeScore : '-'}
                                                        </span>
                                                    </div>
                                                    {/* Away */}
                                                    <div className={`flex items-center justify-between px-3 py-2 ${awayWon ? 'bg-white/10' : ''}`}>
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <div className="w-5 h-5 shrink-0"><TeamLogo team={away} /></div>
                                                            <span className={`text-xs font-bold truncate ${
                                                                awayWon ? 'text-white' : hasResult ? 'text-slate-500' : 'text-slate-300'
                                                            }`}>{away?.name || 'TBD'}</span>
                                                        </div>
                                                        <span className={`font-black text-sm w-6 text-center ${awayWon ? 'text-white' : 'text-slate-600'}`}>
                                                            {hasResult ? fixture.result!.awayScore : '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Connector lines between rounds */}
                                {!isLast && (
                                    <div className="flex items-center px-1 self-stretch" style={{ minWidth: '24px' }}>
                                        <div className="w-full h-full flex flex-col justify-around">
                                            {Array.from({ length: Math.ceil(round.fixtures.length / 2) }).map((_, i) => (
                                                <div key={i} className="flex items-center h-8">
                                                    <div className={`w-full border-t border-dashed ${theme.border} opacity-40`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cup logo between semis and final */}
                                {isLast && knockoutRounds.length > 1 && roundIdx === knockoutRounds.length - 1 && (
                                    <div className="flex items-center justify-center ml-4">
                                        <div className="w-16 h-16 p-2 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Copa" className="w-full h-full object-contain drop-shadow-lg" />
                                            ) : (
                                                <TrophyIcon className={`w-8 h-8 ${theme.accent}`} />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
