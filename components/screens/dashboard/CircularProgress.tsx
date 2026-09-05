import React from 'react';
import { UsersIcon } from '../../icons';

interface CircularProgressProps {
    value: number;
    label: string;
    color: string;
    status: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    label,
    color,
    status
}) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="apex-card p-5 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <UsersIcon className="w-12 h-12" />
            </div>
            <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase mb-4">{label}</span>
            <div className="relative flex items-center justify-center mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                    <circle 
                        cx="48" cy="48" r={radius} stroke={color} strokeWidth="6" fill="transparent" 
                        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-white leading-none">{value}%</span>
                </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{status}</span>
            <span className="text-[8px] text-white/30 font-bold mt-1">+2% este mes</span>
        </div>
    );
};
