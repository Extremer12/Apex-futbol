import React from 'react';
import { ElectionResponse } from '../../services/gameLogic';

interface ElectionResultProps {
    result: ElectionResponse;
    onContinue: () => void;
    onRetry: () => void;
}

export const ElectionResult: React.FC<ElectionResultProps> = ({ result, onContinue, onRetry }) => (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className={`w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-2xl border-2 ${result.success ? 'border-green-500/50' : 'border-red-500/50'}`}>
            <h1 className={`text-3xl font-bold mb-4 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? '¡Elección Ganada!' : 'Elección Perdida'}
            </h1>
            <p className="text-slate-300 mb-6 italic">"Un mensaje de la junta: {result.feedback}"</p>
            {result.success ? (
                <button onClick={onContinue} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20">
                    Comenzar tu Carrera
                </button>
            ) : (
                <button onClick={onRetry} className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20">
                    Intentar de Nuevo
                </button>
            )}
        </div>
    </div>
);
