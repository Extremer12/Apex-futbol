import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Player, Team } from '../../types';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { TeamLogo } from '../../data/teams/helpers';

export type HighlightPlayType = 
    | 'THROUGH_BALL_1V1' 
    | 'WING_CROSS_HEADER' 
    | 'LONG_RANGE_STRIKE' 
    | 'PENALTY_KICK' 
    | 'MIRACLE_SAVE';

export interface MatchHighlightData {
    minute: number;
    type: 'goal' | 'save';
    text: string;
    isHome: boolean;
    homeTeam: Team;
    awayTeam: Team;
    scorer?: Player | null;
    assister?: Player | null;
    playType?: HighlightPlayType;
}

export interface MatchHighlight2DProps {
    highlight: MatchHighlightData;
    onComplete: () => void;
    autoPlay?: boolean;
}

// Math helpers
const clamp = (val: number, min = 0, max = 1) => Math.max(min, Math.min(max, val));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t);
const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const easeOutQuad = (t: number) => t * (2 - t);
const easeInQuad = (t: number) => t * t;
const easeOutCubic = (t: number) => (--t) * t * t + 1;

interface Position2D {
    x: number;
    y: number;
    z?: number;
}

interface PlayerActor {
    id: string;
    name: string;
    number: string;
    isAttacker: boolean;
    isGoalkeeper?: boolean;
    isKeyActor?: boolean;
    x: number;
    y: number;
    role: 'scorer' | 'assister' | 'striker2' | 'mid' | 'gk' | 'cb1' | 'cb2' | 'fb';
    facingAngle?: number;
}

export const MatchHighlight2D: React.FC<MatchHighlight2DProps> = ({
    highlight,
    onComplete,
    autoPlay = true,
}) => {
    const { isHome, homeTeam, awayTeam, minute, text, type } = highlight;
    const attackingTeam = isHome ? homeTeam : awayTeam;
    const defendingTeam = isHome ? awayTeam : homeTeam;

    // Resolve Scorer & Assister from squads if not explicitly given
    const scorer = useMemo(() => {
        if (highlight.scorer) return highlight.scorer;
        // Search by name in event text
        const found = attackingTeam.squad.find(p => text.includes(p.name));
        if (found) return found;
        // Fallback: highest rated forward
        const fwds = attackingTeam.squad.filter(p => p.position === 'DEL');
        return fwds[0] || attackingTeam.squad[0];
    }, [highlight.scorer, attackingTeam, text]);

    const assister = useMemo(() => {
        if (highlight.assister) return highlight.assister;
        // Check for "(Asistencia de X)"
        const assistMatch = text.match(/Asistencia de ([^)]+)/);
        if (assistMatch) {
            const aName = assistMatch[1].trim();
            const found = attackingTeam.squad.find(p => p.name.includes(aName) || aName.includes(p.name));
            if (found) return found;
        }
        // Fallback midfielder
        const mids = attackingTeam.squad.filter(p => p.position === 'CEN' && p.id !== scorer?.id);
        return mids[0] || null;
    }, [highlight.assister, attackingTeam, scorer, text]);

    const goalkeeper = useMemo(() => {
        const gk = defendingTeam.squad.find(p => p.position === 'POR');
        return gk || defendingTeam.squad[0];
    }, [defendingTeam]);

    const defendingCBs = useMemo(() => {
        const defs = defendingTeam.squad.filter(p => p.position === 'DEF');
        return [
            defs[0] || { name: 'Defensor 1', number: '2', id: 991 },
            defs[1] || { name: 'Defensor 2', number: '6', id: 992 },
            defs[2] || { name: 'Lateral', number: '3', id: 993 }
        ];
    }, [defendingTeam]);

    // Determine play type
    const playType: HighlightPlayType = useMemo(() => {
        if (highlight.playType) return highlight.playType;
        if (type === 'save') return 'MIRACLE_SAVE';
        const lower = text.toLowerCase();
        if (lower.includes('penal') || lower.includes('penalti')) return 'PENALTY_KICK';
        if (lower.includes('centro') || lower.includes('cabeza') || lower.includes('cabezazo') || lower.includes('asistencia')) {
            return 'WING_CROSS_HEADER';
        }
        if (lower.includes('fuera del área') || lower.includes('misil') || lower.includes('bombazo') || lower.includes('lejano')) {
            return 'LONG_RANGE_STRIKE';
        }
        // Alternate based on minute
        return minute % 2 === 0 ? 'THROUGH_BALL_1V1' : 'WING_CROSS_HEADER';
    }, [highlight.playType, type, text, minute]);

    // Animation progress (0.0 to 1.0)
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [speed, setSpeed] = useState<1 | 1.5>(1);
    const animFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const durationMs = 4500 / speed;

    // Goal celebration banner visibility
    const [showGoalFlash, setShowGoalFlash] = useState(false);

    // Main animation loop using requestAnimationFrame
    useEffect(() => {
        if (!isPlaying) return;

        const animate = (timestamp: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = timestamp - (progress * durationMs);
            }
            const elapsed = timestamp - startTimeRef.current;
            const currentProgress = clamp(elapsed / durationMs, 0, 1);

            setProgress(currentProgress);

            if (currentProgress >= 1) {
                setIsPlaying(false);
                // Keep showing final state briefly before calling onComplete if desired
            } else {
                animFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isPlaying, durationMs, speed]);

    // Handle play / pause toggle
    const togglePlay = () => {
        if (progress >= 1) {
            // Replay from start
            startTimeRef.current = null;
            setProgress(0);
            setIsPlaying(true);
        } else {
            if (isPlaying) {
                setIsPlaying(false);
                if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            } else {
                startTimeRef.current = null;
                setIsPlaying(true);
            }
        }
    };

    const handleRestart = () => {
        startTimeRef.current = null;
        setProgress(0);
        setIsPlaying(true);
    };

    // Keyboard controls (Space to pause/play, ESC to skip)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onComplete();
            } else if (e.key === ' ') {
                e.preventDefault();
                togglePlay();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onComplete, isPlaying, progress]);

    // Team Colors with fallbacks
    const attPrimary = attackingTeam.primaryColor || '#2563eb';
    const attSecondary = attackingTeam.secondaryColor || '#ffffff';
    const defPrimary = defendingTeam.primaryColor || '#dc2626';
    const defSecondary = defendingTeam.secondaryColor || '#ffffff';

    // =========================================================================
    // CHOREOGRAPHY ENGINE (Calculates positions based on progress t: 0 -> 1)
    // =========================================================================
    const sceneState = useMemo(() => {
        const t = progress;
        let ball: Position2D & { inNet?: boolean; hasImpacted?: boolean } = { x: 0, y: 0, z: 0 };
        let players: PlayerActor[] = [];
        let netDistortion = 0;
        let playSubtitle = '';
        let phaseDescription = '';

        // Extract clean surnames
        const scorerName = scorer?.name.split(' ').slice(-1)[0] || 'Goleador';
        const assisterName = assister?.name.split(' ').slice(-1)[0] || 'Asistidor';
        const gkName = goalkeeper?.name.split(' ').slice(-1)[0] || 'Arquero';
        const cb1Name = defendingCBs[0]?.name.split(' ').slice(-1)[0] || 'Defensa';
        const cb2Name = defendingCBs[1]?.name.split(' ').slice(-1)[0] || 'Central';

        // -------------------------------------------------------------
        // 1. THROUGH BALL 1v1 (Pase filtrado y definicion)
        // -------------------------------------------------------------
        if (playType === 'THROUGH_BALL_1V1') {
            playSubtitle = `Pase entre líneas y definición cruzada de ${scorerName}`;

            // Phase 1: Assister drives & passes (t: 0 -> 0.35)
            // Phase 2: Scorer sprints onto ball, 1v1 with rushing GK (t: 0.35 -> 0.68)
            // Phase 3: Shot, ball flies into net, keeper dives (t: 0.68 -> 0.82)
            // Phase 4: Net ripple & celebration (t: 0.82 -> 1.0)

            const assisterX = lerp(340, 420, easeOutQuad(clamp(t / 0.35)));
            const assisterY = lerp(310, 290, easeOutQuad(clamp(t / 0.35)));

            // Scorer makes bursting diagonal run
            let scorerX = 460;
            let scorerY = 200;
            if (t < 0.35) {
                scorerX = lerp(460, 560, easeInQuad(t / 0.35));
                scorerY = lerp(200, 225, t / 0.35);
            } else if (t < 0.68) {
                const subT = (t - 0.35) / 0.33;
                scorerX = lerp(560, 720, easeOutQuad(subT));
                scorerY = lerp(225, 240, subT);
            } else {
                // Post shot celebration
                const subT = (t - 0.68) / 0.32;
                scorerX = lerp(720, 810, easeOutQuad(subT));
                scorerY = lerp(240, 160, easeOutQuad(subT)); // run towards corner
            }

            // Goalkeeper
            let gkX = 855;
            let gkY = 270;
            if (t >= 0.40 && t < 0.68) {
                const subT = (t - 0.40) / 0.28;
                gkX = lerp(855, 790, easeOutQuad(subT));
                gkY = lerp(270, 255, subT);
            } else if (t >= 0.68) {
                // Dives toward bottom corner
                const subT = (t - 0.68) / 0.16;
                gkX = lerp(790, 830, easeOutQuad(subT));
                gkY = lerp(255, 290, easeOutQuad(subT));
            }

            // Ball Position
            if (t < 0.32) {
                // At assister's feet
                ball = { x: assisterX + 10, y: assisterY - 2, z: 0 };
                phaseDescription = `${assisterName} conduce y observa el desmarque...`;
            } else if (t < 0.52) {
                // Through ball travelling
                const subT = (t - 0.32) / 0.20;
                ball = {
                    x: lerp(assisterX + 10, 640, easeOutQuad(subT)),
                    y: lerp(assisterY - 2, 235, subT),
                    z: Math.sin(subT * Math.PI) * 4 // slight grass hop
                };
                phaseDescription = `¡Pase filtrado milimétrico para ${scorerName}!`;
            } else if (t < 0.68) {
                // Scorer dribbles
                ball = { x: scorerX + 12, y: scorerY + 4, z: 0 };
                phaseDescription = `¡Mano a mano! ${scorerName} encara a ${gkName}...`;
            } else if (t < 0.82) {
                // Shot travels into the far corner net
                const subT = (t - 0.68) / 0.14;
                ball = {
                    x: lerp(732, 878, easeOutQuad(subT)),
                    y: lerp(244, 305, easeOutQuad(subT)),
                    z: lerp(0, 16, subT)
                };
                phaseDescription = `¡Definió con categoría al palo más lejano!`;
            } else {
                // Ball inside net
                ball = { x: 880, y: 308, z: 4, inNet: true, hasImpacted: true };
                phaseDescription = `¡GOOOOOL! Impecable resolución.`;
                const netTime = (t - 0.82) / 0.18;
                netDistortion = Math.sin(netTime * Math.PI * 4) * (1 - netTime) * 14;
            }

            players = [
                { id: 'att1', name: assisterName, number: '10', isAttacker: true, role: 'assister', x: assisterX, y: assisterY },
                { id: 'att2', name: scorerName, number: '9', isAttacker: true, role: 'scorer', isKeyActor: true, x: scorerX, y: scorerY },
                { id: 'att3', name: 'Extremo', number: '7', isAttacker: true, role: 'striker2', x: lerp(450, 590, t * 0.7), y: 390 },
                { id: 'gk', name: gkName, number: '1', isAttacker: false, isGoalkeeper: true, role: 'gk', x: gkX, y: gkY },
                { id: 'cb1', name: cb1Name, number: '2', isAttacker: false, role: 'cb1', x: lerp(550, 680, easeOutQuad(t * 0.8)), y: 220 },
                { id: 'cb2', name: cb2Name, number: '6', isAttacker: false, role: 'cb2', x: lerp(580, 710, easeOutQuad(t * 0.7)), y: 320 },
            ];
        }

        // -------------------------------------------------------------
        // 2. WING CROSS & HEADER (Desborde y cabezazo)
        // -------------------------------------------------------------
        else if (playType === 'WING_CROSS_HEADER') {
            playSubtitle = `Centro aéreo de ${assisterName} y cabezazo de ${scorerName}`;

            // Phase 1: Winger sprints down the sideline (t: 0 -> 0.38)
            // Phase 2: Aerial cross curving in with high Z (t: 0.38 -> 0.68)
            // Phase 3: Striker headers into top corner (t: 0.68 -> 0.82)
            // Phase 4: Net shake & celebration (t: 0.82 -> 1.0)

            const wingerX = lerp(440, 740, easeOutQuad(clamp(t / 0.38)));
            const wingerY = lerp(450, 440, clamp(t / 0.38));

            // Scorer movements in the box
            let scorerX = 640;
            let scorerY = 260;
            if (t < 0.38) {
                scorerX = lerp(600, 660, t / 0.38);
                scorerY = 260;
            } else if (t < 0.68) {
                const subT = (t - 0.38) / 0.30;
                scorerX = lerp(660, 730, easeOutQuad(subT));
                scorerY = lerp(260, 245, subT);
            } else {
                const subT = (t - 0.68) / 0.32;
                scorerX = lerp(730, 770, easeOutQuad(subT));
                scorerY = lerp(245, 170, easeOutQuad(subT)); // celebration run
            }

            // Goalkeeper
            let gkX = 855;
            let gkY = 270;
            if (t >= 0.45 && t < 0.68) {
                gkY = lerp(270, 280, (t - 0.45) / 0.23); // tracks the cross
            } else if (t >= 0.68) {
                // Dives up towards top corner
                const subT = (t - 0.68) / 0.16;
                gkX = lerp(855, 845, easeOutQuad(subT));
                gkY = lerp(280, 230, easeOutQuad(subT));
            }

            // Ball Position
            if (t < 0.36) {
                ball = { x: wingerX + 10, y: wingerY - 2, z: 0 };
                phaseDescription = `¡${assisterName} gana la banda y se prepara para centrar!`;
            } else if (t < 0.68) {
                // High arc cross
                const subT = (t - 0.36) / 0.32;
                const arcZ = Math.sin(subT * Math.PI) * 48; // flies high!
                ball = {
                    x: lerp(wingerX + 10, 730, subT),
                    y: lerp(wingerY - 2, 245, easeOutQuad(subT)),
                    z: arcZ
                };
                phaseDescription = `¡Centro quirúrgico al corazón del área!`;
            } else if (t < 0.80) {
                // Header rocket into top corner
                const subT = (t - 0.68) / 0.12;
                ball = {
                    x: lerp(730, 878, easeOutQuad(subT)),
                    y: lerp(245, 222, easeOutQuad(subT)),
                    z: lerp(22, 14, subT)
                };
                phaseDescription = `¡${scorerName} se eleva y mete un frentazo letal!`;
            } else {
                ball = { x: 880, y: 222, z: 12, inNet: true, hasImpacted: true };
                phaseDescription = `¡GOOOLAZO! Inalcanzable para el portero.`;
                const netTime = (t - 0.80) / 0.20;
                netDistortion = Math.sin(netTime * Math.PI * 4) * (1 - netTime) * 16;
            }

            players = [
                { id: 'att1', name: assisterName, number: '11', isAttacker: true, role: 'assister', x: wingerX, y: wingerY },
                { id: 'att2', name: scorerName, number: '9', isAttacker: true, role: 'scorer', isKeyActor: true, x: scorerX, y: scorerY },
                { id: 'att3', name: 'Volante', number: '8', isAttacker: true, role: 'mid', x: lerp(500, 620, t * 0.6), y: 310 },
                { id: 'gk', name: gkName, number: '1', isAttacker: false, isGoalkeeper: true, role: 'gk', x: gkX, y: gkY },
                { id: 'cb1', name: cb1Name, number: '2', isAttacker: false, role: 'cb1', x: lerp(680, 725, t * 0.6), y: 255 },
                { id: 'cb2', name: cb2Name, number: '3', isAttacker: false, role: 'cb2', x: lerp(480, 660, easeOutQuad(t * 0.5)), y: 410 },
            ];
        }

        // -------------------------------------------------------------
        // 3. LONG RANGE STRIKE (Bombazo desde fuera del area)
        // -------------------------------------------------------------
        else if (playType === 'LONG_RANGE_STRIKE') {
            playSubtitle = `Misil teledirigido al ángulo de ${scorerName}`;

            // Phase 1: Attacker receives & creates space (t: 0 -> 0.38)
            // Phase 2: Rocket shot with speed curve into upper 90 (t: 0.38 -> 0.65)
            // Phase 3: Keeper flying dive, ball clips crossbar into net (t: 0.65 -> 0.80)
            // Phase 4: Celebration (t: 0.80 -> 1.0)

            const scorerX = lerp(500, 590, easeOutQuad(clamp(t / 0.38)));
            const scorerY = lerp(290, 260, clamp(t / 0.38));

            // Goalkeeper athletic flying dive
            let gkX = 855;
            let gkY = 270;
            if (t >= 0.42 && t < 0.70) {
                const subT = (t - 0.42) / 0.28;
                gkX = lerp(855, 835, easeOutQuad(subT));
                gkY = lerp(270, 220, easeOutQuad(subT));
            }

            // Ball Position
            if (t < 0.38) {
                ball = { x: scorerX + 12, y: scorerY + 4, z: 0 };
                phaseDescription = `¡${scorerName} se perfila para la pierna hábil!`;
            } else if (t < 0.64) {
                // Rocket shot travelling
                const subT = (t - 0.38) / 0.26;
                ball = {
                    x: lerp(602, 876, easeInQuad(subT)),
                    y: lerp(264, 218, easeOutQuad(subT)),
                    z: lerp(0, 26, subT)
                };
                phaseDescription = `¡¡QUÉ BOMBAZO SACÓ DESDE LEJOS!!`;
            } else {
                ball = { x: 882, y: 218, z: 24, inNet: true, hasImpacted: true };
                phaseDescription = `¡¡AL ÁNGULO!! ¡GOLAZO MONUMENTAL!`;
                const netTime = (t - 0.64) / 0.36;
                netDistortion = Math.sin(netTime * Math.PI * 5) * (1 - netTime) * 18;
            }

            players = [
                { id: 'att1', name: scorerName, number: '10', isAttacker: true, role: 'scorer', isKeyActor: true, x: scorerX, y: scorerY },
                { id: 'att2', name: 'Delantero', number: '9', isAttacker: true, role: 'striker2', x: lerp(660, 710, t * 0.4), y: 190 },
                { id: 'gk', name: gkName, number: '1', isAttacker: false, isGoalkeeper: true, role: 'gk', x: gkX, y: gkY },
                { id: 'cb1', name: cb1Name, number: '2', isAttacker: false, role: 'cb1', x: lerp(630, 650, t * 0.3), y: 255 },
                { id: 'cb2', name: cb2Name, number: '6', isAttacker: false, role: 'cb2', x: 670, y: 320 },
            ];
        }

        // -------------------------------------------------------------
        // 4. PENALTY KICK (Tiro penal)
        // -------------------------------------------------------------
        else if (playType === 'PENALTY_KICK') {
            playSubtitle = `Definición desde los doce pasos de ${scorerName}`;

            // Penalty spot is at (720, 270)
            const runUpProgress = clamp(t / 0.40);
            const scorerX = lerp(660, 715, easeInQuad(runUpProgress));
            const scorerY = lerp(270, 270, runUpProgress);

            // Goalkeeper dives left (downwards in Y)
            let gkX = 855;
            let gkY = 270;
            if (t >= 0.36 && t < 0.65) {
                const subT = (t - 0.36) / 0.29;
                gkX = lerp(855, 840, easeOutQuad(subT));
                gkY = lerp(270, 315, easeOutQuad(subT)); // dives bottom corner
            }

            // Ball Position
            if (t < 0.40) {
                ball = { x: 720, y: 270, z: 0 };
                phaseDescription = `${scorerName} toma carrera concentrado...`;
            } else if (t < 0.60) {
                // Ball flies into top corner (away from keeper)
                const subT = (t - 0.40) / 0.20;
                ball = {
                    x: lerp(720, 878, easeOutQuad(subT)),
                    y: lerp(270, 225, easeOutQuad(subT)),
                    z: lerp(0, 15, subT)
                };
                phaseDescription = `¡Engañó completamente al portero!`;
            } else {
                ball = { x: 880, y: 225, z: 12, inNet: true, hasImpacted: true };
                phaseDescription = `¡GOOOOOL DE PENAL! Gran templanza.`;
                const netTime = (t - 0.60) / 0.40;
                netDistortion = Math.sin(netTime * Math.PI * 4) * (1 - netTime) * 15;
            }

            players = [
                { id: 'att1', name: scorerName, number: '9', isAttacker: true, role: 'scorer', isKeyActor: true, x: scorerX, y: scorerY },
                { id: 'gk', name: gkName, number: '1', isAttacker: false, isGoalkeeper: true, role: 'gk', x: gkX, y: gkY },
                { id: 'cb1', name: cb1Name, number: '2', isAttacker: false, role: 'cb1', x: 590, y: 230 },
                { id: 'att2', name: 'Compañero', number: '8', isAttacker: true, role: 'mid', x: 590, y: 310 },
            ];
        }

        // -------------------------------------------------------------
        // 5. MIRACLE SAVE (Atajada impresionante)
        // -------------------------------------------------------------
        else {
            playSubtitle = `¡Atajada espectacular de ${gkName} a quemarropa!`;

            const attackerX = lerp(620, 710, easeOutQuad(clamp(t / 0.38)));
            const attackerY = lerp(240, 250, clamp(t / 0.38));

            // Goalkeeper heroic leap to deflect ball
            let gkX = 855;
            let gkY = 270;
            if (t >= 0.38 && t < 0.60) {
                const subT = (t - 0.38) / 0.22;
                gkX = lerp(855, 830, easeOutQuad(subT));
                gkY = lerp(270, 230, easeOutQuad(subT));
            }

            // Ball flies toward corner, keeper touches it, rebounds out
            if (t < 0.38) {
                ball = { x: attackerX + 10, y: attackerY + 2, z: 0 };
                phaseDescription = `¡Disparo rasante con destino de gol!`;
            } else if (t < 0.55) {
                // Ball flying to goal
                const subT = (t - 0.38) / 0.17;
                ball = {
                    x: lerp(720, 832, easeOutQuad(subT)),
                    y: lerp(252, 228, easeOutQuad(subT)),
                    z: lerp(0, 18, subT)
                };
                phaseDescription = `¡Vuela ${gkName} estirando la mano derecha!`;
            } else if (t < 0.75) {
                // Deflection off keeper's fingertips to post
                const subT = (t - 0.55) / 0.20;
                ball = {
                    x: lerp(832, 860, subT),
                    y: lerp(228, 205, easeOutQuad(subT)), // hits post
                    z: lerp(18, 25, subT)
                };
                phaseDescription = `¡¡MANOTAZO MILAGROSO!! ¡EL BALÓN PEGA EN EL POSTE!`;
            } else {
                // Ball bounces away into corner
                const subT = (t - 0.75) / 0.25;
                ball = {
                    x: lerp(860, 810, easeOutQuad(subT)),
                    y: lerp(205, 140, easeOutQuad(subT)),
                    z: lerp(25, 0, subT)
                };
                phaseDescription = `¡Despejada la pelota! El arquero salva a su equipo.`;
            }

            players = [
                { id: 'att1', name: scorerName, number: '9', isAttacker: true, role: 'scorer', isKeyActor: true, x: attackerX, y: attackerY },
                { id: 'gk', name: gkName, number: '1', isAttacker: false, isGoalkeeper: true, role: 'gk', isKeyActor: true, x: gkX, y: gkY },
                { id: 'cb1', name: cb1Name, number: '2', isAttacker: false, role: 'cb1', x: 670, y: 280 },
            ];
        }

        return {
            ball,
            players,
            netDistortion,
            playSubtitle,
            phaseDescription
        };
    }, [progress, playType, scorer, assister, goalkeeper, defendingCBs]);

    // Trigger goal explosion popup once ball hits the net
    useEffect(() => {
        if (type === 'goal' && sceneState.ball.hasImpacted && !showGoalFlash) {
            setShowGoalFlash(true);
        }
    }, [type, sceneState.ball.hasImpacted, showGoalFlash]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl p-2 sm:p-4 select-none animate-fade-in">
            {/* Ambient Stadium Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-3xl opacity-20"
                    style={{ background: attPrimary }}
                />
            </div>

            {/* Main Broadcast Container */}
            <div className="relative w-full max-w-5xl flex flex-col rounded-2xl overflow-hidden border border-white/15 bg-slate-950/90 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                
                {/* 1. TOP BROADCAST HEADER */}
                <div className="relative z-10 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-white/10">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black tracking-widest text-red-400 uppercase">
                                REPETICIÓN 2D
                            </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-black font-mono">
                            {minute}'
                        </span>
                        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-300">
                            <span className="text-white">{attackingTeam.name}</span>
                            <span className="text-slate-500">vs</span>
                            <span className="text-white">{defendingTeam.name}</span>
                        </div>
                    </div>

                    {/* Quick controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSpeed(s => s === 1 ? 1.5 : 1)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono font-bold text-slate-300 border border-slate-700 transition-all"
                            title="Velocidad de reproducción"
                        >
                            {speed}x
                        </button>
                        <button
                            onClick={handleRestart}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                            title="Repetir jugada"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={onComplete}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/20 transition-all"
                        >
                            <span>Omitir</span>
                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">(ESC)</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 2. THE 2D PITCH CANVAS (SVG) */}
                <div className="relative w-full aspect-[16/9.2] sm:aspect-[16/8.5] bg-[#0c2f17] overflow-hidden select-none">
                    
                    {/* Goal flash celebratory banner */}
                    {showGoalFlash && type === 'goal' && (
                        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center bg-black/40 animate-fade-in">
                            <div className="text-center transform animate-scale-in">
                                <span className="text-xs font-black uppercase tracking-[0.4em] text-yellow-400 drop-shadow">
                                    Apex Replay
                                </span>
                                <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]">
                                    ¡GOOOOOL!
                                </h1>
                                <p className="text-sm sm:text-lg font-bold text-white uppercase tracking-wider drop-shadow mt-1">
                                    {scorer?.name || attackingTeam.name}
                                </p>
                            </div>
                        </div>
                    )}

                    <svg
                        viewBox="0 0 920 540"
                        className="w-full h-full select-none"
                        style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}
                    >
                        <defs>
                            {/* Pitch Grass Lawn Stripes */}
                            <pattern id="lawnStripes" width="92" height="540" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="46" height="540" fill="#11401f" />
                                <rect x="46" y="0" width="46" height="540" fill="#144b25" />
                            </pattern>

                            {/* Stadium Pitch Lighting Vignette */}
                            <radialGradient id="pitchLight" cx="50%" cy="50%" r="50%">
                                <stop offset="60%" stopColor="#ffffff" stopOpacity="0.08" />
                                <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
                            </radialGradient>

                            {/* Net Mesh Pattern */}
                            <pattern id="netMesh" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.35" />
                            </pattern>

                            {/* Player Chip Gloss Gradient */}
                            <linearGradient id="chipGloss" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.0" />
                                <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                            </linearGradient>

                            {/* Ball 3D Shading */}
                            <radialGradient id="ballShading" cx="35%" cy="35%" r="65%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="70%" stopColor="#e2e8f0" />
                                <stop offset="100%" stopColor="#64748b" />
                            </radialGradient>

                            {/* Drop Shadow for tokens */}
                            <filter id="tokenShadow" x="-30%" y="-30%" width="160%" height="160%">
                                <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.6" />
                            </filter>
                            <filter id="ballShadowFilter" x="-40%" y="-40%" width="180%" height="180%">
                                <feGaussianBlur stdDeviation="3" />
                            </filter>
                        </defs>

                        {/* Grass Base */}
                        <rect x="0" y="0" width="920" height="540" fill="url(#lawnStripes)" />
                        <rect x="0" y="0" width="920" height="540" fill="url(#pitchLight)" />

                        {/* ================= PITCH CHALK LINES ================= */}
                        <g stroke="rgba(255, 255, 255, 0.75)" strokeWidth="3" fill="none">
                            {/* Outer boundary lines */}
                            <rect x="40" y="30" width="820" height="480" rx="4" />

                            {/* Midfield line (partial showing left side) */}
                            <line x1="120" y1="30" x2="120" y2="510" />
                            <circle cx="120" cy="270" r="80" />
                            <circle cx="120" cy="270" r="4" fill="rgba(255, 255, 255, 0.85)" />

                            {/* Penalty Area (18-yard box) */}
                            <rect x="640" y="100" width="220" height="340" />

                            {/* 6-Yard Goal Area */}
                            <rect x="770" y="185" width="90" height="170" />

                            {/* Penalty Spot */}
                            <circle cx="720" cy="270" r="4" fill="rgba(255, 255, 255, 0.9)" />

                            {/* Penalty Arc */}
                            <path d="M 640 215 A 75 75 0 0 0 640 325" />

                            {/* Corner Arcs */}
                            <path d="M 860 50 A 20 20 0 0 0 840 30" />
                            <path d="M 860 490 A 20 20 0 0 1 840 510" />
                        </g>

                        {/* ================= GOAL NET WITH DYNAMIC BULGE ================= */}
                        <g id="goalNet">
                            {/* Net floor shadow */}
                            <polygon 
                                points={`860,210 ${900 + sceneState.netDistortion},215 ${900 + sceneState.netDistortion},325 860,330`} 
                                fill="rgba(0,0,0,0.3)" 
                            />
                            {/* Back and side netting */}
                            <path
                                d={`M 860 210 L ${895 + sceneState.netDistortion} 214 L ${895 + sceneState.netDistortion} 326 L 860 330 Z`}
                                fill="url(#netMesh)"
                                stroke="rgba(255,255,255,0.4)"
                                strokeWidth="1.5"
                            />
                            {/* Goal Posts & Crossbar */}
                            <circle cx="860" cy="210" r="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
                            <circle cx="860" cy="330" r="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
                            <line x1="860" y1="210" x2="860" y2="330" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
                        </g>

                        {/* ================= BALL SHADOW & BALL TRAIL ================= */}
                        {/* Ball Shadow on the grass (shifts with altitude Z) */}
                        <ellipse
                            cx={sceneState.ball.x}
                            cy={sceneState.ball.y + (sceneState.ball.z || 0) * 0.9}
                            rx={Math.max(4, 7 + (sceneState.ball.z || 0) * 0.25)}
                            ry={Math.max(2, 4 + (sceneState.ball.z || 0) * 0.15)}
                            fill="rgba(0, 0, 0, 0.45)"
                            filter="url(#ballShadowFilter)"
                        />

                        {/* ================= PLAYERS (TOKENS / CHIPS) ================= */}
                        {sceneState.players.map(p => {
                            const isAtt = p.isAttacker;
                            const isGK = p.isGoalkeeper;
                            const mainColor = isGK ? '#eab308' : (isAtt ? attPrimary : defPrimary);
                            const secColor = isGK ? '#0f172a' : (isAtt ? attSecondary : defSecondary);
                            const radius = 17;

                            return (
                                <g
                                    key={p.id}
                                    transform={`translate(${p.x}, ${p.y})`}
                                    filter="url(#tokenShadow)"
                                    className="transition-transform duration-75"
                                >
                                    {/* Pulse ring for key player with the ball */}
                                    {p.isKeyActor && (
                                        <circle
                                            r={radius + 6}
                                            fill="none"
                                            stroke={mainColor}
                                            strokeWidth="2"
                                            opacity="0.6"
                                            className="animate-ping"
                                        />
                                    )}

                                    {/* Chip Main Body */}
                                    <circle
                                        r={radius}
                                        fill={mainColor}
                                        stroke={secColor}
                                        strokeWidth="2.5"
                                    />

                                    {/* Gloss overlay */}
                                    <circle
                                        r={radius}
                                        fill="url(#chipGloss)"
                                    />

                                    {/* Player Number or GK badge */}
                                    <text
                                        y="4.5"
                                        textAnchor="middle"
                                        fill={isGK ? '#0f172a' : secColor}
                                        fontSize={isGK ? '10' : '11'}
                                        fontWeight="900"
                                        fontFamily="sans-serif"
                                        style={{ textShadow: isGK ? 'none' : '0 1px 2px rgba(0,0,0,0.8)' }}
                                    >
                                        {isGK ? '🧤' : p.number}
                                    </text>

                                    {/* Floating Name Badge */}
                                    <g transform={`translate(0, ${radius + 12})`}>
                                        <rect
                                            x="-35"
                                            y="-8"
                                            width="70"
                                            height="15"
                                            rx="4"
                                            fill="rgba(8, 12, 20, 0.85)"
                                            stroke="rgba(255, 255, 255, 0.15)"
                                            strokeWidth="0.8"
                                        />
                                        <text
                                            textAnchor="middle"
                                            y="3"
                                            fill="#f8fafc"
                                            fontSize="9"
                                            fontWeight="800"
                                            fontFamily="sans-serif"
                                            className="truncate"
                                        >
                                            {p.name.length > 9 ? p.name.slice(0, 8) + '…' : p.name}
                                        </text>
                                    </g>
                                </g>
                            );
                        })}

                        {/* ================= THE BALL ================= */}
                        {(() => {
                            const bZ = sceneState.ball.z || 0;
                            const bScale = 1 + (bZ * 0.025);
                            const bY = sceneState.ball.y - bZ;

                            return (
                                <g transform={`translate(${sceneState.ball.x}, ${bY}) scale(${bScale})`}>
                                    {/* Ball speed aura if airborne or rocket shot */}
                                    {bZ > 6 && (
                                        <circle
                                            r="10"
                                            fill="rgba(255, 255, 255, 0.3)"
                                            className="animate-pulse"
                                        />
                                    )}

                                    {/* Ball Sphere */}
                                    <circle
                                        r="6.5"
                                        fill="url(#ballShading)"
                                        stroke="#1e293b"
                                        strokeWidth="0.8"
                                    />
                                    {/* Pentagon patterns */}
                                    <polygon
                                        points="0,-2 2,-1 1.5,1.5 -1.5,1.5 -2,-1"
                                        fill="#0f172a"
                                    />
                                    <circle cx="-3" cy="-3" r="1.2" fill="#0f172a" />
                                    <circle cx="3" cy="-3" r="1.2" fill="#0f172a" />
                                    <circle cx="0" cy="4" r="1.2" fill="#0f172a" />
                                </g>
                            );
                        })()}
                    </svg>

                    {/* Bottom In-Pitch Play Commentary Banner */}
                    <div className="absolute bottom-2.5 left-3 right-3 sm:left-6 sm:right-6 pointer-events-none">
                        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 shadow-lg">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-base sm:text-lg">
                                    {type === 'goal' ? '⚽' : '🧤'}
                                </span>
                                <div className="truncate">
                                    <p className="text-[11px] sm:text-xs font-black text-yellow-400 uppercase tracking-wide truncate">
                                        {sceneState.playSubtitle}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-slate-300 font-medium truncate">
                                        {sceneState.phaseDescription}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. BOTTOM CONTROL & PLAYER STRIP */}
                <div className="relative z-10 px-3 sm:px-6 py-3 bg-slate-950 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    
                    {/* Scorer / Protagonist Card */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400/60 shrink-0 bg-slate-900 shadow-md">
                            <PlayerAvatar player={scorer || undefined} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-black text-white truncate">
                                    {scorer?.name || attackingTeam.name}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    {scorer?.position || 'DEL'}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                                {assister ? `Pase de ${assister.name}` : attackingTeam.name}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar & Media Controls */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Progress Scrubber */}
                        <div className="flex-1 sm:w-48 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-75"
                                    style={{ width: `${progress * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                {Math.round(progress * 100)}%
                            </span>
                        </div>

                        {/* Play/Pause Button */}
                        <button
                            onClick={togglePlay}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition-all"
                            title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
                        >
                            {isPlaying ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 9v6m4-6v6" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        {/* Dismiss / Continue Button */}
                        <button
                            onClick={onComplete}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-1.5"
                        >
                            <span>Continuar</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
