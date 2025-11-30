import React from 'react';
import { Screen } from '../../types';
import { DashboardIcon, SquadIcon, TransfersIcon, FinancesIcon, LeagueIcon, ChartBarIcon, SettingsIcon } from '../icons';

interface BottomNavProps {
    activeScreen: Screen;
    onNavigate: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
    const navItems = [
        { screen: Screen.Dashboard, icon: DashboardIcon, label: 'Panel' },
        { screen: Screen.Squad, icon: SquadIcon, label: 'Plantilla' },
        { screen: Screen.Transfers, icon: TransfersIcon, label: 'Fichajes' },
        { screen: Screen.League, icon: LeagueIcon, label: 'Liga' },
        { screen: Screen.Statistics, icon: ChartBarIcon, label: 'Stats' },
        { screen: Screen.Finances, icon: FinancesIcon, label: 'Finanzas' },
        { screen: Screen.Settings, icon: SettingsIcon, label: 'Ajustes' },
    ];
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 z-40">
            <div className="max-w-7xl mx-auto flex justify-around">
                {navItems.map(item => (
                    <button key={item.screen} onClick={() => onNavigate(item.screen)} className={`relative flex flex-col items-center justify-center w-full pt-3 pb-2 text-xs sm:text-sm transition-colors duration-200 ${activeScreen === item.screen ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}>
                        {activeScreen === item.screen && <div className="absolute top-0 h-0.5 w-10 bg-sky-400 rounded-full"></div>}
                        <item.icon className="h-6 w-6 mb-1" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};