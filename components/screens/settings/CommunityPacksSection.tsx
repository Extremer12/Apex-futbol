import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Search, X, SlidersHorizontal, ChevronRight, Download, Check,
    Upload, FolderArchive, Link2, ArrowUp, ArrowDown, Trash2,
    RotateCcw, AlertCircle, CheckCircle2, ArrowLeft, Layers, SearchX,
    Flag, ChevronDown, ChevronUp, ArchiveRestore
} from 'lucide-react';
import { PackCatalog } from '../../../services/resources/PackCatalog';
import { PackManager } from '../../../services/resources/PackManager';
import { ResourceCache } from '../../../services/resources/ResourceCache';
import { ModerationService } from '../../../services/resources/ModerationService';
import { customPacksService } from '../../../services/customPacks/packService';
import {
    PackCatalogItem,
    InstalledPack,
    PackCategory,
    PackRegion
} from '../../../services/resources/ResourceTypes';
import { BottomSheet, StatCell, EmptyState } from '../transfers/TransferUI';
import { PackArtwork, PACK_ACCENTS, getPackAccent, getPackCategoryLabel } from '../packs/PackUI';

type ScreenTab = 'EXPLORE' | 'INSTALLED' | 'IMPORT';
type CategoryFilter = 'all' | 'team-logos' | 'league-logos' | 'player-faces' | 'trophies' | 'flags';
type RegionFilter = 'ALL' | PackRegion;
type StatusFilter = 'ALL' | 'NOT_INSTALLED' | 'INSTALLED';
type SortOption = 'featured' | 'assets' | 'lightest' | 'rating' | 'newest';

interface CommunityPacksSectionProps {
    onBack?: () => void;
    embedded?: boolean;
}

const CATEGORY_PILLS: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'team-logos', label: 'Escudos' },
    { id: 'league-logos', label: 'Ligas y Copas' },
    { id: 'player-faces', label: 'Rostros' },
    { id: 'trophies', label: 'Trofeos' },
    { id: 'flags', label: 'Banderas' },
];

const REGION_OPTIONS: { id: RegionFilter; label: string }[] = [
    { id: 'ALL', label: 'Todas' },
    { id: 'AMERICA', label: 'América' },
    { id: 'EUROPA', label: 'Europa' },
    { id: 'GLOBAL', label: 'Global' },
];

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'NOT_INSTALLED', label: 'Disponibles' },
    { id: 'INSTALLED', label: 'Instalados' },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
    { id: 'featured', label: 'Recomendados' },
    { id: 'assets', label: 'Más recursos' },
    { id: 'lightest', label: 'Más livianos' },
    { id: 'rating', label: 'Mejor valorados' },
    { id: 'newest', label: 'Más recientes' },
];

export const CommunityPacksSection: React.FC<CommunityPacksSectionProps> = ({ onBack, embedded }) => {
    const [activeTab, setActiveTab] = useState<ScreenTab>('EXPLORE');

    // Catalog filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [regionFilter, setRegionFilter] = useState<RegionFilter>('ALL');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [sortBy, setSortBy] = useState<SortOption>('featured');
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Installed state & storage footprint
    const [installedPacks, setInstalledPacks] = useState<InstalledPack[]>(() => PackManager.getInstalledPacks());
    const [storageStats, setStorageStats] = useState<{ assetCount: number; totalBytes: number }>({ assetCount: 0, totalBytes: 0 });

    // Download / Import progress with real AbortController cancellation
    const abortControllerRef = useRef<AbortController | null>(null);
    const [busyState, setBusyState] = useState<{
        active: boolean;
        label: string;
        percent: number;
        packId?: string;
    }>({ active: false, label: '', percent: 0 });

    // Modals / Sheets
    const [detailPack, setDetailPack] = useState<PackCatalogItem | null>(null);
    const [reportMode, setReportMode] = useState(false);
    const [reportReason, setReportReason] = useState('Derechos de imagen / DMCA');
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        message: string;
        confirmLabel: string;
        destructive?: boolean;
        onConfirm: () => Promise<void> | void;
    } | null>(null);

    // Import tab state
    const zipInputRef = useRef<HTMLInputElement | null>(null);
    const [remoteUrl, setRemoteUrl] = useState('');
    const [showFormatGuide, setShowFormatGuide] = useState(false);

    // Feedback toast/banner
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const refreshState = () => {
        setInstalledPacks(PackManager.getInstalledPacks());
        ResourceCache.getStorageStats().then(setStorageStats).catch(() => {});
    };

    useEffect(() => {
        refreshState();
        const unsub = PackManager.subscribe(() => refreshState());
        return () => {
            unsub();
            abortControllerRef.current?.abort();
        };
    }, []);

    // All catalog items & totals
    const allCatalogItems = useMemo(() => PackCatalog.getCatalog(), []);
    const catalogTotals = useMemo(() => PackCatalog.getTotals(), []);

    const installedById = useMemo(
        () => new Map<string, InstalledPack>(installedPacks.map(p => [p.packId, p])),
        [installedPacks]
    );

    const enabledCount = useMemo(
        () => installedPacks.filter(p => p.enabled).length,
        [installedPacks]
    );

    const totalEnabledAssets = useMemo(
        () => installedPacks.filter(p => p.enabled).reduce((sum, p) => sum + (p.assetCount || 0), 0),
        [installedPacks]
    );

    // Remaining catalog packs for "Descargar todo"
    const pendingCatalogPacks = useMemo(() => {
        return allCatalogItems.filter(item => {
            const inst = installedById.get(item.id);
            return !inst || !inst.enabled || PackManager.hasUpdate(inst, item);
        });
    }, [allCatalogItems, installedById]);

    const pendingBytesFormatted = useMemo(() => {
        const bytes = pendingCatalogPacks.reduce((s, p) => s + p.sizeBytes, 0);
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }, [pendingCatalogPacks]);

    // Filtered catalog results + match hints
    const filteredEntries = useMemo(() => {
        const items = PackCatalog.getCatalog({
            category: categoryFilter,
            region: regionFilter,
            query: searchQuery,
            sortBy,
        });

        return items
            .filter(item => {
                const inst = installedById.get(item.id);
                if (statusFilter === 'INSTALLED') return Boolean(inst);
                if (statusFilter === 'NOT_INSTALLED') return !inst;
                return true;
            })
            .map(item => ({
                item,
                matchHint: searchQuery.trim() ? PackCatalog.findMatchReason(item, searchQuery) : null,
            }));
    }, [categoryFilter, regionFilter, searchQuery, sortBy, statusFilter, installedById]);

    const clubAndCompEntries = useMemo(
        () => filteredEntries.filter(e => e.item.category === 'team-logos' || e.item.category === 'league-logos' || e.item.category === 'competition-logos'),
        [filteredEntries]
    );

    const extraVisualEntries = useMemo(
        () => filteredEntries.filter(e => e.item.category !== 'team-logos' && e.item.category !== 'league-logos' && e.item.category !== 'competition-logos'),
        [filteredEntries]
    );

    const activeFilterCount =
        (regionFilter !== 'ALL' ? 1 : 0) +
        (statusFilter !== 'ALL' ? 1 : 0) +
        (sortBy !== 'featured' ? 1 : 0);

    const resetFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setRegionFilter('ALL');
        setStatusFilter('ALL');
        setSortBy('featured');
    };

    const startOperation = () => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        return controller;
    };

    const handleCancelOperation = () => {
        abortControllerRef.current?.abort();
        setBusyState({ active: false, label: '', percent: 0 });
        setFeedback({ type: 'error', message: 'Operación cancelada.' });
    };

    const handleInstallSingle = async (item: PackCatalogItem) => {
        if (busyState.active) return;
        const controller = startOperation();
        setFeedback(null);
        setBusyState({ active: true, label: `Activando ${item.name}…`, percent: 10, packId: item.id });

        try {
            const existing = installedById.get(item.id);
            if (existing && !existing.enabled && !PackManager.hasUpdate(existing, item)) {
                PackManager.setPackEnabled(existing.packId, true);
            } else {
                await PackManager.installCatalogPack(item, {
                    signal: controller.signal,
                    onProgress: (pct, text) => {
                        setBusyState({ active: true, label: text, percent: pct, packId: item.id });
                    },
                });
            }
            setFeedback({ type: 'success', message: `${item.name} activado correctamente.` });
            refreshState();
        } catch (err: any) {
            if (!controller.signal.aborted) {
                setFeedback({ type: 'error', message: err?.message || 'Error al instalar el pack.' });
            }
        } finally {
            setBusyState({ active: false, label: '', percent: 0 });
        }
    };

    const handleDownloadAll = async () => {
        if (busyState.active || pendingCatalogPacks.length === 0) return;
        const controller = startOperation();
        setFeedback(null);
        setBusyState({ active: true, label: 'Preparando descarga completa…', percent: 5 });

        try {
            const result = await PackManager.installAllCatalogPacks(allCatalogItems, {
                signal: controller.signal,
                onProgress: (pct, currentName, done, total) => {
                    const label = total > 0 ? `Instalando ${currentName} (${done + 1}/${total})…` : currentName;
                    setBusyState({ active: true, label, percent: Math.max(8, pct) });
                },
            });

            if (result.errors.length > 0) {
                setFeedback({
                    type: 'error',
                    message: `Se activaron ${result.installed} packs con ${result.errors.length} aviso(s).`,
                });
            } else {
                setFeedback({
                    type: 'success',
                    message: `Colección visual activada (${result.installed} packs instalados).`,
                });
            }
            refreshState();
        } catch (err: any) {
            if (!controller.signal.aborted) {
                setFeedback({ type: 'error', message: err?.message || 'No se pudo completar la instalación.' });
            }
        } finally {
            setBusyState({ active: false, label: '', percent: 0 });
        }
    };

    const handleToggleEnabled = (pack: InstalledPack) => {
        const next = !pack.enabled;
        PackManager.setPackEnabled(pack.packId, next);
        setFeedback({
            type: 'success',
            message: `${pack.name} ${next ? 'activado' : 'pausado'}.`,
        });
        refreshState();
    };

    const handlePriorityStep = (pack: InstalledPack, delta: number) => {
        const next = Math.max(1, Math.min(100, pack.priority + delta));
        PackManager.setPackPriority(pack.packId, next);
        refreshState();
    };

    const handleRequestUninstall = (pack: InstalledPack) => {
        setConfirmAction({
            title: 'Desinstalar pack',
            message: `¿Quitar "${pack.name}"? Los gráficos cubiertos volverán a los escudos o siluetas vectoriales base.`,
            confirmLabel: 'Desinstalar',
            destructive: true,
            onConfirm: async () => {
                await PackManager.uninstallPack(pack.packId);
                setDetailPack(null);
                setFeedback({ type: 'success', message: `${pack.name} desinstalado.` });
                refreshState();
            },
        });
    };

    const handleRequestResetAll = () => {
        setConfirmAction({
            title: 'Restablecer a base vectorial',
            message: 'Se desinstalarán todos los packs activos y se vaciará la caché local en IndexedDB. El juego seguirá funcionando con sus gráficos vectoriales base.',
            confirmLabel: 'Restablecer todo',
            destructive: true,
            onConfirm: async () => {
                await PackManager.clearAllPacks();
                await customPacksService.clearAllPacks();
                setFeedback({ type: 'success', message: 'Base vectorial restablecida.' });
                refreshState();
            },
        });
    };

    const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || busyState.active) return;

        const controller = startOperation();
        setFeedback(null);
        setBusyState({ active: true, label: `Leyendo ${file.name}…`, percent: 8 });

        try {
            const installed = await PackManager.installZipFile(file, {
                name: file.name,
                signal: controller.signal,
                onProgress: (pct, status) => setBusyState({ active: true, label: status, percent: pct }),
            });
            setFeedback({ type: 'success', message: `Pack "${installed.name}" importado (${installed.assetCount} recursos).` });
            setActiveTab('INSTALLED');
            refreshState();
        } catch (err: any) {
            if (!controller.signal.aborted) {
                setFeedback({ type: 'error', message: err?.message || 'Error al leer el archivo .ZIP.' });
            }
        } finally {
            setBusyState({ active: false, label: '', percent: 0 });
        }
    };

    const handleUrlImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!remoteUrl.trim() || busyState.active) return;

        const controller = startOperation();
        setFeedback(null);
        setBusyState({ active: true, label: 'Conectando con enlace HTTPS…', percent: 10 });

        try {
            const installed = await PackManager.installFromHttpsUrl(remoteUrl, {
                signal: controller.signal,
                onProgress: (pct, status) => setBusyState({ active: true, label: status, percent: pct }),
            });
            setRemoteUrl('');
            setFeedback({ type: 'success', message: `Pack "${installed.name}" importado correctamente.` });
            setActiveTab('INSTALLED');
            refreshState();
        } catch (err: any) {
            if (!controller.signal.aborted) {
                setFeedback({ type: 'error', message: err?.message || 'No se pudo importar desde la URL.' });
            }
        } finally {
            setBusyState({ active: false, label: '', percent: 0 });
        }
    };

    const handleExportBackup = async () => {
        setFeedback(null);
        try {
            const blob = await PackManager.exportLocalAssetsZip();
            if (!blob) {
                setFeedback({ type: 'error', message: 'No hay imágenes locales guardadas en caché para exportar.' });
                return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `apex-visual-pack-${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setFeedback({ type: 'success', message: 'Respaldo .ZIP generado correctamente.' });
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.message || 'No se pudo exportar el respaldo.' });
        }
    };

    const handleSubmitReport = () => {
        if (!detailPack) return;
        ModerationService.reportContent(detailPack.id, reportReason, 'user_local');
        setReportMode(false);
        setDetailPack(null);
        setFeedback({ type: 'success', message: `Reporte registrado para "${detailPack.name}".` });
    };

    const renderCatalogGroup = (
        title: string,
        entries: { item: PackCatalogItem; matchHint: string | null }[]
    ) => {
        if (entries.length === 0) return null;
        return (
            <div className="apex-card overflow-hidden">
                <div className="px-3.5 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-black text-white tracking-tight">{title}</span>
                    <span className="text-[10px] font-semibold text-slate-500">
                        {entries.length} {entries.length === 1 ? 'pack' : 'packs'}
                    </span>
                </div>

                <ul className="divide-y divide-white/5">
                    {entries.map(({ item, matchHint }) => {
                        const accent = getPackAccent(item.accentColor, item.category);
                        const inst = installedById.get(item.id);
                        const isEnabled = Boolean(inst?.enabled);
                        const hasUpdate = inst ? PackManager.hasUpdate(inst, item) : false;
                        const isItemBusy = busyState.active && busyState.packId === item.id;

                        return (
                            <li key={item.id}>
                                <div
                                    onClick={() => {
                                        setReportMode(false);
                                        setDetailPack(item);
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setReportMode(false);
                                            setDetailPack(item);
                                        }
                                    }}
                                    className={`relative w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors cursor-pointer ${
                                        isEnabled ? 'bg-emerald-500/[0.04]' : 'hover:bg-white/[0.03] active:bg-white/[0.06]'
                                    }`}
                                >
                                    <span className={`w-1 h-9 rounded-full shrink-0 ${accent.bar}`} />
                                    <PackArtwork packId={item.id} category={item.category} accent={accent} />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-bold text-white truncate">{item.name}</p>
                                            <span className={`hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${accent.badge}`}>
                                                {getPackCategoryLabel(item.category)}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                            {matchHint ? (
                                                <span className="text-[var(--apex-gold)] font-semibold">
                                                    Incluye: {matchHint}
                                                </span>
                                            ) : (
                                                <span>
                                                    {item.assetCount.toLocaleString()} recursos · {item.sizeFormatted}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {isItemBusy ? (
                                        <span className="px-2.5 py-1.5 rounded-xl bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] text-[11px] font-black shrink-0">
                                            {busyState.percent}%
                                        </span>
                                    ) : hasUpdate ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleInstallSingle(item);
                                            }}
                                            disabled={busyState.active}
                                            className="h-8 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black shrink-0 disabled:opacity-50"
                                        >
                                            Actualizar
                                        </button>
                                    ) : isEnabled ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (inst) handleToggleEnabled(inst);
                                            }}
                                            className="h-8 px-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 shrink-0 hover:bg-emerald-500/25"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Activo</span>
                                        </button>
                                    ) : inst ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleEnabled(inst);
                                            }}
                                            className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-bold shrink-0"
                                        >
                                            Activar
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleInstallSingle(item);
                                            }}
                                            disabled={busyState.active}
                                            className="h-8 px-3 rounded-xl bg-white/10 hover:bg-[var(--apex-gold)] hover:text-slate-950 text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Instalar</span>
                                        </button>
                                    )}

                                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    const detailInstalled = detailPack ? installedById.get(detailPack.id) : undefined;
    const detailAccent = detailPack ? getPackAccent(detailPack.accentColor, detailPack.category) : PACK_ACCENTS.amber;

    return (
        <div className={`${embedded ? 'space-y-3 sm:space-y-4' : 'p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4 pb-24'} animate-fade-in max-w-5xl mx-auto w-full`}>
            {/* 1. HEADER */}
            <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            aria-label="Volver"
                            className="w-10 h-10 rounded-2xl bg-[#0D1220] border border-white/10 hover:border-[var(--apex-gold)]/50 flex items-center justify-center text-white shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4 text-[var(--apex-gold)]" />
                        </button>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                            Packs Visuales
                        </h1>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 truncate">
                            {enabledCount > 0
                                ? `${enabledCount} ${enabledCount === 1 ? 'pack activo' : 'packs activos'} · ${totalEnabledAssets.toLocaleString()} recursos`
                                : 'Base vectorial · Escudos y siluetas propias'}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'INSTALLED' ? 'EXPLORE' : 'INSTALLED')}
                    className="flex items-center gap-2.5 pl-2.5 pr-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 hover:border-[var(--apex-gold)]/40 text-left shrink-0"
                >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${enabledCount > 0 ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">
                            {activeTab === 'INSTALLED' ? 'Explorar' : 'Activos'}
                        </span>
                        <span className="text-xs font-black text-white leading-none block">
                            {enabledCount}/{allCatalogItems.length}
                        </span>
                    </div>
                </button>
            </header>

            {/* 2. STICKY TABS */}
            <nav className="sticky top-0 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-1.5 bg-[var(--apex-darker,#070A13)]/95 backdrop-blur">
                <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setActiveTab('EXPLORE')}
                        className={`h-10 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center ${
                            activeTab === 'EXPLORE' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Explorar
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('INSTALLED')}
                        className={`h-10 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
                            activeTab === 'INSTALLED' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>Instalados</span>
                        {installedPacks.length > 0 && (
                            <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
                                activeTab === 'INSTALLED' ? 'bg-slate-950 text-[var(--apex-gold)]' : 'bg-white/15 text-white'
                            }`}>
                                {installedPacks.length}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('IMPORT')}
                        className={`h-10 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center ${
                            activeTab === 'IMPORT' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Importar
                    </button>
                </div>
            </nav>

            {/* INLINE FEEDBACK BANNER */}
            {feedback && (
                <div className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 animate-fade-in ${
                    feedback.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                    <div className="flex items-center gap-2 min-w-0">
                        {feedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        )}
                        <span className="truncate">{feedback.message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFeedback(null)}
                        aria-label="Cerrar aviso"
                        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-white shrink-0"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* ACTIVE PROGRESS CARD (with real AbortController Cancel) */}
            {busyState.active && (
                <div className="apex-card relative overflow-hidden p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/15 via-transparent to-transparent border-[var(--apex-gold)]/40">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--apex-gold)]" />
                    <div className="pl-2 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white truncate">{busyState.label}</span>
                            <span className="text-xs font-black text-[var(--apex-gold)] shrink-0">{busyState.percent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-[var(--apex-gold)] transition-all duration-200"
                                style={{ width: `${busyState.percent}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Almacenamiento offline en dispositivo</span>
                            <button
                                type="button"
                                onClick={handleCancelOperation}
                                className="text-rose-400 hover:text-rose-300 font-bold"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 1: EXPLORAR */}
            {activeTab === 'EXPLORE' && (
                <div className="space-y-3">
                    {/* Hero Card: Descargar todo */}
                    <div className={`apex-card relative overflow-hidden p-3.5 sm:p-4 bg-gradient-to-r ${
                        pendingCatalogPacks.length === 0
                            ? 'from-emerald-500/15 via-transparent to-transparent border-emerald-500/30'
                            : 'from-amber-500/15 via-transparent to-transparent'
                    }`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            pendingCatalogPacks.length === 0 ? 'bg-emerald-400' : 'bg-[var(--apex-gold)]'
                        }`} />
                        <div className="flex items-center justify-between gap-3 pl-1.5">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                                        {pendingCatalogPacks.length === 0 ? 'Colección visual completa' : 'Descargar colección completa'}
                                    </h2>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        pendingCatalogPacks.length === 0
                                            ? 'bg-emerald-500/15 text-emerald-300'
                                            : 'bg-amber-500/15 text-amber-300'
                                    }`}>
                                        {pendingCatalogPacks.length === 0
                                            ? 'Todo activo'
                                            : `${pendingCatalogPacks.length} packs · ${pendingBytesFormatted}`}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                    {catalogTotals.packCount} packs comunitarios · {catalogTotals.totalAssets.toLocaleString()} escudos, ligas, rostros y trofeos
                                </p>
                            </div>

                            {pendingCatalogPacks.length > 0 ? (
                                <button
                                    type="button"
                                    onClick={handleDownloadAll}
                                    disabled={busyState.active}
                                    className="h-10 px-4 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-xs font-black shrink-0 flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Descargar todo</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('INSTALLED')}
                                    className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold shrink-0"
                                >
                                    Gestionar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search + Filter Button */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            <input
                                type="search"
                                inputMode="search"
                                placeholder="Pack, club, liga, país o jugador…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-11 pl-10 pr-9 bg-[#0D1220] border border-white/10 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]/60"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Limpiar búsqueda"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setFiltersOpen(true)}
                            className={`relative h-11 px-3.5 rounded-2xl border flex items-center gap-2 text-sm font-bold shrink-0 ${
                                activeFilterCount
                                    ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]/40 text-[var(--apex-gold)]'
                                    : 'bg-[#0D1220] border-white/10 text-slate-300'
                            }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="hidden sm:inline">Filtros</span>
                            {activeFilterCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-[var(--apex-gold)] text-black text-[10px] font-black flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Quick Category Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
                        {CATEGORY_PILLS.map(pill => (
                            <button
                                key={pill.id}
                                type="button"
                                onClick={() => setCategoryFilter(pill.id)}
                                className={`h-8 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                                    categoryFilter === pill.id
                                        ? 'bg-white text-slate-950'
                                        : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                            >
                                {pill.label}
                            </button>
                        ))}
                    </div>

                    {/* Result Summary */}
                    <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-semibold">
                        <span>{filteredEntries.length} packs disponibles</span>
                        {(activeFilterCount > 0 || categoryFilter !== 'all' || searchQuery) ? (
                            <button type="button" onClick={resetFilters} className="text-[var(--apex-gold)] font-bold">
                                Limpiar filtros
                            </button>
                        ) : (
                            <span>{SORT_OPTIONS.find(s => s.id === sortBy)?.label}</span>
                        )}
                    </div>

                    {/* Catalog Groups */}
                    {filteredEntries.length === 0 ? (
                        <div className="apex-card">
                            <EmptyState
                                icon={<SearchX className="w-6 h-6" />}
                                title="Sin resultados"
                                text="Prueba buscando otro club, país, competición o categoría."
                                action={
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
                                    >
                                        Limpiar filtros
                                    </button>
                                }
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                            {renderCatalogGroup('Clubes y Competiciones', clubAndCompEntries)}
                            {renderCatalogGroup('Rostros, Trofeos y Complementos', extraVisualEntries)}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: INSTALADOS */}
            {activeTab === 'INSTALLED' && (
                <div className="space-y-3">
                    {/* Storage & Reset Summary */}
                    <div className="apex-card p-3.5 sm:p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="text-sm font-black text-white">Orden y activación</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                {installedPacks.length === 0
                                    ? 'Sin packs locales activos'
                                    : `${enabledCount} de ${installedPacks.length} activos · ${(storageStats.totalBytes / (1024 * 1024)).toFixed(1)} MB en caché`}
                            </p>
                        </div>

                        {installedPacks.length > 0 && (
                            <button
                                type="button"
                                onClick={handleRequestResetAll}
                                className="h-9 px-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 shrink-0"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restablecer</span>
                            </button>
                        )}
                    </div>

                    {installedPacks.length === 0 ? (
                        <div className="apex-card">
                            <EmptyState
                                icon={<Layers className="w-6 h-6" />}
                                title="Base vectorial activa"
                                text="El juego está usando sus escudos y siluetas propias. Puedes instalar packs en Explorar o importar un .ZIP local."
                                action={
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('EXPLORE')}
                                        className="px-4 py-2.5 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-xs font-black"
                                    >
                                        Explorar packs
                                    </button>
                                }
                            />
                        </div>
                    ) : (
                        <ul className="apex-card divide-y divide-white/5 overflow-hidden">
                            {installedPacks.map((pack, index) => {
                                const catalogMeta = allCatalogItems.find(c => c.id === pack.packId);
                                const accent = getPackAccent(catalogMeta?.accentColor, pack.category);

                                return (
                                    <li
                                        key={pack.packId}
                                        className={`px-3.5 py-3 flex items-center gap-3 transition-opacity ${
                                            pack.enabled ? '' : 'opacity-65'
                                        }`}
                                    >
                                        <span className={`w-1 h-9 rounded-full shrink-0 ${accent.bar}`} />
                                        <PackArtwork packId={pack.packId} category={pack.category} accent={accent} size="sm" />

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-bold text-white truncate">{pack.name}</p>
                                                <span className="text-[10px] text-slate-500 font-semibold shrink-0">v{pack.version}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                                {pack.assetCount.toLocaleString()} recursos · Prioridad #{index + 1} ({pack.priority})
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handlePriorityStep(pack, 5)}
                                                aria-label="Subir prioridad"
                                                title="Subir prioridad"
                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center"
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handlePriorityStep(pack, -5)}
                                                aria-label="Bajar prioridad"
                                                title="Bajar prioridad"
                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center"
                                            >
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleEnabled(pack)}
                                                className={`h-8 px-2.5 rounded-lg text-[11px] font-bold border transition-colors ${
                                                    pack.enabled
                                                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {pack.enabled ? 'Activo' : 'Pausado'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRequestUninstall(pack)}
                                                aria-label="Desinstalar pack"
                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {/* TAB 3: IMPORTAR */}
            {activeTab === 'IMPORT' && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Local ZIP import */}
                        <div className="apex-card p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                                    <FolderArchive className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white">Archivo .ZIP local</h3>
                                    <p className="text-[11px] text-slate-400">
                                        Escudos, caras o copas desde tu dispositivo. Uso 100% offline.
                                    </p>
                                </div>
                            </div>

                            <input
                                ref={zipInputRef}
                                type="file"
                                accept=".zip"
                                onChange={handleZipUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => zipInputRef.current?.click()}
                                disabled={busyState.active}
                                className="w-full h-11 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-xs font-black flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                <Upload className="w-4 h-4" />
                                <span>Seleccionar .ZIP</span>
                            </button>
                        </div>

                        {/* Remote HTTPS URL import */}
                        <form onSubmit={handleUrlImport} className="apex-card p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 flex items-center justify-center shrink-0">
                                    <Link2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white">Desde enlace HTTPS</h3>
                                    <p className="text-[11px] text-slate-400">
                                        Carga un archivo manifest.json o .zip compartido por la comunidad.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="url"
                                    placeholder="https://.../manifest.json"
                                    value={remoteUrl}
                                    onChange={e => setRemoteUrl(e.target.value)}
                                    required
                                    className="flex-1 h-11 px-3.5 bg-[#0D1220] border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]/60"
                                />
                                <button
                                    type="submit"
                                    disabled={busyState.active || !remoteUrl.trim()}
                                    className="h-11 px-4 rounded-xl bg-white/10 hover:bg-[var(--apex-gold)] hover:text-slate-950 text-white text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
                                >
                                    Cargar
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Export local cache */}
                    <div className="apex-card p-3.5 sm:p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center shrink-0">
                                <ArchiveRestore className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">Respaldar packs locales</p>
                                <p className="text-[11px] text-slate-400 truncate">
                                    {storageStats.assetCount > 0
                                        ? `${storageStats.assetCount} imágenes locales listas para exportar`
                                        : 'Importa un .ZIP para poder generar un respaldo'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleExportBackup}
                            disabled={storageStats.assetCount === 0}
                            className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold shrink-0 disabled:opacity-40"
                        >
                            Exportar .ZIP
                        </button>
                    </div>

                    {/* Collapsible Folder Guide */}
                    <div className="apex-card overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowFormatGuide(v => !v)}
                            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02]"
                        >
                            <span className="text-xs font-bold text-slate-300">Estructura de carpetas y seguridad</span>
                            {showFormatGuide ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        {showFormatGuide && (
                            <div className="px-4 pb-4 pt-1 space-y-2 border-t border-white/5 text-[11px] text-slate-400">
                                <p>
                                    Organiza las imágenes en carpetas: <code className="text-slate-200">teams/</code>,{' '}
                                    <code className="text-slate-200">competitions/</code>,{' '}
                                    <code className="text-slate-200">players/</code>,{' '}
                                    <code className="text-slate-200">trophies/</code> o{' '}
                                    <code className="text-slate-200">flags/</code> usando el nombre o ID del club/jugador (PNG, WebP, JPG o SVG).
                                </p>
                                <p>
                                    Por seguridad, los packs solo contienen archivos gráficos estáticos (sin scripts ni alteración de estadísticas del juego) y se validan antes de guardarse en el dispositivo.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* FILTERS BOTTOM SHEET */}
            <BottomSheet
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                title="Filtros"
                footer={
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="flex-1 h-11 rounded-xl bg-white/5 text-slate-300 text-sm font-bold"
                        >
                            Restablecer
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltersOpen(false)}
                            className="flex-[2] h-11 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-sm font-black"
                        >
                            Ver {filteredEntries.length} packs
                        </button>
                    </div>
                }
            >
                <div className="space-y-5">
                    <section>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Región</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {REGION_OPTIONS.map(r => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setRegionFilter(r.id)}
                                    className={`h-10 rounded-xl text-xs font-bold border ${
                                        regionFilter === r.id
                                            ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]'
                                            : 'bg-white/[0.03] border-white/5 text-slate-300'
                                    }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Estado</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {STATUS_OPTIONS.map(st => (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => setStatusFilter(st.id)}
                                    className={`h-10 rounded-xl text-xs font-bold border ${
                                        statusFilter === st.id
                                            ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]'
                                            : 'bg-white/[0.03] border-white/5 text-slate-300'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Ordenar por</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {SORT_OPTIONS.map(so => (
                                <button
                                    key={so.id}
                                    type="button"
                                    onClick={() => setSortBy(so.id)}
                                    className={`h-10 rounded-xl text-xs font-bold border ${
                                        sortBy === so.id
                                            ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]'
                                            : 'bg-white/[0.03] border-white/5 text-slate-300'
                                    }`}
                                >
                                    {so.label}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </BottomSheet>

            {/* PACK DETAIL BOTTOM SHEET */}
            <BottomSheet
                open={Boolean(detailPack)}
                onClose={() => {
                    setReportMode(false);
                    setDetailPack(null);
                }}
                title={reportMode ? 'Reportar contenido' : detailPack?.name}
                footer={
                    detailPack && (
                        reportMode ? (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setReportMode(false)}
                                    className="flex-1 h-11 rounded-xl bg-white/5 text-slate-300 text-sm font-bold"
                                >
                                    Volver
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitReport}
                                    className="flex-[2] h-11 rounded-xl bg-rose-600 text-white text-sm font-black"
                                >
                                    Enviar reporte
                                </button>
                            </div>
                        ) : detailInstalled ? (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleRequestUninstall(detailInstalled)}
                                    className="h-11 px-4 rounded-xl bg-rose-500/15 text-rose-300 text-sm font-bold"
                                >
                                    Desinstalar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleToggleEnabled(detailInstalled);
                                        setDetailPack(null);
                                    }}
                                    className="flex-1 h-11 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-sm font-black"
                                >
                                    {detailInstalled.enabled ? 'Pausar pack' : 'Activar pack'}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={async () => {
                                    const target = detailPack;
                                    setDetailPack(null);
                                    await handleInstallSingle(target);
                                }}
                                disabled={busyState.active}
                                className="w-full h-11 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                <span>Instalar pack</span>
                            </button>
                        )
                    )
                }
            >
                {detailPack && (
                    reportMode ? (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-400">
                                Indica el motivo del reporte sobre <strong className="text-white">{detailPack.name}</strong> para revisión:
                            </p>
                            <div className="space-y-2">
                                {[
                                    'Derechos de imagen / DMCA',
                                    'Imagen incorrecta o dañada',
                                    'Contenido inapropiado',
                                ].map(reason => (
                                    <button
                                        key={reason}
                                        type="button"
                                        onClick={() => setReportReason(reason)}
                                        className={`w-full h-10 px-3.5 rounded-xl text-left text-xs font-bold border ${
                                            reportReason === reason
                                                ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/50 text-[var(--apex-gold)]'
                                                : 'bg-white/[0.03] border-white/5 text-slate-300'
                                        }`}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <PackArtwork packId={detailPack.id} category={detailPack.category} accent={detailAccent} />
                                <div className="min-w-0">
                                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${detailAccent.badge}`}>
                                        {getPackCategoryLabel(detailPack.category)}
                                    </span>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Por <span className="text-white font-semibold">{detailPack.author.name}</span>
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">{detailPack.description}</p>

                            <div className="grid grid-cols-2 gap-2">
                                <StatCell label="Recursos" value={detailPack.assetCount.toLocaleString()} />
                                <StatCell label="Tamaño" value={detailPack.sizeFormatted} />
                                <StatCell
                                    label="Región"
                                    value={
                                        detailPack.region === 'AMERICA' ? 'América' :
                                        detailPack.region === 'EUROPA' ? 'Europa' : 'Global'
                                    }
                                />
                                <StatCell label="Versión" value={`v${detailPack.version}`} />
                            </div>

                            {detailPack.coverage && detailPack.coverage.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Cobertura principal
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {detailPack.coverage.map(cov => (
                                            <span key={cov} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] font-semibold text-slate-300">
                                                {cov}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setReportMode(true)}
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-300 pt-1"
                            >
                                <Flag className="w-3.5 h-3.5" />
                                <span>Reportar problema o derechos</span>
                            </button>
                        </div>
                    )
                )}
            </BottomSheet>

            {/* CONFIRMATION BOTTOM SHEET */}
            <BottomSheet
                open={Boolean(confirmAction)}
                onClose={() => setConfirmAction(null)}
                title={confirmAction?.title}
                footer={
                    confirmAction && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 h-11 rounded-xl bg-white/5 text-slate-300 text-sm font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    const cb = confirmAction.onConfirm;
                                    setConfirmAction(null);
                                    await cb();
                                }}
                                className={`flex-1 h-11 rounded-xl text-sm font-black ${
                                    confirmAction.destructive
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-[var(--apex-gold)] text-slate-950'
                                }`}
                            >
                                {confirmAction.confirmLabel}
                            </button>
                        </div>
                    )
                }
            >
                <p className="text-xs text-slate-300 leading-relaxed">{confirmAction?.message}</p>
            </BottomSheet>
        </div>
    );
};
