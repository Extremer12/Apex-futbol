import React from 'react';

export const ConfidenceMeter: React.FC<{ value: number }> = ({ value }) => {
    const getBarColor = (v: number) => {
        if (v > 75) return 'from-green-500 to-emerald-400';
        if (v > 50) return 'from-yellow-500 to-amber-400';
        if (v > 25) return 'from-orange-500 to-red-400';
        return 'from-red-600 to-red-500';
    };

    const getIcon = (v: number) => {
        if (v > 75) return '😊';
        if (v > 50) return '😐';
        if (v > 25) return '😟';
        return '😠';
    };

    const getMessage = (v: number) => {
        if (v > 75) return 'Excelente';
        if (v > 50) return 'Bien';
        if (v > 25) return 'Preocupante';
        return 'Crítico';
    };

    const getTextColor = (v: number) => {
        if (v > 75) return 'text-green-400';
        if (v > 50) return 'text-yellow-400';
        if (v > 25) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{getIcon(value)}</span>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Confianza</p>
                        <p className={`text-sm font-bold ${getTextColor(value)}`}>{getMessage(value)}</p>
                    </div>
                </div>
                <div className={`text-3xl font-black ${getTextColor(value)}`}>{value}%</div>
            </div>
            <div className="relative w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${getBarColor(value)} transition-all duration-700 ease-out shadow-lg`}
                    style={{ width: `${value}%` }}
                >
                    <div className="h-full w-full bg-white/20 animate-pulse" />
                </div>
            </div>
        </div>
    );
};
