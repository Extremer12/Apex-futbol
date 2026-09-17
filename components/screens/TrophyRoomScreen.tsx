import React, { useState, useMemo } from 'react';
import { GameState, AchievementCategory } from '../../types';
import { TrophyIcon, SparklesIcon, ChartBarIcon } from '../icons';
import { ALL_COMPETITIONS, CompetitionItem } from './league/constants';
import { CompetitionHistoryView } from './league/CompetitionHistoryView';
import { customPacksService } from '../../services/customPacks/packService';
import { 
    Search, History, Shield, Award, CheckCircle2, Lock, Star,
    Trophy, Crown, Globe, ShieldCheck, Zap, Coins, Building2,
    Vote, Sparkles, ArrowRightLeft, Target, Flame, Medal, X, ChevronRight, Filter
} from 'lucide-react';
import { TeamLogo } from '../../data/teams/helpers';
import { formatCurrency } from '../../utils';
import { getClubHistoricalHonours } from '../../data/historicalHonours';

interface TrophyRoomScreenProps {
    gameState: GameState;
}

type TabType = 'TROPHIES' | 'HISTORY' | 'COMPETITIONS' | 'ACHIEVEMENTS';

const REGION_OPTIONS = [
    { id: 'ALL', label: 'Todos' },
    { id: 'INT', label: 'Internacionales', isInternational: true },
    { id: 'ARG', label: 'Argentina', country: 'Argentina' },
    { id: 'ESP', label: 'España', country: 'España' },
    { id: 'ENG', label: 'Inglaterra', country: 'Inglaterra' },
    { id: 'GER', label: 'Alemania', country: 'Alemania' },
    { id: 'ITA', label: 'Italia', country: 'Italia' },
    { id: 'FRA', label: 'Francia', country: 'Francia' },
    { id: 'BRA', label: 'Brasil', country: 'Brasil' },
    { id: 'MEX', label: 'México', country: 'México' },
    { id: 'PAR', label: 'Paraguay', country: 'Paraguay' },
];

const CATEGORY_THEMES = {
    trophies: {
        label: 'Títulos',
        icon: Trophy,
        color: 'text-amber-400',
        bg: 'from-amber-950/40 via-[#0F1420]/90 to-[#0A0E17]',
        border: 'border-amber-500/30 hover:border-amber-400/70',
        iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
        bar: 'bg-gradient-to-r from-amber-500 to-yellow-300',
        tag: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.08)]'
    },
    management: {
        label: 'Gestión',
        icon: Building2,
        color: 'text-cyan-400',
        bg: 'from-cyan-950/40 via-[#0F1420]/90 to-[#0A0E17]',
        border: 'border-cyan-500/30 hover:border-cyan-400/70',
        iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
        bar: 'bg-gradient-to-r from-cyan-500 to-blue-400',
        tag: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30',
        glow: 'shadow-[0_0_20px_rgba(6,182,212,0.08)]'
    },
    transfers: {
        label: 'Fichajes',
        icon: ArrowRightLeft,
        color: 'text-emerald-400',
        bg: 'from-emerald-950/40 via-[#0F1420]/90 to-[#0A0E17]',
        border: 'border-emerald-500/30 hover:border-emerald-400/70',
        iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
        bar: 'bg-gradient-to-r from-emerald-500 to-teal-300',
        tag: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.08)]'
    },
    special: {
        label: 'Especiales',
        icon: Award,
        color: 'text-purple-400',
        bg: 'from-purple-950/40 via-[#0F1420]/90 to-[#0A0E17]',
        border: 'border-purple-500/30 hover:border-purple-400/70',
        iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
        bar: 'bg-gradient-to-r from-purple-500 to-pink-400',
        tag: 'bg-purple-500/10 text-purple-300 border border-purple-500/30',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.08)]'
    }
};

const getAchievementIcon = (id: string, category: AchievementCategory) => {
    switch (id) {
        case 'first_trophy': return <Trophy className="w-5 h-5" />;
        case 'cup_king': return <Crown className="w-5 h-5" />;
        case 'continental_glory': return <Globe className="w-5 h-5" />;
        case 'world_champion': return <ShieldCheck className="w-5 h-5" />;
        case 'the_treble': return <Zap className="w-5 h-5" />;
        case 'tycoon': return <Coins className="w-5 h-5" />;
        case 'stadium_expansion': return <Building2 className="w-5 h-5" />;
        case 're_election': return <Vote className="w-5 h-5" />;
        case 'wonderkid_academy': return <Sparkles className="w-5 h-5" />;
        case 'galactic_signing': return <Star className="w-5 h-5" />;
        case 'big_sale': return <ArrowRightLeft className="w-5 h-5" />;
        case 'master_scout': return <Target className="w-5 h-5" />;
        case 'clean_sheet': return <Shield className="w-5 h-5" />;
        case 'historic_rout': return <Flame className="w-5 h-5" />;
        case 'individual_glory': return <Medal className="w-5 h-5" />;
        default:
            if (category === 'trophies') return <Trophy className="w-5 h-5" />;
            if (category === 'management') return <Building2 className="w-5 h-5" />;
            if (category === 'transfers') return <ArrowRightLeft className="w-5 h-5" />;
            return <Award className="w-5 h-5" />;
    }
};

export const TrophyRoomScreen: React.FC<TrophyRoomScreenProps> = ({ gameState }) => {
    const { team, achievements = [], seasonHistory = [] } = gameState;
    const [activeTab, setActiveTab] = useState<TabType>('TROPHIES');
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL');
    const [selectedCompId, setSelectedCompId] = useState<string>(team.leagueId || 'PREMIER_LEAGUE');
    const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
    const [compSearch, setCompSearch] = useState<string>('');

    const trophies = team.trophyCabinet || [];
    const leagueTrophies = trophies.filter(t => t.type === 'league');
    const cupTrophies = trophies.filter(t => t.type === 'cup');

    const clubHonours = useMemo(() => getClubHistoricalHonours(team.name), [team.name]);

    const selectedCompetitionDef = useMemo(() => {
        return ALL_COMPETITIONS.find(c => c.id === selectedCompId) || ALL_COMPETITIONS[0];
    }, [selectedCompId]);

    const filteredCompetitions = useMemo(() => {
        let list = ALL_COMPETITIONS;

        if (selectedRegion !== 'ALL') {
            const reg = REGION_OPTIONS.find(r => r.id === selectedRegion);
            if (reg?.isInternational) {
                list = list.filter(c => c.category === 'INTERNATIONAL');
            } else if (reg?.country) {
                list = list.filter(c => c.country === reg.country);
            }
        }

        if (compSearch.trim()) {
            const q = compSearch.toLowerCase().trim();
            list = list.filter(c => 
                c.name.toLowerCase().includes(q) || 
                (c.country && c.country.toLowerCase().includes(q))
            );
        }

        return list;
    }, [selectedRegion, compSearch]);

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
                            {team.name} • {clubHonours ? `${clubHonours.totalOfficialTitles} Títulos Oficiales Históricos` : `${trophies.length} Títulos`} • {seasonHistory.length} Temporadas archivadas
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
                        VITRINA ({clubHonours ? clubHonours.totalOfficialTitles + trophies.length : trophies.length})
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
                    {/* Club Historical Palmarès Card */}
                    {clubHonours && (
                        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 p-5 shadow-2xl relative overflow-hidden space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                                            Palmarés Histórico Oficial
                                        </span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                                        Vitrinas de {clubHonours.clubName}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2 self-start sm:self-auto bg-black/60 px-3.5 py-1.5 rounded-xl border border-amber-500/30">
                                    <TrophyIcon className="w-5 h-5 text-[var(--apex-gold)]" />
                                    <div>
                                        <span className="text-lg font-black text-white leading-none block">
                                            {clubHonours.totalOfficialTitles}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                                            Títulos Oficiales
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Trophies breakdown counters */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Ligas Nacionales</span>
                                    <span className="text-xl font-black text-white">{clubHonours.leagueTitles}</span>
                                </div>
                                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Copas Nacionales</span>
                                    <span className="text-xl font-black text-white">{clubHonours.domesticCups}</span>
                                </div>
                                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Continentales (UCL/Lib)</span>
                                    <span className="text-xl font-black text-amber-300">{clubHonours.continentalCups}</span>
                                </div>
                                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Mundiales / Intercont.</span>
                                    <span className="text-xl font-black text-emerald-400">{clubHonours.intercontinental}</span>
                                </div>
                            </div>

                            {/* Highlights Badges */}
                            {clubHonours.highlights && clubHonours.highlights.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {clubHonours.highlights.map((h, i) => (
                                        <span 
                                            key={i} 
                                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold"
                                        >
                                            🏆 {h}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Presidential Mandate Trophies Section Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 pt-2">
                        <div className="flex items-center gap-2">
                            <TrophyIcon className="w-5 h-5 text-[var(--apex-gold)]" />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                Títulos Conquistados en tu Mandato
                            </h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-2.5 py-1 rounded">
                            {trophies.length} {trophies.length === 1 ? 'Título' : 'Títulos'}
                        </span>
                    </div>

                    {trophies.length === 0 ? (
                        <div className="apex-card p-8 flex flex-col items-center justify-center text-center text-white/40 space-y-2">
                            <TrophyIcon className="w-10 h-10 opacity-30 text-[var(--apex-gold)] mb-1" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Sin Títulos Presidenciales Aún</h3>
                            <p className="text-xs text-slate-500 max-w-sm">
                                Aún no has conquistado títulos durante tu presidencia en esta partida. Compite en liga y copas para sumar nuevas copas a las vitrinas del club.
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
                                                {formatCurrency(rec.endBalance)}
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
                    {/* Top Filtering Bar: Region Chips + Search */}
                    <div className="apex-card p-4 space-y-3 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950/80 border border-white/10 shadow-lg backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 flex items-center justify-center text-[var(--apex-gold)] shadow-sm">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        Explorador de Competiciones
                                        <span className="text-[10px] font-mono text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-0.5 rounded-full border border-[var(--apex-gold)]/20">
                                            {filteredCompetitions.length}
                                        </span>
                                    </h3>
                                    <p className="text-[10px] text-slate-400">
                                        Filtra por país o región para consultar el palmarés histórico y ediciones.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Search Box with clear button */}
                            <div className="relative w-full md:w-64">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Buscar torneo o copa..."
                                    value={compSearch}
                                    onChange={(e) => setCompSearch(e.target.value)}
                                    className="w-full bg-black/60 border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)] transition-colors font-medium"
                                />
                                {compSearch && (
                                    <button 
                                        onClick={() => setCompSearch('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Region Filter Chips */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-white/5">
                            {REGION_OPTIONS.map(opt => {
                                const isSelected = selectedRegion === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSelectedRegion(opt.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                            isSelected
                                                ? 'bg-gradient-to-r from-[var(--apex-gold)] to-amber-500 text-black font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Quick Tournament Select Cards Carousel */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1 max-h-48 overflow-y-auto custom-scrollbar">
                            {filteredCompetitions.map(c => {
                                const isSelected = selectedCompId === c.id;
                                const cLogo = customPacksService.resolveCompetitionLogo(c.id, c.name, c.logo);
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCompId(c.id)}
                                        className={`p-2 rounded-xl text-left flex items-center gap-2.5 transition-all cursor-pointer border ${
                                            isSelected
                                                ? 'bg-gradient-to-r from-amber-500/20 to-[var(--apex-gold)]/10 border-[var(--apex-gold)] ring-1 ring-[var(--apex-gold)]/40 shadow-sm'
                                                : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/5 hover:border-white/15'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 shrink-0 p-1 flex items-center justify-center">
                                            <img src={cLogo} alt={c.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className={`text-xs font-bold truncate leading-tight ${isSelected ? 'text-[var(--apex-gold)]' : 'text-slate-200'}`}>
                                                {c.name}
                                            </div>
                                            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold truncate mt-0.5">
                                                {c.country || (c.type === 'INTERNATIONAL' ? 'Internacional' : 'Oficial')}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detailed Competition History */}
                    {selectedCompetitionDef ? (
                        <CompetitionHistoryView
                            competition={selectedCompetitionDef}
                            gameState={gameState}
                        />
                    ) : (
                        <div className="p-8 text-center text-slate-500 text-xs font-medium">
                            Selecciona una competición para ver su palmarés histórico.
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: LOGROS                                                             */}
            {/* ========================================================================= */}
            {activeTab === 'ACHIEVEMENTS' && (
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {/* Completion Summary Card: Elevated Gradient */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/20 shadow-xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                            Logros Presidenciales
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                            {completionPercentage}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Desafíos y metas institucionales desbloqueadas durante tu carrera.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 self-end md:self-auto">
                                <div className="text-right">
                                    <div className="text-lg font-black font-mono text-white">
                                        <span className="text-amber-400">{unlockedAchievementsCount}</span>
                                        <span className="text-slate-500 text-sm font-normal"> / {totalAchievementsCount}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                        Completados
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10">
                            <div 
                                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow-sm shadow-amber-400/50"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {(Object.keys(CATEGORY_THEMES) as Array<AchievementCategory | 'ALL'>).map(catKey => {
                            const theme = CATEGORY_THEMES[catKey];
                            const isSelected = selectedCategory === catKey;
                            const count = catKey === 'ALL' 
                                ? achievements.length 
                                : achievements.filter(a => a.category === catKey).length;

                            return (
                                <button
                                    key={catKey}
                                    onClick={() => setSelectedCategory(catKey)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border ${
                                        isSelected
                                            ? `${theme.badge} border-current font-black shadow-md scale-[1.02]`
                                            : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-white/5 border-white/5'
                                    }`}
                                >
                                    <span>{theme.label}</span>
                                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/30' : 'bg-white/5'}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Achievements Grid: Premium Themed Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {filteredAchievements.map(achievement => {
                            const isUnlocked = achievement.isUnlocked;
                            const theme = CATEGORY_THEMES[achievement.category] || CATEGORY_THEMES.trophies;
                            
                            return (
                                <div
                                    key={achievement.id}
                                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden backdrop-blur-sm ${
                                        isUnlocked 
                                            ? `bg-gradient-to-br ${theme.bgGradient} ${theme.border} shadow-lg shadow-black/40` 
                                            : 'bg-slate-950/40 border-white/5 opacity-70 hover:opacity-85'
                                    }`}
                                >
                                    {/* Top decorative glow */}
                                    {isUnlocked && (
                                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                                    )}

                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                                    isUnlocked 
                                                        ? `${theme.badge} ${theme.iconColor} shadow-sm` 
                                                        : 'bg-white/5 border-white/10 text-slate-500'
                                                }`}>
                                                    {getAchievementIcon(achievement.id, achievement.category)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-black text-white uppercase tracking-tight leading-snug truncate">
                                                        {achievement.title}
                                                    </h4>
                                                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                                                        {theme.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                                                isUnlocked
                                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs'
                                                    : 'bg-white/5 text-slate-500 border border-white/10'
                                            }`}>
                                                {isUnlocked ? (
                                                    <>
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                        <span>Conseguido</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-3 h-3 text-slate-500" />
                                                        <span>Bloqueado</span>
                                                    </>
                                                )}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                                            {achievement.description}
                                        </p>
                                    </div>

                                    {/* Progress / Unlocked Timestamp */}
                                    <div className="pt-2.5 border-t border-white/10 text-[10px]">
                                        {achievement.maxProgress !== undefined ? (
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between font-mono font-bold text-slate-400 text-[10px]">
                                                    <span className="uppercase text-[9px] tracking-wider text-slate-400">Progreso</span>
                                                    <span className={isUnlocked ? 'text-emerald-400' : 'text-slate-200'}>
                                                        {achievement.progress || 0} / {achievement.maxProgress}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10">
                                                    <div 
                                                        className={`h-full ${theme.progress} rounded-full transition-all duration-300`}
                                                        style={{
                                                            width: `${Math.min(100, (((achievement.progress || 0) / achievement.maxProgress) * 100))}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : isUnlocked && achievement.unlockedAt ? (
                                            <div className="text-slate-400 font-mono flex items-center justify-between text-[10px]">
                                                <span className="uppercase text-[9px] tracking-wider text-slate-400">Completado:</span>
                                                <span className="text-amber-400 font-bold">{achievement.unlockedAt}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 uppercase tracking-wider font-bold text-[9px] flex items-center gap-1">
                                                <span>Desafío de Carrera</span>
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
