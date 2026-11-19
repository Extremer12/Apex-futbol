import React, { useState, useMemo } from 'react';
import { GameState, Screen } from '../../types';
import { TrophyIcon } from '../icons';
import { Trophy, History, Shield, Award, ArrowLeft } from 'lucide-react';
import { TeamLogo } from '../../data/teams/helpers';
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
    const totalAchievementsCount = achievements.length || 15;

    return (
        <div className="p-4 md:p-6 space-y-5 h-full flex flex-col pb-24 animate-fade-in max-w-7xl mx-auto">
            {/* Header: Symmetrical, Clean, Modern and Professional */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3.5">
                    <button
                        onClick={() => nav(Screen.Club)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-white/10 transition-all flex items-center gap-2 group cursor-pointer shrink-0"
                        title="Volver al Club"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Club</span>
                    </button>
                    <div className="w-12 h-12 rounded-xl bg-black/60 p-2 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                        <TeamLogo team={team} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-2.5">
                            <TrophyIcon className="w-7 h-7 text-[var(--apex-gold)]" />
                            <span>Historial y Palmarés</span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {team.name} • {totalHonoursCount} Títulos Oficiales Históricos • {seasonHistory.length} Temporadas archivadas
                        </p>
                    </div>
                </div>

                {/* Symmetrical Navigation Tabs */}
                <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('TROPHIES')}
                        className={`px-3.5 py-1.5 text-[10px] tracking-wider font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'TROPHIES'
                                ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-yellow-500/20'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        VITRINA ({totalHonoursCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`px-3.5 py-1.5 text-[10px] tracking-wider font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'HISTORY'
                                ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-yellow-500/20'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        TEMPORADAS ({seasonHistory.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('COMPETITIONS')}
                        className={`px-3.5 py-1.5 text-[10px] tracking-wider font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'COMPETITIONS'
                                ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-yellow-500/20'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        POR TORNEO
                    </button>
                    <button
                        onClick={() => setActiveTab('ACHIEVEMENTS')}
                        className={`px-3.5 py-1.5 text-[10px] tracking-wider font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'ACHIEVEMENTS'
                                ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-yellow-500/20'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        LOGROS ({unlockedAchievementsCount}/{totalAchievementsCount})
                    </button>
                </div>
            </div>

            {/* Main Content View Switcher */}
            {activeTab === 'TROPHIES' && <TrophyCabinetTab gameState={gameState} />}
            {activeTab === 'HISTORY' && <SeasonHistoryTab gameState={gameState} />}
            {activeTab === 'COMPETITIONS' && <CompetitionPalmaresTab gameState={gameState} />}
            {activeTab === 'ACHIEVEMENTS' && <AchievementsTab gameState={gameState} />}
        </div>
    );
};
