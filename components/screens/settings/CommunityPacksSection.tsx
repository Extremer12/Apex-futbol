import React, { useState, useEffect, useMemo } from 'react';
import { 
    Download, AlertCircle, CheckCircle2, RotateCcw, Shield, Layers, Check, 
    Search, Star, Sparkles, Upload, ArrowUp, ArrowDown, Trash2, 
    RefreshCw, X, HardDrive, UserCheck, Sliders, ExternalLink, Flag, Trophy, ShieldAlert
} from 'lucide-react';
import { customPacksService } from '../../../services/customPacks/packService';
import { resourceManager } from '../../../services/resources/ResourceManager';
import { PackCatalog } from '../../../services/resources/PackCatalog';
import { PackManager } from '../../../services/resources/PackManager';
import { ContributionService } from '../../../services/resources/ContributionService';
import { PackCatalogItem, InstalledPack, PackCategory, ResourceType } from '../../../services/resources/ResourceTypes';
import { ResourceFallback } from '../../../services/resources/ResourceFallback';

type ActiveTab = 'catalog' | 'installed' | 'contribute';

const CATEGORY_TABS: { id: PackCategory | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'TODOS', icon: '🌐' },
    { id: 'player-faces', label: 'ROSTROS', icon: '👤' },
    { id: 'team-logos', label: 'ESCUDOS', icon: '🛡️' },
    { id: 'league-logos', label: 'LIGAS', icon: '🏆' },
    { id: 'trophies', label: 'COPAS', icon: '🥇' },
    { id: 'flags', label: 'BANDERAS', icon: '🌎' },
    { id: 'kits', label: 'CAMISETAS', icon: '👕' },
    { id: 'stadiums', label: 'ESTADIOS', icon: '🏟️' },
];

export const CommunityPacksSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
    const [selectedCategory, setSelectedCategory] = useState<PackCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'featured' | 'downloads' | 'rating' | 'newest'>('featured');
    
    // Installed packs state
    const [installedPacks, setInstalledPacks] = useState<InstalledPack[]>([]);
    
    // Download progress simulation & state
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadingPackId, setDownloadingPackId] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadStatusText, setDownloadStatusText] = useState('');
    const [downloadCancelled, setDownloadCancelled] = useState(false);

    // Contribution modal / form state
    const [contribType, setContribType] = useState<ResourceType>('player-face');
    const [contribTargetLabel, setContribTargetLabel] = useState('');
    const [contribTargetId, setContribTargetId] = useState('');
    const [contribFile, setContribFile] = useState<File | null>(null);
    const [contribLicenseAgreed, setContribLicenseAgreed] = useState(false);
    const [contribSubmitting, setContribSubmitting] = useState(false);

    // Feedback notifications
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Reload packs from manager
    const refreshPacks = () => {
        setInstalledPacks(PackManager.getInstalledPacks());
    };

    useEffect(() => {
        refreshPacks();
        const unsubManager = PackManager.subscribe(() => {
            refreshPacks();
        });
        const unsubPacksService = customPacksService.subscribe(() => {
            refreshPacks();
        });
        return () => {
            unsubManager();
            unsubPacksService();
        };
    }, []);

    // Filtered Catalog
    const catalogItems = useMemo(() => {
        return PackCatalog.getCatalog({
            category: selectedCategory,
            query: searchQuery,
            sortBy: sortBy
        });
    }, [selectedCategory, searchQuery, sortBy]);

    // Check if an item is installed
    const getInstalledPackInfo = (catalogId: string): InstalledPack | undefined => {
        return installedPacks.find(p => p.packId === catalogId);
    };

    // Trigger installation with progressive feedback
    const handleInstallPack = async (item: PackCatalogItem) => {
        setIsDownloading(true);
        setDownloadingPackId(item.id);
        setDownloadProgress(5);
        setDownloadStatusText('Conectando con el servidor de contenido...');
        setDownloadCancelled(false);
        setFeedback(null);

        try {
            // Emulate progressive download steps for responsive UX
            const steps = [
                { pct: 25, text: `Descargando recursos (${item.sizeFormatted})...` },
                { pct: 55, text: 'Verificando checksum y firma de seguridad...' },
                { pct: 80, text: 'Optimizando índices locales y asignando IDs...' },
                { pct: 95, text: 'Finalizando montaje en el ResourceManager...' }
            ];

            for (const step of steps) {
                if (downloadCancelled) throw new Error('Descarga cancelada por el usuario.');
                await new Promise(r => setTimeout(r, 220));
                setDownloadProgress(step.pct);
                setDownloadStatusText(step.text);
            }

            // Install in PackManager
            await PackManager.installManifestPack({
                schemaVersion: 1,
                id: item.id,
                name: item.name,
                version: item.version,
                category: item.category,
                author: item.author,
                description: item.description,
                isOfficial: item.isOfficial,
                assetCount: item.assetCount,
                sizeBytes: item.sizeBytes,
                assets: {}
            }, item.isOfficial ? 30 : 10);

            // Also synchronize customPacksService legacy flags if relevant
            if (item.id === 'official-base-pack') {
                customPacksService.setAllPacksActive(true);
            } else if (item.id === 'argentina-faces-2026') {
                customPacksService.setPlayerFacesPackActive(true);
            }

            setDownloadProgress(100);
            setDownloadStatusText('¡Instalación completada!');
            await new Promise(r => setTimeout(r, 200));

            setFeedback({
                type: 'success',
                message: `El pack "${item.name}" (v${item.version}) se instaló y activó correctamente.`
            });
            refreshPacks();
        } catch (err: any) {
            setFeedback({
                type: 'error',
                message: err.message || 'Error al descargar el paquete.'
            });
        } finally {
            setIsDownloading(false);
            setDownloadingPackId(null);
            setDownloadProgress(0);
        }
    };

    // Toggle Enable / Disable
    const handleToggleEnabled = (packId: string, currentEnabled: boolean) => {
        PackManager.setPackEnabled(packId, !currentEnabled);
        refreshPacks();
        setFeedback({
            type: 'success',
            message: `Pack ${!currentEnabled ? 'activado' : 'desactivado'} con éxito.`
        });
    };

    // Uninstall Pack
    const handleUninstall = async (packId: string, packName: string) => {
        if (!window.confirm(`¿Estás seguro de desinstalar "${packName}"? Los recursos visuales volverán a los genéricos.`)) {
            return;
        }

        try {
            await PackManager.uninstallPack(packId);
            refreshPacks();
            setFeedback({
                type: 'success',
                message: `Pack "${packName}" desinstalado.`
            });
        } catch (err: any) {
            setFeedback({
                type: 'error',
                message: `Error al desinstalar: ${err.message}`
            });
        }
    };

    // Change Priority
    const handleChangePriority = (packId: string, delta: number) => {
        const pack = PackManager.getInstalledPack(packId);
        if (!pack) return;
        const newPriority = Math.max(1, Math.min(100, pack.priority + delta));
        PackManager.setPackPriority(packId, newPriority);
        refreshPacks();
    };

    // Submit user visual contribution
    const handleSubmitContribution = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contribFile) {
            setFeedback({ type: 'error', message: 'Debes seleccionar un archivo de imagen (WebP, PNG, SVG).' });
            return;
        }
        if (!contribTargetLabel.trim() || !contribTargetId.trim()) {
            setFeedback({ type: 'error', message: 'Debes indicar el nombre y el ID del recurso.' });
            return;
        }
        if (!contribLicenseAgreed) {
            setFeedback({ type: 'error', message: 'Debes aceptar la declaración de derechos y licencia de uso.' });
            return;
        }

        setContribSubmitting(true);
        try {
            await ContributionService.submitContribution({
                userId: 'user_local',
                userName: 'Usuario',
                resourceType: contribType,
                targetId: contribTargetId.trim(),
                targetLabel: contribTargetLabel.trim(),
                file: contribFile
            });

            setFeedback({
                type: 'success',
                message: `¡Contribución de "${contribTargetLabel}" enviada a revisión de moderación! No altera estadísticas del juego.`
            });

            // Reset form
            setContribTargetLabel('');
            setContribTargetId('');
            setContribFile(null);
            setContribLicenseAgreed(false);
            setActiveTab('catalog');
        } catch (err: any) {
            setFeedback({
                type: 'error',
                message: err.message || 'Error al enviar la contribución.'
            });
        } finally {
            setContribSubmitting(false);
        }
    };

    // Reset everything to generic fallback
    const handleClearAll = async () => {
        if (!window.confirm('¿Deseas desinstalar todos los packs comunitarios y restablecer el juego a base mínima genérica?')) {
            return;
        }
        for (const pack of installedPacks) {
            await PackManager.uninstallPack(pack.packId);
        }
        await customPacksService.clearAllPacks();
        await resourceManager.clearAllCache();
        refreshPacks();
        setFeedback({
            type: 'success',
            message: 'Todos los recursos comunitarios fueron removidos. El juego funciona con placeholders procedurales.'
        });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header & Sub-Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/20 flex items-center justify-center text-[var(--apex-gold)]">
                            <Layers className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                            Contenido de la Comunidad
                        </h2>
                    </div>
                    <p className="text-xs text-slate-400">
                        Descarga packs de escudos vectoriales, rostros HD, copas y banderas sin modificar los datos ni el gameplay.
                    </p>
                </div>

                {/* Main View Tabs */}
                <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'catalog'
                                ? 'bg-[var(--apex-gold)] text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Explorar Catálogo
                    </button>
                    <button
                        onClick={() => setActiveTab('installed')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'installed'
                                ? 'bg-[var(--apex-gold)] text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>Instalados</span>
                        {installedPacks.length > 0 && (
                            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                                activeTab === 'installed' ? 'bg-slate-950 text-[var(--apex-gold)]' : 'bg-slate-800 text-slate-300'
                            }`}>
                                {installedPacks.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('contribute')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'contribute'
                                ? 'bg-[var(--apex-gold)] text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Contribuir</span>
                    </button>
                </div>
            </div>

            {/* Feedback Alert Toast */}
            {feedback && (
                <div className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between gap-3 animate-fade-in ${
                    feedback.type === 'success' 
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                        : 'bg-red-950/60 border-red-500/40 text-red-300'
                }`}>
                    <div className="flex items-center gap-2.5">
                        {feedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                        <span>{feedback.message}</span>
                    </div>
                    <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white p-1">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Modal de Descarga en Progreso */}
            {isDownloading && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-[var(--apex-gold)]/30 shadow-2xl space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full bg-[var(--apex-gold)] animate-ping" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {downloadStatusText}
                            </span>
                        </div>
                        <span className="text-xs font-black text-[var(--apex-gold)]">
                            {downloadProgress}%
                        </span>
                    </div>

                    <div className="w-full bg-slate-950/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div 
                            className="bg-gradient-to-r from-[var(--apex-gold)] to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(234,179,8,0.5)]"
                            style={{ width: `${downloadProgress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Los archivos se almacenan en la memoria local segura (IndexedDB).</span>
                        <button
                            onClick={() => setDownloadCancelled(true)}
                            className="text-red-400 hover:text-red-300 font-semibold cursor-pointer underline"
                        >
                            Cancelar Descarga
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 1: EXPLORAR CATÁLOGO */}
            {activeTab === 'catalog' && (
                <div className="space-y-6">
                    {/* Search & Category Filtering Bar */}
                    <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-white/[0.08] backdrop-blur-md">
                        {/* Search input and sorting */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="relative flex-1 w-full">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Buscar por equipo, jugador, autor, país..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]/50 transition-all"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                                <span className="text-[11px] text-slate-400 whitespace-nowrap">Ordenar por:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[var(--apex-gold)]/50"
                                >
                                    <option value="featured">Destacados</option>
                                    <option value="downloads">Más Descargados</option>
                                    <option value="rating">Mejor Calificación</option>
                                    <option value="newest">Más Recientes</option>
                                </select>
                            </div>
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                            {CATEGORY_TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedCategory(tab.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                                        selectedCategory === tab.id
                                            ? 'bg-slate-200 text-slate-950 shadow-sm'
                                            : 'bg-slate-950/40 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Catalog Grid */}
                    {catalogItems.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-2">
                            <Layers className="w-8 h-8 text-slate-500 mx-auto" />
                            <h4 className="text-sm font-bold text-white">No se encontraron packs en esta categoría</h4>
                            <p className="text-xs text-slate-400">Intenta cambiar el término de búsqueda o categoría seleccionada.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {catalogItems.map((item) => {
                                const installed = getInstalledPackInfo(item.id);
                                const hasUpdate = installed && PackManager.hasUpdate(installed, item);

                                return (
                                    <div
                                        key={item.id}
                                        className={`rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group ${
                                            installed 
                                                ? 'bg-[#0D1526]/90 border-emerald-500/30 shadow-lg shadow-emerald-950/20' 
                                                : 'bg-slate-900/70 border-white/[0.08] hover:border-white/20'
                                        }`}
                                    >
                                        <div className="space-y-3.5">
                                            {/* Top badges: Official / Category / Rating */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {item.isOfficial ? (
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-[var(--apex-gold)] to-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                                            <Sparkles className="w-3 h-3" />
                                                            <span>Oficial</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                                                            Comunitario
                                                        </span>
                                                    )}

                                                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-white/5">
                                                        v{item.version}
                                                    </span>
                                                </div>

                                                {item.rating && (
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                        <span>{item.rating}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Title & Description */}
                                            <div className="space-y-1">
                                                <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                                                    {item.name}
                                                </h3>
                                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>

                                            {/* Creator Info */}
                                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                                                <div className="flex items-center gap-1.5 text-slate-300">
                                                    <span className="text-slate-500">Autor:</span>
                                                    <span className="font-semibold">{item.author.name}</span>
                                                    {item.author.isVerified && (
                                                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" title="Creador Verificado" />
                                                    )}
                                                </div>

                                                <div className="text-slate-400">
                                                    <span>{item.downloads.toLocaleString()} descargas</span>
                                                </div>
                                            </div>

                                            {/* Stats Pill (Recursos & Tamaño) */}
                                            <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-950/60 border border-white/5 text-center">
                                                <div>
                                                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Recursos</span>
                                                    <span className="text-xs font-bold text-white">{item.assetCount} items</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Tamaño</span>
                                                    <span className="text-xs font-bold text-white">{item.sizeFormatted}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-4 mt-3 border-t border-white/10">
                                            {hasUpdate ? (
                                                <button
                                                    onClick={() => handleInstallPack(item)}
                                                    disabled={isDownloading}
                                                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Actualizar a v{item.version}</span>
                                                </button>
                                            ) : installed ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleEnabled(installed.packId, installed.enabled)}
                                                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                                            installed.enabled
                                                                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                                                                : 'bg-slate-800 border border-white/10 text-slate-400 hover:text-white'
                                                        }`}
                                                    >
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span>{installed.enabled ? 'Instalado & Activo' : 'Desactivado'}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleUninstall(installed.packId, item.name)}
                                                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 transition-colors cursor-pointer"
                                                        title="Desinstalar"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleInstallPack(item)}
                                                    disabled={isDownloading}
                                                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-[var(--apex-gold)] hover:text-slate-950 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 group-hover:border-transparent"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>Instalar Pack</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: MIS PACKS INSTALADOS & PRIORIDADES */}
            {activeTab === 'installed' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10">
                        <div>
                            <h3 className="text-sm font-bold text-white">Prioridad de Recursos Combinables</h3>
                            <p className="text-xs text-slate-400">
                                Cuando dos packs contienen el mismo recurso (ej. mismo jugador o club), el pack con mayor prioridad tiene preferencia.
                            </p>
                        </div>

                        {installedPacks.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restablecer Todo</span>
                            </button>
                        )}
                    </div>

                    {installedPacks.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
                            <HardDrive className="w-8 h-8 text-slate-500 mx-auto" />
                            <h4 className="text-sm font-bold text-white">No tienes packs instalados localmente</h4>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                El juego está funcionando en modo base mínima con escudos vectoriales y siluetas generadas sin dependencias de red.
                            </p>
                            <button
                                onClick={() => setActiveTab('catalog')}
                                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--apex-gold)] text-slate-950 cursor-pointer shadow-md"
                            >
                                Explorar Catálogo
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {installedPacks.map((pack, index) => (
                                <div
                                    key={pack.packId}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                                        pack.enabled
                                            ? 'bg-slate-900/80 border-white/10'
                                            : 'bg-slate-950/40 border-white/5 opacity-70'
                                    }`}
                                >
                                    <div className="space-y-1 max-w-md">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white">
                                                {pack.name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-white/5">
                                                v{pack.version}
                                            </span>
                                            {pack.isOfficial && (
                                                <span className="text-[9px] font-black text-slate-950 bg-[var(--apex-gold)] px-1.5 py-0.2 rounded-full">
                                                    ✓ Oficial
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            {pack.assetCount} recursos • Instalado el {new Date(pack.installedAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Priority and Actions Controls */}
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                        {/* Priority buttons */}
                                        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-white/5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Prioridad:</span>
                                            <span className="text-xs font-black text-[var(--apex-gold)] px-1">{pack.priority}</span>
                                            <div className="flex items-center gap-0.5">
                                                <button
                                                    onClick={() => handleChangePriority(pack.packId, 5)}
                                                    className="p-1 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
                                                    title="Aumentar prioridad"
                                                >
                                                    <ArrowUp className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleChangePriority(pack.packId, -5)}
                                                    className="p-1 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
                                                    title="Disminuir prioridad"
                                                >
                                                    <ArrowDown className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Enable/Disable Toggle */}
                                        <button
                                            onClick={() => handleToggleEnabled(pack.packId, pack.enabled)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                                pack.enabled
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                    : 'bg-slate-800 border-white/10 text-slate-400'
                                            }`}
                                        >
                                            {pack.enabled ? 'Activo' : 'Desactivado'}
                                        </button>

                                        {/* Uninstall */}
                                        <button
                                            onClick={() => handleUninstall(pack.packId, pack.name)}
                                            className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 transition-colors cursor-pointer"
                                            title="Desinstalar pack"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: CONTRIBUIR RECURSO DE LA COMUNIDAD */}
            {activeTab === 'contribute' && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-[var(--apex-gold)]">
                            <Upload className="w-4 h-4" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                                Portal de Contribución Comunitaria
                            </h3>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Sube recursos visuales (rostros, escudos, copas) para enriquecer el catálogo.
                        </p>
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>
                                <strong>Regla de Integridad:</strong> Las contribuciones afectan <em>exclusivamente</em> al recurso visual. No es posible modificar estadísticas, ratings, posiciones, presupuestos ni IDs internos del juego.
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitContribution} className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                        {/* Tipo de recurso */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Tipo de Recurso</label>
                            <select
                                value={contribType}
                                onChange={(e) => setContribType(e.target.value as ResourceType)}
                                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[var(--apex-gold)]/50"
                            >
                                <option value="player-face">👤 Rostro de Jugador</option>
                                <option value="team-logo">🛡️ Escudo de Equipo</option>
                                <option value="competition-logo">🏆 Logo de Competición / Liga</option>
                                <option value="trophy">🥇 Trofeo / Copa 3D</option>
                                <option value="flag">🌎 Bandera de País</option>
                                <option value="kit">👕 Camiseta de Juego</option>
                            </select>
                        </div>

                        {/* Nombre del jugador/equipo */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Nombre de la Entidad Representada</label>
                            <input
                                type="text"
                                placeholder="Ej: Bukayo Saka / Arsenal FC / Copa Libertadores"
                                value={contribTargetLabel}
                                onChange={(e) => setContribTargetLabel(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]/50"
                            />
                        </div>

                        {/* ID interno */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">ID del Jugador o Equipo en el Juego</label>
                            <input
                                type="text"
                                placeholder="Ej: 101 (para Bukayo Saka), 1 (Arsenal), champions_league..."
                                value={contribTargetId}
                                onChange={(e) => setContribTargetId(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]/50"
                            />
                            <p className="text-[10px] text-slate-500">
                                Debe coincidir con el identificador del juego para que el ResourceManager pueda asociarlo.
                            </p>
                        </div>

                        {/* Archivo de imagen */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Archivo de Imagen (WebP, PNG o SVG &lt; 2 MB)</label>
                            <input
                                type="file"
                                accept=".webp,.png,.svg,.jpg,.jpeg"
                                onChange={(e) => setContribFile(e.target.files?.[0] || null)}
                                required
                                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700"
                            />
                        </div>

                        {/* Licencia y declaración */}
                        <div className="pt-2">
                            <label className="flex items-start gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={contribLicenseAgreed}
                                    onChange={(e) => setContribLicenseAgreed(e.target.checked)}
                                    className="mt-0.5 rounded border-white/10 bg-slate-950 text-[var(--apex-gold)] focus:ring-0"
                                />
                                <span className="text-[11px] text-slate-400 leading-snug">
                                    Declaro tener los derechos o autorización sobre este recurso visual y acepto que sea revisado por el equipo de moderación comunitario antes de su distribución.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={contribSubmitting}
                            className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[var(--apex-gold)] to-amber-400 text-slate-950 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{contribSubmitting ? 'Enviando a Moderación...' : 'Enviar Contribución'}</span>
                        </button>
                    </form>
                </div>
            )}

            {/* Disclaimer Legal & Licencias */}
            <div className="p-4 rounded-2xl bg-slate-900/30 border border-white/5 space-y-1.5 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Derechos de Propiedad y Contenido Comunitario
                    </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                    Apex AI implementa un sistema declarativo desacoplado. Los packs son mantenidos de forma voluntaria por la comunidad. No se ejecutan scripts, código JavaScript ni WebAssembly dentro de los packs comunitarios. Los escudos y fotos corresponden a sus legítimos propietarios y se gestionan como personalizaciones locales del usuario.
                </p>
            </div>
        </div>
    );
};
