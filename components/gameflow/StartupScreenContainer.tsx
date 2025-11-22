import React from 'react';

export const StartupScreenContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
     <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800/50">
            {children}
        </div>
    </div>
);
