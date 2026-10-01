import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Player, Team } from '../../types';
import { PlayerAvatar } from '../ui/PlayerAvatar';

export type HighlightPlayType = 
    | 'THROUGH_BALL_1V1' 
    | 'WING_CROSS_HEADER' 
    | 'LONG_RANGE_STRIKE' 
    | 'PENALTY_KICK' 
    | 'MIRACLE_SAVE'
    | 'TIKI_TAKA_TRIANGLE'
    | 'COUNTER_ATTACK_BLITZ'
    | 'SOLO_DRIBBLE_GOLAZO'
    | 'CORNER_KICK_HEADER'
    | 'FREE_KICK_BEND'
    | 'WOODWORK_REBOUND_GOAL';

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
const easeOutQuad = (t: number) => t * (2 - t);
const easeInQuad = (t: number) => t * t;
const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

interface CanvasPlayer {
    id: string;
    name: string;
    isAttacker: boolean;
    isGK?: boolean;
    isKey?: boolean;
    x: number;
    y: number;
    color: string;
    secColor: string;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
}

// Authentic Spanish / Latin football surnames for fallback
const AUTHENTIC_SURNAMES = [
    'Romero', 'Martínez', 'Gómez', 'Rodríguez', 'López', 'Fernández', 
    'Díaz', 'Pérez', 'González', 'Silva', 'Castro', 'Álvarez', 
    'Benítez', 'Sosa', 'Torres', 'Medina', 'Morales', 'Suárez'
];

export const MatchHighlight2D: React.FC<MatchHighlight2DProps> = ({
    highlight,
    onComplete,
    autoPlay = true,
}) => {
    const { isHome, homeTeam, awayTeam, minute, text, type } = highlight;
    const attackingTeam = isHome ? homeTeam : awayTeam;
    const defendingTeam = isHome ? awayTeam : homeTeam;

    // Team Colors
    const attPrimary = attackingTeam.primaryColor || '#2563eb';
    const attSecondary = attackingTeam.secondaryColor || '#ffffff';
    const defPrimary = defendingTeam.primaryColor || '#dc2626';
    const defSecondary = defendingTeam.secondaryColor || '#ffffff';

    // Resolve Scorer & Assister
    const scorer = useMemo(() => {
        if (highlight.scorer) return highlight.scorer;
        const found = attackingTeam.squad.find(p => text.includes(p.name));
        if (found) return found;
        const fwds = attackingTeam.squad.filter(p => p.position === 'DEL');
        return fwds[0] || attackingTeam.squad[0];
    }, [highlight.scorer, attackingTeam, text]);

    const assister = useMemo(() => {
        if (highlight.assister) return highlight.assister;
        const assistMatch = text.match(/Asistencia de ([^)]+)/);
        if (assistMatch) {
            const aName = assistMatch[1].trim();
            const found = attackingTeam.squad.find(p => p.name.includes(aName) || aName.includes(p.name));
            if (found) return found;
        }
        const mids = attackingTeam.squad.filter(p => p.position === 'CEN' && p.id !== scorer?.id);
        return mids[0] || null;
    }, [highlight.assister, attackingTeam, scorer, text]);

    // Goalkeeper
    const goalkeeper = useMemo(() => {
        const gk = defendingTeam.squad.find(p => p.position === 'POR');
        return gk || defendingTeam.squad[0];
    }, [defendingTeam]);

    // Helper functions to get 100% REAL player surnames from squads
    const getAttSurname = (idx: number): string => {
        const p = attackingTeam.squad[idx];
        if (p?.name) return p.name.split(' ').slice(-1)[0];
        return AUTHENTIC_SURNAMES[idx % AUTHENTIC_SURNAMES.length];
    };

    const getDefSurname = (idx: number): string => {
        const p = defendingTeam.squad[idx];
        if (p?.name) return p.name.split(' ').slice(-1)[0];
        return AUTHENTIC_SURNAMES[(idx + 6) % AUTHENTIC_SURNAMES.length];
    };

    // Determine play type with 11 varied possibilities
    const playType: HighlightPlayType = useMemo(() => {
        if (highlight.playType) return highlight.playType;
        if (type === 'save') return 'MIRACLE_SAVE';
        const lower = text.toLowerCase();
        if (lower.includes('penal') || lower.includes('penalti') || lower.includes('11 metros')) return 'PENALTY_KICK';
        if (lower.includes('tiro libre') || lower.includes('falta directa') || lower.includes('barrera')) return 'FREE_KICK_BEND';
        if (lower.includes('córner') || lower.includes('corner') || lower.includes('saque de esquina')) return 'CORNER_KICK_HEADER';
        if (lower.includes('travesaño') || lower.includes('poste') || lower.includes('rebote')) return 'WOODWORK_REBOUND_GOAL';
        if (lower.includes('contragolpe') || lower.includes('contra') || lower.includes('contraataque')) return 'COUNTER_ATTACK_BLITZ';
        if (lower.includes('individual') || lower.includes('gambeta') || lower.includes('regate') || lower.includes('elude')) return 'SOLO_DRIBBLE_GOLAZO';
        if (lower.includes('jugada colectiva') || lower.includes('toques') || lower.includes('asociación')) return 'TIKI_TAKA_TRIANGLE';
        if (lower.includes('centro') || lower.includes('cabeza') || lower.includes('cabezazo')) return 'WING_CROSS_HEADER';
        if (lower.includes('fuera del área') || lower.includes('misil') || lower.includes('bombazo') || lower.includes('lejano') || lower.includes('distancia')) return 'LONG_RANGE_STRIKE';
        
        // Cyclic variety based on minute
        const cycle: HighlightPlayType[] = [
            'THROUGH_BALL_1V1',
            'WING_CROSS_HEADER',
            'TIKI_TAKA_TRIANGLE',
            'COUNTER_ATTACK_BLITZ',
            'LONG_RANGE_STRIKE',
            'SOLO_DRIBBLE_GOLAZO',
            'CORNER_KICK_HEADER',
            'FREE_KICK_BEND',
            'WOODWORK_REBOUND_GOAL'
        ];
        return cycle[minute % cycle.length];
    }, [highlight.playType, type, text, minute]);

    // Canvas & Animation refs
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const subtitleRef = useRef<HTMLParagraphElement | null>(null);
    const phaseRef = useRef<HTMLParagraphElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [speedMultiplier, setSpeedMultiplier] = useState<1 | 1.5 | 2>(1);
    const [goalBannerVisible, setGoalBannerVisible] = useState(false);

    // Natural 3.2s duration
    const baseDuration = 3300;
    const durationMs = baseDuration / speedMultiplier;

    const animFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const progressRef = useRef(0);
    const particlesRef = useRef<Particle[]>([]);
    const ballTrailRef = useRef<{ x: number; y: number; alpha: number }[]>([]);
    const hasSpawnedGoalParticles = useRef(false);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onComplete();
            } else if (e.key === ' ') {
                e.preventDefault();
                setIsPlaying(p => !p);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onComplete]);

    // Restart Play
    const handleRestart = () => {
        startTimeRef.current = null;
        progressRef.current = 0;
        particlesRef.current = [];
        ballTrailRef.current = [];
        hasSpawnedGoalParticles.current = false;
        setGoalBannerVisible(false);
        setIsPlaying(true);
    };

    // Protagonist names
    const sName = scorer?.name.split(' ').slice(-1)[0] || getAttSurname(0);
    const aName = assister?.name.split(' ').slice(-1)[0] || getAttSurname(1);
    const gkName = goalkeeper?.name.split(' ').slice(-1)[0] || getDefSurname(0);

    // =========================================================================
    // HIGH-PERFORMANCE 60 FPS CANVAS ENGINE
    // =========================================================================
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Device pixel ratio for retina sharpness
        const width = 960;
        const height = 540;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const renderFrame = (timestamp: number) => {
            if (!isPlaying) return;

            if (startTimeRef.current === null) {
                startTimeRef.current = timestamp - (progressRef.current * durationMs);
            }

            const elapsed = timestamp - startTimeRef.current;
            const t = clamp(elapsed / durationMs, 0, 1);
            progressRef.current = t;

            // Update DOM progress bar without React re-renders!
            if (progressBarRef.current) {
                progressBarRef.current.style.width = `${Math.round(t * 100)}%`;
            }

            // -------------------------------------------------------------
            // SCENE COMPUTATION WITH LIVING MOVEMENT FOR ALL PLAYERS
            // -------------------------------------------------------------
            let ball = { x: 400, y: 270, z: 0, inNet: false };
            let players: CanvasPlayer[] = [];
            let playTitle = '';
            let phaseDesc = '';
            let netDistortion = 0;

            // 1. THROUGH BALL 1v1
            if (playType === 'THROUGH_BALL_1V1') {
                playTitle = `⚡ Pase Filtrado de ${aName} y Definición Mano a Mano`;
                
                // Assister drives forward with natural cadence
                const aX = lerp(410, 500, easeOutQuad(clamp(t / 0.35)));
                const aY = lerp(310, 290, clamp(t / 0.35));

                // Scorer makes bursting diagonal run behind CBs
                let sX = 520, sY = 220;
                if (t < 0.35) {
                    sX = lerp(520, 610, t / 0.35);
                    sY = lerp(220, 230, t / 0.35);
                } else if (t < 0.70) {
                    const st = (t - 0.35) / 0.35;
                    sX = lerp(610, 770, easeOutQuad(st));
                    sY = lerp(230, 245, st);
                } else {
                    const st = (t - 0.70) / 0.30;
                    sX = lerp(770, 840, easeOutQuad(st));
                    sY = lerp(245, 160, easeOutQuad(st)); // run to corner flag
                }

                // Goalkeeper rushes out to close angle, then dives
                let gkX = 885, gkY = 270;
                if (t >= 0.35 && t < 0.70) {
                    gkX = lerp(885, 815, easeOutQuad((t - 0.35) / 0.35));
                    gkY = lerp(270, 255, (t - 0.35) / 0.35);
                } else if (t >= 0.70) {
                    gkX = lerp(815, 850, easeOutQuad((t - 0.70) / 0.16));
                    gkY = lerp(255, 295, easeOutQuad((t - 0.70) / 0.16));
                }

                // Ball positions (Goal inside at y=305, between 205 and 335)
                if (t < 0.32) {
                    ball = { x: aX + 12, y: aY - 2, z: 0, inNet: false };
                    phaseDesc = `${aName} conduce y filtra al claro...`;
                } else if (t < 0.52) {
                    const st = (t - 0.32) / 0.20;
                    ball = { x: lerp(aX + 12, 690, easeOutQuad(st)), y: lerp(aY - 2, 240, st), z: Math.sin(st * Math.PI) * 4, inNet: false };
                    phaseDesc = `¡Pase milimétrico al desmarque de ${sName}!`;
                } else if (t < 0.70) {
                    ball = { x: sX + 12, y: sY + 4, z: 0, inNet: false };
                    phaseDesc = `¡Mano a mano! ${sName} encara a ${gkName}...`;
                } else if (t < 0.82) {
                    const st = (t - 0.70) / 0.12;
                    ball = { x: lerp(782, 918, easeOutQuad(st)), y: lerp(249, 305, easeOutQuad(st)), z: lerp(0, 14, st), inNet: false };
                    phaseDesc = `¡Definió con comba cruzada al segundo palo!`;
                } else {
                    ball = { x: 922, y: 305, z: 4, inNet: true };
                    phaseDesc = `¡GOOOOOL! Impecable resolución.`;
                    const nt = (t - 0.82) / 0.18;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 16;
                }

                // All players have continuous organic movement!
                players = [
                    { id: 'att1', name: aName, isAttacker: true, x: aX, y: aY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: sName, isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: getAttSurname(2), isAttacker: true, x: lerp(460, 680, easeOutQuad(t * 0.8)), y: lerp(390, 370, t), color: attPrimary, secColor: attSecondary },
                    { id: 'att4', name: getAttSurname(3), isAttacker: true, x: lerp(340, 520, easeOutQuad(t * 0.7)), y: lerp(180, 200, t), color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, isAttacker: false, isGK: true, x: gkX, y: gkY, color: '#eab308', secColor: '#0f172a' },
                    // Center Back 1 desperately turns and chases
                    { id: 'cb1', name: getDefSurname(1), isAttacker: false, x: lerp(570, 730, easeOutQuad(t * 0.85)), y: lerp(220, 240, t), color: defPrimary, secColor: defSecondary },
                    // Center Back 2 drops deep covering
                    { id: 'cb2', name: getDefSurname(2), isAttacker: false, x: lerp(600, 720, easeOutQuad(t * 0.75)), y: lerp(300, 280, t), color: defPrimary, secColor: defSecondary },
                    // Lateral retreats tracking the winger
                    { id: 'fb', name: getDefSurname(3), isAttacker: false, x: lerp(500, 690, t * 0.7), y: lerp(410, 380, t), color: defPrimary, secColor: defSecondary },
                ];
            }

            // 2. WING CROSS & HEADER
            else if (playType === 'WING_CROSS_HEADER') {
                playTitle = `🌪️ Desborde de ${aName} y Cabezazo de ${sName}`;
                
                // Winger starts already in attacking third, advances smoothly (no teleport!)
                const wX = lerp(590, 760, easeOutQuad(clamp(t / 0.42)));
                const wY = lerp(435, 435, clamp(t / 0.42));

                // Defending fullback jockeying and trying to block
                const fbX = lerp(640, 755, easeOutQuad(clamp(t / 0.42)));
                const fbY = lerp(415, 425, clamp(t / 0.42));

                // Scorer movement in the box (shakes off marker, attacks near post)
                let sX = 660, sY = 265;
                if (t < 0.40) {
                    sX = lerp(660, 690, t / 0.40);
                    sY = lerp(265, 270, t / 0.40);
                } else if (t < 0.70) {
                    const st = (t - 0.40) / 0.30;
                    sX = lerp(690, 770, easeOutQuad(st));
                    sY = lerp(270, 245, st);
                } else {
                    const st = (t - 0.70) / 0.30;
                    sX = lerp(770, 810, easeOutQuad(st));
                    sY = lerp(245, 160, easeOutQuad(st));
                }

                // Goalkeeper shuffles across goal, dives up to top corner
                let gkX = 885, gkY = 270;
                if (t >= 0.40 && t < 0.70) {
                    gkY = lerp(270, 285, (t - 0.40) / 0.30);
                } else if (t >= 0.70) {
                    gkX = lerp(885, 875, easeOutQuad((t - 0.70) / 0.15));
                    gkY = lerp(285, 230, easeOutQuad((t - 0.70) / 0.15));
                }

                if (t < 0.40) {
                    ball = { x: wX + 10, y: wY - 2, z: 0, inNet: false };
                    phaseDesc = `¡${aName} desborda con potencia por la banda!`;
                } else if (t < 0.70) {
                    const st = (t - 0.40) / 0.30;
                    ball = { x: lerp(wX + 10, 770, st), y: lerp(wY - 2, 245, easeOutQuad(st)), z: Math.sin(st * Math.PI) * 48, inNet: false };
                    phaseDesc = `¡Centro bombeado al corazón del área!`;
                } else if (t < 0.80) {
                    const st = (t - 0.70) / 0.10;
                    ball = { x: lerp(770, 918, easeOutQuad(st)), y: lerp(245, 226, easeOutQuad(st)), z: lerp(22, 12, st), inNet: false };
                    phaseDesc = `¡${sName} le gana el salto a todos y mete el frentazo!`;
                } else {
                    // Ball lands cleanly inside net (y = 226, well below top post 205)
                    ball = { x: 922, y: 226, z: 10, inNet: true };
                    phaseDesc = `¡GOOOLAZO! Al ángulo superior.`;
                    const nt = (t - 0.80) / 0.20;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 16;
                }

                players = [
                    { id: 'att1', name: aName, isAttacker: true, x: wX, y: wY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: sName, isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: getAttSurname(2), isAttacker: true, x: lerp(580, 740, t * 0.6), y: lerp(180, 205, t), color: attPrimary, secColor: attSecondary },
                    { id: 'att4', name: getAttSurname(3), isAttacker: true, x: lerp(480, 620, t * 0.5), y: 310, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, isAttacker: false, isGK: true, x: gkX, y: gkY, color: '#eab308', secColor: '#0f172a' },
                    // Fullback marking winger
                    { id: 'def1', name: getDefSurname(1), isAttacker: false, x: fbX, y: fbY, color: defPrimary, secColor: defSecondary },
                    // Center Back battling with Scorer
                    { id: 'def2', name: getDefSurname(2), isAttacker: false, x: lerp(700, 765, t * 0.6), y: lerp(260, 252, t), color: defPrimary, secColor: defSecondary },
                    // Second Center Back covering far post
                    { id: 'def3', name: getDefSurname(3), isAttacker: false, x: lerp(680, 740, t * 0.5), y: lerp(210, 215, t), color: defPrimary, secColor: defSecondary },
                    // Opposite Fullback
                    { id: 'def4', name: getDefSurname(4), isAttacker: false, x: lerp(630, 700, t * 0.4), y: 150, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 3. TIKI-TAKA COLECTIVO (12 players moving in unison!)
            else if (playType === 'TIKI_TAKA_TRIANGLE') {
                playTitle = `🔄 Toque y Triangulación Colectiva`;
                const m1X = lerp(400, 440, t * 0.6);
                const m1Y = lerp(320, 310, t * 0.6);
                const m2X = lerp(510, 550, t * 0.6);
                const m2Y = lerp(230, 220, t * 0.6);
                const aX = lerp(630, 670, t * 0.7);
                const aY = lerp(350, 320, t * 0.7);
                const sX = lerp(670, 790, easeOutQuad(t));
                const sY = lerp(270, 255, t);

                if (t < 0.22) {
                    const st = t / 0.22;
                    ball = { x: lerp(m1X, m2X, st), y: lerp(m1Y, m2Y, st), z: 0, inNet: false };
                    phaseDesc = `Toque de primera en la medular...`;
                } else if (t < 0.44) {
                    const st = (t - 0.22) / 0.22;
                    ball = { x: lerp(m2X, aX, st), y: lerp(m2Y, aY, st), z: 0, inNet: false };
                    phaseDesc = `¡Pase entre líneas para ${aName}!`;
                } else if (t < 0.68) {
                    const st = (t - 0.44) / 0.24;
                    ball = { x: lerp(aX, 780, easeOutQuad(st)), y: lerp(aY, 255, easeOutQuad(st)), z: 0, inNet: false };
                    phaseDesc = `¡Pase de la muerte atrás para ${sName}!`;
                } else if (t < 0.78) {
                    const st = (t - 0.68) / 0.10;
                    ball = { x: lerp(780, 918, easeOutQuad(st)), y: lerp(255, 245, easeOutQuad(st)), z: lerp(0, 10, st), inNet: false };
                    phaseDesc = `¡Remate de primera a la red!`;
                } else {
                    ball = { x: 922, y: 245, z: 4, inNet: true };
                    phaseDesc = `¡GOLAZO COLECTIVO! Fútbol total.`;
                    const nt = (t - 0.78) / 0.22;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 15;
                }

                // Defensive block shifts laterally to close gaps
                players = [
                    { id: 'att1', name: getAttSurname(2), isAttacker: true, x: m1X, y: m1Y, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: getAttSurname(3), isAttacker: true, x: m2X, y: m2Y, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: aName, isAttacker: true, x: aX, y: aY, color: attPrimary, secColor: attSecondary },
                    { id: 'att4', name: sName, isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att5', name: getAttSurname(4), isAttacker: true, x: lerp(580, 690, t * 0.5), y: 150, color: attPrimary, secColor: attSecondary },
                    { id: 'att6', name: getAttSurname(5), isAttacker: true, x: lerp(460, 540, t * 0.6), y: 440, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, isAttacker: false, isGK: true, x: lerp(885, 875, t * 0.5), y: lerp(270, 255, t * 0.7), color: '#eab308', secColor: '#0f172a' },
                    // Defenders shifting as a coordinated unit
                    { id: 'def1', name: getDefSurname(1), isAttacker: false, x: lerp(720, 755, t * 0.4), y: lerp(220, 235, t * 0.6), color: defPrimary, secColor: defSecondary },
                    { id: 'def2', name: getDefSurname(2), isAttacker: false, x: lerp(710, 745, t * 0.5), y: lerp(300, 290, t * 0.6), color: defPrimary, secColor: defSecondary },
                    { id: 'def3', name: getDefSurname(3), isAttacker: false, x: lerp(650, 685, t * 0.6), y: 380, color: defPrimary, secColor: defSecondary },
                    { id: 'def4', name: getDefSurname(4), isAttacker: false, x: lerp(560, 590, t * 0.5), y: 260, color: defPrimary, secColor: defSecondary },
                    { id: 'def5', name: getDefSurname(5), isAttacker: false, x: lerp(490, 520, t * 0.4), y: 210, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 4. FREE KICK BEND (13 players - Wall jumps, ball curves CLEANLY INSIDE the goalmouth!)
            else if (playType === 'FREE_KICK_BEND') {
                playTitle = `🎯 Tiro Libre Maestro al Ángulo`;
                const fkX = 590, fkY = 240;
                
                // Taker run-up
                const sX = lerp(560, 590, clamp(t / 0.35));
                const sY = lerp(250, 240, clamp(t / 0.35));

                // 4-man defensive wall leaps at the kick
                const wallJump = (t >= 0.35 && t <= 0.62) ? Math.sin(((t - 0.35) / 0.27) * Math.PI) * 14 : 0;

                // Goalkeeper positioning and dive
                let gkX = 885, gkY = 280;
                if (t >= 0.38) {
                    const st = (t - 0.38) / 0.32;
                    gkX = lerp(885, 868, easeOutQuad(st));
                    gkY = lerp(280, 230, easeOutQuad(st)); // dives up towards the shot
                }

                // Ball curves over the wall (at x=710, y=240, Z=28) and dips into (918, 226)
                // Note: top post is at 205, so y = 226 is 21px INSIDE the top post!
                if (t < 0.35) {
                    ball = { x: fkX, y: fkY, z: 0, inNet: false };
                    phaseDesc = `${sName} mide la barrera y se concentra...`;
                } else if (t < 0.70) {
                    const st = (t - 0.35) / 0.35;
                    ball = { 
                        x: lerp(fkX, 918, easeOutQuad(st)), 
                        y: lerp(fkY, 226, easeOutQuad(st)), 
                        z: Math.sin(st * Math.PI) * 32, 
                        inNet: false 
                    };
                    phaseDesc = `¡SUPERÓ LA BARRERA CON EFECTO Y BAJA CON VENENO!`;
                } else {
                    // Ball lands cleanly inside the goal
                    ball = { x: 922, y: 226, z: 14, inNet: true };
                    phaseDesc = `¡¡GOLAZO MONUMENTAL DE TIRO LIBRE!!`;
                    const nt = (t - 0.70) / 0.30;
                    netDistortion = Math.sin(nt * Math.PI * 5) * (1 - nt) * 18;
                }

                players = [
                    { id: 'att1', name: sName, isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: getAttSurname(1), isAttacker: true, x: 580, y: 275, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: getAttSurname(2), isAttacker: true, x: lerp(720, 770, t * 0.5), y: 310, color: attPrimary, secColor: attSecondary },
                    { id: 'att4', name: getAttSurname(3), isAttacker: true, x: lerp(680, 730, t * 0.6), y: 170, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, isAttacker: false, isGK: true, x: gkX, y: gkY, color: '#eab308', secColor: '#0f172a' },
                    // 4-Man Defensive Wall that leaps together
                    { id: 'w1', name: getDefSurname(1), isAttacker: false, x: 710, y: 215 - wallJump, color: defPrimary, secColor: defSecondary },
                    { id: 'w2', name: getDefSurname(2), isAttacker: false, x: 710, y: 235 - wallJump, color: defPrimary, secColor: defSecondary },
                    { id: 'w3', name: getDefSurname(3), isAttacker: false, x: 710, y: 255 - wallJump, color: defPrimary, secColor: defSecondary },
                    { id: 'w4', name: getDefSurname(4), isAttacker: false, x: 710, y: 275 - wallJump, color: defPrimary, secColor: defSecondary },
                    // In-box markers tracking runners
                    { id: 'def5', name: getDefSurname(5), isAttacker: false, x: lerp(750, 780, t * 0.4), y: 295, color: defPrimary, secColor: defSecondary },
                    { id: 'def6', name: getDefSurname(6), isAttacker: false, x: lerp(730, 760, t * 0.5), y: 185, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 5. CORNER KICK HEADER (15 players in box, intense action)
            else if (playType === 'CORNER_KICK_HEADER') {
                playTitle = `📐 Córner al Área y Frentazo en el Tumulto`;
                const cornerX = 885, cornerY = 475;
                
                let sX = 750, sY = 260;
                if (t > 0.35) {
                    sX = lerp(750, 805, easeOutQuad((t - 0.35) / 0.30));
                    sY = lerp(260, 235, (t - 0.35) / 0.30);
                }

                if (t < 0.35) {
                    ball = { x: cornerX - 8, y: cornerY - 8, z: 0, inNet: false };
                    phaseDesc = `${aName} levanta el brazo y prepara el centro...`;
                } else if (t < 0.68) {
                    const st = (t - 0.35) / 0.33;
                    ball = { x: lerp(cornerX, 805, st), y: lerp(cornerY, 235, easeOutQuad(st)), z: Math.sin(st * Math.PI) * 55, inNet: false };
                    phaseDesc = `¡Centro cerrado con rosca al punto de penal!`;
                } else if (t < 0.78) {
                    const st = (t - 0.68) / 0.10;
                    ball = { x: lerp(805, 918, easeOutQuad(st)), y: lerp(235, 222, easeOutQuad(st)), z: lerp(20, 10, st), inNet: false };
                    phaseDesc = `¡${sName} anticipa de cabeza al primer palo!`;
                } else {
                    ball = { x: 922, y: 222, z: 8, inNet: true };
                    phaseDesc = `¡GOOOOOL DE CÓRNER! Frentazo letal.`;
                    const nt = (t - 0.78) / 0.22;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 18;
                }

                // 15 players packed in box, everyone jostling and shifting
                players = [
                    { id: 'att1', name: aName, isAttacker: true, x: cornerX, y: cornerY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: sName, isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: getAttSurname(2), isAttacker: true, x: lerp(770, 810, t * 0.5), y: 290, color: attPrimary, secColor: attSecondary },
                    { id: 'att4', name: getAttSurname(3), isAttacker: true, x: lerp(810, 830, t * 0.4), y: 260, color: attPrimary, secColor: attSecondary },
                    { id: 'att5', name: getAttSurname(4), isAttacker: true, x: lerp(660, 680, t * 0.3), y: 270, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, isAttacker: false, isGK: true, x: lerp(885, 865, t * 0.6), y: lerp(270, 245, t * 0.6), color: '#eab308', secColor: '#0f172a' },
                    // Post defenders
                    { id: 'def1', name: getDefSurname(1), isAttacker: false, x: 885, y: 215, color: defPrimary, secColor: defSecondary },
                    { id: 'def2', name: getDefSurname(2), isAttacker: false, x: 885, y: 325, color: defPrimary, secColor: defSecondary },
                    // Man markers
                    { id: 'def3', name: getDefSurname(3), isAttacker: false, x: lerp(770, 800, t * 0.5), y: lerp(250, 242, t * 0.5), color: defPrimary, secColor: defSecondary },
                    { id: 'def4', name: getDefSurname(4), isAttacker: false, x: lerp(785, 815, t * 0.4), y: 285, color: defPrimary, secColor: defSecondary },
                    { id: 'def5', name: getDefSurname(5), isAttacker: false, x: 825, y: 275, color: defPrimary, secColor: defSecondary },
                    { id: 'def6', name: getDefSurname(6), isAttacker: false, x: 835, y: 220, color: defPrimary, secColor: defSecondary },
                    { id: 'def7', name: getDefSurname(7), isAttacker: false, x: 670, y: 340, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 6. COUNTER ATTACK BLITZ (Costa a costa con ritmo coordinado)
            else if (playType === 'COUNTER_ATTACK_BLITZ') {
                playTitle = `⚡ Contragolpe Letal de Costa a Costa`;
                
                // Realistic measured sprint speeds (smooth accelerations)
                const sX = lerp(450, 770, easeOutQuad(t));
                const sY = lerp(290, 260, t);
                const wX = lerp(510, 790, easeOutQuad(t));
                const wY = lerp(410, 370, t);

                if (t < 0.40) {
                    ball = { x: wX + 10, y: wY, z: 0, inNet: false };
                    phaseDesc = `¡Transición fulminante a campo abierto!`;
                } else if (t < 0.66) {
                    const st = (t - 0.40) / 0.26;
                    ball = { x: lerp(wX, sX + 15, st), y: lerp(wY, sY, st), z: 2, inNet: false };
                    phaseDesc = `¡Centro rasante cruzado al segundo palo!`;
                } else if (t < 0.78) {
                    const st = (t - 0.66) / 0.12;
                    ball = { x: lerp(sX + 15, 918, easeOutQuad(st)), y: lerp(sY, 280, easeOutQuad(st)), z: lerp(0, 10, st), inNet: false };
                    phaseDesc = `¡${sName} se tira en plancha y la empuja a la red!`;
                } else {
                    ball = { x: 922, y: 280, z: 4, inNet: true };
                    phaseDesc = `¡CONTRAGOLPE LETAL! Máxima eficacia.`;
                    const nt = (t - 0.78) / 0.22;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 16;
                }

                players = [
                    { id: 'att1', name: aName, isAttacker: true, x: wX, y: wY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: sName, isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: getAttSurname(2), isAttacker: true, x: lerp(380, 680, easeOutQuad(t)), y: 170, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, isAttacker: false, isGK: true, x: lerp(885, 860, t * 0.6), y: 270, color: '#eab308', secColor: '#0f172a' },
                    // Defenders running back in emergency retreat
                    { id: 'def1', name: getDefSurname(1), isAttacker: false, x: lerp(520, 760, easeOutQuad(t * 0.95)), y: 245, color: defPrimary, secColor: defSecondary },
                    { id: 'def2', name: getDefSurname(2), isAttacker: false, x: lerp(560, 780, easeOutQuad(t * 0.9)), y: 320, color: defPrimary, secColor: defSecondary },
                    { id: 'def3', name: getDefSurname(3), isAttacker: false, x: lerp(480, 720, easeOutQuad(t * 0.85)), y: 190, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 7. SOLO DRIBBLE GOLAZO (Slalom individual)
            else if (playType === 'SOLO_DRIBBLE_GOLAZO') {
                playTitle = `🌟 Obra de Arte Individual de ${sName}`;
                let sX = 540, sY = 270;
                if (t < 0.30) {
                    sX = lerp(540, 640, t / 0.30);
                    sY = lerp(270, 240, t / 0.30);
                } else if (t < 0.60) {
                    sX = lerp(640, 750, (t - 0.30) / 0.30);
                    sY = lerp(240, 285, (t - 0.30) / 0.30);
                } else if (t < 0.75) {
                    sX = lerp(750, 830, (t - 0.60) / 0.15);
                    sY = lerp(285, 255, (t - 0.60) / 0.15);
                } else {
                    sX = lerp(830, 860, (t - 0.75) / 0.25);
                }

                if (t < 0.30) {
                    ball = { x: sX + 10, y: sY + 2, z: 0, inNet: false };
                    phaseDesc = `¡${sName} deja al primer marcador en el camino con una pisada!`;
                } else if (t < 0.60) {
                    ball = { x: sX + 10, y: sY + 2, z: 0, inNet: false };
                    phaseDesc = `¡Qué caño! Pasa entre dos defensores rivales...`;
                } else if (t < 0.74) {
                    ball = { x: sX + 12, y: sY + 2, z: 0, inNet: false };
                    phaseDesc = `¡Elude a ${gkName} que queda en el camino!`;
                } else {
                    const st = (t - 0.74) / 0.10;
                    ball = { x: lerp(842, 918, clamp(st)), y: 255, z: 0, inNet: t >= 0.84 };
                    phaseDesc = `¡GOLAZO MONUMENTAL! Toque suave a la red.`;
                    if (t >= 0.84) netDistortion = Math.sin((t - 0.84) * 20) * 12;
                }

                players = [
                    { id: 'att1', name: sName, isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, isAttacker: false, isGK: true, x: lerp(885, 810, easeOutQuad(t * 0.65)), y: lerp(270, 280, t * 0.65), color: '#eab308', secColor: '#0f172a' },
                    { id: 'def1', name: getDefSurname(1), isAttacker: false, x: lerp(640, 670, t * 0.3), y: 235, color: defPrimary, secColor: defSecondary },
                    { id: 'def2', name: getDefSurname(2), isAttacker: false, x: lerp(710, 745, t * 0.4), y: 275, color: defPrimary, secColor: defSecondary },
                    { id: 'def3', name: getDefSurname(3), isAttacker: false, x: lerp(660, 710, t * 0.5), y: 340, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 8. WOODWORK REBOUND GOAL
            else if (playType === 'WOODWORK_REBOUND_GOAL') {
                playTitle = `💥 Cañonazo al Poste y Rebote Oportunista`;
                if (t < 0.35) {
                    const st = t / 0.35;
                    ball = { x: lerp(540, 885, easeInQuad(st)), y: lerp(290, 208, st), z: lerp(0, 30, st), inNet: false };
                    phaseDesc = `¡Bombazo furibundo que revienta el travesaño!`;
                } else if (t < 0.65) {
                    const st = (t - 0.35) / 0.30;
                    ball = { x: lerp(885, 760, easeOutQuad(st)), y: lerp(208, 270, st), z: lerp(30, 8, st), inNet: false };
                    phaseDesc = `¡El balón sale disparado al corazón del área!`;
                } else if (t < 0.78) {
                    const st = (t - 0.65) / 0.13;
                    ball = { x: lerp(760, 918, easeOutQuad(st)), y: lerp(270, 280, st), z: lerp(8, 12, st), inNet: false };
                    phaseDesc = `¡${sName} captura el rebote y fusila de primera!`;
                } else {
                    ball = { x: 922, y: 280, z: 8, inNet: true };
                    phaseDesc = `¡GOOOOOL! Atento para cazar la segunda jugada.`;
                    const nt = (t - 0.78) / 0.22;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 16;
                }

                players = [
                    { id: 'att1', name: aName, isAttacker: true, x: 540, y: 290, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: sName, isAttacker: true, isKey: true, x: lerp(680, 765, easeOutQuad(t)), y: lerp(250, 270, t), color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, isAttacker: false, isGK: true, x: 885, y: lerp(230, 270, t), color: '#eab308', secColor: '#0f172a' },
                    { id: 'def1', name: getDefSurname(1), isAttacker: false, x: lerp(740, 770, t * 0.5), y: 230, color: defPrimary, secColor: defSecondary },
                    { id: 'def2', name: getDefSurname(2), isAttacker: false, x: lerp(760, 780, t * 0.5), y: 320, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 9. LONG RANGE STRIKE
            else if (playType === 'LONG_RANGE_STRIKE') {
                playTitle = `🚀 Misil Teledirigido desde Fuera del Área`;
                const sX = lerp(530, 610, easeOutQuad(clamp(t / 0.38)));
                const sY = lerp(300, 260, clamp(t / 0.38));

                if (t < 0.38) {
                    ball = { x: sX + 12, y: sY + 4, z: 0, inNet: false };
                    phaseDesc = `${sName} se acomoda el balón para sacar el latigazo...`;
                } else if (t < 0.65) {
                    const st = (t - 0.38) / 0.27;
                    ball = { x: lerp(622, 918, easeInQuad(st)), y: lerp(264, 222, easeOutQuad(st)), z: lerp(0, 24, st), inNet: false };
                    phaseDesc = `¡¡QUÉ BOMBAZO TREMENDO AL ÁNGULO!!`;
                } else {
                    ball = { x: 922, y: 222, z: 20, inNet: true };
                    phaseDesc = `¡¡GOLAZO MONUMENTAL!! Inalcanzable.`;
                    const nt = (t - 0.65) / 0.35;
                    netDistortion = Math.sin(nt * Math.PI * 5) * (1 - nt) * 18;
                }

                players = [
                    { id: 'att1', name: sName, isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: getAttSurname(1), isAttacker: true, x: lerp(680, 720, t * 0.4), y: 190, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, isAttacker: false, isGK: true, x: lerp(885, 860, easeOutQuad(t * 0.7)), y: lerp(270, 224, easeOutQuad(t * 0.7)), color: '#eab308', secColor: '#0f172a' },
                    { id: 'def1', name: getDefSurname(1), isAttacker: false, x: lerp(640, 680, t * 0.6), y: 255, color: defPrimary, secColor: defSecondary },
                    { id: 'def2', name: getDefSurname(2), isAttacker: false, x: lerp(690, 720, t * 0.4), y: 310, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 10. PENALTY KICK
            else if (playType === 'PENALTY_KICK') {
                playTitle = `🎯 Definición Desde los Doce Pasos`;
                const runUp = clamp(t / 0.38);
                const sX = lerp(690, 755, easeInQuad(runUp));
                const sY = 270;

                let gkX = 885, gkY = 270;
                if (t >= 0.35 && t < 0.65) {
                    gkX = lerp(885, 870, easeOutQuad((t - 0.35) / 0.30));
                    gkY = lerp(270, 315, easeOutQuad((t - 0.35) / 0.30));
                }

                if (t < 0.38) {
                    ball = { x: 760, y: 270, z: 0, inNet: false };
                    phaseDesc = `${sName} toma carrera concentrado...`;
                } else if (t < 0.60) {
                    const st = (t - 0.38) / 0.22;
                    ball = { x: lerp(760, 918, easeOutQuad(st)), y: lerp(270, 226, easeOutQuad(st)), z: lerp(0, 14, st), inNet: false };
                    phaseDesc = `¡Engañó por completo al guardameta!`;
                } else {
                    ball = { x: 922, y: 226, z: 10, inNet: true };
                    phaseDesc = `¡GOOOOOL DE PENAL! Gran categoría.`;
                    const nt = (t - 0.60) / 0.40;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 15;
                }

                players = [
                    { id: 'att1', name: sName, isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, isAttacker: false, isGK: true, x: gkX, y: gkY, color: '#eab308', secColor: '#0f172a' },
                    { id: 'def1', name: getDefSurname(1), isAttacker: false, x: 630, y: 220, color: defPrimary, secColor: defSecondary },
                    { id: 'def2', name: getDefSurname(2), isAttacker: false, x: 630, y: 320, color: defPrimary, secColor: defSecondary },
                    { id: 'att2', name: getAttSurname(1), isAttacker: true, x: 620, y: 270, color: attPrimary, secColor: attSecondary },
                ];
            }

            // 11. MIRACLE SAVE
            else {
                playTitle = `🧤 ¡Paradón Impresionante de ${gkName}!`;
                const aX = lerp(650, 750, easeOutQuad(clamp(t / 0.38)));
                const aY = 250;

                let gkX = 885, gkY = 270;
                if (t >= 0.38 && t < 0.60) {
                    gkX = lerp(885, 860, easeOutQuad((t - 0.38) / 0.22));
                    gkY = lerp(270, 225, easeOutQuad((t - 0.38) / 0.22));
                }

                if (t < 0.38) {
                    ball = { x: aX + 10, y: aY + 2, z: 0, inNet: false };
                    phaseDesc = `¡Disparo furioso a quemarropa!`;
                } else if (t < 0.55) {
                    const st = (t - 0.38) / 0.17;
                    ball = { x: lerp(760, 862, easeOutQuad(st)), y: lerp(252, 225, easeOutQuad(st)), z: lerp(0, 18, st), inNet: false };
                    phaseDesc = `¡Vuela ${gkName} estirando la mano derecha!`;
                } else if (t < 0.75) {
                    const st = (t - 0.55) / 0.20;
                    ball = { x: lerp(862, 885, st), y: lerp(225, 205, easeOutQuad(st)), z: lerp(18, 25, st), inNet: false };
                    phaseDesc = `¡¡MANOTAZO MILAGROSO!! ¡EL BALÓN PEGA EN EL POSTE!`;
                } else {
                    const st = (t - 0.75) / 0.25;
                    ball = { x: lerp(885, 810, easeOutQuad(st)), y: lerp(205, 140, easeOutQuad(st)), z: lerp(25, 0, st), inNet: false };
                    phaseDesc = `¡Salvada antológica para evitar el gol!`;
                }

                players = [
                    { id: 'att1', name: sName, isAttacker: true, isKey: true, x: aX, y: aY, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, isAttacker: false, isGK: true, isKey: true, x: gkX, y: gkY, color: '#eab308', secColor: '#0f172a' },
                    { id: 'def1', name: getDefSurname(1), isAttacker: false, x: lerp(700, 725, t * 0.5), y: 280, color: defPrimary, secColor: defSecondary },
                ];
            }

            // Update Subtitle & Phase Text directly in DOM
            if (subtitleRef.current && subtitleRef.current.textContent !== playTitle) {
                subtitleRef.current.textContent = playTitle;
            }
            if (phaseRef.current && phaseRef.current.textContent !== phaseDesc) {
                phaseRef.current.textContent = phaseDesc;
            }

            // Spawn Goal Confetti / Sparks on impact
            if (type === 'goal' && ball.inNet && !hasSpawnedGoalParticles.current) {
                hasSpawnedGoalParticles.current = true;
                setGoalBannerVisible(true);
                const sparkColors = ['#facc15', '#f59e0b', '#ffffff', '#38bdf8', '#4ade80'];
                for (let i = 0; i < 40; i++) {
                    const angle = (Math.PI * 0.8) + (Math.random() * Math.PI * 0.4);
                    const speed = 3 + Math.random() * 8;
                    particlesRef.current.push({
                        x: 885,
                        y: 270 + (Math.random() * 80 - 40),
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: 2.5 + Math.random() * 3,
                        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
                        alpha: 1
                    });
                }
            }

            // -------------------------------------------------------------
            // CANVAS DRAWING (Ultra Fast, Zero DOM / React Overhead)
            // -------------------------------------------------------------
            ctx.clearRect(0, 0, width, height);

            // 1. Lush Pitch Lawn with vertical bands
            const stripeWidth = 48;
            for (let x = 0; x < width; x += stripeWidth) {
                ctx.fillStyle = (Math.floor(x / stripeWidth) % 2 === 0) ? '#11401f' : '#144b25';
                ctx.fillRect(x, 0, stripeWidth, height);
            }

            // Radial stadium lighting
            const grad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width * 0.6);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            // 2. Pitch Chalk Markings
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 3;

            // Outer boundary
            ctx.strokeRect(40, 30, 845, 480);

            // Midfield line & center circle
            ctx.beginPath();
            ctx.moveTo(140, 30);
            ctx.lineTo(140, 510);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(140, 270, 85, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(140, 270, 4, 0, Math.PI * 2);
            ctx.fill();

            // Penalty Area (18-yard box)
            ctx.strokeRect(665, 95, 220, 350);

            // 6-yard box
            ctx.strokeRect(800, 185, 85, 170);

            // Penalty Spot
            ctx.beginPath();
            ctx.arc(760, 270, 4, 0, Math.PI * 2);
            ctx.fill();

            // Penalty Arc
            ctx.beginPath();
            ctx.arc(760, 270, 75, Math.PI * 0.65, Math.PI * 1.35);
            ctx.stroke();

            // Corner Arcs
            ctx.beginPath();
            ctx.arc(885, 30, 20, Math.PI * 0.5, Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(885, 510, 20, Math.PI, Math.PI * 1.5);
            ctx.stroke();

            // 3. Goal Net with Physics Distortion
            // Post top: 205, Post bottom: 335. Net extends to x = 940
            const netBackX = 940 + netDistortion;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.moveTo(885, 205);
            ctx.lineTo(netBackX, 212);
            ctx.lineTo(netBackX, 328);
            ctx.lineTo(885, 335);
            ctx.closePath();
            ctx.fill();

            // Net Grid Lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 1;
            for (let ny = 205; ny <= 335; ny += 10) {
                ctx.beginPath();
                ctx.moveTo(885, ny);
                ctx.lineTo(netBackX, ny + (ny - 270) * 0.05);
                ctx.stroke();
            }
            for (let nx = 885; nx <= netBackX; nx += 8) {
                ctx.beginPath();
                ctx.moveTo(nx, 205);
                ctx.lineTo(nx, 335);
                ctx.stroke();
            }

            // White Goal Posts
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(885, 205);
            ctx.lineTo(885, 335);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(885, 205, 4, 0, Math.PI * 2);
            ctx.arc(885, 335, 4, 0, Math.PI * 2);
            ctx.fill();

            // 4. Draw Players (CLEAN MODERN TOKENS - NO NUMBERS!)
            for (let i = 0; i < players.length; i++) {
                const p = players[i];
                const r = 16;

                // Native Drop Shadow circle
                ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
                ctx.beginPath();
                ctx.arc(p.x, p.y + 4, r + 1, 0, Math.PI * 2);
                ctx.fill();

                // Active player aura ring
                if (p.isKey) {
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r + 5 + Math.sin(timestamp * 0.01) * 3, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Main Token Body (team primary color)
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fill();

                // Token Border (team secondary color)
                ctx.strokeStyle = p.secColor;
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Glossy 3D Highlight Arc
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(p.x, p.y - 3, r - 3, Math.PI * 0.9, Math.PI * 2.1);
                ctx.stroke();

                // Clean Modern Token Core (NO NUMBERS AS REQUESTED!)
                if (p.isGK) {
                    // Goalkeeper distinctive icon
                    ctx.fillStyle = '#0f172a';
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🧤', p.x, p.y);
                } else {
                    // Sleek concentric inner circle
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r - 6, 0, Math.PI * 2);
                    ctx.stroke();

                    // Subtle inner accent core dot
                    ctx.fillStyle = p.secColor;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Player Surname Floating Pill (100% REAL PLAYER SURNAMES)
                ctx.fillStyle = 'rgba(6, 10, 18, 0.88)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 0.8;
                ctx.font = 'bold 9px sans-serif';
                const textWidth = ctx.measureText(p.name).width;
                const pillW = Math.max(48, textWidth + 12);
                const pillH = 14;
                const pillX = p.x - pillW / 2;
                const pillY = p.y + r + 3;

                ctx.beginPath();
                ctx.roundRect(pillX, pillY, pillW, pillH, 4);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#f8fafc';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.name, p.x, pillY + 7);
            }

            // 5. Ball Trail & Ball Physics
            ballTrailRef.current.push({ x: ball.x, y: ball.y - ball.z, alpha: 1 });
            if (ballTrailRef.current.length > 6) ballTrailRef.current.shift();

            // Motion trail
            for (let i = 0; i < ballTrailRef.current.length - 1; i++) {
                const pt = ballTrailRef.current[i];
                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + (i / ballTrailRef.current.length) * 0.35})`;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 3 + (i * 0.5), 0, Math.PI * 2);
                ctx.fill();
            }

            // Ball Shadow (moves with altitude Z)
            const shadowRadius = Math.max(3, 7 + ball.z * 0.2);
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0.15, 0.45 - ball.z * 0.008)})`;
            ctx.beginPath();
            ctx.ellipse(ball.x, ball.y + ball.z * 0.85, shadowRadius, shadowRadius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // The Ball (Elevated along Z)
            const bY = ball.y - ball.z;
            const bScale = 1 + ball.z * 0.02;

            if (ball.z > 8) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.beginPath();
                ctx.arc(ball.x, bY, 10 * bScale, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.arc(ball.x, bY, 6 * bScale, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Pentagon pattern on ball
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(ball.x, bY, 2.2 * bScale, 0, Math.PI * 2);
            ctx.fill();

            // 6. Confetti & Sparks Physics on Goal
            if (particlesRef.current.length > 0) {
                for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                    const pt = particlesRef.current[i];
                    pt.x += pt.vx;
                    pt.y += pt.vy;
                    pt.vy += 0.15; // Gravity
                    pt.alpha -= 0.015;

                    if (pt.alpha <= 0) {
                        particlesRef.current.splice(i, 1);
                        continue;
                    }

                    ctx.fillStyle = pt.color;
                    ctx.globalAlpha = pt.alpha;
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1.0;
            }

            // Next frame
            if (t >= 1) {
                setIsPlaying(false);
            } else {
                animFrameRef.current = requestAnimationFrame(renderFrame);
            }
        };

        animFrameRef.current = requestAnimationFrame(renderFrame);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isPlaying, durationMs, playType, sName, aName, gkName, attPrimary, attSecondary, defPrimary, defSecondary, type]);

    const togglePlay = () => {
        if (progressRef.current >= 1) {
            handleRestart();
        } else {
            setIsPlaying(p => !p);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl p-2 sm:p-4 select-none animate-fade-in">
            {/* Ambient Stadium Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-3xl opacity-20"
                    style={{ background: attPrimary }}
                />
            </div>

            {/* Broadcast Theatre Modal */}
            <div className="relative w-full max-w-5xl flex flex-col rounded-2xl overflow-hidden border border-white/15 bg-slate-950/90 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                
                {/* 1. TOP BROADCAST BAR */}
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

                    {/* Speed & Replay Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSpeedMultiplier(s => s === 1 ? 1.5 : s === 1.5 ? 2 : 1)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono font-bold text-slate-300 border border-slate-700 transition-all"
                            title="Velocidad de reproducción"
                        >
                            {speedMultiplier}x
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

                {/* 2. THE 60 FPS CANVAS ARENA */}
                <div className="relative w-full aspect-[16/9] sm:aspect-[16/8.8] bg-[#0c2f17] overflow-hidden select-none">
                    
                    {/* Hardware Accelerated Canvas */}
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full block select-none"
                    />

                    {/* Goal Celebratory Flash Overlay */}
                    {goalBannerVisible && type === 'goal' && (
                        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center bg-black/30 animate-fade-in">
                            <div className="text-center transform animate-scale-in">
                                <span className="text-xs font-black uppercase tracking-[0.4em] text-yellow-400 drop-shadow">
                                    Apex Highlight
                                </span>
                                <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.9)]">
                                    ¡GOOOOOL!
                                </h1>
                                <p className="text-sm sm:text-lg font-bold text-white uppercase tracking-wider drop-shadow mt-1">
                                    {scorer?.name || attackingTeam.name}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Live Commentary Overlay Banner */}
                    <div className="absolute bottom-2.5 left-3 right-3 sm:left-6 sm:right-6 pointer-events-none">
                        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 shadow-lg">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-base sm:text-lg">
                                    {type === 'goal' ? '⚽' : '🧤'}
                                </span>
                                <div className="truncate">
                                    <p ref={subtitleRef} className="text-[11px] sm:text-xs font-black text-yellow-400 uppercase tracking-wide truncate">
                                        Cargando jugada...
                                    </p>
                                    <p ref={phaseRef} className="text-[10px] sm:text-xs text-slate-300 font-medium truncate">
                                        {text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. BOTTOM SCRUBBER & PLAYER PROFILE */}
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
                                {assister ? `Asistencia de ${assister.name}` : attackingTeam.name}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar & Media Controls */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Progress Scrubber */}
                        <div className="flex-1 sm:w-48 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    ref={progressBarRef}
                                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-75"
                                    style={{ width: '0%' }}
                                />
                            </div>
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
