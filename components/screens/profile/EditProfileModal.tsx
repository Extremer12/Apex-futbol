import React, { useState, useEffect, useRef } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { BottomSheet } from '../transfers/TransferUI';

interface EditProfileModalProps {
    isOpen: boolean;
    initialFirstName: string;
    initialLastName: string;
    initialNationality: string;
    initialAge?: number;
    initialPhoto?: string;
    onSave: (data: {
        name: string;
        firstName: string;
        lastName: string;
        nationality: string;
        age?: number;
        photo?: string;
    }) => void;
    onClose: () => void;
}

const NATIONALITIES = [
    'Argentina', 'Brasil', 'España', 'Inglaterra', 'Alemania', 'Italia', 'Francia',
    'México', 'Colombia', 'Chile', 'Uruguay', 'Paraguay', 'Portugal', 'Estados Unidos'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = React.memo(({
    isOpen,
    initialFirstName,
    initialLastName,
    initialNationality,
    initialAge,
    initialPhoto,
    onSave,
    onClose
}) => {
    const [firstName, setFirstName] = useState(initialFirstName);
    const [lastName, setLastName] = useState(initialLastName);
    const [nationality, setNationality] = useState(initialNationality);
    const [age, setAge] = useState<string>(initialAge ? String(initialAge) : '38');
    const [photo, setPhoto] = useState<string | undefined>(initialPhoto);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setFirstName(initialFirstName);
            setLastName(initialLastName);
            setNationality(initialNationality);
            setAge(initialAge ? String(initialAge) : '38');
            setPhoto(initialPhoto);
        }
    }, [isOpen, initialFirstName, initialLastName, initialNationality, initialAge, initialPhoto]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setPhoto(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fn = firstName.trim();
        const ln = lastName.trim();
        const fullName = [fn, ln].filter(Boolean).join(' ') || 'Presidente';
        const parsedAge = Math.max(18, Math.min(85, parseInt(age, 10) || 38));
        onSave({
            name: fullName,
            firstName: fn,
            lastName: ln,
            nationality: nationality.trim() || 'Argentina',
            age: parsedAge,
            photo
        });
        onClose();
    };

    return (
        <BottomSheet
            open={isOpen}
            onClose={onClose}
            title="Editar Perfil"
            footer={
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="edit-president-profile-form"
                        className="flex-1 h-11 rounded-xl bg-[var(--apex-gold)] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Guardar Cambios
                    </button>
                </div>
            }
        >
            <form id="edit-president-profile-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3.5">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                    />
                    <div className="w-16 h-16 rounded-2xl bg-[#070A13] border border-white/15 overflow-hidden flex items-center justify-center shrink-0">
                        {photo ? (
                            <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="w-5 h-5 text-slate-500" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer"
                        >
                            {photo ? 'Cambiar foto' : 'Subir foto'}
                        </button>
                        {photo && (
                            <button
                                type="button"
                                onClick={() => setPhoto(undefined)}
                                className="h-9 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Quitar</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            placeholder="Nombre"
                            required
                            className="w-full h-10 px-3 rounded-xl bg-[#070A13] border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--apex-gold)]/60"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Apellido</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            placeholder="Apellido"
                            className="w-full h-10 px-3 rounded-xl bg-[#070A13] border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--apex-gold)]/60"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Edad</label>
                        <input
                            type="number"
                            min={18}
                            max={85}
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-[#070A13] border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--apex-gold)]/60"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nacionalidad</label>
                        <select
                            value={NATIONALITIES.includes(nationality) ? nationality : 'Argentina'}
                            onChange={e => setNationality(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-[#070A13] border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--apex-gold)]/60"
                        >
                            {NATIONALITIES.map(nat => (
                                <option key={nat} value={nat}>{nat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </form>
        </BottomSheet>
    );
});
