import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    message?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
    fullScreen = false
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`${sizeClasses[size]} relative`}>
                {/* Outer ring */}
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                {/* Spinning gradient ring */}
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-cyan-500 rounded-full animate-spin"></div>
                {/* Inner glow */}
                <div className="absolute inset-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-sm"></div>
            </div>
            {message && (
                <p className="text-slate-300 font-medium animate-pulse">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                {spinner}
            </div>
        );
    }

    return spinner;
};

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
    children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isLoading,
    message = 'Cargando...',
    children
}) => {
    return (
        <div className="relative">
            {children}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <LoadingSpinner size="lg" message={message} />
                </div>
            )}
        </div>
    );
};

export const LoadingDots: React.FC<{ text?: string }> = ({ text = 'Cargando' }) => {
    return (
        <div className="flex items-center gap-2 text-slate-300">
            <span>{text}</span>
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    );
};
