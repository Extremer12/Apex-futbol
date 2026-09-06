import React, { useState, useEffect, useRef } from 'react';
import { customPacksService } from '../../../services/customPacks/packService';
import { Download, Upload, Link2, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

const OFFICIAL_COMMUNITY_PACK_URL = 'https://github.com/Extremer12/community-data-packs/releases/download/v1.0.0/football-logos-master.zip';

export const CommunityPacksSection: React.FC = () => {
    const [stats, setStats] = useState({ teams: 0, competitions: 0, players: 0, total: 0 });
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [progressStatus, setProgressStatus] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshStats = async () => {
        const s = await customPacksService.getStats();
        setStats(s);
    };

    useEffect(() => {
        refreshStats();
        const unsubscribe = customPacksService.subscribe(refreshStats);
        return () => unsubscribe();
    }, []);

    const handleInstallOfficialPack = async () => {
        setIsProcessing(true);
        setProgressPercent(0);
        setProgressStatus('Iniciando descarga del paquete...');
        setFeedbackMessage(null);

        try {
            const result = await customPacksService.downloadAndImportZipPack(
                OFFICIAL_COMMUNITY_PACK_URL,
                (pct, status) => {
                    setProgressPercent(pct);
                    setProgressStatus(status);
                }
            );

            setFeedbackMessage({
                type: 'success',
                text: `¡Éxito! Se instalaron ${result.importedCount} escudos y logos oficiales.`
            });
            await refreshStats();
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
            await refreshStats();
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
            await refreshStats();
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
        if (!window.confirm('¿Deseas restablecer todos los escudos a los valores por defecto?')) {
            return;
        }

        try {
            await customPacksService.clearAllPacks();
            setFeedbackMessage({ type: 'success', text: 'Se restablecieron todos los logos.' });
            await refreshStats();
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: 'Error al limpiar logos: ' + err.message });
        }
    };

    return (
        <div className="space-y-5">
            {/* 🌟 Tarjeta Principal: 1-Clic Instalador Oficial */}
            <div className="rounded-2xl bg-gradient-to-b from-[#161D2E] to-[#0E131F] border border-white/10 p-5 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-0.5 rounded-md border border-[var(--apex-gold)]/20">
                                Oficial • v1.0.0
                            </span>
                            {stats.total > 0 && (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> {stats.total} logos activos
                                </span>
                            )}
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                            Pack Oficial de Escudos y Ligas
                        </h2>
                        <p className="text-xs text-slate-400">
                            Premier League, La Liga, Serie A, Libertadores y más de 100 clubes.
                        </p>
                    </div>

                    <button
                        onClick={handleInstallOfficialPack}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-6 py-3.5 bg-[var(--apex-gold)] hover:bg-[#FFE57F] disabled:opacity-50 text-[#0A0E17] text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                <span>{progressPercent}% Instalando...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 text-black stroke-[2.5]" />
                                <span>Instalar en 1 Clic</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Barra de progreso */}
                {isProcessing && (
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 animate-fade-in">
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
            </div>

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
                        {feedbackMessage.type === 'error' && (
                            <div className="pt-1">
                                <a 
                                    href={OFFICIAL_COMMUNITY_PACK_URL} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[11px] text-[var(--apex-gold)] underline hover:opacity-80 block"
                                >
                                    📥 O haz clic aquí para descargar el .ZIP directamente y cargarlo abajo
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Opciones Secundarias Limpias: Subir ZIP o Pegar Enlace */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Botón Subir ZIP */}
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
                    className={`rounded-xl border border-dashed p-4 flex items-center gap-3.5 transition-all cursor-pointer ${
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
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-300">
                        <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                        <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
                            Subir Archivo .ZIP Local
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                            Arrastra o examina tu dispositivo
                        </div>
                    </div>
                </div>

                {/* Formulario URL */}
                <form onSubmit={handleUrlImport} className="rounded-xl border border-white/10 bg-[#0F1423]/60 p-2.5 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-300">
                        <Link2 className="w-4 h-4" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Pegar URL de imagen o .json..." 
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

            {/* Acciones de Restablecimiento */}
            {stats.total > 0 && (
                <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">
                        {stats.teams} clubes • {stats.competitions} ligas aplicadas
                    </span>
                    <button
                        onClick={handleClearAll}
                        disabled={isProcessing}
                        className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restablecer por defecto</span>
                    </button>
                </div>
            )}

            {/* Descargo de Responsabilidad Minimalista */}
            <p className="text-[10px] text-slate-500 text-center leading-relaxed pt-2">
                ⚖️ Apex AI no está afiliado con FIFA, UEFA ni clubes oficiales. Los escudos son aportes comunitarios guardados exclusivamente en tu almacenamiento local (UGC).
            </p>
        </div>
    );
};
