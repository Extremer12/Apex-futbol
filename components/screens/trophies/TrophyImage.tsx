import React, { useState, useEffect } from 'react';
import { resourceManager } from '../../../services/resources/ResourceManager';
import { ResourceFallback } from '../../../services/resources/ResourceFallback';
import { usePacksVersion } from '../../../data/teams/helpers';

interface TrophyImageProps {
    competitionId: string;
    name?: string;
    className?: string;
    alt?: string;
    showPedestal?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
};

export const TrophyImage: React.FC<TrophyImageProps> = ({
    competitionId,
    name,
    className = '',
    alt,
    showPedestal = false,
    size = 'md'
}) => {
    const packsVersion = usePacksVersion();
    const fallbackSvg = React.useMemo(() => {
        return ResourceFallback.trophy(name || competitionId);
    }, [competitionId, name]);

    const initialUrl = React.useMemo(() => {
        try {
            const resolved = resourceManager.trophy(competitionId, name);
            return resolved || fallbackSvg;
        } catch {
            return fallbackSvg;
        }
    }, [competitionId, name, fallbackSvg, packsVersion]);

    const [imgSrc, setImgSrc] = useState<string>(initialUrl);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        try {
            const resolved = resourceManager.trophy(competitionId, name);
            setImgSrc(resolved || fallbackSvg);
            setHasError(false);
        } catch {
            setImgSrc(fallbackSvg);
            setHasError(true);
        }
    }, [competitionId, name, fallbackSvg, packsVersion]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSvg);
        }
    };

    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

    return (
        <div className={`relative flex flex-col items-center justify-center shrink-0 group ${className}`}>
            {/* Ambient lighting halo */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-amber-400/5 to-transparent rounded-full blur-md opacity-40 group-hover:opacity-75 transition-opacity pointer-events-none" />

            {/* Trophy Artwork */}
            <img
                src={imgSrc}
                alt={alt || name || competitionId}
                onError={handleError}
                className={`${sizeClass} object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] relative z-10 transition-transform duration-300 group-hover:scale-105`}
                loading="lazy"
            />

            {/* Optional 3D Display Pedestal */}
            {showPedestal && (
                <div className="w-full flex flex-col items-center -mt-1 relative z-0">
                    <div className="w-3/4 h-1.5 bg-gradient-to-r from-amber-500/30 via-yellow-300/60 to-amber-500/30 rounded-full blur-[1px]" />
                    <div className="w-4/5 h-2.5 bg-gradient-to-b from-slate-800 to-slate-950 border-t border-amber-500/40 rounded-b-md shadow-md" />
                </div>
            )}
        </div>
    );
};
