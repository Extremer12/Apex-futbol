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
        const t = setTimeout(() => setGamePhase('debate'), 3200);
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

        // Headline logic
        if (option.boardImpact > 0 && option.fanImpact < 0) setHeadline('La directiva aplaude — frialdad en las gradas.');
        else if (option.fanImpact >= 15) setHeadline('¡Euforia total! La afición enloquece con tu propuesta.');
        else if (option.boardImpact <= -10) setHeadline('Tensión en la sala: los directivos dudan de tu plan.');
        else if (option.boardImpact > 0 && option.fanImpact > 0) setHeadline('Propuesta equilibrada, convences a todos.');
        else setHeadline('Reacciones divididas en la sala de prensa.');

        // Shuffle rival scores
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
                    setTimeout(() => onSubmitPitch(summary), 1800);
                }
            }
        }, 1800);
    };

    // ── INTRO SCREEN ──────────────────────────────────────────────────────
    if (gamePhase === 'intro') {
        return (
            <StartupScreenContainer>
                <div className="flex flex-col items-center gap-6 text-center px-4">
                    {/* Breaking news pill */}
                    <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-1 rounded-full animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block" />
                        <span className="font-black text-xs uppercase tracking-widest">Breaking News · En Vivo</span>
                    </div>

                    {/* Team logo */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-3xl bg-white/10 border-2 border-sky-500/50 flex items-center justify-center p-3 shadow-[0_0_40px_rgba(14,165,233,0.3)]">
                            <img
                                src={team.logo}
                                alt={team.name}
                                className="w-full h-full object-contain drop-shadow-xl"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg">🎙️</div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">Debate presidencial</p>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tight leading-none">
                            {team.name}
                        </h1>
                        <p className="text-slate-400 text-sm">Transmisión en vivo desde la sede central</p>
                    </div>

                    {/* Loading bar */}
                    <div className="w-full max-w-xs h-0.5 bg-slate-800 rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-sky-500 rounded-full animate-[grow_3.2s_linear_forwards]" />
                    </div>
                    <p className="text-slate-600 text-xs uppercase tracking-widest">Conectando con el estudio...</p>
                </div>

                <style>{`
                    @keyframes grow { from { width: 0; } to { width: 100%; } }
                `}</style>
            </StartupScreenContainer>
        );
    }

    // ── DONE / EVALUATING SCREEN ──────────────────────────────────────────
    if (gamePhase === 'done' || !currentQuestion) {
        return (
            <StartupScreenContainer>
                <div className="flex flex-col items-center gap-5 text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-3xl animate-bounce">🗳️</div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Cerrando Urnas</h2>
                        <p className="text-slate-400 text-sm mt-1 italic">Calculando resultados de la votación...</p>
                    </div>
                    <LoadingSpinner />
                </div>
            </StartupScreenContainer>
        );
    }

    // ── DEBATE SCREEN ─────────────────────────────────────────────────────
    const boardColor = boardScore > 70 ? 'text-emerald-400' : boardScore < 40 ? 'text-red-400' : 'text-white';
    const fanColor = fanScore > 70 ? 'text-emerald-400' : fanScore < 40 ? 'text-red-400' : 'text-white';

    return (
        <StartupScreenContainer>
            <div className="w-full max-w-2xl flex flex-col gap-3 px-1">

                {/* ── TOP BAR: Logo + Meters ── */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 p-1.5 flex-shrink-0">
                        <img src={team.logo} alt={team.name} className="w-full h-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                        {/* Board meter */}
                        <div className="bg-slate-900/80 border border-white/5 rounded-xl px-3 py-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Directiva</span>
                                <span className={`text-sm font-black ${boardColor}`}>{Math.round(boardScore)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-700 rounded-full" style={{ width: `${boardScore}%` }} />
                            </div>
                        </div>
                        {/* Fan meter */}
                        <div className="bg-slate-900/80 border border-white/5 rounded-xl px-3 py-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Socios</span>
                                <span className={`text-sm font-black ${fanColor}`}>{Math.round(fanScore)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-600 to-yellow-400 transition-all duration-700 rounded-full" style={{ width: `${fanScore}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIVALS ROW ── */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {opponents.map((opp, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-xl px-3 py-1.5 flex-shrink-0">
                            <span className="text-base">{opp.avatar}</span>
                            <div>
                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider leading-none">{opp.name.split(' ')[0]}</p>
                                <p className="text-xs font-black text-white italic leading-tight">{Math.round(opp.score)}%</p>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-xl px-3 py-1.5 flex-shrink-0">
                        <span className="text-base">🤵</span>
                        <div>
                            <p className="text-[9px] text-sky-500 uppercase font-black tracking-wider leading-none">{player.name.split(' ')[0]}</p>
                            <p className="text-xs font-black text-sky-300 italic leading-tight">{Math.round((boardScore + fanScore) / 2)}%</p>
                        </div>
                    </div>
                </div>

                {/* ── QUESTION CARD ── */}
                <div className="relative">
                    {picked && <div className="absolute -inset-2 bg-white/5 rounded-3xl animate-ping pointer-events-none" />}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-5 relative">
                        {/* Question number badge */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-sky-400 font-black text-sm">{currentIndex + 1}</span>
                            </div>
                            <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">de {questions.length} · {currentQuestion.category}</span>
                            <div className="ml-auto flex gap-1">
                                {questions.map((_, i) => (
                                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i < currentIndex ? 'w-4 bg-sky-500' : i === currentIndex ? 'w-6 bg-sky-400' : 'w-3 bg-slate-700'}`} />
                                ))}
                            </div>
                        </div>

                        <h3 className="text-base md:text-lg font-black text-white leading-snug mb-4">
                            {currentQuestion.question}
                        </h3>

                        <div className="space-y-2">
                            {currentQuestion.options.map((opt, i) => {
                                const isChosen = picked === opt;
                                const isOther = !!picked && picked !== opt;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handlePick(opt)}
                                        disabled={!!picked}
                                        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-400 ${
                                            isChosen
                                                ? 'bg-sky-500/20 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.2)]'
                                                : isOther
                                                ? 'bg-slate-900/30 border-white/5 opacity-30 scale-[0.98]'
                                                : 'bg-slate-800/50 border-white/5 hover:border-white/15 hover:bg-slate-800 active:scale-[0.99]'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-colors duration-300 ${isChosen ? 'bg-sky-500' : 'bg-slate-700'}`}>
                                            {opt.icon}
                                        </div>
                                        <span className="flex-1 text-sm font-bold text-white leading-snug">{opt.text}</span>
                                        {isChosen && (
                                            <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                {/* ── HEADLINE TICKER ── */}
                {headline && (
                    <div className="flex items-center gap-3 bg-red-600/90 text-white py-2.5 px-4 rounded-xl">
                        <span className="font-black text-[9px] uppercase bg-white text-red-600 px-1.5 py-0.5 rounded flex-shrink-0">Titular</span>
                        <p className="text-xs font-bold italic">{headline}</p>
                    </div>
                )}

                <button
                    onClick={onBack}
                    className="text-center text-slate-600 hover:text-slate-400 font-black text-[10px] uppercase tracking-widest transition-colors pt-1"
                >
                    Abandonar el debate
                </button>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes grow { from { width: 0; } to { width: 100%; } }
            `}</style>
        </StartupScreenContainer>
    );
};
