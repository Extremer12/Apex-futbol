import React, { useEffect, useId, useRef, useState } from 'react';
import { GameEvent, EventEffects } from '../../services/eventEngine';

interface EventModalProps {
    event: GameEvent;
    onChoice: (choiceIndex: number, effects: EventEffects) => void;
    onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onChoice, onClose }) => {
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (!dialog.open) {
            dialog.showModal();
        }
        // Political crisis decisions cannot be dismissed with Esc without selecting an option
        const handleCancel = (e: Event) => {
            e.preventDefault();
        };
        dialog.addEventListener('cancel', handleCancel);
        return () => {
            dialog.removeEventListener('cancel', handleCancel);
            if (dialog.open) dialog.close();
        };
    }, [event.id]);

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'scandal': return '⚠️';
            case 'dilemma': return '🤔';
            case 'opportunity': return '💡';
            case 'crisis': return '🚨';
            default: return '📰';
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'scandal': return 'from-red-900/40 to-orange-900/40 border-red-500/30';
            case 'dilemma': return 'from-yellow-900/40 to-amber-900/40 border-yellow-500/30';
            case 'opportunity': return 'from-green-900/40 to-emerald-900/40 border-green-500/30';
            case 'crisis': return 'from-purple-900/40 to-pink-900/40 border-purple-500/30';
            default: return 'from-slate-900/40 to-slate-800/40 border-slate-500/30';
        }
    };

    const handleConfirm = () => {
        if (selectedChoice !== null) {
            const effects = event.choices[selectedChoice].effects;
            dialogRef.current?.close('confirm');
            onChoice(selectedChoice, effects);
            onClose();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            {...({ closedby: 'none' } as any)}
            className="apex-dialog w-full max-w-2xl"
        >
            <div className={`w-full bg-[#0A1020] bg-gradient-to-br ${getEventColor(event.type)} border-2 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90dvh]`}>
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{getEventIcon(event.type)}</div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                        {event.type}
                    </div>
                    <h1 id={titleId} className="text-2xl sm:text-3xl font-bold text-white mb-3">{event.title}</h1>
                    <p className="text-slate-300 text-base sm:text-lg leading-relaxed">{event.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase mb-3">¿Qué decides?</h2>
                    {event.choices.map((choice, index) => (
                        <button
                            key={index}
                            type="button"
                            autoFocus={index === 0}
                            onClick={() => setSelectedChoice(index)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                selectedChoice === index
                                    ? 'border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/20'
                                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/70'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                                        selectedChoice === index
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-slate-600'
                                    }`}
                                >
                                    {selectedChoice === index && (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-medium mb-1">{choice.text}</div>
                                    {selectedChoice === index && (
                                        <div className="text-xs text-slate-400 space-y-1 mt-2">
                                            {Object.entries(choice.effects).map(([key, value]) => (
                                                <div key={key}>
                                                    {key}:{' '}
                                                    <span className={typeof value === 'number' && value > 0 ? 'text-green-400' : 'text-red-400'}>
                                                        {typeof value === 'number' ? (value > 0 ? '+' : '') + value : String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={selectedChoice === null}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all cursor-pointer ${
                            selectedChoice !== null
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-600/30'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        Confirmar Decisión
                    </button>
                </div>

                <p className="text-center text-slate-500 text-xs mt-4">
                    Esta decisión afectará el futuro de tu club
                </p>
            </div>
        </dialog>
    );
};
