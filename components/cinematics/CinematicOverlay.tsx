import React, { useEffect, useState } from 'react';
import { CinematicEvent } from '../../types';
import { Confetti } from '../ui/Confetti';
import { TrophyIcon, TrendingUpIcon, TrendingDownIcon } from '../icons';
import { formatCurrency } from '../../utils';

interface CinematicOverlayProps {
    event: CinematicEvent;
    onContinue: () => void;
}

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({ event, onContinue }) => {
    const [visible, setVisible] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);

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
            case 'LEAGUE_WIN':
            case 'CUP_WIN':
                return (
                    <div className="flex flex-col items-center justify-center animate-trophy-rise relative z-10">
                        <div className="w-48 h-48 mb-8 drop-shadow-[0_0_50px_rgba(250,204,21,0.6)]">
                            <TrophyIcon className="w-full h-full text-yellow-400" />
                        </div>
                        <h1 className="text-6xl font-black text-white uppercase tracking-tight text-center drop-shadow-2xl">
                            {event.title}
                        </h1>
                        <p className="text-2xl text-yellow-300 mt-4 font-bold text-center uppercase tracking-widest">
                            {event.subtitle}
                        </p>
                        <Confetti count={150} />
                    </div>
                );
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

    // Dynamic background for CUP_KICKOFF
    const bgGradient = event.type === 'CUP_KICKOFF'
        ? `bg-gradient-to-br ${event.metadata?.bgClass || 'from-indigo-900 via-slate-950 to-slate-950'}`
        : '';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className={`absolute inset-0 backdrop-blur-xl transition-all duration-1000 ${bgGradient || 'bg-slate-950/90'}`} />

            {/* Animated diagonal lines for CUP_KICKOFF */}
            {event.type === 'CUP_KICKOFF' && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-px opacity-10 animate-pulse"
                            style={{
                                top: `${10 + i * 12}%`,
                                left: '-10%',
                                right: '-10%',
                                background: `linear-gradient(to right, transparent, ${event.metadata?.accentColor || '#6366F1'}, transparent)`,
                                animationDelay: `${i * 0.15}s`
                            }}
                        />
                    ))}
                </div>
            )}
            
            {/* Main content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
                {renderContent()}

                <button
                    onClick={onContinue}
                    className="mt-16 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
};
