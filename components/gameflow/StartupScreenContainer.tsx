import React from 'react';

export const StartupScreenContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 relative overflow-hidden">
        {/* Background Layer with subtle parallax-like movement */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center animate-slow-zoom"
            style={{ 
                backgroundImage: 'url("/bg-start.png")',
                filter: 'brightness(1.0) saturate(1.1)'
            }}
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 z-1 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        <div className="absolute inset-0 z-1 bg-radial-gradient from-transparent via-black/20 to-black/60" />

        {/* Floating Particles/Glows for "Parallax" feel without aesthetic cost */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--apex-gold)]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Content Box */}
        <div className="w-full max-w-md apex-glass p-8 relative z-10 shadow-2xl border border-white/10 animate-scale-in">
            {children}
        </div>

        {/* Footer Hint */}
        <div className="absolute bottom-8 text-[9px] font-black uppercase tracking-[0.4em] text-white/30 z-10">
            Apex Football AI • Gestión de Élite
        </div>
    </div>
);
