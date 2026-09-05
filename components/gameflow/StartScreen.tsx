import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../icons';
import { AboutModal, PlaceholderModal } from './PlaceholderModals';
import { getSavedGames } from '../../services/db';

import { UserBadge } from '../auth/UserBadge';
import { LeaderboardModal } from '../leaderboard/LeaderboardModal';
import { CommunityPacksModal } from '../ui/CommunityPacksModal';
import { 
    Play, 
    FolderOpen, 
    ShieldCheck, 
    Trophy, 
    Settings, 
    Award, 
    ChevronRight 
} from 'lucide-react';

interface StartScreenProps {
    onNewGame: () => void;
    onLoadGameScreen: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onNewGame, onLoadGameScreen }) => {
    const [modal, setModal] = useState<'achievements' | 'stats' | 'about' | 'leaderboard' | 'packs' | null>(null);
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

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0A0E17]">
            {modal === 'achievements' && <PlaceholderModal title="Logros" onClose={() => setModal(null)} />}
            {modal === 'stats' && <PlaceholderModal title="Estadísticas" onClose={() => setModal(null)} />}
            {modal === 'about' && <AboutModal onClose={() => setModal(null)} />}
            {modal === 'leaderboard' && <LeaderboardModal onClose={() => setModal(null)} />}
            {modal === 'packs' && <CommunityPacksModal isOpen={true} onClose={() => setModal(null)} />}

            {/* Background layers (COMPLETELY STATIC, NO MOVEMENT) */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Background Image without animation */}
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                        backgroundImage: 'url("/bg-start.png")',
                        filter: 'brightness(0.95) saturate(1.1)'
                    }}
                />
                
                {/* Contrast overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/60 to-black/50" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-[#0A0E17]/90" />

                {/* Subtle warm center glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full opacity-20 pointer-events-none"
                     style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.3), transparent 70%)' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen max-w-xl mx-auto w-full">
                {/* Top bar (Clean, no boxes inside boxes, no Apex FC) */}
                <div className="flex justify-end items-center px-6 pt-5 pb-2 gap-3">
                    <button
                        onClick={() => setModal('packs')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121824] hover:bg-[#1A2335] text-white border border-[var(--apex-gold)]/40 hover:border-[var(--apex-gold)] transition-all shadow-md active:scale-95"
                        title="Gestionar escudos y logos reales"
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

                    {/* Packs y Logos Reales - Solid High-Contrast Card */}
                    <button 
                        onClick={() => setModal('packs')} 
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