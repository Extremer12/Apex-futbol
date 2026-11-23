import React from 'react';
import {
    AlertTriangle,
    ArrowRightLeft,
    Award,
    Building2,
    Flame,
    Newspaper,
    Trophy
} from 'lucide-react';
import { NewsCategory, NewsMatchMeta } from '../../../types';

export interface NewsThemeStyle {
    label: string;
    pillClass: string;
    borderClass: string;
    accentBarClass: string;
    heroGlow: string;
    accentHex: string;
    icon: React.ComponentType<{ className?: string }>;
}

export function getNewsCategoryTheme(category: NewsCategory, matchMeta?: NewsMatchMeta): NewsThemeStyle {
    if (category === 'match') {
        if (matchMeta?.isUserWin) {
            return {
                label: 'Crónica · Victoria',
                pillClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
                borderClass: 'border-emerald-500/35',
                accentBarClass: 'bg-emerald-400',
                heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.24), transparent 72%)',
                accentHex: '#10B981',
                icon: Trophy,
            };
        }
        if (matchMeta?.isUserLoss) {
            return {
                label: 'Crónica · Derrota',
                pillClass: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
                borderClass: 'border-rose-500/35',
                accentBarClass: 'bg-rose-400',
                heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(244, 63, 94, 0.22), transparent 72%)',
                accentHex: '#F43F5E',
                icon: Flame,
            };
        }
        return {
            label: 'Crónica del Partido',
            pillClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35',
            borderClass: 'border-cyan-500/30',
            accentBarClass: 'bg-cyan-400',
            heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6, 182, 212, 0.22), transparent 72%)',
            accentHex: '#06B6D4',
            icon: Trophy,
        };
    }

    switch (category) {
        case 'transfer':
            return {
                label: 'Mercado de Pases',
                pillClass: 'bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border-[var(--apex-gold)]/40',
                borderClass: 'border-[var(--apex-gold)]/35',
                accentBarClass: 'bg-[var(--apex-gold)]',
                heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200, 168, 78, 0.24), transparent 72%)',
                accentHex: '#C8A84E',
                icon: ArrowRightLeft,
            };
        case 'achievement':
            return {
                label: 'Hito y Figura',
                pillClass: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
                borderClass: 'border-amber-500/35',
                accentBarClass: 'bg-amber-400',
                heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245, 158, 11, 0.25), transparent 72%)',
                accentHex: '#F59E0B',
                icon: Award,
            };
        case 'warning':
            return {
                label: 'Alerta del Club',
                pillClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
                borderClass: 'border-rose-500/35',
                accentBarClass: 'bg-rose-500',
                heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(239, 68, 68, 0.22), transparent 72%)',
                accentHex: '#EF4444',
                icon: AlertTriangle,
            };
        case 'institutional':
            return {
                label: 'Institucional',
                pillClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/35',
                borderClass: 'border-indigo-500/30',
                accentBarClass: 'bg-indigo-400',
                heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99, 102, 241, 0.22), transparent 72%)',
                accentHex: '#6366F1',
                icon: Building2,
            };
        default:
            return {
                label: 'Actualidad',
                pillClass: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
                borderClass: 'border-sky-500/25',
                accentBarClass: 'bg-sky-400',
                heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(56, 189, 248, 0.18), transparent 72%)',
                accentHex: '#38BDF8',
                icon: Newspaper,
            };
    }
}
