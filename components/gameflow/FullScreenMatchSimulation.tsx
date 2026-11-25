import React, { useState, useEffect, useRef } from 'react';
import { GameState, Team, PlayerMatchResult, MatchLiveStats } from '../../types';
import { GameAction } from '../../state/reducer';
import { TeamLogo } from '../../data/teams/helpers';
import { getTeamStadium } from '../../data/stadiums';
import { playGoalChime, playWhistle } from '../../services/soundService';
import { motion } from 'framer-motion';
import { FastForward, ChevronRight, Shield } from 'lucide-react';

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
    type: 'goal' | 'save' | 'yellow_card' | 'red_card' | 'whistle' | 'normal';
    rawText: string;
    cleanText: string;
    scorerName?: string;
    teamName?: string;
    isHome?: boolean;
}

function formatCompetitionName(raw?: string, isMidweek?: boolean): string {
    if (!raw) return isMidweek ? 'Copa Nacional' : 'Liga';
    const map: Record<string, string> = {
        Torneo_Apertura: 'Torneo Apertura',
        Torneo_Clausura: 'Torneo Clausura',
        Playoffs_Apertura: 'Playoffs Apertura',
        Playoffs_Clausura: 'Playoffs Clausura',
        nacional_primer_ascenso: 'Final 1º Ascenso',
        nacional_reducido: 'Playoff Reducido',
    };
    if (map[raw]) return map[raw];
    return raw.replace(/_/g, ' ');
}

function parseHexRgb(hex?: string): [number, number, number] | null {
    const clean = (hex || '').replace('#', '').trim();
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
    return [
        parseInt(clean.slice(0, 2), 16),
        parseInt(clean.slice(2, 4), 16),
        parseInt(clean.slice(4, 6), 16),
    ];
}

function ensureVisibleAccent(hex: string | undefined, fallback: string): string {
    const rgb = parseHexRgb(hex);
    if (!rgb) return fallback;
    const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    return lum < 0.15 ? fallback : `#${(hex || '').replace('#', '')}`;
}

function resolveMatchColors(home: Team, away: Team): { homeColor: string; awayColor: string } {
    const homeColor = ensureVisibleAccent(home.primaryColor, '#2DD4FF');
    let awayColor = ensureVisibleAccent(away.primaryColor, '#FFC940');

    const hRgb = parseHexRgb(homeColor);
    const aRgb = parseHexRgb(awayColor);
    if (hRgb && aRgb) {
        const dist = Math.hypot(hRgb[0] - aRgb[0], hRgb[1] - aRgb[1], hRgb[2] - aRgb[2]);
        if (dist < 95) {
            const alt = ensureVisibleAccent(away.secondaryColor, '#FFC940');
            const altRgb = parseHexRgb(alt);
            const altDist = altRgb ? Math.hypot(hRgb[0] - altRgb[0], hRgb[1] - altRgb[1], hRgb[2] - altRgb[2]) : 0;
            awayColor = altDist >= 95 ? alt : '#FFC940';
        }
    }
    return { homeColor, awayColor };
}

function sanitizeCommentaryText(raw: string): string {
    return raw
        // Strip leading minute prefix (e.g. "24' ")
        .replace(/^\s*\d+'\s*/, '')
        // Strip raw emojis, broken replacement glyphs and variation selectors
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{FFFD}▯⚽🧤🟨🟥🏟️⏱️🔥]+/gu, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function extractScorerFromText(cleanText: string): string | undefined {
    // Matches patterns like "GOOOOL de Boca Juniors! A. Romero anota..." or "¡GOL! A. Romero..."
    const afterBang = cleanText.match(/!\s*([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ.\s'-]{1,28}?)\s+(?:anota|marca|convierte|define|cabecea|empata|amplía|descuenta|pone)/);
    if (afterBang?.[1]) return afterBang[1].trim();
    return undefined;
}

export const FullScreenMatchSimulation: React.FC<FullScreenMatchSimulationProps> = ({
    gameState,
    pendingResults,
    onMatchComplete,
}) => {
    const finalResult = pendingResults.playerMatchResult;

    const homeTeam: Team =
        (finalResult?.homeTeamId ? gameState.allTeams.find((t) => t.id === finalResult.homeTeamId) : null) ||
        gameState.team;

    const awayTeam: Team =
        (finalResult?.awayTeamId ? gameState.allTeams.find((t) => t.id === finalResult.awayTeamId) : null) ||
        gameState.allTeams.find((t) => t.id !== homeTeam.id) ||
        gameState.team;

    const isHome = homeTeam.id === gameState.team.id;
    const competitionName = formatCompetitionName(finalResult?.competition, gameState.currentTurn === 'midweek');
    const stadiumName = isHome
        ? gameState.stadium?.name || gameState.team.stadiumName || getTeamStadium(gameState.team).name
        : homeTeam.stadiumName || getTeamStadium(homeTeam).name;

    const { homeColor, awayColor } = React.useMemo(
        () => resolveMatchColors(homeTeam, awayTeam),
        [homeTeam, awayTeam]
    );

    const hasExtraTime = (finalResult?.events || []).some((e) => {
        const m = e.match(/^(\d+)'/);
        return m ? parseInt(m[1], 10) > 90 : false;
    });
    const totalMatchMinutes = hasExtraTime ? 120 : 90;

    const [minute, setMinute] = useState(0);
    const [displayScore, setDisplayScore] = useState({ home: 0, away: 0 });
    const [isFinished, setIsFinished] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 4>(() => {
        try {
            const saved = localStorage.getItem('apex_match_speed');
            if (saved === '2') return 2;
            if (saved === '4') return 4;
            return 1;
        } catch {
            return 1;
        }
    });
    const speedMultiplierRef = useRef(speedMultiplier);
    speedMultiplierRef.current = speedMultiplier;

    const currentMinuteRef = useRef(0);
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
            awayFouls: 11,
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
        awayFouls: 0,
    }));
    const [momentum, setMomentum] = useState<number[]>([0]);
    const [isShaking, setIsShaking] = useState(false);
    const [goalPopup, setGoalPopup] = useState<{
        team: Team;
        color: string;
        minute: number;
        scorer?: string;
        text: string;
    } | null>(null);

    const isPausedForGoalRef = useRef(false);
    const stepRef = useRef(0);
    const tickerContainerRef = useRef<HTMLDivElement>(null);
    const processedEventsRef = useRef<Set<string>>(new Set());
    const intervalRef = useRef<any>(null);
    const goalTimeoutRef = useRef<any>(null);

    // Smoothly scroll only inside the ticker list container (never jerking the page viewport)
    useEffect(() => {
        const el = tickerContainerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, [commentary]);

    const parseEvent = React.useCallback(
        (e: string): ParsedEvent => {
            const minMatch = e.match(/^(\d+)'/);
            const min = minMatch ? parseInt(minMatch[1], 10) : 0;
            const lower = e.toLowerCase();

            const isGoal = e.includes('⚽');
            const isRedCard = e.includes('🟥') || lower.includes('tarjeta roja') || lower.includes('expulsión') || lower.includes('expulsado');
            const isYellowCard = !isRedCard && (e.includes('🟨') || lower.includes('tarjeta amarilla') || lower.includes('amonestado'));
            const isSave = !isGoal && (e.includes('🧤') || lower.includes('parada') || lower.includes('atajada') || lower.includes('reflejo'));
            const isWhistle = e.includes('⏱️') || lower.includes('final del partido');

            let type: ParsedEvent['type'] = 'normal';
            if (isGoal) type = 'goal';
            else if (isRedCard) type = 'red_card';
            else if (isYellowCard) type = 'yellow_card';
            else if (isSave) type = 'save';
            else if (isWhistle) type = 'whistle';

            let isHomeAction = false;
            if (isGoal) {
                if (
                    e.includes(`GOOOOL de ${homeTeam.name}`) ||
                    e.includes(`¡GOL EN PRÓRROGA! ${homeTeam.name}`) ||
                    e.includes(`¡GOL DE ${homeTeam.name}`)
                ) {
                    isHomeAction = true;
                } else if (
                    e.includes(`GOOOOL de ${awayTeam.name}`) ||
                    e.includes(`¡GOL EN PRÓRROGA! ${awayTeam.name}`) ||
                    e.includes(`¡GOL DE ${awayTeam.name}`)
                ) {
                    isHomeAction = false;
                } else if (e.includes(homeTeam.name) && !e.includes(awayTeam.name)) {
                    isHomeAction = true;
                } else if (e.includes(awayTeam.name) && !e.includes(homeTeam.name)) {
                    isHomeAction = false;
                } else {
                    isHomeAction = homeTeam.squad.some((p) => e.includes(p.name));
                }
            } else {
                isHomeAction = e.includes(homeTeam.name);
            }

            const cleanText = sanitizeCommentaryText(e);
            const matchedScorer = finalResult?.scorers?.find((s) => s.minute === min)?.playerName || (isGoal ? extractScorerFromText(cleanText) : undefined);

            return {
                minute: min,
                type,
                rawText: e,
                cleanText,
                scorerName: matchedScorer,
                teamName: isHomeAction ? homeTeam.name : awayTeam.name,
                isHome: isHomeAction,
            };
        },
        [homeTeam, awayTeam, finalResult?.scorers]
    );

    const allParsedEvents = React.useMemo(() => {
        if (!finalResult?.events) return [];
        return finalResult.events.map(parseEvent);
    }, [finalResult?.events, parseEvent]);

    const handleSetSpeed = (spd: 1 | 2 | 4) => {
        speedMultiplierRef.current = spd;
        setSpeedMultiplier(spd);
        try {
            localStorage.setItem('apex_match_speed', spd.toString());
        } catch {}
    };

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

        const allRemaining = allParsedEvents.filter((e) => !processedEventsRef.current.has(e.rawText));
        allRemaining.forEach((e) => processedEventsRef.current.add(e.rawText));
        setCommentary((prev) => [
            ...prev,
            ...allRemaining,
            {
                minute: totalMatchMinutes,
                type: 'whistle',
                rawText: '__FT__',
                cleanText: `Final del partido · ${homeTeam.name} ${finalResult.homeScore} - ${finalResult.awayScore} ${awayTeam.name}`,
                isHome: false,
            },
        ]);
    };

    useEffect(() => {
        if (!finalResult) {
            onMatchComplete();
            return;
        }

        const interval = 50;
        const totalBaseSteps = 10000 / interval;
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
                    currentMinuteRef.current + baseMinuteIncrement * (speedMultiplierRef.current || 1)
                );
                const currentMinute = Math.floor(currentMinuteRef.current);
                setMinute(currentMinute);

                const pendingEvents = allParsedEvents.filter(
                    (ev) => ev.minute <= currentMinute && !processedEventsRef.current.has(ev.rawText)
                );

                if (pendingEvents.length > 0) {
                    for (let i = 0; i < pendingEvents.length; i++) {
                        const ev = pendingEvents[i];
                        processedEventsRef.current.add(ev.rawText);
                        setCommentary((prev) => [...prev, ev]);

                        if (ev.type === 'goal' || ev.type === 'save') {
                            setStats((prev) => ({
                                ...prev,
                                homeShots: ev.isHome ? Math.min(targetStats.homeShots, prev.homeShots + 1) : prev.homeShots,
                                awayShots: !ev.isHome ? Math.min(targetStats.awayShots, prev.awayShots + 1) : prev.awayShots,
                                homeShotsOnTarget: ev.isHome
                                    ? Math.min(targetStats.homeShotsOnTarget, prev.homeShotsOnTarget + 1)
                                    : prev.homeShotsOnTarget,
                                awayShotsOnTarget: !ev.isHome
                                    ? Math.min(targetStats.awayShotsOnTarget, prev.awayShotsOnTarget + 1)
                                    : prev.awayShotsOnTarget,
                            }));
                        } else if (ev.type === 'yellow_card' || ev.type === 'red_card') {
                            setStats((prev) => ({
                                ...prev,
                                homeFouls: ev.isHome ? Math.min(targetStats.homeFouls, prev.homeFouls + 1) : prev.homeFouls,
                                awayFouls: !ev.isHome ? Math.min(targetStats.awayFouls, prev.awayFouls + 1) : prev.awayFouls,
                            }));
                        }

                        if (ev.type === 'goal') {
                            isPausedForGoalRef.current = true;
                            clearInterval(intervalRef.current);

                            currentMinuteRef.current = ev.minute;
                            setMinute(ev.minute);

                            const goalsUpToNow = allParsedEvents.filter(
                                (g) => g.type === 'goal' && processedEventsRef.current.has(g.rawText)
                            );
                            setDisplayScore({
                                home: goalsUpToNow.filter((g) => g.isHome).length,
                                away: goalsUpToNow.filter((g) => !g.isHome).length,
                            });

                            playGoalChime();
                            setIsShaking(true);
                            setGoalPopup({
                                team: ev.isHome ? homeTeam : awayTeam,
                                color: ev.isHome ? homeColor : awayColor,
                                minute: ev.minute,
                                scorer: ev.scorerName,
                                text: ev.cleanText,
                            });

                            const celebrationDuration = Math.max(1000, 1750 / (speedMultiplierRef.current === 4 ? 2 : 1));
                            goalTimeoutRef.current = setTimeout(() => {
                                setIsShaking(false);
                                setGoalPopup(null);
                                isPausedForGoalRef.current = false;
                                startSimulationLoop();
                            }, celebrationDuration);

                            return;
                        }
                    }

                    const goalsSoFar = allParsedEvents.filter(
                        (ev) => ev.type === 'goal' && processedEventsRef.current.has(ev.rawText)
                    );
                    setDisplayScore({
                        home: goalsSoFar.filter((g) => g.isHome).length,
                        away: goalsSoFar.filter((g) => !g.isHome).length,
                    });
                }

                if (stepRef.current % 4 === 0) {
                    const matchProgress = Math.min(1, currentMinute / totalMatchMinutes);
                    setStats((prev) => {
                        const shift = Math.random() * 4 - 2;
                        const currentTargetPoss = targetStats.homePossession;
                        const newHomePoss = Math.min(85, Math.max(15, Math.round(currentTargetPoss + shift)));

                        return {
                            homePossession: newHomePoss,
                            awayPossession: 100 - newHomePoss,
                            homeShots: Math.max(prev.homeShots, Math.round(targetStats.homeShots * matchProgress)),
                            awayShots: Math.max(prev.awayShots, Math.round(targetStats.awayShots * matchProgress)),
                            homeShotsOnTarget: Math.max(
                                prev.homeShotsOnTarget,
                                Math.round(targetStats.homeShotsOnTarget * matchProgress)
                            ),
                            awayShotsOnTarget: Math.max(
                                prev.awayShotsOnTarget,
                                Math.round(targetStats.awayShotsOnTarget * matchProgress)
                            ),
                            homeFouls: Math.max(prev.homeFouls, Math.round(targetStats.homeFouls * matchProgress)),
                            awayFouls: Math.max(prev.awayFouls, Math.round(targetStats.awayFouls * matchProgress)),
                        };
                    });

                    setMomentum((prev) => {
                        const last = prev[prev.length - 1] || 0;
                        const change = Math.random() * 20 - 10;
                        return [...prev.slice(-24), Math.max(-50, Math.min(50, last + change))];
                    });
                }

                if (currentMinuteRef.current >= totalMatchMinutes) {
                    clearInterval(intervalRef.current);
                    currentMinuteRef.current = totalMatchMinutes;
                    setMinute(totalMatchMinutes);
                    setDisplayScore({ home: finalResult.homeScore, away: finalResult.awayScore });
                    setStats(targetStats);
                    setIsFinished(true);
                    playWhistle();

                    setCommentary((prev) => [
                        ...prev,
                        {
                            minute: totalMatchMinutes,
                            type: 'whistle',
                            rawText: '__FT__',
                            cleanText: `Final del partido · ${homeTeam.name} ${finalResult.homeScore} - ${finalResult.awayScore} ${awayTeam.name}`,
                            isHome: false,
                        },
                    ]);
                }
            }, interval);
        };

        startSimulationLoop();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (goalTimeoutRef.current) clearTimeout(goalTimeoutRef.current);
        };
    }, [finalResult, targetStats, allParsedEvents, totalMatchMinutes, homeTeam, awayTeam, homeColor, awayColor, onMatchComplete]);

    const playerWon =
        (isHome && displayScore.home > displayScore.away) || (!isHome && displayScore.away > displayScore.home);
    const isDraw = displayScore.home === displayScore.away;

    // Live goals scored up to current clock for scoreboard summary & timeline pins
    const liveGoals = commentary.filter((e) => e.type === 'goal');
    const homeGoals = liveGoals.filter((e) => e.isHome);
    const awayGoals = liveGoals.filter((e) => !e.isHome);
    const timelineEvents = commentary.filter(
        (e) => e.type === 'goal' || e.type === 'yellow_card' || e.type === 'red_card'
    );
    const progressPct = Math.min(100, Math.max(0, (minute / totalMatchMinutes) * 100));

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col bg-[#04060E] text-white overflow-hidden select-none ${
                isShaking ? 'animate-screen-shake' : ''
            }`}
        >
            {/* Broadcast Goal Overlay */}
            {goalPopup && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#03050C]/85 backdrop-blur-md animate-fade-in pointer-events-none px-5">
                    <div
                        aria-hidden
                        className="absolute w-96 h-96 rounded-full blur-3xl opacity-45"
                        style={{
                            background: `radial-gradient(circle, ${goalPopup.color}, rgba(255,201,64,0.35), transparent 70%)`,
                        }}
                    />
                    <div className="relative text-center space-y-3 animate-scale-in max-w-md">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]">
                            <TeamLogo team={goalPopup.team} className="w-full h-full object-contain" />
                        </div>
                        <p className="text-[10px] font-extrabold tracking-[0.38em] uppercase text-[var(--apex-gold)]">
                            Minuto {goalPopup.minute}&apos; · Gol Oficial
                        </p>
                        <h1 className="font-display text-6xl sm:text-8xl font-extrabold italic uppercase tracking-wide text-premium-gradient leading-none drop-shadow-[0_6px_30px_rgba(255,201,64,0.45)]">
                            ¡Gooool!
                        </h1>
                        <p className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
                            {goalPopup.team.name}
                        </p>
                        {goalPopup.scorer && (
                            <p className="text-sm font-extrabold text-[var(--apex-gold-light)] uppercase tracking-wider">
                                {goalPopup.scorer}
                            </p>
                        )}
                        <p className="text-xs text-[var(--apex-text-secondary)] max-w-sm mx-auto leading-relaxed">
                            {goalPopup.text}
                        </p>
                    </div>
                </div>
            )}

            {/* Stadium Pitch Backdrop + Dual Team Ambient Lights */}
            <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-top opacity-55"
                    style={{ backgroundImage: 'url("/assets/bg/match.webp")' }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(4,6,14,0.55) 0%, rgba(4,6,14,0.80) 32%, rgba(4,6,14,0.96) 65%, #04060E 100%)',
                    }}
                />
                <div
                    className="absolute -top-28 left-0 w-1/2 h-80 rounded-full blur-3xl opacity-30"
                    style={{ background: `radial-gradient(closest-side, ${homeColor}, transparent)` }}
                />
                <div
                    className="absolute -top-28 right-0 w-1/2 h-80 rounded-full blur-3xl opacity-30"
                    style={{ background: `radial-gradient(closest-side, ${awayColor}, transparent)` }}
                />
                <div className="apex-grain" />
            </div>

            {/* 1. TOP BROADCAST HEADER */}
            <header className="relative z-10 pt-safe border-b border-white/[0.07] bg-[#050814]/75 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border shrink-0 ${
                                isFinished
                                    ? 'bg-white/10 border-white/20 text-white'
                                    : 'bg-[var(--apex-red)]/15 border-[var(--apex-red)]/40 text-[#FF8CA8]'
                            }`}
                        >
                            {!isFinished && <span className="w-1.5 h-1.5 rounded-full bg-[var(--apex-red)] animate-pulse" />}
                            <span>{isFinished ? 'Finalizado' : minute === 45 ? 'Entretiempo' : 'En Vivo'}</span>
                        </span>

                        <div className="flex items-center gap-2 min-w-0 truncate">
                            <span className="font-display text-sm sm:text-base font-extrabold uppercase tracking-wide text-[var(--apex-gold)] truncate">
                                {competitionName}
                            </span>
                            {finalResult?.leg && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[var(--apex-brand)]/15 text-[#9BEFFF] border border-[var(--apex-brand)]/30 shrink-0">
                                    {finalResult.leg === 1 ? 'Ida' : 'Vuelta'}
                                </span>
                            )}
                            <span className="text-white/20 hidden sm:inline">•</span>
                            <span className="text-xs text-[var(--apex-text-secondary)] hidden sm:inline truncate">
                                {stadiumName}
                            </span>
                        </div>
                    </div>

                    {/* Speed Selector */}
                    {!isFinished && (
                        <div className="flex items-center gap-1 bg-[#0A1022] border border-white/10 rounded-xl p-1 shrink-0">
                            {([1, 2, 4] as const).map((spd) => {
                                const active = speedMultiplier === spd;
                                return (
                                    <button
                                        key={spd}
                                        type="button"
                                        onClick={() => handleSetSpeed(spd)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tabular transition-all cursor-pointer ${
                                            active
                                                ? 'bg-[var(--apex-gold)] text-[#1A1204] shadow-[0_0_12px_rgba(255,201,64,0.4)]'
                                                : 'text-[var(--apex-text-secondary)] hover:text-white'
                                        }`}
                                        title={`Velocidad ${spd}x`}
                                    >
                                        {spd}x
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </header>

            {/* 2. TV SCOREBUG HERO */}
            <section className="relative z-10 px-4 sm:px-6 pt-4 pb-3 border-b border-white/[0.07]">
                <div className="max-w-3xl mx-auto space-y-3">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6">
                        {/* Home Team */}
                        <div className="min-w-0 flex flex-col items-center sm:items-end text-center sm:text-right">
                            <div
                                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl p-2 flex items-center justify-center mb-1.5"
                                style={{
                                    background: `radial-gradient(closest-side, color-mix(in srgb, ${homeColor} 32%, transparent), transparent)`,
                                }}
                            >
                                <TeamLogo
                                    team={homeTeam}
                                    className="w-full h-full object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.8)]"
                                />
                            </div>
                            <h2 className="font-display text-lg sm:text-2xl font-extrabold uppercase tracking-wide text-white truncate max-w-full leading-tight">
                                {homeTeam.name}
                            </h2>
                            {homeTeam.id === gameState.team.id ? (
                                <span className="mt-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest bg-[var(--apex-gold)]/15 text-[var(--apex-gold-light)] border border-[var(--apex-gold)]/35">
                                    Tu Club
                                </span>
                            ) : (
                                <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--apex-text-muted)]">
                                    Local
                                </span>
                            )}
                        </div>

                        {/* Center Score Housing */}
                        <div className="flex flex-col items-center shrink-0">
                            <div
                                className="relative flex items-center gap-3 sm:gap-5 px-4 sm:px-7 py-2 sm:py-3 rounded-2xl overflow-hidden"
                                style={{
                                    background: 'linear-gradient(180deg, rgba(16, 24, 48, 0.92), rgba(7, 11, 22, 0.96))',
                                    border: '1px solid rgba(140, 180, 255, 0.18)',
                                    boxShadow: '0 16px 36px -12px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)',
                                }}
                            >
                                {/* Left & Right Team Color Bars */}
                                <span
                                    aria-hidden
                                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                                    style={{ background: homeColor, boxShadow: `0 0 10px ${homeColor}` }}
                                />
                                <span
                                    aria-hidden
                                    className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full"
                                    style={{ background: awayColor, boxShadow: `0 0 10px ${awayColor}` }}
                                />

                                <span
                                    className={`font-display tabular text-4xl sm:text-6xl font-extrabold leading-none ${
                                        isFinished && displayScore.home > displayScore.away
                                            ? 'text-[var(--apex-gold-light)]'
                                            : 'text-white'
                                    }`}
                                >
                                    {displayScore.home}
                                </span>
                                <span className="font-display text-xl sm:text-3xl font-bold text-white/30">:</span>
                                <span
                                    className={`font-display tabular text-4xl sm:text-6xl font-extrabold leading-none ${
                                        isFinished && displayScore.away > displayScore.home
                                            ? 'text-[var(--apex-gold-light)]'
                                            : 'text-white'
                                    }`}
                                >
                                    {displayScore.away}
                                </span>
                            </div>

                            {/* Live Clock / Final Outcome Pill */}
                            <div className="mt-2">
                                {isFinished ? (
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                                            playerWon
                                                ? 'bg-[var(--apex-green)]/15 text-[var(--apex-green-light)] border-[var(--apex-green)]/40'
                                                : isDraw
                                                ? 'bg-[var(--apex-gold)]/15 text-[var(--apex-gold-light)] border-[var(--apex-gold)]/40'
                                                : 'bg-[var(--apex-red)]/15 text-[#FF8CA8] border-[var(--apex-red)]/40'
                                        }`}
                                    >
                                        {playerWon ? '¡Victoria!' : isDraw ? 'Empate' : 'Derrota'} · {totalMatchMinutes}&apos;
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0D1428] border border-[var(--apex-brand)]/35 text-xs font-display tabular font-extrabold text-[#9BEFFF]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--apex-brand)] animate-ping" />
                                        <span>{minute === 45 ? 'ET' : `${minute}'`}</span>
                                    </span>
                                )}
                            </div>

                            {finalResult?.aggregateScore && (
                                <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-[#9BEFFF]">
                                    Global: {finalResult.aggregateScore.home} - {finalResult.aggregateScore.away}
                                </span>
                            )}
                            {isFinished && finalResult?.penalties && (
                                <span className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--apex-gold)]">
                                    Penales: {finalResult.penalties.home} - {finalResult.penalties.away}
                                </span>
                            )}
                        </div>

                        {/* Away Team */}
                        <div className="min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left">
                            <div
                                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl p-2 flex items-center justify-center mb-1.5"
                                style={{
                                    background: `radial-gradient(closest-side, color-mix(in srgb, ${awayColor} 32%, transparent), transparent)`,
                                }}
                            >
                                <TeamLogo
                                    team={awayTeam}
                                    className="w-full h-full object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.8)]"
                                />
                            </div>
                            <h2 className="font-display text-lg sm:text-2xl font-extrabold uppercase tracking-wide text-white truncate max-w-full leading-tight">
                                {awayTeam.name}
                            </h2>
                            {awayTeam.id === gameState.team.id ? (
                                <span className="mt-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest bg-[var(--apex-gold)]/15 text-[var(--apex-gold-light)] border border-[var(--apex-gold)]/35">
                                    Tu Club
                                </span>
                            ) : (
                                <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--apex-text-muted)]">
                                    Visitante
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Live Goal Scorers Summary under Scoreboard */}
                    {liveGoals.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-white/[0.06] text-[11px]">
                            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-2.5 gap-y-0.5 text-right">
                                {homeGoals.map((g, i) => (
                                    <span key={i} className="text-slate-300 font-semibold">
                                        {g.scorerName || 'Gol'}{' '}
                                        <strong className="text-[var(--apex-gold)] tabular">{g.minute}&apos;</strong>
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-0.5 text-left">
                                {awayGoals.map((g, i) => (
                                    <span key={i} className="text-slate-300 font-semibold">
                                        {g.scorerName || 'Gol'}{' '}
                                        <strong className="text-[var(--apex-gold)] tabular">{g.minute}&apos;</strong>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Match Timeline Progress Bar (0' — 45' — 90') */}
                    <div className="pt-1">
                        <div className="relative h-1.5 rounded-full bg-white/[0.07] overflow-visible">
                            {/* Half-time marker */}
                            <span
                                aria-hidden
                                className="absolute top-0 bottom-0 w-px bg-white/20"
                                style={{ left: `${(45 / totalMatchMinutes) * 100}%` }}
                            />
                            {/* Active progress fill */}
                            <div
                                className="h-full rounded-full transition-all duration-150"
                                style={{
                                    width: `${progressPct}%`,
                                    background: 'linear-gradient(90deg, var(--apex-brand), var(--apex-gold))',
                                }}
                            />
                            {/* Event pins */}
                            {timelineEvents.map((ev, i) => {
                                const leftPct = Math.min(99, Math.max(1, (ev.minute / totalMatchMinutes) * 100));
                                const pinColor =
                                    ev.type === 'goal'
                                        ? '#FFC940'
                                        : ev.type === 'red_card'
                                        ? '#FF3D6E'
                                        : '#FACC15';
                                return (
                                    <span
                                        key={i}
                                        title={`${ev.minute}'`}
                                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-[#04060E]"
                                        style={{ left: `${leftPct}%`, background: pinColor }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. MAIN BODY (Commentary Ticker & Live Stats) */}
            <main className="relative z-10 flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 sm:px-6 py-3 overflow-hidden min-h-0">
                {/* Mobile Sliding Tab Switcher */}
                <div
                    className="grid md:hidden grid-cols-2 p-1 rounded-2xl border border-white/10 bg-[#080D1B]/90 backdrop-blur-md mb-3 shrink-0"
                    role="tablist"
                >
                    {[
                        { id: 'ticker' as const, label: `Minuto a Minuto (${commentary.length})` },
                        { id: 'stats' as const, label: 'Estadísticas' },
                    ].map((t) => {
                        const active = activeTab === t.id;
                        return (
                            <button
                                key={t.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setActiveTab(t.id)}
                                className="relative py-2 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
                            >
                                {active && (
                                    <motion.div
                                        layoutId="matchSimTab"
                                        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                                        className="absolute inset-0 rounded-xl"
                                        style={{
                                            background:
                                                'linear-gradient(180deg, rgba(45,212,255,0.20), rgba(61,123,255,0.08))',
                                            border: '1px solid rgba(45,212,255,0.40)',
                                        }}
                                    />
                                )}
                                <span
                                    className="relative z-10"
                                    style={{ color: active ? '#FFFFFF' : 'var(--apex-text-muted)' }}
                                >
                                    {t.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
                    {/* Commentary Column */}
                    <div
                        className={`md:col-span-7 apex-card flex flex-col overflow-hidden min-h-0 ${
                            activeTab !== 'ticker' ? 'hidden md:flex' : 'flex'
                        }`}
                    >
                        <div className="px-4 py-2.5 border-b border-white/[0.07] bg-black/25 flex items-center justify-between shrink-0">
                            <span className="font-display text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                                <span className="apex-live-dot" />
                                Relato en Directo
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--apex-text-muted)] tabular">
                                {commentary.length} acciones
                            </span>
                        </div>

                        <div
                            ref={tickerContainerRef}
                            className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-2.5"
                        >
                            {commentary.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-[var(--apex-text-muted)] py-12">
                                    <div className="w-8 h-8 border-2 border-white/10 border-t-[var(--apex-brand)] rounded-full animate-spin mb-3" />
                                    <p className="text-xs font-extrabold uppercase tracking-widest text-white/80">
                                        Equipos en el campo
                                    </p>
                                    <p className="text-[11px] text-[var(--apex-text-muted)] mt-0.5">
                                        Aguardando el pitido inicial…
                                    </p>
                                </div>
                            ) : (
                                commentary.map((evt, idx) => {
                                    const evtTeam = evt.isHome ? homeTeam : awayTeam;
                                    const evtColor = evt.isHome ? homeColor : awayColor;

                                    if (evt.type === 'goal') {
                                        return (
                                            <div
                                                key={idx}
                                                className="relative overflow-hidden rounded-xl p-3.5 border border-[var(--apex-gold)]/45 animate-fade-in"
                                                style={{
                                                    background: `radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, ${evtColor} 24%, transparent), transparent 65%), linear-gradient(165deg, rgba(255, 201, 64, 0.14), rgba(10, 15, 30, 0.95))`,
                                                }}
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                                            <TeamLogo team={evtTeam} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="font-display text-sm font-extrabold italic uppercase tracking-wider text-[var(--apex-gold-light)]">
                                                            ¡Gol de {evtTeam.name}!
                                                        </span>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-md bg-[var(--apex-gold)] text-[#1A1204] font-display tabular text-xs font-extrabold shrink-0">
                                                        {evt.minute}&apos;
                                                    </span>
                                                </div>
                                                <p className="text-xs font-semibold text-white leading-relaxed">
                                                    {evt.cleanText}
                                                </p>
                                            </div>
                                        );
                                    }

                                    if (evt.type === 'whistle') {
                                        return (
                                            <div
                                                key={idx}
                                                className="py-2.5 px-4 rounded-xl bg-white/[0.06] border border-white/15 text-center animate-fade-in"
                                            >
                                                <span className="font-display text-sm font-extrabold uppercase tracking-wider text-[var(--apex-gold-light)]">
                                                    {evt.cleanText}
                                                </span>
                                            </div>
                                        );
                                    }

                                    const isYellow = evt.type === 'yellow_card';
                                    const isRed = evt.type === 'red_card';
                                    const isSave = evt.type === 'save';

                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-colors animate-fade-in ${
                                                isRed
                                                    ? 'bg-[var(--apex-red)]/10 border-[var(--apex-red)]/35'
                                                    : isYellow
                                                    ? 'bg-[var(--apex-gold)]/[0.07] border-[var(--apex-gold)]/25'
                                                    : isSave
                                                    ? 'bg-[var(--apex-brand)]/[0.07] border-[var(--apex-brand)]/25'
                                                    : 'bg-white/[0.025] border-white/[0.06]'
                                            }`}
                                        >
                                            {/* Clean Single Minute Badge */}
                                            <span className="font-display tabular text-sm font-extrabold text-[var(--apex-text-secondary)] w-8 shrink-0 pt-0.5">
                                                {evt.minute}&apos;
                                            </span>

                                            {/* Custom Graphic Indicator (No Emojis / No Broken Glyphs) */}
                                            <div className="pt-1 shrink-0">
                                                {isYellow ? (
                                                    <span
                                                        aria-label="Tarjeta amarilla"
                                                        className="block w-3 h-4 rounded-[2px] bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.55)]"
                                                    />
                                                ) : isRed ? (
                                                    <span
                                                        aria-label="Tarjeta roja"
                                                        className="block w-3 h-4 rounded-[2px] bg-[#FF3D6E] shadow-[0_0_8px_rgba(255,61,110,0.65)]"
                                                    />
                                                ) : isSave ? (
                                                    <Shield className="w-3.5 h-3.5 text-[var(--apex-brand)]" />
                                                ) : (
                                                    <span
                                                        className="block w-1.5 h-1.5 rounded-full mt-1"
                                                        style={{ background: evtColor }}
                                                    />
                                                )}
                                            </div>

                                            <p className="flex-1 text-xs text-slate-200 leading-relaxed">
                                                {evt.cleanText}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Stats & Momentum Column */}
                    <div
                        className={`md:col-span-5 flex flex-col gap-3.5 overflow-y-auto min-h-0 ${
                            activeTab !== 'stats' ? 'hidden md:flex' : 'flex'
                        }`}
                    >
                        {/* Team Color Legend & Possession */}
                        <div className="apex-card p-4 space-y-2.5">
                            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[var(--apex-text-secondary)]">
                                <span className="flex items-center gap-1.5 truncate">
                                    <span className="w-2 h-2 rounded-full" style={{ background: homeColor }} />
                                    <span className="truncate">{homeTeam.shortName || homeTeam.name}</span>
                                </span>
                                <span>Posesión</span>
                                <span className="flex items-center gap-1.5 truncate">
                                    <span className="truncate">{awayTeam.shortName || awayTeam.name}</span>
                                    <span className="w-2 h-2 rounded-full" style={{ background: awayColor }} />
                                </span>
                            </div>

                            <div className="flex items-baseline justify-between">
                                <span className="font-display tabular text-2xl font-extrabold text-white">
                                    {Math.round(stats.homePossession)}%
                                </span>
                                <span className="font-display tabular text-2xl font-extrabold text-white">
                                    {Math.round(stats.awayPossession)}%
                                </span>
                            </div>

                            <div className="h-2.5 bg-black/40 rounded-full overflow-hidden flex p-0.5 gap-1 border border-white/[0.06]">
                                <div
                                    className="h-full rounded-l-full transition-all duration-500"
                                    style={{ width: `${stats.homePossession}%`, background: homeColor }}
                                />
                                <div
                                    className="h-full rounded-r-full transition-all duration-500"
                                    style={{ width: `${stats.awayPossession}%`, background: awayColor }}
                                />
                            </div>
                        </div>

                        {/* Comparative Match Metrics */}
                        <div className="apex-card p-4 space-y-3.5">
                            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-white">
                                Estadísticas del Encuentro
                            </h3>

                            {[
                                { label: 'Tiros Totales', home: stats.homeShots, away: stats.awayShots },
                                { label: 'Tiros al Arco', home: stats.homeShotsOnTarget, away: stats.awayShotsOnTarget },
                                { label: 'Faltas Cometidas', home: stats.homeFouls, away: stats.awayFouls },
                            ].map((row) => {
                                const total = Math.max(1, row.home + row.away);
                                const homePct = (row.home / total) * 100;
                                const awayPct = (row.away / total) * 100;
                                return (
                                    <div key={row.label} className="space-y-1">
                                        <div className="flex items-baseline justify-between text-xs">
                                            <span className="font-display tabular text-base font-extrabold text-white">
                                                {row.home}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--apex-text-secondary)]">
                                                {row.label}
                                            </span>
                                            <span className="font-display tabular text-base font-extrabold text-white">
                                                {row.away}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden flex gap-0.5">
                                            <div
                                                className="h-full rounded-l-full transition-all duration-300"
                                                style={{ width: `${homePct}%`, background: homeColor }}
                                            />
                                            <div
                                                className="h-full rounded-r-full transition-all duration-300"
                                                style={{ width: `${awayPct}%`, background: awayColor }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Momentum Rhythm */}
                            <div className="pt-3 border-t border-white/[0.07]">
                                <div className="flex justify-between text-[9px] font-extrabold text-[var(--apex-text-muted)] uppercase tracking-widest mb-1.5">
                                    <span>Dominio {homeTeam.shortName || 'Local'}</span>
                                    <span>Dominio {awayTeam.shortName || 'Visita'}</span>
                                </div>
                                <div className="flex items-end justify-center gap-1 h-11 bg-black/35 rounded-xl p-2 border border-white/[0.05]">
                                    {momentum.map((val, i) => (
                                        <div
                                            key={i}
                                            className="w-full rounded-sm transition-all duration-300"
                                            style={{
                                                height: `${Math.max(12, Math.min(100, Math.abs(val) * 2))}%`,
                                                background: val >= 0 ? homeColor : awayColor,
                                                opacity: 0.35 + (i / momentum.length) * 0.65,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 4. BOTTOM BROADCAST CONTROL BAR */}
            <footer className="relative z-10 pb-safe border-t border-white/[0.07] bg-[#050814]/85 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--apex-text-muted)]">
                            {isFinished
                                ? 'Tiempo Cumplido'
                                : minute < 45
                                ? 'Primer Tiempo'
                                : minute === 45
                                ? 'Descanso'
                                : minute <= 90
                                ? 'Segundo Tiempo'
                                : 'Tiempo Suplementario'}
                        </p>
                        <p className="text-xs font-bold text-white truncate">
                            {isFinished
                                ? `${homeTeam.name} ${displayScore.home} - ${displayScore.away} ${awayTeam.name}`
                                : targetStats?.stadiumAttendance
                                ? `${ stadiumName } · ${targetStats.stadiumAttendance.toLocaleString()} espectadores`
                                : stadiumName}
                        </p>
                    </div>

                    {isFinished ? (
                        <button
                            type="button"
                            onClick={onMatchComplete}
                            className="apex-btn-gold apex-shine !w-auto !py-2.5 !px-5 !text-xs shrink-0"
                        >
                            <span>Continuar</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSkipToEnd}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-extrabold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
                        >
                            <FastForward className="w-3.5 h-3.5 text-[var(--apex-brand)]" />
                            <span>Saltar al Final</span>
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};
