import React from 'react';

export const ConfidenceMeter: React.FC<{ value: number }> = ({ value }) => {
    const getBarColor = (v: number) => {
        if (v > 66) return 'bg-green-500';
        if (v > 33) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    return (
        <div>
            <div className="flex justify-between items-end mb-1">
                <p className="text-sm text-slate-400">Confianza Directiva</p>
                <p className="font-bold text-xl">{value}%</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className={`${getBarColor(value)} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );
};
