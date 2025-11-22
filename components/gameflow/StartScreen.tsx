import React, { useState, useEffect } from 'react';
import { SparklesIcon, ChartBarIcon, InfoIcon, LoadingSpinner } from '../icons';
import { AboutModal, PlaceholderModal } from './PlaceholderModals';
import { getSavedGames } from '../../services/db';

interface StartScreenProps {
    onNewGame: () => void;
    onLoadGameScreen: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onNewGame, onLoadGameScreen }) => {
    const [modal, setModal] = useState<'achievements' | 'stats' | 'about' | null>(null);
    const [hasSaves, setHasSaves] = useState(false);
    const [isCheckingSaves, setIsCheckingSaves] = useState(true);

    useEffect(() => {
        const checkSaves = async () => {
            setIsCheckingSaves(true);
            try {
                const saves = await getSavedGames();
                setHasSaves(saves.length > 0);
            } catch (e) {
                console.error("Failed to check for saved games", e);
                setHasSaves(false);
            } finally {
                setIsCheckingSaves(false);
            }
        };
        checkSaves();
    }, []);

    const MenuButton: React.FC<{ onClick: () => void, children: React.ReactNode, icon?: React.ReactNode, disabled?: boolean }> = ({ onClick, children, icon, disabled }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full bg-slate-800/70 text-slate-200 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-700/90 transition-all hover:scale-105 duration-200 border border-slate-700/50 shadow-lg shadow-slate-950/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
            {icon}
            {children}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
            {modal === 'achievements' && <PlaceholderModal title="Logros" onClose={() => setModal(null)} />}
            {modal === 'stats' && <PlaceholderModal title="Estadísticas" onClose={() => setModal(null)} />}
            {modal === 'about' && <AboutModal onClose={() => setModal(null)} />}
            
            <div className="w-full max-w-sm mx-auto">
                <h1 className="text-6xl font-extrabold mb-4 text-white tracking-tighter">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">Apex AI</span>
                </h1>
                <p className="text-slate-400 mb-10">Simulador de Presidente de Club</p>
                
                <div className="space-y-4">
                    <MenuButton onClick={onNewGame}>
                        Nueva Partida
                    </MenuButton>
                     <MenuButton onClick={onLoadGameScreen} disabled={isCheckingSaves || !hasSaves}>
                        {isCheckingSaves ? <LoadingSpinner/> : 'Cargar Partida'}
                    </MenuButton>
                    <MenuButton onClick={() => setModal('achievements')} icon={<SparklesIcon className="w-5 h-5"/>}>
                        Logros
                    </MenuButton>
                    <MenuButton onClick={() => setModal('stats')} icon={<ChartBarIcon className="w-5 h-5"/>}>
                        Estadísticas
                    </MenuButton>
                     <MenuButton onClick={() => setModal('about')} icon={<InfoIcon className="w-5 h-5"/>}>
                        Información
                    </MenuButton>
                </div>
            </div>
        </div>
    );
};