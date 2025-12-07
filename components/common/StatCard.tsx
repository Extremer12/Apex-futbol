import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
    onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendValue,
    variant = 'default',
    onClick
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return 'from-green-900/40 to-emerald-900/40 border-green-500/30 hover:border-green-500/50';
            case 'danger':
                return 'from-red-900/40 to-rose-900/40 border-red-500/30 hover:border-red-500/50';
            case 'warning':
                return 'from-yellow-900/40 to-orange-900/40 border-yellow-500/30 hover:border-yellow-500/50';
            case 'info':
                return 'from-blue-900/40 to-cyan-900/40 border-blue-500/30 hover:border-blue-500/50';
            default:
                return 'from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-slate-600';
        }
    };

    const getTrendIcon = () => {
        if (trend === 'up') {
            return (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            );
        }
        if (trend === 'down') {
            return (
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
            );
        }
        return null;
    };

    return (
        <div
            className={`bg-gradient-to-br ${getVariantStyles()} border-2 rounded-xl p-5 transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''
                }`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                        {title}
                    </h3>
                </div>
                {icon && (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 ml-3">
                        {icon}
                    </div>
                )}
            </div>

            <div className="text-4xl font-bold text-white mb-2">
                {value}
            </div>

            {(subtitle || trend) && (
                <div className="flex items-center gap-2 text-sm">
                    {trend && (
                        <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-400' :
                                trend === 'down' ? 'text-red-400' :
                                    'text-slate-400'
                            }`}>
                            {getTrendIcon()}
                            {trendValue && <span className="font-semibold">{trendValue}</span>}
                        </div>
                    )}
                    {subtitle && (
                        <span className="text-slate-400">{subtitle}</span>
                    )}
                </div>
            )}
        </div>
    );
};
