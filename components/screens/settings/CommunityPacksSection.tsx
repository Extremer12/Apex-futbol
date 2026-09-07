import React, { useState, useEffect, useRef } from 'react';
import { customPacksService } from '../../../services/customPacks/packService';
import { Download, Upload, Link2, AlertCircle, CheckCircle2, RotateCcw, Shield, Sparkles, Trash2, Globe } from 'lucide-react';

const OFFICIAL_GLOBAL_PACK_ZIP = 'https://github.com/Extremer12/community-data-packs/releases/download/v1.0.0/football-logos-master.zip';

export const CommunityPacksSection: React.FC = () => {
    const [stats, setStats] = useState({ teams: 0, competitions: 0, players: 0, total: 0 });
    const [isArgPackActive, setIsArgPackActive] = useState<boolean>(false);
    const [isEngPackActive, setIsEngPackActive] = useState<boolean>(false);
    const [isItaPackActive, setIsItaPackActive] = useState<boolean>(false);
    const [isBraPackActive, setIsBraPackActive] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [progressStatus, setProgressStatus] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshState = async () => {
        const s = await customPacksService.getStats();
        setStats(s);
        setIsArgPackActive(customPacksService.isArgentinePackActive());
        setIsEngPackActive(customPacksService.isEnglishPackActive());
        setIsItaPackActive(customPacksService.isItalianPackActive());
        setIsBraPackActive(customPacksService.isBrazilianPackActive());
    };

    useEffect(() => {
        refreshState();
        const unsubscribe = customPacksService.subscribe(refreshState);
        return () => unsubscribe();
    }, []);

    // Toggle Argentine Pack (jsDelivr CDN)
    const handleToggleArgPack = (enable: boolean) => {
        setIsProcessing(true);
        try {
            customPacksService.setArgentinePackActive(enable);
            setIsArgPackActive(enable);
            setFeedbackMessage({
                type: 'success',
                text: enable 
                    ? '¡Pack de Fútbol Argentino activado! Se cargaron los escudos oficiales vectoriales (Primera División + Primera Nacional).' 
                    : 'Pack de Fútbol Argentino desinstalado. Se restauraron los escudos genéricos neutros.'
            });
        } catch (err: any) {
            setFeedbackMessage({
                type: 'error',
                text: 'Error al cambiar el estado del pack: ' + (err.message || err)
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Toggle English Pack (jsDelivr CDN)
    const handleToggleEngPack = (enable: boolean) => {
        setIsProcessing(true);
        try {
            customPacksService.setEnglishPackActive(enable);
            setIsEngPackActive(enable);
            setFeedbackMessage({
                type: 'success',
                text: enable 
                    ? '¡Pack de Fútbol Inglés activado! Se cargaron los escudos de Premier League y Championship.' 
                    : 'Pack de Fútbol Inglés desinstalado. Se restauraron los escudos genéricos neutros.'
            });
        } catch (err: any) {
            setFeedbackMessage({
                type: 'error',
                text: 'Error al cambiar el estado del pack: ' + (err.message || err)
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Toggle Italian Pack (jsDelivr CDN)
    const handleToggleItaPack = (enable: boolean) => {
        setIsProcessing(true);
        try {
            customPacksService.setItalianPackActive(enable);
            setIsItaPackActive(enable);
            setFeedbackMessage({
                type: 'success',
                text: enable 
                    ? '¡Pack de Fútbol Italiano activado! Se cargaron los escudos de Serie A y Serie B.' 
                    : 'Pack de Fútbol Italiano desinstalado. Se restauraron los escudos genéricos neutros.'
            });
        } catch (err: any) {
            setFeedbackMessage({
                type: 'error',
                text: 'Error al cambiar el estado del pack: ' + (err.message || err)
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Toggle Brazilian Pack (jsDelivr CDN)
    const handleToggleBraPack = (enable: boolean) => {
        setIsProcessing(true);
        try {
            customPacksService.setBrazilianPackActive(enable);
            setIsBraPackActive(enable);
            setFeedbackMessage({
                type: 'success',
                text: enable 
                    ? '¡Pack de Fútbol Brasileño activado! Se cargaron los escudos de Brasileirão Serie A y Serie B.' 
                    : 'Pack de Fútbol Brasileño desinstalado. Se restauraron los escudos genéricos neutros.'
            });
        } catch (err: any) {
            setFeedbackMessage({
                type: 'error',
                text: 'Error al cambiar el estado del pack: ' + (err.message || err)
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Enable all community packs
    const handleEnableAllPacks = () => {
        setIsProcessing(true);
        try {
            customPacksService.setArgentinePackActive(true);
            customPacksService.setEnglishPackActive(true);
            customPacksService.setItalianPackActive(true);
            customPacksService.setBrazilianPackActive(true);
            setIsArgPackActive(true);
            setIsEngPackActive(true);
            setIsItaPackActive(true);
            setIsBraPackActive(true);
            setFeedbackMessage({
                type: 'success',
                text: '¡Todos los packs comunitarios activos! (Argentina, Inglaterra, Italia y Brasil).'
            });
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: err.message || 'Error al activar los packs.' });
        } finally {
            setIsProcessing(false);
        }
    };

    // Download full ZIP pack
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
                text: `¡Éxito! Se instalaron ${result.importedCount} escudos y logos de la comunidad.`
            });
            await refreshState();
        } catch (err: any) {
            setFeedbackMessage({
                type: 'error',
                text: err.message || 'Error al conectar con la descarga.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileSelect = async (file: File) => {
        if (!file.name.toLowerCase().endsWith('.zip')) {
            setFeedbackMessage({ type: 'error', text: 'Selecciona un archivo comprimido .ZIP válido.' });
            return;
        }

        setIsProcessing(true);
        setProgressPercent(0);
        setProgressStatus('Leyendo archivo ZIP...');
        setFeedbackMessage(null);

        try {
            const result = await customPacksService.importZipPack(file, (pct, status) => {
                setProgressPercent(pct);
                setProgressStatus(status);
            });

            setFeedbackMessage({
                type: 'success',
                text: `¡Éxito! Se importaron ${result.importedCount} imágenes al juego.`
            });
            await refreshState();
        } catch (err: any) {
            setFeedbackMessage({
                type: 'error',
                text: err.message || 'Error al procesar el archivo ZIP.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUrlImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!urlInput.trim()) return;

        setIsProcessing(true);
        setProgressPercent(0);
        setProgressStatus('Cargando enlace...');
        setFeedbackMessage(null);

        try {
            const result = await customPacksService.importUrlPack(urlInput.trim(), (pct, status) => {
                setProgressPercent(pct);
                setProgressStatus(status);
            });

            setFeedbackMessage({
                type: 'success',
                text: `¡Éxito! Se cargaron ${result.importedCount} logos desde la URL.`
            });
            setUrlInput('');
            await refreshState();
        } catch (err: any) {
            setFeedbackMessage({
                type: 'error',
                text: err.message || 'Error al descargar o procesar la URL.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('¿Deseas restablecer todos los escudos y volver al modo genérico por defecto?')) {
            return;
        }

        try {
            await customPacksService.clearAllPacks();
            setIsArgPackActive(false);
            setIsEngPackActive(false);
            setIsItaPackActive(false);
            setIsBraPackActive(false);
            setFeedbackMessage({ type: 'success', text: 'Se restablecieron todos los escudos a genéricos neutros.' });
            await refreshState();
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: 'Error al restablecer: ' + err.message });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[var(--apex-gold)]" /> Packs de la Comunidad
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Modelo World Soccer Champs & Super Kickoff (Licencias & UGC).
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    {(!isArgPackActive || !isEngPackActive || !isItaPackActive || !isBraPackActive) && (
                        <button
                            onClick={handleEnableAllPacks}
                            disabled={isProcessing}
                            className="text-[11px] font-bold text-[var(--apex-gold)] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Activar Todos</span>
                        </button>
                    )}
                    {(isArgPackActive || isEngPackActive || isItaPackActive || isBraPackActive || stats.total > 0) && (
                        <button
                            onClick={handleClearAll}
                            disabled={isProcessing}
                            className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer ml-2"
                            title="Restablecer todo a genéricos"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restablecer Todo</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 🌟 Grid de Packs Oficiales Disponibles en jsDelivr */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Tarjeta 1: Fútbol Argentino */}
                <div className={`rounded-2xl border p-4 transition-all shadow-xl relative overflow-hidden flex flex-col justify-between ${
                    isArgPackActive 
                        ? 'bg-gradient-to-b from-[#101A2B] to-[#0A101C] border-sky-500/40' 
                        : 'bg-gradient-to-b from-[#161D2E] to-[#0E131F] border-white/10'
                }`}>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                                Argentina • 66 Escudos
                            </span>
                            {isArgPackActive ? (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" /> Activo
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                                    Genérico
                                </span>
                            )}
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                            Primera División & Nacional
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Boca, River, Racing, Independiente, San Lorenzo y 66 clubes de AFA.
                        </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-white/5">
                        {isArgPackActive ? (
                            <button
                                onClick={() => handleToggleArgPack(false)}
                                disabled={isProcessing}
                                className="w-full py-2 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 hover:text-red-100 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Desinstalar</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => handleToggleArgPack(true)}
                                disabled={isProcessing}
                                className="w-full py-2 bg-[var(--apex-gold)] hover:bg-[#FFE57F] text-[#0A0E17] text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                                <span>Instalar Argentina</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tarjeta 2: Fútbol Inglés */}
                <div className={`rounded-2xl border p-4 transition-all shadow-xl relative overflow-hidden flex flex-col justify-between ${
                    isEngPackActive 
                        ? 'bg-gradient-to-b from-[#1A182B] to-[#0E0D1F] border-purple-500/40' 
                        : 'bg-gradient-to-b from-[#161D2E] to-[#0E131F] border-white/10'
                }`}>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                                Inglaterra • 44 Escudos
                            </span>
                            {isEngPackActive ? (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" /> Activo
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                                    Genérico
                                </span>
                            )}
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                            Premier & Championship
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Arsenal, City, Liverpool, United, Chelsea, Tottenham y Championship.
                        </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-white/5">
                        {isEngPackActive ? (
                            <button
                                onClick={() => handleToggleEngPack(false)}
                                disabled={isProcessing}
                                className="w-full py-2 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 hover:text-red-100 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Desinstalar</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => handleToggleEngPack(true)}
                                disabled={isProcessing}
                                className="w-full py-2 bg-purple-500 hover:bg-purple-400 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Globe className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                                <span>Instalar Inglaterra</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tarjeta 3: Fútbol Italiano */}
                <div className={`rounded-2xl border p-4 transition-all shadow-xl relative overflow-hidden flex flex-col justify-between ${
                    isItaPackActive 
                        ? 'bg-gradient-to-b from-[#10241A] to-[#0A160F] border-emerald-500/40' 
                        : 'bg-gradient-to-b from-[#161D2E] to-[#0E131F] border-white/10'
                }`}>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                Italia • 40+ Escudos
                            </span>
                            {isItaPackActive ? (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" /> Activo
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                                    Genérico
                                </span>
                            )}
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                            Serie A & Serie B
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Inter, Milan, Juventus, Roma, Napoli, Lazio, Fiorentina y Serie B.
                        </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-white/5">
                        {isItaPackActive ? (
                            <button
                                onClick={() => handleToggleItaPack(false)}
                                disabled={isProcessing}
                                className="w-full py-2 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 hover:text-red-100 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Desinstalar</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => handleToggleItaPack(true)}
                                disabled={isProcessing}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Globe className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                                <span>Instalar Italia</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tarjeta 4: Fútbol Brasileño */}
                <div className={`rounded-2xl border p-4 transition-all shadow-xl relative overflow-hidden flex flex-col justify-between ${
                    isBraPackActive 
                        ? 'bg-gradient-to-b from-[#222410] to-[#14160A] border-yellow-500/40' 
                        : 'bg-gradient-to-b from-[#161D2E] to-[#0E131F] border-white/10'
                }`}>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">
                                Brasil • 40+ Escudos
                            </span>
                            {isBraPackActive ? (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" /> Activo
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                                    Genérico
                                </span>
                            )}
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                            Brasileirão Serie A & B
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Flamengo, Palmeiras, São Paulo, Corinthians, Santos, Grêmio y más.
                        </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-white/5">
                        {isBraPackActive ? (
                            <button
                                onClick={() => handleToggleBraPack(false)}
                                disabled={isProcessing}
                                className="w-full py-2 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 hover:text-red-100 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Desinstalar</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => handleToggleBraPack(true)}
                                disabled={isProcessing}
                                className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Globe className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                                <span>Instalar Brasil</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 📦 Tarjeta 3: Pack Global / Personalizado */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Pack Global (.ZIP / URL)
                            </span>
                            {stats.total > 0 && (
                                <span className="text-[10px] font-bold text-emerald-400">
                                    • {stats.total} archivos en almacenamiento local
                                </span>
                            )}
                        </div>
                        <h5 className="text-xs font-bold text-white uppercase mt-0.5">
                            Cargar Packs Externos de la Comunidad
                        </h5>
                    </div>

                    <button
                        onClick={handleInstallGlobalPack}
                        disabled={isProcessing}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-300" />
                        <span>Descargar Pack Global .ZIP</span>
                    </button>
                </div>

                {/* Subir ZIP local o Pegar Enlace */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleFileSelect(e.dataTransfer.files[0]);
                            }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`rounded-xl border border-dashed p-3 flex items-center gap-3 transition-all cursor-pointer ${
                            isDragOver 
                                ? 'border-[var(--apex-gold)] bg-[var(--apex-gold)]/10' 
                                : 'border-white/10 bg-[#0F1423]/60 hover:border-white/25 hover:bg-[#121828]'
                        }`}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} 
                            accept=".zip" 
                            className="hidden" 
                        />
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-300">
                            <Upload className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-white uppercase tracking-wider truncate">
                                Subir Pack .ZIP Local
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                                Selecciona archivo desde tu dispositivo
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUrlImport} className="rounded-xl border border-white/10 bg-[#0F1423]/60 p-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-300">
                            <Link2 className="w-3.5 h-3.5" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Pegar URL de pack (.json / .zip)..." 
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            disabled={isProcessing}
                            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none min-w-0"
                        />
                        <button
                            type="submit"
                            disabled={isProcessing || !urlInput.trim()}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex-shrink-0"
                        >
                            Cargar
                        </button>
                    </form>
                </div>
            </div>

            {/* Barra de progreso de descarga / proceso */}
            {isProcessing && progressPercent > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1.5 animate-fade-in">
                    <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-300 truncate">{progressStatus}</span>
                        <span className="text-[var(--apex-gold)]">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-[var(--apex-gold)] h-full transition-all duration-300 rounded-full" 
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Mensajes de Feedback */}
            {feedbackMessage && (
                <div className={`p-3.5 rounded-xl text-xs font-bold border flex items-start gap-2.5 animate-fade-in ${
                    feedbackMessage.type === 'success' 
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                        : 'bg-red-950/40 border-red-500/30 text-red-300'
                }`}>
                    {feedbackMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                        <span>{feedbackMessage.text}</span>
                    </div>
                </div>
            )}

            {/* Descargo de Responsabilidad Minimalista */}
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                ⚖️ Apex AI no incluye escudos comerciales oficiales de fábrica. El contenido descargado es generado por la comunidad (UGC) y se almacena localmente en tu navegador.
            </p>
        </div>
    );
};
