import React, { useState, useEffect } from 'react';
import { getSavedGames, deleteGame, SavedGameSummary } from '../../services/db';
import { TEAMS } from '../../constants';
import { LoadingSpinner, TrashIcon } from '../icons';
import { StartupScreenContainer } from './StartupScreenContainer';

interface LoadGameScreenProps {
    onLoadGame: (id: string) => void;
    onBack: () => void;
}

const getTeamLogo = (teamId: number) => {
    const team = TEAMS.find(t => t.id === teamId);
    return team ? team.logo : <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">?</div>;
};

export const LoadGameScreen: React.FC<LoadGameScreenProps> = ({ onLoadGame, onBack }) => {
    const [saves, setSaves] = useState<SavedGameSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSaves = async () => {
        setIsLoading(true);
        const savedGames = await getSavedGames();
        setSaves(savedGames);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchSaves();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la partida "${name}"? Esta acción no se puede deshacer.`)) {
            await deleteGame(id);
            fetchSaves(); // Refresh the list
        }
    };

    return (
        <StartupScreenContainer>
            <div className="w-full text-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-sky-400">Cargar Partida</h1>
                <p className="text-slate-300 mb-8">Selecciona una partida para continuar tu carrera.</p>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-left">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40"><LoadingSpinner /></div>
                    ) : saves.length === 0 ? (
                        <p className="text-slate-400 py-10 text-center">No se encontraron partidas guardadas.</p>
                    ) : (
                        saves.map(save => (
                            <div key={save.id} className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-4 border border-slate-700/50">
                                <div className="flex-shrink-0">{getTeamLogo(save.teamId)}</div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-lg truncate" title={save.saveName}>{save.saveName}</p>
                                    <p className="text-sm text-slate-300">{save.teamName}</p>
                                    <p className="text-xs text-slate-400">Guardado: {new Date(save.lastSaved).toLocaleString('es-ES')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <button onClick={() => onLoadGame(save.id)} className="bg-sky-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-sky-500 transition-colors text-sm">Cargar</button>
                                     <button onClick={() => handleDelete(save.id, save.saveName)} title="Eliminar Partida" className="bg-red-800/70 text-white p-2 rounded-lg hover:bg-red-700 transition-colors">
                                        <TrashIcon className="w-5 h-5" />
                                     </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <button onClick={onBack} className="w-full text-slate-400 hover:text-white transition-colors py-2 mt-6 text-sm">
                    Volver al Menú Principal
                </button>
            </div>
        </StartupScreenContainer>
    );
};
