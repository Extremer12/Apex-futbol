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
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
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

                // Process events
                const eventsNow = finalResult.events.filter(e => {
                    const eventMin = parseInt(e.split("'")[0]);
                    return eventMin === currentMinute;
                });

                if (eventsNow.length > 0) {
                    eventsNow.forEach(e => {
                        if (!commentary.includes(e)) {
                            setCommentary(prev => [...prev, e]);
                            setCurrentEvent(e);
                            if (e.includes(`GOOOOL de ${homeTeam.name}`)) setHomeScore(s => s + 1);
                            if (e.includes(`GOOOOL de ${awayTeam.name}`)) setAwayScore(s => s + 1);
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
                    setHomeScore(finalResult.homeScore);
                    setAwayScore(finalResult.awayScore);
                    setCurrentEvent("¡FINAL DEL PARTIDO!");
                    setTimeout(onMatchComplete, 2000);
                }
            }, interval);

            return () => clearInterval(timer);
        } else if (matchPhase === 'PRE') {
            setMinute(0);
            setHomeScore(0);
            setAwayScore(0);
            setCommentary([]);
            setCurrentEvent("Esperando inicio...");
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
            <div className="relative h-64 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                {/* Background Logos Faded */}
                <div className="absolute left-0 top-0 w-1/2 h-full opacity-5 flex items-center justify-center transform -translate-x-1/4">
                    <div className="scale-[5] grayscale">{homeTeam.logo}</div>
                </div>
                <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 flex items-center justify-center transform translate-x-1/4">
                    <div className="scale-[5] grayscale">{awayTeam.logo}</div>
                </div>

                <div className="relative z-10 flex items-center gap-8 md:gap-16 w-full px-8">
                    {/* Home */}
                    <div className="flex-1 flex flex-col items-center text-center">
                        <div className="transform scale-150 mb-4 shadow-2xl rounded-full">{homeTeam.logo}</div>
                        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${homeTeam.primaryColor}` }}>{homeTeam.name}</h2>
                        <div className="text-sm font-bold text-slate-400 mt-1" style={{ color: homeTeam.primaryColor }}>{homeTeam.tactics}</div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center">
                        <div className="bg-slate-950 px-6 py-3 rounded-lg border border-slate-700 shadow-xl flex items-center gap-4">
                            <span className="text-5xl md:text-7xl font-mono font-bold text-white">{homeScore}</span>
                            <span className="text-slate-600 text-4xl">-</span>
                            <span className="text-5xl md:text-7xl font-mono font-bold text-white">{awayScore}</span>
                        </div>
                        <div className="mt-2 bg-red-600 text-white px-3 py-0.5 rounded text-sm font-bold animate-pulse">
                            {minute}'
                        </div>
                    </div>

                    {/* Away */}
                    <div className="flex-1 flex flex-col items-center text-center">
                        <div className="transform scale-150 mb-4 shadow-2xl rounded-full">{awayTeam.logo}</div>
                        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${awayTeam.primaryColor}` }}>{awayTeam.name}</h2>
                        <div className="text-sm font-bold text-slate-400 mt-1" style={{ color: awayTeam.primaryColor }}>{awayTeam.tactics}</div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-slate-950 py-2 px-4 flex justify-between text-xs font-mono text-slate-400 border-y border-slate-800">
                <div className="flex gap-4">
                    <span>POS: <span className="text-white">{Math.round(stats.homePossession)}%</span></span>
                    <span>TIROS: <span className="text-white">{stats.homeShots}</span></span>
                </div>
                <div className="flex gap-4">
                    <span>POS: <span className="text-white">{Math.round(stats.awayPossession)}%</span></span>
                    <span>TIROS: <span className="text-white">{stats.awayShots}</span></span>
                </div>
            </div>

            {/* Commentary Feed */}
            <div className="h-48 bg-slate-900 p-4 overflow-y-auto scroll-smooth" ref={commentaryScrollRef}>
                {commentary.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-600 italic">
                        El partido está por comenzar...
                    </div>
                ) : (
                    <div className="space-y-2">
                        {commentary.map((line, i) => (
                            <div key={i} className={`text-sm p-2 rounded ${line.includes('GOOOOL') ? 'bg-green-900/30 text-green-400 font-bold border-l-4 border-green-500' : line.includes('Tarjeta') ? 'bg-yellow-900/20 text-yellow-200 border-l-4 border-yellow-500' : 'text-slate-300'}`}>
                                {line}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
