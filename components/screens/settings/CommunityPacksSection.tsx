import React, { useState, useEffect, useRef } from 'react';
import { customPacksService } from '../../../services/customPacks/packService';
import { supabase } from '../../../services/supabase';
import { TrophyIcon, SparklesIcon, TrashIcon } from '../../icons';

interface CommunityPackEntry {
    id: string;
    title: string;
    description: string | null;
    author_name: string;
    manifest_url: string;
    downloads_count: number;
    category: string;
}

const OFFICIAL_COMMUNITY_PACK_URL = 'https://github.com/Extremer12/community-data-packs/releases/download/v1.0.0/football-logos-master.zip';

export const CommunityPacksSection: React.FC = () => {
    const [stats, setStats] = useState({ teams: 0, competitions: 0, players: 0, total: 0 });
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [progressStatus, setProgressStatus] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showHelpGuide, setShowHelpGuide] = useState(false);
    const [onlinePacks, setOnlinePacks] = useState<CommunityPackEntry[]>([]);
    const [isLoadingOnlinePacks, setIsLoadingOnlinePacks] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshStats = async () => {
        const s = await customPacksService.getStats();
        setStats(s);
    };

    const fetchOnlinePacks = async () => {
        setIsLoadingOnlinePacks(true);
        try {
            const { data, error } = await supabase
                .from('community_packs')
                .select('*')
                .order('downloads_count', { ascending: false })
                .limit(10);
            if (!error && data) {
                setOnlinePacks(data as CommunityPackEntry[]);
            }
        } catch (e) {
            console.error('Error fetching community packs from Supabase:', e);
        } finally {
            setIsLoadingOnlinePacks(false);
        }
    };

    useEffect(() => {
        refreshStats();
        fetchOnlinePacks();
        const unsubscribe = customPacksService.subscribe(refreshStats);
        return () => unsubscribe();
    }, []);

    const handleInstallOfficialPack = async () => {
        setIsProcessing(true);
        setProgressPercent(0);
        setProgressStatus('Iniciando conexión con GitHub Releases...');
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
                text: `¡Éxito! Se descargó e instaló el Pack Oficial de la Comunidad (${result.importedCount} escudos aplicados en tu dispositivo).`
            });
            await refreshStats();
        } catch (err: any) {
            setFeedbackMessage({
                type: 'error',
                text: err.message || 'Error al descargar o instalar el paquete oficial.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileSelect = async (file: File) => {
        if (!file.name.toLowerCase().endsWith('.zip')) {
            setFeedbackMessage({ type: 'error', text: 'Por favor selecciona un archivo comprimido .ZIP válido.' });
            return;
        }

        setIsProcessing(true);
        setProgressPercent(0);
        setProgressStatus('Iniciando lectura de ZIP...');
        setFeedbackMessage(null);

        try {
            const result = await customPacksService.importZipPack(file, (pct, status) => {
                setProgressPercent(pct);
                setProgressStatus(status);
            });

            setFeedbackMessage({
                type: 'success',
                text: `¡Éxito! Se importaron ${result.importedCount} archivos de imagen al juego.`
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
        setProgressStatus('Conectando con URL...');
        setFeedbackMessage(null);

        try {
            const result = await customPacksService.importUrlPack(urlInput.trim(), (pct, status) => {
                setProgressPercent(pct);
                setProgressStatus(status);
            });

            setFeedbackMessage({
                type: 'success',
                text: `¡Éxito! Se cargaron ${result.importedCount} logos desde el manifiesto remoto.`
            });
            setUrlInput('');
            await refreshStats();
        } catch (err: any) {
            setFeedbackMessage({
                type: 'error',
                text: err.message || 'Error al descargar o procesar el manifiesto online.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const installCommunityPack = async (pack: CommunityPackEntry) => {
        setIsProcessing(true);
        setProgressPercent(0);
        setProgressStatus(`Descargando "${pack.title}"...`);
        setFeedbackMessage(null);

        try {
            const result = await customPacksService.importUrlPack(pack.manifest_url, (pct, status) => {
                setProgressPercent(pct);
                setProgressStatus(status);
            });

            setFeedbackMessage({
                type: 'success',
                text: `¡Éxito! Se instaló el pack "${pack.title}" (${result.importedCount} logos aplicados).`
            });

            await supabase
                .from('community_packs')
                .update({ downloads_count: (pack.downloads_count || 0) + 1 })
                .eq('id', pack.id);

            await refreshStats();
            fetchOnlinePacks();
        } catch (err: any) {
            setFeedbackMessage({
                type: 'error',
                text: err.message || 'Error al descargar el pack comunitario.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportZip = async () => {
        if (stats.total === 0) {
            setFeedbackMessage({ type: 'error', text: 'No tienes ningún logo personalizado cargado para exportar.' });
            return;
        }

        try {
            setIsProcessing(true);
            setProgressStatus('Empaquetando logos...');
            setProgressPercent(50);
            const blob = await customPacksService.exportZipPack();
            
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `ApexAI_CommunityPack_${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

            setFeedbackMessage({ type: 'success', text: '¡Paquete .ZIP exportado y descargado!' });
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: 'Error al generar el archivo .ZIP: ' + err.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar todos los logos personalizados y volver a los escudos por defecto?')) {
            return;
        }

        try {
            await customPacksService.clearAllPacks();
            setFeedbackMessage({ type: 'success', text: 'Se restablecieron todos los logos a los valores por defecto.' });
            await refreshStats();
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: 'Error al limpiar los logos: ' + err.message });
        }
    };

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl backdrop-blur-md">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-[var(--apex-gold)]" />
                        <h2 className="text-lg font-black text-white uppercase tracking-wider">
                            Packs de la Comunidad y Logos
                        </h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Personaliza escudos de clubes, copas y caras de jugadores importando packs externos.
                    </p>
                </div>
                <button
                    onClick={() => setShowHelpGuide(!showHelpGuide)}
                    className="text-xs text-[var(--apex-gold)] hover:underline font-bold uppercase tracking-wider self-start sm:self-auto cursor-pointer"
                >
                    {showHelpGuide ? 'Ocultar Guía' : '¿Cómo nombrar los archivos?'}
                </button>
            </div>

            {/* Guía Desplegable */}
            {showHelpGuide && (
                <div className="bg-slate-950/80 border border-sky-500/30 rounded-xl p-4 text-xs space-y-3 animate-fade-in text-slate-300">
                    <p className="font-bold text-sky-400 uppercase tracking-wider">📁 Formato admitido en el archivo .ZIP:</p>
                    <p>El juego detecta automáticamente los archivos por su nombre o ID sin importar mayúsculas ni acentos:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900 p-3 rounded-lg border border-white/5 font-mono text-[11px]">
                        <div>
                            <span className="text-yellow-400 font-bold block mb-1">Por Nombre / Slug:</span>
                            <ul className="space-y-1 text-slate-400 list-disc list-inside">
                                <li><code>boca_juniors.png</code></li>
                                <li><code>real_madrid.png</code></li>
                                <li><code>champions_league.png</code></li>
                            </ul>
                        </div>
                        <div>
                            <span className="text-yellow-400 font-bold block mb-1">Por ID de Base de Datos:</span>
                            <ul className="space-y-1 text-slate-400 list-disc list-inside">
                                <li><code>701.png</code> (Boca Juniors)</li>
                                <li><code>PREMIER_LEAGUE.png</code></li>
                                <li><code>LA_LIGA.svg</code></li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Estadísticas de Logos Activos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/40 border border-white/5 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Clubes</span>
                    <span className="text-2xl font-black text-white">{stats.teams}</span>
                </div>
                <div className="bg-slate-800/40 border border-white/5 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ligas y Copas</span>
                    <span className="text-2xl font-black text-white">{stats.competitions}</span>
                </div>
                <div className="bg-slate-800/40 border border-white/5 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Jugadores</span>
                    <span className="text-2xl font-black text-white">{stats.players}</span>
                </div>
                <div className="bg-slate-800/40 border border-white/5 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-[var(--apex-gold)] uppercase tracking-widest block">Total Activo</span>
                    <span className="text-2xl font-black text-[var(--apex-gold)]">{stats.total}</span>
                </div>
            </div>

            {/* 🌟 Botón Destacado: Instalador en 1 Clic Estilo Super Kickoff */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--apex-gold)]/40 bg-gradient-to-br from-[var(--apex-gold)]/15 via-slate-900/90 to-slate-950 p-6 shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[var(--apex-gold)] text-slate-950">
                                Recomendado • 1 Clic
                            </span>
                            <span className="text-[10px] font-bold text-sky-400">GitHub Release Oficial v1.0.0</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                            Pack Oficial de la Comunidad (Escudos y Ligas)
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Descarga e instala automáticamente el paquete completo de logos de clubes y competiciones en el almacenamiento de tu dispositivo.
                        </p>
                    </div>

                    <button
                        onClick={handleInstallOfficialPack}
                        disabled={isProcessing}
                        className="px-6 py-3.5 bg-gradient-to-r from-[var(--apex-gold)] via-yellow-400 to-[var(--apex-gold)] hover:from-yellow-300 hover:to-yellow-500 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[var(--apex-gold)]/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 flex-shrink-0 cursor-pointer"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                <span>Instalando...</span>
                            </>
                        ) : (
                            <>
                                <TrophyIcon className="w-4 h-4" />
                                <span>Descargar e Instalar Pack</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Barra de Progreso Activa */}
            {isProcessing && (
                <div className="space-y-2 bg-slate-950/80 p-4 rounded-xl border border-[var(--apex-gold)]/30 animate-fade-in shadow-lg">
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-200 truncate flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-[var(--apex-gold)] animate-pulse" />
                            {progressStatus}
                        </span>
                        <span className="text-[var(--apex-gold)]">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-[var(--apex-gold)] via-yellow-400 to-amber-300 h-full transition-all duration-300 rounded-full" 
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Mensajes de Feedback */}
            {feedbackMessage && (
                <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-3 animate-fade-in ${
                    feedbackMessage.type === 'success' 
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                        : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                    <span>{feedbackMessage.type === 'success' ? '✅' : '⚠️'}</span>
                    <span className="flex-1">{feedbackMessage.text}</span>
                </div>
            )}

            {/* Zona Drag & Drop para .ZIP personalizado (Secundaria) */}
            <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    O Cargar Tu Propio Archivo .ZIP Local
                </span>
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
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                        isDragOver 
                            ? 'border-[var(--apex-gold)] bg-[var(--apex-gold)]/10 scale-[1.01]' 
                            : 'border-white/15 bg-slate-950/40 hover:border-white/30 hover:bg-slate-950/60'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} 
                        accept=".zip" 
                        className="hidden" 
                    />
                    <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                        Arrastra tu archivo .ZIP personalizado aquí
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-3">
                        o haz clic para buscar en tus archivos locales
                    </p>
                    <button 
                        type="button" 
                        className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                        Examinar Dispositivo
                    </button>
                </div>
            </div>

            {/* Galería de Packs de la Comunidad (Supabase) */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span>🌐</span> Otros Packs en la Nube
                    </span>
                    <button
                        onClick={fetchOnlinePacks}
                        disabled={isLoadingOnlinePacks}
                        className="text-[10px] font-bold text-sky-400 hover:text-sky-300 uppercase tracking-wider cursor-pointer"
                    >
                        {isLoadingOnlinePacks ? 'Actualizando...' : 'Refrescar'}
                    </button>
                </div>

                {onlinePacks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {onlinePacks.map((pack) => (
                            <div key={pack.id} className="bg-slate-950/60 border border-white/10 rounded-xl p-3 flex flex-col justify-between hover:border-[var(--apex-gold)]/40 transition-colors">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-xs font-bold text-white truncate">{pack.title}</h4>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 uppercase font-bold">
                                            {pack.category || 'logos'}
                                        </span>
                                    </div>
                                    {pack.description && (
                                        <p className="text-[10px] text-slate-400 line-clamp-2 mb-2">{pack.description}</p>
                                    )}
                                    <div className="text-[9px] text-slate-500 flex items-center justify-between">
                                        <span>Por: {pack.author_name}</span>
                                        <span>⬇️ {pack.downloads_count || 0} descargas</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => installCommunityPack(pack)}
                                    disabled={isProcessing}
                                    className="mt-3 w-full py-1.5 bg-gradient-to-r from-[var(--apex-gold)] to-yellow-500 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-md"
                                >
                                    Instalar en 1 Clic
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-950/40 border border-dashed border-white/10 rounded-xl p-4 text-center">
                        <p className="text-xs text-slate-400">
                            Aún no hay packs públicos registrados en la nube. ¡Puedes importar tu propio .ZIP o pegar una URL directa abajo!
                        </p>
                    </div>
                )}
            </div>

            {/* Importar desde URL */}
            <form onSubmit={handleUrlImport} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    O Importar mediante URL de Manifiesto Online o Enlace Directo
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative flex items-center">
                        <input 
                            type="text" 
                            placeholder="https://.../pack.json o enlace de imagen" 
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            disabled={isProcessing}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-4 pr-20 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)] transition-colors"
                        />
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const text = await navigator.clipboard.readText();
                                    if (text) setUrlInput(text.trim());
                                } catch (err) {
                                    // Clipboard API permission denied fallback
                                    console.warn("Could not read clipboard", err);
                                }
                            }}
                            className="absolute right-2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-wider text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Pegar enlace copiado"
                        >
                            <span>📋</span> Pegar
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={isProcessing || !urlInput.trim()}
                        className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-sky-600/20 cursor-pointer"
                    >
                        Cargar Enlace
                    </button>
                </div>
            </form>

            {/* Acciones de Exportación y Restablecimiento */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                <button
                    onClick={handleExportZip}
                    disabled={isProcessing || stats.total === 0}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-white/10"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Exportar Pack .ZIP
                </button>

                {stats.total > 0 && (
                    <button
                        onClick={handleClearAll}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-red-500/30"
                    >
                        <TrashIcon className="w-4 h-4" />
                        Restablecer Logos por Defecto
                    </button>
                )}
            </div>

            {/* Aviso Legal y Descargo de Responsabilidad (Modelo UGC / Safe Harbor) */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 text-[10px] text-slate-400 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300 text-[10px]">
                    <span>⚖️</span>
                    <span>Descargo de Responsabilidad y Cumplimiento Legal (UGC)</span>
                </div>
                <p>
                    Apex AI es un simulador independiente no afiliado, respaldado ni asociado con FIFA, UEFA, CONMEBOL, ligas oficiales ni clubes de fútbol.
                    Todos los nombres, marcas registradas y escudos pertenecen a sus respectivos propietarios.
                    Esta función opera bajo el principio de <strong>Contenido Generado por el Usuario (UGC)</strong> y uso personal en almacenamiento local ({'IndexedDB'}).
                </p>
            </div>
        </div>
    );
};
