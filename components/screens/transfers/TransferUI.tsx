import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const SHEET_SIZE_CLASS: Record<'md' | 'lg' | 'xl', string> = {
    md: 'sm:max-w-md',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
};

/** Responsive native top-layer dialog: bottom sheet on mobile, centered dialog on desktop. */
export const BottomSheet: React.FC<{
    open: boolean;
    onClose: () => void;
    title?: string;
    size?: 'md' | 'lg' | 'xl';
    children: React.ReactNode;
    footer?: React.ReactNode;
}> = ({ open, onClose, title, size = 'md', children, footer }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleClose = () => {
            onCloseRef.current();
        };
        dialog.addEventListener('close', handleClose);

        // Fallback light-dismiss when native closedby attribute is unsupported
        let cleanupFallback: (() => void) | undefined;
        if (!('closedBy' in HTMLDialogElement.prototype)) {
            let pressedOutside = false;
            const isOutside = (e: PointerEvent) => {
                const r = dialog.getBoundingClientRect();
                return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
            };
            const onPointerDown = (e: PointerEvent) => {
                pressedOutside = isOutside(e);
            };
            const onPointerUp = (e: PointerEvent) => {
                if (pressedOutside && isOutside(e)) {
                    dialog.close();
                }
                pressedOutside = false;
            };
            dialog.addEventListener('pointerdown', onPointerDown);
            dialog.addEventListener('pointerup', onPointerUp);
            cleanupFallback = () => {
                dialog.removeEventListener('pointerdown', onPointerDown);
                dialog.removeEventListener('pointerup', onPointerUp);
            };
        }

        return () => {
            dialog.removeEventListener('close', handleClose);
            cleanupFallback?.();
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
            {...({ closedby: 'any' } as any)}
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : 'Panel de detalle'}
            className={`apex-sheet fixed inset-x-0 bottom-0 top-auto sm:inset-0 m-0 sm:m-auto w-full max-w-full ${SHEET_SIZE_CLASS[size]} border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88dvh] overflow-hidden animate-fade-in`}
        >
            <div className="sm:hidden flex justify-center pt-2.5 shrink-0">
                <span className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            {title && (
                <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-white/5 shrink-0">
                    <h3 id={titleId} className="text-sm font-black text-white uppercase tracking-wider truncate pr-2">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={() => dialogRef.current?.close()}
                        aria-label="Cerrar"
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white shrink-0 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && (
                <div
                    className="px-5 pb-5 pt-3 border-t border-white/5 shrink-0"
                    style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
                >
                    {footer}
                </div>
            )}
        </dialog>
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
