import React from 'react';
import { UsersIcon } from '../../icons';
import { Shield } from 'lucide-react';

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
        <div className="apex-card p-5 flex flex-col items-center justify-center relative overflow-hidden group border border-white/10 hover:border-white/25 transition-all shadow-xl">
            {/* Subtle Center Glow Aura */}
            <div 
                className="absolute w-28 h-28 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-35"
                style={{ backgroundColor: color }}
            />

            <div className="absolute top-2 right-2 p-1.5 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-8 h-8" style={{ color }} />
            </div>

            <span className="text-[9px] font-black tracking-[0.2em] text-white/50 uppercase mb-3 relative z-10">{label}</span>
            
            <div className="relative flex items-center justify-center mb-3">
                <svg className="w-24 h-24 transform -rotate-90 drop-shadow-[0_0_12px_rgba(0,0,0,0.5)]">
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/[0.06]" />
                    <circle 
                        cx="48" cy="48" r={radius} stroke={color} strokeWidth="6" fill="transparent" 
                        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">{value}%</span>
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <span 
                    className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border shadow-sm"
                    style={{ 
                        color, 
                        borderColor: `${color}40`,
                        backgroundColor: `${color}15`
                    }}
                >
                    {status}
                </span>
                <span className="text-[8px] text-white/35 font-bold uppercase tracking-wider mt-1.5">+2% este mes</span>
            </div>
        </div>
    );
};
