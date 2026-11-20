import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Settings, Shield, Volume2, VolumeX, Eye, Info, Trash2, ExternalLink } from 'lucide-react';
import { PrivacyPolicyModal } from '../settings/PrivacyPolicyModal';
import { clearAllData } from '../../services/db';
import { deleteAllUserDataFromCloud } from '../../services/cloudSave';
import { PackManager } from '../../services/resources/PackManager';
import { useAuth } from '../../contexts/AuthContext';

interface StartSettingsModalProps {
    onClose: () => void;
    onOpenPacks?: () => void;
}

export const StartSettingsModal: React.FC<StartSettingsModalProps> = ({ onClose, onOpenPacks }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'settings' | 'privacy' | 'about'>('settings');
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    // Audio preferences
    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
        try {
            return localStorage.getItem('apex_sound_enabled') !== 'false';
        } catch (_) {
            return true;
        }
    });

    const toggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        try {
            localStorage.setItem('apex_sound_enabled', String(next));
        } catch (_) {}
    };

    // Match speed
    const [matchSpeed, setMatchSpeed] = useState<'1' | '2' | '4'>(() => {
        try {
            return (localStorage.getItem('apex_match_speed') as any) || '1';
        } catch (_) {
            return '1';
        }
    });

    const handleSpeedChange = (speed: '1' | '2' | '4') => {
        setMatchSpeed(speed);
        try {
            localStorage.setItem('apex_match_speed', speed);
        } catch (_) {}
    };

    const handleClearData = async () => {
        if (!window.confirm('¿Estás seguro de que deseas restablecer todos los datos del juego? Esta acción no se puede deshacer.')) {
            return;
        }
        setIsDeleting(true);
        try {
            if (user) {
                await deleteAllUserDataFromCloud();
            }
            await clearAllData();
            try {
                await PackManager.clearAllPacks();
            } catch (_) {}
            try {
                localStorage.clear();
            } catch (_) {}
            setDeleteSuccess(true);
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch (err) {
            console.error('Error clearing data:', err);
            alert('Error al restablecer los datos.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {isPrivacyModalOpen && (
                <PrivacyPolicyModal onClose={() => setIsPrivacyModalOpen(false)} />
            )}

            <Modal title="Ajustes y Configuración" onClose={onClose}>
                <div className="space-y-4">
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-slate-800">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                activeTab === 'settings'
                                    ? 'border-[var(--apex-gold)] text-[var(--apex-gold)]'
                                    : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                        >
                            <Settings className="w-3.5 h-3.5" />
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                activeTab === 'privacy'
                                    ? 'border-[var(--apex-gold)] text-[var(--apex-gold)]'
                                    : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                        >
                            <Shield className="w-3.5 h-3.5" />
                            Privacidad y Datos
                        </button>
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                                activeTab === 'about'
                                    ? 'border-[var(--apex-gold)] text-[var(--apex-gold)]'
                                    : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                        >
                            <Info className="w-3.5 h-3.5" />
                            Acerca de
                        </button>
                    </div>

                    {/* Tab: General Settings */}
                    {activeTab === 'settings' && (
                        <div className="space-y-4 pt-1">
                            {/* Sound Effects */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <h5 className="text-white text-xs font-bold">Efectos de Sonido</h5>
                                        <p className="text-[11px] text-slate-400">Sonidos de partidos y notificaciones</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleSound}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        soundEnabled 
                                            ? 'bg-blue-600 text-white shadow-sm' 
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {soundEnabled ? 'Activado' : 'Silenciado'}
                                </button>
                            </div>

                            {/* Match Speed Preference */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h5 className="text-white text-xs font-bold">Velocidad de Simulación</h5>
                                        <p className="text-[11px] text-slate-400">Ritmo de los relatos y jugadas en partido</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    {(['1', '2', '4'] as const).map(speed => (
                                        <button
                                            key={speed}
                                            onClick={() => handleSpeedChange(speed)}
                                            className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                                matchSpeed === speed
                                                    ? 'bg-[var(--apex-gold)] text-black shadow-md'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        >
                                            {speed}x {speed === '1' ? 'Normal' : speed === '2' ? 'Rápida' : 'Ultra'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Community Packs Quick Link */}
                            {onOpenPacks && (
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                                    <div>
                                        <h5 className="text-white text-xs font-bold">Packs y Escudos Reales</h5>
                                        <p className="text-[11px] text-slate-400">Personaliza escudos, caras y trofeos</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onOpenPacks();
                                        }}
                                        className="px-3 py-1.5 bg-[var(--apex-gold)]/20 hover:bg-[var(--apex-gold)]/30 text-[var(--apex-gold)] border border-[var(--apex-gold)]/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Gestionar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Privacy & Data */}
                    {activeTab === 'privacy' && (
                        <div className="space-y-3.5 pt-1">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-white text-xs font-bold">Política de Privacidad</h5>
                                    <button
                                        onClick={() => setIsPrivacyModalOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Leer en el juego
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Cumplimos con GDPR, CCPA y las políticas de datos de Google Play Store. No vendemos información personal ni compartimos datos con terceros.
                                </p>
                                <a
                                    href="/privacy.html"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline pt-1"
                                >
                                    Ver en navegador web <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>

                            {/* Reset Data & Cloud Deletion */}
                            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-3.5">
                                <h5 className="text-red-400 text-xs font-bold mb-1">Restablecer Datos Locales y Nube</h5>
                                <p className="text-[11px] text-slate-400 mb-3">
                                    Elimina todas tus partidas guardadas, logros locales y desvincula tus datos en la nube de Supabase.
                                </p>
                                {deleteSuccess ? (
                                    <div className="text-xs font-bold text-green-400 py-1">
                                        ✓ Datos eliminados correctamente. Reiniciando...
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleClearData}
                                        disabled={isDeleting}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        {isDeleting ? 'Borrando...' : 'Borrar todos mis datos'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab: About Apex AI */}
                    {activeTab === 'about' && (
                        <div className="space-y-3 pt-1 text-xs text-slate-300">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-bold text-sm">Apex AI Football President</h4>
                                    <span className="px-2 py-0.5 rounded-full bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] border border-[var(--apex-gold)]/40 text-[10px] font-black">
                                        v1.0.0 Oficial
                                    </span>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Simulador integral de gestión y presidencia futbolística. Toma decisiones financieras, gestiona fichajes, contrata entrenadores y lleva a tu club hasta la gloria continental y mundial.
                                </p>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                                <h5 className="text-white font-bold text-xs">Características Principales</h5>
                                <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-1">
                                    <li>Más de 380 clubes y 6,400 futbolistas reales en 12 ligas</li>
                                    <li>Sincronización en la nube con Google Play & Supabase</li>
                                    <li>Salón de la Fama y Clasificación Global de Presidentes</li>
                                    <li>Packs de la comunidad modulares y personalización visual offline</li>
                                    <li>Simulación avanzada de partidos y economía de club realista</li>
                                </ul>
                            </div>

                            <p className="text-[10px] text-slate-500 text-center pt-2">
                                Desarrollado con pasión para los amantes del fútbol y la estrategia táctica.
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};
