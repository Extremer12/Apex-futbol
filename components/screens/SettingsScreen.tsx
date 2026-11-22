import React, { useState, useRef } from 'react';
import { GameState } from '../../types';
import { GameAction } from '../../state/reducer';
import { HelpModal, AboutModal } from '../gameflow/PlaceholderModals';
import { clearAllData, saveGame, SavedGameData } from '../../services/db';
import { deleteAllUserDataFromCloud } from '../../services/cloudSave';
import { PrivacyPolicyModal } from '../settings/PrivacyPolicyModal';
import { CommunityPacksModal } from '../ui/CommunityPacksModal';
import { PackManager } from '../../services/resources/PackManager';
import { usePacksVersion } from '../../data/teams/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { LeaderboardModal } from '../leaderboard/LeaderboardModal';
import { useToast } from '../common/ToastProvider';
import { BottomSheet, StatCell } from './transfers/TransferUI';
import { isSoundEnabled, setSoundEnabled as persistSoundEnabled, playUiClick } from '../../services/soundService';
import {
    Save,
    Zap,
    Download,
    Upload,
    Cloud,
    Trophy,
    LogOut,
    LogIn,
    Volume2,
    VolumeX,
    Gauge,
    Coins,
    Layers,
    ChevronRight,
    Shield,
    HelpCircle,
    Info,
    Trash2,
    ExternalLink,
    AlertTriangle,
    DoorOpen
} from 'lucide-react';

interface SettingsScreenProps {
    gameState?: GameState;
    onSaveGame: (mode: 'overwrite' | 'new') => void;
    onQuickSave?: () => Promise<boolean>;
    onQuitToMenu: (skipConfirm?: boolean) => void;
    currentSaveName: string | null;
    lastSaved: Date | null;
    preferredCurrency: 'EUR' | 'USD';
    preferredLanguage?: 'en' | 'es';
    dispatch: React.Dispatch<GameAction>;
}

type SettingsTabKey = 'SAVE_CLOUD' | 'PREFERENCES' | 'SYSTEM';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
    gameState,
    onSaveGame,
    onQuickSave,
    onQuitToMenu,
    currentSaveName,
    lastSaved,
    preferredCurrency,
    dispatch
}) => {
    const { user, profile, signInWithGoogle, signOut, isConfigured } = useAuth();
    const { showToast } = useToast();
    usePacksVersion();

    const [activeTab, setActiveTab] = useState<SettingsTabKey>('SAVE_CLOUD');
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isPacksModalOpen, setIsPacksModalOpen] = useState(false);
    const [deleteCloudToo, setDeleteCloudToo] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isQuickSaving, setIsQuickSaving] = useState(false);

    const importInputRef = useRef<HTMLInputElement>(null);

    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isSoundEnabled());
    const [matchSpeed, setMatchSpeed] = useState<'1' | '2' | '4'>(() => {
        try {
            return (localStorage.getItem('apex_match_speed') as '1' | '2' | '4') || '1';
        } catch {
            return '1';
        }
    });

    const activePacksCount = PackManager.getInstalledPacks().filter(p => p.enabled).length;

    const handleToggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        persistSoundEnabled(next);
        if (next) {
            playUiClick();
            showToast('Efectos de sonido activados.', 'success');
        } else {
            showToast('Audio silenciado.', 'info');
        }
    };

    const handleSpeedChange = (speed: '1' | '2' | '4') => {
        setMatchSpeed(speed);
        try {
            localStorage.setItem('apex_match_speed', speed);
        } catch {
            // ignore
        }
        playUiClick();
    };

    const handleQuickSave = async () => {
        if (!onQuickSave || isQuickSaving) return;
        setIsQuickSaving(true);
        try {
            await onQuickSave();
        } finally {
            setIsQuickSaving(false);
        }
    };

    const handleExportJson = () => {
        if (!gameState) {
            showToast('No hay una partida activa para exportar.', 'error');
            return;
        }
        try {
            const payload = {
                schemaVersion: 2,
                exportedAt: new Date().toISOString(),
                saveName: currentSaveName || `${gameState.team.name} - T.${gameState.season}`,
                playerProfile: gameState.playerProfile || { name: 'Presidente' },
                gameState
            };
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const slug = gameState.team.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            a.href = url;
            a.download = `apex-${slug}-t${gameState.season}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            showToast('Respaldo .JSON exportado correctamente.', 'success');
        } catch (err) {
            console.error(err);
            showToast('No se pudo generar el archivo de respaldo.', 'error');
        }
    };

    const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        try {
            const rawText = await file.text();
            const parsed = JSON.parse(rawText);
            const importedState: GameState | undefined = parsed?.gameState || (parsed?.team && parsed?.allTeams ? parsed : undefined);
            if (!importedState || !importedState.team?.id || !Array.isArray(importedState.allTeams)) {
                showToast('El archivo seleccionado no corresponde a una partida válida de Apex AI.', 'error');
                return;
            }

            const careerId = importedState.careerId || `career_${importedState.team.id}_${Date.now()}`;
            const hydrated: GameState = {
                ...importedState,
                careerId,
                currentDate: new Date(importedState.currentDate || Date.now()),
                playerProfile: importedState.playerProfile || parsed?.playerProfile || { name: 'Presidente' }
            };

            dispatch({ type: 'LOAD_GAME', payload: hydrated });

            const saveName = parsed?.saveName || `${hydrated.team.name} (Importada)`;
            const saveData: SavedGameData = {
                id: careerId,
                careerId,
                saveName,
                playerProfile: hydrated.playerProfile || { name: 'Presidente' },
                gameState: hydrated,
                teamName: hydrated.team.name,
                slotType: 'manual',
                lastSaved: new Date()
            };
            await saveGame(saveData);
            showToast(`Carrera "${hydrated.team.name}" restaurada correctamente.`, 'success');
        } catch (err) {
            console.error('Import error:', err);
            showToast('Error al leer o validar el archivo JSON.', 'error');
        }
    };

    const handleClearData = async () => {
        setIsDeleting(true);
        try {
            if (user && deleteCloudToo) {
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
            window.location.reload();
        } catch (err) {
            console.error(err);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            showToast('No se pudieron borrar todos los datos.', 'error');
        }
    };

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-4 pb-24 max-w-5xl mx-auto animate-fade-in">
            {/* Hidden file input for JSON career import */}
            <input
                ref={importInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportJson}
            />

            {/* Sub-modals */}
            {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
            {isAboutModalOpen && <AboutModal onClose={() => setIsAboutModalOpen(false)} />}
            {isLeaderboardOpen && <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />}
            {isPrivacyModalOpen && <PrivacyPolicyModal onClose={() => setIsPrivacyModalOpen(false)} />}
            <CommunityPacksModal isOpen={isPacksModalOpen} onClose={() => setIsPacksModalOpen(false)} />

            {/* Compact Header */}
            <header className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">Ajustes</h1>
                    <span className="text-[11px] font-bold text-slate-400 truncate block">
                        {currentSaveName || 'Carrera activa'} · Sistema, nube y preferencias
                    </span>
                </div>
                <div className="px-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 text-right shrink-0">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">Guardado</span>
                    <span className={`text-xs font-black leading-none ${currentSaveName ? 'text-emerald-400' : 'text-[var(--apex-gold)]'}`}>
                        {currentSaveName ? 'ACTIVO' : 'LOCAL'}
                    </span>
                </div>
            </header>

            {/* Sticky Navigation Tabs */}
            <nav className="sticky top-0 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-1.5 bg-[var(--apex-darker,#070A13)]/95 backdrop-blur">
                <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-2xl" role="tablist" aria-label="Categorías de ajustes">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'SAVE_CLOUD'}
                        onClick={() => setActiveTab('SAVE_CLOUD')}
                        className={`h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            activeTab === 'SAVE_CLOUD' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Save className="w-3.5 h-3.5 hidden sm:inline" />
                        <span>Partida</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'PREFERENCES'}
                        onClick={() => setActiveTab('PREFERENCES')}
                        className={`h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            activeTab === 'PREFERENCES' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Gauge className="w-3.5 h-3.5 hidden sm:inline" />
                        <span>Preferencias</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'SYSTEM'}
                        onClick={() => setActiveTab('SYSTEM')}
                        className={`h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            activeTab === 'SYSTEM' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5 hidden sm:inline" />
                        <span>Sistema</span>
                    </button>
                </div>
            </nav>

            {/* 4 Compact Status KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <StatCell
                    label="Último guardado"
                    value={lastSaved ? lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Auto'}
                />
                <StatCell label="Velocidad" value={`${matchSpeed}x`} accent="text-[var(--apex-gold)]" />
                <StatCell label="Moneda" value={preferredCurrency} />
                <StatCell
                    label="Audio"
                    value={soundEnabled ? 'Activo' : 'Silencio'}
                    accent={soundEnabled ? 'text-emerald-400' : 'text-slate-400'}
                />
            </div>

            {/* TAB 1: SAVE & CLOUD */}
            {activeTab === 'SAVE_CLOUD' && (
                <div className="space-y-4">
                    {/* Local Save & Export */}
                    <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-4">
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                            <div className="min-w-0">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)] block">
                                    Almacenamiento Offline
                                </span>
                                <h2 className="text-base font-black text-white truncate mt-0.5">
                                    {currentSaveName || 'Partida en curso'}
                                </h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {lastSaved
                                        ? `Último registro: ${lastSaved.toLocaleTimeString()} · ${lastSaved.toLocaleDateString()}`
                                        : 'Autoguardado activo al completar semanas.'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {onQuickSave && (
                                <button
                                    type="button"
                                    disabled={isQuickSaving}
                                    onClick={handleQuickSave}
                                    className="h-11 px-4 rounded-xl bg-[var(--apex-gold)] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                                >
                                    <Zap className="w-4 h-4" />
                                    <span>{isQuickSaving ? 'Guardando...' : 'Guardado Rápido'}</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => onSaveGame('overwrite')}
                                className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <Save className="w-4 h-4 text-[var(--apex-gold)]" />
                                <span>Guardar Punto de Control</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleExportJson}
                                className="h-10 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Exportar Respaldo (.json)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => importInputRef.current?.click()}
                                className="h-10 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <Upload className="w-3.5 h-3.5 text-sky-400" />
                                <span>Importar Respaldo (.json)</span>
                            </button>
                        </div>
                    </div>

                    {/* Cloud & Ranking */}
                    <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Cloud className="w-4 h-4 text-sky-400" />
                                <h2 className="text-xs font-black text-white uppercase tracking-wider">Cuenta y Nube</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsLeaderboardOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--apex-gold)]/15 hover:bg-[var(--apex-gold)]/25 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 text-[11px] font-black transition-colors cursor-pointer"
                            >
                                <Trophy className="w-3.5 h-3.5" />
                                <span>Salón de la Fama</span>
                            </button>
                        </div>

                        {user ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {profile?.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={profile.full_name || profile.email || 'Avatar'}
                                            className="w-11 h-11 rounded-full border-2 border-[var(--apex-gold)] shrink-0"
                                        />
                                    ) : (
                                        <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black text-[var(--apex-gold)] shrink-0">
                                            {(profile?.full_name || user.email || 'P').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-black text-white truncate">
                                                {profile?.full_name || user.email?.split('@')[0] || 'Presidente'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                Conectado
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={signOut}
                                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold transition-colors shrink-0 cursor-pointer"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Conecta Google para sincronizar carreras en Supabase y registrar tu puntaje en el Salón de la Fama mundial.
                                </p>
                                <button
                                    type="button"
                                    onClick={signInWithGoogle}
                                    disabled={!isConfigured}
                                    className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-black shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Conectar Google</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quit to Main Menu */}
                    <button
                        type="button"
                        onClick={() => setIsQuitModalOpen(true)}
                        className="w-full apex-card p-4 rounded-2xl border-rose-500/20 hover:border-rose-500/40 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                                <DoorOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-white uppercase tracking-wider">Salir al Menú Principal</h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">Cierra la sesión actual tras guardar tu progreso.</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                    </button>
                </div>
            )}

            {/* TAB 2: PREFERENCES */}
            {activeTab === 'PREFERENCES' && (
                <div className="space-y-4">
                    {/* Match Speed */}
                    <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-[var(--apex-gold)]" />
                            <h2 className="text-xs font-black text-white uppercase tracking-wider">Velocidad de Partidos</h2>
                        </div>
                        <p className="text-xs text-slate-400">
                            Define la rapidez del relato minuto a minuto durante la simulación interactiva.
                        </p>
                        <div className="grid grid-cols-3 gap-2.5">
                            {([
                                { id: '1' as const, label: 'Normal' },
                                { id: '2' as const, label: 'Rápida' },
                                { id: '4' as const, label: 'Ultra' },
                            ]).map(sp => (
                                <button
                                    key={sp.id}
                                    type="button"
                                    onClick={() => handleSpeedChange(sp.id)}
                                    className={`p-3 rounded-2xl border text-center transition-colors cursor-pointer ${
                                        matchSpeed === sp.id
                                            ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)] text-[var(--apex-gold)]'
                                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/25'
                                    }`}
                                >
                                    <span className="text-lg font-black block leading-none">{sp.id}x</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider block mt-1 opacity-80">{sp.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sound Effects & Currency Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2">
                                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                                <h2 className="text-xs font-black text-white uppercase tracking-wider">Efectos de Sonido</h2>
                            </div>
                            <p className="text-xs text-slate-400">
                                Pitazo inicial/final, celebraciones de gol y confirmaciones táctiles.
                            </p>
                            <button
                                type="button"
                                onClick={handleToggleSound}
                                className={`w-full h-11 rounded-xl border text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                                    soundEnabled
                                        ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                }`}
                            >
                                {soundEnabled ? 'Audio Activado' : 'Audio Silenciado'}
                            </button>
                        </div>

                        <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4 text-[var(--apex-gold)]" />
                                <h2 className="text-xs font-black text-white uppercase tracking-wider">Moneda del Club</h2>
                            </div>
                            <p className="text-xs text-slate-400">
                                Símbolo empleado en presupuestos, salarios y negociaciones.
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    id="currency-eur"
                                    type="button"
                                    onClick={() => dispatch({ type: 'SET_CURRENCY', payload: 'EUR' })}
                                    className={`h-11 rounded-xl border text-xs font-black transition-colors cursor-pointer ${
                                        preferredCurrency === 'EUR'
                                            ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)] text-[var(--apex-gold)]'
                                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/25'
                                    }`}
                                >
                                    € Euro (EUR)
                                </button>
                                <button
                                    id="currency-usd"
                                    type="button"
                                    onClick={() => dispatch({ type: 'SET_CURRENCY', payload: 'USD' })}
                                    className={`h-11 rounded-xl border text-xs font-black transition-colors cursor-pointer ${
                                        preferredCurrency === 'USD'
                                            ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)] text-[var(--apex-gold)]'
                                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/25'
                                    }`}
                                >
                                    $ Dólar (USD)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visual Community Packs */}
                    <button
                        type="button"
                        onClick={() => setIsPacksModalOpen(true)}
                        className="w-full apex-card p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 hover:border-[var(--apex-gold)]/40 transition-colors text-left cursor-pointer group"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/30 flex items-center justify-center shrink-0">
                                <Layers className="w-5 h-5 text-[var(--apex-gold)]" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-black text-white truncate">Packs Visuales y Escudos Reales</h3>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">
                                    {activePacksCount > 0
                                        ? `${activePacksCount} ${activePacksCount === 1 ? 'pack activo' : 'packs activos'} en juego`
                                        : 'Base vectorial activa · Instala escudos, ligas y rostros'}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white shrink-0" />
                    </button>
                </div>
            )}

            {/* TAB 3: SYSTEM & LEGAL */}
            {activeTab === 'SYSTEM' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setIsHelpModalOpen(true)}
                            className="apex-card p-4 rounded-2xl text-left hover:border-[var(--apex-gold)]/40 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Guía y Tutorial</h3>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">Manual de gestión presidencial</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAboutModalOpen(true)}
                            className="apex-card p-4 rounded-2xl text-left hover:border-[var(--apex-gold)]/40 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] flex items-center justify-center shrink-0">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Acerca de Apex AI</h3>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">Versión oficial y características</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0" />
                        </button>
                    </div>

                    {/* Legal & Privacy */}
                    <div className="apex-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-sky-400" />
                                <h3 className="text-xs font-black text-white uppercase tracking-wider">Política de Privacidad</h3>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Directivas de Google Play Store, modo 100% offline y derechos de eliminación.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsPrivacyModalOpen(true)}
                                className="h-9 px-3.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-bold cursor-pointer"
                            >
                                Ver Política
                            </button>
                            <a
                                href="/privacy.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Abrir política en pestaña nueva"
                                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center justify-center"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="apex-card p-4 sm:p-5 rounded-2xl border-rose-500/25 bg-rose-950/10 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Trash2 className="w-4 h-4" />
                                <span>Zona de Peligro</span>
                            </h3>
                            <span className="text-[10px] text-slate-500 font-bold">Google Play Account Deletion</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Elimina de forma irreversible tus partidas locales, caché de packs visuales y respaldo vinculado en Supabase.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full h-11 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>{user ? 'Borrar Datos y Cuenta en la Nube' : 'Borrar Todos los Datos y Reiniciar'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Quit BottomSheet */}
            <BottomSheet
                open={isQuitModalOpen}
                onClose={() => setIsQuitModalOpen(false)}
                title="Salir al Menú Principal"
                footer={
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsQuitModalOpen(false)}
                            className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsQuitModalOpen(false);
                                onQuitToMenu(true);
                            }}
                            className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                        >
                            Salir
                        </button>
                    </div>
                }
            >
                <p className="text-xs text-slate-300 leading-relaxed">
                    Cualquier progreso posterior al último guardado se perderá. ¿Deseas volver al menú principal?
                </p>
            </BottomSheet>

            {/* Confirm Delete All Data BottomSheet */}
            <BottomSheet
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Borrar Datos y Reiniciar"
                footer={
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={handleClearData}
                            className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                        >
                            {isDeleting ? 'Borrando...' : (user && deleteCloudToo ? 'Eliminar Cuenta y Datos' : 'Borrar Todo')}
                        </button>
                    </div>
                }
            >
                <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-rose-200 leading-relaxed">
                            Esta acción eliminará permanentemente todas las carreras guardadas y packs instalados en este dispositivo.
                        </p>
                    </div>

                    {user && (
                        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={deleteCloudToo}
                                onChange={(e) => setDeleteCloudToo(e.target.checked)}
                                className="mt-0.5 rounded border-slate-600 text-rose-600 bg-slate-900"
                            />
                            <div className="text-xs">
                                <span className="text-white font-bold block">Eliminar también cuenta en Supabase</span>
                                <span className="text-slate-400 block mt-0.5">
                                    Borra las partidas en la nube vinculadas a <strong className="text-sky-400">{user.email}</strong> y retira tus puntajes del Salón de la Fama.
                                </span>
                            </div>
                        </label>
                    )}
                </div>
            </BottomSheet>
        </div>
    );
};
