import React, { useState, useEffect, useRef } from 'react';
import { GameState, Team } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';

interface FullScreenMatchSimulationProps {
    gameState: GameState;
    pendingResults: {
        updatedSchedule?: any[];
        playerMatchResult: {
            homeScore: number;
            awayScore: number;
            penalties?: { home: number; away: number };
            events?: string[];
            scorers?: { playerId: number; playerName: string; minute: number }[];
        } | null;
    };
    onMatchComplete: () => void;
}

interface ParsedEvent {
    minute: number;
    type: 'goal' | 'save' | 'card' | 'whistle' | 'normal';
    text: string;
    teamName?: string;
}

export const FullScreenMatchSimulation: React.FC<FullScreenMatchSimulationProps> = ({
    gameState,
    pendingResults,
    onMatchComplete
}) => {
    // 1. Resolve match and teams
    const playedMatch = pendingResults.updatedSchedule?.find(
        (m: any) => (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id) && m.result
    ) || gameState.schedule.find(
        m => (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id) &&
             m.week === (gameState.currentTurn === 'midweek' ? gameState.currentWeek + 1 : gameState.currentWeek)
    );

    const isHome = playedMatch ? playedMatch.homeTeamId === gameState.team.id : true;
    const opponentId = isHome ? playedMatch?.awayTeamId : playedMatch?.homeTeamId;
    const opponent = gameState.allTeams.find(t => t.id === opponentId) || gameState.team;
    const homeTeam: Team = isHome ? gameState.team : opponent;
    const awayTeam: Team = !isHome ? gameState.team : opponent;
    const competitionName = playedMatch?.competition || (gameState.currentTurn === 'midweek' ? 'Copa Nacional' : 'Liga Profesional');
    const stadiumName = isHome ? (gameState.stadium?.name || 'Estadio Principal') : `Estadio de ${homeTeam.name}`;

    const finalResult = pendingResults.playerMatchResult;

    // 2. State
    const [minute, setMinute] = useState(0);
    const [displayScore, setDisplayScore] = useState({ home: 0, away: 0 });
    const [isFinished, setIsFinished] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
    const [activeTab, setActiveTab] = useState<'ticker' | 'stats'>('ticker');
    const [commentary, setCommentary] = useState<ParsedEvent[]>([]);
    const [stats, setStats] = useState({
        homePossession: 50,
        awayPossession: 50,
        homeShots: 0,
        awayShots: 0,
        homeFouls: 0,
        awayFouls: 0
    });
    const [momentum, setMomentum] = useState<number[]>([0]);
    const [isShaking, setIsShaking] = useState(false);
    const [goalPopup, setGoalPopup] = useState<{ team: string; text: string } | null>(null);

    const commentaryEndRef = useRef<HTMLDivElement>(null);
    const processedEventsRef = useRef<Set<string>>(new Set());
    const intervalRef = useRef<any>(null);

    // Auto-scroll commentary
    useEffect(() => {
        if (commentaryEndRef.current) {
            commentaryEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [commentary]);

    // Parse events into structured format
    const parseEvent = (e: string): ParsedEvent => {
        const minMatch = e.match(/^(\d+)'/);
        const min = minMatch ? parseInt(minMatch[1], 10) : minute;
        const isGoal = e.includes('⚽') || e.toLowerCase().includes('gol');
        const isSave = e.includes('🧤') || e.toLowerCase().includes('paradón') || e.toLowerCase().includes('atajada');
        const isCard = e.includes('🟨') || e.includes('🟥') || e.toLowerCase().includes('tarjeta');
        const isWhistle = e.includes('⏱️') || e.toLowerCase().includes('final');

        let type: ParsedEvent['type'] = 'normal';
        if (isGoal) type = 'goal';
        else if (isSave) type = 'save';
        else if (isCard) type = 'card';
        else if (isWhistle) type = 'whistle';

        return {
            minute: min,
            type,
            text: e,
            teamName: e.includes(homeTeam.name) ? homeTeam.name : (e.includes(awayTeam.name) ? awayTeam.name : undefined)
        };
    };

    // Fast-forward / Skip to end
    const handleSkipToEnd = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!finalResult) return;

        setMinute(90);
        setDisplayScore({ home: finalResult.homeScore, away: finalResult.awayScore });
        setIsFinished(true);

        // Add all remaining events to commentary
        if (finalResult.events) {
            const allRemaining = finalResult.events
                .filter(e => !processedEventsRef.current.has(e))
                .map(parseEvent);
            setCommentary(prev => [...prev, ...allRemaining, {
                minute: 90,
                type: 'whistle',
                text: `¡FINAL DEL PARTIDO! ${homeTeam.name} ${finalResult.homeScore} - ${finalResult.awayScore} ${awayTeam.name}`
            }]);
        }
    };

    // Main Simulation Loop
    useEffect(() => {
        if (!finalResult) {
            onMatchComplete();
            return;
        }

        const duration = 10000 / speedMultiplier; // 10s default or 5s on 2x
        const interval = 50;
        const totalSteps = duration / interval;
        const minuteIncrement = 90 / totalSteps;
        let step = 0;

        intervalRef.current = setInterval(() => {
            step++;
            const currentMinute = Math.min(90, Math.floor(step * minuteIncrement));
            setMinute(currentMinute);

            // Check events for current minute
            if (finalResult.events && finalResult.events.length > 0) {
                finalResult.events.forEach(e => {
                    const eventMin = parseInt(e.split("'")[0], 10);
                    if (eventMin === currentMinute && !processedEventsRef.current.has(e)) {
                        processedEventsRef.current.add(e);
                        const parsed = parseEvent(e);
                        setCommentary(prev => [...prev, parsed]);

                        // If goal
                        if (parsed.type === 'goal') {
                            const isHomeGoal = e.includes(homeTeam.name);
                            setDisplayScore(prev => ({
                                home: isHomeGoal ? prev.home + 1 : prev.home,
                                away: !isHomeGoal ? prev.away + 1 : prev.away
                            }));

                            setIsShaking(true);
                            setGoalPopup({
                                team: isHomeGoal ? homeTeam.name : awayTeam.name,
                                text: parsed.text.replace(/^\d+'\s*/, '')
                            });

                            setTimeout(() => {
                                setIsShaking(false);
                                setGoalPopup(null);
                            }, 1800);
                        }

                        // Stats increment
                        if (parsed.type === 'goal' || parsed.type === 'save') {
                            const isHomeAction = e.includes(homeTeam.name);
                            setStats(prev => ({
                                ...prev,
                                homeShots: isHomeAction ? prev.homeShots + 1 : prev.homeShots,
                                awayShots: !isHomeAction ? prev.awayShots + 1 : prev.awayShots
                            }));
                        }
                    }
                });
            }

            // Dynamic possession & momentum fluctuations
            if (step % 4 === 0) {
                setStats(prev => {
                    const shift = (Math.random() * 4 - 2);
                    const newHomePoss = Math.min(75, Math.max(25, prev.homePossession + shift));
                    return {
                        ...prev,
                        homePossession: newHomePoss,
                        awayPossession: 100 - newHomePoss,
                        homeFouls: prev.homeFouls + (Math.random() < 0.08 ? 1 : 0),
                        awayFouls: prev.awayFouls + (Math.random() < 0.08 ? 1 : 0)
                    };
                });

                setMomentum(prev => {
                    const last = prev[prev.length - 1] || 0;
                    const change = (Math.random() * 20 - 10);
                    return [...prev.slice(-25), Math.max(-50, Math.min(50, last + change))];
                });
            }

            // Match finished
            if (step >= totalSteps) {
                clearInterval(intervalRef.current);
                setMinute(90);
                setDisplayScore({ home: finalResult.homeScore, away: finalResult.awayScore });
                setIsFinished(true);

                setCommentary(prev => [
                    ...prev,
                    {
                        minute: 90,
                        type: 'whistle',
                        text: `¡FINAL DEL PARTIDO! ${homeTeam.name} ${finalResult.homeScore} - ${finalResult.awayScore} ${awayTeam.name}`
                    }
                ]);
            }
        }, interval);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [finalResult, speedMultiplier]);

    // Outcome determination for player
    const playerWon = (isHome && displayScore.home > displayScore.away) || (!isHome && displayScore.away > displayScore.home);
    const isDraw = displayScore.home === displayScore.away;

    return (
        <div className={`fixed inset-0 z-50 flex flex-col bg-[#06090e] text-slate-100 overflow-hidden select-none ${isShaking ? 'animate-screen-shake' : ''}`}>
            {/* Goal Explosion Banner */}
            {goalPopup && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in pointer-events-none px-4">
                    <div className="text-center space-y-3 transform animate-scale-in">
                        <div className="text-xs font-black tracking-[0.4em] uppercase text-yellow-400 bg-yellow-500/20 px-4 py-1.5 rounded-full inline-block border border-yellow-500/30">
                            Apex Matchday Live
                        </div>
                        <h1 className="text-6xl sm:text-8xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-[0_0_40px_rgba(234,179,8,0.7)]">
                            ¡GOOOOOL!
                        </h1>
                        <p className="text-xl sm:text-3xl font-black text-white uppercase tracking-wider drop-shadow-md">
                            {goalPopup.team}
                        </p>
                        <p className="text-sm text-slate-300 max-w-md mx-auto line-clamp-2">
                            {goalPopup.text}
                        </p>
                    </div>
                </div>
            )}

            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-yellow-500/10 via-emerald-500/5 to-transparent blur-3xl rounded-full" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#070b13] to-[#040609]" />
            </div>

            {/* 1. TOP BROADCAST BAR */}
            <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black tracking-widest text-red-400 uppercase">
                            {isFinished ? 'FINALIZADO' : 'EN VIVO'}
                        </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <span className="text-[var(--apex-gold)] font-bold">{competitionName}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{stadiumName}</span>
                    </div>
                </div>

                {/* Speed Controls & Skip Button */}
                <div className="flex items-center gap-2">
                    {!isFinished && (
                        <>
                            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
                                <button
                                    onClick={() => setSpeedMultiplier(1)}
                                    className={`px-2.5 py-1 rounded font-bold transition-all ${speedMultiplier === 1 ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    1x
                                </button>
                                <button
                                    onClick={() => setSpeedMultiplier(2)}
                                    className={`px-2.5 py-1 rounded font-bold transition-all ${speedMultiplier === 2 ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    2x
                                </button>
                            </div>
                            <button
                                onClick={handleSkipToEnd}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold transition-all shadow-sm"
                            >
                                <span>⏩</span>
                                <span className="hidden sm:inline">Saltar Simulación</span>
                                <span className="sm:hidden">Saltar</span>
                            </button>
                        </>
                    )}

                    {isFinished && (
                        <button
                            onClick={onMatchComplete}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-yellow-500/20 transition-all animate-pulse"
                        >
                            <span>Continuar</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>
            </header>

            {/* 2. THE SCOREBOARD BANNER (HERO) */}
            <section className="relative z-10 px-4 sm:px-8 py-5 sm:py-8 border-b border-white/5 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-transparent">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 sm:gap-8">
                    {/* Home Team */}
                    <div className="flex-1 flex flex-col items-center sm:items-end text-center sm:text-right">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center p-2 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl mb-2 sm:mb-3">
                            <TeamLogo team={homeTeam} />
                        </div>
                        <h2 className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white line-clamp-1">
                            {homeTeam.name}
                        </h2>
                        <div className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5 hidden sm:block">
                            {homeTeam.coach?.style || 'Equilibrado'} • {homeTeam.coach?.preferredFormation || '4-3-3'}
                        </div>
                        {homeTeam.id === gameState.team.id && (
                            <span className="mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30">
                                Tu Club
                            </span>
                        )}
                    </div>

                    {/* Score Center Panel */}
                    <div className="flex flex-col items-center shrink-0 px-2 sm:px-6">
                        <div className="flex items-center gap-2 sm:gap-5 px-4 sm:px-8 py-2.5 sm:py-4 rounded-2xl bg-slate-950/90 border-2 border-slate-800/80 shadow-2xl backdrop-blur-xl">
                            <span className={`text-4xl sm:text-7xl font-mono font-black tracking-tight text-white ${isFinished ? 'text-yellow-400' : ''}`}>
                                {displayScore.home}
                            </span>
                            <span className="text-slate-600 text-2xl sm:text-4xl font-light">-</span>
                            <span className={`text-4xl sm:text-7xl font-mono font-black tracking-tight text-white ${isFinished ? 'text-yellow-400' : ''}`}>
                                {displayScore.away}
                            </span>
                        </div>

                        {/* Minute / Status Badge */}
                        <div className="mt-3">
                            {isFinished ? (
                                <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${
                                    playerWon
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/20'
                                        : isDraw
                                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-yellow-500/20'
                                        : 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-red-500/20'
                                }`}>
                                    {playerWon ? '¡Victoria!' : isDraw ? 'Empate' : 'Derrota'} • 90' Final
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                                    <span>{minute === 45 ? 'Entretiempo' : `${minute}'`}</span>
                                </div>
                            )}
                        </div>

                        {finalResult?.penalties && (
                            <div className="text-[10px] font-bold text-yellow-400 mt-1">
                                Penales: {finalResult.penalties.home} - {finalResult.penalties.away}
                            </div>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center p-2 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl mb-2 sm:mb-3">
                            <TeamLogo team={awayTeam} />
                        </div>
                        <h2 className="text-base sm:text-2xl md:text-3xl font-black tracking-tight text-white line-clamp-1">
                            {awayTeam.name}
                        </h2>
                        <div className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5 hidden sm:block">
                            {awayTeam.coach?.style || 'Equilibrado'} • {awayTeam.coach?.preferredFormation || '4-3-3'}
                        </div>
                        {awayTeam.id === gameState.team.id && (
                            <span className="mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30">
                                Tu Club
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* 3. MAIN BODY (Commentary Ticker & Live Stats) */}
            <main className="relative z-10 flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 sm:p-6 overflow-hidden">
                {/* Mobile Tab Bar */}
                <div className="flex md:hidden items-center justify-center gap-2 mb-3">
                    <button
                        onClick={() => setActiveTab('ticker')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'ticker' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400'}`}
                    >
                        Minuto a Minuto ({commentary.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'stats' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400'}`}
                    >
                        Estadísticas
                    </button>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
                    {/* Commentary Column */}
                    <div className={`md:col-span-7 flex flex-col bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl ${activeTab !== 'ticker' ? 'hidden md:flex' : 'flex'}`}>
                        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                                Relato del Partido
                            </span>
                            <span className="text-[11px] text-slate-500">{commentary.length} eventos</span>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scroll-smooth">
                            {commentary.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                                    <div className="w-10 h-10 border-2 border-slate-800 border-t-yellow-400 rounded-full animate-spin mb-3" />
                                    <p className="text-xs font-bold uppercase tracking-wider">Esperando el pitido inicial...</p>
                                    <p className="text-[10px] text-slate-600 mt-1">Los equipos ultiman detalles en el túnel</p>
                                </div>
                            ) : (
                                commentary.map((evt, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all animate-fade-in ${
                                            evt.type === 'goal'
                                                ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-200 shadow-md shadow-yellow-500/5'
                                                : evt.type === 'whistle'
                                                ? 'bg-slate-800/90 border-white/20 text-white font-bold'
                                                : evt.type === 'card'
                                                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                                                : evt.type === 'save'
                                                ? 'bg-sky-950/20 border-sky-500/30 text-sky-200'
                                                : 'bg-slate-900/50 border-slate-800/60 text-slate-300'
                                        }`}
                                    >
                                        <div className="px-2 py-0.5 rounded text-[11px] font-black font-mono bg-black/40 shrink-0">
                                            {evt.minute}'
                                        </div>
                                        <div className="flex-1 text-xs leading-relaxed">
                                            {evt.text}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={commentaryEndRef} />
                        </div>
                    </div>

                    {/* Stats & Momentum Column */}
                    <div className={`md:col-span-5 flex flex-col gap-4 overflow-y-auto ${activeTab !== 'stats' ? 'hidden md:flex' : 'flex'}`}>
                        {/* Possession Box */}
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                <span>Posesión</span>
                                <span className="font-mono text-slate-300">{Math.round(stats.homePossession)}% - {Math.round(stats.awayPossession)}%</span>
                            </div>
                            <div className="relative h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                <div
                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500 ease-out"
                                    style={{ width: `${stats.homePossession}%` }}
                                />
                                <div
                                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-amber-500 to-orange-500 transition-all duration-500 ease-out"
                                    style={{ width: `${stats.awayPossession}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats Metrics Card */}
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Rendimiento en Vivo</h4>

                            {/* Shots */}
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="font-mono text-white">{stats.homeShots}</span>
                                    <span className="text-slate-500 text-[11px] uppercase">Tiros al Arco</span>
                                    <span className="font-mono text-white">{stats.awayShots}</span>
                                </div>
                                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                                    <div className="bg-sky-400 transition-all duration-300" style={{ width: `${(stats.homeShots / Math.max(1, stats.homeShots + stats.awayShots)) * 100}%` }} />
                                    <div className="bg-amber-400 transition-all duration-300" style={{ width: `${(stats.awayShots / Math.max(1, stats.homeShots + stats.awayShots)) * 100}%` }} />
                                </div>
                            </div>

                            {/* Fouls */}
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="font-mono text-white">{stats.homeFouls}</span>
                                    <span className="text-slate-500 text-[11px] uppercase">Faltas Cometidas</span>
                                    <span className="font-mono text-white">{stats.awayFouls}</span>
                                </div>
                                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                                    <div className="bg-sky-400 transition-all duration-300" style={{ width: `${(stats.homeFouls / Math.max(1, stats.homeFouls + stats.awayFouls)) * 100}%` }} />
                                    <div className="bg-amber-400 transition-all duration-300" style={{ width: `${(stats.awayFouls / Math.max(1, stats.homeFouls + stats.awayFouls)) * 100}%` }} />
                                </div>
                            </div>

                            {/* Momentum pressure graph */}
                            <div className="pt-2 border-t border-slate-800/60">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    <span>Presión Local</span>
                                    <span>Presión Visitante</span>
                                </div>
                                <div className="flex items-end justify-center gap-1 h-10 bg-slate-900/60 rounded-lg p-1.5">
                                    {momentum.map((val, i) => (
                                        <div
                                            key={i}
                                            className={`w-full rounded-sm transition-all duration-300 ${val >= 0 ? 'bg-sky-500' : 'bg-amber-500'}`}
                                            style={{
                                                height: `${Math.max(4, Math.abs(val))}%`,
                                                opacity: 0.3 + (i / momentum.length) * 0.7
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 4. BOTTOM ACTION BAR */}
            <footer className="relative z-10 px-4 sm:px-8 py-3 border-t border-white/10 bg-slate-950/90 backdrop-blur-md flex items-center justify-between">
                <div className="text-xs text-slate-400">
                    {isFinished ? (
                        <span className="font-bold text-white">Partida lista para continuar al panel.</span>
                    ) : (
                        <span>Simulando minuto a minuto a pantalla completa.</span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {isFinished ? (
                        <button
                            onClick={onMatchComplete}
                            className="px-6 py-2.5 rounded-xl bg-[var(--apex-gold)] text-slate-950 font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[var(--apex-gold)]/20 transition-all flex items-center gap-2"
                        >
                            <span>Ir al Vestuario y Avanzar</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={handleSkipToEnd}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
                        >
                            Finalizar Partido
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};
