import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../icons';
import { AchievementsModal } from './AchievementsModal';
import { StartSettingsModal } from './StartSettingsModal';
import { getSavedGames } from '../../services/db';
import { getCloudSaves } from '../../services/cloudSave';
import { supabase } from '../../services/supabase';

import { UserBadge } from '../auth/UserBadge';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import { LeaderboardModal } from '../leaderboard/LeaderboardModal';
import { CommunityPacksSection } from '../screens/settings/CommunityPacksSection';
import { motion } from 'framer-motion';
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

const GUEST_GATE_SESSION_KEY = 'apex_auth_gate_dismissed';

export const StartScreen: React.FC<StartScreenProps> = ({ onNewGame, onLoadGameScreen }) => {
    const { user, loading: authLoading } = useAuth();
    const [currentView, setCurrentView] = useState<'MENU' | 'PACKS'>('MENU');
    const [modal, setModal] = useState<'achievements' | 'about' | 'leaderboard' | null>(null);
    const [showWelcomeGate, setShowWelcomeGate] = useState(false);
    const [hasSaves, setHasSaves] = useState(false);
    const [isCheckingSaves, setIsCheckingSaves] = useState(true);

    // FC Mobile flow: open fullscreen sign-in gate automatically once per session when signed out
    useEffect(() => {
        if (authLoading) return;
        if (user) {
            setShowWelcomeGate(false);
            return;
        }
        try {
            if (sessionStorage.getItem(GUEST_GATE_SESSION_KEY) !== '1') {
                setShowWelcomeGate(true);
            }
        } catch {
            // Ignore storage restrictions
        }
    }, [authLoading, user]);

    const handleDismissWelcomeGate = () => {
        try {
            sessionStorage.setItem(GUEST_GATE_SESSION_KEY, '1');
        } catch {
            // Ignore storage restrictions
        }
        setShowWelcomeGate(false);
    };

    useEffect(() => {
        const checkSaves = async () => {
            setIsCheckingSaves(true);
            try {
                const saves = await getSavedGames();
                let hasAny = saves.length > 0;
                if (!hasAny) {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const cloud = await getCloudSaves();
                        hasAny = cloud.length > 0;
                    }
                }
                setHasSaves(hasAny);
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
            <div className="min-h-[100dvh] bg-[var(--apex-darker)] text-white flex flex-col animate-fade-in relative z-50">
                <main className="flex-1 w-full">
                    <CommunityPacksSection onBack={() => setCurrentView('MENU')} />
                </main>
            </div>
        );
    }

    // --- MAIN START MENU VIEW (FULLSCREEN PRO) ---
    return (
        <div className="min-h-[100dvh] w-full flex flex-col relative overflow-hidden bg-[var(--apex-darker)]">
            {showWelcomeGate && !user && (
                <AuthModal mode="fullscreen" onClose={handleDismissWelcomeGate} />
            )}
            {modal === 'achievements' && <AchievementsModal onClose={() => setModal(null)} />}
            {modal === 'about' && (
                <StartSettingsModal
                    onClose={() => setModal(null)}
                    onOpenPacks={() => setCurrentView('PACKS')}
                />
            )}
            {modal === 'leaderboard' && <LeaderboardModal onClose={() => setModal(null)} />}

            {/* Full-bleed stadium art + spotlight + film grain */}
            <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center scale-[1.02]"
                    style={{ backgroundImage: 'url("/assets/bg/home.webp")' }}
                />
                {/* Dramatic stadium vignette so logo & cards pop cleanly on any screen size */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(4,6,15,0.45) 0%, rgba(4,6,15,0.62) 38%, rgba(4,6,15,0.92) 72%, rgba(4,6,13,0.99) 100%)',
                    }}
                />
                <div
                    className="absolute -top-24 left-1/2 -translate-x-1/2 w-[120%] h-80 rounded-full blur-3xl opacity-55"
                    style={{ background: 'radial-gradient(closest-side, rgba(45,212,255,0.35), rgba(255,201,64,0.12), transparent 75%)' }}
                />
                <div className="apex-grain" />
            </div>

            {/* Main container */}
            <div className="relative z-10 flex flex-col justify-between min-h-[100dvh] max-w-lg mx-auto w-full px-5 pt-safe pb-5">
                {/* Top bar */}
                <div className="flex items-center justify-end pt-4 pb-2">
                    <UserBadge mode="fullscreen" />
                </div>

                {/* Brand Hero Showcase */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-4"
                >
                    <div className="relative flex items-center justify-center mb-3">
                        <div
                            aria-hidden
                            className="absolute w-56 h-32 rounded-full blur-2xl opacity-50"
                            style={{ background: 'radial-gradient(closest-side, rgba(255,201,64,0.35), rgba(45,212,255,0.2), transparent)' }}
                        />
                        <img
                            src="/assets/logo.webp"
                            alt="Apex AI — Football Club President"
                            className="relative w-56 sm:w-64 h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
                        />
                    </div>
                    <p className="text-xs font-medium text-[var(--apex-text-secondary)] max-w-xs leading-relaxed">
                        Dirige las finanzas, el vestuario y el mercado de un club profesional.
                    </p>
                </motion.div>

                {/* Menu Action Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                    className="space-y-2.5 pb-2"
                >
                    {/* Nueva Partida - Primary Gold CTA with Shine */}
                    <button
                        type="button"
                        onClick={onNewGame}
                        className="apex-btn-gold apex-shine w-full !p-4 !rounded-2xl !justify-between group"
                    >
                        <div className="flex items-center gap-3.5 text-left">
                            <div className="w-11 h-11 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
                                <Play className="w-5 h-5 text-[#1A1204] fill-[#1A1204]" />
                            </div>
                            <div>
                                <div className="font-display text-xl font-extrabold tracking-wide uppercase italic text-[#1A1204] leading-none mb-0.5">
                                    Nueva Partida
                                </div>
                                <div className="text-[11px] font-bold text-[#1A1204]/75 normal-case tracking-normal leading-tight">
                                    Comienza tu carrera presidencial
                                </div>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-black/15 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                            <ChevronRight className="w-5 h-5 text-[#1A1204] stroke-[2.75]" />
                        </div>
                    </button>

                    {/* Cargar Partida */}
                    <button
                        type="button"
                        onClick={onLoadGameScreen}
                        disabled={isCheckingSaves || !hasSaves}
                        className="apex-card w-full p-3.5 flex items-center justify-between group cursor-pointer hover:border-[var(--apex-brand)]/45 transition-all disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-3.5 text-left">
                            <div className="w-10 h-10 rounded-xl bg-[var(--apex-brand)]/15 border border-[var(--apex-brand)]/30 flex items-center justify-center shrink-0">
                                {isCheckingSaves ? (
                                    <LoadingSpinner />
                                ) : (
                                    <FolderOpen className="w-5 h-5 text-[var(--apex-brand)]" />
                                )}
                            </div>
                            <div>
                                <div className="font-display text-base font-extrabold tracking-wide uppercase italic text-white leading-none mb-0.5">
                                    Cargar Partida
                                </div>
                                <div className="text-[11px] font-medium text-[var(--apex-text-secondary)] leading-tight">
                                    {isCheckingSaves ? 'Verificando partidas...' : hasSaves ? 'Continúa tu carrera guardada' : 'No hay partidas guardadas'}
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[var(--apex-text-muted)] group-hover:text-[var(--apex-brand)] group-hover:translate-x-1 transition-all shrink-0" />
                    </button>

                    {/* Packs y Logos Reales */}
                    <button
                        type="button"
                        onClick={() => setCurrentView('PACKS')}
                        className="apex-card w-full p-3.5 flex items-center justify-between group cursor-pointer hover:border-[var(--apex-gold)]/50 transition-all active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-3.5 text-left">
                            <div className="w-10 h-10 rounded-xl bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/30 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5 text-[var(--apex-gold)]" />
                            </div>
                            <div>
                                <div className="font-display text-base font-extrabold tracking-wide uppercase italic text-white flex items-center gap-2 leading-none mb-0.5">
                                    <span>Packs y Logos Reales</span>
                                    <span className="apex-chip apex-chip-premium !py-0 !px-1.5 !text-[8px]">
                                        Comunidad
                                    </span>
                                </div>
                                <div className="text-[11px] font-medium text-[var(--apex-text-secondary)] leading-tight">
                                    Escudos oficiales, copas y fotos de jugadores
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[var(--apex-gold)] group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>

                    {/* Salón de la Fama */}
                    <button
                        type="button"
                        onClick={() => setModal('leaderboard')}
                        className="apex-card w-full p-3.5 flex items-center justify-between group cursor-pointer hover:border-[var(--apex-gold)]/50 transition-all active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-3.5 text-left">
                            <div className="w-10 h-10 rounded-xl bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/30 flex items-center justify-center shrink-0">
                                <Trophy className="w-5 h-5 text-[var(--apex-gold-light)]" />
                            </div>
                            <div>
                                <div className="font-display text-base font-extrabold tracking-wide uppercase italic text-premium-gradient leading-none mb-0.5">
                                    Salón de la Fama
                                </div>
                                <div className="text-[11px] font-medium text-[var(--apex-text-secondary)] leading-tight">
                                    Ranking mundial de presidentes
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[var(--apex-gold)] group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>

                    {/* Quick Secondary Row (Ajustes + Logros) */}
                    <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                        <button
                            type="button"
                            onClick={() => setModal('about')}
                            className="apex-card p-3 hover:border-white/30 transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
                        >
                            <Settings className="w-4 h-4 text-[var(--apex-text-secondary)] group-hover:text-white transition-colors" />
                            <span className="font-display text-sm font-extrabold uppercase tracking-wider text-slate-200 group-hover:text-white">
                                Ajustes
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setModal('achievements')}
                            className="apex-card p-3 hover:border-[var(--apex-brand)]/40 transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
                        >
                            <Award className="w-4 h-4 text-[var(--apex-brand)]" />
                            <span className="font-display text-sm font-extrabold uppercase tracking-wider text-slate-200 group-hover:text-[var(--apex-brand)] transition-colors">
                                Logros
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-3 pt-2 text-[var(--apex-text-muted)] text-[10px] font-bold uppercase tracking-widest">
                    <span>Apex AI</span>
                    <span>•</span>
                    <span>v1.0.0</span>
                </div>
            </div>
        </div>
    );
};
