import React from 'react';
import { Modal } from '../ui/Modal';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'danger' | 'primary' | 'success';
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    confirmVariant = 'primary',
    onConfirm,
    onCancel
}) => {
    const getConfirmButtonStyles = () => {
        switch (confirmVariant) {
            case 'danger':
                return 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-red-400';
            case 'success':
                return 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-green-400';
            case 'primary':
                return 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-blue-400';
        }
    };

    return (
        <Modal isOpen={isOpen} title={title} onClose={onCancel} maxWidth="max-w-md" hideHeader>
            <div className="p-6">
                <div className="flex justify-center mb-4">
                    <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            confirmVariant === 'danger'
                                ? 'bg-red-900/40 border-2 border-red-500'
                                : confirmVariant === 'success'
                                ? 'bg-green-900/40 border-2 border-green-500'
                                : 'bg-blue-900/40 border-2 border-blue-500'
                        }`}
                    >
                        {confirmVariant === 'danger' ? (
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : confirmVariant === 'success' ? (
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-3">
                    {title}
                </h1>

                <p className="text-slate-300 text-center mb-6">
                    {message}
                </p>

                <div className="flex gap-3">
                    <button
                        type="button"
                        autoFocus
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-200 border-2 border-slate-600 cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-3 text-white rounded-lg font-semibold transition-all duration-200 border-2 cursor-pointer ${getConfirmButtonStyles()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
