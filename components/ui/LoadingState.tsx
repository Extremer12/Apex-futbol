/**
 * Loading State Component
 * Shows loading indicator during async operations
 */

import React from 'react';
import { LoadingSpinner } from '../icons';

interface LoadingStateProps {
    message?: string;
    fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Cargando...',
    fullScreen = false
}) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-slate-900 border-2 border-sky-500 rounded-xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center gap-4">
                        <LoadingSpinner className="w-12 h-12 text-sky-400" />
                        <p className="text-white font-medium">{message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 gap-4">
            <LoadingSpinner className="w-8 h-8 text-sky-400" />
            <p className="text-slate-400 text-sm">{message}</p>
        </div>
    );
};

/**
 * Inline Loading Spinner
 * Smaller version for buttons and inline use
 */
export const InlineLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

    return (
        <div className={`${sizeClass} border-2 border-white/30 border-t-white rounded-full animate-spin`} />
    );
};
