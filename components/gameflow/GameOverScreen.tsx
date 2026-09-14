import React, { useState } from 'react';
import { GameState, PlayerProfile } from '../../types';
import { formatCurrency } from '../../utils';
import { TeamLogo } from '../../data/teams/helpers';
import { 
    AlertOctagon, 
    Trophy, 
    Award, 
    Globe, 
    CheckCircle2, 
    RotateCcw, 
    Users, 
    TrendingDown,
    Building2
} from 'lucide-react';
import { calculatePresidentialScore, submitPresidentialScore } from '../../services/leaderboard';

interface GameOverScreenProps {
    gameState?: GameState | null;
    playerProfile?: PlayerProfile | null;
    onNewGame: () => void;
    onBackToMenu?: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
    gameState, 
    playerProfile, 
    onNewGame,
    onBackToMenu 
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const team = gameState?.team;
    const season = gameState?.season || 1;
    const trophiesCount = (team?.trophies || []).length;
    const clubValue = gameState?.finances.clubValue || 10000000;
    const fanApproval = gameState?.fanApproval?.overall || 20;
    const boardConfidence = gameState?.boardConfidence || 0;
    const managerName = playerProfile?.name || 'Presidente';
    const teamName = team?.name || 'Club';

    const score = calculatePresidentialScore(
        trophiesCount,
        clubValue,
        fanApproval,
        boardConfidence,
        season
    );

    const handleLeaderboardSubmit = async () => {
        if (isSubmitting || submitted) return;
        setIsSubmitting(true);
        setErrorMsg(null);
        try {
            await submitPresidentialScore({
                managerName,
                teamName,
                season,
                trophiesCount,
                clubValue,
                fanApproval,
                boardConfidence
            });
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting game over score:", err);
            setErrorMsg("No se pudo conectar con el servidor de clasificaciones.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
            {/* Atmospheric crimson glow */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 space-y-8">
                {/* Header: Termination notice */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
                        <AlertOctagon className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 block">
                        Mandato Presidencial Finalizado
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                        Cese de Funciones Oficial
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                        La comisión directiva y la asamblea de socios han determinado revocar tu mandato debido a la pérdida total de confianza en la administración del club.
                    </p>
                </div>

                {/* Club & Career Summary Card */}
                {team && (
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <TeamLogo team={team} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-white uppercase tracking-tight leading-tight">
                                        {team.name}
                                    </h3>
                                    <span className="text-xs text-slate-400 font-medium">
                                        Gestión de <strong className="text-amber-400 font-bold">{managerName}</strong>
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Longevidad</span>
                                <span className="text-lg font-black text-white">{season} Temporada{season !== 1 ? 's' : ''}</span>
                            </div>
                        </div>

                        {/* Career Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                            <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl text-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center justify-center gap-1">
                                    <Trophy className="w-3 h-3 text-amber-400" /> Títulos
                                </span>
                                <span className="text-base font-black text-amber-300">{trophiesCount}</span>
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl text-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center justify-center gap-1">
                                    <Building2 className="w-3 h-3 text-sky-400" /> Valor Club
                                </span>
                                <span className="text-xs font-black text-white truncate block">{formatCurrency(clubValue)}</span>
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl text-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center justify-center gap-1">
                                    <Users className="w-3 h-3 text-emerald-400" /> Apoyo Social
                                </span>
                                <span className="text-base font-black text-slate-300">{fanApproval}%</span>
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl text-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center justify-center gap-1">
                                    <TrendingDown className="w-3 h-3 text-red-400" /> Confianza
                                </span>
                                <span className="text-base font-black text-red-400">{boardConfidence}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Score & Global Leaderboard Integration */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
                            <Award className="w-4 h-4" />
                            <span>Puntaje Presidencial Definitivo</span>
                        </div>
                        <div className="text-3xl font-black text-amber-300">
                            {score.toLocaleString()} <span className="text-xs text-amber-400/60 font-bold">PTS</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                            Registra tu marca histórica en el Salón de la Fama global.
                        </p>
                    </div>

                    <button
                        onClick={handleLeaderboardSubmit}
                        disabled={isSubmitting || submitted}
                        className={`w-full sm:w-auto px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                            submitted
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 text-amber-300 hover:text-white cursor-pointer shadow-lg'
                        }`}
                    >
                        {submitted ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Puntaje Registrado</span>
                            </>
                        ) : isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Registrando...</span>
                            </>
                        ) : (
                            <>
                                <Globe className="w-4 h-4 text-amber-400" />
                                <span>Inscribir en Leaderboard</span>
                            </>
                        )}
                    </button>
                </div>

                {errorMsg && (
                    <p className="text-xs text-red-400 text-center font-bold">
                        {errorMsg}
                    </p>
                )}

                {/* Navigation actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {onBackToMenu && (
                        <button
                            onClick={onBackToMenu}
                            className="flex-1 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Menú Principal</span>
                        </button>
                    )}

                    <button
                        onClick={onNewGame}
                        className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-950/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>Comenzar Nueva Carrera</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
