import React from 'react';

interface CircularProgressProps {
    value: number;
    label: string;
    color: string;
    status: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = React.memo(({
    value,
    label,
    color,
    status
}) => {
    const clamped = Math.max(0, Math.min(100, value));

    return (
        <div className="apex-card p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{label}</span>
                <span
                    className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border"
                    style={{
                        color,
                        borderColor: `${color}35`,
                        backgroundColor: `${color}12`
                    }}
                >
                    {status}
                </span>
            </div>

            <div className="my-1 flex items-baseline justify-between">
                <span className="text-2xl font-black text-white tracking-tight">{clamped}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Objetivo: &gt;50%</span>
            </div>

            <div className="pt-3 mt-3 border-t border-white/5">
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${clamped}%`, backgroundColor: color }}
                    />
                </div>
            </div>
        </div>
    );
});
