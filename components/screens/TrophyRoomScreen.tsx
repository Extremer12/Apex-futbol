import React, { useState, useMemo } from 'react';
import { GameState, AchievementCategory } from '../../types';
import { TrophyIcon, SparklesIcon, ChartBarIcon } from '../icons';
import { ALL_COMPETITIONS } from './league/constants';
import { CompetitionHistoryView } from './league/CompetitionHistoryView';
import { customPacksService } from '../../services/customPacks/packService';
import { Search, History, Shield, Award, CheckCircle2, Lock } from 'lucide-react';
import { TeamLogo } from '../../data/teams/helpers';

interface TrophyRoomScreenProps {
    gameState: GameState;
}

type TabType = 'TROPHIES' | 'HISTORY' | 'COMPETITIONS' | 'ACHIEVEMENTS';

export const TrophyRoomScreen: React.FC<TrophyRoomScreenProps> = ({ gameState }) => {
    const { team, achievements = [], seasonHistory = [] } = gameState;
    const [activeTab, setActiveTab] = useState<TabType>('TROPHIES');
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL');
    const [selectedCompId, setSelectedCompId] = useState<string>(team.leagueId || 'PREMIER_LEAGUE');
    const [compSearch, setCompSearch] = useState<string>('');

    const trophies = team.trophyCabinet || [];
    const leagueTrophies = trophies.filter(t => t.type === 'league');
    const cupTrophies = trophies.filter(t => t.type === 'cup');

    const selectedCompetitionDef = useMemo(() => {
        return ALL_COMPETITIONS.find(c => c.id === selectedCompId) || ALL_COMPETITIONS[0];
    }, [selectedCompId]);

    const filteredCompetitions = useMemo(() => {
        if (!compSearch.trim()) return ALL_COMPETITIONS;
        const q = compSearch.toLowerCase();
        return ALL_COMPETITIONS.filter(c => 
            c.name.toLowerCase().includes(q) || 
            (c.country && c.country.toLowerCase().includes(q))
        );
    }, [compSearch]);

    // Achievements calculation
    const unlockedAchievementsCount = achievements.filter(a => a.isUnlocked).length;
    const totalAchievementsCount = achievements.length || 15;
    const completionPercentage = totalAchievementsCount > 0 
        ? Math.round((unlockedAchievementsCount / totalAchievementsCount) * 100) 
        : 0;

    const filteredAchievements = achievements.filter(a => {
        if (selectedCategory === 'ALL') return true;
        return a.category === selectedCategory;
    });

    const categoryLabels: Record<AchievementCategory | 'ALL', { label: string }> = {
        ALL: { label: 'Todos' },
        trophies: { label: 'Títulos' },
        management: { label: 'Gestión' },
        transfers: { label: 'Fichajes' },
        special: { label: 'Especiales' }
    };

    return (
        <div className="p-4 md:p-6 space-y-5 h-full flex flex-col pb-24 animate-fade-in max-w-7xl mx-auto">
            {/* Header: Symmetrical, Clean & Modern */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-black/60 p-2 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <TeamLogo team={team} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-2.5">
                            <TrophyIcon className="w-7 h-7 text-[var(--apex-gold)]" />
                            <span>Historial y Palmarés</span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {team.name} • {trophies.length} Títulos • {seasonHistory.length} Temporadas archivadas
                        </p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('TROPHIES')}
                        className={`px-3.5 py-1.5 text-[10px] tracking-wider font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'TROPHIES'
                                ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-yellow-500/20'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        VITRINA ({trophies.length})
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

            {/* ========================================================================= */}
            {/* TAB 1: VITRINA DE TROFEOS                                                 */}
            {/* ========================================================================= */}
            {activeTab === 'TROPHIES' && (
                <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {trophies.length === 0 ? (
                        <div className="apex-card p-12 flex flex-col items-center justify-center text-center text-white/40 space-y-2">
                            <TrophyIcon className="w-12 h-12 opacity-30 text-[var(--apex-gold)] mb-2" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">Vitrina Sin Títulos</h3>
                            <p className="text-xs text-slate-500 max-w-sm">
                                El club aún no ha conquistado títulos en esta partida. Compite en liga y copas para sumar estrellas al palmarés oficial.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* League Trophies Column */}
                            <div className="apex-card flex flex-col overflow-hidden">
                                <div className="bg-slate-900/90 px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                                    <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1.5 h-3 bg-[var(--apex-gold)] rounded-sm" />
                                        Ligas Nacionales
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-semibold">
                                        {leagueTrophies.length} títulos
                                    </span>
                                </div>

                                <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                                    {leagueTrophies.length === 0 ? (
                                        <div className="p-6 text-center text-slate-500 text-xs">
                                            Sin títulos de liga conseguidos aún
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {leagueTrophies.map(trophy => (
                                                <div 
                                                    key={trophy.id}
                                                    className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 hover:border-[var(--apex-gold)]/40 transition-all flex items-center gap-3"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 flex items-center justify-center flex-shrink-0">
                                                        <TrophyIcon className="w-5 h-5 text-[var(--apex-gold)]" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-xs font-bold text-white truncate block">
                                                            {trophy.name}
                                                        </span>
                                                        <span className="text-[10px] font-black text-[var(--apex-gold)] uppercase tracking-wider">
                                                            Temporada {trophy.season}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cup Trophies Column */}
                            <div className="apex-card flex flex-col overflow-hidden">
                                <div className="bg-slate-900/90 px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                                    <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1.5 h-3 bg-amber-400 rounded-sm" />
                                        Copas y Torneos
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-semibold">
                                        {cupTrophies.length} títulos
                                    </span>
                                </div>

                                <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                                    {cupTrophies.length === 0 ? (
                                        <div className="p-6 text-center text-slate-500 text-xs">
                                            Sin títulos de copa conseguidos aún
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {cupTrophies.map(trophy => (
                                                <div 
                                                    key={trophy.id}
                                                    className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 hover:border-amber-400/40 transition-all flex items-center gap-3"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                                                        <TrophyIcon className="w-5 h-5 text-amber-400" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-xs font-bold text-white truncate block">
                                                            {trophy.name}
                                                        </span>
                                                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                                                            Temporada {trophy.season}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: HISTORIAL DE TEMPORADAS                                            */}
            {/* ========================================================================= */}
            {activeTab === 'HISTORY' && (
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {seasonHistory.length === 0 ? (
                        <div className="apex-card p-12 flex flex-col items-center justify-center text-center text-white/40 space-y-2">
                            <ChartBarIcon className="w-12 h-12 opacity-30 text-sky-400 mb-2" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">Primera Temporada en Curso</h3>
                            <p className="text-xs text-slate-500 max-w-md">
                                Aún no has finalizado tu primera temporada completa. Al concluir el torneo, se archivarán automáticamente las posiciones, campeones y estadísticas.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {seasonHistory.map((rec) => (
                                <div
                                    key={rec.season}
                                    className="apex-card p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all space-y-3"
                                >
                                    {/* Header Row: Symmetrical season badge & results */}
                                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 text-xs">
                                        <div className="flex items-center gap-2.5 truncate">
                                            <span className="px-2.5 py-1 rounded-lg bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 font-black text-xs font-mono">
                                                T{rec.season}
                                            </span>
                                            <span className="font-bold text-white truncate">
                                                {rec.leagueName}
                                            </span>
                                        </div>

                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                            rec.finalPosition === 1
                                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                : rec.finalPosition <= 4
                                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                                : 'bg-white/5 text-slate-300 border border-white/10'
                                        }`}>
                                            {rec.finalPosition === 1 ? 'Campeón' : `${rec.finalPosition}º Puesto`}
                                        </span>
                                    </div>

                                    {/* Metrics Grid: Symmetrical 4 Columns */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Puntos</span>
                                            <span className="font-black text-white">{rec.points} pts</span>
                                        </div>
                                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Récord</span>
                                            <span className="font-semibold text-slate-200">
                                                {rec.wins}V - {rec.draws}E - {rec.losses}D
                                            </span>
                                        </div>
                                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Goles (GF / GC)</span>
                                            <span className="font-semibold text-slate-200">
                                                {rec.goalsFor} / {rec.goalsAgainst} ({rec.goalsFor - rec.goalsAgainst > 0 ? `+${rec.goalsFor - rec.goalsAgainst}` : rec.goalsFor - rec.goalsAgainst})
                                            </span>
                                        </div>
                                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Balance Cierre</span>
                                            <span className="font-bold text-emerald-400 font-mono">
                                                €{rec.endBalance.toFixed(1)}M
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Honors Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-[11px]">
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            <span className="text-slate-500 font-bold uppercase text-[9px]">Campeón de Liga:</span>
                                            <span className="font-bold text-white">{rec.championTeamName}</span>
                                        </div>

                                        {rec.cupWinnerName && (
                                            <div className="flex items-center gap-1.5 text-slate-300">
                                                <span className="text-slate-500 font-bold uppercase text-[9px]">Copa:</span>
                                                <span className="font-bold text-amber-300">{rec.cupWinnerName}</span>
                                            </div>
                                        )}

                                        {rec.topScorerName && (
                                            <div className="flex items-center gap-1.5 text-slate-300">
                                                <span className="text-slate-500 font-bold uppercase text-[9px]">Goleador:</span>
                                                <span className="font-bold text-slate-200">{rec.topScorerName}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: PALMARÉS POR TORNEO                                                */}
            {/* ========================================================================= */}
            {activeTab === 'COMPETITIONS' && (
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {/* Competition Selector & Search */}
                    <div className="apex-card p-3.5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                                    Historial por Competición
                                </h3>
                                <p className="text-[10px] text-slate-400">
                                    Selecciona una liga o copa para consultar su palmarés histórico y ediciones.
                                </p>
                            </div>
                            
                            {/* Search Box */}
                            <div className="relative w-full sm:w-64">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Buscar torneo..."
                                    value={compSearch}
                                    onChange={(e) => setCompSearch(e.target.value)}
                                    className="w-full bg-black/60 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Competition Pills Horizontal List */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                            {filteredCompetitions.map(c => {
                                const isSelected = selectedCompId === c.id;
                                const cLogo = customPacksService.resolveCompetitionLogo(c.id, c.name, c.logo);
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCompId(c.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-[var(--apex-gold)] text-black font-black shadow-md'
                                                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                                        }`}
                                    >
                                        <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                            <img src={cLogo} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <span className="truncate max-w-[130px]">{c.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detailed Competition History */}
                    {selectedCompetitionDef && (
                        <CompetitionHistoryView
                            competition={selectedCompetitionDef}
                            gameState={gameState}
                        />
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: LOGROS                                                             */}
            {/* ========================================================================= */}
            {activeTab === 'ACHIEVEMENTS' && (
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {/* Completion Bar */}
                    <div className="apex-card p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white uppercase tracking-wider">
                                Desafíos Presidenciales ({completionPercentage}%)
                            </span>
                            <span className="text-slate-400 font-semibold">
                                {unlockedAchievementsCount} de {totalAchievementsCount} completados
                            </span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[var(--apex-gold)] rounded-full transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {(Object.keys(categoryLabels) as Array<AchievementCategory | 'ALL'>).map(catKey => {
                            const info = categoryLabels[catKey];
                            const isSelected = selectedCategory === catKey;
                            const count = catKey === 'ALL' 
                                ? achievements.length 
                                : achievements.filter(a => a.category === catKey).length;

                            return (
                                <button
                                    key={catKey}
                                    onClick={() => setSelectedCategory(catKey)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                                        isSelected
                                            ? 'bg-white text-black font-black shadow-md'
                                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                                    }`}
                                >
                                    <span>{info.label}</span>
                                    <span className="text-[10px] opacity-60 font-mono">({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Achievements Grid: Symmetrical 3-Column */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredAchievements.map(achievement => {
                            const isUnlocked = achievement.isUnlocked;
                            return (
                                <div
                                    key={achievement.id}
                                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                                        isUnlocked 
                                            ? 'bg-slate-900/80 border-[var(--apex-gold)]/40 shadow-sm' 
                                            : 'bg-slate-950/40 border-white/5 opacity-70'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="text-xs font-black text-white uppercase tracking-tight truncate">
                                                {achievement.title}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                                isUnlocked
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-white/5 text-slate-500 border border-white/10'
                                            }`}>
                                                {isUnlocked ? (
                                                    <>
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                        <span>Desbloqueado</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-3 h-3 text-slate-500" />
                                                        <span>Bloqueado</span>
                                                    </>
                                                )}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                                            {achievement.description}
                                        </p>
                                    </div>

                                    {/* Progress / Unlocked Date */}
                                    <div className="pt-2 border-t border-white/5 text-[10px]">
                                        {achievement.maxProgress !== undefined ? (
                                            <div className="space-y-1">
                                                <div className="flex justify-between font-mono font-bold text-slate-400">
                                                    <span>Progreso</span>
                                                    <span className="text-[var(--apex-gold)]">
                                                        {achievement.progress || 0} / {achievement.maxProgress}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[var(--apex-gold)] rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${Math.min(100, (((achievement.progress || 0) / achievement.maxProgress) * 100))}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : isUnlocked && achievement.unlockedAt ? (
                                            <div className="text-slate-400 font-mono flex items-center justify-between">
                                                <span>Conseguido:</span>
                                                <span className="text-[var(--apex-gold)] font-bold">{achievement.unlockedAt}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">
                                                Desafío Presidencial
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
