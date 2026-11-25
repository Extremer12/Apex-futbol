import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/Modal';
import { AuthGate } from './AuthGate';

interface AuthModalProps {
    onClose: () => void;
    /** 'fullscreen' opens the 100vw×100dvh tunnel scene when signed out; 'modal' opens centered over the active career. */
    mode?: 'fullscreen' | 'modal';
}

const VIP_SPECS = [
    { num: '01', label: 'Nube Multidispositivo', detail: 'Sincroniza tus carreras entre PC y móvil' },
    { num: '02', label: 'Salón de la Fama', detail: 'Compite en el ranking mundial de presidentes' },
    { num: '03', label: 'Respaldo Oficial', detail: 'Acceso privado vinculado a tu cuenta Google' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, mode = 'modal' }) => {
    const { user, profile, isConfigured, signInWithGoogle, signOut } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        if (!isConfigured) {
            setErrorMsg('La conexión en la nube no está configurada en este entorno.');
            return;
        }
        setIsLoading(true);
        setErrorMsg(null);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setErrorMsg(err.message || 'Error al conectar con Google.');
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut();
            onClose();
        } catch (err: any) {
            setErrorMsg(err.message || 'Error al cerrar sesión.');
        } finally {
            setIsLoading(false);
        }
    };

    // Outside an active game (StartScreen / LoadGameScreen), signed-out login is 100% fullscreen parallax
    if (!user && mode === 'fullscreen') {
        return (
            <AuthGate
                onClose={onClose}
                onGoogle={handleGoogleLogin}
                isLoading={isLoading}
                errorMsg={errorMsg}
            />
        );
    }

    // Centered Executive Pass modal (inside an active career, or viewing signed-in President Pass)
    return (
        <Modal
            title={user ? 'Acreditación Presidencial' : 'Acceso al Palco Presidencial'}
            onClose={onClose}
            maxWidth="max-w-md"
            hideHeader
        >
            <div>
                {/* Panoramic Executive Boardroom Banner — zero generic icons */}
                <div
                    className="relative h-40 sm:h-44 w-full bg-cover bg-center flex flex-col justify-end p-5 overflow-hidden"
                    style={{ backgroundImage: 'url("/assets/hero/club.webp")' }}
                >
                    <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(180deg, rgba(6,9,19,0.20) 0%, rgba(6,9,19,0.60) 55%, #090E1C 100%)',
                        }}
                    />
                    <div className="relative z-10 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.32em] text-[var(--apex-gold)] mb-1">
                                {user ? 'Credencial Oficial' : 'Palco Presidencial'}
                            </p>
                            <h1 className="font-display text-2xl sm:text-3xl font-extrabold italic uppercase tracking-wide text-white leading-none">
                                {user ? 'Perfil Conectado' : 'Sincroniza Tu Club'}
                            </h1>
                        </div>
                        <img
                            src="/assets/logo.webp"
                            alt="Apex AI"
                            className="w-16 h-auto object-contain opacity-95 drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)] shrink-0"
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="px-5 pb-5 pt-2 space-y-4">
                    {user ? (
                        <>
                            <div className="apex-card p-4 flex items-center gap-3.5">
                                <div className="relative shrink-0">
                                    {profile?.avatar_url || user.user_metadata?.avatar_url ? (
                                        <img
                                            src={profile?.avatar_url || user.user_metadata?.avatar_url}
                                            alt="Avatar"
                                            className="w-14 h-14 rounded-2xl border-2 border-[var(--apex-gold)] object-cover shadow-[0_0_20px_rgba(255,201,64,0.3)]"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1C2A4D] to-[#0D1428] flex items-center justify-center border-2 border-[var(--apex-gold)] text-[var(--apex-gold)] font-display font-extrabold text-2xl">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="w-3 h-3 rounded-full bg-[var(--apex-green)] border-2 border-[#0E1527] absolute -bottom-1 -right-1 shadow-[0_0_8px_var(--apex-green)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-white truncate leading-tight">
                                        {profile?.full_name || user.user_metadata?.full_name || 'Presidente'}
                                    </h2>
                                    <p className="text-[var(--apex-text-secondary)] text-xs truncate">{user.email}</p>
                                    <div className="inline-flex items-center gap-1.5 mt-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--apex-green)]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--apex-green)] animate-pulse" />
                                        Nube Activa
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="apex-card p-3">
                                    <span className="text-[9px] font-bold text-[var(--apex-text-muted)] uppercase tracking-[0.2em] block mb-0.5">
                                        Rango de Cuenta
                                    </span>
                                    <span className="font-display text-base font-extrabold italic uppercase text-premium-gradient">
                                        Verificada
                                    </span>
                                </div>
                                <div className="apex-card p-3">
                                    <span className="text-[9px] font-bold text-[var(--apex-text-muted)] uppercase tracking-[0.2em] block mb-0.5">
                                        Acceso
                                    </span>
                                    <span className="font-display text-base font-extrabold italic uppercase text-white">
                                        Google OAuth
                                    </span>
                                </div>
                            </div>

                            {errorMsg && (
                                <p role="alert" className="p-3 bg-[var(--apex-red)]/15 border border-[var(--apex-red)]/35 rounded-xl text-xs text-[#FF8CA8] font-bold text-center">
                                    {errorMsg}
                                </p>
                            )}

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.07]">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                                >
                                    Volver
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    disabled={isLoading}
                                    className="px-4 py-2.5 bg-[var(--apex-red)]/15 hover:bg-[var(--apex-red)]/25 text-[#FF7A9A] border border-[var(--apex-red)]/35 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                                >
                                    {isLoading ? 'Cerrando…' : 'Cerrar Sesión'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <ol className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
                                {VIP_SPECS.map((s) => (
                                    <li key={s.num} className="py-2.5 flex items-baseline gap-3">
                                        <span className="font-display text-xl font-extrabold italic text-premium-gradient w-6 shrink-0">
                                            {s.num}
                                        </span>
                                        <div className="min-w-0">
                                            <div className="text-xs font-extrabold uppercase tracking-wide text-white">
                                                {s.label}
                                            </div>
                                            <div className="text-[11px] text-[var(--apex-text-secondary)]">
                                                {s.detail}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ol>

                            {errorMsg && (
                                <p role="alert" className="p-3 bg-[var(--apex-red)]/15 border border-[var(--apex-red)]/35 rounded-xl text-xs text-[#FF8CA8] font-bold text-center">
                                    {errorMsg}
                                </p>
                            )}

                            <div className="space-y-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    autoFocus
                                    className="apex-gate-google !animate-none"
                                >
                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                    <span>{isLoading ? 'Conectando con Google…' : 'Continuar con Google'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full py-2 text-[11px] text-[var(--apex-text-muted)] hover:text-white font-extrabold uppercase tracking-[0.18em] transition-colors cursor-pointer"
                                >
                                    Continuar en partida sin conectar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};
