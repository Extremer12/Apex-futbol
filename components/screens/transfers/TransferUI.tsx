import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/** Responsive sheet: bottom sheet on mobile, centered dialog on desktop. */
export const BottomSheet: React.FC<{
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}> = ({ open, onClose, title, children, footer }) => {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-[#0D1220] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col">
                <div className="sm:hidden flex justify-center pt-2.5">
                    <span className="w-10 h-1 rounded-full bg-white/20" />
                </div>
                {title && (
                    <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-white/5">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
                        <button onClick={onClose} aria-label="Cerrar" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
                {footer && <div className="px-5 pb-5 pt-3 border-t border-white/5" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>{footer}</div>}
            </div>
        </div>
    );
};

export const OvrBadge: React.FC<{ value: number | string; muted?: boolean }> = ({ value, muted }) => (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
        muted ? 'bg-white/5 text-slate-300 border border-white/10 text-[11px]' : 'bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30'
    }`}>
        {value}
    </div>
);

export const StatCell: React.FC<{ label: string; value: React.ReactNode; accent?: string }> = ({ label, value, accent = 'text-white' }) => (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{label}</span>
        <span className={`text-sm font-black ${accent}`}>{value}</span>
    </div>
);

export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }> = ({ icon, title, text, action }) => (
    <div className="py-14 px-6 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-slate-500">{icon}</div>
        <h3 className="text-sm font-black text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-400 max-w-xs">{text}</p>
        {action && <div className="mt-4">{action}</div>}
    </div>
);

export const positionLabel: Record<string, string> = { POR: 'POR', DEF: 'DEF', CEN: 'MED', DEL: 'DEL' };
