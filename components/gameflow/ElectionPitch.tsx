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
    const [questions, setQuestions] = useState<DebateQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<DebateOption[]>([]);
    const [opponents, setOpponents] = useState<OpponentCandidate[]>([]);
    const [selectedOption, setSelectedOption] = useState<DebateOption | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    // Initialize debate
    useEffect(() => {
        const debateQuestions = selectDebateQuestions();
        setQuestions(debateQuestions);
        setOpponents(generateOpponents(team.tier));
    }, [team.tier]);

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const handleSelectOption = (option: DebateOption) => {
        if (showFeedback) return; // Prevent selection during feedback

        setSelectedOption(option);
        setShowFeedback(true);

        // Wait for feedback animation, then move to next question
        setTimeout(() => {
            const newAnswers = [...selectedAnswers, option];
            setSelectedAnswers(newAnswers);

            if (currentQuestionIndex < questions.length - 1) {
                // Next question
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
                setShowFeedback(false);
            } else {
                // Debate finished, evaluate
                const result = evaluateDebate(newAnswers, team, player);

                // Create a summary string to pass to parent (for compatibility)
                const summary = `Score: ${result.playerScore} - ${result.success ? 'Won' : 'Lost'}`;
                onSubmitPitch(summary);
            }
        }, 1200);
    };

    if (!currentQuestion) {
        return (
            <StartupScreenContainer>
                <LoadingSpinner />
            </StartupScreenContainer>
        );
    }

    return (
        <StartupScreenContainer>
            <div className="w-full max-w-3xl">
                {/* Header */}
                <div className='flex justify-center mb-4'>{team.logo}</div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-center">Debate Presidencial</h1>
                <h2 className="text-xl font-semibold text-sky-400 mb-6 text-center">{team.name}</h2>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-sky-500 h-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Opponents Progress */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-bold text-slate-400 mb-3">Candidatos Rivales</h3>
                    <div className="space-y-2">
                        {opponents.map((opponent, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="text-2xl">{opponent.avatar}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-300">{opponent.name}</span>
                                        <span className="text-slate-500">{opponent.score}pts</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                                        <div
                                            className="bg-red-500 h-full rounded-full transition-all duration-300"
                                            style={{ width: `${(opponent.score / 100) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 mb-6 shadow-2xl">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="text-3xl">❓</div>
                        <p className="text-lg font-semibold text-white leading-relaxed flex-1">
                            {currentQuestion.question}
                        </p>
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedOption === option;
                            const showCorrectFeedback = showFeedback && isSelected;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(option)}
                                    disabled={showFeedback}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-[1.02] ${showCorrectFeedback
                                            ? 'bg-sky-600/20 border-sky-500 shadow-lg shadow-sky-500/20'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-sky-500 hover:bg-slate-700/50'
                                        } ${showFeedback && !isSelected ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{option.icon}</span>
                                        <span className="flex-1 font-medium text-white">{option.text}</span>
                                        {showCorrectFeedback && (
                                            <span className="text-sky-400 font-bold">✓</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Back Button */}
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="w-full text-slate-400 hover:text-white transition-colors py-2 text-sm disabled:opacity-50"
                >
                    Elegir otro equipo
                </button>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50">
                        <div className="text-center">
                            <LoadingSpinner />
                            <p className="text-white mt-4">Evaluando respuestas...</p>
                        </div>
                    </div>
                )}
            </div>
        </StartupScreenContainer>
    );
};
