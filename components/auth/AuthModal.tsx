import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/Modal';
import { TrophyIcon, UsersIcon } from '../icons';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const { user, profile, signInWithGoogle, signOut } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
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

    return (
        <Modal title={user ? "Perfil de Presidente" : "Conectar Cuenta Apex AI"} onClose={onClose}>
            <div className="space-y-6">
                {user ? (
                    /* User is logged in */
                    <div className="space-y-5">
                        <div className="flex items-center gap-4 p-4 bg-slate-800/60 border border-white/10 rounded-2xl">
                            {profile?.avatar_url || user.user_metadata?.avatar_url ? (
                                <img
                                    src={profile?.avatar_url || user.user_metadata?.avatar_url}
                                    alt="Avatar"
                                    className="w-14 h-14 rounded-full border-2 border-[var(--apex-gold)] object-cover shadow-lg"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center border-2 border-[var(--apex-gold)] text-white font-black text-xl">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-black text-base truncate">
                                    {profile?.full_name || user.user_metadata?.full_name || 'Presidente'}
                                </h3>
                                <p className="text-slate-400 text-xs truncate">{user.email}</p>
                                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Sincronización en la Nube Activa (Supabase)
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estado</span>
                                <span className="text-xs font-black text-[var(--apex-gold)]">Cuenta Verificada</span>
                            </div>
                            <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Proveedor</span>
                                <span className="text-xs font-black text-white">Google OAuth</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={handleSignOut}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                            >
                                {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* User is not logged in */
                    <div className="space-y-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--apex-gold)]/20 to-yellow-500/10 border border-[var(--apex-gold)]/30 flex items-center justify-center mx-auto shadow-xl">
                            <TrophyIcon className="w-8 h-8 text-[var(--apex-gold)]" />
                        </div>

                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">
                                Conecta con Google
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                Desbloquea el guardado en la nube multidispositivo, participa en el Salón de la Fama global y protege tus carreras.
                            </p>
                        </div>

                        {/* Benefits List */}
                        <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 text-left space-y-2.5">
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <span className="text-base">☁️</span>
                                <span><strong>Partidas en la nube:</strong> Continúa tu carrera en PC o móvil.</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <span className="text-base">🏆</span>
                                <span><strong>Salón de la Fama:</strong> Compite en el ranking global de presidentes.</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <span className="text-base">🔒</span>
                                <span><strong>Seguridad Supabase:</strong> Acceso privado protegido con RLS.</span>
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 font-bold">
                                {errorMsg}
                            </div>
                        )}

                        {/* Google Sign In Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full py-3.5 px-6 bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 group"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            {isLoading ? 'Conectando con Google...' : 'Continuar con Google'}
                        </button>

                        <button
                            onClick={onClose}
                            className="text-[11px] text-slate-500 hover:text-slate-400 font-bold uppercase tracking-wider block mx-auto transition-colors"
                        >
                            Continuar como Invitado (Modo Offline)
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};
