import React, { useState } from 'react';
import { Screen, Team } from '../../types';
import { DashboardIcon, SquadIcon, TransfersIcon, FinancesIcon, LeagueIcon, ChartBarIcon, SettingsIcon, CalendarIcon, BriefcaseIcon } from '../icons';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Shield } from 'lucide-react';
import { TeamLogo } from '../../data/teams/helpers';

interface BottomNavProps {
    activeScreen: Screen;
    onNavigate: (screen: Screen) => void;
    team?: Team;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate, team }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const primaryItems = [
        { screen: Screen.Dashboard, icon: DashboardIcon, label: 'Inicio' },
        { screen: Screen.Squad, icon: SquadIcon, label: 'Plantel' },
        { screen: Screen.Transfers, icon: TransfersIcon, label: 'Fichajes' },
        { screen: Screen.League, icon: LeagueIcon, label: 'Torneos' },
    ];

    const secondaryItems = [
        { screen: Screen.Club, isClub: true, label: 'Club' },
        { screen: Screen.Trophies, icon: History, label: 'Historial' },
        { screen: Screen.Calendar, icon: CalendarIcon, label: 'Calendario' },
        { screen: Screen.Statistics, icon: ChartBarIcon, label: 'Estadísticas' },
        { screen: Screen.Finances, icon: FinancesIcon, label: 'Finanzas' },
        { screen: Screen.Staff, icon: BriefcaseIcon, label: 'Personal' },
        { screen: Screen.Settings, icon: SettingsIcon, label: 'Ajustes' },
    ];

    const handleNavigate = (screen: Screen) => {
        onNavigate(screen);
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* Overlay with Framer Motion */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-30"
                        style={{ background: 'rgba(6,10,18,0.7)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                        onClick={() => setIsMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Secondary Menu with Framer Motion */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-20 left-0 right-0 z-40"
                    >
                        <div className="max-w-md mx-auto px-4 mb-2">
                            <div className="rounded-2xl shadow-2xl p-4"
                                 style={{ background: 'rgba(15,20,35,0.95)', backdropFilter: 'blur(20px)', border: '1px solid var(--apex-border)', borderBottom: 'none' }}>
                                <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                                    {secondaryItems.map(item => {
                                        const isActive = activeScreen === item.screen;
                                        return (
                                            <motion.button
                                                whileTap={{ scale: 0.92 }}
                                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                                key={item.screen}
                                                onClick={() => handleNavigate(item.screen)}
                                                className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl transition-colors duration-200 cursor-pointer"
                                                style={{
                                                    background: isActive ? 'rgba(200,168,78,0.1)' : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${isActive ? 'var(--apex-gold)' : 'var(--apex-border)'}`
                                                }}
                                            >
                                                {item.isClub ? (
                                                    team ? (
                                                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                                                            <TeamLogo team={team} className="w-full h-full object-contain drop-shadow" />
                                                        </div>
                                                    ) : (
                                                        <Shield className="w-5 h-5 text-[var(--apex-gold)]" />
                                                    )
                                                ) : item.icon ? (
                                                    <item.icon className="h-5 w-5" style={{ color: isActive ? 'var(--apex-gold)' : 'var(--apex-text)' }} />
                                                ) : null}
                                                <span className="font-bold text-[8px] sm:text-[9px] uppercase tracking-wider truncate w-full text-center"
                                                      style={{ color: isActive ? 'var(--apex-gold)' : 'var(--apex-text-secondary)' }}>
                                                    {item.label}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Primary Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
                 style={{ background: 'rgba(10,14,23,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--apex-border)' }}>
                <div className="max-w-md mx-auto flex items-center justify-between px-2">
                    {primaryItems.map(item => {
                        const isActive = activeScreen === item.screen;
                        return (
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                key={item.screen}
                                onClick={() => handleNavigate(item.screen)}
                                className="relative flex flex-col items-center justify-center flex-1 py-3 cursor-pointer"
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute top-0 h-[2px] w-8 rounded-b-full shadow-[0_0_10px_rgba(200,168,78,0.5)]"
                                        style={{ background: 'var(--apex-gold)' }} 
                                    />
                                )}
                                <div className="relative mb-1">
                                    <item.icon className="h-6 w-6" style={{ color: isActive ? 'var(--apex-gold)' : 'var(--apex-text-muted)' }} />
                                    {isActive && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 0.2, scale: 1 }}
                                            className="absolute inset-0 bg-yellow-500 blur-md" 
                                        />
                                    )}
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider"
                                      style={{ color: isActive ? 'var(--apex-gold)' : 'var(--apex-text-muted)' }}>
                                    {item.label}
                                </span>
                            </motion.button>
                        );
                    })}

                    {/* Menu Toggle Button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="relative flex flex-col items-center justify-center flex-1 py-3 cursor-pointer"
                    >
                        {isMenuOpen && (
                            <div className="absolute top-0 h-[2px] w-8 rounded-b-full shadow-[0_0_10px_rgba(200,168,78,0.5)]"
                                 style={{ background: 'var(--apex-gold)' }} />
                        )}
                        <div className="relative mb-1">
                            <motion.div
                                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                                transition={{ type: 'spring', damping: 20 }}
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: isMenuOpen ? 'var(--apex-gold)' : 'var(--apex-text-muted)' }}>
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </motion.div>
                            {isMenuOpen && (
                                <div className="absolute inset-0 bg-yellow-500 blur-md opacity-20" />
                            )}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider"
                              style={{ color: isMenuOpen ? 'var(--apex-gold)' : 'var(--apex-text-muted)' }}>
                            Más
                        </span>
                    </motion.button>
                </div>
            </nav>
        </>
    );
};