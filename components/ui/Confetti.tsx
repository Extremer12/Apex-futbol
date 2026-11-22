import React, { useEffect, useState } from 'react';

interface ConfettiProps {
    count?: number;
    palette?: 'gold' | 'celebration';
}

interface ConfettiParticle {
    id: number;
    x: number;
    delay: number;
    duration: number;
    color: string;
    size: number;
    rotation: number;
}

const PALETTES: Record<'gold' | 'celebration', string[]> = {
    gold: ['#C8A84E', '#FFD700', '#FDE68A', '#F59E0B', '#E2E8F0', '#38BDF8'],
    celebration: ['#facc15', '#38bdf8', '#f43f5e', '#a78bfa', '#34d399', '#fb923c'],
};

export const Confetti: React.FC<ConfettiProps> = ({ count = 72, palette = 'gold' }) => {
    const [particles, setParticles] = useState<ConfettiParticle[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setParticles([]);
            return;
        }
        const colors = PALETTES[palette] || PALETTES.gold;
        const safeCount = Math.min(count, 90);
        const newParticles: ConfettiParticle[] = Array.from({ length: safeCount }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 1.8,
            duration: Math.random() * 2.6 + 2.4,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 5,
            rotation: Math.random() * 360,
        }));
        setParticles(newParticles);
    }, [count, palette]);

    if (particles.length === 0) return null;

    return (
        <div className="apex-confetti-layer fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden="true">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute top-[-10%] rounded-[2px]"
                    style={{
                        left: `${p.x}%`,
                        width: `${p.size}px`,
                        height: `${p.size * 0.55}px`,
                        backgroundColor: p.color,
                        animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`,
                        transform: `rotate(${p.rotation}deg)`,
                    }}
                />
            ))}
        </div>
    );
};
