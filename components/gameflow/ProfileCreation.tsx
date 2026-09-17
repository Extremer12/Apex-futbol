import React, { useState, useRef } from 'react';
import { PlayerProfile } from '../../types';
import { User, Calendar, Globe, ChevronDown, Camera } from 'lucide-react';

interface ProfileCreationProps {
    onProfileCreate: (profile: PlayerProfile) => void;
}

const NATIONALITIES = [
    { name: 'Argentina', flag: '🇦🇷' },
    { name: 'España', flag: '🇪🇸' },
    { name: 'Brasil', flag: '🇧🇷' },
    { name: 'Alemania', flag: '🇩🇪' },
    { name: 'Italia', flag: '🇮🇹' },
    { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Francia', flag: '🇫🇷' },
    { name: 'Uruguay', flag: '🇺🇾' },
    { name: 'Colombia', flag: '🇨🇴' },
    { name: 'Chile', flag: '🇨🇱' },
    { name: 'México', flag: '🇲🇽' },
    { name: 'Portugal', flag: '🇵🇹' },
    { name: 'Países Bajos', flag: '🇳🇱' },
    { name: 'Paraguay', flag: '🇵🇾' },
    { name: 'Perú', flag: '🇵🇪' },
    { name: 'Ecuador', flag: '🇪🇨' },
    { name: 'Bélgica', flag: '🇧🇪' },
    { name: 'Croacia', flag: '🇭🇷' },
    { name: 'Estados Unidos', flag: '🇺🇸' },
    { name: 'Japón', flag: '🇯🇵' },
    { name: 'Suiza', flag: '🇨🇭' },
    { name: 'Austria', flag: '🇦🇹' },
    { name: 'Bolivia', flag: '🇧🇴' },
    { name: 'Venezuela', flag: '🇻🇪' },
];

export const ProfileCreation: React.FC<ProfileCreationProps> = ({ onProfileCreate }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState(48);
    const [nationality, setNationality] = useState('Argentina');
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
        const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
        if (fullName) {
            const profileData = { 
                name: fullName,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                age: Number(age) || 48,
                nationality,
                country: nationality,
                experience: 0,
                photo: photo || undefined 
            };
            try {
                localStorage.setItem('apex_last_player_profile', JSON.stringify(profileData));
            } catch (e) {
                // Quota fallback if base64 photo is large
            }
            onProfileCreate(profileData);
        }
    };

    const isFormValid = (firstName.trim().length > 0 || lastName.trim().length > 0) && age >= 18;

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
                <div className="flex-1 flex flex-col px-5 pb-6 max-w-lg mx-auto w-full">
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
                                    className="w-24 h-24 rounded-full flex items-center justify-center mb-2 relative group cursor-pointer transition-transform active:scale-95 overflow-hidden shadow-xl"
                                    style={{ 
                                        border: '2px solid var(--apex-gold)', 
                                        background: photo ? '#000' : 'linear-gradient(135deg, rgba(200,168,78,0.1), rgba(15,20,35,0.8))' 
                                    }}
                                    title="Toca para subir tu foto"
                                >
                                    {photo ? (
                                        <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12" style={{ color: 'var(--apex-gold-dim)' }} />
                                    )}

                                    {/* Camera / Edit badge */}
                                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                                         style={{ background: 'var(--apex-gold)', color: '#0A0E17' }}>
                                        <Camera className="w-3.5 h-3.5" />
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

                            {/* Form Fields */}
                            <div className="space-y-4 flex-1">
                                {/* Nombre y Apellido (Side-by-Side) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5 text-white">
                                            Nombre
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--apex-text-muted)' }} />
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Ej. Julián"
                                                className="apex-input pl-9 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5 text-white">
                                            Apellido
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--apex-text-muted)' }} />
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Ej. Álvarez"
                                                className="apex-input pl-9 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Edad y Nacionalidad (Side-by-Side) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5 text-white">
                                            Edad
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--apex-text-muted)' }} />
                                            <input
                                                type="number"
                                                min={21}
                                                max={85}
                                                value={age}
                                                onChange={(e) => setAge(Math.max(18, Math.min(99, parseInt(e.target.value) || 18)))}
                                                className="apex-input pl-9 text-sm font-semibold"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5 text-white">
                                            Nacionalidad
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--apex-text-muted)' }} />
                                            <select
                                                value={nationality}
                                                onChange={(e) => setNationality(e.target.value)}
                                                className="apex-input pl-9 pr-8 text-sm font-medium appearance-none cursor-pointer bg-[#0D1220] text-white"
                                            >
                                                {NATIONALITIES.map((nat) => (
                                                    <option key={nat.name} value={nat.name} className="bg-[#0D1220] text-white">
                                                        {nat.flag} {nat.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!isFormValid}
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
                                <p className="text-[10px] text-white font-medium">Tu perfil define la identidad de tu gestión.</p>
                                <p className="text-[9px]" style={{ color: 'var(--apex-text-muted)' }}>Representa a tu club con orgullo y liderazgo institucional.</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
