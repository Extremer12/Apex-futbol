import React from 'react';

interface GameOverScreenProps {
    onNewGame: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ onNewGame }) => (
     <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-2xl border-2 border-red-500/50">
            <h1 className="text-3xl font-bold mb-4 text-red-400">Fin de la Partida</h1>
            <p className="text-slate-300 mb-6">La junta directiva ha perdido la confianza en tu gestión y ha decidido prescindir de tus servicios. Tu carrera como presidente ha llegado a su fin.</p>
            <button onClick={onNewGame} className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-500 transition-colors">
                Comenzar una Nueva Carrera
            </button>
        </div>
    </div>
);
