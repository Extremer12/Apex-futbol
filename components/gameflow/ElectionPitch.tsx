import React, { useState, useEffect, useRef } from 'react';
import { Team, PlayerProfile } from '../../types';
import { LoadingSpinner } from '../icons';
import { StartupScreenContainer } from './StartupScreenContainer';
import { selectDebateQuestions, evaluateDebate, DebateQuestion, DebateOption, OpponentCandidate, generateOpponents } from '../../services/electionDebate';

interface ElectionPitchProps {
    team: Team;
    player: PlayerProfile;
    onSubmitPitch: (pitch: string) => void;
    onBack: () => void;
    isLoading: boolean;
}

export const ElectionPitch: React.FC<ElectionPitchProps> = ({ team, player, onSubmitPitch, onBack, isLoading }) => {
    const [gamePhase, setGamePhase] = useState<'intro' | 'debate' | 'done'>('intro');
    const [questions, setQuestions] = useState<DebateQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [allAnswers, setAllAnswers] = useState<DebateOption[]>([]);
    const [opponents, setOpponents] = useState<OpponentCandidate[]>([]);
    const [picked, setPicked] = useState<DebateOption | null>(null);
    const [boardScore, setBoardScore] = useState(50 + Math.min(player.experience, 10));
    const [fanScore, setFanScore] = useState(50 + Math.min(player.experience, 10));
    const [headline, setHeadline] = useState('');
    const submitted = useRef(false);

    useEffect(() => {
        const qs = selectDebateQuestions();
        setQuestions(qs);
        setOpponents(generateOpponents(team.tier));
        const t = setTimeout(() => setGamePhase('debate'), 4000);
        return () => clearTimeout(t);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const currentQuestion: DebateQuestion | undefined = questions[currentIndex];

    const handlePick = (option: DebateOption) => {
        if (picked) return;
        setPicked(option);

        const newBoard = Math.max(0, Math.min(100, boardScore + option.boardImpact));
        const newFan = Math.max(0, Math.min(100, fanScore + option.fanImpact));
        setBoardScore(newBoard);
        setFanScore(newFan);

        if (option.boardImpact > 0 && option.fanImpact < 0) setHeadline('LA DIRECTIVA APLAUDE MIENTRAS LAS GRADAS GUARDAN SILENCIO');
        else if (option.fanImpact >= 15) setHeadline('¡EUFORIA TOTAL! EL PÚBLICO ENLOQUECE CON LA PROPUESTA');
        else if (option.boardImpact <= -10) setHeadline('ALERTA: LA MESA DIRECTIVA MUESTRA CLARO DESCONTENTO');
        else if (option.boardImpact > 0 && option.fanImpact > 0) setHeadline('MAGISTRAL: CONVIENCE A SOCIOS Y DIRECTIVOS POR IGUAL');
        else setHeadline('DECLARACIÓN POLÉMICA GENERA DIVISIONES EN LA SALA');

        setOpponents(prev => prev.map(o => ({
            ...o,
            score: Math.max(30, Math.min(95, o.score + (Math.random() * 8 - 4)))
        })));

        setTimeout(() => {
            const updatedAnswers = [...allAnswers, option];
            setAllAnswers(updatedAnswers);

            if (currentIndex < questions.length - 1) {
                setCurrentIndex(i => i + 1);
                setPicked(null);
                setHeadline('');
            } else {
                if (!submitted.current) {
                    submitted.current = true;
                    setGamePhase('done');
                    const result = evaluateDebate(updatedAnswers, team, player);
                    const summary = `Score: ${result.playerScore} - ${result.success ? 'Won' : 'Lost'}`;
                    setTimeout(() => onSubmitPitch(summary), 2500);
                }
            }
        }, 2200);
    };

    if (gamePhase === 'intro') {
        return (
            <StartupScreenContainer>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0c1631_0%,#020617_100%)]" />
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 w-full">
                    {/* Broadcast Banner */}
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-red-600/90 text-white px-6 py-2 rounded-full animate-fade-in shadow-[0_0_30px_rgba(220,38,38,0.4)] backdrop-blur-sm border border-red-500/50">
                        <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
                        <span className="font-black text-sm uppercase tracking-[0.2em]">Transmisión Especial en Vivo</span>
                    </div>

                    <div className="flex flex-col items-center animate-scale-in">
                        <div className="relative mb-10">
                            <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full animate-pulse" />
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-900/50 border-4 border-slate-700/50 flex items-center justify-center p-6 shadow-2xl relative z-10 backdrop-blur-xl">
                                <img src={team.logo} alt={team.name} className="w-full h-full object-contain drop-shadow-2xl filter brightness-110" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                        </div>

                        <h2 className="text-blue-400 font-bold tracking-[0.4em] uppercase text-xs md:text-sm mb-4">Gran Debate Presidencial</h2>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-6 drop-shadow-2xl">
                            {team.name}
                        </h1>
                        
                        <div className="flex items-center gap-4 bg-slate-900/80 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md mb-12">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xl">🎙️</div>
                            <div className="text-left">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Candidato Principal</p>
                                <p className="text-white font-black text-lg">{player.name}</p>
                            </div>
                        </div>

                        {/* Animated Loader */}
                        <div className="w-64 flex flex-col items-center gap-3">
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full w-full animate-[shrink_3s_linear_forwards]" />
                            </div>
                            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Conectando estudios...</p>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes shrink { from { width: 0%; } to { width: 100%; } }
                `}</style>
            </StartupScreenContainer>
        );
    }

    if (gamePhase === 'done' || !currentQuestion) {
        return (
            <StartupScreenContainer>
                <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-5xl animate-bounce shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        🗳️
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-2">Urnas Cerradas</h2>
                        <p className="text-emerald-400 text-lg font-bold tracking-widest uppercase">Escrutinio en proceso...</p>
                    </div>
                    <div className="mt-4"><LoadingSpinner /></div>
                </div>
            </StartupScreenContainer>
        );
    }

    const getScoreColor = (score: number) => score >= 75 ? 'text-emerald-400' : score <= 40 ? 'text-red-500' : 'text-blue-400';
    const getScoreBar = (score: number) => score >= 75 ? 'from-emerald-600 to-emerald-400' : score <= 40 ? 'from-red-600 to-red-400' : 'from-blue-600 to-blue-400';

    return (
        <div className="min-h-screen bg-[#020617] relative flex flex-col overflow-hidden font-sans">
            {/* TV Broadcast Background Elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
            
            {/* ── BROADCAST HEADER ── */}
            <header className="relative z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl p-2 border border-white/10 shadow-inner">
                            <img src={team.logo} alt={team.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-[9px] text-red-500 font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-0.5">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> EN DIRECTO
                            </div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none">{team.name} DECIDE</h1>
                        </div>
                    </div>

                    {/* Meters */}
                    <div className="flex flex-1 max-w-md gap-4">
                        <div className="flex-1 bg-slate-900/80 rounded-xl p-2.5 border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-end mb-1.5 relative z-10">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aprobación Directiva</span>
                                <span className={`text-base font-black leading-none ${getScoreColor(boardScore)} transition-colors duration-500`}>{Math.round(boardScore)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden relative z-10 shadow-inner">
                                <div className={`h-full bg-gradient-to-r ${getScoreBar(boardScore)} transition-all duration-1000 ease-out`} style={{ width: `${boardScore}%` }} />
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-900/80 rounded-xl p-2.5 border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-end mb-1.5 relative z-10">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aprobación Socios</span>
                                <span className={`text-base font-black leading-none ${getScoreColor(fanScore)} transition-colors duration-500`}>{Math.round(fanScore)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden relative z-10 shadow-inner">
                                <div className={`h-full bg-gradient-to-r ${getScoreBar(fanScore)} transition-all duration-1000 ease-out`} style={{ width: `${fanScore}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── MAIN CONTENT GRID ── */}
            <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
                
                {/* ── LEFT: CANDIDATES PODIUM ── */}
                <div className="lg:w-80 flex flex-col gap-4 order-2 lg:order-1">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-2">Sondeo a Boca de Urna</h3>
                    <div className="flex flex-col gap-3">
                        <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/80 border border-blue-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full" />
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl shadow-lg z-10">🤵</div>
                            <div className="z-10">
                                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1">Tú (Favorito)</p>
                                <p className="text-lg font-black text-white leading-none">{player.name}</p>
                            </div>
                            <div className="ml-auto text-2xl font-black text-blue-400 z-10">{Math.round((boardScore + fanScore) / 2)}%</div>
                        </div>

                        {opponents.map((opp, i) => (
                            <div key={i} className="bg-slate-900/60 border border-white/5 rounded-2xl p-3 flex items-center gap-4 hover:bg-slate-800/80 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl">{opp.avatar}</div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Opositor</p>
                                    <p className="text-sm font-bold text-slate-300 leading-none">{opp.name}</p>
                                </div>
                                <div className="ml-auto text-lg font-black text-slate-500">{Math.round(opp.score)}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT: DEBATE STAGE ── */}
                <div className="flex-1 order-1 lg:order-2 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="inline-flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ronda {currentIndex + 1} de {questions.length}</span>
                        </div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{currentQuestion.category}</span>
                    </div>

                    <div className="flex-1 bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
                        {/* Decorative quotes */}
                        <div className="absolute top-6 left-6 text-6xl text-white/5 font-serif pointer-events-none">"</div>
                        
                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-10 relative z-10">
                            {currentQuestion.question}
                        </h2>

                        <div className="flex flex-col gap-4 relative z-10">
                            {currentQuestion.options.map((opt, i) => {
                                const isChosen = picked === opt;
                                const isOther = !!picked && picked !== opt;
                                
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handlePick(opt)}
                                        disabled={!!picked}
                                        className={`group relative w-full text-left flex items-center gap-5 px-6 py-4 rounded-2xl border transition-all duration-500 ${
                                            isChosen
                                                ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] scale-[1.02]'
                                                : isOther
                                                ? 'bg-slate-950/50 border-white/5 opacity-40 scale-[0.98]'
                                                : 'bg-slate-800/40 border-white/10 hover:border-blue-500/50 hover:bg-slate-800/80 hover:-translate-y-1'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-colors duration-500 shadow-inner ${
                                            isChosen ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 group-hover:bg-slate-700'
                                        }`}>
                                            {opt.icon}
                                        </div>
                                        <div className="flex-1">
                                            <span className={`block font-bold leading-snug transition-colors duration-300 ${
                                                isChosen ? 'text-white text-lg' : 'text-slate-300 text-base group-hover:text-white'
                                            }`}>
                                                {opt.text}
                                            </span>
                                        </div>
                                        {isChosen && (
                                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 animate-scale-in shadow-lg">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </main>

            {/* ── LOWER THIRDS / NEWS TICKER ── */}
            <div className={`mt-auto w-full border-t-4 border-red-600 bg-slate-950 relative z-30 transition-transform duration-500 ${headline ? 'translate-y-0' : 'translate-y-full absolute bottom-0'}`}>
                <div className="flex items-stretch h-14">
                    <div className="bg-red-600 px-6 flex items-center justify-center shrink-0">
                        <span className="text-white font-black uppercase tracking-widest text-xs md:text-sm">ÚLTIMA HORA</span>
                    </div>
                    <div className="flex-1 flex items-center px-6 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent w-10 z-10" />
                        <p className="text-white font-bold text-sm md:text-base uppercase tracking-wider animate-[marquee_10s_linear_infinite] whitespace-nowrap">
                            {headline} • Reacciones en la sede del club • {headline} • Análisis en directo • 
                        </p>
                    </div>
                </div>
            </div>

            {/* Exit button */}
            {!headline && (
                <button
                    onClick={onBack}
                    className="absolute bottom-4 right-8 text-slate-600 hover:text-slate-400 font-black text-[10px] uppercase tracking-widest transition-colors z-20"
                >
                    SALIR DEL DEBATE
                </button>
            )}

            <style>{`
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            `}</style>
        </div>
    );
};
