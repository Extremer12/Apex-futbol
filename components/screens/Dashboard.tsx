import React, { useState, useEffect, useMemo } from 'react';
import { GameState, Player, Team, Match } from '../../types';
import { GameAction } from '../../state/reducer';
import { LoadingSpinner, UsersIcon, TrophyIcon, TrendingUpIcon, InboxIcon } from '../icons';
import { WeeklyFixtures } from '../ui/WeeklyFixtures';
import { LinkedText } from '../ui/LinkedText';
import { formatCurrency, formatCurrencyShort, formatDate } from '../../utils';
import { MatchPhase } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';
import { MatchEngine } from '../gameflow/MatchEngine';

interface PendingSimulationResults {
    playerMatchResult: { homeScore: number; awayScore: number; events?: string[] } | null;
}

interface DashboardProps {
    gameState: GameState;
    onPlayMatch: () => void;
    matchPhase: MatchPhase;
    pendingResults: PendingSimulationResults | null;
    onWeekComplete: () => void;
    allPlayers: Player[];
    dispatch: React.Dispatch<GameAction>;
}

const MatchDayCard: React.FC<{
    gameState: GameState,
    matchPhase: MatchPhase,
    onPlayMatch: () => void,
    pendingResults: PendingSimulationResults | null,
    onWeekComplete: () => void,
    dispatch: React.Dispatch<GameAction>
}> = ({ gameState, matchPhase, onPlayMatch, pendingResults, onWeekComplete, dispatch }) => {
    const nextWeek = gameState.currentTurn === 'midweek' ? gameState.currentWeek + 1 : gameState.currentWeek;
    const isMidweek = gameState.currentTurn === 'midweek';
    const nextMatch = gameState.schedule.find(m => m.week === nextWeek && !!m.isMidweek === isMidweek && (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id));

    const opponentId = nextMatch ? (nextMatch.homeTeamId === gameState.team.id ? nextMatch.awayTeamId : nextMatch.homeTeamId) : 0;
    const opponent = gameState.allTeams.find(t => t.id === opponentId);
    const isHome = nextMatch?.homeTeamId === gameState.team.id;

    const maxWeek = useMemo(() => gameState.schedule.length > 0 ? Math.max(...gameState.schedule.map(m => m.week)) : 38, [gameState.schedule]);

    if (matchPhase === 'LIVE' && !pendingResults?.playerMatchResult) {
        return (
            <div className="apex-card p-8 text-center flex flex-col items-center justify-center min-h-[300px] animate-fade-in mb-6">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl mb-4" style={{ background: 'rgba(200,168,78,0.1)', border: '1px solid var(--apex-border)' }}>
                    <TrendingUpIcon className="w-6 h-6 text-gold" style={{ color: 'var(--apex-gold)' }} />
                </div>
                <h2 className="text-xl font-extrabold text-white mb-2 uppercase">Matchday Completed</h2>
                <p className="text-[10px] text-white/60 mb-6 max-w-sm font-medium">Your team had a rest week. Preparations for the next fixture continue.</p>
                <button onClick={onWeekComplete} className="apex-btn-primary max-w-xs">CONTINUE</button>
            </div>
        );
    }

    if (!nextMatch) {
        if (nextWeek > maxWeek) {
            return (
                <div className="apex-card p-8 text-center flex flex-col items-center justify-center min-h-[400px] animate-fade-in mb-6"
                     style={{ border: '1px solid var(--apex-gold)', boxShadow: '0 0 40px rgba(200,168,78,0.05)' }}>
                    <TrophyIcon className="w-16 h-16 mb-4 animate-glow-pulse" style={{ color: 'var(--apex-gold)' }} />
                    <h2 className="text-3xl font-black text-white mb-2 uppercase">End of Season</h2>
                    <p className="text-xs text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
                        Season {gameState.season} has concluded. The board is evaluating your performance. Review your squad and prepare for the upcoming transfer window.
                    </p>
                    <button onClick={() => dispatch({ type: 'START_NEW_SEASON' })} className="apex-btn-gold max-w-xs">
                        START SEASON {gameState.season + 1}
                    </button>
                </div>
            );
        } else {
            return (
                <div className="apex-card p-6 flex flex-col items-center justify-center min-h-[250px] animate-fade-in mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--apex-gold)' }}></span>
                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">Week {nextWeek} · Training</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-white uppercase mb-2">Preparation Week</h2>
                    <p className="text-[10px] text-white/50 mb-6 text-center max-w-xs">No scheduled matches. The squad is resting and preparing for the next challenge.</p>
                    <button onClick={onPlayMatch} className="apex-btn-primary max-w-xs">SIMULATE WEEK</button>
                </div>
            );
        }
    }

    if (!opponent) return null;

    if (matchPhase === 'LIVE' && pendingResults?.playerMatchResult) {
        return (
            <div className="w-full h-[600px] md:h-[700px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-50 mb-6">
                 <MatchEngine
                    homeTeam={isHome ? gameState.team : opponent}
                    awayTeam={!isHome ? gameState.team : opponent}
                    matchPhase={matchPhase}
                    finalResult={{
                        homeScore: pendingResults.playerMatchResult.homeScore,
                        awayScore: pendingResults.playerMatchResult.awayScore,
                        events: pendingResults.playerMatchResult.events || []
                    }}
                    onMatchComplete={onWeekComplete}
                />
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl mb-6 p-6 flex flex-col items-center animate-fade-in"
             style={{ background: 'linear-gradient(145deg, rgba(15,20,35,0.9), rgba(10,14,23,0.95))', border: '1px solid var(--apex-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            
            <div className="absolute top-0 right-0 w-64 h-64 opacity-20 rounded-full blur-[80px]" style={{ background: 'var(--apex-gold)' }} />

            {/* Header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--apex-border)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--apex-gold)' }}></span>
                <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                    Matchday {nextWeek} {isMidweek ? '· Midweek' : ''} {nextMatch.competition && nextMatch.competition !== 'League' ? `· ${nextMatch.competition.replace(/_/g, ' ')}` : ''}
                </span>
            </div>

            {/* Teams */}
            <div className="flex w-full items-center justify-between px-2 mb-8 relative z-10">
                <div className="flex flex-col items-center flex-1">
                    <div className="w-16 h-16 md:w-20 md:h-20 mb-3 drop-shadow-2xl">
                        <TeamLogo team={isHome ? gameState.team : opponent} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-sm md:text-base font-extrabold text-white text-center leading-tight uppercase">{isHome ? gameState.team.name : opponent.name}</h3>
                    <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider mt-1">{isHome ? 'HOME' : 'AWAY'}</span>
                </div>

                <div className="flex flex-col items-center px-4">
                    <span className="text-2xl font-black italic opacity-20 text-white">VS</span>
                </div>

                <div className="flex flex-col items-center flex-1">
                    <div className="w-16 h-16 md:w-20 md:h-20 mb-3 drop-shadow-2xl">
                        <TeamLogo team={!isHome ? gameState.team : opponent} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-sm md:text-base font-extrabold text-white text-center leading-tight uppercase">{!isHome ? gameState.team.name : opponent.name}</h3>
                    <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider mt-1">{!isHome ? 'HOME' : 'AWAY'}</span>
                </div>
            </div>

            {/* CTA */}
            <button onClick={onPlayMatch} className="apex-btn-gold w-full max-w-sm relative z-10">
                PLAY MATCH
            </button>
        </div>
    );
};

const MinimalStatsBar: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    const playerTeamRow = gameState.leagueTables[gameState.team.leagueId]?.find(row => row.teamId === gameState.team.id);
    const boardConf = !isNaN(Number(gameState.boardConfidence)) ? Number(gameState.boardConfidence) : 75;
    const fanApp = !isNaN(Number(gameState.fanApproval?.rating)) ? Number(gameState.fanApproval.rating) : 60;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="apex-card p-4 flex flex-col justify-between">
                <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase mb-2">Board</span>
                <div className="flex items-end justify-between">
                    <span className="text-xl font-extrabold text-white">{boardConf}<span className="text-xs text-white/50">%</span></span>
                </div>
                <div className="w-full h-1 mt-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full" style={{ width: `${boardConf}%`, background: boardConf > 50 ? 'var(--apex-green)' : 'var(--apex-red)' }}></div>
                </div>
            </div>

            <div className="apex-card p-4 flex flex-col justify-between">
                <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase mb-2">Fans</span>
                <div className="flex items-end justify-between">
                    <span className="text-xl font-extrabold text-white">{fanApp}<span className="text-xs text-white/50">%</span></span>
                </div>
                <div className="w-full h-1 mt-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full" style={{ width: `${fanApp}%`, background: fanApp > 50 ? 'var(--apex-gold)' : 'var(--apex-red)' }}></div>
                </div>
            </div>

            <div className="apex-card p-4 flex flex-col justify-between">
                <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase mb-2">Position</span>
                <div className="flex items-end justify-between">
                    <span className="text-xl font-extrabold text-white">{playerTeamRow ? `${playerTeamRow.position}º` : '-'}</span>
                </div>
                <div className="w-full h-1 mt-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full" style={{ width: `${playerTeamRow ? Math.max(5, 100 - (playerTeamRow.position * 5)) : 0}%`, background: 'var(--apex-gold)' }}></div>
                </div>
            </div>

            <div className="apex-card p-4 flex flex-col justify-between">
                <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase mb-2">Transfer Budget</span>
                <div className="flex items-end justify-between">
                    <span className="text-lg font-extrabold text-white truncate">{formatCurrencyShort(gameState.finances.transferBudget)}</span>
                </div>
            </div>
        </div>
    );
};

const MinimalInbox: React.FC<{ gameState: GameState, dispatch: React.Dispatch<GameAction> }> = ({ gameState, dispatch }) => {
    const { incomingOffers, allTeams, team } = gameState;
    const getTeamName = (id: number) => allTeams.find(t => t.id === id)?.name || 'Club';
    const getPlayerName = (id: number) => team.squad.find(p => p.id === id)?.name || 'Player';

    if (incomingOffers.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="text-[10px] font-bold tracking-widest text-white/50 uppercase mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Pending Offers ({incomingOffers.length})
            </h3>
            <div className="space-y-2">
                {incomingOffers.slice(0, 3).map(offer => (
                    <div key={offer.id} className="apex-card p-3 flex justify-between items-center transition-all hover:border-[var(--apex-border-active)]">
                        <div>
                            <div className="text-sm font-bold text-white leading-tight">{getPlayerName(offer.playerId)}</div>
                            <div className="text-[10px] text-white/50 mt-0.5">Offer from {getTeamName(offer.offeringTeamId)} <span className="text-[var(--apex-green)] font-bold ml-1">{formatCurrency(offer.offerValue)}</span></div>
                        </div>
                        <button
                            onClick={() => dispatch({ type: 'ACCEPT_OFFER', payload: { offerId: offer.id } })}
                            className="text-[9px] font-bold uppercase tracking-wider text-white px-3 py-1.5 rounded-md transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--apex-border)' }}
                        >
                            Accept
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ gameState, onPlayMatch, matchPhase, pendingResults, onWeekComplete, allPlayers, dispatch }) => {
    const [displayedWeek, setDisplayedWeek] = useState(gameState.currentWeek > 0 ? gameState.currentWeek : 1);
    const maxWeek = useMemo(() => gameState.schedule.length > 0 ? Math.max(...gameState.schedule.map(m => m.week)) : 38, [gameState.schedule]);

    useEffect(() => {
        if (gameState.currentWeek > 0 && gameState.currentWeek <= maxWeek) {
            setDisplayedWeek(gameState.currentWeek);
        }
    }, [gameState.currentWeek, maxWeek]);

    const handlePlayerClick = (playerName: string) => {
        const player = allPlayers.find(p => p.name === playerName);
        if (player) {
            dispatch({ type: 'SET_VIEWING_PLAYER', payload: player });
        }
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <MatchDayCard
                gameState={gameState}
                matchPhase={matchPhase}
                onPlayMatch={onPlayMatch}
                pendingResults={pendingResults}
                onWeekComplete={onWeekComplete}
                dispatch={dispatch}
            />

            <MinimalStatsBar gameState={gameState} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                 {/* Left Column */}
                 <div className="lg:col-span-7">
                    <MinimalInbox gameState={gameState} dispatch={dispatch} />

                    <div className="apex-card p-5">
                        <h3 className="text-[10px] font-bold tracking-widest text-white/50 uppercase mb-4">Corporate / Press</h3>
                        <div className="space-y-4">
                            {gameState.newsFeed.slice(0, 10).map((item) => (
                                <div key={item.id} className="pb-4 border-b border-[rgba(255,255,255,0.05)] last:border-0 last:pb-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div className="flex items-center gap-2">
                                            {item.type && item.type !== 'standard' && (
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'achievement' ? 'bg-[var(--apex-green)]' : item.type === 'warning' ? 'bg-[var(--apex-red)]' : 'bg-[var(--apex-gold)]'}`}></span>
                                            )}
                                            <h4 className="text-sm font-bold tracking-tight text-white">{item.headline}</h4>
                                        </div>
                                        <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold">{item.date}</span>
                                    </div>
                                    <p className="text-[11px] text-white/60 leading-relaxed max-w-2xl">
                                        <LinkedText text={item.body} players={allPlayers} onPlayerClick={handlePlayerClick} />
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
                 
                 {/* Right Column */}
                 <div className="lg:col-span-5">
                    {gameState.schedule.length > 0 && (
                        <div className="apex-card p-5">
                            <div className="flex justify-between items-center mb-6">
                                <button onClick={() => setDisplayedWeek(w => Math.max(1, w - 1))} disabled={displayedWeek <= 1} 
                                    className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30 transition-colors"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div className="text-center">
                                    <h3 className="text-[9px] font-bold tracking-widest text-white/50 uppercase">Matchday</h3>
                                    <span className="text-xl font-extrabold text-white">{displayedWeek}</span>
                                </div>
                                <button onClick={() => setDisplayedWeek(w => Math.max(maxWeek, w + 1))} disabled={displayedWeek >= maxWeek} 
                                    className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30 transition-colors"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                            
                            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--apex-border)' }}>
                                <WeeklyFixtures
                                    week={displayedWeek}
                                    matches={matchPhase === 'LIVE' && pendingResults ? pendingResults.playerMatchResult ? gameState.schedule : gameState.schedule : gameState.schedule}
                                    allTeams={gameState.allTeams}
                                    playerTeamId={gameState.team.id}
                                    playerTeamLeagueId={gameState.team.leagueId}
                                />
                            </div>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};
