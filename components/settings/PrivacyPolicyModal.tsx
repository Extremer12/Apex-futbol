import React from 'react';
import { Shield, Lock, EyeOff, Database, Trash2, ExternalLink } from 'lucide-react';
import { BottomSheet } from '../screens/transfers/TransferUI';

interface PrivacyPolicyModalProps {
    onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
    return (
        <BottomSheet
            open
            onClose={onClose}
            size="lg"
            title="Política de Privacidad y Datos"
            footer={
                <div className="flex items-center justify-between gap-3">
                    <a
                        href="/privacy.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-bold"
                    >
                        <span>Ver web completa</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 px-5 rounded-xl bg-[var(--apex-gold)] text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Entendido
                    </button>
                </div>
            }
        >
            <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                        <strong className="text-white block mb-0.5">Privacidad por Diseño · Google Play Compliant</strong>
                        <p className="text-slate-300/90 leading-relaxed">
                            Apex AI Football President funciona con arquitectura offline-first: tu progreso queda en tu dispositivo y nunca vendemos información personal.
                        </p>
                    </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider">
                        <Database className="w-4 h-4 text-[var(--apex-gold)]" />
                        <h4>1. Almacenamiento de Partidas</h4>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        <strong className="text-slate-200">Modo Local:</strong> Sin iniciar sesión, el 100% de tus carreras se guarda localmente en IndexedDB.{' '}
                        <strong className="text-slate-200">Modo Nube:</strong> Con Google OAuth opcional, Supabase respalda únicamente tus partidas y tu puntaje en el Salón de la Fama.
                    </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <h4>2. Base Vectorial y Packs</h4>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        El juego se distribuye con escudos vectoriales neutrales. Los packs de la comunidad son opcionales, se almacenan localmente en tu dispositivo y puedes purgarlos con un clic.
                    </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider">
                        <EyeOff className="w-4 h-4 text-amber-400" />
                        <h4>3. Cero Permisos Invasivos</h4>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        No solicitamos cámara, micrófono, ubicación GPS, contactos ni identificadores publicitarios cross-app.
                    </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-200 font-black text-xs uppercase tracking-wider">
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        <h4>4. Eliminación Total de Cuenta</h4>
                    </div>
                    <p className="text-rose-200/80 leading-relaxed">
                        Puedes eliminar definitivamente todos los registros locales y en Supabase desde{' '}
                        <strong className="text-white">Ajustes &gt; Sistema &gt; Zona de Peligro</strong>.
                    </p>
                </div>
            </div>
        </BottomSheet>
    );
};
