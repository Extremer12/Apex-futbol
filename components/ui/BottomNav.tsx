import React, { useState } from 'react';
import { Screen } from '../../types';
import { DashboardIcon, SquadIcon, TransfersIcon, FinancesIcon, LeagueIcon, ChartBarIcon, SettingsIcon, CalendarIcon, BriefcaseIcon } from '../icons';

interface BottomNavProps {
    activeScreen: Screen;
    onNavigate: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Primary navigation items (always visible)
    const primaryItems = [
        { screen: Screen.Dashboard, icon: DashboardIcon, label: 'Panel' },
        { screen: Screen.Squad, icon: SquadIcon, label: 'Plantilla' },
        { screen: Screen.Transfers, icon: TransfersIcon, label: 'Fichajes' },
        { screen: Screen.League, icon: LeagueIcon, label: 'Competiciones' },
    ];

    // Secondary navigation items (in menu)
    const secondaryItems = [
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
            {/* Overlay when menu is open */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-fade-in"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Secondary Menu (slides up from bottom) */}
            <div className={`fixed bottom-20 left-0 right-0 z-40 transition-transform duration-300 ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-slate-800/95 backdrop-blur-lg rounded-t-2xl border-t-2 border-x-2 border-sky-500/30 shadow-2xl">
                        <div className="grid grid-cols-2 gap-2 p-4">
                            {secondaryItems.map(item => (
                                <button
                                    key={item.screen}
                                    onClick={() => handleNavigate(item.screen)}
                                    className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${activeScreen === item.screen
                                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="h-6 w-6" />
                                    <span className="font-semibold text-sm">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Primary Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t-2 border-slate-800 z-40 shadow-2xl">
                <div className="max-w-7xl mx-auto flex items-center justify-around px-2">
                    {primaryItems.map(item => (
                        <button
                            key={item.screen}
                            onClick={() => handleNavigate(item.screen)}
                            className={`relative flex flex-col items-center justify-center w-full py-3 transition-all duration-200 ${activeScreen === item.screen ? 'text-sky-400' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {activeScreen === item.screen && (
                                <div className="absolute top-0 h-1 w-12 bg-gradient-to-r from-sky-500 to-purple-500 rounded-full" />
                            )}
                            <item.icon className="h-7 w-7 mb-1" />
                            <span className="text-xs font-semibold">{item.label}</span>
                        </button>
                    ))}

                    {/* Menu Toggle Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`relative flex flex-col items-center justify-center w-full py-3 transition-all duration-200 ${isMenuOpen ? 'text-sky-400' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {isMenuOpen && (
                            <div className="absolute top-0 h-1 w-12 bg-gradient-to-r from-sky-500 to-purple-500 rounded-full" />
                        )}
                        <svg className="h-7 w-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                        <span className="text-xs font-semibold">Más</span>
                    </button>
                </div>
            </nav>
        </>
    );
};