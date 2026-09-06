import React, { useState, useRef } from 'react';
import { PlayerProfile } from '../../types';

interface ProfileCreationProps {
    onProfileCreate: (profile: PlayerProfile) => void;
}

const EXPERIENCE_OPTIONS = [
    { value: 0, label: 'Novato', desc: 'Primera vez al mando' },
    { value: 1, label: 'Experimentado', desc: 'Conoces el oficio' },
    { value: 2, label: 'Leyenda', desc: 'Nacido para liderar' },
];

export const ProfileCreation: React.FC<ProfileCreationProps> = ({ onProfileCreate }) => {
    const [name, setName] = useState('');
    const [experience, setExperience] = useState(0);
    const [photo, setPhoto] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setPhoto(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onProfileCreate({ 
                name: name.trim(), 
                experience,
                photo: photo || undefined 
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--apex-dark)' }}>
            {/* Background */}
            <div className="absolute inset-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
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

                            {/* Avatar Picker */}
                            <div className="flex flex-col items-center mb-6">
                                <input 
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-24 h-24 rounded-full flex items-center justify-center mb-2 relative group cursor-pointer transition-transform active:scale-95 overflow-hidden"
                                    style={{ 
                                        border: '2px solid var(--apex-gold)', 
                                        background: photo ? '#000' : 'linear-gradient(135deg, rgba(200,168,78,0.1), rgba(15,20,35,0.8))' 
                                    }}
                                    title="Toca para subir tu foto"
                                >
                                    {photo ? (
                                        <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-gold-dim)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}

                                    {/* Camera / Edit badge */}
                                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                                         style={{ background: 'var(--apex-gold)', color: '#0A0E17' }}>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-[11px] font-bold tracking-wider uppercase transition-opacity hover:opacity-80"
                                    style={{ color: 'var(--apex-gold)' }}
                                >
                                    {photo ? 'Cambiar Foto' : '+ Subir Foto'}
                                </button>
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
