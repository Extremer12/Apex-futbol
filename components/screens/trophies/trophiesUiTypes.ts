import React from 'react';
import { Trophy, Building2, ArrowRightLeft, Award } from 'lucide-react';
import { AchievementCategory } from '../../../types';

export type TrophyTabType = 'TROPHIES' | 'HISTORY' | 'COMPETITIONS' | 'ACHIEVEMENTS';

export interface CategoryTheme {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgGradient: string;
    border: string;
    badge: string;
    iconColor: string;
    progress: string;
    tag: string;
    glow: string;
}

export const CATEGORY_THEMES: Record<AchievementCategory, CategoryTheme> = {
    trophies: {
        label: 'Títulos',
        icon: Trophy,
        color: 'text-amber-400',
        bgGradient: 'from-amber-950/40 via-[#0F1420]/90 to-[#0A0E17]',
        border: 'border-amber-500/30 hover:border-amber-400/70',
        badge: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        iconColor: 'text-amber-400',
        progress: 'from-amber-500 to-yellow-300',
        tag: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]'
    },
    management: {
        label: 'Gestión',
        icon: Building2,
        color: 'text-cyan-400',
        bgGradient: 'from-cyan-950/40 via-[#0F1420]/90 to-[#0A0E17]',
        border: 'border-cyan-500/30 hover:border-cyan-400/70',
        badge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
        iconColor: 'text-cyan-400',
        progress: 'from-cyan-500 to-blue-400',
        tag: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30',
        glow: 'shadow-[0_0_20px_rgba(6,182,212,0.12)]'
    },
    transfers: {
        label: 'Fichajes',
        icon: ArrowRightLeft,
        color: 'text-emerald-400',
        bgGradient: 'from-emerald-950/40 via-[#0F1420]/90 to-[#0A0E17]',
        border: 'border-emerald-500/30 hover:border-emerald-400/70',
        badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        iconColor: 'text-emerald-400',
        progress: 'from-emerald-500 to-teal-300',
        tag: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.12)]'
    },
    special: {
        label: 'Especiales',
        icon: Award,
        color: 'text-purple-400',
        bgGradient: 'from-purple-950/40 via-[#0F1420]/90 to-[#0A0E17]',
        border: 'border-purple-500/30 hover:border-purple-400/70',
        badge: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
        iconColor: 'text-purple-400',
        progress: 'from-purple-500 to-pink-400',
        tag: 'bg-purple-500/10 text-purple-300 border border-purple-500/30',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.12)]'
    }
};

export const COUNTRY_FLAGS: Record<string, string> = {
    'Argentina': '🇦🇷',
    'Brasil': '🇧🇷',
    'Chile': '🇨🇱',
    'Colombia': '🇨🇴',
    'Paraguay': '🇵🇾',
    'México': '🇲🇽',
    'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'España': '🇪🇸',
    'Alemania': '🇩🇪',
    'Italia': '🇮🇹',
    'Francia': '🇫🇷',
};

export const REGION_TABS = [
    { id: 'ALL', label: 'Todos' },
    { id: 'SUDAMERICA', label: '🌎 Sudamérica & México' },
    { id: 'EUROPA', label: '🌍 Europa' },
    { id: 'INT', label: '🏆 Internacionales' },
];
