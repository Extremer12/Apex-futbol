import React, { useState } from 'react';
import { Team, PlayerProfile } from '../../types';
import { LoadingSpinner } from '../icons';
import { StartupScreenContainer } from './StartupScreenContainer';

interface ElectionPitchProps {
    team: Team;
    player: PlayerProfile;
    onSubmitPitch: (pitch: string) => void;
    onBack: () => void;
    isLoading: boolean;
}

export const ElectionPitch: React.FC<ElectionPitchProps> = ({ team, player, onSubmitPitch, onBack, isLoading }) => {
    const [pitch, setPitch] = useState('');
    
    const ADVICE: Record<Team['tier'], string> = {
        Lower: "La junta valora la pasión, la estabilidad financiera y un plan realista a largo plazo. No prometas fichajes de superestrellas.",
        Mid: "Necesitan oír una estrategia clara para competir con los grandes. Enfócate en el scouting inteligente y en cómo aumentar los ingresos.",
        Top: "La junta espera resultados inmediatos. Tu discurso debe demostrar un conocimiento profundo del fútbol moderno y una visión para ganar trofeos ya.",
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pitch.trim()) {
            onSubmitPitch(pitch);
        }
    };

    return (
         <StartupScreenContainer>
            <div className="w-full">
                <div className='flex justify-center mb-4'>{team.logo}</div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-center">Elección Presidencial</h1>
                <h2 className="text-xl font-semibold text-sky-400 mb-4 text-center">{team.name}</h2>
                
                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg mb-6">
                    <h3 className="font-bold text-sky-400">Consejo de la Junta</h3>
                    <p className="text-sm text-slate-300">{ADVICE[team.tier]}</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <textarea value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder={`Mi nombre es ${player.name}, y creo que puedo llevar al ${team.name} a la gloria mediante...`} rows={6} className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                    <button type="submit" disabled={isLoading} className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-sky-600/20">
                        {isLoading ? <><LoadingSpinner /> Enviando...</> : 'Presentar Discurso a la Junta'}
                    </button>
                    <button type="button" onClick={onBack} className="w-full text-slate-400 hover:text-white transition-colors py-2 text-sm">
                        Elegir otro equipo
                    </button>
                </form>
            </div>
        </StartupScreenContainer>
    );
};
