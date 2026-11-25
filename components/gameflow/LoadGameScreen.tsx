import React, { useState, useEffect, useRef } from 'react';
import {
    getSavedGames,
    deleteGame,
    SavedGameSummary,
    exportSaveToFile,
    importSaveFromFile,
} from '../../services/db';
import { getCloudSaves, deleteCloudSave, CloudSaveSummary } from '../../services/cloudSave';
import { useAuth } from '../../contexts/AuthContext';
import { TEAMS } from '../../constants';
import { LoadingSpinner } from '../icons';
import { TeamLogo } from '../../data/teams/helpers';
import { AuthModal } from '../auth/AuthModal';
import { Modal } from '../ui/Modal';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Trash2,
    Play,
    Download,
    Upload,
    ChevronRight,
} from 'lucide-react';
import { formatCurrencyShort } from '../../utils';

interface LoadGameScreenProps {
    onLoadGame: (id: string, isCloud?: boolean) => void;
    onBack: () => void;
}

type DeleteTarget = {
    kind: 'local' | 'cloud';
    id: string;
    label: string;
};

type NoticeBanner = {
    type: 'success' | 'error';
    text: string;
};

const getTeamDetails = (teamId: number) => TEAMS.find((t) => t.id === teamId);

const resolveClubAccent = (primaryColor?: string): string => {
    const hex = (primaryColor || '').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#3D7BFF';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance < 0.14 ? '#3D7BFF' : `#${hex}`;
};

const getSlotLabel = (slotType: string): { label: string; tone: 'gold' | 'cyan' | 'neutral' } => {
    if (slotType === 'autosave') return { label: 'Autoguardado', tone: 'gold' };
    if (slotType === 'quicksave') return { label: 'Guardado Rápido', tone: 'cyan' };
    return { label: 'Manual', tone: 'neutral' };
};

const getCustomSlotTag = (saveName: string, teamName: string): string | null => {
    const cleaned = saveName.trim();
    const normTeam = teamName.trim().toLowerCase();
    const lower = cleaned.toLowerCase();
    if (
        !cleaned ||
        lower === normTeam ||
        lower === `${normTeam} - autoguardado` ||
        lower === `${normTeam} - guardado rápido` ||
        lower === `${normTeam} - autosave`
    ) {
        return null;
    }
    return cleaned;
};

export const LoadGameScreen: React.FC<LoadGameScreenProps> = ({ onLoadGame, onBack }) => {
    const { user } = useAuth();
    const [tab, setTab] = useState<'local' | 'cloud'>('local');
    const [localSaves, setLocalSaves] = useState<SavedGameSummary[]>([]);
    const [cloudSaves, setCloudSaves] = useState<CloudSaveSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [notice, setNotice] = useState<NoticeBanner | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showNotice = (type: 'success' | 'error', text: string) => {
        setNotice({ type, text });
    };

    useEffect(() => {
        if (!notice) return;
        const t = setTimeout(() => setNotice(null), 4000);
        return () => clearTimeout(t);
    }, [notice]);

    const fetchSaves = async () => {
        setIsLoading(true);
        try {
            const local = await getSavedGames();
            setLocalSaves(local);
            if (user) {
                const cloud = await getCloudSaves();
                setCloudSaves(cloud);
            } else {
                setCloudSaves([]);
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

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            if (deleteTarget.kind === 'local') {
                await deleteGame(deleteTarget.id);
            } else {
                await deleteCloudSave(deleteTarget.id);
            }
            setDeleteTarget(null);
            showNotice('success', `Partida "${deleteTarget.label}" eliminada.`);
            await fetchSaves();
        } catch (err) {
            showNotice('error', `No se pudo eliminar: ${String(err)}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExport = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const { blob, filename } = await exportSaveToFile(id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotice('success', `Archivo exportado: ${filename}`);
        } catch (err) {
            showNotice('error', `Error al exportar: ${String(err)}`);
        }
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const imported = await importSaveFromFile(file);
            showNotice('success', `Partida "${imported.saveName}" importada correctamente.`);
            setTab('local');
            await fetchSaves();
        } catch (err) {
            showNotice('error', `Error al importar archivo: ${String(err)}`);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-[100dvh] bg-[var(--apex-darker)] text-white flex flex-col relative overflow-hidden select-none">
            {isAuthModalOpen && <AuthModal mode="fullscreen" onClose={() => setIsAuthModalOpen(false)} />}

            <Modal
                title="Eliminar Carrera"
                isOpen={Boolean(deleteTarget)}
                onClose={() => !isDeleting && setDeleteTarget(null)}
                maxWidth="max-w-sm"
            >
                {deleteTarget && (
                    <div className="space-y-4">
                        <p className="text-xs sm:text-sm text-[var(--apex-text-secondary)] leading-relaxed">
                            ¿Confirmas eliminar{' '}
                            <strong className="text-white">{deleteTarget.label}</strong>
                            {deleteTarget.kind === 'cloud' ? ' de tu nube' : ' de este dispositivo'}? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.07]">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={isDeleting}
                                autoFocus
                                className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2.5 rounded-xl bg-[var(--apex-red)]/20 hover:bg-[var(--apex-red)]/35 border border-[var(--apex-red)]/45 text-[#FF8CA8] text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isDeleting ? 'Eliminando…' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".apexsave,.json"
                className="hidden"
            />

            {/* Fullscreen Atmospheric Office Backdrop */}
            <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url("/assets/bg/transfers.webp")' }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(4,6,14,0.62) 0%, rgba(4,6,14,0.82) 32%, rgba(4,6,13,0.96) 66%, #04060D 100%)',
                    }}
                />
                <div
                    className="absolute -top-24 left-1/2 -translate-x-1/2 w-[120%] h-72 rounded-full blur-3xl opacity-45"
                    style={{ background: 'radial-gradient(closest-side, rgba(45,212,255,0.28), rgba(255,201,64,0.10), transparent 75%)' }}
                />
                <div className="apex-grain" />
            </div>

            {/* Single Clean Top Navigation */}
            <header className="sticky top-0 z-30 pt-safe backdrop-blur-xl bg-[#050814]/70 border-b border-white/[0.07]">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-slate-200 hover:text-white transition-all text-xs font-extrabold uppercase tracking-wider active:scale-95 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 text-[var(--apex-brand)]" />
                        <span>Menú</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--apex-brand)]/10 hover:bg-[var(--apex-brand)]/20 border border-[var(--apex-brand)]/35 text-[#9BEFFF] text-xs font-extrabold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                        title="Importar partida (.apexsave o .json)"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Importar</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-5 pb-8 flex flex-col">
                {/* Broadcast Heading */}
                <div className="mb-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.34em] text-[var(--apex-gold)] mb-1">
                        Archivo del Club
                    </p>
                    <h1 className="font-display text-3xl sm:text-4xl font-extrabold italic uppercase tracking-wide text-white leading-none">
                        Carreras Guardadas
                    </h1>
                </div>

                {/* Sliding Pill Switcher: Dispositivo vs Nube */}
                <div
                    className="grid grid-cols-2 p-1 rounded-2xl border border-white/10 bg-[#080D1B]/90 backdrop-blur-md mb-5 shadow-lg"
                    role="tablist"
                    aria-label="Ubicación de partidas"
                >
                    {[
                        { id: 'local' as const, label: 'Dispositivo', count: localSaves.length },
                        { id: 'cloud' as const, label: 'Nube', count: user ? cloudSaves.length : null },
                    ].map((item) => {
                        const active = tab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setTab(item.id)}
                                className="relative py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
                            >
                                {active && (
                                    <motion.div
                                        layoutId="loadTabIndicator"
                                        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                                        className="absolute inset-0 rounded-xl"
                                        style={{
                                            background:
                                                item.id === 'cloud'
                                                    ? 'linear-gradient(180deg, rgba(255,201,64,0.22), rgba(245,158,11,0.08))'
                                                    : 'linear-gradient(180deg, rgba(45,212,255,0.22), rgba(61,123,255,0.08))',
                                            border:
                                                item.id === 'cloud'
                                                    ? '1px solid rgba(255,201,64,0.45)'
                                                    : '1px solid rgba(45,212,255,0.45)',
                                        }}
                                    />
                                )}
                                <span
                                    className="relative z-10 flex items-center justify-center gap-2"
                                    style={{
                                        color: active ? '#FFFFFF' : 'var(--apex-text-muted)',
                                    }}
                                >
                                    <span>{item.label}</span>
                                    {item.count !== null && (
                                        <span
                                            className={`px-1.5 py-0.5 rounded-md text-[10px] tabular ${
                                                active
                                                    ? 'bg-white/15 text-white'
                                                    : 'bg-white/5 text-[var(--apex-text-muted)]'
                                            }`}
                                        >
                                            {item.count}
                                        </span>
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Inline Notice */}
                <AnimatePresence>
                    {notice && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            role="status"
                            className={`mb-4 px-4 py-2.5 rounded-xl text-xs font-bold border ${
                                notice.type === 'error'
                                    ? 'bg-[var(--apex-red)]/15 border-[var(--apex-red)]/40 text-[#FF8CA8]'
                                    : 'bg-[var(--apex-green)]/12 border-[var(--apex-green)]/35 text-[var(--apex-green-light)]'
                            }`}
                        >
                            {notice.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Career Slots */}
                <div className="flex-1 space-y-3.5">
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center h-60 gap-3">
                            <LoadingSpinner />
                            <p className="text-[11px] text-[var(--apex-text-secondary)] font-extrabold tracking-[0.2em] uppercase">
                                Cargando archivos…
                            </p>
                        </div>
                    ) : tab === 'local' ? (
                        localSaves.length === 0 ? (
                            <div className="apex-card p-8 sm:p-10 text-center space-y-5 my-auto">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[var(--apex-brand)]">
                                        Sin Registros Locales
                                    </p>
                                    <h2 className="font-display text-2xl font-extrabold italic uppercase text-white">
                                        Ninguna Carrera Guardada
                                    </h2>
                                    <p className="text-xs text-[var(--apex-text-secondary)] max-w-sm mx-auto leading-relaxed">
                                        Inicia una nueva presidencia desde el menú principal o importa un archivo de respaldo.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-center gap-2.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        className="apex-btn-brand"
                                    >
                                        <Play className="w-4 h-4 fill-current" />
                                        <span>Ir al Menú Principal</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-extrabold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <Upload className="w-4 h-4 text-[var(--apex-brand)]" />
                                        <span>Importar Archivo</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            localSaves.map((save, idx) => {
                                const team = getTeamDetails(save.teamId);
                                const clubAccent = resolveClubAccent(team?.primaryColor);
                                const slot = getSlotLabel(save.slotType);
                                const customTag = getCustomSlotTag(save.saveName, save.teamName);
                                const isPrimary = idx === 0;

                                return (
                                    <motion.article
                                        key={save.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.28, delay: Math.min(idx * 0.05, 0.25) }}
                                        className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.85)]"
                                        style={{
                                            background: `radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, ${clubAccent} 22%, transparent), transparent 58%), linear-gradient(165deg, rgba(19, 28, 54, 0.94), rgba(8, 12, 24, 0.97))`,
                                        }}
                                    >
                                        {/* Club accent rim */}
                                        <div
                                            aria-hidden
                                            className="h-[2px] w-full"
                                            style={{
                                                background: `linear-gradient(90deg, ${clubAccent}, rgba(255,255,255,0.12), transparent)`,
                                            }}
                                        />

                                        <div className="p-4 sm:p-5 space-y-4">
                                            {/* Top Meta Row: Slot Badge + Timestamp */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                                                            slot.tone === 'gold'
                                                                ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/40 text-[var(--apex-gold-light)]'
                                                                : slot.tone === 'cyan'
                                                                ? 'bg-[var(--apex-brand)]/15 border-[var(--apex-brand)]/40 text-[#9BEFFF]'
                                                                : 'bg-white/10 border-white/15 text-slate-200'
                                                        }`}
                                                    >
                                                        {slot.label}
                                                    </span>
                                                    {customTag && (
                                                        <span className="text-[11px] font-semibold text-[var(--apex-text-secondary)] truncate">
                                                            {customTag}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-semibold text-[var(--apex-text-muted)] tabular shrink-0">
                                                    {new Date(save.lastSaved).toLocaleString('es-ES', {
                                                        dateStyle: 'short',
                                                        timeStyle: 'short',
                                                    })}
                                                </span>
                                            </div>

                                            {/* Club Hero Row */}
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div
                                                    className="w-16 h-16 rounded-2xl p-2 flex items-center justify-center shrink-0 border border-white/10"
                                                    style={{
                                                        background: `radial-gradient(closest-side, color-mix(in srgb, ${clubAccent} 32%, transparent), rgba(6,10,20,0.85))`,
                                                    }}
                                                >
                                                    <TeamLogo
                                                        team={team || { name: save.teamName, logo: save.teamLogo }}
                                                        className="w-full h-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.75)]"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold italic uppercase tracking-wide text-white truncate leading-none">
                                                        {save.teamName}
                                                    </h2>
                                                    <p className="text-xs font-semibold text-[var(--apex-text-secondary)] mt-1 truncate">
                                                        Pres. {save.managerName || 'Sin registro'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* 3-Column Telemetry Strip (no dots, no icons) */}
                                            <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-black/30 border border-white/[0.06]">
                                                <div>
                                                    <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--apex-text-muted)]">
                                                        Temporada
                                                    </span>
                                                    <span className="font-display tabular text-base font-extrabold text-white">
                                                        {save.season} · Sem {save.currentWeek}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--apex-text-muted)]">
                                                        Posición
                                                    </span>
                                                    <span className="font-display tabular text-base font-extrabold text-[var(--apex-brand)]">
                                                        {save.leaguePosition ? `${save.leaguePosition}º Puesto` : '—'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--apex-text-muted)]">
                                                        Presupuesto
                                                    </span>
                                                    <span className="font-display tabular text-base font-extrabold text-[var(--apex-green)]">
                                                        {save.balance != null ? formatCurrencyShort(save.balance) : '—'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions Row */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => onLoadGame(save.id, false)}
                                                    className={
                                                        isPrimary
                                                            ? 'apex-btn-gold apex-shine flex-1 !py-3 !text-xs !justify-between !px-4'
                                                            : 'apex-btn-brand flex-1 !py-3 !text-xs !justify-between !px-4'
                                                    }
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Play className="w-3.5 h-3.5 fill-current" />
                                                        <span>Continuar Carrera</span>
                                                    </span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleExport(e, save.id)}
                                                    title="Exportar respaldo (.apexsave)"
                                                    aria-label="Exportar partida"
                                                    className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-colors border border-white/10 cursor-pointer shrink-0"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            kind: 'local',
                                                            id: save.id,
                                                            label: save.teamName,
                                                        })
                                                    }
                                                    title="Eliminar partida"
                                                    aria-label="Eliminar partida"
                                                    className="p-3 rounded-xl bg-[var(--apex-red)]/10 hover:bg-[var(--apex-red)]/25 text-[#FF7A9A] transition-colors border border-[var(--apex-red)]/25 cursor-pointer shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.article>
                                );
                            })
                        )
                    ) : /* Cloud Tab */ !user ? (
                        <div className="apex-card p-8 sm:p-10 text-center space-y-5">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[var(--apex-gold)]">
                                    Sincronización Oficial
                                </p>
                                <h2 className="font-display text-2xl font-extrabold italic uppercase text-white">
                                    Accede a Tus Partidas en la Nube
                                </h2>
                                <p className="text-xs text-[var(--apex-text-secondary)] max-w-sm mx-auto leading-relaxed">
                                    Conecta tu cuenta de Google para respaldar tus carreras y retomarlas desde cualquier dispositivo.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAuthModalOpen(true)}
                                className="apex-gate-google !animate-none max-w-xs mx-auto"
                            >
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                <span>Conectar con Google</span>
                            </button>
                        </div>
                    ) : cloudSaves.length === 0 ? (
                        <div className="apex-card p-8 sm:p-10 text-center space-y-2">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[var(--apex-gold)]">
                                Nube Sincronizada
                            </p>
                            <h2 className="font-display text-2xl font-extrabold italic uppercase text-white">
                                Sin Carreras en la Nube
                            </h2>
                            <p className="text-xs text-[var(--apex-text-secondary)] max-w-sm mx-auto leading-relaxed">
                                Al guardar tu partida con la sesión iniciada, aparecerá automáticamente disponible aquí.
                            </p>
                        </div>
                    ) : (
                        cloudSaves.map((save, idx) => {
                            const team = getTeamDetails(save.teamId);
                            const clubAccent = resolveClubAccent(team?.primaryColor);
                            return (
                                <motion.article
                                    key={save.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.28, delay: Math.min(idx * 0.05, 0.25) }}
                                    className="relative overflow-hidden rounded-2xl border border-[var(--apex-gold)]/25 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.85)]"
                                    style={{
                                        background: `radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, ${clubAccent} 22%, transparent), transparent 58%), linear-gradient(165deg, rgba(19, 28, 54, 0.94), rgba(8, 12, 24, 0.97))`,
                                    }}
                                >
                                    <div
                                        aria-hidden
                                        className="h-[2px] w-full"
                                        style={{
                                            background: `linear-gradient(90deg, var(--apex-gold), ${clubAccent}, transparent)`,
                                        }}
                                    />
                                    <div className="p-4 sm:p-5 space-y-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/40 text-[var(--apex-gold-light)]">
                                                Nube
                                            </span>
                                            <span className="text-[10px] font-semibold text-[var(--apex-text-muted)] tabular">
                                                {new Date(save.updatedAt).toLocaleString('es-ES', {
                                                    dateStyle: 'short',
                                                    timeStyle: 'short',
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 min-w-0">
                                            <div
                                                className="w-16 h-16 rounded-2xl p-2 flex items-center justify-center shrink-0 border border-white/10"
                                                style={{
                                                    background: `radial-gradient(closest-side, color-mix(in srgb, ${clubAccent} 32%, transparent), rgba(6,10,20,0.85))`,
                                                }}
                                            >
                                                <TeamLogo
                                                    team={team || { name: save.teamName }}
                                                    className="w-full h-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.75)]"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="font-display text-2xl sm:text-3xl font-extrabold italic uppercase tracking-wide text-white truncate leading-none">
                                                    {save.teamName}
                                                </h2>
                                                <p className="text-xs font-semibold text-[var(--apex-text-secondary)] mt-1 truncate">
                                                    Temp. {save.season} · {save.saveName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onLoadGame(save.slotId, true)}
                                                className="apex-btn-gold apex-shine flex-1 !py-3 !text-xs !justify-between !px-4"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>Descargar y Jugar</span>
                                                </span>
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteTarget({
                                                        kind: 'cloud',
                                                        id: save.slotId,
                                                        label: save.teamName,
                                                    })
                                                }
                                                title="Eliminar de la nube"
                                                aria-label="Eliminar partida de la nube"
                                                className="p-3 rounded-xl bg-[var(--apex-red)]/10 hover:bg-[var(--apex-red)]/25 text-[#FF7A9A] transition-colors border border-[var(--apex-red)]/25 cursor-pointer shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.article>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
};
