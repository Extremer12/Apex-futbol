import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { closeTopLayer } from './topLayerDialog';

interface ModalProps {
    children: React.ReactNode;
    title: string;
    onClose: () => void;
    isOpen?: boolean;
    maxWidth?: string;
    hideHeader?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    children,
    title,
    onClose,
    isOpen = true,
    maxWidth = 'max-w-lg',
    hideHeader = false,
}) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen && !dialog.open) {
            dialog.showModal();
        } else if (!isOpen && dialog.open) {
            void closeTopLayer(dialog);
        }

        let disposed = false;
        const handleClose = () => {
            if (disposed || dialog.open) return;
            dialog.returnValue = '';
            onCloseRef.current();
        };
        const handleCancel = (e: Event) => {
            e.preventDefault();
            void closeTopLayer(dialog);
        };
        dialog.addEventListener('close', handleClose);
        dialog.addEventListener('cancel', handleCancel);

        // Light-dismiss fallback for browsers lacking native `closedby="any"` (e.g. Safari)
        let cleanupFallback: (() => void) | undefined;
        if (!('closedBy' in HTMLDialogElement.prototype)) {
            const outside = (e: PointerEvent) => {
                const r = dialog.getBoundingClientRect();
                return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
            };
            let pressedOutside = false;
            const onPointerDown = (e: PointerEvent) => { pressedOutside = outside(e); };
            const onPointerUp = (e: PointerEvent) => {
                if (pressedOutside && outside(e)) void closeTopLayer(dialog);
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
            disposed = true;
            dialog.removeEventListener('close', handleClose);
            dialog.removeEventListener('cancel', handleCancel);
            cleanupFallback?.();
            if (dialog.open) dialog.close();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={hideHeader ? undefined : titleId}
            aria-label={hideHeader ? title : undefined}
            {...({ closedby: 'any' } as any)}
            className={`apex-dialog w-full ${maxWidth}`}
        >
            <div
                className="relative w-full rounded-3xl flex flex-col overflow-hidden max-h-[92dvh]"
                style={{
                    background: 'radial-gradient(120% 70% at 50% 0%, rgba(45, 212, 255, 0.12), transparent 55%), linear-gradient(170deg, #121B35 0%, #090E1C 58%, #060913 100%)',
                    border: '1px solid rgba(140, 180, 255, 0.18)',
                    boxShadow: '0 28px 70px -15px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
                }}
            >
                {/* Top rim highlight */}
                <div
                    aria-hidden
                    className="h-[2px] w-full shrink-0"
                    style={{ background: 'linear-gradient(90deg, transparent, var(--apex-brand), var(--apex-gold), transparent)' }}
                />

                {hideHeader ? (
                    <button
                        type="button"
                        onClick={() => void closeTopLayer(dialogRef.current)}
                        aria-label="Cerrar ventana"
                        className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white/80 hover:text-white cursor-pointer transition-all active:scale-90 backdrop-blur-md"
                    >
                        <X className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="px-5 py-3.5 border-b border-white/[0.07] bg-black/25 flex justify-between items-center gap-3 shrink-0">
                        <h1 id={titleId} className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-wide text-white truncate">
                            {title}
                        </h1>
                        <button
                            type="button"
                            onClick={() => void closeTopLayer(dialogRef.current)}
                            aria-label="Cerrar ventana"
                            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/15 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0 transition-all active:scale-90"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className={hideHeader ? 'overflow-y-auto' : 'p-4 sm:p-6 overflow-y-auto'}>{children}</div>
            </div>
        </dialog>
    );
};
