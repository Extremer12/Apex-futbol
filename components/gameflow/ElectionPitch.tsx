import React, { useState, useEffect, useRef } from 'react';
import { Team, PlayerProfile } from '../../types';
import { LoadingSpinner } from '../icons';
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
    const playerAvgScore = Math.round((boardScore + fanScore) / 2);

    const handlePick = (option: DebateOption) => {
        if (picked) return;
        setPicked(option);

        const newBoard = Math.max(0, Math.min(100, boardScore + option.boardImpact));
        const newFan = Math.max(0, Math.min(100, fanScore + option.fanImpact));
        setBoardScore(newBoard);
        setFanScore(newFan);

        if (option.boardImpact > 0 && option.fanImpact < 0) setHeadline('Board applauds while the fans remain silent');
        else if (option.fanImpact >= 15) setHeadline('The crowd goes wild with the proposal!');
        else if (option.boardImpact <= -10) setHeadline('Warning: Board shows clear discontent');
        else if (option.boardImpact > 0 && option.fanImpact > 0) setHeadline('Masterful: Convinces both fans and board');
        else setHeadline('Controversial statement divides the audience');

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

    const getScoreColor = (score: number) => score >= 75 ? 'var(--apex-green)' : score <= 40 ? 'var(--apex-red)' : 'var(--apex-gold)';

    // ── INTRO PHASE ──
    if (gamePhase === 'intro') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'var(--apex-dark)' }}>
                {/* Background Image with subtle parallax movement */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-out animate-slow-zoom"
                    style={{ 
                        backgroundImage: 'url("/bg-debate.png")',
                        filter: 'brightness(1.0) saturate(1.1)'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E17]/80 via-transparent to-[#0A0E17]" />
                
                {/* Live badge */}
                <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-1.5 rounded-lg z-20 animate-fade-in"
                     style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-[10px] font-bold tracking-[0.15em] uppercase">LIVE</span>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center px-6 animate-scale-in">
                    {/* Club logo */}
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 p-4"
                         style={{ border: '2px solid var(--apex-border-active)', background: 'rgba(15,20,35,0.8)' }}>
                        <img src={team.logo} alt={team.name} className="w-full h-full object-contain"
                             onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>

                    <h1 className="text-2xl font-extrabold text-white uppercase tracking-[0.1em] mb-1">{team.name}</h1>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-8" style={{ color: 'var(--apex-gold)' }}>
                        Elecciones Presidenciales del Club
                    </p>

                    <div className="apex-card p-4 flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                             style={{ background: 'rgba(200,168,78,0.1)', border: '1px solid var(--apex-border)' }}>🎙️</div>
                        <div className="text-left">
                            <div className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--apex-gold)' }}>Candidato Principal</div>
                            <div className="text-sm font-extrabold text-white">{player.name}</div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-48">
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--apex-border)' }}>
                            <div className="h-full rounded-full animate-[shrink_3s_linear_forwards]" style={{ background: 'var(--apex-gold)' }} />
                        </div>
                        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mt-2" style={{ color: 'var(--apex-text-muted)' }}>
                            Conectando con los estudios...
                        </p>
                    </div>
                </div>

                <style>{`@keyframes shrink { from { width: 0%; } to { width: 100%; } }`}</style>
            </div>
        );
    }

    // ── DONE PHASE ──
    if (gamePhase === 'done' || !currentQuestion) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--apex-dark)' }}>
                <div className="flex flex-col items-center gap-4 text-center animate-scale-in">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-glow-pulse"
                         style={{ background: 'rgba(200,168,78,0.08)', border: '2px solid var(--apex-gold-dim)' }}>
                        🗳️
                    </div>
                    <h2 className="text-2xl font-extrabold text-white uppercase tracking-[0.1em]">Cierre de Urnas</h2>
                    <p className="text-sm font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--apex-gold)' }}>Contando votos...</p>
                    <div className="mt-4"><LoadingSpinner /></div>
                </div>
            </div>
        );
    }

    // ── DEBATE PHASE ──
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--apex-dark)' }}>
            {/* Background Image with subtle parallax movement */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-out animate-slow-zoom"
                style={{ 
                    backgroundImage: 'url("/bg-debate.png")',
                    filter: 'brightness(0.6) saturate(0.8)'
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E17]/90 via-transparent to-[#0A0E17]" />
            
            <div className="relative z-10 flex flex-col min-h-screen">
            {/* Header */}
            <header className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--apex-border)' }}>
                <div className="flex items-center justify-between mb-3">
                    <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ border: '1px solid var(--apex-border)' }}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="text-center">
                        <div className="flex items-center gap-2 justify-center">
                            <img src={team.logo} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <span className="text-xs font-extrabold text-white uppercase">{team.name}</span>
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.1em]" style={{ color: 'var(--apex-text-secondary)' }}>Elecciones Presidenciales</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-red-400 text-[9px] font-bold tracking-wider">EN DIRECTO</span>
                    </div>
                </div>

                <div className="text-center mb-3">
                    <h2 className="text-base font-extrabold text-white uppercase tracking-[0.1em]">Debate Presidencial</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--apex-gold)' }}>
                        Ronda {currentIndex + 1} de {questions.length}
                    </p>
                </div>
            </header>

            {/* Score bars */}
            <div className="px-4 py-3 flex gap-3">
                <div className="flex-1 apex-card p-3">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--apex-text-muted)' }}>Directiva</span>
                        <span className="text-sm font-extrabold" style={{ color: getScoreColor(boardScore) }}>{Math.round(boardScore)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${boardScore}%`, background: getScoreColor(boardScore) }} />
                    </div>
                </div>
                <div className="flex-1 apex-card p-3">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--apex-text-muted)' }}>Afición</span>
                        <span className="text-sm font-extrabold" style={{ color: getScoreColor(fanScore) }}>{Math.round(fanScore)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${fanScore}%`, background: getScoreColor(fanScore) }} />
                    </div>
                </div>
            </div>

            {/* Candidates */}
            <div className="px-4 mb-3">
                <div className="apex-card p-3">
                    <div className="text-[9px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--apex-text-muted)' }}>Encuesta en Vivo</div>
                    <div className="flex h-6 rounded-lg overflow-hidden mb-2">
                        <div className="flex items-center justify-center transition-all duration-1000"
                             style={{ width: `${playerAvgScore}%`, background: 'var(--apex-gold)', minWidth: '30px' }}>
                            <span className="text-[9px] font-bold text-[var(--apex-dark)]">{playerAvgScore}%</span>
                        </div>
                        {opponents.map((opp, i) => (
                            <div key={i} className="flex items-center justify-center transition-all duration-1000"
                                 style={{
                                     width: `${Math.round(opp.score / (opponents.length + 1))}%`,
                                     background: i === 0 ? 'rgba(239,68,68,0.6)' : 'rgba(100,116,139,0.4)',
                                     minWidth: '25px'
                                 }}>
                                <span className="text-[8px] font-bold text-white">{Math.round(opp.score)}%</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--apex-gold)' }} />
                            <span className="text-[9px] font-bold text-white">{player.name}</span>
                        </div>
                        {opponents.map((opp, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? 'rgba(239,68,68,0.6)' : 'rgba(100,116,139,0.4)' }} />
                                <span className="text-[9px] font-bold" style={{ color: 'var(--apex-text-muted)' }}>{opp.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Debate Question */}
            <div className="flex-1 px-4 pb-4 overflow-y-auto">
                <div className="apex-card p-5 mb-3">
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-gold)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--apex-gold)' }}>{currentQuestion.category}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white leading-snug">{currentQuestion.question}</h3>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                    {currentQuestion.options.map((opt, i) => {
                        const isChosen = picked === opt;
                        const isOther = !!picked && picked !== opt;

                        return (
                            <button
                                key={i}
                                onClick={() => handlePick(opt)}
                                disabled={!!picked}
                                className="w-full text-left flex items-center gap-3 p-4 rounded-2xl transition-all duration-300"
                                style={{
                                    background: isChosen ? 'rgba(200,168,78,0.08)' : 'var(--apex-card)',
                                    border: `1px solid ${isChosen ? 'var(--apex-gold)' : 'var(--apex-border)'}`,
                                    opacity: isOther ? 0.35 : 1,
                                    transform: isOther ? 'scale(0.98)' : isChosen ? 'scale(1.01)' : 'scale(1)',
                                }}
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                     style={{
                                         background: isChosen ? 'rgba(200,168,78,0.15)' : 'rgba(255,255,255,0.03)',
                                         border: `1px solid ${isChosen ? 'var(--apex-gold)' : 'var(--apex-border)'}`,
                                     }}>
                                    {opt.icon}
                                </div>
                                <span className={`text-sm font-semibold flex-1 ${isChosen ? 'text-white' : 'text-[var(--apex-text-secondary)]'}`}>
                                    {opt.text}
                                </span>
                                {isChosen && (
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 animate-scale-in"
                                         style={{ background: 'var(--apex-gold)' }}>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="var(--apex-dark)" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* News Ticker */}
            {headline && (
                <div className="animate-slide-up" style={{ borderTop: '2px solid var(--apex-gold)' }}>
                    <div className="flex items-center h-10 overflow-hidden">
                        <div className="px-4 h-full flex items-center flex-shrink-0" style={{ background: 'var(--apex-gold)' }}>
                            <span className="text-[var(--apex-dark)] font-extrabold text-[9px] uppercase tracking-[0.15em]">BREAKING</span>
                        </div>
                        <div className="flex-1 px-4 overflow-hidden">
                            <p className="text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap animate-[marquee_12s_linear_infinite]">
                                {headline} • {headline} •
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
            </div>
        </div>
    );
};
