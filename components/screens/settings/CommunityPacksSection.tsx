import React, { useState, useEffect } from 'react';
import { customPacksService } from '../../../services/customPacks/packService';
import { Download, AlertCircle, CheckCircle2, RotateCcw, Shield, Layers, Check } from 'lucide-react';

const OFFICIAL_GLOBAL_PACK_ZIP = 'https://github.com/Extremer12/community-data-packs/releases/download/v1.0.0/football-logos-master.zip';

interface PackItem {
    id: string;
    name: string;
    region: string;
    count: string;
    description: string;
    tagColor: string;
    tagBorder: string;
    tagBg: string;
    isActive: boolean;
    onToggle: (enable: boolean) => void;
}

export const CommunityPacksSection: React.FC = () => {
    const [stats, setStats] = useState({ teams: 0, competitions: 0, players: 0, total: 0 });
    const [isArgPackActive, setIsArgPackActive] = useState<boolean>(false);
    const [isOtrosArgActive, setIsOtrosArgActive] = useState<boolean>(false);
    const [isParaguayPackActive, setIsParaguayPackActive] = useState<boolean>(false);
    const [isCompetitionsPackActive, setIsCompetitionsPackActive] = useState<boolean>(false);
    const [isEngPackActive, setIsEngPackActive] = useState<boolean>(false);
    const [isItaPackActive, setIsItaPackActive] = useState<boolean>(false);
    const [isSpaPackActive, setIsSpaPackActive] = useState<boolean>(false);
    const [isBraPackActive, setIsBraPackActive] = useState<boolean>(false);
    const [isGerPackActive, setIsGerPackActive] = useState<boolean>(false);
    const [isFrePackActive, setIsFrePackActive] = useState<boolean>(false);
    const [isMexPackActive, setIsMexPackActive] = useState<boolean>(false);
    const [isFacesPackActive, setIsFacesPackActive] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [progressStatus, setProgressStatus] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const refreshState = async () => {
        const s = await customPacksService.getStats();
        setStats(s);
        setIsArgPackActive(customPacksService.isArgentinePackActive());
        setIsOtrosArgActive(customPacksService.isOtrosArgentinaPackActive());
        setIsParaguayPackActive(customPacksService.isParaguayPackActive());
        setIsCompetitionsPackActive(customPacksService.isCompetitionsPackActive());
        setIsEngPackActive(customPacksService.isEnglishPackActive());
        setIsItaPackActive(customPacksService.isItalianPackActive());
        setIsSpaPackActive(customPacksService.isSpanishPackActive());
        setIsBraPackActive(customPacksService.isBrazilianPackActive());
        setIsGerPackActive(customPacksService.isGermanPackActive());
        setIsFrePackActive(customPacksService.isFrenchPackActive());
        setIsMexPackActive(customPacksService.isMexicanPackActive());
        setIsFacesPackActive(customPacksService.isPlayerFacesPackActive());
    };

    useEffect(() => {
        refreshState();
        const unsubscribe = customPacksService.subscribe(refreshState);
        return () => unsubscribe();
    }, []);

    const executeToggle = (action: () => void, successText: string, errorText: string) => {
        setIsProcessing(true);
        try {
            action();
            setFeedbackMessage({ type: 'success', text: successText });
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: errorText + ': ' + (err.message || err) });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleToggleArgPack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setArgentinePackActive(enable);
                setIsArgPackActive(enable);
                setIsOtrosArgActive(enable);
            },
            enable ? 'Pack de Fútbol Argentino activado.' : 'Pack de Fútbol Argentino desinstalado.',
            'Error al modificar el pack argentino'
        );
    };

    const handleToggleOtrosArgPack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setOtrosArgentinaPackActive(enable);
                setIsOtrosArgActive(enable);
            },
            enable ? 'Pack Otros Clubes de Argentina activado.' : 'Pack Otros Clubes de Argentina desinstalado.',
            'Error al modificar el pack de clubes de Argentina'
        );
    };

    const handleToggleParaguayPack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setParaguayPackActive(enable);
                setIsParaguayPackActive(enable);
            },
            enable ? 'Pack de Fútbol Paraguayo activado.' : 'Pack de Fútbol Paraguayo desinstalado.',
            'Error al modificar el pack de Paraguay'
        );
    };

    const handleToggleCompetitionsPack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setCompetitionsPackActive(enable);
                setIsCompetitionsPackActive(enable);
            },
            enable ? 'Pack de Competiciones Internacionales activado.' : 'Pack de Competiciones desinstalado.',
            'Error al modificar el pack de competiciones'
        );
    };

    const handleToggleEngPack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setEnglishPackActive(enable);
                setIsEngPackActive(enable);
            },
            enable ? 'Pack de Fútbol Inglés activado.' : 'Pack de Fútbol Inglés desinstalado.',
            'Error al modificar el pack de Inglaterra'
        );
    };

    const handleToggleItaPack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setItalianPackActive(enable);
                setIsItaPackActive(enable);
            },
            enable ? 'Pack de Fútbol Italiano activado.' : 'Pack de Fútbol Italiano desinstalado.',
            'Error al modificar el pack de Italia'
        );
    };

    const handleToggleSpaPack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setSpanishPackActive(enable);
                setIsSpaPackActive(enable);
            },
            enable ? 'Pack de Fútbol Español activado.' : 'Pack de Fútbol Español desinstalado.',
            'Error al modificar el pack de España'
        );
    };

    const handleToggleBraPack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setBrazilianPackActive(enable);
                setIsBraPackActive(enable);
            },
            enable ? 'Pack de Fútbol Brasileño activado.' : 'Pack de Fútbol Brasileño desinstalado.',
            'Error al modificar el pack de Brasil'
        );
    };

    const handleToggleGerPack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setGermanPackActive(enable);
                setIsGerPackActive(enable);
            },
            enable ? 'Pack de Fútbol Alemán activado.' : 'Pack de Fútbol Alemán desinstalado.',
            'Error al modificar el pack de Alemania'
        );
    };

    const handleToggleFrePack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setFrenchPackActive(enable);
                setIsFrePackActive(enable);
            },
            enable ? 'Pack de Fútbol Francés activado.' : 'Pack de Fútbol Francés desinstalado.',
            'Error al modificar el pack de Francia'
        );
    };

    const handleToggleMexPack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setMexicanPackActive(enable);
                setIsMexPackActive(enable);
            },
            enable ? 'Pack de Fútbol Mexicano activado.' : 'Pack de Fútbol Mexicano desinstalado.',
            'Error al modificar el pack de México'
        );
    };

    const handleToggleFacesPack = (enable: boolean) => {
        executeToggle(
            () => {
                customPacksService.setPlayerFacesPackActive(enable);
                setIsFacesPackActive(enable);
            },
            enable ? 'Pack de Rostros de Jugadores activado.' : 'Pack de Rostros desinstalado.',
            'Error al modificar el pack de rostros'
        );
    };

    const handleEnableAllPacks = () => {
        setIsProcessing(true);
        try {
            customPacksService.setAllPacksActive(true);
            setIsArgPackActive(true);
            setIsOtrosArgActive(true);
            setIsParaguayPackActive(true);
            setIsCompetitionsPackActive(true);
            setIsEngPackActive(true);
            setIsItaPackActive(true);
            setIsSpaPackActive(true);
            setIsBraPackActive(true);
            setIsGerPackActive(true);
            setIsFrePackActive(true);
            setIsMexPackActive(true);
            setIsFacesPackActive(true);
            setFeedbackMessage({
                type: 'success',
                text: 'Todos los packs comunitarios han sido activados correctamente.'
            });
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: err.message || 'Error al activar los packs.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInstallGlobalPack = async () => {
        setIsProcessing(true);
        setProgressPercent(0);
        setProgressStatus('Iniciando descarga del paquete global...');
        setFeedbackMessage(null);

        try {
            const result = await customPacksService.downloadAndImportZipPack(
                OFFICIAL_GLOBAL_PACK_ZIP,
                (pct, status) => {
                    setProgressPercent(pct);
                    setProgressStatus(status);
                }
            );

            setFeedbackMessage({
                type: 'success',
                text: `Se instalaron ${result.importedCount} escudos y logos en tu almacenamiento local.`
            });
            await refreshState();
        } catch (err: any) {
            setFeedbackMessage({
                type: 'error',
                text: err.message || 'Error al descargar el paquete.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('¿Deseas restablecer todos los escudos y rostros a genéricos?')) {
            return;
        }

        try {
            await customPacksService.clearAllPacks();
            setIsArgPackActive(false);
            setIsOtrosArgActive(false);
            setIsParaguayPackActive(false);
            setIsCompetitionsPackActive(false);
            setIsEngPackActive(false);
            setIsItaPackActive(false);
            setIsSpaPackActive(false);
            setIsBraPackActive(false);
            setIsGerPackActive(false);
            setIsFrePackActive(false);
            setIsMexPackActive(false);
            setIsFacesPackActive(false);
            setFeedbackMessage({ type: 'success', text: 'Se restablecieron todos los elementos a modo genérico.' });
            await refreshState();
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: 'Error al restablecer: ' + err.message });
        }
    };

    const activePacksCount = [
        isArgPackActive,
        isOtrosArgActive,
        isParaguayPackActive,
        isMexPackActive,
        isEngPackActive,
        isSpaPackActive,
        isItaPackActive,
        isBraPackActive,
        isGerPackActive,
        isFrePackActive,
        isCompetitionsPackActive,
        isFacesPackActive
    ].filter(Boolean).length;

    const areAllPacksActive = activePacksCount === 12;

    const packs: PackItem[] = [
        {
            id: 'arg',
            name: 'Primera División & B',
            region: 'Argentina',
            count: '66 Escudos',
            description: 'Liga Profesional y Primera Nacional de AFA.',
            tagColor: 'text-sky-400',
            tagBorder: 'border-sky-500/30',
            tagBg: 'bg-sky-500/10',
            isActive: isArgPackActive,
            onToggle: handleToggleArgPack
        },
        {
            id: 'otros_arg',
            name: 'Clubes del Interior',
            region: 'Argentina',
            count: '12 Escudos',
            description: 'Equipos históricos y Torneo Federal.',
            tagColor: 'text-sky-300',
            tagBorder: 'border-sky-400/30',
            tagBg: 'bg-sky-500/10',
            isActive: isOtrosArgActive,
            onToggle: handleToggleOtrosArgPack
        },
        {
            id: 'eng',
            name: 'Premier & Championship',
            region: 'Inglaterra',
            count: '44 Escudos',
            description: 'Primera y segunda división del fútbol inglés.',
            tagColor: 'text-violet-400',
            tagBorder: 'border-violet-500/30',
            tagBg: 'bg-violet-500/10',
            isActive: isEngPackActive,
            onToggle: handleToggleEngPack
        },
        {
            id: 'spa',
            name: 'LaLiga & Hypermotion',
            region: 'España',
            count: '42 Escudos',
            description: 'Primera y Segunda División de España.',
            tagColor: 'text-rose-400',
            tagBorder: 'border-rose-500/30',
            tagBg: 'bg-rose-500/10',
            isActive: isSpaPackActive,
            onToggle: handleToggleSpaPack
        },
        {
            id: 'ita',
            name: 'Serie A & Serie B',
            region: 'Italia',
            count: '40 Escudos',
            description: 'Calcio italiano y categorías de ascenso.',
            tagColor: 'text-blue-400',
            tagBorder: 'border-blue-500/30',
            tagBg: 'bg-blue-500/10',
            isActive: isItaPackActive,
            onToggle: handleToggleItaPack
        },
        {
            id: 'ger',
            name: 'Bundesliga & 2. Bundesliga',
            region: 'Alemania',
            count: '36 Escudos',
            description: 'Competiciones oficiales de Alemania.',
            tagColor: 'text-amber-300',
            tagBorder: 'border-amber-500/30',
            tagBg: 'bg-amber-500/10',
            isActive: isGerPackActive,
            onToggle: handleToggleGerPack
        },
        {
            id: 'fre',
            name: 'Ligue 1 & Ligue 2',
            region: 'Francia',
            count: '36 Escudos',
            description: 'Primera y segunda categoría de Francia.',
            tagColor: 'text-teal-400',
            tagBorder: 'border-teal-500/30',
            tagBg: 'bg-teal-500/10',
            isActive: isFrePackActive,
            onToggle: handleToggleFrePack
        },
        {
            id: 'bra',
            name: 'Brasileirão Série A',
            region: 'Brasil',
            count: '20 Escudos',
            description: 'Serie A y principales clubes de Brasil.',
            tagColor: 'text-emerald-400',
            tagBorder: 'border-emerald-500/30',
            tagBg: 'bg-emerald-500/10',
            isActive: isBraPackActive,
            onToggle: handleToggleBraPack
        },
        {
            id: 'mex',
            name: 'Liga MX & Expansión',
            region: 'México',
            count: '36 Escudos',
            description: 'Torneo Apertura/Clausura y Liga de Expansión.',
            tagColor: 'text-emerald-300',
            tagBorder: 'border-emerald-400/30',
            tagBg: 'bg-emerald-500/10',
            isActive: isMexPackActive,
            onToggle: handleToggleMexPack
        },
        {
            id: 'par',
            name: 'Copa de Primera',
            region: 'Paraguay',
            count: '14 Escudos',
            description: 'División de Honor y clubes de la APF.',
            tagColor: 'text-red-400',
            tagBorder: 'border-red-500/30',
            tagBg: 'bg-red-500/10',
            isActive: isParaguayPackActive,
            onToggle: handleToggleParaguayPack
        },
        {
            id: 'competitions',
            name: 'Torneos Internacionales',
            region: 'Copas',
            count: '15+ Logos',
            description: 'Champions League, Libertadores, Sudamericana y Mundial.',
            tagColor: 'text-[var(--apex-gold)]',
            tagBorder: 'border-[var(--apex-gold)]/30',
            tagBg: 'bg-[var(--apex-gold)]/10',
            isActive: isCompetitionsPackActive,
            onToggle: handleToggleCompetitionsPack
        },
        {
            id: 'faces',
            name: 'Rostros de Jugadores',
            region: 'Plantillas',
            count: '150+ Fotos',
            description: 'Fotografías reales para cartas y alineaciones.',
            tagColor: 'text-purple-400',
            tagBorder: 'border-purple-500/30',
            tagBg: 'bg-purple-500/10',
            isActive: isFacesPackActive,
            onToggle: handleToggleFacesPack
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header / Bar Superior */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                <div>
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[var(--apex-gold)]" />
                        <span>Packs de la Comunidad</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Personaliza los escudos oficiales vectoriales y fotos de futbolistas.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {!areAllPacksActive && (
                        <button
                            onClick={handleEnableAllPacks}
                            disabled={isProcessing}
                            className="text-xs font-semibold text-[var(--apex-gold)] hover:text-amber-300 transition-colors cursor-pointer"
                        >
                            Activar Todos
                        </button>
                    )}
                    {(activePacksCount > 0 || stats.total > 0) && (
                        <button
                            onClick={handleClearAll}
                            disabled={isProcessing}
                            className="text-xs font-semibold text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Restablecer todo a genéricos"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restablecer</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Hero Banner: Instalación Global en 1 Clic */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-[#101726]/90 to-[#181a24]/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2.5 py-0.5 rounded-full border border-[var(--apex-gold)]/20">
                                Colección Oficial
                            </span>
                            <span className="text-xs font-medium text-slate-400">
                                {activePacksCount} de 12 Packs Activos
                            </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                            Instalación Completa en 1 Clic
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Activa simultáneamente todos los escudos vectoriales oficiales y fotografías de jugadores de todas las ligas.
                        </p>

                        {/* Barra de progreso sutil */}
                        <div className="pt-1 w-full max-w-xs">
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[var(--apex-gold)] to-emerald-400 transition-all duration-500 rounded-full"
                                    style={{ width: `${(activePacksCount / 12) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex-shrink-0">
                        {areAllPacksActive ? (
                            <div className="w-full md:w-auto px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-2">
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span>Todos los Packs Activos</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleEnableAllPacks}
                                disabled={isProcessing}
                                className="w-full md:w-auto px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[var(--apex-gold)] to-[#E6C35C] hover:brightness-110 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <span>Instalar Todos los Packs</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid de Packs Comunitarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                {packs.map((pack) => (
                    <div
                        key={pack.id}
                        className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between backdrop-blur-md ${
                            pack.isActive
                                ? 'bg-[#0D1526]/90 border-sky-500/30 shadow-lg shadow-sky-950/20'
                                : 'bg-slate-900/60 border-white/[0.07] hover:border-white/20'
                        }`}
                    >
                        <div className="space-y-3">
                            {/* Card Header: Region & Status */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${pack.tagColor} ${pack.tagBorder} ${pack.tagBg}`}>
                                        {pack.region}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        • {pack.count}
                                    </span>
                                </div>

                                {pack.isActive ? (
                                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5 flex-shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Activo
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-800/50 border border-white/5 px-2 py-0.5 rounded-full flex items-center gap-1.5 flex-shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                        Genérico
                                    </span>
                                )}
                            </div>

                            {/* Card Body: Title & Short Desc */}
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                                    {pack.name}
                                </h4>
                                <p className="text-xs text-slate-400 line-clamp-1">
                                    {pack.description}
                                </p>
                            </div>
                        </div>

                        {/* Card Action Button */}
                        <div className="pt-4 mt-2 border-t border-white/5">
                            {pack.isActive ? (
                                <button
                                    onClick={() => pack.onToggle(false)}
                                    disabled={isProcessing}
                                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold border border-white/10 bg-slate-800/80 hover:bg-red-500/10 hover:border-red-500/30 text-slate-300 hover:text-red-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
                                >
                                    <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:hidden" />
                                    <span className="group-hover:hidden">Instalado</span>
                                    <span className="hidden group-hover:inline">Desinstalar</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => pack.onToggle(true)}
                                    disabled={isProcessing}
                                    className="w-full py-2 px-3 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-[var(--apex-gold)] hover:text-slate-950 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                                >
                                    <span>Instalar Pack</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Descarga Manual ZIP */}
            <div className="rounded-2xl bg-slate-900/40 border border-white/[0.08] p-4 sm:p-5 backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-0.5 rounded-md border border-[var(--apex-gold)]/20">
                                Repositorio Oficial
                            </span>
                            {stats.total > 0 && (
                                <span className="text-[10px] text-slate-400">
                                    • {stats.total} archivos locales
                                </span>
                            )}
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-tight">
                            Archivo Maestro Completo (.ZIP)
                        </h4>
                        <p className="text-xs text-slate-400">
                            Descarga directa del paquete maestro para almacenamiento local o respaldo sin conexión.
                        </p>
                    </div>

                    <button
                        onClick={handleInstallGlobalPack}
                        disabled={isProcessing}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0 active:scale-95"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-300" />
                        <span>Descargar ZIP</span>
                    </button>
                </div>
            </div>

            {/* Barra de progreso de descarga */}
            {isProcessing && progressPercent > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2 animate-fade-in">
                    <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300 truncate">{progressStatus}</span>
                        <span className="text-[var(--apex-gold)]">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-[var(--apex-gold)] h-full transition-all duration-300 rounded-full" 
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Mensajes de Feedback */}
            {feedbackMessage && (
                <div className={`p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2.5 animate-fade-in ${
                    feedbackMessage.type === 'success' 
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                        : 'bg-red-950/40 border-red-500/30 text-red-300'
                }`}>
                    {feedbackMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span>{feedbackMessage.text}</span>
                </div>
            )}

            {/* Aviso Legal de Licencias Comunitarias */}
            <div className="p-4 rounded-xl bg-slate-900/20 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Aviso de Licencias y Contenido de la Comunidad
                    </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                    Apex AI es un simulador de gestión deportiva independiente. Los escudos, marcas y fotos de futbolistas pertenecen a sus respectivos clubes y titulares. Los paquetes son archivos de personalización local gestionados por el usuario para uso personal.
                </p>
            </div>
        </div>
    );
};
