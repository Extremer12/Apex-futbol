/**
 * Confirmation Modal Component
 * Prevents accidental destructive actions
 */

import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    type = 'warning'
}) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    bg: 'from-red-900/90 to-red-800/90',
                    border: 'border-red-500',
                    button: 'bg-red-600 hover:bg-red-500'
                };
            case 'warning':
                return {
                    bg: 'from-yellow-900/90 to-yellow-800/90',
                    border: 'border-yellow-500',
                    button: 'bg-yellow-600 hover:bg-yellow-500'
                };
            case 'info':
            default:
                return {
                    bg: 'from-sky-900/90 to-sky-800/90',
                    border: 'border-sky-500',
                    button: 'bg-sky-600 hover:bg-sky-500'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className={`relative bg-gradient-to-br ${styles.bg} border-2 ${styles.border} rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in`}>
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full ${styles.border} border-2 flex items-center justify-center`}>
                        <span className="text-3xl">
                            {type === 'danger' ? '⚠️' : type === 'warning' ? '❗' : 'ℹ️'}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white text-center mb-3">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-slate-300 text-center mb-6">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 ${styles.button} text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
