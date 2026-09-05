import React from 'react';

export const StadiumRevenueCard: React.FC = () => {
    return (
        <div className="apex-card p-5 relative overflow-hidden group">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                    <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase mb-4 block">Ingresos del Estadio</span>
                    <div className="text-3xl font-black text-white mb-1">€127.8M</div>
                    <div className="text-[9px] text-[var(--apex-green)] font-bold uppercase tracking-widest">+€18.3M este mes</div>
                </div>
                
                <div className="flex items-end gap-1.5 h-16">
                    {[30, 45, 25, 60, 40, 80, 55, 90, 70, 85].map((h, i) => (
                        <div 
                            key={i} 
                            className="w-2 bg-gradient-to-t from-[var(--apex-gold)] to-yellow-200 rounded-t-sm opacity-40 group-hover:opacity-100 transition-opacity" 
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-2 min-w-[120px]">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest border-b border-white/5 pb-1">
                        <span className="text-white/40">Día de Partido</span>
                        <span className="text-white">€68.4M</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest border-b border-white/5 pb-1">
                        <span className="text-white/40">Comercial</span>
                        <span className="text-white">€41.7M</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-white/40">Otros</span>
                        <span className="text-white">€17.7M</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
