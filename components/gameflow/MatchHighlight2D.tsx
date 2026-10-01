import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
    number: string;
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

    // Roster of real players from squads
    const attackingSquad = useMemo(() => attackingTeam.squad.slice(0, 11), [attackingTeam]);
    const defendingSquad = useMemo(() => defendingTeam.squad.slice(0, 11), [defendingTeam]);
    const goalkeeper = useMemo(() => {
        const gk = defendingTeam.squad.find(p => p.position === 'POR');
        return gk || defendingTeam.squad[0];
    }, [defendingTeam]);

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

    // Punchy 3.0s base duration for high energy
    const baseDuration = 3200;
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

    // Names for actors
    const sName = scorer?.name.split(' ').slice(-1)[0] || 'Goleador';
    const aName = assister?.name.split(' ').slice(-1)[0] || 'Asistidor';
    const gkName = goalkeeper?.name.split(' ').slice(-1)[0] || 'Arquero';

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

            // Update DOM progress bar & text without triggering React re-renders!
            if (progressBarRef.current) {
                progressBarRef.current.style.width = `${Math.round(t * 100)}%`;
            }

            // -------------------------------------------------------------
            // SCENE COMPUTATION (Choreography State)
            // -------------------------------------------------------------
            let ball = { x: 400, y: 270, z: 0, inNet: false };
            let players: CanvasPlayer[] = [];
            let playTitle = '';
            let phaseDesc = '';
            let netDistortion = 0;
            const goalTime = 0.76;

            // 1. THROUGH BALL 1v1
            if (playType === 'THROUGH_BALL_1V1') {
                playTitle = `⚡ Pase Filtrado de ${aName} y Definición Mano a Mano`;
                const aX = lerp(340, 430, easeOutQuad(clamp(t / 0.35)));
                const aY = lerp(310, 280, clamp(t / 0.35));

                let sX = 480, sY = 200;
                if (t < 0.35) {
                    sX = lerp(480, 580, easeInQuad(t / 0.35));
                    sY = lerp(200, 220, t / 0.35);
                } else if (t < 0.70) {
                    const st = (t - 0.35) / 0.35;
                    sX = lerp(580, 750, easeOutQuad(st));
                    sY = lerp(220, 240, st);
                } else {
                    const st = (t - 0.70) / 0.30;
                    sX = lerp(750, 830, easeOutQuad(st));
                    sY = lerp(240, 160, easeOutQuad(st));
                }

                let gkX = 890, gkY = 270;
                if (t >= 0.40 && t < 0.70) {
                    gkX = lerp(890, 810, easeOutQuad((t - 0.40) / 0.30));
                    gkY = lerp(270, 255, (t - 0.40) / 0.30);
                } else if (t >= 0.70) {
                    gkX = lerp(810, 850, easeOutQuad((t - 0.70) / 0.15));
                    gkY = lerp(255, 290, easeOutQuad((t - 0.70) / 0.15));
                }

                if (t < 0.32) {
                    ball = { x: aX + 12, y: aY - 2, z: 0, inNet: false };
                    phaseDesc = `${aName} levanta la cabeza y busca el hueco...`;
                } else if (t < 0.52) {
                    const st = (t - 0.32) / 0.20;
                    ball = { x: lerp(aX + 12, 670, easeOutQuad(st)), y: lerp(aY - 2, 235, st), z: Math.sin(st * Math.PI) * 4, inNet: false };
                    phaseDesc = `¡Pase entre líneas perfecto al pique de ${sName}!`;
                } else if (t < 0.70) {
                    ball = { x: sX + 12, y: sY + 4, z: 0, inNet: false };
                    phaseDesc = `¡Mano a mano! ${sName} encara en velocidad...`;
                } else if (t < 0.82) {
                    const st = (t - 0.70) / 0.12;
                    ball = { x: lerp(762, 915, easeOutQuad(st)), y: lerp(244, 305, easeOutQuad(st)), z: lerp(0, 16, st), inNet: false };
                    phaseDesc = `¡Definición cruzada al palo más lejano!`;
                } else {
                    ball = { x: 918, y: 308, z: 6, inNet: true };
                    phaseDesc = `¡GOOOOOL! Impecable resolución.`;
                    const nt = (t - 0.82) / 0.18;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 16;
                }

                players = [
                    { id: 'att1', name: aName, number: '10', isAttacker: true, x: aX, y: aY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: sName, number: '9', isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: 'Extremo', number: '7', isAttacker: true, x: lerp(480, 620, t * 0.7), y: 390, color: attPrimary, secColor: attSecondary },
                    { id: 'att4', name: 'Volante', number: '8', isAttacker: true, x: lerp(320, 480, t * 0.5), y: 160, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, number: '1', isAttacker: false, isGK: true, x: gkX, y: gkY, color: '#eab308', secColor: '#0f172a' },
                    { id: 'cb1', name: 'Central 1', number: '2', isAttacker: false, x: lerp(580, 710, easeOutQuad(t * 0.8)), y: 220, color: defPrimary, secColor: defSecondary },
                    { id: 'cb2', name: 'Central 2', number: '6', isAttacker: false, x: lerp(610, 740, easeOutQuad(t * 0.7)), y: 320, color: defPrimary, secColor: defSecondary },
                    { id: 'fb', name: 'Lateral', number: '3', isAttacker: false, x: lerp(490, 650, t * 0.6), y: 430, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 2. WING CROSS & HEADER (8-10 players)
            else if (playType === 'WING_CROSS_HEADER') {
                playTitle = `🌪️ Desborde de ${aName} y Cabezazo de ${sName}`;
                const wX = lerp(450, 780, easeOutQuad(clamp(t / 0.38)));
                const wY = lerp(460, 450, clamp(t / 0.38));

                let sX = 640, sY = 260;
                if (t < 0.38) {
                    sX = lerp(600, 680, t / 0.38);
                } else if (t < 0.68) {
                    sX = lerp(680, 760, easeOutQuad((t - 0.38) / 0.30));
                    sY = lerp(260, 240, (t - 0.38) / 0.30);
                } else {
                    sX = lerp(760, 810, easeOutQuad((t - 0.68) / 0.32));
                    sY = lerp(240, 160, easeOutQuad((t - 0.68) / 0.32));
                }

                let gkX = 890, gkY = 270;
                if (t >= 0.40 && t < 0.68) {
                    gkY = lerp(270, 285, (t - 0.40) / 0.28);
                } else if (t >= 0.68) {
                    gkX = lerp(890, 875, easeOutQuad((t - 0.68) / 0.14));
                    gkY = lerp(285, 225, easeOutQuad((t - 0.68) / 0.14));
                }

                if (t < 0.36) {
                    ball = { x: wX + 12, y: wY - 2, z: 0, inNet: false };
                    phaseDesc = `¡${aName} desborda a fondo por la banda!`;
                } else if (t < 0.68) {
                    const st = (t - 0.36) / 0.32;
                    ball = { x: lerp(wX + 12, 760, st), y: lerp(wY - 2, 240, easeOutQuad(st)), z: Math.sin(st * Math.PI) * 48, inNet: false };
                    phaseDesc = `¡Centro aéreo al corazón del área chica!`;
                } else if (t < 0.78) {
                    const st = (t - 0.68) / 0.10;
                    ball = { x: lerp(760, 915, easeOutQuad(st)), y: lerp(240, 222, easeOutQuad(st)), z: lerp(24, 14, st), inNet: false };
                    phaseDesc = `¡${sName} se eleva y mete un testazo demoledor!`;
                } else {
                    ball = { x: 918, y: 222, z: 12, inNet: true };
                    phaseDesc = `¡GOOOLAZO! Imparable al rincón superior.`;
                    const nt = (t - 0.78) / 0.22;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 16;
                }

                players = [
                    { id: 'att1', name: aName, number: '11', isAttacker: true, x: wX, y: wY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: sName, number: '9', isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: 'Segundo 9', number: '19', isAttacker: true, x: lerp(560, 720, t * 0.6), y: 310, color: attPrimary, secColor: attSecondary },
                    { id: 'att4', name: 'Volante', number: '8', isAttacker: true, x: lerp(450, 600, t * 0.5), y: 210, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, number: '1', isAttacker: false, isGK: true, x: gkX, y: gkY, color: '#eab308', secColor: '#0f172a' },
                    { id: 'cb1', name: 'Central 1', number: '2', isAttacker: false, x: lerp(710, 755, t * 0.6), y: 250, color: defPrimary, secColor: defSecondary },
                    { id: 'cb2', name: 'Central 2', number: '6', isAttacker: false, x: lerp(680, 730, t * 0.5), y: 310, color: defPrimary, secColor: defSecondary },
                    { id: 'fb1', name: 'Lateral Der', number: '4', isAttacker: false, x: lerp(520, 730, easeOutQuad(t * 0.5)), y: 440, color: defPrimary, secColor: defSecondary },
                    { id: 'fb2', name: 'Lateral Izq', number: '3', isAttacker: false, x: 670, y: 150, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 3. TIKI-TAKA COLECTIVO (12-14 players on pitch!)
            else if (playType === 'TIKI_TAKA_TRIANGLE') {
                playTitle = `🔄 Toque y Triangulación Colectiva`;
                const m1X = 380, m1Y = 320;
                const m2X = 520, m2Y = 220;
                const aX = 640, aY = 360;
                const sX = lerp(680, 790, easeOutQuad(t));
                const sY = lerp(270, 260, t);

                if (t < 0.22) {
                    const st = t / 0.22;
                    ball = { x: lerp(m1X, m2X, st), y: lerp(m1Y, m2Y, st), z: 0, inNet: false };
                    phaseDesc = `Circulación paciente en la medular...`;
                } else if (t < 0.44) {
                    const st = (t - 0.22) / 0.22;
                    ball = { x: lerp(m2X, aX, st), y: lerp(m2Y, aY, st), z: 0, inNet: false };
                    phaseDesc = `¡Toque rápido al primer palo desarticulando la marca!`;
                } else if (t < 0.68) {
                    const st = (t - 0.44) / 0.24;
                    ball = { x: lerp(aX, 780, easeOutQuad(st)), y: lerp(aY, 260, easeOutQuad(st)), z: 0, inNet: false };
                    phaseDesc = `¡Pared perfecta y pase de la muerte a ${sName}!`;
                } else if (t < 0.78) {
                    const st = (t - 0.68) / 0.10;
                    ball = { x: lerp(780, 915, easeOutQuad(st)), y: lerp(260, 240, easeOutQuad(st)), z: lerp(0, 10, st), inNet: false };
                    phaseDesc = `¡Empalme al fondo de la red sin oposición!`;
                } else {
                    ball = { x: 918, y: 240, z: 4, inNet: true };
                    phaseDesc = `¡GOLAZO COLECTIVO! Jugada de manual.`;
                    const nt = (t - 0.78) / 0.22;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 15;
                }

                players = [
                    { id: 'att1', name: 'Mediocentro', number: '5', isAttacker: true, x: m1X, y: m1Y, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: 'Interior', number: '8', isAttacker: true, x: m2X, y: m2Y, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: aName, number: '10', isAttacker: true, x: aX, y: aY, color: attPrimary, secColor: attSecondary },
                    { id: 'att4', name: sName, number: '9', isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att5', name: 'Extremo Izq', number: '11', isAttacker: true, x: 620, y: 140, color: attPrimary, secColor: attSecondary },
                    { id: 'att6', name: 'Lateral', number: '4', isAttacker: true, x: 490, y: 440, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, number: '1', isAttacker: false, isGK: true, x: 890, y: 270, color: '#eab308', secColor: '#0f172a' },
                    { id: 'cb1', name: 'Central 1', number: '2', isAttacker: false, x: 740, y: 220, color: defPrimary, secColor: defSecondary },
                    { id: 'cb2', name: 'Central 2', number: '6', isAttacker: false, x: 730, y: 310, color: defPrimary, secColor: defSecondary },
                    { id: 'fb1', name: 'Marcador', number: '3', isAttacker: false, x: 670, y: 390, color: defPrimary, secColor: defSecondary },
                    { id: 'dm1', name: 'Pivote Def', number: '5', isAttacker: false, x: 570, y: 270, color: defPrimary, secColor: defSecondary },
                    { id: 'dm2', name: 'Contención', number: '8', isAttacker: false, x: 480, y: 230, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 4. CORNER KICK HEADER (15 players in box!)
            else if (playType === 'CORNER_KICK_HEADER') {
                playTitle = `📐 Córner al Área y Frentazo en el Tumulto`;
                const cornerX = 890, cornerY = 480;
                let sX = 770, sY = 250;
                if (t > 0.40) {
                    sX = lerp(770, 810, easeOutQuad((t - 0.40) / 0.28));
                    sY = lerp(250, 235, (t - 0.40) / 0.28);
                }

                if (t < 0.35) {
                    ball = { x: cornerX - 10, y: cornerY - 10, z: 0, inNet: false };
                    phaseDesc = `${aName} acomoda el balón en la esquina...`;
                } else if (t < 0.68) {
                    const st = (t - 0.35) / 0.33;
                    ball = { x: lerp(cornerX, 810, st), y: lerp(cornerY, 235, easeOutQuad(st)), z: Math.sin(st * Math.PI) * 55, inNet: false };
                    phaseDesc = `¡Centro cerrado con veneno a la olla!`;
                } else if (t < 0.78) {
                    const st = (t - 0.68) / 0.10;
                    ball = { x: lerp(810, 915, easeOutQuad(st)), y: lerp(235, 215, easeOutQuad(st)), z: lerp(20, 10, st), inNet: false };
                    phaseDesc = `¡${sName} anticipa a todos y mete el frentazo al arco!`;
                } else {
                    ball = { x: 918, y: 215, z: 8, inNet: true };
                    phaseDesc = `¡GOOOOOL DE CÓRNER! Locura en el área.`;
                    const nt = (t - 0.78) / 0.22;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 18;
                }

                players = [
                    { id: 'att1', name: aName, number: '11', isAttacker: true, x: cornerX, y: cornerY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: sName, number: '9', isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: 'Central Atacante', number: '2', isAttacker: true, x: 790, y: 290, color: attPrimary, secColor: attSecondary },
                    { id: 'att4', name: 'Espigado', number: '14', isAttacker: true, x: 830, y: 260, color: attPrimary, secColor: attSecondary },
                    { id: 'att5', name: 'Reboteador', number: '8', isAttacker: true, x: 670, y: 270, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, number: '1', isAttacker: false, isGK: true, x: 890, y: 250, color: '#eab308', secColor: '#0f172a' },
                    { id: 'cb1', name: 'Defensor 1', number: '2', isAttacker: false, x: 805, y: 240, color: defPrimary, secColor: defSecondary },
                    { id: 'cb2', name: 'Defensor 2', number: '6', isAttacker: false, x: 790, y: 275, color: defPrimary, secColor: defSecondary },
                    { id: 'cb3', name: 'Poste 1', number: '3', isAttacker: false, x: 890, y: 205, color: defPrimary, secColor: defSecondary },
                    { id: 'cb4', name: 'Poste 2', number: '4', isAttacker: false, x: 890, y: 335, color: defPrimary, secColor: defSecondary },
                    { id: 'cb5', name: 'Marca 1', number: '5', isAttacker: false, x: 820, y: 280, color: defPrimary, secColor: defSecondary },
                    { id: 'cb6', name: 'Marca 2', number: '7', isAttacker: false, x: 835, y: 220, color: defPrimary, secColor: defSecondary },
                    { id: 'cb7', name: 'Salida', number: '10', isAttacker: false, x: 660, y: 350, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 5. FREE KICK BEND (13 players with 4-man wall!)
            else if (playType === 'FREE_KICK_BEND') {
                playTitle = `🎯 Tiro Libre Maestro al Ángulo`;
                const fkX = 580, fkY = 220;
                let sX = lerp(550, 580, clamp(t / 0.35));
                let sY = lerp(230, 220, clamp(t / 0.35));

                // 4-Man Defensive Wall jumps at shot
                const wallJump = (t >= 0.35 && t <= 0.60) ? Math.sin(((t - 0.35) / 0.25) * Math.PI) * 12 : 0;

                if (t < 0.35) {
                    ball = { x: fkX, y: fkY, z: 0, inNet: false };
                    phaseDesc = `${sName} mide los pasos y respira hondo...`;
                } else if (t < 0.68) {
                    const st = (t - 0.35) / 0.33;
                    ball = { 
                        x: lerp(fkX, 915, easeOutQuad(st)), 
                        y: lerp(fkY, 218, easeOutQuad(st)), 
                        z: Math.sin(st * Math.PI) * 32, 
                        inNet: false 
                    };
                    phaseDesc = `¡SUPERÓ LA BARRERA CON UNA COMBA PERFECTA!`;
                } else {
                    ball = { x: 918, y: 218, z: 18, inNet: true };
                    phaseDesc = `¡¡GOLAZO DE TIRO LIBRE!! ¡AL ÁNGULO!`;
                    const nt = (t - 0.68) / 0.32;
                    netDistortion = Math.sin(nt * Math.PI * 5) * (1 - nt) * 18;
                }

                players = [
                    { id: 'att1', name: sName, number: '10', isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: 'Distractor', number: '7', isAttacker: true, x: 570, y: 260, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: 'Cargador', number: '9', isAttacker: true, x: 740, y: 290, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, number: '1', isAttacker: false, isGK: true, x: lerp(890, 875, easeOutQuad(t * 0.7)), y: lerp(280, 225, easeOutQuad(t * 0.7)), color: '#eab308', secColor: '#0f172a' },
                    // 4-Man Wall
                    { id: 'w1', name: 'Barrera 1', number: '2', isAttacker: false, x: 690, y: 200 - wallJump, color: defPrimary, secColor: defSecondary },
                    { id: 'w2', name: 'Barrera 2', number: '4', isAttacker: false, x: 690, y: 220 - wallJump, color: defPrimary, secColor: defSecondary },
                    { id: 'w3', name: 'Barrera 3', number: '5', isAttacker: false, x: 690, y: 240 - wallJump, color: defPrimary, secColor: defSecondary },
                    { id: 'w4', name: 'Barrera 4', number: '6', isAttacker: false, x: 690, y: 260 - wallJump, color: defPrimary, secColor: defSecondary },
                    // Penalty box markers
                    { id: 'cb1', name: 'Central', number: '3', isAttacker: false, x: 770, y: 280, color: defPrimary, secColor: defSecondary },
                    { id: 'cb2', name: 'Lateral', number: '8', isAttacker: false, x: 780, y: 320, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 6. COUNTER ATTACK BLITZ (Costa a costa a máxima velocidad)
            else if (playType === 'COUNTER_ATTACK_BLITZ') {
                playTitle = `⚡ Contragolpe Letal a Toda Velocidad`;
                const speedT = easeOutQuad(t);
                const sX = lerp(350, 780, speedT);
                const sY = lerp(300, 260, speedT);
                const wX = lerp(420, 830, speedT);
                const wY = lerp(420, 360, speedT);

                if (t < 0.40) {
                    ball = { x: wX + 10, y: wY, z: 0, inNet: false };
                    phaseDesc = `¡Salida fulgurante tras recuperar la pelota!`;
                } else if (t < 0.65) {
                    const st = (t - 0.40) / 0.25;
                    ball = { x: lerp(wX, sX + 20, st), y: lerp(wY, sY, st), z: 2, inNet: false };
                    phaseDesc = `¡Pase rasante al segundo palo superando a los defensores!`;
                } else if (t < 0.76) {
                    const st = (t - 0.65) / 0.11;
                    ball = { x: lerp(sX + 20, 915, easeOutQuad(st)), y: lerp(sY, 280, easeOutQuad(st)), z: lerp(0, 10, st), inNet: false };
                    phaseDesc = `¡${sName} se barre y la manda a guardar!`;
                } else {
                    ball = { x: 918, y: 280, z: 4, inNet: true };
                    phaseDesc = `¡CONTRAGOLPE LETAL! Definición quirúrgica.`;
                    const nt = (t - 0.76) / 0.24;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 16;
                }

                players = [
                    { id: 'att1', name: aName, number: '7', isAttacker: true, x: wX, y: wY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: sName, number: '9', isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att3', name: 'Acompañante', number: '11', isAttacker: true, x: lerp(300, 680, speedT), y: 170, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, number: '1', isAttacker: false, isGK: true, x: 890, y: 270, color: '#eab308', secColor: '#0f172a' },
                    { id: 'cb1', name: 'Defensor 1', number: '2', isAttacker: false, x: lerp(450, 770, speedT * 0.9), y: 240, color: defPrimary, secColor: defSecondary },
                    { id: 'cb2', name: 'Defensor 2', number: '6', isAttacker: false, x: lerp(500, 790, speedT * 0.8), y: 310, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 7. SOLO DRIBBLE GOLAZO (Slalom individual)
            else if (playType === 'SOLO_DRIBBLE_GOLAZO') {
                playTitle = `🌟 Obra de Arte Individual de ${sName}`;
                let sX = 520, sY = 270;
                if (t < 0.30) {
                    sX = lerp(520, 630, t / 0.30);
                    sY = lerp(270, 240, t / 0.30);
                } else if (t < 0.60) {
                    sX = lerp(630, 760, (t - 0.30) / 0.30);
                    sY = lerp(240, 290, (t - 0.30) / 0.30); // slalom cut
                } else if (t < 0.75) {
                    sX = lerp(760, 830, (t - 0.60) / 0.15);
                    sY = lerp(290, 250, (t - 0.60) / 0.15);
                } else {
                    sX = lerp(830, 870, (t - 0.75) / 0.25);
                }

                if (t < 0.30) {
                    ball = { x: sX + 10, y: sY + 2, z: 0, inNet: false };
                    phaseDesc = `¡${sName} deja al primer marcador en el camino con una pisada!`;
                } else if (t < 0.60) {
                    ball = { x: sX + 10, y: sY + 2, z: 0, inNet: false };
                    phaseDesc = `¡Qué caño metió! ¡Pasa entre dos defensores!`;
                } else if (t < 0.74) {
                    ball = { x: sX + 12, y: sY + 2, z: 0, inNet: false };
                    phaseDesc = `¡Elude al arquero que queda pagando en el piso!`;
                } else {
                    const st = (t - 0.74) / 0.10;
                    ball = { x: lerp(842, 915, clamp(st)), y: 250, z: 0, inNet: t >= 0.84 };
                    phaseDesc = `¡GOLAZO MONUMENTAL! La empujó al arco vacío.`;
                    if (t >= 0.84) netDistortion = Math.sin((t - 0.84) * 20) * 12;
                }

                players = [
                    { id: 'att1', name: sName, number: '10', isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, number: '1', isAttacker: false, isGK: true, x: lerp(890, 820, easeOutQuad(t * 0.6)), y: lerp(270, 280, t * 0.6), color: '#eab308', secColor: '#0f172a' },
                    { id: 'cb1', name: 'Central 1', number: '2', isAttacker: false, x: lerp(640, 680, t * 0.3), y: 230, color: defPrimary, secColor: defSecondary },
                    { id: 'cb2', name: 'Central 2', number: '6', isAttacker: false, x: 740, y: 270, color: defPrimary, secColor: defSecondary },
                    { id: 'fb', name: 'Lateral', number: '3', isAttacker: false, x: 670, y: 340, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 8. WOODWORK REBOUND GOAL
            else if (playType === 'WOODWORK_REBOUND_GOAL') {
                playTitle = `💥 Cañonazo al Poste y Rebote Oportunista`;
                if (t < 0.35) {
                    const st = t / 0.35;
                    ball = { x: lerp(540, 890, easeInQuad(st)), y: lerp(290, 210, st), z: lerp(0, 30, st), inNet: false };
                    phaseDesc = `¡Bombazo furibundo que se estrella en el travesaño!`;
                } else if (t < 0.65) {
                    const st = (t - 0.35) / 0.30;
                    ball = { x: lerp(890, 770, easeOutQuad(st)), y: lerp(210, 270, st), z: lerp(30, 8, st), inNet: false };
                    phaseDesc = `¡El balón sale disparado al corazón del área!`;
                } else if (t < 0.78) {
                    const st = (t - 0.65) / 0.13;
                    ball = { x: lerp(770, 915, easeOutQuad(st)), y: lerp(270, 280, st), z: lerp(8, 12, st), inNet: false };
                    phaseDesc = `¡${sName} captura el rebote y fusila de primera!`;
                } else {
                    ball = { x: 918, y: 280, z: 8, inNet: true };
                    phaseDesc = `¡GOOOOOL! Atento para capturar la segunda jugada.`;
                    const nt = (t - 0.78) / 0.22;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 16;
                }

                players = [
                    { id: 'att1', name: aName, number: '8', isAttacker: true, x: 540, y: 290, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: sName, number: '9', isAttacker: true, isKey: true, x: lerp(680, 770, easeOutQuad(t)), y: lerp(250, 270, t), color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, number: '1', isAttacker: false, isGK: true, x: 890, y: lerp(230, 270, t), color: '#eab308', secColor: '#0f172a' },
                    { id: 'cb1', name: 'Central 1', number: '2', isAttacker: false, x: 760, y: 230, color: defPrimary, secColor: defSecondary },
                    { id: 'cb2', name: 'Central 2', number: '6', isAttacker: false, x: 780, y: 320, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 9. LONG RANGE STRIKE
            else if (playType === 'LONG_RANGE_STRIKE') {
                playTitle = `🚀 Misil Teledirigido desde Fuera del Área`;
                const sX = lerp(510, 600, easeOutQuad(clamp(t / 0.38)));
                const sY = lerp(300, 260, clamp(t / 0.38));

                if (t < 0.38) {
                    ball = { x: sX + 12, y: sY + 4, z: 0, inNet: false };
                    phaseDesc = `${sName} se acomoda el balón para sacar el latigazo...`;
                } else if (t < 0.65) {
                    const st = (t - 0.38) / 0.27;
                    ball = { x: lerp(612, 915, easeInQuad(st)), y: lerp(264, 218, easeOutQuad(st)), z: lerp(0, 26, st), inNet: false };
                    phaseDesc = `¡¡QUÉ BOMBAZO TREMENDO AL ÁNGULO!!`;
                } else {
                    ball = { x: 918, y: 218, z: 22, inNet: true };
                    phaseDesc = `¡¡GOLAZO MONUMENTAL!! Inalcanzable.`;
                    const nt = (t - 0.65) / 0.35;
                    netDistortion = Math.sin(nt * Math.PI * 5) * (1 - nt) * 18;
                }

                players = [
                    { id: 'att1', name: sName, number: '10', isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'att2', name: 'Delantero', number: '9', isAttacker: true, x: 710, y: 190, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, number: '1', isAttacker: false, isGK: true, x: lerp(890, 865, easeOutQuad(t * 0.7)), y: lerp(270, 220, easeOutQuad(t * 0.7)), color: '#eab308', secColor: '#0f172a' },
                    { id: 'cb1', name: 'Central 1', number: '2', isAttacker: false, x: 670, y: 255, color: defPrimary, secColor: defSecondary },
                    { id: 'cb2', name: 'Central 2', number: '6', isAttacker: false, x: 710, y: 320, color: defPrimary, secColor: defSecondary },
                ];
            }

            // 10. PENALTY KICK
            else if (playType === 'PENALTY_KICK') {
                playTitle = `🎯 Definición Desde los Doce Pasos`;
                const runUp = clamp(t / 0.38);
                const sX = lerp(680, 755, easeInQuad(runUp));
                const sY = 270;

                let gkX = 890, gkY = 270;
                if (t >= 0.35 && t < 0.65) {
                    gkX = lerp(890, 875, easeOutQuad((t - 0.35) / 0.30));
                    gkY = lerp(270, 315, easeOutQuad((t - 0.35) / 0.30));
                }

                if (t < 0.38) {
                    ball = { x: 760, y: 270, z: 0, inNet: false };
                    phaseDesc = `${sName} toma carrera concentrado...`;
                } else if (t < 0.60) {
                    const st = (t - 0.38) / 0.22;
                    ball = { x: lerp(760, 915, easeOutQuad(st)), y: lerp(270, 225, easeOutQuad(st)), z: lerp(0, 15, st), inNet: false };
                    phaseDesc = `¡Engañó por completo al guardameta!`;
                } else {
                    ball = { x: 918, y: 225, z: 10, inNet: true };
                    phaseDesc = `¡GOOOOOL DE PENAL! Gran categoría.`;
                    const nt = (t - 0.60) / 0.40;
                    netDistortion = Math.sin(nt * Math.PI * 4) * (1 - nt) * 15;
                }

                players = [
                    { id: 'att1', name: sName, number: '9', isAttacker: true, isKey: true, x: sX, y: sY, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, number: '1', isAttacker: false, isGK: true, x: gkX, y: gkY, color: '#eab308', secColor: '#0f172a' },
                    { id: 'cb1', name: 'Defensor 1', number: '2', isAttacker: false, x: 630, y: 220, color: defPrimary, secColor: defSecondary },
                    { id: 'cb2', name: 'Defensor 2', number: '6', isAttacker: false, x: 630, y: 320, color: defPrimary, secColor: defSecondary },
                    { id: 'att2', name: 'Compañero', number: '8', isAttacker: true, x: 620, y: 270, color: attPrimary, secColor: attSecondary },
                ];
            }

            // 11. MIRACLE SAVE
            else {
                playTitle = `🧤 ¡Paradón Impresionante de ${gkName}!`;
                const aX = lerp(640, 750, easeOutQuad(clamp(t / 0.38)));
                const aY = 250;

                let gkX = 890, gkY = 270;
                if (t >= 0.38 && t < 0.60) {
                    gkX = lerp(890, 860, easeOutQuad((t - 0.38) / 0.22));
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
                    ball = { x: lerp(862, 895, st), y: lerp(225, 205, easeOutQuad(st)), z: lerp(18, 25, st), inNet: false };
                    phaseDesc = `¡¡MANOTAZO MILAGROSO!! ¡EL BALÓN PEGA EN EL POSTE!`;
                } else {
                    const st = (t - 0.75) / 0.25;
                    ball = { x: lerp(895, 820, easeOutQuad(st)), y: lerp(205, 140, easeOutQuad(st)), z: lerp(25, 0, st), inNet: false };
                    phaseDesc = `¡Salvada antológica para evitar el gol!`;
                }

                players = [
                    { id: 'att1', name: sName, number: '9', isAttacker: true, isKey: true, x: aX, y: aY, color: attPrimary, secColor: attSecondary },
                    { id: 'gk', name: gkName, number: '1', isAttacker: false, isGK: true, isKey: true, x: gkX, y: gkY, color: '#eab308', secColor: '#0f172a' },
                    { id: 'cb1', name: 'Central 1', number: '2', isAttacker: false, x: 710, y: 280, color: defPrimary, secColor: defSecondary },
                ];
            }

            // Update Subtitle & Phase Text
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
                    const angle = (Math.PI * 0.8) + (Math.random() * Math.PI * 0.4); // shoots out from goalmouth
                    const speed = 3 + Math.random() * 8;
                    particlesRef.current.push({
                        x: 890,
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
            // CANVAS DRAWING (Hardware-Accelerated Zero DOM Overhead)
            // -------------------------------------------------------------
            // 1. Clear & Background
            ctx.clearRect(0, 0, width, height);

            // Alternating grass stripes
            const stripeWidth = 48;
            for (let x = 0; x < width; x += stripeWidth) {
                ctx.fillStyle = (Math.floor(x / stripeWidth) % 2 === 0) ? '#11401f' : '#144b25';
                ctx.fillRect(x, 0, stripeWidth, height);
            }

            // Subtle pitch vignette
            const grad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width * 0.6);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            // 2. Pitch Chalk Markings
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 3;

            // Outer boundary
            ctx.strokeRect(40, 30, 855, 480);

            // Midfield line & center circle
            ctx.beginPath();
            ctx.moveTo(140, 30);
            ctx.lineTo(140, 510);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(140, 270, 85, 0, Math.PI * 2);
            ctx.stroke();

            // Center spot
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(140, 270, 4, 0, Math.PI * 2);
            ctx.fill();

            // Penalty Area (18-yard box)
            ctx.strokeRect(675, 95, 220, 350);

            // 6-yard box
            ctx.strokeRect(810, 185, 85, 170);

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
            ctx.arc(895, 30, 20, Math.PI * 0.5, Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(895, 510, 20, Math.PI, Math.PI * 1.5);
            ctx.stroke();

            // 3. Goal Net with Physics Distortion
            const netBackX = 935 + netDistortion;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.moveTo(895, 210);
            ctx.lineTo(netBackX, 215);
            ctx.lineTo(netBackX, 325);
            ctx.lineTo(895, 330);
            ctx.closePath();
            ctx.fill();

            // Net Grid Lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 1;
            for (let ny = 210; ny <= 330; ny += 10) {
                ctx.beginPath();
                ctx.moveTo(895, ny);
                ctx.lineTo(netBackX, ny + (ny - 270) * 0.05);
                ctx.stroke();
            }
            for (let nx = 895; nx <= netBackX; nx += 8) {
                ctx.beginPath();
                ctx.moveTo(nx, 210);
                ctx.lineTo(nx, 330);
                ctx.stroke();
            }

            // White Goal Posts
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(895, 210);
            ctx.lineTo(895, 330);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(895, 210, 4, 0, Math.PI * 2);
            ctx.arc(895, 330, 4, 0, Math.PI * 2);
            ctx.fill();

            // 4. Draw Players (Tokens / Chips)
            for (let i = 0; i < players.length; i++) {
                const p = players[i];
                const r = 16;

                // Native Drop Shadow circle (Ultra Fast vs SVG Filters!)
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

                // Main Token Body
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fill();

                // Border
                ctx.strokeStyle = p.secColor;
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Glossy 3D Highlight Arc
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(p.x, p.y - 3, r - 3, Math.PI * 0.9, Math.PI * 2.1);
                ctx.stroke();

                // Jersey Number / GK Badge
                ctx.fillStyle = p.isGK ? '#0f172a' : p.secColor;
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.isGK ? '🧤' : p.number, p.x, p.y);

                // Player Surname Floating Pill
                ctx.fillStyle = 'rgba(8, 12, 20, 0.85)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 0.8;
                const textWidth = ctx.measureText(p.name).width;
                const pillW = Math.max(48, textWidth + 10);
                const pillH = 14;
                const pillX = p.x - pillW / 2;
                const pillY = p.y + r + 3;

                ctx.beginPath();
                ctx.roundRect(pillX, pillY, pillW, pillH, 4);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 9px sans-serif';
                ctx.fillText(p.name, p.x, pillY + 7);
            }

            // 5. Ball Trail & Ball Physics
            // Update Ball Trail buffer
            ballTrailRef.current.push({ x: ball.x, y: ball.y - ball.z, alpha: 1 });
            if (ballTrailRef.current.length > 6) ballTrailRef.current.shift();

            // Draw motion trail
            for (let i = 0; i < ballTrailRef.current.length - 1; i++) {
                const pt = ballTrailRef.current[i];
                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + (i / ballTrailRef.current.length) * 0.35})`;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 3 + (i * 0.5), 0, Math.PI * 2);
                ctx.fill();
            }

            // Ball Shadow (moves and scales with altitude Z)
            const shadowRadius = Math.max(3, 7 + ball.z * 0.2);
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0.15, 0.45 - ball.z * 0.008)})`;
            ctx.beginPath();
            ctx.ellipse(ball.x, ball.y + ball.z * 0.85, shadowRadius, shadowRadius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // The Ball (Elevated along Z)
            const bY = ball.y - ball.z;
            const bScale = 1 + ball.z * 0.02;

            // Ball glow if aerial
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

            // Ball pentagon pattern
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
                        {/* Progress Scrubber (Zero React Re-render direct DOM ref) */}
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
