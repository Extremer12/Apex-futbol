import React, { useState } from 'react';
import { PlayerProfile } from '../../types';
import { StartupScreenContainer } from './StartupScreenContainer';

interface ProfileCreationProps {
    onProfileCreate: (profile: PlayerProfile) => void;
}

export const ProfileCreation: React.FC<ProfileCreationProps> = ({ onProfileCreate }) => {
    const [name, setName] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onProfileCreate({ name: name.trim(), experience: 0 });
        }
    };
    return (
        <StartupScreenContainer>
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-sky-400">Crear Perfil</h1>
                <p className="text-slate-300 mb-8">Bienvenido. Crea tu perfil para comenzar tu carrera.</p>
                <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Introduce tu nombre"
                        className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                        required
                    />
                    <button type="submit" className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-500 transition-transform hover:scale-105 duration-200 shadow-lg shadow-sky-600/20">
                        Siguiente
                    </button>
                </form>
            </div>
        </StartupScreenContainer>
    );
};
