import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from './AuthModal';

export const UserBadge: React.FC = () => {
    const { user, profile } = useAuth();
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
    const name = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0];

    return (
        <>
            {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
            
            <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 transition-transform active:scale-95 cursor-pointer focus:outline-none"
                title={user ? `Conectado como ${name}` : 'Iniciar sesión con Google'}
            >
                {user ? (
                    <div className="relative flex items-center gap-2">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full object-cover shadow-lg border border-[var(--apex-gold)]"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-black text-[var(--apex-gold)] border border-[var(--apex-gold)]/40 shadow-lg">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0A0E17] absolute -bottom-0.5 -right-0.5" title="Sincronizado con Supabase"></span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 shadow-md">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">
                            Conectar
                        </span>
                    </div>
                )}
            </button>
        </>
    );
};
