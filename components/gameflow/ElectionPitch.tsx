import React, { useState, useEffect } from 'react';
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
    const [gameState, setGameState] = useState<'intro' | 'debate' | 'evaluating'>('intro');
    const [questions, setQuestions] = useState<DebateQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<DebateOption[]>([]);
    const [opponents, setOpponents] = useState<OpponentCandidate[]>([]);
    const [selectedOption, setSelectedOption] = useState<DebateOption | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    
    // Live scores
    const [boardScore, setBoardScore] = useState(50 + player.experience);
    const [fanScore, setFanScore] = useState(50 + player.experience);
    const [headline, setHeadline] = useState("");

    // Initialize debate
    useEffect(() => {
        const debateQuestions = selectDebateQuestions();
        setQuestions(debateQuestions);
        setOpponents(generateOpponents(team.tier));
        
        // Auto-transition from intro to debate after 3 seconds
        const timer = setTimeout(() => setGameState('debate'), 3500);
        return () => clearTimeout(timer);
    }, [team.tier, player.experience]);

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const handleSelectOption = (option: DebateOption) => {
        if (showFeedback) return;

        setSelectedOption(option);
        setShowFeedback(true);
        
        // Calculate impact
        const bImpact = option.boardImpact;
        const fImpact = option.fanImpact;
        
        setBoardScore(prev => Math.max(0, Math.min(100, prev + bImpact)));
        setFanScore(prev => Math.max(0, Math.min(100, prev + fImpact)));

        // Set dynamic headline
        if (bImpact > 0 && fImpact < 0) setHeadline("La directiva aplaude la prudencia; frialdad en las gradas.");
        else if (fImpact > 20) setHeadline("¡Euforia total! La afición se ilusiona con tu propuesta.");
        else if (bImpact < -10) setHeadline("Tensión en la sala: Los directivos dudan de la viabilidad.");
        else if (fImpact > 0 && bImpact > 0) setHeadline("Propuesta equilibrada que convence a ambos sectores.");
        else setHeadline("Reacciones divididas tras tu última declaración.");

        // Animate rival candidates (randomly move their scores based on player performance)
        setOpponents(prev => prev.map(opp => ({
            ...opp,
            score: Math.max(30, Math.min(95, opp.score + (Math.random() * 10 - 5)))
        })));

        setTimeout(() => {
            const newAnswers = [...selectedAnswers, option];
            setSelectedAnswers(newAnswers);

            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
                setShowFeedback(false);
                setHeadline("");
            } else {
                setGameState('evaluating');
                const result = evaluateDebate(newAnswers, team, player);
                const summary = `Score: ${result.playerScore} - ${result.success ? 'Won' : 'Lost'}`;
                setTimeout(() => onSubmitPitch(summary), 2000);
            }
        }, 2000);
    };

    if (gameState === 'intro') {
        return (
            <StartupScreenContainer>
                <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000">
                    <div className="bg-red-600 text-white px-4 py-1 font-black text-xl italic uppercase animate-pulse">Breaking News</div>
                    <div className="w-32 h-32 p-4 bg-white/10 rounded-full border-4 border-sky-500 animate-bounce">
                        {team.logo}
                    </div>
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
                            Debate Presidencial: <br/>
                            <span className="text-sky-400">{team.name}</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Transmisión en vivo desde la sede central</p>
                    </div>
                    <div className="w-full max-w-md h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 animate-[loading_3.5s_ease-in-out]" />
                    </div>
                </div>
            </StartupScreenContainer>
        );
    }

    if (!currentQuestion || gameState === 'evaluating') {
        return (
            <StartupScreenContainer>
                <div className="text-center space-y-6">
                    <LoadingSpinner />
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase">Cerrando urnas...</h2>
                        <p className="text-slate-400 font-bold italic">Calculando resultados de la votación</p>
                    </div>
                </div>
            </StartupScreenContainer>
        );
    }

    return (
        <StartupScreenContainer>
            <div className="w-full max-w-4xl space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                {/* Live Meters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confianza Directiva</span>
                            <span className={`text-xl font-black italic ${boardScore > 70 ? 'text-green-400' : boardScore < 40 ? 'text-red-400' : 'text-white'}`}>{Math.round(boardScore)}%</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-1000" style={{ width: `${boardScore}%` }} />
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-3xl rounded-full" />
                    </div>

                    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aprobación Socios</span>
                            <span className={`text-xl font-black italic ${fanScore > 70 ? 'text-green-400' : fanScore < 40 ? 'text-red-400' : 'text-white'}`}>{Math.round(fanScore)}%</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-orange-600 to-yellow-400 transition-all duration-1000" style={{ width: `${fanScore}%` }} />
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-3xl rounded-full" />
                    </div>
                </div>

                {/* Opponents Ticker */}
                <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar border-y border-white/5">
                    {opponents.map((opp, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-800/30 px-4 py-2 rounded-xl flex-shrink-0 border border-white/5">
                            <span className="text-xl">{opp.avatar}</span>
                            <div className="whitespace-nowrap">
                                <div className="text-[10px] font-black text-slate-500 uppercase">{opp.name}</div>
                                <div className="text-xs font-black text-white italic">{Math.round(opp.score)}% de votos</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Question & Flash Effects */}
                <div className="relative group">
                    {showFeedback && (
                        <div className="absolute -inset-4 bg-white/10 animate-[ping_0.5s_ease-in-out_infinite] rounded-3xl pointer-events-none z-0" />
                    )}
                    
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10">
                        <div className="absolute top-8 right-8 text-6xl opacity-10 font-black italic select-none">Q{currentQuestionIndex + 1}</div>
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/30">
                                <span className="text-2xl animate-pulse">🎙️</span>
                            </div>
                            <span className="text-xs font-black text-sky-400 uppercase tracking-widest">Pregunta del Periodista</span>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
                            {currentQuestion.question}
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {currentQuestion.options.map((option, idx) => {
                                const isSelected = selectedOption === option;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectOption(option)}
                                        disabled={showFeedback}
                                        className={`group relative text-left p-6 rounded-2xl border-2 transition-all duration-500 ${
                                            isSelected 
                                            ? 'bg-sky-500/20 border-sky-500 shadow-[0_0_30px_rgba(14,165,233,0.3)] scale-[1.02]' 
                                            : showFeedback 
                                            ? 'bg-slate-900/50 border-white/5 opacity-30 scale-95'
                                            : 'bg-slate-900/80 border-white/5 hover:border-white/20 hover:bg-slate-800 hover:scale-[1.01]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110 ${isSelected ? 'bg-sky-500' : 'bg-slate-800'}`}>
                                                {option.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-lg font-black text-white tracking-tight leading-snug">{option.text}</p>
                                                <div className="flex gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Impacto: Dinámico</span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center animate-in zoom-in">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* News Ticker Footer */}
                {headline && (
                    <div className="bg-red-600 text-white py-3 px-6 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4">
                        <span className="font-black text-xs uppercase italic bg-white text-red-600 px-2 py-0.5 rounded">Titular</span>
                        <p className="font-bold text-sm md:text-base italic flex-1">{headline}</p>
                    </div>
                )}

                <div className="text-center pt-4">
                    <button onClick={onBack} className="text-slate-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">Abandonar Debate</button>
                </div>
            </div>

            <style>{`
                @keyframes loading {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </StartupScreenContainer>
    );
};
