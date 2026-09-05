import React, { useState, useEffect } from 'react';
import { getSavedGames, deleteGame, SavedGameSummary } from '../../services/db';
import { getCloudSaves, deleteCloudSave, CloudSaveSummary } from '../../services/cloudSave';
import { useAuth } from '../../contexts/AuthContext';
import { TEAMS } from '../../constants';
import { LoadingSpinner, TrashIcon } from '../icons';
import { StartupScreenContainer } from './StartupScreenContainer';
import { TeamLogo } from '../../data/teams/helpers';
import { AuthModal } from '../auth/AuthModal';

interface LoadGameScreenProps {
    onLoadGame: (id: string, isCloud?: boolean) => void;
    onBack: () => void;
}

const getTeamLogo = (teamId: number) => {
    const team = TEAMS.find(t => t.id === teamId);
    return <div className="w-10 h-10"><TeamLogo team={team} /></div>;
};

export const LoadGameScreen: React.FC<LoadGameScreenProps> = ({ onLoadGame, onBack }) => {
    const { user } = useAuth();
    const [tab, setTab] = useState<'local' | 'cloud'>('local');
    const [localSaves, setLocalSaves] = useState<SavedGameSummary[]>([]);
    const [cloudSaves, setCloudSaves] = useState<CloudSaveSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const fetchSaves = async () => {
        setIsLoading(true);
        try {
            const local = await getSavedGames();
            setLocalSaves(local);
            if (user) {
                const cloud = await getCloudSaves();
                setCloudSaves(cloud);
            }
        } catch (err) {
            console.error('Failed to load saves:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSaves();
    }, [user]);

    const handleDeleteLocal = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la partida "${name}"? Esta acción no se puede deshacer.`)) {
            await deleteGame(id);
            fetchSaves();
        }
    };

    const handleDeleteCloud = async (slotId: string, name: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la partida en la nube "${name}"?`)) {
            await deleteCloudSave(slotId);
            fetchSaves();
        }
    };

    return (
        <StartupScreenContainer>
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
            
            <div className="w-full text-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-sky-400">Cargar Partida</h1>
                <p className="text-slate-300 mb-6">Selecciona una partida para continuar tu carrera.</p>

                {/* Tabs Selector: Local vs Cloud */}
                <div className="flex gap-2 p-1 bg-slate-900/80 border border-white/10 rounded-xl mb-6 max-w-sm mx-auto">
                    <button
                        onClick={() => setTab('local')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            tab === 'local' 
                                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Locales ({localSaves.length})
                    </button>
                    <button
                        onClick={() => setTab('cloud')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            tab === 'cloud' 
                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black shadow-lg shadow-yellow-500/20' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>☁️</span>
                        <span>Nube {user ? `(${cloudSaves.length})` : ''}</span>
                    </button>
                </div>

                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 text-left custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40"><LoadingSpinner /></div>
                    ) : tab === 'local' ? (
                        /* Local Saves List */
                        localSaves.length === 0 ? (
                            <p className="text-slate-400 py-10 text-center text-sm">No se encontraron partidas guardadas en este dispositivo.</p>
                        ) : (
                            localSaves.map(save => (
                                <div key={save.id} className="bg-slate-800/60 p-3.5 rounded-xl flex items-center gap-4 border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex-shrink-0">{getTeamLogo(save.teamId)}</div>
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-base text-white truncate" title={save.saveName}>{save.saveName}</p>
                                        <p className="text-xs text-slate-300 font-medium">{save.teamName}</p>
                                        <p className="text-[10px] text-slate-400">Guardado: {new Date(save.lastSaved).toLocaleString('es-ES')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => onLoadGame(save.id, false)} 
                                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-3.5 rounded-lg transition-colors text-xs uppercase tracking-wider shadow-lg shadow-sky-600/20"
                                        >
                                            Cargar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteLocal(save.id, save.saveName)} 
                                            title="Eliminar Partida" 
                                            className="bg-red-800/40 hover:bg-red-800 text-red-300 hover:text-white p-2 rounded-lg transition-colors border border-red-500/20"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        /* Cloud Saves List (Supabase) */
                        !user ? (
                            <div className="text-center py-10 space-y-4 bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                                <div className="text-3xl">☁️</div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                    Sincronización en la Nube con Supabase
                                </h3>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                    Inicia sesión con Google para acceder a tus partidas guardadas en la nube desde cualquier dispositivo.
                                </p>
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl inline-flex items-center gap-2"
                                >
                                    <span>Conectar con Google</span>
                                </button>
                            </div>
                        ) : cloudSaves.length === 0 ? (
                            <div className="text-center py-10 space-y-2">
                                <p className="text-slate-400 text-sm">No tienes partidas guardadas en la nube de Supabase todavía.</p>
                                <p className="text-xs text-slate-500">Al guardar una partida activa, se respaldará automáticamente en tu cuenta.</p>
                            </div>
                        ) : (
                            cloudSaves.map(save => (
                                <div key={save.id} className="bg-slate-800/60 p-3.5 rounded-xl flex items-center gap-4 border border-[var(--apex-gold)]/20 hover:border-[var(--apex-gold)]/40 transition-colors">
                                    <div className="flex-shrink-0">{getTeamLogo(save.teamId)}</div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-base text-white truncate" title={save.saveName}>{save.saveName}</p>
                                            <span className="text-[9px] font-black uppercase text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-1.5 py-0.5 rounded">Nube</span>
                                        </div>
                                        <p className="text-xs text-slate-300 font-medium">{save.teamName} • Temp. {save.season}</p>
                                        <p className="text-[10px] text-slate-400">Última sincro: {new Date(save.updatedAt).toLocaleString('es-ES')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => onLoadGame(save.slotId, true)} 
                                            className="bg-[var(--apex-gold)] hover:bg-yellow-400 text-slate-950 font-black py-2 px-3.5 rounded-lg transition-colors text-xs uppercase tracking-wider shadow-lg shadow-yellow-500/20"
                                        >
                                            Descargar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCloud(save.slotId, save.saveName)} 
                                            title="Eliminar de la Nube" 
                                            className="bg-red-800/40 hover:bg-red-800 text-red-300 hover:text-white p-2 rounded-lg transition-colors border border-red-500/20"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>

                <button onClick={onBack} className="w-full text-slate-400 hover:text-white transition-colors py-2 mt-6 text-sm">
                    Volver al Menú Principal
                </button>
            </div>
        </StartupScreenContainer>
    );
};
