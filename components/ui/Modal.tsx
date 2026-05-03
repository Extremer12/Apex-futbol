import React from 'react';

interface ModalProps {
    children: React.ReactNode;
    title: string;
    onClose: () => void;
    isOpen?: boolean;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ children, title, onClose, isOpen = true, maxWidth = 'max-w-md' }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className={`bg-slate-900 rounded-xl shadow-2xl w-full ${maxWidth} border border-slate-700`} onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-sky-400">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
};
