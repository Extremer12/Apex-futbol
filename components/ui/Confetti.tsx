import React, { useEffect, useState } from 'react';

interface ConfettiProps {
    count?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ count = 100 }) => {
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        const colors = ['#facc15', '#38bdf8', '#f43f5e', '#a78bfa', '#34d399', '#fb923c'];
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 2,
            duration: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 5,
            rotation: Math.random() * 360
        }));
        setParticles(newParticles);
    }, [count]);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute top-[-10%] rounded-sm"
                    style={{
                        left: `${p.x}%`,
                        width: `${p.size}px`,
                        height: `${p.size * 0.6}px`,
                        backgroundColor: p.color,
                        animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`,
                        transform: `rotate(${p.rotation}deg)`
                    }}
                />
            ))}
        </div>
    );
};
