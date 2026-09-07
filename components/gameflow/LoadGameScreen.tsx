import React, { useState, useEffect } from 'react';
import { getSavedGames, deleteGame, SavedGameSummary } from '../../services/db';
import { getCloudSaves, deleteCloudSave, CloudSaveSummary } from '../../services/cloudSave';
import { useAuth } from '../../contexts/AuthContext';
import { TEAMS } from '../../constants';
import { LoadingSpinner } from '../icons';
import { TeamLogo } from '../../data/teams/helpers';
import { AuthModal } from '../auth/AuthModal';
import { 
    ArrowLeft, 
    FolderOpen, 
    Trash2, 
    Play, 
    Cloud, 
    HardDrive, 
    Calendar,
    Sparkles
} from 'lucide-react';

interface LoadGameScreenProps {
    onLoadGame: (id: string, isCloud?: boolean) => void;
    onBack: () => void;
}

const getTeamDetails = (teamId: number) => {
    return TEAMS.find(t => t.id === teamId);
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
        <div className="min-h-screen bg-[#0A0E17] text-white flex flex-col relative overflow-hidden select-none">
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

            {/* Ambient Background Layer */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-25"
                style={{ backgroundImage: 'url("/bg-inicio.png")' }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0A0E17]/80 via-[#0A0E17]/95 to-[#0A0E17] pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--apex-gold)]/5 rounded-full blur-[140px] pointer-events-none" />

            {/* 🌟 Top Navigation Bar */}
            <header className="sticky top-0 z-30 bg-[#0A0E17]/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3.5">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider active:scale-95 cursor-pointer border border-white/5 hover:border-white/15"
                        title="Volver al menú principal"
                    >
                        <ArrowLeft className="w-4 h-4 text-[var(--apex-gold)]" />
                        <span>Volver al Menú</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-[var(--apex-gold)]" />
                        <span className="text-sm font-black uppercase tracking-wider text-white">
                            Cargar Partida
                        </span>
                    </div>

                    <div className="w-24 text-right">
                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {tab === 'local' ? `${localSaves.length} Locales` : `${cloudSaves.length} Nube`}
                        </span>
                    </div>
                </div>
            </header>

            {/* 🎮 Central Content */}
            <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 z-10 flex flex-col">
                {/* Title & Description Header */}
                <div className="text-center space-y-1 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                        Tus Carreras Guardadas
                    </h1>
                    <p className="text-xs text-slate-400">
                        Selecciona un archivo de guardado para retomar el control de tu club.
                    </p>
                </div>

                {/* Tabs Selector: Local vs Cloud */}
                <div className="flex gap-2 p-1.5 bg-slate-900/90 border border-white/10 rounded-2xl mb-6 max-w-sm mx-auto w-full shadow-lg">
                    <button
                        onClick={() => setTab('local')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            tab === 'local' 
                                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Dispositivo ({localSaves.length})</span>
                    </button>
                    <button
                        onClick={() => setTab('cloud')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            tab === 'cloud' 
                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black shadow-lg shadow-yellow-500/20' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Nube {user ? `(${cloudSaves.length})` : ''}</span>
                    </button>
                </div>

                {/* Saves List Container */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[60vh] pr-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center h-56 gap-3">
                            <LoadingSpinner />
                            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Leyendo partidas guardadas...</p>
                        </div>
                    ) : tab === 'local' ? (
                        /* Local Saves List */
                        localSaves.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-10 text-center space-y-4 my-auto">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                                    <FolderOpen className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                        No hay partidas locales
                                    </h3>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                        Aún no has guardado ninguna partida en este dispositivo.
                                    </p>
                                </div>
                                <button
                                    onClick={onBack}
                                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-sky-600/20 inline-flex items-center gap-2 cursor-pointer"
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>Iniciar Nueva Partida</span>
                                </button>
                            </div>
                        ) : (
                            localSaves.map(save => {
                                const team = getTeamDetails(save.teamId);
                                return (
                                    <div 
                                        key={save.id} 
                                        className="group rounded-2xl bg-[#0F1423]/90 hover:bg-[#131A2E] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 hover:border-sky-500/40 transition-all shadow-lg"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                                <TeamLogo team={team || { name: save.teamName }} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="space-y-0.5 min-w-0">
                                                <h4 className="font-black text-sm sm:text-base text-white truncate group-hover:text-sky-300 transition-colors" title={save.saveName}>
                                                    {save.saveName}
                                                </h4>
                                                <p className="text-xs font-bold text-slate-300 truncate">
                                                    {save.teamName}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                                                    <Calendar className="w-3 h-3 text-slate-500" />
                                                    <span>Guardado: {new Date(save.lastSaved).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                                            <button 
                                                onClick={() => onLoadGame(save.id, false)} 
                                                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-sky-600/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                                <span>Cargar</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteLocal(save.id, save.saveName)} 
                                                title="Eliminar Partida" 
                                                className="p-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-200 transition-colors border border-red-500/20 cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )
                    ) : (
                        /* Cloud Saves List (Supabase) */
                        !user ? (
                            <div className="text-center py-10 space-y-4 bg-slate-900/40 border border-white/10 rounded-2xl p-6">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/20 flex items-center justify-center mx-auto text-[var(--apex-gold)]">
                                    <Cloud className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Sincronización en la Nube con Supabase
                                    </h3>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                        Inicia sesión con Google para respaldar tus carreras y acceder a ellas desde cualquier dispositivo.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl inline-flex items-center gap-2 cursor-pointer"
                                >
                                    <span>Conectar con Google</span>
                                </button>
                            </div>
                        ) : cloudSaves.length === 0 ? (
                            <div className="text-center py-10 space-y-3 bg-slate-900/40 border border-white/10 rounded-2xl p-6">
                                <div className="text-3xl">☁️</div>
                                <div className="space-y-1">
                                    <p className="text-white text-sm font-bold uppercase">No tienes partidas en la nube de Supabase</p>
                                    <p className="text-xs text-slate-400">Al jugar y guardar tu carrera con sesión iniciada, se sincronizará automáticamente aquí.</p>
                                </div>
                            </div>
                        ) : (
                            cloudSaves.map(save => {
                                const team = getTeamDetails(save.teamId);
                                return (
                                    <div 
                                        key={save.id} 
                                        className="group rounded-2xl bg-[#0F1423]/90 hover:bg-[#131A2E] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[var(--apex-gold)]/20 hover:border-[var(--apex-gold)]/50 transition-all shadow-lg"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                                <TeamLogo team={team || { name: save.teamName }} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="space-y-0.5 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-sm sm:text-base text-white truncate" title={save.saveName}>
                                                        {save.saveName}
                                                    </h4>
                                                    <span className="text-[9px] font-black uppercase text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-1.5 py-0.5 rounded border border-[var(--apex-gold)]/20">
                                                        Nube
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-300 truncate">
                                                    {save.teamName} • Temp. {save.season}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                                                    <Calendar className="w-3 h-3 text-slate-500" />
                                                    <span>Sincronizado: {new Date(save.updatedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                                            <button 
                                                onClick={() => onLoadGame(save.slotId, true)} 
                                                className="px-4 py-2.5 bg-[var(--apex-gold)] hover:bg-yellow-400 text-slate-950 font-black rounded-xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-yellow-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Sparkles className="w-3.5 h-3.5 fill-current" />
                                                <span>Descargar</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCloud(save.slotId, save.saveName)} 
                                                title="Eliminar de la Nube" 
                                                className="p-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-200 transition-colors border border-red-500/20 cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )
                    )}
                </div>
            </main>
        </div>
    );
};
