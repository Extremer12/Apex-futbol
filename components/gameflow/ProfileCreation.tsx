import React, { useState } from 'react';
import { PlayerProfile } from '../../types';

interface ProfileCreationProps {
    onProfileCreate: (profile: PlayerProfile) => void;
}

const EXPERIENCE_OPTIONS = [
    { value: 0, label: 'Rookie', desc: 'First time in charge' },
    { value: 1, label: 'Experienced', desc: 'You know the ropes' },
    { value: 2, label: 'Legend', desc: 'Born to lead' },
];

export const ProfileCreation: React.FC<ProfileCreationProps> = ({ onProfileCreate }) => {
    const [name, setName] = useState('');
    const [experience, setExperience] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onProfileCreate({ name: name.trim(), experience });
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--apex-dark)' }}>
            {/* Background */}
            <div className="absolute inset-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-out animate-slow-zoom"
                    style={{ 
                        backgroundImage: 'url("/bg-profile.png")',
                        filter: 'brightness(1.0) saturate(1.1)'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E17]/80 via-[#0D1220]/60 to-[#0A0E17]/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="text-center pt-8 pb-4 px-6">
                    <h1 className="text-lg font-extrabold tracking-[0.2em] uppercase text-white mb-1">Crea Tu Perfil</h1>
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: 'var(--apex-text-secondary)' }}>
                        Construye tu legado. Lidera tu club.
                    </p>
                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--apex-gold)' }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--apex-text-muted)', opacity: 0.3 }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--apex-text-muted)', opacity: 0.3 }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--apex-text-muted)', opacity: 0.3 }} />
                    </div>
                </div>

                {/* Main Card */}
                <div className="flex-1 flex flex-col px-5 pb-6">
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                        <div className="apex-card p-6 flex-1 flex flex-col animate-scale-in">
                            {/* Card Header */}
                            <div className="text-center mb-6">
                                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--apex-gold)' }}>
                                    Paso 1 de 4
                                </p>
                                <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">Perfil de Presidente</h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--apex-text-secondary)' }}>
                                    Define tu identidad. Comienza tu viaje.
                                </p>
                            </div>

                            {/* Avatar */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3 relative"
                                     style={{ border: '2px solid var(--apex-gold)', background: 'linear-gradient(135deg, rgba(200,168,78,0.1), rgba(15,20,35,0.8))' }}>
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-gold-dim)' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                                         style={{ background: 'var(--apex-card-solid)', border: '1px solid var(--apex-border)' }}>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-text-secondary)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="space-y-5 flex-1">
                                {/* President Name */}
                                <div>
                                    <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2 text-white">Nombre del Presidente</label>
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-text-muted)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Introduce tu nombre"
                                            className="apex-input"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Experience Level */}
                                <div>
                                    <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2 text-white">Nivel de Experiencia</label>
                                    <div className="space-y-2">
                                        {EXPERIENCE_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setExperience(opt.value)}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                                                style={{
                                                    background: experience === opt.value ? 'rgba(200,168,78,0.08)' : 'rgba(10,14,23,0.6)',
                                                    border: `1px solid ${experience === opt.value ? 'var(--apex-gold)' : 'var(--apex-border)'}`,
                                                }}
                                            >
                                                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                                     style={{ borderColor: experience === opt.value ? 'var(--apex-gold)' : 'var(--apex-text-muted)' }}>
                                                    {experience === opt.value && (
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--apex-gold)' }} />
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-white">{opt.label}</div>
                                                    <div className="text-[10px]" style={{ color: 'var(--apex-text-secondary)' }}>{opt.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="apex-btn-gold mt-6 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                CONTINUAR
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Footer Tip */}
                        <div className="flex items-center gap-3 mt-4 px-4 py-3 rounded-xl" style={{ background: 'var(--apex-card)', border: '1px solid var(--apex-border)' }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(200,168,78,0.1)', border: '1px solid var(--apex-border)' }}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-gold)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] text-white font-medium">Tu perfil define cómo te ve el mundo.</p>
                                <p className="text-[9px]" style={{ color: 'var(--apex-text-muted)' }}>Elige sabiamente — cada decisión define tu legado.</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
