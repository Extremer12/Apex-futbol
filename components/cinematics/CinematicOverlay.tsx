import React from 'react';
import { CinematicEvent } from '../../types';
import { Confetti } from '../ui/Confetti';
import { TrophyIcon, TrendingUpIcon, TrendingDownIcon } from '../icons';
import { formatCurrency } from '../../utils';

interface CinematicOverlayProps {
    event: CinematicEvent;
    onContinue: () => void;
}

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({ event, onContinue }) => {
    
    const renderContent = () => {
        switch (event.type) {
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
            {/* Fondo oscuro desenfocado */}
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl transition-all duration-1000"></div>
            
            {/* Contenedor principal de la animación */}
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
