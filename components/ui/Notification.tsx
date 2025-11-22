import React from 'react';
import { InfoIcon } from '../icons';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    return (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border ${type === 'success' ? 'bg-slate-900 border-green-500/50 text-green-400' : 'bg-slate-900 border-red-500/50 text-red-400'}`}>
                <div className={type === 'success' ? 'text-green-500' : 'text-red-500'}>
                    {type === 'success' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-sm">{type === 'success' ? 'Éxito' : 'Error'}</h4>
                    <p className="text-xs text-slate-300">{message}</p>
                </div>
                <button onClick={onClose} className="ml-2 text-slate-500 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};