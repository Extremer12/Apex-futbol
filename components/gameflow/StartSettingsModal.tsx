import React, { useState } from 'react';
import { Settings, Shield, Volume2, VolumeX, Eye, Info, Trash2, ExternalLink, Layers, CheckCircle2 } from 'lucide-react';
import { PrivacyPolicyModal } from '../settings/PrivacyPolicyModal';
import { clearAllData } from '../../services/db';
import { deleteAllUserDataFromCloud } from '../../services/cloudSave';
import { PackManager } from '../../services/resources/PackManager';
import { useAuth } from '../../contexts/AuthContext';
import { isSoundEnabled, setSoundEnabled as persistSoundEnabled, playUiClick } from '../../services/soundService';
import { BottomSheet } from '../screens/transfers/TransferUI';

interface StartSettingsModalProps {
    onClose: () => void;
    onOpenPacks?: () => void;
}

export const StartSettingsModal: React.FC<StartSettingsModalProps> = ({ onClose, onOpenPacks }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'settings' | 'privacy' | 'about'>('settings');
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [confirmResetArmed, setConfirmResetArmed] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);

    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isSoundEnabled());

    const toggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        persistSoundEnabled(next);
        if (next) playUiClick();
    };

    const [matchSpeed, setMatchSpeed] = useState<'1' | '2' | '4'>(() => {
        try {
            return (localStorage.getItem('apex_match_speed') as '1' | '2' | '4') || '1';
        } catch {
            return '1';
        }
    });

    const handleSpeedChange = (speed: '1' | '2' | '4') => {
        setMatchSpeed(speed);
        try {
            localStorage.setItem('apex_match_speed', speed);
        } catch {
            // ignore
        }
        playUiClick();
    };

    const handleClearData = async () => {
        if (!confirmResetArmed) {
            setConfirmResetArmed(true);
            return;
        }
        setIsDeleting(true);
        setResetError(null);
        try {
            if (user) {
                await deleteAllUserDataFromCloud();
            }
            await clearAllData();
            try {
                await PackManager.clearAllPacks();
            } catch {
                // ignore
            }
            try {
                localStorage.clear();
            } catch {
                // ignore
            }
            setDeleteSuccess(true);
            setTimeout(() => {
                window.location.reload();
            }, 900);
        } catch (err) {
            console.error('Error clearing data:', err);
            setResetError('No se pudo completar el borrado. Intenta nuevamente.');
            setIsDeleting(false);
            setConfirmResetArmed(false);
        }
    };

    return (
        <>
            {isPrivacyModalOpen && (
                <PrivacyPolicyModal onClose={() => setIsPrivacyModalOpen(false)} />
            )}

            <BottomSheet
                open
                onClose={onClose}
                size="lg"
                title="Ajustes y Configuración"
                footer={
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Listo
                    </button>
                }
            >
                <div className="space-y-4">
                    {/* Navigation Tabs */}
                    <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className={`h-9 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === 'settings'
                                    ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Settings className="w-3.5 h-3.5" />
                            <span>General</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('privacy')}
                            className={`h-9 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === 'privacy'
                                    ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Privacidad</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('about')}
                            className={`h-9 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === 'about'
                                    ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Info className="w-3.5 h-3.5" />
                            <span>Acerca de</span>
                        </button>
                    </div>

                    {/* Tab: General Settings */}
                    {activeTab === 'settings' && (
                        <div className="space-y-3">
                            {/* Sound Effects */}
                            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                                        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h5 className="text-white text-xs font-black">Efectos de Sonido</h5>
                                        <p className="text-[11px] text-slate-400 truncate">Pitazos, goles y notificaciones</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleSound}
                                    className={`px-3.5 h-9 rounded-xl text-xs font-black transition-colors shrink-0 cursor-pointer ${
                                        soundEnabled
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                                    }`}
                                >
                                    {soundEnabled ? 'Activado' : 'Silenciado'}
                                </button>
                            </div>

                            {/* Match Speed Preference */}
                            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                                <div>
                                    <h5 className="text-white text-xs font-black">Velocidad de Simulación</h5>
                                    <p className="text-[11px] text-slate-400">Ritmo del relato en vivo durante partidos</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['1', '2', '4'] as const).map(speed => (
                                        <button
                                            key={speed}
                                            type="button"
                                            onClick={() => handleSpeedChange(speed)}
                                            className={`h-10 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                                                matchSpeed === speed
                                                    ? 'bg-[var(--apex-gold)] text-slate-950'
                                                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                                            }`}
                                        >
                                            {speed}x · {speed === '1' ? 'Normal' : speed === '2' ? 'Rápida' : 'Ultra'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Community Packs Quick Link */}
                            {onOpenPacks && (
                                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] flex items-center justify-center shrink-0">
                                            <Layers className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <h5 className="text-white text-xs font-black">Packs y Escudos Reales</h5>
                                            <p className="text-[11px] text-slate-400 truncate">Personaliza escudos, caras y trofeos</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onOpenPacks();
                                        }}
                                        className="px-3.5 h-9 bg-[var(--apex-gold)]/15 hover:bg-[var(--apex-gold)]/25 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 rounded-xl text-xs font-black shrink-0 cursor-pointer"
                                    >
                                        Gestionar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Privacy & Data */}
                    {activeTab === 'privacy' && (
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <h5 className="text-white text-xs font-black">Política de Privacidad</h5>
                                    <button
                                        type="button"
                                        onClick={() => setIsPrivacyModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold cursor-pointer"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Leer</span>
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Cumplimos con las directivas de datos de Google Play Store. No vendemos información personal ni solicitamos permisos invasivos.
                                </p>
                                <a
                                    href="/privacy.html"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
                                >
                                    <span>Abrir en navegador</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>

                            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-3">
                                <div>
                                    <h5 className="text-rose-300 text-xs font-black">Restablecer Datos Locales y Nube</h5>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Elimina todas las partidas guardadas, packs instalados y registros vinculados en Supabase.
                                    </p>
                                </div>
                                {resetError && (
                                    <p className="text-[11px] text-rose-400 font-bold">{resetError}</p>
                                )}
                                {deleteSuccess ? (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Datos eliminados. Reiniciando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={handleClearData}
                                            disabled={isDeleting}
                                            className="inline-flex items-center gap-2 px-3.5 h-9 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-colors disabled:opacity-50 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>
                                                {isDeleting
                                                    ? 'Borrando...'
                                                    : confirmResetArmed
                                                    ? 'Confirmar borrado definitivo'
                                                    : 'Borrar todos mis datos'}
                                            </span>
                                        </button>
                                        {confirmResetArmed && !isDeleting && (
                                            <button
                                                type="button"
                                                onClick={() => setConfirmResetArmed(false)}
                                                className="px-3 h-9 rounded-xl bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab: About Apex AI */}
                    {activeTab === 'about' && (
                        <div className="space-y-3 text-xs text-slate-300">
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-black text-sm">Apex AI Football President</h4>
                                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 text-[10px] font-black">
                                        v1.0 Oficial
                                    </span>
                                </div>
                                <p className="text-slate-400 leading-relaxed">
                                    Simulador integral de gestión y presidencia futbolística offline-first con ligas de América, Europa y copas continentales.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </BottomSheet>
        </>
    );
};
