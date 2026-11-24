import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    children: React.ReactNode;
    title: string;
    onClose: () => void;
    isOpen?: boolean;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ children, title, onClose, isOpen = true, maxWidth = 'max-w-lg' }) => {
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[70] p-3 sm:p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`bg-[#0B101B] rounded-3xl shadow-2xl w-full ${maxWidth} border border-white/15 max-h-[92dvh] flex flex-col overflow-hidden`}
                onClick={e => e.stopPropagation()}
            >
                <div className="px-5 py-4 border-b border-white/10 bg-[#080C15] flex justify-between items-center gap-3 shrink-0">
                    <h2 className="text-base sm:text-lg font-black text-white truncate tracking-tight">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar ficha"
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer shrink-0 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-4 sm:p-5 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};
