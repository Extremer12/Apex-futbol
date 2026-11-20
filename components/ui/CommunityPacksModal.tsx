import React, { useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import { CommunityPacksSection } from '../screens/settings/CommunityPacksSection';

interface CommunityPacksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CommunityPacksModal: React.FC<CommunityPacksModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-in" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full sm:max-w-5xl bg-[#0A0E17] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 h-[92vh] sm:h-[88vh] flex flex-col">
                <div className="sm:hidden flex justify-center pt-2.5">
                    <span className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 bg-[#070A13]/95 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/30 flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4 text-[var(--apex-gold)]" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs font-black text-white uppercase tracking-wider block truncate">
                                Gestor de Packs Visuales
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                                Escudos, ligas, rostros y trofeos
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
                    <CommunityPacksSection embedded />
                </div>
            </div>
        </div>
    );
};
