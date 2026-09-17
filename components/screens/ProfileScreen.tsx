import React, { useState, useMemo } from 'react';
import { GameState, Screen, PresidentialStint, Team } from '../../types';
import { GameAction } from '../../state/reducer';
import { TeamLogo } from '../../data/teams/helpers';
import { 
    Award, 
    Trophy, 
    Vote, 
    Building2, 
    Briefcase, 
    Shield, 
    ChevronRight, 
    CheckCircle2, 
    Clock, 
    TrendingUp, 
    TrendingDown, 
    Minus, 
    Star, 
    Flame,
    Users,
    Sparkles,
    Landmark,
    Wallet,
    ArrowRightLeft,
    UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils';
import { calculateFanApproval } from '../../services/political';

interface ProfileScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

const PRESIDENT_LEVELS = [
    { level: 1, minXp: 0, title: 'Gestor Novato', desc: 'Dando los primeros pasos en la dirigencia deportiva.' },
    { level: 2, minXp: 200, title: 'Dirigente Comunitario', desc: 'Respaldo barrial y confianza de socios cercanos.' },
    { level: 3, minXp: 500, title: 'Gestor Consolidado', desc: 'Capaz de liderar asambleas y proyectos a mediano plazo.' },
    { level: 4, minXp: 900, title: 'Estratega Institucional', desc: 'Experto en finanzas, estatutos y negociaciones.' },
    { level: 5, minXp: 1400, title: 'Líder Político', desc: 'Gran peso en los comités de la liga y respeto gremial.' },
    { level: 6, minXp: 2000, title: 'Gran Negociador', desc: 'Atracción de patrocinadores multinacionales y fichajes estelares.' },
    { level: 7, minXp: 2700, title: 'Patriarca del Club', desc: 'Estatura histórica dentro de la institución.' },
    { level: 8, minXp: 3500, title: 'Figura Continental', desc: 'Respetado por federaciones y confederaciones.' },
    { level: 9, minXp: 4500, title: 'Leyenda Presidencial', desc: 'Su nombre está grabado en los anales del fútbol.' },
    { level: 10, minXp: 6000, title: 'Mito del Deporte', desc: 'Inmortal en la historia del fútbol internacional.' }
];

const PRESIDENTIAL_STYLES = [
    {
        id: 'Equilibrado',
        title: 'Equilibrio Institucional',
        desc: 'Prioriza estabilidad presupuestaria, cantera y competitividad deportiva constante.',
        icon: Shield,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/30'
    },
    {
        id: 'Canterano',
        title: 'Formador de Cantera',
        desc: 'Fuerte inversión en divisiones juveniles e infraestructura para producir futuras joyas.',
        icon: Sparkles,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30'
    },
    {
        id: 'Galáctico',
        title: 'Comprador Galáctico',
        desc: 'Obsesionado con figuras rutilantes, impacto mediático y ventas récord de camisetas.',
        icon: Star,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30'
    },
    {
        id: 'Pragmático',
        title: 'Pragmático de Resultados',
        desc: 'El fin justifica los medios. Rendimiento inmediato en la tabla de posiciones a toda costa.',
        icon: Flame,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/30'
    }
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ gameState, dispatch }) => {
    const { playerProfile: rawProfile, mandate, boardConfidence, electoralPromises, team, season, seasonHistory, allTeams } = gameState;
    const [activeTab, setActiveTab] = useState<'MANDATE' | 'PALMARES' | 'STINTS' | 'ELECTIONS'>('MANDATE');

    // Resolved profile with localStorage fallback
    const playerProfile = useMemo(() => {
        let p = rawProfile;
        if ((!p || !p.name) && typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem('apex_last_player_profile');
                if (cached) {
                    p = { ...JSON.parse(cached), ...p };
                }
            } catch (e) {
                // ignore
            }
        }
        return p;
    }, [rawProfile]);

    const firstName = playerProfile?.firstName || playerProfile?.name?.split(' ')[0] || '';
    const lastName = playerProfile?.lastName || playerProfile?.name?.split(' ').slice(1).join(' ') || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || playerProfile?.name || 'Presidente del Club';
    const profilePhoto = playerProfile?.photo;
    const nationality = playerProfile?.nationality || playerProfile?.country || 'Argentina';
    const age = playerProfile?.age;

    // Live Fan Approval: dynamic, real-time and never stuck at 0
    const fanApproval = useMemo(() => {
        return calculateFanApproval(gameState);
    }, [gameState]);

    const [selectedStyle, setSelectedStyle] = useState<string>(playerProfile?.style || 'Equilibrado');
    const [showStyleModal, setShowStyleModal] = useState(false);

    // Calculate experience & rank
    const experience = playerProfile?.experience || 0;
    const currentLevelInfo = useMemo(() => {
        let current = PRESIDENT_LEVELS[0];
        for (let i = 0; i < PRESIDENT_LEVELS.length; i++) {
            if (experience >= PRESIDENT_LEVELS[i].minXp) {
                current = PRESIDENT_LEVELS[i];
            } else {
                break;
            }
        }
        const nextLevel = PRESIDENT_LEVELS.find(l => l.level === current.level + 1);
        const xpForCurrent = current.minXp;
        const xpForNext = nextLevel ? nextLevel.minXp : current.minXp + 1000;
        const progressInLevel = Math.max(0, experience - xpForCurrent);
        const requiredInLevel = Math.max(1, xpForNext - xpForCurrent);
        const percentage = Math.min(100, Math.round((progressInLevel / requiredInLevel) * 100));

        return {
            level: current.level,
            title: current.title,
            desc: current.desc,
            progress: percentage,
            currentXp: experience,
            nextLevelXp: xpForNext,
            isMax: !nextLevel
        };
    }, [experience]);

    // Calculate career records
    const careerStats = useMemo(() => {
        let totalMatches = 0;
        let totalWins = 0;
        let totalDraws = 0;
        let totalLosses = 0;

        // From past history
        if (seasonHistory && seasonHistory.length > 0) {
            seasonHistory.forEach(rec => {
                totalMatches += (rec.userWon + rec.userDrawn + rec.userLost);
                totalWins += rec.userWon;
                totalDraws += rec.userDrawn;
                totalLosses += rec.userLost;
            });
        }

        // Current season table row
        const currentTable = gameState.leagueTables[team.leagueId] || [];
        const userRow = currentTable.find(r => r.teamId === team.id);
        if (userRow) {
            totalMatches += userRow.played;
            totalWins += userRow.won;
            totalDraws += userRow.drawn;
            totalLosses += userRow.lost;
        }

        const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

        // Total trophies
        const trophiesCount = team.trophyCabinet?.length || 0;

        return {
            totalMatches,
            totalWins,
            totalDraws,
            totalLosses,
            winRate,
            trophiesCount
        };
    }, [seasonHistory, gameState.leagueTables, team]);

    // Mandate 4-year progress
    const mandateYear = mandate?.currentYear || 1;
    const isElectionYear = mandate?.isElectionYear || mandateYear >= 4;

    // Available clubs with prospective elections for next season
    const prospectiveClubs = useMemo(() => {
        return allTeams
            .filter(t => t.id !== team.id && t.leagueId === team.leagueId)
            .slice(0, 4);
    }, [allTeams, team]);

    const handleSelectStyle = (styleId: string) => {
        setSelectedStyle(styleId);
        setShowStyleModal(false);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 pb-28 max-w-4xl mx-auto">
            {/* HERO: PRESIDENTIAL CREDENTIAL CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101726] via-[#0B0F19] to-black border border-amber-500/30 p-5 sm:p-7 shadow-2xl">
                {/* Background watermarked emblem */}
                <div className="absolute -right-8 -bottom-8 w-56 h-56 opacity-5 pointer-events-none text-amber-400">
                    <Landmark className="w-full h-full" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    {/* Left: President Identity (Avatar + Name & Info) */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
                        {/* President Avatar / Emblem */}
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-600/10 border-2 border-amber-400/60 p-1 flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.25)] overflow-hidden">
                                {profilePhoto ? (
                                    <img 
                                        src={profilePhoto} 
                                        alt={fullName} 
                                        className="w-full h-full object-cover rounded-xl" 
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-xl bg-slate-900/90 flex flex-col items-center justify-center text-amber-400">
                                        <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 mb-1" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/70">PRES</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300 shadow-md">
                                Nv. {currentLevelInfo.level}
                            </div>
                        </div>

                        {/* Information */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                                    {currentLevelInfo.title}
                                </span>
                                <button
                                    onClick={() => setShowStyleModal(true)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1 transition-all cursor-pointer"
                                >
                                    <span>Estilo: {selectedStyle}</span>
                                    <ChevronRight className="w-3 h-3 text-amber-400" />
                                </button>
                            </div>

                            {/* Name and Surname */}
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                                        {fullName}
                                    </h1>
                                    {firstName && lastName && (
                                        <span className="text-[10px] font-black text-amber-300/90 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                            {firstName} {lastName}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 flex items-center gap-2 mt-1 flex-wrap">
                                <span>Nacionalidad: {nationality}</span>
                                {age && (
                                    <>
                                        <span>•</span>
                                        <span>{age} años</span>
                                    </>
                                )}
                                <span>•</span>
                                <span className="text-amber-300/80 font-semibold">{currentLevelInfo.desc}</span>
                            </p>

                            {/* XP Progress Bar */}
                            <div className="mt-3 space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                    <span className="text-slate-400">Experiencia Dirigencial</span>
                                    <span className="text-amber-400">{currentLevelInfo.currentXp} / {currentLevelInfo.nextLevelXp} XP</span>
                                </div>
                                <div className="w-full h-2 bg-black/50 rounded-full border border-white/10 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${currentLevelInfo.progress}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-200 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Current Club Official Credential Badge */}
                    <div className="shrink-0 w-full lg:w-auto flex items-center gap-3.5 bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-black/40 border border-amber-500/30 rounded-2xl p-3.5 px-4 shadow-xl backdrop-blur-md">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center p-1 bg-black/40 rounded-xl border border-white/10 shadow-inner">
                            <TeamLogo team={team} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">Club Actual</span>
                            </div>
                            <div className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate max-w-[200px]">
                                {team.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                <span className="text-slate-300">Mandato #{mandate?.totalMandates || 1}</span>
                                <span>•</span>
                                <span>Año {mandate?.currentYear || 1} de 4</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Career Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-5 border-t border-white/10">
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Partidos</span>
                        <span className="text-lg font-black text-white">{careerStats.totalMatches}</span>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Efectividad</span>
                        <span className="text-lg font-black text-emerald-400">{careerStats.winRate}%</span>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Títulos</span>
                        <span className="text-lg font-black text-amber-400">{careerStats.trophiesCount}</span>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Mandatos</span>
                        <span className="text-lg font-black text-white">#{mandate?.totalMandates || 1}</span>
                    </div>
                </div>
            </div>

            {/* TAB NAVIGATION PILLS */}
            <div className="flex items-center gap-1.5 p-1 bg-[#0A0E17] rounded-2xl border border-white/10 text-xs font-bold overflow-x-auto">
                <button
                    onClick={() => setActiveTab('MANDATE')}
                    className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'MANDATE' ? 'bg-amber-400 text-slate-950 font-black shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Landmark className="w-4 h-4" />
                    <span>Mandato & Política</span>
                </button>
                <button
                    onClick={() => setActiveTab('PALMARES')}
                    className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'PALMARES' ? 'bg-amber-400 text-slate-950 font-black shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Trophy className="w-4 h-4" />
                    <span>Palmarés</span>
                </button>
                <button
                    onClick={() => setActiveTab('STINTS')}
                    className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'STINTS' ? 'bg-amber-400 text-slate-950 font-black shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    <span>Clubes</span>
                </button>
                <button
                    onClick={() => setActiveTab('ELECTIONS')}
                    className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 relative ${
                        activeTab === 'ELECTIONS' ? 'bg-amber-400 text-slate-950 font-black shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Vote className="w-4 h-4" />
                    <span>Elecciones</span>
                    {isElectionYear && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-2 right-2" />
                    )}
                </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'MANDATE' && (
                <div className="space-y-5">
                    {/* Current Club Banner & 4-Year Meter */}
                    <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 space-y-4 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 p-1.5 flex items-center justify-center">
                                    <TeamLogo team={team} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Club Actual</span>
                                    <h3 className="text-lg font-black text-white uppercase">{team.name}</h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mandato Vigente</span>
                                <span className="text-base font-black text-white">#{mandate.totalMandates} • Año {mandateYear} de 4</span>
                            </div>
                        </div>

                        {/* 4-Year Timeline Step Indicator */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <span>Línea del Mandato Presidencial (4 Años)</span>
                                <span className={isElectionYear ? 'text-rose-400 font-black' : 'text-amber-400 font-bold'}>
                                    {isElectionYear ? '¡Año Electoral!' : `Faltan ${4 - mandateYear} años para elecciones`}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4].map((year) => {
                                    const isCurrent = year === mandateYear;
                                    const isCompleted = year < mandateYear;
                                    return (
                                        <div
                                            key={year}
                                            className={`p-2.5 rounded-xl border text-center transition-all ${
                                                isCurrent
                                                    ? 'bg-amber-400/15 border-amber-400 ring-1 ring-amber-400/40'
                                                    : isCompleted
                                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                                    : 'bg-white/[0.02] border-white/5 text-slate-500'
                                            }`}
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-wider block">
                                                Año {year}
                                            </span>
                                            <span className={`text-[10px] font-bold block mt-0.5 truncate ${isCurrent ? 'text-white' : ''}`}>
                                                {year === 1 && 'Asunción'}
                                                {year === 2 && 'Gestión'}
                                                {year === 3 && 'Balance'}
                                                {year === 4 && '🗳️ Elecciones'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Political Climate: Socios vs Directiva */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Fan Approval (Socios) */}
                        <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 space-y-4 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-wide">Aprobación de Socios</h4>
                                        <p className="text-[10px] text-slate-400 font-medium">Índice electoral clave para reelección</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10">
                                    {fanApproval.trend === 'rising' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                                    {fanApproval.trend === 'falling' && <TrendingDown className="w-4 h-4 text-rose-400" />}
                                    {fanApproval.trend === 'stable' && <Minus className="w-4 h-4 text-amber-400" />}
                                    <span className="text-sm font-black font-mono text-white">{fanApproval.rating}%</span>
                                </div>
                            </div>

                            {/* Overall Gauge Meter */}
                            <div className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-400 font-medium">Clima electoral:</span>
                                    <span className={`font-black uppercase tracking-wider ${
                                        fanApproval.rating >= 60 ? 'text-emerald-400' : fanApproval.rating >= 45 ? 'text-amber-400' : 'text-rose-400'
                                    }`}>
                                        {fanApproval.rating >= 60 ? '✓ Amplio Respaldo' : fanApproval.rating >= 45 ? '⚠ Comicios Reñidos' : '⛔ Descontento Social'}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${fanApproval.rating}%` }}
                                        transition={{ duration: 0.6 }}
                                        className={`h-full rounded-full ${
                                            fanApproval.rating >= 60
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                                : fanApproval.rating >= 45
                                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                                : 'bg-gradient-to-r from-rose-600 to-red-500'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Factor Cards Grid */}
                            <div className="space-y-2 pt-1">
                                {/* Resultados Deportivos */}
                                <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                            <Trophy className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-bold text-slate-200 truncate">Resultados Deportivos</div>
                                            <div className="text-[9px] text-slate-400 truncate">
                                                {careerStats.totalMatches > 0 ? `${careerStats.winRate}% de efectividad` : 'Inicio de temporada'}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-black shrink-0 border ${
                                        fanApproval.factors.results >= 0
                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                    }`}>
                                        {fanApproval.factors.results > 0 ? `+${fanApproval.factors.results}` : fanApproval.factors.results} pts
                                    </span>
                                </div>

                                {/* Política de Fichajes */}
                                <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                            <ArrowRightLeft className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-bold text-slate-200 truncate">Política de Fichajes</div>
                                            <div className="text-[9px] text-slate-400 truncate">
                                                {team.squad.length} jugadores en plantilla
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-black shrink-0 border ${
                                        fanApproval.factors.transfers >= 0
                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                    }`}>
                                        {fanApproval.factors.transfers > 0 ? `+${fanApproval.factors.transfers}` : fanApproval.factors.transfers} pts
                                    </span>
                                </div>

                                {/* Salud Financiera */}
                                <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                                            <Wallet className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-bold text-slate-200 truncate">Salud Financiera</div>
                                            <div className="text-[9px] text-slate-400 truncate">
                                                {formatCurrency(gameState.finances?.balance || 0)} en arcas
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-black shrink-0 border ${
                                        fanApproval.factors.finances >= 0
                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                    }`}>
                                        {fanApproval.factors.finances > 0 ? `+${fanApproval.factors.finances}` : fanApproval.factors.finances} pts
                                    </span>
                                </div>

                                {/* Cumplimiento de Promesas */}
                                <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-bold text-slate-200 truncate">Promesas Electorales</div>
                                            <div className="text-[9px] text-slate-400 truncate">
                                                {electoralPromises.filter(p => p.fulfilled).length}/{electoralPromises.length} compromisos
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-black shrink-0 border ${
                                        fanApproval.factors.promises >= 0
                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                    }`}>
                                        {fanApproval.factors.promises > 0 ? `+${fanApproval.factors.promises}` : fanApproval.factors.promises} pts
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Board Confidence (Junta Directiva) */}
                        <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-400" />
                                    <h4 className="text-sm font-black text-white uppercase tracking-wide">Junta Directiva</h4>
                                </div>
                                <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                                    boardConfidence >= 60
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                        : boardConfidence >= 35
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                }`}>
                                    {boardConfidence}%
                                </span>
                            </div>

                            <p className="text-xs text-slate-400">
                                La directiva fiscaliza tu gestión semana tras semana. Si la confianza cae por debajo de 25%, pueden forzar una moción de censura.
                            </p>

                            <div className="space-y-1 pt-2">
                                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            boardConfidence >= 60 ? 'bg-emerald-500' : boardConfidence >= 35 ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}
                                        style={{ width: `${boardConfidence}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-500 block">
                                    {boardConfidence >= 75 ? 'Confianza plena en tu proyecto institucional.' : boardConfidence >= 50 ? 'Gestión estable y sin reclamos urgentes.' : 'Alerta: la directiva exige mejores resultados deportivos.'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Promises Tracking */}
                    <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400" />
                                <h4 className="text-sm font-black text-white uppercase tracking-wide">Promesas Electorales del Mandato</h4>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                                {electoralPromises?.filter(p => p.fulfilled).length || 0} de {electoralPromises?.length || 0} Cumplidas
                            </span>
                        </div>

                        {electoralPromises && electoralPromises.length > 0 ? (
                            <div className="space-y-2 pt-1">
                                {electoralPromises.map((promise) => (
                                    <div
                                        key={promise.id}
                                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                            promise.fulfilled
                                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                                : 'bg-white/[0.02] border-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {promise.fulfilled ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-slate-500 shrink-0" />
                                            )}
                                            <div>
                                                <p className="text-xs font-bold text-white leading-snug">{promise.description}</p>
                                                <span className="text-[10px] text-slate-400">
                                                    Límite: Temporada {promise.deadline} • Impacto: {promise.impact > 0 ? `+${promise.impact}` : promise.impact} votos
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                            promise.fulfilled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400'
                                        }`}>
                                            {promise.fulfilled ? 'Cumplida' : 'Pendiente'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 py-3 text-center">
                                No se registraron promesas en el pitch electoral de este mandato.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: PALMARÉS */}
            {activeTab === 'PALMARES' && (
                <div className="space-y-4">
                    <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Vitrina de Títulos Presidenciales</h3>
                        </div>

                        {team.trophyCabinet && team.trophyCabinet.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {team.trophyCabinet.map((trophy, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-black flex items-center gap-3.5 shadow-md"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                                            <Trophy className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                                                Temporada {trophy.season}
                                            </span>
                                            <h4 className="text-sm font-black text-white uppercase truncate">
                                                {trophy.name}
                                            </h4>
                                            <span className="text-[10px] text-slate-400">
                                                Bajo la presidencia en {team.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 space-y-2">
                                <Trophy className="w-12 h-12 mx-auto text-slate-600 opacity-40" />
                                <h4 className="text-sm font-bold text-slate-300">Vitrina aún sin trofeos</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Conquista campeonatos de liga o copas nacionales como la Copa Argentina para inmortalizar tu presidencia.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: CLUBES DIRIGIDOS */}
            {activeTab === 'STINTS' && (
                <div className="space-y-4">
                    <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 shadow-lg space-y-4">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-amber-400" />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Historial de Clubes Presididos</h3>
                        </div>

                        {/* Current Club Stint */}
                        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-black/40 p-1 flex items-center justify-center">
                                        <TeamLogo team={team} className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-black text-white uppercase">{team.name}</h4>
                                            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/40">
                                                En Ejercicio
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            Desde Temp. 1 • Temporada actual: {season} (Mandato #{mandate.totalMandates})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                                <div>
                                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Efectividad</span>
                                    <span className="text-sm font-black text-emerald-400">{careerStats.winRate}%</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Títulos</span>
                                    <span className="text-sm font-black text-amber-400">{careerStats.trophiesCount}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Socios</span>
                                    <span className="text-sm font-black text-white">{fanApproval.rating}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Past Stints (if any) */}
                        {playerProfile?.careerStints && playerProfile.careerStints.length > 0 && (
                            <div className="space-y-2">
                                {playerProfile.careerStints.map((stint, idx) => (
                                    <div key={idx} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                                        <div>
                                            <h5 className="text-sm font-bold text-white">{stint.clubName}</h5>
                                            <span className="text-[10px] text-slate-400">
                                                Temp. {stint.startSeason} - {stint.endSeason || stint.startSeason} • {stint.mandatesCompleted} Mandatos • {stint.trophiesWon.length} Títulos
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded">
                                            {stint.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: ELECCIONES & FUTURO */}
            {activeTab === 'ELECTIONS' && (
                <div className="space-y-4">
                    {/* Election Status Banner */}
                    <div className={`p-5 rounded-2xl border shadow-lg ${
                        isElectionYear
                            ? 'bg-gradient-to-r from-red-950/40 via-slate-900 to-black border-red-500/50'
                            : 'bg-[#0B0F19] border-white/10'
                    }`}>
                        <div className="flex items-center gap-3 mb-2">
                            <Vote className={`w-6 h-6 ${isElectionYear ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                            <div>
                                <h3 className="text-base font-black text-white uppercase tracking-wider">
                                    {isElectionYear ? '¡Año de Comicios Electorales!' : 'Ciclo Electoral Presidencial'}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {isElectionYear
                                        ? 'Has completado los 4 años de gestión reglamentarios. Los socios votarán en los comicios al cierre de la temporada.'
                                        : `Año ${mandateYear} de 4. Faltan ${4 - mandateYear} temporada(s) para las próximas elecciones.`}
                                </p>
                            </div>
                        </div>

                        {/* Projection */}
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 mt-4 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-300">Intención de Voto Estimada:</span>
                                <span className={`text-base font-black ${
                                    fanApproval.rating >= 60 ? 'text-emerald-400' : fanApproval.rating >= 45 ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                    {fanApproval.rating}% de los votos
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        fanApproval.rating >= 60 ? 'bg-emerald-500' : fanApproval.rating >= 45 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${fanApproval.rating}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 italic">
                                {fanApproval.rating >= 65
                                    ? '✓ Los socios avalan de forma contundente tu gestión. Tienes el camino allanado para renovar tu mandato.'
                                    : fanApproval.rating >= 45
                                    ? '⚠ Elección reñida: la oposición presiona. Un título o buen cierre económico inclinará la balanza.'
                                    : '⛔ Situación crítica: corres serio peligro de perder las elecciones frente a la lista opositora.'}
                            </p>
                        </div>
                    </div>

                    {/* Prospective Clubs looking for a President */}
                    <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-amber-400" />
                                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                                    Oportunidades en Otros Clubes
                                </h4>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                                Mercado de Presidencias
                            </span>
                        </div>

                        <p className="text-xs text-slate-400">
                            Si decides no renovar o culminar tu ciclo en {team.name}, puedes postularte a las elecciones de otras instituciones afines a tu reputación (Nivel {currentLevelInfo.level}).
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {prospectiveClubs.map((club) => (
                                <div
                                    key={club.id}
                                    className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-amber-400/40 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-black/40 p-1 flex items-center justify-center">
                                            <TeamLogo team={club} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-white uppercase">{club.name}</h5>
                                            <span className="text-[10px] text-slate-400">
                                                Presupuesto: {formatCurrency(club.budget)} • Nivel Requerido: {club.tier === 'Top' ? 'Nv. 4+' : 'Nv. 2+'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-white/5 text-slate-400 px-2 py-1 rounded">
                                        Elecciones Próximas
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* STYLE SELECTION MODAL */}
            <AnimatePresence>
                {showStyleModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowStyleModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0B0F19] border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Filosofía Institucional</span>
                                    <h3 className="text-lg font-black text-white uppercase">Elige tu Estilo de Gestión</h3>
                                </div>
                                <button
                                    onClick={() => setShowStyleModal(false)}
                                    className="text-slate-400 hover:text-white text-sm font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                {PRESIDENTIAL_STYLES.map((style) => {
                                    const Icon = style.icon;
                                    const isSelected = selectedStyle === style.id;
                                    return (
                                        <button
                                            key={style.id}
                                            onClick={() => handleSelectStyle(style.id)}
                                            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                                                isSelected
                                                    ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/50'
                                                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-xl border shrink-0 ${style.bg} ${style.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-bold text-white">{style.title}</h4>
                                                    {isSelected && (
                                                        <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                                                            Activo
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1">{style.desc}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
