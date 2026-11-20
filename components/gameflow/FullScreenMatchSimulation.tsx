import React, { useState, useEffect, useRef } from 'react';
import { GameState, Team, PlayerMatchResult, MatchLiveStats } from '../../types';
import { GameAction } from '../../state/reducer';
import { TeamLogo } from '../../data/teams/helpers';
import { getTeamStadium } from '../../data/stadiums';

interface FullScreenMatchSimulationProps {
    gameState: GameState;
    pendingResults: {
        updatedSchedule?: any[];
        playerMatchResult: PlayerMatchResult | null;
    };
    onMatchComplete: () => void;
    dispatch?: React.Dispatch<GameAction>;
}

interface ParsedEvent {
    minute: number;
    type: 'goal' | 'save' | 'card' | 'whistle' | 'normal';
    text: string;
    teamName?: string;
    isHome?: boolean;
}

export const FullScreenMatchSimulation: React.FC<FullScreenMatchSimulationProps> = ({
    gameState,
    pendingResults,
    onMatchComplete,
    dispatch
}) => {
    const finalResult = pendingResults.playerMatchResult;

    // 1. Resolve match and teams with absolute certainty
    const homeTeam: Team = (finalResult?.homeTeamId ? gameState.allTeams.find(t => t.id === finalResult.homeTeamId) : null)
        || gameState.team;

    const awayTeam: Team = (finalResult?.awayTeamId ? gameState.allTeams.find(t => t.id === finalResult.awayTeamId) : null)
        || gameState.allTeams.find(t => t.id !== homeTeam.id)
        || gameState.team;

    const isHome = homeTeam.id === gameState.team.id;
    const competitionName = finalResult?.competition || (gameState.currentTurn === 'midweek' ? 'Copa Nacional' : 'Liga');
    const stadiumName = isHome 
        ? (gameState.stadium?.name || gameState.team.stadiumName || getTeamStadium(gameState.team).name) 
        : (homeTeam.stadiumName || getTeamStadium(homeTeam).name);

    // Check if match had extra time (events after 90')
    const hasExtraTime = (finalResult?.events || []).some(e => {
        const m = e.match(/^(\d+)'/);
        return m ? parseInt(m[1], 10) > 90 : false;
    });
    const totalMatchMinutes = hasExtraTime ? 120 : 90;

    // 2. State
    const [minute, setMinute] = useState(0);
    const [displayScore, setDisplayScore] = useState({ home: 0, away: 0 });
    const [isFinished, setIsFinished] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 4>(() => {
        try {
            const saved = localStorage.getItem('apex_match_speed');
            if (saved === '2') return 2;
            if (saved === '4') return 4;
            return 1;
        } catch (_) {
            return 1;
        }
    });
    const [presidentialMode, setPresidentialMode] = useState<boolean>(() => {
        try {
            return localStorage.getItem('apex_presidential_mode') !== 'false';
        } catch (_) {
            return true;
        }
    });

    const speedMultiplierRef = useRef(speedMultiplier);
    speedMultiplierRef.current = speedMultiplier;

    const presidentialModeRef = useRef(presidentialMode);
    presidentialModeRef.current = presidentialMode;

    const currentMinuteRef = useRef(0);

    const [activePromptMinute, setActivePromptMinute] = useState<number | null>(null);
    const promptedMinutesRef = useRef<Set<number>>(new Set());

    const [activeTab, setActiveTab] = useState<'ticker' | 'stats'>('ticker');
    const [commentary, setCommentary] = useState<ParsedEvent[]>([]);

    const targetStats = React.useMemo<MatchLiveStats>(() => {
        if (finalResult?.stats) return finalResult.stats;
        return {
            homePossession: 50,
            awayPossession: 50,
            homeShots: 10,
            awayShots: 8,
            homeShotsOnTarget: 4,
            awayShotsOnTarget: 3,
            homeFouls: 9,
            awayFouls: 11
        };
    }, [finalResult?.stats]);

    const [stats, setStats] = useState<MatchLiveStats>(() => ({
        homePossession: targetStats.homePossession,
        awayPossession: targetStats.awayPossession,
        homeShots: 0,
        awayShots: 0,
        homeShotsOnTarget: 0,
        awayShotsOnTarget: 0,
        homeFouls: 0,
        awayFouls: 0
    }));
    const [momentum, setMomentum] = useState<number[]>([0]);
    const [isShaking, setIsShaking] = useState(false);
    const [goalPopup, setGoalPopup] = useState<{ team: string; text: string } | null>(null);

    const startSimulationLoopRef = useRef<() => void>(() => {});
    const isPausedForGoalRef = useRef(false);
    const stepRef = useRef(0);

    const commentaryEndRef = useRef<HTMLDivElement>(null);
    const processedEventsRef = useRef<Set<string>>(new Set());
    const intervalRef = useRef<any>(null);

    // Auto-scroll commentary
    useEffect(() => {
        if (commentaryEndRef.current) {
            commentaryEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [commentary]);

    // Parse events into structured format with strict goal detection
    const parseEvent = (e: string): ParsedEvent => {
        const minMatch = e.match(/^(\d+)'/);
        const min = minMatch ? parseInt(minMatch[1], 10) : 0;

        // ONLY events with ⚽ are genuine goals (avoid false positives like 'evita el gol')
        const isGoal = e.includes('⚽');
        const isSave = e.includes('🧤') || e.toLowerCase().includes('parada') || e.toLowerCase().includes('atajada');
        const isCard = e.includes('🟨') || e.includes('🟥') || e.toLowerCase().includes('tarjeta') || e.toLowerCase().includes('expulsión');
        const isWhistle = e.includes('⏱️') || e.toLowerCase().includes('final');

        let type: ParsedEvent['type'] = 'normal';
        if (isGoal) type = 'goal';
        else if (isSave) type = 'save';
        else if (isCard) type = 'card';
        else if (isWhistle) type = 'whistle';

        let isHomeAction = false;
        if (isGoal) {
            if (e.includes(`GOOOOL de ${homeTeam.name}`) || e.includes(`¡GOL EN PRÓRROGA! ${homeTeam.name}`) || e.includes(`¡GOL DE ${homeTeam.name}`)) {
                isHomeAction = true;
            } else if (e.includes(`GOOOOL de ${awayTeam.name}`) || e.includes(`¡GOL EN PRÓRROGA! ${awayTeam.name}`) || e.includes(`¡GOL DE ${awayTeam.name}`)) {
                isHomeAction = false;
            } else if (e.includes(homeTeam.name) && !e.includes(awayTeam.name)) {
                isHomeAction = true;
            } else if (e.includes(awayTeam.name) && !e.includes(homeTeam.name)) {
                isHomeAction = false;
            } else {
                const hasHomePlayer = homeTeam.squad.some(p => e.includes(p.name));
                isHomeAction = hasHomePlayer;
            }
        } else {
            isHomeAction = e.includes(homeTeam.name);
        }

        return {
            minute: min,
            type,
            text: e,
            teamName: isHomeAction ? homeTeam.name : awayTeam.name,
            isHome: isHomeAction
        };
    };

    // Pre-parsed events
    const allParsedEvents = React.useMemo(() => {
        if (!finalResult?.events) return [];
        return finalResult.events.map(parseEvent);
    }, [finalResult?.events, homeTeam.name, awayTeam.name]);

    const goalTimeoutRef = useRef<any>(null);

    const handleSetSpeed = (spd: 1 | 2 | 4) => {
        speedMultiplierRef.current = spd;
        setSpeedMultiplier(spd);
        try {
            localStorage.setItem('apex_match_speed', spd.toString());
        } catch (_) {}
    };

    const handleTogglePresidential = () => {
        setPresidentialMode(prev => {
            const next = !prev;
            presidentialModeRef.current = next;
            try {
                localStorage.setItem('apex_presidential_mode', next.toString());
            } catch (_) {}
            return next;
        });
    };

    const handlePresidentialDecision = (type: 'ATTACK' | 'DEFEND' | 'BONUS' | 'PASS') => {
        const atMin = activePromptMinute || 45;
        setActivePromptMinute(null);
        isPausedForGoalRef.current = false;

        if (type === 'ATTACK') {
            const text = `${atMin}' ⚡ ¡Indicación del Palco Presidencial! El equipo adelanta sus líneas y asfixia al rival con presión alta.`;
            setCommentary(prev => [...prev, { minute: atMin, type: 'normal', text, isHome }]);
            setMomentum(prev => [...prev, isHome ? 35 : -35]);
            setStats(prev => ({
                ...prev,
                homeShots: isHome ? prev.homeShots + 2 : prev.homeShots,
                awayShots: !isHome ? prev.awayShots + 2 : prev.awayShots
            }));
        } else if (type === 'DEFEND') {
            const text = `${atMin}' 🛡️ ¡Orden táctica del Palco! Bloque bajo, repliegue disciplinado y enfriar el ritmo del juego.`;
            setCommentary(prev => [...prev, { minute: atMin, type: 'normal', text, isHome }]);
            setMomentum(prev => [...prev, isHome ? 15 : -15]);
        } else if (type === 'BONUS') {
            const text = `${atMin}' 💼 ¡Inyección anímica del Presidente! Se anuncia una prima económica especial por conseguir la victoria.`;
            setCommentary(prev => [...prev, { minute: atMin, type: 'normal', text, isHome }]);
            setMomentum(prev => [...prev, isHome ? 45 : -45]);
            setStats(prev => ({
                ...prev,
                homePossession: isHome ? Math.min(85, prev.homePossession + 6) : Math.max(15, prev.homePossession - 6),
                awayPossession: !isHome ? Math.min(85, prev.awayPossession + 6) : Math.max(15, prev.awayPossession - 6)
            }));
            if (dispatch) {
                dispatch({ type: 'AWARD_TEAM_BONUS', payload: { bonusPerPlayer: 10000 } });
            }
        }

        startSimulationLoopRef.current();
    };

    // Fast-forward / Skip to end
    const handleSkipToEnd = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (goalTimeoutRef.current) clearTimeout(goalTimeoutRef.current);
        isPausedForGoalRef.current = false;
        setIsShaking(false);
        setGoalPopup(null);
        if (!finalResult) return;

        currentMinuteRef.current = totalMatchMinutes;
        setMinute(totalMatchMinutes);
        setDisplayScore({ home: finalResult.homeScore, away: finalResult.awayScore });
        setStats(targetStats);
        setIsFinished(true);

        const allRemaining = allParsedEvents.filter(e => !processedEventsRef.current.has(e.text));
        setCommentary(prev => [
            ...prev,
            ...allRemaining,
            {
                minute: totalMatchMinutes,
                type: 'whistle',
                text: `¡FINAL DEL PARTIDO! ${homeTeam.name} ${finalResult.homeScore} - ${finalResult.awayScore} ${awayTeam.name}`,
                isHome: false
            }
        ]);
    };

    // Main Simulation Loop with Goal Celebration Banners
    useEffect(() => {
        if (!finalResult) {
            onMatchComplete();
            return;
        }

        const interval = 50;
        const totalBaseSteps = 10000 / interval; // 200 ticks for 10s base
        const baseMinuteIncrement = totalMatchMinutes / totalBaseSteps;
        stepRef.current = 0;
        currentMinuteRef.current = 0;
        isPausedForGoalRef.current = false;

        const startSimulationLoop = () => {
            if (intervalRef.current) clearInterval(intervalRef.current);

            intervalRef.current = setInterval(() => {
                if (isPausedForGoalRef.current) return;

                stepRef.current++;
                currentMinuteRef.current = Math.min(
                    totalMatchMinutes,
                    currentMinuteRef.current + (baseMinuteIncrement * (speedMultiplierRef.current || 1))
                );
                const currentMinute = Math.floor(currentMinuteRef.current);
                setMinute(currentMinute);

                // Presidential Palco interactive decision at 45' and 70'
                if (presidentialModeRef.current && currentMinute >= 45 && !promptedMinutesRef.current.has(45)) {
                    promptedMinutesRef.current.add(45);
                    isPausedForGoalRef.current = true;
                    clearInterval(intervalRef.current);
                    currentMinuteRef.current = 45;
                    setMinute(45);
                    setActivePromptMinute(45);
                    return;
                }
                if (presidentialModeRef.current && currentMinute >= 70 && !promptedMinutesRef.current.has(70)) {
                    promptedMinutesRef.current.add(70);
                    isPausedForGoalRef.current = true;
                    clearInterval(intervalRef.current);
                    currentMinuteRef.current = 70;
                    setMinute(70);
                    setActivePromptMinute(70);
                    return;
                }

                // Process pending events up to current minute
                const pendingEvents = allParsedEvents.filter(
                    ev => ev.minute <= currentMinute && !processedEventsRef.current.has(ev.text)
                );

                if (pendingEvents.length > 0) {
                    for (let i = 0; i < pendingEvents.length; i++) {
                        const ev = pendingEvents[i];
                        processedEventsRef.current.add(ev.text);
                        setCommentary(prev => [...prev, ev]);

                        if (ev.type === 'goal' || ev.type === 'save') {
                            setStats(prev => ({
                                ...prev,
                                homeShots: ev.isHome ? Math.min(targetStats.homeShots, prev.homeShots + 1) : prev.homeShots,
                                awayShots: !ev.isHome ? Math.min(targetStats.awayShots, prev.awayShots + 1) : prev.awayShots,
                                homeShotsOnTarget: ev.isHome ? Math.min(targetStats.homeShotsOnTarget, prev.homeShotsOnTarget + 1) : prev.homeShotsOnTarget,
                                awayShotsOnTarget: !ev.isHome ? Math.min(targetStats.awayShotsOnTarget, prev.awayShotsOnTarget + 1) : prev.awayShotsOnTarget
                            }));
                        } else if (ev.type === 'card') {
                            setStats(prev => ({
                                ...prev,
                                homeFouls: ev.isHome ? Math.min(targetStats.homeFouls, prev.homeFouls + 1) : prev.homeFouls,
                                awayFouls: !ev.isHome ? Math.min(targetStats.awayFouls, prev.awayFouls + 1) : prev.awayFouls
                            }));
                        }

                        // If a goal happens, pause briefly for broadcast celebration banner
                        if (ev.type === 'goal') {
                            isPausedForGoalRef.current = true;
                            clearInterval(intervalRef.current);

                            // Pin the minute to the goal minute
                            currentMinuteRef.current = ev.minute;
                            setMinute(ev.minute);

                            // Update score immediately with genuine goals up to this event's minute
                            const goalsUpToNow = allParsedEvents.filter(
                                g => g.type === 'goal' && processedEventsRef.current.has(g.text)
                            );
                            setDisplayScore({
                                home: goalsUpToNow.filter(g => g.isHome).length,
                                away: goalsUpToNow.filter(g => !g.isHome).length
                            });

                            // Trigger celebration popup and shake
                            setIsShaking(true);
                            setGoalPopup({
                                team: ev.teamName || (ev.isHome ? homeTeam.name : awayTeam.name),
                                text: ev.text.replace(/^\d+'\s*/, '')
                            });

                            const celebrationDuration = Math.max(1000, 1800 / (speedMultiplierRef.current === 4 ? 2 : 1));
                            goalTimeoutRef.current = setTimeout(() => {
                                setIsShaking(false);
                                setGoalPopup(null);
                                isPausedForGoalRef.current = false;
                                startSimulationLoop();
                            }, celebrationDuration);

                            return; // Stop processing further events in this tick
                        }
                    }

                    // Update score for non-goal events tick
                    const goalsSoFar = allParsedEvents.filter(
                        ev => ev.type === 'goal' && processedEventsRef.current.has(ev.text)
                    );
                    setDisplayScore({
                        home: goalsSoFar.filter(g => g.isHome).length,
                        away: goalsSoFar.filter(g => !g.isHome).length
                    });
                }

                // Dynamic possession & progressive stats toward targets
                if (stepRef.current % 4 === 0) {
                    const matchProgress = Math.min(1, currentMinute / totalMatchMinutes);
                    setStats(prev => {
                        const shift = (Math.random() * 4 - 2);
                        const currentTargetPoss = targetStats.homePossession;
                        const newHomePoss = Math.min(85, Math.max(15, Math.round(currentTargetPoss + shift)));

                        const expectedHomeShots = Math.max(prev.homeShots, Math.round(targetStats.homeShots * matchProgress));
                        const expectedAwayShots = Math.max(prev.awayShots, Math.round(targetStats.awayShots * matchProgress));
                        const expectedHomeTarget = Math.max(prev.homeShotsOnTarget, Math.round(targetStats.homeShotsOnTarget * matchProgress));
                        const expectedAwayTarget = Math.max(prev.awayShotsOnTarget, Math.round(targetStats.awayShotsOnTarget * matchProgress));
                        const expectedHomeFouls = Math.max(prev.homeFouls, Math.round(targetStats.homeFouls * matchProgress));
                        const expectedAwayFouls = Math.max(prev.awayFouls, Math.round(targetStats.awayFouls * matchProgress));

                        return {
                            homePossession: newHomePoss,
                            awayPossession: 100 - newHomePoss,
                            homeShots: expectedHomeShots,
                            awayShots: expectedAwayShots,
                            homeShotsOnTarget: expectedHomeTarget,
                            awayShotsOnTarget: expectedAwayTarget,
                            homeFouls: expectedHomeFouls,
                            awayFouls: expectedAwayFouls
                        };
                    });

                    setMomentum(prev => {
                        const last = prev[prev.length - 1] || 0;
                        const change = (Math.random() * 20 - 10);
                        return [...prev.slice(-25), Math.max(-50, Math.min(50, last + change))];
                    });
                }

                // Match finished
                if (currentMinuteRef.current >= totalMatchMinutes) {
                    clearInterval(intervalRef.current);
                    currentMinuteRef.current = totalMatchMinutes;
                    setMinute(totalMatchMinutes);
                    setDisplayScore({ home: finalResult.homeScore, away: finalResult.awayScore });
                    setStats(targetStats);
                    setIsFinished(true);

                    setCommentary(prev => [
                        ...prev,
                        {
                            minute: totalMatchMinutes,
                            type: 'whistle',
                            text: `¡FINAL DEL PARTIDO! ${homeTeam.name} ${finalResult.homeScore} - ${finalResult.awayScore} ${awayTeam.name}`,
                            isHome: false
                        }
                    ]);
                }
            }, interval);
        };

        startSimulationLoopRef.current = startSimulationLoop;
        startSimulationLoop();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (goalTimeoutRef.current) clearTimeout(goalTimeoutRef.current);
        };
    }, [finalResult, targetStats, allParsedEvents, totalMatchMinutes, homeTeam, awayTeam, onMatchComplete]);

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

            {/* Presidential Palco Interactive Modal at 45' and 70' */}
            {activePromptMinute !== null && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-lg animate-fade-in px-4">
                    <div className="bg-slate-900/95 border-2 border-[var(--apex-gold)]/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-[0_0_50px_rgba(234,179,8,0.25)] text-center space-y-5 animate-scale-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 text-[var(--apex-gold)] text-xs font-black uppercase tracking-wider">
                            <span>💼 Palco Presidencial</span>
                            <span>•</span>
                            <span>Minuto {activePromptMinute}' ({activePromptMinute === 45 ? 'Entretiempo' : 'Tramo Decisivo'})</span>
                        </div>

                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                                Indicación al Vestuario
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                                Tienes la palabra para influir en el rumbo del partido. Elige una orden para el cuerpo técnico y el plantel:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => handlePresidentialDecision('ATTACK')}
                                className="flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/20 text-left transition-all group shadow-md"
                            >
                                <div className="text-base sm:text-lg font-black text-amber-300 mb-1">⚡ Aumentar Presión</div>
                                <div className="text-[11px] text-slate-300 leading-snug">
                                    Adelantar líneas, presión alta en campo rival y buscar el arco con intensidad.
                                </div>
                            </button>

                            <button
                                onClick={() => handlePresidentialDecision('DEFEND')}
                                className="flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-600/10 border border-sky-500/30 hover:border-sky-400 hover:bg-sky-500/20 text-left transition-all group shadow-md"
                            >
                                <div className="text-base sm:text-lg font-black text-sky-300 mb-1">🛡️ Cerrar el Partido</div>
                                <div className="text-[11px] text-slate-300 leading-snug">
                                    Reorganizar en bloque bajo, controlar el reloj y anular las ocasiones del rival.
                                </div>
                            </button>

                            <button
                                onClick={() => handlePresidentialDecision('BONUS')}
                                className="flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-600/10 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/20 text-left transition-all group shadow-md sm:col-span-2"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-base sm:text-lg font-black text-emerald-300 mb-1">💼 Prima Extra por Victoria</span>
                                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">Inyección Anímica</span>
                                </div>
                                <div className="text-[11px] text-slate-300 leading-snug">
                                    Ofrecer una prima económica al vestuario. Máximo impulso anímico y posesión para tus jugadores.
                                </div>
                            </button>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => handlePresidentialDecision('PASS')}
                                className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider underline transition-colors"
                            >
                                Mantener indicación actual del DT (Continuar)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-yellow-500/10 via-emerald-500/5 to-transparent blur-3xl rounded-full" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#070b13] to-[#040609]" />
            </div>

            {/* 1. TOP BROADCAST BAR */}
            <header className="relative z-10 flex items-center justify-between px-3 sm:px-8 py-2.5 sm:py-3 border-b border-white/10 bg-slate-950/85 backdrop-blur-md">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black tracking-widest text-red-400 uppercase">
                            {isFinished ? 'FINALIZADO' : 'EN VIVO'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 truncate">
                        <span className="text-[var(--apex-gold)] font-bold">{competitionName}</span>
                        {finalResult?.leg && (
                            <span className="hidden xs:inline px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {finalResult.leg === 1 ? 'Ida' : 'Vuelta'}
                            </span>
                        )}
                        <span className="text-slate-600 hidden sm:inline">•</span>
                        <span className="text-slate-400 hidden sm:inline truncate max-w-[200px]">{stadiumName}</span>
                    </div>
                </div>

                {/* Matchday Controls & Fast Forward */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Live Speed Controls */}
                    {!isFinished && (
                        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/90 border border-white/10 rounded-xl p-0.5 sm:p-1 shadow-sm">
                            {([1, 2, 4] as const).map(spd => (
                                <button
                                    key={spd}
                                    onClick={() => handleSetSpeed(spd)}
                                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] font-black font-mono transition-all ${
                                        speedMultiplier === spd
                                            ? 'bg-yellow-500 text-slate-950 shadow-sm shadow-yellow-500/30'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                    title={`Velocidad ${spd}x`}
                                >
                                    {spd}x
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Palco Mode Toggle */}
                    {!isFinished && (
                        <button
                            onClick={handleTogglePresidential}
                            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all ${
                                presidentialMode
                                    ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]/30 text-[var(--apex-gold)]'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                            title="Pausa interactiva al 45' y 70' para decisiones del presidente"
                        >
                            <span>💼 Palco:</span>
                            <span className="font-black">{presidentialMode ? 'ON' : 'OFF'}</span>
                        </button>
                    )}

                    {/* Match Complete Header Button */}
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
            <section className="relative z-10 px-3 sm:px-8 py-5 sm:py-7 border-b border-white/5 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-transparent">
                <div className="max-w-5xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6 w-full">
                    {/* Home Team */}
                    <div className="min-w-0 w-full flex flex-col items-center sm:items-end text-center sm:text-right overflow-hidden">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 shrink-0 flex items-center justify-center mb-1.5 sm:mb-2.5 drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
                            <TeamLogo team={homeTeam} />
                        </div>
                        <h2 className="text-sm sm:text-xl md:text-2xl font-black tracking-tight text-white truncate max-w-full">
                            {homeTeam.name}
                        </h2>
                        <div className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5 hidden sm:block truncate max-w-full">
                            {homeTeam.coach?.style || 'Equilibrado'} • {homeTeam.coach?.preferredFormation || '4-3-3'}
                        </div>
                        {homeTeam.id === gameState.team.id && (
                            <span className="mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 shrink-0">
                                Tu Club
                            </span>
                        )}
                    </div>

                    {/* Score Center Panel */}
                    <div className="flex flex-col items-center shrink-0 px-2 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-7 py-2 sm:py-3.5 rounded-2xl bg-slate-950/90 border-2 border-slate-800/80 shadow-2xl backdrop-blur-xl">
                            <span className={`text-3xl sm:text-6xl font-mono font-black tracking-tight text-white ${isFinished ? 'text-yellow-400' : ''}`}>
                                {displayScore.home}
                            </span>
                            <span className="text-slate-600 text-xl sm:text-3xl font-light">-</span>
                            <span className={`text-3xl sm:text-6xl font-mono font-black tracking-tight text-white ${isFinished ? 'text-yellow-400' : ''}`}>
                                {displayScore.away}
                            </span>
                        </div>

                        {/* Minute / Status Badge */}
                        <div className="mt-2.5">
                            {isFinished ? (
                                <div className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg ${
                                    playerWon
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/20'
                                        : isDraw
                                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-yellow-500/20'
                                        : 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-red-500/20'
                                }`}>
                                    {playerWon ? '¡Victoria!' : isDraw ? 'Empate' : 'Derrota'} • {totalMatchMinutes}' Final
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                                    <span>{minute === 45 ? 'Entretiempo' : `${minute}'`}</span>
                                </div>
                            )}
                        </div>

                        {/* Derby Badge & Stadium Attendance */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2">
                            {targetStats?.isDerby && (
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-red-600/30 to-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm shadow-red-500/20 animate-pulse">
                                    🔥 {targetStats.derbyName || 'Clásico Histórico'}
                                </span>
                            )}
                            {targetStats?.stadiumAttendance && (
                                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-slate-400 bg-slate-900/80 border border-slate-800">
                                    🏟️ {targetStats.stadiumAttendance.toLocaleString()} hinchas ({targetStats.stadiumOccupancyPct}% aforo)
                                </span>
                            )}
                        </div>

                        {finalResult?.aggregateScore && (
                            <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30 mt-1.5 animate-fade-in">
                                Marcador Global: {finalResult.aggregateScore.home} - {finalResult.aggregateScore.away}
                            </div>
                        )}

                        {isFinished && finalResult?.penalties && (
                            <div className="text-[10px] sm:text-xs font-bold text-yellow-400 mt-1 animate-fade-in">
                                Penales: {finalResult.penalties.home} - {finalResult.penalties.away}
                            </div>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="min-w-0 w-full flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 shrink-0 flex items-center justify-center mb-1.5 sm:mb-2.5 drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
                            <TeamLogo team={awayTeam} />
                        </div>
                        <h2 className="text-sm sm:text-xl md:text-2xl font-black tracking-tight text-white truncate max-w-full">
                            {awayTeam.name}
                        </h2>
                        <div className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5 hidden sm:block truncate max-w-full">
                            {awayTeam.coach?.style || 'Equilibrado'} • {awayTeam.coach?.preferredFormation || '4-3-3'}
                        </div>
                        {awayTeam.id === gameState.team.id && (
                            <span className="mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 shrink-0">
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
                                            <div>{evt.text}</div>
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
                                    <span className="text-slate-500 text-[11px] uppercase">Tiros Totales</span>
                                    <span className="font-mono text-white">{stats.awayShots}</span>
                                </div>
                                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                                    <div className="bg-sky-400 transition-all duration-300" style={{ width: `${(stats.homeShots / Math.max(1, stats.homeShots + stats.awayShots)) * 100}%` }} />
                                    <div className="bg-amber-400 transition-all duration-300" style={{ width: `${(stats.awayShots / Math.max(1, stats.homeShots + stats.awayShots)) * 100}%` }} />
                                </div>
                            </div>

                            {/* Shots on Target */}
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="font-mono text-white">{stats.homeShotsOnTarget}</span>
                                    <span className="text-slate-500 text-[11px] uppercase">Tiros al Arco</span>
                                    <span className="font-mono text-white">{stats.awayShotsOnTarget}</span>
                                </div>
                                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                                    <div className="bg-sky-400 transition-all duration-300" style={{ width: `${(stats.homeShotsOnTarget / Math.max(1, stats.homeShotsOnTarget + stats.awayShotsOnTarget)) * 100}%` }} />
                                    <div className="bg-amber-400 transition-all duration-300" style={{ width: `${(stats.awayShotsOnTarget / Math.max(1, stats.homeShotsOnTarget + stats.awayShotsOnTarget)) * 100}%` }} />
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
