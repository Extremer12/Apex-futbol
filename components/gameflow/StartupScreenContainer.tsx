import React from 'react';

export const StartupScreenContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-5" style={{ background: 'var(--apex-dark)' }}>
        <div className="w-full max-w-md apex-card p-8">
            {children}
        </div>
    </div>
);
