import React, { useEffect, useState } from 'react';
import { CinematicEvent } from '../../types';
import { Confetti } from '../ui/Confetti';
import { TrophyIcon, TrendingUpIcon, TrendingDownIcon } from '../icons';
import { formatCurrency } from '../../utils';
import { TeamLogo } from '../../data/teams/helpers';
import { TOURNAMENT_LOGOS } from '../../services/customPacks/argentineLogos';

interface CinematicOverlayProps {
    event: CinematicEvent;
    onContinue: () => void;
}

const resolveCompetitionLogos = (comp?: string, title?: string, logoUrl?: string) => {
    const raw = `${comp || ''} ${title || ''}`.toLowerCase();
    
    if (raw.includes('libertadores')) {
        return {
            primary: (logoUrl as string) || TOURNAMENT_LOGOS.COPA_LIBERTADORES,
            fallback: 'https://upload.wikimedia.org/wikipedia/en/a/ac/Copa_Libertadores_logo.svg',
            badge: 'CONMEBOL LIBERTADORES',
            accent: '#F59E0B'
        };
    }
    if (raw.includes('sudamericana')) {
        return {
            primary: (logoUrl as string) || TOURNAMENT_LOGOS.COPA_SUDAMERICANA,
            fallback: 'https://upload.wikimedia.org/wikipedia/en/3/36/Copa_Sudamericana_logo.svg',
            badge: 'CONMEBOL SUDAMERICANA',
            accent: '#D97706'
        };
    }
    if (raw.includes('champions')) {
        return {
            primary: (logoUrl as string) || TOURNAMENT_LOGOS.CHAMPIONS_LEAGUE,
            fallback: 'https://tmssl.akamaized.net/images/logo/header/CL.png',
            badge: 'UEFA CHAMPIONS LEAGUE',
            accent: '#3B82F6'
        };
    }
    if (raw.includes('intercontinental')) {
        return {
            primary: (logoUrl as string) || TOURNAMENT_LOGOS.COPA_INTERCONTINENTAL,
            fallback: 'https://upload.wikimedia.org/wikipedia/en/5/5b/FIFA_Intercontinental_Cup_%28logo%29.png',
            badge: 'FIFA INTERCONTINENTAL',
            accent: '#10B981'
        };
    }
    return {
        primary: (logoUrl as string) || '',
        fallback: '',
        badge: title || 'COMPETICIÓN OFICIAL',
        accent: '#F59E0B'
    };
};

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({ event, onContinue }) => {
    const [visible, setVisible] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);
    const [compLogoSrc, setCompLogoSrc] = useState<string>('');

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    const renderContent = () => {
        switch (event.type) {
            case 'CUP_KICKOFF': {
                const accentColor = event.metadata?.accentColor || '#6366F1';
                const logoUrl = event.metadata?.logoUrl || '';
                const bgClass = event.metadata?.bgClass || 'from-indigo-900 via-slate-950 to-slate-950';
                return (
                    <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-2xl mx-auto">
                        {/* Radial glow behind logo */}
                        <div
                            className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
                            style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
                        />
                        {/* Logo */}
                        <div
                            className={`relative w-48 h-48 mb-10 flex items-center justify-center transition-all duration-700 ${visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                        >
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt={event.metadata?.competition}
                                    className="w-full h-full object-contain drop-shadow-[0_0_60px_rgba(255,255,255,0.4)]"
                                    onLoad={() => setLogoLoaded(true)}
                                />
                            ) : (
                                <TrophyIcon className="w-full h-full text-yellow-400" />
                            )}
                        </div>

                        {/* Divider line */}
                        <div
                            className={`h-0.5 mb-8 transition-all duration-700 delay-300 rounded-full ${visible ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}
                            style={{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }}
                        />

                        {/* Title */}
                        <h1
                            className={`text-5xl md:text-6xl font-black text-white uppercase tracking-tight text-center drop-shadow-2xl transition-all duration-700 delay-200 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        >
                            {event.title}
                        </h1>

                        {/* Subtitle */}
                        <p
                            className={`text-lg md:text-xl mt-6 font-semibold text-center max-w-lg transition-all duration-700 delay-400 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                            style={{ color: accentColor }}
                        >
                            {event.subtitle}
                        </p>

                        {/* Tagline */}
                        <div
                            className={`mt-8 px-6 py-2 rounded-full border text-xs font-black uppercase tracking-[0.3em] transition-all duration-700 delay-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
                            style={{ borderColor: `${accentColor}50`, color: accentColor, background: `${accentColor}15` }}
                        >
                            Temporada {new Date().getFullYear()}
                        </div>
                    </div>
                );
            }
            case 'GROUP_DRAW': {
                const compInfo = resolveCompetitionLogos(
                    event.metadata?.competition as string,
                    event.title,
                    event.metadata?.logoUrl as string
                );
                const accentColor = (event.metadata?.accentColor as string) || compInfo.accent || '#F59E0B';
                const groups = (event.metadata?.groups as any[]) || [];
                const swissOpponents = (event.metadata?.swissOpponents as any[]) || [];
                const logoToRender = compLogoSrc || compInfo.primary;

                return (
                    <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-3xl mx-auto px-4">
                        {/* Subtle ambient glow behind logo */}
                        <div
                            className="absolute -top-10 w-56 h-56 sm:w-72 sm:h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
                            style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
                        />

                        {/* Tournament Logo */}
                        <div
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 mb-1.5 flex items-center justify-center transition-all duration-700 transform ${
                                visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-4'
                            }`}
                        >
                            {logoToRender ? (
                                <img
                                    src={logoToRender}
                                    alt={event.title}
                                    className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
                                    onError={() => {
                                        if (compInfo.fallback && compLogoSrc !== compInfo.fallback) {
                                            setCompLogoSrc(compInfo.fallback);
                                        }
                                    }}
                                />
                            ) : (
                                <TrophyIcon className="w-16 h-16 text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
                            )}
                        </div>

                        {/* Title & Subtitle Header */}
                        <div
                            className={`text-center mb-2.5 sm:mb-3 transition-all duration-700 delay-150 ${
                                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                            }`}
                        >
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white drop-shadow-md leading-none">
                                {event.title}
                            </h1>
                            <div className="flex items-center justify-center gap-2.5 mt-1">
                                <div
                                    className="h-px w-6 sm:w-10 rounded-full"
                                    style={{ background: `linear-gradient(to right, transparent, ${accentColor})` }}
                                />
                                <p
                                    className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em]"
                                    style={{ color: accentColor }}
                                >
                                    {event.subtitle || 'Sorteo de Fase de Grupos'}
                                </p>
                                <div
                                    className="h-px w-6 sm:w-10 rounded-full"
                                    style={{ background: `linear-gradient(to left, transparent, ${accentColor})` }}
                                />
                            </div>
                        </div>

                        {/* Centered Group Draw Card */}
                        <div
                            className={`w-full transition-all duration-700 delay-300 ${
                                visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                            }`}
                        >
                            {groups.length > 0 ? (
                                <div
                                    className={
                                        groups.length === 1
                                            ? 'flex justify-center w-full'
                                            : 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto'
                                    }
                                >
                                    {groups.map((group: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="w-full max-w-md bg-slate-900/90 border rounded-2xl p-3.5 sm:p-4.5 backdrop-blur-xl shadow-2xl relative overflow-hidden"
                                            style={{ borderColor: `${accentColor}35` }}
                                        >
                                            {/* Subtle top accent line */}
                                            <div
                                                className="absolute top-0 inset-x-0 h-0.5"
                                                style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
                                            />

                                            {/* Group Card Header */}
                                            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
                                                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                                    <span
                                                        className="w-1.5 h-5 rounded-full"
                                                        style={{ backgroundColor: accentColor }}
                                                    />
                                                    {group.name}
                                                </h3>
                                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                                                    {group.teams.length} Clubes
                                                </span>
                                            </div>

                                            {/* Team List with Crests */}
                                            <div className="space-y-1.5 sm:space-y-2">
                                                {group.teams.map((team: any, tIdx: number) => {
                                                    const isUser = Boolean(team.isPlayer);
                                                    return (
                                                        <div
                                                            key={tIdx}
                                                            className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                                                                isUser
                                                                    ? 'bg-amber-500/15 border border-amber-400/50 shadow-md shadow-amber-950/40 ring-1 ring-amber-400/30'
                                                                    : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/5'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                {/* Seed Badge */}
                                                                <div
                                                                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                                                        isUser
                                                                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                                                                            : 'bg-white/10 text-slate-400 border border-white/10'
                                                                    }`}
                                                                >
                                                                    {tIdx + 1}
                                                                </div>

                                                                {/* Club Logo / Crest */}
                                                                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                                                                    <TeamLogo
                                                                        team={team.team}
                                                                        className="w-full h-full object-contain drop-shadow"
                                                                    />
                                                                </div>

                                                                {/* Club Name */}
                                                                <span
                                                                    className={`text-xs sm:text-sm font-bold truncate ${
                                                                        isUser
                                                                            ? 'text-amber-200 font-black tracking-wide'
                                                                            : 'text-slate-100'
                                                                    }`}
                                                                >
                                                                    {team.name}
                                                                </span>
                                                            </div>

                                                            {/* User Badge or Pot */}
                                                            {isUser ? (
                                                                <span className="ml-2 px-2 py-0.5 rounded-md bg-amber-400/25 border border-amber-400/60 text-amber-300 text-[9px] font-black uppercase tracking-wider shrink-0 shadow-sm flex items-center gap-1">
                                                                    <span>★</span> TU CLUB
                                                                </span>
                                                            ) : (
                                                                <span className="ml-2 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase shrink-0">
                                                                    Bombo {team.pot || tIdx + 1}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : swissOpponents.length > 0 ? (
                                // Swiss Format View (Champions League)
                                <div className="w-full max-w-xl mx-auto bg-slate-900/90 border border-blue-500/20 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                                    <div
                                        className="absolute top-0 inset-x-0 h-0.5"
                                        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
                                    />
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                                        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                                            Rivales de Fase de Liga
                                        </h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                                            {swissOpponents.length} Partidos
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {swissOpponents.map((opponent: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-2 bg-black/40 rounded-xl border border-white/5 hover:border-white/15 transition-all"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="text-[10px] font-black text-slate-500 w-3.5">{idx + 1}</span>
                                                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                                        <TeamLogo
                                                            team={opponent.team}
                                                            className="w-full h-full object-contain drop-shadow"
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-white uppercase italic truncate">
                                                        {opponent.name}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                        opponent.venue === 'home'
                                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                            : 'bg-white/10 text-slate-400 border border-white/10'
                                                    }`}
                                                >
                                                    {opponent.venue === 'home' ? 'Local' : 'Visita'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                );
            }
            case 'LEAGUE_WIN':
            case 'CUP_WIN': {
                const team = event.metadata?.team;
                const compName = event.metadata?.competition || event.title;
                const stats = event.metadata?.stats;
                const accentColor = event.metadata?.accentColor || '#F59E0B';

                return (
                    <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-2xl mx-auto px-4">
                        {/* Radial glow */}
                        <div
                            className="absolute w-[450px] h-[450px] rounded-full blur-3xl opacity-25 pointer-events-none"
                            style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
                        />

                        {/* Top Badge */}
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 backdrop-blur-md mb-6 animate-fade-in shadow-lg">
                            <span className="text-amber-300 font-black text-xs uppercase tracking-[0.3em]">
                                ★ CAMPEÓN OFICIAL ★
                            </span>
                        </div>

                        {/* Crest + Trophy Duo */}
                        <div className="flex items-center justify-center gap-5 sm:gap-8 mb-6">
                            {team && (
                                <div className="relative group">
                                    <div 
                                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl p-3 sm:p-4 bg-white/5 border border-white/15 flex items-center justify-center shadow-2xl backdrop-blur-md"
                                        style={{ boxShadow: `0 0 35px ${accentColor}40` }}
                                    >
                                        <TeamLogo team={team} className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 font-black text-xs shadow-lg">
                                        ★
                                    </div>
                                </div>
                            )}

                            <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center drop-shadow-[0_0_50px_rgba(245,158,11,0.7)] animate-bounce">
                                <TrophyIcon className="w-full h-full text-amber-400" />
                            </div>
                        </div>

                        {/* Title & Subtitle */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight text-center drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                            ¡CAMPEONES!
                        </h1>
                        <p className="text-xl sm:text-2xl text-amber-300 mt-2 font-black text-center uppercase tracking-wider">
                            {compName}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium text-center max-w-lg">
                            {event.subtitle}
                        </p>

                        {/* Stats Dashboard */}
                        {stats && (
                            <div className="w-full mt-6 bg-[#0E1524]/90 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
                                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-white/10 pb-2 text-center">
                                    Rendimiento y Estadísticas del Campeón
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Partidos</span>
                                        <span className="text-lg sm:text-xl font-black text-white">{stats.played}</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Victorias</span>
                                        <span className="text-lg sm:text-xl font-black text-emerald-300">{stats.won}</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Goles a Favor</span>
                                        <span className="text-lg sm:text-xl font-black text-white">{stats.goalsFor}</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Diferencia de Gol</span>
                                        <span className="text-lg sm:text-xl font-black text-amber-300">{stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Confetti count={180} />
                    </div>
                );
            }
            case 'PROMOTION':
                return (
                    <div className="flex flex-col items-center justify-center animate-trophy-rise relative z-10">
                        <div className="w-32 h-32 mb-8 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                            <TrendingUpIcon className="w-16 h-16 text-green-400" />
                        </div>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tight text-center drop-shadow-2xl">
                            {event.title}
                        </h1>
                        <p className="text-xl text-green-300 mt-4 font-bold text-center uppercase tracking-widest">
                            {event.subtitle}
                        </p>
                        <Confetti count={100} />
                    </div>
                );
            case 'RELEGATION':
                return (
                    <div className="flex flex-col items-center justify-center animate-fade-in relative z-10">
                        <div className="w-32 h-32 mb-8 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                            <TrendingDownIcon className="w-16 h-16 text-red-400" />
                        </div>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tight text-center drop-shadow-2xl">
                            {event.title}
                        </h1>
                        <p className="text-xl text-red-300 mt-4 font-bold text-center uppercase tracking-widest">
                            {event.subtitle}
                        </p>
                    </div>
                );
            case 'SEASON_SUMMARY':
                return (
                    <div className="flex flex-col items-center justify-center animate-scale-in relative z-10 max-w-2xl w-full">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tight text-center mb-2">
                            {event.title}
                        </h1>
                        <p className="text-sky-400 mb-8 font-bold uppercase tracking-widest">
                            {event.subtitle}
                        </p>
                        
                        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-8 rounded-3xl w-full shadow-2xl space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                                <span className="text-slate-400 uppercase font-bold text-sm">Posición Final</span>
                                <span className="text-2xl font-black text-white">{event.metadata?.position}º</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                                <span className="text-slate-400 uppercase font-bold text-sm">Ascensos a 1ra</span>
                                <span className="text-lg font-bold text-green-400 text-right">{event.metadata?.promoted?.join(', ') || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                                <span className="text-slate-400 uppercase font-bold text-sm">Descensos a 2da</span>
                                <span className="text-lg font-bold text-red-400 text-right">{event.metadata?.relegated?.join(', ') || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-slate-400 uppercase font-bold text-sm">Balance Actual</span>
                                <span className="text-2xl font-black text-sky-400">{event.metadata?.balance ? formatCurrency(event.metadata.balance) : '-'}</span>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="text-center">
                        <h1 className="text-5xl font-black text-white uppercase">{event.title}</h1>
                        <p className="text-xl text-slate-300 mt-4">{event.subtitle}</p>
                    </div>
                );
        }
    };

    const accentColor = event.metadata?.accentColor || '#6366F1';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950 select-none">
            {/* Ambient luxury backdrop without tacky lines */}
            <div
                className="fixed inset-0 transition-opacity duration-1000 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse 90% 70% at 50% 25%, ${accentColor}20 0%, rgba(15, 23, 42, 0.96) 65%, #020617 100%)`
                }}
            />
            {/* Soft vignette */}
            <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
            
            {/* Main content - perfectly centered and symmetrical */}
            <div className="relative z-10 w-full max-h-screen flex flex-col items-center justify-center p-3 sm:p-4 my-auto">
                {renderContent()}

                <button
                    onClick={onContinue}
                    className="mt-3 sm:mt-4 bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/45 text-white px-8 py-2.5 rounded-full font-black uppercase tracking-[0.2em] text-xs backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2 group"
                >
                    <span>Continuar</span>
                    <span className="text-xs transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
            </div>
        </div>
    );
};
