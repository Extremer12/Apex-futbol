import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../icons';
import { AboutModal, PlaceholderModal } from './PlaceholderModals';
import { getSavedGames } from '../../services/db';

interface StartScreenProps {
    onNewGame: () => void;
    onLoadGameScreen: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onNewGame, onLoadGameScreen }) => {
    const [modal, setModal] = useState<'achievements' | 'stats' | 'about' | null>(null);
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
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--apex-dark)' }}>
            {modal === 'achievements' && <PlaceholderModal title="Logros" onClose={() => setModal(null)} />}
            {modal === 'stats' && <PlaceholderModal title="Estadísticas" onClose={() => setModal(null)} />}
            {modal === 'about' && <AboutModal onClose={() => setModal(null)} />}

            {/* Background layers */}
            <div className="absolute inset-0">
                {/* Dark gradient base */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E17] via-[#0D1220] to-[#0A0E17]" />
                {/* Subtle stadium glow at center */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
                     style={{ background: 'radial-gradient(ellipse, rgba(200,168,78,0.15), transparent 70%)' }} />
                {/* Light beams */}
                <div className="absolute top-0 left-1/4 w-px h-full opacity-5"
                     style={{ background: 'linear-gradient(to bottom, transparent, rgba(200,168,78,0.5), transparent)' }} />
                <div className="absolute top-0 right-1/4 w-px h-full opacity-5"
                     style={{ background: 'linear-gradient(to bottom, transparent, rgba(200,168,78,0.5), transparent)' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Top bar */}
                <div className="flex justify-between items-center px-5 pt-5 pb-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ border: '1px solid var(--apex-border)' }}>
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ border: '1px solid var(--apex-border)' }}>
                            <svg className="w-3.5 h-3.5 text-[var(--apex-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-white leading-none">Apex FC</div>
                            <div className="text-[9px] font-semibold leading-none" style={{ color: 'var(--apex-gold)' }}>President</div>
                        </div>
                    </div>
                </div>

                {/* Logo Section */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">
                    {/* Apex Logo */}
                    <div className="mb-2 animate-fade-in">
                        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                            <defs>
                                <linearGradient id="goldGrad" x1="0" y1="0" x2="80" y2="60">
                                    <stop offset="0%" stopColor="#FFD700" />
                                    <stop offset="50%" stopColor="#C8A84E" />
                                    <stop offset="100%" stopColor="#B8963E" />
                                </linearGradient>
                            </defs>
                            <path d="M40 4L8 56h14l18-34 18 34h14L40 4z" fill="url(#goldGrad)" />
                            <path d="M28 42h24l-12-22L28 42z" fill="url(#goldGrad)" opacity="0.4" />
                        </svg>
                    </div>

                    <h1 className="text-5xl font-black tracking-tight mb-1 animate-fade-in">
                        <span className="text-white">APEX</span>
                        <span className="ml-2 text-gold-gradient">AI</span>
                    </h1>
                    <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-16 animate-fade-in"
                       style={{ color: 'var(--apex-text-secondary)' }}>
                        Football Club President
                    </p>

                    {/* Silhouette hint */}
                    <div className="absolute bottom-[280px] left-1/2 -translate-x-1/2 w-40 h-56 opacity-[0.04]"
                         style={{
                             background: 'linear-gradient(to top, transparent, rgba(200,168,78,0.3) 40%, rgba(200,168,78,0.5) 60%, transparent)',
                             borderRadius: '40% 40% 0 0',
                             filter: 'blur(3px)',
                         }} />
                </div>

                {/* Menu Buttons */}
                <div className="px-5 pb-6 space-y-3 stagger-children">
                    {/* New Game - Featured */}
                    <button onClick={onNewGame} className="apex-btn-primary featured group">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(200,168,78,0.2), rgba(200,168,78,0.05))', border: '1px solid var(--apex-border-active)' }}>
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-gold)' }}>
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                <path strokeWidth="2" d="M12 6v12M6 12h12" />
                            </svg>
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-bold tracking-wider">NEW GAME</div>
                            <div className="text-[10px] font-medium" style={{ color: 'var(--apex-text-secondary)' }}>Start your journey to football glory</div>
                        </div>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-gold)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Load Game */}
                    <button
                        onClick={onLoadGameScreen}
                        disabled={isCheckingSaves || !hasSaves}
                        className="apex-btn-primary group disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:bg-transparent disabled:hover:shadow-none disabled:hover:border-[rgba(200,168,78,0.15)]"
                    >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            {isCheckingSaves ? (
                                <LoadingSpinner />
                            ) : (
                                <svg className="w-4.5 h-4.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-bold tracking-wider">LOAD GAME</div>
                            <div className="text-[10px] font-medium" style={{ color: 'var(--apex-text-secondary)' }}>Continue your saved career</div>
                        </div>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-text-muted)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Settings */}
                    <button onClick={() => setModal('about')} className="apex-btn-primary group">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
                            <svg className="w-4.5 h-4.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-bold tracking-wider">SETTINGS</div>
                            <div className="text-[10px] font-medium" style={{ color: 'var(--apex-text-secondary)' }}>Customize your experience</div>
                        </div>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-text-muted)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Achievements */}
                    <button onClick={() => setModal('achievements')} className="apex-btn-primary group">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                            <svg className="w-4.5 h-4.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-bold tracking-wider">ACHIEVEMENTS</div>
                            <div className="text-[10px] font-medium" style={{ color: 'var(--apex-text-secondary)' }}>Track your managerial milestones</div>
                        </div>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-text-muted)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-6 pb-5 pt-2">
                    <span className="text-[var(--apex-text-muted)] text-xs">v1.0.0</span>
                </div>
            </div>
        </div>
    );
};