import React from 'react';

export const TeamForm: React.FC<{ form: ('W' | 'D' | 'L')[] }> = ({ form }) => {
    const colorMap = { W: 'bg-green-500 border-green-400', D: 'bg-slate-500 border-slate-400', L: 'bg-red-500 border-red-400' };
    return (
        <div className="flex items-center justify-center space-x-1.5">
            {form.slice(0, 5).map((result, index) => (
                <div key={index} title={result === 'W' ? 'Victoria' : result === 'D' ? 'Empate' : 'Derrota'} className={`w-3 h-3 rounded-full border ${colorMap[result]}`}></div>
            ))}
        </div>
    );
};
