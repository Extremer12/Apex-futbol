import React, { useState, useEffect, useRef } from 'react';
import { customPacksService } from '../../../services/customPacks/packService';
import { Download, Upload, Link2, AlertCircle, CheckCircle2, RotateCcw, Shield, Sparkles, Trash2 } from 'lucide-react';
import { ARG_PACK_CDN } from '../../../services/customPacks/argentineLogos';

const OFFICIAL_GLOBAL_PACK_ZIP = 'https://github.com/Extremer12/community-data-packs/releases/download/v1.0.0/football-logos-master.zip';

export const CommunityPacksSection: React.FC = () => {
    const [stats, setStats] = useState({ teams: 0, competitions: 0, players: 0, total: 0 });
    const [isArgPackActive, setIsArgPackActive] = useState<boolean>(false);
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
                    ? '¡Pack de Fútbol Argentino activado! Se cargaron los escudos oficiales vectoriales.' 
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
            setFeedbackMessage({ type: 'success', text: 'Se restablecieron todos los escudos a genéricos neutros.' });
            await refreshState();
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: 'Error al restablecer: ' + err.message });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[var(--apex-gold)]" /> Packs de la Comunidad
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Modelo World Soccer Champs & Super Kickoff (Licencias & UGC).
                    </p>
                </div>
                {(isArgPackActive || stats.total > 0) && (
                    <button
                        onClick={handleClearAll}
                        disabled={isProcessing}
                        className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Restablecer todo a genéricos"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restablecer Todo</span>
                    </button>
                )}
            </div>

            {/* 🌟 Tarjeta 1: Pack de Fútbol Argentino (jsDelivr CDN) */}
            <div className={`rounded-2xl border p-5 transition-all shadow-xl relative overflow-hidden ${
                isArgPackActive 
                    ? 'bg-gradient-to-b from-[#101A2B] to-[#0A101C] border-sky-500/40' 
                    : 'bg-gradient-to-b from-[#161D2E] to-[#0E131F] border-white/10'
            }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                                Fútbol Argentino • 2026
                            </span>
                            {isArgPackActive ? (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" /> Pack Activo (65+ escudos .SVG)
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                                    Escudos Genéricos Activos
                                </span>
                            )}
                        </div>
                        <h4 className="text-base font-black text-white uppercase tracking-tight">
                            Pack de Fútbol Argentino
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Incluye los 30 clubes de Primera División, 36 clubes de Primera Nacional y logos de torneo desde el catálogo comunitario en jsDelivr.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {isArgPackActive ? (
                            <button
                                onClick={() => handleToggleArgPack(false)}
                                disabled={isProcessing}
                                className="w-full sm:w-auto px-4 py-3 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 hover:text-red-100 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Desinstalar Pack</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => handleToggleArgPack(true)}
                                disabled={isProcessing}
                                className="w-full sm:w-auto px-5 py-3 bg-[var(--apex-gold)] hover:bg-[#FFE57F] text-[#0A0E17] text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                                <span>Instalar Pack Argentino</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 📦 Tarjeta 2: Pack Global / Personalizado */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Pack Global (.ZIP / URL)
                            </span>
                            {stats.total > 0 && (
                                <span className="text-[10px] font-bold text-emerald-400">
                                    • {stats.total} archivos personalizados en storage
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
