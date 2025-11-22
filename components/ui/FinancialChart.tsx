import React from 'react';
import { formatCurrency } from '../../utils';

export const FinancialChart: React.FC<{ history: number[] }> = ({ history }) => {
    if (history.length < 2) return null;
    const width = 100;
    const height = 40;
    const data = history.slice(-12);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min === 0 ? 1 : max - min;
    
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
    
    return (
         <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-400 mb-2">Tendencia del Balance (Últimas 12 semanas)</h4>
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                 <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/>
                        </linearGradient>
                    </defs>
                    <polyline fill="url(#chartGradient)" stroke="#0ea5e9" strokeWidth="1.5" points={`0,${height} ${points} ${width},${height}`} />
                </svg>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{formatCurrency(min)}</span>
                <span>{formatCurrency(max)}</span>
            </div>
        </div>
    );
};
