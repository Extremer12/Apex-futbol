import React from 'react';
import { Shield, Trophy, User, Flag, Layers, FolderArchive } from 'lucide-react';
import { PackCategory } from '../../../services/resources/ResourceTypes';
import { ResourceFallback } from '../../../services/resources/ResourceFallback';

export interface PackAccentStyle {
    bar: string;
    tint: string;
    badge: string;
    gradient: string;
    text: string;
}

export const PACK_ACCENTS: Record<string, PackAccentStyle> = {
    cyan: {
        bar: 'bg-cyan-400',
        tint: 'bg-cyan-500/15 border-cyan-500/30',
        badge: 'bg-cyan-500/15 text-cyan-300',
        gradient: 'from-cyan-500/15 via-transparent to-transparent',
        text: 'text-cyan-300',
    },
    indigo: {
        bar: 'bg-indigo-500',
        tint: 'bg-indigo-500/15 border-indigo-500/30',
        badge: 'bg-indigo-500/15 text-indigo-300',
        gradient: 'from-indigo-500/15 via-transparent to-transparent',
        text: 'text-indigo-300',
    },
    amber: {
        bar: 'bg-amber-400',
        tint: 'bg-amber-500/15 border-amber-500/30',
        badge: 'bg-amber-500/15 text-amber-300',
        gradient: 'from-amber-500/15 via-transparent to-transparent',
        text: 'text-amber-300',
    },
    sky: {
        bar: 'bg-sky-400',
        tint: 'bg-sky-500/15 border-sky-500/30',
        badge: 'bg-sky-500/15 text-sky-300',
        gradient: 'from-sky-500/15 via-transparent to-transparent',
        text: 'text-sky-300',
    },
    orange: {
        bar: 'bg-orange-500',
        tint: 'bg-orange-500/15 border-orange-500/30',
        badge: 'bg-orange-500/15 text-orange-300',
        gradient: 'from-orange-500/15 via-transparent to-transparent',
        text: 'text-orange-300',
    },
    purple: {
        bar: 'bg-purple-500',
        tint: 'bg-purple-500/15 border-purple-500/30',
        badge: 'bg-purple-500/15 text-purple-300',
        gradient: 'from-purple-500/15 via-transparent to-transparent',
        text: 'text-purple-300',
    },
    emerald: {
        bar: 'bg-emerald-400',
        tint: 'bg-emerald-500/15 border-emerald-500/30',
        badge: 'bg-emerald-500/15 text-emerald-300',
        gradient: 'from-emerald-500/15 via-transparent to-transparent',
        text: 'text-emerald-300',
    },
};

export const getPackAccent = (accentColor?: string, category?: PackCategory): PackAccentStyle => {
    if (accentColor && PACK_ACCENTS[accentColor]) {
        return PACK_ACCENTS[accentColor];
    }
    switch (category) {
        case 'team-logos': return PACK_ACCENTS.cyan;
        case 'league-logos':
        case 'competition-logos': return PACK_ACCENTS.amber;
        case 'player-faces': return PACK_ACCENTS.sky;
        case 'trophies': return PACK_ACCENTS.orange;
        case 'flags': return PACK_ACCENTS.purple;
        default: return PACK_ACCENTS.emerald;
    }
};

export const getPackCategoryLabel = (category: PackCategory): string => {
    switch (category) {
        case 'team-logos': return 'Escudos';
        case 'league-logos':
        case 'competition-logos': return 'Ligas y Copas';
        case 'player-faces': return 'Rostros HD';
        case 'trophies': return 'Trofeos';
        case 'flags': return 'Banderas';
        case 'all-in-one': return 'Completo';
        default: return 'Personalizado';
    }
};

const SHIELD_SAMPLES = {
    america: [
        { name: 'BJ', p: '#003B7A', s: '#F7C600' },
        { name: 'RP', p: '#FFFFFF', s: '#D50032' },
        { name: 'FLA', p: '#C8102E', s: '#111827' },
        { name: 'PAL', p: '#006437', s: '#E2E8F0' },
    ],
    europa: [
        { name: 'RM', p: '#F8FAFC', s: '#D4AF37' },
        { name: 'FCB', p: '#004D98', s: '#A50044' },
        { name: 'MCI', p: '#6CABDD', s: '#1C2C5B' },
        { name: 'BAY', p: '#DC052D', s: '#0066B2' },
    ],
};

/**
 * Colorful procedural artwork thumbnail for pack cards & detail sheets.
 * Uses pure local SVG vectors so Base Mode stays 100% clean without external requests.
 */
export const PackArtwork: React.FC<{
    packId: string;
    category: PackCategory;
    accent: PackAccentStyle;
    size?: 'sm' | 'md';
}> = React.memo(({ packId, category, accent, size = 'md' }) => {
    const dim = size === 'sm' ? 'w-10 h-10 p-1' : 'w-11 h-11 p-1.5';

    if (packId === 'south-america-logos' || packId === 'europe-logos') {
        const samples = packId === 'south-america-logos' ? SHIELD_SAMPLES.america : SHIELD_SAMPLES.europa;
        return (
            <div className={`${dim} rounded-xl border flex items-center justify-center shrink-0 ${accent.tint}`}>
                <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                    {samples.map((s) => (
                        <img
                            key={s.name}
                            src={ResourceFallback.teamLogo({ name: s.name, primaryColor: s.p, secondaryColor: s.s })}
                            alt=""
                            className="w-full h-full object-contain"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (category === 'trophies') {
        return (
            <div className={`${dim} rounded-xl border flex items-center justify-center shrink-0 ${accent.tint}`}>
                <img
                    src={ResourceFallback.trophy('champions')}
                    alt=""
                    className="w-full h-full object-contain"
                />
            </div>
        );
    }

    if (category === 'league-logos' || category === 'competition-logos') {
        return (
            <div className={`${dim} rounded-xl border flex items-center justify-center shrink-0 ${accent.tint}`}>
                <img
                    src={ResourceFallback.competitionBadge('PRO')}
                    alt=""
                    className="w-full h-full object-contain"
                />
            </div>
        );
    }

    if (category === 'player-faces') {
        return (
            <div className={`${dim} rounded-xl border flex items-center justify-center shrink-0 ${accent.tint}`}>
                <img
                    src={ResourceFallback.playerFace({ name: 'HD', position: 'PRO' })}
                    alt=""
                    className="w-full h-full object-contain rounded-lg"
                />
            </div>
        );
    }

    if (category === 'flags') {
        return (
            <div className={`${dim} rounded-xl border flex items-center justify-center shrink-0 ${accent.tint}`}>
                <Flag className={`w-5 h-5 ${accent.text}`} />
            </div>
        );
    }

    if (packId.startsWith('local-')) {
        return (
            <div className={`${dim} rounded-xl border flex items-center justify-center shrink-0 ${accent.tint}`}>
                <FolderArchive className={`w-5 h-5 ${accent.text}`} />
            </div>
        );
    }

    const Icon =
        category === 'team-logos' ? Shield :
        category === 'trophies' ? Trophy :
        category === 'player-faces' ? User :
        Layers;

    return (
        <div className={`${dim} rounded-xl border flex items-center justify-center shrink-0 ${accent.tint}`}>
            <Icon className={`w-5 h-5 ${accent.text}`} />
        </div>
    );
});
