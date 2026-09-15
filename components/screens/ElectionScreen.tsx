import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency } from '../../utils';
import { TeamLogo } from '../../data/teams/helpers';
import { calculatePresidentialScore, submitPresidentialScore } from '../../services/leaderboard';
import {
    Vote,
    Trophy,
    Users,
    Building2,
    CheckCircle2,
    XCircle,
    X,
    Award,
    RotateCcw,
    Globe,
    Sparkles,
    ShieldCheck,
    TrendingUp,
    BarChart3
} from 'lucide-react';

interface ElectionScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    onElectionComplete: () => void;
    onClose?: () => void;
    onQuitToMenu?: () => void;
    onNewGame?: () => void;
}

type ElectionPhase = 'REVIEW' | 'VOTING' | 'VICTORY' | 'DEFEAT';

export const ElectionScreen: React.FC<ElectionScreenProps> = ({
    gameState,
    dispatch,
    onElectionComplete,
    onClose,
    onQuitToMenu,
    onNewGame
}) => {
    const [phase, setPhase] = useState<ElectionPhase>('REVIEW');
    const [countedVotes, setCountedVotes] = useState(0);
    const [finalVoteShare, setFinalVoteShare] = useState(50);
    const [isSubmittingScore, setIsSubmittingScore] = useState(false);
    const [scoreSubmitted, setScoreSubmitted] = useState(false);
    const [scoreError, setScoreError] = useState<string | null>(null);

    const team = gameState.team;
    const mandate = gameState.mandate || {
        startYear: gameState.season - 4,
        currentYear: 4,
        totalMandates: 1,
        isElectionYear: true,
        nextElectionSeason: gameState.season
    };
    const managerName = gameState.playerProfile?.name || 'Presidente';
    const fanApproval = gameState.fanApproval?.rating ?? 50;
    const boardConfidence = gameState.boardConfidence ?? 50;
    const balance = gameState.finances?.balance ?? 0;
    const clubValue = gameState.finances?.clubValue ?? 10000000;

    // Filter trophies won in current 4-year mandate
    const mandateStartSeason = mandate.startYear || (gameState.season - 4);
    const trophiesInMandate = (team.trophies || []).filter(
        t => t.season !== undefined && t.season >= mandateStartSeason
    );

    // Electoral promises calculation
    const promises = gameState.electoralPromises || [];
    const fulfilledPromises = promises.filter(p => p.status === 'fulfilled').length;
    const totalPromises = promises.length;

    // Calculate election projection (win probability & projected vote share)
    const calculateProjection = () => {
        let base = fanApproval;

        // Trophy bonus: +8% per title won during the mandate (capped at +24%)
        const trophyBonus = Math.min(24, trophiesInMandate.length * 8);

        // Financial stability bonus
        let financeBonus = 0;
        if (balance > 15000000) financeBonus = 8;
        else if (balance > 0) financeBonus = 4;
        else if (balance < -10000000) financeBonus = -10;
        else if (balance < 0) financeBonus = -5;

        // Promises bonus
        let promisesBonus = 0;
        if (totalPromises > 0) {
            const ratio = fulfilledPromises / totalPromises;
            if (ratio >= 0.66) promisesBonus = 8;
            else if (ratio >= 0.33) promisesBonus = 4;
            else promisesBonus = -6;
        }

        // Board backing bonus
        const boardBonus = boardConfidence >= 75 ? 5 : boardConfidence <= 30 ? -8 : 0;

        const projected = Math.max(15, Math.min(95, base + trophyBonus + financeBonus + promisesBonus + boardBonus));
        return {
            projected,
            trophyBonus,
            financeBonus,
            promisesBonus,
            boardBonus
        };
    };

    const projection = calculateProjection();

    // Start ballot count simulation
    const handleStartVoting = () => {
        setPhase('VOTING');
        setCountedVotes(0);

        // Determine election outcome with small variance around projection
        const variance = (Math.random() * 10) - 5;
        const finalVote = Math.max(12, Math.min(98, Math.round(projection.projected + variance)));
        setFinalVoteShare(finalVote);

        // Animate counter over 1.6 seconds
        const startTime = performance.now();
        const duration = 1600;

        const animateCount = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(easeOutProgress * finalVote);
            setCountedVotes(current);

            if (progress < 1) {
                requestAnimationFrame(animateCount);
            } else {
                setTimeout(() => {
                    if (finalVote >= 50) {
                        setPhase('VICTORY');
                    } else {
                        setPhase('DEFEAT');
                    }
                }, 400);
            }
        };

        requestAnimationFrame(animateCount);
    };

    // Confirm victory and start new mandate
    const handleConfirmNewMandate = () => {
        const boostedApproval = Math.min(100, fanApproval + 10);
        dispatch({
            type: 'ELECTION_RESULT',
            payload: {
                won: true,
                newApproval: boostedApproval
            }
        });
        onElectionComplete();
        if (onClose) {
            onClose();
        }
    };

    // Submit presidential score on defeat
    const presidentialScore = calculatePresidentialScore(
        (team.trophies || []).length,
        clubValue,
        fanApproval,
        boardConfidence,
        gameState.season
    );

    const handleSubmitLeaderboard = async () => {
        if (isSubmittingScore || scoreSubmitted) return;
        setIsSubmittingScore(true);
        setScoreError(null);
        try {
            await submitPresidentialScore({
                managerName,
                teamName: team.name,
                season: gameState.season,
                trophiesCount: (team.trophies || []).length,
                clubValue,
                fanApproval,
                boardConfidence
            });
            setScoreSubmitted(true);
        } catch (err) {
            console.error('Error submitting presidential score:', err);
            setScoreError('No se pudo conectar con el servidor de clasificaciones.');
        } finally {
            setIsSubmittingScore(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl text-white overflow-y-auto min-h-screen flex flex-col justify-between select-none">
            {/* Ambient atmospheric glows */}
            <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 translate-x-1/2 w-[550px] h-[550px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Top Navigation & Status Bar */}
            <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b border-white/10 relative z-20">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 flex items-center justify-center bg-white/[0.04] rounded-2xl p-1.5 border border-white/10 shadow-md">
                        <TeamLogo team={team} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                Asamblea de Socios
                            </span>
                            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-extrabold uppercase tracking-wider">
                                Ciclo 4 Años
                            </span>
                        </div>
                        <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-tight">{team.name}</h2>
                    </div>
                </div>

                {/* Close / Review Club Button */}
                {phase === 'REVIEW' && onClose && (
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                        title="Cerrar y revisar el club antes de votar"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                        <span className="hidden sm:inline">Revisar Club</span>
                    </button>
                )}
            </header>

            {/* Main Interactive Body */}
            <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center relative z-20">
                <AnimatePresence mode="wait">
                    {/* PHASE 1: REVIEW (Balance del Mandato Presidencial) */}
                    {phase === 'REVIEW' && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-7"
                        >
                            {/* Headline */}
                            <div className="text-center space-y-2">
                                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400/90 block">
                                    Fin de Mandato Institucional • Período {mandateStartSeason} - {gameState.season}
                                </span>
                                <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                                    Balance Presidencial #{mandate.totalMandates}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
                                    Has completado tu período constitucional de 4 años como presidente de <strong className="text-white font-bold">{team.name}</strong>. Los socios del club evalúan tu gestión para renovar tu mandato.
                                </p>
                            </div>

                            {/* 4 Essential Stat Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                                {/* Card 1: Títulos */}
                                <div className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl">
                                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <span className="flex items-center gap-1.5 text-amber-300">
                                            <Trophy className="w-4 h-4 text-amber-400" /> Títulos
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 font-bold">4 Años</span>
                                    </div>
                                    <div>
                                        <div className="text-2xl sm:text-4xl font-black text-amber-400">
                                            {trophiesInMandate.length}
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
                                            {trophiesInMandate.length > 0 
                                                ? trophiesInMandate.map(t => t.name).join(', ') 
                                                : 'Sin títulos oficiales en este ciclo'}
                                        </p>
                                    </div>
                                </div>

                                {/* Card 2: Apoyo Social */}
                                <div className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl">
                                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <span className="flex items-center gap-1.5 text-emerald-300">
                                            <Users className="w-4 h-4 text-emerald-400" /> Socios
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-300 font-bold">Respaldo</span>
                                    </div>
                                    <div>
                                        <div className="text-2xl sm:text-4xl font-black text-emerald-400">
                                            {fanApproval}%
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                            {fanApproval >= 70 ? 'Apoyo social abrumador' : fanApproval >= 50 ? 'Respaldo mayoritario de socios' : 'Clima de descontento popular'}
                                        </p>
                                    </div>
                                </div>

                                {/* Card 3: Economía */}
                                <div className="bg-slate-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl">
                                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <span className="flex items-center gap-1.5 text-sky-300">
                                            <Building2 className="w-4 h-4 text-sky-400" /> Balance
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-400/10 text-sky-300 font-bold">Finanzas</span>
                                    </div>
                                    <div>
                                        <div className={`text-xl sm:text-2xl font-black truncate ${balance >= 0 ? 'text-sky-300' : 'text-rose-400'}`}>
                                            {formatCurrency(balance)}
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
                                            Patrimonio: {formatCurrency(clubValue)}
                                        </p>
                                    </div>
                                </div>

                                {/* Card 4: Promesas */}
                                <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl">
                                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <span className="flex items-center gap-1.5 text-purple-300">
                                            <CheckCircle2 className="w-4 h-4 text-purple-400" /> Promesas
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-400/10 text-purple-300 font-bold">Compromiso</span>
                                    </div>
                                    <div>
                                        <div className="text-2xl sm:text-4xl font-black text-purple-300">
                                            {fulfilledPromises}/{totalPromises}
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                            {totalPromises > 0 
                                                ? `${Math.round((fulfilledPromises / totalPromises) * 100)}% de cumplimiento electoral` 
                                                : 'Sin promesas registradas'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Proyección Electoral Box */}
                            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                                            <BarChart3 className="w-3.5 h-3.5" />
                                            Sondeo Oficial de Socios
                                        </span>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                            Intención de Voto Proyectada
                                        </h3>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <span className="text-2xl sm:text-3xl font-black text-amber-400">
                                            {Math.round(projection.projected)}%
                                        </span>
                                        <span className="text-xs text-slate-400 block font-semibold">de apoyo estimado</span>
                                    </div>
                                </div>

                                {/* Progress Bar with 50% majority marker */}
                                <div className="space-y-2">
                                    <div className="relative h-6 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 p-0.5">
                                        {/* 50% Threshold Guide */}
                                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/60 z-10" />
                                        
                                        {/* Fill Bar */}
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                                                projection.projected >= 60 
                                                    ? 'from-emerald-600 via-emerald-500 to-amber-400' 
                                                    : projection.projected >= 50 
                                                    ? 'from-amber-600 to-emerald-500' 
                                                    : 'from-rose-600 to-amber-600'
                                            }`}
                                            style={{ width: `${projection.projected}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center text-[11px] text-slate-400 px-1 font-semibold">
                                        <span>0% Desaprobación</span>
                                        <span className="text-white font-extrabold flex items-center gap-1">
                                            ▲ Mayoría Absoluta Requerida (50%)
                                        </span>
                                        <span>100% Unanimidad</span>
                                    </div>
                                </div>

                                {/* Key Influencing Factors */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {projection.trophyBonus > 0 && (
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center gap-1">
                                            +{projection.trophyBonus}% Bonus por Títulos
                                        </span>
                                    )}
                                    {projection.financeBonus > 0 && (
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-sky-400/10 border border-sky-400/20 text-sky-300 flex items-center gap-1">
                                            +{projection.financeBonus}% Finanzas Saneadas
                                        </span>
                                    )}
                                    {projection.promisesBonus > 0 && (
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-400/10 border border-purple-400/20 text-purple-300 flex items-center gap-1">
                                            +{projection.promisesBonus}% Cumplimiento de Campaña
                                        </span>
                                    )}
                                    {projection.boardBonus > 0 && (
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 flex items-center gap-1">
                                            +{projection.boardBonus}% Confianza de Junta
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Main Call to Action */}
                            <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                {onClose && (
                                    <button
                                        onClick={onClose}
                                        className="py-4 px-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer order-2 sm:order-1"
                                    >
                                        <RotateCcw className="w-4 h-4 text-slate-400" />
                                        <span>Revisar Club antes de Votar</span>
                                    </button>
                                )}

                                <button
                                    onClick={handleStartVoting}
                                    className="flex-1 py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer order-1 sm:order-2"
                                >
                                    <Vote className="w-5 h-5 text-slate-950" />
                                    <span>Iniciar Escrutinio Oficial de Socios</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 2: VOTING (Escrutinio en Tiempo Real) */}
                    {phase === 'VOTING' && (
                        <motion.div
                            key="voting"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="max-w-xl mx-auto w-full text-center space-y-6 py-10"
                        >
                            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner animate-pulse">
                                <Vote className="w-10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400 block">
                                    Urnas Abiertas • Comicios del Club
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                                    Escrutinio de Socios en Curso
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-400">
                                    Contabilizando los sufragios de la masa societaria de {team.name}...
                                </p>
                            </div>

                            {/* Animated Counter Display */}
                            <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
                                <span className="text-6xl sm:text-7xl font-black text-amber-400 tracking-tight block font-mono">
                                    {countedVotes}%
                                </span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                                    Votos a favor escrutados
                                </span>

                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-100"
                                        style={{ width: `${countedVotes}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 3A: VICTORY (Reelección Exitosa) */}
                    {phase === 'VICTORY' && (
                        <motion.div
                            key="victory"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto w-full space-y-6 text-center"
                        >
                            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-2xl">
                                <Award className="w-10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-400 block">
                                    Proclamación Oficial • Reelección Exitosa
                                </span>
                                <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                                    ¡Mandato Renovado!
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-medium">
                                    Los socios de <strong className="text-white font-bold">{team.name}</strong> han aprobado masivamente la continuidad de tu proyecto presidencial.
                                </p>
                            </div>

                            {/* Next Mandate Contract Card */}
                            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-left space-y-5 shadow-2xl">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Nuevo Ciclo Constitucional</span>
                                        <span className="text-2xl font-black text-white">Mandato #{mandate.totalMandates + 1}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Votos Obtenidos</span>
                                        <span className="text-2xl font-black text-emerald-400">{finalVoteShare}%</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div className="bg-white/[0.03] border border-white/5 p-3.5 rounded-xl">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Duración</span>
                                        <span className="text-sm font-black text-white">4 Años (Hasta {gameState.season + 4})</span>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/5 p-3.5 rounded-xl">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Impulso Social</span>
                                        <span className="text-sm font-black text-emerald-400">+10% Respaldo de Socios</span>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    Con la confianza renovada de la asamblea y la afición, dispones de 4 años para continuar consolidando el crecimiento deportivo e institucional del club.
                                </p>
                            </div>

                            {/* Continue Button */}
                            <button
                                onClick={handleConfirmNewMandate}
                                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Sparkles className="w-5 h-5 text-slate-950" />
                                <span>Comenzar Mandato #{mandate.totalMandates + 1} ({gameState.season})</span>
                            </button>
                        </motion.div>
                    )}

                    {/* PHASE 3B: DEFEAT (Derrota Electoral) */}
                    {phase === 'DEFEAT' && (
                        <motion.div
                            key="defeat"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto w-full space-y-6 text-center"
                        >
                            <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-2xl">
                                <XCircle className="w-10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-400 block">
                                    Asamblea General • Fin de Gestión
                                </span>
                                <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                                    Cese de Mandato
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-medium">
                                    Los socios de <strong className="text-white font-bold">{team.name}</strong> han votado por un cambio en la presidencia tras no alcanzarse la mayoría requerida.
                                </p>
                            </div>

                            {/* Defeat Summary Card */}
                            <div className="bg-slate-900/90 border border-rose-500/30 rounded-3xl p-6 text-left space-y-4 shadow-2xl">
                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Resultado Electoral</span>
                                        <span className="text-xl font-black text-rose-400">{finalVoteShare}% Obtenido</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Requerido</span>
                                        <span className="text-xl font-black text-white">50% Mayoría</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                    <div>
                                        <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">Puntaje Presidencial Definitivo</span>
                                        <span className="text-2xl font-black text-amber-400">{presidentialScore.toLocaleString()} PTS</span>
                                    </div>

                                    <button
                                        onClick={handleSubmitLeaderboard}
                                        disabled={isSubmittingScore || scoreSubmitted}
                                        className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border ${
                                            scoreSubmitted
                                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                                : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300 hover:text-white cursor-pointer'
                                        }`}
                                    >
                                        {scoreSubmitted ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                <span>Registrado</span>
                                            </>
                                        ) : isSubmittingScore ? (
                                            <span>Registrando...</span>
                                        ) : (
                                            <>
                                                <Globe className="w-4 h-4 text-amber-400" />
                                                <span>Inscribir en Leaderboard</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {scoreError && (
                                    <p className="text-xs text-rose-400 text-center font-bold">
                                        {scoreError}
                                    </p>
                                )}
                            </div>

                            {/* Continuation Navigation Options */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                {onQuitToMenu && (
                                    <button
                                        onClick={onQuitToMenu}
                                        className="flex-1 py-3.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <RotateCcw className="w-4 h-4 text-slate-400" />
                                        <span>Menú Principal</span>
                                    </button>
                                )}

                                {onNewGame && (
                                    <button
                                        onClick={onNewGame}
                                        className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span>Comenzar Nueva Carrera</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Footer Details */}
            <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center border-t border-white/5 text-[11px] text-slate-400 relative z-20">
                <span>Apex Football System • Estatuto Oficial de Gobernanza Institucional</span>
            </footer>
        </div>
    );
};
