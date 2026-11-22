import React, { useState, useMemo } from 'react';
import { GameState, Screen } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { getClubHistoricalHonours } from '../../data/historicalHonours';
import { useGameStore } from '../../state/gameStore';
import { TrophyTabType } from './trophies/trophiesUiTypes';
import { TrophyCabinetTab } from './trophies/TrophyCabinetTab';
import { SeasonHistoryTab } from './trophies/SeasonHistoryTab';
import { CompetitionPalmaresTab } from './trophies/CompetitionPalmaresTab';
import { AchievementsTab } from './trophies/AchievementsTab';

interface TrophyRoomScreenProps {
    gameState: GameState;
    onNavigate?: (screen: Screen) => void;
}

export const TrophyRoomScreen: React.FC<TrophyRoomScreenProps> = ({ gameState, onNavigate }) => {
    const { team, achievements = [], seasonHistory = [] } = gameState;
    const setActiveScreen = useGameStore(s => s.setActiveScreen);
    const nav = onNavigate || setActiveScreen;

    const [activeTab, setActiveTab] = useState<TrophyTabType>('TROPHIES');

    const trophies = team.trophyCabinet || [];
    const clubHonours = useMemo(() => getClubHistoricalHonours(team.name), [team.name]);
    const totalHonoursCount = (clubHonours ? clubHonours.totalOfficialTitles : 0) + trophies.length;
    const unlockedAchievementsCount = useMemo(() => achievements.filter(a => a.isUnlocked).length, [achievements]);

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4 pb-24 animate-fade-in max-w-5xl mx-auto">
            {/* 1. COMPACT HEADER */}
            <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => nav(Screen.Club)}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white shrink-0 cursor-pointer"
                        title="Volver al Club"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">Historial y Palmarés</h1>
                        <span className="text-[11px] font-bold text-slate-400 truncate block">
                            {team.name} · {seasonHistory.length} temporadas archivadas
                        </span>
                    </div>
                </div>

                <div className="px-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 text-right shrink-0">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">Títulos</span>
                    <span className="text-sm font-black text-[var(--apex-gold)] leading-none tabular-nums">
                        {totalHonoursCount}
                    </span>
                </div>
            </header>

            {/* 2. STICKY TABS */}
            <nav className="sticky top-0 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-1.5 bg-[var(--apex-darker,#070A13)]/95 backdrop-blur">
                <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-2xl">
                    {([
                        { id: 'TROPHIES', label: 'Vitrina', badge: totalHonoursCount },
                        { id: 'HISTORY', label: 'Historial', badge: seasonHistory.length },
                        { id: 'COMPETITIONS', label: 'Palmarés', badge: 0 },
                        { id: 'ACHIEVEMENTS', label: 'Logros', badge: unlockedAchievementsCount },
                    ] as const).map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`relative h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                                activeTab === t.id ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <span>{t.label}</span>
                            {t.badge > 0 && (
                                <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black hidden sm:flex items-center justify-center ${
                                    activeTab === t.id ? 'bg-slate-950 text-[var(--apex-gold)]' : 'bg-white/15 text-white'
                                }`}>
                                    {t.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {/* 3. TAB CONTENT */}
            {activeTab === 'TROPHIES' && <TrophyCabinetTab gameState={gameState} />}
            {activeTab === 'HISTORY' && <SeasonHistoryTab gameState={gameState} />}
            {activeTab === 'COMPETITIONS' && <CompetitionPalmaresTab gameState={gameState} />}
            {activeTab === 'ACHIEVEMENTS' && <AchievementsTab gameState={gameState} />}
        </div>
    );
};
