import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../icons';
import { AboutModal, PlaceholderModal } from './PlaceholderModals';
import { getSavedGames } from '../../services/db';

import { UserBadge } from '../auth/UserBadge';
import { LeaderboardModal } from '../leaderboard/LeaderboardModal';
import { CommunityPacksSection } from '../screens/settings/CommunityPacksSection';
import { 
    Play, 
    FolderOpen, 
    ShieldCheck, 
    Trophy, 
    Settings, 
    Award, 
    ChevronRight,
    ArrowLeft
} from 'lucide-react';

interface StartScreenProps {
    onNewGame: () => void;
    onLoadGameScreen: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onNewGame, onLoadGameScreen }) => {
    const [currentView, setCurrentView] = useState<'MENU' | 'PACKS'>('MENU');
    const [modal, setModal] = useState<'achievements' | 'stats' | 'about' | 'leaderboard' | null>(null);
    const [hasSaves, setHasSaves] = useState(false);
    const [isCheckingSaves, setIsCheckingSaves] = useState(true);

    useEffect(() => {
        const checkSaves = async () => {
            setIsCheckingSaves(true);
            try {
                const saves = await getSavedGames();
                setHasSaves(saves.length > 0);
            } catch (e) {
                console.error("Failed to check for saved games", e);
                setHasSaves(false);
            } finally {
                setIsCheckingSaves(false);
            }
        };
        checkSaves();
    }, []);

    // --- FULL SCREEN PACKS VIEW ---
    if (currentView === 'PACKS') {
        return (
            <div className="min-h-screen bg-[#0A0E17] text-white flex flex-col animate-fade-in relative z-50">
                {/* Full-screen top header */}
                <header className="sticky top-0 z-30 bg-[#0F1423]/90 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentView('MENU')}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--apex-gold)] text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                            >
                                <ArrowLeft className="w-4 h-4 text-[var(--apex-gold)]" />
                                <span>Volver al Menú</span>
                            </button>
                            <div className="h-6 w-px bg-white/10 hidden sm:block" />
                            <div>
                                <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <span>Packs y Logos Reales</span>
                                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 uppercase tracking-widest">
                                        Comunidad
                                    </span>
                                </h1>
                                <p className="text-[11px] text-slate-400 hidden sm:block">
                                    Gestor de escudos oficiales, trofeos de copa y fotos reales de futbolistas
                                </p>
                            </div>
                        </div>

                        <UserBadge />
                    </div>
                </header>

                {/* Full-screen Content Container */}
                <main className="flex-1 max-w-6xl mx-auto w-full p-6 sm:p-8 space-y-6">
                    <CommunityPacksSection />
                </main>
            </div>
        );
    }

    // --- MAIN START MENU VIEW ---
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0A0E17]">
            {modal === 'achievements' && <PlaceholderModal title="Logros" onClose={() => setModal(null)} />}
            {modal === 'stats' && <PlaceholderModal title="Estadísticas" onClose={() => setModal(null)} />}
            {modal === 'about' && <AboutModal onClose={() => setModal(null)} />}
            {modal === 'leaderboard' && <LeaderboardModal onClose={() => setModal(null)} />}

            {/* Background layers (COMPLETELY STATIC, NO MOVEMENT, PERFECT TOP CLARITY) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Background Image positioned cleanly at top */}
                <div 
                    className="absolute inset-0"
                    style={{ 
                        backgroundImage: 'url("/bg-inicio.png")',
                        backgroundSize: 'min(100vw, 620px) auto',
                        backgroundPosition: 'top center',
                        backgroundRepeat: 'no-repeat',
                        filter: 'brightness(1.05) contrast(1.02)'
                    }}
                />
                
                {/* Smooth bottom-only fade so top remains 100% visible and bright */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] from-30% via-[#0A0E17]/85 via-55% to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen max-w-xl mx-auto w-full">
                {/* Top bar (Clean, no boxes inside boxes, no Apex FC) */}
                <div className="flex justify-end items-center px-6 pt-5 pb-2 gap-3">
                    <button
                        onClick={() => setCurrentView('PACKS')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121824] hover:bg-[#1A2335] text-white border border-[var(--apex-gold)]/40 hover:border-[var(--apex-gold)] transition-all shadow-md active:scale-95 cursor-pointer"
                        title="Gestionar escudos y logos reales a pantalla completa"
                    >
                        <ShieldCheck className="w-4 h-4 text-[var(--apex-gold)]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)]">Logos & Packs</span>
                    </button>
                    <UserBadge />
                </div>

                {/* Spacer to keep game logo from background visible */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-2">
                    <div className="h-44 sm:h-52" />
                </div>

                {/* Menu Action Cards */}
                <div className="px-5 pb-8 space-y-3">
                    {/* Nueva Partida - Solid Luxury Gold Background with Black Text */}
                    <button 
                        onClick={onNewGame} 
                        className="w-full p-4 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-[0_0_25px_rgba(247,192,66,0.4)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between group cursor-pointer"
                        style={{
                            background: 'linear-gradient(135deg, #FCE881 0%, #F5C84C 50%, #D4AF37 100%)',
                            border: '1px solid #FFE885'
                        }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center">
                                <Play className="w-5 h-5 text-black fill-black" />
                            </div>
                            <div className="text-left">
                                <div className="text-base font-black tracking-wider uppercase italic text-black leading-none mb-1">
                                    Nueva Partida
                                </div>
                                <div className="text-xs font-bold text-black/75 leading-tight">
                                    Comienza tu carrera presidencial
                                </div>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-5 h-5 text-black stroke-[3]" />
                        </div>
                    </button>

                    {/* Cargar Partida - Solid High-Contrast Card */}
                    <button
                        onClick={onLoadGameScreen}
                        disabled={isCheckingSaves || !hasSaves}
                        className="w-full p-4 rounded-2xl bg-[#121824] hover:bg-[#182132] border border-white/15 hover:border-[var(--apex-gold)]/60 transition-all duration-200 shadow-lg flex items-center justify-between group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                                {isCheckingSaves ? (
                                    <LoadingSpinner />
                                ) : (
                                    <FolderOpen className="w-5 h-5 text-blue-400" />
                                )}
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-black tracking-wider uppercase italic text-white leading-none mb-1">
                                    Cargar Partida
                                </div>
                                <div className="text-xs font-bold text-slate-400 leading-tight">
                                    {isCheckingSaves ? 'Verificando partidas...' : hasSaves ? 'Continúa tu carrera guardada' : 'No hay partidas guardadas'}
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>

                    {/* Packs y Logos Reales - Pantalla Completa */}
                    <button 
                        onClick={() => setCurrentView('PACKS')} 
                        className="w-full p-4 rounded-2xl bg-[#121824] hover:bg-[#182132] border border-[var(--apex-gold)]/30 hover:border-[var(--apex-gold)] transition-all duration-200 shadow-lg flex items-center justify-between group cursor-pointer active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--apex-gold)]/15 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-[var(--apex-gold)]" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-black tracking-wider uppercase italic text-white flex items-center gap-2 leading-none mb-1">
                                    <span>Packs y Logos Reales</span>
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] uppercase tracking-wider">
                                        Comunidad
                                    </span>
                                </div>
                                <div className="text-xs font-bold text-slate-400 leading-tight">
                                    Escudos oficiales, copas y fotos de jugadores
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[var(--apex-gold)] group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Salón de la Fama - Ranking */}
                    <button 
                        onClick={() => setModal('leaderboard')} 
                        className="w-full p-4 rounded-2xl bg-[#121824] hover:bg-[#182132] border border-white/15 hover:border-amber-400/50 transition-all duration-200 shadow-lg flex items-center justify-between group cursor-pointer active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-black tracking-wider uppercase italic text-amber-400 leading-none mb-1">
                                    Salón de la Fama
                                </div>
                                <div className="text-xs font-bold text-slate-400 leading-tight">
                                    Ranking mundial de presidentes
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Quick Secondary Row (Ajustes + Logros) */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <button 
                            onClick={() => setModal('about')} 
                            className="p-3 rounded-xl bg-[#121824] hover:bg-[#182132] border border-white/10 hover:border-white/30 transition-all duration-200 shadow-md flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
                        >
                            <Settings className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-200 group-hover:text-white">Ajustes</span>
                        </button>
                        <button 
                            onClick={() => setModal('achievements')} 
                            className="p-3 rounded-xl bg-[#121824] hover:bg-[#182132] border border-white/10 hover:border-purple-400/50 transition-all duration-200 shadow-md flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
                        >
                            <Award className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-200 group-hover:text-purple-300">Logros</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-4 pb-5 pt-1 text-slate-500 text-[10px] font-bold">
                    <span>Apex AI Football President</span>
                    <span>•</span>
                    <span>v1.0.0</span>
                </div>
            </div>
        </div>
    );
};