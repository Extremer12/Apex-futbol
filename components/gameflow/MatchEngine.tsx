import React, { useState, useEffect, useRef } from 'react';
import { Team, Match } from '../../types';
import { MatchPhase } from '../../App';

interface MatchEngineProps {
    homeTeam: Team;
    awayTeam: Team;
    matchPhase: MatchPhase;
    finalResult: { homeScore: number; awayScore: number; events: string[] } | null;
    onMatchComplete: () => void;
}

export const MatchEngine: React.FC<MatchEngineProps> = ({ homeTeam, awayTeam, matchPhase, finalResult, onMatchComplete }) => {
    const [minute, setMinute] = useState(0);
    const [displayScore, setDisplayScore] = useState({ home: 0, away: 0 });
    const [showingFinalScore, setShowingFinalScore] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<string>('');
    const [commentary, setCommentary] = useState<string[]>([]);
    const [stats, setStats] = useState({ homePossession: 50, awayPossession: 50, homeShots: 0, awayShots: 0 });

    const commentaryScrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll commentary
    useEffect(() => {
        if (commentaryScrollRef.current) {
            commentaryScrollRef.current.scrollTop = commentaryScrollRef.current.scrollHeight;
        }
    }, [commentary]);

    useEffect(() => {
        if (matchPhase === 'LIVE' && finalResult) {
            const duration = 10000; // 10 seconds match
            const interval = 50;
            const totalSteps = duration / interval;
            const minuteIncrement = 90 / totalSteps;

            let step = 0;

            const timer = setInterval(() => {
                step++;
                const currentMinute = Math.min(90, Math.floor(step * minuteIncrement));
                setMinute(currentMinute);

                // Add commentary events (but don't show goals in score yet)
                const eventsNow = finalResult.events.filter(e => {
                    const eventMin = parseInt(e.split("'")[0]);
                    return eventMin === currentMinute;
                });

                if (eventsNow.length > 0) {
                    eventsNow.forEach(e => {
                        if (!commentary.includes(e)) {
                            // Add to commentary but hide goal info
                            const hiddenEvent = e.includes('GOOOOL')
                                ? `${e.split("'")[0]}' ¡Ocasión de gol! El balón entra en la red...`
                                : e;
                            setCommentary(prev => [...prev, hiddenEvent]);
                            setCurrentEvent(hiddenEvent);

                            // Update score if it's a goal
                            if (e.includes('GOOOOL')) {
                                if (e.includes(homeTeam.name)) {
                                    setDisplayScore(prev => ({ ...prev, home: prev.home + 1 }));
                                } else {
                                    setDisplayScore(prev => ({ ...prev, away: prev.away + 1 }));
                                }
                            }
                        }
                    });
                }

                // Random stats updates
                if (Math.random() < 0.05) {
                    setStats(prev => ({
                        homePossession: Math.min(75, Math.max(25, prev.homePossession + (Math.random() * 4 - 2))),
                        awayPossession: 100 - (Math.min(75, Math.max(25, prev.homePossession + (Math.random() * 4 - 2)))),
                        homeShots: prev.homeShots + (Math.random() < 0.02 ? 1 : 0),
                        awayShots: prev.awayShots + (Math.random() < 0.02 ? 1 : 0),
                    }));
                }

                if (step >= totalSteps) {
                    clearInterval(timer);
                    setMinute(90);
                    setCurrentEvent("¡PITIDO FINAL!");

                    // Dramatic score reveal after a brief pause
                    setTimeout(() => {
                        setShowingFinalScore(true);
                        setDisplayScore({ home: finalResult.homeScore, away: finalResult.awayScore });

                        // Add final score to commentary
                        setCommentary(prev => [
                            ...prev,
                            `90' ¡FINAL DEL PARTIDO! ${homeTeam.name} ${finalResult.homeScore} - ${finalResult.awayScore} ${awayTeam.name}`
                        ]);
                    }, 500);

                    setTimeout(onMatchComplete, 3000);
                }
            }, interval);

            return () => clearInterval(timer);
        } else if (matchPhase === 'PRE') {
            setMinute(0);
            setDisplayScore({ home: 0, away: 0 });
            setShowingFinalScore(false);
            setCommentary([]);
            setCurrentEvent("");
        }
    }, [matchPhase, finalResult]);

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            {/* TV Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">En Vivo</div>
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                </div>
                <div className="text-slate-400 font-mono text-sm">PREMIER LEAGUE</div>
            </div>

            {/* Scoreboard */}
            <div className="relative min-h-[16rem] md:h-72 bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 flex items-center justify-center overflow-hidden py-6 md:py-0">
                {/* Background Logos Faded */}
                <div className="absolute left-0 top-0 w-1/2 h-full opacity-5 flex items-center justify-center transform -translate-x-1/4">
                    <div className="scale-[5] grayscale [&>svg]:max-w-full [&>svg]:max-h-full">{homeTeam.logo}</div>
                </div>
                <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 flex items-center justify-center transform translate-x-1/4">
                    <div className="scale-[5] grayscale [&>svg]:max-w-full [&>svg]:max-h-full">{awayTeam.logo}</div>
                </div>

                <div className="relative z-10 flex items-center justify-center gap-2 md:gap-16 w-full px-2 md:px-8">
                    {/* Home */}
                    <div className="flex-1 flex flex-col items-center text-center">
                        <div className="w-12 h-12 md:w-20 md:h-20 flex items-center justify-center mb-2 md:mb-4 transform hover:scale-110 transition-transform duration-300">
                            <div className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain [&>svg]:drop-shadow-2xl">
                                {homeTeam.logo}
                            </div>
                        </div>
                        <h2 className="text-sm md:text-3xl font-black text-white tracking-tight drop-shadow-lg truncate w-full px-1">{homeTeam.name}</h2>
                        <div className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider hidden md:block">{homeTeam.tactics}</div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className={`bg-gradient-to-br from-slate-950 to-slate-900 px-4 md:px-8 py-2 md:py-4 rounded-xl border-2 ${showingFinalScore ? 'border-yellow-500 shadow-2xl shadow-yellow-500/30' : 'border-slate-700'} flex items-center gap-2 md:gap-4 backdrop-blur-sm transition-all duration-500`}>
                            <span className={`text-4xl md:text-8xl font-mono font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent drop-shadow-lg ${showingFinalScore ? 'animate-pulse' : ''}`}>
                                {displayScore.home}
                            </span>
                            <span className="text-slate-600 text-2xl md:text-4xl font-bold">-</span>
                            <span className={`text-4xl md:text-8xl font-mono font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent drop-shadow-lg ${showingFinalScore ? 'animate-pulse' : ''}`}>
                                {displayScore.away}
                            </span>
                        </div>
                        <div className={`mt-3 ${minute >= 90 ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-red-600 to-red-500'} text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg ${minute >= 90 ? 'shadow-green-500/50' : 'shadow-red-500/50 animate-pulse'}`}>
                            {minute >= 90 ? 'FINAL' : `${minute}'`}
                        </div>
                    </div>

                    {/* Away */}
                    <div className="flex-1 flex flex-col items-center text-center">
                        <div className="w-20 h-20 flex items-center justify-center mb-4 transform hover:scale-110 transition-transform duration-300">
                            <div className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain [&>svg]:drop-shadow-2xl">
                                {awayTeam.logo}
                            </div>
                        </div>
                        <h2 className="text-xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg">{awayTeam.name}</h2>
                        <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{awayTeam.tactics}</div>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Panel */}
            <div className="bg-slate-950 py-4 px-6 border-y border-slate-800">
                {/* Possession Bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posesión</span>
                        <span className="text-xs font-mono text-slate-500">{Math.round(stats.homePossession)}% - {Math.round(stats.awayPossession)}%</span>
                    </div>
                    <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500 ease-out"
                            style={{ width: `${stats.homePossession}%` }}
                        />
                        <div
                            className="absolute right-0 top-0 h-full bg-gradient-to-l from-purple-500 to-purple-400 transition-all duration-500 ease-out"
                            style={{ width: `${stats.awayPossession}%` }}
                        />
                        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-slate-950 transform -translate-x-1/2" />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.homeShots}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Tiros</div>
                    </div>
                    <div className="border-x border-slate-800">
                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estadísticas</div>
                        <div className="text-[10px] text-slate-600">En Vivo</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.awayShots}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Tiros</div>
                    </div>
                </div>
            </div>

            {/* Commentary Feed with Timeline */}
            <div className="h-52 bg-gradient-to-b from-slate-900 to-slate-950 p-4 overflow-y-auto scroll-smooth" ref={commentaryScrollRef}>
                {commentary.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        <div className="w-16 h-16 border-4 border-slate-800 border-t-sky-500 rounded-full animate-spin mb-4" />
                        <p className="text-sm font-semibold animate-pulse">Calentamiento previo...</p>
                        <p className="text-xs mt-2">Los equipos están listos</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {commentary.map((line, i) => {
                            const isGoal = line.includes('GOOOOL') || line.includes('¡Ocasión de gol!');
                            const isCard = line.includes('Tarjeta');
                            const isFinal = line.includes('FINAL DEL PARTIDO');

                            return (
                                <div
                                    key={i}
                                    className={`relative pl-8 pb-3 ${i !== commentary.length - 1 ? 'border-l-2 border-slate-800' : ''}`}
                                >
                                    {/* Timeline dot */}
                                    <div className={`absolute left-0 top-0 w-4 h-4 rounded-full border-2 ${isFinal ? 'bg-yellow-500 border-yellow-400 shadow-lg shadow-yellow-500/50 animate-pulse' :
                                        isGoal ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50' :
                                            isCard ? 'bg-yellow-500 border-yellow-400' :
                                                'bg-slate-700 border-slate-600'
                                        } transform -translate-x-[9px]`} />

                                    {/* Commentary text */}
                                    <div className={`text-sm p-3 rounded-lg ${isFinal ? 'bg-yellow-900/30 text-yellow-300 font-bold border-l-4 border-yellow-500 shadow-lg' :
                                        isGoal ? 'bg-green-900/30 text-green-300 font-bold border-l-4 border-green-500 shadow-lg' :
                                            isCard ? 'bg-yellow-900/20 text-yellow-200 border-l-4 border-yellow-500' :
                                                'bg-slate-800/50 text-slate-300'
                                        }`}>
                                        {line}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
