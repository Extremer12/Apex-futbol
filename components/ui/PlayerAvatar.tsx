import React, { useState, useEffect, useMemo } from 'react';
import { customPacksService } from '../../services/customPacks/packService';

export interface PlayerAvatarProps {
    player?: {
        id?: number | string;
        name: string;
        photo?: string;
        position?: string;
    };
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    primaryColor?: string;
    secondaryColor?: string;
    showBadge?: boolean;
}

/**
 * Procedural SVG silhouette avatar used as instant zero-network fallback
 */
const ProceduralSilhouette: React.FC<{ initials: string; bgColor: string }> = ({ initials, bgColor }) => (
    <div 
        className="w-full h-full flex items-center justify-center relative overflow-hidden select-none"
        style={{ background: bgColor }}
    >
        {/* Subtle jersey shape */}
        <svg 
            className="w-full h-full text-white/15 absolute bottom-0 translate-y-1.5"
            viewBox="0 0 64 64" 
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M32 12c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-16 38c0-8.8 7.2-16 16-16s16 7.2 16 16v4H16v-4z" />
        </svg>
        {/* Crisp Monogram / Initials */}
        <span className="relative z-10 font-black tracking-wider text-white/90 text-xs sm:text-sm drop-shadow">
            {initials}
        </span>
    </div>
);

export const PlayerAvatar: React.FC<PlayerAvatarProps> = React.memo(({
    player,
    className = 'w-10 h-10',
    primaryColor,
}) => {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [, setTick] = useState(0);

    // Subscribe to custom packs updates (e.g. toggle pack or load new pack)
    useEffect(() => {
        return customPacksService.subscribe(() => {
            setHasError(false);
            setIsLoaded(false);
            setTick(t => t + 1);
        });
    }, []);

    // Extract clean initials from player name (e.g. "E. Cavani" -> "EC", "Lionel Messi" -> "LM")
    const initials = useMemo(() => {
        if (!player?.name) return '??';
        const parts = player.name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }, [player?.name]);

    // Background gradient based on primary color or default sleek dark slate
    const fallbackBg = useMemo(() => {
        if (primaryColor && primaryColor.startsWith('#')) {
            return `linear-gradient(135deg, ${primaryColor}dd 0%, #0f172a 100%)`;
        }
        return 'linear-gradient(135deg, #1e293b 0%, #090d16 100%)';
    }, [primaryColor]);

    if (!player) {
        return (
            <div className={`${className} relative flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-slate-800/80 border border-white/10`}>
                <ProceduralSilhouette initials="--" bgColor={fallbackBg} />
            </div>
        );
    }

    const resolvedUrl = customPacksService.resolvePlayerPhoto(player);
    const isCustomOrRealPhoto = resolvedUrl && resolvedUrl !== '/sinrostro.png';

    // If an error occurred or no real photo is resolved, render zero-cost procedural silhouette
    if (hasError || !isCustomOrRealPhoto) {
        return (
            <div className={`${className} relative flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-white/10 shadow-sm transition-all`}>
                <ProceduralSilhouette initials={initials} bgColor={fallbackBg} />
            </div>
        );
    }

    return (
        <div className={`${className} relative flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-white/10 shadow-sm bg-slate-900/60 transition-all`}>
            {/* Background placeholder while image decodes */}
            {!isLoaded && (
                <div className="absolute inset-0 z-0">
                    <ProceduralSilhouette initials={initials} bgColor={fallbackBg} />
                </div>
            )}
            
            <img
                src={resolvedUrl}
                alt={player.name}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                className={`w-full h-full object-cover object-top relative z-10 transition-opacity duration-200 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </div>
    );
});

PlayerAvatar.displayName = 'PlayerAvatar';
export default PlayerAvatar;
