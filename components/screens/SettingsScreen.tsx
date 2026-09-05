import React, { useState } from 'react';
import { HelpModal } from '../gameflow/PlaceholderModals';
import { QuestionMarkCircleIcon, TrashIcon } from '../icons';
import { clearAllData } from '../../services/db';
import { Modal } from '../ui/Modal';

import { GameAction } from '../../state/reducer';

interface SettingsScreenProps {
    onSaveGame: (mode: 'overwrite' | 'new') => void;
    onQuitToMenu: () => void;
    currentSaveName: string | null;
    lastSaved: Date | null;
    preferredCurrency: 'EUR' | 'USD';
    preferredLanguage: 'en' | 'es';
    dispatch: React.Dispatch<GameAction>;
}

import { translations } from '../../src/i18n/translations';
import { CommunityPacksSection } from './settings/CommunityPacksSection';
import { useAuth } from '../../contexts/AuthContext';
import { LeaderboardModal } from '../leaderboard/LeaderboardModal';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onSaveGame, onQuitToMenu, currentSaveName, lastSaved, preferredCurrency, preferredLanguage, dispatch }) => {
    const t = translations[preferredLanguage || 'es'];
    const { user, profile, signInWithGoogle, signOut, isConfigured } = useAuth();
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
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
            
            {isLeaderboardOpen && <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />}

            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-sky-400">Ajustes y Sistema</h2>
            </div>

            {/* Supabase Cloud & Account Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span>☁️ Cuenta y Sincronización en la Nube</span>
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5">
                    {user ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.display_name || 'Avatar'}
                                        className="w-12 h-12 rounded-full border-2 border-[var(--apex-gold)] shadow-md"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-black text-[var(--apex-gold)] border border-slate-700">
                                        {(profile?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold text-base">{profile?.display_name || 'Presidente'}</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-900/30 text-green-400 border border-green-500/30">
                                            Google Conectado
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                    <p className="text-[11px] text-sky-400 font-medium mt-0.5">Sincronización en la nube Supabase activa</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <button
                                    onClick={() => setIsLeaderboardOpen(true)}
                                    className="px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-bold transition-all"
                                >
                                    🏆 Ranking Mundial
                                </button>
                                <button
                                    onClick={signOut}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-sm">Respalda tus partidas y compite en el ranking</h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Inicia sesión con tu cuenta de Google para guardar tus partidas automáticamente en la nube de Supabase y figurar en el Salón de la Fama mundial.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <button
                                    onClick={signInWithGoogle}
                                    disabled={!isConfigured}
                                    className="flex items-center gap-2.5 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                                    </svg>
                                    Conectar con Google
                                </button>
                                <button
                                    onClick={() => setIsLeaderboardOpen(true)}
                                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all"
                                >
                                    🏆 Ver Salón de la Fama
                                </button>
                            </div>
                        </div>
                    )}
                </div>
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

            {/* Language Settings */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.settings.language}</h3>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <p className="text-slate-400 text-sm mb-4">
                        {preferredLanguage === 'es' ? 'Elige el idioma de la interfaz del juego.' : 'Choose the language for the game interface.'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'es' })}
                            className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-black text-lg transition-all ${
                                preferredLanguage === 'es'
                                    ? 'border-[var(--apex-gold)] bg-[var(--apex-gold)]/10 text-[var(--apex-gold)]'
                                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                            <span className="text-xl">🇪🇸</span> Español
                        </button>
                        <button
                            onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'en' })}
                            className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-black text-lg transition-all ${
                                preferredLanguage === 'en'
                                    ? 'border-[var(--apex-gold)] bg-[var(--apex-gold)]/10 text-[var(--apex-gold)]'
                                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                            <span className="text-xl">🇺🇸</span> English
                        </button>
                    </div>
                </div>
            </div>

            {/* Currency Settings */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.settings.currency || 'Moneda'}</h3>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <p className="text-slate-400 text-sm mb-4">
                        {preferredLanguage === 'es' ? 'Elige la moneda para valores y presupuestos.' : 'Choose the currency for values and budgets.'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            id="currency-eur"
                            onClick={() => dispatch({ type: 'SET_CURRENCY', payload: 'EUR' })}
                            className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-black text-lg transition-all ${
                                preferredCurrency === 'EUR'
                                    ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                            <span className="text-2xl">€</span> Euro (EUR)
                        </button>
                        <button
                            id="currency-usd"
                            onClick={() => dispatch({ type: 'SET_CURRENCY', payload: 'USD' })}
                            className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-black text-lg transition-all ${
                                preferredCurrency === 'USD'
                                    ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                            <span className="text-2xl">$</span> Dólar (USD)
                        </button>
                    </div>
                </div>
            </div>

            {/* Community Logo & Asset Packs Section */}
            <div className="space-y-4">
                <CommunityPacksSection />
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