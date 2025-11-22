import React, { useState } from 'react';
import { HelpModal } from '../gameflow/PlaceholderModals';
import { QuestionMarkCircleIcon, TrashIcon } from '../icons';
import { clearAllData } from '../../services/db';
import { Modal } from '../ui/Modal';

interface SettingsScreenProps {
    onSaveGame: (mode: 'overwrite' | 'new') => void;
    onQuitToMenu: () => void;
    currentSaveName: string | null;
    lastSaved: Date | null;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onSaveGame, onQuitToMenu, currentSaveName, lastSaved }) => {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleClearData = async () => {
        setIsDeleting(true);
        try {
            await clearAllData();
            window.location.reload(); // Force reload to clear state
        } catch (e) {
            console.error(e);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    }

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-8 pb-24">
            {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
            
            {/* Modal de Confirmación de Salida */}
            {isQuitModalOpen && (
                <Modal title="¿Salir al Menú Principal?" onClose={() => setIsQuitModalOpen(false)}>
                    <div className="space-y-4">
                        <p className="text-slate-300">
                            Cualquier progreso no guardado se perderá. ¿Estás seguro de que quieres salir?
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button 
                                onClick={() => setIsQuitModalOpen(false)} 
                                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={onQuitToMenu} 
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-red-600/20"
                            >
                                Salir
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal de Confirmación de Borrado Total */}
            {isDeleteModalOpen && (
                <Modal title="¿Borrar TODOS los Datos?" onClose={() => setIsDeleteModalOpen(false)}>
                    <div className="space-y-4">
                        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                            <p className="text-red-400 font-bold text-sm uppercase mb-1">Advertencia</p>
                            <p className="text-slate-300 text-sm">
                                Esta acción eliminará permanentemente <strong>todas las partidas guardadas</strong> y reiniciará la aplicación a su estado original. No se puede deshacer.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)} 
                                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleClearData} 
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-red-600/20 flex items-center gap-2"
                            >
                                {isDeleting ? 'Borrando...' : 'Sí, Borrar Todo'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-sky-400">Ajustes y Sistema</h2>
            </div>

            {/* Save Management Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Gestión de Partida</h3>
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="text-white font-bold text-lg">{currentSaveName || 'Partida Sin Guardar'}</p>
                                <p className="text-sm text-slate-400">
                                    {lastSaved 
                                        ? `Último guardado: ${lastSaved.toLocaleTimeString()} - ${lastSaved.toLocaleDateString()}` 
                                        : 'Aún no se ha guardado el progreso.'}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${currentSaveName ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'}`}>
                                {currentSaveName ? 'ACTIVO' : 'NO GUARDADO'}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Apex AI guarda automáticamente tu progreso al avanzar de semana. Utiliza las opciones de abajo para crear puntos de control manuales.
                        </p>
                    </div>
                    <div className="p-4 bg-slate-800/30 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => onSaveGame('overwrite')}
                            disabled={!currentSaveName}
                            className="flex-1 bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-sky-600/10"
                        >
                            Guardar Partida
                        </button>
                        <button
                            onClick={() => onSaveGame('new')}
                            className="flex-1 bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
                        >
                            Guardar como Nueva
                        </button>
                    </div>
                </div>
            </div>

            {/* Game Options */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Opciones</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => setIsHelpModalOpen(true)}
                        className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-4 rounded-xl text-left group transition-all"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-sky-900/50 transition-colors">
                                <QuestionMarkCircleIcon className="w-6 h-6 text-sky-400"/>
                            </div>
                            <span className="font-bold text-white">Ayuda y Tutorial</span>
                        </div>
                        <p className="text-xs text-slate-400">Consulta las reglas básicas y consejos de juego.</p>
                    </button>

                    <button
                        onClick={() => setIsQuitModalOpen(true)}
                        className="bg-slate-900 border border-slate-800 hover:border-red-500/50 p-4 rounded-xl text-left group transition-all"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-red-900/50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                </svg>
                            </div>
                            <span className="font-bold text-white">Salir al Menú</span>
                        </div>
                        <p className="text-xs text-slate-400">Vuelve a la pantalla de inicio. ¡Guarda antes!</p>
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-4 pt-4 border-t border-slate-800/50">
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                    <TrashIcon className="w-4 h-4" /> Zona de Peligro
                </h3>
                <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="w-full bg-red-900/20 border border-red-900/50 text-red-400 hover:bg-red-900/40 hover:text-red-200 font-semibold py-3 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                    Borrar Todos los Datos y Reiniciar
                </button>
            </div>
        </div>
    );
};