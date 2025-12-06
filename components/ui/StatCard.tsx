/**
 * Stat Card Component
 * Reusable component for displaying statistics consistently
 */

import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'sky' | 'green' | 'red' | 'yellow' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = 'sky'
}) => {
    const getColorClasses = () => {
        switch (color) {
            case 'green':
                return {
                    bg: 'from-green-900/40 to-emerald-900/40',
                    border: 'border-green-500/30 hover:border-green-500/50',
                    icon: 'from-green-600 to-emerald-600',
                    shadow: 'hover:shadow-green-500/20'
                };
            case 'red':
                return {
                    bg: 'from-red-900/40 to-rose-900/40',
                    border: 'border-red-500/30 hover:border-red-500/50',
                    icon: 'from-red-600 to-rose-600',
                    shadow: 'hover:shadow-red-500/20'
                };
            case 'yellow':
                return {
                    bg: 'from-yellow-900/40 to-amber-900/40',
                    border: 'border-yellow-500/30 hover:border-yellow-500/50',
                    icon: 'from-yellow-600 to-amber-600',
                    shadow: 'hover:shadow-yellow-500/20'
                };
            case 'purple':
                return {
                    bg: 'from-purple-900/40 to-violet-900/40',
                    border: 'border-purple-500/30 hover:border-purple-500/50',
                    icon: 'from-purple-600 to-violet-600',
                    shadow: 'hover:shadow-purple-500/20'
                };
            case 'sky':
            default:
                return {
                    bg: 'from-sky-900/40 to-blue-900/40',
                    border: 'border-sky-500/30 hover:border-sky-500/50',
                    icon: 'from-sky-600 to-blue-600',
                    shadow: 'hover:shadow-sky-500/20'
                };
        }
    };

    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend === 'up') return <span className="text-green-400">↑</span>;
        if (trend === 'down') return <span className="text-red-400">↓</span>;
        return <span className="text-slate-400">→</span>;
    };

    const classes = getColorClasses();

    return (
        <div className={`bg-gradient-to-br ${classes.bg} border-2 ${classes.border} rounded-xl p-5 hover:scale-105 transition-all duration-300 shadow-lg ${classes.shadow}`}>
            {/* Header with icon */}
            {icon && (
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${classes.icon} rounded-lg flex items-center justify-center shadow-lg`}>
                        {icon}
                    </div>
                    <span className="text-slate-300 text-sm font-semibold">{title}</span>
                </div>
            )}

            {/* Value */}
            <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-white">
                    {value}
                </div>
                {getTrendIcon()}
            </div>

            {/* Subtitle */}
            {subtitle && (
                <div className="text-xs text-slate-400 mt-2">
                    {subtitle}
                </div>
            )}
        </div>
    );
};
